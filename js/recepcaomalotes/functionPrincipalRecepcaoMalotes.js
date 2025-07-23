/*
 * Author: Hendryw Deyvison
 * Data: 19/02/2025
 * Email: hendryw.deyvison@gmail.com
 */
var usuario = getCurrentUser()?.user;
usuario || LogoffUser();

var IDEmpresaLogin = usuario['IDEMPRESA'];
var IDListaEmp = usuario['ID_LISTA_LOJA'];
var NOEmpresaLogin = usuario['NOFANTASIA'];
var IDFuncionarioLogin = usuario['id'];
var NomeFuncionarioLogin = usuario['NOFUNCIONARIO'];


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
var seg = data.getSeconds();

var DSdesc = '';// 0-59


diaFormatado = String(dia);
mesatual = (mes + 1);
mesFormatado = String(mesatual);

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');
let horaAtualCampo = hora + ':' + min + ':' + seg;

let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let horaStr = String(hora);
let minStr = String(min);
let horaAtual = horaStr.padStart(2, '0') + ':' + minStr.padStart(2, '0');

function logout() {
    LogoffUser();
    window.location.href = 'index.html';
}

//////////////// Página Inicial ///////////////////////

$(document).ready(async function () {

    $('#parametro_dia').val(dataAtualCampo);
    $('.dataAtual').text(dataAtual);
    $('.NoFuncionarioTitulo').text(NomeFuncionarioLogin);
    //$('.NoEmpresaTitulo').text(NOEmpresaLogin);

    await TelaListarMalotesLoja();

    $('#dtconsultainicio').focus();
});

///////////////////////// FIM DOCUMENT READY///////////////////////////////////////////////////////

//? ======================================================== INICIO ROTINA ENVIO DE MALOTES ======================================================== //

function formataStringComEspaço(string = '') {
    return string?.replace(/ {2,}/g, ' ')?.replace(/(\n\s*){2,}/g, '\n');
}

async function retornoListaEmpresasSelect(respostaListaEmpresas) {
    let { data } = respostaListaEmpresas || [];

    $('#idloja').html(`
        <option value="">Selecione...</option>    
    `);

    for ({IDEMPRESA, NOFANTASIA} of data) {
        $('#idloja').append(`<option value="${IDEMPRESA}"> ${NOFANTASIA} </option>`);
    }

    $('#idloja').select2();
}

async function TelaListarMalotesLoja() {
    try {
        animationLoadingStart();

        await $.get("recepcaomalotes_action_tela_principal_listmalotesloja.html", async (res) => $('#js-page-content').html(res)).catch((error) => { throw error });

        await ajaxGetAllData('api/empresa.xsjs')
            .then(retornoListaEmpresasSelect)
            .catch((error) => { throw error });

        $('.dataAtual').text(dataAtual);
        $('#dtconsultainicio, #dtconsultafim').val(dataAtualCampo);
        $('#dtconsultainicio, #dtconsultafim, #idMalote').on('keypress', (e) => { if (e.keyCode == 13) pesquisarMalotes() });
        $('#statusMalote').select2();

        $('#idloja, #statusMalote').on('select2:open', function (e) {
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
        let idEmpresa = $('#idloja').val() || '';
        let datapesqinicio = $("#dtconsultainicio").val();
        let datapesqfim = $("#dtconsultafim").val();
        let statusMalote = $("#statusMalote").val() || '';
        let idPendenciaMalote = $("#pendenciasMalote").val() || '';
        let idMalote = $("#idMalote").val() || '';

        await ajaxGetAllData(`api/financeiro/malotes-por-loja.xsjs?pageSize=500&page=1&idEmpresa=${idEmpresa}&dataPesquisaInicio=${datapesqinicio}&dataPesquisaFim=${datapesqfim}&statusMalote=${statusMalote}&idMalote=${idMalote}&idPendenciaMalote=${idPendenciaMalote}`)
            .then(retornoListaMalotesLoja)
            .catch((error) => { throw error });

    } catch (error) {
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
            let obsMalote = registro?.OBSERVACAOFINANCEIROMALOTE;
            let stAtivoMalote = registro?.STATIVOMALOTE;
            let dataHoraMalote = registro?.DATAHORACRIACAOMALOTE;
            let statusMalote = registro?.STATUSMALOTE || 'Pendente de Envio';
            //let btnRecepcionar = `<button class="btn btn-success" type="button" onclick="abrirModalDetalhesMalote(${idMalote})"><span class="fal fa-edit mr-1"></span>Recepcionar</button>`;
            let btnRecepcionar = `<button class="btn btn-success" type="button" onclick="updateStatusMalote(${idMalote})"><span class="fal fa-edit mr-1"></span>Recepcionar</button>`;
            let btnStatus = `<button type="button" class="btn btn-success" title="Malote ${statusMalote}!" disabled><i class="fal fa-check"></i></button>`;
            let btnDetalhar = `<button type="button" class="btn btn-info" title="Malote ${statusMalote}!" onClick="abrirModalDetalhesMalote(${idMalote})"><i class="fal fa-eye mr-1"></i>Detalhes</button>`;
            let containerButtons = (statusMalote == 'Enviado' || statusMalote == 'Reenviado') ? btnRecepcionar : '';
            let classStatus = 'text-info';
            let msgStatus = statusMalote;

            vrDespesaTotal = idMalote ? vrDespesa : parseFloat(vrDespesa) + parseFloat(vrAdiantamentoSalario);
            vrTotalVendido = idMalote ? vrTotalRecebidoMalote : parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoCartao) + parseFloat(vrRecebidoPos) + parseFloat(vrRecebidoPix) + parseFloat(vrRecebidoMOOVPAY) + parseFloat(vrRecebidoConvenio) + parseFloat(vrRecebidoVoucherLoja);
            vrDisponivelBruto = parseFloat(vrRecebidoDinheiro) + parseFloat(vrRecebidoFatura);

            if (statusMalote == 'Enviado' || statusMalote == 'Reenviado') {
                classStatus = 'text-danger';
                msgStatus = 'Aguardando Recepção';
            }

            if (statusMalote == 'Recepcionado') {
                classStatus = 'text-success';
            }

            statusMalote = `<label class="${classStatus} fw-900">${msgStatus}</label>`;

            if (parseFloat(vrAjusteDin) > 0) {
                vrTotalDinheiroAjuste = parseFloat(vrTotalDinheiroAjuste) + parseFloat(vrAjusteDin);
            } else {
                vrTotalDinheiro = idMalote ? vrTotalDinheiro : parseFloat(vrTotalDinheiro) + parseFloat(vrRecebidoDin);
            }

            vrQuebraCaixa = (parseFloat(vrRecebidoDin)) - parseFloat(vrFisicoDin);

            vrTotal = parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal);
            vrDisponivel = idMalote ? parseFloat(vrDisponivelMalote) : parseFloat(vrDisponivelBruto) - parseFloat(vrDespesaTotal) + parseFloat(vrQuebraCaixa);

            if (vrQuebraCaixa > 0) {
                tagquebracaixa = `<label style="color: blue;"> + ` + maskValorEmBRL(parseFloat(vrQuebraCaixa).toFixed(2)) + `</label>`;
            } else {
                tagquebracaixa = `<label style="color: red;"> - ` + maskValorEmBRL(parseFloat(vrQuebraCaixa).toFixed(2)) + `</label>`;
            }

            dadosTable.push([
                `<label style="color: blue;">${(++contador)}</label>`,
                `<label style="color: blue;">${dataFechamento}</label>`,
                `<label class="text-truncate" style="color: blue;">${noFantasia} </label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: blue;">R$***</label>`,
                `<label style="color: green;">R$***</label>`,
                `<label class="${classStatus} text-truncate fw-900">${msgStatus}</label>`,
                containerButtons
            ]);

           /* totalVrRecebidoDinheiro = parseFloat(totalVrRecebidoDinheiro) + parseFloat(vrRecebidoDinheiro);
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
            }*/
        }

       /* $('#totalResultadoMalotesLoja').html(
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

async function abrirModalDetalhesMalote(idMalote) {
    try {
        animationLoadingStart();

        $("#detStatusMalote").modal('show');
        $('#btnRecepcaoMalote').addClass('d-none');

        await ajaxGetAllData('api/gerencia/detalhe-malotes-por-loja.xsjs?idMalote=' + idMalote)
            .then(retornoModalDetalhesMalote)
            .catch((error) => { throw error });

        animationLoadingStop()
    } catch (error) {
        console.error(error);
        msgError();
    }
}

function retornoModalDetalhesMalote({ data }) {

    if (data.length === 0) {
        return msgWarning('Atenção!', 'Não foi possível carregar os detalhes do Malote!');
    }

    let {
        NOFANTASIA,
        IDMALOTE,
        DATAMOVIMENTOCAIXA,
        DATAHORACRIACAO,
        DATAHORAENVIADO,
        DATAHORARECEBIDO,
        DATAHORACONFERIDO,
        DATAHORADEVOLVIDO,
        STATUSMALOTE,
        OBSERVACAOMALOTE
    } = data[0];

    let classStatus = 'text-danger';

    if (STATUSMALOTE == 'Enviado' || STATUSMALOTE == 'Reenviado') {
        classStatus = 'text-info';
        STATUSMALOTE += ' e Aguardando Recebimento...';

        $('#btnRecepcaoMalote').attr('onclick', `updateStatusMalote(${IDMALOTE})`).removeClass('d-none');
    }

    if (STATUSMALOTE == 'Recepcionado') {
        classStatus = 'text-info';
        STATUSMALOTE += ' e Aguardando Conferência...';
    }

    if (STATUSMALOTE == 'Conferido') {
        classStatus = 'text-success';
    }

    $('#nomeEmpresaMalote').text(NOFANTASIA);
    $('#dataMovimentoCaixaMalote').text(DATAMOVIMENTOCAIXA);
    $('#idMaloteModal').text(IDMALOTE);
    $('#dataCriacaoMalote').text(DATAHORACRIACAO);
    $('#dataHoraEnviadoMalote').text(DATAHORAENVIADO || '');
    $('#dataRecepcaoMalote').text(DATAHORARECEBIDO || '');
    $('#dataDevolucaoMalote').text(DATAHORADEVOLVIDO || '');
    $('#dataConferenciaMalote').text(!DATAHORACONFERIDO && DATAHORARECEBIDO ? 'Aguardando conferencia...' : DATAHORACONFERIDO);
    $('#statusMaloteModal').html(`Status: <span class="${classStatus} fw-500">${STATUSMALOTE}</span>`);

    
}

async function updateStatusMalote(idMalote) {
    msgQuestion(`Deseja realmente confirmar a RECEPÇÃO do Malote?`)
        .then(async (respModal) => {
            try {

                if (respModal.value !== true) return;

                let dadosSessaoUser = (await getCurrentUser())?.user;
                let idUser = dadosSessaoUser?.id;

                if (!idUser || !IDEMPRESA) {
                    throw 'Erro ao tentar recuperar os dados da Sessão do Usuário, faça o logoff e entre novamente no sistema!';
                }

                let dados = [
                    {
                        IDMALOTE: idMalote,
                        STATUS: 'Recepcionado',
                        IDUSERULTIMAALTERACAO: idUser
                    }
                ];

                animationLoadingStart('Atualizando Status do Malote...', 1, false);

                await ajaxPut('api/gerencia/malotes-por-loja.xsjs', dados).catch((error) => { throw error });
                await msgSuccess('Malote Recebido com Sucesso!');

                $("#detStatusMalote").modal('hide');
              //  $('#dtconsultainicio, #dtconsultafim').val(DATAMOVIMENTOCAIXA);

                pesquisarMalotes();

            } catch (error) {
                console.error(error);
                msgError('Erro ao tentar atualizar o status do malote, recarregue e tente novamente!');
            }
        })
}

//? ======================================================== FIM ROTINA ENVIO DE MALOTES ======================================================== //