use Diners_Burguers;

select * from Telefones;

select * from Usuarios;

DELETE FROM Telefones where ID_Telefone > 0;

DELETE FROM Usuarios where ID_Usuario > 0;

SELECT Email_Usuario FROM Usuarios WHERE Email_Usuario = "luis@gmail.com";

INSERT INTO Telefones (ID_Usuario, Telefone) VALUES (1,"(16) 9811-50536"), (1,"(16) 99432-1462");

SELECT ID_Usuario FROM Usuarios WHERE Email_Usuario = "luis@gmail.com3";