use Diners_Burguers;

drop database diners_burguers;

select * from Telefones;

select * from Usuarios;

DELETE FROM Telefones where ID_Telefone > 0;

DELETE FROM Usuarios where ID_Usuario > 1;

SELECT Email_Usuario FROM Usuarios WHERE Email_Usuario = "luis@gmail.com";

INSERT INTO Telefones (ID_Usuario, Telefone) VALUES (1,"(16) 9811-50536"), (1,"(16) 99432-1462");

SELECT ID_Usuario FROM Usuarios WHERE Email_Usuario = "luis@gmail.com3";

UPDATE Usuarios set Nome_Usuario = ?, Senha_Usuario = ?, Email_Usuario = ?, Foto_Usuario = ?, End_CEP = ?, End_Cidade = ?, End_UF = ?, End_Bairro = ?, End_Rua = ?, End_Numero = ?, End_Complemento = ? WHERE ID_Usuario = ?;

UPDATE Telefones set Telefone = "(11) 1111-11111" WHERE ID_Telefone = 31;