/*
 * Author: Rodrigo Amorim de Moura
 * Data: 07/02/2018
 * Email: ram.amorim@gmail.com
 */

if(!getCurrentUser()){
    window.location.href = 'index.html';
}
 
var usuario = getCurrentUser().user;
var listaEmpresas = [];


var ipCliente = '';

var IDEmpresaLogin = usuario['IDEMPRESA']; 
var NOEmpresaLogin = usuario['NOFANTASIA'];
var IDFuncionarioLogin = usuario['id'];
var NomeFuncionarioLogin = usuario['NOFUNCIONARIO'];

var textoAGravar = '';
var quantidadePaginas = 0;

//var IDEmpresaLogin = 35;
//var NOEmpresaLogin = '0035 - TO - valparizo 1';
//var NomeFuncionarioLogin = 'DANIEL ALVES DA SILVA';

console.dir(usuario);

var dataRetorno = [];
var contador = 0;
var totalVrProduto = 0;
var totalVrDesconto = 0;
var totalVrNF = 0;
/////////// Pega Data Atual ///////////////////////

var data = new Date();
var dia = data.getDate(); // 1-31
var dia_sem = data.getDay(); // 0-6 (zero=domingo)
var mes = data.getMonth(); // 0-11 (zero=janeiro)
var ano2 = data.getYear(); // 2 dÃ­gitos
var ano4 = data.getFullYear(); // 4 dÃ­gitos
var hora = data.getHours();          // 0-23
var min = data.getMinutes();        // 0-59
var seg = data.getSeconds();        // 0-59

diaFormatado = String(dia);
mesatual = (mes + 1);
tresmesesatras = (mes - 3);
mesFormatado = String(mesatual);

var dataVendaProdutoConsolidado = [];

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

let horaAtualCampo = hora + ':' + min;

let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

var dataPesquisaFormatada = dataAtual;

var valorTotalRecebido = 0;

//VariÃ¡veis totalizadoras do Mapa de pagamento
valorTotalRecebidoMapaVenda = 0;
valorTotalRecebidoMapaCartoes = 0;
valorTotalRecebidoMapaConvenio = 0;
valorTotalRecebidoMapaDinheiro = 0;
valorTotalPagamentoMapaDespesas = 0;
valorTotalDisponivelMapaDinheiro = 0;
valorTotalRecebidoMapaFaturas = 0;
valorTotalDisponivelMapaDinheiroFatura = 0;

///////////////////////////////////////////////////
//variáveis totalizadores Produto estrutura indicadores
vlTotalCustoProduto = 0;
vlTotalBrutoProduto = 0;
vlTotalDescontoProduto = 0;
vlTotalLiquidoProduto = 0;
marckupProduto = 0;
indicadorMarckupProduto = 0;
indicadorVendaProduto = 0;
margemProduto = 0;
curstopercProduto = 0;
margempercProduto = 0;
percDescontoProduto = 0;


//////////////// FunÃ§Ãµes Globais ///////////////////////////////////

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

function mascara_num(obj){
  valida_num(obj)
  if (obj.value.match("-")){
    mod = "-";
  }else{
    mod = "";
  }
  valor = obj.value.replace("-","");
  valor = valor.replace(",","");
  if (valor.length >= 3){
    valor = poe_ponto_num(valor.substring(0,valor.length-2))+","+valor.substring(valor.length-2, valor.length);
  }
  obj.value = mod+valor;
}

function poe_ponto_num(valor){
  valor = valor.replace(/\./g,"");
  if (valor.length > 3){
    valores = "";
    while (valor.length > 3){
      valores = "."+valor.substring(valor.length-3,valor.length)+""+valores;
      valor = valor.substring(0,valor.length-3);
    }
    return valor+""+valores;
  }else{
    return valor;
  }
}

function valida_num(obj){
  numeros = new RegExp("[0-9]");
  while (!obj.value.charAt(obj.value.length-1).match(numeros)){
    if(obj.value.length == 1 && obj.value == "-"){
      return true;
    }
    if(obj.value.length >= 1){
      obj.value = obj.value.substring(0,obj.value.length-1)
    }else{
      return false;
    }
  }
}

function formataDataPesquisa(){
    var dataEn = $("#parametro_dia").val();
    var dataQueb = dataEn.split('-');
    var AnoPesq = dataQueb[0];
    var MesPesq = dataQueb[1];
    var DiaPesq = dataQueb[2];
    dataPesquisaFormatada = DiaPesq +'/'+ MesPesq +'/'+ AnoPesq;
}



function logout() {
    LogoffUser();
	window.location.href = 'index.html';
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
        order: ([1, 'desc']),
        buttons: [{
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

function alerta_atualizado_sucesso() {
    Swal.fire({
        type: "success",
        title: "Dados Atualizado com Sucesso",
        showConfirmButton: false,
        timer: 2000
    });
}

function funcaoMsgErro(mensagem = 'Erro ao Carregar os Dados'){
    Swal.close();

    Swal.fire({
      type: 'error',
      title: `${mensagem}`,
      timer: 15000
    })
}

async function ajaxGetComAnimacaoDeCarregamento(request, mensagem, funcaoRetorno, msg) {

    let barraCarregamento = `<div id="BarraCarregamento" class="progress">
                                <div  class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>
                            </div>`

    Swal.fire({
        html: barraCarregamento,
        type: 'info',
        title: mensagem,
        timer: 250000,
        backdrop: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: async () => {
            Swal.showLoading();

            await ajaxGet(request)
                .then(funcaoRetorno)
                .catch(() => {
                    funcaoMsgErro(msg)
                    clearInterval(animacaoBarra);
                });

        }
    }).then((result) => {
        if (result.dismiss == "timer") {
            Swal.close();

            Swal.fire({
                type: 'error',
                title: "Erro ao carregar os dados, recarregue a página e tente novamente",
                timer: 15000,
            });
            return false;
        }
    })

    let animacaoBarra = setInterval(() => {
        let barra = $($('.pace-progress')[0]).attr('data-progress')
        let barra2 = $($('.pace-progress')[0]).attr('data-progress-text')

        $('#BarraCarregamento').html(`
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="${barra}" aria-valuemin="0" aria-valuemax="100" style="width: ${barra}%">${barra}%</div>
            `)

        if (barra > 98 && barra2 == "100%") {
            Swal.close();
            clearInterval(animacaoBarra);
        }
    }, 700)

}

//////////////// Pão¡gina Inicial //////////////////

$(document).ready(function() {

	$('#parametro_dia').val(dataAtualCampo);
	$('.dataAtual').text(dataAtual);
	$('.liDataAtual').text(dataAtual);
	$('.NoFuncionarioTitulo').text(NomeFuncionarioLogin);
	$('.NoEmpresaTitulo').text(NOEmpresaLogin);

	ajaxGet('api/financeiro/venda-total.xsjs?dataPesquisa=' + dataAtualCampo)
		.then(retornoVendaTotal)
		.catch(funcError);

	ajaxGet('api/financeiro/venda-total-empresa.xsjs?dataPesquisa=' + dataAtualCampo)
		.then(retornoListaVendasEmpresa)
		.catch(funcError);
		
	ajaxGet('api/financeiro/venda-pagamentos.xsjs?dataPesquisa=' + dataAtualCampo)
	.then(retornoListaTransacoesEmpresa)
	.catch(funcError);
	
	ajaxGet('https://api.ipify.org?format=json')
		.then(retornoIp)
		.catch(funcError);
});

function retornoIp(resp){
    ipCliente = resp.ip;
}

function retornoVendaTotal(respostaVenda) {
    
	var totalDespesaAdiantamento = 0;
    
	var totalDinheiro = respostaVenda.data[0].VALORTOTALDINHEIRO;
	var totalCartao = respostaVenda.data[0].VALORTOTALCARTAO;
	var totalConvenio = respostaVenda.data[0].VALORTOTALCONVENIO;
	var totalPos = respostaVenda.data[0].VALORTOTALPOS;
	var totalVoucher = respostaVenda.data[0].VALORTOTALVOUCHER;
	var totalFatura = respostaVenda.data[0].VALORTOTALFATURA;
	var totalDespesa = respostaVenda.data[0].VALORTOTALDESPESA;
	var totalAdiantamentoSalarial = respostaVenda.data[0].VALORTOTALADIANTAMENTOSALARIAL;
	var totalDespesaAdiantamento = parseFloat(totalDespesa) + parseFloat(totalAdiantamentoSalarial);
	var totalRealizado = (parseFloat(totalDinheiro) + parseFloat(totalCartao) + parseFloat(totalConvenio) + parseFloat(totalPos) + parseFloat(totalFatura)) - parseFloat(totalDespesa);

	$('.vrTotalDinheiro').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalDinheiro).toFixed(2))}<small class="m-0 l-h-n">Dinheiro</small></h3>`
	);
	$('.vrTotalCartao').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalCartao).toFixed(2))}<small class="m-0 l-h-n">Cartão</small></h3>`
	);
	$('.vrTotalPos').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalPos).toFixed(2))}<small class="m-0 l-h-n">POS</small></h3>`
	);
	$('.vrTotalFatura').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalFatura).toFixed(2))}<small class="m-0 l-h-n">Fatura</small></h3>`
	);
	$('.vrTotalDespesa').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalDespesaAdiantamento).toFixed(2))}<small class="m-0 l-h-n">Despesas</small></h3>`
	);
	$('.vrTotal').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalRealizado).toFixed(2))}<small class="m-0 l-h-n">Total Realizado</small></h3>`
	);
}

function retornoListaVendasEmpresa(respostaListaVendaEmpresa) {

	var somaTotalFatura = 0;
	var somaTotalCartao = 0;
	var somaTotalDinheiro = 0;
	var somaTotalPos = 0;
	var somaTotalDespesa = 0;
	var somaTotalAdiantamentoSalarial = 0;
	var somaTotalDiponivel = 0;
	var TotalDiponivel = 0;
	var TotalDespAd = 0;
	
	var tableVendasEmpresa = $('#dt-basic-venda-empresa').DataTable();
	tableVendasEmpresa.rows().remove().draw();
	$('.totalVendasEmpresa').html(
		`<tr>
                <th colspan="2" style="text-align: center;">Total</th>
                <th style="font-size: 11px;"> 0,00 </th>
                <th style="font-size: 11px;"> 0,00 </th>
                <th style="font-size: 11px;"> 0,00 </th>
                <th style="font-size: 11px;"> 0,00 </th>
                <th style="font-size: 11px;"> 0,00 </th>
                <th style="font-size: 11px;"> 0,00 </th>
                <th colspan="1"></th>
            </tr>`
	);

	for (var i = 0; i < respostaListaVendaEmpresa.data.length; i++) {

		var idEmpresa = respostaListaVendaEmpresa.data[i]['IDEMPRESA'];
		var dsEmpresa = respostaListaVendaEmpresa.data[i]['NOFANTASIA'];
		var totalDinheiro = respostaListaVendaEmpresa.data[i]['VALORTOTALDINHEIRO'];
		var totalCartao = respostaListaVendaEmpresa.data[i]['VALORTOTALCARTAO'];
		var totalPos = respostaListaVendaEmpresa.data[i]['VALORTOTALPOS'];
		var totalFatura = respostaListaVendaEmpresa.data[i]['VALORTOTALFATURA'];
		var totalDespesa = respostaListaVendaEmpresa.data[i]['VALORTOTALDESPESA'];
		var totalAdiantamentoSalarial = respostaListaVendaEmpresa.data[i]['VALORTOTALADIANTAMENTOSALARIAL'];
		
		TotalDespAd = (parseFloat(totalDespesa)+parseFloat(totalAdiantamentoSalarial));

        TotalDiponivel = (parseFloat(totalDinheiro)+parseFloat(totalFatura)) - (parseFloat(totalDespesa)+parseFloat(totalAdiantamentoSalarial));

		tableVendasEmpresa.row.add([
                `<label style="color: blue; font-size: 11px;">` + dataPesquisaFormatada + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + dsEmpresa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalDinheiro).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalCartao).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalPos).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalFatura).toFixed(2)) + `</label>`,
                `<label style="color: red; font-size: 11px;">` + mascaraValor(parseFloat(TotalDespAd).toFixed(2)) + `</label>`, 
                `<label style="color: blue; font-size: 12px;">` + mascaraValor(parseFloat(TotalDiponivel).toFixed(2)) +
			`</label>`,
                `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Fechamento" id="`
                    + idEmpresa + `" onclick="modal_Fechamento_loja(this.id)" >Detalhar Fechamento</button>
                </div>`,
                
            ]).draw(false);

		somaTotalFatura = parseFloat(somaTotalFatura) + parseFloat(totalFatura);
		somaTotalCartao = parseFloat(somaTotalCartao) + parseFloat(totalCartao);
		somaTotalDinheiro = parseFloat(somaTotalDinheiro) + parseFloat(totalDinheiro);
		somaTotalPos = parseFloat(somaTotalPos) + parseFloat(totalPos);
		somaTotalDespesa = parseFloat(somaTotalDespesa) + parseFloat(totalDespesa) + parseFloat(totalAdiantamentoSalarial);
		//somaTotalAdiantamentoSalarial = somaTotalAdiantamentoSalarial + totalAdiantamentoSalarial;
		somaTotalDiponivel = parseFloat(somaTotalDiponivel) + (parseFloat(totalDinheiro) + parseFloat(totalFatura)) - (parseFloat(totalDespesa) + parseFloat(totalAdiantamentoSalarial));
	}
	$('.totalVendasEmpresa').html(
		`<tr>
                <th colspan="2" style="text-align: center;">Total</th>
                <th style="font-size: 12px;">` +
		mascaraValor(parseFloat(somaTotalDinheiro).toFixed(2)) + `</th>
                <th style="font-size: 12px;">` + mascaraValor(parseFloat(
			somaTotalCartao).toFixed(2)) + `</th>
                <th style="font-size: 12px;">` + mascaraValor(parseFloat(somaTotalPos).toFixed(2)) +
		`</th>
                <th style="font-size: 12px;">` + mascaraValor(parseFloat(somaTotalFatura).toFixed(2)) +
		`</th>
                <th style="color: red; font-size: 12px;">` + mascaraValor(parseFloat(somaTotalDespesa).toFixed(2)) +
		`</th>
                <th style="font-size: 12px;">` + mascaraValor(parseFloat(somaTotalDiponivel).toFixed(2)) +
		`</th>
                <th colspan="1"></th>
            </tr>`
	);

}

function retornoListaTransacoesEmpresa(respostaListaTransacoesEmpresa) {

    var totalCupons = 0;
	var totalValor = 0;
	
	var tableTransacaoesEmpresa = $('#dt-basic-transacoes').DataTable();
	tableTransacaoesEmpresa.rows().remove().draw();
	$('.totalTansacoesEmpresa').html(
	    
	    `<tr>
                <th colspan="4" style="text-align: center;">Total</th>
                <th style="font-size: 11px;">0</th>
                <th style="font-size: 11px;">0,00/th>
        </tr>`
	);

	for (var i = 0; i < respostaListaTransacoesEmpresa.data.length; i++) {

		idEmpresa = respostaListaTransacoesEmpresa.data[i]['IDEMPRESA'];
		dsEmpresa = respostaListaTransacoesEmpresa.data[i]['NOFANTASIA'];
		totalRecebido = respostaListaTransacoesEmpresa.data[i]['VALORRECEBIDO'];
		qtdeCupons = respostaListaTransacoesEmpresa.data[i]['QTDE'];
		dsTipoPagamento = respostaListaTransacoesEmpresa.data[i]['DSTIPOPAGAMENTO'];
		NoAutorizador = respostaListaTransacoesEmpresa.data[i]['NOAUTORIZADOR'];
		
		tableTransacaoesEmpresa.row.add([
                `<label style="color: blue; font-size: 11px;">` + dataPesquisaFormatada + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + dsEmpresa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NoAutorizador + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + dsTipoPagamento + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + qtdeCupons + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalRecebido).toFixed(2)) + `</label>`,
            ]).draw(false);

		totalCupons = parseInt(totalCupons) + parseInt(qtdeCupons);
		totalValor = parseFloat(totalValor) + parseFloat(totalRecebido);
	}
	
	$('.totalTansacoesEmpresa').html(
	    
	    `<tr>
                <th colspan="4" style="text-align: center;">Total</th>
                <th style="font-size: 11px;">` + totalCupons + `</th>
                <th style="font-size: 11px;">` + mascaraValor(parseFloat(totalValor).toFixed(2)) + `</th>
        </tr>`
	);

}

function retornoListaDetalheFechamento(respostaListaDetalheFechamento) {
    
	var somaTotalFatura = 0;
	var somaTotalCartao = 0;
	var somaTotalDinheiro = 0;
	var somaTotalPos = 0;
	var somaTotalDinheiroInformado = 0;
    var somaTotalCartaoInformado = 0;
    var somaTotalPosInformado = 0;
	var somaTotalFaturaInformado = 0;
	var somaTotalQuebra = 0;

	$("#NomeFantasiaData").html(`Fechamento dos Caixas da Loja <span class="fw-300"> <i>`
	    + respostaListaDetalheFechamento.data[0]['NOFANTASIA'] + `</i> - <i> `+dataPesquisaFormatada+` </i></span>`);
	for (var i = 0; i < respostaListaDetalheFechamento.data.length; i++) {

		idEmpresa = respostaListaDetalheFechamento.data[i]['IDEMPRESA'];
		dsEmpresa = respostaListaDetalheFechamento.data[i]['NOFANTASIA'];
		noFuncionario = respostaListaDetalheFechamento.data[i]['NOFUNCIONARIO'];
		idCaixa = respostaListaDetalheFechamento.data[i]['IDCAIXAWEB'];
		dsCaixa = respostaListaDetalheFechamento.data[i]['DSCAIXA'];
		totalDinheiro = respostaListaDetalheFechamento.data[i]['VALORTOTALDINHEIRO'];
		totalCartao = respostaListaDetalheFechamento.data[i]['VALORTOTALCARTAO'];
		totalPos = respostaListaDetalheFechamento.data[i]['VALORTOTALPOS'];
		totalFatura = respostaListaDetalheFechamento.data[i]['VALORTOTALFATURA'];
		
		totalDinheiroInforme = respostaListaDetalheFechamento.data[i]['VALORINFORMADO']['DINHEIRO'];
		totalDinheiroAjuste = respostaListaDetalheFechamento.data[i]['VALORINFORMADO']['DINHEIROAJUSTE'];
		totalCartaoInformado = respostaListaDetalheFechamento.data[i]['VALORINFORMADO']['CARTAO'];
		totalPosInformado = respostaListaDetalheFechamento.data[i]['VALORINFORMADO']['POS'];
		totalFaturaInformado = respostaListaDetalheFechamento.data[i]['VALORINFORMADO']['FATURA'];
		
		if(parseFloat(totalDinheiroAjuste)>0){
		    totalDinheiroInformado = parseFloat(totalDinheiroAjuste);
		}else{
		    totalDinheiroInformado = parseFloat(totalDinheiroInforme);
		}
		
		TotalQuebraCaixa = parseFloat(totalDinheiroInformado) - parseFloat(totalDinheiro);

        if(TotalQuebraCaixa>0){
            tagtotalquebra = '<td style="text-align: right;"><label style="color: blue;"> + ' + mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2)) + '</label></td>';
        }else{
            tagtotalquebra = '<td style="text-align: right;"><label style="color: red;"> - ' + mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2)) + '</label></td>';
        }

		totalDiferencaDinheiro = parseFloat(totalDinheiro) - parseFloat(totalDinheiroInformado);
		totalDiferencaCartao = parseFloat(totalCartao) - parseFloat(totalCartaoInformado);
		totalDiferencaPos = parseFloat(totalPos) - parseFloat(totalPosInformado);
		totalDiferencaFatura = parseFloat(totalFatura) - parseFloat(totalFaturaInformado);
		
        $("#resultadoFechamento").append(`<tr>
                                            <td><label style="color: black; font-size: 11px; ">`+ dsCaixa +`</label></td>
                                            <td><label style="color: black; font-size: 11px; ">`+ noFuncionario +`</label></td>
                                            <td align="right"><label style="color: blue; font-size: 11px; ">`+ mascaraValor(parseFloat(totalDinheiro).toFixed(2)) +`</label></td>
                                            <td align="right"><label style="color: blue; font-size: 11px; ">`+ mascaraValor(parseFloat(totalCartao).toFixed(2)) +`</label></td>
                                            <td align="right"><label style="color: blue; font-size: 11px; ">`+ mascaraValor(parseFloat(totalPos).toFixed(2)) +`</label></td>
                                            <td align="right"><label style="color: blue; font-size: 11px; ">`+ mascaraValor(parseFloat(totalFatura).toFixed(2)) +`</label></td>
                                            <td align="right"><label style="color: green; font-size: 11px; ">`+ mascaraValor(parseFloat(totalDinheiroInformado).toFixed(2)) +`</label></td>
                                            <td align="right"><label style="color: green; font-size: 11px; ">`+ mascaraValor(parseFloat(totalCartaoInformado).toFixed(2)) +`</label></td>
                                            <td align="right"><label style="color: green; font-size: 11px; ">`+ mascaraValor(parseFloat(totalPosInformado).toFixed(2)) +`</label></td>
                                            <td align="right"><label style="color: green; font-size: 11px; ">`+ mascaraValor(parseFloat(totalFaturaInformado).toFixed(2)) +`</label></td>`
                                            +tagtotalquebra+
                                        `</tr>`);
                                        
        somaTotalDinheiro = parseFloat(somaTotalDinheiro) + parseFloat(totalDinheiro);
        somaTotalCartao = parseFloat(somaTotalCartao) + parseFloat(totalCartao);
        somaTotalPos = parseFloat(somaTotalPos) + parseFloat(totalPos);
		somaTotalFatura = parseFloat(somaTotalFatura) + parseFloat(totalFatura);
		
		somaTotalDinheiroInformado = parseFloat(somaTotalDinheiroInformado) + parseFloat(totalDinheiroInformado);
        somaTotalCartaoInformado = parseFloat(somaTotalCartaoInformado) + parseFloat(totalCartaoInformado);
        somaTotalPosInformado = parseFloat(somaTotalPosInformado) + parseFloat(totalPosInformado);
		somaTotalFaturaInformado = parseFloat(somaTotalFaturaInformado) + parseFloat(totalFaturaInformado);
		
		somaTotalQuebra =  parseFloat(somaTotalQuebra) + parseFloat(TotalQuebraCaixa);
		
		if(somaTotalQuebra>0){
            tagSomatotalquebra = '<td style="text-align: right;"><label style="color: blue;"> + ' + mascaraValor(parseFloat(somaTotalQuebra).toFixed(2)) + '</label></td>';
        }else{
            tagSomatotalquebra = '<td style="text-align: right;"><label style="color: red;"> - ' + mascaraValor(parseFloat(somaTotalQuebra).toFixed(2)) + '</label></td>';
        }
	}
	$("#totalresultadoFechamento").html(`<tr>
	                                        <td colspan="2" style="text-align: center;">Total</td>
                                            <td align="right"><label style="color: blue; font-size: 11px; "><b>`+ mascaraValor(parseFloat(somaTotalDinheiro).toFixed(2)) +`<b></label></td>
                                            <td align="right"><label style="color: blue; font-size: 11px; "><b>`+ mascaraValor(parseFloat(somaTotalCartao).toFixed(2)) +`<b></label></td>
                                            <td align="right"><label style="color: blue; font-size: 11px; "><b>`+ mascaraValor(parseFloat(somaTotalPos).toFixed(2)) +`<b></label></td>
                                            <td align="right"><label style="color: blue; font-size: 11px; "><b>`+ mascaraValor(parseFloat(somaTotalFatura).toFixed(2)) +`<b></label></td>
                                            <td align="right"><label style="color: green; font-size: 11px; "><b>`+ mascaraValor(parseFloat(somaTotalDinheiroInformado).toFixed(2)) +`<b></label></td>
                                            <td align="right"><label style="color: green; font-size: 11px; "><b>`+ mascaraValor(parseFloat(somaTotalCartaoInformado).toFixed(2)) +`<b></label></td>
                                            <td align="right"><label style="color: green; font-size: 11px; "><b>`+ mascaraValor(parseFloat(somaTotalPosInformado).toFixed(2)) +`<b></label></td>
                                            <td align="right"><label style="color: green; font-size: 11px; "><b>`+ mascaraValor(parseFloat(somaTotalFaturaInformado).toFixed(2)) +`<b></label></td>`
                                            +tagSomatotalquebra+
                                        `</tr>`);
    
    if( respostaListaDetalheFechamento.data[0]['DEPOSITOS'].length > 0){
       valorDeposito = respostaListaDetalheFechamento.data[0]['DEPOSITOS'][0]['VRDEPOSITO'];
       dsHistorico = respostaListaDetalheFechamento.data[0]['DEPOSITOS'][0]['DSHISTORIO'];
       nrDocumento = respostaListaDetalheFechamento.data[0]['DEPOSITOS'][0]['NUDOCDEPOSITO'];
       $("#ResultadoComDeposito").html(
                                        `<div class="col-sm-6 col-xl-2">
                                            <label>Valor Depositado (R$)</label>
                                        </div>
                                        <div class="col-sm-6 col-xl-2" align="right">
                                            <label class="txt-color-blue"><b> `+ mascaraValor(parseFloat(valorDeposito).toFixed(2)) +`</b></label>
                                        </div>
                                        <div class="col-sm-6 col-xl-2" align="right">
                                            <label>HistÃ³rico:</label>
                                        </div>  
                                        <div class="col-sm-6 col-xl-2" align="right">
                                            <label class="txt-color-blue"><b> `+ dsHistorico +` </b></label>
                                        </div>  
                                        <div class="col-sm-6 col-xl-2" align="right">
                                            <label>Documento:</label>
                                        </div>  
                                        <div class="col-sm-6 col-xl-2" align="right">
                                            <label class="txt-color-blue"><b>`+ nrDocumento +` </b></label> 
                                        </div>` );    
    }else{
        $("#ResultaSemDeposito").html(
                                        `<div class="col-sm-6 col-xl-12">
                                        <center><label class="txt-color-red">DEPÓSITO AINDA NÃO REALIZADO PELA LOJA</label></center>
                                        </div>`);
    }
}

function atualizar_dados() {
    var submeteData = $("#parametro_dia").val();
    formataDataPesquisa();
	ajaxGet('api/financeiro/venda-total.xsjs?dataPesquisa=' + submeteData)
		.then(retornoVendaTotal)
		.catch(funcError);

	ajaxGet('api/financeiro/venda-total-empresa.xsjs?dataPesquisa=' + submeteData)
		.then(retornoListaVendasEmpresa)
		.catch(funcError);
		
	ajaxGet('api/financeiro/venda-pagamentos.xsjs?dataPesquisa=' + submeteData)
	.then(retornoListaTransacoesEmpresa)
	.catch(funcError);

}

function modal_Fechamento_loja(id) {
    var submeteData = $("#parametro_dia").val();

	$.get('financeiro_action_fechamentoloja_modal.html', function(res) {

		$('#resulmodalfechamentoloja').html(res);
		$("#fechamentoLojas").modal('show');
		$('#fechamentoLojas').on('shown.bs.modal', function() {});

		return ajaxGet('api/financeiro/detalhe-fechamento.xsjs?idEmpresa=' + id + '&dataPesquisa=' + submeteData)
			.then(retornoListaDetalheFechamento)
			.catch(funcError);
	})
}

function retornoListaEmpresasSelect(respostaListaEmpresas) { 
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

function funcErrorListaEmpresasSelect(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoListaEmpresas',
		showConfirmButton: false,
		timer: 15000
	});
}

function retornoListaMarcaSelect(respostaListaMarcas) {

	for (var i = 0; i < respostaListaMarcas.data.length; i++) {

		IDMarca = respostaListaMarcas.data[i]['IDGRUPOEMPRESARIAL'];
		DSMarca = respostaListaMarcas.data[i]['DSGRUPOEMPRESARIAL'];

			$('#idmarca').append( 
				`<option value="` + IDMarca + `"> ` + DSMarca + `</option>`
			);
	}
}

function retornoListaParceiroSelect(respostaListaParceiros) {

	for (var i = 0; i < respostaListaParceiros.data.length; i++) {

		IDParceiro = respostaListaParceiros.data[i]['IDPN'];
		DSParceiro = respostaListaParceiros.data[i]['PN'];

			$('#idforn').append( 
				`<option value="` + IDParceiro + `"> ` + IDParceiro + ` - ` + DSParceiro + `</option>`
			);
	}
}

function retornoListaGrupoSelect(respostaListaGrupos) {

	for (var i = 0; i < respostaListaGrupos.data.length; i++) {

		IDGrade = respostaListaGrupos.data[i]['IDGRUPO'];
		DSGrade = respostaListaGrupos.data[i]['GRUPOPRODUTO'];

			$('#idgrupograde').append( 
				`<option value="` + IDGrade + `"> ` + IDGrade + ` - ` + DSGrade + `</option>`
			);
	}
}

function selecionamarca(){
    
    $("#idloja").empty();
    $("#ufprod").val(0);
    idmarca = $('#idmarca').val();
    ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca)
	.then(retornoListaEmpresasSelect)
	.catch(funcError);
}

function selecionamarcavendedor(){
    
    $("#idloja").empty();
    
    idmarca = $('#idmarca').val();

    ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca)
	.then(retornoListaEmpresasSelect)
	.catch(funcError);
}

function selecionauf(){
    
    $("#idloja").empty();
    
    idmarca = $('#idmarca').val();
    ufprod = $('#ufprod').val();

    ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca + '&ufprod=' + ufprod)
	.then(retornoListaEmpresasSelect)
	.catch(funcError);
}

function retornoListaGradeSelect(respostaListaGrade) { 

    $("#idgrade").empty();
    
	for (var i = 0; i < respostaListaGrade.data.length; i++) {

		NoGrade = respostaListaGrade.data[i]['NOMEGRUPO'];

			$('#idgrade').append(
			    `<option value="` + NoGrade + `"> ` + NoGrade + `</option>`
			);
	}
	
}

function selecionagrupo(){
    
    $("#idgrade").empty();
    
    idgrupograde = $('#idgrupograde').val();

    ajaxGet('api/produto-sap/grade.xsjs?idgrupograde=' + idgrupograde)
	.then(retornoListaGradeSelect)
	.catch(funcError);
}

function retornoListaGrupoEmpresasSelect(respostaGrupoEmpresas) {

	for (var i = 0; i < respostaGrupoEmpresas.data.length; i++) {

		IDGrupo = respostaGrupoEmpresas.data[i]['IDGRUPOEMPRESARIAL'];
		DSGrupo = respostaGrupoEmpresas.data[i]['GRUPOEMPRESARIAL'];

			$('#idgrupograde').append(
				`<option value="` + IDGrupo + `"> ` + DSGrupo + `</option>`
			);
	}
}

function retornoListaGrupoEmpresasSelectVendedor(respostaGrupoEmpresas) {

	for (var i = 0; i < respostaGrupoEmpresas.data.length; i++) {

		IDGrupo = respostaGrupoEmpresas.data[i]['IDGRUPOEMPRESARIAL'];
		DSGrupo = respostaGrupoEmpresas.data[i]['GRUPOEMPRESARIAL'];

			$('#idmarca').append(
				`<option value="` + IDGrupo + `"> ` + DSGrupo + `</option>`
			);
	}
}

function funcError(data) {
	Swal.fire({
		type: "error",
		title: "Erro ao carregar os dados da página",
		showConfirmButton: false,
		timer: 15000
	});
}

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
        
        	$("#idloja").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas Digitais - <span class='fw-300'></span>`);
			
        	ajaxGet('api/informatica/empresa.xsjs')
        		.then(retornoListaEmpresasSelect)
        		.catch(funcError);
      }
    };
    xmlhttp.open("GET", "financeiro_action_listrecebimentosloja.html", true);
    xmlhttp.send();
}

function pesqRecebimentos(numPage){
    var IDEmpresaPesqVenda = $("#idloja").val();
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
      
        ajaxGet('api/financeiro/venda-total-recebido-periodo.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaRecebimentos)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqrecebimentosloja.html", true);
    xmlhttp.send();
}

function retornoListaRecebimentos(respostaListaRecebimentos) {
    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var numPageAtual = parseInt(respostaListaRecebimentos.page);
   
    if(respostaListaRecebimentos.data.length != 0){
    	for (var i = 0; i < respostaListaRecebimentos.data.length; i++) {
    	    
    	    valorTotalDinheiro = respostaListaRecebimentos.data[i]['VALORTOTALDINHEIRO'];
            valorTotalCartao = respostaListaRecebimentos.data[i]['VALORTOTALCARTAO'];
            valorTotalConvenio = respostaListaRecebimentos.data[i]['VALORTOTALCONVENIO'];
            valorTotalPos = respostaListaRecebimentos.data[i]['VALORTOTALPOS'];
            valorTotalVoucher = respostaListaRecebimentos.data[i]['VALORTOTALVOUCHER'];
            valorTotalRecebido = parseFloat(valorTotalDinheiro) + parseFloat(valorTotalCartao) + parseFloat(valorTotalConvenio) + parseFloat(valorTotalPos) + parseFloat(valorTotalVoucher);
            
            PercDinheiro = ((valorTotalDinheiro * 100) / valorTotalRecebido);
            PercCartao = ((valorTotalCartao * 100) / valorTotalRecebido);
            PercConvenio = ((valorTotalConvenio * 100) / valorTotalRecebido);
            PercPOS = ((valorTotalPos * 100) / valorTotalRecebido);
            PercVoucher = ((valorTotalVoucher * 100) / valorTotalRecebido);
            
            if(valorTotalDinheiro > 0){
                $("#resultadoRecebimento").append(
                        `<tr>
                            <td><b>Dinheiro</b></td>
                            <td style="text-align:right; font-size: 12px;"><b>`+ mascaraValor(parseFloat(valorTotalDinheiro).toFixed(2))+`</b></td>
                            <td style="text-align:right; font-size: 12px;">`+mascaraValor(parseFloat(PercDinheiro).toFixed(2))+`</td>
                        </tr>`
                    );
            }
            
            if(valorTotalCartao > 0){
                $("#resultadoRecebimento").append(
                        `<tr>
                            <td><b>Cartão TEF</b></td>
                            <td style="text-align:right; font-size: 12px;"><b>`+ mascaraValor(parseFloat(valorTotalCartao).toFixed(2))+`</b></td>
                            <td style="text-align:right; font-size: 12px;">`+mascaraValor(parseFloat(PercCartao).toFixed(2))+`</td>
                        </tr>`
                    );
            }
            
            if(valorTotalConvenio > 0){
                $("#resultadoRecebimento").append(
                    `<tr>
                        <td><b>Convênio</b></td>
                        <td style="text-align:right; font-size: 12px;"><b>`+ mascaraValor(parseFloat(valorTotalConvenio).toFixed(2))+`</b></td>
                        <td style="text-align:right; font-size: 12px;">`+ mascaraValor(parseFloat(PercConvenio).toFixed(2))+`</td>
                    </tr>`
                );
            }
            
            if(valorTotalVoucher > 0){
                $("#resultadoRecebimento").append(
                    `<tr>
                        <td><b>Voucher</b></td>
                        <td style="text-align:right; font-size: 12px;"><b>`+ mascaraValor(parseFloat(valorTotalVoucher).toFixed(2))+`</b></td>
                        <td style="text-align:right; font-size: 12px;">`+ mascaraValor(parseFloat(PercVoucher).toFixed(2))+`</td>
                    </tr>`
                );
            }
            
            if(valorTotalPos > 0){
                $("#resultadoRecebimento").append(
                    `<tr>
                        <td><b>POS</b></td>
                        <td style="text-align:right; font-size: 12px;"><b>`+ mascaraValor(parseFloat(valorTotalPos).toFixed(2))+`</b></td>
                        <td style="text-align:right; font-size: 12px;">`+ mascaraValor(parseFloat(PercPOS).toFixed(2))+`</td>
                    </tr>`
                );
            }
        }
        ajaxGet('api/financeiro/venda-recebido-eletronico.xsjs?pageSize=500&page=1&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaRecebimentosEletronico)
        	.catch(funcError);
    }
}

function retornoListaRecebimentosEletronico(respostaListaRecebimentosEletronico) {
    
    var numPageAtual = parseInt(respostaListaRecebimentosEletronico.page);
   
    if(respostaListaRecebimentosEletronico.data.length != 0){
    	for (var i = 0; i < respostaListaRecebimentosEletronico.data.length; i++) {
    	    
    	    idEmpresa = respostaListaRecebimentosEletronico.data[i]['IDEMPRESA'];
            nomeFantasia = respostaListaRecebimentosEletronico.data[i]['NOFANTASIA'];
            nomeTef = respostaListaRecebimentosEletronico.data[i]['NOTEF'];
            nomeAutorizador = respostaListaRecebimentosEletronico.data[i]['NOAUTORIZADOR'];
            numeroParcelas = respostaListaRecebimentosEletronico.data[i]['NPARCELAS'];
            dsTipoPagamento = respostaListaRecebimentosEletronico.data[i]['DSTIPOPAGAMENTO'];
            quantidadeVenda = respostaListaRecebimentosEletronico.data[i]['QTDE'];
            valorRecebido = respostaListaRecebimentosEletronico.data[i]['VALORRECEBIDO'];
            quantidadePagamentos = respostaListaRecebimentosEletronico.data[i]['QTDPGTOS'];
            PercVrRecebido = ((valorRecebido * 100) / valorTotalRecebido);
            
                $("#resultadoRecebimentoListaTef").append(
                        `<tr>
                            <td style="font-size: 12px;"> -> `+ nomeTef +`</td>
                            <td style="font-size: 12px;">`+dsTipoPagamento+` x `+numeroParcelas+`</td>
                            <td style="text-align:right; font-size: 12px;">`+ mascaraValor(parseFloat(valorRecebido).toFixed(2))+`</td>
                            <td style="text-align:center; font-size: 12px;">`+quantidadePagamentos+`</td>
                            <td style="text-align:right; font-size: 12px;">`+ mascaraValor(parseFloat(PercVrRecebido).toFixed(2))+`</td>
                            <td style="text-align: center;">
                                <div class="btn-group btn-group-xs">
                                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Vendas" id="`+nomeAutorizador+`-`+dsTipoPagamento+`-`+numeroParcelas+`" onclick="limpar_modal_recebimento();modal_venda_recebimento(this.id,'`+nomeAutorizador+`','`+numeroParcelas+`','`+nomeTef+`')" >Detalhar</button>
                                    
                                </div>
                            </td>
                        </tr>`
                    );
            
        }
   
    }

}

function limpar_modal_recebimento(){
    $('#tituloRelacaoVendasRecebimentoEletronico').html('');
    $('#resulmodalvendarecebimentoloja').html('');
    $('#resultadoVendaRecebimentoEletronico').html('');
    htmlResultado = '';
}

function modal_venda_recebimento(id, nomeAutorizador, numeroParcelas, nomeTef) {

    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
    $.get('financeiro_action_vendarecebimentomodal.html', function(res) {
       
         $('#resulmodalvendarecebimentoloja').html(res);
         $("#vendaRecebimentoLojas").modal('show');
         $('#vendaRecebimentoLojas').on('shown.bs.modal', function () {
             
            $('#tituloRelacaoVendasRecebimentoEletronico').html(`Relação das Vendas do Recebimento Tipo <span class="fw-300"> <i>`+id+` x</i></span>`)    
         	if(numeroParcelas === '0'){
         	    numeroParcelas = '';
     	}
     	
        });
    });
    
         	return ajaxGet('api/financeiro/venda-detalhe-recebimento-eletronico.xsjs?idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio +'&dataPesquisaFim=' + datapesqfim +'&nomeTef=' + nomeTef +'&nomeAutorizador=' + nomeAutorizador +'&numeroParcelas=' + numeroParcelas)
    		.then(retornoListaDetalheRecebimentoEletronico)
    		.catch(funcError);
    
}

function retornoListaDetalheRecebimentoEletronico(RespostaListaDetalheRecebimentoEletronico){
    htmlResultado = '';
    $('#resultadoVendaRecebimentoEletronico').html(htmlResultado);
    
    for(var i=0; i<RespostaListaDetalheRecebimentoEletronico.data.length; i++){
       dsTipoPagamento = RespostaListaDetalheRecebimentoEletronico.data[i]['DSTIPOPAGAMENTO'];
       noCartao = RespostaListaDetalheRecebimentoEletronico.data[i]['NOCARTAO'];
       nuOperacao = RespostaListaDetalheRecebimentoEletronico.data[i]['NUOPERACAO'];
       noTef = RespostaListaDetalheRecebimentoEletronico.data[i]['NOTEF'];
       nsuTef = RespostaListaDetalheRecebimentoEletronico.data[i]['NSUTEF'];
       noAutorizador = RespostaListaDetalheRecebimentoEletronico.data[i]['NOAUTORIZADOR'];
       nuAutorizacao = RespostaListaDetalheRecebimentoEletronico.data[i]['NUAUTORIZACAO'];
       nsuAutorizadora = RespostaListaDetalheRecebimentoEletronico.data[i]['NSUAUTORIZADORA'];
       dtVenda = RespostaListaDetalheRecebimentoEletronico.data[i]['DTHORAFECHAMENTO'];
       numeroParcelas = RespostaListaDetalheRecebimentoEletronico.data[i]['NPARCELAS'];
       valorRecebido = RespostaListaDetalheRecebimentoEletronico.data[i]['VALORRECEBIDO'];
       numeroVenda = RespostaListaDetalheRecebimentoEletronico.data[i]['IDVENDA'];
        
        htmlResultado = htmlResultado +`
            <tr>
                <td>`+numeroVenda+`</td>
                <td>`+dsTipoPagamento+`</td>
                <td>`+nuOperacao+`</td>
                <td style="text-align:center; font-size: 12px;">`+noTef+`</td>
                <td>`+nsuTef+`</td>
                <td>`+nsuAutorizadora+`</td>
                <td style="text-align:center; font-size: 12px;">`+nuAutorizacao+`</td>
                <td style="text-align:right; font-size: 12px;">`+ mascaraValor(parseFloat(valorRecebido).toFixed(2))+`</td>
                <td style="text-align:center; font-size: 12px;">`+numeroParcelas+`</td>
                <td>`+dtVenda+`</td>
            </tr>`;
    }
    $('#resultadoVendaRecebimentoEletronico').append(htmlResultado);
}

//================ MENU LISTA VENDA MARCA E ESTRUTURA =====================================================

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
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);
      }
    };
    xmlhttp.open("GET", "contabilidade_action_listvendasmarca.html", true);
    xmlhttp.send();
}

function pesq_vendas_marcas(numPage){
    
    dataRetornoMarca=[];
    totalVrProdutoVest = 0;
    totalQTDProdutoVest = 0;
    totalVrProdutoCalc = 0;
    totalQTDProdutoCalc = 0;
    totalVrProdutoAcess = 0;
    totalQTDProdutoAcess = 0;
    totalVrDescVest=0;
    totalVrDescCalc=0;
    qtdProdutoVest = 0;
    vrProdutoVest = 0;
    vrProdutoVestDesc = 0;
    qtdProdutoCalc = 0;
    vrProdutoCalc = 0;
    vrProdutoCalcDesc = 0;
    qtdProdutoAcess = 0;
    vrProdutoAcess = 0;
    contador = 0;
    
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
        //newDataTable();
        
        $('.dataAtual').text(dataAtual);

        ajaxGet('api/comercial/venda-marca-periodo.xsjs?page='+numPage+'&idMarca=' + IDMarcaPesqVenda + '&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim)
        	.then(retornoListaVendasMarca)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "contabilidade_action_pesqvendasmarca.html", true);
    xmlhttp.send();
} 

function chamarProximaListaMarca(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
        ajaxGet('api/comercial/venda-marca-periodo.xsjs?page='+numPage+'&idMarca=' + IDMarcaPesqVenda + '&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim)
        	.then(retornoListaVendasMarca)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasMarca(respostaListaVendasMarca) {
                    
    var numPageAtual = parseInt(respostaListaVendasMarca.page);
    if(respostaListaVendasMarca.data.length != 0){
        for (var i=0; i < respostaListaVendasMarca.data.length; i++) {  
            contador ++;
            var registro = respostaListaVendasMarca.data[i];
            
            NoEmpresa = registro.NOFANTASIA;
            qtdProduto = registro.QTD;
            vrProduto = registro.VALORPROD;
            vrProdutoDesconto = registro.VALORDESCONTO;
            vrNF = registro.VALORNF;
            IdGrupo = registro.IDGRUPO;
            
            totalQTDProduto = parseFloat(totalQTDProduto) + parseFloat(qtdProduto);
            totalVrProduto = parseFloat(totalVrProduto) + parseFloat(vrProduto);
            
            if(IdGrupo == '001'){
                qtdProdutoVest = parseFloat(qtdProdutoVest) + parseFloat(qtdProduto);
                vrProdutoVest = parseFloat(vrProdutoVest) + parseFloat(vrProduto);
                vrProdutoVestDesc = parseFloat(vrProdutoVestDesc) + parseFloat(vrProdutoDesconto);
                totalQTDProdutoVest = parseFloat(totalQTDProdutoVest) + parseFloat(qtdProdutoVest);
                totalVrProdutoVest = parseFloat(totalVrProdutoVest) + parseFloat(vrProdutoVest);
                totalVrDescVest = parseFloat(totalVrDescVest) + parseFloat(vrProdutoVestDesc);
                
                qtdProdutoCalc = 0;
                vrProdutoCalc = 0;
                vrProdutoCalcDesc = 0;
                //totalQTDProdutoCalc = 0;
                //totalVrProdutoCalc = 0;
            } 
            if(IdGrupo == '003'){
                qtdProdutoCalc = parseFloat(qtdProdutoCalc) + parseFloat(qtdProduto);
                vrProdutoCalc = parseFloat(vrProdutoCalc) + parseFloat(vrProduto);
                vrProdutoCalcDesc = parseFloat(vrProdutoCalcDesc) + parseFloat(vrProdutoDesconto);
                totalQTDProdutoCalc = parseFloat(totalQTDProdutoCalc) + parseFloat(qtdProdutoCalc);
                totalVrProdutoCalc = parseFloat(totalVrProdutoCalc) + parseFloat(vrProdutoCalc);
                totalVrDescCalc = parseFloat(totalVrDescCalc) + parseFloat(vrProdutoCalcDesc);
                
                qtdProdutoVest = 0;
                vrProdutoVest = 0;
                vrProdutoVestDesc = 0;
                //totalQTDProdutoVest = 0;
                //totalVrProdutoVest = 0;
            }
            
            //totalVrDisponivel = parseFloat(totalVrDisponivel) + parseFloat(vrDisponivel);
            //totalQtdVenda = parseFloat(totalQtdVenda) + parseFloat(qtdVendas);
            
            //VrTicketM = (parseFloat(vrDisponivel)/parseFloat(qtdVendas));
            //TotalTicketM = (parseFloat(totalVrDisponivel)/parseFloat(totalQtdVenda)); 
            
              dataRetornoMarca.push( [contador,
                                NoEmpresa,
                                qtdProduto,
                                vrProduto,
                                qtdProdutoVest,
                                vrProdutoVest.toFixed(2),
                                vrProdutoVestDesc.toFixed(2),
                                qtdProdutoCalc,
                                vrProdutoCalc.toFixed(2),
                                vrProdutoCalcDesc.toFixed(2)
                                ]);
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaMarca(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-marca" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Empresa</th>
                        <th>Qtd Total Prod</th>
                        <th>Vr Total</th>
                        <th>Qtd Vestuário</th>
                        <th>Vr Vestuário</th>
                        <th>Vr Vest. Desc.</th>
                        <th>Qtd Calçados</th>
                        <th>Vr Calçados</th>
                        <th>Vr Calç. Desc.</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarca">
                </tbody>
                <tfoot id="totalResultadoVendaMarca"class="thead-themed">
                </tfoot>
            </table>`
        );
	   
	    $('#totalResultadoVendaMarca').html(
    		`<tr>
                <th colspan="2" style="text-align: center;">Total</th>
                <th style="text-align: right;">` + (parseFloat(totalQTDProduto)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrProduto).toFixed(2)) + `</th>
                <th style="text-align: right;">` + (parseFloat(totalQTDProdutoVest)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrProdutoVest).toFixed(2)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrDescVest).toFixed(2)) + `</th>
                <th style="text-align: right;">` + (parseFloat(totalQTDProdutoCalc)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrProdutoCalc).toFixed(2)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrDescCalc).toFixed(2)) + `</th>
            </tr>`
    	);
         
        $('#dt-basic-venda-marca').DataTable( {
            data: dataRetornoMarca,
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

}

//================ MENU LISTA VENDA PERIODO =====================================================

function ListaVendasPeriodo(){
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
        	$("#idgrupograde").select2();
        	$("#idgrade").select2();
        	$("#idforn").select2(); 
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas das Marcas - <span class='fw-300'></span>`);
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);
        		
        	ajaxGet('api/produto-sap/parceiro-negocio.xsjs')
        		.then(retornoListaParceiroSelect)
        		.catch(funcError);
        		
        	ajaxGet('api/produto-sap/grupo.xsjs')
        		.then(retornoListaGrupoSelect)
        		.catch(funcError);
      }
    };
    xmlhttp.open("GET", "contabilidade_action_listvendasperiodo.html", true);
    xmlhttp.send();
}

//////////// POR LOJA////////////////////////////////////////////////////////////////////
function pesq_vendas_periodo(numPage){
    
    dataRetornoLoja=[];
    totalVrProduto = 0;
    totalVrDesconto = 0;
    totalVrNF = 0;
    totalQTDProduto = 0;
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
 
   	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
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
        //newDataTable();
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/contabilidade/venda-produto.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaVendasPeriodo)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "contabilidade_action_pesqvendasperiodo.html", true);
    xmlhttp.send();
} 

function chamarProximaListaPeriodoMarca(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/contabilidade/venda-produto.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaVendasPeriodo)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasPeriodo(respostaListaVendasPeriodoMarca) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoMarca.page);
    if(respostaListaVendasPeriodoMarca.data.length != 0){
        for (var i=0; i < respostaListaVendasPeriodoMarca.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasPeriodoMarca.data[i];
            
            NoEmpresa = registro.NOFANTASIA;
            dtEmissao = registro.DATAEMISSAO;
            vrProduto = registro.VALORPROD;
            qtdProduto = registro.QTD;
            vrDesconto = registro.VALORDESCONTO;
            vrNF = registro.VALORNF;
            
            totalQTDProduto = parseFloat(totalQTDProduto) + parseFloat(qtdProduto);
            totalVrProduto = parseFloat(totalVrProduto) + parseFloat(vrProduto);
            totalVrDesconto = parseFloat(totalVrDesconto) + parseFloat(vrDesconto);
            totalVrNF = parseFloat(totalVrNF) + parseFloat(vrNF);
            
              dataRetornoLoja.push( [contador,
                                NoEmpresa,
                                dtEmissao,
                                qtdProduto,
                                vrProduto,
                                vrDesconto,
                                vrNF]);
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaPeriodoMarca(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-periodo" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Empresa</th>
                        <th>Data</th>
                        <th>QTD</th>
                        <th>Vr Total</th>
                        <th>Desc</th>
                        <th>Vr NF</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaPeriodo">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaPeriodo"class="thead-themed">
                </tfoot>
            </table>`
        );
	   
	    $('#totalResultadoVendaMarcaPeriodo').html(
    		`<tr>
                <th colspan="3" style="text-align: center;">Total</th>
                <th style="text-align: right;">` + (parseFloat(totalQTDProduto)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrProduto).toFixed(2)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrDesconto).toFixed(2)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrNF).toFixed(2)) + `</th>
            </tr>`
    	);
         
        $('#dt-basic-venda-periodo').DataTable( {
            data: dataRetornoLoja,
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

}

//////////// POR PRODUTO/////////////////////////////////////////////////////////////////

function pesq_vendas_periodo_consolidada(numPage){
    dataRetorno=[];
    totalVrProduto = 0;
    totalVrDesconto = 0;
    totalVrNF = 0;
    totalQTDProduto = 0;
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
    var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/contabilidade/venda-produto-consolidado.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaVendasPeriodoConsolidado)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "contabilidade_action_pesqvendasmarcaconsolidado.html", true);
    xmlhttp.send();
} 

function chamarProximaListaPeriodoConsolidado(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/contabilidade/venda-produto-consolidado.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaVendasPeriodoConsolidado)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasPeriodoConsolidado(respostaListaVendasPeriodoConsolidado) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoConsolidado.page);
    if(respostaListaVendasPeriodoConsolidado.data.length != 0){
        for (var i=0; i < respostaListaVendasPeriodoConsolidado.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasPeriodoConsolidado.data[i];
            
            dtEmissao = registro.DATAEMISSAO;
            vrUnitProduto = registro.VALORUNITPROD; 
            vrProduto = registro.VALORPROD;
            qtdProduto = registro.QTD;
            vrDesconto = registro.VALORDESCONTO;
            vrNF = registro.VALORNF;
            codProd = registro.CODPRODUTO;
            dsProduto = registro.DESCRICAO;
            nNCM = registro.NCM;
            
            totalQTDProduto = parseFloat(totalQTDProduto) + parseFloat(qtdProduto);
            totalVrProduto = parseFloat(totalVrProduto) + parseFloat(vrProduto);
            totalVrDesconto = parseFloat(totalVrDesconto) + parseFloat(vrDesconto);
            totalVrNF = parseFloat(totalVrNF) + parseFloat(vrNF);
            
              dataRetorno.push( [contador,
                                dtEmissao,
                                vrUnitProduto,
                                qtdProduto,
                                vrProduto,
                                vrDesconto,
                                vrNF,
                                codProd,
                                dsProduto,
                                nNCM]);
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaPeriodoConsolidado(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-consolidada" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Data</th>
                        <th>Vr UN</th>
                        <th>QTD</th>
                        <th>Vr Total</th>
                        <th>Desc</th>
                        <th>Vr NF</th>
                        <th>Cód. Produto</th>
                        <th width="15%">Produto</th>
                        <th>NCM</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaPeriodoConsolidado">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaPeriodoConsolidado"class="thead-themed">
                </tfoot>
            </table>`
        );
	   
	    $('#totalResultadoVendaMarcaPeriodoConsolidado').html(
    		`<tr>
                <th colspan="3" style="text-align: center;">Total</th>
                <th style="text-align: right;">` + (parseFloat(totalQTDProduto)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrProduto).toFixed(2)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrDesconto).toFixed(2)) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrNF).toFixed(2)) + `</th>
                <th colspan="3" style="text-align: center;"></th>
            </tr>`
    	);
         
        $('#dt-basic-venda-consolidada').DataTable( {
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

}

//////////// POR SALDO///////////////////////////////////////////////////////////////////

function pesq_vendas_saldo(numPage){
    
    dataRetornoSaldo=[];
    totalQTDVenda = 0;
    totalQTDAtual = 0;
    totalQTDData = 0;
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val(); 
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
  	var IDGrade = [];
    $('#idgrade option:selected').each(function (index, el) {
        IDGrade.push($(el).val());
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/venda/movimentacao-saldo.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaVendasSaldo)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "contabilidade_action_pesqvendassaldo.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendasSaldo(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/venda/movimentacao-saldo.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaVendasSaldo)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" + 
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasSaldo(respostaListaVendasSaldo) {
                    
    var numPageAtual = parseInt(respostaListaVendasSaldo.page);
    if(respostaListaVendasSaldo.data.length != 0){
        for (var i=0; i < respostaListaVendasSaldo.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasSaldo.data[i];
           
            codProd = registro.NUCODBARRAS; 
            dsProduto = registro.DSNOME;
            GrupoProd = registro.GRUPOPRODUTO;
            NomeGrupo = registro.NOMEGRUPO;
            dsForn = registro.PN;
            dsEmpresa = registro.NOFANTASIA;
            QtdSaidaVenda = registro.QTDSAIDAVENDA;
            QtdSaldo = registro.QTDSALDO;
            QtdSaldoData = registro.QTDSALDODATA;
            
            totalQTDVenda = parseFloat(totalQTDVenda) + parseFloat(QtdSaidaVenda);
            totalQTDAtual = parseFloat(totalQTDAtual) + parseFloat(QtdSaldo);
            totalQTDData = parseFloat(totalQTDData) + parseFloat(QtdSaldoData);
              dataRetornoSaldo.push( [contador,
                                dsEmpresa,
                                dsForn,
                                GrupoProd,
                                NomeGrupo,
                                codProd,
                                dsProduto,
                                QtdSaidaVenda,
                                QtdSaldo,
                                QtdSaldoData]);
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaVendasSaldo(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-saldo" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Empresa</th>
                        <th>Fornecedor</th>
                        <th>Grupo</th>
                        <th>Grade</th>
                        <th>Cod. Prod</th>
                        <th width="15%">Produto</th>
                        <th>QTD Venda</th>
                        <th>Estoque Atual</th>
                        <th>Estoque Por Data</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaSaldo">
                </tbody>
                <tfoot id="totalResultadoVendaSaldo"class="thead-themed">
                </tfoot>
            </table>`
        );
	   
	    $('#totalResultadoVendaSaldo').html(
    		`<tr>
                <th colspan="7" style="text-align: center;">Total</th>
                <th style="text-align: right;">` + (parseFloat(totalQTDVenda)) + `</th>
                <th style="text-align: right;">` + (parseFloat(totalQTDAtual)) + `</th>
                <th style="text-align: right;">` + (parseFloat(totalQTDData)) + `</th>
            </tr>`
    	);
         
        $('#dt-basic-venda-saldo').DataTable( {
            data: dataRetornoSaldo,
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
                .catch(funcError);
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
        	.catch(funcError);
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
        	.catch(funcError);
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
                        .then(retornoListaGrupoEmpresasSelectVendedor)
                        .catch(funcError);

      }
    };
    xmlhttp.open("GET", "administrativo_action_listvendasvendedor.html", true);
    xmlhttp.send();
}

function retornoListaVendasVendedorData(retornoListaVendasVendedor) {

	var QTDProduto = 0;
	var VrVendido = 0;
	var VrVoucher = 0;
	var TotalVendaVendedor = 0;
	var TotalVoucherVendedor = 0;
	var VrVendidoVendedor = 0;
	var TotalLiqVendidoVendedor = 0;
	var ContadorVendedor = 0;
    
    $('#resultadoListVendedor').html('');
    
	for (var i = 0; i < retornoListaVendasVendedor.data.length; i++) {

        ContadorVendedor ++;
		NumMatricula = retornoListaVendasVendedor.data[i]['vendedor']['VENDEDOR_MATRICULA'];
		NomeVendedor = retornoListaVendasVendedor.data[i]['vendedor']['VENDEDOR_NOME'];
		NomeEmpresa = retornoListaVendasVendedor.data[i]['vendedor']['NOFANTASIA'];

		QTDProduto = parseFloat(retornoListaVendasVendedor.data[i]['totalVendido'][0]['QTDVENDIDOVENDEDOR']);
		VrVendido = parseFloat(retornoListaVendasVendedor.data[i]['totalVendido'][0]['TOTALVENDIDOVENDEDOR']);
		
		VrVoucher = parseFloat(retornoListaVendasVendedor.data[i]['Vouchers']);
		
        TotalVendaVendedor = TotalVendaVendedor + VrVendido;
        TotalVoucherVendedor = TotalVoucherVendedor + VrVoucher;
        
        VrVendidoVendedor = VrVendido - VrVoucher;
        
        TotalLiqVendidoVendedor = TotalVendaVendedor - TotalVoucherVendedor;
		
		$('#resultadoListVendedor').append(
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
		);
		
		$('.totalVendedores').html(
			`<tr>
                <th colspan="5" style="text-align: center;">Total Vendas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVoucherVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalLiqVendidoVendedor.toFixed(2))}</th>
            </tr>`
		);

	}
}

function pesq_vendas_vendedor(numPage){
    
    dataRetornoVendedor=[];
	QTDProduto = 0;
	VrVendido = 0;
	VrVoucher = 0;
	TotalVendaVendedor = 0;
	TotalQTDVendedor = 0;
	TotalVoucherVendedor = 0; 0;
	VrVendidoVendedor = 0;
	TotalLiqVendidoVendedor = 0;
    contador = 0;
    
    var idgrupo = $("#idmarca").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });

    if (idgrupo == 0 && idempresa == 0) {
  
        alert("Atenção! É preciso selecionar a Marca ou a Empresa.");
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
      
        ajaxGet('api/comercial/venda-vendedor.xsjs?page='+numPage+'&idGrupo=' + idgrupo +'&idEmpresa=' + idempresa + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasVendedor)
        	.catch(funcErrorListaVendasVendedor);
      }
    };
    
    xmlhttp.open("GET", "administrativo_action_pesqvendasvendedor.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendaVendedor(numPage){ 
    
    var idgrupo = $("#idmarca").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });
    
        ajaxGet('api/comercial/venda-vendedor.xsjs?page='+numPage+'&idGrupo=' + idgrupo+'&idEmpresa=' + idempresa + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasVendedor)
        	.catch(funcErrorListaVendasVendedor);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasVendedor(respostaListaVendaVendedor) {

    var numPageAtual = parseInt(respostaListaVendaVendedor.page);
    if(respostaListaVendaVendedor.data.length != 0){
        for (var i=0; i < respostaListaVendaVendedor.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendaVendedor.data[i];
            
            NomeEmpresa = registro.vendedor.NOFANTASIA;
            NumMatricula = registro.vendedor.VENDEDOR_MATRICULA;
            NomeVendedor = registro.vendedor.VENDEDOR_NOME; 
            QTDProduto = registro.totalVendido[0].QTDVENDIDOVENDEDOR;
            VrVendido = parseFloat(registro.totalVendido[0].TOTALVENDIDOVENDEDOR);
            VrVoucher = parseFloat(registro.Vouchers);
            
            TotalQTDVendedor = parseFloat(TotalQTDVendedor) + parseFloat(QTDProduto);
            TotalVendaVendedor = parseFloat(TotalVendaVendedor) + parseFloat(VrVendido);
            TotalVoucherVendedor = parseFloat(TotalVoucherVendedor) + parseFloat(VrVoucher);
            
            VrVendidoVendedor = parseFloat(VrVendido) - parseFloat(VrVoucher);
            
            TotalLiqVendidoVendedor = parseFloat(TotalVendaVendedor) - parseFloat(TotalVoucherVendedor);
            
              dataRetornoVendedor.push( [contador, 
                                NomeEmpresa,
                                NumMatricula,
                                NomeVendedor,
                                QTDProduto,
                                VrVendido.toFixed(2),
                                VrVoucher.toFixed(2),
                                VrVendidoVendedor.toFixed(2)]);
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaVendaVendedor(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-vendedor" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Empresa</th>
                        <th>Matrícula</th>
                        <th>Nome</th>
                        <th>Qtd Produto</th>
                        <th>Valor Vendido</th>
                        <th>Voucher Recebido</th>
                        <th>Valor Liquido</th>
                    </tr>
                </thead>
                <tbody id="resultadoListVendedor">
                </tbody>
                <tfoot id="totalVendedores"class="thead-themed">
                </tfoot>
            </table>`
        );
	   
	    $('#totalVendedores').html(
			`<tr>
                <th colspan="5" style="text-align: center;">Total Vendas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVoucherVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalLiqVendidoVendedor.toFixed(2))}</th>
            </tr>`
    	);
         
        $('#dt-basic-venda-vendedor').DataTable( {
            data: dataRetornoVendedor,
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
}


//================ MENU LISTA ROTATIVIDADE =====================================================

function ListaRotatividade(){
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
        	$("#idgrupograde").select2();
        	$("#idgrade").select2();
        	$("#idforn").select2(); 
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas das Marcas - <span class='fw-300'></span>`);
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);
        		
        	ajaxGet('api/produto-sap/parceiro-negocio.xsjs')
        		.then(retornoListaParceiroSelect)
        		.catch(funcError);
        		
        	ajaxGet('api/produto-sap/grupo.xsjs')
        		.then(retornoListaGrupoSelect)
        		.catch(funcError);
      }
    };
    xmlhttp.open("GET", "contabilidade_action_listrotatividade.html", true);
    xmlhttp.send();
}

function pesq_vendas_rotatividade(numPage){
    
    dataRetorno=[];
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val(); 
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
  	var IDGrade = [];
    $('#idgrade option:selected').each(function (index, el) {
        IDGrade.push($(el).val());
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/venda/rotatividade.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaRotatividade)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "contabilidade_action_pesqrotatividade.html", true);
    xmlhttp.send();
} 

function chamarProximaListaRotatividade(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/venda/rotatividade.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaRotatividade)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" + 
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaRotatividade(respostaListaRotatividade) {
                    
    var numPageAtual = parseInt(respostaListaRotatividade.page);
    if(respostaListaRotatividade.data.length != 0){
        for (var i=0; i < respostaListaRotatividade.data.length; i++) { 
            contador ++;
            var registro = respostaListaRotatividade.data[i];
            
            codProd = registro.NUCODBARRAS; 
            dsProduto = registro.DSNOME;
            GrupoProd = registro.GRUPOPRODUTO;
            NomeGrupo = registro.NOMEGRUPO;
            dsForn = registro.PN;
            dsEmpresa = registro.NOFANTASIA;
            QtdSaidaVenda = registro.QTDSAIDAVENDA;
            QtdSaldo = registro.QTDSALDO;
            dataMovimentacao = registro.DTMOVIMENTACAO;
            qtdInicial = registro.QTDINICIAL;
            qtdEntTransferencia = registro.QTDENTRADATRANSAFERENCIA;
            qtdEntDevolucao = registro.QTDENTRADADEVOLUCAO;
            
            qtdSaidaTransf = registro.QTDSAIDATRANSFERENCIA;
            qtdSaldo = registro.QTDSALDO;
            
             dataRetorno.push( [contador,
                                dsEmpresa,
                                dsForn,
                                GrupoProd,
                                NomeGrupo,
                                codProd,
                                dsProduto,
                                dataMovimentacao,
                                qtdInicial,
                                qtdEntTransferencia,
                                qtdEntDevolucao,
                                qtdSaidaTransf,
                                QtdSaidaVenda,
                                QtdSaldo]);
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaRotatividade(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-rotatividade" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Empresa</th>
                        <th>Fornecedor</th>
                        <th>Grupo</th>
                        <th>Grade</th>
                        <th>Cod. Prod</th>
                        <th width="15%">Produto</th>
                        <th>Data</th>
                        <th>Inicial</th>
                        <th>Ent. Transf.</th>
                        <th>Ent. Dev.</th>
                        <th>Saída Transf.</th>
                        <th>Saída Venda</th>
                        <th>Saldo</th>
                    </tr>
                </thead>
                <tbody id="resultadoRotatividade">
                </tbody>
                <tfoot id="totalResultadoRotatividade"class="thead-themed">
                </tfoot>
            </table>`
        );
	   
	   $('#dt-basic-rotatividade').DataTable( {
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
}


//================ MENU LISTA VENDA ESTOQUE =====================================================

function ListaVendasEstoque(){
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
        	$("#idgrupograde").select2();
        	$("#idgrade").select2();
        	$("#idforn").select2(); 
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas Estoque - <span class='fw-300'></span>`);
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);
        		
        	ajaxGet('api/produto-sap/parceiro-negocio.xsjs')
        		.then(retornoListaParceiroSelect)
        		.catch(funcError);
        		
        	ajaxGet('api/produto-sap/grupo.xsjs')
        		.then(retornoListaGrupoSelect)
        		.catch(funcError);
      }
    };
    xmlhttp.open("GET", "contabilidade_action_listvendasestoque.html", true);
    xmlhttp.send();
}

function pesq_vendas_estoque(numPage){
    
    dataRetornoLoja=[];
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
 
   	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
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
        //newDataTable();
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/contabilidade/venda-estoque-produto.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaVendasEstoque)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "contabilidade_action_pesqvendasestoqueperiodo.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendaEstoque(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

    ajaxGet('api/contabilidade/venda-estoque-produto.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)
        	.then(retornoListaVendasEstoque)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasEstoque(respostaListaVendasPeriodoEstoque) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoEstoque.page);
    if(respostaListaVendasPeriodoEstoque.data.length != 0){
        for (var i=0; i < respostaListaVendasPeriodoEstoque.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasPeriodoEstoque.data[i];
            
            NoGrade = registro.NOMEGRUPO;
            NoProduto = registro.DSNOME;
            NuCodBarras = registro.NUCODBARRAS;
            QtdVenda = registro.QTDSAIDAVENDA;
            QtdSaldo = registro.QTDSALDO;
            VrCompra = registro.PRECOCUSTO;
            VrVenda = registro.PRECO_VENDA;
            MarkUp = 0;//Falta Formula
            
            dataRetornoLoja.push( [contador,
                                NoGrade,
                                NoProduto,
                                NuCodBarras,
                                QtdVenda,
                                QtdSaldo,
                                VrCompra,
                                VrVenda,
                                MarkUp]);
        }
        
        chamarProximaListaVendaEstoque(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-estoque-periodo" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Grade</th>
                        <th>Produto</th>
                        <th>Referência</th>
                        <th>QTD Venda</th>
                        <th>Estoque/Venda</th>
                        <th>Pç Compra</th>
                        <th>Pç Venda</th>
                        <th>MarkUp</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaEstoquePeriodo">
                </tbody>
                <tfoot id="totalResultadoVendaEstoquePeriodo"class="thead-themed">
                </tfoot>
            </table>`
        );
	   
	    $('#dt-basic-venda-estoque-periodo').DataTable( {
            data: dataRetornoLoja,
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

}

//================================================================================================

function funcErrorListaVendasVendedor(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoListaVendasVendedor',
		showConfirmButton: false,
		timer: 15000
	});
}

function funcError(data) {
	Swal.fire({
		type: "error",
		title: "Erro ao carregar os dados da página",
		showConfirmButton: false,
		timer: 15000
	});
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
                        .then(retornoListaGrupoEmpresasSelectVendedor)
                        .catch(funcError);

      }
    };
    xmlhttp.open("GET", "comercial_produtos_preco.html", true);
    xmlhttp.send();
}


function pesq_produto_preco(numPage){
    
    dataRetornoProdutoPreco=[];
    contador = 0;
    
    var idgrupo = $("#idmarca").val();

  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });

    if (idgrupo == 0 && idempresa == 0) {
  
        alert("Atenção! É preciso selecionar a Marca ou a Empresa.");
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
      
        ajaxGet('api/produto.xsjs?page='+numPage+'&idEmpresa=' + idempresa)
        	.then(retornoListaProdutoPreco)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqprodutopreco.html", true);
    xmlhttp.send();
} 

function chamarProximaListaProdutoPreco(numPage){ 
    
    var idgrupo = $("#idmarca").val();

  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });
    
        ajaxGet('api/produto.xsjs?page='+numPage+'&idEmpresa=' + idempresa)
        	.then(retornoListaProdutoPreco)
        	.catch(funcError);
        	
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
            
            CodBarras = registro.NUCODBARRAS;
            DsProduto = registro.DSNOME; 
            VrAntigo = parseFloat(registro.PRECOANTIGO);
            VrNovo = parseFloat(registro.PRECOVENDA);
            

              dataRetornoProdutoPreco.push( [contador, 
                                CodBarras,
                                DsProduto,
                                VrAntigo.toFixed(2),
                                VrNovo.toFixed(2)]);
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaProdutoPreco(numPageAtual + 1); 
    }else{
         $('#resultado').html(
            `<table id="dt-buttons-produto-preco" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>*</th>
                        <th>Código Barras</th>
                        <th>Descrição</th>
                        <th>Preço Antigo</th>
                        <th>Preço Novo</th>
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
    
       
}

// FUNCIONÁRIOS
function ListaFuncionarios() {
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
            $('#DTInicio').val(dataAtualCampo);
            $('#DTFim').val(dataAtualCampo);

            $("#idloja").select2();

            $('.DescTituloListaVendas').html(
                `<i class='subheader-icon fal fa-chart-area'></i> Lista dos funcionários das Lojas <span class='fw-300'></span>`);

            ajaxGet('api/informatica/empresa.xsjs')
                .then(retornoListaEmpresasSelect)
                .catch(funcErrorListaEmpresasSelect);
                
            pesq_funcionarios_loja();
        }
    };
    xmlhttp.open("GET", "comercial_action_listafuncionarios.html", true);
    xmlhttp.send();
}

function pesq_funcionarios_loja() {
    dataRetornoFuncionario=[];
    var IDEmpresaPesqVenda = $("#idloja").val();
    var DSNomeFunc = $("#dsNomeFunc").val();
    
    if(DSNomeFunc.length == 11 || DSNomeFunc.length == 14){
        DSNomeFunc = DSNomeFunc.replace(/\D/g, '');
    }
    
    
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
            newDataTable('pesqvendas');

            $('.dataAtual').text(dataAtual);

            ajaxGet('api/informatica/funcionario-loja.xsjs?pagesize=1000&idEmpresa=' + IDEmpresaPesqVenda + '&dsNomeFunc=' + DSNomeFunc)
                .then(retornoListaFuncionariosLoja)
                .catch(funcError);
        }
    };
    xmlhttp.open("GET", "informatica_action_pesqfuncionariosloja.html", true);
    xmlhttp.send();
}

//funcao para chamar todos funcionarios cadastrados
function chamarProximaListaFuncionario(numPage){
    var IDEmpresaPesqVenda = $("#idloja").val();
    var DSNomeFunc = $("#dsNomeFunc").val();
    ajaxGet('api/informatica/funcionario-loja.xsjs?page='+numPage+'&pagesize=1000&idEmpresa=' + IDEmpresaPesqVenda + '&dsNomeFunc=' + DSNomeFunc)
                .then(retornoListaFuncionariosLoja)
                .catch(funcError);
        
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaFuncionariosLoja(respostaListaFuncionariosLoja) {
    var tableFuncionariosEmpresa = $('#dt-basic-funcionario-loja').DataTable();
    var numPageAtual = parseInt(respostaListaFuncionariosLoja.page);
    
    if(respostaListaFuncionariosLoja.data.length != 0){
        for (var i = 0; i < respostaListaFuncionariosLoja.data.length; i++) {
            registroFuncionario = respostaListaFuncionariosLoja.data[i];
    
            idFuncionario = registroFuncionario['ID'];
            noFuncionario = registroFuncionario['NOFUNCIONARIO'];
            matricula = registroFuncionario['IDFUNCIONARIO'];
            noLogin = registroFuncionario['NOLOGIN'];
            noFuncao = registroFuncionario['DSFUNCAO'];
            DTDemissao = registroFuncionario['DTDEMISSAO'];
            SituacaoFunc = registroFuncionario['STATIVO'];
            TipoFunc = registroFuncionario['DSTIPO'];
            PercDescFunc = registroFuncionario['PERC'];
            
            if(DTDemissao == null){
                DTDemissao = '';
            }
    
            if(TipoFunc == 'PN'){
                TipoFunc = 'PARCEIRO DE NEGÓCIOS';
            }
            
    		if (SituacaoFunc == 'True') {
    			STFuncionario = `<label style="color: blue;">Ativo</label>`;
    			htmlOpcao =   `<div class="btn-group btn-group-xs">
    			                    <button type="button" class="btn btn-success btn-xs" title="Alterar" id="` +idFuncionario + `" onclick="modal_funcionario_loja(this.id)" >Alterar</button>
                               </div>`;
    		} else {
    			STFuncionario = `<label style="color: red;">Inativo</label>`;
    			htmlOpcao =   `<div class="btn-group btn-group-xs">
                                    
                              </div>`;
    		}
    		
    		dataRetornoFuncionario.push( [noFuncionario,
                                noLogin,
                                noFuncao,
                                TipoFunc,
                                PercDescFunc,
                                STFuncionario,
                                DTDemissao,
                                htmlOpcao
                                ]);
        }
        chamarProximaListaFuncionario(numPageAtual+1);
    }else{
        $('#resultado').html(
            `<table id="dt-basic-funcionario-loja" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th width="30%">Funcionário</th>
                            <th width="10%">Login</th>
                            <th width="15%">Função</th>
                            <th width="15%">Tipo</th>
                            <th width="15%">% Desc.</th>
                            <th width="10%">Situação</th>
                            <th width="10%">DT Desl.</th>
                            <th width="15%"></th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListFuncionario">
                    </tbody>
                    <tfoot class="thead-themed totalProduto">
                    </tfoot>
                </table>`
        );
        
	   $('#dt-basic-funcionario-loja').DataTable( {
            data: dataRetornoFuncionario,
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
    
}



        

function modal_funcionario_loja(id) {

    $.get('comercial_action_updatefuncionariomodal.html', function(res) {

        $('#resulmodalfuncionario').html(res);
        $("#cadFuncionario").modal('show');
        $('#cadFuncionario').on('shown.bs.modal', function() {});
        
        for (var i = 0; i < listaEmpresas.length; i++) {

            IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
            DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

            $('#empresaFuncionario').append(
                `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
            );
        }

        $("#empresaFuncionario").select2({
            dropdownParent: $("#cadFuncionario")
        });

        $("#tipoFuncionario").select2({
            dropdownParent: $("#cadFuncionario")
        });
        $("#funcaoFuncionario").select2({
            dropdownParent: $("#cadFuncionario")
        });

        if (id > 0) {
            $("#footerfuncionario").html(`<button type="button" class="btn btn-success" onclick="update_funcionario()">Atualizar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

            ajaxGet('api/informatica/funcionario-loja.xsjs?pagesize=1000&id=' + id)
                .then(retornoAtualizaFuncionario)
                .catch(funcError);
        } else {
            $("#footerfuncionario").html(`<button type="button" class="btn btn-success" onclick="validar_cadastrar_funcionario()">Cadastrar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
            
            ajaxGet('api/informatica/funcionario-ultimoID.xsjs?pagesize=1000&id=')
                .then(retornoUltimoIDFuncionario)
                .catch(funcError);
            
        }

    })

}

function retornoAtualizaFuncionario(respostaAtualizaFuncionario) {

    for (var i = 0; i < respostaAtualizaFuncionario.data.length; i++) {
        id = respostaAtualizaFuncionario.data[i]['ID'];
        idFuncionario = respostaAtualizaFuncionario.data[i]['IDFUNCIONARIO']
        nomeFuncionario = respostaAtualizaFuncionario.data[i]['NOFUNCIONARIO']
        nomeEmpresa = respostaAtualizaFuncionario.data[i]['NOFANTASIA']
        loginFunc = respostaAtualizaFuncionario.data[i]['NOLOGIN']

        let idEmpresaFuncionario = respostaAtualizaFuncionario.data[i]['IDEMPRESA']
        funcao = respostaAtualizaFuncionario.data[i]['DSFUNCAO']
        tipo = respostaAtualizaFuncionario.data[i]['DSTIPO']
        cpf = respostaAtualizaFuncionario.data[i]['NUCPF']
        valorSalario = respostaAtualizaFuncionario.data[i]['VALORSALARIO']
        valorPerc = respostaAtualizaFuncionario.data[i]['PERC']
        valorDisponivel = respostaAtualizaFuncionario.data[i]['VALORDISPONIVEL']

        pass = respostaAtualizaFuncionario.data[i]['PWSENHA']

        for (var i = 0; i < listaEmpresas.length; i++) {

            IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
            DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

            $('#empresaFuncionario').append(
                `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
            );
        }

        $("#IDFuncionarioAtualizar").val(id);
        $("#nomefuncionario").val(nomeFuncionario);
        
        $("#codigoFuncionario").val(idFuncionario);

        $('#empresaFuncionario').val(idEmpresaFuncionario);
        $('#empresaFuncionario').trigger('change');
        $("#loginFuncionario").val(loginFunc);

        $("#senhaFuncionario").val(pass);
        $("#repeteSenhaFuncionario").val(pass);

        $("#funcaoFuncionario").val(funcao);
        $('#funcaoFuncionario').trigger('change');
        
        
        $("#tipoFuncionario").val(tipo);
        $('#tipoFuncionario').trigger('change');
        

        $("#cpfFuncionario").val(cpf);
        $("#CPFCadastrado").val(cpf);
        $("#salarioFuncionario").val(valorSalario);
        $("#percDescFunc").val(valorPerc);
        $("#valorDescFunc").val(valorDisponivel);

        $('#nomefuncionario').attr('readonly', true);
        $('#empresaFuncionario').attr('disabled', false);
        $('#cpfFuncionario').attr('readonly', true);
        $('#funcaoFuncionario').attr('disabled', true);
        $('#tipoFuncionario').attr('disabled', true);
        $("#salarioFuncionario").attr('readonly', true);
        $("#percDescFunc").attr('readonly', true);
        $("#valorDescFunc").attr('readonly', true);
        $("#stativofunc").attr('disabled', true);
        
        
    }
}

function update_funcionario() {
    
    id = $("#IDFuncionarioAtualizar").val();
    var NLoginAtualizar = $("#loginFuncionario").val();
    var NSenhaAtualizar = $("#repeteSenhaFuncionario").val();
    var SenhaAtualizar = $("#senhaFuncionario").val();
    var vrdesconto = $("#percDescFunc").val().replace(".", "").replace(",", ".");
    var vrdisponivel = $("#valorDescFunc").val().replace(".", "").replace(",", "."); 
    var nomefuncionario = $("#nomefuncionario").val();
    var cpfFuncionario = $("#cpfFuncionario").val();
    var cpfCadastrado = $("#CPFCadastrado").val();
    var funcaoFuncionario = $("#funcaoFuncionario").val();
    var TipoFuncionario = $("#tipoFuncionario").val();
    var empresaFuncionario = $("#empresaFuncionario").val();
    var idfuncionario = $("#codigoFuncionario").val();
    var STAtivo = $("#stativofunc").val();

    if(NLoginAtualizar>0){
        NLoginAtualizar = NLoginAtualizar;
    }else{
        NLoginAtualizar = idfuncionario;
    }
    var dados = [{
        
        "ID": parseInt(id),
        "IDFUNCIONARIO": parseInt(idfuncionario),
        "IDEMPRESA": parseInt(empresaFuncionario),
        "NOFUNCIONARIO": nomefuncionario,
        "NUCPF": cpfFuncionario,
        "NOLOGIN": NLoginAtualizar,
        "PWSENHA": NSenhaAtualizar,
        "DSFUNCAO": funcaoFuncionario,
        "VALORSALARIO":0,
        "PERC": parseFloat(vrdesconto),
        "STATIVO":STAtivo,
        "DSTIPO": TipoFuncionario,
        "VALORDISPONIVEL": parseFloat(vrdisponivel)
    }];

    console.log(dados);
    if (SenhaAtualizar == NSenhaAtualizar) {
            ajaxPut("api/comercial/funcionario-loja.xsjs", dados)
                .then(funcSucessUpdateFuncionario)
                .catch(funcError);
    }else{
        Swal.fire({
            type: "error",
            title: 'Campo Senha não confere com o campo Repete Senha!',
            showConfirmButton: false,
            timer: 15000
        });
    }

}

function funcSucessUpdateFuncionario(resposta) {

    alerta_atualizado_sucesso();
    $("#cadFuncionario").modal('hide');
    pesq_funcionarios_loja();

}
///////////////ESTRUTURA MERCADOLOGICA////////////////////////

function proximaListaFornecedor(numPage){
     idMarca = $("#idmarcaproduto").val();
     ajaxGet('api/comercial/fornecedor-produto.xsjs?page='+numPage+'&idMarca='+idMarca)
            	.then(retornoListaFornecedor)
            	.catch(funcError);
}

function proximaListaMarca(numPage){
    idSubGrupo = $("#idgrade").val();
    ajaxGet('api/comercial/marca-produto.xsjs?page='+numPage+'&idSubGrupo='+idSubGrupo)
        	    .then(retornoListaMarca)
        	    .catch(funcError);
    
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
    	    .catch(funcError);
}

function pesqListaMarcaPorSubGrupo(){
    idSubGrupo = $("#idgrade").val();
	ajaxGet('api/comercial/marca-produto.xsjs?idSubGrupo='+idSubGrupo)
    	    .then(retornoListaMarca)
    	    .catch(funcError);
}

function pesqListaFornecedorPorMarca(){
    idMarca = $("#idmarcaproduto").val();
	ajaxGet('api/comercial/fornecedor-produto.xsjs?idMarca='+idMarca)
    	    .then(retornoListaFornecedor)
    	    .catch(funcError);
}

function ListaRelatorios(){
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
        	$("#idgrupograde").select2();
        	$("#idgrade").select2();
        	$("#idforn").select2(); 
        	$("#idmarcaproduto").select2(); 
        	
        	 $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Relatório das Vendas - <span class='fw-300'></span>`);
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);
        
        	ajaxGet('api/comercial/empresa.xsjs')
            	.then(retornoListaEmpresasSelect)
            	.catch(funcError);	
            	
            ajaxGet('api/comercial/fornecedor-produto.xsjs')
            	.then(retornoListaFornecedor)
            	.catch(funcError);	
            	
        	ajaxGet('api/comercial/grupo-produto.xsjs')
            	.then(retornoListaGrupo)
            	.catch(funcError);
            	
    		ajaxGet('api/comercial/subgrupo-produto.xsjs')
        	    .then(retornoListaSubGrupo)
        	    .catch(funcError);
        	    
    	    ajaxGet('api/comercial/marca-produto.xsjs')
        	    .then(retornoListaMarca)
        	    .catch(funcError);
        	    
        	// EVENTOS SELECT`S 
        	var $eventSelectGrupo = $("#idgrupograde");
            $eventSelectGrupo.on("change", function (e) { pesqListaSubGrupoPorGrupo(); });
            var $eventSelectSubGrupo = $("#idgrade");
            $eventSelectSubGrupo.on("change", function (e) { pesqListaMarcaPorSubGrupo(); });
            var $eventSelectMarca = $("#idmarcaproduto");
            $eventSelectMarca.on("change", function (e) { pesqListaFornecedorPorMarca(); });
            
            
      }
    };
    xmlhttp.open("GET", "comercial_action_listvendasrel.html", true);
    xmlhttp.send();
}
/////////////////////////////////////////////////////////////
//CUSTO POR LOJA ///////////////////////////////////////////
function pesq_vendas_custo_por_loja(numPage){
    dataRetorno=[];
    totalVrProduto = 0;
    totalVrDesconto = 0;
    totalVrNF = 0;
    totalQTDProduto = 0;
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
    var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/comercial/custo-por-loja.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasCustoLojas)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaCustoLoja(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/comercial/custo-por-loja.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasCustoLojas)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasCustoLojas(respostaListaVendasPeriodoConsolidado) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoConsolidado.page);
    if(respostaListaVendasPeriodoConsolidado.data.length != 0){
        for (var i=0; i < respostaListaVendasPeriodoConsolidado.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasPeriodoConsolidado.data[i];
            
            noFantasia = registro.NOFANTASIA;
            qtdCliente = registro.QTD_CLIENTE; 
            qtdProduto = registro.QTD_PRODUTO;
            vlrTotalVenda = registro.VRTOTALVENDA;
            vlrTotalDesconto = registro.VALORDESCONTO;
            vlrCustoTotal = registro.VRCUSTOTOTAL;
            vlrTotalProjecao = registro.VRTOTALVENDA;
            vlrTotallucro = parseFloat(vlrTotalVenda)-parseFloat(vlrCustoTotal);
            vlrTotalMarckup = ((parseFloat(vlrTotalVenda) / parseFloat(vlrCustoTotal)) - 1)*100;
           
            
                dataRetorno.push( [contador,
                                noFantasia,
                                qtdCliente,
                                qtdProduto,
                                parseFloat(vlrTotalVenda),
                                parseFloat(vlrTotalProjecao),
                                parseFloat(vlrCustoTotal),
                                vlrTotallucro.toFixed(2),
                                vlrTotalMarckup.toFixed(2)])
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaCustoLoja(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-consolidada" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Loja</th>
                        <th>Qtde Clientes</th>
                        <th>Qtde Produtos</th>
                        <th>Venda Total</th>
                        <th>Projeção Mês</th>
                        <th>Custo Total</th>
                        <th>Lucro Total</th>
                        <th>MarkUp</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaPeriodoConsolidado">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaPeriodoConsolidado"class="thead-themed">
                <th>#</th>
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
	   
	    $('#dt-basic-venda-consolidada').DataTable( {
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
            totalqtdCliente = api.column( 2 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalqtdProduto = api.column( 3 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVenda = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalProjecao = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalCusto = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalLucro = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
 
            // Total over this page
            pageTotallqtdCliente = api.column( 2, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotallqtdProduto = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVenda = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalProjecao = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalCusto = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalLucro = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Update footer
            $( api.column( 2 ).footer() ).html(pageTotallqtdCliente +' ( '+ totalqtdCliente +' total )');
            $( api.column( 3 ).footer() ).html(pageTotallqtdProduto +' ( '+ totalqtdProduto +' total )');
            $( api.column( 4 ).footer() ).html(pageTotalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 5 ).footer() ).html(pageTotalProjecao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalProjecao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 6 ).footer() ).html(pageTotalCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 7 ).footer() ).html(pageTotalLucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalLucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            
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

}
/////////////////////////////////////////////////////////////
//PRODUTOS MAIS VENDIDOS/////////////////////////////////////
function pesq_vendas_produtos_mais_vendidos(numPage){
    dataRetorno=[];
    totalVrProduto = 0;
    totalVrDesconto = 0;
    totalVrNF = 0;
    totalQTDProduto = 0;
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDMarca = $("#idmarcaproduto").val();
  
    var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/comercial/produtos-mais-vendidos.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasProdutosMaisVendidos)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaProdutosMaisVendidos(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDMarca = $("#idmarcaproduto").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/comercial/produtos-mais-vendidos.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasProdutosMaisVendidos)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasProdutosMaisVendidos(respostaListaVendasPeriodoConsolidado) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoConsolidado.page);
    if(respostaListaVendasPeriodoConsolidado.data.length != 0){
        for (var i=0; i < respostaListaVendasPeriodoConsolidado.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasPeriodoConsolidado.data[i];
            
            codProduto = registro.CPROD;
            codBarras = registro.NUCODBARRAS; 
            nome = registro.DSNOME;
            quantidade = registro.QTD;
            vlrUnitario = registro.VALOR_UNITARIO;
            vlrTotal = registro.VALOR_TOTAL;
            
                dataRetorno.push( [contador,
                                codProduto,
                                codBarras,
                                nome,
                                quantidade,
                                parseFloat(vlrUnitario),
                                parseFloat(vlrTotal),
                                ])
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaProdutosMaisVendidos(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-consolidada" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Código</th>
                        <th>Código de Barras</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Valor Unitário</th>
                        <th>Valor Total</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaPeriodoConsolidado">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaPeriodoConsolidado"class="thead-themed">
                <th>#</th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                </tfoot>
            </table>`
        );
	   
	    $('#dt-basic-venda-consolidada').DataTable( {
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
            totalQuantidade = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVlrUnit = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVlr = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Total over this page
            pageTotalQuantidade = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVlrUnit = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVlr = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Update footer
            $( api.column( 4 ).footer() ).html(pageTotalQuantidade +' ('+ totalQuantidade +' total )');
            $( api.column( 5 ).footer() ).html(pageTotalVlrUnit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlrUnit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 6 ).footer() ).html(pageTotalVlr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            
            
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

}

/////////////////////////////////////////////////////////////
//VENDAS POR VENDEDOR/////////////////////////////////////
function pesq_vendas_vendedor(numPage){
    dataRetorno=[];
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDMarca = $("#idmarcaproduto").val();
  
    var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/comercial/vendas-vendedor-estrutura.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasPorVendedor)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendasPorVendedor(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDMarca = $("#idmarcaproduto").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/comercial/vendas-vendedor-estrutura.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasPorVendedor)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasPorVendedor(respostaListaVendasPeriodoConsolidado) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoConsolidado.page);
    if(respostaListaVendasPeriodoConsolidado.data.length != 0){
        for (var i=0; i < respostaListaVendasPeriodoConsolidado.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasPeriodoConsolidado.data[i];
            
            Empresa = registro.NOFANTASIA;
            matricula = registro.VENDEDOR_MATRICULA; 
            funcionario = registro.VENDEDOR_NOME;
            qtdVendas = registro.QTD_VENDAS;
            qtdProdutos = registro.QTD_PRODUTOS;
            vlrTotalVenda = registro.VRTOTALVENDA;
            vlrTotalVoucher = registro.VRRECVOUCHER;
            vlrTotalCusto = registro.PRECO_COMPRA;
            
            vlrTotalVendaLiquida = parseFloat(vlrTotalVenda)-parseFloat(vlrTotalVoucher); 
            
                dataRetorno.push( [contador,
                                Empresa,
                                matricula,
                                funcionario,
                                qtdVendas,
                                qtdProdutos,
                                parseFloat(vlrTotalVenda).toFixed(2),
                                parseFloat(vlrTotalVoucher).toFixed(2),
                                parseFloat(vlrTotalVendaLiquida).toFixed(2),
                                parseFloat(vlrTotalCusto).toFixed(2),
                                ])
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaVendasPorVendedor(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-consolidada" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Empresa</th>
                        <th>Matrícula</th>
                        <th>Funcionário</th>
                        <th>Quantidade Vendas</th>
                        <th>Quantidade Produtos</th>
                        <th>Valor total Vendas</th>
                        <th>Valor total Vouchers</th>
                        <th>Valor total Venda Líquida</th>
                        <th>Valor Total Custo</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaPeriodoConsolidado">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaPeriodoConsolidado"class="thead-themed">
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
	   
	    $('#dt-basic-venda-consolidada').DataTable( {
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
            totalQuantidadeVendas = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalQuantidadeProdutos = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVlrVendas = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVlrVouchers = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVlrVendasLiquida = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVlrCusto = api.column( 9 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Total over this page
            pageTotalQuantidadeVendas = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalQuantidadeProdutos = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVlrVendas = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVlrVouchers = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVlrVendasLiquida = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVlrCusto = api.column( 9, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            // Update footer
            $( api.column( 4 ).footer() ).html(pageTotalQuantidadeVendas +' ('+ totalQuantidadeVendas +' total )');
            $( api.column( 5 ).footer() ).html(pageTotalQuantidadeProdutos +' ('+ totalQuantidadeProdutos +' total )');
            $( api.column( 6 ).footer() ).html(pageTotalVlrVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlrVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 7 ).footer() ).html(pageTotalVlrVouchers.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlrVouchers.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 8 ).footer() ).html(pageTotalVlrVendasLiquida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlrVendasLiquida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 9 ).footer() ).html(pageTotalVlrCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlrCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            
            
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

}
/////////////////////////////////////////////////////////////
/////////////////////////PESQUISA VENDAS POR ESTRUTUTA////////////////////
function pesq_vendas_estruturas_marckup(numPage){
    var IDMarcaPesqVenda = $("#idmarca").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDMarca = $("#idmarcaproduto").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
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
        newDataTable();
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/comercial/vendas-por-estrutura.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasMarcaMarckup)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasporestrutura.html", true);
    xmlhttp.send();
}

function retornoListaVendasMarcaMarckup(respostaListaVendasMarcasMarckup) {

        QTDProdTotal = 0;
        VrTotalTotal = 0;
        VrTotalLiq = 0;
        VrCustoProdTotal = 0;
        TotalLiq = 0;
        VrTotalDesconto = 0;
        
        marckup = 0;
        marckupperc = 0;
        indicadorMarckup = 0;
        indicadorVenda = 0;
        margem = 0;
        margemperc = 0;
        curstoperc = 0;
        
        marckupTotal = 0;
        marckuppercTotal = 0;
        indicadorMarckupTotal = 0;
        indicadorVendaTotal = 0;
        margemTotal = 0;
        margempercTotal = 0;
        curstopercTotal = 0;
        
        TotalBruta = 0;
        TotalDesconto = 0;
        
        totalVendaBrutaSemDesc = 0;
        totalVrVoucher = 0;
      
        
    if(respostaListaVendasMarcasMarckup.data.length != 0){
    	for (var i = 0; i < respostaListaVendasMarcasMarckup.data.length; i++) {

    	    idEmpresa = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['IDEMPRESA'];
            noFantasia = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['NOFANTASIA'];
            qtdProduto = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['QTD']; 
            vrTotalVendaBruta = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['VRTOTALLIQUIDO'];
            totalCustoProduto = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['TOTALCUSTO'];
            
            VrPago = parseFloat(respostaListaVendasMarcasMarckup.data[i]['valorPago']);
            VrVoucher = parseFloat(respostaListaVendasMarcasMarckup.data[i]['voucher']);
            totalVrVoucher = totalVrVoucher + VrVoucher;
            
            
            TotalDesconto = respostaListaVendasMarcasMarckup.data[i]['valorDesconto'];
            
            
            dsGrupo = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['GRUPO'];
            dsSubGrupo = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['SUBGRUPO'];
            dsMarca = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['MARCA'];
            NuCodBarras = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['NUCODBARRAS'];
            dsProduto = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['DSNOME'];
            
            //POR PRODUTO
            vlTotalCustoProduto = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['TOTALCUSTO'];
            vlTotalBrutoProduto = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['TOTALBRUTO'];
            vlTotalDescontoProduto = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['TOTALDESCONTO'];
            vlTotalLiquidoProduto = respostaListaVendasMarcasMarckup.data[i]['vendaMarca']['VRTOTALLIQUIDO'];
            marckupProduto = ((parseFloat(vlTotalLiquidoProduto) / parseFloat(vlTotalCustoProduto)) - 1)*100;
            indicadorMarckupProduto = ((parseFloat(marckupProduto)/100)); 
            indicadorVendaProduto = (parseFloat(vlTotalLiquidoProduto) / parseFloat(vlTotalCustoProduto));
            margemProduto = (parseFloat(vlTotalLiquidoProduto) - parseFloat(vlTotalCustoProduto)); 
            curstopercProduto = ((parseFloat(vlTotalCustoProduto)*100)/parseFloat(vlTotalLiquidoProduto));
            margempercProduto = 100 - ((parseFloat(vlTotalCustoProduto)*100)/parseFloat(vlTotalLiquidoProduto));
            percDescontoProduto = ((parseFloat(vlTotalDescontoProduto)/(parseFloat(vlTotalBrutoProduto)+parseFloat(vlTotalDescontoProduto))) * 100);
            if(percDescontoProduto > 0){ percDescontoProduto = percDescontoProduto - 0.01;}
           //////////////
           
            vrTotalVendaLiquida = parseFloat(VrPago) - parseFloat(VrVoucher); 
            vrTotalVenda = parseFloat(VrPago); 
            vrVendaBruta = parseFloat(VrPago) + parseFloat(TotalDesconto);
            
            totalVendaBrutaSemDesc = totalVendaBrutaSemDesc + vrVendaBruta;

            marckup = ((parseFloat(vrTotalVenda) / parseFloat(totalCustoProduto)) - 1)*100;
            indicadorMarckup = ((parseFloat(marckup)/100)); 
            indicadorVenda = (parseFloat(vrTotalVenda) / parseFloat(totalCustoProduto));
            margem = (parseFloat(vrTotalVenda) - parseFloat(totalCustoProduto)); 
            curstoperc = ((parseFloat(totalCustoProduto)*100)/parseFloat(vrTotalVenda));
            margemperc = 100 - ((parseFloat(totalCustoProduto)*100)/parseFloat(vrTotalVenda));
            
            QTDProdTotal = parseFloat(QTDProdTotal) + parseFloat(qtdProduto); 
            VrTotalTotal = parseFloat(VrTotalTotal) + parseFloat(vrTotalVenda);
            VrCustoProdTotal = parseFloat(VrCustoProdTotal) + parseFloat(totalCustoProduto);
            TotalLiq = parseFloat(TotalLiq) + parseFloat(vrTotalVenda);
            TotalBruta = parseFloat(TotalBruta) + parseFloat(vrTotalVendaLiquida);
            VrTotalDesconto = parseFloat(VrTotalDesconto) + parseFloat(TotalDesconto);
           
            
            percDesconto = ((parseFloat(TotalDesconto)/(parseFloat(vrTotalVenda)+parseFloat(TotalDesconto))) * 100);
            if(percDesconto > 0){ percDesconto = percDesconto - 0.01;}
            
            VrTotalPercDesconto = ((parseFloat(VrTotalDesconto)*100)/(parseFloat(TotalLiq)+parseFloat(VrTotalDesconto)));
            if(VrTotalPercDesconto > 0){ VrTotalPercDesconto = VrTotalPercDesconto - 0.01;}
            
            curstopercTotal = ((parseFloat(VrCustoProdTotal)*100)/parseFloat(TotalLiq));
            marckupTotal = ((parseFloat(TotalLiq) / parseFloat(VrCustoProdTotal)) - 1)*100;
            indicadorVendaTotal = (parseFloat(TotalLiq) / parseFloat(VrCustoProdTotal));
            margemTotal = (parseFloat(TotalLiq) - parseFloat(VrCustoProdTotal));
            margempercTotal = 100 - ((parseFloat(VrCustoProdTotal)*100)/parseFloat(TotalLiq));
            
            if(marckupProduto < 0){
                tdMarckup = `<td style="text-align: right;"><label style="color: red;">-` + mascaraValor(parseFloat(marckupProduto).toFixed(2)) +	`</label></td>`;
            }else{
                tdMarckup = `<td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(marckupProduto).toFixed(2)) +	`</label></td>`;
            }
            
            if(indicadorVendaProduto < 0){
                tdIndicadorVenda = `<td style="text-align: right;"><label style="color: red;">-` + mascaraValor(parseFloat(indicadorVendaProduto).toFixed(2)) +	`</label></td>`;
            }else{
                tdIndicadorVenda = `<td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(indicadorVendaProduto).toFixed(2)) +	`</label></td>`;
            }
            
            if(margemProduto < 0){
                tdMargem = `<td style="text-align: right;"><label style="color: red;">-` + mascaraValor(parseFloat(margemProduto).toFixed(2)) +	`</label></td>`;
            }else{
                tdMargem = `<td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(margemProduto).toFixed(2)) +	`</label></td>`;
            }
            
            if(margempercProduto < 0){
                tdMargemperc = `<td style="text-align: right;"><label style="color: red;">-` + mascaraValor(parseFloat(margempercProduto).toFixed(2)) +	`</label></td>`;
            }else{
                tdMargemperc = `<td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(margempercProduto).toFixed(2)) +	`</label></td>`;
            }
            
			$('#resultadoVendaMarcaMarckup').append(
				`<tr>
                    <td><label style="color: blue; font-size: 11px;">` + idEmpresa +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + noFantasia +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + dsGrupo +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + dsSubGrupo +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + dsMarca +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + NuCodBarras +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + dsProduto +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vlTotalBrutoProduto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vlTotalDescontoProduto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(percDescontoProduto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vlTotalLiquidoProduto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(totalCustoProduto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(curstopercProduto).toFixed(2)) +	`</label></td>
                    `+ tdMarckup +``+
                    tdIndicadorVenda +``+
                    tdMargem +``+
                    tdMargemperc + `
                  </tr>`
			);
			
            footerTotal = 
        		`<tr>
                    <th colspan="7" style="text-align: center;">Total</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVendaBrutaSemDesc).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(VrTotalDesconto).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(VrTotalPercDesconto).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(TotalLiq).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(VrCustoProdTotal).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(curstopercTotal).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(marckupTotal).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(indicadorVendaTotal).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(margemTotal).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(margempercTotal).toFixed(2)) + `</th>
                </tr>`
        	;
    	}

    }

}
/////////////////////////////////////////////////////////////////////////
/////////////////////////PESQUISA VENDAS POR ESTRUTUTA TABELA SOMATORIO////////////////////
function pesq_vendas_estrutura_indicadores(numPage){
    dataRetorno=[];
    totalVrProduto = 0;
    totalVrDesconto = 0;
    totalVrNF = 0;
    totalQTDProduto = 0;
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
    var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/comercial/vendas-por-estrutura.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasEstruturaIndicadores)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendas_estrutura_indicadores(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/comercial/vendas-por-estrutura.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        .then(retornoListaVendasEstruturaIndicadores)
        .catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasEstruturaIndicadores(respostaListaVendasPeriodoConsolidado) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoConsolidado.page);
    if(respostaListaVendasPeriodoConsolidado.data.length != 0){
        for (var i=0; i < respostaListaVendasPeriodoConsolidado.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasPeriodoConsolidado.data[i];

            noFantasia = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['NOFANTASIA'];
            dsGrupo = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['GRUPO'];
            dsSubGrupo = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['SUBGRUPO'];
            dsMarca = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['MARCA'];
            NuCodBarras = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['NUCODBARRAS'];
            dsProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['DSNOME'];
            totalQuantidade = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['QTD'];
            vlTotalCustoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALCUSTO'];
            vlTotalBrutoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALBRUTO'];
            vlTotalDescontoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALDESCONTO'];
            vlTotalLiquido = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['VRTOTALLIQUIDO'];
            vlTotalVoucher = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['VLVOUCHER'];
            vlTotalLiquidoProduto = parseFloat(vlTotalLiquido)-parseFloat(vlTotalVoucher);
            marckupProduto = ((parseFloat(vlTotalLiquido) / parseFloat(vlTotalCustoProduto)) - 1)*100;
            indicadorMarckupProduto = ((parseFloat(marckupProduto)/100)); 
            indicadorVendaProduto = (parseFloat(vlTotalLiquido) / parseFloat(vlTotalCustoProduto));
            margemProduto = (parseFloat(vlTotalLiquido) - parseFloat(vlTotalCustoProduto)); 
            curstopercProduto = ((parseFloat(vlTotalCustoProduto)*100)/parseFloat(vlTotalLiquido));
            margempercProduto = 100 - ((parseFloat(vlTotalCustoProduto)*100)/parseFloat(vlTotalLiquido));
            percDescontoProduto = ((parseFloat(vlTotalDescontoProduto)/(parseFloat(vlTotalBrutoProduto)+parseFloat(vlTotalDescontoProduto))) * 100);
            if(percDescontoProduto > 0){ percDescontoProduto = percDescontoProduto - 0.01;}

                dataRetorno.push( [contador,
                                noFantasia,
                                dsGrupo,
                                dsSubGrupo,
                                dsMarca,
                                NuCodBarras,
                                dsProduto,
                                totalQuantidade,
                                parseFloat(vlTotalBrutoProduto).toFixed(2),
                                parseFloat(vlTotalDescontoProduto).toFixed(2),
                                percDescontoProduto.toFixed(2),
                                parseFloat(vlTotalVoucher).toFixed(2),
                                parseFloat(vlTotalLiquidoProduto).toFixed(2),
                                parseFloat(vlTotalCustoProduto).toFixed(2),
                                curstopercProduto.toFixed(2),
                                marckupProduto.toFixed(2),
                                indicadorVendaProduto.toFixed(2),
                                margemProduto.toFixed(2),
                                margempercProduto.toFixed(2)
                            ])
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
       chamarProximaListaVendas_estrutura_indicadores(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-consolidada" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Loja</th>
                        <th>Grupo</th>
                        <th>SubGrupo</th>
                        <th>Marca</th>
                        <th>Cód. Barras</th>
                        <th>Produto</th>
                        <th>Total Quantidade</th>
                        <th>Venda Bruta(R$)</th>
                        <th>Desconto(R$)</th>
                        <th>Desconto(%)</th>
                        <th>Voucher(R$)</th>
                        <th>Venda Líquida(R$)</th>
                        <th>Custo(R$)</th>
                        <th>Custo(%)</th>
                        <th>MarkUp(%)</th>
                        <th>Indicador</th>
                        <th>Margem Bruta(R$)</th>
                        <th>Margem Bruta(%)</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaPeriodoConsolidado">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaPeriodoConsolidado"class="thead-themed">
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
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                </tfoot>
            </table>`
        );
	   
	    $('#dt-basic-venda-consolidada').DataTable( {
	        data: dataRetorno,
	         order: [[1, 'asc']],
        rowGroup: {
            dataSrc: [1],
            
            },    
             
            columnDefs: [ {
                targets: [ 0,1 ],
                visible: false
            } ],
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
            totalqtd = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalqtdCliente = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalqtdProduto = api.column( 9 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVenda = api.column( 11 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalProjecao = api.column( 12 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalCusto = api.column( 17 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                        
 
            // Total over this page
            pagetotalqtd = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotallqtdCliente = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotallqtdProduto = api.column( 9, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVenda = api.column( 11, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalProjecao = api.column( 12, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalCusto = api.column( 17, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            
            // Update footer
            $( api.column( 7 ).footer() ).html(pagetotalqtd +' ('+ totalqtd +' total )');
            $( api.column( 8 ).footer() ).html(pageTotallqtdCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalqtdCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 9 ).footer() ).html(pageTotallqtdProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalqtdProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 11 ).footer() ).html(pageTotalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 12 ).footer() ).html(pageTotalProjecao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalProjecao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 17 ).footer() ).html(pageTotalCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
           
            
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

}
/////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////
/////////////////////////PESQUISA VENDAS POSICIONAMENTO ESTOQUE////////////////////
function pesq_vendas_posicionamento_estoque(numPage){
    dataRetorno=[];
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
    var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/comercial/vendas-posicionamento-estoque.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasPosicionamentoEstoque)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendas_posicionamento_estoque(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/comercial/vendas-posicionamento-estoque.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        .then(retornoListaVendasPosicionamentoEstoque)
        .catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasPosicionamentoEstoque(respostaListaVendasPeriodoConsolidado) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoConsolidado.page);
    if(respostaListaVendasPeriodoConsolidado.data.length != 0){
        for (var i=0; i < respostaListaVendasPeriodoConsolidado.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasPeriodoConsolidado.data[i];

            noFantasia = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['NOFANTASIA'];
            dsGrupo = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['GRUPO'];
            dsSubGrupo = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['SUBGRUPO'];
            dsMarca = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['MARCA'];
            NuCodBarras = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['NUCODBARRAS'];
            dsProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['DSNOME'];
            qtdVenda = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['QTD'];
            qtdVoucher = respostaListaVendasPeriodoConsolidado.data[i]['qtdVoucher']['QTDVOUCHERS'];
            qtdEntrada = respostaListaVendasPeriodoConsolidado.data[i]['qtdEntradaSaida']['QTDENTRADA'];
            qtdSaida = respostaListaVendasPeriodoConsolidado.data[i]['qtdEntradaSaida']['QTDSAIDAS'];
            totalComprado = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALCOMPRADO'];
            totalQtdEntrada = parseInt(qtdEntrada) + parseInt(qtdVoucher);
            totalQtdSaida = parseInt(qtdVenda) + parseInt(qtdSaida);
            qtdPosicionamento = totalQtdEntrada - totalQtdSaida;
            vlTotalCustoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALCUSTO'];
            vlTotalBrutoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALBRUTO'];
            vlTotalDescontoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALDESCONTO'];
            vlTotalLiquidoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['VRTOTALLIQUIDO'];
            vlPrecoMedioCusto = parseFloat(vlTotalCustoProduto).toFixed(2) / parseInt(qtdVenda);
            vlPrecoMedioVenda = parseFloat(vlTotalLiquidoProduto).toFixed(2) / parseInt(qtdVenda);

                dataRetorno.push( [contador,
                                noFantasia,
                                dsGrupo,
                                dsSubGrupo,
                                dsMarca,
                                NuCodBarras,
                                dsProduto,
                                totalComprado,
                                parseFloat(vlPrecoMedioCusto).toFixed(2),
                                parseFloat(vlPrecoMedioVenda).toFixed(2),
                                qtdEntrada,
                                qtdSaida,
                                qtdVoucher,
                                qtdVenda,
                                parseFloat(vlTotalCustoProduto).toFixed(2),
                                parseFloat(vlTotalLiquidoProduto).toFixed(2),
                                qtdPosicionamento
                                
                            ])
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
       chamarProximaListaVendas_posicionamento_estoque(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-consolidada" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Loja</th>
                        <th>Grupo</th>
                        <th>SubGrupo</th>
                        <th>Marca</th>
                        <th>Cód. Barras</th>
                        <th>Produto</th>
                        <th>Qtd. Total Compra</th>
                        <th>Custo Médio(R$)</th>
                        <th>Venda Média(R$)</th>
                        <th>Qtd. Entrada</th>
                        <th>Qtd. Saída</th>
                        <th>Qtd. Troca(Ent.)</th>
                        <th>Qtd. Venda(Saída)</th>
                        <th>Custo Total(R$)</th>
                        <th>Venda Total(R$)</th>
                         <th>Estoque</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaPeriodoConsolidado">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaPeriodoConsolidado"class="thead-themed">
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
                        <th></th>
                        <th></th>
                        <th></th>
                </tfoot>
            </table>`
        );
	   
	    $('#dt-basic-venda-consolidada').DataTable( {
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

}

/////////////////////////////////////////////////////////////////////////
/////////////////////////PESQUISA VENDAS POSICIONAMENTO ESTOQUE PERIODOS////////////////////

function ListaDptoComprasVendasEstoque(){
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

            $('#dtconsultainicioB').val(dataAtualCampo);
            $('#dtconsultafimB').val(dataAtualCampo);

            $('#dtconsultainicioC').val(dataAtualCampo);
            $('#dtconsultafimC').val(dataAtualCampo);

        	//$("#idmarca").select2();
        	//$("#idloja").select2(); 
        	$("#idgrupograde").select2();
        	$("#idgrade").select2();
        	$("#idforn").select2(); 
        	$("#idmarcaproduto").select2(); 
        	
        	 $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Relatório das Vendas - <span class='fw-300'></span>`);
			
			ajaxGet('api/comercial/fornecedor-produto.xsjs')
            	.then(retornoListaFornecedor)
            	.catch(funcError);	
            	
        	ajaxGet('api/comercial/grupo-produto.xsjs')
            	.then(retornoListaGrupo)
            	.catch(funcError);
            	
    		ajaxGet('api/comercial/subgrupo-produto.xsjs')
        	    .then(retornoListaSubGrupo)
        	    .catch(funcError);
        	    
    	    ajaxGet('api/comercial/marca-produto.xsjs')
        	    .then(retornoListaMarca)
        	    .catch(funcError);
        	    
        	// EVENTOS SELECT`S 
        	var $eventSelectGrupo = $("#idgrupograde");
            $eventSelectGrupo.on("change", function (e) { pesqListaSubGrupoPorGrupo(); });
            var $eventSelectSubGrupo = $("#idgrade");
            $eventSelectSubGrupo.on("change", function (e) { pesqListaMarcaPorSubGrupo(); });
            var $eventSelectMarca = $("#idmarcaproduto");
            $eventSelectMarca.on("change", function (e) { pesqListaFornecedorPorMarca(); });
            
            
      }
    };
    xmlhttp.open("GET", "comercial_action_listVendasEstoque.html", true);
    xmlhttp.send();
}



function pesq_vendas_posicionamento_estoque_periodos(numPage){
    dataRetorno=[];
    contador = 0;
    
    //var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    //var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var datapesqinicioB = $("#dtconsultainicioB").val();
    var datapesqfimB = $("#dtconsultafimB").val();
    var datapesqinicioC = $("#dtconsultainicioC").val();
    var datapesqfimC = $("#dtconsultafimC").val();
  
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
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/comercial/vendas-estoque-produto.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&dataPesquisaInicioB=' + datapesqinicioB + '&dataPesquisaFimB=' + datapesqfimB + '&dataPesquisaInicioC=' + datapesqinicioC + '&dataPesquisaFimC=' + datapesqfimC + '&descricaoProduto=' + ProdutoPesqVenda + '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasPosicionamentoEstoquePeriodos)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendas_posicionamento_estoque_periodos(numPage){
    
    //var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    //var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var datapesqinicioB = $("#dtconsultainicioB").val();
    var datapesqfimB = $("#dtconsultafimB").val();
    var datapesqinicioC = $("#dtconsultainicioC").val();
    var datapesqfimC = $("#dtconsultafimC").val();

  
    
    ajaxGet('api/comercial/vendas-estoque-produto.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&dataPesquisaInicioB=' + datapesqinicioB + '&dataPesquisaFimB=' + datapesqfimB + '&dataPesquisaInicioC=' + datapesqinicioC + '&dataPesquisaFimC=' + datapesqfimC + '&descricaoProduto=' + ProdutoPesqVenda + '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
    .then(retornoListaVendasPosicionamentoEstoquePeriodos)
    .catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasPosicionamentoEstoquePeriodos(respostaListaVendasPeriodoConsolidado) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoConsolidado.page);
    if(respostaListaVendasPeriodoConsolidado.data.length != 0){
        for (var i=0; i < respostaListaVendasPeriodoConsolidado.data.length; i++) { 
            contador ++;
            var registro = respostaListaVendasPeriodoConsolidado.data[i];

            dsGrupo = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['GRUPO'];
            dsSubGrupo = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['SUBGRUPO'];
            dsMarca = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['MARCA'];
            NuCodBarras = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['NUCODBARRAS'];
            dsProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['DSNOME'];
            
            qtdRecebido = respostaListaVendasPeriodoConsolidado.data[i]['pedido']['QTDEENTREGUE'];
            qtdUltPedido = respostaListaVendasPeriodoConsolidado.data[i]['pedido']['QTDESOLICITADA'];
            
            qtdVenda = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['QTD'];
            qtdVendaB = respostaListaVendasPeriodoConsolidado.data[i]['qtdVendaB']['QTDVENDAS'];
            qtdVendaC = respostaListaVendasPeriodoConsolidado.data[i]['qtdVendaC']['QTDVENDAS'];

            totalVenda = parseInt(qtdVenda) + parseInt(qtdVendaB) + parseInt(qtdVendaC);


            
            qtdVoucher = respostaListaVendasPeriodoConsolidado.data[i]['qtdVoucher']['QTDVOUCHERS'];
            qtdEntrada = respostaListaVendasPeriodoConsolidado.data[i]['qtdEntradaSaida']['QTDENTRADA'];
            qtdSaida = respostaListaVendasPeriodoConsolidado.data[i]['qtdEntradaSaida']['QTDSAIDAS'];
            totalQtdEntrada = parseInt(qtdEntrada) + parseInt(qtdVoucher);
            totalQtdSaida = parseInt(qtdVenda) + parseInt(qtdSaida);
            qtdPosicionamento = totalQtdEntrada - totalQtdSaida;

            qtdEstoqueLoja = respostaListaVendasPeriodoConsolidado.data[i]['estoque101']['ESTOQUE101'];

            estoque_venda = parseInt(qtdPosicionamento) / parseInt(qtdVendaC);

            
            vendida_recebida = ((parseFloat(totalVenda) / parseFloat(qtdUltPedido)))*100;

            precoCompra = respostaListaVendasPeriodoConsolidado.data[i]['pedido']['PRECOUNIT'];
            precoVenda = respostaListaVendasPeriodoConsolidado.data[i]['qtdVendaC']['VUNCOM'];

            vlTotalCustoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALCUSTO'];
            vlTotalLiquidoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['VRTOTALLIQUIDO'];
            marckup = ((parseFloat(vlTotalLiquidoProduto) / parseFloat(vlTotalCustoProduto)) - 1)*100;

           
            aChegar = 0;



            dataRetorno.push( [contador,
                                dsGrupo,
                                dsSubGrupo,
                                dsMarca,
                                NuCodBarras,
                                dsProduto,
                                qtdRecebido,
                                qtdUltPedido,
                                qtdVenda,
                                qtdVendaB,
                                qtdPosicionamento,
                                qtdEstoqueLoja,
                                parseFloat(estoque_venda).toFixed(2),
                                parseFloat(vendida_recebida).toFixed(2),
                                precoCompra,
                                precoVenda,
                                parseFloat(marckup).toFixed(2),
                                aChegar,
                                qtdVendaC
                            ])
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
       chamarProximaListaVendas_posicionamento_estoque_periodos(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-consolidada" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Grupo</th>
                        <th>SubGrupo</th>
                        <th>Marca</th>
                        <th>Cód. Barras</th>
                        <th>Produto</th>
                        <th>Qtd. Recebido</th>
                        <th>Qtd. ult. Pedido</th>
                        <th>Qtd. Venda(A)</th>
                        <th>Qtd. Venda(B)</th>
                        <th>Estoque Total</th>
                        <th>Estoque Loja</th>
                        <th>Estoque/Venda</th>
                        <th>Vendida/Recebida Qtde(%)</th>
                        <th>Pç Compra</th>
                        <th>Pç Venda</th>
                        <th>Markup(%)</th>
                        <th>A chegar</th>
                        <th>Qtd. Venda(C)</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaPeriodoConsolidado">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaPeriodoConsolidado"class="thead-themed">
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
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                </tfoot>
            </table>`
        );
	   
	    $('#dt-basic-venda-consolidada').DataTable( {
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

}

/////////////////////////////////////////////////////////////////////////
/////////////////////////PESQUISA ESTOQUE VENDAS GRUPO E SUBGRUPO PERIODO////////////////////
function RelDptCompraEstoqueVendasGrupoSubgrupo(){
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

        	$("#idgrupograde").select2();
        	$("#idgrade").select2();
        	$("#idmarcaproduto").select2(); 
        	
        	 $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Relatório das Vendas - <span class='fw-300'></span>`);
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);
        
        	 	
        	ajaxGet('api/comercial/grupo-produto.xsjs')
            	.then(retornoListaGrupo)
            	.catch(funcError);
            	
    		ajaxGet('api/comercial/subgrupo-produto.xsjs')
        	    .then(retornoListaSubGrupo2)
        	    .catch(funcError);
        	    
    	      	    
        	// EVENTOS SELECT`S 
        	var $eventSelectGrupo = $("#idgrupograde");
            $eventSelectGrupo.on("change", function (e) { pesqListaSubGrupoPorGrupo2(); });
            
           
            
            
      }
    };
    xmlhttp.open("GET", "comercial_action_list_estoque_venda_grupo_subgrupo.html", true);
    xmlhttp.send();
}

function pesqListaSubGrupoPorGrupo2(){
    idGrupo = $("#idgrupograde").val();
	ajaxGet('api/comercial/subgrupo-produto.xsjs?idGrupo='+idGrupo)
    	    .then(retornoListaSubGrupo2)
    	    .catch(funcError);
}

function retornoListaSubGrupo2(respostaListaSubGrupos) { 
    listaSubGrupos = respostaListaSubGrupos.data;
    
    $("#idgrade").empty();
    $("#idmarcaproduto").empty();
    $("#idforn").empty();
    
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

function pesq_vendas_estoque_grupo_subgrupo(numPage){
    dataRetorno=[];
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    //var UFPesquisa = $("#ufprod").val();
    //var ProdutoPesqVenda = $("#descProduto").val();
    //var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    //var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
  
    /*var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });*/
    
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
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/comercial/vendas-estoque-grupo-subgrupo.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade )
        	.then(retornoListaVendasEstoqueGrupoSubgrupo)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendas_estoque_grupo_subgrupo(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    //var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	var IDGrade = [];
    $('#idgrade option:selected').each(function (index, el) {
        IDGrade.push($(el).val());
    });
    
        ajaxGet('api/comercial/vendas-estoque-grupo-subgrupo.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        .then(retornoListaVendasEstoqueGrupoSubgrupo)
        .catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasEstoqueGrupoSubgrupo(respostaListaVendasPeriodoConsolidado) {
                    
    var numPageAtual = parseInt(respostaListaVendasPeriodoConsolidado.page);
    var totalEstoquePrecoVenda = 0;
    var totalPrecoVenda = 0;
    for (var c=0; c < respostaListaVendasPeriodoConsolidado.data.length; c++) {
        
        qtdVenda = respostaListaVendasPeriodoConsolidado.data[c]['vendaMarca']['QTDVENDA'];
        vlTotalLiquidoProduto = respostaListaVendasPeriodoConsolidado.data[c]['vendaMarca']['VRTOTALLIQUIDO'];
        //POSICACAO ESTOQUE ANTERIOR
        qtdEstoqueAnterior = respostaListaVendasPeriodoConsolidado.data[c]['posicaoEstoqueAnterior']['QTDESTOQUE'];
        qtdVendasAnterior = respostaListaVendasPeriodoConsolidado.data[c]['posicaoVendasAnterior']['QTDVENDAS'];
        qtdVouchersAnterior = respostaListaVendasPeriodoConsolidado.data[c]['posicaoVouchersAnterior']['QTDVOUCHERS'];
        totalEstoqueAterior = (parseInt(qtdEstoqueAnterior) - parseInt(qtdVendasAnterior)) + parseInt(qtdVouchersAnterior);

        //POSICAO ESTOQUE DATA
        qtdEstoqueData = respostaListaVendasPeriodoConsolidado.data[c]['posicaoEstoqueAtual']['QTDESTOQUE'];
        qtdVouchersData = respostaListaVendasPeriodoConsolidado.data[c]['posicaoVouchersAtual']['QTDVOUCHERS'];
        totalEstoqueData = parseInt(qtdEstoqueData) + parseInt(qtdVouchersData);
        
        qtdPosicionamento = (parseInt(totalEstoqueAterior) + parseInt(totalEstoqueData) - parseInt(qtdVenda));
       
        vlPrecoMedioVenda = parseFloat(vlTotalLiquidoProduto).toFixed(2) / parseInt(qtdVenda);
        estoquePrecoVenda = parseFloat(vlPrecoMedioVenda).toFixed(2) * parseInt(qtdPosicionamento);
        totalEstoquePrecoVenda = parseFloat(totalEstoquePrecoVenda) + parseFloat(estoquePrecoVenda);
        totalPrecoVenda = parseFloat(totalPrecoVenda) + parseFloat(vlTotalLiquidoProduto);
    } 
    
    for (var i=0; i < respostaListaVendasPeriodoConsolidado.data.length; i++) { 
        contador ++;
        var registro = respostaListaVendasPeriodoConsolidado.data[i];

        
        dsGrupoEmpresarial = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['DSGRUPOEMPRESARIAL'];
        dsGrupo = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['GRUPO'];
        dsSubGrupo = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['SUBGRUPO'];
        qtdVenda = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['QTDVENDA'];
        vlTotalCustoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALCUSTO'];
        vlTotalBrutoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALBRUTO'];
        vlTotalDescontoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALDESCONTO'];
        vlTotalLiquidoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['VRTOTALLIQUIDO'];

        //POSICACAO ESTOQUE ANTERIOR
        qtdEstoqueAnterior = respostaListaVendasPeriodoConsolidado.data[i]['posicaoEstoqueAnterior']['QTDESTOQUE'];
        qtdVendasAnterior = respostaListaVendasPeriodoConsolidado.data[i]['posicaoVendasAnterior']['QTDVENDAS'];
        qtdVouchersAnterior = respostaListaVendasPeriodoConsolidado.data[i]['posicaoVouchersAnterior']['QTDVOUCHERS'];
        totalEstoqueAterior = (parseInt(qtdEstoqueAnterior) - parseInt(qtdVendasAnterior)) + parseInt(qtdVouchersAnterior);

        //POSICAO ESTOQUE DATA
        qtdEstoqueData = respostaListaVendasPeriodoConsolidado.data[i]['posicaoEstoqueAtual']['QTDESTOQUE'];
        qtdVouchersData = respostaListaVendasPeriodoConsolidado.data[i]['posicaoVouchersAtual']['QTDVOUCHERS'];
        totalEstoqueData = parseInt(qtdEstoqueData) + parseInt(qtdVouchersData);
        
        qtdPosicionamento = (parseInt(totalEstoqueAterior) + parseInt(totalEstoqueData) - parseInt(qtdVenda));
        
        vlPrecoMedioCusto = parseFloat(vlTotalCustoProduto).toFixed(2) / parseInt(qtdVenda);
        vlPrecoMedioVenda = parseFloat(vlTotalLiquidoProduto).toFixed(2) / parseInt(qtdVenda);
        estoquePrecoVenda = parseFloat(vlPrecoMedioVenda).toFixed(2) * parseInt(qtdPosicionamento);
        estoquePrecoCusto = parseFloat(vlPrecoMedioCusto).toFixed(2) * parseInt(qtdPosicionamento);
        marckupProduto = ((parseFloat(vlTotalLiquidoProduto) / parseFloat(vlTotalCustoProduto)) - 1)*100;

        percEstoquePrecoVenda = ((parseFloat(estoquePrecoVenda) * 100)/parseFloat(totalEstoquePrecoVenda));
        percPrecoVenda = ((parseFloat(vlTotalLiquidoProduto) * 100)/parseFloat(totalPrecoVenda))
        indicadorMarckupProduto = ((parseFloat(marckupProduto)/100)); 

        qtdDiasPesquisados =  respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['DIASPESQUISADOS'];
        mediaVendas = parseInt(qtdVenda) / parseInt(qtdDiasPesquisados);
        cobertura = parseInt(qtdPosicionamento) / parseInt(mediaVendas);


            dataRetorno.push( [contador,
                            dsGrupoEmpresarial,
                            dsGrupo,
                            dsSubGrupo,
                            qtdPosicionamento,
                            qtdVenda,
                            parseFloat(estoquePrecoVenda).toFixed(2),
                            parseFloat(estoquePrecoCusto).toFixed(2),
                            parseFloat(indicadorMarckupProduto).toFixed(2),
                            parseFloat(percEstoquePrecoVenda).toFixed(2),
                            parseFloat(vlTotalLiquidoProduto).toFixed(2),
                            parseFloat(percPrecoVenda).toFixed(2),
                            //parseFloat(vlPrecoMedioCusto).toFixed(2),
                            //parseFloat(vlPrecoMedioVenda).toFixed(2),
                            parseInt(cobertura)
                        ])
    }
    
    //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
    //chamarProximaListaVendas_posicionamento_estoque(numPageAtual + 1); 
    
    
    $('#resultado').html(
    `<table id="dt-basic-venda-consolidada" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
        <thead class="bg-primary-600">
            <tr>
                <th>#</th>
                <th>Grupo Empresarial</th>
                <th>Grupo</th>
                <th>SubGrupo</th>
                <th>Qtd. Peças Estoque</th>
                <th>Qtd. Peças Vendidas</th>
                <th>Estoque PV(R$)</th>
                <th>Estoque PC(R$)</th>
                <th>Markup 1</th>
                <th>(%)Estoque</th>
                <th>Venda(R$)</th>
                <th>(%)Venda</th>
                <th>Cobertura</th>
            </tr>
        </thead>
        <tbody id="resultadoVendaMarcaPeriodoConsolidado">
        </tbody>
        <tfoot id="totalResultadoVendaMarcaPeriodoConsolidado"class="thead-themed">
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
                
        </tfoot>
    </table>`
);

$('#dt-basic-venda-consolidada').DataTable( {
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RELATÓRIO PRODUTO PRECO ESTOQUE LOJA
function ListaRelatorioProdutoPrecoEstoqueLoja(){
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
        	$("#idgrupograde").select2();
        	$("#idgrade").select2();
        	$("#idforn").select2(); 
        	$("#idmarcaproduto").select2(); 
        	
        	 $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Relatório das Vendas - <span class='fw-300'></span>`);
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);
        
        	ajaxGet('api/comercial/empresa.xsjs')
            	.then(retornoListaEmpresasSelect)
            	.catch(funcError);	
            	
            ajaxGet('api/comercial/fornecedor-produto.xsjs')
            	.then(retornoListaFornecedor)
            	.catch(funcError);	
            	
        	ajaxGet('api/comercial/grupo-produto.xsjs')
            	.then(retornoListaGrupo)
            	.catch(funcError);
            	
    		ajaxGet('api/comercial/subgrupo-produto.xsjs')
        	    .then(retornoListaSubGrupo)
        	    .catch(funcError);
        	    
    	    ajaxGet('api/comercial/marca-produto.xsjs')
        	    .then(retornoListaMarca)
        	    .catch(funcError);
        	    
        	// EVENTOS SELECT`S 
        	var $eventSelectGrupo = $("#idgrupograde");
            $eventSelectGrupo.on("change", function (e) { pesqListaSubGrupoPorGrupo(); });
            var $eventSelectSubGrupo = $("#idgrade");
            $eventSelectSubGrupo.on("change", function (e) { pesqListaMarcaPorSubGrupo(); });
            var $eventSelectMarca = $("#idmarcaproduto");
            $eventSelectMarca.on("change", function (e) { pesqListaFornecedorPorMarca(); });
            
            
      }
    };
    xmlhttp.open("GET", "comercial_action_list_estoque_preco_produto_grupo_subgrupo.html", true);
    xmlhttp.send();
}
function pesq_produtos_estoques_preco_loja(numPage){
    dataRetorno=[];
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var vlPrecoProduto = $("#vlProduto").val().replace(",", ".");
  
    var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
    if(IDLojaPesqVenda.length === 0){
        Swal.fire({
            type: "warning",
            title: 'Favor selecionar a Empresa!',
            showConfirmButton: true,
            timer: 15000
        });
        return;
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/comercial/produtos-precos-estoques-lojas.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto=' + IDMarca + '&vlPreco='+vlPrecoProduto)
        	.then(retornoListaProdutos_estoques_preco_loja)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaProdutos_estoques_preco_loja(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    //var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var vlPrecoProduto = $("#vlProduto").val().replace(",", ".");
  	var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });
    
        ajaxGet('api/comercial/produtos-precos-estoques-lojas.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto=' + IDMarca + '&vlPreco='+vlPrecoProduto)
        .then(retornoListaProdutos_estoques_preco_loja)
        .catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaProdutos_estoques_preco_loja(respostaListaProdutosPeriodoConsolidado) {
                    
    var numPageAtual = parseInt(respostaListaProdutosPeriodoConsolidado.page);
    if(respostaListaProdutosPeriodoConsolidado.data.length != 0){
        for (var i=0; i < respostaListaProdutosPeriodoConsolidado.data.length; i++) { 
            contador ++;
           
            idEmpresa = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['IDEMPRESA'];
            noEmpresa = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['NOEMPRESA'];
            noGrupo = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['GRUPO'];
            idSubGrupo = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['IDSUBGRUPO'];
            dsSubGrupo = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['DSSUBGRUPO'];
            idProduto = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['IDPRODUTO'];
            dsNome = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['DSNOME'];
            nuCodBarras = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['NUCODBARRAS'];
            vlPrecoCusto = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['PRECOCUSTO'];
            vlPrecoVenda = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['PRECOVENDA'];
            qtdEntrada = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['QTDENTRADA'];
            qtdSaida = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['QTDSAIDA'];
            qtdVendido = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['QTDVENDIDO'];
            qtdDevolvido = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['QTDDEVOLVIDO'];
            qtdEstoque = respostaListaProdutosPeriodoConsolidado.data[i]['produto']['QTDESTOQUE'];

            
            

                dataRetorno.push( [contador,
                                    noEmpresa,
                                    noGrupo,
                                    dsSubGrupo,
                                    nuCodBarras,
                                    dsNome,
                                    vlPrecoCusto,
                                    vlPrecoVenda,
                                    qtdEntrada,
                                    qtdSaida,
                                    qtdDevolvido,
                                    qtdVendido,
                                    qtdEstoque
                                
                            ])
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
       chamarProximaListaProdutos_estoques_preco_loja(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-consolidada" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>#</th>
                        <th>Loja</th>
                        <th>Grupo</th>
                        <th>SubGrupo</th>
                        <th>Cód. Barras</th>
                        <th>Produto</th>
                        <th>Preço Custo(R$)</th>
                        <th>Preço Venda(R$)</th>
                        <th>Qtd. Entrada</th>
                        <th>Qtd. Saída</th>
                        <th>Qtd. Troca(Ent.)</th>
                        <th>Qtd. Venda(Saída)</th>
                        <th>Qtd. Estoque</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaPeriodoConsolidado">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaPeriodoConsolidado"class="thead-themed">
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
                        
                        
                </tfoot>
            </table>`
        );
	   
	    $('#dt-basic-venda-consolidada').DataTable( {
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

}




///////////////// METAS POR PERIODO ///////////////////////

function ListaMetasPeriodo(){

    dataRetornoListaMetas = [];
    numPage = 1;
    contador = 0;
    
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

        	$("#idmarca").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Metas - <span class='fw-300'></span>`);
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);
        		
        	ajaxGetComAnimacaoDeCarregamento(`api/comercial/lista-meta-vendas.xsjs?page=${numPage}`, "Carregando Dados, aguarde...", retornoListaMetasGrupo, "Erro ao Carregar os Dados");

      }
    };
    xmlhttp.open("GET", "comercial_action_metas.html", true);
    xmlhttp.send();
}

function chamarProximaListaMetasGrupo(numPage){

    ajaxGetComAnimacaoDeCarregamento(`api/comercial/lista-meta-vendas.xsjs?page=${numPage}`, "Carregando Dados, aguarde...", retornoListaMetasGrupo, "Erro ao Carregar os Dados");

}

function retornoListaMetasGrupo(respostaListaMetasGrupo) {

  var numPageAtual = parseInt(respostaListaMetasGrupo.page);

  if (respostaListaMetasGrupo.data.length != 0) {
    for (var i = 0; i < respostaListaMetasGrupo.data.length; i++) {
        contador++;
        idGrupoEmpresa = respostaListaMetasGrupo.data[i]['IDGRUPOEMPRESA'];
        dataIniMetaFormat = respostaListaMetasGrupo.data[i]['DTMETAINICIOFORMAT'];
        dataFimMetaFormat = respostaListaMetasGrupo.data[i]['DTMETAFIMFORMAT'];
        dataIniMeta = respostaListaMetasGrupo.data[i]['DTMETAINICIO'];
        dataFimMeta = respostaListaMetasGrupo.data[i]['DTMETAFIM'];
        DsGrupoEmpresa = respostaListaMetasGrupo.data[i]['DSSUBGRUPOEMPRESARIAL'];
        StAtivoMeta = respostaListaMetasGrupo.data[i]['STATIVO'];
        StSalvoMeta = respostaListaMetasGrupo.data[i]['STSALVO'];

        if(StAtivoMeta == 'True'){
            labelstmetas = `<label style="color: blue; font-size: 10px;">ATIVO</label>`;
        }else{
            labelstmetas = `<label style="color: red; font-size: 10px;">INATIVO</label>`;
        }
        
        if(StSalvoMeta == 'True'){
            labelstmetassalva = `<label style="color: blue; font-size: 10px;">SALVO</label>`;
        }else{
            labelstmetassalva = `<label style="color: red; font-size: 10px;">NÃO SALVO</label>`;
        }
            
        btnOpcao = `<div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-success btn-xs" title="Metas Resumida" id="` + idGrupoEmpresa + `" onclick="pesq_res_metas_lojas(this.id,dataIniMeta,dataFimMeta)" ><i class="fal fa-eye"></i></button>
                        <button type="button" class="btn btn-info btn-xs" title="Metas Detalhada" id="` + idGrupoEmpresa + `" onclick="pesq_det_metas_lojas(this.id,dataIniMeta,dataFimMeta)" ><i class="fal fa-eye"></i></button>
                        <button type="button" class="btn btn-danger btn-xs" title="Excluir Metas" id="` + idGrupoEmpresa + `" onclick="del_metas_lojas(this.id,dataIniMeta,dataFimMeta)" ><i class="fal fa-trash"></i></button>
                    </div>`;
              
            dataRetornoListaMetas.push([
                contador,
                DsGrupoEmpresa,
                dataIniMetaFormat,
                dataFimMetaFormat,
                labelstmetassalva,
                btnOpcao]);

    }
    
    chamarProximaListaMetasGrupo(numPageAtual + 1);

  } else {
      
    $('#resultado').html(
      `<table id="dt-basic-lista-metas" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                  <tr>
                      <th>*</th>
                      <th>Grupo</th>
                      <th>Data Inicio</th>
                      <th>Data Fim</th>
                      <th>Situação</th>
                      <th>Opção</th>
                  </tr>
              </thead>
              <tbody id="resultadoListaMetas">
              </tbody>
              <tfoot id="totalListaListaMetas"class="thead-themed">
              </tfoot>
          </table>`
    );

    $('#dt-basic-lista-metas').DataTable({
      data: dataRetornoListaMetas,
      deferRender: true,
      //scrollY:        800,
      //scrollCollapse: false,
      //scroller:       false,
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
    });

  }

}

function del_metas_lojas(idMarca,dtini,dtfim) {

  let status = 'False';
  
  Swal.fire({
		title: 'Certeza que Deseja Cancelar essa Meta ?',
		text: "Você não poderá reverter esta ação!",
		buttonsStyling: false,
		showCancelButton: true,
		customClass: {
		  confirmButton: 'btn btn-primary btn-lg',
		  cancelButton: 'btn btn-danger btn-lg',
		  loader: 'custom-loader'
		},
		loaderHtml: '<div class="spinner-border text-primary"></div>',
		allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
		if (result.dismiss == 'timer') {
		  Swal.fire({
			type: 'error',
			title: `Tempo de resposta ou inatividade atingido`,
			timer: 10000,
		  });
		} else if (result.dismiss == 'cancel' || result.dismiss == 'esc') {
		  return false;
		} else{

			Swal.fire({
			  type:'question',
			  title: 'Motivo do Cancelamento da Meta?',
			  html: `<div>
						  <div class=" input-group pt-0" >
							  <input type="text" id="motivoCancelMeta" class="swal2-input m-0 " placeholder="Motivo do Cancelamento da Meta!" style="text-transform: uppercase">
						  </div>
					  </div>`,
			  width: '25rem',
			  focusConfirm: false,
			  showCancelButton: true,
			  confirmButtonText: 'Confirmar',
			  cancelButtonText: 'Voltar',
			  cancelButtonColor: '#3085d6',
			  showLoaderOnConfirm: true,
			  preConfirm: () => {
				  motivoCancelMeta = $('#motivoCancelMeta').val();
			
				  if (!motivoCancelMeta) {
					  Swal.showValidationMessage(`Coloque o Motivo da Cancelamento da Meta!`);
					  $('#motivoCancelMeta').focus();
					  return false;
			
				  } else if (motivoCancelMeta.length < 10) {
					  Swal.showValidationMessage(`Motivo Muito Curto, O Motivo Deve Conter no Minímo 10 e no máximo 200 Caracteres!`)
					  $('#motivoCancelMeta').val('').focus();
					  return false;
			
				  } else {
					  
						
				  }
			  }
			}).then((result) => {
					
				if (result.dismiss == 'timer') {
				
				  Swal.fire({
					  type: 'error',
					  title: `Tempo de resposta ou inatividade atingido`,
					  timer: 60000,
				  })
				} else if (result.dismiss == 'cancel' || result.dismiss == 'esc') {
				  return false;
				} else{
					let barraCarregamento = `<div id="BarraCarregamento" class="progress">
											  <div  class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>
										  </div>`

					Swal.fire({
					  html: barraCarregamento,
					  type: 'info',
					  title: 'Carregando Dados...Aguarde!',
					  timer: 180000,
					  backdrop: false,
					  allowEscapeKey: false,
					  allowOutsideClick: false,
					  onOpen: async () => {
						  Swal.showLoading();
						  
							let dados = {
								"IDGRUPOEMPRESA": parseInt(idMarca),
								"DSMOTIVOCANCELAMENTO": motivoCancelMeta.toString(),
								"DTMETAINICIO": dtini,
								"DTMETAFIM": dtfim,
								"STATIVO":status
							};
					
						  await ajaxPut("api/comercial/del-metas.xsjs", dados)
								.then((respostaPut)=>{
									   Swal.close();
									   funcSucessCancelaMetas();                                    
									})
								.catch(funcError);
					
					  }
					}).then((result) => {
					  if (result.dismiss == "timer") {
						  Swal.close();
					
						  Swal.fire({
							  type: 'error',
							  title: "Erro ao carregar os dados, recarregue a página e tente novamente",
							  timer: 15000,
						  });
						  return false;
					  }
					})
					
					  let animacaoBarra = setInterval(() => {
					  let barra = $($('.pace-progress')[0]).attr('data-progress')
					  let barra2 = $($('.pace-progress')[0]).attr('data-progress-text')
					
					  $('#BarraCarregamento').html(`
						  <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="${barra}" aria-valuemin="0" aria-valuemax="100" style="width: ${barra}%">${barra}%</div>
						  `)
					}, 700)
				}
			})
		}
	})
			 
}

function funcSucessCancelaMetas(resposta) {

Swal.fire({
  type: "success",
  title: "Metas Excluídas com Sucesso ",
  showConfirmButton: false,
  timer: 2000
});

ListaMetasPeriodo();

}

function pesq_vendas_marcas_base(numPage){
    
    dataRetornoMetaMarca=[];
    contador = 0;
    vrVendaMeta = 0;
    
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
        //newDataTable();
        
        $('.dataAtual').text(dataAtual);

        ajaxGetComAnimacaoDeCarregamento(`api/comercial/meta-vendas-por-estrutura.xsjs?idMarca=${IDMarcaPesqVenda}&dataInicio=${datapesqinicio}&dataFim=${datapesqfim}`, "Carregando Dados, aguarde...", retornoListaVendaMarcaMeta, "Erro ao Carregar os Dados");

      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasmarcameta.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendaMarcaMeta(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
    ajaxGetComAnimacaoDeCarregamento(`api/comercial/meta-vendas-por-estrutura.xsjs?page=${numPage}&idMarca=${IDMarcaPesqVenda}&dataInicio=${datapesqinicio}&dataFim=${datapesqfim}`, "Carregando Dados, aguarde...", retornoListaVendaMarcaMeta, "Erro ao Carregar os Dados");

}

function retornoListaVendaMarcaMeta(respostaListaVendaMarcaMeta) {

    var numPageAtual = parseInt(respostaListaVendaMarcaMeta.page);
    
    if(respostaListaVendaMarcaMeta.data.length != 0){
    
        for (var i=0; i < respostaListaVendaMarcaMeta.data.length; i++) {
            
            VrVendaFEMVerao = 0;
            VrVendaFEMInverno = 0;
            VrVendaFEMAcessorios = 0;
            VrVendaFEMPCIntimas = 0;
            VrVendaFEMVeraoInverno = 0;
            percVendaFEMVeraoInverno = 0;
            percVendaFEMPCIntimas = 0;
            percVendaFEMAcessorios = 0;
            
            VrVendaMASCVerao = 0;
            VrVendaMASCInverno = 0;
            VrVendaMASCAcessorios = 0;
            VrVendaMASCPCIntimas = 0;
            VrVendaMASCVeraoInverno = 0;
            percVendaMASCVeraoInverno = 0;
            percVendaMASCPCIntimas = 0;
            percVendaMASCAcessorios = 0;
            
            VrVendaINFANTVerao = 0;
            VrVendaINFANTInverno = 0;
            VrVendaINFANTAcessorios = 0;
            VrVendaINFANTPCIntimas = 0;
            VrVendaINFANTVeraoInverno = 0;
            percVendaINFANTVeraoInverno = 0;
            percVendaINFANTPCIntimas = 0;
            percVendaINFANTAcessorios = 0;
            
            vrVendaCALCADOMeta = 0;
            percVendaCALCADO = 0;   
            
            vrVendaOUTROSMeta = 0;
            percVendaOUTROS = 0;
            
            VrVendaCMB = 0;
            percVendaCMB = 0;
            
            TotalPercente = 0;
            TotalMetaPercente =0;
        
            contador ++;
            
            var vrzerado = 0;
            var idEmpresaMeta = respostaListaVendaMarcaMeta.data[i].vendaTotalMarca['IDEMPRESA'];
            var noEmpresaMeta = respostaListaVendaMarcaMeta.data[i].vendaTotalMarca['NOFANTASIA'];
            var vrVendaMeta = parseFloat(respostaListaVendaMarcaMeta.data[i].vendaTotalMarca['VRTOTALLIQUIDO']);
            
            for (var j = 0; j < respostaListaVendaMarcaMeta.data[i].vendasecaofeminina.length; j++) {
                
                var noGrupoFemininoMeta = respostaListaVendaMarcaMeta.data[i].vendasecaofeminina[j]['venda-feminina']['GRUPOFEMININO'];
                var vrVendaFemininoMeta = parseFloat(respostaListaVendaMarcaMeta.data[i].vendasecaofeminina[j]['venda-feminina']['VRTOTALLIQUIDOFEMININO']);
                
    
                if(noGrupoFemininoMeta === 'Verão'){
                    VrVendaFEMVerao = parseFloat(VrVendaFEMVerao) + parseFloat(vrVendaFemininoMeta);
                    
                }
                if(noGrupoFemininoMeta === 'Inverno'){
                    VrVendaFEMInverno = parseFloat(VrVendaFEMInverno) + parseFloat(vrVendaFemininoMeta);
                    
                }
                if(noGrupoFemininoMeta === 'Acessórios'){
                    VrVendaFEMAcessorios = parseFloat(VrVendaFEMAcessorios) + parseFloat(vrVendaFemininoMeta);
                    
                }
                if(noGrupoFemininoMeta === 'Peças Íntimas'){
                    VrVendaFEMPCIntimas = parseFloat(VrVendaFEMPCIntimas) + parseFloat(vrVendaFemininoMeta);
                    
                }
    
                VrVendaFEMVeraoInverno = parseFloat(VrVendaFEMVerao) + parseFloat(VrVendaFEMInverno);
            }
            
            for (var j = 0; j < respostaListaVendaMarcaMeta.data[i].vendasecaomasculina.length; j++) {
                
                var noGrupoMasculinoMeta = respostaListaVendaMarcaMeta.data[i].vendasecaomasculina[j]['venda-masculina']['GRUPOMASCULINO'];
                var vrVendaMasculinoMeta = parseFloat(respostaListaVendaMarcaMeta.data[i].vendasecaomasculina[j]['venda-masculina']['VRTOTALLIQUIDOMASCULINO']);
                
    
                if(noGrupoMasculinoMeta === 'Verão'){
                    VrVendaMASCVerao = parseFloat(VrVendaMASCVerao) + parseFloat(vrVendaMasculinoMeta);
                    
                }
                if(noGrupoMasculinoMeta === 'Inverno'){
                    VrVendaMASCInverno = parseFloat(VrVendaMASCInverno) + parseFloat(vrVendaMasculinoMeta);
                    
                }
                if(noGrupoMasculinoMeta === 'Acessórios'){
                    VrVendaMASCAcessorios = parseFloat(VrVendaMASCAcessorios) + parseFloat(vrVendaMasculinoMeta);
                    
                }
                if(noGrupoMasculinoMeta === 'Peças Íntimas'){
                    VrVendaMASCPCIntimas = parseFloat(VrVendaMASCPCIntimas) + parseFloat(vrVendaMasculinoMeta);
                    
                }
    
                VrVendaMASCVeraoInverno = parseFloat(VrVendaMASCVerao) + parseFloat(VrVendaMASCInverno);
            }
            
            for (var j = 0; j < respostaListaVendaMarcaMeta.data[i].vendasecaoinfantil.length; j++) {
                
                var noGrupoInfantilMeta = respostaListaVendaMarcaMeta.data[i].vendasecaoinfantil[j]['venda-infantil']['GRUPOINFANTIL'];
                var vrVendaInfantilMeta = parseFloat(respostaListaVendaMarcaMeta.data[i].vendasecaoinfantil[j]['venda-infantil']['VRTOTALLIQUIDOINFANTIL']);
                
    
                if(noGrupoInfantilMeta === 'Verão'){
                    VrVendaINFANTVerao = parseFloat(VrVendaINFANTVerao) + parseFloat(vrVendaInfantilMeta);
                    
                }
                if(noGrupoInfantilMeta === 'Inverno'){
                    VrVendaINFANTInverno = parseFloat(VrVendaINFANTInverno) + parseFloat(vrVendaInfantilMeta);
                    
                }
                if(noGrupoInfantilMeta === 'Acessórios'){
                    VrVendaINFANTAcessorios = parseFloat(VrVendaINFANTAcessorios) + parseFloat(vrVendaInfantilMeta);
                    
                }
                if(noGrupoInfantilMeta === 'Peças Íntimas'){
                    VrVendaINFANTPCIntimas = parseFloat(VrVendaINFANTPCIntimas) + parseFloat(vrVendaInfantilMeta);
                    
                }
    
                VrVendaINFANTVeraoInverno = parseFloat(VrVendaINFANTVerao) + parseFloat(VrVendaINFANTInverno);
            }
            
            for (var j = 0; j < respostaListaVendaMarcaMeta.data[i].vendasecaocalcados.length; j++) {
                
                var vrVendaCALCADOMeta = parseFloat(respostaListaVendaMarcaMeta.data[i].vendasecaocalcados[j]['venda-calcados']['VRTOTALLIQUIDOCALC']);

            }
            
            for (var j = 0; j < respostaListaVendaMarcaMeta.data[i].vendasecaocmb.length; j++) {
                
                var noGrupoCMBMeta = respostaListaVendaMarcaMeta.data[i].vendasecaocmb[j]['venda-cmb']['GRUPOCMB'];
                var vrVendaCMBMeta = parseFloat(respostaListaVendaMarcaMeta.data[i].vendasecaocmb[j]['venda-cmb']['VRTOTALLIQUIDOCMB']);
    
                    VrVendaCMB = parseFloat(VrVendaCMB) + parseFloat(vrVendaCMBMeta);

            }
            
            for (var j = 0; j < respostaListaVendaMarcaMeta.data[i].vendasecaooutros.length; j++) {
                
                var vrVendaOUTROSMeta = parseFloat(respostaListaVendaMarcaMeta.data[i].vendasecaooutros[j]['venda-outros']['VRTOTALLIQUIDOPUTROS']);

            }
            
                percVendaFEMVeraoInverno = (parseFloat(VrVendaFEMVeraoInverno) * 100) / parseFloat(vrVendaMeta);
                percVendaFEMPCIntimas = (parseFloat(VrVendaFEMPCIntimas) * 100) / parseFloat(vrVendaMeta);
                percVendaFEMAcessorios = (parseFloat(VrVendaFEMAcessorios) * 100) / parseFloat(vrVendaMeta);
                
                percVendaMASCVeraoInverno = (parseFloat(VrVendaMASCVeraoInverno) * 100) / parseFloat(vrVendaMeta);
                percVendaMASCPCIntimas = (parseFloat(VrVendaMASCPCIntimas) * 100) / parseFloat(vrVendaMeta);
                percVendaMASCAcessorios = (parseFloat(VrVendaMASCAcessorios) * 100) / parseFloat(vrVendaMeta);
                
                percVendaINFANTVeraoInverno = (parseFloat(VrVendaINFANTVeraoInverno) * 100) / parseFloat(vrVendaMeta);
                percVendaINFANTPCIntimas = (parseFloat(VrVendaINFANTPCIntimas) * 100) / parseFloat(vrVendaMeta);
                percVendaINFANTAcessorios = (parseFloat(VrVendaINFANTAcessorios) * 100) / parseFloat(vrVendaMeta);
                
                percVendaCALCADO = (parseFloat(vrVendaCALCADOMeta) * 100) / parseFloat(vrVendaMeta);
                
                percVendaOUTROS = (parseFloat(vrVendaOUTROSMeta) * 100) / parseFloat(vrVendaMeta);
                
                percVendaCMB = (parseFloat(VrVendaCMB) * 100) / parseFloat(vrVendaMeta);
                
                TotalPercente = parseFloat(percVendaCALCADO)+parseFloat(percVendaFEMVeraoInverno)+parseFloat(percVendaFEMPCIntimas)+parseFloat(percVendaFEMAcessorios)+parseFloat(percVendaMASCVeraoInverno)+parseFloat(percVendaMASCPCIntimas)+parseFloat(percVendaMASCAcessorios)+parseFloat(percVendaINFANTVeraoInverno)+parseFloat(percVendaINFANTPCIntimas)+parseFloat(percVendaINFANTAcessorios)+parseFloat(percVendaCMB)+parseFloat(percVendaOUTROS);

                dataRetornoMetaMarca.push([
                  `<label style="color: blue; font-size: 11px;">` + contador + `</label>`,
                  `<input type="text" id="IDEmpresaMeta_` + contador + `" class="form-control"  value="` + noEmpresaMeta + `" readonly></input>`,
                  `<input type="text" id="VRMetaVenda_` + contador + `" class="form-control" value="` + mascaraValor(vrVendaMeta.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCMeta_` + contador + `" class="form-control" value="0" onchange="atualiza_Metas_Geral_Valor(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="VRMeta_` + contador + `" class="form-control" value="0" onchange="atualiza_Metas_Geral_Perc(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaCalcado_` + contador + `" class="form-control" value="` + mascaraValor(vrVendaCALCADOMeta.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaCalcado_` + contador + `" class="form-control" value="` + mascaraValor(percVendaCALCADO.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaCalcado_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_Calcado(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaCalcado_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_Calcado(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaFemVeraoInv_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaFEMVeraoInverno.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaFemVeraoInv_` + contador + `" class="form-control" value="` + mascaraValor(percVendaFEMVeraoInverno.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaFemVeraoInv_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_FemVeraoInv(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaFemVeraoInv_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_FemVeraoInv(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaFemIntimo_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaFEMPCIntimas.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaFemIntimo_` + contador + `" class="form-control" value="` + mascaraValor(percVendaFEMPCIntimas.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaFemIntimo_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_FemIntimo(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaFemIntimo_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_FemIntimo(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaFemAcess_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaFEMAcessorios.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaFemAcess_` + contador + `" class="form-control" value="` + mascaraValor(percVendaFEMAcessorios.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaFemAcess_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_FemAcess(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaFemAcess_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_FemAcess(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaMascVeraoInv_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaMASCVeraoInverno.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaMascVeraoInv_` + contador + `" class="form-control" value="` + mascaraValor(percVendaMASCVeraoInverno.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaMascVeraoInv_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_MascVeraoInv(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaMascVeraoInv_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_MascVeraoInv(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaMascIntimo_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaMASCPCIntimas.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaMascIntimo_` + contador + `" class="form-control" value="` + mascaraValor(percVendaMASCPCIntimas.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaMascIntimo_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_MascIntimo(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaMascIntimo_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_MascIntimo(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaMascAcess_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaMASCAcessorios.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaMascAcess_` + contador + `" class="form-control" value="` + mascaraValor(percVendaMASCAcessorios.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaMascAcess_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_MascAcess(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaMascAcess_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_MascAcess(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaInfantVeraoInv_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaINFANTVeraoInverno.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaInfantVeraoInv_` + contador + `" class="form-control" value="` + mascaraValor(percVendaINFANTVeraoInverno.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaInfantVeraoInv_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_InfantVeraoInv(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaInfantVeraoInv_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_InfantVeraoInv(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaInfantIntimo_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaINFANTPCIntimas.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaInfantIntimo_` + contador + `" class="form-control" value="` + mascaraValor(percVendaINFANTPCIntimas.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaInfantIntimo_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_InfantIntimo(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaInfantIntimo_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_InfantIntimo(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaInfantAcess_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaINFANTAcessorios.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaInfantAcess_` + contador + `" class="form-control" value="` + mascaraValor(percVendaINFANTAcessorios.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaInfantAcess_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_InfantAcess(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaInfantAcess_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_InfantAcess(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaCMB_` + contador + `" class="form-control" value="` + mascaraValor(VrVendaCMB.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaCMB_` + contador + `" class="form-control" value="` + mascaraValor(percVendaCMB.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="VRMetaCMB_` + contador + `" class="form-control" value="0" onchange="atualiza_Valor_Metas_CMB(this.id);" onKeyUp="mascaraMoeda(this, event)"></input>`,
                  `<input type="text" id="PCMetaCMB_` + contador + `" class="form-control" value="0" onchange="atualiza_Percent_Metas_CMB(this.id);"  onKeyUp="mascaraMoeda(this, event)"></input>`,
                  
                  `<input type="text" id="VRVendaOUTROS_` + contador + `" class="form-control" value="` + mascaraValor(vrVendaOUTROSMeta.toFixed(2)) + `" readonly></input>`,
                  `<input type="text" id="PCVendaOUTROS_` + contador + `" class="form-control" value="` + mascaraValor(percVendaOUTROS.toFixed(2)) + `" readonly></input>`,
                  
                  `<input type="text" id="PCTotal_` + contador + `" class="form-control" value="` + mascaraValor(TotalPercente.toFixed(2)) + `" readonly></input>`,
                 
                ]);

        }
        
        //chamarProximaListaVendaMarcaMeta(numPageAtual + 1);
    }
    
    if(numPageAtual === 1){
         $('#resultado').html(
            `<table id="dt-basic-venda-meta" class="table table-bordered table-hover">
                <thead class="bg-primary-600">
                    <tr>
                        <td class="bg-primary-400" colspan="5" style="font-size: 12px; text-align:center">VENDAS / META GERAL</td>
                        <td class="bg-warning-200" colspan="4" style="font-size: 12px; text-align:center">CALÇADOS</td>
                        <td class="bg-danger-200" colspan="12" style="font-size: 12px; text-align:center">SEÇÃO FEMININA</td>
                        <td class="bg-info-200" colspan="12" style="font-size: 12px; text-align:center">SEÇÃO MASCULINA</td>
                        <td class="bg-success-200" colspan="12" style="font-size: 12px; text-align:center">SEÇÃO INFANTIL</td>
                        <td class="bg-primary-200" colspan="4" style="font-size: 12px; text-align:center">CMB</td>
                        <td class="bg-danger-200" colspan="2" style="font-size: 12px; text-align:center">Outros</td>
                        <td class="bg-warning-200" style="font-size: 12px; text-align:center">Total</td>
                    </tr>
                    <tr>
                        <th class="bg-primary-400">#</th>
                        <th class="bg-primary-400">Empresa</th>
                        <th class="bg-primary-400">Venda</th>
                        <th class="bg-primary-400">% Meta</th>
                        <th class="bg-primary-400">Vr Meta</th>
                        
                        <th class="bg-warning-200">Geral</th>
                        <th class="bg-warning-200">%</th>
                        <th class="bg-warning-400">Vr Meta</th>
                        <th class="bg-warning-400">%</th>
                        
                        <th class="bg-danger-200">Verão/Inverno</th>
                        <th class="bg-danger-200">%</th>
                        <th class="bg-danger-400">Vr Meta</th>
                        <th class="bg-danger-400">%</th>
                        <th class="bg-danger-200">Peça Intima</th>
                        <th class="bg-danger-200">%</th>
                        <th class="bg-danger-400">Vr Meta</th>
                        <th class="bg-danger-400">%</th>
                        <th class="bg-danger-200">Acessórios</th>
                        <th class="bg-danger-200">%</th>
                        <th class="bg-danger-400">Vr Meta</th>
                        <th class="bg-danger-400">%</th>
                        
                        <th class="bg-info-200">Verão/Inverno</th>
                        <th class="bg-info-200">%</th>
                        <th class="bg-info-400">Vr Meta</th>
                        <th class="bg-info-400">%</th>
                        <th class="bg-info-200">Peça Intima</th>
                        <th class="bg-info-200">%</th>
                        <th class="bg-info-400">Vr Meta</th>
                        <th class="bg-info-400">%</th>
                        <th class="bg-info-200">Acessórios</th>
                        <th class="bg-info-200">%</th>
                        <th class="bg-info-400">Vr Meta</th>
                        <th class="bg-info-400">%</th>
                        
                        <th class="bg-success-200">Verão/Inverno</th>
                        <th class="bg-success-200">%</th>
                        <th class="bg-success-400">Vr Meta</th>
                        <th class="bg-success-400">%</th>
                        <th class="bg-success-200">Peça Intima</th>
                        <th class="bg-success-200">%</th>
                        <th class="bg-success-400">Vr Meta</th>
                        <th class="bg-success-400">%</th>
                        <th class="bg-success-200">Acessórios</th>
                        <th class="bg-success-200">%</th>
                        <th class="bg-success-400">Vr Meta</th>
                        <th class="bg-success-400">%</th>
                        
                        <th class="bg-primary-200">CMB</th>
                        <th class="bg-primary-200">%</th>
                        <th class="bg-primary-400">Vr Meta</th>
                        <th class="bg-primary-400">%</th>
                        
                        <th class="bg-danger-200">Outros</th>
                        <th class="bg-danger-200">%</th>
                        
                        <th class="bg-warning-400">%</th>
                        
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaMeta">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaMeta"class="thead-themed">
                </tfoot>
            </table>`
        );

        $('#dt-basic-venda-meta').DataTable( {
            
            data: dataRetornoMetaMarca,
            "columnDefs": [
              { "width": "5px", "targets": 0 },
              { "width": "180px", "targets": 1 },
              { "width": "95px", "targets": [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51] }
          ],
            deferRender: false,
            lengthChange: false,
            //displayLength: 100,
            ordering:  false,
            paging: false,
            searching: false,
            //scrollY:        800,
            scrollCollapse: false,
            //scroller:       false,
            scrollX: true,
            autowidth: false,
            responsive: false,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",

            buttons: [
                        {
                            text: 'Salvar Metas',
                            titleAttr: 'Incluir Todas as Metas das Lojas',
                            className: 'btn-outline-success btn-sm mr-1',
                            action: function () {
                                Cadastrar_Metas_Lojas();
                            }
                        }
                        /*
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
                         */
                    ] 
        } );
        
    }

}

String.prototype.reverse = function(){
  return this.split('').reverse().join(''); 
};

function mascaraMoeda(campo,evento){
  var tecla = (!evento) ? window.event.keyCode : evento.which;
  var valor  =  campo.value.replace(/[^\d]+/gi,'').reverse();
  var resultado  = "";
  var mascara = "##.###.###,##".reverse();
  for (var x=0, y=0; x<mascara.length && y<valor.length;) {
    if (mascara.charAt(x) != '#') {
      resultado += mascara.charAt(x);
      x++;
    } else {
      resultado += valor.charAt(y);
      y++;
      x++;
    }
  }
  campo.value = resultado.reverse();
}

function conversor(str) {
    if (typeof str == 'number') return str;
    var nr;
    var virgulaSeparaDecimais = str.match(/(,)\d{2}$/);
    if (virgulaSeparaDecimais) nr = str.replace(/\./g, '').replace(',', '.')
    else nr = str.replace(',', '');
    return parseFloat(nr);
}

function atualiza_Metas_Geral_Valor(id) {

  let linha = id.split('_');

  let vrmetavenda = conversor($('#VRMetaVenda_'+linha[1]).val());
  let pcmeta = conversor($('#PCMeta_'+linha[1]).val());

  if(isNaN(pcmeta) ){
      alert('O Percentual não pode ser vazio');
      pcmeta = 0;
      $('#PCMeta_'+linha[1].toString()).val(0);
  }
    
  let novovalormeta = (parseFloat(vrmetavenda) * (parseFloat(pcmeta) / 100)) + parseFloat(vrmetavenda);
  
  $('#VRMeta_'+linha[1].toString()).val(mascaraValor(novovalormeta.toFixed(2)));
  
  atualiza_Metas(id);
    
}

function atualiza_Metas_Geral_Perc(id) {

  let linha = id.split('_');

  let vrmetavenda = conversor($('#VRMetaVenda_'+linha[1]).val());
  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());

  if(isNaN(vrmeta) ){
      alert('O Valor não pode ser vazio');
      vrmeta = 0;
      $('#VRMeta_'+linha[1].toString()).val(0);
  }
    
  let novopercmeta = ((parseFloat(vrmeta) * 100) / parseFloat(vrmetavenda))-100;
  
  $('#PCMeta_'+linha[1].toString()).val(mascaraValor(novopercmeta.toFixed(2)));
  
  atualiza_Metas(id);
    
}

function atualiza_Metas(id) {

  let linha = id.split('_');

  let vrmetavenda = conversor($('#VRMetaVenda_'+linha[1]).val());
  let pcmeta = conversor($('#PCMeta_'+linha[1]).val());
  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  

    //////////// CALÇADOS //////////////////////////////////////////////////////////////////////////////////
    
  let percvendacalcado = $('#PCVendaCalcado_'+linha[1].toString()).val().replace(',', '.');
 
  let novovalormetacalcado = parseFloat(vrmeta) * (parseFloat(percvendacalcado) / 100);
  
  $('#VRMetaCalcado_'+linha[1].toString()).val(mascaraValor(novovalormetacalcado.toFixed(2)));
  
  let novopercmetacalcado = (parseFloat(novovalormetacalcado) * 100) / parseFloat(vrmeta);
  
  if(isNaN(novopercmetacalcado) ){
      novopercmetacalcado = 0;
  }
  
  $('#PCMetaCalcado_'+linha[1].toString()).val(mascaraValor(novopercmetacalcado.toFixed(2)));
  
    //////////// FEMININO - VERAO/INVERNO //////////////////////////////////////////////////////////////////////////////////
    
  let percvendafemveraoinverno = $('#PCVendaFemVeraoInv_'+linha[1].toString()).val().replace(',', '.'); 
  
  let novovalormetafemveraoinverno = parseFloat(vrmeta) * (parseFloat(percvendafemveraoinverno) / 100);
  
  $('#VRMetaFemVeraoInv_'+linha[1].toString()).val(mascaraValor(novovalormetafemveraoinverno.toFixed(2)));
  
  let novopercmetafemveraoinverno = (parseFloat(novovalormetafemveraoinverno) * 100) / parseFloat(vrmeta);
  
    if(isNaN(novopercmetafemveraoinverno) ){
      novopercmetafemveraoinverno = 0;
    }
  
  $('#PCMetaFemVeraoInv_'+linha[1].toString()).val(mascaraValor(novopercmetafemveraoinverno.toFixed(2)));
  
    //////////// FEMININO - INTIMO //////////////////////////////////////////////////////////////////////////////////
    
  let percvendafemintimo = $('#PCVendaFemIntimo_'+linha[1].toString()).val().replace(',', '.'); 
  
  let novovalormetafemintimo = parseFloat(vrmeta) * (parseFloat(percvendafemintimo) / 100);
  
  $('#VRMetaFemIntimo_'+linha[1].toString()).val(mascaraValor(novovalormetafemintimo.toFixed(2)));
  
  let novopercmetafemintimo = (parseFloat(novovalormetafemintimo) * 100) / parseFloat(vrmeta);
    
    if(isNaN(novopercmetafemintimo) ){
      novopercmetafemintimo = 0;
    }
    
  $('#PCMetaFemIntimo_'+linha[1].toString()).val(mascaraValor(novopercmetafemintimo.toFixed(2)));
  
    //////////// FEMININO - ACESSORIOS //////////////////////////////////////////////////////////////////////////////////
    
  let percvendafemacess = $('#PCVendaFemAcess_'+linha[1].toString()).val().replace(',', '.');
  
  let novovalormetafemacess = parseFloat(vrmeta) * (parseFloat(percvendafemacess) / 100);
  
  $('#VRMetaFemAcess_'+linha[1].toString()).val( mascaraValor(novovalormetafemacess.toFixed(2)));
  
  let novopercmetafemacess = (parseFloat(novovalormetafemacess) * 100) / parseFloat(vrmeta);
      
    if(isNaN(novopercmetafemacess) ){
      novopercmetafemacess = 0;
    }
    
  $('#PCMetaFemAcess_'+linha[1].toString()).val( mascaraValor(novopercmetafemacess.toFixed(2)));
  
    //////////// MASCULINO - VERAO/INVERNO //////////////////////////////////////////////////////////////////////////////////
    
  let percvendamascveraoinverno = $('#PCVendaMascVeraoInv_'+linha[1].toString()).val().replace(',', '.'); 
  
  let novovalormetamascveraoinverno = parseFloat(vrmeta) * (parseFloat(percvendamascveraoinverno) / 100);
  
  $('#VRMetaMascVeraoInv_'+linha[1].toString()).val(mascaraValor(novovalormetamascveraoinverno.toFixed(2)));
  
  let novopercmetamascveraoinverno = (parseFloat(novovalormetamascveraoinverno) * 100) / parseFloat(vrmeta);
        
    if(isNaN(novopercmetamascveraoinverno) ){
      novopercmetamascveraoinverno = 0;
    }
    
  $('#PCMetaMascVeraoInv_'+linha[1].toString()).val(mascaraValor(novopercmetamascveraoinverno.toFixed(2)));
  
    //////////// MASCULINO - INTIMO //////////////////////////////////////////////////////////////////////////////////
    
  let percvendamascintimo = $('#PCVendaMascIntimo_'+linha[1].toString()).val().replace(',', '.'); 
  
  let novovalormetamascintimo = parseFloat(vrmeta) * (parseFloat(percvendamascintimo) / 100);
  
  $('#VRMetaMascIntimo_'+linha[1].toString()).val(mascaraValor(novovalormetamascintimo.toFixed(2)));
  
  let novopercmetamascintimo = (parseFloat(novovalormetamascintimo) * 100) / parseFloat(vrmeta);
          
    if(isNaN(novopercmetamascintimo) ){
      novopercmetamascintimo = 0;
    }
    
  $('#PCMetaMascIntimo_'+linha[1].toString()).val(mascaraValor(novopercmetamascintimo.toFixed(2)));
  
    //////////// MASCULINO - ACESSORIOS //////////////////////////////////////////////////////////////////////////////////
    
  let percvendamascacess = $('#PCVendaMascAcess_'+linha[1].toString()).val().replace(',', '.');
  
  let novovalormetamascacess = parseFloat(vrmeta) * (parseFloat(percvendamascacess) / 100);
  
  $('#VRMetaMascAcess_'+linha[1].toString()).val(mascaraValor(novovalormetamascacess.toFixed(2)));
  
  let novopercmetamascacess = (parseFloat(novovalormetamascacess) * 100) / parseFloat(vrmeta);
            
    if(isNaN(novopercmetamascacess) ){
      novopercmetamascacess = 0;
    }
    
  $('#PCMetaMascAcess_'+linha[1].toString()).val(mascaraValor(novopercmetamascacess.toFixed(2)));
  
    //////////// INFANTIL - VERAO/INVERNO //////////////////////////////////////////////////////////////////////////////////
    
  let percvendainfantveraoinverno = $('#PCVendaInfantVeraoInv_'+linha[1].toString()).val().replace(',', '.'); 
  
  let novovalormetainfantveraoinverno = parseFloat(vrmeta) * (parseFloat(percvendainfantveraoinverno) / 100);
  
  $('#VRMetaInfantVeraoInv_'+linha[1].toString()).val(mascaraValor(novovalormetainfantveraoinverno.toFixed(2)));
  
  let novopercmetainfantveraoinverno = (parseFloat(novovalormetainfantveraoinverno) * 100) / parseFloat(vrmeta);
              
    if(isNaN(novopercmetainfantveraoinverno) ){
      novopercmetainfantveraoinverno = 0;
    }
    
  $('#PCMetaInfantVeraoInv_'+linha[1].toString()).val(mascaraValor(novopercmetainfantveraoinverno.toFixed(2)));
  
    //////////// INFANTIL - INTIMO //////////////////////////////////////////////////////////////////////////////////
    
  let percvendainfantintimo = $('#PCVendaInfantIntimo_'+linha[1].toString()).val().replace(',', '.'); 
  
  let novovalormetainfantintimo = parseFloat(vrmeta) * (parseFloat(percvendainfantintimo) / 100);
  
  $('#VRMetaInfantIntimo_'+linha[1].toString()).val(mascaraValor(novovalormetainfantintimo.toFixed(2)));
  
  let novopercmetainfantintimo = (parseFloat(novovalormetainfantintimo) * 100) / parseFloat(vrmeta);
                
    if(isNaN(novopercmetainfantintimo) ){
      novopercmetainfantintimo = 0;
    }
    
  $('#PCMetaInfantIntimo_'+linha[1].toString()).val(mascaraValor(novopercmetainfantintimo.toFixed(2)));
  
    //////////// INFANTIL - ACESSORIOS //////////////////////////////////////////////////////////////////////////////////
    
  let percvendainfantacess = $('#PCVendaInfantAcess_'+linha[1].toString()).val().replace(',', '.');
  
  let novovalormetainfantacess = parseFloat(vrmeta) * (parseFloat(percvendainfantacess) / 100);
  
  $('#VRMetaInfantAcess_'+linha[1].toString()).val(mascaraValor(novovalormetainfantacess.toFixed(2)));
  
  let novopercmetainfantacess = (parseFloat(novovalormetainfantacess) * 100) / parseFloat(vrmeta);
                  
    if(isNaN(novopercmetainfantacess) ){
      novopercmetainfantacess = 0;
    }
    
  $('#PCMetaInfantAcess_'+linha[1].toString()).val(mascaraValor(novopercmetainfantacess.toFixed(2)));
  
    //////////// CMB //////////////////////////////////////////////////////////////////////////////////
    
  let percvendacmb = $('#PCVendaCMB_'+linha[1].toString()).val().replace(',', '.'); 
  
  let novovalormetacmb = parseFloat(vrmeta) * (parseFloat(percvendacmb) / 100);
  
  $('#VRMetaCMB_'+linha[1].toString()).val(mascaraValor(novovalormetacmb.toFixed(2)));
  
  let novopercmetacmb = (parseFloat(novovalormetacmb) * 100) / parseFloat(vrmeta);
                    
    if(isNaN(novopercmetacmb) ){
      novopercmetacmb = 0;
    }
    
  $('#PCMetaCMB_'+linha[1].toString()).val(mascaraValor(novopercmetacmb.toFixed(2)));
  
  /////////////////// TOTALIZANDO O % GERAL ////////////////////////////////////////////////////////////
  
  let TotalPercentual = parseFloat(novopercmetacalcado) + parseFloat(novopercmetafemveraoinverno) + parseFloat(novopercmetafemintimo) + parseFloat(novopercmetafemacess) + parseFloat(novopercmetamascveraoinverno) + parseFloat(novopercmetamascintimo) + parseFloat(novopercmetamascacess) + parseFloat(novopercmetainfantveraoinverno) + parseFloat(novopercmetainfantintimo) + parseFloat(novopercmetainfantacess) + parseFloat(novopercmetacmb);
  
  $('#PCTotal_'+linha[1].toString()).val(mascaraValor(TotalPercentual.toFixed(2)));
  return

}

function atualiza_Total_Percentual(id){
    
    let linha = id.split('_');
    
    let perccalcado = $('#PCMetaCalcado_'+linha[1].toString()).val().replace(',', '.');
    let percfemvi = $('#PCMetaFemVeraoInv_'+linha[1].toString()).val().replace(',', '.');
    let percfemint = $('#PCMetaFemIntimo_'+linha[1].toString()).val().replace(',', '.');
    let percfemaces = $('#PCMetaFemAcess_'+linha[1].toString()).val().replace(',', '.');
    let percmascvi = $('#PCMetaMascVeraoInv_'+linha[1].toString()).val().replace(',', '.');
    let percmascint = $('#PCMetaMascIntimo_'+linha[1].toString()).val().replace(',', '.');
    let percmascaces = $('#PCMetaMascAcess_'+linha[1].toString()).val().replace(',', '.');
    let percinfantvi = $('#PCMetaInfantVeraoInv_'+linha[1].toString()).val().replace(',', '.');
    let percinfantint = $('#PCMetaInfantIntimo_'+linha[1].toString()).val().replace(',', '.');
    let percinfantaces = $('#PCMetaInfantAcess_'+linha[1].toString()).val().replace(',', '.');
    let perccmb = $('#PCMetaCMB_'+linha[1].toString()).val().replace(',', '.');
    
    let percTotal = parseFloat(perccalcado) + parseFloat(percfemvi) + parseFloat(percfemint) + parseFloat(percfemaces) + parseFloat(percmascvi) + parseFloat(percmascint) + parseFloat(percmascaces) + parseFloat(percinfantvi) + parseFloat(percinfantint) + parseFloat(percinfantaces) + parseFloat(perccmb);
    $('#PCTotal_'+linha[1].toString()).val(mascaraValor(percTotal.toFixed(2)));
    
    return;
    
}

///////////////////// CALÇADOS /////////////////////////
function atualiza_Valor_Metas_Calcado(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaCalcado = conversor($('#VRMetaCalcado_'+linha[1]).val());
  
  let novopercCalcado = (parseFloat(vrmetaCalcado) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaCalcado_'+linha[1].toString()).val(parseFloat(novopercCalcado).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_Calcado(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaCalcado = conversor($('#PCMetaCalcado_'+linha[1]).val());
  
  let novovalormetaCalcado = parseInt(vrmeta) * (parseFloat(percmetaCalcado) / 100);
  
  $('#VRMetaCalcado_'+linha[1].toString()).val(parseFloat(novovalormetaCalcado).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

///////////////////// FEMININO /////////////////////////
function atualiza_Valor_Metas_FemVeraoInv(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaFemVeraoInv = conversor($('#VRMetaFemVeraoInv_'+linha[1]).val());
  
  let novopercFemVeraoInv = (parseFloat(vrmetaFemVeraoInv) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaFemVeraoInv_'+linha[1].toString()).val(parseFloat(novopercFemVeraoInv).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_FemVeraoInv(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaFemVeraoInv = conversor($('#PCMetaFemVeraoInv_'+linha[1]).val());
  
  let novovalormetaFemVeraoInv = parseInt(vrmeta) * (parseFloat(percmetaFemVeraoInv) / 100);
  
  $('#VRMetaFemVeraoInv_'+linha[1].toString()).val(parseFloat(novovalormetaFemVeraoInv).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Valor_Metas_FemIntimo(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaFemIntimo = conversor($('#VRMetaFemIntimo_'+linha[1]).val());
  
  let novopercFemIntimo = (parseFloat(vrmetaFemIntimo) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaFemIntimo_'+linha[1].toString()).val(parseFloat(novopercFemIntimo).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_FemIntimo(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaFemIntimo = conversor($('#PCMetaFemIntimo_'+linha[1]).val());
  
  let novovalormetaFemIntimo = parseInt(vrmeta) * (parseFloat(percmetaFemIntimo) / 100);
  
  $('#VRMetaFemIntimo_'+linha[1].toString()).val(parseFloat(novovalormetaFemIntimo).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Valor_Metas_FemAcess(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaFemAcess = conversor($('#VRMetaFemAcess_'+linha[1]).val());
  
  let novopercFemAcess = (parseFloat(vrmetaFemAcess) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaFemAcess_'+linha[1].toString()).val(parseFloat(novopercFemAcess).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_FemAcess(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaFemAcess = conversor($('#PCMetaFemAcess_'+linha[1]).val());
  
  let novovalormetaFemAcess = parseInt(vrmeta) * (parseFloat(percmetaFemAcess) / 100);
  
  $('#VRMetaFemAcess_'+linha[1].toString()).val(parseFloat(novovalormetaFemAcess).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

///////////////////// MASCULINO /////////////////////////
function atualiza_Valor_Metas_MascVeraoInv(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaMascVeraoInv = conversor($('#VRMetaMascVeraoInv_'+linha[1]).val());
  
  let novopercMascVeraoInv = (parseFloat(vrmetaMascVeraoInv) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaMascVeraoInv_'+linha[1].toString()).val(parseFloat(novopercMascVeraoInv).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_MascVeraoInv(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaMascVeraoInv = conversor($('#PCMetaMascVeraoInv_'+linha[1]).val());
  
  let novovalormetaMascVeraoInv = parseInt(vrmeta) * (parseFloat(percmetaMascVeraoInv) / 100);
  
  $('#VRMetaMascVeraoInv_'+linha[1].toString()).val(parseFloat(novovalormetaMascVeraoInv).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Valor_Metas_MascIntimo(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaMascIntimo = conversor($('#VRMetaMascIntimo_'+linha[1]).val());
  
  let novopercMascIntimo = (parseFloat(vrmetaMascIntimo) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaMascIntimo_'+linha[1].toString()).val(parseFloat(novopercMascIntimo).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_MascIntimo(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaMascIntimo = conversor($('#PCMetaMascIntimo_'+linha[1]).val());
  
  let novovalormetaMascIntimo = parseInt(vrmeta) * (parseFloat(percmetaMascIntimo) / 100);
  
  $('#VRMetaMascIntimo_'+linha[1].toString()).val(parseFloat(novovalormetaMascIntimo).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Valor_Metas_MascAcess(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaMascAcess = conversor($('#VRMetaMascAcess_'+linha[1]).val());
  
  let novopercMascAcess = (parseFloat(vrmetaMascAcess) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaMascAcess_'+linha[1].toString()).val(parseFloat(novopercMascAcess).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_MascAcess(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaMascAcess = conversor($('#PCMetaMascAcess_'+linha[1]).val());
  
  let novovalormetaMascAcess = parseInt(vrmeta) * (parseFloat(percmetaMascAcess) / 100);
  
  $('#VRMetaMascAcess_'+linha[1].toString()).val(parseFloat(novovalormetaMascAcess).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

///////////////////// INFANTIL /////////////////////////
function atualiza_Valor_Metas_InfantVeraoInv(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaInfantVeraoInv = conversor($('#VRMetaInfantVeraoInv_'+linha[1]).val());
  
  let novopercInfantVeraoInv = (parseFloat(vrmetaInfantVeraoInv) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaInfantVeraoInv_'+linha[1].toString()).val(parseFloat(novopercInfantVeraoInv).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_InfantVeraoInv(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaInfantVeraoInv = conversor($('#PCMetaInfantVeraoInv_'+linha[1]).val());
  
  let novovalormetaInfantVeraoInv = parseInt(vrmeta) * (parseFloat(percmetaInfantVeraoInv) / 100);
  
  $('#VRMetaInfantVeraoInv_'+linha[1].toString()).val(parseFloat(novovalormetaInfantVeraoInv).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Valor_Metas_InfantIntimo(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaInfantIntimo = conversor($('#VRMetaInfantIntimo_'+linha[1]).val());
  
  let novopercInfantIntimo = (parseFloat(vrmetaInfantIntimo) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaInfantIntimo_'+linha[1].toString()).val(parseFloat(novopercInfantIntimo).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_InfantIntimo(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaInfantIntimo = conversor($('#PCMetaInfantIntimo_'+linha[1]).val());
  
  let novovalormetaInfantIntimo = parseInt(vrmeta) * (parseFloat(percmetaInfantIntimo) / 100);
  
  $('#VRMetaInfantIntimo_'+linha[1].toString()).val(parseFloat(novovalormetaInfantIntimo).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Valor_Metas_InfantAcess(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaInfantAcess = conversor($('#VRMetaInfantAcess_'+linha[1]).val());
  
  let novopercInfantAcess = (parseFloat(vrmetaInfantAcess) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaInfantAcess_'+linha[1].toString()).val(parseFloat(novopercInfantAcess).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_InfantAcess(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaInfantAcess = conversor($('#PCMetaInfantAcess_'+linha[1]).val());
  
  let novovalormetaInfantAcess = parseInt(vrmeta) * (parseFloat(percmetaInfantAcess) / 100);
  
  $('#VRMetaInfantAcess_'+linha[1].toString()).val(parseFloat(novovalormetaInfantAcess).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

///////////////////// CMB /////////////////////////
function atualiza_Valor_Metas_CMB(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let vrmetaCMB = conversor($('#VRMetaCMB_'+linha[1]).val());
  
  let novopercCMB = (parseFloat(vrmetaCMB) * 100) / parseFloat(vrmeta);
  
  $('#PCMetaCMB_'+linha[1].toString()).val(parseFloat(novopercCMB).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

function atualiza_Percent_Metas_CMB(id) {

  let linha = id.split('_');

  let vrmeta = conversor($('#VRMeta_'+linha[1]).val());
  let percmetaCMB = conversor($('#PCMetaCMB_'+linha[1]).val());
  
  let novovalormetaCMB = parseInt(vrmeta) * (parseFloat(percmetaCMB) / 100);
  
  $('#VRMetaCMB_'+linha[1].toString()).val(parseFloat(novovalormetaCMB).toLocaleString('pt-br', {minimumFractionDigits: 2}));
  
  atualiza_Total_Percentual(id);
  
  return

}

//////////////////// CADASTRAR METAS /////////////

function Cadastrar_Metas_Lojas() {
  
    var dadosTableMetas = [];
    var cont = 1;
    var table = $('#dt-basic-venda-meta').DataTable();
    table.rows().iterator('row', function(context, index) {
        var dadosMetaLoja = {
                  "IDEmpresaMeta":parseFloat($("#IDEmpresaMeta_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaVenda":parseFloat($("#VRMetaVenda_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaVenda":parseFloat($("#PCMeta_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMeta":parseFloat($("#VRMeta_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaCalcado":parseFloat($("#VRVendaCalcado_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaCalcado":parseFloat($("#PCVendaCalcado_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaCalcado":parseFloat($("#VRMetaCalcado_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaCalcado":parseFloat($("#PCMetaCalcado_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaFemVeraoInv":parseFloat($("#VRVendaFemVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaFemVeraoInv":parseFloat($("#PCVendaFemVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaFemVeraoInv":parseFloat($("#VRMetaFemVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaFemVeraoInv":parseFloat($("#PCMetaFemVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaFemIntimo":parseFloat($("#VRVendaFemIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaFemIntimo":parseFloat($("#PCVendaFemIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaFemIntimo":parseFloat($("#VRMetaFemIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaFemIntimo":parseFloat($("#PCMetaFemIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaFemAcess":parseFloat($("#VRVendaFemAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaFemAcess":parseFloat($("#PCVendaFemAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaFemAcess":parseFloat($("#VRMetaFemAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaFemAcess":parseFloat($("#PCMetaFemAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaMascVeraoInv":parseFloat($("#VRVendaMascVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaMascVeraoInv":parseFloat($("#PCVendaMascVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaMascVeraoInv":parseFloat($("#VRMetaMascVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaMascVeraoInv":parseFloat($("#PCMetaMascVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaMascIntimo":parseFloat($("#VRVendaMascIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaMascIntimo":parseFloat($("#PCVendaMascIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaMascIntimo":parseFloat($("#VRMetaMascIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaMascIntimo":parseFloat($("#PCMetaMascIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaMascAcess":parseFloat($("#VRVendaMascAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaMascAcess":parseFloat($("#PCVendaMascAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaMascAcess":parseFloat($("#VRMetaMascAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaMascAcess":parseFloat($("#PCMetaMascAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaInfantVeraoInv":parseFloat($("#VRVendaInfantVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaInfantVeraoInv":parseFloat($("#PCVendaInfantVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaInfantVeraoInv":parseFloat($("#VRMetaInfantVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaInfantVeraoInv":parseFloat($("#PCMetaInfantVeraoInv_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaInfantIntimo":parseFloat($("#VRVendaInfantIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaInfantIntimo":parseFloat($("#PCVendaInfantIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaInfantIntimo":parseFloat($("#VRMetaInfantIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaInfantIntimo":parseFloat($("#PCMetaInfantIntimo_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaInfantAcess":parseFloat($("#VRVendaInfantAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaInfantAcess":parseFloat($("#PCVendaInfantAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaInfantAcess":parseFloat($("#VRMetaInfantAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaInfantAcess":parseFloat($("#PCMetaInfantAcess_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaCMB":parseFloat($("#VRVendaCMB_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaCMB":parseFloat($("#PCVendaCMB_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "VRMetaCMB":parseFloat($("#VRMetaCMB_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCMetaCMB":parseFloat($("#PCMetaCMB_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "VRVendaOUTROS":parseFloat($("#VRVendaOUTROS_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  "PCVendaOUTROS":parseFloat($("#PCVendaOUTROS_"+cont.toString()).val().replace(".", "").replace(",", ".")),
                  
                  "PCTotal":parseFloat($("#PCTotal_"+cont.toString()).val().replace(".", "").replace(",", "."))
                  
        }
        dadosTableMetas.push(dadosMetaLoja);
        cont++;
    });

    let idgrupoemp = $("#idmarca").val();
    let dtinic = $("#dtconsultainicio").val();
    let dtfim = $("#dtconsultafim").val();
    let StAtivo = 'True';
    let StSalvo = 'True';
          
    if(dtinic == ''){

      Swal.fire({
          type: "warning",
          title: "Escolha um período ",
          showConfirmButton: false,
          timer: 2000
      });
      return;
      
    }else{
        Swal.fire({
              title: 'Certeza que Deseja Finalizar o Cadastro?',
              text: "Você não poderá reverter esta ação!",
              buttonsStyling: false,
              showCancelButton: true,
              customClass: {
                confirmButton: 'btn btn-primary btn-lg',
                cancelButton: 'btn btn-danger btn-lg',
                loader: 'custom-loader'
              },
              loaderHtml: '<div class="spinner-border text-primary"></div>',
              preConfirm: () => {
                Swal.showLoading()
                return new Promise((resolve) => {
        
                  var dados = [{ 
                      "IDGRUPOEMPRESA": parseInt(idgrupoemp),
                      "IDFUNCIONARIO": parseInt(IDFuncionarioLogin),
                      "DTMETAINICIO":dtinic,
                      "DTMETAFIM":dtfim,
                      "METASDETALHE":dadosTableMetas,
                      "STATIVO":StAtivo,
                      "STSALVO":StSalvo
                }];
                  
                  ajaxPost("api/comercial/cadastrar-metas_lojas.xsjs", dados)
                  .then(funcSucessCadMetasLojas)
                  .catch(funcError);
                          
                })
              }
        })
    }
}

function funcSucessCadMetasLojas(resposta) {

Swal.fire({
  type: "success",
  title: "Metas Cadastradas com Sucesso ",
  showConfirmButton: false,
  timer: 2000
});

ListaMetasPeriodo();

}

////////////////////PESQUISA METAS CADASTRADAS ////

///////////METAS DETALHADA///////////////////

function pesq_det_metas_lojas(idMarca,datini,datfim){
    
    dataRetornoMetas=[];
    contador = 0;

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
        //newDataTable();
        
        $('.dataAtual').text(dataAtual);

        ajaxGetComAnimacaoDeCarregamento(`api/comercial/meta-vendas.xsjs?idMarca=${idMarca}&dataInicio=${datini}&dataFim=${datfim}`, "Carregando Dados, aguarde...", retornoListaMetasVendaMarca, "Erro ao Carregar os Dados");

      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasmarcameta.html", true);
    xmlhttp.send();
}

function chamarProximaListaMetas(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
     ajaxGetComAnimacaoDeCarregamento(`api/comercial/meta-vendas.xsjs?page=${numPage}&idMarca=${IDMarcaPesqVenda}&dataInicio=${datapesqinicio}&dataFim=${datapesqfim}`, "Carregando Dados, aguarde...", retornoListaMetasVendaMarca, "Erro ao Carregar os Dados");

}

function retornoListaMetasVendaMarca(respostaListaMetasVendaMarca) {

    var numPageAtual = parseInt(respostaListaMetasVendaMarca.page);
    
    if(respostaListaMetasVendaMarca.data.length != 0){
    
        for (var i=0; i < respostaListaMetasVendaMarca.data.length; i++) {
            
            contador ++;
            
            let IDMETASLOJAMETAS = respostaListaMetasVendaMarca.data[i]['IDMETASLOJA'];
            DTMETAINICIOMETAS = respostaListaMetasVendaMarca.data[i]['DTMETAINICIO'];
            DTMETAFIMMETAS = respostaListaMetasVendaMarca.data[i]['DTMETAFIM'];
            let IDGRUPOEMPRESAMETAS = respostaListaMetasVendaMarca.data[i]['IDGRUPOEMPRESA'];
            let IDEMPRESAMETAS = respostaListaMetasVendaMarca.data[i]['IDEMPRESA'];
            let IDFUNCIONARIOMETAS = respostaListaMetasVendaMarca.data[i]['IDFUNCIONARIO'];
            let VRVENDAGERALMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAGERAL'];
            let PERCMETAVENDAGERALMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAGERAL'];
            let VRMETAVENDAGERALMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAGERAL'];
            let VRVENDACALCADOSMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDACALCADOS'];
            let PERCVENDACALCADOSMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDACALCADOS'];
            let VRMETAVENDACALCADOSMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDACALCADOS'];
            let PERCMETAVENDACALCADOSMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDACALCADOS'];
            let VRVENDAFEMVERINVMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAFEMVERINV'];
            let PERCVENDAFEMVERINVMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDAFEMVERINV'];
            let VRMETAVENDAFEMVERINVMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAFEMVERINV'];
            let PERCMETAVENDAFEMVERINVMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAFEMVERINV'];
            let VRVENDAFEMPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAFEMPCINTIMA'];
            let PERCVENDAFEMPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDAFEMPCINTIMA'];
            let VRMETAVENDAFEMPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAFEMPCINTIMA'];
            let PERCMETAVENDAFEMPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAFEMPCINTIMA'];
            let VRVENDAFEMACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAFEMACESSORIOS'];
            let PERCVENDAFEMACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDAFEMACESSORIOS'];
            let VRMETAVENDAFEMACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAFEMACESSORIOS'];
            let PERCMETAVENDAFEMACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAFEMACESSORIOS'];

            let VRVENDAMASCVERINVMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAMASCVERINV'];
            let PERCVENDAMASCVERINVMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDAMASCVERINV'];
            let VRMETAVENDAMASCVERINVMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAMASCVERINV'];
            let PERCMETAVENDAMASCVERINVMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAMASCVERINV'];
            let VRVENDAMASCPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAMASCPCINTIMA'];
            let PERCVENDAMASCPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDAMASCPCINTIMA'];
            let VRMETAVENDAMASCPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAMASCPCINTIMA'];
            let PERCMETAVENDAMASCPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAMASCPCINTIMA'];
            let VRVENDAMASCACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAMASCACESSORIOS'];
            let PERCVENDAMASCACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDAMASCACESSORIOS'];
            let VRMETAVENDAMASCACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAMASCACESSORIOS'];
            let PERCMETAVENDAMASCACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAMASCACESSORIOS'];

            let VRVENDAINFANTVERINVMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAINFANTVERINV'];
            let PERCVENDAINFANTVERINVMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDAINFANTVERINV'];
            let VRMETAVENDAINFANTVERINVMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAINFANTVERINV'];
            let PERCMETAVENDAINFANTVERINVMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAINFANTVERINV'];
            let VRVENDAINFANTPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAINFANTPCINTIMA'];
            let PERCVENDAINFANTPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDAINFANTPCINTIMA'];
            let VRMETAVENDAINFANTPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAINFANTPCINTIMA'];
            let PERCMETAVENDAINFANTPCINTIMAMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAINFANTPCINTIMA'];
            let VRVENDAINFANTACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDAINFANTACESSORIOS'];
            let PERCVENDAINFANTACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDAINFANTACESSORIOS'];
            let VRMETAVENDAINFANTACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAINFANTACESSORIOS'];
            let PERCMETAVENDAINFANTACESSORIOSMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAINFANTACESSORIOS'];
            
            let VRVENDACMBMETAS = respostaListaMetasVendaMarca.data[i]['VRVENDACMB'];
            let PERCVENDACMBMETAS = respostaListaMetasVendaMarca.data[i]['PERCVENDACMB'];
            let VRMETAVENDACMBMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDACMB'];
            let PERCMETAVENDACMBMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDACMB'];
            let VRMETAVENDAOUTROSMETAS = respostaListaMetasVendaMarca.data[i]['VRMETAVENDAOUTROS'];
            let PERCMETAVENDAOUTROSMETAS = respostaListaMetasVendaMarca.data[i]['PERCMETAVENDAOUTROS'];
            let PERCTOTALVENDAMETAS = respostaListaMetasVendaMarca.data[i]['PERCTOTALVENDA'];
            let STATIVOMETAS = respostaListaMetasVendaMarca.data[i]['STATIVO'];
            let NOFANTASIAMETAS = respostaListaMetasVendaMarca.data[i]['NOFANTASIA'];
// gnr dentro da documentação da speedNFe
                dataRetornoMetas.push([
                  `<label style="color: blue; font-size: 11px;">` + contador + `</label>`,
                  `<label style="color: blue; font-size: 11px;">` + NOFANTASIAMETAS + `</label>`,
                  `<label style="color: blue; font-size: 11px;">` + (parseFloat(VRVENDAGERALMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</label>`,
                  `<label style="color: blue; font-size: 11px;">` + (parseFloat(PERCMETAVENDAGERALMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</label>`,
                  `<label style="color: blue; font-size: 11px;">` + (parseFloat(VRMETAVENDAGERALMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</label>`,
                  
                  `<label style="color: orange; font-size: 11px;"><strong>` + (parseFloat(VRVENDACALCADOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: orange; font-size: 11px;"><strong>` + (parseFloat(PERCVENDACALCADOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: orange; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDACALCADOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: orange; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDACALCADOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(VRVENDAFEMVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(PERCVENDAFEMVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAFEMVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAFEMVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(VRVENDAFEMPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(PERCVENDAFEMPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAFEMPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAFEMPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(VRVENDAFEMACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(PERCVENDAFEMACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAFEMACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAFEMACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(VRVENDAMASCVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(PERCVENDAMASCVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAMASCVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAMASCVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(VRVENDAMASCPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(PERCVENDAMASCPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAMASCPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAMASCPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(VRVENDAMASCACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(PERCVENDAMASCACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAMASCACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: dodgerblue; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAMASCACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(VRVENDAINFANTVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(PERCVENDAINFANTVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAINFANTVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAINFANTVERINVMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(VRVENDAINFANTPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(PERCVENDAINFANTPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAINFANTPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAINFANTPCINTIMAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(VRVENDAINFANTACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(PERCVENDAINFANTACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAINFANTACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: MediumSeaGreen; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAINFANTACESSORIOSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: SlateBlue; font-size: 11px;"><strong>` + (parseFloat(VRVENDACMBMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: SlateBlue; font-size: 11px;"><strong>` + (parseFloat(PERCVENDACMBMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: SlateBlue; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDACMBMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: SlateBlue; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDACMBMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: Violet; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDAOUTROSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: Violet; font-size: 11px;"><strong>` + (parseFloat(PERCMETAVENDAOUTROSMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: Orange; font-size: 11px;"><strong>` + (parseFloat(PERCTOTALVENDAMETAS).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                 
                ]);

        }
        
        //chamarProximaListaMetas(numPageAtual + 1);
    }
    if(numPageAtual === 1){
         $('#resultadometas').html(
            `<table id="dt-basic-metas" class="table table-bordered table-hover">
                <thead class="bg-primary-600">
                    <tr>
                        <td class="bg-primary-400" colspan="5" style="font-size: 12px; text-align:center">VENDAS / META GERAL</td>
                        <td class="bg-warning-200" colspan="4" style="font-size: 12px; text-align:center">CALÇADOS</td>
                        <td class="bg-danger-200" colspan="12" style="font-size: 12px; text-align:center">SEÇÃO FEMININA</td>
                        <td class="bg-info-200" colspan="12" style="font-size: 12px; text-align:center">SEÇÃO MASCULINA</td>
                        <td class="bg-success-200" colspan="12" style="font-size: 12px; text-align:center">SEÇÃO INFANTIL</td>
                        <td class="bg-primary-200" colspan="4" style="font-size: 12px; text-align:center">CMB</td>
                        <td class="bg-danger-200" colspan="2" style="font-size: 12px; text-align:center">Outros</td>
                        <td class="bg-warning-200" style="font-size: 12px; text-align:center">Total</td>
                    </tr>
                    <tr>
                        <th class="bg-primary-400">#</th>
                        <th class="bg-primary-400">Empresa</th>
                        <th class="bg-primary-400">Venda</th>
                        <th class="bg-primary-400">% Meta</th>
                        <th class="bg-primary-400">Vr Meta</th>
                        
                        <th class="bg-warning-200">Geral</th>
                        <th class="bg-warning-200">%</th>
                        <th class="bg-warning-400">Vr Meta</th>
                        <th class="bg-warning-400">%</th>
                        
                        <th class="bg-danger-200">Verão/Inverno</th>
                        <th class="bg-danger-200">%</th>
                        <th class="bg-danger-400">Vr Meta</th>
                        <th class="bg-danger-400">%</th>
                        <th class="bg-danger-200">Peça Intima</th>
                        <th class="bg-danger-200">%</th>
                        <th class="bg-danger-400">Vr Meta</th>
                        <th class="bg-danger-400">%</th>
                        <th class="bg-danger-200">Acessórios</th>
                        <th class="bg-danger-200">%</th>
                        <th class="bg-danger-400">Vr Meta</th>
                        <th class="bg-danger-400">%</th>
                        
                        <th class="bg-info-200">Verão/Inverno</th>
                        <th class="bg-info-200">%</th>
                        <th class="bg-info-400">Vr Meta</th>
                        <th class="bg-info-400">%</th>
                        <th class="bg-info-200">Peça Intima</th>
                        <th class="bg-info-200">%</th>
                        <th class="bg-info-400">Vr Meta</th>
                        <th class="bg-info-400">%</th>
                        <th class="bg-info-200">Acessórios</th>
                        <th class="bg-info-200">%</th>
                        <th class="bg-info-400">Vr Meta</th>
                        <th class="bg-info-400">%</th>
                        
                        <th class="bg-success-200">Verão/Inverno</th>
                        <th class="bg-success-200">%</th>
                        <th class="bg-success-400">Vr Meta</th>
                        <th class="bg-success-400">%</th>
                        <th class="bg-success-200">Peça Intima</th>
                        <th class="bg-success-200">%</th>
                        <th class="bg-success-400">Vr Meta</th>
                        <th class="bg-success-400">%</th>
                        <th class="bg-success-200">Acessórios</th>
                        <th class="bg-success-200">%</th>
                        <th class="bg-success-400">Vr Meta</th>
                        <th class="bg-success-400">%</th>
                        
                        <th class="bg-primary-200">CMB</th>
                        <th class="bg-primary-200">%</th>
                        <th class="bg-primary-400">Vr Meta</th>
                        <th class="bg-primary-400">%</th>
                        
                        <th class="bg-danger-200">Outros</th>
                        <th class="bg-danger-200">%</th>
                        
                        <th class="bg-warning-400">%</th>
                        
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaMeta">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaMeta"class="thead-themed">
                </tfoot>
            </table>`
        );

        $('#textometas').html(
		`Lista Metas Detalhada do Período: ` + DTMETAINICIOMETAS + ` a  ` + DTMETAFIMMETAS + `<span class="fw-300"><i></i></span>`);
		
        $('#dt-basic-metas').DataTable( {
            
            data: dataRetornoMetas,
            "columnDefs": [
              { "width": "5px", "targets": 0 },
              { "width": "180px", "targets": 1 },
              { "width": "95px", "targets": [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51] }
          ],
            deferRender: false,
            lengthChange: false,
            //displayLength: 100,
            ordering:  false,
            paging: false,
            searching: false,
            //scrollY:        800,
            scrollCollapse: false,
            //scroller:       false,
            scrollX: true,
            autowidth: false,
            responsive: false,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",

            buttons: [
                        /*
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
                         */
                    ] 
        } );
        
    }

}

///////////METAS RESUMIDA////////////////////

function pesq_res_metas_lojas(idMarca,datini,datfim){
    
    dataRetornoMetasRes=[];
    contadorres = 0;

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
        //newDataTable();
        
        $('.dataAtual').text(dataAtual);

        ajaxGetComAnimacaoDeCarregamento(`api/comercial/meta-vendas-resumida.xsjs?idMarca=${idMarca}&dataInicio=${datini}&dataFim=${datfim}`, "Carregando Dados, aguarde...", retornoListaMetasVendaMarcaResumido, "Erro ao Carregar os Dados");

      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasmarcameta.html", true);
    xmlhttp.send();
}

function retornoListaMetasVendaMarcaResumido(respostaListaMetasVendaMarcaResumido) {

    var numPageAtual = parseInt(respostaListaMetasVendaMarcaResumido.page);
    
    if(respostaListaMetasVendaMarcaResumido.data.length != 0){
    
        for (var i=0; i < respostaListaMetasVendaMarcaResumido.data.length; i++) {
            
            contadorres ++;
            
            IDMETASLOJAMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['IDMETASLOJA'];
            DTMETAINICIOMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['DTMETAINICIO'];
            DTMETAFIMMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['DTMETAFIM'];
            let IDGRUPOEMPRESAMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['IDGRUPOEMPRESA'];
            let IDEMPRESAMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['IDEMPRESA'];
            let IDFUNCIONARIOMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['IDFUNCIONARIO'];
            let VRVENDAGERALMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['VRVENDAGERAL'];
            let PERCMETAVENDAGERALMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['PERCMETAVENDAGERAL'];
            let VRMETAVENDAGERALMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['VRMETAVENDAGERAL'];
            let VRVENDACALCADOSMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['VRVENDACALCADOS'];
            let VRMETAVENDACALCADOSMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['VRMETAVENDACALCADOS'];
            
            let VRTOTALVENDAVESTUARIORES = respostaListaMetasVendaMarcaResumido.data[i]['VRTOTALVENDAVESTUARIO'];
            let VRTOTALMETASVESTUARIORES = respostaListaMetasVendaMarcaResumido.data[i]['VRTOTALMETAVESTUARIO'];
            
            let STATIVOMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['STATIVO'];
            let NOFANTASIAMETASRES = respostaListaMetasVendaMarcaResumido.data[i]['NOFANTASIA'];

                dataRetornoMetasRes.push([
                  `<label style="color: blue; font-size: 11px;">` + contadorres + `</label>`,
                  `<label style="color: blue; font-size: 11px;">` + NOFANTASIAMETASRES + `</label>`,
                  `<label style="color: blue; font-size: 11px;">` + (parseFloat(VRVENDAGERALMETASRES).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</label>`,
                  `<label style="color: blue; font-size: 11px;">` + (parseFloat(PERCMETAVENDAGERALMETASRES).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</label>`,
                  `<label style="color: blue; font-size: 11px;">` + (parseFloat(VRMETAVENDAGERALMETASRES).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</label>`,
                  
                  `<label style="color: orange; font-size: 11px;"><strong>` + (parseFloat(VRVENDACALCADOSMETASRES).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: orange; font-size: 11px;"><strong>` + (parseFloat(VRMETAVENDACALCADOSMETASRES).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(VRTOTALVENDAVESTUARIORES).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                  `<label style="color: violet; font-size: 11px;"><strong>` + (parseFloat(VRTOTALMETASVESTUARIORES).toLocaleString('pt-br', { minimumFractionDigits: 2 })) + `</strong></label>`,
                 
                ]);
        }
        
        //chamarProximaListaMetas(numPageAtual + 1);
    }
    if(numPageAtual === 1){
         $('#resultadometas').html(
            `<table id="dt-basic-metas-resumido" class="table table-bordered table-hover table-striped w-100 .dt-responsive">
                <thead class="bg-primary-600">
                    <tr>
                        <td class="bg-primary-400" colspan="5" style="font-size: 12px; text-align:center">VENDAS / META GERAL</td>
                        <td class="bg-warning-200" colspan="2" style="font-size: 12px; text-align:center">CALÇADOS</td>
                        <td class="bg-danger-200" colspan="2" style="font-size: 12px; text-align:center">VESTUÁRIO</td>
                    </tr>
                    <tr>
                        <th class="bg-primary-400">#</th>
                        <th class="bg-primary-400">Empresa</th>
                        <th class="bg-primary-400">Venda</th>
                        <th class="bg-primary-400">% Meta</th>
                        <th class="bg-primary-400">Vr Meta</th>
                        
                        <th class="bg-warning-200">Geral</th>
                        <th class="bg-warning-400">Vr Meta</th>
                        
                        <th class="bg-danger-200">Geral</th>
                        <th class="bg-danger-400">Vr Meta</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaMarcaMetaResumido">
                </tbody>
                <tfoot id="totalResultadoVendaMarcaMetaResumido"class="thead-themed">
                </tfoot>
            </table>`
        );

        $('#textometas').html(
		`Lista Metas Resumida do Período: ` + DTMETAINICIOMETASRES + ` a  ` + DTMETAFIMMETASRES + `<span class="fw-300"><i></i></span>`);
    			
        $('#dt-basic-metas-resumido').DataTable( {
            
            data: dataRetornoMetasRes,
            "columnDefs": [
              { "width": "5px", "targets": 0 },
              { "width": "180px", "targets": 1 },
              { "width": "95px", "targets": [2,3,4,5,6,7,8] }
          ],
            deferRender: false,
            lengthChange: false,
            //displayLength: 100,
            ordering:  false,
            paging: false,
            searching: false,
            //scrollY:        800,
            scrollCollapse: false,
            //scroller:       false,
            scrollX: true,
            autowidth: false,
            responsive: false,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",

            buttons: [
                        /*
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
                         */
                    ] 
        } );
        
    }

}

///////////////// PREMIAÇÕES POR PERIODO ///////////////////////

function BuscaPremioGerente(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorGerente = 0;
    var VrBonusPlenoGerente = 0;
    var VrBonusJuniorGerente = 0;
    var VrBonusTodasGerente = 0;
          
    let NoFuncGerente = 'GERENTE';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncGerente)
    	.then(funcSucessListaPremioGerente)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaPremioLiderLoja(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorLiderLoja = 0;
    var VrBonusPlenoLiderLoja = 0;
    var VrBonusJuniorLiderLoja = 0;
    var VrBonusTodasLiderLoja = 0;
          
    let NoFuncLiderLoja = 'LIDER DE LOJA';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncLiderLoja)
    	.then(funcSucessListaPremioLiderLoja)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaPremioLiderCaixa(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorLiderCaixa = 0;
    var VrBonusPlenoLiderCaixa = 0;
    var VrBonusJuniorLiderCaixa = 0;
    var VrBonusTodasLiderCaixa = 0;
          
    let NoFuncLiderCaixa = 'LIDER DE CAIXA';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncLiderCaixa)
    	.then(funcSucessListaPremioLiderCaixa)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaPremioOperadorCaixa(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorOperadorCaixa = 0;
    var VrBonusPlenoOperadorCaixa = 0;
    var VrBonusJuniorOperadorCaixa = 0;
    var VrBonusTodasOperadorCaixa = 0;
          
    let NoFuncOperadorCaixa = 'OPERADOR DE CAIXA';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncOperadorCaixa)
    	.then(funcSucessListaPremioOperadorCaixa)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaPremioAssistente(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorAssistente = 0;
    var VrBonusPlenoAssistente = 0;
    var VrBonusJuniorAssistente = 0;
    var VrBonusTodasAssistente = 0;
          
    let NoFuncAssistente = 'ASSISTENTES';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncAssistente)
    	.then(funcSucessListaPremioAssistente)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaPremioMultiplicador(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorMultiplicador = 0;
    var VrBonusPlenoMultiplicador = 0;
    var VrBonusJuniorMultiplicador = 0;
    var VrBonusTodasMultiplicador = 0;
          
    let NoFuncMultiplicador = 'MULTIPLICADOR';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncMultiplicador)
    	.then(funcSucessListaPremioMultiplicador)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaPremioProvador(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorProvador = 0;
    var VrBonusPlenoProvador = 0;
    var VrBonusJuniorProvador = 0;
    var VrBonusTodasProvador = 0;
          
    let NoFuncProvador = 'PROVADOR';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncProvador)
    	.then(funcSucessListaPremioProvador)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaPremioFiscal(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorFiscal = 0;
    var VrBonusPlenoFiscal = 0;
    var VrBonusJuniorFiscal = 0;
    var VrBonusTodasFiscal = 0;
          
    let NoFuncFiscal = 'FISCAL';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncFiscal)
    	.then(funcSucessListaPremioFiscal)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaPremioVendedor(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorVendedor = 0;
    var VrBonusPlenoVendedor = 0;
    var VrBonusJuniorVendedor = 0;
    var VrBonusTodasVendedor = 0;
          
    let NoFuncVendedor = 'VENDEDOR';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncVendedor)
    	.then(funcSucessListaPremioVendedor)
		.catch((e) => { funcError(), console.log(e) });
}

function BuscaPremioLiderSubGerente(IdSubEmp, DtIniPrem, DtfimPrem, DsSubEmpresa){

    var VrBonusSeniorLiderSubGerente = 0;
    var VrBonusPlenoLiderSubGerente = 0;
    var VrBonusJuniorLiderSubGerente = 0;
    var VrBonusTodasLiderSubGerente = 0;
          
    let NoFuncLiderSubGerente = 'LIDER SUBGERENTE';

	$('#lblPremiacao').html( 
		`REGRAS PREMIAÇÕES - <span class="fw-300"><i>` + (DsSubEmpresa) + ` -  </i></span> PERÍODO: <span class="fw-300"><i> ` + (DtIniPrem) + ` a ` + (DtfimPrem) + `</i></span>`
	);
            	
    return ajaxGet('api/comercial/lista-premios-gerente.xsjs?idPremioSubGrupoEmp=' + IdSubEmp + '&DTInicPremio=' + DtIniPrem + '&DTFimPremio=' + DtfimPrem + '&noFunc=' + NoFuncLiderSubGerente)
    	.then(funcSucessListaPremioLiderSubGerente)
		.catch((e) => { funcError(), console.log(e) });
}

function funcSucessListaPremioGerente(respostaPremioGerente) {

  contadorListPremGerente = 0;

  var numPageAtual = parseInt(respostaPremioGerente.page);
  if(numPageAtual === 1){
      
      $('#premgerente').html(
          `<table id="dt-lista-premio-gerente" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" style="font-size: 12px; text-align:center">SENIOR</td>
                    <td class="bg-danger-400" style="font-size: 12px; text-align:center">PLENO</td>
                    <td class="bg-info-400" style="font-size: 12px; text-align:center">JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-info-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioGerente">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioGerente = $('#dt-lista-premio-gerente').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "15%", "targets": 2 },
              { "width": "15%", "targets": 3 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioGerente.rows().remove().draw();
  }

  if(respostaPremioGerente.data.length != 0){
    for (var i = 0; i < respostaPremioGerente.data.length; i++) { 
        contadorListPremGerente ++;

          idPremioGerente = respostaPremioGerente.data[i]['IDPREMIACAO'];
          noIndicadorGerente = respostaPremioGerente.data[i]['NOINDICADOR'];
          VrBonusSeniorGerente = parseFloat(respostaPremioGerente.data[i]['VRBONUSSENIOR']);
          VrBonusPlenoGerente = parseFloat(respostaPremioGerente.data[i]['VRBONUSPLENO']);
          VrBonusJuniorGerente = parseFloat(respostaPremioGerente.data[i]['VRBONUSJUNIOR']);
          VrBonusTodasGerente = parseFloat(respostaPremioGerente.data[i]['VRBONUSTODOS']);

      tableListaPremioGerente.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorGerente + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusSeniorGerente).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusPlenoGerente).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusJuniorGerente).toFixed(2)) + ` </label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function funcSucessListaPremioLiderLoja(respostaPremioLiderLoja) {

  contadorListPremLiderLoja = 0;

  var numPageAtual = parseInt(respostaPremioLiderLoja.page);
  if(numPageAtual === 1){
      
      $('#premliderloja').html(
          `<table id="dt-lista-premio-liderloja" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" style="font-size: 12px; text-align:center">SENIOR</td>
                    <td class="bg-danger-400" style="font-size: 12px; text-align:center">PLENO</td>
                    <td class="bg-info-400" style="font-size: 12px; text-align:center">JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-info-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioLiderLoja">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioLiderLoja = $('#dt-lista-premio-liderloja').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "15%", "targets": 2 },
              { "width": "15%", "targets": 3 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioLiderLoja.rows().remove().draw();
  }

  if(respostaPremioLiderLoja.data.length != 0){
    for (var i = 0; i < respostaPremioLiderLoja.data.length; i++) { 
        contadorListPremLiderLoja ++;

          idPremioLiderLoja = respostaPremioLiderLoja.data[i]['IDPREMIACAO'];
          noIndicadorLiderLoja = respostaPremioLiderLoja.data[i]['NOINDICADOR'];
          VrBonusSeniorLiderLoja = parseFloat(respostaPremioLiderLoja.data[i]['VRBONUSSENIOR']);
          VrBonusPlenoLiderLoja = parseFloat(respostaPremioLiderLoja.data[i]['VRBONUSPLENO']);
          VrBonusJuniorLiderLoja = parseFloat(respostaPremioLiderLoja.data[i]['VRBONUSJUNIOR']);
          VrBonusTodasLiderLoja = parseFloat(respostaPremioLiderLoja.data[i]['VRBONUSTODOS']);

      tableListaPremioLiderLoja.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorLiderLoja + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusSeniorLiderLoja).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusPlenoLiderLoja).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusJuniorLiderLoja).toFixed(2)) + ` </label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function funcSucessListaPremioLiderCaixa(respostaPremioLiderCaixa) {

  contadorListPremLiderCaixa = 0;

  var numPageAtual = parseInt(respostaPremioLiderCaixa.page);
  if(numPageAtual === 1){
      
      $('#premlidercaixa').html(
          `<table id="dt-lista-premio-lidercaixa" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" style="font-size: 12px; text-align:center">SENIOR</td>
                    <td class="bg-danger-400" style="font-size: 12px; text-align:center">PLENO</td>
                    <td class="bg-info-400" style="font-size: 12px; text-align:center">JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-info-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioLiderCaixa">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioLiderCaixa = $('#dt-lista-premio-lidercaixa').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "15%", "targets": 2 },
              { "width": "15%", "targets": 3 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioLiderCaixa.rows().remove().draw();
  }

  if(respostaPremioLiderCaixa.data.length != 0){
    for (var i = 0; i < respostaPremioLiderCaixa.data.length; i++) { 
        contadorListPremLiderCaixa ++;

          idPremioLiderCaixa = respostaPremioLiderCaixa.data[i]['IDPREMIACAO'];
          noIndicadorLiderCaixa = respostaPremioLiderCaixa.data[i]['NOINDICADOR'];
          VrBonusSeniorLiderCaixa = parseFloat(respostaPremioLiderCaixa.data[i]['VRBONUSSENIOR']);
          VrBonusPlenoLiderCaixa = parseFloat(respostaPremioLiderCaixa.data[i]['VRBONUSPLENO']);
          VrBonusJuniorLiderCaixa = parseFloat(respostaPremioLiderCaixa.data[i]['VRBONUSJUNIOR']);
          VrBonusTodasLiderCaixa = parseFloat(respostaPremioLiderCaixa.data[i]['VRBONUSTODOS']);

      tableListaPremioLiderCaixa.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorLiderCaixa + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusSeniorLiderCaixa).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusPlenoLiderCaixa).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusJuniorLiderCaixa).toFixed(2)) + ` </label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function funcSucessListaPremioOperadorCaixa(respostaPremioOperadorCaixa) {

  contadorListPremOperadorCaixa = 0;

  var numPageAtual = parseInt(respostaPremioOperadorCaixa.page);
  if(numPageAtual === 1){
      
      $('#premopcaixa').html(
          `<table id="dt-lista-premio-operadorcaixa" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" colspan="2" style="font-size: 12px; text-align:center">SENIOR/PLENO/JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">Apuração</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioOperadorCaixa">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioOperadorCaixa = $('#dt-lista-premio-operadorcaixa').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "30%", "targets": 2 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioOperadorCaixa.rows().remove().draw();
  }

  if(respostaPremioOperadorCaixa.data.length != 0){
    for (var i = 0; i < respostaPremioOperadorCaixa.data.length; i++) { 
        contadorListPremOperadorCaixa ++;

          idPremioOperadorCaixa = respostaPremioOperadorCaixa.data[i]['IDPREMIACAO'];
          noIndicadorOperadorCaixa = respostaPremioOperadorCaixa.data[i]['NOINDICADOR'];
          tpApuracaorOperadorCaixa = respostaPremioOperadorCaixa.data[i]['TPAPURACAO'];
          VrBonusTodasOperadorCaixa = parseFloat(respostaPremioOperadorCaixa.data[i]['VRBONUSTODOS']);

      tableListaPremioOperadorCaixa.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorOperadorCaixa + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusTodasOperadorCaixa).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + tpApuracaorOperadorCaixa + `</label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function funcSucessListaPremioAssistente(respostaPremioAssistente) {

  contadorListPremAssistente = 0;

  var numPageAtual = parseInt(respostaPremioAssistente.page);
  if(numPageAtual === 1){
      
      $('#premassistente').html(
          `<table id="dt-lista-premio-assistente" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" colspan="2" style="font-size: 12px; text-align:center">SENIOR/PLENO/JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">Apuração</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioAssistente">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioAssistente = $('#dt-lista-premio-assistente').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "30%", "targets": 2 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioAssistente.rows().remove().draw();
  }

  if(respostaPremioAssistente.data.length != 0){
    for (var i = 0; i < respostaPremioAssistente.data.length; i++) { 
        contadorListPremAssistente ++;

          idPremioAssistente = respostaPremioAssistente.data[i]['IDPREMIACAO'];
          noIndicadorAssistente = respostaPremioAssistente.data[i]['NOINDICADOR'];
          tpApuracaorAssistente = respostaPremioAssistente.data[i]['TPAPURACAO'];
          VrBonusTodasAssistente = parseFloat(respostaPremioAssistente.data[i]['VRBONUSTODOS']);
          
      tableListaPremioAssistente.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorAssistente + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusTodasAssistente).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + tpApuracaorAssistente + `</label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function funcSucessListaPremioMultiplicador(respostaPremioMultiplicador) {

  contadorListPremMultiplicador = 0;

  var numPageAtual = parseInt(respostaPremioMultiplicador.page);
  if(numPageAtual === 1){
      
      $('#premmultiplicador').html(
          `<table id="dt-lista-premio-multiplicador" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" colspan="2" style="font-size: 12px; text-align:center">SENIOR/PLENO/JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">Apuração</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioMultiplicador">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioMultiplicador = $('#dt-lista-premio-multiplicador').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "30%", "targets": 2 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioMultiplicador.rows().remove().draw();
  }

  if(respostaPremioMultiplicador.data.length != 0){
    for (var i = 0; i < respostaPremioMultiplicador.data.length; i++) { 
        contadorListPremMultiplicador ++;

          idPremioMultiplicador = respostaPremioMultiplicador.data[i]['IDPREMIACAO'];
          noIndicadorMultiplicador = respostaPremioMultiplicador.data[i]['NOINDICADOR'];
          tpApuracaorMultiplicador = respostaPremioMultiplicador.data[i]['TPAPURACAO'];
          VrBonusTodasMultiplicador = parseFloat(respostaPremioMultiplicador.data[i]['VRBONUSTODOS']);
          
      tableListaPremioMultiplicador.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorMultiplicador + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusTodasMultiplicador).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + tpApuracaorMultiplicador + `</label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function funcSucessListaPremioProvador(respostaPremioProvador) {

  contadorListPremProvador = 0;

  var numPageAtual = parseInt(respostaPremioProvador.page);
  if(numPageAtual === 1){
      
      $('#premprovador').html(
          `<table id="dt-lista-premio-provador" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" colspan="2" style="font-size: 12px; text-align:center">SENIOR/PLENO/JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">Apuração</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioProvador">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioProvador = $('#dt-lista-premio-provador').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "30%", "targets": 2 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioProvador.rows().remove().draw();
  }

  if(respostaPremioProvador.data.length != 0){
    for (var i = 0; i < respostaPremioProvador.data.length; i++) { 
        contadorListPremProvador ++;

          idPremioProvador = respostaPremioProvador.data[i]['IDPREMIACAO'];
          noIndicadorProvador = respostaPremioProvador.data[i]['NOINDICADOR'];
          tpApuracaorProvador = respostaPremioProvador.data[i]['TPAPURACAO'];
          VrBonusTodasProvador = parseFloat(respostaPremioProvador.data[i]['VRBONUSTODOS']);

      tableListaPremioProvador.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorProvador + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusTodasProvador).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + tpApuracaorProvador + `</label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function funcSucessListaPremioFiscal(respostaPremioFiscal) {

  contadorListPremFiscal = 0;

  var numPageAtual = parseInt(respostaPremioFiscal.page);
  if(numPageAtual === 1){
      
      $('#premfiscal').html(
          `<table id="dt-lista-premio-fiscal" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" colspan="2" style="font-size: 12px; text-align:center">SENIOR/PLENO/JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">Apuração</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioFiscal">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioFiscal = $('#dt-lista-premio-fiscal').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "30%", "targets": 2 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioFiscal.rows().remove().draw();
  }

  if(respostaPremioFiscal.data.length != 0){
    for (var i = 0; i < respostaPremioFiscal.data.length; i++) { 
        contadorListPremFiscal ++;

          idPremioFiscal = respostaPremioFiscal.data[i]['IDPREMIACAO'];
          noIndicadorFiscal = respostaPremioFiscal.data[i]['NOINDICADOR'];
          tpApuracaorFiscal = respostaPremioFiscal.data[i]['TPAPURACAO'];
          VrBonusTodasFiscal = parseFloat(respostaPremioFiscal.data[i]['VRBONUSTODOS']);

      tableListaPremioFiscal.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorFiscal + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusTodasFiscal).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + tpApuracaorFiscal + `</label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function funcSucessListaPremioVendedor(respostaPremioVendedor) {

  contadorListPremVendedor = 0;

  var numPageAtual = parseInt(respostaPremioVendedor.page);
  if(numPageAtual === 1){
      
      $('#premvendedor').html(
          `<table id="dt-lista-premio-vendedor" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" colspan="2" style="font-size: 12px; text-align:center">SENIOR/PLENO/JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">Apuração</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioVendedor">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioVendedor = $('#dt-lista-premio-vendedor').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "30%", "targets": 2 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioVendedor.rows().remove().draw();
  }

  if(respostaPremioVendedor.data.length != 0){
    for (var i = 0; i < respostaPremioVendedor.data.length; i++) { 
        contadorListPremVendedor ++;

          idPremioVendedor = respostaPremioVendedor.data[i]['IDPREMIACAO'];
          noIndicadorVendedor = respostaPremioVendedor.data[i]['NOINDICADOR'];
          tpApuracaorVendedor = respostaPremioVendedor.data[i]['TPAPURACAO'];
          VrBonusTodasVendedor = parseFloat(respostaPremioVendedor.data[i]['VRBONUSTODOS']);

      tableListaPremioVendedor.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorVendedor + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusTodasVendedor).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + tpApuracaorVendedor + `</label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function funcSucessListaPremioLiderSubGerente(respostaPremioLiderSubGerente) {

  contadorListPremLiderSubGerente = 0;

  var numPageAtual = parseInt(respostaPremioLiderSubGerente.page);
  if(numPageAtual === 1){
      
      $('#premlidersubgerente').html(
          `<table id="dt-lista-premio-lidersubgerente" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                <tr>
                    <td class="bg-primary-400" style="font-size: 12px; text-align:center">CLASSIFICAÇÃO</td>
                    <td class="bg-warning-400" colspan="2" style="font-size: 12px; text-align:center">SENIOR/PLENO/JUNIOR</td>
                </tr>
                <tr>
                    <td class="bg-primary-200" style="font-size: 12px; text-align:center">INDICADORES</td>
                    <td class="bg-warning-200" style="font-size: 12px; text-align:center">BÔNUS</td>
                    <td class="bg-danger-200" style="font-size: 12px; text-align:center">Apuração</td>
                </tr>
              </thead>
              <tbody id="resultadoListaPremioLiderSubGerente">
              </tbody>
              <tfoot id=""class="thead-themed">
              </tfoot>
          </table>`
      );
            
      var tableListaPremioLiderSubGerente = $('#dt-lista-premio-lidersubgerente').DataTable({
          "columnDefs": [
              { "width": "55%", "targets": 0 },
              { "width": "15%", "targets": 1 },
              { "width": "30%", "targets": 2 }
          ],
          deferRender: true,
          paging: false,
          ordering:  false,
          searching: false,
          info: false,
          //scrollY:        800,
          //scrollCollapse: false,
          //scroller:       false,
          responsive: true,
          dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                      "<'row'<'col-sm-12'tr>>" +
                      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          buttons: [

          ]

      });
      
      tableListaPremioLiderSubGerente.rows().remove().draw();
  }

  if(respostaPremioLiderSubGerente.data.length != 0){
    for (var i = 0; i < respostaPremioLiderSubGerente.data.length; i++) { 
        contadorListPremLiderSubGerente ++;

          idPremioLiderSubGerente = respostaPremioLiderSubGerente.data[i]['IDPREMIACAO'];
          noIndicadorLiderSubGerente = respostaPremioLiderSubGerente.data[i]['NOINDICADOR'];
          tpApuracaorLiderSubGerente = respostaPremioLiderSubGerente.data[i]['TPAPURACAO'];
          VrBonusTodasLiderSubGerente = parseFloat(respostaPremioLiderSubGerente.data[i]['VRBONUSTODOS']);

      tableListaPremioLiderSubGerente.row.add([
              `<label style="color: blue; font-size: 11px;">` + noIndicadorLiderSubGerente + `</label>`,
              `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(VrBonusTodasLiderSubGerente).toFixed(2)) + ` </label>`,
              `<label style="color: blue; font-size: 11px;">` + tpApuracaorLiderSubGerente + `</label>`,
          ]).draw(false);
          
    }
      
  }else{
  }

}

function ListaPremiacoesPeriodo(){

    dataRetornoListaPremio = [];
    numPage = 1;
    contador = 0;
    
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

        	$("#idmarca").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Premiações - <span class='fw-300'></span>`);
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);
        		
        	ajaxGetComAnimacaoDeCarregamento(`api/comercial/lista-premiacoes.xsjs?page=${numPage}`, "Carregando Dados, aguarde...", retornoListaPremiacoes, "Erro ao Carregar os Dados");

      }
    };
    xmlhttp.open("GET", "comercial_action_premiacao.html", true);
    xmlhttp.send();
}

function chamarProximaListaPremiacoes(numPage){

    ajaxGet('api/comercial/lista-premiacoes.xsjs?page=' + numPage)
    	.then(retornoListaPremiacoes)
    	.catch((e) => { funcError(), console.log(e) });
}

function retornoListaPremiacoes(respostaListaPremiacoes) {

  var numPageAtual = parseInt(respostaListaPremiacoes.page);

  if (respostaListaPremiacoes.data.length != 0) {
    for (var i = 0; i < respostaListaPremiacoes.data.length; i++) {
        contador++;
        idSubEmpresaPrem = respostaListaPremiacoes.data[i]['IDSUBGRUPOEMPRESARIAL'];
        dataIniPremFormat = respostaListaPremiacoes.data[i]['DTPREMIOINICIOFORMAT'];
        dataFimPremFormat = respostaListaPremiacoes.data[i]['DTPREMIOFIMFORMAT'];
        dataIniPrem = respostaListaPremiacoes.data[i]['DTPREMIOINICIO'];
        dataFimPrem = respostaListaPremiacoes.data[i]['DTPREMIOFIM'];
        DsSubGrupoPrem = respostaListaPremiacoes.data[i]['DSSUBGRUPOEMPRESARIAL'];
        StAtivoPrem = respostaListaPremiacoes.data[i]['STATIVO'];

        if(StAtivoPrem == 'True'){
            labelstprem = `<label style="color: blue; font-size: 10px;">ATIVO</label>`;
        }else{
            labelstprem = `<label style="color: red; font-size: 10px;">INATIVO</label>`;
        }
            
        btnOpcao = `<div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-info btn-xs" title="Detalhar Premiação" id="` + idSubEmpresaPrem + `" onclick="detalhe_premiacao(this.id,dataIniPrem,dataFimPrem,DsSubGrupoPrem)" ><i class="fal fa-eye"></i></button>
                    </div>`;
              
            dataRetornoListaPremio.push([
                contador,
                DsSubGrupoPrem,
                dataIniPremFormat,
                dataFimPremFormat,
                labelstprem,
                btnOpcao]);

    }
    
    chamarProximaListaPremiacoes(numPageAtual + 1);

  } else {
      
    $('#resultadopremio').html(
      `<table id="dt-basic-lista-premios" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
              <thead class="bg-primary-600">
                  <tr>
                      <th>*</th>
                      <th>Grupo Empresarial</th>
                      <th>Data Inicio</th>
                      <th>Data Fim</th>
                      <th>Situação</th>
                      <th>Opção</th>
                  </tr>
              </thead>
              <tbody id="resultadoListaPremios">
              </tbody>
              <tfoot id="totalListaListaPremios"class="thead-themed">
              </tfoot>
          </table>`
    );

    $('#dt-basic-lista-premios').DataTable({
      data: dataRetornoListaPremio,
      deferRender: true,
      //scrollY:        800,
      //scrollCollapse: false,
      //scroller:       false,
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
    });

  }

}

function detalhe_premiacao(idsubgrupo,dtpremini,dtpremfim,dsSubEmp){
    
    dataRetornoDetPremios=[];
    contador = 0;
    
    numPage = 1;
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultadopremio").innerHTML = xmlhttp.responseText;
        //newDataTable();
        
        $('.dataAtual').text(dataAtual);

        BuscaPremioGerente(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);
        BuscaPremioLiderLoja(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);
        BuscaPremioLiderCaixa(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);
        BuscaPremioOperadorCaixa(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);
        BuscaPremioAssistente(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);
        BuscaPremioMultiplicador(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);
        BuscaPremioProvador(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);
        BuscaPremioFiscal(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);
        BuscaPremioVendedor(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);
        BuscaPremioLiderSubGerente(idsubgrupo,dtpremini,dtpremfim,dsSubEmp);

      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqdetpremios.html", true);
    xmlhttp.send();
}

function modal_criar_premiacao() {

    let idmarcapremio =  $("#idmarca option:selected").val();
    let dsmarcapremio = $("#idmarca option:selected").text();
    let DTInicpremio =  $("#dtconsultainicio").val();
    let DTFimpremio =  $("#dtconsultafim").val();

    $.get('comercial_action_cadpremiomodal.html', function(res) {
      
          $('#resulmodalcadpremio').html(res);
          $("#modalPremios").modal('show');
          $('#modalPremios').on('shown.bs.modal', function() {
    
                $("#IDMarcaPremio").val(idmarcapremio);
                $('#nomegrupempresa').val(dsmarcapremio);
                $('#dtpremioinicio').val(DTInicpremio);
                $('#dtpremiofim').val(DTFimpremio);
              
          });		
    
    })
    
    ajaxGet('api/comercial/lista_premiacaocad.xsjs?idPremioSubGrupoEmp=' + idmarcapremio + '&DTInicPremio=' + DTInicpremio + '&DTFimPremio=' + DTFimpremio)
    	.then(retornoListaPremiacoesCad)
    	.catch((e) => { funcError(), console.log(e) });
}

function cadastrar_premios() {
  
    let idgrupoemppremio = $("#IDMarcaPremio").val();
    let dtinicpremio = $("#dtpremioinicio").val();
    let dtfimpremio = $("#dtpremiofim").val();
    let dsfuncpremio = $("#dsfuncaopremio").val();
    let dsindicpremio = $("#dsindicadorpremio").val();
    let dsapurapremio = $("#dsapuracao").val();
    let vrbonuspremiosenior = $("#VrBonusPremioSenior").val().replace(".", "").replace(",", ".");
    let vrbonuspremiopleno = $("#VrBonusPremioPleno").val().replace(".", "").replace(",", ".");
    let vrbonuspremiojunior = $("#VrBonusPremioJunior").val().replace(".", "").replace(",", ".");
    let vrbonuspremiotodos = $("#VrBonusPremioTodos").val().replace(".", "").replace(",", ".");
    let StAtivopremio = 'True';

    if(vrbonuspremiosenior == ''){

      Swal.fire({
          type: "warning",
          title: "O valor do Bonus não pode ser zero! ",
          showConfirmButton: false,
          timer: 2000
      });
      return;
      
    }else{
        
        var dados = [{ 
            "DTPREMIOINICIO":dtinicpremio,
            "DTPREMIOFIM":dtfimpremio,
            "IDSUBGRUPOEMPRESARIAL":parseInt(idgrupoemppremio),
            "NOFUNCAO":dsfuncpremio,
            "NOINDICADOR":dsindicpremio,
            "TPAPURACAO":dsapurapremio,
            "VRBONUSSENIOR":parseFloat(vrbonuspremiosenior),
            "VRBONUSPLENO":parseFloat(vrbonuspremiopleno),
            "VRBONUSJUNIOR":parseFloat(vrbonuspremiojunior),
            "VRBONUSTODOS":parseFloat(vrbonuspremiotodos),
            "STATIVO":StAtivopremio
        }];
        
        ajaxPost("api/comercial/cadastrar-premiacoes.xsjs", dados)
        .then(funcSucessCadPremiacao)
        .catch(funcError);
    }
}

async function funcSucessCadPremiacao(resposta) {

    contador = 0;
    let idgrupoemppremiocad = $("#IDMarcaPremio").val();
    let dtinicpremiocad = $("#dtpremioinicio").val();
    let dtfimpremiocad = $("#dtpremiofim").val();
    
    await ajaxGet('api/comercial/lista_premiacaocad.xsjs?idPremioSubGrupoEmp=' + idgrupoemppremiocad + '&DTInicPremio=' + dtinicpremiocad + '&DTFimPremio=' + dtfimpremiocad)
    	.then(retornoListaPremiacoesCad)
    	.catch((e) => { funcError(), console.log(e) });
    	
    Swal.fire({
      type: "success",
      title: "Premiação Cadastrada com Sucesso ",
      showConfirmButton: false,
      timer: 2000,
      target: document.getElementById('modalPremios'),
    });

}

function selecaofuncao() {

    let dspremiofuncao = $('#dsfuncaopremio').val();

    if(dspremiofuncao === 'GERENTE' || dspremiofuncao === 'LIDER DE LOJA' || dspremiofuncao === 'LIDER DE CAIXA'){
        
        $('#VrBonusPremioTodos').prop('readonly', true);
        $('#VrBonusPremioSenior').prop('readonly', false);
        $('#VrBonusPremioPleno').prop('readonly', false);
        $('#VrBonusPremioJunior').prop('readonly', false);
        
    }else{
        $('#VrBonusPremioTodos').prop('readonly', false);
        $('#VrBonusPremioSenior').prop('readonly', true);
        $('#VrBonusPremioPleno').prop('readonly', true);
        $('#VrBonusPremioJunior').prop('readonly', true);
    }
}

function retornoListaPremiacoesCad(respostaListaPremiacoesCad) {

    var numPageAtual = parseInt(respostaListaPremiacoesCad.page);
        if(numPageAtual === 1){
            contador = 0;
          
            $('#resultadolistpremiocad').html(
              `<table id="dt-basic-lista-premioscad" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                      <thead class="bg-primary-600">
                          <tr>
                              <th>*</th>
                              <th>Função</th>
                              <th>Indicador</th>
                              <th>Apuração</th>
                              <th>Vr Bonus Senior</th>
                              <th>Vr Bonus Pleno</th>
                              <th>Vr Bonus Junior</th>
                              <th>Vr Bonus Todos</th>
                              <th>Opção</th>
                          </tr>
                      </thead>
                      <tbody id="resultadoListaPremiosCad">
                      </tbody>
                      <tfoot id="totalListaListaPremiosCad"class="thead-themed">
                      </tfoot>
                  </table>`
            );
        
            var dataRetornoListaPremioCad = $('#dt-basic-lista-premioscad').DataTable({
              deferRender: true,
              //scrollY:        800,
              //scrollCollapse: false,
              //scroller:       false,
              responsive: true,
              dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
              buttons: [
        
              ]
            });
          
            dataRetornoListaPremioCad.rows().remove().draw();
            $('#resultadoListaPremiosCad').html('');
      
          
        }
    if (respostaListaPremiacoesCad.data.length != 0) {
        for (var i = 0; i < respostaListaPremiacoesCad.data.length; i++) {
        contador++;
        
        idPremioCad = respostaListaPremiacoesCad.data[i]['IDPREMIACAO'];
        noIndicadorCad = respostaListaPremiacoesCad.data[i]['NOINDICADOR'];
        noFuncCad = respostaListaPremiacoesCad.data[i]['NOFUNCAO'];
        TpApuracaoCad = respostaListaPremiacoesCad.data[i]['TPAPURACAO'];
        VrBonusSeniorCad = parseFloat(respostaListaPremiacoesCad.data[i]['VRBONUSSENIOR']);
        VrBonusPlenoCad = parseFloat(respostaListaPremiacoesCad.data[i]['VRBONUSPLENO']);
        VrBonusJuniorCad = parseFloat(respostaListaPremiacoesCad.data[i]['VRBONUSJUNIOR']);
        VrBonusTodasCad = parseFloat(respostaListaPremiacoesCad.data[i]['VRBONUSTODOS']);
    
        btnOpcao = `<div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-danger btn-xs" title="Cancelar Premio" id="` +idPremioCad + `" value="` +idPremioCad + `" onclick="modal_Cancel_Premio(this.id,\'True\', this.value)" ><span class="fal fa-trash-alt"></span></button>
                    </div>`;
                    
        dataRetornoListaPremioCad.row.add([
               `<label style="color: blue; font-size: 11px;">` + contador + `</label>`,
               `<label style="color: blue; font-size: 11px;">` + noFuncCad + ` </label>`,
               `<label style="color: blue; font-size: 11px;">` + noIndicadorCad + ` </label>`,
               `<label style="color: blue; font-size: 11px;">` + TpApuracaoCad + ` </label>`,
               `<label style="color: blue;">` + mascaraValor(parseFloat(VrBonusSeniorCad).toFixed(2)) + `</label>`,
               `<label style="color: blue;">` + mascaraValor(parseFloat(VrBonusPlenoCad).toFixed(2)) + `</label>`,
               `<label style="color: blue;">` + mascaraValor(parseFloat(VrBonusJuniorCad).toFixed(2)) + `</label>`,
               `<label style="color: blue;">` + mascaraValor(parseFloat(VrBonusTodasCad).toFixed(2)) + `</label>`,
               btnOpcao,
        ]).draw(false);
            
    }
    } else {
    }

}

function modal_Cancel_Premio(id,status,idresp) {
  
      Swal.fire({
            title: 'Certeza que Deseja Cancelar essa Premiação?',
            text: "Você não poderá reverter esta ação!",
            buttonsStyling: false,
            showCancelButton: true,
            customClass: {
              confirmButton: 'btn btn-primary btn-lg',
              cancelButton: 'btn btn-danger btn-lg',
              loader: 'custom-loader'
            },
            loaderHtml: '<div class="spinner-border text-primary"></div>',
            allowOutsideClick: () => !Swal.isLoading(),
            target: document.getElementById('modalPremios'),
      }).then((result) => {
            Swal.fire({
              type:'question',
              title: 'Motivo do Cancelamento da Premiação?',
              html: `<div>
                          <div class=" input-group pt-0" >
                              <input type="text" id="motivoCancelPremio" class="swal2-input m-0 " placeholder="Motivo do Cancelamento da Premiação!" style="text-transform: uppercase">
                          </div>
                      </div>`,
              width: '25rem',
              focusConfirm: false,
              showCancelButton: true,
              confirmButtonText: 'Confirmar',
              cancelButtonText: 'Voltar',
              cancelButtonColor: '#3085d6',
              showLoaderOnConfirm: true,
              target: document.getElementById('modalPremios'),
              preConfirm: () => {
                  
                  motivoCancelPremio = $('#motivoCancelPremio').val();
            
                  if (!motivoCancelPremio) {
                      Swal.showValidationMessage(`Coloque o Motivo da Cancelamento do Premio!`);
                      $('#motivoCancelPremio').focus();
                      return false;
            
                  } else if (motivoCancelPremio.length < 10) {
                      Swal.showValidationMessage(`Motivo Muito Curto, O Motivo Deve Conter no Minímo 10 Caracteres!`)
                      $('#motivoCancelPremio').val('').focus();
                      return false;
            
                  } else {
                  }
              }
            }).then((result) => {
                    
                      if (result.dismiss == 'timer') {
                    
                          Swal.fire({
                              type: 'error',
                              title: `Tempo de resposta ou inatividade atingido`,
                              timer: 60000,
                              target: document.getElementById('modalPremios'),
                          })
                      } else if (result.dismiss == 'cancel' || result.dismiss == 'esc') {
                          return false;
                      } else{
                      
                            let barraCarregamento = `<div id="BarraCarregamento" class="progress">
                                <div  class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>
                            </div>`
                                
                            Swal.fire({
                                html: barraCarregamento,
                                type: 'info',
                                title: 'Carregando Dados...Aguarde!',
                                timer: 180000,
                                backdrop: false,
                                allowEscapeKey: false,
                                allowOutsideClick: false,
                                target: document.getElementById('modalPremios'),
                                onOpen: async () => {
                                    
                                    Swal.showLoading();
                                    var dados = {
                                      "IDPREMIACAO": parseInt(id),
                                      "IDFUNCIONARIOCANCEL": parseInt(IDFuncionarioLogin),
                                      "DSMOTIVOCANCELAMENTO": (motivoCancelPremio)
                                    };
                        
                                    await ajaxPut("api/comercial/atualizacao-status-premio.xsjs", dados)
                                        .then((respostaPut)=>{
                                           Swal.close();
                                           funcSucessUpdateStatusPremio();
                                        }).catch(funcError);
                                        
                                }
                            }).then((result) => {
                                if (result.dismiss == "timer") {
                                  Swal.close();
                                
                                  Swal.fire({
                                      type: 'error',
                                      title: "Erro ao carregar os dados, recarregue a página e tente novamente",
                                      timer: 15000,
                                      target: document.getElementById('modalPremios'),
                                  });
                                  return false;
                                }
                            })
                                
                                let animacaoBarra = setInterval(() => {
                                let barra = $($('.pace-progress')[0]).attr('data-progress')
                                let barra2 = $($('.pace-progress')[0]).attr('data-progress-text')
                                
                                $('#BarraCarregamento').html(`
                                  <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="${barra}" aria-valuemin="0" aria-valuemax="100" style="width: ${barra}%">${barra}%</div>
                                  `)
                                }, 700)
                        
                      }
            })
      })
}

async function funcSucessUpdateStatusPremio(resposta) {

    contador = 0;
    let idgrupoemppremiocad = $("#IDMarcaPremio").val();
    let dtinicpremiocad = $("#dtpremioinicio").val();
    let dtfimpremiocad = $("#dtpremiofim").val();
    
    await ajaxGet('api/comercial/lista_premiacaocad.xsjs?idPremioSubGrupoEmp=' + idgrupoemppremiocad + '&DTInicPremio=' + dtinicpremiocad + '&DTFimPremio=' + dtfimpremiocad)
    	.then(retornoListaPremiacoesCad)
    	.catch((e) => { funcError(), console.log(e) });
    	
    Swal.fire({
      type: "success",
      title: "Premiação Excluída com Sucesso ",
      showConfirmButton: false,
      timer: 2000,
      target: document.getElementById('modalPremios'),
    });

}
