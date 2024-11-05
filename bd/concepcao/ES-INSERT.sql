# Códigos para testes das buscas no BD

use Diners_Burguers;

drop database diners_burguers;

select * from Usuarios;

select * from Pedidos;

select * from Pedidos_Produtos;

select * from Produtos;

DELETE FROM Pedidos where ID_Pedido > 0;

DELETE FROM Pedidos_Produtos where ID_Pedido > 0;

DELETE FROM Usuarios where ID_Usuario > 4;

SELECT Email_Usuario FROM Usuarios WHERE Email_Usuario = "luis@gmail.com";

SELECT Nome_Usuario, Foto_Usuario FROM Usuarios WHERE ID_Usuario = 1;

SELECT ID_Usuario FROM Usuarios WHERE Email_Usuario = "luis@gmail.com3";

UPDATE Usuarios set Nome_Usuario = ?, Senha_Usuario = ?, Email_Usuario = ?, Foto_Usuario = ?, End_CEP = ?, End_Cidade = ?, End_UF = ?, End_Bairro = ?, End_Rua = ?, End_Numero = ?, End_Complemento = ? WHERE ID_Usuario = ?;

SELECT p.ID_Produto, SUM(pp.Qt_Produto) AS TotalVendido FROM Pedidos_Produtos pp JOIN Produtos p 
ON pp.ID_Produto = p.ID_Produto WHERE p.Classe_Produto = "Burger"	GROUP BY p.ID_Produto ORDER BY TotalVendido DESC LIMIT 3;

SELECT Nome_Produto, Foto_Produto, Composicao_Produto, Preco_Produto FROM Produtos WHERE ID_Produto = 3 or ID_Produto = 2 or ID_Produto = 8 LIMIT 3;

SELECT ID_Usuario, Nota_Avaliacao, Data_Avaliacao, Comentario_Avaliacao FROM Avaliacoes ORDER BY Nota_Avaliacao DESC LIMIT 3;