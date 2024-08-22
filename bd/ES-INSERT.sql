use Diners_Burguers;

insert into Usuarios (Nome_Usuario, Senha_Usuario, Email_Usuario, Foto_Usuario, Nivel_Usuario, Status_Usuario, End_CEP, End_Cidade, End_UF, End_Bairro, End_Rua, End_Numero, End_Complemento) 
VALUES ("Luís Pedro", "123456", "luis@gmail.com", "foto", "cliente", "ativo", "14620-000", "Orlândia", "SP", "Jardim Parisi", "Alameda 7", 1340, "A"); 

select * from Usuarios;

SELECT Email_Usuario FROM Usuarios WHERE Email_Usuario = "luis@gmail.com";