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
var IDPerfilLogin = usuario['IDPERFIL'];

var textoAGravar = '';
var quantidadePaginas = 0;
var TotalDespesaLoja = 0;
var contador = 0;
var saldoAnteriorBonificacao = 0;

//var IDEmpresaLogin = 35;
//var NOEmpresaLogin = '0035 - TO - valparizo 1';
//var NomeFuncionarioLogin = 'DANIEL ALVES DA SILVA';

console.dir(usuario); 

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
doissmesesatras = (mesatual - 2);

if(doissmesesatras == 0){
    doissmesesatras = 12;
    anodoismeses = ano4 - 1;
}else{
    doissmesesatras = doissmesesatras;
    anodoismeses = ano4;
}

tresmesesatras = (mes - 3);
mesFormatado = String(mesatual);
mesFormatado2meses = String(doissmesesatras);
horaFormatado = String(hora);
minutoFormatado = String(min);

diachek = String(dia);

if(doissmesesatras == 4 || doissmesesatras == 6 || doissmesesatras == 9 || doissmesesatras == 11){ 
    if(dia == 31){
        var diachek = String(dia - 1);
    }
}else if(doissmesesatras == 2){
    if(dia == 30){
        var diachek = String(dia - 2);
    }else if (dia == 31){
        var diachek = String(dia - 3);
    }
}

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

let horaAtualCampo = horaFormatado.padStart(2, '0') + ':' + minutoFormatado.padStart(2, '0');

let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let dataAtualCampo2Meses = anodoismeses + '-' + (mesFormatado2meses.padStart(2, '0')) + '-' + diachek.padStart(2, '0');

let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

var dataPesquisaFormatada = dataAtual;

var valorTotalRecebido = 0;

//Variáveis totalizadoras do Mapa de pagamento
valorTotalRecebidoMapaVenda = 0;
valorTotalRecebidoMapaCartoes = 0;
valorTotalRecebidoMapaConvenio = 0;
valorTotalRecebidoMapaDinheiro = 0;
valorTotalPagamentoMapaDespesas = 0;
valorTotalDisponivelMapaDinheiro = 0;
valorTotalRecebidoMapaFaturas = 0;
valorTotalDisponivelMapaDinheiroFatura = 0;

valorTotalPagamentoMapaAndiantamentos = 0;


//////////////// Funções Globais ///////////////////////////////////

function Onlynumbers(e) {
	var tecla = (window.event) ? event.keyCode : e.which;
	if (tecla > 47 && tecla < 58) {
		return true;
	} else {
		if (tecla === 8 || tecla === 0 || tecla === 44) {
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

function logout() {
    LogoffUser();
	window.location.href = 'index.html';
}


function alerta_atualizado_sucesso() {
    Swal.fire({
        type: "success",
        title: "Dados Atualizado com Sucesso",
        showConfirmButton: false,
        timer: 2000
    });
}

//////////////// Página Inicial //////////////////

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
	
	ajaxGet('http://ipwho.is/')
	.then(retornoIp)
	.catch(funcError);
});

function retornoIp(resp){
    ipCliente = resp.ip;
}

function retornoVendaTotal(respostaVenda) {
    
	var totalDespesaAdiantamento = 0; 0;
	var totalRealizado = 0;
    
	var totalDinheiro = respostaVenda.data[0].VALORTOTALDINHEIRO;
	var totalCartao = respostaVenda.data[0].VALORTOTALCARTAO;
	var totalConvenio = respostaVenda.data[0].VALORTOTALCONVENIO;
	var totalPos = respostaVenda.data[0].VALORTOTALPOS;
	var totalVoucher = respostaVenda.data[0].VALORTOTALVOUCHER;
	var totalFatura = respostaVenda.data[0].VALORTOTALFATURA;
	var totalDespesa = respostaVenda.data[0].VALORTOTALDESPESA;
	var totalAdiantamentoSalarial = respostaVenda.data[0].VALORTOTALADIANTAMENTOSALARIAL;
	var totalDespesaAdiantamento = parseFloat(totalDespesa) + parseFloat(totalAdiantamentoSalarial);
	var totalRealizado = (parseFloat(totalDinheiro) + parseFloat(totalCartao) + parseFloat(totalConvenio) + parseFloat(totalPos));

	$('.vrTotalDinheiro').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalDinheiro).toFixed(2))}<small class="m-0 l-h-n">Dinheiro</small></h3>`
	);
	$('.vrTotalCartao').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalCartao).toFixed(2))}<small class="m-0 l-h-n">Cartão</small></h3>`
	);
	$('.vrTotalPos').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalPos).toFixed(2))}<small class="m-0 l-h-n">POS</small></h3>`
	);
	$('.vrTotalConvenio').html(
		`<h2 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalConvenio).toFixed(2))}<small class="m-0 l-h-n">Convênio</small></h2>`
	);
	$('.vrTotalFatura').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalFatura).toFixed(2))}<small class="m-0 l-h-n">Fatura</small></h3>`
	);
	$('.vrTotalDespesa').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalDespesaAdiantamento).toFixed(2))}<small class="m-0 l-h-n">Despesas</small></h3>`
	);
	$('.vrTotal').html(
		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalRealizado).toFixed(2))}<small class="m-0 l-h-n">Total Realizado - Vendas</small></h3>`
	);
}

function retornoListaVendasEmpresa(respostaListaVendaEmpresa) {

	var somaTotalFatura = 0;
	var somaTotalFaturaPIX = 0;
	var somaTotalCartao = 0;
	var somaTotalDinheiro = 0;
	var somaTotalConvenio = 0;
	var somaTotalPos = 0;
	var somaTotalPIX = 0;
	var somaTotalMOOVPAY = 0;
	var somaTotalDespesa = 0;
	var somaTotalAdiantamentoSalarial = 0;
	var somaTotalDiponivel = 0;
	var TotalDiponivel = 0;
	var TotalDespAd = 0;
	var TotalBruto = 0;
	var somaTotalBruto = 0;
	
    $('#resultvendaempresa').html(
        `<table id="dt-basic-venda-empresa" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th>Data</th>
                    <th>Loja</th>
                    <th>V. Bruta</th>
                    <th>Dinheiro</th>
                    <th>Cartão</th>
                    <th>POS</th>
                    <th>PIX</th>
                    <th>Convenio</th>
                    <th>Fat PIX</th>
                    <th>Fatura</th>
                    <th>Despesa</th>
                    <th>Disponível</th>
                    <th>Opções</th>
                </tr>
            </thead>
            <tbody id="resultadoPedidosLista">
            </tbody>
            <tfoot id="" class="thead-themed totalVendasEmpresa">
            </tfoot>
        </table>`
    );
        
	var tableVendasEmpresa = $('#dt-basic-venda-empresa').DataTable({
        deferRender:    true,
        paging: true,
        ordering:  false,
        //scrollY:        800,
        //scrollCollapse: false,
        //scroller:       false,
        responsive: true,
        "columnDefs": [
            { "width": "10%", "targets": [1] },
            { "width": "8%", "targets": [0, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
            { "width": "10%", "targets": [11] },
            { "className": 'text-right', "targets": [2, 3, 4, 5, 6, 7, 8, 9, 10] },
            { "className": 'text-center', "targets": [0, 1, 11] },
            
        ],
        dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [

            ]
	    } );
	    
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
		var totalConvenio = respostaListaVendaEmpresa.data[i]['VALORTOTALCONVENIO'];
		var totalCartao = respostaListaVendaEmpresa.data[i]['VALORTOTALCARTAO'];
		var totalPos = respostaListaVendaEmpresa.data[i]['VALORTOTALPOS'];
		var totalPix = respostaListaVendaEmpresa.data[i]['VALORTOTALPIX'];
		var totalMOOVPAY = respostaListaVendaEmpresa.data[i]['TOTALVENDIDOMOOVPAY'];
		var totalFatura = respostaListaVendaEmpresa.data[i]['VALORTOTALFATURA'];
		var totalFaturaPIX = respostaListaVendaEmpresa.data[i]['VALORTOTALFATURAPIX'];
		var totalDespesa = respostaListaVendaEmpresa.data[i]['VALORTOTALDESPESA'];
		var totalAdiantamentoSalarial = respostaListaVendaEmpresa.data[i]['VALORTOTALADIANTAMENTOSALARIAL'];
		
		TotalDespAd = (parseFloat(totalDespesa)+parseFloat(totalAdiantamentoSalarial));
		TotalBruto = (parseFloat(totalDinheiro)+parseFloat(totalCartao)+parseFloat(totalPos)+parseFloat(totalPix)+parseFloat(totalConvenio));

        TotalDiponivel = (parseFloat(totalDinheiro)+parseFloat(totalFatura)) - (parseFloat(totalDespesa)+parseFloat(totalAdiantamentoSalarial));

		tableVendasEmpresa.row.add([
                `<label style="color: blue; font-size: 11px;">` + dataPesquisaFormatada + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + dsEmpresa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(TotalBruto).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalDinheiro).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalCartao).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalPos).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalPix).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalConvenio).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalFaturaPIX).toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + mascaraValor(parseFloat(totalFatura).toFixed(2)) + `</label>`,
                `<label style="color: red; font-size: 11px;">` + mascaraValor(parseFloat(TotalDespAd).toFixed(2)) + `</label>`, 
                `<label style="color: blue; font-size: 12px;">` + mascaraValor(parseFloat(TotalDiponivel).toFixed(2)) +
			`</label>`,
                `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Fechamento" id="`
                    + idEmpresa + `" onclick="modal_Fechamento_loja(this.id)" >Detalhar Fechamento</button>
                </div>`,
                
            ]).draw(false);

		somaTotalBruto = parseFloat(somaTotalBruto) + parseFloat(TotalBruto);
		somaTotalFatura = parseFloat(somaTotalFatura) + parseFloat(totalFatura);
		somaTotalFaturaPIX = parseFloat(somaTotalFaturaPIX) + parseFloat(totalFaturaPIX);
		somaTotalCartao = parseFloat(somaTotalCartao) + parseFloat(totalCartao);
		somaTotalDinheiro = parseFloat(somaTotalDinheiro) + parseFloat(totalDinheiro);
		somaTotalConvenio = parseFloat(somaTotalConvenio) + parseFloat(totalConvenio);
		somaTotalPos = parseFloat(somaTotalPos) + parseFloat(totalPos);
		somaTotalPIX = parseFloat(somaTotalPIX) + parseFloat(totalPix);
		somaTotalMOOVPAY = parseFloat(somaTotalMOOVPAY) + parseFloat(totalMOOVPAY);
		somaTotalDespesa = parseFloat(somaTotalDespesa) + parseFloat(totalDespesa) + parseFloat(totalAdiantamentoSalarial);
		//somaTotalAdiantamentoSalarial = somaTotalAdiantamentoSalarial + totalAdiantamentoSalarial;
		somaTotalDiponivel = parseFloat(somaTotalDiponivel) + (parseFloat(totalDinheiro) + parseFloat(totalFatura)) - (parseFloat(totalDespesa) + parseFloat(totalAdiantamentoSalarial));
	}
	$('.totalVendasEmpresa').html(
		`<tr>
                <th colspan="2" style="text-align: center;">Total</th>
                <th style="font-size: 12px; text-align: right;">` +mascaraValor(parseFloat(somaTotalBruto).toFixed(2)) + `</th>
                <th style="font-size: 12px; text-align: right;">` +mascaraValor(parseFloat(somaTotalDinheiro).toFixed(2)) + `</th>
                <th style="font-size: 12px; text-align: right;">` + mascaraValor(parseFloat(somaTotalCartao).toFixed(2)) + `</th>
                <th style="font-size: 12px; text-align: right;">` + mascaraValor(parseFloat(somaTotalPos).toFixed(2)) +`</th>
		        <th style="font-size: 12px; text-align: right;">` + mascaraValor(parseFloat(somaTotalPIX).toFixed(2)) +`</th>
		        <th style="font-size: 12px; text-align: right;">` + mascaraValor(parseFloat(somaTotalConvenio).toFixed(2)) +`</th>
		        <th style="font-size: 12px; text-align: right;">` + mascaraValor(parseFloat(somaTotalFaturaPIX).toFixed(2)) +`</th>
                <th style="font-size: 12px; text-align: right;">` + mascaraValor(parseFloat(somaTotalFatura).toFixed(2)) +`</th>
                <th style="color: red; font-size: 12px; text-align: right;">` + mascaraValor(parseFloat(somaTotalDespesa).toFixed(2)) +`</th>
                <th style="font-size: 12px; text-align: right;">` + mascaraValor(parseFloat(somaTotalDiponivel).toFixed(2)) +`</th>
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
                                            <label>Histórico:</label>
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
    
    $('#idloja').select2();
    numPage = parseInt(respostaListaEmpresas.page);
    if(numPage === 1){
        $("#idloja").empty();
        $('#idloja').append(
	        `<option value="">Selecione ...</option>`
	    );
    }
    
	for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

		IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
		DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

			$('#idloja').append(
				`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
			);
	}
}

function retornoListaCategoriaReceitaDespesaSelect(respostaListaCategorias) {
    $('#idCategoria').select2();
	for (var i = 0; i < respostaListaCategorias.data.length; i++) {

		IDCategoria = respostaListaCategorias.data[i]['IDCATEGORIARECDESP'];
		DSCategoria = respostaListaCategorias.data[i]['DSCATEGORIA'];

			$('#idCategoria').append(
				`<option value="` + IDCategoria + `"> ` + IDCategoria+` - `+ DSCategoria + `</option>`
			);
	}
}

//================ MENU LISTA VENDA LOJAS ==============================================
function ListaVendasLoja(){
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
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas das Lojas - <span class='fw-300'></span>`);
			
        	ajaxGet('api/informatica/empresa.xsjs')
        		.then(retornoListaEmpresasSelect)
        		.catch(funcError);
      }
    };
    xmlhttp.open("GET", "financeiro_action_listvendasloja.html", true);
    xmlhttp.send();
}

function pesq_vendas_lojas(numPage){
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
        newDataTable('vendalojaperiodo');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/financeiro/venda-loja-periodo.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasLoja)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqvendasloja.html", true);
    xmlhttp.send();
}

function chamarProximaListaVenda(numPage){
    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    ajaxGet('api/financeiro/venda-loja-periodo.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasLoja)
        	.catch(funcError);
}

function retornoListaVendasLoja(respostaListaVendasLojas) {

    var numPageAtual = parseInt(respostaListaVendasLojas.page);
    if(numPageAtual === 1){
        totalVrRecebidoDinheiro = 0;
        totalVrRecebidoCartao = 0;
        totalVrRecebidoPos = 0;
        totalVrRecebidoPix = 0;
        totalVrRecebidoMOOVPAY = 0;
        totalVrRecebidoConvenio = 0;
        totalVrRecebidoVoucherLoja = 0;
        totalVrRecebidoFatura = 0;
        totalVrRecebidoFaturaPIX = 0;
        totalVrDespesaTotal = 0;
        totalVrDisponivel = 0;
        totalVrQuebraCaixa = 0;
        totalVrBruto = 0;
        vrTotalDinheiro = 0;
        vrTotalDinheiroAjuste = 0;
        
        $('#resultado').html(
                    `<table id="dt-basic-vendalojaperiodo" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                        <thead class="bg-primary-600">
                            <tr>
                                <th>Data</th>
                                <th>Loja</th>
                                <th>Dinheiro</th>
                                <th>Cartão</th>
                                <th>POS</th>
                                <th>PIX</th>
                                <th>Convênio</th>
                                <th>Voucher</th>
                                <th>Fatura</th>
                                <th>Fat PIX</th>
                                <th>Despesa</th>
                                <th>Total Recebido</th>
                                <th>Disponível</th>
                            </tr>
                        </thead>
                        <tbody id="resultadoVendaLojaPeriodo">
                        </tbody>
                        <tfoot id="totalResultadoVendaLojaPeriodo"class="thead-themed">
                        </tfoot>
                    </table>`
	            );
	            
        var tableVendaLojaPeriodos = $('#dt-basic-vendalojaperiodo').DataTable({
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
            });
        
        tableVendaLojaPeriodos.rows().remove().draw();
        $('#totalResultadoVendaLojaPeriodo').html('');
    }

    if(respostaListaVendasLojas.data.length != 0){
    	for (var i = 0; i < respostaListaVendasLojas.data.length; i++) {

    	    dataFechamento = respostaListaVendasLojas.data[i]['DTHORAFECHAMENTO'];
            noFantasia = respostaListaVendasLojas.data[i]['NOFANTASIA'];
            vrRecebidoDinheiro = respostaListaVendasLojas.data[i]['totais']['VALORTOTALDINHEIRO'];
            vrRecebidoCartao = respostaListaVendasLojas.data[i]['totais']['VALORTOTALCARTAO'];
            vrRecebidoPos = respostaListaVendasLojas.data[i]['totais']['VALORTOTALPOS'];
            vrRecebidoPix = respostaListaVendasLojas.data[i]['totais']['VALORTOTALPIX'];
            vrRecebidoMOOVPAY = respostaListaVendasLojas.data[i]['totais']['VALORTOTALMOOVPAY'];
            vrRecebidoConvenio = respostaListaVendasLojas.data[i]['totais']['VALORTOTALCONVENIO'];
            vrRecebidoVoucherLoja = respostaListaVendasLojas.data[i]['totais']['VALORTOTALVOUCHER'];
            vrRecebidoFatura = respostaListaVendasLojas.data[i]['totais']['VALORTOTALFATURA'];
            vrRecebidoFaturaPIX = respostaListaVendasLojas.data[i]['totais']['VALORTOTALFATURAPIX'];
            vrDespesa = respostaListaVendasLojas.data[i]['totais']['VALORTOTALDESPESA'];
            vrAdiantamentoSalario = respostaListaVendasLojas.data[i]['totais']['VALORTOTALADIANTAMENTOSALARIAL'];
            vrFisicoDin = respostaListaVendasLojas.data[i]['totais']['VRFISICODINHEIRO'];
            vrAjusteDin = respostaListaVendasLojas.data[i]['totais']['VRAJUSTEDINHEIRO'];
            vrRecebidoDin = respostaListaVendasLojas.data[i]['totais']['VRRECDINHEIRO'];

            vrDespesaTotal = parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrTotalVendido = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoCartao) + parseFloat(vrRecebidoPos) + parseFloat(vrRecebidoPix) + parseFloat(vrRecebidoMOOVPAY) + parseFloat(vrRecebidoConvenio) + parseFloat(vrRecebidoVoucherLoja);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoFatura);
            
            if(parseFloat(vrAjusteDin)>0){
                vrTotalDinheiroAjuste = parseFloat(vrTotalDinheiroAjuste) + parseFloat(vrAjusteDin);
            }else{
                vrTotalDinheiro = parseFloat(vrTotalDinheiro) + parseFloat(vrRecebidoDin);
            }

            vrQuebraCaixa = (parseFloat(vrRecebidoDin)) - parseFloat(vrFisicoDin);

            vrTotal = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);
            vrDisponivel = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal) + parseFloat(vrQuebraCaixa);

            if(vrQuebraCaixa>0){
                tagquebracaixa = `<label style="color: blue;"> + ` + mascaraValor(parseFloat(vrQuebraCaixa).toFixed(2)) + `</label>`;
            }else{
                tagquebracaixa = `<label style="color: red;"> - ` + mascaraValor(parseFloat(vrQuebraCaixa).toFixed(2)) + `</label>`;
            }
            
    		tableVendaLojaPeriodos.row.add([
                `<label style="color: blue; font-size: 11px;">` + dataFechamento + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + noFantasia + ` </label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoDinheiro).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoCartao).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoPos).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoPix).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoConvenio).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoVoucherLoja).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoFatura).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoFaturaPIX).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrDespesaTotal).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrTotalVendido).toFixed(2)) + `</label>`,
                `<label style="color: green;">` + mascaraValor(parseFloat(vrDisponivel).toFixed(2)) + `</label>`,
            ]).draw(false);
            
            totalVrRecebidoDinheiro = parseFloat(totalVrRecebidoDinheiro) + parseFloat(vrRecebidoDinheiro);
            totalVrRecebidoCartao = parseFloat(totalVrRecebidoCartao) + parseFloat(vrRecebidoCartao);
            totalVrRecebidoPos = parseFloat(totalVrRecebidoPos) + parseFloat(vrRecebidoPos);
            totalVrRecebidoPix = parseFloat(totalVrRecebidoPix) + parseFloat(vrRecebidoPix);
            totalVrRecebidoMOOVPAY = parseFloat(totalVrRecebidoMOOVPAY) + parseFloat(vrRecebidoMOOVPAY);
            totalVrRecebidoConvenio = parseFloat(totalVrRecebidoConvenio) + parseFloat(vrRecebidoConvenio);
            totalVrRecebidoVoucherLoja = parseFloat(totalVrRecebidoVoucherLoja) + parseFloat(vrRecebidoVoucherLoja);
            
            totalVrRecebidoFatura = parseFloat(totalVrRecebidoFatura) + parseFloat(vrRecebidoFatura);
            totalVrRecebidoFaturaPIX = parseFloat(totalVrRecebidoFaturaPIX) + parseFloat(vrRecebidoFaturaPIX);
            totalVrDespesaTotal = parseFloat(totalVrDespesaTotal) + parseFloat(vrDespesaTotal);
            totalVrBruto = parseFloat(totalVrBruto) + parseFloat(vrTotalVendido);
            totalVrQuebraCaixa = parseFloat(totalVrQuebraCaixa) + parseFloat(vrQuebraCaixa);
            totalVrDisponivel = parseFloat(totalVrDisponivel) + parseFloat(vrDisponivel);
            
            if(totalVrQuebraCaixa>0){
                tagquebracaixatotal = `<th><label style="color: blue;"> + ` + mascaraValor(parseFloat(totalVrQuebraCaixa).toFixed(2)) + `</label></th>`;
            }else{
                tagquebracaixatotal = `<th><label style="color: red;"> - ` + mascaraValor(parseFloat(totalVrQuebraCaixa).toFixed(2)) + `</label></th>`;
            }
    	}
        
        chamarProximaListaVenda(numPageAtual + 1);
        
    }else{
        $('#totalResultadoVendaLojaPeriodo').html(
    		`<tr>
                <th colspan="2" style="text-align: center;">Total</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoDinheiro).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoCartao).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoPos).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoConvenio).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoVoucherLoja).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoFatura).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoFaturaPIX).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrDespesaTotal).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrBruto).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrDisponivel).toFixed(2)) + `</th>
            </tr>`
    	);
    }

}


//================ MENU LISTA VENDA MARCAS ==============================================
function selecionaempresamarca(){

        $("#idloja").empty();
        $('#idloja').append(
	        `<option value="0">Selecione...</option>`
	    );
	    
    idmarca = $('#idgrupo').val();

    ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca)
	.then(retornoListaEmpresasSelect)
	.catch(funcError);
}

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
        
        	$("#idgrupo").select2();
        	$("#idloja").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas das Marcas - <span class='fw-300'></span>`);
			
            ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch(funcError);
      }
    };
    xmlhttp.open("GET", "financeiro_action_listvendasmarca.html", true);
    xmlhttp.send();
}

function pesq_vendas_marcas(){
    var IDMarcaPesqVenda = $("#idgrupo").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDLojasPesq = $("#descEmpresas").val();
 
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
      
        ajaxGet('api/financeiro/venda-marca-periodo.xsjs?pageSize=500&idMarca=' + IDMarcaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idLoja=' + IDLojaPesqVenda + '&idLojasPesq=' + IDLojasPesq) 
        	.then(retornoListaVendasMarca)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqvendasmarca.html", true);
    xmlhttp.send();
} 

function retornoListaVendasMarca(respostaListaVendasMarcas) {

        totalVrRecebidoDinheiro = 0;
        totalVrRecebidoCartao = 0;
        totalVrRecebidoPos = 0;
        totalVrRecebidoPix = 0;
        totalVrRecebidoMOOVPAY = 0;
        totalVrRecebidoConvenio = 0;
        totalVrRecebidoVoucher = 0;
        totalVrRecebidoFatura = 0;
        totalVrRecebidoFaturaPIX = 0;
        totalVrDespesaTotal = 0;
        totalVrDisponivel = 0;
        totalVrQuebraCaixaMarca = 0;
        totalVrBrutoMarca = 0;
        totalVrBrutoVoucherMarca = 0;
        totalVrVendido = 0;
        vrTotalVendido = 0;
        totalVrFaturas = 0;
        vrFaturaTotal = 0;
        
    if(respostaListaVendasMarcas.data.length != 0){
    	for (var i = 0; i < respostaListaVendasMarcas.data.length; i++) {

    	    idEmpresa = respostaListaVendasMarcas.data[i]['IDEMPRESA'];
            noFantasia = respostaListaVendasMarcas.data[i]['NOFANTASIA'];
            vrRecebidoDinheiro = respostaListaVendasMarcas.data[i]['VRDINHEIRO'];
            vrRecebidoPago = respostaListaVendasMarcas.data[i]['VRTOTALPAGO'];
            vrRecebidoCartao = respostaListaVendasMarcas.data[i]['VRCARTAO'];
            vrRecebidoPos = respostaListaVendasMarcas.data[i]['VRPOS'];
            vrRecebidoPix = respostaListaVendasMarcas.data[i]['VRPIX'];
            vrRecebidoMOOVPAY = respostaListaVendasMarcas.data[i]['VRMOOVPAY'];
            vrRecebidoConvenio = respostaListaVendasMarcas.data[i]['CONVENIO'];
            vrRecebidoVoucher = respostaListaVendasMarcas.data[i]['VOUCHER'];
            vrRecebidoFatura = respostaListaVendasMarcas.data[i]['VRFATURA'];
            vrRecebidoFaturaPIX = respostaListaVendasMarcas.data[i]['VRFATURAPIX'];
            vrDespesa = respostaListaVendasMarcas.data[i]['VRDESPESA'];
            vrAdiantamentoSalario = respostaListaVendasMarcas.data[i]['VRADIANTAMENTOSALARIO'];
            vrFisicoDinMarca = respostaListaVendasMarcas.data[i]['VRFISICODINHEIRO'];
            vrRecebidoDinMarca = respostaListaVendasMarcas.data[i]['VRRECDINHEIRO'];

            vrDespesaTotal = parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoFatura);
            vrFaturaTotal = parseFloat(vrRecebidoFaturaPIX) + parseFloat(vrRecebidoFatura);
            vrDisponivelBrutoVoucher = parseFloat(vrDisponivelBruto);
            vrTotalVendido = parseFloat(vrRecebidoPago) - parseFloat(vrRecebidoVoucher);
            
            vrQuebraCaixaMarca = parseFloat(vrRecebidoDinMarca) - parseFloat(vrFisicoDinMarca);
            
            vrTotalQuebraMarca = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);
            vrTotalQuebraVoucherMarca = parseFloat(vrDisponivelBrutoVoucher) - parseFloat(vrDespesaTotal);
            vrDisponivel = parseFloat(vrDisponivelBrutoVoucher) - parseFloat(vrDespesaTotal) + parseFloat(vrQuebraCaixaMarca);
            

            if(vrQuebraCaixaMarca>0){
                tagquebracaixaMarca = '<td style="text-align: right; font-size: 10px;"><label style="color: blue;"> + ' + mascaraValor(parseFloat(vrQuebraCaixaMarca).toFixed(2)) + '</label></td>';
            }else{
                tagquebracaixaMarca = '<td style="text-align: right; font-size: 10px;"><label style="color: red;"> - ' + mascaraValor(parseFloat(vrQuebraCaixaMarca).toFixed(2)) + '</label></td>';
            }

            totalVrRecebidoDinheiro = parseFloat(totalVrRecebidoDinheiro) + parseFloat(vrRecebidoDinheiro); 
            totalVrRecebidoCartao = parseFloat(totalVrRecebidoCartao) + parseFloat(vrRecebidoCartao);
            totalVrRecebidoPos = parseFloat(totalVrRecebidoPos) + parseFloat(vrRecebidoPos);
            totalVrRecebidoPix = parseFloat(totalVrRecebidoPix) + parseFloat(vrRecebidoPix);
            totalVrRecebidoMOOVPAY = parseFloat(totalVrRecebidoMOOVPAY) + parseFloat(vrRecebidoMOOVPAY);
            totalVrRecebidoConvenio = parseFloat(totalVrRecebidoConvenio) + parseFloat(vrRecebidoConvenio);
            totalVrRecebidoVoucher = parseFloat(totalVrRecebidoVoucher) + parseFloat(vrRecebidoVoucher);
            totalVrRecebidoFatura = parseFloat(totalVrRecebidoFatura) + parseFloat(vrRecebidoFatura);
            totalVrRecebidoFaturaPIX = parseFloat(totalVrRecebidoFaturaPIX) + parseFloat(vrRecebidoFaturaPIX);
            totalVrFaturas = parseFloat(totalVrFaturas) + parseFloat(vrFaturaTotal);
            totalVrDespesaTotal = parseFloat(totalVrDespesaTotal) + parseFloat(vrDespesaTotal);
            totalVrBrutoMarca = parseFloat(totalVrBrutoMarca) + parseFloat(vrTotalQuebraMarca);
            totalVrBrutoVoucherMarca = parseFloat(totalVrBrutoVoucherMarca) + parseFloat(vrTotalQuebraVoucherMarca);  
            totalVrQuebraCaixaMarca = parseFloat(totalVrQuebraCaixaMarca) + parseFloat(vrQuebraCaixaMarca);
            totalVrDisponivel = parseFloat(totalVrDisponivel) + parseFloat(vrDisponivel);
            totalVrVendido = parseFloat(totalVrVendido) + parseFloat(vrTotalVendido);
            
			$('#resultadoVendaMarcaPeriodo').append(
				`<tr>
                    <td><label style="color: blue; font-size: 10px;">` + idEmpresa +	`</label></td>
                    <td><label style="color: blue; font-size: 10px;">` + noFantasia +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalVendido).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoDinheiro).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoCartao).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoPos).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoPix).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoConvenio).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoVoucher).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoFatura).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoFaturaPIX).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrFaturaTotal).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: red;">` + mascaraValor(parseFloat(vrDespesaTotal).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrDisponivelBruto).toFixed(2)) +	`</label></td>`
                    +tagquebracaixaMarca+
                    `<td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrDisponivel).toFixed(2)) +	`</label></td>
                </tr>`
			);
			
            $('#totalResultadoVendaMarcaPeriodo').html(
        		`<tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrVendido).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrRecebidoDinheiro).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrRecebidoCartao).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrRecebidoPos).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrRecebidoConvenio).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrRecebidoVoucher).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrRecebidoFatura).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrRecebidoFaturaPIX).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrFaturas).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrDespesaTotal).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrBrutoMarca).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrQuebraCaixaMarca).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrDisponivel).toFixed(2)) + `</th>
                </tr>`
        	);
    	}

    }

}

function pesq_vendas_marcas_marckup(){
    var IDMarcaPesqVenda = $("#idgrupo").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDLojasPesq = $("#descEmpresas").val();
 
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
      
        ajaxGet('api/financeiro/venda-marca-marckup.xsjs?pageSize=500&idMarca=' + IDMarcaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idLoja=' + IDLojaPesqVenda + '&idLojasPesq=' + IDLojasPesq)
        	.then(retornoListaVendasMarcaMarckup)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqvendasmarcamarckup.html", true);
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
            
            if(marckup < 0){
                tdMarckup = `<td style="text-align: right; font-size: 10px;"><label style="color: red;">-` + mascaraValor(parseFloat(marckup).toFixed(2)) +	`</label></td>`;
            }else{
                tdMarckup = `<td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(marckup).toFixed(2)) +	`</label></td>`;
            }
            
            if(indicadorVenda < 0){
                tdIndicadorVenda = `<td style="text-align: right; font-size: 10px;"><label style="color: red;">-` + mascaraValor(parseFloat(indicadorVenda).toFixed(2)) +	`</label></td>`;
            }else{
                tdIndicadorVenda = `<td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(indicadorVenda).toFixed(2)) +	`</label></td>`;
            }
            
            if(margem < 0){
                tdMargem = `<td style="text-align: right; font-size: 10px;"><label style="color: red;">-` + mascaraValor(parseFloat(margem).toFixed(2)) +	`</label></td>`;
            }else{
                tdMargem = `<td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(margem).toFixed(2)) +	`</label></td>`;
            }
            
            if(margemperc < 0){
                tdMargemperc = `<td style="text-align: right; font-size: 10px;"><label style="color: red;">-` + mascaraValor(parseFloat(margemperc).toFixed(2)) +	`</label></td>`;
            }else{
                tdMargemperc = `<td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(margemperc).toFixed(2)) +	`</label></td>`;
            }
            
			$('#resultadoVendaMarcaMarckup').append(
				`<tr>
                    <td><label style="color: blue; font-size: 10px;">` + idEmpresa +	`</label></td>
                    <td><label style="color: blue; font-size: 10px;">` + noFantasia +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrVendaBruta).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(TotalDesconto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(percDesconto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalVenda).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(VrVoucher).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalVendaLiquida).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(totalCustoProduto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 10px;"><label style="color: blue;">` + mascaraValor(parseFloat(curstoperc).toFixed(2)) +	`</label></td>
                    `+ tdMarckup +``+
                    tdIndicadorVenda +``+
                    tdMargem +``+
                    tdMargemperc + `
                  </tr>`
			);
			
            $('#totalResultadoVendaMarcaMarckup').html(
        		`<tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVendaBrutaSemDesc).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(VrTotalDesconto).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(VrTotalPercDesconto).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(TotalLiq).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(totalVrVoucher).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(TotalBruta).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(VrCustoProdTotal).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(curstopercTotal).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(marckupTotal).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(indicadorVendaTotal).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(margemTotal).toFixed(2)) + `</th>
                    <th style="text-align: right; font-size: 10px;">` + mascaraValor(parseFloat(margempercTotal).toFixed(2)) + `</th>
                </tr>`
        	);
    	}

    }

}

function pesq_vendas_marcas_rob(){
    var IDMarcaPesqVenda = $("#idgrupo").val();
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
      
        ajaxGet('api/financeiro/venda-marca-rob.xsjs?pageSize=500&idMarca=' + IDMarcaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasMarcaROB)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqvendasmarcarob.html", true);
    xmlhttp.send();
}

function retornoListaVendasMarcaROB(respostaListaVendasMarcasROB) {

        vrTotalReceitaLiquida = 0;
        vrTotalLucroBruto = 0;

        TotalBruta = 0;
        TotalDesconto = 0;
        TotalICMS = 0;
        TotalPIS = 0;
        TotalCOFINS = 0;
        totalVrVoucher = 0;
        

        
    if(respostaListaVendasMarcasROB.data.length != 0){
    	for (var i = 0; i < respostaListaVendasMarcasROB.data.length; i++) {

    	    idGrupoEmpresa = respostaListaVendasMarcasROB.data[i]['vendaMarca']['IDGRUPOEMPRESARIAL'];
            noGrupoFantasia = respostaListaVendasMarcasROB.data[i]['vendaMarca']['DSGRUPOEMPRESARIAL'];
            qtdProduto = respostaListaVendasMarcasROB.data[i]['vendaMarca']['QTD']; 
            vrTotalVendaBruta = respostaListaVendasMarcasROB.data[i]['vendaMarca']['VRTOTALLIQUIDO'];
            totalCustoProduto = respostaListaVendasMarcasROB.data[i]['vendaMarca']['TOTALCUSTO'];
            
            VrPago = parseFloat(respostaListaVendasMarcasROB.data[i]['valorPago']);
            VrVoucher = parseFloat(respostaListaVendasMarcasROB.data[i]['voucher']);
            TotalDesconto = respostaListaVendasMarcasROB.data[i]['valorDesconto'];
            TotalICMS = respostaListaVendasMarcasROB.data[i]['valorICMS'];
            
            TotalPIS =  ((parseFloat(VrPago) - parseFloat(TotalICMS))*1.65)/100;
            TotalCOFINS = ((parseFloat(VrPago) - parseFloat(TotalICMS))*7.60)/100;
            
            vrVendaBruta = parseFloat(VrPago) + parseFloat(TotalDesconto);
            
            totalVrVoucher = totalVrVoucher + VrVoucher;
           
            vrTotalReceitaLiquida = parseFloat(VrPago) - (parseFloat(VrVoucher) + TotalPIS + TotalCOFINS + parseFloat(TotalICMS)); 
            vrTotalLucroBruto = vrTotalReceitaLiquida - parseFloat(totalCustoProduto);
            
            
			$('#resultadoVendaMarcaRob').append(
				`<tr>
                    <td><label style="color: blue; font-size: 10px;">` + noGrupoFantasia +	`</label></td>
                    <td style="text-align: right; font-size: 12px;"><label style="color: red;">` + mascaraValor(parseFloat(vrVendaBruta).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 12px;"><label style="color: red;">` + mascaraValor(parseFloat(TotalDesconto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 12px;"><label style="color: red;">` + mascaraValor(parseFloat(VrVoucher).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 12px;"><label style="color: red;">` + mascaraValor(parseFloat(TotalICMS).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 12px;"><label style="color: red;">` + mascaraValor(parseFloat(TotalPIS).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 12px;"><label style="color: red;">` + mascaraValor(parseFloat(TotalCOFINS).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 12px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalReceitaLiquida).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 12px;"><label style="color: blue;">` + mascaraValor(parseFloat(totalCustoProduto).toFixed(2)) +	`</label></td>
                    <td style="text-align: right; font-size: 12px;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalLucroBruto).toFixed(2)) +	`</label></td>
                  </tr>`
			);
			
            $('#totalResultadoVendaMarcaRob').html(
        		`<tr>
                    <th colspan="10" style="text-align: center;"></th>
                </tr>`
        	);
    	}

    }

}

function pesq_vendas_marcas_ticket(){
    var IDMarcaPesqVenda = $("#idgrupo").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDLojasPesq = $("#descEmpresas").val();
 
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
      
        ajaxGet('api/financeiro/venda-marca-periodo.xsjs?pageSize=500&idMarca=' + IDMarcaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idLoja=' + IDLojaPesqVenda + '&idLojasPesq=' + IDLojasPesq)
        	.then(retornoListaVendasTicketMedio)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqvendasticketmedio.html", true);
    xmlhttp.send();
} 

function retornoListaVendasTicketMedio(respostaListaVendasTicketMedio) {

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
        
    if(respostaListaVendasTicketMedio.data.length != 0){
    	for (var i = 0; i < respostaListaVendasTicketMedio.data.length; i++) {

    	    idEmpresa = respostaListaVendasTicketMedio.data[i]['IDEMPRESA'];
            noFantasia = respostaListaVendasTicketMedio.data[i]['NOFANTASIA'];
            vrRecebidoDinheiro = respostaListaVendasTicketMedio.data[i]['VRDINHEIRO'];
            vrRecebidoCartao = respostaListaVendasTicketMedio.data[i]['VRCARTAO'];
            vrRecebidoPos = respostaListaVendasTicketMedio.data[i]['VRPOS'];
            vrRecebidoPix = respostaListaVendasTicketMedio.data[i]['VRPIX'];
            vrRecebidoConvenio = respostaListaVendasTicketMedio.data[i]['CONVENIO'];
            vrRecebidoVoucher = respostaListaVendasTicketMedio.data[i]['VOUCHER'];
            vrRecebidoFatura = respostaListaVendasTicketMedio.data[i]['VRFATURA'];
            vrDespesa = respostaListaVendasTicketMedio.data[i]['VRDESPESA'];
            vrAdiantamentoSalario = respostaListaVendasTicketMedio.data[i]['VRADIANTAMENTOSALARIO'];
            vrFisicoDinMarca = respostaListaVendasTicketMedio.data[i]['VRFISICODINHEIRO'];
            vrRecebidoDinMarca = respostaListaVendasTicketMedio.data[i]['VRRECDINHEIRO'];
            qtdVendas = respostaListaVendasTicketMedio.data[i]['QTDVENDA'];

            vrDespesaTotal = parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoCartao) + parseFloat(vrRecebidoPos) + parseFloat(vrRecebidoConvenio) + parseFloat(vrRecebidoPix);
            vrDisponivelBrutoVoucher = parseFloat(vrDisponivelBruto);
            
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
            
			$('#resultadoVendaTicketPeriodo').append(
				`<tr>
                    <td><label style="color: blue; font-size: 11px;">` + idEmpresa +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + noFantasia +	`</label></td>
                    <td style="text-align: right;"><label style="color: green;">` + (parseFloat(qtdVendas)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrDisponivel).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(VrTicketM).toFixed(2)) +	`</label></td>
                </tr>`
			);
			
            $('#totalResultadoVendaTicketPeriodo').html(
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

//================ VENDAS VENDEDORES DIGITAIS ==============================================
function ListaVendasDigitais(){
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
    xmlhttp.open("GET", "financeiro_action_listvendasdigital.html", true);
    xmlhttp.send();
}

function pesq_vendas_digitais(numPage){
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
      
        ajaxGet('api/financeiro/venda-digital.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasDigital)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqvendasdigital.html", true);
    xmlhttp.send();
}

function retornoListaVendasDigital(respostaListaVendasDigital) {

    var numPageAtual = parseInt(respostaListaVendasDigital.page);
    if(numPageAtual === 1){
        totalQuantidade = 0;
        totalVrliquido = 0;
        
        $('#resultado').html(
                    `<table id="dt-basic-vendaDigitalperiodo" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                        <thead class="bg-primary-600">
                            <tr>
                                <th>Data</th>
                                <th>Loja</th>
                                <th>Venda Nº</th>
                                <th>Ctr Venda</th>
                                <th>Vendedor</th>
                                <th>Produto</th>
                                <th>QTD</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody id="resultadoVendaDigitalPeriodo">
                        </tbody>
                        <tfoot id="totalResultadoVendaDigitalPeriodo"class="thead-themed">
                        </tfoot>
                    </table>`
	            );
	            
        var tableVendaDigitalPeriodos = $('#dt-basic-vendaDigitalperiodo').DataTable();
        
        tableVendaDigitalPeriodos.rows().remove().draw();
        $('#totalResultadoVendaDigitalPeriodo').html('');
    }

    if(respostaListaVendasDigital.data.length != 0){
    	for (var i = 0; i < respostaListaVendasDigital.data.length; i++) {
    	    
    	    nomeFantasia = respostaListaVendasDigital.data[i]['NOFANTASIA'];
            idVenda = respostaListaVendasDigital.data[i]['IDVENDA'];
            idVendaDetalhe = respostaListaVendasDigital.data[i]['CTRVENDA'];
            nomeFuncionario = respostaListaVendasDigital.data[i]['NOFUNCIONARIO'];
            nomeProduto = respostaListaVendasDigital.data[i]['DSNOME'];
            quantidade = respostaListaVendasDigital.data[i]['QTD'];
            valorTotalLiquido = respostaListaVendasDigital.data[i]['VRTOTALLIQUIDO'];
            dataHoraFechamento = respostaListaVendasDigital.data[i]['DTHORAFECHAMENTOFORMATADA'];

    		tableVendaDigitalPeriodos.row.add([
                `<label style="color: blue; font-size: 11px;">` + dataHoraFechamento + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + nomeFantasia + ` </label>`,
                 `<label style="color: blue;">` + idVenda + `</label>`,
                `<label style="color: blue;">` + idVendaDetalhe + `</label>`,
                 `<label style="color: blue;">` + nomeFuncionario + `</label>`,
                `<label style="color: blue;">` + nomeProduto + `</label>`,
                `<label style="color: blue;">` + quantidade + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(valorTotalLiquido).toFixed(2)) + `</label>`,
            ]).draw(false);
            
            totalQuantidade = parseFloat(totalQuantidade) + parseFloat(quantidade);
            totalVrliquido = parseFloat(totalVrliquido) + parseFloat(valorTotalLiquido);
            
    	}
        
        chamarProximaListaVendaDigital(numPageAtual + 1);
        
    }else{
        $('#totalResultadoVendaDigitalPeriodo').html(
    		`<tr>
                <th colspan="6" style="text-align: center;">Total</th>
                <th>` + mascaraValor(totalQuantidade) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrliquido).toFixed(2)) + `</th>
            </tr>`
    	);
    }

}

function chamarProximaListaVendaDigital(numPage){
    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    ajaxGet('api/financeiro/venda-digital.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasDigital)
        	.catch(funcError);
}

function ListaVendasDigitaisResumido(){
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
    xmlhttp.open("GET", "financeiro_action_listvendasdigital.html", true);
    xmlhttp.send();
}

function pesq_vendas_digitaisResumido(numPage){
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
      
        ajaxGet('api/financeiro/venda-digital.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasDigitalResumido)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqvendasdigital.html", true);
    xmlhttp.send();
}

function retornoListaVendasDigitalResumido(respostaListaVendasDigital) {

    var numPageAtual = parseInt(respostaListaVendasDigital.page);
    if(numPageAtual === 1){
        totalQuantidade = 0;
        totalVrliquido = 0;
        
        $('#resultado').html(
                    `<table id="dt-basic-vendaDigitalperiodoresumido" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                        <thead class="bg-primary-600">
                            <tr>
                                <th>Data</th>
                                <th>CNPJ</th>
                                <th>Loja</th>
                                <th>QTD</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody id="resultadoVendaDigitalPeriodoResumido">
                        </tbody>
                        <tfoot id="totalResultadoVendaDigitalPeriodoResumido"class="thead-themed">
                        </tfoot>
                    </table>`
	            );
	            
        var tableVendaDigitalPeriodosResumido = $('#dt-basic-vendaDigitalperiodoresumido').DataTable();
        
        tableVendaDigitalPeriodosResumido.rows().remove().draw();
        $('#totalResultadoVendaDigitalPeriodoResumido').html('');
    }

    if(respostaListaVendasDigital.data.length != 0){
    	for (var i = 0; i < respostaListaVendasDigital.data.length; i++) {
    	    
    	    nuCnpj = respostaListaVendasDigital.data[i]['NUCNPJ'];
    	    nomeFantasia = respostaListaVendasDigital.data[i]['NOFANTASIA'];
            idVenda = respostaListaVendasDigital.data[i]['IDVENDA'];
            idVendaDetalhe = respostaListaVendasDigital.data[i]['IDVENDADETALHE'];
            nomeFuncionario = respostaListaVendasDigital.data[i]['NOFUNCIONARIO'];
            nomeProduto = respostaListaVendasDigital.data[i]['DSNOME'];
            quantidade = respostaListaVendasDigital.data[i]['QTD'];
            valorTotalLiquido = respostaListaVendasDigital.data[i]['VRTOTALLIQUIDO'];
            dataHoraFechamento = respostaListaVendasDigital.data[i]['DTHORAFECHAMENTOFORMATADA'];

    		tableVendaDigitalPeriodosResumido.row.add([
                `<label style="color: blue; font-size: 11px;">` + dataHoraFechamento + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + nuCnpj + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + nomeFantasia + `</label>`,
                `<label style="color: blue;">` + quantidade + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(valorTotalLiquido).toFixed(2)) + `</label>`,
            ]).draw(false);
            
            totalQuantidade = parseFloat(totalQuantidade) + parseFloat(quantidade);
            totalVrliquido = parseFloat(totalVrliquido) + parseFloat(valorTotalLiquido);
            
    	}
        
        chamarProximaListaVendaDigitalResumido(numPageAtual + 1);
        
    }else{
        $('#totalResultadoVendaDigitalPeriodoResumido').html(
    		`<tr>
                <th colspan="3" style="text-align: center;">Total</th>
                <th>` + mascaraValor(totalQuantidade) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrliquido).toFixed(2)) + `</th>
            </tr>`
    	);
    }

}

function chamarProximaListaVendaDigitalResumido(numPage){
    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    ajaxGet('api/financeiro/venda-digital.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasDigitalResumido)
        	.catch(funcError);
}

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

            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas Digitais - <span class='fw-300'>Marca</span>`);
			
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
                    `<table id="dt-basic-vendaDigitalperiodomarca" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
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
	            
        var tableVendaDigitalPeriodosMarca = $('#dt-basic-vendaDigitalperiodomarca').DataTable({
            "columnDefs": [
              { className: "text-center", "targets": [1,1] },
              { className: "text-right", "targets": [2,2] }
            ]
        });
        
        tableVendaDigitalPeriodosMarca.rows().remove().draw();
        $('#totalResultadoVendaDigitalPeriodoMarca').html('');
        
    }

    if(respostaListaVendasDigitalMarca.data.length != 0){
    	for (var i = 0; i < respostaListaVendasDigitalMarca.data.length; i++) {
    	    

    	    nomeFantasia = respostaListaVendasDigitalMarca.data[i]['NOFANTASIA'];
            numEmpresa = respostaListaVendasDigitalMarca.data[i]['IDEMPRESA'];
            quantidade = respostaListaVendasDigitalMarca.data[i]['QTDTOTAL'];
            valorTotalLiquido = respostaListaVendasDigitalMarca.data[i]['VRTOTALVENDA'];

    		tableVendaDigitalPeriodosMarca.row.add([
                `<label style="color: blue; font-size: 11px;">` + nomeFantasia + `</label>`,
                `<label style="color: blue;">` + quantidade + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(valorTotalLiquido).toFixed(2)) + `</label>`,
            ]).draw(false);
            
            totalQuantidade = parseFloat(totalQuantidade) + parseFloat(quantidade);
            totalVrliquido = parseFloat(totalVrliquido) + parseFloat(valorTotalLiquido);
            
    	}
        
        chamarProximaListaVendaDigitalMarca(numPageAtual + 1);
        
    }else{
        $('#totalResultadoVendaDigitalPeriodoMarca').html(
    		`<tr>
                <th colspan="1" style="text-align: center;">Total</th>
                <th style="text-align: center;">` + mascaraValor(totalQuantidade) + `</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrliquido).toFixed(2)) + `</th>
            </tr>`
    	);
    }

}

function chamarProximaListaVendaDigitalMarca(numPage){

    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    ajaxGet('api/financeiro/venda-digital-marca.xsjs?pageSize=500&page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasDigitalResumidoMarca)
        	.catch(funcError);
}

//================ MENU DEPOSITOS ==============================================
function listaDepositosLoja() {

    if(IDPerfilLogin==1){
    
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
        			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas das Lojas - <span class='fw-300'></span>`);
        			
                	ajaxGet('api/informatica/empresa.xsjs')
                		.then(retornoListaEmpresasSelect)
                		.catch(funcError);
              }
            };
            xmlhttp.open("GET", "financeiro_action_listdepositosloja.html", true);
            xmlhttp.send();
        
    }else{
        alerta_menu_usuario();
    }
}

function alerta_menu_usuario() { 
Swal.fire(
  {
      type: "success",
      title: "Usuário sem perfil para acessar esse Menu.",
      showConfirmButton: false,
      timer: 2500
  });
}

function pesq_depositos_lojas() {

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
        newDataTable('pesqvendas');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/financeiro/deposito-loja.xsjs?idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaDepositosLoja)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "action_pesqdepositosloja.html", true);
    xmlhttp.send();
}

function retornoListaDepositosLoja(respostaListaDepositoAtivos) {

	var totalDeposito = 0;
	
	$('#resultado').html(
        `<table id="dt-basic-depositoloja" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th >Data Mov.</th>
                    <th >Data Dep.</th>
                    <th >Conta</th>
                    <th >Valor</th>
                    <th >Histórico</th>
                    <th >Doc Dep</th>
                    <th >Situação</th>
                </tr>
            </thead>
            <tbody id="resultadoDeposito">
            </tbody>
            <tfoot id="totalResultadoDeposito"class="thead-themed">
            </tfoot>
        </table>`
	);
	
	var tableDepositosLoja = $('#dt-basic-depositoloja').DataTable({
            deferRender:    true,
            ordering:  false,
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
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        }
                    ]
        });
    tableDepositosLoja.rows().remove().draw();
	for (var i = 0; i < respostaListaDepositoAtivos.data.length; i++) {

		 idDepositoLoja = respostaListaDepositoAtivos.data[i]['IDDEPOSITOLOJA'];
         dataMovimentoCaixa = respostaListaDepositoAtivos.data[i]['DTMOVIMENTOCAIXA'];
         dataDeposito = respostaListaDepositoAtivos.data[i]['DTDEPOSITO'];
         decricaoHistorico = respostaListaDepositoAtivos.data[i]['DSHISTORIO'];
         numeroDocumentoDeposito = respostaListaDepositoAtivos.data[i]['NUDOCDEPOSITO'];
         valorDeposito = respostaListaDepositoAtivos.data[i]['VRDEPOSITO'];
         status = respostaListaDepositoAtivos.data[i]['STCANCELADO'];
         descricaoContaBanco = respostaListaDepositoAtivos.data[i]['DSCONTABANCO'];
         nomeFuncionario = respostaListaDepositoAtivos.data[i]['NOFUNCIONARIO'];
         ConfDeposito = respostaListaDepositoAtivos.data[i]['STCONFERIDO'];

        if((ConfDeposito=='False' || ConfDeposito == null || ConfDeposito =='')){
            
    		if (status === 'False') {
    			htmlStatus = `<label style="color: blue; font-size: 11px;"><b>Ativo</b></label>`;
    			htmlOpcao =  `<div class="btn-group btn-group-xs">
                                    
                              </div>`;
    			htmlOpcao1 =   `<div class="btn-group btn-group-xs">
                                    <button type="button" class="btn btn-danger btn-xs" title="Cancelar Depósito" id="`+idDepositoLoja+`" onclick="modal_cancela_deposito_Loja(this.id);">
                                    Cancelar</button>
                              </div>`;
                totalDeposito = parseFloat(totalDeposito) + parseFloat(valorDeposito);
    		} else {
    			htmlStatus = `<label style="color: red; font-size: 11px;"><b>Cancelado</b></label>`;
    			htmlOpcao =  `<div class="btn-group btn-group-xs">
                                    
                              </div>`;
    			htmlOpcao1 =  `<div class="btn-group btn-group-xs">
                                    <button type="button" class="btn btn-success btn-xs" title="Ativar Depósito" id="`+idDepositoLoja+`" onclick="status_Deposito_Loja(this.id,\'False\');">
                                    Ativar</button>
                              </div>`;
    		}
            
        }else{
            if (status === 'False') {
                totalDeposito = parseFloat(totalDeposito) + parseFloat(valorDeposito);
            }
    			htmlStatus = `<label style="color: green; font-size: 11px;"><b>Conferido</b></label>`;
    			htmlOpcao =  `<div class="btn-group btn-group-xs">
                                    
                              </div>`;
        }

		tableDepositosLoja.row.add([
            `<label style="color: blue; font-size: 11px;">` + dataMovimentoCaixa + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + dataDeposito + ` </label>`,
            `<label style="color: blue; font-size: 11px;">` + descricaoContaBanco + `</label>`,
            `<label style="color: blue;">` + mascaraValor(parseFloat(valorDeposito).toFixed(2)) + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + decricaoHistorico + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + numeroDocumentoDeposito + `</label>`,
             htmlStatus
        ]).draw(false);
        
	}
	


	$('#totalResultadoDeposito').html(
		`<tr>
            <th colspan="3" style="text-align: center;">Total de Depósitos</th>
            <th>` + mascaraValor(parseFloat(totalDeposito).toFixed(2)) + `</th>
            <th colspan="4"></th>
        </tr>`
	);
}

function modal_cancela_deposito_Loja(id) {

    $.get('financeiro_action_canceldeposito_modal.html', function(res) {
      
       $("#cancelDepositoLoja").modal('show');
       $('#cancelDepositoLoja').on('shown.bs.modal', function () {});
       $('#resulModalCancelaDepositoLoja').html(res);
       $("#buttoncanceladepositoloja").attr("disabled", false);
   })
    
	    return	ajaxGet('api/financeiro/deposito-loja.xsjs?id=' + id)
			.then(retornoCancelaDepositoLoja)
			.catch(funcError);
  
}

function retornoCancelaDepositoLoja(retornoCancelaDepositoLoja) {

		idDepositoLoja = retornoCancelaDepositoLoja.data[0]['IDDEPOSITOLOJA'];
        dataMovimentoCaixa = retornoCancelaDepositoLoja.data[0]['DTMOVIMENTOCAIXA'];
        dataDeposito = retornoCancelaDepositoLoja.data[0]['DTDEPOSITO'];
        descHistorico = retornoCancelaDepositoLoja.data[0]['DSHISTORIO'];
        numeroDocumentoDeposito = retornoCancelaDepositoLoja.data[0]['NUDOCDEPOSITO'];
        valorDeposito = mascaraValor(parseFloat(retornoCancelaDepositoLoja.data[0]['VRDEPOSITO']).toFixed(2));
        status = retornoCancelaDepositoLoja.data[0]['STATIVO'];
        descContaBanco = retornoCancelaDepositoLoja.data[0]['DSCONTABANCO'];
        nomeFuncionario = retornoCancelaDepositoLoja.data[0]['NOFUNCIONARIO'];
        nomeFantasia = retornoCancelaDepositoLoja.data[0]['NOFANTASIA'];
	
	    $('#nomeEmpDepositoLoja').val(nomeFantasia);
		$('#IDDepositoLoja').val(idDepositoLoja);
		$('#nofuncionario').html(nomeFuncionario);
		$('#nomeDeposito').val(numeroDocumentoDeposito +' / '+ descHistorico);
		$('#valorDeposito').val(valorDeposito);
}

function cancela_deposito_loja(){
    
    var IDDepositoLoja = $("#IDDepositoLoja").val();
	var txtmotivocancela = $("#TxtHistoricoCancela").val();
	
    if ($("#TxtHistoricoCancela").val() === '') {
  
      $("#resultadocanceladepositoloja").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Motivo do Cancelamento.</div>"
      );
        $("#TxtHistoricoCancela").focus();
        return false;
    }
    
    var dados = [{
       "IDDEPOSITOLOJA": parseInt(IDDepositoLoja),
       "DSMOTIVOCANCELAMENTO":txtmotivocancela,
       "STCANCELADO":'True',
       "STATIVO":'False',
       "IDUSRCACELAMENTO": parseInt(IDFuncionarioLogin)
    }];

  	ajaxPut("api/financeiro/deposito-loja.xsjs", dados)
		.then(funcSucessCancelaDeposito)
		.catch(funcError);
		
	const textdados = JSON.stringify(dados);
		
    var dadosCancelaDep = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":"FINANCEIRO/CANCELAMENTO DE DEPOSITO",
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosCancelaDep)
		.then(funcSucessLog)
		.catch(funcError);
}

function funcSucessLog(resposta) { 


}

function funcSucessCancelaDeposito(resposta) {

	$("#buttoncanceladepositoloja").attr("disabled", true);
	alerta_cancel_Deposito();
	$("#cancelDepositoLoja").modal('hide');
	pesq_depositos_lojas();

}

function alerta_cancel_Deposito() {
Swal.fire(
  {
      type: "success",
      title: "Depósito Cancelado com Sucesso.",
      showConfirmButton: false,
      timer: 2500
  });
}

function funcSucessUpdateDeposito(resposta) {

	alerta_cancel_ativa_deposito();
	pesq_depositos_lojas();

}

function funcErrorUpdateDeposito(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateDeposito',
		showConfirmButton: false,
		timer: 15000
	});
}

function alerta_cancel_ativa_deposito() {
Swal.fire(
  {
      type: "success",
      title: "Depósito Atualizado com Sucesso.",
      showConfirmButton: false,
      timer: 2500
  });
}

function alerta_cancel_ativa_despesa() {
Swal.fire(
  {
      type: "success",
      title: "Despesa Atualizado com Sucesso.",
      showConfirmButton: false,
      timer: 2500
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
            valorTotalPosVenda = respostaListaRecebimentos.data[i]['VALORTOTALPOS'];
            valorTotalPos = respostaListaRecebimentos.data[i]['VRPOS'];
            valorTotalPIX = respostaListaRecebimentos.data[i]['VRPIX'];
            valorTotalMOOVPAY = respostaListaRecebimentos.data[i]['VRMOOVPAY'];
            valorTotalVoucher = respostaListaRecebimentos.data[i]['VALORTOTALVOUCHER'];
            valorTotalRecebido = parseFloat(valorTotalDinheiro) + parseFloat(valorTotalCartao) + parseFloat(valorTotalConvenio) + parseFloat(valorTotalPos) + parseFloat(valorTotalVoucher) + parseFloat(valorTotalPIX) + parseFloat(valorTotalMOOVPAY);
            
            PercDinheiro = ((valorTotalDinheiro * 100) / valorTotalRecebido);
            PercCartao = ((valorTotalCartao * 100) / valorTotalRecebido);
            PercConvenio = ((valorTotalConvenio * 100) / valorTotalRecebido);
            PercPOS = ((valorTotalPos * 100) / valorTotalRecebido);
            PercPIX = ((valorTotalPIX * 100) / valorTotalRecebido);
            PercMOOVPAY = ((valorTotalMOOVPAY * 100) / valorTotalRecebido);
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
            
            if(valorTotalPIX > 0){
                $("#resultadoRecebimento").append(
                    `<tr>
                        <td><b>PIX</b></td>
                        <td style="text-align:right; font-size: 12px;"><b>`+ mascaraValor(parseFloat(valorTotalPIX).toFixed(2))+`</b></td>
                        <td style="text-align:right; font-size: 12px;">`+ mascaraValor(parseFloat(PercPIX).toFixed(2))+`</td>
                    </tr>`
                );
            }
            
            if(valorTotalMOOVPAY > 0){
                $("#resultadoRecebimento").append(
                    `<tr>
                        <td><b>POS</b></td>
                        <td style="text-align:right; font-size: 12px;"><b>`+ mascaraValor(parseFloat(valorTotalMOOVPAY).toFixed(2))+`</b></td>
                        <td style="text-align:right; font-size: 12px;">`+ mascaraValor(parseFloat(PercMOOVPAY).toFixed(2))+`</td>
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

//================ MENU MAPA CAIXAS ==============================================

function ListaMovCaixa(tipo) {
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
        		.catch(funcError);
      }
    };
    xmlhttp.open("GET", "financeiro_action_listmapacaixa.html", true);
    xmlhttp.send();

}

function pesq_mapa_caixa(){
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
      
        ajaxGet('api/financeiro/despesa-loja.xsjs?pageSize=500&page=1&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaMapaCaixa)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqmapacaixas.html", true);
    xmlhttp.send();
}

function retornoListaMapaCaixa(respostaListaMapaCaixa){
    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    htmlRetornoDespesa = '';
    var totalDespesa = 0;
    $('#respostaListaDespesa').html(htmlRetornoDespesa);
    $('#repostotalDesp').html(`<tr>
            <th colspan="5" style="text-align: center;">Total Despesa</th>
            <th style="text-align: right;">0.00</th>
        </tr>`);
        
    for(var i=0 ; i< respostaListaMapaCaixa.data.length; i++){
        idEmpresa = respostaListaMapaCaixa.data[i]['IDEMPRESA'];
        idDespesaLoja = respostaListaMapaCaixa.data[i]['IDDESPESASLOJA'];
        dataDespesa = respostaListaMapaCaixa.data[i]['DTDESPESA'];
        idCategoriaReceitaDespesa = respostaListaMapaCaixa.data[i]['IDCATEGORIARECEITADESPESA'];
        dsCategoria = respostaListaMapaCaixa.data[i]['DSCATEGORIA'];
        valorDespesa = respostaListaMapaCaixa.data[i]['VRDESPESA'];
        dsHistorico = respostaListaMapaCaixa.data[i]['DSHISTORIO'];
        dsPagoA = respostaListaMapaCaixa.data[i]['DSPAGOA'];
        idFuncionario = respostaListaMapaCaixa.data[i]['IDFUNCIONARIO'];
        nomeFuncionario = respostaListaMapaCaixa.data[i]['NOFUNCIONARIO'];
        nomeLogin = respostaListaMapaCaixa.data[i]['NOLOGIN'];
        htmlRetornoDespesa = htmlRetornoDespesa + `<tr>
            <td style="font-size: 12px;">`+(i+1)+`</td>
            <td style="font-size: 12px;">`+idCategoriaReceitaDespesa+` - `+dsCategoria+`</td>
            <td style="font-size: 12px;">`+nomeFuncionario+`</td>
            <td style="font-size: 12px;">`+dsHistorico+`</td>
            <td style="font-size: 12px;">`+dsPagoA+`</td>
            <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                <b>`+ mascaraValor(parseFloat(valorDespesa).toFixed(2))+`</b></td>
        </tr>`;
        
        totalDespesa = parseFloat(totalDespesa)+parseFloat(valorDespesa);
    }
    
    $('#respostaListaDespesa').html(htmlRetornoDespesa);
    $('#repostotalDesp').html(`<tr>
            <th colspan="5" style="text-align: center;">Total Despesa</th>
            <th style="text-align: right;">`+ mascaraValor(parseFloat(totalDespesa).toFixed(2))+`</th>
        </tr>`);
    
     ajaxGet('api/financeiro/adiantamento-salarial.xsjs?pageSize=500&page=1&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaAdiantamentoSalarial)
        	.catch(funcError);
    
}

function retornoListaAdiantamentoSalarial(respostaListaAdiantamentoSalarial){
     var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    htmlRetornoAdiantamento = '';
    var totalAdiantamento = 0;
    $('#respostaListaAdiantamentoSalarial').html(htmlRetornoAdiantamento);
    $('#repostotalAdiantamento').html(`<tr>
                                    <th colspan="2" style="text-align: center;" width="60%">Total Despesa de Adiantamento</th>
                                    <th style="text-align: right;" width="40%">0.00</th>
                                </tr>`);
    
    for(var i=0 ; i< respostaListaAdiantamentoSalarial.data.length; i++){
        idAdiantamentoSalarial = respostaListaAdiantamentoSalarial.data[i]['IDADIANTAMENTOSALARIO'];
    	valorDesconto = respostaListaAdiantamentoSalarial.data[i]['VRVALORDESCONTO'];
    	txtMotivo = respostaListaAdiantamentoSalarial.data[i]['TXTMOTIVO'];
    	idFuncionario = respostaListaAdiantamentoSalarial.data[i]['IDFUNCIONARIO'];
    	nomeFuncionario = respostaListaAdiantamentoSalarial.data[i]['NOFUNCIONARIO'];
    	nomeLogin = respostaListaAdiantamentoSalarial.data[i]['NOLOGIN'];
       
        totalAdiantamento = parseFloat(totalAdiantamento)+parseFloat(valorDesconto);
    }
    
    $('#respostaListaAdiantamento').html(htmlRetornoAdiantamento);
    $('#repostotalAdiantamento').html(`<tr>
                                    <th colspan="2" style="text-align: center;" width="60%">Total Despesa de Adiantamento</th>
                                    <th style="text-align:right;" width="40%">`+ mascaraValor(parseFloat(totalAdiantamento).toFixed(2))+`</th>
                                </tr>`);
                                
    ajaxGet('api/financeiro/resumo-voucher.xsjs?pageSize=500&page=1&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaResumoVoucher)
        	.catch(funcError);
}

function retornoListaResumoVoucher(respostaListaResumoVoucher){
    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    htmlRetornoVoucher = '';
    var totalVoucher = 0; 

    $('#repostotalVoucher').html(htmlRetornoVoucher);
    $('#repostotalVoucher').html(`<tr>
                                    <th colspan="2" style="text-align: center;" width="60%">Total Voucher</th>
                                    <th style="text-align: right;" width="40%">0.00</th>
                                </tr>`);
                                
    for(var i=0 ; i< respostaListaResumoVoucher.data.length; i++){
        idVoucher = respostaListaResumoVoucher.data[i]['IDVOUCHER'];
        nuVoucher = respostaListaResumoVoucher.data[i]['NUVOUCHER'];
    	valorVoucher = respostaListaResumoVoucher.data[i]['VRVOUCHER'];
    	dataVoucher = respostaListaResumoVoucher.data[i]['DTINVOUCHER']; 
    	dsCaixa = respostaListaResumoVoucher.data[i]['DSCAIXA'];
    	nomeFuncionario = respostaListaResumoVoucher.data[i]['NOFUNCIONARIO'];
    	nomeLogin = respostaListaResumoVoucher.data[i]['NOLOGIN'];

        totalVoucher = parseFloat(totalVoucher)+parseFloat(valorVoucher);
    }
    
    $('#repostotalVoucher').html(htmlRetornoVoucher);
    $('#repostotalVoucher').html(`<tr>
                                    <th colspan="2" style="text-align: center;" width="60%">Total Voucher</th>
                                    <th style="text-align:right;" width="40%">`+ mascaraValor(parseFloat(totalVoucher).toFixed(2))+`</th>
                                </tr>`);
                                
    ajaxGet('api/financeiro/detalhe-fatura.xsjs?pageSize=500&page=1&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaDetalheFatura)
        	.catch(funcError);
}

function retornoListaDetalheFatura(respostaListaDetalheFatura){
    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
   
    var totalDetalheFatura = 0;

    for(var i=0 ; i< respostaListaDetalheFatura.data.length; i++){
        dsCaixa = respostaListaDetalheFatura.data[i]['DSCAIXA'];
    	nomeFuncionario = respostaListaDetalheFatura.data[i]['NOFUNCIONARIO'];
    	nomeLogin = respostaListaDetalheFatura.data[i]['NOLOGIN'];
    	
    	idCaixaWeb = respostaListaDetalheFatura.data[i]['IDCAIXAWEB'];
        nuCodAutorizacao = respostaListaDetalheFatura.data[i]['NUCODAUTORIZACAO'];
        dataProcessamento = respostaListaDetalheFatura.data[i]['DTPROCESSAMENTO'];
        valorRecebido = respostaListaDetalheFatura.data[i]['VRRECEBIDO'];

        totalDetalheFatura = parseFloat(totalDetalheFatura)+parseFloat(valorRecebido);
    }
    
    $('#repostotalDetalheFatura').html(`<tr>
                                    <th colspan="2" style="text-align: center;" width="60%">Total Faturas</th>
                                    <th style="text-align:right;" width="40%">`+ mascaraValor(parseFloat(totalDetalheFatura).toFixed(2))+`</th>
                                </tr>`);
    
    ajaxGet('api/financeiro/venda-total-recebido-periodo.xsjs?pageSize=500&page=1&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendaTotalRecebidoMapa)
        	.catch(funcError);
}

function retornoListaVendaTotalRecebidoMapa(respostaListaVendaTotalRecebidoMapa){
    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
    var valorTotalRecebido = 0;

    valorTotalRecebidoMapaVenda = 0;
    valorTotalRecebidoMapaCartoes = 0;
    valorTotalRecebidoMapaConvenio = 0;
    valorTotalRecebidoMapaDinheiro = 0;
    valorTotalPagamentoMapaDespesas = 0;
    valorTotalDisponivelMapaDinheiro = 0;
    valorTotalRecebidoMapaFaturas = 0;
    valorTotalDisponivelMapaDinheiroFatura = 0;

    for(var i=0; i< respostaListaVendaTotalRecebidoMapa.data.length; i++){
        valorTotalConvenio = respostaListaVendaTotalRecebidoMapa.data[i]['VALORTOTALCONVENIO'];  
        valorTotalDinheiro = respostaListaVendaTotalRecebidoMapa.data[i]['VALORTOTALDINHEIRO'];
        valorTotalFatura = respostaListaVendaTotalRecebidoMapa.data[i]['VALORTOTALFATURA'];
        valorTotalDespesa = respostaListaVendaTotalRecebidoMapa.data[i]['VALORTOTALDESPESA'];
        valorTotalAdiantamentoSalarial = respostaListaVendaTotalRecebidoMapa.data[i]['VALORTOTALADIANTAMENTOSALARIAL'];
        
        valorTotalRecebidoMapaVenda = parseFloat(valorTotalRecebidoMapaVenda) + parseFloat(valorTotalConvenio) + parseFloat(valorTotalDinheiro);
        valorTotalRecebidoMapaConvenio = parseFloat(valorTotalRecebidoMapaConvenio) + parseFloat(valorTotalConvenio);
        valorTotalRecebidoMapaDinheiro = parseFloat(valorTotalRecebidoMapaDinheiro) + parseFloat(valorTotalDinheiro);
        valorTotalPagamentoMapaDespesas = parseFloat(valorTotalPagamentoMapaDespesas) + parseFloat(valorTotalDespesa) + parseFloat(valorTotalAdiantamentoSalarial);
        valorTotalRecebidoMapaFaturas = parseFloat(valorTotalRecebidoMapaFaturas) + parseFloat(valorTotalFatura);
        
        $('#respostaListaTotalRecebidoMapa').html(`
                                            <tr>
                                                <td style="text-align:center; font-size: 12px;">CONVÊNIO</td>
                                                <td style="text-align:center; font-size: 12px;"></td>
                                                <td style="font-size: 12px;"></td>
                                                <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                                    <b>` + mascaraValor(parseFloat(valorTotalConvenio).toFixed(2)) + `</b></td>
                                            </tr>
                                            <tr>
                                                <td style="text-align:center; font-size: 12px;">DINHEIRO</td>
                                                <td style="text-align:center; font-size: 12px;"></td>
                                                <td style="font-size: 12px;"></td>
                                                <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                                    <b>` + mascaraValor(parseFloat(valorTotalDinheiro).toFixed(2)) + `</b></td>
                                            </tr>`);
        
    }
    
    ajaxGet('api/financeiro/venda-recebido-eletronico.xsjs?pageSize=500&page=1&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendaRecebidoEletronicoMapa)
        	.catch(funcError);
}

function retornoListaVendaRecebidoEletronicoMapa(respostaListaVendaRecebidoEletronicoMapa){
    for(var i=0; i< respostaListaVendaRecebidoEletronicoMapa.data.length; i++){
        
        nomeAutorizador = respostaListaVendaRecebidoEletronicoMapa.data[i]['NOAUTORIZADOR'];
        nomeTef = respostaListaVendaRecebidoEletronicoMapa.data[i]['NOTEF'];
        numeroParcelas = respostaListaVendaRecebidoEletronicoMapa.data[i]['NPARCELAS'];
        dsTipoPagamento = respostaListaVendaRecebidoEletronicoMapa.data[i]['DSTIPOPAGAMENTO'];
        quantidadeVenda = respostaListaVendaRecebidoEletronicoMapa.data[i]['QTDE'];
        valorRecebido = respostaListaVendaRecebidoEletronicoMapa.data[i]['VALORRECEBIDO'];
        quantidadePagamentos = respostaListaVendaRecebidoEletronicoMapa.data[i]['QTDPGTOS'];
        
        if(nomeTef == null){
            nomeTef = '';
        }else{
            nomeTef = nomeTef;
        }
        
        valorTotalRecebidoMapaVenda = parseFloat(valorTotalRecebidoMapaVenda) + parseFloat(valorRecebido);
        valorTotalRecebidoMapaCartoes = parseFloat(valorTotalRecebidoMapaCartoes) + parseFloat(valorRecebido);;
       
       if(dsTipoPagamento!='VALE FUNCIONÁRIO'){
        $('#respostaListaTotalRecebidoMapa').append(`
                                            <tr>
                                                <td style="text-align:center; font-size: 12px;">`+nomeTef+` - `+dsTipoPagamento+`</td>
                                                <td style="text-align:center; font-size: 12px;">`+numeroParcelas+` x</td>
                                                <td style="text-align:center; font-size: 12px;">`+quantidadePagamentos+`</td>
                                                <td style="text-align:right; font-size: 12px;" class="txt-color-blue"><b>` + mascaraValor(parseFloat(valorRecebido).toFixed(2)) + `</b></td>
                                                <td style="text-align: center;">
                                                    <div class="btn-group btn-group-xs">
                                                        <button type="button" class="btn btn-success btn-xs" title="Detalhar Vendas" id="`+nomeAutorizador+`-`+dsTipoPagamento+`-`+numeroParcelas+`" onclick="limpar_modal_recebimento();modal_venda_recebimento(this.id,'`+nomeAutorizador+`','`+numeroParcelas+`','`+nomeTef+`')" >Detalhar</button>
                                                        
                                                    </div>
                                                </td>
                                            </tr>`);
                                            
        
        valorTotalDisponivelMapaDinheiro = parseFloat(valorTotalRecebidoMapaDinheiro) - parseFloat(valorTotalPagamentoMapaDespesas);
        valorTotalDisponivelMapaDinheiroFatura = parseFloat(valorTotalDisponivelMapaDinheiro) + valorTotalRecebidoMapaFaturas;
       }

    }
     $('#respostaListaTotalRecebidoMapa').append(
                                            `<tr>
                                                <td colspan="4" style="text-align:right;"><b>Total das Vendas: </b></td>
                                                <td style="font-size: 14px;" style="text-align:right;"><b>` + mascaraValor(parseFloat(valorTotalRecebidoMapaVenda).toFixed(2)) + `</b></td>
                                            </tr>
                                            <tr>
                                                <td colspan="4"></td>
                                            </tr>
                                            <tr>
                                                <td colspan="4" style="text-align:right;"><b> Recebimento Cartões: </b></td>
                                                <td style="font-size: 14px;" style="text-align:right;"><b>` + mascaraValor(parseFloat(valorTotalRecebidoMapaCartoes).toFixed(2)) + `</b></td>
                                            </tr>                                                        
                                            <tr>
                                                <td colspan="4" style="text-align:right;"><b> Recebimento Convênio: </b></td>
                                                <td style="font-size: 14px;" style="text-align:right;"><b>` + mascaraValor(parseFloat(valorTotalRecebidoMapaConvenio).toFixed(2)) + `</b></td>
                                            </tr>
                                            <tr>
                                                <td colspan="4"></td>
                                            </tr>
                                            <tr> 
                                                <td colspan="4" style="text-align:right;"><b> Recebimento Dinheiro: </b></td>
                                                <td style="font-size: 14px;" style="text-align:right;"><b>` + mascaraValor(parseFloat(valorTotalRecebidoMapaDinheiro).toFixed(2)) + `</b></td>
                                            </tr>                                                       
                                            <tr>
                                                <td colspan="4" style="text-align:right;"><b> - Pagamento das Despesas: </b></td>
                                                <td style="font-size: 14px;" style="text-align:right;"><b>` + mascaraValor(parseFloat(valorTotalPagamentoMapaDespesas).toFixed(2)) + `</b></td>
                                            </tr>                                                       
                                            <tr>
                                                <td colspan="4" style="text-align:right;"><b> = Total Dispónivel em Dinheiro: </b></td>
                                                <td style="font-size: 14px;" style="text-align:right;"><b>` + mascaraValor(parseFloat(valorTotalDisponivelMapaDinheiro).toFixed(2)) + `</b></td>
                                            </tr>
                                            <tr>
                                                <td colspan="4"></td>
                                            </tr>  
                                            <tr>
                                                <td colspan="4" style="text-align:right;"><b> + Recebimento Faturas: </b></td>
                                                <td style="font-size: 14px;" style="text-align:right;"><b>` + mascaraValor(parseFloat(valorTotalRecebidoMapaFaturas).toFixed(2)) + `</b></td>
                                            </tr>
                                            <tr>
                                                <td colspan="4"></td>
                                            </tr>                                                      
                                            <tr>
                                                <td colspan="4" style="text-align:right;"><b> = Total Dispónivel (Dinheiro + Fatura): </b></td>
                                                <td style="font-size: 14px;" style="text-align:right;"><b>` + mascaraValor(parseFloat(valorTotalDisponivelMapaDinheiroFatura).toFixed(2)) + `</b></td>
                                            </tr>`);
}

function funcError(data) {
	Swal.fire({
		type: "error",
		title: "Erro ao carregar os dados da página",
		showConfirmButton: false,
		timer: 15000
	});
}

//================ MENU DESPESAS ==============================================
function listaDespesaLoja() {

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
			$("#idCategoria").select2();
			
        	ajaxGet('api/informatica/empresa.xsjs')
        		.then(retornoListaEmpresasSelect)
        		.catch(funcError);
        		
    		ajaxGet('api/categoria-receita-despesa.xsjs?tipo=D')
        		.then(retornoListaCategoriaReceitaDespesaSelect)
        		.catch(funcError);
      }
    };
    xmlhttp.open("GET", "financeiro_action_listdespesaloja.html", true);
    xmlhttp.send();
}

function pesq_despesas_lojas(numPage) {

    var IDEmpresaPesqVenda = $("#idloja").val();
    var idCategoria = $("#idCategoria").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    TotalDespesaLoja = 0;
    contador = 0;
    dataRetorno=[];
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
        newDataTable('pesqdespesas');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/financeiro/despesa-loja.xsjs?page='+numPage+'&idCategoria='+idCategoria+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaDespesasLoja)
        	.catch(funcErrorListaDespesasLoja);
      }
    };
    
    xmlhttp.open("GET", "action_pesqdespesasloja.html", true);
    xmlhttp.send();
}

function funcErrorListaDespesasLoja() {
	Swal.fire({
		type: "error",
		title: "Erro ao carregar os dados da retornoListaDespesasLoja",
		showConfirmButton: false,
		timer: 15000
	});
}

function retornoListaDespesasLoja(respostaListaDespesas) {

    var contadorDespesaLoja = 0;
    var numPageAtual = parseInt(respostaListaDespesas.page);
	
	if(respostaListaDespesas.data.length != 0){
        for (var i=0; i < respostaListaDespesas.data.length; i++) { 
            contador ++;
            var registro = respostaListaDespesas.data[i];
            
            IDDespesaLoja = registro['IDDESPESASLOJA'];
            IDCategDespesaLoja = registro['IDCATEGORIARECEITADESPESA'];
            DTMovDespesaLoja = registro['DTDESPESA'];
            DescDespesaLoja = registro['DSCATEGORIA'];
            VrDespesaLoja = registro['VRDESPESA'];
            PagoADespesaLoja = registro['DSPAGOA'];
            FuncVale = registro['NOFUNCVALE'];
            TxtHistoricoDespesaLoja = registro['DSHISTORIO'];
            NuNotaDespesaLoja = registro['NUNOTAFISCAL'];
            SituacaoDespesaAtivoLoja = registro['STATIVO'];
            SituacaoDespesaLoja = registro['STCANCELADO'];
            empresa = registro['NOFANTASIA'];    
            TotalDespesaLoja = TotalDespesaLoja + VrDespesaLoja;
    
            if(IDCategDespesaLoja == 248){
                PagoADespesaLoja = FuncVale;
            }
            
            if (SituacaoDespesaLoja == 'False') {
                tagDespesaAtivo = '<label style="color: blue;">Ativo</label>';
                tagDespesaAtivoBotao = '<div class="btn-group btn-group-xs"><button type="button" class="btn btn-danger btn-xs" title="Cancelar Despesa" id="' + IDDespesaLoja + '" onclick="status_Despesa_Loja(this.id,\'True\')" >Cancelar</button><button type="button" class="btn btn-warning btn-xs" title="Editar Despesa" id="'+IDDespesaLoja+'" onclick="modal_ajustar_despesa(this.id)" >Editar</button></div></div>';
            } else {
                tagDespesaAtivo = '<label style="color: red;">Cancelado</label>';
                tagDespesaAtivoBotao = '<div class="btn-group btn-group-xs"><button type="button" class="btn btn-info btn-xs" title="Ativar Despesa" id="' + IDDespesaLoja + '" onclick="status_Despesa_Loja(this.id,\'False\')" >Ativar</button></div>';
            }
            
            dataRetorno.push( [contador,
                                empresa,
                                DTMovDespesaLoja,
                                DescDespesaLoja,
                                VrDespesaLoja,
                                PagoADespesaLoja,
                                TxtHistoricoDespesaLoja,
                                NuNotaDespesaLoja,
                                tagDespesaAtivo,
                                tagDespesaAtivoBotao
                                ]);
        }
        
        chamarProximaListaDespesaLoja(numPageAtual + 1); 
    }else{
        
        $('#resultado').html(
            `<table id="dt-basic-pesqdespesas" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th ></th>
                        <th>Empresa</th>
                        <th >Data Mov.</th>
                        <th >Descrição</th>
                        <th >Valor</th>
                        <th >Pago a</th>
                        <th >Histórico</th>
                        <th >Nota Fiscal</th>
                        <th >Situação</th>
                        <th >Opção</th>
                    </tr>
                </thead>
                <tbody id="resultadoDespesa">
                </tbody>
                </table>`  
	    );
        
       $('#dt-basic-pesqdespesas').DataTable( {
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
        /*$('#totalResultadoDespesa').html(
            `<tr>
                <th colspan="3" style="text-align: center;">Total Lançamentos</th>
                <th style="text-align: right;">${mascaraValor(TotalDespesaLoja.toFixed(2))}</th>
                <th colspan="5"></th>
            </tr>`
        );*/
    }

}

function chamarProximaListaDespesaLoja(numPage){
    
    var IDEmpresaPesqVenda = $("#idloja").val();
    var idCategoria = $("#idCategoria").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

    ajaxGet('api/financeiro/despesa-loja.xsjs?page='+numPage+'&idCategoria='+idCategoria+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaDespesasLoja)
        	.catch(funcErrorListaDespesasLoja);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function modal_cancela_despsa_Loja(id) {

    $.get('financeiro_action_canceldespesa_modal.html', function(res) {
      
       $("#cancelDespesaLoja").modal('show');
       $('#cancelDespesaLoja').on('shown.bs.modal', function () {});
       $('#resulModalCancelaDespesaLoja').html(res);
   })
    
	    return	ajaxGet('api/financeiro/deposito-loja.xsjs?id=' + id)
			.then(retornoCancelaDespesaLoja)
			.catch(funcError);
  
}

function retornoCancelaDespesaLoja(retornoCancelaDespesaLoja) {

		idDepositoLoja = retornoCancelaDespesaLoja.data[0]['IDDEPOSITOLOJA'];
        dataMovimentoCaixa = retornoCancelaDespesaLoja.data[0]['DTMOVIMENTOCAIXA'];
        dataDeposito = retornoCancelaDespesaLoja.data[0]['DTDEPOSITO'];
        descHistorico = retornoCancelaDespesaLoja.data[0]['DSHISTORIO'];
        numeroDocumentoDeposito = retornoCancelaDespesaLoja.data[0]['NUDOCDEPOSITO'];
        valorDeposito = mascaraValor(parseFloat(retornoCancelaDespesaLoja.data[0]['VRDEPOSITO']).toFixed(2));
        status = retornoCancelaDespesaLoja.data[0]['STATIVO'];
        descContaBanco = retornoCancelaDespesaLoja.data[0]['DSCONTABANCO'];
        nomeFuncionario = retornoCancelaDespesaLoja.data[0]['NOFUNCIONARIO'];
        nomeFantasia = retornoCancelaDespesaLoja.data[0]['NOFANTASIA'];
	
	    $('#nomeEmpDepositoLoja').val(nomeFantasia);
		$('#IDDepositoLoja').val(idDepositoLoja);
		$('#nofuncionario').html(nomeFuncionario);
		$('#nomeDeposito').val(numeroDocumentoDeposito +' / '+ descHistorico);
		$('#valorDeposito').val(valorDeposito);
}

function cancela_despesa_loja(){
    
    var IDDepositoLoja = $("#IDDespesaLoja").val();
	var txtmotivocancela = $("#TxtHistoricoCancela").val();
	
    if ($("#TxtHistoricoCancela").val() === '') {
  
      $("#resultadocanceladepositoloja").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Motivo do Cancelamento.</div>"
      );
        $("#TxtHistoricoCancela").focus();
        return false;
    }
    
    var dados = [{
       "IDDEPOSITOLOJA": parseInt(IDDepositoLoja),
       "DSMOTIVOCANCELAMENTO":txtmotivocancela,
       "STCANCELADO":'True',
       "STATIVO":'False',
       "IDUSRCACELAMENTO": parseInt(IDFuncionarioLogin)
    }];


  	ajaxPut("api/financeiro/despesa-loja.xsjs", dados)
		.then(funcSucessCancelaDespesa)
		.catch(funcError);
}

function funcSucessCancelaDespesa(resposta) {

	$("#buttoncanceladespesaloja").attr("disabled", true);
	alerta_cancel_Despesa();
	$("#cancelDespesaLoja").modal('hide');
	pesq_despesas_lojas();

}

function alerta_cancel_Despesa() {
Swal.fire(
  {
      type: "success",
      title: "Despesa Cancelada com Sucesso.",
      showConfirmButton: false,
      timer: 2500
  });
}

function retornoListaCategoriaDespesa(respostaListaCategoriaDespesa) {

	for (var i = 0; i < respostaListaCategoriaDespesa.data.length; i++) {

		IDCategDespesa = respostaListaCategoriaDespesa.data[i]['IDCATEGORIARECDESP'];
		DSCategDespesa = respostaListaCategoriaDespesa.data[i]['DSCATEGORIA'];

		if (IDCategDespesa != '248' && IDCategDespesa != '259' && IDCategDespesa != '258') {
			$('#IDCategoriaReceitaDespesa').append(
				`<option value="` + IDCategDespesa + `"> ` + IDCategDespesa + ` - ` + DSCategDespesa + `</option>`
			);
		}

	}
}

function modal_ajustar_despesa(id) {

	$.get('action_ajustedespesapmodal.html', function(res) {

		$('#resulmodaleditdespesa').html(res);
		$("#editDespesa").modal('show');
		$('#editDespesa').on('shown.bs.modal', function() {});

		$('#IDEmpresaDespesa').val(IDEmpresaLogin);
		$('#nomeempDespesa').val(NOEmpresaLogin);
		$('#IDFuncDespesa').val(IDFuncionarioLogin);
        
		$("#IDCategoriaReceitaDespesa").focus();
		$("#IDCategoriaReceitaDespesa").select2({
			dropdownParent: $("#editDespesa")
		});

		return ajaxGet('api/categoria-receita-despesa.xsjs')
			.then(retornoListaCategoriaDespesa)
			.catch(funcError);
	})
  
  	return ajaxGet('api/despesa-loja/todos.xsjs?id=' + id)
	.then(retornoUpdateDespesa)
	.catch(funcErrorUpdateDespesa);
	
}

function retornoUpdateDespesa(updateDespesa) {

	for (var i = 0; i < updateDespesa.data.length; i++) {
	    
		IDDespesaLoja = updateDespesa.data[i]['IDDESPESASLOJA'];
		IDCategDespesaLoja = updateDespesa.data[i]['IDCATEGORIARECEITADESPESA'];
		DSCategDespesaLoja = updateDespesa.data[i]['DSCATEGORIARECDESP'];
		DTDespesaLojaUP = updateDespesa.data[i]['DTDESPESAUPDATE'];
		HRDespesaLojaUP = updateDespesa.data[i]['HRDESPESAUPDATE'];
		VrDespesaLoja = mascaraValor(parseFloat(updateDespesa.data[i]['VRDESPESA']).toFixed(2));
		PagoADespesaLoja = updateDespesa.data[i]['DSPAGOA'];
		TxtHistoricoDespesaLoja = updateDespesa.data[i]['DSHISTORICO'];
		NuNotaDespesaLoja = updateDespesa.data[i]['NUNOTAFISCAL'];
		tpNota = updateDespesa.data[i]['TPNOTA'];
		SituacaoDespesaAtivoLoja = updateDespesa.data[i]['STATIVO'];
		SituacaoDespesaLoja = updateDespesa.data[i]['STCANCELADO'];

		$('#idDespesaLoja').val(IDDespesaLoja);
		$('#DTDespesa').val(DTDespesaLojaUP);
		$('#HRDespesa').val(HRDespesaLojaUP);
		$('#IDCategoriaReceitaDespesa').append(
				`<option value="` + IDCategDespesaLoja + `" selected> ` + IDCategDespesaLoja + ` - ` + DSCategDespesaLoja + `</option>`
		);
			
		$('#DsHistorioDespesa').val(TxtHistoricoDespesaLoja);
		$('#DsPagoA').val(PagoADespesaLoja);
		$('#TPNota').val(tpNota);
		$('#NuNotaFiscal').val(NuNotaDespesaLoja);
		$('#VrDespesaDespesa').val(VrDespesaLoja); 
	}
}

function funcErrorUpdateDespesa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoUpdateDespesa',
		showConfirmButton: false,
		timer: 15000
	});
}

function ajustar_despesa() {

	var iddesp = $("#idDespesaLoja").val();
	var idfuncionarioajuste = $("#IDFuncDespesa").val();
	var idcategoria = $('#IDCategoriaReceitaDespesa').val();
	var dshistorico = $("#DsHistorioDespesa").val();
	var dspagoa = $("#DsPagoA").val();
	var tpnota = $("#TPNota").val();
	var nunota = $("#NuNotaFiscal").val();
	var vrdespesa = $('#VrDespesaDespesa').val().replace(".", "").replace(",", ".");

    if ($("#DsHistorioDespesa").val() === '') {
  
      $("#resultadoajustemovcaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Motivo para o Ajuste da Despesa.</div>"
      );
        $("#DsHistorioDespesa").focus();
        return false;
    }

    if ($("#DsPagoA").val() === '') {
  
      $("#resultadoajustemovcaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe Para quem foi pago a Despesa.</div>"
      );
        $("#DsPagoA").focus();
        return false;
    }
    
    TxtObservacaoAjuste = 'Despesa Editada';
    
	var dados = [{

		"IDDESPESASLOJA": parseInt(iddesp),
		"IDCATEGORIARECEITADESPESA": parseInt(idcategoria),
		"VRDESPESA": parseFloat(vrdespesa),
		"DSPAGOA": dspagoa,
		"DSHISTORIO": dshistorico,
		"TPNOTA": tpnota,
		"NUNOTAFISCAL": nunota,
		"IDUSRCACELAMENTO": parseInt(idfuncionarioajuste),
		"DSMOTIVOCANCELAMENTO": TxtObservacaoAjuste,
	}];

	ajaxPut("api/despesa-loja/editar-despesa.xsjs", dados)
		.then(funcSucessUpdateDespesa)
		.catch(funcError);

}

function funcSucessUpdateDespesa(resposta) {

	//$("#buttoneditdespesa").attr("disabled", true);
	alerta_atualizado_sucesso();
	$("#editDespesa").modal('hide');
	pesq_despesas_lojas(1);
}

function status_Despesa_Loja(id,status) {

    var dados = {
      "IDDESPESASLOJA": parseInt(id),
      "STCANCELADO":status
    };

  	ajaxPut("api/despesa-loja/atualizacao-status.xsjs", dados)
		.then(funcSucessUpdateDespesa)
		.catch(funcErrorUpdateDespesa);

}

function funcSucessUpdateDespesa(resposta) {

	alerta_cancel_ativa_despesa();
	pesq_despesas_lojas(1);

}

function funcErrorUpdateDespesa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateDespesa',
		showConfirmButton: false,
		timer: 15000
	});
}


// ========================= INICIO EXTRATO CONTA LOJA ===
function ListaExtrato() {
    
    if(IDPerfilLogin==1){
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
                    .catch(funcError);
            }
        };
        xmlhttp.open("GET", "financeiro_action_listextratoloja.html", true);
        xmlhttp.send();
    }else{
        alerta_menu_usuario(); 
    }
}

function ReltorioSaldoExtrato() {
    
    if(IDPerfilLogin==1){
        
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
    
                $("#idgrupo").select2();
    
                $('.DescTituloListaVendas').html(
                    `<i class='subheader-icon fal fa-chart-area'></i> Saldo das Contas Correntes das Lojas - <span class='fw-300'></span>`);
    
                ajaxGet('api/informatica/grupoempresas.xsjs')
                    .then(retornoListaGrupoEmpresasSelect)
                    .catch(funcError);
            }
        };
        xmlhttp.open("GET", "financeiro_action_listsaldoloja.html", true);
        xmlhttp.send();
    }else{
        alerta_menu_usuario(); 
    }
} 
 
function retornoListaGrupoEmpresasSelect(respostaGrupoEmpresas) {

        $("#idgrupo").empty();
        $('#idgrupo').append(
	        `<option value="0">Todas as Marcas</option>`
	    );

        $("#idmarca").empty();
        $('#idmarca').append(
	        `<option value="0">Selecione...</option>`
	    );
	    
	for (var i = 0; i < respostaGrupoEmpresas.data.length; i++) {

		IDGrupo = respostaGrupoEmpresas.data[i]['IDGRUPOEMPRESARIAL'];
		DSGrupo = respostaGrupoEmpresas.data[i]['GRUPOEMPRESARIAL'];

			$('#idgrupo').append(
				`<option value="` + IDGrupo + `"> ` + DSGrupo + `</option>`
			);
			$('#idmarca').append(
				`<option value="` + IDGrupo + `"> ` + DSGrupo + `</option>`
			);
	}
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
                .catch(funcError);
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
                            <th>Informativo</th>
                            <th colspan="3">
                                <button type="button" class="btn btn-success" onclick="modal_Cad_Deposito()">
                                    <span class="fal fa-plus mr-1"></span>
                                    Cadastrar Depósitos
                                </button>
                                <button type="button" class="btn btn-danger" onclick="modal_Cad_Ajuste_Extrato()">
                                    <span class="fal fa-edit mr-1"></span>
                                    Ajustar Extrato
                                </button>
                            </th>
                            <th id="idbutaobloqueardata" colspan="5">
                                    <button type="button" class="btn btn-warning" onclick="bloquear_data_deposito()">
                                        <span class="fal fa-lock-open-alt mr-1"></span>
                                        Bloquear Data Depósito
                                    </button>
                            </th>
                        </tr>                                      
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
                            tagDepositoAtivoBotao='<td><button type="button" class="btn btn-success btn-sm btn-icon" title="Confirmar Conferência" id="' + idDeposito + '" onclick="status_confirmar_Deposito_Loja(this.id,\'True\')" ><i class="fal fa-check"></i></button>'+
                            '<button type="button" class="btn btn-danger btn-sm btn-icon" title="Cancelar Depósito" id="' + idDeposito + '" onclick="status_Deposito_Loja(this.id,\'True\')" ><i class="fal fa-times"></i></button>'+
                            '<button type="button" class="btn btn-warning btn-sm btn-icon" title="Editar Depósito" id="' + idDeposito + '" onclick="modal_Edit_Deposito_Loja(this.id)" ><i class="fal fa-pencil"></i></button></td>';
                        
                            
                        }else if(SituacaoDepositoLoja=='False' && (ConferenciaDepositoLoja=='True' && (ConferenciaDepositoLoja != null || ConferenciaDepositoLoja ==''))){
                            saldoAnterior = parseFloat(saldoAnterior) - parseFloat(valorDeposito);
                            tagDepositoAtivoBotao='<td></td>';
                        
                            
                        }else if(SituacaoDepositoLoja=='True' && (ConferenciaDepositoLoja=='False' || ConferenciaDepositoLoja == null || ConferenciaDepositoLoja =='')){
                            tagDepositoAtivoBotao='<td><button type="button" class="btn btn-success btn-sm btn-icon" title="Confirmar Conferência" id="' + idDeposito + '" onclick="status_confirmar_Deposito_Loja(this.id,\'True\')" ><i class="fal fa-check"></i></button>'+
                            '</td>';
                        
                            
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
                            
                            tagAjusteAtivoBotao='<td style="text-align:center; font-size: 12px;"><div class="btn-group btn-group-xs"><button type="button" class="btn btn-danger btn-xs" title="Cancelar Ajuste" id="' +idAjuste+ '" onclick="status_Ajuste_Extrato_Loja(this.id,\'True\')" >Cancelar</button></div></td>';
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

function pesq_saldo_extrato_lojas() {
    var IDGrupoPesq = $("#idgrupo").val();
    var datapesqinicio = $("#dtconsultainicio").val().split('-');
    
    pesqdaysaldo = datapesqinicio[2]; // 30
    pesqmonthsaldo = datapesqinicio[1]; // 03
    pesqyearsaldo = datapesqinicio[0]; // 2019

    pesq_inicial = new Date(pesqyearsaldo, (pesqmonthsaldo-1), pesqdaysaldo);
    pesqmilissegundos_por_dia = 1000 * 60 * 60 * 24;
    pesq_data_final_saldo = new Date(pesq_inicial.getTime() - 1 * pesqmilissegundos_por_dia);

    var pesq_diasaldo = pesq_data_final_saldo.getDate(); // 1-31
    var pesq_messaldo = pesq_data_final_saldo.getMonth(); // 0-11 (zero=janeiro)
    var pesq_ano4saldo = pesq_data_final_saldo.getFullYear(); // 4 dígitos 

    pesq_messaldo1 = pesq_messaldo+1;
    
    pesq_diaFormatadoSaldo = String(pesq_diasaldo);
    pesq_mesFormatadoSaldo = String(pesq_messaldo1);

    diachek = String(pesq_diasaldo);
    
    if(pesq_messaldo1 == 4 || pesq_messaldo1 == 6 || pesq_messaldo1 == 9 || pesq_messaldo1 == 11){
        if(pesq_diasaldo == 31){
            var diachek = String(pesq_diasaldo - 1);
        }
    }else if(pesq_messaldo1 == 2){
        if(pesq_diasaldo == 30){
            var diachek = String(pesq_diasaldo - 2);
        }else if (pesq_diasaldo == 31){
            var diachek = String(pesq_diasaldo - 3);
        }
    }
    
    var pesqdataumdiamenos = pesq_ano4saldo + '-' + (pesq_mesFormatadoSaldo.padStart(2, '0')) + '-' + diachek.padStart(2, '0');

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
            newDataTable('saldoconta');

            $('.dataAtual').text(dataAtual);

            ajaxGet('api/financeiro/saldo-loja-por-grupo.xsjs?idGrupoEmpresarial=' + IDGrupoPesq + '&dataPesquisa=' + pesqdataumdiamenos)
                .then(retornoListaSaldoExtratoLoja)
                .catch(funcError);
        }
    };

    xmlhttp.open("GET", "financeiro_action_pesqsaldoextratoloja.html", true);
    xmlhttp.send();
}
 
function retornoListaSaldoExtratoLoja(respostaListaSaldoExtratoLojas) {

    var saldoTotal = 0;
    var saldoTotalAtual = 0;
    var TotalAjuste = 0;
    var datapesqinicio = $("#dtconsultainicio").val().split('-');
    
    daysaldo = datapesqinicio[2]; // 30
    monthsaldo = datapesqinicio[1]; // 03
    yearsaldo = datapesqinicio[0]; // 2019

    inicial = new Date(yearsaldo, (monthsaldo-1), daysaldo);
    milissegundos_por_dia = 1000 * 60 * 60 * 24;
    data_final_saldo = new Date(inicial.getTime() - 1 * milissegundos_por_dia);

    var diasaldo = data_final_saldo.getDate(); // 1-31
    var messaldo = data_final_saldo.getMonth(); // 0-11 (zero=janeiro)
    var ano4saldo = data_final_saldo.getFullYear(); // 4 dígitos 
    
    messaldo1 = messaldo+1;
        
    diaFormatadoSaldo = String(diasaldo);
    mesFormatadoSaldo = String(messaldo1);
    
    diacheksaldo = String(diasaldo);
    
    if(messaldo1 == 4 || messaldo1 == 6 || messaldo1 == 9 || messaldo1 == 11){
        if(diasaldo == 31){
            var diacheksaldo = String(diasaldo - 1);
        }
    }else if(messaldo1 == 2){
        if(diasaldo == 30){
            var diacheksaldo = String(diasaldo - 2);
        }else if (diasaldo == 31){
            var diacheksaldo = String(diasaldo - 3);
        }
    }
    
    var datasaldoumdiamenos = diacheksaldo.padStart(2, '0') + '/' + (mesFormatadoSaldo.padStart(2, '0')) + '/' + ano4saldo;
    
        $('#resultado').html(
            `<table id="dt-buttons-saldoconta" class="table table-bordered table-hover table-responsive-lg table-striped w-100" width="100%">
            <thead>
                <tr>
                    <th>Informativo</th>
                </tr>                                      
                <tr>
                    <td colspan="5"><b>Saldos a partir do dia 11 de dezembro de 2020<b></td>
                </tr>
            </thead>
            <tbody >
                <tr class="table-primary">
                    <td colspan="4" style="text-align:right; font-size: 12px;"><b>Saldo Dia</b></td>                                                  
                    <td style="text-align:right; font-size: 12px;"><b>` +datasaldoumdiamenos+ `</b></td>
                </tr>
                <tr>
                    <td colspan="5"></td>
                </tr>
                <tr>
                    <td colspan="5"></td>
                
            </tbody>
            <tbody id="resultadoSaldoExtratoLoja">
                <tr>
                    <th class="bg-primary-700" style="font-size: 12px;">Nº</th>
                    <th class="bg-primary-700" style="font-size: 12px;">CNPJ</th>
                    <th class="bg-primary-700" style="font-size: 12px;">Empresa</th>
                    <th class="bg-primary-700" style="font-size: 12px;">Conta Banco</th>
                    <th class="bg-primary-700" style="font-size: 12px;">Saldo</th>
                </tr>
            </tbody>
            </table>`);

        for (let i = 0; i < respostaListaSaldoExtratoLojas.data.length; i++) {
            let IDEmpresaSaldo = respostaListaSaldoExtratoLojas.data[i]['IDEMPRESA'];
            let CNPJEmpresaSaldo = respostaListaSaldoExtratoLojas.data[i]['NUCNPJ'];
            let NOEmpresaSaldo = respostaListaSaldoExtratoLojas.data[i]['NOFANTASIA']; 
            let VrDinheiroSaldo = respostaListaSaldoExtratoLojas.data[i]['VALORTOTALDINHEIRO']; 
            let VrFaturaSaldo = respostaListaSaldoExtratoLojas.data[i]['VALORTOTALFATURA']; 
            let VrDepositoSaldo = respostaListaSaldoExtratoLojas.data[i]['VALORTOTALDEPOSITO']; 
            let VrDespesaSaldo = respostaListaSaldoExtratoLojas.data[i]['VALORTOTALDESPESA'];
            let VrAdinatamentoSaldo = respostaListaSaldoExtratoLojas.data[i]['VALORTOTALADINAT'];
            let VrDebitoSaldo = respostaListaSaldoExtratoLojas.data[i]['VALORTOTALDEBITO'];
            let VrCreditoSaldo = respostaListaSaldoExtratoLojas.data[i]['VALORTOTALCREDITO'];
            let VrQuebraSaldo = respostaListaSaldoExtratoLojas.data[i]['TOTALQUEBRA'];
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //TotalAjuste = parseFloat(VrDebitoSaldo) - parseFloat(VrCreditoSaldo);

           // saldoTotal = (parseFloat(VrDinheiroSaldo) + parseFloat(VrFaturaSaldo)) - (parseFloat(VrDepositoSaldo) + parseFloat(VrDespesaSaldo) + parseFloat(VrAdinatamentoSaldo));
           // saldoTotalAtual = parseFloat(saldoTotal) + parseFloat(TotalAjuste);
            
            var saldoPositivo = parseFloat(VrDinheiroSaldo) + parseFloat(VrFaturaSaldo);
        	var saldoNegativo = parseFloat(VrDespesaSaldo) + parseFloat(VrDepositoSaldo) + parseFloat(VrAdinatamentoSaldo);
        	
            var ajuste = parseFloat(VrDebitoSaldo) - parseFloat(VrCreditoSaldo); 

        	    var saldoAtualizadoAtual = parseFloat(saldoPositivo) - parseFloat(saldoNegativo) + parseFloat(ajuste) - parseFloat(VrQuebraSaldo);
            
	
            $('#resultadoSaldoExtratoLoja').append(
                `</tr> 
                        <tr class="table-success">
                        <td style="font-size: 12px;">` + IDEmpresaSaldo + `</td>
                        <td style="font-size: 12px;">` + CNPJEmpresaSaldo + `</td>
                        <td style="font-size: 12px;">` + NOEmpresaSaldo + `</td>
                        <td style="font-size: 12px;"></td>
                        <td style="text-align:right; font-size: 12px;"><b>` + saldoAtualizadoAtual.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                    </tr>`);
        }
}

function bloquear_data_deposito() {

    $('#idbutaobloqueardata').html(`

        <button id="idbuttonbloquear2" type="button" class="btn btn-info" onclick="ativar_data_deposito()">
            <span class="fal fa-lock-alt mr-1"></span>
            Ativar Data Depósito
        </button>
    `);
    
  //document.getElementById("idbuttonbloquear").style.display = 'none';
  //document.getElementById("idbuttonbloquear2").style.display = 'block';
  
  $("#DTDeposito").attr("readonly","readonly");
  $("#HRDeposito").attr("readonly","readonly");

}

function ativar_data_deposito() {

    $('#idbutaobloqueardata').html(`

        <button id="idbuttonbloquear" type="button" class="btn btn-warning" onclick="bloquear_data_deposito()">
            <span class="fal fa-lock-open-alt mr-1"></span>
            Bloquear Data Depósito
        </button>
    `);
    
  //document.getElementById("idbuttonbloquear").style.display = 'block';
  //document.getElementById("idbuttonbloquear2").style.display = 'none';
  
}

function funcErrorContaBanco(data) {
	Swal.fire({
		type: "error",
		title: data.msg,
		showConfirmButton: false,
		timer: 15000
	});
}

function retornoListaContaBanco(respostaListaContaBanco) {

	for (var i = 0; i < respostaListaContaBanco.data.length; i++) {

		IDContaBanco = respostaListaContaBanco.data[i]['IDCONTABANCO'];
		DSContaBanco = respostaListaContaBanco.data[i]['DSCONTABANCO'];

		$('#IDContaBanco').append(
			`<option value="` + IDContaBanco + `"> ` + DSContaBanco + `</option>`
		);
	}
}

function retornoListaEditContaBanco(respostaListaEditContaBanco) {

	for (var i = 0; i < respostaListaEditContaBanco.data.length; i++) {

		IDContaBanco = respostaListaEditContaBanco.data[i]['IDCONTABANCO'];
		DSContaBanco = respostaListaEditContaBanco.data[i]['DSCONTABANCO'];

		$('#IDContaBanco').append(
			`<option value="` + IDContaBanco + `"> ` + DSContaBanco + `</option>`
		);
	}
	
}

function modal_Cad_Deposito() {

    var idemp = $("#idloja").val();

	$.get('action_caddepositomodal.html', function(res) {

		$('#resulmodaldeposito').html(res);
		$("#cadDeposito").modal('show');
		$('#cadDeposito').on('shown.bs.modal', function() {
		    
    		$('#IDEmpresaDeposito').val(idemp);
            $('#nomeempDeposito').val(idemp);
    		$('#DTDeposito').val(dataAtualCampo);
    		$('#HRDeposito').val(horaAtualCampo);
            
    		$('#IDFuncDeposito').val(IDFuncionarioLogin);
    		$("#IDContaBanco").focus();
    		$("#IDContaBanco").select2({
    			dropdownParent: $("#cadDeposito")
    		});
		
			$('#footerdeposito').html(
    		    `<button type="button" class="btn btn-success" onclick="cadastrar_deposito()">Cadastrar Depósito</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
    	    );
    	    
		});
    	    
		return ajaxGet('api/conta-banco.xsjs')
			.then(retornoListaContaBanco)
			.catch(funcErrorContaBanco);
	})

}

function cadastrar_deposito() {

	var depo_idempresadep = $("#IDEmpresaDeposito").val();
	var depo_idfuncdep = $("#IDFuncDeposito").val();
	var depo_dtlancdep = $("#DTDeposito").val();
	var depo_hrlancdep = $("#HRDeposito").val();
	var depo_dtlancmovdep = $("#DTMovimentoCaixa").val();
	var depo_hrlancmovdep = $("#HRMovimentoCaixa").val();
	var depo_idcontabanco = $("#IDContaBanco").val();
	var depo_historiodep = $("#DsHistorio").val();
	var depo_ndocdep = $("#NuDocDeposito").val();
	var depo_vrdeposito = $("#VrDeposito").val().replace(".", "").replace(",", ".");
	var depo_stativodep = $("#STAtivoDeposito").val();
	var depo_stcanceladep = $("#STCancelaDeposito").val();
	
	var DTDepositoLoja = depo_dtlancdep+' '+depo_hrlancdep;
	var DTMovimentoLoja = depo_dtlancmovdep+' '+depo_hrlancmovdep;
    
    if(depo_dtlancdep==''){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Data do Depósito.</div>"
		);
		$("#DTDeposito").focus();
		return false;
    }
    
    if(depo_idcontabanco=='0'){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Conta do Depósito.</div>"
		);
		$("#IDContaBanco").focus();
		return false;
    }

    if(depo_hrlancdep==''){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Hora do Depósito.</div>"
		);
		$("#HRDeposito").focus();
		return false;
    }
    
	/*if ($("#DsHistorio").val() === '') {

		$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Histórico do Depósito.</div>"
		);
		$("#DsHistorio").focus();
		return false;
	}*/

	if ($("#VrDeposito").val() === '' || $("#VrDeposito").val()==='0') {

		$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Valor do Depósito.</div>"
		);
		$("#VrDeposito").focus();
		return false;
	}

    if(depo_dtlancmovdep==''){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Data do Movimento do Caixa.</div>"
		);
		$("#DTMovimentoCaixa").focus();
		return false;
    }

    if(depo_hrlancmovdep==''){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Hora do Movimento do Caixa.</div>"
		);
		$("#HRMovimentoCaixa").focus();
		return false;
    }
    
	var dados = [{
		"IDEMPRESA": parseInt(depo_idempresadep),
		"IDUSR": parseInt(depo_idfuncdep),
		"IDCONTABANCO": parseInt(depo_idcontabanco),
		"DTDEPOSITO": DTDepositoLoja,
		"DTMOVIMENTOCAIXA": DTMovimentoLoja,
		"DSHISTORIO": depo_historiodep,
		"NUDOCDEPOSITO": depo_ndocdep,
		"VRDEPOSITO": parseFloat(depo_vrdeposito),
		"STATIVO": depo_stativodep,
		"STCANCELADO": depo_stcanceladep

	}];

	//console.table(dados);

	ajaxPost("api/deposito-loja/todos.xsjs", dados)
		.then(funcSucessDeposito)
		.catch(funcErrorDeposito);
		
	const textdados = JSON.stringify(dados);

	textoFuncao = 'FINANCEIRO/CADASTRO DEPOSITO PELO EXTRATO DE CONTAS';

    var dadosCadDeposito = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosCadDeposito)
		.then(funcSucessLog)
		.catch(funcError);
		
}

function editar_deposito() {

	var depo_iddep = $("#IDDeposito").val();
	var depo_idempresadep = $("#IDEmpresaDeposito").val();
	var depo_idfuncdep = $("#IDFuncDeposito").val();
	var depo_dtlancdep = $("#DTDeposito").val();
	var depo_hrlancdep = $("#HRDeposito").val();
	var depo_dtlancmovdep = $("#DTMovimentoCaixa").val();
	var depo_hrlancmovdep = $("#HRMovimentoCaixa").val();
	var depo_idcontabanco = $("#IDContaBanco").val();
	var depo_historiodep = $("#DsHistorio").val();
	var depo_ndocdep = $("#NuDocDeposito").val();
	var depo_vrdeposito = $("#VrDeposito").val().replace(".", "").replace(",", ".");
	var depo_stativodep = $("#STAtivoDeposito").val();
	var depo_stcanceladep = $("#STCancelaDeposito").val();
	
	var DTDepositoLoja = depo_dtlancdep+' '+depo_hrlancdep;
	var DTMovimentoLoja = depo_dtlancmovdep+' '+depo_hrlancmovdep;
    
    if(depo_dtlancdep==''){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Data do Depósito.</div>"
		);
		$("#DTDeposito").focus();
		return false;
    }
    
    if(depo_idcontabanco=='0'){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Conta do Depósito.</div>"
		);
		$("#IDContaBanco").focus();
		return false;
    }

    if(depo_hrlancdep==''){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Hora do Depósito.</div>"
		);
		$("#HRDeposito").focus();
		return false;
    }
    
	/*if ($("#DsHistorio").val() === '') {

		$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Histórico do Depósito.</div>"
		);
		$("#DsHistorio").focus();
		return false;
	}*/

	if ($("#VrDeposito").val() === '' || $("#VrDeposito").val()==='0') {

		$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Valor do Depósito.</div>"
		);
		$("#VrDeposito").focus();
		return false;
	}

    if(depo_dtlancmovdep==''){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Data do Movimento do Caixa.</div>"
		);
		$("#DTMovimentoCaixa").focus();
		return false;
    }

    if(depo_hrlancmovdep==''){
    	$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Hora do Movimento do Caixa.</div>"
		);
		$("#HRMovimentoCaixa").focus();
		return false;
    }
    
	var dados = [{
	    "IDDEPOSITOLOJA": parseInt(depo_iddep),
		"IDEMPRESA": parseInt(depo_idempresadep),
		"IDUSR": parseInt(depo_idfuncdep),
		"IDCONTABANCO": parseInt(depo_idcontabanco),
		"DTDEPOSITO": DTDepositoLoja,
		"DTMOVIMENTOCAIXA": DTMovimentoLoja,
		"DSHISTORIO": depo_historiodep,
		"NUDOCDEPOSITO": depo_ndocdep,
		"VRDEPOSITO": parseFloat(depo_vrdeposito),
		"STATIVO": depo_stativodep,
		"STCANCELADO": depo_stcanceladep

	}];

	//console.table(dados);

	ajaxPut("api/deposito-loja/todos.xsjs", dados)
		.then(funcSucessDeposito)
		.catch(funcErrorDeposito);
		
	const textdados = JSON.stringify(dados);

	textoFuncao = 'FINANCEIRO/EDIÇÃO DEPOSITO PELO EXTRATO DE CONTAS';

    var dadosCadDeposito = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPut("api/log-web.xsjs", dadosCadDeposito)
		.then(funcSucessLog)
		.catch(funcError);
		
}

function funcSucessDeposito() {

	alerta_cadastrado_sucesso();
	$("#cadDeposito").modal('hide');
	pesq_extrato_lojas(1);
}
	
function funcErrorDeposito(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessDeposito',
		showConfirmButton: false,
		timer: 15000
	});
}
    
function status_Deposito_Loja(id,status) {

  Swal.fire({
    title: 'Certeza que Deseja Cancelar o Depósito?',
    text: "Você não poderá reverter o cancelamento!",
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
          
        var dados = {
          "IDDEPOSITOLOJA": parseInt(id),
          "STCANCELADO":status
        };
        
      	ajaxPut("api/deposito-loja/atualizacao-status.xsjs", dados)
    		.then(funcSucessUpdateDeposito)
    		.catch(funcErrorUpdateDeposito);
    		
    	const textdados = JSON.stringify(dados);
    	
    	if(status=='True'){
    	    textoFuncao = 'FINANCEIRO/CANCELAR DEPOSITO VIA EXTRATO';
    	}else{
    	    textoFuncao = 'FINANCEIRO/ATIVAR DEPOSITO VIA EXTRATO';
    	}
    		
        var dadosCancelaAtivaDep = [{
            
            "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
            "PATHFUNCAO":textoFuncao,
            "DADOS":textdados,
            "IP":ipCliente
        }];
    
      	ajaxPost("api/log-web.xsjs", dadosCancelaAtivaDep)
    		.then(funcSucessLog)
    		.catch(funcError);
            		
      })
    }
  })
}

function funcSucessUpdateDeposito(resposta) {

	alerta_cancel_ativa_deposito();
	pesq_extrato_lojas(1);

}

function funcErrorUpdateDeposito(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateDeposito',
		showConfirmButton: false,
		timer: 15000
	});
}

function status_confirmar_Deposito_Loja(id,status) {

  Swal.fire({
      title: 'Confirma a Conferência do Depósito?<br>'+
    'Informe a Data de Compensação',
      html:
    '<input type="date" id="DTCompensacao" name="DTCompensacao" class="form-control" value="" >',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
    
             dtCompensacao =  document.getElementById('DTCompensacao').value
         
        if(dtCompensacao!=''){
            
            var dados = {
              "IDDEPOSITOLOJA": parseInt(id),
              "STCONFERIDO":status,
              "DTCOMPENSACAO": dtCompensacao
            };
            
            //console.table(dados);
            	
          	ajaxPut("api/deposito-loja/atualizacao-status-conferido.xsjs", dados)
        		.then(funcSucessUpdateConferidoDeposito)
        		.catch(funcErrorUpdateConferidoDeposito);
        	
        	const textdados = JSON.stringify(dados);
        	
        	if(status=='True'){
        	    textoFuncao = 'FINANCEIRO/CONFIRMADA CONFERENCIA DO DEPOSITO';
        	}else{
        	    textoFuncao = 'FINANCEIRO/DESCONFIRMADO CONFERENCIA DO DEPOSITO';
        	}
        		
            var dadosConfirmaDep = [{
                
                "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                "PATHFUNCAO":textoFuncao,
                "DADOS":textdados,
                "IP":ipCliente
            }];
        
          	ajaxPost("api/log-web.xsjs", dadosConfirmaDep)
        		.then(funcSucessLog)
        		.catch(funcError);
    		
        }else{
            alert('Data da Compensação não pode ser vazia');
        }
    		
    })
}

function funcSucessUpdateConferidoDeposito(resposta) {

	alerta_cancel_ativa_deposito();
	pesq_extrato_lojas(1);

}

function funcErrorUpdateConferidoDeposito(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateConferidoDeposito',
		showConfirmButton: false,
		timer: 15000
	});
}

function modal_Cad_Ajuste_Extrato() {

    var idemp = $("#idloja").val();

	$.get('action_cadajusteextratomodal.html', function(res) {

		$('#resulmodalajusteextrato').html(res);
		$("#cadAjusteExtrato").modal('show');
		$('#cadAjusteExtrato').on('shown.bs.modal', function() {
		    
		$('#IDEmpresaAjuste').val(idemp);
        $('#nomeempAjuste').val(idemp);
        
		$('#IDFuncAjuste').val(IDFuncionarioLogin);
		$('#DTAjuste').val(dataAtualCampo);
		$('#HRAjuste').val(horaAtualCampo);
		$("#DsHistorioAjuste").focus();

		});

	})

}

function modal_Edit_Deposito_Loja(id) {

    var idemp = $("#idloja").val(); 

	$.get('action_caddepositomodal.html', function(res) {

		$('#resulmodaldeposito').html(res);
		$("#cadDeposito").modal('show');
		$('#cadDeposito').on('shown.bs.modal', function() {
		    
    		$('#IDEmpresaDeposito').val(idemp);
    		$('#IDDeposito').val(id);
            $('#nomeempDeposito').val(idemp);
            
    		$('#IDFuncDeposito').val(IDFuncionarioLogin);
    		$("#IDContaBanco").focus();
    		$("#IDContaBanco").select2({
    			dropdownParent: $("#cadDeposito")
    		});
		
    		$('#footerdeposito').html(
    		    `<button type="button" class="btn btn-success" onclick="editar_deposito()">Editar Depósito</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
    	    );
		});

		return	ajaxGet('api/financeiro/deposito-loja.xsjs?idDep=' + id)
			.then(retornoEditarDepositoLoja)
			.catch(funcError);
		
			
	})

}

function retornoEditarDepositoLoja(editarDepositoLoja) {

		IDDeposito = editarDepositoLoja.data[0]['IDDEPOSITOLOJA'];
		DTMovDepositoCompleta = editarDepositoLoja.data[0]['DTMOVDEPCOMPLETA'];
		DTMovDeposito = editarDepositoLoja.data[0]['DTMOVDEP'];
		DTDepositoCompleta = editarDepositoLoja.data[0]['DTDEPCOMPLETA'];
		DTDeposito = editarDepositoLoja.data[0]['DTDEP'];
		DSHISTORIODEPOSITO = editarDepositoLoja.data[0]['DSHISTORIO'];
		NUDocDeposito = editarDepositoLoja.data[0]['NUDOCDEPOSITO'];
		IDContaDep = editarDepositoLoja.data[0]['IDCONTABANCO'];
		DSContaDep = editarDepositoLoja.data[0]['DSCONTABANCO'];
		VrDepositoLoja = mascaraValor(parseFloat(editarDepositoLoja.data[0]['VRDEPOSITO']).toFixed(2));


        var dataDep = new Date(DTDepositoCompleta);
        var horaDep = dataDep.getHours();
        var minDep = dataDep.getMinutes(); 
        
        let horaStrDep = String(horaDep);
        let minStrDep = String(minDep);
        let horaAtualDep = horaStrDep.padStart(2, '0') + ':' + minStrDep.padStart(2, '0');
        
        
        var dataMovDep = new Date(DTMovDepositoCompleta);
        var horaMovDep = dataMovDep.getHours();
        var minMovDep = dataMovDep.getMinutes(); 
        
        let horaStrMovDep = String(horaMovDep);
        let minStrMovDep = String(minMovDep);
        let horaAtualMovDep = horaStrMovDep.padStart(2, '0') + ':' + minStrMovDep.padStart(2, '0');

	    $('#iddtdeposito').html(
		    `<input type="date" id="DTDeposito" name="DTDeposito" class="form-control" value="">`
	    );
	    
	    $('#idhrdeposito').html(
		    `<input type="time" id="HRDeposito" name="HRDeposito" class="form-control" value="">`
	    );
    	    
		$('#IDDeposito').val(IDDeposito);
		$('#DsHistorio').val(DSHISTORIODEPOSITO);
		$('#DTDeposito').val(DTDeposito);
		$('#HRDeposito').val(horaAtualDep);
		$('#DTMovimentoCaixa').val(DTMovDeposito);
		$('#HRMovimentoCaixa').val(horaAtualMovDep);
		$('#NuDocDeposito').val(NUDocDeposito);
		$('#DTMovimentoCaixa').val(DTMovDeposito);
		$('#VrDeposito').val(VrDepositoLoja);
		
		

    	    
		$('#IDContaBanco').html(
			`<option value="` + IDContaDep + `"> ` + DSContaDep + `</option>`
		);
		
		return ajaxGet('api/conta-banco.xsjs')
			.then(retornoListaEditContaBanco)
			.catch(funcError);
			
}

function cadastrar_ajuste_extrato() {

	var ajuste_idempresadep = $("#IDEmpresaAjuste").val();
	var ajuste_idfuncdep = $("#IDFuncAjuste").val();
	var ajuste_dtlancdep = $("#DTAjuste").val();
	var ajuste_hrlancdep = $("#HRAjuste").val();
	var ajuste_historiodep = $("#DsHistorioAjuste").val();
	var ajuste_vrcredito = $("#VrCredito").val().replace(".", "").replace(",", ".");
	var ajuste_vrdebito = $("#VrDebito").val().replace(".", "").replace(",", ".");
	var ajuste_stativodep = $("#STAtivoAjuste").val();
	var ajuste_stcanceladep = $("#STCancelaAjuste").val();
	
	var DTAjusteLoja = ajuste_dtlancdep+' '+ajuste_hrlancdep;
    
	if ($("#DsHistorioAjuste").val() === '') {

		$("#resultadoajusteextrato").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Histórico do Ajuste.</div>"
		);
		$("#DsHistorioAjuste").focus();
		return false;
	}

	if ($("#VrCredito").val() === '') {

		$("#resultadoajusteextrato").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Valor do Crédito do Ajuste.</div>"
		);
		$("#VrCredito").focus();
		return false;
	}

	if ($("#VrDebito").val() === '') {

		$("#resultadoajusteextrato").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Valor do Débito do Ajuste.</div>"
		);
		$("#VrDebito").focus();
		return false;
	}
    
	var dados = [{
		"IDEMPRESA": parseInt(ajuste_idempresadep),
		"HISTORICO": ajuste_historiodep,
		"VRDEBITO": parseFloat(ajuste_vrcredito),
		"VRCREDITO": parseFloat(ajuste_vrdebito),
		"STATIVO": ajuste_stativodep,
		"STCANCELADO": ajuste_stcanceladep,
		"IDOPERADOR": parseInt(ajuste_idfuncdep),
		"DATACADASTRO": DTAjusteLoja

	}];

	//console.table(dados);

	ajaxPost("api/financeiro/ajuste-extrato.xsjs", dados)
		.then(funcSucessAjusteExtrato)
		.catch(funcErrorAjusteExtrato);
}

function funcSucessAjusteExtrato() {

	alerta_cadastrado_sucesso();
	$("#cadAjusteExtrato").modal('hide');
	pesq_extrato_lojas(1);
}
	
function funcErrorAjusteExtrato(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessAjusteExtrato',
		showConfirmButton: false,
		timer: 15000
	});
}

function status_Ajuste_Extrato_Loja(id,status) {

  Swal.fire({
    title: 'Certeza que Deseja Cancelar o Ajuste?',
    text: "Você não poderá reverter o cancelamento!",
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
          
        var dados = {
          "IDAJUSTEEXTRATO": parseInt(id),
          "STCANCELADO":status
        };
            
        ajaxPut("api/financeiro/atualizacao-ajuste-extrato-status.xsjs", dados)
        		.then(funcSucessUpdateAjusteExtrato)
        		.catch(funcErrorUpdateAjusteExtrato);
        		
    	const textdados = JSON.stringify(dados);
    	
    	if(status=='True'){
    	    textoFuncao = 'FINANCEIRO/CANCELADO O AJUSTE DO EXTRATO';
    	}else{
    	    textoFuncao = 'FINANCEIRO/ATIVADO O AJUSTE DO EXTRATO'; 
    	}
    		
        var dadosCancelaAtivaAjusteExtrato = [{
            
            "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
            "PATHFUNCAO":textoFuncao,
            "DADOS":textdados,
            "IP":ipCliente
        }];
    
      	ajaxPost("api/log-web.xsjs", dadosCancelaAtivaAjusteExtrato)
    		.then(funcSucessLog)
    		.catch(funcError);
            		
      })
    }
  })
}

function funcSucessUpdateAjusteExtrato(resposta) {

	alerta_cancel_ativa_deposito();
	pesq_extrato_lojas(1);

}

function funcErrorUpdateAjusteExtrato(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateAjusteExtrato',
		showConfirmButton: false,
		timer: 15000
	});
}

function alerta_cadastrado_sucesso() {
	Swal.fire({
		type: "success",
		title: "Dados Cadastrados com Sucesso",
		showConfirmButton: false,
		timer: 2000
	});
}

function RelatorioRemessaVenda() {
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

            $("#idgrupo").select2();
            $("#idloja").select2();
            
            textoAGravar = '';
            textoFinal='';
    
            $('.DescTituloListaRemessaVenda').html(
                `<i class='subheader-icon fal fa-chart-area'></i> Remessa Venda - <span class='fw-300'></span>`);

                ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch(funcError);
        }
    };
    xmlhttp.open("GET", "financeiro_action_listremessavenda.html", true);
    xmlhttp.send();
}

function pesq_remessavenda_marca() { 

    setTimeout(function(){
        $("#btnGravarArquivo").show();
        $("#btnGerarArquivo").hide();
        $("#resultado").html('');
    },15000);

    var idGrupoEmpresa = $("#idgrupo").val();
    var idLojaEmpresa = $("#idloja").val();
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
        newDataTable('pesqremessas');
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/financeiro/remessa-venda.xsjs?page=1&idGrupoEmpresa='+idGrupoEmpresa+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idLojaEmpresa=' + idLojaEmpresa)
        	.then(retornoListaRemessaVenda)
        	.catch(funcErrorListaRemessaVenda);
      }
    };
    
    xmlhttp.open("GET", "action_pesqremessavenda.html", true);
    xmlhttp.send();
    
}    

function funcErrorListaRemessaVenda() {
	Swal.fire({
		type: "error",
		title: "Erro ao carregar os dados da retorno Remessa Venda",
		showConfirmButton: false,
		timer: 15000
	});
}

function GravaArquivo(){
    
    var idgrupo = $("#idgrupo").val();
    var idLojaEmpresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
    if(idgrupo == 1){
        grupo = 'Remessa TO ';
    }else if(idgrupo == 2){
        grupo = 'Remessa MG ';
    }else if(idgrupo == 3){
        grupo = 'Remessa YO ';
    }else{
        grupo = 'Remessa FC ';
    }
    
    textoFinal = 'DATA;NSU;AUTORIZACAO;VALOR;PLANO;ESTABELECIMENTO;'+'\n'+textoAGravar;
    
    var blob = new Blob([textoFinal.toString()], {type: "text/plain;charset=utf-8"});
    
    saveAs(blob, grupo+datapesqinicio+' a '+datapesqfim);
    
    setTimeout(function(){
        RelatorioRemessaVenda();
    },2000);
   
}

function retornoListaRemessaVenda(respostaListaRemessas) {
    
    var idGrupoEmpresa = $("#idgrupo").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    
    var numPageAtual = parseInt(respostaListaRemessas.page);
    //alert(respostaListaRemessas.data.length);
 
    if(respostaListaRemessas.data.length != 0){
        for (var i = 0; i < respostaListaRemessas.data.length; i++) {
    
            data = respostaListaRemessas.data[i]['DATA'];
            nsu = respostaListaRemessas.data[i]['NSU'];
            autorizacao = respostaListaRemessas.data[i]['AUTORIZACAO']==''?'123':respostaListaRemessas.data[i]['AUTORIZACAO'];
            valor = parseFloat(respostaListaRemessas.data[i]['VALOR']);
            plano = respostaListaRemessas.data[i]['PLANO'];
            estabelecimento = respostaListaRemessas.data[i]['ESTABELECIMENTO'];
           
            textoAGravar = textoAGravar+ data+';'+nsu+';'+autorizacao+';'+mascaraValor(parseFloat(valor).toFixed(2))+';'+plano+';'+estabelecimento+';'+'\n';
            		
    	}
    	
    chamarProximaListaRemessaVenda(numPageAtual + 1);
    }



}

function chamarProximaListaRemessaVenda(numPage) {

    var idGrupoEmpresa = $("#idgrupo").val();
    var idLojaEmpresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

        ajaxGet('api/financeiro/remessa-venda.xsjs?page=' + numPage + '&idGrupoEmpresa='+idGrupoEmpresa+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idLojaEmpresa=' + idLojaEmpresa)
        	.then(retornoListaRemessaVenda)
        	.catch(funcErrorListaRemessaVenda);
    
}

//////////////////Quebra de Caixa da Loja////////////////////////////

function selecionamarcavendedor(){
    
    $("#idloja").empty();
    
    idmarca = $('#idmarca').val();

    ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca)
	.then(retornoListaEmpresasSelect)
	.catch(funcError);
}

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
			`<i class='subheader-icon fal fa-chart-area'></i> Quebra de Caixas das Lojas - <span class='fw-300'></span>`);

			ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch(funcError);

      }
    };
    xmlhttp.open("GET", "financeiro_action_listquebracaixaloja.html", true);
    xmlhttp.send();
}

function pesq_quebra_caixa_loja() {

    var datapesqinicio = $("#DTInicio").val();
    var datapesqfim = $("#DTFim").val();
    var IDMarcaLoja = $("#idmarca").val();
    var IDEmpresaLoja = $("#idloja").val();
    var CPFOperadorQuebra = $("#cpfOperador").val();
    var stQuebraPositivaNegativa = $("#stQuebraPositvaNegativa").val();
    
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
        //newDataTable('quebracaixa');
        
            $('.dataAtual').text(dataAtual);
            if(stQuebraPositivaNegativa === '0'){
    		    ajaxGet('api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page=1&idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaLoja + '&cpfquebraop=' + CPFOperadorQuebra)
    				.then(retornoTableListQuebraCaixaLoja)
    				.catch(funcErrorQuebraCaixaLoja);
            }else{
                if(stQuebraPositivaNegativa === '1'){
                     ajaxGet('api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page=1&idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim +'&stQuebraPositivaNegativa=Positiva' + '&idMarca=' + IDMarcaLoja + '&cpfquebraop=' + CPFOperadorQuebra)
        				.then(retornoTableListQuebraCaixaLoja)
        				.catch(funcErrorQuebraCaixaLoja);
                }else{
                    ajaxGet('api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page=1&idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim +'&stQuebraPositivaNegativa=Negativa' + '&idMarca=' + IDMarcaLoja + '&cpfquebraop=' + CPFOperadorQuebra)
        				.then(retornoTableListQuebraCaixaLoja)
        				.catch(funcErrorQuebraCaixaLoja);
                }
            }
				
      }
    };
    xmlhttp.open("GET", "financeiro_action_pesqquebracaixaloja.html", true);
    xmlhttp.send();
}

function retornoTableListQuebraCaixaLoja(quebraCaixaLoja) {

    var numPageAtual = parseInt(quebraCaixaLoja.page);

    if(numPageAtual === 1){
        
        $('#resultadoListaQuebra').html(
            `<table id="dt-basic-quebracaixa" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
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
            </table>`
        );
	            
        var tableQuebraLoja = $('#dt-basic-quebracaixa').DataTable({
            deferRender:    true,
            ordering:  false,
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
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        }
                    ]
        });
        
        tableQuebraLoja.rows().remove().draw();
        $('#totalQuebraCaixaLoja').html('');
    }

    if(quebraCaixaLoja.data.length != 0){
        
        contadorQuebraLoja = 0;
        
	    for (var i = 0; i < quebraCaixaLoja.data.length; i++) {

		contadorQuebraLoja = contadorQuebraLoja + 1;

		IDQuebraLoja = quebraCaixaLoja.data[i]['IDQUEBRACAIXA'];
		EmpMovQuebraLoja = quebraCaixaLoja.data[i]['NOFANTASIA'];
		IDMovQuebraLoja = quebraCaixaLoja.data[i]['IDMOVIMENTOCAIXA'];
		IDGerente = quebraCaixaLoja.data[i]['IDGERENTE'];
		IDFuncQuebra = quebraCaixaLoja.data[i]['IDFUNCIONARIO'];
		DTLancamento = quebraCaixaLoja.data[i]['DTLANCAMENTO'];
		VrQuebrasistemaLoja = parseFloat(quebraCaixaLoja.data[i]['VRQUEBRASISTEMA']);
		VrQuebraLancadoLoja = parseFloat(quebraCaixaLoja.data[i]['VRQUEBRAEFETIVADO']);
		TxtHistoricoQuebra = quebraCaixaLoja.data[i]['TXTHISTORICO'];
		NomeFuncQuebra = quebraCaixaLoja.data[i]['NOMEOPERADOR'];
		CPFNomeFuncQuebra = quebraCaixaLoja.data[i]['CPFOPERADOR'];
		MatNomeFuncQuebra = quebraCaixaLoja.data[i]['IDFUNCIONARIO'];
		SituacaoQuebraLoja = quebraCaixaLoja.data[i]['STATIVO'];

	    if(SituacaoQuebraLoja=='True'){ 
            tagQuebraAtivo='<label style="color: blue;">Ativo</label>';
            tagQuebraAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-danger btn-xs" title="Cancelar Quebra" id="'+IDQuebraLoja+'" onclick="status_Quebra_Caixa_Loja(this.id,\'False\')" >Cancelar</button><button type="button" class="btn btn-info btn-xs" title="Imprimir Quebra" id="'+IDQuebraLoja+'" onclick="modal_Imprimir_Quebra(this.id)" >Imprimir</button></div>';
        }else{
            tagQuebraAtivo='<label style="color: red;">Cancelado</label>';
            tagQuebraAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-info btn-xs" title="Ativar Quebra" id="'+IDQuebraLoja+'" onclick="status_Quebra_Caixa_Loja(this.id,\'True\')" >Ativar</button></div>';
        }
        
        if(VrQuebraLancadoLoja>0){
            tagVrQuebraLanc = '<label style="color: blue;"> + ' + mascaraValor(VrQuebraLancadoLoja.toFixed(2)) + '</label>';
        }else{
            tagVrQuebraLanc = '<label style="color: red;"> - ' + mascaraValor(VrQuebraLancadoLoja.toFixed(2)) + '</label>';
        }
        
         if(VrQuebrasistemaLoja>0){
            tagVrQuebraSistemaLanc = '<label style="color: blue;"> + ' + mascaraValor(VrQuebrasistemaLoja.toFixed(2)) + '</label>';
        }else{
            tagVrQuebraSistemaLanc = '<label style="color: red;"> - ' + mascaraValor(VrQuebrasistemaLoja.toFixed(2)) + '</label>';
        }

		tableQuebraLoja.row.add([
            `<label style="color: blue;">` + contadorQuebraLoja + `</label>`,
            `<label style="color: blue;">` + EmpMovQuebraLoja + `</label>`,
            `<label style="color: blue;">` + DTLancamento + `</label>`,
            `<label style="color: blue;">` + IDMovQuebraLoja + `</label>`,
            `<label style="color: blue;">` + MatNomeFuncQuebra + `</label>`,
            `<label style="color: blue;">` + NomeFuncQuebra + `</label>`,
            `<label style="color: blue;">` + CPFNomeFuncQuebra + `</label>`,
            tagVrQuebraSistemaLanc,
            tagVrQuebraLanc,
            `<label style="color: blue;">` + TxtHistoricoQuebra + `</label>`,
            tagQuebraAtivo,
            tagQuebraAtivoBotao,
        ]).draw(false);
        
	}
	
        chamarProximaListaQuebraCaixaLoja(numPageAtual + 1);
    }else{

    }
	
}


function chamarProximaListaQuebraCaixaLoja(numPage){

    var datapesqinicio = $("#DTInicio").val();
    var datapesqfim = $("#DTFim").val();
    var IDMarcaLoja = $("#idmarca").val();
    var IDEmpresaLoja = $("#idloja").val();
    var CPFOperadorQuebra = $("#cpfOperador").val();
    var stQuebraPositivaNegativa = $("#stQuebraPositvaNegativa").val();
    
            if(stQuebraPositivaNegativa === '0'){
    		    ajaxGet('api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page='+numPage +'&idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaLoja + '&cpfquebraop=' + CPFOperadorQuebra)
    				.then(retornoTableListQuebraCaixaLoja)
    				.catch(funcErrorQuebraCaixaLoja);
            }else{
                if(stQuebraPositivaNegativa === '1'){
                    ajaxGet('api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page='+numPage +'&idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim +'&stQuebraPositivaNegativa=Positiva' + '&idMarca=' + IDMarcaLoja + '&cpfquebraop=' + CPFOperadorQuebra)
        				.then(retornoTableListQuebraCaixaLoja)
        				.catch(funcErrorQuebraCaixaLoja);
                }else{
                    ajaxGet('api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page='+numPage +'&idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim +'&stQuebraPositivaNegativa=Negativa' + '&idMarca=' + IDMarcaLoja + '&cpfquebraop=' + CPFOperadorQuebra)
        				.then(retornoTableListQuebraCaixaLoja)
        				.catch(funcErrorQuebraCaixaLoja);
                }
            }
}

function funcErrorQuebraCaixaLoja(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoTableListQuebraCaixaLoja',
		showConfirmButton: false,
		timer: 15000
	});
}

function modal_Imprimir_Quebra(id) {
    
    $.get('action_imprimirmodalquebra.html', function(res) {

		$('#resulmodalimprimirquebra').html(res);
		$("#imprimiDadosQuebra").modal('show');
		$('#imprimiDadosQuebra').on('shown.bs.modal', function() {});
		
		return	ajaxGet('api/dashboard/quebra-caixa/quebra-caixa.xsjs?id=' + id) 
			.then(retornoTableImprimeQuebra) 
			.catch(funcError);
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
    		.catch(funcError);
		
}

function status_Quebra_Caixa_Loja(id,status) {

    var dados = {
      "IDQUEBRACAIXA": parseInt(id),
      "STATIVO":status
    };
    
  	ajaxPut("api/dashboard/quebra-caixa/atualizacao-status.xsjs", dados)
		.then(funcSucessUpdateQuebraCaixaLoja)
		.catch(funcError);
		
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
		.catch(funcError);

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

//////////////////Adiantamento Salarial da Loja////////////////////////////

function ListaAdiantamentoLoja() {

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
			`<i class='subheader-icon fal fa-chart-area'></i> Adiantamento Salarial das Lojas <span class='fw-300'></span>`);

			ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)

      }
    };
    xmlhttp.open("GET", "financeiro_action_listadiantamentoloja.html", true);
    xmlhttp.send();
}

function pesq_adiantamento_loja() {

    var datapesqinicio = $("#DTInicio").val();
    var datapesqfim = $("#DTFim").val();
    var IDMarcaLoja = $("#idmarca").val();
    var IDEmpresaLoja = $("#idloja").val();
  
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
        newDataTable('quebracaixa');
        
            $('.dataAtual').text(dataAtual);

		    return	ajaxGet('api/dashboard/adiantamento-salarial/adiantamentolojas.xsjs?idEmpresa=' + IDEmpresaLoja + '&dataPesquisaIni=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaLoja)
				.then(retornoTableListAdiantamentoLoja)
				.catch(funcErrorListAdiantamentoLoja);
				
      }
    };
    xmlhttp.open("GET", "financeiro_action_pesqadiantamentoloja.html", true);
    xmlhttp.send();
}

function retornoTableListAdiantamentoLoja(adiantamentoLoja) {

	var VrTotalAdiantamentoLoja = 0;
	var contadorAdiantamento = 0;


		var tableAdiantamentoSal = $('#dt-basic-adiantamentoloja').DataTable({
            deferRender:    true,
            
            ordering:  false,
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
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        }
                    ]
        });

        tableAdiantamentoSal.rows().remove().draw();
        
        $('#totalAdiantamentoLoja').html('');
        
	for (var i = 0; i < adiantamentoLoja.data.length; i++) {

		contadorAdiantamento = contadorAdiantamento + 1;

		IDMovAdiantamento = adiantamentoLoja.data[i]['IDADIANTAMENTOSALARIO'];
		DTMovAdiantamento = adiantamentoLoja.data[i]['DTLANCAMENTO'];
		NomeFuncAdiantamento = adiantamentoLoja.data[i]['NOFUNCIONARIO'];
		CPFFuncAdiantamento = adiantamentoLoja.data[i]['NUCPF'];
		VrAdiantamento = parseFloat(adiantamentoLoja.data[i]['VRVALORDESCONTO']);
		DsEmpAdiantamento = (adiantamentoLoja.data[i]['NOFANTASIA']);
		STAdiantamento = adiantamentoLoja.data[i]['STATIVO'];
        
        if(STAdiantamento=='True'){
            VrTotalAdiantamentoLoja = VrTotalAdiantamentoLoja + VrAdiantamento;
        }
		
		
	    if(STAdiantamento=='True'){
            tagAdiantAtivo='<label style="color: blue;">Ativo</label>';
            tagAdiantAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-danger btn-xs" title="Cancelar Adiantamento" id="'+IDMovAdiantamento+'" onclick="status_Adiantamento_salario(this.id,\'False\')" >Cancelar</button></div>';
        }else{
            tagAdiantAtivo='<label style="color: red;">Cancelado</label>';
            tagAdiantAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-info btn-xs" title="Ativar Adiantamento" id="'+IDMovAdiantamento+'" onclick="status_Adiantamento_salario(this.id,\'True\')" >Ativar</button></div>';
        }

		tableAdiantamentoSal.row.add([
            `<label style="color: blue;">` + contadorAdiantamento + `</label>`,
            `<label style="color: blue;">` + DsEmpAdiantamento + `</label>`,
            `<label style="color: blue;">` + DTMovAdiantamento + `</label>`,
            `<label style="color: blue;">` + NomeFuncAdiantamento + `</label>`,
            `<label style="color: blue;">` + CPFFuncAdiantamento + `</label>`,
            `<label style="color: blue;">` + mascaraValor(VrAdiantamento.toFixed(2)) + `</label>`,
            tagAdiantAtivo,
            tagAdiantAtivoBotao,
        ]).draw(false);
	}

	$('.totalAdiantamentoLoja').html(
		`<tr>
            <th colspan="5" style="text-align: center;">Total Lançamentos</th>
            <th style="text-align: right;">${mascaraValor(VrTotalAdiantamentoLoja.toFixed(2))}</th>
            <th colspan="2"></th>
        </tr>`
	);
}

function funcErrorListAdiantamentoLoja(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoTableListAdiantamentoLoja',
		showConfirmButton: false,
		timer: 15000
	});
}

function funcSucessUpdateAdiantamento(resposta) {

	alerta_cancel_ativa_adiantamento();
	pesq_adiantamento_loja();

}

function alerta_cancel_ativa_adiantamento() {
Swal.fire(
  {
      type: "success",
      title: "Adiantamento Atualizado com Sucesso.",
      showConfirmButton: false,
      timer: 2500
  });
}

function status_Adiantamento_salario(id,status) {

  Swal.fire({
    title: 'Certeza que Deseja Cancelar o Adiantamento?',
    text: "Você não poderá reverter o cancelamento!",
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
          
        var dados = {
          "IDADIANTAMENTOSALARIO": parseInt(id),
          "STATIVO":status
        };
            
        ajaxPut("api/financeiro/atualizacao-adiantamento-status.xsjs", dados)
        		.then(funcSucessUpdateAdiantamento)
        		.catch(funcError);
        		
    	const textdados = JSON.stringify(dados);
    	
    	if(status=='True'){
    	    textoFuncao = 'FINANCEIRO/CANCELADO O ADIANTAMENTO SALARIAL';
    	}else{
    	    textoFuncao = 'FINANCEIRO/ATIVADO O ADIANTAMENTO SALARIAL'; 
    	}
    		
        var dadosCancelaAtivaAdiantamento = [{
            
            "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
            "PATHFUNCAO":textoFuncao,
            "DADOS":textdados,
            "IP":ipCliente
        }];
    
      	ajaxPost("api/log-web.xsjs", dadosCancelaAtivaAdiantamento)
    		.then(funcSucessLog)
    		.catch(funcError);
            		
      })
    }
  })
}

//=====================CAIXA STATUS =======================
function RelatorioCaixasStatus() {
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

            $("#idgrupo").select2();

            $('.DescTituloListaCaixaStatus').html(
                `<i class='subheader-icon fal fa-chart-area'></i> Caixa Status - <span class='fw-300'></span>`);

                ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch(funcError);
	
			
                ajaxGet('api/informatica/empresa.xsjs')
                    .then(retornoListaEmpresasSelect)
                    .catch(funcError);
                    }
    };
    xmlhttp.open("GET", "financeiro_action_listcaixastatus.html", true);
    xmlhttp.send();
}

function pesq_caixa_status() { 

    var idloja = $("#idgrupo").val();
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
        newDataTable('pesqcaixastatus');
        
        $('.dataAtual').text(dataAtual);
      
        return ajaxGet('api/financeiro/lista-caixas-status.xsjs?idEmpresa=34&dataFechamento=2021-07-01')
        .then(retornoListaCaixasStatus)
        .catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "action_pesqremessavenda.html", true);
    xmlhttp.send();
    
}  

function pesq_lista_caixas_status(numPage){
    var idgrupo = $("#idgrupo").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    dataRetorno=[];
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
        
        $('.dataAtual').text(dataAtual);
        ajaxGet('api/financeiro/lista-caixas-status.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        	.then(retornoListaCaixasStatus)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqcaixastatus.html", true);
    xmlhttp.send();
} 

function chamarProximaListaCaixasStatus(numPage){
    
    var idgrupo = $("#idgrupo").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

    ajaxGet('api/financeiro/lista-caixas-status.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        	.then(retornoListaCaixasStatus)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaCaixasStatus(respostaListaCaixaStatus) {
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
    var numPageAtual = parseInt(respostaListaCaixaStatus.page);
   
    if(respostaListaCaixaStatus.data.length != 0){
        for (var i=0; i < respostaListaCaixaStatus.data.length; i++) { 
            contador ++;
            var registro = respostaListaCaixaStatus.data[i];
            
            IDMovimentoFechamento = registro['IDMOVIMENTO'];
			IDCaixaFechamento = registro['IDCAIXAFECHAMENTO'];
            NomeCaixaMov = registro['DSCAIXAFECHAMENTO'];
			DTAberturaMov = registro['DTHORAABERTURACAIXA'];
			DTFechamentoMov = registro['DTHORAFECHAMENTOCAIXA'];
			NomeOperadorMov = registro['OPERADORFECHAMENTO'];
			FechamentoDinhFisico = parseFloat(registro['TOTALFECHAMENTODINHEIROFISICO']);
			FechamentoDinh = parseFloat(registro['TOTALFECHAMENTODINHEIRO']);
			ConferidoCaixa = registro['STCONFERIDO'];
            FechadoCaixa = registro['STFECHADO'];
            loja = registro['NOFANTASIA'];

        	QuebraCaixaDinheiroFechAjuste = parseFloat(registro['TOTALFECHAMENTODINHEIROAJUSTE']);
        
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
         
            
            
			FechamentoDinheiroTotal = FechamentoDinheiroTotal + FechamentoDinh;
			FechamentoDinheiroFisicoTotal = FechamentoDinheiroFisicoTotal + FechamentoDinhFisico;
			
					
			QuebraCaixaFechadoTotal = QuebraCaixaFechadoTotal + TotalQuebraCaixa;
			
			
            if(TotalQuebraCaixa>=0){
                tagquebracaixa = mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2));
            }else{
                tagquebracaixa = " - " + mascaraValor(parseFloat(TotalQuebraCaixa).toFixed(2));
            }

            if(ConferidoCaixa>0){
                tagConferecaixa = 'Conferido';
                
            }else{
                tagConferecaixa = 'Sem Conferir';
            }

            if(FechadoCaixa === 'True'){
                tagFechadoCaixa = 'Fechado';
            }else{
                tagFechadoCaixa = 'Aberto';
            }
            
            dataRetorno.push( [contador,
                                loja,
                                NomeCaixaMov,
                                DTAberturaMov,
                                DTFechamentoMov,
                                NomeOperadorMov,
                                tagFechadoCaixa,
                                tagConferecaixa,
                                tagquebracaixa
                                ]);
        }
        
        chamarProximaListaCaixasStatus(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-lista-caixa-status" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th ></th>
                            <th >Loja</th>
                            <th >Caixa</th>
                            <th >Data Abertura</th>
                            <th >Data Fechamento</th>
                            <th >Operador</th>
                            <th >Status</th>
                            <th >Conferido</th>
                            <th >Valor Quebra</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListcaixastatus">
                    </tbody>
                    <tfoot class="thead-themed totalConvenios">
                    </tfoot>
                </table>`
        );
	   
	    $('#dt-basic-lista-caixa-status').DataTable( {
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

function pesq_lista_caixas_zerados(numPage){
    var idgrupo = $("#idgrupo").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    dataRetorno=[];
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
        
        $('.dataAtual').text(dataAtual);
        ajaxGet('api/financeiro/lista-caixas-zerados.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        	.then(retornoListaCaixasZerados)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqcaixastatus.html", true);
    xmlhttp.send();
} 

function chamarProximaListaCaixasZerado(numPage){
    
    var idgrupo = $("#idgrupo").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

    ajaxGet('api/financeiro/lista-caixas-zerados.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        	.then(retornoListaCaixasZerados)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaCaixasZerados(respostaListaCaixaZerados) {
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
    var numPageAtual = parseInt(respostaListaCaixaZerados.page);
   
    if(respostaListaCaixaZerados.data.length != 0){
        for (var i=0; i < respostaListaCaixaZerados.data.length; i++) { 
            contador ++;
            var registro = respostaListaCaixaZerados.data[i];
            
            IDMovimentoFechamento = registro['IDMOVIMENTO'];
			IDCaixaFechamento = registro['IDCAIXAFECHAMENTO'];
            NomeCaixaMov = registro['DSCAIXAFECHAMENTO'];
			DTAberturaMov = registro['DTHORAABERTURACAIXA'];
			DTFechamentoMov = registro['DTHORAFECHAMENTOCAIXA'];
			NomeOperadorMov = registro['OPERADORFECHAMENTO'];
			FechamentoDinhFisico = parseFloat(registro['TOTALFECHAMENTODINHEIROFISICO']);
			FechamentoDinh = parseFloat(registro['TOTALFECHAMENTODINHEIRO']);
			ConferidoCaixa = registro['STCONFERIDO'];
            FechadoCaixa = registro['STFECHADO'];
            loja = registro['NOFANTASIA'];

            if(ConferidoCaixa>0){
                tagConferecaixa = 'Conferido';
                
            }else{
                tagConferecaixa = 'Sem Conferir';
            }

            if(FechadoCaixa === 'True'){
                tagFechadoCaixa = 'Fechado';
            }else{
                tagFechadoCaixa = 'Aberto';
            }
            
            tagCaixaFechaBotao = '<div class="btn-group btn-group-xs"><button type="button" class="btn btn-danger btn-xs" title="Fechar Caixa" id="' + IDMovimentoFechamento + '" onclick="fecha_caixa_zerado(this.id)" >Fechar Caixa</button></div>';
            
            dataRetorno.push( [contador,
                                loja,
                                IDMovimentoFechamento,
                                NomeCaixaMov,
                                DTAberturaMov,
                                DTFechamentoMov,
                                NomeOperadorMov,
                                tagFechadoCaixa,
                                tagConferecaixa,
                                tagCaixaFechaBotao
                                ]);
        }
        
        chamarProximaListaCaixasZerado(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-lista-caixa-zerados" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th ></th>
                            <th >Loja</th>
                            <th >Nº Movimento</th>
                            <th >Caixa</th>
                            <th >Data Abertura</th>
                            <th >Data Fechamento</th>
                            <th >Operador</th>
                            <th >Status</th>
                            <th >Conferido</th>
                            <th >Opções</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListcaixazerado">
                    </tbody>
                    <tfoot class="thead-themed totalCaixasZerados">
                    </tfoot>
                </table>`
        );
	   
	    $('#dt-basic-lista-caixa-zerados').DataTable( {
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

function fecha_caixa_zerado(id) {

    var dados = {
      "ID": (id)
    };
    
  	ajaxPut("api/financeiro/fecha-caixas-zerados.xsjs", dados)
		.then(funcSucessFechaCaixaZerado)
		.catch(funcError);
		
	const textdados = JSON.stringify(dados);

	    textoFuncao = 'FINANCEIRO/FECHAMENTO DE CAIXAS ZERADOS';

    var dadosFechaCaixaZerado = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosFechaCaixaZerado)
		.then(funcSucessLog)
		.catch(funcError);

}

function funcSucessFechaCaixaZerado(resposta) {

	//alerta_atualizado_sucesso();
	pesq_lista_caixas_zerados(1);

}

//=====================DESCONTO VENDAS =======================
function RelatorioDescontoVendas() {
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

            $("#idgrupo").select2();

            $('.DescTituloListaCaixaStatus').html(
                `<i class='subheader-icon fal fa-chart-area'></i> Caixa Status - <span class='fw-300'></span>`);

                ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelect)
                .catch(funcError);
	
			
                ajaxGet('api/informatica/empresa.xsjs')
                    .then(retornoListaEmpresasSelect)
                    .catch(funcError);
                    }
    };
    xmlhttp.open("GET", "financeiro_action_listdescontovendas.html", true);
    xmlhttp.send();
}

function pesq_desconto_vendas() { 

    var idloja = $("#idgrupo").val();
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
        newDataTable('pesqcaixastatus');
        
        $('.dataAtual').text(dataAtual);
      
        return ajaxGet('api/financeiro/lista-caixas-status.xsjs?idEmpresa=34&dataFechamento=2021-07-01')
        .then(retornoListaCaixasStatus)
        .catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "action_pesqremessavenda.html", true);
    xmlhttp.send();
    
}  

function pesq_lista_desconto_vendas(numPage){
    var idgrupo = $("#idgrupo").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    dataRetorno=[];
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
        
        $('.dataAtual').text(dataAtual);
        ajaxGet('api/financeiro/desconto-vendas.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        	.then(retornoListaDescontoVendas)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqdescontovendas.html", true);
    xmlhttp.send();
} 

function chamarProximaListaDescontoVendas(numPage){
    
    var idgrupo = $("#idgrupo").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

    ajaxGet('api/financeiro/desconto-vendas.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        	.then(retornoListaDescontoVendas)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaDescontoVendas(respostaListaDescontoVendas) {
      
    var numPageAtual = parseInt(respostaListaDescontoVendas.page);
   
    if(respostaListaDescontoVendas.data.length != 0){
        for (var i=0; i < respostaListaDescontoVendas.data.length; i++) { 
            contador ++;
            var registro = respostaListaDescontoVendas.data[i];
            nuVenda =  registro['IDVENDA'];
            DTFechamento = registro['DTHORAFECHAMENTO'];
            empresa = registro['NOFANTASIA'];
            NomeCaixa = registro['DSCAIXAFECHAMENTO'];
            NomeOperador = registro['MATOPERADORFECHAMENTO']+' - '+registro['OPERADORFECHAMENTO'];
            valorDinheiro = registro['VRRECDINHEIRO'];
            valorCartao = registro['VRRECCARTAO'];
            valorConvenio = registro['VRRECCONVENIO'];
            valorPos = registro['VRRECPOS'];
            valorVoucher = registro['VRRECVOUCHER'];
            valorTotalVenda = registro['VALORTOTALPRODUTOBRUTO'];
            valorTotalDesconto = registro['VRDESCONTO'];
            ValorTotalDescontoFuncionario = registro['VLTOTALDESCONTOFUNCIONARIO']===null?0:registro['VLTOTALDESCONTOFUNCIONARIO'];
            ValorTotalDescontoCliente = registro['VLTOTALDESCONTOCLIENTE']===null?0:registro['VLTOTALDESCONTOCLIENTE'];
            valorTotalPago = registro['TOTALLIQUIDO'];
            
            dataRetorno.push( [nuVenda,
                                DTFechamento,
                                empresa,
                                NomeCaixa,
                                NomeOperador,
                                valorDinheiro,
                                valorCartao,
                                valorConvenio,
                                valorPos,
                                valorVoucher,
                                valorTotalVenda,
                                ValorTotalDescontoFuncionario,
                                ValorTotalDescontoCliente,
                                valorTotalDesconto,
                                valorTotalPago
                                ]);
        }
        
        chamarProximaListaDescontoVendas(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-lista-desconto-vendas" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th >Venda</th>
                            <th >Data</th>
                            <th >Loja</th>
                            <th >Caixa</th>
                            <th >Operador</th>
                            <th >Vl. Dinheiro</th>
                            <th >Vl. Cartão</th>
                            <th >Vl. Convênio</th>
                            <th >Vl. Pos</th>
                            <th >Vl. Voucher</th>
                            <th >Vl. Bruto</th>
                            <th >Vl. Desconto Func.</th>
                            <th >Vl. Desconto Cliente</th>
                            <th >Vl. Desconto Total</th>
                            <th >Vl. Pago</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListdescontovandas">
                    </tbody>
                    <tfoot id="totalConsolidado"class="thead-themed">
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
                    </tfoot>
                </table>`
        );
	   
	    $('#dt-basic-lista-desconto-vendas').DataTable( {
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
                totalVlDinheiro = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlCartao = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlConvenio = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlPos = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlVoucher = api.column( 9 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlBruto = api.column( 10 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlDescontoFunc = api.column( 11 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlDescontoCliente = api.column( 12 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlDesconto = api.column( 13 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlPago = api.column( 14 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
     
                // Total over this page
                pageTotalVlDinheiro = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlCartao = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlConvenio = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlPos = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlVoucher = api.column(9, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlBruto = api.column( 10, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlDescontoFunc = api.column( 11, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlDescontoCliente = api.column( 12, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlDesconto = api.column( 13, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlPago = api.column( 14, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
                // Update footer
                $( api.column( 5 ).footer() ).html(pageTotalVlDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 6 ).footer() ).html(pageTotalVlCartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlCartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 7 ).footer() ).html(pageTotalVlConvenio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlConvenio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 8 ).footer() ).html(pageTotalVlPos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlPos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 9 ).footer() ).html(pageTotalVlVoucher.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlVoucher.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 10 ).footer() ).html(pageTotalVlBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 11 ).footer() ).html(pageTotalVlDescontoFunc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlDescontoFunc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 12 ).footer() ).html(pageTotalVlDescontoCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlDescontoCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 13 ).footer() ).html(pageTotalVlDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 14 ).footer() ).html(pageTotalVlPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
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

// ========================= INICIO EXTRATO MOVIMENTO BONIFICAÇÃO ===

			
function retornoListaFuncionario(respostaListaFuncionario) {

	for (var i = 0; i < respostaListaFuncionario.data.length; i++) {

		IDFuncionario = respostaListaFuncionario.data[i]['IDFUNCIONARIO'];
		NomeFuncionario = respostaListaFuncionario.data[i]['NOFUNCIONARIO'];
		NuLogin = respostaListaFuncionario.data[i]['NOLOGIN'];
		
		$('#funcionario').append(
			`<option value="` + IDFuncionario + `"> ` + NuLogin + ` - ` + NomeFuncionario + `</option>`
		);
	}
}
			
function ListaExtratoMovimentoBonificacao() {
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

            $("#funcionario").select2();

            $('.DescTituloListaExtratoBonificacao').html(
                `<i class='subheader-icon fal fa-chart-area'></i> Lista Bonificacao - <span class='fw-300'></span>`);
                
            return ajaxGet('api/funcionario/todos.xsjs')
			.then(retornoListaFuncionario)
			.catch(funcError);

        }
    };
    xmlhttp.open("GET", "financeiro_action_listextratomovimentobonificacao.html", true);
    xmlhttp.send();
}

function pesq_extrato_bonificacao(numPage) {
    var IDFuncionarioPesq = $("#funcionario").val();
    saldoAnteriorBonificacao = 0;
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

            ajaxGet('api/financeiro/movimento-saldo-bonificacao.xsjs?pageSize=500&page=' + numPage + '&idFuncionario=' + IDFuncionarioPesq)
                .then(retornoListaExtratoBonificacao)
                .catch(funcError);
        }
    };

    xmlhttp.open("GET", "financeiro_action_pesqextratobonificacao.html", true);
    xmlhttp.send();
}
 
function retornoListaExtratoBonificacao(respostaListaExtratoBonificacao) {
    
    var numPageAtual = parseInt(respostaListaExtratoBonificacao.page);
    
    var indiceUltLinha = respostaListaExtratoBonificacao.rows - 1;
    
        if (respostaListaExtratoBonificacao.data.length > 0)
            saldoAnteriorBonificacao = parseFloat(respostaListaExtratoBonificacao.data[indiceUltLinha]['VRATUAL']);

            $('#resultado').html(
                `<table id="" class="table table-bordered table-hover table-responsive-lg table-striped w-100" width="100%">
                <thead>
                    <tr>
                        <th></th>
                        <th colspan="3">
                            <button type="button" class="btn btn-success" onclick="modal_Cad_Deposito_bonificacao()">
                                <span class="fal fa-plus mr-1"></span>
                                Cadastrar Bonificaçao
                            </button>
                            
                        </th>
                    </tr>                                      
                </thead>
                <tbody >
                    <tr class="table-primary">
                        <td colspan="3" style="text-align:right; font-size: 12px;"><b>Saldo Atual</b></td>
                        <td></td>
                        <td></td>
                        <td></td>                                                    
                        <td style="text-align:right; font-size: 12px;"><b>` + saldoAnteriorBonificacao.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + `</b></td>
                        <td colspan="2"></td>
                    </tr>
                    <tr>
                        <td colspan="9"></td>
                    </tr>
                    <tr>
                        <td colspan="9"></td>
                    
                </tbody>
                <tbody id="resultadoExtratoBonificacao">
                    <tr>
                        <th class="bg-primary-700" style="font-size: 12px;">Dt. Lanç.</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Funcionário</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Tipo Movimento</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Cod. Venda</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Valor Anterior(R$)</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Valor Movimento(R$)</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Saldo(R$)</th>
                        <th class="bg-primary-700" style="font-size: 12px;">Observação</th>
                    </tr>
                </tbody>
                </table>`);

            for (let i = 0; i < respostaListaExtratoBonificacao.data.length; i++) {
                ret = respostaListaExtratoBonificacao.data[i];
                
                dataMovimento = ret['DTMOVIMENTO'];
                codFuncionario = ret['IDFUNCIONARIO'];
                funcionarioResp = ret['IDFUNCIONARIORESP'];
                codMovimentoSaldo = ret['IDMOVIMENTOSALDO'];
                codVenda = ret['IDVENDA'];
                observcao = ret['OBSERVACAO'];
                tipoMovimento = ret['TIPOMOVIMENTO'];
                valorAnterior = ret['VRANTERIOR'];
                valorAtual = ret['VRATUAL'];
                valorMovimento = ret['VRMOVIMENTO'];
                
                if (ret['TIPOMOVIMENTO'] === 'Debito') {
                        $('#resultadoExtratoBonificacao').append(
                            ` <tr class="table-danger">
                                    <td style="font-size: 12px;">` + dataMovimento + `</td>
                                    <td style="font-size: 12px;">` + codFuncionario + `</td>
                                    <td style="font-size: 12px;"><b>` + tipoMovimento + `</b></td>
                                    <td style="font-size: 12px;">` + codVenda + `</td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                    <b>` + mascaraValor(parseFloat(valorAnterior).toFixed(2)) + `</b></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                    <b>` + mascaraValor(parseFloat(valorMovimento).toFixed(2)) + `</b></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-red">
                                    <b>` + mascaraValor(parseFloat(valorAtual).toFixed(2)) + `</b></td>
                                    <td style="font-size: 12px;"><b>` + observcao + `</b></td>
                                </tr>`);
                    
                }
                if (ret['TIPOMOVIMENTO'] === 'Credito') {
                        $('#resultadoExtratoBonificacao').append(
                            ` <tr class="table-success">
                                    <td style="font-size: 12px;">` + dataMovimento + `</td>
                                    <td style="font-size: 12px;">` + codFuncionario + `</td>
                                    <td style="font-size: 12px;"><b>` + tipoMovimento +`</b></td>
                                    <td style="font-size: 12px;"></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-blue">
                                    <b>` + mascaraValor(parseFloat(valorAnterior).toFixed(2)) + `</b></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-blue">
                                    <b>` + mascaraValor(parseFloat(valorMovimento).toFixed(2)) + `</b></td>
                                    <td style="text-align:right; font-size: 12px;" class="txt-color-blue">
                                    <b>` + mascaraValor(parseFloat(valorAtual).toFixed(2)) + `</b></td>
                                    <td style="font-size: 12px;"><b>` + observcao + `</b></td>
                                </tr>`);
                    
                }
                
        }
    
}

function modal_Cad_Deposito_bonificacao() {

    var idfuncBonificacao = $("#funcionario").val();
    var nomeFuncionario = $("#funcionario option:selected").text();

	$.get('action_caddepositobonificacaomodal.html', function(res) {

		$('#resulmodaldepositoBonificacao').html(res);
		$("#cadDepositoBonificacao").modal('show');
		$('#cadDepositoBonificacao').on('shown.bs.modal', function() {
	   		$('#idfuncBonificacao').val(idfuncBonificacao);
           	$('#funcionario_Bonificacao').val(nomeFuncionario);
    		$("#tipoMovimento").select2({
			    dropdownParent: $("#cadDepositoBonificacao")
    		});
    		$("#tipoMovimento").focus();
		});
    })

}

function cadastrar_deposito_bonificacao() {
    
    var depo_idFuncResp = IDFuncionarioLogin;
	var depo_idfuncBonificao = $("#idfuncBonificacao").val();
	var depo_historiodep = $("#DsHistorio").val();
	var depo_tipoMov = $("#tipoMovimento").val();
	var depo_vrdeposito = $("#VrDeposito").val().replace(".", "").replace(",", ".");
	
	
    if(depo_idfuncBonificao==''){
    	$("#resultadodepositoBonificacao").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Funcionário!</div>"
		);
		$("#idfuncBonificacao").focus();
		return false;
    }
    
    if(depo_tipoMov=='0'){
    	$("#resultadodepositoBonificacao").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Tipo Movimento!</div>"
		);
		$("#tipoMovimento").focus();
		return false;
    }

    if ($("#VrDeposito").val() === '' || $("#VrDeposito").val()==='0') {

		$("#resultadodepositoBonificacao").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Valor do Depósito.</div>"
		);
		$("#VrDeposito").focus();
		return false;
	}

    if(depo_historiodep==''){
    	$("#resultadodepositoBonificacao").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Histórico.</div>"
		);
		$("#DsHistorio").focus();
		return false;
    }
    
    if(saldoAnteriorBonificacao < parseFloat($("#VrDeposito").val()) && depo_tipoMov === 'Debito' ){
    	$("#resultadodepositoBonificacao").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Débito não pode ser Maior que o Saldo.</div>"
		);
		$("#VrDeposito").focus();
		return false;
    }
    
    var dados = [{
		"IDFUNCIONARIO": parseInt(depo_idfuncBonificao),
		"TIPOMOVIMENTO": depo_tipoMov,
		"VRMOVIMENTO": parseFloat(depo_vrdeposito),
		"OBSERVACAO": depo_historiodep,
		"IDFUNCIONARIORESP": parseInt(depo_idFuncResp),
	}];

	//console.table(dados);

	ajaxPost("api/financeiro/movimento-saldo-bonificacao.xsjs", dados)
		.then(funcSucessDepositoBonificacao)
		.catch(funcErrorDepositoBonificacao);
		
	const textdados = JSON.stringify(dados);

	textoFuncao = 'FINANCEIRO/CADASTRO DE BONIFICACAO';
		
    var dadosCadBonificacao = [{
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosCadBonificacao)
		.then(funcSucessLog)
		.catch(funcError);
		
}

function funcSucessDepositoBonificacao() {

	alerta_cadastrado_sucesso();
	$("#cadDepositoBonificacao").modal('hide');
	pesq_extrato_bonificacao(1);
}
	
function funcErrorDepositoBonificacao(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessDeposito',
		showConfirmButton: false,
		timer: 15000
	});
}

//? ====================================== INICIO ROTINA VENDA PIX ====================================== //
/*
Autor_Atualização: Hendryw Deyvison
Data_Atualização: 16/07/2025
*/
//? ================ MENU LISTA VENDA PIX ==============================================
async function ListaVendasPIX() {
    try{
        animationLoadingStart();

        $("#resultado").html(`
            <div align="center">
                <button class="btn btn-lg btn-info" type="button" disabled>
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Carregando...</button>
            </div>    
        `);

        await $.get("financeiro_action_listvendaspix.html", (respHtml) => $("#js-page-content").html(respHtml));

        await ajaxGet('api/informatica/grupoempresas.xsjs')
            .then(retornoListaGrupoEmpresasSelect)

        await ajaxGet('api/comercial/empresa.xsjs')
            .then(retornoListaEmpresasSelect)

        $('.DescTituloListaVendas').html(`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas PIX - <span class='fw-300'></span>`)

        $('.dataAtual').text(dataAtual);
        $('#dtconsultainicio, #dtconsultafim').val(dataAtualCampo);

        $("#idgrupo, #idloja").select2();

        animationLoadingStop();
    } catch(error){
        console.log(error);
        msgError();

        $("#resultado").html('');
    }
}

async function pesq_vendas_pix(numPage) {
    try{
        let IDPesqVendaPix = $("#idgrupo").val();
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();
        let listEmpresas = $("#descEmpresas").val();
        let IDLojaPesqVenda = [];

        animationLoadingStart();

        $('#idloja option:selected').each(function (index, el) {
            IDLojaPesqVenda.push($(el).val());
        });
        
        await $.get("financeiro_action_pesqvendaspix.html", (respHtml) => $("#resultado").html(respHtml));

        $('.dataAtual').text(dataAtual);

        await ajaxGetAllData(`api/financeiro/venda-pix-periodo.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPix}&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}&lojas=${IDLojaPesqVenda}&empresasList=${listEmpresas}`, false)
            .then(retornoListaVendasPix);

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function pesq_faturas_pix(numPage) {
    try {
        let IDPesqVendaPix = $("#idgrupo").val();
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();
        let listEmpresas = $("#descEmpresas").val();
        let IDLojaPesqVenda = [];

        animationLoadingStart();

        $('#idloja option:selected').each(function (index, el) {
            IDLojaPesqVenda.push($(el).val());
        });

        await $.get("financeiro_action_pesqfaturaspix.html", (respHtml) => $("#resultado").html(respHtml));

        await ajaxGetAllData(`api/financeiro/fatura-pix-periodo.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPix}&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}&lojas=${IDLojaPesqVenda}&empresasList=${listEmpresas}`, false)
            .then(retornoListaVendasPix);

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaVendasPix(respostaListaVendasPix) {
    let { data } = respostaListaVendasPix || '';
    let dadosTable = [];
    let totalVrRecebidoPix = 0;
    let contadorPix = 0;

    if (data.length != 0) {
        for (let registro of data) {
            let noFantasia = registro?.NOFANTASIA;
            let NVenda = registro?.IDVENDA;
            let TipoPag = registro?.DSTIPOPAGAMENTO;
            let vrRecebidoPix = registro?.PIX;
            let DTVenda = registro?.DATAVENDA;
            let NuAutorizacao = registro?.NUAUTORIZACAO;

            totalVrRecebidoPix += parseFloat(vrRecebidoPix);

            contadorPix++;

            dadosTable.push([
                `<label style="color: blue; font-size: 11px;">${contadorPix}</label>`,
                `<label style="color: blue; font-size: 11px;">${noFantasia}</label>`,
                `<label style="color: blue; font-size: 11px;">${NVenda}</label>`,
                `<label style="color: blue; font-size: 11px;">${TipoPag}</label>`,
                `<label style="color: blue;">${mascaraValor(parseFloat(vrRecebidoPix).toFixed(2))}</label>`,
                `<label style="color: blue; font-size: 11px;">${DTVenda}</label>`,
                `<label style="color: blue; font-size: 11px;">${NuAutorizacao}</label>`,
            ])

        }

    }

    $('#totalResultadoVendaPixPeriodo').html(
        `<tr>
            <th colspan="4" style="text-align: center;">Total</th>
            <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2))}</th>
            <th colspan="2" style="text-align: center;"></th>
        </tr>
    `);

    $('#dt-basic-vendapix').DataTable({
        data: dadosTable,
        deferRender: true,
        paging: true,
        displayLength: 50,
        ordering: true,
        responsive: true,
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [{
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
            action: async function (e, dt, button, config) {
                try {
                    animationLoadingStart('Exportando dados...', 1);

                    setTimeout(async () => {
                        await $.fn.dataTable.ext.buttons.excelHtml5.action.call(this, e, dt, button, config)
                        animationLoadingStop();
                    }, 50)
                } catch (error) {
                    animationLoadingStop();
                }
            },
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
            text: 'Imprimir',
            titleAttr: 'Imprimir Tabela',
            className: 'btn-outline-primary btn-sm'
        }

        ]

    })//.draw();

}

function retornoListaFaturaPix(respostaListaFaturaPix) {
    let { data } = respostaListaFaturaPix || '';
    let dadosTable = [];
    let totalVrFaturaRecebidoPix = 0;
    let contadorFatPix = 0;

    if (data.length > 0) {
        for (let registro of data) {
            let noFantasiaFat = registro?.NOFANTASIA;
            let NFaturaPix = registro?.NUCODAUTORIZACAO;
            let NoRecebedorFatPix = registro?.NOFUNCIONARIO;
            let vrRecebidoFatPix = registro?.VRRECEBIDO;
            let DTFaturaPix = registro?.DTPROCESSAMENTO;
            let NuAutorizacaoFat = registro?.NUAUTORIZACAO;
            let StAtivoFatPix = registro?.STCANCELADO;
            let StAtivoFatPix1 = 'Ativo';

            totalVrFaturaRecebidoPix += parseFloat(vrRecebidoFatPix);

            contadorFatPix++;

            if (StAtivoFatPix == 'True') {
                StAtivoFatPix1 = 'Cancelado';
            }

            dadosTable.push([
                `<label style="color: blue; font-size: 11px;">${contadorFatPix}</label>`,
                `<label style="color: blue; font-size: 11px;">${noFantasiaFat}</label>`,
                `<label style="color: blue; font-size: 11px;">${DTFaturaPix}</label>`,
                `<label style="color: blue; font-size: 11px;">${NFaturaPix}</label>`,
                `<label style="color: blue;">${mascaraValor(parseFloat(vrRecebidoFatPix).toFixed(2))}</label>`,
                `<label style="color: blue; font-size: 11px;">${NoRecebedorFatPix}</label>`,
                `<label style="color: blue; font-size: 11px;">${NuAutorizacaoFat}</label>`,
                `<label style="color: blue; font-size: 11px;">${StAtivoFatPix1}</label>`,
            ])

        }

    }

    $('#totalResultadoFaturaPixPeriodo').html(`
        <tr>
            <th colspan="4" style="text-align: center;">Total</th>
            <th style="text-align: right;">${mascaraValor(parseFloat(totalVrFaturaRecebidoPix).toFixed(2))}</th>
            <th colspan="3" style="text-align: center;"></th>
        </tr>
    `);

    $('#dt-basic-faturapix').DataTable({
        data: dadosTable,
        deferRender: true,
        paging: true,
        displayLength: 50,
        ordering: true,
        responsive: true,
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [{
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
            action: async function (e, dt, button, config) {
                try {
                    animationLoadingStart('Exportando dados...', 1);

                    setTimeout(async () => {
                        await $.fn.dataTable.ext.buttons.excelHtml5.action.call(this, e, dt, button, config)
                        animationLoadingStop();
                    }, 50)
                } catch (error) {
                    animationLoadingStop();
                }
            },
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
            text: 'Imprimir',
            titleAttr: 'Imprimir Tabela',
            className: 'btn-outline-primary btn-sm'
        }

        ]

    });
}

async function pesq_vendas_pix_consolidado(numPage) {
    let IDPesqVendaPixConsolid = $("#idgrupo").val();
    let datapesqinicioConsolid = $("#dtconsultainicio").val();
    let datapesqfimConsolid = $("#dtconsultafim").val();

    try{
        animationLoadingStart();

        await $.get("financeiro_action_pesqvendaspixconsolidado.html", (respHtml)=>$('#resultado').html(respHtml));

        await ajaxGetAllData(`api/financeiro/venda-pix-consolidado.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPixConsolid}&dataPesquisaInicio=${datapesqinicioConsolid}&dataPesquisaFim=${datapesqfimConsolid}`, false)
            .then(retornoListaVendasPixConsolidado);

        $('.dataAtual').text(dataAtual);

        animationLoadingStop();
    } catch(error){
        console.log(error);
        msgError();
    }
}

function retornoListaVendasPixConsolidado(respostaListaVendasPixConsolidado) {
    let { data } = respostaListaVendasPixConsolidado || '';
    let totalVrRecebidoPixConsolidado = 0;
    let contadorPixConsolidado = 0;

    if (data.length != 0) {
        for (let registro of data) {
            let DsSubGrupoConsolidado = registro?.DSSUBGRUPOEMPRESARIAL;
            let vrRecebidoPixConsolidado = registro?.PIX;

            totalVrRecebidoPixConsolidado += parseFloat(vrRecebidoPixConsolidado);

            contadorPixConsolidado++;

            $('#resultadoVendaPixPeriodoadoado').append(`
                <tr>
                    <td><label style="color: blue; font-size: 11px;">${contadorPixConsolidado}</label></td>
                    <td><label style="color: blue; font-size: 11px;">${DsSubGrupoConsolidado}</label></td>
                    <td style="text-align: right;"><label style="color: blue;">${mascaraValor(parseFloat(vrRecebidoPixConsolidado).toFixed(2))}</label></td>
                </tr>
            `);

            $('#totalResultadoVendaPixConsolidado').html(`
                <tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPixConsolidado).toFixed(2))}</th>
                </tr>
            `);
        }

    }

    $('#dt-basic-vendapixconsolidado').DataTable({
        deferRender: true,
        paging: false,
        ordering: false,
        responsive: true,
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [{
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
            text: 'Imprimir',
            titleAttr: 'Imprimir Tabela',
            className: 'btn-outline-primary btn-sm'
        }

        ]

    });
}

async function pesq_faturas_pix_consolidado() {
    let IDPesqVendaPixConsolidado = $("#idgrupo").val();
    let datapesqinicioConsolidado = $("#dtconsultainicio").val();
    let datapesqfimConsolidado = $("#dtconsultafim").val();

    try {
        animationLoadingStart();

        await $.get("financeiro_action_pesqfaturaspixconsolidado.html", (respHtml) => $('#resultado').html(respHtml));

        await ajaxGetAllData(`api/financeiro/fatura-pix-periodo-consolidado.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPixConsolidado}&dataPesquisaInicio=${datapesqinicioConsolidado}&dataPesquisaFim=${datapesqfimConsolidado}`, false)
            .then(retornoListaFaturaPixConsolidado);

        $('.dataAtual').text(dataAtual);

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaFaturaPixConsolidado(respostaListaFaturaPixConsolidado) {
    let { data } = respostaListaFaturaPixConsolidado || '';
    let totalVrFaturaRecebidoPixConsolidado = 0;
    let contadorFatPixConsolidado = 0;

    if (data.length != 0) {
        for (let registro of data) {
            let DsSubGrupoFatConsolid = registro?.DSSUBGRUPOEMPRESARIAL;
            let VrRecebidoFatConsolid = registro?.VRRECEBIDO;

            totalVrFaturaRecebidoPixConsolidado += parseFloat(VrRecebidoFatConsolid);

            contadorFatPixConsolidado++;

            $('#resultadoFaturaPixPeriodoConsolidado').append(`
                <tr>
                    <td><label style="color: blue; font-size: 11px;">${contadorFatPixConsolidado}</label></td>
                    <td><label style="color: blue; font-size: 11px;">${DsSubGrupoFatConsolid}</label></td>
                    <td style="text-align: right;"><label style="color: blue;">${mascaraValor(parseFloat(VrRecebidoFatConsolid).toFixed(2))}</label></td>
                </tr>
            `);

            $('#totalResultadoFaturaPixConsolidado').html(`
                <tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right;">${mascaraValor(parseFloat(totalVrFaturaRecebidoPixConsolidado).toFixed(2))}</th>
                </tr>
            `);
        }

    }

    $('#dt-basic-faturapixconsolidado').DataTable({
        deferRender: true,
        paging: false,
        ordering: false,
        responsive: true,
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [{
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
            text: 'Imprimir',
            titleAttr: 'Imprimir Tabela',
            className: 'btn-outline-primary btn-sm'
        }

        ]

    });
}

async function pesq_vendas_pix_consolidado_lojas(numPage) {
    let IDPesqVendaPixConsolid = $("#idgrupo").val();
    let datapesqinicioConsolid = $("#dtconsultainicio").val();
    let datapesqfimConsolid = $("#dtconsultafim").val();
    let listEmpresas = $("#descEmpresas").val();
    let IDLojaPesqVenda = [];
    
    try {
        animationLoadingStart();
        
        $('#idloja option:selected').each(function (index, el) {
            IDLojaPesqVenda.push($(el).val());
        });

        await $.get("financeiro_action_pesqvendaspixconsolidadoloja.html", (respHtml) => $('#resultado').html(respHtml));

        await ajaxGetAllData(`api/financeiro/venda-pix-consolidado-loja.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPixConsolid}&dataPesquisaInicio=${datapesqinicioConsolid}&dataPesquisaFim=${datapesqfimConsolid}&lojas=${IDLojaPesqVenda}&empresasList=${listEmpresas}`, false)
            .then(retornoListaVendasPixConsolidadoLojas);

        $('.dataAtual').text(dataAtual);

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaVendasPixConsolidadoLojas(respostaListaVendasPixConsolidadoLojas) {
    let { data } = respostaListaVendasPixConsolidadoLojas || '';
    let totalVrRecebidoPixConsolidlojas = 0;
    let contadorPixConsolidlojas = 0;

    if (data.length != 0) {
        for (let registro of data) {
            
            let DsEmpresaConsolidadoLoja = registro?.NOFANTASIA;
            let vrRecebidoPixConsolidadoLoja = registro?.PIX;
            
            totalVrRecebidoPixConsolidlojas += parseFloat(vrRecebidoPixConsolidadoLoja);
            
            contadorPixConsolidlojas++;

            $('#resultadoVendaPixPeriodoConsolidadoLoja').append(`
                <tr>
                    <td><label style="color: blue; font-size: 11px;">${contadorPixConsolidlojas}</label></td>
                    <td><label style="color: blue; font-size: 11px;">${DsEmpresaConsolidadoLoja}</label></td>
                    <td style="text-align: right;"><label style="color: blue;">${mascaraValor(parseFloat(vrRecebidoPixConsolidadoLoja).toFixed(2))}</label></td>
                </tr>
            `);

            $('#totalResultadoVendaPixConsolidadoLoja').html(`
                <tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPixConsolidlojas).toFixed(2))}</th>
                </tr>
            `);
        }

    }

    $('#dt-basic-vendapixconsolidadoloja').DataTable({
        deferRender: true,
        paging: false,
        ordering: false,
        responsive: true,
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [{
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
            text: 'Imprimir',
            titleAttr: 'Imprimir Tabela',
            className: 'btn-outline-primary btn-sm'
        }

        ]

    });
}

function pesq_faturas_pix_consolidado_lojas(numPage) {

    var IDPesqVendaPixConsolid = $("#idgrupo").val();
    var datapesqinicioConsolid = $("#dtconsultainicio").val();
    var datapesqfimConsolid = $("#dtconsultafim").val();
    var listEmpresas = $("#descEmpresas").val();

    var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });

    contadorPixConsolidlojas = 0;
    totalVrRecebidoPixConsolidlojas = 0;

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

            ajaxGetAllData('api/financeiro/fatura-pix-consolidado-loja.xsjs?pageSize=1000&page=' + numPage + '&idMarca=' + IDPesqVendaPixConsolid + '&dataPesquisaInicio=' + datapesqinicioConsolid + '&dataPesquisaFim=' + datapesqfimConsolid + '&lojas=' + IDLojaPesqVenda + '&empresasList=' + listEmpresas, 'Carregando Dados...')
                .then(retornoListaFaturaPixConsolidadoLojas)
                .catch(funcError);
        }
    };

    xmlhttp.open("GET", "financeiro_action_pesqfaturaspixconsolidadoloja.html", true);
    xmlhttp.send();
}

function retornoListaFaturaPixConsolidadoLojas(respostaListaVFaturaPixConsolidadoLojas) {
    let { data } = respostaListaVFaturaPixConsolidadoLojas || '';
    let totalVrRecebidoPixConsolidlojas = 0;
    let contadorPixConsolidlojas = 0;
    
    if (data.length != 0) {
        for (let registro of data) {
            let DsEmpresaConsolidadoLoja = registro?.NOFANTASIA;
            let vrRecebidoPixConsolidadoLoja = registro?.VRRECEBIDO;
            
            totalVrRecebidoPixConsolidlojas += parseFloat(vrRecebidoPixConsolidadoLoja);
            
            contadorPixConsolidlojas++;

            $('#resultadoFaturaPixPeriodoConsolidadoLoja').append(`
                <tr>
                    <td><label style="color: blue; font-size: 11px;">${contadorPixConsolidlojas}</label></td>
                    <td><label style="color: blue; font-size: 11px;">${DsEmpresaConsolidadoLoja}</label></td>
                    <td style="text-align: right;"><label style="color: blue;">${mascaraValor(parseFloat(vrRecebidoPixConsolidadoLoja).toFixed(2))}</label></td>
                </tr>
            `);

            $('#totalResultadoFaturaPixConsolidadoLoja').html(`
                <tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPixConsolidlojas).toFixed(2))}</th>
                </tr>
            `);
        }

    }

    $('#dt-basic-faturapixconsolidadoloja').DataTable({
        deferRender: true,
        paging: false,
        ordering: false,
        responsive: true,
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [{
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
            text: 'Imprimir',
            titleAttr: 'Imprimir Tabela',
            className: 'btn-outline-primary btn-sm'
        }

        ]

    });
}

//? ====================================== FIM ROTINA VENDA PIX ====================================== //

//? ====================================== INICIO ROTINA VENDA PIX/DTW ====================================== //
/*
Autor_Atualização: Hendryw Deyvison
Data_Atualização: 16/07/2025
*/
function selecionarTodosPagamentosPix(element) {
    let id = $(element).attr('id');
    let label = $(`label[for='${id}']`);
    let stChecked = $(element).prop('checked');
    let tabela = $('#dt-basic-vendaspix-dtw').DataTable();

    label.text(stChecked ? 'Desmarcar Todos' : 'Marcar Todos');

    if (stChecked) {
        Swal.fire({
            type: 'question',
            title: 'Selecione o modo de seleção',
            text: 'Deseja selecionar todos da tabela ou somente o que está em tela?',
            showConfirmButton: true,
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: 'Todos os registros',
            cancelButtonText: 'Apenas o que está tela',
            cancelButtonColor: '#2196F3',
            allowOutsideClick: false,
        })
            .then((resp) => {
                if (resp.value) {
                    tabela.rows().every(function () {
                        let linhaTabela = $(this.node())
                        $row = linhaTabela;

                        linhaTabela.find("input[name='chkPgtoPixVenda']").prop('checked', stChecked).trigger('change');
                    });
                } else if (resp.dismiss == 'cancel') {
                    $("input[name='chkPgtoPixVenda']").prop('checked', stChecked).trigger('change');
                } else {
                    $(element).prop('checked', false);
                }
            })
    } else {
        tabela.rows().every(function () {
            let linhaTabela = $(this.node())
            $row = linhaTabela;

            linhaTabela.find("input[name='chkPgtoPixVenda'").prop('checked', stChecked).trigger('change');
        });
    }
}

async function ListaVendasPIXDTW() {
    try{
        animationLoadingStart();

        await $.get("financeiro_action_listvendaspix_dtw.html", (respHtml) => $('#js-page-content').html(respHtml));
        
        await ajaxGetAllData('api/conta-banco.xsjs', false).then(retornoListaContaBancoSelect);

        await ajaxGetAllData('api/informatica/grupoempresas.xsjs', false).then(retornoListaGrupoEmpresasSelect);
        
        $('.dataAtual').text(dataAtual);
        $('#dtconsultainicio, #dtconsultafim, #dtcompinicio, #dtcompfim').val(dataAtualCampo);
        $("#idgrupo, #idcontabanco").select2().focus();

        animationLoadingStop();

    } catch(error){
        console.log(error);
        msgError();
    }
}

async function pesq_vendas_pix_periodo(numPage) {
    let IDPesqVendaPix = $("#idgrupo").val();
    let datapesqinicio = $("#dtconsultainicio").val();
    let datapesqfim = $("#dtconsultafim").val();
    let listEmpresas = $("#descEmpresas").val();
    let IDLojaPesqVenda = [];

    try {
        animationLoadingStart();

        $('#idloja option:selected').each(function (index, el) {
            IDLojaPesqVenda.push($(el).val());
        });

        await $.get("financeiro_action_pesqvendaspixperiodo.html", (respHtml) => $("#resultado").html(respHtml));

        await ajaxGetAllData(`api/financeiro/venda-pix-periodo.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPix}&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}&lojas=${IDLojaPesqVenda}&empresasList=${listEmpresas}`, false)
            .then(retornoListaVendasPixPeriodo);

        $('#btnIntegrarTodosPagamentosPix').addClass('d-none');

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaVendasPixPeriodo(respostaListaVendasPixPeriodo) {
    let { data } = respostaListaVendasPixPeriodo || '';
    let dataRetornoVendasPix = [];
    let totalVrRecebidoPix = 0;

    if (data.length != 0) {
        for (let registro of data) {
            let idVenda = registro.IDVENDA;
            let idEmpresa = registro.NOFANTASIA.substring(1, 5);
            let noFantasia = registro.NOFANTASIA;
            let TipoPag = registro.DSTIPOPAGAMENTO;
            let vrRecebidoPix = registro.PIX;
            let DTVenda = registro.DATAVENDA;
            let NuAutorizacao = registro.NUAUTORIZACAO;
            let dataCompensacao = registro.DATA_COMPENSACAO;
            let tagBTN = `<div><input type="checkbox" title="Confirmar Conferência" id="${idVenda}" onclick="status_confirmar_DataCompensacao(this.id, 'True', this)" /></div>`;

            totalVrRecebidoPix += parseFloat(vrRecebidoPix);

            dataRetornoVendasPix.push([
                idEmpresa,
                noFantasia,
                idVenda,
                TipoPag,
                vrRecebidoPix,
                DTVenda,
                dataCompensacao ? dataCompensacao : 'NÃO INFORMADO',
                NuAutorizacao,
                tagBTN,
            ])

        }

        $('#resultadoVendaPixPeriodo').html(`
            <table id="dt-basic-vendaspix" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>ID Loja</th>
                        <th width="15%">Loja</th>
                        <th>Venda</th>
                        <th>Tipo</th>
                        <th>Vr PIX</th>
                        <th>Data</th>
                        <th>Data Compensação</th>
                        <th>Autorização</th>
                        <th>Opções </br> <input type="checkbox" class="selectAll" onclick="toggleSelectAll(this)" /></th>
                    
                    </tr>
                </thead>
                <tbody id="resultadoVendaPixPeriodo">
                </tbody> 
                <tfoot id="totalResultadoVendaPixPeriodo" class="thead-themed">
                </tfoot>
            </table>
        `);

        $('.selectAll').on('click', function () {
            let rows = $('#dt-basic-vendaspix').DataTable().rows({ 'search': 'applied' }).nodes();
            $('input[type="checkbox"]', rows).prop('checked', this.checked);
        });

        $('#dt-basic-vendaspix').DataTable({
            data: dataRetornoVendasPix,
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

                },
                {
                    extend: 'csvHtml5',
                    text: 'Csv',
                    titleAttr: 'Generate Csv',
                    fieldSeparator: ',',
                    title: 'Vendas_Para_Conciliar',
                    charset: 'UTF-8',
                    bom: true,
                    className: 'btn-outline-info btn-sm',


                },
                {
                    extend: 'print',
                    text: 'Print',
                    titleAttr: 'Print Table',
                    className: 'btn-outline-primary btn-sm'
                }
            ]
        });

        $('#totalResultadoVendaPixPeriodo').html(`
            <tr>
                <th colspan="4" style="text-align: center;">Total</th>
                <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2))}</th>
                <th colspan="4" style="text-align: center;"></th>
            </tr>
        `);
    }
}

function toggleSelectAll(source) {
    let selectedIds = [];
    let checkboxes = document.querySelectorAll('#dt-basic-vendaspix input[type="checkbox"]');

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i] !== source) {
            checkboxes[i].checked = source.checked;
            if (source.checked) {
                selectedIds.push(checkboxes[i].id);
            }
        }
    }

    if (selectedIds.length > 0) {
        status_confirmar_DataCompensacao(selectedIds, 'True', source);
    }
}

function status_confirmar_DataCompensacao(ids, status, source) {
    if (typeof ids === 'string') {
        ids = [ids];
    }

    Swal.fire({
        title: 'Confirma a Conferência Venda data Compensação?<br>Informe a Data de Compensação',
        html: '<input type="date" id="dtcompensacao" name="DTCompensacao" class="form-control" value="" >',
        showCloseButton: true,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
    }).then((result) => {

        if (result.value) {
            var dtCompensacao = document.getElementById('dtcompensacao').value;

            var dados = ids.map(id => ({
                "IDVENDA": id,
                "STCONFERIDO": status,
                "DATA_COMPENSACAO": dtCompensacao
            }));

            ajaxPut("api/financeiro/venda-pix-periodo-status-conferido.xsjs", dados)
                .then(funcSucessUpdateConferidoDTCompensacao)
                .catch(funcErrorUpdateConferidoDTCompensacao);

            var textdados = JSON.stringify(dados);
            var textoFuncao = status === 'True' ? 'FINANCEIRO/CONFIRMADA CONFERENCIA DA VENDA' : 'FINANCEIRO/DESCONFIRMADO CONFERENCIA DA VENDA';
            var dadosConfirmaDep = [{
                "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                "PATHFUNCAO": textoFuncao,
                "DADOS": textdados,
                "IP": ipCliente
            }];

            ajaxPost("api/log-web.xsjs", dadosConfirmaDep)
                .then(funcSucessLog)
                .catch(funcError);
        } else {
            if ($(source).hasClass('selectAll')) {
                $(source).click();
            } else {
                source.checked = false;
            }

            console.log('Ação cancelada pelo usuário.');
        }
    });
}

function alerta_dados_vendasPixDTW() {
    Swal.fire({
        type: "error",
        title: "Informe as Datas Compensação para a pesquisa",
        showConfirmButton: false,
        timer: 2000
    });
}

async function pesq_vendas_pix_dtw() {
    let IDPesqVendaPix = $("#idgrupo").val();
    let IDLojaPesqVenda = $("#idloja").val();
    let listEmpresas = $("#descEmpresas").val();
    let dataCompInicio = $('#dtcompinicio').val();
    let dataCompFim = $('#dtcompfim').val();

    try{
        animationLoadingStart();

        await $.get("financeiro_action_pesqvendaspix_dtw.html", (respHtml) => $('#resultado').html(respHtml));

        await ajaxGetAllData(`api/financeiro/venda-pix-periodo.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPix}&dataCompInicio=${dataCompInicio}&dataCompFim=${dataCompFim}&lojas=${IDLojaPesqVenda}&empresasList=${listEmpresas}`, false)
            .then(retornoListaVendasPixDTW);

        animationLoadingStop();
    } catch(error){
        console.log(error);
        msgError();
    }
}

async function retornoListaVendasPixDTW(respostaListaVendasPix) {
    let { data } = respostaListaVendasPix || '';
    let dataRetornoVendasPixDTW = [];
    let totalVrRecebidoPix = 0;

    if (data.length != 0) {
        $('#btnIntegrarTodosPagamentosPix').removeClass('d-none')

        for (let registro of data) {
            let contaDebitoSap = '1.01.01.02.0003';
            let contaCreditoSap = '1.01.01.01.9998';

            let idVenda = registro.IDVENDA; // Pegando o IDVENDA como referência para o botão
            
            let idVendaPagamento = registro.IDVENDAPAGAMENTO;
            let dataCompensacao = registro.DATA_COMPENSACAO;
            let idEmpresa = registro.NOFANTASIA.substring(1, 5)
            let noFantasia = registro.NOFANTASIA;
            let NVenda = registro.IDVENDA;
            let TipoPag = registro.DSTIPOPAGAMENTO;
            let vrRecebidoPix = registro.PIX;
            let DTVenda = registro.DATAVENDA;
            let NuAutorizacao = registro.NUAUTORIZACAO;
            let erroLogIntegracao = registro.ERROR_LOG_SAP_PIX || '';
            let docEntryContasReceber = Number(registro.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX);
            let stEmFilaParaIntegracao = registro.STATUS_BLOQUEIO_ATUALIZACAO == 'True';
            let caixaSelecao = `
                <div class="custom-control custom-checkbox">
                    <input id="${idVendaPagamento}" type="checkbox" class="custom-control-input" name="chkPgtoPixVenda" onchange="selecionarLinhaTable(this)">
                    <label class="custom-control-label" for="${idVendaPagamento}"></label>
                </div>
            `;

            let btnIntegrar = `
                <button type="button" class="btn btn-info btn-xs mr-2" title="Integrar Conciliação" onclick="integrarPagamentoPixNoSAP('${idVendaPagamento}');">
                    <span class="fal fa-cloud-upload mr-1"></span>Integrar
                </button>
            `;

            let htmlSelecao = caixaSelecao;
            let htmlStatusIntegracao = `<label class="text-info fw-900" style="font-size: 12px;"><b>Pronto para Integração</b></label>`;
            let htmlOpcaoBtns = '';
            let btnStatus = '';

            if (docEntryContasReceber == 0) {
                if (stEmFilaParaIntegracao) {
                    btnStatus = `
                        <button type="button" class="btn btn-primary btn-xs  mr-2" title="Visualizar Status Integração PIX" onclick="msgInfo('Em Processo de Integração, Aguarde...', 'Motivo: Já está em processo de integração no SAP');">
                            <span class="fal fa-eye mr-1"></span>Status
                        </button>
                    `;

                    btnIntegrar = '';

                    htmlStatusIntegracao = `<label class="text-primary cursor-pointer fw-900" style="font-size: 12px;" title='Aguardando na Fila de Integração'><b>Aguardando na Fila de Integração</b></label>`;
                } else {
                    if (erroLogIntegracao?.length > 0) {
                        erroLogIntegracao = await translateText(erroLogIntegracao.replaceAll("'", '').replaceAll(';', ' '));

                        htmlStatusIntegracao = `<label class="text-danger cursor-pointer fw-900" style="font-size: 12px;" title='${erroLogIntegracao}'><b>Error ao integrar</b></label>`;

                        btnStatus = `
                            <button type="button" class="btn btn-primary btn-xs  mr-2" title="Visualizar Status Integração Conciliação" onclick="msgWarning('Erro ao integrar no SAP', 'Motivo: ${erroLogIntegracao}');">
                                <span class="fal fa-eye mr-1"></span>Status
                            </button>
                        `;
                    }
                }

                htmlOpcaoBtns = `
                    <div class="d-flex justify-content-center">
                        ${btnStatus}
                        ${btnIntegrar}
                    </div>
                `;
            } else {
                htmlSelecao = '';
                htmlOpcaoBtns = '';

                htmlStatusIntegracao = `<label class="text-success fw-900" style="font-size: 12px;"><b>Integrado</b></label>`;
            }

            totalVrRecebidoPix += parseFloat(vrRecebidoPix);

            dataRetornoVendasPixDTW.push([
                htmlSelecao,
                idEmpresa,
                noFantasia,
                NVenda,
                TipoPag,
                vrRecebidoPix,
                DTVenda,
                NuAutorizacao,
                dataCompensacao ? dataCompensacao : 'NÃO INFORMADO',
                contaCreditoSap,
                contaDebitoSap,
                htmlStatusIntegracao,
                htmlOpcaoBtns
            ]);
        }
    }

    $('#resultadoVendaPixPeriodoDTW').html(`
        <table id="dt-basic-vendaspix-dtw" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th>Seleção</th>
                    <th>ID Loja</th>
                    <th width="15%">Loja</th>
                    <th>Venda</th>
                    <th>Tipo</th>
                    <th>Vr PIX</th>
                    <th>Data</th>
                    <th>Autorização</th>
                    <th>Data Compensação</th>
                    <th>Conta Crédito</th>
                    <th>Conta Débito</th>
                    <th>Situação</th>
                    <th>Opções</th>
                </tr>
            </thead>
            <tbody id="resultadoVendaPixPeriodoDTW"></tbody>
            <tfoot id="totalResultadoVendaPixPeriodoDTW" class="thead-themed"></tfoot>
        </table>
    `);

    $('#dt-basic-vendaspix-dtw').DataTable({
        data: dataRetornoVendasPixDTW,
        deferRender: false,
        responsive: false,
        scrollX: true,
        dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12 caixa-selecao'>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        initComplete: function () {
            $('.caixa-selecao').html(`
                <div id="chkMarcaTodos" class="mb-1 ${dataRetornoVendasPixDTW.length > 0 ? '' : 'd-none'}">
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" id="selectAllPgtoPix" class="custom-control-input" onclick="selecionarTodosPagamentosPix(this)">
                        <label class="custom-control-label" for="selectAllPgtoPix">Marcar Todos</label>
                    </div>
                </div>
            `);
        },
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
                filename: 'Relatório de Pix Compensados',
                title: 'Relatório de Pix Compensados',
                className: 'btn-outline-success btn-sm mr-1',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    format: {
                        body: function (data, row, column, node) {
                            if (column === 5 || column === 7) {
                                return formatarData(data);
                            }
                            if (column === 4) {
                                return parseFloat(data.toString().replace('.', ','));
                            }

                            return data;
                        }
                    }
                }
            },
            {
                extend: 'csvHtml5',
                text: 'Csv',
                titleAttr: 'Generate Csv',
                fieldSeparator: ',',
                title: 'Vendas_Para_Conciliar',
                charset: 'UTF-8',
                bom: true,
                className: 'btn-outline-info btn-sm',
                exportOptions: {
                    format: {
                        body: function (data, row, column, node) {
                            if (column === 5 || column === 7) {
                                return formatarData(data);
                            }
                            if (column === 4) {
                                return parseFloat(data.toString().replace('.', ','));
                            }

                            return data;
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

    $('#totalResultadoVendaPixPeriodoDTW').html(`
        <tr>
            <th colspan="4" style="text-align: center;">Total</th>
            <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2))}</th>
            <th colspan="5" style="text-align: center;"></th>
        </tr>
    `);
}

function integrarTodosPagamentosPixNoSAP() {
    let dados = [];

    msgQuestion('Certeza que Deseja Integrar todos os Pagamentos PIX selecionados no SAP?')
        .then(async (respQuestion) => {
            try {
                if (respQuestion.value == true) {
                    let tabela = $('#dt-basic-vendaspix-dtw').DataTable();

                    animationLoadingStart('Integrando PIX...', 100, false);

                    tabela.rows().every(function () {
                        let linhaTabela = $(this.node())
                        let chkLine = linhaTabela.find("input[name='chkPgtoPixVenda']:checked") || false;

                        if ($(chkLine).prop('checked')) {
                            let idVendaPagamento = $(chkLine).attr('id');

                            dados.push({
                                "IDVENDAPAGAMENTO": idVendaPagamento
                            })
                        }
                    });
                    //   return console.log('FOi: ', dados)
                    if (dados.length <= 0) {
                        return msgInfo('Nenhum registro selecionado!', 'Verifique e tente novamente!')
                    }

                    let textdados = JSON.stringify(dados);
                    let textoFuncao = 'FINANCEIRO/INTEGRACAO TODOS OS PAGAMENTOS PIX DE VENDA';
                    let dadosLog = [{
                        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                        "PATHFUNCAO": textoFuncao,
                        "DADOS": textdados,
                        "IP": ipCliente
                    }];

                    let msgRetorno = '';
                    let text = '';

                    //return console.log('PIX: ', dados) 

                    await ajaxPost('api/service-layer/pagamentos/jobs/pix-integracao.xsjs', dados)
                        .catch((error) => {

                            if (error?.status !== 400) {
                                msgRetorno = 'Tempo de processamento em tela expirado!';
                                text = 'As integrações continuarão em segundo plano, para verificar status, pesquise novamente!'
                                return;
                            } else {
                                throw new Error(error);
                            }
                        });

                    await ajaxPost("api/log-web.xsjs", dadosLog).catch((error) => { throw new Error(error) });

                    msgRetorno.length > 0 ? await msgInfo(msgRetorno, text, false) : await msgSuccess('Integrado com sucesso!');

                    pesq_conciliar_banco();
                }
            } catch (error) {
                console.log(error);
                msgError('Erro ao enviar os dados');
            }
        })
}

function integrarPagamentoPixNoSAP(idVendaPagamento) {
    msgQuestion('Certeza que Deseja Integrar o PIX no SAP?')
        .then(async (respQuestion) => {
            try {
                if (respQuestion.value == true) {
                    animationLoadingStart('Integrando o PIX...', 100, false);

                    let dados = [{
                        "IDVENDAPAGAMENTO": idVendaPagamento
                    }];

                    let textdados = JSON.stringify(dados);
                    let textoFuncao = 'FINANCEIRO/INTEGRACAO DO PAGAMENTO PIX VENDA';
                    let dadosLog = [{
                        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                        "PATHFUNCAO": textoFuncao,
                        "DADOS": textdados,
                        "IP": ipCliente
                    }];

                    let msgRetorno = '';
                    let text = '';

                    await ajaxPost(`api/service-layer/pagamentos/jobs/pix-integracao.xsjs?`, dados)
                        .catch((error) => {

                            if (error?.status !== 400) {
                                msgRetorno = 'Tempo de processamento em tela expirado!';
                                text = 'As integrações continuarão em segundo plano, para verificar status, pesquise novamente!'
                                return;
                            } else {
                                throw new Error(error);
                            }
                        });

                    await ajaxPost("api/log-web.xsjs", dadosLog).catch((error) => { throw new Error(error) });

                    msgRetorno.length > 0 ? await msgInfo(msgRetorno, text, false) : await msgSuccess('Integrado com sucesso!');

                    pesq_vendas_pix_dtw();
                }
            } catch (error) {
                console.log(error);
                msgError('Erro ao enviar os dados');
            }
        })
}

async function pesq_vendas_pix_capa_dtw() {
    let IDPesqVendaPix = $("#idgrupo").val();
    let IDLojaPesqVenda = $("#idloja").val();
    let listEmpresas = $("#descEmpresas").val();
    let dataCompInicio = $('#dtcompinicio').val();
    let dataCompFim = $('#dtcompfim').val();

    try{
        animationLoadingStart();

        await $.get("financeiro_action_pesqvendaspix_capa_dtw.html", (respHtml=>$('#resultado').html(respHtml)));

        await ajaxGetAllData(`api/financeiro/venda-pix-periodo.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPix}&dataCompInicio=${dataCompInicio}&dataCompFim=${dataCompFim}&lojas=${IDLojaPesqVenda}&empresasList=${listEmpresas}`, false)
            .then(retornoListaVendasPixCapaDTW);

        $('#btnIntegrarTodosPagamentosPix').addClass('d-none');

        animationLoadingStop();
    }catch(error){
        console.log(error);
        msgError();
    }
}

function formatMesAno(dateStr) {
    const [day, month, year] = dateStr.split("/");
    return `${month}/${year}`;
}

function retornoListaVendasPixCapaDTW(respostaListaVendasPixCapaDTW) {
    let { data } = respostaListaVendasPixCapaDTW || '';
    let dataRetornoVendasPixCapa = [];
    let totalVrRecebidoPix = 0;
    let contadorPixCapa = 0;

    if (data.length != 0) {
        for (let registro of data) {
            let dataCompensacao = registro.DATA_COMPENSACAO;
            let noFantasia = registro.NOFANTASIA;
            let Vendas = "Vendas";
            let resultado = Vendas + " " + registro.DSTIPOPAGAMENTO + " " + formatMesAno(dataCompensacao);
            let vrRecebidoPix = registro.PIX;
            let NuAutorizacao = registro.NUAUTORIZACAO;
            
            totalVrRecebidoPix += parseFloat(vrRecebidoPix);

            contadorPixCapa++;

            dataRetornoVendasPixCapa.push([
                contadorPixCapa,
                dataCompensacao,
                noFantasia,
                resultado,
                NuAutorizacao,
                dataCompensacao,
                dataCompensacao,

            ])

        }

        $('#resultadoVendaPixPeriodoCapaDTW').html(`
            <table id="dt-basic-vendas-capa-pix" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th> JDT_NUM</th>
                        <th>RefDate</th>
                        <th width="15%">Memo</th>
                        <th>Ref1</th>
                        <th>Ref2</th>
                        <th>TaxDate</th>
                        <th>DueDate</th>

                    </tr>
                </thead>
                <tbody id="resultadoVendaPixPeriodoCapaDTW"></tbody> 
                <tfoot id="totalResultadoVendaPixPeriodoCapa" class="thead-themed"></tfoot>
            </table>
        `);



        $('#dt-basic-vendas-capa-pix').DataTable({
            data: dataRetornoVendasPixCapa,
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
                        format: {
                            body: function (data, row, column, node) {
                                if (column === 1 || column === 5 || column === 6) {
                                    return formatarData(data);
                                }


                                return data;
                            }
                        }
                    }
                },
                {
                    extend: 'csvHtml5',
                    text: 'Csv',
                    titleAttr: 'Generate Csv',
                    fieldSeparator: ',',
                    title: 'Vendas_Para_Conciliar',
                    charset: 'UTF-8',
                    bom: true,
                    className: 'btn-outline-info btn-sm',


                },
                {
                    extend: 'print',
                    text: 'Print',
                    titleAttr: 'Print Table',
                    className: 'btn-outline-primary btn-sm'
                }
            ]
        });

        $('#totalResultadoVendaPixPeriodoCapa').html(`
            <tr>
                <th colspan="4" style="text-align: center;">Total</th>
                <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2))}</th>
                <th colspan="4" style="text-align: center;"></th>
            </tr>
        `);

    }
}

async function pesq_vendas_pix_Credito_dtw() {
    let IDPesqVendaPix = $("#idgrupo").val();
    let IDLojaPesqVenda = $("#idloja").val();
    let listEmpresas = $("#descEmpresas").val();
    let dataCompInicio = $('#dtcompinicio').val();
    let dataCompFim = $('#dtcompfim').val();

    try{
        animationLoadingStart();

        await $.get("financeiro_action_pesqvendaspix_credito_dtw.html", (respHtml=>$('#resultado').html(respHtml)));

        await ajaxGetAllData(`api/financeiro/venda-pix-periodo.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPix}&dataCompInicio=${dataCompInicio}&dataCompFim=${dataCompFim}&lojas=${IDLojaPesqVenda}&empresasList=${listEmpresas}`, false)
            .then(retornoListaVendasPixCreditoDTW);

        $('#btnIntegrarTodosPagamentosPix').addClass('d-none');

        animationLoadingStop();
    }catch(error){
        console.log(error);
        msgError();
    }
}

function retornoListaVendasPixCreditoDTW(respostaListaVendasPixCreditoDTW) {
    let { data } = respostaListaVendasPixCreditoDTW || '';
    let dataRetornoVendasPixCredito = [];
    let contadorPixCredito = 0;
    let totalVrRecebidoPix = 0;

    if (data.length != 0) {
        for (let registro of data) {
            let idVenda = registro.IDVENDA;
            let idEmpresa = registro.NOFANTASIA.substring(1, 5);
            let lineNum = '';
            let line_id = '1';
            let contaCreditoSap = '1.01.01.01.9998';
            let contaDebitoSap = '';
            let dataCompensacao = registro.DATA_COMPENSACAO;
            let noFantasia = registro.NOFANTASIA;
            let Vendas = "Vendas";
            let resultado = Vendas + " " + registro.DSTIPOPAGAMENTO + " " + formatMesAno(dataCompensacao);
            let vrRecebidoPix = registro.PIX;
            let NuAutorizacao = registro.NUAUTORIZACAO;
            
            totalVrRecebidoPix += parseFloat(vrRecebidoPix);
            contadorPixCredito++;

            dataRetornoVendasPixCredito.push([
                contadorPixCredito,
                lineNum,
                line_id,
                contaCreditoSap,
                contaDebitoSap,
                vrRecebidoPix,
                dataCompensacao,
                noFantasia,
                dataCompensacao,
                resultado,
                NuAutorizacao,
                dataCompensacao,
                idEmpresa
            ])
        }

        $('#resultadoVendaPixPeriodoCreditoDTW').html(`
            <table id="dt-basic-vendas-credito-pix" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>JdtNum</th>
                        <th>LineNum</th>
                        <th>Line_ID</th>
                        <th>Account</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>DueDate</th>
                        <th width="15%">LineMemo</th>
                        <th>RefDate</th>
                        <th>Ref1</th>
                        <th>Ref2</th>
                        <th>TaxDate</th>
                        <th>BPLId</th>

                    </tr>
                </thead>
                <tbody id="resultadoVendaPixPeriodoCreditoDTW"></tbody> 
                <tfoot id="totalResultadoVendaPixPeriodoCredito" class="thead-themed"></tfoot>
            </table>
        `);

        $('#dt-basic-vendas-credito-pix').DataTable({
            data: dataRetornoVendasPixCredito,
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
                        format: {
                            body: function (data, row, column, node) {
                                if (column === 6 || column === 8 || column === 11) {
                                    return formatarData(data);
                                }

                                if (column === 5) {
                                    return parseFloat(data.toString().replace('.', ','));
                                }

                                return data;
                            }
                        }
                    }
                },
                {
                    extend: 'csvHtml5',
                    text: 'Csv',
                    titleAttr: 'Generate Csv',
                    fieldSeparator: ',',
                    title: 'Vendas_Para_Conciliar',
                    charset: 'UTF-8',
                    bom: true,
                    className: 'btn-outline-info btn-sm',


                },
                {
                    extend: 'print',
                    text: 'Print',
                    titleAttr: 'Print Table',
                    className: 'btn-outline-primary btn-sm'
                }
            ]
        });

        $('#totalResultadoVendaPixPeriodoCredito').html(`
            <tr>
                <th colspan="4" style="text-align: center;">Total</th>
                <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2))}</th>
                <th colspan="4" style="text-align: center;"></th>
            </tr>
        `);
    }
}

async function pesq_vendas_pix_Debito_dtw(numPage) {
    let IDPesqVendaPix = $("#idgrupo").val();
    let IDLojaPesqVenda = $("#idloja").val();
    let listEmpresas = $("#descEmpresas").val();
    let dataCompInicio = $('#dtcompinicio').val();
    let dataCompFim = $('#dtcompfim').val();

    try{
        animationLoadingStart();

        await $.get("financeiro_action_pesqvendaspix_debito_dtw.html", (respHtml)=>$('#resultado').html(respHtml));

        await ajaxGetAllData(`api/financeiro/venda-pix-periodo.xsjs?pageSize=1000&page=1&idMarca=${IDPesqVendaPix}&dataCompInicio=${dataCompInicio}&dataCompFim=${dataCompFim}&lojas=${IDLojaPesqVenda}&empresasList=${listEmpresas}`, false)
            .then(retornoListaVendasPixDebitoDTW);

        $('#btnIntegrarTodosPagamentosPix').addClass('d-none');

        animationLoadingStop();
    }catch(error){
        console.log(error);
        msgError();
    }
}

function retornoListaVendasPixDebitoDTW(respostaListaVendasPixDebitoDTW) {
    let { data } = respostaListaVendasPixDebitoDTW || '';
    let dataRetornoVendasPixDebito = [];
    let totalVrRecebidoPix = 0;
    let contadorPixDebito = 0;

    if (data.length != 0) {
        for (let registro of data) {
            let idEmpresa = registro.NOFANTASIA.substring(1, 5);
            let lineNum = '';
            let line_id = '0';
            let contaCreditoSap = '';
            let contaDebitoSap = '1.01.01.02.0003';
            let dataCompensacao = registro.DATA_COMPENSACAO;
            let noFantasia = registro.NOFANTASIA;
            let Vendas = "Vendas";
            let resultado = Vendas + " " + registro.DSTIPOPAGAMENTO + " " + formatMesAno(dataCompensacao);
            let vrRecebidoPix = registro.PIX;
            let NuAutorizacao = registro.NUAUTORIZACAO;
            
            totalVrRecebidoPix += parseFloat(vrRecebidoPix);
            contadorPixDebito++;

            dataRetornoVendasPixDebito.push([
                contadorPixDebito,
                lineNum,
                line_id,
                contaDebitoSap,
                vrRecebidoPix,
                contaCreditoSap,
                dataCompensacao,
                noFantasia,
                dataCompensacao,
                resultado,
                NuAutorizacao,
                dataCompensacao,
                idEmpresa
            ])
        }

        $('#resultadoVendaPixPeriodoDebitoDTW').html(`
            <table id="dt-basic-vendas-debito-pix" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>JdtNum</th>
                        <th>LineNum</th>
                        <th>Line_ID</th>
                        <th>Account</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>DueDate</th>
                        <th width="15%">LineMemo</th>
                        <th>RefDate</th>
                        <th>Ref1</th>
                        <th>Ref2</th>
                        <th>TaxDate</th>
                        <th>BPLId</th>

                    </tr>
                </thead>
                <tbody id="resultadoVendaPixPeriodoDebitoDTW"></tbody> 
                <tfoot id="totalResultadoVendaPixPeriodoDebito" class="thead-themed"></tfoot>
            </table>
        `);

        $('#dt-basic-vendas-debito-pix').DataTable({
            data: dataRetornoVendasPixDebito,
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
                        format: {
                            body: function (data, row, column, node) {
                                if (column === 6 || column === 8 || column === 11) {
                                    return formatarData(data);
                                }

                                if (column === 5) {
                                    return parseFloat(data.toString().replace('.', ','));
                                }

                                return data;
                            }
                        }
                    }
                },
                {
                    extend: 'csvHtml5',
                    text: 'Csv',
                    titleAttr: 'Generate Csv',
                    fieldSeparator: ',',
                    title: 'Vendas_Para_Conciliar',
                    charset: 'UTF-8',
                    bom: true,
                    className: 'btn-outline-info btn-sm',


                },
                {
                    extend: 'print',
                    text: 'Print',
                    titleAttr: 'Print Table',
                    className: 'btn-outline-primary btn-sm'
                }
            ]
        });

        $('#totalResultadoVendaPixPeriodoCapa').html(`
            <tr>
                <th colspan="4" style="text-align: center;">Total</th>
                <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2))}</th>
                <th colspan="4" style="text-align: center;"></th>
            </tr>
        `);
    }
}

function funcSucessUpdateConferidoDTCompensacao(resposta) {

    // alerta_cancel_ativa_deposito();
    pesq_vendas_pix_dtw(1);

}

function funcErrorUpdateConferidoDTCompensacao(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do funcSucessUpdateConferidoDataCompensacao',
        showConfirmButton: false,
        timer: 15000
    });
}

//? ====================================== FIM ROTINA VENDA PIX DTW ====================================== //


// ========================= Faturas Pix =========================

function ListaFaturaPIX(){
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
        $("#dtcompinicio").val(dataAtualCampo);
        $("#dtcompfim").val(dataAtualCampo);

        $("#idgrupo").select2();
        
          $('.DescTituloListaVendas').html(
    `<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas PIX - <span class='fw-300'></span>`);
    
          ajaxGetAllData('api/informatica/grupoempresas.xsjs')
              .then(retornoListaGrupoEmpresasSelect)
              .catch(funcError);
    }
  };
  xmlhttp.open("GET", "financeiro_action_listfaturaspix_dtw.html", true);
  xmlhttp.send();
}

function pesq_fatura_pix_DTW(numPage){
  var idMarca = $("#idgrupo").val();
  var datapesqinicio = $("#dtconsultainicio").val();
  var datapesqfim = $("#dtconsultafim").val();


  var idEmpresa = [];
  $('#idloja option:selected').each(function (index, el) {
      idEmpresa.push($(el).val());
  });

  contadorPix = 0;
  totalVrRecebidoPix = 0;

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
      // api/financeiro/venda-total-empresa.xsjs?dataPesquisa=' 
      ajaxGet('api/financeiro/venda-total-fatura-pix-empresa.xsjs?pageSize=1000&page=' + numPage + '&idMarca=' + idMarca + '&idEmpresa=' + idEmpresa + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim  )
        .then(retornoListaFaturaPix)
        .catch(funcError);
    }
  };
  
  xmlhttp.open("GET", "financeiro_action_pesqfaturaspix_dtw.html", true);
  xmlhttp.send();
}

function retornoListaFaturaPix(respostaListaFaturaPix) {
  var dataRetornoVendasFaturasPix = []

  if(respostaListaFaturaPix.data.length != 0) {

    for (var i = 0; i < respostaListaFaturaPix.data.length; i++) {
      var registro = respostaListaFaturaPix.data[i];
      var dataCompensacao = registro.DATA_COMPENSACAO; 
      var idEmpresa = registro.IDEMPRESA;
      var noFantasia = registro.NOFANTASIA;
      var data = registro.DTPROCESSAMENTO;
      var grupoempresas = registro.IDGRUPOEMPRESARIAL;
      var contaDebitoSap = registro.CONTACREDITOSAP; 
      var contaCreditoSap = '2.01.06.01.0001'; 
      var totalFatura = registro.VALORTOTALFATURA;
      var totalFaturaPIX = registro.VALORTOTALFATURAPIX;
      var idDetalheFatura = registro.IDDETALHEFATURA;
      var tagBTN = `<div><input type="checkbox" title="Confirmar Conferência" id="${idDetalheFatura}" onclick="status_confirmar_DataFaturaPix(this.id, 'True')" /></div>`;
    
      totalVrRecebidoPix = parseFloat(totalVrRecebidoPix) + parseFloat(totalFatura);
      dataRetornoVendasFaturasPix.push([
        data,
        dataCompensacao ? dataCompensacao : 'NÃO COMPENSADO',
        idEmpresa,
        noFantasia,
        mascaraValor(parseFloat(totalFatura).toFixed(2)),
        contaCreditoSap,
        contaDebitoSap,
        tagBTN,
      ])
  
    }
  
    $('#resultadoFaturasPixDTW').html(
      `
        <table id="dt-basic-fatura-pix" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
          
          <thead class="bg-primary-600">
              <tr>
                <th>Data</th>
                <th>Data Compensacao</th>
                <th>ID Loja</th>
                <th >Loja</th>
                <th>Valor</th>
                <th>Conta Crédito</th>
                <th>Conta Débito</th>
                <th>Opções </br> <input type="checkbox" class="selectAll" onclick="toggleSelectAll(this)" /></th>
              
              </tr>
          </thead>
          <tbody id="resultadoFaturasPixDTW">
          </tbody> 
          <tfoot id="totalResultadoFaturaPix" class="thead-themed">
          </tfoot>
        </table>
      `
    );
  
    $('.selectAll').on('click', function() {
      var rows = $('#dt-basic-fatura-pix').DataTable().rows({'search': 'applied'}).nodes();  
      $('input[type="checkbox"]', rows).prop('checked', this.checked);
    });
  
    $('#dt-basic-fatura-pix').DataTable({
      data: dataRetornoVendasFaturasPix,
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
              format: {
                body: function (data, row, column, node) {
                  if (column === 0 || column === 1) {
                    return formatarData(data);
                  }
              
                  if (column === 4) {
                    return parseFloat(data.toString().replace('.', ','));
                  }
                  if(column === 7){
                    return '';
                  }
                  return data;
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
  
    $('#totalResultadoFaturaPix').html(
      `<tr>
        <th colspan="4" style="text-align: center;">Total</th>
        <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2))}</th>
        <th colspan="4" style="text-align: center;"></th>
      </tr>`
    );
  }



}

function toggleSelectAllFatura(source) {
  var selectedIds = [];
  var checkboxes = document.querySelectorAll('#dt-basic-fatura-pix input[type="checkbox"]');
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i] !== source) {
      checkboxes[i].checked = source.checked;
      if (source.checked) {
        selectedIds.push(checkboxes[i].id);
      }
    }
  }
  if (selectedIds.length > 0) {
    status_confirmar_DataFaturaPix(selectedIds, 'True');
  }
}

function status_confirmar_DataFaturaPix(ids, status) {
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  Swal.fire({
    title: 'Informe a Data de Compensação',
    html: '<input type="date" id="dtcompensacao" name="DTCompensacao" class="form-control" value="" >',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {

    if (result.value) { 
      var dtCompensacao = document.getElementById('dtcompensacao').value;
      
      var dados = ids.map(id => ({
        IDDETALHEFATURA: Number(id),
        "STCONFERIDO": status,
        "DATA_COMPENSACAO": dtCompensacao
      }));
      
      console.log(dados);
      ajaxPut("api/financeiro/fatura-pix-periodo-status-conferido.xsjs", dados)
      .then(funcSucessUpdateConferidoDTCompensacaoFatura)
        .catch(funcErrorUpdateConferidoDTCompensacaoFatura);

      var textdados = JSON.stringify(dados);
      var textoFuncao = status === 'True' ? 'FINANCEIRO/CONFIRMADA CONFERENCIA DA VENDA' : 'FINANCEIRO/DESCONFIRMADO CONFERENCIA DA VENDA';
      var dadosConfirmaDep = [{
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO": textoFuncao,
        "DADOS": textdados,
        "IP": ipCliente
      }];

      ajaxPost("api/log-web.xsjs", dadosConfirmaDep)
        .then(funcSucessLog)
        .catch(funcError);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log('Ação cancelada pelo usuário.'); 
    }
  });
}

function funcSucessUpdateConferidoDTCompensacaoFatura(resposta) {
  pesq_fatura_pix_DTW(1);
}
function funcErrorUpdateConferidoDTCompensacaoFatura(data) {
  Swal.fire({
    type: "error",
    title: 'Erro ao Carregar os Dados do funcSucessUpdateConferidoDataCompensacaoFatura',
    showConfirmButton: false,
    timer: 15000
  });
}


function pesq_fatura_pix__compensada_DTW(numPage){
  var datacompinicio = $("#dtcompinicio").val();
  var datacompfim = $("#dtcompfim").val();
  var idMarca = $("#idgrupo").val();


  var idEmpresa = [];
  $('#idloja option:selected').each(function (index, el) {
      idEmpresa.push($(el).val());
  });

  contadorPix = 0;
  totalVrRecebidoPix = 0;

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
      ajaxGetAllData('api/financeiro/venda-total-fatura-pix-empresa-compensada.xsjs?pageSize=1000&page=' + numPage  + '&dataPesquisaInicio=' + datacompinicio + '&dataPesquisaFim=' + datacompfim + '&idMarca=' + idMarca + '&idEmpresa=' + idEmpresa )
        .then(retornoListaFaturaPixCompensadaDTW)
        .catch(funcError);
    }
  };
  
  xmlhttp.open("GET", "financeiro_action_pesqfaturaspix_venda_dtw.html", true);
  xmlhttp.send();
}

function retornoListaFaturaPixCompensadaDTW(respostaListaFaturaPix) {
  var dataRetornoVendasFaturasPix = []

  if(respostaListaFaturaPix.data.length != 0) {

    for (var i = 0; i < respostaListaFaturaPix.data.length; i++) {
      var registro = respostaListaFaturaPix.data[i];
      var dataCompensacao = registro.DATA_COMPENSACAO; 
      var idEmpresa = registro.IDEMPRESA;
      var noFantasia = registro.NOFANTASIA;
      var data = registro.DTPROCESSAMENTO;
      var grupoempresas = registro.IDGRUPOEMPRESARIAL;
      var contaDebitoSap = registro.CONTACREDITOSAP; 
      var contaCreditoSap = '2.01.06.01.0001'; 
      var totalFatura = registro.VALORTOTALFATURA;
      var totalFaturaPIX = registro.VALORTOTALFATURAPIX;
      var idDetalheFatura = registro.IDDETALHEFATURA;
      var tagBTN = `<div><input type="checkbox" title="Confirmar Conferência" id="${idDetalheFatura}" onclick="status_confirmar_DataFaturaPix(this.id, 'True')" /></div>`;
    
      totalVrRecebidoPix = parseFloat(totalVrRecebidoPix) + parseFloat(totalFatura);
      dataRetornoVendasFaturasPix.push([
        data,
        dataCompensacao ? dataCompensacao : 'NÃO COMPENSADO',
        idEmpresa,
        noFantasia,
        parseFloat(totalFatura.replace(',', '.')),
        contaCreditoSap,
        contaDebitoSap,
      
      ])
  
    }
  
    $('#resultadoFaturasPixVendasDTW').html(
      `
        <table id="dt-basic-fatura-pix-vendas" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
          
          <thead class="bg-primary-600">
              <tr>
                  <th>Data</th>
                  <th>Data Compensacao</th>
                  <th>ID Loja</th>
                  <th >Loja</th>
                  <th>Valor</th>
                  <th>Conta Crédito</th>
                  <th>Conta Débito</th>
               
                
              </tr>
          </thead>
          <tbody id="resultadoFaturasPixVendasDTW">
          </tbody> 
          <tfoot id="totalResultadoFaturaPixVendas" class="thead-themed">
          </tfoot>
        </table>
      `
    );
  
    $('.selectAll').on('click', function() {
      var rows = $('#dt-basic-fatura-pix').DataTable().rows({'search': 'applied'}).nodes();  
      $('input[type="checkbox"]', rows).prop('checked', this.checked);
    });
  
    $('#dt-basic-fatura-pix-vendas').DataTable({
      data: dataRetornoVendasFaturasPix,
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
              format: {
                body: function (data, row, column, node) {
                  if (column === 0 || column === 1) {
                    return formatarData(data);
                  }
              
                  if (column === 4) {
                    return parseFloat(data.toString().replace('.', ','));
                  }

                  return data;
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
  
    $('#totalResultadoFaturaPix').html(
      `<tr>
        <th colspan="4" style="text-align: center;">Total</th>
        <th style="text-align: right;">${mascaraValor(parseFloat(totalVrRecebidoPix).toFixed(2))}</th>
        <th colspan="4" style="text-align: center;"></th>
      </tr>`
    );
  }



}

// ========================= PESQUISA LISTA DESCONTO SIMPLIFICADO ===
function pesq_lista_desconto_vendas_simplifcado(numPage){
    var idgrupo = $("#idgrupo").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    dataRetorno=[];
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
        
        $('.dataAtual').text(dataAtual);
        ajaxGet('api/financeiro/desconto-vendas-simplificado.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        	.then(retornoListaDescontoVendas_simplifcado)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "financeiro_action_pesqdescontovendas.html", true);
    xmlhttp.send();
} 

function chamarProximaListaDescontoVendas_simplifcado(numPage){
    
    var idgrupo = $("#idgrupo").val();
    var idempresa = $("#idloja").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

    ajaxGet('api/financeiro/desconto-vendas-simplificado.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataInicial=' + datapesqinicio + '&dataFinal=' + datapesqfim)
        	.then(retornoListaDescontoVendas_simplifcado)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaDescontoVendas_simplifcado(respostaListaDescontoVendas) {
      
    var numPageAtual = parseInt(respostaListaDescontoVendas.page);
   
    if(respostaListaDescontoVendas.data.length != 0){
        for (var i=0; i < respostaListaDescontoVendas.data.length; i++) { 
            contador ++;
            var registro = respostaListaDescontoVendas.data[i];
            nuVenda =  registro['IDVENDA'];
            DTFechamento = registro['DTHORAFECHAMENTO'];
            empresa = registro['NOFANTASIA'];
            NomeCaixa = registro['DSCAIXAFECHAMENTO'];
            NomeOperador = registro['MATOPERADORFECHAMENTO']+' - '+registro['OPERADORFECHAMENTO'];
            valorDinheiro = registro['VRRECDINHEIRO'];
            valorCartao = registro['VRRECCARTAO'];
            valorConvenio = registro['VRRECCONVENIO'];
            valorPos = registro['VRRECPOS'];
            valorVoucher = registro['VRRECVOUCHER'];
            valorTotalVenda = registro['VALORTOTALPRODUTOBRUTO'];
            valorTotalDesconto = registro['VRDESCONTO'];
            ValorTotalDescontoFuncionario = registro['VLTOTALDESCONTOFUNCIONARIO']===null?0:registro['VLTOTALDESCONTOFUNCIONARIO'];
            ValorTotalDescontoCliente = registro['VLTOTALDESCONTOCLIENTE']===null?0:registro['VLTOTALDESCONTOCLIENTE'];
            valorTotalPago = registro['TOTALLIQUIDO'];
            
            dataRetorno.push( [contador,
                                empresa,
                                valorDinheiro,
                                valorCartao,
                                valorConvenio,
                                valorPos,
                                valorVoucher,
                                valorTotalVenda,
                                ValorTotalDescontoFuncionario,
                                ValorTotalDescontoCliente,
                                valorTotalDesconto,
                                valorTotalPago
                                ]);
        }
        
        chamarProximaListaDescontoVendas_simplifcado(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-lista-desconto-vendas" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th >#</th>
                            <th >Loja</th>
                            <th >Vl. Dinheiro</th>
                            <th >Vl. Cartão</th>
                            <th >Vl. Convênio</th>
                            <th >Vl. Pos</th>
                            <th >Vl. Voucher</th>
                            <th >Vl. Bruto</th>
                            <th >Vl. Desconto Func.</th>
                            <th >Vl. Desconto Cliente</th>
                            <th >Vl. Desconto Total</th>
                            <th >Vl. Pago</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListdescontovandas">
                    </tbody>
                    <tfoot id="totalConsolidado"class="thead-themed">
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
	   
	    $('#dt-basic-lista-desconto-vendas').DataTable( {
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
                totalVlDinheiro = api.column( 2 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlCartao = api.column( 3 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlConvenio = api.column( 4 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlPos = api.column( 5 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlVoucher = api.column( 6 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlBruto = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlDescontoFunc = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlDescontoCliente = api.column( 9 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlDesconto = api.column( 10 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                totalVlPago = api.column( 11 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
     
                // Total over this page
                pageTotalVlDinheiro = api.column( 2, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlCartao = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlConvenio = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlPos = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlVoucher = api.column(6, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlBruto = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlDescontoFunc = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlDescontoCliente = api.column( 9, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlDesconto = api.column( 10, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                pageTotalVlPago = api.column( 11, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                
                // Update footer
                $( api.column( 2 ).footer() ).html(pageTotalVlDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 3 ).footer() ).html(pageTotalVlCartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlCartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 4 ).footer() ).html(pageTotalVlConvenio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlConvenio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 5 ).footer() ).html(pageTotalVlPos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlPos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 6 ).footer() ).html(pageTotalVlVoucher.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlVoucher.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 7 ).footer() ).html(pageTotalVlBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 8 ).footer() ).html(pageTotalVlDescontoFunc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlDescontoFunc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 9 ).footer() ).html(pageTotalVlDescontoCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlDescontoCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 10 ).footer() ).html(pageTotalVlDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
                $( api.column( 11 ).footer() ).html(pageTotalVlPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVlPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
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

//////////////////Faturas da Loja////////////////////////////

function ListaFaturaLoja() {

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
                $('#dtiniciofat').val(dataAtualCampo);
                $('#dtfimfat').val(dataAtualCampo);
    
                $("#idloja").select2();
    
                ajaxGet('api/informatica/empresa.xsjs')
                    .then(retornoListaEmpresasSelect)
                    .catch(funcError);
            
          }
        };
        xmlhttp.open("GET", "financeiro_action_listfaturasloja.html", true);
        xmlhttp.send();
    //}
}

function pesq_list_faturas() {

    var datafatinicio = $("#dtiniciofat").val();
    var datafatfim = $("#dtfimfat").val();
    var codfatura = $("#codfat").val();
    var IDEmpresaFat = $("#idloja").val();
	var contadorFatura = 0;
    VrTotalFaturaLoja = 0;
    
    dataRetorno=[];
	
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
        //newDataTable('faturaloja');
        
            $('.dataAtual').text(dataAtual);

		    return	ajaxGet('api/detalhe-fatura.xsjs?pageSize=1000&page=1&idEmpresa=' + IDEmpresaFat + '&dataPesquisaInic=' + datafatinicio + '&dataPesquisaFim=' + datafatfim + '&nuCodigoAutorizacao=' + codfatura)
				.then(retornoTableListFaturaLoja)
				.catch(funcError);
				
      }
    };
    xmlhttp.open("GET", "financeiro_action_pesqfaturaloja.html", true);
    xmlhttp.send();
}

function chamarProximaListafaturaLoja(numPage){

    var datafatinicio = $("#dtiniciofat").val();
    var datafatfim = $("#dtfimfat").val();
    var codfatura = $("#codfat").val();
    var IDEmpresaFat = $("#idloja").val();
    
	ajaxGet('api/detalhe-fatura.xsjs?pageSize=1000&page='+numPage+'&idEmpresa=' + IDEmpresaFat + '&dataPesquisaInic=' + datafatinicio + '&dataPesquisaFim=' + datafatfim + '&nuCodigoAutorizacao=' + codfatura)
		.then(retornoTableListFaturaLoja)
		.catch(funcError);
		
	$("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoTableListFaturaLoja(faturaLoja) {

  var numPageAtual = parseInt(faturaLoja.page);

  if (faturaLoja.data.length != 0) {
    for (var i = 0; i < faturaLoja.data.length; i++) {
      var registro = faturaLoja.data[i];

      IDFatura = registro.IDDETALHEFATURA;
      IDEmpFatura = registro.IDEMPRESA;
      NoEmpFatura = registro.NOFANTASIA;
      IDCaixaFatura = registro.IDCAIXAWEB;
      DescCaixaFatura = registro.DSCAIXA;
      DTFatura = registro.DTPROCESSAMENTO;
      HRFatura = registro.HRPROCESSAMENTO;
      CodFatura = registro.NUCODAUTORIZACAO;
      NoRecebedorFatura = registro.NOFUNCIONARIO;
      VrFatura = parseFloat(registro.VRRECEBIDO);
      STFatura = registro.STCANCELADO;
      IDMovCaixaFatura = registro.IDMOVIMENTOCAIXAWEB;
      STMovCaixa = registro.STCONFERIDO;
      MotivoCancelado = registro.TXTMOTIVOCANCELAMENTO;
      IdMovCaixa = registro.IDMOVCAIXA;
      STPIX = registro.STPIX;

      var DTHRFatura = DTFatura + ' ' + HRFatura;

      if (IDMovCaixaFatura == IdMovCaixa) {
        tagIDMov = '<label style="color: blue; font-size: 11px;">' + IdMovCaixa + '</label>';
      } else {
        tagIDMov = '<label style="color: red; font-size: 11px;">' + IdMovCaixa + '</label>';
      }

      if (STFatura == 'False') {
        tagFaturaAtivo = '<label style="color: blue;">ATIVO</label>';
        VrTotalFaturaLoja = VrTotalFaturaLoja + VrFatura;
      } else {
        tagFaturaAtivo = '<label style="color: red;">CANCELADO</label>';
      }

      tagFaturaCancelaBotao = '<div class="btn-group btn-group-xs"><button type="button" class="btn btn-success btn-xs" title="Editar Fatura" id="' + IDFatura + '" onclick="modal_editar_fatura(this.id)" >Editar</button>' +
        '<button type="button" class="btn btn-danger btn-xs" title="Cancelar Fatura" id="' + IDFatura + '" onclick="modal_cancela_fatura_Loja(this.id)" >Cancelar</button></div>';

      if (STPIX == 'True') {
        tagStPix = 'SIM';
      } else {
        tagStPix = 'NÃO';
      }

      dataRetorno.push([NoEmpFatura,
        DTHRFatura,
        IDMovCaixaFatura,
        DescCaixaFatura,
        CodFatura,
        VrFatura,
        NoRecebedorFatura,
        tagFaturaAtivo,
        tagStPix,
        tagFaturaCancelaBotao
      ]);

    }

    chamarProximaListafaturaLoja(numPageAtual + 1);

  } else {

    $('#resultado').html(
      `<table id="dt-basic-faturaloja" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th width="15%" style="font-size: 11px;">Empresa</th>
                        <th width="15%" style="font-size: 11px;">Data Recebimento</th>
                        <th width="10%" style="font-size: 11px;">Nº Movimento Caixa</th>
                        <th width="10%" style="font-size: 11px;">Caixa</th>
                        <th width="15%" style="font-size: 11px;">Cod. Autorização</th>
                        <th width="10%" style="font-size: 11px;">Valor</th>
                        <th style="font-size: 11px;">Recebedor</th>
                        <th width="10%" style="font-size: 11px;">Situação</th>
                        <th width="10%" style="font-size: 11px;">PIX</th>
                        <th width="10%" style="font-size: 11px;">Opção</th>
                    </tr>
                </thead>
                <tbody id="resultadoFaturas">
                </tbody>
                <tfoot id="" class="thead-themed totalFaturas">
                </tfoot>
            </table>`
    );

    $('#dt-basic-faturaloja').DataTable({
      data: dataRetorno,
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

    $('.totalFaturas').html(
      `<tr>
                <th colspan="6" style="text-align: center;">Total Lançamentos</th>
                <th style="text-align: right;">${mascaraValor(VrTotalFaturaLoja.toFixed(2))}</th>
                <th colspan="4"></th>
            </tr>`
    );
  }
}

function modal_editar_fatura(id) {

    $.get('financeiro_action_editarfaturamodal.html', function(res) {
      
       $('#resulmodaleditefatura').html(res);
       $("#editeFatura").modal('show');
       $('#editeFatura').on('shown.bs.modal', function () {
           
            $("#stPixFat").select({
    			dropdownParent: $("#editeFatura")
    		});
            $("#stStatusFat").select({
    			dropdownParent: $("#editeFatura")
    		});
       });
    })
	    return	ajaxGet('api/detalhe-fatura.xsjs?id=' + id)
			.then(retornoEditarFaturaCaixa)
			.catch(funcError);
  
}

function retornoEditarFaturaCaixa(editarFaturaCaixa) {

		IDFaturaCaixa = editarFaturaCaixa.data[0]['IDDETALHEFATURA'];
		IDCaixaFatura = editarFaturaCaixa.data[0]['IDCAIXAWEB'];
		DsCaixaFatura = editarFaturaCaixa.data[0]['DSCAIXA'];
		DsEmpresaFatura = editarFaturaCaixa.data[0]['NOFANTASIA'];
		CodAutorizacaoFatura = editarFaturaCaixa.data[0]['NUCODAUTORIZACAO'];
		CodPixFatura = editarFaturaCaixa.data[0]['NUAUTORIZACAO'];
		IDMovCaixaFatura = editarFaturaCaixa.data[0]['IDMOVIMENTOCAIXAWEB'];
		StPixFatura = editarFaturaCaixa.data[0]['STPIX'];
		StCancelFatura = editarFaturaCaixa.data[0]['STCANCELADO'];
		VrFaturaRecebido = mascaraValor(parseFloat(editarFaturaCaixa.data[0]['VRRECEBIDO']).toFixed(2));
		
		DadosCaixaFatura = IDFaturaCaixa+' - '+DsCaixaFatura+' - '+CodAutorizacaoFatura;
		
		$('#IDFaturaEditar').val(IDFaturaCaixa);
		$('#DadosFat').val(DadosCaixaFatura);
		$('#EmpFat').val(DsEmpresaFatura);
		$('#IDMovimentoEditar').val(IDMovCaixaFatura);
		$('#CodAutorizacaoFat').val(CodAutorizacaoFatura);
		$('#VrFatura').val(VrFaturaRecebido);
		$('#CodPixFat').val(CodPixFatura);
		
		if(StPixFatura == 'True'){
		    tXtPixFatura = 'SIM';
		}else{
		    tXtPixFatura = 'NÃO';
		}
		$('#stPixFat').append(
			`<option value="` + StPixFatura + `" selected> ` + tXtPixFatura + `</option>`
		);
		
		if(StCancelFatura == 'True'){
		    tXtCancelFatura = 'CANCELADO';
		}else{
		    tXtCancelFatura = 'ATIVO';
		}
		$('#stStatusFat').append(
			`<option value="` + StCancelFatura + `" selected> ` + tXtCancelFatura + `</option>`
		);
}

function editar_fatura() {

	var idfaturacaixa = $("#IDFaturaEditar").val();
	var codAutorizacao = $("#CodAutorizacaoFat").val();
	var codPix = $("#CodPixFat").val();
	var stPix = $("#stPixFat").val();
	var StCancel = $("#stStatusFat").val();
	var vrfatura = $("#VrFatura").val().replace(".", "").replace(",", ".");
	
    if ($("#CodAutorizacaoFat").val() === '') {
  
      $("#resultadoeditafatura").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Código da Fatura.</div>"
      );
        $("#CodAutorizacaoFat").focus();
        return false;
    }
    
    var dados = {
      "IDDETALHEFATURA": parseInt(idfaturacaixa),
      "NUCODAUTORIZACAO":codAutorizacao,
      "VRRECEBIDO": parseFloat(vrfatura),
      "NUAUTORIZACAO":codPix,
      "STPIX":stPix,
      "STCANCELADO":StCancel
    };

//console.table(dados);

  	ajaxPut("api/financeiro/atualizar-fatura.xsjs", dados)
		.then(funcSucessEditarFatura)
		.catch(funcErrorEditarFatura);

}

function funcSucessEditarFatura(resposta) {

	alerta_atualizado_sucesso();
	$("#editeFatura").modal('hide');
	pesq_list_faturas();

}


//================ MENU LISTA PEDIDO COMPRAS ==============================================

function retornoListaMarcaSelect(respostaListaMarcas) {

    $("#idmarcaselect").empty();
    $('#idmarcaselect').append(
	        `<option value="">Selecione ...</option>`
	);
	
	for (var i = 0; i < respostaListaMarcas.data.length; i++) {

		IDMarca = respostaListaMarcas.data[i]['IDGRUPOEMPRESARIAL'];
		DSMarca = respostaListaMarcas.data[i]['DSGRUPOEMPRESARIAL'];

			$('#idmarcaselect').append( 
				`<option value="` + IDMarca + `"> ` + DSMarca + `</option>` 
			);
	}
}

function chamarProximaListaFornecedorSelect(numPage){ 

    	ajaxGet('api/compras/fornecedor.xsjs?page='+numPage)
                .then(retornoListaFornecedorSelect)
                .catch(funcError);
}

function retornoListaFornecedorSelect(respostaListaFornecedorSelect) {
    listaFornecedores = respostaListaFornecedorSelect.data;
    numPage = parseInt(respostaListaFornecedorSelect.page);
    if(numPage === 1){
        $("#idfornselect").empty();
        $('#idfornselect').append(
	        `<option value="">Selecione ...</option>`
	    );
    }
    
	if(respostaListaFornecedorSelect.data.length!= 0){
    
    	for (var i = 0; i < respostaListaFornecedorSelect.data.length; i++) {
    
    		IDFornecedor = respostaListaFornecedorSelect.data[i]['IDFORNECEDOR'];
    		DSFornecedor = respostaListaFornecedorSelect.data[i]['NORAZAOSOCIAL'];
    		DSFantasia = respostaListaFornecedorSelect.data[i]['NOFANTASIA'];
            NrCpfCnpj = respostaListaFornecedorSelect.data[i]['NUCNPJ'];
            
    			$('#idfornselect').append(
    			    `<option value="` + IDFornecedor + `"> ` + DSFantasia + ` - ` + NrCpfCnpj + ` - ` + DSFornecedor + `</option>`
    			);
    			
    			$('#idfornvincselect').append(
    			    `<option value="` + IDFornecedor + `"> ` + DSFantasia + ` - ` + NrCpfCnpj + ` - ` + DSFornecedor + `</option>`
    			);
    	}
	    chamarProximaListaFornecedorSelect(numPage + 1); 
	}
        
}

function ListaPedidoCompra(){
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
        	$('#parametro_dia_inicio').val(dataAtualCampo2Meses);
        	$('#parametro_dia_fim').val(dataAtualCampo);
        
        	$("#idmarcaselect").select2();
        	$("#idfornselect").select2();
        
        	ajaxGet('api/compras/fornecedor.xsjs?page=1')
                        .then(retornoListaFornecedorSelect)
                        .catch(funcError);
                        
            ajaxGet('api/informatica/marca.xsjs')
                		.then(retornoListaMarcaSelect)
                		.catch(funcError);
                                
        	ajaxGet('api/financeiro/pedidos_compra.xsjs?pageSize=500&page=1&dataPesquisaInicio=' + dataAtualCampo2Meses + '&dataPesquisaFim=' + dataAtualCampo)
        		.then(retornoListaPedidos)
        		.catch(funcError);
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista dos Pedidos de Compras - <span class='fw-300'></span>`);
      }
    };
    xmlhttp.open("GET", "financeiro_action_listpedidocompra.html", true);
    xmlhttp.send();
}

function pesq_pedidos(numPage){

    var dataPesqInic = $("#parametro_dia_inicio").val();
    var dataPesqFim = $("#parametro_dia_fim").val();
    var idFornPesq = $("#idfornselect").val();
    var idMarcaPesq = $("#idmarcaselect").val();
    var NuPedidoPesq = $("#npedio").val();
    
    ajaxGet('api/financeiro/pedidos_compra.xsjs?pageSize=1000&page='+numPage + '&dataPesquisaInicio=' + dataPesqInic + '&dataPesquisaFim=' + dataPesqFim + '&idFornPesquisa=' + idFornPesq + '&idMarcaPesquisa=' + idMarcaPesq + '&idpedido=' + NuPedidoPesq)
        	.then(retornoListaPedidos)
        	.catch(funcError);
}

function chamarProximaListaPedidos(numPage){

    var dataPesqInic = $("#parametro_dia_inicio").val();
    var dataPesqFim = $("#parametro_dia_fim").val();
    var idFornPesq = $("#idfornselect").val();
    var idMarcaPesq = $("#idmarcaselect").val();
    var NuPedidoPesq = $("#npedio").val();
    
    if(idFornPesq>0 || idMarcaPesq > 0 || NuPedidoPesq>0){
        
        ajaxGet('api/financeiro/pedidos_compra.xsjs?pageSize=1000&page='+numPage + '&dataPesquisaInicio=' + dataPesqInic + '&dataPesquisaFim=' + dataPesqFim + '&idFornPesquisa=' + idFornPesq + '&idMarcaPesquisa=' + idMarcaPesq + '&idpedido=' + NuPedidoPesq)
            	.then(retornoListaPedidos)
            	.catch(funcError);
        
    }else{
        ajaxGet('api/financeiro/pedidos_compra.xsjs?pageSize=1000&page='+numPage + '&dataPesquisaInicio=' + dataAtualCampo2Meses + '&dataPesquisaFim=' + dataAtualCampo)
            	.then(retornoListaPedidos)
            	.catch(funcError);
    }
}

function retornoListaPedidos(respostaListaPedidos) {

    var numPageAtual = parseInt(respostaListaPedidos.page);
    if(numPageAtual === 1){
        totalVrPedidos = 0;
        qtdDias = 0;
        totalqtddias = 0;
        
        $('#resultadoListaPedido').html(
            `<table id="dt-basic-lista-pedidos" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th style="width: 5px; text-align: center; font-size: 11px;">Pedido</th>
                        <th style="width: 5px; text-align: center; font-size: 11px;">Documento</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">Movimento</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">Descrição</th>
                        <th style="width: 15px; text-align: center; font-size: 11px;">Fornecedor</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">Grupo</th>
                        <th style="width: 4px; text-align: center; font-size: 11px;">QTD Dias</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">DT Pedido</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">DT Entrega</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">DT Venc.</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">DT Lançam.</th>
                        <th style="width: 5px; text-align: center; font-size: 11px;">Parcela</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">A Pagar</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">Forma Pag</th>
                        <th style="width: 8px; text-align: center; font-size: 11px;">Filial</th>
                    </tr>
                </thead>
                <tbody id="resultadoPedidos">
                </tbody>
                <tfoot id="totalListaPedidos"class="thead-themed">
                </tfoot>
            </table>`
        );
	            
        var tableListaPedido = $('#dt-basic-lista-pedidos').DataTable({
            deferRender:    true,
            "columnDefs": [
                { "width": "5%", "targets": [0,1,2,6,11] },
                { "width": "6%", "targets": [7,8,9,10] },
                { "className": 'text-right', "targets": [12] },
                
            ],
            ordering:  false,
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
        }); 
        
        tableListaPedido.rows().remove().draw();
        $('#totalListaPedidos').html('');
    }

    if(respostaListaPedidos.data.length != 0){
    	for (var j = 0; j < respostaListaPedidos.data.length; j++) {

            idPedido = respostaListaPedidos.data[j]['IDRESUMOPEDIDO'];
            dataLancPedidoFormat = respostaListaPedidos.data[j]['DTCADASTROFORMATADA'];
            dataPedidoFormat = respostaListaPedidos.data[j]['DTPEDIDOFORMATADA'];
            dataPedidoEntregaFormat = respostaListaPedidos.data[j]['DTPREVENTREGAFORMATADA'];
            dataVencimentoFormat = respostaListaPedidos.data[j]['DTVENCIMENTOFORMATADA'];
            NuParcCondPagPedido = respostaListaPedidos.data[j]['NUVEZESPARCELA'];
            QtdDiasCondPagPedido = respostaListaPedidos.data[j]['QTDDIASPAGAMENTO'];
            DescContaPagar = respostaListaPedidos.data[j]['DSDESCRICAOCONTA'];
            ModPedido = respostaListaPedidos.data[j]['MODPEDIDO'];
            TpDocCondPagPedido = respostaListaPedidos.data[j]['DSFORMAPAGCONTA'];
            valorPedidoAPagar = respostaListaPedidos.data[j]['VRTOTALLIQUIDO'];
            statusPedido = respostaListaPedidos.data[j]['STCANCELADO'];
            noEmpPagPedido = respostaListaPedidos.data[j]['NOEMPESAPAG'];
            noFornecedorPedido = respostaListaPedidos.data[j]['NOFORNECEDOR'];
            
            totalVrPedidos = parseFloat(totalVrPedidos) + parseFloat(valorPedidoAPagar); 

                
                tableListaPedido.row.add([
                    `<label style="color: blue; font-size: 11px;">`+idPedido+`</label>`,
                    `<label style="color: blue; font-size: 11px;">`+idPedido+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">Previsto</label>`,
                    `<label style="color: blue; font-size: 11px;">`+DescContaPagar+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+noFornecedorPedido+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+ModPedido+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+QtdDiasCondPagPedido+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+dataPedidoFormat+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+dataPedidoEntregaFormat+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+dataVencimentoFormat+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+dataLancPedidoFormat+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+NuParcCondPagPedido+ `</label>`,
                    `<label style="color: red; font-size: 11px;">` + mascaraValor(parseFloat(valorPedidoAPagar).toFixed(2)) +  `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+TpDocCondPagPedido+ `</label>`,
                    `<label style="color: blue; font-size: 11px;">`+noEmpPagPedido+ `</label>`,
                ]).draw(false);
            
    	}
        
        chamarProximaListaPedidos(numPageAtual + 1);
        
    }else{
        $('#totalListaPedidos').html(
    		`<tr>
                <th colspan="12" style="text-align: center;">Total</th>
                <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrPedidos).toFixed(2)) + `</th>
                <th colspan="2" style="text-align: center;"></th>
            </tr>`
    	);
    }

}

/////////////////////////////////// CONCILIACAO DE FATURAS ////////////////////////////////////////

function ReceberDadosFatura() {

    var datafatinicio = $("#dtiniciofat").val();
    var datafatfim = $("#dtfimfat").val();
    var codfatura = $("#codfat").val();
    var IDEmpresaFat = 1;
    VrTotalFaturaLoja = 0;
    
    dataRetornoFat=[];

		  ajaxGet('api/financeiro/venda-marca-periodo.xsjs?pageSize=1000&dataPesquisaInicio=' + datafatinicio + '&dataPesquisaFim=' + datafatfim) 
        	.then(funcSucessDetFaturaReceber)
        	.catch(funcError);
        	
		
}

function funcSucessDetFaturaReceber(respostaDetFaturaReceber) {
    
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


        document.getElementById("filetoRead").addEventListener("change",function(){
              var file = this.files[0];
            
              if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                
                reader.onload = function(){
                    
                    document.getElementById("buttonfile").style.display = 'none';
                        
                    const text = this.result;
                    var lines = text.split('\n');
	                var contadorFatura = 0;
                    var vrConcRecebidoFatura = 0;
                    var vrConcRecebidoFaturaPIX = 0;
                    var vrConcFaturaTotal = 0;
                    
                        for (var i = 1; i < lines.length; i++) {
                            contadorFatura ++;
                            
                            var tableprodnfe = '<table width="100%"><tbody><tr>';
                            
                            dadoslinha = lines[i].split(";");
                            
                            for (var j = 0; j < respostaDetFaturaReceber.data.length; j++) {

                                if(respostaDetFaturaReceber.data[j]['VRFATURA']>0 || respostaDetFaturaReceber.data[j]['VRFATURAPIX'] >0){
                                    
                                    if(respostaDetFaturaReceber.data[j]['CODEMPRESA'] === dadoslinha[3]){
                                    
                                        vrConcRecebidoFatura = respostaDetFaturaReceber.data[j]['VRFATURA'];
                                        vrConcRecebidoFaturaPIX = respostaDetFaturaReceber.data[j]['VRFATURAPIX'];
                                        CodEmpFatura = respostaDetFaturaReceber.data[j]['CODEMPRESA'];
                                        NoEmpFatura = respostaDetFaturaReceber.data[j]['NOFANTASIA'];
                                        
                                        vrConcFaturaTotal = parseFloat(vrConcRecebidoFatura) + parseFloat(vrConcRecebidoFaturaPIX);
                                        
	                                    var vrFatTotalArq = dadoslinha[5].replace(".", "").replace(",", ".");
                                        
                                        if(parseFloat(vrFatTotalArq) === parseFloat(vrConcFaturaTotal.toFixed(2))){
                                            var QtdDiverg = 0;
                                            var obsdiverg = '<label style="color: blue;"><b>SEM DIVERGENCIA</b></label>';
                                            var txtQtdDiverg = '<label style="color: blue;"><b>'+QtdDiverg.toFixed(0)+'</b></label>';
                                        }else if (parseFloat(vrFatTotalArq) > parseFloat(vrConcFaturaTotal.toFixed(2))){
                                            var QtdDiverg = parseFloat(vrFatTotalArq) - parseFloat(vrConcFaturaTotal.toFixed(2));
                                            var obsdiverg ='<label style="color: red;"><b>FATURA COM DIVERGENCIA - RECEBIDO A MENOR</b></label>';
                                            var txtQtdDiverg = '<label style="color: red;"><b>'+QtdDiverg.toFixed(0)+'</b></label>';
                                        }else{
                                            var QtdDiverg = parseFloat(vrConcFaturaTotal.toFixed(2)) - parseFloat(vrFatTotalArq);
                                            var obsdiverg = '<label style="color: red;"><b>FATURA COM DIVERGENCIA - ARQUIVO A MENOR</b></label>';
                                            var txtQtdDiverg = '<label style="color: red;"><b>'+QtdDiverg.toFixed(0)+'</b></label>';
                                        }
                                        
                                        j = respostaDetFaturaReceber.data.length;
                                        
                                    }
                                    
                                }
                                
                        	}
                        
                            dataRetornoFat.push([
                                            contadorFatura,
                                            dadoslinha[0],
                                            dadoslinha[3],
                                            NoEmpFatura,
                                            mascaraValor(vrConcFaturaTotal.toFixed(2)), 
                                            (dadoslinha[5]),
                                            txtQtdDiverg,
                                            obsdiverg
                                        ])
                                            
                            tableprodnfe = tableprodnfe +  '</tr></tbody></table>';
    
                        }
            	        $('#resultadoProdutosRecepcao').html(
                                `<table id="dt-basic-fat" class="bordasimples tbprint">
                                    <thead>
                                        <tr>
                                            <th style="width: 5px; text-align: center; font-size: 12px;">#</th>
                                            <th style="width: 10px; text-align: center; font-size: 12px;"><b>Data<b></th>
                                            <th style="width: 15px; text-align: center; font-size: 12px;"><b>Cod. Estabelecimento<b></th>
                                            <th style="width: 10px; text-align: center; font-size: 12px;"><b>Empresa<b></th>
                                            <th style="width: 10px; text-align: center; font-size: 12px;"><b>Valor Recebido<b></th>
                                            <th style="width: 10px; text-align: center; font-size: 12px;"><b>Valor Arquivo<b></th>
                                            <th style="width: 10px; text-align: center; font-size: 12px;"><b>Valor Divergente<b></th>
                                            <th style="width: 10px; text-align: center; font-size: 12px;"><b>Obs<b></th>
                                        </tr>
                                    </thead>
                                    <tbody id="resultadoRecFat">
                                    </tbody>
                                </table>`
                        );
                        
                	    $('#dt-basic-fat').DataTable( {
                	        data: dataRetornoFat,
                            "columnDefs": [
                                { "width": "3%", "targets": [0] },
                                { "width": "8%", "targets": [1, 2] },
                                { "width": "20%", "targets": [3] },
                                { "width": "8%", "targets": [4, 5, 6, 7] },
                                { "className": 'text-right', "targets": [4, 5, 6] },
                                { "className": 'text-center', "targets": [0, 1, 2, 3, 7] },
                                
                            ],
                            "displayLength": 25,
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
                            "paging":   false,
                            "ordering": false,
                            "info":     false,
                            "searching":     false,
                            deferRender:    false,
                            scrollY:        false,
                            scrollCollapse: false,
                            scroller:       false,
                
                        } );
                            	
                };

                    reader.onerror = function (evt) { 
                        console.error("An error ocurred reading the file",evt);
                    };
                  
              }

            },false);
            
      }
    };
    xmlhttp.open("GET", "financeiro_action_recepcaodadosfatura.html", true);
    xmlhttp.send();

}

//== INICIO Rotina Alteracao Pix Pagamento Venda e Fatura no PDV ==//

/*
Autor: Hendryw Deyvison
E-mail: hendryw.deyvison@gmail.com
Data: 13/11/2023
*/

async function ListaEmpresas() {
    let modalLoading = setTimeout(() => animacaoCarregamento(), delayMaximo);

    try {
        await loadActionListaEmpresas();
        await loadListaEmpresasSelect()

        clearTimeout(modalLoading);
        Swal.close();

        pesq_empresas();

    } catch (erro) {
        clearTimeout(modalLoading);
        Swal.close();

        msgError('Erro ao carregar a página, tente novamente!');
        console.log(error)
    }
}

function loadActionListaEmpresas() {
    return new Promise((resolve, reject) => {
        try {
            $.get("financeiro_action_lista_empresas.html", function (resp) {
                $("#js-page-content").html(resp)



                resolve()
            })
        } catch (erro) {
            reject(erro);
        }
    })
}

function loadListaEmpresasSelect() {
    return new Promise(async (resolve, reject) => {
        try {
            let resp = await ajaxGet('api/empresa.xsjs');

            retornoListaEmpresasSelectPesquisa(resp);
            resolve();
        } catch (erro) {
            reject(erro)
        }
    })
}

function retornoListaEmpresasSelectPesquisa(respostaListaEmpresas) {
    $('#idloja').select2({})

    listaEmpresas = respostaListaEmpresas.data;
    var dadosSelectEmpresas = []

    for (var i = 0; i < listaEmpresas.length; i++) {

        var IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
        var DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

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

        $('#idloja').append(
            `<option value="` + elemento.IDEmpresa + `"> ` + elemento.DSEmpresa + `</option>`);
    }

}

function pesq_empresas(id = '') {
    let modalLoading = setTimeout(() => animacaoCarregamento(), delayMaximo);
    let IDEmpresa = $("#idloja").val() || id;

    dataRetornoEmpresas = [];
    numPage = 1;

    $.get("financeiro_action_pesq_empresas.html", (resp) => {
        $('#resultado').html(resp)

        newDataTable('tableListaEmpresas');

        $('.dataAtual').text(dataAtual);

        ajaxGet('api/empresa.xsjs?id=' + IDEmpresa)
            .then((resp) => {
                clearTimeout(modalLoading);
                Swal.close();

                retornoListaEmpresa(resp);
            })
            .catch(funcError);
    }).fail(erro => {
        clearTimeout(modalLoading);
        Swal.close();

        msgError('Erro ao carregar a pesquisa, tente novamente!');
        console.log(erro);
    })

}

function retornoListaEmpresa(respostaListaEmpresas) {
    var numPageAtual = parseInt(respostaListaEmpresas.page);

    if (respostaListaEmpresas.data.length !== 0) {
        for (var i = 0; i < respostaListaEmpresas.data.length; i++) {
            registroEmpresas = respostaListaEmpresas.data[i];

            idEmpresa = registroEmpresas['IDEMPRESA'];
            noEmpresa = registroEmpresas['NOFANTASIA'];
            CNPJ = registroEmpresas['NUCNPJ'];
            IE = registroEmpresas['NUINSCESTADUAL'];
            Cnae = registroEmpresas['CNAE'];
            Endereco = registroEmpresas['EENDERECO'];
            Estado = registroEmpresas['SGUF'];
            SituacaoEmpresa = registroEmpresas['STATIVO'];
            DTUltimaAlteracao = registroEmpresas['DTULTATUALIZACAO'];
            IDConfiguracaoEmpresa = registroEmpresas['IDCONFIGURACAO'];
            NuCertificadoEmpresa = registroEmpresas['DSNOMEPFX'];
            DTValidadeCertificadoEmpresa = registroEmpresas['DTVALIDADECERTIFICADO'];

            if (Estado !== 'DF') {
                Cidade = registroEmpresas['ECIDADE']

            } else {
                Cidade = registroEmpresas['EBAIRRO'];
            }

            if (DTUltimaAlteracao == null) {
                DTUltimaAlteracao = '';
            }

            if (SituacaoEmpresa == 'True') {
                SituacaoEmpresa = `<label style="color: blue;">Ativo</label>`;
            } else {
                SituacaoEmpresa = `<label style="color: red;">Inativo</label>`;
            }

            if (idEmpresa > 0) {
                Opcoes = `<div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-info btn-xs" title="Editar Configurações Pix" id="${idEmpresa}" onclick="modal_Atualiza_Pix(this.id)">
                        <span class="fal fa-pen mr-1"></span> Pix
                        </button>
                    </div>`;
                /*`<div class="btn-group btn-group-xs"><button type="button" class="btn btn-warning btn-xs" title="Editar Informações da Empresa" id="${idEmpresa}" onclick="modal_cadastro_empresas(this.id)">Editar</button><button type="button" class="btn btn-primary btn-xs" title="Atualizar Certificado" id="${idEmpresa}" onclick="modal_Atualiza_Cerfificado(this.id)">Certificado</button><button type="button" class="btn btn-success btn-xs" title="Listar Caixas" id="${idEmpresa}" onclick="ListaCaixasEmpresa(this.id)" >Caixas - PDV</button></div>`;*/
            }

            dataRetornoEmpresas.push([
                idEmpresa,
                noEmpresa,
                CNPJ,
                IE,
                Cnae,
                SituacaoEmpresa,
                Opcoes
            ]);

        }

        // chamarProximaListaEmpresas(numPageAtual + 1);



        $('#dt-basic-empresas').DataTable({
            data: dataRetornoEmpresas,
            deferRender: true,
            columnDefs: [
                { "width": "30%", "targets": 1 },
                { "width": "20%", "targets": 2 },
                {
                    targets: [0, 3, 4, 5, 6],
                    "width": "10%",
                },
                {
                    targets: [0, 5, 6],
                    className: 'text-center'
                }
            ],
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

async function modal_Atualiza_Pix(id) {
    let modalLoading = setTimeout(() => animacaoCarregamento(), delayMaximo);

    try {
        await loadActionModalUpdatePixEmpresa();
        await loadDetalhesModalUpdatePixEmpresa(id);

        $('#idConfigPixVenda').select2();
        $('#idConfigPixFatura').select2();

        clearTimeout(modalLoading);
        Swal.close();

    } catch (erro) {
        clearTimeout(modalLoading);
        Swal.close();

        msgError('Erro ao carregar as configurações de Pix da Loja, tente novamente!');
        console.log(erro);
    }
}

function loadActionModalUpdatePixEmpresa() {
    return new Promise((resolve, reject) => {
        try {
            $.get('financeiro_action_update_pix_pdv_modal.html', function (res) {

                $('#resultadoModalGenerico').html(res);

                resolve();
            })
        } catch (erro) {
            reject(erro);
        }
    })
}

function loadDetalhesModalUpdatePixEmpresa(idEmpresa) {
    return new Promise(async (resolve, reject) => {
        try {
            let resp = await ajaxGet('api/configuracao_pix_pdv.xsjs?idEmpresa=' + idEmpresa)

            retornoUpdatePixEmpresa(resp);

            resolve();
        } catch (erro) {
            reject(erro);
        }
    })
}

function retornoUpdatePixEmpresa(configsPixEmpresa) {
    let dados = configsPixEmpresa?.data?.length ? configsPixEmpresa.data : '';
    let dadosOriginais = [];

    dados && dados.map((dado, indice) => {

        let idEmpresa = dado['IDEMPRESA'];
        let nomeFantasiaEmp = dado['NOFANTASIA'];
        let idConfigPixVenda = dado['IDPSPPIX'];
        let idConfigPixFatura = dado['IDPSPPIXFATURA'];

        dadosOriginais.push({
            IDEMPRESA: idEmpresa,
            NOFANTASIA: nomeFantasiaEmp,
            IDPSPPIX: idConfigPixVenda,
            IDPSPPIXFATURA: idConfigPixFatura
        })

        $('#idEmpresaPix').val(idEmpresa);
        $('#nomeEmpresaPix').val(nomeFantasiaEmp);
        $('#idConfigPixVenda').val(idConfigPixVenda).trigger('change')
        $('#idConfigPixFatura').val(idConfigPixFatura).trigger('change')

        $('#tituloGenerico').html(`
       Configuração Pix Loja: ${nomeFantasiaEmp}
    `);

        $('#footerModalGenerico').html(`
        <button id="btnCloseEditConfigPix" class="btn btn-danger" type="button" title="Cancelar Edição de Configurações do Pix">
            <span class="fal fa-times mr-1"></span>Cancelar e Fechar
        </button>
        <button id="btnEditConfigPix" class="btn btn-warning" type="button" title="Atualizar Configurações">
            <span class="fal fa-pen mr-1"></span>Atulizar
        </button>
    `);

    })

    $('#btnCloseEditConfigPix').on('click', () => $("#modalGenerico").modal('hide'))
    $('#btnEditConfigPix').on('click', () => { updateConfigsPixEmpresa(dadosOriginais) })

    $('#modalGenerico').modal('show')
}

function updateConfigsPixEmpresa(dadosOriginais) {
    let dadosUpdatePix = [];
    let IDEMPRESA = $('#idEmpresaPix').val() ? Number($('#idEmpresaPix').val()) : '';
    let IDPSPPIX = $('#idConfigPixVenda').val() ? Number($('#idConfigPixVenda').val()) : '';
    let IDPSPPIXFATURA = $('#idConfigPixFatura').val() ? Number($('#idConfigPixFatura').val()) : '';

    if (!IDEMPRESA) {
        return msgWarning('As configurações da Empresa não Foram Carregadas!', 15000, 'Recarregue a Página e Tente Novamente!')
    }

    if (!IDPSPPIX || !IDPSPPIXFATURA) {
        return msgWarning('As configurações de PIX VENDA e PIX FATURA devem estar preenchida com um dos bancos cadastrados!', 15000, 'Verifique os Campos e Tente Novamente!')
    }

    dadosUpdatePix.push({
        IDEMPRESA,
        IDPSPPIX,
        IDPSPPIXFATURA
    });

    if (dadosUpdatePix.length) {
        msgQuestion('Deseja Realmente Atualizar as Configurações Pix da Empresa?')
            .then(resp => {

                if (resp.value) {
                    let dadosOrigAlt = {
                        dadosOriginais: dadosOriginais[0],
                        dadosAlterados: dadosUpdatePix[0]
                    };
                    let dadosParaLog = JSON.stringify(dadosOrigAlt);
                    let dadosLogAlteracao = [{
                        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                        "PATHFUNCAO": `FINANCEIRO/EMPRESAS/ALTERACAO CONFIGURACAO PIX IDEMPRESA: ${IDEMPRESA}`,
                        "DADOS": dadosParaLog,
                        "IP": ipCliente
                    }];

                    let modalLoading = setTimeout(() => animacaoCarregamento('Atualizando Informações...'), delayMaximo);
                    ajaxPut('api/configuracao_pix_pdv.xsjs', dadosUpdatePix)
                        .then(resp => {
                            clearTimeout(modalLoading);
                            Swal.close();

                            msgSuccess('Configurações Pix Atualizadas Com Sucesso!').then(resp => {
                                sobeLogAlteracaoPix(dadosLogAlteracao, IDEMPRESA);
                            })
                        })
                        .catch(erro => {
                            clearTimeout(modalLoading);
                            Swal.close();

                            msgError('Erro ao Atualizar as Configurações Pix, tente novamente!');
                            console.log(erro);
                        })

                }
            })
    }


}

function sobeLogAlteracaoPix(dadosLogAlteracao, idEmpresa) {
    ajaxPost("api/log-web.xsjs", dadosLogAlteracao)
        .then(resp => {
            msgSuccess('Log Registrado Com Sucesso!').then(resp => {
                $('#modalGenerico').modal('hide');
                pesq_empresas(idEmpresa);
            })
        })
        .catch(erro => console.log(erro))
}

//== FIM Rotina Alteracao Pix Pagamento Venda e Fatura no PDV ==//

//? ======================================================== INICIO ROTINA CONFERENCIA DE MALOTES ======================================================== //
// Autor: Hendryw Deyvison
// E-mail: hendryw.deyvison@gmail.com
// Data: 14/03/2024
function formataStringComEspaço(string = '') {
    return string?.replace(/ {2,}/g, ' ')?.replace(/(\n\s*){2,}/g, '\n');
}

function retornoGrupoEmpresarialSelect(dadosGruposEmpresariais){
    let { data } = dadosGruposEmpresariais || [];

    $("#idGrupoEmpresarial").html('<option value="">Todos</option>');

    for (let { IDGRUPOEMPRESARIAL, DSGRUPOEMPRESARIAL } of data){
        $("#idGrupoEmpresarial").append(`<option title="${DSGRUPOEMPRESARIAL}" value="${IDGRUPOEMPRESARIAL}">${DSGRUPOEMPRESARIAL}</option>`);
    }

    $("#idGrupoEmpresarial").select2();
}

async function retornoListaEmpresasSelect(respostaListaEmpresas) {
    let { data } = respostaListaEmpresas || [];

    $('#idloja').html(`
        <option value="">Selecione...</option>    
    `);

    for ({ IDEMPRESA, NOFANTASIA } of data) {
        $('#idloja').append(`<option value="${IDEMPRESA}"> ${NOFANTASIA} </option>`);
    }

    $('#idloja').select2();
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

async function TelaListarMalotes() {
    try {
        animationLoadingStart();

        await $.get("financeiro_action_tela_principal_listmalotesloja.html", async (res) => $('#js-page-content').html(res)).catch((error) => { throw error });
        
        await ajaxGetAllData('api/grupo-empresarial.xsjs')
            .then(retornoGrupoEmpresarialSelect)
            .catch((error) => { throw error });
        
        await ajaxGetAllData('api/empresa.xsjs')
            .then(retornoListaEmpresasSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData('api/financeiro/pendencias-malotes.xsjs')
            .then(retornoListaPendenciasMaloteSelect)
            .catch((error) => { throw error });

        $('.dataAtual').text(dataAtual);
        $('#dtconsultainicio, #dtconsultafim').val(dataAtualCampo);
        $('#dtconsultainicio, #dtconsultafim, #idMalote').on('keypress', (e) => { if (e.keyCode == 13) pesquisarMalotes() });
        $('#statusMalote').select2();

        $('#idGrupoEmpresarial, #idloja, #statusMalote, #pendenciasMalote').on('select2:open', function (e) {
            $('.select2-search__field').on('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    
                    pesquisarMalotes()
                }
            });
        });

        animationLoadingStop();

        $('#dtconsultainicio').focus();

    } catch (error) {
        console.error(error);
        msgError();
    }

}

async function pesquisarMalotes() {
    try {
        let tpPesquisa = $('#tipoPesq').val();
        let idGrupoEmpresarial = $("#idGrupoEmpresarial").val() || '';
        let idEmpresa = $('#idloja').val() || '';
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();
        let statusMalote = $("#statusMalote").val() || '';
        let idPendenciaMalote = $("#pendenciasMalote").val() || '';
        let idMalote = $("#idMalote").val() || '';

        let queryData = `dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}`;


        if(tpPesquisa == 'Conferido' ){
            queryData = `dataConferenciaInicio=${datapesqinicio}&dataConferenciaFim=${datapesqfim}`
        }


        await ajaxGetAllData(`api/financeiro/malotes-por-loja.xsjs?pageSize=500&page=1&idGrupoEmpresarial=${idGrupoEmpresarial}&idEmpresa=${idEmpresa}&statusMalote=${statusMalote}&idMalote=${idMalote}&idPendenciaMalote=${idPendenciaMalote}&${queryData}`)
        .then(retornoListarMalotesLoja)
        .catch((error) => { throw error });

    } catch (error) {
        console.error(error);
        msgError();
    }

}

function retornoListarMalotesLoja({ data }) {
    let totalVrRecebidoDinheiro = 0;
    let totalVrRecebidoCartao = 0;
    let totalVrRecebidoPos = 0;
    let totalVrRecebidoPix = 0;
    let totalVrRecebidoMOOVPAY = 0;
    let totalVrRecebidoConvenio = 0;
    let totalVrRecebidoVoucherLoja = 0;
    let totalVrRecebidoFatura = 0;
    let totalVrRecebidoFaturaPIX = 0;
    let totalVrDespesaTotal = 0;
    let totalVrDisponivel = 0;
    let totalVrQuebraCaixa = 0;
    let totalVrBruto = 0;
    let vrTotalDinheiro = 0;
    let vrTotalDinheiroAjuste = 0;
    let dadosTable = [];

    $('#btnConferenciaMalote, #btnDevolucaoMalote').addClass('d-none');

    $('#resultado').html(
        `<table id="dt-basic-MalotesLoja" class="table table-bordered table-hover table-responsive-lg table-striped w-100 fw-700">
            <thead class="bg-primary-600">
                <tr>
                    <th class="text-center">#</th>
                    <th class="text-center">Data</th>
                    <th class="text-center">Loja</th>
                    <th class="text-center">Dinheiro</th>
                    <th class="text-center">Cartão</th>
                    <th class="text-center">POS</th>
                    <th class="text-center">PIX</th>
                    <th class="text-center">Convênio</th>
                    <th class="text-center">Voucher</th>
                    <th class="text-center">Fatura</th>
                    <th class="text-center">Fat PIX</th>
                    <th class="text-center">Despesa</th>
                    <th class="text-center">Total Recebido</th>
                    <th class="text-center">Disponível</th>
                    <th class="text-center">Status</th>
                    ${$('#tipoPesq').val() == 'Conferido' ? '<th class="text-center">Conferente</th>' : ''}
                    <th class="text-center">Ação</th>
                </tr>
            </thead>
            <tbody id="resultadoMalotesLoja">
            </tbody>
            <tfoot id="totalResultadoMalotesLoja"class="thead-themed">
            </tfoot>
        </table>`
    );


    if (data.length != 0) {
        let contador = 0;

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
            let noFuncConferencia = registro?.NOFUNCIONARIOCONFERENCIA || ''
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

                if ((obsFinanceiroMalote)?.trim()?.length > 0){
                    classStatus = 'text-primary';
                    statusMalote += ' Com Observações e/ou Pendências';
                }
            }

            if (statusMalote == 'Devolvido') {
                classStatus = 'text-danger';
                statusMalote += ' e Aguardando Reenvio...';
            }

            statusMalote = `<label class="${classStatus} fw-900">${statusMalote}</label>`;

            if (parseFloat(vrAjusteDin) > 0) {
                vrTotalDinheiroAjuste = parseFloat(vrTotalDinheiroAjuste) + parseFloat(vrAjusteDin);
            } else {
                vrTotalDinheiro = idMalote ? vrTotalDinheiro : parseFloat(vrTotalDinheiro) + parseFloat(vrRecebidoDin);
            }

            vrQuebraCaixa = (parseFloat(vrRecebidoDin)) - parseFloat(vrFisicoDin);

            vrTotal = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);
            vrDisponivel = idMalote ? parseFloat(vrDisponivelMalote) : parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal) + parseFloat(vrQuebraCaixa);

            if($('#tipoPesq').val() == 'Conferido'){
                dadosTable.push([
                    `<label style="color: blue;">${(++contador)}</label>`,
                    `<label style="color: blue;">${dataFechamento}</label>`,
                    `<label class="text-truncate" style="color: blue;">${noFantasia} </label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoDinheiro).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoCartao).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoPos).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoPix).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoConvenio).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoVoucherLoja).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoFatura).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoFaturaPIX).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrDespesaTotal).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrTotalVendido).toFixed(2))}</label>`,
                    `<label style="color: green;">${maskValorEmBRL(parseFloat(vrDisponivel).toFixed(2))}</label>`,
                    `<label class="${classStatus} text-truncate fw-900">${statusMalote}</label>`,
                    `<label class="text-truncate" style="color: blue;">${noFuncConferencia} </label>`,
                    containerButtons
                ]);

            } else {
                dadosTable.push([
                    `<label style="color: blue;">${(++contador)}</label>`,
                    `<label style="color: blue;">${dataFechamento}</label>`,
                    `<label class="text-truncate" style="color: blue;">${noFantasia} </label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoDinheiro).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoCartao).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoPos).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoPix).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoConvenio).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoVoucherLoja).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoFatura).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrRecebidoFaturaPIX).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrDespesaTotal).toFixed(2))}</label>`,
                    `<label style="color: blue;">${maskValorEmBRL(parseFloat(vrTotalVendido).toFixed(2))}</label>`,
                    `<label style="color: green;">${maskValorEmBRL(parseFloat(vrDisponivel).toFixed(2))}</label>`,
                    `<label class="${classStatus} text-truncate fw-900">${statusMalote}</label>`,
                    containerButtons
                ]);
            }
            
            totalVrRecebidoDinheiro = parseFloat(totalVrRecebidoDinheiro) + parseFloat(vrRecebidoDinheiro);
            totalVrRecebidoCartao = parseFloat(totalVrRecebidoCartao) + parseFloat(vrRecebidoCartao);
            totalVrRecebidoPos = parseFloat(totalVrRecebidoPos) + parseFloat(vrRecebidoPos);
            totalVrRecebidoPix = parseFloat(totalVrRecebidoPix) + parseFloat(vrRecebidoPix);
            totalVrRecebidoMOOVPAY = parseFloat(totalVrRecebidoMOOVPAY) + parseFloat(vrRecebidoMOOVPAY);
            totalVrRecebidoConvenio = parseFloat(totalVrRecebidoConvenio) + parseFloat(vrRecebidoConvenio);
            totalVrRecebidoVoucherLoja = parseFloat(totalVrRecebidoVoucherLoja) + parseFloat(vrRecebidoVoucherLoja);

            totalVrRecebidoFatura = parseFloat(totalVrRecebidoFatura) + parseFloat(vrRecebidoFatura);
            totalVrRecebidoFaturaPIX = parseFloat(totalVrRecebidoFaturaPIX) + parseFloat(vrRecebidoFaturaPIX);
            totalVrDespesaTotal = parseFloat(totalVrDespesaTotal) + parseFloat(vrDespesaTotal);
            totalVrBruto = parseFloat(totalVrBruto) + parseFloat(vrTotalVendido);
            totalVrQuebraCaixa = parseFloat(totalVrQuebraCaixa) + parseFloat(vrQuebraCaixa);
            totalVrDisponivel = parseFloat(totalVrDisponivel) + parseFloat(vrDisponivel);

            if (totalVrQuebraCaixa > 0) {
                tagquebracaixatotal = `<th><label style="color: blue;"> + ` + maskValorEmBRL(parseFloat(totalVrQuebraCaixa).toFixed(2)) + `</label></th>`;
            } else {
                tagquebracaixatotal = `<th><label style="color: red;"> - ` + maskValorEmBRL(parseFloat(totalVrQuebraCaixa).toFixed(2)) + `</label></th>`;
            }
        }

        $('#totalResultadoMalotesLoja').html(
            `<tr>
                <th colspan="3" style="text-align: center;">Total</th>
                <th>${maskValorEmBRL(parseFloat(totalVrRecebidoDinheiro).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrRecebidoCartao).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrRecebidoPos).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrRecebidoPix).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrRecebidoConvenio).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrRecebidoVoucherLoja).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrRecebidoFatura).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrRecebidoFaturaPIX).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrDespesaTotal).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrBruto).toFixed(2))}</th>
                <th>${maskValorEmBRL(parseFloat(totalVrDisponivel).toFixed(2))}</th>
                <th></th>
                <th></th>
                ${$('#tipoPesq').val() == 'Conferido' ? '<th></th>' : ''}
            </tr>`
        );

    }

    $('#dt-basic-MalotesLoja').DataTable({
        data: dadosTable,
        deferRender: true,
        responsive: false,
        scrollX: true,
        columnDefs: [
            {
                type: 'date-time-br', targets: 1
            },
            {
                type: 'currency-brl', targets: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
            },
            {
                className: 'text-center text-truncate', targets: [15]
            }
        ],
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
        ],
        initComplete: function (settings) {
            let idTable = `#${settings.nTable.id}`;

            $(idTable).focus();

            $('html, body').animate({
                scrollTop: $(idTable).offset().top
            }, 1000);
        }
    });

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

    if (STATUSMALOTE == 'Devolvido'){
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

async function exibirHistoricoMaloteModal(idHistoricoORidMalote){
    try {
        idHistoricoORidMalote = idHistoricoORidMalote.split('_');
        let tipo = idHistoricoORidMalote[0];
        let id = idHistoricoORidMalote[1]
        
        animationLoadingStart();

        await $.get('action_detalhes_malotes.html', async (respHtml) => $('#detDadosMalote').html(respHtml)).catch((error) => { throw error });

        await listarPendenciasMaloteModal().catch((error) => { throw error });

        $('#pendenciasDetalheMalote').removeClass('d-none');

        if(tipo == 'idHistorico'){
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

function retornoExibirHistoricoMaloteModal({ data }){
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

    if (!idUser || !IDEMPRESA) {
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

                pesquisarMalotes();

            } catch (error) {
                console.error(error);
                msgError('Erro ao tentar atualizar o status do malote, recarregue e tente novamente!');
            }
        })
}

//? ======================================================== FIM ROTINA CONFERENCIA DE MALOTES ======================================================== //

//? ============================================== INICIO ROTINA MENU LISTA CONCILIAÇÃO POR BANCOS ==============================================//

function retornoListaContaBancoSelect(respostaListaContaBancos) {
    let { data } = respostaListaContaBancos || '';

    $('#idcontabanco').html('<option value="">Selecione...</option>');

    for (let { IDCONTABANCO, DSCONTABANCO } of data) {
        $('#idcontabanco').append(
            `<option value="${IDCONTABANCO}"> ${IDCONTABANCO} - ${DSCONTABANCO}</option>`
        );
    }

    $('#idcontabanco').select2();
}

function formatarData(data) {
    if (!data) return '';

    // Verifica se a data está no formato ISO 8601
    if (data.includes('T')) {
        const dataObj = new Date(data);
        return `${dataObj.getFullYear()}${('0' + (dataObj.getMonth() + 1)).slice(-2)}${('0' + dataObj.getDate()).slice(-2)}`;
    }

    // Verifica se a data está no formato yyyy-mm-dd
    if (data.includes('-')) {
        return data.replace(/-/g, '');
    }

    // Verifica se a data está no formato dd/mm/yyyy
    if (data.includes('/')) {
        const partes = data.split(' ')[0].split('/');
        return `${partes[2]}${partes[1]}${partes[0]}`;
    }

    return '';
}

function selecionarTodasConciliações(element) {
    let id = $(element).attr('id');
    let label = $(`label[for='${id}']`);
    let stChecked = $(element).prop('checked');
    let tabela = $('#dt-basic-conciliarbanco').DataTable();

    label.text(stChecked ? 'Desmarcar Todos' : 'Marcar Todos');

    if(stChecked){
        Swal.fire({
            type: 'question',
            title: 'Selecione o modo de seleção',
            text: 'Deseja selecionar todos da tabela ou somente o que está em tela?',
            showConfirmButton: true,
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: 'Todos os registros',
            cancelButtonText: 'Apenas o que está tela',
            cancelButtonColor: '#2196F3',
            allowOutsideClick: false,
        })
        .then((resp)=>{
            if(resp.value){
                tabela.rows().every(function () {
                    let linhaTabela = $(this.node())
                    $row = linhaTabela;

                    linhaTabela.find("input[name='chkConciliacao']").prop('checked', stChecked).trigger('change');
                });
            } 

            if (resp.dismiss == 'cancel'){
                $("input[name='chkConciliacao']").prop('checked', stChecked).trigger('change');
            }
        })
    } else {
        tabela.rows().every(function () {
            let linhaTabela = $(this.node())
            $row = linhaTabela;

            linhaTabela.find("input[name='chkConciliacao'").prop('checked', stChecked).trigger('change');
        });
    }
}

async function ListaConciliarBanco() {
    try {
        animationLoadingStart();

        await $.get("financeiro_action_listconciliarbanco.html", (respHtml) => {
            $("#js-page-content").html(respHtml);

            $('.dataAtual').text(dataAtual);
            $("#idcontabanco").select2();
        })
            .fail((error) => { throw new Error(error) });

        await ajaxGetAllData('api/conta-banco.xsjs', false)
            .then(retornoListaContaBancoSelect)
            .catch((error) => { throw new Error(error) });

        animationLoadingStop();

        setTimeout(() => $("#idcontabanco").select2('open'), 300);
    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function pesq_conciliar_banco_compensacao() {
    try {
        let IDConta = $("#idcontabanco").val() || '';
        let datapesqinicio = $("#dtconsultainicio").val() || '';
        let datapesqfim = $("#dtconsultafim").val() || '';
        let datacompinicio = $("#dtcompinicio").val() || '';
        let datacompfim = $("#dtcompfim").val() || '';
        let datamovinicio = $("#dtmovinicio").val() || '';
        let datamovfim = $("#dtmovfim").val() || '';


        if ((datapesqinicio == '' && datapesqfim == '') && (datacompinicio == '' && datacompfim == '') && (datamovinicio == '' && datamovfim == '')) {
            return msgWarning('Informe ao menos uma das Datas para a pesquisa').then(() => {
                setTimeout(() => $("#dtconsultainicio").focus(), 300)
            });
        }

        if ((datapesqinicio != '' && datapesqfim != '') && (datacompinicio != '' && datacompfim != '') && (datamovinicio != '' && datamovfim != '')) {

            return msgWarning('Informe só uma das Datas: DEPÓSITO OU COMPENSAÇÃO').then(() => {
                setTimeout(() => $("#dtconsultainicio").focus(), 300)
            });
        }

        await ajaxGetAllData(`api/financeiro/deposito-loja.xsjs?page=1&pageSize=1000&idConta=${IDConta}&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}&dataCompInicio=${datacompinicio}&dataCompFim=${datacompfim}&datamovinicio=${datamovinicio}&datamovfim=${datamovfim}`)
            .then(retornoListaConciliarCompensacao)
            .catch((error) => { throw new Error(error) });

        if (datamovinicio != '' && datamovfim != '') {
            $('.panel-hdr').html(`<h2>Lista de Compensação <span class="fw-300"><i>Por Bancos</i> - Pesquisa pela data do Movimento</span></h2>`);
        }

        if (datacompinicio != '' && datacompfim != '') {
            $('.panel-hdr').html(`<h2>Lista de Compensação <span class="fw-300"><i>Por Bancos</i> - Pesquisa pela data da Compensação</span></h2>`);
        }

        if (datapesqinicio != '' && datapesqfim != '') {
            $('.panel-hdr').html(`<h2>Lista de Compensação <span class="fw-300"><i>Por Bancos</i> - Pesquisa pela data do Depósito</span></h2>`);
        }

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaConciliarCompensacao(respostaListaConciliarCompensacao) {
    let { data } = respostaListaConciliarCompensacao || '';
    let contaBancoSelecionada = $('#idcontabanco').val();
    let dadosTable = [];
    let totalVrDepositadoCons = 0;

    $('#totalResultadoConciliarBanco').html('');

    if (data?.length > 0) {
        for (let registro of data) {
            let contaCreditoSap = registro.CONTACREDITOSAP;
            let contaDebitoSap = registro.NUCONTASAP;
            let idDepositoConciliar = registro.IDDEPOSITOLOJA;
            let dataMovimentoCaixaConciliar = registro.DTMOVIMENTOCAIXA;
            let dataCompensacaoConciliar = registro.DTCOMPENSACAO;
            let dataDepositoConciliar = registro.DTDEPOSITO;

            let valorDepositoConciliar = registro.VRDEPOSITO;
            let statusConciliar = registro.STCANCELADO;
            let descricaoContaBancoConciliar = registro.DSCONTABANCO;
            let DocumentoConciliar = registro.NUDOCDEPOSITO;
            let descricaoBancoConciliar = registro.DSBANCO;
            let noFantasiaConciliar = registro.NOFANTASIA;
            let stConferidoDepConciliar = registro.STCONFERIDO;
            let contaTransitoriaSap = '';

            if (contaBancoSelecionada === '43' || contaBancoSelecionada === '218' || contaBancoSelecionada === '58' || contaBancoSelecionada === '10006' || contaBancoSelecionada === '10018' || contaBancoSelecionada === '10008') {
                contaTransitoriaSap = '1.01.01.01.0003';
            } else if (contaBancoSelecionada === '3') {
                contaTransitoriaSap = '1.01.01.01.0004';
            } else if (contaBancoSelecionada === '10023') {
                contaTransitoriaSap = '4.01.01.09.0004';
            } else if (contaBancoSelecionada === '10') {
                contaTransitoriaSap = '1.01.01.01.0002';
            }

            if (stConferidoDepConciliar == 'True') {
                htmlStConfConciliar = `<label style="color: green; font-size: 11px;"><b>Conciliado</b></label>`;
                htmlOpcaoConciliar = `<div class="btn-group btn-group-xs">
                            <button type="button" class="btn btn-danger btn-xs" title="Cancelar Conciliação" id="`+ idDepositoConciliar + `" onclick="cancelarConciliacaoDeposito(this.id);">Cancelar</button>
                        </div>`;
            } else {
                htmlStConfConciliar = `<label style="color: red; font-size: 11px;"><b>Não Conciliado</b></label>`;
                htmlOpcaoConciliar = `<div class="btn-group btn-group-xs"></div>`;
            }

            if (dataCompensacaoConciliar == null || dataCompensacaoConciliar == '') {
                dataCompensacaoConciliar = '';
            } else {
                dataCompensacaoConciliar = dataCompensacaoConciliar;
            }

            if (statusConciliar === 'False') {
                htmlStatusConciliar = `<label style="color: blue; font-size: 11px;"><b>Dep. Ativo</b></label>`;
                totalVrDepositadoCons = totalVrDepositadoCons + valorDepositoConciliar;
            } else if (statusConciliar === 'True') {
                htmlStatusConciliar = `<label style="color: red; font-size: 11px;"><b>Dep. Cancelado</b></label>`;
            }

            dadosTable.push([
                noFantasiaConciliar,
                contaTransitoriaSap,
                contaDebitoSap,
                dataCompensacaoConciliar,
                descricaoBancoConciliar,
                parseFloat(valorDepositoConciliar.replace(',', '.')),
                DocumentoConciliar,
                htmlStatusConciliar,
                htmlStConfConciliar,
                htmlOpcaoConciliar
            ]);

        }

    }

    $('#resultado').html(`
        <div class="row">
            <div class="col-xl-12">
                <div id="panel-1" class="panel">
                    <div class="panel-hdr">
                        <h2>
                            Lista de Depósitos <span class="fw-300"><i>Por Bancos</i></span>
                        </h2>
                        <div class="panel-toolbar">
                            <button class="btn btn-panel" data-action="panel-collapse" data-toggle="tooltip" data-offset="0,10" data-original-title="Recolher"></button>
                        </div>
                    </div>
                    <div class="panel-container show">
                        <div class="panel-content">
                            <table id="dt-basic-conciliarbanco" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                                <thead class="bg-primary-600">
                                    <tr>
                                        <th>Loja</th>             
                                        <th>Conta Transitória</th>
                                        <th>Conta Débito</th>
                                        <th>Data Compensação</th>
                                        <th>Banco</th>
                                        <th>Valor</th>
                                        <th>Doc.</th>
                                        <th>Status</th>
                                        <th>Situação</th>
                                        <th>Opções</th>
                                    </tr>
                                </thead>
                                <tbody id="resultadoConciliarBanco">
                                </tbody>
                                <tfoot id="totalResultadoConciliarBanco"class="thead-themed">
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);


    $('#dt-basic-conciliarbanco').DataTable({
        data: dadosTable,
        deferRender: true,
        title: 'Conciliação de Depósitos Compensação  por Bancos',
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
                    format: {
                        body: function (data, row, column, node) {
                            if (column === 3) {
                                return formatarData(data);
                            }
                            if (column === 5) {
                                return parseFloat(data.toString().replace('.', ','));
                            }
                            if (column === 7 || column === 8 || column === 9) {
                                return $(data).text();
                            }
                            return data;
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

    $('#totalResultadoConciliarBanco').html(
        `<tr>
            <th colspan="5" style="text-align: center;">Total</th>
            <th>` + mascaraValor(parseFloat(totalVrDepositadoCons).toFixed(2)) + `</th>
            <th colspan="4" style="text-align: center;"></th>
        </tr>`
    );
}

async function pesq_conciliar_banco() {
    try {
        let IDConta = $("#idcontabanco").val() || '';
        let datapesqinicio = $("#dtconsultainicio").val() || '';
        let datapesqfim = $("#dtconsultafim").val() || '';
        let datacompinicio = $("#dtcompinicio").val() || '';
        let datacompfim = $("#dtcompfim").val() || '';
        let datamovinicio = $("#dtmovinicio").val() || '';
        let datamovfim = $("#dtmovfim").val() || '';

        $('#btnIntegrarTodosDepositos').removeClass('d-flex').addClass('d-none');

        if ((datapesqinicio == '' && datapesqfim == '') && (datacompinicio == '' && datacompfim == '') && (datamovinicio == '' && datamovfim == '')) {
            return msgWarning('Informe ao menos uma das Datas para a pesquisa').then(() => {
                setTimeout(() => $("#dtconsultainicio").focus(), 300)
            });
        }

        if ((datapesqinicio != '' && datapesqfim != '') && (datacompinicio != '' && datacompfim != '') && (datamovinicio != '' && datamovfim != '')) {

            return msgWarning('Informe só uma das Datas: DEPÓSITO OU COMPENSAÇÃO').then(() => {
                setTimeout(() => $("#dtconsultainicio").focus(), 300)
            });
        }

        animationLoadingStart();

        let dados = await ajaxGetAllData(`api/financeiro/deposito-loja.xsjs?page=1&idConta=${IDConta}&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}&dataCompInicio=${datacompinicio}&dataCompFim=${datacompfim}&datamovinicio=${datamovinicio}&datamovfim=${datamovfim}`, false);

        await retornoListaConciliarBanco(dados);

        $('.dataAtual').text(dataAtual);

        if (datamovinicio != '' && datamovfim != '') {
            $('.panel-hdr').html(`<h2>Lista de Depósitos <span class="fw-300"><i>Por Bancos</i> - Pesquisa pela data do Movimento</span></h2>`);
        }

        if (datacompinicio != '' && datacompfim != '') {
            $('.panel-hdr').html(`<h2>Lista de Depósitos <span class="fw-300"><i>Por Bancos</i> - Pesquisa pela data da Compensação</span></h2>`);
        }

        if (datapesqinicio != '' && datapesqfim != '') {
            $('.panel-hdr').html(`<h2>Lista de Depósitos <span class="fw-300"><i>Por Bancos</i> - Pesquisa pela data do Depósito</span></h2>`);
        }

        animationLoadingStop();

    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function retornoListaConciliarBanco(respostaListaConciliarBanco) {
  let { data } = respostaListaConciliarBanco || '';
  let totalVrDepositadoCons = 0;
  let dadosTable = [];

  if (data?.length > 0) {
    $('#btnIntegrarTodosDepositos').removeClass('d-none').addClass('d-flex');

    for (let registro of data) {
      let idDepositoConciliar = registro.IDDEPOSITOLOJA;
      let dataMovimentoCaixaConciliar = registro.DTMOVIMENTOCAIXA;
      let dataCompensacaoConciliar = registro.DTCOMPENSACAO || '';
      let dtMovDeposito = registro?.DTMOVDEP;
      let dataDepositoConciliar = registro.DTDEPOSITO;
      let valorDepositoConciliar = registro.VRDEPOSITO;
      let statusConciliar = registro.STCANCELADO;
      let descricaoContaBancoConciliar = registro.DSCONTABANCO;
      let DocumentoConciliar = registro.NUDOCDEPOSITO;
      let descricaoBancoConciliar = registro.DSBANCO;
      let noFantasiaConciliar = registro.NOFANTASIA;
      let stConferidoDepConciliar = registro.STCONFERIDO;
      let stIntegrado = registro?.STINTEGRADOSAP == 'True';
      let docEntryContasPagar = registro?.DOCENTRY_SAP_CONTAS_A_PAGAR || 0;
      let docEntryContasReceber = registro?.DOCENTRY_SAP_CONTAS_A_RECEBER || 0;
      let stEmFilaParaIntegracao = registro.STATUS_BLOQUEIO_ATUALIZACAO == 'True';
      let erroLogIntegracao = registro?.ERRORLOGSAP?.trim()?.length > 0 ? ('Motivo: ' + registro?.ERRORLOGSAP?.trim()) : '';
      let htmlStatusConciliar = `<label style="color: red; font-size: 11px;"><b>Dep. Cancelado</b></label>`;
      let htmlStConfConciliar = `<label style="color: red; font-size: 11px;"><b>Não Conciliado</b></label>`;
      let htmlOpcaoConciliar = '';
      let htmlSelecao = '';
      let typeFuncMsg = erroLogIntegracao?.length > 0 ? 'msgWarning' : 'msgInfo';
      let titleMsgStatus = typeFuncMsg == 'msgWarning' ? 'Erro ao integrar no SAP' : 'Conciliado';
      let msgErrorComum = 'Motivo: Account for cash payments has not been defined';
      let caixaSelecao = `
        <div class="custom-control custom-checkbox">
            <input id="${idDepositoConciliar}" type="checkbox" class="custom-control-input" name="chkConciliacao" onchange="selecionarLinhaTable(this)">
            <label class="custom-control-label" for="${idDepositoConciliar}"></label>
        </div>
      `;

      let btnStatus = `
        <button type="button" class="btn btn-primary btn-xs  mr-2" title="Visualizar Status Integração Conciliação" onclick="${typeFuncMsg}('${titleMsgStatus}', '${erroLogIntegracao || 'Pronto para Integrar'}');">
            <span class="d-block fal fa-eye mr-1"></span>Status
        </button>
      `;

      let btnEditar = `
        <button type="button" class="btn btn-warning btn-xs mr-2" title="Editar Data Movimento Conciliação" onclick="editarDataMovimentoConciliacaoDeposito('${idDepositoConciliar}', '${dtMovDeposito}');">
            <span class="d-block fal fa-pen mr-1"></span>Editar
        </button>
      `;

      let btnIntegrar = `
        <button type="button" class="btn btn-info btn-xs mr-2" title="Integrar Conciliação" id="${idDepositoConciliar}" onclick="integrarConciliacaoDepositoNoSAP(this.id);">
            <span class="d-block fal fa-cloud-upload mr-1"></span>Integrar
        </button>
      `;

      let btnCancelar = `
        <button type="button" class="btn btn-danger btn-xs" title="Cancelar Conciliação" id="${idDepositoConciliar}" onclick="cancelarConciliacaoDeposito(this.id);">
            <span class="d-block fal fa-times mr-1"></span>Cancelar
        </button>
      `;

      if (docEntryContasPagar > 0 || docEntryContasReceber > 0) {
        btnCancelar = '';
      }

      if (stConferidoDepConciliar == 'True') {
        htmlStConfConciliar = `<label class="text-info fw-900" style="font-size: 12px;"><b>Conciliado</b></label>`;

        if (!stIntegrado) {
          if (stEmFilaParaIntegracao) {
            btnStatus = `
              <button type="button" class="btn btn-primary btn-xs  mr-2" title="Visualizar Status Integração Conciliação" onclick="msgInfo('Em Processo de Integração, Aguarde...', 'Motivo: Já está em processo de integração no SAP');">
                  <span class="d-block fal fa-eye mr-1"></span>Status
              </button>
            `;

            btnIntegrar = '';
            btnCancelar = '';

            htmlStConfConciliar = `<label class="text-primary cursor-pointer fw-900" style="font-size: 12px;" title='Conciliado e Aguardando na Fila de Integração'><b>Conciliado e Aguardando na Fila de Integração</b></label>`;
          } else {
            htmlSelecao = caixaSelecao;

            if (erroLogIntegracao?.length > 0) {
              if (erroLogIntegracao !== msgErrorComum) {
                erroLogIntegracao = await translateText(erroLogIntegracao);
              }

              erroLogIntegracao = erroLogIntegracao == msgErrorComum ? 'Conta de pagamentos em dinheiro não foi definida' : erroLogIntegracao.replaceAll("'", '');

              htmlStConfConciliar = `<label class="text-danger cursor-pointer fw-900" style="font-size: 12px;" title='${erroLogIntegracao}'><b>Conciliado / Error ao integrar</b></label>`;

              btnStatus = `
                <button type="button" class="btn btn-primary btn-xs  mr-2" title="Visualizar Status Integração Conciliação" onclick="msgWarning('Erro ao integrar no SAP', 'Motivo: ${erroLogIntegracao}');">
                    <span class="d-block fal fa-eye mr-1"></span>Status
                </button>
              `;
            }
          }

          htmlOpcaoConciliar = `
            <div class="d-flex justify-content-start">
              ${btnStatus}
              ${btnEditar}
              ${btnIntegrar}
              ${btnCancelar}
            </div>
          `;
        } else {
          htmlStConfConciliar = `<label class="text-success fw-900" style="font-size: 12px;"><b>Conciliado e Integrado</b></label>`;

          htmlOpcaoConciliar = `
            <div class="d-flex justify-content-start">
              ${btnEditar}
            </div>
          `;
        }
      }

      if (statusConciliar === 'False') {
        htmlStatusConciliar = `<label style="color: blue; font-size: 12px;"><b>Dep. Ativo</b></label>`;
        totalVrDepositadoCons = parseFloat(totalVrDepositadoCons) + parseFloat(valorDepositoConciliar);
      }

      dadosTable.push([
        htmlSelecao,
        idDepositoConciliar,
        noFantasiaConciliar,
        dataCompensacaoConciliar,
        dataDepositoConciliar,
        dataMovimentoCaixaConciliar,
        descricaoBancoConciliar,
        (parseFloat(valorDepositoConciliar).toFixed(2)),
        DocumentoConciliar,
        htmlStatusConciliar,
        htmlStConfConciliar,
        htmlOpcaoConciliar
      ]);

    }

  }

  $('#resultado').html(`
        <div class="row">
            <div class="col-xl-12">
                <div id="panel-1" class="panel">
                    <div class="panel-hdr">
                        <h2>
                            Lista de Depósitos <span class="fw-300"><i>Por Bancos</i></span>
                        </h2>
                        <div class="panel-toolbar">
                            <button class="btn btn-panel" data-action="panel-collapse" data-toggle="tooltip" data-offset="0,10" data-original-title="Recolher"></button>
                        </div>
                    </div>
                    <div class="panel-container show">
                        <div class="panel-content">
                            <table id="dt-basic-conciliarbanco" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                                <thead class="bg-primary-600">
                                    <tr>
                                        <th>Seleção</th>
                                        <th>ID</th>
                                        <th>Loja</th>
                                        <th>Data Compensação</th>
                                        <th>Data Depósito</th>
                                        <th>Data Movimento</th>
                                        <th>Banco</th>
                                        <th>Valor</th>
                                        <th>Doc.</th>
                                        <th>Status</th>
                                        <th>Situação</th>
                                        <th>Opções</th>
                                    </tr>
                                </thead>
                                <tbody id="resultadoConciliarBanco">
                                </tbody>
                                <tfoot id="totalResultadoConciliarBanco"class="thead-themed">
                                    <tr>
                                        <th colspan="7" style="text-align: center;">Total</th>
                                        <th></th>
                                        <th colspan="4" style="text-align: center;"></th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

  $('#dt-basic-conciliarbanco').DataTable({
    data: dadosTable,
    deferRender: false,
    responsive: true,
    dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
      "<'row'<'col-sm-12 caixa-selecao'>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    columnDefs: [
      { className: 'text-center', targets: 0 }
    ],
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
    ],
    initComplete: function () {
      $('.caixa-selecao').html(`
        <div id="chkMarcaTodos" class="mb-1 ${dadosTable.length > 0 ? '' : 'd-none'}">
            <div class="custom-control custom-checkbox">
                <input type="checkbox" id="selectAllConciliacoes" class="custom-control-input" onclick="selecionarTodasConciliações(this)">
                <label class="custom-control-label" for="selectAllConciliacoes">Marcar Todos</label>
            </div>
        </div>
      `);
    }
  });

  $('#totalResultadoConciliarBanco').html(`
    <tr>
      <th colspan="7" style="text-align: center;">Total</th>
      <th>${mascaraValor(parseFloat(totalVrDepositadoCons).toFixed(2))}</th>
      <th colspan="4" style="text-align: center;"></th>
    </tr>
  `);

}

async function pesq_conciliar_banco_consolidado() {
    try {
        let IDConta = $("#idcontabanco").val() || '';
        let datapesqinicio = $("#dtconsultainicio").val() || '';
        let datapesqfim = $("#dtconsultafim").val() || '';
        let datacompinicio = $("#dtcompinicio").val() || '';
        let datacompfim = $("#dtcompfim").val() || '';
        let datamovinicio = $("#dtmovinicio").val() || '';
        let datamovfim = $("#dtmovfim").val() || '';

        $('#btnIntegrarTodosDepositos').removeClass('d-flex').addClass('d-none');

        if ((datapesqinicio == '' && datapesqfim == '') && (datacompinicio == '' && datacompfim == '') && (datamovinicio == '' && datamovfim == '')) {
            return msgWarning('Informe ao menos uma das Datas para a pesquisa').then(() => {
                setTimeout(() => $("#dtconsultainicio").focus(), 300)
            });
        }

        if ((datapesqinicio != '' && datapesqfim != '') && (datacompinicio != '' && datacompfim != '') && (datamovinicio != '' && datamovfim != '')) {

            return msgWarning('Informe só uma das Datas: DEPÓSITO OU COMPENSAÇÃO').then(() => {
                setTimeout(() => $("#dtconsultainicio").focus(), 300)
            });
        }

        await ajaxGetAllData(`api/financeiro/deposito-loja-consolidado.xsjs?page=1&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}&dataCompInicio=${datacompinicio}&dataCompFim=${datacompfim}&datamovinicio=${datamovinicio}&datamovfim=${datamovfim}`)
            .then(retornoListaBancoConsolidado)
            .catch((error) => { throw new Error(error) });

        if (datamovinicio != '' && datamovfim != '') {
            $('.panel-hdr').html(`<h2>Lista de Depósitos <span class="fw-300"><i>Consolidado Por Marca e Por Bancos</i> - Pesquisa pela data do Movimento</span></h2>`);
        }

        if (datacompinicio != '' && datacompfim != '') {
            $('.panel-hdr').html(`<h2>Lista de Depósitos <span class="fw-300"><i>Consolidado Por Marca e Por Bancos</i> - Pesquisa pela data da Compensação</span></h2>`);
        }

        if (datapesqinicio != '' && datapesqfim != '') {
            $('.panel-hdr').html(`<h2>Lista de Depósitos <span class="fw-300"><i>Consolidado Por Marca e Por Bancos</i> - Pesquisa pela data do Depósito</span></h2>`);
        }

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaBancoConsolidado(respostaListaBancoConsolidado) {
    let { data } = respostaListaBancoConsolidado || '';
    let dadosTable = [];

    $('#resultado').html(`
        <div class="row">
            <div class="col-xl-12">
                <div id="panel-1" class="panel">
                    <div class="panel-hdr">
                        <h2>
                            Lista de Depósitos <span class="fw-300"><i>Por Bancos</i></span>
                        </h2>
                        <div class="panel-toolbar">
                            <button class="btn btn-panel" data-action="panel-collapse" data-toggle="tooltip" data-offset="0,10" data-original-title="Recolher"></button>
                        </div>
                    </div>
                    <div class="panel-container show">
                        <div class="panel-content overflow-auto">
                            <table id="dt-basic-consolidar" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                                <thead class="bg-primary-600 text-center" style="font-size: 12px;">
                                    <tr>
                                        <th>Grupo</th>
                                        <th>BB</th>
                                        <th>Itau</th>
                                        <th>Bradesco</th>
                                        <th>BRB</th>
                                        <th>Caixa</th>
                                        <th>Santander</th>
                                        <th>R. TED</th>
                                        <th>CX Tesoura</th>
                                        <th>C. Credsystem</th>
                                        <th>D. PIX</th>
                                        <th>D. Dinheiro</th>
                                        <th>Prem. Prom</th>
                                        <th>Transp. Valor</th>
                                        <th>D. Sobra CX</th>
                                        <th>Total Bandeira</th>
                                    </tr>
                                </thead>
                                <tbody id="resultadoConciliarBanco" style="color: blue; font-size: 11px;"></tbody>
                                <tfoot id="totalResultadoConsolidado" class="thead-themed">
                                    <tr>
                                        <th>Total</th>
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
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

    if (data.length > 0) {
        for (let registro of data) {
            let DsSubGrupoEmp = registro.DSSUBGRUPOEMPRESARIAL;
            let VrTotalBB = registro.TOTALDEPBB;
            let VrTotalITAU = registro.TOTALDEPITAU;
            let VrTotalBRAD = registro.TOTALDEPBRAD;
            let VrTotalBRB = registro.TOTALDEPBRB;
            let VrTotalCX = registro.TOTALDEPCX;
            let VrTotalSANT = registro.TOTALDEPSANT;
            let VrTotalTED = registro.TOTALDEPTED;
            let VrTotalCXTES = registro.TOTALDEPCXTES;
            let VrTotalCREDS = registro.TOTALDEPCREDS;
            let VrTotalDPIX = registro.TOTALDEPDPIX;
            let VrTotalDDIN = registro.TOTALDEPDDIN;
            let VrTotalPROM = registro.TOTALDEPPROM;
            let VrTotalTVALOR = registro.TOTALDEPTVALOR;
            let VrTotalDEVCX = registro.TOTALDEPDEVCX;
            let VrDepositadoBandeira = parseFloat(VrTotalBB) + parseFloat(VrTotalBRB) + parseFloat(VrTotalBRAD) + parseFloat(VrTotalITAU) + parseFloat(VrTotalCX) + parseFloat(VrTotalSANT) + parseFloat(VrTotalTED) + parseFloat(VrTotalCXTES) + parseFloat(VrTotalCREDS) + parseFloat(VrTotalDPIX) + parseFloat(VrTotalDDIN) + parseFloat(VrTotalPROM) + parseFloat(VrTotalTVALOR) + parseFloat(VrTotalDEVCX);

            dadosTable.push([
                DsSubGrupoEmp,
                mascaraValor(parseFloat(VrTotalBB).toFixed(2)),
                mascaraValor(parseFloat(VrTotalITAU).toFixed(2)),
                mascaraValor(parseFloat(VrTotalBRAD).toFixed(2)),
                mascaraValor(parseFloat(VrTotalBRB).toFixed(2)),
                mascaraValor(parseFloat(VrTotalCX).toFixed(2)),
                mascaraValor(parseFloat(VrTotalSANT).toFixed(2)),
                mascaraValor(parseFloat(VrTotalTED).toFixed(2)),
                mascaraValor(parseFloat(VrTotalCXTES).toFixed(2)),
                mascaraValor(parseFloat(VrTotalCREDS).toFixed(2)),
                mascaraValor(parseFloat(VrTotalDPIX).toFixed(2)),
                mascaraValor(parseFloat(VrTotalDDIN).toFixed(2)),
                mascaraValor(parseFloat(VrTotalPROM).toFixed(2)),
                mascaraValor(parseFloat(VrTotalTVALOR).toFixed(2)),
                mascaraValor(parseFloat(VrTotalDEVCX).toFixed(2)),
                mascaraValor(parseFloat(VrDepositadoBandeira).toFixed(2)),
            ]);

        }

    }

    $('#dt-basic-consolidar').DataTable({
        data: dadosTable,
        deferRender: true,
        responsive: false,
        scrollX: true,
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
                            return $.isNumeric(data.replace(/[R$\s.]/g, '').replace(',', '.')) ? data.replace(',', '.') : data;
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
        footerCallback: function (row, data, start, end, display) {
            const api = this.api();

            function parseValor(val) {
                return $.isNumeric(val) ? val : parseFloat(String(val).replace(/[R$\s.]/g, '').replace(',', '.') || 0);
            }

            const totalCols = 15;
            for (let i = 1; i <= totalCols; i++) {
                let total = api
                    .column(i, { page: 'current' }) // ou 'all'
                    .data()
                    .reduce((a, b) => parseValor(a) + parseValor(b), 0);

                $(api.column(i).footer()).html(mascaraValor(total.toFixed(2)));
            }

            // Primeira coluna: label "Total"
            $(api.column(0).footer()).html('<strong>Total</strong>');
        }
    });
}

function integrarTodasConciliacoesDepositosNoSAP() {
    let dados = [];

    msgQuestion('Certeza que Deseja Integrar todas as Conciliações de Depósitos deste período no SAP?')
        .then(async (respQuestion) => {
            try {
                if (respQuestion.value == true) {
                    let tabela = $('#dt-basic-conciliarbanco').DataTable();

                    animationLoadingStart('Integrando Conciliações...', 100, false);

                    tabela.rows().every(function () {
                        let linhaTabela = $(this.node())
                        let chkLine = linhaTabela.find("input[name='chkConciliacao']:checked") || false;
                        
                        if ($(chkLine).prop('checked')){
                            let idDeposito = parseInt($(chkLine).attr('id'));

                            dados.push({
                                "IDDEPOSITOLOJA": parseInt(idDeposito)
                            })
                        }
                    });
                   //return console.log('CONCILIACOES: ', dados)
                    if(dados.length <= 0){
                        return msgInfo('Nenhum registro selecionado!', 'Verifique e tente novamente!')
                    }

                    let textdados = JSON.stringify(dados);
                    let textoFuncao = 'FINANCEIRO/INTEGRACAO TODAS CONCILIAÇÕES DE DEPOSITOS';
                    let dadosLog = [{
                        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                        "PATHFUNCAO": textoFuncao,
                        "DADOS": textdados,
                        "IP": ipCliente
                    }];

                    let msgRetorno = '';
                    let text = '';

                    await ajaxPost('api/service-layer/deposito/jobs/depositos-integracao.xsjs', dados)
                        .catch((error) => {

                            if(error?.status !== 400){
                                msgRetorno = 'Tempo de processamento em tela expirado!';
                                text = 'As integrações continuarão em segundo plano. Para verificação de status, pesquise novamente!'
                                return;
                            } else{
                                throw new Error(error);
                            }
                        });

                    await ajaxPost("api/log-web.xsjs", dadosLog).catch((error) => { throw new Error(error) });

                    msgRetorno.length > 0 ? await msgInfo(msgRetorno, text, false) : await msgSuccess('Integrado com sucesso!');

                    pesq_conciliar_banco();
                }
            } catch (error) {
                console.log(error);
                msgError('Erro ao enviar os dados');
            }
        })
}

function integrarConciliacaoDepositoNoSAP(idDeposito) {
    msgQuestion('Certeza que Deseja Integrar a Conciliação do Depósito no SAP?')
        .then(async (respQuestion) => {
            try {
                if (respQuestion.value == true) {
                    animationLoadingStart('Integrando a Conciliação...', 100, false);

                    let dados = [{
                        "IDDEPOSITOLOJA": parseInt(idDeposito)
                    }];

                    let textdados = JSON.stringify(dados);
                    let textoFuncao = 'FINANCEIRO/INTEGRACAO CONCILIAÇÃO DO DEPOSITO';
                    let dadosLog = [{
                        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                        "PATHFUNCAO": textoFuncao,
                        "DADOS": textdados,
                        "IP": ipCliente
                    }];

                    let msgRetorno = '';
                    let text = '';

                    await ajaxPost(`api/service-layer/deposito/jobs/depositos-integracao.xsjs?`, dados)
                        .catch((error) => {

                            if (error?.status !== 400) {
                                msgRetorno = 'Tempo de processamento em tela expirado!';
                                text = 'As integrações continuarão em segundo plano. Para verificação de status, pesquise novamente!'
                                return;
                            } else {
                                throw new Error(error);
                            }
                        });

                    await ajaxPost("api/log-web.xsjs", dadosLog).catch((error) => { throw new Error(error) });

                    msgRetorno.length > 0 ? await msgInfo(msgRetorno, text, false) : await msgSuccess('Integrado com sucesso!');

                    pesq_conciliar_banco();
                }
            } catch (error) {
                console.log(error);
                msgError('Erro ao enviar os dados');
            }
        })
}

function cancelarConciliacaoDeposito(idDeposito) {
    msgQuestion('Certeza que Deseja Cancelar a Conciliação do Depósito?')
        .then(async (respQuestion) => {
            try {
                if (respQuestion.value == true) {
                    animationLoadingStart('Cancelando a Conciliação...', 100, false);

                    let dados = {
                        "IDDEPOSITOLOJA": parseInt(idDeposito)
                    };

                    let textdados = JSON.stringify(dados);
                    let textoFuncao = 'FINANCEIRO/CANCELADO CONCILIAÇÃO DO DEPOSITO';
                    let dadosLog = [{
                        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                        "PATHFUNCAO": textoFuncao,
                        "DADOS": textdados,
                        "IP": ipCliente
                    }];

                    await ajaxPut("api/financeiro/atualizar-deposito-loja.xsjs", dados).catch((error) => { throw new Error(error) });

                    await ajaxPost("api/log-web.xsjs", dadosLog).catch((error) => { throw new Error(error) });

                    await msgSuccess('Cancelado com sucesso!');

                    funcSucessUpdateConcDep();
                }
            } catch (error) {
                console.log(error);
                msgError('Erro ao enviar os dados');
            }
        })
}

function editarDataMovimentoConciliacaoDeposito(idDeposito, dtOriginal){
  let dtMovimentoNovo = '';

  Swal.fire({
    type:'info',
    title: "Insira a nova Data Movimento: ",
    html: `
      <div>
        <input type="date" id="dtModal" class="form-control swal2-input w-50" value="${dtOriginal}">
      </div>
    `,
    focusConfirm: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCloseButton: true,
    confirmButtonText: 'Confirmar',
    confirmButtonColor: '#d33',
    showCancelButton: true,
    cancelButtonColor: '#3085d6',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      let dtModal = $('#dtModal').val();
      let date = new Date(dtModal);
      let now = new Date();

      if (isNaN(date.getTime())) {
        Swal.showValidationMessage(`<span class="text-danger fw-900">Nova Data Movimento vazia ou inválida!</span>`);
      }

      if (dtModal == dtOriginal){
        Swal.showValidationMessage(`<span class="text-danger fw-900">Nova Data Movimento não pode ser igual a Data Original!</span>`);
      }

      date.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if(date.getTime() > now.getTime()){
        Swal.showValidationMessage(`<span class="text-danger fw-900">Nova Data Movimento não pode ser maior que a data atual!</span>`);
      };

      dtMovimentoNovo = dtModal;
    }
  })
  .then((resp)=> {
    if(resp?.value){
      msgQuestion('Certeza que Deseja Alterar a Data de Movimento do Depósito?')
        .then(async (respQuestion) => {
          try {
            if (respQuestion.value == true) {
              animationLoadingStart('Atualizando Data do Movimento...', 100, false);

              let dados = [{
                "IDDEPOSITOLOJA": parseInt(idDeposito),
                "DTMOVIMENTOCAIXA": dtMovimentoNovo
              }];

              let textdados = JSON.stringify(dados);
              let textoFuncao = 'FINANCEIRO/ALTERAÇÃO DATA DE MOVIMENTO DO DEPOSITO';
              let dadosLog = [{
                "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                "PATHFUNCAO": textoFuncao,
                "DADOS": textdados,
                "IP": ipCliente
              }];

              await ajaxPut(`api/financeiro/deposito-alteracao-data-movimento.xsjs?`, dados);

              await ajaxPost("api/log-web.xsjs", dadosLog);

              await msgSuccess('Data de Movimento Alterada Com Sucesso!');

              pesq_conciliar_banco();
            }
          } catch (error) {
            console.log(error);
            msgError('Erro ao tentar alterar a data de movimento');
          }
        })
    }

  })
}

function funcSucessUpdateConcDep() {
    let IDConta = $("#idcontabanco").val() || '';
    let datapesqinicio = $("#dtconsultainicio").val() || '';
    let datapesqfim = $("#dtconsultafim").val() || '';

    ajaxGetAllData(`api/financeiro/deposito-loja.xsjs?pageSize=500&page=1&idConta=${IDConta}&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}`)
        .then(retornoListaConciliarBanco)
        .catch(funcError);

}

//? ============================================== FIM ROTINA MENU LISTA CONCILIAÇÃO POR BANCOS ==============================================//

//? ======================================================== INICIO ROTINA CONTAS DE BANCOS ===================================================== //
// AUTOR: Hendryw Deyvison
// E-mail: hendryw.deyvison@gmail.com
// Data: 07/07/2025

// INICIO FUNCOES GLOBAIS DA ROTINA

function selecionarLinhaTable(elementoChk){
    let stCheckLinha = $(elementoChk).prop('checked');
    let linhaElemento = $(elementoChk).closest('tr');

    if (stCheckLinha){
        linhaElemento.addClass('selected fw-900').css("opacity", 0.8);
        linhaElemento.attr('title', 'Selecionado!');
    } else {
        linhaElemento.removeClass('selected fw-900').css("opacity", 1);
        linhaElemento.attr('title', 'Não Selecionado');
    }
}

function montarSelectBancos(dados, idSelect = '#idSelectBanco', selectedValue = ''){
    let { data } = dados || '';

    idSelect = idSelect.includes('#') ? idSelect : ('#'+idSelect);

    $(idSelect).html('<option value="">Selecione...</option>');

    if(data.length > 0){
        for(let {IDBANCO, DSBANCO} of data){
            $(idSelect).append(`<option value="${IDBANCO}">${DSBANCO}</option>`);
        }
    }

    $(idSelect).select2();

    if(selectedValue){
        $(idSelect).val(selectedValue).trigger('change')
    }

}

function montarSelectContasBancos(dados, idSelect = '#idSelectContaBanco', selectedValue = '') {
    let { data } = dados || '';

    idSelect = idSelect.includes('#') ? idSelect : ('#' + idSelect);

    $(idSelect).html('<option value="">Selecione...</option>');

    if (data.length > 0) {
        for (let { IDCONTABANCO, DSCONTABANCO } of data) {
            $(idSelect).append(`<option value="${IDCONTABANCO}"> ${IDCONTABANCO} - ${DSCONTABANCO}</option>`);
        }
    }

    $(idSelect).select2();

    if (selectedValue) {
        $(idSelect).val(selectedValue).trigger('change')
    }

}

function montarSelectEmpresas(dados, idSelect = '#idSelectEmpresa', selectedValue = '') {
    let { data } = dados || '';

    idSelect = idSelect.includes('#') ? idSelect : ('#' + idSelect);

    $(idSelect).html('<option value="">Selecione...</option>');

    if (data.length > 0) {
        for (let { IDEMPRESA, NOFANTASIA } of data) {
            $(idSelect).append(`<option value="${IDEMPRESA}"> ${NOFANTASIA}</option>`);
        }
    }

    $(idSelect).select2();

    if (selectedValue) {
        $(idSelect).val(selectedValue).trigger('change')
    }

}

function montarTabelaEmpresasParaVincular(dados){
    let { data } = dados || '';
    let dadosTable = [];
    let contador = 0;
    let objDsGrupo = {
        1: 'TO',
        2: 'MG',
        3: 'YO',
        4: 'FC',
        5: 'OUTLET'
    };

    if (data.length > 0) {
        for (let { IDEMPRESA, IDGRUPOEMPRESARIAL, NOFANTASIA } of data) {
            let chkSelecao = `
                <div class="custom-control custom-checkbox">
                    <input id="${IDEMPRESA}" type="checkbox" class="custom-control-input" name="selecaoEmpresaContaBanco" onchange="selecionarLinhaTable(this)">
                    <label class="custom-control-label" for="${IDEMPRESA}"></label>
                </div>
            `;

            let keyDsGrupo = (NOFANTASIA.toUpperCase()).includes('OUTLET') ? 5 : IDGRUPOEMPRESARIAL;

            contador++;

            dadosTable.push([
                contador,
                chkSelecao,
                objDsGrupo[keyDsGrupo],
                NOFANTASIA
            ])
        }
    }

    $('#containerEmpresasVinculoConta').html(`
        <div class="row">
            <div class="col-xl-12">
                <div id="panel-1" class="panel">
                    <div class="panel-hdr">
                        <h2>
                            Lista de Empresas para Vincular
                        </h2>
                    </div>
                    <div class="panel-container show">
                        <div class="panel-content">
                            <div>
                                <table id="dt-basic-empresas-conta-banco" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                                    <thead class="text-center bg-primary-600">
                                        <tr>
                                            <th>#</th>
                                            <th>Vinculo</th>
                                            <th>Grupo</th>
                                            <th>Empresa</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

    let tabela = $('#dt-basic-empresas-conta-banco').DataTable({
        data: dadosTable,
        deferRender: false,
        responsive: true,
        autoWidth: false,
        "columnDefs": [
            { "width": "5%", "targets": 0 },
            { "width": "5%", "className": "text-center", "targets": 1 },
            { "width": "5%", "className": "text-center", "targets": 2 },
            { "width": "75%","targets": 3 },
        ]
    });

    tabela.on('draw', function () {
        tabela.rows({ page: 'current' }).every(function () {
            const $row = $(this.node());
            const checkbox = $row.find('input[type="checkbox"]:checked');
            checkbox && selecionarLinhaTable(checkbox);
        });
    });
}

async function buscarContasDoBancoSelecionado(idBanco){
    try{
        await ajaxGetAllData(`api/financeiro/conta-banco.xsjs?idBanco=${idBanco}`)
            .then(montarSelectContasBancos)
            .catch((error) => { throw new Error(error) });
    }catch(error){
        console.log(error);
        msgError('Erro ao buscar as contas relacionadas ao banco selecionado!', 'Recarregue e tente novamente!');
    }
}

async function abrirModalContaBanco() {
    try {
        animationLoadingStart();

        $('#modalContaBanco').off('onchange');

        await $.get('financeiro_action_form_modal_conta_banco.html', (res) => $('#resultModalContaBanco').html(res)).fail((error) => { throw new Error(error) });

        await ajaxGetAllData('api/banco.xsjs', false)
            .then((dados) => montarSelectBancos(dados, '#idSelectBancoModal'))
            .catch((error) => { throw new Error(error) });

        /*await ajaxGetAllData('api/empresa.xsjs', false)
            .then(montarTabelaEmpresasParaVincular)
            .catch((error) => { throw new Error(error) });*/

        $("#modalContaBanco").modal({
            backdrop: 'static',
            keyboard: false,
            show: true
        });

        $('#footerModalContaBanco').html(`
            <button type="button" class="btn btn-info" onclick="cadastrarContaBanco()">
                <span class="fal fa-plus mr-1"></span>Cadastrar
            </button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>    
        `);

        $('#tpPessoaContaBancoModal, #tpContaBancoModal').select2();
        $('#stContaBancoModal option').select2({
            disabled: true
        });

        $('#modalContaBanco .modal-title').html(`<span>Cadastro de Conta <small class="m-0 text-muted"> Cadastrar Conta </small> </span>`);

        animationLoadingStop();

        $("#idSelectBancoModal").focus();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function habilitarButtonEditarContaBanco(dadosHistorico){
    let campos = {
        IDBANCO: "#idSelectBancoModal",
        TPPESSOA: "#tpPessoaContaBancoModal",
        TPCONTA: "#tpContaBancoModal",
        NUAGENCIA: "#numAgenciaContaBanco",
        NUDIGITOAGENCIA: "#numDigitoAgenciaContaBanco",
        NUCONTA: "#numContaBanco",
        NUDIGITOCONTA: "#numDigitoContaBanco",
        DSCONTABANCO: "#dsContaBancoModal",
        NUCONTASAP: "#nuContaSapModal",
        STATIVO: "#stContaBancoModal"
    };

    for (let [campo, seletor] of Object.entries(campos)) {
        let valorAtual = $(seletor).val();
        let valorHistorico = dadosHistorico[campo] || '';
        if (valorAtual != valorHistorico) {
            return $('#footerModalContaBanco button.btn-warning').removeClass('d-none');
        }
    }

    return $('#footerModalContaBanco button.btn-warning').addClass('d-none');
}

async function validarDadosContaAntesDeInserirOuAtualizar(elementosDoModal, idsPreenchimentoObrigatorios, dados, stCadastrar = true){
    let {
        IDCONTABANCO,
        IDBANCO,
        NUAGENCIA,
        NUDIGITOAGENCIA,
        NUCONTA,
        NUDIGITOCONTA
    } = dados || '';

    for (let el of elementosDoModal) {
        let { id, value } = el || '';
        let labelCampo = $(`label[for=${id}]`).text();
        let campo = $(el);

        if (value.length <= 0 && idsPreenchimentoObrigatorios.includes(id)) {
            await msgWarning(`Preenha o Campo( ${labelCampo} ) e tente novamente`);

            $('#modalContaBanco').animate({
                scrollTop: campo.offset().top
            }, 1000);

            setTimeout(() => campo.is('input') ? campo.focus() : campo.select2('open'), 1000);

            return false;
        }

    }
    

    let { data } = await ajaxGetAllData(`api/financeiro/conta-banco.xsjs?idBanco=${IDBANCO}&nuAgencia=${NUAGENCIA}&nuDigitoAgencia=${NUDIGITOAGENCIA}&nuConta=${NUCONTA}&nuDigitoConta=${NUDIGITOCONTA}`) || '';

    if (data.length > 0) {

        if (!stCadastrar && data[0].IDCONTABANCO == IDCONTABANCO){
            return true;
        }

        await  msgWarning('Já existe uma conta com esses dados cadastrada, verifique os dados e tente novamente!', `Descrição da Conta Existente: ${(data[0].IDCONTABANCO + ' - ' + data[0]?.DSCONTABANCO)}`);

        $('#modalContaBanco').animate({
            scrollTop: $('#modalContaBanco .modal-header').offset().top
        }, 1000);

        return false;
    }

    return true;
}

// FIM FUNCOES GLOBAIS DA ROTINA

async function TelaListarContas() {
    try {
        animationLoadingStart();

        await $.get("financeiro_action_tela_principal_lista_contas_bancos.html", (respHtml) => $('#js-page-content').html(respHtml)).fail((error) => { throw new Error(error) });

        await ajaxGetAllData('api/banco.xsjs', false)
            .then(montarSelectBancos)
            .catch((error) => { throw new Error(error) });

        await ajaxGetAllData('api/financeiro/conta-banco.xsjs', false)
            .then(montarSelectContasBancos)
            .catch((error) => { throw new Error(error) });

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(montarSelectEmpresas)
            .catch((error) => { throw new Error(error) });

        $("#dsContaBanco").on('keypress', (e) => { if (e.keyCode == 13) pesquisarContaBanco() });

        $('html, body').animate({
            scrollTop: $('#js-page-content').offset().top
        }, 1000);

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function pesquisarContaBanco() {
    try {
        let idBanco = $('#idSelectBanco').val() || '';
        let idContaBanco = $('#idSelectContaBanco').val() || '';
        let idEmpresa = $('#idSelectEmpresa').val() || '';
        let dsConta = $('#dsContaBanco').val() || '';

        await ajaxGetAllData(`api/financeiro/conta-banco.xsjs?id=${idContaBanco}&idBanco=${idBanco}&idEmpresa=${idEmpresa}&dsConta=${dsConta}`)
            .then(retornoListaContas)
            .catch((error) => { throw new Error(error) });

        animationLoadingStop();

        $("#idSelectBanco").focus();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaContas(dados){
    let { data } = dados || '';
    let dadosTable = [];
    let contador = 0;

    if(data.length > 0 ){
        for(let registro of data){
            let{
                IDCONTABANCO,
                DSCONTABANCO,
                DSBANCO,
                NUBANCO,
                NUAGENCIA,
                NUDIGITOAGENCIA,
                NUCONTA,
                NUDIGITOCONTA,
                TPPESSOA,
                STATIVO
            } = registro || '';
            let tagStatus = STATIVO == 'True' ? `<span class="text-info fw-900">ATIVA</span>` : `<span class="text-danger fw-900">INATIVA</span>`;
            let containerButtons = `
                <div class="d-flex justify-content-center">
                    <button type="button" class="btn btn-warning btn-xs mr-2" title="Editar Conta" onclick="abrirModalEdicaoDadosContaBanco(${IDCONTABANCO});"><span class="fal fa-pen-alt mr-1"></span>Editar</button>
                </div>
            `;

            DSCONTABANCO = IDCONTABANCO + ' - ' + DSCONTABANCO;

            NUAGENCIA = !NUAGENCIA ? 'Não Informado' : NUAGENCIA;
            NUCONTA = !NUCONTA ? 'Não Informado' : NUCONTA;

            NUAGENCIA += NUDIGITOAGENCIA?.length > 0 ? ('-' + NUDIGITOAGENCIA) : '';
            NUCONTA += NUDIGITOCONTA?.length > 0 ? ('-' + NUDIGITOCONTA) : '';

            contador++;

            dadosTable.push([
                contador,
                DSBANCO,
                DSCONTABANCO,
                NUAGENCIA,
                NUCONTA,
                TPPESSOA,
                tagStatus,
                containerButtons
            ])
        }
    }

    $('#resultado').html(`
        <div class="row">
            <div class="col-xl-12">
                <div id="panel-1" class="panel">
                    <div class="panel-hdr">
                        <h2>
                            Contas <span class="fw-300"><i>Por Loja</i></span>
                        </h2>
                    </div>
                    <div class="panel-container show">
                        <div class="panel-content">
                            <div>
                                <table id="dt-basic-pesq-contas" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                                    <thead class="text-center bg-primary-600">
                                        <tr>
                                            <th>#</th>
                                            <th>Banco</th>
                                            <th >Ds. Conta</th>
                                            <th >Nº Agência</th>
                                            <th >Nº Conta</th>
                                            <th >Tp. Conta</th>
                                            <th >Status</th>
                                            <th >Opções</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('#dt-basic-pesq-contas').DataTable({
        data: dadosTable,
        deferRender: false,
        responsive: true,
        "columnDefs": [
            /*{ "width": "05%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "15%", "targets": 3 },
            { "width": "15%", "targets": 5 },
            { "width": "15%", "targets": 6 },*/
            {className: "text-center", "targets": [6, 7] },
        ],
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

async function cadastrarContaBanco() {
    let IDBANCO = $("#idSelectBancoModal").val() || '';
    let TPPESSOA = $("#tpPessoaContaBancoModal").val() || '';
    let TPCONTA = $("#tpContaBancoModal").val() || '';
    let NUAGENCIA = $("#numAgenciaContaBanco").val() || '';
    let NUDIGITOAGENCIA = $("#numDigitoAgenciaContaBanco").val() || '';
    let NUCONTA = $("#numContaBanco").val() || '';
    let NUDIGITOCONTA = $("#numDigitoContaBanco").val() || '';
    let DSCONTABANCO = $("#dsContaBancoModal").val() || '';
    let NUCONTASAP = $("#nuContaSapModal").val() || '';
    let IDUSERULTIMAALTERACAO = Number(IDFuncionarioLogin);
    let VINCULOEMPRESAS = [];
    let tabela = $('#dt-basic-empresas-conta-banco').DataTable();
    let elementosDoModal = $("#resultModalContaBanco").find("select, input").not("#containerEmpresasVinculoConta select, #containerEmpresasVinculoConta input").get();
    let idsPreenchimentoObrigatorios = [
        "idSelectBancoModal",
        "tpPessoaContaBancoModal",
        "tpContaBancoModal",
        "numAgenciaContaBanco",
        "numContaBanco",
        "dsContaBancoModal",
        "nuContaSapModal"
    ];

    let objConta = {
        IDBANCO: Number(IDBANCO),
        DSCONTABANCO,
        TPCONTA,
        NUAGENCIA,
        NUDIGITOAGENCIA,
        NUCONTA,
        NUDIGITOCONTA,
        TPPESSOA,
        NUCONTASAP,
        IDUSERULTIMAALTERACAO,
        VINCULOEMPRESAS
    };

    if (await validarDadosContaAntesDeInserirOuAtualizar(elementosDoModal, idsPreenchimentoObrigatorios, objConta, true)) {
        await msgQuestion()
            .then(async (respQuestion) => {
                if (respQuestion?.value == true) {
                    try {
                        /*tabela.rows().every(function () {
                            let linhaTabela = $(this.node())
                            let chkEmpresa = linhaTabela.find("input[type='checkbox']");
                            let STATIVO = chkEmpresa.attr('stVinculo') ?? 'True';
                            let VINCULOCONTABANCOEMPRESA = null;

                            if (chkEmpresa.prop('checked')) {
                                VINCULOEMPRESAS.push({
                                    IDEMPRESA: Number(chkEmpresa.attr('id')),
                                    STATIVO,
                                    VINCULOCONTABANCOEMPRESA
                                });
                            }
                        });

                        objConta.VINCULOEMPRESAS = VINCULOEMPRESAS;*/

                        let dados =[objConta];

                        let textdados = JSON.stringify(dados);

                        let dadosLog = [
                            {
                                "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                                "PATHFUNCAO": "FINANCEIRO/CRIACAO CONTA BANCO",
                                "DADOS": textdados,
                                "IP": ipCliente
                            }
                        ];

                        animationLoadingStart('Cadastrando Conta...', 100, false);
                        
                        await ajaxPost('api/financeiro/conta-banco.xsjs', dados).catch((error)=>{ throw new Error(error)});

                        await ajaxPost("api/log-web.xsjs", dadosLog).catch((error) => { throw new Error(error) });

                        await msgSuccess('Conta Cadastrada Com Sucesso!');

                        $('#modalContaBanco').modal('hide');

                        pesquisarContaBanco();
                    } catch (error) {
                        console.log(error);
                        msgError();
                    }
                }
            })

    }   
}

async function abrirModalEdicaoDadosContaBanco(idContaBanco){
    try{
        await abrirModalContaBanco();

        await ajaxGetAllData(`api/financeiro/conta-banco.xsjs?id=${idContaBanco}`).then(retornoDadosContaModal)
            
        $('#modalContaBanco .modal-title').html(`<span>Dados da Conta <small class="m-0 text-muted"> Editar Conta </small> </span>`);

        $('#stContaBancoModal, #stContaBancoModal option').select2({
            disabled: false
        });

        $("#footerModalContaBanco").html(`
            <button type="button" class="btn btn-warning" onclick="editarContaBanco(${idContaBanco})">
                <span class="fal fa-pen-alt mr-1"></span>Editar
            </button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>    
        `);

    }catch(error){
        console.log(error);
        msgError();
    }
}

function retornoDadosContaModal(dadosContaBanco){
    let { data } = dadosContaBanco || '';
    if(data?.length > 0){
        for(let registro of data){
           // registro.VINCULOEMPRESAS = [{ IDVINCULOCONTABANCOEMPRESA: 1, IDEMPRESA: 77, STATIVO: 'True' }, { IDVINCULOCONTABANCOEMPRESA: 1, IDEMPRESA: 120, STATIVO: 'False' }]
            let{
                IDBANCO, 
                TPPESSOA, 
                TPCONTA, 
                NUAGENCIA, 
                NUDIGITOAGENCIA, 
                NUCONTA, 
                NUDIGITOCONTA, 
                DSCONTABANCO, 
                NUCONTASAP,
                STATIVO,
                VINCULOEMPRESAS
            } = registro || '';
            let tabela = $('#dt-basic-empresas-conta-banco').DataTable();

            $("#idSelectBancoModal").val(IDBANCO).trigger('change');
            $("#tpPessoaContaBancoModal").val(TPPESSOA).trigger('change');
            $("#tpContaBancoModal").val(TPCONTA).trigger('change');
            $("#stContaBancoModal").val(STATIVO).trigger('change');
            $("#numAgenciaContaBanco").val(NUAGENCIA);
            $("#numDigitoAgenciaContaBanco").val(NUDIGITOAGENCIA);
            $("#numContaBanco").val(NUCONTA);
            $("#numDigitoContaBanco").val(NUDIGITOCONTA);
            $("#dsContaBancoModal").val(DSCONTABANCO);
            $("#nuContaSapModal").val(NUCONTASAP);
            
            /*if (VINCULOEMPRESAS?.length > 0){
                for (let { IDVINCULOCONTABANCOEMPRESA, IDEMPRESA, STATIVO } of VINCULOEMPRESAS){
                    tabela.rows().every(function () {
                        let $row = $(this.node());
                        let checkboxRow = $row.find('input[type="checkbox"]');
                        let idCheckbox = checkboxRow.attr('id')
                        let data = this.data();  

                        if (checkboxRow.length && idCheckbox == IDEMPRESA) {
                            checkboxRow.attr({
                                'stVinculo': STATIVO,
                                'idVinculoContaBancoEmpresa': IDVINCULOCONTABANCOEMPRESA
                            });

                            if (STATIVO == 'True'){
                                checkboxRow.attr('checked', true);
                            }

                            if (typeof data === 'object') {
                                data[1] = `
                                    <div class="custom-control custom-checkbox">
                                        ${checkboxRow.prop('outerHTML')}
                                        <label class="custom-control-label" for="${IDEMPRESA}"></label>
                                    </div>
                                `;
                            }

                    
                        }
                        this.data(data);
                    });
                }

                tabela.draw(false);
            }*/
        }
    }
}

async function editarContaBanco(idContaBanco) {
    let IDCONTABANCO = Number(idContaBanco);
    let IDBANCO = $("#idSelectBancoModal").val() || '';
    let TPPESSOA = $("#tpPessoaContaBancoModal").val() || '';
    let TPCONTA = $("#tpContaBancoModal").val() || '';
    let NUAGENCIA = $("#numAgenciaContaBanco").val() || '';
    let NUDIGITOAGENCIA = $("#numDigitoAgenciaContaBanco").val() || '';
    let NUCONTA = $("#numContaBanco").val() || '';
    let NUDIGITOCONTA = $("#numDigitoContaBanco").val() || '';
    let DSCONTABANCO = $("#dsContaBancoModal").val() || '';
    let NUCONTASAP = $("#nuContaSapModal").val() || '';
    let STATIVO = $("#stContaBancoModal").val() || '';
    let TPPADRAO = 'False';
    let IDUSERULTIMAALTERACAO = Number(IDFuncionarioLogin);
    let VINCULOEMPRESAS = [];
    let tabela = $('#dt-basic-empresas-conta-banco').DataTable();
    let elementosDoModal = $("#resultModalContaBanco").find("select, input").not("#containerEmpresasVinculoConta select, #containerEmpresasVinculoConta input").get();
    let idsPreenchimentoObrigatorios = [
        "idSelectBancoModal",
        "tpPessoaContaBancoModal",
        "tpContaBancoModal",
        "numAgenciaContaBanco",
        "numContaBanco",
        "dsContaBancoModal",
        "nuContaSapModal",
        "stContaBancoModal"
    ];
    let objConta = {
        IDBANCO: Number(IDBANCO),
        IDCONTABANCO,
        DSCONTABANCO,
        TPCONTA,
        NUAGENCIA,
        NUDIGITOAGENCIA,
        NUCONTA,
        NUDIGITOCONTA,
        TPPESSOA,
        TPPADRAO,
        NUCONTASAP,
        STATIVO,
        IDUSERULTIMAALTERACAO
    };
    
    let arrayTpConta = ['BANCO', 'TRANSPORTEVALORES', 'DEVSOBRA'];
    
    let stContaControle = !arrayTpConta.includes(TPCONTA);

    if (STATIVO == 'False' || stContaControle || await validarDadosContaAntesDeInserirOuAtualizar(elementosDoModal, idsPreenchimentoObrigatorios, objConta, false)) {
        await msgQuestion()
        .then(async (respQuestion) => {
            if (respQuestion?.value == true){
                try {
                    /*
                    tabela.rows().every(function () {
                        let linhaTabela = $(this.node())
                        let chkEmpresa = linhaTabela.find("input[type='checkbox']");
                        let IDVINCULOCONTABANCOEMPRESA = Number(chkEmpresa.attr('idVinculoContaBancoEmpresa')) || null;

                        if (chkEmpresa.prop('checked') || IDVINCULOCONTABANCOEMPRESA > 0) {
                            let IDEMPRESA = Number(chkEmpresa.attr('id'));
                            let STATIVO = chkEmpresa.prop('checked') ? 'True' : 'False';

                            VINCULOEMPRESAS.push({
                                IDEMPRESA,
                                IDVINCULOCONTABANCOEMPRESA,
                                STATIVO
                            });
                        }
                    });

                    objConta.VINCULOEMPRESAS = VINCULOEMPRESAS;*/

                    let dados = [objConta];
                    
                    let textdados = JSON.stringify(dados);

                    let dadosLog = [
                        {
                            "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                            "PATHFUNCAO": "FINANCEIRO/EDICAO CONTA BANCO",
                            "DADOS": textdados,
                            "IP": ipCliente
                        }
                    ];

                    animationLoadingStart('Atualizando Dados...', 100, false);

                    await ajaxPut('api/financeiro/conta-banco.xsjs', dados).catch((error) => { throw new Error(error) });

                    await ajaxPost("api/log-web.xsjs", dadosLog).catch((error) => { throw new Error(error) });

                    await msgSuccess('Conta Editada Com Sucesso!');

                    $('#modalContaBanco').modal('hide');

                    pesquisarContaBanco();
                } catch (error) {
                    console.log(error);
                    msgError();
                }
            }
        })
    }
}

//? ======================================================== FIM ROTINA CONTAS DE BANCOS ======================================================== //