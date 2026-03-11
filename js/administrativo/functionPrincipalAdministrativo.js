/*
 * Author: Rodrigo Amorim de Moura
 * Data: 07/02/2018
 * Email: ram.amorim@gmail.com
 */

if(!getCurrentUser()){
    window.location.href = 'index.html';
}

var usuario = getCurrentUser().user;

var ipCliente = '';

var IDEmpresaLogin = usuario['IDEMPRESA'];
var NOEmpresaLogin = usuario['NOFANTASIA'];
var IDFuncionarioLogin = usuario['id'];
var NomeFuncionarioLogin = usuario['NOFUNCIONARIO'];

//var IDEmpresaLogin = 35;
//var NOEmpresaLogin = '0035 - TO - valparizo 1';
//var NomeFuncionarioLogin = 'DANIEL ALVES DA SILVA';

//console.dir(usuario);

//////////////// Funções Globais ///////////////////////////////////

var dataRetorno = [];
var dataRetornoBalanco=[];
var dataRetornoDetBalanco=[];

var dataRetornoVendaPagamento=[];
var dataRetornoVendaDetalhe=[];

var contador = 0;
var TotalBrutoConvenio = 0;
var TotalDescConvenio = 0;
var TotalLiqConvenio = 0;

var TotalBrutoVendaNF = 0;
var TotalDescVendaNF = 0;
var TotalLiqVendaNF = 0;
var IDresBalanco = 0;

var IDVenda= '';

var contadorAtiva = 0;
var VendaAtivaValor = 0;
var TotalVendaAtiva = 0;

var nQtdItens = 0;
var contadorPreviaBalanco = 0;
var idresumoPreviaBalanco = 0;
var idempresaPreviaBalanco = 0;

var contadorPesqProdutoBalanco = 0;
var listardetalhebalanco = 0;

var VrDinheiroPagamento = 0; 
var VrCartaoPagamento = 0; 
var VrPOSPagamento = 0; 
var VrConvenioPagamento = 0; 
var VrVoucherPagamento = 0; 
var TotalDespCaixa =  0;
var idemp = 0;
var datapesq = 0;

    /////////// Pega Data Atual ///////////////////////

var data = new Date();
var dia = data.getDate(); // 1-31
var dia_sem = data.getDay(); // 0-6 (zero=domingo)
var mes = data.getMonth(); // 0-11 (zero=janeiro)
var ano2 = data.getYear(); // 2 dígitos
var ano4 = data.getFullYear(); // 4 dígitos
var hora = data.getHours();          // 0-23
var min = data.getMinutes();        // 0-59
var seg = data.getSeconds();        // 0-59

diaFormatado = String(dia);
mesatual = (mes + 1);
tresmesesatras = (mes - 3);
mesFormatado = String(mesatual);

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

var dataPesquisaFormatada = dataAtual;

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

function newDataTable(tipo) {

	if (tipo == 'MovCaixas') {
		$('#dt-basic-venda-ativa').dataTable({
			destroy: true,
			responsive: true,
			fixedHeader: true,
			colReorder: true
		});
		$('#dt-basic-venda-cancelada').dataTable({
			destroy: true,
			responsive: true,
			fixedHeader: true,
			colReorder: true
		});
	} else {
		$('#dt-basic-' + tipo).dataTable({
			destroy: true,
			responsive: true,
			fixedHeader: true,
			colReorder: true
		});
	}
	
    $('#dt-buttons-' + tipo).dataTable({
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
            order: ([ 1, 'desc' ]),
        buttons: [
            {
                extend:    'colvis',
                text:      'Mostrar Colunas',
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
                className: 'btn-outline-success btn-sm mr-1',
                exportOptions: {
                  columns: ':visible',
                  format: {
                      body: function(data, row, column, node) {
                          data = $('<p>' + data + '</p>').text();
                          return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                      }
                  }
                }
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

function logout() {
    LogoffUser();
	window.location.href = 'index.html';
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function funcError(data) {
	Swal.fire({
		type: "error",
		title: "Falha no Processo. Erro ao carregar Dados.",
		//title:`${data.msg}`,
		showConfirmButton: false,
		timer: 15000
	});
}

function alterarQtdBalanco(qtd, idProduto, row){
    if(!isNaN(qtd)){
         var dados = [{
                  "IDPRODUTO":idProduto,
                  "IDRESUMOBALANCO": IDresBalanco,
                  "QTD": parseInt(qtd)
                }];
            
            //console.table(dados);
           
          	ajaxPut("api/administrativo/atualiza-qtd-produto-detalhe-balanco.xsjs", dados)
        		.then(funcSucessEditarDinheiroFisico)
                .catch((e) => { funcError(), console.log(e) });
        
    }else{
        alert('Valor inválido!')    
        row.invalidate()
    }
}

var mydatatabledetbalanco;
	   const createdCell = function(cell) {
        	let original;
        	 
          cell.setAttribute('contenteditable', true)
          cell.setAttribute('spellcheck', false)
          cell.type = 'number'
          cell.addEventListener("focus", function(e) {
        		original = e.target.textContent
        		 
        	})
          cell.addEventListener("blur", function(e) {
        		if (original !== e.target.textContent) {
        	    const row = mydatatabledetbalanco.row(e.target.parentElement)
            	//row.invalidate()
            	alterarQtdBalanco(e.target.textContent, row.data()[1], row)
        	    console.log('Row changed: ', row.data())
        		}
          })
        }

$(document).ready(function() {

	$('#parametro_dia').val(dataAtualCampo);
	$('.dataAtual').text(dataAtual);
	$('.NoFuncionarioTitulo').text(NomeFuncionarioLogin);
	$('.NoEmpresaTitulo').text(NOEmpresaLogin);

    /////////////Lista de Empresas ///////////////////////////////////////////
    //if(IDFuncionarioLogin === 2002 || IDFuncionarioLogin === 29551 || IDFuncionarioLogin === 2001){
        //$('#js-nav-menu').append('<li><a href="javascript:ListaVendasCanceladasPorEmpresa();" title="Relatórios de Vendas Canceladas" data-filter-tags="visualizar_vendas_canceladas"><span class="nav-link-text" data-i18n="nav.visualizar_vendas_canceladas">Vendas Canceladas</span></a></li>');
        //$('#js-nav-menu').append('<li><a href="javascript:ListaVendasContingenciaPorEmpresa();" title="Relatórios de Vendas Contingência" data-filter-tags="visualizar_vendas_contingencia"><span class="nav-link-text" data-i18n="nav.visualizar_vendas_contingencia">Vendas Contingência</span></a></li>');
    //}
	ajaxGet('api/informatica/empresa.xsjs')
		.then(retornoListaEmpresasSelect)
        .catch((e) => { funcError(), console.log(e) });
		
	ajaxGet('http://ipwho.is/')
	.then(retornoIp)
    .catch((e) => { funcError(), console.log(e) });

});

function retornoIp(resp){
    ipCliente = resp.ip;
}

function retornoListaEmpresasSelect(respostaListaEmpresas, startCarregamento) {

    $("#idloja").select2();
    
    numPage = parseInt(respostaListaEmpresas.page);
    if(numPage === 1){
        $("#idlojavendadesc").empty();
        $('#idlojavendadesc').append(
	        `<option value="0">TODOS</option>`
	    );
	    $("#idloja").empty();
	    $('#idloja').append(
	        `<option value="">Todos</option>`
	    );
	    $("#idlojaaltpreco").empty();
	    $('#idlojaaltpreco').append(
	        `<option value="">Selecione</option>`
	    );
    }
    
    let dadosFiliais =  respostaListaEmpresas.data || '';
    
    dadosFiliais.sort((a, b) => a.IDEMPRESA - b.IDEMPRESA);
    
	for (var i = 0; i < dadosFiliais.length; i++) {

		IDEmpresa = dadosFiliais[i]['IDEMPRESA'];
		DSEmpresa = dadosFiliais[i]['NOFANTASIA'];

			$('#idloja').append(
				`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
			);
			$('#idlojavendadesc').append(
				`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
			);
			$('#idlojaaltpreco').append(
				`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
			);
	}
	
	clearTimeout(startCarregamento);
	Swal.close();
}

////////////////// Pagina Principal///////////////////////////////////////////

async function pesq_mov_caixas() {
    try{
        animationLoadingStart();
        
        idemp = $("#idloja").val();
        datapesq = $("#parametro_dia").val();
        
        await $.get('administrativo_action_movcaixasloja.html', async (respHtml)=>$('#resultmov').html(respHtml)).catch((error)=>{ throw error});
        
        await ajaxGet('api/administrativo/resumo-venda.xsjs?idEmpresa=' + idemp + '&dataPesquisa=' + datapesq)
        	.then(retornoTotalVendaLoja)
            .catch((e) => { funcError(), console.log(e) });
        
        await BuscaListaCaixasMov();
        await BuscarMaloteCaixa();
        
        animationLoadingStop();
    } catch(error){
        msgError();
        console.log(error);
    }
 }

function BuscaListaCaixasMov(){
  	
    return ajaxGet('api/administrativo/lista-caixas-movimento.xsjs?idEmpresa=' + idemp + '&dataFechamento=' + datapesq)
	.then(retornoListaCaixasMovimento)
        .catch((e) => { funcError(), console.log(e) });
}

function BuscaExtratoLojaDia(){
    ajaxGet('api/dashboard/extrato-loja-periodo.xsjs?pageSize=500&page=1&idEmpresa=' + idemp + '&dataPesquisaInicio=' + datapesq + '&dataPesquisaFim=' + datapesq)
        .then(retornoListaExtratodaLojaDia)
        .catch((e) => { funcError(), console.log(e) });
}

function BuscaListaPCJCaixasMov(){
  	
    return ajaxGet('api/administrativo/lista-caixas-movimento.xsjs?idEmpresa=' + idemp + '&dataFechamento=' + datapesq)
	.then(retornoListaPCJCaixasMovimento)
        .catch((e) => { funcError(), console.log(e) });
}

function BuscaListaCaixasFechados(){
  	
    return ajaxGet('api/administrativo/lista-caixas-fechados.xsjs?idEmpresa=' + idemp + '&dataFechamento=' + datapesq)
	.then(retornoListaCaixasFechados)
    .catch((e) => { funcError(), console.log(e) });
}

function BuscaVendaVendedor(){
 
    return ajaxGet('api/administrativo/venda-vendedor.xsjs?idEmpresa=' + idemp + '&dataPesquisaInicio=' + datapesq + '&dataPesquisaFim=' + datapesq)
    .then(retornoListaVendasVendedor)
    .catch((e) => { funcError(), console.log(e) });
}

function BuscaVendaAtiva(){
 
    return ajaxGet('api/administrativo/venda-ativa.xsjs?pagesize=1000&status=False&idEmpresa=' + idemp + '&dataFechamento=' + datapesq + '&dataFechamentoFim=' + datapesq)
    .then(retornoListaVendasAtivas)
    .catch((e) => { funcError(), console.log(e) });
}

function BuscaVendaCancelada(){
 
    return ajaxGet('api/administrativo/venda-ativa.xsjs?pagesize=1000&status=True&idEmpresa=' + idemp + '&dataFechamento=' + datapesq + '&dataFechamentoFim=' + datapesq)
    .then(retornoListaVendasCanceladas)
    .catch((e) => { funcError(), console.log(e) });
}

function BuscaFaturas(){
 
     return	ajaxGet('api/administrativo/detalhe-fatura.xsjs?idEmpresa=' + idemp + '&dataPesquisaInic=' + datapesq + '&dataPesquisaFim=' + datapesq)
	.then(retornoTableListFaturaLoja)
    .catch((e) => { funcError(), console.log(e) });
}

function BuscaDespesas(){
 
     return	ajaxGet('api/administrativo/detalhe-despesa.xsjs?idEmpresa=' + idemp + '&dataPesquisa=' + datapesq)
	.then(retornoTableListDespesaLoja)
    .catch((e) => { funcError(), console.log(e) });
}

function BuscaVoucher(){
 
     return	ajaxGet('api/administrativo/detalhe-voucher.xsjs?idEmpresa=' + idemp + '&dataPesquisa=' + datapesq)
	.then(retornoTableListVoucherLoja)
	.catch((e) => { funcError(), console.log(e) });
}

function BuscaVendaConvenio(){
 
	return ajaxGet('api/dashboard/venda/resumo-venda-convenio.xsjs?pagesize=1000&status=False&idEmpresa=' + idemp + '&dataFechamento=' + datapesq )
		.then(retornoTableListVendasConvenio)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaVendaDescontoFunc(){
 
	return ajaxGet('api/dashboard/venda/resumo-venda-convenio-desconto.xsjs?pagesize=1000&status=False&idEmpresa=' + idemp + '&dataInicio=' + datapesq + '&dataFechamento=' + datapesq)
		.then(retornoTableListVendasConvenioDesconto)
		.catch((e) => { funcError(), console.log(e) });
}

//////////Totalizador Dados Topo///////////////////

function retornoTotalVendaLoja(resposta) {

	var recdinheiro = parseFloat(resposta.data[0]['VRRECDINHEIRO']);
	var reccartao = parseFloat(resposta.data[0]['VRRECCARTAO']);
	var recconvenio = parseFloat(resposta.data[0]['VRRECCONVENIO']);
	var recpos = parseFloat(resposta.data[0]['VRRECPOS']);
	var reccheque = parseFloat(resposta.data[0]['VRRECCHEQUE']);
	var QTDClientes = parseFloat(resposta.data[0]['QTDVENDAS']);
	var TotalTicketM = parseFloat(resposta.data[0]['VRTICKETWEB']);

    if (resposta.data[0]['VRRECDINHEIRO'] == null && resposta.data[0]['VRRECCARTAO'] == null && resposta.data[0]['VRRECCONVENIO'] == null && resposta.data[0]['VRRECPOS'] == null && resposta.data[0]['VRRECCHEQUE'] == null) {
		TotalVenda = 0;
    }else{
        TotalVenda = (recdinheiro+reccartao+recconvenio+recpos+reccheque);
    }

    if (resposta.data[0]['QTDVENDAS'] == null) {
		QTDClientes = 0;
    }
    
	if (resposta.data[0]['VRTICKETWEB'] == null) {
		TotalTicketM = 0;
	}
	
	$('.vendaLoja').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(TotalVenda).toFixed(2))}<small class="m-0 l-h-n">Vendas Loja</small></h3>`);
	$('.quantidadeClienteVenda').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${(QTDClientes)}<small class="m-0 l-h-n">Clientes</small></h3>`);
	$('.ticketMedioVenda').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(TotalTicketM).toFixed(2))}<small class="m-0 l-h-n">Ticket Médio</small></h3>`
	);

	ajaxGet('api/administrativo/despesa-loja.xsjs?idEmpresa=' + idemp + '&dataPesquisa=' + datapesq)
		.then(retornoDespesaLoja)
        .catch((e) => { funcError(), console.log(e) });
		
	ajaxGet('api/dashboard/adiantamento-salarial.xsjs?idEmpresa=' + idemp + '&dataPesquisa=' + datapesq)
			.then(retornoAdiantamentoSalarialData)
			.catch((e) => { funcError(), console.log(e) });

}

function retornoDespesaLoja(respostadesp) {

	TotalDesp = respostadesp.data[0]['VRDESPESA'];
	if (respostadesp.data[0]['VRDESPESA'] == null) {
		TotalDesp = 0;
	}

	$('.despesaLoja').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(TotalDesp).toFixed(2))}
                                <small class="m-0 l-h-n">Despesas</small>
                            </h3>`
	);

}

function retornoAdiantamentoSalarialData(respostaAdiant) {

    TotalAdiantamentoSalarial = 0;
    
	TotalAdiantamentoSalarial = parseFloat(respostaAdiant.data[0]['VRADIANTAMENTO']);
	
	$('#tagtotaladiantamento').html(	`<th colspan="4" style="text-align: center;">Total Adiantamento Salarial: (-)</th>
        <th colspan="10" style="text-align: center;"></th>
        <th style="text-align: right;"><label style="color: red;">${mascaraValor(TotalAdiantamentoSalarial.toFixed(2))}</label></th>
        <th colspan="2"></th>`);

}

function funcErrorDespesaLoja(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoDespesaLoja',
		showConfirmButton: false,
		timer: 15000
	});
}
	
//////////LISTA MOVIMENTO DOS CAIXAS DA LOJA///////////////////

//? ============================= INICIO CONFERENCIA DE MALOTE ============================= ?//
//Autor: Hendryw Deyvison 
//E-mail: hendryw.deyvison@gmail.com
//Data: 10/03/2025
// Essa Rotina está dentro da primeira tabela(LISTA DE MOVIMENTAÇÃO DOS CAIXAS) do Menu -> Home deste MODULO

function formataStringComEspaço(string = '') {
    return string?.replace(/ {2,}/g, ' ')?.replace(/(\n\s*){2,}/g, '\n');
}

async function retornoListaPendenciasMaloteSelect(respostaListaEmpresas) {
    let { data } = respostaListaEmpresas || [];

    $('#pendenciasMalote').html(`
        <option value="">Selecione...</option>    
    `);

    for ({ IDLISTAPENDENCIA, TXTPENDENCIA } of data) {
        $('#pendenciasMalote').append(`<option value="${IDLISTAPENDENCIA}"> ${TXTPENDENCIA} </option>`);
    }

    $('#pendenciasMalote').select2();
}

async function montarSelectHistoricoMaloteModal(idMalote, statusMalote) {
    try {
        animationLoadingStart();

        await ajaxGetAllData(`api/financeiro/historicos-malotes.xsjs?idMalote=${idMalote}`)
            .then((resp) => retornoMontarSelectHistoricoMaloteModal(resp, idMalote, statusMalote))
            .catch((error) => {
                throw error;
            });

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoMontarSelectHistoricoMaloteModal(dadosHistoricoMalotes, idMalote, statusMalote) {
    let { data } = dadosHistoricoMalotes || [];

    $('#historicosMalote').html();

    for ({ IDHISTORICOMALOTE, DATAHOTAALTERACAO, STATUSMALOTE } of data) {
        $('#historicosMalote').append(`<option value="idHistorico_${IDHISTORICOMALOTE}">${DATAHOTAALTERACAO} - ${STATUSMALOTE}</option>`);
    }

    $('#historicosMalote').append(`<option value="idMalote_${idMalote}" selected>ATUAL - ${statusMalote}</option>`).select2();

}

async function listarPendenciasMaloteModal() {
    await ajaxGetAllData('api/financeiro/pendencias-malotes.xsjs')
        .then(retornoListaPendenciasMaloteModal)
        .catch((error) => { throw error });
}

function retornoListaPendenciasMaloteModal(pendencias) {
    let { data } = pendencias || [];
    let cont = 0;
    let divisor = data?.length <= 5 ? 1 : data?.length <= 10 ? 2 : 3;
    let contMax = Math.ceil(data?.length / divisor);

    if (data.length > 0) {

        let html = `
            <label class="text-dark h6 fw-900" for="pendenciasMalote">Pendências:</label>
            <div class="row mb-2 ml-3">
        `;

        for ({ IDPENDENCIA, TXTPENDENCIA } of data) {
            html += cont == 0 ? `<div class="d-flex flex-column flex-fill">` : '';
            cont++;

            html += `
                <div class="form-group form-check">
                    <input class="form-check-input" title="${TXTPENDENCIA}" type="checkbox" id="${IDPENDENCIA}" value="${TXTPENDENCIA}">
                    <label class="form-check-label d-inline-block text-dark fw-700" title="${TXTPENDENCIA}" for="${IDPENDENCIA}">${TXTPENDENCIA}</label>
                </div>
            `;

            if (cont == contMax) {
                html += `</div>`;
                cont = 0;
                //html += `<div class="row mb-2">`
            }
        }

        html += `</div>`;

        $('#pendenciasDetalheMalote').html(html);
    }

}

async function BuscarMaloteCaixa() {
    try {
        await ajaxGetAllData(`api/financeiro/malotes-por-loja.xsjs?idEmpresa=${idemp}&dataPesquisaInicio=${datapesq}&dataPesquisaFim=${datapesq}`)
            .then(retornoBuscarMaloteCaixa)
            .catch((error) => { throw error; });
    } catch (error) {
        msgError('Error ao tentar carregar os dados do malote do caixa!, recarregue e tente novamente!');
        console.log(error);
    }
}

function retornoBuscarMaloteCaixa(dadosMalote){
    let { data } = dadosMalote || [];

    if (data.length != 0) {
        for (let registro of data) {
            let idMalote = registro?.IDMALOTE;
            let dataFechamento = registro?.DTHORAFECHAMENTOFORMATADA;
            let noFantasia = registro?.NOFANTASIA;
            let vrRecebidoDinheiro = registro?.VALORTOTALDINHEIRO || 0;
            let vrRecebidoCartao = registro?.VALORTOTALCARTAO || 0;
            let vrRecebidoPos = registro?.VALORTOTALPOS || 0;
            let vrRecebidoPix = registro?.VALORTOTALPIX || 0;
            let vrRecebidoMOOVPAY = registro?.VALORTOTALMOOVPAY || 0;
            let vrRecebidoConvenio = registro?.VALORTOTALCONVENIO || 0;
            let vrRecebidoVoucherLoja = registro?.VALORTOTALVOUCHER || 0;;
            let vrRecebidoFatura = registro?.VALORTOTALFATURA || 0;
            let vrRecebidoFaturaPIX = registro?.VALORTOTALFATURAPIX || 0;;
            let vrDespesa = registro?.VALORTOTALDESPESA || 0;
            let vrAdiantamentoSalario = registro?.VALORTOTALADIANTAMENTOSALARIAL || 0;;
            let vrFisicoDin = registro?.VRFISICODINHEIRO || 0;
            let vrAjusteDin = registro?.VRAJUSTEDINHEIRO || 0;
            let vrRecebidoDin = registro?.VRRECDINHEIRO || 0;
            let vrTotalRecebidoMalote = registro?.VRTOTALRECEBIDO;
            let vrDisponivelMalote = registro?.VRDISPONIVEL;
            let obsFinanceiroMalote = registro?.OBSERVACAOADMINISTRATIVOMALOTE;
            let stAtivoMalote = registro?.STATIVOMALOTE;
            let dataHoraMalote = registro?.DATAHORACRIACAOMALOTE;
            let statusMalote = registro?.STATUSMALOTE || 'Pendente de Envio';
            let textButton = statusMalote == 'Recepcionado' ? '<span class="fal fa-edit"></span>Conferir' : '<span class="fal fa-eye mr-1"></span>Detalhes'
            let classButton = statusMalote == 'Recepcionado' ? 'btn-success' : 'btn-info';
            let btnDetalharMalote = `<button class="btn ${classButton}" type="button" onclick="abrirModalConferenciaMalote(${idMalote}, '${statusMalote}')">${textButton}</button>`;
            let containerButtons = statusMalote !== 'Pendente de Envio' ? btnDetalharMalote : '';
            let classStatus = 'text-info';

            vrDespesaTotal = idMalote ? vrDespesa : parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrTotalVendido = idMalote ? vrTotalRecebidoMalote : parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoCartao) + parseFloat(vrRecebidoPos) + parseFloat(vrRecebidoPix) + parseFloat(vrRecebidoMOOVPAY) + parseFloat(vrRecebidoConvenio) + parseFloat(vrRecebidoVoucherLoja);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoFatura);

            if (statusMalote == 'Enviado' || statusMalote == 'Reenviado') {
                statusMalote += ' e Aguardando Recepção...';
            }

            if (statusMalote == 'Recepcionado') {
                classStatus = 'text-danger';
                statusMalote += ' e Aguardando Conferência...';
            }

            if (statusMalote == 'Conferido') {
                classStatus = 'text-success';

                if ((obsFinanceiroMalote)?.trim()?.length > 0) {
                    classStatus = 'text-primary';
                    statusMalote += ' Com Observações e/ou Pendências';
                }
            }

            if (statusMalote == 'Devolvido') {
                classStatus = 'text-danger';
                statusMalote += ' e Aguardando Reenvio...';
            }

            statusMalote = `<label class="${classStatus} fw-900">${statusMalote}</label>`;

            $('#tagStatusMaloteCaixa').html(`
                <th class="text-center" colspan="4">Situação Malote:</th>
                <th class="text-center" colspan="10"><label class="${classStatus} text-truncate fw-900">${statusMalote}</label></th>
                <th class="text-center" colspan="3">${containerButtons}</th>
            `);

        }

    }
}

async function abrirModalConferenciaMalote(idMalote, statusMalote) {
    try {
        animationLoadingStart();

        await $.get('action_detalhes_malotes.html', async (respHtml) => $('#detDadosMalote').html(respHtml)).catch((error) => { throw error });

        await listarPendenciasMaloteModal().catch((error) => { throw error });

        $('#historicosMalote').html('');
        $('#btnConferenciaMalote, #btnDevolucaoMalote').addClass('d-none').attr('onclick', '');
        $('#dataDevolucaoMalote, #dataConferenciaMalote').closest('h6').addClass('d - none');
        $('#observacaoFinanceiroMalote').removeClass('d-none').prop('readonly', true);
        $("#detStatusMalote").modal('show');

        await ajaxGetAllData('api/gerencia/detalhe-malotes-por-loja.xsjs?idMalote=' + idMalote)
            .then(retornoModalDetalhesMalote)
            .catch((error) => { throw error });

        await montarSelectHistoricoMaloteModal(idMalote, statusMalote);

        animationLoadingStop()
    } catch (error) {
        console.error(error);
        msgError();
    }
}

function retornoModalDetalhesMalote({ data }) {

    if (data?.length === 0) {
        return msgWarning('Atenção!', 'Não foi possível carregar os detalhes do Malote!');
    }

    let {
        NOFANTASIA,
        IDMALOTE,
        DATAMOVIMENTOCAIXA,
        NOFUNCIONARIOCRIACAO,
        DATAHORACRIACAO,
        NOFUNCIONARIOENVIO,
        DATAHORAENVIADO,
        NOFUNCIONARIOREENVIO,
        DATAHORAREENVIADO,
        NOFUNCIONARIORECEPCAO,
        DATAHORARECEBIDO,
        NOFUNCIONARIOCONFERENCIA,
        DATAHORACONFERIDO,
        NOFUNCIONARIODEVOLUCAO,
        DATAHORADEVOLVIDO,
        STATUSMALOTE,
        OBSERVACAOADMINISTRATIVO,
        OBSERVACAOLOJA,
        PENDENCIAS
    } = data[0];
    let classStatus = 'text-danger';
    let msgStatus = STATUSMALOTE;
    let rowsObsLoja = OBSERVACAOLOJA?.length > 0 ? 5 : 1;
    let rowsObsFinanceiro = (STATUSMALOTE == 'Recepcionado' || OBSERVACAOADMINISTRATIVO?.length > 0) ? 5 : 1;

    if (STATUSMALOTE == 'Enviado') {
        classStatus = 'text-info';
        msgStatus += ' e Aguardando Recebimento...';
    }

    if (STATUSMALOTE == 'Recepcionado') {
        classStatus = 'text-info';
        msgStatus += ' e Aguardando Conferência...';

        $('#observacaoFinanceiroMalote').prop('readonly', false);

        $('#btnConferenciaMalote').attr('onclick', `updateDadosMalote(${IDMALOTE}, 'Conferência')`).removeClass('d-none');
        $('#btnDevolucaoMalote').attr('onclick', `updateDadosMalote(${IDMALOTE}, 'Devolução')`).removeClass('d-none');
    }

    if (STATUSMALOTE == 'Conferido') {
        classStatus = 'text-success';
    }

    $('#nomeEmpresaMalote').text(NOFANTASIA);
    $('#dataMovimentoCaixaMalote').text(DATAMOVIMENTOCAIXA);
    $('#idMaloteModal').text(IDMALOTE);
    $('#usuarioCriacaoMalote').text(NOFUNCIONARIOCRIACAO);
    $('#dataCriacaoMalote').text(DATAHORACRIACAO);
    $('#usuarioEnviadoMalote').text(NOFUNCIONARIOENVIO || '');
    $('#dataEnviadoMalote').text(DATAHORAENVIADO || '');
    $('#usuarioRecepcaoMalote').text(NOFUNCIONARIORECEPCAO || '');
    $('#dataRecepcaoMalote').text(DATAHORARECEBIDO || '');
    $('#usuarioConferenciaMalote').text(NOFUNCIONARIOCONFERENCIA || '');
    $('#dataConferenciaMalote').text(DATAHORACONFERIDO || '');
    $('#usuarioDevolucaoMalote').text(NOFUNCIONARIODEVOLUCAO || '');
    $('#dataDevolucaoMalote').text(DATAHORADEVOLVIDO || '');
    $('#usuarioReenviadoMalote').text(NOFUNCIONARIOREENVIO || '');
    $('#dataReenviadoMalote').text(DATAHORAREENVIADO || '');
    $('#statusMaloteModal').html(`Status: <span class="${classStatus} fw-500">${msgStatus}</span>`);

    $('#observacaoLojaMalote').text(OBSERVACAOLOJA || '').attr('rows', rowsObsLoja);
    $('#observacaoFinanceiroMalote').text(OBSERVACAOADMINISTRATIVO || '').attr('rows', rowsObsFinanceiro);

    DATAHORADEVOLVIDO && $('#usuarioDevolucaoMalote, #dataDevolucaoMalote').closest('h6').removeClass('d-none');
    DATAHORAREENVIADO && $('#usuarioReenviadoMalote, #dataReenviadoMalote').closest('h6').removeClass('d-none');

    if (STATUSMALOTE == 'Devolvido') {
        $('#dataDevolucaoMalote').closest('h6').removeClass('d-none');
    }

    if (PENDENCIAS?.length > 0) {
        for ({ IDPENDENCIA } of PENDENCIAS) {
            $(`#pendenciasDetalheMalote input[id="${IDPENDENCIA}"]`).prop('checked', true);
        }
    }

    if (STATUSMALOTE !== 'Recepcionado') {
        $('#pendenciasDetalheMalote input').prop('disabled', true);
        $('#observacaoFinanceiroMalote').prop('readonly', true);
    }

    $('#pendenciasDetalheMalote, #btnImprimirDetalhesMalote, #btnExibirHistoricoMalote').removeClass('d-none');

    $('#notificacaoUsuario').addClass('invisible');
}

async function exibirHistoricoMaloteModal(idHistoricoORidMalote) {
    try {
        idHistoricoORidMalote = idHistoricoORidMalote.split('_');
        let tipo = idHistoricoORidMalote[0];
        let id = idHistoricoORidMalote[1]

        animationLoadingStart();

        await $.get('action_detalhes_malotes.html', async (respHtml) => $('#detDadosMalote').html(respHtml)).catch((error) => { throw error });

        await listarPendenciasMaloteModal().catch((error) => { throw error });

        $('#pendenciasDetalheMalote').removeClass('d-none');

        if (tipo == 'idHistorico') {
            $('#notificacaoUsuario').removeClass('invisible');

            await ajaxGetAllData(`api/financeiro/historicos-malotes.xsjs?idHistoricoMalote=${id}`)
                .then(retornoExibirHistoricoMaloteModal)
                .catch((error) => {
                    throw error;
                });
        } else {
            $('#notificacaoUsuario').addClass('invisible');

            await ajaxGetAllData(`api/gerencia/detalhe-malotes-por-loja.xsjs?idMalote=${id}`)
                .then(retornoModalDetalhesMalote)
                .catch((error) => { throw error });
        }

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoExibirHistoricoMaloteModal({ data }) {
    if (data?.length === 0) {
        return msgWarning('Atenção!', 'Não foi possível carregar os detalhes do Malote!');
    }

    let {
        NOFANTASIA,
        IDMALOTE,
        DATAMOVIMENTOCAIXA,
        NOFUNCIONARIOCRIACAO,
        DATAHORACRIACAO,
        NOFUNCIONARIOENVIO,
        DATAHORAENVIADO,
        NOFUNCIONARIOREENVIO,
        DATAHORAREENVIADO,
        NOFUNCIONARIORECEPCAO,
        DATAHORARECEBIDO,
        NOFUNCIONARIOCONFERENCIA,
        DATAHORACONFERIDO,
        NOFUNCIONARIODEVOLUCAO,
        DATAHORADEVOLVIDO,
        STATUSMALOTE,
        OBSERVACAOADMINISTRATIVO,
        OBSERVACAOLOJA,
        PENDENCIAS
    } = data[0];

    let classStatus = 'text-danger';
    let msgStatus = STATUSMALOTE;
    let rowsObsFinanceiro = OBSERVACAOADMINISTRATIVO?.length > 0 ? 5 : 1;
    let rowsObsLoja = OBSERVACAOLOJA?.length > 0 ? 5 : 1;

    if (STATUSMALOTE == 'Criacao') {
        classStatus = 'text-info';
    }

    if (STATUSMALOTE == 'Enviado') {
        classStatus = 'text-info';
        msgStatus += ' e Aguardando Recebimento...';
    }

    if (STATUSMALOTE == 'Recepcionado') {
        classStatus = 'text-info';
        msgStatus += ' e Aguardando Conferência...';
    }

    if (STATUSMALOTE == 'Conferido') {
        classStatus = 'text-success';
    }

    $('#nomeEmpresaMalote').text(NOFANTASIA);
    $('#dataMovimentoCaixaMalote').text(DATAMOVIMENTOCAIXA);
    $('#idMaloteModal').text(IDMALOTE);
    $('#usuarioCriacaoMalote').text(NOFUNCIONARIOCRIACAO);
    $('#dataCriacaoMalote').text(DATAHORACRIACAO);
    $('#usuarioEnviadoMalote').text(NOFUNCIONARIOENVIO || '');
    $('#dataEnviadoMalote').text(DATAHORAENVIADO || '');
    $('#usuarioRecepcaoMalote').text(NOFUNCIONARIORECEPCAO || '');
    $('#dataRecepcaoMalote').text(DATAHORARECEBIDO || '');
    $('#usuarioConferenciaMalote').text(NOFUNCIONARIOCONFERENCIA || '');
    $('#dataConferenciaMalote').text(DATAHORACONFERIDO || '');
    $('#usuarioDevolucaoMalote').text(NOFUNCIONARIODEVOLUCAO || '');
    $('#dataDevolucaoMalote').text(DATAHORADEVOLVIDO || '');
    $('#usuarioReenviadoMalote').text(NOFUNCIONARIOREENVIO || '');
    $('#dataReenviadoMalote').text(DATAHORAREENVIADO || '');
    $('#statusMaloteModal').html(`Status: <span class="${classStatus} fw-500">${msgStatus}</span>`);

    $('#observacaoLojaMalote').text(OBSERVACAOLOJA || '').attr('rows', rowsObsLoja).prop('disabled', true);
    $('#observacaoFinanceiroMalote').text(OBSERVACAOADMINISTRATIVO || '').attr('rows', rowsObsFinanceiro).prop('disabled', true);

    DATAHORADEVOLVIDO && $('#usuarioDevolucaoMalote, #dataDevolucaoMalote').closest('h6').removeClass('d-none');
    DATAHORAREENVIADO && $('#usuarioReenviadoMalote, #dataReenviadoMalote').closest('h6').removeClass('d-none');

    $(`#pendenciasDetalheMalote input`).prop('checked', false);

    if (PENDENCIAS?.length > 0) {
        for ({ IDPENDENCIA } of PENDENCIAS) {
            $(`#pendenciasDetalheMalote input[id="${IDPENDENCIA}"]`).prop('checked', true);
        }
    }

    $('#pendenciasDetalheMalote input').prop('disabled', true);

    $('#btnExibirHistoricoMalote').attr('onclick', `montarSelectHistoricoMaloteModal(${IDMALOTE})`);

    $('#dataDevolucaoMalote, #btnImprimirDetalhesMalote, #btnExibirHistoricoMalote').removeClass('d-none');
    $('#btnConferenciaMalote, #btnDevolucaoMalote').addClass('d-none');
}

function imprimirDetalhesMalote() {
    let conteudo = $('#detStatusMalote .modal-body').clone();
    let pendencias = $(conteudo).find('#pendenciasDetalheMalote input[type="checkbox"]:checked');
    let obsFinanceiro = $(conteudo).find('#observacaoFinanceiroMalote')?.val();
    let htmlPendencias = '<label label class="text-dark fw-900 h6" for="observacaoFinanceiroMalote" > Pendências:</label> Não Há Pendências';
    let htmlObs = '<label label class="text-dark fw-900 h6" >Observações Financeiro:</label> Não Há Observações';;

    if ($('#historicosMalote').val().split('_')[0] == 'idHistorico') {
        conteudo.find('#notificacaoUsuario').html(`
            <div class="alert alert-info alert-dismissible text-center mb-2 p-2 fade show h6" role="alert">
                <span class="d-block fw-900">Impressão de Historico </span>
                <span> Data: ${$('#historicosMalote').select2('data')[0].text.split(' - ')[0]}</span>
            </div>
        `)
    }

    if (pendencias?.length > 0) {
        htmlPendencias = '';

        for ({ value } of pendencias) {
            htmlPendencias += `<li>${value}</li>`
        }

        htmlPendencias = `
            <label class="text-dark fw-900 h6" for="observacaoFinanceiroMalote">Pendências:</label>
            <ul>${htmlPendencias}</ul>
        `;

    }

    if (obsFinanceiro?.length > 0) {
        htmlObs = `
            <label class="text-dark fw-900 h6" for="observacaoFinanceiroMalote">Observações Financeiro:</label> 
            <ul>
                <li>
                    <p>${obsFinanceiro?.toUpperCase()}</p>
                </li>
            </ul>
        `;
    }

    conteudo.find('#titleMalote').removeClass('d-none')
    conteudo.find('#containerHistoricosMalote').addClass('d-none');
    conteudo.find('#pendenciasDetalheMalote').html(htmlPendencias);
    conteudo.find('#observacaoFinanceiroMalote').parent().html(htmlObs);
    conteudo.find('#observacaoLojaMalote').parent().addClass('d-none')

    let janelaImpressao = window.open('', '', '');

    janelaImpressao.document.open();
    janelaImpressao.document.write(`
        <html>
            <head>
                <title>Impressão</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                <style> 
                    button {
                        display: none !important;
                    }
                </style>
            </head>
            <body>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
                 <script>
                    window.onafterprint = function() {
                        window.close();
                    };

                    window.onload = function() {
                        window.print();
                    };
                </script>
                ${conteudo.html()}
            </body>
        </html>
    `);

    janelaImpressao.document.close();
}

async function updateDadosMalote(idMalote, modo) {
    let dadosSessaoUser = (await getCurrentUser())?.user;
    let idUser = dadosSessaoUser?.id;
    let OBSERVACAOADMINISTRATIVO = formataStringComEspaço($('#observacaoFinanceiroMalote').val()?.trim()?.toUpperCase()) || '';
    let STATUS = modo == 'Conferência' ? 'Conferido' : 'Devolvido';
    let inputsPendenciasSelecionados = $('#pendenciasDetalheMalote input[type="checkbox"]:checked');
    let PENDENCIAS = [];

    if (!idUser) {
        return msgError('Erro ao tentar recuperar os dados da Sessão do Usuário, faça o logoff e entre novamente no sistema!');
    }

    for ({ id } of inputsPendenciasSelecionados) {
        PENDENCIAS.push({ IDPENDENCIA: Number(id) });
    }

    if (STATUS == 'Devolvido' && !OBSERVACAOADMINISTRATIVO?.length && !PENDENCIAS?.length) {
        return msgWarning('Para devolver o malote é necessário selecionar as pendências e/ou informar a observação!');
    }

    let dados = [
        {
            IDMALOTE: idMalote,
            STATUS,
            OBSERVACAOADMINISTRATIVO,
            PENDENCIAS,
            IDUSERULTIMAALTERACAO: idUser
        }
    ];

    msgQuestion(`Deseja realmente confirmar a ${modo} do Malote?`)
        .then(async (respModal) => {
            try {

                if (respModal.value !== true) return;

                animationLoadingStart('Atualizando Status do Malote...', 1, false);

                await ajaxPut('api/financeiro/malotes-por-loja.xsjs', dados).catch((error) => { throw error });

                await msgSuccess('Malote Recebido com Sucesso!');

                $("#detStatusMalote").modal('hide');

                pesq_mov_caixas();

            } catch (error) {
                console.error(error);
                msgError('Erro ao tentar atualizar o status do malote, recarregue e tente novamente!');
            }
        })
}

//? ============================= FIM CONFERENCIA DE MALOTE ============================= ?//

function retornoListaCaixasMovimento(respostaListaCaixaMovimento) {

    var TotalFatura = 0;
    var TotalFaturaPIX = 0;
    var TotalFaturas = 0;
    var VrFaturasTotal = 0;
    var TotalCartao = 0;
    var TotalDinheiro = 0;
    var TotalPOS = 0;
    var TotalPIX = 0;
    var TotalMOOVPAY = 0;
    var TotalVoucher = 0;
    var TotalConvenio = 0;
    var TotalCaixa = 0;
    var VrDisponivel = 0;
    var TotalDiponivel = 0;
    var TotalVendido = 0;
    var TotalQuebraCaixaMov = 0;

    var TotalPCJ = 0;
    var PCJTotal = 0;
    var TotalPCJ18 = 0;
    var TotalPCJ78 = 0;



    if (respostaListaCaixaMovimento['rows'] > 0) {

        $('#resultadomovdia').html(

            `<table id="" class="table table-bordered table-hover table-responsive-lg table-striped w-100" width="100%">

                <tbody id="resultadoMovLojaDia">
                    <tr>
                        <th class="bg-primary-700" style="font-size: 10px;">Nº Movimento</th> 
                        <th class="bg-primary-700" style="font-size: 10px;">Caixa</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Abertura</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Operador</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Fatura</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Fatura PIX</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Total Fatura</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Dinheiro</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Cartao</th>
                        <th class="bg-primary-700" style="font-size: 10px;">% PCJ</th>
                        <th class="bg-primary-700" style="font-size: 10px;">POS</th>
                        <th class="bg-primary-700" style="font-size: 10px;">PIX</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Voucher</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Convênio</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Total</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Disponível</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Situação</th>
                    </tr>
                </tbody>
                <tfoot class="thead-themed totalCaixasAdministrativo">
                </tfoot>
            </table>`);

        for (var i = 0; i < respostaListaCaixaMovimento.data.length; i++) {

            IDCaixa = respostaListaCaixaMovimento.data[i].caixa['IDCAIXAWEB'];
            IDMovimentoCaixa = respostaListaCaixaMovimento.data[i].caixa['ID'];
            NomeCaixa = respostaListaCaixaMovimento.data[i].caixa['DSCAIXA'];
            DTAbertura = respostaListaCaixaMovimento.data[i].caixa['DTABERTURA'];
            NomeOperador = respostaListaCaixaMovimento.data[i].caixa['NOFUNCIONARIO'];
            SituacaoCaixa = respostaListaCaixaMovimento.data[i].caixa['STFECHADO'];
            VrInformadoDinheiro = respostaListaCaixaMovimento.data[i].caixa['VRRECDINHEIRO'];

            RecFatura = parseFloat(respostaListaCaixaMovimento.data[i].fatura[0]['fatura-movimento']['TOTALRECEBIDOFATURA']);
            RecFaturaPIX = parseFloat(respostaListaCaixaMovimento.data[i].faturapix[0]['fatura-movimento-pix']['TOTALRECEBIDOFATURAPIX']);
            RecDinheiro = parseFloat(respostaListaCaixaMovimento.data[i].venda[0]['venda-movimento']['TOTALVENDIDODINHEIRO']);
            RecCartao = parseFloat(respostaListaCaixaMovimento.data[i].venda[0]['venda-movimento']['TOTALVENDIDOCARTAO']);
            RecPOS = parseFloat(respostaListaCaixaMovimento.data[i].venda[0]['venda-movimento']['TOTALVENDIDOPOS']);
            RecPIX = parseFloat(respostaListaCaixaMovimento.data[i].venda[0]['venda-movimento']['TOTALVENDIDOPIX']);
            RecMOOVPAY = parseFloat(respostaListaCaixaMovimento.data[i].venda[0]['venda-movimento']['TOTALVENDIDOMOOVPAY']);
            RecVoucher = parseFloat(respostaListaCaixaMovimento.data[i].venda[0]['venda-movimento']['TOTALVENDIDOVOUCHER']);
            RecConvenio = parseFloat(respostaListaCaixaMovimento.data[i].venda[0]['venda-movimento']['TOTALVENDIDOCONVENIO']);
            VrVendido = parseFloat(respostaListaCaixaMovimento.data[i].venda[0]['venda-movimento']['TOTALVENDIDO']);
            TotalNota = parseFloat(respostaListaCaixaMovimento.data[i].venda[0]['venda-movimento']['TOTALNOTA']);

            VrPCJ18 = parseFloat(respostaListaCaixaMovimento.data[i].vendapcj[0]['venda-pcj']['TOTALPCJ18']);
            VrPCJ78 = parseFloat(respostaListaCaixaMovimento.data[i].vendapcj[0]['venda-pcj']['TOTALPCJ78']);
            PCJTotal = (parseFloat(VrPCJ78) / parseFloat(VrPCJ18)) * 100;

            if (PCJTotal > 0) {
                PCJTotal = PCJTotal;
                if (PCJTotal < 30) {
                    corPCJ = '<label style="color: red;">' + mascaraValor(PCJTotal.toFixed(2)) + '</label>';
                } else {
                    corPCJ = '<label style="color: blue;">' + mascaraValor(PCJTotal.toFixed(2)) + '</label>';
                }
            } else {
                PCJTotal = 0;
                corPCJ = '<label style="color: red;">' + mascaraValor(PCJTotal.toFixed(2)) + '</label>';
            }

            TotalPCJ18 = TotalPCJ18 + VrPCJ18;
            TotalPCJ78 = TotalPCJ78 + VrPCJ78;


            if (RecFatura > 0) {
                RecFatura = RecFatura;
            } else {
                RecFatura = 0;
            }

            if (RecFaturaPIX > 0) {
                RecFaturaPIX = RecFaturaPIX;
            } else {
                RecFaturaPIX = 0;
            }

            if (RecCartao > 0) {
                RecCartao = RecCartao;
            } else {
                RecCartao = 0;
            }

            if (RecDinheiro > 0) {
                RecDinheiro = RecDinheiro;
            } else {
                RecDinheiro = 0;
            }

            if (RecPOS > 0) {
                RecPOS = RecPOS;
            } else {
                RecPOS = 0;
            }

            if (RecPIX > 0) {
                RecPIX = RecPIX;
            } else {
                RecPIX = 0;
            }

            if (RecMOOVPAY > 0) {
                RecMOOVPAY = RecMOOVPAY;
            } else {
                RecMOOVPAY = 0;
            }

            if (RecVoucher > 0) {
                RecVoucher = RecVoucher;
            } else {
                RecVoucher = 0;
            }

            if (RecConvenio > 0) {
                RecConvenio = RecConvenio;
            } else {
                RecConvenio = 0;
            }

            if (VrVendido > 0) {
                VrVendido = VrVendido;
            } else {
                VrVendido = 0;
            }

            VrDisponivel = RecDinheiro + RecFatura;
            VrFaturasTotal = RecFatura + RecFaturaPIX;
            TotalFatura = TotalFatura + RecFatura;
            TotalFaturaPIX = TotalFaturaPIX + RecFaturaPIX;
            TotalCartao = TotalCartao + RecCartao;
            TotalDinheiro = TotalDinheiro + RecDinheiro;
            TotalPOS = TotalPOS + RecPOS;
            TotalPIX = TotalPIX + RecPIX;
            TotalMOOVPAY = TotalMOOVPAY + RecMOOVPAY;
            TotalVoucher = TotalVoucher + RecVoucher;
            TotalConvenio = TotalConvenio + RecConvenio;

            TotalFaturas = TotalFatura + TotalFaturaPIX;

            TotalVendido = (RecDinheiro + RecCartao + RecPOS + RecConvenio + RecVoucher + RecPIX + RecMOOVPAY);

            TotalCaixa = (TotalDinheiro + TotalCartao + TotalPOS + TotalConvenio + TotalPIX + TotalVoucher + TotalMOOVPAY);
            TotalDisponivel = TotalDinheiro + TotalFatura;

            TotalQuebraCaixaMov = parseFloat(VrInformadoDinheiro) - parseFloat(RecDinheiro);

            if (SituacaoCaixa == 'False') {
                SituacaoCaixa = '<td style="text-align: center; font-size: 10px;"><label style="color:blue;">ABERTO</label></td>';
            } else {
                SituacaoCaixa = '<td style="text-align: center; font-size: 10px;"><label style="color:red;">FECHADO</label></td>';
            }

            $('#resultadoMovLojaDia').append(
                `<tr>
			    	<td style="font-size: 08px;">` + IDMovimentoCaixa + `</td>
				    <td><label style="color: blue;">` + IDCaixa + ` - ` + NomeCaixa + `</label></td>
				    <td><label style="color: blue;">` + DTAbertura + `</label></td>
				    <td><label style="color: blue;">` + NomeOperador + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecFatura.toFixed(2)) + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecFaturaPIX.toFixed(2)) + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(VrFaturasTotal.toFixed(2)) + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecDinheiro.toFixed(2)) + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecCartao.toFixed(2)) + `</label></td>
                    <td style="text-align: right;">` + corPCJ + `</td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecPOS.toFixed(2)) + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecPIX.toFixed(2)) + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecVoucher.toFixed(2)) + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecConvenio.toFixed(2)) + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(TotalVendido.toFixed(2)) + `</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(VrDisponivel.toFixed(2)) + `</label></td>`
                + SituacaoCaixa +
                `</tr>`
            );

            var dados = {
                "ID": IDMovimentoCaixa,
                "VRFISICODINHEIRO": parseFloat(RecDinheiro),
                "VRQUEBRACAIXA": parseFloat(TotalQuebraCaixaMov)
            };

            ajaxPut("api/movimento-caixa/ajuste-fisicodinheiro.xsjs", dados)
                .then(funcSucessEditarDinheiroFisico)
                .catch((e) => { funcError(), console.log(e) });

        }
        TotalPCJ = (parseFloat(TotalPCJ78) / parseFloat(TotalPCJ18)) * 100;

        $('.totalCaixasAdministrativo').html(
            `<tr>
                <th colspan="4" style="text-align: center;">Total dos Caixas</th>
                <th style="text-align: right;">${mascaraValor(TotalFatura.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalFaturaPIX.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalFaturas.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalDinheiro.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalCartao.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalPCJ.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalPOS.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalPIX.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVoucher.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalConvenio.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalCaixa.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalDisponivel.toFixed(2))}</th>
                <th colspan="1"><input type="hidden" name="VrTotalDisponivel" id="VrTotalDisponivel" value="${TotalDisponivel}"></th>
            </tr>
            <tr id="tagtotaldespesa">tr>
            <tr id="tagtotaladiantamento">tr>
            <tr id="tagtotalquebra">tr>
            <tr id="tagtotaldisponivel">tr>
            <tr id="tagStatusMaloteCaixa">tr>`
        );

        return ajaxGet('api/administrativo/despesa-loja.xsjs?idEmpresa=' + idemp + '&dataPesquisa=' + datapesq)
            .then(retornoDespesaLojaCaixa)
            .catch((e) => { funcError(), console.log(e) });

    } else {

    }

}

function funcSucessEditarDinheiroFisico(resposta) {
		
}

function funcErrorEditarDinheiroFisico(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessEditarDinheiroFisico',
		showConfirmButton: false,
		timer: 15000
	});
}

function retornoDespesaLojaCaixa(respostadDespCaixa) {

	TotalDespCaixa = parseFloat(respostadDespCaixa.data[0]['VRDESPESA']);
	
	if (TotalDespCaixa >0) {
		TotalDespCaixa = TotalDespCaixa;
	}else{
	    TotalDespCaixa = 0;
	}

	$('#tagtotaldespesa').html(	`<th colspan="4" style="text-align: center;">Total Despesas: (-)</th>
	<th colspan="10" style="text-align: center;"></th>
	<th style="text-align: right;"><label style="color: red;">${mascaraValor(TotalDespCaixa.toFixed(2))}</label></th>
	<th colspan="2"></th>`);

		return ajaxGet('api/administrativo/quebra-caixa-loja.xsjs?idEmpresa=' + idemp + '&dataPesquisa=' + datapesq)
			.then(retornoQuebraCaixaLoja)
			.catch((e) => { funcError(), console.log(e) });
			
}

function retornoQuebraCaixaLoja(respostadQuebraCaixa) {

    QuebraCaixaDinheiroTotal = 0;
    QuebraCaixaDinheiro = 0;
    QuebraCaixaDinheiroFisicoTotal = 0;

    if(respostadQuebraCaixa.data.length != 0){
        
	    for (var i = 0; i < respostadQuebraCaixa.data.length; i++) {
	    
    	QuebraCaixaDinheiroRec = parseFloat(respostadQuebraCaixa.data[i]['VRFISICODINHEIRO']);
    	QuebraCaixaDinheiroInf = parseFloat(respostadQuebraCaixa.data[i]['VRRECDINHEIRO']);
    	QuebraCaixaDinheiroAjuste = parseFloat(respostadQuebraCaixa.data[i]['VRRECDINHEIROAJUSTE']);

    	if(QuebraCaixaDinheiroAjuste>0){
    	    QuebraCaixaDinheiro = QuebraCaixaDinheiroAjuste;
    	   
    	}else{
    	    QuebraCaixaDinheiro = QuebraCaixaDinheiroInf;
    	    
    	}
    	
    	QuebraCaixaDinheiroTotal = QuebraCaixaDinheiroTotal + QuebraCaixaDinheiro;
    	QuebraCaixaDinheiroFisicoTotal = QuebraCaixaDinheiroFisicoTotal + QuebraCaixaDinheiroRec;
    	
    	TotalQuebraCaixa = QuebraCaixaDinheiroTotal - QuebraCaixaDinheiroFisicoTotal;
    
        if(TotalQuebraCaixa>0){
            $('#tagtotalquebra').html(	`<th colspan="4" style="text-align: center;">Total Quebra (só caixas fechados): (+)</th>
        	<th colspan="10" style="text-align: center;"></th>
        	<th style="text-align: right;"><label style="color: blue;"> + ${mascaraValor(TotalQuebraCaixa.toFixed(2))}</label></th>
        	<th colspan="2"></th>`);
        }else{
            $('#tagtotalquebra').html(	`<th colspan="4" style="text-align: center;">Total Quebra (só caixas fechados): (-)</th>
        	<th colspan="10" style="text-align: center;"></th>
        	<th style="text-align: right;"><label style="color: red;"> - ${mascaraValor(TotalQuebraCaixa.toFixed(2))}</label></th>
        	<th colspan="2"></th>`);
        }
	}
    }else{
        
        TotalQuebraCaixa = 0;
        
            $('#tagtotalquebra').html(	`<th colspan="4" style="text-align: center;">Total Quebra (só caixas fechados): (-)</th>
        	<th colspan="10" style="text-align: center;"></th>
        	<th style="text-align: right;"><label style="color: red;"> - ${mascaraValor(TotalQuebraCaixa.toFixed(2))}</label></th>
        	<th colspan="2"></th>`);
    }
	    TotalCaixasDisponivel = parseFloat($('#VrTotalDisponivel').val());
	
	    TotalDisponivel = (TotalCaixasDisponivel - TotalDespCaixa  - TotalAdiantamentoSalarial) + TotalQuebraCaixa;
    	
    	$('#tagtotaldisponivel').html(	`<th colspan="4" style="text-align: center;">Total Disponível (Dinheiro + Faturas - Despesas  - Adiantamentos - Quebra): </th>
    	<th colspan="10" style="text-align: center;"></th>
    	<th style="text-align: right;">${mascaraValor(TotalDisponivel.toFixed(2))}</th>
    	<th colspan="2"></th>`);
    	
    	BuscaExtratoLojaDia();
    
}

function funcErrorListaCaixasMovimento(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoListaCaixasMovimento',
		showConfirmButton: false,
		timer: 15000
	});
}

function funcErrorQuebraCaixaLoja(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoQuebraCaixaLoja',
		showConfirmButton: false,
		timer: 15000
	});
}

function funcErrorDespesaLojaCaixa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoDespesaLojaCaixa',
		showConfirmButton: false,
		timer: 15000
	});
}

/////////////Lista Extrato de Contas da Loja /////////////////////////////////

function retornoListaExtratodaLojaDia(respostaListaExtratoLojaDia) {

var numPageAtual = parseInt(respostaListaExtratoLojaDia.page);
var saldoAnterior = 0;
var TotalQuebraCaixaCalc = 0;

    if (respostaListaExtratoLojaDia.data.length > 0){
        
        saldoAnterior = 0;
        TotalQuebraCaixaCalc = 0;
        
        saldoAnterior = parseFloat(saldoAnterior) + parseFloat(TotalQuebraCaixaCalc);
        
        $('#resultadodia').html(
            `<table id="" class="table table-bordered table-hover table-responsive-lg table-striped w-100" width="100%">

                <tbody id="resultadoExtratoLojaDia">
                    <tr>
                        <th class="bg-primary-700" style="font-size: 12px;">Dt. Lanç.</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Histórico</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Pago A</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Despesa</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Débito</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Crédito</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Saldo</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Situação</th>
                    </tr>
                </tbody>
            </table>`);

        for (let i = 0; i < respostaListaExtratoLojaDia.data.length; i++) {
            let ret = respostaListaExtratoLojaDia.data[i];
            let valorTotalDinheiro = ret['venda']['VRRECDINHEIRO'];
            let dataExtrato = ret['venda']['DTHORAFECHAMENTOFORMATADA']; 

            saldoAnterior = parseFloat(saldoAnterior) + parseFloat(valorTotalDinheiro);
            
            if (i > 0) {
                $('#resultadoExtratoLojaDia').append(
                    `<tr>
                            <td colspan="8"></td>
                        </tr>
                        <tr>
                            <td colspan="8"></td>
                        </tr>`);
            }

            $('#resultadoExtratoLojaDia').append(
                `</tr> 
                        <tr class="table-success">
                        <td style="font-size: 12px;">` + dataExtrato + `</td>
                        <td style="font-size: 12px;">Mov. Dinheiro do Caixa ` + dataExtrato + `</td>
                        <td style="font-size: 12px;">Vendas Dinheiro</td>
                        <td></td>
                        <td style="text-align:right; font-size: 12px;"><b>0,00<b></td>
                        <td style="text-align:right; font-size: 12px;">
                        <b>` + mascaraValor(parseFloat(valorTotalDinheiro).toFixed(2)) + `</b></td>
                        <td style="text-align:right; font-size: 12px;"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                        <td style="text-align:right; font-size: 12px;"></td>
                    </tr>`);


            if (ret['totalFaturas'].length > 0) {
                let dataFatura = ret['totalFaturas'][0]['DTPROCESSAMENTOFORMATADA']; 
                let valorTotalFatura = ret['totalFaturas'][0]['VRRECEBIDO'];

                saldoAnterior = parseFloat(saldoAnterior) + parseFloat(valorTotalFatura);
                
                $('#resultadoExtratoLojaDia').append(
                    `</tr> 
                            <tr class="table-success">
                            <td style="font-size: 12px;">` + dataFatura + `</td>
                            <td style="font-size: 12px;">Mov. Fatura ` + dataFatura + `</td>
                            <td style="font-size: 12px;">Recebimento de Faturas</td>
                            <td></td>
                            <td style="text-align:right; font-size: 12px;"><b>0,00<b></td>
                            <td style="text-align:right; font-size: 12px;">
                            <b>` + mascaraValor(parseFloat(valorTotalFatura).toFixed(2)) + `</b></td>
                            <td style="text-align:right; font-size: 12px;"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                            <td style="text-align:right; font-size: 12px;"></td>
                        </tr>`);
            }
            if (ret['despesas'].length > 0) {
                for (let j = 0; j < ret['despesas'].length; j++) {
                    let dataDespesa = ret['despesas'][j]['DTDESPESAFORMATADA'];
                    let pagoA = ret['despesas'][j]['DSPAGOA'];
                    let historico = ret['despesas'][j]['DSHISTORIO'];
                    let nomeCategoria = ret['despesas'][j]['DSCATEGORIA'];
                    let valorDespesa = ret['despesas'][j]['VRDESPESA'];

                    saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorDespesa);

                    $('#resultadoExtratoLojaDia').append(
                        ` <tr class="table-danger">
                                <td style="font-size: 12px;">` + dataDespesa + `</td>
                                <td style="font-size: 12px;">` + historico + `</td>
                                <td style="font-size: 12px;">` + pagoA + `</td>
                                <td style="text-align:center; font-size: 12px;">` + nomeCategoria + `</td>
                                <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                <b>` + mascaraValor(parseFloat(valorDespesa).toFixed(2)) + `</b></td>
                                <td style="text-align:right; font-size: 12px;"><b>0,00</b></td>
                                <td style="text-align:right; font-size: 12px;"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                                <td style="text-align:right; font-size: 12px;"></td>
                            </tr>`);
                }
            }
            if (ret['adiantamentos'].length > 0) {
                for (let j = 0; j < ret['adiantamentos'].length; j++) {
                    let dataDespesaAdiant = ret['adiantamentos'][j]['DTLANCAMENTOADIANTAMENTO'];
                    let pagoAAdiant = ret['adiantamentos'][j]['NOFUNCIONARIO'];
                    let historicoAdiant = 'Adiantamento de Salário';
                    let nomeCategoriaAdiant = ret['adiantamentos'][j]['DSMOTIVO'];
                    let valorDespesaAdiant = ret['adiantamentos'][j]['VRVALORDESCONTO'];

                    saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorDespesaAdiant);

                    $('#resultadoExtratoLojaDia').append(
                        ` <tr class="table-danger">
                                <td style="font-size: 12px;">` + dataDespesaAdiant + `</td>
                                <td style="font-size: 12px;">` + historicoAdiant + `</td>
                                <td style="font-size: 12px;">` + pagoAAdiant + `</td>
                                <td style="text-align:center; font-size: 12px;">` + nomeCategoriaAdiant + `</td>
                                <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                <b>` + mascaraValor(parseFloat(valorDespesaAdiant).toFixed(2)) + `</b></td>
                                <td style="text-align:right; font-size: 12px;"><b>0,00</b></td>
                                <td style="text-align:right; font-size: 12px;"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                                <td style="text-align:right; font-size: 12px;"></td>
                            </tr>`);
                }
            }
            if (ret['quebracaixa'].length > 0) {
                for (let j = 0; j < ret['quebracaixa'].length; j++) {
                    let idMov = ret['quebracaixa'][j]['IDMOV'];
                    let dataMov = ret['quebracaixa'][j]['DTMOVCAIXA'];
                    let MovOperador = ret['quebracaixa'][j]['FUNCIONARIOMOV'];
                    let dinheiroVenda = ret['quebracaixa'][j]['VRFISICODINHEIRO'];
                    let dinheiroInformado = ret['quebracaixa'][j]['VRRECDINHEIRO'];
                    let dinheiroAjuste = ret['quebracaixa'][j]['VRAJUSTDINHEIRO'];


                	if(parseFloat(dinheiroAjuste)>0){
            		    totalDinheiroInformado = parseFloat(dinheiroAjuste);
            		}else{
            		    totalDinheiroInformado = parseFloat(dinheiroInformado);
            		}
	
	    
	                TotalQuebraCaixa = parseFloat(totalDinheiroInformado) - parseFloat(dinheiroVenda);
	                
	                if(TotalQuebraCaixa>0){
	                    saldoAnterior = parseFloat(saldoAnterior) + parseFloat(TotalQuebraCaixa);
	                    tagQuebraDebito='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>0,00</b></td>';
	                    tagQuebraCredito='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>' + mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2)) + '</b></td>';
	                    tagQuebraSaldo='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>' + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '</b></td>';
	                }else{
	                    saldoAnterior = parseFloat(saldoAnterior) + (parseFloat(TotalQuebraCaixa));
	                    tagQuebraDebito='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>' + mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2)) + '</b></td>';
	                    tagQuebraCredito='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>0,00</b></td>';
	                    tagQuebraSaldo='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>' + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '</b></td>';
	                }

                    $('#resultadoExtratoLojaDia').append(
                        ` <tr class="table-primary">
                                <td style="font-size: 12px;">` + dataMov + `</td>
                                <td style="font-size: 12px;">Quebra Caixa Mov.: ` + idMov + `</td>
                                <td colspan="2" style="font-size: 12px;">Operador:  ` + MovOperador + `</td>`
                                +tagQuebraDebito+
                                tagQuebraCredito+
                                tagQuebraSaldo+
                                `<td style="text-align:right; font-size: 12px;"></td>
                            </tr>`);
                }
            }
            if (ret['totalDepositos'].length > 0) {
                for (let j = 0; j < ret['totalDepositos'].length; j++) {
                    let idDeposito = ret['totalDepositos'][j]['IDDEPOSITOLOJA'];
                    let dataDeposito = ret['totalDepositos'][j]['DTDEPOSITOFORMATADA'];
                    let dataDepositoMovimento = ret['totalDepositos'][j]['DTMOVIMENTOCAIXAFORMATADA'];
                    let funcDeposito = ret['totalDepositos'][j]['FUNCIONARIO'];
                    let valorDeposito = ret['totalDepositos'][j]['VRDEPOSITO'];
                    let descricaoContaBanco = ret['totalDepositos'][j]['DSBANCO'];
                    let SituacaoDepositoLoja = ret['totalDepositos'][j]['STCANCELADO'];
                    let ConferenciaDepositoLoja = ret['totalDepositos'][j]['STCONFERIDO'];
                    let DocumentoDepositoLoja = ret['totalDepositos'][j]['NUDOCDEPOSITO'];
                    
                   
                    if(SituacaoDepositoLoja=='False' && (ConferenciaDepositoLoja=='False' || ConferenciaDepositoLoja == null || ConferenciaDepositoLoja =='')){
                        saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorDeposito);
                        tagDepositoAtivoBotao='';
                    
                        
                    }else if(SituacaoDepositoLoja=='False' && (ConferenciaDepositoLoja=='True' && (ConferenciaDepositoLoja != null || ConferenciaDepositoLoja ==''))){
                        saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorDeposito);
                        tagDepositoAtivoBotao='';
                    
                        
                    }else if(SituacaoDepositoLoja=='True' && (ConferenciaDepositoLoja=='False' || ConferenciaDepositoLoja == null || ConferenciaDepositoLoja =='')){
                        tagDepositoAtivoBotao='';
                    
                        
                    }else if(SituacaoDepositoLoja=='True' && (ConferenciaDepositoLoja=='True' && (ConferenciaDepositoLoja != null || ConferenciaDepositoLoja ==''))){
                        tagDepositoAtivoBotao='';
                      
                    }


                    if(ConferenciaDepositoLoja=='False' || ConferenciaDepositoLoja == null || ConferenciaDepositoLoja ==''){
                        tagDepositoConferidoBotao='<td style="text-align:center; font-size: 12px;"><label style="color: red;">Sem Conferir</label></td>';
                    }else{
                        tagDepositoConferidoBotao='<td style="text-align:center; font-size: 12px;"><label style="color: blue;">Conferido</label></td>';
                       
                    }
                    
                    $('#resultadoExtratoLojaDia').append(
                        `<tr class="table-warning">
                                <td style="font-size: 12px;"><b>` + dataDeposito + `</b></td>
                                <td style="font-size: 12px;"><b>` + funcDeposito + ` Dep. Dinh  - Data do Movimento: ` + dataDepositoMovimento + `</b></td>
                                <td colspan="2" style="font-size: 12px;"><b>` + descricaoContaBanco + ` - ` + DocumentoDepositoLoja + `</b></td>
                                <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                <b>` + mascaraValor(parseFloat(valorDeposito).toFixed(2)) + `</b></td>
                                <td style="text-align:right; font-size: 12px;"><b>0,00</b></td>
                                <td style="text-align:right; font-size: 12px;" class="txt-color-red"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>`
                                +tagDepositoConferidoBotao+
                                
                        `</tr>`);
                }
            }
            if (ret['ajusteextrato'].length > 0) {
                for (let j = 0; j < ret['ajusteextrato'].length; j++) {
                    let idAjuste = ret['ajusteextrato'][j]['IDAJUSTEEXTRATO'];
                    let dataAjuste = ret['ajusteextrato'][j]['DTCADASTROFORMATADA'];
                    let valorDebito = ret['ajusteextrato'][j]['VRDEBITO'];
                    let valorCredito = ret['ajusteextrato'][j]['VRCREDITO'];
                    let historicoAjuste = ret['ajusteextrato'][j]['HISTORICO'];
                    let SituacaoAjusteLoja = ret['ajusteextrato'][j]['STCANCELADO'];
    
                    if(SituacaoAjusteLoja=='False'){
                        if(valorCredito>0){
                            saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorCredito);
                        }else{
                            saldoAnterior = parseFloat(saldoAnterior) + parseFloat(valorDebito);
                        }
                        
                        tagAjusteAtivoBotao='';
                        tagAjusteSituacaoBotao='<td style="text-align:center; font-size: 12px;"><label style="color: blue;">Ativo</label></td>';
                    }else{
                        tagAjusteAtivoBotao='';
                        tagAjusteSituacaoBotao='<td style="text-align:center; font-size: 12px;"><label style="color: red;">Cancelado</label></td>';
                    }
    
                    $('#resultadoExtratoLojaDia').append(
                        `<tr class="table-secondary">
                                <td style="font-size: 12px;"><b>` + dataAjuste + `</b></td>
                                <td style="font-size: 12px;"><b>` + historicoAjuste + `</b></td>
                                <td colspan="2" style="font-size: 12px;"><b>Ajuste de Extrato</b></td>
                                <td style="text-align:right; font-size: 12px;" class="txt-color-red"><b>` + mascaraValor(parseFloat(valorDebito).toFixed(2)) + `</b></td>
                                <td style="text-align:right; font-size: 12px;" class="txt-color-red"><b>` + mascaraValor(parseFloat(valorCredito).toFixed(2)) + `</b></td>
                                <td style="text-align:right; font-size: 12px;" class="txt-color-red"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>`
                                +tagAjusteSituacaoBotao+
                        `</tr>`);
                }
            }
        }
        
    }
    BuscaListaPCJCaixasMov();

}

//////////LISTA PCJ CAIXAS DA LOJA///////////////////

function retornoListaPCJCaixasMovimento(respostaListaPCJCaixaMovimento) {

	var TotalPCJ = 0;
	var PCJTotal = 0;
	var	TotalPCJ18 = 0;
	var	TotalPCJ78 = 0;

	if(respostaListaPCJCaixaMovimento['rows'] > 0 ){
	    
	    $('#resultadopcj').html(
            
            `<table id="" class="table table-bordered table-hover table-responsive-lg table-striped w-100" width="100%">

                <tbody id="resultadoPCJLojaDia">
                    <tr>
                        <th class="bg-primary-700" style="font-size: 10px;">Nº Movimento</th> 
                        <th class="bg-primary-700" style="font-size: 10px;">Caixa</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Abertura</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Operador</th>
                        <th class="bg-primary-700" style="font-size: 10px;">CPF</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Total CredS 1-8</th>
                        <th class="bg-primary-700" style="font-size: 10px;">CredS 7-8</th>
                        <th class="bg-primary-700" style="font-size: 10px;">% PCJ</th>
                    </tr>
                </tbody>
                <tfoot class="thead-themed totalPCJCaixasAdministrativo">
                </tfoot>
            </table>`);

		for (var i = 0; i < respostaListaPCJCaixaMovimento.data.length; i++) {

			IDCaixa = respostaListaPCJCaixaMovimento.data[i].caixa['IDCAIXAWEB'];
            IDMovimentoCaixa = respostaListaPCJCaixaMovimento.data[i].caixa['ID'];
			NomeCaixa = respostaListaPCJCaixaMovimento.data[i].caixa['DSCAIXA'];
			DTAbertura = respostaListaPCJCaixaMovimento.data[i].caixa['DTABERTURA'];
			NomeOperador = respostaListaPCJCaixaMovimento.data[i].caixa['NOFUNCIONARIO'];
			CPFOperador = respostaListaPCJCaixaMovimento.data[i].caixa['NUCPF'];
			SituacaoCaixa = respostaListaPCJCaixaMovimento.data[i].caixa['STFECHADO'];
			VrInformadoDinheiro = respostaListaPCJCaixaMovimento.data[i].caixa['VRRECDINHEIRO'];
			
			VrPCJ18 = respostaListaPCJCaixaMovimento.data[i]?.vendapcj ? parseFloat(respostaListaPCJCaixaMovimento.data[i]?.vendapcj[0]['venda-pcj']['TOTALPCJ18'])  : 0;
			VrPCJ78 = respostaListaPCJCaixaMovimento.data[i]?.vendapcj ? parseFloat(respostaListaPCJCaixaMovimento.data[i]?.vendapcj[0]['venda-pcj']['TOTALPCJ78']) : 0;
			PCJTotal = (parseFloat(VrPCJ78)/parseFloat(VrPCJ18))*100;
			
            if(PCJTotal>0){
                PCJTotal = PCJTotal;
                if(PCJTotal<30){
                    corPCJ = '<label style="color: red; font-size: 11px;">' + mascaraValor(PCJTotal.toFixed(2))  + '</label>';
                }else{
                    corPCJ = '<label style="color: blue; font-size: 11px;">' + mascaraValor(PCJTotal.toFixed(2))  + '</label>';
                }
            }else{
                PCJTotal=0;
                corPCJ = '<label style="color: red; font-size: 11px;">' + mascaraValor(PCJTotal.toFixed(2))  + '</label>';
            }
			
			TotalPCJ18 = TotalPCJ18 + VrPCJ18;
			TotalPCJ78 = TotalPCJ78 + VrPCJ78;
            
			$('#resultadoPCJLojaDia').append(
				`<tr>
			    	<td><label style="color: blue; font-size: 11px;">` + IDMovimentoCaixa +`</label></td>
				    <td><label style="color: blue; font-size: 11px;">` + IDCaixa +` - ` + NomeCaixa +`</label></td>
				    <td><label style="color: blue; font-size: 11px;">` + DTAbertura +`</label></td>
				    <td><label style="color: blue; font-size: 11px;">` + NomeOperador +`</label></td>
				    <td><label style="color: blue; font-size: 11px;">` + CPFOperador +`</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(VrPCJ18.toFixed(2)) +`</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(VrPCJ78.toFixed(2)) +`</label></td>
                    <td style="text-align: right;">` +corPCJ +`</td>
                </tr>`
			);
            
		}
        TotalPCJ = (parseFloat(TotalPCJ78)/parseFloat(TotalPCJ18))*100;
        
		$('.totalPCJCaixasAdministrativo').html(
			`<tr>
                <th colspan="5" style="text-align: center;">Total dos Caixas</th>
                <th style="text-align: right;">${mascaraValor(TotalPCJ18.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalPCJ78.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalPCJ.toFixed(2))}</th>
            </tr>`
		);
			
	}else{
	   
	}
	
	BuscaListaCaixasFechados();

}

//////////LISTA CAIXAS FECHADOS DA LOJA///////////////////

function retornoListaCaixasFechados(respostaListaCaixaFechado) {

    var FechamentoDinheiroTotal=0;
    var FechamentoCartaoTotal=0;
    var FechamentoPOSTotal=0;
    var FechamentoVoucherTotal=0;
    var FechamentoFaturaTotal=0;
    var TotalFechamento = 0; 
    var FechamentoDinheiroFisicoTotal = 0;
    var TotalQuebraCaixa = 0;
    var QuebraCaixaDinheiroFechAjuste = 0;
    var QuebraCaixaFechadoTotal = 0; 
	
	if(respostaListaCaixaFechado['rows'] > 0 ){
	    
	    $('#resultadofechcaixa').html(
            
            `<table id="" class="table table-bordered table-hover table-responsive-lg table-striped w-100" width="100%">

                <tbody id="resultadoFechaCaixaLojaDia">
                    <tr>
                        <th class="bg-primary-700" style="font-size: 10px;">Nº Movimento</th> 
                        <th class="bg-primary-700" style="font-size: 10px;">Caixa</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Abertura</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Fechamento</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Operador</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Venda Dinheiro</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Dinheiro Informado</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Quebra Caixa</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Cartao</th>
                        <th class="bg-primary-700" style="font-size: 10px;">POS</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Voucher</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Fatura</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Situação</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Opção</th>
                    </tr>
                </tbody>
                <tfoot class="thead-themed totalCaixasFechadosAdministrativo">
                </tfoot>
            </table>`);

		for (var i = 0; i < respostaListaCaixaFechado.data.length; i++) {

			IDMovimentoFechamento = respostaListaCaixaFechado.data[i]['IDMOVIMENTO'];
			IDCaixaFechamento = respostaListaCaixaFechado.data[i]['IDCAIXAFECHAMENTO'];
            NomeCaixaMov = respostaListaCaixaFechado.data[i]['DSCAIXAFECHAMENTO'];
			DTAberturaMov = respostaListaCaixaFechado.data[i]['DTHORAABERTURACAIXA'];
			DTFechamentoMov = respostaListaCaixaFechado.data[i]['DTHORAFECHAMENTOCAIXA'];
			NomeOperadorMov = respostaListaCaixaFechado.data[i]['OPERADORFECHAMENTO'];
			FechamentoDinhFisico = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTODINHEIROFISICO']);
			FechamentoDinh = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTODINHEIRO']);
			FechamentoCartao = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTOCARTAO']);
			FechamentoPOS = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTOPOS']);
			FechamentoVoucher = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTOVOUCHER']);
			FechamentoFatura = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTOFATURA']);
			FechamentoConvenio = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTOCONVENIO']);
			FechamentoPix = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTOPIX']);
			FechamentoCPL = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTOCPL']);
			ConferidoCaixa = respostaListaCaixaFechado.data[i]['STCONFERIDO'];

        	QuebraCaixaDinheiroFechAjuste = parseFloat(respostaListaCaixaFechado.data[i]['TOTALFECHAMENTODINHEIROAJUSTE']);
        
            if(FechamentoDinhFisico>0){
                FechamentoDinhFisico = FechamentoDinhFisico;
            }else{
                FechamentoDinhFisico=0;
            }
             
            if(FechamentoDinh>0){
                FechamentoDinh = FechamentoDinh;
            }else{
                FechamentoDinh=0;
            }
             
        	if(QuebraCaixaDinheiroFechAjuste>0){
        	    FechamentoDinh = QuebraCaixaDinheiroFechAjuste;
        	}else{
        	    FechamentoDinh = FechamentoDinh;
        	}
        	
        	TotalQuebraCaixa = FechamentoDinh - FechamentoDinhFisico;
         
            if(FechamentoCartao>0){
                FechamentoCartao = FechamentoCartao;
            }else{
                FechamentoCartao=0;
            }
            
            if(FechamentoPOS>0){
                FechamentoPOS = FechamentoPOS;
            }else{
                FechamentoPOS=0;
            }
            
            if(FechamentoVoucher>0){
                FechamentoVoucher = FechamentoVoucher;
            }else{
                FechamentoVoucher=0;
            }
            
            if(FechamentoFatura>0){
                FechamentoFatura = FechamentoFatura;
            }else{
                FechamentoFatura=0;
            }
            
            if(FechamentoConvenio>0){
                FechamentoConvenio = FechamentoConvenio;
            }else{
                FechamentoConvenio=0;
            }
            
            if(FechamentoPix>0){
                FechamentoPix = FechamentoPix;
            }else{
                FechamentoPix=0;
            }
            
            if(FechamentoCPL>0){
                FechamentoCPL = FechamentoCPL;
            }else{
                FechamentoCPL=0;
            }
            
			FechamentoDinheiroTotal = FechamentoDinheiroTotal + FechamentoDinh;
			FechamentoDinheiroFisicoTotal = FechamentoDinheiroFisicoTotal + FechamentoDinhFisico;
			
			FechamentoCartaoTotal = FechamentoCartaoTotal + FechamentoCartao;
			FechamentoPOSTotal = FechamentoPOSTotal + FechamentoPOS;
			FechamentoVoucherTotal = FechamentoVoucherTotal + FechamentoVoucher;
			FechamentoFaturaTotal = FechamentoFaturaTotal + FechamentoFatura;
			
			QuebraCaixaFechadoTotal = QuebraCaixaFechadoTotal + TotalQuebraCaixa;
			
			TotalFechamento = (FechamentoDinh+FechamentoCartao+FechamentoPOS+FechamentoVoucher+FechamentoFatura);

            if(TotalQuebraCaixa>0){
                tagquebracaixa = '<td style="text-align: right;"><label style="color: blue;"> + ' + mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2)) + '</label></td>';
            }else{
                tagquebracaixa = '<td style="text-align: right;"><label style="color: red;"> - ' + mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2)) + '</label></td>';
            }

            if(ConferidoCaixa>0){
                tagConferecaixa = '<td style="text-align: right;"><label style="color: blue;"> Conferido</label></td>';
                BTConfirCaixa = '<button type="button" class="btn btn-danger btn-xs" title="Abertura do Caixa na Web" id="'+IDMovimentoFechamento+'" onclick="update_confirmar_movimento_caixa(this.id,\'0\')" >Abrir Caixa Web</button>';
            }else{
                tagConferecaixa = '<td style="text-align: right;"><label style="color: red;"> Sem Conferir</label></td>';
                BTConfirCaixa = '<button type="button" class="btn btn-success btn-xs" title="Confirmar Conferência do Caixa" id="'+IDMovimentoFechamento+'" onclick="update_confirmar_movimento_caixa(this.id,\'1\')" >Confirmar Conferência</button>';
                //função em Análise
                BTConfirCaixa = '';
            }
            
			$('#resultadoFechaCaixaLojaDia').append(
				`<tr>
				    <td><label style="color: blue; font-size: 11px;">` + IDMovimentoFechamento +`</label></td>
				    <td><label style="color: blue; font-size: 11px;">` + IDCaixaFechamento +` - ` + NomeCaixaMov +`</label></td>
				    <td><label style="color: blue; font-size: 11px;">` + DTAberturaMov +`</label></td>
				    <td><label style="color: blue; font-size: 11px;">` + DTFechamentoMov +`</label></td>
				    <td><label style="color: blue; font-size: 11px;">` + NomeOperadorMov +`</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(FechamentoDinhFisico.toFixed(2)) +`</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(FechamentoDinh.toFixed(2)) +`</label></td>`
                    +tagquebracaixa+
                    `<td style="text-align: right;"><label style="color: black;">` + mascaraValor(FechamentoCartao.toFixed(2)) +`</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(FechamentoPOS.toFixed(2)) +`</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(FechamentoVoucher.toFixed(2)) +`</label></td>
                    <td style="text-align: right;"><label style="color: black;">` + mascaraValor(FechamentoFatura.toFixed(2)) +`</label></td>`
                    +tagConferecaixa+
                    `<td style="text-align: right;">` + BTConfirCaixa +`</td>
                </tr>`
			);

		}

		$('.totalCaixasFechadosAdministrativo').html(
			`<tr>
                <th colspan="5" style="text-align: center;">Total dos Fechamentos</th>
                <th style="text-align: right;">${mascaraValor(FechamentoDinheiroFisicoTotal.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(FechamentoDinheiroTotal.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(QuebraCaixaFechadoTotal.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(FechamentoCartaoTotal.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(FechamentoPOSTotal.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(FechamentoVoucherTotal.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(FechamentoFaturaTotal.toFixed(2))}</th>
                <th colspan="2" style="text-align: right;"></th>
            </tr>`
		);

	}else{
	    
	}
	BuscaVendaVendedor();

}

function update_confirmar_movimento_caixa(id, status) {

	var dados = {
        "IDSUPERVISOR": parseInt(IDFuncionarioLogin),
        "STCONFERIDO": status,
		"ID": id
	};

	//console.table(dados);

	ajaxPut("api/movimento-caixa/atualizacao-status.xsjs", dados)
		.then(funcSucessUpdateStatusMovimento)
		.catch((e) => { funcError(), console.log(e) });
		
	const textdados = JSON.stringify(dados);
	
	if(status==0){
	    textoFuncao = 'ADMINISTRATIVO/ABERTURA DO MOVIMENTO DE CAIXA';
	}else{
	    textoFuncao = 'ADMINISTRATIVO/CONFIMAR CONFERENCIA DO MOVIMENTO DE CAIXA';
	}
		
    var dadosAbreCaixa = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosAbreCaixa)
		.then(funcSucessLog)
		.catch((e) => { funcError(), console.log(e) });

}

function funcSucessUpdateStatusMovimento(resposta) {

	alerta_conferido_sucesso();
	pesq_mov_caixas();
}
 
/////////////LISTA VENDAS POR VENDEDOR /////////////////////////////////

function retornoListaVendasVendedor(respostaListaVendaVendedor) {

	var QTDProduto = 0;
	var VrVendido = 0;
	var VrVoucher = 0;
	var TotalVendaVendedor = 0;
	var TotalVoucherVendedor = 0;
	var VrVendidoVendedor = 0;
	var TotalLiqVendidoVendedor = 0;
	
	if(respostaListaVendaVendedor['rows'] > 0 ){
	    
	    $('#resultadovendavend').html(
            
            `<table id="" class="table table-bordered table-hover table-responsive-lg table-striped w-100" width="100%">

                <tbody id="resultadoListVendedor">
                    <tr>
                        <th class="bg-primary-700" style="font-size: 10px;">Matrícula</th> 
                        <th class="bg-primary-700" style="font-size: 10px;">Nome</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Qtd Produto</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Valor Vendido</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Voucher Recebido</th>
                        <th class="bg-primary-700" style="font-size: 10px;">Valor Liquido</th>
                    </tr>
                </tbody>
                <tfoot class="thead-themed totalVendedores">
                </tfoot>
            </table>`);

	    for (var i = 0; i < respostaListaVendaVendedor.data.length; i++) {

		NumMatricula = respostaListaVendaVendedor.data[i]['vendedor']['VENDEDOR_MATRICULA'];
		NomeVendedor = respostaListaVendaVendedor.data[i]['vendedor']['VENDEDOR_NOME'];

		QTDProduto = parseFloat(respostaListaVendaVendedor.data[i]['totalVendido'][0]['QTDVENDIDOVENDEDOR']);
		
		VrVendido = parseFloat(respostaListaVendaVendedor.data[i]['totalVendido'][0]['TOTALVENDIDOVENDEDOR']);

		VrVoucher = parseFloat(respostaListaVendaVendedor.data[i]['Vouchers']);

        TotalVendaVendedor = TotalVendaVendedor + VrVendido;
        TotalVoucherVendedor = TotalVoucherVendedor + VrVoucher;
        
        VrVendidoVendedor = VrVendido - VrVoucher;
        
        TotalLiqVendidoVendedor = TotalVendaVendedor - TotalVoucherVendedor;

		$('#resultadoListVendedor').append(
			`<tr>
                <td><label style="color: blue; font-size: 11px;">` + NumMatricula +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NomeVendedor +	`</label></td>
                <td style="text-align: center;"><label style="color: blue;">` + QTDProduto + `</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVendido.toFixed(2)) +	`</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVoucher.toFixed(2)) +	`</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVendidoVendedor.toFixed(2)) +	`</label></td>
            </tr>`
		);
		
		$('.totalVendedores').html(
			`<tr>
                <th colspan="3" style="text-align: center;">Total Vendas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVoucherVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalLiqVendidoVendedor.toFixed(2))}</th>
            </tr>`
		);

	}
			
	}else{
	    
	}
	BuscaVendaAtiva();
}

/////////////LISTA VENDAS ATIVAS /////////////////////////////////

function retornoListaVendasAtivas(respostaListaVendaAtivas) {

	var VendaAtivaValor = 0;
	var VendaAtivaValorBruto = 0;
	var TotalVendaAtivaBruta = 0;
	var TotalVendaAtiva = 0;
	var TotalVendaAtivaDesconto = 0;
	var contadorAtiva = 0;
	
	if(respostaListaVendaAtivas['rows'] > 0 ){
	    
	  	$('#resultadoativas').html(
            `<table id="dt-basic-pesqvendas" class="table table-bordered table-hover table-striped w-100 .dt-responsive">
                <thead class="bg-primary-600">
                    <tr>
                        <th></th>
                        <th>Caixa</th>
                        <th>Nº Venda</th>
                        <th>NFCe</th>
                        <th>Abertura</th>
                        <th>Operador</th>
                        <th>Vl. Bruto</th>
                        <th>Vl. Desconto</th>
                        <th>Vl. Pago</th>
                        <th>Nota</th>
                        <th>Opções</th>
                    </tr>
                </thead>
                <tbody id="resultadoListVendasAtivas">
                </tbody>
                <tfoot class="thead-themed totalAtivas">
                </tfoot>
            </table>`
	    );
	
    	var tableVendasAtivas = $('#dt-basic-pesqvendas').DataTable();
        tableVendasAtivas.rows().remove().draw();
        
    	for (var i = 0; i < respostaListaVendaAtivas.data.length; i++) {
    
    		contadorAtiva = contadorAtiva + 1;
    
    		NumCaixa = respostaListaVendaAtivas.data[i]['IDCAIXAWEB'];
    		DescCaixa = respostaListaVendaAtivas.data[i]['DSCAIXA'];
    		NuVenda = respostaListaVendaAtivas.data[i]['IDVENDA'];
    		NuNFCe = respostaListaVendaAtivas.data[i]['NFE_INFNFE_IDE_NNF'];
    		DTAberturaVendaAtiva = respostaListaVendaAtivas.data[i]['DTHORAFECHAMENTO'];
    		NomeOperadorVendaAtiva = respostaListaVendaAtivas.data[i]['NOFUNCIONARIO'];
    		STConferidoMov = respostaListaVendaAtivas.data[i]['STCONFERIDO'];
    
    		VendaAtivaValor = parseFloat(respostaListaVendaAtivas.data[i]['VRTOTALPAGO']);
    		VendaAtivaValorDesconto = parseFloat(respostaListaVendaAtivas.data[i]['VRTOTALDESCONTO']);
    		VendaAtivaValorBruto = parseFloat(respostaListaVendaAtivas.data[i]['VRTOTALVENDA']);
    		EmitidasAtivas = respostaListaVendaAtivas.data[i]['STCONTINGENCIA'];
    
    		if (EmitidasAtivas == 'True') {
    			NotaEmitidaAtiva = '<label style="color: red; font-size: 11px;">Contigência</label>';
    		} else {
    			NotaEmitidaAtiva = '<label style="color: blue; font-size: 11px;">Emitida</label>';
    		}
    
            if (STConferidoMov == 1) {
    			STConferido = `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVenda +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
                    <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVenda + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVenda + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
                    <button type="button" class="btn btn-primary btn-xs" title="Visualizar Xml da Venda" id="${NuVenda}" onclick="abreModalXmlVenda(this.id)" >XML</button>
                </div>`;
    		} else {
    			STConferido =  `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVenda +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
                    <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVenda + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVenda + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
                    <button type="button" class="btn btn-primary btn-xs" title="Visualizar Xml da Venda" id="${NuVenda}" onclick="abreModalXmlVenda(this.id)" >XML</button>
                    <button type="button" class="btn btn-danger btn-xs" title="Cancelar Venda" id="` +NuVenda + `" onclick="modal_Cancelar_Venda(this.id,` +STConferidoMov + `)" >Cancelar</button> 
                </div>`;
    		}
    		TotalVendaAtivaBruta = TotalVendaAtivaBruta + VendaAtivaValorBruto;	
    		TotalVendaAtiva = TotalVendaAtiva + VendaAtivaValor;
    		TotalVendaAtivaDesconto = TotalVendaAtivaDesconto + VendaAtivaValorDesconto;
    		tableVendasAtivas.row.add([
                `<label style="color: blue; font-size: 11px;">` + contadorAtiva + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NumCaixa + ` - ` + DescCaixa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuVenda + `</label>`,
                `<label style="color: blue;">` + NuNFCe + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + DTAberturaVendaAtiva + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NomeOperadorVendaAtiva + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaAtivaValorBruto.toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaAtivaValorDesconto.toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaAtivaValor.toFixed(2)) + `</label>`,
                NotaEmitidaAtiva,
                STConferido,
            ]).draw(false);
    
    	}
		
    	$('.totalAtivas').html(
    		`<tr>
                <th colspan="6" style="text-align: center;">Total Vendas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaAtivaBruta.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaAtivaDesconto.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaAtiva.toFixed(2))}</th>
                <th colspan="3"></th>
            </tr>`
    	);
	
	}else{
	    
	}

	BuscaVendaCancelada();
}

function modal_Cancelar_Venda(id) {
    
    $.get('administrativo_action_cancelavendamodal.html', function(res) {
        
         $('#resulmodalcancelvenda').html(res);
         $("#cancelVenda").modal('show');
         $('#cancelVenda').on('shown.bs.modal', function () {});
         $('.titluloVenda').html('Cancelamento da Venda: <b> ' + id + '<b>')
         $('#IDResumoVendaWeb').val(id);
    })
}

/////////////LISTA VENDAS CANCELADAS /////////////////////////////////

function retornoListaVendasCanceladas(respostaListaVendaCanceladas) {

	var VrVendaCancelada = 0;
	var TotalVendaCancelada = 0;
	var contadorCancelada = 0;
	
	if(respostaListaVendaCanceladas['rows'] > 0 ){
	    
	  	$('#resultadocanceladas').html(
            `<table id="dt-basic-venda-cancelada" class="table table-bordered table-hover table-striped w-100 .dt-responsive">
                <thead class="bg-primary-600">
                    <tr>
                        <th></th>
                        <th>Caixa</th>
                        <th>Nº Venda</th>
                        <th>NFCe</th>
                        <th>Abertura</th>
                        <th>Operador</th>
                        <th>Valor</th>
                        <th>Nota</th>
                        <th>Cancelado Por</th>
                        <th>Motivo</th>
                        <th>Opções</th>
                    </tr>
                </thead>
                <tbody id="resultadoListVendasCancelada">
                </tbody>
                <tfoot class="thead-themed totalCanceladas">
                </tfoot>
            </table>`
	    );
	    
    	for (var i = 0; i < respostaListaVendaCanceladas.data.length; i++) {
    
    		contadorCancelada = contadorCancelada + 1;
    
    		NumCaixaCancelada = respostaListaVendaCanceladas.data[i]['IDCAIXAWEB'];
    		DescCaixaCancelada = respostaListaVendaCanceladas.data[i]['DSCAIXA'];
    		NuVendaCancelada = respostaListaVendaCanceladas.data[i]['IDVENDA'];
    		NuNFCeCancelada = respostaListaVendaCanceladas.data[i]['NFE_INFNFE_IDE_NNF'];
    		DTAberturaVendaCancelada = respostaListaVendaCanceladas.data[i]['DTHORAFECHAMENTO'];
    		NomeOperadorVendaCancelada = respostaListaVendaCanceladas.data[i]['NOFUNCIONARIO'];
    		FuncioCancelVendaCancelada = respostaListaVendaCanceladas.data[i]['NOFUNCIOCANCEL'];
    		MotivoCancelada = respostaListaVendaCanceladas.data[i]['TXTMOTIVOCANCELAMENTO'];
    
    		VrVendaCancelada = parseFloat(respostaListaVendaCanceladas.data[i]['VRTOTALPAGO']);
    		EmitidasCancelada = respostaListaVendaCanceladas.data[i]['STCONTINGENCIA'];
    		if (EmitidasCancelada == 'false') {
    			NotaEmitidaCancelada = 'Contigência';
    		} else {
    			NotaEmitidaCancelada = 'Emitida';
    		}
    		TotalVendaCancelada = TotalVendaCancelada + VrVendaCancelada;
    
    		var tableVendasCancelada = $('#dt-basic-venda-cancelada').DataTable();
    		//tableVendasCancelada.remove().draw();
    		tableVendasCancelada.row.add([
                `<label style="color: red; font-size: 11px;">` + contadorCancelada + `</label>`,
                `<label style="color: red; font-size: 11px;">` + NumCaixaCancelada + ` - ` + DescCaixaCancelada + `</label>`,
                `<label style="color: red; font-size: 11px;">` + NuVendaCancelada + `</label>`,
                `<label style="color: red; font-size: 11px;">` + NuNFCeCancelada + `</label>`,
                `<label style="color: red; font-size: 11px;">` + DTAberturaVendaCancelada + `</label>`,
                `<label style="color: red; font-size: 11px;">` + NomeOperadorVendaCancelada + `</label>`,
                `<label style="color: red; font-size: 11px;">` + VrVendaCancelada + `</label>`,
                `<label style="color: red; font-size: 11px;">` + NotaEmitidaCancelada + `</label>`,
                `<label style="color: red; font-size: 11px;">` + FuncioCancelVendaCancelada + `</label>`,
                `<label style="color: red; font-size: 11px;">` + MotivoCancelada + `</label>`,
                `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVendaCancelada +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
                    <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVendaCancelada + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVendaCancelada + `" onclick="modal_Detalhe_Recebimento_Calcel(this.id)" >Pagamento</button>
                </div>`,
            ]).draw(false);
    
    	}
    
    	$('.totalCanceladas').html(
    		`<tr>
                <th colspan="6" style="text-align: center;">Total Vendas Canceladas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaCancelada.toFixed(2))}</th>
                <th colspan="4"></th>
            </tr>`
    	);
    	
	}else{
	    
	}
	BuscaFaturas();
}

//////////////////// Modais Detalhe Venda, Produtos e Recebimentos //////////////////////////////////////////

function retornoListaVendasAtivasDetalheProduto(respostaListaVendaAtivasDetalheProduto) {

	for (var i = 0; i < respostaListaVendaAtivasDetalheProduto.data.length; i++) {

		IDVenda = respostaListaVendaAtivasDetalheProduto.data[i]['IDVENDA'];
		NumCodBarra = respostaListaVendaAtivasDetalheProduto.data[i]['NUCODBARRAS'];
		DescProduto = respostaListaVendaAtivasDetalheProduto.data[i]['DSNOME'];
		VrUnitario = parseFloat(respostaListaVendaAtivasDetalheProduto.data[i]['VUNCOM']);
		QTDProduto = respostaListaVendaAtivasDetalheProduto.data[i]['QTD'];

		VrTotal = parseFloat(respostaListaVendaAtivasDetalheProduto.data[i]['VRTOTALLIQUIDO']);
		NomeVendedor = respostaListaVendaAtivasDetalheProduto.data[i]['VENDEDOR_NOME'];
		SituacaoProduto = respostaListaVendaAtivasDetalheProduto.data[i]['STCANCELADO'];
		STTrocaProduto = respostaListaVendaAtivasDetalheProduto.data[i]['STTROCA'];

		    if(SituacaoProduto=='False'){
                tagDetProdAtivo='<label style="color: blue;">Ativo</label>';
            }else{
                tagDetProdAtivo='<label style="color: red;">Cancelado</label>';
            }
            
		    if(STTrocaProduto=='False'){
                tagDetTrocaProdAtivo='<label style="color: blue;"> NÃO </label>';
            }else{
                tagDetTrocaProdAtivo='<label style="color: red;">SIM</label>';
            }
            
		$('#resultListDetalheVendaProduto').append(
			`<tr>
                    <td><label style="color: blue;">` + NumCodBarra +`</label></td>
                    <td><label style="color: blue;">` + DescProduto +`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrUnitario.toFixed(2)) +`</label></td>
                    <td><label style="color: blue;">` + QTDProduto +`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrTotal.toFixed(2)) +`</label></td>
                    <td><label style="color: blue;">` + NomeVendedor +`</label></td>
                    <td>` + tagDetProdAtivo +`</td>
                    <td>` + tagDetTrocaProdAtivo +`</td>
            </tr>`
		);
	}

	$('.textoCabecalhoDetalheProduto').html(
		`<h2>
            Lista de Produtos da Venda Nº <span class="fw-300"><i>${IDVenda}</i></span>
        </h2>`
	);
}

function modal_Detalhe_Venda(id) {

	$.get('action_detvendamodal.html', function(res) {

		$('#resulmodaldetvenda').html(res);
		$("#detVenda").modal('show');
		$('#detVenda').on('shown.bs.modal', function() {});

		return ajaxGet('api/dashboard/venda/resumo-venda-caixa-detalhado.xsjs?idEmpresa=' + idemp + '&idVenda=' + id)
			.then(retornoListaVendaDetalhe)
			.catch((e) => { funcError(), console.log(e) });
	})
	/* ANTIGO
	$.get('action_detvendamodal.html', function(res) {

		$('#resulmodaldetvenda').html(res);
		$("#detVenda").modal('show');
		$('#detVenda').on('shown.bs.modal', function() {});

		return ajaxGet('api/administrativo/detalhe-venda.xsjs?idEmpresa=' + idemp + '&idVenda=' + id)
			.then(retornoListaVendasAtivasDetalhe)
			.catch(funcError);
	})
	*/

}

function modal_Detalhe_Produto(id) {

	$.get('action_detvendaprodutomodal.html', function(res) {

		$('#resulmodaldetvendaproduto').html(res);
		$("#detVendaproduto").modal('show');
		$('#detVendaproduto').on('shown.bs.modal', function() {});

		return ajaxGet('api/dashboard/venda/detalhe-venda.xsjs?idEmpresa=' + idemp + '&idVenda=' + id)
			.then(retornoListaVendasAtivasDetalheProduto)
			.catch((e) => { funcError(), console.log(e) });
	})

}

function retornoListaVendaDetalhe(respostaListaVendaDetalhe) {

	for (var i = 0; i < respostaListaVendaDetalhe.data.length; i++) {
	    
			NumCaixa = respostaListaVendaDetalhe.data[i]['IDCAIXAWEB'];
			DescCaixa  = respostaListaVendaDetalhe.data[i]['DSCAIXA'];
			NuVenda  = respostaListaVendaDetalhe.data[i]['IDVENDA'];
			NuNFCe  = respostaListaVendaDetalhe.data[i]['NFE_INFNFE_IDE_NNF'];
			IdMovCaixa  = respostaListaVendaDetalhe.data[i]['IDMOVIMENTOCAIXAWEB'];
			ChNFCe  = respostaListaVendaDetalhe.data[i]['PROTNFE_INFPROT_CHNFE'];
			NuProtNFCe  = respostaListaVendaDetalhe.data[i]['PROTNFE_INFPROT_NPROT'];
			VrTotalDescNFCe  = respostaListaVendaDetalhe.data[i]['VRTOTALDESCONTO'];
			MotDescNFCe  = respostaListaVendaDetalhe.data[i]['TXTMOTIVODESCONTO'];
			DTAberturaVenda  = respostaListaVendaDetalhe.data[i]['DTHORAABERTURA'];
			DTFechamentoVenda  = respostaListaVendaDetalhe.data[i]['DTHORAFECHAMENTO'];
			NomeOperadorVenda  = respostaListaVendaDetalhe.data[i]['NOFUNCIONARIO'];
			MotivoCancelada = respostaListaVendaDetalhe.data[i]['TXTMOTIVOCANCELAMENTO'];
			CPFClienteVenda = respostaListaVendaDetalhe.data[i]['DEST_CPF'];
			StCanceladoVenda = respostaListaVendaDetalhe.data[i]['STCANCELADO'];
			NoFuncDesconto = respostaListaVendaDetalhe.data[i]['NOFUNDESCONTO'];
			NoConveniado = respostaListaVendaDetalhe.data[i]['NOCONVENIADO'];
			CpfConveniado = respostaListaVendaDetalhe.data[i]['CPFCONVENIADO'];
			DsConvenioConveniado = respostaListaVendaDetalhe.data[i]['DSCONVENIO'];
			DtVencimentoConveniado = respostaListaVendaDetalhe.data[i]['DTVENCIMENTOCONVENIADO'];
		    NuVoucher = respostaListaVendaDetalhe.data[i]['NUVOUCHER'];
			NoClienteVoucher = respostaListaVendaDetalhe.data[i]['CLIENTEVOUCHER'];
			CPFClienteVoucher = respostaListaVendaDetalhe.data[i]['CPFCLIENTEVOUCHER'];
			NomeClienteVenda = respostaListaVendaDetalhe.data[i]['NOMECLIENTE'];
			NomeEmpresaVenda = respostaListaVendaDetalhe.data[i]['NOFANTASIA'];

			VrVendaConvenio  = parseFloat(respostaListaVendaDetalhe.data[i]['VRRECCONVENIO']);
			VrVendaNFCE  = parseFloat(respostaListaVendaDetalhe.data[i]['VRTOTALPAGO']);
			VrVenda  = parseFloat(respostaListaVendaDetalhe.data[i]['VRTOTALVENDA']);
			VrVendaVoucher  = parseFloat(respostaListaVendaDetalhe.data[i]['VRRECVOUCHER']);
			VrProdNFCe  =  parseFloat(respostaListaVendaDetalhe.data[i]['NFE_INFNFE_TOTAL_ICMSTOT_VPROD']);
			VrDescNFCe  =  parseFloat(respostaListaVendaDetalhe.data[i]['NFE_INFNFE_TOTAL_ICMSTOT_VDESC']);
			VrVBrutoConv  = parseFloat(respostaListaVendaDetalhe.data[i]['VRBRUTOCONVENIADO']);
			VrDescConv  = parseFloat(respostaListaVendaDetalhe.data[i]['VRDESCONTOCONVENIADO']);
			VrLiqConv  = parseFloat(respostaListaVendaDetalhe.data[i]['VRLIQUIDOCONVENIADO']);
			
			Emitidas  = respostaListaVendaDetalhe.data[i]['STCONTINGENCIA'];
			
			if (Emitidas  == 'false') {
				NotaEmitida  = 'Contigência';
			} else {
				NotaEmitida  = 'Emitida';
			}

            if(VrDescNFCe>0 && MotDescNFCe != ''){
                document.getElementById("1").style.display = 'block';
            }
            
            if(StCanceladoVenda == 'True' && MotivoCancelada != ''){
                document.getElementById("2").style.display = 'block';
            }
            
            if(CPFClienteVenda >0){
               CPFClienteVenda1 = CPFClienteVenda;
            }else if(CPFClienteVenda == ''){
                CPFClienteVenda1 = 'Não Informado';
            }else{
                CPFClienteVenda1 = 'Não Informado';
            }
            
            if(VrVendaConvenio >0){
                
                document.getElementById("3").style.display = 'block';
                
                $('#cabdetvenda').html(
            		`<h4 class="modal-title">
                        VENDA Nº: ` + (NuVenda) + `
                        <small class="m-0 text-muted">
                           Operador: <b> ` + (NomeOperadorVenda) + `</b>
                           <br>
                           Conveniado: <b> ` + (NoConveniado) + `</b>
                           <br>
                           CPF: <b> ` + (CpfConveniado) + `</b>
                           <br>
                           Tipo Convênio: <b> ` + (DsConvenioConveniado) + `</b>
                        </small>
                    </h4>`
            	);
        	
            }else{
                
                if(NoFuncDesconto != null && NoFuncDesconto != ''){
                    NoCliente = NoFuncDesconto;
                }else if(NomeClienteVenda != null && NomeClienteVenda != ''){
                    NoCliente = NomeClienteVenda;
                }else if(NoFuncDesconto == null && NomeClienteVenda == null){
                    NoCliente = 'Consumidor Final';
                }else{
                    NoCliente = 'Consumidor Final';
                }
                
                $('#cabdetvenda').html(
            		`<h4 class="modal-title">
                        VENDA Nº: ` + (NuVenda) + `
                        <small class="m-0 text-muted">
                           Operador: <b> ` + (NomeOperadorVenda) + `</b>
                           <br>
                           Cliente: <b> ` + (NoCliente) + `</b>
                           <br>
                           CPF: <b> ` + (CPFClienteVenda1) + `</b>
                        </small>
                    </h4>`
            	);
            }
    	
    	   if(VrVendaVoucher>0){
                document.getElementById("4").style.display = 'block';
            }
            
		$('#nomeempVenda').val(NomeEmpresaVenda);
		$('#idmovcaixa').val(IdMovCaixa);
		$('#idnumnota').val(NuNFCe);
		$('#DTAbetaVenda').val(DTAberturaVenda);
		$('#DTFechaVenda').val(DTFechamentoVenda);
		$('#ChNota').val(ChNFCe);
		$('#VrVenda').val(mascaraValor(VrVenda.toFixed(2)));
		$('#VrBrutoNota').val(mascaraValor(VrProdNFCe.toFixed(2)));
		$('#VrDescNota').val(mascaraValor(VrDescNFCe.toFixed(2)));
		$('#VrNota').val(mascaraValor(VrVendaNFCE.toFixed(2)));
		$('#MotDesconto').val(MotDescNFCe);
		$('#MotCancelVenda').val(MotivoCancelada);
		$('#VrBrutoConv').val(mascaraValor(VrVBrutoConv.toFixed(2)));
		$('#VrDescConv').val(mascaraValor(VrDescConv.toFixed(2)));
		$('#VrLiqConv').val(mascaraValor(VrLiqConv.toFixed(2)));
		$('#DtVencConv').val(DtVencimentoConveniado);
		$('#NuVoucherVenda').val(NuVoucher);
		$('#NoClienteVoucher').val(NoClienteVoucher);
		$('#NuCPFClienteVoucher').val(CPFClienteVoucher);
		
	}
}

function retornoListaPagamentoVenda(respostaListaPagamentoVenda) {

    var VrDinheiroPagamento = 0;
    var VrCartaoPagamento = 0;
    var VrPOSPagamentoVenda = 0;
    var VrPOSPagamento = 0;
    var VrPIXPagamento = 0;
    var VrMOOVPAYPagamento = 0;
    var VrConvenioPagamento = 0;
    var VrVoucherPagamento = 0;

    if(respostaListaPagamentoVenda.data.length != 0){
	    for (var i = 0; i < respostaListaPagamentoVenda.data.length; i++) {

		IDVendaPagamento = respostaListaPagamentoVenda.data[i]['venda']['IDVENDA'];
		IDEmpresaPagamento = respostaListaPagamentoVenda.data[i]['venda']['IDEMPRESA'];
		IDCaixaWebPagamento = respostaListaPagamentoVenda.data[i]['venda']['IDCAIXAWEB'];
		IDOperadorCaixaPagamento = respostaListaPagamentoVenda.data[i]['venda']['IDOPERADOR'];
		VrDinheiroPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRDINHEIRO']);
		VrCartaoPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECCARTAO']);
		VrPOSPagamentoVenda = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECPOSVENDA']);
		VrPOSPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECPOS']);
		VrPIXPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECPIX']);
		VrMOOVPAYPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECMOOVPAY']);
		VrConvenioPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECCONVENIO']);
		VrVoucherPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECVOUCHER']);
		VrTotalPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRTOTALVENDA']);
		DTPagamento = (respostaListaPagamentoVenda.data[i]['venda']['DTHORAFECHAMENTOFORMATADA']);
		NItem = respostaListaPagamentoVenda.data[i]['venda']['ULTNITEM'];
		
		var TotalPag = VrTotalPagamento - VrVoucherPagamento;

		$('#resultListPagamentoVenda').append(
			`<tr>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrDinheiroPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrCartaoPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrPOSPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrPIXPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrMOOVPAYPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrConvenioPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVoucherPagamento.toFixed(2)) +
			`</label></td>
                </tr>`
		);

		for (var j = 0; j < respostaListaPagamentoVenda.data[i].vendaPagamento.length; j++) {

			TipoPagamento = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['DSTIPOPAGAMENTO']; 
			//NItem = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['NITEM'];
			NuParcelas = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['NPARCELAS'];
			NuAutorizadora = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['NSUAUTORIZADORA'];
			NuAutorizacao = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['NUAUTORIZACAO'];
			NuOperacao = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['NUOPERACAO'];
			VrRecebidoParcela = parseFloat(respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['VALORRECEBIDO']);

			if (NuParcelas == null) {
				NuParcelas = 0;
			}

			if (NuAutorizadora == null) {
				NuAutorizadora = 0;
			}
			
			if (NuOperacao == null) {
				NuOperacao = 0;
			}

			if (NuAutorizacao == null) {
				NuAutorizacao = 0;
			}
			
			$('#resultListPagamento').append(
				`<tr>
                            <td><label style="color: blue;">` + TipoPagamento +
				`</label></td>
                            <td><label style="color: blue;">` + NuParcelas +
				`</label></td>
                            <td><label style="color: blue;">` + NuOperacao +
				`</label></td>
                            <td><label style="color: blue;">` + NuAutorizacao +
				`</label></td>
                            <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrRecebidoParcela.toFixed(2)) +
				`</label></td>
                        </tr>`
			);

		}
		
		$('#IDResVenda').val(IDVendaPagamento);
		$('#IDCaixaWebVenda').val(IDCaixaWebPagamento);
		$('#IDOperadorVenda').val(IDOperadorCaixaPagamento);
		$('#IDEmpResumo').val(IDEmpresaPagamento);
		$('#NItem').val(NItem);
		$('#VrDistribuir').val(mascaraValor(TotalPag.toFixed(2)));
		$('#VrDistribuir2').val(mascaraValor(TotalPag.toFixed(2)));
		$('#DTParcelaCartao').val(DTPagamento);
		$('#DTParcelaPOS').val(DTPagamento);
		$('#DTParcelaCartao2').val(DTPagamento);
		$('#DTParcelaPOS2').val(DTPagamento);
		$('#DTParcelaCartao3').val(DTPagamento);
		$('#VrRecVoucher').val(mascaraValor(VrVoucherPagamento.toFixed(2)));
	}
    }
    
	$('.textoCabecalhoPagamento').html(
		`<h2>
            <span class="fw-300">Lista de Recebimentos da Venda Nº </span>&nbsp${IDVendaPagamento}&nbsp;
        </h2>`
	);
	
	   return ajaxGet('api/administrativo/pagamento-tef.xsjs')
        .then(retornoListaPagamentoTEFSelect)
        .catch((e) => { funcError(), console.log(e) });

}

function modal_Detalhe_Recebimento(id) {

	$.get('administrativo_action_detrecebimentomodal.html', function(res) {

		$('#resulmodaldetvendarecebimento').html(res);
		$("#detVendaRecebimento").modal('show');
		$('#detVendaRecebimento').on('shown.bs.modal', function() {});

		return ajaxGet('api/administrativo/recebimento.xsjs?id=' + id)
			.then(retornoListaPagamentoVenda)
			.catch((e) => { funcError(), console.log(e) });
			
	})

}

function modal_Detalhe_Recebimento_Calcel(id) {

	$.get('administrativo_action_detrecebimentomodal.html', function(res) {

		$('#resulmodaldetvendarecebimento').html(res);
		$("#detVendaRecebimento").modal('show');
		$('#detVendaRecebimento').on('shown.bs.modal', function() {});

		return ajaxGet('api/administrativo/recebimento_cancelada.xsjs?id=' + id)
			.then(retornoListaPagamentoVendaCancelada)
			.catch((e) => { funcError(), console.log(e) });
			
	})

}

function retornoListaPagamentoVendaCancelada(respostaListaPagamentoVendaCancel) {

	for (var i = 0; i < respostaListaPagamentoVendaCancel.data.length; i++) {

		IDVendaPagamento = respostaListaPagamentoVendaCancel.data[i]['venda']['IDVENDA'];
		IDEmpresaPagamento = respostaListaPagamentoVendaCancel.data[i]['venda']['IDEMPRESA'];
		IDCaixaWebPagamento = respostaListaPagamentoVendaCancel.data[i]['venda']['IDCAIXAWEB'];
		IDOperadorCaixaPagamento = respostaListaPagamentoVendaCancel.data[i]['venda']['IDOPERADOR'];
		VrDinheiroPagamento = parseFloat(respostaListaPagamentoVendaCancel.data[i]['venda']['VRDINHEIRO']);
		VrCartaoPagamento = parseFloat(respostaListaPagamentoVendaCancel.data[i]['venda']['VRRECCARTAO']);
		VrPOSPagamentoVenda = parseFloat(respostaListaPagamentoVendaCancel.data[i]['venda']['VRRECPOSVENDA']);
		VrPOSPagamento = parseFloat(respostaListaPagamentoVendaCancel.data[i]['venda']['VRRECPOS']);
		VrPIXPagamento = parseFloat(respostaListaPagamentoVendaCancel.data[i]['venda']['VRRECPIX']);
		VrMOOVPAYPagamento = parseFloat(respostaListaPagamentoVendaCancel.data[i]['venda']['VRRECMOOVPAY']);
		VrConvenioPagamento = parseFloat(respostaListaPagamentoVendaCancel.data[i]['venda']['VRRECCONVENIO']);
		VrVoucherPagamento = parseFloat(respostaListaPagamentoVendaCancel.data[i]['venda']['VRRECVOUCHER']);
		VrTotalPagamento = parseFloat(respostaListaPagamentoVendaCancel.data[i]['venda']['VRTOTALVENDA']);
		NItem = respostaListaPagamentoVendaCancel.data[i]['venda']['ULTNITEM'];

		$('#resultListPagamentoVenda').append(
			`<tr>
                    <td style="text-align: right;"><label style="color: red;">` + mascaraValor(VrDinheiroPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: red;">` + mascaraValor(VrCartaoPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: red;">` + mascaraValor(VrPOSPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: red;">` + mascaraValor(VrPIXPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: red;">` + mascaraValor(VrMOOVPAYPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: red;">` + mascaraValor(VrConvenioPagamento.toFixed(2)) +
			`</label></td>
                    <td style="text-align: right;"><label style="color: red;">` + mascaraValor(VrVoucherPagamento.toFixed(2)) +
			`</label></td>
                </tr>`
		);

		for (var j = 0; j < respostaListaPagamentoVendaCancel.data[i].vendaPagamento.length; j++) {

			TipoPagamento = respostaListaPagamentoVendaCancel.data[i].vendaPagamento[j]['pag']['DSTIPOPAGAMENTO'];
			//NItem = respostaListaPagamentoVendaCancel.data[i].vendaPagamento[j]['pag']['NITEM'];
			NuParcelas = respostaListaPagamentoVendaCancel.data[i].vendaPagamento[j]['pag']['NPARCELAS'];
			NuAutorizadora = respostaListaPagamentoVendaCancel.data[i].vendaPagamento[j]['pag']['NSUAUTORIZADORA'];
			NuAutorizacao = respostaListaPagamentoVendaCancel.data[i].vendaPagamento[j]['pag']['NUAUTORIZACAO'];
			NuOperacao = respostaListaPagamentoVendaCancel.data[i].vendaPagamento[j]['pag']['NUOPERACAO'];
			VrRecebidoParcela = parseFloat(respostaListaPagamentoVendaCancel.data[i].vendaPagamento[j]['pag']['VALORRECEBIDO']);

			if (NuParcelas == null) {
				NuParcelas = 0;
			}

			if (NuAutorizadora == null) {
				NuAutorizadora = 0;
			}
			
			if (NuOperacao == null) {
				NuOperacao = 0;
			}

			if (NuAutorizacao == null) {
				NuAutorizacao = 0;
			}
			
			$('#resultListPagamento').append(
				`<tr>
                            <td><label style="color: red;">` + TipoPagamento +
				`</label></td>
                            <td><label style="color: red;">` + NuParcelas +
				`</label></td>
                            <td><label style="color: red;">` + NuOperacao +
				`</label></td>
                            <td><label style="color: red;">` + NuAutorizacao +
				`</label></td>
                            <td style="text-align: right;"><label style="color: red;">` + mascaraValor(VrRecebidoParcela.toFixed(2)) +
				`</label></td>
                        </tr>`
			);

		}
		
		$('#IDResVenda').val(IDVendaPagamento);
		$('#IDCaixaWebVenda').val(IDCaixaWebPagamento);
		$('#IDOperadorVenda').val(IDOperadorCaixaPagamento);
		$('#IDEmpResumo').val(IDEmpresaPagamento);
		$('#NItem').val(NItem);
		$('#VrDistribuir').val(mascaraValor(VrTotalPagamento.toFixed(2)));
		$('#VrDistribuir2').val(mascaraValor(VrTotalPagamento.toFixed(2)));
		$('#DTParcelaCartao').val(dataAtualCampo);
		$('#DTParcelaPOS').val(dataAtualCampo);
	}

	$('.textoCabecalhoPagamento').html(
		`<h2>
            <span class="fw-300">Lista de Recebimentos da Venda Nº </span>&nbsp${IDVendaPagamento}&nbsp;
        </h2>`
	);
	
	   return ajaxGet('api/administrativo/pagamento-tef.xsjs')
        .then(retornoListaPagamentoTEFSelect)
        .catch((e) => { funcError(), console.log(e) });

}

function retornoListaPagamentoTEFSelect(respostaListaDSPagamentoTEF) {

	for (var i = 0; i < respostaListaDSPagamentoTEF.data.length; i++) {

		DSTipoPagamentoTEF = respostaListaDSPagamentoTEF.data[i]['DSTIPOPAGAMENTOTEF'];

			$('#DSTipoPagamentoTEF').append(
				`<option value="` + DSTipoPagamentoTEF + `"> ` + DSTipoPagamentoTEF +  `</option>`
			);
			
			$('#DSTipoPagamentoTEF2').append(
				`<option value="` + DSTipoPagamentoTEF + `"> ` + DSTipoPagamentoTEF +  `</option>` 
			);
			
			$('#DSTipoPagamentoTEF3').append(
				`<option value="` + DSTipoPagamentoTEF + `"> ` + DSTipoPagamentoTEF +  `</option>`
			);
	}

        return ajaxGet('api/administrativo/pagamento-pos.xsjs')
        .then(retornoListaPagamentoPOSSelect)
        .catch((e) => { funcError(), console.log(e) });
        
}

function retornoListaPagamentoPOSSelect(respostaListaDSPagamentoPOS) {

	for (var i = 0; i < respostaListaDSPagamentoPOS.data.length; i++) {

		DSTipoPagamentoPOS = respostaListaDSPagamentoPOS.data[i]['DSTIPOPAGAMENTOPOS'];

			$('#DSTipoPagamentoPOS').append(
				`<option value="` + DSTipoPagamentoPOS + `"> ` + DSTipoPagamentoPOS +  `</option>`
			);
			
			$('#DSTipoPagamentoPOS2').append(
				`<option value="` + DSTipoPagamentoPOS + `"> ` + DSTipoPagamentoPOS +  `</option>`
			);
	}
}

function alterar_pagamentos() {

    if(IDFuncionarioLogin == '30514' || IDFuncionarioLogin == '2001' || IDFuncionarioLogin == '2024' || IDFuncionarioLogin == '5074' || IDFuncionarioLogin == '5025' || IDFuncionarioLogin == '30174'){
        document.getElementById("idpag").style.display = 'block';
        document.getElementById("buttonpag").style.display = 'block';
        document.getElementById("idbuttonalterar").style.display = 'none';
        document.getElementById("idbuttonalterar2").style.display = 'block';
    }else{
        document.getElementById("idbuttoncolaboradoralterar").style.display = 'block';
    }

}

function alterar_pagamentos_fechar() {

  document.getElementById("idpag").style.display = 'none';
  document.getElementById("buttonpag").style.display = 'none';
  document.getElementById("idbuttonalterar").style.display = 'block';
  document.getElementById("idbuttonalterar2").style.display = 'none';

}

function soma_ValoresTotais(){

    var vrdistribuir2 = $("#VrDistribuir2").val().replace(".", "").replace(",", ".");
    var vrdin = $("#VrRecDinheiro").val().replace(".", "").replace(",", ".");
    var vrcartao = $("#VrRecCartao").val().replace(".", "").replace(",", ".");
    //var vrcartao = 0;
    var vrpos = $("#VrRecPOS").val().replace(".", "").replace(",", ".");
    var vrcartao2 = $("#VrRecCartao2").val().replace(".", "").replace(",", ".");
    //var vrcartao2 = 0;
    var vrcartao3 = $("#VrRecCartao3").val().replace(".", "").replace(",", ".");
    //var vrcartao3 = 0;
    var vrpos2 = $("#VrRecPOS2").val().replace(".", "").replace(",", ".");
    
    var vrpix = $("#VrRecPIX").val().replace(".", "").replace(",", ".");
    
    var vrvoucher = 0;
  
    var somavalores = parseFloat(vrdin) + parseFloat(vrpix) + parseFloat(vrcartao) + parseFloat(vrpos) + parseFloat(vrcartao2)  + parseFloat(vrcartao3) + parseFloat(vrpos2) + parseFloat(vrvoucher);
    var somadifere = parseFloat(vrdistribuir2)-parseFloat(somavalores);

    $("#VrDistribuir").val(mascaraValor(somadifere.toFixed(2)));
    
}

function cancelar_VendaPagamento(){
    
    var idresumo = $("#IDResVenda").val();
    var MotAlterar = $("#MotAlterar").val();

    var vrdistribuir = $("#VrDistribuir").val().replace(".", "").replace(",", ".");
    var vrdistribuir2 = $("#VrDistribuir2").val().replace(".", "").replace(",", ".");
  
    if(vrdistribuir>0){
        
      $("#VrRecDinheiro").focus();
      $("#VrRecDinheiro").select();
  
      alerta_valor_menor_venda();
      return false;
    }else{
        var idresumo = $("#IDResVenda").val();
        var dados = [{
        	"IDVENDA": idresumo,
        	"STCANCELADO": 'True',
        	"DTULTIMAALTERACAO": dataAtualCampo,
        	"IDFUNCIONARIOCANCELA": parseInt(IDFuncionarioLogin),
        	"TXTMOTIVOCANCELA": MotAlterar
        }];
        
        ajaxPut("api/administrativo/altera-venda-pagamento.xsjs", dados)
        	.then(funcSucessUpdateVendaPagamento)
        	.catch((e) => { funcError(), console.log(e) });
    }
}

function funcSucessCadastraVendaPagamento(resposta) {

    alerta_novo_recebimento_sucesso();
	$("#detVendaRecebimento").modal('hide');

}

function retornoUpdateVoucher(resposta) {

}

function funcSucessUpdateVendaPagamento(resposta) {
    inserir_NovoValor();
    //alerta_novo_recebimento_sucesso();
	//$("#detVendaRecebimento").modal('hide');

}

function inserir_NovoValor() {

    var idresumo = $("#IDResVenda").val();
    var idempresumo = $("#IDEmpResumo").val();
    var idcaixawebresumo = $("#IDCaixaWebVenda").val();
    var idoperadorresumo = $("#IDOperadorVenda").val();
    var nitem = $("#NItem").val();
    
    //var nitem = 0;
    var nitematual = parseFloat(nitem);

    var idvendapag = idresumo+'-';

    var vrdistribuir = $("#VrDistribuir").val().replace(".", "").replace(",", ".");
    var vrdistribuir2 = $("#VrDistribuir2").val().replace(".", "").replace(",", ".");
    var vrdin = $("#VrRecDinheiro").val().replace(".", "").replace(",", ".");
    var vrcartao = $("#VrRecCartao").val().replace(".", "").replace(",", ".");
    //var vrcartao = 0;
    var vrpos = $("#VrRecPOS").val().replace(".", "").replace(",", ".");
    var vrcartao2 = $("#VrRecCartao2").val().replace(".", "").replace(",", ".");
    //var vrcartao2 = 0;
    var vrcartao3 = $("#VrRecCartao3").val().replace(".", "").replace(",", ".");
    //var vrcartao3 = 0;
    var vrpos2 = $("#VrRecPOS2").val().replace(".", "").replace(",", ".");
    var vrvoucher = $("#VrRecVoucher").val().replace(".", "").replace(",", ".");
    
    var vrvpix = $("#VrRecPIX").val().replace(".", "").replace(",", ".");
    var nuchavpix = $("#NuChavePIX").val();
  
    var tipopagamento = $("#DSTipoPagamentoTEF").val();
    var nutipopagtef = tipopagamento.substring(0, 3);
    var dstipopagtef = tipopagamento.substring(4);
    
    var tipopagamento2 = $("#DSTipoPagamentoTEF2").val();
    var nutipopagtef2 = tipopagamento2.substring(0, 3);
    var dstipopagtef2 = tipopagamento2.substring(4);
    
    var tipopagamento3 = $("#DSTipoPagamentoTEF3").val();
    var nutipopagtef3 = tipopagamento3.substring(0, 3);
    var dstipopagtef3 = tipopagamento3.substring(4);

    var nuoperacao = $("#NuOperacao").val();
    var nuatorizacao = $("#NuAutorizacao").val();
    
    var nuoperacao2 = $("#NuOperacao2").val();
    var nuatorizacao2 = $("#NuAutorizacao2").val();
    
    var nuoperacao3 = $("#NuOperacao3").val();
    var nuatorizacao3 = $("#NuAutorizacao3").val();

    var tipopagamentopos = $("#DSTipoPagamentoPOS").val();
    var nutipopagpos = tipopagamentopos.substring(0, 3);
    var dstipopagpos = tipopagamentopos.substring(4);
    
    var tipopagamentopos2 = $("#DSTipoPagamentoPOS2").val();
    var nutipopagpos2 = tipopagamentopos2.substring(0, 3);
    var dstipopagpos2 = tipopagamentopos2.substring(4);
    
    var nuoperacaopos = $("#NuOperacaoPOS").val();
    var nuatorizacaopos = $("#NuAutorizacaoPOS").val();

    var nuoperacaopos2 = $("#NuOperacaoPOS2").val();
    var nuatorizacaopos2 = $("#NuAutorizacaoPOS2").val();
    
    var qtdparcelacartao = $("#QtdParcelaCartao").val();
    var dtparcelacartao = $("#DTParcelaCartao").val();
    var qtdparcelapos = $("#QtdParcelaPOS").val();
    var dtparcelapos = $("#DTParcelaPOS").val();
    
    var qtdparcelacartao2 = $("#QtdParcelaCartao2").val();
    var dtparcelacartao2 = $("#DTParcelaCartao2").val();
    
    var qtdparcelacartao3 = $("#QtdParcelaCartao3").val();
    var dtparcelacartao3 = $("#DTParcelaCartao3").val();
    
    var qtdparcelapos2 = $("#QtdParcelaPOS2").val();
    var dtparcelapos2 = $("#DTParcelaPOS2").val();
    
    var nuvoucher = '';
  
    //var somavalores = parseFloat(vrdin) + parseFloat(vrcartao) + parseFloat(vrpos) + parseFloat(vrvoucher);
  
    if(vrdistribuir>0){
        
      $("#VrRecDinheiro").focus();
      $("#VrRecDinheiro").select();
  
      alerta_valor_menor_venda();
      return false;
    }
 
    if(vrdin>0){
                nitematual++;
                idvendapag = idresumo+'-';
                idvendapag = idvendapag+nitematual;
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                var dadosDIN = [{
                    	"IDVENDAPAGAMENTO":idvendapag,
                    	"IDVENDA":idresumo,
                    	"NITEM":parseInt(nitematual),
                    	"TPAG":'000',
                    	"DSTIPOPAGAMENTO":'DINHEIRO',
                    	"VALORRECEBIDO":parseFloat(vrdin),
                    	"VALORDEDUZIDO":0,
                    	"VALORLIQUIDO":parseFloat(vrdin),
                    	"DTPROCESSAMENTO":dataAtualCampo,
                    	"STCANCELADO":'False',
                    	"IDFUNCIONARIO":IDFuncionarioLogin
                }];
                //console.table(dadosDIN);
                ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosDIN)
                	.then(funcSucessCadastraVendaPagamento)
                	.catch((e) => { funcError(), console.log(e) });
                	
            /////ATUALIZAR O RECEBIMENTO EM DINHEIRO DA VENDA/////////////////
        
            VrDinheiroPagamento = parseFloat(vrdin);

    }else{
            /////ATUALIZAR O RECEBIMENTO EM DINHEIRO DA VENDA/////////////////
            VrDinheiroPagamento = 0;
    }

    if(vrvpix>0){
        
            if (nuchavpix=='') {
          
              $("#resultadodetvendarecebimento").html(
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
                "</button>" +
                "<strong>Atenção!</strong> Informe a Chave do PIX.</div>"
              );
                $("#NuChavePIX").focus();
                return false;
            }
            
                nitematual++;
                idvendapag = idresumo+'-';
                idvendapag = idvendapag+nitematual;
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                var dadosPIX = [{
                    	"IDVENDAPAGAMENTO":idvendapag,
                    	"IDVENDA":idresumo,
                    	"NITEM":parseInt(nitematual),
                    	"TPAG":'031',
                    	"DSTIPOPAGAMENTO":'PIX',
                    	"VALORRECEBIDO":parseFloat(vrvpix),
                    	"VALORDEDUZIDO":0,
                    	"VALORLIQUIDO":parseFloat(vrvpix),
                    	"DTPROCESSAMENTO":dataAtualCampo,
                    	"NOTEF":'PIX',
                    	"NUAUTORIZACAO":nuchavpix,
                    	"STCANCELADO":'False',
                    	"IDFUNCIONARIO":IDFuncionarioLogin
                }];
                //console.table(dadosDIN);
                ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosPIX)
                	.then(funcSucessCadastraVendaPagamento)
                	.catch((e) => { funcError(), console.log(e) });
                	
            /////ATUALIZAR O RECEBIMENTO EM DINHEIRO DA VENDA/////////////////
        
            VrPIXPagamento = parseFloat(vrvpix);

    }else{
            /////ATUALIZAR O RECEBIMENTO EM DINHEIRO DA VENDA/////////////////
            VrPIXPagamento = 0;
    }
    
    if(vrcartao>0){

            if (tipopagamento==0) {
          
              $("#resultadodetvendarecebimento").html(
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
                "</button>" +
                "<strong>Atenção!</strong> Informe a Descrição do Cartão TEF.</div>"
              );
                $("#DSTipoPagamentoTEF").focus();
                return false;
            }
    
            if(qtdparcelacartao==0){
                
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                var dadosTEF = [{
                    	"IDVENDAPAGAMENTO":idvendapag,
                    	"IDVENDA":idresumo,
                    	"NITEM":parseInt(nitematual),
                    	"TPAG":nutipopagtef,
                    	"DSTIPOPAGAMENTO":dstipopagtef,
                    	"VALORRECEBIDO":parseFloat(vrcartao),
                    	"VALORDEDUZIDO":0,
                    	"VALORLIQUIDO":parseFloat(vrcartao),
                    	"DTPROCESSAMENTO":dtparcelacartao,
                    	"DTVENCIMENTO":dtparcelacartao,
                    	"NPARCELAS":0,
                    	"NOTEF":'TEF',
                    	"NOAUTORIZADOR":dstipopagtef,
                    	"NOCARTAO":'NÃO INFORMADO',
                    	"NUOPERACAO":nuoperacao,
                    	"NSUTEF":nuoperacao,
                    	"NSUAUTORIZADORA":nuoperacao,
                    	"NUAUTORIZACAO":nuatorizacao,
                    	"STCANCELADO":'False',
                    	"IDFUNCIONARIO":IDFuncionarioLogin
                }];
                //console.table(dadosTEF);
                ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosTEF)
                	.then(funcSucessCadastraVendaPagamento)
                	.catch((e) => { funcError(), console.log(e) });
                	
                /////ATUALIZAR O RECEBIMENTO EM TEF DA VENDA/////////////////
                VrCartaoPagamento = parseFloat(vrcartao);

            }else{
                valordivCredito =0;
                valorresultCredito=0;
                valorparc=0;
                valordiv = parseFloat((vrcartao/qtdparcelacartao).toFixed(2));
               
                for (i = 1; i <= qtdparcelacartao; i++) {
                    
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
    
                    valorparc += (valordiv); 

                    if(i==1){
                        finalparcelacred = dtparcelacartao;
                    }else{

                        dtparccartao = dtparcelacartao.split('-');
                        
                        var dt = new Date(dtparccartao[0], dtparccartao[1], dtparccartao[2]);

                        e = i - 1;
                        finalparcelacredTeste = dt.setMonth( dt.getMonth() + e );
                        
                        var dataParcCartao = new Date(finalparcelacredTeste);
                        var diaParcCartao = dataParcCartao.getDate(); // 1-31
                        var mesParcCartao = dataParcCartao.getMonth(); // 0-11 (zero=janeiro)
                        var ano4ParcCartao = dataParcCartao.getFullYear(); // 4 dígitos
                        
                        mesParcCartaoatual = (mesParcCartao + 1);
                        mesParcCartaoatualFormatado = String(mesParcCartaoatual);
                        diachekCartao = String(diaParcCartao);
                        
                        if(mesParcCartaoatual == 4 || mesParcCartaoatual == 6 || mesParcCartaoatual == 9 || mesParcCartaoatual == 11){
                            if(diaParcCartao == 31){
                                var diachekCartao = String(diaParcCartao - 1);
                            }
                        }else if(mesParcCartaoatual == 2){
                            if(diaParcCartao == 30){
                                var diachekCartao = String(diaParcCartao - 2);
                            }else if (diaParcCartao == 31){
                                var diachekCartao = String(diaParcCartao - 3);
                            }
                        }

                        finalparcelacred = ano4ParcCartao + '-' + (mesParcCartaoatualFormatado.padStart(2, '0')) + '-' + diachekCartao.padStart(2, '0');
                        
                    }
                    
                    if(i==qtdparcelacartao){                      

                        if(valorparc>vrcartao){

                            valordivCredito =  parseFloat((valorparc - vrcartao).toFixed(2));
                            valorresultCredito = valordiv - valordivCredito;                            
                        }
                        if(valorparc<vrcartao){

                            valordivCredito =  parseFloat((vrcartao - valorparc).toFixed(2));
                            valorresultCredito = valordiv + valordivCredito;
                        }
                        if(valorparc==vrcartao){

                            valorresultCredito = valordiv;
                        }
                    }else{

                        valorresultCredito = valordiv;
                    }

                        var dadosTEF = [{
                            	"IDVENDAPAGAMENTO":idvendapag,
                            	"IDVENDA":idresumo,
                            	"NITEM":parseInt(nitematual),
                            	"TPAG":nutipopagtef,
                            	"DSTIPOPAGAMENTO":dstipopagtef,
                            	"VALORRECEBIDO":parseFloat(valorresultCredito),
                            	"VALORDEDUZIDO":0,
                            	"VALORLIQUIDO":parseFloat(valorresultCredito),
                            	"DTPROCESSAMENTO":dtparcelacartao,
                            	"DTVENCIMENTO":finalparcelacred,
                            	"NPARCELAS":parseInt(qtdparcelacartao),
                            	"NOTEF":'TEF',
                            	"NOAUTORIZADOR":dstipopagtef,
                            	"NOCARTAO":'NÃO INFORMADO',
                            	"NUOPERACAO":nuoperacao,
                            	"NSUTEF":nuoperacao,
                            	"NSUAUTORIZADORA":nuoperacao,
                            	"NUAUTORIZACAO":nuatorizacao,
                            	"STCANCELADO":'False',
                            	"IDFUNCIONARIO":IDFuncionarioLogin
                        }];
                        //console.table(dadosTEF);
                        ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosTEF)
                        	.then(funcSucessCadastraVendaPagamento)
                        	.catch((e) => { funcError(), console.log(e) });

                }
                
                /////ATUALIZAR O RECEBIMENTO EM TEF DA VENDA/////////////////
                VrCartaoPagamento = parseFloat(vrcartao);
            }

    }else{
                /////ATUALIZAR O RECEBIMENTO EM TEF DA VENDA/////////////////
                VrCartaoPagamento = 0;
    }
    
    if(vrcartao2>0){

            if (tipopagamento2==0) {
          
              $("#resultadodetvendarecebimento").html(
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
                "</button>" +
                "<strong>Atenção!</strong> Informe a Descrição do Cartão TEF 2.</div>"
              );
                $("#DSTipoPagamentoTEF2").focus();
                return false;
            }
    
            if(qtdparcelacartao2==0){
                
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                var dadosTEF2 = [{
                    	"IDVENDAPAGAMENTO":idvendapag,
                    	"IDVENDA":idresumo,
                    	"NITEM":parseInt(nitematual),
                    	"TPAG":nutipopagtef2,
                    	"DSTIPOPAGAMENTO":dstipopagtef2,
                    	"VALORRECEBIDO":parseFloat(vrcartao2),
                    	"VALORDEDUZIDO":0,
                    	"VALORLIQUIDO":parseFloat(vrcartao2),
                    	"DTPROCESSAMENTO":dtparcelacartao2,
                    	"DTVENCIMENTO":dtparcelacartao2,
                    	"NPARCELAS":0,
                    	"NOTEF":'TEF',
                    	"NOAUTORIZADOR":dstipopagtef2,
                    	"NOCARTAO":'NÃO INFORMADO',
                    	"NUOPERACAO":nuoperacao2,
                    	"NSUTEF":nuoperacao2,
                    	"NSUAUTORIZADORA":nuoperacao2,
                    	"NUAUTORIZACAO":nuatorizacao2,
                    	"STCANCELADO":'False',
                    	"IDFUNCIONARIO":IDFuncionarioLogin
                }];
                //console.table(dadosTEF2);
                ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosTEF2)
                	.then(funcSucessCadastraVendaPagamento)
                	.catch((e) => { funcError(), console.log(e) });
                	
                /////ATUALIZAR O RECEBIMENTO EM TEF DA VENDA/////////////////
                VrCartaoPagamento2 = parseFloat(vrcartao2);

            }else{
                valordivCredito2 =0;
                valorresultCredito2=0;
                valorparc2=0;
                valordiv2 = parseFloat((vrcartao2/qtdparcelacartao2).toFixed(2));
               
                for (i = 1; i <= qtdparcelacartao2; i++) {
                    
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
    
                    valorparc2 += (valordiv2); 

                    if(i==1){
                        finalparcelacred2 = dtparcelacartao2;
                    }else{

                        dtparccartao2 = dtparcelacartao2.split('-');
                        
                        var dt2 = new Date(dtparccartao2[0], dtparccartao2[1], dtparccartao2[2]);

                        e = i - 1;
                        finalparcelacredTeste2 = dt2.setMonth( dt2.getMonth() + e );
                        
                        var dataParcCartao2 = new Date(finalparcelacredTeste2);
                        var diaParcCartao2 = dataParcCartao2.getDate(); // 1-31
                        var mesParcCartao2 = dataParcCartao2.getMonth(); // 0-11 (zero=janeiro)
                        var ano4ParcCartao2 = dataParcCartao2.getFullYear(); // 4 dígitos
                        diaFormatadoParcCartao2 = String(diaParcCartao2);
                        
                        mesParcCartaoatual2 = (mesParcCartao2 + 1);
                        mesParcCartaoatualFormatado2 = String(mesParcCartaoatual2);
                        diachekCartao2 = String(diaParcCartao2);
                        
                        if(mesParcCartaoatual2 == 4 || mesParcCartaoatual2 == 6 || mesParcCartaoatual2 == 9 || mesParcCartaoatual2 == 11){
                            if(diaParcCartao2 == 31){
                                var diachekCartao2 = String(diaParcCartao2 - 1);
                            }
                        }else if(mesParcCartaoatual2 == 2){
                            if(diaParcCartao2 == 30){
                                var diachekCartao2 = String(diaParcCartao2 - 2);
                            }else if (diaParcCartao2 == 31){
                                var diachekCartao2 = String(diaParcCartao2 - 3);
                            }
                        }

                        finalparcelacred2 = ano4ParcCartao2 + '-' + (mesParcCartaoatualFormatado2.padStart(2, '0')) + '-' + diachekCartao2.padStart(2, '0');
                        
                    }
                    
                    if(i==qtdparcelacartao2){                      

                        if(valorparc2>vrcartao2){

                            valordivCredito2 =  parseFloat((valorparc2 - vrcartao2).toFixed(2));
                            valorresultCredito2 = valordiv2 - valordivCredito2;                            
                        }
                        if(valorparc2<vrcartao2){

                            valordivCredito2 =  parseFloat((vrcartao2 - valorparc2).toFixed(2));
                            valorresultCredito2 = valordiv2 + valordivCredito2;
                        }
                        if(valorparc2==vrcartao2){

                            valorresultCredito2 = valordiv2;
                        }
                    }else{

                        valorresultCredito2 = valordiv2;
                    }

                        var dadosTEF2 = [{
                            	"IDVENDAPAGAMENTO":idvendapag,
                            	"IDVENDA":idresumo,
                            	"NITEM":parseInt(nitematual),
                            	"TPAG":nutipopagtef2,
                            	"DSTIPOPAGAMENTO":dstipopagtef2,
                            	"VALORRECEBIDO":parseFloat(valorresultCredito2),
                            	"VALORDEDUZIDO":0,
                            	"VALORLIQUIDO":parseFloat(valorresultCredito2),
                            	"DTPROCESSAMENTO":dtparcelacartao2,
                            	"DTVENCIMENTO":finalparcelacred2,
                            	"NPARCELAS":parseInt(qtdparcelacartao2),
                            	"NOTEF":'TEF',
                            	"NOAUTORIZADOR":dstipopagtef2,
                            	"NOCARTAO":'NÃO INFORMADO',
                            	"NUOPERACAO":nuoperacao2,
                            	"NSUTEF":nuoperacao2,
                            	"NSUAUTORIZADORA":nuoperacao2,
                            	"NUAUTORIZACAO":nuatorizacao2,
                            	"STCANCELADO":'False',
                            	"IDFUNCIONARIO":IDFuncionarioLogin
                        }];
                        //console.table(dadosTEF2);
                        ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosTEF2)
                        	.then(funcSucessCadastraVendaPagamento)
                        	.catch((e) => { funcError(), console.log(e) });

                }
                
                /////ATUALIZAR O RECEBIMENTO EM TEF DA VENDA/////////////////
                VrCartaoPagamento2 = parseFloat(vrcartao2);
            }

    }else{
                /////ATUALIZAR O RECEBIMENTO EM TEF DA VENDA/////////////////
                VrCartaoPagamento2 = 0;
    }
    
    if(vrcartao3>0){

            if (tipopagamento3==0) {
          
              $("#resultadodetvendarecebimento").html(
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
                "</button>" +
                "<strong>Atenção!</strong> Informe a Descrição do Cartão TEF 3.</div>"
              );
                $("#DSTipoPagamentoTEF3").focus();
                return false;
            }
    
            if(qtdparcelacartao3==0){
                
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                var dadosTEF3 = [{
                    	"IDVENDAPAGAMENTO":idvendapag,
                    	"IDVENDA":idresumo,
                    	"NITEM":parseInt(nitematual),
                    	"TPAG":nutipopagtef3,
                    	"DSTIPOPAGAMENTO":dstipopagtef3,
                    	"VALORRECEBIDO":parseFloat(vrcartao3),
                    	"VALORDEDUZIDO":0,
                    	"VALORLIQUIDO":parseFloat(vrcartao3),
                    	"DTPROCESSAMENTO":dtparcelacartao3,
                    	"DTVENCIMENTO":dtparcelacartao3,
                    	"NPARCELAS":0,
                    	"NOTEF":'TEF',
                    	"NOAUTORIZADOR":dstipopagtef3,
                    	"NOCARTAO":'NÃO INFORMADO',
                    	"NUOPERACAO":nuoperacao3,
                    	"NSUTEF":nuoperacao3,
                    	"NSUAUTORIZADORA":nuoperacao3,
                    	"NUAUTORIZACAO":nuatorizacao3,
                    	"STCANCELADO":'False',
                    	"IDFUNCIONARIO":IDFuncionarioLogin
                }];
                //console.table(dadosTEF2);
                ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosTEF3)
                	.then(funcSucessCadastraVendaPagamento)
                	.catch((e) => { funcError(), console.log(e) });
                	
                /////ATUALIZAR O RECEBIMENTO EM TEF DA VENDA/////////////////
                VrCartaoPagamento3 = parseFloat(vrcartao3);

            }else{
                valordivCredito3 =0;
                valorresultCredito3=0;
                valorparc3=0;
                valordiv3 = parseFloat((vrcartao3/qtdparcelacartao3).toFixed(2));
               
                for (i = 1; i <= qtdparcelacartao3; i++) {
                    
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
    
                    valorparc3 += (valordiv3); 

                    if(i==1){
                        finalparcelacred3 = dtparcelacartao3;
                    }else{

                        dtparccartao3 = dtparcelacartao3.split('-');
                        
                        var dt3 = new Date(dtparccartao3[0], dtparccartao3[1], dtparccartao3[2]);

                        e = i - 1;
                        finalparcelacredTeste3 = dt3.setMonth( dt3.getMonth() + e );
                        
                        var dataParcCartao3 = new Date(finalparcelacredTeste3);
                        var diaParcCartao3 = dataParcCartao3.getDate(); // 1-31
                        var mesParcCartao3 = dataParcCartao3.getMonth(); // 0-11 (zero=janeiro)
                        var ano4ParcCartao3 = dataParcCartao3.getFullYear(); // 4 dígitos
                        diaFormatadoParcCartao3 = String(diaParcCartao3);
                        
                        mesParcCartaoatual3 = (mesParcCartao3 + 1);
                        mesParcCartaoatualFormatado3 = String(mesParcCartaoatual3);
                        diachekCartao3 = String(diaParcCartao3);
                        
                        if(mesParcCartaoatual3 == 4 || mesParcCartaoatual3 == 6 || mesParcCartaoatual3 == 9 || mesParcCartaoatual3 == 11){
                            if(diaParcCartao3 == 31){
                                var diachekCartao3 = String(diaParcCartao3 - 1);
                            }
                        }else if(mesParcCartaoatual3 == 2){
                            if(diaParcCartao3 == 30){
                                var diachekCartao3 = String(diaParcCartao3 - 2);
                            }else if (diaParcCartao3 == 31){
                                var diachekCartao3 = String(diaParcCartao3 - 3);
                            }
                        }

                        finalparcelacred3 = ano4ParcCartao3 + '-' + (mesParcCartaoatualFormatado3.padStart(2, '0')) + '-' + diachekCartao3.padStart(2, '0');
                        
                    }
                    
                    if(i==qtdparcelacartao3){                      

                        if(valorparc3>vrcartao3){

                            valordivCredito3 =  parseFloat((valorparc3 - vrcartao3).toFixed(2));
                            valorresultCredito3 = valordiv3 - valordivCredito3;                            
                        }
                        if(valorparc3<vrcartao3){

                            valordivCredito3 =  parseFloat((vrcartao3 - valorparc3).toFixed(2));
                            valorresultCredito3 = valordiv3 + valordivCredito3;
                        }
                        if(valorparc3==vrcartao3){

                            valorresultCredito3 = valordiv3;
                        }
                    }else{

                        valorresultCredito3 = valordiv3;
                    }

                        var dadosTEF3 = [{
                            	"IDVENDAPAGAMENTO":idvendapag,
                            	"IDVENDA":idresumo,
                            	"NITEM":parseInt(nitematual),
                            	"TPAG":nutipopagtef3,
                            	"DSTIPOPAGAMENTO":dstipopagtef3,
                            	"VALORRECEBIDO":parseFloat(valorresultCredito3),
                            	"VALORDEDUZIDO":0,
                            	"VALORLIQUIDO":parseFloat(valorresultCredito3),
                            	"DTPROCESSAMENTO":dtparcelacartao3,
                            	"DTVENCIMENTO":finalparcelacred3,
                            	"NPARCELAS":parseInt(qtdparcelacartao3),
                            	"NOTEF":'TEF',
                            	"NOAUTORIZADOR":dstipopagtef3,
                            	"NOCARTAO":'NÃO INFORMADO',
                            	"NUOPERACAO":nuoperacao3,
                            	"NSUTEF":nuoperacao3,
                            	"NSUAUTORIZADORA":nuoperacao3,
                            	"NUAUTORIZACAO":nuatorizacao3,
                            	"STCANCELADO":'False',
                            	"IDFUNCIONARIO":IDFuncionarioLogin
                        }];
                        //console.table(dadosTEF2);
                        ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosTEF3)
                        	.then(funcSucessCadastraVendaPagamento)
                        	.catch((e) => { funcError(), console.log(e) });

                }
                
                /////ATUALIZAR O RECEBIMENTO EM TEF DA VENDA/////////////////
                VrCartaoPagamento3 = parseFloat(vrcartao3);
            }

    }else{
                /////ATUALIZAR O RECEBIMENTO EM TEF DA VENDA/////////////////
                VrCartaoPagamento3 = 0;
    }
 
    if(vrpos>0){
        //ATUALIZA CARTAO NA TABELA DE RESUMO VENDA

            if(qtdparcelapos==0){
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                var dadosPOS = [{
                    	"IDVENDAPAGAMENTO":idvendapag,
                    	"IDVENDA":idresumo,
                    	"NITEM":parseInt(nitematual),
                    	"TPAG":nutipopagpos,
                    	"DSTIPOPAGAMENTO":dstipopagpos,
                    	"VALORRECEBIDO":parseFloat(vrpos),
                    	"VALORDEDUZIDO":0,
                    	"VALORLIQUIDO":parseFloat(vrpos),
                    	"DTPROCESSAMENTO":dtparcelapos,
                    	"DTVENCIMENTO":dtparcelapos,
                    	"NPARCELAS":0,
                    	"NOTEF":'POS',
                    	"NOAUTORIZADOR":dstipopagpos,
                    	"NOCARTAO":'NÃO INFORMADO',
                    	"NUOPERACAO":nuoperacaopos,
                    	"NSUTEF":nuoperacaopos,
                    	"NSUAUTORIZADORA":nuoperacaopos,
                    	"NUAUTORIZACAO":nuatorizacaopos,
                    	"STCANCELADO":'False',
                    	"IDFUNCIONARIO":IDFuncionarioLogin
                }];
                //console.table(dadosPOS);
                ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosPOS)
                	.then(funcSucessCadastraVendaPagamento)
                	.catch((e) => { funcError(), console.log(e) });
                	
            /////ATUALIZAR O RECEBIMENTO EM POS DA VENDA/////////////////
            VrPOSPagamento = parseFloat(vrpos);

            }else{
                valordivCreditoPOS =0;
                valorresultCreditoPOS=0;
                valorparcPOS=0;
                valordivPOS = parseFloat((vrpos/qtdparcelapos).toFixed(2));
               
                for (i = 1; i <= qtdparcelapos; i++) {
                    
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
                    
                    valorparcPOS += (valordivPOS); 

                    if(i==1){
                        finalparcelacredPOS = dtparcelapos;
                    }else{

                        dtparcpos = dtparcelapos.split('-');
                        
                        var dtpos = new Date(dtparcpos[0], dtparcpos[1], dtparcpos[2]);

                        e = i - 1;
                        finalparcelaposTeste = dtpos.setMonth( dtpos.getMonth() + e );
                        
                        var dataParcPos = new Date(finalparcelaposTeste);
                        var diaParcPos = dataParcPos.getDate(); // 1-31
                        var mesParcPos = dataParcPos.getMonth(); // 0-11 (zero=janeiro)
                        var ano4ParcPos = dataParcPos.getFullYear(); // 4 dígitos
                        diaFormatadoParcPos = String(diaParcPos);
                        
                        mesParcPOSatual = (mesParcPos + 1);
                        mesParcPOSatualFormatado = String(mesParcPOSatual);
                        diachekPOS = String(diaParcPos);
                        
                        if(mesParcPOSatual == 4 || mesParcPOSatual == 6 || mesParcPOSatual == 9 || mesParcPOSatual == 11){
                            if(diaParcPos == 31){
                                var diachekPOS = String(diaParcPos - 1);
                            }
                        }else if(mesParcPOSatual == 2){
                            if(diaParcPos == 30){
                                var diachekPOS = String(diaParcPos - 2);
                            }else if (diaParcPos == 31){
                                var diachekPOS = String(diaParcPos - 3);
                            }
                        }

                        finalparcelacredPOS = ano4ParcPos + '-' + (mesParcPOSatualFormatado.padStart(2, '0')) + '-' + diachekPOS.padStart(2, '0');
                        
                    }
                    
                    if(i==qtdparcelapos){                      

                        if(valorparcPOS>vrpos){

                            valordivCreditoPOS =  parseFloat((valorparcPOS - vrpos).toFixed(2));
                            valorresultCreditoPOS = valordivPOS - valordivCreditoPOS;                            
                        }
                        if(valorparcPOS<vrpos){

                            valordivCreditoPOS =  parseFloat((vrpos - valorparcPOS).toFixed(2));
                            valorresultCreditoPOS = valordivPOS + valordivCreditoPOS;
                        }
                        if(valorparcPOS==vrpos){

                            valorresultCreditoPOS = valordivPOS;
                        }
                    }else{

                        valorresultCreditoPOS = valordivPOS;
                    }

                        var dadosPOS = [{
                            	"IDVENDAPAGAMENTO":idvendapag,
                            	"IDVENDA":idresumo,
                            	"NITEM":parseInt(nitematual),
                            	"TPAG":nutipopagpos,
                            	"DSTIPOPAGAMENTO":dstipopagpos,
                            	"VALORRECEBIDO":parseFloat(valorresultCreditoPOS),
                            	"VALORDEDUZIDO":0,
                            	"VALORLIQUIDO":parseFloat(valorresultCreditoPOS),
                            	"DTPROCESSAMENTO":dtparcelapos,
                            	"DTVENCIMENTO":finalparcelacredPOS,
                            	"NPARCELAS":parseInt(qtdparcelapos),
                            	"NOTEF":'POS',
                            	"NOAUTORIZADOR":dstipopagpos,
                            	"NOCARTAO":'NÃO INFORMADO',
                            	"NUOPERACAO":nuoperacaopos,
                            	"NSUTEF":nuoperacaopos,
                            	"NSUAUTORIZADORA":nuoperacaopos,
                            	"NUAUTORIZACAO":nuatorizacaopos,
                            	"STCANCELADO":'False',
                            	"IDFUNCIONARIO":IDFuncionarioLogin
                        }];
                        //console.table(dadosPOS);
                        ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosPOS)
                        	.then(funcSucessCadastraVendaPagamento)
                        	.catch((e) => { funcError(), console.log(e) });

                }
                
                /////ATUALIZAR O RECEBIMENTO EM POS DA VENDA/////////////////
                VrPOSPagamento = parseFloat(vrpos);
            }

    }else{
                /////ATUALIZAR O RECEBIMENTO EM POS DA VENDA/////////////////
                VrPOSPagamento = 0;
    }
    
    if(vrpos2>0){
        //ATUALIZA CARTAO NA TABELA DE RESUMO VENDA

            if(qtdparcelapos2==0){
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                var dadosPOS2 = [{
                    	"IDVENDAPAGAMENTO":idvendapag,
                    	"IDVENDA":idresumo,
                    	"NITEM":parseInt(nitematual),
                    	"TPAG":nutipopagpos2,
                    	"DSTIPOPAGAMENTO":dstipopagpos2,
                    	"VALORRECEBIDO":parseFloat(vrpos2),
                    	"VALORDEDUZIDO":0,
                    	"VALORLIQUIDO":parseFloat(vrpos2),
                    	"DTPROCESSAMENTO":dtparcelapos,
                    	"DTVENCIMENTO":dtparcelapos2,
                    	"NPARCELAS":0,
                    	"NOTEF":'POS',
                    	"NOAUTORIZADOR":dstipopagpos2,
                    	"NOCARTAO":'NÃO INFORMADO',
                    	"NUOPERACAO":nuoperacaopos2,
                    	"NSUTEF":nuoperacaopos2,
                    	"NSUAUTORIZADORA":nuoperacaopos2,
                    	"NUAUTORIZACAO":nuatorizacaopos2,
                    	"STCANCELADO":'False',
                    	"IDFUNCIONARIO":IDFuncionarioLogin
                }];
                //console.table(dadosPOS2);
                ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosPOS2)
                	.then(funcSucessCadastraVendaPagamento)
                	.catch((e) => { funcError(), console.log(e) });
                	
            /////ATUALIZAR O RECEBIMENTO EM POS DA VENDA/////////////////
            VrPOSPagamento2 = parseFloat(vrpos2);

            }else{
                valordivCreditoPOS2 =0;
                valorresultCreditoPOS2=0;
                valorparcPOS2=0;
                valordivPOS2 = parseFloat((vrpos2/qtdparcelapos2).toFixed(2));
               
                for (i = 1; i <= qtdparcelapos2; i++) {
                    
                    nitematual++;
                    idvendapag = idresumo+'-';
                    idvendapag = idvendapag+nitematual;
                    
                    valorparcPOS2 += (valordivPOS2); 

                    if(i==1){
                        finalparcelacredPOS2 = dtparcelapos2;
                    }else{

                        dtparcpos2 = dtparcelapos2.split('-');
                        
                        var dtpos2 = new Date(dtparcpos2[0], dtparcpos2[1], dtparcpos2[2]);

                        e2 = i - 1;
                        finalparcelaposTeste2 = dtpos2.setMonth( dtpos2.getMonth() + e2 );
                        
                        var dataParcPos2 = new Date(finalparcelaposTeste);
                        var diaParcPos2 = dataParcPos2.getDate(); // 1-31
                        var mesParcPos2 = dataParcPos2.getMonth(); // 0-11 (zero=janeiro)
                        var ano4ParcPos2 = dataParcPos2.getFullYear(); // 4 dígitos
                        diaFormatadoParcPos2 = String(diaParcPos2);
                        
                        mesParcPOSatual2 = (mesParcPos2 + 1);
                        mesParcPOSatualFormatado2 = String(mesParcPOSatual2);
                        diachekPOS2 = String(diaParcPos2);
                        
                        if(mesParcPOSatual2 == 4 || mesParcPOSatual2 == 6 || mesParcPOSatual2 == 9 || mesParcPOSatual2 == 11){
                            if(diaParcPos2 == 31){
                                var diachekPOS2 = String(diaParcPos2 - 1);
                            }
                        }else if(mesParcPOSatual2 == 2){
                            if(diaParcPos2 == 30){
                                var diachekPOS2 = String(diaParcPos2 - 2);
                            }else if (diaParcPos2 == 31){
                                var diachekPOS2 = String(diaParcPos2 - 3);
                            }
                        }

                        finalparcelacredPOS = ano4ParcPos2 + '-' + (mesParcPOSatualFormatado2.padStart(2, '0')) + '-' + diachekPOS2.padStart(2, '0');
                        
                    }
                    
                    if(i==qtdparcelapos2){                      

                        if(valorparcPOS2>vrpos2){

                            valordivCreditoPOS2 =  parseFloat((valorparcPOS2 - vrpos2).toFixed(2));
                            valorresultCreditoPOS2 = valordivPOS2 - valordivCreditoPOS2;                            
                        }
                        if(valorparcPOS2<vrpos2){

                            valordivCreditoPOS2 =  parseFloat((vrpos2 - valorparcPOS2).toFixed(2));
                            valorresultCreditoPOS2 = valordivPOS2 + valordivCreditoPOS2;
                        }
                        if(valorparcPOS2==vrpos2){

                            valorresultCreditoPOS2 = valordivPOS2;
                        }
                    }else{

                        valorresultCreditoPOS2 = valordivPOS2;
                    }

                        var dadosPOS2 = [{
                            	"IDVENDAPAGAMENTO":idvendapag,
                            	"IDVENDA":idresumo,
                            	"NITEM":parseInt(nitematual),
                            	"TPAG":nutipopagpos2,
                            	"DSTIPOPAGAMENTO":dstipopagpos2,
                            	"VALORRECEBIDO":parseFloat(valorresultCreditoPOS2),
                            	"VALORDEDUZIDO":0,
                            	"VALORLIQUIDO":parseFloat(valorresultCreditoPOS2),
                            	"DTPROCESSAMENTO":dtparcelapos,
                            	"DTVENCIMENTO":finalparcelacredPOS2,
                            	"NPARCELAS":parseInt(qtdparcelapos2),
                            	"NOTEF":'POS',
                            	"NOAUTORIZADOR":dstipopagpos2,
                            	"NOCARTAO":'NÃO INFORMADO',
                            	"NUOPERACAO":nuoperacaopos2,
                            	"NSUTEF":nuoperacaopos2,
                            	"NSUAUTORIZADORA":nuoperacaopos2,
                            	"NUAUTORIZACAO":nuatorizacaopos2,
                            	"STCANCELADO":'False',
                            	"IDFUNCIONARIO":IDFuncionarioLogin
                        }];
                        //console.table(dadosPOS2);
                        ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosPOS2)
                        	.then(funcSucessCadastraVendaPagamento)
                        	.catch((e) => { funcError(), console.log(e) });

                }
                
                /////ATUALIZAR O RECEBIMENTO EM POS DA VENDA/////////////////
                VrPOSPagamento2 = parseFloat(vrpos2);
            }

    }else{
                /////ATUALIZAR O RECEBIMENTO EM POS DA VENDA/////////////////
                VrPOSPagamento2 = 0;
    }

    if(vrvoucher>0){
                nitematual++;
                idvendapag = idresumo+'-';
                idvendapag = idvendapag+nitematual;
                //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO
                var dadosVouc = [{
                    	"IDVENDAPAGAMENTO":idvendapag,
                    	"IDVENDA":idresumo,
                    	"NITEM":parseInt(nitematual),
                    	"TPAG":'024',
                    	"DSTIPOPAGAMENTO":'VOUCHER',
                    	"VALORRECEBIDO":parseFloat(vrvoucher),
                    	"VALORDEDUZIDO":0,
                    	"VALORLIQUIDO":parseFloat(vrvoucher),
                    	"DTPROCESSAMENTO":dtparcelapos,
                    	"STCANCELADO":'False',
                    	"IDFUNCIONARIO":IDFuncionarioLogin
                }];
                //console.table(dadosVouc);
                ajaxPost("api/administrativo/altera-venda-pagamento.xsjs", dadosVouc)
                	.then(funcSucessCadastraVendaPagamento)
                	.catch((e) => { funcError(), console.log(e) });

                var dadosUpVoucher = [{
                        "IDRESUMOVENDAWEB":idresumo,
                    	"IDEMPRESADESTINO":parseInt(idempresumo),
                    	"IDCAIXADESTINO":parseInt(idcaixawebresumo),
                		"DTOUTVOUCHER":dataAtualCampo,
                		"IDUSROUTVOUCHER":parseInt(idoperadorresumo),
                		"STATIVO":'False',
                		"NUVOUCHER":nuvoucher
                    	
                }];
                //console.table(dadosUpVoucher);
                    
                //ajaxPut("api/administrativo/atualiza-voucher.xsjs", dadosUpVoucher)
            	//.then(retornoUpdateVoucher)
            	//.catch(funcErrorUpdateVoucher);
                /////ATUALIZAR O RECEBIMENTO EM VOUCHER DA VENDA/////////////////
                VrVoucherPagamento = parseFloat(vrvoucher);

    }else{
                /////ATUALIZAR O RECEBIMENTO EM VOUCHER DA VENDA/////////////////
                VrVoucherPagamento = 0;

    }

    var VRTotalCartao = VrCartaoPagamento + VrCartaoPagamento2 + VrCartaoPagamento3;
    var VRTotalPOS = VrPOSPagamento + VrPOSPagamento2 + VrPIXPagamento;

    var dadosUpVenda = [{
        	"IDVENDA":idresumo,
        	"VRRECDINHEIRO":VrDinheiroPagamento,
    		"VRRECCONVENIO":VrConvenioPagamento,
    		"VRRECCHEQUE":0,
    		"VRRECCARTAO":VRTotalCartao,
    		"VRRECPOS":VRTotalPOS,
    		"VRRECVOUCHER":VrVoucherPagamento
        	
    }];
    //console.table(dadosUpVenda);
        
    ajaxPut("api/administrativo/atualiza-recebimento-venda.xsjs", dadosUpVenda)
	.then(retornoUpdateRecebimentoVenda)
	.catch((e) => { funcError(), console.log(e) });
}

function incluir_cartao() {

  document.getElementById("idbuttoncart1").style.display = 'none';
  document.getElementById("idbuttoncart2").style.display = 'block';
  document.getElementById("cart2").style.display = 'block';
  document.getElementById("cart3").style.display = 'block';

}

function incluir_cartao2() {

  document.getElementById("idbuttoncart3").style.display = 'none';
  document.getElementById("idbuttoncart4").style.display = 'block';
  document.getElementById("cart4").style.display = 'block';
  document.getElementById("cart5").style.display = 'block';

}

function tirar_cartao() {

  document.getElementById("idbuttoncart1").style.display = 'block';
  document.getElementById("idbuttoncart2").style.display = 'none';
  document.getElementById("cart2").style.display = 'none';
  document.getElementById("cart3").style.display = 'none';

}

function tirar_cartao2() {

  document.getElementById("idbuttoncart3").style.display = 'block';
  document.getElementById("idbuttoncart4").style.display = 'none';
  document.getElementById("cart4").style.display = 'none';
  document.getElementById("cart5").style.display = 'none';

}

function incluir_pos() {

  document.getElementById("idbuttonpos1").style.display = 'none';
  document.getElementById("idbuttonpos2").style.display = 'block';
  document.getElementById("pos2").style.display = 'block';
  document.getElementById("pos3").style.display = 'block';

}

function tirar_pos() {

  document.getElementById("idbuttonpos1").style.display = 'block';
  document.getElementById("idbuttonpos2").style.display = 'none';
  document.getElementById("pos2").style.display = 'none';
  document.getElementById("pos3").style.display = 'none';

}

function alerta_novo_recebimento_sucesso() {
    Swal.fire(
      {
          type: "success",
          title: "Recebimento Alterado com Sucesso.",
          showConfirmButton: false,
          timer: 2500
      });
  }

/////////////LISTA FATURAS /////////////////////////////////

function retornoTableListFaturaLoja(faturaLoja) {

	var VrTotalFaturaLoja = 0;
	var contadorFatura = 0;
	
	if(faturaLoja['rows'] > 0 ){
	    
	  	$('#resultadofat').html(
            `<table id="dt-basic-faturaloja" class="table table-bordered table-hover table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th width="5%"></th>
                        <th width="15%">Data Recebimento</th>
                        <th width="10%">Nº Movimento</th>
                        <th width="10%">Caixa</th>
                        <th width="15%">Cod. Autorização</th>
                        <th width="10%">Valor</th>
                        <th >Recebedor</th>
                        <th width="10%">Situação</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                <tfoot class="thead-themed totalFaturas">
                </tfoot>
            </table>`
	    );

    	for (var i = 0; i < faturaLoja.data.length; i++) {
    
    		contadorFatura = contadorFatura + 1;
    
    		IDFatura = faturaLoja.data[i]['IDDETALHEFATURA'];
    		IDCaixaFatura = faturaLoja.data[i]['IDCAIXAWEB'];
    		DescCaixaFatura = faturaLoja.data[i]['DSCAIXA'];
    		DTFatura = faturaLoja.data[i]['DTPROCESSAMENTO'];
    		CodFatura = faturaLoja.data[i]['NUCODAUTORIZACAO'];
    		NoRecebedorFatura = faturaLoja.data[i]['NOFUNCIONARIO'];
    		VrFatura = parseFloat(faturaLoja.data[i]['VRRECEBIDO']);
    		STFatura = faturaLoja.data[i]['STCANCELADO'];
    		IDMovCaixaFatura = faturaLoja.data[i]['IDMOVIMENTOCAIXAWEB'];
    		STMovCaixa = faturaLoja.data[i]['STCONFERIDO'];
    		MotivoCancelado = faturaLoja.data[i]['TXTMOTIVOCANCELAMENTO'];
    		
            if(STFatura=='False'){
                tagFaturaAtivo='<label style="color: blue;">ATIVO</label>';
                VrTotalFaturaLoja = VrTotalFaturaLoja + VrFatura;
            }else{
                tagFaturaAtivo='<label style="color: red;">CANCELADO</label>';
            }
    
    		var tableFaturaLoja = $('#dt-basic-faturaloja').DataTable();
    
    		tableFaturaLoja.row.add([
                `<label style="color: blue;">` + contadorFatura + `</label>`,
                `<label style="color: blue;">` + DTFatura + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + IDMovCaixaFatura + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + IDCaixaFatura + ` - ` + DescCaixaFatura + `</label>`,
                `<label style="color: blue;">` + CodFatura + `</label>`,
                `<label style="color: green;">` + mascaraValor(VrFatura.toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NoRecebedorFatura + `</label>`,
                tagFaturaAtivo,
            ]).draw(false);
    
    	}
    
    	$('.totalFaturas').html(
    		`<tr>
                <th colspan="5" style="text-align: center;">Total Lançamentos</th>
                <th style="text-align: right;">${mascaraValor(VrTotalFaturaLoja.toFixed(2))}</th>
                <th colspan="2"></th>
            </tr>`
    	);	
	}else{
	    
	}
	BuscaDespesas();
}

/////////////LISTA DESPESAS /////////////////////////////////

function retornoTableListDespesaLoja(despesaLoja) {

	var contadorDespesaLoja = 0;
	var TotalDespesaLoja = 0;
	
	if(despesaLoja['rows'] > 0 ){
	    
	  	$('#resultadodesploja').html(
            `<table id="dt-basic-despesaloja" class="table table-bordered table-hover table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th ></th>
                        <th >Data Mov.</th>
                        <th >Descrição</th>
                        <th >Valor</th>
                        <th >Pago a</th>
                        <th >Histórico</th>
                        <th >Nota Fiscal</th>
                        <th >Situação</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                <tfoot class="thead-themed totalDespesaLoja">
                </tfoot>
            </table>`
	    );

    	for (var i = 0; i < despesaLoja.data.length; i++) {
    
    		contadorDespesaLoja = contadorDespesaLoja + 1;
    
    		IDDespesaLoja = despesaLoja.data[i]['IDDESPESASLOJA'];
    		IDCategDespesaLoja = despesaLoja.data[i]['IDCATEGORIARECDESP'];
    		DTMovDespesaLoja = despesaLoja.data[i]['DTDESPESA'];
    		DescDespesaLoja = despesaLoja.data[i]['DSCATEGORIA'];
    		VrDespesaLoja = parseFloat(despesaLoja.data[i]['VRDESPESA']);
    		PagoADespesaLoja = despesaLoja.data[i]['DSPAGOA'];
    		TxtHistoricoDespesaLoja = despesaLoja.data[i]['DSHISTORIO'];
    		NuNotaDespesaLoja = despesaLoja.data[i]['NUNOTAFISCAL'];
    		SituacaoDespesaAtivoLoja = despesaLoja.data[i]['STATIVO'];
    		SituacaoDespesaLoja = despesaLoja.data[i]['STCANCELADO'];
    
            if(SituacaoDespesaLoja=='False'){
                TotalDespesaLoja = TotalDespesaLoja + VrDespesaLoja;
            }
    		
    	    if(SituacaoDespesaLoja=='False'){
                tagDespesaAtivo='<label style="color: blue;">Ativo</label>';
                
            }else{
                tagDespesaAtivo='<label style="color: red;">Cancelado</label>';
                
            }
    
    		var tableDespesaLoja = $('#dt-basic-despesaloja').DataTable();
    
    
    			tableDespesaLoja.row.add([
                    `<label style="color: blue;">` + contadorDespesaLoja + `</label>`,
                    `<label style="color: blue;">` + DTMovDespesaLoja + `</label>`,
                    `<label style="color: blue;">` + DescDespesaLoja + `</label>`,
                    `<label style="color: blue;">` + mascaraValor(VrDespesaLoja.toFixed(2)) + `</label>`,
                    `<label style="color: blue;">` + PagoADespesaLoja + `</label>`,
                    `<label style="color: blue;">` + TxtHistoricoDespesaLoja + `</label>`,
                    `<label style="color: blue;">` + NuNotaDespesaLoja + `</label>`,
                    tagDespesaAtivo,
                ]).draw(false);
    	}
    
    	$('.totalDespesaLoja').html(
    		`<tr>
                <th colspan="3" style="text-align: center;">Total Lançamentos</th>
                <th style="text-align: right;">${mascaraValor(TotalDespesaLoja.toFixed(2))}</th>
                <th colspan="4"></th>
            </tr>`
    	);	
	}else{
	    
	}
	BuscaVoucher();

}

/////////////LISTA VOUCHERS /////////////////////////////////

function retornoTableListVoucherLoja(voucherLoja) {

	var contadorVoucherLoja = 0;
	var TotalVoucherLoja = 0;
	
	if(voucherLoja['rows'] > 0 ){
	    
	  	$('#resultadovoucher').html(
            `<table id="dt-basic-voucher-loja" class="table table-bordered table-hover table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th ></th>
                        <th >Caixa</th>
                        <th >Nº Voucher</th>
                        <th >Data</th>
                        <th >Valor</th>
                        <th >Loja Recebido</th>
                        <th >Caixa Recebido</th>
                        <th >Data Recebido</th>
                        <th >Situação</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                <tfoot class="thead-themed totalVoucherLoja">
                </tfoot>
            </table>`
	    );
    
    	for (var i = 0; i < voucherLoja.data.length; i++) {
    
    		contadorVoucherLoja = contadorVoucherLoja + 1;
    
    		IDVoucherLoja = voucherLoja.data[i]['IDVOUCHER'];
    		DTInVoucherLoja = voucherLoja.data[i]['DTINVOUCHER'];
    		DTOutVoucherLoja = voucherLoja.data[i]['DTOUTVOUCHER'];
    		DSCaixaOrigem = voucherLoja.data[i]['DSCAIXAORIGEM'];
    		DSCaixaDestino = voucherLoja.data[i]['DSCAIXADESTINO'];
    		NuVoucherLoja = voucherLoja.data[i]['NUVOUCHER'];
    		VRVoucherLoja = parseFloat(voucherLoja.data[i]['VRVOUCHER']);
    		SituacaoVoucherAtivoLoja = voucherLoja.data[i]['STATIVO'];
    		SituacaoVoucherCanceladoLoja = voucherLoja.data[i]['STCANCELADO'];
    		NoEmpresaVoucher = voucherLoja.data[i]['NOFANTASIA'];
    
            if(SituacaoVoucherCanceladoLoja=='False'){
                TotalVoucherLoja = TotalVoucherLoja + VRVoucherLoja;
            }
    		
    	    if(SituacaoVoucherCanceladoLoja=='False'){
                tagVoucherAtivo='<label style="color: blue;">Ativo</label>';
                
            }else{
                tagVoucherAtivo='<label style="color: red;">Cancelado</label>';
                
            }
            
            var tableVoucherLoja = $('#dt-basic-voucher-loja').DataTable();
        
    		tableVoucherLoja.row.add([
                `<label style="color: blue;">` + contadorVoucherLoja + `</label>`,
                `<label style="color: blue;">` + DSCaixaOrigem + `</label>`,
                `<label style="color: blue;">` + NuVoucherLoja + `</label>`,
                `<label style="color: blue;">` + DTInVoucherLoja + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VRVoucherLoja.toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + NoEmpresaVoucher + `</label>`,
                `<label style="color: blue;">` + DSCaixaDestino + `</label>`,
                `<label style="color: blue;">` + DTOutVoucherLoja + `</label>`,
                tagVoucherAtivo,
            ]).draw(false);
    	}
    
    	$('.totalVoucherLoja').html(
    		`<tr>
                <th colspan="4" style="text-align: center;">Total Lançamentos</th>
                <th style="text-align: right;">${mascaraValor(TotalVoucherLoja.toFixed(2))}</th>
                <th colspan="4"></th>
            </tr>`
    	);	
	}else{
	    
	}
	BuscaVendaConvenio();

}

/////////////Lista Vendas Convenio /////////////////////////////////

function retornoTableListVendasConvenio(respostaListaVendaConvenio) {

	var VendaConvenioValor = 0;
	var TotalVendaBrutaConvenio = 0;
	var TotalVendaDescontoConvenio = 0;
	var TotalVendaLiqConvenio = 0;
	var contadorConvenio = 0;

	if (respostaListaVendaConvenio.data.length != 0) { 
	    
        $('#resultadovendasconv').html(
          `<table id="dt-basic-conveniovendas" class="table table-bordered table-hover table-striped w-100 .dt-responsive">
                <thead class="bg-primary-600">
                    <tr>
                        <th></th>
                        <th>Caixa</th>
                        <th>Nº Venda</th>
                        <th>NFCe</th>
                        <th>Abertura</th>
                        <th>Operador</th>
                        <th>Conveniado</th>
                        <th>Convênio</th>
                        <th>Valor Bruto</th>
                        <th>Desconto</th>
                        <th>Valor Liq</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                <tfoot id="totalConvenioVenda" class="thead-themed">
                </tfoot>
            </table>`
	    );
	    
	    for (var i = 0; i < respostaListaVendaConvenio.data.length; i++) {
            contadorConvenio++;
            
    		NumCaixaConvenio = respostaListaVendaConvenio.data[i]['IDCAIXAWEB'];
    		DescCaixaConvenio = respostaListaVendaConvenio.data[i]['DSCAIXA'];
    		NuVendaConvenio = respostaListaVendaConvenio.data[i]['IDVENDA'];
    		NuNFCeConvenio = respostaListaVendaConvenio.data[i]['NFE_INFNFE_IDE_NNF'];
    		DTAberturaVendaConvenio = respostaListaVendaConvenio.data[i]['DTHORAFECHAMENTO'];
    		NomeOperadorVendaConvenio = respostaListaVendaConvenio.data[i]['NOFUNCIONARIO'];
    		NomeConeniadoVendaConvenio = respostaListaVendaConvenio.data[i]['NOCONVENIADO'];
    		DsVendaConvenio = respostaListaVendaConvenio.data[i]['DSCONVENIO'];
    
    		VendaValorBrutoConvenio = parseFloat(respostaListaVendaConvenio.data[i]['VRBRUTOCONVENIADO']);
    		VendaValorDescontoConvenio = parseFloat(respostaListaVendaConvenio.data[i]['VRDESCONTOCONVENIADO']);
    		VendaValorLiqConvenio = parseFloat(respostaListaVendaConvenio.data[i]['VRLIQUIDOCONVENIADO']);
    
    		TotalVendaBrutaConvenio = TotalVendaBrutaConvenio + VendaValorBrutoConvenio;
    		TotalVendaDescontoConvenio = TotalVendaDescontoConvenio + VendaValorDescontoConvenio;
    		TotalVendaLiqConvenio = TotalVendaLiqConvenio + VendaValorLiqConvenio;
    		
            var tableConvenioVendas = $('#dt-basic-conveniovendas').DataTable();
            
    		tableConvenioVendas.row.add([
                `<label style="color: blue; font-size: 11px;">` + contadorConvenio + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NumCaixaConvenio + ` - ` + DescCaixa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuVendaConvenio + `</label>`,
                `<label style="color: blue;">` + NuNFCeConvenio + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + DTAberturaVendaConvenio + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NomeOperadorVendaConvenio + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NomeConeniadoVendaConvenio + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + DsVendaConvenio + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaValorBrutoConvenio.toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaValorDescontoConvenio.toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaValorLiqConvenio.toFixed(2)) + `</label>`,
            ]).draw(false);

	    }
	    
    	$('#totalConvenioVenda').html(
    		`<tr>
                <th colspan="8" style="text-align: center;">Total Vendas Convenio</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaBrutaConvenio.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaDescontoConvenio.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaLiqConvenio.toFixed(2))}</th>
            </tr>`
    	);
    	
    } else {
    }
    BuscaVendaDescontoFunc();
}

	
/////////////Lista Vendas Convenio Desconto/////////////////////////////////

function retornoTableListVendasConvenioDesconto(respostaListaVendaConvenioDesconto) {

	var VendaConvenioDescontoValor = 0;
	var TotalVendaBrutaConvenioDesconto = 0;
	var TotalVendaDescontoConvenioDesconto = 0;
	var TotalVendaLiqConvenioDesconto = 0;
	var contadorConvenioDesconto = 0;
    //console.log(respostaListaVendaConvenioDesconto.data.length);
	//tableVendasConvenioDesconto.rows().remove().draw();
	for (var i = 0; i < respostaListaVendaConvenioDesconto.data.length; i++) {

		contadorConvenioDesconto = contadorConvenioDesconto + 1;

		NumCaixaConvenioDesconto = respostaListaVendaConvenioDesconto.data[i]['IDCAIXAWEB'];
		DescCaixaConvenioDesconto = respostaListaVendaConvenioDesconto.data[i]['DSCAIXA'];
		NuVendaConvenioDesconto = respostaListaVendaConvenioDesconto.data[i]['IDVENDA'];
		NuNFCeConvenioDesconto = respostaListaVendaConvenioDesconto.data[i]['NFE_INFNFE_IDE_NNF'];
		DTAberturaVendaConvenioDesconto = respostaListaVendaConvenioDesconto.data[i]['DTHORAFECHAMENTO'];
		NomeOperadorVendaConvenioDesconto = respostaListaVendaConvenioDesconto.data[i]['NOFUNCIONARIO'];
		NomeConeniadoVendaConvenioDesconto = respostaListaVendaConvenioDesconto.data[i]['NOCONVENIADO'];
		CPFVendaConvenioDesconto = respostaListaVendaConvenioDesconto.data[i]['CPFCONVENIADO'];

		VendaValorBrutoConvenioDesconto = parseFloat(respostaListaVendaConvenioDesconto.data[i]['VRBRUTOPAGO']);
		VendaValorDescontoConvenioDesconto = parseFloat(respostaListaVendaConvenioDesconto.data[i]['VRDESPAGO']);
		VendaValorLiqConvenioDesconto = parseFloat(respostaListaVendaConvenioDesconto.data[i]['VRLIQPAGO']);

		TotalVendaBrutaConvenioDesconto = TotalVendaBrutaConvenioDesconto + VendaValorBrutoConvenioDesconto;
		TotalVendaDescontoConvenioDesconto = TotalVendaDescontoConvenioDesconto + VendaValorDescontoConvenioDesconto;
		TotalVendaLiqConvenioDesconto = TotalVendaLiqConvenioDesconto + VendaValorLiqConvenioDesconto;
    
        var tableVendasConvenioDesconto = $('#dt-basic-venda-convenio-desconto').DataTable();
        
		tableVendasConvenioDesconto.row.add([
            `<label style="color: blue; font-size: 11px;">` + contadorConvenioDesconto + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NumCaixaConvenioDesconto + ` - ` + DescCaixa + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NuVendaConvenioDesconto + `</label>`,
            `<label style="color: blue;">` + NuNFCeConvenioDesconto + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + DTAberturaVendaConvenioDesconto + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NomeOperadorVendaConvenioDesconto + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NomeConeniadoVendaConvenioDesconto + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + CPFVendaConvenioDesconto + `</label>`,
            `<label style="color: blue;">` + mascaraValor(VendaValorBrutoConvenioDesconto.toFixed(2)) + `</label>`,
            `<label style="color: blue;">` + mascaraValor(VendaValorDescontoConvenioDesconto.toFixed(2)) + `</label>`,
            `<label style="color: blue;">` + mascaraValor(VendaValorLiqConvenioDesconto.toFixed(2)) + `</label>`,
            `<div class="btn-group btn-group-xs">
                <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVendaConvenioDesconto + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
            </div>`,
        ]).draw(false);

	}

	$('.totalConvenioDesconto').html(
		`<tr>
            <th colspan="8" style="text-align: center;">Total Vendas Convenio Desconto</th>
            <th style="text-align: right;">${mascaraValor(TotalVendaBrutaConvenioDesconto.toFixed(2))}</th>
            <th style="text-align: right;">${mascaraValor(TotalVendaDescontoConvenioDesconto.toFixed(2))}</th>
            <th style="text-align: right;">${mascaraValor(TotalVendaLiqConvenioDesconto.toFixed(2))}</th>
            <th></th>
        </tr>`
	);
}


/////////////////CANCELAMENTO VENDA/////////////////////////////////////

function cancelar_vendas(){
    let idVenda = $('#IDResumoVendaWeb').val();
    let txtMotivoCancelamento = $('#TXTMotivoCancelamentoTexto').val();
    let IdUsuarioCancelamento = IDFuncionarioLogin;

    let dados = [
        {
            "IDVENDA": idVenda,
            "IDUSUARIOCANCELAMENTO": IdUsuarioCancelamento,
            "TXTMOTIVOCANCELAMENTO": txtMotivoCancelamento
        }
    ];

    let textdados = JSON.stringify(dados);
    let textoFuncao = 'ADMINISTRATIVO/CANCELAMENTO DE VENDAS';

    let dadosLogCancelaVenda = [
        {
            "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
            "PATHFUNCAO": textoFuncao,
            "DADOS": textdados,
            "IP": ipCliente
        }
    ];
    
    animationLoadingStart('Cancelando Venda...');
    
    ajaxPut("api/venda/venda-cancelamento.xsjs", dados)
    	.then((resp)=>{
            if (resp['type'] == 'success'){
                $('#cancelVenda').modal('hide');
               // animationLoadingStart('Gravando Log...');
                criarLogVendaCancelada(dadosLogCancelaVenda);
            } else {
                Swal.close();
                animationLoadingStop();
                msgWarning(resp.msg)
            }
        })
    	.catch((erro)=>{
            animationLoadingStop();
            msgError('Erro ao cancelar a venda, recarregue e tente novamente!')
            console.log(erro);
        });
}

function criarLogVendaCancelada(dadosLog){
    ajaxPost("api/log-web.xsjs", dadosLog)
        .then(()=>{
            animationLoadingStop();
            msgSuccess('Venda Cancelada com sucesso!', ' ')
            .then(()=>{
                pesq_mov_caixas()
            })
        })
        .catch((erro) => {
            Swal.close();
            animationLoadingStop();
            msgError('Erro ao gerar o log!')
            console.log(erro);
        });
}

function funcSucessVendaCancelamento(resposta) {

    alerta_cancelamento_venda_sucesso();
    pesq_mov_caixas();
    $("#cancelVenda").modal('hide');
}

////////// MENSAGENS DE ALERTAS ///////////////////////////////

function alerta_atualizado_sucesso() {
  Swal.fire(
    {
        type: "success",
        title: "Dados Atualizado com Sucesso",
        showConfirmButton: false,
        timer: 2000
    });
} 

function alerta_cadastrado_sucesso() {
  Swal.fire(
    {
        type: "success",
        title: "Dados Cadastrados com Sucesso",
        showConfirmButton: false,
        timer: 2000
    });
}

function funcSucessUpdateVendaCancelamento() {
  Swal.fire(
    {
        type: "success",
        title: "Venda Cancelada com Sucesso.",
        showConfirmButton: false,
        timer: 2500
    });
}

function alerta_ativa_Venda() {
  Swal.fire(
    {
        type: "success",
        title: "Venda Ativada com Sucesso.",
        showConfirmButton: false,
        timer: 2500
    }); 
}
 
function alerta_valor_menor_venda() {
  Swal.fire(
    {
        type: "warning",
        title: "A soma dos valores é menor que o valor da Venda. ",
        showConfirmButton: false,
        timer: 2500
    });
}

function alerta_cancelamento_venda_sucesso() {
    Swal.fire(
      {
          type: "success",
          title: "Venda Cancelada com Sucesso. ",
          showConfirmButton: false,
          timer: 2500
      });
      
  }
 
 function alerta_conferido_sucesso() {
    Swal.fire(
      {
          type: "success",
          title: "Caixa Atualizado com Sucesso. ", 
          showConfirmButton: false,
          timer: 2500
      });
      
  }
  
 //================ MENU LISTA VENDA MARCAS ==============================================
function ListaVendasMarca(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        );
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);
        
        	$("#idmarca").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas das Marcas - <span class='fw-300'></span>`);
			
            ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch((e) => { funcError(), console.log(e) });
      } 
    };
    xmlhttp.open("GET", "administrativo_action_listvendasmarca.html", true);
    xmlhttp.send();
}

function pesq_vendas_marcas(){
    var IDMarcaPesqVenda = $("#idmarca").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        newDataTable();
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/financeiro/venda-marca-periodo.xsjs?pageSize=1000&idMarca=' + IDMarcaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasMarca)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqvendasmarca.html", true);
    xmlhttp.send();
} 

function retornoListaVendasMarca(respostaListaVendasMarcas) {

        totalVrRecebidoDinheiro = 0;
        totalVrRecebidoCartao = 0;
        totalVrRecebidoPos = 0;
        totalVrRecebidoConvenio = 0;
        totalVrRecebidoVoucher = 0;
        totalVrRecebidoFatura = 0;
        totalVrDespesaTotal = 0;
        totalVrDisponivel = 0;
        totalVrQuebraCaixaMarca = 0;
        totalVrBrutoMarca = 0;
        totalVrBrutoVoucherMarca = 0;
        totalQtdVenda = 0;
        totalVrPix = 0;
        
    if(respostaListaVendasMarcas.data.length != 0){
    	for (var i = 0; i < respostaListaVendasMarcas.data.length; i++) {

    	    idEmpresa = respostaListaVendasMarcas.data[i]['IDEMPRESA'];
            noFantasia = respostaListaVendasMarcas.data[i]['NOFANTASIA'];
            vrRecebidoDinheiro = respostaListaVendasMarcas.data[i]['VRDINHEIRO'];
            vrRecebidoCartao = respostaListaVendasMarcas.data[i]['VRCARTAO'];
            vrRecebidoPos = respostaListaVendasMarcas.data[i]['VRPOS'];
            vrRecebidoPix = respostaListaVendasMarcas.data[i]['VRPIX'];
            vrRecebidoConvenio = respostaListaVendasMarcas.data[i]['CONVENIO'];
            vrRecebidoVoucher = respostaListaVendasMarcas.data[i]['VOUCHER'];
            vrRecebidoFatura = respostaListaVendasMarcas.data[i]['VRFATURA'];
            vrDespesa = respostaListaVendasMarcas.data[i]['VRDESPESA'];
            vrAdiantamentoSalario = respostaListaVendasMarcas.data[i]['VRADIANTAMENTOSALARIO'];
            vrFisicoDinMarca = respostaListaVendasMarcas.data[i]['VRFISICODINHEIRO'];
            vrRecebidoDinMarca = respostaListaVendasMarcas.data[i]['VRRECDINHEIRO'];
            qtdVendas = respostaListaVendasMarcas.data[i]['QTDVENDA'];
             vrTotalPago = respostaListaVendasMarcas.data[i]['VRTOTALPAGO'];

            vrDespesaTotal = parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoCartao) + parseFloat(vrRecebidoPos) + parseFloat(vrRecebidoConvenio) + parseFloat(vrRecebidoPix);
            vrDisponivelBrutoVoucher = parseFloat(vrTotalPago) -  parseFloat(vrRecebidoVoucher);
            
            vrQuebraCaixaMarca = parseFloat(vrRecebidoDinMarca) - parseFloat(vrFisicoDinMarca);
            
            vrTotalQuebraMarca = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);
            vrTotalQuebraVoucherMarca = parseFloat(vrDisponivelBrutoVoucher) - parseFloat(vrDespesaTotal);
            vrDisponivel = parseFloat(vrDisponivelBrutoVoucher);
            
            if(vrQuebraCaixaMarca>0){
                tagquebracaixaMarca = '<td style="text-align: right;"><label style="color: blue;"> + ' + mascaraValor(parseFloat(vrQuebraCaixaMarca).toFixed(2)) + '</label></td>';
            }else{
                tagquebracaixaMarca = '<td style="text-align: right;"><label style="color: red;"> - ' + mascaraValor(parseFloat(vrQuebraCaixaMarca).toFixed(2)) + '</label></td>';
            }

            totalVrRecebidoDinheiro = parseFloat(totalVrRecebidoDinheiro) + parseFloat(vrRecebidoDinheiro);
            totalVrRecebidoCartao = parseFloat(totalVrRecebidoCartao) + parseFloat(vrRecebidoCartao);
            totalVrRecebidoPos = parseFloat(totalVrRecebidoPos) + parseFloat(vrRecebidoPos);
            totalVrRecebidoConvenio = parseFloat(totalVrRecebidoConvenio) + parseFloat(vrRecebidoConvenio);
            totalVrRecebidoVoucher = parseFloat(totalVrRecebidoVoucher) + parseFloat(vrRecebidoVoucher);
            totalVrRecebidoFatura = parseFloat(totalVrRecebidoFatura) + parseFloat(vrRecebidoFatura);
            totalVrDespesaTotal = parseFloat(totalVrDespesaTotal) + parseFloat(vrDespesaTotal);
            totalVrBrutoMarca = parseFloat(totalVrBrutoMarca) + parseFloat(vrTotalQuebraMarca);
            totalVrBrutoVoucherMarca = parseFloat(totalVrBrutoVoucherMarca) + parseFloat(vrTotalQuebraVoucherMarca);  
            totalVrQuebraCaixaMarca = parseFloat(totalVrQuebraCaixaMarca) + parseFloat(vrQuebraCaixaMarca);
            totalVrDisponivel = parseFloat(totalVrDisponivel) + parseFloat(vrDisponivel);
            totalQtdVenda = parseFloat(totalQtdVenda) + parseFloat(qtdVendas);
            
            VrTicketM = (parseFloat(vrDisponivel)/parseFloat(qtdVendas));
            TotalTicketM = (parseFloat(totalVrDisponivel)/parseFloat(totalQtdVenda));
            
			$('#resultadoVendaMarcaPeriodo').append(
				`<tr>
                    <td><label style="color: blue; font-size: 11px;">` + idEmpresa +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + noFantasia +	`</label></td>
                    <td style="text-align: right;"><label style="color: green;">` + (parseFloat(qtdVendas)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrDisponivelBrutoVoucher).toFixed(2))+	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(VrTicketM).toFixed(2)) +	`</label></td>
                </tr>`
			);
			
            $('#totalResultadoVendaMarcaPeriodo').html(
        		`<tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right;">` + (parseFloat(totalQtdVenda)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrDisponivel).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(TotalTicketM).toFixed(2)) + `</th>
                </tr>`
        	);
    	}

    }

}

function retornoListaGrupoEmpresasSelect(respostaGrupoEmpresas) {

        $("#idgrupo").empty();
        $('#idgrupo').append(
	        `<option value="0">TODOS</option>`
	    );
	    
	for (var i = 0; i < respostaGrupoEmpresas.data.length; i++) {

		IDGrupo = respostaGrupoEmpresas.data[i]['IDGRUPOEMPRESARIAL'];
		DSGrupo = respostaGrupoEmpresas.data[i]['GRUPOEMPRESARIAL'];

			$('#idmarca').append(
				`<option value="` + IDGrupo + `"> ` + DSGrupo + `</option>`
			);
			$('#idgrupo').append(
				`<option value="` + IDGrupo + `"> ` + DSGrupo + `</option>`
			);
	}
}


//================ VENDAS VENDEDORES DIGITAIS ==============================================

function ListaVendasDigitaisResumidoMarca(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        );
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);
        
        	$("#idgrupo").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas Digitais das Marcas - <span class='fw-300'></span>`);
			
            ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch((e) => { funcError(), console.log(e) });
      }
    };
    xmlhttp.open("GET", "financeiro_action_listvendasdigitalmarca.html", true);
    xmlhttp.send();
}

function pesq_vendas_digitaisResumidoMarca(numPage){
    
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/financeiro/venda-digital-marca.xsjs?pageSize=500&page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasDigitalResumidoMarca)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqvendasdigital.html", true);
    xmlhttp.send();
} 

function retornoListaVendasDigitalResumidoMarca(respostaListaVendasDigitalMarca) {

    var numPageAtual = parseInt(respostaListaVendasDigitalMarca.page);
    if(numPageAtual === 1){
        totalQuantidade = 0;
        totalVrliquido = 0;
        
        $('#resultado').html(
                    `<table id="" class="table table-bordered table-hover table-responsive-lg table-striped w-100 vendaDigitalperiodomarca">
                        <thead class="bg-primary-600">
                            <tr>
                                <th style="width: 35%">Nome Loja</th>
                                <th style="width: 15%">QTD Produtos</th>
                                <th>Valor Vendido</th>
                            </tr>
                        </thead>
                        <tbody id="resultadoVendaDigitalPeriodoMarca">
                        </tbody>
                        <tfoot id="totalResultadoVendaDigitalPeriodoMarca"class="thead-themed">
                        </tfoot>
                    </table>`
	            );
	            
        var tableVendaDigitalPeriodosMarca = $('.vendaDigitalperiodomarca').DataTable({
            "columnDefs": [
              { className: "text-center", "targets": [1,1] },
              { className: "text-right", "targets": [2,2] }
            ]
        });
        
        tableVendaDigitalPeriodosMarca.rows().remove().draw();
        $('#totalResultadoVendaDigitalPeriodoMarca').html('');
        
    }

    if(respostaListaVendasDigitalMarca.data.length!= 0){
    	for (var i = 0; i < respostaListaVendasDigitalMarca.data.length; i++) {

    	    nomeFantasia = respostaListaVendasDigitalMarca.data[i]['NOFANTASIA'];
            numEmpresa = respostaListaVendasDigitalMarca.data[i]['IDEMPRESA'];
            quantidade = respostaListaVendasDigitalMarca.data[i]['QTDTOTAL'];
            valorTotalLiquido = respostaListaVendasDigitalMarca.data[i]['VRTOTALVENDA'];

            if(quantidade > 0){
        		tableVendaDigitalPeriodosMarca.row.add([
                    `<label style="color: blue; font-size: 11px;">` + nomeFantasia + `</label>`,
                    `<label style="color: blue;">` + quantidade + `</label>`,
                    `<label style="color: blue;">` + mascaraValor(parseFloat(valorTotalLiquido).toFixed(2)) + `</label>`,
                ]).draw(false);
                
                totalQuantidade = parseFloat(totalQuantidade) + parseFloat(quantidade);
                totalVrliquido = parseFloat(totalVrliquido) + parseFloat(valorTotalLiquido);
            }
    	}
        
        chamarProximaListaVendaDigitalMarca(numPageAtual + 1);
        
    }

}

function chamarProximaListaVendaDigitalMarca(numPage){

    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    ajaxGet('api/financeiro/venda-digital-marca.xsjs?pageSize=500&page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasDigitalResumidoMarca)
        	.catch((e) => { funcError(), console.log(e) });
}

//================ VENDAS VENDEDORES ==============================================
 
function ListaVendasVendedor(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        ); 
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);
        
        	$("#idmarca").select2();
        	$("#idloja").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas por Vendedor - <span class='fw-300'></span>`);

        	ajaxGet('api/informatica/grupoempresas.xsjs')
                        .then(retornoListaGrupoEmpresasSelect)
                        .catch((e) => { funcError(), console.log(e) });

      }
    };
    xmlhttp.open("GET", "administrativo_action_listvendasvendedor.html", true);
    xmlhttp.send();
}

function pesq_vendas_vendedor(){
    
    var idgrupo = $("#idmarca").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });
    
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
        
        ajaxGet('api/administrativo/venda-vendedor.xsjs?idGrupo=' + idgrupo + '&idEmpresa=' + idempresa + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasVendedorData)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqvendasvendedor.html", true);
    xmlhttp.send();
} 

function retornoListaVendasVendedorData(retornoListaVendasVendedor) {

	var QTDProduto = 0;
	var VrVendido = 0;
	var VrComissao = 0;
	var VrVoucher = 0;
	var TotalVendaVendedor = 0;
	var TotalVoucherVendedor = 0;
	var VrVendidoVendedor = 0;
	var TotalLiqVendidoVendedor = 0;
	var ContadorVendedor = 0;
    
     var PercComissao = $("#idperccomissao").val();
     
    $('#resultadoListVendedor').html('');
    
    $('#dt-buttons-vendas-vendedor').DataTable().destroy();

	for (var i = 0; i < retornoListaVendasVendedor.data.length; i++) {

        ContadorVendedor ++;
		NumMatricula = retornoListaVendasVendedor.data[i]['vendedor']['VENDEDOR_MATRICULA'];
		NomeVendedor = retornoListaVendasVendedor.data[i]['vendedor']['VENDEDOR_NOME'];
		NomeEmpresa = retornoListaVendasVendedor.data[i]['vendedor']['NOFANTASIA'];
		CPFVendedor = retornoListaVendasVendedor.data[i]['vendedor']['VENDEDOR_CPF'];

		QTDProduto = parseFloat(retornoListaVendasVendedor.data[i]['totalVendido'][0]['QTDVENDIDOVENDEDOR']);
		VrVendido = parseFloat(retornoListaVendasVendedor.data[i]['totalVendido'][0]['TOTALVENDIDOVENDEDOR']);
		
		VrVoucher = parseFloat(retornoListaVendasVendedor.data[i]['Vouchers']);
		
        TotalVendaVendedor = TotalVendaVendedor + VrVendido;
        TotalVoucherVendedor = TotalVoucherVendedor + VrVoucher;
        
        VrVendidoVendedor = VrVendido - VrVoucher;
        if(PercComissao == 0){
            VrComissao = 0;
        }else{
            VrComissao = VrVendidoVendedor * (PercComissao/100);
        }
        
        
        TotalLiqVendidoVendedor = TotalVendaVendedor - TotalVoucherVendedor;
		
		$('#dt-buttons-vendas-vendedor').find('tbody').append(`<tr>
                <td><label style="color: blue; font-size: 11px;">` + ContadorVendedor +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NomeEmpresa +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NumMatricula +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + CPFVendedor +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NomeVendedor +	`</label></td>
                <td style="text-align: center;"><label style="color: blue;">` + QTDProduto + `</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVendido.toFixed(2)) +	`</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVoucher.toFixed(2)) +	`</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVendidoVendedor.toFixed(2)) +	`</label></td>
                <td style="text-align: right;"><label style="color: green;">` + mascaraValor(VrComissao.toFixed(2)) +	`</label></td>
            </tr>`);
		/*$('#resultadoListVendedor').append(
			`<tr>
                <td><label style="color: blue; font-size: 11px;">` + ContadorVendedor +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NomeEmpresa +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NumMatricula +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NomeVendedor +	`</label></td>
                <td style="text-align: center;"><label style="color: blue;">` + QTDProduto + `</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVendido.toFixed(2)) +	`</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVoucher.toFixed(2)) +	`</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVendidoVendedor.toFixed(2)) +	`</label></td>
            </tr>`
		);*/
	}
	$('#dt-buttons-vendas-vendedor').DataTable({
	    responsive: true,
        lengthChange: false,
	    dom:
            "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            order: ([ 1, 'desc' ]),
        buttons: [
            {
                extend:    'colvis',
                text:      'Mostrar Colunas',
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
                className: 'btn-outline-success btn-sm mr-1',
                exportOptions: {
                  columns: ':visible',
                  format: {
                      body: function(data, row, column, node) {
                          data = $('<p>' + data + '</p>').text();
                          return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                      }
                  }
                }
            },
            {
                extend: 'print',
                text: 'Imprimir',
                titleAttr: 'Imprimir Tabela',
                className: 'btn-outline-primary btn-sm'
            }
        ]}).draw();
		
		$('.totalVendedores').html(
			`<tr>
                <th colspan="6" style="text-align: center;">Total Vendas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVoucherVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalLiqVendidoVendedor.toFixed(2))}</th>
                <th colspan="1" style="text-align: center;"></th>
            </tr>`
		);
}


//================ VENDAS CONVENIO ==============================================
function ListaVendasConvenio(){
    let startCarregamento = setTimeout(()=>animacaoCarregamento(), delayMaximo);
    
    let CarregarPagina = new Promise((resolve, reject) => {
        $.get("administrativo_action_listvendasconvenio.html", function (response) {
            $("#js-page-content").html(response);
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);
            $("#idmarca").select2();
        	$("#idloja").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas Convênio - <span class='fw-300'></span>`);
			
    		$('#idmarca').on('change', function (e) {
                let marca = $('#idmarca').val();
                
                let startCarregamento = setTimeout(()=>animacaoCarregamento(), delayMaximo);
                
            	$('#idloja').empty();
            	
            	ajaxGet(`api/empresa.xsjs?idSubGrupoEmpresa=${marca}`)
                    .then((resp)=>{
                        retornoListaEmpresasSelect(resp, startCarregamento)
                        Swal.close();
                    })
                    .catch((e) => { msgError('Erro ao carregar a Lisata de Empresas, Tente novamente!'), console.log(e) });
        	});
			
    	    resolve();
        })
        .fail(() => reject('Erro ao carregar a Página, Tente novamente!'));
    });
        
    let CarregarMarcas = new Promise((resolve, reject) => {
        ajaxGet('api/informatica/grupoempresas.xsjs')
            .then((resp)=>{
                retornoListaGrupoEmpresasSelect(resp)
                resolve();
            })
            .catch(() => reject('Erro ao carregar Lista de Marcas, Tente novamente!'));
    });
    			
    let CarregarEmpresas = new Promise((resolve, reject) => {
        ajaxGet('api/informatica/empresa.xsjs')
    		.then((resp)=>{
                        retornoListaEmpresasSelect(resp)
                        resolve();
            })
            .catch(() => reject('Erro ao carregar a Lisata de Empresas, Tente novamente!'));
    });
	   
    Promise.all([CarregarPagina, CarregarMarcas, CarregarEmpresas])
        .then(() =>{
            clearTimeout(startCarregamento);
            Swal.close();
        })
        .catch(()=>{
            setTimeout(()=>msgError(error), delayMaximo)
            Swal.close();
        })
    ;
}

function pesq_vendas_convenio(numPage, descFunc){
    var idgrupo = $("#idmarca").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    dataRetorno=[];
    contador = 0;
    
    ValorDinheiroConv = 0;
    ValorCartaoConv = 0;
    ValorPOSConv = 0;
    ValorChequeConv = 0;
    ValorVoucherConv = 0;
    ValorConvenioConv = 0;
    TotalDinheiroConv = 0;
    TotalCartaoConv = 0;
    TotalPOSConv = 0;
    TotalVoucherConv = 0;
    TotalConvenioConv = 0;
    
    TotalBrutoConvenio = 0;
    TotalDescConvenio = 0;
    TotalLiqConvenio = 0;
    
    TotalBrutoVendaNF = 0;
    TotalDescVendaNF = 0;
    TotalLiqVendaNF = 0;
    
    let startCarregamento = setTimeout(()=>animacaoCarregamento(), delayMaximo);
    
    let CarregarTable = new Promise((resolve, reject) => {
        $.get("administrativo_action_pesqvendasconvenio.html", function (response) {
            $("resultado").html(response);
            
            $('.dataAtual').text(dataAtual);
        }).fail((e) => { reject('Erro ao Carregar as Vendas, Tente novamente!'), console.log(e) })
    })
    
    let CarregarVendas = new Promise((resolve, reject) => {
        ajaxGet('api/administrativo/venda-convenio.xsjs?page=' + numPage + '&descFuncionario='+ descFunc + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        	.then((resp)=>{
                retornoListaVendasConvenio(resp, descFunc, startCarregamento);
            })
        	.catch((e) => { reject('Erro ao Carregar as Vendas, Tente novamente!'), console.log(e) });
    })
    
    Promise.all([CarregarTable, CarregarVendas])
    .then()
    .catch((error)=>{
        setTimeout(()=>msgError(error), delayMaximo)
    }); 
} 

function chamarProximaListaVendasConvenio(numPage, descFunc, startCarregamento){
    
    var idgrupo = $("#idmarca").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

    ajaxGet('api/administrativo/venda-convenio.xsjs?page=' + numPage + '&descFuncionario='+ descFunc + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        .then((resp)=>{
            retornoListaVendasConvenio(resp, descFunc, startCarregamento)
        })
        .catch((e) => { 
            setTimeout(()=>msgError(error), delayMaximo)
             console.log(e) 
        });
        	
}

/*function retornoListaVendasConvenio(respostaListaVendaConvenio) {

	
	var TotalLiqConvenio = 0;

	for (var i = 0; i < respostaListaVendaConvenio.data.length; i++) {
        var registro = respostaListaVendaConvenio.data[i];
		
        Empresa = respostaListaVendaConvenio.data[i]['NOFANTASIA'];
        NumVenda = respostaListaVendaConvenio.data[i]['NumeroVenda'];
        Data = respostaListaVendaConvenio.data[i]['DTLANCAMENTO'];
        CPF = respostaListaVendaConvenio.data[i]['NUCPF'];
        Funcionario = respostaListaVendaConvenio.data[i]['NOFUNCIONARIO'];
        ValorLiquido = respostaListaVendaConvenio.data[i]['VRLIQUIDO'];
		
	   TotalLiqConvenio = parseFloat(TotalLiqConvenio) + parseFloat(ValorLiquido);
//mudar para datatable
		$('#resultadoListConvenio').append(
			`<tr>
                <td><label style="color: blue; font-size: 11px;">` + (i+1) +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + Empresa +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NumVenda + `</label></td>
                <td><label style="color: blue; font-size: 11px;">` + Data +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + CPF +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + Funcionario +	`</label></td>
                <td><label style="color: blue; text-align: right;">`+ ValorLiquido +	`</label></td>
            </tr>`
		);
		
		$('.totalConvenios').html(
			`<tr>
                <th colspan="6" style="text-align: center;">Total Convênios</th>
                <th style="text-align: right;">${mascaraValor(TotalLiqConvenio.toFixed(2))}</th>
            </tr>`
		);

	}
}*/

function retornoListaVendasConvenio(respostaListaVendaConvenio, descFunc, startCarregamento) {
    var numPageAtual = parseInt(respostaListaVendaConvenio.page);
    var numRows =  parseInt(respostaListaVendaConvenio.rows);
    numRows = numRows >= 1000 ?  Math.ceil(numRows / 1000) : 2;
    
    $('#numPagesLoading').html(`Página ${numPageAtual-1} de ${numRows}`)
    if(respostaListaVendaConvenio.data.length != 0){
        for (var i=0; i < respostaListaVendaConvenio.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendaConvenio.data[i];
            
            Empresa = registro.NOFANTASIA;
            NumVenda = registro.NumeroVenda;
            Data = registro.DTLANCAMENTO;
            CPF = registro.NUCPF;
            Funcionario = registro.NOFUNCIONARIO;
            ValorBruto = registro.VRBRUTO;
            ValorDesconto = registro.VRDESCONTO;
            ValorLiquido = registro.VRLIQUIDO;
            ValorDinheiroConv = registro.VRRECDINHEIRO || 0.00;
            ValorCartaoConv = registro.VRRECCARTAO || 0.00;
            ValorPOSConv = registro.VRRECPOS || 0.00;
            ValorChequeConv = registro.VRRECCHEQUE || 0.00;
            ValorVoucherConv = registro.VRRECVOUCHER || 0.00;
            ValorConvenioConv = registro.VRRECCONVENIO || 0.00;
            
            ValorBrutoVendaNF = registro.VPROD;
            ValorDescontoVendaNF = registro.VDESC;
            ValorLiquidoVendaNF = registro.VNF;
            
            TotalBrutoConvenio = parseFloat(TotalBrutoConvenio) + parseFloat(ValorBruto);
            TotalDescConvenio = parseFloat(TotalDescConvenio) + parseFloat(ValorDesconto);
            TotalLiqConvenio = parseFloat(TotalLiqConvenio) + parseFloat(ValorLiquido);
            
            TotalBrutoVendaNF = parseFloat(TotalBrutoVendaNF) + parseFloat(ValorBrutoVendaNF);
            TotalDescVendaNF = parseFloat(TotalDescVendaNF) + parseFloat(ValorDescontoVendaNF);
            TotalLiqVendaNF = parseFloat(TotalLiqVendaNF) + parseFloat(ValorLiquidoVendaNF);
            
            TotalDinheiroConv += parseFloat(ValorDinheiroConv);
            TotalCartaoConv += parseFloat(ValorCartaoConv);
            TotalPOSConv += parseFloat(ValorPOSConv);
            TotalVoucherConv += parseFloat(ValorVoucherConv);
            TotalConvenioConv += parseFloat(ValorConvenioConv);
            
            dataRetorno.push( [contador,
                                Empresa,
                                NumVenda,
                                Data,
                                CPF,
                                Funcionario,
                                ValorBrutoVendaNF,
                                ValorDescontoVendaNF,
                                ValorLiquidoVendaNF,
                                ValorBruto,
                                ValorDesconto,
                                ValorLiquido,
                                 ValorDinheiroConv,
                                ValorCartaoConv,
                                ValorPOSConv,
                                ValorVoucherConv,
                                ValorConvenioConv
                                ]);
        }
        
        chamarProximaListaVendasConvenio(numPageAtual + 1, descFunc, startCarregamento); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-venda-convenio" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>*</th>
                            <th>Empresa</th>
                            <th>Nº Venda</th>
                            <th>Data</th>
                            <th>CPF</th>
                            <th>Funcionário</th>
                            <th>Vr Bruto NF</th>
                            <th>Vr Desc. NF</th>
                            <th>Vr Liquido NF</th>
                            <th>Vr Bruto</th>
                            <th>Vr Desconto</th>
                            <th>Vr Liquido</th>
                            <th>Vr Dinheiro</th>
                            <th>Vr Cartao</th>
                            <th>Vr POS</th>
                            <th>Vr Voucher</th>
                            <th>Vr Convenio</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListConvenio">
                    </tbody>
                    <tfoot class="thead-themed totalConvenios">
                    </tfoot>
                </table>`
        );
	   
	    $('#dt-basic-venda-venda-convenio').DataTable( {
            data: dataRetorno,
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        $('.totalConvenios').html(
			`<tr>
                <th colspan="6" style="text-align: center;">Total Valores</th>
                <th style="text-align: right;">${mascaraValor(TotalBrutoVendaNF.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalDescVendaNF.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalLiqVendaNF.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalBrutoConvenio.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalDescConvenio.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalLiqConvenio.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalDinheiroConv.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalCartaoConv.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalPOSConv.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVoucherConv.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalConvenioConv.toFixed(2))}</th>
            </tr>`
		);
		clearTimeout(startCarregamento);
		Swal.close();
    }
    
    
}

//================ MENU LISTA BALANCO ==============================================
function ListaBalanco(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        );
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);
        
        	$("#idloja").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista de Balanços - <span class='fw-300'></span>`);
			
        	ajaxGet('api/informatica/empresa.xsjs')
        		.then(retornoListaEmpresasSelect)
        		.catch((e) => { funcError(), console.log(e) });
      } 
    };
    xmlhttp.open("GET", "administrativo_action_listbalanco.html", true);
    xmlhttp.send();
}

function pesq_balanco(numPage){

    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var DSdesc = $("#dsDesc").val();
    dataRetornoBalanco=[];
    
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
        
        ajaxGet('api/administrativo/balanco-loja.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim + '&DSdesc=' + DSdesc)
        	.then(retornoListaBalanco)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqbalanco.html", true);
    xmlhttp.send();
} 

function retornoListaDetalheBalanco(respostaListaDetalheBalanco) {

	var contadorProd = 0;
	var numPageAtual = parseInt(respostaListaDetalheBalanco.page);
    var BtnOpcao = "";
	
	if(respostaListaDetalheBalanco.data.length != 0){
	    IDresBalanco = respostaListaDetalheBalanco.data[0]['IDRESUMOBALANCO'];
        NumeroColetor = respostaListaDetalheBalanco.data[0]['NUMEROCOLETOR'];
	    	$("#NomeFantasiaData").html(`Detalhe do Balanço Nº `+ respostaListaDetalheBalanco.data[0]['IDRESUMOBALANCO'] + ` <span class="fw-300"> <i>`+ respostaListaDetalheBalanco.data[0]['NOFANTASIA'] + `</i></span>`);
        for (var i=0; i < respostaListaDetalheBalanco.data.length; i++) { 
            
            contadorProd ++;
            
            var registro = respostaListaDetalheBalanco.data[i];

            iddetalhebalanco = registro.IDDETALHEBALANCO
            idProd = registro.IDPRODUTO;
            dsProd = registro.DSNOME;
            codBarrasProd = registro.NUCODBARRAS;
            qtdContagem = registro.TOTALCONTAGEMGERAL;
            StConsolidado = registro.STCONSOLIDADO;

            if(StConsolidado != 'True'){
                BtnOpcao = `<div class="demo">
                                <button type="button" class="btn btn-outline-success btn-xs btn-icon waves-effect waves-themed" title="Alterar Quantidade" id="`+ iddetalhebalanco +`" onclick="AlterarQtdContagemProdutoBalanco(this.id)"><i class="fal fa-check"></i></button>`;
                if(parseInt(NumeroColetor) != 100){
                    BtnOpcao = BtnOpcao + `<button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Contagem" id="`+ iddetalhebalanco +`:`+ IDresBalanco +`:`+ NumeroColetor +`" onclick="ExcluirQtdContagemProdutoBalanco(this.id)"><i class="fal fa-trash"></i></button>`;
                }
                BtnOpcao = BtnOpcao + `</div>`;
            }
   
            dataRetornoDetBalanco.push([iddetalhebalanco,
                                idProd,
                                dsProd,
                                codBarrasProd,
                                `<input type="number" class="form-control" id="qtd:`+iddetalhebalanco+`" value="`+qtdContagem+`"><span style="display: none;">`+qtdContagem+`</span>`,
                                qtdContagem,
                                BtnOpcao
                                ]);
                                
         somaTotalProduto = parseFloat(somaTotalProduto) + parseFloat(qtdContagem);
         
        }
        
        chamarProximaListaDetBalanco(numPageAtual + 1,IDresBalanco, NumeroColetor);
    }
    else{
        $('#resultadodet').html(
            `<table id="dt-basic-detbalanco" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>*</th>
                            <th>Código</th>
                            <th>Produto</th>
                            <th>Código de Barras</th>
                            <th>Qtd</th>
                            <th>QtdValores</th>
                            <th>Opções</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoDetBalanco">
                    </tbody>
                    <tfoot class="thead-themed totalresultadoDetBalanco">
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tfoot>
                </table>`
        );

       
        
	    mydatatabledetbalanco = $('#dt-basic-detbalanco').DataTable( {
            data: dataRetornoDetBalanco,
            "columnDefs": [
                { "width": "5%", "targets": 0 },
                { "width": "10%", "targets": 1 },
                { "width": "50%", "targets": 2 },
                { "width": "25%", "targets": 3 },
                { "width": "10%", "targets": 4 },
                { "width": "0%", "targets": 5 },
                { "width": "5%", "targets": 6 },
                {"targets": [ 5 ],
                "visible": false,
                "searchable": false}
            ],
           
            "footerCallback": function ( row, data, start, end, display ) {
                var api = this.api(), data;
     
                // Remove the formatting to get integer data for summation
                var intVal = function ( i ) {
                    return typeof i === 'string' ?
                        i.replace('.','').replace(',','.').replace(/[\$,]/g, '')*1 :
                        typeof i === 'number' ?
                        i : 0;
                };
     
                // Total over all pages
                TotalQtdItens = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                //TotalGeralCusto = api.column( 2 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                //TotalGeralVenda = api.column( 3 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

                // Total over this page
                pageTotalQtdItens = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                //pageTotalGeralCusto = api.column( 2, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                //pageTotalGeralVenda = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

                // Update footer
                $( api.column( 4 ).footer() ).html(pageTotalQtdItens +' ('+ TotalQtdItens +' Total )');
                //$( api.column( 2 ).footer() ).html(pageTotalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ TotalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' Total )');
                //$( api.column( 3 ).footer() ).html(pageTotalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ TotalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' Total )');
            },
            
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            createdRow: function ( row, data, index ) {
                //$('td', row).eq(1).attr('id', 'td-' + index + '-1');
                $('td', row).eq(4).attr('id', 'td-'+data[0]);
             },
            
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ],
        } );
       
        
    }
}

// Alterar a Quantidade de Produtos na Contagem do Balanço
function AlterarQtdContagemProdutoBalanco(id){

    // alert(document.getElementById('qtd:'+id).value);
   
    var idresumo = id;
    var qtd = document.getElementById('qtd:'+id).value;
    $('#td-'+id+' span').html(qtd.toString());

    var dados = [{
        "IDDETALHEBALANCO": parseInt(idresumo),
        "TOTALCONTAGEMGERAL": parseInt(qtd)
    }];
   
  	ajaxPut("api/administrativo/detalhe-balanco.xsjs", dados)
		.then(function (){
            Swal.fire({
                type: "success",
                title: "Atualizado com Sucesso!",
                showConfirmButton: true,
                didRender: function(x) { $(".swal2-popup.swal2-modal").removeAttr("tabindex"); }
            });
        })
		.catch((e) => { funcError(), console.log(e) });
}

// Excluir a Quantidade de Produtos na Contagem do Balanço para ZERO 0
function ExcluirQtdContagemProdutoBalanco(id){

    idchave = id.split(":");
    iddetalhe = idchave[0]; 
    idresumo = idchave[1];
    coletor = idchave[2];

    var qtd = 0;
    dataRetornoDetBalanco = [];

    var dados = [{
        "IDDETALHEBALANCO": parseInt(iddetalhe),
        "TOTALCONTAGEMGERAL": parseInt(qtd)
    }];
   
  	ajaxPut("api/administrativo/detalhe-balanco.xsjs", dados)
		.then(function (){
            Swal.fire({
                type: "success",
                title: "Atualizado com Sucesso!",
                showConfirmButton: true,
                //didRender: function(x) { $(".swal2-popup.swal2-modal").removeAttr("tabindex"); }
            }).then((result) => {
                if (result.value == true) {
                    ajaxGet('api/administrativo/detalhe-balanco.xsjs?page=' + numPage + '&idresumo=' + idresumo + '&coletor=' + coletor)
                        .then(retornoListaDetalheBalanco)
                        .catch(funcError);
                }
            });
        })
		.catch((e) => { funcError(), console.log(e) });
}

function modal_detalhe_balanco(id) {

    dataRetornoDetBalanco=[];
    somaTotalProduto = 0;

    idchave = id.split(":");
    idresumo = idchave[0];
    coletor = idchave[1];
    
	$.get('administrativo_action_detbalanco_modal.html', function(res) {
	    
	    numPage = 1;

        $("#coletorBalanco").modal('hide');
        $('.modal').css('overflow-y', 'auto');
		$('#resulmodaldetbalanco').html(res);
		$("#detBalanco").modal('show');
		$('#detBalanco').on('shown.bs.modal', function() {});

		return ajaxGet('api/administrativo/detalhe-balanco.xsjs?page=' + numPage + '&idresumo=' + idresumo + '&coletor=' + coletor)
			.then(retornoListaDetalheBalanco)
			.catch((e) => { funcError(), console.log(e) });
	})
}

function chamarProximaListaBalanco(numPage){
    
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var DSdesc = $("#dsDesc").val();

        ajaxGet('api/administrativo/balanco-loja.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim + '&DSdesc=' + DSdesc)
        	.then(retornoListaBalanco)
        	.catch((e) => { funcError(), console.log(e) });
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function chamarProximaListaDetBalanco(numPage,id,numerocoletor){

		return ajaxGet('api/administrativo/detalhe-balanco.xsjs?page=' + numPage + '&idresumo=' + id + '&coletor=' + numerocoletor)
			.then(retornoListaDetalheBalanco)
			.catch((e) => { funcError(), console.log(e) });
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaBalanco(respostaListaBalanco) {
                    
    var numPageAtual = parseInt(respostaListaBalanco.page);
    
    if(respostaListaBalanco.data.length != 0){
        for (var i=0; i < respostaListaBalanco.data.length; i++) { 
            contador ++;
            var registro = respostaListaBalanco.data[i];
            
            IdEmpresa =  registro.IDEMPRESA;
            Empresa = registro.NOFANTASIA;
            NumResumo = registro.IDRESUMOBALANCO;
            DsResumo = registro.DSRESUMOBALANCO;
            DtAbertura = registro.DTABERTURA;
            DtFechamento = registro.DTFECHAMENTO;
            QtdEstoqueAtual = registro.QTDTOTALANTERIOR;
            QtdContagem = registro.QTDTOTALCONTAGEM;
            QtdDiferenca = QtdContagem - QtdEstoqueAtual;
            StConcluido = registro.STCONCLUIDO;
            StConsolidado = registro.STCONSOLIDADO;
            
            if(StConcluido == 'True'){
                StConcluido = 'Concluído';
            }else{
                StConcluido = 'Aberto';
            }

            /*StOpc = `<div class="btn-group btn-group-xs"><button type="button" class="btn btn-success btn-xs" title="Detalhar Balanço" id="`+ NumResumo +`" onclick="modal_detalhe_balanco(this.id)" >Detalhar Balanço</button>
            <button type="button" class="btn btn-primary btn-xs" title="Lista SAP" id="`+ NumResumo +`" onclick="modal_detalhe_balancoSap(this.id)" >SAP</button></div>`;
            <button type="button" class="btn btn-outline-primary btn-sm btn-icon waves-effect waves-themed" title="Detalhar Balanço" id="`+ NumResumo +`" onclick="modal_detalhe_balanco(this.id)"><i class="fal fa-list"></i></button>*/
            
            /* antigo prévia balanco
            <button type="button" class="btn btn-outline-success btn-sm btn-icon waves-effect waves-themed" title="Prévia Balanço" id="`+ NumResumo +`:`+ IdEmpresa +`" onclick="PreviaBalanco(this.id)"><i class="fal fa-eye"></i></button>`
            */
            
            BtnOpcao = `<div class="demo">
                <button type="button" class="btn btn-outline-primary btn-sm btn-icon waves-effect waves-themed" title="Detalhar Balanço" id="`+ NumResumo +`:`+ IdEmpresa +`" onclick="ListaColetor(this.id)"><i class="fal fa-list"></i></button>
                
                <button type="button" class="btn btn-outline-success btn-sm btn-icon waves-effect waves-themed" title="Prévia Balanço" id="`+ NumResumo +`:`+ IdEmpresa +`:`+ 1 +`:`+ 1 +`:`+StConsolidado+`" onclick="NovoPreviaBalanco(this.id)"><i class="fal fa-eye"></i></button>
                
                <button type="button" class="btn btn-warning btn-sm btn-icon waves-effect waves-themed" title="Prévia Balanço Diferença" id="`+ NumResumo +`:`+ IdEmpresa +`:`+ 0 +`:`+ 1 +`" onclick="NovoPreviaBalanco(this.id)"><i class="fal fa-list"></i></button>
                <button type="button" class="btn btn-danger btn-sm btn-icon waves-effect waves-themed" title="Prévia Balanço Geral" id="`+ NumResumo +`:`+ IdEmpresa +`:`+ 0 +`:`+ 0 +`" onclick="NovoPreviaBalanco(this.id)"><i class="fal fa-list"></i></button>`
                /*if(StConsolidado == 'False'){
                    BtnOpcao = BtnOpcao + `<button type="button" class="btn btn-success btn-sm btn-icon waves-effect waves-themed" title="Consolidar Balanço" id="`+ NumResumo +`:`+ IdEmpresa +`" onclick="ConsolidarBalanco(this.id)"><i class="fal fa-check"></i></button>`
                } else {
                    BtnOpcao = BtnOpcao + `<button type="button" class="btn btn-outline-secondary btn-sm btn-icon waves-effect waves-themed" title="Resumo já Consolidado" disabled><i class="fal fa-check"></i></button>`
                }*/
                if(StConsolidado == 'True' && StConcluido == 'Aberto'){
                    BtnOpcao = BtnOpcao + `<button type="button" class="btn btn-info btn-sm btn-icon waves-effect waves-themed" title="Prestação Contas" id="`+ NumResumo +`" onclick="ListaPrestacaoContas(this.id)"><i class="fal fa-dollar-sign"></i></button>`
                }
                if(StConsolidado == 'True' && StConcluido == 'Concluído'){
                    BtnOpcao = BtnOpcao + `<button type="button" class="btn btn-outline-info btn-sm btn-icon waves-effect waves-themed" title="Prestação Contas" id="`+ NumResumo +`" onclick="ListaPrestacaoContas(this.id)"><i class="fal fa-dollar-sign"></i></button>`
                }
            `</div>`;
                
            dataRetornoBalanco.push( [NumResumo,
                                Empresa,
                                DtAbertura,
                                DtFechamento,
                                QtdEstoqueAtual,
                                QtdContagem,
                                QtdDiferenca,
                                StConcluido,
                                BtnOpcao
                                ]);
        }
        
        chamarProximaListaBalanco(numPageAtual + 1); 
    }
    else{
        $('#resultado').html(
            `<table id="dt-basic-balanco" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>*</th>
                            <th>Empresa</th>
                            <th>Data Abertura</th>
                            <th>Data Fechamento</th>
                            <th>Estoque Atual</th>
                            <th>Contagem</th>
                            <th>Diferença</th>
                            <th>Status</th>
                            <th>Opções</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListBalanco">
                    </tbody>
                    <tfoot class="thead-themed totalBalanco">
                    </tfoot>
                </table>`
        );
	   
	   $('#dt-basic-balanco').DataTable( {
            data: dataRetornoBalanco,
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            order: ([ 0, 'desc' ]),
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
}

function ListaColetor(id){

    dataRetornoColetorBalanco=[];
    somaTotalProduto = 0;

    idchave = id.split(":");
    idresumo = idchave[0];
    idempresa = idchave[1];
    
	$.get('administrativo_action_coletorbalanco_modal.html', function(res) {
	    
	    numPage = 1;

		$('#resulmodalcoletorbalanco').html(res);
		$("#coletorBalanco").modal('show');
		$('#coletorBalanco').on('shown.bs.modal', function() {});

        $("#pesqProdutoColetor").val("");
		return ajaxGet('api/administrativo/coletor-balanco.xsjs?page=' + numPage + '&idresumo=' + idresumo + '&idempresa=' + idempresa)
			.then(retornoListaColetorBalanco)
			.catch((e) => { funcError(), console.log(e) });
	})
}

// Função para Pesquisar o Produto dentro dos Coletores
function pesquisarProdutoColetor(){

	numPage = 1;
	dataRetornoColetorBalanco = [];

    ajaxGet('api/administrativo/coletor-balanco.xsjs?page=' + numPage + '&idresumo=' + idresumo + '&idempresa=' + idempresa + '&descProduto=' + $("#pesqProdutoColetor").val())
		.then(retornoListaColetorBalanco)
		.catch((e) => { funcError(), console.log(e) });

}

function retornoListaColetorBalanco(respostaListaColetorBalanco) {
                    
    var numPageAtual = parseInt(respostaListaColetorBalanco.page);
    var IdEmpresa = 0;
    var NumResumo = 0;
    if(respostaListaColetorBalanco.data.length != 0){
        for (var i=0; i < respostaListaColetorBalanco.data.length; i++) { 
            contador ++;
            var registro = respostaListaColetorBalanco.data[i];
            
            IdEmpresa  = registro.IDEMPRESA;
            NumResumo  = registro.IDRESUMOBALANCO;
            IdColetor  = registro.NUMEROCOLETOR;
            NumItem    = registro.NUMITENS;
            TotalCusto = parseFloat(registro.TOTALCUSTO); //parseFloat(registro.TOTALCUSTO).toLocaleString('pt-BR', { minimumFractionDigits: 2});
            TotalVenda = parseFloat(registro.TOTALVENDA); //parseFloat(registro.TOTALVENDA).toLocaleString('pt-BR', { minimumFractionDigits: 2});
            StConsolidado = registro.STCONSOLIDADO;
            NomeColetor = registro.DSCOLETOR;

            if(NomeColetor != ""){
                Coletor = IdColetor + ' - ' + NomeColetor;
            } else {
                Coletor = IdColetor;
            }

            BtnOpcao = `<div class="demo">
                <button type="button" class="btn btn-outline-primary btn-xs btn-icon waves-effect waves-themed" title="Listagem Produtos do Balanço" id="`+ NumResumo +`:`+ IdColetor +`" onclick="modal_detalhe_balanco(this.id)"><i class="fal fa-list"></i></button>`
            if(StConsolidado == 'False'){
                BtnOpcao = BtnOpcao + `<button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Exclusão do Coletor e Produtos Relacionados" id="`+ NumResumo +`:`+ IdColetor +`:`+ IdEmpresa +`" onclick="ExcluirColetor(this.id)"><i class="fal fa-trash"></i></button>`
            }
            `</div>`;
                
            dataRetornoColetorBalanco.push( [Coletor,
                                NumItem,
                                TotalCusto,
                                TotalVenda,
                                BtnOpcao
                                ]);
        }
        
        chamarProximaListaColetorBalanco(numPageAtual + 1, IdEmpresa, NumResumo); 
    }
    else{
        $('#resulmodalcoletorbalanco').html(
            `<table id="dt-basic-coletor-balanco" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>Coletor</th>
                            <th>Qtd Itens</th>
                            <th>Total Custo</th>
                            <th>Total Venda</th>
                            <th>Opções</th>
                        </tr>
                    </thead>
                    <tbody id="resulmodalcoletorbalanco">
                    </tbody>
                    <tfoot class="thead-themed totalColetorBalanco">
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tfoot>
                </table>`
        );
	   
	   $('#dt-basic-coletor-balanco').DataTable( {
            data: dataRetornoColetorBalanco,
            "columnDefs": [
                { "width": "30%", "targets": 0 },
                { "width": "15%", "targets": 1 },
                { "width": "25%", "targets": 2 },
                { "width": "30%", "targets": 3 },
                { "width": "5%", "targets": 4 }
            ],
            "footerCallback": function ( row, data, start, end, display ) {
                var api = this.api(), data;
     
                // Remove the formatting to get integer data for summation
                var intVal = function ( i ) {
                    return typeof i === 'string' ?
                        i.replace('.','').replace(',','.').replace(/[\$,]/g, '')*1 :
                        typeof i === 'number' ?
                        i : 0;
                };
     
                // Total over all pages
                TotalQtdItens = api.column( 1 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalGeralCusto = api.column( 2 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalGeralVenda = api.column( 3 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

                // Total over this page
                pageTotalQtdItens = api.column( 1, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalGeralCusto = api.column( 2, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalGeralVenda = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

                // Update footer
                $( api.column( 1 ).footer() ).html(pageTotalQtdItens +' ('+ TotalQtdItens +' Total )');
                $( api.column( 2 ).footer() ).html(pageTotalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ TotalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' Total )');
                $( api.column( 3 ).footer() ).html(pageTotalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ TotalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' Total )');
            },
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
}

function chamarProximaListaColetorBalanco(numPage, idEmpresa, numResumo){

    ajaxGet('api/administrativo/coletor-balanco.xsjs?page=' + numPage + '&idEmpresa=' + idEmpresa + '&idresumo=' + numResumo)
        .then(retornoListaColetorBalanco)
        .catch((e) => { funcError(), console.log(e) });
        	
}

function ExcluirColetor(id){

    idchave = id.split(":");
    idresumo = idchave[0];
    numcoletor = idchave[1];
    idempresa = idchave[2];
    id = idresumo + ":" + idempresa;

    var dados = {
        "IDRESUMOBALANCO": parseInt(idresumo),
        "NUMEROCOLETOR": parseInt(numcoletor)
    };
   
    Swal.fire({
        title: 'Deseja excluir o Coletor?',
        text: "Caso exclua, será necessário subir novamente pelo PDV!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
    }).then((result) => {
        if (result.value == true) {
            ajaxPut("api/administrativo/coletor-balanco.xsjs", dados)
                .then(ListaColetor(id))
                .catch((e) => { funcError(), console.log(e) });
        }
    });
}

// Função que realiza a Prévia do Balanco
function PreviaBalanco(id){

    idchave = id.split(":");
    idresumoPreviaBalanco = idchave[0];
    idempresaPreviaBalanco = idchave[1];

    $("#resultadoprevia").html(
        "<div align=\"center\">" +
        "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
        "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
    );

    $.get('administrativo_action_previabalanco_modal.html', function(res) {

        numPage = 1;
        nQtdItens = 0;

        $('#resulmodalpreviabalanco').html(res);
        $("#previaBalanco").modal('show');
        $('#previaBalanco').on('shown.bs.modal', function() {});

        ajaxGet('api/administrativo/count-previa-balanco.xsjs?page=' + numPage + '&id=' + idempresaPreviaBalanco)
            .then(processarPreviaBalanco)
            .catch((e) => { funcError(), console.log(e) });
    })

}

function processarPreviaBalanco(respostaProcessarPreviaBalanco){

    var nCorte = 1000;
    nQtdItens = parseInt(respostaProcessarPreviaBalanco.data[0].CONTADOR);
    contadorPreviaBalanco = parseInt(parseInt(nQtdItens)/parseInt(nCorte)) + 1;

    dataRetornoPreviaBalanco=[];

    if(nQtdItens > 0){

        var dados = [{
            "IDRESUMOBALANCO": parseInt(idresumoPreviaBalanco),
            "IDEMPRESA": parseInt(idempresaPreviaBalanco),
            "NCORTE": nCorte,
            "INICIO": 1,
            "FIM": 0
        }];

        $("#resultadoprevia").html(
            "<div align=\"center\">" +
            "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
            "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
            "</div>"
        );

        $.get('administrativo_action_previabalanco_modal.html', function(res) {

            $('#resulmodalpreviabalanco').html(res);
            $("#previaBalanco").modal('show');
            $('#previaBalanco').on('shown.bs.modal', function() {});

            contadorPreviaBalanco --;
            ajaxPost("api/administrativo/previa-balanco.xsjs", dados)
                .then(retornoMovimentoPreviaBalanco)
                .catch((e) => { funcError(), console.log(e) });

        })
    } else {
        return ajaxGet('api/administrativo/previa-balanco.xsjs?page=' + numPage + '&id=' + idresumoPreviaBalanco)
            .then(retornoListaPreviaBalanco)
            .catch((e) => { funcError(), console.log(e) });
    }
}

function retornoMovimentoPreviaBalanco(retornoMovimentoPreviaBalanco){

    chamaProximoPreviaBalanco();

}

function chamaProximoPreviaBalanco(){

    nCorte = 1000;
    
    if(contadorPreviaBalanco > 0){
        
        var dados = [{
            "IDRESUMOBALANCO": parseInt(idresumoPreviaBalanco),
            "IDEMPRESA": parseInt(idempresaPreviaBalanco),
            "NCORTE": nCorte,
            "INICIO": 0,
            "FIM": contadorPreviaBalanco == 1 ? 1 : 0
        }];

        contadorPreviaBalanco --;
        ajaxPost("api/administrativo/previa-balanco.xsjs", dados)
            .then(retornoMovimentoPreviaBalanco)
            .catch((e) => { funcError(), console.log(e) });
    } else {
        return ajaxGet('api/administrativo/previa-balanco.xsjs?page=' + numPage + '&id=' + idresumoPreviaBalanco)
            .then(retornoListaPreviaBalanco)
            .catch((e) => { funcError(), console.log(e) });
    }
}

function retornoListaPreviaBalanco(respostaListaPreviaBalanco) {
                    
    var numPageAtual = parseInt(respostaListaPreviaBalanco.page);
    var IdEmpresa = 0;
    var NumResumo = 0;

    if(respostaListaPreviaBalanco.data.length != 0){
        for (var i=0; i < respostaListaPreviaBalanco.data.length; i++) { 
            contador ++;
            var registro = respostaListaPreviaBalanco.data[i];
            
            IdProduto    = registro.IDPRODUTO;
            NumResumo    = registro.IDRESUMOBALANCO;
            CodigoBarras = registro.NUCODBARRAS;
            DescProduto  = registro.DSNOME;
            Estoque      = registro.QTDFINAL;
            Balanco      = registro.QTD;
            Sobra        = registro.QTDSOBRA;
            Falta        = registro.QTDFALTA;
            ValorVenda   = parseFloat(registro.PRECOVENDA).toLocaleString('pt-BR', { minimumFractionDigits: 2});
            ValorTotal   = parseFloat(registro.TOTALVENDA).toLocaleString('pt-BR', { minimumFractionDigits: 2});

            dataRetornoPreviaBalanco.push( [IdProduto,
                                CodigoBarras,
                                DescProduto,
                                Estoque,
                                Balanco,
                                Sobra,
                                Falta,
                                ValorVenda,
                                ValorTotal
                                ]);
        }
        
        chamarProximaListaPreviaBalanco(numPageAtual + 1, NumResumo); 
    }
    else{
        $('#resulmodalpreviabalanco').html(
            `<table id="dt-basic-previa-balanco" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>Produto</th>
                            <th>Código Barras</th>
                            <th>Descrição</th>
                            <th>Estoque</th>
                            <th>Balanço</th>
                            <th>Sobra</th>
                            <th>Falta</th>
                            <th>R$ Venda</th>
                            <th>R$ Total</th>
                        </tr>
                    </thead>
                    <tbody id="resulmodalpreviabalanco">
                    </tbody>
                    <tfoot class="thead-themed totalPreviaBalanco">
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tfoot>
                </table>`
        );
	   
	   $('#dt-basic-previa-balanco').DataTable( {
            data: dataRetornoPreviaBalanco,
            "columnDefs": [
                { "width": "05%", "targets": 0 },
                { "width": "10%", "targets": 1 },
                { "width": "15%", "targets": 2 },
                { "width": "10%", "targets": 3 },
                { "width": "10%", "targets": 4 },
                { "width": "10%", "targets": 5 },
                { "width": "10%", "targets": 6 },
                { "width": "15%", "targets": 7 },
                { "width": "15%", "targets": 8 }
            ],
            "footerCallback": function ( row, data, start, end, display ) {
                var api = this.api(), data;
     
                // Remove the formatting to get integer data for summation
                var intVal = function ( i ) {
                    return typeof i === 'string' ?
                        i.replace('.','').replace(',','.').replace(/[\$,]/g, '')*1 :
                        typeof i === 'number' ?
                        i : 0;
                };
     
                // Total over all pages
                TotalEstoque = api.column( 3 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalBalanco = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalSobra = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalFalta = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalVenda = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalGeral = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

                // Total over this page
                pageTotalEstoque = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalBalanco = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalSobra = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalFalta = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVenda = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalGeral = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

                // Update footer
                $( api.column( 3 ).footer() ).html(pageTotalEstoque +' ('+ TotalEstoque +' Total )');
                $( api.column( 4 ).footer() ).html(pageTotalBalanco +' ('+ TotalBalanco +' Total )');
                $( api.column( 5 ).footer() ).html(pageTotalSobra +' ('+ TotalSobra +' Total )');
                $( api.column( 6 ).footer() ).html(pageTotalFalta +' ('+ TotalFalta +' Total )');
                $( api.column( 7 ).footer() ).html(pageTotalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ TotalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' Total )');
                $( api.column( 8 ).footer() ).html(pageTotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ TotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' Total )');
            },

            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
}

function chamarProximaListaPreviaBalanco(numPage, numResumo){

    ajaxGet('api/administrativo/previa-balanco.xsjs?page=' + numPage + '&id=' + numResumo)
        .then(retornoListaPreviaBalanco)
        .catch((e) => { funcError(), console.log(e) });
        	
}

function ConsolidarBalanco(id){

    $("#previaBalanco").modal('hide');

    id = $('#idconsolidar').val();
    idchave = id.split(":");
    idresumo = idchave[0];
    idempresa = idchave[1];

    var dados = {
        "IDRESUMOBALANCO": parseInt(idresumo),
        "IDEMPRESA": parseInt(idempresa)
    };

    return ajaxPut("api/administrativo/consolidar-balanco.xsjs", dados)
        .then(ListaConsolidarBalanco(idresumo))
        .catch((e) => { funcError(), console.log(e) });
}

async function ListaConsolidarBalanco(id){
    
    await sleep(2000);

    idresumo = id;
    numPage = 1;

    $.get('administrativo_action_consolidarbalanco_modal.html', function(res) {
	    
		$('#resulmodalconsolidarbalanco').html(res);
		$("#consolidarBalanco").modal('show');
		$('#consolidarBalanco').on('shown.bs.modal', function() {});

        ajaxGet('api/administrativo/consolidar-balanco.xsjs?page=' + numPage + '&id=' + idresumo)
            .then(retornoConsolidarBalanco)
            .catch((e) => { funcError(), console.log(e) });
    
	})
}

function retornoConsolidarBalanco(respostaConsolidarBalanco){

    var IdEmpresa = 0;
    var IdResumo = respostaConsolidarBalanco.data[0].IDRESUMOBALANCO;

    var qtdDif = respostaConsolidarBalanco.data[0].QTDTOTALCONTAGEM - respostaConsolidarBalanco.data[0].QTDTOTALANTERIOR;

    $('#resulmodalconsolidarbalanco').html(
        `<table class="table table-hover table-striped w-100">
            <tr>
                <th>Número Balanço</th>
                <th>Empresa</th>
                <th>Data Abertura</th>
            </tr>
            <tr>
                <th>` + respostaConsolidarBalanco.data[0].IDRESUMOBALANCO + `</th>
                <th>` + respostaConsolidarBalanco.data[0].NOFANTASIA + `</th>
                <th>` + respostaConsolidarBalanco.data[0].DTABERTURA + `</th>
            </tr>
            <tr><td colspan="3"><td></tr>
            <tr>
                <th>Qtd Estoque Atual: ` + respostaConsolidarBalanco.data[0].QTDTOTALANTERIOR + `</th>
                <th>Qtd Contagem: ` + respostaConsolidarBalanco.data[0].QTDTOTALCONTAGEM + `</th>
                <th>Qtd Diferença: ` + qtdDif + `</th>
            </tr>
            <tr><td colspan="3"><td></tr>
            <tr>
                <th>Observação Contagem</th>
                <th>Observação Divergência Contagem</th>
                <th>Observação Divergência Gerente</th>
            </tr>
            <tr>
                <th><textarea class="form-control" id="obscontagem" rows="5" maxlength="250"></textarea></th>
                <th><textarea class="form-control" id="obsdivergenciacontagem" rows="5" maxlength="250"></textarea></th>
                <th><textarea class="form-control" id="obsdiveregenciagerente" rows="5" maxlength="250"></textarea></th>
            </tr>
            <tr><td colspan="3"><td></tr>
            <tr>
                <td colspan="3" align="center"><button type="button" class="btn btn-success waves-effect waves-themed" title="Confirmar a Consolidação do Balanço" id="`+ IdResumo +`" onclick="ConfirmarConsolidarBalanco(this.id)">Confirmar</button></td>
            </tr>
        </table>`
    );
}

function ConfirmarConsolidarBalanco(id){

    var idresumo = id;

    var dados = [{
        "IDRESUMOBALANCO": parseInt(idresumo),
        "OBSCONTAGEM": document.getElementById("obscontagem").value.toString(),
        "OBSDIVERGENCIACONTAGEM": document.getElementById("obsdivergenciacontagem").value.toString(),
        "OBSDIVERGENCIAGERENTE": document.getElementById("obsdiveregenciagerente").value.toString()
    }];
   
  	ajaxPut("api/administrativo/confirmar-consolidar-balanco.xsjs", dados)
		.then(function (){
            Swal.fire({
                type: "success",
                title: "Consolidado com Sucesso!",
                showConfirmButton: true,
            });
            $("#consolidarBalanco").modal('hide');
            pesq_balanco(1);
        })
		.catch((e) => { funcError(), console.log(e) });
}

function ListaPrestacaoContas(id){

    idresumo = id;
    numPage = 1;

    $.get('administrativo_action_prestacaocontas_modal.html', function(res) {
	    
		$('#resulmodalprestacaocontas').html(res);
		$("#prestacaoContas").modal('show');
		$('#prestacaoContas').on('shown.bs.modal', function() {});

        ajaxGet('api/administrativo/prestacao-contas-balanco.xsjs?page=' + numPage + '&id=' + idresumo)
            .then(retornoPrestacaoContas)
            .catch((e) => { funcError(), console.log(e) });
    
	})

}

function retornoPrestacaoContas(respostaPrestacaoContas){

    var IdEmpresa = respostaPrestacaoContas.data[0].listagem.IDEMPRESA;
    var IdResumo = respostaPrestacaoContas.data[0].listagem.IDRESUMOBALANCO;
    var StConcluido = respostaPrestacaoContas.data[0].listagem.STCONCLUIDO;
    var Loja = respostaPrestacaoContas.data[0].listagem.NOFANTASIA;
    var DtAbertura = respostaPrestacaoContas.data[0].listagem.DTABERTURAFORMATADA;
    var DtEstoqueAnt = respostaPrestacaoContas.data[0].listagem.DTESTOQUEANTERIOR;
    var Periodo = DtEstoqueAnt + ` - ` + DtAbertura;
    
    // Entradas
    var VlrEstoqueAnterior = respostaPrestacaoContas.data[0].listagem.VRESTOQUEANTERIOR;
    var VlrTotalEntrada = respostaPrestacaoContas.data[0].entmerrec.VLRTOTALENTRADA;
    var VlrTotalSobra = respostaPrestacaoContas.data[0].entsobmer.VLRTOTALSOBRA;
    var VlrTotalAlta = respostaPrestacaoContas.data[0].entaltmer.VLRTOTALALTA;
    var VlrTotalVoucher = respostaPrestacaoContas.data[0].entvoucher.VLRTOTALVOUCHER;
    var VlrTotalGeralEntrada = parseFloat(VlrEstoqueAnterior) + parseFloat(VlrTotalEntrada) + parseFloat(VlrTotalSobra) + parseFloat(VlrTotalAlta) + parseFloat(VlrTotalVoucher);

    // Saídas
    var VlrTotalDevolucao = respostaPrestacaoContas.data[0].saidevmer.VLRTOTALDEVOLUCAO;
    var VlrTotalFalta = respostaPrestacaoContas.data[0].saifalmer.VLRTOTALFALTA;
    var VlrTotalBaixa = respostaPrestacaoContas.data[0].saibaimer.VLRTOTALBAIXA;    
    var VlrTotalVendaCaixa = respostaPrestacaoContas.data[0].saivenda.VLRVENDACAIXA;
    var VlrTotalDescontoCaixa = respostaPrestacaoContas.data[0].saivenda.VLRDESCONTOCAIXA;
    var VlrTotalGeralSaida = parseFloat(VlrTotalDevolucao) + parseFloat(VlrTotalDescontoCaixa) + parseFloat(VlrTotalVendaCaixa) + parseFloat(VlrTotalFalta) + parseFloat(VlrTotalBaixa);
    
    // Prestação de Contas
    var VlrTotalPrestarContas = parseFloat(VlrTotalGeralEntrada) - parseFloat(VlrTotalGeralSaida);
    var VlrEstoqueAtual = respostaPrestacaoContas.data[0].listagem.VRESTOQUEATUAL;
    var VlrTotalDiferenca = parseFloat(VlrTotalPrestarContas) - parseFloat(VlrEstoqueAtual);
    if (VlrTotalVendaCaixa == 0){
        var TotalPercentualFalta = 0;
    } else {
        var TotalPercentualFalta = (parseFloat(VlrTotalDiferenca) / parseFloat(VlrTotalVendaCaixa)) * 100;
    }

    if (StConcluido == 'False'){
        BtnFinalizar = `<button type="button" class="btn btn-success waves-effect waves-themed buttonFinalizarBalanco" title="Finalizar Balanço" id="`+ IdResumo +`" onclick="ConfirmarPrestacaoContas(this.id)">Finalizar Balanço</button>`
    } else {
        BtnFinalizar = ""
    }
    $('#resulmodalprestacaocontas').html(
        `<table class="table table-hover table-striped w-100 table-sm">
            <tr>
                <th>Balanço Nº: ` + IdResumo + `<br><br>Loja: ` + Loja + `<br><br>Período: ` + Periodo  + `</th>
            </tr>
        </table>
        <table class="table table-hover table-striped w-100 table-sm">
            <tr><th colspan="4">HISTÓRICO DE ENTRADAS<th></tr>
            <tr>
                <th width="30%">Estoque Anterior</th>
                <td width="35%">` + parseFloat(VlrEstoqueAnterior).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>Mercadorias Recebidas (Romaneios)</th>
                <td>` + parseFloat(VlrTotalEntrada).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>Sobra Mercadorias</th>
                <td>` + parseFloat(VlrTotalSobra).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>Alta de Mercadoria</th>
                <td>` + parseFloat(VlrTotalAlta).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>Voucher</th>
                <td>` + parseFloat(VlrTotalVoucher).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>TOTAL GERAL ENTRADAS</th>
                <th>` + parseFloat(VlrTotalGeralEntrada).toLocaleString('pt-BR', { minimumFractionDigits: 2})  + `</th>
            </tr>
            <tr><td colspan="4"><td></tr>
            <tr><th colspan="4">HISTÓRICO DE SAÍDA<th></tr>
            <tr>
                <th>Devolução de Mercadorias</th>
                <td>` + parseFloat(VlrTotalDevolucao).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>Falta de Mercadoria</th>
                <td>` + parseFloat(VlrTotalFalta).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>Baixa de Mercadorias</th>
                <td>` + parseFloat(VlrTotalBaixa).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>Venda Geral</th>
                <td>` + parseFloat(VlrTotalVendaCaixa).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>Desconto de Mercadoria</th>
                <td>` + parseFloat(VlrTotalDescontoCaixa).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + `</td>
                <th>Data</th>
                <td>` + Periodo  + `</td>
            </tr>
            <tr>
                <th>TOTAL GERAL SAÍDAS</th>
                <th>` + parseFloat(VlrTotalGeralSaida).toLocaleString('pt-BR', { minimumFractionDigits: 2})  + `</th>
            </tr>
            <tr><td colspan="4"><td></tr>
            <tr><th colspan="4">PRESTAÇÃO DE CONTAS<th></tr>
            <tr>
                <th>Total à Prestar Contas</th>
                <td>` + parseFloat(VlrTotalPrestarContas).toLocaleString('pt-BR', { minimumFractionDigits: 2})  + `</td>
            </tr>
            <tr>
                <th>Estoque Atual</th>
                <td>` + parseFloat(VlrEstoqueAtual).toLocaleString('pt-BR', { minimumFractionDigits: 2})  + `</td>
            </tr>
            <tr>
                <th>Diferença</th>
                <td>` + parseFloat(VlrTotalDiferenca).toLocaleString('pt-BR', { minimumFractionDigits: 2})  + `</td>
            </tr>
            <tr>
                <th>Falta Percentual</th>
                <td>` + parseFloat(TotalPercentualFalta).toLocaleString('pt-BR', { minimumFractionDigits: 2})  + `</td>
            </tr>
            <tr>
                <td colspan="2" align="right">` + BtnFinalizar + `<td>
                <td colspan="2" align="right"><button type="button" class="btn btn-outline-primary waves-effect waves-themed" title="Visualizar Impressão" id="`+ IdResumo +`" onclick="ImprimirPrestacaoContas(this.id)">Visualizar Impressão</button><td>
            </tr>
        </table>`
    );
}

function ConfirmarPrestacaoContas(id){

    $('.buttonFinalizarBalanco').prop('disabled',true);

    var idresumo = id;

    var dados = [{
        "IDRESUMOBALANCO": parseInt(idresumo)
    }];
   
  	ajaxPut("api/administrativo/prestacao-contas-balanco.xsjs", dados)
		.then(function (){
            Swal.fire({
                type: "success",
                title: "Finalizado com Sucesso!",
                showConfirmButton: true,
            });
            $("#prestacaoContas").modal('hide');
            pesq_balanco(1);
        })
		.catch((e) => { funcError(), console.log(e) });
}

function ImprimirPrestacaoContas(id){

    var idresumo = id;
    
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    $("#prestacaoContas").modal('hide');

    $("#resultado").html(
        "<div align=\"center\">" +
        "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
        "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
    );
    
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;

            $('.nbalanco').html(
                `<div class="text-dark fw-700 h1 mb-g keep-print-font nbalanco">
                Balanço Nº ${id}
                </div>`);

            return ajaxGet('api/administrativo/prestacao-contas-balanco.xsjs?id=' + idresumo) 
                .then(retornoImprimirBalanco)
                .catch((e) => { funcError(), console.log(e) });

        } 
    };

    xmlhttp.open("GET", "administrativo_action_pdfbalanco.html", true);
    xmlhttp.send();

}

function retornoImprimirBalanco(respostaImprimirBalanco) {

	for (var i = 0; i < respostaImprimirBalanco.data.length; i++) {
    	
        var IdResumo                = respostaImprimirBalanco.data[0].listagem.IDRESUMOBALANCO;
        var StConcluido             = respostaImprimirBalanco.data[0].listagem.STCONCLUIDO;
        var Loja                    = respostaImprimirBalanco.data[0].listagem.NOFANTASIA;
        var DtAbertura              = respostaImprimirBalanco.data[0].listagem.DTABERTURAFORMATADA;
        var DtEstoqueAnt            = respostaImprimirBalanco.data[0].listagem.DTESTOQUEANTERIOR;
        var Periodo                 = DtEstoqueAnt + ` - ` + DtAbertura;
        var VlrEstoqueAnterior      = respostaImprimirBalanco.data[0].listagem.VRESTOQUEANTERIOR;
        var VlrEstoqueAtual         = respostaImprimirBalanco.data[0].listagem.VRESTOQUEATUAL;
        var VlrTotalEntrada         = respostaImprimirBalanco.data[0].entmerrec.VLRTOTALENTRADA;
        var VlrTotalDevolucao       = respostaImprimirBalanco.data[0].saidevmer.VLRTOTALDEVOLUCAO;
        var VlrTotalDescontoCaixa   = respostaImprimirBalanco.data[0].saivenda.VLRDESCONTOCAIXA;
        var VlrTotalVendaCaixa      = respostaImprimirBalanco.data[0].saivenda.VLRVENDACAIXA;
        var VlrAltaMercadoria       = 0;
        var VlrBaixaMercadoria      = 0;
        
        var VlrTotalGeralEntrada    = parseFloat(VlrEstoqueAnterior) + parseFloat(VlrTotalEntrada);
        var VlrTotalGeralSaida      = parseFloat(VlrTotalDevolucao) + parseFloat(VlrTotalDescontoCaixa) + parseFloat(VlrTotalVendaCaixa);
        var VlrTotalPrestarContas   = parseFloat(VlrTotalGeralEntrada) - parseFloat(VlrTotalGeralSaida);
        var VlrTotalDiferenca       = parseFloat(VlrTotalPrestarContas) - parseFloat(VlrEstoqueAtual);
        if (VlrTotalVendaCaixa == 0){
            var TotalPercentualFalta = 0;
        } else {
            var TotalPercentualFalta = (parseFloat(VlrTotalDiferenca) / parseFloat(VlrTotalVendaCaixa)) * 100;
        }
        
		// VrTotalBrutoPedido = mascaraValor(parseFloat(respostaImprimirBalanco.data[i]['VRTOTALBRUTO']).toFixed(2));

        $('.nloja').html(
            `<div class="text-dark fw-700 h1 mb-g keep-print-font nloja">
            Loja ${Loja}
            </div>`);

        $('.nperiodo').html(
            `<div class="text-dark fw-700 h1 mb-g keep-print-font nperiodo">
            Período ${Periodo}
            </div>`);

		$('#idvlrestoqueanterior').html(
            ` ${(mascaraValor(parseFloat(VlrEstoqueAnterior).toFixed(2)))}`);
        
        $('#idvlrtotalentrada').html(
            ` ${(mascaraValor(parseFloat(VlrTotalEntrada).toFixed(2)))}`);
 
        $('#idvlraltamercadoria').html(
            ` ${(mascaraValor(parseFloat(VlrAltaMercadoria).toFixed(2)))}`);
            
        $('#idvlrtotalgeralentrada').html(
            ` ${(mascaraValor(parseFloat(VlrTotalGeralEntrada).toFixed(2)))}`);
        
        $('#idvlrtotaldevolucao').html(
            ` ${(mascaraValor(parseFloat(VlrTotalDevolucao).toFixed(2)))}`);
    
        $('#idvlrbaixamercadoria').html(
            ` ${(mascaraValor(parseFloat(VlrBaixaMercadoria).toFixed(2)))}`);
        
        $('#idvlrtotalvendacaixa').html(
            ` ${(mascaraValor(parseFloat(VlrTotalVendaCaixa).toFixed(2)))}`);
        
        $('#idvlrtotaldescontocaixa').html(
            ` ${(mascaraValor(parseFloat(VlrTotalDescontoCaixa).toFixed(2)))}`);
    
        $('#idvlrtotalgeralsaida').html(
            ` ${(mascaraValor(parseFloat(VlrTotalGeralSaida).toFixed(2)))}`);
            
        $('#idvlrtotalprestarcontas').html(
            ` ${(mascaraValor(parseFloat(VlrTotalPrestarContas).toFixed(2)))}`);
        
        $('#idvlrestoqueatual').html(
            ` ${(mascaraValor(parseFloat(VlrEstoqueAtual).toFixed(2)))}`);
    
        $('#idvlrtotaldiferenca').html(
            ` ${(mascaraValor(parseFloat(VlrTotalDiferenca).toFixed(2)))}`);

        $('#idtotalpercentualfalta').html(
            ` ${(mascaraValor(parseFloat(TotalPercentualFalta).toFixed(2)))}`);
    }
}

// detalhe balanco SAP
function modal_detalhe_balancoSap(id) {

    dataRetornoDetBalanco=[];
    somaTotalProduto = 0;
    
	$.get('administrativo_action_detbalanco_modal.html', function(res) {
	    
	    numPage = 1;

		$('#resulmodaldetbalanco').html(res);
		$("#detBalanco").modal('show');
		$('#detBalanco').on('shown.bs.modal', function() {});

		return ajaxGet('api/administrativo/detalhe-balanco.xsjs?page=' + numPage + '&idresumo=' + id)
			.then(retornoListaDetalheBalancoSap)
			.catch((e) => { funcError(), console.log(e) });
	})
}

function chamarProximaListaDetBalancoSap(numPage,id){

		return ajaxGet('api/administrativo/detalhe-balanco.xsjs?page=' + numPage + '&idresumo=' + id)
			.then(retornoListaDetalheBalancoSap)
			.catch((e) => { funcError(), console.log(e) });
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaDetalheBalancoSap(respostaListaDetalheBalanco) {
    
	var contadorProd = 0;
	var numPageAtual = parseInt(respostaListaDetalheBalanco.page);
	
	if(respostaListaDetalheBalanco.data.length != 0){
	    IDresBalanco = respostaListaDetalheBalanco.data[0]['IDRESUMOBALANCO'];
	    	$("#NomeFantasiaData").html(`Detalhe do Balanço Nº `+ respostaListaDetalheBalanco.data[0]['IDRESUMOBALANCO'] + ` <span class="fw-300"> <i>`+ respostaListaDetalheBalanco.data[0]['NOFANTASIA'] + `</i></span>`);
        for (var i=0; i < respostaListaDetalheBalanco.data.length; i++) { 
            
            contadorProd ++;
            
            var registro = respostaListaDetalheBalanco.data[i];

            idProd = registro.IDPRODUTO;
            codEmpresa = registro.WAREHOUSECODE;
            qtdContagem = registro.TOTALCONTAGEMGERAL;
   
            dataRetornoDetBalanco.push([
                                idProd,
                                codEmpresa,
                                qtdContagem
                                ]);
                                
         somaTotalProduto = parseFloat(somaTotalProduto) + parseFloat(qtdContagem);
         
        }
        
        chamarProximaListaDetBalancoSap(numPageAtual + 1,IDresBalanco);
    }
    else{
        $('#resultadodet').html(
            `<table id="dt-basic-detbalanco" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>ID Produto</th>
                            <th>Cod. Empresa</th>
                            <th>Quantidade</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoDetBalanco">
                    </tbody>
                    <tfoot class="thead-themed totalresultadoDetBalanco">
                    </tfoot>
                </table>`
        );
        
	    mydatatabledetbalanco = $('#dt-basic-detbalanco').DataTable( {
            data: dataRetornoDetBalanco,
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
          
        
        $('.totalresultadoDetBalanco').html(
			`<tr>
                <th colspan="2" style="text-align: center;">Total Produtos</th>
                <th style="text-align: right;">${(somaTotalProduto)}</th>
            </tr>`
		);
    }
    

}

//================ PRODUTOS PREÇOS ==============================================
 
function ListaProdutoPreco(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        ); 
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) { 
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
        
        	$("#idmarca").select2();
        	$("#idloja").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista de Produtos - <span class='fw-300'></span>`);

        	ajaxGet('api/informatica/grupoempresas.xsjs')
                        .then(retornoListaGrupoEmpresasSelect)
                        .catch((e) => { funcError(), console.log(e) });

      }
    };
    xmlhttp.open("GET", "informatica_produtos_preco.html", true);
    xmlhttp.send();
}

function retornoListaGrupoEmpresasSelectVendedor(respostaGrupoEmpresas) {

    listaEmpresas = respostaGrupoEmpresas.data;
    $("#idmarca").empty();
    $('#idmarca').append(
	    `<option value="">Selecione ...</option>`
	);
    
	for (var i = 0; i < respostaGrupoEmpresas.data.length; i++) {

		IDGrupo = respostaGrupoEmpresas.data[i]['IDGRUPOEMPRESARIAL'];
		DSGrupo = respostaGrupoEmpresas.data[i]['GRUPOEMPRESARIAL'];

			$('#idmarca').append(
				`<option value="` + IDGrupo + `"> ` + DSGrupo + `</option>`
			);
	}
}

function selecionamarcavendedor(){
    
    $("#idloja").empty();
    
    idmarca = $('#idmarca').val();
    iduf = $('#iduf').val();

    ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca + '&ufprod='+iduf)
	.then(retornoListaEmpresasGrupo)
	.catch((e) => { funcError(), console.log(e) });
}

function retornoListaEmpresasGrupo(respostaListaEmpresas) {
    
    listaEmpresas = respostaListaEmpresas.data;
    $("#idloja").empty();
    $('#idloja').append(
	    `<option value="">Selecione ...</option>`
	);
	for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

		IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
		DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

			$('#idloja').append(
			    `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
			);
	}
	
}


function pesq_produto_preco(numPage){
    
    dataRetornoProdutoPreco=[];
    contador = 0;

    var descricaoProduto = $("#dsProduto").val();
    
    var idgrupo = $("#idmarca").val();

  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });

    if (idempresa == 0) {
  
        alert("Atenção! É preciso selecionar a  Empresa.");
        $("#idmarca").focus();
        return false;
    } 
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/informatica/produto-preco.xsjs?page='+numPage+'&idEmpresa=' + idempresa + '&dsProduto='+descricaoProduto)
        	.then(retornoListaProdutoPreco)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "informatica_action_pesqprodutopreco.html", true);
    xmlhttp.send();
} 

function chamarProximaListaProdutoPreco(numPage){ 
    
    var idgrupo = $("#idmarca").val();
    var descricaoProduto = $("#dsProduto").val();
  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });
    
        ajaxGet('api/informatica/produto-preco.xsjs?page='+numPage+'&idEmpresa=' + idempresa + '&dsProduto='+descricaoProduto)
        	.then(retornoListaProdutoPreco)
        	.catch((e) => { funcError(), console.log(e) });
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaProdutoPreco(respostaListaProdutoPreco) {

    var numPageAtual = parseInt(respostaListaProdutoPreco.page);
    if(respostaListaProdutoPreco.data.length != 0){
        for (var i=0; i < respostaListaProdutoPreco.data.length; i++) { 
            contador ++;
            var registro = respostaListaProdutoPreco.data[i];
            Codigo = registro.CODIGO_ITEM;
            CodBarras = registro.CODIGO_BARRAS;
            DsProduto = registro.DESCRICAO_ITEM; 
            VrCusto = parseFloat(registro.PRECO_CUSTO);
            VrSap = parseFloat(registro.PRECO_VENDA_SAP);
            VrQuality = parseFloat(registro.PRECO_VENDA_PDV);
            DtUltAlteracao = registro.DATA_ULTIMA_ALTERACAO_PDV;

              dataRetornoProdutoPreco.push( [contador,
                                Codigo,
                                CodBarras,
                                DsProduto,
                                VrCusto.toFixed(2),
                                VrSap.toFixed(2),
                                VrQuality.toFixed(2),
                                DtUltAlteracao]);
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaProdutoPreco(numPageAtual + 1); 
    }else{
         $('#resultado').html(
            `<table id="dt-buttons-produto-preco" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>*</th>
                        <th>Código</th>
                        <th>Código Barras</th>
                        <th>Descrição</th>
                        <th>Preço Custo</th>
                        <th>Preço SAP</th>
                        <th>Preço Quality</th>
                        <th>Alterado</th>
                    </tr>
                </thead>
                <tbody id="resultadoListProdutoPreco">
                </tbody>
                <tfoot id="totalprodutopreco"class="thead-themed">
                </tfoot>
            </table>`
        );
        
         $('#dt-buttons-produto-preco').DataTable( {
            data: dataRetornoProdutoPreco,
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
    }
}



function ValidarEnterQuality(e){
        var keycode = e.keyCode;
    	if(keycode == '13'){
    	    DSdesc = $("#dsProduto").val();
    	    $("#dsProduto").val('');
    	    $("#dsProduto").focus();
    		pesq_produto_preco_quality(1,DSdesc);
    	}
}

function pesq_produto_preco_quality(numPage,descProduto){
    
    descricaoProduto = '';
    
    if(descProduto){
       descricaoProduto =  descProduto;
    }else{
        descricaoProduto = $("#dsProduto").val();
    }
    
    dataRetornoProdutoPrecoQuality=[];
    contador = 0;

    var idgrupo = $("#idmarca").val();

  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });

    if (idempresa == 0) {
  
        alert("Atenção! É preciso selecionar a  Empresa.");
        $("#idmarca").focus();
        return false;
    } 
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);

        ajaxGet('api/produto-sap/produto-quality.xsjs?page=' + numPage + '&codeBarsOuNome=' + descricaoProduto + '&IdEmpresaLoja=' + idempresa)
        	.then(retornoListaProdutoPrecoQuality)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "action_pesqprodutoQuality.html", true);
    xmlhttp.send();
} 


function chamarProximaListaProdutoPrecoQuality(numPage){
    
  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });
    
    ajaxGet('api/produto-sap/produto-quality.xsjs?page=' + numPage + '&codeBarsOuNome=' + descricaoProduto + '&IdEmpresaLoja=' + idempresa)
        	.then(retornoListaProdutoPrecoQuality)
        	.catch(funcError);
        
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaProdutoPrecoQuality(respostaListaProdutoPrecoQuality) {
    var contadorProduto = 0;
    var numPageAtual = parseInt(respostaListaProdutoPrecoQuality.page);
    
    if(respostaListaProdutoPrecoQuality.data.length != 0){
        for (var i=0; i < respostaListaProdutoPrecoQuality.data.length; i++) { 
            contadorProduto ++;
            var registro = respostaListaProdutoPrecoQuality.data[i];
            
            DTUltAlteracao = registro.DTULTALTERACAO;
            CodItem = registro.IDPRODUTO;
            DsProduto = registro.DSNOME;
            CodBarras = registro.NUCODBARRAS;
            ValorVendaPDV = registro.PRECO_VENDA;
            
            dataRetornoProdutoPrecoQuality.push( [contadorProduto,
                                CodBarras,
                                DsProduto,
                                DTUltAlteracao,
                                parseFloat(ValorVendaPDV).toFixed(2)
                                ]);
        }
        
        chamarProximaListaProdutoPrecoQuality(numPageAtual + 1); 
    }
    else{
        $('#resultado').html(
            `<table id="dt-basic-produto-preco-quality" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>*</th>
                            <th>Cód Barras</th>
                            <th>Descrição</th>
                            <th>Data Alteração</th>
                            <th>Venda PDV</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListProdutoPrecoQuality">
                    </tbody>
                    <tfoot class="thead-themed totalProduto">
                    </tfoot>
                </table>`
        );
	   
	   $('#dt-basic-produto-preco-quality').DataTable( {
            data: dataRetornoProdutoPrecoQuality,
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
}

 //================ MENU ALTERAR VENDAS VENDEDOR ==============================================
function ListaAlterarVenda(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        );
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);
        
        	$("#idloja").select2();

        	ajaxGet('api/informatica/empresa.xsjs')
        		.then(retornoListaEmpresasSelect)
        		.catch((e) => { funcError(), console.log(e) });
      } 
    };
    xmlhttp.open("GET", "administrativo_action_listalterarvendavendedor.html", true);
    xmlhttp.send();
}

function pesq_alterar_vendas_vendedor(numPage){
    var idempalterar = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
    dataRetorno =[];
    contadorAtiva = 0;
    VendaAtivaValor = 0;
    TotalVendaAtiva = 0;
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        newDataTable();
        
        $('.dataAtual').text(dataAtual);
      
        return ajaxGet('api/administrativo/venda-ativa.xsjs?page='+numPage+'&pagesize=1000&status=False&idEmpresa=' + idempalterar + '&dataFechamento=' + datapesqinicio + '&dataFechamentoFim=' + datapesqfim)
        .then(retornoListaAlterarVendasVendedor)
        .catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqalterarvendavendedor.html", true);
    xmlhttp.send();
} 

function retornoListaVendasDetalheAlterar(respostaListaVendaDetalheAlterar) {
    
    //tableAlterarVendas.rows().remove().draw();
    
     var myTable = $('#dt-table-alterar-venda').DataTable({
         searching: false,
         paging: false,
         info: false,
        columnDefs: [{
            orderable: false,
            className: 'select-checkbox',
            targets: 0,
        }],
        select: {
            style: 'multi', // 'single', 'multi', 'os', 'multi+shift'
            selector: 'td:first-child',
        },
        order: [
            [1, 'asc'],
        ],
    });

    $('#MyTableCheckAllButton').click(function() {
        if (myTable.rows({
                selected: true
            }).count() > 0) {
            myTable.rows().deselect();
            return;
        }

        myTable.rows().select();
    });

    myTable.on('select deselect', function(e, dt, type, indexes) {
        if (type === 'row') {
            // We may use dt instead of myTable to have the freshest data.
            if (dt.rows().count() === dt.rows({
                    selected: true
                }).count()) {
                // Deselect all items button.
                $('#MyTableCheckAllButton i').attr('class', 'fal fa-check-square');
                return;
            }

            if (dt.rows({
                    selected: true
                }).count() === 0) {
                // Select all items button.
                $('#MyTableCheckAllButton i').attr('class', 'fal fa-square');
                return;
            }

            // Deselect some items button.
            $('#MyTableCheckAllButton i').attr('class', 'fal fa-minus-square');
        }
    });
    
	for (var i = 0; i < respostaListaVendaDetalheAlterar.data.length; i++) {
        IDVendaDetalhe = respostaListaVendaDetalheAlterar.data[i]['IDVENDADETALHE'];
		IDVenda = respostaListaVendaDetalheAlterar.data[i]['IDVENDA'];
		NumCodBarra = respostaListaVendaDetalheAlterar.data[i]['NUCODBARRAS'];
		DescProduto = respostaListaVendaDetalheAlterar.data[i]['DSNOME'];
		VrUnitario = parseFloat(respostaListaVendaDetalheAlterar.data[i]['VUNCOM']);
		QTDProduto = respostaListaVendaDetalheAlterar.data[i]['QTD'];

		VrTotal = parseFloat(respostaListaVendaDetalheAlterar.data[i]['VRTOTALLIQUIDO']);
		NomeVendedor = respostaListaVendaDetalheAlterar.data[i]['VENDEDOR_NOME'];
		SituacaoProduto = respostaListaVendaDetalheAlterar.data[i]['STCANCELADO'];

		    if(SituacaoProduto=='False'){
                tagDetProdAtivo='<td><label style="color: blue;">Ativo</label></td>';
                tagDetProdAlterar='<td><label style="color: red;">Alterar</label></td>';
            }else{
                tagDetProdAtivo='<td><label style="color: red;">Cancelado</label></td>';
            }
            
           
            
		/*$('#resultListDetalheAlterarVenda').append(
			`<tr>
                    <td><label style="color: blue; font-size: 11px;">` + NumCodBarra +`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + DescProduto +`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + mascaraValor(VrUnitario.toFixed(2)) +`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + QTDProduto +`</label></td>
                    <td style="text-align: right;"><label style="color: blue; font-size: 11px;">` + mascaraValor(VrTotal.toFixed(2)) +`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + NomeVendedor +`</label></td>`
			        +tagDetProdAtivo+
			        tagDetProdAlterar+
            `</tr>`
		);*/
		
		myTable.row.add([
		    `<td></td>`,
		    `<label style="color: blue; font-size: 11px;">` + IDVendaDetalhe + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NumCodBarra + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + DescProduto + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + mascaraValor(VrUnitario.toFixed(2)) + `</label>`,
            `<label style="color: blue;">` + QTDProduto + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + mascaraValor(VrTotal.toFixed(2)) + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NomeVendedor + `</label>`,
            `<label style="color: blue;">` + tagDetProdAtivo + `</label>`
            
        ]).draw(false);
	}

	$('.textoCabecalhoDetalheAlterar').html(
		`<h2>
            Lista de Produtos da Venda Nº <span class="fw-300"><i>${IDVenda}</i></span>
        </h2>`
	);
}

function modal_Detalhe_Alterar_Venda(id) {
    IDVenda = id;
    var idempdet = $("#idloja").val();
    
	$.get('action_detalterarvendamodal.html', function(res) {

		$('#resulmodaldetvenda').html(res);
		$("#detVenda").modal('show');
		$('#detVenda').on('shown.bs.modal', function() {});

		ajaxGet('api/administrativo/detalhe-venda.xsjs?idEmpresa=' + idempdet + '&idVenda=' + id)
			.then(retornoListaVendasDetalheAlterar)
			.catch((e) => { funcError(), console.log(e) });
		
		ajaxGet('api/funcionario/funcionario-ativo-por-empresa.xsjs?idEmpresa=' + idempdet)
		    .then(retornoListaFuncionarios)
		    .catch((e) => { funcError(), console.log(e) });
		
	})

}


function retornoListaFuncionarios(respostaListaFuncionarios){
   $("#idVendedor").select2({
            dropdownParent: $("#detVenda")
        });
        
    
	for (var i = 0; i < respostaListaFuncionarios.data.length; i++) {

		idFuncionario = respostaListaFuncionarios.data[i]['ID'];
		nomeFuncionario = respostaListaFuncionarios.data[i]['NOFUNCIONARIO'];
        matFuncionario = respostaListaFuncionarios.data[i]['IDFUNCIONARIO'];
			$('#idVendedor').append(
				`<option value="` + idFuncionario + `"> ` +matFuncionario + ' - ' + nomeFuncionario + `</option>`
			);
	}
}

function chamarProximaListaAlterarVendasVendedor(numPage){
    var idempalterar = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
    return ajaxGet('api/administrativo/venda-ativa.xsjs?page='+numPage+'&pagesize=1000&status=False&idEmpresa=' + idempalterar + '&dataFechamento=' + datapesqinicio + '&dataFechamentoFim=' + datapesqfim)
        .then(retornoListaAlterarVendasVendedor)
        .catch((e) => { funcError(), console.log(e) });
}

function retornoListaAlterarVendasVendedor(respostaListaAlterarVendasVendedor) {
    var numPageAtual = parseInt(respostaListaAlterarVendasVendedor.page);
    if(respostaListaAlterarVendasVendedor.data.length != 0){
    	for (var i = 0; i < respostaListaAlterarVendasVendedor.data.length; i++) {
    
    		contadorAtiva = contadorAtiva + 1;
    
    		NumCaixa = respostaListaAlterarVendasVendedor.data[i]['IDCAIXAWEB'];
    		DescCaixa = respostaListaAlterarVendasVendedor.data[i]['DSCAIXA'];
    		NuVenda = respostaListaAlterarVendasVendedor.data[i]['IDVENDA'];
    		NuNFCe = respostaListaAlterarVendasVendedor.data[i]['NFE_INFNFE_IDE_NNF'];
    		DTAberturaVendaAtiva = respostaListaAlterarVendasVendedor.data[i]['DTHORAFECHAMENTO'];
    		NomeOperadorVendaAtiva = respostaListaAlterarVendasVendedor.data[i]['NOFUNCIONARIO'];
    		STConferidoMov = respostaListaAlterarVendasVendedor.data[i]['STCONFERIDO'];
    
    		VendaAtivaValor = parseFloat(respostaListaAlterarVendasVendedor.data[i]['VRTOTALPAGO']);
    		EmitidasAtivas = respostaListaAlterarVendasVendedor.data[i]['STCONTINGENCIA'];
    
    		TotalVendaAtiva = TotalVendaAtiva + VendaAtivaValor;
    		
    		 dataRetorno.push( [`<label style="color: blue; font-size: 11px;">` + contadorAtiva + `</label>`,
                                `<label style="color: blue; font-size: 11px;">` + NumCaixa + ` - ` + DescCaixa + `</label>`,
                                `<label style="color: blue; font-size: 11px;">` + NuVenda + `</label>`,
                                `<label style="color: blue;">` + NuNFCe + `</label>`,
                                `<label style="color: blue; font-size: 11px;">` + DTAberturaVendaAtiva + `</label>`,
                                `<label style="color: blue; font-size: 11px;">` + NomeOperadorVendaAtiva + `</label>`,
                                `<label style="color: blue;">` + mascaraValor(VendaAtivaValor.toFixed(2)) + `</label>`,
                                `<div class="btn-group btn-group-xs">
                                    <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVenda +`" onclick="modal_Detalhe_Alterar_Venda(this.id)" >Detalhar</button>
                                </div>`
                                ]);
        
    	}
    	chamarProximaListaAlterarVendasVendedor(numPageAtual+1);
    }else{
        $('#resultado').html(
            `<table id="dt-basic-pesqalterarvendas" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        
                        <th></th>
                        <th>Caixa</th>
                        <th>Nº Venda</th>
                        <th>NFCe</th>
                        <th>Abertura</th>
                        <th>Operador</th>
                        <th>Valor</th>
                        <th>Opções</th>
                    
                    </tr>
                </thead>
                <tbody id="resultadoListAlterarVendasAtivas">
                </tbody>
                <tfoot class="thead-themed totalAlterarAtivas">
                </tfoot>
            </table>`
        );
        
         $('#dt-basic-pesqalterarvendas').DataTable( {
            data: dataRetorno,
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    	$('.totalAlterarAtivas').html(
    		`<tr>
                <th colspan="6" style="text-align: center;">Total Vendas Ativas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaAtiva.toFixed(2))}</th>
                <th colspan="2"></th>
            </tr>`
    	);
    }

}

function alterarVendedor(){
    idVendedor = $('#idVendedor').val();
   
    var table = $('#dt-table-alterar-venda').DataTable();  
    var tblData = table.rows('.selected').data();
    var tmpData;
    var dataIdVendaDetalhe = [];
    $.each(tblData, function(i, val) {
        tmpData = tblData[i];
        var idVendaDetalhe = tmpData[1].replace('<label style="color: blue; font-size: 11px;">','');
        idVendaDetalhe = idVendaDetalhe.replace('</label>','');
        dataIdVendaDetalhe.push(idVendaDetalhe);
    });
    if(dataIdVendaDetalhe.length > 0){
        var dados = [{
            "IDVENDADETALHE": dataIdVendaDetalhe,
            "IDVENDEDOR":parseInt(idVendedor)
    }];
        console.log(dados);
        
        
        ajaxPut("api/administrativo/venda-vendedor.xsjs", dados)
		.then(funcSucessUpdateAlterarVendedorVenda)
		.catch((e) => { funcError(), console.log(e) });
	}else{
        alert("Favor selecionar ao menos uma venda!");
    	return;
    }
 
}

function funcSucessUpdateAlterarVendedorVenda(resposta){
    modal_Detalhe_Alterar_Venda(IDVenda);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////// QUEBRA CAIXAS ////////////////////////////////////////////////////////
function ListaQuebraCaixaLoja() {

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#DTInicio').val(dataAtualCampo);
            $('#DTFim').val(dataAtualCampo);
            
            $("#idloja").select2();
            $("#idmarca").select2();
            $("#iduf").select2();
        
            $('.DescTituloQuebraCaixa').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Quebra de Caixas das Lojas<span class='fw-300'></span>`);

			ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch((e) => { funcError(), console.log(e) });

      }
    };
    xmlhttp.open("GET", "financeiro_action_listquebracaixaloja.html", true);
    xmlhttp.send();
}

async function pesq_quebra_caixa_loja() {
    try {
        let datapesqinicio = $("#DTInicio").val();
        let datapesqfim = $("#DTFim").val();
        let IDMarcaLoja = $("#idmarca").val();
        let IDEmpresaLoja = $("#idloja").val();
        let CPFOperadorQuebra = $("#cpfOperador").val();
        let stQuebraPositivaNegativa = $("#stQuebraPositvaNegativa").val();
        
        stQuebraPositivaNegativa = stQuebraPositivaNegativa == '1' ? 'Positiva' : stQuebraPositivaNegativa == '2' ? 'Negativa' : '';
        
        await ajaxGetAllData(`api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page=1&idEmpresa=${IDEmpresaLoja}&dataPesquisaInic=${datapesqinicio}&dataPesquisaFim=${datapesqfim}&stQuebraPositivaNegativa=${stQuebraPositivaNegativa}&idMarca=${IDMarcaLoja}&cpfquebraop=${CPFOperadorQuebra}`)
            .then(retornoTableListQuebraCaixaLoja)
            .catch((erro) => { throw new Error(error)});
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoTableListQuebraCaixaLoja(dadosQuebraCaixaLoja) {
    let { data } = dadosQuebraCaixaLoja || '';
    let dadosTabela = [];
    let contador = 0;

    if (data?.length > 0) {

        for (let registro of data) {
            let IDQuebraLoja = registro?.IDQUEBRACAIXA;
            let EmpMovQuebraLoja = registro?.NOFANTASIA;
            let IDMovQuebraLoja = registro?.IDMOVIMENTOCAIXA;
            let IDGerente = registro?.IDGERENTE;
            let IDFuncQuebra = registro?.IDFUNCIONARIO;
            let DTLancamento = registro?.DTLANCAMENTO;
            let VrQuebrasistemaLoja = parseFloat(registro?.VRQUEBRASISTEMA || 0);
            let VrQuebraLancadoLoja = parseFloat(registro?.VRQUEBRAEFETIVADO || 0);
            let TxtHistoricoQuebra = registro?.TXTHISTORICO;
            let NomeFuncQuebra = registro?.NOMEOPERADOR;
            let CPFNomeFuncQuebra = registro?.CPFOPERADOR;
            let MatNomeFuncQuebra = registro?.IDFUNCIONARIO;
            let SituacaoQuebraLoja = registro?.STATIVO;
            let tagQuebraAtivo = '<label style="color: red;">Cancelado</label>';
            let tagVrQuebraLanc = `<label style="color: red;">${mascaraValor(VrQuebraLancadoLoja.toFixed(2))}</label>`;
            let tagVrQuebraSistemaLanc = `<label style="color: red;">${mascaraValor(VrQuebrasistemaLoja.toFixed(2))}</label>`;
            let tagQuebraAtivoBotao = `
                <div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Ativar Quebra" id="${IDQuebraLoja}" onclick="status_Quebra_Caixa_Loja(this.id,'True')" >Ativar</button>
                </div>
            `;

            if (SituacaoQuebraLoja == 'True') {
                tagQuebraAtivo = '<label style="color: blue;">Ativo</label>';
                tagQuebraAtivoBotao = `
                    <div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-danger btn-xs" title="Cancelar Quebra" id="${IDQuebraLoja}" onclick="status_Quebra_Caixa_Loja(this.id,'False')" >Cancelar</button>
                        <button type="button" class="btn btn-info btn-xs" title="Imprimir Quebra" id="${IDQuebraLoja}" onclick="modal_Imprimir_Quebra(this.id)" >Imprimir</button>
                    </div>
                `;
            }

            if (VrQuebraLancadoLoja > 0) {
                tagVrQuebraLanc = `<label style="color: blue;">${mascaraValor(VrQuebraLancadoLoja.toFixed(2))}</label>`;
            }

            if (VrQuebrasistemaLoja > 0) {
                tagVrQuebraSistemaLanc = `<label style="color: blue;">${mascaraValor(VrQuebrasistemaLoja.toFixed(2))}</label>`;
            }

            contador++;

            dadosTabela.push([
                `<label style="color: blue;">${contador}</label>`,
                `<label style="color: blue;">${EmpMovQuebraLoja}</label>`,
                `<label style="color: blue;">${DTLancamento}</label>`,
                `<label style="color: blue;">${IDMovQuebraLoja}</label>`,
                `<label style="color: blue;">${MatNomeFuncQuebra}</label>`,
                `<label style="color: blue;">${NomeFuncQuebra}</label>`,
                `<label style="color: blue;">${CPFNomeFuncQuebra}</label>`,
                tagVrQuebraSistemaLanc,
                tagVrQuebraLanc,
                `<label style="color: blue;">${TxtHistoricoQuebra}</label>`,
                tagQuebraAtivo,
                tagQuebraAtivoBotao,
            ]);
        }
    } 

    $('#resultado').html(
        `<div class="row">
            <div class="col-xl-12">
                <div id="panel-1" class="panel">
                    <div class="panel-hdr">
                        <h2>
                            Lista de Quebra de Caixas<span class="fw-300"><i></i></span>
                        </h2>
                        <div class="panel-toolbar">
                            <button class="btn btn-panel" data-action="panel-collapse" data-toggle="tooltip" data-offset="0,10" data-original-title="Recolher"></button>
                            
                        </div>
                    </div>
                    <div class="panel-container show">
                        <div class="panel-content">
                            <div id="resultadoListaQuebra">
                                <table id="dt-basic-quebracaixa" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                                    <thead class="bg-primary-600">
                                        <tr>
                                            <th>*</th>
                                            <th>Empresa</th>
                                            <th>DT Lançamento</th>
                                            <th>Nº Movimento</th>
                                            <th>Matrícula</th>
                                            <th>Colaborador</th>
                                            <th>CPF</th>
                                            <th>Vr Quebra Sistema</th>
                                            <th>Vr Quebra Lançado</th>
                                            <th>Histórico</th>
                                            <th>Situação</th>
                                            <th>Opções</th>
                                        </tr>
                                    </thead>
                                    <tbody id="resultadoQuebraCaixa">
                                    </tbody>
                                    <tfoot id="totalQuebraCaixaLoja"class="thead-themed">
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
    );

    $('#dt-basic-quebracaixa').DataTable({
        data: dadosTabela,
        responsive: true,
        deferRender: true,
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [
            {
                extend: 'pdfHtml5',
                text: 'PDF',
                titleAttr: 'Generate PDF',
                className: 'btn-outline-danger btn-sm mr-1'
            },
            {
                extend: 'excelHtml5',
                text: 'Excel',
                titleAttr: 'Gerar Excel',
                className: 'btn-outline-success btn-sm mr-1',
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function (data, row, column, node) {
                            data = $('<p>' + data + '</p>').text();
                            return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                        }
                    }
                }
            },
            {
                extend: 'print',
                text: 'Print',
                titleAttr: 'Print Table',
                className: 'btn-outline-primary btn-sm'
            }
        ]
    });

}

function modal_Imprimir_Quebra(id) {
    
    $.get('action_imprimirmodalquebra.html', function(res) {

		$('#resulmodalimprimirquebra').html(res);
		$("#imprimiDadosQuebra").modal('show');
		$('#imprimiDadosQuebra').on('shown.bs.modal', function() {});
		
		return	ajaxGet('api/dashboard/quebra-caixa/quebra-caixa.xsjs?id=' + id) 
			.then(retornoTableImprimeQuebra) 
			.catch((e) => { funcError(), console.log(e) });
	})
} 

function retornoTableImprimeQuebra(imprimeQuebraLoja) {

            var idfuncionarioop = $("#IDFuncionario").val();
            
            IDFuncionarioQuebraLoja = '';

			IDQuebraLoja = imprimeQuebraLoja.data[0]['IDQUEBRACAIXA'];
			IDMovQuebraLoja = imprimeQuebraLoja.data[0]['IDMOVIMENTOCAIXA'];
			IDEmpresaQuebraLoja = imprimeQuebraLoja.data[0]['IDEMPRESA'];
			IDFuncionarioQuebraLoja = imprimeQuebraLoja.data[0]['IDFUNCIONARIO'];
			DsCaixaQuebraLoja = imprimeQuebraLoja.data[0]['DSCAIXA'];
			DTMovQuebraLoja = imprimeQuebraLoja.data[0]['DTLANCAMENTO'];
			VrQuebraLoja = parseFloat(imprimeQuebraLoja.data[0]['VRQUEBRAEFETIVADO']);
			TxtHistQuebraLoja = imprimeQuebraLoja.data[0]['TXTHISTORICO'];
		    RazaoEmpresaQuebra = imprimeQuebraLoja.data[0]['NORAZAOSOCIAL'];
			NoFantasiaEmpresaQuebra = imprimeQuebraLoja.data[0]['NOFANTASIA'];
			CNPJEmpresaQuebra = imprimeQuebraLoja.data[0]['NUCNPJ'];
			EndEmpresaQuebra = imprimeQuebraLoja.data[0]['EENDERECO'];
			BairroEmpresaQuebra = imprimeQuebraLoja.data[0]['EBAIRRO'];
			CidadeEmpresaQuebra = imprimeQuebraLoja.data[0]['ECIDADE'];
			UFEmpresaQuebra = imprimeQuebraLoja.data[0]['SGUF'];
			NoFuncionarioQuebra = imprimeQuebraLoja.data[0]['NOMEOPERADOR'];
			FuncaoFuncionarioQuebra = imprimeQuebraLoja.data[0]['DSFUNCAO'];
			CPFFuncionario = imprimeQuebraLoja.data[0]['CPFOPERADOR']; 
			NoGerente = imprimeQuebraLoja.data[0]['NOMEGERENTE'];

			if(idfuncionarioop == IDFuncionarioQuebraLoja){
			    
    			$('.TituloModalImprimir').html( 
            		`Impressão de Recibos <small class="m-0 text-muted">Imprimir Quebra de Caixa</small>`
            	);
    
            	$('.TituloRecibo').html(
            		`<h3 style="text-align: center;">AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO POR QUEBRA DE CAIXA</h3>`
            	);
    
            	$('.CorpoRecibo1').html(
            		`<div class="col-sm-12" style="text-align: justify;">Valor da Quebra:<b> R$ ` + mascaraValor(VrQuebraLoja.toFixed(2)) + ` - </b>Referente:<b> ` + (DsCaixaQuebraLoja) + ` - </b>Movimento:<b> ` + (IDMovQuebraLoja) + `</b></div>`
            	);
    
            	$('.CorpoRecibo2').html(
            		`<div class="col-sm-12" style="text-align: justify;">Pelo presente instrumento, Eu,<b> ` + NoFuncionarioQuebra + `</b>, brasileiro(a), função (` + FuncaoFuncionarioQuebra + `), inscrito(a) no CPF sob o nº <b> ` + CPFFuncionario + ` </b>, 
            		colaborador(a) da empresa GTO COM. ATAC. DE CONFEC. E CALÇ. LTDA., inscrita no CNPJ nº.<b> ` + CNPJEmpresaQuebra + `</b>, com sede na ` + EndEmpresaQuebra + ` - ` + BairroEmpresaQuebra + ` - ` + CidadeEmpresaQuebra + ` - ` + UFEmpresaQuebra + `, 
            		<b>AUTORIZO</b> a empresa a efetuar o desconto até o limite total do meu adicional de quebra de caixa, em meu salário, através da folha de pagamento, dos valores faltantes no meu caixa, seguindo assim os ditames legais do Art. 462, §1º da CLT e CCT vigentes.</div>
                    `
            	);
            	
            	$('.CorpoRecibo3').html( 
            		`<div class="col-sm-12" style="text-align: justify;">Motivo: <b>` + TxtHistQuebraLoja + ` </b></div>`
            	);
            	
            	$('.CorpoRecibo4').html(
            		`<div class="col-sm-12">Brasília, ` + dataAtual + `.</div>`
            	);
            	
            	$('.CorpoRecibo5').html(
            		`<div class="col-sm-12" style="text-align: center;">--------------------------------------------------------------------------------------------------------------------</div>
        			    <div class="col-sm-12" style="text-align: center;">` + NoFuncionarioQuebra + ` - CPF: ` + CPFFuncionario + `</div>`
            	);
            	
            	$('.CorpoRecibo6').html(
            		`<div class="col-sm-12" style="text-align: center;">--------------------------------------------------------------------------------------------------------------------</div>
        			    <div class="col-sm-12" style="text-align: center;">` + NoFantasiaEmpresaQuebra + ` - ` + NoGerente + `</div>`
            	);
			}else{
    			$('.TituloModalImprimir').html( 
            		`Impressão de Recibos <small class="m-0 text-muted">Imprimir Desconto em Folha</small>`
            	);
    
            	$('.TituloRecibo').html(
            		`<h3 style="text-align: center;">DESCONTO AUTORIZADO EM FOLHA DE PAGAMENTO</h3>`
            	);
    
            	$('.CorpoRecibo1').html(
            		`<div class="col-sm-12" style="text-align: justify;">Valor da Quebra:<b> R$ ` + mascaraValor(VrQuebraLoja.toFixed(2)) + ` - </b>Referente:<b> ` + (DsCaixaQuebraLoja) + ` - </b>Movimento:<b> ` + (IDMovQuebraLoja) + `</b></div>`
            	);
    
            	$('.CorpoRecibo2').html(
            		`<div class="col-sm-12" style="text-align: justify;">Pelo presente instrumento, Eu,<b> ` + NoFuncionarioQuebra + `</b>, brasileiro(a), função (` + FuncaoFuncionarioQuebra + `), inscrito(a) no CPF sob o nº <b> ` + CPFFuncionario + ` </b>, 
            		colaborador(a) da empresa GTO COM. ATAC. DE CONFEC. E CALÇ. LTDA., inscrita no CNPJ nº.<b> ` + CNPJEmpresaQuebra + `</b>, com sede na ` + EndEmpresaQuebra + ` - ` + BairroEmpresaQuebra + ` - ` + CidadeEmpresaQuebra + ` - ` + UFEmpresaQuebra + `, 
            		<b>AUTORIZO</b> a empresa a efetuar o desconto acima especificado em meu salário, através da folha de pagamento.</div>
                    `
            	);
            	
            	$('.CorpoRecibo3').html( 
            		`<div class="col-sm-12" style="text-align: justify;">Motivo: <b>` + TxtHistQuebraLoja + ` </b></div>`
            	);
            	
            	$('.CorpoRecibo4').html(
            		`<div class="col-sm-12">Brasília, ` + dataAtual + `.</div>`
            	);
            	
            	$('.CorpoRecibo5').html(
            		`<div class="col-sm-12" style="text-align: center;">--------------------------------------------------------------------------------------------------------------------</div>
        			    <div class="col-sm-12" style="text-align: center;">` + NoFuncionarioQuebra + ` - CPF: ` + CPFFuncionario + `</div>`
            	);
            	
            	$('.CorpoRecibo6').html(
            		`<div class="col-sm-12" style="text-align: center;">--------------------------------------------------------------------------------------------------------------------</div>
        			    <div class="col-sm-12" style="text-align: center;">` + NoFantasiaEmpresaQuebra + ` - ` + NoGerente + `</div>`
            	);
			}
			
		textoFuncao = 'QUEBRA DE CAIXA Nº '+ IDQuebraLoja + ' DO MOVIMENTO: ' + IDMovQuebraLoja + ' FUNCIONARIO: ' + NoFuncionarioQuebra;
		
        var dadosCancelaQuebra = [{
            
            "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
            "PATHFUNCAO":"FINANCEIRO/IMPRESSÃO QUEBRA DE CAIXA",
            "DADOS":textoFuncao,
            "IP":ipCliente
        }];
    
      	ajaxPost("api/log-web.xsjs", dadosCancelaQuebra)
    		.then(funcSucessLog)
    		.catch((e) => { funcError(), console.log(e) });
		
}

function status_Quebra_Caixa_Loja(id,status) {

    var dados = {
      "IDQUEBRACAIXA": parseInt(id),
      "STATIVO":status
    };
    
  	ajaxPut("api/dashboard/quebra-caixa/atualizacao-status.xsjs", dados)
		.then(funcSucessUpdateQuebraCaixaLoja)
		.catch((e) => { funcError(), console.log(e) });
		
	const textdados = JSON.stringify(dados);
	
	if(status=='True'){
	    textoFuncao = 'FINANCEIRO/ATIVADO QUEBRA DE CAIXA';
	}else{
	    textoFuncao = 'FINANCEIRO/CANCELAMENTO DE QUEBRA DE CAIXA';
	}
		
    var dadosCancelaQuebra = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosCancelaQuebra)
		.then(funcSucessLog)
		.catch((e) => { funcError(), console.log(e) });

}

function funcSucessUpdateQuebraCaixaLoja(resposta) {

	alerta_cancel_ativa_quebra_caixa();
	pesq_quebra_caixa_loja();

}

function alerta_cancel_ativa_quebra_caixa() {
Swal.fire(
  {
      type: "success",
      title: "Quebra de Caixa Atualizado com Sucesso.",
      showConfirmButton: false,
      timer: 2500
  });
}

//================ MENU LISTA VOUCHERS MARCAS ==============================================
function ListaVouchersMarca(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        );
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);
        
        	$("#idmarca").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas das Marcas - <span class='fw-300'></span>`);
			
            ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch((e) => { funcError(), console.log(e) });
      } 
    };
    xmlhttp.open("GET", "administrativo_action_listvouchersmarca.html", true);
    xmlhttp.send();
}

function pesq_vouchers_marca(numPage){
    
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/financeiro/venda-digital-marca.xsjs?pageSize=500&page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVouchersMarca)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqvendasdigital.html", true);
    xmlhttp.send();
} 

function retornoListaVouchersMarca(respostaListaVouchersMarca) {
    $('#resultado').html(
                `<table id="" class="table table-bordered table-hover table-responsive-lg table-striped w-100 vendaVouchersMarca">
                    <thead class="bg-primary-600">
                        <tr>
                            <th style="width: 35%">Nome Loja</th>
                            <th style="width: 35%">Cod. Produto</th>
                            <th style="width: 15%">Produtos</th>
                            <th style="width: 15%">Cod. Barras</th>
                            <th style="width: 15%">QTD.</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoVendaDigitalPeriodoMarca">
                    </tbody>
                    
                </table>`
            );
            
    var tableVouchersMarca = $('.vendaVouchersMarca').DataTable({
        "columnDefs": [
          { className: "text-center", "targets": [1,1] },
          { className: "text-right", "targets": [2,2] }
        ]
    });
    
    tableVouchersMarca.rows().remove().draw();
    
    if(respostaListaVouchersMarca.data.length!= 0){
    	for (var i = 0; i < respostaListaVouchersMarca.data.length; i++) {

    	    nomeFantasia = respostaListaVouchersMarca.data[i]['NOFANTASIA'];
            numEmpresa = respostaListaVouchersMarca.data[i]['IDEMPRESA'];
            quantidade = respostaListaVouchersMarca.data[i]['QTDTOTAL'];
            valorTotalLiquido = respostaListaVouchersMarca.data[i]['VRTOTALVENDA'];

            
        		tableVouchersMarca.row.add([
                    `<label style="color: blue; font-size: 11px;">` + nomeFantasia + `</label>`,
                    `<label style="color: blue;">` + quantidade + `</label>`,
                    `<label style="color: blue;">` + mascaraValor(parseFloat(valorTotalLiquido).toFixed(2)) + `</label>`,
                ]).draw(false);
                
                totalQuantidade = parseFloat(totalQuantidade) + parseFloat(quantidade);
                totalVrliquido = parseFloat(totalVrliquido) + parseFloat(valorTotalLiquido);
           
    	}
    }

}



/////////////////////////////////////////////////////////////////////////
////////////////////PESQUISA VENDA LOJA////////////////////////
function ListaVenda(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        ); 
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) { 
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista Venda - <span class='fw-300'></span>`);

      }
    };
    xmlhttp.open("GET", "administrativo_venda.html", true);
    xmlhttp.send();
}

function pesq_vendas_loja(){
    dataRetorno=[];
    
    var idVenda = $("#idVenda").val();
    
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        //newDataTable('venda-consolidada');
        
      
        ajaxGet('api/venda/lista-venda.xsjs?id=' + idVenda )
        	.then(retornoListaVenda)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqvendarel.html", true);
    xmlhttp.send();
} 

 function formatDataTableVenda ( d ) {
    // `d` is the original data object for the row
    html = '<table cellpadding="6" cellspacing="0" border="0" style="padding-left:50px;">';
    html = html + '<tr><td colspan="5"><b>Detalhe Venda<b></td></tr>';
    html = html + '<tr><td><b>Cod. Produto<b></td>';
    html = html + '<td><b>Cod. Barras<b></td>';
    html = html + '<td><b>Produto<b></td>';
    html = html + '<td><b>Preço<b></td>';
    html = html + '<td><b>Qtd.<b></td></tr>';
       
    for(var i=0; i< dataRetornoVendaDetalhe.length;i++){
        html = html + '<tr>';
        html = html + '<td>'+dataRetornoVendaDetalhe[i]['det']['CPROD']+'</td>';
        html = html + '<td>'+dataRetornoVendaDetalhe[i]['det']['NUCODBARRAS']+'</td>';
        html = html + '<td>'+dataRetornoVendaDetalhe[i]['det']['XPROD']+'</td>';
        html = html + '<td>'+parseFloat(dataRetornoVendaDetalhe[i]['det']['VPROD'],2)+'</td>';
        html = html + '<td>'+parseFloat(dataRetornoVendaDetalhe[i]['det']['QTD'],2)+'</td>';
        html = html + '</tr>';
    }
    html = html + '</table></br><hr size="6" width="50%" align="left" color="green"></br>';
    html = html + '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    html = html + '<tr><td colspan="2"><b>Detalhe Pagamento<b></td></tr>';
    html = html + '<tr><td><b>Descrição<b></td>';
    html = html + '<td><b>Vl. Pago<b></td>';
    html = html + '<td><b>Qtd. Parcelas<b></td>';
    html = html + '<td><b>Autorização<b></td>';
    html = html + '<td><b>Data Vencimento<b></td>';
    html = html + '</tr>';
       
    for(var i=0; i< dataRetornoVendaPagamento.length;i++){
        html = html + '<tr>';
        html = html + '<td>'+dataRetornoVendaPagamento[i]['pag']['DSTIPOPAGAMENTO']+'</td>';
        html = html + '<td>'+parseFloat(dataRetornoVendaPagamento[i]['pag']['VALORRECEBIDO'],2)+'</td>';
        html = html + '<td>'+parseInt(dataRetornoVendaPagamento[i]['pag']['NPARCELAS'])+'</td>';
        html = html + '<td>'+dataRetornoVendaPagamento[i]['pag']['NSUAUTORIZADORA']+'</td>';
        html = html + '<td>'+dataRetornoVendaPagamento[i]['pag']['DTVENCIMENTO']+'</td>';
        html = html + '</tr>';
    }
    html = html + '</table>';
    return html;
 }

function retornoListaVenda(respostaListaVenda) {
    for (var i=0; i < respostaListaVenda.data.length; i++) { 
        var registro = respostaListaVenda.data[i];
        empresa = registro['venda']['NOFANTASIA'];
        idVenda = registro['venda']['IDVENDA'];
        dataHora = registro['venda']['DTHORAFECHAMENTO'];
        caixa = registro['venda']['DSCAIXA'];
        funcionario = registro['venda']['NOFUNCIONARIO'];
        vlDinheiro = registro['venda']['VRRECDINHEIRO'];
        vlCartao = registro['venda']['VRRECCARTAO'];
        vlConvenio = registro['venda']['VRRECCONVENIO'];
        vlPos = registro['venda']['VRRECPOS'];
        vlVoucher = registro['venda']['VRRECVOUCHER'];
        vlPago = registro['venda']['VRTOTALPAGO'];
        nrNota = registro['venda']['NRNOTA'];
        btn = '<button type="button" class="btn btn-success btn-xs" title="Visualizar Detalhes" id="1" ></button>';
        dataRetornoVendaPagamento=registro['pagamento'];
        dataRetornoVendaDetalhe=registro['detalhe'];
        
        dataRetorno.push( [btn,
                            idVenda,
                            empresa,
                            dataHora,
                            caixa,
                            funcionario,
                            vlDinheiro,
                            vlCartao,
                            vlConvenio,
                            vlPos,
                            vlVoucher,
                            vlPago,
                            nrNota
                        ])
    }

     $('#resultado').html(
        `<table id="dt-basic-venda" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                <th></th>
                    <th>Nº Venda</th>
                    <th>Empresa</th>
                    <th>Data</th>
                    <th>Caixa</th>
                    <th>Funcionario</th>
                    <th>Vl. Dinheiro</th>
                    <th>Vl. Cartão</th>
                    <th>Vl. Convênio</th>
                    <th>Vl. POS</th>
                    <th>Vl. Voucher</th>
                    <th>Vl. Pago</th>
                    <th>Nº Nota</th>
                </tr>
            </thead>
            <tbody id="resultadoVenda">
            </tbody>
            
        </table>`
    );

    var table = $('#dt-basic-venda').DataTable({
        data: dataRetorno,
       
    });

      // Add event listener for opening and closing details
      $('#dt-basic-venda').on('click', 'td.sorting_1', function () {
          var tr = $(this).closest('tr');
          var row = table.row(tr);

          if (row.child.isShown()) {
              // This row is already open - close it
              row.child.hide();
              tr.removeClass('shown');
          } else {
              // Open this row
              row.child(formatDataTableVenda(tr.data('child-value'))).show();
              tr.addClass('shown');
          }
      });
}

// ========================= INICIO EXTRATO CONTA LOJA ===
function ListaExtrato() {

        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    
        $("#resultado").html(
            "<div align=\"center\">" +
            "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>" +
            "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
            "</div>"
        );
    
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
    
                $('.dataAtual').text(dataAtual);
                $('#dtconsultainicio').val(dataAtualCampo);
                $('#dtconsultafim').val(dataAtualCampo);
    
                $("#idloja").select2();
    
                $('.DescTituloListaVendas').html(
                    `<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas das Lojas - <span class='fw-300'></span>`);
    
                ajaxGet('api/informatica/empresa.xsjs')
                    .then(retornoListaEmpresasSelect)
                    .catch((e) => { funcError(), console.log(e) });
            }
        };
        xmlhttp.open("GET", "financeiro_action_listextratoloja.html", true);
        xmlhttp.send();
}

function pesq_extrato_lojas(numPage) {
    var IDEmpresaPesq = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("resultado").innerHTML = xmlhttp.responseText;
            //newDataTable('pesqvendas');

            $('.dataAtual').text(dataAtual);

            ajaxGet('api/financeiro/extrato-loja-periodo.xsjs?pageSize=500&page=' + numPage + '&idEmpresa=' + IDEmpresaPesq + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
                .then(retornoListaExtratoLoja)
                .catch((e) => { funcError(), console.log(e) });
        }
    };

    xmlhttp.open("GET", "financeiro_action_pesqextratoloja.html", true);
    xmlhttp.send();
}
 
function retornoListaExtratoLoja(respostaListaExtratoLojas) {
    
    var numPageAtual = parseInt(respostaListaExtratoLojas.page);
    var saldoAnterior = 0;
    var TotalQuebraCaixaCalc = 0;
    
        if (respostaListaExtratoLojas.data.length > 0){
            
            saldoAnterior = parseFloat(respostaListaExtratoLojas.data[0]['primeiraVendaSaldo']['SALDO']);
            TotalQuebraCaixaCalc = parseFloat(respostaListaExtratoLojas.data[0]['primeiraVendaSaldo']['TOTALQUEBRA']);
            
            saldoAnterior = parseFloat(saldoAnterior) + parseFloat(TotalQuebraCaixaCalc);
            
            $('#resultado').html(
                `<table id="" class="table table-bordered table-hover table-responsive-lg table-striped w-100" width="100%">
                    <thead>                                     
                        <tr>
                            <td colspan="9"><b>Extrato a partir do dia 11 de dezembro de 2020<b></td>
                        </tr>
                    </thead>
                    <tbody >
                        <tr class="table-primary">
                            <td colspan="3" style="text-align:right; font-size: 12px;"><b>Saldo Anterior</b></td>
                            <td></td>
                            <td></td>
                            <td></td>                                                    
                            <td style="text-align:right; font-size: 12px;"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                            <td colspan="2"></td>
                        </tr>
                        <tr>
                            <td colspan="9"></td>
                        </tr>
                        <tr>
                            <td colspan="9"></td>
                        
                    </tbody>
                    <tbody id="resultadoExtratoLoja">
                        <tr>
                            <th class="bg-primary-700" style="font-size: 12px;">Dt. Lanç.</th>
                            <th class="bg-primary-700" style="font-size: 12px;">Histórico</th>
                            <th class="bg-primary-700" style="font-size: 12px;">Pago A</th>
                            <th class="bg-primary-700" style="font-size: 12px;">Despesa</th>
                            <th class="bg-primary-700" style="font-size: 12px;">Débito</th>
                            <th class="bg-primary-700" style="font-size: 12px;">Crédito</th>
                            <th class="bg-primary-700" style="font-size: 12px;">Saldo</th>
                            <th class="bg-primary-700" style="font-size: 12px;">Situação</th>
                            <th class="bg-primary-700" style="font-size: 12px;">Opção</th>
                        </tr>
                    </tbody>
                </table>`);

            for (let i = 0; i < respostaListaExtratoLojas.data.length; i++) {
                let ret = respostaListaExtratoLojas.data[i];
                let valorTotalDinheiro = ret['venda']['VRRECDINHEIRO'];
                let dataExtrato = ret['venda']['DTHORAFECHAMENTOFORMATADA']; 
    
                saldoAnterior = parseFloat(saldoAnterior) + parseFloat(valorTotalDinheiro);
                
                if (i > 0) {
                    $('#resultadoExtratoLoja').append(
                        `<tr>
                                <td colspan="9"></td>
                            </tr>
                            <tr>
                                <td colspan="9"></td>
                            </tr>`);
                }
    
                $('#resultadoExtratoLoja').append(
                    `</tr> 
                            <tr class="table-success">
                            <td style="font-size: 12px;">` + dataExtrato + `</td>
                            <td style="font-size: 12px;">Mov. Dinheiro do Caixa ` + dataExtrato + `</td>
                            <td style="font-size: 12px;">Vendas Dinheiro</td>
                            <td></td>
                            <td style="text-align:right; font-size: 12px;"><b>0,00<b></td>
                            <td style="text-align:right; font-size: 12px;">
                            <b>` + mascaraValor(parseFloat(valorTotalDinheiro).toFixed(2)) + `</b></td>
                            <td style="text-align:right; font-size: 12px;"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                            <td style="text-align:right; font-size: 12px;"></td>
                            <td style="text-align:right; font-size: 12px;"></td>
                        </tr>`);
    
    
                if (ret['totalFaturas'].length > 0) {
                    let dataFatura = ret['totalFaturas'][0]['DTPROCESSAMENTOFORMATADA']; 
                    let valorTotalFatura = ret['totalFaturas'][0]['VRRECEBIDO'];
    
                    saldoAnterior = parseFloat(saldoAnterior) + parseFloat(valorTotalFatura);
                    
                    $('#resultadoExtratoLoja').append(
                        `</tr> 
                                <tr class="table-success">
                                <td style="font-size: 12px;">` + dataFatura + `</td>
                                <td style="font-size: 12px;">Mov. Fatura ` + dataFatura + `</td>
                                <td style="font-size: 12px;">Recebimento de Faturas</td>
                                <td></td>
                                <td style="text-align:right; font-size: 12px;"><b>0,00<b></td>
                                <td style="text-align:right; font-size: 12px;">
                                <b>` + mascaraValor(parseFloat(valorTotalFatura).toFixed(2)) + `</b></td>
                                <td style="text-align:right; font-size: 12px;"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                                <td style="text-align:right; font-size: 12px;"></td>
                                <td style="text-align:right; font-size: 12px;"></td>
                            </tr>`);
                }
                if (ret['despesas'].length > 0) {
                    for (let j = 0; j < ret['despesas'].length; j++) {
                        let dataDespesa = ret['despesas'][j]['DTDESPESAFORMATADA'];
                        let pagoA = ret['despesas'][j]['DSPAGOA'];
                        let historico = ret['despesas'][j]['DSHISTORIO'];
                        let nomeCategoria = ret['despesas'][j]['DSCATEGORIA'];
                        let valorDespesa = ret['despesas'][j]['VRDESPESA'];
    
                        saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorDespesa);
    
                        $('#resultadoExtratoLoja').append(
                            ` <tr class="table-danger">
                                    <td style="font-size: 12px;">` + dataDespesa + `</td>
                                    <td style="font-size: 12px;">` + historico + `</td>
                                    <td style="font-size: 12px;">` + pagoA + `</td>
                                    <td style="text-align:center; font-size: 12px;">` + nomeCategoria + `</td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                    <b>` + mascaraValor(parseFloat(valorDespesa).toFixed(2)) + `</b></td>
                                    <td style="text-align:right; font-size: 12px;"><b>0,00</b></td>
                                    <td style="text-align:right; font-size: 12px;"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                                    <td style="text-align:right; font-size: 12px;"></td>
                                    <td style="text-align:right; font-size: 12px;"></td>
                                </tr>`);
                    }
                }
                if (ret['adiantamentos'].length > 0) {
                    for (let j = 0; j < ret['adiantamentos'].length; j++) {
                        let dataDespesaAdiant = ret['adiantamentos'][j]['DTLANCAMENTOADIANTAMENTO'];
                        let pagoAAdiant = ret['adiantamentos'][j]['NOFUNCIONARIO'];
                        let historicoAdiant = 'Adiantamento de Salário';
                        let nomeCategoriaAdiant = ret['adiantamentos'][j]['DSMOTIVO'];
                        let valorDespesaAdiant = ret['adiantamentos'][j]['VRVALORDESCONTO'];
    
                        saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorDespesaAdiant);
    
                        $('#resultadoExtratoLoja').append(
                            ` <tr class="table-danger">
                                    <td style="font-size: 12px;">` + dataDespesaAdiant + `</td>
                                    <td style="font-size: 12px;">` + historicoAdiant + `</td>
                                    <td style="font-size: 12px;">` + pagoAAdiant + `</td>
                                    <td style="text-align:center; font-size: 12px;">` + nomeCategoriaAdiant + `</td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                    <b>` + mascaraValor(parseFloat(valorDespesaAdiant).toFixed(2)) + `</b></td>
                                    <td style="text-align:right; font-size: 12px;"><b>0,00</b></td>
                                    <td style="text-align:right; font-size: 12px;"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                                    <td style="text-align:right; font-size: 12px;"></td>
                                    <td style="text-align:right; font-size: 12px;"></td>
                                </tr>`);
                    }
                }
                if (ret['quebracaixa'].length > 0) {
                    for (let j = 0; j < ret['quebracaixa'].length; j++) {
                        let idMov = ret['quebracaixa'][j]['IDMOV'];
                        let dataMov = ret['quebracaixa'][j]['DTMOVCAIXA'];
                        let MovOperador = ret['quebracaixa'][j]['FUNCIONARIOMOV'];
                        let dinheiroVenda = ret['quebracaixa'][j]['VRFISICODINHEIRO'];
                        let dinheiroInformado = ret['quebracaixa'][j]['VRRECDINHEIRO'];
                        let dinheiroAjuste = ret['quebracaixa'][j]['VRAJUSTDINHEIRO'];
    

                    	if(parseFloat(dinheiroAjuste)>0){
                		    totalDinheiroInformado = parseFloat(dinheiroAjuste);
                		}else{
                		    totalDinheiroInformado = parseFloat(dinheiroInformado);
                		}
		    
		                TotalQuebraCaixa = parseFloat(totalDinheiroInformado) - parseFloat(dinheiroVenda);
		                
		                if(TotalQuebraCaixa>0){
		                    saldoAnterior = parseFloat(saldoAnterior) + parseFloat(TotalQuebraCaixa);
		                    tagQuebraDebito='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>0,00</b></td>';
		                    tagQuebraCredito='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>' + mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2)) + '</b></td>';
		                    tagQuebraSaldo='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>' + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '</b></td>';
		                }else{
		                    saldoAnterior = parseFloat(saldoAnterior) + (parseFloat(TotalQuebraCaixa));
		                    tagQuebraDebito='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>' + mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2)) + '</b></td>';
		                    tagQuebraCredito='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>0,00</b></td>';
		                    tagQuebraSaldo='<td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>' + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '</b></td>';
		                }
    
                        $('#resultadoExtratoLoja').append(
                            ` <tr class="table-primary">
                                    <td style="font-size: 12px;">` + dataMov + `</td>
                                    <td style="font-size: 12px;">Quebra Caixa Mov.: ` + idMov + `</td>
                                    <td colspan="2" style="font-size: 12px;">Operador:  ` + MovOperador + `</td>`
                                    +tagQuebraDebito+
                                    tagQuebraCredito+
                                    tagQuebraSaldo+
                                    `<td style="text-align:right; font-size: 12px;"></td>
                                    <td style="text-align:right; font-size: 12px;"></td>
                                </tr>`);
                    }
                }
                if (ret['totalDepositos'].length > 0) {
                    for (let j = 0; j < ret['totalDepositos'].length; j++) {
                        let idDeposito = ret['totalDepositos'][j]['IDDEPOSITOLOJA'];
                        let dataDeposito = ret['totalDepositos'][j]['DTDEPOSITOFORMATADA'];
                        let funcDeposito = ret['totalDepositos'][j]['FUNCIONARIO'];
                        let valorDeposito = ret['totalDepositos'][j]['VRDEPOSITO'];
                        let descricaoContaBanco = ret['totalDepositos'][j]['DSBANCO'];
                        let SituacaoDepositoLoja = ret['totalDepositos'][j]['STCANCELADO'];
                        let ConferenciaDepositoLoja = ret['totalDepositos'][j]['STCONFERIDO'];
                        let DocumentoDepositoLoja = ret['totalDepositos'][j]['NUDOCDEPOSITO'];
                        
                       
                        if(SituacaoDepositoLoja=='False' && (ConferenciaDepositoLoja=='False' || ConferenciaDepositoLoja == null || ConferenciaDepositoLoja =='')){
                            saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorDeposito);
                            tagDepositoAtivoBotao='<td></td>';
                        
                            
                        }else if(SituacaoDepositoLoja=='False' && (ConferenciaDepositoLoja=='True' && (ConferenciaDepositoLoja != null || ConferenciaDepositoLoja ==''))){
                            saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorDeposito);
                            tagDepositoAtivoBotao='<td></td>';
                        
                            
                        }else if(SituacaoDepositoLoja=='True' && (ConferenciaDepositoLoja=='False' || ConferenciaDepositoLoja == null || ConferenciaDepositoLoja =='')){
                            tagDepositoAtivoBotao='<td></td>';
                        
                            
                        }else if(SituacaoDepositoLoja=='True' && (ConferenciaDepositoLoja=='True' && (ConferenciaDepositoLoja != null || ConferenciaDepositoLoja ==''))){
                            tagDepositoAtivoBotao='<td></td>';
                          
                        }
    
    
                        if(ConferenciaDepositoLoja=='False' || ConferenciaDepositoLoja == null || ConferenciaDepositoLoja ==''){
                            tagDepositoConferidoBotao='<td style="text-align:center; font-size: 12px;"><label style="color: red;">Sem Conferir</label></td>';
                        }else{
                            tagDepositoConferidoBotao='<td style="text-align:center; font-size: 12px;"><label style="color: blue;">Conferido</label></td>';
                           
                        }
                        
                        $('#resultadoExtratoLoja').append(
                            `<tr class="table-warning">
                                    <td style="font-size: 12px;"><b>` + dataDeposito + `</b></td>
                                    <td style="font-size: 12px;"><b>` + funcDeposito + ` Dep. Dinh ` + dataDeposito + `</b></td>
                                    <td colspan="2" style="font-size: 12px;"><b>` + descricaoContaBanco + ` - ` + DocumentoDepositoLoja + `</b></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                    <b>` + mascaraValor(parseFloat(valorDeposito).toFixed(2)) + `</b></td>
                                    <td style="text-align:right; font-size: 12px;"><b>0,00</b></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>`
                                    +tagDepositoConferidoBotao+
                                    tagDepositoAtivoBotao+
                                    
                            `</tr>`);
                    }
                }
                if (ret['ajusteextrato'].length > 0) {
                    for (let j = 0; j < ret['ajusteextrato'].length; j++) {
                        let idAjuste = ret['ajusteextrato'][j]['IDAJUSTEEXTRATO'];
                        let dataAjuste = ret['ajusteextrato'][j]['DTCADASTROFORMATADA'];
                        let valorDebito = ret['ajusteextrato'][j]['VRDEBITO'];
                        let valorCredito = ret['ajusteextrato'][j]['VRCREDITO'];
                        let historicoAjuste = ret['ajusteextrato'][j]['HISTORICO'];
                        let SituacaoAjusteLoja = ret['ajusteextrato'][j]['STCANCELADO'];
        
                        if(SituacaoAjusteLoja=='False'){
                            if(valorCredito>0){
                                saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorCredito);
                            }else{
                                saldoAnterior = parseFloat(saldoAnterior) + parseFloat(valorDebito);
                            }
                            
                            tagAjusteAtivoBotao='<td style="text-align:center; font-size: 12px;"></td>';
                            tagAjusteSituacaoBotao='<td style="text-align:center; font-size: 12px;"><label style="color: blue;">Ativo</label></td>';
                        }else{
                            tagAjusteAtivoBotao='<td style="text-align:center; font-size: 12px;"></td>';
                            tagAjusteSituacaoBotao='<td style="text-align:center; font-size: 12px;"><label style="color: red;">Cancelado</label></td>';
                        }
        
                        $('#resultadoExtratoLoja').append(
                            `<tr class="table-secondary">
                                    <td style="font-size: 12px;"><b>` + dataAjuste + `</b></td>
                                    <td style="font-size: 12px;"><b>` + historicoAjuste + `</b></td>
                                    <td colspan="2" style="font-size: 12px;"><b>Ajuste de Extrato</b></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red"><b>` + mascaraValor(parseFloat(valorDebito).toFixed(2)) + `</b></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red"><b>` + mascaraValor(parseFloat(valorCredito).toFixed(2)) + `</b></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red"><b>` + saldoAnterior.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>`
                                    +tagAjusteSituacaoBotao+
                                    tagAjusteAtivoBotao+
                            `</tr>`);
                    }
                }
            }
            
        }
    
}

//////////////////Vouchers Emitdos////////////////////////////

function ListaVoucherEmitidos() {

    /*if(flagConferidoData != ''){
            Swal.fire({
    			type: "warning",
    			title: "Bloqueio de Dados",
    			html: "Seus Dados estão bloqueado até que o(s) CAIXA(S) seja(am) CONFIRMADO(S)!",
    			showConfirmButton: true,
    			timer: 15000
    		});
    }else{ */
        if (window.XMLHttpRequest) {
          // code for IE7+, Firefox, Chrome, Opera, Safari
          xmlhttp = new XMLHttpRequest();
        } else {
          // code for IE6, IE5
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        
        xmlhttp.onreadystatechange = function () {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
            
                $('.dataAtual').text(dataAtual);
                
                $('#dtconsultainicio').val(dataAtualCampo);
                $('#dtconsultafim').val(dataAtualCampo);
                
                $('#NVoucher').focus();
            
                $('.DescTituloVoucher').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Vouchers Emitidos`);
          }
        };
        xmlhttp.open("GET", "administrativo_action_listvoucher.html", true);
        xmlhttp.send();
    //}
}

function pesq_list_voucher() {

    var numerovoucher = $("#NVoucher").val().trim();
    var dtinic = $("#dtconsultainicio").val();
    var dtfim = $("#dtconsultafim").val();
    
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    $("#resultado").html(
      "<div align=\"center\">" +
      "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
      "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
      "</div>"
      );
   
   
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        //newDataTable('voucher');
        
            $('.dataAtual').text(dataAtual);

            $('.DescTituloVoucher').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Vouchers Emitidos`);

		    return	ajaxGet('api/resumo-voucher/detalhe-voucher.xsjs?id=' + numerovoucher + '&dataPesquisaInicio=' + dtinic+ '&dataPesquisaFim=' + dtfim)
				.then(retornoTableListVoucher)
				.catch((e) => { funcError(), console.log(e) });
				
      }
    };
    xmlhttp.open("GET", "administrativo_action_pesqvoucheremitido.html", true);
    xmlhttp.send();
}

function retornoTableListVoucher(voucherEmitido) {

	for (var i = 0; i < voucherEmitido.data.length; i++) {

		IDVoucher = voucherEmitido.data[i]['voucher']['IDVOUCHER'];
		DTVoucherIN = voucherEmitido.data[i]['voucher']['DTINVOUCHER'];
		DTVoucherOUT = voucherEmitido.data[i]['voucher']['DTOUTVOUCHER'];
		DSCaixaOrigem = voucherEmitido.data[i]['voucher']['DSCAIXAORIGEM'];
		DSCaixaDestino = voucherEmitido.data[i]['voucher']['DSCAIXADESTINO'];
		NuVoucher = voucherEmitido.data[i]['voucher']['NUVOUCHER'];
		VrVoucher = parseFloat(voucherEmitido.data[i]['voucher']['VRVOUCHER']);
		STAtivoVoucher = voucherEmitido.data[i]['voucher']['STATIVO'];
		STCanceladoVoucher = voucherEmitido.data[i]['voucher']['STCANCELADO'];
		EmpresaOrigem = voucherEmitido.data[i]['voucher']['EMPORIGEM'];
		EmpresaDestino = voucherEmitido.data[i]['voucher']['EMPDESTINO'];
		
        if(STAtivoVoucher=='True'){
            tagVoucherAtivo='<label style="text-align: center; color: blue; font-size: 11px;">ATIVO</label>';
        }else{
            tagVoucherAtivo='<label style="text-align: center; color: red; font-size: 11px;">USADO</label>';
        }
        
        tagButtonDetProdVoucher='<div class="btn-group btn-group-xs"> '+
            '<button type="button" class="btn btn-success btn-xs" title="Detalhar Produtos do Voucher" id="'+IDVoucher+'" onclick="modal_Detalhe_Voucher(this.id)" >Detalhar</button></div>';
            
        if(DTVoucherOUT==null){
            DTVoucherOUT='';
        }else{
            DTVoucherOUT=DTVoucherOUT; 
        }

        if(EmpresaDestino==null){
            EmpresaDestino='';
        }else{
            EmpresaDestino=EmpresaDestino; 
        }
        
		var tableVoucherLoja = $('#dt-basic-voucher').DataTable();

		tableVoucherLoja.row.add([
            `<label style="color: blue; font-size: 11px;">` + NuVoucher + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + EmpresaOrigem + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + DSCaixaOrigem + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + DTVoucherIN + `</label>`,
            `<label style="align: right; color: green; font-size: 11px;">` + mascaraValor(VrVoucher.toFixed(2)) + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + EmpresaDestino + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + DSCaixaDestino + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + DTVoucherOUT + `</label>`,
            tagVoucherAtivo,
		    tagButtonDetProdVoucher,
        ]).draw(false);
	}
}

function retornoListaVoucherDetalhe(respostaListaDetalheVoucher) {

	for (var i = 0; i < respostaListaDetalheVoucher.data.length; i++) {

		NuVoucherdet = respostaListaDetalheVoucher.data[i]['NUVOUCHER'];
		
		IDVoucher =  respostaListaDetalheVoucher.data[i]['IDVOUCHER'];

		NumCodBarra = respostaListaDetalheVoucher.data[i]['NUCODBARRAS'];
		DescProduto = respostaListaDetalheVoucher.data[i]['DSPRODUTO'];
		VrUnitario = parseFloat(respostaListaDetalheVoucher.data[i]['VRUNIT']);
		QTDProduto = respostaListaDetalheVoucher.data[i]['QTD'];

		VrTotalBruto = parseFloat(respostaListaDetalheVoucher.data[i]['VRTOTALBRUTO']);
		VrTotalDesconto = parseFloat(respostaListaDetalheVoucher.data[i]['VRDESCONTO']);
		VrTotalLiquido = parseFloat(respostaListaDetalheVoucher.data[i]['VRTOTALLIQUIDO']);
		SituacaoProduto = respostaListaDetalheVoucher.data[i]['STCANCELADO'];

		$('#resultListDetalheVoucher').append(
			`<tr>
                    <td><label style="color: blue;">` + NumCodBarra +`</label></td>
                    <td><label style="color: blue;">` + DescProduto +`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrUnitario.toFixed(2)) +`</label></td>
                    <td><label style="color: blue;">` + QTDProduto +`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrTotalBruto.toFixed(2)) +`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrTotalDesconto.toFixed(2)) +`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrTotalLiquido.toFixed(2)) +`</label></td>
            </tr>`
		);
	}

	$('.textoCabecalhoDetalheVoucher').html(
		`<h2>
            Lista de Produtos do Voucher Nº <span class="fw-300"><i>${NuVoucherdet}</i></span>
        </h2>`
	);
}

function modal_Detalhe_Voucher(id) {

	$.get('administrativo_action_detvouchermodal.html', function(res) {

		$('#resulmodaldetvoucher').html(res);
		$("#detVoucher").modal('show');

	    return	ajaxGet('api/administrativo/detalhe-prod-voucher.xsjs?idvoucher=' + id)
			.then(retornoListaVoucherDetalhe)
			.catch((e) => { funcError(), console.log(e) });
	})

}

//////////////////// ESTRUTURA MERCADOLOGICA ////////////////////
// Leandro Massafera - 25/04/2022
function proximaListaFornecedor(numPage){
    idMarca = $("#idmarcaproduto").val();
    ajaxGet('api/comercial/fornecedor-produto.xsjs?page='+numPage+'&idMarca='+idMarca)
               .then(retornoListaFornecedor)
               .catch((e) => { funcError(), console.log(e) });
}

function proximaListaMarca(numPage){
   idSubGrupo = $("#idgrade").val();
   ajaxGet('api/comercial/marca-produto.xsjs?page='+numPage+'&idSubGrupo='+idSubGrupo)
               .then(retornoListaMarca)
               .catch((e) => { funcError(), console.log(e) });
   
}

function retornoListaFornecedor(respostaListaFornecedores) { 
   listaFornecedores = respostaListaFornecedores.data;
   numPage = parseInt(respostaListaFornecedores.page);
   if(numPage === 1){
       $("#idforn").empty();
       $('#idforn').append(
           `<option value="">Selecione ...</option>`
       );
   }
   
   for (var i = 0; i < respostaListaFornecedores.data.length; i++) {

       IDFornecedor = respostaListaFornecedores.data[i]['ID_FORNECEDOR'];
       DSFornecedor = respostaListaFornecedores.data[i]['FORNECEDOR'];
       NrCpfCnpj = respostaListaFornecedores.data[i]['CNPJ_CPF'];
           $('#idforn').append(
               `<option value="` + IDFornecedor + `"> ` + NrCpfCnpj + ` - ` + DSFornecedor + `</option>`
           );
   }
   if(respostaListaFornecedores.data.length > 0){
       proximaListaFornecedor(numPage + 1);
   }
   
}

function retornoListaGrupo(respostaListaGrupos) { 
   listaGrupos = respostaListaGrupos.data;
   $("#idgrupograde").empty();
   $("#idgrade").empty();
   $("#idmarcaproduto").empty();
   $("#idforn").empty();
   $('#idgrupograde').append(
       `<option value="">Selecione ...</option>`
   );
   for (var i = 0; i < respostaListaGrupos.data.length; i++) {

       IDGrupo = respostaListaGrupos.data[i]['ID_GRUPO'];
       DSGrupo = respostaListaGrupos.data[i]['GRUPO'];

           $('#idgrupograde').append(
               `<option value="` + IDGrupo + `"> ` + DSGrupo + `</option>`
           );
   }
   
}

function retornoListaSubGrupo(respostaListaSubGrupos) { 
   listaSubGrupos = respostaListaSubGrupos.data;
   
   $("#idgrade").empty();
   $("#idmarcaproduto").empty();
   $("#idforn").empty();
   pesqListaMarcaPorSubGrupo();
   pesqListaFornecedorPorMarca();
   IDGrupoAnterior = '';
   codHtml='';
   
   for (var i = 0; i < respostaListaSubGrupos.data.length; i++) {

       IDSubGrupo = respostaListaSubGrupos.data[i]['ID_ESTRUTURA'];
       DSSubGrupo = respostaListaSubGrupos.data[i]['ESTRUTURA'];
       IDGrupo = respostaListaSubGrupos.data[i]['ID_GRUPO'];
       
       var DSgrupoGrade = '';
        if(IDGrupo === '1'){
            DSgrupoGrade = 'Verão';
        }else if(IDGrupo === '2'){
            DSgrupoGrade = 'Calçados/Acessórios';
        }else if(IDGrupo === '3'){
            DSgrupoGrade = 'Cama/Mesa/Banho';
        }else if(IDGrupo === '4'){
            DSgrupoGrade = 'Utilidades Do Lar';
        }else if(IDGrupo === '5'){
            DSgrupoGrade = 'Diversos';
        }else if(IDGrupo === '6'){
            DSgrupoGrade = 'Artigos Esportivos';
        }else if(IDGrupo === '7'){
            DSgrupoGrade = 'Cosméticos';
        }else if(IDGrupo === '8'){
            DSgrupoGrade = 'Acessórios';
        }else if(IDGrupo === '9'){
            DSgrupoGrade = 'Peças Íntimas';
        }else if(IDGrupo === '10'){
            DSgrupoGrade = 'Inverno';
        }
       
       if(IDGrupo === IDGrupoAnterior){
           codHtml = codHtml + `<option value="` + IDSubGrupo + `"> ` + DSSubGrupo + `</option>`;
       }else{
           if(IDGrupoAnterior !== ''){
               codHtml = codHtml +`</optgroup>`;
           }
           codHtml = codHtml +`<optgroup label="`+DSgrupoGrade.toUpperCase()+`">`
           codHtml = codHtml +`<option value="` + IDSubGrupo + `"> ` + DSSubGrupo + `</option>`
       }
           
       IDGrupoAnterior = IDGrupo;
   }
   
   codHtml = codHtml + '';
   $('#idgrade').html(codHtml);
}

function retornoListaMarca(respostaListaMarca) { 
   listaMarca = respostaListaMarca.data;
   numPage = parseInt(respostaListaMarca.page);
   if(numPage === 1){
       $("#idmarcaproduto").empty();
       $("#idforn").empty();
       pesqListaFornecedorPorMarca();
       $('#idmarcaproduto').append(
           `<option value="">Selecione ...</option>`
       );
   }
   for (var i = 0; i < respostaListaMarca.data.length; i++) {

       IDMarca = respostaListaMarca.data[i]['ID_MARCA'];
       DSMarca = respostaListaMarca.data[i]['MARCA'];

           $('#idmarcaproduto').append(
               `<option value="` + IDMarca + `"> ` + DSMarca + `</option>`
           );
   }
   if(respostaListaMarca.data.length > 0){
       proximaListaMarca(numPage + 1);
   }
   
}

function pesqListaSubGrupoPorGrupo(){
   idGrupo = $("#idgrupograde").val();
   ajaxGet('api/comercial/subgrupo-produto.xsjs?idGrupo='+idGrupo)
           .then(retornoListaSubGrupo)
           .catch((e) => { funcError(), console.log(e) });
}

function pesqListaMarcaPorSubGrupo(){
   idSubGrupo = $("#idgrade").val();
   ajaxGet('api/comercial/marca-produto.xsjs?idSubGrupo='+idSubGrupo)
           .then(retornoListaMarca)
           .catch((e) => { funcError(), console.log(e) });
}

function pesqListaFornecedorPorMarca(){
   idMarca = $("#idmarcaproduto").val();
   ajaxGet('api/comercial/fornecedor-produto.xsjs?idMarca='+idMarca)
           .then(retornoListaFornecedor)
           .catch((e) => { funcError(), console.log(e) });
}
//////////////////// FIM ESTRUTURA MERCADOLOGICA ////////////////////

//////////////////// RELATÓRIO ESTOQUE ////////////////////
// Leandro Massafera - 25/04/2022
function ListaEstoque(){

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
 
            $("#idloja").select2();

            //$('#dtconsultainicio').val(dataAtualCampo);
            //$('#dtconsultafim').val(dataAtualCampo);

            $("#idgrupograde").select2();
            $("#idgrade").select2();
            $("#idforn").select2(); 
            $("#idmarcaproduto").select2(); 
            
            ajaxGet('api/informatica/empresa.xsjs')
                .then(retornoListaEmpresasSelect)
                .catch((e) => { funcError(), console.log(e) });
                
            ajaxGet('api/comercial/fornecedor-produto.xsjs')
                .then(retornoListaFornecedor)
                .catch((e) => { funcError(), console.log(e) });
                
            ajaxGet('api/comercial/grupo-produto.xsjs')
                .then(retornoListaGrupo)
                .catch((e) => { funcError(), console.log(e) });
                
            ajaxGet('api/comercial/subgrupo-produto.xsjs')
                .then(retornoListaSubGrupo)
                .catch((e) => { funcError(), console.log(e) });
                
            ajaxGet('api/comercial/marca-produto.xsjs')
                .then(retornoListaMarca)
                .catch((e) => { funcError(), console.log(e) });
                
            // EVENTOS SELECT`S 
            var $eventSelectGrupo = $("#idgrupograde");
            $eventSelectGrupo.on("change", function (e) { pesqListaSubGrupoPorGrupo(); });
            var $eventSelectSubGrupo = $("#idgrade");
            $eventSelectSubGrupo.on("change", function (e) { pesqListaMarcaPorSubGrupo(); });
            var $eventSelectMarca = $("#idmarcaproduto");
            $eventSelectMarca.on("change", function (e) { pesqListaFornecedorPorMarca(); });
    
        } 
    };
    xmlhttp.open("GET", "administrativo_action_estoque.html", true);
    xmlhttp.send();
}

/// ESTOQUE ATUAL
function estoqueatual(numPage){

    contador = 0;
    dataRetorno  = [];
    var idempresa    = $("#idloja").val();
    var idgrupo      = $("#idgrupograde").val();
    var idsubgrupo   = $("#idgrade").val();
    var idmarca      = $("#idmarcaproduto").val();
    var idfornecedor = $("#idforn").val();
    var descproduto  = $("#descProduto").val();
    var dtinicial    = '';
    var dtfinal      = '';
    var stativo      = 'True';

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("resultado").innerHTML = xmlhttp.responseText;

            ajaxGet('api/administrativo/inventariomovimento.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&idmarca=' + idmarca + '&idfornecedor=' + idfornecedor + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial + '&dtfinal=' + dtfinal + '&stativo=' + stativo)
                .then(retornoListaEstoqueAtual)
                .catch((e) => { funcError(), console.log(e) });
        }
    };

    xmlhttp.open("GET", "administrativo_action_estoqueatual.html", true);
    xmlhttp.send();
}

function chamarProximaListaEstoqueAtual(numPage){
    
    var idempresa    = $("#idloja").val();
    var idgrupo      = $("#idgrupograde").val();
    var idsubgrupo   = $("#idgrade").val();
    var idmarca      = $("#idmarcaproduto").val();
    var idfornecedor = $("#idforn").val();
    var descproduto  = $("#descProduto").val();
    var dtinicial    = '';
    var dtfinal      = '';
    var stativo      = 'True';

    ajaxGet('api/administrativo/inventariomovimento.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&idmarca=' + idmarca + '&idfornecedor=' + idfornecedor + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial + '&dtfinal=' + dtfinal + '&stativo=' + stativo)
        .then(retornoListaEstoqueAtual)
        .catch((e) => { funcError(), console.log(e) });
        	
    $("#resultado").html(
        "<div align=\"center\">" +
            "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
            "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
    );
}

function retornoListaEstoqueAtual(respostaListaEstoqueAtual) {

    var numPageAtual = parseInt(respostaListaEstoqueAtual.page);

    if(respostaListaEstoqueAtual.data.length != 0){
        for (var i=0; i < respostaListaEstoqueAtual.data.length; i++) { 
            contador ++;
            var registro = respostaListaEstoqueAtual.data[i];
            
            cCodBarras  = registro.NUCODBARRAS;
            IdProduto    = registro.IDPRODUTO;
            cProduto    = registro.DSPRODUTO;
            cFornecedor = registro.IDRAZAO_SOCIAL_FORNECEDOR + ' - ' + registro.RAZAO_SOCIAL_FORNECEDOR; 
            nEstoque    = registro.QTDFINAL;
            vCusto      = parseFloat(registro.PRECOCUSTO).toLocaleString('pt-BR', { minimumFractionDigits: 2});
            vVenda      = parseFloat(registro.PRECOVENDA).toLocaleString('pt-BR', { minimumFractionDigits: 2});
            vTotalCusto = parseFloat(nEstoque * parseFloat(registro.PRECOCUSTO)).toFixed(2);
            vTotalVenda = parseFloat(nEstoque * parseFloat(registro.PRECOVENDA)).toFixed(2);
            nMarkup     = parseFloat(((parseFloat(registro.PRECOVENDA) * 100) / parseFloat(registro.PRECOCUSTO)) - 100).toFixed(2);
            skuVtex     = registro.SKUVTEX;
            
            dataRetorno.push( [contador,
                            IdProduto,
                            skuVtex,
                            cCodBarras,
                            cProduto,
                            cFornecedor,
                            nEstoque,
                            vCusto,
                            vVenda,
                            vTotalCusto,
                            vTotalVenda,
                            nMarkup
                            ])
        }
        
        chamarProximaListaEstoqueAtual(numPageAtual + 1); 
    }else{
         $('#resultado').html(
            `<table id="dt-basic-estoque-atual" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>ID Produto</th>
                        <th>SKU Vtex</th>
                        <th>Código Barras</th>
                        <th>Produto</th>
                        <th>Fornecedor</th>
                        <th>Estoque</th>
                        <th>Custo</th>
                        <th>Venda</th>
                        <th>Total Custo</th>
                        <th>Total Venda</th>
                        <th>Markup %</th>
                    </tr>
                </thead>
                <tbody id="resultadoEstoqueAtual">
                </tbody>
                <tfoot id="totalresultadoEstoqueAtual" class="thead-themed">
                    <th>#</th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tfoot>
            </table>`
        );
	   
	    $('#dt-basic-estoque-atual').DataTable( {
	        data: dataRetorno,
            "footerCallback": function ( row, data, start, end, display ) {
            var api = this.api(), data;
 
            // Remove the formatting to get integer data for summation
            var intVal = function ( i ) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '')*1 :
                    typeof i === 'number' ?
                        i : 0;
            };
 
            // Total over all pages
            totalEstoque = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalGeralCusto = api.column( 9 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalGeralVenda = api.column( 10 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            //totalMarkup = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Total over this page
            pageTotalEstoque = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalGeralCusto = api.column( 9, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalGeralVenda = api.column( 10, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            //pageTotalMarkup = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Update footer
            $( api.column( 6 ).footer() ).html(pageTotalEstoque +' ('+ totalEstoque +' total )');
            $( api.column( 9 ).footer() ).html(pageTotalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 10 ).footer() ).html(pageTotalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            //$( api.column( 8 ).footer() ).html(pageTotalMarkup.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalMarkup.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
        },
    
            
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
}

/// ESTOQUE ROTATIVIDADE
function estoquerotatividade(numPage){

    dataRetorno  = [];
    contador = 0;

    var idempresa    = $("#idloja").val();
    var idgrupo      = $("#idgrupograde").val();
    var idsubgrupo   = $("#idgrade").val();
    var idmarca      = $("#idmarcaproduto").val();
    var idfornecedor = $("#idforn").val();
    var descproduto  = $("#descProduto").val();
    var dtinicial    = $("#dtconsultainicio").val();
    var dtfinal      = $("#dtconsultafim").val();
    var stativo      = '';

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("resultado").innerHTML = xmlhttp.responseText;

            ajaxGet('api/administrativo/inventariomovimento.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&idmarca=' + idmarca + '&idfornecedor=' + idfornecedor + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial + '&dtfinal=' + dtfinal + '&stativo=' + stativo)
                .then(retornoListaEstoqueRotatividade)
                .catch((e) => { funcError(), console.log(e) });
        }
    };

    xmlhttp.open("GET", "administrativo_action_estoquerotatividade.html", true);
    xmlhttp.send();
}

function chamarProximaListaEstoqueRotatividade(numPage){
    
    var idempresa    = $("#idloja").val();
    var idgrupo      = $("#idgrupograde").val();
    var idsubgrupo   = $("#idgrade").val();
    var idmarca      = $("#idmarcaproduto").val();
    var idfornecedor = $("#idforn").val();
    var descproduto  = $("#descProduto").val();
    var dtinicial    = $("#dtconsultainicio").val();
    var dtfinal      = $("#dtconsultafim").val();
    var stativo      = '';

    ajaxGet('api/administrativo/inventariomovimento.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&idmarca=' + idmarca + '&idfornecedor=' + idfornecedor + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial + '&dtfinal=' + dtfinal + '&stativo=' + stativo)
        .then(retornoListaEstoqueRotatividade)
        .catch((e) => { funcError(), console.log(e) });
        	
    $("#resultado").html(
        "<div align=\"center\">" +
            "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
            "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
    );
}

function retornoListaEstoqueRotatividade(respostaListaEstoqueRotatividade) {

    var numPageAtual = parseInt(respostaListaEstoqueRotatividade.page);

    if(respostaListaEstoqueRotatividade.data.length != 0){
        for (var i=0; i < respostaListaEstoqueRotatividade.data.length; i++) { 
            contador ++;
            var registro = respostaListaEstoqueRotatividade.data[i];
            
            cProduto          = ': ' + registro.NUCODBARRAS + ' - ' + registro.DSPRODUTO + ' / Custo R$ ' + parseFloat(registro.PRECOCUSTO).toLocaleString('pt-BR', { minimumFractionDigits: 2}) + ' - Venda R$ ' + parseFloat(registro.PRECOVENDA).toLocaleString('pt-BR', { minimumFractionDigits: 2});
            DataMovimento     = registro.DATAMOVIMENTO;
            QtdInicio         = registro.QTDINICIO;
            QtdEntrada        = registro.QTDENTRADA;
            QtdEntradaVoucher = registro.QTDENTRADAVOUCHER;
            QtdSaida          = registro.QTDSAIDA;
            QtdSaidaTransf    = registro.QTDSAIDATRANSFERENCIA;
            QtdRetAjustePed   = registro.QTDRETORNOAJUSTEPEDIDO;
            QtdAjusteBalanco  = registro.QTDAJUSTEBALANCO;
            QtdFinal          = registro.QTDFINAL;

            dataRetorno.push( [cProduto,
                            DataMovimento,
                            QtdInicio,
                            QtdEntrada,
                            QtdEntradaVoucher,
                            QtdSaida,
                            QtdSaidaTransf,
                            QtdRetAjustePed,
                            QtdAjusteBalanco,
                            QtdFinal
                            ])
        }
        
        chamarProximaListaEstoqueRotatividade(numPageAtual + 1); 
    }else{
         $('#resultado').html(
            `<table id="dt-basic-estoque-rotatividade" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>Produto</th>
                        <th>Data Movimento</th>
                        <th>Qtd Início</th>
                        <th>Qtd Entrada</th>
                        <th>Qtd Entrada Voucher</th>
                        <th>Qtd Saída</th>
                        <th>Qtd Saída Transf.</th>
                        <th>Qtd Ret. Ajuste Pedido</th>
                        <th>Qtd Ajuste Balanço</th>
                        <th>Qtd Final</th>
                    </tr>
                </thead>
                <tbody id="resultadoEstoqueRotatividade">
                </tbody>
                <tfoot id="totalresultadoEstoqueRotatividade" class="thead-themed">
                    <th>#</th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tfoot>
            </table>`
        );
	   
        var groupColumn = 0;
	    $('#dt-basic-estoque-rotatividade').DataTable( {
	        data: dataRetorno,
            
            "columnDefs": [
                { "visible": false, "targets": groupColumn }
            ],
            "order": [[ groupColumn, 'asc' ],[ 1, 'asc' ]],

            "drawCallback": function ( settings ) {
                var api = this.api();
                var rows = api.rows( {page:'current'} ).nodes();
                var last=null;
     
                api.column(groupColumn, {page:'current'} ).data().each( function ( group, i ) {
                    if ( last !== group ) {
                        $(rows).eq( i ).before(
                            '<tr class="group"><td colspan="10"><b>'+group+'</b></td></tr>'
                        );
     
                        last = group;
                    }
                } );
            },

            "footerCallback": function ( row, data, start, end, display ) {
            var api = this.api(), data;
 
            // Remove the formatting to get integer data for summation
            var intVal = function ( i ) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '')*1 :
                    typeof i === 'number' ?
                        i : 0;
            };
 
            // Total over all pages
            totalEntrada        = api.column( 3 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalEntradaVoucher = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalSaida          = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalSaidaTransf    = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalRetAjustePed   = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalAjusteBalanco  = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Total over this page
            pageTotalEntrada        = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalEntradaVoucher = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalSaida          = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalSaidaTransf    = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalRetAjustePed   = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalAjusteBalanco  = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Update footer
            $( api.column( 3 ).footer() ).html(pageTotalEntrada +' ('+ totalEntrada +' total )');
            $( api.column( 4 ).footer() ).html(pageTotalEntradaVoucher +' ('+ totalEntradaVoucher +' total )');
            $( api.column( 5 ).footer() ).html(pageTotalSaida +' ('+ totalSaida +' total )');
            $( api.column( 6 ).footer() ).html(pageTotalSaidaTransf +' ('+ totalSaidaTransf +' total )');
            $( api.column( 7 ).footer() ).html(pageTotalRetAjustePed +' ('+ totalRetAjustePed +' total )');
            $( api.column( 8 ).footer() ).html(pageTotalAjusteBalanco +' ('+ totalAjusteBalanco +' total )');
            
            //$( api.column( 8 ).footer() ).html(pageTotalMarkup.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalMarkup.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
        },
    
            
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        $('#dt-basic-estoque-rotatividade tbody').on( 'click', 'tr.group', function () {
            var currentOrder = table.order()[0];
            if ( currentOrder[0] === groupColumn && currentOrder[1] === 'asc' ) {
                table.order( [ groupColumn, 'desc' ] ).draw();
            }
            else {
                table.order( [ groupColumn, 'asc' ] ).draw();
            }
        } );
    }
}
//////////////////// FIM RELATÓRIO ESTOQUE ////////////////////

// Função que realiza a Prévia do Balanco
function NovoPreviaBalanco(id){

    idchave = id.split(":");
    idresumoPreviaBalanco = idchave[0];
    idempresaPreviaBalanco = idchave[1];
    processaPreviaBalanco = idchave[2];
    diferencaPreviaBalanco = idchave[3];
    stconsolidado = idchave[4];
    btnconsolidarativo = processaPreviaBalanco;

    numPage = 1;
    dataRetornoPreviaBalanco = [];

    $("#resultadoprevia").html(
        "<div align=\"center\">" +
        "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
        "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
    );

    $.get('administrativo_action_previabalanco_modal.html', function(res) {

        $('#resulmodalpreviabalanco').html(res);
        $("#previaBalanco").modal('show');
        $('#previaBalanco').on('shown.bs.modal', function() {});
        
        $('#btnconsolidarbalanco').prop('disabled', true);
        $('#idconsolidar').val(idresumoPreviaBalanco + ':' + idempresaPreviaBalanco);

        ajaxGet('api/administrativo/novo-previa-balanco.xsjs?page=' + numPage + '&id=' + idresumoPreviaBalanco + '&idempresa=' + idempresaPreviaBalanco + '&processa=' + processaPreviaBalanco + '&diferenca=' + diferencaPreviaBalanco)
            .then(NovoretornoListaPreviaBalanco)
            .catch((e) => { funcError(), console.log(e) });
    })

}

function NovoretornoListaPreviaBalanco(respostaListaPreviaBalanco) {
                    
    var numPageAtual = parseInt(respostaListaPreviaBalanco.page);
    processaPreviaBalanco = 0;

    if(respostaListaPreviaBalanco.data.length != 0){
        for (var i=0; i < respostaListaPreviaBalanco.data.length; i++) { 
            contador ++;
            var registro = respostaListaPreviaBalanco.data[i];
            
            IdProduto    = registro.IDPRODUTO;
            NumResumo    = registro.IDRESUMOBALANCO;
            CodigoBarras = registro.NUCODBARRAS;
            DescProduto  = registro.DSNOME;
            Estoque      = registro.QTDFINAL;
            Balanco      = registro.QTD;
            Sobra        = registro.QTDSOBRA;
            Falta        = registro.QTDFALTA;
            ValorVenda   = parseFloat(registro.PRECOVENDA); //.toLocaleString('pt-BR', { minimumFractionDigits: 2});
            ValorTotal   = parseFloat(registro.TOTALVENDA); //.toLocaleString('pt-BR', { minimumFractionDigits: 2});

            dataRetornoPreviaBalanco.push( [IdProduto,
                                CodigoBarras,
                                DescProduto,
                                Estoque,
                                Balanco,
                                Sobra,
                                Falta,
                                ValorVenda,
                                ValorTotal
                                ]);
        }
        
        NovochamarProximaListaPreviaBalanco(numPageAtual + 1); 
    }
    else{
        if(btnconsolidarativo === '1' && stconsolidado != 'True'){
            $('#btnconsolidarbalanco').prop('disabled', false);
        }
        $('#resulmodalpreviabalanco').html(
            `<table id="dt-basic-previa-balanco" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>Produto</th>
                            <th>Código Barras</th>
                            <th>Descrição</th>
                            <th>Estoque</th>
                            <th>Balanço</th>
                            <th>Sobra</th>
                            <th>Falta</th>
                            <th>R$ Venda</th>
                            <th>R$ Total</th>
                        </tr>
                    </thead>
                    <tbody id="resulmodalpreviabalanco">
                    </tbody>
                    <tfoot class="thead-themed totalPreviaBalanco">
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tfoot>
                </table>`
        );
	   
	   $('#dt-basic-previa-balanco').DataTable( {
            data: dataRetornoPreviaBalanco,
            "columnDefs": [
                { "width": "05%", "targets": 0 },
                { "width": "10%", "targets": 1 },
                { "width": "15%", "targets": 2 },
                { "width": "10%", "targets": 3 },
                { "width": "10%", "targets": 4 },
                { "width": "10%", "targets": 5 },
                { "width": "10%", "targets": 6 },
                { "width": "15%", "targets": 7 },
                { "width": "15%", "targets": 8 }
            ],
            "footerCallback": function ( row, data, start, end, display ) {
                var api = this.api(), data;
     
                // Remove the formatting to get integer data for summation
                var intVal = function ( i ) {
                    return typeof i === 'string' ?
                        i.replace('.','').replace(',','.').replace(/[\$,]/g, '')*1 :
                        typeof i === 'number' ?
                        i : 0;
                };
     
                // Total over all pages
                TotalEstoque = api.column( 3 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalBalanco = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalSobra = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalFalta = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalVenda = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                TotalGeral = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

                // Total over this page
                pageTotalEstoque = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalBalanco = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalSobra = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalFalta = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVenda = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalGeral = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

                // Update footer
                $( api.column( 3 ).footer() ).html(pageTotalEstoque +' ('+ TotalEstoque +' Total )');
                $( api.column( 4 ).footer() ).html(pageTotalBalanco +' ('+ TotalBalanco +' Total )');
                $( api.column( 5 ).footer() ).html(pageTotalSobra +' ('+ TotalSobra +' Total )');
                $( api.column( 6 ).footer() ).html(pageTotalFalta +' ('+ TotalFalta +' Total )');
                $( api.column( 7 ).footer() ).html(pageTotalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ TotalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' Total )');
                $( api.column( 8 ).footer() ).html(pageTotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ TotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' Total )');
            },

            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
}

function NovochamarProximaListaPreviaBalanco(numPage){

    ajaxGet('api/administrativo/novo-previa-balanco.xsjs?page=' + numPage + '&id=' + idresumoPreviaBalanco + '&idempresa=' + idempresaPreviaBalanco + '&processa=' + processaPreviaBalanco + '&diferenca=' + diferencaPreviaBalanco)
        .then(NovoretornoListaPreviaBalanco)
        .catch((e) => { funcError(), console.log(e) });
        	
}

// ==================================== INICIO ROTINA BALANÇO LOJA AVULSO ====================================================== //
/*
    Autor_Atualização: Hendryw Deyvison
    Data_Atualização: 30/10/2024
*/
async function ListaBalancoAvulso() {
    try{
        animationLoadingStart();

        await $.get("administrativo_action_listbalancoavulso.html", (respHtml)=>{
            $('#js-page-content').html(respHtml);

            $("#dsDesc").val("COLETOR WEB - " + NomeFuncionarioLogin);

            $('.DescTituloListaVendas').html(
                `<i class='subheader-icon fal fa-chart-area'></i> Lista de Balanços - <span class='fw-300'></span>`
            );

        }).fail((error) => { throw error });

        $("#idloja").select2();


        await ajaxGetAllData('api/empresa.xsjs')
            .then(retornoListaEmpresasSelect)
            .catch((e) => { throw error });

        animationLoadingStop();

    } catch (error){
        console.log(error);
        msgError();
    }
   
}

function abrirPesqProduto() {

    nIdLojaOrigem = parseInt($("#idloja").val());

    if (nIdLojaOrigem === 0) {
        return msgInfo('Atenção!', 'Favor selecionar a loja!').then(()=>{
            setTimeout(()=>$("#idloja").select2('open'), 400)});
    }

    $('#pesqProduto').on('keypress', (e) => { if (e.keyCode == 13) pesquisarProduto() }).focus();

    $("#abrirpesqproduto").modal('show');
}

function calcularTotaisTabelaBalacoAvulso(qtd, vrCusto, vrVenda, modo = 'somar') {
    let currentTotalQtd = Number($('#qtdTotalProdutos').text());
    let currentTotalVrCusto = Number(($('#vlTotalAcumulado').text().replaceAll('R$', '').replaceAll('.', '')).replace(',', '.'));
    let currentTotalVrVenda = Number(($('#vlTotalItens').text().replaceAll('R$', '').replaceAll('.', '')).replace(',', '.'));

    if (modo !== 'somar') {
        currentTotalQtd -= qtd;
        currentTotalVrCusto -= (qtd * vrCusto);
        currentTotalVrVenda -= (qtd * vrVenda);
    } else {
        currentTotalQtd += qtd;
        currentTotalVrCusto += (qtd * vrCusto);
        currentTotalVrVenda += (qtd * vrVenda);
    }


    $('#vlTotalAcumulado').text(maskValorEmBRL(currentTotalVrCusto));
    $('#vlTotalItens').text(maskValorEmBRL(currentTotalVrVenda));
    $('#qtdTotalProdutos').text(currentTotalQtd);
}

// Salvar o Balanço Avulso
async function salvarbalancoavulso(dados, modoUpdate = true) {
    try {
        animationLoadingStart('Enviando/Salvando dados, aguarde...', 300, false);

        if (modoUpdate) {
            listardetalhebalanco = 0;

            await ajaxPut("api/administrativo/detalhe-balanco-avulso.xsjs", dados)
                .catch((error) => { throw error });

        } else {

            await ajaxPost("api/administrativo/detalhe-balanco-avulso.xsjs", [dados])
                .catch((error) => { throw error });
        }

        animationLoadingStop()

        //$('#descProduto').focus();
    } catch (error) {
        console.log(error);
        msgError('Erro ao tentar salvar os dados, recarregue e tente novamente!');
    }
}

// Adiciona o produto do modal na tabela do balanço avulso
async function confirmarProduto(element) {
    try {
        let { id } = element;
        let tabelaresultado = $('#dt-basic-produto-modal').DataTable();
        let trTableModal = $(element).closest('tr');
        let indexTableModal = tabelaresultado.row(trTableModal).index();
        let newRowTableModal = tabelaresultado.row(indexTableModal);
        let qtdDigitada = parseInt($('#qtdProduto').val() || 1);
        let cDescColetor = $("#dsDesc").val();
        let nIdEmpresa = parseInt($("#idloja").val());
        let modoUpdate = false;
        let nPrecoCusto = 0;
        let nPrecoVenda = 0;
        let qtdProduto = 0;
        let newRowTable;
        let dados;
        let idProdutoTableModal = newRowTableModal.cell(indexTableModal, 0).data();

        if (idProdutoTableModal == id) {
            let cCodProduto = newRowTableModal.cell(indexTableModal, 0).data();
            let cCodBarras = newRowTableModal.cell(indexTableModal, 1).data();
            let cDescProduto = newRowTableModal.cell(indexTableModal, 2).data();

            nPrecoCusto = Number(newRowTableModal.cell(indexTableModal, 3).data());
            nPrecoVenda = Number(newRowTableModal.cell(indexTableModal, 4).data());

            let BtnOpcao = `
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${id}" onclick="diminuirProduto(this)"><i class="fal fa-minus"></i></button>
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${id}" onclick="excluirProduto(this)"><i class="fal fa-trash"></i></button>
    `;

            newRowTable = [
                cCodProduto,
                cCodBarras,
                cDescProduto,
                nPrecoCusto,
                nPrecoVenda,
                qtdDigitada,
                BtnOpcao
            ];

            dados = {
                "IDEMPRESA": nIdEmpresa
                , "NUMEROCOLETOR": IDFuncionarioLogin
                , "DSCOLETOR": cDescColetor
                , "IDPRODUTO": cCodProduto
                , "CODIGODEBARRAS": cCodBarras
                , "DSPRODUTO": cDescProduto
                , "TOTALCONTAGEMGERAL": parseInt(qtdDigitada)
                , "PRECOCUSTO": Number(nPrecoCusto)
                , "PRECOVENDA": Number(nPrecoVenda)
                , "STCANCELADO": 'False'
                , "INSBALANCO": 0
            };

        }

        $("#abrirpesqproduto").modal('hide');

        //Verifica e insere o produto na tabela
        let myTable = $('#tabelaprodutos').DataTable();
        let trMyTable = $('#' + id).closest('tr');
        let indexMyTable = myTable.row(trMyTable).index();
        let rowMyTable = myTable.row(indexMyTable);
        let idProduto = rowMyTable.cell(indexMyTable, 0).data() || '';

        if (idProduto == id) {
            qtdProduto = Number(rowMyTable.cell(indexMyTable, 5).data()) + qtdDigitada;

            dados.TOTALCONTAGEMGERAL = parseInt(qtdProduto)
            modoUpdate = true;
        }

        await salvarbalancoavulso(dados, modoUpdate);

        if (idProduto == id) {
            rowMyTable.cell(indexMyTable, 5).data(qtdProduto); // Atualiza a quantidade do produto na célula
        } else {
            myTable.row.add(newRowTable).draw(false); // Adiciona uma nova linha
        }

        calcularTotaisTabelaBalacoAvulso(qtdDigitada, nPrecoCusto, nPrecoVenda);

        $('#resultadoModal').html(``);

        contadorPesqProdutoBalanco = 0;

        $('#idlojaorigemmodal, #idlojadestinomodal').prop("disabled", true).select2();
        $('#dt-basic-produto').empty();
        $('#qtdProduto').val("1");
        $('#pesqProduto').val("");
        $('#descProduto').val("").focus();

    } catch (error) {
        console.error(error);
        msgError('Erro ao tentar adicionar o produto');
    }
}

// Subtrai a quantidade do produto selecionado na tabela
async function diminuirProduto(element) {
    try {
        let { id } = element;
        let myTable = $('#tabelaprodutos').DataTable();
        let closestTr = $(element).closest('tr');
        let rowIdx = myTable.row(closestTr).index();
        let row = myTable.row(rowIdx);
        let cDescColetor = $("#dsDesc").val();
        let nIdEmpresa = parseInt($("#idloja").val());
        let qtdDigitada = parseInt($('#qtdProduto').val())
        let qtdParaDimuir = 1;

        let idProduto = row.cell(rowIdx, 0).data();

        if (idProduto == id) {
            let cIdProduto = idProduto;
            let vrVenda = Number(row.cell(rowIdx, 4).data());
            let vrCusto = Number(row.cell(rowIdx, 3).data());
            let qtdProduto = Number(row.cell(rowIdx, 5).data());

            //qtdParaDiminuir = qtdDigitada <= qtdProduto ? qtdDigitada : qtdParaDiminuir

            qtdProduto -= qtdParaDimuir;

            let dados = {
                "IDEMPRESA": nIdEmpresa
                , "NUMEROCOLETOR": IDFuncionarioLogin
                , "DSCOLETOR": cDescColetor
                , "IDPRODUTO": cIdProduto
                , "TOTALCONTAGEMGERAL": parseInt(qtdProduto)
            };

            await salvarbalancoavulso(dados);

            if (qtdProduto >= 1) {
                row.cell(rowIdx, 5).data(qtdProduto); // Atualiza quantidade na tabela
            } else {
                row.remove().draw(false); // Remove a linha se a quantidade for 0
            }

            calcularTotaisTabelaBalacoAvulso(qtdParaDiminuir, vrCusto, vrVenda, 'subtrair');
        }
    } catch (error) {
        console.error(error);
        msgError('Erro ao tentar diminuir o produto!');
    }
}

// Exclui o produto e a linha da tabela
async function excluirProduto(element) {
    try {
        let { id } = element;
        let myTable = $('#tabelaprodutos').DataTable();
        let closestTr = $(element).closest('tr');
        let rowIdx = myTable.row(closestTr).index();
        let row = myTable.row(rowIdx);
        let cDescColetor = $("#dsDesc").val();
        let nIdEmpresa = parseInt($("#idloja").val());
        let idProduto = row.cell(rowIdx, 0).data();

        if (idProduto == id) {
            let cIdProduto = idProduto;
            let qtdProduto = Number(row.cell(rowIdx, 5).data());
            let vrVenda = Number(row.cell(rowIdx, 4).data());
            let vrCusto = Number(row.cell(rowIdx, 3).data());

            let dados = {
                "IDEMPRESA": nIdEmpresa
                , "NUMEROCOLETOR": IDFuncionarioLogin
                , "DSCOLETOR": cDescColetor
                , "IDPRODUTO": cIdProduto
                , "TOTALCONTAGEMGERAL": parseInt(0)
            };

            await salvarbalancoavulso(dados);

            row.remove().draw(false);

            calcularTotaisTabelaBalacoAvulso(qtdProduto, vrCusto, vrVenda, 'subtrair');
        }

    } catch (error) {
        console.error(error);
        msgError('Erro ao tentar excluir o produto!');
    }
}

async function retornoIncluirProdutoPeloCodigoBarrasDiretoNaTabela(dadosProduto){
    try{
    let { data } = dadosProduto || [];
    let myTable = $('#tabelaprodutos').DataTable();
    let cDescColetor = $("#dsDesc").val();
    let nIdEmpresa = parseInt($("#idloja").val());
    let qtdProduto = Number($('#qtdProduto').val());

    if (data.length > 0) {
        for (let registro of data) {

            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = Number(registro.PRECOVENDA);
            let PrecoCusto = Number(registro.PRECOCUSTO);

            let BtnOpcao = `
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${CodigoProduto}" onclick="diminuirProduto(this)"><i class="fal fa-minus"></i></button>
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoProduto}" onclick="excluirProduto(this)"><i class="fal fa-trash"></i></button>
            `;

            let newRowTable = [
                CodigoProduto,
                CodigoBarras,
                DescProduto,
                PrecoCusto,
                PrecoVenda,
                parseInt(qtdProduto),
                BtnOpcao
            ];

            let dados = {
                "IDEMPRESA": nIdEmpresa
                , "NUMEROCOLETOR": IDFuncionarioLogin
                , "DSCOLETOR": cDescColetor
                , "IDPRODUTO": CodigoProduto
                , "CODIGODEBARRAS": CodigoBarras
                , "DSPRODUTO": DescProduto
                , "TOTALCONTAGEMGERAL": parseInt(qtdProduto)
                , "PRECOCUSTO": Number(PrecoCusto)
                , "PRECOVENDA": Number(PrecoVenda)
                , "STCANCELADO": 'False'
                , "INSBALANCO": 0
            };

            await salvarbalancoavulso(dados, false);

            calcularTotaisTabelaBalacoAvulso(qtdProduto, PrecoCusto, PrecoVenda);

            myTable.row.add(newRowTable).draw(false);
        }
    } else {
        return msgWarning('Nenhum Produto encontrado com esse código de barras, verifique e tente novamente!')
        .then(() => setTimeout(() => $("#descProduto").prop("disabled", false).focus(), 300))
    }

    $('#idloja').prop("disabled", true).select2();
    $('#qtdProduto').val("1");
    $('#descProduto').prop("disabled", false).val("").focus();
  
    } catch (error) {
        console.error(error);
        msgError('Erro ao tentar adicionar o produto!');
    }
} 

async function pesqProduto() {
    try{
        let cDescColetor = $("#dsDesc").val();
        let nIdEmpresa = parseInt($("#idloja").val() || 0);
        let descProduto = Number($('#descProduto')?.val()) ? $('#descProduto')?.val()?.replace(/\D/g, '') : '';
        let qtdProduto = Number($('#qtdProduto').val() || 0);
        let cIdProduto = '';
        let cCodBarras = '';
        let cDescProduto = '';
        let nVlrCusto = 0;
        let nVlrVenda = 0;
        let nQtdProduto = 0;
        let stProdJaIncluido = false;
        let dados;

        if (nIdEmpresa <= 0) {
            return msgInfo('Atenção!', 'Favor selecionar a loja!')
                .then(() => setTimeout($("#idloja").select2('open'), 400));
        }

        if (qtdProduto <= 0) {
            return msgWarning('A quantidade digitada não pode ser 0 ou menor que zero')
                .then(() => setTimeout($('#qtdProduto').val("0").focus(), 400))
        }

        if (!descProduto?.length) {
            return msgInfo('Atenção!', 'Código de barras inválido, verifique e tente novamente!')
                .then(() => setTimeout($('#descProduto').val("").focus(), 400));
        }

        let myTable = $('#tabelaprodutos').DataTable();
        let rowCountMyTable = myTable.rows().count();

        if (rowCountMyTable > 0) {

            for (let rowIdx = 0; rowIdx < rowCountMyTable; rowIdx++) {
                let row = myTable.row(rowIdx); // Acessa a linha específica // Dados da coluna quantidade

                let codBarras = row.cell(rowIdx, 1).data();

                if (codBarras == descProduto) {
                    stProdJaIncluido = true;

                    cIdProduto = row.cell(rowIdx, 0).data();
                    cCodBarras = row.cell(rowIdx, 1).data();
                    cDescProduto = row.cell(rowIdx, 2).data();
                    nVlrCusto = Number(row.cell(rowIdx, 3).data());
                    nVlrVenda = Number(row.cell(rowIdx, 4).data());

                    calcularTotaisTabelaBalacoAvulso(qtdProduto, nVlrCusto, nVlrVenda);

                    qtdProduto += Number(row.cell(rowIdx, 5).data());
                    nQtdProduto = qtdProduto;

                    row.cell(rowIdx, 5).data(qtdProduto);

                    dados = {
                        "IDEMPRESA": nIdEmpresa
                        , "NUMEROCOLETOR": IDFuncionarioLogin
                        , "DSCOLETOR": cDescColetor
                        , "IDPRODUTO": cIdProduto
                        , "CODIGODEBARRAS": cCodBarras
                        , "DSPRODUTO": cDescProduto
                        , "TOTALCONTAGEMGERAL": parseInt(nQtdProduto)
                        , "PRECOCUSTO": nVlrCusto
                        , "PRECOVENDA": nVlrVenda
                        , "STCANCELADO": 'False'
                        , "INSBALANCO": 0
                    };

                    break;
                }

            }
        }
        

        if (stProdJaIncluido) {
            await salvarbalancoavulso(dados, true);
        } else {
            $('#descProduto').prop("disabled", true);

            await ajaxGetAllData(`api/expedicao/produto.xsjs?idEmpresa=${nIdEmpresa}&id=${descProduto}`)
                .then(retornoIncluirProdutoPeloCodigoBarrasDiretoNaTabela)
                .catch((error) => { throw error });
        }

        $('#qtdProduto').val("1");
        $('#descProduto').val("").focus();
        
    } catch (error){
        console.log(error);
        msgError('Erro ao carregar os dados do produto!');
    }
}

async function retornoListarProdutosBalancoAvulso(respostaListaProduto) {
    let { data } = respostaListaProduto || [];
    let myTable = $('#tabelaprodutos').DataTable();
    let qtdTotalProdutos = 0;
    let totalVrCusto = 0;
    let totalVrVenda = 0;
    let dados;

    if (data.length > 0) {
        for (let registro of data) {

            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = Number(registro.PRECOVENDA);
            let PrecoCusto = Number(registro.PRECOCUSTO);
            let qtdProduto = Number(registro.TOTALCONTAGEMGERAL);

            let BtnOpcao = `
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${CodigoProduto}" onclick="diminuirProduto(this)"><i class="fal fa-minus"></i></button>
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoProduto}" onclick="excluirProduto(this)"><i class="fal fa-trash"></i></button>
            `;

            let newRowTable = [
                CodigoProduto,
                CodigoBarras,
                DescProduto,
                PrecoCusto,
                PrecoVenda,
                parseInt(qtdProduto),
                BtnOpcao
            ];

            qtdTotalProdutos += qtdProduto;
            totalVrCusto += qtdProduto * PrecoCusto;
            totalVrVenda += qtdProduto * PrecoVenda;

            myTable.row.add(newRowTable).draw(false);
        }

    }

    $('#vlTotalAcumulado').text(maskValorEmBRL(totalVrCusto));
    $('#vlTotalItens').text(maskValorEmBRL(totalVrVenda));
    $('#qtdTotalProdutos').text(qtdTotalProdutos);

    $('#idloja').prop("disabled", true).select2();
    $('#descProduto').prop("disabled", false).val("").focus();
    $('#qtdProduto').val("1");

    listardetalhebalanco = 0;
}

// Função para Listar os Produtos de Balanços em Aberto de acordo com o usuário e filial//
async function listaprodutoavulso() {
    try{
        let idfilial = $("#idloja").val();
        let coletor = IDFuncionarioLogin;

        listardetalhebalanco = 1;

        await ajaxGetAllData(`api/administrativo/detalhe-balanco-avulso.xsjs?idfilial=${idfilial}&coletor=${coletor}`)
            .then(retornoListarProdutosBalancoAvulso)
            .catch((error) => { throw error });
    } catch (error){
        console.log(error);
        msgError('Erro ao carregar os dados do balanço avulso, recerregue e tente novamente!')
    }

}

function retornoPesqListaProdutoNoModal(respostaPesqListaProduto) {
    let { data } = respostaPesqListaProduto || [];
    let dadosTable = []

    if (data.length > 0) {
        for (registro of data) {
            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = registro.PRECOVENDA;
            let PrecoCusto = registro.PRECOCUSTO;
            let btnSelecionar = `<button type="button" class="btn btn-outline-success btn-xs btn-icon waves-effect waves-themed" title="Confirmar" id="${CodigoProduto}" onclick="confirmarProduto(this)"><i class="fal fa-check"></i></button>`;

            dadosTable.push([
                CodigoProduto
                , CodigoBarras
                , DescProduto
                , PrecoCusto
                , PrecoVenda
                , btnSelecionar
            ]);

            contadorPesqProdutoBalanco++;
        }
    } else {
        return msgWarning('Nenhum Produto encontrado com essa descrição ou código de barras, verifique e tente novamente!')
        .then(() => setTimeout(() => $("#pesqProduto").focus(), 300));
    }

    $('#resultadoModal').html(
        `<table id="dt-basic-produto-modal" class="table table-bordered table-hover table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th>Produto</th>
                    <th>Cód. Barras</th>
                    <th>Descrição</th>
                    <th>R$ Custo</th>
                    <th>R$ Venda</th>
                    <th>Opções</th>
                </tr>
            </thead>
        </table>`
    );

    $('#dt-basic-produto-modal').DataTable({
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "10%", "targets": 5 }
        ],
        deferRender: true,
        responsive: true,
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [
            {
                extend: 'pdfHtml5',
                text: 'PDF',
                titleAttr: 'Generate PDF',
                className: 'btn-outline-danger btn-sm mr-1'
            },
            {
                extend: 'excelHtml5',
                text: 'Excel',
                titleAttr: 'Gerar Excel',
                className: 'btn-outline-success btn-sm mr-1',
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function (data, row, column, node) {
                            data = $('<p>' + data + '</p>').text();
                            return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                        }
                    }
                }
            },
            {
                extend: 'print',
                text: 'Print',
                titleAttr: 'Print Table',
                className: 'btn-outline-primary btn-sm'
            }
        ]
    });
}

async function pesquisarProduto() {
    try{
        let descProduto = $("#pesqProduto").val().replaceAll('%', '%25').trim();

        if(descProduto?.length <= 4){
            return msgWarning('Digite a descrição do produto ou o código de barras!')
                .then(() => setTimeout(() => $("#pesqProduto").focus(), 400))
        }

        await ajaxGetAllData(`api/expedicao/produto.xsjs?idEmpresa=${nIdLojaOrigem}&descProduto=${descProduto}`)
            .then(retornoPesqListaProdutoNoModal)
            .catch((error)=>{ throw error })
    } catch(error){
        console.error(error);
        msgError('Erro ao tentar buscar os produtos!');
    }
}

// Confirmar o Balanço Avulso
async function confirmarbalancoavulso() {
    let myTable = $('#tabelaprodutos').DataTable();
    let rowCountTable = myTable.rows().count() || 0;
    let nIdEmpresa = parseInt($("#idloja").val());
    let cDescColetor = $("#dsDesc").val();
    let det = [];

    if (rowCountTable > 0) {
        return Swal.fire({
                title: 'Deseja confirmar o Coletor?',
                text: "Caso confirme, a manutenção dessa listagem será no Balanço!",
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não'
            }).then(async (result) => {
                try{
                    if (result.value == true) {
                        animationLoadingStart('Enviando dados, aguarde...', 300, false);

                        for (let rowIdx = 0; rowIdx < rowCountTable; rowIdx++) {
                            let row = myTable.row(rowIdx);

                            det.push({
                                "NUMEROCOLETOR": IDFuncionarioLogin
                                , "IDPRODUTO": row.cell(rowIdx, 0).data()
                                , "CODIGODEBARRAS": row.cell(rowIdx, 1).data()
                                , "DSPRODUTO": row.cell(rowIdx, 2).data()
                                , "TOTALCONTAGEMATUAL": 0
                                , "TOTALCONTAGEMGERAL": parseInt(row.cell(rowIdx, 5).data())
                                , "PRECOCUSTO": parseFloat(row.cell(rowIdx, 3).data())
                                , "PRECOVENDA": parseFloat(row.cell(rowIdx, 4).data())
                                , "STCANCELADO": 'False'
                                , "DSCOLETOR": cDescColetor
                            });
                        }

                        let dados = [{
                            "IDEMPRESA": nIdEmpresa
                            , "DSRESUMOBALANCO": 'LOJA BALANCO'
                            , "DTABERTURA": data
                            , "DTFECHAMENTO": ''
                            , "QTDTOTALITENS": 0
                            , "QTDTOTALSOBRA": 0
                            , "QTDTOTALFALTA": 0
                            , "TXTOBSERVACAO": ''
                            , "STATIVO": 'True'
                            , det
                            , "INSBALANCO": 1
                        }];

                        
                        await ajaxPost("api/administrativo/detalhe-balanco-avulso.xsjs", dados).catch((error) => { throw error });
                        
                        await msgSuccess("Confirmado com Sucesso!", undefined, false);

                        ListaBalancoAvulso();
                    }
                } catch(error){
                    console.log(error);
                    msgError('Erro ao tentar confirmar o Coletor, recarregue e tente novamente!')
                }
            });

    }

    return msgWarning('Não há dados para confirmar, verifique e tente novamente!');
}
// ==================================== FIM ROTINA BALANÇO LOJA AVULSO ====================================================== //

//======================================PREPARAR PRIMEIRO BALANÇO LOJA=========================================================
function ListaPreparoPrimeiroBalanco(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        );
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);
        
        	$("#idloja").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista de Balanços - <span class='fw-300'></span>`);
			
        	ajaxGet('api/administrativo/prepara-primeiro-balanco-loja.xsjs')
        		.then(retornoListaEmpresasSelect)
        		.catch((e) => { funcError(), console.log(e) });
      } 
    };
    xmlhttp.open("GET", "administrativo_action_listPrimeirobalanco.html", true);
    xmlhttp.send();
}

function preparo_balanco(){
    var idempresa = $("#idloja").val();
    if(idempresa === '0'){
    	Swal.fire({
    		type: "warning",
    		title: 'Favor Selecionar uma Empresa!',
    		showConfirmButton: false,
    		timer: 15000
        });
    }else{
         var dados = [{
                  "IDEMPRESA": parseInt(idempresa)
                }];
            
          ajaxPut("api/administrativo/prepara-primeiro-balanco-loja.xsjs", dados)
        		.then(Swal.fire({
            		type: "success",
            		title: 'Preparação balanço realizada com sucesso!',
            		showConfirmButton: false,
            		timer: 15000
                }))
        		.catch((e) => { funcError(), console.log(e) });
    }
}

//================ VENDAS COM DESCONTOS DA LOJA ==============================================

function ListaRelatorioVendasDesconto(){
    /*if(flagConferidoData != ''){
            Swal.fire({
    			type: "warning",
    			title: "Bloqueio de Dados",
    			html: "Seus Dados estão bloqueado até que o(s) CAIXA(S) seja(am) CONFIRMADO(S)!",
    			showConfirmButton: true,
    			timer: 15000
    		});
    }else{ */
        if (window.XMLHttpRequest) {
          // code for IE7+, Firefox, Chrome, Opera, Safari
          xmlhttp = new XMLHttpRequest();
        } else {
          // code for IE6, IE5
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        
            $("#resultado").html(
              "<div align=\"center\">" +
              "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
              "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
              "</div>"
            ); 
            
        xmlhttp.onreadystatechange = function () {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
            
                $('.dataAtual').text(dataAtual);
                $('#dtconsultainicio').val(dataAtualCampo);
                $('#dtconsultafim').val(dataAtualCampo);
                
	            $("#idfuncvenda").select2();
	            $("#idlojavenda").select2();

            	ajaxGet('api/informatica/empresa.xsjs')
            		.then(retornoListaEmpresasSelect)
            		.catch((e) => { funcError(), console.log(e) });
        		
          }
        };
        xmlhttp.open("GET", "administrativo_action_listvendasdescontofunc.html", true);
        xmlhttp.send();
    //}
}

function pesq_vendas_desconto_func_loja(){

    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IdFuncVenda = $("#idfunc").val();
    var IdEmpVendaDesc = $("#idlojavendadesc").val();
    
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
        
    	ajaxGet('api/dashboard/venda/resumo-venda-convenio-desconto.xsjs?pagesize=1000&status=False&idEmpresa=' + IdEmpVendaDesc + '&dataInicio=' + datapesqinicio + '&dataFechamento=' + datapesqfim + '&idFuncPN=' + IdFuncVenda)
    		.then(retornoListaVendasConvenioDescontoFunc)
    		.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqvendasdescontofunc.html", true);
    xmlhttp.send();
} 

function retornoListaVendasConvenioDescontoFunc(respostaListaVendaDescontoFunc) {

		var TotalVendaBrutaConvenioDescontoFunc = 0;
		var TotalVendaDescontoConvenioDescontoFunc = 0;
		var TotalVendaLiqConvenioDescontoFunc = 0;
		var contadorConvenioDescontoFunc = 0;
		
    var numPageAtual = parseInt(respostaListaVendaDescontoFunc.page);
    if(numPageAtual === 1){
        totalVrPedidosLista = 0;
        
        $('#resultado').html(
            `<table id="dt-basic-venda-desconto-func" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th></th>
                        <th>Caixa</th>
                        <th>Nº Venda</th>
                        <th>NFCe</th>
                        <th>Abertura</th>
                        <th>Operador</th>
                        <th>Conveniado</th>
                        <th>CPF</th>
                        <th>Valor Bruto</th>
                        <th>Desconto</th>
                        <th>Valor Liq</th>
                        <th>Obs</th>
                        <th>Opções</th> 
                    </tr>
                </thead>
                <tbody id="resultadoListVendasDescontoFunc">
                </tbody>
                <tfoot id="totalDescontoFunc"class="thead-themed">
                </tfoot>
            </table>`
        );
	            
        var tableVendasDescontoFunc = $('#dt-basic-venda-desconto-func').DataTable({
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        });
        
        tableVendasDescontoFunc.rows().remove().draw();
        $('#totalDescontoFunc').html('');
    }

    if(respostaListaVendaDescontoFunc.data.length != 0){
		for (var i = 0; i < respostaListaVendaDescontoFunc.data.length; i++) {

			contadorConvenioDescontoFunc = contadorConvenioDescontoFunc + 1;

			NumCaixaConvenioDescontoFunc = respostaListaVendaDescontoFunc.data[i]['IDCAIXAWEB'];
			DescCaixaConvenioDescontoFunc = respostaListaVendaDescontoFunc.data[i]['DSCAIXA'];
			NuVendaConvenioDescontoFunc = respostaListaVendaDescontoFunc.data[i]['IDVENDA'];
			NuNFCeConvenioDescontoFunc = respostaListaVendaDescontoFunc.data[i]['NFE_INFNFE_IDE_NNF'];
			DTAberturaVendaConvenioDescontoFunc = respostaListaVendaDescontoFunc.data[i]['DTHORAFECHAMENTO'];
			NomeOperadorVendaConvenioDescontoFunc = respostaListaVendaDescontoFunc.data[i]['NOFUNCIONARIO'];
			NomeConeniadoVendaConvenioDescontoFunc = respostaListaVendaDescontoFunc.data[i]['NOCONVENIADO'];
			CPFVendaConvenioDescontoFunc = respostaListaVendaDescontoFunc.data[i]['CPFCONVENIADO'];
			ObsConvenioDescontoFunc = respostaListaVendaDescontoFunc.data[i]['TXTMOTIVODESCONTO'];

			VendaValorBrutoConvenioDescontoFunc = parseFloat(respostaListaVendaDescontoFunc.data[i]['VRBRUTOPAGO']);
			VendaValorDescontoConvenioDescontoFunc = parseFloat(respostaListaVendaDescontoFunc.data[i]['VRDESPAGO']);
			VendaValorLiqConvenioDescontoFunc = parseFloat(respostaListaVendaDescontoFunc.data[i]['VRLIQPAGO']);

			TotalVendaBrutaConvenioDescontoFunc = TotalVendaBrutaConvenioDescontoFunc + VendaValorBrutoConvenioDescontoFunc;
			TotalVendaDescontoConvenioDescontoFunc = TotalVendaDescontoConvenioDescontoFunc + VendaValorDescontoConvenioDescontoFunc; 
			TotalVendaLiqConvenioDescontoFunc = TotalVendaLiqConvenioDescontoFunc + VendaValorLiqConvenioDescontoFunc;
                
    		tableVendasDescontoFunc.row.add([
                `<label style="color: blue; font-size: 11px;">` + contadorConvenioDescontoFunc + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NumCaixaConvenioDescontoFunc + ` - ` + DescCaixaConvenioDescontoFunc + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuVendaConvenioDescontoFunc + `</label>`,
                `<label style="color: blue;">` + NuNFCeConvenioDescontoFunc + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + DTAberturaVendaConvenioDescontoFunc + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NomeOperadorVendaConvenioDescontoFunc + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NomeConeniadoVendaConvenioDescontoFunc + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + CPFVendaConvenioDescontoFunc + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaValorBrutoConvenioDescontoFunc.toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaValorDescontoConvenioDescontoFunc.toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaValorLiqConvenioDescontoFunc.toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + ObsConvenioDescontoFunc + `</label>`,
                `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVendaConvenioDescontoFunc + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
                </div>`,
            ]).draw(false);
            
    	}
        
        //chamarProximaResumoPedidoLista(numPageAtual + 1);
        //<button type="button" class="btn btn-info btn-xs" title="Editar Produto" id="` +idDetalhePedido +`" onclick="Editar_Produto_Pedido(this.id)" ><span class="fal fa-pen-alt mr-1"></span></button>
        
    }else{
    }
    
		$('#totalDescontoFunc').html(
			`<tr>
                <th colspan="8" style="text-align: center;">Total Vendas Convenio Desconto</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaBrutaConvenioDescontoFunc.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaDescontoConvenioDescontoFunc.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaLiqConvenioDescontoFunc.toFixed(2))}</th>
                <th colspan="2"></th>
            </tr>`
		);
		
}

function selecionafuncionario(){

    var EmpFunc = $("#idlojavendadesc").val();

        		ajaxGet('api/dashboard/funcionario.xsjs?idEmpresa=' + EmpFunc)
        			.then(retornoListaFuncionarioModal)
        			.catch((e) => { funcError(), console.log(e) });
}

function retornoListaFuncionarioModal(respostaListaFuncionario) {

    numPage = parseInt(respostaListaFuncionario.page);
    if(numPage === 1){
        $("#idfunc").empty();
        $('#idfunc').append(
	        `<option value="">Selecione ...</option>`
	    );
    }
    
	for (var i = 0; i < respostaListaFuncionario.data.length; i++) {

		IDFuncionario = respostaListaFuncionario.data[i]['IDFUNCIONARIO'];
		NomeFuncionario = respostaListaFuncionario.data[i]['NOFUNCIONARIO'];
		NuLogin = respostaListaFuncionario.data[i]['NOLOGIN'];
		StAtivo = respostaListaFuncionario.data[i]['STATIVO'];

		$('#idfunc').append(
			`<option value="` + IDFuncionario + `"> ` + NuLogin + ` - ` + NomeFuncionario + `</option>`
		);
	}
}

//========================================INÍCIO VENDAS CANCELADAS=============================================
// function ListaVendasCanceladasPorEmpresa(){
//     if (window.XMLHttpRequest) {
//       // code for IE7+, Firefox, Chrome, Opera, Safari
//       xmlhttp = new XMLHttpRequest();
//     } else {
//       // code for IE6, IE5
//       xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//     }
    
//         $("#resultado").html(
//           "<div align=\"center\">" +
//           "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
//           "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
//           "</div>"
//         ); 
        
//     xmlhttp.onreadystatechange = function () {
//       if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
//         document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
//             $('.dataAtual').text(dataAtual);
//             $('#dtconsultainicio').val(dataAtualCampo);
//             $('#dtconsultafim').val(dataAtualCampo);
//             $("#idmarca").select2();
//         	$("#idloja").select2();
        	
//             $('.DescTituloListaVendas').html(
// 			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas Canceladas - <span class='fw-300'></span>`);
	
// 	ajaxGet('api/informatica/grupoempresas.xsjs')
//                 .then(retornoListaGrupoEmpresasSelect)
//                 .catch((e) => { funcError(), console.log(e) });
			
// 	ajaxGet('api/informatica/empresa.xsjs')
// 		.then(retornoListaEmpresasSelect)
// 		.catch((e) => { funcError(), console.log(e) });
//       }
//     };
//     xmlhttp.open("GET", "administrativo_action_listvendascanceladas.html", true);
//     xmlhttp.send();
// }

// function pesq_vendas_canceladas_por_empresa(numPage){
//     var idgrupo = $("#idmarca").val();
//     var idempresa = $("#idloja").val();
//     var datapesqinicio = $("#dtconsultainicio").val();
//     var datapesqfim = $("#dtconsultafim").val();
//     dataRetorno=[];
//     contador = 0;
//     var totalvendacancelada = 0;
//     var totalvendaprodcancelada = 0;
   
    
//     if (window.XMLHttpRequest) {
//       // code for IE7+, Firefox, Chrome, Opera, Safari
//       xmlhttp = new XMLHttpRequest();
//     } else {
//       // code for IE6, IE5
//       xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//     }
   
//     xmlhttp.onreadystatechange = function () {
        
//       if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
//         document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
//         $('.dataAtual').text(dataAtual);
//         ajaxGet('api/administrativo/venda-ativa.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataFechamento=' + datapesqinicio + '&dataFechamentoFim=' + datapesqfim + '&status=True')
//         	.then(retornoListaVendasCanceladasPorEmpresa)
//         	.catch((e) => { funcError(), console.log(e) });
//       }
//     };
    
//     xmlhttp.open("GET", "administrativo_action_pesqvendascanceladasempresas.html", true);
//     xmlhttp.send();
// } 

// function chamarProximaListaVendasCanceladasPorEmpresas(numPage){
    
//     var idgrupo = $("#idmarca").val();
//     var idempresa = $("#idloja").val();
//     var datapesqinicio = $("#dtconsultainicio").val();
//     var datapesqfim = $("#dtconsultafim").val();

//     ajaxGet('api/administrativo/venda-ativa.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataFechamento=' + datapesqinicio + '&dataFechamentoFim=' + datapesqfim + '&status=True')
//         	.then(retornoListaVendasCanceladasPorEmpresa)
//         	.catch((e) => { funcError(), console.log(e) });
        	
//     $("#resultado").html(
//     "<div align=\"center\">" +
//     "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
//     "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
//     "</div>"
//     );
// }

// function retornoListaVendasCanceladasPorEmpresa(respostaListaVendaCanceladas) {
                    
//     var numPageAtual = parseInt(respostaListaVendaCanceladas.page);
//     if(respostaListaVendaCanceladas.data.length != 0){
//         for (var i=0; i < respostaListaVendaCanceladas.data.length; i++) { 
//             contador ++;
//             var registro = respostaListaVendaCanceladas.data[i];
//             Empresa = registro['NOFANTASIA'];
//             NumCaixaCancelada = registro['IDCAIXAWEB'];
//     		DescCaixaCancelada = registro['DSCAIXA'];
//     		NuVendaCancelada = registro['IDVENDA'];
//     		NuNFCeCancelada = registro['NFE_INFNFE_IDE_NNF'];
//     		DTAberturaVendaCancelada = registro['DTHORAFECHAMENTO'];
//     		NomeOperadorVendaCancelada = registro['NOFUNCIONARIO'];
//     		FuncioCancelVendaCancelada = registro['NOFUNCIOCANCEL'];
//     		FuncaoCancelVendaCancelada = registro['NOFUNCAOCANCEL'];
//     		MotivoCancelada = registro['TXTMOTIVOCANCELAMENTO'];
    
//     		VrVendaCancelada = parseFloat(registro['VRTOTALPAGO']);
//     		VrVendaProdCancelada = parseFloat(registro['TOTALVENDAPROD']);
    		
//     		if(VrVendaCancelada>0){
//     		    VrVendaCancelada1 = VrVendaCancelada;
//     		}else{
//     		    VrVendaCancelada1 = VrVendaProdCancelada;
//     		}
    		
//     		EmitidasCancelada = registro['STCONTINGENCIA'];
//     		if (EmitidasCancelada == 'false') {
//     			NotaEmitidaCancelada = 'Contigência';
//     		} else {
//     			NotaEmitidaCancelada = 'Emitida';
//     		}
//     		//TotalVendaCancelada = TotalVendaCancelada + VrVendaCancelada;

// 		//var tableVendasCancelada = $('#dt-basic-venda-cancelada').DataTable();
// 		//tableVendasCancelada.remove().draw();
// 		/*tableVendasCancelada.row.add([
//             `<label style="color: red; font-size: 11px;">` + contadorCancelada + `</label>`,
//             `<label style="color: red; font-size: 11px;">` + NumCaixaCancelada + ` - ` + DescCaixaCancelada + `</label>`,
//             `<label style="color: red; font-size: 11px;">` + NuVendaCancelada + `</label>`,
//             `<label style="color: red; font-size: 11px;">` + NuNFCeCancelada + `</label>`,
//             `<label style="color: red; font-size: 11px;">` + DTAberturaVendaCancelada + `</label>`,
//             `<label style="color: red; font-size: 11px;">` + NomeOperadorVendaCancelada + `</label>`,
//             `<label style="color: red; font-size: 11px;">` + VrVendaCancelada + `</label>`,
//             `<label style="color: red; font-size: 11px;">` + NotaEmitidaCancelada + `</label>`,
//             `<label style="color: red; font-size: 11px;">` + FuncioCancelVendaCancelada + `</label>`,
//             `<label style="color: red; font-size: 11px;">` + MotivoCancelada + `</label>`,*/
//             opcoes = `<div class="btn-group btn-group-xs">
//                 <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVendaCancelada +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
//                 <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVendaCancelada + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
//                 <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVendaCancelada + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
//             </div>`;
//       // ]).draw(false);
            
//             dataRetorno.push( [contador,
//                                 Empresa,
//                                 DescCaixaCancelada,
//                                 NuVendaCancelada,
//                                 NuNFCeCancelada,
//                                 DTAberturaVendaCancelada,
//                                 NomeOperadorVendaCancelada,
//                                 VrVendaCancelada1,
//                                 NotaEmitidaCancelada,
//                                 FuncioCancelVendaCancelada,
//                                 FuncaoCancelVendaCancelada,
//                                 MotivoCancelada,
//                                 opcoes
//                                 ]);
//         }
        
//         chamarProximaListaVendasCanceladasPorEmpresas(numPageAtual + 1); 
//     }
//     else{
//          $('#resultado').html(
//             `<table id="dt-basic-venda-venda-cancelada-empresa" class="table table-bordered table-hover table-striped w-100">
//                     <thead class="bg-primary-600">
//                         <tr>
//                             <th>*</th>
//                             <th>Empresa</th>
//                             <th>Caixa</th>
//                             <th>Nº Venda</th>
//                             <th>NFCe</th>
//                             <th>Abertura</th>
//                             <th>Operador</th>
//                             <th>Valor</th>
//                             <th>Nota</th>
//                             <th>Cancelado Por</th>
//                             <th>Função</th>
//                             <th>Motivo</th>
//                             <th>Opções</th>
//                         </tr>
//                     </thead>
//                     <tbody id="resultadoListVendasCanceladasEmpresas">
//                     </tbody>
//                     <tfoot id="totalConsolidadovendacancelada" class="thead-themed">
//                         <th>#</th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                         <th></th>
//                     </tfoot>
                    
//                 </table>`
//         );
	   
// 	    $('#dt-basic-venda-venda-cancelada-empresa').DataTable( {
//             data: dataRetorno,
//             "footerCallback": function ( row, data, start, end, display ) {
//                 var api = this.api(), data;
     
//                 // Remove the formatting to get integer data for summation
//                 var intVal = function ( i ) {
//                     return typeof i === 'string' ?
//                         i.replace(/[\$,]/g, '')*1 :
//                         typeof i === 'number' ?
//                             i : 0;
//                 };
     
//                 // Total over all pages
//                 totalVl = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
     
//                 // Total over this page
//                 pageTotalVl = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
//                 // Update footer
//                 $( api.column( 7 ).footer() ).html(pageTotalVl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
//             },
//             deferRender:    true,
//             //scrollY:        800,
//             //scrollCollapse: false,
//             //scroller:       false,
//             responsive: true,
//             dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
//                         "<'row'<'col-sm-12'tr>>" +
//                         "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
//             buttons: [
//                         {
//                             extend: 'pdfHtml5',
//                             text: 'PDF',
//                             titleAttr: 'Generate PDF',
//                             className: 'btn-outline-danger btn-sm mr-1'
//                         },
//                         {
//                             extend: 'excelHtml5',
//                             text: 'Excel',
//                             titleAttr: 'Gerar Excel',
//                             className: 'btn-outline-success btn-sm mr-1',
//                             exportOptions: {
//                               columns: ':visible',
//                               format: {
//                                   body: function(data, row, column, node) {
//                                       data = $('<p>' + data + '</p>').text();
//                                       return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
//                                   }
//                               }
//                             }
//                         },
//                         {
//                             extend: 'print',
//                             text: 'Print',
//                             titleAttr: 'Print Table',
//                             className: 'btn-outline-primary btn-sm'
//                         }
//                     ]
//         } );
        
       
//     }
// }

// function selecionamarcavendas(){
    
//     $("#idloja").empty();
    
//     idmarca = $('#idmarca').val();

//     ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca)
// 	.then(retornoListaEmpresasSelectVendas)
// 	.catch((e) => { funcError(), console.log(e) });
// }

// function retornoListaEmpresasSelectVendas(respostaListaEmpresas) {

//     $("#idloja").select2();
    
//     numPage = parseInt(respostaListaEmpresas.page);
//     if(numPage === 1){
//         $("#idloja").empty();
//         $('#idloja').append(
// 	        `<option value="0">Todos</option>`
// 	    );
//     }
    
// 	for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

// 		IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
// 		DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

// 			$('#idloja').append(
// 				`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
// 			);
		
// 	}
// 	$("#idloja").select2("val", "0");
// }

async function ListaVendasCanceladasPorEmpresa(){
  animationLoadingStart('Carregando Página...');

  try{
      let respHtml = await $.get("administrativo_action_listvendascanceladas.html")

      $("#js-page-content").html(respHtml);
          
      $('.dataAtual').text(dataAtual);
      $('#dtconsultainicio').val(dataAtualCampo);
      $('#dtconsultafim').val(dataAtualCampo);
              
      $('.DescTituloListaVendas').html(`
          <i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas Canceladas - <span class='fw-300'></span>
      `);

      ajaxGetAllData('api/informatica/grupoempresas.xsjs?', 'Carregando Grupos...', retornoListaGrupoEmpresasSelect)
      ajaxGetAllData('api/informatica/empresa.xsjs?','Carregando Empresas...', retornoListaEmpresasSelect);

      $('#dtconsultainicio').on('keyup', (e) => { if (e.keyCode == 13) $('#dtconsultafim').focus()})
      $('#dtconsultafim').on('keyup', (e) => { if (e.keyCode == 13) $("#idmarca").select2('open')})

  } catch (error) {
      animationLoadingStop();
      msgError('Erro ao carregar página, recarregue e tente novamente!');
      console.log(error);
  }
}

async function pesq_vendas_canceladas_por_empresa(tipoPesq = ''){
  let urlApi;
  let respHtml;
  let idgrupo = $("#idmarca").val();
  let idempresa = $("#idloja").val();
  let datapesqinicio = $("#dtconsultainicio").val();
  let datapesqfim = $("#dtconsultafim").val();
  let stCancelado = !tipoPesq ? 'True' : '';
  let stCanceladoWeb = tipoPesq == 'Web' ? 'True' : '';
  let stCanceladoPDVEmitida = tipoPesq == 'PdvEmitida' ? 'True' : '';
  let stCanceladoPDVEmTela = tipoPesq == 'PdvEmTela' ? 'True' : '';
  let stCanceladoApos30Min = tipoPesq == '30Min' ? 'True' : '';

  respHtml = await $.get("administrativo_action_pesqvendascanceladasempresas.html");
  urlApi = `api/administrativo/venda-ativa.xsjs?idMarca=${idgrupo}&idEmpresa=${idempresa}&dataFechamento=${datapesqinicio}&dataFechamentoFim=${datapesqfim}&status=${stCancelado}&stCanceladoWeb=${stCanceladoWeb}&stCanceladoPDVEmitida=${stCanceladoPDVEmitida}&stCanceladoApos30Min=${stCanceladoApos30Min}&stCanceladoPDVEmTela=${stCanceladoPDVEmTela}`;

  $('#resultado').html(respHtml);

  ajaxGetAllData(urlApi, 'Carregando Vendas Canceladas...', retornoListaVendasCanceladasPorEmpresa);
} 

function chamarProximaListaVendasCanceladasPorEmpresas(numPage){
  
  var idgrupo = $("#idmarca").val();
  var idempresa = $("#idloja").val();
  var datapesqinicio = $("#dtconsultainicio").val();
  var datapesqfim = $("#dtconsultafim").val();

  ajaxGet('api/administrativo/venda-ativa.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataFechamento=' + datapesqinicio + '&dataFechamentoFim=' + datapesqfim + '&status=True')
        .then(retornoListaVendasCanceladasPorEmpresa)
        .catch(funcError);
        
  $("#resultado").html(
  "<div align=\"center\">" +
  "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
  "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
  "</div>"
  );
}

function retornoListaVendasCanceladasPorEmpresa(respostaListaVendaCanceladas) {
  let dadosTable = [];
  let Empresa;
  let NumCaixaCancelada;
  let DescCaixaCancelada;
  let NuVendaCancelada;
  let NuNFCeCancelada;
  let DTAberturaVendaCancelada;
  let NomeOperadorVendaCancelada;
  let FuncioCancelVendaCancelada;
  let FuncaoCancelVendaCancelada;
  let MotivoCancelada;
  let vrDinheiro;
  let vrCartao;
  let vrConvenio;
  let vrPOS;
  let vrVoucher;
  let VrVendaCancelada;
  let VrTotalPagoVendaCancelada
  let EmitidasCancelada;
  let NotaEmitidaCancelada;
  let vrTotalDinheiro = 0;
  let vrTotalCartao = 0;
  let vrTotalConvenio = 0;
  let vrTotalPOS = 0;
  let vrTotalVoucher = 0;
  let vrTotalVendas = 0;
  let vrTotalVendasPago = 0;
  let contador = 0;

  if(respostaListaVendaCanceladas?.data?.length){

      respostaListaVendaCanceladas.data.map((registro) => { 
          contador++;
          Empresa = registro['NOFANTASIA'] && registro['NOFANTASIA'].toUpperCase();
          NumCaixaCancelada = registro['IDCAIXAWEB'];
      DescCaixaCancelada = registro['DSCAIXA'] && registro['DSCAIXA'].toUpperCase();
      NuVendaCancelada = registro['IDVENDA'];
      NuNFCeCancelada = registro['NFE_INFNFE_IDE_NNF'];
      DTAberturaVendaCancelada = registro['DTHORAFECHAMENTO'];
      NomeOperadorVendaCancelada = registro['NOFUNCIONARIO'];
      FuncioCancelVendaCancelada = registro['NOFUNCIOCANCEL'];
      FuncaoCancelVendaCancelada = registro['NOFUNCAOCANCEL'] && registro['NOFUNCAOCANCEL'].toUpperCase();
      MotivoCancelada = registro['TXTMOTIVOCANCELAMENTO'] && registro['TXTMOTIVOCANCELAMENTO'].toUpperCase();
      vrDinheiro = parseFloat(registro['VRRECDINHEIRO'] || 0);
      vrCartao = parseFloat(registro['VRRECCARTAO'] || 0);
      vrConvenio = parseFloat(registro['VRRECCONVENIO'] || 0);
      vrPOS = parseFloat(registro['VRRECPOS'] || 0);
      vrVoucher = parseFloat(registro['VRRECVOUCHER'] || 0);
      VrTotalPagoVendaCancelada = parseFloat(registro['VRTOTALPAGO']) || 0;
      VrVendaCancelada = parseFloat(registro['VRTOTALVENDA']) || 0;
      EmitidasCancelada = registro['STCONTINGENCIA'];
      vrTotalDinheiro += parseFloat(vrDinheiro);
      vrTotalCartao += parseFloat(vrCartao);
      vrTotalConvenio += parseFloat(vrConvenio);
      vrTotalPOS += parseFloat(vrPOS);
      vrTotalVoucher += parseFloat(vrVoucher);
      vrTotalVendas += parseFloat(VrVendaCancelada || 0)
      vrTotalVendasPago += parseFloat(VrTotalPagoVendaCancelada || 0)

      if (EmitidasCancelada == 'False' && VrVendaCancelada > 0) {
        NotaEmitidaCancelada = 'Contingência';
      } else {
        NotaEmitidaCancelada =  VrVendaCancelada > 0 ? 'Emitida' : 'Não Emitida';
      }
      //TotalVendaCancelada = TotalVendaCancelada + VrVendaCancelada;

  //var tableVendasCancelada = $('#dt-basic-venda-cancelada').DataTable();
  //tableVendasCancelada.remove().draw();
  /*tableVendasCancelada.row.add([
          `<label style="color: red; font-size: 11px;">` + contadorCancelada + `</label>`,
          `<label style="color: red; font-size: 11px;">` + NumCaixaCancelada + ` - ` + DescCaixaCancelada + `</label>`,
          `<label style="color: red; font-size: 11px;">` + NuVendaCancelada + `</label>`,
          `<label style="color: red; font-size: 11px;">` + NuNFCeCancelada + `</label>`,
          `<label style="color: red; font-size: 11px;">` + DTAberturaVendaCancelada + `</label>`,
          `<label style="color: red; font-size: 11px;">` + NomeOperadorVendaCancelada + `</label>`,
          `<label style="color: red; font-size: 11px;">` + VrVendaCancelada + `</label>`,
          `<label style="color: red; font-size: 11px;">` + NotaEmitidaCancelada + `</label>`,
          `<label style="color: red; font-size: 11px;">` + FuncioCancelVendaCancelada + `</label>`,
          `<label style="color: red; font-size: 11px;">` + MotivoCancelada + `</label>`,*/
          opcoes = `<div class="btn-group btn-group-xs">
              <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVendaCancelada +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
              <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVendaCancelada + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
              <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVendaCancelada + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
          </div>`;
     // ]).draw(false);
          
          dadosTable.push( [contador,
                              Empresa,
                              DescCaixaCancelada,
                              NuVendaCancelada,
                              NuNFCeCancelada,
                              DTAberturaVendaCancelada,
                              NomeOperadorVendaCancelada,
                              vrDinheiro,
                              vrCartao,
                              vrConvenio,
                              vrPOS,
                              vrVoucher,
                              VrVendaCancelada,
                              NotaEmitidaCancelada.toUpperCase(),
                              FuncioCancelVendaCancelada,
                              FuncaoCancelVendaCancelada,
                              MotivoCancelada,
                              opcoes
                              ]);
      })
  }

  $('#resultado').html(
      `<table id="dt-basic-venda-venda-cancelada-empresa" class="table table-bordered table-hover table-stripe w-100">
          <thead class="bg-primary-600">
              <tr>
                  <th class="text-center">*</th>
                  <th class="text-center">Empresa</th>
                  <th class="text-center">Caixa</th>
                  <th class="text-center">Nº_Venda</th>
                  <th class="text-center">NFE/NFCe</th>
                  <th class="text-center">Abertura</th>
                  <th class="text-center">Operador</th>
                  <th class="text-center">Vr.Dinheiro</th>
                  <th class="text-center">Vr.Cartão</th>
                  <th class="text-center">Vr.Convenio</th>
                  <th class="text-center">Vr.POS</th>
                  <th class="text-center">Vr.Voucher</th>
                  <th class="text-center">Vr.Venda</th>
                  <th class="text-center">St_Nota</th>
                  <th class="text-center">Cancelado_Por</th>
                  <th class="text-center">Função</th>
                  <th class="text-center">Motivo</th>
                  <th class="text-center">Opções</th>
              </tr>
          </thead>
          <tbody id="resultadoListVendasCanceladasEmpresas" style="font-size: 12px !important;">
          </tbody>
          <tfoot id="totalConsolidadoMotivo"class="thead-themed">
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th style="text-align: center; color: blue; font-size: 14px;">Total Dinheiro: ${mascaraValor(vrTotalDinheiro.toFixed(2))}</label></th>
              <th style="text-align: center;"><label style="color: blue; font-size: 14px;">Total Cartao: ${mascaraValor(vrTotalCartao.toFixed(2))}</label></th>
              <th style="text-align: center;"><label style="color: blue; font-size: 14px;">Total Convenio: ${mascaraValor(vrTotalConvenio.toFixed(2))}</label></th>
              <th style="text-align: center; color: blue; font-size: 14px;">Total POS: ${mascaraValor(vrTotalPOS.toFixed(2))}</label></th>
              <th style="text-align: center;"><label style="color: blue; font-size: 14px;">Total Voucher: ${mascaraValor(vrTotalVoucher.toFixed(2))}</label></th>
              <th style="text-align: center;"><label style="color: blue; font-size: 14px;">Total Pago: ${mascaraValor(vrTotalVendas.toFixed(2))}</label></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
          </tfoot>
      </table>`
  );

  $('#dt-basic-venda-venda-cancelada-empresa').DataTable().clear().destroy();

  $('#dt-basic-venda-venda-cancelada-empresa').DataTable( {
      data: dadosTable,
      deferRender: true,
      responsive: true,
      columnDefs: [
          {
              targets: [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14],
              className: 'text-center',
          }
      ],
      dom:    "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center           justify-content-end'lB>>" +
                  "<'row'<'col-sm-12'tr>>" +
                  "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      buttons: [
                  {
                      extend: 'pdfHtml5',
                      text: 'PDF',
                      titleAttr: 'Generate PDF',
                      className: 'btn-outline-danger btn-sm mr-1'
                  },
                  {
                      extend: 'excelHtml5',
                      text: 'Excel',
                      titleAttr: 'Generate Excel',
                      className: 'btn-outline-success btn-sm mr-1'
                  },
                  {
                      extend: 'print',
                      text: 'Print',
                      titleAttr: 'Print Table',
                      className: 'btn-outline-primary btn-sm'
                  }
              ]
  } );
}

function selecionamarcavendas(){
  
  $("#idloja").empty();
  
  idmarca = $('#idmarca').val();

  ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca)
.then(retornoListaEmpresasSelectVendas)
.catch(funcError);
}

function retornoListaEmpresasSelectVendas(respostaListaEmpresas) {

  $("#idloja").select2();
  
  numPage = parseInt(respostaListaEmpresas.page);
  if(numPage === 1){
      $("#idloja").empty();
      $('#idloja').append(
        `<option value="0">Todos</option>`
    );
  }
  
for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

  IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
  DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

    $('#idloja').append(
      `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
    );
  
}
$("#idloja").select2("val", "0");
}
//=============================================================================================================
//========================================INÍCIO VENDAS CONTINGENCIA=============================================
function ListaVendasContingenciaPorEmpresa(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        ); 
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);
            $("#idmarca").select2();
        	$("#idloja").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas Contingência - <span class='fw-300'></span>`);
	
	ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch((e) => { funcError(), console.log(e) });
			
	ajaxGet('api/informatica/empresa.xsjs')
		.then(retornoListaEmpresasSelect)
		.catch((e) => { funcError(), console.log(e) });
      }
    };
    xmlhttp.open("GET", "administrativo_action_listvendascontingencia.html", true);
    xmlhttp.send();
}

function pesq_vendas_contingencia_por_empresa(numPage){
    var idgrupo = $("#idmarca").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    dataRetorno=[];
    contador = 0;
    var totalvendacancelada = 0;
    var totalvendaprodcancelada = 0;
   
    
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
        ajaxGet('api/administrativo/venda-ativa.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataFechamento=' + datapesqinicio + '&dataFechamentoFim=' + datapesqfim + '&statusContingencia=True&status=False')
        	.then(retornoListaVendasContingenciaPorEmpresa)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqvendascontingenciaempresas.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendasContingenciaPorEmpresas(numPage){
    
    var idgrupo = $("#idmarca").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

    ajaxGet('api/administrativo/venda-ativa.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataFechamento=' + datapesqinicio + '&dataFechamentoFim=' + datapesqfim + '&statusContingencia=True&status=False')
        	.then(retornoListaVendasContingenciaPorEmpresa)
        	.catch((e) => { funcError(), console.log(e) });
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasContingenciaPorEmpresa(respostaListaVendaContingencia) {
    let contador = 0;
    let { data } = respostaListaVendaContingencia || [];
    let dataRetorno = [];
    
    for (let i = 0; i < data.length; i++) { 
        let registro = data[i];
        let Empresa = registro['NOFANTASIA'];
        let NumCaixaContingencia = registro['IDCAIXAWEB'];
        let DescCaixaContingencia = registro['DSCAIXA'];
        let NuVendaContingencia = registro['IDVENDA'];
        let NuNFCeContingencia = registro['NFE_INFNFE_IDE_NNF'];
        let DTAberturaVendaContingencia = registro['DTHORAFECHAMENTO'];
        let NomeOperadorVendaContingencia = registro['NOFUNCIONARIO'];
        let FuncioCancelVendaContingencia = registro['NOFUNCIOCANCEL'];
        let FuncaoCancelVendaContingencia = registro['NOFUNCAOCANCEL'];
        let MotivoContingencia = registro['PROTNFE_INFPROT_XMOTIVO'] || registro['TXTMOTIVOCANCELAMENTO'];
        let cState = registro['PROTNFE_INFPROT_CSTAT'] || "";
        let dsUF = registro['UF'];
        let VrVendaContingencia = parseFloat(registro['VRTOTALPAGO']);
        let VrVendaProdContingencia = parseFloat(registro['TOTALVENDAPROD']);
        		
        contador ++;
        
        if(VrVendaContingencia>0){
            VrVendaContingencia1 = VrVendaContingencia;
        }else{
            VrVendaContingencia1 = VrVendaProdContingencia;
        }
        
        EmitidasContingencia = registro['STCONTINGENCIA'];
        if (EmitidasContingencia == 'True') {
        	NotaEmitidaContingencia = 'Contigência';
        } else {
        	NotaEmitidaContingencia = 'Emitida';
        }
        
        opcoes = `<div class="btn-group btn-group-xs">
            <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVendaContingencia +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
            <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVendaContingencia + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
            <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVendaContingencia + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
        </div>`;
            
        dataRetorno.push( [contador,
                            Empresa,
                            DescCaixaContingencia,
                            NuVendaContingencia,
                            NuNFCeContingencia,
                            DTAberturaVendaContingencia,
                            dsUF,
                            VrVendaContingencia1,
                            FuncioCancelVendaContingencia,
                            FuncaoCancelVendaContingencia,
                            NotaEmitidaContingencia,
                            cState,
                            MotivoContingencia,
                            opcoes
                            ]);
    }

     $('#resultado').html(
        `<table id="dt-basic-venda-venda-contingencia-empresa" class="table table-bordered table-hover table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>*</th>
                        <th>Empresa</th>
                        <th>Caixa</th>
                        <th>Nº Venda</th>
                        <th>NFCe</th>
                        <th>Abertura</th>
                        <th>UF</th>
                        <th>Valor</th>
                        <th>Cancelado Por</th>
                        <th>Função</th>
                        <th>Nota</th>
                        <th>Nr. Status</th>
                        <th>Motivo</th>
                        <th>Opções</th>
                    </tr>
                </thead>
                <tbody id="resultadoListVendasContingenciaEmpresas">
                </tbody>
                <tfoot id="totalConsolidadovendaContingencia" class="thead-themed">
                    <th>#</th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tfoot>
                
            </table>`
    );
   
    $('#dt-basic-venda-venda-contingencia-empresa').DataTable( {
        data: dataRetorno,
        "footerCallback": function ( row, data, start, end, display ) {
            var api = this.api(), data;
 
            // Remove the formatting to get integer data for summation
            var intVal = function ( i ) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '')*1 :
                    typeof i === 'number' ?
                        i : 0;
            };
 
            // Total over all pages
            totalVl = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
 
            // Total over this page
            pageTotalVl = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Update footer
            $( api.column( 7 ).footer() ).html(pageTotalVl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
        },
        deferRender:    true,
        responsive: true,
        dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [
                    {
                        extend: 'pdfHtml5',
                        text: 'PDF',
                        titleAttr: 'Generate PDF',
                        className: 'btn-outline-danger btn-sm mr-1'
                    },
                    {
                        extend: 'excelHtml5',
                        text: 'Excel',
                        titleAttr: 'Gerar Excel',
                        className: 'btn-outline-success btn-sm mr-1',
                        exportOptions: {
                          columns: ':visible',
                          format: {
                              body: function(data, row, column, node) {
                                  data = $('<p>' + data + '</p>').text();
                                  return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                              }
                          }
                        }
                    },
                    {
                        extend: 'print',
                        text: 'Print',
                        titleAttr: 'Print Table',
                        className: 'btn-outline-primary btn-sm'
                    }
                ]
    } );
}

//=============================================================================================================

//================ MENU RECEBIMENTOS ==============================================
function ListaRecebimentos() {

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        );
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            $('#dtconsultainicio').val(dataAtualCampo);
            $('#dtconsultafim').val(dataAtualCampo);

            $("#idfuncvenda").select2();
            $("#idgrupo").select2();
            $("#idlojavendadesc").select2();
            $("#dsformapag").select2();
            $("#dsparc").select2();
			
            ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch((e) => { funcError(), console.log(e) });
        		
        	ajaxGet('api/administrativo/formapagamento.xsjs')
        		.then(retornoListaFormaPagSelect)
        		.catch((e) => { funcError(), console.log(e) });
      }
    };
    xmlhttp.open("GET", "administrativo_action_listrecebimentosloja.html", true);
    xmlhttp.send();
}

function selecionaempresamarca(){

    idmarca = $('#idgrupo').val();

    ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca)
	.then(retornoListaEmpresasSelect)
	.catch((e) => { funcError(), console.log(e) });
}

function selecionafuncionarioreceb(){

    var EmpFunc = $("#idlojavendadesc").val();
    if(EmpFunc>0){
        		ajaxGet('api/administrativo/funcionarioreceb.xsjs?page=1&idEmpresa=' + EmpFunc)
        			.then(retornoListaFuncionarioReceb)
        			.catch((e) => { funcError(), console.log(e) });
    }else{
        $("#idfuncvenda").empty();
        $('#idfuncvenda').append(
	        `<option value="">Selecione ...</option>`
	    );
    }
}

function chamarProximaListaFuncionarioReceb(numPage){ 
    
    var EmpFunc = $("#idlojavendadesc").val();
    if(EmpFunc>0){
    	ajaxGet('api/administrativo/funcionarioreceb.xsjs?page='+numPage+'&idEmpresa=' + EmpFunc)
                .then(retornoListaFuncionarioReceb)
                .catch((e) => { funcError(), console.log(e) });
    }else{
        $("#idfuncvenda").empty();
        $('#idfuncvenda').append(
	        `<option value="">Selecione ...</option>`
	    );
    }
}

function retornoListaFuncionarioReceb(respostaListaFuncionarioReceb) {
    
    numPage = parseInt(respostaListaFuncionarioReceb.page);
    if(numPage === 1){
        $("#idfuncvenda").empty();
        $('#idfuncvenda').append(
	        `<option value="">Selecione ...</option>`
	    );
    }
    
	if(respostaListaFuncionarioReceb.data.length!= 0){
    
    	for (var i = 0; i < respostaListaFuncionarioReceb.data.length; i++) {
    
    		IDFuncionario = respostaListaFuncionarioReceb.data[i]['IDFUNCIONARIO'];
    		NomeFuncionario = respostaListaFuncionarioReceb.data[i]['NOFUNCIONARIO'];
    		NuLogin = respostaListaFuncionarioReceb.data[i]['NOLOGIN'];
    		StAtivo = respostaListaFuncionarioReceb.data[i]['STATIVO'];
    		NuCPF = respostaListaFuncionarioReceb.data[i]['NUCPF'];
            
    			$('#idfuncvenda').append(
    			    `<option value="` + IDFuncionario + `"> ` + NuLogin + ` - ` + NomeFuncionario + ` - ` + NuCPF + `</option>`
    			);
    	}
	    chamarProximaListaFuncionarioReceb(numPage + 1); 
	}
        
}

function retornoListaFormaPagSelect(respostaListaFormaPagSelect) {
    
    numPage = parseInt(respostaListaFormaPagSelect.page);
    if(numPage === 1){
        $("#dsformapag").empty();
        $('#dsformapag').append(
	        `<option value="">Selecione ...</option>`
	    );
    }
    
	if(respostaListaFormaPagSelect.data.length!= 0){
    
    	for (var i = 0; i < respostaListaFormaPagSelect.data.length; i++) {
    
    		DsFormaPag = respostaListaFormaPagSelect.data[i]['DSTIPOPAGAMENTO'];
            
    			$('#dsformapag').append(
    			    `<option value="` + DsFormaPag + `"> ` + DsFormaPag + `</option>`
    			);
    	}
	}
        
}

function pesqRecebimentos(numPage){
    var IDEmpresaGrupo = $("#idgrupo").val();
    var IDEmpresaPesqVenda = $("#idlojavendadesc").val();
    var IDFuncPesqVenda = $("#idfuncvenda").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var dsformapag = $("#dsformapag").val();
    var dsparc = $("#dsparc").val();
    var dsparcStr = dsparc.join(',');
    var dsformapagStr = dsformapag.join(',');
  
    // if(dsparc && dsparc.includes('all')) {
    //     $('#dspar > option').not('[value="all"]').prop("selected", true);
    //     $('#dsparc').trigger('change');
    
    //     dsparc = $('#dsparc').val().filter(function(item) {
    //       return item !== 'all';
    //     });
    
    // }
      
    // if(dsparc) {
    //  dsparc = dsparc.join(',');
    // }

    dataRetornoReceb=[];
    VrTotalRecebidoMoeda = 0;
    
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/administrativo/venda-total-recebido-periodo.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idFunc=' + IDFuncPesqVenda + '&dSFormaPag=' + dsformapagStr + '&dSParc=' + dsparcStr + '&idEmpGrupo=' + IDEmpresaGrupo)
        	.then(retornoListaRecebimentos)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqrecebimentosloja.html", true);
    xmlhttp.send();
}

function chamarProximaListaRecebidoLoja(numPage){

    var IDEmpresaGrupo = $("#idgrupo").val();
    var IDEmpresaPesqVenda = $("#idlojavendadesc").val();
    var IDFuncPesqVenda = $("#idfuncvenda").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var dsformapag = $("#dsformapag").val();
    var dsparc = $("#dsparc").val();
      
        ajaxGet('api/administrativo/venda-total-recebido-periodo.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idFunc=' + IDFuncPesqVenda + '&dSFormaPag=' + dsformapag + '&dSParc=' + dsparc + '&idEmpGrupo=' + IDEmpresaGrupo)
        	.then(retornoListaRecebimentos)
        	.catch((e) => { funcError(), console.log(e) });
		
	$("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaRecebimentos(respostaListaRecebimentos) {

    var numPageAtual = parseInt(respostaListaRecebimentos.page);

	if(respostaListaRecebimentos.data.length != 0){
	    for (var i = 0; i < respostaListaRecebimentos.data.length; i++) {
            var registro = respostaListaRecebimentos.data[i];
            
            nofantasia = registro.NOFANTASIA;
            dscaixa = registro.DSCAIXA;
            nofuncionario = registro.NOFUNCIONARIO;
            nologin = registro.NOLOGIN;
            nucpf = registro.NUCPF;
            datavenda = registro.DATAVENDA;
            valorrecebido = parseFloat(registro.VALORRECEBIDO);
            dstipopagamento = registro.DSTIPOPAGAMENTO;
            nparcelas = registro.NPARCELAS;
            dspag = registro.DSPAG;
            nuparc = registro.NUPARC;
            notef = registro.NOTEF;

            dataRetornoReceb.push( [nofuncionario,
                    nucpf,
                    nofantasia,
                    datavenda,
                    (valorrecebido),
                    dstipopagamento,
                    notef,
                    nparcelas
                    ]);

	    }
	    
	    chamarProximaListaRecebidoLoja(numPageAtual + 1); 
	    
	}else{
	            
        $('#resultado').html(
            `<table id="dt-basic-recebidomoedasloja" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th width="30%" style="font-size: 11px;">Operador</th>
                        <th width="5%" style="font-size: 11px;">CPF</th>
                        <th width="25%" style="font-size: 11px;">Empresa</th>
                        <th width="10%" style="font-size: 11px;">Data Recebimento</th>
                        <th width="10%" style="font-size: 11px;">Valor</th>
                        <th width="10%" style="font-size: 11px;">Forma Pag.</th>
                        <th width="10%" style="font-size: 11px;">Tipo Pag.</th>
                        <th width="5%" style="font-size: 11px;">QTD Parcelas</th>
                    </tr>
                </thead>
                <tbody id="resultadoRecebidoMoedas">
                </tbody>
                <tfoot id="totalConsolidado"class="thead-themed">
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tfoot>
            </table>`
        );
        
        $('#dt-basic-recebidomoedasloja').DataTable( {
            
            "footerCallback": function ( row, data, start, end, display ) {
                var api = this.api(), data;
     
                // Remove the formatting to get integer data for summation 
                var intVal = function ( i ) {
                    return typeof i === 'string' ?
                        i.replace(/[\$,]/g, '')*1 :
                        typeof i === 'number' ?
                            i : 0;
                };
     
                // Total over all pages
                totalVlRecebido = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
     
                // Total over this page
                pageTotalVlRecebido = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
                // Update footer
                $( api.column( 4 ).footer() ).html(pageTotalVlRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            },
            data: dataRetornoReceb,
            "columnDefs": [
                { "className": 'text-center', "targets": [1, 3, 5, 6, 7] },
                { "className": 'text-right', "targets": [ 4] },
                
            ],
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
    	
	}
}

function pesqRecebimentosFormPag(numPage){
    var IDEmpresaGrupo = $("#idgrupo").val();
    var IDEmpresaPesqVenda = $("#idlojavendadesc").val();
    var IDFuncPesqVenda = $("#idfuncvenda").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var dsformapag = $("#dsformapag").val();
    var dsparc = $("#dsparc").val();
  
    dataRetornoRecebFormPag=[];
    totalVlRecebidoDin = 0;
    totalVlRecebidoTEF = 0;
    totalVlRecebidoPOS = 0;
    totalVlRecebidoVouc = 0;
    totalVlRecebidoConv = 0;
    
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/administrativo/venda-total-forma-pag.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idFunc=' + IDFuncPesqVenda + '&dSFormaPag=' + dsformapag + '&dSParc=' + dsparc + '&idEmpGrupo=' + IDEmpresaGrupo)
        	.then(retornoListaRecebimentosFormPag)
        	.catch((e) => { funcError(), console.log(e) });
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqrecebimentosloja.html", true);
    xmlhttp.send();
}

function chamarProximaListaRecebidoFormPag(numPage){

    var IDEmpresaGrupo = $("#idgrupo").val();
    var IDEmpresaPesqVenda = $("#idlojavendadesc").val();
    var IDFuncPesqVenda = $("#idfuncvenda").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var dsformapag = $("#dsformapag").val();
    var dsparc = $("#dsparc").val();
      
        ajaxGet('api/administrativo/venda-total-forma-pag.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idFunc=' + IDFuncPesqVenda + '&dSFormaPag=' + dsformapag + '&dSParc=' + dsparc + '&idEmpGrupo=' + IDEmpresaGrupo)
        	.then(retornoListaRecebimentosFormPag)
        	.catch((e) => { funcError(), console.log(e) });
		
	$("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaRecebimentosFormPag(respostaListaRecebimentosFormPag) {

    var numPageAtual = parseInt(respostaListaRecebimentosFormPag.page);

	if(respostaListaRecebimentosFormPag.data.length != 0){
	    for (var i = 0; i < respostaListaRecebimentosFormPag.data.length; i++) {
            var registro = respostaListaRecebimentosFormPag.data[i];
            
            nofantasia = registro.NOFANTASIA;
            idvenda = registro.IDVENDA;
            datavenda = registro.DATAVENDA;
            valorrecebidodin = parseFloat(registro.VRRECDINHEIRO);
            valorrecebidotef = parseFloat(registro.VRRECCARTAO);
            valorrecebidopos = parseFloat(registro.VRRECPOS);
            valorrecebidovouc = parseFloat(registro.VRRECVOUCHER);
            valorrecebidoconv = parseFloat(registro.VRRECCONVENIO);
            dstipopagamento = registro.DSPAG;
            nparcelas = registro.NPARCELAS;
            noautorizacao = registro.NUAUTORIZACAO;
            notef = registro.NOTEF;

            dataRetornoRecebFormPag.push( [nofantasia,
                    idvenda,
                    datavenda,
                    (valorrecebidodin),
                    (valorrecebidotef),
                    (valorrecebidopos),
                    (valorrecebidovouc),
                    (valorrecebidoconv),
                    dstipopagamento,
                    notef,
                    noautorizacao,
                    nparcelas
                    ]);

	    }
	    
	    chamarProximaListaRecebidoFormPag(numPageAtual + 1); 
	    
	}else{
	            
        $('#resultado').html(
            `<table id="dt-basic-recebidoformpagloja" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th width="15%" style="font-size: 11px;">Empresa</th>
                        <th width="8%" style="font-size: 11px;">Venda</th>
                        <th width="8%" style="font-size: 11px;">Data Venda</th>
                        <th width="8%" style="font-size: 11px;">Dinheiro</th>
                        <th width="8%" style="font-size: 11px;">TEF</th>
                        <th width="8%" style="font-size: 11px;">POS</th>
                        <th width="8%" style="font-size: 11px;">Voucher</th>
                        <th width="8%" style="font-size: 11px;">Convênio</th>
                        <th width="10%" style="font-size: 11px;">Forma</th>
                        <th width="8%" style="font-size: 11px;">Tipo</th>
                        <th width="10%" style="font-size: 11px;">Autorização</th>
                        <th width="5%" style="font-size: 11px;">Parcelas</th>
                    </tr>
                </thead>
                <tbody id="resultadoRecebidoFormPag">
                </tbody>
                <tfoot id="totalConsolidadoFormPag"class="thead-themed">
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tfoot>
            </table>`
        );
        
        $('#dt-basic-recebidoformpagloja').DataTable( {
            
            "footerCallback": function ( row, data, start, end, display ) {
                var api = this.api(), data;
     
                // Remove the formatting to get integer data for summation 
                var intVal = function ( i ) {
                    return typeof i === 'string' ?
                        i.replace(/[\$,]/g, '')*1 :
                        typeof i === 'number' ?
                            i : 0;
                };
     
                // Total over all pages
                totalVlRecebidoDin = api.column( 3 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlRecebidoTEF = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlRecebidoPOS = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlRecebidoVouc = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlRecebidoConv = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
     
                // Total over this page
                pageTotalVlRecebidoDin = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlRecebidoTEF = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlRecebidoPOS = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlRecebidoVouc = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlRecebidoConv = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
                // Update footer
                $( api.column( 3 ).footer() ).html(pageTotalVlRecebidoDin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlRecebidoDin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 4 ).footer() ).html(pageTotalVlRecebidoTEF.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlRecebidoTEF.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 5 ).footer() ).html(pageTotalVlRecebidoPOS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlRecebidoPOS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 6 ).footer() ).html(pageTotalVlRecebidoVouc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlRecebidoVouc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 7 ).footer() ).html(pageTotalVlRecebidoConv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlRecebidoConv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            },
            data: dataRetornoRecebFormPag,
            "columnDefs": [
                { "className": 'text-center', "targets": [0, 1, 2, 8, 9, 10, 11] },
                { "className": 'text-right', "targets": [3, 4, 5, 6, 7] },
                
            ],
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Gerar Excel',
                            className: 'btn-outline-success btn-sm mr-1',
                            exportOptions: {
                              columns: ':visible',
                              format: {
                                  body: function(data, row, column, node) {
                                      data = $('<p>' + data + '</p>').text();
                                      return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                                  }
                              }
                            }
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
    	
	}
}

//? ================================================== INICIO Rotina - Create Edit Cancel - VOUCHER ================================================== //
/*
    Autor: Hendryw Deyvison
    E-mail: hendryw.deyvison@gmail.com
    Data: 22/07/2024

    Data_Atualização: 31/10/2024
*/

function mascaraMulti(dados, funcao) {
    v_obj = dados
    v_fun = funcao
    setTimeout('execmascara()', 1)
}

function mascaraMultiAutomatica(dados) {
    v_obj = dados;
    setTimeout('execmascaraAutomatica()', 1)
}

function execmascaraAutomatica() {
    v_obj.value = v_obj.value.length > 15 ? Cnpj(v_obj.value) : Cpf(v_obj.value)
}

function execmascara() {
    v_obj.value = v_fun(v_obj.value)
}

function onlyNum(valor) {
    valor = String(valor).replace(/\D/g, "")
    return valor;
}

// Mascara do CPF
function Cpf(valor) {
    valor = String(valor).replace(/\D/g, "");

    if (valor) {
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2")

        valor = valor.replace(/(\d{3})(\d)/, "$1.$2")

        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }

    return valor
}

// Mascara do CNPJ
function Cnpj(valor) {
    valor = String(valor).replace(/\D/g, "")

    if (valor) {
        valor = valor.replace(/^(\d{2})(\d)/, "$1.$2")

        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")

        valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2")

        valor = valor.replace(/(\d{4})(\d)/, "$1-$2")
    }

    return valor
}

// Mascara do TELEFONE
function Fone(valor) {

    //Remove tudo o que não é dígito
    valor = String(valor).replace(/\D/g, "")

    if (valor) {
        valor = valor.replace(/^(\d{0})(\d)/, "$1($2")

        valor = valor.replace(/(\d{2})(\d)/, "$1) $2")

        valor = valor.replace(/(\d{3})(\d)/, "$1$2-")

        if (valor.length > 14) {
            valor = valor.replace(/\D/g, '')
            valor = valor.replace(/(\d{2})(\d)/, "($1) $2")
            valor = valor.replace(/(\d)(\d{8})$/, "$1 $2")
            valor = valor.replace(/(\d)(\d{4})$/, "$1-$2")

        }
    }

    return valor


}

// Mascara do CEP
function Cep(valor) {
    valor = String(valor).replace(/\D/g, "");

    if (valor) {
        valor = valor.replace(/^(\d{2})(\d)/, "$1.$2")

        valor = valor.replace(/(\d{3})(\d)/, "$1-$2")
    }

    return valor
}

//	função que mascara o CPF
function maskCPF(CPF) {
    return CPF.substring(0, 3) + "." + CPF.substring(3, 6) + "." + CPF.substring(6, 9) + "-" + CPF.substring(9, 11);
}

//	função que mascara o CNPJ
function maskCNPJ(CNPJ) {
    return CNPJ.substring(0, 2) + "." + CNPJ.substring(2, 5) + "." + CNPJ.substring(5, 8) + "/" + CNPJ.substring(8, 12) + "-" + CNPJ.substring(12, 14);
}

//	função que mascara o TELEFONE
function maskFone(Fone) {
    //Remove tudo o que não é dígito
    let valor = Fone.replace(/\D/g, "")

    if (valor) {
        valor = valor.replace(/^(\d{0})(\d)/, "$1($2")

        valor = valor.replace(/(\d{2})(\d)/, "$1) $2")

        valor = valor.replace(/(\d{3})(\d)/, "$1$2-")

        if (valor.length > 14) {
            valor = valor.replace(/\D/g, '')
            valor = valor.replace(/(\d{2})(\d)/, "($1) $2")
            valor = valor.replace(/(\d)(\d{8})$/, "$1 $2")
            valor = valor.replace(/(\d)(\d{4})$/, "$1-$2")

        }
    }

    return valor
}

//	função que mascara o CEP
function maskCEP(CEP) {
    return CEP.substring(0, 2) + "." + CEP.substring(2, 5) + "-" + CEP.substring(5, 8);
}

//	função que mascara o VALOR
function maskValor(valor) {
    return new Intl.NumberFormat('br-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

//funcao OnlyNumbers
function onlyNumberKey(event) {
    var key = window.event ? event.keyCode : event.which;

    if (event.keyCode === 8 || event.keyCode === 46) {
        return true;
    } else if (key < 48 || key > 57) {
        return false;
    } else {
        return true;
    }

}

// Converter número no formato string para número por extenso.
String.prototype.extenso = function (c) { // Função para converter número no formato string para número por extenso.
    var ex = [
        ["Zero", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove"],
        ["Dez", "Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa"],
        ["Cem", "Cento", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seiscentos", "Setecentos", "Oitocentos", "Novecentos"],
        ["Mil", "Milhão", "Bilhão", "Trilhão", "Quadrilhão", "Quintilhão", "Sextilhão", "Setilhão", "Octilhão", "Nonilhão", "Decilhão", "Undecilhão", "Dodecilhão", "Tredecilhão", "Quatrodecilhão", "Quindecilhão", "Sedecilhão", "Septendecilhão", "Octencilhão", "Nonencilhão"]
    ];
    var a, n, v, i, n = this.replace(c ? /[^,\d]/g : /\D/g, "").split(","), e = " e ", $ = "Real", d = "Centavo", sl;
    for (var f = n.length - 1, l, j = -1, r = [], s = [], t = ""; ++j <= f; s = []) {
        j && (n[j] = (("." + n[j]) * 1).toFixed(2).slice(2));
        if (!(a = (v = n[j]).slice((l = v.length) % 3).match(/\d{3}/g), v = l % 3 ? [v.slice(0, l % 3)] : [], v = a ? v.concat(a) : v).length) continue;
        for (a = -1, l = v.length; ++a < l; t = "") {
            if (!(i = v[a] * 1)) continue;
            i % 100 < 20 && (t += ex[0][i % 100]) ||
                i % 100 + 1 && (t += ex[1][(i % 100 / 10 >> 0) - 1] + (i % 10 ? e + ex[0][i % 10] : ""));
            s.push((i < 100 ? t : !(i % 100) ? ex[2][i == 100 ? 0 : i / 100 >> 0] : (ex[2][i / 100 >> 0] + e + t)) +
                ((t = l - a - 2) > -1 ? " " + (i > 1 && t > 0 ? ex[3][t].replace("ão", "ões") : ex[3][t]) : ""));
        }
        a = ((sl = s.length) > 1 ? (a = s.pop(), s.join(" ") + e + a) : s.join("") || ((!j && (n[j + 1] * 1 > 0) || r.length) ? "" : ex[0][0]));
        a && r.push(a + (c ? (" " + (v.join("") * 1 > 1 ? j ? d + "s" : (/0{6,}$/.test(n[0]) ? "de " : "") + $.replace("l", "is") : j ? d : $)) : ""));
    }
    return r.join(e);
}

function retornaDiasEntreDatas(dataHoraInicio = "", dataHoraFim = "", zerarHorario = true) {
    dataHoraInicio = dataHoraInicio ? new Date(dataHoraInicio) : new Date();
    dataHoraFim = dataHoraFim ? new Date(dataHoraFim) : new Date();

    if (zerarHorario) {
        dataHoraInicio.setHours(0, 0, 0, 0);
        dataHoraFim.setHours(0, 0, 0, 0);
    }

    return Math.ceil(Math.abs(dataHoraFim - dataHoraInicio) / (1000 * 60 * 60 * 24));
}


//----------FIM Funcoes Globais da Rotina----------//

///----------INICIO Modais de Interação Com o Usuario----------///
async function modalAuthUserCreateVoucher(idVenda, stTipoTroca) {
    let dadosUser;
    let dataUserLogado = await getCurrentUser()?.user;
    let lojaLogada = dataUserLogado?.IDEMPRESA;
    let grupoLojaLogada = dataUserLogado?.IDGRUPOEMPRESARIAL;
    let htmlModalAuth = `
    <div class="text-dark fw-900">

        <label class="form-label" for="matricula">Matricula</label>
        <div class="input-group">
            <input id="matricula" class="swal2-input z-index-5 mt-0 w-75" type="text" autocomplete="off" placeholder="Digite sua Matrícula" style="text-align: center;" onkeypress="mascaraMulti(this, onlyNum)">
        </div>

        <label class="form-label" for="senha">Senha</label>
        <div class="input-group">
            <input id="senha" class="swal2-input mt-0 w-75" type="password" autocomplete="off" placeholder="Digite sua Senha" style="text-align: center;">
        </div>

    </div>
`;

    return Swal.fire({
        title: 'Autorização',
        html: htmlModalAuth,
        width: '20rem',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Voltar',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
        onOpen: () => {
            $('#matricula').on('keypress', (e) => { if (e.keyCode == 13) $('#senha').val('').focus() });
            $('#senha').on('keypress', (e) => { if (e.keyCode == 13) Swal.clickConfirm() });

            $('#swal2-validation-message').addClass('text-danger fw-700');
        },
        didOpen: () => {
            $('#matricula').focus();
        },
        preConfirm: async () => {
            let matricula = $('#matricula').val()?.trim();
            let senha = $('#senha').val()?.trim();
            let loginFunc;

            if (!matricula || !senha) {
                !matricula ? $('#matricula').val('').focus() : $('#senha').val('').focus();
                return Swal.showValidationMessage('Campo de Matrícula ou Senha vazio');
            }

            loginFunc = {
                "MATRICULA": matricula,
                "SENHA": senha,
                "IDEMPRESALOGADA": lojaLogada,
                "IDGRUPOEMPRESARIAL": grupoLojaLogada,
                "IDVENDA": idVenda,
                "STTIPOTROCA": stTipoTroca
            };

            return ajaxPost(`api/resumo-voucher/auth-funcionario-create-voucher.xsjs`, loginFunc)
                .then(async (response) => {
                    let { data } = response;

                    dadosUser = data[0];
                })
                .catch((returnError) => {
                    let { error } = returnError;

                    Swal.hideLoading();

                    console.log(returnError);
                    $('#matricula').focus();

                    return Swal.showValidationMessage(error || 'Erro ao tentar validar o usuário, recarregue e tente novamente!');
                })
        }
    }).then(async (result) => {
        if (result.value) {
            return dadosUser;
        }

        return false;
    })
}

async function modalAuthUserEditOrPrintVoucher(idVoucher = '', MODOPRINT = false) {
    let dadosUser;
    let dataUserLogado = await getCurrentUser()?.user;
    let lojaLogada = dataUserLogado?.IDEMPRESA;
    let grupoLojaLogada = dataUserLogado?.IDGRUPOEMPRESARIAL;
    let htmlModalAuth = `
    <div class="text-dark fw-900">

        <label class="form-label" for="matricula">Matricula</label>
        <div class="input-group">
            <input id="matricula" class="swal2-input z-index-5 mt-0 w-75" type="text" autocomplete="off" placeholder="Digite sua Matrícula" style="text-align: center;" onkeypress="mascaraMulti(this, onlyNum)">
        </div>

        <label class="form-label" for="senha">Senha</label>
        <div class="input-group">
            <input id="senha" class="swal2-input mt-0 w-75" type="password" autocomplete="off" placeholder="Digite sua Senha" style="text-align: center;">
        </div>

    </div>
`;

    return Swal.fire({
        title: 'Autorização',
        html: htmlModalAuth,
        width: '20rem',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Voltar',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
        onOpen: () => {
            $('#matricula').on('keypress', (e) => { if (e.keyCode == 13) $('#senha').focus() });
            $('#senha').on('keypress', (e) => { if (e.keyCode == 13) Swal.clickConfirm() });

            $('#swal2-validation-message').addClass('text-danger fw-700');
        },
        didOpen: () => {
            $('#matricula').focus();
        },
        preConfirm: async () => {
            let matricula = $('#matricula').val().trim();
            let senha = $('#senha').val().trim();
            let loginFunc;

            if (!matricula || !senha) {
                !matricula ? $('#matricula').val('').focus() : $('#senha').val('').focus();
                return Swal.showValidationMessage('Campo de Matrícula ou Senha vazio');
            }

            loginFunc = {
                "MATRICULA": matricula,
                "SENHA": senha,
                "IDVOUCHER": idVoucher,
                "IDEMPRESALOGADA": lojaLogada,
                "IDGRUPOEMPRESARIAL": grupoLojaLogada
            };

            let api = !MODOPRINT ? 'auth-funcionario-update-voucher' : 'auth-funcionario-print-voucher';

            return ajaxPost(`api/resumo-voucher/${api}.xsjs`, loginFunc)
                .then(async (response) => {
                    let { data } = response;

                    dadosUser = data[0];
                })
                .catch((returnError) => {
                    let { error } = returnError;
                    console.log(returnError);
                    $('#matricula').focus();
                    return Swal.showValidationMessage(error || 'Error ao tentar validar o usuário, recarregue e tente novamente!');
                })
        }
    }).then(async (result) => {
        if (result.value) {
            return dadosUser;
        }

        return false;
    })
}

///----------FIM Modais de Interação Com o Usuario----------///

async function CreateEditVoucher(opcao, idVoucher = '') {
    try {

        if (opcao == 1) {
            animationLoadingStart();

            await $.get("administrativo_action_consultaVouchers.html", (respHtml) => {
                $("#js-page-content").html(respHtml);

            }).fail((error) => { throw error });

            await ajaxGetAllData('api/grupo-empresarial.xsjs', false)
                .then(retornoSelectGrupoLojasVoucher)
                .catch((error) => { throw error });

            await ajaxGetAllData('api/empresa.xsjs', false)
                .then(retornoSelectLojasVouchers)
                .catch((error) => { throw error });

            $('.dataAtual').text(dataAtual);

            $('#dtconsultainicio, #dtconsultafim').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVoucherEmitido() });
            $('#NVoucher').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVoucherEmitido() }).focus();;

            animationLoadingStop();

        } else {
            $('.idCadastraCliente').attr('id', '')
            $('.idCadastraVoucher ').addClass('d-none')
            $('.tabelaProduto').addClass('d-none')
            $("#resultadoProduto").DataTable().clear().destroy();
            $('.tabelaVenda').removeClass('d-none')
            $("#voltaTela").attr('onclick', 'CreateEditVoucher(1)')
        }

    } catch (error) {
        animationLoadingStop();
        console.log(error);
        msgError('Erro ao carregar os dados da página, Recarregue e tente novamente!');
    }

}

function retornoSelectGrupoLojasVoucher(respostaSelectGrupoLojasVoucher) {
    let { data } = respostaSelectGrupoLojasVoucher || [];

    for (let i = 0; i < data.length; i++) {
        let { IDGRUPOEMPRESARIAL, DSGRUPOEMPRESARIAL } = data[i];

        DSGRUPOEMPRESARIAL = DSGRUPOEMPRESARIAL ? (DSGRUPOEMPRESARIAL.split('-'))[1] : DSGRUPOEMPRESARIAL;

        $('#idGrupoLojaVoucher').append(`
        <option value="${IDGRUPOEMPRESARIAL}"> ${DSGRUPOEMPRESARIAL} </option>
    `);
    }

    $('#idGrupoLojaVoucher').select2();
}

async function selectLojasVouchers(idGrupoEmpresarial = '') {
    try {
        await ajaxGetAllData(`api/empresa.xsjs?idSubGrupoEmpresa=${idGrupoEmpresarial}`)
            .then(retornoSelectLojasVouchers)
            .catch((error) => { throw error });
    } catch (error) {
        animationLoadingStop();
        console.log(error);
        msgError('Erro ao carregar os dados das Lojas, Recarregue e tente novamente!');
    }
}

function retornoSelectLojasVouchers(respostaSelectLojasVouchers) {
    $('#idLojaVoucher').html(`<option value=""> Todas </option>`);

    let { data } = respostaSelectLojasVouchers || [];

    for (let i = 0; i < data.length; i++) {
        let { IDEMPRESA, NOFANTASIA } = data[i];

        $('#idLojaVoucher').append(`
        <option value="${IDEMPRESA}"> ${NOFANTASIA} </option>
    `);
    }

    $('#idLojaVoucher').select2();
}

async function pesquisaVoucherEmitido(tpRetorno = 'voucher') {
    try {
        let numerovoucher = $("#NVoucher").val()?.trim() || "";
        let grupoEmpresa = $('#idGrupoLojaVoucher').val();
        let idEmpresa = !numerovoucher ? $('#idLojaVoucher').val() : "";
        let dtInicio = !numerovoucher ? $('#dtconsultainicio').val() : "";
        let dtFim = !numerovoucher ? $('#dtconsultafim').val() : "";
        
        let numerovoucherFormatado = numerovoucher.split('-');
        
        if (numerovoucherFormatado?.length > 2) {
            numerovoucher = numerovoucherFormatado.join('-');
            $("#NVoucher").val(numerovoucher);
        } else {
            numerovoucher = numerovoucher.replace(/[^0-9]/g, '');
            $("#NVoucher").val(numerovoucher);
        }
        
        if(numerovoucher?.length == 0){
            let dtInicioTime = new Date(dtInicio);
            let dtFimTime = new Date(dtFim);
            
            if (!dtInicioTime?.getTime()){
                return msgError('Data INICIO inválida!').then(() => setTimeout(()=>$('#dtconsultainicio').focus(), 300));
            }
            
            if (!dtFimTime?.getTime()) {
                return msgError('Data FIM inválida!').then(() => setTimeout(() => $('#dtconsultafim').focus(), 300));
            }
            
            if (dtInicioTime.getTime() > dtFimTime.getTime()){
                return msgError('Data de início deve ser menor que a data de fim!').then(() => setTimeout(() => $('#dtconsultainicio').focus(), 300));
            }
        }
        
       await ajaxGetAllData(`api/administrativo/voucher-completo.xsjs?dataPesquisaInicio=${dtInicio}&dataPesquisaFim=${dtFim}&dadosVoucher=${numerovoucher}&subgrupoEmpresa=${grupoEmpresa}&idEmpresa=${idEmpresa}&pageSize=20000`, 'Carregando dados, aguarde...')
            .then(retornoListaVouchers)
            .catch((error) => { throw error; })

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function ocultaParteDosDadosVoucher(stringParaOcultar = '') {
    if (stringParaOcultar) {
        let dadoString = String(stringParaOcultar);
        let stringPronta = dadoString.substring(0, 5) + ((dadoString.substring(5, dadoString.length - 4)).replace(/[0-9]/g, "*")) + dadoString.substring(dadoString.length - 4);

        return stringPronta;
    } else {
        console.error("O parametro(stringParaOcultar) passado para a função(ocultaParteDosDados) está vazio!");
        return false;
    }
}

async function retornoListaVouchers(voucherEmitido) {
    let { data } = voucherEmitido || [];
    let dadosTable = [];
    let indice = 1;

    animationLoadingStart('Montando visualização, aguarde...', 100);

    for (let dados of data) {
        let IDVoucher = dados?.IDVOUCHER;
        let DTVoucherIN = dados?.DTINVOUCHERFORMATADO;
        let DTVoucherOUT = dados?.DTOUTVOUCHERFORMATADO || "";
        let idCaixaOrigem = dados?.IDCAIXAORIGEM;
        let DSCaixaOrigem = idCaixaOrigem !== 99999 ? dados?.DSCAIXAORIGEM : 'CAIXA WEB';
        let nomeUsrAutorizaCriacao = dados?.NOFUNCIONARIOLIBERACAOCRIACAO || "";
        let DSCaixaDestino = dados?.DSCAIXADESTINO || "";
        let nomeUsrAutorizaConsumo = dados?.NOFUNCIONARIOLIBERACAOCONSUMO || "";
        let NuVoucher = dados?.NUVOUCHER;
        let VrVoucher = parseFloat(dados?.VRVOUCHER);
        let STAtivoVoucher = dados?.STATIVO;
        let STCanceladoVoucher = dados?.STCANCELADO;
        let STStatusVoucher = dados?.STSTATUS;
        let EmpresaOrigem = dados?.NOMEFANTASIAEMPRESAORIGEM;
        let EmpresaDestino = dados?.NOMEFANTASIAEMPRESADESTINO || "";
        let idSapVenda = Number(dados?.IDSAP_VENDA || 0);
        let cstatVenda = Number(dados?.CSTAT_VENDA || 0);
        let stcontingenciaVenda = dados?.STCONTINGENCIA == 'True';
        let idSapCliente = Number(dados?.IDSAP_CLIENTE || 0);
        let idSapDevolucao = Number(dados?.IDSAP_DEVOLUCAO || 0);
        let msgRetornoSefazNotaDevolucao = dados?.MSGRETORNOSEFAZNOTADEVOLUCAO || "";
        let stHaTransferencia = dados?.STTRANSFERIRPRODUTO == 'True';
        let idSapNotaSaidaTransferencia = Number(dados?.IDSAPNOTASAIDATRANSFERENCIA || 0);
        let msgRetornoSefazNotaSaidaTransferencia = dados?.MSGRETORNOSEFAZNOTASAIDATRANSFERENCIA || "";
        let idSapNotaEntradaTransferencia = Number(dados?.IDSAPNOTAENTRADATRANSFERENCIA || 0);
        let tipoVoucher = dados?.STTIPOTROCA || 'CORTESIA';
        let tipoCliente = dados?.TPCLIENTE;
        let classTipoVoucher = 'text-info';
        let classStVoucher = 'text-info';
        let tagVoucherAtivo;
        let situacaoVoucher;
        let {
            LOGERRORVENDA,
            LOGERRORCLIENTE,
            LOGERRORVOUCHER
        } = dados;
        
        // PARTE DO LOG DE ANDAMENTO DA INTEGRACÃO DA DEVOLUÇÃO E TRANSFERÊNCIA
        let logIntegracao = LOGERRORVENDA || LOGERRORCLIENTE || LOGERRORVOUCHER || "";

        let stErrorLogIntegracao = logIntegracao != 'VENDA NÃO MIGRADA' && logIntegracao?.length > 0;

        //VERIFICA SE TEM QUE QUE FAZER TRANSFERÊNCIA NO VOUCHER
        let indexMsg = '';

        let stIntegracaoDevolucaoSap = dados?.STDEVOLUCAOSAP == 'True';
        let stIntegracaoTransferenciaSap = dados?.STTRANSFERENCIASAP == 'True';
        let stTransferenciaCompleta = dados.STTRANSFERENCIACOMPLETASAP == 'True';

        // PARTE DO LOG RETORNO DA SEFAZ DAS NOTAS INTEGRADAS
        let logSefaz = msgRetornoSefazNotaDevolucao || msgRetornoSefazNotaSaidaTransferencia || "";
        let numStateSefazNotaDevolucao = dados?.NUMSTATESEFAZNOTADEVOLUCAO;
        let numStateSefazNotaSaidaTransferencia = dados?.NUMSTATESEFAZNOTASAIDATRANSFERENCIA;
        let stErrorSefaz = numStateSefazNotaDevolucao > 108 ? msgRetornoSefazNotaDevolucao : numStateSefazNotaSaidaTransferencia > 108 ? msgRetornoSefazNotaSaidaTransferencia : "";

        let msgLogRetornoSap = '';

        let classStDevolucao = 'text-info';

        let statusDevolucaoTransferenciaVoucher = [
            'ERRO AO INTEGRAR A VENDA!', //0
            'ERRO AO INTEGRAR O CLIENTE!',//1
            'ERRO AO GERAR A DEVOLUÇÃO!',//2
            'ERRO AO GERAR A NOTA DE SAÍDA DA TRANSFERÊNCIA!',//3
            'ERRO AO GERAR A NOTA DE ENTRADA DA TRANSFERÊNCIA!',//4
            'AGUARDANDO NOTA DE DEVOLUÇÃO', //5
            'AGUARDANDO NOTA DE SAIDA DA TRANSFERÊNCIA',//6
            'AGUARDANDO NOTA DE ENTRADA DA TRANSFERÊNCIA',//7
            'NOTA DE DEVOLUÇÃO INTEGRADA',//8
            'NOTA DE SAIDA DA TRANSFERÊNCIA INTEGRADA',//9
            'NOTA DE ENTRADA DA TRANSFERÊNCIA INTEGRADA',//10
            'PROCESSO DE DEVOLUÇÃO REALIZADO COM SUCESSO!',//11
            'PROCESSO DE DEVOLUÇÃO E TRANSFERÊNCIA REALIZADO COM SUCESSO!',//12
        ];

        let arrayMsgSAP = [
            'VENDA EM CONTINGÊNCIA',
            'VENDA NÃO INTEGRADA',
            'VENDA NÃO MIGRADA',
            'AGUARDANDO GERAÇÃO MANUAL DA DEVOLUÇÃO(VENDA NFCE(65) PARA NFE(55))',
            'AGUARDANDO GERAÇÃO MANUAL DA DEVOLUÇÃO(PESSOA JURÍDICA)',
            'Invalid session or session already timeout.',
            'Nota Fiscal number was already used for a BP; ',
            '(167) rsd sap - não é permitido realizar movimentação nesta loja. a mesma econtra-se em processo de (balanço).'
        ];

        if (stErrorLogIntegracao) {
            classStDevolucao = 'text-danger';

            if (!idSapCliente || LOGERRORCLIENTE?.length > 0) {
                indexMsg = 1;
            }

            if (!idSapVenda && LOGERRORVENDA?.length > 0) {
                indexMsg = 0;
            }

            if (!idSapDevolucao && LOGERRORVOUCHER?.length > 0) {
                indexMsg = 2;
            }

            if (idSapDevolucao && stHaTransferencia) {
                if (!idSapNotaEntradaTransferencia) {
                    indexMsg = 4;
                }

                if (!idSapNotaSaidaTransferencia) {
                    indexMsg = 3;
                }
            }

            msgLogRetornoSap = !arrayMsgSAP.includes(logIntegracao) ? await translateText(logIntegracao) : logIntegracao;
            msgLogRetornoSap = msgLogRetornoSap == 'Invalid session or session already timeout.' ? 'Sessão inválida ou sessão já expirou' : msgLogRetornoSap;
            msgLogRetornoSap = msgLogRetornoSap == 'Nota Fiscal number was already used for a BP; ' ? 'O número da Nota Fiscal já foi utilizado para um PN' : msgLogRetornoSap;

        } else {
            if (!idSapDevolucao) {
                indexMsg = 5;
            }

            if (idSapDevolucao && stHaTransferencia) {
                if (!idSapNotaEntradaTransferencia) {
                    indexMsg = 7;
                }

                if (!idSapNotaSaidaTransferencia) {
                    indexMsg = 6;
                }
            }

            if (stErrorSefaz) {

                if (numStateSefazNotaDevolucao > 108) {
                    indexMsg = numStateSefazNotaDevolucao > 108 ? 2 : 5;

                } else {
                    indexMsg = numStateSefazNotaSaidaTransferencia > 108 ? 3 : 6;
                }

                msgLogRetornoSap = logSefaz;
                classStDevolucao = 'text-danger';

            } else {
                indexMsg = 5;// aguardando nfe devolucao

                if (idSapDevolucao > 0) {
                    indexMsg = 11;// devolucao integrada

                    if (numStateSefazNotaDevolucao !== 100) {
                        msgLogRetornoSap = (logSefaz || 'AGUARDANDO RETORNO DA SEFAZ');

                    } else {

                        if (stHaTransferencia) {
                            indexMsg = 6; // aguardando nfe saida transferencia

                            if (idSapNotaSaidaTransferencia > 0) {
                                indexMsg = 9; // nfe saida transferencia integrada

                                if (numStateSefazNotaSaidaTransferencia !== 100) {
                                    msgLogRetornoSap = (logSefaz || 'AGUARDANDO RETORNO DA SEFAZ');
                                } else {
                                    indexMsg = 7; // aguardando nfe entrada transferencia

                                    if (idSapNotaEntradaTransferencia) {
                                        indexMsg = 12; // nfe entrada transferencia integrada
                                    }

                                }


                            }

                        }
                    }

                    if (numStateSefazNotaDevolucao !== 100 || numStateSefazNotaSaidaTransferencia !== 100){
                        classStDevolucao = tipoCliente == 'JURIDICA' ? 'text-danger' : 'text-primary';
                    }

                    msgLogRetornoSap = indexMsg > 10 ? `PROCESSO FINALIZADO${tipoCliente == 'JURIDICA' ? ' (PESSOA JURÍDICA)' : ''}!` : msgLogRetornoSap;
                }
            }
        }

        statusDevolucaoTransferenciaVoucher = statusDevolucaoTransferenciaVoucher[indexMsg];

        classStDevolucao = indexMsg > 7 ? 'text-success' : classStDevolucao;

        if (STCanceladoVoucher == 'True' || tipoVoucher == 'TROCO') {
            msgLogRetornoSap = '';
            statusDevolucaoTransferenciaVoucher = '';
        }

        classStDevolucao = indexMsg > 7 ? 'text-success' : classStDevolucao;

        if (tipoVoucher == 'DEFEITO') {
            classTipoVoucher = 'text-danger';
        }

        if (tipoVoucher == 'TROCO') {
            classTipoVoucher = 'text-primary';
        }

        if (STAtivoVoucher == 'True' && !STStatusVoucher) {
            situacaoVoucher = tipoVoucher == 'TROCO' ? 'LIBERADO PARA O CLIENTE' : 'NOVO';
        } else if (STAtivoVoucher == 'False' && !STStatusVoucher) {
            situacaoVoucher = 'FINALIZADO';
            classStVoucher = 'text-danger'
        } else if (STAtivoVoucher == 'True' && (STStatusVoucher == 'LIBERADO PARA O CLIENTE' || STStatusVoucher == 'NOVO')) {
            situacaoVoucher = STStatusVoucher;
        } else if (STAtivoVoucher == 'False' && (STStatusVoucher == 'NEGADO' || STStatusVoucher == 'CANCELADO' || STStatusVoucher == 'FINALIZADO')) {
            situacaoVoucher = STStatusVoucher;
            classStVoucher = 'text-danger'
        } else if (STAtivoVoucher == 'False' && STCanceladoVoucher == 'False' && STStatusVoucher == 'EM ANALISE') {
            situacaoVoucher = STStatusVoucher;
        } else if (STAtivoVoucher == 'False' && STCanceladoVoucher == 'True' && !STStatusVoucher) {
            situacaoVoucher = STStatusVoucher;
            classStVoucher = 'text-danger'
        } else if (STCanceladoVoucher == 'True') {
            situacaoVoucher = 'CANCELADO';
            classStVoucher = 'text-danger'
        } else {
            situacaoVoucher = 'FINALIZADO';
            classStVoucher = 'text-danger'
        }

        tipoVoucher = `<label class="text-center ${classTipoVoucher} fw-900"style="font-size: 11px;" >${tipoVoucher}</label>`;
        tagVoucherAtivo = `<label class="text-center ${classStVoucher} fw-900"style="font-size: 11px;" >${situacaoVoucher}</label>`;
        statusDevolucaoTransferenciaVoucher = `<label class="text-center ${classStDevolucao} fw-900"style="font-size: 11px;" >${statusDevolucaoTransferenciaVoucher}</label>`;
        msgLogRetornoSap = msgLogRetornoSap?.length > 0 ? `<label class="text-center ${classStDevolucao} fw-900"style="font-size: 11px;" >${msgLogRetornoSap?.toUpperCase()}</label>` : '';

        dadosTable.push([
            `<label id="${IDVoucher}" style="color: blue; font-size: 11px;">${indice}</label>`,
            `<label style="color: blue; font-size: 11px;">${(NuVoucher)}</label>`,
            `<label style="color: blue; font-size: 11px;">${EmpresaOrigem}</label>`,
            `<label style="color: blue; font-size: 11px;">${DSCaixaOrigem}</label>`,
            `<label style="color: blue; font-size: 11px;">${nomeUsrAutorizaCriacao}</label>`,
            `<label style="color: blue; font-size: 11px;">${DTVoucherIN}</label>`,
            `<label style="align: right; color: green; font-size: 11px;">${maskValorEmBRL(VrVoucher)}</label>`,
            `<label style="color: blue; font-size: 11px;">${EmpresaDestino}</label>`,
            `<label style="color: blue; font-size: 11px;">${DSCaixaDestino}</label>`,
            `<label style="color: blue; font-size: 11px;">${nomeUsrAutorizaConsumo}</label>`,
            `<label style="color: blue; font-size: 11px;">${DTVoucherOUT}</label>`,
            tipoVoucher,
            tagVoucherAtivo,
            statusDevolucaoTransferenciaVoucher,
            msgLogRetornoSap,
            `<div class="btn-group btn-group-xs">
            <button id="detalheVoucher" type="button" class="btn btn-success btn-xs" title="Visualizar Detalhes" value="${IDVoucher}" ><span class="fal fa-list p-1"></button>
            <button type="button" class="btn btn-warning btn-xs" title="Editar Situação" id="${IDVoucher}" onclick="editarStatusVoucher(this.id);"><span class="fal fa-pen p-1 text-white"></button>
            <button type="button" class="btn btn-primary btn-xs" title="Imprimir" id="${IDVoucher}" onclick="imprimirVoucher(this.id);"><span class="fal fa-print p-1"></button>
        </div>`
        ])

        indice++;
    }

    $('#resultado').removeClass('d-none').html(`
        <table id="dt-basic-voucher" class="table table-bordered table-hover table-striped w-100 fw-500">
            <thead class="bg-primary-600">
            <tr>
                <th>#</th>
                <th>Nº Voucher</th>
                <th>Loja Emissor</th>
                <th>Caixa Emissor</th>
                <th>Aut. Criação</th>
                <th>Data Emissão</th>
                <th>Valor</th>
                <th>Loja Recebida</th>
                <th>Caixa Recebida</th>
                <th>Aut. Consumo</th>
                <th>Data Recebida</th>
                <th>Tipo</th>
                <th>Situação</th>
                <th>St. Devolução</th>
                <th>Log. Devolução</th>
                <th>Opções</th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>    
    `);

    $('#dt-basic-voucher').DataTable().clear().destroy();

    let tableVoucher = $('#dt-basic-voucher').DataTable({
        data: dadosTable,
        "language": { "emptyTable": "Nenhum Voucher Encontrado..." },
        defaultContent: '',
        paging: true,
        pageLength: 50,
        searching: true,
        info: true,
        deferRender: true,
        scrollX: true,
        scrollY: true,
        columnDefs: [
            {
                type: 'date-time-br',
                targets: [5, 10],
            },
            {
                type: 'currency-brl',
                targets: [6],
            },
        ],
        initComplete: function (settings) {
            let idTable = `#${settings.nTable.id}`;

            $(idTable).focus();
            $('html, body').animate({
                scrollTop: $(idTable).offset().top - 70
            }, 1000);

            $(idTable).find('tbody td:first').focus();
        },
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [
            {
                extend: 'pdfHtml5',
                text: 'PDF',
                titleAttr: 'Generate PDF',
                className: 'btn-outline-danger btn-sm mr-1'
            },
            {
                extend: 'excelHtml5',
                text: 'Excel',
                titleAttr: 'Gerar Excel',
                className: 'btn-outline-success btn-sm mr-1',
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function (data, row, column, node) {
                            data = $('<p>' + data + '</p>').text();
                            return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                        }
                    }
                }
            },
            {
                extend: 'print',
                text: 'Print',
                titleAttr: 'Print Table',
                className: 'btn-outline-primary btn-sm'
            }
        ]
    });

    $('#dt-basic-voucher tbody').on('click', 'button#detalheVoucher', async function () {
        try {
            let tr = $(this).closest('tr');
            let row = tableVoucher.row(tr);
            let numVoucherLinha;

            if (tr.hasClass('child')) {
                tr = $($(`#${$(this).attr('value')}`).closest('tr'))

                row = tableVoucher.row(tr);
                numVoucherLinha = $(this).attr('value');

                row.child.hide();
                tr.removeClass('shown');

            } else {
                row = tableVoucher.row(tr);
                numVoucherLinha = $(tr[0].children[0].children[0]).attr('id');
            }

            if (row.child.isShown()) {
                row.child.hide();
                tr.removeClass('shown');

            } else {
                await ajaxGetAllData(`api/administrativo/detalhe-voucher-dados.xsjs?id=${numVoucherLinha}`, 'Carregando Detalhes do Voucher...')
                    .then((dadosVoucher) => {
                        row.child(formatDataTableAccordion(dadosVoucher)).show();
                    })
                    .catch((error) => { throw error });

                tr.addClass('shown');
            }
        } catch (error) {
            console.log(error);
            animationLoadingStop();
            msgError('Erro ao Carregar os Detalhes do Voucher, Tente Novamente Mais Tarde!')
        }
    });

    animationLoadingStop();
}

function formatDataTableAccordion(dadosProdutos) {

    let dadosProd = dadosProdutos.data[0]['detalhevoucher'];
    let dadosProdDest = dadosProdutos.data[0]['detalhedestino'];
    let vendaOrigemVoucher = dadosProdutos.data[0]['voucher']['IDRESUMOVENDAWEB'] ? dadosProdutos.data[0]['voucher']['IDRESUMOVENDAWEB'] : "Não disponível";
    let vendaDestinoVoucher = dadosProdutos.data[0]['voucher']['IDRESUMOVENDAWEBDESTINO'] ? dadosProdutos.data[0]['voucher']['IDRESUMOVENDAWEBDESTINO'] : "Não disponível";
    let StatusVoucher = dadosProdutos.data[0]['voucher']['STSTATUS'] ? dadosProdutos.data[0]['voucher']['STSTATUS'] : "";

    // `d` is the original data object for the row
    html = `
<div class="row">
<div class="col-xl-12 col-sm-12">
    <div id="panel-1" class="panel">
    <div class="panel-hdr">
        <h2>Produtos Venda de Origem: ${vendaOrigemVoucher}</h2>
    </div>
    <div class="panel-container show">
        <div class="panel-content">
            <table id="vendaOrigem" class="table table-bordered table-hover table-striped w-100">
            <thead>
                <tr>
                <th><b>Cod. Barras<b></th>
                <th><b>Produto<b></th>
                <th class="tdCenter"><b>Quantidade<b></th>
                <th><b>Valor<b></th>
                </tr>
                </thead>`;

    for (let i = 0; i < dadosProdutos.data[0]['detalhevoucher'].length; i++) {
        html += `        <tbody>
                    <tr>
                    <td>${dadosProd[i]['det']['NUCODBARRAS']}</td>
                    <td>${dadosProd[i]['det']['DSPRODUTO']}</td>
                    <td class="tdCenter">${parseInt(dadosProd[i]['det']['QTD'])}</td>
                    <td>${maskValor(dadosProd[i]['det']['VRTOTALLIQUIDO'])}</td>
                    </tr>
                </tbody>`;
    }

    if (dadosProdutos.data[0]['voucher']['STATIVO'] == 'False' && (StatusVoucher != 'EM ANALISE' && StatusVoucher != 'CANCELADO' && StatusVoucher != 'NEGADO') || dadosProdDest.length) {
        html += `   </table>
        </div>
        </div>
    </div>
    </div>
</div>
</div>

</br><hr size="6" width="100%" align="left" color="green"></br>

<div class="row">
<div class="col-xl-12 col-sm-12">
    <div id="panel-1" class="panel">
    <div class="panel-hdr">
        <h2>Produtos Venda de Destino: ${vendaDestinoVoucher}</h2>
        </div>
        <div class="panel-container show">
        <div class="panel-content">            
            <table id="vendaDestino" class="table table-bordered table-hover table-striped w-100">
                <thead>
                    <tr>
                    <th><b>Cod. Barras<b></th>
                    <th><b>Produto<b></th>
                    <th class="tdCenter"><b>Quantidade<b></th>
                    <th><b>Valor.<b></th>
                    </tr>
                </thead>`;

        for (let i = 0; i < dadosProdutos.data[0]['detalhedestino'].length; i++) {
            html += `      <tbody>
                    <tr>
                        <td>${dadosProdDest[i]['vendadetdestino']['NUCODBARRAS']}</td>
                        <td>${dadosProdDest[i]['vendadetdestino']['DSPRODUTO']}</td>
                        <td class="tdCenter">${parseInt(dadosProdDest[i]['vendadetdestino']['QTD'])}</td>
                        <td>${maskValor(dadosProdDest[i]['vendadetdestino']['VRTOTALLIQUIDO'])}</td>
                    </tr>
                </tbody>`;
        }
    }
    html += `</table>
        </div>
        </div>
    </div>
    </div>
</div>
</div>`;

    return html;
}

async function editarStatusVoucher(idVoucher) {
    $('#memoriaStatusVoucher, #memoriaTipoTrocaVoucher, #memoriaStatusVoucherValue').val('');

    let dadosUser = await modalAuthUserEditOrPrintVoucher(idVoucher) || false;

    if (dadosUser) {
        let dadosVoucher = await ajaxGetAllData(`api/administrativo/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Dados...').catch((error) => { throw error });

        retornoEditarStatusVoucher(dadosVoucher, dadosUser);
    }
}

async function retornoEditarStatusVoucher(detVoucher, dadosFunc) {
    try {
        $("#vendaDestVoucher, #btnUpdateVoucher").addClass('d-none');

        let { DSFUNCAO, IDFUNCIONARIO, IDGRUPOEMPRESARIAL } = dadosFunc;
        let { data } = detVoucher || [];
        let dadosListaVoucher = [];
        let dadosListaVoucherDest = [];
        let dadosTableVoucherOrigem = [];
        let msgUser = '';
        let stEdicao = true;
        let stTipoVoucherTroco = '';
        let tipoTroca;
        let idVoucher;
        let noCliente;
        let cpfCnpjCliente;
        let nuVoucher;
        let stAtivo;
        let stCancelado;
        let vrVoucher;
        let nuVenda;
        let nuVendaDestino;
        let statusVoucher;
        let dataVenda;
        let diasEmAposCompra;

        for (var i = 0; i < data.length; i++) {
            let { voucher } = data[i];

            idVoucher = voucher?.IDVOUCHER;
            tipoTroca = (voucher?.STTIPOTROCA || 'CORTESIA').toUpperCase().trim();
            noCliente = voucher?.DSNOMERAZAOSOCIAL || voucher?.DSAPELIDONOMEFANTASIA || "";
            cpfCnpjCliente = voucher?.NUCPFCNPJ?.length ? voucher?.NUCPFCNPJ?.length <= 11 ? maskCPF(voucher?.NUCPFCNPJ) : maskCNPJ(voucher?.NUCPFCNPJ) : ''
            nuVoucher = voucher?.NUVOUCHER;
            stAtivo = voucher?.STATIVO;
            stCancelado = voucher?.STCANCELADO;
            vrVoucher = maskValorEmBRL(voucher?.VRVOUCHER);
            nuVenda = voucher?.IDRESUMOVENDAWEB ? voucher?.IDRESUMOVENDAWEB : "Não disponível";
            nuVendaDestino = voucher?.IDRESUMOVENDAWEBDESTINO ? voucher?.IDRESUMOVENDAWEBDESTINO : "Não disponível";
            statusVoucher = voucher?.STSTATUS ? (voucher?.STSTATUS).toUpperCase() : "";
            dataVenda = voucher?.DTHORAFECHAMENTOVENDAORIGEM;

            stTipoVoucherTroco = tipoTroca == 'TROCO' ? 'hidden' : false;
            motivoTrocaVoucher = voucher?.STCANCELADO == 'True' ? `<h6>Motivo do Cancelamento/Negação : <span class="fw-300">${(voucher?.DSMOTIVOCANCELAMENTO || '')}</span></h6>` : stTipoVoucherTroco ? '' : `<h6>Motivo da Troca: <span class="fw-300">${voucher?.MOTIVOTROCA || ""}</span></h6>`;
            diasEmAposCompra = retornaDiasEntreDatas(dataVenda);

            if (stAtivo == 'True' && (statusVoucher == 'NOVO' || !statusVoucher)) {
                statusVoucher = tipoTroca == 'TROCO' ? 'LIBERADO PARA O CLIENTE' : 'NOVO';
            } else if (stAtivo == 'False' && statusVoucher == 'EM ANALISE') {
                nuVoucher = ocultaParteDosDadosVoucher(nuVoucher)
            } else if (stAtivo == 'True' && statusVoucher == 'LIBERADO PARA O CLIENTE') {
                statusVoucher = 'LIBERADO PARA O CLIENTE';
            } else if (stAtivo == 'False' && stCancelado == 'False' && (!statusVoucher || statusVoucher == 'FINALIZADO')) {
                statusVoucher = 'FINALIZADO';
            } else if (stCancelado == 'True' && stAtivo == 'False' && (!statusVoucher || statusVoucher == 'CANCELADO')) {
                statusVoucher = 'CANCELADO';
            } else {
                statusVoucher = 'FINALIZADO';
            }


            if (DSFUNCAO !== 'TI' && DSFUNCAO !== 'SUPERVISOR') {
                if (DSFUNCAO.includes('OPERADOR')) {
                    if (IDGRUPOEMPRESARIAL == 4 || diasEmAposCompra > 32) {
                        stEdicao = false;
                        msgUser = 'Usuário Com Permissão Apenas de Visualização, Solicite a Autorização ao Seu Gerente ou Lider para Mudança de Status do Voucher';
                    }
                }

                if (statusVoucher !== 'EM ANALISE' || diasEmAposCompra > 180) {
                    stEdicao = false;
                    msgUser = 'Usuário Com Permissão Apenas de Visualização, Solicite a Autorização Do Suporte de Vendas Para Mudança de Status do Voucher';
                }

                if (diasEmAposCompra > 60 && diasEmAposCompra < 180) {
                    stEdicao = false;
                    msgUser = 'Usuário Com Permissão Apenas de Visualização, Solicite a Autorização Da Supervisão para Mudança de Status do Voucher';
                }

            }

            for (let j = 0; j < data[i]['detalhevoucher'].length; j++) {
                let { det } = data[i]?.detalhevoucher[j];
                let codBarras = det?.NUCODBARRAS;
                let descProd = det?.DSPRODUTO;
                let vrUnit = maskValorEmBRL(det?.VRUNIT);
                let qtdProd = parseInt(det?.QTD);
                let vrBruto = maskValorEmBRL(det?.VRTOTALBRUTO);
                let vrDesconto = maskValorEmBRL(det?.VRDESCONTO);
                let vrLiquido = maskValorEmBRL(det?.VRTOTALLIQUIDO);

                dadosListaVoucher.push([
                    `<label style="color: blue; font-size: 11px;">${j + 1}</label>`,
                    `<label style="color: blue; font-size: 11px;">${codBarras}</label>`,
                    `<label style="color: blue; font-size: 11px;">${descProd}</label>`,
                    `<label style="color: blue; font-size: 11px;">${vrUnit}</label>`,
                    `<label style="color: blue; font-size: 11px;">${qtdProd}</label>`,
                    `<label style="color: blue; font-size: 11px;">${vrBruto}</label>`,
                    `<label style="color: blue; font-size: 11px;">${vrDesconto}</label>`,
                    `<label style="align: right; color: green; font-size: 11px;">${vrLiquido}</label>`
                ])

            }

            if (data[i]['detalhedestino'].length) {
                $("#vendaDestVoucher").removeClass('d-none');

                for (var h = 0; h < data[i]['detalhedestino'].length; h++) {
                    let detDest = data[i]?.detalhedestino[h]?.vendadetdestino;
                    let codBarrasDest = detDest?.NUCODBARRAS;
                    let descProdDest = detDest?.DSPRODUTO;
                    let vrUnitDest = maskValorEmBRL(detDest?.VUNCOM);
                    let qtdProdDest = parseInt(detDest?.QTD);
                    let vrBrutoDest = maskValorEmBRL(detDest?.VPROD);
                    let vrDescontoDest = maskValorEmBRL(detDest?.VDESC);
                    let vrLiquidoDest = maskValorEmBRL(detDest?.VRTOTALLIQUIDO);

                    dadosListaVoucherDest.push([
                        `<label style="color: blue; font-size: 11px;">${h + 1}</label>`,
                        `<label style="color: blue; font-size: 11px;">${codBarrasDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${descProdDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${vrUnitDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${qtdProdDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${vrBrutoDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${vrDescontoDest}</label>`,
                        `<label style="align: right; color: green; font-size: 11px;">${vrLiquidoDest}</label>`
                    ])
                }
            } else {
                $("#vendaDestVoucher").addClass('d-none');
            }
            if (stTipoVoucherTroco) {
                let voucherOrigem = data[i].detalhevoucherorigem;

                for (let i = 0; i < voucherOrigem.length; i++) {
                    let dados = voucherOrigem[i];
                    let indice = i + 1;
                    let IDVoucher = dados?.IDVOUCHER;
                    let idEmpresaOrigemVoucher = dados?.IDEMPRESAORIGEM;
                    let DTVoucherIN = dados?.DTINVOUCHERFORMATADO || '';
                    let DTVoucherOUT = dados?.DTOUTVOUCHERFORMATADO || '';
                    let idCaixaOrigem = dados?.IDCAIXAORIGEM;
                    let DSCaixaOrigem = idCaixaOrigem !== 99999 ? dados?.DSCAIXAORIGEM : 'CAIXA WEB';
                    let idUsrAutorizaCriacao = dados?.IDUSRLIBERACAOCRIACAO;
                    let nomeUsrAutorizaCriacao = idUsrAutorizaCriacao ? dados?.NOFUNCIONARIOLIBERACAOCRIACAO : "";
                    let DSCaixaDestino = dados?.DSCAIXADESTINO ? dados?.DSCAIXADESTINO : "";
                    let idUsrAutorizaConsumo = dados?.IDUSRLIBERACAOCONSUMO;
                    let nomeUsrAutorizaConsumo = idUsrAutorizaConsumo ? dados?.NOFUNCIONARIOLIBERACAOCONSUMO : "";
                    let NuVoucher = dados?.NUVOUCHER;
                    let VrVoucher = parseFloat(dados?.VRVOUCHER);
                    let STAtivoVoucher = dados?.STATIVO;
                    let STCanceladoVoucher = dados?.STCANCELADO;
                    let STStatusVoucher = dados?.STSTATUS;
                    let EmpresaOrigem = dados?.EMPORIGEM || '';
                    let EmpresaDestino = dados?.EMPDESTINO || '';
                    let situacaoVoucher;
                    let colorTag = 'blue';

                    if (STAtivoVoucher == 'True' && !STStatusVoucher) {
                        situacaoVoucher = 'NOVO';
                    } else if (STAtivoVoucher == 'False' && !STStatusVoucher) {
                        situacaoVoucher = 'FINALIZADO';
                        colorTag = 'red'
                    } else if (STAtivoVoucher == 'True' && (STStatusVoucher == 'LIBERADO PARA O CLIENTE' || STStatusVoucher == 'NOVO')) {
                        situacaoVoucher = STStatusVoucher;
                    } else if (STAtivoVoucher == 'False' && (STStatusVoucher == 'NEGADO' || STStatusVoucher == 'CANCELADO' || STStatusVoucher == 'FINALIZADO')) {
                        situacaoVoucher = STStatusVoucher;
                        colorTag = 'red'
                    } else if (STAtivoVoucher == 'False' && STStatusVoucher == 'EM ANALISE') {
                        situacaoVoucher = STStatusVoucher;
                    } else if (STAtivoVoucher == 'False' && STCanceladoVoucher == 'True' && !STStatusVoucher) {
                        situacaoVoucher = STStatusVoucher;
                        colorTag = 'red'
                    } else {
                        situacaoVoucher = 'USADO';
                        colorTag = 'red'
                    }

                    tagVoucherAtivo = `<label style="text-align: center; color: ${colorTag}; font-size: 11px;">${situacaoVoucher}</label>`;

                    dadosTableVoucherOrigem.push([
                        `<label style="color: blue; font-size: 11px;">${ocultaParteDosDadosVoucher(NuVoucher)}</label>`,
                        `<label style="color: blue; font-size: 11px;">${EmpresaOrigem}</label>`,
                        `<label style="color: blue; font-size: 11px;">${DSCaixaOrigem}</label>`,
                        `<label style="color: blue; font-size: 11px;">${nomeUsrAutorizaCriacao}</label>`,
                        `<label style="color: blue; font-size: 11px;">${DTVoucherIN}</label>`,
                        `<label style="align: right; color: green; font-size: 11px;">${maskValorEmBRL(VrVoucher)}</label>`,
                        `<label style="color: blue; font-size: 11px;">${EmpresaDestino}</label>`,
                        `<label style="color: blue; font-size: 11px;">${DSCaixaDestino}</label>`,
                        `<label style="color: blue; font-size: 11px;">${nomeUsrAutorizaConsumo}</label>`,
                        `<label style="color: blue; font-size: 11px;">${DTVoucherOUT}</label>`,
                        tagVoucherAtivo
                    ])

                }
            }

        }

        $('.detDadosVoucher').html(`
        <div class="ml-3">
            <input id="memoriaStatusVoucher" type="text" value="${statusVoucher}" hidden />
            <input id="memoriaTipoTrocaVoucher" type="text" value="${tipoTroca}" hidden />
            <input id="memoriaStatusVoucherValue" type="text" hidden />
            <div id="notificacaoUsuario"></div>
            <h6>Cliente: <span class="fw-300">${noCliente}</span></h6>
            <h6>CPF/CNPJ: <span class="fw-300">${cpfCnpjCliente}</span></h6>
            <h6>Voucher: <span class="fw-300">${nuVoucher}</span></h6>
            <h6>Valor Voucher: <span class="fw-300">${vrVoucher}</span></h6>
            <h6>Venda Origem: <span id="nuVendaVoucher" class="fw-300">${nuVenda}</span></h6>
            ${motivoTrocaVoucher}

            <div class="pl-0" style="width:20%">
                <label class="h6">Tipo do Voucher:</label>
                <select id="tipoTrocaVoucher" value="${tipoTroca}" onchange="trocaCorSelectStatusVoucher()">
                    <option value='CORTESIA' ${stTipoVoucherTroco} >CORTESIA</option>
                    <option value='DEFEITO' ${stTipoVoucherTroco} >DEFEITO</option>
                    <option value='TROCO' ${!stTipoVoucherTroco && 'hidden'} >TROCO</option>
                </select>
            </div>
        
            <div class="pl-0 mt-2" style="width:20%">
                <label class="h6">Status do Voucher:</label>
                <select id="statusVoucher" value="${statusVoucher}" onchange="trocaCorSelectStatusVoucher()">
                    <option value='NOVO' ${stTipoVoucherTroco} >NOVO</option>
                    <option value='EM ANALISE' ${stTipoVoucherTroco} >EM ANALISE</option>
                    <option value='LIBERADO PARA O CLIENTE' >LIBERADO PARA O CLIENTE</option>
                    <option value='FINALIZADO' >FINALIZADO</option>
                    <option value='NEGADO' ${stTipoVoucherTroco} >NEGADO</option>
                    <option value='CANCELADO'>CANCELADO</option>
                </select>
            </div>

            <div class="d-none pt-3" style="width:40%">
                <label class="form-label h6" for="motivoTrocaStatus"><b>MOTIVO*</b></label>
                <input id="motivoTrocaStatus" class="form-control input" type='text' placeholder="Digite o Motivo Da Troca De Status...">
                <small style="font-size: 12px"><b>Campo Obrigatório*</b></small>
            </div>
    </div>
    `)

        $('#tipoTrocaVoucher').val(tipoTroca);
        $('#statusVoucher').val(statusVoucher);

        $('#tipoTrocaVoucher, #statusVoucher').select2({
            templateResult: function (option) {
                if (option.element && (option.element).hasAttribute('hidden')) {
                    return null;
                }
                return option.text;
            }
        }).trigger('change').prop('disabled', !stEdicao);

        $('#vendaVoucherOrigem').html(`Produtos Venda de Origem: ${nuVenda}`);
        $('#vendaVoucherDestino').html(`Produtos Venda de Destino: ${nuVendaDestino}`);

        $('#detProdVoucher').DataTable().destroy();
        $('#detProdVoucherDestino').DataTable().destroy();

        $('#detProdVoucher').DataTable({
            data: dadosListaVoucher,
            defaultContent: '',
            paging: true,
            pageLength: 50,
            searching: true,
            info: false,
            deferRender: true,
            responsive: true,
            columnDefs: [
                {
                    type: 'currency-brl',
                    targets: [3, 5, 6],
                }
            ],
            columns: [
                { width: '10%' },
                { width: '10%' },
                { width: '30%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' }
            ],
            language: {
                "emptyTable": "Dados não encontrados!"
            }
        });

        $('#detProdVoucherDestino').DataTable({
            data: dadosListaVoucherDest,
            defaultContent: '',
            paging: true,
            pageLength: 50,
            searching: true,
            info: false,
            deferRender: true,
            responsive: true,
            columnDefs: [
                {
                    type: 'currency-brl',
                    targets: [3, 5, 6],
                }
            ],
            columns: [
                { width: '10%' },
                { width: '10%' },
                { width: '30%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' }
            ],
            language: {
                "emptyTable": "Dados não encontrados!"
            }
        });

        if (stTipoVoucherTroco) {
            $('#tipoTrocaVoucher').prop('disabled', true);
            $("#voucherOrigem").removeClass('d-none');
            $("#produtosVoucher").addClass('d-none');
            $('#tableVoucherOrigem').DataTable().destroy();

            $('#tableVoucherOrigem').DataTable({
                data: dadosTableVoucherOrigem,
                "language": { "emptyTable": "Nenhum Voucher Encontrado...", "zeroRecords": "Não há Vendas no Momento" },
                paging: false,
                pageLength: 10,
                searching: false,
                info: false,
                deferRender: true,
                scrollX: false,
                responsive: true,
                // "displayLength": 25,
                columnDefs: [
                    {
                        type: 'date-time-br',
                        targets: [5, 10],
                    },
                    {
                        type: 'currency-brl',
                        targets: [6],
                    },
                ]
            });
        } else {
            $("#produtosVoucher").removeClass('d-none')
        }

        msgUser && $('#notificacaoUsuario').html(`
            <div class="alert alert-danger alert-dismissible fade show h4" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true"><i class="fal fa-times"></i></span></button><strong>Atenção! </strong>${msgUser}</div>
        `);

        if (stEdicao) {
            $('#btnUpdateVoucher').attr('onclick', `atualizaStatusVoucher(${idVoucher}, ${IDFUNCIONARIO})`)
        } else {
            $('#btnUpdateVoucher').addClass('d-none');
        }

        $("#detStatusVoucher").modal('show');

    } catch (error) {
        console.log(error);
        animationLoadingStop();
        msgError();
    }
}

function trocaCorSelectStatusVoucher() {
    let tipoTrocaVoucher = $('#tipoTrocaVoucher').val();
    let statusVoucher = $('#statusVoucher').val() || $('#memoriaStatusVoucher').val();
    let corTipo = $('#select2-tipoTrocaVoucher-container');
    let corStatus = $('#select2-statusVoucher-container');
    const MEMORIATIPOTROCAVOUCHER = $('#memoriaTipoTrocaVoucher').val();
    const MEMORIASTATUSVOUCHER = $('#memoriaStatusVoucher').val();

    $('#select2-tipoTrocaVoucher-container, #select2-statusVoucher-container').addClass('fw-900');

    if (tipoTrocaVoucher == 'CORTESIA') {
        corTipo.removeClass('text-danger').removeClass('text-primary').addClass('text-info');
    } else if (tipoTrocaVoucher == 'DEFEITO') {
        corTipo.removeClass('text-info').removeClass('text-primary').addClass('text-danger');
    } else {
        corTipo.removeClass('text-info').removeClass('text-danger').addClass('text-primary');
    }


    if (statusVoucher == "FINALIZADO" || statusVoucher == "NEGADO" || statusVoucher == "CANCELADO") {
        corStatus.removeClass('text-info', '').addClass('text-danger');
    } else {
        corStatus.removeClass('text-danger').addClass('text-info');
    }

    if ((MEMORIASTATUSVOUCHER == statusVoucher && MEMORIATIPOTROCAVOUCHER == tipoTrocaVoucher)) {
        $('#motivoTrocaStatus').parent('div').addClass('d-none');
        $('#btnUpdateVoucher').addClass('d-none');
    } else {
        $('#motivoTrocaStatus').parent('div').removeClass('d-none');
        $('#btnUpdateVoucher').removeClass('d-none');
    }

}

async function atualizaStatusVoucher(idVoucher, IDFUNCIONARIO) {
    try {
        let dadosUpdateVoucher = [];
        let { IDEMPRESA, IDGRUPOEMPRESARIAL } = await getCurrentUser()?.user;
        let tipoTroca = $('#select2-tipoTrocaVoucher-container').attr("title");
        let statusVoucher = $('#select2-statusVoucher-container').attr("title");
        let motivoTrocaStatus = $('#motivoTrocaStatus').val();
        const MEMORIATIPOTROCAVOUCHER = $('#memoriaTipoTrocaVoucher').attr('value');
        const MEMORIASTATUSVOUCHER = $('#memoriaStatusVoucher').attr('value');

        if (!IDEMPRESA || !IDGRUPOEMPRESARIAL) {
            return msgWarning('Atenção! Dados do usuário não localizados', 'Faça o logoff, entre novamente e tente atualizar');
        }

        if (!motivoTrocaStatus) {
            return msgWarning('Atenção! Motivo de Troca Vazio', 'O Motivo é Obrigatório! Preencha-o e tente atualizar novamente')
                .then(() => {
                    setTimeout(() => $('#motivoTrocaStatus').focus(), 500)
                })
        } else if (motivoTrocaStatus && motivoTrocaStatus.length <= 10) {
            return msgWarning('Atenção! Motivo de Troca Deve Conter Pelo Menos 10 Caracteres', 'Preencha-o com mais detalhes e tente atualizar novamente')
                .then(() => {
                    setTimeout(() => $('#motivoTrocaStatus').focus(), 500)
                })

        } else {

            let STATIVO = 'True'
            let STCANCELADO = 'False'
            let DSMOTIVOTROCASTATUS = $('#motivoTrocaStatus').val()?.toUpperCase().trim();
            let STSTATUS = statusVoucher;
            let STTIPOTROCA = tipoTroca || "";
            let IDVOUCHER = idVoucher;
            let IDEMPRESALOGADA = IDEMPRESA;

            if (statusVoucher == 'NOVO' || statusVoucher == 'LIBERADO PARA O CLIENTE') {
                STATIVO = 'True';
                STCANCELADO = 'False';
            } else if (statusVoucher == 'CANCELADO' || statusVoucher == 'NEGADO') {
                STATIVO = 'False';
                STCANCELADO = 'True';
            } else if (statusVoucher == 'EM ANALISE' || statusVoucher == 'FINALIZADO') {
                STATIVO = 'False';
                STCANCELADO = 'False';
            }

            dadosUpdateVoucher.push({
                STATIVO,
                STCANCELADO,
                DSMOTIVOTROCASTATUS,
                IDFUNCIONARIO,
                STSTATUS,
                STTIPOTROCA,
                IDVOUCHER,
                IDEMPRESALOGADA,
                IDGRUPOEMPRESARIAL
            })

            animationLoadingStart('Enviando dados...');

            await ajaxPut(`api/administrativo/editar-voucher.xsjs`, dadosUpdateVoucher).catch((error) => { throw error; })

            await msgSuccess('Voucher Atualizado com Sucesso!');

            $('#detStatusVoucher').modal('hide')

            await ajaxGetAllData(`api/administrativo/voucher-completo.xsjs?id=${idVoucher}`, 'Carregando Voucher...')
                .then(retornoListaVouchers)
                .catch((error) => { throw error; })
        }

    } catch (error) {
        console.log(error);
        animationLoadingStop();
        msgError(error.message || error);
    }
}

async function imprimirVoucher(idVoucher) {
    let dadosUser = await modalAuthUserEditOrPrintVoucher(idVoucher, true);

    dadosUser && await ajaxGetAllData(`api/administrativo/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Dados...')
        .then(retornoImprimirVoucher)
        .catch((error) => { throw error });
}

function retornoImprimirVoucher(dadosRetornoImprimrVoucher) {
    let data = new Date();
    let dia = data.getDate(); // 1-31
    let dia_sem = data.getDay(); // 0-6 (zero=domingo)
    let mes = data.getMonth(); // 0-11 (zero=janeiro)
    let ano2 = data.getYear(); // 2 dígitos
    let ano4 = data.getFullYear(); // 4 dígitos
    let hora = data.getHours();          // 0-23
    let min = data.getMinutes();        // 0-59
    let seg = data.getSeconds();

    let dtAtual = `${("" + dia).padStart(2, '0')}/${("" + (mes + 1)).padStart(2, '0')}/${("" + ano4)}`;
    let hrAtual = `${("" + hora).padStart(2, '0')}:${("" + min).padStart(2, '0')}:${("" + seg).padStart(2, '0')}`;

    $(document).off("keydown");

    if (dadosRetornoImprimrVoucher.data) {
        let dados = dadosRetornoImprimrVoucher.data[0].voucher;
        let noFantasia = dados.EMPORIGEM;
        let razaoSocial = dados.RAZAOEMPORIGEM;
        let cnpjEmp = maskCNPJ(dados.CNPJEMPORIGEM);
        let endEmp = dados.ENDEMPORIGEM;
        let bairroEmp = dados.BAIRROEMPORIGEM;
        let cidadeEmp = dados.CIDADEEMPORIGEM;
        let sgufEmp = dados.SGUFEMPORIGEM;
        let dtCreate = dados.DTINVOUCHERFORMATADO.replace('-', '/').replace('-', '/');
        let dtValidade = dados.DTINVOUCHERFORMATADO
        let vrVoucher = maskValor(dados.VRVOUCHER);
        let vrExtenso = vrVoucher.extenso(true);
        let idVendaOrigem = dados.IDRESUMOVENDAWEB;
        let nuVoucher = dados.NUVOUCHER;
        let noCliente = dados.DSNOMERAZAOSOCIAL;
        let cpfCnpjCliente = dados.NUCPFCNPJ ? dados.NUCPFCNPJ : "";
        let idCaixa = "" + dados.IDCAIXAORIGEM;
        let idVendedor = "" + (dados.IDVENDEDOR || 0);
        let idResumoDev = "" + dados.IDNFEDEVOLUCAO;
        let idOperador = "" + dados.IDUSRLIBERACAOCRIACAO;

        if (cpfCnpjCliente.length == 11) {
            maskCPF(dados.NUCPFCNPJ);
        } else if (cpfCnpjCliente.length == 14) {
            maskCNPJ(dados.NUCPFCNPJ);

            noCliente = !noCliente ? dados.DSAPELIDONOMEFANTASIA : noCliente;
        }

        htmlVoucher = `
        <style>
        hr {
            margin: 5px;
        }

        #contentModalVoucher{
            width: 400px !important; 
        }
    
        .voucher {
            font-size: 16px !important;
            color: black;
            width: 400px !important;
            margin-left: 30px;
            max-width: 400px !important;
            padding-left: 5px !important;
            padding-right: 5px !important;
        }
    
        .detalhesVoucher p {
            text-align: left !important ;
            align-content: left !important;
            margin: 0 !important;
            margin-top: 10px !important;
            padding: 0 !important;
        }
    
        .codBarras {
            /* margin: 3px !important;; */
            /* padding-right: 10px !important;; */
            width: 100% !important;
            /* height: 50px !important;; */
        }
    
        .center {
            font-size: 16px !important;
            text-align: center !important ;
            align-content: center !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
        }
    
        .msg p {
            font-size: 12px !important;
            text-align: left !important ;
            align-content: left !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        @media print {
        body {
            font-size: 10px;
            margin: 0 !important;
        }

        @page {
            margin: 0.5cm !important;
        }
        
            .hidden-print {
            display: none !important;
            }
        
            .voucher {
            font-size: 14px !important;
            font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
            color: black !important;
            width: 400px !important;
            margin-left: 30px;
            max-width: 400px !important;
            padding-left: 5px !important;
            padding-right: 5px !important;
            }
    
            .detalhesVoucher p {
            font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
            text-align: left !important ;
            align-content: left !important;
            margin: 0 !important;
            margin-top: 10px !important;
            padding: 0 !important;
            }
    
            .codBarras {
            /* margin: 3px !important;; */
            /* padding-right: 10px !important;; */
            width: 90% !important;
            /* height: 50px !important;; */
            }
    
            .center {
            font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
            font-size: 10px !important;
            text-align: center !important ;
            align-content: center !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            }
    
            .msg p {
            font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
            font-size: 9px !important;
            text-align: left !important ;
            align-content: left !important;
            margin: 0 !important;
            padding: 0 !important;
            }
        }
    
        </style>
        <style id="mediaPrintVoucher">
        </style>
        <p class="center" style="padding: 0;">
            <b class="center">${noFantasia}</b>
        <br />
            ${razaoSocial}
        <br />
            CNPJ Nº<b class="center">${cnpjEmp}</b>
        </p>
        <p style="margin-top: 10px; margin-bottom: 5px;">
            <b>${endEmp}</b>
        <br />
            <b>${bairroEmp}</b>
        <br />
            <b>${cidadeEmp} - ${sgufEmp}</b>
        </p>

        <p style="margin-bottom: 0">${dtAtual.replace('-', '/').replace('-', '/')} - ${hrAtual}</p>

        <p class="center alinhamentoDuplo pt-1">
        <b>** COMPROVANTE NÃO FISCAL **</b>
        </p>

        <div class="linhaPontilhadaVoucher">
        <hr style="border: 1px dashed" />
        </div> 
    <div>
        <p class="center alinhamentoDuplo">
        ORDEM DE TROCA
        <br />
        CUPOM VALE TROCA
        </p>
    </div>
        <div class="detalhesVoucher">
        <p>
            DATA DA OPERACAO.....: ${dtCreate}
            <br />
            CAIXA..............................: ${idCaixa.padStart(4, '0')}
            <br />
            VENDEDOR.....................: ${idVendedor.padStart(4, '0')}
            
            <p style="margin: 0 !important; padding: 0 !important;">Nº VALE TROCA..............: <b>${nuVoucher}</b></p>
            
            <p style="margin: 0 !important; padding: 0 !important;">Nº VENDA WEB..............: <b>${idVendaOrigem}</b></p>
            
            NSU:${idResumoDev.padStart(9, '0')} - OPER: ${idOperador.padStart(4, '0')}
            <br />
            NOME: <b id="nomeVoucher" value="${noCliente}" class="detalhesVoucher">${noCliente}</b>
            <br />
            CPF/CNPJ: <b class="detalhesVoucher">${maskCPF(cpfCnpjCliente)}</b>
            <br />
        </p>
        </div>
        
        <div class="linhaPontilhadaVoucher">
        <hr style="border: 1px dashed" />
        </div> 
        
        <div>
        <p class="center alinhamentoDuplo">VALE TROCA DE <b class="center alinhamentoDuplo">${vrVoucher}</b></p>
        <p class="center alinhamentoDuplo">(${vrExtenso})</p>
        <p class="center alinhamentoDuplo"><b>Válido por 30 dias.</b></p>
        </div> 
        
        <div class="linhaPontilhadaVoucher">
        <hr style="border: 1px dashed" />
        </div> 
        
        <div  id="codVoucher" class="center p-1">
        <svg id="svgVoucher"
            class="codBarras"
            jsbarcode-value="${nuVoucher}"
            jsbarcode-height="40"
            jsbarcode-margin="0"
            jsbarcode-fontSize="15"
            value="${nuVoucher}">
        </svg>
        </div>
        
        <div class="linhaPontilhadaVoucher">
        <hr style="border: 1px dashed" />
        </div> 
        
        <div class="msg">
        <p>Este vale troca é pessoal e instranferível.</p>
        <p>
            Para sua utilizacao será solicitado a apresentacao de
            documento de identidade e CPF.
        </p>
        <p>
            Não poderá ser utilizado para pagamento de prestacoes e
            compras de produtos FINANCEIROS.
        </p>
        <p>
            As lojas do GRUPO GTO não se responsabilizam pela perda ou
            extravio deste vale troca.
        </p>
        <p>Este comprovante é impresso em papel termossensível.</p>
        <p>
            Não exponha o papel a luz solar, fontes de calor e umidade
            excessiva.
        </p>

        <div class="linhaPontilhadaVoucher">
            <hr style="border: 1px dashed" />
        </div> 

        <p>
            <b>Válido por 30 dias.</b>
        </p>
        </div>

        <div class="linhaPontilhadaVoucher">
        <hr style="border: 1px dashed" />
        </div> 
    `;
        $("#VoucherImp").html(htmlVoucher);
    }
    JsBarcode('#svgVoucher').init();
    // $('#js-page-content').addClass('hidden-print');
    $("#impVoucher").modal('show');

    $(document).on("keydown", function (event) {
        if ($("#impVoucher").is(":visible") && event.ctrlKey && event.key === "p") {
            event.preventDefault();
            impVoucher();
        }
    });
}

function impVoucher() {
    let nuVoucher = $('#svgVoucher').attr('value');

    $('#codVoucher').html(`
    <svg id="svgVoucher"
    class="codBarras"
    jsbarcode-value="${nuVoucher}"
    jsbarcode-height="40"
    jsbarcode-margin="0"
    jsbarcode-fontSize="15"
    value="${nuVoucher}">
    </svg>
`);

    JsBarcode('#svgVoucher').init();

    let janelaImpressao = window.open('', '', '');

    janelaImpressao.document.open();
    janelaImpressao.document.write(`<html><head><title>Impressão</title><style> button{display: none !important;}<style/></head><body>`);
    janelaImpressao.document.write(document.getElementById('contentModalVoucher').innerHTML);
    janelaImpressao.document.write('</body></html>');
    janelaImpressao.document.close();
    janelaImpressao.print();
    janelaImpressao.close();

}

function exportPDF() {
    var nuVoucher = $('#svgVoucher').attr('value');
    var nome = $('#nomeVoucher').attr('value');
    var voucher = document.getElementById('VoucherImp');
    var doc = new jsPDF('p', 'pt', 'a4');
    /*var opt = {
        
        filename:    ,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { height: 1000, width: 800, y: 200},
        jsPDF:        { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };*/


    var mediaPrintNormal = `
@media print {
    .hidden-print {
    display: none !important;
    }
    @page {
    size: A4;
    margin: 0;
    }


    .voucher {
    font-size: 16px !important;
    font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
    color: black !important;
    width: 793px !important;
    margin-left: 30px;
    max-width: 793px !important;
    padding-left: 5px !important;
    padding-right: 5px !important;
    }

    .detalhesVoucher p {
    font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
    text-align: left !important ;
    align-content: left !important;
    margin: 0 !important;
    margin-top: 10px !important;
    padding: 0 !important;
    }

    .codBarras {
    /* margin: 3px !important;; */
    /* padding-right: 10px !important;; */
    width: 100% !important;
    /* height: 50px !important;; */
    }

    .center {
    font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
    font-size: 16px !important;
    text-align: center !important ;
    align-content: center !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    }

    .msg p {
    font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
    font-size: 12px !important;
    text-align: left !important ;
    align-content: left !important;
    margin: 0 !important;
    padding: 0 !important;
    }
}
`;

    $("#mediaPrintVoucher").html(mediaPrintNormal);
    $('#dialogModalVoucher').removeClass('modal-md');
    $('#dialogModalVoucher').addClass('modal-xl');
    $('#dialogModalVoucher').attr('style', 'padding: 0; margin-top: 0; margin-left: 1%');
    $('#contentModalVoucher').attr('style', 'width: 980px !important; margin-top:auto !important; margin-left: -10px !important;');

    svgAsPngUri(document.getElementById("svgVoucher")).then(uri => { $('#codVoucher').html(`<img id="svgVoucher" value="${nuVoucher}" src="${uri}" style="height: 30px !important; width: 250px !important;">`) })

    $('.linhaPontilhadaVoucher').html(`<h1>-----------------------------------------------------------------------------------------------</h1>`);
    $('.alinhamentoDuplo').removeClass('center');


    // setTimeout(()=>html2pdf().set(opt).from(voucher).save(), 1000);
    setTimeout(() => {
        doc.fromHTML(voucher, 15, 15, {
            'width': 600

        });

    }, 500)

    setTimeout(() => {
        doc.save(`Voucher_${nome}_${nuVoucher}.pdf`)
    }, 600)

    setTimeout(() => {

        $('#codVoucher').html(`
    <svg id="svgVoucher"
    class="codBarras"
    jsbarcode-value="${nuVoucher}"
    jsbarcode-height="40"
    jsbarcode-margin="0"
    jsbarcode-fontSize="15"
    value="${nuVoucher}">
    </svg>
`);

        JsBarcode('#svgVoucher').init();
    }, 700);

    setTimeout(() => {
        $('.linhaPontilhadaVoucher').html(`<hr style="border: 1px dashed" />`);
        $('.alinhamentoDuplo').addClass('center');
        $('#dialogModalVoucher').attr('style', 'align-content: center;');
        $('#dialogModalVoucher').removeClass('modal-xl');
        $('#dialogModalVoucher').addClass('modal-md');
        $('#contentModalVoucher').attr('style', 'width: 400px !important;');
    }, 700);

}

function voltarParaVendasCliente() {
    $('.tabelaProduto').addClass('d-none');
    $('.tabelaVenda').removeClass('d-none');
}

async function telaPesquisaVendaVoucher() {
    try {
        animationLoadingStart();

        await $.get("administrativo_action_pesqVendaVoucher.html", async (respHtml) => {
            $("#js-page-content").html(respHtml);
        }).fail((error) => { throw error })

        await ajaxGet(`api/grupo-empresarial.xsjs?`)
            .then(retornoListaGrupoEmpresasSelectVendaVoucher)
            .catch((error) => { throw error });

        await ajaxGet(`api/empresa.xsjs?`)
            .then(retornoListaEmpresasSelectVendaVoucher)
            .catch((error) => { throw error });

        $('#dtconsultavendainicio, #dtvendaconsultafim').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
        $('#idvenda_cpf, #serie, #nfce').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
        $('.idCadastraCliente').addClass('d-none');

        animationLoadingStop();
    } catch (error) {
        animationLoadingStop();
        console.log(error);
        msgError();
    }
}

function retornoListaGrupoEmpresasSelectVendaVoucher(respostaGrupoEmpresas) {
    let { data } = respostaGrupoEmpresas || [];

    for (let i = 0; i < data.length; i++) {
        let { IDGRUPOEMPRESARIAL, DSGRUPOEMPRESARIAL } = data[i]

        DSGRUPOEMPRESARIAL = (DSGRUPOEMPRESARIAL.split('-'))[1];

        $('#idGrupoEmpresaVenda').append(`<option value="${IDGRUPOEMPRESARIAL}"> ${DSGRUPOEMPRESARIAL}</option>`);
    }

    $('#idGrupoEmpresaVenda').select2()
}

async function selectEmpresasVendaVoucher(idGrupoEmpresarial = '') {
    try {
        await ajaxGetAllData(`api/empresa.xsjs?idSubGrupoEmpresa=${idGrupoEmpresarial}`)
            .then(retornoListaEmpresasSelectVendaVoucher)
            .catch((error) => { throw error });
    } catch (error) {
        animationLoadingStop();
        console.log(error);
        msgError();
    }
}

function retornoListaEmpresasSelectVendaVoucher(respostaListaEmpresas) {
    let { data } = respostaListaEmpresas || [];

    $('#idEmpresaVenda').html(`<option value=" "> Todas </option>`);

    for (let i = 0; i < data.length; i++) {
        let { IDEMPRESA, NOFANTASIA } = data[i];

        $('#idEmpresaVenda').append(`<option value="${IDEMPRESA}">${NOFANTASIA}</option>`);

    }

    $('#idEmpresaVenda').select2();
}

async function pesquisaVendaCliente() {
    try {
        let dataInicio = $('#dtconsultavendainicio').val() || "";
        let dataFim = $('#dtvendaconsultafim').val() || "";
        let idLoja = Number($('#idEmpresaVenda').val()) || "";
        let dadosVenda = $('#idvenda_cpf').val() || "";
        let serie = $('#serie').val() || "";
        let nfce = $('#nfce').val() || "";
        let dadosVendaFormatado = dadosVenda?.split('-');
        let grupoEmpresa = $('#idGrupoEmpresaVenda').val();

        $('#voltaTela').addClass('d-none');

        if (dadosVendaFormatado?.length > 2) {
            dadosVenda = dadosVendaFormatado.join('-');
        } else {
            dadosVenda = dadosVenda.replace(/[^0-9]/g, '');
            $('#btnCadCliente').attr('value', dadosVenda);
        }

        $("#resultadoVendaClienteVoucher").DataTable().clear().destroy();
        $(".tabelaVenda").addClass('d-none');
        $("#resultadoProduto").DataTable().clear().destroy();
        $(".tabelaProduto").addClass('d-none');

        await ajaxGetAllData(`api/venda/lista-venda-cliente.xsjs?dtInicio=${dataInicio}&dtFim=${dataFim}&idSubgrupoEmpresarial=${grupoEmpresa}&idEmpresa=${idLoja}&cpfouIdVenda=${dadosVenda}&nnf=${nfce}&serie=${serie}&pageSize=500`, 'Carregando Dados...')
            .then(retornoPesquisaVendaCliente)
            .catch((error) => { throw error })

    } catch (error) {
        animationLoadingStop();
        console.log(error);
        msgError();
    }
}

function retornoPesquisaVendaCliente(respostapesquisaVendaCliente) {
    let { data } = respostapesquisaVendaCliente;
    let dadosTable = [];
    let dadosVenda;
    let idVenda;
    let nomeRazao;
    let sobrenomeFant;
    let nuCnpj;
    let nuCpf;
    let nomeClienteVenda;
    let cpfCnpjCliente;
    let loja;
    let valorTotal;
    let dataVenda;
    let dataVendaFormatada;
    let situacaoVenda;
    let diasAposACompra;
    let stCortesia;
    let stDefeito;
    let opcoesVenda;

    $(".tabelaVenda").removeClass('d-none');

    for (let i = 0; i < data.length; i++) {
        dadosVenda = data[i]?.venda;
        idVenda = dadosVenda?.IDVENDA;
        nomeRazao = dadosVenda?.DSNOMERAZAOSOCIAL || "";
        sobrenomeFant = dadosVenda?.DSAPELIDONOMEFANTASIA || "";
        nuCnpj = dadosVenda?.DEST_CNPJ ? maskCNPJ(dadosVenda?.DEST_CNPJ) : "";
        nuCpf = dadosVenda?.DEST_CPF ? maskCPF(dadosVenda?.DEST_CPF) : "";
        nomeClienteVenda = nuCpf ? (nomeRazao + " " + sobrenomeFant) : nomeRazao;
        cpfCnpjCliente = nuCnpj || nuCpf;
        loja = dadosVenda?.NOFANTASIA;
        valorTotal = dadosVenda?.VRTOTALPAGO;
        dataVenda = dadosVenda?.DTHORAFECHAMENTO;
        dataVendaFormatada = dadosVenda?.DTHORAFECHAMENTOFORMATEUA;
        diasAposACompra = retornaDiasEntreDatas(dataVendaFormatada).toLocaleString('pt-BR');

        situacaoVenda = `
        <label class"fw-500" style="color: ${dadosVenda?.STCANCELADO == 'False' ? 'blue' : 'red'};">${dadosVenda?.STCANCELADO == 'False' ? 'Ativa' : 'Cancelada'}</label>
    `;

        stCortesia = diasAposACompra <= 32 ? `<span class="text-success h5 fw-900 cursor-pointer" title="Valida Para CORTESIA">Válida</span>` : `<span class="text-danger h5 fw-900 cursor-pointer" title="Fora do Prazo Para CORTESIA">Inválida</span>`;

        stDefeito = diasAposACompra <= 90 ? `<span class="text-success h5 fw-900 cursor-pointer" title="Valida Para DEFEITO">Válida</span>` : `<span class="text-danger h5 fw-900 cursor-pointer" title="Fora do Prazo Para DEFEITO">Inválida</span>`;

        diasAposACompra = `<span class="fw-900 cursor-pointer" title="Dias Passados Após a Compra: ${diasAposACompra}">${diasAposACompra}</span>`;

        opcoesVenda = `
        <div class="btn-group btn-group-xs">
            <button type="button" class="btn btn-info btn-xs" title="Visualizar Produtos" id="${idVenda}" onclick="visualizarProdutos(this.id, '${dataVendaFormatada}')" ><span class="fal fa-eye w-100"></span></button>
        </div>
    `;

        dadosTable.push([
            (i + 1),
            loja,
            idVenda,
            dataVenda,
            maskValor(valorTotal),
            stCortesia,
            stDefeito,
            diasAposACompra,
            opcoesVenda
        ])
    }

    $("#resultadoVendaClienteVoucher").DataTable({
        data: dadosTable,
        paging: true,
        pageLength: 10,
        searching: true,
        info: true,
        deferRender: true,
        responsive: true,
        columnDefs: [
            { width: '5%', targets: [0] },
            { width: '10%', targets: [2] },
            { width: '35%', targets: 1 },
            { width: '10%', targets: [3], type: 'date-time-br' },
            { width: '10%', targets: [4], type: 'currency-brl' },
            { width: '10%', targets: [5, 6], className: 'text-center' },
            { width: '5%', targets: [7, 8], className: 'text-center' },
        ],
        initComplete: function (settings) {
            let idTable = `#${settings.nTable.id}`;

            $('html, body').animate({
                scrollTop: $(idTable).offset().top - 70
            }, 1000);

            $(idTable).find('tbody td:first').focus()
        },
        language: {
            "emptyTable": "Dados não encontrados, verifique os dados inseridos na pesquisa e tente novamente!"
        },
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",

        buttons: [
            {
                extend: 'pdfHtml5',
                text: 'PDF',
                titleAttr: 'Generate PDF',
                className: 'btn-outline-danger btn-sm mr-1'
            },
            {
                extend: 'excelHtml5',
                text: 'Excel',
                titleAttr: 'Gerar Excel',
                className: 'btn-outline-success btn-sm mr-1',
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function (data, row, column, node) {
                            data = $('<p>' + data + '</p>').text();
                            return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
                        }
                    }
                }
            },
            {
                extend: 'print',
                text: 'Print',
                titleAttr: 'Print Table',
                className: 'btn-outline-primary btn-sm'
            }
        ]
    });

}

async function visualizarProdutos(IdVenda) {
    try {
        $("#resultadoProduto").DataTable().clear().destroy();
        $(".tabelaVenda").addClass('d-none');
        $('.tabelaProduto').removeClass('d-none');

        await ajaxGetAllData(`api/venda/lista-venda-cliente.xsjs?id=${IdVenda}`)
            .then(retornoVisualizarProdutos)
            .catch((error) => { throw error })

    } catch (error) {
        animationLoadingStop();
        console.log(error);
        msgError();
    }

}

async function retornoVisualizarProdutos(respostaVisualizarProdutos) {
    let { data } = respostaVisualizarProdutos || [];
    let dadosTable = [];
    let qtdProds = 0;
    let stTroca = "disabled";
    let qtdItensTrocados = 0;
    let idVenda;
    let nrNfce;
    let dataVendaFormatada;
    let DIFERENCAEMDIAS;
    let idProduto;
    let idVendaDetalhe;
    let codProduto;
    let descProduto;
    let codBarras;
    let quantidade;
    let valorProd;
    let valorProdUnit;
    let valorTotalProdBruto;
    let descontoProduto;
    let checked;
    let idVendedor;
    let stQuantidade;
    let statusProd;
    let stCancelado;
    let indice = 0;

    for (let i = 0; i < data.length; i++) {
        let { venda, detalhe } = data[i] || [];
        if (i == 0) {
            idVenda = venda.IDVENDA;
            nrNfce = venda.NRNOTA;
            dataVendaFormatada = venda?.DTHORAFECHAMENTOFORMATEUA || "";
            DIFERENCAEMDIAS = retornaDiasEntreDatas(dataVendaFormatada);
        }

        for (let j = 0; j < detalhe.length; j++) {
            let { det } = detalhe[j];

            idProduto = det?.CPROD;
            idVendaDetalhe = det?.IDVENDADETALHE;
            codProduto = det?.CPROD;
            descProduto = det?.XPROD;
            codBarras = det?.NUCODBARRAS;
            quantidade = Number(det?.QTD || 0);
            valorProd = parseFloat(det?.VRTOTALLIQUIDO);
            valorProdUnit = parseFloat(det?.VUNTRIB);
            valorTotalProdBruto = parseFloat(det?.VPROD);
            descontoProduto = valorProdUnit - valorProd;
            checked = det?.STTROCA == "True" ? "checked" : " ";
            idVendedor = det.VENDEDOR_MATRICULA;
            stQuantidade = "disabled";
            stCancelado = det?.STCANCELADO || "False";
            statusProd = det?.STTROCA !== "True" ? `<span class="text-success h5 fw-900 cursor-pointer" title="Disponível Para a Troca">Sim</span>` : `<span class="text-danger h5 fw-900 cursor-pointer" title="Inapto Para a Troca">Não</span>`;

            if (det?.STTROCA == "True") {
                statusProd = `<span class="text-danger h5 fw-900 cursor-pointer" title="Produto Trocado"> Trocado </span>`;
                qtdItensTrocados++;
            } else {
                statusProd = `<span class="text-success h5 fw-900 cursor-pointer" title="Disponível Para a Troca">Não Trocado</span>`
            }

            if (stCancelado == 'False') {
                qtdProds++;
                indice++;

                dadosTable.push([
                    indice,
                    codProduto,
                    descProduto,
                    codBarras,
                    quantidade,
                    maskValor(valorProd),
                    statusProd
                ])
            }
        }
    }

    $("#resultadoProduto").DataTable({
        data: dadosTable,
        pageLength: 10,
        paging: true,
        searching: true,
        info: true,
        deferRender: true,
        responsive: true,
        columnDefs: [
            {
                targets: [0, 1, 2, 4, 5, 6],
                className: 'text-center'
            }
        ],
        columns: [
            { width: '5%' },
            { width: '10%' },
            { width: '45%' },
            { width: '10%' },
            { width: '10%' },
            { width: '10%' },
            { width: '10%' }
        ],
        initComplete: function (settings) {
            let idTable = `#${settings.nTable.id}`;

            $('html, body').animate({
                scrollTop: $(idTable).offset().top - 70
            }, 1000);

            $(idTable).find('tbody td:first').focus()
        },
        language: {
            "emptyTable": "Não há Produtos"
        },
    });

    $('#nuVendaProd').html(`<span class="fw-500"><i>  Produtos - Venda: ${idVenda}</i></span>`).attr('value', nrNfce);

    let verificaProd = $("#resultadoProduto tbody tr td:last-child span");

    for (let i = 0; i < verificaProd.length; i++) {
        if ($(verificaProd[i]).text() == 'Sim') {
            qtdItensTrocados++
            //$(verificaProd[i]).closest('tr').css("opacity", 0.5)
            $(verificaProd[i]).closest('tr').attr('title', 'ESTE PRODUTO JÁ FOI TROCADO!')

        } else if (DIFERENCAEMDIAS > 30) {
            //$(verificaProd[i]).closest('tr').css("opacity", 0.5)
            $(verificaProd[i]).closest('tr').attr('title', `VENDA FORA DO PRAZO PARA A TROCA, JÁ SE PASSARAM: ${DIFERENCAEMDIAS} DIAS Após a Compra!`)
        } else {
            $(verificaProd[i]).closest('tr').attr('title', 'PRODUTO DISPONÍVEL PARA TROCA!')
        }
    }

    if (verificaProd.length - qtdItensTrocados == 0) {
        $('#nuVendaProd').html(`<span class="fw-500"><i>  Produtos _ Venda: ${idVenda}  </i>  &#160;&#160; <i class="todosTrocados text-danger h4">Todos os Produtos Desta Venda Já Foram Trocados</i></span>`);
    }

    if (DIFERENCAEMDIAS > 30) {
        $('#nuVendaProd').html(`<span class="fw-500"><i>  Produtos - Venda: ${idVenda}  </i>  &#160;&#160; <i class="text-danger h4" onmouseover="this.title = this.text">Dias Passados Após a Compra: <u><b>${DIFERENCAEMDIAS} DIAS<b></u></i></span>`);
    }

    $('#voltaTela').removeClass('d-none');
}

//? ================================================== FIM Rotina - Create Edit Cancel - VOUCHER ================================================== //


//////////////////// RELATÓRIO ALTERAÇÃO DE PREÇOS ////////////////////

// function ListaAlteracaoPreco(){

//     if (window.XMLHttpRequest) {
//       // code for IE7+, Firefox, Chrome, Opera, Safari
//       xmlhttp = new XMLHttpRequest();
//     } else {
//       // code for IE6, IE5
//       xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//     }

//     xmlhttp.onreadystatechange = function () {
//         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
//             document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
 
//             $('#dtconsultainicio').val(dataAtualCampo);

//             $("#idgrupograde").select2();
//             $("#idgrade").select2();
//             $("#idgrupo").select2();
//         	$("#idlojaaltpreco").select2();
                
//             ajaxGet('api/comercial/grupo-produto.xsjs')
//                 .then(retornoListaGrupo)
//                 .catch(funcError);
                
//             ajaxGet('api/comercial/subgrupo-produto.xsjs')
//                 .then(retornoListaSubGrupo)
//                 .catch(funcError);

// 	        ajaxGet('api/informatica/grupoempresas.xsjs')
//                 .then(retornoListaGrupoEmpresasSelect)
//                 .catch((e) => { funcError(), console.log(e) });
                
//             ajaxGet('api/comercial/empresa.xsjs')
//             	.then(retornoListaEmpresasSelect)
//             	.catch((e) => { funcError(), console.log(e) });
                        
//             // EVENTOS SELECT`S 
//             var $eventSelectGrupo = $("#idgrupograde");
//             $eventSelectGrupo.on("change", function (e) { pesqListaSubGrupoPorGrupo(); });
    
//         } 
//     };
//     xmlhttp.open("GET", "administrativo_action_alteracao_preco.html", true);
//     xmlhttp.send();
// }

// function alteracaopreco(numPage){

//     contador = 0;
//     dataRetorno  = [];
//     var idempresa    = $("#idlojaaltpreco").val();
//     var idgrupo      = $("#idgrupograde").val();
//     var idsubgrupo   = $("#idgrade").val();
//     var descproduto  = $("#descProduto").val();
//     var dtinicial    = $("#dtconsultainicio").val();

//     if(idempresa == ''){
//       Swal.fire({
//           type: "warning",
//           title: "Selecione uma EMPRESA.",
//           showConfirmButton: false,
//           timer: 15000
//         });
//         return;
//     }

//     if (window.XMLHttpRequest) {
//         // code for IE7+, Firefox, Chrome, Opera, Safari
//         xmlhttp = new XMLHttpRequest();
//     } else {
//         // code for IE6, IE5
//         xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//     }

//     xmlhttp.onreadystatechange = function () {
//         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
//             document.getElementById("resultado").innerHTML = xmlhttp.responseText;

//             ajaxGet('api/administrativo/alteracao-preco.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial)
//                 .then(retornoListaAlteracaoPreco)
//                 .catch(funcError);
//         }
//     };

//     xmlhttp.open("GET", "gerencia_action_alteracaopreco.html", true);
//     xmlhttp.send();
// }

// function chamarProximaListaAlteracaoPreco(numPage){
    
//     var idempresa    = $("#idlojaaltpreco").val();
//     var idgrupo      = $("#idgrupograde").val();
//     var idsubgrupo   = $("#idgrade").val();
//     var descproduto  = $("#descProduto").val();
//     var dtinicial    = $("#dtconsultainicio").val();

//     ajaxGet('api/administrativo/lista-alteraco-preco.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial)
//         .then(retornoListaAlteracaoPreco)
//         .catch(funcError);
        	
//     $("#resultado").html(
//         "<div align=\"center\">" +
//             "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
//             "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
//         "</div>"
//     );
// }

// function retornoListaAlteracaoPreco(respostaListaAlteracaoPreco) {

//     var numPageAtual = parseInt(respostaListaAlteracaoPreco.page); 

//     if(respostaListaAlteracaoPreco.data.length != 0){
//         for (var i=0; i < respostaListaAlteracaoPreco.data.length; i++) { 
//             contador ++;
            
//             var cCodBarras  = respostaListaAlteracaoPreco.data[i].produtos[0]['preco']['NUCODBARRAS'];
//             var NoEmpresa  = respostaListaAlteracaoPreco.data[i].produtos[0]['preco']['NOEMPRESA'];
//             var IdProduto    = respostaListaAlteracaoPreco.data[i].produtos[0]['preco']['IDPRODUTO'];
//             var cProduto    = respostaListaAlteracaoPreco.data[i].produtos[0]['preco']['DSNOME'];
//             var dSSubGrupoEst    = respostaListaAlteracaoPreco.data[i].produtos[0]['preco']['DSSUBGRUPOESTRUTURA'];
//             var QtdEstoque    = respostaListaAlteracaoPreco.data[i].produtos[0].estoque[0]['prodestoque']['QTDFINAL'];
//             //vCusto      = parseFloat(registro.PRECOCUSTO).toLocaleString('pt-BR', { minimumFractionDigits: 2});
//             var vVenda      = parseFloat(respostaListaAlteracaoPreco.data[i].produtos[0]['preco']['PRECO_VENDA']).toLocaleString('pt-BR', { minimumFractionDigits: 2});
//             var vVendaAntigo      = parseFloat(respostaListaAlteracaoPreco.data[i].produtos[0].precoantigo[0]['antigopreco']['PRECOANTIGO']).toLocaleString('pt-BR', { minimumFractionDigits: 2});

//             //if(QtdEstoque!=0){
//                 dataRetorno.push( [contador,
//                                 NoEmpresa,
//                                 IdProduto,
//                                 cCodBarras,
//                                 cProduto,
//                                 vVendaAntigo,
//                                 vVenda,
//                                 QtdEstoque,
//                                 dSSubGrupoEst
//                                 ])
//             //}
//         }
        
//         chamarProximaListaAlteracaoPreco(numPageAtual + 1); 
//     }else{
//          $('#resultado').html(
//             `<table id="dt-basic-alteracao-preco" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
//                 <thead class="bg-primary-600">
//                     <tr>
//                         <th>#</th>
//                         <th>Empresa</th>
//                         <th>ID Produto</th>
//                         <th>Código Barras</th>
//                         <th>Produto</th>
//                         <th>PV Antigo</th>
//                         <th>PV Novo</th>
//                         <th>QTD Estoque</th>
//                         <th>Estrutura</th>
//                     </tr>
//                 </thead>
//                 <tbody id="resultadoAlteraPreco">
//                 </tbody>
//                 <tfoot id="totalresultadoAlteraPreco" class="thead-themed">
//                     <th>#</th>
//                     <th></th>
//                     <th></th>
//                     <th></th>
//                     <th></th>
//                     <th></th>
//                     <th></th>
//                     <th></th>
//                     <th></th>
//                 </tfoot>
//             </table>`
//         );
	   
// 	    $('#dt-basic-alteracao-preco').DataTable( {
// 	        data: dataRetorno,
//             "footerCallback": function ( row, data, start, end, display ) {
//             var api = this.api(), data;
 
//             // Remove the formatting to get integer data for summation
//             var intVal = function ( i ) {
//                 return typeof i === 'string' ?
//                     i.replace(/[\$,]/g, '')*1 :
//                     typeof i === 'number' ?
//                         i : 0;
//             };
 
//             // Total over all pages
//             //totalEstoque = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
//             //totalGeralCusto = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
//             //totalGeralVenda = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
//             //totalMarkup = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
//             // Total over this page
//             //pageTotalEstoque = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
//           // pageTotalGeralCusto = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
//           // pageTotalGeralVenda = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
//             //pageTotalMarkup = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
//             // Update footer
//             //$( api.column( 4 ).footer() ).html(pageTotalEstoque +' ('+ totalEstoque +' total )');
//             //$( api.column( 7 ).footer() ).html(pageTotalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
//             //$( api.column( 8 ).footer() ).html(pageTotalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
//             //$( api.column( 8 ).footer() ).html(pageTotalMarkup.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalMarkup.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
//         },
    
            
//             deferRender:    true,
//             //scrollY:        800,
//             //scrollCollapse: false,
//             //scroller:       false,
//             responsive: true,
//             dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
//                         "<'row'<'col-sm-12'tr>>" +
//                         "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
//             buttons: [
//                         {
//                             extend: 'pdfHtml5',
//                             text: 'PDF',
//                             titleAttr: 'Generate PDF',
//                             className: 'btn-outline-danger btn-sm mr-1'
//                         },
//                         {
//                             extend: 'excelHtml5',
//                             text: 'Excel',
//                             titleAttr: 'Gerar Excel',
//                             className: 'btn-outline-success btn-sm mr-1',
//                             exportOptions: {
//                               columns: ':visible',
//                               format: {
//                                   body: function(data, row, column, node) {
//                                       data = $('<p>' + data + '</p>').text();
//                                       return $.isNumeric(data.replace(',', '.')) ? data.replace(',', '.') : data;
//                                   }
//                               }
//                             }
//                         },
//                         {
//                             extend: 'print',
//                             text: 'Print',
//                             titleAttr: 'Print Table',
//                             className: 'btn-outline-primary btn-sm'
//                         }
//                     ]
//         } );
        
//     }
// }

function ListaAlteracaoPreco(){

  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
          
          $('#dtconsultainicio').val(dataAtualCampo);
          $("#dtconsultafim").val(dataAtualCampo)
            // if ($('#idgrupograde').find(`option[value="${idGrupoComIdSubgrupoEstrutura}"]`).length > 0) {
            // IdEstiloPedidoCad && $('#idgrupograde').attr('onchange', `selecionaestilogrupo('${IdEstiloPedidoCad}')`);
            
            // $('#estruturaprod').val(idGrupoComIdSubgrupoEstrutura).trigger('change').prop({
            //   'readonly': false,
            //   'disabled': false
            // });
            // }
            $("#idgrupograde, #idgrade").select2();
            $("#idgrupo").select2();
            $("#idlojaaltpreco").select2();

            ajaxGet('api/informatica/grupoempresas.xsjs')
              .then(retornoListaGrupoEmpresasSelect)
              .catch((e) => { funcError(), console.log(e) });
              
            ajaxGet('api/comercial/empresa.xsjs')
              .then(retornoListaEmpresasSelect)
              .catch((e) => { funcError(), console.log(e) });
              
            ajaxGet('api/comercial/grupo-produto.xsjs')
                .then(retornoListaGrupo)
                .catch(funcError);
                
            ajaxGet('api/comercial/subgrupo-produto.xsjs')
                .then(retornoListaSubGrupoAlteracaoPreco)
                .catch(funcError);
              
          // EVENTOS SELECT`S 
          var $eventSelectGrupo = $("#idgrupograde");
          $eventSelectGrupo.on("change", function (e) { pesqListaSubGrupoPorGrupoAlteracaoPreco(); });
  
      } 
  };
  xmlhttp.open("GET", "administrativo_action_alteracao_preco.html", true);
  // xmlhttp.open("GET", "gerencial_action_alteracao_preco.html", true);
  xmlhttp.send();
}

// Atualiza as variáveis globais para os grupos e subgrupos selecionados
var selectedGroups = [];
var selectedSubgroups = [];

function alteracaopreco(numPage) {
  // var idEmpresa = IDEmpresaLogin;

  // Converte os arrays de IDs para strings separadas por vírgulas
  var grupo = selectedGroups.join(',');
  var subgrupo = selectedSubgroups.join(',');

  var idEmpresa    = $("#idlojaaltpreco").val();
  var estoque = $("#estoque").is(":checked");
  var descproduto = $("#descProduto").val();
  var codBarras = $("#codBarras").val();
  var dataInicio = $("#dtconsultainicio").val();
  var dataFim = $("#dtconsultafim").val();

  if(idEmpresa == ''){
    Swal.fire({
       type: "warning",
       title: "Selecione uma EMPRESA.",
       showConfirmButton: false,
       timer: 15000
     });
     return;
  }

  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      document.getElementById("resultado").innerHTML = xmlhttp.responseText;

      ajaxGetAllData('api/administrativo/alteracao-preco.xsjs?page=' + numPage + '&idEmpresa=' + idEmpresa + '&grupo=' + encodeURIComponent(grupo) + '&subgrupo=' + encodeURIComponent(subgrupo) + '&descProduto=' + descproduto + '&codBarras=' + codBarras + '&estoque=' + estoque + '&dataInicio=' + encodeURIComponent(dataInicio) + '&dataFim=' + encodeURIComponent(dataFim))
        .then(retornoListaAlteracaoPreco)
        .catch(funcError);
    }
  };

  xmlhttp.open("GET", "gerencial_action_alteracaopreco.html", true);
  xmlhttp.send();
}

function retornoListaAlteracaoPreco(respostaListaAlteracaoPreco) {
  var numPageAtual = parseInt(respostaListaAlteracaoPreco.page);
  var dataRetornoAtualizaPreco = [];
  var totalPrecoAnterior = 0;
  var totalPrecoAtual = 0;
  var totalDiferencaPreco = 0;
  var totalValorAtual = 0;
  var totalValorAnterior = 0;
  var totalDiferencaValor = 0;
  var somaDiferencaPercentual = 0;
  var totalEstoque = 0;

  if (numPageAtual === 1) {
    totalVrDepositadoCons = 0;
    $('#totalResultadoAlteracao').html('');
  }

  if (respostaListaAlteracaoPreco.data.length != 0) {
    for (var i = 0; i < respostaListaAlteracaoPreco.data.length; i++) {
      var registro = respostaListaAlteracaoPreco.data[i];
      var numeroAlteracao = registro.IDRESUMOALTERACAOPRECOPRODUTO;;
      var dataAlteracao = registro.DTHORAEXECUTADO;
      var idGrupo = registro.IDGRUPOESTRUTURA;
      var dsGrupo = registro.DSGRUPOESTRUTURA;
      var dsSubGrupo = registro.DSSUBGRUPOESTRUTURA;
      var produto = registro.DSNOME;
      var codigo = registro.IDPRODUTO;
      var codBarras = registro.NUCODBARRAS;
      var precoVendaAnterior = parseFloat(registro.PRECOVENDAANTERIOR);
      var precoVenda = parseFloat(registro.PRECOVENDA);
      var qtdEstoque = parseFloat(registro.QTDFINAL) || 0;  
    
      var diferencaPreco = parseFloat(precoVenda) - parseFloat(precoVendaAnterior);
      var valorAnterior = parseFloat(precoVendaAnterior) * parseFloat(qtdEstoque);
      var valorAtual = parseFloat(precoVenda) * parseFloat(qtdEstoque);
      var diferencaValor = parseFloat(valorAtual) - parseFloat(valorAnterior);
      var diferencaPercentual = ((parseFloat(valorAtual) - parseFloat(valorAnterior)) / parseFloat(valorAnterior)) * 100 || 0;
      var diferencaPercentualFormatted = diferencaPercentual.toFixed(2) + '%';
        
    if (dataAlteracao) {
        let date = new Date(dataAlteracao);
        let formattedDate = date.toISOString().split('T')[0];
        dataAlteracao = formattedDate;
      }
      let grupo = idGrupo + ' - ' + dsGrupo;
      totalPrecoAnterior += parseFloat(precoVendaAnterior);
      totalPrecoAtual += parseFloat(precoVenda);
      totalDiferencaPreco += parseFloat(diferencaPreco);
      totalValorAtual += parseFloat(valorAtual);
      totalValorAnterior += parseFloat(valorAnterior);
      totalDiferencaValor += parseFloat(diferencaValor);
      somaDiferencaPercentual += parseFloat(diferencaPercentual) * qtdEstoque;
      totalEstoque += parseFloat(qtdEstoque);
      var mediaDiferencaPercentualFormatted = (somaDiferencaPercentual / totalEstoque).toFixed(2) + '%';

      dataRetornoAtualizaPreco.push([
        dataAlteracao,
        numeroAlteracao,
        grupo,
        dsSubGrupo,
        produto,
        codigo,
        codBarras,
        qtdEstoque,
        parseFloat(precoVendaAnterior).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        parseFloat(precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        
        (diferencaPreco >= 0 ? '+ R$ ' : '- R$ ') + mascaraValor(Math.abs(diferencaPreco).toFixed(2)),
        parseFloat(valorAnterior).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        parseFloat(valorAtual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        (diferencaValor >= 0 ? '+ R$ ' : '- R$ ') + mascaraValor(Math.abs(diferencaValor).toFixed(2)),
        diferencaPercentualFormatted
      ]);
    }
  }

  $('#resultadoAlteracao').html(
    `<table id="dt-basic-alteracao-preco" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
        <thead class="bg-primary-600">
            <tr>
                <th>Data</th>
                <th>Nº Alteração</th>
                <th>Grupo</th>
                <th>Sub Grupo</th>
                <th>Produto</th>
                <th>Código</th>
                <th>Código Barras</th>
                <th>Estoque</th>
                <th>Preço Anterior</th>
                <th>Preço Atual</th>
                <th>Dif(R$)</th>
                <th>Valor Anterior</th>
                <th>Valor Atual</th>
                <th>Dif(R$)</th>
                <th>Dif(%)</th>
            </tr>
        </thead>
        <tbody id="resultadoListaAlteracao">
        </tbody>
        <tfoot id="totalResultadoAlteracao" class="table thead-themed w-100">
        </tfoot>
    </table>`
  );

  $('#dt-basic-alteracao-preco').DataTable({
    data: dataRetornoAtualizaPreco,
    deferRender: true,
    responsive: true,
    dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
         "<'row'<'col-sm-12'tr>>" +
         "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    buttons: [
      {
        extend: 'pdfHtml5',
        text: 'PDF',
        titleAttr: 'Generate PDF',
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
        text: 'Print',
        titleAttr: 'Print Table',
        className: 'btn-outline-primary btn-sm'
      }
    ]
  });

  
  $('#totalResultadoAlteracao').html(
    `<tr>
        <th colspan="5" style="text-align: center;">Total</th>
        <th>${parseFloat(totalEstoque)}</th>
        <th>${mascaraValor(totalPrecoAnterior.toFixed(2))}</th>
        <th>${mascaraValor(totalPrecoAtual.toFixed(2))}</th>
        <th>${(totalDiferencaPreco >= 0 ? '+' : '-') + mascaraValor(Math.abs(totalDiferencaPreco).toFixed(2))}</th>
        <th>${mascaraValor(totalValorAnterior.toFixed(2))}</th>
        <th>${mascaraValor(totalValorAtual.toFixed(2))}</th>
        <th>${(totalDiferencaValor >= 0 ? '+' : '-') + mascaraValor(Math.abs(totalDiferencaValor).toFixed(2))}</th>
        <th>${mediaDiferencaPercentualFormatted}</th>
    </tr>`
  );
}

function retornoListaSubGrupoAlteracaoPreco(respostaListaSubGruposPedidos) {
  var listaSubGrupos = respostaListaSubGruposPedidos.data;
  var IDGrupoAnterior = '';
  var codHtml = `
    <li class="select-all-container">
      <input type="checkbox" id="select-all" class="select-all-global">
      <label for="select-all">Selecionar Tudo</label>
    </li>
    <li class="select-all-container">
      <input type="checkbox" id="estoque" class="">
      <label for="estoque">Sem Estoque</label>
    </li>
  `;

  for (var i = 0; i < listaSubGrupos.length; i++) {
    var IDSubGrupo = listaSubGrupos[i]['ID_ESTRUTURA'];
    var DSSubGrupo = listaSubGrupos[i]['ESTRUTURA'];
    var IDGrupo = listaSubGrupos[i]['ID_GRUPO'];
    var DSgrupoGrade = listaSubGrupos[i]['DS_GRUPO'];

    if (IDGrupo === IDGrupoAnterior) {
      codHtml += `
        <li class="custom-option" data-group-id="${IDGrupo}">
          <input type="checkbox" id="option-${IDGrupo}-${IDSubGrupo}" name="options" value="${IDSubGrupo}">
          <label for="option-${IDGrupo}-${IDSubGrupo}"> ${DSSubGrupo}</label>
        </li>`;
    } else {
      if (IDGrupoAnterior !== '') {
        codHtml += `</ul></li>`;
      }
      codHtml += `
        <li class="custom-optgroup" data-group-id="${IDGrupo}">
          <span class="toggle-icon">▶</span>
          <input type="checkbox" class="select-all-group" data-group-id="${IDGrupo}" id="group-${IDGrupo}">
          <label for="group-${IDGrupo}"> ${DSgrupoGrade.toUpperCase()}</label>
        </li>
        <ul class="custom-option-group" id="group-options-${IDGrupo}">`;
    }
    IDGrupoAnterior = IDGrupo;
  }
  codHtml += '</ul>';

  $("#custom-select").html(codHtml);

  // Adicionar evento de seleção global
  $('.select-all-global').on('change', function () {
    var isChecked = $(this).is(':checked');
    $('.custom-option input[type="checkbox"]').prop('checked', isChecked);
    selectedGroups = isChecked ? $('.custom-option input[type="checkbox"]').map(function () { return $(this).val(); }).get() : [];
  });

  // Adicionar evento de seleção de grupo
  $('.select-all-group').on('change', function () {
    var groupId = $(this).data('group-id');
    var isChecked = $(this).is(':checked');
    $(`#group-options-${groupId} input[type="checkbox"]`).prop('checked', isChecked);
    if (isChecked) {
      selectedGroups.push(groupId);
    } else {
      var index = selectedGroups.indexOf(groupId);
      if (index > -1) {
        selectedGroups.splice(index, 1);
      }
    }
  });

  // Adicionar evento de seleção de opções individuais
  $('.custom-option input[type="checkbox"]').on('change', function () {
    var value = $(this).val();
    var isChecked = $(this).is(':checked');
    if (isChecked) {
      selectedGroups.push(value);
    } else {
      var index = selectedGroups.indexOf(value);
      if (index > -1) {
        selectedGroups.splice(index, 1);
      }
    }
  });
}

//=== INICIO ROTINA AUTORIZA VENDA FORA DO PRAZO PARA TROCA/EXCECAO ===//
/*
Autor: Hendryw Deyvison
E-mail: hendryw.deyvison@gmail.com
Data: 21/11/2023
*/

function mascaraMulti(dados, funcao) {
    v_obj = dados
    v_fun = funcao
    setTimeout('execmascara()', 1)
}

function mascaraMultiAutomatica(dados) {
    v_obj = dados;
    setTimeout('execmascaraAutomatica()', 1)
}

function execmascaraAutomatica() {
    v_obj.value = v_obj.value.length > 14 ? Cnpj(v_obj.value) : Cpf(v_obj.value)
}

function execmascara() {
    v_obj.value = v_fun(v_obj.value)
}

function onlyNum(valor){
    valor = valor.replace(/\D/g, "")
    return valor;
}

//	função que mascara o CPF
function maskCPF(CPF) {
    return CPF.substring(0, 3) + "." + CPF.substring(3, 6) + "." + CPF.substring(6, 9) + "-" + CPF.substring(9, 11);
}

//	função que mascara o CNPJ
function maskCNPJ(CNPJ) {
    return CNPJ.substring(0, 2) + "." + CNPJ.substring(2, 5) + "." + CNPJ.substring(5, 8) + "/" + CNPJ.substring(8, 12) + "-" + CNPJ.substring(12, 14);
}

//	função que mascara o VALOR
function maskValor(valor) {
    return new Intl.NumberFormat('br-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

// Cria tabela com o dataTable
function createDataTable(TituloTabela, idTabela, arrayDados, configsTable){
    let headTable = `<thead class="bg-primary-600">
                        <tr>
                            ${Object.keys(arrayDados[0]).map(chave => `<th title="${chave}" class="text-center">${chave}</th>` ).join('')}
                        </tr>
                    </thead>`;

    let bodyTable = `<tbody>
                        ${arrayDados.map(item => {
                            celulas = Object.values(item).map(valor => `<td >${valor}</td>`).join(' ');
                            return `<tr>${celulas}</tr>`;
                        }).join('')}
                    </tbody>
    `;
    let htmlTable = `
        <div class="row m-2 tableDados">
            <div class="col-sm-12 col-xl-12">
                <div id="panel-1" class="panel">
                    <div id="titleTable_${idTabela}" class="panel-hdr mb-3">
                        <span class="fw-500 h6 pl-2"><i> ${TituloTabela} </i></span>
                    </div>
                    <div class="m-2">
                        <table id="${idTabela}" class="table table-bordered table-hover table-expandable table-striped  w-100">
                            ${headTable}
                            ${bodyTable}
                            <tfooter></tfooter>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

   let verifica = setInterval(()=>{
        if($(`#${idTabela}`).hasClass('table')){
            $(`#${idTabela}`).DataTable(configsTable)
            clearInterval(verifica)
        }
    }, 200)
        
    return htmlTable;
}

async function TelaPesquisaVendaExcecao() {
    let dodosUser = await getCurrentUser();
    let userFuncao = dodosUser?.user?.DSFUNCAO;
    let grupoEmpresa = +dodosUser?.user?.IDGRUPOEMPRESARIAL || "";
    let modalLoading = setTimeout(() => animacaoCarregamento(), delayMaximo);

    $.get("action_pesq_venda_autoriza_excecao.html", (resp) => {
        $("#js-page-content").html(resp);

        $('.dataAtual').text(dataAtual);
        $('#dtconsultavendainicio').val(dataAtualCampo);
        $('#dtvendaconsultafim').val(dataAtualCampo);
        $('#idEmpresaVenda').select2();

        $('#idEmpresaVenda').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
        $('#idvenda_cpf_cnpj_cliente').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
        $('#idSerieCliente').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
        $('#idNfceCliente').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });

    }).then(() => {
        ajaxGet(`api/empresa.xsjs`)
            .then((dadosEmpresas) => {
                retornoListaEmpresasSelectVendaExcecao(dadosEmpresas);

                clearTimeout(modalLoading);
                Swal.close();
            })
            .catch((e) => {
                clearTimeout(modalLoading);
                Swal.close();

                msgError('Erro ao Carregar a lista de lojas, tente novamente!');

                console.log(e);
            });
    }).fail((e) => {
        clearTimeout(modalLoading);
        Swal.close();

        msgError('Erro ao Carregar a página, tente novamente!');

        console.log(e.statusText)
    })

}

function retornoListaEmpresasSelectVendaExcecao(respostaListaEmpresas) {

    let dadosSelectEmpresas = []

    listaEmpresas = respostaListaEmpresas.data;

    for (let i = 0; i < listaEmpresas.length; i++) {

        let IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
        let DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

        dadosSelectEmpresas.push({
            IDEmpresa,
            DSEmpresa
        })

    }

    dadosSelectEmpresas.sort(function (a, b) {
        if (a.IDEmpresa > b.IDEmpresa) {
            return 1;
        }

        if (a.IDEmpresa < b.IDEmpresa) {
            return -1;
        }
        return 0;
    })

    for (const elemento of dadosSelectEmpresas) {

        $('#idEmpresaVenda').append(
            `<option value="` + elemento.IDEmpresa + `"> ` + elemento.DSEmpresa + `</option>`);
    }


}

async function pesquisaVendaClienteExcecao() {
    try {
        let dodosUser = await getCurrentUser();
        let userFuncao = dodosUser?.user['DSFUNCAO'];
        let grupoEmpresa = dodosUser?.user['IDGRUPOEMPRESARIAL'] || '';

        $('#voltaTela').addClass('d-none')
        $('.idCadastraVoucher ').addClass('d-none')
        $('.idCadastraCliente').attr('id', "");

        dadosVendaTabela = []
        id = 0
        ctdPreencheCNPJ = 0

        let dataInicio = $('#dtconsultavendainicio').val() || "";
        let dataFim = $('#dtvendaconsultafim').val() || "";
        let idLoja = +$('#idEmpresaVenda').val() || "";
        let dadosVenda = $('#idvenda_cpf_cnpj_cliente').val() || "";
        let serie = $('#idSerieCliente').val() || "";
        let nfce = $('#idNfceCliente').val() || "";

        if (dadosVenda.length >= 12) {
            dadosVenda = dadosVenda.replace(/\D/g, "");
            $('.idCadastraCliente').attr('id', dadosVenda);
        }

        $('#ResultadoPesquisa').html('')


        ajaxGetAllData(`api/venda/vendas-prazo-excedido-troca.xsjs?idEmpresa=${idLoja}&cpfouIdVenda=${dadosVenda}&nnf=${nfce}&serie=${serie}&idGrupoEmpresarial=${grupoEmpresa}&dtInicio=${dataInicio}&dtFim=${dataFim}`, 'Carregando Vendas...', retornoPesquisaVendaClienteExcecao);
        
    } catch (erro) {
        clearTimeout(modalLoading);
        Swal.close();

        msgError('Erro ao carregar as vendas, tente novamente!')

        console.log(erro)
    }

}


function zeraCampos(acao) {
    if (acao == 1 && $('#idvenda_cpf').val()) {
        $('#dtconsultavendainicio').val(dataAtualCampo);
        $('#dtvendaconsultafim').val(dataAtualCampo);
        $('#idEmpresaVenda').val('0').trigger('change');
        $('#serie').val('');
        $('#nfce').val('');

    } else if (acao == 2 && $('#serie').val() || $('#nfce').val()) {
        $('#idvenda_cpf').val('');

    }
}

function retornoPesquisaVendaClienteExcecao(respostapesquisaVendaCliente) {
        let dadosVendas = respostapesquisaVendaCliente.data || "";
        let contador = 0;

       dadosVendas.map((dadoVenda)=>{
            
            let idVenda = dadoVenda?.venda.IDVENDA
            let nomeRazao = dadoVenda?.venda["DSNOMERAZAOSOCIAL"] || dadoVenda?.venda["DSNOMERAZAOSOCIAL"];
            let sobrenomeFant = dadoVenda.venda["DSAPELIDONOMEFANTASIA"] || dadoVenda.venda["DSAPELIDONOMEFANTASIA"];
            let nuCnpj = dadoVenda?.venda["DEST_CNPJ"] ? maskCNPJ(dadoVenda.venda["DEST_CNPJ"]) : ""
            let nuCpf = dadoVenda?.venda["DEST_CPF"] ? maskCPF(dadoVenda.venda["DEST_CPF"]) : ""
            let nomeClienteVenda = nuCpf ? nomeRazao + " " + sobrenomeFant : nomeRazao || '';
            let cpfcnpjCliente = !nuCnpj ? nuCpf : nuCnpj;
            let loja = dadoVenda?.venda.NOFANTASIA;
            let valorTotal = dadoVenda?.venda.VRTOTALPAGO;
            let dataVenda = dadoVenda?.venda.DTHORAFECHAMENTO;
            let situacaoVenda = dadoVenda?.venda.STCANCELADO == 'False' ? `<label class="font-weight-bold text-info">Ativa</label>` : `<label class="font-weight-bold text-danger">Cancelada</label>`;
            let textStCortesia;
            let textStDefeito;
            let diasAposACompra;
            let stCortesia;
            let stDefeito;

            const DATAHORAVENDA = new Date(dataVenda.slice(6,10), (dataVenda.slice(3,5) > 1 ? dataVenda.slice(3,5)-1 : dataVenda.slice(3,5)), dataVenda.slice(0,2));
            const DATAHORAATUAL = new Date();
            const DIFERENCAEMDIAS = Math.ceil(Math.abs((DATAHORAATUAL.setHours(0, 0, 0, 0)) - DATAHORAVENDA.getTime())/(1000*60*60*24));

            textStCortesia = DIFERENCAEMDIAS <= 32 ? `<label class="font-weight-bold text-info" >Ativa</label>` : `<label class="font-weight-bold text-danger">Inativa</label>`;
            stCortesia = DIFERENCAEMDIAS <= 32 ? true : false;

            textStDefeito = DIFERENCAEMDIAS <= 90 ? `<label class="font-weight-bold text-info" >Ativa</label>` : `<label class="font-weight-bold text-danger">Inativa</label>`;
            stDefeito = DIFERENCAEMDIAS <= 90 ? true : false;

            diasAposACompra = `<label class="font-weight-bold text-danger">${DIFERENCAEMDIAS}</label>`;

            let opcoesVenda = `<div class="btn-group btn-group-xs">
                                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Produtos" id="${idVenda}" stCortesia="${stCortesia}" stDefeito="${stDefeito}" onclick="visualizarProdutosExcecao(this.id, ${stCortesia}, ${stDefeito})" ><span class="fal fa-list mr-1"></span></button>
                                </div> `;

            contador++;

            dadosVendaTabela.push({

                "Indice": contador,
                "Opções": opcoesVenda,
                "Nº Venda": idVenda,
                "Cliente": nomeClienteVenda,
                "CPF/CNPJ": cpfcnpjCliente,
                "Loja": loja,
                "Vr. Pago": maskValor(valorTotal),
                "Dt. Venda": dataVenda,
                "Status": situacaoVenda,
                "St. Cortesia": textStCortesia,
                "St. Defeito": textStDefeito,
                "Dias Passados": diasAposACompra
            })
       });



        if(dadosVendaTabela.length){

            let configsTable = {
                language: {
                    "emptyTable": "Dados não encontrados, verifique os dados inseridos na pesquisa e tente novamente!"
                },
                autoWidth: false,
                paging: true,
                pageLength: 10,
                searching: true,
                info: true,
                deferRender: false,
                responsive: false,
              //  scrollY: "1000px",
                scrollX: true,
                scrollCollapse: true,
                columnDefs: [
                    {
                        targets: [0, 1, 6, 8, 9, 10, 11],
                        className: 'text-center'
                    },
                    {
                        targets: [2, 3, 4, 5, 7],
                        className: 'text-left'
                    }
                ]
            }
            $('#ResultadoPesquisa').html('');
            $('#ResultadoPesquisa').append(createDataTable('Vendas Para Autorizar', 'idTabelaVendaExcecao', dadosVendaTabela, configsTable))

        } else{
            msgInfo("Dados não encontrados, verifique os dados inseridos na pesquisa e tente novamente!");
        }
}

async function visualizarProdutosExcecao(idVenda, stCortesia = false, stDefeito = false) {

    if(stCortesia && stDefeito){
        return msgInfo('Venda dentro do prazo de troca! Não há necessidade de autorização para efetuar a troca!','Se não for o caso, verifique os dados da venda!')
    }
    
    try{
       ajaxGetAllData(`api/venda/vendas-prazo-excedido-troca.xsjs?id=${idVenda}`, 'Carregando Produtos...', retornoVisualizarProdutosExcecao);
       
    } catch (erro) {
        animationLoadingStop();

        msgError('Erro ao carregar as vendas, tente novamente!')

        console.log(erro)
    }

}

async function retornoVisualizarProdutosExcecao(respostaVisualizarProdutos) {
    if (respostaVisualizarProdutos?.data?.length) {
        let dadosProdutoTabela = [];
        let dadosProdutos = respostaVisualizarProdutos.data;
        let idVenda = dadosProdutos[0].venda.IDVENDA;
        let nrNfce = dadosProdutos[0].venda.NRNOTA;
        let dadosCliente = !dadosProdutos[0].venda["DEST_CPF"] ? dadosProdutos[0].venda["DEST_CNPJ"] : dadosProdutos[0].venda["DEST_CPF"];
        let dataVenda = dadosProdutos[0].venda["DTHORAFECHAMENTO"];
        let contador = 0
        let idProduto;
        let idVendaDetalhe;
        let codProduto;
        let descProduto;
        let codBarras;
        let quantidade;
        let valorProd;
        let valorProdUnit;
        let valorTotalProdBruto;
        let descontoProduto;
        let stTroca;
        let checked;
        let idVendedor;
        let stQuantidade;
        let stCortesia;
        let stDefeito;
        let idExcecao;
        let stExcecao;
        let qtdExcecao;
        let tpExcecao;

        const DATAHORAVENDA = new Date(dataVenda.slice(6,10), (dataVenda.slice(3,5) > 1 ? dataVenda.slice(3,5)-1 : dataVenda.slice(3,5)), dataVenda.slice(0,2));
        const DATAHORAATUAL = new Date();
        const DIFERENCAEMDIAS = Math.ceil(Math.abs((DATAHORAATUAL.setHours(0, 0, 0, 0)) - DATAHORAVENDA.getTime())/(1000*60*60*24));

        $('#titleTable_resultadoProduto').html(`<span class="fw-500 h6"><i>  Produtos - Venda: ${idVenda}</i></span>`);
        $('#titleTable_resultadoProduto').attr('value', nrNfce);

        dadosProdutos.map((dadosVenda) => {
            dadosVenda.detalhe.map( dados => {
                dados = dados.det;

                contador++;
                idProduto = dados['CPROD'] || "";
                idVendaDetalhe = dados["IDVENDADETALHE"] || "";
                codProduto = dados["CPROD"] || "";
                descProduto = dados["XPROD"] || "";
                codBarras = dados["NUCODBARRAS"] || "";
                quantidade = Number(dados["QTD"]) || "";
                valorProd = parseFloat(dados["VRTOTALLIQUIDO"] || 0);
                valorProdUnit = parseFloat(dados["VUNTRIB"] || 0);
                valorTotalProdBruto = parseFloat(dados["VPROD"] || 0);
                descontoProduto = valorProdUnit - valorProd;
                idVendedor = dados['VENDEDOR_MATRICULA'] || "";
                stQuantidade = checked == "checked" || +quantidade <= 1 ? "disabled" : " ";
                stCortesia = DIFERENCAEMDIAS >= 33 ? false : true;
                stDefeito = DIFERENCAEMDIAS >= 91 ? false: true;
                idExcecao = dados["IDEXCECAO"] || "";
                stExcecao = dados["STEXCECAO"] || "";
                qtdExcecao = Number(dados["QTDAUTORIZADA"]) || "";
                stTroca = (dados["STTROCA"] == "True" || qtdExcecao == quantidade) ? "disabled" : " ";
                tpExcecao = dados["TIPOTROCA"] || "";
                checked = stTroca == "disabled" ? "checked" : " ";

                selecao = `<div class="custom-control custom-checkbox"> 
                                <input type="checkbox" class="custom-control-input" name="selecao" id="${contador}" value="${valorProd}" onchange="selecionaLinha(this.id)" idVenda="${idVenda}" diasPassadosDaCompra="${DIFERENCAEMDIAS}" idVendaDetalhe="${idVendaDetalhe}" idProduto="${idProduto}" quantidade="${quantidade}" valorProdUnit="${valorProdUnit}" valorTotalProdBruto="${valorTotalProdBruto}" descontoProduto="${descontoProduto}" valorProd="${valorProd}" idVendedor="${idVendedor}" cnpfCnpjCliente="${dadosCliente}" stCortesia="${stCortesia}" stDefeito="${stDefeito}" stExcecao="${stExcecao}" qtdExcecao="${qtdExcecao}" tpExcecao="${tpExcecao}"
                                ${checked} ${stTroca} />
                                <label class="custom-control-label" for="${contador}"></label>
                            </div>`

                quantidade = `<div class="custom-control"> 
                          <input type="text" name="quantidaProduto"  value="${+quantidade}" onkeyup="verificaQtdProdExcecao(this, ${quantidade})" onblur="(!this.value ? this.value = 1 : this.value)" style="width: 50px; text-align: center;" ${stQuantidade}>
                       </div>`

                $('#btnAutProdsVendaForaPrazo').attr('onclick', `autorizarProdsVendaForaPrazo(${stCortesia}, ${stDefeito})`);

                dadosProdutoTabela.push({
                    "Indice": contador,
                    "Selecione": selecao,
                    "Id Produto": idProduto,
                    "Produto": descProduto,
                    "Cod. Barras": codBarras,
                    "Quantidade": quantidade,
                    "Valor": maskValor(valorProd)
                });

            });
        });

        let configsTable = {
            language: {
                "emptyTable": "Não há Produtos"
            },
            defaultContent: 'Não há Produtos',
            pageLength: 25,
            paging: true,
            searching: true,
            info: false,
            deferRender: true,
            responsive: true,
            scrollY: "1000px",
            scrollX: true,
            scrollCollapse: true,
            columnDefs: [
                {
                    targets: [0, 1, 2, 4, 5, 6],
                    className: 'text-center'
                },
                {
                    targets: [3],
                    className: 'text-left'
                }
            ],
            columns: [
                { width: '5%' },
                { width: '5%' },
                { width: '10%' },
                { width: '50%' },
                { width: '15%' },
                { width: '5%' },
                { width: '15%' }
            ]

        };

        $('#ResultadoPesquisa .row.tableDados').addClass('d-none');
        $('.panel-hdr').removeClass('d-none');
        $('#voltaTela').removeClass('d-none');
        
        $('#ResultadoPesquisa .row.tableDados').length > 1 && $('#ResultadoPesquisa .row.tableDados:last').html('')

        $('#ResultadoPesquisa').append(createDataTable('Produtos', 'resultadoProduto', dadosProdutoTabela, configsTable));
        
        let verificaProd = $("[name=selecao]")
        let qtdItensTrocados = 0;

        verificaProd.map((indice, vendaProd) => {
            if (vendaProd.disabled && vendaProd.checked) {
                let quantidade = Number($(vendaProd).attr('quantidade'));
                let qtdExcecao = Number($(vendaProd).attr('qtdExcecao'));
                let tpExcecao = $(vendaProd).attr('tpExcecao');
                qtdItensTrocados++;
                
                selecionaLinha(vendaProd.id);

                $(vendaProd).parent('div').parent('td').parent().css("opacity", 0.5)
                $(vendaProd).parent('div').parent('td').parent().attr('title', `${qtdExcecao == quantidade ? `PRODUTO JÁ AUTORIZADO PARA EXCEÇÃO: ${tpExcecao}` : 'ESTE PRODUTO JÁ FOI TROCADO!'}`)

            } else if (DIFERENCAEMDIAS >= 33) {
                $(vendaProd).parent('div').parent('td').parent().attr('title', `VENDA FORA DO PRAZO DE 30 DIAS PARA A TROCA DO TIPO CORTESIA, JÁ SE PASSARAM: ${DIFERENCAEMDIAS} DIAS APÓS A COMPRA!`);

            } else if (DIFERENCAEMDIAS >= 91) {
                $(vendaProd).parent('div').parent('td').parent().attr('title', `VENDA FORA DO PRAZO DE 90 DIAS PARA A TROCAS DO TIPO CORTESIA OU DEFEITO, JÁ SE PASSARAM: ${DIFERENCAEMDIAS} DIAS APÓS A COMPRA!`);
            }
        })

        if (contador - qtdItensTrocados == 0) {
            stTroca = "disabled";

            $('#titleTable_resultadoProduto').html(`<span class="fw-500 h6"><i>  Produtos _ Venda: ${idVenda}</i>  &#160;&#160; <i class="todosTrocados text-danger h4">Todos os Produtos Desta Venda Já Foram Trocados</i></span>`);
        } else if (DIFERENCAEMDIAS >= 33 && DIFERENCAEMDIAS < 90) {
            $('#titleTable_resultadoProduto').html(`<span class="fw-500 h6"><i>  Produtos - Venda: ${idVenda}</i>  &#160;&#160; <i class="text-danger h4">Venda Fora do Prazo de <u><b>30 dias</u></b> Para Troca do Tipo <u><b>CORTESIA</u></b>. Dias Passados Após a Compra: <u><b>${DIFERENCAEMDIAS} DIAS<b></u></i></span>`);

        } else if (DIFERENCAEMDIAS >= 91) {
            $('#titleTable_resultadoProduto').html(`<span class="fw-500 h6"><i>  Produtos - Venda: ${idVenda}</i>  &#160;&#160; <i class="text-danger h4">Venda Fora do Prazo Para Trocas do Tipo <b>CORTESIA<u>(30 dias)</u></b> ou <b>DEFEITO<u>(90 dias)</u></b>. Dias Passados Após a Compra: <u><b>${DIFERENCAEMDIAS} DIAS<b></u></i></span>`);
        }

    } else {
        msgInfo("Dados não encontrados, venda sem produtos registrados, tente novamente!");
    }

}

function verificaQtdProdExcecao(element, quantidade){
    element.value = element.value.replace(/[^0-9]/g, '');

    element.value = element.value == '0' ? 1 : element.value;
    
    if(element.value > quantidade){
        element.value = quantidade;

        return msgWarning(`A quantidade não pode ser maior que a disponivel! Quantidade Disponivel: ${quantidade}`)
    }
}

function selecionaLinha(id) {
    let linhaSelecionada = $(`#${id}`).parent('div').parent('td').parent();
    let linhaSelecionadaQtd = $($(linhaSelecionada.children()[5])).children('div').children('input')[0];
  
    if (!linhaSelecionada.hasClass('selected')) {
      linhaSelecionada.addClass('selected').css("opacity", 0.8)
      linhaSelecionada.attr('title', 'PRODUTO SELECIONADO PARA AUTORIZAR!')
      $(linhaSelecionadaQtd).attr('disabled', true)
  
    } else {
      linhaSelecionada.removeClass('selected').removeAttr('style')
      linhaSelecionada.attr('title', '')
      $(linhaSelecionadaQtd).removeAttr('disabled')
      $(linhaSelecionadaQtd).val() == 1 ? $(linhaSelecionadaQtd).attr('disabled', true) : $(linhaSelecionadaQtd).removeAttr('disabled');
  
    }

    if($("[name=selecao]:checked:not(:disabled)").length){
        $('#btnAutProdsVendaForaPrazo').removeClass('d-none');
    }else{
        $('#btnAutProdsVendaForaPrazo').addClass('d-none');
    }
  
}

function voltaTelaVenda(){
    $('#ResultadoPesquisa .row.tableDados:first').removeClass('d-none');
    $('#ResultadoPesquisa .row.tableDados:last').addClass('d-none');
    $('#voltaTela').addClass('d-none');
    $('.panel-hdr').addClass('d-none');
    $('#ResultadoPesquisa .panel-hdr').removeClass('d-none');
}

async function autorizarProdsVendaForaPrazo(stCortesia, stDefeito){
   let dadosValidacao = await requisitaMatriculaSenha(stCortesia, stDefeito);
   let verificaProd = $("[name=selecao]");
   let dadosProdsAutorizados = [];

    if(!dadosValidacao){
        return false;
    }

    verificaProd.map((indice, vendaProd) => {
        if (!vendaProd.disabled && vendaProd.checked) {
            let tr = $(vendaProd).closest('tr')
            let IDVENDA = $(vendaProd).attr('idvenda');
            let IDVENDADETALHE = $(vendaProd).attr('idvendadetalhe');
            let IDPRODUTO = $(vendaProd).attr('idproduto');
            let VRPRODUTO = Number($(vendaProd).attr('valorprod'));
            let QTD = Number($(tr).find('input:last').val());
            let VRTOTALLIQUIDO = Number($(vendaProd).attr('value'));
            let DIASAPOSCOMPRAR = Number($(vendaProd).attr('diaspassadosdacompra'));
            let USERAUTORIZADOR = Number(dadosValidacao.idFuncionario);
            let MOTIVOEXCECAO = (dadosValidacao.mtExcecao).toUpperCase();;
            let TIPOTROCA = dadosValidacao.tipoTroca;

            dadosProdsAutorizados.push({
                IDVENDA,
                IDVENDADETALHE,
                IDPRODUTO,
                VRPRODUTO,
                QTD,
                VRTOTALLIQUIDO,
                USERAUTORIZADOR,
                MOTIVOEXCECAO,
                TIPOTROCA,
                DIASAPOSCOMPRAR
            });
        }
    })
    
    dadosProdsAutorizados.length && sobeProdsAutorizados(dadosProdsAutorizados);

}

function requisitaMatriculaSenha(stCortesia, stDefeito){
    let idFuncionario;

   return Swal.fire({
        title: 'Autorização',
        html: `<div class="d-block m-auto w-75">
                    <label class="form-label text-dark mt-2" for="matricula">Matrícula</label>
    
                    <div class="input-group">
                        <input type="text" id="matricula" class="swal2-input  m-1" placeholder="Matrícula" style="text-align: center;" onkeypress="mascaraMulti(this, onlyNum)">
                    </div>
    
                    <label class="form-label text-dark mt-2" for="senha">Senha</label>
    
                    <div class="input-group">
                        <input type="password" id="senha" class="swal2-input  m-1" placeholder="Senha" style="text-align: center;">
                    </div>
                </div>
              `,
        width: '20rem',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Voltar',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        timer: 120000,
        preConfirm: async() => {
          
          let matricula = $('#matricula').val().replace(/\D/g, "").trim();
          let senha = $('#senha').val();
          let loginFunc;
        
          $('#swal2-validation-message').addClass('font-weight-bold text-danger text-left')

          if(!matricula || !senha){
            Swal.showValidationMessage('Campo de Matrícula ou senha vazio');
            return false;
          }
    
          loginFunc = {
            "MATRICULA": matricula,
            "SENHA": senha
          };
          
          return ajaxPost('api/resumo-voucher/autFuncionarioExcecaoVenda.xsjs', loginFunc)
            .then(async (response) => {
              if(response?.msg){
                let msg = response?.msg;
                Swal.showValidationMessage(`${msg}`);
                return false;
              }

              idFuncionario = response?.data[0]?.IDFUNCIONARIO;
            })
            .catch((erro) => {
               Swal.showValidationMessage('Erro ao tentar verificar a matrícula e senha! Tente novamente!');
            })
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
            if(result.value){
                return requisitaTipoTrocaAutorizada(idFuncionario, stCortesia, stDefeito);
            }
      })
}

function requisitaTipoTrocaAutorizada(idFuncionario, stCortesia, stDefeito){
    let tipoTroca;
    let mtExcecao;

    return Swal.fire({
        title: 'Tipo da troca e motivo da Exceção?',
        html: `<div class="d-block m-auto" style="width: 50%;">
                    <label class="form-label text-dark" for="matricula">Tipo</label>
                    <div class="pb-2">
                        <select id="tipoTroca" class="select2">
                            <option value=''>Selecione</option>
                            <option value='CORTESIA' ${stCortesia ? "disabled title='ESTA VENDA ESTÁ DENTRO DO PRAZO PARA ESTE TIPO'" : ""}>CORTESIA</option>
                            <option value='DEFEITO' ${stDefeito ? "disabled title='ESTA VENDA ESTÁ DENTRO DO PRAZO PARA ESTE TIPO'" : ""}>DEFEITO</option>
                        </select>
                    </div>
                </div>
                <div class="d-block m-auto" style="width: 100%;">
                    <label class="form-label text-dark mt-2" for="mtExcecao">Motivo Exceção</label>
    
                    <div class="input-group">
                        <input type="text" id="mtExcecao" class="swal2-input m-1" placeholder="Digite o motivo da Exceção" style="text-align: left; text-transform: uppercase;">
                        <small class="form-label font-weight-bold text-dark">*Mínimo 10 caracteres</small>
                    </div>
                </div>`,
        width: '25rem',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Sair',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop:true,
        onOpen: () => { 
          $('#tipoTroca').select2();
          $('#tipoTroca').select2('focus');
        },
        preConfirm: async () => {
            tipoTroca = $('#tipoTroca').val();
            mtExcecao = $('#mtExcecao').val().replace(/\s+/g, ' ').trim();

            $('#swal2-validation-message').addClass('font-weight-bold text-danger text-left');

            if (!tipoTroca) {
                Swal.showValidationMessage(`Selecione o Tipo da Troca Antes de Prosseguir!`);
                $('#tipoTroca').val('').trigger('change');
                $('#tipoTroca').select2("focus");
                return false;
    
            }

            if (!mtExcecao) {
                Swal.showValidationMessage(`Campo de motivo vazio, digite o motivo para prosseguir!`);
                $('#mtExcecao').focus();
                return false;
            } else if (mtExcecao.replace(/\s+/g, '').length < 10) {
                $('#mtExcecao').val(mtExcecao);
                Swal.showValidationMessage(`Campo de motivo menor que 10 caracteres, Faltam: ${10 - mtExcecao.replace(/\s+/g, '').trim().length} caracteres!`);
                $('#mtExcecao').focus();
                return false;
            }

        }
      }).then((result) => {
        if(result.value){
            return {
                idFuncionario,
                tipoTroca,
                mtExcecao
            };
        }

        return false
      })
}

function sobeProdsAutorizados(dadosProdAutorizados){
    let modalLoading = setTimeout(()=>animacaoCarregamento('Inserindo dados...'), delayMaximo);

    ajaxPost('api/venda/vendas-prazo-excedido-troca.xsjs', dadosProdAutorizados)
    .then((resp)=>{
        clearTimeout(modalLoading);
        Swal.close();

        msgSuccess(`${resp.msg}`).then(()=>TelaPesquisaVendaExcecao());
    })
    .catch((erro)=>{
        clearTimeout(modalLoading);
        Swal.close();

        msgError('Erro ao registrar informações, tente novamente!');

        console.log(erro);
    })
}

//=== FIM ROTINA AUTORIZA VENDA FORA DO PRAZO PARA TROCA/EXCECAO ===//

//========== INICIO Rotina - Visualizar XML VENDA ==========//
// Autor: Hendryw Deyvison
// E-mail: hendryw.deyvison@gmail.com
// Data: 27/08/2024

async function buscaXmlVenda(idVenda) {
    try {
        return ajaxGetAllData(`api/venda/venda-xml.xsjs?id=${idVenda}`, 'Carregando Dados da Venda...')
            .then(resp => resp?.data[0] || '')
            .catch((error) => { throw error; })
    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function formataXml(sourceXml) {
    let xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    let xsltDoc = new DOMParser().parseFromString([
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl:template match="para[content-style][not(text())]">',
        '    <xsl:value-of select="normalize-space(.)"/>',
        '  </xsl:template>',
        '  <xsl:template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '  </xsl:template>',
        '  <xsl:output indent="yes"/>',
        '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    let xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);
    let resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    let resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
};

function copyXmlVendaText() {
    $("#xmlText").select();

    document.execCommand("copy");
    
    return msgSuccess("XML copiado com sucesso!");
}

async function abrirXmlVendaEmNovaAba(idVenda) {
    try{
        let { IDVENDA, XML_FORMATADO, XML } = await buscaXmlVenda(idVenda);
        let xmlVenda = XML_FORMATADO;

        if (xmlVenda?.length > 0) {
            xmlVenda = xmlVenda ? new DOMParser().parseFromString(xmlVenda, 'text/xml') : '';

            const serializer = new XMLSerializer();
            const xmlString = serializer.serializeToString(xmlVenda);
            const blob = new Blob([xmlString], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);

            window.open(url, '_blank');
        } else {
            console.error('Nenhum dado XML encontrado.');
        }
    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function downloadXmlVenda(idVenda) {
    try{
        let { IDVENDA, XML_FORMATADO } = await buscaXmlVenda(idVenda);
        let xmlVenda = XML_FORMATADO;
        let nomeArquivo = new DOMParser().parseFromString(xmlVenda, 'text/xml');
        let text = xmlVenda;
        let blob = new Blob([text], { type: 'text/xml' });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        
        nomeArquivo = $(nomeArquivo.getElementsByTagName('infNFe')[0]).attr('Id');
        a.href = url;
        a.download = `${nomeArquivo}.xml`;
        a.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function abreModalXmlVenda(idVenda){
    try{
        let { IDVENDA, XML_FORMATADO } = await buscaXmlVenda(idVenda) || '';
        let xmlVenda = XML_FORMATADO;

        if (xmlVenda?.length) {
            animationLoadingStart();

            let xml = await formataXml([xmlVenda].join('\n'));

            $('#resultadoModalGenerico').html(`
                <div class="container mt-5">
                    <h2>Xml Venda ID: ${IDVENDA}</h2>
                    <div class="form-group">
                        <textarea id="xmlText" class="font-weight-bold w-100" rows="20" readonly>${xml}</textarea>
                        <button class="btn btn-primary" title="Copiar Xml" onclick="copyXmlVendaText()">Copiar</button>
                        <button class="btn btn-info" title="Abrir em uma nova aba" onclick="abrirXmlVendaEmNovaAba('${IDVENDA}')">Nova Aba</button>
                        <button class="btn btn-success" title="Baixar xml da venda" onclick="downloadXmlVenda('${IDVENDA}')">Download</button>
                    </div>
                </div>
            `);

            $('#modalGenerico').modal('show');

            animationLoadingStop();
        } else {
            msgWarning(`XML da venda ID: (${idVenda}) não encontrado!`, 'Entre em contato com o suporte');
        }
    } catch (error) {
        console.log(error);
        msgError();
    }
}

//========== FIM Rotina - Visualizar XML VENDA ==========//
