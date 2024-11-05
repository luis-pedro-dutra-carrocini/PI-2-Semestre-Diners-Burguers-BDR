// Requerindo o arquivo que faz as consultas no BD relacionadas ao Usuário
const userModel = require("../models/userModel");

// Requerindo bibliotecas utilizadas
const bcrypt = require("bcrypt");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Requerindo arquivo de conexão com o BD
const conexao = require("../bd/conexao.js");

// Função para verificar os emails inseridos
exports.verificarEmail = (req, res) => {
  const { email } = req.body;

  userModel.emailExiste(email, (err, exists) => {
    if (err) {
      console.error("Erro ao obter os dados do Usuário:", err);
      return res
        .status(500)
        .json({ message: "Erro ao obter os dados do Usuário." });
    }
    return res.status(200).json({ exists });
  });
};

// Função para cadastrar os clientes
exports.cadastrarUsuario = async (req, res) => {
  const { nome, email, telefone, senha_cadastro } = req.body;
  const nivel = 'cliente';
  const status = 'ativo';
  const foto = req.file ? req.file.filename : 'usuario-n.png';

  try {
      // Verificação se email já não está cadastrado
      const verificarEmailResponse = await axios.post('http://localhost:3000/verificar-email', {}, {
          headers: {
              Cookie: req.headers.cookie // Passando os cookies da sessão
           }
      });

      const emailCadastrado = verificarEmailResponse.data.exists;

      if (emailCadastrado) {
          console.log('Email já cadastrado');
          return res.status(401).json({ message: 'Email já cadastrado!' });
      }

      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha_cadastro, saltRounds);

      const cadastrarUsu = 'INSERT INTO Usuarios (Nome_Usuario, Email_Usuario, Senha_Usuario, Foto_Usuario, Nivel_Usuario, Status_Usuario, Telefone_Usuario) VALUES (?,?,?,?,?,?,?);';

      const inserirUsuario = await new Promise((resolve, reject) => {
          conexao.query(cadastrarUsu, [nome, email, senhaHash, foto, nivel, status, telefone], (err, results) => {
            if (err) {
                console.error('Erro no Cadastro do Usuário:', err);
                return res.status(500).json({ message: 'Erro no Cadastro do Usuário.' });
            }
            resolve(results.insertId);
          });
      });

    const ID_Cliente = inserirUsuario;

    // Iniciando a sessão
    req.session.cliente = {
      id: ID_Cliente,
      nome: nome,
      email: email,
      nivel: nivel,
      status: status,
    };

    return res.status(200).json({ cadastro: true });
  } catch (error) {
    console.error("Erro no Cadastro do Usuário:", error);
    return res.status(500).json({ message: "Erro no Cadastro do Usuário." });
  }
};

// Função para Validar o Login
exports.verificarLogin = async (req, res) => {
  const { email, senha } = req.body;

  if (!req.session.tentativas) req.session.tentativas = 0;
  if (!req.session.bloqueio) req.session.bloqueio = null;

  const limiteTentativas = 5;
  const tempoBloqueio = 30 * 60 * 1000;
  const agora = Date.now();

  if (req.session.bloqueio && agora < req.session.bloqueio) {
    const tempoRestante = Math.ceil((req.session.bloqueio - agora) / 1000 / 60);
    return res.status(200).json({
      validacao: false,
      tentativas: "bloqueado",
      tempo: tempoRestante,
    });
  }

  if (req.session.tentativas >= limiteTentativas - 1) {
    req.session.bloqueio = agora + tempoBloqueio;
    req.session.tentativas = 0;
    return res
      .status(200)
      .json({ validacao: false, tentativas: "bloqueado", tempo: 30 });
  }

  conexao.query(
    "SELECT * FROM Usuarios WHERE Email_Usuario = ?;",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Erro ao obter os dados do Usuário:", err);
        return res
          .status(500)
          .json({ message: "Erro ao obter os dados do Usuário." });
      }

      if (results.length > 0) {
        const senha_bd = results[0].Senha_Usuario;
        const ID_Cliente = results[0].ID_Usuario;
        const email = results[0].Email_Usuario;
        const nome = results[0].Nome_Usuario;
        const nivel = results[0].Nivel_Usuario;
        const status = results[0].Status_Usuario;
        const resultado = await bcrypt.compare(senha, senha_bd);

        if (resultado === true) {
          req.session.tentativas = 0;
          req.session.cliente = {
            id: ID_Cliente,
            nome: nome,
            email: email,
            nivel: nivel,
            status: status,
            senha: senha_bd
          };
          return res.status(200).json({ validacao: true });
        } else {
          req.session.tentativas += 1;
          return res.status(200).json({
            validacao: false,
            tentativas:
              req.session.tentativas >= limiteTentativas - 1
                ? "limite"
                : undefined,
          });
        }
      } else {
        return res.status(200).json({ validacao: 0 });
      }
    }
  );
};

// Função para verificar se a sessão foi iniciada
exports.verificarSessao = async (req, res) => {
  if (req.session.cliente) {
    console.log("Sessão foi Iniciada");

    try {
      // Busca os dados do usuário pelo ID da sessão
      const results = await userModel.buscarUsuarioPorID(
        req.session.cliente.id
      );
      if (results.length > 0) {
        console.log("Cliente está cadastrado");
        return res.status(200).json({
          sessaoIniciada: true,
          user: {
            id: results[0].ID_Usuario,
            nome: results[0].Nome_Usuario,
            email: results[0].Email_Usuario,
            foto: results[0].Foto_Usuario,
            telefone: results[0].Telefone_Usuario,
            senha: results[0].Senha_Usuario
          },
        });
      } else {
        console.log("Cliente não cadastrado!");
        return res.status(401).json({ message: "Cliente não cadastrado!" });
      }
    } catch (err) {
      console.error("Erro ao buscar Usuário para validação:", err);
      return res
        .status(500)
        .json({ message: "Erro ao buscar Usuário para validação." });
    }
  } else {
    console.log("Sessão não Iniciada");
    return res.status(200).json({ sessaoIniciada: false });
  }
};

// Função para buscar os dados do cliente
exports.buscarDadosCliente = async (req, res) => {
  console.log("Buscando dados do Cliente");

  try {
    const verificarSessaoResponse = await axios.post(
      "http://localhost:3000/verificar-sessao",
      {},
      {
        headers: {
          Cookie: req.headers.cookie,
        },
      }
    );

    const sessaoIniciada = verificarSessaoResponse.data.sessaoIniciada;

    if (!sessaoIniciada) {
      console.log("Sessão não Iniciada");
      return res.status(401).json({ message: "Sessão não iniciada!" });
    }

    const ID_Cliente = verificarSessaoResponse.data.clienteID;

    const results = await userModel.buscarUsuarioPorID(ID_Cliente);

    if (results.length > 0) {
      req.session.cliente.senha = results[0].Senha_Usuario;

      return res.status(200).json({
        existe: true,
        nome: results[0].Nome_Usuario,
        email: results[0].Email_Usuario,
        foto: results[0].Foto_Usuario,
        telefone: results[0].Telefone_Usuario,
      });
    } else {
      console.log("Cliente não cadastrado!");
      return res.status(401).json({ message: "Cliente não cadastrado!" });
    }
  } catch (error) {
    console.error(
      "Erro ao verificar a sessão ou buscar os dados do Usuário:",
      error
    );
    return res.status(500).json({
      message: "Erro ao verificar a sessão ou buscar os dados do Usuário.",
    });
  }
};

// Função para realizar logout do usuário
exports.sairConta = (req, res) => {
  if (!req.session.cliente) {
    console.log("Sessão não Iniciada");
    return res.status(200).json({ resultado: true });
  }

  req.session.cliente.senha = "";

  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao encerrar a Sessão:", err);
      return res.status(500).json({ message: "Erro ao encerrar a Sessão." });
    }

    console.log("Sessão Encerrada");
    res.clearCookie("connect.sid");
    return res.status(200).json({ resultado: true });
  });
};

// Função para comparar a senha do BD armazenada na variável senha_cadastrada e a senha inserida pelo usuário
exports.compararSenhas = async (req, res) => {
  if (!req.session.cliente) {
    console.log("Sessão não Iniciada");
    return res.status(200).json({ message: "Sessão não Iniciada!" });
  }

  const { senha_atual } = req.body;

  try {
    const resultado = await bcrypt.compare(
      senha_atual,
      req.session.cliente.senha
    );
    console.log("Senhas Iguais: ", resultado);
    return res.status(200).json({ resultado });
  } catch (error) {
    console.error("Erro ao comparar senhas:", error);
    return res.status(500).json({ message: "Erro ao comparar senhas." });
  }
};

// Função para alterar os dados do cliente
exports.alterarDadosUsuario = async (req, res) => {
  // Obtendo os dados do formulário
  const {
    nome,
    email,
    telefone,
    senha_nova,
    senha_atual
  } = req.body;

  // Obtendo o ID e Senha Cadastrada pela sessão
  const ID_Cliente = req.session.cliente.id;
  const senha_cadastrada = req.session.cliente.senha;

  // Definindo a imagem como nula, pois não haverá interações de imagens com BD nesse semestre
  const img_removida = 'nula';

  // Verificando se será necessário alterar a senha
  const alterar_senha = senha_nova !== ''

  try {

    // Verificando se as senha são iguais
    const resultado = await bcrypt.compare(
      senha_atual,
      senha_cadastrada
    );

    // Validando resultado
    if (!resultado) {
      console.log('Senha Inválida.')
      return res.status(404).json({ message: "Senha Inválida!" });
    }

    // Verificando se o usuário está cadastrado
    const user = await userModel.buscarUsuarioPorID(ID_Cliente);
    if (!user || user.length === 0) {
      console.log("Usuário não encontrado.");
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    console.log(email);
    console.log(req.session.cliente.email);
    // Verificando se o novo email já está em uso
    if (email !== req.session.cliente.email){
      const emailCad = await userModel.novoEmailCadastrado(email);
      if (emailCad.length != 0) {
        console.log("Email já está em uso.");
        return res.status(404).json({ message: "Email já está em uso." });
      }
    }

    // Definindo variavel padrão
    const userData = user[0];
    let senhaHash = '';

    console.log(alterar_senha);

    // verificando se a senha será alterada
    if (alterar_senha == true){
      const saltRounds = 10;
      senhaHash = await bcrypt.hash(senha_nova, saltRounds);
    }else{
      senhaHash = senha_cadastrada;
    }

    // Mantendo o valor da foto cadastrada
    let foto = req.file ? req.file.filename : userData.Foto_Usuario;

    // Mantendo ou removendo a imagem na pasta de usuários
    if (img_removida === "nula") {
      console.log("Foto Nula");
      foto = "usuario-n.png";
      if (userData.Foto_Usuario !== "usuario-n.png") {
        const oldImagePath = path.join(
          __dirname,
          "../public/imagens/usuarios",
          userData.Foto_Usuario
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (
      req.file &&
      userData.Foto_Usuario !== "usuario-n.png" &&
      userData.Foto_Usuario
    ) {
      const oldImagePath = path.join(
        __dirname,
        "../public/imagens/usuarios",
        userData.Foto_Usuario
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Alterando os dados
    const alterarDados = await userModel.alterandoDadosUsuario(
      ID_Cliente,
      nome,
      senhaHash,
      email,
      foto,
      telefone
    );

    if (!alterarDados){
      console.log('rro ao alterar os dados.')
      return res.status(404).json({ message: "Erro ao alterar os dados." })
    }else{
      return res.status(200).json({ message: "Dados Alterados." });
    }

  } catch (err) {
    console.error("Erro ao alterar os dados do Usuário:", err);
    res.status(500).json({ message: "Erro ao alterar os dados do Usuário." });
  }
};

// Função para excluir uma conta do usuário
exports.excluirConta = async (req, res) => {
  const ID_Cliente = req.session.cliente.id;
  const { senha_atual } = req.body;

  try {
    const user = await userModel.buscarFotoUsuario(ID_Cliente);
    if (!user) {
      console.log('Usuário não encontrado');
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const resultado = await bcrypt.compare(
      senha_atual,
      req.session.cliente.senha
    );
    if (!resultado) {
      return res.status(404).json({ message: "Senha Inválida!" });
    }

    if (user.Foto_Usuario != "usuario-n.png") {
      const oldImagePath = path.join(
        __dirname,
        "../public/imagens/usuarios",
        user.Foto_Usuario
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log("Imagem antiga excluída com sucesso");
      }
    }

    await userModel.excluirUsuario(ID_Cliente);

    res.status(200).json({ excluiu: true });
  } catch (err) {
    console.error("Erro ao excluir a conta do usuário:", err);
    res.status(500).json({ message: "Erro ao excluir a conta." });
  }
};

// Função para buscar as avaliações feitas pelos usuários
exports.buscarAvaliacoes = async (req, res) => {
  const { tipoBusca } = req.body;

  if (tipoBusca === "3 Melhores") {
    try {
      const avaliacoes = await userModel.buscarMelhoresAvaliacoes();

      if (avaliacoes.length >= 3) {
        return res.status(200).json(avaliacoes);
      } else {
        console.log("Nenhuma avaliação encontrada.");
        return res
          .status(404)
          .json({ message: "Nenhuma avaliação encontrada." });
      }
    } catch (error) {
      console.error("Erro ao processar a busca de avaliações:", error);
      return res.status(500).json({ message: "Erro ao buscar as avaliações." });
    }
  }
};
