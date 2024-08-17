// Importando biblioteca MySQL2
const mysql = require('mysql2');

// Criando conexão com o banco de dados
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Diners_Burguers'
});

// Verificando a conexão
conexao.connect((err) => {
    if (err){
        console.error('Erro ao conectar ao banco de dados: ', err);
        return;
    }
    console.log('Conexão bem sucedida!!')
});

// Realizando uma consulta
connection.query('SELECT * FROM Usuarios', (err, results, fields) => {
    if (err) {
      console.error('Erro ao executar a consulta: ', err);
      return;
    }
    console.log('Resultados da consulta: ', results);
});