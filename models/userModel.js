// models/userModel.js
const conexao = require('../bd/conexao.js');

// Verificando se o email está cadastrado no BD
exports.emailExiste = (email, callback) => {
    const query = 'SELECT Email_Usuario FROM Usuarios WHERE Email_Usuario = ?;';
    conexao.query(query, [email], (err, results) => {
        if (err) return callback(err, null);
        const exists = results.length > 0;
        callback(null, exists);
    });
};


// Função para buscar usuário pelo ID com Promises
exports.buscarUsuarioPorID = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Usuarios WHERE ID_Usuario = ?';
        conexao.query(query, [id], (err, results) => {
            if (err) {
                console.error('Erro ao buscar Usuário no banco de dados:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


// Função para atualizar os dados do usuário
exports.alterandoDadosUsuario = (ID_Usuario, nome, senha, email, foto, telefone) => {
    console.log("Iniciando alteração de dados do Cliente");
    return new Promise((resolve, reject) => {
        const query = `UPDATE Usuarios SET Nome_Usuario = ?, Senha_Usuario = ?, Email_Usuario = ?, 
                       Foto_Usuario = ?, Telefone_Usuario = ? WHERE ID_Usuario = ?`;
        conexao.query(query, [nome, senha, email, foto, telefone, ID_Usuario], (err, results) => {
            if (err) {
                console.error('Erro ao atualizar os dados do usuário:', err);
                reject(err);
            } else {
                console.log('Dados Alterados');
                resolve(results);
            }
        });
    });
};

// Função para verificar se o novo email já está em uso
exports.novoEmailCadastrado = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Usuarios WHERE Email_Usuario = ?';
        conexao.query(query, [email], (err, results) => {
            if (err) {
                console.error('Erro ao buscar Usuário no banco de dados:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};


// Função para buscar a foto do usuário pelo ID
exports.buscarFotoUsuario = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT Foto_Usuario FROM Usuarios WHERE ID_Usuario = ?';
        conexao.query(query, [id], (err, results) => {
            if (err) {
                console.error('Erro ao buscar a foto do usuário:', err);
                return reject(err);
            }
            resolve(results[0]);
        });
    });
};


// Função para excluir o usuário pelo ID
exports.excluirUsuario = async (id) => {
    try {
        // Excluindo as avaliações do usuário
        await new Promise((resolve, reject) => {
            const deletarAvaliacao = 'DELETE FROM Avaliacoes WHERE ID_Usuario = ?';
            conexao.query(deletarAvaliacao, [id], (err, results) => {
                if (err) {
                    console.error('Erro ao excluir a avaliação do usuário:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        // Excluindo produtos dos pedidos do usuário
        const pedidosUsuario = await new Promise((resolve, reject) => {
            const queryPedidos = 'SELECT ID_Pedido FROM Pedidos WHERE ID_Usuario = ?';
            conexao.query(queryPedidos, [id], (err, results) => {
                if (err) {
                    console.error('Erro ao buscar os pedidos do usuário:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        await Promise.all(
            pedidosUsuario.map(pedido => {
                return new Promise((resolve, reject) => {
                    const deletarProdutosPedidos = 'DELETE FROM Pedidos_Produtos WHERE ID_Pedido = ?';
                    conexao.query(deletarProdutosPedidos, [pedido.ID_Pedido], (err, results) => {
                        if (err) {
                            console.error('Erro ao excluir os produtos dos pedidos do usuário:', err);
                            return reject(err);
                        }
                        resolve(results);
                    });
                });
            })
        );

        // Excluindo pedidos do usuário
        await new Promise((resolve, reject) => {
            const deletarPedidos = 'DELETE FROM Pedidos WHERE ID_Usuario = ?';
            conexao.query(deletarPedidos, [id], (err, results) => {
                if (err) {
                    console.error('Erro ao excluir os pedidos do usuário:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        // Excluindo o usuário
        await new Promise((resolve, reject) => {
            const deletarUsuario = 'DELETE FROM Usuarios WHERE ID_Usuario = ?';
            conexao.query(deletarUsuario, [id], (err, results) => {
                if (err) {
                    console.error('Erro ao excluir o usuário:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        console.log("Usuário e todos os dados relacionados excluídos com sucesso.");
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao excluir a conta do usuário:', error);
        throw error;
    }
};


// Função para buscar as três melhores avaliações
exports.buscarMelhoresAvaliacoes = () => {
    return new Promise((resolve, reject) => {
        const queryAvaliacoes = `
            SELECT ID_Usuario, Nota_Avaliacao, Data_Avaliacao, Comentario_Avaliacao 
            FROM Avaliacoes 
            ORDER BY Nota_Avaliacao DESC 
            LIMIT 3;
        `;

        conexao.query(queryAvaliacoes, (err, avaliacoesResults) => {
            if (err) {
                console.error('Erro ao buscar as avaliações dos Usuários:', err);
                return reject('Erro ao buscar as avaliações dos Usuários.');
            }

            const usuarioIds = avaliacoesResults.map(avaliacao => avaliacao.ID_Usuario);
            const queryClientes = `
                SELECT Nome_Usuario, Foto_Usuario 
                FROM Usuarios 
                WHERE ID_Usuario IN (?, ?, ?);
            `;

            conexao.query(queryClientes, usuarioIds, (err, clientesResults) => {
                if (err) {
                    console.error('Erro ao buscar os dados dos Clientes:', err);
                    return reject('Erro ao buscar os dados dos Clientes.');
                }

                // Combina as avaliações com os dados dos clientes
                const resultadoFinal = avaliacoesResults.map((avaliacao, index) => ({
                    nota: avaliacao.Nota_Avaliacao,
                    data: avaliacao.Data_Avaliacao,
                    comentario: avaliacao.Comentario_Avaliacao,
                    nomeCliente: clientesResults[index]?.Nome_Usuario,
                    fotoCliente: clientesResults[index]?.Foto_Usuario
                }));

                resolve(resultadoFinal);
            });
        });
    });
};