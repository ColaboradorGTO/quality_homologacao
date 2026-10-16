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
var dia_sem = data.getDay(); // 0-6 (zero=domingo)
var mes = data.getMonth(); // 0-11 (zero=janeiro)
var ano2 = data.getYear(); // 2 dígitos
var ano4 = data.getFullYear();
var anoPassado = data.getFullYear() - 1// 4 dígitos
var hora = data.getHours();          // 0-23
var min = data.getMinutes();


diaFormatado = String(dia);
mesatual = (mes + 1);
tresmesesatras = (mes - 3);
mesFormatado = String(mesatual);
diaFormatadoPassado = String(dia)

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

var dataAnoPassado = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + anoPassado;

let horaAtualCampo = hora + ':' + min;
let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');
let dataAnoPassadoCampo = anoPassado + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');
let diaAnoPassadoCampo = anoPassado + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoPassado.padStart(2, '0');
let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

var dataPesquisaFormatada = dataAtual;

//PEGANDO O PRIMEITO DIA DO MÊS ATUAL////////////////

var primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);

let diaMesAtual = primeiroDia.getDate();
let diaFormatadoMesAtual = String(diaMesAtual);
let dataPrimeiroDiaFormatado = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoMesAtual.padStart(2, '0');

var meseano = nomeMes(mes) + '/' + ano4;
var mesAnoPassado = nomeMes(mes) + '/' + anoPassado

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

//////////////// Página Inicial //////////////////


var setIntervalCarregaDados;
var tempoAtualizaDados = 12000;

$(document).ready(async () => {
  await carrega_Dados();

  setIntervalCarregaDados = setInterval(async () => {
    await atualizar_dados();
  }, tempoAtualizaDados);
});

async function atualizar_dados() {
  await $('#dt-basic-top-venda-tesoura').DataTable().clear().destroy()
  await $('#dt-basic-top-venda-magazine').DataTable().clear().destroy()
  await $('#dt-basic-top-venda-freecenter').DataTable().clear().destroy()
  //await $('#dt-basic-top-venda-yorus').DataTable().clear().destroy()
  //await $('#dt-basic-top-venda-outlet').DataTable().clear().destroy()

  await carrega_Dados();
}

async function carrega_Dados() {

  let data = new Date();
  let dia = data.getDate(); // 1-31
  let mes = data.getMonth(); // 0-11 (zero=janeiro)
  let ano4 = data.getFullYear();
  let anoPassado = data.getFullYear() - 1// 4 dígitos
  let hora = data.getHours();          // 0-23
  let min = data.getMinutes();
  min < 10 ? min = "0" + min : min = min     // 0-59
  let seg = data.getSeconds();
  seg < 10 ? seg = "0" + seg : seg = seg      // 0-59
  let horaAtual = hora + ':' + min + ':' + seg//':59:59'

  diaFormatado = String(dia);
  mesatual = (mes + 1);
  tresmesesatras = (mes - 3);
  mesFormatado = String(mesatual);
  diaFormatadoPassado = String(dia)

  let dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

  let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');
  let dataAnoPassadoCampo = anoPassado + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');
  let diaAnoPassadoCampo = anoPassado + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoPassado.padStart(2, '0');

  //PEGANDO O PRIMEITO DIA DO MÊS ATUAL////////////////

  let primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);

  let diaMesAtual = primeiroDia.getDate();
  let diaFormatadoMesAtual = String(diaMesAtual);
  let dataPrimeiroDiaFormatado = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoMesAtual.padStart(2, '0');
  let dataPrimeiroDiaFormatadoAnoPassado = anoPassado + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatadoMesAtual.padStart(2, '0');

  $('#parametro_dia').val(dataAtualCampo);
  $('.parametro_dia').text(`${devolverDiaSemana(diaSemana)}  ${dataAtual}`);

  animationLoadingStart('Carregando Dados...');

  await $('#dt-basic-top-venda-tesoura').DataTable().clear().destroy()
  await $('#dt-basic-top-venda-magazine').DataTable().clear().destroy()
  await $('#dt-basic-top-venda-freecenter').DataTable().clear().destroy()

  $('#tabelasTop3LojasMaisVendas').empty();

  try {
    await ajaxGetAllData(`api/financeiro/venda-total-mes.xsjs?dataPesquisaInicio=${dataPrimeiroDiaFormatado}&dataPesquisa=${dataAtualCampo}&horaFinal=${horaAtual}`, false)
      .then(retornoVendaTotalMes);

    await ajaxGetAllData(`api/financeiro/venda-total-mes.xsjs?dataPesquisaInicio=${dataPrimeiroDiaFormatadoAnoPassado}&dataPesquisa=${dataAnoPassadoCampo}&horaFinal=${horaAtual}`, false)
      .then(retornoVendaTotalMesAnoPassado);

    await ajaxGetAllData(`api/dashboard/venda-total-loja-hora.xsjs?dataPesquisa=${dataAtualCampo}&horaFinal=23:59:59`, false)
      .then(retornoVendaTotal);

    await ajaxGetAllData('api/dashboard/venda-total-loja-hora.xsjs?dataPesquisa=' + diaAnoPassadoCampo + '&horaFinal=' + horaAtual, false)
      .then(retornoVendaTotalAnoPassado);

    let listaLojasComMaisVendasTesoura = await ajaxGetAllData('api/financeiro/venda-total-to.xsjs?idgrupo=1&dataPesquisa=' + dataAtualCampo, false)

    let listaLojasComMaisVendasMagazine = await ajaxGetAllData('api/financeiro/venda-total-to.xsjs?idgrupo=2&dataPesquisa=' + dataAtualCampo, false)

    let listaLojasComMaisVendasFreecenter = await ajaxGetAllData('api/financeiro/venda-total-to.xsjs?idgrupo=4&dataPesquisa=' + dataAtualCampo, false)

    await retornoListaLojasComMaisVendas(listaLojasComMaisVendasTesoura, 'dt-basic-top-venda-tesoura', 'Tesoura');
    await retornoListaLojasComMaisVendas(listaLojasComMaisVendasMagazine, 'dt-basic-top-venda-magazine', 'Magazine');
    await retornoListaLojasComMaisVendas(listaLojasComMaisVendasFreecenter, 'dt-basic-top-venda-freecenter', 'Free Center');

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
        `<label style="color: blue; font-size: 12px;">` + new Intl.NumberFormat('br-BR', { style: 'currency', currency: 'BRL' }).format(totalDiponivel) + `</label>`,
      ]);
    }
  }

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
    language: {
      emptyTable: 'Aguardando Vendas...',
      zeroRecords: 'Não há Vendas no Momento'
    },
    paging: false,
    searching: false,
    info: false
  });
}

async function calcularPorcetagemEntreValores(valorAtual = 0, valorAnterior = 0) {
  let porcentagem = valorAtual == 0 && valorAnterior == 0 ? 0 : (((valorAtual - valorAnterior) / valorAnterior) * 100);

  return porcentagem == Infinity ? valorAtual : parseFloat(porcentagem).toFixed(2);
}

async function modalError(e) {
  clearInterval(setIntervalCarregaDados);

  if (!$('.swal2-container').hasClass('swal2-shown')) {
    Swal.fire({
      type: "error",
      title: `Servidor Indisponível no Momento!`,
      text: (e?.msg || e?.message || 'Recarregue a página ou aguarde.'),
      showConfirmButton: true,
      showCancelButton: true,
      showCloseButton: true,
      cancelButtonColor: '#d33',
      confirmButtonText: `Recarregar página`,
      cancelButtonText: `Aguardar...`,
      timer: 30000
    }).then((result) => {

      if (result.value == true) {
        $.ajaxSetup({ cache: false });
        location.reload();
      } else {

        setIntervalCarregaDados = setInterval(async () => {
          await atualizar_dados();
        }, tempoAtualizaDados)
      }

    })
  }

  console.log(e)
}
