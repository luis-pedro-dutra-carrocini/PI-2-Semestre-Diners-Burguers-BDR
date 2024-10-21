let cart = [];
let modalQt = 1;
let modalKey = 0;

// Listagem dos Produtos
produtosJson.map((item, index)=>{
    let produtoItem = document.querySelector('.models .produto-item').cloneNode(true);
    
    produtoItem.setAttribute('data-key', index);
    produtoItem.querySelector('.produto-item--img img').src = item.img;
    produtoItem.querySelector('.produto-item--price').innerHTML = `R$ ${item.price[2].toFixed(2)}`;
    produtoItem.querySelector('.produto-item--name').innerHTML = item.name;
    produtoItem.querySelector('.produto-item--desc').innerHTML = item.description;
    
    produtoItem.querySelector('a').addEventListener('click', (e)=>{
        e.preventDefault();
        let key = e.target.closest('.produto-item').getAttribute('data-key');
        modalQt = 1;
        modalKey = key;

        document.querySelector('.produtoBig img').src = produtosJson[key].img;
        document.querySelector('.produtoInfo h1').innerHTML = produtosJson[key].name;
        document.querySelector('.produtoInfo--desc').innerHTML = produtosJson[key].description;
        document.querySelector('.produtoInfo--actualPrice').innerHTML = `R$ ${produtosJson[key].price[2].toFixed(2)}`;
        document.querySelector('.produtoInfo--size.selected').classList.remove('selected');
        document.querySelectorAll('.produtoInfo--size').forEach((size, sizeIndex)=>{
            if(sizeIndex == 2) {
                size.classList.add('selected');
            }
            size.querySelector('span').innerHTML = produtosJson[key].sizes[sizeIndex];
        });

        document.querySelector('.produtoInfo--qt').innerHTML = modalQt;

        document.querySelector('.produtoWindowArea').style.opacity = 0;
        document.querySelector('.produtoWindowArea').style.display = 'flex';
        setTimeout(()=>{
            document.querySelector('.produtoWindowArea').style.opacity = 1;
        }, 200);
    });

    if (item.classe == "Burguer"){
        document.querySelector('.burgers-area').append( produtoItem );
    }else if (item.classe == "Bebida"){
        document.querySelector('.bebidas-area').append( produtoItem );
    }else if (item.classe == "Sobremesa"){
        document.querySelector('.sobremesas-area').append( produtoItem );
    }
    
});

// Eventos do MODAL
function closeModal() {
    document.querySelector('.produtoWindowArea').style.opacity = 0;
    setTimeout(()=>{
        document.querySelector('.produtoWindowArea').style.display = 'none';
    }, 500);
}
function MenosUm(){
    if(modalQt > 1) {
        modalQt--;
        document.querySelector('.produtoInfo--qt').innerHTML = modalQt;
    }
};
function MaisUm(){
    modalQt++;
    document.querySelector('.produtoInfo--qt').innerHTML = modalQt;
};

function SizeProduto(size, sizeIndex){
    document.querySelector('.produtoInfo--actualPrice').innerHTML = `R$ ${produtosJson[modalKey].price[sizeIndex].toFixed(2)}`;
    document.querySelector('.produtoInfo--size.selected').classList.remove('selected');
    document.getElementById(size).classList.add('selected');
};

function AddProduto(){
    let size = parseInt(document.querySelector('.produtoInfo--size.selected').getAttribute('data-key'));
    let identifier = produtosJson[modalKey].id+'@'+size; // Criando um identificador único para cada produto. Por exemplo: 1@2, onde 1 (Produto) é o id da produto e 2 (Grande) é o tamanho.
    let key = cart.findIndex((item)=>item.identifier == identifier); // verifica se a produto já existe no carrinho
    if(key > -1) { // Se a produto já existir no carrinho
        cart[key].qt += modalQt; // Essa linha faz com que a quantidade de produtos seja somada
    } else { // Se a produto não existir no carrinho
        cart.push({
            identifier,
            id:produtosJson[modalKey].id,
            size,
            qt:modalQt
        });
    }
    updateCart();
    closeModal();
};

function AbrirCarrinho(){
    if(cart.length > 0) {
        document.querySelector('aside').style.left = '0';
    }
};
function FecharCarrinho(){
    document.querySelector('aside').style.left = '100vw';
};

function updateCart() {
    document.querySelector('.menu-openner span').innerHTML = cart.length;

    if(cart.length > 0) { // se houver produtos no carrinho
        document.querySelector('aside').classList.add('show'); // exibe o carrinho
        document.querySelector('.cart').innerHTML = ''; // limpa o carrinho para evitar duplicações. exemplo: ao adicionar uma produto, ela é exibida no carrinho. Se o usuário adicionar a mesma produto novamente, a produto é exibida duas vezes no carrinho. Para evitar isso, o carrinho é limpo antes de exibir as produtos novamente

        let subtotal = 0;
        let desconto = 0;
        let total = 0;

        for(let i in cart) {
            let produtoItem = produtosJson.find((item) => item.id == cart[i].id); // Obtém a produto correta
            let priceIndex = cart[i].size; // Obtém o índice do preço com base no tamanho selecionado
            let produtoPrice = produtoItem.price[priceIndex]; // Obtém o preço correto da produto
        
            subtotal += produtoPrice * cart[i].qt;

            let cartItem = document.querySelector('.models .cart--item').cloneNode(true);

            let produtoSizeName;
            switch(cart[i].size) {
                case 0:
                    produtoSizeName = 'P';
                    break;
                case 1:
                    produtoSizeName = 'M';
                    break;
                case 2:
                    produtoSizeName = 'G';
                    break;
            }
            let produtoName = `${produtoItem.name} (${produtoSizeName})`;

            cartItem.querySelector('img').src = produtoItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = produtoName;
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', ()=>{
                if(cart[i].qt > 1) {
                    cart[i].qt--;
                } else {
                    cart.splice(i, 1);
                }
                updateCart();
            });
            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', ()=>{
                cart[i].qt++;
                updateCart();
            });

            document.querySelector('.cart').append(cartItem);

        }

        desconto = subtotal * 0.0;
        total = subtotal - desconto;

        document.querySelector('.subtotal span:last-child').innerHTML = `R$ ${subtotal.toFixed(2)}`;
        document.querySelector('.desconto span:last-child').innerHTML = `R$ ${desconto.toFixed(2)}`;
        document.querySelector('.total span:last-child').innerHTML = `R$ ${total.toFixed(2)}`;

    } else {
        document.querySelector('aside').classList.remove('show');
        document.querySelector('aside').style.left = '100vw';
    }
}

async function finalizarCompra() {
        if (cart.length > 0) {
          
          // Preparando para enviar o pedido para o cadastro
          let idProdutosPedidos = [];
          let quantProdutos = [];

          cart.forEach((item) => {

            idProdutosPedidos.push(item.id);
            quantProdutos.push(item.qt);
            
          });

          let entregaNecessaria = 1;
          let tipoPagamento = 'Cartão de Débito';
          
          // Executando a função para cadastrar o pedido
            const response = await fetch('/cadastrar-pedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ entregaNecessaria, tipoPagamento, idProdutosPedidos, quantProdutos })
            });

            // Recebendo a resposta da verificação
            const data = await response.json();

            if (data.message == 'Sessão não Iniciada.'){
                return window.location.href = 'login.html';
            }

            if (data.enviado){
                alert('Pedido Enviado');
                return window.location.href = 'home_cliente.html';
            }else{
                alert('Pedido não Enviado');
            }
        }
        
};

async function buscarTodosProdutos(){
    
    const tipoBusca = 'Todos';;
    const response = await fetch('/buscar-produtos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tipoBusca })
    });

    // Recebendo a lista de produtos
    /*const produtos = await response.json();

    // Limpar o conteúdo atual do elemento 'array'
    const arrayElement = document.getElementById('array');
    arrayElement.innerHTML = '';

    // Iterar sobre a lista de produtos e criar elementos para exibi-los
    produtos.forEach(produto => {
        const produtoElement = document.createElement('div');
        produtoElement.innerHTML = `
            <h3>${produto.name}</h3>
            <p>Preço: ${produto.price}</p>
            <p>Descrição: ${produto.description}</p>
        `;
        arrayElement.appendChild(produtoElement);
    });*/
}