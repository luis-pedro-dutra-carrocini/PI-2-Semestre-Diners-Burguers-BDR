// Variaveis de erro para o Cadastro
var erroEmail = 0;
var erroSenha = 0;
var erroConSenha = 0;
var erroCep = 0;

// Mostrar e ocultar a senha da pagina de login e de cadastro
function mostrar_senha(idsenha, idbutton){
    var input_senha = document.getElementById(idsenha);
      var mos_senha = document.getElementById(idbutton);
  
      if (input_senha.type === "password"){
          input_senha.setAttribute('type', 'text');
          mos_senha.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
      }
      else{
          input_senha.setAttribute('type', 'password');
          mos_senha.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
      }
      
}
  
  // Função com API para retornar os valores do CEP
  function dados_cep(cep){
    const texto = fetch('https://viacep.com.br/ws/'+cep.value+'/json/')
    .then(resposta => resposta.json())
  
    texto.then(dados=>{
      var erro = dados['erro']
      if (erro == true){
        document.getElementById("msgcep").innerHTML="CEP Inválido!";
        erroCep = 1;
        document.getElementById("cidade").value= '';
        document.getElementById("uf").value= '';
        document.getElementById("bairro").value= '';
        document.getElementById("rua").value= '';
      }else{
        document.getElementById("cidade").value= dados['localidade'];
        document.getElementById("uf").value= dados['uf'];
        document.getElementById("msgcep").innerHTML="";
        erroCep = 0;
  
        if (dados['bairro'] == ''){
          document.getElementById("bairro").value= dados['bairro'];
          document.getElementById("bairro").readOnly= false;
        }else{
          document.getElementById("bairro").value= dados['bairro'];
          document.getElementById("bairro").readOnly= true;
        }
  
        if (dados['logradouro'] == ''){
          document.getElementById("rua").value= dados['logradouro'];
          document.getElementById("rua").readOnly= false;
        }else{
          document.getElementById("rua").value= dados['logradouro'];
          document.getElementById("rua").readOnly= true;
        }
      } 
    })
  }
  
  // Função para validar senha
  function validasenha(senha){
    var numeros = /([0-9])/;
    var chEspeciais = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<,/,@,+,-,=])/;
    var letrasMinusculas = /[a-z]/; 
    var letrasMaiusculas = /[A-Z]/;
    document.getElementById('msgsenha').innerHTML = senha.value;
  
    if (senha.value.length < 8){
      document.getElementById('msgsenha').innerHTML = "Mínimo Oito Caracteres!";
      erroSenha = 1;
    }else if (senha.value.match(numeros)){
      if (senha.value.match(chEspeciais)){
        if (senha.value.match(letrasMaiusculas)){
          if (senha.value.match(letrasMinusculas)){
            document.getElementById('msgsenha').innerHTML = "";
            erroSenha = 0;
          }else{
            document.getElementById('msgsenha').innerHTML = "Mínimo uma Letra Maiúscula!";
            erroSenha = 1;
          }
        }else{
          document.getElementById('msgsenha').innerHTML = "Mínimo uma Letra Minúscula!";
          erroSenha = 1;
        }
      }else{
        document.getElementById('msgsenha').innerHTML = "Mínimo um Caracter Especial!";
        erroSenha = 1;
      }
    }else{
      document.getElementById('msgsenha').innerHTML = "Mínimo um Número!";
      erroSenha = 1;
    }
  }
  
  // Função para validar se as senhas são iguais
  function validaconsenha(senha, consenha){
    if (consenha.value != senha.value){
      document.getElementById('msgconsenha').innerHTML = "Senhas devem ser Iguais!";
      erroConSenha = 1;
    }else{
      document.getElementById('msgconsenha').innerHTML = "";
      erroConSenha = 0;
    }
  }

  // Função para cadastrar
  function cadastrar(email, senha, conSenha, cep){
    
    //Executando todas as funções para validação
    validacaoEmail(email);
    validasenha(senha);
    validaconsenha(senha, conSenha);
    if (cep.value == ""){
      erroCep = 1;
    }else{
      dados_cep(cep);
    }


    //Obtendo outros valores do form para validação
    var nome = document.getElementById('nome').value.trim();
    var telefone = document.getElementById('telefone').value.trim();
    var celular = document.getElementById('celular').value.trim();
    var bairro = document.getElementById('bairro').value.trim();
    var rua = document.getElementById('rua').value.trim();
    var numero = document.getElementById('numero').value.trim();

    if (erroCep == 0 && erroConSenha == 0 && erroEmail == 0 && erroSenha == 0 && nome != "" && telefone.length > 14 && celular.length > 14 && bairro != "" && rua != "" && numero != ""){
      // window.location.href = 'home_cliente.html';
    }else{
      document.getElementById('msgerrocad').innerHTML = "Todos os dados devem ser preenchidos de forma correta!";
    }
  }

  function entrar(email, senha_login){
    validacaoEmail(email);
    senha = senha_login.value.trim();

    if (erroEmail == 0 && senha != ""){
      // window.location.href = 'home_cliente.html';
    }else{
      document.getElementById('msgerrologin').innerHTML = "Dados Inválidos!";
    }
  }
  
// Mascara de atributos da pagina de cadastro
$("#telefone").mask("(00) 0000-00009");
$("#celular").mask("(00) 0000-00009");
$("#cep").mask("00000-009");

// Validando a Estrutura do Email e se ele já está cadastrado (Castrar)
function validacaoEmail(field) {

  // Mensagem de aviso do campo de Email  
  const msgEmail = document.getElementById('msg-email');

  // Fragmentando o email para a análise
  usuario = field.value.substring(0, field.value.indexOf("@"));
  dominio = field.value.substring(field.value.indexOf("@")+ 1, field.value.length);
    
  // Validando a Estrutura do Email
  if ((usuario.length >=1) && (dominio.length >=3) && (usuario.search("@")==-1) && (dominio.search("@")==-1) && (usuario.search(" ")==-1) && (dominio.search(" ")==-1) && (dominio.search(".")!=-1) && (dominio.indexOf(".") >=1)&& (dominio.lastIndexOf(".") < dominio.length - 1)) {

    // Obtendo o valor inteiro do Email
    const email = field.value.trim();

    fetch('/verificar-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {

        if (data.exists) {
          msgEmail.textContent = 'E-mail já Cadastrado';
          erroEmail = 1;
        }else{
          msgEmail.textContent = '';
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });

  }else{
    msgEmail.textContent = 'E-mail Inválido';
    erroEmail = 1;
  }
};
