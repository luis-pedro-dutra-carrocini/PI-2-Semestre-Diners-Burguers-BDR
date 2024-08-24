// Requerindo o express
const express = require('express');

// Requerindo o arquivo conexao com seus dados
const conexao = require('./conexao');

// Requerindo o bcrypt
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Servir arquivos estáticos (HTML, JS, CSS)
app.use(express.static('public'));

// Função para verificar se o email já está cadastrado no banco de dados
app.post('/verificar-email', (req, res) => {
    const { email } = req.body;

    // Consulta no BD
    conexao.query('SELECT Email_Usuario FROM Usuarios WHERE Email_Usuario = ?;', [email], (err, results) => {
        
        // Verificando se ouve algum erro
        if (err) {
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        }

        // Verificando se há registros nessa consulta
        if (results.length > 0) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    });
});

// Função para cadastrar o Usuário
app.post('/cadastrar-usuario', async (req, res) => {

    // Obtendo os dados a serem utilizados no cadastro
    const { email, nome, senha, foto, nivel, status, cep, cidade, uf, bairro, rua, numero, complemento, telefone, celular } = req.body;

    try {

        // Hashing da senha
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // Inserção do usuário
        const cadastar_usu = 'INSERT INTO Usuarios (Nome_Usuario, Email_Usuario, Senha_Usuario, Foto_Usuario, Nivel_Usuario, Status_Usuario, End_CEP, End_Cidade, End_UF, End_Bairro, End_Rua, End_Numero, End_Complemento) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);';

        // Inserindo o Usuário
        const inserirUsuario = await new Promise((resolve, reject) => {
            conexao.query(cadastar_usu, [nome, email, senhaHash, foto, nivel, status, cep, cidade, uf, bairro, rua, numero, complemento], (err, results) => {
                if (err) {
                    return reject('Erro Cadastro Usuário');
                }
                resolve(results.insertId); // Obtendo o ID gerado para o usuário
            });
        });

        // Passando o código do Usuário
        const ID_Usuario = inserirUsuario;

        // Inserção dos telefones
        const cadastar_telefones = 'INSERT INTO Telefones (ID_Usuario, Telefone) VALUES (?,?), (?,?);';

        // Inserindo os telefones do Usuário
        await new Promise((resolve, reject) => {
            conexao.query(cadastar_telefones, [ID_Usuario, telefone, ID_Usuario, celular], (err, results) => {
                if (err) {
                    return reject('Erro Inserção Telefones');
                }
                resolve(results);
            });
        });

        // Enviar resposta final
        return res.status(200).json({ resposta: 'Ok' });

    } catch (error) {
        return res.status(500).json({ resposta: error });
    }
});


// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});