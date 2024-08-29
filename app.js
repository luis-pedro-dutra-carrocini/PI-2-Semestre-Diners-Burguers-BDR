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
    
    console.log(req.body)
    const foto = req.file ? req.file.filename : null;

    console.log('Nome da foto:', foto);

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

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
