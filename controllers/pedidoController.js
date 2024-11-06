// controllers/pedidoController.js
const pedidoModel = require("../models/pedidoModel");
const produtoModel = require("../models/produtoModel");
const axios = require("axios");

// Função para cadastrar o pedido do cliente
exports.cadastrarPedido = async (req, res) => {

  const {
    isDelivery: entregaNecessaria,
    paymentMethod: tipoPagamento,
    cart: produtosPedido,
    idUser: ID_Cliente,
    endereco: enderecoEntrega,
  } = req.body.order;

  try {
    // Calcula o subtotal do pedido
    let subTotalPedido = await pedidoModel.calcularSubtotalPedido(
      produtosPedido
    );

    if (entregaNecessaria) {
      subTotalPedido += 8;
    }

    // console.log("Subtotal do pedido:", subTotalPedido);

    // Define valores adicionais do pedido
    const desconto = 0;
    const horaInicio = new Date();
    const totalPedido = subTotalPedido - desconto;

    // Cadastra o pedido
    const idPedido = await pedidoModel.cadastrarPedido(
      ID_Cliente,
      subTotalPedido,
      totalPedido,
      desconto,
      entregaNecessaria,
      tipoPagamento,
      horaInicio,
      enderecoEntrega
    );

    // Cadastra os itens do pedido
    await pedidoModel.cadastrarItensPedido(idPedido, produtosPedido);

    return res.status(200).json({ enviado: true });
  } catch (error) {
    console.error("Erro ao cadastrar pedido:", error);
    return res.status(500).json({ message: "Erro ao cadastrar pedido." });
  }
};

// Função para excluir o pedido do cliente
exports.excluirPedidosClientes = async (req, res) => {
  // Verificação da sessão
  const verificarSessaoResponse = await axios.post(
    "http://localhost:3000/verificar-sessao",
    {},
    {
      headers: {
        Cookie: req.headers.cookie, // Passando os cookies da sessão
      },
    }
  );

  const sessaoIniciada = verificarSessaoResponse.data.sessaoIniciada;

  if (!sessaoIniciada) {
    console.log("Sessão não Iniciada");
    return res.status(401).json({ message: "Sessão não iniciada!" });
  }

  // Obtendo o ID do Cliente
  const ID_Cliente = verificarSessaoResponse.data.clienteID;

  const { idPedido } = req.body;

  try {
    // Exclui o pedido relacionado ao ID
    await pedidoModel.excluirItensPedido(idPedido);
    await pedidoModel.excluirPedido(idPedido);

    return res.status(200).json({ enviado: true });
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);
    return res.status(500).json({ message: "Erro ao excluir pedido." });
  }
};

// Função para buscar pedidos dos clientes
exports.buscarPedidosClientes = async (req, res) => {
  try {
    // Verificação da sessão
    const verificarSessaoResponse = await axios.post(
      "http://localhost:3000/verificar-sessao",
      {},
      {
        headers: { Cookie: req.headers.cookie },
      }
    );

    const sessaoIniciada = verificarSessaoResponse.data.sessaoIniciada;
    if (!sessaoIniciada) {
      return res.status(401).json({ message: "Sessão não iniciada!" });
    }

    // Obtendo o ID do cliente
    const ID_Cliente = verificarSessaoResponse.data.user.id;

    // Usando o model para buscar os pedidos do cliente
    const pedidosCliente = await pedidoModel.buscarPedidosPorCliente(
      ID_Cliente
    );

    // Mapeando os pedidos no formato desejado
    const pedidos = pedidosCliente.map((pedido) => ({
      id: pedido.ID_Pedido,
      subTotal: pedido.SubTotal_Pedido,
      total: pedido.Total_Pedido,
      desconto: pedido.Desconto_Pedido,
      status: pedido.Status_Pedido,
      entrega: pedido.Entrega_Necessaria,
      pagamento: pedido.Tipo_Pagamento,
      tempoEstipulado: pedido.Tempo_Estipulado,
      inicio: pedido.Hora_Inicio,
      fim: pedido.Hora_Fim,
      tempoGasto: pedido.Tempo_Gasto,
      endereco: pedido.Endereco_Entrega,
    }));

    // Retornando a resposta com os pedidos formatados
    return res.status(200).json(pedidos);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return res.status(500).json({ message: "Erro ao buscar pedidos." });
  }
};
