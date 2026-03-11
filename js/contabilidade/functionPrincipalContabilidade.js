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
var totalQTDProduto = 0; 
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

function maskValor(valor) {
  return new Intl.NumberFormat('br-BR', { style: 'currency', currency: 'BRL' }).format(valor)
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

//////////////// PÃ¡gina Inicial //////////////////

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
});

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

	for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

		IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
		DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

			$('#idloja').append(
				`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
			);
	}
	
}

function retornoListaMarcaSelect(respostaListaMarcas) {

	for (var i = 0; i < respostaListaMarcas.data.length; i++) {

		IDMarca = respostaListaMarcas.data[i]['IDGRUPOEMPRESARIAL'];
		DSMarca = respostaListaMarcas.data[i]['DSGRUPOEMPRESARIAL'];

			$('#idmarca').append(
				`<option value="` + IDMarca + `"> ` + DSMarca + `</option>`
			);
	} 
	
	ajaxGet('api/informatica/empresa.xsjs')
	.then(retornoListaEmpresasSelect)
	.catch(funcError);
}

function funcError(data) {
	Swal.fire({
		type: "error",
		title: "Erro ao carregar os dados da página",
		showConfirmButton: false,
		timer: 15000
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
        	$("#idloja").select2();
        	
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

function pesq_vendas_marcas(){
    var IDMarcaPesqVenda = $("#idmarca").val();
    var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
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
      
        ajaxGet('api/contabilidade/venda-produto.xsjs?dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa)
        	.then(retornoListaVendasMarca)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "contabilidade_action_pesqvendasmarca.html", true);
    xmlhttp.send();
} 

function retornoListaVendasMarca(respostaListaVendasPeriodo) {
         
    if(respostaListaVendasPeriodo.data.length != 0){
    	for (var i = 0; i < respostaListaVendasPeriodo.data.length; i++) {
            contador ++;
    	    idEmpresaMarca = respostaListaVendasPeriodo.data[i]['FILIAL'];
            dtEmissao = respostaListaVendasPeriodo.data[i]['DATAEMISSAO'];
            nVendaMarca = respostaListaVendasPeriodo.data[i]['NVENDA'];
            nNF = respostaListaVendasPeriodo.data[i]['NF'];
            nSerie = respostaListaVendasPeriodo.data[i]['SERIE'];
            vrUnitProduto = respostaListaVendasPeriodo.data[i]['VALORUNITPROD'];
            vrProduto = respostaListaVendasPeriodo.data[i]['VALORPROD'];
            qtdProduto = respostaListaVendasPeriodo.data[i]['QTD'];
            vrDesconto = respostaListaVendasPeriodo.data[i]['VALORDESCONTO'];
            vrNF = respostaListaVendasPeriodo.data[i]['VALORNF'];
            codProd = respostaListaVendasPeriodo.data[i]['CODPRODUTO'];
            dsProduto = respostaListaVendasPeriodo.data[i]['DESCRICAO'];
            nNCM = respostaListaVendasPeriodo.data[i]['NCM'];
            stStituacao = respostaListaVendasPeriodo.data[i]['SITUACAO'];
            chaveNF = respostaListaVendasPeriodo.data[i]['CHAVE'];

            totalQTDProduto = parseFloat(totalQTDProduto) + parseFloat(qtdProduto);
            totalVrProduto = parseFloat(totalVrProduto) + parseFloat(vrProduto);
            totalVrDesconto = parseFloat(totalVrDesconto) + parseFloat(vrDesconto);
            totalVrNF = parseFloat(totalVrNF) + parseFloat(vrNF);
            
			$('#resultadoVendaMarcaPeriodo').append(
				`<tr>
                    <td><label style="color: blue; font-size: 11px;">` + contador +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + idEmpresaMarca +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + dtEmissao +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + nVendaMarca +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + nNF +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + nSerie +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrUnitProduto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue; font-size: 11px;">` + qtdProduto +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrProduto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrDesconto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrNF).toFixed(2)) +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + codProd +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + dsProduto +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + nNCM +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + stStituacao +	`</label></td>
                </tr>`
			);
			
            $('#totalResultadoVendaMarcaPeriodo').html(
        		`<tr>
                    <th colspan="7" style="text-align: center;">Total</th>
                    <th style="text-align: right;">` + (parseFloat(totalQTDProduto)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrProduto).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrDesconto).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrNF).toFixed(2)) + `</th>
                    <th colspan="4" style="text-align: center;"></th>
                </tr>`
        	);
    	}

    }

}

function pesq_vendas_marcas_consolidada(numPage){
    dataRetorno=[];
    totalVrProduto = 0;
    totalVrDesconto = 0;
    totalVrNF = 0;
    totalQTDProduto = 0;
    contador = 0;
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
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
        //newDataTable('venda-consolidada');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/contabilidade/venda-produto-consolidado.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa)
        	.then(retornoListaVendasMarcaConsolidado)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "contabilidade_action_pesqvendasmarcaconsolidado.html", true);
    xmlhttp.send();
} 

function chamarProximaListaPeriodoConsolidado(numPage){
    
    var IDMarcaPesqVenda = $("#idmarca").val();
    var IDLojaPesqVenda = $("#idloja").val();
    var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
        ajaxGet('api/contabilidade/venda-produto-consolidado.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa)
        	.then(retornoListaVendasMarcaConsolidado)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasMarcaConsolidado(respostaListaVendasPeriodoConsolidado) {
                    
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

//================ VENDAS EM CONTINGENCIA =================================
async function ajaxGetComAnimacaoDeCarregamento(request, mensagem = 'Carregando Dados...', funcaoRetorno, msgErro = '') {

  let barraCarregamento = `<div id="BarraCarregamento" class="progress">
                              <div  class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>
                          </div>`

  Swal.fire({
      html: barraCarregamento,
      type: 'info',
      title: mensagem,
      timer: 180000,
      backdrop: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      onOpen: async () => {
          Swal.showLoading();

          await ajaxGet(request)
              .then(funcaoRetorno)
              .catch(() => {
                funcError(msgErro)
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

function ListaVendasContingencia(){
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
        $("#filialvenda").select2();
        
        $('.DescTituloListaVendas').html(`
          <i class='subheader-icon fal fa-chart-area'></i> Lista de Vendas Em Contigência - <span class='fw-300'></span>
        `);
    
        ajaxGetComAnimacaoDeCarregamento('api/informatica/marca.xsjs', "Carregando Marcas, Aguarde...", retornoListaMarcaSelectVendaContingencia, "Erro ao Carregar as Marcas, Recarregue a página!")

        ajaxGetComAnimacaoDeCarregamento('api/empresa.xsjs', "Carregando Filiais, Aguarde...", retornoSelectFiliaisPorMarca, "Erro ao Carregar as Filiais, Recarregue a página!")

    }
  };
  xmlhttp.open("GET", "contabilidade_action_listaVendasContingencia.html", true);
  xmlhttp.send();
}

function retornoListaMarcaSelectVendaContingencia(respostaListaMarcas) {

	for (var i = 0; i < respostaListaMarcas.data.length; i++) {

		IDMarca = respostaListaMarcas.data[i]['IDGRUPOEMPRESARIAL'];
		DSMarca = respostaListaMarcas.data[i]['DSGRUPOEMPRESARIAL'];

			$('#idmarca').append(
				`<option value="` + IDMarca + `"> ` + DSMarca + `</option>`
			);
	} 
}

function selectFiliaisPorMarca(idMarca = ''){
  $('#filialvenda').attr('disabled', false);

  ajaxGetComAnimacaoDeCarregamento(`api/empresa.xsjs?idSubGrupoEmpresa=${idMarca}`, "Carregando Filiais por Marca, Aguarde...", retornoSelectFiliaisPorMarca, "Erro ao Carregar as Filiais, tente novamente!");

}

function retornoSelectFiliaisPorMarca(respostaSelectFiliaisPorMarca){
  var dadosFiliais = respostaSelectFiliaisPorMarca.data.length ? respostaSelectFiliaisPorMarca.data : "";

  $('#filialvenda').html(`
      <option value="">Todas</option>
      `)

  if(dadosFiliais){
    for(let i = 0; i < dadosFiliais.length; i++){
      var IDEMPRESA = dadosFiliais[i]['IDEMPRESA'];
      var NOFANTASIA = dadosFiliais[i]['NOFANTASIA'];

      $('#filialvenda').append(`
      <option value="${IDEMPRESA}">${NOFANTASIA}</option>
      `)
    }
  }

}

function pesqVendasContingencia() {
  var IDMarcaPesqVenda = $("#idmarca").val();
  var idEmpresa = $("#filialvenda").val();
  var datapesqinicio = $("#dtconsultainicio").val();
  var datapesqfim = $("#dtconsultafim").val();
  let barraCarregamento = `<div id="BarraCarregamento" class="progress">
                                      <div  class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>
                                  </div>`;

  Swal.fire({
    html: barraCarregamento,
    type: 'info',
    title: 'Carregando Vendas, Aguarde...',
    timer: 180000,
    backdrop: false,
    allowEscapeKey: false,
    allowOutsideClick: false,
    onOpen: async () => {
      Swal.showLoading();

      if(!IDMarcaPesqVenda && !idEmpresa || IDMarcaPesqVenda && !idEmpresa){
      await ajaxGet(`api/contabilidade/lista-venda-contingencia.xsjs?idGrupoEmpresarial=${IDMarcaPesqVenda}&dataInicio=${datapesqinicio}&dataFim=${datapesqfim}`)
        .then(retornoListaVendasContingencia)
        .catch(() => {
          funcaoMsgErro('Erro ao Carregar as Vendas, Tente Novamente Mais Tarde!')
          clearInterval(animacaoBarra);
        });
      } else{
        await ajaxGet(`api/contabilidade/lista-venda-contingencia.xsjs?idEmpresa=${idEmpresa}&dataInicio=${datapesqinicio}&dataFim=${datapesqfim}`)
        .then(retornoListaVendasContingencia)
        .catch(() => {
          funcaoMsgErro('Erro ao Carregar as Vendas, Tente Novamente Mais Tarde!')
          clearInterval(animacaoBarra);
        });
      }
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

function retornoListaVendasContingencia(respostaListaVendasContingencia) {
  var dadosTabela = [];
  var dadosVenda = respostaListaVendasContingencia.data.length ? respostaListaVendasContingencia.data : "";
  var pagina = +respostaListaVendasContingencia.page;
  var contador = 0;

  if(dadosVenda){
    for (let i = 0; i < dadosVenda.length; i++) {
      contador++;
      var NomeEmpresa = dadosVenda[i]['NOFANTASIA'];
      var idVenda = dadosVenda[i]['IDVENDA'];
      var valorVenda = dadosVenda[i]['VRTOTALPAGO'] ? maskValor(dadosVenda[i]['VRTOTALPAGO']) : "";
      var motivoContingencia = dadosVenda[i]['PROTNFE_INFPROT_XMOTIVO'] ? dadosVenda[i]['PROTNFE_INFPROT_XMOTIVO'] : "Sem Motivo";
      var opcoes = `
        <div class="btn-group btn-group-xs">
          <button id="detalharVendaContingencia" type="button" class="btn btn-success btn-xs" title="Detalhar Produtos da Venda" value="${idVenda}"><i class="fal fa-list "></i></button>
        </div> 
      `;
      
      dadosTabela.push([
        contador,
        NomeEmpresa,
        idVenda,
        valorVenda,
        motivoContingencia,
        opcoes
      ]);
    }

  }

  if (dadosVenda.length == 1000) {
    proximaPaginaVendaContingencia(pagina)

  } else {
    Swal.close();
    $('#resultado').html(
      `<table id="dt-basic-list-vendaContingencia" class="table table-bordered table-hover table-striped w-100 ">
          <thead class="bg-primary-600">
              <tr >
                  <th style="width: 5px; text-align: center; font-size: 12px;">#</th>
                  <th style="width: 10px; text-align: center; font-size: 12px;"><b>Empresa<b></th>
                  <th style="width: 10px; text-align: center; font-size: 12px;"><b>Venda<b></th>
                  <th style="width: 15px; text-align: center; font-size: 12px;"><b>Valor<b></th>
                  <th style="width: 10px; text-align: center; font-size: 12px;"><b>Motivo<b></th>
                  <th style="width: 10px; text-align: center; font-size: 12px;"><b>Opções<b></th>
              </tr>
          </thead>
          <tbody>
          </tbody>
      </table>`
    );
    
    var tableVendaContingencia = $('#dt-basic-list-vendaContingencia').DataTable({
        data: dadosTabela,
        "columnDefs": [
          { "width": "10%", "targets": [0] },
          { "width": "25%", "targets": [1] },
          { "width": "10%", "targets": [2, 3] },
          { "width": "30%", "targets": [4] },
          { "width": "25%", "targets": [5] },
          { "className": 'text-left', "targets": [0] },
          { "className": 'text-center', "targets": [1, 2, 3, 4, 5] }

        ],
        "displayLength": 25,

        // "paging":   false,
        // "ordering": false,
        // "info":     false,
        // "searching":     false,
        // deferRender:    false,
        scrollY:        false,
        // scrollCollapse: false,
        // scroller:       false,

      });
  }

  $('#dt-basic-list-vendaContingencia tbody').on('click', 'button#detalharVendaContingencia', function () {
    var tr = $(this).closest('tr');
    var row = tableVendaContingencia.row(tr);
    var idVendaLinha;
     
    if(tr.hasClass('child')){
      tr = $($(`#${$(this).attr('value')}`).closest('tr'))

      row = tableVendaContingencia.row(tr);
      idVendaLinha =  this.value//tr[0].children[1].innerText;  

     // tr.removeClass('parent'); 
      row.child.hide();
      tr.removeClass('shown');
      
    } else {
      row = tableVendaContingencia.row(tr);
      idVendaLinha =  this.value; //tr[0].children[1].innerText;  
    }
    

    if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');

    } else {
        
        let barraCarregamento = `<div id="BarraCarregamento" class="progress">
                                      <div  class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>
                                  </div>`

        Swal.fire({
            html: barraCarregamento,
            type: 'info',
            title: 'Carregando Detalhes da Venda, Aguarde...',
            timer: 180000,
            backdrop: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            onOpen: async () => {
                Swal.showLoading();

            await ajaxGet(`api/contabilidade/venda-detalhe.xsjs?idVenda=${idVendaLinha}`)
                    .then((dadosDetalheVenda) => {
                      ajaxGet(`api/contabilidade/venda-pagamento.xsjs?idVenda=${idVendaLinha}`)
                      .then((dadosPagementoVenda) => {
                        if(!dadosDetalheVenda.data.length){
                          funcaoMsgErro('Erro ao Carregar os Detalhes da Venda, Tente Novamente Mais Tarde!');

                          if(!dadosPagementoVenda.data.length){
                            funcaoMsgErro('Venda Sem Forma de Pagamento, Entre em Contato Com o Suporte!');
                          }
                        } else{
                          row.child(formatDataTableAccordionDetalheVendaContingencia(dadosDetalheVenda, dadosPagementoVenda)).show();
                        } 
                      })
                      .catch(() => {
                        funcaoMsgErro('Erro ao Carregar os Detalhes da Venda, Tente Novamente Mais Tarde!')
                        clearInterval(animacaoBarra);
                      });
                    })
                    .catch(() => {
                        funcaoMsgErro('Erro ao Carregar os Detalhes da Venda, Tente Novamente Mais Tarde!')
                        clearInterval(animacaoBarra);
                    })

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

        // row.child(formatDataTableVenda(numVoucherLinha)).show();
        tr.addClass('shown');
    }

  });
}

function proximaPaginaVendaContingencia(page){
  var IDMarcaPesqVenda = $("#idmarca").val();
  var datapesqinicio = $("#dtconsultainicio").val();
  var datapesqfim = $("#dtconsultafim").val();

  ajaxGet(`api/contabilidade/lista-venda-contingencia.xsjs?page=${++page}&idGrupoEmpresarial=${IDMarcaPesqVenda}&dataInicio=${datapesqinicio}&dataFim=${datapesqfim}`)
    .then(retornoListaVendasContingencia)
    .catch(funcError);
}

function formatDataTableAccordionDetalheVendaContingencia (dadosDetalheVenda, dadosPagamentoVenda) {
  var dadosDetalhe = dadosDetalheVenda.data.length ? dadosDetalheVenda.data : "";
  var dadosPagamento = dadosPagamentoVenda.data.length ? dadosPagamentoVenda.data : "";
  var idVenda = dadosDetalhe[0]['IDVENDA'];
  var contadorDet = 0;
  var contadorPag = 0;

// `d` is the original data object for the row
  html = `
    <div class="row">
      <div class="col-xl-12 col-sm-12">
        <div id="panel-1" class="panel">
          <div class="panel-hdr">
              <h2>Produtos da Venda: ${idVenda}</h2>
          </div>
          <div class="panel-container show">
              <div class="panel-content">
                <table id="DetalhePgto" class="table table-bordered table-hover table-striped w-100">
                  <thead>
                    <tr>
                      <th><b>#<b></th>
                      <th><b>ID Produto<b></th>
                      <th><b>Descrição<b></th>
                      <th><b>CoD.Barras<b></th>
                      <th><b>QTD<b></th>
                      <th><b>Vr.Produto<b></th>
                      <th><b>Vr.Liquido<b></th>
                    </tr>
                  </thead>`;
  if(!dadosDetalhe){
    html +=        `<tbody>
                      <tr><td valign="top" colspan="7" class="dataTables_empty">Venda Sem Dados Sobre os Produtos</td></tr>
                    </tbody>`;
  } else{
    for(let i=0; i< dadosDetalhe.length; i++){
      contadorDet++;
      var idProduto = dadosDetalhe[i]['CPROD'] ? dadosDetalhe[i]['CPROD'] : "";
      var dsProduto = dadosDetalhe[i]['XPROD'] ? (dadosDetalhe[i]['XPROD'].toUpperCase()) : "";
      var ncmProduto = dadosDetalhe[i]['NCM'] ? dadosDetalhe[i]['NCM'] : "";
      var CodBarrasProduto = dadosDetalhe[i]['CEAN'] != 'SEM GTIN' ? dadosDetalhe[i]['CEAN'] : dadosDetalhe[i]['NUCODBARRAS'];
      var qtdProduto = dadosDetalhe[i]['QTD'] ? dadosDetalhe[i]['QTD'] : "";
      var valorProduto = dadosDetalhe[i]['VUNCOM'] ? maskValor(dadosDetalhe[i]['VUNCOM']) : "";
      var valorPago = dadosDetalhe[i]['VUNTRIB'] ? maskValor(dadosDetalhe[i]['VUNTRIB']) : 'Sem Valor';
      var valorLiquido = dadosDetalhe[i]['VRTOTALLIQUIDO'] != 0.00 ? maskValor(dadosDetalhe[i]['VRTOTALLIQUIDO']) : valorRecebido;

      html += `        <tbody>
                          <tr>
                            <td>${contadorDet}</td>
                            <td>${idProduto}</td>
                            <td>${dsProduto}</td>
                            <td>${CodBarrasProduto}</td>
                            <td>${+qtdProduto}</td>
                            <td>${valorProduto}</td>
                            <td>${valorLiquido}</td>
                          </tr>
                      </tbody>`;

    }
  }

  html += `
                </table>
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
              <h2>Pagamentos da Venda: ${idVenda}</h2>
          </div>
          <div class="panel-container show">
              <div class="panel-content">
                <table id="DetalhePgto" class="table table-bordered table-hover table-striped w-100">
                  <thead>
                    <tr>
                      <th><b>#<b></th>
                      <th><b>Descrição<b></th>
                      <th><b>Tipo<b></th>
                      <th><b>Autorizador<b></th>
                      <th><b>Autorização<b></th>
                      <th><b>Parcelas<b></th>
                      <th><b>Valor Recebido<b></th>
                      <th><b>Valor Liquido<b></th>
                    </tr>
                  </thead>`;
  if (!dadosPagamento) {
    html += `<tbody>
              <tr><td valign="top" colspan="8" class="dataTables_empty">Venda Sem Formas de Pagamento</td></tr>
            </tbody>`;
  } else {
    for (let i = 0; i < dadosPagamento.length; i++){
    console.log(dadosPagamento.length);
    contadorPag++;
    var dsPagamento = dadosPagamento[i]['DSTIPOPAGAMENTO'] ? (dadosPagamento[i]['DSTIPOPAGAMENTO'].toUpperCase()) : "";
    var nomeTEF = dadosPagamento[i]['NOTEF'] ? dadosPagamento[i]['NOTEF'] : "---";
    var nomeAutorizador = dadosPagamento[i]['NOAUTORIZADOR'] ? dadosPagamento[i]['NOAUTORIZADOR'] : "---";
    var numAutorizacao = dadosPagamento[i]['NUAUTORIZACAO'] ? dadosPagamento[i]['NUAUTORIZACAO'] : "---";
    var numParcelas = dadosPagamento[i]['NPARCELAS'] ? dadosPagamento[i]['NPARCELAS'] : 0;
    var valorRecebido = dadosPagamento[i]['VALORRECEBIDO'] ? maskValor(dadosPagamento[i]['VALORRECEBIDO']) : "";
    var valorDeduzido = dadosPagamento[i]['VALORDEDUZIDO'] ? maskValor(dadosPagamento[i]['VALORDEDUZIDO']) : valorRecebido;
    var valorLiquido = dadosPagamento[i]['VALORLIQUIDO'] != 0.00 ? maskValor(dadosPagamento[i]['VALORLIQUIDO']) : valorRecebido;

    html += `        <tbody>
                        <tr>
                          <td>${contadorPag}</td>
                          <td>${dsPagamento}</td>
                          <td>${nomeTEF}</td>
                          <td>${nomeAutorizador}</td>
                          <td>${numAutorizacao}</td>
                          <td>${numParcelas}</td>
                          <td>${valorRecebido}</td>
                          <td>${valorLiquido}</td>
                        </tr>
                    </tbody>`;
    }
  }
  html +=        `</table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  return html;
}

function funcaoMsgErro(msg = 'Erro ao Carregar os Dados'){
  Swal.fire({
    type: 'error',
    title: msg,
    timer: 3000
  })
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
                        <td><b>ConvÃªnio</b></td>
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
             
            $('#tituloRelacaoVendasRecebimentoEletronico').html(`RelaÃ§ão das Vendas do Recebimento Tipo <span class="fw-300"> <i>`+id+` x</i></span>`)    
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

//========== INICIO Rotina - Visualizar/Baixar XML VENDA ==========//
// Autor: Hendryw Deyvison
// E-mail: hendryw.deyvison@gmail.com
// Data: 29/08/2024

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
    try {
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
    try {
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

async function abreModalXmlVenda(idVenda) {
    try {
        animationLoadingStart();

        let { IDVENDA, XML_FORMATADO } = await buscaXmlVenda(idVenda) || '';
        let xmlVenda = XML_FORMATADO;

        if (xmlVenda?.length) {
            let xml = await formataXml([xmlVenda].join('\n'));

            $('#resultadoModalGenerico').html(`
                <div class="container mt-5">
                    <h2>Xml Venda ID: ${IDVENDA}</h2>
                    <div class="form-group">
                        <textarea id="xmlText" class="font-weight-bold w-100" rows="20" readonly>${xml}</textarea>
                        <button class="btn btn-primary" title="Copiar Xml" onclick="copyXmlVendaText()">Copiar</button>
                        <button class="btn btn-info" title="Abrir em uma nova aba" onclick="abrirXmlVendaEmNovaAba('${IDVENDA}')">Nova Aba</button>
                        <button class="btn btn-success" title="Baixar xml da venda" onclick="downloadXmlVenda('${IDVENDA}')">Download</button>
                        <button class="btn btn-danger" title="Gerar DANFE da venda" onclick="gerarDanfePDF('${IDVENDA}')">PDF</button>
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

async function getDanfePDF(dados) {
    return $.ajax({
        url: 'https://quality-api.vercel.app/gerar-danfe',
        method: 'POST',
        data: JSON.stringify(dados),
        contentType: 'application/json',
        xhrFields: {
            responseType: 'blob'
        }
    });
}

async function gerarDanfePDF(idVenda) {
    animationLoadingStart('Gerando PDF, aguarde...');
    
    let xml = $('#xmlText').text();
    let dados = {
        idVenda,
        xml
    }
    let pdfBlob = await getDanfePDF({ idVenda, xml });
    let urlBlob = URL.createObjectURL(pdfBlob);

    window.open(urlBlob, '_blank');
    
    animationLoadingStop();
    /*
    if (tpNota == 1) {
        DANFe({xml: content})
        .then(res => {
            console.log(res)
            const blob = new Blob([res], { type: 'application/pdf' }); // <- usa res direto
            const url = URL.createObjectURL(blob);
        window.open(url);
        });
    } else {
        DANFCe({ xml: content }).then(res => {
            console.log(res)
            const blob = new Blob([res], { type: 'application/pdf' }); // <- usa res direto
            const url = URL.createObjectURL(blob);
            window.open(url);
        });
    }
    */
}

async function telaListaXmlVendas() {
    try{
        animationLoadingStart();

        let htmlPage = await $.get('contabilidade_action_listaVendasXml.html').catch((error)=>{throw error;});

        $("#js-page-content").html(htmlPage);
        $('.dataAtual').text(dataAtual);
        $('#dtconsultainicio').val(dataAtualCampo);
        $('#dtconsultafim').val(dataAtualCampo);

        await ajaxGetAllData('api/informatica/marca.xsjs')
            .then(retornoListaMarcaSelectVendaContingencia)
            .catch((error) => { throw error; });

        await ajaxGetAllData('api/empresa.xsjs')
            .then(retornoSelectFiliaisPorMarca)
            .catch((error) => { throw error; })


        $("#idmarca, #idloja, #filialvenda, #idStatusVenda").select2();

        animationLoadingStop();
    } catch(error){
        console.log(error);
        msgError();
    }
}

function pesqVendasXml() {
    let IDMarcaPesqVenda = $("#idmarca").val() || "";
    let idEmpresa = $("#filialvenda").val() || "";
    let datapesqinicio = $("#dtconsultainicio").val();
    let datapesqfim = $("#dtconsultafim").val();
    let statusVenda = $("#idStatusVenda").val() ||  "";

    if (statusVenda?.length) {
        if (statusVenda == 'CANCELADA') {
            statusVenda = "stCancelado=True";
        } else {
            statusVenda = `stContingencia=${(statusVenda == 'AUTORIZADA' ? 'False' : 'True')}&stCancelado=False`;
        }
    }
    
    ajaxGetAllData(`api/venda/venda-xml.xsjs?idGrupoEmpresarial=${IDMarcaPesqVenda}&idEmpresa=${idEmpresa}&${statusVenda}&dataInicio=${datapesqinicio}&dataFim=${datapesqfim}`)
        .then(retornoListaVendasXml)
        .catch((error) => {throw error;});
}

function retornoListaVendasXml(dadosVendas) {
    let { data } = dadosVendas || [];
    let dadosTabela = [];
    let contador = 0;

    if (data?.length) {
        data.map((venda)=>{
            let {
                NOFANTASIA,
                IDVENDA,
                SERIE,
                NF,
                IDCHAVENFE,
                CHAVENFE,
                STCONTINGENCIA,
                STCANCELADO,
                TXTMOTIVOCANCELAMENTO,
                VRTOTALPAGO,
                PROTNFE_INFPROT_XMOTIVO,
                XML_FORMATADO
            } =  venda || '';

            let chaveNF = CHAVENFE ? CHAVENFE : IDCHAVENFE.replace(/[a-zA-Z]*/g, '');
            let situacao = STCANCELADO == 'True' ? 'Cancelada' : STCONTINGENCIA == 'True' ? 'Contingência' : 'Autorizada';
            let motivo = STCANCELADO == 'True' ? TXTMOTIVOCANCELAMENTO : PROTNFE_INFPROT_XMOTIVO || "Sem Motivo";
            let btnOpacity = XML_FORMATADO?.length > 0 ? '100' : '75';
            let btnTitle = XML_FORMATADO?.length > 0 ? 'Visualizar Xml da Venda' : 'Venda Sem XML';
            let btnFunc = XML_FORMATADO?.length > 0 ? `abreModalXmlVenda('${IDVENDA}')`: ''
            let opcoes = `
                <div class="btn-group btn-group-xs">
                    <button id="detalharVenda" type="button" class="btn btn-success btn-xs" title="Detalhar Produtos da Venda" value="${IDVENDA}">
                        <i class="fal fa-list "></i>
                    </button>
                    <button type="button" class="btn btn-info btn-xs opacity-${btnOpacity}" title="${btnTitle}" onclick="${btnFunc}">
                        <i class="fal fa-file-code"></i>
                    </button>
                </div> 
            `;

            contador++;

            dadosTabela.push([
                contador,
                NOFANTASIA,
                IDVENDA,
                SERIE,
                NF,
                chaveNF,
                situacao,
                VRTOTALPAGO,
                motivo,
                opcoes
            ]);
        
        })
    }

        $('#resultado').html(`
            <table id="dt-basic-list-vendas" class="table table-bordered table-hover table-striped w-100 ">
                <thead class="bg-primary-600">
                    <tr >
                        <th style="width: 5px; text-align: center; font-size: 12px;">#</th>
                        <th style="width: 10px; text-align: center; font-size: 12px;"><b>Empresa<b></th>
                        <th style="width: 10px; text-align: center; font-size: 12px;"><b>Venda<b></th>
                        <th style="width: 10px; text-align: center; font-size: 12px;"><b>Série<b></th>
                        <th style="width: 10px; text-align: center; font-size: 12px;"><b>NFCE<b></th>
                        <th style="width: 10px; text-align: center; font-size: 12px;"><b>Chave NF<b></th>
                        <th style="width: 10px; text-align: center; font-size: 12px;"><b>Situação<b></th>
                        <th style="width: 15px; text-align: center; font-size: 12px;"><b>Valor<b></th>
                        <th style="width: 10px; text-align: center; font-size: 12px;"><b>Motivo<b></th>
                        <th style="width: 10px; text-align: center; font-size: 12px;"><b>Opções<b></th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        `);

    let tableVendas = $('#dt-basic-list-vendas').DataTable({
            data: dadosTabela,
            "columnDefs": [
                { "width": "5%", "targets": [0] },
                { "width": "10%", "targets": [9] },
                { "className": 'text-left', "targets": [0] },
                { "className": 'text-center', "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9] }

            ],
            "displayLength": 25,
            scrollY: false,
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
    

    $('#dt-basic-list-vendas tbody').on('click', 'button#detalharVenda', async function () {
        try{
            let tr = $(this).closest('tr');
            let row = tableVendas.row(tr);
            let idVendaLinha = $(this).attr('value');

            if (tr.hasClass('child')) {
                tr = $($(`#${$(this).attr('value')}`).closest('tr'))
                row.child.hide();
                tr.removeClass('shown');
            } 


            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');

            } else {
                animationLoadingStart();

                let dadosDetalheVenda = await ajaxGetAllData(`api/contabilidade/venda-detalhe.xsjs?idVenda=${idVendaLinha}`, false).catch(() => { throw error});
                let dadosPagamentoVenda = await ajaxGetAllData(`api/contabilidade/venda-pagamento.xsjs?idVenda=${idVendaLinha}`, false).catch(() => { throw error });

                if (!dadosDetalheVenda.data?.length) {
                    return msgWarning('Venda sem Detalhes, Entre em Contato Com o Suporte!!');
                }

                if (!dadosPagamentoVenda.data?.length) {
                    return msgWarning('Venda Sem Forma de Pagamento, Entre em Contato Com o Suporte!');
                }

                row.child(formatDataTableAccordionDetalheVendaContingencia(dadosDetalheVenda, dadosPagamentoVenda)).show();
                tr.addClass('shown');

                animationLoadingStop();
            }
        } catch(error){
            console.error(error);
            msgError();
        }
    });
}

async function downloadXmlEmLote(){
    try{
        let IDMarcaPesqVenda = $("#idmarca").val() || "";
        let idEmpresa = $("#filialvenda").val() || "";
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();
        let statusVenda = $("#idStatusVenda").val() || "";

        if (statusVenda?.length) {
            if (statusVenda == 'CANCELADA') {
                statusVenda = "stCancelado=True";
            } else {
                statusVenda = `stContingencia=${(statusVenda == 'AUTORIZADA' ? 'False' : 'True')}&stCancelado=False`;
            }
        }


        await ajaxGetAllData(`api/venda/venda-xml.xsjs?idGrupoEmpresarial=${IDMarcaPesqVenda}&idEmpresa=${idEmpresa}&${statusVenda}&dataInicio=${datapesqinicio}&dataFim=${datapesqfim}`)
            .then(retornoDownloadXmlEmLote)
            .catch((error) => { throw error; });
    } catch(error){
        console.error(error);
        msgError();
    }
}

async function retornoDownloadXmlEmLote(dadosVendas) {
    try {
        let { data } = dadosVendas || [];
        let listaVendasSemXML = '';
        let contador = 0;

        if (data?.length) {
            animationLoadingStart('Gerando arquivo...', 1);
            
            let periodo = new Date($("#dtconsultainicio").val()).toLocaleDateString('pt-BR') + '_A_' + new Date($("#dtconsultafim").val()).toLocaleDateString('pt-BR');
            const JSZip = window.JSZip; 
            const zip = new JSZip();

            for (let venda of data) {
                let { IDVENDA, XML_FORMATADO } = venda;

                if (XML_FORMATADO?.length){
                    XML_FORMATADO = new DOMParser().parseFromString(XML_FORMATADO, 'text/xml');

                    let nomeArquivo = $(XML_FORMATADO.getElementsByTagName('infNFe')[0]).attr('Id');

                    XML_FORMATADO = new XMLSerializer().serializeToString(XML_FORMATADO);

                    zip.file(`${nomeArquivo}.xml`, XML_FORMATADO);
                } else {
                    listaVendasSemXML += `${IDVENDA}, `;
                    contador++;
                }
            }

            let totalGerado = data?.length - contador;
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            let url = URL.createObjectURL(zipBlob);
            let a = document.createElement("a");
            a.href = url;
            a.download = `XML_VENDAS_${periodo.replace(/\//g, '-')}.zip`;

            if (contador > 0) {
                await msgWarning(`Arquivo Gerado, Porém Não foi possível gerar o arquivo XML das seguintes vendas: (${listaVendasSemXML}), TOTAL VENDAS: ${data?.length}, TOTAL XMLS GERADOS: ${totalGerado}, TOTAL EM FALTA: ${contador}`, "Os XML's das Vendas Citadas Não Foram Encontrados ou Estão Em Formato Inválido!");
            }else {
                await msgSuccess('Arquivo gerado com sucesso!', `Total de ${totalGerado} xml's gerados!`, false);
            }

            a.click();
            URL.revokeObjectURL(url);
        } else {
            return msgWarning('Nenhum XML encontrado.');
        }

    } catch (error) {
        console.log(error);
        msgError();
    }
}

//========== FIM Rotina - Visualizar/Baixar XML VENDA ==========//

// ========= INICIO Rotina - Visualizar Produtos ========== //
/*
    DATA: 25/11/2024
    AUTOR: Hendryw Deyvison
*/
function retornoListaGruposEmpresariaisSelectGenerico(grupos, idOrClassSelect = '#idmarca', idPreSelecionado = '') {
    let { data } = grupos || [];

    $("#idmarca").html(`<option value=""> Selecione... </option>`);

    if (!idOrClassSelect.includes('#') && !idOrClassSelect.includes('.')) {
        idOrClassSelect = ('#' + idOrClassSelect);
    }

    for (let { IDGRUPOEMPRESARIAL, GRUPOEMPRESARIAL } of data) {
        $(idOrClassSelect).append(`<option value="${IDGRUPOEMPRESARIAL}"> ${GRUPOEMPRESARIAL} </option>`);
    }

    $("#idmarca").select2();

    if (idPreSelecionado){
        $("#idmarca").val(idPreSelecionado).trigger('change');
    }
}

function retornoListaEmpresasSelectGenerico(empresas, idOrClassSelect = '#idloja', idPreSelecionado = '') {
    let { data } = empresas || [];

    $("#idloja").html(`<option value=""> Selecione... </option>`);

    if (!idOrClassSelect.includes('#') && !idOrClassSelect.includes('.')){
        idOrClassSelect = ('#' + idOrClassSelect);
    }

    for (let { IDEMPRESA, NOFANTASIA } of data) {
        $(idOrClassSelect).append(`<option value="${IDEMPRESA}"> ${NOFANTASIA} </option>`);
    }

    $("#idloja").select2();

    if (idPreSelecionado) {
        $("#idmarca").val(idPreSelecionado).trigger('change');
    }
}

async function ListaProdutoPreco() {
    try{
        animationLoadingStart();

        await $.get('contabilidade_action_produtos_preco.html', async (respHtml)=>{
            $('#js-page-content').html(respHtml);

            $('.dataAtual').text(dataAtual);

            $('.DescTituloListaVendas').html(`<i class='subheader-icon fal fa-chart-area'></i> Lista de Produtos - <span class='fw-300'></span>`);

            $('#ufLojas').select2();

            $('#dsProduto').on('keypress', (e) => { if (e.keyCode == 13) pesq_produto_preco() });;
        })
        .fail((error)=>{ throw error });

        await ajaxGet('api/informatica/grupoempresas.xsjs')
            .then(retornoListaGruposEmpresariaisSelectGenerico)
            .catch((error) => { throw error });

        await ajaxGet('api/empresa.xsjs')
            .then(retornoListaEmpresasSelectGenerico)
            .catch((error) => { throw error });

        animationLoadingStop();
    } catch(error){
        console.log(error);
        msgError();
    }
}

async function pesq_produto_preco() {
    try{    

        let descricaoProduto = $("#dsProduto").val() || '';

        if(descricaoProduto?.length < 4) {
            return msgWarning('Descrição ou código de barras muito curto, verifique e tente novamente!');
        } 
        
        await ajaxGetAllData(`api/contabilidade/buscar-produtos.xsjs?pageSize=500&descProd=${descricaoProduto}`)
            .then(retornoListaProdutoPreco)
            .catch((error) => { throw error });

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaProdutoPreco(respostaProdutos) {
    let { data } = respostaProdutos || [];
    let dadosTable = [];
    let contadorProduto = 0;

    for (let dados of data) {
        contadorProduto++;

        let DTUltAlteracao = dados?.DTULTALTERACAO;
        let CodItem = dados?.IDPRODUTO;
        let DsProduto = dados?.DSNOME;
        let CodBarras = dados?.NUCODBARRAS;
        let ValorVendaPDV = dados?.PRECOVENDA;
        let percIcmsDf = dados?.PERC_ICMS_DF;
        let percIcmsGo = dados?.PERC_ICMS_GO;

        dadosTable.push([
            contadorProduto,
            CodBarras,
            DsProduto,
            percIcmsDf,
            percIcmsGo,
            DTUltAlteracao,
            parseFloat(ValorVendaPDV).toFixed(2)
        ]);
    }

    $('#resultado').html(
        `<table id="dt-basic-produto-preco-quality" class="table table-bordered table-hover table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>*</th>
                        <th>Cód Barras</th>
                        <th>Descrição</th>
                        <th>ICMS_DF(%)</th>
                        <th>ICMS_GO(%)</th>
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

    $('#dt-basic-produto-preco-quality').DataTable({
        data: dadosTable,
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

// ========= FIM Rotina - Visualizar Produtos ========== //


function gerarDANFEPDF(tpNota, content) {
    if(tpNota == 1){
        DANFe({xml: content})
        .then(res => {
            console.log(res)
            const blob = new Blob([res], { type: 'application/pdf' }); // <- usa res direto
            const url = URL.createObjectURL(blob);
        window.open(url);
        });
    } else {
        DANFCe({ xml: content }).then(res => {
            console.log(res)
            const blob = new Blob([res], { type: 'application/pdf' }); // <- usa res direto
            const url = URL.createObjectURL(blob);
            window.open(url);
        });
    }

}

//? =================== INICIO ROTINA DE ALVARAS DE EMPRESAS ===================//

//? /// Inicio Funcoes Auxiliares /// ?//

function capitalizeWords(valor) {
  valor = String(valor)?.toLowerCase()?.replace(/(^|(?<=\s)|(?<=\())\S/g, letra => letra.toUpperCase())?.replace(/\s+/g, ' ')?.trim() || "";

  return valor
}

function formatarMetragem(element) {
  let valor = element.value.replace(/[^0-9,.]/g, '').replaceAll(',', '.').replace(/(,.*)./g, '$1');
  let partes = valor?.split(".");

  if (partes.length > 1) {
    valor = partes[1]?.length > 2 ? Number(partes[0] + "." + partes[1].slice(0, 2)) : partes[0] + "." + partes[1] || 0;
  }

  element.value = valor == '.' ? '0.' : valor;
}

async function gerarLog(dados, textoFuncao) {
  let textdados = JSON.stringify(dados);

  let dadosLog = [{
    "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
    "PATHFUNCAO": textoFuncao,
    "DADOS": textdados,
    "IP": ipCliente
  }];

  await ajaxPost("api/log-web.xsjs", dadosLog).catch((error) => { console.log('Error ao gerar o LOG: ' + error) });
}

function retornoListaMarcaAlvaras(respostaListaMarcas) {
  let { data } = respostaListaMarcas || [];

  $('#idmarca').html('<option value=""> Todas </option>');

  if (data.length > 0) {
    for (let { IDGRUPOEMPRESARIAL, DSGRUPOEMPRESARIAL } of data) {
      $('#idmarca').append(`<option value="${IDGRUPOEMPRESARIAL}"> ${DSGRUPOEMPRESARIAL}</option>`);
    }

    $('#idmarca').append(`<option value="OUTLET">OT - OUTLET </option>`);
  }


  $('#idmarca').select2();
}

async function retornoListaMarcaAlvarasModal(respostaListaMarcas) {
  let { data } = respostaListaMarcas || [];

  $('#idGrupoEmpresarialModal').html('<option value=""> Todas </option>');

  if (data.length > 0) {
    for (let { IDGRUPOEMPRESARIAL, DSGRUPOEMPRESARIAL } of data) {
      $('#idGrupoEmpresarialModal').append(`<option value="${IDGRUPOEMPRESARIAL}"> ${DSGRUPOEMPRESARIAL}</option>`);
    }

    $('#idGrupoEmpresarialModal').append(`<option value="OUTLET">OT - OUTLET </option>`);
  }


  $('#idGrupoEmpresarialModal').select2();
}

async function retornoListaSelectStatusAndamentoModalAlvara(listaStatusAlvara) {
  let { data } = listaStatusAlvara || [];

  for (let { IDSTATUS, DESCRICAO } of data) {
    $('#statusVincAlvaraModal').append(`<option value="${IDSTATUS}"> ${DESCRICAO} </option>`)
  }

  $('#statusVincAlvaraModal').select2();
}

async function retornoListaSelectAlvaras(listaAlvarás, idSelect = '#idSelectAlvara') {
  let { data } = listaAlvarás || [];

  idSelect = !idSelect.includes('#') ? '#' + idSelect : idSelect;

  $(idSelect).html(`<option value=""> Todos </option>`)

  for (let { IDALVARA, DESCRICAO } of data) {
    $(idSelect).append(`<option value="${IDALVARA}"> ${capitalizeWords(DESCRICAO)} </option>`)
  }

  $(idSelect).select2();
}

async function carregarFiliaisPorUFMarcaStAtivoAlvaras() {
  let ufFiliais = $('#ufFilial').val() || '';
  let idMarca = $('#idmarca').val() || ''
  let stAtivo = $('#stFilial').val() || '';

  await ajaxGetAllData(`api/empresa.xsjs?uf=${ufFiliais}&idSubGrupoEmpresa=${idMarca}&stAtivo=${stAtivo}`, "Carregando Filiais por Marca, Aguarde...")
    .then(retornoSelectFiliaisAlvarasEmpresas);

}

function retornoSelectFiliaisAlvarasEmpresas(listaEmpresas) {
  let { data } = listaEmpresas || [];

  $("#idFilial").html(`<option value=""> Todas </option>`);

  for (let { IDEMPRESA, NOFANTASIA } of data) {
    $("#idFilial").append(`<option value="${IDEMPRESA}"> ${NOFANTASIA} </option>`);
  }

  $("#idFilial").select2();

}

async function montarPayloadEditarVinculoAlvaraEmpresaModal(idVinculoAlvara) {
  let idVinculo = Number(idVinculoAlvara);
  let dtInicio = $('#dtInicioCompVincAlvaraModal').val();
  let dtFim = $('#dtFimCompVincAlvaraModal').val();
  let stAtivo = $('#stAtivoVincAlvaraModal').val();
  let idStatus = Number($('#statusVincAlvaraModal').val());
  let descricao = capitalizeWords($('#detAndamentoVincAlvaraModal').val());
  let metragem = Number($('#metragemVincAlvaraModal').val());
  let numProjeto = $('#idProjetoAprovadoVincAlvaraModal').val() || '';
  let idUsuario = Number(IDFuncionarioLogin);
  let stExisteListaAnexos = $('#dt-basic-arquivos-anexos-alvara')?.length > 0;
  let listaArquivosAlvaras = !stExisteListaAnexos ? await buscarArquivosAlvaraSelecionadosInput('inputFilesAlvara') : [];

  return [
    {
      IDVINCULO: idVinculo,
      STATIVO: stAtivo,
      DTINICIOCOMPETENCIA: dtInicio,
      DTFIMCOMPETENCIA: dtFim,
      IDSTATUSANDAMENTO: idStatus,
      DESCRICAODETALHEANDAMENTO: descricao,
      METRAGEMEMPRESA: metragem,
      NUMEROPROJETOAPROVADO: numProjeto,
      IDFUNCIONARIO: idUsuario,
      ARQUIVOSALVARA: listaArquivosAlvaras
    }
  ];
}

async function montarPayloadAdicionarVinculoAlvaraEmpresaModal(idEmpresa, idAlvara) {
  let stAtivo = $('#stAtivoVincAlvaraModal').val();
  let dtInicio = $('#dtInicioCompVincAlvaraModal').val();
  let dtFim = $('#dtFimCompVincAlvaraModal').val();
  let idStatus = Number($('#statusVincAlvaraModal').val());
  let descricao = capitalizeWords($('#detAndamentoVincAlvaraModal').val());
  let metragem = Number($('#metragemVincAlvaraModal').val());
  let numProjeto = $('#idProjetoAprovadoVincAlvaraModal').val() || '';
  let idUsuario = Number(IDFuncionarioLogin);
  let listaArquivosAlvaras = await buscarArquivosAlvaraSelecionadosInput('inputFilesAlvara');

  return [{
    IDEMPRESA: Number(idEmpresa),
    IDALVARA: Number(idAlvara),
    STATIVO: stAtivo,
    DTINICIOCOMPETENCIA: dtInicio,
    DTFIMCOMPETENCIA: dtFim,
    IDSTATUSANDAMENTO: idStatus,
    DESCRICAODETALHEANDAMENTO: descricao,
    METRAGEMEMPRESA: metragem,
    NUMEROPROJETOAPROVADO: numProjeto,
    IDFUNCIONARIO: idUsuario,
    ARQUIVOSALVARA: listaArquivosAlvaras
  }];
}

async function buscarArquivosAlvaraSelecionadosInput(idInput) {
  let listaArquivosAlvaras = [];
  let { files } = document.getElementById(idInput) || [];

  if (files.length > 0) {

    for (let file of files) {
      let ARQUIVOBASE64 = await new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let NOMEARQUIVO = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").replace(/ +/g, "-").trim();
      let TIPOARQUIVO = file.type;

      listaArquivosAlvaras.push(
        {
          ARQUIVOBASE64,
          NOMEARQUIVO,
          TIPOARQUIVO
        }
      );
    }
  }

  return listaArquivosAlvaras
}

async function voltarFocoAoModalAnteriro(idModal, time = 100) {
  idModal = idModal.includes('#') ? idModal : `#${idModal}`;

  await new Promise((resolve) => {
    setTimeout(() => {
      $('body').addClass('modal-open');

      $(idModal).trigger('focus');

      resolve();
    }, time)
  })
}

async function recarregarListaAlvarasEmpresaModal(idEmpresa) {
  let { data } = await ajaxGetAllData(`api/contabilidade/alvaras-empresa.xsjs?id=${idEmpresa}`, false);

  await preencherListaAlvarasModalEmpresaAlvara(idEmpresa, data[0].LISTA_ALVARAS, true);
}

async function recarregarListaArquivosAnexosAlvarasModal(idVinculoAlvara) {
  let { data } = await ajaxGetAllData(`api/contabilidade/vinculo-alvaras-empresa.xsjs?id=${idVinculoAlvara}`, false);

  await listarAnexosAlvarasModalDetalhesAlvaraEmpresa(idVinculoAlvara, data[0].ARQUIVOSALVARAS, true);
}

async function validarDadosVinculoAlvaraEmpresa(idsElementosIgnorar) {
  let dtInicio = $('#dtInicioCompVincAlvaraModal').val();
  let dtFim = $('#dtFimCompVincAlvaraModal').val();
  let modal = $('#modal-detalhes-alvara-empresa');
  let inputFile = document.getElementById("inputFilesAlvara");
  let file = inputFile.files[0];
  let max_mb = 1.5;
  let respValidacao = true;
  let textMsg = '';
  let campo = '';

  let dtInicioFormatada = new Date(dtInicio + 'T00:00:00');
  let dtFimFormatada = new Date(dtFim + 'T00:00:00');

  if (dtInicioFormatada > dtFimFormatada) {
    campo = $('#dtInicioCompVincAlvaraModal');
    textMsg = `<div>O campo <span class="fw-900">Dt. Inicio</span> está com uma data maior que o <span class="fw-900">Dt.Fim</span>, verifique e tente novamente!<div>`;
  }

  if (textMsg.length == 0) {

    let arrayElements = modal.find('.modal-body')
      .find('input, textarea, select')
      .not(`${idsElementosIgnorar ? idsElementosIgnorar.split(',').map(id => !id.includes('#') ? `#${id?.trim()}` : id).join(', ') : ''}`);

    for (let element of arrayElements) {
      let idElement = $(element).prop('id');
      let tpElement = $(element).prop('type');
      let valElement = $(element).val() || '';
      let labelElement = $(element).parent().find('label').text().replace(':', '');

      valElement = tpElement == 'text' ? valElement.replace(/[^a-zA-Z0-9À-ÿ]/g, '') : valElement;

      if ((tpElement !== 'file' && valElement.toString().trim()?.length == 0) || (idElement == 'metragemVincAlvaraModal' && Number(valElement) == 0)) {
        textMsg = `<div>O campo <span class="fw-900">${labelElement}</span> é  de preenchimento obrigatório, verifique e tente novamente!<div>`;
      }

      if (tpElement == 'date') {
        let dataInformada = new Date(valElement + 'T00:00:00');

        let ano = dataInformada.getFullYear();

        if (dataInformada == 'Invalid Date' || valElement.length > 10 || (ano < 1900 || ano > 2200)) {
          textMsg = `<div>O campo <span class="fw-900">${labelElement}</span> está com uma data inválida, verifique e tente novamente!<div>`;
        }
      }

      campo = $(element);

      if (textMsg.length > 0) {
        break;
      }
    }

  }

  if (file?.size > max_mb * 1024 * 1024) {
    msgWarning("Arquivo maior que 1.5MB não é permitido");
    return;
  }

  if (textMsg.length > 0) {
    respValidacao = false;

    await msgWarning(textMsg, ' ').then(() => setTimeout(() => campo.focus(), 300))
  }

  return respValidacao

}

//? /// Fim Funcoes Auxiliares /// ?//

//? /// Inicio Funcoes Templates /// ?//

async function templateHtmlContatosLojaModal(dsFuncaoFunc, nomeFunc, telefoneFunc, emailLoja, telefoneLoja) {
  let titleCard = dsFuncaoFunc.toLowerCase().includes('gerente') ? 'Gerente da Loja' : 'Supervisor da Loja';
  let nome = capitalizeWords(nomeFunc || 'Nome Não Cadastrado');
  let telefone = maskTelefone(telefoneFunc || telefoneLoja);
  let email = emailLoja?.toLowerCase() || 'E-mail Não Cadastrado';

  let htmlContato = `
    <div class="col-xl-6 col-sm-12 mb-3">
      <div class="panel h-100">
        <div class="panel-container show">
          <div class="panel-content">

            <h6 class="fw-500 text-muted mb-3">
              <i class="fal fa-user-alt mr-1"></i> ${titleCard}
            </h6>

            <div class="mb-2">
              <label class="form-label">Nome</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text fal fa-user"></span>
                </div>
                <input class="form-control" value="${nome}" disabled>
              </div>
            </div>

            <div class="mb-2">
              <label class="form-label">E-mail</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text fal fa-at"></span>
                </div>
                <input class="form-control" placeholder="${'E-mail Não Cadastrado'}" value="${email}" disabled>
              </div>
            </div>

            <div>
              <label class="form-label">Telefone</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text fal fa-phone"></span>
                </div>
                <input class="form-control" placeholder="${'Telefone Não Cadastrado'}" value="${telefone}" disabled>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  return htmlContato;
}

async function templateHtmlAlvaraLojaModal_old(dados, listaStatusAlvaras) {
  let {
    IDVINCULO,
    DESCRICAOALVARA,
    DTINICIOCOMPETENCIAALVARA,
    DTFIMCOMPETENCIAALVARA,
    IDSTATUS,
    DESCRICAODETALHEANDAMENTO,
    METRAGEMEMPRESA,
    STATIVO,
  } = dados;

  let stAtivo = STATIVO == 'True' ? 'Ativo' : 'Inativo';
  let htmlSelectStatusAndamento = await templateHtmlSelectStatusAlvaraLojaModal(listaStatusAlvaras, IDVINCULO, IDSTATUS);

  let htmlAlvara = `
    <div class="col-sm-12 col-xl-6">
      <div class="panel">
        <div class="panel-hdr">
          <div class="d-flex justify-content-start w-100 align-items-center">
            <h5 class="m-0 fw-500" style="color: #505050"> <i class="fal fa-file-alt mr-2"></i> ${DESCRICAOALVARA} </h5>
          </div>
        </div>
        <div class="panel-container show">
          <div class="panel-content">
            <div class="form-group">
              <div class="row mb-3">
                <div class="col-sm-4 col-xl-4">
                  <label class="form-label" for="dtInicio_${IDVINCULO}">Dt Competência Inicio:</label>
                  <input type="date" id="dtInicio_${IDVINCULO}" class="form-control" name="dtInicio_${IDVINCULO}"
                    value="${DTINICIOCOMPETENCIAALVARA}" disabled>
                </div>
                <div class="col-sm-4 col-xl-4">
                  <label class="form-label" for="dtFim_${IDVINCULO}">Dt Competência Fim:</label>
                  <input type="date" id="dtFim_${IDVINCULO}" class="form-control" name="dtFim_${IDVINCULO}"
                    value="${DTFIMCOMPETENCIAALVARA}" disabled>
                </div>
                <div class="col-sm-4 col-xl-4">
                  <label class="form-label" for="stAtivo_${IDVINCULO}">Status:</label>
                  <select class="form-control" id="stAtivo_${IDVINCULO}"  disabled>
                    <option value="True" ${stAtivo == 'Ativo' ? 'selected' : ''}> Ativo </option>
                    <option value="False" ${stAtivo == 'Inativo' ? 'selected' : ''}> Inativo </option>
                  </select>
                </div>
              </div>
              <div class="row mb-3">
                ${htmlSelectStatusAndamento}
              </div>
              <div class="row mb-3">
                <div class="col-sm-12 col-xl-12">
                  <label class="form-label" for="detAndamento_${IDVINCULO}">Detalhe Andamento:</label>
                  <input type="text" id="detAndamento_${IDVINCULO}" class="form-control" name="detAndamento_${IDVINCULO}"
                    value="${DESCRICAODETALHEANDAMENTO}" disabled>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-4 col-xl-4">
                  <label class="form-label" for="metragem_${IDVINCULO}">Metragem:</label>
                  <input type="number" id="metragem_${IDVINCULO}" class="form-control" name="metragem_${IDVINCULO}" value="${Number(METRAGEMEMPRESA)}" step="0.01" min="1" oninput="formatarMetragem(this)" disabled>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-12 col-xl-12 mt-4">
                  <div id="container-btn-editar-alvara-loja-modal-${IDVINCULO}" class="d-flex justify-content-end">
                    <button id="btn_liberar_edicao_${IDVINCULO}" type="button" class="btn btn-warning btn-xs pt-2 pb-2" title="Editar Alvará da Loja" onclick="liberarCamposEdiçãoAlvaraModal('${IDVINCULO}')"><i class="fal fa-pen p-0"></i> Editar</button>
                    <button id="btn_editar_${IDVINCULO}" type="button" class="btn btn-success btn-xs pt-2 pb-2 mr-2 d-none" title="Salvar Edição do Alvará da Loja" onclick="modalEditarAlvaraEmpresa('${IDVINCULO}')"><i class="fal fa-save p-0"></i> Salvar Edição</button>
                    <button id="btn_cancelar_edicao_${IDVINCULO}" type="button" class="btn btn-danger btn-xs pt-2 pb-2 d-none" title="Cancelar Edição" onclick="bloquearCamposEdiçãoAlvaraModal('${IDVINCULO}')"><i class="fal fa-times p-0"></i> Cancelar Edição</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return htmlAlvara;
}

async function templateHtmlAlvaraLojaModal(dados, listaStatusAlvaras) {
  let {
    IDVINCULO,
    DESCRICAOALVARA,
    DTINICIOCOMPETENCIAALVARA,
    DTFIMCOMPETENCIAALVARA,
    IDSTATUS,
    DESCRICAODETALHEANDAMENTO,
    METRAGEMEMPRESA,
    STATIVO,
  } = dados;

  let stAtivo = STATIVO == 'True' ? 'Ativo' : 'Inativo';
  let qtdAlvara = 1;
  let htmlSelectStatusAndamento = await templateHtmlSelectStatusAlvaraLojaModal(listaStatusAlvaras, IDVINCULO, IDSTATUS);

  let htmlAlvara = `
    <div class="panel mb-3">
      <div class="panel-content">
        <div class="mb-3">
          <h6 class="fw-500 text-secondary">
            <i class="fal fa-file-alt mr-2"></i>
            ALVARÁ - ${DESCRICAOALVARA}
          </h6>
        </div>
        <div class="row g-3 mb-3">
          <div class="col-sm-4 col-xl-4">
            <label class="form-label" for="dtInicio_${IDVINCULO}" title="Data Inicio Competência">Dt.
              Inicio:</label>
            <input type="date" id="dtInicio_${IDVINCULO}" class="form-control" name="dtInicio_${IDVINCULO}"
              value="${DTINICIOCOMPETENCIAALVARA}" title="Data Inicio Competência" disabled>
          </div>
          <div class="col-sm-4 col-xl-4">
            <label class="form-label" for="dtFim_${IDVINCULO}" title="Data Fim Competência">Dt. Fim:</label>
            <input type="date" id="dtFim_${IDVINCULO}" class="form-control" name="dtFim_${IDVINCULO}"
              value="${DTFIMCOMPETENCIAALVARA}" title="Data Fim Competência" disabled>
          </div>
          <div class="col-sm-4 col-xl-4">
            <label class="form-label" for="stAtivo_${IDVINCULO}">Status:</label>
            <select class="form-control" id="stAtivo_${IDVINCULO}" disabled>
              <option value="True" ${stAtivo == 'Ativo' ? 'selected' : ''}> Ativo </option>
              <option value="False" ${stAtivo == 'Inativo' ? 'selected' : ''}> Inativo </option>
            </select>
          </div>
        </div>
        <div class="row mb-3">
          ${htmlSelectStatusAndamento}
        </div>
        <div class="mb-3">
          <label class="form-label">Detalhe Andamento</label>
          <input type="text" class="form-control" value="${DESCRICAODETALHEANDAMENTO}" disabled>
        </div>
        <div class="row mb-4">
          <div class="col-sm-6 col-xl-4">
            <label class="form-label">Metragem</label>
            <input type="number" class="form-control" value="${Number(METRAGEMEMPRESA)}" step="0.01" min="1"
              oninput="formatarMetragem(this)" disabled>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button id="btn_liberar_edicao_${IDVINCULO}" class="btn btn-warning btn-xs"
            onclick="liberarCamposEdiçãoAlvaraModal('${IDVINCULO}')">
            <i class="fal fa-pen"></i> Editar
          </button>

          <button id="btn_editar_${IDVINCULO}" class="btn btn-success btn-xs d-none"
            onclick="modalEditarAlvaraEmpresa('${IDVINCULO}')">
            <i class="fal fa-save"></i> Salvar
          </button>

          <button id="btn_cancelar_edicao_${IDVINCULO}" class="btn btn-danger btn-xs d-none"
            onclick="bloquearCamposEdiçãoAlvaraModal('${IDVINCULO}')">
            <i class="fal fa-times"></i> Cancelar
          </button>
        </div>

      </div>
    </div>
  `;

  return htmlAlvara;
}

async function templateHtmlSelectStatusAlvaraLojaModal_old(listaStatusAlvaras, idVinculo, idStatusSelected) {
  let listaStatus = listaStatusAlvaras?.data || [];

  let htmlSelect = `
    <div class="col-sm-4 col-xl-8">
      <label class="form-label" for="stStatusAndamento_${idVinculo}">Status:</label>
      <select id="stStatusAndamento_${idVinculo}" class="form-control" disabled>
  `;

  for (let { IDSTATUS, DESCRICAO } of listaStatus) {
    htmlSelect += `
      <option value="${IDSTATUS}" ${IDSTATUS == idStatusSelected ? 'selected' : ''}> ${DESCRICAO} </option>
    `;
  }

  htmlSelect += `
      </select>
    </div>
  `;

  return htmlSelect;
}

async function templateHtmlSelectStatusAlvaraLojaModal(listaStatusAlvaras, idVinculo, idStatusSelected) {
  let listaStatus = listaStatusAlvaras?.data || [];

  let htmlSelect = `
    <div class="col-sm-4 col-xl-8">
      <label class="form-label" for="stStatusAndamento_${idVinculo}">Status:</label>
      <select id="stStatusAndamento_${idVinculo}" class="form-control" disabled>
  `;

  for (let { IDSTATUS, DESCRICAO } of listaStatus) {
    htmlSelect += `
      <option value="${IDSTATUS}" ${IDSTATUS == idStatusSelected ? 'selected' : ''}> ${DESCRICAO} </option>
    `;
  }

  htmlSelect += `
      </select>
    </div>
  `;

  return htmlSelect;
}

async function templateHtmlCardListaAlvaras(idAlvara, descAlvara, qtd) {
  return `
      <div class="col-sm-12 col-xl-6 d-flex">
        <div class="panel d-flex flex-column w-100">
          <div class="panel-hdr">
            <div class="d-flex justify-content-between align-items-center text-secondary w-100 pl-2 pr-1">
              <div>
                <span class="h6 fw-500">
                  ALVARÁS - ${descAlvara}
                </span>
              </div>
              <span class="panel-toolbar">Qtd: ${qtd}</span>
            </div> 
          </div>
          <div class="panel-container show d-flex flex-column h-100">
            <div class="panel-content d-flex flex-column flex-grow-1">
              <div class="table-responsive flex-grow-1">
                <table id="dt-basic-alvara-${idAlvara}" class="table table-bordered table-hover table-responsive-lg table-striped w-100 h-100">
                  <thead class="bg-primary-600">
                    <tr>
                      <th>#</th>
                      <th>Dt. Inicio</th>
                      <th>Dt. Fim</th>
                      <th>Status</th>
                      <th>Opções</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                  <tfoot class="thead-themed"></tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
  `;
}

//? /// Fim Funcoes Templates /// ?//

async function TelaConfiguracaoAlvarasEmpresas() {
  try {
    animationLoadingStart();

    let htmlPage = await $.get('contabilidade_action_tela_alvaras_empresas.html');
    let listaMarcas = await ajaxGetAllData('api/informatica/marca.xsjs', false);
    let listaEmpresas = await ajaxGetAllData('api/empresa.xsjs?stAtivo=True', false);
    let listaAlvaras = await ajaxGetAllData('api/contabilidade/alvaras.xsjs?stAtivo=True', false);

    $("#js-page-content").html(htmlPage);

    retornoListaMarcaAlvaras(listaMarcas);
    retornoSelectFiliaisAlvarasEmpresas(listaEmpresas);
    retornoListaSelectAlvaras(listaAlvaras);

    $('#ufFilial, #stFilial').select2();

    animationLoadingStop();
  } catch (error) {
    console.log(error);

    msgError()
  }
}

async function pesquisarEmpresasAlvaras() {
  let ufFiliais = $('#ufFilial').val() || '';
  let idSubGrupoEmpresa = $("#idmarca").val() || '';
  let idFilial = $("#idFilial").val() || '';
  let stAtivo = $('#stFilial').val() || '';

  try {
    await ajaxGetAllData(`api/contabilidade/empresa.xsjs?uf=${ufFiliais}&idSubGrupoEmpresa=${idSubGrupoEmpresa}&id=${idFilial}&stAtivo=${stAtivo}`, "Buscando Dados, Aguarde...")
      .then(retornoListaEmpresasAlvaras)
  } catch (error) {
    console.log(error);
    msgError();
  }
}

async function retornoListaEmpresasAlvaras(respostaListaAlvarasEmpresas) {
  let idAlvaraSelecionado = $('#idSelectAlvara').val() || '';
  let { data } = respostaListaAlvarasEmpresas || [];
  let dadosTabela = [];
  let contador = 0;
  let dataAtual = new Date();
  let arrayTheadAlvaras = [
    '<th>St. Bombeiro</th> <th> Dt. Fim Bombeiro</th>',
    '<th>St. Meio Ambiente</th> <th> Dt. Fim Meio Ambiente</th>',
    '<th>St. Vigilância Sanitária</th> <th> Dt. Fim Vigilância Sanitária</th>',
    '<th>St. Prefeitura</th> <th> Dt. Fim Prefeitura</th>'
  ];
  let arrayStatusNegacao = [
    'Indeferido',
    'Cancelado',
    'Vencido',
    'Inativo'
  ];
  let arrayColorStatus = [
    'success',
    'info',
    'warning',
    'danger'
  ];

  let theadAlvaras = idAlvaraSelecionado.length ? arrayTheadAlvaras[Number(idAlvaraSelecionado) - 1] : arrayTheadAlvaras.join('');

  for (let dados of data) {
    contador++;

    let idEmpresa = dados?.IDEMPRESA;
    let noFantasia = dados?.NOFANTASIA;
    let cnpj = maskCnpj(dados?.NUCNPJ);
    let inscEstadual = maskIE(dados?.NUINSCESTADUAL, dados?.SGUF);
    let inscMunicipal = dados?.NUINSCMUNICIPAL || '';
    let endereco = capitalizeWords(dados?.EENDERECO);
    let bairro = capitalizeWords(dados?.EBAIRRO);
    let cidade = capitalizeWords(dados?.ECIDADE);
    let uf = dados?.SGUF;
    let municipioUf = cidade + ' / ' + uf;
    let situacao = dados?.STATIVO == 'True' ? 'Ativo' : 'Inativo';
    let btnEditar = `<button type="button" class="btn btn-info btn-xs" title="Editar Alvarás da Loja" onclick="abrirModalDadosEmpresaAlvara('${idEmpresa}')" ><span class="d-block fal fa-file-alt mr-1"></span>Alvarás</button>`;
    let dtFimAlvaraPrefeitura = dados?.DTFIMALVARAPREFEITURA || '';
    let stAlvaraPrefeitura = dados?.STATUSALVARAPREFEITURA || 'Não Iniciado';
    let idColorStatus = arrayStatusNegacao.includes(stAlvaraPrefeitura) ? 3 : stAlvaraPrefeitura == 'Não Iniciado' ? 2 : stAlvaraPrefeitura == 'Concluído' ? 0 : 1;
    let colorStatus = arrayColorStatus[idColorStatus];
    let listaAlvaras = dados?.LISTA_ALVARAS || [];

    let colunasDetAlvaras = await montarColunasDetAlvaras(listaAlvaras, idAlvaraSelecionado);

    if (stAlvaraPrefeitura == 'Concluído') {
      stAlvaraPrefeitura = 'Emitido - Aprovado';
    }
    else if ('Não Iniciado' !== stAlvaraPrefeitura && !arrayStatusNegacao.includes(stAlvaraPrefeitura)) {
      stAlvaraPrefeitura = 'Aguardando Liberação Dos Demais Orgãos';
    }

    if (dtFimAlvaraPrefeitura.length > 0) {
      let dtFimAlvaraPrefeituraDate = new Date(dtFimAlvaraPrefeitura + 'T00:00:00');
      let partesData = dtFimAlvaraPrefeitura.split('-');

      dtFimAlvaraPrefeitura = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

      if (dtFimAlvaraPrefeituraDate < dataAtual) {
        stAlvaraPrefeitura = 'Vencido';
        colorStatus = 'danger';
      }
    }

    let spanStatusAlvara = `<span class="badge badge-${colorStatus}" style="font-size: 100% !important"> ${stAlvaraPrefeitura} </span>`;
    let spanDtFimAlvara = `<span class="text-${colorStatus != 'danger' ? 'dark' : colorStatus + ' fw-900'}"> ${dtFimAlvaraPrefeitura} </span>`;

    endereco += ' - ' + bairro;

    let containerButtons = `
        <div class="d-flex justify-content-start">
          ${btnEditar}
        </div>
      `;


    dadosTabela.push([
      idEmpresa,
      noFantasia,
      cnpj,
      inscEstadual,
      inscMunicipal,
      endereco,
      municipioUf,
      situacao,
      ...colunasDetAlvaras,
      containerButtons
    ]);
  }

  $('#resultado').html(
    `<div class="row">
          <div class="col-xl-12">
            <div id="panel-1" class="panel">
              <div class="panel-hdr">
                <h2>
                  Lista de Empresas<span class="fw-300"><i></i></span>
                </h2>
              </div>
              <div class="panel-container show">
                <div class="panel-content">
                  <div id="resultadoListaQuebra" class="overflow-auto">
                    <table id="dt-basic-lista-empresa"
                      class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                      <thead class="bg-primary-600">
                        <tr>
                          <th>Nº Filial</th>
                          <th>Fantasia</th>
                          <th>Cnpj</th>
                          <th>I.E</th>
                          <th>I.M</th>
                          <th>Endereço</th>
                          <th>Municipio/UF</th>
                          <th>Situação</th>
                          ${theadAlvaras}
                          <th>Opções</th>
                        </tr>
                      </thead>
                      <tbody id="resultadoLista-empresa"></tbody>
                      <tfoot id="totalLista-empresaLoja" class="thead-themed"></tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`
  );

  $('#dt-basic-lista-empresa').DataTable({
    data: dadosTabela,
    deferRender: false,
    ordering: true,
    responsive: false,
    dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'l>>" +
      "<'row'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start caixa-selecao'><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end mb-2'B>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    buttons: [
      {
        extend: 'excelHtml5',
        text: 'Excel',
        title: 'Lista Empresas Com Status Alvarás',
        titleAttr: 'Gerar Excel',
        className: 'btn-outline-success btn-sm mr-1',
        exportOptions: {
          columns: ':gt(0):not(:last-child)',
          format: {
            body: function (data, row, column, node) {
              data = $('<p>' + data + '</p>').text();

              let dados = data?.split('/');

              if (dados?.length > 2) {
                data = dados[2] + '-' + dados[1] + '-' + dados[0];
              }

              return $.isNumeric(data.replaceAll('.', '')) ? data.replace(',', '.') : data;
            }
          }
        }
      }
    ],
    initComplete: function (settings) {
      if (dadosTabela.length > 0) {
        let idTable = `#${settings.nTable.id}`;

        $('html, body').animate({
          scrollTop: $(idTable).offset().top - 70
        }, 1000);

        $(idTable).find('tbody td:first').focus();
      }
    }
  });
}

async function montarColunasDetAlvaras(listaAlvaras, idAlvaraSelecionado) {
  let dataAtual = new Date();
  let colunasStAlvaras = [];
  let arrayStatusNegacao = [
    'Indeferido',
    'Cancelado',
    'Vencido',
    'Inativo'
  ];
  let arrayColorStatus = [
    'success',
    'info',
    'warning',
    'danger'
  ];

  for (let dados of listaAlvaras) {
    let idAlvara = dados?.IDALVARA;

    if (idAlvaraSelecionado && idAlvaraSelecionado != idAlvara) {
      continue;
    }

    let dtFimAlvaraPrefeitura = dados?.DTFIMCOMPETENCIAALVARA || '';
    let stAlvaraPrefeitura = dados?.DESCRICAOSTATUS || 'Não Iniciado';
    let idColorStatus = arrayStatusNegacao.includes(stAlvaraPrefeitura) ? 3 : stAlvaraPrefeitura == 'Não Iniciado' ? 2 : stAlvaraPrefeitura == 'Concluído' ? 0 : 1;
    let colorStatus = arrayColorStatus[idColorStatus];

    if (stAlvaraPrefeitura == 'Concluído') {
      stAlvaraPrefeitura = 'Emitido - Aprovado';
    }
    /*else if ('Não Iniciado' !== stAlvaraPrefeitura && !arrayStatusNegacao.includes(stAlvaraPrefeitura)) {
      stAlvaraPrefeitura = 'Aguardando Liberação Dos Demais Orgãos';
    }*/

    if (dtFimAlvaraPrefeitura.length > 0) {
      let dtFimAlvaraPrefeituraDate = new Date(dtFimAlvaraPrefeitura + 'T00:00:00');
      let partesData = dtFimAlvaraPrefeitura.split('-');

      dtFimAlvaraPrefeitura = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

      if (dtFimAlvaraPrefeituraDate < dataAtual) {
        stAlvaraPrefeitura = 'Vencido';
        colorStatus = 'danger';
      }
    }

    let spanStatusAlvara = `<span class="badge badge-${colorStatus}" style="font-size: 100% !important"> ${stAlvaraPrefeitura} </span>`;
    let spanDtFimAlvara = `<span class="text-${colorStatus != 'danger' ? 'dark' : colorStatus + ' fw-900'}"> ${dtFimAlvaraPrefeitura} </span>`;

    colunasStAlvaras.push(
      spanStatusAlvara,
      spanDtFimAlvara
    )
  }

  if (!colunasStAlvaras.length) {
    colunasStAlvaras.push('<span class="badge badge-warning" style="font-size: 100% !important"> Não Iniciado </span>', '');
  }

  return colunasStAlvaras;
}

//* Inicio Modal Detalhe Dados Empresa
async function abrirModalDadosEmpresaAlvara(idEmpresa) {
  try {
    animationLoadingStart();

    let htmModal = await $.get('contabilidade_action_modal_alvaras_loja.html');
    let listaMarcas = await ajaxGetAllData('api/informatica/marca.xsjs', false);
    let listaStatusAlvaras = await ajaxGetAllData('api/contabilidade/status-alvara.xsjs', false);
    let dadosAlvarasEmpresas = await ajaxGetAllData(`api/contabilidade/alvaras-empresa.xsjs?id=${idEmpresa}`, false);

    $('#modal-dados-empresa-alvaras .modal-title').html(`<h2> <i class="subheader-icon fal fa-file-alt"></i> Dados da Empresa - Alvarás </h2>`);
    $('#modal-dados-empresa-alvaras .modal-body').html(htmModal);

    await retornoListaMarcaAlvarasModal(listaMarcas);
    await preencherDadosModalEmpresaAlvara(dadosAlvarasEmpresas, listaStatusAlvaras);

    $('#modal-dados-empresa-alvaras').on('shown.bs.modal', async () => {
      try {
        let listaAlvaras = dadosAlvarasEmpresas.data[0]?.LISTA_ALVARAS || [];

        await preencherListaAlvarasModalEmpresaAlvara(idEmpresa, listaAlvaras);

        $('#modal-dados-empresa-alvaras').off('shown.bs.modal');

        animationLoadingStop();
      } catch (error) {
        console.log(error);
        msgError();
      }
    });

    $('#modal-dados-empresa-alvaras').modal({
      keyboard: false,
      backdrop: false,
      show: true
    })

  } catch (error) {
    console.log(error);
    msgError();
  }
}

async function preencherDadosModalEmpresaAlvara(dadosAlvarasEmpresas, listaStatusAlvaras) {
  let { data } = dadosAlvarasEmpresas || [];

  for (let dados of data) {
    let idEmpresa = dados?.IDEMPRESA;
    let stAtivo = dados?.STATIVO;
    let noFantasia = dados?.NOFANTASIA;
    let idGrupoEmpresarial = noFantasia?.toUpperCase().includes('OUTLET') ? 'OUTLET' : dados?.IDGRUPOEMPRESARIAL;
    let razaoSocial = dados?.NORAZAOSOCIAL;
    let cnpj = maskCnpj(dados?.NUCNPJ);
    let inscEstadual = maskIE(dados?.NUINSCESTADUAL, dados?.SGUF);
    let inscMunicipal = dados?.NUINSCMUNICIPAL || '';
    let emailEmpresa = dados?.EEMAILPRINCIPAL || '';
    let telefoneEmpresa = dados?.NUTELGERENCIA || '';
    let cepEmpresa = dados?.NUCEP ? maskCep(dados?.NUCEP) : '';
    let endereco = capitalizeWords(dados?.EENDERECO);
    let complemento = capitalizeWords(dados?.ECOMPLEMENTO) || '';
    let bairro = capitalizeWords(dados?.EBAIRRO);
    let cidade = capitalizeWords(dados?.ECIDADE);
    let uf = dados?.SGUF;
    let listaAlvaras = dados?.LISTA_ALVARAS || [];
    let btnEditar = `<button type="button" class="btn btn-info btn-xs" title="Editar Alvarás da Loja" onclick="modalEditarAlvarasLoja('${idEmpresa}')" ><span class="d-block fal fa-file-alt mr-1"></span>Alvarás</button>`;

    endereco += ' - ' + bairro;

    $('#idEmpresaModal').val(idEmpresa);
    $('#statusEmpresaModal').val(stAtivo);
    $('#idGrupoEmpresarialModal').val(idGrupoEmpresarial);
    $('#razaoSocialModal').val(razaoSocial);
    $('#noFantasiaModal').val(noFantasia);
    $('#cnpjEmpresaModal').val(cnpj);
    $('#inscEstadualEmpresaModal').val(inscEstadual);
    $('#inscMunicipalEmpresaModal').val(inscMunicipal);
    $('#enderecoEmpresaModal').val(capitalizeWords(endereco));
    $('#complementoEmpresaModal').val(capitalizeWords(complemento));
    $('#bairroEmpresaModal').val(capitalizeWords(bairro));
    $('#cidadeEmpresaModal').val(capitalizeWords(cidade));
    $('#ufEmpresaModal').val(uf);
    $('#cepEmpresaModal').val(cepEmpresa);

    await preencherListaContatosModalEmpresaAlvara(dados, emailEmpresa, telefoneEmpresa);

    $('#resultadoModalGenerico select').select2().trigger('change');

  }

}

async function preencherListaContatosModalEmpresaAlvara(dados, emailEmpresa, telefoneEmpresa) {
  let { LISTA_GERENTES, LISTA_SUPERVISORES } = dados || [];
  let lista = LISTA_GERENTES.concat(LISTA_SUPERVISORES);
  let htmlLista = '';
  let htmlContato = '';
  let contador = 0;

  for (let i = 0; i < lista.length; i++) {
    let {
      DSFUNCAO,
      NOFUNCIONARIO,
      TELEFONE
    } = lista[i];

    htmlContato += await templateHtmlContatosLojaModal(DSFUNCAO, NOFUNCIONARIO, TELEFONE, emailEmpresa, telefoneEmpresa);
    contador++;

    if (contador == 2 || i == lista.length - 1) {
      htmlLista += `<div class="row">${htmlContato}</div>`;
      htmlContato = '';
      contador = 0;
    }

  }
  $('#lista-contatos-loja-modal').html(htmlLista);

}

async function preencherListaAlvarasModalEmpresaAlvara(idEmpresa, listaAlvaras, stRecarregado = false) {
  let numIdRowAlvara = 1;
  let contador = 0;

  //*stRecarregado && $('#lista-alvaras-loja-modal').html('');

  stRecarregado && $(`#lista-alvaras-loja-modal table`).DataTable().clear().destroy();
  stRecarregado && $('#lista-alvaras-loja-modal').empty();

  for (let i = 0; i < listaAlvaras.length; i++) {
    let { IDALVARA, DESCRICAOALVARA, ITEMS } = listaAlvaras[i];
    let cardListaAlvara = await templateHtmlCardListaAlvaras(IDALVARA, DESCRICAOALVARA, ITEMS.length);
    let dadosTabela = [];

    for (let j = 0; j < ITEMS.length; j++) {
      let { IDVINCULO, IDEMPRESA, IDALVARA, DESCRICAOALVARA, DTINICIOCOMPETENCIAALVARA, DTFIMCOMPETENCIAALVARA, STATIVO } = ITEMS[j];
      let spanStAtivo = `<span class="text-${STATIVO == 'True' ? 'info' : 'danger'} fw-700">${STATIVO == 'True' ? 'Ativo' : 'Inativo'}</span>`;
      let opcoes = `
        <div class="d-flex justify-content-start">
          <button type = "button" class="btn btn-info btn-xs pt-1 pb-1 mr-1" title = "Visualizar Detalhes do Alvará" onclick="abrirModalDetalhesAlvaraEmpresa('${IDVINCULO}')" > <span class="d-block fal fa-eye"></span></button>
          <button type = "button" class="btn btn-warning btn-xs pt-1 pb-1" title = "Editar Alvará da Loja" onclick="abrirModalDetalhesAlvaraEmpresa('${IDVINCULO}', 'true')" > <span class="d-block fal fa-pen"></span></button> 
        </div>
      `

      dadosTabela.push([
        j + 1,
        DTINICIOCOMPETENCIAALVARA,
        DTFIMCOMPETENCIAALVARA,
        spanStAtivo,
        opcoes
      ])
    }

    if (contador == 0) $('#lista-alvaras-loja-modal').append(`<div id="row_alvaras_${numIdRowAlvara}" class="row d-flex align-items-stretch"></div>`);

    $(`#lista-alvaras-loja-modal #row_alvaras_${numIdRowAlvara}`).append(cardListaAlvara);

    contador++;

    if (contador == 2 || i == listaAlvaras.length - 1) {
      numIdRowAlvara++;

      contador = 0
    }

    $(`#dt-basic-alvara-${IDALVARA}`).DataTable({
      data: dadosTabela,
      deferRender: false,
      ordering: true,
      responsive: false,
      dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'l>>" +
        "<'row'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start mb-1' B>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      buttons: [
        {
          text: '<i class="fal fa-plus mr-1"></i>Add Alvará',
          titleAttr: 'Adicionar Alvará',
          className: 'btn-outline-success btn-sm mr-1',
          action: function (e, dt, node, config) {
            abrirModalVincularNovoAlvaraEmpresa(idEmpresa, IDALVARA, DESCRICAOALVARA);
          }
        }
      ]
    });


  }

  //*$('#lista-alvaras-loja-modal').append(htmlListaAlvaras);

  stRecarregado && $('#lista-alvaras-loja-modal select').select2().trigger('change');

}
//* Fim Modal Detalhe Dados Empresa

//* Inicio Modal Detalhe Dados Alvara Vinculado a Empresa
async function abrirModalDetalhesAlvaraEmpresa(idVinculoAlvara, stEditar = false) {
  try {
    animationLoadingStart();

    let modal = $('#modal-detalhes-alvara-empresa');
    let htmModal = await $.get('contabilidade_action_modal_detalhes_alvara_loja.html');
    let listaStatusAlvaras = await ajaxGetAllData('api/contabilidade/status-alvara.xsjs', false);
    let dadosAlvara = await ajaxGetAllData(`api/contabilidade/vinculo-alvaras-empresa.xsjs?id=${idVinculoAlvara}`, false);

    modal.find('.modal-body').html(htmModal);
    modal.find('.modal-title').html(` <h4> <i class="fal fa-file-alt fa-lg mr-2"></i> Detalhes do Alvará</h4> `);

    await retornoListaSelectStatusAndamentoModalAlvara(listaStatusAlvaras);
    await preencherDetalhesAlvaraModalDetalhesAlvaraEmpresa(dadosAlvara || [], stEditar);

    modal.on('hidden.bs.modal', async () => {
      try {
        await voltarFocoAoModalAnteriro('#modal-dados-empresa-alvaras');

        modal.off('hidden.bs.modal');
      } catch (error) {
        console.log(error);
        msgError();
      }
    });

    modal.modal({
      keyboard: false,
      backdrop: false,
      show: true
    });

    animationLoadingStop();

  } catch (error) {
    console.log(error);
    msgError();
  }
}

async function preencherDetalhesAlvaraModalDetalhesAlvaraEmpresa(dadosAlvara, stEditar) {
  let { data } = dadosAlvara || [];

  for (let dados of data) {
    let {
      IDVINCULO,
      IDEMPRESA,
      IDALVARA,
      DESCRICAOALVARA,
      DTINICIOCOMPETENCIAALVARA,
      DTFIMCOMPETENCIAALVARA,
      STATIVO,
      IDSTATUS,
      METRAGEMEMPRESA,
      NUMEROPROJETOAPROVADO,
      DESCRICAODETALHEANDAMENTO,
      ARQUIVOSALVARAS
    } = dados;

    let stAlvaraRegistrado = ARQUIVOSALVARAS.length > 0;

    $('#titulo-alvara-modal').html(`
      <h6 class="fw-900 text-dark">
        <i class="fal fa-file-alt fa-lg mr-2"></i>
        ${DESCRICAOALVARA}
      </h6>  
    `);

    $('#dtInicioCompVincAlvaraModal').val(DTINICIOCOMPETENCIAALVARA);
    $('#dtFimCompVincAlvaraModal').val(DTFIMCOMPETENCIAALVARA);
    $('#stAtivoVincAlvaraModal').val(STATIVO == 'True' ? 'True' : 'False');
    $('#statusVincAlvaraModal').val(IDSTATUS);
    $('#metragemVincAlvaraModal').val(Number(METRAGEMEMPRESA));
    $('#idProjetoAprovadoVincAlvaraModal').val(NUMEROPROJETOAPROVADO);
    $('#detAndamentoVincAlvaraModal').val(DESCRICAODETALHEANDAMENTO).text(DESCRICAODETALHEANDAMENTO);

    let btnVisualizarArquivoAlvara = `
      <button type="button" class="btn btn-info mr-2" onclick="visualizarAnexoAlvaraEmpresa('${IDVINCULO}', '${stAlvaraRegistrado}')">
        <span><i class="fal fa-eye mr-2"></i></span>Visualizar Arquivo
      </button>
    `;
    let btnDesbloquearAnexarAlvara = stEditar && stAlvaraRegistrado ?
      `<button type="button" class="btn btn-warning" onclick="selecionarAnexoAlvara(this)">
          <span><i class="fal fa-pen mr-2"></i></span>Anexar Novo Arquivo
        </button>`
      : '';
    let inputAnexarAlvara = `
      <div class="col-sm-6 col-xl-6 ${stEditar && stAlvaraRegistrado ? 'd-none' : ''}">
        <label class="form-label" for="inputFilesAlvara">Anexar Arquivo:</label>
        <input type="file" class="form-control" id="inputFilesAlvara" accept=".pdf" multiple/>
      </div>
    `;
    let htmlAcoesAnexarAlvara = `
      <div class="col-sm-6 col-xl-12 d-flex justify-content-start align-items-end mb-2">
        ${btnVisualizarArquivoAlvara}
        ${btnDesbloquearAnexarAlvara}
      </div>
      ${stEditar ? inputAnexarAlvara : ''}
    `;

    
    IDALVARA == 1 && $('#idProjetoAprovadoVincAlvaraModal').parent().removeClass('d-none');

    if (stEditar) {
      $('#modal-detalhes-alvara-empresa')
      .find('input, textarea, select')
      .not('[type="date"]')
      .prop('disabled', false);
      
      $('#anexos-alvara').html(`
        <div class="col-sm-6 col-xl-6">
          <label class="form-label" for="inputFilesAlvara">Anexar Arquivo:</label>
          <input type="file" class="form-control" id="inputFilesAlvara" accept=".pdf" multiple/>
          </div>
      `);
          
      $('#modal-detalhes-alvara-empresa .modal-footer').html(`
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-success mr-2" onclick="editarVinculoAlvaraEmpresa('${IDVINCULO}', '${IDEMPRESA}')">
            <span aria-hidden="true"><i class="fal fa-check mr-2"></i></span>Salvar Alterações
          </button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            <span aria-hidden="true"><i class="fal fa-times mr-2"></i></span>Fechar
          </button>
        </div>  
      `);
    } else {

      $('#modal-detalhes-alvara-empresa .modal-footer').html(`
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            <span aria-hidden="true"><i class="fal fa-times mr-2"></i></span>Fechar
          </button>
        </div>  
      `);
    }

    $('#stAtivoVincAlvaraModal, #statusVincAlvaraModal').select2().trigger('change');

    await listarAnexosAlvarasModalDetalhesAlvaraEmpresa(IDVINCULO, ARQUIVOSALVARAS, stEditar);
  }
}

async function listarAnexosAlvarasModalDetalhesAlvaraEmpresa(idVinculo, listaAnexosAlvarás, stEditar) {
  let dadosTabela = [];
  let contador = 0;

  for (let { IDARQUIVOSALVARA, NOMEARQUIVOALVARA, TIPOARQUIVOALVARA, DTHORACRIACAO, STATIVO } of listaAnexosAlvarás) {
    let stAtivo = STATIVO == 'True' ? 'Ativo' : 'Inativo';
    let tipoArquivo = TIPOARQUIVOALVARA?.split('/')[1]?.toUpperCase() || '';
    let spanStAtivo = `<span class="badge badge-${stAtivo == 'Ativo' ? 'success' : 'danger'}" style="font-size: 100% !important"> ${stAtivo} </span>`;
    let inputFileEditar = `<input type="file" class="form-control d-none" id="inputFileAlvaraEditar_${IDARQUIVOSALVARA}" accept=".pdf"/>`;

    let btnVisualizarArquivo = `
      <button type="button" class="btn btn-info btn-xs pt-1 pb-1 mr-1" title="Visualizar arquivo" onclick="visualizarAnexoAlvaraEmpresa('${IDARQUIVOSALVARA}')">
        <span class="fal fa-eye"></span>
      </button>
    `;
    let btnEditarArquivo = `
      <button type="button" class="btn btn-warning btn-xs pt-1 pb-1 mr-1" title="Editar arquivo" onclick="editarAnexoAlvaraEmpresa('${idVinculo}', '${IDARQUIVOSALVARA}')">
        <span class="fal fa-pen"></span>
      </button>
    `;
    let btnExcluirArquivo = `
      <button type="button" class="btn btn-danger btn-xs pt-1 pb-1" title="Cancelar arquivo" onclick="cancelarArquivoAlvaraEmpresa('${idVinculo}', '${IDARQUIVOSALVARA}')">
        <span class="fal fa-trash-alt"></span>
      </button>
    `;
    let containerOpcoes = `
      <div class="d-flex justify-content-start">
        ${btnVisualizarArquivo + (stEditar && STATIVO == 'True' ? (btnEditarArquivo + btnExcluirArquivo) : '')}
      </div>
      ${inputFileEditar}
    `;

    contador++;

    dadosTabela.push([
      contador,
      NOMEARQUIVOALVARA,
      tipoArquivo,
      DTHORACRIACAO,
      spanStAtivo,
      containerOpcoes
    ]);
  }

  if (stEditar && !dadosTabela.length) {
    return
  }

  $('#anexos-alvara').html(`
    <div>
      <input type="file" class="form-control d-none" id="inputFilesAlvara" accept=".pdf" multiple/>
    </div>
    <div class="panel d-flex flex-column w-100">
      <div class="panel-hdr">
        <div class="d-flex justify-content-between align-items-center text-secondary w-100 pl-2 pr-1">
          <div>
            <span class="h6 fw-500">
              LISTA DE ARQUIVOS ANEXADOS DO ALVARÁ
            </span>
          </div>
        </div> 
      </div>
      <div class="panel-container show d-flex flex-column h-100">
        <div class="panel-content d-flex flex-column flex-grow-1">
          <div class="table-responsive flex-grow-1">
            <table id="dt-basic-arquivos-anexos-alvara" class="table table-bordered table-hover table-responsive-lg table-striped w-100 h-100">
              <thead class="bg-primary-600">
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Dt. Inclusão</th>
                  <th>Status</th>
                  <th>Opções</th>
                </tr>
              </thead>
              <tbody></tbody>
              <tfoot class="thead-themed"></tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  `);

  $('#dt-basic-arquivos-anexos-alvara').DataTable({
    data: dadosTabela,
    deferRender: false,
    ordering: true,
    responsive: true,
    autoWidth: false,
    columnDefs: [
      {
        targets: 0, width: '5%'
      },
      {
        targets: 1, width: '50%'
      },
      {
        targets: [2, 4, 5], width: '10%'
      },
      {
        targets: 3, width: '15%'
      },
    ],
    dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'l>>" +
      "<'row'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start mb-1' B>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    buttons: [
      {
        text: '<i class="fal fa-paperclip mr-1"></i>Anexar Arquivo',
        titleAttr: 'Anexar Arquivo Alvará',
        className: `btn-outline-success btn-sm mr-1 ${!stEditar ? 'd-none' : ''}`,
        action: function (e, dt, node, config) {
          adicionarAnexosAlvaraEmpresa(idVinculo);
        }
      }
    ]
  });

}
//* Fim Modal Detalhe Dados Alvara Vinculado a Empresa

//* Inicio Modal Adicionar Novo Vinculo Alvara na Empresa
async function abrirModalVincularNovoAlvaraEmpresa(idEmpresa, idAlvara, descAlvara) {
  try {
    animationLoadingStart();

    let modal = $('#modal-detalhes-alvara-empresa');
    let htmModal = await $.get('contabilidade_action_modal_detalhes_alvara_loja.html');
    let listaStatusAlvaras = await ajaxGetAllData('api/contabilidade/status-alvara.xsjs', false);

    modal.find('.modal-body').html(htmModal);
    modal.find('.modal-title').html(` <h4> <i class="fal fa-plus fa-lg mr-2"></i> Adicionar Novo Alvará</h4> `);

    modal.find('.modal-body')
      .find('input, textarea, select')
      .not('#stAtivoVincAlvaraModal')
      .prop('disabled', false);

    modal.find('#titulo-alvara-modal').html(`
      <h6 class="fw-900 text-dark">
        <i class="fal fa-file-alt fa-lg mr-2"></i>
        ${descAlvara}
      </h6>  
    `);

    $('#anexos-alvara').html(`
      <div class="col-sm-6 col-xl-6" id="input-anexar-arquivo-alvara">
        <label class="form-label" for="inputFilesAlvara">Anexar Arquivos:</label>
        <input type="file" class="form-control" id="inputFilesAlvara" accept=".pdf" multiple/>
      </div>
    `);

    idAlvara == 1 && $('#idProjetoAprovadoVincAlvaraModal').parent().removeClass('d-none');

    modal.find('.modal-footer').html(`
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-success mr-2" onclick="adicionarVinculoAlvaraEmpresa('${idEmpresa}', '${idAlvara}')">
            <span aria-hidden="true"><i class="fal fa-plus mr-2"></i></span>Adicionar
          </button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            <span aria-hidden="true"><i class="fal fa-times mr-2"></i></span>Fechar
          </button>
        </div>  
      `)

    modal.on('hidden.bs.modal', async () => {
      try {
        await voltarFocoAoModalAnteriro('#modal-dados-empresa-alvaras');

        modal.off('hidden.bs.modal');
      } catch (error) {
        console.log(error);
        msgError();
      }
    });

    modal.modal({
      keyboard: false,
      backdrop: false,
      show: true
    });

    await retornoListaSelectStatusAndamentoModalAlvara(listaStatusAlvaras);

    animationLoadingStop();

  } catch (error) {
    console.log(error);
    msgError();
  }
}
//* Fim Modal Adicionar Novo Vinculo Alvara na Empresa

//* Inicio funcoes de Insercao/Visualizacao/Atualizacao de Dados do Alvara
async function adicionarVinculoAlvaraEmpresa(idEmpresa, idAlvara) {
  let respValidacao = await validarDadosVinculoAlvaraEmpresa('idProjetoAprovadoVincAlvaraModal, anexos-alvara input');

  if (!respValidacao) {
    return;
  }

  let confirmacao = await msgQuestion('Tem certeza que desja salvar os dados do Alvará?');

  if (!confirmacao?.value) {
    return;
  }

  animationLoadingStart('Enviando dados, aguarde...', 100, false);

  try {
    let dados = await montarPayloadAdicionarVinculoAlvaraEmpresaModal(idEmpresa, idAlvara);
    let textoFuncao = 'CONTABILIDADE/ADICIONAR ALVARA EMPRESA';

    let resp = await ajaxPost("api/contabilidade/vinculo-alvaras-empresa.xsjs", dados);

    if (!resp?.success) {
      return msgWarning(resp.msg);
    }

    await gerarLog(dados, textoFuncao);

    await recarregarListaAlvarasEmpresaModal(idEmpresa);

    $('#modal-detalhes-alvara-empresa').modal('hide');

    await msgSuccess('Edição realizada com sucesso!');

    pesquisarEmpresasAlvaras();

  } catch (error) {
    console.log(error);
    msgError('Erro aa tentar enviar os dados do alvará, recarregue e tente novamente!');
  }
}

async function editarVinculoAlvaraEmpresa(idVinculoAlvara, idEmpresa) {
  let respValidacao = await validarDadosVinculoAlvaraEmpresa('idProjetoAprovadoVincAlvaraModal, anexos-alvara input');

  if (!respValidacao) {
    return;
  }

  let confirmacao = await msgQuestion('Tem certeza que desja salvar os dados do Alvará?');

  if (!confirmacao?.value) {
    return;
  }

  animationLoadingStart('Enviando dados, aguarde...', 100, false);

  try {
    let dados = await montarPayloadEditarVinculoAlvaraEmpresaModal(idVinculoAlvara);
    let textoFuncao = 'CONTABILIDADE/EDITAR ALVARA EMPRESA';

    let resp = await ajaxPut("api/contabilidade/vinculo-alvaras-empresa.xsjs", dados);

    if (!resp?.success) {
      return msgWarning(resp.msg);
    }

    await gerarLog(dados, textoFuncao);

    await recarregarListaAlvarasEmpresaModal(idEmpresa);

    $('#modal-detalhes-alvara-empresa').modal('hide');

    await msgSuccess('Edição realizada com sucesso!');

    pesquisarEmpresasAlvaras();

  } catch (error) {
    console.log(error);
    msgError('Erro aa tentar enviar os dados do alvará, recarregue e tente novamente!');
  }
}
//* Fim funcoes de Visualizacao/Insercao/Atualizacao de Dados do Alvara

//* Inicio funcoes de Visualizacao/Insercao/Atualizacao de Arquivos Anexos do Alvara
async function visualizarAnexoAlvaraEmpresa(idVinculo) {
  try {
    animationLoadingStart();

    let url = "http://164.152.245.77:8000/quality/concentrador_homologacao/api/contabilidade/arquivos-anexos-alvaras-empresa.xsjs?id=" + idVinculo;

    await abrirPdfAlvara(url);

    animationLoadingStop();
  } catch (error) {
    console.log(error);
    msgError('Erro ao tentar visualizar o alvará da empresa. recarregue e tente novamamente')
  }
}

async function abrirPdfAlvara(url) {
  let novaAba = window.open("", "_blank");

  novaAba.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Alvará PDF</title>
      <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/icons/file-earmark-pdf-fill.svg">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        html, body { height: 100%; margin: 0; }
        iframe { width: 100%; height: 100%; border: none; display: none; }
        #loader { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
        #error { display: none; }
      </style>
    </head>
      <body>
        <div id="loader">
          <div class="text-center" style="width: 320px;">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <div class="fw-semibold mb-2">Carregando documento, aguarde…</div>

            <button class="btn btn-secondary me-2" onclick="window.close()">Fechar</button>
          </div>
        </div>

        <div id="error" class="container h-100 d-flex align-items-center justify-content-center" style="display: none !important;">
          <div class="text-center">
            <h5 class="mb-3 text-danger">Não foi possível carregar o documento</h5>

            <p class="text-muted mb-4">  O carregamento demorou mais do que o esperado. </p>

            <button class="btn btn-secondary me-2" onclick="window.close()">Fechar</button>
          </div>
        </div>

        <iframe id="pdfFrame"></iframe>

        <script>
          setTimeout(() => {
            let iframe = document.getElementById("pdfFrame");
            let loader = document.getElementById("loader");
            let error = document.getElementById("error");
            let carregou = false;

            iframe.onload = () => {
              carregou = true;
              loader.style.display = "none";
              iframe.style.display = "block";
            };

            iframe.src = "${url}#zoom=100";

            setTimeout(() => {
              if (!carregou) {
                loader.style.display = "none";
                error.style.display = "flex";
              }
            }, 8000);
          }, 1000);
        </script>

      </body>
    </html>
  `);

  novaAba.document.close();

  return;
}

function adicionarAnexosAlvaraEmpresa(idVinculoAlvara) {
  let inputElement = $('#inputFilesAlvara');

  inputElement
    .on('click', function () {
      this.value = '';
    })
    .on('input', async (event) => {
      if (!event.target?.files?.length) {
        return;
      }

      let confirmacao = await msgQuestion('Certeza Que Deseja Anexar o Arquivo Selecionado?');

      if (!confirmacao?.value) {
        return;
      }

      try {
        animationLoadingStart();

        let listaArquivosAlvaras = await buscarArquivosAlvaraSelecionadosInput(event.target.id);

        let dados = [
          {
            IDVINCULOALVARAEMPRESA: Number(idVinculoAlvara),
            IDFUNCIONARIO: Number(IDFuncionarioLogin),
            ARQUIVOSALVARA: listaArquivosAlvaras
          }
        ];
        let textoFuncao = 'CONTABILIDADE/ADICIONAR ARQUIVO ALVARA EMPRESA';

        let resp = await ajaxPost("api/contabilidade/arquivos-anexos-alvaras-empresa.xsjs", dados);

        if (resp?.success == false) {
          return msgWarning(resp?.msg)
        }

        await gerarLog(dados, textoFuncao);

        await recarregarListaArquivosAnexosAlvarasModal(idVinculoAlvara);

        await msgSuccess('Edição realizada com sucesso!');

        inputElement.off('change');

      } catch (error) {
        console.log(error);
        msgError('Erro aa tentar enviar os dados do alvará, recarregue e tente novamente!');
      }
    });

  inputElement.click();
}

async function editarAnexoAlvaraEmpresa(idVinculoAlvara, idArquivoAlvara) {
  let inputElement = $(`#inputFileAlvaraEditar_${idArquivoAlvara}`);

  inputElement
    .on('click', function () {
      this.value = '';
    })
    .on('change', async (event) => {
      if (!event.target?.files?.length) {
        return;
      }

      let confirmacao = await msgQuestion('Certeza Que Deseja Substituir Pelo Anexo Selecionado?');

      if (!confirmacao?.value) {
        return;
      }

      try {
        animationLoadingStart();

        let listaArquivosAlvaras = await buscarArquivosAlvaraSelecionadosInput(event.target.id);

        let dados = [
          {
            IDVINCULOALVARAEMPRESA: Number(idVinculoAlvara),
            IDARQUIVOSALVARA: Number(idArquivoAlvara),
            IDFUNCIONARIO: Number(IDFuncionarioLogin),
            ARQUIVOSALVARA: listaArquivosAlvaras
          }
        ];
        let textoFuncao = 'CONTABILIDADE/EDITAR ARQUIVO ANEXADO ALVARA EMPRESA';

        let resp = await ajaxPut("api/contabilidade/arquivos-anexos-alvaras-empresa.xsjs?cancelar=False", dados);

        if (resp?.success == false) {
          return msgWarning(resp?.msg)
        }

        await gerarLog(dados, textoFuncao);

        await recarregarListaArquivosAnexosAlvarasModal(idVinculoAlvara);

        await msgSuccess('Edição realizada com sucesso!');

        inputElement.off('change');

      } catch (error) {
        console.log(error);
        msgError('Erro aa tentar enviar os dados do alvará, recarregue e tente novamente!');
      }
    });

  inputElement.click();
}

async function cancelarArquivoAlvaraEmpresa(idVinculoAlvara, idArquivoAlvara) {
  let confirmacao = await msgQuestion('Certeza Que Deseja Cancelar Este Anexo?');

  if (!confirmacao?.value) {
    return;
  }

  try {
    animationLoadingStart();

    let dados = [
      {
        IDARQUIVOSALVARA: Number(idArquivoAlvara),
        STATIVO: 'False',
        IDFUNCIONARIO: Number(IDFuncionarioLogin)
      }
    ];
    let textoFuncao = 'CONTABILIDADE/CANCELAR ARQUIVO ANEXADO ALVARA EMPRESA';

    await ajaxPut("api/contabilidade/arquivos-anexos-alvaras-empresa.xsjs?cancelar=True", dados)
    await gerarLog(dados, textoFuncao);

    await recarregarListaArquivosAnexosAlvarasModal(idVinculoAlvara);

    await msgSuccess('Edição realizada com sucesso!');

  } catch (error) {
    console.log(error);
    msgError('Erro aa tentar enviar os dados do alvará, recarregue e tente novamente!');
  }
}
//* Fim funcoes de Visualizacao/Insercao/Atualizacao de Arquivos Anexos do Alvara

//? =================== FIM ROTINA DE ALVARAS DE EMPRESAS ===================//

