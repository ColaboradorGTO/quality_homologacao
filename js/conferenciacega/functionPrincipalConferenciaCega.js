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

var diaFormatado = String(dia);
var mesatual = (mes + 1);
var tresmesesatras = (mes - 3);
var mesFormatado = String(mesatual);

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

let horaAtualCampo = hora + ':' + min;

let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

var dataPesquisaFormatada = dataAtual;

var valorTotalRecebido = 0;

//Variáveis totalizadoras do Mapa de pagamento

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

function formataDataPesquisa(){
    var dataEn = $("#parametro_dia").val();
    var dataQueb = dataEn.split('-');
    var AnoPesq = dataQueb[0];
    var MesPesq = dataQueb[1];
    var DiaPesq = dataQueb[2];
    dataPesquisaFormatada = DiaPesq +'/'+ MesPesq +'/'+ AnoPesq;
}

function logout() {
   	window.location.href = 'index.html';
}

function funcError(data) {
	Swal.fire({
		type: "error",
		title: data.msg,
		showConfirmButton: false,
		timer: 15000
	});
}

//////////////// Página Inicial //////////////////

$(document).ready(function() {

	$('#parametro_dia').val(dataAtualCampo);
	$('.dataAtual').text(dataAtual);
	$('.liDataAtual').text(dataAtual);
	$('.NoFuncionarioTitulo').text(NomeFuncionarioLogin);
	$('.NoEmpresaTitulo').text(NOEmpresaLogin);

});

function funcErrorListaEmpresasSelect(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoListaEmpresas',
		showConfirmButton: false,
		timer: 15000
	});
}

function retornoListaEmpresasModalSelect(respostaListaEmpresas) {

	$("#idlojaorigemmodal").select2();
	$("#idlojadestinomodal").select2();
    
	for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

		IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
		DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

		$('#idlojaorigemmodal').append(
			`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
		);
		$('#idlojadestinomodal').append(
			`<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
		);
	}
}

function retornoSelectStatusDivergencia(respostaListaStatusDivergencia) {

	$("#idstatusdivergencia").select2();
    
	for (var i = 0; i < respostaListaStatusDivergencia.data.length; i++) {

		IDStatusDivergencia = respostaListaStatusDivergencia.data[i]['IDSTATUSDIVERGENCIA'];
		DescDivergencia = respostaListaStatusDivergencia.data[i]['DESCRICAODIVERGENCIA'];

		$('#idstatusdivergencia').append(
			`<option value="` + IDStatusDivergencia + `"> ` + DescDivergencia + `</option>`
		);
	}
}

function retornoListaEmpresasSelect(respostaListaEmpresas) {
    let { data } = respostaListaEmpresas || [];

    $("#idloja, #idlojaorigem, #idlojadestino, #idlojaorigemmodal, #idlojadestinomodal, #conferiridlojaorigemmodal, #conferiridlojadestinomodal").html(`
        <option value="">Selecione...</ option>
    `);

    for ({ IDEMPRESA, NOFANTASIA } of data) {

        $("#idloja, #idlojaorigem, #idlojadestino, #idlojaorigemmodal, #idlojadestinomodal, #conferiridlojaorigemmodal, #conferiridlojadestinomodal").append(
            `<option value="${IDEMPRESA}"> ${NOFANTASIA} </option>`
        );

        $(`#idlojadestinomodal [value="${IDEmpresaLogin}"], #conferiridlojadestinomodal [value="${IDEmpresaLogin}"]`).prop("disabled", true);
        $("#idlojaorigemmodal, #conferiridlojaorigemmodal").val(IDEmpresaLogin).prop('disabled', true);

    }

    $("#idloja, #idlojaorigem, #idlojadestino, #idlojaorigemmodal, #idlojadestinomodal, #conferiridlojaorigemmodal, #conferiridlojadestinomodal").select2();
}

function retornoListaEmpresasModalSelectDeposito(respostaListaEmpresas) {

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
//////////////////// ROTINA ORDEM DE TRANSFERÊNCIA ////////////////////
// Leandro Massafera - 10/06/2022
// Dt.Atualização: 23/10/2024
// Autor Atualização: Hendryw Deyvison

async function ListaOrdemTransferencia() {
    try {
        animationLoadingStart();
        
        if (IDEmpresaLogin !== 101) {
            return msgInfo("Rotina apenas para Colaboradores da Conferência Cega!");
        }

        await $.get("conferenciacega_action_ot.html", async (respHtml) => {
            $('#js-page-content').html(respHtml);

            $("#dtconsultainicio, #dtconsultafim").val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisarot() });
        }).fail((error) => { throw error });

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(retornoListaEmpresasSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData('api/conferencia-cega/resumo-ordem-transferencia.xsjs', false)
            .then(retornoListaOT)
            .catch((error) => { throw error });
        
        $("#idlojaorigem").change(function () {

            $("#idlojadestino").find("option").each(function () {
                $(this).removeAttr("disabled");
            });
            $("#idlojadestino [value=" + $(this).val() + "]").attr("disabled", "disabled");

            $('#idlojadestino').not(this).has('option[value="' + this.value + '"]:selected').val('-2');

        })

        $("#idlojadestino").change(function () {

            $("#idlojaorigem").find("option").each(function () {
                $(this).removeAttr("disabled");
            });
            $("#idlojaorigem [value=" + $(this).val() + "]").attr("disabled", "disabled");

            $('#idlojaorigem').not(this).has('option[value="' + this.value + '"]:selected').val('-1');

        })

        animationLoadingStop();

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaOT(respostaListaOT, isFocus = false) {
    let { data } = respostaListaOT || [];
    let dadosTable = [];               

    if(data.length > 0){
        data.map((registro)=> { 

			let IdResumoOT = registro.IDRESUMOOT;
			let DataCriacao = registro.DATAEXPEDICAOFORMATADA;
			let EmpresaOrigem = registro.EMPRESAORIGEM;
			let EmpresaDestino = registro.EMPRESADESTINO;
			let NumeroNF = registro.NUMERONOTASEFAZ;
			let QtdConferido = parseInt(registro.QTDCONFERENCIA);
            let IdStatusOT = parseInt(registro.IDSTATUSOT);
            let StatusOT = registro.DESCRICAOOT;
            let btncanceldisabled = IdStatusOT !== 1 ? "disabled" : "";
            let btnencerrardisabled = IdStatusOT !== 6 ? "disabled" : "";
            let IdSAPOrigem = registro.IDSAPORIGEM;
            let IdSAPDestino = registro.IDSAPDESTINO;
            let ErrorLogSAP = registro.ERRORLOGSAP || "";
            let colorButton = ErrorLogSAP ? 'danger' : (!ErrorLogSAP && IdSAPOrigem > 0 && IdSAPDestino > 0) ? 'success': 'warning';
			let BtnOpcao = `
                <div class="demo">
                    <button type="button" class="btn btn-success btn-xs btn-icon waves-effect waves-themed" title="Editar / Visualizar" id="`+ IdResumoOT +`:`+ IdStatusOT +`" onclick="editarot(this.id)"><i class="fal fa-edit"></i></button>
                    <button `+ btncanceldisabled +` type="button" class="btn btn-danger btn-xs btn-icon waves-effect waves-themed" title="Cancelar" id="`+ IdResumoOT +`" onclick="cancelarot(this.id)"><i class="fal fa-trash"></i></button>
					<button `+ btnencerrardisabled +` type="button" class="btn btn-info btn-xs btn-icon waves-effect waves-themed" title="Encerrar OT" id="`+ IdResumoOT +`" onclick="motivoencerrarot(this.id)"><i class="fal fa-check"></i></button>
                    <button type="button" class="btn btn-${colorButton} btn-xs btn-icon waves-effect waves-themed" title="Status Nota Fiscal" id="` + IdResumoOT + `" onclick="observacaoot(this.id)"><i class="fal fa-exclamation"></i></button>
                </div>
            `;
            
            dadosTable.push([
                IdResumoOT
                ,DataCriacao
                ,EmpresaOrigem
                ,EmpresaDestino
                ,NumeroNF
                ,StatusOT
                ,BtnOpcao
            ]);
        })

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
    
    $('#dt-basic-ot').DataTable( {
        data: dadosTable,
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
    } );
}

async function abrirModalOT() {
    await $.get('conferenciacega_action_incluirot_modal.html', async (res) => {
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

// Efetuar a pesquisa das OT's conforme o filtro
async function pesquisarot(){
    try{
        let idlojaorigem = $("#idlojaorigem").val();
        let idlojadestino = $("#idlojadestino").val();
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();

        await ajaxGetAllData(`api/conferencia-cega/resumo-ordem-transferencia.xsjs?idtipofiltro=1&idEmpresaOrigem=${idlojaorigem}&idEmpresaDestino=${idlojadestino}&datapesqinicio=${datapesqinicio}&datapesqfim=${datapesqfim}`)
            .then((resp)=>retornoListaOT(resp, true))
            .catch((error) => { throw error });

    } catch (error) {
        console.log(error);
        msgError();
    }

}

async function pesqProduto(){
    try {
        let myTable = $('#tabelaprodutos').DataTable();
        let descProduto = $('#descProduto').val();
        let nIdEmpresa = $("#idlojaorigemmodal").val();
        let cont = 0;

        if (parseInt($("#idlojaorigemmodal").val()) <= 0 || parseInt($("#idlojadestinomodal").val()) <= 0) {
            return msgInfo('A Loja de Origem e Destino devem ser Preenchidas!')
        }

        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == descProduto) {
                //myTable.cell(node._DT_CellIndex.row,8).data(parseInt(myTable.cell(node._DT_CellIndex.row,8).data())+1);
                var nValorAnterior = myTable.cell(node._DT_CellIndex.row, 8).nodes().to$().find('input').val();
                myTable.cell(node._DT_CellIndex.row, 8).nodes().to$().find('input').val((parseInt(nValorAnterior) + 1).toString());
                cont++;
                $('#descProduto').val("").focus();
                $('#descProduto')
            }
        });

        if (cont === 0) {
            $('#descProduto').prop("disabled", true);

            await ajaxGetAllData(`api/conferencia-cega/produto.xsjs?idEmpresa=${nIdEmpresa}&id=${descProduto}`)
                .then(RetornoListaProduto)
                .catch((error) => { throw error });
        }

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function RetornoListaProduto(respostaListaProduto){
    let { data } = respostaListaProduto || [];
	let myTable = $('#tabelaprodutos').DataTable();

	if (data.length > 0) {
		
		let CodigoProduto = data[0].IDPRODUTO;
		let CodigoBarras = data[0].NUCODBARRAS;
		let DescProduto = data[0].DSNOME;
		let PrecoVenda = data[0].PRECOVENDA;
		let PrecoCusto = data[0].PRECOCUSTO;
		let QtdExpedicao = 0;
		let QtdRecepcao = 0;
		let QtdDiferenca = 0;
        let inputIdProd = `
            <input type="number" class="form-control" id="qtd:${CodigoProduto}" value="1"><span style="display: none;">1</span>
        `;
		let BtnOpcao = `
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoBarras}:${QtdExpedicao}:${IdResumoOT}:${CodigoProduto}" onclick="excluirProduto(this.id)"><i class="fal fa-trash"></i></button>
        `;
        let dadosTable = [
            CodigoProduto, 
            CodigoBarras, 
            DescProduto, 
            PrecoCusto, 
            PrecoVenda, 
            QtdExpedicao, 
            QtdRecepcao, 
            QtdDiferenca, 
            inputIdProd,
            BtnOpcao
        ];
		
        myTable.row.add(dadosTable).draw(false);

        $('#idlojaorigemmodal, #idlojadestinomodal').prop("disabled", true).select2();
        $('#descProduto').val("").focus().prop("disabled", false);
	}
}

async function excluirProduto(id){
    idchave = id.split(":");
    id = idchave[0];
    pQtdExpedicao = parseInt(idchave[1]);
    nIdResumoOT = parseInt(idchave[2]);
	pCodProduto = idchave[3];

	let myTable = $('#tabelaprodutos').DataTable();
    let dados = [{
        "IDPRODUTO": pCodProduto
        ,"IDSTATUSOT": parseInt(5)
        ,"IDRESUMOOT": parseInt(nIdResumoOT)
    }];

	myTable.column(1).nodes().each(async function(node,index,dt){
        try{
            if(myTable.cell(node).data() == id){
                if(pQtdExpedicao === 0){
                    await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                        .then(myTable.row(node._DT_CellIndex.row).remove().draw(false))
                        .catch((error)=>{ throw error });
                } else {
                    myTable.cell(node._DT_CellIndex.row,8).data(0);
                }
            }

        } catch (error) {
            console.log(error);
            msgError('Erro ao tentar excluir!');
        }
    });
    $('#descProduto').val("").focus();

}

async function salvarot() {
    try {
        animationLoadingStart('Salvando OT...', 1, false);

        let dadosdetalheot = [];
        let myTable = $('#tabelaprodutos').DataTable();

        $("#ot").modal('hide');

        for (let i = 0; i < myTable.rows().count(); i++) {
            let cIdProduto = myTable.rows().cell(i, 0).data();
            let nQtdAjuste = parseInt(myTable.rows().cell(i, 8).nodes().to$().find('input').val() || 0);
            let nVlrVenda = parseFloat(myTable.rows().cell(i, 4).data());
            let nVlrCusto = parseFloat(myTable.rows().cell(i, 3).data());
            let cStFalta = nQtdAjuste > 0 ? "True" : "False";
            let cStSobra = nQtdAjuste < 0 ? "True" : "False";

            dadosdetalheot[i] = {
                "IDPRODUTO": cIdProduto
                , "QTDEXPEDICAO": 0
                , "QTDRECEPCAO": 0
                , "QTDDIFERENCA": 0
                , "QTDAJUSTE": nQtdAjuste
                , "VLRUNITVENDA": nVlrVenda
                , "VLRUNITCUSTO": nVlrCusto
                , "STCONFERIDO": 'True'
                , "IDUSRAJUSTE": IDFuncionarioLogin
                , "STATIVO": 'True'
                , "STFALTA": cStFalta
                , "STSOBRA": cStSobra
            };
        }

        let dados = [{
            dadosdetalheot
            , "IDSTATUSOT": parseInt(7)
            , "IDRESUMOOT": parseInt(nIdResumoOT)
        }];

        await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
            .then(async () => {
                await msgSuccess("Ajustado com Sucesso!");
                ListaOrdemTransferencia();
            })
            .catch((error) => { throw error });

    } catch (error) {
        console.log(error);
        msgError('Erro ao tentar salvar a OT!');
    }
}

function cancelarot(id){
	let dados = [{
		"IDSTATUSOT": parseInt(2)
        ,"IDRESUMOOT": parseInt(id)
		,"IDUSRCANCELAMENTO": parseInt(IDFuncionarioLogin)
    }];

	Swal.fire({
		title: 'Deseja realmente CANCELAR essa OT?',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Sim, quero Cancelar!',
		cancelButtonText: 'Não'
	}).then(async (result) => {
        try{
            if (result.value == true) {
                animationLoadingStart('Cancelando a OT...', 1, false);

                await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                    .then(async ()=>{
                        await msgSuccess('OT Cancelada com sucesso!');
                        ListaOrdemTransferencia();
                    })
                    .catch((error)=>{ throw error });
            }
        } catch (error) {
            console.log(error);
            msgError('Erro ao tentar cancelar a OT!');
        }
	  })
}

// Função para preencher o Motivo de Encerramento a OT
async function motivoencerrarot(id){
    try{

        await $.get('conferenciacega_action_motivoencerrarot.html', async (res) => {

            $('#resultadomotivoencerrarOT').html(res);
        }).fail((error)=>{ throw error });

        await ajaxGetAllData('api/conferencia-cega/status-divergencia.xsjs')
            .then(retornoSelectStatusDivergencia)
            .catch((error)=>{ throw error });

        $("#idstatusdivergencia").select2();

        $("#footermotivoencerrarOT").html(`
            <button type="button" class="btn btn-success" id="${id}" onclick="encerrarot(this.id)">Encerrar</button>
        	<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
        `);

        $("#motivoencerrarOT").modal('show');
    } catch (error) {
        console.log(error);
        msgError();
    }
}

// Função para Encerrar a OT
async function encerrarot(id) {
    try {
        animationLoadingStart('Encerrando a OT...', 1, false);

        let idstatusdivergencia = parseInt($("#idstatusdivergencia").val());
        let observacao = $("#observacao").val();
        let msg = '';

        if (!idstatusdivergencia || !observacao) {
            msg = !idstatusdivergencia ? 'Necessário preencher o Motivo!' : 'Necessário preencher a Observação!';
        }

        if (msg?.length > 0) {
            return msgWarning('Atenção', msg);
        }

        let dados = [{
            "IDSTDIVERGENCIA": idstatusdivergencia
            , "OBSDIVERGENCIA": observacao
            , "IDUSRAJUSTE": IDFuncionarioLogin
            , "IDSTATUSOT": parseInt(8)
            , "IDRESUMOOT": parseInt(id)
        }];

        await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
            .then(async () => {
                await msgSuccess('OT Encerrada com sucesso!');
                ListaOrdemTransferencia();
            })
            .catch((error) => { throw error });

        $('#motivoencerrarOT').modal('hide');

    } catch (error) {
        console.log(error);
        msgError('Erro ao tentar encerrar a OT!');
    }
}

async function incluirot(){
    try{
        nIdResumoOT = 0;
        nBtnSalvar = 1;

        await $.get('gerencial_action_incluirot_modal.html', async (res) => {
            $('#resultadoot').html(res);
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

		$("#idlojaorigemmodal").change(function(){

			$("#idlojadestinomodal").find("option").each(function(){
				$(this).removeAttr("disabled");
			});
			$("#idlojadestinomodal [value=" + $(this).val() + "]").attr("disabled","disabled");
		
			$('#idlojadestinomodal').not(this).has('option[value="'+  this.value + '"]:selected').val('-2');

		})

		$("#idlojadestinomodal").change(function(){

			$("#idlojaorigemmodal").find("option").each(function(){
				$(this).removeAttr("disabled");
			});
			$("#idlojaorigemmodal [value=" + $(this).val() + "]").attr("disabled","disabled");
		
			$('#idlojaorigemmodal').not(this).has('option[value="'+  this.value + '"]:selected').val('-1');

		})

		$("#idlojaorigemmodal").select2({
			dropdownParent: $("#ot")
		});
		$("#idlojadestinomodal").select2({
			dropdownParent: $("#ot")
		});

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(retornoListaEmpresasModalSelect)
            .catch((error) => { throw error; });

        $("#ot").modal('show');
    } catch(error){
        console.error(error);
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

async function editarot(id) {
    try {
        animationLoadingStart();

        idchave = id.split(":");
        nIdResumoOT = parseInt(idchave[0]);
        nIdStatusOT = parseInt(idchave[1]);

        id = nIdResumoOT;

        await abrirModalOT();

        await ajaxGetAllData(`api/conferencia-cega/detalhe-ordem-transferencia.xsjs?id=${id}&idtipofiltro=1`, false)
            .then(retornoListaDetalheOT)
            .catch((error) => { throw error });

        animationLoadingStop();
    } catch (error) {
        console.error(error);
        msgError();
    }
}

function retornoListaDetalheOT(respostaListaDetalheOT) {
    let { data } = respostaListaDetalheOT || [];
    let dadosTable = [];
    let IdEmpresaOrigem = '';
    let IdEmpresaDestino = ''

    if (data.length > 0) {

        for (registro of data) {
            let IdResumoOT = registro.IDRESUMOOT;
            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = registro.VLRUNITVENDA;
            let PrecoCusto = registro.VLRUNITCUSTO;
            let QtdExpedicao = parseInt(registro.QTDEXPEDICAO);
            let QtdRecepcao = parseInt(registro.QTDRECEPCAO);
            let QtdDiferenca = parseInt(registro.QTDDIFERENCA);
            let QtdAjuste = parseInt(registro.QTDAJUSTE);
            let nQtdConferido = parseInt(registro.QTDCONFERENCIA);
            let BtnOpcao = " ";

            IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
            IdEmpresaDestino = registro.IDEMPRESADESTINO;

            QtdAjuste = `
                <input type="number" class="form-control" id="qtd:${CodigoProduto}" value="${QtdAjuste}"><span style="display: none;">${QtdAjuste}</span>
            `;

            $("#salvarot, #descProduto").prop("disabled", true);

            //<button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="`+ CodigoBarras +`:`+ QtdExpedicao +`:`+ IdResumoOT +`:`+ CodigoProduto +`" onclick="diminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
            if (nIdStatusOT === 6) {
                BtnOpcao = `
                    <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoBarras}:${QtdExpedicao}:${IdResumoOT}:${CodigoProduto}" onclick="excluirProduto(this.id)"><i class="fal fa-trash"></i></button>
                `;

                $("#salvarot, #descProduto").prop("disabled", false);
            }

            dadosTable.push([
                CodigoProduto
                , CodigoBarras
                , DescProduto
                , PrecoCusto
                , PrecoVenda
                , QtdExpedicao
                , QtdRecepcao
                , QtdDiferenca
                , QtdAjuste
                , BtnOpcao
            ]);
        }
    }

    $("#idlojaorigemmodal").val(IdEmpresaOrigem).trigger('change').prop("disabled", true);
    $("#idlojadestinomodal").val(IdEmpresaDestino).trigger('change').prop("disabled", true);

    $('#tabelaprodutos').DataTable({
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "15%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "10%", "targets": 5 },
            { "width": "10%", "targets": 6 },
            { "width": "10%", "targets": 7 },
            { "width": "15%", "targets": 8 },
            { "width": "10%", "targets": 9 }
        ],
        deferRender: true,
        scrollX: true,
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
//////////////////// FIM ROTINA ORDEM DE TRANSFERÊNCIA ///////////////

//////////////////// ROTINA STATUS DE DIVERGÊNCIA ////////////////////
// Leandro Massafera - 29/08/2022
// Função inicial para listar/cadastrar as Divergências na finalização das OT
async function StatusDivergencia(){
    try{
        animationLoadingStart();
        
        if(IDEmpresaLogin === 101){
            return msgInfo("Rotina apenas para Colaboradores da Conferência Cega!");
        }

        await $.get("conferenciacega_action_statusdivergencia.html", async (respHtml)=>{
            $("#js-page-content").html(respHtml);
        });

        await ajaxGetAllData('api/conferencia-cega/status-divergencia.xsjs',)
            .then(retornoListaSD)
            .catch((error)=>{ throw error });

        animationLoadingStop();

    } catch (error){
        console.log(error);
        msgError();
    }
}

// Função que lista as divergências cadastradas
function retornoListaSD(respostaListaSD, isFocus = false) {
    let { data } = respostaListaSD || [];
    let dadosTable = [];

    if(data.length > 0){
        for (registro of data) { 
			let IdStatusDivergencia	= registro.IDSTATUSDIVERGENCIA;
			let Descricao = registro.DESCRICAODIVERGENCIA;
			let DataCriacao = registro.DATACRIACAOFORMATADA;
            let Status = registro.STATIVO;
            let descStatus = Status === 'True' ? "Ativo" : "Inativo";
			let BtnOpcao = `
                <div class="demo">
                    <button type="button" class="btn btn-success btn-xs btn-icon waves-effect waves-themed" title="Alterar" id="${IdStatusDivergencia}:${Descricao}:${Status}" onclick="modalSD(this.id)"><i class="fal fa-edit"></i></button>
                </div>
            `;
            
			dadosTable.push( [
                IdStatusDivergencia
                ,Descricao
                ,DataCriacao
                ,descStatus
                ,BtnOpcao
            ]);
        }
        
    }

    $('#resultadomodalsd').html(
        `<table id="dt-basic-sd" class="table table-bordered table-hover table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th>IdStatus</th>
                    <th>Descrição</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Opções</th>
                </tr>
            </thead>
            <tbody id="resultadomodalsd">
            </tbody>
        </table>`
    );
    
    $('#dt-basic-sd').DataTable( {
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "25%", "targets": 2 },
            { "width": "25%", "targets": 3 },
            { "width": "10%", "targets": 4 }
        ],
        order: [
            [0, 'desc'],
        ],
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
    } );
        
}

// Função para apresentar a tela de Cadastrar/Alterar as Divergências
async function modalSD(id){
    try{
        animationLoadingStart();

	    var desc, stativo;

        if(id){
            idchave = id.split(":");
            id = parseInt(idchave[0]);
            desc = idchave[1];
            stativo = idchave[2];
        }

        await $.get('conferenciacega_action_statusdivergencia_modal.html', async (res) => {
            $('#resultadomodalSD').html(res);
            $("#cadSD").modal('show');
        }).fail((error)=>{ throw error });

        $('#id').val(id);
        $('#descSD').val(desc);
        $('#stativoSD').val(stativo);

        if (id > 0) {
            $("#footerSD").html(`<button type="button" class="btn btn-success" onclick="alterarSD()">Atualizar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
        } else {
            $("#footerSD").html(`<button type="button" class="btn btn-success" onclick="inserirSD()">Cadastrar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
        }

        animationLoadingStop();
    } catch(error){
        console.log(error);
        msgError();
    }
}

// Função para Inserir as Divergências
async function inserirSD(){
    try{
        animationLoadingStart('Enviando dados...', 1, false);

        let descricaoSD = $("#descSD").val();
        let stativoSD = $("#stativoSD").val();

        let dados = [{
            "DESCRICAODIVERGENCIA": descricaoSD.toUpperCase()
            ,"IDUSRCRIACAO": IDFuncionarioLogin
            ,"STATIVO": stativoSD
        }];

        await ajaxPost("api/conferencia-cega/status-divergencia.xsjs", dados)
            .then(StatusDivergencia)
            .catch((error)=>{ throw error });
        
        $('#cadSD').modal('hide');
        
        animationLoadingStop();
        
    } catch (error) {
        console.log(error);
        msgError();
    }
}

// Função para Alterar as Divergências
function alterarSD(){
    try{
        animationLoadingStart('Enviando dados...', 1, false);

        let idSD = $("#id").val();
        let descricaoSD = $("#descSD").val();
        let stativoSD = $("#stativoSD").val();

        let dados = [{
            "IDSTATUSDIVERGENCIA": parseInt(idSD)
            ,"DESCRICAODIVERGENCIA": descricaoSD.toUpperCase()
            ,"STATIVO": stativoSD
        }];

        ajaxPut("api/conferencia-cega/status-divergencia.xsjs", dados)
            .then(MsgSucesso(StatusDivergencia))
            .catch((error) => { throw error });
    
        $('#cadSD').modal('hide');
        animationLoadingStop();

    } catch (error) {
        console.log(error);
        msgError();
    }
}
//////////////////// FIM ROTINA STATUS DE DIVERGÊNCIA ////////////////

//////////////////////////// MENSAGEM DE SUCESSO ///////////////////////////////////////////
function MsgSucesso(funcao){
    Swal.fire({
        type: "success",
        title: "Atualizado com Sucesso!",
        showConfirmButton: false,
        timer: 2500
    }).then(function(isConfirm) {
        if (isConfirm) {
            funcao.call();
        } 
      });
}
//////////////////////////// FIM MENSAGEM DE SUCESSO ///////////////////////////////////////

//? =============================== INICIO ROTINA ORDEM DE TRANSFERENCIA DEPOSITO =============================== //

// Leandro Massafera = 25/03/2023
// Dt.Atualização: 23/10/2024
// Autor Atualização: Hendryw Deyvison

// Função Inicial para listagem das Ordens de Transferência
async function ListaOrdemTransferenciaDeposito(){
    try{
        animationLoadingStart();
        
        if(IDEmpresaLogin !== 101){
            return msgInfo("Rotina apenas para Colaboradores do Depósito!");
        }

        await $.get("conferenciacega_action_ot_deposito.html", async (respHtml) => {
            $("#js-page-content").html(respHtml);
            $("#dtconsultainicio, #dtconsultafim").val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisarotdeposito() });
        }).fail((error)=>{ throw error });

        await ajaxGetAllData('api/empresa.xsjs')
            .then(retornoListaEmpresasSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData(`api/conferencia-cega/resumo-ordem-transferencia.xsjs?idtipofiltro=2&idEmpresaOrigem=${IDEmpresaLogin}`, false)
            .then(retornoListaOTDeposito)
            .catch((error) => { throw error });

        $('#idlojaorigem').val(IDEmpresaLogin).trigger('change').prop('disabled', true);
    } catch(error){
        console.log(error);
        msgError();
    }
}

// Retorno das buscas das Ordem de Transferência
async function retornoListaOTDeposito(respostaListaOT, isFocus = false) {
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
            let ChaveSEFAZ = registro?.CHAVESEFAZ || "";
            let stBtnImprimirNfeDisabled = ChaveSEFAZ? "" : "disabled";
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
                    <button type="button" class="btn btn-success btn-xs btn-icon waves-effect waves-themed" title="Editar / Visualizar" id="`+ IdResumoOT + `:` + 0 + `:` + IdStatusOT + `" onclick="editarotdeposito(this.id)"><i class="fal fa-edit"></i></button>
                    <button `+ stBtnCancelDisabled + ` type="button" class="btn btn-danger btn-xs btn-icon waves-effect waves-themed" title="Cancelar" id="` + IdResumoOT + `" onclick="cancelarot(this.id)"><i class="fal fa-trash"></i></button>
                    <button `+ stBtnNfeDisabled + ` type="button" class="btn btn-warning btn-xs btn-icon waves-effect waves-themed" title="Finalizar OT" id="` + IdResumoOT + `" onclick="salvarvolumeot(this.id)"><i class="fal fa-list"></i></button>
                    <button type="button" class="btn btn-secondary btn-xs btn-icon waves-effect waves-themed" title="Imprimir Etiqueta" id="`+ IdResumoOT + `" onclick="imprimiretiqueta(this.id)"><i class="fal fa-print"></i></button>
                `;
            } else {
                BtnOpcao += `
                    <button `+ stBtnEditarDisabled + ` type="button" class="btn btn-primary btn-xs btn-icon waves-effect waves-themed" title="Conferir OT" id="` + IdResumoOT + `:` + 1 + `:` + NumeroNF + `:` + StatusOT + `:` + DataCriacao + `" onclick="conferirotdeposito(this.id)"><i class="fal fa-edit"></i></button>
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

    $('#resultadomodalotdeposito').html(
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
            <tbody id="resultadomodalotdeposito">
            </tbody>
        </table>`
    );
    
    $('#dt-basic-ot').DataTable( {
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
    } );
        
}

async function pesquisarotdeposito(){
    try {
        animationLoadingStart();
        
        let idlojadestino = $("#idlojadestino").val();
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();

        await ajaxGetAllData(`api/conferencia-cega/resumo-ordem-transferencia.xsjs?&idtipofiltro2&idEmpresaOrigem=${IDEmpresaLogin}&idEmpresaDestino=${idlojadestino}&datapesqinicio=${datapesqinicio}&datapesqfim=${datapesqfim}`)
            .then(resp => retornoListaOTDeposito(resp, true))
            .catch((error) => {
                throw error;
            });

        animationLoadingStop();
    } catch (error) {
        console.error(error);
        msgError();
    }
}

async function abrirModalOTDeposito(){
    await $.get('conferenciacega_action_incluirot_modal_deposito.html', async (res) => {
        $('#resultadootdeposito').html(res);

        $("#otdeposito").modal('show');
    }).fail((error) => { throw error });

    $('#otdeposito').on({
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

            $('#descProdutoDeposito').focus();

            $("#idlojaorigemmodal, #idlojadestinomodal").select2({
                dropdownParent: $("#otdeposito")
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

    await ajaxGetAllData('api/empresa.xsjs', false)
        .then(retornoListaEmpresasModalSelectDeposito)
        .catch((error) => { throw error });
}

// Editar a Ordem de Transferência que está na Origem
async function editarotdeposito(id){
    try{
        animationLoadingStart();

        idchave = id.split(":") || [];
        nIdResumoOT = idchave[0] || '';
        nConferir = parseInt(idchave[1]) || '';
        nIdStatusOT = parseInt(idchave[2]) || '';

        nBtnSalvar = 2; // Alterando o botão salvar para update
        id = nIdResumoOT;

        await abrirModalOTDeposito();

        if (nIdStatusOT != 1) {
            $("#descProdutoDeposito, #salvarotdeposito").prop("disabled", true);
        }

        await ajaxGetAllData(`api/conferencia-cega/detalhe-ordem-transferencia.xsjs?id=${id}`)
            .then(retornoListaDetalheOTDeposito)
            .catch((error)=>{ throw error });

        $('#descProdutoDeposito').focus();

        animationLoadingStop();
    } catch(error){
        console.error(error);
        msgError();
    }
}

function retornoListaDetalheOTDeposito(respostaListaDetalheOT){
    let { data } = respostaListaDetalheOT || [];
    let dadosTable = [];
    let IdEmpresaOrigem;
    let IdEmpresaDestino;

    if(data.length > 0){

		for (registro of data) { 
			let IdResumoOT = registro.IDRESUMOOT;
			let CodigoProduto = registro.IDPRODUTO;
			let CodigoBarras = registro.NUCODBARRAS;
			let DescProduto = registro.DSNOME;
			let PrecoVenda = registro.VLRUNITVENDA;
			let PrecoCusto = registro.VLRUNITCUSTO;
            let QtdProduto = registro.QTDEXPEDICAO;
            let BtnOpcao = "";
			
            IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
			IdEmpresaDestino = registro.IDEMPRESADESTINO;

			if(nIdStatusOT === 1){
				BtnOpcao = `
                    <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${CodigoBarras}" onclick="diminuirProdutoDeposito(this.id)"><i class="fal fa-minus"></i></button>
					<button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoBarras}" onclick="excluirProdutoDeposito(this.id)"><i class="fal fa-trash"></i></button>
                `;
			} else {
				nBtnSalvar = 3; // Alterando o botão salvar, já que o registro está cancelado
			}
            
            dadosTable.push([
                CodigoProduto
                ,CodigoBarras
                ,DescProduto
                ,PrecoCusto
                ,PrecoVenda
                ,QtdProduto
                ,BtnOpcao
            ]);
        }

    }

    $("#idlojaorigemmodal").val(IdEmpresaOrigem).trigger('change').prop("disabled", true);
    $("#idlojadestinomodal").val(IdEmpresaDestino).trigger('change').prop("disabled", true);

    $('#tabelaprodutosdeposito').DataTable( {
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "12%", "targets": 5 },
            { "width": "10%", "targets": 6 }
        ],
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

async function pesqProdutoDeposito(){
    try {
        let myTable = $('#tabelaprodutosdeposito').DataTable();
        let descProduto = $('#descProdutoDeposito').val();
        let nIdEmpresa = $("#idlojaorigemmodal").val();
        let cont = 0;

        if (parseInt($("#idlojaorigemmodal").val()) <= 0 || parseInt($("#idlojadestinomodal").val()) <= 0) {
            return msgWarning('Atenção!', 'A Loja de Origem e Destino devem ser Preenchidas!');
        }

        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == descProduto) {
                myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) + 1);
                cont++;
                $('#descProdutoDeposito').val("").focus();
            }
        });

        if (cont === 0) {
            $('#descProdutoDeposito').prop("disabled", true);
            await ajaxGetAllData(`api/conferencia-cega/produto.xsjs?idEmpresa=${nIdEmpresa}&id=${descProduto}`)
                .then(RetornoListaProdutoDeposito)
                .catch((error) => { throw error });
        }

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function RetornoListaProdutoDeposito(respostaListaProduto){
    let { data } = respostaListaProduto || [];
	let myTable = $('#tabelaprodutosdeposito').DataTable();

	if (data.length > 0) {
		
		let CodigoProduto = data[0].IDPRODUTO;
		let CodigoBarras = data[0].NUCODBARRAS;
		let DescProduto = data[0].DSNOME;
		let PrecoVenda = data[0].PRECOVENDA;
		let PrecoCusto = data[0].PRECOCUSTO;
		let BtnOpcao = `
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="`+ CodigoBarras +`" onclick="diminuirProdutoDeposito(this.id)"><i class="fal fa-minus"></i></button>
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="`+ CodigoBarras +`" onclick="excluirProdutoDeposito(this.id)"><i class="fal fa-trash"></i></button>
        `;
        let dadosRowTable = [
            CodigoProduto, 
            CodigoBarras, 
            DescProduto, 
            PrecoCusto, 
            PrecoVenda, 
            1, 
            BtnOpcao
        ];
		
		myTable.row.add(dadosRowTable).draw(false);
    }

    $('#idlojaorigemmodal, #idlojadestinomodal').prop("disabled", true);
    $('#descProdutoDeposito').val("").focus().prop("disabled", false);
}

function diminuirProdutoDeposito(id){
	let myTable = $('#tabelaprodutosdeposito').DataTable();

	myTable.column(1).nodes().each(function(node,index,dt){
        if(myTable.cell(node).data() == id){
        	if(myTable.cell(node._DT_CellIndex.row,5).data() > 1){
				myTable.cell(node._DT_CellIndex.row,5).data(parseInt(myTable.cell(node._DT_CellIndex.row,5).data())-1);
			} else {
                msgQuestion('Essa ação irá excluir o produto da O.T, Deseja prosseguir?')
                .then((resp)=>{
                    if(resp.value){
                        myTable.row(node._DT_CellIndex.row).remove().draw(false);
                    }
                });
			}
        }
    });

    $('#descProdutoDeposito').val("").focus();

}

function excluirProdutoDeposito(id){
	let myTable = $('#tabelaprodutosdeposito').DataTable();

	myTable.column(1).nodes().each(function(node,index,dt){
        if(myTable.cell(node).data() == id){
            msgQuestion('Essa ação irá excluir o produto da O.T, Deseja prosseguir?')
                .then((resp) => {
                    if (resp.value) {
                        myTable.row(node._DT_CellIndex.row).remove().draw(false);
                    }
                });
        }
    });

    $('#descProdutoDeposito').val("").focus();
}

function abrirPesqProdutoDeposito(){
	nIdLojaOrigem = parseInt($("#idlojaorigemmodal").val());

	$("#abrirpesqprodutodeposito").modal('show');
}

function pesquisarProdutoDeposito() {
    try {
        let nIdLojaOrigem = parseInt($("#idlojaorigemmodal").val());
        let descProd = $("#pesqProduto").val()

        ajaxGetAllData(`api/conferencia-cega/produto.xsjs?idEmpresa='${nIdLojaOrigem}&descProduto=${descProd}`)
            .then(retornoPesqListaProdutoDeposito)
            .catch((error) => { throw error });
    } catch (error) {
        console.error(error);
        msgError();
    }
}

function retornoPesqListaProdutoDeposito(respostaPesqListaProduto) {
    let { data } = respostaPesqListaProduto || [];
    let dadosTable = [];              

    if(data.length > 0){
        for (registro of data) { 
			let CodigoProduto = registro.IDPRODUTO;
			let CodigoBarras = registro.NUCODBARRAS;
			let DescProduto = registro.DSNOME;
			let PrecoVenda = registro.PRECOVENDA;
			let PrecoCusto = registro.PRECOCUSTO;
            
            dadosTable.push( [
                CodigoProduto
                ,CodigoBarras
                ,DescProduto
                ,PrecoCusto
                ,PrecoVenda
                ,`<input type="number" class="form-control" id="qtd:${CodigoBarras}" value="0"><span style="display: none;">0</span>`
                ,`<button type="button" class="btn btn-outline-success btn-xs btn-icon waves-effect waves-themed" title="Confirmar" id="${CodigoBarras}" onclick="confirmarProdutoDeposito(this.id)"><i class="fal fa-check"></i></button>`
            ]);
        }
        
    }

    $('#resultadodeposito').html(
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

    $('#dt-basic-produto').DataTable( {
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "12%", "targets": 5},
            { "width": "10%", "targets": 6 }
        ],

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

function confirmarProdutoDeposito(id){
    let myTable = $('#tabelaprodutosdeposito').DataTable();
	let tabelaresultado = $('#dt-basic-produto').DataTable();
    let cCodProduto = tabelaresultado.rows().data()[0][0] || "";
    let cDescProduto = tabelaresultado.rows().data()[0][2] || "";
    let nPrecoCusto = tabelaresultado.rows().data()[0][3] || 0;
    let nPrecoVenda = tabelaresultado.rows().data()[0][4] || 0;
    let nQtd = parseInt(document.getElementById('qtd:' + id).value || 0);
	let cont = 0;
    let BtnOpcao = `
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${id}" onclick="diminuirProdutoDeposito(this.id)"><i class="fal fa-minus"></i></button>
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${id}" onclick="excluirProdutoDeposito(this.id)"><i class="fal fa-trash"></i></button>
    `;
    let dadosRowTable = [
        cCodProduto, 
        id, 
        cDescProduto, 
        nPrecoCusto, 
        nPrecoVenda, 
        nQtd, 
        BtnOpcao
    ];

	if(nQtd <= 0){
		return msgWarning('Atenção!', 'Favor preencher a Quantidade do Produto com um valor Maior que Zero ( 0 )!');
	}

	$("#abrirpesqprodutodeposito").modal('hide');

	if(myTable.rows().count() > 0){
		myTable.column(1).nodes().each(function(node,index,dt){
			if(myTable.cell(node).data() == id){
				myTable.cell(node._DT_CellIndex.row,5).data(parseInt(myTable.cell(node._DT_CellIndex.row,5).data()) + nQtd);
				cont++;
			}
		});
		if(cont === 0){
            myTable.row.add(dadosRowTable).draw(false);
		}
	} else {
        myTable.row.add(dadosRowTable).draw(false);
	}

	tabelaresultado.destroy();
    $('#idlojaorigemmodal, #idlojadestinomodal').prop("disabled", true);
	$('#dt-basic-produto').empty();
	$('#pesqProdutoDeposito').val("");
    $('#descProdutoDeposito').val("").focus();
}

// Salvar a Ordem de Transferência
async function salvarotdeposito() {
    try {
        animationLoadingStart('Enviando dados...', 1, false);

        let dadosdetalheot = [];
        let nCtTotalItens = 0;
        let nQtdTotalItens = 0;
        let dVlrTotalVenda = 0;
        let dVlrTotalCusto = 0;
        let myTable = $('#tabelaprodutosdeposito').DataTable();
        let countRowsTable = myTable.rows().count();
        let msgRetorno;

        if (countRowsTable === 0 || countRowsTable > 200) {
            msgRetorno = countRowsTable === 0 ? 'Informar os produtos da OT!' : 'A OT não pode conter mais de 200 tipos de produtos!';

            return msgWarning('Atenção!', msg);
        }

        $("#otdeposito").modal('hide');

        for (let i = 0; i < countRowsTable; i++) {
            let cIdProduto = myTable.rows().cell(i, 0).data();
            let nQtdProduto = parseInt(myTable.rows().cell(i, 5).data());
            let nVlrVenda = parseFloat(myTable.rows().cell(i, 4).data());
            let nVlrCusto = parseFloat(myTable.rows().cell(i, 3).data());

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
            "IDEMPRESAORIGEM": parseInt($("#idlojaorigemmodal").val())
            , "IDEMPRESADESTINO": parseInt($("#idlojadestinomodal").val())
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

        if (nBtnSalvar === 1) {
            await ajaxPost("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                .catch((error) => { throw error });

            msgRetorno = "Salvo com Sucesso!";
        } else if (nBtnSalvar === 2) {
            await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                .catch((error) => { throw error });

            msgRetorno = "Alterado com Sucesso!";
        }

        await msgSuccess(msgRetorno);
        ListaOrdemTransferenciaDeposito();

    } catch (error) {
        console.error(error);
        msgError('Erro ao tentar inserir/atualizar os dados!');
    }
}

// Função para Preencher a Quantidade e Descrição dos Volumes da OT
async function salvarvolumeot(id) {
    try {
        animationLoadingStart();

        await $.get('conferenciacega_action_salvarvolumeot.html', async (res)=> {
            $('#resultadovolumeot').html(res);
            $("#volumeot").modal('show');
        }).fail((error) => { throw error })

        $("#footervolumeot").html(`
            <button type="button" class="btn btn-success" id="${id}" onclick="emitirnfedeposito(this.id)">Salvar</button>
        	<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
        `);

        animationLoadingStop();
    } catch (error) {
        console.error(error);
        msgError();
    }
}

// Emiti a Nota Fiscal da Ordem de Transferência e libera para Conferência no Destino
function emitirnfedeposito(id){
    let qtdvolume = parseInt($("#qtdvolume").val() || 0);
	let descvolume = $("#descvolume").val() || "";
    let msgRetorno;

    if (qtdvolume <= 0 || !descvolume){
        msgRetorno = qtdvolume <= 0 ? 'Necessário preencher a Quantidade!' : 'Necessário preencher a Descrição!';
        
        return msgWarning('Atenção!', msgRetorno);
	}

    let dados = [{
        "IDSTATUSOT": parseInt(3)
        ,"IDRESUMOOT": parseInt(id)
        ,"IDEMPRESAORIGEM": parseInt(IDEmpresaLogin)
        ,"NUTOTALVOLUMES": parseInt(qtdvolume)
        ,"TPVOLUME": descvolume
        ,"NOTAFISCAL": parseInt(0)
    }];

	Swal.fire({
		title: 'Deseja Finalizar a OT?',
		icon: 'info',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Sim, quero Finalizar!',
		cancelButtonText: 'Não'
	}).then(async (result) => {
        try{
            if (result.value == true) {
                animationLoadingStart('Finalizando a OT...', 1, false);
                $("#volumeot").modal('hide');

                await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                    .catch((error)=>{ throw error });

                await msgSuccess('OT Finalizada com sucesso!');
                ListaOrdemTransferenciaDeposito();
            }
        } catch (error){
            console.error(error);
            msgError('Erro ao tentar finalizar a OT!')
        }
	})

    /*Swal.fire({
		title: 'Deseja aguardar a Emissão da Nota Fiscal?',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Sim, quero Aguardar!',
		cancelButtonText: 'Não'
	}).then((result) => {
		if (result.value == true) {
            dados.NOTAFISCAL = parseInt(1);
            Swal.fire({
                type: 'info',
                title: 'Emitindo Nota Fiscal, aguarde...',
                timer: 120000,
                backdrop: false,
                onBeforeOpen: async () => {
                    Swal.showLoading()
                    await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                    .then(function (){
                        Swal.close();
                        Swal.fire(
                            'Nota Emitida com Sucesso!',
                        );
                        ListaOrdemTransferenciaDeposito();
                    })
                    .catch(funcError);
                }
              })
		} else {
            ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
            	.then(function (){
					Swal.fire(
						'Enviado, o Sistema irá Emitir a Nota!',
					);
					ListaOrdemTransferenciaDeposito();
				})
                .catch(funcError);
        }
	})*/
}

// Cancelar a Ordem de Transferência que está na Origem
function cancelarotdeposito(id){
	let dados = [{
		"IDSTATUSOT": parseInt(2)
        ,"IDRESUMOOT": parseInt(id)
		,"IDUSRCANCELAMENTO": parseInt(IDFuncionarioLogin)
    }];

	Swal.fire({
		title: 'Deseja realmente CANCELAR essa OT?',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Sim, quero Cancelar!',
		cancelButtonText: 'Não'
	}).then(async (result) => {
        try {
            if (result.value == true) {
                animationLoadingStart('Cancelando a OT...', 1, false);
                $("#volumeot").modal('hide');

                await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                    .catch((error) => { throw error });

                await msgSuccess('OT Cancelada com sucesso!');
                ListaOrdemTransferenciaDeposito();
            }
        } catch (error) {
            console.error(error);
            msgError('Erro ao tentar finalizar a OT!')
        }
	});
}

async function incluirotdeposito(){
    try{
        animationLoadingStart();

        nIdResumoOT = 0;
        nBtnSalvar = 1;
        
        await abrirModalOTDeposito();

        animationLoadingStop();

    } catch(error){
        console.error(error);
        msgError();
    }

}

async function imprimiretiqueta(id) {
    try {
        animationLoadingStart();

        $('#etiquetasOTparaImpressão').html('');

        await $.get("conferenciacega_action_pdfot_modal.html", async (resp) => {
            $("#etiquetaImp").html(resp);
            $('#impEtiquetaOT').modal('show');
            $('#js-page-content').addClass('hidden-print')

        }).fail((error) => { throw error });

        await ajaxGetAllData(`api/conferencia-cega/resumo-ordem-transferencia.xsjs?id=${id}`, false)
            .then(retornoImprimirEtiqueta)
            .catch((error) => { throw error });

        animationLoadingStop();

    } catch (error) {
        console.error(error);
        msgError();
    }
}

async function retornoImprimirEtiqueta(respostaImprimirEtiqueta) {
    let { data } = respostaImprimirEtiqueta || [];

    $('#etiquetasOTparaImpressão').html('');

    if (data?.length > 0) {

        for (let registro of data) {
            let { IDRESUMOOT, EMPRESAORIGEM, EMPRESADESTINO, DATAEXPEDICAOFORMATADA, NUMEROVOLUME, NUTOTALVOLUMES, TPVOLUME, CODIGOBARRAS } = registro || "";
            let volume = Number(data[0]?.NUTOTALVOLUMES) || 1;
            let Observacao = TPVOLUME;

            $('#etiquetasOTparaImpressão').append(`
                <div class="EtiquetaOT row backCustom" style="border-radius: 5px !important;">
                    <div class=" col-sm-12 col-xl-12 h3 center">
                                        
                        <div class="codBarrasEtiquetaOT col-sm-12 col-xl-12 text-center" style="text-align: center">
                            <svg
                                class="svgEtiqueta codBarras text-center"
                                jsbarcode-value="${CODIGOBARRAS}"
                                jsbarcode-width= "4"
                                jsbarcode-height="82"
                                jsbarcode-margin="2" 
                                jsbarcode-fontSize="15"
                                jsbarcode-textMargin="2"
                                value="${CODIGOBARRAS}">
                            </svg>
                        </div>

                        <div id="conteudoEtiquetaOt">
                            <p ><strong>Origem: </strong><span></span>${EMPRESAORIGEM}</p>
                                                                
                            <p ><strong>Destino: </strong><span></span>${EMPRESADESTINO}</p>
                                                                
                            <p ><strong>Nº da OT: </strong><span></span>${IDRESUMOOT}</p>
                                                                
                            <p ><strong>Data da OT: </strong><span></span>${DATAEXPEDICAOFORMATADA}</p>
                                                                
                            <p ><strong>Volume: </strong><span></span>${NUMEROVOLUME}/${volume}</p>
							
							<p ><strong> ${Observacao} </strong></p>
                        </div>
                   </div> 
                </div>
            `);

        }


    }

    JsBarcode('.svgEtiqueta').init();
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

async function imprimiretiqueta(id) {
    try {
        animationLoadingStart();

        await $.get("conferenciacega_action_pdfot_modal.html", async (respHtml) => {
            $('#etiquetaImp').html(respHtml);
        }).fail((error) => { throw error });

        await ajaxGetAllData(`api/expedicao/impressao-etiqueta-ot.xsjs?id=${id}`)
            .then(retornoImprimirEtiqueta)
            .catch((error) => { throw error });

        $('#impEtiquetaOT').modal('show');
        $('#js-page-content').addClass('hidden-print');

        animationLoadingStop();
    } catch (error) {
        console.error(error);
        msgError();
    }
}

async function retornoImprimirEtiqueta(respostaImprimirEtiqueta) {
    let { data } = respostaImprimirEtiqueta || [];

    $('#etiquetasOTparaImpressão').html('');

    if (data?.length > 0) {

        for (let registro of data) {
            let { IDRESUMOOT, EMPRESAORIGEM, EMPRESADESTINO, DATAEXPEDICAOFORMATADA, NUMEROVOLUME, NUTOTALVOLUMES, TPVOLUME, CODIGOBARRAS } = registro || "";
            let volume = Number(data[0]?.NUTOTALVOLUMES) || 1;
            let Observacao = TPVOLUME;

            $('#etiquetasOTparaImpressão').append(`
                <div class="EtiquetaOT row backCustom" style="border-radius: 5px !important;">
                    <div class=" col-sm-12 col-xl-12 h3 center">
                                        
                        <div class="codBarrasEtiquetaOT col-sm-12 col-xl-12 text-center" style="text-align: center">
                            <svg
                                class="svgEtiqueta codBarras text-center"
                                jsbarcode-value="${CODIGOBARRAS}"
                                jsbarcode-width= "4"
                                jsbarcode-height="82"
                                jsbarcode-margin="2" 
                                jsbarcode-fontSize="15"
                                jsbarcode-textMargin="2"
                                value="${CODIGOBARRAS}">
                            </svg>
                        </div>

                        <div id="conteudoEtiquetaOt">
                            <p ><strong>Origem: </strong><span></span>${EMPRESAORIGEM}</p>
                                                                
                            <p ><strong>Destino: </strong><span></span>${EMPRESADESTINO}</p>
                                                                
                            <p ><strong>Nº da OT: </strong><span></span>${IDRESUMOOT}</p>
                                                                
                            <p ><strong>Data da OT: </strong><span></span>${DATAEXPEDICAOFORMATADA}</p>
                                                                
                            <p ><strong>Volume: </strong><span></span>${NUMEROVOLUME}/${volume}</p>
							
							<p ><strong> ${Observacao} </strong></p>
                        </div>
                   </div> 
                </div>
            `);

        }


    }

    JsBarcode('.svgEtiqueta').init();
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

//? =============================== FIM ORDEM DE TRANSFERENCIA DEPOSITO =============================== //

//? =============================== INICIO ROTINA CONFERIR ORDEM DE TRANSFERENCIA DEPOSITO =============================== //
// Dt.Atualização: 23/10/2024
// Autor Atualização: Hendryw Deyvison

async function abrirModalConferirOTDeposito() {
    await $.get('conferenciacega_action_conferirot_modal_deposito.html', function (res) {
        $('#resultadocotdeposito').html(res);
        $("#cotdeposito").modal('show');
    }).fail((error) => { throw error });

    $('#cotdeposito').on({
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

            $('#descProdutoDeposito').focus();

            $("#conferiridlojadestinomodal, #conferiridlojaorigemmodal").select2({
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

    await ajaxGetAllData('api/empresa.xsjs', false)
        .then(retornoListaEmpresasModalSelectDeposito)
        .catch((error) => { throw error });
}

async function conferirotdeposito(id){
    try{
        animationLoadingStart();

        idchave = id.split(":");
        nIdResumoOT = idchave[0];
        nConferir = parseInt(idchave[1]);
        NumeroNF = idchave[2];
        Status = idchave[3];
        DataCriacao = idchave[4];
        conferirdataRetornoDetalheOT = [];

        nBtnSalvar = 2; // Alterando o botão salvar para update
        id = nIdResumoOT;

        await abrirModalConferirOTDeposito();

        $('#numeroOT').val(nIdResumoOT);
        $('#numeroNFe').val(NumeroNF);
        $('#statusOT').val(Status);
        $('#dtgeracaoOT').val(DataCriacao);

        await ajaxGetAllData(`api/conferencia-cega/detalhe-ordem-transferencia.xsjs?id=${id}`)
            .then(conferirretornoListaDetalheOTDeposito)
            .catch((error) => { throw error });

    } catch(error){
        console.error(error);
        msgError();
    }

}

function conferirretornoListaDetalheOTDeposito(conferirrespostaListaDetalheOT){
    let { data } = conferirrespostaListaDetalheOT || [];
    let dadosTable = [];
    let IdEmpresaOrigem;
    let IdEmpresaDestino;

    if(data.length > 0){

		for (registro of data) { 
            let cAltLinha = 'True';
			let IdResumoOT = registro.IDRESUMOOT;
			let CodigoProduto = registro.IDPRODUTO;
			let CodigoBarras = registro.NUCODBARRAS;
			let DescProduto = registro.DSNOME;
			let PrecoVenda = registro.VLRUNITVENDA;
			let PrecoCusto = registro.VLRUNITCUSTO;
            let QtdProduto = registro.QTDRECEPCAO;
            let nQtdExpedicao = parseInt(registro.QTDEXPEDICAO);
            let nQtdDiferenca = parseInt(registro.QTDDIFERENCA);
            let nQtdConferido = parseInt(registro.QTDCONFERENCIA);
            let IdStatusOT = parseInt(registro.IDSTATUSOT);

            let BtnOpcao = `
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${CodigoBarras}:${nQtdExpedicao}:${IdResumoOT}" onclick="conferirdiminuirProdutoDeposito(this.id)"><i class="fal fa-minus"></i></button>
			    <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoBarras}:${nQtdExpedicao}:${IdResumoOT}" onclick="conferirexcluirProdutoDeposito(this.id)"><i class="fal fa-trash"></i></button>
            `;

            IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
            IdEmpresaDestino = registro.IDEMPRESADESTINO;
    
            // Só permite edição para os Status 3-Aguardando Conferência e 5-Aberto com Divergência
            if([1, 2, 4, 6, 7].indexOf(IdStatusOT) >= 0){
                cAltLinha = 'False';
                BtnOpcao = ``;
                $("#conferirsalvarotdeposito, #conferirdescProdutoDeposito").prop("disabled", true);
            }

            dadosTable.push([
                CodigoProduto
                ,CodigoBarras
                ,DescProduto
                ,PrecoCusto
                ,PrecoVenda
                ,QtdProduto
                ,BtnOpcao
                ,cAltLinha
            ]);
        }

    }
        
    $("#conferiridlojaorigemmodal").val(IdEmpresaOrigem).trigger('change').prop("disabled", true);
    $("#conferiridlojadestinomodal").val(IdEmpresaDestino).trigger('change').prop("disabled", true);

    $('#conferirtabelaprodutosdeposito').DataTable( {
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "12%", "targets": 5 },
            { "width": "10%", "targets": 6 },
            { visible: false,
                searchable: false, "targets": 7 }
        ],

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

async function conferirpesqProdutoDeposito() {
    try {
        let myTable = $('#conferirtabelaprodutosdeposito').DataTable();
        let descProduto = $('#conferirdescProdutoDeposito').val();
        let nIdEmpresa = $("#conferiridlojaorigemmodal").val();
        let cont = 0;

        if (parseInt($("#conferiridlojaorigemmodal").val()) <= 0 || parseInt($("#conferiridlojadestinomodal").val()) <= 0) {
            return msgWarning('Atenção', 'A Loja de Origem e Destino devem ser Preenchidas!');
        }

        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == descProduto) {
                if (myTable.cell(node._DT_CellIndex.row, 7).data() === 'True') {
                    myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) + 1);
                }

                cont++;

                $('#conferirdescProdutoDeposito').val("").focus();
            }
        });

        if (cont === 0) {
            $('#conferirdescProdutoDeposito').prop("disabled", true);

            await ajaxGetAllData(`api/conferencia-cega/produto.xsjs?idEmpresa=${nIdEmpresa}&id=${descProduto}`)
                .then(conferirRetornoListaProdutoDeposito)
                .catch((error) => { throw error });
        }

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function conferirRetornoListaProdutoDeposito(conferirrespostaListaProduto){
    let { data } = conferirrespostaListaProduto || [];
	let myTable = $('#conferirtabelaprodutosdeposito').DataTable();

	if (data.length > 0) {
		let CodigoProduto = data[0].IDPRODUTO;
		let CodigoBarras = data[0].NUCODBARRAS;
		let DescProduto = data[0].DSNOME;
		let PrecoVenda = data[0].PRECOVENDA;
		let PrecoCusto = data[0].PRECOCUSTO;
        let nQtdExpedicao = data[0].QTDEXPEDICAO;
		
		let BtnOpcao = `
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${CodigoBarras}:${nQtdExpedicao}:${IdResumoOT}" onclick="conferirdiminuirProdutoDeposito(this.id)"><i class="fal fa-minus"></i></button>
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoBarras}:${nQtdExpedicao}:${IdResumoOT}" onclick="conferirexcluirProdutoDeposito(this.id)"><i class="fal fa-trash"></i></button>
        `;
        let dadosRowTable = [
            CodigoProduto, 
            CodigoBarras, 
            DescProduto, 
            PrecoCusto, 
            PrecoVenda, 
            1, 
            BtnOpcao, 
            'True'
        ];
		
        myTable.row.add(dadosRowTable).draw(false);

        $('#conferiridlojaorigemmodal, #conferiridlojadestinomodal, #conferirdescProdutoDeposito').prop("disabled", true);
        $('#conferirdescProdutoDeposito').val("").focus();
	}
}

function conferirexcluirProdutoDeposito(id) {

    idchave = id.split(":");
    id = idchave[0];
    pQtdExpedicao = parseInt(idchave[1]);
    nIdResumoOT = parseInt(idchave[2]);

    let myTable = $('#conferirtabelaprodutosdeposito').DataTable();

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
        try{
            if (myTable.cell(node).data() == id) {
                if (pQtdExpedicao === 0) {
                    animationLoadingStart('Atualizando...', 100, false);

                    await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
                        .then(myTable.row(node._DT_CellIndex.row).remove().draw(false))
                        .catch((error)=> { throw error; });

                    animationLoadingStop();
                } else {
                    myTable.cell(node._DT_CellIndex.row, 5).data(0);
                }
            }
        } catch (error) {
            console.log(error);
            msgError('Erro ao tentar atualizar')
        }
    });

    $('#conferirdescProdutoDeposito').val("").focus();
}

function conferirdiminuirProdutoDeposito(id){

    idchave = id.split(":");
    id = idchave[0];
    pQtdExpedicao = parseInt(idchave[1]);
    nIdResumoOT = parseInt(idchave[2]);

	let myTable = $('#conferirtabelaprodutosdeposito').DataTable();

	myTable.column(1).nodes().each(function(node,index,dt){
        if(myTable.cell(node).data() == id){
        	if(myTable.cell(node._DT_CellIndex.row,5).data() > 1){
				myTable.cell(node._DT_CellIndex.row,5).data(parseInt(myTable.cell(node._DT_CellIndex.row,5).data())-1);
			} else {
                if(pQtdExpedicao === 0){
                    conferirexcluirProdutoDeposito(id + ':' + pQtdExpedicao + ':' + nIdResumoOT);
                } else {
                    myTable.cell(node._DT_CellIndex.row,5).data(0);
                }
			}
        }
    });

    $('#conferirdescProdutoDeposito').val("").focus();
}

function conferirabrirPesqProdutoDeposito(){

	$("#conferirabrirpesqprodutodeposito").modal('show');
}

async function conferirpesquisarProdutoDeposito(){
    try{
        let nIdLojaOrigem = parseInt($("#conferiridlojaorigemmodal").val());
        let descProduto = $("#conferirpesqProdutoDeposito").val();

        await ajaxGetAllData(`api/conferencia-cega/produto.xsjs?idEmpresa=${nIdLojaOrigem}&descProduto=${descProduto}`)
            .then(conferirretornoPesqListaProdutoDeposito)
            .catch((error)=>{ throw error });
        
    }catch(error){
        onsole.log(error);
        msgError('Erro ao tentar pesquisar');
    }
}

function conferirretornoPesqListaProdutoDeposito(conferirrespostaPesqListaProduto) {
    let { data } = conferirrespostaPesqListaProduto || [];
    let dadosTable = [];

    if(data.length > 0){
        for (let registro of data) { 

			let CodigoProduto = registro.IDPRODUTO;
			let CodigoBarras = registro.NUCODBARRAS;
			let DescProduto = registro.DSNOME;
			let PrecoVenda = registro.PRECOVENDA;
			let PrecoCusto = registro.PRECOCUSTO;
            
            dadosTable.push( [
                CodigoProduto
                ,CodigoBarras
                ,DescProduto
                ,PrecoCusto
                ,PrecoVenda
                ,`<input type="number" class="form-control" id="qtd:${CodigoBarras}" value="0"><span style="display: none;">0</span>`
                ,`<button type="button" class="btn btn-outline-success btn-xs btn-icon waves-effect waves-themed" title="Confirmar" id="${CodigoBarras}" onclick="conferirconfirmarProdutoDeposito(this.id)"><i class="fal fa-check"></i></button>`
                ,`True`
            ]);
        }
    }

    $('#conferirresultadodeposito').html(
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

    $('#conferirdt-basic-produto').DataTable( {
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "12%", "targets": 5 },
            { "width": "10%", "targets": 6 },
            { visible: false,
                searchable: false, "targets": 7 }
        ],
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

function conferirconfirmarProdutoDeposito(id){
	let conferirtabelaresultado = $('#conferirdt-basic-produto').DataTable();
	let cCodProduto = "";
	let cDescProduto = "";
	let nPrecoCusto = 0;
	let nPrecoVenda = 0;
	let nQtd = 0;
	let cont = 0;

	cCodProduto = conferirtabelaresultado.rows().data()[0][0];
	cDescProduto = conferirtabelaresultado.rows().data()[0][2];
	nPrecoCusto = conferirtabelaresultado.rows().data()[0][3];
	nPrecoVenda = conferirtabelaresultado.rows().data()[0][4];
	nQtd = parseInt(document.getElementById('qtd:'+id).value);

	if(nQtd <= 0){
		return msgWarning('Atenção!', 'Favor preencher a Quantidade do Produto com um valor Maior que Zero ( 0 )!');
	}

	$("#conferirabrirpesqprodutodeposito").modal('hide');

	let myTable = $('#conferirtabelaprodutosdeposito').DataTable();
					
	let BtnOpcao = `
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${id}" onclick="conferirdiminuirProdutoDeposito(this.id)"><i class="fal fa-minus"></i></button>
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${id}" onclick="conferirexcluirProdutoDeposito(this.id)"><i class="fal fa-trash"></i></button>
    `;

    let dadosRow = [
        cCodProduto,
         id,
         cDescProduto,
         nPrecoCusto,
         nPrecoVenda,
         nQtd,
         BtnOpcao,
        'True'
    ];

	if(myTable.rows().count() > 0){
		myTable.column(1).nodes().each(function(node,index,dt){
			if(myTable.cell(node).data() == id){
				myTable.cell(node._DT_CellIndex.row,5).data(parseInt(myTable.cell(node._DT_CellIndex.row,5).data()) + nQtd);
				cont++;
			}
		});
		if(cont === 0){
			myTable.row.add(dadosRow).draw(false);
		}
	} else {
        myTable.row.add(dadosRow).draw(false);
	}

    conferirtabelaresultado.destroy();

    $('#conferiridlojaorigemmodal, #conferiridlojadestinomodal').select2().prop("disabled", true);
	$('#conferirdt-basic-produto').empty();
	$('#conferirpesqProdutoDeposito').val("");
    $('#conferirdescProdutoDeposito').val("").focus();

}

// Funcão para Salvar os Dados da OT que está passando por Conferência no Destino
async function conferirsalvarotdeposito(){
    try {
        let dadosdetalheot = [];
        let nQtdTotalItens = 0;
        let myTable = $('#conferirtabelaprodutosdeposito').DataTable();
        let qtdRows = myTable.rows().count();
        let msgRetorno;

        if (qtdRows === 0 || qtdRows > 200) {

            qtdRows === 0 ? 'Informar os produtos da OT!' : 'A OT não pode conter mais de 200 tipos de produtos!';

            return msgWarning('Atenção!', msgRetorno);
        }

        $("#cotdeposito").modal('hide');

        animationLoadingStart('Salvando dados...', 100, false);

        for (let i = 0; i < qtdRows; i++) {
            let cIdProduto = myTable.rows().cell(i, 0).data();
            let nQtdProduto = parseInt(myTable.rows().cell(i, 5).data());
            let nVlrVenda = parseFloat(myTable.rows().cell(i, 4).data());
            let nVlrCusto = parseFloat(myTable.rows().cell(i, 3).data());

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
            nQtdTotalItens = nQtdTotalItens + nQtdProduto;
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
            .catch((error) => { throw error });

        await msgSuccess("Recepção Salva com Sucesso!");

        ListaOrdemTransferenciaDeposito();

    } catch (error) {
        console.log(error);
        msgError('Error ao tentar salvar');
    }
}

async function finalizarotdeposito(id){
    try{
        idchave = id.split(":");
        id = idchave[0];
        nQtdConferido = idchave[5];

        let dados = [{
            "IDOPERADORRECEPTOR": IDFuncionarioLogin
            ,"IDSTATUSOT": parseInt(6)
            ,"IDRESUMOOT": parseInt(id)
            ,"QTDCONFERENCIA": parseInt(nQtdConferido)
        }];

        animationLoadingStart('Finalizando OT, aguarde...', 100, false);

        await ajaxPut("api/conferencia-cega/resumo-ordem-transferencia.xsjs", dados)
            .catch((error) => { throw error });

        await msgSuccess("OT Finalizada com sucesso!!");

        ListaOrdemTransferenciaDeposito();

    } catch (error) {
        console.log(error);
        msgError('Error ao tentar finalizar a OT');
    }
}
//? =============================== FIM ROTINA CONFERIR ORDEM DE TRANSFERENCIA DEPOSITO =============================== //