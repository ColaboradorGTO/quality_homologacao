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
var IDListaEmp = usuario['ID_LISTA_LOJA'];
var NOEmpresaLogin = usuario['NOFANTASIA'];
var IDFuncionarioLogin = usuario['id'];
var NomeFuncionarioLogin = usuario['NOFUNCIONARIO'];


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
var seg = data.getSeconds();   

var DSdesc = '';// 0-59


diaFormatado = String(dia);
mesatual = (mes + 1);
mesFormatado = String(mesatual);

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;
let dataHojeCampo = diaFormatado.padStart(2, '0') + '-' + (mesFormatado.padStart(2, '0')) + '-' + ano4;
let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');
let horaAtualCampo = hora + ':' + min + ':' + seg;

let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let horaStr = String(hora);
let minStr = String(min);
let horaAtual = horaStr.padStart(2, '0') + ':' + minStr.padStart(2, '0');

flagConferidoData='';

// Variáveis das funções da Ordem de Transferência
var nIdLojaOrigem = 0;
var nBtnSalvar = 1;
var nIdResumoOT = 0;
var nConferir = 0;
// Fim Ordem Transferência

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

function funcErrorListaEmpresasSelect(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoListaEmpresas',
		showConfirmButton: false,
		timer: 15000
	});
}

function retornoListaEmpresasSelect(respostaListaEmpresas) {

	$("#idloja").select2();
	$("#idlojaorigem").select2();
	$("#idlojadestino").select2();
    
	for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

		IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
		DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

		$('#idloja').append(
			`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
		);
		$('#idlojaorigem').append(
			`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
		);
		$('#idlojadestino').append(
			`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
		);
        //$("#idlojadestino [value=" + IDEmpresaLogin + "]").attr("disabled","disabled");
        $("#idlojaorigem").val(IDEmpresaLogin);

	}
}

function retornoListaEmpresasModalSelect(respostaListaEmpresas) {

	$("#idlojaorigemmodal").select2();
	$("#idlojadestinomodal").select2();

    $("#conferiridlojaorigemmodal").select2();
	$("#conferiridlojadestinomodal").select2();
    
	for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

		IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
		DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

		$('#idlojaorigemmodal').append(
			`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
		);
		$('#idlojadestinomodal').append(
			`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
		);
        $("#idlojadestinomodal [value=" + IDEmpresaLogin + "]").attr("disabled","disabled");
        $("#idlojaorigemmodal").val(IDEmpresaLogin);
        $('#idlojaorigemmodal').prop('disabled', true);

        $('#conferiridlojaorigemmodal').append(
			`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
		);
		$('#conferiridlojadestinomodal').append(
			`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
		);
        $("#conferiridlojadestinomodal [value=" + IDEmpresaLogin + "]").attr("disabled","disabled");
        $("#conferiridlojaorigemmodal").val(IDEmpresaLogin);
        $('#conferiridlojaorigemmodal').prop('disabled', true);

	}
}

var TotalDespCaixa =  0;
var TotalAdiantamentoSalarial =  0;
flagConferido = 0;

//////////////// Página Inicial Totalizadores //////////////////

$(document).ready(function() {

	$('#parametro_dia').val(dataAtualCampo);
	$('.dataAtual').text(dataAtual);
	$('.NoFuncionarioTitulo').text(NomeFuncionarioLogin);
	$('.NoEmpresaTitulo').text(NOEmpresaLogin);

	ajaxGet('api/dashboard/venda/lista-caixas-fechados-nao-conferidos.xsjs?idEmpresa=' + IDEmpresaLogin)
	.then(retornoListaCaixaFechadosNaoConferidos)
	.catch(funcErrorVendaLoja);

    //////////Totalizador Dados Topo///////////////////

    //if(flagConferido === 1)return;
	
	function retornoVendaLoja(resposta) {

		var recdinheiro = parseFloat(resposta.data[0]['VRRECDINHEIRO']);
		var reccartao = parseFloat(resposta.data[0]['VRRECCARTAO']);
		var recconvenio = parseFloat(resposta.data[0]['VRRECCONVENIO']);
		var recpos = parseFloat(resposta.data[0]['VRRECPOS']);
		var reccheque = parseFloat(resposta.data[0]['VRRECCHEQUE']);
		var QTDClientes = parseFloat(resposta.data[0]['QTDVENDAS']);
		var TotalTicketM = parseFloat(resposta.data[0]['VRTICKETWEB']);

		if (resposta.data[0]['QTDVENDAS'] == null) {
			QTDClientes = 0;
		}

		if (resposta.data[0]['VRTICKETWEB'] == null) {
			TotalTicketM = 0;
		}
		
		TotalVenda = (recdinheiro+reccartao+recconvenio+recpos+reccheque);

		$('.vendaLoja').html(
			`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(TotalVenda).toFixed(2))}<small class="m-0 l-h-n">Vendas Loja</small></h3>`);
		$('.quantidadeClienteVenda').html(
			`<h3 class="display-4 d-block l-h-n m-0 fw-500">${(QTDClientes)}<small class="m-0 l-h-n">Clientes</small></h3>`);
		$('.ticketMedioVenda').html(
			`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(TotalTicketM).toFixed(2))}<small class="m-0 l-h-n">Ticket Médio</small></h3>`
		);

		return ajaxGet('api/dashboard/despesa-loja.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + dataAtualCampo)
			.then(retornoDespesaLoja)
			.catch(funcErrorDespesaLoja);
		
	}

	ajaxGet('api/dashboard/resumo-venda.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + dataAtualCampo)
		.then(retornoVendaLoja)
		.catch(funcErrorVendaLoja);

    // Leandro Massafera - 01/11/2022
    ajaxGet('api/administrativo/resumo-venda-ecommerce.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + dataAtualCampo)
        .then(retornoVendaEcommerce)
        .catch(funcErrorVendaEcommerce);

	function funcErrorVendaLoja(data) {
		Swal.fire({
			type: "error",
			title: 'Erro ao Carregar os Dados do retornoVendaLoja',
			showConfirmButton: false,
			timer: 15000
		});
	}

	function retornoDespesaLoja(respostadesp) {

		TotalDesp = parseFloat(respostadesp.data[0]['VRDESPESA']);
		if (respostadesp.data[0]['VRDESPESA'] == null) {
			TotalDesp = 0;
		}

		$('.despesaLoja').html(
			`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(TotalDesp.toFixed(2))}
                                    <small class="m-0 l-h-n">Despesas</small>
                                </h3>`
		);

	}
	
	function funcErrorDespesaLoja(data) {
		Swal.fire({
			type: "error",
			title: 'Erro ao Carregar os Dados do retornoDespesaLoja',
			showConfirmButton: false,
			timer: 15000
		});
	}
	
	// Leandro Massafera - 01/11/2022
    function funcErrorVendaEcommerce(data) {
    	Swal.fire({
    		type: "error",
    		title: 'Erro ao Carregar os Dados do retornoVendaEcommerce',
    		showConfirmButton: false,
    		timer: 15000
    	});
    }
    
    // Leandro Massafera - 01/11/2022
    function retornoVendaEcommerce(respostaVendaEcommerce) {
    
    	TotalVendaEcommerce = respostaVendaEcommerce.data[0]['VRECOMMERCE'];
    	if (respostaVendaEcommerce.data[0]['VRECOMMERCE'] == null) {
    		TotalVendaEcommerce = 0;
    	}
    
    	$('.ecommerce').html(
    		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(TotalVendaEcommerce)}<small class="m-0 l-h-n">E-Commerce</small></h3>`
    	);
    
    }


    /////////////Lista de Caixas ///////////////////////////////////////////

	function retornoListaCaixasMovimento(respostaListaCaixaMovimento) {

        var TotalFatura = 0;
        var TotalFaturaPIX = 0;
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
		
		$('#lblCaixas').html('Lista de Caixas - <span class="fw-300"><i>'+NOEmpresaLogin+'</i></span>');
		$('#resultadoListCaixa').html('');

		if(respostaListaCaixaMovimento['rows'] > 0 ){

    		for (var i = 0; i < respostaListaCaixaMovimento.data.length; i++) {
    
    			IDCaixa = respostaListaCaixaMovimento.data[i].caixa['IDCAIXAWEB'];
                IDMovimentoCaixa = respostaListaCaixaMovimento.data[i].caixa['ID'];
    			NomeCaixa = respostaListaCaixaMovimento.data[i].caixa['DSCAIXA'];
    			DTAbertura = respostaListaCaixaMovimento.data[i].caixa['DTABERTURA'];
    			NomeOperador = respostaListaCaixaMovimento.data[i].caixa['NOFUNCIONARIO'];
    			SituacaoCaixa = respostaListaCaixaMovimento.data[i].caixa['STFECHADO'];
    			VrInformadoDinheiro = respostaListaCaixaMovimento.data[i].caixa['VRRECDINHEIRO'];
    			
    			//alert(respostaListaCaixaMovimento.data[i].caixa['STCONFERIDO']);
    
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
    
                if(RecFatura>0){
                    RecFatura = RecFatura;
                }else{
                    RecFatura=0;
                }
            
                if(RecFaturaPIX>0){
                    RecFaturaPIX = RecFaturaPIX;
                }else{
                    RecFaturaPIX=0;
                }
                
                if(RecCartao>0){
                    RecCartao = RecCartao;
                }else{
                    RecCartao=0;
                }
                
                if(RecDinheiro>0){
                    RecDinheiro = RecDinheiro;
                }else{
                    RecDinheiro=0;
                }
                
                if(RecPOS>0){
                    RecPOS = RecPOS;
                }else{
                    RecPOS=0;
                }

                if(RecPIX>0){
                    RecPIX = RecPIX;
                }else{
                    RecPIX=0;
                }
                
                if(RecMOOVPAY>0){
                    RecMOOVPAY = RecMOOVPAY;
                }else{
                    RecMOOVPAY=0;
                }
                
                if(RecVoucher>0){
                    RecVoucher = RecVoucher;
                }else{
                    RecVoucher=0;
                }
                
                if(RecConvenio>0){
                    RecConvenio = RecConvenio;
                }else{
                    RecConvenio=0;
                }
                
                if(VrVendido>0){
                    VrVendido = VrVendido;
                }else{
                    VrVendido=0;
                }
                
                VrDisponivel = RecDinheiro + RecFatura;
    			TotalFatura = TotalFatura + RecFatura;
			    TotalFaturaPIX = TotalFaturaPIX + RecFaturaPIX;
    			TotalCartao = TotalCartao + RecCartao;
    			TotalDinheiro = TotalDinheiro + RecDinheiro;
    			TotalPOS = TotalPOS + RecPOS;
			    TotalMOOVPAY = TotalMOOVPAY + RecMOOVPAY;
			    TotalPIX = TotalPIX + RecPIX;
    			TotalVoucher = TotalVoucher + RecVoucher;
    			TotalConvenio = TotalConvenio + RecConvenio;
    			
    			TotalVendido = (RecDinheiro+RecCartao+RecPOS+RecConvenio+RecVoucher+RecPIX+RecMOOVPAY);
    			
    			TotalCaixa = (TotalDinheiro+TotalCartao+TotalPOS+TotalConvenio+TotalPIX+TotalVoucher+TotalMOOVPAY);
    			TotalDisponivel = TotalDinheiro + TotalFatura;
    			
    			TotalQuebraCaixaMov = parseFloat(VrInformadoDinheiro) - parseFloat(RecDinheiro);
    
                if(SituacaoCaixa=='False'){
                    SituacaoCaixa='<td style="text-align: center; font-size: 11px;"><label style="color:blue;"><b>ABERTO</b></label></td>';
                }else{
                    SituacaoCaixa='<td style="text-align: center; font-size: 11px;"><label style="color:red;"><b>FECHADO</b></label></td>';
                }
                
    			$('#resultadoListCaixa').append(
    				`<tr>
    				    <td><label style="color: blue; font-size: 11px;">` + IDMovimentoCaixa +`</label></td>
    				    <td><label style="color: blue; font-size: 11px;">` + IDCaixa +` - ` + NomeCaixa +`</label></td>
    				    <td><label style="color: blue; font-size: 11px;">` + DTAbertura +`</label></td>
    				    <td><label style="color: blue; font-size: 11px;">` + NomeOperador +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecFatura.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecDinheiro.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecCartao.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecPOS.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecPIX.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecFaturaPIX.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecVoucher.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecConvenio.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(TotalVendido.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(VrDisponivel.toFixed(2)) +`</label></td>`
                         +SituacaoCaixa+
                    `</tr>`
    			);
    			
    			var dados = {
                  "ID": IDMovimentoCaixa,
                  "VRFISICODINHEIRO": parseFloat(RecDinheiro),
                  "VRQUEBRACAIXA": parseFloat(TotalQuebraCaixaMov)
                };
            
            console.table(dados);
            
              	ajaxPut("api/movimento-caixa/ajuste-fisicodinheiro.xsjs", dados)
            		.then(funcSucessEditarDinheiroFisico)
            		.catch(funcErrorEditarDinheiroFisico);
            		
    		}
    
    		$('.totalCaixas').html(
    			`<tr>
                    <th colspan="4" style="text-align: center;">Total dos Caixas</th>
                    <th style="text-align: right;">${mascaraValor(TotalFatura.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalDinheiro.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalCartao.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalPOS.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalPIX.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalFaturaPIX.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalVoucher.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalConvenio.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalCaixa.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalDisponivel.toFixed(2))}</th>
                    <input type="hidden" name="VrTotalDisponivel" id="VrTotalDisponivel" value="${TotalDisponivel}">
                    <th colspan="1"></th>
                </tr>
                <tr id="tagtotaldespesa">
                </tr>
                <tr id="tagtotaladiantamento">
                </tr>
                <tr id="tagquebracaixaop">
                </tr>
                <tr id="tagtotalquebra">
                </tr>
                <tr id="tagtotaldisponivel">
                </tr>`
    		);
    
    		ajaxGet('api/dashboard/despesa-loja.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + dataAtualCampo)
    			.then(retornoDespesaLojaCaixa)
    			.catch(funcErrorDespesaLojaCaixa);
    			
		}else{
		    $('#resultadoListCaixa').html('');
		    
		}

	}

	ajaxGet('api/dashboard/venda/lista-caixas-movimento.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataFechamento=' + dataAtualCampo)
		.then(retornoListaCaixasMovimento)
		.catch(funcErrorListaCaixasMovimento);

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

	$('#tagtotaldespesa').html(	`<th colspan="5" style="text-align: center;">Total Despesas: (-)</th>
	<th colspan="7" style="text-align: center;"></th>
	<th style="text-align: right;"><label style="color: red;">${mascaraValor(TotalDespCaixa.toFixed(2))}</label></th>
	<th colspan="1"></th>`);

    			
			ajaxGet('api/dashboard/adiantamento-salarial.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + dataAtualCampo)
    			.then(retornoAdiantamentoSalarial)
    			.catch(funcError);
			
}

    function retornoAdiantamentoSalarial(respostaAdiantamentoSalarial) {

	TotalAdiantamentoSalarial = parseFloat(respostaAdiantamentoSalarial.data[0]['VRADIANTAMENTO']);

	$('#tagtotaladiantamento').html(	`<th colspan="5" style="text-align: center;">Total Adiantamento Salarial: (-)</th>
	<th colspan="7" style="text-align: center;"></th>
	<th style="text-align: right;"><label style="color: red;">${mascaraValor(TotalAdiantamentoSalarial.toFixed(2))}</label></th>
	<th colspan="1"></th>`);
	
		return ajaxGet('api/administrativo/quebra-caixa-loja.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + dataAtualCampo)
		.then(retornoQuebraCaixaLojaHoje)
		.catch(funcErrorQuebraCaixaLojaHoje);
}
    
    function retornoQuebraCaixaLojaHoje(respostaQuebraCaixa) {

        QuebraCaixaDinheiroTotal = 0;
        QuebraCaixaDinheiro = 0;
        QuebraCaixaDinheiroFisicoTotal = 0;
        QuebraCaixaOp = 0;
        
    if(respostaQuebraCaixa.data.length != 0){
        for (var i = 0; i < respostaQuebraCaixa.data.length; i++) {
        
    	IDMovCaixaOp = respostaQuebraCaixa.data[i]['IDMOVCAIXAOP'];
    	QuebraCaixaDinheiroRec = parseFloat(respostaQuebraCaixa.data[i]['VRFISICODINHEIRO']);
    	QuebraCaixaDinheiroInf = parseFloat(respostaQuebraCaixa.data[i]['VRRECDINHEIRO']);
    	QuebraCaixaDinheiroAjuste = parseFloat(respostaQuebraCaixa.data[i]['VRRECDINHEIROAJUSTE']);
    	
    	if(QuebraCaixaDinheiroAjuste>0){
    	    QuebraCaixaDinheiro = QuebraCaixaDinheiroAjuste;
    	   
    	}else{
    	    QuebraCaixaDinheiro = QuebraCaixaDinheiroInf;
    	}
    	
    	QuebraCaixaOp = QuebraCaixaDinheiro - QuebraCaixaDinheiroRec;
    	
    	if(QuebraCaixaOp>0){
    	   
            $('.totalCaixas').append(`<tr><th colspan="5" style="text-align: center;">Quebra do Caixa (fechados): (+)</th>
        	<th colspan="7" style="text-align: center;">${IDMovCaixaOp}</th>
        	<th style="text-align: right;"><label style="color: blue;"> + ${mascaraValor(QuebraCaixaOp.toFixed(2))}</label></th>
        	<th colspan="1"></th></tr>
        	
        	`);
    	    
        }else{
            $('.totalCaixas').append(`<tr>
            <th colspan="5" style="text-align: center;">Quebra do Caixa (fechados): (-)</th>
        	<th colspan="7" style="text-align: center;">${IDMovCaixaOp}</th>
        	<th style="text-align: right;"><label style="color: red;"> - ${mascaraValor(QuebraCaixaOp.toFixed(2))}</label></th>
        	<th colspan="1"></th></tr>
        	
        	`);
        }
    	
    	QuebraCaixaDinheiroTotal = QuebraCaixaDinheiroTotal + QuebraCaixaDinheiro;
    	QuebraCaixaDinheiroFisicoTotal = QuebraCaixaDinheiroFisicoTotal + QuebraCaixaDinheiroRec;
    	
    	TotalQuebraCaixa = QuebraCaixaDinheiroTotal - QuebraCaixaDinheiroFisicoTotal;
    
        
	}
	    if(TotalQuebraCaixa>0){
            $('.totalCaixas').append(	`<tr><th colspan="5" style="text-align: center;">Total Quebra (só caixas fechados): (+)</th>
        	<th colspan="7" style="text-align: center;"></th>
        	<th style="text-align: right;"><label style="color: blue;"> + ${mascaraValor(TotalQuebraCaixa.toFixed(2))}</label></th>
        	<th colspan="1"></th></tr>`);
        }else{
            $('.totalCaixas').append(	`<tr><th colspan="5" style="text-align: center;">Total Quebra (só caixas fechados): (-)</th>
        	<th colspan="7" style="text-align: center;"></th>
        	<th style="text-align: right;"><label style="color: red;"> - ${mascaraValor(TotalQuebraCaixa.toFixed(2))}</label></th>
        	<th colspan="1"></th></tr>`);
        }
    }else{
        
        TotalQuebraCaixa = 0;
        
            $('.totalCaixas').append(	`<tr><th colspan="5" style="text-align: center;">Quebra Caixa (só caixas fechados): (+)</th>
        	<th colspan="7" style="text-align: center;"></th>
        	<th style="text-align: right;"><label style="color: red;"> + ${mascaraValor(TotalQuebraCaixa.toFixed(2))}</label></th>
        	<th colspan="1"></th></tr>`);

    }
   
	    TotalCaixasDisponivel = parseFloat($('#VrTotalDisponivel').val());
	
	    TotalDisponivel = (TotalCaixasDisponivel - TotalDespCaixa - TotalAdiantamentoSalarial) + TotalQuebraCaixa;
    	
    	$('.totalCaixas').append(	`<tr><th colspan="5" style="text-align: center;">Total Disponível (Dinheiro + Faturas - Despesas - Adiantamentos - Quebra): </th>
    	<th colspan="7" style="text-align: center;"></th>
    	<th style="text-align: right;">${mascaraValor(TotalDisponivel.toFixed(2))}</th>
    	<th colspan="1"></th></tr>`);
    
}

    function funcErrorListaCaixasMovimento(data) {
    	Swal.fire({
    		type: "error",
    		title: 'Erro ao Carregar os Dados do retornoListaCaixasMovimento',
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
	
	function funcErrorQuebraCaixaLojaHoje(data) {
    	Swal.fire({
    		type: "error",
    		title: 'Erro ao Carregar os Dados do retornoQuebraCaixaLojaHoje',
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
                                    <td style="font-size: 12px;"><b>` + funcDeposito + `  Dep. Dinh  - Data do Movimento: ` + dataDepositoMovimento + `</b></td>
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
    
    }

    ajaxGet('api/dashboard/extrato-loja-periodo.xsjs?pageSize=500&page=1&idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInicio=' + dataAtualCampo + '&dataPesquisaFim=' + dataAtualCampo)
        .then(retornoListaExtratodaLojaDia)
        .catch(funcErrorListaExtratoLojaDia);

	function funcErrorListaExtratoLojaDia(data) {
		Swal.fire({
			type: "error",
			title: 'Erro ao Carregar os Dados do retornoListaExtratodaLojaDia',
			showConfirmButton: false,
			timer: 15000
		});
	}

    /////////////Lista Vendas por Vendedor /////////////////////////////////

	function retornoListaVendasVendedor(respostaListaVendaVendedor) {

		var QTDProduto = 0;
		var VrVendido = 0;
		var VrVoucher = 0;
		var TotalVendaVendedor = 0;
		var TotalVoucherVendedor = 0;
		var VrVendidoVendedor = 0;
		var TotalLiqVendidoVendedor = 0;

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
	}

	ajaxGet('api/dashboard/venda/vendedor.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataFechamento=' + dataAtualCampo)
		.then(retornoListaVendasVendedor)
		.catch(funcErrorListaVendasVendedor);

	function funcErrorListaVendasVendedor(data) {
		Swal.fire({
			type: "error",
			title: 'Erro ao Carregar os Dados do retornoListaVendasVendedor',
			showConfirmButton: false,
			timer: 15000
		});
	}
	
    /////////////Lista Vendas Ativas /////////////////////////////////

	function retornoListaVendasAtivas(respostaListaVendaAtivas) {

		var VendaAtivaValor = 0;
		var TotalVendaAtiva = 0;
		var contadorAtiva = 0;
        var tableVendasAtivas = $('#dt-basic-venda-ativa').DataTable();
        console.log(respostaListaVendaAtivas.data.length);
		tableVendasAtivas.rows().remove().draw();
		for (var i = 0; i < respostaListaVendaAtivas.data.length; i++) {

			contadorAtiva = contadorAtiva + 1;

			NumCaixa = respostaListaVendaAtivas.data[i]['IDCAIXAWEB'];
			DescCaixa = respostaListaVendaAtivas.data[i]['DSCAIXA'];
			NuVenda = respostaListaVendaAtivas.data[i]['IDVENDA'];
			NuNFCe = respostaListaVendaAtivas.data[i]['NFE_INFNFE_IDE_NNF'];
			DTAberturaVendaAtiva = respostaListaVendaAtivas.data[i]['DTHORAFECHAMENTO'];
			NomeOperadorVendaAtiva = respostaListaVendaAtivas.data[i]['NOFUNCIONARIO'];

			VendaAtivaValor = parseFloat(respostaListaVendaAtivas.data[i]['VRTOTALPAGO']);
			EmitidasAtivas = respostaListaVendaAtivas.data[i]['STCONTINGENCIA'];

			if (EmitidasAtivas == 'false') {
				NotaEmitidaAtiva = 'Contigência';
			} else {
				NotaEmitidaAtiva = 'Emitida';
			}

			TotalVendaAtiva = TotalVendaAtiva + VendaAtivaValor;
        
			tableVendasAtivas.row.add([
                `<label style="color: blue; font-size: 11px;">` + contadorAtiva + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NumCaixa + ` - ` + DescCaixa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuVenda + `</label>`,
                `<label style="color: blue;">` + NuNFCe + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + DTAberturaVendaAtiva + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NomeOperadorVendaAtiva + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaAtivaValor.toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NotaEmitidaAtiva + `</label>`,
                `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVenda +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
                    <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVenda + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVenda + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
                </div>`,
            ]).draw(false);

		}

		$('.totalAtivas').html(
			`<tr>
                <th colspan="6" style="text-align: center;">Total Vendas Ativas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaAtiva.toFixed(2))}</th>
                <th colspan="2"></th>
            </tr>`
		);
	}

	ajaxGet('api/dashboard/venda/resumo-venda-caixa.xsjs?pagesize=1000&status=False&idEmpresa=' + IDEmpresaLogin + '&dataFechamento=' + dataAtualCampo)
		.then(retornoListaVendasAtivas)
		.catch(funcErrorListaVendasAtivas);

	function funcErrorListaVendasAtivas(data) {
		Swal.fire({
			type: "error",
			title: 'Erro ao Carregar os Dados do retornoListaVendasAtivas',
			showConfirmButton: false,
			timer: 15000
		});
	}
	
    /////////////Lista Vendas Canceladas /////////////////////////////////

	function retornoListaVendasCanceladas(respostaListaVendaCanceladas) {

		var VrVendaCancelada = 0;
		var TotalVendaCancelada = 0;
		var contadorCancelada = 0;

		for (var i = 0; i < respostaListaVendaCanceladas.data.length; i++) {

			contadorCancelada = contadorCancelada + 1;

			NumCaixaCancelada = respostaListaVendaCanceladas.data[i]['IDCAIXAWEB'];
			DescCaixaCancelada = respostaListaVendaCanceladas.data[i]['DSCAIXA'];
			NuVendaCancelada = respostaListaVendaCanceladas.data[i]['IDVENDA'];
			NuNFCeCancelada = respostaListaVendaCanceladas.data[i]['NFE_INFNFE_IDE_NNF'];
			DTAberturaVendaCancelada = respostaListaVendaCanceladas.data[i]['DTHORAFECHAMENTO'];
			NomeOperadorVendaCancelada = respostaListaVendaCanceladas.data[i]['NOFUNCIONARIO'];
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
                `<label style="color: blue;">` + contadorCancelada + `</label>`,
                `<label style="color: blue;">` + NumCaixaCancelada + ` - ` + DescCaixaCancelada + `</label>`,
                `<label style="color: blue;">` + NuVendaCancelada + `</label>`,
                `<label style="color: blue;">` + NuNFCeCancelada + `</label>`,
                `<label style="color: blue;">` + DTAberturaVendaCancelada + `</label>`,
                `<label style="color: blue;">` + NomeOperadorVendaCancelada + `</label>`,
                `<label style="color: blue;">` + VrVendaCancelada + `</label>`,
                `<label style="color: blue;">` + NotaEmitidaCancelada + `</label>`,
                `<label style="color: blue;">` + MotivoCancelada + `</label>`,
                `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVenda +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
                    <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVenda + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVenda + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
                </div>`,
            ]).draw(false);

		}

		$('.totalCanceladas').html(
			`<tr>
                <th colspan="6" style="text-align: center;">Total Vendas Canceladas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaCancelada.toFixed(2))}</th>
                <th colspan="3"></th>
            </tr>`
		);
	}

	ajaxGet('api/dashboard/venda/resumo-venda-caixa.xsjs?status=True&idEmpresa=' + IDEmpresaLogin + '&dataFechamento=' + dataAtualCampo)
		.then(retornoListaVendasCanceladas)
		.catch(funcErrorListaVendasCanceladas);
		
	function funcErrorListaVendasCanceladas(data) {
		Swal.fire({
			type: "error",
			title: 'Erro ao Carregar os Dados do retornoListaVendasCanceladas',
			showConfirmButton: false,
			timer: 15000
		});
	}

});

///////////////////////// FIM DOCUMENT READY///////////////////////////////////////////////////////

function retornoListaCaixaFechadosNaoConferidos(resposta){
    
    htmlCaixasNaoConferidos = `<ul> `;
    htmlCaixasNaoConferidos += `<li>&nbsp&nbsp&nbsp&nbsp  Nº do Movimento &nbsp&nbsp&nbsp&nbsp   - &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Caixa - Data Abertura - Falta(m)</li>`;
    htmlCaixasNaoConferidos += `<br>`;
    
    for(var i=0; i< resposta.data.length; i++){ 
        
        var dtfechamento = resposta.data[i]['DTFECHAMENTO'];
        var dtabertura = resposta.data[i]['DTABERTURA'].split('-');
        let d72 = new Date(dtabertura);
        
        d72.setDate(d72.getDate() + 3);
        
        var dataHoje = new Date();
        var diaHoje = dataHoje.getDate(); // 1-31
        var mesHoje = dataHoje.getMonth(); // 0-11 (zero=janeiro)
        var anoHoje = dataHoje.getFullYear(); // 4 dígitos
        
        diaFormatadoHoje = String(diaHoje);
        mesatualHoje = (mesHoje + 1);
        mesFormatadoHoje = String(mesatual);
        
        var dia72 = d72.getDate(); // 1-31
        var mes72 = d72.getMonth(); // 0-11 (zero=janeiro)
        var ano72 = d72.getFullYear(); // 4 dígitos
        
        diaFormatado72 = String(dia72);
        mesatual72 = (mes72 + 1);
        mesFormatado72 = String(mesatual);
        
        var firstDate=new Date(); 
        firstDate.setFullYear(ano72,(mesFormatado72.padStart(2, '0')),diaFormatado72.padStart(2, '0'));
      
        var secondDate=new Date();
        secondDate.setFullYear(anoHoje,(mesFormatadoHoje.padStart(2, '0')),diaFormatadoHoje.padStart(2, '0'));
       
        //const now = new Date(); // Data de hoje
        //const past = new Date($('#DTValCertificado').val()); // Outra data no passado
        const diff = Math.abs(secondDate.getTime() - firstDate.getTime()); // Subtrai uma data pela outra
        const diff2 = Math.abs(firstDate.getTime()); // Subtrai uma data pela outra
        const diff3 = Math.abs(secondDate.getTime()); // Subtrai uma data pela outra
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)); // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).

       htmlCaixasNaoConferidos += `<li>`+ resposta.data[i]['ID'] +`&nbsp&nbsp -  ` + resposta.data[i]['DSCAIXA'] +` - ` + resposta.data[i]['DTHORAABERTURA'] +` - ` + days +` dia(s) </li>`;   
    }
     
    htmlCaixasNaoConferidos += `</ul>`;
		
		if(resposta.data.length >= 1){
		    
		    flagConferido = 1; 
		    flagConferidoData = resposta.data[0]['DTABERTURA'];
		    
        	Swal.fire({
    			type: "warning",
    			title: "Caixas Fechados e não Conferidos",
    			html: htmlCaixasNaoConferidos,
    			showConfirmButton: true,
    			timer: 15000
    		}).then(function(isConfirm) {
              if (isConfirm) {
                swal.fire({
                  title: 'Bloqueio de Dados',
                  text: 'Seus Dados serão bloqueados até que o(s) CAIXA(S) seja(am) CONFIRMADO(S)!',
                  icon: 'success',
    			  timer: 15000
                }).then(function() {
                });
              }
            });
		}
}

/////////Botão Atualizar dados do DashboardGerencial///////////////////

function atualizar_dados() {

    //if(flagConferidoData!=''){
    //    	var DTSubmeteData = flagConferidoData;
    //}else{
        	var DTSubmeteData = $("#parametro_dia").val();
    //}

	function retornoVendaLojaData(resposta) {

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

		ajaxGet('api/dashboard/despesa-loja.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + DTSubmeteData)
			.then(retornoDespesaLojaData)
			.catch(funcError);
			
		ajaxGet('api/dashboard/adiantamento-salarial.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + DTSubmeteData)
    			.then(retornoAdiantamentoSalarialData)
    			.catch(funcError);
	}

	function funcError(data) {
		Swal.fire({
			type: "error",
			title: data.msg,
			showConfirmButton: false,
			timer: 15000
		});
	}

	ajaxGet('api/dashboard/resumo-venda.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + DTSubmeteData)
		.then(retornoVendaLojaData)
		.catch(funcError);

	// Leandro Massafera - 01/11/2022
	ajaxGet('api/administrativo/resumo-venda-ecommerce.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + DTSubmeteData)
	    .then(retornoVendaEcommerceData)
        .catch(funcError);

    // Leandro Massafera - 01/11/2022
    function retornoVendaEcommerceData(respostaVendaEcommerceData) {
    
    	TotalVendaEcommerce = respostaVendaEcommerceData.data[0]['VRECOMMERCE'];
    	if (respostaVendaEcommerceData.data[0]['VRECOMMERCE'] == null) {
    		TotalVendaEcommerce = 0;
    	}
    
    	$('.ecommerce').html(
    		`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(TotalVendaEcommerce)}<small class="m-0 l-h-n">E-Commerce</small></h3>`
    	);
    
    }
    
	function retornoDespesaLojaData(respostadesp) {

		TotalDesp = parseFloat(respostadesp.data[0]['VRDESPESA']);
		if (respostadesp.data[0]['VRDESPESA'] == null) {
			TotalDesp = 0;
		}

		$('.despesaLoja').html(
			`<h3 class="display-4 d-block l-h-n m-0 fw-500">${mascaraValor(TotalDesp.toFixed(2))}
                                    <small class="m-0 l-h-n">Despesas</small>
                                </h3>`
		);

	}
	
	function retornoAdiantamentoSalarialData(respostaAdiant) {

        TotalAdiantamentoSalarial = 0;
    
		TotalAdiantamentoSalarial = parseFloat(respostaAdiant.data[0]['VRADIANTAMENTO']);
		
		$('#tagtotaladiantamento').html(	`<th colspan="5" style="text-align: center;">Total Adiantamento Salarial: (-)</th>
	        <th colspan="7" style="text-align: center;"></th>
	        <th style="text-align: right;"><label style="color: red;">${mascaraValor(TotalAdiantamentoSalarial.toFixed(2))}</label></th>
	        <th colspan="1"></th>`);

	}

	/////////////Lista de Caixas ///////////////////////////////////////////

	function retornoListaCaixasMovimento(respostaListaCaixaMovimento) {
	    
        var TotalFatura = 0;
        var TotalFaturaPIX = 0;
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
		
		$('#resultadoListCaixa').html('');

		if(respostaListaCaixaMovimento['rows'] > 0 ){

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
    
                if(RecFatura>0){
                    RecFatura = RecFatura;
                }else{
                    RecFatura=0;
                }
            
                if(RecFaturaPIX>0){
                    RecFaturaPIX = RecFaturaPIX;
                }else{
                    RecFaturaPIX=0;
                }
                
                if(RecCartao>0){
                    RecCartao = RecCartao;
                }else{
                    RecCartao=0;
                }
                
                if(RecDinheiro>0){
                    RecDinheiro = RecDinheiro;
                }else{
                    RecDinheiro=0;
                }
                
                if(RecPOS>0){
                    RecPOS = RecPOS;
                }else{
                    RecPOS=0;
                }

                if(RecPIX>0){
                    RecPIX = RecPIX;
                }else{
                    RecPIX=0;
                }

                if(RecMOOVPAY>0){
                    RecMOOVPAY = RecMOOVPAY;
                }else{
                    RecMOOVPAY=0;
                }
                
                if(RecVoucher>0){
                    RecVoucher = RecVoucher;
                }else{
                    RecVoucher=0;
                }
                
                if(RecConvenio>0){
                    RecConvenio = RecConvenio;
                }else{
                    RecConvenio=0;
                }
                
                if(VrVendido>0){
                    VrVendido = VrVendido;
                }else{
                    VrVendido=0;
                }
                
                VrDisponivel = RecDinheiro + RecFatura;
    			TotalFatura = TotalFatura + RecFatura;
			    TotalFaturaPIX = TotalFaturaPIX + RecFaturaPIX;
    			TotalCartao = TotalCartao + RecCartao;
    			TotalDinheiro = TotalDinheiro + RecDinheiro;
    			TotalPOS = TotalPOS + RecPOS;
			    TotalPIX = TotalPIX + RecPIX;
			    TotalMOOVPAY = TotalMOOVPAY + RecMOOVPAY;
    			TotalVoucher = TotalVoucher + RecVoucher;
    			TotalConvenio = TotalConvenio + RecConvenio;
    			
    			TotalVendido = (RecDinheiro+RecCartao+RecPOS+RecConvenio+RecVoucher+RecPIX+RecMOOVPAY);
    			
    			TotalCaixa = (TotalDinheiro+TotalCartao+TotalPOS+TotalConvenio+TotalPIX+TotalVoucher+TotalMOOVPAY);
    			TotalDisponivel = TotalDinheiro + TotalFatura;
    			
    			TotalQuebraCaixaMov = parseFloat(VrInformadoDinheiro) - parseFloat(RecDinheiro);
    
                if(SituacaoCaixa=='False'){
                    SituacaoCaixa='<td style="text-align: center; font-size: 11px;"><label style="color:blue;"><b>ABERTO</b></label></td>';
                }else{
                    SituacaoCaixa='<td style="text-align: center; font-size: 11px;"><label style="color:red;"><b>FECHADO</b></label></td>';
                }
                
    			$('#resultadoListCaixa').append(
    				`<tr>
    				    <td><label style="color: blue; font-size: 11px;">` + IDMovimentoCaixa +`</label></td>
    				    <td><label style="color: blue; font-size: 11px;">` + IDCaixa +` - ` + NomeCaixa +`</label></td>
    				    <td><label style="color: blue; font-size: 11px;">` + DTAbertura +`</label></td>
    				    <td><label style="color: blue; font-size: 11px;">` + NomeOperador +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecFatura.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecDinheiro.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecCartao.toFixed(2)) +	`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecPOS.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecPIX.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecFaturaPIX.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecVoucher.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(RecConvenio.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(TotalVendido.toFixed(2)) +`</label></td>
                        <td style="text-align: right;"><label style="color: black;">` + mascaraValor(VrDisponivel.toFixed(2)) +`</label></td>`
                         +SituacaoCaixa+
                    `</tr>`
    			);
    			
    			var dados = {
                  "ID": IDMovimentoCaixa,
                  "VRFISICODINHEIRO": parseFloat(RecDinheiro),
                  "VRQUEBRACAIXA": parseFloat(TotalQuebraCaixaMov)
                };
            
            console.table(dados);
            
              	ajaxPut("api/movimento-caixa/ajuste-fisicodinheiro.xsjs", dados)
            		.then(funcSucessEditarDinheiroFisico)
            		.catch(funcErrorEditarDinheiroFisico);
    		}
    
    		$('.totalCaixas').html(
    			`<tr>
                    <th colspan="4" style="text-align: center;">Total dos Caixas</th>
                    <th style="text-align: right;">${mascaraValor(TotalFatura.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalDinheiro.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalCartao.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalPOS.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalPIX.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalFaturaPIX.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalVoucher.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalConvenio.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalCaixa.toFixed(2))}</th>
                    <th style="text-align: right;">${mascaraValor(TotalDisponivel.toFixed(2))}</th>
                    <input type="hidden" name="VrTotalDisponivel" id="VrTotalDisponivel" value="${TotalDisponivel}">
                    <th colspan="1"></th>
                </tr>
                <tr id="tagtotaldespesa">
                </tr>
                <tr id="tagtotaladiantamento">
                </tr>
                <tr id="tagquebracaixaop">
                </tr>
                <tr id="tagtotalquebra">
                </tr>
                <tr id="tagtotaldisponivel">
                </tr>`
    		);
    		
    		return ajaxGet('api/dashboard/despesa-loja.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + DTSubmeteData)
    			.then(retornoDespesaLojaCaixa)
    			.catch(funcErrorDespesaLojaCaixa);
    			
		}else{
		  $('.totalCaixas').html('');
		}
	}

	ajaxGet('api/dashboard/venda/lista-caixas-movimento.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataFechamento=' + DTSubmeteData)
		.then(retornoListaCaixasMovimento) 
		.catch(funcErrorListaCaixasMovimento);


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
    
    	$('#tagtotaldespesa').html(	`<th colspan="5" style="text-align: center;">Total Despesas: (-)</th>
    	<th colspan="7" style="text-align: center;"></th>
    	<th style="text-align: right;"><label style="color: red;">${mascaraValor(TotalDespCaixa.toFixed(2))}</label></th>
    	<th colspan="1"></th>`);
    
		return ajaxGet('api/administrativo/quebra-caixa-loja.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisa=' + DTSubmeteData)
			.then(retornoQuebraCaixaLoja)
			.catch(funcErrorQuebraCaixaLoja);
    			
    }
    
    function retornoQuebraCaixaLoja(respostadQuebraCaixa) {

        QuebraCaixaDinheiroTotal = 0;
        QuebraCaixaDinheiro = 0;
        QuebraCaixaDinheiroFisicoTotal = 0;
        QuebraCaixaOp = 0;

        if(respostadQuebraCaixa.data.length != 0){
            for (var i = 0; i < respostadQuebraCaixa.data.length; i++) {
	            IDMovCaixaOp = respostadQuebraCaixa.data[i]['IDMOVCAIXAOP'];
    	        QuebraCaixaDinheiroRec = parseFloat(respostadQuebraCaixa.data[i]['VRFISICODINHEIRO']);
    	        QuebraCaixaDinheiroInf = parseFloat(respostadQuebraCaixa.data[i]['VRRECDINHEIRO']);
    	        QuebraCaixaDinheiroAjuste = parseFloat(respostadQuebraCaixa.data[i]['VRRECDINHEIROAJUSTE']);

    	        if(QuebraCaixaDinheiroAjuste>0){
    	            QuebraCaixaDinheiro = QuebraCaixaDinheiroAjuste;
    	       	}else{
    	            QuebraCaixaDinheiro = QuebraCaixaDinheiroInf;
    	      	} 
    	
    	        QuebraCaixaOp = QuebraCaixaDinheiro - QuebraCaixaDinheiroRec;
    	
    	        if(QuebraCaixaOp>0){
    	            $('.totalCaixas').append(`<tr><th colspan="5" style="text-align: center;">Quebra do Caixa (fechados): (+)</th>
        	            <th colspan="7" style="text-align: center;">${IDMovCaixaOp}</th>
        	            <th style="text-align: right;"><label style="color: blue;"> + ${mascaraValor(QuebraCaixaOp.toFixed(2))}</label></th>
        	            <th colspan="1"></th></tr>`);
                }else{
                    $('.totalCaixas').append(`<tr>
                        <th colspan="5" style="text-align: center;">Quebra do Caixa (fechados): (-)</th>
        	            <th colspan="7" style="text-align: center;">${IDMovCaixaOp}</th>
        	            <th style="text-align: right;"><label style="color: red;"> - ${mascaraValor(QuebraCaixaOp.toFixed(2))}</label></th>
        	            <th colspan="1"></th></tr>`);
                }
    	
    	        QuebraCaixaDinheiroTotal = QuebraCaixaDinheiroTotal + QuebraCaixaDinheiro;
    	        QuebraCaixaDinheiroFisicoTotal = QuebraCaixaDinheiroFisicoTotal + QuebraCaixaDinheiroRec;
    	    	TotalQuebraCaixa = QuebraCaixaDinheiroTotal - QuebraCaixaDinheiroFisicoTotal;
    	    }
    	    
	        if(TotalQuebraCaixa>0){
                $('.totalCaixas').append(	`<tr><th colspan="5" style="text-align: center;">Total Quebra (só caixas fechados): (+)</th>
        	        <th colspan="7" style="text-align: center;"></th>
        	        <th style="text-align: right;"><label style="color: blue;"> + ${mascaraValor(TotalQuebraCaixa.toFixed(2))}</label></th>
        	        <th colspan="1"></th></tr>`);
            }else{
                $('.totalCaixas').append(	`<tr><th colspan="5" style="text-align: center;">Total Quebra (só caixas fechados): (-)</th>
        	        <th colspan="7" style="text-align: center;"></th>
        	        <th style="text-align: right;"><label style="color: red;"> - ${mascaraValor(TotalQuebraCaixa.toFixed(2))}</label></th>
        	        <th colspan="1"></th></tr>`);
            }
        
            
        }else{
            TotalQuebraCaixa = 0;
            $('.totalCaixas').append(	`<tr><th colspan="5" style="text-align: center;">Quebra Caixa (fechados): (+)</th>
        	    <th colspan="7" style="text-align: center;"></th>
        	    <th style="text-align: right;"><label style="color: red;"> + ${mascaraValor(TotalQuebraCaixa.toFixed(2))}</label></th>
        	    <th colspan="1"></th></tr>`);
        }
        
	    TotalCaixasDisponivel = parseFloat($('#VrTotalDisponivel').val());
	    TotalDisponivel = TotalCaixasDisponivel - TotalDespCaixa - TotalAdiantamentoSalarial + TotalQuebraCaixa;
    	$('.totalCaixas').append(	`<tr><th colspan="5" style="text-align: center;">Total Disponível (Dinheiro + Faturas - Despesas - Adiantamentos - Quebra): </th>
    	    <th colspan="7" style="text-align: center;"></th>
    	    <th style="text-align: right;">${mascaraValor(TotalDisponivel.toFixed(2))}</th>
    	    <th colspan="1"></th></tr>`);
    
    }

	function funcErrorListaCaixasMovimento(data) {
		Swal.fire({
			type: "error",
			title: 'Erro ao Carregar os Dados do retornoListaCaixasMovimento',
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
	
	function funcErrorQuebraCaixaLoja(data) {
    	Swal.fire({
    		type: "error",
    		title: 'Erro ao Carregar os Dados do retornoQuebraCaixaLoja',
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
    
    }

    ajaxGet('api/dashboard/extrato-loja-periodo.xsjs?pageSize=500&page=1&idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInicio=' + DTSubmeteData + '&dataPesquisaFim=' + DTSubmeteData)
        .then(retornoListaExtratodaLojaDia)
        .catch(funcErrorListaExtratoLojaDia);

	function funcErrorListaExtratoLojaDia(data) {
		Swal.fire({
			type: "error",
			title: 'Erro ao Carregar os Dados do retornoListaExtratodaLojaDia',
			showConfirmButton: false,
			timer: 15000
		});
	}
	
	/////////////Lista Vendas por Vendedor ///////////////////////////////// 

	function retornoListaVendasVendedorData(respostaListaVendaVendedor) {

		var QTDProduto = 0;
		var VrVendido = 0;
		var VrVoucher = 0;
		var TotalVendaVendedor = 0;
		var TotalVoucherVendedor = 0;
		var VrVendidoVendedor = 0;
		var TotalLiqVendidoVendedor = 0;
        
        $('#resultadoListVendedor').html('');
        
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
	}

	ajaxGet('api/dashboard/venda/vendedor.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataFechamento=' + DTSubmeteData)
		.then(retornoListaVendasVendedorData)
		.catch(funcError);
		
	/////////////Lista Vendas Ativas /////////////////////////////////

	function retornoListaVendasAtivasData(respostaListaVendaAtivas) {

		var VendaAtivaValor = 0;
		var TotalVendaAtiva = 0;
		var contadorAtiva = 0;
		var tableVendasAtivas = $('#dt-basic-venda-ativa').DataTable();
		tableVendasAtivas.rows().remove().draw();

		for (var i = 0; i < respostaListaVendaAtivas.data.length; i++) {

			contadorAtiva = contadorAtiva + 1;

			NumCaixa = respostaListaVendaAtivas.data[i]['IDCAIXAWEB'];
			DescCaixa = respostaListaVendaAtivas.data[i]['DSCAIXA'];
			NuVenda = respostaListaVendaAtivas.data[i]['IDVENDA'];
			NuNFCe = respostaListaVendaAtivas.data[i]['NFE_INFNFE_IDE_NNF'];
			DTAberturaVendaAtiva = respostaListaVendaAtivas.data[i]['DTHORAFECHAMENTO'];
			NomeOperadorVendaAtiva = respostaListaVendaAtivas.data[i]['NOFUNCIONARIO'];

			VendaAtivaValor = parseFloat(respostaListaVendaAtivas.data[i]['VRTOTALPAGO']);
			EmitidasAtivas = respostaListaVendaAtivas.data[i]['STCONTINGENCIA'];

			if (EmitidasAtivas == 'false') {
				NotaEmitidaAtiva = 'Contigência';
			} else {
				NotaEmitidaAtiva = 'Emitida';
			}

			TotalVendaAtiva = TotalVendaAtiva + VendaAtivaValor;

			tableVendasAtivas.row.add([
                `<label style="color: blue; font-size: 11px;">` + contadorAtiva + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NumCaixa + ` - ` + DescCaixa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuVenda + `</label>`,
                `<label style="color: blue;">` + NuNFCe + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + DTAberturaVendaAtiva + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NomeOperadorVendaAtiva + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VendaAtivaValor.toFixed(2)) + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NotaEmitidaAtiva + `</label>`,
                `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVenda +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
                    <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVenda + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVenda + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
                </div>`,
            ]).draw(false);

		}

		$('.totalAtivas').html(
			`<tr>
                <th colspan="6" style="text-align: center;">Total Vendas Ativas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaAtiva.toFixed(2))}</th>
                <th colspan="2"></th>
            </tr>`
		);
	}

	ajaxGet('api/dashboard/venda/resumo-venda-caixa.xsjs?pagesize=1000&status=False&idEmpresa=' + IDEmpresaLogin + '&dataFechamento=' + DTSubmeteData)
		.then(retornoListaVendasAtivasData)
		.catch(funcError);

	/////////////Lista Vendas Canceladas /////////////////////////////////

	function retornoListaVendasCanceladasData(respostaListaVendaCanceladas) {

		var VrVendaCancelada = 0;
		var TotalVendaCancelada = 0;
		var contadorCancelada = 0;
		var tableVendasCancelada = $('#dt-basic-venda-cancelada').DataTable();
			tableVendasCancelada.rows().remove().draw();

		for (var i = 0; i < respostaListaVendaCanceladas.data.length; i++) {

			contadorCancelada = contadorCancelada + 1;

			NumCaixaCancelada = respostaListaVendaCanceladas.data[i]['IDCAIXAWEB'];
			DescCaixaCancelada = respostaListaVendaCanceladas.data[i]['DSCAIXA'];
			NuVendaCancelada = respostaListaVendaCanceladas.data[i]['IDVENDA'];
			NuNFCeCancelada = respostaListaVendaCanceladas.data[i]['NFE_INFNFE_IDE_NNF'];
			DTAberturaVendaCancelada = respostaListaVendaCanceladas.data[i]['DTHORAFECHAMENTO'];
			NomeOperadorVendaCancelada = respostaListaVendaCanceladas.data[i]['NOFUNCIONARIO'];
			MotivoCancelada = respostaListaVendaCanceladas.data[i]['TXTMOTIVOCANCELAMENTO'];

			VrVendaCancelada = parseFloat(respostaListaVendaCanceladas.data[i]['VRTOTALPAGO']);
			EmitidasCancelada = respostaListaVendaCanceladas.data[i]['STCONTINGENCIA'];
			if (EmitidasCancelada == 'false') {
				NotaEmitidaCancelada = 'Contigência';
			} else {
				NotaEmitidaCancelada = 'Emitida';
			}
			TotalVendaCancelada = TotalVendaCancelada + VrVendaCancelada;
			
			tableVendasCancelada.row.add([
                `<label style="color: blue;">` + contadorCancelada + `</label>`,
                `<label style="color: blue;">` + NumCaixaCancelada + ` - ` + DescCaixaCancelada + `</label>`,
                `<label style="color: blue;">` + NuVendaCancelada + `</label>`,
                `<label style="color: blue;">` + NuNFCeCancelada + `</label>`,
                `<label style="color: blue;">` + DTAberturaVendaCancelada + `</label>`,
                `<label style="color: blue;">` + NomeOperadorVendaCancelada + `</label>`,
                `<label style="color: blue;">` + VrVendaCancelada + `</label>`,
                `<label style="color: blue;">` + NotaEmitidaCancelada + `</label>`,
                `<label style="color: blue;">` + MotivoCancelada + `</label>`,
                `<div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` +NuVendaCancelada +`" onclick="modal_Detalhe_Venda(this.id)" >Venda</button>
                    <button type="button" class="btn btn-warning btn-xs" title="Detalhar Produtos" id="` +NuVendaCancelada + `" onclick="modal_Detalhe_Produto(this.id)" >Produtos</button>
                    <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` +NuVendaCancelada + `" onclick="modal_Detalhe_Recebimento(this.id)" >Pagamento</button>
                </div>`,
            ]).draw(false);

		}

		$('.totalCanceladas').html(
			`<tr>
                <th colspan="6" style="text-align: center;">Total Vendas Canceladas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaCancelada.toFixed(2))}</th>
                <th colspan="3"></th>
            </tr>`
		);
	}

	ajaxGet('api/dashboard/venda/resumo-venda-caixa.xsjs?status=True&idEmpresa=' + IDEmpresaLogin + '&dataFechamento=' + DTSubmeteData)
		.then(retornoListaVendasCanceladasData)
		.catch(funcError);

}

//////////////////// Modais Detalhe Venda, Produtos e Recebimentos //////////////////////////////////////////

function funcErrorDetVenda(data) {
	Swal.fire({
		type: "error",
		title: data.msg,
		showConfirmButton: false,
		timer: 15000
	});
}

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

		    if(SituacaoProduto=='False'){
                tagDetProdAtivo='<td><label style="color: blue;">Ativo</label></td>';
            }else{
                tagDetProdAtivo='<td><label style="color: red;">Cancelado</label></td>';
            }
            
		$('#resultListDetalheVendaProduto').append(
			`<tr>
                    <td><label style="color: blue;">` + NumCodBarra +`</label></td>
                    <td><label style="color: blue;">` + DescProduto +`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrUnitario.toFixed(2)) +`</label></td>
                    <td><label style="color: blue;">` + QTDProduto +`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrTotal.toFixed(2)) +`</label></td>
                    <td><label style="color: blue;">` + NomeVendedor +`</label></td>`
			        +tagDetProdAtivo+
            `</tr>`
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

		return ajaxGet('api/dashboard/venda/resumo-venda-caixa-detalhado.xsjs?idEmpresa=' + IDEmpresaLogin + '&idVenda=' + id)
			.then(retornoListaVenda)
			.catch(funcError);
	})

}

function modal_Detalhe_Produto(id) {

	$.get('action_detvendaprodutomodal.html', function(res) {

		$('#resulmodaldetvendaproduto').html(res);
		$("#detVendaproduto").modal('show');
		$('#detVendaproduto').on('shown.bs.modal', function() {});

		return ajaxGet('api/dashboard/venda/detalhe-venda.xsjs?idEmpresa=' + IDEmpresaLogin + '&idVenda=' + id)
			.then(retornoListaVendasAtivasDetalheProduto)
			.catch(funcErrorDetVenda);
	})

}

function retornoListaVenda(respostaListaVendaDetalhe) {

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
            
		$('#nomeempVenda').val(NOEmpresaLogin);
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

	for (var i = 0; i < respostaListaPagamentoVenda.data.length; i++) {

		IDVendaPagamento = respostaListaPagamentoVenda.data[i]['venda']['IDVENDA'];
		VrDinheiroPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRDINHEIRO']);
		VrCartaoPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECCARTAO']);
		VrPOSPagamentoVenda = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECPOSVENDA']);
		VrPOSPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECPOS']);
		VrPIXPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECPIX']);
		VrMOOVPAYPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECMOOVPAY']);
		VrConvenioPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECCONVENIO']);
		VrVoucherPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECVOUCHER']);

		$('#resultListPagamentoVenda').append(
			`<tr>
                    <td><label style="color: blue;">` + mascaraValor(VrDinheiroPagamento.toFixed(2)) +
			`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrCartaoPagamento.toFixed(2)) +
			`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrPOSPagamento.toFixed(2)) +
			`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrPIXPagamento.toFixed(2)) +
			`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrMOOVPAYPagamento.toFixed(2)) +
			`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrConvenioPagamento.toFixed(2)) +
			`</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrVoucherPagamento.toFixed(2)) +
			`</label></td>
                </tr>`
		);

		for (var j = 0; j < respostaListaPagamentoVenda.data[i].vendaPagamento.length; j++) {

			TipoPagamento = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['DSTIPOPAGAMENTO'];
			NuParcelas = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['NPARCELAS'];
			NuAutorizadora = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['NSUAUTORIZADORA'];
			VrRecebidoParcela = parseFloat(respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['VALORRECEBIDO']);

			if (NuParcelas == null) {
				NuParcelas = 0;
			}

			if (NuAutorizadora == null) {
				NuAutorizadora = 0;
			}

			$('#resultListPagamento').append(
				`<tr>
                            <td><label style="color: blue;">` + TipoPagamento +
				`</label></td>
                            <td><label style="color: blue;">` + NuParcelas +
				`</label></td>
                            <td><label style="color: blue;">` + NuAutorizadora +
				`</label></td>
                            <td><label style="color: blue;">` + mascaraValor(VrRecebidoParcela.toFixed(2)) +
				`</label></td>
                        </tr>`
			);

		}
	}

	$('.textoCabecalhoPagamento').html(
		`<h2>
            <span class="fw-300">Lista de Recebimentos da Venda Nº </span>&nbsp${IDVendaPagamento}&nbsp;
        </h2>`
	);
} 

function modal_Detalhe_Recebimento(id) {

	$.get('action_detvendarecebimentomodal.html', function(res) {

		$('#resulmodaldetvendarecebimento').html(res);
		$("#detVendaRecebimento").modal('show');
		$('#detVendaRecebimento').on('shown.bs.modal', function() {});

		return ajaxGet('api/dashboard/venda/recebimento.xsjs?id=' + id)
			.then(retornoListaPagamentoVenda)
			.catch(funcErrorDetVenda);
	})

}

function imprimir_dados(){
    let janelaImpressao = window.open('', '', '');
  
    janelaImpressao.document.open();
    janelaImpressao.document.write(`<html><head><title>Impressão</title></head><body>`);
    janelaImpressao.document.write(document.querySelector(".modal.show .modal-body").innerHTML);
    janelaImpressao.document.write('</body></html>');
    janelaImpressao.document.close();
    janelaImpressao.print();
    janelaImpressao.close(); 
}

//////////////////Adiantamento Salario////////////////////////////

function ListaAdiantamentoLoja() {

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
    
    	xmlhttp.onreadystatechange = function() {
    		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
    			document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
    			newDataTable('adiantamentoloja');
    
    		    $('.DescTituloAdiantamento').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Adiantamento de Salário da Loja - <span class='fw-300'>` + NOEmpresaLogin + `</span>`);
                
                $('#DTInicioAdintamento').val(dataAtualCampo);
                $('#DTFimAdiantamento').val(dataAtualCampo);
    		   
    		}
    	};
    	
    	xmlhttp.open("GET", "action_listadiantamentosalarioloja.html", true);
    	xmlhttp.send();
    //}
}

function pesq_list_adiantamentoSalario(){
    var datapesqinicio = $("#DTInicioAdintamento").val();
    var datapesqfim = $("#DTFimAdiantamento").val();
    
    return	ajaxGet('api/dashboard/adiantamento-salarial/funcionarios.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInicio=' + datapesqinicio+ '&dataPesquisaFim=' + datapesqfim)
				.then(retornoTableListAdiantamentoLoja)
				.catch(funcErrorListAdiantamentoLoja);
	
}

function retornoTableListAdiantamentoLoja(adiantamentoLoja) {

	var VrTotalAdiantamentoLoja = 0;
	var contadorAdiantamento = 0;
		var tableAdiantamentoSal = $('#dt-buttons-adiantamentoloja').DataTable();
    tableAdiantamentoSal.clear().draw();
	for (var i = 0; i < adiantamentoLoja.data.length; i++) {

		contadorAdiantamento = contadorAdiantamento + 1;

		IDMovAdiantamento = adiantamentoLoja.data[i]['IDADIANTAMENTOSALARIO'];
		DTMovAdiantamento = adiantamentoLoja.data[i]['DTLANCAMENTO'];
		NomeFuncAdiantamento = adiantamentoLoja.data[i]['NOFUNCIONARIO'];
		VrAdiantamento = parseFloat(adiantamentoLoja.data[i]['VRVALORDESCONTO']);
		STAdiantamento = adiantamentoLoja.data[i]['STATIVO'];
        
        if(STAdiantamento=='True'){
            VrTotalAdiantamentoLoja = VrTotalAdiantamentoLoja + VrAdiantamento;
        }
		
		
	    if(STAdiantamento=='True'){
            tagAdiantAtivo='<label style="color: blue;">Ativo</label>';
            //tagAdiantAtivoBotao='<div class="btn-group btn-group-xs"> <button type="button" class="btn btn-danger btn-xs" title="Cancelar Adiantamento" id="'+IDMovAdiantamento+'" onclick="status_Adiantamento_salario(this.id,\'False\')" >Cancelar</button>'+
            //'<button type="button" class="btn btn-success btn-xs" title="Imprimir Comprovante de Adiantamento" id="'+IDMovAdiantamento+'" onclick="modal_Imprimir_Adiantamento(this.id)" >Imprimir</button></div>';
           tagAdiantAtivoBotao='<div class="btn-group btn-group-xs"> '+
            '<button type="button" class="btn btn-success btn-xs" title="Imprimir Comprovante de Adiantamento" id="'+IDMovAdiantamento+'" onclick="modal_Imprimir_Adiantamento(this.id)" >Imprimir</button></div>';
        }else{
            tagAdiantAtivo='<label style="color: red;">Cancelado</label>';
            //tagAdiantAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-info btn-xs" title="Ativar Adiantamento" id="'+IDMovAdiantamento+'" onclick="status_Adiantamento_salario(this.id,\'True\')" >Ativar</button></div>';
            tagAdiantAtivoBotao='<div class="btn-group btn-group-xs"></div>';
        }

		tableAdiantamentoSal.row.add([
            `<label style="color: blue;">` + contadorAdiantamento + `</label>`,
            `<label style="color: blue;">` + DTMovAdiantamento + `</label>`,
            `<label style="color: blue;">` + NomeFuncAdiantamento + `</label>`,
            `<label style="color: blue;">` + mascaraValor(VrAdiantamento.toFixed(2)) + `</label>`,
            tagAdiantAtivo,
            tagAdiantAtivoBotao,
        ]).draw(false);

	}

	$('.totalAdiantamento').html(
		`<tr>
            <th colspan="3" style="text-align: center;">Total Lançamentos</th>
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

function funcErrorFuncionario(data) {
    	Swal.fire({
    		type: "error",
    		title: 'Erro ao Carregar os Dados do retornoListaFuncionario',
    		showConfirmButton: false,
    		timer: 15000
    	});
}

function funcErrorFuncionarioModal(data) {
    	Swal.fire({
    		type: "error",
    		title: 'Erro ao Carregar os Dados do retornoListaFuncionarioModal',
    		showConfirmButton: false,
    		timer: 15000
    	});
}

function retornoListaFuncionario(respostaListaFuncionario) {

	for (var i = 0; i < respostaListaFuncionario.data.length; i++) {

		IDFuncionario = respostaListaFuncionario.data[i]['IDFUNCIONARIO'];
		NomeFuncionario = respostaListaFuncionario.data[i]['NOFUNCIONARIO'];
		NuLogin = respostaListaFuncionario.data[i]['NOLOGIN'];
		
		$('#IDFuncionario').append(
			`<option value="` + IDFuncionario + `"> ` + NuLogin + ` - ` + NomeFuncionario + `</option>`
		);
	}
}

function retornoListaFuncionarioModal(respostaListaFuncionario) {

	for (var i = 0; i < respostaListaFuncionario.data.length; i++) {

		IDFuncionario = respostaListaFuncionario.data[i]['IDFUNCIONARIO'];
		NomeFuncionario = respostaListaFuncionario.data[i]['NOFUNCIONARIO'];
		NuLogin = respostaListaFuncionario.data[i]['NOLOGIN'];
		
		$('#IDFuncionarioQuebra').append(
			`<option value="` + IDFuncionario + `"> ` + NuLogin + ` - ` + NomeFuncionario + `</option>`
		);
	}
}

function modal_Imprimir_Adiantamento(id) {
    $.get('action_imprimirmodal.html', function(res) {

		$('#resulmodalimprimir').html(res);
		$("#imprimiDados").modal('show');
		$('#imprimiDados').on('shown.bs.modal', function() {});
		
		 return	ajaxGet('api/adiantamento-salarial.xsjs?id=' + id)
			.then(retornoTableImprimeAdiantamentoSalarial)
			.catch(funcErrorImprimeValeLoja);
	})

}

function retornoTableImprimeAdiantamentoSalarial(imprimeAdiantamentoSalarial) {
        
        	IDDespValeTranspLoja = imprimeAdiantamentoSalarial.data[0]['IDADIANTAMENTOSALARIO'];
			IDEmpresaValeTranspLoja = imprimeAdiantamentoSalarial.data[0]['IDEMPRESA'];
			IDFuncionarioValeTranspLoja = imprimeAdiantamentoSalarial.data[0]['IDFUNCIONARIO'];
			DTMovValeTranspLoja = imprimeAdiantamentoSalarial.data[0]['DTLANCAMENTO'];
			VrValeTranspLoja = parseFloat(imprimeAdiantamentoSalarial.data[0]['VRVALORDESCONTO']);
			TxtHistValeTranspLoja = imprimeAdiantamentoSalarial.data[0]['TXTMOTIVO'];
		    RazaoEmpresa = imprimeAdiantamentoSalarial.data[0]['NORAZAOSOCIAL'];
			NoFantasiaEmpresa = imprimeAdiantamentoSalarial.data[0]['NOFANTASIA'];
			CNPJEmpresa = imprimeAdiantamentoSalarial.data[0]['NUCNPJ'];
			NoFuncionario = imprimeAdiantamentoSalarial.data[0]['NOFUNCIONARIO'];
			CPFFuncionario = imprimeAdiantamentoSalarial.data[0]['NUCPF'];
			
			NoGerente = imprimeAdiantamentoSalarial.data[0]['NOMEGERENTE'];
			
        	$('.TituloModalImprimir').html(
        		`Impressão de Recibos <small class="m-0 text-muted">Imprimir Adiantamento Salárial</small>`
        	);

        	$('.TituloRecibo').html(
        		`<h3 style="text-align: center;">ADIANTAMENTO SALARIAL</h3>`
        	);

        	$('.CorpoRecibo1').html(
        		`<div class="col-sm-12" style="text-align: justify;">O(a) ` + NoFuncionario + `, CPF: ` + CPFFuncionario + `. Declara a empresa ` + RazaoEmpresa + `, CNPJ: ` + CNPJEmpresa + `
        		- ( ` + NoFantasiaEmpresa + `) - ter recebido a importância de R$ ` + mascaraValor(VrValeTranspLoja.toFixed(2)) + `(), referente ao ADIANTAMENTO SALARIAL, pago(s) em espécie.</div>
                `
        	);
        	
        	$('.CorpoRecibo2').html(
        		`<div class="col-sm-12" style="text-align: justify;">Histórico: ` + TxtHistValeTranspLoja + ` </div>`
        	);
        	
        	$('.CorpoRecibo3').html(
        		`<div class="col-sm-12" style="text-align: justify;">Conforme Código Civil Lei nº 10.406, Art. 219, o recebimento dos créditos confirmam-se verdadeiras em relação ao Signatário.</div>`
        	);
        	
        	$('.CorpoRecibo4').html(
        		`<div class="col-sm-12">Brasília, ` + dataAtual + `.</div>`
        	);
        	
        	$('.CorpoRecibo5').html(
        		`<div class="col-sm-12" style="text-align: center;">--------------------------------------------------------------------------------------------------------------------</div>
    			    <div class="col-sm-12" style="text-align: center;">` + NoFuncionario + ` - CPF: ` + CPFFuncionario + `</div>`
        	);
        	
        	$('.CorpoRecibo6').html(
        		`<div class="col-sm-12" style="text-align: center;">--------------------------------------------------------------------------------------------------------------------</div>
    			    <div class="col-sm-12" style="text-align: center;">` + NoFantasiaEmpresa + ` - ` + NoGerente + `</div>`
        	);
 	
}

function modal_Cad_Adiantamento_Salario() {

	$.get('action_cadadiantamentosalariomodal.html', function(res) {

		$('#resulmodaladiantamentosalario').html(res);
		$("#CadadiantamentoSalario").modal('show');
		$('#CadadiantamentoSalario').on('shown.bs.modal', function() {});

		$('#IDEmpresaAdiantamento').val(IDEmpresaLogin);
		$('#nomeempAdiantamento').val(NOEmpresaLogin);
		$('#DTLancamento').val(dataAtualCampo);
		$("#IDFuncionario").select2({
			dropdownParent: $("#CadadiantamentoSalario")
		});

		return ajaxGet('api/funcionario/todos.xsjs?empresa=' + IDEmpresaLogin)
			.then(retornoListaFuncionario)
			.catch(funcErrorFuncionario);

	})

}

function cadastrar_adiantamento() {

	var adi_idempresa = $("#IDEmpresaAdiantamento").val();
	var adi_idfunc = $("#IDFuncionario").val();
	var adi_dtlanc = $("#DTLancamento").val();
	var adi_motivo = $("#TXTMotivo").val();
	var adi_vrdesconto = $("#VrValorDesconto").val().replace(".", "").replace(",", ".");
	var adi_stativo = $("#STAtivoAdiantamento").val();

	if ($("#IDFuncionario").val() == 0) {

		$("#resultadoadiantamentosalario").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Funcionário.</div>"
		);
		$("#IDFuncionario").focus();
		return false;
	}

	if ($("#TXTMotivo").val() === '') {

		$("#resultadoadiantamentosalario").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Motivo do Lançamento.</div>"
		);
		$("#TXTMotivo").focus();
		return false;
	}

	if ($("#VrValorDesconto").val() === '') {

		$("#resultadoadiantamentosalario").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Valor do Lançamento.</div>"
		);
		$("#VrValorDesconto").focus();
		return false;
	}

	var dados = [{
		"IDEMPRESA": parseInt(adi_idempresa),
		"IDFUNCIONARIO": parseInt(adi_idfunc),
		"DTLANCAMENTO": adi_dtlanc,
		"TXTMOTIVO": adi_motivo,
		"VRVALORDESCONTO": parseFloat(adi_vrdesconto),
		"STATIVO": adi_stativo,
		"IDUSR": parseInt(IDFuncionarioLogin)
	}];

	console.table(dados);

	ajaxPost("api/adiantamento-salarial.xsjs", dados)
		.then(funcSucessAdiantamento)
		.catch(funcErrorAdiantamento);
}

function funcSucessAdiantamento(resposta) {

	$("#buttonadiantamentosal").attr("disabled", true);
	alerta_cadastrado_sucesso();
	$("#CadadiantamentoSalario").modal('hide');
	ListaAdiantamentoLoja();

}

function funcErrorAdiantamento(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessAdiantamento',
		showConfirmButton: false,
		timer: 15000
	});
}

function status_Adiantamento_salario(id,status) {

    var dados = {
      "IDADIANTAMENTOSALARIO": parseInt(id),
      "STATIVO":status
    };

  	ajaxPut("api/dashboard/adiantamento-salarial/atualizacao-status.xsjs", dados)
		.then(funcSucessUpdateAdiantamento)
		.catch(funcErrorUpdateAdiantamento);

}

function funcSucessUpdateAdiantamento(resposta) {

	alerta_cancel_ativa_adiantamento();
	ListaAdiantamentoLoja();

}

function funcErrorUpdateAdiantamento(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateAdiantamento',
		showConfirmButton: false,
		timer: 15000
	});
}

//////////////////Depósito Loja////////////////////////////

function ListaDepositoLoja() {
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
    
    	xmlhttp.onreadystatechange = function() {
    		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
    			document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
            
                $('.dataAtual').text(dataAtual);
                $('#DTInicioFat').val(dataAtualCampo);
                $('#DTFimFat').val(dataAtualCampo);
            
                $('.DescTituloDepostio').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Lista de Depósitos da Loja - <span class='fw-300'>` + NOEmpresaLogin + `</span>`);
    
    		}
    	};
    	xmlhttp.open("GET", "action_listdepositoloja.html", true);
    	xmlhttp.send();
    //}
}

function pesq_list_deposito() {

    var datapesqinicio = $("#DTInicioFat").val();
    var datapesqfim = $("#DTFimFat").val();
  
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
        newDataTable('depositoloja');
        
            $('.dataAtual').text(dataAtual);

		    $('.DescTituloDepostio').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Depósitos - <span class='fw-300'>` + NOEmpresaLogin + `</span>`);
			
		    return	ajaxGet('api/deposito-loja/empresa.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
				.then(retornoTableListDepositoLoja)
				.catch(funcErrorDepositoLoja);
				
      }
    };
    xmlhttp.open("GET", "action_pesqdepositosloja.html", true);
    xmlhttp.send();
}

function retornoTableListDepositoLoja(depositoLoja) {

	var contadorDepositoLoja = 0;
	var TotalDeposito = 0;

    $('#resultadoListDeposito').html('');
    
    $('#dt-basic-depositoloja').DataTable().destroy();
    
	for (var i = 0; i < depositoLoja.data.length; i++) {

		contadorDepositoLoja = contadorDepositoLoja + 1;

		IDMovDepositoLoja = depositoLoja.data[i]['IDDEPOSITOLOJA'];
		DTMovDepositoLoja = depositoLoja.data[i]['DTMOVIMENTOCAIXA'];
		DTDepositoLoja = depositoLoja.data[i]['DTDEPOSITO'];
		NuConta = depositoLoja.data[i]['DSCONTABANCO'];
		VrDepositoLoja = parseFloat(depositoLoja.data[i]['VRDEPOSITO']);
		TxtHistoricoLoja = depositoLoja.data[i]['DSHISTORIO'];
		DocDepositoLoja = depositoLoja.data[i]['NUDOCDEPOSITO'];
		SituacaoDepositoAtivoLoja = depositoLoja.data[i]['STATIVO'];
		SituacaoDepositoLoja = depositoLoja.data[i]['STCANCELADO'];

	    if(SituacaoDepositoLoja=='False'){
            tagDepositoAtivo='<label style="color: blue;">Ativo</label>';
            TotalDeposito = TotalDeposito + VrDepositoLoja;
            //tagDepositoAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-danger btn-xs" title="Cancelar Depósito" id="'+IDMovDepositoLoja+'" onclick="status_Deposito_Loja(this.id,\'True\')" >Cancelar</button></div>';
        }else{
            tagDepositoAtivo='<label style="color: red;">Cancelado</label>';
            //tagDepositoAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-info btn-xs" title="Ativar Depósito" id="'+IDMovDepositoLoja+'" onclick="status_Deposito_Loja(this.id,\'False\')" >Ativar</button></div>';
        }

		$('#dt-basic-depositoloja').find('tbody').append(`<tr>
                <td><label style="color: blue; font-size: 11px;">` + contadorDepositoLoja +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + DTMovDepositoLoja +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + DTDepositoLoja +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NuConta +	`</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrDepositoLoja.toFixed(2)) +`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + TxtHistoricoLoja +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + DocDepositoLoja +	`</label></td>
                <td>` + tagDepositoAtivo +	`</td>
            </tr>`);
	}
	
	$('#dt-basic-depositoloja').DataTable({
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
                className: 'btn-outline-success btn-sm mr-1'
            },
            {
                extend: 'print',
                text: 'Imprimir',
                titleAttr: 'Imprimir Tabela',
                className: 'btn-outline-primary btn-sm'
            }
        ]}).draw();
		
		$('.totalDeposito').html(
			`<tr>
                <th colspan="4" style="text-align: center;">Total Depósitos Ativos</th>
                <th style="text-align: right;">${mascaraValor(TotalDeposito.toFixed(2))}</th>
                <th colspan="3" style="text-align: center;"></th>
            </tr>`
		);

}

function funcErrorDepositoLoja(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoTableListDepositoLoja',
		showConfirmButton: false,
		timer: 15000
	});
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

	$('#DTDeposito').val(dataAtualCampo);
	$('#HRDeposito').val(horaAtual);
    		
	for (var i = 0; i < respostaListaContaBanco.data.length; i++) {

		IDContaBanco = respostaListaContaBanco.data[i]['IDCONTABANCO'];
		DSContaBanco = respostaListaContaBanco.data[i]['DSCONTABANCO'];

		$('#IDContaBanco').append(
			`<option value="` + IDContaBanco + `"> ` + DSContaBanco + `</option>`
		);
	}
}

function modal_Cad_Deposito() {

	$.get('action_caddepositomodal.html', function(res) {

		$('#resulmodaldeposito').html(res);
		$("#cadDeposito").modal('show');
		$('#cadDeposito').on('shown.bs.modal', function() {


		});

		$('#IDEmpresaDeposito').val(IDEmpresaLogin);
		$('#nomeempDeposito').val(NOEmpresaLogin);
		$('#IDFuncDeposito').val(IDFuncionarioLogin);
	    $('#DTDeposito').val('');
		$('#HRDeposito').val('');

		$("#IDContaBanco").focus();
		$("#IDContaBanco").select2({
			dropdownParent: $("#cadDeposito")
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
    
    
	if ($("#depo_ndocdep").val() === '') {

		$("#resultadodeposito").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Nº Doc do Depósito.</div>"
		);
		$("#NuDocDeposito").focus();
		return false;
	}

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

	console.table(dados);

	function funcSucessDeposito(resposta) {

		alerta_cadastrado_sucesso();
		$("#cadDeposito").modal('hide');
		ListaDepositoLoja();

	}

	function funcErrorDeposito(data) {
		Swal.fire({
			type: "error",
			title: data.msg,
			showConfirmButton: false,
			timer: 15000
		});
	}

	ajaxPost("api/deposito-loja/todos.xsjs", dados)
		.then(funcSucessDeposito)
		.catch(funcErrorDeposito);

}

function status_Deposito_Loja(id,status) {

    var dados = {
      "IDDEPOSITOLOJA": parseInt(id),
      "STCANCELADO":status
    };
    
  	ajaxPut("api/deposito-loja/atualizacao-status.xsjs", dados)
		.then(funcSucessUpdateDeposito)
		.catch(funcErrorUpdateDeposito);

}

function funcSucessUpdateDeposito(resposta) {

	alerta_cancel_ativa_deposito();
	ListaDepositoLoja();

}

function funcErrorUpdateDeposito(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateDeposito',
		showConfirmButton: false,
		timer: 15000
	});
}

//////////////////Despesa Loja////////////////////////////

function ListaDespesaLoja() {

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
    
    	xmlhttp.onreadystatechange = function() {
    		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
    			document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
    			newDataTable('despesaloja');
    
                $('.dataAtual').text(dataAtual);
    
    		    $('.DescTituloDespesa').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Despesas - <span class='fw-300'>` + NOEmpresaLogin + `</span>`);
    			$('#DTInicioDespesa').val(dataAtualCampo);
                $('#DTFimDespesa').val(dataAtualCampo);
    		   
    
    		}
    	};
    	xmlhttp.open("GET", "action_listdespesaloja.html", true);
    	xmlhttp.send();
    //}
}

function pesq_list_Despesas(){
    var datapesqinicio = $("#DTInicioDespesa").val();
    var datapesqfim = $("#DTFimDespesa").val();
    
     return	ajaxGet('api/despesa-loja/empresa.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInic=' + datapesqinicio+ '&dataPesquisaFim=' + datapesqfim)
				.then(retornoTableListDespesaLoja)
				.catch(funcErrorDespesaLoja);
	
}

function retornoTableListDespesaLoja(despesaLoja) {

	var contadorDespesaLoja = 0;
	var TotalDespesaLoja = 0;
    var tableDespesaLoja = $('#dt-basic-despesaloja').DataTable();
    tableDespesaLoja.clear().draw();
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

        if(SituacaoDespesaLoja=='False' && IDCategDespesaLoja != '248' && IDCategDespesaLoja != '259'){
            TotalDespesaLoja = TotalDespesaLoja + VrDespesaLoja;
        }
		
	    if(SituacaoDespesaLoja=='False'){
            tagDespesaAtivo='<label style="color: blue;">Ativo</label>';
            //tagDespesaAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-danger btn-xs" title="Cancelar Despesa" id="'+IDDespesaLoja+'" onclick="status_Despesa_Loja(this.id,\'True\')" >Cancelar</button><button type="button" class="btn btn-warning btn-xs" title="Editar Despesa" id="'+IDDespesaLoja+'" onclick="modal_ajustar_despesa(this.id)" >Editar</button></div>';
        }else{
            tagDespesaAtivo='<label style="color: red;">Cancelado</label>';
            //tagDespesaAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-info btn-xs" title="Ativar Despesa" id="'+IDDespesaLoja+'" onclick="status_Despesa_Loja(this.id,\'False\')" >Ativar</button></div>';
        }

		

			tableDespesaLoja.row.add([
                `<label style="color: blue;">` + contadorDespesaLoja + `</label>`,
                `<label style="color: blue;">` + DTMovDespesaLoja + `</label>`,
                `<label style="color: blue;">` + DescDespesaLoja + `</label>`,
                `<label style="color: blue;">` + mascaraValor(VrDespesaLoja.toFixed(2)) + `</label>`,
                `<label style="color: blue;">` + PagoADespesaLoja + `</label>`,
                `<label style="color: blue;">` + TxtHistoricoDespesaLoja + `</label>`,
                `<label style="color: blue;">` + NuNotaDespesaLoja + `</label>`,
                tagDespesaAtivo,
                //tagDespesaAtivoBotao,
            ]).draw(false);
	}

	$('.totalDespesaLoja').html(
		`<tr>
            <th colspan="3" style="text-align: center;">Total Lançamentos</th>
            <th style="text-align: right;">${mascaraValor(TotalDespesaLoja.toFixed(2))}</th>
            <th colspan="5"></th>
        </tr>`
	);

}

function funcErrorDespesaLoja(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoTableListDespesaLoja',
		showConfirmButton: false,
		timer: 15000
	});
}

function funcErrorCategoriaDespesa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoListaCategoriaDespesa', 
		showConfirmButton: false,
		timer: 15000
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

function modal_Cad_Despesa() {

	$.get('action_caddespesamodal.html', function(res) {

		$('#resulmodaldespesa').html(res);
		$("#cadDespesa").modal('show');
		$('#cadDespesa').on('shown.bs.modal', function() {});

		$('#IDEmpresaDespesa').val(IDEmpresaLogin);
		$('#nomeempDespesa').val(NOEmpresaLogin);
		$('#IDFuncDespesa').val(IDFuncionarioLogin);
		$('#DTDespesa').val(dataAtualCampo);
		$('#HRDespesa').val(horaAtual);
        
		$("#IDCategoriaReceitaDespesa").focus();
		$("#IDCategoriaReceitaDespesa").select2({
			dropdownParent: $("#cadDespesa")
		});

		return ajaxGet('api/categoria-receita-despesa.xsjs')
			.then(retornoListaCategoriaDespesa)
			.catch(funcErrorCategoriaDespesa);
	})

}

function carregadivtiponota(el) {

  document.getElementById("1").style.display = 'block';
  $("#NuNotaFiscal").val('');


  switch(el){
    case '1':
        document.getElementById("1").style.display = 'block';
        document.getElementById("NuNotaFiscal").focus();
       break;
    case '2':
        document.getElementById("1").style.display = 'none';
        $("#NuNotaFiscal").val('');
       break;
    default:
    break;   
  }   
}

function cadastrar_despesa() {

	var idempresadesp = $("#IDEmpresaDespesa").val();
	var idfuncdesp = $("#IDFuncDespesa").val();
	var dtlancdesp = $("#DTDespesa").val();
	var hrlancdesp = $("#HRDespesa").val();
	var idcategdesp = $("#IDCategoriaReceitaDespesa").val();
	var historiodesp = $("#DsHistorioDespesa").val();
	var pagoAdesp = $("#DsPagoA").val();
	var tpnotadesp = $("#TPNota").val();
	var nunotadesp = $("#NuNotaFiscal").val();
	var vrdespesa = $("#VrDespesaDespesa").val().replace(".", "").replace(",", ".");
	var stativodesp = $("#STAtivoDespesa").val();
	var stcanceladesp = $("#STCancelaDespesa").val();

	var DTDespesaLoja = dtlancdesp+' '+hrlancdesp;
    
    if(dtlancdesp==''){
    	$("#resultadodespesa").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Data da Despesa.</div>"
		);
		$("#DTDespesa").focus();
		return false;
    }

    if(hrlancdesp==''){
    	$("#resultadodespesa").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Hora da Despesa.</div>"
		);
		$("#HRDespesa").focus();
		return false;
    }
    
	if ($("#DsHistorio").val() === '') { 

		$("#resultadodespesa").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Histórico da Despesa.</div>"
		);
		$("#DsHistorio").focus();
		return false;
	}

	if ($("#DsPagoA").val() == "") {

		$("#resultadodespesa").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a quem foi Pago a Despesa</div>"
		);

		$("#DsPagoA").focus();
		return false;
	}

	if ($("#TPNota").val() == "1" && $("#NuNotaFiscal").val() == "") {

		$("#resultadodespesa").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Chave da Nota</div>"
		);

		$("#NuNotaFiscal").focus();
		return false;
	}

	if ($("#VrDespesa").val() == 0 || $("#VrDespesa").val() == "") {

		$("#resultadodespesa").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Valor da Despesa</div>"
		);

		$("#VrDespesa").focus();
		return false;
	}

	var dados = [{
		"IDEMPRESA": parseInt(idempresadesp),
		"IDUSR": parseInt(idfuncdesp),
		"DTDESPESA": DTDespesaLoja,
		"IDCATEGORIARECEITADESPESA": parseInt(idcategdesp),
		"DSHISTORIO": historiodesp,
		"DSPAGOA": pagoAdesp,
		"TPNOTA": tpnotadesp,
		"NUNOTAFISCAL": nunotadesp,
		"VRDESPESA": parseFloat(vrdespesa),
		"STATIVO": stativodesp,
		"STCANCELADO": stcanceladesp

	}];

	console.table(dados);

	ajaxPost("api/despesa-loja/todos.xsjs", dados)
		.then(funcSucessDespesa)
		.catch(funcErrorDespesa);

}

function funcSucessDespesa(resposta) {
	
	alerta_cadastrado_sucesso();
	$("#cadDespesa").modal('hide');
	ListaDespesaLoja();
}

function funcErrorDespesa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessDespesa',
		showConfirmButton: false,
		timer: 15000
	});
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
	ListaDespesaLoja();

}

function funcErrorUpdateDespesa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateDespesa',
		showConfirmButton: false,
		timer: 15000
	});
}

function retornoTableModalDespesaLoja(modalDespesaLoja) {

		IDDespesaLoja = modalDespesaLoja.data['IDDESPESASLOJA'];
		IDCategDespesaLoja = modalDespesaLoja.data['IDCATEGORIARECDESP'];
		DTMovDespesaLoja = modalDespesaLoja.data['DTDESPESA'];
		DescDespesaLoja = modalDespesaLoja.data['DSCATEGORIA'];
		VrDespesaLoja = parseFloat(modalDespesaLoja.data['VRDESPESA']);
		PagoADespesaLoja = modalDespesaLoja.data['DSPAGOA'];
		TxtHistoricoDespesaLoja = modalDespesaLoja.data['DSHISTORIO'];
		NuNotaDespesaLoja = modalDespesaLoja.data['NUNOTAFISCAL'];
		SituacaoDespesaAtivoLoja = modalDespesaLoja.data['STATIVO'];
		SituacaoDespesaLoja = modalDespesaLoja.data['STCANCELADO'];

}

function funcErrorModalDespesaLoja(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoTableModalDespesaLoja',
		showConfirmButton: false,
		timer: 15000
	});
}

//////////EM CONSTRUÇÃO RODRIGO///////////////////////

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
			.catch(funcErrorCategoriaDespesa);
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

	console.table(dados);

	ajaxPut("api/despesa-loja/editar-despesa.xsjs", dados)
		.then(funcSucessUpdateDespesa)
		.catch(funcErrorUpdateDespesa);

}

function funcSucessUpdateDespesa(resposta) {

	//$("#buttoneditdespesa").attr("disabled", true);
	alerta_atualizado_sucesso();
	$("#editDespesa").modal('hide');
	pesq_list_Despesas();
}

//////////////////Vale Transporte Loja////////////////////////////
// Refatoração - Gabriel Figueredo - 01/04/2026

async function listarValeTransporteLoja() {
    try{
      const respHtml = await $.get("action_listvaletransploja.html"); 
      $("#js-page-content").html(respHtml);

      $('.dataAtual').text(dataAtual);
      $('.DescTituloValeTransp').html(`<i class='subheader-icon fal fa-chart-area'></i> Vale Transporte - <span class='fw-300'> ${NOEmpresaLogin}</span>`);
    } catch(error) {
      funcError(error);
    };
 
    try {
      const respDespesas = await ajaxGet(`api/despesa-loja/empresa.xsjs?idEmpresa=${IDEmpresaLogin}&dataPesquisaInic=${dataAtualCampo}&dataPesquisaFim=${dataAtualCampo}`)
      retornoTableListValeTranspLoja(respDespesas)
    } catch(error) {
      console.log(error)
      funcError('Erro ao Carregar os Dados da tabela');
    };
}

async function pesquisarValeTransporteLoja (){
  let dataInicio = $('#dtInicioValeTransporte').val();
  let dataFim = $('#dtFimValeTransporte').val();

  if(!dataInicio || !dataFim){
    alerta_dados_pesquisa('Filtros não preenchidos, portanto será utilizada a data atual!'); 
    dataInicio = dataAtualCampo;
    dataFim = dataAtualCampo;
  }

  try {
    const respDespesas = await ajaxGet(`api/despesa-loja/empresa.xsjs?idEmpresa=${IDEmpresaLogin}&dataPesquisaInic=${dataInicio}&dataPesquisaFim=${dataFim}`);
    retornoTableListValeTranspLoja(respDespesas);
  } catch (error) {
    funcError(error);
  };
}

function retornoTableListValeTranspLoja(valeTranspLoja) {
	let contadorValeTranspLoja = 0;
	let TotalValeTranspLoja = 0;
  let dados = [];

	for (let registro of valeTranspLoja.data) {
		contadorValeTranspLoja += 1;
		let IDCategValeTranspLoja = registro.IDCATEGORIARECDESP;

		if (IDCategValeTranspLoja == '248') {
        let IDDespValeTranspLoja = registro.IDDESPESASLOJA;
        let DTMovValeTranspLoja = registro.DTDESPESA;
        let DescValeTranspLoja = registro.DSCATEGORIA;
        let VrValeTranspLoja = parseFloat(registro.VRDESPESA);
        let PagoAValeTranspLoja = registro.NOFUNCVALE
        let TxtHistoricoValeTranspLoja = registro.DSHISTORIO;
        let SituacaoValeTranspAtivoLoja = registro.STATIVO;
        let SituacaoValeTranspLoja = registro.STCANCELADO;
        let tagValeTranspAtivo;
        let tagValeTranspAtivoBotao;
          
        if(SituacaoValeTranspLoja == 'False') TotalValeTranspLoja += VrValeTranspLoja;
        
        if(DTMovValeTranspLoja === dataHojeCampo){
          if(SituacaoValeTranspLoja=='False'){
                tagValeTranspAtivo='<label style="color: blue;">Ativo</label>';
                tagValeTranspAtivoBotao = `<div class="btn-group btn-group-xs"><button type="button" class="btn btn-danger btn-xs" title="Cancelar Vale Transporte" 
                id="${IDDespValeTranspLoja}" onclick="status_ValeTransp_Loja(this.id,'True')">Cancelar</button>
                <button type="button" class="btn btn-success btn-xs" title="Imprimir Vale Transporte" id="${IDDespValeTranspLoja}" 
                onclick="modal_Imprimir_Vale_Transporte(this.id)">Imprimir</button></div>`;
          } else{
              tagValeTranspAtivo='<label style="color: red;">Cancelado</label>';
              tagValeTranspAtivoBotao=`<div class="btn-group btn-group-xs"><button type="button" class="btn btn-info btn-xs" title="Ativar Vale Transporte" 
              id="${IDDespValeTranspLoja}" onclick="status_ValeTransp_Loja(this.id,'False')">Ativar</button></div>`;
          }
        }else{
          if(SituacaoValeTranspLoja=='False'){
            tagValeTranspAtivo='<label style="color: blue;">Ativo</label>';
            tagValeTranspAtivoBotao=`<div class="btn-group btn-group-xs"><button type="button" class="btn btn-success btn-xs" title="Imprimir Vale Transporte" 
            id="${IDDespValeTranspLoja}" onclick="modal_Imprimir_Vale_Transporte(this.id)" >Imprimir</button></div>`;
          }else{
            tagValeTranspAtivo='<label style="color: red;">Cancelado</label>';
            tagValeTranspAtivoBotao='<div class="btn-group btn-group-xs"></div>';
          }
      }

      dados.push([
        contadorValeTranspLoja,
        DTMovValeTranspLoja,
        DescValeTranspLoja,
        VrValeTranspLoja,
        PagoAValeTranspLoja,
        TxtHistoricoValeTranspLoja,
        tagValeTranspAtivo,
        tagValeTranspAtivoBotao
      ]);
    }
  } 
  
  montarDataTableListaTransp(dados, TotalValeTranspLoja);
}

function montarDataTableListaTransp(data, TotalValeTranspLoja) {
  if ($.fn.DataTable.isDataTable('#dt-basic-valetransporte')) $('#dt-basic-valetransporte').DataTable().destroy();

  $('#dt-basic-valetransporte').DataTable({
    data: data,
    deferRender: true,
    columnDefs: [
        { width: 25, targets: 0 },
        { width: 200, targets: 1 },
        { width: 200, targets: 2 },
        { width: 200, targets: 3 },
        { width: 100, targets: 4 }
    ],
    responsive: true,
    language: {
      emptyTable: "Nenhum registro encontrado",
      zeroRecords: "Nenhum resultado para a pesquisa"
    },
    dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    buttons: [
      {
        extend: 'pdfHtml5',
        text: 'PDF',
        titleAttr: 'Generate PDF',
        className: 'btn-outline-danger btn-sm mr-1',
        exportOptions: {
          columns: ':visible:not(.no-export)'
        }
      },
      {
        extend: 'excelHtml5',
        text: 'Excel',
        titleAttr: 'Generate Excel',
        className: 'btn-outline-success btn-sm mr-1',
        exportOptions: {
          columns: ':visible:not(.no-export)'
        }
      },
      {
        extend: 'print',
        text: 'Print',
        titleAttr: 'Print Table',
        className: 'btn-outline-primary btn-sm',
        exportOptions: {
          columns: ':visible:not(.no-export)'
        }
      }
    ]
  });

  if(data) {
    $('#totalValeTranspLoja').html(mascaraValor(TotalValeTranspLoja.toFixed(2)));
  }
};

async function modal_Cad_Vale_Transporte() {

  try {
    const respHtml = await $.get('action_cadvaletranspmodal.html');

    $('#resulmodalvaletransp').html(respHtml);
		$("#cadValeTransp").modal('show');
		$('#cadValeTransp').on('shown.bs.modal', function() {});
    $('#IDEmpresaDespesaValeTransp').val(IDEmpresaLogin);
		$('#nomeempValeTransp').val(NOEmpresaLogin);
		$('#IDFuncDespesaValeTransp').val(IDFuncionarioLogin);
	  $('#DTDespesaValeTransp').val(dataAtualCampo);
		$('#HRDespesaValeTransp').val(horaAtual);
    $("#IDFuncionario").select2({
			dropdownParent: $("#cadValeTransp")
		});
  } catch (error) {
    funcError(error);
  }

  try {
    const resp = await ajaxGet(`api/funcionario/todos.xsjs?empresa=${IDEmpresaLogin}`)
    retornoListaFuncionario(resp)
  } catch (error) {
    funcError('Erro ao Carregar os Dados do retornoListaFuncionario')
  };
}

async function cadastrar_vale_transporte() {
  let idempresadespvaletransp = $("#IDEmpresaDespesaValeTransp").val();
  let idfuncdespvaletransp = $("#IDFuncDespesaValeTransp").val();
  let dtlancdespvaletransp = $("#DTDespesaValeTransp").val();
  let hrlancdespvaletransp = $("#HRDespesaValeTransp").val();
  let idcategdespvaletransp = $("#IDCategoriaReceitaDespesaValeTransp").val();
  let historiodespvaletransp = $("#DsHistorioValeTransp").val();
  let idfuncionariovaletransp = $("#IDFuncionario").val();
  let pagoAdespvaletransp = '';
  let tpnotadespvaletransp = '';
  let nunotadespvaletransp = '';
  let vrdespesavaletransp = $("#VrDespesaValeTransp").val().replace(".", "").replace(",", ".");
  let stativodespvaletransp = $("#STAtivoDespesaValeTransp").val();
  let stcanceladespvaletransp = $("#STCancelaDespesaValeTransp").val();
  let DTValeTransLoja = `${dtlancdespvaletransp} ${hrlancdespvaletransp}`;
    
  if(!dtlancdespvaletransp || !hrlancdespvaletransp){ 
    alerta_dados_pesquisa('Data ou hora inválida.');
    return false;
  }
  
  if (!vrdespesavaletransp || vrdespesavaletransp == 0) {
    alerta_dados_pesquisa('Informe o Valor do Vale Transporte');
    $("#VrDespesaValeTransp").focus();
    return false;
  }

  let dados = [{
    "IDEMPRESA": parseInt(idempresadespvaletransp),
    "IDUSR": parseInt(idfuncdespvaletransp),
    "DTDESPESA": DTValeTransLoja,
    "IDCATEGORIARECEITADESPESA": parseInt(idcategdespvaletransp),
    "DSHISTORIO": historiodespvaletransp,
    "DSPAGOA": pagoAdespvaletransp,
    "IDFUNCIONARIO": parseInt(idfuncionariovaletransp),
    "TPNOTA": tpnotadespvaletransp,
    "NUNOTAFISCAL": nunotadespvaletransp,
    "VRDESPESA": parseFloat(vrdespesavaletransp),
    "STATIVO": stativodespvaletransp,
    "STCANCELADO": stcanceladespvaletransp 
  }];

  try {
    await ajaxPost(`api/despesa-loja/todos.xsjs`, dados);

    alerta_cadastrado_sucesso();
    $("#cadValeTransp").modal('hide');
    listarValeTransporteLoja();
  } catch (error) {
    funcError('Erro ao cadastrar o vale transporte!');
  }
}

async function status_ValeTransp_Loja(id,status) {
  let dados = {
    "IDDESPESASLOJA": parseInt(id),
    "STCANCELADO":status
  };

  try {
    await ajaxPut(`api/despesa-loja/atualizacao-status.xsjs`, dados);
    alerta_cancel_ativa_despesa();
    listarValeTransporteLoja();
  } catch (error) {
    funcError ('Erro ao Atualizar o status do vale transporte.');
  }
}

async function modal_Imprimir_Vale_Transporte(id) {

  try {
    const respHtml = await $.get(`action_imprimirmodal.html`);
    $('#resulmodalimprimir').html(respHtml);
		$("#imprimiDados").modal('show');
		$('#imprimiDados').on('shown.bs.modal', function() {});
  } catch (error) {
    funcError(error);
  };

  try {
    const resp = await ajaxGet(`api/despesa-loja/todos.xsjs?id=${id}`);
    retornoTableImprimeValeLoja(resp);
  } catch (error) {
    funcError(error);
  };
}

function retornoTableImprimeValeLoja(imprimeValeTranspLoja) {
  let VrValeTranspLoja = parseFloat(imprimeValeTranspLoja.data[0]['VRDESPESA']);
  let TxtHistValeTranspLoja = imprimeValeTranspLoja.data[0]['DSHISTORICO'];
  let RazaoEmpresa = imprimeValeTranspLoja.data[0]['NORAZAOSOCIAL'];
  let NoFantasiaEmpresa = imprimeValeTranspLoja.data[0]['NOFANTASIA'];
  let CNPJEmpresa = imprimeValeTranspLoja.data[0]['NUCNPJ'];
  let NoFuncionario = imprimeValeTranspLoja.data[0]['NOFUNCIONARIO'];
  let CPFFuncionario = imprimeValeTranspLoja.data[0]['NUCPF'];
  let NoGerente = imprimeValeTranspLoja.data[0]['NOMEGERENTE'];
  
  $('.TituloModalImprimir').html(
    `Impressão de Recibos <small class="m-0 text-muted">Imprimir Vale Transporte</small>`
  );

  $('.TituloRecibo').html(
    `<h3 style="text-align: center;">VALE TRANSPORTE</h3>`
  );

  $('.CorpoRecibo1').html(
    `<div class="col-sm-12" style="text-align: justify;">O(a) ${NoFuncionario}, CPF: ${CPFFuncionario}. 
    Declara a empresa ${RazaoEmpresa}, CNPJ: ${CNPJEmpresa} - (${NoFantasiaEmpresa}) - 
    ter recebido a importância de R$${mascaraValor(VrValeTranspLoja.toFixed(2))}, referente ao VALE TRANSPORTE, pago(s) em espécie.</div>
    `
  );
  
  $('.CorpoRecibo2').html(
    `<div class="col-sm-12" style="text-align: justify;">Histórico: ${TxtHistValeTranspLoja}</div>`
  );
  
  $('.CorpoRecibo3').html(
    `<div class="col-sm-12" style="text-align: justify;">Conforme Código Civil Lei nº 10.406, Art. 219, o recebimento dos créditos confirmam-se verdadeiras em relação ao Signatário.</div>`
  );
  
  $('.CorpoRecibo4').html(
    `<div class="col-sm-12">Brasília, ${dataAtual}.</div>`
  );
  
  $('.CorpoRecibo5').html(
    `<div class="col-sm-12" style="text-align: center;">--------------------------------------------------------------------------------------------------------------------</div>
      <div class="col-sm-12" style="text-align: center;">${NoFuncionario} - CPF: ${CPFFuncionario}</div>`
  );
  
  $('.CorpoRecibo6').html(
    `<div class="col-sm-12" style="text-align: center;">--------------------------------------------------------------------------------------------------------------------</div>
      <div class="col-sm-12" style="text-align: center;"> ${NoFantasiaEmpresa} - ${NoGerente}</div>`
  );	
}

//////////////////Quebra de Caixa da Loja////////////////////////////

function ListaQuebraCaixaLoja(tipo) {

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
            $('#Tipo').val('Gerencia');
        
            $('.DescTituloQuebraCaixa').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Movimento dos Caixas - <span class='fw-300'>` + NOEmpresaLogin + `</span>`);
      }
    };
    xmlhttp.open("GET", "action_listquebracaixaloja.html", true);
    xmlhttp.send();
}

function pesq_quebra_caixa() {

    var datapesqinicio = $("#DTInicio").val();
    var datapesqfim = $("#DTFim").val();
  
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

		    return	ajaxGet('api/movimento-caixa/gerencia.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
				.then(retornoTableMovimentoCaixa)
				.catch(funcErrorMovimentoCaixa);
				
      }
    };
    xmlhttp.open("GET", "action_pesqquebracaixaloja.html", true);
    xmlhttp.send();
}

function retornoTableMovimentoCaixa(movimentoCaixa) {

    $('.DescTituloQuebraCaixa').html(
    `<h2>Fechamento dos Caixas <span class="fw-300"><i>` + NOEmpresaLogin + `</i></span></h2>`);
			
	var contadorMovimentoCaixa = 0;
	var FechamentoDinheiroTotal = 0;
	var FechamentoDinheiroInformadoTotal = 0;
	var FechamentoDinheiroAjustadoTotal = 0;
	var FechamentoQuebraCaixa = 0;
	var FechamentoFaturaTotal = 0;
	var VrFechamentoFatura = 0;
	var FechamentoFaturaAjustadoTotal = 0;
	var FechamentoQuebraEfetivado = 0;

	for (var i = 0; i < movimentoCaixa.data.length; i++) {
		var tagBtnImprimirAjusteFechamentoCaixa = '';

		if(movimentoCaixa.data[i]['TOTALAJUSTEDINHEIRO']>0 || movimentoCaixa.data[i]['TOTALAJUSTEFATURA']>0)
		{
			tagBtnImprimirAjusteFechamentoCaixa='<button type="button" class="btn btn-primary btn-xs" title="Imprimir Ajuste Fechamento Caixa" id="'+movimentoCaixa.data[i]['ID']+'" onclick="modal_Imprimir_Ajuste_Caixa(this.id)" >Imprimir Ajuste Fechamento Caixa</button>';
		}

		    contadorMovimentoCaixa = contadorMovimentoCaixa + 1;

		    IDMovimentoCaixa = movimentoCaixa.data[i]['ID'];

			IDCaixaFechamento = movimentoCaixa.data[i]['IDCAIXAFECHAMENTO'];
			DescCaixaFechamento = movimentoCaixa.data[i]['DSCAIXAFECHAMENTO'];
			DTCaixaFechamento = movimentoCaixa.data[i]['DTABERTURA'];
			
            DTAberturaMovCaixa = movimentoCaixa.data[i]['DTABERTURAMOVCAIXA'];

			IDOperadorCaixaFechamento = movimentoCaixa.data[i]['IDOPERADORFECHAMENTO'];
			NoOperadorCaixaFechamento = movimentoCaixa.data[i]['OPERADORFECHAMENTO'];
			VrTotalFechamentoDinheiroFisico = parseFloat(movimentoCaixa.data[i]['TOTALFECHAMENTODINHEIROFISICO']);
			VrTotalAjusteDinheiro = parseFloat(movimentoCaixa.data[i]['TOTALAJUSTEDINHEIRO']);
			VrTotalAjusteFatura = parseFloat(movimentoCaixa.data[i]['TOTALAJUSTEFATURA']);
			VrTotalFechamentoDinheiro = parseFloat(movimentoCaixa.data[i]['TOTALFECHAMENTODINHEIRO']);
			VrTotalFechamentoFatura = parseFloat(movimentoCaixa.data[i]['TOTALFECHAMENTOFATURA']);
			VrQuebraFechamentoCaixa = parseFloat(movimentoCaixa.data[i]['VRQUEBRAEFETIVADO']);
			
			
			STFechadoMov = movimentoCaixa.data[i]['STFECHADOMOVIMENTO'];
			STConferidoMov = movimentoCaixa.data[i]['STCONFERIDOMOVIMENTO'];

            if(VrTotalAjusteDinheiro>0){
                VrTotalFechamentoDinheiro = VrTotalAjusteDinheiro;
            }else{
                VrTotalFechamentoDinheiro = VrTotalFechamentoDinheiro;
            }
            
            if(VrTotalAjusteFatura>0){
                VrFechamentoFatura = VrTotalAjusteFatura;
            }else{
                VrFechamentoFatura = VrTotalFechamentoFatura;
            }
            
        	VrTotalFechamentoQuebraCaixa = VrTotalFechamentoDinheiro - VrTotalFechamentoDinheiroFisico;
    	
			FechamentoDinheiroInformadoTotal = FechamentoDinheiroInformadoTotal + VrTotalFechamentoDinheiro;
			FechamentoDinheiroTotal = FechamentoDinheiroTotal + VrTotalFechamentoDinheiroFisico;
			FechamentoQuebraCaixa = FechamentoQuebraCaixa + VrTotalFechamentoQuebraCaixa; 
			FechamentoFaturaTotal = parseFloat(FechamentoFaturaTotal) + parseFloat(VrFechamentoFatura);
			
			/*if(VrQuebraFechamentoCaixa>0){
                VrQuebraFechamentoCaixa = VrQuebraFechamentoCaixa;
            }else{
                VrQuebraFechamentoCaixa='-'+VrQuebraFechamentoCaixa;
            }*/
            
			FechamentoQuebraEfetivado = FechamentoQuebraEfetivado + VrQuebraFechamentoCaixa; 
			var vlrComparativoQuebra = parseFloat(VrTotalFechamentoQuebraCaixa.toFixed(2)) + parseFloat(VrQuebraFechamentoCaixa.toFixed(2));

			if (STFechadoMov == 'True' && STConferidoMov == '0') {
			    STConferidoMov = '<label style="color: red; font-size: 11px;">NÃO</label>';
				STFechadoMov = '<label style="color: red; font-size: 11px;">FECHADO</label>';
				if((mascaraValor(VrTotalFechamentoQuebraCaixa.toFixed(2)) === mascaraValor(VrQuebraFechamentoCaixa.toFixed(2)) )){
    				BTLancarQuebra = '<div class="btn-group btn-group-xs"><button type="button" class="btn btn-warning btn-xs" title="Ajustar Fechamento Caixa" id="'+IDMovimentoCaixa+'" onclick="modal_ajustar_mov_caixa(this.id)" >Ajustar Fechamento de Caixa</button>'+
    				' <button disabled type="button" class="btn btn-info btn-xs buttonLancarQuebra" title=Quebra já lançada" id="'+IDMovimentoCaixa+'" onclick="modal_lancar_Quebra_Caixa(this.id)" >Lançar Quebra de Caixa</button>'+
    				' <button type="button" class="btn btn-primary btn-xs" title="Lançar Faturas" id="'+IDMovimentoCaixa+'" onclick="modal_lancar_faturas(this.id,\''+IDOperadorCaixaFechamento+'\',\''+IDCaixaFechamento+'\',\''+DTAberturaMovCaixa+'\')" >Lançar Faturas</button>'+
    				' <button type="button" class="btn btn-success btn-xs" title="Confirmar Conferência do Caixa" id="'+IDMovimentoCaixa+'" onclick="update_confirmar_movimento_caixa(this.id,\'1\')" >Confirmar Conferência do Caixa</button>'+ tagBtnImprimirAjusteFechamentoCaixa + '</div>';
				}else{
				    BTLancarQuebra = '<div class="btn-group btn-group-xs"><button type="button" class="btn btn-warning btn-xs" title="Ajustar Fechamento Caixa" id="'+IDMovimentoCaixa+'" onclick="modal_ajustar_mov_caixa(this.id)" >Ajustar Fechamento de Caixa</button>'+
				    ' <button type="button" class="btn btn-info btn-xs buttonLancarQuebra" title="Lançar Quebra de Caixa" id="'+IDMovimentoCaixa+'" onclick="modal_lancar_Quebra_Caixa(this.id)" >Lançar Quebra de Caixa</button>'+
    				' <button type="button" class="btn btn-primary btn-xs" title="Lançar Faturas" id="'+IDMovimentoCaixa+'" onclick="modal_lancar_faturas(this.id,\''+IDOperadorCaixaFechamento+'\',\''+IDCaixaFechamento+'\',\''+DTAberturaMovCaixa+'\')" >Lançar Faturas</button>'+
    				' <button disabled type="button" class="btn btn-success btn-xs" title="Confirmar Conferência do Caixa" id="'+IDMovimentoCaixa+'" onclick="update_confirmar_movimento_caixa(this.id,\'1\')" >Confirmar Conferência do Caixa</button>'+ tagBtnImprimirAjusteFechamentoCaixa + '</div>';
    			
				}
			} else if(STFechadoMov == 'False' && STConferidoMov == '0') {
			    STConferidoMov = '<label style="color: red; font-size: 11px;">NÃO</label>';
				STFechadoMov = '<label style="color: blue; font-size: 11px;">ABERTO</label>';
				BTLancarQuebra = 'CAIXA ABERTO, NÃO É POSSÍVEL FAZER LANÇAMENTOS. SE NÃO FOR POSSÍVEL FECHAR O CAIXA, ENTRAR EM CONTATO COM O SUPORTE.';
				
			} else if(STFechadoMov == 'True' && STConferidoMov > '0'){
			    STConferidoMov = '<label style="color: blue; font-size: 11px;">SIM</label>';
			    STFechadoMov = '<label style="color: red; font-size: 11px;">FECHADO</label>';
				BTLancarQuebra = 'CAIXA CONFERIDO, NÃO É POSSÍVEL FAZER LANÇAMENTOS. PARA FAZER QUALQUER ALTERAÇÃO, ENTRAR EM CONTATO COM O SUPORTE';
			}
            
            if(VrTotalFechamentoQuebraCaixa>0){
                STQuebraCaixa = '<label style="color: blue; font-size: 11px;"> + ' + mascaraValor(VrTotalFechamentoQuebraCaixa.toFixed(2)) + '</label>';
                
            }else{
                STQuebraCaixa = '<label style="color: red; font-size: 11px;"> - ' + mascaraValor(VrTotalFechamentoQuebraCaixa.toFixed(2)) + '</label>';
            }
            
            if(VrQuebraFechamentoCaixa>0){
                lblVrQuebraFechamentoCaixa = '<label style="color: blue; font-size: 11px;"> + ' + mascaraValor(VrQuebraFechamentoCaixa.toFixed(2)) + '</label>';
            }else{
                lblVrQuebraFechamentoCaixa = '<label style="color: red; font-size: 11px;"> - ' + mascaraValor(VrQuebraFechamentoCaixa.toFixed(2)) + '</label>';
            }
			var tableMovimentoCaixa = $('#dt-basic-quebracaixa').DataTable();

			tableMovimentoCaixa.row.add([
                    `<label style="color: blue; font-size: 11px;">` + IDMovimentoCaixa + `</label>`,
                    `<label style="color: blue; font-size: 11px;">` + IDCaixaFechamento + ` - ` + DescCaixaFechamento + `</label>`,
                    `<label style="color: blue; font-size: 11px;">` + DTCaixaFechamento + `</label>`,
                    `<label style="color: blue; font-size: 11px;">` + NoOperadorCaixaFechamento + `</label>`,
                    `<label style="color: black; font-size: 11px;">` + mascaraValor(VrTotalFechamentoDinheiroFisico.toFixed(2)) + `</label>`,
                    `<label style="color: black; font-size: 11px;">` + mascaraValor(VrTotalFechamentoDinheiro.toFixed(2)) + `</label>`,
                    `<label style="color: black; font-size: 11px;">` + mascaraValor(VrFechamentoFatura.toFixed(2)) + `</label>`,
                    STQuebraCaixa,
                    lblVrQuebraFechamentoCaixa,
                    STFechadoMov,
                    STConferidoMov,
                    BTLancarQuebra,
                ]).draw(false);
	}

	$('.totalQuebraCaixa').html(
		`<tr>
            <th colspan="4" style="text-align: center;">Total Lançamentos</th>
            <th style="text-align: right;">${mascaraValor(FechamentoDinheiroTotal.toFixed(2))}</th>
            <th style="text-align: right;">${mascaraValor(FechamentoDinheiroInformadoTotal.toFixed(2))}</th>
            <th style="text-align: right;">${mascaraValor(FechamentoFaturaTotal.toFixed(2))}</th>
            <th style="text-align: right;">${mascaraValor(FechamentoQuebraCaixa.toFixed(2))}</th>
            <th style="text-align: right;">${mascaraValor(FechamentoQuebraEfetivado.toFixed(2))}</th>
            <th colspan="3"></th>
        </tr>`
	);

}

function funcErrorMovimentoCaixa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoTableMovimentoCaixa',
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
}

function modal_lancar_Quebra_Caixa(id) {

    $.get('action_cadquebracaixapmodal.html', function(res) {
      
       $('#resulmodalquebracaixa').html(res);
       $("#cadQuebraCaixa").modal('show');
       $('#cadQuebraCaixa').on('shown.bs.modal', function () {});

        $("#buttoncadquebracaixa").attr("disabled", false);

		$('#nomeempQuebraCaixa').val(NOEmpresaLogin);
		$('#TxtHistorico').val();
		
	
		
		$("#IDFuncionarioQuebra").select2({
			dropdownParent: $("#cadQuebraCaixa")
		});

		return ajaxGet('api/dashboard/funcionario.xsjs?idEmpresa=' + IDEmpresaLogin)
			.then(retornoListaFuncionarioModal)
			.catch(funcErrorFuncionarioModal);
    })
    
	return ajaxGet('api/movimento-caixa/gerencia.xsjs?idMovimentoCaixa=' + id)
	.then(retornoCadQuebraCaixa)
	.catch(funcErrorCadQuebraCaixa);
}

function retornoCadQuebraCaixa(cadastroQuebraCaixa) {

		IDMovCaixaQuebra = cadastroQuebraCaixa.data[0]['ID'];
		IDCaixaQuebra = cadastroQuebraCaixa.data[0]['IDQUEBRACAIXA'];
		IDCaixaWeb = cadastroQuebraCaixa.data[0]['IDCAIXAFECHAMENTO'];
		DsCaixaQuebra = cadastroQuebraCaixa.data[0]['DSCAIXAFECHAMENTO'];
		IDOperadoCaixa = cadastroQuebraCaixa.data[0]['IDOPERADORFECHAMENTO'];
		NoOperadoCaixa = cadastroQuebraCaixa.data[0]['OPERADORFECHAMENTO'];
		TxTHistorico = cadastroQuebraCaixa.data[0]['TXTHISTORICO'];
		VrAjusteDinLancado = mascaraValor(parseFloat(cadastroQuebraCaixa.data[0]['TOTALAJUSTEDINHEIRO']).toFixed(2));
		VrDinFisico = mascaraValor(parseFloat(cadastroQuebraCaixa.data[0]['TOTALFECHAMENTODINHEIROFISICO']).toFixed(2));
		VrQuebraLancado = mascaraValor(parseFloat(cadastroQuebraCaixa.data[0]['VRQUEBRAEFETIVADO']).toFixed(2));
		
		if(parseFloat(cadastroQuebraCaixa.data[0]['TOTALFECHAMENTOVRQUEBRACAIXA']).toFixed(2)< 0){
		    VrQuebraSistema ='-'+mascaraValor(parseFloat(cadastroQuebraCaixa.data[0]['TOTALFECHAMENTOVRQUEBRACAIXA']).toFixed(2));
		}else{
		    VrQuebraSistema ='+'+ mascaraValor(parseFloat(cadastroQuebraCaixa.data[0]['TOTALFECHAMENTOVRQUEBRACAIXA']).toFixed(2));
		}
		
		VrQuebraLancado =  parseFloat(cadastroQuebraCaixa.data[0]['TOTALFECHAMENTODINHEIROFISICO']) - parseFloat(cadastroQuebraCaixa.data[0]['TOTALAJUSTEDINHEIRO']);
		DtFechamento = cadastroQuebraCaixa.data[0]['DTFECHAMENTO'] + 'T23:59' ;
		
		if(cadastroQuebraCaixa.data[0]['TOTALAJUSTEDINHEIRO']>0){
		    
		    VrQuebraFinal =parseFloat(cadastroQuebraCaixa.data[0]['TOTALAJUSTEDINHEIRO'])-parseFloat(cadastroQuebraCaixa.data[0]['TOTALFECHAMENTODINHEIROFISICO'])  - parseFloat(cadastroQuebraCaixa.data[0]['VRQUEBRAEFETIVADO']);
            /*
    		$('#footerquebracaixa').html(
    		    `<button id="buttoncadquebracaixa" type="button" class="btn btn-success" onclick="update_quebra_caixa()">Atualizar Quebra de Caixa</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
    	    );
    	    */
		    
		}else{
		    VrQuebraFinal = parseFloat(cadastroQuebraCaixa.data[0]['TOTALFECHAMENTOVRQUEBRACAIXA']) - parseFloat(cadastroQuebraCaixa.data[0]['VRQUEBRAEFETIVADO']); 
		}
		

		if(VrQuebraFinal>0){
		    VrQuebraFinal = '+'+ mascaraValor(VrQuebraFinal.toFixed(2));
		}else{
		     VrQuebraFinal = '-'+ mascaraValor(VrQuebraFinal.toFixed(2));
		}
        
		DadosFuncionario = NoOperadoCaixa+' - '+IDCaixaQuebra+' - '+DsCaixaQuebra;
		
		$('#IDQuebraCaixa').val(IDCaixaQuebra);
		$('#IDMovimentoCaixa').val(IDMovCaixaQuebra);
		$('#IDCaixaWeb').val(IDCaixaWeb);
		$('#IDFuncionario').val(IDOperadoCaixa);
		$('#TxtHistorico').val(TxTHistorico);
		$('#nomefunc').val(DadosFuncionario);
		$('#VrQuebraSistema').val(VrQuebraSistema);
		$('#VrQuebraEfetivado').val(VrQuebraFinal);
	    $('#DTLancamento').val(DtFechamento);
}

function retornoCadQuebraCaixaAutomático(cadastroQuebraCaixaAutomatico) {

        var stativoquebra = 'True';
		var TxTHistorico = 'Quebra de Caixa Automático';

		IDMovCaixaQuebra = cadastroQuebraCaixaAutomatico.data[0]['ID'];
		IDCaixaQuebra = cadastroQuebraCaixaAutomatico.data[0]['IDQUEBRACAIXA'];
		IDCaixaWeb = cadastroQuebraCaixaAutomatico.data[0]['IDCAIXAFECHAMENTO'];
		DsCaixaQuebra = cadastroQuebraCaixaAutomatico.data[0]['DSCAIXAFECHAMENTO'];
		IDOperadoCaixa = cadastroQuebraCaixaAutomatico.data[0]['IDOPERADORFECHAMENTO'];
		NoOperadoCaixa = cadastroQuebraCaixaAutomatico.data[0]['OPERADORFECHAMENTO'];
		VrQuebraSistema = mascaraValor(parseFloat(cadastroQuebraCaixaAutomatico.data[0]['TOTALFECHAMENTOVRQUEBRACAIXA']).toFixed(2));

    	var dados = [{
    		"IDCAIXAWEB": parseInt(IDCaixaWeb),
    		"IDMOVIMENTOCAIXA": IDMovCaixaQuebra,
    		"IDGERENTE": parseInt(IDFuncionarioLogin),
    		"IDFUNCIONARIO": parseInt(IDOperadoCaixa),
    		"DTLANCAMENTO": dataAtualCampo,
    		"VRQUEBRASISTEMA": parseFloat(VrQuebraSistema),
    		"VRQUEBRAEFETIVADO": parseFloat(VrQuebraSistema),
    		"TXTHISTORICO": TxTHistorico,
    		"STATIVO": stativoquebra
    	}];
    
    	console.table(dados);
    
    	ajaxPost("api/dashboard/quebra-caixa/todos.xsjs", dados)
    		.then(funcSucessCadQuebraCaixaAutomatico)
    		.catch(funcErrorCadQuebraCaixaAutomatico);
}

function funcErrorCadQuebraCaixa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoCadQuebraCaixa',
		showConfirmButton: false,
		timer: 15000
	});
}

function cadastrar_quebra_caixa() {

	var idcaixaweb = $("#IDCaixaWeb").val();
	var idmovcaixa = $("#IDMovimentoCaixa").val();
	var idfuncionarioop = $("#IDFuncionario").val();
	var idfuncionarioquebra = $("#IDFuncionarioQuebra").val();
	var dtlancamento = $("#DTLancamento").val();
	var txthistorico = $("#TxtHistorico").val();
	var vrquebrasistema = $("#VrQuebraSistema").val().replace(".", "").replace(",", ".");
	var vrquebralancado = $("#VrQuebraEfetivado").val().replace(".", "").replace(",", ".");
	var stativoquebra = 'True';

    if ($("#TxtHistorico").val() === '') {
  
      $("#resultadoquebracaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe uma Descrição para o Histórico.</div>"
      );
        $("#TxtHistorico").focus();
        return false;
    }
   
    if ($("#VrQuebraEfetivado").val() == 0 || $("#VrQuebraEfetivado").val() == "") {
  
      $("#resultadoquebracaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Valor da Quebra de Caixa</div>"
      );
       
        $("#VrQuebraEfetivado").focus();
        return false;
    }
  
    if(idfuncionarioquebra > 0){
      idfuncionario = idfuncionarioquebra;
    }else{
      idfuncionario = idfuncionarioop;
    }
    
	var dados = [{

		"IDCAIXAWEB": parseInt(idcaixaweb),
		"IDMOVIMENTOCAIXA": idmovcaixa,
		"IDGERENTE": parseInt(IDFuncionarioLogin),
		"IDFUNCIONARIO": parseInt(idfuncionario),
		"DTLANCAMENTO": dtlancamento,
		"VRQUEBRASISTEMA": parseFloat(vrquebrasistema),
		"VRQUEBRAEFETIVADO": parseFloat(vrquebralancado),
		"TXTHISTORICO": txthistorico,
		"STATIVO": stativoquebra

	}];

	console.table(dados);

	ajaxPost("api/dashboard/quebra-caixa/todos.xsjs", dados)
		.then(funcSucessUpdateQuebraCaixa)
		.catch(funcErrorUpdateQuebraCaixa);
		
}

function update_quebra_caixa() {

	var idquebracaixa = $("#IDQuebraCaixa").val();
	var idcaixaweb = $("#IDCaixaWeb").val();
	var idmovcaixa = $("#IDMovimentoCaixa").val();
	var idfuncionario = $("#IDFuncionario").val();
	var dtlancamento = $("#DTLancamento").val();
	var txthistorico = $("#TxtHistorico").val();
	var vrquebrasistema = $("#VrQuebraSistema").val().replace(".", "").replace(",", ".");
	var vrquebralancado = $("#VrQuebraEfetivado").val().replace(".", "").replace(",", ".");
	var stativoquebra = 'True';

    if ($("#TxtHistorico").val() === '') {
  
      $("#resultadoquebracaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe uma Descrição para o Histórico.</div>"
      );
        $("#TxtHistorico").focus();
        return false;
    }
   
    if ($("#VrQuebraEfetivado").val() == 0 || $("#VrQuebraEfetivado").val() == "") {
  
      $("#resultadoquebracaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Valor da Quebra de Caixa</div>"
      );
       
        $("#VrQuebraEfetivado").focus();
        return false;
    }
  
	var dados = [{

		"IDQUEBRACAIXA": parseInt(idquebracaixa),
		"IDCAIXAWEB": parseInt(idcaixaweb),
		"IDMOVIMENTOCAIXA": idmovcaixa,
		"IDGERENTE": parseInt(IDFuncionarioLogin),
		"IDFUNCIONARIO": parseInt(idfuncionario),
		"DTLANCAMENTO": dtlancamento,
		"VRQUEBRASISTEMA": parseFloat(vrquebrasistema),
		"VRQUEBRAEFETIVADO": parseFloat(vrquebralancado),
		"TXTHISTORICO": txthistorico,
		"STATIVO": stativoquebra

	}];

	console.table(dados);

	ajaxPut("api/dashboard/quebra-caixa/todos.xsjs", dados)
		.then(funcSucessUpdateQuebraCaixa)
		.catch(funcErrorUpdateQuebraCaixa);

}

function funcSucessUpdateQuebraCaixa(resposta) {
 
    var idquebracaixa = $("#IDQuebraCaixa").val(); 

	$("#buttoncadquebracaixa").attr("disabled", true);
	modal_Imprimir_Quebra(idquebracaixa);
	//alerta_cadastrado_sucesso();
	$("#cadQuebraCaixa").modal('hide');
	pesq_quebra_caixa();
}

function funcErrorUpdateQuebraCaixa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateQuebraCaixa',
		showConfirmButton: false,
		timer: 15000
	});
}

function modal_lancar_faturas(idmov, idop, idcx, datamov) {

    $.get('action_cadfaturamodal.html', function(res) {
      
       $('#resulmodalfatura').html(res);
       $("#cadFatura").modal('show');
       $('#cadFatura').on('shown.bs.modal', function () {});

		$('#nomeempFaturaCadastrar').val(NOEmpresaLogin);
		$('#IDOperadorFaturaCadastrar').val(idop);
		$('#IDFaturaCaixaCadastrar').val(idcx);
		$('#IDMovimentoCaixaCadastrar').val(idmov);
		$('#DataMovCaixa').val(datamov);

    })

}

function cadastrar_fatura_caixa() {

	var idoperadorfaturacaixa = $("#IDOperadorFaturaCadastrar").val();
	var idfaturacaixa = $("#IDFaturaCaixaCadastrar").val();
	var dataMov = $("#DataMovCaixa").val();
	var DataMovCaixa = dataMov.trim();
	var idmovifaturacaixa = $("#IDMovimentoCaixaCadastrar").val();
	var codAutorizacao = $("#CodAutorizacaoCadastrar").val();
	var vrfaturanovo = $("#VrFaturaCadastrar").val().replace(".", "").replace(",", ".");
	
    if ($("#CodAutorizacaoCadastrar").val() === '') {
  
      $("#resultadoeditafaturacaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Código da Fatura.</div>"
      );
        $("#CodAutorizacaoCadastrar").focus();
        return false;
    }
    
    var dados = [{
      "IDEMPRESA":parseInt(IDEmpresaLogin),
      "IDFUNCIONARIO":parseInt(idoperadorfaturacaixa),
      "IDDETALHEFATURALOCAL" :null,
      "IDCAIXAWEB":parseInt(idfaturacaixa),
      "IDCAIXALOCAL" :null,
      "NUESTABELECIMENTO" :"",
      "NUCARTAO" :"",
      "DTPROCESSAMENTO":DataMovCaixa,
      "HRPROCESSAMENTO":horaAtualCampo,
      "NUNSU" :"",
      "NUNSUHOST" :"",
      "IDMOVIMENTOCAIXAWEB":idmovifaturacaixa,
      "NUCODAUTORIZACAO":codAutorizacao,
      "VRRECEBIDO": parseFloat(vrfaturanovo),
      "DTHRMIGRACAO" :"",
      "STCANCELADO" :"False",
      "IDUSRCACELAMENTO" :null
    }];

console.table(dados);

  	ajaxPost("api/detalhe-fatura.xsjs", dados)
		.then(funcSucessCadastrarFatura)
		.catch(funcErrorCadastrarFatura);

}

function funcSucessCadastrarFatura(resposta) {

	alerta_atualizado_sucesso();
	$("#cadFatura").modal('hide');
	pesq_quebra_caixa();

}

function funcErrorCadastrarFatura(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessCadastrarFatura',
		showConfirmButton: false,
		timer: 15000
	});
}

function modal_ajustar_mov_caixa(id) {

    $.get('action_ajustemovcaixapmodal.html', function(res) {
      
       $('#resulmodalajustemovcaixa').html(res);
       $("#ajusteMovCaixa").modal('show');
       $('#ajusteMovCaixa').on('shown.bs.modal', function () {});

		$('#nomeempAjusteCaixa').val(NOEmpresaLogin);

    })
    
	return ajaxGet('api/movimento-caixa/gerencia.xsjs?idMovimentoCaixa=' + id)
	.then(retornoAjusteMovCaixa)
	.catch(funcErrorAjusteMovCaixa);
  
}

function retornoAjusteMovCaixa(ajusteMovCaixa) {

		IDMovCaixaAjuste = ajusteMovCaixa.data[0]['ID'];
		IDCaixaWebAjuste = ajusteMovCaixa.data[0]['IDCAIXAFECHAMENTO'];
		DsCaixaAjuste = ajusteMovCaixa.data[0]['DSCAIXAFECHAMENTO'];
		IDOperadoCaixaAjuste = ajusteMovCaixa.data[0]['IDOPERADORFECHAMENTO'];
		NoOperadoCaixaAjuste = ajusteMovCaixa.data[0]['OPERADORFECHAMENTO'];
		txtObs = ajusteMovCaixa.data[0]['TXT_OBS'];
		VrDinheiroVenda = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTODINHEIROFISICO']).toFixed(2));
		VrQuebraAjuste = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTOVRQUEBRACAIXA']).toFixed(2));
		VrDinheiroInformado = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTODINHEIRO']).toFixed(2));
		VrDinheiroAjuste = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALAJUSTEDINHEIRO']).toFixed(2));
		VrFaturaSistema = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTOFATURA']).toFixed(2));
		VrTEFSistema = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTOTEF']).toFixed(2));
		VrPOSSistema = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTOPOS']).toFixed(2));
		VrConvenioSistema = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTOCONVENIO']).toFixed(2));
		VrVoucherSistema = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTOVOUCHER']).toFixed(2));
		VrPIXSistema = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTOPIX']).toFixed(2));
		VrCPLSistema = mascaraValor(parseFloat(ajusteMovCaixa.data[0]['TOTALFECHAMENTOCPL']).toFixed(2));
		
		DadosFuncionarioAjuste = NoOperadoCaixaAjuste+' - '+IDCaixaWebAjuste+' - '+DsCaixaAjuste;

    	if(parseFloat(VrDinheiroAjuste)>0){
		    totalDinheiroInformado = VrDinheiroAjuste; 
		}else{
		    totalDinheiroInformado = VrDinheiroInformado;
		}
		
		$('#IDMovimentoCaixa').val(IDMovCaixaAjuste);
		$('#IDCaixaWeb').val(IDCaixaWebAjuste);
		$('#NomeSupervisor').val(NomeFuncionarioLogin);
		$('#IDUsuarioLogin').val(IDFuncionarioLogin);
		$('#nomefuncAjuste').val(DadosFuncionarioAjuste);
		$('#TxtOBS').val(txtObs);
		$('#VrDinheiroLancado').val(totalDinheiroInformado);
		$('#VrDinheiroSistema').val(VrDinheiroVenda);
		$('#VrQuebraSistema').val(VrQuebraAjuste);
		$('#VrTEFLancado').val(VrTEFSistema);
		$('#VrPOSLancado').val(VrPOSSistema);
		$('#VrFaturaLancado').val(VrFaturaSistema);
		$('#VrVoucherLancado').val(VrVoucherSistema);
		$('#VrConvenioLancado').val(VrConvenioSistema);
		$('#VrPIXLancado').val(VrPIXSistema);
		$('#VrCPLLancado').val(VrCPLSistema);
}

function funcErrorAjusteMovCaixa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoAjusteMovCaixa',
		showConfirmButton: false,
		timer: 15000
	});
}

function update_confirmar_movimento_caixa(id, status) {

	var dados = {
        "STCONFERIDO": status,
		"ID": id
	};

	console.table(dados);

	ajaxPut("api/movimento-caixa/atualizacao-status.xsjs", dados)
		.then(funcSucessUpdateStatusMovimento)
		.catch(funcErrorUpdateStatusMovimento);

}

function ajustar_mov_caixa() {
    
    var vrquebranova = 0;
    
	var idmovcaixaajuste = $("#IDMovimentoCaixa").val();
	var idfuncionarioajuste = $("#IDFuncionario").val();
	var nomesupervisor = $('#NomeSupervisor').val();
	var dtlancamentoAjuste = $("#DTLancamentoAjuste").val();
	var txthistoricoAjuste = $("#TxtHistoricoAjuste").val();
	var txtObsMov = $("#TxtOBS").val();
	var Vrdinheirosistema = $('#VrDinheiroSistema').val().replace(".", "").replace(",", ".");
	var Vrquebrasistema = $('#VrQuebraSistema').val().replace(".", "").replace(",", ".");
	var vrdinheiroajuste = $("#VrDinheiroAjuste").val().replace(".", "").replace(",", ".");
	var vrtefajuste = 0;
	var vrposajuste = 0;
	var vrdfaturaajuste = $("#VrFaturaAjuste").val().replace(".", "").replace(",", ".");
	var vrvoucherajuste = 0;
	var vrconvenioajuste = 0;
	var vrpixajuste = 0;
	var vrcplajuste = 0;

	vrquebranova = vrdinheiroajuste - Vrdinheirosistema;
	
    if ($("#TxtHistoricoAjuste").val() === '') {
  
      $("#resultadoajustemovcaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Motivo para o Ajuste do Movimento do Caixa.</div>"
      );
        $("#TxtHistorico").focus();
        return false;
    }
   
    TxtObservacaoAjuste = txtObsMov+' - '+ ' Justificativa do Ajuste: '+txthistoricoAjuste+ ' Data Ajuste: '+dtlancamentoAjuste+ ' Ajustado por: '+nomesupervisor;
    
	var dados = {

		"ID": idmovcaixaajuste,
		"VRAJUSTDINHEIRO": parseFloat(vrdinheiroajuste),
		"VRAJUSTTEF": parseFloat(vrtefajuste),
		"VRAJUSTPOS": parseFloat(vrposajuste),
		"VRAJUSTFATURA": parseFloat(vrdfaturaajuste),
		"VRAJUSTVOUCHER": parseFloat(vrvoucherajuste),
		"VRAJUSTCONVENIO": parseFloat(vrconvenioajuste),
		"VRAJUSTPIX": parseFloat(vrpixajuste),
		"VRAJUSTPL": parseFloat(vrcplajuste),
		"TXT_OBS": TxtObservacaoAjuste,
        "VRQUEBRACAIXA": parseFloat(vrquebranova),
	};

	console.table(dados);

	ajaxPut("api/movimento-caixa/ajuste-recebimento.xsjs", dados)
		.then(funcSucessAjusteMovCaixa)
		.catch(funcErrorAjusteMovCaixa);

}

function funcSucessAjusteMovCaixa(resposta) {

	$("#buttonajustemovcaixa").attr("disabled", true);
	alerta_cadastrado_sucesso();
	$("#ajusteMovCaixa").modal('hide');
	pesq_quebra_caixa();
}

function funcErrorAjusteMovCaixa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessAjusteMovCaixa',
		showConfirmButton: false,
		timer: 15000
	});
}

function funcSucessUpdateStatusMovimento(resposta) {

	$(".buttonLancarQuebra").attr("disabled", true);
	alerta_cadastrado_sucesso();
	pesq_quebra_caixa();
}

function funcErrorUpdateStatusMovimento(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateStatusMovimento',
		showConfirmButton: false,
		timer: 15000
	});
}

//////////////////Faturas da Loja////////////////////////////

function ListaFaturaLoja(tipo) {

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
                $('#DTInicioFat').val(dataAtualCampo);
                $('#DTFimFat').val(dataAtualCampo);
            
                $('.DescTituloFaturas').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Lista de Faturas da Loja - <span class='fw-300'>` + NOEmpresaLogin + `</span>`);
          }
        };
        xmlhttp.open("GET", "action_listfaturaloja.html", true);
        xmlhttp.send();
    //}
}

function pesq_list_fatura() {

    var datapesqinicio = $("#DTInicioFat").val();
    var datapesqfim = $("#DTFimFat").val();
  
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
        newDataTable('faturaloja');
        
            $('.dataAtual').text(dataAtual);

		    $('.DescTituloFaturaPesq').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Faturas da Loja - <span class='fw-300'>` + NOEmpresaLogin + `</span>`);

		    return	ajaxGet('api/detalhe-fatura.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
				.then(retornoTableListFaturaLoja)
				.catch(funcErrorListFaturaLoja);
				
      }
    };
    xmlhttp.open("GET", "action_pesqfaturaloja.html", true);
    xmlhttp.send();
}

function retornoTableListFaturaLoja(faturaLoja) {

	var VrTotalFaturaLoja = 0;
	var contadorFatura = 0;

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
		IdMovCaixa = faturaLoja.data[i]['IDMOVCAIXA'];
		STPIX = faturaLoja.data[i]['STPIX'];
		
		if(IDMovCaixaFatura==IdMovCaixa){
            tagIDMov='<label style="color: blue; font-size: 11px;">' + IdMovCaixa + '</label>';
        }else{
             tagIDMov='<label style="color: red; font-size: 11px;">' + IdMovCaixa + '</label>';
        }
        
        if(STFatura=='False'){
            tagFaturaAtivo='<label style="color: blue;">ATIVO</label>';
            VrTotalFaturaLoja = VrTotalFaturaLoja + VrFatura;
        }else{
            tagFaturaAtivo='<label style="color: red;">CANCELADO</label>';
        }

        if(STFatura=='False' && (STMovCaixa=='False' || STMovCaixa==1 || STMovCaixa==0 || STMovCaixa==null)){
            if(STPIX=='True'){
                tagFaturaCancelaBotao='';
                tagStPix='SIM';
            }else{
                tagFaturaCancelaBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-success btn-xs" title="Editar Fatura" id="'+IDFatura+'" onclick="modal_editar_fatura_Loja(this.id)" >Editar</button>'+
                '<button type="button" class="btn btn-danger btn-xs" title="Cancelar Fatura" id="'+IDFatura+'" onclick="modal_cancela_fatura_Loja(this.id)" >Cancelar</button></div>';
                tagStPix='NÃO';
            }
        }else{
            tagFaturaCancelaBotao=MotivoCancelado;
        }
        
		var tableFaturaLoja = $('#dt-basic-faturaloja').DataTable();

		tableFaturaLoja.row.add([
            `<label style="color: blue; font-size: 11px;"">` + contadorFatura + `</label>`,
            `<label style="color: blue; font-size: 11px;"">` + DTFatura + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + IDMovCaixaFatura + `</label>`,
            tagIDMov,
            `<label style="color: blue; font-size: 11px;">` + IDCaixaFatura + ` - ` + DescCaixaFatura + `</label>`,
            `<label style="color: blue; font-size: 11px;"">` + CodFatura + `</label>`,
            `<label style="color: green;">` + mascaraValor(VrFatura.toFixed(2)) + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NoRecebedorFatura + `</label>`,
            tagFaturaAtivo,
            tagStPix,
            tagFaturaCancelaBotao,
        ]).draw(false);

	}

	$('.totalFaturas').html(
		`<tr>
            <th colspan="6" style="text-align: center;">Total Lançamentos</th>
            <th style="text-align: right;">${mascaraValor(VrTotalFaturaLoja.toFixed(2))}</th>
            <th colspan="4"></th>
        </tr>`
	);
}

function funcErrorListFaturaLoja(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoTableListFaturaLoja',
		showConfirmButton: false,
		timer: 15000
	});
}

function modal_cancela_fatura_Loja(id) {

    $.get('action_cancelfaturamodal.html', function(res) {
      
       $('#resulmodalcancelafaturacaixa').html(res);
       $("#cancelFaturaCaixa").modal('show');
       $('#cancelFaturaCaixa').on('shown.bs.modal', function () {});

		$('#nomeempFaturaCaixa').val(NOEmpresaLogin);

    })
    
	    return	ajaxGet('api/detalhe-fatura.xsjs?id=' + id)
			.then(retornoCancelaFaturaCaixa)
			.catch(funcErrorCancelaFaturaCaixa);
  
}

function retornoCancelaFaturaCaixa(cancelaFaturaCaixa) {

		IDFaturaCaixa = cancelaFaturaCaixa.data[0]['IDDETALHEFATURA'];
		IDCaixaFatura = cancelaFaturaCaixa.data[0]['IDCAIXAWEB'];
		DsCaixaFatura = cancelaFaturaCaixa.data[0]['DSCAIXA'];
		CodAutorizacaoFatura = cancelaFaturaCaixa.data[0]['NUCODAUTORIZACAO'];
		IDMovCaixaFatura = cancelaFaturaCaixa.data[0]['IDMOVIMENTOCAIXAWEB'];
		VrFaturaRecebido = mascaraValor(parseFloat(cancelaFaturaCaixa.data[0]['VRRECEBIDO']).toFixed(2));
		
		DadosCaixaFatura = IDFaturaCaixa+' - '+DsCaixaFatura+' - '+CodAutorizacaoFatura;
		

		$('#IDFaturaCaixa').val(IDFaturaCaixa);
		$('#nomeFatura').val(DadosCaixaFatura);
		$('#IDMovimentoCaixa').val(IDMovCaixaFatura);
}

function funcErrorCancelaFaturaCaixa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoCancelaFaturaCaixa',
		showConfirmButton: false,
		timer: 15000
	});
}

function cancela_fatura_caixa() {

	var idfaturacaixa = $("#IDFaturaCaixa").val();
	var txtmotivocancela = $("#TxtHistoricoCancela").val();
	
    if ($("#TxtHistoricoCancela").val() === '') {
  
      $("#resultadocancelafaturacaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Motivo do Cancelamento.</div>"
      );
        $("#TxtHistoricoCancela").focus();
        return false;
    }
    
    var dados = {
      "IDDETALHEFATURA": parseInt(idfaturacaixa),
      "TXTMOTIVOCANCELAMENTO":txtmotivocancela,
      "STCANCELADO":'True',
      "IDUSRCACELAMENTO": parseInt(IDFuncionarioLogin)
    };

console.table(dados);

  	ajaxPut("api/fatura-loja/detalhe-fatura.xsjs", dados)
		.then(funcSucessCancelaFatura)
		.catch(funcErrorCancelaFatura);

}

function funcSucessCancelaFatura(resposta) {

	alerta_cancel_fatura();
	$("#cancelFaturaCaixa").modal('hide');
	pesq_list_fatura();

}

function funcErrorCancelaFatura(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessCancelaFatura',
		showConfirmButton: false,
		timer: 15000
	});
}

function modal_editar_fatura_Loja(id) {

    $.get('action_editarfaturamodal.html', function(res) {
      
       $('#resulmodaleditefaturacaixa').html(res);
       $("#editeFaturaCaixa").modal('show');
       $('#editeFaturaCaixa').on('shown.bs.modal', function () {});

		$('#nomeempFaturaCaixa').val(NOEmpresaLogin);

    })
    
	    return	ajaxGet('api/detalhe-fatura.xsjs?id=' + id)
			.then(retornoEditarFaturaCaixa)
			.catch(funcErrorEditarFaturaCaixa);
  
}

function retornoEditarFaturaCaixa(editarFaturaCaixa) {

		IDFaturaCaixa = editarFaturaCaixa.data[0]['IDDETALHEFATURA'];
		IDCaixaFatura = editarFaturaCaixa.data[0]['IDCAIXAWEB'];
		DsCaixaFatura = editarFaturaCaixa.data[0]['DSCAIXA'];
		CodAutorizacaoFatura = editarFaturaCaixa.data[0]['NUCODAUTORIZACAO'];
		IDMovCaixaFatura = editarFaturaCaixa.data[0]['IDMOVIMENTOCAIXAWEB'];
		VrFaturaRecebido = mascaraValor(parseFloat(editarFaturaCaixa.data[0]['VRRECEBIDO']).toFixed(2));
		
		DadosCaixaFatura = IDFaturaCaixa+' - '+DsCaixaFatura+' - '+CodAutorizacaoFatura;
		
		$('#IDFaturaCaixaEditar').val(IDFaturaCaixa);
		$('#nomeFaturaEditar').val(DadosCaixaFatura);
		$('#IDMovimentoCaixaEditar').val(IDMovCaixaFatura);
		$('#CodAutorizacao').val(CodAutorizacaoFatura);
		$('#VrFaturaAtingo').val(VrFaturaRecebido);
}

function funcErrorEditarFaturaCaixa(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoEditarFaturaCaixa',
		showConfirmButton: false,
		timer: 15000
	});
}

function editar_fatura_caixa() {

	var idfaturacaixa = $("#IDFaturaCaixaEditar").val();
	var codAutorizacao = $("#CodAutorizacao").val();
	var vrfaturanovo = $("#VrFaturaAtual").val().replace(".", "").replace(",", ".");
	
    if ($("#codAutorizacao").val() === '') {
  
      $("#resultadoeditafaturacaixa").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Código da Fatura.</div>"
      );
        $("#codAutorizacao").focus();
        return false;
    }
    
    var dados = {
      "IDDETALHEFATURA": parseInt(idfaturacaixa),
      "NUCODAUTORIZACAO":codAutorizacao,
      "VRRECEBIDO": parseFloat(vrfaturanovo)
    };

console.table(dados);

  	ajaxPut("api/fatura-loja/atualizar.xsjs", dados)
		.then(funcSucessEditarFatura)
		.catch(funcErrorEditarFatura);

}

function funcSucessEditarFatura(resposta) {

	alerta_atualizado_sucesso();
	$("#editeFaturaCaixa").modal('hide');
	pesq_list_fatura();

}

function funcErrorEditarFatura(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessEditarFatura',
		showConfirmButton: false,
		timer: 15000
	});
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
                $('#NVoucher').focus();
            
                $('.DescTituloVoucher').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Vouchers Emitidos`);
          }
        };
        xmlhttp.open("GET", "action_listvoucher.html", true);
        xmlhttp.send();
    //}
}

function pesq_list_voucher() {

    var numerovoucher = $("#NVoucher").val().trim();
    
    if (numerovoucher === '') {
  
      $("#resultado").html(
        "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
        "</button>" +
        "<strong>Atenção!</strong> Informe o Número do Voucher.</div>"
      );
        $("#NVoucher").val('');
        $("#NVoucher").focus();
        return false;
    }
  
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

		    return	ajaxGet('api/resumo-voucher/detalhe-voucher.xsjs?id=' + numerovoucher)
				.then(retornoTableListVoucher)
				.catch(funcErrorListVoucher);
				
      }
    };
    xmlhttp.open("GET", "action_pesqvoucheremitido.html", true);
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
        ]).draw(false);
        
        if(STAtivoVoucher=='False'){
           for (var j = 0; j < voucherEmitido.data[i].detalhe.length; j++) {
    
    			IDDetVenda = voucherEmitido.data[i].detalhe[j]['vendadet']['IDVENDADETALHE'];
    			IDVenda = voucherEmitido.data[i].detalhe[j]['vendadet']['IDVENDA'];
    			IDProduto = voucherEmitido.data[i].detalhe[j]['vendadet']['CPROD'];
    			CodBarras = voucherEmitido.data[i].detalhe[j]['vendadet']['CEAN'];
    			DsProduto = voucherEmitido.data[i].detalhe[j]['vendadet']['DSPRODUTO'];
    			QTDProduto = voucherEmitido.data[i].detalhe[j]['vendadet']['QTD'];
    			VrProduto = parseFloat(voucherEmitido.data[i].detalhe[j]['vendadet']['VRTOTALLIQUIDO']);
    			NoVendedor = voucherEmitido.data[i].detalhe[j]['vendadet']['VENDEDOR_NOME'];
    
            	$('.ListaProdVoucher').html(
            		`
                    <tr>
                        
                        <th style="text-align: center;">Nº Venda</th>
                        <th style="text-align: center;">Nº Produto</th>
                        <th style="text-align: center;">Cod. Barras</th>
                        <th colspan="3" style="text-align: center;">Descrição</th> 
                        <th style="text-align: center;">QTD</th>
                        <th style="text-align: right;">Valor</th>
                        <th style="text-align: center;">Vendedor</th>
                        
                    </tr>
            		<tr>
                        
                        <td style="text-align: center; font-size: 11px;">`+IDVenda+`</td>
                        <td style="text-align: center; font-size: 11px;">`+IDProduto+`</td>
                        <td style="text-align: center; font-size: 11px;">`+CodBarras+`</td>
                        <td colspan="3" style="text-align: center; font-size: 11px;">`+DsProduto+`</td>
                        <td style="text-align: center; font-size: 11px;">`+QTDProduto+`</td>
                        <td style="text-align: right; font-size: 11px;">${mascaraValor(VrProduto.toFixed(2))}</td>
                        <td style="text-align: center; font-size: 11px;">`+NoVendedor+`</td>
                        
                    </tr>`
            	);
    
    		}
        }else{
            $('.ListaProdVoucher').html('');
        }
	}
}

function funcErrorListVoucher(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoTableListVoucher',
		showConfirmButton: false,
		timer: 15000
	});
}

////////// FUNÇÕES DE ALERTAS ///////////////////////////////

function alerta_atualizado_sucesso() {
	Swal.fire({
		type: "success",
		title: "Dados Atualizado com Sucesso",
		showConfirmButton: false,
		timer: 2000
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

function alerta_dados_pesquisa(data = 'Informe o período da Pesquisa!') {
	Swal.fire({
		type: "warning",
		title: data,
		showConfirmButton: true,
		timer: 2500
	});
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

function alerta_cancel_ativa_deposito() {
Swal.fire(
  {
      type: "success",
      title: "Depósito Atualizado com Sucesso.",
      showConfirmButton: false,
      timer: 2500
  });
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

function alerta_cancel_ativa_despesa() {
Swal.fire(
  {
      type: "success",
      title: "Despesa Atualizado com Sucesso.",
      showConfirmButton: false,
      timer: 2500
  });
}

function alerta_cancel_fatura() {
Swal.fire(
  {
      type: "success",
      title: "Fatura Cancelada com Sucesso.",
      showConfirmButton: false,
      timer: 2500
  });
}

//////////////// IMPRESSÃO DE AJUSTE CAIXA//////////////////////////////////

function modal_Imprimir_Ajuste_Caixa(id) {

	$.get('action_imprimirmodal.html', function(res) {

		$('#resulmodalimprimir').html(res);
		$("#imprimiDados").modal('show');
		$('#imprimiDados').on('shown.bs.modal', function() {});

	    return	ajaxGet('api/movimento-caixa/fechamento-caixa.xsjs?idMovimentoCaixa=' + id)
			.then(retornoTableImprimeAjusteCaixa)
			.catch(funcError);
	})
}

function retornoTableImprimeAjusteCaixa(imprimeAjusteCaixa) {

	dataCompetencia = imprimeAjusteCaixa.data[0]['DTABERTURA'];
	dataFechamento = imprimeAjusteCaixa.data[0]['DTHORAFECHAMENTOCAIXA'];
	descricaoCaixa = imprimeAjusteCaixa.data[0]['DSCAIXAFECHAMENTO'];
	numeroFechamento = parseFloat(imprimeAjusteCaixa.data[0]['ID']);
	codigoOperador = imprimeAjusteCaixa.data[0]['IDOPERADORFECHAMENTO'];
	
	valorDinheiroSistema = parseFloat(imprimeAjusteCaixa.data[0]['TOTALFECHAMENTODINHEIRO']);
	valorDinheiro = parseFloat(imprimeAjusteCaixa.data[0]['TOTALAJUSTEDINHEIRO']);
	valorTef = parseFloat(imprimeAjusteCaixa.data[0]['TOTALAJUSTTEF']);
	valorPos = parseFloat(imprimeAjusteCaixa.data[0]['TOTALAJUSTPOS']);
	valorConvenio = parseFloat(imprimeAjusteCaixa.data[0]['TOTALAJUSTCONVENIO']);
	valorVoucher = parseFloat(imprimeAjusteCaixa.data[0]['TOTALAJUSTVOUCHER']);
	valorFatura = parseFloat(imprimeAjusteCaixa.data[0]['TOTALAJUSTEFATURA']);
	valorPix = parseFloat(imprimeAjusteCaixa.data[0]['TOTALAJUSTPIX']);
	valorSangria = '0';
	valorTotal = valorDinheiro + valorTef + valorPos + valorConvenio + valorVoucher + valorFatura + valorPix;

	NoFuncionario = imprimeAjusteCaixa.data[0]['OPERADORFECHAMENTO'];
	CPFFuncionario = imprimeAjusteCaixa.data[0]['NUCPF'];
	
	$('.TituloModalImprimir').html(
		`Impressão de Recibos <small class="m-0 text-muted">Imprimir Ajuste Fechamento de Caixa</small>`
	);

	$('.TituloRecibo').html(
		`<h3 style="text-align: center;">AJUSTE FECHAMENTO DE CAIXA</h3>`
	);

	$('.CorpoRecibo1').html(
		`<table>
		<tr><td>DATA COMPETENCIA:</td><td>  ` + dataCompetencia + `</td></tr>
		<tr><td>DATA FECHAMENTO</td><td>  ` + dataFechamento + `</td></tr>
		<tr><td>CAIXA:</td><td>  ` + descricaoCaixa + `</td></tr>
		<tr><td>Nº FECHAMENTO LOCAL:</td><td>  ` + numeroFechamento + `</td></tr>
		<tr><td>Nº FECHAMENTO WEB:</td><td>  ` + numeroFechamento + `</td></tr>
		<tr><td>COD. OPERADOR(A):</td><td>  ` + codigoOperador + `</td></tr>
		<tr><td>&nbsp</td>&nbsp<td></td></tr>
		<tr><td>VR AJUSTE DINHEIRO:</td><td> ` + valorDinheiro + `</td></tr>
		<tr><td>VR AJUSTE TEF:</td><td> ` + valorTef + `</td></tr>
		<tr><td>VR AJUSTE POS:</td><td> ` + valorPos + `</td></tr>
		<tr><td>VR AJUSTE CONVENIO:</td><td> ` + valorConvenio + `</td></tr>
		<tr><td>VR AJUSTE VOUCHER:</td><td> ` + valorVoucher + `</td></tr>
		<tr><td>VR AJUSTE FATURA:</td><td> ` + valorFatura + `</td></tr>
		<tr><td>VR AJUSTE PIX:</td><td> ` + valorPix + `</td></tr>
		
		<tr><td>&nbsp</td>&nbsp<td></td></tr>
		<tr><td>VR TOTAL AJUSTE:</td><td> ` + valorTotal + `</td></tr></table><br><br>`
	);
	
	$('.CorpoRecibo4').html(
		`<div class="col-sm-12" style="text-align: center;">Eu, ` + NoFuncionario + ` - CPF: ` + CPFFuncionario + ` confirmo o ajuste de fechamento de caixa do valor acima declarado.</div>`
		
	);
	
	$('.CorpoRecibo5').html(
		`<div class="col-sm-12" style="text-align: center;">--------------------------------------------------------------------------------------------------------------------</div>
			<div class="col-sm-12" style="text-align: center;">Operador(a):` + NoFuncionario + ` - CPF: ` + CPFFuncionario + `</div>`
	);
	
	
}

function funcError(data = 'Erro ao Carregar os Dados') {
	Swal.fire({
		type: "error",
		title: data,
		showConfirmButton: false,
		timer: 15000
	});
}

//////////////////Quebra da Loja////////////////////////////

function ListaQuebraCaixa() {

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
    
    	xmlhttp.onreadystatechange = function() {
    		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
    			document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
            
                $('.dataAtual').text(dataAtual);
                $('#DTInicioQuebra').val(dataAtualCampo);
                $('#DTFimQuebra').val(dataAtualCampo);
            
                $('.DescTituloDepostio').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Lista de Quebras de Caixas da Loja - <span class='fw-300'>` + NOEmpresaLogin + `</span>`);
    
    		}
    	};
    	xmlhttp.open("GET", "action_listquebracaixa.html", true);
    	xmlhttp.send();
    //}
}

function pesq_list_quebra() {

    var datapesqinicio = $("#DTInicioQuebra").val();
    var datapesqfim = $("#DTFimQuebra").val();
  
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
        newDataTable('depositoloja');
        
            $('.dataAtual').text(dataAtual);

		    $('.DescTituloDepostio').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista de Quebras de Caixas da Loja - <span class='fw-300'>` + NOEmpresaLogin + `</span>`);
			
		    return	ajaxGet('api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
				.then(retornoTableListQuebraCaixaLoja)
				.catch(funcErrorQuebraCaixaLoja);
				
      }
    };
    xmlhttp.open("GET", "action_pesqquebra.html", true); 
    xmlhttp.send();
}

function retornoTableListQuebraCaixaLoja(quebraCaixaLoja) {

	var contadorQuebraLoja = 0;

	for (var i = 0; i < quebraCaixaLoja.data.length; i++) {

		contadorQuebraLoja = contadorQuebraLoja + 1;

		IDQuebraLoja = quebraCaixaLoja.data[i]['IDQUEBRACAIXA'];
		IDMovQuebraLoja = quebraCaixaLoja.data[i]['IDMOVIMENTOCAIXA'];
		IDGerente = quebraCaixaLoja.data[i]['IDGERENTE'];
		IDFuncQuebra = quebraCaixaLoja.data[i]['IDFUNCIONARIO'];
		DTLancamento = quebraCaixaLoja.data[i]['DTLANCAMENTO']; 
		VrQuebrasistemaLoja = parseFloat(quebraCaixaLoja.data[i]['VRQUEBRASISTEMA']);
		VrQuebraLancadoLoja = parseFloat(quebraCaixaLoja.data[i]['VRQUEBRAEFETIVADO']);
		TxtHistoricoQuebra = quebraCaixaLoja.data[i]['TXTHISTORICO'];
		NomeFuncQuebra = quebraCaixaLoja.data[i]['NOMEOPERADOR'];
		SituacaoQuebraLoja = quebraCaixaLoja.data[i]['STATIVO'];

	    if(SituacaoQuebraLoja=='True'){ 
            tagQuebraAtivo='<label style="color: blue;">Ativo</label>';
            tagQuebraAtivoBotao='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-info btn-xs" title="Imprimir Quebra" id="'+IDQuebraLoja+'" onclick="modal_Imprimir_Quebra(this.id)" >Imprimir</button></div>';
        }else{
            tagQuebraAtivo='<label style="color: red;">Cancelado</label>';
            tagQuebraAtivoBotao='<div class="btn-group btn-group-xs"></div>';
        }
        
        if(VrQuebrasistemaLoja < 0){
            lnQuebraSitemaLoja = `<label style="color: red;">-` + mascaraValor(VrQuebrasistemaLoja.toFixed(2)) + `</label>`;
        }else{
            lnQuebraSitemaLoja = `<label style="color: blue;">` + mascaraValor(VrQuebrasistemaLoja.toFixed(2)) + `</label>`;
        }
        
        if(VrQuebraLancadoLoja < 0){
            lnQuebraLancadoLoja = `<label style="color: red;">-` + mascaraValor(VrQuebraLancadoLoja.toFixed(2)) + `</label>`;
        }else{
            lnQuebraLancadoLoja = `<label style="color: blue;">` + mascaraValor(VrQuebraLancadoLoja.toFixed(2)) + `</label>`;
        }

		var tableQuebraLoja = $('#dt-basic-quebraloja').DataTable();

		tableQuebraLoja.row.add([
            `<label style="color: blue;">` + contadorQuebraLoja + `</label>`,
            `<label style="color: blue;">` + DTLancamento + `</label>`,
            `<label style="color: blue;">` + IDMovQuebraLoja + `</label>`,
            `<label style="color: blue;">` + NomeFuncQuebra + `</label>`,
            lnQuebraSitemaLoja,
            lnQuebraLancadoLoja,
            `<label style="color: blue;">` + TxtHistoricoQuebra + `</label>`,
            tagQuebraAtivo,
            tagQuebraAtivoBotao,
        ]).draw(false);
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
			
function status_Quebra_Caixa_Loja(id,status) {

    var dados = {
      "IDQUEBRACAIXA": parseInt(id),
      "STATIVO":status
    };
    
  	ajaxPut("api/dashboard/quebra-caixa/atualizacao-status.xsjs", dados)
		.then(funcSucessUpdateQuebraCaixaLoja)
		.catch(funcError);

}

function funcSucessUpdateQuebraCaixaLoja(resposta) {

	alerta_cancel_ativa_quebra_caixa();
	pesq_list_quebra();

}

function funcErrorUpdateQuebra(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateDeposito',
		showConfirmButton: false,
		timer: 15000
	}); 
}

//================ MENU LISTA PRODUTOS QUALITY ==============================================
 
function ListaProdutosQuality(){
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
            
            	//$("#idloja").select2();
    
          } 
        };
        xmlhttp.open("GET", "action_listprodutosQuality.html", true);
        xmlhttp.send();
    //}
}

function ValidarEnterQuality(e){
        var keycode = e.keyCode;
    	if(keycode == '13'){
    	    DSdesc = $("#descProduto").val();
    	    $("#descProduto").val('');
    	    $("#descProduto").focus();
    		pesq_produtosQuality(1,DSdesc);
    	}
}

function pesq_produtosQuality(numPage,descProduto){
    DSdesc = '';
    if(descProduto){
       DSdesc =  descProduto;
    }else{
        DSdesc = $("#descProduto").val();
    }
   
    dataRetornoProduto=[];
    
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
        
        ajaxGet('api/produto-sap/produto-quality.xsjs?page=' + numPage + '&codeBarsOuNome=' + DSdesc + '&IdEmpresaLoja=' + IDEmpresaLogin + '&IdListaLoja=' + IDListaEmp)
        	.then(retornoListaProdutoLojaQuality)
        	.catch(funcError);
        }
        
    };
    
    xmlhttp.open("GET", "action_pesqprodutoQuality.html", true);
    xmlhttp.send();
} 

function chamarProximaListaProdutoQuality(numPage){
    
    ajaxGet('api/produto-sap/produto-quality.xsjs?page=' + numPage + '&codeBarsOuNome=' + DSdesc + '&IdEmpresaLoja=' + IDEmpresaLogin + '&IdListaLoja=' + IDListaEmp)
        	.then(retornoListaProdutoLojaQuality)
        	.catch(funcError);
        
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaProdutoLojaQuality(respostaListaProduto) {
    var contadorProduto = 0;
    var numPageAtual = parseInt(respostaListaProduto.page);
    
    if(respostaListaProduto.data.length != 0){
        for (var i=0; i < respostaListaProduto.data.length; i++) { 
            contadorProduto ++;
            var registro = respostaListaProduto.data[i];
            
            DTUltAlteracao = registro.DTULTALTERACAO;
            CodItem = registro.IDPRODUTO;
            DsProduto = registro.DSNOME;
            CodBarras = registro.NUCODBARRAS;
            ValorVendaPDV = registro.PRECO_VENDA;
            
            dataRetornoProduto.push( [contadorProduto,
                                CodBarras,
                                DsProduto,
                                DTUltAlteracao,
                                ValorVendaPDV
                                ]);
        }
        
        chamarProximaListaProdutoQuality(numPageAtual + 1); 
    }
    else{
        $('#resultado').html(
            `<table id="dt-basic-produto-loja" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>*</th>
                            <th>Cód Barras</th>
                            <th>Descrição</th>
                            <th>Data Alteração</th>
                            <th>Venda PDV</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListProduto">
                    </tbody>
                    <tfoot class="thead-themed totalProduto">
                    </tfoot>
                </table>`
        );
	   
	   $('#dt-basic-produto-loja').DataTable( {
            data: dataRetornoProduto,
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


 //================ MENU LISTA PRODUTOS SAP ==============================================
 
function ListaProdutosSAP(){
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
            
            	//$("#idloja").select2();
    
          } 
        };
        xmlhttp.open("GET", "action_listprodutosSAP.html", true);
        xmlhttp.send();
    //}
}

function ValidarEnterSAP(e){
        var keycode = e.keyCode;
    	if(keycode == '13'){
    		pesq_produtosSAP(1);
    	}
}

function pesq_produtosSAP(numPage){

    var DSdesc = $("#descProduto").val(); 
    dataRetornoProduto=[];
    
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
        
        ajaxGet('api/produto-sap/produto-sap.xsjs?page=' + numPage + '&codeBarsOuNome=' + DSdesc + '&IdEmpresaLoja=' + IDEmpresaLogin + '&IdListaLoja=' + IDListaEmp)
        	.then(retornoListaProdutoLojaSAP)
        	.catch(funcError);
        }
        
    };
    
    xmlhttp.open("GET", "action_pesqprodutoSAP.html", true);
    xmlhttp.send();
} 

function chamarProximaListaProdutoSAP(numPage){
    
    var DSdesc = $("#descProduto").val();

        ajaxGet('api/produto-sap/produto-sap.xsjs?page=' + numPage + '&codeBarsOuNome=' + DSdesc + '&IdEmpresaLoja=' + IDEmpresaLogin + '&IdListaLoja=' + IDListaEmp)
        	.then(retornoListaProdutoLojaSAP)
        	.catch(funcError);
        
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaProdutoLojaSAP(respostaListaProduto) {
    var contadorProduto = 0;
    var numPageAtual = parseInt(respostaListaProduto.page);
    
    if(respostaListaProduto.data.length != 0){
        for (var i=0; i < respostaListaProduto.data.length; i++) { 
            contadorProduto ++;
            var registro = respostaListaProduto.data[i];
            
            DTUltAlteracao = registro.DATA_ULTIMA_ALTERACAO_PDV;
            CodItem = registro.CODIGO_ITEM;
            DsProduto = registro.DESCRICAO_ITEM;
            CodBarras = registro.CODIGO_BARRAS;
            ValorVendaPDV = registro.PRECO_VENDA_PDV;
            ValorVendaSAP = registro.PRECO_VENDA_SAP;

            dataRetornoProduto.push( [contadorProduto,
                                CodBarras,
                                DsProduto,
                                DTUltAlteracao,
                                ValorVendaPDV,
                                ValorVendaSAP
                                ]);
        }
        
        chamarProximaListaProdutoSAP(numPageAtual + 1); 
    }
    else{
        $('#resultado').html(
            `<table id="dt-basic-produto-loja" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th>*</th>
                            <th>Cód Barras</th>
                            <th>Descrição</th>
                            <th>Data Alteração</th>
                            <th>Venda PDV</th>
                            <th>Venda SAP</th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListProduto">
                    </tbody>
                    <tfoot class="thead-themed totalProduto">
                    </tfoot>
                </table>`
        );
	   
	   $('#dt-basic-produto-loja').DataTable( {
            data: dataRetornoProduto,
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

 //================ MENU LISTA VENDA LOJA ==============================================
 
function ListaVendasLoja(){
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
            
            	$("#idmarca").select2();
            	
                $('.DescTituloListaVendas').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas da Loja - <span class='fw-300'></span>`);
          } 
        };
        xmlhttp.open("GET", "action_listvendaslojas.html", true);
        xmlhttp.send();
    //}
}

function pesq_vendas_lojas(){

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
      
        ajaxGet('api/dashboard/venda/venda-loja-periodo.xsjs?pageSize=500&idLoja=' + IDEmpresaLogin + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasLojas)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "action_pesqvendaslojas.html", true);
    xmlhttp.send();
} 

function retornoListaVendasLojas(respostaListaVendasLojas) {

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
        totalVrTotalPagoVenda = 0;
        
    if(respostaListaVendasLojas.data.length != 0){
    	for (var i = 0; i < respostaListaVendasLojas.data.length; i++) {

    	    idEmpresa = respostaListaVendasLojas.data[i]['IDEMPRESA'];
            noFantasia = respostaListaVendasLojas.data[i]['NOFANTASIA'];
            vrRecebidoDinheiro = respostaListaVendasLojas.data[i]['VRDINHEIRO'];
            vrRecebidoCartao = respostaListaVendasLojas.data[i]['VRCARTAO'];
            vrRecebidoPos = respostaListaVendasLojas.data[i]['VRPOS'];
            vrRecebidoConvenio = respostaListaVendasLojas.data[i]['CONVENIO'];
            vrRecebidoVoucher = respostaListaVendasLojas.data[i]['VOUCHER'];
            vrRecebidoFatura = respostaListaVendasLojas.data[i]['VRFATURA'];
            vrDespesa = respostaListaVendasLojas.data[i]['VRDESPESA'];
            vrAdiantamentoSalario = respostaListaVendasLojas.data[i]['VRADIANTAMENTOSALARIO'];
            vrFisicoDinMarca = respostaListaVendasLojas.data[i]['VRFISICODINHEIRO'];
            vrRecebidoDinMarca = respostaListaVendasLojas.data[i]['VRRECDINHEIRO'];
            qtdVendas = respostaListaVendasLojas.data[i]['QTDVENDA'];
            
            vrTotalPagoVenda = respostaListaVendasLojas.data[i]['VRTOTALPAGO'];

            vrDespesaTotal = parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoCartao) + parseFloat(vrRecebidoPos) + parseFloat(vrRecebidoConvenio);
            vrDisponivelBrutoVoucher = parseFloat(vrDisponivelBruto);
            
            vrQuebraCaixaMarca = parseFloat(vrRecebidoDinMarca) - parseFloat(vrFisicoDinMarca);
            
            vrTotalQuebraMarca = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);
            vrTotalQuebraVoucherMarca = parseFloat(vrDisponivelBrutoVoucher) - parseFloat(vrDespesaTotal);
            vrDisponivel = parseFloat(vrDisponivelBrutoVoucher);//verificar divergencia
            
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
            
            totalVrTotalPagoVenda =  parseFloat(totalVrTotalPagoVenda) + parseFloat(vrTotalPagoVenda);
            
            VrTicketM = (parseFloat(vrDisponivel)/parseFloat(qtdVendas));
            TotalTicketM = (parseFloat(totalVrDisponivel)/parseFloat(totalQtdVenda));
            
			$('#resultadoVendaLojaPeriodo').append(
				`<tr>
                    <td><label style="color: blue; font-size: 11px;">` + idEmpresa +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + noFantasia +	`</label></td>
                    <td style="text-align: right;"><label style="color: green;">` + (parseFloat(qtdVendas)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalPagoVenda).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(VrTicketM).toFixed(2)) +	`</label></td>
                </tr>`
			);
			
            $('#totalResultadoVendaLojaPeriodo').html(
        		`<tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right;">` + (parseFloat(totalQtdVenda)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrTotalPagoVenda).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(TotalTicketM).toFixed(2)) + `</th>
                </tr>`
        	);
    	}

    }

}

//================ VENDAS VENDEDORES DA LOJA ==============================================
 
function ListaVendasVendedorLoja(){
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
    
                $('.DescTituloListaVendas').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas por Vendedor - <span class='fw-300'></span>`);
    
          }
        };
        xmlhttp.open("GET", "action_listvendasvendedor.html", true);
        xmlhttp.send();
    //}
}

function pesq_vendas_vendedor_loja(){

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
       
        
        ajaxGet('api/dashboard/venda/venda-vendedor.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasVendedorLoja)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "action_pesqvendasvendedor.html", true);
    xmlhttp.send();
} 

function retornoListaVendasVendedorLoja(retornoListaVendasVendedor) {

	var QTDProduto = 0;
	var VrVendido = 0;
	var VrVoucher = 0;
	var TotalVendaVendedor = 0;
	var TotalVoucherVendedor = 0;
	var VrVendidoVendedor = 0;
	var TotalLiqVendidoVendedor = 0;
	var ContadorVendedor = 0;
    
    $('#resultadoListVendedorLoja').html('');
    
    $('#dt-buttons-vendas-vendedor-loja').DataTable().destroy();

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
		
		$('#dt-buttons-vendas-vendedor-loja').find('tbody').append(`<tr>
                <td><label style="color: blue; font-size: 11px;">` + ContadorVendedor +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NomeEmpresa +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NumMatricula +	`</label></td>
                <td><label style="color: blue; font-size: 11px;">` + NomeVendedor +	`</label></td>
                <td style="text-align: center;"><label style="color: blue;">` + QTDProduto + `</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVendido.toFixed(2)) +	`</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVoucher.toFixed(2)) +	`</label></td>
                <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(VrVendidoVendedor.toFixed(2)) +	`</label></td>
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
	$('#dt-buttons-vendas-vendedor-loja').DataTable({
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
                className: 'btn-outline-success btn-sm mr-1'
            },
            {
                extend: 'print',
                text: 'Imprimir',
                titleAttr: 'Imprimir Tabela',
                className: 'btn-outline-primary btn-sm'
            }
        ]}).draw();
		
		$('.totalVendedoresloja').html(
			`<tr>
                <th colspan="5" style="text-align: center;">Total Vendas</th>
                <th style="text-align: right;">${mascaraValor(TotalVendaVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalVoucherVendedor.toFixed(2))}</th>
                <th style="text-align: right;">${mascaraValor(TotalLiqVendidoVendedor.toFixed(2))}</th>
            </tr>`
		);
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

function retornoListaSubGrupoPreco(respostaListaSubGruposPreco) {
  var listaSubGrupos = respostaListaSubGruposPreco.data;
  var IDGrupoAnterior = '';
  var codHtml = `
    <li class="select-all-container">
      <input type="checkbox" id="select-all" class="select-all-global">
      <label for="select-all">Selecionar Tudo</label>
    </li>`;

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
        <ul class="custom-option-container" data-group-id="${IDGrupo}">`;
      codHtml += `
        <li class="custom-option" data-group-id="${IDGrupo}">
          <input type="checkbox" id="option-${IDGrupo}-${IDSubGrupo}" name="options" value="${IDSubGrupo}">
          <label for="option-${IDGrupo}-${IDSubGrupo}"> ${DSSubGrupo}</label>
        </li>`;
    }

    IDGrupoAnterior = IDGrupo;
  }

  if (IDGrupoAnterior !== '') {
    codHtml += `</ul></li>`;
  }

  $('#custom-select').html(codHtml);

  // Adiciona evento para os checkboxes de seleção de todos os itens do grupo
  $('.select-all-group').on('change', function() {
    var groupId = $(this).data('group-id');
    var isChecked = $(this).is(':checked');
    $(`li[data-group-id='${groupId}'] input[type='checkbox']`).prop('checked', isChecked);

    // Atualiza a lista global de grupos selecionados
    if (isChecked) {
      if (!selectedGroups.includes(groupId)) {
        selectedGroups.push(groupId);
      }
    } else {
      selectedGroups = selectedGroups.filter(id => id !== groupId);
    }
  });

  // Adiciona evento para expandir/recolher grupos
  $('.custom-optgroup').on('click', function() {
    var groupId = $(this).data('group-id');
    $(this).toggleClass('expanded');
    $(`.custom-option-container[data-group-id='${groupId}']`).slideToggle();
  });

  // Adiciona evento para os checkboxes dos subgrupos
  $('input[name="options"]').on('change', function() {
    var subgrupoId = $(this).val();
    if ($(this).is(':checked')) {
      if (!selectedSubgroups.includes(subgrupoId)) {
        selectedSubgroups.push(subgrupoId);
      }
    } else {
      selectedSubgroups = selectedSubgroups.filter(id => id !== subgrupoId);
    }
  });

  // Adiciona evento para o checkbox "Selecionar Tudo"
  $('#select-all').on('change', function() {
    var isChecked = $(this).is(':checked');
    $('input[type="checkbox"]').prop('checked', isChecked);

    // Atualiza as listas globais
    if (isChecked) {
      selectedGroups = [...new Set($('.custom-optgroup').map((_, el) => $(el).data('group-id')).get())];
      selectedSubgroups = [...new Set($('input[name="options"]').map((_, el) => $(el).val()).get())];
    } else {
      selectedGroups = [];
      selectedSubgroups = [];
    }
  });
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

function pesqListaSubGrupoPorGrupoAlteracaoPreco(){
  idGrupo = $("#idgrupograde").val();
ajaxGet('api/comercial/subgrupo-produto.xsjs')
        .then(retornoListaSubGrupoAlteracaoPreco)
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

function ListaRelatoriosEstrutura(){
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
    
            	//$("#idmarca").select2();
            	//$("#idloja").select2(); 
            	$("#idgrupograde").select2();
            	$("#idgrade").select2();
            	$("#idforn").select2(); 
            	$("#idmarcaproduto").select2(); 
            	
            	 $('.DescTituloListaVendas').html(
    			`<i class='subheader-icon fal fa-chart-area'></i> Relatório das Vendas - <span class='fw-300'></span>`);
    			
    			 /*ajaxGet('api/informatica/marca.xsjs')
            		.then(retornoListaMarcaSelect)
            		.catch(funcError);*/
            
            	/*ajaxGet('api/comercial/empresa.xsjs')
                	.then(retornoListaEmpresasSelect)
                	.catch(funcError);	*/
                	
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
        xmlhttp.open("GET", "gerencial_action_listvendasrelestrutura.html", true);
        xmlhttp.send();
    //}
}
/////////////////////////////////////////////////////////////
//VENDAS POR VENDEDOR/////////////////////////////////////
function pesq_vendas_vendedor(numPage){
    dataRetorno=[];
    contador = 0;
    
    var IDMarcaPesqVenda = 0;
    var IDLojaPesqVenda = IDEmpresaLogin;
    var UFPesquisa = 0;
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDMarca = $("#idmarcaproduto").val();
  
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
      
        ajaxGet('api/comercial/vendas-vendedor-estrutura.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasPorVendedor)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendasPorVendedor(numPage){
    
    var IDMarcaPesqVenda = 0;
    var IDLojaPesqVenda = IDEmpresaLogin;
    var UFPesquisa = 0;
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDMarca = $("#idmarcaproduto").val();

  	/*var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });*/
    
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
/////////////////////////PESQUISA VENDAS POR ESTRUTUTA TABELA SOMATORIO////////////////////
function pesq_vendas_estrutura_indicadores(numPage){
    dataRetorno=[];
    totalVrProduto = 0;
    totalVrDesconto = 0;
    totalVrNF = 0;
    totalQTDProduto = 0;
    contador = 0;
    
    var IDMarcaPesqVenda = 0;
    var IDLojaPesqVenda = IDEmpresaLogin;
    var UFPesquisa = 0;
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
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
      
        ajaxGet('api/comercial/vendas-por-estrutura.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idMarca=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasEstruturaIndicadores)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendas_estrutura_indicadores(numPage){
    
    var IDMarcaPesqVenda = 0;
    var IDLojaPesqVenda = IDEmpresaLogin;
    var UFPesquisa = 0;
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = $("#idgrade").val();
    var IDMarca = $("#idmarcaproduto").val();
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	/*var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });*/
    
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
           var totalQuantidade2 = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['QTD'];
            vlTotalCustoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALCUSTO'];
            vlTotalBrutoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALBRUTO'];
            vlTotalDescontoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['TOTALDESCONTO'];
            vlTotalLiquidoProduto = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['VRTOTALLIQUIDO'];
            vlVoucher = respostaListaVendasPeriodoConsolidado.data[i]['vendaMarca']['VLVOUCHER'];
            vlTotalVendaProdutoLiquida = parseFloat(vlTotalLiquidoProduto) - parseFloat(vlVoucher);
            marckupProduto = ((parseFloat(vlTotalLiquidoProduto) / parseFloat(vlTotalCustoProduto)) - 1)*100;
            indicadorMarckupProduto = ((parseFloat(marckupProduto)/100)); 
            indicadorVendaProduto = (parseFloat(vlTotalLiquidoProduto) / parseFloat(vlTotalCustoProduto));
            margemProduto = (parseFloat(vlTotalLiquidoProduto) - parseFloat(vlTotalCustoProduto)); 
            curstopercProduto = ((parseFloat(vlTotalCustoProduto)*100)/parseFloat(vlTotalLiquidoProduto));
            margempercProduto = 100 - ((parseFloat(vlTotalCustoProduto)*100)/parseFloat(vlTotalLiquidoProduto));
            percDescontoProduto = ((parseFloat(vlTotalDescontoProduto)/(parseFloat(vlTotalBrutoProduto)+parseFloat(vlTotalDescontoProduto))) * 100);
            if(percDescontoProduto > 0){ percDescontoProduto = percDescontoProduto - 0.01;}

                dataRetorno.push( [contador,
                                noFantasia,
                                dsGrupo,
                                dsSubGrupo,
                                dsMarca,
                                NuCodBarras,
                                dsProduto,
                                totalQuantidade2,
                                parseFloat(vlTotalBrutoProduto).toFixed(2),
                                parseFloat(vlTotalDescontoProduto).toFixed(2),
                                percDescontoProduto.toFixed(2),
                                parseFloat(vlTotalLiquidoProduto).toFixed(2),
                                parseFloat(vlVoucher).toFixed(2),
                                parseFloat(vlTotalVendaProdutoLiquida).toFixed(2)
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
                        <th>Venda Bruta(-Desc)</th>
                        <th>Voucher(R$)</th>
                        <th>Venda Líquida(R$)</th>
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
            totalqtdprod = api.column( 7 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalqtdCliente = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalqtdProduto = api.column( 9 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVenda = api.column( 11 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVoucher = api.column( 12 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            totalVendProdLiquida = api.column( 13 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
                        
 
            // Total over this page
            pageTotallqtdprod = api.column( 7, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotallqtdCliente = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotallqtdProduto = api.column( 9, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVenda = api.column( 11, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVoucher = api.column( 12, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            pageTotalVendProdLiquida = api.column( 13, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );
            
            
            // Update footer
             $( api.column( 7 ).footer() ).html(pageTotallqtdprod +' ('+ totalqtdprod+' total )');
            $( api.column( 8 ).footer() ).html(pageTotallqtdCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalqtdCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 9 ).footer() ).html(pageTotallqtdProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalqtdProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 11 ).footer() ).html(pageTotalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 12 ).footer() ).html(pageTotalVoucher.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVoucher.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
            $( api.column( 13 ).footer() ).html(pageTotalVendProdLiquida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalVendProdLiquida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
           
            
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
////////////////////PESQUISA VENDA LOJA PRODUTOS////////////////////////
function pesq_vendas_estrutura_produtos(numPage){
    dataRetorno=[];
    
    var IDLojaPesqVenda = IDEmpresaLogin;
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
      
        ajaxGet('api/comercial/vendas-por-produto.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idEmpresa=' + IDLojaPesqVenda )
        	.then(retornoListaVendasEstruturaProdutos)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaVendas_estrutura_produtos(numPage){
    
    var IDLojaPesqVenda = IDEmpresaLogin;
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();

  	/*var IDLojaPesqVenda = [];
    $('#idloja option:selected').each(function (index, el) {
        IDLojaPesqVenda.push($(el).val());
    });*/
    
        ajaxGet('api/comercial/vendas-por-produto.xsjs?page='+numPage+'&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idEmpresa=' + IDLojaPesqVenda )
        .then(retornoListaVendasEstruturaProdutos)
        .catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaVendasEstruturaProdutos(respostaListaVendasEstruturaProdutos) {
                    
    var numPageAtual = parseInt(respostaListaVendasEstruturaProdutos.page);
    if(respostaListaVendasEstruturaProdutos.data.length != 0){
        for (var i=0; i < respostaListaVendasEstruturaProdutos.data.length; i++) { 
            var registro = respostaListaVendasEstruturaProdutos.data[i];
            idVenda = respostaListaVendasEstruturaProdutos.data[i]['vendaMarca']['IDVENDA'];
            dsGrupo = respostaListaVendasEstruturaProdutos.data[i]['vendaMarca']['GRUPO'];
            dsSubGrupo = respostaListaVendasEstruturaProdutos.data[i]['vendaMarca']['SUBGRUPO'];
            dsMarca = respostaListaVendasEstruturaProdutos.data[i]['vendaMarca']['MARCA'];
            NuCodBarras = respostaListaVendasEstruturaProdutos.data[i]['vendaMarca']['NUCODBARRAS'];
            dsProduto = respostaListaVendasEstruturaProdutos.data[i]['vendaMarca']['DSNOME'];
            Quantidade = respostaListaVendasEstruturaProdutos.data[i]['vendaMarca']['QTD'];
            totalQuantidade =  respostaListaVendasEstruturaProdutos.data[i]['vendaMarca']['TOTAL'];
            venda = idVenda +' -> Total Produtos Vendidos -> '+ totalQuantidade;
            dataRetorno.push( [venda,
                                dsProduto,
                                NuCodBarras,
                                dsGrupo,
                                dsSubGrupo,
                                dsMarca,
                                Quantidade
                            ])
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
       chamarProximaListaVendas_estrutura_produtos(numPageAtual + 1); 
    }
    else{
         $('#resultado').html(
            `<table id="dt-basic-venda-produto" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>Venda</th>
                        <th>Produto</th>
                        <th>Cód. Barras</th>
                        <th>Grupo</th>
                        <th>SubGrupo</th>
                        <th>Marca</th>
                        <th>Qtd.</th>
                    </tr>
                </thead>
                <tbody id="resultadoVendaProduto">
                </tbody>
                
            </table>`
        );
	   var groupColumn = 0;
	    $('#dt-basic-venda-produto').DataTable( {
	        data: dataRetorno,
            "columnDefs": [
                { "visible": false, "targets": groupColumn }
            ],
            "order": [[ groupColumn, 'asc' ]],
            "displayLength": 25,
            "drawCallback": function ( settings ) {
                var api = this.api();
                var rows = api.rows( {page:'current'} ).nodes();
                var last=null;
     
                api.column(groupColumn, {page:'current'} ).data().each( function ( group, i ) {
                    if ( last !== group ) {
                        $(rows).eq( i ).before(
                            '<tr class="group"><td colspan="6"><b>'+group+'</b></td></tr>'
                        );
     
                        last = group;
                    }
                } );
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
        // Order by the grouping
        $('#dt-basic-venda-consolidada tbody').on( 'click', 'tr.group', function () {
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

/////////////////////////////////////////////////////////////
//PRODUTOS MAIS VENDIDOS/////////////////////////////////////
function pesq_vendas_produtos_mais_vendidos(numPage){
    dataRetorno=[];
    totalVrProduto = 0;
    totalVrDesconto = 0;
    totalVrNF = 0;
    totalQTDProduto = 0;
    contador = 0;
    
    //var IDMarcaPesqVenda = $("#idmarca").val();
    var IDLojaPesqVenda = IDEmpresaLogin;
    //var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDMarca = $("#idmarcaproduto").val();
  
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
      
        ajaxGet('api/comercial/produtos-mais-vendidos.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
        	.then(retornoListaVendasProdutosMaisVendidos)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "comercial_action_pesqvendasrel.html", true);
    xmlhttp.send();
} 

function chamarProximaListaProdutosMaisVendidos(numPage){
    
    //var IDMarcaPesqVenda = $("#idmarca").val();
    var IDLojaPesqVenda = IDEmpresaLogin;
    //var UFPesquisa = $("#ufprod").val();
    var ProdutoPesqVenda = $("#descProduto").val();
    var IDForn = $("#idforn").val();
    var IDGrupo = $("#idgrupograde").val();
    var IDGrade = ($("#idgrade").val());
    var datapesqinicio = $("#dtconsultainicio").val();
    var datapesqfim = $("#dtconsultafim").val();
    var IDMarca = $("#idmarcaproduto").val();
    
        ajaxGet('api/comercial/produtos-mais-vendidos.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade + '&idMarcaProduto='+IDMarca)
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

// ========================= INICIO EXTRATO CONTA LOJA ===

function ListaExtratoLoja() {

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

            }
        };
        xmlhttp.open("GET", "action_listextratoloja.html", true);
        xmlhttp.send();
}

function pesq_extrato_loja(numPage) {

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

            ajaxGet('api/financeiro/extrato-loja-periodo.xsjs?pageSize=500&page=' + numPage + '&idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
                .then(retornoListaExtratodaLoja)
                .catch(funcError);
        }
    };

    xmlhttp.open("GET", "action_pesqextratoloja.html", true);
    xmlhttp.send();
}
 
function retornoListaExtratodaLoja(respostaListaExtratoLojas) {
    
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

//PESQUISA VENDAS LOJA RESUMIDO
function pesq_vendas_lojas_resumido(){

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
      
        ajaxGet('api/dashboard/venda/venda-resumido.xsjs?pageSize=500&idLoja=' + IDEmpresaLogin + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
        	.then(retornoListaVendasLojasResumido)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "action_pesqvendaslojas.html", true);
    xmlhttp.send();
} 

function retornoListaVendasLojasResumido(respostaListaVendasLojas) {

        totalVrBruto = 0;
        totalVrDesconto = 0;
        totalVrVoucher = 0;
        totalVrLiquido = 0;
        TotalTicketM = 0;
        totalQtdVenda = 0;
        totalVrTotalPagoVenda = 0;
    if(respostaListaVendasLojas.data.length != 0){
    	for (var i = 0; i < respostaListaVendasLojas.data.length; i++) {

    	    idEmpresa = respostaListaVendasLojas.data[i]['IDEMPRESA'];
            noFantasia = respostaListaVendasLojas.data[i]['NOFANTASIA'];
            qtdVendas = respostaListaVendasLojas.data[i]['QTDVENDA'];
            vrTotalBrutoVenda = respostaListaVendasLojas.data[i]['TOTALBRUTO'];
            vrTotalDescontoVenda = respostaListaVendasLojas.data[i]['TOTALDESCONTO'];
            vrTotalVoucherVenda = respostaListaVendasLojas.data[i]['VRRECVOUCHER'];
            vrTotalLiquidoVenda = parseFloat(vrTotalBrutoVenda)-parseFloat(vrTotalDescontoVenda)-parseFloat(vrTotalVoucherVenda);
            VrTicketM = (parseFloat(vrTotalLiquidoVenda)/parseFloat(qtdVendas));
            //Totais
            totalQtdVenda = parseFloat(totalQtdVenda) + parseFloat(qtdVendas);
            totalVrTotalPagoVenda =  parseFloat(totalVrTotalPagoVenda) + parseFloat(vrTotalBrutoVenda);
            totalVrDesconto = parseFloat(totalVrDesconto)+vrTotalDescontoVenda;
            totalVrVoucher = parseFloat(totalVrVoucher)+vrTotalVoucherVenda;
            totalVrLiquido = parseFloat(totalVrLiquido)+vrTotalLiquidoVenda;
            TotalTicketM = (parseFloat(totalVrLiquido)/parseFloat(totalQtdVenda));

           	$('#resultadoVendaLojaPeriodo').append(
				`<tr>
                    <td><label style="color: blue; font-size: 11px;">` + idEmpresa +	`</label></td>
                    <td><label style="color: blue; font-size: 11px;">` + noFantasia +	`</label></td>
                    <td style="text-align: right;"><label style="color: green;">` + (parseFloat(qtdVendas)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalBrutoVenda).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalDescontoVenda).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalVoucherVenda).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(vrTotalLiquidoVenda).toFixed(2)) +	`</label></td>
                    <td style="text-align: right;"><label style="color: blue;">` + mascaraValor(parseFloat(VrTicketM).toFixed(2)) +	`</label></td>
                </tr>`
			);
			
            $('#totalResultadoVendaLojaPeriodo').html(
        		`<tr>
                    <th colspan="2" style="text-align: center;">Total</th>
                    <th style="text-align: right;">` + (parseFloat(totalQtdVenda)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrTotalPagoVenda).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrDesconto).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrVoucher).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(totalVrLiquido).toFixed(2)) + `</th>
                    <th style="text-align: right;">` + mascaraValor(parseFloat(TotalTicketM).toFixed(2)) + `</th>
                </tr>`
        	);
    	}

    }

}

//? ======================================== INICIO ROTINA RELATORIO DE ESTOQUE ======================================== //
// Leandro Massafera - 25/04/2022
// Atualização
// Autor: Hendryw Deyvison
// Data: 17/03/2024

function retornoListaEmpresasEstoque (dadosEmpresas){
    let { data } = dadosEmpresas || [];

    $('#idEmpresaEstoque').html(`<option value="">Todas</option>`);

    for(let { IDEMPRESA, NOFANTASIA } of data){
        $('#idEmpresaEstoque').append(`<option title="${NOFANTASIA}" value="${IDEMPRESA}">${NOFANTASIA}</option>`);
    }

    $("#idEmpresaEstoque").select2();
}

function retornoListaFornecedorEstoque(respostaListaFornecedores) {
    let { data } = respostaListaFornecedores || [];

    $('#idforn').html('');

    for (let registro of data ) {

        let IDFornecedor = registro['ID_FORNECEDOR'];
        let DSFornecedor = registro['FORNECEDOR'];
        let NrCpfCnpj = registro['CNPJ_CPF'];

        $('#idforn').append( `<option value="${IDFornecedor}">${NrCpfCnpj} - ${DSFornecedor}</option>`);
    }

    $('#idforn').select2();

}

function retornoListaGrupoEstoque(respostaListaGrupos) {
    let { data } = respostaListaGrupos || [];

    $("#idgrupograde, #idgrade, #idmarcaproduto, #idforn, #idgrupograde").empty();
    $('#idgrupograde').html('');

    for (let registro of data) {

        let IDGrupo = registro['ID_GRUPO'];
        let DSGrupo = registro['GRUPO'];

        $('#idgrupograde').append(`<option value="${IDGrupo}">${DSGrupo}</option>`);
    }

    $('#idgrupograde').select2();
}

async function retornoListaSubGrupoEstoque(respostaListaSubGrupos) {
    try{
        let { data } = respostaListaSubGrupos || [];
        let IDGrupoAnterior = '';
        let codHtml = '';

        $("#idgrade, #idmarcaproduto, #idforn").empty();

        if ($('#idgrupograde').val()?.length > 0){
            await pesqListaMarcaPorSubGrupoEstoque();
            await pesqListaFornecedorPorMarcaEstoque();
        }

        for (let registro of data) {

            let IDSubGrupo = registro['ID_ESTRUTURA'];
            let DSSubGrupo = registro['ESTRUTURA'];
            let IDGrupo = registro['ID_GRUPO'];
            let DSgrupoGrade = '';

            if (IDGrupo === '1') {
                DSgrupoGrade = 'Verão';
            } else if (IDGrupo === '2') {
                DSgrupoGrade = 'Calçados/Acessórios';
            } else if (IDGrupo === '3') {
                DSgrupoGrade = 'Cama/Mesa/Banho';
            } else if (IDGrupo === '4') {
                DSgrupoGrade = 'Utilidades Do Lar';
            } else if (IDGrupo === '5') {
                DSgrupoGrade = 'Diversos';
            } else if (IDGrupo === '6') {
                DSgrupoGrade = 'Artigos Esportivos';
            } else if (IDGrupo === '7') {
                DSgrupoGrade = 'Cosméticos';
            } else if (IDGrupo === '8') {
                DSgrupoGrade = 'Acessórios';
            } else if (IDGrupo === '9') {
                DSgrupoGrade = 'Peças Íntimas';
            } else if (IDGrupo === '10') {
                DSgrupoGrade = 'Inverno';
            }

            if (IDGrupo == IDGrupoAnterior) {
                codHtml += `<option value="${IDSubGrupo}"> ${DSSubGrupo}</option>`;
            } else {
                if (IDGrupoAnterior !== '') {
                    codHtml += `</optgroup>`;
                }
                codHtml += `<optgroup label="${DSgrupoGrade.toUpperCase()}">`;
                codHtml += `<option value="${IDSubGrupo}"> ${DSSubGrupo}</option>`;
            }

            IDGrupoAnterior = IDGrupo;
        }

        $('#idgrade').html(codHtml).select2();

    } catch(error){
        msgError();
        console.log(error);
    }
}

async function retornoListaMarcaEstoque(respostaListaMarca) {
    try{
        let{ data } = respostaListaMarca || [];

        $("#idmarcaproduto, #idforn").empty();

        if ($('#idgrade').val()?.length > 0) {
            await pesqListaFornecedorPorMarcaEstoque();
        }

        $('#idmarcaproduto').html('');

        let marcasUnicas = new Set();

        for (let registro of data) {

            let IDMarca = registro['ID_MARCA'];
            let DSMarca = registro['MARCA'];

            if (!marcasUnicas.has(IDMarca)) {
                marcasUnicas.add(IDMarca);
                
                $('#idmarcaproduto').append(`<option value="${IDMarca}">${DSMarca}</option>`);
            }
        }

        $('#idmarcaproduto').select2();

    } catch(error){
        msgError();
        console.log(error);
    }
}

async function pesqListaSubGrupoPorGrupoEstoque() {
    try{
        let idGrupo = $("#idgrupograde").val();

        await ajaxGetAllData('api/comercial/subgrupo-produto.xsjs?idGrupo=' + idGrupo)
            .then(retornoListaSubGrupoEstoque)
            .catch((error)=>{ throw error });

    } catch (error) {
        msgError();
        console.log(error);
    }
}

async function pesqListaMarcaPorSubGrupoEstoque() {
    try{
        let idSubGrupo = $("#idgrade").val();
        
        await ajaxGetAllData('api/comercial/marca-produto.xsjs?idSubGrupo=' + idSubGrupo)
            .then(retornoListaMarcaEstoque)
            .catch((error) => { throw error });

    } catch (error) {
        msgError();
        console.log(error);
    }
}

async function pesqListaFornecedorPorMarcaEstoque() {
    try{
        let idMarca = $("#idmarcaproduto").val();

        return ajaxGetAllData('api/comercial/fornecedor-produto.xsjs?idMarca=' + idMarca)
            .then(retornoListaFornecedorEstoque)
            .catch((error) => { throw error });

    } catch (error) {
        msgError();
        console.log(error);
    }
}

async function ListaEstoque() {
    try{
        animationLoadingStart();

        let userSession = (await getCurrentUser())?.user;
        let idGrupoEmpresarial = userSession?.IDSUBGRUPOEMPRESARIAL;
        let idEmpresaUser = userSession?.IDEMPRESA;

        await $.get("gerencial_action_estoque.html", async (respHtml) => $('#js-page-content').html(respHtml)).catch((error)=>{ throw error });

        await ajaxGetAllData(`api/empresa.xsjs?idSubGrupoEmpresa=${idGrupoEmpresarial}`, false)
            .then(retornoListaEmpresasEstoque)
            .catch((error) => { throw error });

        await ajaxGetAllData('api/comercial/fornecedor-produto.xsjs', false)
            .then(retornoListaFornecedorEstoque)
            .catch((error)=>{ throw error });

        await ajaxGetAllData('api/comercial/grupo-produto.xsjs', false)
            .then(retornoListaGrupoEstoque)
            .catch((error)=>{ throw error });

        await ajaxGetAllData('api/comercial/subgrupo-produto.xsjs', false)
            .then(retornoListaSubGrupoEstoque)
            .catch((error)=>{ throw error });

        await ajaxGetAllData('api/comercial/marca-produto.xsjs', false)
            .then(retornoListaMarcaEstoque)
            .catch((error)=>{ throw error });

        $("#idEmpresaEstoque, #idgrupograde, #idgrade, #idforn, #idmarcaproduto").select2();

        $("#idEmpresaEstoque").val(idEmpresaUser).trigger('change');

        // EVENTOS SELECT`S 
        $("#idgrupograde").on("change", function (e) { pesqListaSubGrupoPorGrupoEstoque(); });
        $("#idgrade").on("change", function (e) { pesqListaMarcaPorSubGrupoEstoque(); });
        $("#idmarcaproduto").on("change", function (e) { pesqListaFornecedorPorMarcaEstoque(); });

        animationLoadingStop();

        setTimeout(() => $("#descProduto").focus(), 1000);

    } catch(error){
        msgError();
        console.log(error);
    }
   
}

/// ESTOQUE ATUAL
async function estoqueatual(numPage) {
    try {
        let userSession = (await getCurrentUser())?.user;
        let idGrupoEmpresarial = userSession?.IDSUBGRUPOEMPRESARIAL;
        let idempresa = $("#idEmpresaEstoque").val() || '';
        let idgrupo = $("#idgrupograde").val() || '';
        let idsubgrupo = $("#idgrade").val() || '';
        let idmarca = $("#idmarcaproduto").val() || '';
        let idfornecedor = $("#idforn").val() || '';
        let descproduto = $("#descProduto").val() || '';
        let dtinicial = '';
        let dtfinal = '';
        let stativo = 'True';

        if (idempresa?.length <= 0 && descproduto.length <= 0) {
            return msgWarning('Digite a descrição ou o código de barras do PRODUTO e tente novamente!')
        }

        await ajaxGetAllData('api/administrativo/inventariomovimento.xsjs?idGrupoEmpresarial=' + idGrupoEmpresarial + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&idmarca=' + idmarca + '&idfornecedor=' + idfornecedor + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial + '&dtfinal=' + dtfinal + '&stativo=' + stativo)
            .then(retornoListaEstoqueAtual)
            .catch((error) => { throw error });

    } catch (error) {
        msgError();
        console.log(error);
    }
}

function retornoListaEstoqueAtual(respostaListaEstoqueAtual) {
    let { data } = respostaListaEstoqueAtual || [];
    let dataRetorno = [];
    let contador = 0;

    for (let registro of data) {
        let noFantasia = registro.NOFANTASIA;
        let cCodBarras = registro.NUCODBARRAS;
        let cProduto = registro.DSPRODUTO;
        let cFornecedor = registro.IDRAZAO_SOCIAL_FORNECEDOR + ' - ' + registro.RAZAO_SOCIAL_FORNECEDOR;
        let nEstoque = registro.QTDFINAL;
        let vCusto = parseFloat(registro.PRECOCUSTO).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        let vVenda = parseFloat(registro.PRECOVENDA).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        let vTotalCusto = parseFloat(nEstoque * parseFloat(registro.PRECOCUSTO)).toFixed(2);
        let vTotalVenda = parseFloat(nEstoque * parseFloat(registro.PRECOVENDA)).toFixed(2);
        let nMarkup = parseFloat(((parseFloat(registro.PRECOVENDA) * 100) / parseFloat(registro.PRECOCUSTO)) - 100).toFixed(2);

        contador++;

        dataRetorno.push([
            contador,
            noFantasia,
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

    $('#resultado').html(
        `<div class="row">
            <div class="col-xl-12">
                <div id="panel-1" class="panel">
                    <div class="panel-hdr">
                        <h2>Relatório Estoque Atual</h2>
                        <div class="panel-toolbar">
                            <button class="btn btn-panel" data-action="panel-collapse" data-toggle="tooltip" data-offset="0,10"
                            data-original-title="Recolher"></button>
                        </div>
                    </div>
                    <div class="panel-container show">
                        <div class="panel-content">
                            <div>
                                <table id="dt-basic-estoque-atual" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                                    <thead class="bg-primary-600">
                                        <tr>
                                            <th>#</th>
                                            <th>Loja</th>
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
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
    );

    $('#dt-basic-estoque-atual').DataTable({
        data: dataRetorno,
        "footerCallback": function (row, data, start, end, display) {
            var api = this.api(), data;
            // Remove the formatting to get integer data for summation
            var intVal = function (i) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '') * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };

            // Total over all pages
            totalEstoque = api.column(4).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            totalGeralCusto = api.column(7).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            totalGeralVenda = api.column(8).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            //totalMarkup = api.column( 8 ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

            // Total over this page
            pageTotalEstoque = api.column(4, { page: 'current' }).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            pageTotalGeralCusto = api.column(7, { page: 'current' }).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            pageTotalGeralVenda = api.column(8, { page: 'current' }).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            //pageTotalMarkup = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {return intVal(a) + intVal(b);}, 0 );

            // Update footer
            $(api.column(4).footer()).html(pageTotalEstoque + ' (' + totalEstoque + ' total )');
            $(api.column(7).footer()).html(pageTotalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' (' + totalGeralCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' total )');
            $(api.column(8).footer()).html(pageTotalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' (' + totalGeralVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' total )');
            //$( api.column( 8 ).footer() ).html(pageTotalMarkup.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' ('+ totalMarkup.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) +' total )');
        },
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

/// ESTOQUE ROTATIVIDADE
async function estoquerotatividade(numPage) {
    try{
        let userSession = (await getCurrentUser())?.user;
        let idGrupoEmpresarial = userSession?.IDSUBGRUPOEMPRESARIAL;
        let idempresa = $("#idEmpresaEstoque").val() || '';;
        let idgrupo = $("#idgrupograde").val() || '';
        let idsubgrupo = $("#idgrade").val() || '';
        let idmarca = $("#idmarcaproduto").val() || '';
        let idfornecedor = $("#idforn").val() || '';
        let descproduto = $("#descProduto").val() || '';
        let dtinicial = $("#dtconsultainicio").val() || '';
        let dtfinal = $("#dtconsultafim").val() || '';
        let stativo = '';

        if (idempresa?.length <= 0 && descproduto.length <= 0) {
            return msgWarning('Digite a descrição ou o código de barras do PRODUTO e tente novamente!')
        }

        await ajaxGetAllData('api/administrativo/inventariomovimento.xsjs?idGrupoEmpresarial=' + idGrupoEmpresarial + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&idmarca=' + idmarca + '&idfornecedor=' + idfornecedor + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial + '&dtfinal=' + dtfinal + '&stativo=' + stativo)
            .then(retornoListaEstoqueRotatividade)
            .catch((error) => { throw error });

    } catch (error) {
        msgError();
        console.log(error);
    }
}

function retornoListaEstoqueRotatividade(respostaListaEstoqueRotatividade) {
    let { data } = respostaListaEstoqueRotatividade || [];
    let contador = 0;
    let dataRetorno = [];
    let groupColumn = 0;

    for (let registro of data ) {
        let noFantasia = registro.NOFANTASIA;
        let cProduto = ': ' + registro.NUCODBARRAS + ' - ' + registro.DSPRODUTO + ' / Custo R$ ' + parseFloat(registro.PRECOCUSTO).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' - Venda R$ ' + parseFloat(registro.PRECOVENDA).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        let DataMovimento = registro.DATAMOVIMENTO;
        let QtdInicio = registro.QTDINICIO;
        let QtdEntrada = registro.QTDENTRADA;
        let QtdEntradaVoucher = registro.QTDENTRADAVOUCHER;
        let QtdSaida = registro.QTDSAIDA;
        let QtdSaidaTransf = registro.QTDSAIDATRANSFERENCIA;
        let QtdRetAjustePed = registro.QTDRETORNOAJUSTEPEDIDO;
        let QtdAjusteBalanco = registro.QTDAJUSTEBALANCO;
        let QtdFinal = registro.QTDFINAL;

        contador++;

        dataRetorno.push([
            noFantasia,
            cProduto,
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

    $('#resultado').html(
        `<div class="row">
            <div class="col-xl-12">
                <div id="panel-1" class="panel">
                <div class="panel-hdr">
                    <h2>
                    Relatório Estoque Rotatividade
                    </h2>
                    <div class="panel-toolbar">
                    <button class="btn btn-panel" data-action="panel-collapse" data-toggle="tooltip" data-offset="0,10"
                        data-original-title="Recolher"></button>
                    </div>
                </div>
                <div class="panel-container show">
                    <div class="panel-content">
                        <div>
                            <table id="dt-basic-estoque-rotatividade" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                                <thead class="bg-primary-600">
                                    <tr>
                                        <th>Loja</th>
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
                                <tbody id="resultadoEstoqueRotatividade"></tbody>
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
                                    <th></th>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>`
    );

    $('#dt-basic-estoque-rotatividade').DataTable({
        data: dataRetorno,
        "columnDefs": [
            { "visible": false, "targets": groupColumn }
        ],
        "order": [[groupColumn, 'asc'], [1, 'asc']],
        "drawCallback": function (settings) {
            var api = this.api();
            var rows = api.rows({ page: 'current' }).nodes();
            var last = null;

            api.column(groupColumn, { page: 'current' }).data().each(function (group, i) {
                if (last !== group) {
                    $(rows).eq(i).before(
                        '<tr class="group"><td colspan="10"><b>' + group + '</b></td></tr>'
                    );

                    last = group;
                }
            });
        },
        "footerCallback": function (row, data, start, end, display) {
            var api = this.api(), data;

            // Remove the formatting to get integer data for summation
            var intVal = function (i) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '') * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };

            // Total over all pages
            totalEntrada = api.column(3).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            totalEntradaVoucher = api.column(4).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            totalSaida = api.column(5).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            totalSaidaTransf = api.column(6).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            totalRetAjustePed = api.column(7).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            totalAjusteBalanco = api.column(8).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);

            // Total over this page
            pageTotalEntrada = api.column(3, { page: 'current' }).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            pageTotalEntradaVoucher = api.column(4, { page: 'current' }).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            pageTotalSaida = api.column(5, { page: 'current' }).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            pageTotalSaidaTransf = api.column(6, { page: 'current' }).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            pageTotalRetAjustePed = api.column(7, { page: 'current' }).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);
            pageTotalAjusteBalanco = api.column(8, { page: 'current' }).data().reduce(function (a, b) { return intVal(a) + intVal(b); }, 0);

            // Update footer
            $(api.column(3).footer()).html(pageTotalEntrada + ' (' + totalEntrada + ' total )');
            $(api.column(4).footer()).html(pageTotalEntradaVoucher + ' (' + totalEntradaVoucher + ' total )');
            $(api.column(5).footer()).html(pageTotalSaida + ' (' + totalSaida + ' total )');
            $(api.column(6).footer()).html(pageTotalSaidaTransf + ' (' + totalSaidaTransf + ' total )');
            $(api.column(7).footer()).html(pageTotalRetAjustePed + ' (' + totalRetAjustePed + ' total )');
            $(api.column(8).footer()).html(pageTotalAjusteBalanco + ' (' + totalAjusteBalanco + ' total )');
        },
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
    
    $('#dt-basic-estoque-rotatividade tbody').on('click', 'tr.group', function () {
        var currentOrder = table.order()[0];
        if (currentOrder[0] === groupColumn && currentOrder[1] === 'asc') {
            table.order([groupColumn, 'desc']).draw();
        }
        else {
            table.order([groupColumn, 'asc']).draw();
        }
    });
}

//? ======================================== FIM ROTINA RELATORIO DE ESTOQUE ======================================== //


/// ESTOQUE BALANÇO
function estoquebalanco(numPage){

    dataRetornoPreviaBalanco = [];
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

            ajaxGet('api/administrativo/previa-balanco.xsjs?page=' + numPage + '&idempresa=' + IDEmpresaLogin)
                .then(retornoListaPreviaBalanco)
                .catch(funcError);
        }
    };

    xmlhttp.open("GET", "administrativo_action_previabalanco_modal.html", true);
    xmlhttp.send();
}

function chamarProximaListaPreviaBalanco(numPage){

    ajaxGet('api/administrativo/previa-balanco.xsjs?page=' + numPage + '&idempresa=' + IDEmpresaLogin)
        .then(retornoListaPreviaBalanco)
        .catch(funcError);
        	
}

function retornoListaPreviaBalanco(respostaListaPreviaBalanco) {
                    
    var numPageAtual = parseInt(respostaListaPreviaBalanco.page);
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
        
        chamarProximaListaPreviaBalanco(numPageAtual + 1); 
    }
    else{
        $('#resultado').html(
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
//////////////////// FIM RELATÓRIO ESTOQUE ////////////////////

//////////////////// RELATÓRIO VENDAS BI ////////////////////
// Leandro Massafera = 26/05/2022
// function ListaRelatorioBI(idrelatorio){

//     //alert("<iframe title='0091 - TO - TAGUATINGA - RANKING DE VENDA' width='1140' height='541.25' src='https://app.powerbi.com/reportEmbed?reportId=b5ab7eb7-5351-4d7b-8cbb-84635c37a080&autoAuth=true&ctid=df42a77c-eecb-4124-b94b-e868e6d9090a&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLWJyYXppbC1zb3V0aC1iLXByaW1hcnktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D' frameborder='0' allowFullScreen='true'></iframe>");

//     numPage = 1;

//     if (window.XMLHttpRequest) {
//         // code for IE7+, Firefox, Chrome, Opera, Safari
//         xmlhttp = new XMLHttpRequest();
//     } else {
//         // code for IE6, IE5
//         xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//     }

//     xmlhttp.onreadystatechange = function () {
//         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
//             document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;

//             ajaxGet('api/relatorio-bi.xsjs?page=' + numPage + '&id=' + IDEmpresaLogin + '&idrelatorio=' + idrelatorio)
//                 .then(retornoListaRelatorioBI)
//                 .catch(funcError);
//         }
//     };

//     xmlhttp.open("GET", "action_relatoriobi.html", true);
//     xmlhttp.send();
// }

function ListaRelatorioBI(idrelatorio) {
  var numPage = 1;

  var xmlhttp;
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      var pageContentElement = document.getElementById("js-page-content");
      if (pageContentElement) {
        pageContentElement.innerHTML = xmlhttp.responseText;
      } else {
        console.error('Elemento "js-page-content" não encontrado.');
      }

      ajaxGet('api/relatorio-bi.xsjs?page=' + numPage + '&id=' + IDEmpresaLogin + '&idrelatorio=' + idrelatorio)
        .then(function (respostaListaRelatorioBI) {
          if (respostaListaRelatorioBI.data.length !== 0) {
            var registro = respostaListaRelatorioBI.data[0];
            var linkOriginal = registro.LINK;

            // Abre o link em um iframe para ocultar a URL
            var iframeWindow = window.open('', '_blank');
            iframeWindow.document.write(`
              <html>
                <head><title>Relatório BI</title></head>
                <body style="margin:0;overflow:hidden;">
                  <iframe src="${linkOriginal}" style="border:none;width:100vw;height:100vh;"></iframe>
                </body>
              </html>
            `);
          }
        })
        .catch(funcError);
    }
  };

  xmlhttp.open("GET", "action_relatoriobi.html", true);
  xmlhttp.send();
}

function retornoListaRelatorioBI(respostaListaRelatorioBI) {
                    
    if(respostaListaRelatorioBI.data.length != 0){

        var registro = respostaListaRelatorioBI.data[0];
            
        IdRelatorioBI = registro.IDRELATORIOBI;
        DsNome        = registro.DSNOME;
        IdEmpresa     = registro.IDEMPRESA;
        Link          = registro.LINK;
        StAtivo       = registro.STATIVO;

        $('#resultado').html(
            `<table id="dt-basic-relatorio-bi" class="table table-bordered table-hover table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>` + DsNome + `</th>
                    </tr>
                </thead>
                <tbody id="resulmodalrelatoriobi">
                    <tr>
                        <td><iframe width="100%" height="800" frameborder="0" allowFullScreen="true" src="` + Link + `"></iframe></td>
                    </tr>
                </tbody>
            </table>`
        );
    }
}
//////////////////// FIM RELATÓRIO VENDAS BI ////////////////////

//? ======================================================== INICIO ROTINA ORDEM DE TRANSFERENCIA  ======================================================== //
// Leandro Massafera = 15/07/2022
/* 
    Autor_Atualização: Hendryw Deyvison
    Data_Atualização: 23/12/20224
*/
// Função Inicial para listagem das Ordens de Transferência
async function ListaOrdemTransferencia() {
    try {
        animationLoadingStart();

        await $.get("conferenciacega_action_ot.html", async (respHtml) => {
            $("#js-page-content").html(respHtml);
        }).fail((error) => {
            throw error;
        });

        $('#idlojaorigem').prop('disabled', true);
        $("#idlojaorigem, #idlojadestino").select2();

        $("#dtconsultainicio, #dtconsultafim").val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisarot() });

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(retornoListaEmpresasSelect)
            .catch((error) => {
                throw error;
            });

        await ajaxGetAllData(`api/conferencia-cega/resumo-ordem-transferencia.xsjs?idtipofiltro=2&idEmpresaOrigem=${IDEmpresaLogin}`, false)
            .then(retornoListaOT)
            .catch((error) => {
                throw error;
            });

        animationLoadingStop();

        $("#dtconsultainicio").focus()
    } catch (error) {
        console.error(error);
        msgError();
    }
}

// Retorno das buscas das Ordem de Transferência
async function retornoListaOT(respostaListaOT, isFocus = false) {
    let { data } = respostaListaOT || [];
    let dataRetornoOT = [];
    let BtnOpcao = "";
    
    if (data.length > 0) {
        for (registro of data) {
            let IdResumoOT = registro.IDRESUMOOT;
            let DataCriacao = registro.DATAEXPEDICAOFORMATADA;
            let IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
            let EmpresaOrigem = registro.EMPRESAORIGEM;
            let EmpresaDestino = registro.EMPRESADESTINO;
            let NumeroNF = registro.NUMERONOTASEFAZ || '';
            let QtdConferido = parseInt(registro.QTDCONFERENCIA);
            let IdStatusOT = parseInt(registro.IDSTATUSOT);
            let StatusOT = registro.DESCRICAOOT;
            let IdSAPOrigem = registro.IDSAPORIGEM;
            let IdSAPDestino = registro.IDSAPDESTINO;
            let ErrorLogSAP = registro.ERRORLOGSAP;
            let ChaveSEFAZ = registro.CHAVESEFAZ;
            let stBtnImprimirNfeDisabled = "disabled";
            let stBtnCancelDisabled = "";
            let stBtnNfeDisabled = "";
            let stBtnEditarDisabled = "";
            let stBtnFinalizarDisabled = "";
            let corObservacaoOT = "";

            if (IdStatusOT != 1) {
                stBtnCancelDisabled = "disabled";
                stBtnNfeDisabled = "disabled";
            }

            if (!NumeroNF) {
                stBtnFinalizarDisabled = "disabled";
                stBtnEditarDisabled = "disabled";
            }

            BtnOpcao = `<div class="demo">`;

            if (IdEmpresaOrigem === IDEmpresaLogin) {
                BtnOpcao += `
                    <button type="button" class="btn btn-success btn-xs btn-icon waves-effect waves-themed" title="Editar / Visualizar" id="`+ IdResumoOT + `:` + 0 + `:` + IdStatusOT + `" onclick="editarot(this.id)"><i class="fal fa-edit"></i></button>
                    <button `+ stBtnCancelDisabled + ` type="button" class="btn btn-danger btn-xs btn-icon waves-effect waves-themed" title="Cancelar" id="` + IdResumoOT + `" onclick="cancelarot(this.id)"><i class="fal fa-trash"></i></button>
                    <button `+ stBtnNfeDisabled + ` type="button" class="btn btn-warning btn-xs btn-icon waves-effect waves-themed" title="Finalizar OT" id="` + IdResumoOT + `" onclick="salvarvolumeot(this.id)"><i class="fal fa-list"></i></button>
                    <button type="button" class="btn btn-secondary btn-xs btn-icon waves-effect waves-themed" title="Imprimir Etiqueta" id="`+ IdResumoOT + `" onclick="imprimiretiqueta(this.id)"><i class="fal fa-print"></i></button>
                `;
            } else {
                BtnOpcao += `
                    <button `+ stBtnEditarDisabled + ` type="button" class="btn btn-primary btn-xs btn-icon waves-effect waves-themed" title="Conferir OT" id="` + IdResumoOT + `:` + 1 + `:` + NumeroNF + `:` + StatusOT + `:` + DataCriacao + `" onclick="conferirot(this.id)"><i class="fal fa-edit"></i></button>
                `;
                if ([8, 5].indexOf(IdStatusOT) >= 0) {
                    BtnOpcao += `
                        <button `+ stBtnFinalizarDisabled + ` type="button" class="btn btn-warning btn-xs btn-icon waves-effect waves-themed" title="Finalizar Recebimento OT" id="` + IdResumoOT + `:` + 0 + `:` + NumeroNF + `:` + StatusOT + `:` + DataCriacao + `:` + QtdConferido + `" onclick="finalizarot(this.id)"><i class="fal fa-list"></i></button>
                    `;
                }
            }
            if (IdEmpresaOrigem === IDEmpresaLogin) {
                if (ErrorLogSAP !== "" && ErrorLogSAP !== null) {
                    corObservacaoOT = 'danger';

                } else if ((ErrorLogSAP === "" || ErrorLogSAP === null) && IdSAPOrigem > 0 && IdSAPDestino > 0) {
                    corObservacaoOT = 'success';

                } else {
                    corObservacaoOT = 'warning';
                }

                if (ChaveSEFAZ !== null) {
                    stBtnImprimirNfeDisabled = "";
                }

                BtnOpcao += `
                    <button type="button" class="btn btn-${corObservacaoOT} btn-xs btn-icon waves-effect waves-themed" title="Status Nota Fiscal" id="` + IdResumoOT + `" onclick="observacaoot(this.id)"><i class="fal fa-exclamation"></i></button>
                    <button ` + stBtnImprimirNfeDisabled + ` type="button" class="btn btn-danger btn-xs btn-icon waves-effect waves-themed" title="Imprimir Nota Fiscal" onClick="window.open('http://164.152.244.96:3000/files/NFe` + ChaveSEFAZ + `.pdf', '_blank');"><i class="fal fa-print"></i></button>
                `;
            }

            BtnOpcao += `</div>`;

            dataRetornoOT.push([
                IdResumoOT
                , DataCriacao
                , EmpresaOrigem
                , EmpresaDestino
                , NumeroNF
                , StatusOT
                , BtnOpcao
            ]);
        }

    }

    $('#resultadomodalot').html(
        `<table id="dt-basic-ot" class="table table-bordered table-hover table-striped w-100">
				<thead class="bg-primary-600">
					<tr>
						<th>Nº OT</th>
						<th>Data Criação</th>
						<th>Loja Origem</th>
						<th>Loja Destino</th>
						<th>Número NF-e</th>
						<th>Status</th>
                        <th>Opções</th>
					</tr>
				</thead>
				<tbody id="resultadomodalot">
				</tbody>
			</table>`
    );

    $('#dt-basic-ot').DataTable({
        data: dataRetornoOT,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "25%", "targets": 2 },
            { "width": "25%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "10%", "targets": 5 },
            { "width": "10%", "targets": 6 }
        ],
        order: [
            [0, 'desc'],
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
                titleAttr: 'Generate Excel',
                className: 'btn-outline-success btn-sm mr-1'
            },
            {
                extend: 'print',
                text: 'Print',
                titleAttr: 'Print Table',
                className: 'btn-outline-primary btn-sm'
            }
        ],
        initComplete: function (settings) {
            if (isFocus) {
                let idTable = `#${settings.nTable.id}`;

                $(idTable).focus();
                $('html, body').animate({
                    scrollTop: $(idTable).offset().top
                }, 1000);
            }
        }
    });

}

async function pesquisarot() {
    try {
        animationLoadingStart();

        let idlojadestino = $("#idlojadestino").val();
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();

        await ajaxGetAllData(`api/conferencia-cega/resumo-ordem-transferencia.xsjs?&idtipofiltro2&idEmpresaOrigem=${IDEmpresaLogin}&idEmpresaDestino=${idlojadestino}&datapesqinicio=${datapesqinicio}&datapesqfim=${datapesqfim}`)
            .then(resp => retornoListaOT(resp, true))
            .catch((error) => {
                throw error;
            });

        animationLoadingStop();
    } catch (error) {
        console.error(error);
        msgError();
    }
}

async function abrirModalOT() {
    await $.get('gerencial_action_incluirot_modal.html', async (res) => {
        $('#resultadoot').html(res);
        $("#ot").modal('show');
    }).fail((error) => {
        throw error;
    });

    $('#ot').on({
        'shown.bs.modal': function () {
            // Ajuste do z-index do modal.
            var idx = $('.modal:visible').length;
            $(this).css('z-index', 1040 + (10 * idx));

            // Carregamento dinâmico se data-url estiver definido.
            var url = $(this).find('[data-url]').data('url');
            if (url) {
                $(this).find('.modal-body').load(url);
            }

            // Ajuste do z-index do backdrop.
            $('.modal-backdrop').not('.stacked')
                .css('z-index', 1040 + (10 * (idx - 1)))
                .addClass('stacked');

            $('#descProduto').focus();

            $("#idlojaorigemmodal, #idlojadestinomodal").select2({
                dropdownParent: $("#ot")
            });

        },
        'hidden.bs.modal': function () {
            // Manter a classe modal-open se houver outros modais visíveis.
            if ($('.modal:visible').length > 0) {
                setTimeout(function () {
                    $(document.body).addClass('modal-open');
                }, 0);
            }
        }
    });

    $("#idlojaorigemmodal").change(function () {

        $("#idlojadestinomodal").find("option").each(function () {
            $(this).removeAttr("disabled");
        });
        $("#idlojadestinomodal [value=" + $(this).val() + "]").attr("disabled", "disabled");

        $('#idlojadestinomodal').not(this).has('option[value="' + this.value + '"]:selected').val('-2');

    })

    $("#idlojadestinomodal").change(function () {

        $("#idlojaorigemmodal").find("option").each(function () {
            $(this).removeAttr("disabled");
        });
        $("#idlojaorigemmodal [value=" + $(this).val() + "]").attr("disabled", "disabled");

        $('#idlojaorigemmodal').not(this).has('option[value="' + this.value + '"]:selected').val('-1');

    })


    await ajaxGetAllData('api/empresa.xsjs', false)
        .then(retornoListaEmpresasModalSelect)
        .catch((error) => { throw error; });

    $("#idlojaorigemmodal").val(IDEmpresaLogin).trigger('change').prop("disabled", true);
}

// Editar a Ordem de Transferência que está na Origem
async function editarot(id = '') {
    try {
        animationLoadingStart();

        idchave = id.split(":") || [];
        nIdResumoOT = idchave[0] || '';
        nConferir = parseInt(idchave[1]) || '';
        nIdStatusOT = parseInt(idchave[2]) || '';

        nBtnSalvar = 2; // Alterando o botão salvar para update
        id = nIdResumoOT;

        if (nIdStatusOT != 1) {
            $("#descProduto, #salvarot").prop("disabled", true);
        }

        await abrirModalOT();

        await ajaxGetAllData('api/conferencia-cega/detalhe-ordem-transferencia.xsjs?id=' + id, false)
            .then(retornoListaDetalheOT)
            .catch((error) => {
                throw error;
            });

        animationLoadingStop();

    } catch (error) {
        console.error(error);
        msgError();
    }
}

function retornoListaDetalheOT(respostaListaDetalheOT) {
    let { data } = respostaListaDetalheOT || [];
    let dataRetornoDetalheOT = [];
    let BtnOpcao = "";
    let IdEmpresaOrigem;
    let IdEmpresaDestino;

    if (data.length > 0) {
        for(let registro of data ){
            let IdResumoOT = registro.IDRESUMOOT;
            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = registro.VLRUNITVENDA;
            let PrecoCusto = registro.VLRUNITCUSTO;
            let QtdProduto = registro.QTDEXPEDICAO;

            IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
            IdEmpresaDestino = registro.IDEMPRESADESTINO;

            if (nIdStatusOT === 1) {
                BtnOpcao = `
                    <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="` + CodigoBarras + `" onclick="diminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
                        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="`+ CodigoBarras + `" onclick="excluirProduto(this.id)"><i class="fal fa-trash"></i></button>
                `;
            } else {
                nBtnSalvar = 3; // Alterando o botão salvar, já que o registro está cancelado
            }

            if (nIdStatusOT !== 1) {
                $("#descProduto, #salvarot").prop("disabled", true);
            }

            if (CodigoProduto) {

                dataRetornoDetalheOT.push([
                    CodigoProduto
                    , CodigoBarras
                    , DescProduto
                    , PrecoCusto
                    , PrecoVenda
                    , QtdProduto
                    , BtnOpcao
                ]);
            }
        }   

        $("#idlojadestinomodal").val(IdEmpresaDestino).trigger('change').prop("disabled", true);
    }

    $('#tabelaprodutos').DataTable({
        data: dataRetornoDetalheOT,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "12%", "targets": 5 },
            { "width": "10%", "targets": 6 }
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

async function pesqProduto() {
    try {
        let myTable = $('#tabelaprodutos').DataTable();
        let descProduto = $('#descProduto').val();
        let nIdEmpresa = $("#idlojaorigemmodal").val();
        let cont = 0;

        if (parseInt(nIdEmpresa) <= 0 || parseInt($("#idlojadestinomodal").val()) <= 0) {
            return msgInfo('A Loja de Origem e Destino devem ser Preenchidas!');
        }

        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == descProduto) {
                myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) + 1);
                cont++;
                $('#descProduto').val("").focus();;
            }
        });

        if (cont === 0) {
            $('#descProduto').prop("disabled", true);

            await ajaxGetAllData('api/conferencia-cega/produto.xsjs?idEmpresa=' + nIdEmpresa + '&id=' + descProduto)
                .then(RetornoListaProduto)
                .catch((error) => {
                    throw error;
                });
        }

    } catch (error) {
        console.log(error);
        msgError('Error oa tentar carregar os dados do produto!');
    }
}

function RetornoListaProduto(respostaListaProduto) {
    let { data } = respostaListaProduto || [];
    let myTable = $('#tabelaprodutos').DataTable();

    if (data.length > 0) {

        CodigoProduto = data[0].IDPRODUTO;
        CodigoBarras = data[0].NUCODBARRAS;
        DescProduto = data[0].DSNOME;
        PrecoVenda = data[0].PRECOVENDA;
        PrecoCusto = data[0].PRECOCUSTO;

        BtnOpcao = `<button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="` + CodigoBarras + `" onclick="diminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
                    <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="`+ CodigoBarras + `" onclick="excluirProduto(this.id)"><i class="fal fa-trash"></i></button>`;

        myTable.row.add([CodigoProduto, CodigoBarras, DescProduto, PrecoCusto, PrecoVenda, 1, BtnOpcao]).draw(false);
    }

    $('#idlojaorigemmodal, #idlojadestinomodal').prop("disabled", true);

    $('#descProduto').focus().prop("disabled", false).val("");
}

function diminuirProduto(id) {
    let myTable = $('#tabelaprodutos').DataTable();

    myTable.column(1).nodes().each(function (node, index, dt) {
        if (myTable.cell(node).data() == id) {
            if (myTable.cell(node._DT_CellIndex.row, 5).data() > 1) {
                myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) - 1);
            } else {
                msgQuestion('Essa ação irá excluir o produto da O.T, Deseja prosseguir?').then((resp) => {
                    if (resp.value) {
                        myTable.row(node._DT_CellIndex.row).remove().draw(false);
                    }
                })
            }
        }
    });
    $('#descProduto').focus().val("");
}

function excluirProduto(id) {
    msgQuestion('Essa ação irá excluir o produto da O.T, Deseja prosseguir?').then((resp)=>{
        if(resp.value) {
            let myTable = $('#tabelaprodutos').DataTable();

            myTable.column(1).nodes().each(function (node, index, dt) {
                if (myTable.cell(node).data() == id) {
                    myTable.row(node._DT_CellIndex.row).remove().draw(false);
                }
            });

            $('#descProduto').focus().val("");
        }
    })
}

function abrirPesqProduto() {

    nIdLojaOrigem = parseInt($("#idlojaorigemmodal").val());

    $("#abrirpesqproduto").modal('show');
}

function pesquisarProduto() {
    try {

        let nIdLojaOrigem = parseInt($("#idlojaorigemmodal").val());

        ajaxGetAllData('api/conferencia-cega/produto.xsjs?page=' + numPage + '&idEmpresa=' + nIdLojaOrigem + '&descProduto=' + $("#pesqProduto").val())
            .then(retornoPesqListaProduto)
            .catch((error) => { throw error });
    } catch (error) {
        console.log(error);
        msgError();
    }

}

function retornoPesqListaProduto(respostaPesqListaProduto) {
    let { data } = respostaPesqListaProduto || [];
    let dataRetornoPesqProduto = [];

    if (data.length > 0) {
        data.map((registro) => {
            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = registro.PRECOVENDA;
            let PrecoCusto = registro.PRECOCUSTO;
            let inputQtd = `
                <input type="number" class="form-control" id="qtd:` + CodigoBarras + `" value="0"><span style="display: none;">0</span>
            `;
            let btnConfirmacao = `
                <button type="button" class="btn btn-outline-success btn-xs btn-icon waves-effect waves-themed" title="Confirmar" id="` + CodigoBarras + `" onclick="confirmarProduto(this.id)"><i class="fal fa-check"></i></button>
            `;

            dataRetornoPesqProduto.push([
                CodigoProduto
                , CodigoBarras
                , DescProduto
                , PrecoCusto
                , PrecoVenda
                , inputQtd
                , btnConfirmacao
            ]);
        })

    }

    $('#resultado').html(
        `<table id="dt-basic-produto" class="table table-bordered table-hover table-striped w-100">
				<thead class="bg-primary-600">
					<tr>
						<th>Produto</th>
						<th>Cód. Barras</th>
						<th>Descrição</th>
						<th>R$ Custo</th>
						<th>R$ Venda</th>
						<th>Qtd</th>
						<th>Opções</th>
					</tr>
				</thead>
            </table>`
    );

    $('#dt-basic-produto').DataTable({
        data: dataRetornoPesqProduto,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "12%", "targets": 5 },
            { "width": "10%", "targets": 6 }
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

function confirmarProduto(id) {

    let tabelaresultado = $('#dt-basic-produto').DataTable();
    let cCodProduto = "";
    let cDescProduto = "";
    let nPrecoCusto = 0;
    let nPrecoVenda = 0;
    let nQtd = 0;
    let cont = 0;

    cCodProduto = tabelaresultado.rows().data()[0][0];
    cDescProduto = tabelaresultado.rows().data()[0][2];
    nPrecoCusto = tabelaresultado.rows().data()[0][3];
    nPrecoVenda = tabelaresultado.rows().data()[0][4];
    nQtd = parseInt(document.getElementById('qtd:' + id).value);

    if (nQtd <= 0) {
        return msgWarning('Atenção!', 'Favor preencher a Quantidade do Produto com um valor Maior que Zero ( 0 )!');
    }

    $("#abrirpesqproduto").modal('hide');

    let myTable = $('#tabelaprodutos').DataTable();

    let BtnOpcao = `
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="` + id + `" onclick="diminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="`+ id + `" onclick="excluirProduto(this.id)"><i class="fal fa-trash"></i></button>
    `;

    if (myTable.rows().count() > 0) {
        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == id) {
                myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) + nQtd);
                cont++;
            }
        });
        if (cont === 0) {
            myTable.row.add([cCodProduto, id, cDescProduto, nPrecoCusto, nPrecoVenda, nQtd, BtnOpcao]).draw(false);
        }
    } else {
        myTable.row.add([cCodProduto, id, cDescProduto, nPrecoCusto, nPrecoVenda, nQtd, BtnOpcao]).draw(false);
    }

    tabelaresultado.destroy();

    $('#idlojaorigemmodal, #idlojadestinomodal').prop("disabled", true).select2();
    $('#dt-basic-produto').empty();
    $('#pesqProduto').val("");
    $('#descProduto').val("").focus();

}

// Salvar a Ordem de Transferência
async function salvarot() {
    try {
        animationLoadingStart('Enviando dados...', 1, false);

        $('#salvarot').prop('disabled', true);

        let myTable = $('#tabelaprodutos').DataTable();
        let rowsTable = myTable.rows();
        let countRows = rowsTable.count();
        let idEmpresaOrigem = parseInt($("#idlojaorigemmodal").val() || 0)
        let idEmpresaDestino = parseInt($("#idlojadestinomodal").val() || 0);
        let element = !idEmpresaOrigem ? $("#idlojaorigemmodal") : !idEmpresaDestino ? $("#idlojadestinomodal") : null;
        let dadosdetalheot = [];
        let nCtTotalItens = 0;
        let nQtdTotalItens = 0;
        let dVlrTotalVenda = 0;
        let dVlrTotalCusto = 0;
        let msgRetorno;

        if(!idEmpresaOrigem || !idEmpresaDestino){
            msgRetorno = !idEmpresaOrigem ? 'Informe a Empresa de Origem!' : 'Informe a Empresa de Destino!';

        } else if (countRows === 0 || countRows > 200) {
            element = countRows === 0 && $('#descProduto');

            msgRetorno = countRows === 0 ? 'Informe os produtos da OT!' : 'A OT não pode conter mais de 200 tipos de produtos!';

        }

        if (msgRetorno?.length > 0){
            $('#salvarot').prop('disabled', false);

            return msgWarning('Atenção!', msgRetorno)
            .then(() => 
                element && setTimeout(()=> {
                    element.hasClass('select2') ? element.select2('open'): element.focus();
                }, 500));
        }

        for (var i = 0; i < countRows; i++) {

            cIdProduto = rowsTable.cell(i, 0).data();
            nQtdProduto = parseInt(rowsTable.cell(i, 5).data());
            nVlrVenda = parseFloat(rowsTable.cell(i, 4).data());
            nVlrCusto = parseFloat(rowsTable.cell(i, 3).data());

            dadosdetalheot[i] = {
                "IDPRODUTO": cIdProduto
                , "QTDEXPEDICAO": nQtdProduto
                , "QTDRECEPCAO": 0
                , "QTDDIFERENCA": 0
                , "QTDAJUSTE": 0
                , "VLRUNITVENDA": nVlrVenda
                , "VLRUNITCUSTO": nVlrCusto
                , "STCONFERIDO": 'False'
                , "IDUSRAJUSTE": 0
                , "STATIVO": 'True'
                , "STFALTA": 'False'
                , "STSOBRA": 'False'
            };
            nCtTotalItens++;
            nQtdTotalItens = nQtdTotalItens + nQtdProduto;
            dVlrTotalVenda = dVlrTotalVenda + (nQtdProduto * nVlrVenda);
            dVlrTotalCusto = dVlrTotalCusto + (nQtdProduto * nVlrCusto);
        }

        let dados = [{
            "IDEMPRESAORIGEM": idEmpresaOrigem
            , "IDEMPRESADESTINO": idEmpresaDestino
            , "DATAEXPEDICAO": ""
            , "IDOPERADOREXPEDICAO": IDFuncionarioLogin
            , "NUTOTALITENS": nCtTotalItens
            , "QTDTOTALITENS": nQtdTotalItens
            , "QTDTOTALITENSRECEPCIONADO": 0
            , "QTDTOTALITENSDIVERGENCIA": 0
            , "NUTOTALVOLUMES": 0
            , "TPVOLUME": ""
            , "VRTOTALCUSTO": dVlrTotalCusto
            , "VRTOTALVENDA": dVlrTotalVenda
            , "DTRECEPCAO": ""
            , "IDOPERADORRECEPTOR": 0
            , "DSOBSERVACAO": ""
            , "IDUSRCANCELAMENTO": 0
            , "DTULTALTERACAO": ""
            , "IDSTDIVERGENCIA": 0
            , "OBSDIVERGENCIA": ""
            , "STEMISSAONFE": "False"
            , "NUMERONFE": ""
            , "STENTRADAINVENTARIO": "False"
            , "QTDCONFERENCIA": 0
            , dadosdetalheot
            , "IDRESUMOOT": parseInt(nIdResumoOT)
            , "IDSTATUSOT": parseInt(1)
            , "IDUSRAJUSTE": 0
            , "DTAJUSTE": ""
            , "QTDTOTALITENSAJUSTE": 0
        }];

        $("#ot").modal('hide');

        if (nBtnSalvar === 1) {
            await ajaxPost("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados).catch((error) => { throw error });

            msgRetorno = "Salvo com Sucesso!";
        } 
        
        if (nBtnSalvar === 2) {
            await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados).catch((error) => { throw error });
            
            msgRetorno = "Alterado com Sucesso!";
        }

        $('#salvarot').prop('disabled', false);

        await msgSuccess(msgRetorno, undefined, false);

        ListaOrdemTransferencia();

    } catch (error) {
        console.error(error);

        $('#salvarot').prop('disabled', false);

        msgError('Erro ao tentar enviar os dados!');
    }
}

// Função para Preencher a Quantidade e Descrição dos Volumes da OT
async function salvarvolumeot(id) {
    try {
        animationLoadingStart();

        await $.get('conferenciacega_action_salvarvolumeot.html', async (res) => $('#resultadovolumeot').html(res)).fail((error) => { throw error });

        $("#footervolumeot").html(`
            <button type="button" class="btn btn-success" id="${id}" onclick="emitirnfe(this.id)">Salvar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
        `);

        $("#volumeot").modal('show').on('shown.bs.modal', () => $("#qtdvolume").focus().val(0));
        

        animationLoadingStop();
    } catch (error){
        console.error(error);
        msgError();
    }

}

// Emiti a Nota Fiscal da Ordem de Transferência e libera para Conferência no Destino
function emitirnfe(id) {
    let qtdvolume = parseInt($("#qtdvolume").val() || 0);
    let descvolume = $("#descvolume").val()?.trim();
    let msgRetorno;

    if (!descvolume || qtdvolume <= 0) {
        let element = qtdvolume <= 0 ? $("#qtdvolume") : $("#descvolume");

        msgRetorno = qtdvolume <= 0 ? 'Necessário preencher a Quantidade!' : 'Necessário preencher a Descrição!';

        return msgWarning('Atenção!', msgRetorno).then(() => setTimeout(() => element.focus().val(0), 500));
    }

    Swal.fire({
        title: 'Deseja Finalizar a OT?',
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, quero Finalizar!',
        cancelButtonText: 'Não'
    }).then(async (result) => {
        try{
            if (result.value == true) {
                animationLoadingStart('Finalizando a OT, aguarde...', 1, false);

                let dados = [{
                    "IDSTATUSOT": parseInt(3)
                    , "IDRESUMOOT": parseInt(id)
                    , "IDEMPRESAORIGEM": parseInt(IDEmpresaLogin)
                    , "NUTOTALVOLUMES": parseInt(qtdvolume)
                    , "TPVOLUME": descvolume
                    , "NOTAFISCAL": parseInt(0)
                }];

                await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                    .then(async ()=> {
                        $("#volumeot").modal('hide');

                        await msgSuccess('OT Finalizada com sucesso!', undefined, false);
                        
                        ListaOrdemTransferencia();
                    })
                    .catch((error)=>{ throw error });
            }
        } catch(error){
            console.log(error);
            msgError('Erro ao Finalizar OT!');
        }
    })

}

// Cancelar a Ordem de Transferência que está na Origem
function cancelarot(id) {

    Swal.fire({
        title: 'Deseja realmente CANCELAR essa OT?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, quero Cancelar!',
        cancelButtonText: 'Não'
    }).then(async (result) => {
        try{
            if (result.value == true) {
                animationLoadingStart('Cancelando a OT, aguarde...', 1, false);

                let dados = [{
                    "IDSTATUSOT": parseInt(2)
                    , "IDRESUMOOT": parseInt(id)
                    , "IDUSRCANCELAMENTO": parseInt(IDFuncionarioLogin)
                }];

                await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                    .then(async () => {
                        await msgSuccess('OT Cancelada com sucesso!', undefined, false);

                        ListaOrdemTransferencia();
                    })
                    .catch((error) => { throw error });
            }
        } catch (error) {
            console.log(error);
            msgError('Erro ao Cancelar a OT!');
        }
    })
}

async function incluirot() {
    try{
        nIdResumoOT = 0;
        nBtnSalvar = 1;

        animationLoadingStart();

        await abrirModalOT();

        animationLoadingStop();

    } catch(error){
        console.log(error);
        msgError();
    }
}

async function observacaoot(id) {
    try {
        animationLoadingStart();

        await $.get('conferenciacega_action_observacaoot.html', async (res) => $('#resultadoobservacaoot').html(res))
            .fail((error) => { throw error });

        await ajaxGetAllData('api/conferencia-cega/resumo-ordem-transferencia.xsjs?id=' + id, false)
            .then(retornoListaObservacaoOT)
            .catch((error) => { throw error });

        $("#observacaoot").modal('show');

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaObservacaoOT(respostaListaObservacaoOT) {
    let { data } = respostaListaObservacaoOT || [];

    if (data.length > 0) {
        let { 
            IDRESUMOOT,
            IDSAPORIGEM,
            IDSAPDESTINO,
            ERRORLOGSAP,
            CHAVESEFAZ,
            MSGSEFAZ,
            CODIGORETORNOSEFAZ,
            NUMERONOTASEFAZ,
            IDSTATUSOT,
            DESCRICAOOT
        } = data[0] || '';

        let nIdResumoOT = IDRESUMOOT;
        let nIdSAPOrigem = parseInt(IDSAPORIGEM || 0);
        let nIdSAPDestino = parseInt(IDSAPDESTINO || 0);
        let ErrorLogSAP = ERRORLOGSAP || '';
        let ChaveSEFAZ = CHAVESEFAZ || '';
        let MsgSEFAZ = MSGSEFAZ || '';
        let CodigoRetornoSEFAZ = CODIGORETORNOSEFAZ || '';
        let NumeroNotaSEFAZ = NUMERONOTASEFAZ || '';
        let IdStatusOT =  parseInt(IDSTATUSOT || 1);
        let StatusOT = DESCRICAOOT || '';
        let arrayMsgStatus = [
            'Aguardando a Empresa Origem Finalizar a OT!',
            'OT Cancelada!',
            'Aguardando Faturamento e Emissão da Nota Fiscal!',
            'OT Finalizada com Sucesso!',
            'OT Aberta com Divergência!',
            'OT em Análise de Divergência!',
            'OT Finalizada com Divergência!',
            'Emissão da Nota Fiscal Realizada, OT Aguardando Conferência!',
            'Faturamento Realizado, Aguardando Emissão da Nota Fiscal!'
        ];
        let msgStatus = ErrorLogSAP || arrayMsgStatus[IdStatusOT-1];

        $('#resultadoobservacaoot').html(`
            <div class="table-responsive-sm">
                <table class="table table-hover table-striped table-sm w-100">
                    <tr>
                        <th>ORDEM DE TRANSFERÊNCIA Nº: ${nIdResumoOT}</th>
                    </tr>
                </table>
                <table class="table table-hover table-striped table-sm w-100 mb-2">
                    <tr>
                        <th colspan="4">DADOS DA ORDEM DE TRANSFERÊNCIA:</th>
                    </tr>
                    <tr>
                        <th width="20%">Status da OT</th>
                        <td colspan="3">${StatusOT}</td>
                    </tr>
                    <tr>
                        <th width="20%">Id SAP Origem</th>
                        <td width="30%">${nIdSAPOrigem}</td>
                        <th width="20%">Id SAP Destino</th>
                        <td>${nIdSAPDestino}</td>
                    </tr>
                </table>
                <table class="table table-hover table-striped table-sm  w-100">
                    <tr>
                        <th colspan="4">DADOS DA NOTA FISCAL:</th>
                    </tr>
                    <tr>
                        <th width="20%">Número da NF-e</th>
                        <td width="30%">${NumeroNotaSEFAZ}</td>
                        <th width="20%">Status da NF-e</th>
                        <td>${CodigoRetornoSEFAZ}</td>
                    </tr>
                    <tr>
                        <th width="20%">Chave da NF-e</th>
                        <td colspan="3">${ChaveSEFAZ}</td>
                    </tr>
                    <tr>
                        <th width="20%">Motivo da NF-e</th>
                        <td colspan="3">${MsgSEFAZ}</td>
                    </tr>
                    <tr>
                        <th width="20%">Status SAP</th>
                        <td colspan="3">${msgStatus}</td>
                    </tr>
                </table>
            <div>
        `);
    }
}

async function imprimiretiqueta(id) {
    try{
        animationLoadingStart();

        await $.get("conferenciacega_action_pdfot_modal.html", async (respHtml)=>{
            $("#etiquetaImp").html(respHtml);
        })
        .fail((error)=>{ throw error });

        let respDados = await ajaxGetAllData('api/conferencia-cega/resumo-ordem-transferencia.xsjs?id=' + id, false)
        .catch((error) => { throw error });

        if(respDados?.data?.length > 0){
            retornoImprimirEtiqueta(respDados);

           // $('#js-page-content').addClass('hidden-print');
            $('#impEtiquetaOT').modal('show');

            animationLoadingStop();
        } else {
            msgWarning('Dados não encontrados, recarregue e tente novamente!');
        }
    } catch(error){
        console.error(error);
        msgError();
    }

}

function retornoImprimirEtiqueta(respostaImprimirEtiqueta) {
    let { data } = respostaImprimirEtiqueta || [];

    $('#etiquetasOTparaImpressão').html('');

    if (data.length > 0) {
        let {
            IDRESUMOOT,
            EMPRESAORIGEM,
            EMPRESADESTINO,
            DATAEXPEDICAOFORMATADA,
            NUTOTALVOLUMES
        } = data[0] || '';
        
        let Volumes = Number(NUTOTALVOLUMES || 1);

        for (var i = 0; i < Volumes; i++) {
            let currentVolume = (i + 1);
            let codBarras = IDRESUMOOT + '' + currentVolume;

            $('#etiquetasOTparaImpressão').append(`
                <div class="EtiquetaOT row backCustom" style="border-radius: 5px !important;">
                    <div class=" col-sm-12 col-xl-12 h3">
                                        
                        <div class="codBarrasEtiquetaOT col-sm-12 col-xl-12 text-center" style="text-align: center">

                            <svg
                                class="svgEtiqueta codBarras text-center"
                                jsbarcode-value="${codBarras}"
                                jsbarcode-width= "4"
                                jsbarcode-height="82"
                                jsbarcode-margin="2" 
                                jsbarcode-fontSize="15"
                                jsbarcode-textMargin="2"
                                value="${codBarras}">
                            </svg>

                        </div>

                        <div id="conteudoEtiquetaOt">
                            <p ><strong>Origem: </strong><span></span>${EMPRESAORIGEM}</p>
                                                                
                            <p ><strong>Destino: </strong><span></span>${EMPRESADESTINO}</p>
                                                                
                            <p ><strong>Nº da OT: </strong><span></span>${IDRESUMOOT}</p>
                                                                
                            <p ><strong>Data da OT: </strong><span></span>${DATAEXPEDICAOFORMATADA}</p>
                                                                
                            <p ><strong>Volume: </strong><span></span>${currentVolume}/${Volumes}</p>
                        </div>
                   </div> 
                </div>
            `);

        }
        
        JsBarcode('.svgEtiqueta').init();
    }
}

function selecionaTipoEtiquetaOT() {
    let mediaPrintEtiqueta = `
        *{ 
            margin: 0;
            padding: 0;
        }
                
        @media print {
            html,
            body {
              width: 500px;
              height: auto; 
            } 
            p{ 
                padding-top: 8px !important;
            }
            .backCustom{
                margin: 0 20px 0 20px !important;
            }
            .etiquetaOT{
                width: 500px;
                page-break-after: always;
            }
            .codBarrasEtiquetaOT{
                text-align: center !important;
                margin: 10px auto 0 auto!important;
            }
            .breadcrumb,
            .subheader {
              display: none;
            }
            *:not(text) {
              font-family: Arial, Helvetica, sans-serif !important;
              font-size: 15pt !important;
            }
        }
        
        @page {
            size: landscape;
            margin: 0;
        }
    `;

    let mediaPrintNormal = `
        *{
            margin: 0;
            padding: 0;
        }
                
        @media print {
            html,
            body {
              width: 210mm;
              height: auto !important;
              margin-left: 10px !important;
            }
            .etiquetaOT{
                width: 1600px;
                page-break-after: always;
            }
            .codBarrasEtiquetaOT{
                margin-top: 50px;
                margin-bottom: 100px;
            }
            .breadcrumb,
            .subheader {
              display: none;
            }
            *:not(text) {
              font-family: Arial, Helvetica, sans-serif !important;
              font-size: 70pt !important;
            }
        }
        
        @page {
            size: landscape;
            margin-left: 10px;
        }
    `;

    $('text').attr('style', 'font: 15px monospace !important')

    let IDResumoOT = $('.svgEtiqueta').attr('value');

    Swal.fire({
        type: 'question',
        title: 'Escolha o Formato Desejado?',
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ETIQUETA',
        cancelButtonText: 'FOLHA A4',
    }).then((result) => {
        if (result.value) {
            $("#mediaPrintEtiquetaOT").html(mediaPrintEtiqueta);
            $('.svgEtiqueta').attr({
                "jsbarcode-width": "2",
                "jsbarcode-height": "40",
                "jsbarcode-fontSize": "6",
            })

            JsBarcode('.svgEtiqueta').init();

            imprimirEtiquetaOT();
        } else if (result.dismiss == 'cancel') {
            $("#mediaPrintEtiquetaOT").html(mediaPrintNormal);
            imprimirEtiquetaOT();
        }
    })
}

async function sleep(timeOut = 1000) {
    await new Promise(resolve => setTimeout(resolve, timeOut));
}

async function imprimirEtiquetaOT(divId) {
    $('.modal-header').addClass('d-none');
    $('#js-page-content').addClass('hidden-print');
    $('.subheader').attr('style', 'display: none');

    let IDResumoOT = $('.svgEtiqueta').attr('value');
    let conteudo = document.getElementById('js-page-content-Etiqueta').innerHTML
    let tela_impressao = window.open('about:blank');

    tela_impressao.document.write(`
        <html>
            <head>
                <title>Etiqueta</title>
            </head>
            <body> 
                ${conteudo}
            </body>
        </html>
    `);

    $('.subheader').attr('style', 'display: ');

    tela_impressao.window.print();

    await sleep(400);

    tela_impressao.window.close();

    setTimeout(() => {
        $('#js-page-content').removeClass('hidden-print');
        $('.modal-header').removeClass('d-none');

        $('.svgEtiqueta').attr({
            "jsbarcode-width": "4",
            "jsbarcode-height": "80",
            "jsbarcode-fontSize": "15",
        })

        JsBarcode('.svgEtiqueta').init();
    }, 1000);

}
//? ======================================================== FIM ROTINA ORDEM DE TRANSFERENCIA  ======================================================== //

//? ======================================================== INICIO ROTINA CONFERIR ORDEM DE TRANSFERENCIA ======================================================== //
async function conferirot(id) {
    try{
        animationLoadingStart();

        idchave = id.split(":");
        nIdResumoOT = idchave[0];
        nConferir = parseInt(idchave[1]);
        NumeroNF = idchave[2];
        Status = idchave[3];
        DataCriacao = idchave[4];

        nBtnSalvar = 2; // Alterando o botão salvar para update
        id = nIdResumoOT;

        await $.get('conferenciacega_action_conferirot_modal.html', async (res)=> $('#resultadocot').html(res)
        ).fail((error)=>{ throw error });

        $('#cot').on({
            'shown.bs.modal': function () {
                // Ajuste do z-index do modal.
                var idx = $('.modal:visible').length;
                $(this).css('z-index', 1040 + (10 * idx));

                // Carregamento dinâmico se data-url estiver definido.
                var url = $(this).find('[data-url]').data('url');
                if (url) {
                    $(this).find('.modal-body').load(url);
                }

                // Ajuste do z-index do backdrop.
                $('.modal-backdrop').not('.stacked')
                    .css('z-index', 1040 + (10 * (idx - 1)))
                    .addClass('stacked');

                $("#conferiridlojaorigemmodal, #conferiridlojadestinomodal").select2({
                    dropdownParent: $("#cot")
                });
            },
            'hidden.bs.modal': function () {
                // Manter a classe modal-open se houver outros modais visíveis.
                if ($('.modal:visible').length > 0) {
                    setTimeout(function () {
                        $(document.body).addClass('modal-open');
                    }, 0);
                }
            }
        });

        $('#numeroOT').val(nIdResumoOT);
        $('#numeroNFe').val(NumeroNF);
        $('#statusOT').val(Status);
        $('#dtgeracaoOT').val(DataCriacao);

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(retornoListaEmpresasModalSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData('api/conferencia-cega/detalhe-ordem-transferencia.xsjs?id=' + id, false)
            .then(conferirretornoListaDetalheOT)
            .catch((error) => { throw error });

        $("#cot").modal('show');

        animationLoadingStop();

    } catch (error){
        console.log(error);
        msgError();
    } 
}

function conferirretornoListaDetalheOT(conferirrespostaListaDetalheOT) {
    let { data } = conferirrespostaListaDetalheOT || [];
    let conferirdataRetornoDetalheOT = [];

    if (data.length > 0) {

        data.map((registro, i)=> {
            let IdResumoOT = registro.IDRESUMOOT;
            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = registro.VLRUNITVENDA;
            let PrecoCusto = registro.VLRUNITCUSTO;
            let QtdProduto = registro.QTDRECEPCAO;
            let IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
            let IdEmpresaDestino = registro.IDEMPRESADESTINO;
            let nQtdExpedicao = parseInt(registro.QTDEXPEDICAO);
            let nQtdDiferenca = parseInt(registro.QTDDIFERENCA);
            let nQtdConferido = parseInt(registro.QTDCONFERENCIA);
            let IdStatusOT = parseInt(registro.IDSTATUSOT);
            let cAltLinha = 'True';
            let BtnOpcao = `
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="` + CodigoBarras + `:` + nQtdExpedicao + `:` + IdResumoOT + `" onclick="conferirdiminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="`+ CodigoBarras + `:` + nQtdExpedicao + `:` + IdResumoOT + `" onclick="conferirexcluirProduto(this.id)"><i class="fal fa-trash"></i></button>
            `;

            // Só permite edição para os Status 3-Aguardando Conferência e 5-Aberto com Divergência
            if ([1, 2, 4, 6, 7].indexOf(IdStatusOT) >= 0) {
                cAltLinha = 'False';
                BtnOpcao = ``;
                $("#conferirsalvarot, #conferirdescProduto").prop("disabled", true);
            }

            if(i == 0){
                $("#conferiridlojaorigemmodal, #conferiridlojadestinomodal").prop("disabled", true).select2();
                $("#conferiridlojaorigemmodal").val(IdEmpresaOrigem).trigger('change');
                $("#conferiridlojadestinomodal").val(IdEmpresaDestino).trigger('change');
            }
            if (CodigoProduto){

                conferirdataRetornoDetalheOT.push([
                    CodigoProduto
                    , CodigoBarras
                    , DescProduto
                    , PrecoCusto
                    , PrecoVenda
                    , QtdProduto
                    , BtnOpcao
                    , cAltLinha
                ]);
            }
        })

    }

    $('#conferirtabelaprodutos').DataTable({
        data: conferirdataRetornoDetalheOT,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "12%", "targets": 5 },
            { "width": "10%", "targets": 6 },
            {
                visible: false,
                searchable: false, "targets": 7
            }
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

async function conferirpesqProduto() {
    try {
        let myTable = $('#conferirtabelaprodutos').DataTable();
        let idLojaOrigem = parseInt($("#conferiridlojaorigemmodal").val());
        let idLojaDestino = parseInt($("#conferiridlojadestinomodal").val());
        let descProduto = $('#conferirdescProduto').val();
        let cont = 0;

        if (idLojaOrigem <= 0 || idLojaDestino <= 0) {
            return msgWarning('Atenção', 'A Loja de Origem e Destino devem ser Preenchidas!')
                .then(setTimeout(() => $('#conferirdescProduto').val("").focus(), 500));
        }

        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == descProduto) {
                if (myTable.cell(node._DT_CellIndex.row, 7).data() === 'True') {
                    myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) + 1);
                    cont++;

                    $('#conferirdescProduto').val("").focus();
                } else {
                    cont++;

                    $('#conferirdescProduto').val("").focus();
                }
            }
        });

        if (cont === 0) {
            $('#conferirdescProduto').prop("disabled", true);

            await ajaxGetAllData('api/conferencia-cega/produto.xsjs?idEmpresa=' + idLojaOrigem + '&id=' + descProduto)
                .then(conferirRetornoListaProduto)
                .catch((error) => { throw error });
        }

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function conferirRetornoListaProduto(conferirrespostaListaProduto) {
    let { data } = conferirrespostaListaProduto || [];
    let myTable = $('#conferirtabelaprodutos').DataTable();

    if (data.length > 0) {
        let {
            IDPRODUTO,
            NUCODBARRAS,
            DSNOME,
            PRECOVENDA,
            PRECOCUSTO,
            QTDEXPEDICAO,
        } = data[0] || '';

        let CodigoProduto = IDPRODUTO;
        let CodigoBarras = NUCODBARRAS;
        let DescProduto = DSNOME;
        let PrecoVenda = PRECOVENDA;
        let PrecoCusto = PRECOCUSTO;
        let nQtdExpedicao = QTDEXPEDICAO;

        let BtnOpcao = `
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="` + CodigoBarras + `:` + nQtdExpedicao + `:` + IdResumoOT + `" onclick="conferirdiminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="`+ CodigoBarras + `:` + nQtdExpedicao + `:` + IdResumoOT + `" onclick="conferirexcluirProduto(this.id)"><i class="fal fa-trash"></i></button>
        `;

        myTable.row.add([CodigoProduto, CodigoBarras, DescProduto, PrecoCusto, PrecoVenda, 1, BtnOpcao, 'True']).draw(false);

        $('#conferiridlojaorigemmodal, #conferiridlojadestinomodal').prop("disabled", true).select2();
        $('#conferirdescProduto').val("").focus().prop("disabled", false);
    }
}

function conferirdiminuirProduto(id) {
    let myTable = $('#conferirtabelaprodutos').DataTable();

    idchave = id.split(":");
    id = idchave[0];
    pQtdExpedicao = parseInt(idchave[1]);
    nIdResumoOT = parseInt(idchave[2]);

    myTable.column(1).nodes().each(function (node, index, dt) {
        if (myTable.cell(node).data() == id) {
            if (myTable.cell(node._DT_CellIndex.row, 5).data() > 1) {
                myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) - 1);
            } else {
                if (pQtdExpedicao === 0) {
                    conferirexcluirProduto(id + ':' + pQtdExpedicao + ':' + nIdResumoOT);
                } else {
                    msgQuestion()
                    .then((resp)=>{
                        if(resp.value === true) {
                            myTable.cell(node._DT_CellIndex.row, 5).data(0);
                        }
                    });
                }
            }
        }
    });
    $('#conferirdescProduto').val("").focus();

}

function conferirexcluirProduto(id) {
    msgQuestion()
        .then(async (resp) => {
            try{

                if (resp.value === true) {
                    idchave = id.split(":");
                    id = idchave[0];
                    pQtdExpedicao = parseInt(idchave[1]);
                    nIdResumoOT = parseInt(idchave[2]);

                    let myTable = $('#conferirtabelaprodutos').DataTable();

                    myTable.column(1).nodes().each(function (node, index, dt) {
                        if (myTable.cell(node).data() == id) {
                            cCodProduto = myTable.cell(node._DT_CellIndex.row, 0).data();
                        }
                    });

                    let dados = [{
                        "IDPRODUTO": cCodProduto
                        , "IDSTATUSOT": parseInt(5)
                        , "IDRESUMOOT": parseInt(nIdResumoOT)
                    }];

                    myTable.column(1).nodes().each(async function (node, index, dt) {
                        if (myTable.cell(node).data() == id) {
                            if (pQtdExpedicao === 0) {
                                await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                                    .then(myTable.row(node._DT_CellIndex.row).remove().draw(false))
                                    .catch((error)=>{ throw error });
                            } else {
                                myTable.cell(node._DT_CellIndex.row, 5).data(0);
                            }
                        }
                    });
                    
                    $('#conferirdescProduto').val("").focus();
                }
            } catch (error) {
                console.error(error);
                msgError('Erro ao tentar excluir e atualizar a OT!')
            }
    })

}

function conferirabrirPesqProduto() {

    nIdLojaOrigem = parseInt($("#conferiridlojaorigemmodal").val());

    $("#conferirabrirpesqproduto").modal('show');
}

async function conferirpesquisarProduto() {
    try{
        await ajaxGetAllData('api/conferencia-cega/produto.xsjs?idEmpresa=' + nIdLojaOrigem + '&descProduto=' + $("#conferirpesqProduto").val())
            .then(conferirretornoPesqListaProduto)
            .catch((error)=>{ throw error});
    } catch (error) {
        console.error(error);
        msgError();
    }

}

function conferirretornoPesqListaProduto(conferirrespostaPesqListaProduto) {
    let { data } = conferirrespostaPesqListaProduto || [];
    let conferirdataRetornoPesqProduto = [];

    if (data.length != 0) {
        data.map((registro)=> {

            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = registro.PRECOVENDA;
            let PrecoCusto = registro.PRECOCUSTO;

            conferirdataRetornoPesqProduto.push([
                CodigoProduto
                , CodigoBarras
                , DescProduto
                , PrecoCusto
                , PrecoVenda
                , `<input type="number" class="form-control" id="qtd:` + CodigoBarras + `" value="0"><span style="display: none;">0</span>`
                , `<button type="button" class="btn btn-outline-success btn-xs btn-icon waves-effect waves-themed" title="Confirmar" id="` + CodigoBarras + `" onclick="conferirconfirmarProduto(this.id)"><i class="fal fa-check"></i></button>`
                , `True`
            ]);
        })

    }

    $('#conferirresultado').html(
        `<table id="conferirdt-basic-produto" class="table table-bordered table-hover table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th>Produto</th>
                    <th>Cód. Barras</th>
                    <th>Descrição</th>
                    <th>R$ Custo</th>
                    <th>R$ Venda</th>
                    <th>Qtd</th>
                    <th>Opções</th>
                    <th>Altera Linha<th>
                </tr>
            </thead>
        </table>`
    );

    $('#conferirdt-basic-produto').DataTable({
        data: conferirdataRetornoPesqProduto,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "12%", "targets": 5 },
            { "width": "10%", "targets": 6 },
            {
                visible: false,
                searchable: false, "targets": 7
            }
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

function conferirconfirmarProduto(id) {
    let myTable = $('#conferirtabelaprodutos').DataTable();
    let conferirTabelaResultado = $('#conferirdt-basic-produto').DataTable();
    let dataConferirTabelaResultado = conferirTabelaResultado.rows().data();
    let cCodProduto = dataConferirTabelaResultado[0][0] || "";
    let cDescProduto = dataConferirTabelaResultado[0][2] || "";
    let nPrecoCusto = dataConferirTabelaResultado[0][3] || 0;
    let nPrecoVenda = dataConferirTabelaResultado[0][4] || 0;
    let nQtd = parseInt(document.getElementById('qtd:' + id).value) || 0;
    let cont = 0;
    let BtnOpcao = `
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="` + id + `" onclick="conferirdiminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="`+ id + `" onclick="conferirexcluirProduto(this.id)"><i class="fal fa-trash"></i></button>
    `;
    let dadosTable = [
        cCodProduto, 
        id, 
        cDescProduto, 
        nPrecoCusto, 
        nPrecoVenda, 
        nQtd, 
        BtnOpcao, 
        'True'
    ];

    if (nQtd <= 0) {
        return msgWarning('Atenção!', 'Favor preencher a Quantidade do Produto com um valor Maior que Zero ( 0 )!');
    }

    $("#conferirabrirpesqproduto").modal('hide');

    if (myTable.rows().count() > 0) {
        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == id) {
                myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) + nQtd);
                cont++;
            }
        });
        if (cont === 0) {
            myTable.row.add(dadosTable).draw(false);
        }
    } else {
        myTable.row.add(dadosTable).draw(false);
    }

    conferirTabelaResultado.destroy();

    $('#conferiridlojaorigemmodal, #conferiridlojadestinomodal').prop("disabled", true).select2();
    $('#conferirdt-basic-produto').empty();
    $('#conferirpesqProduto').val("");
    $('#conferirdescProduto').val("").focus();

}

// Funcão para Salvar os Dados da OT que está passando por Conferência no Destino
async function conferirsalvarot() {
    try{
        let myTable = $('#conferirtabelaprodutos').DataTable();
        let qtdRowsTable = myTable.rows().count();
        let dadosdetalheot = [];
        let nQtdTotalItens = 0;

        if (qtdRowsTable === 0 || qtdRowsTable > 200) {
            let msg = !qtdRowsTable ? 'Informar os produtos da OT!' : 'A OT não pode conter mais de 200 tipos de produtos!';
            return msgWarning('Atenção!', msg);
        }

        $("#cot").modal('hide');

        animationLoadingStart('Enviando Dados...', 1, false);

        for (var i = 0; i < qtdRowsTable; i++) {
            let rowTable = myTable.rows();
            let cIdProduto = rowTable.cell(i, 0).data();
            let nQtdProduto = parseInt(rowTable.cell(i, 5).data());
            let nVlrVenda = parseFloat(rowTable.cell(i, 4).data());
            let nVlrCusto = parseFloat(rowTable.cell(i, 3).data());

            dadosdetalheot[i] = {
                "IDPRODUTO": cIdProduto
                , "QTDEXPEDICAO": 0
                , "QTDRECEPCAO": nQtdProduto
                , "QTDDIFERENCA": 0
                , "QTDAJUSTE": 0
                , "VLRUNITVENDA": nVlrVenda
                , "VLRUNITCUSTO": nVlrCusto
                , "STCONFERIDO": 'True'
                , "IDUSRAJUSTE": ''
                , "STATIVO": 'True'
                , "STFALTA": 'False'
                , "STSOBRA": 'False'
            };
            nQtdTotalItens += nQtdProduto;
        }

        let dados = [{
            "QTDTOTALITENSRECEPCIONADO": nQtdTotalItens
            , "DTRECEPCAO": ""
            , "IDOPERADORRECEPTOR": IDFuncionarioLogin
            , "DTULTALTERACAO": ""
            , dadosdetalheot
            , "IDSTATUSOT": parseInt(4)
            , "IDRESUMOOT": parseInt(nIdResumoOT)
        }];

        await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
            .then(async () =>{
                await msgSuccess("Recepção Salva com Sucesso!");

                ListaOrdemTransferencia();
            })
            .catch((error)=>{ throw error });

    } catch (error) {
        console.error(error);
        msgError('Erro ao tentar salvar a Recepção!');
    }
}

async function finalizarot(id) {
    try{
        idchave = id.split(":");
        id = idchave[0];
        nQtdConferido = idchave[5];

        let dados = [{
            "IDOPERADORRECEPTOR": IDFuncionarioLogin
            , "IDSTATUSOT": parseInt(6)
            , "IDRESUMOOT": parseInt(id)
            , "QTDCONFERENCIA": parseInt(nQtdConferido)
        }];

        animationLoadingStart('Finalizando OT, aguarde...', 1, false);

        await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
            .then(async () =>{
                await msgSuccess('OT Finalizada com sucesso!');
                ListaOrdemTransferencia();
            })
            .catch((error)=>{ throw error });

    } catch (error) {
        console.error(error);
        msgError('Erro ao tentar salvar a Recepção!');
    }
}

//? ======================================================== FIM ROTINA CONFERIR ORDEM DE TRANSFERENCIA ======================================================== //

//========== INICIO Rotina - Create Edit Cancel - VOUCHER ==========//
// Autor: Hendryw Deyvison
// E-mail: hendryw.deyvison@gmail.com
// Data: 15/07/2024
// Data Atualizacao: 29/09/2024

//---Variaveis Globais das funçoes da rotina---//
var id = 0;
var dadosVendaTabela = [];
var idProd = 0;
var dadosProdutoTabela = [];
var ctdPreencheCNPJ = 0;
var valorProdutosVoucher = [];
var dataRetornoVendaDetalheVoucher = [];
var dadosListaVoucher = [];
var dadosUpdateVoucher = [];
var voucher = [];
var detalheVoucher = [];
var vendaDetalheVoucher = [];

//----------INICIO Funcoes Globais da Rotina----------//

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

    if(valor){
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
    
    if(valor){
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

function ValidaCpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
    // Elimina CPFs invalidos conhecidos	
    if (cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999") {
        Swal.fire({
            type: 'error',
            title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
            timer: 15000
        })
        $("#CPFCNPJ").val('');
        $("#CPFCNPJ").focus();
    }
    // Valida 1o digito	
    add = 0;
    for (i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9))) {
        Swal.fire({
            type: 'error',
            title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
            timer: 15000
        })
        $("#CPFCNPJ").val('');
        $("#CPFCNPJ").focus();
    }
    // Valida 2o digito	
    add = 0;
    for (i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10))) {
        Swal.fire({
            type: 'error',
            title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
            timer: 15000
        })
        $("#CPFCNPJ").val('');
        $("#CPFCNPJ").focus();
    }
    return true;
}

async function ValidaCNPJ(cnpj) {
    let stCnpj = true;
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj == '') stCnpj = false;

    if (cnpj.length != 14)
        stCnpj = false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" ||
        cnpj == "11111111111111" ||
        cnpj == "22222222222222" ||
        cnpj == "33333333333333" ||
        cnpj == "44444444444444" ||
        cnpj == "55555555555555" ||
        cnpj == "66666666666666" ||
        cnpj == "77777777777777" ||
        cnpj == "88888888888888" ||
        cnpj == "99999999999999") {
        stCnpj = false;
    }
    // Valida DVs
    tamanho = cnpj.length - 2
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) {
        stCnpj = false;
    }
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) {
        stCnpj = false;
    }

    if(!stCnpj){
        return Swal.fire({
            type: 'error',
            title: 'CNPJ Inválido, verifique o CNPJ digitado e tente novamente',
            timer: 15000
        }).then(()=>{
            $("#CPFCNPJ").val('').focus()

            return false;
        })
    }

    return true;

}

async function validaCEP(cep, verificarNaApi = false) {
    const regex = /^[0-9]{5}-?[0-9]{3}$/;
    
    if (!regex.test(cep)){
        return false;
    }

    if(verificarNaApi){
        let respCep = await getDadosEnderecoViaCep_API_externa(cep);

        return !(respCep?.erro == 'true'); 
    }

    return true;
}

function validaTelefoneOrCelular(telefoneOrCelular) {
    telefoneOrCelular = String(telefoneOrCelular).replace(/\D/g, "");

    if (telefoneOrCelular?.length < 10) return false;

    const regex = /^(\(?\d{2}\)?\s?)?(\d{4,5}\-?\d{4})$/;
    return regex.test(telefoneOrCelular);
}

function validaEmail(email) {
    email = String(email);

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
        dataHoraInicio.setUTCHours(0, 0, 0, 0);
        dataHoraFim.setUTCHours(0, 0, 0, 0);
    }

    return Math.ceil(Math.abs(dataHoraFim - dataHoraInicio) / (1000 * 60 * 60 * 24));
}

function validar_Cpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
    // Elimina CPFs invalidos conhecidos	
    if (cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999") {

        $("#nuCPFCNPJmodal").focus();
        return false;
    }

    // Valida 1o digito
    add = 0;
    for (i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9))) {

        $("#nuCPFCNPJmodal").focus();
        return false;
    }
    // Valida 2o digito	
    add = 0;
    for (i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10))) {

        $("#nuCPFCNPJmodal").focus();
        return false;
    }
    return true;
}

function validar_Cnpj(cnpj) {

    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj == '') return false;

    if (cnpj.length != 14)
        return false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" ||
        cnpj == "11111111111111" ||
        cnpj == "22222222222222" ||
        cnpj == "33333333333333" ||
        cnpj == "44444444444444" ||
        cnpj == "55555555555555" ||
        cnpj == "66666666666666" ||
        cnpj == "77777777777777" ||
        cnpj == "88888888888888" ||
        cnpj == "99999999999999")
        return false;
    $("#nuCPFCNPJmodal").focus();

    // Valida DVs
    tamanho = cnpj.length - 2
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;
    $("#nuCPFCNPJmodal").focus();

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
        return false;
    $("#nuCPFCNPJmodal").focus();

    return true;

}

function animationLoadingFormClient(msg = 'Enviando dados do Cliente, aguarde...') {
    $('#notificacaoModalCadastroCliente').html(`
        <div class="alert alert-success alert-dismissible fade show text-center" role="alert" style="margin: auto !important; text-align: center !important">
          <button type="button" class="btn text-primary">
                <span class="spinner-border spinner-border-sm text-primary"></span>
                ${msg}
            </button>
        </div>
    `);
}

function msgSuccessFormCliente(msgSuccess = 'Dados Carregados Com Sucesso') {
    $('#notificacaoModalCadastroCliente').html(`
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true"><i class="fal fa-times"></i></span>
            </button><strong>Atenção!</strong> 
            ${msgSuccess}!</div>
      
    `);

    $('#notificacaoModalCadastroCliente button').focus();
}

function msgWarningCadastroCliente(element = $('#notificacaoModalCadastroCliente'), msgError, stUltimaInstancia = true) {
    $('#notificacaoModalCadastroCliente').html(`
        <div class="alert alert-danger alert-dismissible h6 fade show" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">
                    <i class="fal fa-times"></i>
                </span>
            </button>
            <span>
                <strong>Atenção!</strong> ${msgError}
            </span>
        </div>
    `);

    $('#notificacaoModalCadastroCliente button').focus();

    !stUltimaInstancia && animationLoadingStop();

    if ($(element).hasClass('select2')) {
        setTimeout(() => $(element).select2('open').focus(), 1000);
    } else {
        setTimeout(() => {
            let vlElement = $(element).val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "") || "";
            
            $(element).val(vlElement).focus();
        }, 1000);
    }
}

function returnMsgClientInsertOrUpdateSuccess(stUltimaInstancia, cpfOuCnpj) {
    $('#detClienteVoucher, #detVoucherProdutos, #detVendaVoucher').modal('hide');

    if (!stUltimaInstancia) {
        return msgSuccess('Cliente Cadastrado/Atualizado com Sucesso!');
    } else {
        $('#nuCPFCNPJmodal').val(cpfOuCnpj.length > 11 ? maskCNPJ(cpfOuCnpj) : maskCPF(cpfOuCnpj))
        
        $('#swal2-validation-message').html(`
            <h6 class="text-success fw-700" >CLIENTE CADASTRADO/ATUALIZADO COM SUCESSO, CONFIRME PARA GERAR O VOUCHER!</h6>
        `);
    }

}

async function verificaSePrecisaAtualizarCadastroCliente(cliente){
    let propsCliente = [
        "TPCLIENTE",
        "DSNOMERAZAOSOCIAL",
        "DSAPELIDONOMEFANTASIA",
        "NUCPFCNPJ",
        "NURGINSCESTADUAL",
        "NUCEP",
        "NUIBGE",
        "EENDERECO",
        "EBAIRRO",
        "ECIDADE",
        "SGUF",
        "EEMAIL",
        "NUTELCOMERCIAL",
        "NUTELCELULAR",
        "IDINDICACAOIE",
    ];

    let stValido = true;
    let regexCaracteresEspecias = /^[A-Za-zÀ-ÿ\s]+$/;

    for (prop of propsCliente) {
        if (prop == "DSAPELIDONOMEFANTASIA"){
            if (cliente["TPCLIENTE"] !== 'JURIDICA'){
                continue;
                
            } else {
                if(cliente["DSAPELIDONOMEFANTASIA"]?.length < 3){
                    stValido = false;
                    break;
                }
                
                if (!regexCaracteresEspecias.test(cliente["DSAPELIDONOMEFANTASIA"])) {
                    stValido = false;
                    break;
                }
            }
        }
        
        if(prop == "DSNOMERAZAOSOCIAL"){
            
            if(cliente["DSNOMERAZAOSOCIAL"]?.length < 5){
                stValido = false;
                break;
            }
            
            if (!regexCaracteresEspecias.test(cliente["DSNOMERAZAOSOCIAL"])) {
                stValido = false;
                break;
            }
        }
        
        if (prop == "EBAIRRO" && !cliente["EBAIRRO"]){
            continue;
        }
        
        if (prop == "EEMAIL" && !cliente["EEMAIL"]){
            continue;
        }
        
        if ( !String(cliente[prop])?.trim()) {
            stValido = false;
            break;
        }
    }

    return stValido;
}

///----------FIM Funcoes Globais da Rotina----------///

///----------INICIO Funçoes com API´s Externas ---------------------///

//---Traz todos os dados do CNPJ(IE e Token CSC), porém, tem acesso limitado a 3 consultas por minuto
const URL_PUBLICAWS = 'https://publica.cnpj.ws/cnpj/{CNPJ}';
const URL_MINHA_RECEITA = 'https://minhareceita.org/{CNPJ}';
const URL_RECEITAWS = 'https://www.receitaws.com.br/v1/cnpj/{CNPJ}';
const URL_VIA_CEP = 'https://viacep.com.br/ws/{CEP}/json/'

async function getDadosCNPJRedundancia_API_externa(cnpj) {
    return $.get(URL_RECEITAWS.replace('{CNPJ}', cnpj))
        .then((data) => {
            let { status, message } = data || undefined;

            if (status == 'OK') {
                status = 200;
            }

            if (status !== 200) {
                throw { status, message }
            }

            return { status, data }
        })
        .catch((respError) => {
            let { status, message } = respError || undefined;

            if (status == 'ERROR') {
                status = 400;
            }

            return { status, message }
        }).done((data) => data.descApi = "API-receitaws");
}

async function getDadosCNPJComIE_API_externa(cnpj) {
    return $.get(URL_PUBLICAWS.replace('{CNPJ}', cnpj))
        .then((data) => {
            let status = data?.status || 200;

            if (status == 'OK') {
                status = 200;
            }

            return { status, data }
        })
        .catch((respError) => {
            let { status, message, responseJSON } = respError || undefined;

            if (status == 'ERROR') {
                status = 400;
            }

            message = responseJSON?.detalhes || responseJSON?.message; 

            return { status, message }
        })
        .done((data) => data.descApi = "API-publicaws");
}

async function getDadosExistenciaCNPJ_API_externa(cnpj) {
    let data = await $.get(URL_MINHA_RECEITA.replace('{CNPJ}', cnpj))
        .then((data) => { return { status: 200, data } })
        .catch((respError) => { 
            let { status, message } = respError || undefined;

            if (status == 'ERROR') {
                status = 400;
            }

            message = respError?.responseText ? JSON.parse(respError?.responseText)?.message : undefined;

            return { status, message } 
        }).done((data) => data.descApi = "API-minhareceita");

    if (data?.status !== 200 && data?.status !== 400) {
        return await getDadosCNPJRedundancia_API_externa(cnpj);
    }

    return data;
}

//--Traz o endereço de acordo com o CEP
async function getDadosEnderecoViaCep_API_externa(cep) {
    cep = cep.replace(/\D/g, "");

    return $.get(URL_VIA_CEP.replace('{CEP}', cep))
        .then((data) => {
            let { erro, status} = data || undefined;

            if (!erro) {
                status = 200;
            }

            if (status !== 200) {
                throw { status: 429, message: 'CEP INVÁLIDO OU NÃO ENCONTRADO, verifique e tente novamente!' }
            }

            return { status, data}
        })
        .catch((respError) => {
            let { status, message, statusText } = respError || undefined;

            message = statusText || message;

            return { status, message }
        })
}

//--Traz todas as UFs
function get_UFs() {
    return $.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome&view=nivelado');
}

//--Traz todas as cidades da UF
function get_Cidades_UF(idUF) {
    return $.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${idUF}/municipios?view=nivelado`);
}

//--Traz todos os bairros da cidade
function get_Bairros_Cidade(idCidade) {
    return $.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${idCidade}/subdistritos?view=nivelado`)
}

async function busca_e_valida_dados_empresa_com_API_externa(cnpjCliente, stUltimaInstancia = false){
    cnpjCliente = cnpjCliente?.replace(/\D/g, "");

    let objCliente = await getDadosExistenciaCNPJ_API_externa(cnpjCliente);
    let inscricaoEstadual;
    let razao;
    let fantasia;
    let cnae;
    let dataCriacaoEmpresa;
    let cep;
    let endereco;
    let numeroEndereco;
    let complemento;
    let email;
    let tel1;
    let tel2;

    if (objCliente?.status == 200) {
        const dadosComIE = await getDadosCNPJComIE_API_externa(cnpjCliente);

        if (dadosComIE.status == 200){
            objCliente = dadosComIE;
        } 

    } else {
        !stUltimaInstancia && msgError(objCliente?.message || 'Erro ao tentar preencher os dados do cliente, recarregue e tente novamente!');
        return msgWarningCadastroCliente($("#CPFCNPJ"), objCliente?.message || 'Erro ao tentar preencher os dados do cliente, recarregue e tente novamente!')
    }

    dadosCNPJ = objCliente.data;
    razao = dadosCNPJ?.razao_social || dadosCNPJ?.nome || "";
    fantasia = dadosCNPJ?.estabelecimento?.nome_fantasia || dadosCNPJ?.fantasia || dadosCNPJ?.nome_fantasia || razao;
    inscricaoEstadual = dadosCNPJ?.estabelecimento?.inscricoes_estaduais[0]?.inscricao_estadual || "";
    cnae = dadosCNPJ?.estabelecimento?.atividade_principal?.id || dadosCNPJ?.atividade_principal[0].code || dadosCNPJ?.cnae_fiscal || ""
    dataCriacaoEmpresa = dadosCNPJ?.estabelecimento?.data_inicio_atividade || dadosCNPJ?.data_situacao || dadosCNPJ?.data_inicio_atividade || "";
    tel1 = (dadosCNPJ?.estabelecimento?.ddd1 + dadosCNPJ?.estabelecimento?.telefone1) || dadosCNPJ?.telefone || (dadosCNPJ?.ddd_telefone || dadosCNPJ?.ddd_telefone_1) || "";
    tel2 = (dadosCNPJ?.estabelecimento?.ddd2 + dadosCNPJ?.estabelecimento?.telefone2) || dadosCNPJ?.ddd_telefone_2 || "";
    email = dadosCNPJ?.estabelecimento?.email || dadosCNPJ?.email || "";
    cep = dadosCNPJ?.estabelecimento?.cep || dadosCNPJ?.cep || "";
    endereco = dadosCNPJ?.estabelecimento?.logradouro || dadosCNPJ?.logradouro || "";
    numeroEndereco = dadosCNPJ?.estabelecimento?.numero || dadosCNPJ?.numero || "";
    complemento = dadosCNPJ?.estabelecimento?.complemento || dadosCNPJ?.complemento || "";

    return {
        razao,
        fantasia,
        inscricaoEstadual,
        cnae,
        dataCriacaoEmpresa,
        tel1,
        tel2,
        email,
        cep,
        endereco,
        numeroEndereco,
        complemento,
    };
}

async function preenche_cadastro_empresa_com_dados_de_API_externa(cnpjCliente, stUltimaInstancia = false) {
    let {
        razao,
        fantasia,
        inscricaoEstadual,
        cnae,
        dataCriacaoEmpresa,
        tel1,
        tel2,
        email,
        cep,
        endereco,
        numeroEndereco,
        complemento,
    } = await busca_e_valida_dados_empresa_com_API_externa(cnpjCliente, stUltimaInstancia) || "";

    if (razao) {

        cnae = cnae?.replace(/\D/g, "") ? cnae : "";
        tel1 = tel1 ? tel1?.replace(/\D/g, "") : "";
        tel2 = tel2 ? tel2?.replace(/\D/g, "") : tel1;
        cep = cep ? cep?.replace(/\D/g, "") : "";

        tel1 = tel1 ? maskFone(tel1) : "";
        tel2 = tel2 ? maskFone(tel2) : "";
        cep = cep ? maskCEP(cep) : "";

        $("#IE").val(inscricaoEstadual)
        $("#CNAE").val(cnae);
        $("#DataNascimentoCriacao").val(dataCriacaoEmpresa);
        $("#NomeClienteRazao").val(razao);
        $('#sobrenomeNomeFan').val(fantasia)
        $("#NuCEP").val(cep);
        $("#Endereco").val(endereco);
        $("#NuEndereco").val(numeroEndereco);
        $("#Complemento").val(complemento);
        $("#email").val(email);
        $("#TelefoneCliente").val(tel1);
        $('#TelefoneClienteEmpresaComercial').val(tel2);

        if(cep) {
            await valida_e_preenche_cep_empresa_com_API_externa(cep, stUltimaInstancia);
        }
        
        return true;
    }

    return false;
}

async function valida_dados_cliente_em_ultima_instancia(cpfOrCnpjCliente, stAtualizaCadastro = false) {
    try {
        $('#notificacaoModalCadastroCliente').html(``);

        cpfOrCnpjCliente = cpfOrCnpjCliente?.replace(/\D/g, "");

        if(!stAtualizaCadastro){
            if ($('#tipoClienteEmpresa').val() == 'CNPJ') {
                animationLoadingFormClient('Carregando dados do Cliente direto da Receita Federal, aguarde...');

                let status_preenchimento = await preenche_cadastro_empresa_com_dados_de_API_externa(cpfOrCnpjCliente, true);

                $('#CadCliente').removeClass('d-none').attr('onclick', 'validaDadosDoFormCliente(true)');

                if (status_preenchimento) {
                    msgSuccessFormCliente('Preenchimento Realizado Com Sucesso!');
                }

            } else {
                msgSuccessFormCliente('CPF Válido, prossiga com o restante do cadastro!');
            }

        } else {
            modalCadastroCliente(cpfOrCnpjCliente, true);
        }
    } catch (error) {
        msgWarningCadastroCliente(undefined, 'Error ao Validar os dados, recarregue e tente novamente!');
        console.log(error);
    }
}

async function modal_Preenchimento_CNPJ(cnpjEmpresaVoucherSemFormato, stUltimaInstancia = false) {
    let cnpjEmpresaVoucher = cnpjEmpresaVoucherSemFormato.replace(/\D/g, "")

    if (validar_Cnpj(cnpjEmpresaVoucher)) {
    
        if (!stUltimaInstancia){
            return Swal.fire({
                title: 'Deseja Autocompletar ou Atualizar as Informações deste Cliente Automaticamente de Acordo Com o Cadastro na Receita Federal?',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
            }).then(async (result) => {
                if (result.value == true) {
                    animationLoadingStart("Carregando os dados do CNPJ... Por favor aguarde!");


                    let status = await preenche_cadastro_empresa_com_dados_de_API_externa(cnpjEmpresaVoucher);

                    if (status) {
                        await msgSuccess('Dados Preenchidos com Sucesso!');
                    }

                    $('#select2-idIndicacaoIE-container').focus();
                }
            })
        }

        animationLoadingFormClient('Buscando Dados, aguarde...');

        await preenche_cadastro_empresa_com_dados_de_API_externa(cnpjEmpresaVoucher, stUltimaInstancia);

        $('#notificacaoModalCadastroCliente').html('');

        return true;
    } else {
        msgWarningCadastroCliente(undefined, 'CNPJ Inválido, verifique e tente atualizar novamente!')
    }
}

async function valida_e_preenche_cep_empresa_com_API_externa(cepSemFormato, stUltimaInstancia = false) {
    let cep = cepSemFormato?.replace(/\D/g, "");

    try{

        if(cep){
            if (await validaCEP(cep)) {
                let dadosCep = await getDadosEnderecoViaCep_API_externa(cep).then((resp)=>{ 
                   if(resp.status !== 200){
                        throw resp 
                   }

                   return resp.data;
                })
                

                $("#Endereco").val(dadosCep?.logradouro);
                $("#Bairro").val(dadosCep?.bairro);
                $("#Cidade").val(dadosCep?.localidade);
                $("#Estado").val(dadosCep?.uf);
                $("#NuIBGE").val(dadosCep?.ibge);

                if($('#tipoClienteEmpresa').val() == 'CPF'){
                    $('#idIndicacaoIE').val((dadosCep?.uf == 'DF' ? 2 : 9)).trigger('change');
                }

            } else{
                $("#Bairro, #NuIBGE, #Cidade, #Estado").val('');

                !stUltimaInstancia && msgError('CEP Inválido, verifique e tente novamente!');
                return msgWarningCadastroCliente($('#NuCEP'), 'CEP Inválido, verifique e tente novamente!');
            }
        }

    }catch (e) {
        console.log("Erro ao retornar o autocomplete pelo CEP, ERROR: " + (e?.message || e));

        !stUltimaInstancia && msgError(e?.message || 'Erro ao tentar preencher os dados do cliente, recarregue e tente novamente!');
        return msgWarningCadastroCliente(undefined, e?.message || 'Erro ao tentar preencher os dados do cliente, recarregue e tente novamente!')

    }

}

///----------FIM Funçoes com API´s Externas ---------------------///

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
            $('#matricula').on('keypress', (e) => { if (e.keyCode == 13) $('#senha').val('').focus() });
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

async function modalMotivoCriacaoVoucher() {
    let motivoTroca;

    return Swal.fire({
        title: 'Motivo da troca?',
        html: `
            <div class="d-block m-auto">
                <div class="input-group d-block text-dark text-left pt-0">
                    <input type="text" id="motivoTroca" class="swal2-input m-0" autocomplete="off" placeholder="Digite o Motivo" style="text-transform: uppercase">
                    <small class="fw-700">*Mínimo 10 caracteres</small>
                </div>
            </div>
        `,
        width: '25rem',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Sair',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        onOpen: () => {

            $('#motivoTroca').on('keyup', (e) => {
                $('#motivoTroca').val(e.target.value?.replace(/[^a-zA-Z0-9\s]/g, '')?.replace(/\s{2,}/g, ' '));
            });

            $('#motivoTroca').focus().on('keypress', (e) => { if (e.keyCode == 13) Swal.clickConfirm() });
            $('#swal2-validation-message').addClass(' text-danger fw-700');

        },
        preConfirm: () => {
            motivoTroca = $('#motivoTroca').val()?.trim();

            if (!motivoTroca?.length || motivoTroca?.length < 10) {
                $('#motivoTroca').focus();
                return Swal.showValidationMessage(`Adicione o Motivo da Troca Com no Mínimo 10 Caracteres!`);
            }

            if (motivoTroca?.length > 200) {
                $('#motivoTroca').focus();
                return Swal.showValidationMessage(`Motivo da Troca Está Muito Grande, Abrevie!`);
            }
        }
    }).then((result) => {
        if (result.value) {
            return motivoTroca;
        }

        return false;
    })
}

async function modalCpfOuCnpjDoClienteParaVoucher(cpfCnpjCliente) {
    let dadosCliente;

    return Swal.fire({
        title: 'Insira o CPF ou CNPJ do cliente',
        html: `
            <div class="d-block m-auto" style="width: 50%;">
                <div class=" input-group text-dark pt-0 mb-3" >
                    <input type="text" id="nuCPFCNPJmodal" class="swal2-input m-0 " maxlength="18" autocomplete="off" onkeyup="mascaraMultiAutomatica(this)" onpaste="mascaraMultiAutomatica(this)" placeholder="Digite o CPF/CNPJ" >
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Sair',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        onOpen: () => {
            cpfCnpjCliente = cpfCnpjCliente?.replace(/\D/g, "");

            $('#nuCPFCNPJmodal').focus().val(cpfCnpjCliente || '').on('keypress', (e) => {
                if (e.keyCode == 13) {
                    Swal.clickConfirm();
                } else {
                    Swal.resetValidationMessage();
                }
            });

            $('#swal2-validation-message').addClass(' text-danger fw-700');
        },
        preConfirm: async () => {
            let CPFCNPJFormatado = $('#nuCPFCNPJmodal').val()?.replace(/\D/g, "");

            $('#swal2-validation-message').addClass('text-danger fw-700');

            if (CPFCNPJFormatado?.length) {
                
                if (CPFCNPJFormatado?.length <= 11 && !validar_Cpf(CPFCNPJFormatado)) {
                    $('#nuCPFCNPJmodal').val(maskCPF(CPFCNPJFormatado));
                    return Swal.showValidationMessage('CPF Inválido, verifique o CPF digitado e tente novamente');

                }

                if (CPFCNPJFormatado.length > 11 && !validar_Cnpj(CPFCNPJFormatado)) {
                    $('#nuCPFCNPJmodal').val(maskCNPJ(CPFCNPJFormatado));
                    return Swal.showValidationMessage('CNPJ Inválido, verifique o CNPJ digitado e tente novamente');

                }
                return new Promise(async (resolve, reject)=>{

                    await ajaxGet(`api/gerencia/cliente.xsjs?numeroCpfCnpj=${CPFCNPJFormatado}`)
                        .then(async (response) => {
                            let { data } = response || [];

                            if (!data?.length) {
                                setTimeout(() => {
                                    abreCadastroClienteSemRegistroUltimaInstancia(CPFCNPJFormatado, false);

                                    resolve()
                                }, 5000)
                                return Swal.showValidationMessage(`Cliente sem cadastro, Faça o cadastro ou verifique o CPF/CNPJ inserido! Abrindo tela de cadastro, aguarde...`)
                            } else {
                                dadosCliente = data[0];

                                let stAtualizado = await verificaSePrecisaAtualizarCadastroCliente(dadosCliente);

                                if (!stAtualizado) {

                                    setTimeout(() => {
                                        abreCadastroClienteSemRegistroUltimaInstancia(CPFCNPJFormatado, true);

                                        resolve()
                                    }, 5000)

                                    $('#swal2-validation-message').removeClass('text-danger').addClass('text-info');

                                    return Swal.showValidationMessage(`Cliente com cadastro desatualizado, Atualize os dados! Abrindo cadastro do cliente, aguarde...`);
                                }
                            
                            }

                            Swal.resetValidationMessage();
                            dadosCliente = data[0];

                            resolve();
                        })
                        .catch((error) => {
                            console.log(error);
                            Swal.hideLoading();
                            setTimeout(()=>reject(), 1000);

                            Swal.resetValidationMessage();

                            return Swal.showValidationMessage('Erro ao buscar dados do cliente, recarregue e tente novamente!')
                        })
                    })
            } else {
                Swal.resetValidationMessage();

                return Swal.showValidationMessage('CPF ou CNPJ Vazio, Digite e Tente Novamente');
            }
        }
    }).then((result) => {
        if (result.value) {
            return dadosCliente;
        }

        return false;
    })

}

async function modalDeSelecaoDeTipoDeTroca() {
    let tipoTroca;

    return Swal.fire({
        title: 'Tipo da troca?',
        html: `<div class="d-block m-auto" style="width: 50%;">
                <label class="form-label" for="matricula">Tipo</label>
                <div class="pb-2">
                    <select id="tipoTroca" class="select2">
                        <option value=''>Selecione</option>
                        <option value='CORTESIA'>CORTESIA</option>
                        <option value='DEFEITO'>DEFEITO</option>
                    </select>
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
        backdrop: true,
        onOpen: () => {
            $('#tipoTroca').select2();
            $('#tipoTroca').select2('focus');

            $('#swal2-validation-message').addClass('text-danger fw-700');

            $('#tipoTroca').on('select2:select', () => {
                $('button.swal2-confirm').focus();
                $('swal2-container').on('keypress', (e) => { if (e.keyCode == 13) Swal.clickConfirm() })
            })
        },
        preConfirm: () => {
            tipoTroca = $('#tipoTroca').val();

            if (!tipoTroca) {
                $('#tipoTroca').val('').trigger('change');
                $('#tipoTroca').select2("focus");

                return Swal.showValidationMessage(`Selecione o Tipo da Troca Antes de Prosseguir!`);;

            }
        }
    }).then(async (result) => {
        if (result.value) {
            return tipoTroca;
        }

        return false;
    });
}

///----------FIM Modais de Interação Com o Usuario----------///

async function telaCriacaoEdicaoVouchers(stReloadingHtml, idVoucher) {
    try {
        if (stReloadingHtml) {
            animationLoadingStart();

            await $.get("gerencia_action_tela_search_and_create_voucher.html", async (respHtml) => {
                $("#js-page-content").html(respHtml);

                $('.dataAtual').text(dataAtual);

                $('#dtconsultainicio').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVoucherEmitido() });
                $('#dtconsultafim').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVoucherEmitido() });

                $('#NVoucher').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVoucherEmitido() });

                $('#NVoucher').focus();

                $('.DescTituloVoucher').html(`
                    <i class='subheader-icon fal fa-chart-area'></i> Vouchers
                `);

                animationLoadingStop();

                if (!idVoucher) {
                    await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?idEmpresa=${IDEmpresaLogin}&stStatus='EM ANALISE'`, 'Carregando Dados...')
                        .then(retornoListaVouchersEmProcessamento)
                        .catch((error) => { throw error; });
                } else {
                    await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Dados...')
                        .then(retornoListaVouchers)
                        .catch((error) => { throw error; })
                }

            }).fail((error) => { throw error; })

        } else {
            $('#btnCadCliente').attr('value', '');
            $('#btnCadVoucher').addClass('d-none');
            $('.tabelaProduto').addClass('d-none');
            $("#resultadoProduto").DataTable().clear().destroy();
            $('.tabelaVenda').removeClass('d-none');
            $("#voltaTela").attr('onclick', 'telaCriacaoEdicaoVouchers(true)');
            $("#resultadoVendaClienteVoucher").DataTable().destroy();
            $("#resultadoVendaClienteVoucher").DataTable({
                paging: true,
                pageLength: 10,
                searching: true,
                info: true,
                deferRender: true,
                responsive: true,
                scrollY: "1000px",
                scrollX: true,
                scrollCollapse: true,
                columnDefs: [
                    {
                        targets: [1, 8],
                        className: 'text-center'
                    },
                    {
                        targets: [6],
                        type: 'currency-brl'
                    },
                    {
                        targets: [7],
                        type: 'date-time-br'
                    },

                ],
                columns: [
                    { width: '5%' },
                    { width: '5%' },
                    { width: '10%' },
                    { width: '25%' },
                    { width: '10%' },
                    { width: '20%' },
                    { width: '10%' },
                    { width: '10%' },
                    { width: '5%' }
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
            });
        }

        return true;

    } catch (error) {
        console.log(error);
        animationLoadingStop();
        msgError();
    }

}

function retornoListaVouchersEmProcessamento(respostaListaVouchersEmProcessamento) {
    animationLoadingStop();
    let { data } = respostaListaVouchersEmProcessamento;
    let dadosTable = [];
    let indice = 1;
    let htmlLista = `
        <div id="panel-1" class="panel">
            <div class="panel-container show">
                <div class="panel-content">
                    <div>
                        <table id="detProdVoucherProcessamento" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                            <thead class="bg-primary-600">
                                <tr>
                                    <th>#</th>
                                    <th>Data Criação</th>
                                    <th>Nº Voucher</th>
                                    <th>Cliente</th>
                                    <th>Tipo Troca</th>
                                    <th>Status Voucher</th>
                                    <th>Dias Passados</th>
                                    <th>Opção</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (data?.length) {
        for (let { voucher } of data) {
            let idVoucher = voucher?.IDVOUCHER;
            let dataVoucher = voucher?.DTINVOUCHER;
            let dataVoucherFormatada = `<span style="color: blue">${voucher?.DTINVOUCHERFORMATADO}</span>`;
            let nuVoucher = `<span style="color: blue">${ocultaParteDosDadosVoucher(voucher?.NUVOUCHER)}</span>`;
            let clienteVoucher = `<span style="color: blue">${voucher?.DSNOMERAZAOSOCIAL}</span>`;
            let tipoTroca = `<span style="color: red">${voucher?.STTIPOTROCA}</span>`;
            let stStatus = `<span style="color: blue">${voucher?.STSTATUS}</span>`;
            let pesqVoucher = `
                <div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Visualizar Voucher" onclick="pesquisaVoucherEmitido(this.id)" id="${idVoucher}"><span class="fal fa-search p-1"></span></button>
                </div>
            `;

            const DATAHORAVOUCHER = new Date(dataVoucher.slice(0, 10));
            const DATAHORAATUAL = new Date();
            const DIFERENCAEMDIAS = `<span style="color: red">${Math.ceil(Math.abs(DATAHORAATUAL - DATAHORAVOUCHER.getTime()) / (1000 * 60 * 60 * 24))}</span>`;

            dadosTable.push([
                indice,
                dataVoucherFormatada,
                nuVoucher,
                clienteVoucher,
                tipoTroca,
                stStatus,
                DIFERENCAEMDIAS,
                pesqVoucher,
            ]);

            indice++;
        }

        return Swal.fire({
            type: 'info',
            title: 'Trocas em Processamento ou Não Liberadas',
            html: htmlLista,
            width: '70%',
            showCancelButton: true,
            showCloseButton: true,
            cancelButtonColor: '#17a2b8',
            confirmButtonText: 'Verificar Todos',
            cancelButtonText: 'Prosseguir',
            onOpen: () => {
                $('#detProdVoucherProcessamento').DataTable({
                    data: dadosTable,
                    responsive: true,
                    deferRender: true,
                    columnDefs: [
                        {
                            type: 'date-time-br',
                            targets: [1],
                            className: 'text-left'
                        },
                        {
                            targets: [0, 2, 3, 4, 5, 6],
                            className: 'text-left'
                        },
                    ]
                })
            }
        }).then(async (resp) => {
            if (resp.value) {
                await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?idEmpresa=${IDEmpresaLogin}&stStatus='EM ANALISE'&pageSize=500`, 'Carregando Dados...')
                    .then(retornoListaVouchers)
                    .catch((error) => { throw error; })
            }
        })

    }
}

async function pesquisaVoucherEmitido(idVoucher = '') {
    try {
        let dadosUser = await getCurrentUser()?.user;
        let numerovoucher = idVoucher ? "" : $("#NVoucher").val()?.trim() || "";
        let userFuncao = dadosUser?.DSFUNCAO;
        let grupoEmpresa = dadosUser?.IDSUBGRUPOEMPRESARIAL;
        let idEmpresa = !numerovoucher ? dadosUser?.IDEMPRESA : "";
        let dtInicio = (!numerovoucher && !idVoucher) ? $('#dtconsultainicio').val() : "";
        let dtFim = (!numerovoucher && !idVoucher) ? $('#dtconsultafim').val() : "";

        if (!dadosUser) {
            return msgWarning('Erro ao carregar as informações do Usuário, faça o logoff e entre novamente');
        }

        let numerovoucherFormatado = numerovoucher.split('-');

        if (numerovoucherFormatado.length > 2) {
            numerovoucher = numerovoucherFormatado.join('-');
            $("#NVoucher").val(numerovoucher);
        } else {
            numerovoucher = numerovoucher.replace(/[^0-9]/g, '');
            $("#NVoucher").val(numerovoucher);
        }

        await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}&dataPesquisaInicio=${dtInicio}&dataPesquisaFim=${dtFim}&dadosVoucher=${numerovoucher}&subgrupoEmpresa=${grupoEmpresa}&idEmpresa=${idEmpresa}&pageSize=500`, 'Carregando Dados...')
            .then(retornoListaVouchers)
            .catch((error) => { throw error; })

    } catch (error) {
        console.log(error);
        animationLoadingStop();
        msgError();
    }
}

function ocultaParteDosDadosVoucher(stringParaOcultar) {
    if (stringParaOcultar) {
        var dadoString = ("" + stringParaOcultar);
        var stringPronta = dadoString.substring(0, 5) + ((dadoString.substring(5, dadoString.length - 4)).replace(/[0-9]/g, "*")) + dadoString.substring(dadoString.length - 4);

        return stringPronta;
    } else {
        console.erro("O parametro(stringParaOcultar) passado para a função(ocultaParteDosDados) está vazio!");
        return false;
    }
}

function retornoListaVouchers(voucherEmitido) {
    let dadosTable = [];

    animationLoadingStop();

    for (let i = 0; i < voucherEmitido.data.length; i++) {
        let dados = voucherEmitido.data[i]['voucher'];
        let indice = i + 1;
        let IDVoucher = dados?.IDVOUCHER;
        let idEmpresaOrigemVoucher = dados?.IDEMPRESAORIGEM;
        let DTVoucherIN = dados?.DTINVOUCHERFORMATADO;
        let DTVoucherOUT = dados?.DTOUTVOUCHERFORMATADO;
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
        let EmpresaOrigem = dados?.EMPORIGEM;
        let EmpresaDestino = dados?.EMPDESTINO;
        let statusVoucherParaImpressao;
        let colorTag = 'blue';

        if (STAtivoVoucher == 'True' && !STStatusVoucher) {
            statusVoucherParaImpressao = 'NOVO';
        } else if (STAtivoVoucher == 'False' && !STStatusVoucher) {
            statusVoucherParaImpressao = 'FINALIZADO';
            colorTag = 'red'
        } else if (STAtivoVoucher == 'True' && (STStatusVoucher == 'LIBERADO PARA O CLIENTE' || STStatusVoucher == 'NOVO')) {
            statusVoucherParaImpressao = STStatusVoucher;
        } else if (STAtivoVoucher == 'False' && (STStatusVoucher == 'NEGADO' || STStatusVoucher == 'CANCELADO' || STStatusVoucher == 'FINALIZADO')) {
            statusVoucherParaImpressao = STStatusVoucher;
            colorTag = 'red'
        } else if (STAtivoVoucher == 'False' && STStatusVoucher == 'EM ANALISE') {
            statusVoucherParaImpressao = STStatusVoucher;
        } else if (STAtivoVoucher == 'False' && STCanceladoVoucher == 'True' && !STStatusVoucher) {
            statusVoucherParaImpressao = STStatusVoucher;
            colorTag = 'red'
        } else {
            statusVoucherParaImpressao = 'USADO';
            colorTag = 'red'
        }

        tagVoucherAtivo = `<label style="text-align: center; color: ${colorTag}; font-size: 11px;">${statusVoucherParaImpressao}</label>`;


        if (DTVoucherOUT == null) {
            DTVoucherOUT = '';
        } else {
            DTVoucherOUT = DTVoucherOUT;
        }

        if (EmpresaDestino == null) {
            EmpresaDestino = '';
        } else {
            EmpresaDestino = EmpresaDestino;
        }

        dadosTable.push([
            `<label id="${IDVoucher}" style="color: blue; font-size: 11px;">${indice}</label>`,
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
            tagVoucherAtivo,
            `<div class="btn-group btn-group-xs">
              <button id="detalheVoucher" type="button" class="btn btn-success btn-xs" title="Visualizar Detalhes" value="${IDVoucher}" ><span class="fal fa-list p-1"></button>
              <button type="button" class="btn btn-warning btn-xs" title="Editar Situação" id="${IDVoucher}" onclick="editarStatusVoucher(this.id);"><span class="fal fa-pen p-1 text-white"></button>
              <button type="button" class="btn btn-primary btn-xs" title="Imprimir" id="${IDVoucher}" onclick="imprimirVoucher(this.id);"><span class="fal fa-print p-1"></button>
            </div>`
        ])

    }

    $('#resultado').removeClass('d-none');

    $('#dt-basic-voucher').DataTable().clear().destroy();

    let tableVoucher = $('#dt-basic-voucher').DataTable({
        data: dadosTable,
        "language": { "emptyTable": "Nenhum Voucher Encontrado...", "zeroRecords": "Não há Vendas no Momento" },
        defaultContent: '',
        paging: true,
        pageLength: 50,
        searching: true,
        info: false,
        deferRender: true,
        scrollX: true,
        // responsive: true,
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
        ],
        initComplete: function (settings) {
            let idTable = `#${settings.nTable.id}`;
            
            $('html, body').animate({
                scrollTop: $(idTable).offset().top - 70
            }, 1000);
            
            $(idTable).find('tbody td:first').focus()
        }
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
                await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${numVoucherLinha}`, 'Carregando Detalhes do Voucher...')
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
        let dadosVoucher = await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Dados...').catch((error) => { throw error });

        retornoEditarStatusVoucher(dadosVoucher, dadosUser);
    }
}

async function retornoEditarStatusVoucher(detVoucher, dadosFunc) {
    try {
        $("#vendaDestVoucher").addClass('d-none');
        let { DSFUNCAO, IDFUNCIONARIO, IDGRUPOEMPRESARIAL } = dadosFunc;
        let dadosListaVoucher = [];
        let dadosListaVoucherDest = [];
        let { data } = detVoucher;
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
        let msgUser = '';
        let stEdicao = true;

        for (var i = 0; i < data.length; i++) {
            let { voucher } = data[i];

            idVoucher = voucher?.IDVOUCHER;
            tipoTroca = voucher?.STTIPOTROCA || 'CORTESIA';
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
            motivoTrocaVoucher = voucher?.STCANCELADO == 'True' ? `<h6>Motivo do Cancelamento/Negação : <span class="fw-300">${(voucher?.DSMOTIVOCANCELAMENTO || '')}</span></h6>` : `<h6>Motivo da Troca: <span class="fw-300">${voucher?.MOTIVOTROCA || ""}</span></h6>`;
            diasEmAposCompra = retornaDiasEntreDatas(dataVenda);

            if (stAtivo == 'True' && (statusVoucher == 'NOVO' || !statusVoucher)) {
                statusVoucher = 'NOVO';
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
                
                if (tipoTroca !== 'DEFEITO') {
                    
                    if (statusVoucher !== 'EM ANALISE' || diasEmAposCompra > 180) {
                        stEdicao = false;
                        msgUser = 'Usuário Com Permissão Apenas de Visualização, Solicite a Autorização Do Suporte de Vendas Para Mudança de Status do Voucher';
                    }
                    
                    if (diasEmAposCompra > 60 && diasEmAposCompra < 180) {
                        stEdicao = false;
                        msgUser = 'Usuário Com Permissão Apenas de Visualização, Solicite a Autorização Da Supervisão para Mudança de Status do Voucher';
                    }
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
            }
        }

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
          <h6>Tipo Troca:</h6>
          <select id="tipoTrocaVoucher" value="${tipoTroca}" onchange="trocaCorSelectStatusVoucher()">
            <option value='CORTESIA'>CORTESIA</option>
            <option value='DEFEITO'>DEFEITO</option>
          </select>
        </div>
        
        <div class="pl-0" style="width:20%">
          <h6>Status do Voucher:</h6>
          <select id="statusVoucher" value="${statusVoucher}" onchange="trocaCorSelectStatusVoucher()">
            <option value='NOVO'>NOVO</option>
            <option value='EM ANALISE'>EM ANALISE</option>
            <option value='LIBERADO PARA O CLIENTE'>LIBERADO PARA O CLIENTE</option>
            <option value='FINALIZADO' ${DSFUNCAO !== 'TI' ? 'disabled' : ''} >FINALIZADO</option>
            <option value='NEGADO'>NEGADO</option>
            <option value='CANCELADO'>CANCELADO</option>
          </select>
        </div>

        <div class="d-none pt-3" style="width:40%">
          <label class="form-label" for="motivoTrocaStatus"><b>MOTIVO*</b></label>
          <input id="motivoTrocaStatus" class="form-control input" type='text' placeholder="MOTIVO DA TROCA DE STATUS">
          <small><b>Campo Obrigatório*</b></small>
        </div>
      </div>
    `)

        $('#tipoTrocaVoucher').val(tipoTroca);
        $('#statusVoucher').val(statusVoucher);
        $('#tipoTrocaVoucher, #statusVoucher').select2().trigger('change').prop('disabled', !stEdicao);

        $('#vendaVoucherOrigem').html(`Produtos Venda de Origem: ${nuVenda}`);
        $('#vendaVoucherDestino').html(`Produtos Venda de Destino: ${nuVendaDestino}`);

        $("#detStatusVoucher").modal('show');
        // $('#detStatusVoucher').on('shown.bs.modal', function () { })

        msgUser && $('#notificacaoUsuario').html(`
                <div class="alert alert-danger alert-dismissible fade show h4" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true"><i class="fal fa-times"></i></span></button><strong>Atenção! </strong>${msgUser}</div>
            `);

        if (stEdicao) {
            $('#btnUpdateVoucher').removeClass('d-none').attr('onclick', `atualizaStatusVoucher(${idVoucher}, ${IDFUNCIONARIO})`)
        } else {
            $('#btnUpdateVoucher').addClass('d-none');
        }

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

    corTipo.attr('style', `color:${tipoTrocaVoucher == 'CORTESIA' ? 'blue' : 'red'}`)

    if (statusVoucher == "FINALIZADO" || statusVoucher == "NEGADO" || statusVoucher == "CANCELADO") {
        corStatus.attr('style', 'color:red');
    } else {
        corStatus.attr('style', 'color:blue');
    }

    if ((MEMORIASTATUSVOUCHER == statusVoucher && MEMORIATIPOTROCAVOUCHER == tipoTrocaVoucher)) {
        $('#motivoTrocaStatus').parent('div').addClass('d-none');
    } else {
        $('#motivoTrocaStatus').parent('div').removeClass('d-none');
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

            await ajaxPut(`api/resumo-voucher/todos-web.xsjs`, dadosUpdateVoucher)
                .then(async () => {
                    $('#NVoucher').val(`${idVoucher}`);

                    await msgSuccess('Voucher Atualizado com Sucesso!')
                        .then(async () => {
                            $('#detStatusVoucher').modal('hide')

                            await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Voucher...')
                                .then(retornoListaVouchers)
                                .catch((error) => { throw error; })

                            $('#NVoucher').val('');
                        })
                })
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

    dadosUser && await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Dados...')
        .then(retornoImprimirVoucher)
        .catch((error) => { throw error });
}

function montarConteudoVoucher(dadosVoucher){
  let { data } = dadosVoucher || [];

  if (!data || data.length === 0) return '';

  let now = new Date();
  let pad = (v) => String(v).padStart(2, '0');

  let dia = pad(now.getDate()); // 1-31
  let mes = pad(now.getMonth()); // 0-11 (zero=janeiro)
  let ano = now.getFullYear(); // 4 dígitos
  let hora = pad(now.getHours());          // 0-23
  let min = pad(now.getMinutes());        // 0-59
  let seg = pad(now.getSeconds());

  let dtAtual = `${dia}/${mes}/${ano}`;
  let hrAtual = `${hora}:${min}:${seg}`;

  let dados = data[0].voucher;
  let noFantasia = dados.EMPORIGEM;
  let razaoSocial = dados.RAZAOEMPORIGEM;
  let cnpjEmp = maskCNPJ(dados.CNPJEMPORIGEM);
  let endEmp = dados.ENDEMPORIGEM;
  let bairroEmp = dados.BAIRROEMPORIGEM;
  let cidadeEmp = dados.CIDADEEMPORIGEM;
  let sgufEmp = dados.SGUFEMPORIGEM;
  let dtCreate = dados.DTINVOUCHERFORMATADO.replaceAll('-', '/');
  let vrVoucher = maskValor(dados.VRVOUCHER);
  let vrExtenso = vrVoucher.extenso(true);
  let idVendaOrigem = dados.IDRESUMOVENDAWEB;
  let nuVoucher = dados.NUVOUCHER;
  let noCliente = dados.DSNOMERAZAOSOCIAL;
  let cpfCnpjCliente = dados.NUCPFCNPJ ? dados.NUCPFCNPJ : "";
  let idCaixa = String(dados.IDCAIXAORIGEM);
  let idVendedor = String((dados.IDVENDEDOR || 0));
  let idResumoDev = String(dados.IDNFEDEVOLUCAO);
  let idOperador = String(dados.IDUSRLIBERACAOCRIACAO);

  if (cpfCnpjCliente.length == 14) {
    noCliente = !noCliente ? dados.DSAPELIDONOMEFANTASIA : noCliente;
  }

  return (`
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
        width: 100% !important;
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
          width: 90% !important;
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
    <style id="mediaPrintVoucher"></style>
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
  `);
}

function retornoImprimirVoucher(dadosRetornoImprimrVoucher) {
  
  $(document).off("keydown");
  let htmlVoucher = montarConteudoVoucher(dadosRetornoImprimrVoucher);
  
  $("#VoucherImp").html(htmlVoucher);

  JsBarcode('#svgVoucher').init();

  $("#impVoucher").modal({
    show: true,
    backdrop: 'static'
  });

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

  let htmlVoucher = $('#contentModalVoucher').html();
  let janelaImpressao = window.open('', '', '');

  let conteudo = `
    <html>
      <head>
        <title>Impressão</title>
        <style> button{display: none !important;}</style>
      </head>
      <body>
        ${htmlVoucher}
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.focus();
              window.print();
            }, 300)
          };

          window.onafterprint = () => setTimeout(() => window.close(), 500);
        </script>
      </body>
    </html>
  `;

  janelaImpressao.document.open();
  janelaImpressao.document.write(conteudo);
  janelaImpressao.document.close();
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

async function telaPesquisaVendaVoucher() {
    try {
        let dodosUser = await getCurrentUser()?.user;
        let userFuncao = dodosUser.DSFUNCAO;
        let grupoEmpresa = dodosUser?.IDSUBGRUPOEMPRESARIAL || "";
        let idEmpresa = dodosUser?.IDEMPRESA || "";

        $.get("action_pesqvendavoucher.html", (htmlResp) => {
            $("#js-page-content").html(htmlResp);


            $('.dataAtual').text(dataAtual);
            $('#dtconsultavendainicio').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() }).focus();
            $('#dtvendaconsultafim').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
            $('#idvenda_cpf').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
            $('#serie').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
            $('#nfce').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });

        }).fail((error) => { throw error })


        await ajaxGet(`api/resumo-voucher/empresa.xsjs?idSubGrupoEmpresa=${grupoEmpresa}&idEmpresa=${idEmpresa}`)
            .then(retornoListaEmpresasSelectVendaVoucher)
            .catch((error) => { throw error })

        $('#idEmpresaVenda').val(idEmpresa).trigger('change')

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaEmpresasSelectVendaVoucher(respostaListaEmpresas) {
    let { data } = respostaListaEmpresas;

    for (var i = 0; i < data.length; i++) {
        let { IDEMPRESA, NOFANTASIA } = data[i];

        $('#idEmpresaVenda').append(
            `<option value="${IDEMPRESA}">${NOFANTASIA}</option>`
        );

    }

    $('#idEmpresaVenda').select2()
}

function selecionaLinhaProdutoParaVoucher(element, selectByQtd) {
    let linhaSelecionada = $(element).closest('tr');

    selectByQtd && $(linhaSelecionada).find('input:first').prop('checked', true);

    if (!linhaSelecionada.hasClass('selected') || selectByQtd) {
        linhaSelecionada.addClass('selected').css("opacity", 0.8)
        linhaSelecionada.attr('title', 'PRODUTO SELECIONADO PARA TROCA!');

    } else {
        linhaSelecionada.removeClass('selected').removeAttr('style')
        linhaSelecionada.attr('title', '')

    }

    if ($('[name="selecaoProdutosParaVoucher"]:checked:not(:disabled)').length) {
        $('#btnCadVoucher').removeClass('d-none');
    } else {
        $('#btnCadVoucher').addClass('d-none');
    }

}

async function validaQtdDigitada(element) {
    let numLinha = $(element).closest('tr').find('td:first').text();
    let qtdOriginal = Number($(element).attr('qtdOriginal'))
    let qtdDigitada = Number($(element).val()?.replace(/\D/g, '') || 0);

    if (qtdDigitada > 0 && qtdDigitada <= qtdOriginal) {
        return $(element).val(qtdDigitada);
    }

    await msgWarning(`Quantidade Inválida Digitada Na Linha( ${numLinha} ), QUANTIDADE DISPONÍVEL: ${qtdOriginal}`)
        .then(() => {
            $(element).val(qtdOriginal).focus();
        })
}

async function pesquisaVendaCliente() {
    let dataInicio = $('#dtconsultavendainicio').val() || "";
    let dataFim = $('#dtvendaconsultafim').val() || "";
    let idLoja = Number($('#idEmpresaVenda').val()) || "";
    let dadosVenda = $('#idvenda_cpf').val() || "";
    let serie = $('#serie').val() || "";
    let nfce = $('#nfce').val() || "";
    let dadosVendaFormatado = dadosVenda?.split('-');
    let dodosUser = await getCurrentUser()?.user;
    let grupoEmpresa = dodosUser?.IDSUBGRUPOEMPRESARIAL;

    $('#voltaTela').removeClass('d-none');
    $('#btnCadCliente').attr('value', "");

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
}

function retornoPesquisaVendaCliente(respostapesquisaVendaCliente) {
    let { data } = respostapesquisaVendaCliente;
    let dadosTable = [];

    $(".tabelaVenda").removeClass('d-none');

    for (i = 0; i < data.length; i++) {
        let dadosVenda = data[i]?.venda;
        let idVenda = dadosVenda?.IDVENDA;
        let nomeRazao = dadosVenda?.DSNOMERAZAOSOCIAL || "";
        let sobrenomeFant = dadosVenda?.DSAPELIDONOMEFANTASIA || "";
        let nuCnpj = dadosVenda?.DEST_CNPJ ? maskCNPJ(dadosVenda?.DEST_CNPJ) : "";
        let nuCpf = dadosVenda?.DEST_CPF ? maskCPF(dadosVenda?.DEST_CPF) : "";
        let nomeClienteVenda = nuCpf ? (nomeRazao + " " + sobrenomeFant) : nomeRazao;
        let cpfCnpjCliente = nuCnpj || nuCpf;
        let loja = dadosVenda?.NOFANTASIA;
        let valorTotal = dadosVenda?.VRTOTALPAGO;
        let dataVenda = dadosVenda?.DTHORAFECHAMENTO;
        let dataVendaFormatada = dadosVenda?.DTHORAFECHAMENTOFORMATEUA;
        let situacaoVenda = `
            <label class"fw-500" style="color: ${dadosVenda?.STCANCELADO == 'False' ? 'blue' : 'red'};">${dadosVenda?.STCANCELADO == 'False' ? 'Ativa' : 'Cancelada'}</label>
        `;
        let opcoesVenda = `
            <div class="btn-group btn-group-xs">
                <button type="button" class="btn btn-success btn-xs" title="Detalhar Produtos" id="${idVenda}" onclick="visualizarProdutosDaVendaParaVoucher(this.id, '${dataVendaFormatada}')" ><span class="fal fa-list mr-1"></span></button>
            </div>
        `;

        dadosTable.push([
            (i + 1),
            opcoesVenda,
            idVenda,
            nomeClienteVenda,
            cpfCnpjCliente,
            loja,
            maskValor(valorTotal),
            dataVenda,
            situacaoVenda

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
        scrollY: "1000px",
        scrollX: true,
        scrollCollapse: true,
        columnDefs: [
            {
                targets: [1, 8],
                className: 'text-center'
            },
            {
                targets: [6],
                type: 'currency-brl'
            },
            {
                targets: [7],
                type: 'date-time-br'
            },

        ],
        columns: [
            { width: '5%' },
            { width: '5%' },
            { width: '10%' },
            { width: '25%' },
            { width: '10%' },
            { width: '20%' },
            { width: '10%' },
            { width: '10%' },
            { width: '5%' }
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
    });

}

async function visualizarProdutosDaVendaParaVoucher(IdVenda, dataVenda) {
    try {
        let tipoTroca = await modalDeSelecaoDeTipoDeTroca();

        if (tipoTroca) {
            $(".tabelaVenda").addClass('d-none');
            $('.tabelaProduto').removeClass('d-none')
            $("#voltaTela").attr('onclick', 'telaCriacaoEdicaoVouchers()')

            await ajaxGetAllData(`api/venda/lista-venda-cliente.xsjs?id=${IdVenda}`, 'Carregando Produtos...')
                .then(async (dadosVenda) => {
                    retornoVisualizarProdutos(dadosVenda, tipoTroca);
                })
                .catch((error) => { throw error })
        }
    } catch (error) {
        console.log(error);
        msgError();
    }

}

async function validaUsuarioLogado(dadosVenda) {
    try {
        let idUserLogado = await getCurrentUser()?.user?.id;
        let { DTHORAFECHAMENTO } = dadosVenda?.data[0] || "";
        let diferencaEmDias;
        let dadosUserVerificado;
        let grupoEmpresarial
        let dsFuncVerificado;
        let dsFuncAutorizadas = [
            'TI',
            'SUPERVISOR',
            'GERENTE',
            'SUB GERENTE',
            'FISCAL DE CAIXA',
            'OPERADORA DE CAIXA',
            'OPERADOR DE CAIXA'
        ];

        if (!idUserLogado) {
            throw 'Erro ao validar o usuário, recarregue e tente novamente!';
        }

        let dadosUser = await ajaxGet(`api/funcionario/todos.xsjs?idFuncionario=${idUserLogado}`).catch((error) => { throw error });

        if (!dadosUser?.data?.length) {
            throw 'Erro ao validar o usuário, recarregue e tente novamente!';
        }

        dadosUserVerificado = dadosUser?.data[0]
        dsFuncVerificado = dadosUserVerificado.DSFUNCAO?.trim()?.toUpperCase();
        grupoEmpresarial = dadosUserVerificado?.IDGRUPOEMPRESARIAL;
        diferencaEmDias = retornaDiasEntreDatas(DTHORAFECHAMENTO);

        if (dsFuncAutorizadas.includes(dsFuncVerificado)) {
            if (diferencaEmDias > 180 && dsFuncVerificado !== 'TI') {
                return false;
            }

            if (grupoEmpresarial == 4) {
                dsFuncAutorizadas = [
                    'GERENTE',
                    'SUB GERENTE',
                    'FISCAL DE CAIXA',
                ];

                if (!dsFuncAutorizadas.includes(dsFuncVerificado)) {
                    return false;
                }
            }

            if (diferencaEmDias > 32 && dsFuncVerificado.includes('OPERADOR')) {
                return false;
            }

            return dadosUserVerificado;
        }

        return false;
    } catch (error) {
        console.log(error);
        msgError('Erro ao validar o usuário, recarregue e tente novamente!');
    }
}

async function retornoVisualizarProdutos(respostaVisualizarProdutos, tipoTroca) {
    try {
        let { data } = respostaVisualizarProdutos;
        let { venda } = data[0];
        let { IDVENDA, DEST_CPF, DEST_CNPJ, NRNOTA, DTHORAFECHAMENTOFORMATEUA } = venda;

        let cpfCnpjCliente = DEST_CPF || DEST_CNPJ;
        let dataVenda = DTHORAFECHAMENTOFORMATEUA;
        let dadosTable = [];
        let qtdTotalProdutos = 0;
        let indice = 0;

        const DIFERENCAEMDIAS = retornaDiasEntreDatas(dataVenda);
        const DATAAUTORIZADA = tipoTroca == 'CORTESIA' ? 32 : 90;
        const dsTipoTroca = tipoTroca;

        $('#nuVendaProd').attr('value', NRNOTA).html(`<span class="fw-500"><i>  Produtos - Venda: ${IDVENDA}</i></span>`);

        for (let i = 0; i < data.length; i++) {
            let { detalhe } = data[i];

            for (let j = 0; j < detalhe.length; j++) {
                let { det } = detalhe[j];
                let {
                    CPROD,
                    IDVENDADETALHE,
                    XPROD,
                    NUCODBARRAS,
                    QTD,
                    VRTOTALLIQUIDO,
                    VUNTRIB,
                    VPROD,
                    STTROCA,
                    STCANCELADO,
                    VENDEDOR_MATRICULA
                } = det;

                let idLinha = CPROD + '_' + indice
                let idProduto = CPROD
                let idVendaDetalhe = IDVENDADETALHE;
                let codProduto = CPROD;
                let descProduto = XPROD;
                let codBarras = NUCODBARRAS;
                let quantidade = Number(QTD);
                let valorProd = Number(VRTOTALLIQUIDO);
                let valorProdUnit = Number(VUNTRIB);
                let valorTotalProdBruto = Number(VPROD);
                let descontoProduto = valorProdUnit - valorProd;
                let stTroca = STTROCA == "True" ? "disabled" : ""
                let checked = STTROCA == "True" ? "checked" : "";
                let idVendedor = VENDEDOR_MATRICULA;
                let stQuantidade = checked || quantidade <= 1 ? "disabled" : "";
                let stCancelado = STCANCELADO || 'False';

                if (+DIFERENCAEMDIAS > DATAAUTORIZADA) {
                    //stTroca = "disabled";

                    $('#nuVendaProd').html(`
                    <span class="fw-500">
                        <i> Produtos - Venda: ${IDVENDA}</i>  &#160;&#160; <i class="text-danger h4">Venda Fora do Prazo de <u><b>${DATAAUTORIZADA} DIAS</u></b> Para Troca do Tipo <u><b>${dsTipoTroca}</u></b>. Dias Passados Após a Compra: <u><b>${DIFERENCAEMDIAS} DIAS<b></u></i>
                    </span>
                `);
                }

                selecao = `
                    <div class="custom-control custom-checkbox"> 
                        <input type="checkbox" class="custom-control-input" name="selecaoProdutosParaVoucher" id="${idLinha}" value="${valorProd}" onchange="selecionaLinhaProdutoParaVoucher(this)" idVenda="${IDVENDA}" diasPassadosDaCompra="${DIFERENCAEMDIAS}" idVendaDetalhe="${idVendaDetalhe}" idProduto="${idProduto}" quantidade="${quantidade}" valorProdUnit="${valorProdUnit}" valorTotalProdBruto="${valorTotalProdBruto}" descontoProduto="${descontoProduto}" valorProd="${valorProd}" idVendedor="${idVendedor}" cnpfCnpjCliente="${cpfCnpjCliente}"
                        ${checked} ${stTroca} tipoTroca="${tipoTroca}" dataAutorizada="${DATAAUTORIZADA}" dataVenda="${dataVenda}" />
                        <label class="custom-control-label" for="${idLinha}"></label>
                    </div>
                `;

                quantidade = `
                <div class="custom-control"> 
                    <input class="rounded" type="number" min="1" max="${quantidade}" autocomplete="off" autofill="off" name="quantidaProduto" qtdOriginal="${quantidade}" value="${quantidade}" onchange="validaQtdDigitada(this)" onclick="selecionaLinhaProdutoParaVoucher(this, true)"style="width: 50px; text-align: center;" ${stQuantidade}>
                </div>
            `;
                if(stCancelado == 'False'){
                    qtdTotalProdutos++;
                    indice++;
                    
                    dadosTable.push([
                        indice,
                        selecao,
                        codProduto,
                        descProduto,
                        codBarras,
                        quantidade,
                        maskValorEmBRL(valorProd)
                    ])
                }

            }
        }

        $('#btnCadCliente').removeClass('d-none').attr('value', cpfCnpjCliente);

        $("#resultadoProduto").DataTable().clear().destroy();

        $("#resultadoProduto").DataTable({
            data: dadosTable,
            pageLength: 50,
            paging: true,
            searching: true,
            info: true,
            deferRender: true,
            responsive: true,
            scrollY: "1000px",
            scrollX: true,
            scrollCollapse: true,
            columnDefs: [
                {
                    targets: [1, 5],
                    className: 'text-center'
                },
                {
                    targets: [6],
                    type: 'currency-brl',
                    className: 'text-center'
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
            ],
            initComplete: function (settings) {
                let idTable = `#${settings.nTable.id}`;
                
                $('html, body').animate({
                    scrollTop: $(idTable).offset().top - 70
                }, 1000);
                
                $(idTable).find('tbody td:first').focus()
            },
            language: {
                "emptyTable": "Não há Produtos Na Venda"
            },
        });

        let verificaProd = $("[name=selecaoProdutosParaVoucher]");
        let qtdItensTrocados = 0;

        for (let i = 0; i < verificaProd.length; i++) {
            let linhaProd = $(verificaProd[i]).closest('tr');

            if (verificaProd[i].disabled && verificaProd[i].checked) {
                qtdItensTrocados++
                linhaProd.css("opacity", 0.5).attr('title', 'ESTE PRODUTO JÁ FOI TROCADO!');

            } else if (+DIFERENCAEMDIAS > DATAAUTORIZADA) {
                linhaProd.attr('title', `VENDA FORA DO PRAZO DE ${DATAAUTORIZADA} DIAS PARA A TROCA DO TIPO ${dsTipoTroca}, JÁ SE PASSARAM: ${DIFERENCAEMDIAS} DIAS APÓS A COMPRA!`)//.css("opacity", 0.5)
            }
        }

        if (qtdTotalProdutos - qtdItensTrocados == 0) {
            $('#nuVendaProd').html(`<span class="fw-500 todosTrocados"><i>  Produtos _ Venda: ${IDVENDA}</i>  &#160;&#160; <i class="text-danger h4">Todos os Produtos Desta Venda Já Foram Trocados</i></span>`);
        }

    } catch (error) {
        console.log(error);
        msgError()//.then(() => telaCriacaoEdicaoVouchers())

    }

}

async function exibirModalFormCliente(tipoCliente){
    let actionModal = (tipoCliente ? 'action_clienteVoucher_modal.html' : 'action_empresaVoucher_modal.html');

    await $.get(actionModal, async (res) => {
        $('#resultadoModalCadCliente').html(res);

        $('#notificacaoModalCadastroCliente').html('');
        $("#CadCliente").text('Cadastrar').removeClass('d-none');

        $("#detClienteVoucher").modal('show');

        $("#DataCadastro").val(dataAtualCampo);
        $('#idIndicacaoIE').select2();
    })
}

async function verificaSeExisteCadastroCliente(cpfcnpj = '', stUltimaInstancia = false) {
    try {
        let CPFCNPJ = cpfcnpj.replace(/\D/g, "");

        if (CPFCNPJ?.length) {

            !stUltimaInstancia && animationLoadingStart('Verificando Dados, aguarde...');
            animationLoadingFormClient('Verificando Dados, aguarde...');

            await ajaxGet(`api/gerencia/cliente.xsjs?numeroCpfCnpj=${CPFCNPJ}`)
                .then((resp) => {
                    !stUltimaInstancia && animationLoadingStop();
                    preenche_dados_registrados(resp, CPFCNPJ, stUltimaInstancia)
                })
                .catch((error) => { throw error })
        }
    } catch (error) {
        console.log(error);
        !stUltimaInstancia && msgError();
        msgWarningCadastroCliente(undefined, 'Erro ao verificar dados, recarregue e tente novamente!')
    }
}

async function preenche_dados_registrados(retornoCadastroCliente, cpfcnpj, stUltimaInstancia = false) {
    let { data } = retornoCadastroCliente || [];

    if (data?.length) {
        let {
            IDEMPRESA,
            IDCLIENTE,
            NUCPFCNPJ,
            DSNOMERAZAOSOCIAL,
            DSAPELIDONOMEFANTASIA,
            TPCLIENTE,
            DTCADASTRO,
            DTULTALTERACAO,
            DTNASCFUNDACAO,
            NUTELCELULAR,
            NURGINSCESTADUAL,
            NUINSCMUNICIPAL,
            EEMAIL,
            NUCEP,
            EENDERECO,
            NUENDERECO,
            ECOMPLEMENTO,
            EBAIRRO,
            NUIBGE,
            ECIDADE,
            SGUF,
            NUTELCOMERCIAL,
            IDINDICACAOIE,
            NUCNAE
        } = data[0] || "";

        await exibirModalFormCliente((TPCLIENTE == 'FISICA' || TPCLIENTE == 'FÍSICA') && NUCPFCNPJ?.length <= 11);
        
        if(TPCLIENTE !== 'JURIDICA'){
            if(SGUF == 'DF'){
                IDINDICACAOIE = 2;
            } else {
                IDINDICACAOIE = 9;
            }
        }
        
        $("#idEmpresa").val(IDEMPRESA);
        $("#idClienteEmpresa").val(IDCLIENTE);
        $("#DataCadastro").val(DTCADASTRO?.split(" ")[0] || DTULTALTERACAO?.split(" ")[0]);
        $("#DataNascimentoCriacao").val(DTNASCFUNDACAO ? DTNASCFUNDACAO.split(" ")[0] : "");
        $("#TelefoneCliente").val(NUTELCELULAR ? maskFone(NUTELCELULAR?.replace(/\D/g, '')) : NUTELCELULAR);
        $("#email").val(EEMAIL);
        $('#idIndicacaoIE').val(IDINDICACAOIE || 0).trigger('change');
        $("#NuCEP").val(maskCEP(NUCEP));
        $("#Endereco").val(EENDERECO);
        $("#NuEndereco").val(NUENDERECO);
        $("#Complemento").val(ECOMPLEMENTO);
        $("#Bairro").val(EBAIRRO);
        $("#NuIBGE").val(NUIBGE);
        $("#Cidade").val(ECIDADE);
        $("#Estado").val(SGUF);
        $('#CadCliente').attr('onclick', `validaDadosDoFormCliente(${stUltimaInstancia})`).text('Atualizar');

        if (NUCPFCNPJ?.length <= 11) {
            let nomeCliente = data[0]["DSNOMERAZAOSOCIAL"];
            let sobrenomeCliente = '';

            nomeCliente = nomeCliente.split(' ');

            if (nomeCliente.length > 1) {
                sobrenomeCliente = nomeCliente.pop()
                nomeCliente = nomeCliente.join(' ');
            }

            $("#CPFCNPJ").val(maskCPF(NUCPFCNPJ))
            $("#NomeClienteRazao").val(nomeCliente)
            $("#sobrenomeNomeFan").val(sobrenomeCliente)
            $("#CPFCNPJ").prop({
                'readonly': (validar_Cpf(NUCPFCNPJ)),
                'disabled': (validar_Cpf(NUCPFCNPJ))
            }).removeAttr('onchange');

        } else if (NUCPFCNPJ?.length > 11) {
            $("#CPFCNPJ").val(maskCNPJ(NUCPFCNPJ));
            $('#container-btn-update-receita-federal').removeClass('d-none');
            $('#btn-update-receita-federal').val(NUCPFCNPJ);

            $("#IE").val(NURGINSCESTADUAL);
            $("#IM").val(NUINSCMUNICIPAL);
            $("#CNAE").val(NUCNAE || "")
            $("#NomeClienteRazao").val(DSNOMERAZAOSOCIAL);
            $("#sobrenomeNomeFan").val(DSAPELIDONOMEFANTASIA);
            $("#TelefoneClienteEmpresaComercial").val(NUTELCOMERCIAL ? maskFone(NUTELCOMERCIAL?.replace(/\D/g, '')) : NUTELCOMERCIAL);
            $("#CPFCNPJ").prop({
                'readonly': (validar_Cnpj(NUCPFCNPJ)),
                'disabled': (validar_Cnpj(NUCPFCNPJ))
            }).removeAttr('onblur');

            if(stUltimaInstancia){
                $('#btn-update-receita-federal').attr('onclick',  `(modal_Preenchimento_CNPJ(document.querySelector("#CPFCNPJ").value, ${true}))`)
            }

        }

        msgSuccessFormCliente();
    } else {
        $('#notificacaoModalCadastroCliente').html('');
        $("#DataCadastro").val(dataAtualCampo)

        if ($('#CPFCNPJ').attr('maxlength') == 18) {
            $('#CPFCNPJ').val(maskCNPJ(cpfcnpj));

            if (!stUltimaInstancia) {
                ValidaCNPJ(cpfcnpj) && setTimeout(() => modal_Preenchimento_CNPJ(cpfcnpj), 1000);
            }

        } else {
            $('#CPFCNPJ').val(maskCPF(cpfcnpj));
            !stUltimaInstancia && ValidaCpf(cpfcnpj);
        }

        $('#CadCliente').attr('onclick', `validaDadosDoFormCliente(${stUltimaInstancia})`).text('Cadastrar');
    }

}

async function modalCadastroCliente(cpfOrCnpj, stUltimaInstancia = false) {
    try {
        let CPFCNPJ = cpfOrCnpj?.replace(/\D/g, "");

        if (!CPFCNPJ && !stUltimaInstancia) {
            Swal.fire({
                type: 'question',
                title: 'Qual o tipo do Cliente?',
                text: 'Clique na opção desejada!',
                showCloseButton: true,
                showCancelButton: true,
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'CPF',
                cancelButtonText: 'CNPJ'
            }).then(async (result) => {
                let { value, dismiss } = result || false;

                if (value || dismiss == 'cancel') {
                    animationLoadingStart();

                    $('#detClienteVoucher').removeAttr('style');

                    await exibirModalFormCliente(value);

                    animationLoadingStop();
                }


            })

        } else if (CPFCNPJ.length) {
            !stUltimaInstancia && animationLoadingStart('Carregando Dados do Cliente, aguarde...');
            animationLoadingFormClient('Carregando dados...');

            await exibirModalFormCliente(CPFCNPJ.length <= 11);
            
            $("CPFCNPJ").val(cpfOrCnpj);

            await ajaxGet(`api/cliente/todos.xsjs?numeroCpfCnpj=${CPFCNPJ}`)
                .then((resp) => preenche_dados_registrados(resp, CPFCNPJ, stUltimaInstancia))
                .catch((error) => { throw error });

            !stUltimaInstancia && animationLoadingStop();
            $('#notificacaoModalCadastroCliente').html('');
        }

        return 
    } catch (error) {
        console.log(error);
        !stUltimaInstancia && msgError();
        msgWarningCadastroCliente($('#notificacaoModalCadastroCliente'), 'Error ao Carregar os dados, recarregue e tente novamente!');
    }

}

async function validaDadosDoFormCliente(stUltimaInstancia = false) {
  try {
    let userLogado = await getCurrentUser()?.user;
    let idFuncionario = userLogado?.id;
    let cpfCnpj = $('#CPFCNPJ').val().replace(/\D/g, "");
    let IDCLIENTE = Number($("#idClienteEmpresa").val());
    let IDEMPRESA = Number($("#idEmpresa").val() || userLogado?.IDEMPRESA);
    let tipo = $('#tipoClienteEmpresa').val();
    let IE = $("#IE").val()?.toUpperCase()?.trim();
    let IM = $("#IM").val()?.toUpperCase()?.trim() || null;
    let razao = $("#NomeClienteRazao").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || null;
    let fantasia = $("#sobrenomeNomeFan").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || null;
    let dtNasc = $("#DataNascimentoCriacao").val() || null;
    let nuCelular = $("#TelefoneCliente").val()?.replace(/\D/g, '') || "";
    let nuComercial = $("#TelefoneClienteEmpresaComercial").val()?.replace(/\D/g, '') || nuCelular;
    let email = $("#email").val()?.trim() || '';
    let idIndicacaoIE = Number($("#idIndicacaoIE").val());
    let dsIndicacaoIE = $("#idIndicacaoIE").select2('data')[0]?.text?.toUpperCase();
    let nuCep = $("#NuCEP").val()?.replace(/\D/g, "") || "";
    let endereco = $("#Endereco").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || "";
    let nuEndereco = $("#NuEndereco").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || "SN";
    let complemento = $("#Complemento").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || "";
    let bairro = $("#Bairro").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "") || 'NI';
    let nuIbge = $("#NuIBGE").val();
    let cidade = $("#Cidade").val();
    let estado = $("#Estado").val();

    if (tipo == 'CPF') {
      tipo = 'FISICA';
      IE = 'ISENTO';

    } else {
      tipo = 'JURIDICA';
    }

    if (cpfCnpj.length) {
      animationLoadingFormClient();
      !stUltimaInstancia && animationLoadingStart('Validando Dados...', 1);

      if (tipo == 'FISICA' && !validar_Cpf(cpfCnpj)) {
        return msgWarningCadastroCliente($('#CPFCNPJ'), 'CPF Inválido, verifique o número e tente novamente!', stUltimaInstancia);
      }

      if (tipo !== 'FISICA' && !validar_Cnpj(cpfCnpj)) {
        return msgWarningCadastroCliente($('#CPFCNPJ'), 'CNPJ Inválido, verifique o número e tente novamente!', stUltimaInstancia);
      }

    } else {
      return msgWarningCadastroCliente($('#CPFCNPJ'), 'CPF/CNPJ Vazio, verifique o número e tente novamente!', stUltimaInstancia);
    }

    let regexNomeSobreNome = /^[A-Za-zÀ-ÿ\s]+$/;

    if (!razao || razao?.length < 3 || !fantasia || fantasia?.length < 2) {

      if (!razao || razao?.length < 3) return msgWarningCadastroCliente($("#NomeClienteRazao"), 'Nome ou Razão Social Vazio Ou Muito Curto, favor preencher e tentar novamente!', stUltimaInstancia);

      if (!fantasia || fantasia?.length < 2) return msgWarningCadastroCliente($("#sobrenomeNomeFan"), 'Sobrenome ou Nome Fantasia Vazio Ou Muito Curto, favor preencher e tentar novamente!', stUltimaInstancia);
    }

    if (!regexNomeSobreNome.test(razao)) {
      return msgWarningCadastroCliente($("#NomeClienteRazao"), 'Nome ou Razão Social deve conter apenas letras e espaços, favor preencher e tentar novamente!', stUltimaInstancia);
    }

    if (!regexNomeSobreNome.test(fantasia)) {
      return msgWarningCadastroCliente($("#sobrenomeNomeFan"), 'Sobrenome ou Nome Fantasia deve conter apenas letras e espaços, favor preencher e tentar novamente!', stUltimaInstancia);
    }

    if (!await validaCEP(nuCep, true)) {
      return msgWarningCadastroCliente($('#NuCEP'), 'CEP Inválido, verifique o CEP e tente novamente!', stUltimaInstancia);
    }

    if (tipo == "JURIDICA") {

      if (!idIndicacaoIE) {
        return msgWarningCadastroCliente($("#idIndicacaoIE"), 'Selecione o tipo da Indicação da Inscrição Estadual e tentar novamente!', stUltimaInstancia);
      }

      if (idIndicacaoIE == 1) {
        IE = IE?.replace(/\D/g, '');

        if (!IE) {
          return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Vazia ou Divergente do Tipo de Indicação, favor preencher e tentar novamente!', stUltimaInstancia);
        }

        if (!await validarInscricaoEstadual(IE, estado)) {
          return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Incorreta, verifique e tente novamente!', stUltimaInstancia);
        }
      } else if (idIndicacaoIE == 2) {

        if (IE && IE !== 'ISENTO') {
          return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Divergente do Tipo de Indicação, verifique e tente novamente!', stUltimaInstancia);
        }

      } else {
        IE = IE?.replace(/\D/g, '');

        if (IE) {
          //     return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Vazia ou Divergente do Tipo de Indicação, favor preencher e tentar novamente!', stUltimaInstancia);
          // }
          if (!await validarInscricaoEstadual(IE, estado)) {
            return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Incorreta, verifique e tente novamente!', stUltimaInstancia);
          }
        }
      }
    } else {
      razao = razao + ' ' + fantasia;
      fantasia = null;
    }

    if (!validaTelefoneOrCelular(nuCelular)) {
      return msgWarningCadastroCliente($('#TelefoneCliente'), 'Numero de Telefone Inválido, verifique o TELEFONE e tente novamente!', stUltimaInstancia);
    }

    if (email?.length > 0 && !validaEmail(email)) {
      return msgWarningCadastroCliente($('#email'), 'E-mail Inválido, verifique o E-MAIL e tente novamente!', stUltimaInstancia);
    }

    if (!bairro) {
      //return msgWarningCadastroCliente($('#NuCEP'), 'O Bairro deve estar preenchido, reveja o CEP e tente novamente!', stUltimaInstancia);
    }

    if ((endereco?.length > 0 && endereco !== 'NI') && !(/^[A-Za-z0-9\s\-\/.,ºªÇçÁáÉéÍíÓóÚúÂâÊêÎîÔôÛûÀàÈèÌìÒòÙùÃãÕõÜü]*$/.test(endereco) && isNaN(Number(endereco))) || !endereco?.length) {
      return msgWarningCadastroCliente($('#Endereco'), 'Endereço Inválido, verifique o endereço e tente novamente!', stUltimaInstancia);
    }

    if ((nuEndereco?.length > 0 && nuEndereco !== 'SN' && nuEndereco !== 'S/N') && (!/^\d+[A-Za-z\-\/]*$/.test(nuEndereco) || Number(nuEndereco) == 0)) {
      return msgWarningCadastroCliente($('#NuEndereco'), 'Número de Endereço Inválido, verifique o endereço e tente novamente!', stUltimaInstancia);
    }

    if (complemento?.length > 0 && !(/^[A-Za-z0-9\s\-\/.,ºªÇçÁáÉéÍíÓóÚúÂâÊêÎîÔôÛûÀàÈèÌìÒòÙùÃãÕõÜü]*$/.test(complemento) && isNaN(Number(complemento)))) {
      return msgWarningCadastroCliente($('#Complemento'), 'Complemento Inválido, verifique o endereço e tente novamente!', stUltimaInstancia);
    }

    IE = idIndicacaoIE == 2 ? 'ISENTO' : (IE || 'ISENTO');

    let dadosCliente = [{
      IDCLIENTE,
      IDEMPRESA,
      "DSNOMERAZAOSOCIAL": razao,
      "DSAPELIDONOMEFANTASIA": fantasia,
      "TPCLIENTE": tipo,
      "NUCPFCNPJ": cpfCnpj.replace(/\D/g, ""),
      "NURGINSCESTADUAL": IE,
      "NUINSCMUNICIPAL": IM,
      "NUCEP": nuCep,
      "NUIBGE": parseInt(nuIbge),
      "EENDERECO": endereco,
      "NUENDERECO": nuEndereco,
      "ECOMPLEMENTO": complemento,
      "EBAIRRO": (bairro || 'NI'),
      "ECIDADE": cidade,
      "SGUF": estado,
      "EEMAIL": email,
      "NUTELCOMERCIAL": nuComercial,
      "NUTELCELULAR": nuCelular,
      "DTNASCFUNDACAO": dtNasc,
      "IDINDICACAOIE": idIndicacaoIE,
      "DSINDICACAOIE": dsIndicacaoIE,
      "IDFUNCIONARIO": Number(idFuncionario),
    }];

    await ajaxGet(`api/gerencia/cliente.xsjs?numeroCpfCnpj=${cpfCnpj}`)
      .then((resp) => {
        registra_cliente(resp, dadosCliente, stUltimaInstancia);
      })
      .catch(e => { throw error })

  } catch (error) {
    console.log(error);
    !stUltimaInstancia && msgError('Erro ao tentar registrar os dados, recarregue e tente novamente!', stUltimaInstancia);
    msgWarningCadastroCliente($('#CPFCNPJ'), 'Erro ao tentar registrar os dados, recarregue e tente novamente!', stUltimaInstancia);
  }

}

async function registra_cliente(retornoValidaCliente, dadosCliente, stUltimaInstancia) {
    try {

        let retorno = retornoValidaCliente.data || []

        if (retorno.length) {
            await ajaxPut(`api/gerencia/cliente.xsjs`, dadosCliente).catch((error) => { throw error });

        } else {
            await ajaxPost(`api/gerencia/cliente.xsjs`, dadosCliente).catch((error) => { throw error });

        }
        
        $('#notificacaoModalCadastroCliente').html('');

        await returnMsgClientInsertOrUpdateSuccess(stUltimaInstancia, dadosCliente[0].NUCPFCNPJ);

    } catch (error) {
        console.log(error);
        msgWarningCadastroCliente(undefined, 'Erro ao Cadastrar/Atualizar Dados, recarregue e tente novamente!')
        !stUltimaInstancia && msgError()
    }

}

async function abreCadastroClienteSemRegistroUltimaInstancia(cpfOrCnpj = '', stAtualizaCadastro) {
    cpfOrCnpj = cpfOrCnpj?.replace(/\D/g, "")?.trim();

    $('#detClienteVoucher').attr('style', 'z-index: 30000 !important;');

    Swal.hideLoading();
    
    if (cpfOrCnpj?.length) {

        await modalCadastroCliente(cpfOrCnpj, true);

    } else {
        return false;
    }

    !stAtualizaCadastro && valida_dados_cliente_em_ultima_instancia(cpfOrCnpj)

    setTimeout(() => {
        $('#CPFCNPJ').attr('onchange', `valida_dados_cliente_em_ultima_instancia(this.value)`).prop('disabled', true)
    }, 1000);

}

async function createObjectVoucher() {
    try {
        let produtosSelecionados = $("[name=selecaoProdutosParaVoucher]:checked:not(:disabled)");
        let produtosVoucher = [];
        let detVoucher = [];
        let voucher = [];
        let diasAposACompra;
        let dataAutorizada;
        let stAllProdsTrocados = $('#nuVendaProd').hasClass('todosTrocados');
        let idVendedor;
        let idVendaVoucher;
        let cpfCnpjCliente;
        let IDVENDADETALHE;
        let IDPRODUTO;
        let QTD;
        let qtdDigitada;
        let VRUNIT;
        let VRTOTALBRUTO;
        let VRTOTALLIQUIDO;
        let VRDESCONTO;
        let STATIVO;
        let STCANCELADO;
        let STTROCA;
        let STTIPOTROCA;
        let VRVOUCHER = 0;

        for (let i = 0; i < produtosSelecionados.length; i++) {
            let produto = produtosSelecionados[i];
            let linhaProdutoSelecionado = $(produto).closest('tr');

            idVendaVoucher = $(produto).attr('idVenda');
            diasAposACompra = !diasAposACompra ? Number($(produto).attr('diaspassadosdacompra')) : diasAposACompra;
            dataAutorizada = !dataAutorizada ? Number($(produto).attr('dataAutorizada')) : dataAutorizada;
            IDVENDADETALHE = $(produto).attr('idVendaDetalhe');
            IDPRODUTO = String($(produto).attr('idProduto'));
            QTD = Number($(produto).attr('quantidade')).toFixed(2);
            qtdDigitada = Number($(linhaProdutoSelecionado).find('input:last').val());
            STTIPOTROCA = !STTIPOTROCA ? $(produto).attr('tipotroca') : STTIPOTROCA;
            VRUNIT = Number($(produto).attr('valorProdUnit'));
            VRTOTALBRUTO = Number($(produto).attr('valorTotalProdBruto'));
            VRTOTALLIQUIDO = Number($(produto).attr('valorProd'));
            VRDESCONTO = Number((VRTOTALBRUTO - VRTOTALLIQUIDO).toFixed(2));
            STATIVO = 'True';
            STCANCELADO = 'False';
            idVendedor = parseInt($(produto).attr('idVendedor'));
            cpfCnpjCliente = $(produto).attr('cnpfCnpjCliente') ? $(produto).attr('cnpfCnpjCliente') : "";
            valorProduto = Number(VRTOTALBRUTO);
            STTROCA = 'True'
            cpfCnpjCliente = cpfCnpjCliente ? (cpfCnpjCliente.length == 11 ? maskCPF(cpfCnpjCliente) : maskCNPJ(cpfCnpjCliente)) : "";

            VRTOTALLIQUIDO = Number((VRTOTALLIQUIDO / QTD).toFixed(2));
            VRDESCONTO = Number((VRDESCONTO / QTD).toFixed(2));
            QTD = Number((!qtdDigitada || qtdDigitada > QTD) ? QTD : qtdDigitada);
            VRTOTALBRUTO = Number((qtdDigitada * VRUNIT).toFixed(2));
            valorProduto = Number((qtdDigitada * VRTOTALLIQUIDO).toFixed(2));
            VRDESCONTO = Number(qtdDigitada * VRDESCONTO);
            VRTOTALLIQUIDO = Number(valorProduto);

            VRVOUCHER += Number(valorProduto);

            produtosVoucher.push({
                IDVENDADETALHE,
                STTROCA,
                QTD,
                VRTOTALBRUTO,
                VDESC: VRDESCONTO,
                VRTOTALLIQUIDO: valorProduto

            })

            detVoucher.push({
                IDPRODUTO,
                QTD,
                VRUNIT,
                VRTOTALBRUTO,
                VRDESCONTO,
                VRTOTALLIQUIDO,
                STATIVO,
                STCANCELADO
            })



        }

        if (produtosVoucher?.length) {
            $('#voltaTela').attr('onclick', 'telaCriacaoEdicaoVouchers(true)');

            let dataUserLogado = await getCurrentUser()?.user;
            let idUserLogado = dataUserLogado?.id
            let { IDEMPRESA, IDGRUPOEMPRESARIAL } = dataUserLogado;

            if (!dataUserLogado) {
                throw 'Erro ao Localizar os Dados do Usuário Logado, Recarregue e Tente Novamente!'
            }

            let { IDFUNCIONARIO } = await modalAuthUserCreateVoucher(idVendaVoucher, STTIPOTROCA) || false;
            let MOTIVOTROCA = IDFUNCIONARIO && await modalMotivoCriacaoVoucher() || false;
            let { IDCLIENTE, NUCPFCNPJ } = MOTIVOTROCA && await modalCpfOuCnpjDoClienteParaVoucher(cpfCnpjCliente) || false;

            if (!IDCLIENTE) {
                return false;
            }

            let IDEMPRESAORIGEM = parseInt(IDEMPRESA);
            let IDCAIXAORIGEM = parseInt(99999);
            let IDNFEDEVOLUCAO = parseInt($('#nuVendaProd').attr('value'));
            let IDUSRINVOUCHER = parseInt(idUserLogado); //Usuario da Sessao Logada
            let IDVENDEDOR = parseInt(idVendedor);
            let IDRESUMOVENDAWEB = idVendaVoucher;
            let IDUSRLIBERACAOCRIACAO = parseInt(IDFUNCIONARIO); //Usuario Autorizador da Criação

            IDCLIENTE = parseInt(IDCLIENTE);
            MOTIVOTROCA = MOTIVOTROCA.toUpperCase();
            VRVOUCHER = Number(VRVOUCHER.toFixed(2));

            voucher.push({
                IDGRUPOEMPRESARIAL,
                IDEMPRESAORIGEM,
                IDCAIXAORIGEM,
                IDNFEDEVOLUCAO,
                IDUSRINVOUCHER,
                IDVENDEDOR,
                IDCLIENTE,
                NUCPF: NUCPFCNPJ,
                VRVOUCHER,
                IDRESUMOVENDAWEB,
                STTIPOTROCA,
                MOTIVOTROCA,
                IDUSRLIBERACAOCRIACAO,
                detVoucher,
                produtosVoucher
            });

            if (stAllProdsTrocados) {
                await msgWarning('Todos os Produtos Desta Venda já Foram Trocados, Favor Verificar se o Número da Venda Está Correto!', 'Caso os Dados Estejam Corretos, Oriente o Cliente Sobre o Ocorrido Ou Fale Com o Suporte!');
                
                return false;
                
            }

        } else {
            await msgWarning('Nenhum produto foi selecionado, favor selecionar e tentar novamente!');

            return false;

        }

        return voucher;
    } catch (error) {
        console.log(error);
        msgError(error?.message || 'Erro ao tentar gerar o voucher!');

    }
}

async function criaVoucher() {
    try {
        let voucher = await createObjectVoucher() || [];

       if (voucher?.length) {
            await animationLoadingStart('Criando Voucher...', 1);

            await ajaxPost(`api/resumo-voucher/todos-web.xsjs`, voucher)
                .then(async (response) => {
                    let { IDVOUCHER } = response || '';

                    retornoVoucherCriado(IDVOUCHER);
                    //vinculoVoucherVendaDetalhe(resp, produtosVoucher);
                })
                .catch((error) => { throw error })
        }
    } catch (error) {
        console.log(error);
        msgError(error?.message || 'Erro ao tentar gerar o voucher!');
    }
}

async function retornoVoucherCriado(idVoucher) {
    await msgSuccess('Voucher Cadastrado com Sucesso!').then(() => telaCriacaoEdicaoVouchers(true, idVoucher))

    pesquisaVoucherEmitido(idVoucher);
}

//========== FIM Rotina - Create Edit Cancel - VOUCHER ==========//

///////////////////////////////////////////////////////////// INÍCIO Rotina - Lista Empresas //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////// João Paulo - 31/05/2023 /////////////////////////////////////////////////////////////

function ListaEmpresas() {
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
      } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      }
    
      $("#resultadoPesquisaEmpresa").html(
        "<div align=\"center\">" +
        "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>" +
        "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
      );
    
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
    
          ajaxGet('api/empresa.xsjs')
            .then(retornoEmpresasSelect)
            .catch(funcError);
    
          pesq_empresas();
        }
      };

    xmlhttp.open("GET", "gerencia_action_listaempresas.html", true);
    xmlhttp.send();
}

function retornoEmpresasSelect(respostaEmpresasSelect) {
    $('#idloja').select2()
  
    listaEmpresas = respostaEmpresasSelect.data;
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

function pesq_empresas() {
    dadosRetornoEmpresas = [];
    numPage = 1;
    var IDEmpresa = $("#idloja").val();
  
  
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
  
        ajaxGet('api/empresa.xsjs?id=' + IDEmpresa)
          .then(retornoPesquisaListaEmpresa)
          .catch(funcError);
      }
    };
    xmlhttp.open("GET", "gerencia_action_pesqempresas.html", true);
    xmlhttp.send();
}

function retornoPesquisaListaEmpresa(respostaPesquisaListaEmpresa) {
    numPageAtual = +respostaPesquisaListaEmpresa.page

    if (respostaPesquisaListaEmpresa.data.length != 0) {
        for (var i = 0; i < respostaPesquisaListaEmpresa.data.length; i++) {
            
            registro = respostaPesquisaListaEmpresa.data[i];

            var IDEmpresa = registro['IDEMPRESA'];
            var DSEmpresa = registro['NOFANTASIA'];
            var email = registro['EEMAILPRINCIPAL'];
            var telefone = registro['NUTELGERENCIA'];

            if (IDEmpresa != IDEmpresaLogin) {
            opcoes = `<div class="btn-group btn-group-sm">
                        <button type="button" title="Detalhar" class="btn btn-primary btn-sm" onclick="detalhesEmpresa(` + IDEmpresa + `)"><i class="fal fa-list"></i></button>
            </div>`;
            } else {
                opcoes = `<button type="button" title="Detalhar" class="btn btn-primary btn-sm" onclick="detalhesEmpresa(` + IDEmpresa + `)"><i class="fal fa-list"></i></button>
                <button type="button" title="Editar" class="btn btn-success btn-sm " onclick="editarEmpresa(` + IDEmpresa + `)"><i class="fal fa-edit"></i></button>`;
            }

            dadosRetornoEmpresas.push([
                IDEmpresa,
                DSEmpresa,
                email,
                telefone,
                opcoes
            ]);

        }

        chamarProximaListaPesquisaEmpresa(numPageAtual + 1);

    } else {
        $("#resultadoPesquisaEmpresa").html(
            `<table id="dt-basic-pesqempresas" class="table table-bordered table-hover table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th title="ID da Empresa">ID</th>
                    <th title="Nome da Empresa">Empresa</th>
                    <th title="Email">Email</th>
                    <th title="Telefone">Telefone</th>
                    <th title="Opções">Opções</th>
                </tr>
            </thead>
            <tbody>

            </tbody>

        </table>`
        );
        $('#dt-basic-pesqempresas').DataTable({
            data: dadosRetornoEmpresas,
            deferRender: true,
            columnDefs: [
                { width: 25, targets: 0 },
                { width: 200, targets: 1 },
                { width: 200, targets: 2 },
                { width: 200, targets: 3 },
                { width: 100, targets: 4 }
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

function chamarProximaListaPesquisaEmpresa(numPage) {

    ajaxGet('api/empresa.xsjs?page=' + numPage)
      .then(retornoPesquisaListaEmpresa)
      .catch(funcError);
  }

function retornoDetalhePesquisaEmpresa(respostaDetalhePesquisaEmpresa) {
    var registro = respostaDetalhePesquisaEmpresa.data[0];

    $('#IdGrupoEmpresarial').val(registro['IDGRUPOEMPRESARIAL']);
    $('#status').val(registro['STATIVO']);
    $('#dataCriacao').val(registro['DTULTATUALIZACAO'].slice(0, 10));
    $('#nomeFantasia').val(registro['NOFANTASIA']);
    $('#cep').val(registro['NUCEP']);
    $('#endereco').val(registro['EENDERECO']);
    $('#complemento').val(registro['ECOMPLEMENTO']);
    $('#bairro').val(registro['EBAIRRO']);
    $('#cidade').val(registro['ECIDADE']);
    $('#estado').val(registro['SGUF']);
    $('#email').val(registro['EEMAILPRINCIPAL']);
    $('#telefone').val(registro['NUTELGERENCIA']);

}

function detalhesEmpresa(id) {
    $.get('gerencia_action_detalhararempresamodal.html', function(res){
        $('#resultadoModalDetalheEmpresa').html(res);
        $('#detalheEmpresa').modal('show');
        $('#detalheEmpresa').on('shown.bs.modal', function () {});

        $("#footerDetalheEmpresa").html(`<button type="button" class="btn btn-success d-none" onclick="validaAtualizarEmpresa()">Atualizar</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

        ajaxGet('api/empresa.xsjs?id=' + id)
        .then(retornoDetalhePesquisaEmpresa)
        .catch(funcError);

    })
}

function editarEmpresa(id) {
    $.get('gerencia_action_detalhararempresamodal.html', function(res){
        $('#resultadoModalDetalheEmpresa').html(res);
        $('#detalheEmpresa').modal('show');
        $('#detalheEmpresa').on('shown.bs.modal', function () {});

        $('#IDEmpresaAtualizar').val(id);

        if (id > 0) {
            
            $("#emailEditar").html(`<div class="input-group">
                <input type="text" name="email" class="form-control input" id="email" value="">
            </div>`)

            $("#telefoneEditar").html(`<div class="input-group">
                <input type="text" name="telefone" class="form-control input" id="telefone" value="">
            </div>`)

            $("#footerDetalheEmpresa").html(`<button type="button" class="btn btn-success" onclick="validaAtualizarEmpresa()">Atualizar</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

        }
        ajaxGet('api/empresa.xsjs?id=' + id)
            .then(atualizarEmpresa)
            .catch(funcError);
    })
}

function atualizarEmpresa(respAtualizarEmpresa) {
    registroAtualizarEmpresa = respAtualizarEmpresa.data[0]

    $("#IdGrupoEmpresarial").val((registroAtualizarEmpresa["IDGRUPOEMPRESARIAL"]));
    $("#razaoSocial").val(registroAtualizarEmpresa["NORAZAOSOCIAL"]);
    $("#nomeFantasia").val(registroAtualizarEmpresa["NOFANTASIA"]);
    $("#cnpj").val(registroAtualizarEmpresa["NUCNPJ"]);
    $("#inscricaoEstadual").val(registroAtualizarEmpresa["NUINSCESTADUAL"]);
    $("#inscricaoMunicipal").val(registroAtualizarEmpresa["NUINSCMUNICIPAL"]);
    $("#cnae").val(registroAtualizarEmpresa["NUCNAE"]);
    $("#endereco").val(registroAtualizarEmpresa["EENDERECO"]);
    $("#complemento").val(registroAtualizarEmpresa["ECOMPLEMENTO"]);
    $("#bairro").val(registroAtualizarEmpresa["EBAIRRO"]);
    $("#cidade").val(registroAtualizarEmpresa["ECIDADE"]);
    $("#estado").val(registroAtualizarEmpresa["SGUF"]);
    $("#cep").val(registroAtualizarEmpresa["NUCEP"]);
    $("#ibge").val(registroAtualizarEmpresa["NUIBGE"]);
    $("#email").val(registroAtualizarEmpresa["EEMAILPRINCIPAL"]);
    $("#telefone").val((registroAtualizarEmpresa["NUTELGERENCIA"]));
    $("#dataCriacao").val((registroAtualizarEmpresa["DTULTATUALIZACAO"]).slice(0, 10));
    $("#status").val(registroAtualizarEmpresa['STATIVO']);
    $("#pis").val(registroAtualizarEmpresa["ALIQPIS"]);
    $("#cofins").val(registroAtualizarEmpresa["ALIQCOFINS"]);
}

function validaAtualizarEmpresa() {

    if ($("#estado").val() === "DF") {
        var nuUF = 53
      } else {
        var nuUF = 52
      }

    var dados = [{
        "STGRUPOEMPRESARIAL": +$("#IdGrupoEmpresarial").val(),
        "IDGRUPOEMPRESARIAL": +$("#IdGrupoEmpresarial").val(),
        "IDSUBGRUPOEMPRESARIAL": +$("#IdGrupoEmpresarial").val(),
        "NORAZAOSOCIAL": $("#razaoSocial").val(),
        "NOFANTASIA": $("#nomeFantasia").val(),
        "NUCNPJ": $("#cnpj").val(),
        "NUINSCESTADUAL": $("#inscricaoEstadual").val(),
        "NUINSCMUNICIPAL": $("#inscricaoMunicipal").val(),
        "CNAE": $("#cnae").val(),
        "EENDERECO": $("#endereco").val(),
        "ECOMPLEMENTO": $("#complemento").val(),
        "EBAIRRO": $("#bairro").val(),
        "ECIDADE": $("#cidade").val(),
        "SGUF": $("#estado").val(),
        "NUUF": +nuUF,
        "NUCEP": $("#cep").val(),
        "NUIBGE": $("#ibge").val(),
        "EEMAILPRINCIPAL": $("#email").val(),
        "NUTELGERENCIA": $("#telefone").val(),
        "NUCNAE": $("#cnae").val(),
        "STECOMMERCE": "False",
        "DTULTATUALIZACAO": $("#dataCriacao").val(),
        "STATIVO": $("#status").val(),
        "ALIQPIS": parseFloat($("#pis").val()),
        "ALIQCOFINS": parseFloat($("#cofins").val()),
        "IDEMPRESA": +$("#IDEmpresaAtualizar").val()
    }];

    ajaxPut('api/empresa.xsjs', dados)
        .then(funcSuccessUpdateEmpresa)
        .catch(funcError);

}

function funcSuccessUpdateEmpresa() {
    alerta_atualizado_sucesso();
    $('#detalheEmpresa').modal('hide');
    pesq_empresas();
}

///////////////////////////////////////////////////////////// FIM Rotina - Lista Empresas //////////////////////////////////////////////////////


//////////////////// RELATÓRIO ALTERAÇÃO DE PREÇOS ////////////////////

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
        <ul class="custom-option-container" data-group-id="${IDGrupo}">`;
      codHtml += `
        <li class="custom-option" data-group-id="${IDGrupo}">
          <input type="checkbox" id="option-${IDGrupo}-${IDSubGrupo}" name="options" value="${IDSubGrupo}">
          <label for="option-${IDGrupo}-${IDSubGrupo}"> ${DSSubGrupo}</label>
        </li>`;
    }

    IDGrupoAnterior = IDGrupo;
  }

  if (IDGrupoAnterior !== '') {
    codHtml += `</ul></li>`;
  }

  $('#custom-select').html(codHtml);

  // Adiciona evento para os checkboxes de seleção de todos os itens do grupo
  $('.select-all-group').on('change', function() {
    var groupId = $(this).data('group-id');
    var isChecked = $(this).is(':checked');
    $(`li[data-group-id='${groupId}'] input[type='checkbox']`).prop('checked', isChecked);

    // Atualiza a lista global de grupos e subgrupos selecionados
    if (isChecked) {
      if (!selectedGroups.includes(groupId)) {
        selectedGroups.push(groupId);
      }
      // Adiciona subgrupos associados ao grupo selecionado
      $(`li[data-group-id='${groupId}'] input[name='options']`).each(function() {
        var subgrupoId = $(this).val();
        if (!selectedSubgroups.includes(subgrupoId)) {
          selectedSubgroups.push(subgrupoId);
        }
      });
    } else {
      selectedGroups = selectedGroups.filter(id => id !== groupId);
      // Remove subgrupos associados ao grupo desmarcado
      $(`li[data-group-id='${groupId}'] input[name='options']`).each(function() {
        var subgrupoId = $(this).val();
        selectedSubgroups = selectedSubgroups.filter(id => id !== subgrupoId);
      });
    }
  });

  // Adiciona evento para expandir/recolher grupos
  $('.custom-optgroup').on('click', function() {
    var groupId = $(this).data('group-id');
    $(this).toggleClass('expanded');
    $(`.custom-option-container[data-group-id='${groupId}']`).slideToggle();
  });

  // Adiciona evento para os checkboxes dos subgrupos
  $('input[name="options"]').on('change', function() {
    var groupId = $(this).closest('li').data('group-id');
    var subgrupoId = $(this).val();
    if ($(this).is(':checked')) {
      if (!selectedSubgroups.includes(subgrupoId)) {
        selectedSubgroups.push(subgrupoId);
      }
      // Adiciona o grupo se não estiver na lista
      if (!selectedGroups.includes(groupId)) {
        selectedGroups.push(groupId);
      }
    } else {
      selectedSubgroups = selectedSubgroups.filter(id => id !== subgrupoId);
      // Remove o grupo se todos os subgrupos associados estiverem desmarcados
      var allUnchecked = $(`li[data-group-id='${groupId}'] input[name='options']:checked`).length === 0;
      if (allUnchecked) {
        selectedGroups = selectedGroups.filter(id => id !== groupId);
      }
    }
  });

  // Adiciona evento para o checkbox "Selecionar Tudo"
  $('#select-all').on('change', function() {
    var isChecked = $(this).is(':checked');
    $('input[type="checkbox"]').prop('checked', isChecked);

    // Atualiza as listas globais
    if (isChecked) {
      selectedGroups = [...new Set($('.custom-optgroup').map((_, el) => $(el).data('group-id')).get())];
      selectedSubgroups = [...new Set($('input[name="options"]').map((_, el) => $(el).val()).get())];
    } else {
      selectedGroups = [];
      selectedSubgroups = [];
    }
  });
}

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
          $("#idgrupograde").select2();
          $("#idgrade").select2();
          $("#estrutura").select2();
            
              
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
  xmlhttp.open("GET", "gerencia_action_alteracao_preco.html", true);
  xmlhttp.send();
}


var selectedGroups = [];
var selectedSubgroups = [];

function alteracaopreco(numPage) {
  var idEmpresa = IDEmpresaLogin;
  // Converte os arrays de IDs para strings separadas por vírgulas
  var grupo = selectedGroups.join(',');
  var subgrupo = selectedSubgroups.join(',');
  var descproduto = $("#descProduto").val();
  var estoque = $("#estoque").is(":checked");
  var codBarras = $("#codBarras").val();
  var dataInicio = $("#dtconsultainicio").val();
  var dataFim = $("#dtconsultafim").val();

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

  xmlhttp.open("GET", "gerencia_action_alteracaopreco.html", true);
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
      var numeroAlteracao = registro.IDRESUMOALTERACAOPRECOPRODUTO;
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
        <th colspan="7" style="text-align: center;">Total</th>
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
      
      var EmpFunc = IDEmpresaLogin;
      ajaxGet('api/informatica/grupoempresas.xsjs')
          .then(retornoListaGrupoEmpresasSelect)
          .catch((e) => { funcError(), console.log(e) });
          
      ajaxGetAllData('api/administrativo/funcionarioreceb.xsjs?page=1&idEmpresa=' + EmpFunc)
          .then(retornoListaFuncionarioReceb)
          .catch((e) => { funcError(), console.log(e) });
              
        ajaxGet('api/administrativo/formapagamento.xsjs')
          .then(retornoListaFormaPagSelect)
          .catch((e) => { funcError(), console.log(e) });
    }
  };
  xmlhttp.open("GET", "gerencia_action_listrecebimentosloja.html", true);
  xmlhttp.send();
}

function selecionaempresamarca(){

  idmarca = $('#idgrupo').val();

  ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca)
.then(retornoListaEmpresasSelect2)
.catch((e) => { funcError(), console.log(e) });
}

function retornoListaEmpresasSelect2(respostaListaEmpresas, startCarregamento) {

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


function retornoListaFuncionarioReceb(respostaListaFuncionarioReceb) {
  

      $("#idfuncvenda").empty();
      $('#idfuncvenda').append(
        `<option value="">Selecione ...</option>`
    );

  
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

function pesqRecebimentos(numPage) {
  
  var IDEmpresaPesqVenda   = IDEmpresaLogin;
  var IDFuncPesqVenda = $("#idfuncvenda").val();
  var datapesqinicio = $("#dtconsultainicio").val();
  var datapesqfim = $("#dtconsultafim").val();
  var dsformapag = $("#dsformapag").val();
  var dsparc = $("#dsparc").val() 

  var dsparcStr = dsparc.join(',');
  var dsformapagStr = dsformapag.join(',');


  dataRetornoReceb = [];
  VrTotalRecebidoMoeda = 0;

  var xmlhttp;
  if (window.XMLHttpRequest) {
      // Para IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
  } else {
      // Para IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          document.getElementById("resultado").innerHTML = xmlhttp.responseText;
          $('.dataAtual').text(dataAtual);

          // Faz a requisição AJAX com os parâmetros corretos
          ajaxGet('api/administrativo/venda-total-recebido-periodo.xsjs?pageSize=500&page=' + numPage + 
              '&idEmpresa=' + IDEmpresaPesqVenda + 
              '&dataPesquisaInicio=' + datapesqinicio + 
              '&dataPesquisaFim=' + datapesqfim + 
              '&idFunc=' + IDFuncPesqVenda + 
              '&dSFormaPag=' + encodeURIComponent(dsformapagStr) + 
              '&dSParc=' + dsparcStr)
              .then(retornoListaRecebimentos)
              .catch((e) => { funcError(), console.log(e) });
      }
  };

  xmlhttp.open("GET", "administrativo_action_pesqrecebimentosloja.html", true);
  xmlhttp.send();
}

function chamarProximaListaRecebidoLoja(numPage){

  var IDEmpresaGrupo = $("#idgrupo").val();
  var IDEmpresaPesqVenda   = IDEmpresaLogin;
  var IDFuncPesqVenda = $("#idfuncvenda").val();
  var datapesqinicio = $("#dtconsultainicio").val();
  var datapesqfim = $("#dtconsultafim").val();
  var dsformapag = $("#dsformapag").val();
  var dsparc = $("#dsparc").val();
    
      ajaxGet('api/administrativo/venda-total-recebido-periodo.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idFunc=' + IDFuncPesqVenda + '&dSFormaPag=' + dsformapag + '&dSParc=' + dsparc )
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
  var IDEmpresaPesqVenda   = IDEmpresaLogin;
  var IDFuncPesqVenda = $("#idfuncvenda").val();
  var datapesqinicio = $("#dtconsultainicio").val();
  var datapesqfim = $("#dtconsultafim").val();
  var dsformapag = $("#dsformapag").val();
  var dsparc = $("#dsparc").val();
  

  var dsparcStr = dsparc.join(',');

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
    
      ajaxGet('api/administrativo/venda-total-forma-pag.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idFunc=' + IDFuncPesqVenda + '&dSFormaPag=' + dsformapag + '&dSParc=' + dsparcStr)
        .then(retornoListaRecebimentosFormPag)
        .catch((e) => { funcError(), console.log(e) });
    }
  };
  
  xmlhttp.open("GET", "administrativo_action_pesqrecebimentosloja.html", true);
  xmlhttp.send();
}

function chamarProximaListaRecebidoFormPag(numPage){

  var IDEmpresaGrupo = $("#idgrupo").val();
  // var IDEmpresaPesqVenda = $("#idlojavendadesc").val();
  var IDEmpresaPesqVenda   = IDEmpresaLogin;
  var IDFuncPesqVenda = $("#idfuncvenda").val();
  var datapesqinicio = $("#dtconsultainicio").val();
  var datapesqfim = $("#dtconsultafim").val();
  var dsformapag = $("#dsformapag").val();
  var dsparc = $("#dsparc").val();
    
      ajaxGet('api/administrativo/venda-total-forma-pag.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idFunc=' + IDFuncPesqVenda + '&dSFormaPag=' + dsformapag + '&dSParc=' + dsparc)
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

function retornoListaGrupoEmpresasSelect(respostaGrupoEmpresas) {

    $("#idgrupo").empty();
    $('#idgrupo').append(`<option value="0">TODOS</option>`);
  
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

//?============ INICIO ROTINA - IMPRESSÃO ETIQUETAS REMARCACAO ============ //
/* 
AUTOR: Hendryw Deyvison
  E-MAIL: hendryw.deyvison@gmail.com
  DATA: 02/10/2024
*/

// Inicio Variaveis Globais da Rotina De Etiquetas//
var acumuladorEtiquetasRemarcacao = [];
// Fim Variaveis Globais da Rotina De Etiquetas//

// Inicio Funções Globais da Rotina De Etiquetas//
function formatToDecimal(element, qtdDecimal = 2){
    let value = $(element).val().replace(/\D/g, '').padStart(3, '0');
    let firstPart = String(value).substring(0, value.length - 2);
    let lastPart = String(value).substring(value.length - 2, value.length)

    value = Number([
        firstPart,
        '.',
        lastPart
    ].join(''));

    $(element).val(maskValorEmDecimal(value, qtdDecimal));
}

function formatToNumber(element) {
    let value = Number($(element).val().replace(/\D/g, '') || 0);
    
    value = value ? maskValorEmInteiro(value) : '';

    $(element).val(value);
}

function habilitarButtonsEtiquetaRemarcacao(element){
    let value = Number($(element).val().replace(/\D/g, '') || 0);

    if (value){
        $('#btnAcumuladorImpEtiquetasRemarcacao').removeClass('d-none');
    } else{
        $('#btnAcumuladorImpEtiquetasRemarcacao').addClass('d-none');
    }

    if (acumuladorEtiquetasRemarcacao?.length){
        $('#btnDeletarAcumuladorImpEtiquetasRemarcacao, #containerQtdCopias').removeClass('d-none');
    } else {
        $('#btnDeletarAcumuladorImpEtiquetasRemarcacao, #containerQtdCopias').addClass('d-none');
    }
    
}
// Fim Funções Globais da Rotina De Etiquetas//

async function TelaEtiquetaRemarcacao() {
    try {
        animationLoadingStart('Carregando Dados...');
        
        acumuladorEtiquetasRemarcacao = [];
        
        await $.get("action_etiqueta_remarcacao.html", function (resp) {
            $('#js-page-content').html(resp);
        }).fail((error) => { throw error; });

        $('#vrEtiquetaRemarcacao').focus().val('');

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        animationLoadingStop();

        msgError(error);
    }
}

async function modalQuestionQuantidadeCopiasEtiquetaRemarcacao() {
    let qtdCopias;

    await Swal.fire({
        type: 'question',
        title: 'Digite a quantidade de Cópias?',
        html: `
            <div class="text-dark fw-900">

                <div class="input-group">
                    <input type='text' min='1' id="qtdCopiasModal" class="swal2-input z-index-5 mt-0 w-50" type="text" autocomplete="off" placeholder="Digite a quantidade" style="text-align: center;" oninput="formatToNumber(this)">
                </div>

            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar!',
        cancelButtonText: 'Não, Voltar!',
        confirmButtonColor: '#2196F3',
        cancelButtonColor: '#d33',
        onOpen: () => {
            $('#qtdCopiasModal').focus().on('keypress', (e) => {
                if (e.keyCode == 13) {
                    Swal.clickConfirm()
                }
            });
        },
        preConfirm: async () => {
            qtdCopias = Number(($('#qtdCopiasModal').val().replaceAll('.', '')).replaceAll(',', '.') || 0);

            if (!qtdCopias) {
                $('#qtdCopiasModal').focus();
                $('#swal2-validation-message').addClass('text-danger fw-700');
                return Swal.showValidationMessage('Digite a quantidade e tente novamente!');
            }
        }
    })

    return qtdCopias;

}

async function modalQuestionQuantidadeEtiquetaRemarcacao() {
    let qtdEtiqueta;

    await Swal.fire({
        type: 'question',
        title: 'Digite a quantidade de etiquetas?',
        html: `
            <div class="text-dark fw-900">

                <div class="input-group">
                    <input type='text' min='1' id="qtdEtiqueta" class="swal2-input z-index-5 mt-0 w-50" type="text" autocomplete="off" placeholder="Digite a quantidade" style="text-align: center;" oninput="formatToNumber(this)">
                </div>

            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar!',
        cancelButtonText: 'Não, Voltar!',
        confirmButtonColor: '#2196F3',
        cancelButtonColor: '#d33',
        onOpen: () => {
            $('#qtdEtiqueta').focus().on('keypress', (e) => {
                if (e.keyCode == 13) {
                    Swal.clickConfirm()
                }
            });
        },
        preConfirm: async () => {
            qtdEtiqueta = Number(($('#qtdEtiqueta').val().replaceAll('.', '')).replaceAll(',', '.') || 0);

            if (!qtdEtiqueta) {
                $('#qtdEtiqueta').focus();
                $('#swal2-validation-message').addClass('text-danger fw-700');
                return Swal.showValidationMessage('Digite a quantidade e tente novamente!');
            }
        }
    })

    return qtdEtiqueta;

}   

function indicadorQuantidadesNoModalEtiquetas(qtdEtiquetas, qtdCopias, qtdPorPagina = 4) {
    let totalPaginas = Math.ceil(qtdEtiquetas / qtdPorPagina) * qtdCopias;
    let totalEtiquetas = qtdEtiquetas * qtdCopias; 

    return (`
        <span>Qtd. Páginas: <b>${totalPaginas} página${totalPaginas > 1 ? 's' : ''}</b></span> 
        <span>Qtd. Etiquetas:  <b>${totalEtiquetas} unidade${totalEtiquetas > 1 ? 's' : ''}</b></span>
    `);
}

async function modalPreviaEtiquetasRemarcacaoParaImprimir(labelData, qtdCopiasModal = 0) {
    let qtdCopias = Number(qtdCopiasModal) || Number($('#qtdCopias').val() || 1);
    let htmlDivPage = `<div class="etiqueta-remarcacao-page rounded" ><div class="etiqueta-remarcacao-page-number hidden-print" >numPage</div>`;
    let htmlCloseDiv = `</div>`
    let htmlLabelPages = htmlDivPage;
    let totalQtdEtiquetas = 0;
    let contador = 0;
    let arrayLabelCards = [];
    let htmlEtiquetasParaImprimir = ``;
    let lengthVrEtiqueta = 0;
    let fontSize = 1.2;
    let jsContent = 'center';
    let vrDiferencaLength = 0;
    let vrCompensacao = 0;

    $('#resultadoImpEtiquetaProd').html('');

    if (labelData?.length) {
        labelData.map(({ vrEtiqueta, qtdEtiqueta }) => {
            vrEtiqueta = maskValor(vrEtiqueta);
            lengthVrEtiqueta = vrEtiqueta.length;

            if (lengthVrEtiqueta <= 11){
                jsContent = 'center';
            } else{
                jsContent = 'flex-start';
            }

            if (lengthVrEtiqueta > 12) {
                vrDiferencaLength = lengthVrEtiqueta - 12;
            } 

            if (lengthVrEtiqueta >= 15) {
                vrDiferencaLength = lengthVrEtiqueta - 14;
            } 

            vrCompensacao = vrDiferencaLength / 10;
            fontSize = lengthVrEtiqueta <= 12 ? 1.2 : Number(fontSize - vrCompensacao).toFixed(3);

            let htmlCardEtiqueta = `
                <div class="etiqueta-remarcacao-card border-dark rounded">
                    <div class="etiqueta-remarcacao-card-body"></div>
                    <div class="preco-remarcacao" style="font-size: ${fontSize + 'em'}; justify-content: ${jsContent}">
                        <h2 style="margin: 1px !important;">${vrEtiqueta}</h2>
                    </div>
                </div>
            `;

            totalQtdEtiquetas += qtdEtiqueta;

            for (let i = 0; i < qtdEtiqueta; i++) {
                arrayLabelCards.push(htmlCardEtiqueta);
            }

        })

        arrayLabelCards.map((htmlCardEtiqueta, i) => {
            htmlLabelPages += htmlCardEtiqueta;
            contador++;

            if (contador == 4) {
                htmlLabelPages += htmlCloseDiv;

                if ((i + 1) < arrayLabelCards.length) {
                    htmlLabelPages += htmlDivPage;
                }
                contador = 0;
            }

        })

        htmlLabelPages += htmlCloseDiv;

        htmlEtiquetasParaImprimir = new Array(qtdCopias).fill(htmlLabelPages).join('').split(/(?=<div class="etiqueta-remarcacao-page )/);

        htmlEtiquetasParaImprimir = htmlEtiquetasParaImprimir.map((item, i) => item.replace('numPage', `${i + 1}`)).join('');

        $('#resultadoImpEtiquetaRemarcacao').html(htmlEtiquetasParaImprimir);
        $('#modalImpEtiquetaRemarcacao').modal('show');

        $('.modal-title-quantidade').html(indicadorQuantidadesNoModalEtiquetas(totalQtdEtiquetas, qtdCopias));

    }
}

async function validaDadosEtiquetasRemarcacao(){
    let labelData = [...acumuladorEtiquetasRemarcacao] || [];
    let qtdCopias;

    if(!labelData?.length){
        let vrEtiqueta = Number(($('#vrEtiquetaRemarcacao').val().replaceAll('.', '')).replace(',', '.'));
        let qtdEtiqueta = vrEtiqueta && await modalQuestionQuantidadeEtiquetaRemarcacao();
        
        qtdCopias = qtdEtiqueta && 1; //await modalQuestionQuantidadeCopiasEtiquetaRemarcacao();

        if (vrEtiqueta && qtdEtiqueta && qtdCopias){
            labelData.push({
                vrEtiqueta,
                qtdEtiqueta
            });
        }
    }

    labelData.length && modalPreviaEtiquetasRemarcacaoParaImprimir(labelData, qtdCopias);
}

function imprimirEtiquetasRemarcacao() {
    try{
        animationLoadingStart('Aguardando o processo de impressão, favor finalizar a impressão...', false, 1);

        let htmlEtiquetas = document.getElementById('resultadoImpEtiquetaRemarcacao').innerHTML;
        let htmlToPrint = `
        <html>
            <head>
                <meta charset="utf-8">
                <title>Impressão</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"> 
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        font-family: 'Roboto', sans-serif !important;
                        font-size: 13px;
                        letter-spacing: -0.05px !important;
                        margin: 1px !important;
                        transform: rotate(0deg);
                        transform-origin: center;
                    }

                    @media print{

                        body {
                            display: block;
                        }

                        @page {
                                size: 6cm 2.5cm;
                                margin: -2.9cm;
                                orientation: portrait;
                            }

                        .etiqueta-remarcacao-page {
                            display: flex;
                            flex-wrap: wrap;
                            align-content: flex-start;
                            margin: 0 0 0 6%;
                            width: 100%;
                            height: 95%;
                            padding: 0;
                        }

                        .etiqueta-remarcacao-page-number {
                            display: none;
                        }

                        .etiqueta-remarcacao-card {
                            width: 24% ;
                            height: 100%;
                            margin-right: 0;
                            margin-bottom: 0;
                            padding: 29% 0 0 3px !important;
                            box-sizing: border-box;
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                            align-items: center;
                            page-break-after: always;
                        }

                        .preco-remarcacao{
                            font-weight: bold;
                            letter-spacing: -2px !important;
                            display: flex !important;
                            align-items: center !important;
                            width: 100% !important;
                        }

                        h2{
                            font-size: 1.31em !important;
                            margin: 0% !important;
                        }
                    }
                </style>
                <script>
                    window.onafterprint = function() {
                        window.close();
                    };

                    window.document.addEventListener('DOMContentLoaded', function() {
                        window.focus();
                        window.print();
                    });
                </script>
            </head>
            <body>
                ${htmlEtiquetas}
            </body>
        </html>
        `;

        let tela_impressao = window.open('', '', '');

        tela_impressao = tela_impressao.document;

        tela_impressao.open();
        tela_impressao.write(htmlToPrint);
        tela_impressao.close();
        
        //animationLoadingStop()

        msgSuccess('Processo de Impressão Finalizado!').then(() => {
            $('#modalImpEtiquetaRemarcacao').modal('hide');
        })
    } catch(error){
        console.log(error);
        msgError('Erro ao tentar imprimir, recarregue e tente novamante');
    } 
}

function editQtdEtiquetaRemarcacao(idArray, value) {
    acumuladorEtiquetasRemarcacao[idArray].qtdEtiqueta = Number(value || 1);
}

function nextInputElement(event) {
    let element = $(event.target);
    let tableRow = element.closest('tr');
    let tableBody = $(tableRow).parent();
    let nextLine = tableRow.next();
    let nextInput = nextLine?.length ? nextLine.find('input') : tableBody.find('tr:first').find('input');
    let vrElement = nextInput.val();

    if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();

        nextInput.focus();
        nextInput.value = vrElement;
    }
}

async function listarEtiquetasRemarcacao(isFocus = false) {
    let indice = 0;
    let dadosTable = [];

    acumuladorEtiquetasRemarcacao.map((etiqueta, idArray) => {

        let { vrEtiqueta, qtdEtiqueta } = etiqueta;
        indice++;

        let opcoes = `
            <div class="d-flex justify-content-center input-group w-100">
                <button class="btn btn-danger" type="button" onclick="deletarEtiquetaRemarcacaoDoAcumulador('${idArray}')" title="Excluir Etiqueta">
                    <span class="fal fa-trash mr-1"></span>
                </button>
            </div>
        `;

        let inputQtdEtiqueta = `
            <div class="d-flex justify-content-center text-dark fw-900">
                <div class="input-group w-25">
                    <input type='text' class="form-control text-center border-dark" " autocomplete="off" value='${qtdEtiqueta || 1}' style="text-align: center;" oninput="(formatToNumber(this), editQtdEtiquetaRemarcacao('${idArray}', this.value))" onkeydown="nextInputElement(event)" onchange="(this.value = Number(this.value) || 1)">
                </div>

            </div>
        `;

        dadosTable.push([
            indice,
            opcoes,
            maskValorEmBRL(vrEtiqueta),
            inputQtdEtiqueta
        ]);
    })

    $('#resultado').removeClass('d-none').html(`
      <div class="col-sm-12 col-xl-12">
        <table id="dt-basic-lista-etiquetas-remarcacao" class="table table-bordered table-hover table-striped w-100">
          <thead class="bg-primary-600">
              <tr>
                <th class="text-center">#</th>
                <th class="text-center">Opções</th>
                <th class="text-center">Valor</th>
                <th class="text-center">Quantidade</th>
              </tr>
          </thead>
        </table>
      </div>
    `);

    $('#dt-basic-lista-etiquetas-remarcacao').DataTable({
        data: dadosTable,
        paging: true,
        pageLength: 50,
        searching: true,
        info: true,
        deferRender: false,
        responsive: true,
        autoWidth: true,
        columnDefs: [
            {
                type: 'currency-brl',
                targets: [2],
            }
        ],
        columns: [
            { width: '5%' },
            { width: '5%' },
            { width: '45%' },
            { width: '45%' },
        ],
        language: {
            "emptyTable": "Dados não encontrados!"
        },
        initComplete: function (settings) {
            let idTable = `#${settings.nTable.id}`;

            if (isFocus) {
                $(idTable).focus();

                $('html, body').animate({
                    scrollTop: $(idTable).offset().top
                }, 1000);
            }
        }
    });
}

async function guardarNoAcumuladorImpEtiquetasRemarcacao() {
    let vrEtiqueta = Number(($('#vrEtiquetaRemarcacao').val().replaceAll('.', '')).replaceAll(',', '.'));
    let qtdEtiqueta = vrEtiqueta && await modalQuestionQuantidadeEtiquetaRemarcacao();

    if (qtdEtiqueta){

        if (!acumuladorEtiquetasRemarcacao?.length){
            acumuladorEtiquetasRemarcacao = [];
        }

        acumuladorEtiquetasRemarcacao.push({
            vrEtiqueta,
            qtdEtiqueta
        })

        $('#btnDeletarAcumuladorImpEtiquetasRemarcacao, #containerQtdCopias').removeClass('d-none');

        await listarEtiquetasRemarcacao();

        await msgSuccess('Guardado com Sucesso!', undefined, 2000);

        setTimeout(()=> $('#vrEtiquetaRemarcacao').focus().val(''), 500);
    }
}

function deletarTudoDoAcumuladorImpEtiquetasRemarcacao() {

    Swal.fire({
        type: 'question',
        title: 'Deseja Limpar as Etiquetas Guardadas?',
        text: 'Esta ação não poderá ser desfeita!',
        showCancelButton: true,
        confirmButtonText: 'Sim, Limpar!',
        cancelButtonText: 'Não, Voltar!',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#2196F3',
        preConfirm: () => {
            acumuladorEtiquetasRemarcacao = [];

        }
    })
    .then(async (resp) => {
        if(resp.value){
            $('#btnAcumuladorImpEtiquetasRemarcacao, #btnDeletarAcumuladorImpEtiquetasRemarcacao, #containerQtdCopias, #resultado').addClass('d-none');

            //await listarEtiquetasRemarcacao();

            await msgSuccess('Limpo com Sucesso!', undefined, 2000);

            setTimeout(() => $('#vrEtiquetaRemarcacao').focus().val(''), 500);
        }
    })
}

function deletarEtiquetaRemarcacaoDoAcumulador(idArray){
    acumuladorEtiquetasRemarcacao.splice(idArray, 1);

    if(acumuladorEtiquetasRemarcacao.length){
        listarEtiquetasRemarcacao(true);
    } else {
        $('#btnAcumuladorImpEtiquetasRemarcacao, #btnDeletarAcumuladorImpEtiquetasRemarcacao, #containerQtdCopias, #resultado').addClass('d-none');

        $('#vrEtiquetaRemarcacao').val('').focus();
    }
}

//?============ FIM ROTINA - IMPRESSÃO ETIQUETAS REMARCACAO ============ //

//? ======================================================== INICIO ROTINA ENVIO DE MALOTES ======================================================== //
// Autor: Hendryw Deyvison
// E-mail: hendryw.deyvison@gmail.com
// Data: 14/03/2024

function formataStringComEspaço(string = '') {
    return string?.replace(/ {2,}/g, ' ')?.replace(/(\n\s*){2,}/g, '\n');
}

async function TelaListarMalotesLoja() {
    try{
        animationLoadingStart();

        await $.get("gerencia_action_listmalotesloja.html", async (res) => $('#js-page-content').html(res));

        $('.dataAtual').text(dataAtual);
        $('#dtconsultainicio, #dtconsultafim').val(dataAtualCampo);
        $('#dtconsultainicio, #dtconsultafim, #idMalote').on('keypress', (e) => { if (e.keyCode == 13) pesquisarMalotesLoja() });
        $('#statusMalote').select2();

        $('#idloja, #statusMalote, #pendenciasMalote').on('select2:open', function (e) {
            $('.select2-search__field').on('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();

                    pesquisarMalotesLoja()
                }
            });
        });

        animationLoadingStop();

        $('#dtconsultainicio').focus();

    } catch(error){
        console.error(error);
        msgError();
    }
    
}

async function pesquisarMalotesLoja() {
    try{
        let idEmpresa = (await getCurrentUser())?.user.IDEMPRESA;
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();
        let statusMalote = $("#statusMalote").val() || '';
        let idMalote = $("#idMalote").val() || '';

        await ajaxGetAllData(`api/gerencia/malotes-por-loja.xsjs?pageSize=500&page=1&idEmpresa=${idEmpresa}&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}&statusMalote=${statusMalote}&idMalote=${idMalote}`)
            .then(retornoListaMalotesLoja)
            .catch((error) => { throw error });

    } catch(error){
        console.error(error);
        msgError();
    }

}

function retornoListaMalotesLoja({ data }) {
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
            let obsFinanceiroMalote = registro?.OBSERVACAOADMINISTRATIVOMALOTE || '';
            let obsLojaMalote = registro?.OBSERVACAOLOJAMALOTE || '';
            let stAtivoMalote = registro?.STATIVOMALOTE;
            let dataHoraMalote = registro?.DATAHORACRIACAOMALOTE;
            let statusMalote = registro?.STATUSMALOTE || 'Pendente de Envio';
            let textButtonDetalhes = statusMalote == 'Devolvido' ? '<i class="fal fa-upload mr-1"></i>Reenviar' : '<i class="fal fa-eye mr-1"></i>Detalhes';
            let classButtonDetalhes = statusMalote == 'Devolvido' ? 'btn-warning' : 'btn-info';

            let btnDetalhar = `<button type="button" class="btn ${classButtonDetalhes}" title="Malote ${statusMalote}!" onClick="abrirModalDetalhesMalote(${idMalote})">${textButtonDetalhes}</button>`;

            let btnEnviar = `<button class="btn btn-primary" type="button" onclick="enviarDadosMalote(this, ${idMalote})"><span class="fal fa-upload mr-1"></span>Enviar</button>`;
            let containerButtons = statusMalote == 'Pendente de Envio' ? btnEnviar : btnDetalhar;
            let classStatus = 'text-danger';
            let msgStatus = statusMalote

            vrDespesaTotal = idMalote ? vrDespesa : parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrTotalVendido = idMalote ? vrTotalRecebidoMalote : parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoCartao) + parseFloat(vrRecebidoPos) + parseFloat(vrRecebidoPix) + parseFloat(vrRecebidoMOOVPAY) + parseFloat(vrRecebidoConvenio) + parseFloat(vrRecebidoVoucherLoja);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoFatura);

            if (statusMalote == 'Enviado' || statusMalote == 'Reenviado') {
                classStatus = 'text-info';
                msgStatus += ' e Aguardando Recepção...';
            }

            if (statusMalote == 'Recepcionado') {
                classStatus = 'text-info';
                msgStatus += ' e Aguardando Conferência...';
            }

            if (statusMalote == 'Conferido') {
                classStatus = 'text-success';

                if ((obsFinanceiroMalote)?.trim()?.length > 0) {
                    classStatus = 'text-primary';
                    msgStatus += ' Com Observações e/ou Pendências';
                }
            }

            if (statusMalote == 'Devolvido') {
                msgStatus += ' e Aguardando Reenvio...';
            }

            if (parseFloat(vrAjusteDin) > 0) {
                vrTotalDinheiroAjuste = parseFloat(vrTotalDinheiroAjuste) + parseFloat(vrAjusteDin);
            } else {
                vrTotalDinheiro = idMalote ? vrTotalDinheiro : parseFloat(vrTotalDinheiro) + parseFloat(vrRecebidoDin);
            }

            vrQuebraCaixa = (parseFloat(vrRecebidoDin)) - parseFloat(vrFisicoDin);

            vrTotal = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);
            vrDisponivel = idMalote ? parseFloat(vrDisponivelMalote) : parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal) + parseFloat(vrQuebraCaixa);

            if (vrQuebraCaixa > 0) {
                tagquebracaixa = `<label style="color: blue;"> + ` + mascaraValor(parseFloat(vrQuebraCaixa).toFixed(2)) + `</label>`;
            } else {
                tagquebracaixa = `<label style="color: red;"> - ` + mascaraValor(parseFloat(vrQuebraCaixa).toFixed(2)) + `</label>`;
            }
            
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
                `<label class="${classStatus} text-truncate fw-900">${msgStatus}</label>`,
                containerButtons
            ]);

            /*totalVrRecebidoDinheiro = parseFloat(totalVrRecebidoDinheiro) + parseFloat(vrRecebidoDinheiro);
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
            totalVrDisponivel = parseFloat(totalVrDisponivel) + parseFloat(vrDisponivel);*/

            if (totalVrQuebraCaixa > 0) {
                tagquebracaixatotal = `<th><label style="color: blue;"> + ` + mascaraValor(parseFloat(totalVrQuebraCaixa).toFixed(2)) + `</label></th>`;
            } else {
                tagquebracaixatotal = `<th><label style="color: red;"> - ` + mascaraValor(parseFloat(totalVrQuebraCaixa).toFixed(2)) + `</label></th>`;
            }
        }
        
        /*$('#totalResultadoMalotesLoja').html(
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
            </tr>`
        );*/

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
                    <input class="form-check-input" title="${TXTPENDENCIA}" type="checkbox" id="${IDPENDENCIA}" value="${TXTPENDENCIA}" disabled>
                    <label class="form-check-label d-inline-block fw-700 text-dark" title="${TXTPENDENCIA}" for="${IDPENDENCIA}">${TXTPENDENCIA}</label>
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

async function abrirModalDetalhesMalote(idMalote) {
    try {
        animationLoadingStart();

        await $.get('action_detalhes_malotes.html', async (respHtml) => $('#detDadosMalote').html(respHtml)).catch((error) => { throw error });

        await listarPendenciasMaloteModal().catch((error) => { throw error });

        $('#btnReenviarMalote').addClass('d-none').attr('onclick', '');
        $("#detStatusMalote").modal('show');

        await ajaxGetAllData('api/gerencia/detalhe-malotes-por-loja.xsjs?idMalote=' + idMalote)
            .then(retornoModalDetalhesMalote)
            .catch((error) => { throw error });

        animationLoadingStop();
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

    $('#usuarioConferenciaMalote, #dataConferenciaMalote, #usuarioDevolucaoMalote, #dataDevolucaoMalote, #usuarioReenviadoMalote, #dataReenviadoMalote, #pendenciasDetalheMalote').closest('h6').addClass('d-none');
    $('#observacaoLojaMalote').prop('readonly', false);

    if (STATUSMALOTE == 'Enviado' || STATUSMALOTE == 'Reenviado') {
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

    if (STATUSMALOTE == 'Devolvido') {
        $('#usuarioDevolucaoMalote, #dataDevolucaoMalote, #usuarioReenviadoMalote, #dataReenviadoMalote').closest('h6').removeClass('d-none');
        $('#observacaoLojaMalote').prop('readonly', false);
        $('#btnReenviarMalote').removeClass('d-none').attr('onclick', `enviarDadosMalote(this, ${IDMALOTE})`);
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

    $('#observacaoLojaMalote').text(OBSERVACAOLOJA || '').attr('rows', `${OBSERVACAOLOJA?.length > 0 ? 5 : 1}`);
    $('#observacaoFinanceiroMalote').text(OBSERVACAOADMINISTRATIVO || '').attr('rows', `${OBSERVACAOADMINISTRATIVO?.length > 0 ? 5 : 1}`);

    DATAHORADEVOLVIDO && $('#usuarioDevolucaoMalote, #dataDevolucaoMalote').closest('h6').removeClass('d-none');
    DATAHORAREENVIADO && $('#usuarioReenviadoMalote, #dataReenviadoMalote').closest('h6').removeClass('d-none');

    if (STATUSMALOTE !== 'Devolvido') {
        $('#observacaoLojaMalote').prop('readonly', true);
        $('#btnReenviarMalote').addClass('d-none');
    }

    if (STATUSMALOTE == 'Conferido' || STATUSMALOTE == 'Enviado') {
        $('#usuarioConferenciaMalote, #dataConferenciaMalote').closest('h6').removeClass('d-none');
    }

    if (PENDENCIAS?.length > 0 || STATUSMALOTE == 'Devolvido' || STATUSMALOTE !== 'Conferido') {
        $('#pendenciasDetalheMalote').removeClass('d-none');

        for ({ IDPENDENCIA } of PENDENCIAS) {
            $(`#pendenciasDetalheMalote input[id="${IDPENDENCIA}"]`).prop('checked', true);
        }
    }

}

async function enviarDadosMalote(element, idMalote) {
    let dadosSessaoUser = (await getCurrentUser())?.user;
    let idUser = dadosSessaoUser?.id;
    let IDEMPRESA = dadosSessaoUser?.IDEMPRESA;
    let IDUSERCRIACAO = idUser;
    let OBSERVACAOLOJA = '';

    if (!idUser || !IDEMPRESA) {
        return msgError('Erro ao tentar recuperar os dados da Sessão do Usuário, faça o logoff e entre novamente no sistema!');
    }

    msgQuestion('Deseja realmente enviar o Malote?')
        .then(async (respModal) => {
            try {

                if (respModal?.value !== true) return;

                if(!idMalote){

                    let respModalObs = await Swal.fire({
                        type: 'info',
                        title: 'Caso deseje adicionar uma observação, Digite e clique em "Enviar"!',
                        html: `<label for="observacaoLojaModal" >Observação:</label> </br> <textarea id="observacaoLojaModal" class="form-control text-uppercase fw-700" rows="6" onkeyup="(function(el) { el.value = formataStringComEspaço(el.value); })(this)"></textarea>`,
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                        showCloseButton: true,
                        confirmButtonText: 'Enviar',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar Envio',
                        customClass: {
                            confirmButton: 'btn btn-success',
                            cancelButton: 'btn btn-danger'
                        },
                        onOpen: ()=>{
                            $('.swal2-actions').find('button').removeClass('swal2-confirm').removeClass('swal2-cancel').attr('style', '');
                            $('#observacaoLojaModal').focus();
                        },
                        preConfirm: (resp) => {
                            OBSERVACAOLOJA = formataStringComEspaço($('#observacaoLojaModal').val()?.trim()?.toUpperCase() || '');
                        }
                    });

                    if (respModalObs?.value !== true) return;

                    let trTable = $(element).closest('tr');
                    let dataFormatada = ($(trTable).find('td:eq(1)').text()).split('/').reverse().join('-');
                    let DATAMOVIMENTOCAIXA = dataFormatada;
                    let VRDINHEIRO = Number(($(trTable).find('td:eq(3)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRCARTAO = Number(($(trTable).find('td:eq(4)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRPOS = Number(($(trTable).find('td:eq(5)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRPIX = Number(($(trTable).find('td:eq(6)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRCONVENIO = Number(($(trTable).find('td:eq(7)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRVOUCHER = Number(($(trTable).find('td:eq(8)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRFATURA = Number(($(trTable).find('td:eq(9)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRFATURAPIX = Number(($(trTable).find('td:eq(10)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRDESPESA = Number(($(trTable).find('td:eq(11)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRTOTALRECEBIDO = Number(($(trTable).find('td:eq(12)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                    let VRDISPONIVEL = Number(($(trTable).find('td:eq(13)').text())?.replace(/[^\d,]/g, '').replace(',', '.') || 0);

                    let dados = [
                        {
                            IDEMPRESA,
                            DATAMOVIMENTOCAIXA,
                            VRDINHEIRO,
                            VRCARTAO,
                            VRPOS,
                            VRPIX,
                            VRCONVENIO,
                            VRVOUCHER,
                            VRFATURA,
                            VRFATURAPIX,
                            VRDESPESA,
                            VRTOTALRECEBIDO,
                            VRDISPONIVEL,
                            OBSERVACAOLOJA,
                            IDUSERCRIACAO
                        }
                    ];
                    
                    animationLoadingStart('Atualizando Status do Malote...', 1, false);
                    
                    await ajaxPost('api/gerencia/malotes-por-loja.xsjs', dados).catch((error) => { throw error });
                    
                    await msgSuccess('Malote Enviado com Sucesso!');
                } else {
                    OBSERVACAOLOJA = formataStringComEspaço($('#observacaoLojaMalote').val()?.trim()?.toUpperCase() || '');
                    
                    let dados = [
                        {
                            IDMALOTE: idMalote,
                            STATUS: 'Reenviado',
                            OBSERVACAOLOJA,
                            IDUSERULTIMAALTERACAO: idUser
                        }
                    ];

                    animationLoadingStart('Atualizando Status do Malote...', 1, false);

                    await ajaxPut('api/gerencia/malotes-por-loja.xsjs', dados).catch((error) => { throw error });

                    await msgSuccess('Malote Reenviado com Sucesso!');
                }

                $('#detStatusMalote').modal('hide');

                pesquisarMalotesLoja();

            } catch (error) {
                console.error(error);
                msgError('Erro ao tentar atualizar o status do malote, recarregue e tente novamente!');
            }
        })

}

//? ======================================================== FIM ROTINA ENVIO DE MALOTES ======================================================== //

// ? ======================================================== INICIO ROTINA IMPRESSÃO ETIQUETAS CONSULTA NO SAP ========================================================
/*
  AUTOR: Hendryw Deyvison
  E-MAIL: hendryw.deyvison@gmail.com
  DATA: 27/11/2023
  DATA_ATUALIZAÇÃO: 21/08/2025
*/

// Inicio Variaveis Globais da Rotina De Etiquetas//
var acumuladorEtiquetas;
var acumuladorEtiquetasZPL;
var stSaveAcumulador = false;

var idEmpresasTesteEtiqueta = [4, 5, 6, 9, 12, 13, 15, 16, 17, 18, 19, 21, 26, 30, 32, 35, 36, 38, 39, 41, 44, 45, 48, 50, 56, 62, 67, 68, 69, 70, 76, 78, 83, 86, 89, 92, 95, 96, 102, 104, 111, 114, 116, 117, 118, 120, 121, 123];
// Fim Variaveis Globais da Rotina De Etiquetas//

// Inicio Funções Globais da Rotina De Etiquetas//
function selecionaTodasLinhasProdEtiqueta(element) {
  let tabela = $('#dt-basic-lista-prodEtiquetas').DataTable();
  let stChecked = $(element).prop('checked');

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

            linhaTabela.find('input[name="selecaoProdEtiqueta"]:not(:disabled)').prop('checked', stChecked).trigger('change');
          });
        }

        if (resp.dismiss == 'cancel') {
          $('input[name="selecaoProdEtiqueta"]:not(:disabled)').prop('checked', stChecked).trigger('change');
        }
      })
  } else {
    tabela.rows().every(function () {
      let linhaTabela = $(this.node())

      linhaTabela.find('input[name="selecaoProdEtiqueta"]:not(:disabled)').prop('checked', stChecked).trigger('change');
    });
  }

  if ($('input[name="selecaoProdEtiqueta"]:not(:disabled):checked')?.length > 0) {
    $('.text-Marcar-Desmarcar-Todos').text('Desmarcar Todos');

    $('#btnAcumuladorImpEtiqueta').removeClass('d-none');
    $('#btnImpEtiqueta').removeClass('d-none');
  } else {
    $('.text-Marcar-Desmarcar-Todos').text('Marcar Todos');

    $('#btnAcumuladorImpEtiqueta').addClass('d-none');

    if (!acumuladorEtiquetas?.length) {
      $('#btnImpEtiqueta').addClass('d-none');
      $('#btnDeletarAcumuladorImpEtiquetas').addClass('d-none');
    }
  }

}

function selecionaLinhaProdEtiqueta(elementoChk) {
  let stCheckLinha = $(elementoChk).prop('checked');
  let linhaElemento = $(elementoChk).closest('tr');

  if (stCheckLinha) {
    linhaElemento.addClass('selected fw-900').css("opacity", 0.8);
    linhaElemento.attr('title', 'Selecionado!');
  } else {
    linhaElemento.removeClass('selected fw-900').css("opacity", 1);
    linhaElemento.attr('title', 'Não Selecionado');
  }

  let lengthInputs = Number($('[name="selecaoProdEtiqueta"]:not(:disabled)').length);
  let lengthInputsCheckeds = Number($('[name="selecaoProdEtiqueta"]:not(:disabled):checked').length);
  let lengthAcumulador = Number(acumuladorEtiquetas?.length)

  if (!lengthInputsCheckeds) {
    $('#selecaoTodosProdEtiqueta').prop('checked', false);
    $('.text-Marcar-Desmarcar-Todos').text('Marcar Todos');

    $('#btnAcumuladorImpEtiqueta').addClass('d-none');

    if (!lengthAcumulador) {
      $('#btnImpEtiqueta').addClass('d-none');
      $('#btnDeletarAcumuladorImpEtiquetas').addClass('d-none');

    }

  } if (lengthInputsCheckeds && lengthInputsCheckeds < lengthInputs) {
    $('#btnAcumuladorImpEtiqueta').removeClass('d-none');
    $('#btnImpEtiqueta').removeClass('d-none');

  } if (lengthInputsCheckeds == lengthInputs) {
    $('#selecaoTodosProdEtiqueta').prop('checked', true);
    $('.text-Marcar-Desmarcar-Todos').text('Desmarcar Todos');

    $('#btnAcumuladorImpEtiqueta').removeClass('d-none');
    $('#btnImpEtiqueta').removeClass('d-none');
  }
}

function trocaQtdProd(element) {
  let linhaProdTabela = $(element).closest('tr');
  let valorInput = Number(element.value.replace(/\D/g, '') || 0);
  let inputQtdProd = linhaProdTabela.find('td:eq(1) input');

  valorInput = valorInput || 1;

  element.value = valorInput;

  $(inputQtdProd).attr('qtdprod', valorInput);

  !$(inputQtdProd).prop('checked') && $(inputQtdProd).click();
}

function acumuladorImpEtiquetas(stClick = true) {
  let tabela = $('#dt-basic-lista-prodEtiquetas').DataTable();

  if (!acumuladorEtiquetas?.length) {
    acumuladorEtiquetas = [];
  }

  tabela.rows().every(function () {
    let linhaTabela = $(this.node());
    let produtos = linhaTabela.find('input[name="selecaoProdEtiqueta"]:checked');

    produtos.each(function () {
      let idProduto = $(this).attr('id');
      let descricaoProd = $(this).attr('descricaoProd');
      let estiloProd = $(this).attr('estiloProd');
      let tamanhoProd = $(this).attr('tamanhoProd');
      let precoVenda = Number(this.value);
      let codBarras = $(this).attr('codBarras');
      let qtdEtiqueta = Number($(this).attr('qtdprod'));
      let localExpProd = $(this).attr('localExposicaoProd') || '';
      let listaPreco = $(this).attr('grupoprod');
      let marcaProd = $(this).attr('marcaprod');
      let stProdExistente = acumuladorEtiquetas.find(item => item.idProduto === idProduto && item.listaPreco === listaPreco);

      if (stProdExistente) {
        stProdExistente.qtdEtiqueta += parseInt(qtdEtiqueta);

      } else {

        acumuladorEtiquetas.push({
          idProduto,
          descricaoProd,
          estiloProd,
          tamanhoProd,
          precoVenda,
          codBarras,
          qtdEtiqueta,
          localExpProd,
          listaPreco,
          marcaProd,
        });
      }
    });
  });

  if (stClick) {
    stSaveAcumulador = true;
    msgSuccess('Guardado com Sucesso!');
    $('#btnDeletarAcumuladorImpEtiquetas').removeClass('d-none');
  }
}

function deletarAcumuladorImpEtiquetas() {

  Swal.fire({
    type: 'question',
    title: 'Deseja Limpar as Etiquetas Guardadas?',
    text: 'Esta ação não poderá ser desfeita!',
    showCancelButton: true,
    confirmButtonText: 'Sim, Limpar!',
    cancelButtonText: 'Não, Voltar!',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#2196F3',
    preConfirm: () => {
      acumuladorEtiquetas = '';
      stSaveAcumulador = false;

      $('#btnDeletarAcumuladorImpEtiquetas').addClass('d-none');

      $('#selecaoTodosProdEtiqueta').prop('checked', false);
      selecionaTodasLinhasProdEtiqueta($('#selecaoTodosProdEtiqueta')[0]);

      !$('[name="selecaoProdEtiqueta"]:checked')?.length && $('#btnImpEtiqueta').addClass('d-none');

    }
  })
    .then(resp => resp.value && msgSuccess('Limpo com Sucesso!'))
}
// Fim Funções Globais da Rotina De Etiquetas//

async function ListaProdutosEtiqueta() {
  try{
    animationLoadingStart();

    await $.get("cadastro_action_ProdEtiqueta.html", (resp)=> $('#js-page-content').html(resp));

    await ajaxGetAllData('api/produtos/listas-de-precos-SAP.xsjs', false).then(retornoListadePreçosGrupos);
    //await ajaxGetAllData('api/empresa.xsjs', false).then(retornoListadePreçosLojas);

    $('#idListaPreco').select2();
    
    // $('#numPedidoEtiqueta').select2();
    // funcPesquisaNoSelect('numPedidoEtiqueta', pesquisaNoSelect);
    
    $('#idListaPreco').attr('disabled', true).val(IDEmpresaLogin).trigger('change');
    
    $('.numPedidoEtiqueta').addClass('d-none');

    $('#idProdEtiqueta').on('keypress', (e) => { if (e.keyCode == 13) pesquisaProdutos() });
    $('#descProdEtiqueta').on('keypress', (e) => { if (e.keyCode == 13) pesquisaProdutos() });
    $('#codBarrasProdEtiqueta').on('keypress', (e) => { if (e.keyCode == 13) pesquisaProdutos() });

    animationLoadingStop();

  }catch(error){
    msgError();
    console.log(error);
  }
}

function retornoListadePreçosGrupos(dadosListasPreco) {
  let { data } = dadosListasPreco || [];

  $('#idListaPreco').html(`<option value="">Selecione...</option>`);

  for (let { listaPreco } of data) {
    let {
      IDEMPRESA,
      STATIVO,
      IDRESUMOLISTAPRECO,
      NOMELISTA
    } = listaPreco || '';

    if (IDEMPRESA && STATIVO == 'True') {
      $('#idListaPreco').append(`<option value="${IDEMPRESA}" title="${IDRESUMOLISTAPRECO}" >${NOMELISTA}</option>`);
    }
  }
}

function retornoListadePreçosLojas(respostaListadePreços) {
  let { data } = respostaListadePreços || [];

  $('#idListaPreco').html(`<option value="">Selecione...</option>`);

  for (let { IDEMPRESA, NOFANTASIA } of data) {
    $('#idListaPreco').append(`<option title="LOJA" value="${IDEMPRESA}">${NOFANTASIA}</option>`);
  }
}

function funcPesquisaNoSelect(idSelect, funcao) {
  $(`#${idSelect}`).on('select2:open', function () {
    $(`[aria-controls="select2-${idSelect}-results"]`).on("keydown", function (event) {
      if (event.keyCode === 13) {
        funcao(this.value, idSelect)
      }
    });
  })
}

function pesquisaNoSelect(descricao, idSelect) {
  var descFormatada = descricao.trim();

  $(`#${idSelect}`).html(`
      <option value="0">Selecione...</option>
    `);

  $(`#${idSelect}`).on('select2:open', function () {
    $(`[aria-controls="select2-${idSelect}-results"]`).val('');
  })

  if (descFormatada.length || descFormatada) {
    $(`#${idSelect}`).select2("close");
    if (idSelect == 'descProdEtiqueta') {
      ajaxGetComAnimacaoDeCarregamentoProd(`api/produto.xsjs?idEmpresa=1&descProd=${descFormatada}`, 'Carregando Dados...Aguarde!', retornoPesqProdutoDescricao, descFormatada, 'Erro ao Carregar os Produtos, Tente Novamente!');
    } else {
      ajaxGetComAnimacaoDeCarregamentoProd(`api/cadastro/lista_pedidos_paraImpressao.xsjs?idOuDesc=${descFormatada}`, 'Carregando Dados...Aguarde!', retornoPesqProdutoPorPedido, descFormatada, 'Erro ao Carregar os Produtos, Tente Novamente!');
    }

  }
}

function retornoPesqProdutoDescricao(respostaDadosProdutos, descFormatada) {
  var dadosProdutos = respostaDadosProdutos.data;

  if (dadosProdutos.length) {

    for (let i = 0; i < dadosProdutos.length; i++) {
      var idProd = dadosProdutos[i]['IDPRODUTO'];
      var descProd = dadosProdutos[i]['DSNOME'];

      $('#descProdEtiqueta').append(`
        <option value="${idProd}">${descProd}</option>
        `);
    }
  } else {
    msgError('Nenhum Produto Encontrado Para Essa Descrição!');
  }

  $('#descProdEtiqueta').on('select2:open', function () {
    $(`[aria-controls="select2-descProdEtiqueta-results"]`).val(`${descFormatada}`);
  });
  setTimeout(() => $('#descProdEtiqueta').select2("open"), 700);
}

function retornoPesqProdutoPorPedido(respostaDadosProdutos, descFormatada) {
  var dadosPedidos = respostaDadosProdutos.data;

  if (dadosPedidos.length) {

    for (let i = 0; i < dadosPedidos.length; i++) {
      var idPedido = dadosPedidos[i]['IDPEDIDO'];
      var descPedido = dadosPedidos[i]['NOFORNECEDOR'];

      $('#numPedidoEtiqueta').append(`
        <option value="${idPedido}">${idPedido} - ${descPedido}</option>
        `);
    }
  } else {
    msgError('Nenhum Pedido Encontrado Com Essa Descrição ou Número!')
  }

  $('#numPedidoEtiqueta').on('select2:open', function () {
    $(`[aria-controls="select2-numPedidoEtiqueta-results"]`).val(`${descFormatada}`)
  })
  setTimeout(() => {
    $('#numPedidoEtiqueta').select2("open");

  }, 700);

}

function pesquisaProdutos() {
  let idProduto = $('#idProdEtiqueta')?.val()?.trim() || "";
  let descProd = $('#descProdEtiqueta')?.val()?.trim() || "";
  let codBarras = $('#codBarrasProdEtiqueta')?.val()?.replace(/\D/g, '') || "";
  let idLista = $('#idListaPreco').select2('data')[0]?.title || "";

  if (idLista && idProduto || descProd || codBarras) {
    return ajaxGetAllData(`api/produtos/lista-produtos-etiqueta-SAP.xsjs?idLista=${idLista}&id=${idProduto}&descProd=${descProd}&codeBars=${codBarras}`)
      .then(retornoPesquisaProdutos)
      .catch((error) => {
        console.log(error);
        msgError('Erro ao Carregar os Produtos, Tente Novamente!')
      });
  }

  msgWarning('Digite o Identificador, Descrição ou Código de Barras do Produto!');

}

function retornoPesquisaProdutos(respostaPesquisaProdutos) {
  let { data } = respostaPesquisaProdutos || [];
  let dadosProdTable = [];
  let contador = 0;

  $('#btnAcumuladorImpEtiqueta').addClass('d-none');
  !acumuladorEtiquetas?.length ? $('#btnImpEtiqueta').addClass('d-none') : $('#btnImpEtiqueta').removeClass('d-none');


  if (data.length) {
    for (let registro of data) { 
      let idProd = registro?.IDPRODUTO;
      let dsProd = registro?.DSNOME || registro?.DSPRODUTO;
      let subgrupo = registro?.SUBGRUPO ? (registro?.SUBGRUPO).split('-') : '';
      let codBarras = registro?.NUCODBARRAS || registro?.CODBARRAS;
      let tamanho = (registro?.TAMANHO || registro?.DSTAMANHO || ((dsProd.split(' ')).pop()).replace(/[^\w\s]/gi, ''))?.toUpperCase();
      let precoVenda = Number(registro?.PRECOVENDA || registro?.VRUNITLIQDETALHEPEDIDO);
      let marcaProd = registro?.MARCA || '';
      let grupo = registro?.DSLISTAPRECO || registro?.IDSUBGRUPOEMPRESARIAL || 0;
      let localExpProd = registro?.DSLOCALEXPOSICAO || '';
      let stAtivo = registro?.STATIVO || 'True';
      let arrayGrupos = [
        'Todos',
        'Tesoura',
        'Magazine',
        'Yorus',
        'Free Center'
      ];
      let estiloProd = registro?.DSESTILO || '';
      let stCodBarrasValid = isValidEAN13(codBarras) ? 'True' : 'False';
      let stDisabled = stAtivo !== 'True' || stCodBarrasValid !== 'True' ? 'disabled' : '';

      let qtdProd = `
        <div class="d-flex justify-content-center"> 
          <input type="number" class="text-center rounded" name="qtdProdutoEtiqueta" value="1" style="width: 80%;" onchange="trocaQtdProd(this)" ${stDisabled}>
        </div>
      `;

      let labelStAtivo = `<label class="text-${stAtivo === 'True' ? 'info' : 'danger'} fw-900">${stAtivo === 'True' ? 'Ativo' : 'Inativo'}</label>`;
      
      if (registro?.STTRANSFORMADO == 'True') {
        subgrupo = subgrupo?.length > 0 ? subgrupo?.split('-') : '';
        estiloProd = estiloProd?.length > 0 ? (' - ' + estiloProd) : '';

        subgrupo = subgrupo?.length > 0 ? subgrupo?.pop()?.split(' ')?.join(' - ') : '';
        grupo = arrayGrupos[grupo];
        
        if(estiloProd?.length > 0){
          estiloProd = subgrupo?.length > 0 ? (subgrupo + ' - ' + estiloProd) : estiloProd;
        } else {
          estiloProd = subgrupo;
        }
      }
      
      let opcoes = `
        <div class="custom-control custom-checkbox"> 
          <input type="checkbox" class="custom-control-input" name="selecaoProdEtiqueta" id="${idProd}" descricaoProd="${dsProd}" codBarras="${codBarras}" tamanhoProd="${tamanho}" value="${precoVenda}" qtdProd="1" grupoProd="${grupo}" estiloProd="${estiloProd}" marcaProd="${marcaProd}" localExposicaoProd="${localExpProd}" stAtivo=${stAtivo} stCodBarrasValid=${stCodBarrasValid} onchange="selecionaLinhaProdEtiqueta(this)" ${stDisabled}><label class="custom-control-label" for="${idProd}"></label>
        </div>
      `;
      
      contador++;

      dadosProdTable.push([
        contador,
        opcoes,
        codBarras,
        dsProd,
        tamanho,
        qtdProd,
        maskValor(precoVenda),
        grupo,
        estiloProd,
        marcaProd,
        labelStAtivo
      ]);

    }

  }

  $('#resultado').html(`
    <div class="col-sm-12 col-xl-12">
      <table id="dt-basic-lista-prodEtiquetas" class="table table-bordered table-hover table-striped w-100">
        <thead class="bg-primary-600 text-center">
          <tr>
            <th>#</th>
            <th>Opções</th>
            <th>Cod. Barras</th>
            <th class="tdCenter">Produto</th>
            <th>Tamanho</th>
            <th>Quantidade</th>
            <th>Pr.Venda</th>
            <th>Grupo</th>
            <th>Estilo</th>
            <th>Marca</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody></tbody>
        <tfoot></tfoot>
      </table>
    </div>
  `);

  $('#dt-basic-lista-prodEtiquetas').DataTable({
    data: dadosProdTable,
    defaultContent: '',
    paging: true,
    pageLength: 50,
    searching: true,
    info: true,
    deferRender: false,
    responsive: true,
    autoWidth: true,
    columnDefs: [
      { targets: 1, 
        className: 'text-center ', 
        orderDataType: 'input-checkbox' 
      },
      {
        targets: [4, 10],
        className: 'text-center '
      },
      {
        targets: 5,
        className: 'text-center ',
        orderDataType: 'input-number'
      },
    ],
    columns: [
      { width: '5%' },
      { width: '5%' },
      { width: '7%' },
      { width: '35%' },
      { width: '5%' },
      { width: '5%' },
      { width: '5%' },
      { width: '10%' },
      { width: '10%' },
      { width: '8%' },
      { width: '5%' }
    ],
    language: {
      "emptyTable": "Dados não encontrados!"
    },
    initComplete: function () {
      $('#dt-basic-lista-prodEtiquetas').before(`
        <div id="chkMarcaTodos" class="mb-1 ${!data.length ? 'd-none' : ''}">
          <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" name="selecaoTodosProdEtiqueta" id="selecaoTodosProdEtiqueta" onclick="selecionaTodasLinhasProdEtiqueta(this)"><label class="custom-control-label text-Marcar-Desmarcar-Todos" for="selecaoTodosProdEtiqueta">Marcar Todos</label>
          </div>
        </div>
      `);
    },
    drawCallback: function (settings){
      var api = this.api();
      var orderCol = api.order()[0][0];

      if (orderCol === 1) {
        api.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
          cell.innerHTML = i + 1;
        });
      }

      let inputs = $('input[name="selecaoProdEtiqueta"]:disabled');

      inputs.each((i, elemento) => {
        let stAtivo = $(elemento).attr('stAtivo');
        let stCodBarrasInvalid = isValidEAN13($(elemento).attr('codBarras'));
        let linhaElemento = $(elemento).closest('tr');
        let txtStAtivo = stAtivo == 'False' ? 'Produto Inativado' : '';
        let txtCodBarraInvalid = !stCodBarrasInvalid ? 'Código de Barras Inválido' : '';

        let txtTitleTr = [txtStAtivo, txtCodBarraInvalid].filter(Boolean).join(' & ');

        linhaElemento.addClass('text-danger').css("opacity", 0.8);
        linhaElemento.attr('title', txtTitleTr);
        
      })
    }
  });

}

function listarProdsParaImprimir() {
  let listProdutos = [];
  let indice = 0;
  let tableProds = `
      <div id="qtdProdsEtiquetas" class="d-flex flex-column  ml-4"></div>
        <div class="row m-2 tableDados">
            <div class="col-sm-12 col-xl-12">
                <div id="panel-1" class="panel">
                    <div class="panel-hdr mb-3">
                        <span class="fw-500 h6 pl-2"><i> Lista de Produtos Selecionados</i></span>
                    </div>
                    <div class="m-2">
                        <table id="tableProdsImp" class="table table-bordered table-hover table-sm" style="width: 100%;">
                            <thead class="bg-primary-600">
                                <tr>
                                    <th class="text-center">#</th>
                                    <th class="text-center">Cód. Barras</th>
                                    <th class="text-center">Descrição</th>
                                    <th class="text-center">Tamanho</th>
                                    <th class="text-center">Qtd</th>
                                    <th class="text-center">Preço</th>
                                    <th class="text-center">Lista Preço</th>
                                    <th class="text-center">Estilo</th>
                                    <th class="text-center">Marca</th>
                                    <th class="text-center">Excluir</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-xl-12 pt-2">
                <br>
                <button id="btnCancelaImpEtiqueta" class="btn btn-danger mr-2" type="button">
                  <span class="fal fa-times mr-2"></span>Cancelar
                </button>

                <button id="btnConfirmaImpEtiqueta" class="btn btn-primary" type="button" title="Confirma para Impressão" >
                  <span class="fal fa-print mr-2"></span>Impressão
                </button>
            </div>
      </div>    
  `;

  if (!stSaveAcumulador) {
    acumuladorEtiquetas = '';
    acumuladorImpEtiquetas(false);
  }


  acumuladorEtiquetas.map((dadoProd, i) => {
    let descricaoProd = dadoProd.descricaoProd;
    let estiloProd = dadoProd.estiloProd;
    let tamanhoProd = dadoProd.tamanhoProd;
    let precoVenda = dadoProd.precoVenda;
    let codBarras = dadoProd.codBarras;
    let qtdEtiqueta = dadoProd.qtdEtiqueta;
    let localExpProd = dadoProd.localExposicaoProd || '';
    let listaPreco = dadoProd.listaPreco;
    let marcaProd = dadoProd.marcaProd;
    let excluirProd = acumuladorEtiquetas?.length > 1 ? `
            <button class="btn btn-danger" type="button" onclick="excluirProdLista(this)">
                <span class="fal fa-trash"></span>
            </button>
        ` : '';

    listProdutos.push([
      indice + 1,
      codBarras,
      descricaoProd,
      tamanhoProd,
      qtdEtiqueta,
      precoVenda,
      listaPreco,
      estiloProd,
      marcaProd,
      excluirProd
    ]);

    indice++;

  })

  $('#resultadoModalGenerico').html(tableProds);

  $('#tableProdsImp').dataTable({
    data: listProdutos,
    defaultContent: '',
    paging: true,
    pageLength: 50,
    searching: true,
    info: true,
    deferRender: true,
    responsive: true,
    autoWidth: false,
    columnDefs: [
      {
        targets: [0, 1, 3, 4, 5, 8],
        className: 'text-center font-weight-bold'
      },
      {
        targets: [0, 2, 6, 7, 8],
        className: 'font-weight-bold'
      }
    ],
    columns: [
      { width: '5%' },
      { width: '10%' },
      { width: '25%' },
      { width: '5%' },
      { width: '5%' },
      { width: '5%' },
      { width: '20%' },
      { width: '15%' },
      { width: '10%' },
      { width: '5%' }
    ],
    language: {
      "emptyTable": "Dados não encontrados!"
    },
    initComplete: function (settings, json) {
      $('#tableProdsImp_filter input').on('input', function () {
        if (!this.value) {

          $('#tableProdsImp tbody tr').each(function (index) {
            $(this).find('td:first').text((index + 1));
          });
        }

      });
    }
  })

  $('#btnConfirmaImpEtiqueta').on('click', () => {
    $('#modalGenerico').modal('hide');
    $('#modalGenerico .modal-dialog').removeAttr('style');

    modalImpEtiqueta();
  })

  $('#btnCancelaImpEtiqueta').on('click', () => {
    $('#modalGenerico').modal('hide');
    $('#modalGenerico .modal-dialog').removeAttr('style');
  })

  $('#tituloGenerico').text('LISTA DE PRODUTOS PARA IMPRIMIR');

  $('#modalGenerico .modal-dialog').attr('style', 'max-width: 90% !important;');

  $('#modalGenerico').modal('show');

  indicadorPageEtiquetas();

  $('#modalGenerico').on('hidden.bs.modal', function (e) {
    if (!stSaveAcumulador) {
      acumuladorEtiquetas = '';
    }
  });
}

function excluirProdLista(linha) {
  let idAcumulador;
  let linhaTabela = $(linha).closest('tr');

  $('#tableProdsImp').DataTable().row(linhaTabela).remove().draw();

  $('#tableProdsImp tbody tr').each(function (index) { $(this).find('td:first').text((index + 1)) });

  $('#tableProdsImp').DataTable().draw();

  idAcumulador = linhaTabela.find('td:first').text() - 1;
  acumuladorEtiquetas.splice(idAcumulador, 1);

  indicadorPageEtiquetas();

  if (acumuladorEtiquetas?.length == 0) {
    msgInfo('Todos os produtos foram excluídos, selecione novamente!')
      .then(() => {
        acumuladorEtiquetas = '';
        stSaveAcumulador = false;

        $('#selecaoTodosProdEtiqueta').prop('checked', false)
        selecionaTodasLinhasProdEtiqueta($('#selecaoTodosProdEtiqueta')[0])

        $('#modalGenerico').modal('hide');

      });
  }

}

function indicadorPageEtiquetas() {
  let prod = [];
  let contador = 0;
  let indice = 0
  let contadorEtiquetas = 0;
  let contadorPaginas;

  acumuladorEtiquetas.map((dadoProd, i) => {
    let qtdEtiqueta = dadoProd.qtdEtiqueta;

    contador++;
    indice++;

    for (let i = 0; i < qtdEtiqueta; i++) {
      contadorEtiquetas++;

    }

    for (let i = 0; i < prod.length; i++) {
      contador++

      if (contador == 3) {
        if ((i + 1) < prod.length) {
          contadorPaginas++;
        }
        contador = 0;
      }

    }

  })

  contadorPaginas = Math.ceil(contadorEtiquetas / 3);

  $('#qtdProdsEtiquetas').html(`
      <div>
          Qtd Produtos: <b>${indice} produto${indice > 1 ? 's' : ''}</b>
      </div>
      <div>
          Qtd Etiquetas:  <b>${contadorEtiquetas} unidade${contadorEtiquetas > 1 ? 's' : ''}</b>
      </div>
  `);

  $('.modal-title-quantidade').html(`<div>Qtd Páginas: <b>${contadorPaginas} página${contadorPaginas > 1 ? 's' : ''}</b></div> <div>Qtd Etiquetas:  <b>${contadorEtiquetas} unidade${contadorEtiquetas > 1 ? 's' : ''}</b></div>`);

}

async function modalImpEtiqueta() {
  try {
    let prod = [];
    let listProdutos = [];
    let indice = 0;
    let contador = 0;

    acumuladorEtiquetasZPL = acumuladorEtiquetas;

    for (let i = 0; i < acumuladorEtiquetas?.length; i++) {
      dadoProd = acumuladorEtiquetas[i];

      if (!isValidEAN13(`${dadoProd.codBarras}`)) {
        throw `O código de barras(${dadoProd.codBarras}) do produto(dadoProd.descricaoProd) da linha: ${i + 1} está em formato inválido, entre em contato com o departamento de cadastro de produtos`
      }

      let descricaoProd = dadoProd.descricaoProd;
      let estiloProd = dadoProd.estiloProd;
      let tamanhoProd = dadoProd.tamanhoProd;
      let precoVenda = dadoProd.precoVenda;
      let codBarras = dadoProd.codBarras;
      let qtdEtiqueta = dadoProd.qtdEtiqueta;
      let localExpProd = dadoProd.localExposicaoProd || '';
      let listaPreco = dadoProd.listaPreco;
      let marcaProd = dadoProd.marcaProd
      let paddingFirstElement = contador = 0 ? `style="padding: 15px 0 0 !important;"` : '';
      let cardEtiqueta = `
            <div class="etiqueta-card" ${paddingFirstElement}>
                <div class="dsProd">
                    <h2>${descricaoProd}</h2>
                    <p>${estiloProd}</p>
                    <p>${localExpProd}</p>
                </div>
        
                <div class="divTamanho" style="display: flex; justify-content: space-between;">
                    <div class="tamanhoDesc">
                        <label>TAM</label>
                        <div class="tamanho">
                            <h2>${tamanhoProd.toUpperCase()}</h2>
                        </div>
                    </div>
                    <div class="preco">
                        <h2 style="margin: 2px !important">${maskValor(precoVenda)}</h2>
                    </div>
                </div>
                <div id="codBarrasEtiqueta">
                    <svg
                        class="svgEtiqueta text-center"
                        jsbarcode-format="EAN13"
                        jsbarcode-value="${codBarras}"
                        jsbarcode-width= "3"
                        jsbarcode-height="80"
                        jsbarcode-margin="0" 
                        jsbarcode-fontSize="40"
                        value="${codBarras}">
                    </svg>
                </div>
            </div>
        `;

      etiqueta = `
          <div class="etiqueta-page" >
        `;

      contador++;
      indice++;

      for (let i = 0; i < qtdEtiqueta; i++) {
        prod.push(cardEtiqueta);
      }

      listProdutos.push([
        indice,
        codBarras,
        descricaoProd,
        tamanhoProd,
        qtdEtiqueta,
        precoVenda,
        listaPreco,
        estiloProd,
        marcaProd
      ])

    }

    contador = 0

    for (let i = 0; i < prod.length; i++) {
      etiqueta += prod[i];
      contador++

      if (contador == 3) {
        etiqueta += `</div>`;

        if ((i + 1) < prod.length) {
          etiqueta += `<div class="etiqueta-page" >`;
        }
        contador = 0;
      }

    }
    etiqueta += `</div>`;

    $('#resultadoImpEtiquetaProd').html('');
    $('#resultadoImpEtiquetaProd').append(etiqueta);

    JsBarcode('.svgEtiqueta').init();

    $('.svgEtiqueta').attr('width', '100%');
    $('.svgEtiqueta').attr('height', '100px')

    $('#modalImpEtiquetaProd').attr('style', 'overflow: hidden auto;');
    $("#modalImpEtiquetaProd").modal('show');

    indicadorPageEtiquetas();

    $('#modalImpEtiquetaProd').on('hidden.bs.modal', function (e) {
      if (!stSaveAcumulador) {
        acumuladorEtiquetas = '';
      }
    });
  } catch (error) {
    console.log(error);
    msgError(error);
  }
}

async function montarZplEtiquetasProdutos() {
  let startPageLabel = `
    ^XA
    ^MD10
    ^FWN
    ^PW850
    ^LL320
    ^CI28
  `;
  let endPageLabel = '^XZ';
  let dataLabelsZPLToPrint = startPageLabel;
  let contador = 0;


  for (let i = 0; i < acumuladorEtiquetasZPL?.length; i++) {
    let { descricaoProd, estiloProd, tamanhoProd, precoVenda, codBarras, qtdEtiqueta, localExpProd, listaPreco, marcaProd } = acumuladorEtiquetasZPL[i];
    tamanhoProd = tamanhoProd.toUpperCase();
    precoVenda = maskValorEmBRL(precoVenda);

    if (!isValidEAN13(`${codBarras}`)) {
      throw new Error(`O código de barras(${codBarras}) do produto(${descricaoProd}) da linha: ${i + 1} está em formato inválido, entre em contato com o departamento de cadastro de produtos`);
    }

    for (let j = 0; j < qtdEtiqueta; j++) {
      let priceLength = precoVenda.length;
      let ajustePositionPrice = priceLength > 7 ? (priceLength - 7) * 15 : 0;
      let ajusteFontSizePrice = priceLength <= 11 ? 0 : 5;
      let positionDefault = (contador * 280);
      let positionPrice = 135 + (contador * 280) - ajustePositionPrice;
      let positionTamanho = 10 + (contador * 280);
      let positionCodBars = 30 + (contador * 280);
      let fontSizePrice = 35 - ajusteFontSizePrice;
      let widthBorder = tamanhoProd.length > 3 ? '75' : '50';
      let abrirMaisUmaPagina = (j + 1) < qtdEtiqueta || (i + 1) < acumuladorEtiquetasZPL?.length;

      dataLabelsZPLToPrint += `
          ^FO${positionDefault},120^A0N,20,30^FB255,4,2,L,0^FD${descricaoProd}^FS
          ^FO${positionDefault},205^A0N,20,25^FB255,3,2,L,0^FD${estiloProd}^FS
          ^FO${positionDefault},245^A0N,20,25^FB255,3,2,L,0^FD${localExpProd}^FS
          ^FO${positionDefault},285^GB${widthBorder},50,3^FS
          ^FO${positionDefault},265^A0N,22^FDTAM^FS
          ^FO${positionPrice},300^A0,${fontSizePrice}^FD${precoVenda}^FS
          ^FO${positionTamanho},300^A0N,22^FD${tamanhoProd}^FS
          ^BY1.6,3,500
          ^FO${positionCodBars},340
          ^BEN,55,Y,N
          ^FD${codBarras}^FS
      `;

      contador++;

      if (contador == 3) {
        dataLabelsZPLToPrint += endPageLabel;

        if (abrirMaisUmaPagina) {
          dataLabelsZPLToPrint += startPageLabel;
        }

        contador = 0;
      }
    }

  }

  dataLabelsZPLToPrint += contador !== 0 ? endPageLabel : '';

  return dataLabelsZPLToPrint;
}

async function impEtiquetaProdutos() {
  try {
    if (true || idEmpresasTesteEtiqueta.includes(IDEmpresaLogin)) {
      let dataZPLToPrint = await montarZplEtiquetasProdutos();
      
      await enviarZPLParaImpressora(dataZPLToPrint).catch((error) => { throw error });
      
    } else {
      animacaoCarregamento('Aguardando o processo de impressão, favor finalizar a impressão...', 1);

      let conteudo = document.getElementById('resultadoImpEtiquetaProd').innerHTML;
      let html = `
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Impressão</title>
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"> 
                    <style>
                        body {       
                          font-family: 'Roboto', sans-serif !important;
                          font-size: 13px;
                          letter-spacing: -0.05px !important;
                          margin: 1px !important;
                          transform: rotate(0deg);
                          transform-origin: center;
                        }
        
                        @media print{
                        
                            @page {
                                    size: 11.5cm 8.5cm; 
                                    margin: -3cm;
                                    orientation: portrait;
                                }
                                
                              #codBarrasEtiqueta{
                                  width: 100% !important;
                                  height: 100px !important;
                              }
        
                            .etiqueta-page {
                                display: flex;
                                flex-wrap: wrap;
                                align-content: flex-start;
                                margin: 2px;
                                width: 100%;
                                height: 95%;
                                padding: 0;
                            }
        
                            .etiqueta-card {
                                width: 26.3% ;
                                height: 100%;
                                margin-right: 7%;
                                margin-bottom: 0;
                                padding: 29% 0 0 0 !important;
                                box-sizing: border-box;
                                display: flex;
                                flex-direction: column;
                                justify-content: left;
                                align-items: left;
                                page-break-after: always;
                            }
        
                            .dsProd{
                                width: 103% !important;
                                height: 35% !important;
                                margin: 0 0 2px 4px  !important;
                            }
        
                            .dsProd p{
                                font-size: 1.3em !important;
                                letter-spacing: -0.5px !important;
                                margin: 0 0 0 3px !important;
                            }
        
                            .divTamanho{
                                display: flex;
                                margin: 0 2px -0.9375em 2px;
                            }
                              
                              .tamanhoDesc{
                                  font-weight: bold;
                              }
                              
                            .tamanho{
                                border: 1px solid black;
                                text-align: center;
                                padding: 2px !important;
                            }
        
        
                            .preco{
                                font-size: 1.8em !important;
                                font-weight: bold;
                                letter-spacing: -2px !important;
                                display: flex !important;
                                justify-content: flex-end !important;
                                align-items: flex-end !important;
                                width: 100% !important;
                                margin-right: -12% !important;
                                margin-bottom: -6px !important;
                            }
        
                            .svgEtiqueta{ 
                                width: 110%
                            }
        
                            h2{
                                font-size: 1.31em !important;
                                margin: 0% !important;
                            }
                        }
                    </style>
                    <script>
                      window.onafterprint = function() {
                          window.close();
                      };
                      window.document.addEventListener('DOMContentLoaded', function() {
                          window.focus();
                          window.print();
                      });
                    </script>
                </head>
                <body>
          `;
      let tela_impressao = window.open('', '', '');

      tela_impressao.document.open();
      tela_impressao.document.write(html);
      tela_impressao.document.write(conteudo);
      tela_impressao.document.write('</body></html>');
      tela_impressao.document.close();

    }
    
    msgSuccess('Processo Impressão Finalizado!').then(() => {
      $('#modalImpEtiquetaProd').modal('hide');

      acumuladorEtiquetas = '';
      stSaveAcumulador = false;

      $('#btnDeletarAcumuladorImpEtiquetas').addClass('d-none');
      

      $('#selecaoTodosProdEtiqueta').prop('checked', false).trigger('change');
    })

  } catch (error) {
    console.log(error);
    msgError(error);
  }
}

//? ======================================================== FIM ROTINA IMPRESSÃO ETIQUETAS CONSULTA NO SAP ======================================================== //


//? ============================= INICIO ROTINA - IMPRESSÃO DE ETIQUETAS REMANEJAMENTO LOJA =============================?//
// Autor: Hendryw Deyvsison
// E-mail: hendryw.deyvison@gmail.com
// Data: 20/05/2025

// Inicio Variaveis Globais da Rotina De Etiquetas//
var acumuladorEtiquetasRemanejamento = '';
// Fim Variaveis Globais da Rotina De Etiquetas//

async function montarSelectEmpresaEtiqueta(dadosEmpresa, idElement, valueSelected = ''){
    let { data } = dadosEmpresa || [];

    $(`#${idElement}`).html(`<option value="">Selecione...</option>`);

    for({ IDEMPRESA, NOFANTASIA } of data){
        $(`#${idElement}`).append(`<option value="${IDEMPRESA}">${NOFANTASIA}</option>`);
    }

    $(`#${idElement}`).val(valueSelected);

    $(`#${idElement}`).select2().trigger('change').prop('disabled', valueSelected ? true : false);
}

function tipoEtiquetaVolume(optionValue) {
    if (optionValue == 'REMANEJAMENTO') {
        $('#solicitanteEtiquetaVolume').parent().removeClass('d-none');
        $('#idEmpresaDestinoEtiquetaVolume').prop('disabled', false);
    } else {
        $('#solicitanteEtiquetaVolume').parent().addClass('d-none');
        $('#idEmpresaDestinoEtiquetaVolume').val('101').trigger('change').prop('disabled', true);
    }
}

async function TelaEtiquetaVolumes() {
    try {
        animationLoadingStart('Carregando Dados...');

        await $.get("gerencia_action_tela_etiqueta_volumes.html", function (resp) {
            $('#js-page-content').html(resp);

            $('#tpEtiquetaVolume, #solicitanteEtiquetaVolume').select2();

            $('#numOREtiquetaVolume, #numOTEtiquetaVolume, #descricaoEtiquetaVolume, #categoriaEtiquetaVolume, #qtdEtiquetaVolume').on('keypress', (e) => { if (e.keyCode == 13) modalPreviaEtiquetaRemanejamento() });

        }).fail((error) => { throw error; });

        let dadosEmpresas = await ajaxGetAllData(`api/empresa.xsjs`, false).catch((error) => { throw error; });

        await montarSelectEmpresaEtiqueta(dadosEmpresas, 'idEmpresaOrigemEtiquetaVolume', IDEmpresaLogin);
        await montarSelectEmpresaEtiqueta(dadosEmpresas, 'idEmpresaDestinoEtiquetaVolume', 101);

        $(`#idEmpresaDestinoEtiquetaVolume option[value="${IDEmpresaLogin}"]`).prop('disabled', true).select2();

        setTimeout(()=>$('#tpEtiquetaVolume').select2('open'), 300);

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        animationLoadingStop();

        msgError(error);
    }
}

function modalPreviaEtiquetaRemanejamento(){
    let titulo = $('#tpEtiquetaVolume').val();
    let idEmpresaOrigem = $('#idEmpresaOrigemEtiquetaVolume').val() && ($('#idEmpresaOrigemEtiquetaVolume').select2('data')[0].text)?.toUpperCase();
    let idEmpresaDestino = $('#idEmpresaDestinoEtiquetaVolume').val() && ($('#idEmpresaDestinoEtiquetaVolume').select2('data')[0].text)?.toUpperCase();
    let numOR = $('#numOREtiquetaVolume').val();
    let numOT = $('#numOTEtiquetaVolume').val();
    let descVolume = $('#descricaoEtiquetaVolume').val()?.trim()?.toUpperCase();
    let categoriaVolume = $('#categoriaEtiquetaVolume').val()?.trim()?.toUpperCase();
    let solicitanteEtiqueta = $('#solicitanteEtiquetaVolume').val()?.trim()?.toUpperCase() || '';
    let qtdVolume = $('#qtdEtiquetaVolume').val();
    let elementos = Array.from($('#js-page-content .panel-content input, #js-page-content .panel-content select'));
    let campos = '';
    let firstElement = '';
    let htmlEtiquetas = '';

    for(let element of elementos){
        if (!$(element).val() && !$(element).parent().hasClass('d-none')){
            campos +=  $(element).parent().find('label').text() + ', ';
            firstElement = !firstElement ? $(element) : firstElement;
        }
    }

    if(campos.length > 0) {
        return msgWarning('Atenção!', `Preencha todos os campos obrigatórios!(${campos.slice(0, -2)})`)
            .then(() => setTimeout(() => $(firstElement).is('select') ? firstElement.select2('open') : firstElement.focus(), 300));
    }

    acumuladorEtiquetasRemanejamento = {
        titulo,
        idEmpresaOrigem,
        idEmpresaDestino,
        numOR,
        numOT,
        descVolume,
        categoriaVolume,
        solicitanteEtiqueta,
        qtdVolume
    };

    $("#modalImpEtiquetaRemanejamento").modal('show');

    for(let i = 0; i < qtdVolume; i++){
        htmlEtiquetas += `
            <div class="etiqueta-page-remanejamento">
                <div class="card border-dark w-100 p-0">
                <div class="text-center pt-1">
                    <h2 class="title-etiqueta d-inline bg-dark text-white pt-2 pl-3 pb-1 pr-3 fw-900">
                    ${titulo}
                    </h2>
                </div>

                <div class="d-flex flex-column justify-content-between px-2 py-2 m-1">
                    <div class="d-flex justify-content-between mb-2 fw-900">
                    <div class="title-desc-etiqueta">
                        <span><u>OR:</u></span>
                        <span><u>${numOR}</u></span>
                    </div>
                    <div class="title-desc-etiqueta">
                        <span><u>OT:</u></span>
                        <span><u>${numOT}</u></span>
                    </div>
                    </div>

                    <div class="title-desc-etiqueta mb-2 fw-900">
                        <span><u>DESCRIÇÃO:</u></span>
                        <span>${descVolume}</span>
                    </div>

                    <div class="title-desc-etiqueta mb-2 fw-900">
                        <span><u>CATEGORIA:</u></span>
                        <span>${categoriaVolume}</span>
                    </div>

                    ${solicitanteEtiqueta && `<div class="title-desc-etiqueta mb-2 fw-900">
                        <span><u>SOLICITANTE:</u></span>
                        <span>${solicitanteEtiqueta}</span>
                    </div>`}

                    <div class="title-desc-etiqueta mb-2 fw-900">
                        <span><u>REMETENTE:</u></span>
                        <span>${idEmpresaOrigem}</span>
                    </div>

                    <div class="d-flex justify-content-start mb-1 fw-900">
                        <div class="title-desc-etiqueta">
                            <span><u>DESTINATÁRIO:</u></span>
                            <span><u>${idEmpresaDestino}</u></span>
                        </div>
                    </div>
                    <div class="d-flex justify-content-end align-items-end mb-1 fw-900">
                        <div class="title-desc-etiqueta">
                            <span><u>QTD:</u></span>
                            <span><u>${i + 1}/${qtdVolume}</u></span>
                        </div>
                    </div>
                </div>
                </div>

            </div>
        `;
    }

    $("#modalImpEtiquetaRemanejamento #resultado").html(htmlEtiquetas);
}

async function imprimirEtiquetaRemanejamento() {
    try{
        let etiquetasZPL = '';
        let { titulo, idEmpresaOrigem, idEmpresaDestino, numOR, numOT, descVolume, categoriaVolume, solicitanteEtiqueta, qtdVolume } = acumuladorEtiquetasRemanejamento;

        for (let i = 0; i < qtdVolume; i++) {
            etiquetasZPL += `
                ^XA~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR2,2~SD15^JUS^LRN^CI0^XZ
                ^XA
                ^MMT
                ^FWR
                ^PW660
                ^LL980
                ^LS0
                ^CI28
                
                ^FO560,0
                ^GB150,1000,150^FS

                ^FO550,${titulo == 'REMANEJAMENTO' ? '120' : '250'}
                ^FR
                ^CF0,100
                ^FD${titulo}^FS

                ^CF0,60
                ^FO430,20^FB480,2,1,L,0^FDOR: ${numOR}^FS
                ^FO430,520^FB480,2,1,L,0^FDOT: ${numOT}^FS

                ^CF0,45
                ^FO420,20^FDDESCRICAO: ${descVolume}^FS

                ^FO360,20^FDCATEGORIA: ${categoriaVolume}^FS

                ${solicitanteEtiqueta && `^FO300,20^FDSOLICITANTE: ${solicitanteEtiqueta}^FS`}

                ^FO180,20^FB980,2,1,L,0^FDREMETENTE: ${idEmpresaOrigem}^FS

                ^FO80,20^FB980,2,1,L,0^FDDESTINATÁRIO: ${idEmpresaDestino}^FS

                ^CF0,40
                ^FO40,750^FDQTD: ${i+1}/${qtdVolume}^FS

                ^XZ
            `;
        }

        if (etiquetasZPL?.length <= 0) {
            return msgWarning('Por favor, insira um comando ZPL ou EPL');
        }

        await enviarZPLParaImpressora(etiquetasZPL).catch((error) => { throw error });

        msgSuccess('Impressão realizada com sucesso!').then(() => $("#modalImpEtiquetaRemanejamento").modal('hide'));

    } catch (error) {
        msgError(error.message);
        console.error(error);
    }
}

async function imprimirEtiquetaRemanejamento() {
    try{
        let etiquetasZPL = '';
        let { titulo, idEmpresaOrigem, idEmpresaDestino, numOR, numOT, descVolume, categoriaVolume, solicitanteEtiqueta, qtdVolume } = acumuladorEtiquetasRemanejamento;

        for (let i = 0; i < qtdVolume; i++) {
            etiquetasZPL += `
                ^XA~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR2,2~SD15^JUS^LRN^CI0^XZ
                ^XA
                ^MMT
                ^FWR
                ^PW700
                ^LL980
                ^LS0
                ^CI28
                
                ^FO565,0
                ^GB0,1000,5^FS

                ^FO550,${titulo == 'REMANEJAMENTO' ? '120' : '250'}
                ^FR
                ^CF0,75
                ^FD${titulo}^FS

                ^CF0,60
                ^FO430,20^FB480,2,1,L,0^FDOR: ${numOR}^FS
                ^FO430,520^FB480,2,1,L,0^FDOT: ${numOT}^FS

                ^CF0,45
                ^FO420,20^FDDESCRICAO: ${descVolume}^FS

                ^FO360,20^FDCATEGORIA: ${categoriaVolume}^FS

                ${solicitanteEtiqueta && `^FO300,20^FDSOLICITANTE: ${solicitanteEtiqueta}^FS`}

                ^FO180,20^FB980,2,1,L,0^FDREMETENTE: ${idEmpresaOrigem}^FS

                ^FO80,20^FB980,2,1,L,0^FDDESTINATÁRIO: ${idEmpresaDestino}^FS

                ^CF0,40
                ^FO40,750^FDQTD: ${i+1}/${qtdVolume}^FS

                ^XZ
            `;
        }

        if (etiquetasZPL?.length <= 0) {
            return msgWarning('Por favor, insira um comando ZPL ou EPL');
        }

        await enviarZPLParaImpressora(etiquetasZPL).catch((error) => { throw error });

        msgSuccess('Impressão realizada com sucesso!').then(() => $("#modalImpEtiquetaRemanejamento").modal('hide'));

    } catch (error) {
        msgError(error.message);
        console.error(error);
    }
}

//? ============================= FIM ROTINA - IMPRESSÃO DE ETIQUETAS REMANEJAMENTO LOJA =============================?//

//? ============================= INICIO ROTINA - CADASTRO DE CLIENTES =============================?//

function maskCPF_CNPJ(element){
  let value = element.value?.replace(/\D/g, '');
  
  if(value?.length > 11 ){
    mascaraMulti(element, Cnpj);
  } else {
    mascaraMulti(element, Cpf);
  }

}

async function telaCadastroClientes(){
  try {
    animationLoadingStart();

    await $.get("gerencia_action_tela_lista_clientes.html", (respHtml) => { $("#js-page-content").html(respHtml) });

    await ajaxGetAllData('api/informatica/empresa.xsjs', false)
      .then(retornoListaEmpresasSelect);
    
    $('.dataAtual').text(dataAtual);
    $('#dtinicio, #dtfim').val(dataAtualCampo);

    $('#cpfCnpj').on('keypress', function (e) {
      if (e.which == 13) {
        pesquisarClientes();
      }
    }).focus();

    $('#btnConferirTodasConsolidacoesFaturasSelecionadas').addClass('d-none');
    $('#btnConfirmarTodasConsolidacoesFaturasSelecionadas').removeClass('d-none');

    animationLoadingStop();

  } catch (error) {
    console.log(error);
    msgError();
  }
}

async function pesquisarClientes(){
  let dtInicio = $("#dtinicio").val();
  let dtFim = $("#dtfim").val();
  let cpfCnpj = $("#cpfCnpj").val()?.replace(/\D/g, '') || '';
  let cpfCnpjLength = cpfCnpj.length;

  if(cpfCnpjLength !== 11 && cpfCnpjLength !== 14){
    let titleModal = `
      O CPF/CNPJ digitado está incompleto! <br> 
      Quantidade digitada: ${cpfCnpjLength}
    `;
    let textModal = 'Digite os 11 dígitos do CPF ou os 14 dígitos do CNPJ e tente novamente!';

    return msgWarning(titleModal, textModal).then(()=>setTimeout(()=>$("#cpfCnpj").focus(), 500));
  }

  animationLoadingStart();

  try {
    await ajaxGet(`api/cliente/todos.xsjs?dtInicio=${dtInicio}&dtFim=${dtFim}&numeroCpfCnpj=${cpfCnpj}`)
        .then(retornoListarClientes)

    } catch (error) {
      console.log(error);
      await msgError();
    }
    
  animationLoadingStop();
}

function retornoListarClientes(dadosClientes) {
  let { data } = dadosClientes || [];
  let vrTotal = 0;
  let contador = 0;
  let dadosTable = [];

  if (data.length > 0) {
    for (let registro of data) {
      let {
        IDCLIENTE,
        DSNOMERAZAOSOCIAL,
        DSAPELIDONOMEFANTASIA,
        TPCLIENTE,
        NUCPFCNPJ,
        NUCEP,
        EENDERECO,
        NUENDERECO,
        EBAIRRO,
        ECIDADE,
        SGUF,
        DTCADASTRO,
        STATIVO
      } = registro || '';

      let nome = TPCLIENTE == 'JURIDICA' ? (DSAPELIDONOMEFANTASIA || DSNOMERAZAOSOCIAL) : DSNOMERAZAOSOCIAL;
      let cpfCnpj = NUCPFCNPJ?.length > 11 ? maskCNPJ(NUCPFCNPJ) : maskCPF(NUCPFCNPJ);

      let dtHoraCadastroSplit = DTCADASTRO.split(' ');
      let dtCadastroSplit = dtHoraCadastroSplit[0].split('-');
      let HoraCadastro = dtHoraCadastroSplit[1];
      let dtCadastro = `${dtCadastroSplit[2]}/${dtCadastroSplit[1]}/${dtCadastroSplit[0]} ${HoraCadastro}`;

      let stAtivo = STATIVO == 'True';

      let colorSitucao = stAtivo ? 'info' : 'danger';
      let situacao = `<span class="text-${colorSitucao} fw-900">${stAtivo ? 'Ativo' : 'Inativo'}</span>`;

      let btnEditar = `<button type="button" class="btn btn-warning btn-xs mr-1 pt-1" title="Editar dados do Cliente" oncLick="modalCadastroCliente('${NUCPFCNPJ}')"><span class="d-block fal fa-pen mr-1"></span>Editar</button>`;

      let opcoes = stAtivo ? btnEditar : '';

      let containerOpcoes = `
        <div class="d-flex justify-content-start">
          ${opcoes}
        </div>
      `;

      contador++;

      dadosTable.push([
        contador,
        IDCLIENTE,
        nome?.toUpperCase(),
        cpfCnpj,
        ECIDADE,
        SGUF,
        dtCadastro,
        situacao,
        containerOpcoes
      ]);

    }


  }

  $('#resultado').html(`
    <div id="panel-1" class="panel">
      <div class="panel-hdr">
        <h2>Lista de Clientes</h2>
      </div>
      <div class="panel-container show">
        <div class="panel-content">
          <table id="dt-lista-clientes" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
            <thead class="bg-primary-600">
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Nome</th>
                <th>CPF/CNPJ</th>
                <th>Cidade</th>
                <th>UF</th>
                <th>Data Cadastro</th>
                <th>Situação</th>
                <th>Opção</th>
              </tr>
            </thead>
            <tbody> </tbody>
          </table>
        </div>
      </div>
    </div>
  `);

  $('#dt-lista-clientes').DataTable({
    title: 'Lista de Clientes',
    data: dadosTable,
    deferRender: false,
    responsive: true,
    scrollX: true,
    columnDefs: [
      { targets: [0], className: "text-center" },
      { type: 'date-time-br', targets: 6 }
    ],
  });

  $('.totalFaturas').html(
    `<tr>
        <th colspan="6" style="text-align: center;">Total Lançamentos</th>
        <th style="text-align: right;">${mascaraValor(vrTotal.toFixed(2))}</th>
        <th colspan="4"></th>
    </tr>`
  );

}
//? ============================= FIM ROTINA - CADASTRO DE CLIENTES =============================?//

//================ ROTINA VENDAS DIGITAIS ==============================================
//================ Gabriel Figueredo 25/03/2026 ==============================================

async function listarVendasDigitais(){
    try {
      await $.get("financeiro_action_listvendasdigitalmarca.html", (respHtml) => {$("#js-page-content").html(respHtml)}); 

      $('.dataAtual').text(dataAtual);
      $('#dtconsultainicio').val(dataAtualCampo);
      $('#dtconsultafim').val(dataAtualCampo);
      $("#idgrupo").select2();
      $('.DescTituloListaVendas').html(`<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas Digitais das Marcas - <span class='fw-300'></span>`);
    } catch (error) {
      funcError(error);
    }
}

async function pesq_vendas_digitaisResumidoMarca(numPage){
    
    let datapesqinicio = $("#dtconsultainicio").val();
    let datapesqfim = $("#dtconsultafim").val();
    let idempresa = IDEmpresaLogin;

    if(!datapesqinicio || !datapesqfim || !idempresa) return funcError('Favor preencher todos os campos.');

    try {
      await $.get("gerencia_action_lista_vendas_digitais_por_loja.html", (respHtml) => {$("#resultado").html(respHtml)}); 

      const respVendas = await ajaxGet(`api/gerencia/vendas-digitais-por-loja.xsjs?pageSize=500&idEmpresa=${idempresa}&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}`)
      retornoListaVendasDigitalResumidoMarca(respVendas);
    } catch(error) {
      funcError(error);
    }
} 

function retornoListaVendasDigitalResumidoMarca(respostaListaVendasDigitalMarca) {

    const {data} = respostaListaVendasDigitalMarca;
    let retornoVendas = [];
    let somaValorVenda = 0;
    let somaQuantidade = 0;
    
    if(data.length != 0) {
      for(let registro of data) {
        let filial = registro.filial;
        let idvenda = registro.idVenda;
        let data = registro.dataVenda;
        let quantidade = registro.totalQuantidadeDigital;
        let valorVenda = registro.totalVenda;
        let nome = registro.nomeVendedor;

        somaQuantidade += quantidade;
        somaValorVenda += parseFloat(valorVenda);

        retornoVendas.push([
          filial,
          idvenda,
          data,
          quantidade,
          valorVenda,
          nome
        ]);
      }
    }

    criarDataTableVendasDigitais(retornoVendas, somaQuantidade, somaValorVenda);
}

function criarDataTableVendasDigitais(data, somaQuantidade, somaValorVenda) {
  if ($.fn.DataTable.isDataTable('#dt-basic-vendasDigitais')) $('#dt-basic-vendasDigitais').DataTable().destroy();

  $('#dt-basic-vendasDigitais').DataTable({
    data: data,
    deferRender: true,
    columnDefs: [
        { width: 25, targets: 0 },
        { width: 200, targets: 1 },
        { width: 200, targets: 2 },
        { width: 200, targets: 3 },
        { width: 100, targets: 4 }
    ],
    responsive: true,
    language: {
      emptyTable: "Nenhum registro encontrado",
      zeroRecords: "Nenhum resultado para a pesquisa"
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

  if(data.length != 0) {
    $('#totalQtd').html(somaQuantidade);
    $('#totalValor').html(mascaraValor(somaValorVenda.toFixed(2)));
  }
}
//================ FIM ROTINA VENDAS DIGITAIS ==============================================