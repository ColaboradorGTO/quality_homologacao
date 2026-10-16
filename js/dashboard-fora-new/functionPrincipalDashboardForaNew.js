/*
 * Author: Hendryw Deyvison da Silva Rosa
 * Data: 27/05/2026
 * Email: hendryw.deyvison@gmail.com  
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
var mes = data.getMonth(); // 0-11 (zero=janeiro)
var ano4 = data.getFullYear();
var anoPassado = data.getFullYear() - 1// 4 dígitos
var hora = data.getHours();          // 0-23
var min = data.getMinutes();
min < 10 ? min = "0" + min : min = min     // 0-59
var seg = data.getSeconds();
seg < 10 ? seg = "0" + seg : seg = seg      // 0-59
var horaAtual = hora + ':' + min + ':' + seg//':59:59'

var diaFormatado = String(dia);
var mesatual = (mes + 1);
var tresmesesatras = (mes - 3);
var mesFormatado = String(mesatual);
var diaFormatadoPassado = String(dia)

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

var dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');
var dataAnoPassadoCampo = anoPassado + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');
var diaAnoPassadoCampo = anoPassado + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoPassado.padStart(2, '0');

//PEGANDO O PRIMEITO DIA DO MÊS ATUAL////////////////

var primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);

var diaMesAtual = primeiroDia.getDate();
var diaFormatadoMesAtual = String(diaMesAtual);
var dataPrimeiroDiaFormatado = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoMesAtual.padStart(2, '0');

var meseano = nomeMes(mes) + '/' + ano4;
var mesAnoPassado = nomeMes(mes) + '/' + anoPassado

var diaMesAtual = primeiroDia.getDate();
var diaFormatadoMesAtual = String(diaMesAtual);
var dataPrimeiroDiaFormatado = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoMesAtual.padStart(2, '0');
var dataPrimeiroDiaFormatadoAnoPassado = anoPassado + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoMesAtual.padStart(2, '0');

///////////////// Variaveis Globais ////////////////////////////////
var PercTotalMes = 0;
var PercTotalDia = 0;

var PercDinheiro = 0;
var PercCartao = 0;
var PercPOS = 0;
var PercCredSystem = 0;
var PercConvenio = 0;

var totalVendaMesAtual = 0;
var totalVendaMesAnoPassado = 0;
var totalVendaDiaAtual = 0;
var totalVendaDiaAnoPassado = 0;

var totalDinheiroDiaAtual = 0;
var totalCartaoDiaAtual = 0;
var totalConvenioDiaAtual = 0;
var totalPosDiaAtual = 0;
var totalVoucherDiaAtual = 0;
var totalFaturaDiaAtual = 0;
var totalCredSystemDiaAtual = 0;
var totalDespesaDiaAtual = 0;
var totalAdiantamentoSalarialDiaAtual = 0;
var totalRealizadoDiaAtual = 0;

var totalDinheiroDiaAnoPassado = 0;
var totalCartaoDiaAnoPassado = 0;
var totalConvenioDiaAnoPassado = 0;
var totalPosDiaAnoPassado = 0;
var totalVoucherDiaAnoPassado = 0;
var totalFaturaDiaAnoPassado = 0;
var totalCredSystemDiaAnoPassado = 0;
var totalDespesaDiaAnoPassado = 0;
var totalAdiantamentoSalarialDiaAnoPassado = 0;
var totalRealizadoDiaAnoPassado = 0;

//////////////// Funções Globais ///////////////////////////////////

var diaSemana = new Date();

function devolverDiaSemana(diaSemana) {
  var dias = ['Domingo', 'Segunda-Feira', 'Terca-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sabado'];
  return dias[diaSemana.getDay()]
}

function nomeMes(mes) {
  var meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ]

  return meses[mes]
}

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

async function modalTomadaDeAcaoAposErro(dashboard = 'dashboardComparativoVendas') {
  clearInterval(setIntervalCarregaDados);

  let confirmacao = await Swal.fire({
    type: "error",
    title: `Servidor Indisponível no Momento!`,
    text: 'Recarregue a página ou aguarde.',
    showConfirmButton: true,
    showCancelButton: true,
    showCloseButton: false,
    cancelButtonColor: '#d33',
    confirmButtonText: `Recarregar Agora`,
    cancelButtonText: `Aguardar...`,
    allowOutsideClick: false,
    allowEscapeKey: false,
    timer: 60000
  })

  if (confirmacao?.value) {
    animationLoadingStart('Recarregando dashboard...', 1, false);

    await sleep(5000);

  } else {
    animationLoadingStart('Aguardando servidor voltar a ficar disponível...', 1);

    await sleep(10000);
  }

  if (dashboard == 'vendaContingencia') {
    await carregarDadosDashboardVendasContingencia();
  } else {

    await carregarDadosDashboardComparativoVendasAnoAtualComAnoPassado();
  }

}

async function alterarTempoRefreshAutomatico(dashboard = 'dashboardComparativoVendas') {
  clearInterval(setIntervalCarregaDados);

  let { value: tempoEmMinutos } = await Swal.fire({
    title: 'Deseja alterar o tempo de atualização automática dos dados do dashboard?',
    text: 'Informe o tempo em minutos para atualizar os dados automaticamente. O tempo atual é de ' + (tempoAtualizaDados / 60000) + ' minutos.',
    input: 'number',
    inputPlaceholder: 'Tempo em minutos',
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Alterar',
    onOpen: () => {
      const input = Swal.getInput();
      input.value = tempoAtualizaDados / 60000;
      input.focus();
    },
  });

  if (tempoEmMinutos) {
    tempoAtualizaDados = parseInt(tempoEmMinutos) * 60000;

    await msgSuccess('Tempo de atualização automática alterado para ' + tempoEmMinutos + ' minutos.');
  } else {
    await msgInfo('Tempo de atualização automática mantido em ' + (tempoAtualizaDados / 60000) + ' minutos.');
  }

  setIntervalCarregaDados = setInterval(async () => {
    if (dashboard == 'vendaContingencia') {
      await carregarDadosDashboardVendasContingencia();
    } else {

      await carregarDadosDashboardComparativoVendasAnoAtualComAnoPassado();
    }
  }, tempoAtualizaDados);

}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//////////////// Página Inicial //////////////////


var setIntervalCarregaDados;
var tempoAtualizaDados = 60000;

$(document).ready(async () => {
  clearInterval(setIntervalCarregaDados);

  await carregarDadosDashboardComparativoVendasAnoAtualComAnoPassado();
});

//? ================= INICIO ROTINA DASHBOARD COMPARATIVO ENTRE VENDAS DO ANO PASSADO E ANO ATUAL ================= ?//

async function carregarDadosDashboardComparativoVendasAnoAtualComAnoPassado() {
  animationLoadingStart('Carregando Dados...');

  $('#js-page-content').html('');

  try {
    let listaTotalVendaMesAtual = await ajaxGetAllData(`api/financeiro/venda-total-mes.xsjs?dataPesquisaInicio=${dataPrimeiroDiaFormatado}&dataPesquisa=${dataAtualCampo}&horaFinal=${horaAtual}`, false);

    let listaTotalVendaMesAnoPassado = await ajaxGetAllData(`api/financeiro/venda-total-mes.xsjs?dataPesquisaInicio=${dataPrimeiroDiaFormatadoAnoPassado}&dataPesquisa=${dataAnoPassadoCampo}&horaFinal=${horaAtual}`, false);

    let listaTotalPagamentosVendasMesAtual = await ajaxGetAllData(`api/dashboard/venda-total-loja-hora.xsjs?dataPesquisa=${dataAtualCampo}&horaFinal=23:59:59`, false);

    let listaTotalPagamentosVendasMesAnoPassado = await ajaxGetAllData('api/dashboard/venda-total-loja-hora.xsjs?dataPesquisa=' + diaAnoPassadoCampo + '&horaFinal=' + horaAtual, false);

    let listaLojasComMaisVendasTesoura = await ajaxGetAllData('api/financeiro/venda-total-to.xsjs?idgrupo=1&dataPesquisa=' + dataAtualCampo, false);

    let listaLojasComMaisVendasMagazine = await ajaxGetAllData('api/financeiro/venda-total-to.xsjs?idgrupo=2&dataPesquisa=' + dataAtualCampo, false);

    let listaLojasComMaisVendasFreecenter = await ajaxGetAllData('api/financeiro/venda-total-to.xsjs?idgrupo=4&dataPesquisa=' + dataAtualCampo, false);

    let respHtml = await $.get('dashboardforanew_action_comparativo_vendas_atuais_com_ano_passado.html');

    $('#js-page-content').html(respHtml);
    $('#parametro_dia').val(dataAtualCampo);
    $('.parametro_dia').text(`${devolverDiaSemana(diaSemana)}  ${dataAtual}`);

    await retornoVendaTotalMes(listaTotalVendaMesAtual);
    await retornoVendaTotalMesAnoPassado(listaTotalVendaMesAnoPassado);
    await retornoVendaTotal(listaTotalPagamentosVendasMesAtual);
    await retornoVendaTotalAnoPassado(listaTotalPagamentosVendasMesAnoPassado);
    await retornoListaLojasComMaisVendas(listaLojasComMaisVendasTesoura, 'dt-basic-top-venda-tesoura', 'Tesoura');
    await retornoListaLojasComMaisVendas(listaLojasComMaisVendasMagazine, 'dt-basic-top-venda-magazine', 'Magazine');
    await retornoListaLojasComMaisVendas(listaLojasComMaisVendasFreecenter, 'dt-basic-top-venda-freecenter', 'Free Center');

    animationLoadingStop()

    clearInterval(setIntervalCarregaDados);

    setIntervalCarregaDados = setInterval(async () => {
      await carregarDadosDashboardComparativoVendasAnoAtualComAnoPassado('vendaContingencia');
    }, tempoAtualizaDados);

  } catch (error) {
    await modalError(error);
    console.log('Erro ao carregar os dados do dashboard: ', error);
  }

  animationLoadingStop();
}

async function retornoVendaTotalMes(respostaVendaMes) {
  totalVendaMesAtual = 0;

  if (respostaVendaMes?.data.length > 0) {
    totalVendaMesAtual = Number(respostaVendaMes.data[0].VALORTOTALMES);
  }
  $('.vrTotalVendaMes').html(
    `<h2 class="totalVendasMes display-3 d-inline-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalVendaMesAtual).toFixed(2))} <small class="position-absolute pos-center pos-top h5">Venda Total Mês - ${meseano}</small></h2>`
  );

}

async function retornoVendaTotalMesAnoPassado(respostaVendaMesAnoPassado) {
  totalVendaMesAnoPassado = 0;

  if (respostaVendaMesAnoPassado?.data.length > 0) {
    totalVendaMesAnoPassado = Number(respostaVendaMesAnoPassado.data[0].VALORTOTALMES);
  }
  $('.vrTotalVendaMesAnoPassado').html(
    `<h2 class="totalVendasMesAnoPassado d-inline-block l-h-n m-0 fw-500 text-warning">${mascaraValor(parseFloat(totalVendaMesAnoPassado).toFixed(2))}</h2> <small class="position-relative pl-3 h5 text-warning">Venda Total Mês - ${mesAnoPassado} </small>`
  );
}

async function retornoVendaTotal(respostaVendaTotal) {
  let { data } = respostaVendaTotal || [];

  totalDinheiroDiaAtual = data[0]?.VALORTOTALDINHEIRO || 0;
  totalCartaoDiaAtual = data[0]?.VALORTOTALCARTAO || 0;
  totalConvenioDiaAtual = data[0]?.VALORTOTALCONVENIO || 0;
  totalPosDiaAtual = data[0]?.VALORTOTALPOS || 0;
  totalVoucherDiaAtual = data[0]?.VALORTOTALVOUCHER || 0;
  totalFaturaDiaAtual = data[0]?.VALORTOTALFATURA || 0;
  totalCredSystemDiaAtual = data[0]?.VALORTOTALCREDSYSTEM || 0;
  totalDespesaDiaAtual = data[0]?.VALORTOTALDESPESA || 0;
  totalAdiantamentoSalarialDiaAtual = data[0]?.VALORTOTALADIANTAMENTOSALARIAL || 0;

  //let totalDespesaAdiantamento = parseFloat(totalDespesa) + parseFloat(totalAdiantamentoSalarial);
  totalVendaDiaAtual = (parseFloat(totalDinheiroDiaAtual) + parseFloat(totalCartaoDiaAtual) + parseFloat(totalConvenioDiaAtual) + parseFloat(totalPosDiaAtual));

  $('.vrTotalDinheiro').html(
    `<h2 class="totalDinheiroDia display-3 d-inline-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalDinheiroDiaAtual).toFixed(2))} <small class="position-absolute pos-top h5">Dinheiro - Hoje</small></h2>`
  );

  $('.vrTotalCartao').html(
    `<h2 class="totalCartaoDia display-3 d-inline-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalCartaoDiaAtual).toFixed(2))} <small class="position-absolute pos-top h5">Cartão - Hoje</small></h2>`
  );

  $('.vrTotalPos').html(
    `<h2 class="totalPosDia display-3 d-inline-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalPosDiaAtual).toFixed(2))} <small class="position-absolute pos-top h5">POS - Hoje</small></h2>`
  );

  $('.vrTotalConvenio').html(
    `<h2 class="totalConvenioDia display-3 d-inline-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalConvenioDiaAtual).toFixed(2))} <small class="position-absolute pos-top h5">Convênio - Hoje</small></h2>`
  );

  $('.vrTotalFatura').html(
    `<h2 class="totalFaturaDia display-3 d-inline-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalFaturaDiaAtual).toFixed(2))} <small class="position-absolute pos-top h5">Fatura - Hoje</small></h2>`
  );

  $('.vrTotalCredSystem').html(
    `<h2 class="totalCredSystemDia display-3 d-inline-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalCredSystemDiaAtual).toFixed(2))} <small class="position-absolute pos-top h5">Credsystem - Hoje</small></h2>`
  );

  $('.vrTotal').html(
    `<h2 class="totalVendaDia display-3 d-inline-block l-h-n m-0 fw-500">${mascaraValor(parseFloat(totalVendaDiaAtual).toFixed(2))} <small class="position-absolute pos-top h5">Dinheiro - Cartão - POS - Convênio</small></h2>`
  );

}

async function retornoVendaTotalAnoPassado(respostaVendaTotalAnoPassado) {
  let { data } = respostaVendaTotalAnoPassado || [];

  let totalDinheiroDiaAnoPassado = data[0]?.VALORTOTALDINHEIRO || 0;
  let totalCartaoDiaAnoPassado = data[0]?.VALORTOTALCARTAO || 0;
  let totalConvenioDiaAnoPassado = data[0]?.VALORTOTALCONVENIO || 0;
  let totalPosDiaAnoPassado = data[0]?.VALORTOTALPOS || 0;
  let totalVoucherDiaAnoPassado = data[0]?.VALORTOTALVOUCHER || 0;
  let totalFaturaDiaAnoPassado = data[0]?.VALORTOTALFATURA || 0;
  let totalCredSystemDiaAnoPassado = data[0]?.VALORTOTALCREDSYSTEM || 0;
  let totalDespesaDiaAnoPassado = data[0]?.VALORTOTALDESPESA || 0;
  let totalAdiantamentoSalarialDiaAnoPassado = data[0]?.VALORTOTALADIANTAMENTOSALARIAL || 0;

  //let totalDespesaAdiantamento = parseFloat(totalDespesa) + parseFloat(totalAdiantamentoSalarial);
  let totalVendaDiaAnoPassado = (parseFloat(totalDinheiroDiaAnoPassado) + parseFloat(totalCartaoDiaAnoPassado) + parseFloat(totalConvenioDiaAnoPassado) + parseFloat(totalPosDiaAnoPassado));

  let PercTotalMes = await calcularPorcetagemEntreValores(totalVendaMesAtual, totalVendaMesAnoPassado);
  let PercTotalDia = await calcularPorcetagemEntreValores(totalVendaDiaAtual, totalVendaDiaAnoPassado);
  let PercPos = await calcularPorcetagemEntreValores(totalPosDiaAtual, totalPosDiaAnoPassado);
  let PercCartao = await calcularPorcetagemEntreValores(totalCartaoDiaAtual, totalCartaoDiaAnoPassado);
  let PercDinheiro = await calcularPorcetagemEntreValores(totalDinheiroDiaAtual, totalDinheiroDiaAnoPassado);
  let PercConvenio = await calcularPorcetagemEntreValores(totalConvenioDiaAtual, totalConvenioDiaAnoPassado);
  let PercFatura = await calcularPorcetagemEntreValores(totalFaturaDiaAtual, totalFaturaDiaAnoPassado);
  let PercCredSystem = await calcularPorcetagemEntreValores(totalCredSystemDiaAtual, totalCredSystemDiaAnoPassado);

  $('.percTotalVendaMes').html(
    `<h3>${PercTotalMes}%</h3> `
  );

  $('.percTotalVendaDia').html(
    `<h3>${PercTotalDia}%</h3> `
  );

  $('.percTotalPOS').html(
    `<h3>${PercPos}%</h3> `
  );

  $('.percTotalCartao').html(
    `<h3>${PercCartao}%</h3> `
  );

  $('.percTotalDinheiro').html(
    `<h3>${PercDinheiro}%</h3> `
  );

  $('.percTotalConvenio').html(
    `<h3>${PercConvenio}%</h3> `
  );

  $('.percTotalFatura').html(
    `<h3>${PercFatura}%</h3> `
  );

  $('.percTotalCredSystem').html(
    `<h3>${PercCredSystem}%</h3> `
  );

  $('.vrTotalDinheiro2').html(
    `<h2 class="d-inline-block l-h-n m-0 text-light fw-400">${mascaraValor(parseFloat(totalDinheiroDiaAnoPassado).toFixed(2))}</h2><small class="position-relative pl-3 h5">Dinheiro - ${mesAnoPassado}</small>`
  );

  $('.vrTotalCartao2').html(
    `<h2 class="d-inline-block l-h-n m-0 fw-400">${mascaraValor(parseFloat(totalCartaoDiaAnoPassado).toFixed(2))}</h2><small class="position-relative pl-3 h5 text-light">Cartão - ${mesAnoPassado}</small>`
  );

  $('.vrTotalPos2').html(
    `<h2 class="d-inline-block l-h-n m-0 fw-400">${mascaraValor(parseFloat(totalPosDiaAnoPassado).toFixed(2))}</h2><small class="position-relative pl-3 h5 text-light">POS - ${mesAnoPassado}</small>`
  );

  $('.vrTotalConvenio2').html(
    `<h2 class="d-inline-block l-h-n m-0 fw-300">${mascaraValor(parseFloat(totalConvenioDiaAnoPassado).toFixed(2))}</h2><small class="position-relative pl-3 h5">Convênio - ${mesAnoPassado}</small>`
  );

  $('.vrTotalFatura2').html(
    `<h2 class="d-inline-block l-h-n m-0 fw-400">${mascaraValor(parseFloat(totalFaturaDiaAnoPassado).toFixed(2))}</h2><small class="position-relative pl-3 h5">Fatura - ${mesAnoPassado}</small>`
  );

  $('.vrTotalCredSystem2').html(
    `<h2 class="d-inline-block l-h-n m-0 fw-400">${mascaraValor(parseFloat(totalCredSystemDiaAnoPassado).toFixed(2))}</h2><small class="position-relative pl-3 h5">CredSystem - ${mesAnoPassado}</small>`
  );

  $('.vrTotal2').html(
    `<h2 class="d-inline-block l-h-n m-0 fw-600">${mascaraValor(parseFloat(totalVendaDiaAnoPassado).toFixed(2))}</h2><small class="position-relative pl-3 h5">Dinheiro-Cartão-POS-Convênio - ${mesAnoPassado}</small>`
  );

}

async function retornoListaLojasComMaisVendas(respostaListaVenda, idTabela = '', tituloTabela = '') {
  let { data } = respostaListaVenda || [];
  let dadosTabela = [];

  if (data.length > 0) {
    for (var i = 0; i < 3; i++) {
      if (data[i] == undefined) {
        break;
      }

      let index = i + 1;
      let dsEmpresa = data[i]?.NOFANTASIA;
      let totalDiponivel = data[i]?.VALORTOTALVENDA;

      dadosTabela.push([
        `<label style="color: blue; font-size: 11px;">` + index + `</label>`,
        `<label style="color: blue; font-size: 11px;">` + dsEmpresa + `</label>`,
        `<label style="color: blue; font-size: 12px;">` + maskValorEmBRL(totalDiponivel) + `</label>`,
      ]);
    }
  }

  console.log('dadosTabela: ', dadosTabela);

  let htmlTabela = `
    <div class="col-xl-4">
      <div class="panel">
        <div class="panel-hdr">
          <h2>
            Top de Vendas <span class="fw-300"><i>${tituloTabela}</i></span>
          </h2>
        </div>
        <div class="panel-container show">
          <div class="panel-content">
            <table id="${idTabela}"
              class="table table-bordered table-hover table-striped w-100 .dt-responsive">
              <thead class="bg-primary-600">
                <tr>
                  <th style="width: 5%">#</th>
                  <th style="width: 60%">Loja</th>
                  <th style="width: 35%">Venda</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  let existTabelaNaDiv = $('#tabelasTop3LojasMaisVendas #dt-basic-top-venda-tesoura').length > 0;

  if (existTabelaNaDiv) {
    $('#tabelasTop3LojasMaisVendas').append(htmlTabela);
  } else {
    $('#tabelasTop3LojasMaisVendas').html(htmlTabela);
  }

  $(`#${idTabela}`).DataTable({
    data: dadosTabela,
    responsive: true,
    paging: false,
    searching: false,
    info: false,
    columnDefs: [
      { "type": "currency-brl", "targets": [2] },
    ],
    language: {
      emptyTable: 'Aguardando Vendas...',
      zeroRecords: 'Não há Vendas no Momento'
    },
  });
}

async function calcularPorcetagemEntreValores(valorAtual = 0, valorAnterior = 0) {
  let porcentagem = valorAtual == 0 && valorAnterior == 0 ? 0 : (((valorAtual - valorAnterior) / valorAnterior) * 100);

  return porcentagem == Infinity ? valorAtual : parseFloat(porcentagem).toFixed(2);
}

//? ================= FIM ROTINA DASHBOARD COMPARATIVO ENTRE VENDAS DO ANO PASSADO E ANO ATUAL ================= ?// 

//? ================= INICIO ROTINA DASHBOARD DE VENDAS EM CONTINGENCIA ================= ?// 

async function carregarDadosDashboardVendasContingencia() {
  animationLoadingStart('Carregando Dados...');

  $('#js-page-content').html('');

  try {
    let respostaListaTotaisVendasContingenciaPorEstadoMes = await ajaxGetAllData(`api/dashboard/venda/venda-contingencia-agrupado-uf.xsjs?dataPesquisaInicio=${dataPrimeiroDiaFormatado}&dataPesquisaFim=${dataAtualCampo}`, false);
    let respostaListaTotaisVendasContingenciaPorEstadoDiaAtual = await ajaxGetAllData(`api/dashboard/venda/venda-contingencia-agrupado-uf.xsjs?dataPesquisaInicio=${dataAtualCampo}&dataPesquisaFim=${dataAtualCampo}`, false);
    let respostaListaVendasContingenciaMes = await ajaxGetAllData(`api/dashboard/venda/lista-venda-contingencia.xsjs?dataInicio=${dataAtualCampo}&dataFim=${dataAtualCampo}`, false);
    let respHtml = await $.get('dashboardforanew_action_comparativo_vendas_em_contingencia.html');

    $('#js-page-content').html(respHtml);
    $('#parametro_dia').val(dataAtualCampo);
    $('.parametro_dia').text(`${devolverDiaSemana(diaSemana)}  ${dataAtual}`);
    $('#mesAnoTotalGeralVendasContingenciaMes').text(`${meseano}`);
    $('#diaTotalGeralVendasContingenciaDia').text(`${devolverDiaSemana(diaSemana)} (${dataAtual})`);

    await retornoCardsVendasContingenciaPorEstadoMes(respostaListaTotaisVendasContingenciaPorEstadoMes);
    await retornoCardsVendasContingenciaPorEstadoDiaAtual(respostaListaTotaisVendasContingenciaPorEstadoDiaAtual);
    await retornoListarTodasVendasEmContingenciaDoDia(respostaListaVendasContingenciaMes);

    animationLoadingStop();

    clearInterval(setIntervalCarregaDados);

    setIntervalCarregaDados = setInterval(async () => {
      await carregarDadosDashboardVendasContingencia('vendaContingencia');
    }, tempoAtualizaDados);

  } catch (error) {
    console.log('Erro ao carregar os dados do dashboard: ', error);

    await msgError('Error ao carregar os dados!', (error?.msg || error?.message || 'Recarregue a página ou aguarde.'));

    await modalTomadaDeAcaoAposErro();
  }

}

/*async function retornoCardsVendasContingenciaPorEstadoMes(respostaListaTotaisVendasContingenciaPorEstadoMes) {
  let { data } = respostaListaTotaisVendasContingenciaPorEstadoMes || [];
  let arrayCores = ['bg-info-300', 'bg-success-500', 'bg-warning-500', 'bg-danger-300'];
  let htmlCard = '';
  let totalGeralVendasContingencia = 0;
  let tamanhoCard = 3;
  let idCor = 0;

  data = Array(40).fill(data).flat();

  data = data.slice(0, 5)

  for (let i = 0; i < data.length; i++) {
    let UF = data[i].UF;
    let qtdTotalVendasContingencia = data[i].QTDTOTALVENDAS || 0;
    let qtdCards = data?.length;
    let corSelecionada = arrayCores[idCor];

    idCor++;

    idCor = idCor > arrayCores.length - 1 ? 0 : idCor;
    
    tamanhoCard = (qtdCards <= 2) ? 4 : tamanhoCard;

    totalGeralVendasContingencia += Number(qtdTotalVendasContingencia);

    htmlCard += `
      <div class="col-sm-6 col-xl-${tamanhoCard}">
        <div class="card text-white ${corSelecionada} mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1 text-left pl-2">
                <div class="mb-3">
                  <h5 class="fw-500 mb-0 pb-0 text-truncate"> Total Vendas Em Contingência - Mês: ${meseano} </h5>
                </div>
                <div class="mb-1">
                  <h2 class="display-3 d-inline-block l-h-n m-0 fw-500">
                    ${maskValorEmInteiro(qtdTotalVendasContingencia)} 
                  </h2>
                </div>
              </div>
              <div class="flex-grow-2 text-right opacity-50 pr-2">
                <span style="font-size: 3rem;font-family: 'Font Awesome 5 Pro'"> ${UF || 'Geral'} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

  }

  $('#cardsTotaisVendasContingenciaPorEstadoMesGeral').html(`
    <div class="col-sm-6 col-xl-6-">
      <div class="card text-white bg-primary-400 mb-3">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1 text-left pl-2">
              <div class="mb-3">
                <h5 class="fw-500 mb-0 pb-0 text-truncate"> Total Vendas Em Contingência - Mês: ${meseano} </h5>
              </div>
              <div class="mb-1">
                <h2 class="display-3 d-inline-block l-h-n m-0 fw-500">
                  ${maskValorEmInteiro(totalGeralVendasContingencia)} 
                </h2>
              </div>
            </div>
            <div class="flex-grow-2 text-right opacity-50 pr-2">
              <span style="font-size: 3rem;font-family: 'Font Awesome 5 Pro'"> ${'Geral'} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
  
  $('#cardsTotaisVendasContingenciaPorEstadoMes').html(htmlCard);
}*/

/*async function retornoCardsVendasContingenciaPorEstadoDiaAtual(respostaListaTotaisVendasContingenciaPorEstadoDiaAtual) {
  let { data } = respostaListaTotaisVendasContingenciaPorEstadoDiaAtual || [];
  let arrayCores = ['bg-info-700', 'bg-success-700', 'bg-warning-700', 'bg-danger-700'];
  let qtdTotalGeralVendasContingencia = 0;
  let htmlCard = '';
  let tamanhoCard = 3;
  let idCor = 0;

  data = Array(40).fill(data).flat();

  data = data.slice(0, 5)

  for (let i = 0; i < data.length; i++) {
    let UF = data[i].UF;
    let qtdTotalVendasContingencia = data[i].QTDTOTALVENDAS || 0;
    let corSelecionada = arrayCores[idCor];
    let qtdCards = data?.length;

    idCor++;

    idCor = idCor > arrayCores.length - 1 ? 0 : idCor;
    
    tamanhoCard = (qtdCards <= 2) ? 4 : tamanhoCard;
    
    qtdTotalGeralVendasContingencia += Number(qtdTotalVendasContingencia);

    htmlCard += `
      <div class="col-sm-6 col-xl-${tamanhoCard}">
        <div class="card text-white ${corSelecionada} mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1 text-left pl-2">
                <div class="mb-3">
                  <h5 class="fw-500"> Total Vendas Em Contingência - Hoje: ${devolverDiaSemana(diaSemana)} (${dataAtual})</h5>
                </div>
                <div class="mb-1">
                  <h2 class="display-3 d-inline-block l-h-n m-0 fw-500">
                    ${maskValorEmInteiro(qtdTotalVendasContingencia)} 
                  </h2>
                </div>
              </div>
              <div class="flex-grow-2 text-right opacity-50 pr-2">
                <span style="font-size: 3rem;font-family: 'Font Awesome 5 Pro'"> ${UF || 'Geral'} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

  }

  $('#cardsTotaisVendasContingenciaPorEstadoMesGeral').append(`
    <div class="col-sm-6 col-xl-6">
      <div class="card text-white bg-primary-500 mb-3">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1 text-left pl-2">
              <div class="mb-3">
                <h5 class="fw-500"> Total Vendas Em Contingência - Hoje: ${devolverDiaSemana(diaSemana)} (${dataAtual})</h5>
              </div>
              <div class="mb-1">
                <h2 class="display-3 d-inline-block l-h-n m-0 fw-500">
                  ${maskValorEmInteiro(qtdTotalGeralVendasContingencia)} 
                </h2>
              </div>
            </div>
            <div class="flex-grow-2 text-right opacity-50 pr-2">
              <span style="font-size: 3rem;font-family: 'Font Awesome 5 Pro'"> ${'Geral'} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
  
  $('#cardsTotaisVendasContingenciaPorEstadoDiaAtual').append(htmlCard);
}*/

async function retornoCardsVendasContingenciaPorEstadoMes(respostaListaTotaisVendasContingenciaPorEstadoMes) {
  let { data } = respostaListaTotaisVendasContingenciaPorEstadoMes || [];
  let arrayCores = ['bg-info-300', 'bg-success-500', 'bg-warning-500', 'bg-danger-300'];
  let htmlCard = '';
  let totalGeralVendasContingencia = 0;
  let tamanhoCard = 3;
  let idCor = 0;

  //data = Array(40).fill(data).flat().slice(0, 10);
  for (let i = 0; i < data.length; i++) {
    let UF = data[i].UF;
    let qtdTotalVendasContingencia = data[i].QTDTOTALVENDAS || 0;
    let qtdCards = data?.length;
    let corSelecionada = arrayCores[idCor];
    let tamanhoCard = qtdCards <= 2 ? 6 : (qtdCards % 3 == 0 && qtdCards % 4 != 0) ? 4 : 3;

    idCor++;

    idCor = idCor > arrayCores.length - 1 ? 0 : idCor;

    totalGeralVendasContingencia += Number(qtdTotalVendasContingencia);

    htmlCard += `
      <div class="col-sm-6 col-xl-${tamanhoCard}">
        <div class="card text-white ${corSelecionada} mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1 text-left pl-2">
                <div class="mb-3">
                  <h5 class="fw-500 mb-0 pb-0 text-truncate">Total Vendas Em Contingência - Hoje: ${devolverDiaSemana(diaSemana)} (${dataAtual})</h5>
                </div>
                <div class="mb-1">
                  <h2 id="qtdVendasContingenciaDia_${UF}" class="display-3 d-inline-block l-h-n m-0 fw-500"> 0 </h2>
                </div>
                <div>
                  <h2 class="d-inline-block l-h-n m-0 fw-400">${maskValorEmInteiro(qtdTotalVendasContingencia)} </h2>
                  <small class="position-relative pl-3 h5 text-light text-truncate">Total Vendas Em Contingência - Mês: ${meseano} </small>
                </div>
              </div>
              <div class="flex-grow-2 position-absolute pos-right text-right opacity-50 pr-2">
                <span style="font-size: 3rem;font-family: 'Font Awesome 5 Pro'"> ${UF} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

  }

  $(`#totalGeralVendasContingenciaMes`).text(`${maskValorEmInteiro(totalGeralVendasContingencia)}`);
  $('#cardsTotaisVendasContingenciaPorEstadoMes').html(htmlCard);

}

async function retornoCardsVendasContingenciaPorEstadoDiaAtual(respostaListaTotaisVendasContingenciaPorEstadoDiaAtual) {
  let { data } = respostaListaTotaisVendasContingenciaPorEstadoDiaAtual || [];
  let arrayCores = ['bg-info-700', 'bg-success-700', 'bg-warning-700', 'bg-danger-700'];
  let qtdTotalGeralVendasContingencia = 0;
  let htmlCard = '';
  let tamanhoCard = 4;
  let idCor = 0;

  for (let i = 0; i < data.length; i++) {
    let UF = data[i].UF;
    let qtdTotalVendasContingencia = data[i].QTDTOTALVENDAS || 0;
    let corSelecionada = arrayCores[idCor];
    let qtdCards = data?.length;

    idCor++;

    idCor = idCor > arrayCores.length - 1 ? 0 : idCor;

    tamanhoCard = (qtdCards % 6 == 0) ? 2 : tamanhoCard;

    qtdTotalGeralVendasContingencia += Number(qtdTotalVendasContingencia);

    $('#qtdVendasContingenciaDia_' + UF).text(maskValorEmInteiro(qtdTotalVendasContingencia));
  }

  $(`#totalGeralVendasContingenciaDiaAtual`).text(`${maskValorEmInteiro(qtdTotalGeralVendasContingencia)}`);

}

async function retornoListarTodasVendasEmContingenciaDoDia(respostaListarTodasVendasEmContingenciaMes) {
  let dadosTabela = [];
  let dadosVenda = respostaListarTodasVendasEmContingenciaMes.data || []
  let contador = 0;

  if (dadosVenda.length) {
    for (let dados of dadosVenda) {
      let nomeEmpresa = dados?.NOFANTASIA;
      let siglaGrupoEmpresa = nomeEmpresa?.split(' - ')[1]?.trim() || '';
      let ufEmpresa = dados?.UF;
      let dataVenda = dados?.DTHORAFECHAMENTO;
      let idVenda = dados?.IDVENDA;
      let serie = dados?.SERIE;
      let numNF = dados?.NF;
      let chaveNF = dados?.CHAVENFE || dados?.IDCHAVENFE;
      let situacao = dados?.STCONTINGENCIA == 'True' ? 'Contingência' : 'Sem Contingência';
      let valorVenda = dados?.VRTOTALPAGO ? maskValorEmBRL(dados?.VRTOTALPAGO) : "";
      let motivoContingencia = dados?.PROTNFE_INFPROT_XMOTIVO ? dados?.PROTNFE_INFPROT_XMOTIVO : "Sem Motivo";
      let opcoes = `
        <div class="btn-group btn-group-xs">
          <button id="detalharVendaContingencia" type="button" class="btn btn-success btn-xs" title="Detalhar Produtos da Venda" value="${idVenda}"><i class="fal fa-list "></i></button>
        </div> 
      `;

      dataVenda = dataVenda ? (new Date(dataVenda))?.toLocaleString('pt-BR').replaceAll(',', '') : "";
      chaveNF = chaveNF?.replace(/[a-zA-Z]*/g, '') || "";
      contador++;

      dadosTabela.push([
        contador,
        ufEmpresa,
        siglaGrupoEmpresa,
        nomeEmpresa,
        dataVenda,
        idVenda,
        serie,
        numNF,
        chaveNF,
        situacao,
        valorVenda,
        motivoContingencia
      ]);
    }
  }

  $('#tabelaVendasContingencia').html(
    ` <div class="col-xl-12">
        <div id="panel-1" class="panel">
          <div class="panel-hdr">
            <span class="text-dark h5 mb-0"> Lista Detalhada de Vendas em Contingência de Hoje: <span class="fw-900"> ${devolverDiaSemana(diaSemana)} (${dataAtual})</span></span>
          </div>
          <div class="panel-container show">
            <div class="panel-content">
              <table id="dt-basic-list-vendaContingencia" class="table table-bordered table-hover table-striped w-100 ">
                  <thead class="bg-primary-600">
                      <tr >
                          <th style="text-align: center">#</th>
                          <th style="text-align: center">UF</th>
                          <th style="text-align: center">Marca</th>
                          <th style="text-align: center">Empresa</th>
                          <th style="text-align: center">Data</th>
                          <th style="text-align: center">Venda</th>
                          <th style="text-align: center">Série</th>
                          <th style="text-align: center">NFCE</th>
                          <th style="text-align: center">Chave NF</th>
                          <th style="text-align: center">Situação</th>
                          <th style="text-align: center">Valor</th>
                          <th style="text-align: center">Motivo</th>
                        </tr>
                  </thead>
                  <tbody>
                  </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>`
  );

  $('#dt-basic-list-vendaContingencia').DataTable({
    data: dadosTabela,
    "columnDefs": [
      { "className": "text-center", "width": "2%", "targets": [1] },
      { "width": "2%", "targets": [2] },
      { "type": "date-time-br", "width": "7%", "targets": [4] },
      { "width": "2%", "targets": [6] },
    ],
    "displayLength": 25,
    "paging": true,
    "info": true,
    "searching": true,
    "deferRender": true,
    "responsive": true,
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

//? ================= FIM ROTINA DASHBOARD DE VENDAS EM CONTINGENCIA ================= ?//

//? ================= INICIO ROTINA DASHBOARD DE INTEGRACOES ENVIADAS PARA MINDSET ================= ?// 

async function carregarDadosDashboardIntegracoesEnviadasParaMindset() {
  animationLoadingStart('Carregando Dados...');

  clearInterval(setIntervalCarregaDados);

  $('#js-page-content').html('');

  try {
    let respostaTotaisIntegracoesEnviadasParaMinsetMes = await ajaxGetAllData(`api/dashboard/integracoes/totais-gerais-integracoes-mindset-por-mes-dia.xsjs?dataPesquisaInicio=${dataPrimeiroDiaFormatado}&dataPesquisaFim=${dataAtualCampo}`, false);
    let respostaTotaisIntegracoesPorTipoEnviadasParaMinsetDiaAtualTotalMes = await ajaxGetAllData(`api/dashboard/integracoes/totais-integracoes-mindset-por-tipo-mes-dia.xsjs?dataPesquisaInicio=${dataPrimeiroDiaFormatado}&dataPesquisaFim=${dataAtualCampo}`, false);
    let respostaListaIntegracoesParaMindsetMes = await ajaxGetAllData(`api/dashboard/integracoes/lista-integracoes-mindset.xsjs?dataPesquisaInicio=${dataAtualCampo}&dataPesquisaFim=${dataAtualCampo}`, false);
    let respHtml = await $.get('dashboardforanew_action_integracoes_enviadas_mindset.html');

    $('#js-page-content').html(respHtml);
    $('#parametro_dia').val(dataAtualCampo);
    $('.parametro_dia').text(`${devolverDiaSemana(diaSemana)}  ${dataAtual}`);
    $('#mesAnoTotalGeralIntegracoesParaMindsetMes').text(`${meseano}`);
    $('#diaTotalGeralIntegracoesParaMindsetDia').text(`${devolverDiaSemana(diaSemana)} (${dataAtual})`);

    await retornoCardsIntegracoesEnviadasParaMinsetMes(respostaTotaisIntegracoesEnviadasParaMinsetMes);
    await retornoCardsIntegracoesPorTipoEnviadasParaMinsetDiaAtualTotalMes(respostaTotaisIntegracoesPorTipoEnviadasParaMinsetDiaAtualTotalMes);
    await retornoListarTodasIntegracoesEnviadasParaMindsetDoDia(respostaListaIntegracoesParaMindsetMes);

    animationLoadingStop();

  } catch (error) {
    console.log('Erro ao carregar os dados do dashboard: ', error);

    await msgError('Error ao carregar os dados!', (error?.msg || error?.message || 'Recarregue a página ou aguarde.'));
  }

}

async function retornoCardsIntegracoesEnviadasParaMinsetMes(respostaListaTotaisIntegracoesEnviadasParaMinsetMes) {
  let { data } = respostaListaTotaisIntegracoesEnviadasParaMinsetMes || [];
  let arrayCores = ['bg-primary-500', 'bg-info-300', 'bg-success-500', 'bg-warning-500', 'bg-danger-300'];
  let htmlCard = '';
  let totalGeralIntegracoesParaMindset = 0;
  let tamanhoCard = 3;
  let idCor = 0;

  //data = Array(40).fill(data).flat().slice(0, 10);
  for (let i = 0; i < data.length; i++) {
    let nomeAPI = data[i].NOMEAPI;
    let qtdTotalMes = data[i].QTDTOTALMES || 0;
    let qtdDia = data[i].QTDTOTALDIA || 0;
    let qtdCards = data?.length;
    let corSelecionada = arrayCores[idCor];
    let tamanhoCard = qtdCards <= 2 ? 6 : (qtdCards % 3 == 0 && qtdCards % 4 != 0) ? 4 : 3;

    idCor++;

    idCor = idCor > arrayCores.length - 1 ? 0 : idCor;

    totalGeralIntegracoesParaMindset += Number(qtdTotalMes);

    htmlCard += `
      <div class="col-sm-6 col-xl-6-">
        <div class="card text-white bg-primary-500 mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1 text-left pl-2">
                <div class="mb-3">
                  <h5 class="fw-500 mb-0 pb-0 text-truncate"> Total Integrações - Mês: ${meseano} </h5>
                </div>
                <div class="mb-1">
                  <h2 id="totalGeraIntegracoesParaMindsetMes" class="display-3 d-inline-block l-h-n m-0 fw-500"> ${maskValorEmInteiro(qtdTotalMes)} </h2>
                </div>
              </div>
              <div class="flex-grow-2 position-absolute pos-right text-right opacity-50 pr-2">
                <span style="font-size: 3rem;font-family: 'Font Awesome 5 Pro'">Geral</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-6">
        <div class="card text-white bg-primary-500 mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1 text-left pl-2">
                <div class="mb-3">
                  <h5 class="fw-500 text-truncate"> Total Integrações - Hoje: ${devolverDiaSemana(diaSemana)} (${dataAtual})</h5>
                </div>
                <div class="mb-1">
                  <h2 id="totalGeraIntegracoesParaMindsetDiaAtual" class="display-3 d-inline-block l-h-n m-0 fw-500"> ${maskValorEmInteiro(qtdDia)} </h2>
                </div>
              </div>
              <div class="flex-grow-2 position-absolute pos-right text-right opacity-50 pr-2">
                <span style="font-size: 3rem;font-family: 'Font Awesome 5 Pro'"> Geral </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

  }

  $('#cardsTotaisIntegracoesParaMindsetMesGeral').html(htmlCard);

}

async function retornoCardsIntegracoesPorTipoEnviadasParaMinsetDiaAtualTotalMes(respostaListaTotaisIntegracoesEnviadasParaMinsetMes) {
  let { data } = respostaListaTotaisIntegracoesEnviadasParaMinsetMes || [];
  let arrayCores = ['bg-primary-500', 'bg-info-300', 'bg-success-500', 'bg-warning-500', 'bg-danger-300'];
  let htmlCard = '';
  let totalGeralIntegracoesParaMindset = 0;
  let tamanhoCard = 3;
  let idCor = 0;

  //data = Array(40).fill(data).flat().slice(0, 10);
  for (let i = 0; i < data.length; i++) {
    let nomeAPI = data[i].NOMEAPI;
    let qtdDia = data[i].QTDTOTALDIA || 0;
    let qtdTotalMes = data[i].QTDTOTALMES || 0;
    let qtdCards = data?.length;
    let corSelecionada = arrayCores[idCor];
    let tamanhoCard = qtdCards <= 2 ? 6 : (qtdCards % 3 == 0 && qtdCards % 4 != 0) ? 4 : 3;

    idCor++;

    idCor = idCor > arrayCores.length - 1 ? 0 : idCor;

    totalGeralIntegracoesParaMindset += Number(qtdTotalMes);

    htmlCard += `
      <div class="col-sm-6 col-xl-${tamanhoCard}">
        <div class="card text-white ${corSelecionada} mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1 text-left pl-2">
                <div class="mb-3">
                  <h5 class="fw-500 mb-0 pb-0 text-truncate">Total Integrações - Hoje: ${devolverDiaSemana(diaSemana)} (${dataAtual})</h5>
                </div>
                <div class="mb-1">
                  <h2 class="display-3 d-inline-block l-h-n m-0 fw-500"> ${maskValorEmInteiro(qtdDia)} </h2>
                </div>
                <div>
                  <h2 class="d-inline-block l-h-n m-0 fw-400">${maskValorEmInteiro(qtdTotalMes)} </h2>
                  <small class="position-relative pl-3 h5 text-light text-truncate">Total Integrações - Mês: ${meseano} </small>
                </div>
              </div>
              <div class="flex-grow-2 position-absolute pos-right text-right opacity-50 pr-2">
                <span style="font-size: 3rem;font-family: 'Font Awesome 5 Pro'"> ${nomeAPI} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

  }

  $('#cardsTotaisIntegracoesParaMindsetMes').html(htmlCard);

}

async function retornoListarTodasIntegracoesEnviadasParaMindsetDoDia(respostaListarTodasIntegracoesParaMindsetMes) {
  let dadosTabela = [];
  let dadosVenda = respostaListarTodasIntegracoesParaMindsetMes.data || []
  let contador = 0;

  if (dadosVenda.length) {
    for (let dados of dadosVenda) {
      let idResumoIntegracaoOTB = dados?.IDRESUMOINTEGRACAOOTB;
      let idDetalheIntegracaoOTB = dados?.IDDETALHEINTEGRACAOOTB; 
      let nomeAPI = dados?.NOMEAPI;
      let dtHoraInicio = dados?.DTHORAINICIO;
      let dtHoraFim = dados?.DTHORAFIM;
      let totalRegistros = dados?.TOTALREGISTROS;
      let totalLotes = dados?.TOTALLOTES;
      let totalLotesSucesso = dados?.TOTALLOTESSUCESSO;
      let totalLotesErro = dados?.TOTALLOTESERRO;
      let status = dados?.STATUS;
      let opcoes = `
        <div class="btn-group btn-group-xs">
          <button id="${idResumoIntegracaoOTB}" type="button" class="btn btn-success btn-xs" title="Detalhar Produtos da Venda" onclick="detalharIntegracaoEnviadasParaMindset(this.id)"><i class="fal fa-list "></i></button>
        </div> 
      `;

      let spanStatus = status == 'CONCLUIDO' ? `<span class="text-success fw-700">${status}</span>` : (status == 'ERRO' ? `<span class="text-danger fw-700">${status}</span>` : `<span class="text-warning fw-700">${status}</span>`);

      contador++;

      dadosTabela.push([
        contador,
        nomeAPI,
        dtHoraInicio,
        dtHoraFim,
        totalRegistros,
        totalLotes,
        totalLotesSucesso,
        totalLotesErro,
        spanStatus,
        opcoes,
      ]);
    }
  }

  $('#tabelaIntegracoesParaMindset').html(
    ` <div class="col-xl-12">
        <div id="panel-1" class="panel">
          <div class="panel-hdr">
            <span class="text-dark h5 mb-0"> Lista Detalhada de Integrações para o Mindset de Hoje: <span class="fw-900"> ${devolverDiaSemana(diaSemana)} (${dataAtual})</span></span>
          </div>
          <div class="panel-container show">
            <div class="panel-content">
              <table id="dt-basic-list-integracoesEnviadasParaMindset" class="table table-bordered table-hover table-striped w-100 ">
                  <thead class="bg-primary-600">
                      <tr >
                          <th style="text-align: center">#</th>
                          <th style="text-align: center">API</th>
                          <th style="text-align: center">Data Início</th>
                          <th style="text-align: center">Data Fim</th>
                          <th style="text-align: center">Total Registros</th>
                          <th style="text-align: center">Total Lotes</th>
                          <th style="text-align: center">Total Lotes Sucesso</th>
                          <th style="text-align: center">Total Lotes Erro</th>
                          <th style="text-align: center">Status</th>
                          <th style="text-align: center">Opções</th>
                        </tr>
                  </thead>
                  <tbody>
                  </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>`
  );

  $('#dt-basic-list-integracoesEnviadasParaMindset').DataTable({
    data: dadosTabela,
    "columnDefs": [
      { "className": "text-center", "width": "2%", "targets": [0] },
      { "type": "date-time-br", "width": "7%", "targets": [2, 3] },
      { "className": "text-center", "targets": [9] },
    ],
    "displayLength": 25,
    "paging": true,
    "info": true,
    "searching": true,
    "deferRender": true,
    "responsive": true,
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

async function detalharIntegracaoEnviadasParaMindset(idResumoIntegracaoOTB) {
  try{
    animationLoadingStart('Carregando Detalhes da Integração...', 0);

    await ajaxGetAllData(`api/dashboard/integracoes/lista-detalhes-integracao-mindset.xsjs?id=${idResumoIntegracaoOTB}`, false).then(retornoDetalharIntegracaoEnviadasParaMindsetModal);

  } catch (error) {
    console.error('Erro ao detalhar integração:', error);
    msgError('Erro ao detalhar integração!', (error?.msg || error?.message || 'Recarregue a página ou aguarde.'));
  }
}

async function retornoDetalharIntegracaoEnviadasParaMindsetModal(dadosDetalheIntegracaoEnviadasParaMindset) {
  let { data } = dadosDetalheIntegracaoEnviadasParaMindset || [];
  let dadosTabela = [];
  let count = 0;
  let nomeAPI = '';

  if (data.length) {
    nomeAPI = data[0]?.NOMEAPI || '';

    for (let dados of data) {
      let idDetalheIntegracaoOTB = dados?.IDDETALHEINTEGRACAOOTB;
      let numLote = dados?.NUMEROLOTE;
      let registroInicial = dados?.REGISTROINICIAL;
      let registroFinal = dados?.REGISTROFINAL;
      let totalRegistros = dados?.TOTALREGISTROS;
      let dtHoraInicio = dados?.DTHORAINICIO;
      let dtHoraFim = dados?.DTHORAFIM;
      let numTentativas = dados?.TENTATIVAS;
      let status = dados?.STATUS;
      let msgError = dados?.MSGERROR?.replace(/"/g, '&quot;').substring(0, 2000) || '';

      let spanStatus = status == 'SUCESSO' ? `<span class="text-success fw-700">${status}</span>` : (status == 'ERRO' ? `<span class="text-danger fw-700">${status}</span>` : `<span class="text-warning fw-700">${status}</span>`);

      dadosTabela.push([
        numLote,
        registroInicial,
        registroFinal,
        totalRegistros,
        dtHoraInicio,
        dtHoraFim,
        numTentativas,
        spanStatus,
        msgError,
      ]);

    }
  }

  await abrirModalDetalheIntegracaoEnviadasParaMindset(nomeAPI, dadosTabela);

}

async function abrirModalDetalheIntegracaoEnviadasParaMindset(nomeAPI, dadosTabela) {
  let htmlTabela = `
    <div class="col-xl-12 d-none">
        <div id="panel-1" class="panel">
          <div class="panel-hdr">
            <span class="text-dark h5 mb-0"> Lista Detalhada de Integrações</span>
          </div>
          <div class="panel-container show">
            <div class="panel-content">
              <table id="dt-basic-list-detalhesIntegracoesEnviadasParaMindset" class="table table-bordered table-hover table-striped w-100 ">
                  <thead class="bg-primary-600">
                      <tr >
                          <th style="text-align: center">Nº Lote</th>
                          <th style="text-align: center">Nº Registro Início</th>
                          <th style="text-align: center">Nº Registro Fim</th>
                          <th style="text-align: center">Total Registros</th>
                          <th style="text-align: center">Data Início</th>
                          <th style="text-align: center">Data Fim</th>
                          <th style="text-align: center">Nº Tentativas</th>
                          <th style="text-align: center">Status</th>
                          <th style="text-align: center">Obs</th>
                        </tr>
                  </thead>
                  <tbody class="text-left">
                  </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  `;

  
  await Swal.fire({
    title: `Detalhes da Integração ( ${nomeAPI} )`,
    html: htmlTabela,
    width: '70%',
    showCloseButton: true,
    showCancelButton: false,
    focusConfirm: false,
    confirmButtonText: 'Fechar',
    
    onOpen: async () => {
      Swal.showLoading();

      await new Promise((resolve) => { 
        setTimeout(() => {
          resolve();
        }, 1000)
      });
      
      $('#dt-basic-list-detalhesIntegracoesEnviadasParaMindset').DataTable({
        data: dadosTabela,
        "columnDefs": [
          { "className": "text-center", "width": "2%", "targets": [0] },
          { "type": "date-time-br", "width": "10%", "targets": [4, 5] },
          { 
            "targets": [8],
            "width": "25%",
            render: function (data) {
              return `
                <div class="text-truncate" style="max-width: 300px;" title="${data}">
                  ${data}
                </div>
              `;
            }
          },
        ],
        "displayLength": 25,
        "paging": true,
        "info": true,
        "searching": true,
        "deferRender": true,
        "responsive": true,
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
        initComplete: function () {
          Swal.hideLoading();

          $('.swal2-container').css('overflow', 'auto');
          $('#swal2-content div').removeClass('d-none');
        }
      });
    }
  });
}

//? ================= FIM ROTINA DASHBOARD DE INTEGRACOES ENVIADAS PARA MINDSET ================= ?//