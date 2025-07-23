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
var FatRotinaOT = usuario['STFATURAOT'] === null ? 'False' : usuario['STFATURAOT'];

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
var nConfSalvar = 0;
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

$(document).ready(function () {

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
        $("#idlojadestinomodal [value=" + IDEmpresaLogin + "]").attr("disabled", "disabled");
        $("#idlojaorigemmodal").val(IDEmpresaLogin);
        $('#idlojaorigemmodal').prop('disabled', true);

        $('#conferiridlojaorigemmodal').append(
            `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
        );
        $('#conferiridlojadestinomodal').append(
            `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
        );
        $("#conferiridlojadestinomodal [value=" + IDEmpresaLogin + "]").attr("disabled", "disabled");
        $("#conferiridlojaorigemmodal").val(IDEmpresaLogin);
        $('#conferiridlojaorigemmodal').prop('disabled', true);

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

function funcErrorSelectListaStatusOT(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os STATUS das Ordem de Tranferência',
        showConfirmButton: false,
        timer: 15000
    });
}

function retornoListaStatusOT(respostaListaStatusOT) {

    $("#idstatusot").select2();

    for (var i = 0; i < respostaListaStatusOT.data.length; i++) {

        IDStatusOT = respostaListaStatusOT.data[i]['IDSTATUSOT'];
        DSStatusOT = respostaListaStatusOT.data[i]['DESCRICAOOT'];

        $('#idstatusot').append(
            `<option value="` + IDStatusOT + `"> ` + DSStatusOT + `</option>`
        );
    }
}

function funcErrorListaRotinaSelect(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar as ROTINAS da Ordem de Tranferência',
        showConfirmButton: false,
        timer: 15000
    });
}

function retornoListaRotinaSelect(respostaListaRotina) {

    $("#idrotina").select2();

    for (var i = 0; i < respostaListaRotina.data.length; i++) {

        IDRotina = respostaListaRotina.data[i]['IDROTINA'];
        DescRotina = respostaListaRotina.data[i]['DESCROTINA'];

        $('#idrotina').append(
            `<option value="` + IDRotina + `"> ` + DescRotina + `</option>`
        );
    }
}

//? ============================= INICIO ROTINA FATURAMENTO ORDEM DE TRANSFERÊNCIA ============================= //
// Leandro Massafera - 10/06/2022
/*
    Autor_atualização: Hendryw Deyvison
    Data: 23/12/2024
*/
function retornoListaEmpresasSelect(respostaListaEmpresas) {
    let { data } = respostaListaEmpresas || [];

    for (let { IDEMPRESA, NOFANTASIA } of data) {
        $("#idloja, #idlojaorigem, #idlojadestino").append(
            `<option value="${IDEMPRESA}"> ${NOFANTASIA} </option>`
        );
    }

    $("#idloja, #idlojaorigem, #idlojadestino").select2();

    if (FatRotinaOT === 'False') {
        $("#idlojaorigem").val(IDEmpresaLogin).trigger('change');
    }
}

//! AJUSTAR ANTES DE SUBIR
async function ListaFaturamentoOT() {
    try {

        //! AJUSTAR ANTES DE SUBIR
        // Validar os Colaboradores que podem acessar a funcionalidade
        if (false /*&& FatRotinaOT === 'False'*/) {
            return msgInfo("Acesso não permitido!");
        }

        animationLoadingStart();

        await $.get("expedicao_action_fot.html", (resp) => {
            $("#js-page-content").html(resp);

            $("#dtconsultainicio, #dtconsultafim, #datainientrega, #datafinentrega").val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisarfot() });
        }).fail((error) => { throw error });

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(retornoListaEmpresasSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData('api/expedicao/status-ordem-transferencia.xsjs', false)
            .then(retornoListaStatusOT)
            .catch((error) => { throw error });

        await ajaxGetAllData('api/expedicao/resumo-ordem-transferencia.xsjs', false)
            .then(retornoListaFOT)
            .catch((error) => { throw error });

        $("#idstatusot").select2();

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

function retornoListaFOT(respostaListaFOT, stFocus = false) {
    let { data } = respostaListaFOT || [];
    let dadosTable = [];

    if (data.length > 0) {
        for (let registro of data) {

            let IdResumoOT = registro.IDRESUMOOT;
            let DataCriacao = registro.DATAEXPEDICAOFORMATADA;
            let EmpresaOrigem = registro.EMPRESAORIGEM;
            let EmpresaDestino = registro.EMPRESADESTINO;
            let NumeroNF = registro.NUMERONOTASEFAZ;
            let QtdConferido = parseInt(registro.QTDCONFERENCIA);
            let IdStatusOT = parseInt(registro.IDSTATUSOT);
            let StatusOT = registro.DESCRICAOOT;
            let IdSAPOrigem = registro?.IDSAPORIGEM || 0;
            let IdSAPDestino = registro.IDSAPDESTINO;
            let ErrorLogSAP = registro.ERRORLOGSAP;
            let ChaveSEFAZ = registro?.CHAVESEFAZ || "";
            let MsgSEFAZ = registro.MSGSEFAZ;
            let CodigoRetornoSEFAZ = registro.CODIGORETORNOSEFAZ;
            let DataNota = registro.DATAEMISSAOSEFAZFORMATADA;
            let DescObs = registro.DSOBSERVACAO;
            let btncanceldisabled = "disabled";
            let btnfaturardisabled = "disabled";
            let btnsefazdisabled = "disabled";
            let btnchekboxdisabled = "disabled";
            let btnimprimirnfe = ChaveSEFAZ ? "" : "disabled";
            let colorButton = ErrorLogSAP?.length ? 'danger' : (IdSAPOrigem > 0 && IdSAPDestino > 0) ? 'success' : 'warning';

            if ([1, 3].indexOf(IdStatusOT) >= 0) {
                btncanceldisabled = "";
            }

            if (IdStatusOT === 3) {
                btnfaturardisabled = "";
            }

            if (IdStatusOT === 9) {
                btnsefazdisabled = "";
            }

            if ([3, 9].indexOf(IdStatusOT) >= 0 || ChaveSEFAZ !== null) {
                btnchekboxdisabled = "";
            }

            if (ChaveSEFAZ !== null) {
                btnimprimirnfe = "";
            }

            let inputCheck = /*`<input id="id_${IdResumoOT}" ${btnchekboxdisabled} class='selected' type='checkbox' name='id_${IdResumoOT}' value='${IdResumoOT}:${IdSAPOrigem}:${ChaveSEFAZ}:${IdStatusOT}' />`*/`
                <div class="custom-control custom-checkbox">
                    <input id="id_${IdResumoOT}" ${btnchekboxdisabled} class='custom-control-input selected' type='checkbox' name='id_${IdResumoOT}' value='${IdResumoOT}:${IdSAPOrigem}:${ChaveSEFAZ}:${IdStatusOT}' />
                    <label class="custom-control-label" for="id_${IdResumoOT}"></label>    
                </div>
            `;

            let BtnOpcao = `
                <div class="demo">
                    <button type="button" class="btn btn-success btn-xs btn-icon waves-effect waves-themed" title="Visualizar" id="${IdResumoOT}:${IdStatusOT}:${DescObs}" onclick="visualizarfot(this.id)"><i class="fal fa-edit"></i></button>
                    <button ${btncanceldisabled} type="button" class="btn btn-danger btn-xs btn-icon waves-effect waves-themed" title="Cancelar" id="${IdResumoOT}" onclick="cancelarfot(this.id)"><i class="fal fa-trash"></i></button>
                    <button ${btnfaturardisabled} type="button" class="btn btn-warning btn-xs btn-icon waves-effect waves-themed" title="Processar Faturamento" id="${IdResumoOT}" onclick="faturarot(this.id)"><i class="fal fa-check"></i></button>
                    <button ${btnsefazdisabled} type="button" class="btn btn-info btn-xs btn-icon waves-effect waves-themed" title="Processar SEFAZ" id="${IdSAPOrigem}" onclick="sefazot(this.id)"><i class="fal fa-check"></i></button>
                    <button type="button" class="btn btn-secondary btn-xs btn-icon waves-effect waves-themed" title="Imprimir Etiqueta" id="${IdResumoOT}" onclick="imprimiretiqueta(this.id)"><i class="fal fa-print"></i></button>
                    <button type="button" class="btn btn-${colorButton} btn-xs btn-icon waves-effect waves-themed" title="Status Nota Fiscal" id="${IdResumoOT}" onclick="observacaoot(this.id)"><i class="fal fa-exclamation"></i></button>
                    <button ${btnimprimirnfe} type="button" class="btn btn-danger btn-xs btn-icon waves-effect waves-themed" title="Imprimir Nota Fiscal" onClick="window.open('http://164.152.244.96:3000/files/NFe${ChaveSEFAZ}.pdf', '_blank');"><i class="fal fa-print"></i></button>
			    </div>
            `;


            dadosTable.push([
                inputCheck
                , IdResumoOT
                , DataCriacao
                , EmpresaOrigem
                , EmpresaDestino
                , DataNota
                , NumeroNF
                , StatusOT
                , BtnOpcao
            ]);
        }

    }

    $('#resultadomodalfot').html(
        `<table id="dt-basic-fot" class="table table-bordered table-hover table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th></th>
                    <th>Nº OT</th>
                    <th>Data Criação</th>
                    <th>Loja Origem</th>
                    <th>Loja Destino</th>
                    <th>Data Nota</th>
                    <th>Número NF-e</th>
                    <th>Status</th>
                    <th>Opções</th>
                </tr>
            </thead>
            <tbody id="resultadomodalfot">
            </tbody>
        </table>`
    );

    $('#dt-basic-fot').DataTable({
        data: dadosTable,
        "columnDefs": [
            { "width": "2%", "targets": 0, "orderDataType": 'checkbox' },
            { "width": "5%", "targets": 1 },
            { "width": "5%", "targets": 2, "type": 'date-time-br' },
            { "width": "25%", "targets": 3 },
            { "width": "25%", "targets": 4 },
            { "width": "10%", "targets": 5 },
            { "width": "8%", "targets": 6 },
            { "width": "10%", "targets": 7 },
            { "width": "20%", "targets": 8 }
        ],
        order: [
            [1, 'desc'],
        ],
        deferRender: false,
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
            let idTable = `#${settings.nTable.id}`;

            if (stFocus) {
                $('html, body').animate({
                    scrollTop: $(idTable).offset().top - 70
                }, 1000);

                $(idTable).find('tbody td:first').focus()
            }
        },
    });

}

// Efetuar a pesquisa das OT's conforme o filtro
async function pesquisarfot() {
    try {
        let idlojaorigem = $("#idlojaorigem").val();
        let idlojadestino = $("#idlojadestino").val();
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();
        let idstatusot = $("#idstatusot").val();
        let dtinifat = $("#dtinifat").val();
        let dtfimfat = $("#dtfimfat").val();

        await ajaxGetAllData(`api/expedicao/resumo-ordem-transferencia.xsjs?idtipofiltro=1&idEmpresaOrigem=${idlojaorigem}&idEmpresaDestino=${idlojadestino}&datapesqinicio=${datapesqinicio}&datapesqfim=${datapesqfim}&idstatusot=${idstatusot}&dtinifat=${dtinifat}&dtfimfat=${dtfimfat}`)
            .then((resp) => retornoListaFOT(resp, true))
            .catch((error) => { throw error });

    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function cancelarfot(id) {
    let dados = [{
        "IDSTATUSOT": parseInt(2)
        , "IDRESUMOOT": parseInt(id)
        , "IDUSRCANCELAMENTO": parseInt(IDFuncionarioLogin)
    }];

    await Swal.fire({
        title: 'Deseja realmente CANCELAR essa OT?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, quero Cancelar!',
        cancelButtonText: 'Não'
    }).then(async (result) => {
        try {
            if (result.value == true) {
                animationLoadingStart('Cancelando a OT, aguarde...', 100, false);

                await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                    .catch((error) => { throw error });

                await msgSuccess('OT Cancelada com sucesso!');

                ListaFaturamentoOT();
            }

        } catch (error) {
            console.log(error);
            msgError('Erro ao tentar cancelar OT');
        }
    })
}

async function visualizarfot(id) {
    try {
        idchave = id.split(":");
        nIdResumoOT = parseInt(idchave[0]);
        nIdStatusOT = parseInt(idchave[1]);
        cDescObs = idchave[2];

        id = nIdResumoOT;

        await $.get('expedicao_action_visualizarfot_modal.html', function (res) {

            $('#resultadofot').html(res);

            $("#descobservacao").val(cDescObs).prop("disabled", true);
            $("#idlojaorigemmodal, #idlojadestinomodal").select2({
                dropdownParent: $("#fot")
            });

            $("#fot").modal('show');
        }).fail((error) => { throw error });

        $('#fot').on({
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

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(retornoListaEmpresasModalSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData(`api/expedicao/detalhe-ordem-transferencia.xsjs?id=${id}&idtipofiltro=1`, false)
            .then(retornoListaDetalheFOT)
            .catch((error) => { throw error });

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaDetalheFOT(respostaListaDetalheFOT) {
    let { data } = respostaListaDetalheFOT || [];
    let dadosTable = [];
    let IdEmpresaOrigem;
    let IdEmpresaDestino;

    if (data.length != 0) {

        for (let registro of data) {

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

            if (!IdEmpresaOrigem || !IdEmpresaDestino) {
                IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
                IdEmpresaDestino = registro.IDEMPRESADESTINO;
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
            ]);
        }

    }

    $("#idlojaorigemmodal").val(IdEmpresaOrigem).trigger('change').prop("disabled", true);
    $("#idlojadestinomodal").val(IdEmpresaDestino).trigger('change').prop("disabled", true);

    $('#tabelaprodutosfot').DataTable({
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
            { "width": "15%", "targets": 8 }
        ],
        deferRender: true,
        scrollX: true,
        responsive: false,
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

function faturarot(id) {
    let dados = [{
        "IDSTATUSOT": parseInt(9)
        , "IDRESUMOOT": parseInt(id)
        , "NOTAFISCAL": parseInt(0)
    }];

    Swal.fire({
        type: 'question',
        title: 'Deseja Faturar a OT?',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, quero Faturar!',
        cancelButtonText: 'Não',
        showCancelButton: true,
    }).then(async (result) => {
        try {
            if (result.value == true) {
                animationLoadingStart('Emitindo Faturamento, aguarde...');

                await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                    .catch((error) => { throw error });

                await msgSuccess('Faturado com Sucesso!');

                ListaFaturamentoOT();
            }

        } catch (error) {
            console.log(error);
            msgError('Erro ao Faturar OT!');
        }
    });
}

function sefazot(id) {

    Swal.fire({
        title: 'Deseja Realizar a Emissão da Nota?',
        type: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
    }).then(async (result) => {
        try {
            if (result.value == true) {
                animationLoadingStart('Emitindo Nota Fiscal, aguarde...');

                await ajaxGet(`api/service-layer/notas-transferencia/consulta-nfe-saida-tranferencia.xsjs?id=${id}`)
                    .catch((error) => { throw error });

                await msgSuccess('Nota Emitida com Sucesso!');

                ListaFaturamentoOT();
            }
        } catch (error) {
            console.log(error);
            msgError('Erro ao Faturar OT!');
        }
    })
}

//Funcão para selecionar os 10 primeiros registros
function selecionarregistros() {
    let myTable = $('#dt-basic-fot').DataTable();
    let totalPages = myTable.page.info().pages;
    let count = 0;
    let currentPage = myTable.page();

    myTable.page(0).draw('page');

    for (let i = 0; i < totalPages; i++) {
        let nextPage = myTable.page() + 1;

        $(".selected").prop("checked", false);

        myTable.page(nextPage).draw('page');
    }

    Swal.fire({
        title: '<strong>Selecionar <u>OT</u></strong>',
        type: 'info',
        html: `A rotina irá selecionar os <b>10 (dez) primeiros</b>, registros de acordo com a opção escolhida!`,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Faturamento',
        confirmButtonColor: '#ffc241',
        cancelButtonText: 'SEFAZ',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.value == true || result.dismiss == 'cancel') {
            let i = 0;

            while (i < totalPages && count < 10) {

                let nextPage = myTable.page() + 1;

                $(".selected").each(function () {
                    let campocheckbox = $(this);
                    let idchave = campocheckbox.prop("value").split(":");
                    let IdSAPOrigem = parseInt(idchave[1]);
                    let IdStatusOT = parseInt(idchave[3]);
                    let condicaoCheck = result.value ? IdSAPOrigem === 0 : (IdSAPOrigem !== 0 && IdStatusOT === 9);

                    IdResumoOT = parseInt(idchave[0]);

                    if (!campocheckbox.prop("disabled") && condicaoCheck && count < 10) {
                        campocheckbox.prop("checked", true);
                        count++;
                    }
                });

                i++;

                totalPages > 1 && myTable.page(nextPage).draw('page');
            }

            if (count > 0) {
                myTable.order([0, 'desc']).draw();
            } else {
                myTable.page(currentPage).draw('page');
            }
        }
    })
}

function processarfaturamento() {
    Swal.fire({
        title: 'Deseja Faturar as OTs Selecionadas?',
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, quero Faturar!',
        cancelButtonText: 'Não'
    }).then(async (result) => {
        try {
            if (result.value == true) {
                let myTable = $('#dt-basic-fot').DataTable();
                let totalPages = myTable.page.info().pages;
                let currentPage = myTable.page();
                let dados = [];
                let i = 0;
                let count = 0;
                let qtdCheck = 0;

                myTable.page(currentPage).draw('page');

                while (i < totalPages && count < 10) {
                    let nextPage = myTable.page() + 1;

                    $(".selected:checked").each(function () {
                        let campocheckbox = $(this);
                        let idchave = campocheckbox.prop("value").split(":");
                        let IdResumoOT = Number(idchave[0]);
                        let IdSAPOrigem = Number(idchave[1]);

                        if (IdSAPOrigem === 0) {
                            dados.push({
                                "IDSTATUSOT": 9
                                , "IDRESUMOOT": Number(IdResumoOT)
                                , "NOTAFISCAL": 1
                            });

                            count++;
                        }

                        qtdCheck++;
                    });

                    i++;

                    totalPages > 1 && myTable.page(nextPage).draw('page');
                }

                if (dados.length <= 0) {
                    return msgWarning(qtdCheck > 0 ? 'As OT´s Selecionadas Não Estão Aptas Para Faturamento, verifique e tente novamente!' : 'Nenhuma OT Selecionada Para Faturamento, verifique e tente novamente!');;
                }

                animationLoadingStart('Emitindo Faturamento, aguarde...', 200, false);

                await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                    .catch((error) => { throw error })

                await msgSuccess('Faturado com Sucesso!');

                ListaFaturamentoOT();
            }
        } catch (error) {
            console.log(error);
            msgError('Erro ao Faturar OTs!');
        }
    })
}

function processarsefaz() {
    Swal.fire({
        title: 'Deseja Realizar a Emissão das Notas?',
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, quero Emitir!',
        cancelButtonText: 'Não'
    }).then(async (result) => {
        try {
            if (result.value == true) {
                let myTable = $('#dt-basic-fot').DataTable();
                let totalPages = myTable.page.info().pages;
                let currentPage = myTable.page();
                let dados = [];
                let i = 0;
                let count = 0;
                let qtdCheck = 0;
                let msgRetorno;

                myTable.page(currentPage).draw('page');

                while (i < totalPages && count < 10) {
                    let nextPage = myTable.page() + 1;


                    $(".selected:checked").each(function () {
                        let campocheckbox = $(this);
                        let idchave = campocheckbox.prop("value").split(":");
                        let IdResumoOT = parseInt(idchave[0]);
                        let IdSAPOrigem = parseInt(idchave[1]);
                        let IdStatusOT = parseInt(idchave[3]);

                        if (IdSAPOrigem !== 0 && IdStatusOT === 9) {
                            dados.push({
                                "IDSAPORIGEM": parseInt(IdSAPOrigem)
                            });

                            count++;
                        }

                        qtdCheck++;
                    });

                    i++;

                    myTable.page(nextPage).draw('page');
                }

                if (dados.length <= 0) {
                    return msgWarning(qtdCheck > 0 ? 'As OT´s Selecionadas Não Estão Aptas Para Emitir a Nota Fiscal, verifique e tente novamente!' : 'Nenhuma OT Selecionada Para Emitir a Nota Fiscal, verifique e tente novamente!');
                }

                animationLoadingStart('Emitindo Notas, aguarde...', 200, false);

                await ajaxPost("api/service-layer/notas-transferencia/consulta-nfe-saida-tranferencia-varias.xsjs", dados)
                    .catch((error) => { throw error })

                await msgSuccess('Notas Emitidas com Sucesso!');

                ListaFaturamentoOT();
            }

        } catch (error) {
            console.log(error);
            msgError('Erro ao Tentar Emitir as Notas!');
        }
    })
}

async function baixarPDFs(dados) {
    let arrayChaveNfe = dados || [];
    let pdfDataArray = [];
    let nomeArquivos = [];

    try {

        for (const { ChaveSEFAZ, IdResumoOT } of arrayChaveNfe) {

            const response = await $.ajax({
                url: `http://164.152.244.96:3000/files/NFe${ChaveSEFAZ}.pdf`,
                method: 'GET',
                xhrFields: {
                    responseType: 'arraybuffer'
                }
            }).catch((error) => { throw { error, numNota: IdResumoOT } });

            pdfDataArray.push(response);
            nomeArquivos.push(`${ChaveSEFAZ}.pdf`);
        }

        return [pdfDataArray, nomeArquivos];
    } catch (error) {
        console.error('Erro ao baixar os arquivos PDF:', error);
        throw (error);
    }
}

/*async function baixarPDFs(dados) {
  let urlsPDFs = dados;
  let pdfDataArray = [];
  let nomeArquivos = [];
  try {
    for (const url of urlsPDFs) {
      const response = await fetch('https://cors-anywhere.herokuapp.com/' + url);
      const pdfData = await response.arrayBuffer();
      pdfDataArray.push(pdfData);

      // Extrair o nome do arquivo a partir da URL
      const nomeArquivo = url.substring(url.lastIndexOf('/') + 1);
      nomeArquivos.push(nomeArquivo);
    }
    return [pdfDataArray, nomeArquivos];
  } catch (error) {
    console.error('Erro ao baixar os arquivos PDF:', error);
    throw error;
  }
}*/

// Função para comprimir os arquivos PDF em um único arquivo ZIP
async function comprimirPDFs(pdfDataArray, nomeArquivos) {
    try {
        const zip = new JSZip();

        for (let i = 0; i < pdfDataArray.length; i++) {
            zip.file(nomeArquivos[i], pdfDataArray[i]);
        }

        return zip.generateAsync({ type: 'blob' });

    } catch (error) {
        console.error('Erro ao comprimir os arquivos PDF:', error);
        throw error;
    }
}

// Função para fazer o download do arquivo ZIP contendo os PDFs
async function baixarArquivoZIP(zipData) {
    try {
        const downloadLink = document.createElement('a');

        downloadLink.href = URL.createObjectURL(zipData);
        downloadLink.download = 'download_notasfiscais.zip';
        downloadLink.click();
    } catch (error) {
        console.error('Erro ao fazer o download do arquivo ZIP:', error);
        throw error;
    }
}

//Funcão para efetuar o download das notas selecionadas
async function downloadnfe() {
    try {
        let myTable = $('#dt-basic-fot').DataTable();
        let totalPages = myTable.page.info().pages;
        let OtsComErro = "Lista de OT´s( ";
        let dados = [];
        let msgRetorno;

        animationLoadingStart('Gerando o arquivo, aguarde...', 200);

        for (let i = 0; i < totalPages; i++) {
            let nextPage = myTable.page() + 1;

            $(".selected:checked").each(function () {
                let campocheckbox = $(this);
                let idchave = $(campocheckbox).prop("value").split(":");
                let IdResumoOT = idchave[0] || '';
                let ChaveSEFAZ = (idchave[2] === null || idchave[2] === 'null') ? '' : idchave[2];

                if (ChaveSEFAZ?.length > 0) {
                    dados.push({ IdResumoOT, ChaveSEFAZ });
                } else {
                    OtsComErro += `${IdResumoOT}, `
                }
            });

            myTable.page(nextPage).draw('page');
        }

        OtsComErro += ' )';

        if (dados.length <= 0) {
            msgRetorno = 'Nenhuma OT Selecionada, selecione e tente novamente!'

            if ($(".selected:checked")?.length > 0) {
                msgRetorno = 'OT´s Selecionadas Não Possuem Notas Emitidas, verifique e tente novamente!';
            }

            return msgInfo(msgRetorno, OtsComErro);
        }

        let [pdfDataArray, nomeArquivos] = await baixarPDFs(dados).catch((error) => { throw error });
        let zipData = await comprimirPDFs(pdfDataArray, nomeArquivos).catch((error) => { throw error });

        await baixarArquivoZIP(zipData).catch((error) => { throw error });

        msgSuccess('Arquivo Baixado Com Sucesso!');
    } catch (error) {
        let msgRetorno = error?.numNota ? `Erro ao  tentar baixar a nota de numero: ${error?.numNota}` : 'Erro ao tentar baixar o arquivo, recarregue e tente novamente!';

        console.error(error);
        msgError(msgRetorno);
    }
}

// Função para apresentar o Conhecimento de Entrega
async function entrega() {
    try {
        let myTable = await $('#dt-basic-fot').DataTable();
        let totalPages = myTable.page.info().pages;
        let currentPage = myTable.page();
        let dados = [];
        let i = 0;
        let qtdCheck = 0;

        animationLoadingStart();

        await myTable.rows().every(async function () {
            let row = $(this.node());
            let campocheckbox = row.find(".selected:checked");

            if (campocheckbox.length) {
                let idchave = campocheckbox.val().split(":");
                let IdResumoOT = parseInt(idchave[0]);
                let IdStatusOT = parseInt(idchave[3]);

                if (IdStatusOT === 4 || IdStatusOT === 7) {
                    dados.push(IdResumoOT);
                }

                qtdCheck++;
            }
        });
        if (dados.length <= 0) {
            return msgWarning(qtdCheck > 0 ? 'As OT´s Selecionadas Não Estão Aptas Para Impressão do Conhecimeto de Entrega, verifique e tente novamente!' : 'Nenhuma OT Selecionada Para Impressão do Conhecimeto de Entrega, verifique e tente novamente!');;
        }

        let retornoOts = await ajaxGetAllData(`api/expedicao/impressao-entrega.xsjs?id=${dados.join(",")}`, false).catch((error) => { throw error });

        await $.get("expedicao_action_entregamodal.html", (respHtml) => {
            $('#impEntrega').html(respHtml);

            $('#imprimirEntrega').modal('show');
        }).fail((error) => { throw error });

        retornoEntrega(retornoOts);

        animationLoadingStop();

    } catch (error) {
        console.error(error);
        msgError();
    }
}

function retornoEntrega(respostaEntrega) {
    let { data } = respostaEntrega || [];
    let TotalLoja = 0;
    let TotalGeral = 0;
    let nIdEmpAntiga = 0;

    if (data.length > 0) {
        $('#resultadoentrega').append(`
			<div class="ImpressaoEntrega row backCustom" style="border-radius: 5px !important;">
				<div class="col-sm-12 col-xl-12">
					<div class="logogto col-sm-12 col-xl-12"><img src="https://grupotesouradeouro.com.br/assets/images/logo-gto.png" width="133" height="64"></div>
				</div>
				<div class="col-sm-12 col-xl-12 h3 center">
					<div class="conhecimentoEntrega col-sm-12 col-xl-12 text-center" style="text-align: center"><b>Conhecimento Entrega</b></div>
				</div>
            	<div class="col-sm-12 col-xl-12 h3 center">
					<div id="dataImpressao" class="dataImpressao col-sm-12 col-xl-12 text-right" style="text-align: right"><b>Data:</b> ${dataAtual}</div>
					<div id="empresaDestino" class="empresaDestino_0 col-sm-12 col-xl-12 text-left" style="text-align: left"></div>
				</div>
				<div class="cabecalhoEntrega d-flex col-sm-12 col-xl-12 h3 center">
					<div class="cab_numeroOT col-sm-2 col-xl-2 text-center" style="text-align: center">Nº OT</div>
					<div class="cab_numeroNota col-sm-2 col-xl-2 text-center" style="text-align: center">Nota</div>
					<div class="cab_statusNota col-sm-7 col-xl-7 text-center" style="text-align: center">Status Nota</div>
					<div class="cab_volume col-sm-1 col-xl-1 text-center" style="text-align: center">Volumes</div>
				</div>
		`);

        for (let registro of data) {
            let cor_texto = "black";
            let IdResumoOT = registro.IDRESUMOOT;
            let NumeroNotaSEFAZ = registro.NUMERONOTASEFAZ;
            let MsgSEFAZ = registro.MSGSEFAZ;
            let CodRetSEFAZ = registro.CODIGORETORNOSEFAZ;
            let NumTotalVolumes = registro.NUTOTALVOLUMES;
            let IdEmpresaDestino = registro.IDEMPRESADESTINO;
            let DescEmpresaDestino = registro.EMPRESADESTINO;

            if (CodRetSEFAZ != "100") {
                cor_texto = "red";
            }
            if (nIdEmpAntiga == 0) {
                nIdEmpAntiga = IdEmpresaDestino;
                $('.empresaDestino_0').html(`${DescEmpresaDestino}`);
            }

            if (nIdEmpAntiga !== IdEmpresaDestino) {
                $('.ImpressaoEntrega').append(`
					<div class="col-sm-12 col-xl-12 h3 center">
						<div id="totalLoja" class="totalLoja_${nIdEmpAntiga}" col-sm-12 col-xl-12 text-right" style="text-align: right"><b>Total: ${TotalLoja}</b></div>
					</div>
					<div class="col-sm-12 col-xl-12 h3 center">
						<div id="empresaDestino" class="empresaDestino_${nIdEmpAntiga}" col-sm-12 col-xl-12 text-left" style="text-align: left">${DescEmpresaDestino}</div>
					</div>
					<div class="cabecalhoEntrega d-flex col-sm-12 col-xl-12 h3 center">
						<div class="cab_numeroOT col-sm-2 col-xl-2 text-center" style="text-align: center">Nº OT</div>
						<div class="cab_numeroNota col-sm-2 col-xl-2 text-center" style="text-align: center">Nota</div>
						<div class="cab_statusNota col-sm-7 col-xl-7 text-center" style="text-align: center">Status Nota</div>
						<div class="cab_volume col-sm-1 col-xl-1 text-center" style="text-align: center">Volumes</div>
					</div>
				`);

                nIdEmpAntiga = IdEmpresaDestino;
                TotalLoja = 0;
            }

            $('.ImpressaoEntrega').append(`
				<div class="d-flex col-sm-12 col-xl-12 h3 center" id="conteudoEntrega">
					<div class="numeroOT col-sm-2 col-xl-2 text-center" style="text-align: center"><p>${IdResumoOT}</p></div>
					<div class="numeroNota col-sm-2 col-xl-2 text-center" style="text-align: center"><p>${NumeroNotaSEFAZ}</p></div>
					<div class="statusNota col-sm-7 col-xl-7 text-center" style="text-align: center; color: ${cor_texto}"><p>${MsgSEFAZ}</p></div>
					<div class="volume col-sm-1 col-xl-1 text-right" style="text-align: right"><p>${NumTotalVolumes}</p></div>
				</div>
            `);

            TotalLoja += NumTotalVolumes;
            TotalGeral += NumTotalVolumes;
        }

        $('.ImpressaoEntrega').append(`
				<div class="col-sm-12 col-xl-12 h3 center">
					<div id="totalLoja" class="totalLoja_${nIdEmpAntiga}" col-sm-12 col-xl-12 text-right" style="text-align: right"><b>Total: ${TotalLoja}</b></div>
				</div>
				<div class="col-sm-12 col-xl-12 h3 center">
					<div class="totalGeral col-sm-12 col-xl-12 text-right" style="text-align: right"><b>Total Geral: ${TotalGeral}</b></div>
				</div>
				<br>
				<div class="cab_lgerente d-flex col-sm-12 col-xl-12 h3 center">
					<div class="linha_ass_gerente col-sm-6 col-xl-6 text-center" style="text-align: center">_________________________</div>
					<div class="linha_dt_hora_chegada col-sm-6 col-xl-6 text-center" style="text-align: center">_________________________</div>
				</div>
				<div class="cab_gerente d-flex col-sm-12 col-xl-12 h3 center">
					<div class="ass_gerente col-sm-6 col-xl-6 text-center" style="text-align: center">Assinatura Gerente</div>
					<div class="dt_hora_chegada col-sm-6 col-xl-6 text-center" style="text-align: center">Data/Hora Chegada</div>
				</div>
				<br>
				<div class="cab_lmotorista d-flex col-sm-12 col-xl-12 h3 center">
					<div class="linha_ass_motorista col-sm-6 col-xl-6 text-center" style="text-align: center">_________________________</div>
					<div class="linha_dt_hora_saida col-sm-6 col-xl-6 text-center" style="text-align: center">_________________________</div>
				</div>
				<div class="cab_motorista d-flex col-sm-12 col-xl-12 h3 center">
					<div class="ass_motorista col-sm-6 col-xl-6 text-center" style="text-align: center">Assinatura Motorista</div>
					<div class="dt_hora_saida col-sm-6 col-xl-6 text-center" style="text-align: center">Data/Hora Saída</div>
				</div>
				<br>
				<div class="col-sm-12 col-xl-12 h3 center">
					<div class="ocorrencia col-sm-12 col-xl-12 text-left" style="text-align: left">Ocorrências: </div>
				</div>
			</div>

		`);
    }
}

function imprimirEntregaA4() {
    $('text').attr('style', 'font: 15px monospace !important')

    let conteudo = document.getElementById('js-page-content-Entrega').innerHTML;
    let tela_impressao = window.open('about:blank');

    tela_impressao.document.write(`
		<html>
			<head>
				<title>Reconhecimento de Entrega</title>
                <style>
                    *{
                        margin: 5px;
                        padding: 0;
                    }
                    @media print {
                        html,
                        body {
                            width: 210mm;
                            height: auto !important; 
                        }
                        .breadcrumb,
                        .subheader {
                            display: none;
                        }
                        *:not(text) {
                            font-family: Arial, Helvetica, sans-serif !important;
                            font-size: 14pt !important;
                        }
                        .conhecimentoEntrega{
                            text-align: center;
                            text-size: 20px;
                            font-weight: bold;
                        }
                        .cabecalhoEntrega{
                            display: flex;
                        }
                        .cab_numeroOT{
                            width: 150px;
                        }
                        .cab_numeroNota{
                            width: 200px;
                        }
                        .cab_statusNota{
                            width: 500px;
                        }
                        .cab_volume{
                            width: 100px;
                        }
                        #conteudoEntrega{
                            display: flex;
                        }
                        .numeroOT{
                            width: 150px;
                        }
                        .numeroNota{
                            width: 200px;
                        }
                        .statusNota{
                            width: 500px;
                        }
                        .volume{
                            width: 100px;
                        }
                        #empresaDestino{
                            font-weight: bold;
                        }
                        .cab_lgerente{
                            display: flex;
                        }
                        .cab_gerente{
                            display: flex;
                        }
                        .cab_lmotorista{
                            display: flex;
                        }
                        .cab_motorista{
                            display: flex;
                        }
                        .linha_ass_gerente{
                            text-align: center;
                            width: 600px;
                        }
                        .linha_dt_hora_chegada{
                            text-align: center;
                            width: 600px;
                        }
                        .ass_gerente{
                            text-align: center;
                            width: 600px;
                        }
                        .dt_hora_chegada{
                            text-align: center;
                            width: 600px;
                        }
                        .linha_ass_motorista{
                            text-align: center;
                            width: 600px;
                        }
                        .linha_dt_hora_saida{
                            text-align: center;
                            width: 600px;
                        }
                        .ass_motorista{
                            text-align: center;
                            width: 600px;
                        }
                        .dt_hora_saida{
                            text-align: center;
                            width: 600px;
                        }
                    }
                    @page {
                        size: portrait;
                        margin-left: 10px;
                    }
                </style>
			</head>
            <script>
                window.onafterprint = function() {
                    window.close();
                };

                window.document.addEventListener('DOMContentLoaded', function() {
                    window.focus();
                    window.print();
                });
            </script>
			<body>
                ${conteudo}
            </body>
    </html>`);

    tela_impressao.document.close();
    tela_impressao.window.print();
}

//? ============================= FIM ROTINA FATURAMENTO ORDEM DE TRANSFERÊNCIA ============================= //

//? ============================= INICIO ROTINA ORDEM DE TRANSFERÊNCIA DEPOSITO/LOJAS ============================= //
// Leandro Massafera - 10/06/2022
/*
    Autor_atualização: Hendryw Deyvison
    Data: 23/12/2024
*/
async function OrdemTransferencia() {
    try {
        animationLoadingStart();

        await $.get("expedicao_action_ot.html", async (respHtml) => {
            $('#js-page-content').html(respHtml);

        })
            .fail((error) => { throw error });

        $("#idrotina").select2();
        $('#idlojaorigem').prop('disabled', true);


        (IDEmpresaLogin !== 101) && $("#btnliberarpedido").addClass("d-none");

        $("#dtconsultainicio, #dtconsultafim").val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisarot() });

        await ajaxGetAllData('api/informatica/empresa.xsjs', false)
            .then(retornoListaEmpresasSelect)
            .catch((error) => { throw error });


        await ajaxGetAllData('api/expedicao/rotina-movimentacao.xsjs', false)
            .then(retornoListaRotinaSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData(`api/expedicao/resumo-ordem-transferencia.xsjs?idtipofiltro=2&idEmpresaOrigem=${IDEmpresaLogin}`, false)
            .then(retornoListaOTDepLoja)
            .catch((error) => { throw error });

        animationLoadingStop();
    } catch (error) {
        console.error(error);
        msgError();
    }
}

// Retorno das buscas das Ordem de Transferência
function retornoListaOTDepLoja(respostaListaOTDepLoja, stFocus = false) {
    let { data } = respostaListaOTDepLoja || [];
    let dadosTable = [];

    if (data.length > 0) {
        for (let registro of data) {

            let IdResumoOT = registro?.IDRESUMOOT;
            let DataCriacao = registro.DATAEXPEDICAOFORMATADA;
            let IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
            let EmpresaOrigem = registro.EMPRESAORIGEM;
            let EmpresaDestino = registro.EMPRESADESTINO;
            let NumeroNF = registro?.NUMERONOTASEFAZ || '';
            let QtdConferido = parseInt(registro.QTDCONFERENCIA);
            let IdStatusOT = parseInt(registro.IDSTATUSOT);
            let StatusOT = registro.DESCRICAOOT;
            let IdSAPOrigem = registro.IDSAPORIGEM;
            let IdSAPDestino = registro.IDSAPDESTINO;
            let ErrorLogSAP = registro?.ERRORLOGSAP || false;
            let ChaveSEFAZ = registro.CHAVESEFAZ;
            let DescObs = registro.DSOBSERVACAO;
            let DataEntrega = registro.DATAENTREGAFORMATADA;
            let btnimprimirnfe = "disabled";
            let btnchekboxdisabled = "disabled";
            let btnconfitensdisabled = "disabled";
            let btnconfvolumedisabled = "disabled";
            let btnliberarpedidodisabled = "disabled";
            let btncanceldisabled = "";
            let btnnfedisabled = "";
            let btneditardisabled = "";
            let btnfinalizardisabled = "";
            let lConfereItens = registro.CONFEREITENS || 'False';
            let buttons = ``;

            if (IdStatusOT !== 1) {
                btncanceldisabled = "disabled";
                btnnfedisabled = "disabled";
            }

            if (NumeroNF === '') {
                btnfinalizardisabled = "disabled";
                btneditardisabled = "disabled";
            }

            if (IDEmpresaLogin == 101 && [10, 11, 12].indexOf(IdStatusOT) >= 0) {
                if ([10].indexOf(IdStatusOT) >= 0) {
                    if (lConfereItens === "True") {
                        btnchekboxdisabled = "";
                    }
                    btnliberarpedidodisabled = "";
                }
                if ([11].indexOf(IdStatusOT) >= 0) {
                    btnconfitensdisabled = "";
                }
                if ([12].indexOf(IdStatusOT) >= 0) {
                    btnconfvolumedisabled = "";
                }

                buttons += `
					<button type="button" class="btn btn-success btn-xs btn-icon waves-effect waves-themed" title="Ajustar Pedido" id="${IdResumoOT}:${0}:${IdStatusOT}:${DescObs}:${DataEntrega}" onclick="ajustarpedido(this.id)"><i class="fal fa-edit"></i></button>
					<button ${btnliberarpedidodisabled} type="button" class="btn btn-warning btn-xs btn-icon waves-effect waves-themed" title="Liberar Pedido" id="${IdResumoOT}:${lConfereItens}" onclick="liberarpedido(this.id)"><i class="fal fa-check"></i></button>
					<button ${btnconfitensdisabled} type="button" class="btn btn-info btn-xs btn-icon waves-effect waves-themed" title="Conferir Itens" id="${IdResumoOT}:${IdStatusOT}:${DescObs}" onclick="conferiritens(this.id)"><i class="fal fa-check"></i></button>
					<button ${btnconfvolumedisabled} type="button" class="btn btn-secondary btn-xs btn-icon waves-effect waves-themed" title="Conferir Volume" id="${IdResumoOT}:${IdStatusOT}:${DescObs}" onclick="conferirvolume(this.id)"><i class="fal fa-check"></i></button>
					<button type="button" class="btn btn-danger btn-xs btn-icon waves-effect waves-themed" title="Imprimir Etiqueta" id="${IdResumoOT}" onclick="imprimiretiqueta(this.id)"><i class="fal fa-print"></i></button>
			    `;
            } else {
                if (IdEmpresaOrigem === IDEmpresaLogin) {
                    buttons += `
						<button type="button" class="btn btn-success btn-xs btn-icon waves-effect waves-themed" title="Editar / Visualizar" id="${IdResumoOT}:${0}:${IdStatusOT}:${DescObs}:${DataEntrega}" onclick="editarot(this.id)"><i class="fal fa-edit"></i></button>
						<button ${btncanceldisabled} type="button" class="btn btn-danger btn-xs btn-icon waves-effect waves-themed" title="Cancelar" id="${IdResumoOT}" onclick="cancelarot(this.id)"><i class="fal fa-trash"></i></button>
						<button ${btnnfedisabled} type="button" class="btn btn-warning btn-xs btn-icon waves-effect waves-themed" title="Finalizar OT" id="${IdResumoOT}" onclick="salvarvolumeot(this.id)"><i class="fal fa-list"></i></button>
						<button type="button" class="btn btn-secondary btn-xs btn-icon waves-effect waves-themed" title="Imprimir Etiqueta" id="${IdResumoOT}" onclick="imprimiretiqueta(this.id)"><i class="fal fa-print"></i></button>
					`;
                } else {
                    buttons += `
						<button ${btneditardisabled} type="button" class="btn btn-primary btn-xs btn-icon waves-effect waves-themed" title="Conferir OT" id="${IdResumoOT}:${1}:${NumeroNF}:${StatusOT}:${DataCriacao}" onclick="conferirot(this.id)"><i class="fal fa-edit"></i></button>
					`;
                    if ([8, 5].indexOf(IdStatusOT) >= 0) {
                        buttons += `
							<button ${btnfinalizardisabled} type="button" class="btn btn-warning btn-xs btn-icon waves-effect waves-themed" title="Finalizar Recebimento OT" id="${IdResumoOT}:${0}:${NumeroNF}:${StatusOT}:${DataCriacao}:${QtdConferido}" onclick="finalizarot(this.id)"><i class="fal fa-list"></i></button>
						`;
                    }
                }
                if (IdEmpresaOrigem === IDEmpresaLogin) {
                    let colorBtnObs = ErrorLogSAP ? 'danger' : (IdSAPOrigem > 0 && IdSAPDestino > 0) ? 'success' : 'warning';

                    buttons += `
                        <button type="button" class="btn btn-${colorBtnObs} btn-xs btn-icon waves-effect waves-themed" title="Status Nota Fiscal" id="${IdResumoOT}" onclick="observacaoot(this.id)"><i class="fal fa-exclamation"></i></button>
                        <button ${btnimprimirnfe} type="button" class="btn btn-danger btn-xs btn-icon waves-effect waves-themed" title="Imprimir Nota Fiscal" onClick="window.open('http://164.152.244.96:3000/files/NFe${ChaveSEFAZ}.pdf', '_blank');"><i class="fal fa-print"></i></button>
                    `;
                }
            }

            let containerBtnOpcao = `<div class="demo">${buttons}</div>`;

            let chkbox = `
                <div class="custom-control custom-checkbox">
                    <input id="id_${IdResumoOT}" ${btnchekboxdisabled} class='custom-control-input selected' type='checkbox' nname='id_${IdResumoOT}' value='${IdResumoOT}' />
                    <label class="custom-control-label" for="id_${IdResumoOT}"></label>
                </div>
            `;
            //`<input ${btnchekboxdisabled} class='selected' type='checkbox' name='id_${IdResumoOT}' value='${IdResumoOT}'>`

            dadosTable.push([
                chkbox
                , IdResumoOT
                , DataCriacao
                , EmpresaOrigem
                , EmpresaDestino
                , DataEntrega
                , NumeroNF
                , StatusOT
                , containerBtnOpcao
            ]);
        }
    }

    $('#resultadomodalot').html(
        `<table id="dt-basic-ot" class="table table-bordered table-hover table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th></th>
                    <th>Nº OT</th>
                    <th>Data Criação</th>
                    <th>Loja Origem</th>
                    <th>Loja Destino</th>
                    <th>Data Entrega</th>
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
        data: dadosTable,
        "columnDefs": [
            { "width": "2%", "targets": 0, orderDataType: 'checkbox' },
            { "width": "5%", "targets": 1 },
            { "width": "10%", "targets": 2, type: 'date-time-br' },
            { "width": "15%", "targets": 3 },
            { "width": "15%", "targets": 4 },
            { "width": "10%", "targets": 5 },
            { "width": "8%", "targets": 6 },
            { "width": "20%", "targets": 7 },
            { "width": "15%", "targets": 8 }
        ],
        order: [
            [0, 'desc'],
        ],
        deferRender: false,
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
            let idTable = `#${settings.nTable.id}`;

            if (stFocus) {
                $('html, body').animate({
                    scrollTop: $(idTable).offset().top - 70
                }, 1000);

                $(idTable).find('tbody td:first').focus()
            }

        },
    });

}

function pesquisarot() {
    try {
        let idlojadestino = $("#idlojadestino").val() || '';
        let datapesqinicio = $("#dtconsultainicio").val() || '';
        let datapesqfim = $("#dtconsultafim").val() || '';
        let idrotina = $("#idrotina").val() || '';
        let datainientrega = $("#datainientrega").val() || '';
        let datafinentrega = $("#datafinentrega").val() || '';

        ajaxGetAllData(`api/expedicao/resumo-ordem-transferencia.xsjs?idtipofiltro=2&idEmpresaOrigem=${IDEmpresaLogin}&idEmpresaDestino=${idlojadestino}&datapesqinicio=${datapesqinicio}&datapesqfim=${datapesqfim}&idrotina=${idrotina}&dtinient=${datainientrega}&dtfiment=${datafinentrega}`)
            .then((resp) => retornoListaOTDepLoja(resp, true))
            .catch((error) => { throw error });

    } catch (error) {
        console.error(error);
        msgError();
    }

}

// Editar a Ordem de Transferência que está na Origem
async function editarot(id) {
    try {
        idchave = id.split(":");
        nIdResumoOT = idchave[0];
        nConferir = parseInt(idchave[1]);
        nIdStatusOT = parseInt(idchave[2]);
        cDescObs = idchave[3];
        dDataEntrega = idchave[4];
        dataRetornoDetalheOT = [];

        nBtnSalvar = 2; // Alterando o botão salvar para update
        nConfSalvar = 1;
        id = nIdResumoOT;

        animationLoadingStart();

        await $.get('expedicao_action_incluirot_modal.html', function (res) {

            $('#resultadoot').html(res);

            $('#ot').on({
                'shown.bs.modal': function () {

                    var idx = $('.modal:visible').length;

                    $(this).css('z-index', 1040 + (10 * idx));
                    var url = $(this).find('[data-url]').data('url');
                    if (url != undefined && url != '') {
                        var id = $(this).attr('id');
                        $('#' + id + ' .modal-body').load(url);
                    }
                },
                'shown.bs.modal': function () {
                    var idx = ($('.modal:visible').length) - 1; // raise backdrop after animation.
                    $('.modal-backdrop').not('.stacked')
                        .css('z-index', 1040 + (10 * idx))
                        .addClass('stacked');
                },
                'hidden.bs.modal': function () {
                    if ($('.modal:visible').length > 0) {
                        // restore the modal-open class to the body element, so that scrolling works
                        // properly after de-stacking a modal.
                        setTimeout(function () {
                            $(document.body).addClass('modal-open');
                        }, 0);
                    }
                }

            });

            $("#idlojaorigemmodal").select2({
                dropdownParent: $("#ot")
            });
            $("#idlojadestinomodal").select2({
                dropdownParent: $("#ot")
            });

            $('#descProduto').focus();
            $("#descobservacao").val(cDescObs);
            $("#dataentrega").val(dDataEntrega).prop('disabled', true);

            if (nIdStatusOT != 1) {
                $("#descProduto, #salvarot, #descobservacao").prop("disabled", true);
            }

            $("#ot").modal('show');
        }).fail((error) => { throw error });

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(retornoListaEmpresasModalSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData(`api/expedicao/detalhe-ordem-transferencia.xsjs?id=${id}`, false)
            .then(retornoListaDetalheOT)
            .catch((error) => { throw error });

        animationLoadingStop();

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaDetalheOT(respostaListaDetalheOT) {
    let { data } = respostaListaDetalheOT || [];
    let dadosTable = [];
    let IdEmpresaOrigem;
    let IdEmpresaDestino;

    for (let registro of data) {

        let IdResumoOT = registro.IDRESUMOOT;
        let CodigoProduto = registro.IDPRODUTO;
        let CodigoBarras = registro.NUCODBARRAS;
        let DescProduto = registro.DSNOME;
        let PrecoVenda = registro.VLRUNITVENDA;
        let PrecoCusto = registro.VLRUNITCUSTO;
        let QtdProduto = registro.QTDEXPEDICAO;
        let BtnOpcao;

        IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
        IdEmpresaDestino = registro.IDEMPRESADESTINO;

        if (nIdStatusOT === 1) {
            BtnOpcao = `
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${CodigoBarras}" onclick="diminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoBarras}" onclick="excluirProduto(this.id)"><i class="fal fa-trash"></i></button>
            `;
        } else {
            nBtnSalvar = 3; // Alterando o botão salvar, já que o registro está cancelado
        }

        dadosTable.push([
            CodigoProduto
            , CodigoBarras
            , DescProduto
            , PrecoVenda
            , QtdProduto
            , BtnOpcao
        ]);
    }

    $('#tabelaprodutos').DataTable({
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "12%", "targets": 4 },
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

    $("#idlojaorigemmodal").val(IdEmpresaOrigem).trigger('change').prop("disabled", true);
    $("#idlojadestinomodal").val(IdEmpresaDestino).trigger('change').prop("disabled", true);
}

async function pesqProduto() {
    try {
        let nIdEmpresa = $("#idlojaorigemmodal").val();

        if (parseInt(nIdEmpresa) <= 0 || parseInt($("#idlojadestinomodal").val()) <= 0) {
            return msgInfo('A Loja de Origem e Destino devem ser Preenchidas!')
                .then(() => setTimeout(() => $('#descProduto').val("").focus(), 300));
        }

        let myTable = $('#tabelaprodutos').DataTable();
        let descProduto = $('#descProduto').val();
        let cont = 0;

        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == descProduto) {
                if (myTable.cell(node._DT_CellIndex.row, 4).nodes().to$().find('input').val() !== undefined) {
                    let nValorAnterior = myTable.cell(node._DT_CellIndex.row, 4).nodes().to$().find('input').val();
                    myTable.cell(node._DT_CellIndex.row, 4).nodes().to$().find('input').val((parseInt(nValorAnterior) + 1).toString());
                } else {
                    myTable.cell(node._DT_CellIndex.row, 4).data(parseInt(myTable.cell(node._DT_CellIndex.row, 4).data()) + 1);
                }

                cont++;

                $('#descProduto').val("").focus();
            }
        });

        if (cont === 0) {
            $('#descProduto').prop("disabled", true);

            ajaxGetAllData(`api/expedicao/produto.xsjs?idEmpresa=${nIdEmpresa}&id=${descProduto}`)
                .then(RetornoListaProduto)
                .catch((error) => { throw error });
        }
    } catch (error) {
        console.error(error);
        msgError('Erro ao tentar adicionar o produto!');
    }
}

function RetornoListaProduto(respostaListaProduto) {
    let { data } = respostaListaProduto || [];
    let myTable = $('#tabelaprodutos').DataTable();

    if (data.length > 0) {

        let CodigoProduto = data[0].IDPRODUTO;
        let CodigoBarras = data[0].NUCODBARRAS;
        let DescProduto = data[0].DSNOME;
        let PrecoVenda = data[0].PRECOVENDA;
        let PrecoCusto = data[0].PRECOCUSTO;

        let BtnOpcao = `
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${CodigoBarras}" onclick="diminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoBarras}" onclick="excluirProduto(this.id)"><i class="fal fa-trash"></i></button>
        `;

        let newRowTable = [
            CodigoProduto,
            CodigoBarras,
            DescProduto,
            PrecoVenda,
            1,
            BtnOpcao
        ];

        myTable.row.add(newRowTable).draw(false);
    }

    $('#idlojaorigemmodal, #idlojadestinomodal').prop("disabled", true)
    $('#descProduto').val("").focus().prop("disabled", false);
}

function diminuirProduto(id) {
    let myTable = $('#tabelaprodutos').DataTable();

    myTable.column(1).nodes().each(function (node, index, dt) {
        if (myTable.cell(node).data() == id) {
            if (myTable.cell(node._DT_CellIndex.row, 4).data() > 1) {
                myTable.cell(node._DT_CellIndex.row, 4).data(parseInt(myTable.cell(node._DT_CellIndex.row, 4).data()) - 1);
            } else {
                myTable.row(node._DT_CellIndex.row).remove().draw(false);
            }
        }
    });
}

function excluirProduto(id) {
    let myTable = $('#tabelaprodutos').DataTable();

    myTable.column(1).nodes().each(function (node, index, dt) {
        if (myTable.cell(node).data() == id) {
            myTable.row(node._DT_CellIndex.row).remove().draw(false);
        }
    });

    $('#descProduto').val("").focus();
}

function abrirPesqProduto() {
    $("#abrirpesqproduto").modal('show');
}

function pesquisarProduto() {
    let nIdLojaOrigem = parseInt($("#idlojaorigemmodal").val());
    let descProduto = $("#pesqProduto").val();

    ajaxGetAllData(`api/expedicao/produto.xsjs?idEmpresa=${nIdLojaOrigem}&descProduto=${descProduto}`)
        .then(retornoPesqListaProduto)
        .catch((error) => {
            console.error(error);
            msgError();
        });

}

function retornoPesqListaProduto(respostaPesqListaProduto) {
    let { data } = respostaPesqListaProduto || [];
    let dadosTable = [];

    for (let registro of data) {
        let CodigoProduto = registro.IDPRODUTO;
        let CodigoBarras = registro.NUCODBARRAS;
        let DescProduto = registro.DSNOME;
        let PrecoVenda = registro.PRECOVENDA;
        let inputQtd = `<input type="number" class="form-control" id="qtd:${CodigoBarras}" value="0"><span style="display: none;">0</span>`
        let btnLinha = `<button type="button" class="btn btn-outline-success btn-xs btn-icon waves-effect waves-themed" title="Confirmar" id="${CodigoBarras}" onclick="confirmarProduto(this.id)"><i class="fal fa-check"></i></button>`

        dadosTable.push([
            CodigoProduto
            , CodigoBarras
            , DescProduto
            , PrecoVenda
            , inputQtd
            , btnLinha
        ]);
    }

    $('#resultado').html(
        `<table id="dt-basic-produto" class="table table-bordered table-hover table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th>Produto</th>
                    <th>Cód. Barras</th>
                    <th>Descrição</th>
                    <th>R$ Venda</th>
                    <th>Qtd</th>
                    <th>Opções</th>
                </tr>
            </thead>
        </table>`
    );

    $('#dt-basic-produto').DataTable({
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "10%", "targets": 4 },
            { "width": "12%", "targets": 5 }
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
    let nPrecoVenda = 0;
    let nQtd = 0;
    let cont = 0;

    cCodProduto = tabelaresultado.rows().data()[0][0];
    cDescProduto = tabelaresultado.rows().data()[0][2];
    nPrecoVenda = tabelaresultado.rows().data()[0][3];
    nQtd = parseInt(document.getElementById('qtd:' + id).value);

    let newRowTable = [
        cCodProduto,
        id,
        cDescProduto,
        nPrecoCusto,
        nPrecoVenda,
        nQtd,
        BtnOpcao
    ];

    if (nQtd <= 0) {
        return msgWarning('Atenção!', 'Favor preencher a Quantidade do Produto com um valor Maior que Zero ( 0 )!');
    }

    $("#abrirpesqproduto").modal('hide');

    var myTable = $('#tabelaprodutos').DataTable();

    BtnOpcao = `<button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="` + id + `" onclick="diminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
				<button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="`+ id + `" onclick="excluirProduto(this.id)"><i class="fal fa-trash"></i></button>`;

    if (myTable.rows().count() > 0) {
        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == id) {
                myTable.cell(node._DT_CellIndex.row, 4).data(parseInt(myTable.cell(node._DT_CellIndex.row, 4).data()) + nQtd);
                cont++;
            }
        });
        if (cont === 0) {
            myTable.row.add(newRowTable).draw(false);
        }
    } else {
        myTable.row.add(newRowTable).draw(false);
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
        let dadosdetalheot = [];
        let nCtTotalItens = 0;
        let nQtdTotalItens = 0;
        let dVlrTotalVenda = 0;

        let qtdLinhas = parseInt($("#descQtdLinha").val());

        let myTable = $('#tabelaprodutos').DataTable();
        let countRows = myTable.rows().count();

        if (countRows === 0 || countRows > qtdLinhas) {
            let msgRetorno = countRows === 0 ? 'Informar os produtos da OT!' : `A OT não pode conter mais de ${qtdLinhas} tipos de produtos!`;

            return msgWarning('Atenção!', msgRetorno);
        }

        $("#ot").modal('hide');

        for (var i = 0; i < myTable.rows().count(); i++) {

            cIdProduto = myTable.rows().cell(i, 0).data();

            if (nConfSalvar === 1) {
                nQtdProduto = parseInt(myTable.rows().cell(i, 4).data());
                nConfSalvar === 0;
            } else {
                nQtdProduto = parseInt(myTable.rows().cell(i, 4).nodes().to$().find('input').val());
            }

            nVlrVenda = parseFloat(myTable.rows().cell(i, 3).data());

            dadosdetalheot.push({
                "IDPRODUTO": cIdProduto
                , "QTDEXPEDICAO": nQtdProduto
                , "QTDRECEPCAO": 0
                , "QTDDIFERENCA": 0
                , "QTDAJUSTE": 0
                , "VLRUNITVENDA": nVlrVenda
                , "VLRUNITCUSTO": 0
                , "STCONFERIDO": 'False'
                , "IDUSRAJUSTE": 0
                , "STATIVO": 'True'
                , "STFALTA": 'False'
                , "STSOBRA": 'False'
            });

            nCtTotalItens++;
            nQtdTotalItens = nQtdTotalItens + nQtdProduto;
            dVlrTotalVenda = dVlrTotalVenda + (nQtdProduto * nVlrVenda);
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
            , "VRTOTALCUSTO": 0
            , "VRTOTALVENDA": dVlrTotalVenda
            , "DTRECEPCAO": ""
            , "IDOPERADORRECEPTOR": 0
            , "DSOBSERVACAO": $("#descobservacao").val()
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
            , "CONFEREITENS": 'False'
            , "IDROTINA": 1
            , "DATAENTREGA": $("#dataentrega").val()
        }];

        if (nBtnSalvar === 1) {
            await ajaxPost("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                .catch((error) => { throw error });

        } else if (nBtnSalvar === 2) {
            await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                .catch((error) => { throw error });

        }

        await msgSuccess('Salvo/Alterado com Sucesso!', undefined, false);

        OrdemTransferencia();

    } catch (error) {
        console.log(error);
        msgError('Erro ao tentar salvar os dados');
    }
}

// Função para Preencher a Quantidade e Descrição dos Volumes da OT
async function salvarvolumeot(id, situacao) {
    try {
        animationLoadingStart();

        await $.get('conferenciacega_action_salvarvolumeot.html', function (res) {

            $('#resultadovolumeot').html(res);

            if (situacao === 1) {
                $('#confitens').prop("disabled", true);
            } else {
                if (IDEmpresaLogin === 101) {
                    $('#qtdvolume, #descvolume').prop("disabled", true);
                } else {
                    $('#confitens').prop("disabled", true);
                }
            }

            $("#footervolumeot").html(`
                <button type="button" class="btn btn-success" id="${id}:${situacao}:" onclick="emitirnfe(this.id)">Salvar</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
            `);

            $("#volumeot").modal('show');
        }).fail((error) => { throw error });

        animationLoadingStop();

    } catch (error) {
        console.log(error);
        msgError();
    }

}

// Emiti a Nota Fiscal da Ordem de Transferência e libera para Conferência no Destino
function emitirnfe(id) {

    idchave = id.split(":");
    id = idchave[0];
    situacao = parseInt(idchave[1]);

    let confitens = $("input[name=confitens]:checked").val();
    let qtdvolume = Number($("#qtdvolume").val() || 0);
    let descvolume = $("#descvolume").val();

    if (IDEmpresaLogin !== 101) {
        let msgRetorno = '';

        if (qtdvolume <= 0 || descvolume) {
            msgRetorno = qtdvolume <= 0 ? 'Necessário preencher a Quantidade!' : 'Necessário preencher a Descrição!';

            return msgWarning('Atenção', msgRetorno);
        }
    }

    let dados = [{
        "IDSTATUSOT": parseInt(3)
        , "IDRESUMOOT": parseInt(id)
        , "IDEMPRESAORIGEM": parseInt(IDEmpresaLogin)
        , "NUTOTALVOLUMES": parseInt(qtdvolume)
        , "TPVOLUME": descvolume
        , "NOTAFISCAL": parseInt(0)
        , "CONFEREITENS": confitens
        , "IDSITUACAO": situacao
    }];

    Swal.fire({
        title: 'Deseja Finalizar a OT?',
        type: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, quero Finalizar!',
        cancelButtonText: 'Não'
    }).then(async (result) => {
        try {
            if (result.value == true) {

                $("#volumeot").modal('hide');

                animationLoadingStart('Finalizando OT, aguarde...', 300, false);

                await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                    .catch((error) => { throw error });

                await msgSuccess('OT Finalizada com sucesso!', undefined, false);

                OrdemTransferencia();
            }
        } catch (error) {
            console.log(error);
            msgError('Erro ao tentar emitir a Nota Fiscal da OT!');
        }
    })
}

// Cancelar a Ordem de Transferência que está na Origem
function cancelarot(id) {

    let dados = [{
        "IDSTATUSOT": parseInt(2)
        , "IDRESUMOOT": parseInt(id)
        , "IDUSRCANCELAMENTO": parseInt(IDFuncionarioLogin)
    }];

    Swal.fire({
        title: 'Deseja realmente CANCELAR essa OT?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, quero Cancelar!',
        cancelButtonText: 'Não'
    }).then(async (result) => {
        try {
            if (result.value == true) {
                animationLoadingStart('Cancelando a OT, aguarde...', 300, false);

                await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                    .catch((error) => { throw error });

                await msgSuccess('OT Cancelada com sucesso!', undefined, false);

                OrdemTransferencia();
            }
        } catch (error) {
            console.log(error);
            msgError('Erro ao tentar Cancelar a OT!');
        }
    })
}

async function incluirot() {
    try {
        nIdResumoOT = 0;
        nBtnSalvar = 1;
        nConfSalvar = 1;

        animationLoadingStart();

        await $.get('expedicao_action_incluirot_modal.html', function (res) {

            $('#resultadoot').html(res);
            $("#ot").draggable({
                handle: ".modal-header"
            });

            $('#ot').on({
                'shown.bs.modal': function () {
                    `<input type="text" id="btnsalvar" name="btnsalvar" class="form-control input" value="1">`
                    var idx = $('.modal:visible').length;
                    $(this).css('z-index', 1040 + (10 * idx));
                    var url = $(this).find('[data-url]').data('url');
                    if (url != undefined && url != '') {
                        var id = $(this).attr('id');
                        $('#' + id + ' .modal-body').load(url);
                    }
                },
                'shown.bs.modal': function () {
                    var idx = ($('.modal:visible').length) - 1; // raise backdrop after animation.
                    $('.modal-backdrop').not('.stacked')
                        .css('z-index', 1040 + (10 * idx))
                        .addClass('stacked');
                },
                'hidden.bs.modal': function () {
                    if ($('.modal:visible').length > 0) {
                        // restore the modal-open class to the body element, so that scrolling works
                        // properly after de-stacking a modal.
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

            $("#idlojaorigemmodal").select2({
                dropdownParent: $("#ot")
            });
            $("#idlojadestinomodal").select2({
                dropdownParent: $("#ot")
            });

            $("#ot").modal('show');
        }).fail((error) => { throw error });

        $("#dataentrega").valueAsDate = new Date();

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(retornoListaEmpresasModalSelect)
            .catch((error) => { throw error });

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError('')
    }
}

//? ============================= FIM ROTINA ORDEM DE TRANSFERENCIA ============================= //

//? ============================= INICIO ROTINA EXPEDICAO WEB ============================= //
// Ajustar a Quantidade dos Pedidos
// Leandro Massafera - 10/06/2022
/*
    Autor_atualização: Hendryw Deyvison
    Data: 23/12/2024
*/
async function ajustarpedido(id) {
    try {
        idchave = id.split(":");
        nIdResumoOT = idchave[0];
        nConferir = parseInt(idchave[1]);
        nIdStatusOT = parseInt(idchave[2]);
        cDescObs = idchave[3];
        dDataEntrega = idchave[4];
        dataRetornoDetalheEW = [];

        nBtnSalvar = 2; // Alterando o botão salvar para update
        id = nIdResumoOT;

        animationLoadingStart();

        await $.get('expedicao_action_incluirot_modal.html', function (res) {

            $('#resultadoot').html(res);

            $('#ot').on({
                'shown.bs.modal': function () {

                    var idx = $('.modal:visible').length;

                    $(this).css('z-index', 1040 + (10 * idx));
                    var url = $(this).find('[data-url]').data('url');
                    if (url != undefined && url != '') {
                        var id = $(this).attr('id');
                        $('#' + id + ' .modal-body').load(url);
                    }
                },
                'shown.bs.modal': function () {
                    var idx = ($('.modal:visible').length) - 1; // raise backdrop after animation.
                    $('.modal-backdrop').not('.stacked')
                        .css('z-index', 1040 + (10 * idx))
                        .addClass('stacked');
                },
                'hidden.bs.modal': function () {
                    if ($('.modal:visible').length > 0) {
                        // restore the modal-open class to the body element, so that scrolling works
                        // properly after de-stacking a modal.
                        setTimeout(function () {
                            $(document.body).addClass('modal-open');
                        }, 0);
                    }
                }

            });

            $("#idlojaorigemmodal").select2({
                dropdownParent: $("#ot")
            });
            $("#idlojadestinomodal").select2({
                dropdownParent: $("#ot")
            });

            $("#ot").modal('show');
        }).fail((error) => { throw error });

        if (nIdStatusOT != 10) {
            $("#descProduto").prop("disabled", true);
            $("#salvarot").prop("disabled", true);
            $("#descobservacao").prop("disabled", true);
        }

        $('#descProduto').focus();
        $("#descobservacao").val(cDescObs);
        $("#dataentrega").val(dDataEntrega).prop('disabled', true);

        await ajaxGetAllData('api/empresa.xsjs', false)
            .then(retornoListaEmpresasModalSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData(`api/expedicao/detalhe-ordem-transferencia.xsjs?id=${id}`, false)
            .then(retornoListaDetalheEW)
            .catch((error) => { throw error });

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaDetalheEW(respostaListaDetalheEW) {
    let { data } = respostaListaDetalheEW;
    let dadosTable = [];
    let IdEmpresaOrigem;
    let IdEmpresaDestino;

    if (respostaListaDetalheEW.data.length != 0) {

        for (let registro of data) {
            let IdResumoOT = registro.IDRESUMOOT;
            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = registro.VLRUNITVENDA;
            let PrecoCusto = registro.VLRUNITCUSTO;
            let QtdProduto = registro.QTDEXPEDICAO;
            let qtdAjuste = `<input type="number" class="form-control" id="qtd:` + CodigoProduto + `" value="` + QtdProduto + `"><span style="display: none;">` + QtdProduto + `</span>`//QtdAjuste
            let BtnOpcao = '';

            IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
            IdEmpresaDestino = registro.IDEMPRESADESTINO;

            dadosTable.push([
                CodigoProduto
                , CodigoBarras
                , DescProduto
                , PrecoVenda
                , qtdAjuste
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
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "12%", "targets": 4 },
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

function liberarpedido(id) {
    let dados = [];
    let idchave = id?.split(":") || 0;
    let nIdResumoOT = parseInt(idchave[0] || 0);
    let lConfereItens = idchave[1] || 0;
    let stUpdateVariasOts = (nIdResumoOT == 0);

    id = nIdResumoOT;

    if (stUpdateVariasOts) {
        let myTable = $('#dt-basic-ot').DataTable();

        myTable.rows().every(function () {
            let row = $(this.node());
            let campocheckbox = row.find(".selected:checked");

            if (campocheckbox.prop("checked")) {
                let idchave = campocheckbox.prop("value").split(":");
                let IdResumoOT = parseInt(idchave[0]);

                dados.push({
                    "IDSTATUSOT": parseInt(10)
                    , "IDRESUMOOT": parseInt(IdResumoOT)
                });
            }
        });

    } else {
        dados.push({
            "IDSTATUSOT": parseInt(10)
            , "IDRESUMOOT": parseInt(id)
        });
    }

    if (dados.length > 0) {
        let plural = dados.length > 1 ? 's' : '';

        Swal.fire({
            title: `Deseja Liberar o Pedido${plural}?`,
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Sim, quero Liberar o${plural} Pedido${plural}!`,
            cancelButtonText: 'Não'
        }).then(async (result) => {
            try {
                if (result.value == true) {
                    animationLoadingStart(`Liberando Pedido${plural}, aguarde...`, 300, false);

                    await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados).catch((error) => { throw error });

                    await msgSuccess(`Liberado${plural} com Sucesso!`, undefined, false);

                    if (!stUpdateVariasOts && lConfereItens === 'False') {
                        salvarvolumeot(id, 1);
                    } else {
                        OrdemTransferencia();
                    }
                }
            } catch (error) {
                console.log(error);
                msgError(`Erro ao tentar liberar o${plural} Pedido${plural}`);
            }
        })
    } else {
        return msgInfo('Não há nenhuma OT selecionada para Liberar, verifique e tente novamente!');
    }

}

async function conferiritens(id) {
    try {
        idchave = id.split(":");
        nIdResumoOT = idchave[0];
        nIdStatusOT = parseInt(idchave[1]);
        cDescObs = idchave[2];

        nBtnSalvar = 2; // Alterando o botão salvar para update
        id = nIdResumoOT;

        await $.get('expedicao_action_conferirot_modal.html', function (res) {

            $('#resultadoot').html(res);

            $('#ot').on({
                'shown.bs.modal': function () {

                    var idx = $('.modal:visible').length;

                    $(this).css('z-index', 1040 + (10 * idx));
                    var url = $(this).find('[data-url]').data('url');
                    if (url != undefined && url != '') {
                        var id = $(this).attr('id');
                        $('#' + id + ' .modal-body').load(url);
                    }
                },
                'shown.bs.modal': function () {
                    var idx = ($('.modal:visible').length) - 1; // raise backdrop after animation.
                    $('.modal-backdrop').not('.stacked')
                        .css('z-index', 1040 + (10 * idx))
                        .addClass('stacked');
                },
                'hidden.bs.modal': function () {
                    if ($('.modal:visible').length > 0) {
                        // restore the modal-open class to the body element, so that scrolling works
                        // properly after de-stacking a modal.
                        setTimeout(function () {
                            $(document.body).addClass('modal-open');
                        }, 0);
                    }
                }

            });

            $("#idlojaorigemmodal").select2({
                dropdownParent: $("#ot")
            });
            $("#idlojadestinomodal").select2({
                dropdownParent: $("#ot")
            });

            $("#ot").modal('show');
        }).fail((error) => { throw error });

        $('#descProduto').focus();
        $("#descobservacao").val(cDescObs).prop('disabled', (nIdStatusOT != 10));

        await ajaxGetAllData('api/informatica/empresa.xsjs')
            .then(retornoListaEmpresasModalSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData(`api/expedicao/detalhe-ordem-transferencia.xsjs?id=${id}`, false)
            .then(retornoListaDetalheConfItens)
            .catch((error) => { throw error });

    } catch (error) {
        console.error(error);
        msgError();
    }

}

function retornoListaDetalheConfItens(respostaListaDetalheConfItens) {
    let { data } = respostaListaDetalheConfItens || [];
    let dadosTable = []
    let BtnOpcao = "";
    let IdEmpresaOrigem;
    let IdEmpresaDestino;

    if (data.length != 0) {

        for (let registro of data) {
            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = registro.VLRUNITVENDA;
            let QtdProduto = registro.QTDEXPEDICAO;
            let QtdConferida = registro.QTDCONFERIDA || 0;

            IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
            IdEmpresaDestino = registro.IDEMPRESADESTINO;

            dadosTable.push([
                CodigoProduto
                , CodigoBarras
                , DescProduto
                , PrecoVenda
                , QtdProduto
                , QtdConferida
                , BtnOpcao
            ]);
        }
    }

    $("#idlojaorigemmodal").val(IdEmpresaOrigem);
    $("#idlojadestinomodal").val(IdEmpresaDestino);
    $("#idlojaorigemmodal, #idlojadestinomodal").prop("disabled", true).trigger('change');

    $('#tabelaprodutos').DataTable({
        data: dadosTable,
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "10%", "targets": 1 },
            { "width": "38%", "targets": 2 },
            { "width": "10%", "targets": 3 },
            { "width": "12%", "targets": 4 },
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

function confpesqProduto() {
    let myTable = $('#tabelaprodutos').DataTable();
    let descProduto = $('#descProduto').val();
    let nIdEmpresa = $("#idlojaorigemmodal").val();
    let cont = 0;

    if (parseInt($("#idlojaorigemmodal").val()) <= 0 || parseInt($("#idlojadestinomodal").val()) <= 0) {
        return msgInfo('A Loja de Origem e Destino devem ser Preenchidas!')
            .then(() => setTimeout(() => { $('#descProduto').val("").focus(); }, 300))
    }

    myTable.column(1).nodes().each(function (node, index, dt) {
        if (myTable.cell(node).data() == descProduto) {
            myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) + 1);
            cont++;
            $('#descProduto').val("").focus();
        }
    });
}

// Salvar a Conferência dos Itens
async function salvarconfot() {
    try {
        let dadosdetalheot = [];
        let nQtdTotalConferida = 0;
        let myTable = $('#tabelaprodutos').DataTable();

        $("#ot").modal('hide');

        for (let i = 0; i < myTable.rows().count(); i++) {

            cIdProduto = myTable.rows().cell(i, 0).data();
            nQtdConferida = parseInt(myTable.rows().cell(i, 5).data());

            dadosdetalheot[i] = {
                "IDPRODUTO": cIdProduto
                , "QTDCONFERIDA": nQtdConferida
            };
            nQtdTotalConferida = nQtdTotalConferida + nQtdConferida;
        }

        let dados = [{
            dadosdetalheot
            , "IDRESUMOOT": parseInt(nIdResumoOT)
            , "IDSTATUSOT": parseInt(11)
            , "QTDTOTALCONFERIDA": nQtdTotalConferida
            , "IDUSRCONFERIDA": IDFuncionarioLogin
        }];

        await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
            .catch((error) => { throw error });

        await msgSuccess("Salvo com Sucesso!");

        OrdemTransferencia();
    } catch (error) {
        console.log(error);
        msgError('Erro ao salvar!');
    }
}

// Finalizar a Conferência dos Itens
async function finalizarconfot() {
    try {
        let dadosdetalheot = [];
        let nQtdTotalConferida = 0;
        let lValidaConf = 'False';

        let myTable = $('#tabelaprodutos').DataTable();

        for (let i = 0; i < myTable.rows().count(); i++) {

            let cIdProduto = myTable.rows().cell(i, 0).data();
            let nQtdExpedicao = parseInt(myTable.rows().cell(i, 4).data());
            let nQtdConferida = parseInt(myTable.rows().cell(i, 5).data());

            if (nQtdExpedicao != nQtdConferida) {
                lValidaConf = 'True';
                nQtdConferida = 0;
            }

            dadosdetalheot[i] = {
                "IDPRODUTO": cIdProduto
                , "QTDCONFERIDA": nQtdConferida
            };

            nQtdTotalConferida += nQtdConferida;
        }

        let dados = [{
            dadosdetalheot
            , "IDRESUMOOT": parseInt(nIdResumoOT)
            , "IDSTATUSOT": parseInt(12)
            , "QTDTOTALCONFERIDA": nQtdTotalConferida
            , "IDUSRCONFERIDA": IDFuncionarioLogin
            , "LVALIDACONF": lValidaConf
        }];

        if (lValidaConf === 'True') {
            await msgQuestion('Existem Divergências na Conferências dos Itens! Deseja Realmente Continuar?')
                .then(async (result) => {
                    if (result?.value == true) {
                        animationLoadingStart('Enviando dados, aguarde....', 300, false);

                        $("#ot").modal('hide');

                        await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                            .catch((error) => { throw error });

                        await msgWarning("Divergência na Conferência!");

                        OrdemTransferencia();

                    }
                })
        } else {
            animationLoadingStart('Enviando dados, aguarde....', 300, false);

            $("#ot").modal('hide');

            await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                .catch((error) => { throw error });

            await msgSuccess("Salvo com Sucesso!");
            salvarvolumeot(nIdResumoOT, 1);

        }

    } catch (error) {
        console.log(error);
        msgError('Erro ao finalizar!');
    }
}

async function conferirvolume(id) {
    try {
        idchave = id.split(":");
        id = idchave[0];
        nIdStatusOT = parseInt(idchave[1]);
        cDescObs = idchave[2];

        dataRetornoConferirVolumeOT = [];
        numPage = 1;

        animationLoadingStart();

        await $.get('expedicao_action_conferirvolume_modal.html', async (res) => {
            $('#resultadoconferirvolumeot').html(res);

            $("#footerconferirvolumeot").html(`
                <button type="button" class="btn btn-success" id="${id}" onclick="finalizarconferirvolumeot(this.id)">Finalizar Conferência</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
            `);

            $("#conferirvolumeot").modal('show');
        })
            .fail((error) => { throw error });

        await ajaxGetAllData('api/expedicao/confere-volume-ot.xsjs?id=' + id, false)
            .then(retornoListaConferirVolumeOT)
            .catch((error) => { throw error });

        animationLoadingStop();

    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function retornoListaConferirVolumeOT(respostaListaConferirVolumeOT) {
    let { data } = respostaListaConferirVolumeOT || [];
    let dadosTable = [];
    let BtnOpcao = "";

    if (data?.length > 0) {

        for (let registro of data) {
            let IdResumoOT = registro.IDRESUMOOT;
            let NumeroVolume = registro.NUMEROVOLUME;

            dadosTable.push([
                IdResumoOT
                , NumeroVolume
                , ''
            ]);
        }

        $('#tabelaconferirvolumeot').DataTable({
            data: dadosTable,
            "columnDefs": [
                { "width": "35%", "targets": 0 },
                { "width": "35%", "targets": 1 },
                { "width": "30%", "targets": 2 }
            ],
            deferRender: true,
            responsive: true,
            /*dom:"<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            /*buttons: [
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
            ]*/
        });

    }
}

function pesqCodigoBarras() {
    let myTable = $('#tabelaconferirvolumeot').DataTable();
    let descCodigoBarras = $('#descCodigoBarras').val();
    let cont = 0;
    let IdResumoOT;
    let numVolume;

    myTable.column(1).nodes().each(function (node, index, dt) {
        IdResumoOT = String(myTable.cell(node._DT_CellIndex.row, 0).data());
        numVolume = String(myTable.cell(node._DT_CellIndex.row, 1).data());

        let codBarrasVolume = IdResumoOT + numVolume;

        if (codBarrasVolume == descCodigoBarras) {
            myTable.cell(node._DT_CellIndex.row, 2).data("Sim");
            cont++;

            $('#descCodigoBarras').val("").focus();
        }
    });

    if (cont === 0) {
        numVolume = descCodigoBarras.substring(IdResumoOT.toString().length);

        let rowTable = [
            IdResumoOT,
            numVolume,
            "Não"
        ];

        $('#descCodigoBarras').prop("disabled", true);

        myTable.row.add(rowTable).draw(false);

        $('#descCodigoBarras').val("").prop("disabled", false).focus();;
    }
}

// Finalizar a Conferência dos Volumes
async function finalizarconferirvolumeot() {
    try {
        let myTable = $('#tabelaconferirvolumeot').DataTable();
        let lValidaConf = 'False';
        let nQtdTotalVolumeConferido = 0;
        let idStatus = 13;
        let autorizaProxPasso = true;
        let nIdResumoOT;

        for (var i = 0; i < myTable.rows().count(); i++) {
            let cConfere = myTable.rows().cell(i, 2).data();

            nIdResumoOT = myTable.rows().cell(i, 0).data();

            if (cConfere !== "Sim") {
                lValidaConf = 'True';
            }

            nQtdTotalVolumeConferido++;

        }

        let dados = [{
            "IDRESUMOOT": parseInt(nIdResumoOT)
            , "IDSTATUSOT": parseInt(idStatus)
            , "QTDTOTALVOLUMECONFERIDO": nQtdTotalVolumeConferido
            , "IDUSRVOLUMECONFERIDO": IDFuncionarioLogin
        }];

        if (lValidaConf === 'True') {
            await msgQuestion('Existem Divergências na Conferências dos Volumes! Deseja Realmente Continuar?')
                .then(async (result) => {
                    if (result?.value == true) {
                        dados[0].IDSTATUSOT = 14;
                    } else {
                        autorizaProxPasso = false;
                    }
                });
        }

        if (autorizaProxPasso) {
            animationLoadingStart('Enviando dados, aguarde...', 300, false);

            await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                .catch((error) => { throw error });

            if (idStatus == 13) {
                await msgSuccess("Finalizado com Sucesso!");
            } else {
                await msgWarning("Volume com Divergência!");
            }

            $("#conferirvolumeot").modal('hide');

            OrdemTransferencia();
        }

    } catch (error) {
        console.error(error);
        msgError('Erro ao finalizar, recarregue e tente novamente!');
    }
}

//? ============================= FIM EXPEDICAO WEB ============================= //

//? ============================= OBSERVACAO E IMPRESSAO DA ORDEM DE TRANSFERENCIA ============================= //
async function observacaoot(id) {
    try {
        animationLoadingStart()

        await $.get('expedicao_action_observacaoot.html', async (res) => {
            $('#resultadoobservacaoot').html(res);
            $("#observacaoot").modal('show');
        }).fail((error) => { throw error });

        await ajaxGet(`api/expedicao/resumo-ordem-transferencia.xsjs?id=${id}`)
            .then(retornoListaObservacaoOT)
            .catch((error) => { throw error });

        animationLoadingStop();
    } catch (error) {
        console.error(error);
        msgError();
    }
}

async function retornoListaObservacaoOT(respostaListaObservacaoOT) {
    let { data } = respostaListaObservacaoOT || [];

    if (data?.length > 0) {

        let nIdResumoOT = data[0].IDRESUMOOT;
        let nIdSAPOrigem = data[0].IDSAPORIGEM === null ? 0 : parseInt(data[0].IDSAPORIGEM);
        let nIdSAPDestino = data[0].IDSAPDESTINO === null ? 0 : parseInt(data[0].IDSAPDESTINO);
        let ErrorLogSAP = data[0].ERRORLOGSAP === null ? '' : data[0].ERRORLOGSAP;
        let ChaveSEFAZ = data[0].CHAVESEFAZ === null ? '' : data[0].CHAVESEFAZ;
        let MsgSEFAZ = data[0].MSGSEFAZ === null ? '' : data[0].MSGSEFAZ;
        let CodigoRetornoSEFAZ = data[0].CODIGORETORNOSEFAZ === null ? '' : data[0].CODIGORETORNOSEFAZ;
        let NumeroNotaSEFAZ = data[0].NUMERONOTASEFAZ === null ? '' : data[0].NUMERONOTASEFAZ;
        let IdStatusOT = data[0].IDSTATUSOT === null ? 0 : parseInt(data[0].IDSTATUSOT);
        let StatusOT = data[0].DESCRICAOOT === null ? '' : data[0].DESCRICAOOT;
        let Mensagem;

        if (ErrorLogSAP !== '') {
            Mensagem = ErrorLogSAP;
        } else if (ErrorLogSAP === '' && IdStatusOT === 1) {
            Mensagem = 'Aguardando a Empresa Origem Finalizar a OT!';
        } else if (ErrorLogSAP === '' && IdStatusOT === 2) {
            Mensagem = 'OT Cancelada!';
        } else if (ErrorLogSAP === '' && IdStatusOT === 3) {
            Mensagem = 'Aguardando Faturamento e Emissão da Nota Fiscal!';
        } else if (ErrorLogSAP === '' && IdStatusOT === 4) {
            Mensagem = 'OT Finalizada com Sucesso!';
        } else if (ErrorLogSAP === '' && IdStatusOT === 5) {
            Mensagem = 'OT Aberta com Divergência!';
        } else if (ErrorLogSAP === '' && IdStatusOT === 6) {
            Mensagem = 'OT em Análise de Divergência!';
        } else if (ErrorLogSAP === '' && IdStatusOT === 7) {
            Mensagem = 'OT Finalizada com Divergência!';
        } else if (ErrorLogSAP === '' && IdStatusOT === 8) {
            Mensagem = 'Emissão da Nota Fiscal Realizada, OT Aguardando Conferência!';
        } else if (ErrorLogSAP === '' && IdStatusOT === 9) {
            Mensagem = 'Faturamento Realizado, Aguardando Emissão da Nota Fiscal!';
        }

        $('#resultadoobservacaoot').html(
            `<table class="table table-hover table-striped w-100 table-sm">
				<tr>
					<th>Ordem de Transferência Nº ${nIdResumoOT}</th>
				</tr>
			</table>
			<table class="table table-hover table-striped w-100 table-sm">
				<tr>
					<th colspan="4">DADOS DA ORDEM DE TRANSFERÊNCIA<th>
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
				<tr><td colspan="4"><td></tr>
            	<tr>
					<th colspan="4">DADOS DA NOTA FISCAL<th>
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
				<tr><td colspan="4"><td></tr>
            	<tr>
					<th colspan="4">${Mensagem}<th>
				</tr>
			</table>`
        );
    }
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

//? =========================== FIM OBSERVACAO E IMPRESSAO DA ORDEM DE TRANSFERENCIA =========================== //

//? ============================= INICIO ROTINA CONFERIR ORDEM DE TRANSFERENCIA ============================= //
async function conferirot(id) {
    try {
        idchave = id.split(":");
        nIdResumoOT = idchave[0];
        nConferir = parseInt(idchave[1]);
        NumeroNF = idchave[2];
        Status = idchave[3];
        DataCriacao = idchave[4];
        conferirdataRetornoDetalheOT = [];

        nBtnSalvar = 2; // Alterando o botão salvar para update
        id = nIdResumoOT;

        animationLoadingStart()

        await $.get('conferenciacega_action_conferirot_modal.html', async (res) => {
            $('#resultadocot').html(res);
            $("#cot").modal('show');
        }).fail((error) => { throw error });

        $('#cot').on({
            'shown.bs.modal': function () {

                var idx = $('.modal:visible').length;

                $(this).css('z-index', 1040 + (10 * idx));
                var url = $(this).find('[data-url]').data('url');
                if (url != undefined && url != '') {
                    var id = $(this).attr('id');
                    $('#' + id + ' .modal-body').load(url);
                }
            },
            'shown.bs.modal': function () {
                var idx = ($('.modal:visible').length) - 1; // raise backdrop after animation.
                $('.modal-backdrop').not('.stacked')
                    .css('z-index', 1040 + (10 * idx))
                    .addClass('stacked');
            },
            'hidden.bs.modal': function () {
                if ($('.modal:visible').length > 0) {
                    // restore the modal-open class to the body element, so that scrolling works
                    // properly after de-stacking a modal.
                    setTimeout(function () {
                        $(document.body).addClass('modal-open');
                    }, 0);
                }
            }

        });

        $("#conferiridlojaorigemmodal, #conferiridlojadestinomodal").select2({
            dropdownParent: $("#cot")
        });

        $('#numeroOT').val(nIdResumoOT);
        $('#numeroNFe').val(NumeroNF);
        $('#statusOT').val(Status);
        $('#dtgeracaoOT').val(DataCriacao);

        await ajaxGetAllData('api/informatica/empresa.xsjs', false)
            .then(retornoListaEmpresasModalSelect)
            .catch((error) => { throw error });

        await ajaxGetAllData(`api/expedicao/detalhe-ordem-transferencia.xsjs?id=${id}`, false)
            .then(conferirretornoListaDetalheOT)
            .catch((error) => { throw error });

        animationLoadingStop();

    } catch (error) {
        console.log(error);
        msgError();
    }
}

async function conferirretornoListaDetalheOT(conferirrespostaListaDetalheOT) {
    let { data } = conferirrespostaListaDetalheOT || [];
    let dadosTable = [];
    let IdEmpresaOrigem
    let IdEmpresaDestino

    if (data.length != 0) {

        for (let registro of data) {
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
                <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${CodigoBarras}:${nQtdExpedicao}:${IdResumoOT}" onclick="conferirdiminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
			    <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="`+ CodigoBarras + `:${nQtdExpedicao}:${IdResumoOT}" onclick="conferirexcluirProduto(this.id)"><i class="fal fa-trash"></i></button>
            `;

            IdEmpresaOrigem = registro.IDEMPRESAORIGEM;
            IdEmpresaDestino = registro.IDEMPRESADESTINO;

            // Só permite edição para os Status 3-Aguardando Conferência e 5-Aberto com Divergência
            if ([1, 2, 4, 6, 7].indexOf(IdStatusOT) >= 0) {
                cAltLinha = 'False';
                BtnOpcao = ``;
                $("#conferirsalvarot, #conferirdescProduto").prop("disabled", true);
            }

            dadosTable.push([
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

        $("#conferiridlojaorigemmodal, #conferiridlojadestinomodal").prop("disabled", true);
        $("#conferiridlojaorigemmodal").val(IdEmpresaOrigem).trigger('change');
        $("#conferiridlojadestinomodal").val(IdEmpresaDestino).trigger('change');
    }

    $('#conferirtabelaprodutos').DataTable({
        data: dadosTable,
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

        if (parseInt($("#conferiridlojaorigemmodal").val()) <= 0 || parseInt($("#conferiridlojadestinomodal").val()) <= 0) {
            Swal.fire({
                type: 'info',
                title: 'A Loja de Origem e Destino devem ser Preenchidas!'
            })
            return $('#conferirdescProduto').val("").focus();
        }

        let descProduto = $('#conferirdescProduto').val();
        let cont = 0;
        let nIdEmpresa = $("#conferiridlojaorigemmodal").val();

        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == descProduto) {
                if (myTable.cell(node._DT_CellIndex.row, 7).data() === 'True') {
                    myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) + 1);
                }

                cont++;

                $('#conferirdescProduto').val("").focus();
            }
        });

        if (cont === 0) {
            $('#conferirdescProduto').prop("disabled", true);

            animationLoadingStart();

            await ajaxGetAll(`api/expedicao/produto.xsjs?page=1&idEmpresa=${nIdEmpresa}&id=${descProduto}`)
                .then(conferirRetornoListaProduto)
                .catch((error) => { throw error });

            animationLoadingStop();
        }
    } catch (error) {
        console.error(error);
        msgError();
    }
}

function conferirRetornoListaProduto(conferirrespostaListaProduto) {
    let myTable = $('#conferirtabelaprodutos').DataTable();
    let { data } = conferirrespostaListaProduto || [];

    if (data?.length > 0) {
        let CodigoProduto = data[0]?.IDPRODUTO;
        let CodigoBarras = data[0]?.NUCODBARRAS;
        let DescProduto = data[0]?.DSNOME;
        let PrecoVenda = data[0]?.PRECOVENDA;
        let PrecoCusto = data[0]?.PRECOCUSTO;
        let nQtdExpedicao = data[0]?.QTDEXPEDICAO;

        let BtnOpcao = `
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" id="${CodigoBarras}:${nQtdExpedicao}:${IdResumoOT}" onclick="conferirdiminuirProduto(this.id)"><i class="fal fa-minus"></i></button>
            <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" id="${CodigoBarras}:${nQtdExpedicao}:${IdResumoOT}" onclick="conferirexcluirProduto(this.id)"><i class="fal fa-trash"></i></button>
        `;

        myTable.row.add([
            CodigoProduto,
            CodigoBarras,
            DescProduto,
            PrecoCusto,
            PrecoVenda,
            1,
            BtnOpcao,
            'True'
        ]).draw(false);

        $('#conferiridlojaorigemmodal, #conferiridlojadestinomodal').prop("disabled", true);
        $('#conferirdescProduto').val("").prop("disabled", false).focus();
    }
}

function conferirdiminuirProduto(id) {
    let myTable = $('#conferirtabelaprodutos').DataTable();

    idchave = id.split(":");
    id = idchave[0];
    pQtdExpedicao = parseInt(idchave[1]);
    nIdResumoOT = parseInt(idchave[2]);

    myTable.column(1).nodes().each(async function (node, index, dt) {
        if (myTable.cell(node).data() == id) {
            if (myTable.cell(node._DT_CellIndex.row, 5).data() > 1) {
                myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) - 1);
            } else {
                if (pQtdExpedicao === 0) {
                    await conferirexcluirProduto(id + ':' + pQtdExpedicao + ':' + nIdResumoOT);
                } else {
                    myTable.cell(node._DT_CellIndex.row, 5).data(0);
                }
            }
        }
    });

    $('#conferirdescProduto').val("").focus();
}

async function conferirexcluirProduto(id) {
    try {
        let myTable = $('#conferirtabelaprodutos').DataTable();

        idchave = id.split(":");
        id = idchave[0];
        pQtdExpedicao = parseInt(idchave[1]);
        nIdResumoOT = parseInt(idchave[2]);

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

        await myTable.column(1).nodes().each(async function (node, index, dt) {
            if (myTable.cell(node).data() == id) {
                if (pQtdExpedicao === 0) {
                    await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                        .catch((error) => { throw error });

                    myTable.row(node._DT_CellIndex.row).remove().draw(false)
                } else {
                    myTable.cell(node._DT_CellIndex.row, 5).data(0);
                }
            }
        });

        $('#conferirdescProduto').val("").focus();
    } catch (error) {
        console.log(error);
        msgError('Erro ao tentar excluir o produto!');
    }
}

function conferirabrirPesqProduto() {
    nIdLojaOrigem = parseInt($("#conferiridlojaorigemmodal").val());

    $("#conferirabrirpesqproduto").modal('show');
}

async function conferirpesquisarProduto() {
    try {
        let descProduto = $("#conferirpesqProduto").val();

        animationLoadingStart();

        await ajaxGetAllData(`api/expedicao/produto.xsjs?idEmpresa=${nIdLojaOrigem}&descProduto=${descProduto}`)
            .then(conferirretornoPesqListaProduto)
            .catch((error) => { throw error });

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        msgError()
    }

}

async function conferirretornoPesqListaProduto(conferirrespostaPesqListaProduto) {
    let { data } = conferirrespostaPesqListaProduto || [];
    let dadosTable = [];

    if (data.length > 0) {
        for (let registro of data) {
            let CodigoProduto = registro.IDPRODUTO;
            let CodigoBarras = registro.NUCODBARRAS;
            let DescProduto = registro.DSNOME;
            let PrecoVenda = registro.PRECOVENDA;
            let PrecoCusto = registro.PRECOCUSTO;

            dadosTable.push([
                CodigoProduto
                , CodigoBarras
                , DescProduto
                , PrecoCusto
                , PrecoVenda
                , `<input type="number" class="form-control" id="qtd:${CodigoBarras}" value="0"><span style="display: none;">0</span>`
                , `<button type="button" class="btn btn-outline-success btn-xs btn-icon waves-effect waves-themed" title="Confirmar" id="${CodigoBarras}" onclick="conferirconfirmarProduto(this.id)"><i class="fal fa-check"></i></button>`
                , `True`
            ]);
        }

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
        data: dadosTable,
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
    let conferirtabelaresultado = $('#conferirdt-basic-produto').DataTable();
    let cCodProduto = conferirtabelaresultado.rows().data()[0][0];
    let cDescProduto = conferirtabelaresultado.rows().data()[0][2];
    let nPrecoCusto = conferirtabelaresultado.rows().data()[0][3];
    let nPrecoVenda = conferirtabelaresultado.rows().data()[0][4];
    let nQtd = parseInt(document.getElementById('qtd:' + id).value);
    let cont = 0;

    if (nQtd <= 0) {
        return msgWarning('Favor preencher a Quantidade do Produto com um valor Maior que Zero ( 0 )!')
    }

    $("#conferirabrirpesqproduto").modal('hide');

    let BtnOpcao = `
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Diminuir Quantidade" onclick="conferirdiminuirProduto('${id}')"><i class="fal fa-minus"></i></button>
        <button type="button" class="btn btn-outline-danger btn-xs btn-icon waves-effect waves-themed" title="Excluir Produto" onclick="conferirexcluirProduto('${id}')"><i class="fal fa-trash"></i></button>
    `;

    if (myTable.rows().count() > 0) {
        myTable.column(1).nodes().each(function (node, index, dt) {
            if (myTable.cell(node).data() == id) {
                myTable.cell(node._DT_CellIndex.row, 5).data(parseInt(myTable.cell(node._DT_CellIndex.row, 5).data()) + nQtd);
                cont++;
            }
        });
        if (cont === 0) {
            myTable.row.add([cCodProduto, id, cDescProduto, nPrecoCusto, nPrecoVenda, nQtd, BtnOpcao, 'True']).draw(false);
        }
    } else {
        myTable.row.add([cCodProduto, id, cDescProduto, nPrecoCusto, nPrecoVenda, nQtd, BtnOpcao, 'True']).draw(false);
    }

    conferirtabelaresultado.destroy();

    $('#conferiridlojaorigemmodal, #conferiridlojadestinomodal').prop("disabled", true);
    $('#conferirdt-basic-produto').empty();
    $('#conferirpesqProduto').val("");
    $('#conferirdescProduto').val("").focus();

}

// Funcão para Salvar os Dados da OT que está passando por Conferência no Destino
async function conferirsalvarot() {
    try {
        let myTable = $('#conferirtabelaprodutos').DataTable();
        let dadosdetalheot = [];
        let nQtdTotalItens = 0;
        let qtdLinhas = parseInt($("#descQtdLinha").val());

        if (myTable.rows().count() === 0 || myTable.rows().count() > qtdLinhas) {
            let msg = myTable.rows().count() === 0 ? 'Informar os produtos da OT!' : `A OT não pode conter mais de ${qtdLinhas} tipos de produtos!`;

            return msgWarning(msg);
        }

        animationLoadingStart('Enviando dados, aguarde...', 300, false);

        $("#cot").modal('hide');

        for (var i = 0; i < myTable.rows().count(); i++) {

            let cIdProduto = myTable.rows().cell(i, 0).data();
            let nQtdProduto = parseInt(myTable.rows().cell(i, 5).data());
            let nVlrVenda = parseFloat(myTable.rows().cell(i, 4).data());
            let nVlrCusto = parseFloat(myTable.rows().cell(i, 3).data());

            dadosdetalheot.push({
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
            });

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

        await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
            .catch((error) => { throw error });

        await msgSuccess("Recepção Salva com Sucesso!");

        OrdemTransferencia();
    } catch (error) {
        console.log(error);
        msgError('Erro ao salvar!');
    }
}

function finalizarot(id) {
    msgQuestion('Deseja Realmente Finalizar a OT?')
        .then(async (result) => {
            try {
                if (result?.value) {
                    idchave = id.split(":");
                    id = idchave[0];
                    nQtdConferido = idchave[5];

                    animationLoadingStart('Finalizando OT, aguarde...', 300, false);

                    let dados = [{
                        "IDOPERADORRECEPTOR": IDFuncionarioLogin
                        , "IDSTATUSOT": parseInt(6)
                        , "IDRESUMOOT": parseInt(id)
                        , "QTDCONFERENCIA": parseInt(nQtdConferido)
                    }];

                    await ajaxPut("api/expedicao/resumo-ordem-transferencia.xsjs", dados)
                        .catch((error) => { throw error });

                    await msgSuccess('OT Finalizada com sucesso!');

                    OrdemTransferencia();
                }
            } catch (error) {
                console.log(error);
                msgError('Erro ao finalizar a OT, recarregue e tente novamente!');
            }
        })
}

//? ============================= FIM CONFERIR ORDEM DE TRANSFERENCIA ============================= //