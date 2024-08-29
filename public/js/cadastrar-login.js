// Mascara de atributos da pagina de cadastro
$("#telefone").mask("(00) 0000-00009");
$("#celular").mask("(00) 0000-00009");
$("#cep").mask("00000-009");

// Função para mostrar e ocultar senha
function mostrar_senha(idsenha, idbutton) {
  var input_senha = document.getElementById(idsenha);
  var mos_senha = document.getElementById(idbutton);

  if (input_senha.type === "password") {
      input_senha.setAttribute('type', 'text');
      mos_senha.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
  } else {
      input_senha.setAttribute('type', 'password');
      mos_senha.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
  }
}

// Função com API para retornar os valores do CEP
async function dados_cep(cep, busca) {
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
}

// Função para validar senha
function validasenha(senha) {

  // Tipos de caracteres exigidos na senha
  const numeros = /[0-9]/;
  const chEspeciais = /[!@#$%^&*(),.?":{}|<>+=]/;
  const letrasMinusculas = /[a-z]/;
  const letrasMaiusculas = /[A-Z]/;

  // Compo para mensagem de erro na senha
  const msgsenha = document.getElementById('msgsenha');

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
}

// Função para validar se as senhas são iguais
function validaconsenha(senha, consenha) {

  // Campo para mensagem de erro na confirmação de senha
  const msgconsenha = document.getElementById('msgconsenha');

  // Verificando se as senhas são iguais
  if (consenha !== senha) {
      msgconsenha.textContent = "Senhas devem ser Iguais!";
      return { erroConSenha: 1 };

  } else {
      msgconsenha.textContent = "";
      return { erroConSenha: 0 };
  }
}

// Função para validação de Email
async function validacaoEmail(email) {

  // Campo para mensagem de erro no email
  const msgEmail = document.getElementById('msg-email');

  // Extrutura do email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validando o email
  if (!regex.test(email)) {
      msgEmail.textContent = 'E-mail Inválido!';
      return { erroEmail: 1 };
  }

  try {

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
          msgEmail.textContent = 'E-mail já Cadastrado!';
          return { erroEmail: 1 };

      } else {
          msgEmail.textContent = '';
          return { erroEmail: 0 };
      }

  } catch (error) {
      console.log('Erro ao verificar o e-mail:', error);
      return { erroEmail: 1 };
  }
}

// Função para validar e cadastrar usuário
async function cadastrar() {

  // Obtendo o ID do Formulário
  const form = document.getElementById('formCadUsuario');

  // Obtendo os dados do usuário pelo formulário
  // Dados pessoais
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();

  // Obtendo informações da imagem
  const fotoInput = document.getElementById('foto_usuario');

  // Obtém o primeiro arquivo (neste caso, a foto)
  const foto = fotoInput.files[0];

  // Verificando se a imagem foi escolhida
  if (!foto) {

    // Enviando mensagem de erro
    document.getElementById('msgfoto').textContent = "Nenhuma Imagem Escolhida!";
    return;
  }

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

  // Telefone e Celular
  const telefone = document.getElementById('telefone').value.trim();
  const celular = document.getElementById('celular').value.trim();

  // Senhas
  const senha = document.getElementById('senha_cadastro').value.trim();
  const conSenha = document.getElementById('consenha_cadastro').value.trim();

  // Endereço
  const cep = document.getElementById('cep').value.trim();
  const bairro = document.getElementById('bairro').value.trim();
  const rua = document.getElementById('rua').value.trim();
  const numero = document.getElementById('numero').value.trim();

  // Variaveis para executar e receber o resultados das validações das funções
  const emailValidacao = await validacaoEmail(email);
  const senhaValidacao = validasenha(senha);
  const consenhaValidacao = validaconsenha(senha, conSenha);
  const cepValidacao = await dados_cep(cep, 2);

  // Verificando os resultados
  if (emailValidacao.erroEmail === 0 && senhaValidacao.erroSenha === 0 && consenhaValidacao.erroConSenha === 0 && cepValidacao.erroCep === 0) {

      // Verificando se não há campos nulos
      if (nome && bairro && rua && numero && telefone.length == 15 && celular.length == 15) {

        form.submit();

      } else {
          document.getElementById('msgerrocad').textContent = "Todos os dados devem ser preenchidos de forma correta!";
      }
  } else {
      document.getElementById('msgerrocad').textContent = "Todos os dados devem ser preenchidos de forma correta!";
  }
}
