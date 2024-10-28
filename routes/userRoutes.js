// routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Rota para funções relacionadas ao usuário
const userController = require('../controllers/userController');

// Rota para o Upload de Imagens
const upload = require('../middlewares/uploadMiddleware');

// Rota para verificar se email já esta cadastrado
router.post('/verificar-email', userController.verificarEmail);

// Rota para cadastrar o usuário
router.post('/cadastrar-usuario', upload.single('foto_usuario'), userController.cadastrarUsuario);

// Rota para Validar o Login
router.post('/verificar-login', userController.verificarLogin);

// Rota para Verificar se a Sessão foi Iniciada
router.post('/verificar-sessao', userController.verificarSessao);

// Rota para Buscar os Dados do Cliente
router.post('/buscar-dados-cliente', userController.buscarDadosCliente);

// Rota para sair da conta do usuário
router.post('/sair-conta', userController.sairConta);

// Rota para sair da conta do usuário
router.post('/comparar-senhas', userController.compararSenhas);

// Rota para alterar os dados do usuário
router.post('/alterar-dados-usuario', upload.single('foto_usuario'), userController.alterarDadosUsuario);

// Rota para excluir a conta do usuário
router.post('/excluir-conta', userController.excluirConta);

// Rota para buscar avaliações do usuário
router.post('/buscar-avaliacoes', userController.buscarAvaliacoes);

module.exports = router;
