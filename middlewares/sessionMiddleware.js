// middlewares/sessionMiddleware.js
const session = require("express-session");

module.exports = session({
  secret: "seuSegredoAqui",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 }, // Define o tempo de vida do cookie da sessão
});
