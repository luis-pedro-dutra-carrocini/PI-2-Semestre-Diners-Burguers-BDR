// controllers/produtoController.js
const produtoModel = require("../models/produtoModel");

// Função para buscar os produtos
exports.buscarProdutos = async (req, res) => {
  const { tipoBusca } = req.body;

  try {
    if (tipoBusca === "Todos") {
      // Busca todos os produtos
      const produtos = await produtoModel.buscarTodosProdutos();
      if (produtos.length > 0) {
        const produtosFormatados = produtos.map((produto) => ({
          id: produto.ID_Produto,
          name: produto.Nome_Produto,
          image: produto.Foto_Produto,
          description: produto.Composicao_Produto,
          tipo: produto.Descricao_Produto,
          price: produto.Preco_Produto,
          classe: produto.Classe_Produto,
        }));
        console.log("Produtos Formatados: ", produtosFormatados);
        return res.status(200).json(produtosFormatados);
      }
      return res.status(404).json({ message: "Nenhum produto encontrado." });
    } else if (tipoBusca === "Burgers Mais Vendidos") {
      // Busca os três produtos mais vendidos da categoria "Burger"
      const maisVendidos = await produtoModel.buscarBurgersMaisVendidos();
      if (maisVendidos.length >= 3) {
        const produtosFormatados = maisVendidos.map((produto) => ({
          id: produto.ID_Produto,
          name: produto.Nome_Produto,
          image: produto.Foto_Produto,
          description: produto.Composicao_Produto,
          tipo: produto.Descricao_Produto,
          price: produto.Preco_Produto,
        }));
        console.log("Mais Vendidos: ", produtosFormatados);
        return res.status(200).json(produtosFormatados);
      } else {
        // Caso não tenha 3 produtos, busca três produtos aleatórios
        const produtosAleatorios = await produtoModel.buscarBurgersAleatorios();
        if (produtosAleatorios.length > 0) {
          const produtosFormatados = produtosAleatorios.map((produto) => ({
            id: produto.ID_Produto,
            name: produto.Nome_Produto,
            image: produto.Foto_Produto,
            description: produto.Composicao_Produto,
            tipo: produto.Descricao_Produto,
            price: produto.Preco_Produto,
          }));
          console.log("Produtos Aleatorios: ", produtosFormatados);
          return res.status(200).json(produtosFormatados);
        }
        return res.status(404).json({ message: "Nenhum Burger encontrado." });
      }
    } else {
      return res.status(400).json({ message: "Tipo de busca inválido." });
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return res.status(500).json({ message: "Erro ao buscar produtos." });
  }
};
