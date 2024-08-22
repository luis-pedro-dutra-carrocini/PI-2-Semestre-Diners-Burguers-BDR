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

function finalizarCompra() {
        if (cart.length > 0) {
          // Construindo a mensagem com os dados do pedido
          let mensagem = "*Pedido:*\n";
          cart.forEach((item) => {
            let produtoItem = produtosJson.find((produto) => produto.id == item.id);
            let produtoSizeName;
            switch (item.size) {
              case 0:
                produtoSizeName = "P";
                break;
              case 1:
                produtoSizeName = "M";
                break;
              case 2:
                produtoSizeName = "G";
                break;
            }
            mensagem += `${produtoItem.name} (${produtoSizeName}) - Quantidade: ${item.qt}\n`;
          });
      
          let subtotal = parseFloat(
            document
              .querySelector(".subtotal span:last-child")
              .innerHTML.replace("R$ ", "")
          );
          let desconto = parseFloat(
            document
              .querySelector(".desconto span:last-child")
              .innerHTML.replace("R$ ", "")
          );
          let total = parseFloat(
            document
              .querySelector(".total span:last-child")
              .innerHTML.replace("R$ ", "")
          );
          mensagem += `\n*Subtotal:* R$ ${subtotal.toFixed(
            2
          )}\n*Desconto:* R$ ${desconto.toFixed(2)}\n*Total a pagar:* R$ ${total.toFixed(
            2
          )}`;
      
          // Formatando a mensagem para URL
          let mensagemFormatada = encodeURIComponent(mensagem);
      
          // Construindo o link com a URI de compartilhamento do WhatsApp
          let linkWhatsApp = `https://wa.me/5516988753083?text=${mensagemFormatada}`;
      
          // Abrindo o link no navegador
          window.open(linkWhatsApp, "_blank");
        }
        
};