create database Diners_Burguers;
use Diners_Burguers;

# Criando a tabela Usuários
create table Usuarios(
 ID_Usuario int auto_increment primary key,
 Nome_Usuario varchar(75) not null,
 Senha_Usuario varchar(300) not null,
 Email_Usuario varchar(256) not null,
 Foto_Usuario varchar(300) null,
 Nivel_Usuario varchar(15) not null,
 Status_Usuario varchar(30) not null,
 Telefone_Usuario varchar(16) not null
);

# Criando a tabela Avaliações para o Site dos Usuários
create table Avaliacoes(
 ID_Avaliacao int auto_increment primary key,
 ID_Usuario int not null,
 Nota_Avaliacao int not null,
 Data_Avaliacao date not null,
 Comentario_Avaliacao text not null,
 foreign key(ID_Usuario) references Usuarios(ID_Usuario)
);

# Criando a tabela Pedidos dos Usuários
create table Pedidos(
 ID_Pedido int auto_increment primary key,
 ID_Usuario int not null,
 SubTotal_Pedido double not null,
 Total_Pedido double not null,
 Desconto_Pedido double not null,
 Status_Pedido varchar(15) not null,
 Entrega_Necessaria boolean not null,
 Tipo_Pagamento varchar(20) not null,
 Tempo_Estipulado varchar(15),
 Hora_Inicio datetime not null,
 Hora_Fim datetime,
 Tempo_Gasto varchar(15),
 Endereco_Entrega varchar(100),
 foreign key(ID_Usuario) references Usuarios(ID_Usuario)
);

# Criando tabela de Produtos
create table Produtos(
 ID_Produto int auto_increment primary key,
 ID_Usuario int not null,
 Nome_Produto varchar(70) not null,
 Descricao_Produto text not null,
 Composicao_Produto text not null,
 Classe_Produto varchar(40) not null,
 Foto_Produto varchar(300) not null,
 Preco_Produto double not null,
 Qt_Adiquirida int not null,
 Qt_Vendida int not null,
 Qt_Estoque int generated always as (Qt_Adiquirida - Qt_Vendida) stored,
 foreign key(ID_Usuario) references Usuarios(ID_Usuario)
);

# Criando tabela para a Relação N para N de Pedidos e Produtos
create table Pedidos_Produtos(
 ID_Pedido int not null,
 ID_Produto int not null,
 Qt_Produto int not null,
 Observacao varchar(100),
 foreign key(ID_Pedido) references Pedidos(ID_Pedido),
 foreign key(ID_Produto) references Produtos(ID_Produto),
 constraint PK_PedProd primary key (ID_Pedido,ID_Produto)
);


# Inserindo usuario padrão (Funcionário) para o cadastro dos produtos
insert into Usuarios (Nome_Usuario, Senha_Usuario, Email_Usuario, Foto_Usuario, Nivel_Usuario, Status_Usuario, Telefone_Usuario) values ('Funcionário 1', '$10$xKWVIcCmDF0KqUWla9Tv3.FwWsLSdTRWiK24F7EXgb3X30/dRFKua', 'funcionariodiners1@gmail.com', 'usuario-n', 'funcionario', 'ativo', '(16) 98115-0536');
# Senha = p4$$0W0rb;

# Inserindo os Produtos padrões
insert into Produtos (ID_Usuario, Nome_Produto, Descricao_Produto, Composicao_Produto, Classe_Produto, Foto_Produto, Preco_Produto, Qt_Adiquirida, Qt_Vendida) values
(1, 'Diinernífico', 'Um hambúrguer digno dos paladares mais exigentes, uma verdadeira obra-prima.', 'Pão de brioche, hambúrguer de angus, queijo cheddar, bacon crocante, cebola crispy, alface, tomate, maionese de alho.', 'Burger', 'images/burgers/Burger1.png', 28, 100, 0),

(1, 'Diiner Tudo', 'Um delicioso hambúrguer para os gostos mais refinados e para os amantes de lanches artesanais.', 'Pão artesanal, carne, queijo, bacon, ovo, presunto, alface, tomate, cebola caramelizada, molho especial.', 'Burger', 'images/burgers/Burger2.png', 25, 100, 0),

(1, 'Burger Heaven', 'Para os apaixonados por bacon, uma explosão de sabor.', 'Pão, carne, queijo, bacon, alface, tomate, maionese.', 'Burger', 'images/burgers/Burger3.png', 18, 100, 0),

(1, 'Excellent Burgers', 'Perfeito para os amantes de ovos e lanches substanciais.', 'Pão, carne, queijo, ovo, alface, tomate, maionese.', 'Burger', 'images/burgers/Burger4.png', 20, 100, 0),

(1, 'All-In Burger', 'Para os que querem tudo em um só lanche, uma experiência completa.', 'Pão, carne, queijo, bacon, ovo, alface, tomate, maionese, milho, ervilha, batata palha.', 'Burger', 'images/burgers/Burger5.png', 21, 100, 0),

(1, 'Chicken Delight', 'Leve e saboroso, perfeito para os amantes de frango.', 'Pão, filé de frango, queijo, alface, tomate, maionese.', 'Burger', 'images/burgers/Burger6.png', 25, 100, 0),

(1, 'Veggie Kingdom', 'Uma opção deliciosa e sustentável para os vegetarianos.', 'Pão integral, hambúrguer vegano, queijo vegano, alface, tomate, cebola roxa, maionese vegana.', 'Burger', 'images/burgers/Burger7.png', 27, 100, 0),

(1, 'Prime Burger', 'Para os amantes de carnes nobres, uma experiência única.', 'Pão, hambúrguer de picanha, queijo, bacon, alface, tomate, maionese.', 'Burger', 'images/burgers/Burger8.png', 30, 100, 0),

(1, 'Burger Palace', 'Um clássico irresistível para qualquer ocasião.', 'Pão, carne, queijo, alface, tomate, maionese.', 'Burger', 'images/burgers/Burger9.png', 25, 100, 0),

(1, 'Refrigerante', 'Refrescante e delicioso.', 'Lata de refrigerante (Coca-Cola, Pepsi, Guaraná).', 'Bebida', 'images/bebidas/refrigerante.png', 5, 100, 0),

(1, 'Suco de Laranja', 'Opção saudável e refrescante.', 'Suco natural de laranja, limão ou morango.', 'Bebida', 'images/bebidas/suco.png', 7, 100, 0),

(1, 'Milkshake', 'Uma sobremesa em forma de bebida, perfeita para acompanhar seu lanche.', 'Milkshake de baunilha, chocolate ou morango', 'Sobremesa', 'images/sobremesas/milkshake.png', 10, 100, 0),

(1, 'Cerveja Artesanal', 'Perfeita para acompanhar seu hambúrguer gourmet.', 'Cerveja artesanal IPA, Lager ou Stout.', 'Bebida', 'images/bebidas/cervejaartesanal.png', 15, 100, 0),

(1, 'Frapuccino', 'A sobremesa perfeita para finalizar sua refeição.', 'Frapuccino de café, chocolate ou caramelo.', 'Sobremesa', 'images/sobremesas/frapuccino.png', 12, 100, 0),

(1, 'Sorvete', 'Deliciosamente doce e perfeito para os chocólatras.', 'Sorvete de chocolate ou flocos.', 'Sobremesa', 'images/sobremesas/sorvete.png', 9, 100, 0),

(1, 'Cerveja', 'Perfeita para acompanhar seu hambúrguer.', 'Long-neck de cerveja (Heineken, Stella, Colorado).', 'Bebida', 'images/bebidas/cerveja.png', 10, 100, 0),

(1, 'Água', 'A única que mata a sede de verdade.', 'Garrafa de água mineral (com ou sem gás).', 'Bebida', 'images/bebidas/agua.png', 4, 100, 0);

# Iserindo três Usuários padrões para a exibição de suas Avaliações
insert into Usuarios (Nome_Usuario, Senha_Usuario, Email_Usuario, Foto_Usuario, Nivel_Usuario, Status_Usuario, Telefone_Usuario) values 
('João', '$10$xKWVIcCmDF0KqUWla9Tv3.FwWsLSdTRWiK24F7EXgb3X30/dRFKua', 'joao@gmail.com', '1727647444256-497557413.jpg', 'cliente', 'ativo', '(16) 99999-9999'),
('Maria', '$10$xKWVIcCmDF0KqUWla9Tv3.FwWsLSdTRWiK24F7EXgb3X30/dRFKua', 'maria@gmail.com', '1727647505453-480266063.jpg', 'cliente', 'ativo', '(16) 88888-8888'),
('José', '$10$xKWVIcCmDF0KqUWla9Tv3.FwWsLSdTRWiK24F7EXgb3X30/dRFKua', 'jose@gmail.com', '1727647562426-777290197.jpg', 'cliente', 'ativo', '(16) 77777-7777');

# Senhas = p4$$0W0rb;

# Inserindo as suas avaliações
insert into Avaliacoes (ID_Usuario, Nota_Avaliacao, Data_Avaliacao, Comentario_Avaliacao) values
(2, 10, '2024-10-20', 'A melhor hamburgueria da cidade!'),
(3, 8, '2024-10-20', 'O atendimento é excelente!'),
(4, 7, '2024-10-20', 'Os lanches são maravilhosos!');