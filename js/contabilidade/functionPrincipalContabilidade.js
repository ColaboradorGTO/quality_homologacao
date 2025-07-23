/*
 * Author: Rodrigo Amorim de Moura
 * Data: 07/02/2018
 * Email: ram.amorim@gmail.com
 */

if(!getCurrentUser()){
    window.location.href = 'index.html';
}

var usuario = getCurrentUser().user;


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
        url: 'https://api-quality.vercel.app/gerar-danfe',
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
