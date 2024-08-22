var prodCarrinho = document.querySelector(".produtoscarrinho-area");

produtosJson.map((item, index)=>{

    let insereProduto = `
    <div class="prodcar">
        <div class="div-imgprod">
            <img src="${item.img}" alt="${item.name}" srcset="" />
        </div>
        <div class="inf-prod">  
            <p class="prod-name">${index+1} - ${item.name}</p>
            <br>
            <p class="prod-descricao">${item.tipo}</p>
            <br>
            <p class="prod-ingredientes">Ingredientes: ${item.description}</p>
        </div>
        <div class="mais-prod"> 
            <b>Unidades: </b>
            <div class='qt-area'>
            <button class='btn-mod-add' onclick="add_quant(${index+1})">+</button>
            <label class='lbl-quant' id='label${index+1}'>1</label>
            <option value='1' id='option${index+1}' hidden></option>
            <button class='btn-mod-rem' onclick="sub_quant(${index+1})">-</button></div><br>
            <p style="margin-top: 5px; margin-bottom: 5px;">Preço: $50,00</p>
            <div class="div-button">Detalhes</div>
            <div class="div-button">Comprar</div>
        <div>
    </div>
    `;

    prodCarrinho.insertAdjacentHTML("beforeend", insereProduto);
});

function add_quant(id){
    var label = document.getElementById('label'+id);
    var option = document.getElementById('option'+id);
    var value = parseInt(option.value) + 1;

    option.value = value;
    label.innerHTML = value;
}

function sub_quant(id){
    var label = document.getElementById('label'+id);
    var option = document.getElementById('option'+id);

    if (parseInt(option.value) > 1){
        var value = parseInt(option.value) - 1;
    }else{
        var value = 1;
    }
    

    option.value = value;
    label.innerHTML = value;
}