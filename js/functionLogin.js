/*
 * Author: Rodrigo Amorim de Moura
 * Data: 07/02/2018
 * Email: ram.amorim@gmail.com
 */
////////// FUNÇÕES DE ALERTAS ///////////////////////////////
function alerta_codigo_empresa() {
	Swal.fire({
		type: "error",
		title: "O Código da Empresa não pode estar em Branco",
		showConfirmButton: false,
		timer: 1500
	});
}

function alerta_modulo_empresa() {
	Swal.fire({
		type: "error",
		title: "Selecione um Módulo",
		showConfirmButton: false,
		timer: 1500
	});
}

function alerta_empresa_usuario() {
	Swal.fire({
		type: "error",
		title: "Selecione sua Empresa",
		showConfirmButton: false,
		timer: 1500
	});
}

function alerta_modulo_errado() {
	Swal.fire({
		type: "error",
		title: "Usuário não permitido para esse Módulo",
		showConfirmButton: false,
		timer: 1500
	});
}

function alerta_usuario_empresa() {
	Swal.fire({
		type: "error",
		title: "O Usuário da Empresa não pode estar em Branco",
		showConfirmButton: false,
		timer: 1500
	});
}

function alerta_senha_empresa() {
	Swal.fire({
		type: "error",
		title: "A Senha da Empresa não pode estar em Branco",
		showConfirmButton: false,
		timer: 1500
	});
}

function alerta_sistema_dados_incorretos() {
  localStorage.removeItem('currentUser');

	return msgError("Dados Incorretos! Seu Código, Empresa, Usuário ou Senha não conferem. Favor verificar!");
}

///////////// FIM FUNÇÕES DE ALERTAS/////////////////////////

async function carregarListaLojasMenuLogin() {
  $("#empresa").on("select2:close", e => $("#usuario").focus());

  return ajaxGetAllData('api/empresa.xsjs', 'Carregando empresas, aguarde...')
  .then(({data})=>{
    if (data?.length) {
      for (let { IDEMPRESA, NOFANTASIA } of data) {
        $('#empresa').append(`<option value="${IDEMPRESA}">${NOFANTASIA}</option>`);
      }
    }
  })
}

async function handleFocus() {
  let modulo = $('#modulo').val();

  if (modulo == 'GERENCIA') {
    $('#containerLoja').removeClass('d-none');

    try {
      await carregarListaLojasMenuLogin();
    } catch (error) {
      msgError(error);
    }

    setTimeout(() => $('#empresa').select2("open"), 300);
  } else {
    $('#containerLoja').addClass('d-none');
    $("#usuario").focus();
  }
}

function validarCampos({
  empusuario,
  modulo,
  usuario,
  senha
}) {
  if (!modulo?.length) {
    alerta_modulo_empresa();
    return false;
  }

  if (!usuario?.length) {
    alerta_usuario_empresa();
    return false;
  }

  if (!senha?.length) {
    alerta_senha_empresa();
    return false;
  }

  if (modulo == 'GERENCIA' && !empusuario) {
    if (idCampo == 'empresa') {
      alerta_modulo_empresa();

      return false;
    }
  }

  return true;
}

function redirecionarDashboard(resposta) {
  saveCurrentUser(resposta);

  if (resposta.code === 100) {
    window.location.href = 'dashboardinformatica.html';
  } else if (resposta.code === 200) {
    window.location.href = 'dashboardgerencia.html';
  } else if (resposta.code === 300) {
    window.location.href = 'dashboardfinanceiro.html';
  } else if (resposta.code === 400) {
    window.location.href = 'dashboardcontabilidade.html';
  } else if (resposta.code === 500) {
    window.location.href = 'dashboardadministrativo.html';
  } else if (resposta.code === 600) {
    window.location.href = 'dashboardmarketing.html';
  } else if (resposta.code === 700) {
    window.location.href = 'dashboardcomercial.html';
  } else if (resposta.code === 800) {
    window.location.href = 'dashboardcompras.html';
  } else if (resposta.code === 900) {
    window.location.href = 'dashboardcadastros.html';
  } else if (resposta.code === 1000) {
    window.location.href = 'dashboardexpedicao.html';
  } else if (resposta.code === 1100) {
    window.location.href = 'dashboardcomprasadm.html';
  } else if (resposta.code === 1200) {
    window.location.href = 'dashboardconferenciacega.html';
  } else if (resposta.code === 1300) {
    window.location.href = 'dashboardetiquetagem.html';
  } else if (resposta.code === 1400) {
    window.location.href = 'dashboardvouchers.html';
  } else if (resposta.code === 1500) {
    window.location.href = 'dashboardetiquetagemfornecedor.html';
  } else if (resposta.code === 1600) {
    window.location.href = 'dashboardrecepcaomalotes.html';
  } else {
    $("#usuario").val('');
    $("#senha").val('');
    alerta_sistema_dados_incorretos();
  }
}
async function login_sistema_soft() {
  let empusuario = Number($("#empresa").val());
  let modulo = $("#modulo").val();
  let usuario = $("#usuario").val();
  let senha = $("#senha").val();

  let dados = {
    empusuario,
    modulo,
    usuario,
    senha
  };

  if (validarCampos(dados)) {

    try {
      await ajaxPost("api/login.xsjs", dados)
        .then(redirecionarDashboard)
    } catch (error) {
      msgError();
      console.log(error);
    }
  }
}

////////////////// CARREGA ITENS DA TELA DE LOGIN ///////////////////////////////////////////
$(document).ready(async function () {
    $("#modulo, #empresa").select2();

    $("#modulo").on("select2:close", () => handleFocus());

    $("#usuario").keydown((e) => { e.keyCode === 13 && $("#senha").focus() });
    $("#senha").keydown((e) => { e.keyCode === 13 && login_sistema_soft() });
});
///////////////////////////////////////////////////////////////////////////