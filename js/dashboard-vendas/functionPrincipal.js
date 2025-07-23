/*
 * Author: Rodrigo Amorim de Moura
 * Data: 07/02/2018
 * Email: ram.amorim@gmail.com  
 */
 
var textoAGravar = '';
var quantidadePaginas = 0;
var TotalDespesaLoja = 0;
var contador = 0;
var saldoAnteriorBonificacao = 0;

//var IDEmpresaLogin = 35;
//var NOEmpresaLogin = '0035 - TO - valparizo 1';
//var NomeFuncionarioLogin = 'DANIEL ALVES DA SILVA';


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

let horaAtualCampo = hora + ':' + min;

let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

var dataPesquisaFormatada = dataAtual;

//PEGANDO O PRIMEITO DIA DO MÊS ATUAL////////////////

var primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);

diaMesAtual = primeiroDia.getDate();
let diaFormatadoMesAtual = String(diaMesAtual);
let dataPrimeiroDiaFormatado = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoMesAtual.padStart(2, '0');

 switch (mes) { //converte o numero em nome do mês
  case 0:
   mes = "Janeiro";
   break;
  case 1:
   mes = "Fevereiro";
   break;
  case 2:
   mes = "Março";
   break;
  case 3:
   mes = "Abril";
   break;
  case 4:
   mes = "Maio";
   break;
  case 5:
   mes = "Junho";
   break;
  case 6:
   mes = "Julho";
   break;
  case 7:
   mes = "Agosto";
   break;
  case 8:
   mes = "Setembro";
   break;
  case 9:
   mes = "Outubro";
   break;
  case 10:
   mes = "Novembro";
   break;
  case 11:
   mes = "Dezembro";
   break;
  }

var meseano = mes+'/'+ano4;
//////////////// Funções Globais ///////////////////////////////////

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
    var dataEn = dataAtualCampo;
    var dataQueb = dataEn.split('-');
    var AnoPesq = dataQueb[0];
    var MesPesq = dataQueb[1];
    var DiaPesq = dataQueb[2];
    dataPesquisaFormatada = DiaPesq +'/'+ MesPesq +'/'+ AnoPesq; 
}

//////////////// Página Inicial //////////////////

$(document).ready(function() {

	$('#parametro_dia').val(dataAtualCampo);
	$('.parametro_dia').text(dataAtual);

	ajaxGet('api/financeiro/venda-total-mes.xsjs?dataPesquisaInicio=' + dataPrimeiroDiaFormatado +'&dataPesquisa=' + dataAtualCampo)
		.then(retornoVendaTotalMes)
		.catch(funcError);
		
	ajaxGet('api/financeiro/venda-total.xsjs?dataPesquisa=' + dataAtualCampo)
		.then(retornoVendaTotal)
		.catch(funcError);
		
	ajaxGet('api/financeiro/venda-total-to.xsjs?idgrupo=1&dataPesquisa=' + dataAtualCampo)
		.then(retornoListaVendasTOMGFCYO)
		.catch(funcError);
		
	ajaxGet('api/financeiro/venda-total-to.xsjs?idgrupo=2&dataPesquisa=' + dataAtualCampo)
		.then(retornoListaVendasTOMGFCYO)
		.catch(funcError);		
		
	ajaxGet('api/financeiro/venda-total-to.xsjs?idgrupo=3&dataPesquisa=' + dataAtualCampo)
		.then(retornoListaVendasTOMGFCYO)
		.catch(funcError);		
		
	ajaxGet('api/financeiro/venda-total-to.xsjs?idgrupo=4&dataPesquisa=' + dataAtualCampo)
		.then(retornoListaVendasTOMGFCYO)
		.catch(funcError);

});


function retornoVendaTotalMes(respostaVendaMes) {
    var totalMes = 0;
    if(respostaVendaMes.data.length > 0){
	    totalMes = respostaVendaMes.data[0].VALORTOTALMES;
    }
	$('.vrTotalVendaMes').html(
		`<h2 class="display-3 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalMes).toFixed(2))}<small class="m-0 l-h-n">Venda Total Mês - ${meseano} </small></h2>`
	);

}

function retornoVendaTotal(respostaVenda) {
    
	var totalDespesaAdiantamento = 0;
	PercDinheiro = 0;
	PercCartao = 0;
	PercPOS = 0;
	PercConvenio = 0;
	
	var totalDinheiro = 0;
	var totalCartao = 0;
	var totalConvenio = 0;
	var totalPos = 0;
	var totalVoucher = 0;
	var totalFatura = 0;
	var totalDespesa = 0;
	var totalAdiantamentoSalarial = 0;
	
	if(respostaVenda.data.length > 0){
        totalDinheiro = respostaVenda.data[0].VALORTOTALDINHEIRO;
    	totalCartao = respostaVenda.data[0].VALORTOTALCARTAO;
    	totalConvenio = respostaVenda.data[0].VALORTOTALCONVENIO;
    	totalPos = respostaVenda.data[0].VALORTOTALPOS;
    	totalVoucher = respostaVenda.data[0].VALORTOTALVOUCHER;
    	totalFatura = respostaVenda.data[0].VALORTOTALFATURA;
    	totalDespesa = respostaVenda.data[0].VALORTOTALDESPESA;
    	totalAdiantamentoSalarial = respostaVenda.data[0].VALORTOTALADIANTAMENTOSALARIAL;
	}
	var totalDespesaAdiantamento = parseFloat(totalDespesa) + parseFloat(totalAdiantamentoSalarial);
	var totalRealizado = (parseFloat(totalDinheiro) + parseFloat(totalCartao) + parseFloat(totalConvenio) + parseFloat(totalPos));

    PercDinheiro = ((totalDinheiro * 100) / totalRealizado);
    PercCartao = ((totalCartao * 100) / totalRealizado);
    PercPOS = ((totalPos * 100) / totalRealizado);
    PercConvenio = ((totalConvenio * 100) / totalRealizado);

	$('.percTotalDinheiro').html(
		`<h3>${mascaraValor(parseFloat(PercDinheiro).toFixed(2))}% `
	);

	$('.percTotalCartao').html(
		`<h3>${mascaraValor(parseFloat(PercCartao).toFixed(2))}% `
	);
	
	$('.percTotalPOS').html(
		`<h3>${mascaraValor(parseFloat(PercPOS).toFixed(2))}% `
	);
	
	$('.percTotalConvenio').html(
		`<h3>${mascaraValor(parseFloat(PercConvenio).toFixed(2))}% `
	);
	
	
	$('.vrTotalDinheiro').html(
		`<h2 class="display-3 d-block l-h-n m-0 fw-600">${mascaraValor(parseFloat(totalDinheiro).toFixed(2))}<small class="m-0 l-h-n">Dinheiro</small></h2>`
	);
	$('.vrTotalCartao').html(
		`<h2 class="display-3 d-block l-h-n m-0 fw-600">${mascaraValor(parseFloat(totalCartao).toFixed(2))}<small class="m-0 l-h-n">Cartão</small></h2>`
	);
	$('.vrTotalPos').html(
		`<h2 class="display-3 d-block l-h-n m-0 fw-600">${mascaraValor(parseFloat(totalPos).toFixed(2))}<small class="m-0 l-h-n">POS</small></h2>`
	);
	$('.vrTotalConvenio').html(
		`<h2 class="display-3 d-block l-h-n m-0 fw-600">${mascaraValor(parseFloat(totalConvenio).toFixed(2))}<small class="m-0 l-h-n">Convênio</small></h2>`
	);
	$('.vrTotalFatura').html(
		`<h2 class="display-3 d-block l-h-n m-0 fw-600">${mascaraValor(parseFloat(totalFatura).toFixed(2))}<small class="m-0 l-h-n">Fatura</small></h2>`
	);
	$('.vrTotal').html(
		`<h2 class="display-3 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalRealizado).toFixed(2))}<small class="m-0 l-h-n">Venda Total Dia: Dinheiro - Cartão - POS - Convênio</small></h2>`
	);
	
	setTimeout(function () {
        atualizar_dados();
    }, 12000); //tempo em milisegundos. Neste caso, o refresh vai acontecer de 5 em 5 segundos.
}


function atualizar_dados() {
    
    $('#dt-basic-top-venda-tesoura').DataTable().clear().destroy();
    $('#dt-basic-top-venda-magazine').DataTable().clear().destroy();
    $('#dt-basic-top-venda-yorus').DataTable().clear().destroy();
    $('#dt-basic-top-venda-freecenter').DataTable().clear().destroy();
    
    var submeteData = dataAtualCampo;
    formataDataPesquisa();

	ajaxGet('api/financeiro/venda-total-mes.xsjs?dataPesquisaInicio=' + dataPrimeiroDiaFormatado +'&dataPesquisa=' + dataAtualCampo)
		.then(retornoVendaTotalMes)
		.catch(funcError);
		
	ajaxGet('api/financeiro/venda-total.xsjs?dataPesquisa=' + dataAtualCampo)
		.then(retornoVendaTotal)
		.catch(funcError);
		
	ajaxGet('api/financeiro/venda-total-to.xsjs?idgrupo=1&dataPesquisa=' + dataAtualCampo)
		.then(retornoListaVendasTOMGFCYO)
		.catch(funcError);
		
	ajaxGet('api/financeiro/venda-total-to.xsjs?idgrupo=2&dataPesquisa=' + dataAtualCampo )
		.then(retornoListaVendasTOMGFCYO)
		.catch(funcError);		
		
	ajaxGet('api/financeiro/venda-total-to.xsjs?idgrupo=3&dataPesquisa=' + dataAtualCampo )
		.then(retornoListaVendasTOMGFCYO)
		.catch(funcError);		
		
	ajaxGet('api/financeiro/venda-total-to.xsjs?idgrupo=4&dataPesquisa=' + dataAtualCampo )
		.then(retornoListaVendasTOMGFCYO)
		.catch(funcError);
}


function retornoListaVendasTOMGFCYO(respostaListaVendaTOMGFCYO) {

	var somaTotalDiponivelTO = 0;
	var somaTotalDiponivelMG = 0;
	var somaTotalDiponivelYO = 0;
	var somaTotalDiponivelFC = 0;
	
	var idGrupoT = 0;
	
	if(respostaListaVendaTOMGFCYO.data.length > 0){
	    idGrupoT = respostaListaVendaTOMGFCYO.data[0]['IDGRUPOEMPRESARIAL'];
	}
	
	


    if(idGrupoT == 1){
        
        	var tableVendasTO = $('#dt-basic-top-venda-tesoura').DataTable({"paging": false,"searching": false,"order": ([ 1, 'desc' ]),"info": false});
	        tableVendasTO.rows().remove().draw();
	
        	for (var i = 0; i < 3; i++) {
            if(i === respostaListaVendaTOMGFCYO.data.length ){
                break;
            }
        		var idEmpresaTO = respostaListaVendaTOMGFCYO.data[i]['IDEMPRESA'];
        		var dsEmpresaTO = respostaListaVendaTOMGFCYO.data[i]['NOFANTASIA'];
        		var TotalDiponivelTO = respostaListaVendaTOMGFCYO.data[i]['VALORTOTALVENDA'];

            		tableVendasTO.row.add([
                            `<label style="color: blue; font-size: 11px;">` + dsEmpresaTO + `</label>`,
                            `<label style="color: blue; font-size: 12px;">` + mascaraValor(parseFloat(TotalDiponivelTO).toFixed(2)) +	`</label>`,
                            
                        ]).draw(false);

	        }
    }
    
    if(idGrupoT == 2){
        
        	var tableVendasMG = $('#dt-basic-top-venda-magazine').DataTable({"paging": false,"searching": false,"order": ([ 1, 'desc' ]),"info": false});
        	tableVendasMG.rows().remove().draw();
	
        	for (var i = 0; i < 3; i++) {
        	    if(i === respostaListaVendaTOMGFCYO.data.length ){
                    break;
                }

        		var idEmpresaMG = respostaListaVendaTOMGFCYO.data[i]['IDEMPRESA'];
        		var dsEmpresaMG = respostaListaVendaTOMGFCYO.data[i]['NOFANTASIA'];
        		var TotalDiponivelMG = respostaListaVendaTOMGFCYO.data[i]['VALORTOTALVENDA'];

            		tableVendasMG.row.add([
                            `<label style="color: blue; font-size: 11px;">` + dsEmpresaMG + `</label>`,
                            `<label style="color: blue; font-size: 12px;">` + mascaraValor(parseFloat(TotalDiponivelMG).toFixed(2)) +	`</label>`,
                            
                        ]).draw(false);

	        }
    }
    
    if(idGrupoT == 3){
        
        	var tableVendasYO = $('#dt-basic-top-venda-yorus').DataTable({"paging": false,"searching": false,"order": ([ 1, 'desc' ]),"info": false});
        	tableVendasYO.rows().remove().draw();
	
        	for (var i = 0; i < 3; i++) {
        	    
        	    if(i === respostaListaVendaTOMGFCYO.data.length ){
                    break;
                }

        		var idEmpresaYO = respostaListaVendaTOMGFCYO.data[i]['IDEMPRESA'];
        		var dsEmpresaYO = respostaListaVendaTOMGFCYO.data[i]['NOFANTASIA'];
        		var TotalDiponivelYO = respostaListaVendaTOMGFCYO.data[i]['VALORTOTALVENDA'];

            		tableVendasYO.row.add([
                            `<label style="color: blue; font-size: 11px;">` + dsEmpresaYO + `</label>`,
                            `<label style="color: blue; font-size: 12px;">` + mascaraValor(parseFloat(TotalDiponivelYO).toFixed(2)) +	`</label>`,
                            
                        ]).draw(false);

	        }
    }
    
    if(idGrupoT == 4){
	
        	var tableVendasFC = $('#dt-basic-top-venda-freecenter').DataTable({"paging": false,"searching": false,"order": ([ 1, 'desc' ]),"info": false});
        	tableVendasFC.rows().remove().draw();
	
        	for (var i = 0; i < 3; i++) {
        	    
        	    if(i === respostaListaVendaTOMGFCYO.data.length ){
                    break;
                }

        		var idEmpresaFC = respostaListaVendaTOMGFCYO.data[i]['IDEMPRESA'];
        		var dsEmpresaFC = respostaListaVendaTOMGFCYO.data[i]['NOFANTASIA'];
        		var TotalDiponivelFC = respostaListaVendaTOMGFCYO.data[i]['VALORTOTALVENDA'];

            		tableVendasFC.row.add([
                            `<label style="color: blue; font-size: 11px;">` + dsEmpresaFC + `</label>`,
                            `<label style="color: blue; font-size: 12px;">` + mascaraValor(parseFloat(TotalDiponivelFC).toFixed(2)) +	`</label>`,
                            
                        ]).draw(false);

	        }
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




