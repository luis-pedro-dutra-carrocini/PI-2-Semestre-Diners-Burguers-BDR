// Variavel para ver se o usuário pretente alterar a senha
var vai_altsenha = 0;

// Verificando se a checkbox foi selecionada
function alterar_senha(){
    const alterar_senha = document.getElementById('alterar_senha');
    const campo_senha = document.getElementById('senhas_alterar');

    if (alterar_senha.checked === true){
        campo_senha.style.display = "Block";

    }else{
        campo_senha.style.display = "None";
    }
}


// Função para exibir a imagem ao ser selecionada
const arquivo_foto = document.getElementById('foto_usuario');
const exibir_foto = document.getElementById('img_foto');

arquivo_foto.addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      // Quando o arquivo for carregado, exibe a imagem
      reader.onload = function(e) {
        exibir_foto.src = e.target.result;
      }

      // Lê o arquivo como uma URL para exibir
      reader.readAsDataURL(file);
    }
});