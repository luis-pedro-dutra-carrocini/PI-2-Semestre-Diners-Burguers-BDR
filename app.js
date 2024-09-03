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
const path = require('path');

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

// ---- Fim ----


// ---- Funções ----

// Função para verificar se o email já está cadastrado no banco de dados
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


// Função para cadastrar o Usuário com upload de imagem
app.post('/cadastrar-usuario', upload.single('foto_usuario'), async (req, res) => {
    
    const { nome, email, telefone, celular, cep, cidade, uf, bairro, rua, numero, complemento, senha_cadastro } = req.body;

    const nivel = 'cliente';
    const status = 'ativo';
    
    const foto = req.file ? req.file.filename : null;

    try {
        if (!foto) {
            throw new Error('Foto de Perfil não Salva!');
        }

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

// Função para verificar o Login (Se o email e senha estão cadastrados e corretos no BD)
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

// Função para validar se a sessão foi iniciada
app.post('/verificar-sessao', (req, res) => {

    // Verificando se o ID do cliente existe na sessão
    if (req.session.clienteID) {
        res.status(200).json({ sessaoIniciada: true, clienteID: req.session.clienteID });
    } else {
        res.status(200).json({ sessaoIniciada: false });
    }
});

// Função para buscar os dados do cliente
app.post('/buscar-dados-cliente', (req, res) => {

    // Obtendo o ID do Cliente
    ID_Cliente = req.session.clienteID;
    
    // Buscando os dados relacionados ao ID
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
