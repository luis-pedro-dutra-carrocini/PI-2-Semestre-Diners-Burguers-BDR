// routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Rota para cadastrar pedido
router.post('/cadastrar-pedido', pedidoController.cadastrarPedido);

// Rota para buscar os pedidos do cliente
router.post('/buscar-pedidos-clientes', pedidoController.buscarPedidosClientes);

// Rota para buscar os pedidos do cliente
router.post('/excluir-pedidos-clientes', pedidoController.excluirPedidosClientes);

module.exports = router;