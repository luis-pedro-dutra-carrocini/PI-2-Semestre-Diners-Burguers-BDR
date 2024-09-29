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
const img_removida = document.getElementById('img_removida');

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

      img_removida.value = "0";

    }
});

// Função para retirar a imagem selecionada
function retirar_foto(){
    // Reseta o campo de arquivo
    document.getElementById('img_removida').value = "1";
    arquivo_foto.value = '';
    exibir_foto.src = "./imagens/usuarios/usuario-n.png";
}

// Função para verificar se a senha inserida é a senha cadastrada
async function comparar_senhas(senha_atual){

  // Executando a função para verificar se o email já não está cadastrado
  const response = await fetch('/comparar-senhas', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ senha_atual })
  });

  // Recebendo a resposta da verificação
  const data = await response.json();

  if (!data.resultado){
    document.getElementById('msgsenhaatual').textContent = "Senha Incorreta!";
    return { erroSenhaAt: 1 };
  }else{
    document.getElementById('msgsenhaatual').textContent = "";
    return { erroSenhaAt: 0 };
  }

};

// Função com API para retornar os valores do CEP
async function dados_cep_alt(cep, busca) {
  try {

      // Campos Bairro e Rua
      const inputBairro = document.getElementById("bairro");
      const inputLogradouro = document.getElementById("rua");

      // Verificando se quantidade de caracteres do CEP é Valida
      if (cep.length !== 9) {

          // Mensagem de erro
          document.getElementById("msgcep").textContent = "CEP Inválido!";

          // Limpando os campos
          inputBairro.value = "";
          inputLogradouro.value = "";
          document.getElementById("cidade").value = "";
          document.getElementById("uf").value = "";

          return { erroCep: 1 };
      } else {

          // Fazendo a consulta na API Via CEP
          const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const dados = await resposta.json();

          // Verificando se o CEP é valido (foi encontrado)
          if (dados.erro) {

              // Mensagem de erro
              document.getElementById("msgcep").textContent = "CEP Inválido!";

              // Limpando os campos
              inputBairro.value = "";
              inputLogradouro.value = "";
              document.getElementById("cidade").value = "";
              document.getElementById("uf").value = "";

              return { erroCep: 1 };

          } else {
            document.getElementById("cidade").value = dados.localidade;
            document.getElementById("uf").value = dados.uf;
            document.getElementById("msgcep").textContent = "";

            // Verificando se o CEP possui Bairro e Rua
            // Se não possui bairro e a busca for a inical
            if (!dados.bairro && busca === 1) {
                inputBairro.readOnly = false;
                inputBairro.value = "";

            // Se possui bairro e a busca for a inical
            } else if (dados.bairro && busca === 1) {
                inputBairro.readOnly = true;
                inputBairro.value = dados.bairro;

            }else {
                inputBairro.readOnly = true;
            }

            // Se não possui rua e a busca for a inical
            if (!dados.logradouro && busca === 1) {
                inputLogradouro.readOnly = false;
                inputLogradouro.value = "";

            // Se possui rua e a busca for a inical
            } else if (dados.logradouro && busca === 1) {
                inputLogradouro.readOnly = true;
                inputLogradouro.value = dados.bairro;
                
            }else {
                inputLogradouro.readOnly = true;
            }

            return { erroCep: 0 };
          }
      }
  } catch (error) {
      console.error('Erro ao consultar o CEP:', error);
      return { erroCep: 1 };
  }
};

// Função para validar senha
function validasenhaalt(senha) {

  // Tipos de caracteres exigidos na senha
  const numeros = /[0-9]/;
  const chEspeciais = /[!@#$%^&*(),.?":{}|<>+=]/;
  const letrasMinusculas = /[a-z]/;
  const letrasMaiusculas = /[A-Z]/;

  // Compo para mensagem de erro na senha
  const msgsenha = document.getElementById('msgsenhanova');

  // Validando a senha
  if (senha.length < 8) {
      msgsenha.textContent = "Mínimo Oito Caracteres!";
      return { erroSenha: 1 };

  } else if (!numeros.test(senha)) {
      msgsenha.textContent = "Mínimo um Número!";
      return { erroSenha: 1 };

  } else if (!chEspeciais.test(senha)) {
      msgsenha.textContent = "Mínimo um Caracter Especial!";
      return { erroSenha: 1 };

  } else if (!letrasMaiusculas.test(senha)) {
      msgsenha.textContent = "Mínimo uma Letra Maiúscula!";
      return { erroSenha: 1 };

  } else if (!letrasMinusculas.test(senha)) {
      msgsenha.textContent = "Mínimo uma Letra Minúscula!";
      return { erroSenha: 1 };

  } else if (senha.length > 30) {
      msgsenha.textContent = "Máximo de 30 caracteres!";
      return { erroSenha: 1 };

  } else {
      msgsenha.textContent = "";
      return { erroSenha: 0 };
  }
};


// Função para validação de Email da Página de Cadsatrar-se
async function validacaoEmailAlt(email) {

  // Campo para mensagem de erro no email
  const msgEmail = document.getElementById('msgemail');

  let emailOriginal = "";

  // Buscando o email original para comparar com o novo, para ver se não são iguais
  await fetch('/buscar-dados-cliente', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
    })
    .then(response => response.json())
    .then(data => {

    // Verificando se o Usuário realmente existe
    if (data.existe) {

        // Obtendo o email original
        emailOriginal = data.email;
     

    }else{
        return window.location.href = '/login.html';
    }
    })
    .catch(error => console.error('Erro ao verificar a sessão:', error));

  // Extrutura do email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validando o email
  if (!regex.test(email)) {
      msgEmail.textContent = 'E-mail Inválido!';
      return { erroEmail: 1 };
  }

  try {

    // Verificando se o email se manteve
    if (email != emailOriginal){
      // Executando a função para verificar se o email já não está cadastrado
      const response = await fetch('/verificar-email', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
      });

      // Recebendo a resposta da verificação
      const data = await response.json();

      // Verificando qual foi a resposta
      if (data.exists) {
          msgEmail.textContent = "E-mail já Cadastrado!";
          return { erroEmail: 1 };

      } else {
          msgEmail.textContent = '';
          return { erroEmail: 0 };
      }
    }else{
        msgEmail.textContent = '';
        return { erroEmail: 0 };
    }

  } catch (error) {
      console.log('Erro ao verificar o e-mail:', error);
      return { erroEmail: 1 };
  }
};


// Função para validar e cadastrar usuário
async function alterarDadosUsuario() {

    // Obtendo o ID do Formulário
    const form = document.getElementById('formAltUsuario');
  
    // Obtendo os dados do usuário pelo formulário
    // Dados pessoais
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
  
    // Obtendo informações da imagem
    const fotoInput = document.getElementById('foto_usuario');
  
    // Obtém o primeiro arquivo (neste caso, a foto)
    const foto = fotoInput.files[0];
  
    // Verificando se a imagem foi escolhida
    if (foto) {
  
         // Tipo do arquivo da foto
        const tipoFoto = foto.type;
    
        // Verificando se o tipo de imagem é válido
        // .jpg, .jpeg, .png, .gif
        if (tipoFoto != "image/jpeg" && tipoFoto != "image/jpg" && tipoFoto != "image/png" && tipoFoto != "image/gif"){
    
        // Enviando mensagem de erro
        document.getElementById('msgfoto').textContent = "Tipo de arquivo Inválido!";
        return;
        }
    
        // Apagando qualquer tipo de mensagem de erro de foto
        document.getElementById('msgfoto').textContent = "";
    }
  
    // Telefone e Celular
    const telefone = document.getElementById('telefone').value.trim();
    const celular = document.getElementById('celular').value.trim();
  
    // Senhas
    const senhaAtual = document.getElementById('senha_atual').value.trim();
    const senhaNova = document.getElementById('senha_nova').value.trim();
  
    // Endereço
    const cep = document.getElementById('cep').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    const rua = document.getElementById('rua').value.trim();
    const numero = document.getElementById('numero').value.trim();
  
    // Variaveis para executar e receber o resultados das validações das funções
    const emailValidacao = await validacaoEmailAlt(email);
    const campSenhas = await comparar_senhas(senhaAtual);
    const cepValidacao = await dados_cep_alt(cep, 2);

    // Verificando se foi desejavel a alteração de senha
    const altSenha = document.getElementById('alterar_senha').checked;

    let erroValidacaoSenha = 0;

    if (altSenha == true){
        const senhaValidacao = await validasenhaalt(senhaNova);
        erroValidacaoSenha = senhaValidacao.erroSenha;
    }else{
        erroValidacaoSenha = 0;
    }
  
    // Verificando os resultados
    if (emailValidacao.erroEmail === 0 &&  erroValidacaoSenha === 0 && campSenhas.erroSenhaAt === 0 && cepValidacao.erroCep === 0) {
  
        // Verificando se não há campos nulos
        if (nome && bairro && rua && numero && telefone.length == 15 && celular.length == 15) {
  
          form.submit();
  
        } else {
            document.getElementById('msgerrocad').textContent = "Todos os dados devem ser preenchidos de forma correta!";
        }
    } else {
        document.getElementById('msgerrocad').textContent = "Todos os dados devem ser preenchidos de forma correta!";
    }
  };

  // Função para Excluir a Conta do Usuário
  async function excluirConta(){

    // Recebendo a senha
    const senhaAtual = document.getElementById('senha_atual').value.trim();

    // Comparando as senhas
    const campSenhas = await comparar_senhas(senhaAtual);

    // Verificando se as senha foram iguais
    if (campSenhas.erroSenhaAt === 0){

        // Confirmação
        const confirmacao = confirm('Deseja realmente Excluir a Conta?');

        // Validando confirmação
        if (confirmacao){
        
            // Excluindo a conta
            await fetch('/excluir-conta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
                })
                .then(response => response.json())
                .then(data => {

                // Verificando se o Usuário realmente existe
                if (data.excluiu) {
                    return window.location.href = '/login.html';
                }
                })
                .catch(error => console.error('Erro ao excluir a conta:', error));
        }
    }
  }