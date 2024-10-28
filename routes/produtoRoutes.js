// routes/produtoRoutes.js
const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// Rota para buscar os produtos cadastrados
router.post('/buscar-produtos', produtoController.buscarProdutos);

module.exports = router;
