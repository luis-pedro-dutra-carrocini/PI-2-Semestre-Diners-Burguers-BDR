// ---- Requizições de Bibliotecas ----
// Requerindo o express
const express = require('express');

// Requerindo o arquivo conexao com seus dados
const conexao = require('./conexao');

// Requerindo o bcrypt
const bcrypt = require('bcrypt');

// Requerindo Express-Session para o controle de sessões do navegador
const session = require('express-session');

// Requerindo multer e path (upload de arquivos no servidor)
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { error } = require('console');

// ---- Fim ----

// Configurações de Funções

const app = express();
app.use(express.json());

// Configurando Sessãoes
app.use(session({
    secret: 'sua-chave-secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use secure: true se estiver usando HTTPS
}));


// Configuração do multer para armazenar as imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/imagens/usuarios/'); // Pasta onde as imagens serão armazenadas
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nome único para cada arquivo
    }
});

// Função Upload
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos'));
        }
    }
});

// Servir arquivos estáticos (HTML, JS, CSS)
app.use(express.static('public'));

// Servindo a pasta de imagens
app.use('/public/imagens/usuarios', express.static('public/imagens/usuarios'));


// Função para verificar se o email já está cadastrado no banco de dados (Página Cadastrar, Login e Alterar Dados Usuário)
app.post('/verificar-email', (req, res) => {
    const { email } = req.body;

    conexao.query('SELECT Email_Usuario FROM Usuarios WHERE Email_Usuario = ?;', [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        }

        if (results.length > 0) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    });
});


// Função para cadastrar o Usuário com upload de imagem (Página Cadastrar Usuário)
app.post('/cadastrar-usuario', upload.single('foto_usuario'), async (req, res) => {
    
    const { nome, email, telefone, celular, cep, cidade, uf, bairro, rua, numero, complemento, senha_cadastro } = req.body;

    const nivel = 'cliente';
    const status = 'ativo';
    
    const foto = req.file ? req.file.filename : null;

    try {

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha_cadastro, saltRounds);

        const cadastrarUsu = 'INSERT INTO Usuarios (Nome_Usuario, Email_Usuario, Senha_Usuario, Foto_Usuario, Nivel_Usuario, Status_Usuario, End_CEP, End_Cidade, End_UF, End_Bairro, End_Rua, End_Numero, End_Complemento) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);';

        const inserirUsuario = await new Promise((resolve, reject) => {
            conexao.query(cadastrarUsu, [nome, email, senhaHash, foto, nivel, status, cep, cidade, uf, bairro, rua, numero, complemento], (err, results) => {
                if (err) {
                    throw new Error('Erro no Cadastro do Usuário!');
                }
                resolve(results.insertId);
            });
        });

        const ID_Usuario = inserirUsuario;

        const cadastrarTelefones = 'INSERT INTO Telefones (ID_Usuario, Telefone) VALUES (?,?), (?,?);';

        await new Promise((resolve, reject) => {
            conexao.query(cadastrarTelefones, [ID_Usuario, telefone, ID_Usuario, celular], (err, results) => {
                if (err) {
                    throw new Error('Erro no Cadastro dos Telefones do Usuário!');
                }
                resolve(results);
            });
        });

        // Iniciando a sessão
        req.session.clienteID = ID_Usuario;

        // Redirecionando para a página "home_usuario.html"
        return res.redirect('/home_cliente.html');

    } catch (error) {
        throw new Error(error.message);
    }
});


// Função para verificar o Login (Página Login)
app.post('/verificar-login', async (req, res) => {
    const { email, senha } = req.body;

    // Inicialize o contador de tentativas e tempo de espera na sessão, se ainda não existir
    if (!req.session.tentativas) {
        req.session.tentativas = 0;
    }

    if (!req.session.bloqueio) {
        req.session.bloqueio = null;
    }

    // Definindo limite de tentaivas
    const limiteTentativas = 5;

    // Definindo o tempo de espera após 5 tentativas erradas (30 Minutos em Milisegundos)
    const tempoBloqueio = 30 * 60 * 1000;

    // Obtendo o exato momento
    const agora = Date.now();

    // Verificando se o Usuário está bloqueado
    if (req.session.bloqueio && agora < req.session.bloqueio) {

        // Tempo restante
        const tempoRestante = Math.ceil((req.session.bloqueio - agora) / 1000 / 60);

        return res.status(200).json({ validacao: false, tentativas: "bloqueado", tempo: tempoRestante });

    }

    // Verificando se o número de tentativas excedeu o limite
    if (req.session.tentativas >= limiteTentativas - 1) {
        req.session.bloqueio = agora + tempoBloqueio;
        req.session.tentativas =  0;
        return res.status(200).json({ validacao: false, tentativas: "bloqueado", tempo: 30 });
    }

    conexao.query('SELECT ID_Usuario, Senha_Usuario FROM Usuarios WHERE Email_Usuario = ?;', [email], async (err, results) => {

        // Verificando se não houve um erro na consulta
        if (err) {
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados!' });
        }

        // Caso o email esteja cadastrado no BD
        if (results.length > 0) {

            // Obtendo a senha criptografada cadastrada
            const senha_bd = results[0].Senha_Usuario;

            // Obtendo o ID do Usuário
            const  ID_Usuario = results[0].ID_Usuario;

            // Verificando se as senhas são iguais
            const resultado = await bcrypt.compare(senha, senha_bd);

            if (resultado === true) {

                // Zerando o contador de tentativas
                req.session.tentativas = 0;

                // Iniciando a sessão com o ID do Usuário
                req.session.clienteID = ID_Usuario;

                return res.status(200).json({ validacao: true });

            }else{

                // Adicionando no contador de tentativas
                req.session.tentativas += 1;

                if (req.session.tentativas === limiteTentativas - 1) {
                    return res.status(200).json({ validacao: false, tentativas: "limite" });
                }else{
                    return res.status(200).json({ validacao: false });
                }

            }
            
        } else {
            return res.status(200).json({ validacao: 0 });
        }
    });
});


// Função para validar se a sessão foi iniciada (Todas as Páginas em que o Uuário precisa estar Logado)
app.post('/verificar-sessao', (req, res) => {
    
    // Verificando se o ID do cliente existe na sessão
    if (req.session.clienteID) {
        console.log('Sessão Validada');
        res.status(200).json({ sessaoIniciada: true, clienteID: req.session.clienteID });
    } else {
        res.status(200).json({ sessaoIniciada: false });
        console.log('Sessão Não Validada');
    }
});


// Criando uma variavel para guardar a senha criptografada e cadastrada, para ser comparada em outras ocasiões
var senha_cadastrada = "";

// Criando uma variável para guardarr a ultima foto
var fotoUsuOriginal = "";

// Função para buscar os dados do cliente (Página Alterar Dados Usuário)
app.post('/buscar-dados-cliente', (req, res) => {

    // Obtendo o ID do Cliente da sessão
    const ID_Cliente = req.session.clienteID;

    // Verificando se o ID do Cliente existe na sessão
    if (!ID_Cliente) {
        return res.status(401).json({ error: 'Sessão não iniciada!' });
    }

    // Buscando os dados relacionados ao ID
    conexao.query('SELECT * FROM Usuarios WHERE ID_Usuario = ?', [ID_Cliente], (err, results) => {
        // Verificando se houve um erro na consulta
        if (err) {
            return res.status(500).json({ error: 'Erro ao consultar o Banco de Dados - Buscando Dados do Usuário!' });
        }

        // Verificando se o ID do Usuário realmente existe
        if (results.length > 0) {

            // Consultando para obter os Telefones do Usuário
            conexao.query('SELECT Telefone FROM Telefones WHERE ID_Usuario = ?', [ID_Cliente], (err, resultado) => {
                // Verificando se houve um erro na consulta
                if (err) {
                    return res.status(500).json({ error: 'Erro ao consultar o Banco de Dados - Buscando Telefones do Usuário!' });
                }

                // Inicializando variáveis para armazenar telefones
                let telefone = "";
                let celular = "";

                // Verificando se há telefones cadastrados
                if (resultado.length > 0) {
                    telefone = resultado[0]?.Telefone || "";
                    celular = resultado[1]?.Telefone || "";
                }

                // Obtendo a senha do Usuário Cadastrado
                senha_cadastrada = results[0].Senha_Usuario;

                // Obtendo a foto original
                fotoUsuOriginal = results[0].Foto_Usuario;

                // Retornando os dados do cliente para a exibição
                return res.status(200).json({
                    existe: true,
                    nome: results[0].Nome_Usuario,
                    email: results[0].Email_Usuario,
                    foto: results[0].Foto_Usuario,
                    cep: results[0].End_CEP,
                    cidade: results[0].End_Cidade,
                    uf: results[0].End_UF,
                    bairro: results[0].End_Bairro,
                    rua: results[0].End_Rua,
                    numero: results[0].End_Numero,
                    complemento: results[0].End_Complemento,
                    telefone: telefone,
                    celular: celular
                });
            });
        } else {
            return res.status(200).json({ existe: false });
        }
    });
});


// Função para sair da conta (Todas as Páginas)
app.post('/sair-conta', (req, res) => {

    // Apagando a senha
    senha_cadastrada = "";

    // Destrói a sessão do usuário
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao encerrar a sessão!' });
        }

        // Limpando cookies da sessão
        res.clearCookie('connect.sid');

        // Redireciona para a página de login ou envia uma resposta de sucesso
        res.status(200).json({ resultado: true });
    });
});


// Função para comparar as senha antes de altera-la (Página Alterar Dados Usuário)
app.post('/comparar-senhas', async (req, res) => {

    // Obtendo a senha a ser comparada
    const { senha_atual } = req.body;

    // Verificando se as senhas são iguais
    const resultado = await bcrypt.compare(senha_atual, senha_cadastrada);

    if (resultado === true){
        res.status(200).json({ resultado: true });
    }else{
        res.status(200).json({ resultado: false });
    }

});


// Função para alterar os dados do Usuário com upload de imagem (Página Alterar Dados Usuário)
app.post('/alterar-dados-usuario', upload.single('foto_usuario'), async (req, res) => {
    // Obtendo os dados do Formulário
    const { nome, email, telefone, celular, cep, cidade, uf, bairro, rua, numero, complemento, senha_nova, alterar_senha, senha_atual, img_removida } = req.body;

    let senha_usuario = senha_nova;

    // Mantém a senha atual caso o usuário não queira alterar
    if (alterar_senha !== "sim") {
        senha_usuario = senha_atual;
    }

    // Obtendo o ID do Cliente da sessão
    const ID_Cliente = req.session.clienteID;

    try {
        // Obtendo a senha original e a foto do usuário
        const userQuery = 'SELECT Senha_Usuario, Foto_Usuario FROM Usuarios WHERE ID_Usuario = ?';
        const [user] = await new Promise((resolve, reject) => {
            conexao.query(userQuery, [ID_Cliente], (err, results) => {
                if (err) {
                    return reject(new Error('Erro ao obter os dados do usuário!'));
                }
                resolve(results);
            });
        });

        // Se nenhuma nova foto foi enviada, mantemos a foto original
        let foto = req.file ? req.file.filename : user.Foto_Usuario;

        // Verificando se o usuário removeu a imagem (caso 'img_removida' seja '1')
        if (img_removida === '1') {
            foto = "usuario-n.png";
        }

        // Caso tenha sido enviada uma nova imagem e a imagem antiga não seja a padrão
        if (user.Foto_Usuario !== foto && user.Foto_Usuario !== "usuario-n.png") {
            const oldImagePath = path.join(__dirname, 'public/imagens/usuarios', user.Foto_Usuario);
            console.log('Entrou  1');

            // Verifica se o arquivo existe antes de tentar excluí-lo
            if (fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error(`Erro ao excluir a imagem antiga: ${oldImagePath}`, err);
                    } else {
                        console.log(`Imagem antiga excluída com sucesso: ${oldImagePath}`);
                    }
                });
            }
        }

        // Criptografando a senha, se for alterada
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha_usuario, saltRounds);

        // Query para alterar os dados do usuário
        const alterarUsu = 'UPDATE Usuarios SET Nome_Usuario = ?, Senha_Usuario = ?, Email_Usuario = ?, Foto_Usuario = ?, End_CEP = ?, End_Cidade = ?, End_UF = ?, End_Bairro = ?, End_Rua = ?, End_Numero = ?, End_Complemento = ? WHERE ID_Usuario = ?;';

        // Alterando os dados do usuário
        await new Promise((resolve, reject) => {
            conexao.query(alterarUsu, [nome, senhaHash, email, foto, cep, cidade, uf, bairro, rua, numero, complemento, ID_Cliente], (err, results) => {
                if (err) {
                    return reject(new Error('Erro ao alterar os dados do usuário!'));
                }
                resolve(results);
            });
        });

        // Obtendo os ID's dos telefones do usuário
        const telefoneQuery = 'SELECT ID_Telefone FROM Telefones WHERE ID_Usuario = ?;';
        const telefones = await new Promise((resolve, reject) => {
            conexao.query(telefoneQuery, [ID_Cliente], (err, results) => {
                if (err) return reject(new Error('Erro ao obter os telefones do usuário!'));
                resolve(results);
            });
        });

        // Função para atualizar telefones
        async function atualizarTelefone(numero, ID_Telefone) {
            if (ID_Telefone) {
                const alterarTelefone = 'UPDATE Telefones SET Telefone = ? WHERE ID_Telefone = ?;';
                return new Promise((resolve, reject) => {
                    conexao.query(alterarTelefone, [numero, ID_Telefone], (err, results) => {
                        if (err) return reject(new Error(`Erro ao alterar o telefone: ${numero}`));
                        resolve(results);
                    });
                });
            }
        }

        // Atualizando telefone e celular
        await atualizarTelefone(telefone, telefones[0]?.ID_Telefone);
        await atualizarTelefone(celular, telefones[1]?.ID_Telefone);

        // Redireciona para a página de dados do cliente após o sucesso
        return res.redirect('/dados_cliente.html');

    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).send('Erro ao alterar os dados do usuário.');
    }
});


// Função para excluir a conta do Usuário (Aterar dados Cliente)
app.post('/excluir-conta', async (req, res) => {

    // Obtendo o ID do Cliente da sessão
    const ID_Cliente = req.session.clienteID;

    // Obtendo a foto do usuário
    const userQuery = 'SELECT Foto_Usuario FROM Usuarios WHERE ID_Usuario = ?';
    const [user] = await new Promise((resolve, reject) => {
        conexao.query(userQuery, [ID_Cliente], (err, results) => {
            if (err) {
                return reject(new Error('Erro ao obter os dados do usuário!'));
            }
            resolve(results);
        });
    });

    // Deletando a imagem do usuário
    const oldImagePath = path.join(__dirname, 'public/imagens/usuarios', user.Foto_Usuario);

    // Verifica se o arquivo existe antes de tentar excluí-lo
    if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
            if (err) {
                console.error(`Erro ao excluir a imagem antiga: ${oldImagePath}`, err);
            } else {
                console.log(`Imagem antiga excluída com sucesso: ${oldImagePath}`);
            }
        });
    }

    // Deletando os telefones do usuário
    const excluirTelefoneQuery = 'DELETE FROM Telefones where ID_Usuario = ?;';
        const excluirTelefone = await new Promise((resolve, reject) => {
            conexao.query(excluirTelefoneQuery, [ID_Cliente], (err, results) => {
                if (err) return reject(new Error('Erro ao excluir o Telefone!'));
                resolve(results);
            });
        });

    // Deletando o usuário
    const excluirQuery = 'DELETE FROM Usuarios where ID_Usuario = ?;';
        const excluir = await new Promise((resolve, reject) => {
            conexao.query(excluirQuery, [ID_Cliente], (err, results) => {
                if (err) return reject(new Error('Erro ao excluir a conta!'));
                resolve(results);
            });
        });

    res.status(200).json({ excluiu: true }); 

});



// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
