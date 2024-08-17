drop database diners_burguers;
create database Diners_Burguers;
use Diners_Burguers;

# Criando a tabel Usuários
create table Usuarios(
 ID_Usuario int auto_increment primary key,
 Nome_Usuario varchar(75) not null,
 Senha_Usuario varchar(300) not null,
 Email_Usuario varchar(256) not null,
 Foto_Usuario varchar(300) not null,
 Nivel_Usuario varchar(15) not null,
 Status_Usuario varchar(30) not null,
 End_CEP varchar(10) not null,
 End_Cidade varchar(70) not null,
 End_UF varchar(2) not null,
 End_Bairro varchar(110) not null,
 End_Rua varchar(70) not null,
 End_Numero int not null,
 End_Complemento varchar(60) null
);

# Criando a tabela 	Telefones dos Usuários
create table Telefones(
 ID_Telefone int auto_increment primary key,
 ID_Usuario int not null,
 Telefone varchar(16) not null,
 foreign key(ID_Usuario) references Usuarios(ID_Usuario)
);

# Criando a tabela Avaliações para o Site dos Usuários
create table Avaliacoes(
 ID_Avaliacao int auto_increment primary key,
 ID_Usuario int not null,
 Nota_Avaliacao int not null,
 Titulo_Avaliacao varchar(30) not null,
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
 Tempo_Estipulado varchar(15) not null,
 Hora_Inicio datetime not null,
 Hora_Fim datetime,
 Tempo_Gasto varchar(15),
 foreign key(ID_Usuario) references Usuarios(ID_Usuario)
);

# Criando tabela de Produtos
create table Produtos(
 ID_Produto int auto_increment primary key,
 ID_Usuario int not null,
 Nome_Produto varchar(70) not null,
 Descricao_Produto text not null,
 Classe_Produto varchar(40) not null,
 Foto_Produto varchar(300) not null,
 Qt_Adiquirida int not null,
 Qt_Vendida int not null,
 Qt_Estoque int generated always as (Qt_Adiquirida - Qt_Vendida) stored,
 foreign key(ID_Usuario) references Usuarios(ID_Usuario)
);

# Criando tabela de Tamanhos de Produtos
create table Tamanhos(
 ID_Tamanho int auto_increment primary key,
 ID_Produto int not null,
 Descricao_Tamanho varchar(30) not null,
 Preco_Tamanho double not null,
 foreign key(ID_Produto) references Produtos(ID_Produto)
);

# Criando tabela para a Relação N para N de Pedidos e Produtos
create table Pedidos_Produtos(
 ID_Pedido int not null,
 ID_Produto int not null,
 ID_Tamanho int not null,
 Qt_Produto int not null,
 Valor_Produto double not null,
 foreign key(ID_Tamanho) references Tamanhos(ID_Tamanho),
 foreign key(ID_Pedido) references Pedidos(ID_Pedido),
 foreign key(ID_Produto) references Produtos(ID_Produto),
 constraint PK_PedProd primary key (ID_Pedido,ID_Produto)
);

# Criando a tabela de Descontos
create table Descontos(
 ID_Desconto int auto_increment primary key,
 Nome_Desconto varchar(70) not null,
 Descricao_Desconto text not null,
 Aplicacao_Desconto varchar(15) not null,
 Requisito_Ativar double not null,
 Valor_Desconto double not null,
 Percentual_Fixo boolean not null,
 Data_Inicio date not null,
 Data_Termino date not null,
 Desconto_Ativado boolean not null
);

# Criando a tabela para a relação N para N das tabelas Descontos e Produtos
create table Produtos_Descontos(
 ID_Desconto int not null,
 ID_Produto int not null,
 foreign key(ID_Desconto) references Descontos(ID_Desconto),
 foreign key(ID_Produto) references Produtos(ID_Produto),
 constraint PK_ProdDesc primary key (ID_Desconto,ID_Produto)
);

# Criando a tabela de Ingredientes dos Produtos
create table Ingredientes(
 ID_Ingrediente int auto_increment primary key,
 ID_Usuario int not null,
 Nome_Ingrediente varchar(70) not null,
 Unidade_Medida varchar(3) not null,
 Qt_Comprada int not null,
 Qt_Usada int not null,
 Qt_Estoque int generated always as (Qt_Comprada - Qt_Usada) stored
);

# Criando a tabela para a relação N para N das tabelas Produtos e Ingredientes
create table Produtos_Ingredientes(
 ID_Ingrediente int not null,
 ID_Produto int not null,
 foreign key(ID_Ingrediente) references Ingredientes(ID_Ingrediente),
 foreign key(ID_Produto) references Produtos(ID_Produto),
 constraint PK_ProdIngre primary key (ID_Ingrediente,ID_Produto)
);

# Criando a tabela Carrinhos do Usuário
create table Carrinhos(
 ID_Carrinho int auto_increment primary key,
 ID_Usuario int not null,
 Nome_Carrinho varchar(30) not null,
 foreign key(ID_Usuario) references Usuarios(ID_Usuario)
);

# Criando a tabela para a relação N para N das tabelas Carrinhos e Produtos
create table Produtos_Carrinhos(
 ID_Carrinho int not null,
 ID_Produto int not null,
 Qt_Produto int not null,
 foreign key(ID_Carrinho) references Carrinhos(ID_Carrinho),
 foreign key(ID_Produto) references Produtos(ID_Produto),
 constraint PK_ProdCar primary key (ID_Carrinho,ID_Produto)
);

# Criando a tabela de Favoritos
create table Favoritos(
 ID_Usuario int not null,
 ID_Produto int not null,
 foreign key(ID_Usuario) references Usuarios(ID_Usuario),
 foreign key(ID_Produto) references Produtos(ID_Produto),
 constraint PK_ProdCar primary key (ID_Usuario,ID_Produto)
);