const conexao = require("../bd/conexao.js");

// Função para calcular o subtotal do pedido
exports.calcularSubtotalPedido = async (produtosPedido) => {
  let subTotal = 0;

  for (let i = 0; i < produtosPedido.length; i++) {
    const preco = await new Promise((resolve, reject) => {
      const query = "SELECT Preco_Produto FROM Produtos WHERE ID_Produto = ?";
      conexao.query(query, [produtosPedido[i].id], (err, results) => {
        if (err) {
          console.error("Erro ao buscar preço do produto:", err);
          return reject(err);
        }
        resolve(Number(results[0].Preco_Produto));
      });
    });

    subTotal += preco * Number(produtosPedido[i].quantity);
  }

  return subTotal;
};

// Função para cadastrar o pedido
exports.cadastrarPedido = (
  idCliente,
  subTotal,
  total,
  desconto,
  entrega,
  pagamento,
  horaInicio,
  enderecoEntrega
) => {
  return new Promise((resolve, reject) => {
    const query = `
            INSERT INTO Pedidos (ID_Usuario, SubTotal_Pedido, Total_Pedido, Desconto_Pedido, Status_Pedido, Entrega_Necessaria, Tipo_Pagamento, Hora_Inicio, Endereco_Entrega)
            VALUES (?, ?, ?, ?, 'Enviado', ?, ?, ?, ?)
        `;
    conexao.query(
      query,
      [
        idCliente,
        subTotal,
        total,
        desconto,
        entrega,
        pagamento,
        horaInicio,
        enderecoEntrega,
      ],
      (err, results) => {
        if (err) {
          console.error("Erro ao cadastrar pedido:", err);
          return reject(err);
        }
        resolve(results.insertId);
      }
    );
  });
};

// Função para cadastrar os itens do pedido
exports.cadastrarItensPedido = async (idPedido, produtosPedido) => {
  for (let i = 0; i < produtosPedido.length; i++) {
    await new Promise((resolve, reject) => {
      const query =
        "INSERT INTO Pedidos_Produtos (ID_Pedido, ID_Produto, Qt_Produto) VALUES (?, ?, ?)";
      conexao.query(
        query,
        [idPedido, produtosPedido[i].id, produtosPedido[i].quantity],
        (err, results) => {
          if (err) {
            console.error("Erro ao cadastrar itens do pedido:", err);
            return reject(err);
          }
          resolve(results);
        }
      );
    });
  }
};

// Função para excluir os itens do pedido
exports.excluirItensPedido = async (idPedido) => {
  await new Promise((resolve, reject) => {
    const query = "DELETE FROM Pedidos_Produtos WHERE ID_Pedido = ?;";
    conexao.query(query, [idPedido], (err, results) => {
      if (err) {
        console.error("Erro ao excluir itens do pedido:", err);
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Função para excluir o pedido
exports.excluirPedido = async (idPedido) => {
  await new Promise((resolve, reject) => {
    const query = "DELETE FROM Pedidos WHERE ID_Pedido = ?;";
    conexao.query(query, [idPedido], (err, results) => {
      if (err) {
        console.error("Erro ao excluir o pedido:", err);
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Função para buscar pedidos de um cliente
exports.buscarPedidosPorCliente = (ID_Cliente) => {
  return new Promise((resolve, reject) => {
    const buscaPedidos = "SELECT * FROM Pedidos WHERE ID_Usuario = ?;";
    conexao.query(buscaPedidos, [ID_Cliente], (err, results) => {
      if (err) {
        console.error("Erro ao buscar os pedidos:", err);
        return reject("Erro ao buscar os pedidos.");
      }
      resolve(results);
    });
  });
};
