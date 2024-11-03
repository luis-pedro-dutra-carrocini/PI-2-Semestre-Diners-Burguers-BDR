// ---- Requizições de Bibliotecas ----
// Requerindo o express
const express = require("express");
const session = require("express-session");
const path = require('path');

// ---- Configurações APP ---- //
const app = express();
app.use(express.json());

// Caso queira executar o Front-End separado do Back-End baixe a pasta Front-End-Separado e execute nela o comando 'npm run dev'

// Requirindo cors
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


// Caso queira executar o Back-End junto com o Front-End na mesma pasta
// Servir os arquivos estáticos do React
app.use(express.static(path.join(__dirname, 'frontend'))); // 'frontend' é a pasta `dist` copiada

// Rota wildcard para retornar o `index.html` em qualquer outra rota não capturada
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});


// Configura o middleware de sessão antes das rotas
app.use(
  session({
    secret: "seu-segredo-seguro", // Use uma string segura para seu segredo
    resave: false, // Não salve a sessão se não houver alterações
    saveUninitialized: false, // Não salve sessões não inicializadas
    cookie: {
      httpOnly: true, // Protege contra ataques de JavaScript
      secure: false, // Configure como true em produção para HTTPS
      maxAge: 1000 * 60 * 60, // Duração do cookie (1 hora, por exemplo)
    },
  })
);

// ---- Funções/API's ---- //

// Obtendo as Rootas das API's relacionadas ao Usuário
const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);

// Obtendo as Rootas das API's relacionadas aos Pedidos
const pedidoRoutes = require("./routes/pedidoRoutes");
app.use("/", pedidoRoutes);

// Obtendo as Rootas das API's relacionadas aos Produtos
const produtoRoutes = require("./routes/produtoRoutes");
app.use("/", produtoRoutes);

app.get("/test-session", (req, res) => {
  res.json(req.session);
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
