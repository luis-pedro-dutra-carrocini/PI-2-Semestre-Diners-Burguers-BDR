// ---- Requizições de Bibliotecas ----
// Requerindo o express
const express = require('express');

// Requerindo o arquivo conexao com seus dados
const conexao = require('./bd/conexao');

// Requerindo o bcrypt
const bcrypt = require('bcrypt');

// Requerindo Express-Session para o controle de sessões do navegador
const session = require('express-session');

// Requerindo multer e path (upload de arquivos no servidor)
const multer = require('multer');

// Requirindo fs
const fs = require('fs');

// Requirindo path
const path = require('path');

// Requirindo console
const { error } = require('console');

// Requirindo cors
const cors = require('cors');

// Requirindo axios
const axios = require('axios');


// ---- Configurações APP ---- //
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir os arquivos estáticos do React
app.use(express.static(path.join(__dirname, 'frontend'))); // 'frontend' é a pasta `dist` copiada

// Rotas da API do backend aqui...

// Rota wildcard para retornar o `index.html` em qualquer outra rota não capturada
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Configura o middleware de sessão antes das rotas
const sessionMiddleware = require('./middlewares/sessionMiddleware');
app.use(sessionMiddleware);


// ---- Variáveis de Velores Originais ---- //

// Criando uma variavel para guardar a senha criptografada e cadastrada, para ser comparada em outras ocasiões
var senha_cadastrada = "";

// Criando uma variável para guardar a ultima foto
var fotoUsuOriginal = "";


// ---- Funções/API's ---- //

// Obtendo as Rootas das API's relacionadas ao Usuário
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

// Obtendo as Rootas das API's relacionadas aos Pedidos
const pedidoRoutes = require('./routes/pedidoRoutes');
app.use('/', pedidoRoutes);

// Obtendo as Rootas das API's relacionadas aos Produtos
const produtoRoutes = require('./routes/produtoRoutes');
app.use('/', produtoRoutes);

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});