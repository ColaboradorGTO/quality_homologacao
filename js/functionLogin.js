/*
 * Author: Rodrigo Amorim de Moura
 * Data: 07/02/2018
 * Email: ram.amorim@gmail.com
 */
function login_sistema_soft() {

	var empusuario = $("#empresa").val();
	var modulo = $("#modulo").val();
	var usuario = $("#usuario").val();
	var senha = $("#senha").val();

	var dados = {
		"empusuario": empusuario,
		"modulo": modulo,
		"usuario": usuario,
		"senha": senha
	};

	if ($("#usuario").val() === '') {
		$("#usuario").focus();
		alerta_usuario_empresa();
	} else if ($("#senha").val() === '') {
		$("#senha").focus();
		alerta_senha_empresa();
	} else if ($("#modulo").val() === '') {
		$("#modulo").focus();
		alerta_modulo_empresa();
	} else if ($("#empresa").val() === '') {
		$("#empresa").focus();
		alerta_modulo_empresa();
	} else {

		function funcSucess(resposta) {
		    
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
            }else {
				$("#usuario").val('');
				$("#usuario").val('');
				$("#senha").val('');
				alerta_sistema_dados_incorretos();
			}
		}

		function funcError(data) {
			Swal.fire({
				type: "error",
				title: data.msg,
				showConfirmButton: false,
				timer: 15000
			});
		}

		ajaxPost("api/login.xsjs", dados)
			.then(funcSucess)
			.catch(funcError);
	}
}

function Onlynumbers(e) {
	var tecla = (window.event) ? event.keyCode : e.which;
	if (tecla > 47 && tecla < 58) {
		return true;
	} else {
		if (tecla === 8 || tecla === 0) {
			return true;
		} else {
			return false;
		}
	}
}

function mascaraValor(valor) {
	valor = valor.toString().replace(/\D/g, "");
	valor = valor.toString().replace(/(\d{1})(\d{17})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{14})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{11})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{8})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{5})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{2})$/, "$1,$2");
	return valor;
}

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
	Swal.fire({
		type: "error",
		title: "Dados Incorretos! Seu Código, Empresa, Usuário ou Senha não conferem. Favor verificar!",
		showConfirmButton: false,
		timer: 3000
	});
}

///////////// FIM FUNÇÕES DE ALERTAS/////////////////////////

//////////// LEVANDO O DATATABLE PARA AS PAGINAS DE PESQUISA///////////
function newDataTable() {

	// initialize datatable
	$('#dt-basic-example').dataTable({
		responsive: true,
		lengthChange: false,
		dom:
		/*	--- Layout Structure 
                --- Options
                l	-	length changing input control
                f	-	filtering input
                t	-	The table!
                i	-	Table information summary
                p	-	pagination control
                r	-	processing display element
                B	-	buttons
                R	-	ColReorder
                S	-	Select

                --- Markup
                < and >				- div element
                <"class" and >		- div with a class
                <"#id" and >		- div with an ID
                <"#id.class" and >	- div with an ID and a class

                --- Further reading
                https://datatables.net/reference/option/dom
                --------------------------------------
                */
		"<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
			"<'row'<'col-sm-12'tr>>" +
			"<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
		order: ([1, 'desc']),
		buttons: [
			{
				extend: 'colvis',
				text: 'Mostrar Colunas',
				titleAttr: 'Visualizar e Esconder Colunas',
				className: 'mr-sm-3'
              },
			{
				extend: 'pdfHtml5',
				text: 'PDF',
				titleAttr: 'Gerar PDF',
				className: 'btn-outline-danger btn-sm mr-1'
              },
			{
				extend: 'excelHtml5',
				text: 'Excel',
				titleAttr: 'Gerar Excel',
				className: 'btn-outline-success btn-sm mr-1'
              },
			{
				extend: 'print',
				text: 'Imprimir',
				titleAttr: 'Imprimir Tabela',
				className: 'btn-outline-primary btn-sm'
              }
          ]
	});
}

////////////////// CARREGA ITENS DA TELA DE LOGIN ///////////////////////////////////////////
$(document).ready(function () {
    $("#modulo").select2();
    $("#empresa").select2();

    $("#modulo").on("select2:close", function (e) {
        let modulo = $('#modulo').val();
        let containerLoja = $('#containerLoja');
        let selectEmpresa = $('#empresa').data('select2');

        if (modulo == 'GERENCIA') {
            containerLoja.removeClass('d-none');
            selectEmpresa.open();
        } else {
            containerLoja.addClass('d-none');
            $("#usuario").focus();
        }
    });

    $("#empresa").on("select2:close", e => $("#usuario").focus());

    $("#usuario").keydown((e) => { e.keyCode === 13 && $("#senha").focus() });

    $("#senha").keydown(e => { e.keyCode === 13 && login_sistema_soft() });
    
    async function CarregarListaLojas() {
        return new Promise(async (resolve, reject) => {
            try {
                let urlApi = `api/empresa.xsjs?`;

                let resp = await ajaxGet(`${urlApi}&page=1`);

                let page = Number(resp.page);

                let pages = page ? Math.round(Number(resp.rows) / 1000) : '';

                if (resp.data.length && resp.data.length == 1000) {
                    proximaPaginaListaLojas();

                    async function proximaPaginaListaLojas() {
                        try {
                            page++;

                            let resp2 = await ajaxGet(`${urlApi}&page=${page}`);

                            if (resp2.data.length) {
                                resp.data.push(...resp2.data);

                                pages && $('#numPagesLoading').html(`${page} de ${pages}`);

                                proximaPaginaListaLojas();

                            } else {
                                retornoListaLojasMenuLogin(resp);
                                resolve();
                            }
                        } catch {
                            console.log('Erro ao carregar as listas de Lojas');
                            reject('Erro ao carregar as listas de Lojas, tente novamente!');
                        }
                    }

                } else {
                    retornoListaLojasMenuLogin(resp);
                    resolve();
                }
            } catch {
                console.log('Erro ao carregar as listas de Lojas');
                reject('Erro ao carregar as listas de Lojas, tente novamente!');
            }
        });
    }
    
    async function loadPageIndex() {
        let modalLoading = setTimeout(() => animacaoCarregamento(), delayMaximo);
        
        try {
            await CarregarListaLojas();
            
            clearTimeout(modalLoading);
            Swal.close();
            
        } catch (error) {
            clearTimeout(modalLoading);
            Swal.close();
         
            msgError(error);
        }
    }

    loadPageIndex();
    
    function retornoListaLojasMenuLogin(dadosLojas){
        let listaLojas = dadosLojas.data.length ? dadosLojas.data : '';
        
        if(listaLojas){
            for(let lista of listaLojas){
              $('#empresa').append(`
                <option value="${lista['IDEMPRESA']}">${lista['NOFANTASIA']}</option>
              `);
            }
        } 
    }
});
///////////////////////////////////////////////////////////////////////////