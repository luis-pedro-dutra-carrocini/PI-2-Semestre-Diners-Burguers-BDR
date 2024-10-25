// ---- Requizições de Bibliotecas ----
// Requerindo o express
const express = require('express');

// Requerindo o arquivo conexao com seus dados
const conexao = require('./conexao');

// Requerindo o bcrypt
const bcrypt = require('bcrypt');

// Requerindo Express-Session para o controle de sessões do navegador
const session = require('express-session');

// Requerindo multer e path (upload de arquivos no servidor)
const multer = require('multer');

// Requirindo fs
const fs = require('fs');

// Requirindo path
const path = require('path');

// Requirindo console
const { error } = require('console');

// Requirindo cors
const cors = require('cors');

// Requirindo axios
const axios = require('axios');


// Configurações de Funções
const app = express();
app.use(express.json());

// Configurando Sessãoes
app.use(session({
    secret: 'sua-chave-secreta',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Use secure: true se estiver usando HTTPS
}));

// Servir arquivos estáticos (HTML, JS, CSS)
app.use(express.static('public'));

// Servindo a pasta de imagens
app.use('/public/imagens/usuarios', express.static('public/imagens/usuarios'));

app.use(cors());

// Configuração do multer para armazenar as imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/imagens/usuarios/'); // Pasta onde as imagens serão armazenadas
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nome único para cada arquivo
    }
});

// Função Upload
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos'));
        }
    }
});

// Criando uma variavel para guardar a senha criptografada e cadastrada, para ser comparada em outras ocasiões
var senha_cadastrada = "";

// Criando uma variável para guardar a ultima foto
var fotoUsuOriginal = "";


// ---- Funções/API's ---- //

// API para verificar se o email já está cadastrado no banco de dados (Página Cadastrar, Login e Alterar Dados Usuário)
app.post('/verificar-email', (req, res) => {
    const { email } = req.body;

    conexao.query('SELECT Email_Usuario FROM Usuarios WHERE Email_Usuario = ?;', [email], (err, results) => {
        if (err) {
            console.error('Erro ao obter os dados do Usuário:', err);
            return res.status(500).json({ message: 'Erro ao obter os dados do Usuário.' });
        }

        if (results.length > 0) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    });
});


// API para cadastrar o Usuário com upload de imagem (Página Cadastrar Usuário)
app.post('/cadastrar-usuario', upload.single('foto_usuario'), async (req, res) => {
    
    const { nome, email, telefone, senha_cadastro } = req.body;

    const nivel = 'cliente';
    const status = 'ativo';
    
    const foto = req.file ? req.file.filename : null;

    try {

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha_cadastro, saltRounds);

        const cadastrarUsu = 'INSERT INTO Usuarios (Nome_Usuario, Email_Usuario, Senha_Usuario, Foto_Usuario, Nivel_Usuario, Status_Usuario, Telefone_Usuario) VALUES (?,?,?,?,?,?,?);';

        const inserirUsuario = await new Promise((resolve, reject) => {
            conexao.query(cadastrarUsu, [nome, email, senhaHash, foto, nivel, status, telefone], (err, results) => {
                if (err) {
                    console.error('Erro no Cadastro do Usuário:', err);
                    return res.status(500).json({ message: 'Erro no Cadastro do Usuário.' });
                }
                resolve(results.insertId);
            });
        });

        const ID_Usuario = inserirUsuario;

        // Iniciando a sessão
        req.session.clienteID = ID_Usuario;

        // Redirecionando para a página "home_usuario.html"
        return res.redirect('/home_cliente.html');

    } catch (error) {
        console.error('Erro no Cadastro do Usuário:', err);
        return res.status(500).json({ message: 'Erro no Cadastro do Usuário.' });
    }
});


// API para verificar o Login (Página Login)
app.post('/verificar-login', async (req, res) => {
    const { email, senha } = req.body;

    console.log(email);
    console.log(senha);

    // Inicialize o contador de tentativas e tempo de espera na sessão, se ainda não existir
    if (!req.session.tentativas) {
        req.session.tentativas = 0;
    }

    if (!req.session.bloqueio) {
        req.session.bloqueio = null;
    }

    // Definindo limite de tentaivas
    const limiteTentativas = 5;

    // Definindo o tempo de espera após 5 tentativas erradas (30 Minutos em Milisegundos)
    const tempoBloqueio = 30 * 60 * 1000;

    // Obtendo o exato momento
    const agora = Date.now();

    // Verificando se o Usuário está bloqueado
    if (req.session.bloqueio && agora < req.session.bloqueio) {

        // Tempo restante
        const tempoRestante = Math.ceil((req.session.bloqueio - agora) / 1000 / 60);

        return res.status(200).json({ validacao: false, tentativas: "bloqueado", tempo: tempoRestante });

    }

    // Verificando se o número de tentativas excedeu o limite
    if (req.session.tentativas >= limiteTentativas - 1) {
        req.session.bloqueio = agora + tempoBloqueio;
        req.session.tentativas =  0;
        return res.status(200).json({ validacao: false, tentativas: "bloqueado", tempo: 30 });
    }

    conexao.query('SELECT ID_Usuario, Senha_Usuario FROM Usuarios WHERE Email_Usuario = ?;', [email], async (err, results) => {

        // Verificando se não houve um erro na consulta
        if (err) {
            console.error('Erro ao obter os dados do Usuário:', err);
            return res.status(500).json({ message: 'Erro ao obter os dados do Usuário.' });
        }

        // Caso o email esteja cadastrado no BD
        if (results.length > 0) {

            // Obtendo a senha criptografada cadastrada
            const senha_bd = results[0].Senha_Usuario;

            // Obtendo o ID do Usuário
            const  ID_Usuario = results[0].ID_Usuario;

            // Verificando se as senhas são iguais
            const resultado = await bcrypt.compare(senha, senha_bd);

            if (resultado === true) {

                console.log('Login Validado');

                // Zerando o contador de tentativas
                req.session.tentativas = 0;

                // Iniciando a sessão com o ID do Usuário
                req.session.clienteID = ID_Usuario;

                
                console.log(req.session.clienteID);

                return res.status(200).json({ validacao: true });

            }else{

                // Adicionando no contador de tentativas
                req.session.tentativas += 1;

                if (req.session.tentativas === limiteTentativas - 1) {
                    return res.status(200).json({ validacao: false, tentativas: "limite" });
                }else{
                    return res.status(200).json({ validacao: false });
                }

            }
            
        } else {
            return res.status(200).json({ validacao: 0 });
        }
    });
});


// API para validar se a sessão foi iniciada (Todas as Páginas em que o Usuário precisa estar Logado)
app.post('/verificar-sessao', (req, res) => {

    console.log(req.session.clienteID);
    
    // Verificando se o ID do cliente existe na sessão
    if (req.session.clienteID) {
        console.log('Sessão Validada');

        // Buscando os dados relacionados ao ID
        conexao.query('SELECT * FROM Usuarios WHERE ID_Usuario = ?', [req.session.clienteID], (err, results) => {
            // Verificando se houve um erro na consulta
            if (err) {
                console.error('Erro ao buscar Usuário para validação:', err);
                return res.status(500).json({ message: 'Erro ao buscar Usuário para validação.' });
            }

            // Verificando se o ID do Usuário realmente existe
            if (results.length > 0) {

                return res.status(200).json({ sessaoIniciada: true, clienteID: req.session.clienteID });
                
            } else {
                console.log('Cliente não cadastrado!');
                return res.status(401).json({ message: 'Cliente não cadastrado!' });
            }
        });

    } else {
        console.log('Sessão Não Validada');
        return res.status(200).json({ sessaoIniciada: false });
    }
});


// API para buscar os dados do cliente (Página Alterar Dados Usuário)
app.post('/buscar-dados-cliente', async (req, res) => {

    console.log('Chegou Busca');

    try {
        // Chama a API de verificação de sessão
        const verificarSessaoResponse = await axios.post('http://localhost:3000/verificar-sessao', {}, {
            headers: {
                Cookie: req.headers.cookie // Passando os cookies da sessão
            }
        });

        const sessaoIniciada = verificarSessaoResponse.data.sessaoIniciada;

        if (!sessaoIniciada) {
            console.log('Sessão não iniciada!');
            return res.status(401).json({ message: 'Sessão não iniciada!' });
        }

        // Obtendo o ID do Cliente da resposta de verificação de sessão
        const ID_Cliente = verificarSessaoResponse.data.clienteID;

        console.log(ID_Cliente);

        // Buscando os dados relacionados ao ID
        conexao.query('SELECT * FROM Usuarios WHERE ID_Usuario = ?', [ID_Cliente], (err, results) => {
            // Verificando se houve um erro na consulta
            if (err) {
                console.error('Erro ao buscar os dados do Usuário:', err);
                return res.status(500).json({ message: 'Erro ao buscar os dados do Usuário.' });
            }

            // Verificando se o ID do Usuário realmente existe
            if (results.length > 0) {

                // Obtendo a senha do Usuário Cadastrado
                senha_cadastrada = results[0].Senha_Usuario;

                // Obtendo a foto original
                fotoUsuOriginal = results[0].Foto_Usuario;

                // Retornando os dados do cliente para a exibição
                return res.status(200).json({
                    existe: true,
                    nome: results[0].Nome_Usuario,
                    email: results[0].Email_Usuario,
                    foto: results[0].Foto_Usuario,
                    telefone: results[0].Telefone_Usuario
                });
            } else {
                console.log('Cliente não cadastrado!');
                return res.status(401).json({ message: 'Cliente não cadastrado!' });
            }
        });
    } catch (error) {
        console.error('Erro ao verificar a sessão:', error);
        return res.status(500).json({ message: 'Erro ao verificar a sessão.' });
    }
});



// API para sair da conta (Todas as Páginas)
app.post('/sair-conta', (req, res) => {

    // Apagando a senha
    senha_cadastrada = "";

    // Destrói a sessão do usuário
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao encerrar a Sessão:', err);
            return res.status(500).json({ message: 'Erro ao encerrar a Sessão.' });
        }

        // Limpando cookies da sessão
        res.clearCookie('connect.sid');

        // Redireciona para a página de login ou envia uma resposta de sucesso
        res.status(200).json({ resultado: true });
    });
});


// API para comparar as senha antes de altera-la (Página Alterar Dados Usuário)
app.post('/comparar-senhas', async (req, res) => {

    // Obtendo a senha a ser comparada
    const { senha_atual } = req.body;

    // Verificando se as senhas são iguais
    const resultado = await bcrypt.compare(senha_atual, senha_cadastrada);

    if (resultado === true){
        res.status(200).json({ resultado: true });
    }else{
        res.status(200).json({ resultado: false });
    }

});


// API para alterar os dados do Usuário com upload de imagem (Página Alterar Dados Usuário)
app.post('/alterar-dados-usuario', upload.single('foto_usuario'), async (req, res) => {

    // Obtendo os dados do Formulário
    const { nome, email, telefone, senha_nova, alterar_senha, senha_atual, img_removida } = req.body;

    let senha_usuario = senha_nova;

    // Mantém a senha atual caso o usuário não queira alterar
    if (alterar_senha !== "sim") {
        senha_usuario = senha_atual;
    }

    // Obtendo o ID do Cliente da sessão
    const ID_Cliente = req.session.clienteID;

    try {
        // Obtendo a senha original e a foto do usuário
        const userQuery = 'SELECT Senha_Usuario, Foto_Usuario FROM Usuarios WHERE ID_Usuario = ?';
        const [user] = await new Promise((resolve, reject) => {
            conexao.query(userQuery, [ID_Cliente], (err, results) => {
                if (err) {
                    console.error('Erro ao obter os dados do usuário para a alteração:', err);
                    return res.status(500).json({ message: 'Erro ao obter os dados do usuário para a alteração.' });
                }
                resolve(results);
            });
        });

        // Se nenhuma nova foto foi enviada, mantemos a foto original
        let foto = req.file ? req.file.filename : user.Foto_Usuario;

        // Verificando se o usuário removeu a imagem (caso 'img_removida' seja '1')
        if (img_removida === '1') {
            foto = "usuario-n.png";
        }

        // Caso tenha sido enviada uma nova imagem e a imagem antiga não seja a padrão
        if (user.Foto_Usuario !== foto && user.Foto_Usuario !== "usuario-n.png") {
            const oldImagePath = path.join(__dirname, 'public/imagens/usuarios', user.Foto_Usuario);

            // Verifica se o arquivo existe antes de tentar excluí-lo
            if (fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error(`Erro ao excluir a imagem antiga: ${oldImagePath}`, err);
                    } else {
                        console.log(`Imagem antiga excluída com sucesso: ${oldImagePath}`);
                    }
                });
            }
        }

        // Criptografando a senha, se for alterada
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha_usuario, saltRounds);

        // Query para alterar os dados do usuário
        const alterarUsu = 'UPDATE Usuarios SET Nome_Usuario = ?, Senha_Usuario = ?, Email_Usuario = ?, Foto_Usuario = ?, Telefone_Usuario = ? WHERE ID_Usuario = ?;';

        // Alterando os dados do usuário
        await new Promise((resolve, reject) => {
            conexao.query(alterarUsu, [nome, senhaHash, email, foto, telefone, ID_Cliente], (err, results) => {
                if (err) {
                    console.error('Erro ao alterar os dados do Usuário:', err);
                    return res.status(500).json({ message: 'Erro ao alterar os dados do Usuário.' });
                }
                resolve(results);
            });
        });

        // Redireciona para a página de dados do cliente após o sucesso
        return res.redirect('/dados_cliente.html');

    } catch (err) {
        console.error('Erro ao alterar os dados do Usuário:', err);
        return res.status(500).json({ message: 'Erro ao alterar os dados do Usuário.' });
    }
});


// API para excluir a conta do Usuário (Aterar dados Cliente)
app.post('/excluir-conta', async (req, res) => {

    // Obtendo o ID do Cliente da sessão
    const ID_Cliente = req.session.clienteID;

    // Obtendo a foto do usuário
    const userQuery = 'SELECT Foto_Usuario FROM Usuarios WHERE ID_Usuario = ?';
    const [user] = await new Promise((resolve, reject) => {
        conexao.query(userQuery, [ID_Cliente], (err, results) => {
            if (err) {
                console.error('Erro ao obter a Foto do Usuário:', err);
                return res.status(500).json({ message: 'Erro ao obter a Foto do Usuário.' });
            }
            resolve(results);
        });
    });

    // Deletando a imagem do usuário
    const oldImagePath = path.join(__dirname, 'public/imagens/usuarios', user.Foto_Usuario);

    // Verifica se o arquivo existe antes de tentar excluí-lo
    if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
            if (err) {
                console.error(`Erro ao excluir a imagem antiga: ${oldImagePath}`, err);
            } else {
                console.log(`Imagem antiga excluída com sucesso: ${oldImagePath}`);
            }
        });
    }

    // Deletando o usuário
    const excluirQuery = 'DELETE FROM Usuarios where ID_Usuario = ?;';
        const excluir = await new Promise((resolve, reject) => {
            conexao.query(excluirQuery, [ID_Cliente], (err, results) => {
                if (err){
                    console.error('Erro ao excluir a conta:', err);
                    return res.status(500).json({ message: 'Erro ao excluir a conta.' });
                }
                resolve(results);
            });
        });

    res.status(200).json({ excluiu: true }); 

});

// API para cadastrar o pedido do cliente
app.post('/cadastrar-pedido', async (req, res) => {

    // Obtendo o ID do Cliente da sessão
    const ID_Cliente = req.session.clienteID;

    // Verificando se a sessão está iniciada
    if (ID_Cliente == undefined) {
        console.log('Sessão não iniciada. Redirecionando para login.html');
        return res.status(200).json({ message: 'Sessão não Iniciada.' });
    }

    // Obtendo os dados do pedido enviados
    const {entregaNecessaria, tipoPagamento, idProdutosPedidos, quantProdutos} = req.body;

    let subTotaPedido = 0;
    let desconto = 0;

    // Criando um loop para obter todos os produtos cadastrados com os seus preços e calcular a conta
    for (let i = 0; i < idProdutosPedidos.length; i++){

        const buscaProduto = 'SELECT Preco_Produto FROM Produtos WHERE ID_Produto = ?;';

        await new Promise((resolve, reject) => {
            conexao.query(buscaProduto, [idProdutosPedidos[i]], (err, results) => {
                    if (err) {
                        console.error('Erro ao buscar preço do produto:', err);
                        return res.status(500).json({ message: 'Erro ao buscar preço do produto.' });
                    }
                    
                    if (results.length > 0){
                        subTotaPedido += Number(results[0].Preco_Produto) * Number(quantProdutos[i]);
                    }

                    resolve(results);
            });
        });
    }

    // Atriibuindo valores padrões para o cadastro de pedidos
    const horaInicio = new Date();

    let totalPedido = subTotaPedido - desconto;

    const cadastarPedido = 'INSERT INTO Pedidos (ID_Usuario, SubTotal_Pedido, Total_Pedido, Desconto_Pedido, Status_Pedido, Entrega_Necessaria, Tipo_Pagamento, Hora_Inicio) VALUES (?,?,?,?,?,?,?,?);';

    // Cadsatrando o pedido e obtendo o seu ID
    const idPedido = await new Promise((resolve, reject) => {
        conexao.query(cadastarPedido, [ID_Cliente, subTotaPedido, totalPedido, desconto, 'Enviado', entregaNecessaria, tipoPagamento, horaInicio], (err, results) => {
            if (err) {
                console.error('Erro ao cadastrar pedido:', err);
                return res.status(500).json({ message: 'Erro ao cadastrar pedido.' });
            }
            resolve(results.insertId);
        });
    });

    // Criando um loop para cadastrar todos os intens do pedido
    for (let i = 0; i < idProdutosPedidos.length; i++){

        // Validação para ver se o código do produto existe na tabela de produtos
        const verificaProduto = 'SELECT COUNT(*) AS count FROM Produtos WHERE ID_Produto = ?';

        const produtoExiste = await new Promise((resolve, reject) => {
            conexao.query(verificaProduto, [idProdutosPedidos[i]], (err, results) => {
                if (err) {
                    console.error('Erro ao buscar produto:', err);
                    return res.status(500).json({ message: 'Erro ao buscar produto.' });
                }
                resolve(results[0].count > 0);
            });
        });
    
        if (!produtoExiste) {
            console.error(`Produto com ID_Produto = ${idProdutosPedidos[i]} não existe na tabela Produtos.`);
            return res.status(500).json({ message: 'Produto com ID_Produto = ${idProdutosPedidos[i]} não existe na tabela Produtos.' });
        }

        const cadasIntensPedido = 'INSERT INTO Pedidos_Produtos (ID_Pedido, ID_Produto, Qt_Produto) VALUES (?,?,?);';

        await new Promise((resolve, reject) => {
            conexao.query(cadasIntensPedido, [idPedido, idProdutosPedidos[i], quantProdutos[i]], (err, results) => {
                    if (err) {
                        console.error('Erro ao cadastrar itens do pedido:', err);
                        return res.status(500).json({ message: 'Erro ao cadastrar itens do pedido.' });
                    }
                    resolve(results);
            });
        });
    }

    return res.status(200).json({ enviado: true });

});

// API para buscaar os pedidos cadastrados dos Clientes
app.post('/buscar-pedidos-clientes', async (req, res) => {

    try {
        // Chama a API de verificação de sessão
        const verificarSessaoResponse = await axios.post('http://localhost:3000/verificar-sessao', {}, {
            headers: {
                Cookie: req.headers.cookie // Passando os cookies da sessão
            }
        });

        const sessaoIniciada = verificarSessaoResponse.data.sessaoIniciada;

        // Valida a sessão
        if (!sessaoIniciada) {
            console.log('Sessão não iniciada!');
            return res.status(401).json({ message: 'Sessão não iniciada!' });
        }

        // Obtendo o ID do Cliente da resposta de verificação de sessão
        const ID_Cliente = verificarSessaoResponse.data.clienteID;

        // Buscando os pedidos do Cliente no BD
        const buscaPedidos = 'SELECT * FROM Pedidos WHERE ID_Usuario = ?;';

        const pedidosCliente = await new Promise((resolve, reject) => {
            conexao.query(buscaPedidos, [ID_Cliente], (err, results) => {
                    if (err) {
                        console.error('Erro ao buscar os pedidos:', err);
                        return res.status(500).json({ message: 'Erro ao buscar os pedidos.' });
                    }
                    resolve(results);
            });
        });

        // Mapeia os resultados para um array de objetos no formato desejado
        const pedidos = pedidosCliente.map(pedido => ({
            id: pedido.ID_Pedido,
            subTotal: pedido.SubTotal_Pedido,
            total: pedido.Total_Pedido,
            desconto: pedido.Desconto_Pedido,
            status: pedido.Status_Pedido,
            entrega: pedido.Entrega_Necessaria,  
            pagamento: pedido.Tipo_Pagamento,
            tempoEstipulado: pedido.Tempo_Estipulado,  
            inicio: pedido.Hora_Inicio,  
            fim: pedido.Hora_Fim,  
            tempoGasto: pedido.Tempo_Gasto  
        }));

        // Retornando os pedidos
        console.log(pedidos);
        return res.status(200).json(pedidos);

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return res.status(500).json({ message: 'Erro ao buscar pedidos.' });
    }

});


// API para buscar os produtos, a fim de mostrá-los no menu
app.post('/buscar-produtos', async (req, res) => {

    // Obtendo o tipo de busca, verificando se é para buscar todos os produtos ou os três mais vendidos
    const { tipoBusca } = req.body;

    // Verifica o tipo de busca, afim de saber se é para mostrar todos os produtos do menu ou para motrar somente os três Burgers mais vendidos.
    if (tipoBusca == 'Todos') {

        // Selecionando todos os produtos para a exibição no menu
        const buscaProdutos = 'SELECT ID_Produto, Nome_Produto, Foto_Produto, Classe_Produto, Descricao_Produto, Composicao_Produto, Preco_Produto FROM Produtos;';

        try {

            // Realizando a busca
            const results = await new Promise((resolve, reject) => {
                conexao.query(buscaProdutos, (err, results) => {
                    if (err) {
                        console.error('Erro ao buscar os produtos:', err);
                        return res.status(500).json({ message: 'Erro ao buscar os produtos.' });
                    }

                    resolve(results);
                });
            });

            // Verificando se há pelo menos um rpoduto cadastrado
            if (results.length > 0) {

                // Mapeia os resultados para um array de objetos no formato desejado
                const produtos = results.map(produto => ({
                    id: produto.ID_Produto,
                    name: produto.Nome_Produto,
                    image: produto.Foto_Produto,
                    category: produto.Classe_Produto,
                    description: produto.Composicao_Produto,
                    tipo: produto.Descricao_Produto,  
                    price: produto.Preco_Produto
                }));

                console.log(produtos);

                // Envia a lista de produtos no formato correto para o cliente
                return res.status(200).json(produtos);
            } else {

                // retornando erro pois não há nenhum produto cadastrado
                console.log('Nenhum produto encontrado.');
                return res.status(404).json({ message: 'Nenhum produto encontrado.' });
            }


        //  Erro ao buscar no BD
        } catch (error) {
            console.error('Erro ao buscar os produtos:', error);
            return res.status(500).json({ message: 'Erro ao buscar os produtos.' });
        }

    
    // Buscando os três Burgers mais vendidos para exibi-los na página incial
    }else if (tipoBusca == 'Burgers Mais Vendidos'){

        // Obtendo os ID's dos três Burgers mais vendidos
        const produtosMaisVendidos = 'SELECT p.ID_Produto, SUM(pp.Qt_Produto) AS TotalVendido FROM Pedidos_Produtos pp JOIN Produtos p ON pp.ID_Produto = p.ID_Produto WHERE p.Classe_Produto = "Burger" GROUP BY p.ID_Produto ORDER BY TotalVendido DESC LIMIT 3;';

        try {

            // Realizando a busca
            const results = await new Promise((resolve, reject) => {
                conexao.query(produtosMaisVendidos, (err, results) => {
                    if (err) {
                        console.error('Erro ao buscar os Burgers mais vendidos:', err);
                        return res.status(500).json({ message: 'Erro ao buscar os Burgers mais vendidos.' });
                    }

                    resolve(results);
                });
            });


            // Verificando se há ao menos 3 Burgers para serem exibidos, caso contrário exibirá três aleatórios
            if (results.length >= 3) {

                const buscaProdutos = 'SELECT Nome_Produto, Foto_Produto, Composicao_Produto, Preco_Produto FROM Produtos WHERE ID_Produto = 3 or ID_Produto = 2 or ID_Produto = 8 LIMIT 3;';

                try {
                    const results = await new Promise((resolve, reject) => {
                        conexao.query(buscaProdutos, (err, results) => {
                            if (err) {
                                console.error('Erro ao buscar os Burgers mais vendidos:', err);
                                return res.status(500).json({ message: 'Erro ao buscar os Burgers mais vendidos.' });
                            }

                            resolve(results);
                        });
                    });

                    if (results.length >= 3) {

                        // Mapeia os resultados para um array de objetos no formato desejado
                        const produtos = results.map(produto => ({
                            name: produto.Nome_Produto,
                            image: produto.Foto_Produto,
                            description: produto.Composicao_Produto,
                            price: produto.Preco_Produto
                        }));

                        console.log(produtos);

                        // Envia a lista de produtos no formato correto para o cliente
                        return res.status(200).json(produtos);
                    } else {
                        console.log('Nenhum Burguer encontrado.');
                        return res.status(404).json({ message: 'Nenhum Burguer encontrado.' });
                    }

                } catch (error) {
                    console.error('Erro ao buscar os Burgers mais vendidos:', error);
                    return res.status(500).json({ message: 'Erro ao buscar os Burgers mais vendidos.' });
                }
            
            // Buscando três Burgers aleatórios para exibi-los, já que não tem os três mais vendidos
            } else {
                
                const buscaProdutos = 'SELECT Nome_Produto, Foto_Produto, Composicao_Produto, Preco_Produto FROM Produtos WHERE Classe_Produto = "Burger" LIMIT 3;';

                try {
                    const results = await new Promise((resolve, reject) => {
                        conexao.query(buscaProdutos, (err, results) => {
                            if (err) {
                                console.error('Erro ao buscar os Burgers mais vendidos', err);
                                return res.status(500).json({ message: 'Erro ao buscar os Burgers mais vendidos.' });
                            }

                            resolve(results);
                        });
                    });

                    // Verificanndo se há pelo menos 3
                    if (results.length >= 3) {

                        // Mapeia os resultados para um array de objetos no formato desejado
                        const produtos = results.map(produto => ({
                            name: produto.Nome_Produto,
                            image: produto.Foto_Produto,
                            description: produto.Composicao_Produto,
                            price: produto.Preco_Produto
                        }));

                        console.log(produtos);

                        // Envia a lista de produtos no formato correto para o cliente
                        return res.status(200).json(produtos);
                    } else {
                        console.log('Burgers mais vendidos menor do que 3.');
                        return res.status(404).json({ message: 'Burgers mais vendidos menor do que 3.' });
                    }

                } catch (error) {
                    console.error('Erro ao buscar os Burgers mais vendidos:', error);
                    return res.status(500).json({ message: 'Erro ao buscar os Burgers mais vendidos.' });
                }
                
            }

        } catch (error) {
            console.error('Erro ao processar a busca de produtos mais vendidos:', error);
            return res.status(500).json({ message: 'Erro ao buscar os Burgers mais vendidos.' });
        }
    }
});


// API para buscar as melhores avaliações dos Clientes
app.post('/buscar-avaliacoes', async (req, res) => {

    // Obtendo o tipo de busca, verificando se é para buscar todos os produtos ou os três mais vendidos
    const { tipoBusca } = req.body;

    // Verifica o tipo de busca, afim de saber se é para mostrar todos os produtos do menu ou para motrar somente os três Burgers mais vendidos.
    if (tipoBusca == '3 Melhores') {

        // Selecionando todos os produtos para a exibição no menu
        const buscaAvaliacoes = 'SELECT ID_Usuario, Nota_Avaliacao, Data_Avaliacao, Comentario_Avaliacao FROM Avaliacoes ORDER BY Nota_Avaliacao DESC LIMIT 3;';

        try {

            // Realizando a busca
            const results = await new Promise((resolve, reject) => {
                conexao.query(buscaAvaliacoes, (err, results) => {
                    if (err) {
                        console.error('Erro ao buscar as avaliações dos Usuários:', err);
                        return res.status(500).json({ message: 'Erro ao buscar as avaliações dos Usuários.' });
                    }
                    resolve(results);
                });
            });

            const buscaClientes =  'SELECT Nome_Usuario, Foto_Usuario FROM Usuarios WHERE ID_Usuario = ? OR ID_Usuario = ? OR ID_Usuario = ?;';

            const resultsClientes = await new Promise((resolve, reject) => {
                conexao.query(buscaClientes, [results[0].ID_Usuario, results[1].ID_Usuario, results[2].ID_Usuario], (err, resultsClientes) => {
                    if (err) {
                        console.error('Erro ao buscar os dados dos Clientes:', err);
                        return res.status(500).json({ message: 'Erro ao buscar os dados dos Clientes.' });
                    }
                    resolve(resultsClientes);
                });
            });

            // Verificando se há pelo menos três avaliações cadastradas
            if (results.length >= 3) {

                // Mapeia os resultados das avaliações para um array de objetos no formato desejado
                const avaliacoes = results.map(avaliacao => ({
                    nota: avaliacao.Nota_Avaliacao,
                    data: avaliacao.Data_Avaliacao,
                    comentario: avaliacao.Comentario_Avaliacao
                }));

                // Mapeia os dados do cliente para um array de objetos no formato desejado
                const dadosClientes = resultsClientes.map(cliente => ({
                    nome: cliente.Nome_Usuario,
                    foto: cliente.Foto_Usuario
                }));

                // Envia a lista de avaliações no formato correto para o cliente
                return res.status(200).json({ avaliacoes: avaliacoes, dadosClientes: dadosClientes});
            } else {

                // retornando erro pois não há nenhum produto cadastrado
                console.log('Nenhum avaliação encontrada.');
                return res.status(404).json({ message: 'Nenhum avaliação encontrada.' });
            }

        } catch (error) {
            console.error('Erro ao processar a busca de produtos:', error);
            return res.status(500).json({ message: 'Erro ao buscar os produtos.' });
        }
    }
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});