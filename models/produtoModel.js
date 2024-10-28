// models/produtoModel.js
const conexao = require('../bd/conexao.js');

// Função para verificar a existência de um produto pelo ID
exports.verificarProdutoExiste = (idProduto) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS count FROM Produtos WHERE ID_Produto = ?';
        conexao.query(query, [idProduto], (err, results) => {
            if (err) {
                console.error('Erro ao buscar produto:', err);
                return reject(err);
            }
            resolve(results[0].count > 0);
        });
    });
};


// Função para buscar todos os produtos
exports.buscarTodosProdutos = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT ID_Produto, Nome_Produto, Foto_Produto, Classe_Produto, Descricao_Produto, Composicao_Produto, Preco_Produto FROM Produtos;';
        conexao.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar todos os produtos:', err);
                return reject('Erro ao buscar todos os produtos.');
            }
            resolve(results);
        });
    });
};


// Função para buscar os três produtos mais vendidos da categoria "Burger"
exports.buscarBurgersMaisVendidos = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.Nome_Produto, p.Foto_Produto, p.Composicao_Produto, p.Descricao_Produto, p.Preco_Produto, SUM(pp.Qt_Produto) AS TotalVendido 
            FROM Pedidos_Produtos pp 
            JOIN Produtos p ON pp.ID_Produto = p.ID_Produto 
            WHERE p.Classe_Produto = "Burger" 
            GROUP BY p.ID_Produto 
            ORDER BY TotalVendido DESC 
            LIMIT 3;
        `;
        conexao.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar os Burgers mais vendidos:', err);
                return reject('Erro ao buscar os Burgers mais vendidos.');
            }
            resolve(results);
        });
    });
};


// Função para buscar três produtos aleatórios da categoria "Burger"
exports.buscarBurgersAleatorios = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT Nome_Produto, Foto_Produto, Composicao_Produto, Descricao_Produto, Preco_Produto FROM Produtos WHERE Classe_Produto = "Burger" LIMIT 3;';
        conexao.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar Burgers aleatórios:', err);
                return reject('Erro ao buscar Burgers aleatórios.');
            }
            resolve(results);
        });
    });
};