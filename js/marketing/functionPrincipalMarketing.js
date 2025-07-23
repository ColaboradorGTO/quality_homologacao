/*
 * Author: Rodrigo Amorim de Moura
 * Data: 07/02/2018
 * Email: ram.amorim@gmail.com
 */

if(!getCurrentUser()){
    window.location.href = 'index.html';
}

var usuario = getCurrentUser().user;

var produtoPromocao = [];

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

var valorTotalRecebido = 0;

//Variáveis totalizadoras do Mapa de pagamento

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

function logout() {
    LogoffUser();
	window.location.href = 'index.html';
}

//////////////// Página Inicial //////////////////

$(document).ready(function() {

	$('#parametro_dia').val(dataAtualCampo);
	$('.dataAtual').text(dataAtual);
	$('.liDataAtual').text(dataAtual);
	$('.NoFuncionarioTitulo').text(NomeFuncionarioLogin);
	$('.NoEmpresaTitulo').text(NOEmpresaLogin);

});

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
        totalVrRecebidoConvenio = 0;
        totalVrRecebidoVoucherLoja = 0;
        totalVrRecebidoFatura = 0;
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
                                <th>Convênio</th>
                                <th>Voucher</th>
                                <th>Fatura</th>
                                <th>Despesa</th>
                                <th>Total</th>
                                <th>Disponível</th>
                            </tr>
                        </thead>
                        <tbody id="resultadoVendaLojaPeriodo">
                        </tbody>
                        <tfoot id="totalResultadoVendaLojaPeriodo"class="thead-themed">
                        </tfoot>
                    </table>`
	            );
	            
        var tableVendaLojaPeriodos = $('#dt-basic-vendalojaperiodo').DataTable();
        
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
            vrRecebidoConvenio = respostaListaVendasLojas.data[i]['totais']['VALORTOTALCONVENIO'];
            vrRecebidoVoucherLoja = respostaListaVendasLojas.data[i]['totais']['VALORTOTALVOUCHER'];
            vrRecebidoFatura = respostaListaVendasLojas.data[i]['totais']['VALORTOTALFATURA'];
            vrDespesa = respostaListaVendasLojas.data[i]['totais']['VALORTOTALDESPESA'];
            vrAdiantamentoSalario = respostaListaVendasLojas.data[i]['totais']['VALORTOTALADIANTAMENTOSALARIAL'];
            vrFisicoDin = respostaListaVendasLojas.data[i]['totais']['VRFISICODINHEIRO'];
            vrAjusteDin = respostaListaVendasLojas.data[i]['totais']['VRAJUSTEDINHEIRO'];
            vrRecebidoDin = respostaListaVendasLojas.data[i]['totais']['VRRECDINHEIRO'];

            vrDespesaTotal = parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoFatura);
            
            if(parseFloat(vrAjusteDin)>0){
                vrTotalDinheiroAjuste = parseFloat(vrTotalDinheiroAjuste) + parseFloat(vrAjusteDin);
            }else{
                vrTotalDinheiro = parseFloat(vrTotalDinheiro) + parseFloat(vrRecebidoDin);
            }

            vrQuebraCaixa = (parseFloat(vrTotalDinheiro)+parseFloat(vrTotalDinheiroAjuste)) - parseFloat(vrFisicoDin);
            
            vrTotal = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);
            vrDisponivel = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);

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
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoConvenio).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoVoucherLoja).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoFatura).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrDespesaTotal).toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + mascaraValor(parseFloat(vrTotal).toFixed(2)) + `</label>`,
                `<label style="color: green;">` + mascaraValor(parseFloat(vrDisponivel).toFixed(2)) + `</label>`,
            ]).draw(false);
            
            totalVrRecebidoDinheiro = parseFloat(totalVrRecebidoDinheiro) + parseFloat(vrRecebidoDinheiro);
            totalVrRecebidoCartao = parseFloat(totalVrRecebidoCartao) + parseFloat(vrRecebidoCartao);
            totalVrRecebidoPos = parseFloat(totalVrRecebidoPos) + parseFloat(vrRecebidoPos);
            totalVrRecebidoConvenio = parseFloat(totalVrRecebidoConvenio) + parseFloat(vrRecebidoConvenio);
            totalVrRecebidoVoucherLoja = parseFloat(totalVrRecebidoVoucherLoja) + parseFloat(vrRecebidoVoucherLoja);
            
            totalVrRecebidoFatura = parseFloat(totalVrRecebidoFatura) + parseFloat(vrRecebidoFatura);
            totalVrDespesaTotal = parseFloat(totalVrDespesaTotal) + parseFloat(vrDespesaTotal);
            totalVrBruto = parseFloat(totalVrBruto) + parseFloat(vrTotal);
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
                <th>` + mascaraValor(parseFloat(totalVrRecebidoConvenio).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoVoucherLoja).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrRecebidoFatura).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrDespesaTotal).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrBruto).toFixed(2)) + `</th>
                <th>` + mascaraValor(parseFloat(totalVrDisponivel).toFixed(2)) + `</th>
            </tr>`
    	);
    }

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
        
        	$("#idgrupo").select2();
        	
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
      
        ajaxGet('api/financeiro/venda-marca-periodo.xsjs?pageSize=500&idMarca=' + IDMarcaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
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
        totalVrRecebidoConvenio = 0;
        totalVrRecebidoVoucher = 0;
        totalVrRecebidoFatura = 0;
        totalVrDespesaTotal = 0;
        totalVrDisponivel = 0;
        totalVrQuebraCaixaMarca = 0;
        totalVrBrutoMarca = 0;
        totalVrBrutoVoucherMarca = 0;
        totalVrVendido = 0;
        vrTotalVendido = 0;
        
    if(respostaListaVendasMarcas.data.length != 0){
    	for (var i = 0; i < respostaListaVendasMarcas.data.length; i++) {

    	    idEmpresa = respostaListaVendasMarcas.data[i]['IDEMPRESA'];
            noFantasia = respostaListaVendasMarcas.data[i]['NOFANTASIA'];
            vrRecebidoDinheiro = respostaListaVendasMarcas.data[i]['VRDINHEIRO'];
            vrRecebidoCartao = respostaListaVendasMarcas.data[i]['VRCARTAO'];
            vrRecebidoPos = respostaListaVendasMarcas.data[i]['VRPOS'];
            vrRecebidoConvenio = respostaListaVendasMarcas.data[i]['CONVENIO'];
            vrRecebidoVoucher = respostaListaVendasMarcas.data[i]['VOUCHER'];
            vrRecebidoFatura = respostaListaVendasMarcas.data[i]['VRFATURA'];
            vrDespesa = respostaListaVendasMarcas.data[i]['VRDESPESA'];
            vrAdiantamentoSalario = respostaListaVendasMarcas.data[i]['VRADIANTAMENTOSALARIO'];
            vrFisicoDinMarca = respostaListaVendasMarcas.data[i]['VRFISICODINHEIRO'];
            vrRecebidoDinMarca = respostaListaVendasMarcas.data[i]['VRRECDINHEIRO'];

            vrDespesaTotal = parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoFatura);
            vrDisponivelBrutoVoucher = parseFloat(vrDisponivelBruto);
            vrTotalVendido = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoCartao) + parseFloat(vrRecebidoPos) + parseFloat(vrRecebidoConvenio);
            
            vrQuebraCaixaMarca = parseFloat(vrRecebidoDinMarca) - parseFloat(vrFisicoDinMarca);
            
            vrTotalQuebraMarca = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);
            vrTotalQuebraVoucherMarca = parseFloat(vrDisponivelBrutoVoucher) - parseFloat(vrDespesaTotal);
            vrDisponivel = parseFloat(vrDisponivelBrutoVoucher) - parseFloat(vrDespesaTotal) + parseFloat(vrQuebraCaixaMarca);
            

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
            totalVrVendido = parseFloat(totalVrVendido) + parseFloat(vrTotalVendido);
            
			$('#resultadoVendaMarcaPeriodo').append(
				`<tr>
                    <td><label style="color: blue; font-size: 11px;">` + idEmpresa +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + noFantasia +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalVendido).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoDinheiro).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoCartao).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoPos).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoConvenio).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoVoucher).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrRecebidoFatura).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: red;">` + mascaraValor(parseFloat(vrDespesaTotal).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrDisponivelBruto).toFixed(2)) +	`</label></td>`
                    +tagquebracaixaMarca+
                    `<td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrDisponivel).toFixed(2)) +	`</label></td>
                </tr>`
			);
			
            $('#totalResultadoVendaMarcaPeriodo').html(
        		`<tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrVendido).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrRecebidoDinheiro).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrRecebidoCartao).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrRecebidoPos).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrRecebidoConvenio).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrRecebidoVoucher).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrRecebidoFatura).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrDespesaTotal).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrBrutoMarca).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrQuebraCaixaMarca).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrDisponivel).toFixed(2)) + `</th>
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

//================ PROMOÇÕES ==============================================
function ListPromocao(){
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
        	$("#idforncededor").select2();
        	
            $('.DescTituloListaPromocao').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lançamento de Promoções - <span class='fw-300'></span>`);
			
			 ajaxGet('api/informatica/marca.xsjs')
        		.then(retornoListaMarcaSelect)
        		.catch(funcError);

        ajaxGet('api/promocao/listapromocao.xsjs')
            .then(retornoListaPromocao)
            .catch(funcError);
        		
      }
    };
    xmlhttp.open("GET", "marketing_action_listpromocao.html", true);
    xmlhttp.send();
}

function retornoListaPromocao(respostaListaPromocao) {

        $('#resultado').html(
                    `<table id="dt-basic-listapromocao" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                        <thead class="bg-primary-600">
                            <tr>
                                <th>ID</th>
                                <th>Descrição</th>
                                <th>Situação</th>
                                <th>Detalhar</th>
                            </tr>
                        </thead>
                        <tbody id="resultadoListaPromocao">
                        </tbody>
                    </table>`
	            );
	            
        var tableListaPromocao = $('#dt-basic-listapromocao').DataTable();
        
        tableListaPromocao.rows().remove().draw();

    if(respostaListaPromocao.data.length != 0){
    	for (var i = 0; i < respostaListaPromocao.data.length; i++) {

    	    idResPromo = respostaListaPromocao.data[i]['IDRESUMOPROMO'];
            dsPromo = respostaListaPromocao.data[i]['DSPROMO'];
            stAtivo = respostaListaPromocao.data[i]['STATIVO'];
            
            if(stAtivo == 'True'){
                tagstAtivo = 'ATIVO';
            } 

    		tableListaPromocao.row.add([
                `<label style="color: blue; font-size: 11px;">` + idResPromo + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + dsPromo + ` </label>`,
                `<label style="color: blue; font-size: 11px;">` + tagstAtivo + ` </label>`,
                 `<label style="color: blue; font-size: 11px;"></label>`,
            ]).draw(false);
    	}
    }
}

function modal_List_Produtos() {
    
    var idmarca = $("#idmarca").val();
    var idloja = $("#idloja").val();
    var idforncededor = $("#idforncededor").val();
    var descProduto = $("#descProduto").val();

	$.get('marketing_action_listproduto_modal.html', function(res) {

		$('#resulmodallistproduto').html(res);
		$("#listProdutos").modal('show');
		$('#listProdutos').on('shown.bs.modal', function() {});

		return ajaxGet('api/produto-promocao.xsjs?codeBarsOuNome=' + descProduto)
			.then(retornoListaProdutos)
			.catch(funcError);
	})
}

function retornoListaProdutos(respostaListaProdutos) {

	for (var i = 0; i < respostaListaProdutos.data.length; i++) {

		idProduto = respostaListaProdutos.data[i]['IDPRODUTO'];
		NuCodBarras = respostaListaProdutos.data[i]['NUCODBARRAS'];
		dsProduto = respostaListaProdutos.data[i]['DSNOME'];
		
        $("#resultadoListProduto").append(`<tr>
                                            <td>
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" id="`+idProduto+`" onclick="IncluirProdutoLista(this)">
                                                    <label class="custom-control-label" for="`+idProduto+`"></label>
                                                </div>
                                            </td>
                                            <td><label style="color: black; font-size: 11px; ">`+ idProduto +`</label></td>
                                            <td><label style="color: black; font-size: 11px; ">`+ NuCodBarras +`</label></td>
                                            <td><label style="color: black; font-size: 11px; ">`+ dsProduto +`</label></td>
                                        </tr>`);
	}

}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function IncluirProdutoLista(cb){
    
    if(cb.checked === true){
       produtoPromocao.push(cb.id); 
    }else{
       produtoPromocao.remove(cb.id); 
    } 
}

function cad_promocao() {

	var DescPromocao = $("#descPromo").val();
	var dtInicioPromo = $("#dtconsultainicio").val();
	var dtFimPromo = $("#dtconsultafim").val();
	
	var EMPRESAS = new Array();
    $('#idloja option:selected').each(function (index, el) {
        EMPRESAS.push($(el).val());
    });
    
	var IDMarca = $("#idmarca").val();
	var qtdApartir = $("#qtdApartir").val();
	var qtdLimite = $("#qtdLimite").val();
	var vrDescPromo = $("#vrDescontoPromo").val().replace(".", "").replace(",", ".");
	var percDescPromo = $("#percDescontoPromo").val().replace(".", "").replace(",", ".");
	var vrApartir = $("#vrApartirPromo").val().replace(".", "").replace(",", ".");
	var vrLimite = $("#vrLimitePromo").val().replace(".", "").replace(",", ".");
	
    if(DescPromocao==''){
    	$("#resultado").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Descrição da Promoção.</div>"
		);
		$("#descPromo").focus();
		return false;
    }

    var dados = [{
		"DSPROMO": DescPromocao,
		"DTINICIOPROMO": dtInicioPromo,
		"DTFIMPROMO": dtFimPromo,
		"QTDAPARTIRDE": parseFloat(qtdApartir),
		"QTDLIMITEDE": parseFloat(qtdLimite),
		"VRPRECODESCONTO": parseFloat(vrDescPromo),
		"VRPERCDESCONTO": parseFloat(percDescPromo),
		"VRAPARTIRDE": parseFloat(vrApartir),
		"VRLIMITEDE": parseFloat(vrLimite),
		"STATIVO": 'True',
		"IDGRUPO":parseInt(IDMarca),
		"PRODUTOS":produtoPromocao,
		"EMPRESAS":EMPRESAS

	}];

	console.table(dados);

	function funcSucessPromocao(resposta) {

		alerta_cadastrado_sucesso();
		ListPromocao();

	}

	function funcErrorPromocao(data) {
		Swal.fire({
			type: "error",
			title: data.msg,
			showConfirmButton: false,
			timer: 15000
		});
	}

	ajaxPost("api/produto-promocao.xsjs", dados)
		.then(funcSucessPromocao)
		.catch(funcErrorPromocao);
}

function alerta_cadastrado_sucesso() {
	Swal.fire({
		type: "success",
		title: "Dados Cadastrados com Sucesso",
		showConfirmButton: false,
		timer: 2000
	});
}


//================ Campanhas ==============================================
function ListCampanha(){
  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
      $("#resultadoCampanha").html(
        "<div align=\"center\">" +
        "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
        "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
      );
      
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
      
          $('.dataAtual').text(dataAtual);
          $('#dataInicio').val(dataAtualCampo);
          $('#dataFinal').val(dataAtualCampo);
      
        $("#idmarca").select2();
        $("#idloja").select2();
        $("#idforncededor").select2();
        
          $('.DescTituloListaCampanha').html(
    `<i class='subheader-icon fal fa-chart-area'></i> Lançamento de Campanhas - <span class='fw-300'></span>`);
    
     
      ajaxGet('api/campanha/todos.xsjs')
          .then(retornoListaCampanha)
          .catch(funcError);      
          
    }
  };
  xmlhttp.open("GET", "marketing_action_listcampanha.html", true);
  xmlhttp.send();
}

function retornoListaCampanha(respostaListaCampanha) {

        $('#resultadoCampanha').html(
                    `<table id="dt-basic-listacampanha" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                        <thead class="bg-primary-600">
                            <tr>
                                <th width="5%">ID</th>
                                <th width="40%">Descrição</th>
                                <th width="10%">Data Início</th>
                                <th width="10%">Data Fim</th>
                                <th width="30%">Loja</th>
                                <th width="5%">Desconto(%)</th>
                            </tr>
                        </thead>
                        <tbody id="resultadoListaCampanha">
                        </tbody>
                    </table>`
	            );
	            
        var tableListaCampanha = $('#dt-basic-listacampanha').DataTable();
        
        tableListaCampanha.rows().remove().draw();

    if(respostaListaCampanha.data.length != 0){
    	for (var i = 0; i < respostaListaCampanha.data.length; i++) {

    	    id = respostaListaCampanha.data[i]['IDCAMPANHA'];
          descricao = respostaListaCampanha.data[i]['DSCAMPANHA'];
          dataInicio = respostaListaCampanha.data[i]['DTINICIO'];
          dataFinal = respostaListaCampanha.data[i]['DTFINAL'];
          desconto = respostaListaCampanha.data[i]['VRPERCDESCONTO'];
          loja = respostaListaCampanha.data[i]['NOFANTASIA'];   
           

          tableListaCampanha.row.add([
                `<label style="color: blue; font-size: 11px;">` + (i+1) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + descricao + ` </label>`,
                `<label style="color: blue; font-size: 11px;">` + dataInicio + ` </label>`,
                `<label style="color: blue; font-size: 11px;">` + dataFinal + ` </label>`,
                `<label style="color: blue; font-size: 11px;">` + loja + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + desconto + `</label>`,
            ]).draw(false);
    	}
    }
    ajaxGet('api/informatica/marca.xsjs')
          .then(retornoListaMarcaSelect)
          .catch(funcError);

}

function cad_campanha() {

	var DescCampanha = $("#descCampanha").val();
	var dtInicio = $("#dataInicio").val();
	var dtFim = $("#dataFinal").val();
  var percDesconto = $("#percDescontoCampanha").val().replace(".", "").replace(",", ".");
	
	var EMPRESAS = new Array();
    $('#idloja option:selected').each(function (index, el) {
        EMPRESAS.push(parseInt($(el).val()));
    });
    
	if(DescCampanha==''){
    	$("#resultadoCampanha").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Descrição da campanha.</div>"
		);
		$("#descCampanha").focus();
		return false;
  }

    var dados = [{
		"DSCAMPANHA": DescCampanha,
		"IDOPERADOR": parseInt(IDFuncionarioLogin),
		"DTINICIO": dtInicio,
		"DTFINAL": dtFim,
		"VRPERCDESCONTO": parseFloat(percDesconto),
		"EMPRESAS":EMPRESAS

	}];

	console.table(dados);
  

	ajaxPost("api/campanha/todos.xsjs", dados)
		.then(funcSucessCampanha)
		.catch(funcError);
}

function funcSucessCampanha(resposta) {

  alerta_cadastrado_sucesso();
  //ListPromocao();

}

function funcError(data) {
  Swal.fire({
    type: "error",
    title: data.msg,
    showConfirmButton: false,
    timer: 15000
  });
}


//================ Clientes ==============================================
function ListCliente(){
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
      
          $("#idCampanha").select2();
          
          $("#div_botao_atualizar").hide();
          $("#div_botao_novo").hide();
        
          $('.DescTituloListaClientes').html(
    `<i class='subheader-icon fal fa-chart-area'></i> Cadastro de Clientes - <span class='fw-300'></span>`);
                   
    }
  };
  xmlhttp.open("GET", "marketing_action_listcliente.html", true);
  xmlhttp.send();

  ajaxGet("api/campanha/todos.xsjs")
		.then(RetornoListaCampanha)
		.catch(funcError);
		
  ajaxGet('api/campanha/campanha-cliente.xsjs')
          .then(retornoListaCliente)
          .catch(funcError);      
}

function retornoListaCliente(resposta){
    $('#resultado').html(
                    `<table id="dt-basic-listacliente" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                        <thead class="bg-primary-600">
                            <tr>
                                <th width="5%">ID</th>
                                <th width="10%">CPF</th>
                                <th width="10%">Telefone</th>
                                <th width="40%">Nome</th>
                                <th width="25%">Campanha</th>
                                <th width="10%">Opções</th>
                            </tr>
                        </thead>
                        <tbody id="resultadoListaCliente">
                        </tbody>
                    </table>`
	            );
	            
        var tableListaCliente = $('#dt-basic-listacliente').DataTable();
        
        tableListaCliente.rows().remove().draw();

    if(resposta.data.length != 0){
    	for (var i = 0; i < resposta.data.length; i++) {

    	  id = resposta.data[i]['ID'];
          cpf = resposta.data[i]['NUCPFCNPJ'];
          telefone = resposta.data[i]['NUTELEFONE'];
          nome = resposta.data[i]['NOME'];
          campanha = resposta.data[i]['DSCAMPANHA'];
          
          tagEditarCliente = '<div class="btn-group btn-group-xs"><button type="button" class="btn btn-primary btn-xs" title="Editar Caixa" id="' + id + '" onclick="atualizarCliente(this.id)" >Editar</button></div>';
          tableListaCliente.row.add([
                `<label style="color: blue; font-size: 11px;">` + id + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + cpf + ` </label>`,
                `<label style="color: blue; font-size: 11px;">` + telefone + ` </label>`,
                `<label style="color: blue; font-size: 11px;">` + nome + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + campanha + `</label>`,
                tagEditarCliente
            ]).draw(false);
    	}
    }
}

function RetornoListaCampanha(respostaListaCampanha) {

	for (var i = 0; i < respostaListaCampanha.data.length; i++) {
    cont = i+1;
		IDCampanha = respostaListaCampanha.data[i]['IDCAMPANHA'];
		DSCampanha = respostaListaCampanha.data[i]['DSCAMPANHA'];
    loja = respostaListaCampanha.data[i]['NOFANTASIA'];
    
			$('#idCampanha').append(
				`<option value="` + IDCampanha + `"> `+ cont +` - ` + DSCampanha +` -> `+ loja +`</option>`
			);
	} 
	
}

function verificaCpf(){
    
    nrCpf = $("#nrCpf").val();
    if(nrCpf != ''){
        ajaxGet("api/campanha/campanha-cliente.xsjs?nrcpf="+nrCpf)
    		.then(RetornoConsultaCPFTelefone)
    		.catch(funcError);
    }
}

function verificaTelefone(){
    nrTelefone = $("#nrTelefone").val();
    if(nrTelefone != ''){
        ajaxGet("api/campanha/campanha-cliente.xsjs?nrTelefone="+nrTelefone)
    		.then(RetornoConsultaCPFTelefone)
    		.catch(funcError);
    }
}

function RetornoConsultaCPFTelefone(resposta){
    if(resposta.rows > 0){
        Swal.fire({
            type: "warning",
            title: "Cliente já cadastrado!",
            showConfirmButton: true,
            timer: 15000
        }).then(function() {
                swal.close();
                $("#nrTelefone").val("");
                $("#nrCpf").val("");
                $("#nrCpf").focus();
        });
       
       
    }
}

function cad_campanha_cliente() {

	var nrCpf = $("#nrCpf").val();
	var nrTelefone = $("#nrTelefone").val();
	
	if(nrCpf=='' && nrTelefone==''){
    	$("#resultado").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Nº do Telefone ou Nº CEP do Cliente.</div>"
		);
		$("#nrCpf").focus();
		return false;
  }

    var dados = [{
		"IDCAMPANHA": parseInt($("#idCampanha").val()),
        "NOME":$("#nomeCliente").val(),
		"NUCPFCNPJ": nrCpf,
		"EENDERECO": $("#endereco").val(),
		"ECOMPLEMENTO": $("#complemento").val(),
		"EBAIRRO": $("#bairro").val(),
		"ECIDADE":$("#cidade").val(),
        "SGUF":$("#uf").val(),
        "NUCEP":$("#cep").val(),
        "NUTELEFONE":nrTelefone

	}];

	console.table(dados);
  

	ajaxPost("api/campanha/campanha-cliente.xsjs", dados)
		.then(funcSucessClienteCampanha)
		.catch(funcError);
}

function atualiza_campanha_cliente() {

	var nrCpf = $("#nrCpf").val();
	var nrTelefone = $("#nrTelefone").val();
	
	if(nrCpf=='' && nrTelefone==''){
    	$("#resultado").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Nº do Telefone ou Nº CEP do Cliente.</div>"
		);
		$("#nrCpf").focus();
		return false;
  }

    var dados = [{
        "ID": parseInt($("#idCliente").val()),
		"IDCAMPANHA": parseInt($("#idCampanha").val()),
        "NOME":$("#nomeCliente").val(),
		"NUCPFCNPJ": nrCpf,
		"EENDERECO": $("#endereco").val(),
		"ECOMPLEMENTO": $("#complemento").val(),
		"EBAIRRO": $("#bairro").val(),
		"ECIDADE":$("#cidade").val(),
        "SGUF":$("#uf").val(),
        "NUCEP":$("#cep").val(),
        "NUTELEFONE":nrTelefone

	}];

	console.table(dados);
  

	ajaxPut("api/campanha/campanha-cliente.xsjs", dados)
		.then(funcSucessClienteCampanha)
		.catch(funcError);
		
	ajaxGet('api/campanha/campanha-cliente.xsjs')
          .then(retornoListaCliente)
          .catch(funcError);
          
    novoCliente();
}

function atualizarCliente(idCliente){
    ajaxGet('api/campanha/campanha-cliente.xsjs?id='+idCliente)
          .then(retornoListaClienteaAtualizar)
          .catch(funcError); 
}

function novoCliente(){
    $("#div_botao_atualizar").hide();
    $("#div_botao_novo").hide();
    $("#div_botao_cadastrar").show();
    
    $("#nrTelefone").val('');
	$("#nrCpf").val('');
	$("#nomeCliente").val('');
	$("#idCliente").val('');
	$("#endereco").val('');
	$("#complemento").val('');
	$("#bairro").val('');
	$("#cidade").val('');
    $("#uf").val('');
    $("#cep").val('');
    $("#idCampanha").val('').change();
}

function retornoListaClienteaAtualizar(resposta){
    if(resposta.data.length > 0){
        $("#div_botao_atualizar").show();
         $("#div_botao_novo").show();
        $("#div_botao_cadastrar").hide();
        
        var id =  resposta.data[0].ID;
        var nrCpf = resposta.data[0].NUCPFCNPJ;
    	var nrTelefone = resposta.data[0].NUTELEFONE;
    	var idCampanha = resposta.data[0].IDCAMPANHA;
    	var nome = resposta.data[0].NOME;
    	var endereco = resposta.data[0].EENDERECO;
    	var complemento = resposta.data[0].ECOMPLEMENTO;
    	var bairro = resposta.data[0].EBAIRRO;
    	var cidade = resposta.data[0].ECIDADE;
    	var sguf = resposta.data[0].SGUF;
    	var cep = resposta.data[0].NUCEP;
    	
    	$("#nrTelefone").val(nrTelefone);
    	$("#nrCpf").val(nrCpf);
    	$("#nomeCliente").val(nome);
    	$("#idCliente").val(id);
    	$("#endereco").val(endereco);
		$("#complemento").val(complemento);
		$("#bairro").val(bairro);
		$("#cidade").val(cidade);
        $("#uf").val(sguf);
        $("#cep").val(cep);
        $("#idCampanha").val(idCampanha).change();
    	
    }
	
}

function funcSucessClienteCampanha(resposta) {

  alerta_cadastrado_sucesso();
  //ListPromocao();

}