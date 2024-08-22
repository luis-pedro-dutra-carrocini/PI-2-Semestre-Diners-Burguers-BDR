// Requerindo o express
const express = require('express');

// Requerindo o arquivo conexao com seus dados
const conexao = require('./conexao');

const app = express();
app.use(express.json());

// Servir arquivos estáticos (HTML, JS, CSS)
app.use(express.static('public'));

// Função para verificar se o email já está cadastrado no banco de dados
app.post('/verificar-email', (req, res) => {
    const { email } = req.body;

    // Consulta no BD
    conexao.query('SELECT Email_Usuario FROM Usuarios WHERE Email_Usuario = ?', [email], (err, results) => {
        
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

// Definindo uma porta para rodar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
