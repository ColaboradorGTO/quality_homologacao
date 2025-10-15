/*
 * Author: Hendryw Deyvison
 * Data: 03/01/2024
 * Email: hendryw.deyvison@gmail.com
 * Data_Atualização: 25/08/2025
 */

if (!getCurrentUser()) {
    window.location.href = 'index.html';
}

var usuario = getCurrentUser().user;
var listaEmpresas = [];

var ipCliente = '';

var IDEmpresaLogin = usuario['IDEMPRESA'];
var NOEmpresaLogin = usuario['NOFANTASIA'];
var IDFuncionarioLogin = usuario['id'];
var NomeFuncionarioLogin = usuario['NOFUNCIONARIO'];
var IDGrupoEmpFuncionarioLogin = usuario['IDGRUPOEMPRESARIAL'];
var NOFuncaoLogin = usuario['DSFUNCAO'];

/////////// Pega Data Atual ///////////////////////

var data = new Date();
var data1mesesAtras = new Date();
var data2mesesAtras = new Date();

var dia = data.getDate(); // 1-31
var dia_sem = data.getDay(); // 0-6 (zero=domingo)
var mes = data.getMonth(); // 0-11 (zero=janeiro)
var ano2 = data.getYear(); // 2 dÃ­gitos
var ano4 = data.getFullYear(); // 4 dÃ­gitos
var hora = data.getHours();          // 0-23 
var min = data.getMinutes();        // 0-59
var seg = data.getSeconds();        // 0-59

data1mesesAtras.setMonth(data1mesesAtras.getMonth() - 1);

var ano1Mes = data1mesesAtras.getFullYear();
var mesFormatado1mes = (data1mesesAtras.getMonth() + 1).toString().padStart(2, '0');
var dia1mes = data1mesesAtras.getDate().toString().padStart(2, '0');

data2mesesAtras.setMonth(data2mesesAtras.getMonth() - 2);

var anodoismeses = data2mesesAtras.getFullYear();
var mesFormatado2meses = (data2mesesAtras.getMonth() + 1).toString().padStart(2, '0');
var diachek = data2mesesAtras.getDate().toString().padStart(2, '0');

diaFormatado = String(dia);
mesatual = (mes + 1);

var mesFormatado = String(mesatual);
var mesFormatado1mes = String(mes);

var dataVendaProdutoConsolidado = [];

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

let horaAtualCampo = hora + ':' + min;

let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let dataAtualCampo2Meses = anodoismeses + '-' + mesFormatado2meses + '-' + diachek;

let dataAtualCampo1Mes = ano1Mes + '-' + mesFormatado1mes + '-' + dia1mes;

var dataPesquisaFormatada = dataAtual;

var valorTotalRecebido = 0;

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

function mascara_num(obj) {
    valida_num(obj)
    if (obj.value.match("-")) {
        mod = "-";
    } else {
        mod = "";
    }
    valor = obj.value.replace("-", "");
    valor = valor.replace(",", "");
    if (valor.length >= 3) {
        valor = poe_ponto_num(valor.substring(0, valor.length - 2)) + "," + valor.substring(valor.length - 2, valor.length);
    }
    obj.value = mod + valor;
}

function poe_ponto_num(valor) {
    valor = valor.replace(/\./g, "");
    if (valor.length > 3) {
        valores = "";
        while (valor.length > 3) {
            valores = "." + valor.substring(valor.length - 3, valor.length) + "" + valores;
            valor = valor.substring(0, valor.length - 3);
        }
        return valor + "" + valores;
    } else {
        return valor;
    }
}

function valida_num(obj) {
    numeros = new RegExp("[0-9]");
    while (!obj.value.charAt(obj.value.length - 1).match(numeros)) {
        if (obj.value.length == 1 && obj.value == "-") {
            return true;
        }
        if (obj.value.length >= 1) {
            obj.value = obj.value.substring(0, obj.value.length - 1)
        } else {
            return false;
        }
    }
}

function logout() {
    LogoffUser();
    window.location.href = 'index.html';
}

function retornoIp(resp) {
    ipCliente = resp?.ip;
    console.log(resp)
}

$(document).ready(function() {
    $('.NoFuncionarioTitulo').text(NomeFuncionarioLogin);
    $('.NoEmpresaTitulo').text(NOEmpresaLogin);
    
    ListaProdutosEtiqueta()
})

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
// Fim Variaveis Globais da Rotina De Etiquetas//

// Inicio Funções Globais da Rotina De Etiquetas//

function pulaParaOProximo(event, inputElement) {
  if (event.key === "Enter") {
    event.preventDefault();

    var tableRow = inputElement.closest("tr");
    var nextRow = tableRow.nextElementSibling;

    while (nextRow) {
      var nextInput = nextRow.querySelector(".input-qtd:not(:disabled)");
      if (nextInput) {
        nextInput.focus();
        return;
      }
      nextRow = nextRow.nextElementSibling;
    }
  }
}

async function selecionaTodasLinhasProdEtiqueta(element) {
  let tabela = $('#dt-basic-lista-prodEtiquetas').DataTable();
  let stChecked = $(element).prop('checked');
  let stInputsChecked = false;

  if (stChecked) {
    await Swal.fire({
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
      .then(async (resp) => {
        if (resp.value) {
          tabela.rows().every(function () {
            let linhaTabela = $(this.node())

            linhaTabela.find('input[name="selecaoProdEtiqueta"]:not(:disabled)').prop('checked', stChecked).trigger('change');

            if (!stInputsChecked) {
              stInputsChecked = linhaTabela.find('input[name="selecaoProdEtiqueta"]:not(:disabled)').prop('checked') || false;
            }
          });
        }

        if (resp.dismiss == 'cancel') {
          $('input[name="selecaoProdEtiqueta"]:not(:disabled)').prop('checked', stChecked).trigger('change');

          if (!stInputsChecked) {
            stInputsChecked = $('input[name="selecaoProdEtiqueta"]:not(:disabled)').prop('checked') || false;
          }
        }
      })
  } else {
    tabela.rows().every(function () {
      let linhaTabela = $(this.node())

      linhaTabela.find('input[name="selecaoProdEtiqueta"]:not(:disabled)').prop('checked', stChecked).trigger('change');
    });
  }

  $(element).prop('checked', stInputsChecked);

  if (stInputsChecked) {
    $('.text-Marcar-Desmarcar-Todos').text('Desmarcar Todos');


    $('#btnImpEtiqueta, #btnAcumuladorImpEtiqueta').removeClass('d-none');
  } else {
    $('.text-Marcar-Desmarcar-Todos').text('Marcar Todos');

    $('#btnAcumuladorImpEtiqueta').addClass('d-none');

    if (!acumuladorEtiquetas?.length) {
      $('#btnImpEtiqueta, #btnEditarAcumuladorImpEtiqueta, #btnDeletarAcumuladorImpEtiquetas').addClass('d-none');
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
      $('#btnImpEtiqueta, #btnEditarAcumuladorImpEtiqueta, #btnDeletarAcumuladorImpEtiquetas').addClass('d-none');

    }

  }

  if (lengthInputsCheckeds) {
    $('#selecaoTodosProdEtiqueta').prop('checked', true);
    $('.text-Marcar-Desmarcar-Todos').text('Desmarcar Todos');

    $('#btnAcumuladorImpEtiqueta').removeClass('d-none');
    $('#btnImpEtiqueta').removeClass('d-none');
  }
}

function selecionaProdPelaQtd(element) {
  let linhaProdTabela = $(element).closest('tr');
  let valorInput = Number(element.value.replace(/\D/g, '') || 0);
  let inputQtdProd = linhaProdTabela.find('td:eq(1) input');

  valorInput = valorInput || 1;

  element.value = valorInput;

  $(inputQtdProd).attr('qtdprod', valorInput);

  !$(inputQtdProd).prop('checked') && $(inputQtdProd).click();

}

function trocaQtdProd(element) {
  let linhaProdTabela = $(element).closest('tr');
  let valorInput = Number(element.value.replace(/\D/g, '') || 0);
  let inputQtdProd = linhaProdTabela.find('td:eq(1) input');

  valorInput = valorInput || 1;

  element.value = valorInput;

  $(inputQtdProd).attr('qtdprod', valorInput);
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
    $('#btnEditarAcumuladorImpEtiqueta, #btnDeletarAcumuladorImpEtiquetas').removeClass('d-none');
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

      $('#btnEditarAcumuladorImpEtiqueta, #btnDeletarAcumuladorImpEtiquetas').addClass('d-none');

      $('#selecaoTodosProdEtiqueta').prop('checked', false);
      selecionaTodasLinhasProdEtiqueta($('#selecaoTodosProdEtiqueta')[0]);

      !$('[name="selecaoProdEtiqueta"]:checked')?.length && $('#btnImpEtiqueta').addClass('d-none');

    }
  })
    .then(resp => resp.value && msgSuccess('Limpo com Sucesso!'))
}

function pulaPreviewEtiqueta(event) {
  if (event.ctrlKey && (event.key.toLowerCase() === 'p' || event.code === 'KeyP')) {
    event.preventDefault();

    $('#modalGenerico').modal('hide');
    $('#modalGenerico .modal-dialog').removeAttr('style');
    modalImpEtiqueta(false);
  }
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
  let qtdCopias = Number($('#qtdCopias').val()) ? Number($('#qtdCopias').val()) : 1;
  let contadorPaginas;

  $('#qtdCopias').val(qtdCopias);

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

  contadorEtiquetas = contadorEtiquetas * qtdCopias;
  contadorPaginas = contadorPaginas * qtdCopias;

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

function fecharModalGenerico() {
  $('#modalGenerico').modal('hide');
  $('#modalGenerico .modal-dialog').removeAttr('style');
}
// Fim Funções Globais da Rotina De Etiquetas//

async function ListaProdutosEtiqueta() {
  try {
    animationLoadingStart();

    await $.get("etiquetagem_action_tela_etiqueta_produto.html", (resp) => $('#js-page-content').html(resp));

    await ajaxGetAllData('api/produtos/listas-de-precos-SAP.xsjs', false).then(retornoListadePreçosGrupos);

    $('#idListaPreco').select2();

    $('.numPedidoEtiqueta').addClass('d-none');

    $('#idProdEtiqueta, #descProdEtiqueta, #codBarrasProdEtiqueta').on('keypress', (e) => { if (e.keyCode == 13) pesquisaProdutos() });

    $('input[name="qtdProdutoEtiqueta"]').off('keypress');

    animationLoadingStop();

  } catch (error) {
    msgError();
    console.log(error);
  }
}

function retornoListadePreçosGrupos(dadosListasPreco) {
  let { data } = dadosListasPreco || [];

  $('#idListaPreco').html('<option value="">Selecione...</option>');

  for (let { listaPreco } of data) {
    let {
      STATIVO,
      IDRESUMOLISTAPRECO,
      NOMELISTA
    } = listaPreco || '';

    if (IDRESUMOLISTAPRECO && STATIVO == 'True') {
      $('#idListaPreco').append(`<option value="${IDRESUMOLISTAPRECO}">${NOMELISTA}</option>`);
    }
  }
}

function retornoListadePreçosLojas(respostaListadePreços) {
  let { data } = respostaListadePreços || [];

  for (let { listaPreco } of data) {
    let { IDEMPRESA, NOFANTASIA } = listaPreco || "";
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

      $('#descProdEtiqueta').append(`<option value="${idProd}">${descProd}</option>`);
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
  let { data } = respostaDadosProdutos || [];

  if (data.length) {

    for (let dadosPedidos of data) {
      let idPedido = dadosPedidos.IDPEDIDO;
      let descPedido = dadosPedidos.NOFORNECEDOR;

      $('#numPedidoEtiqueta').append(`<option value="${idPedido}">${idPedido} - ${descPedido}</option>`);
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

async function pesquisaProdutos() {
  let idProduto = $('#idProdEtiqueta')?.val()?.trim() || "";
  let descProd = $('#descProdEtiqueta')?.val()?.trim() || "";
  let codBarras = $('#codBarrasProdEtiqueta')?.val()?.trim() || "";
  let idLista = $('#idListaPreco')?.val() || "";

  if (idLista != '' && (idProduto || descProd || codBarras)) {
    try {
      await ajaxGetAllData(`api/produtos/lista-produtos-etiqueta-SAP.xsjs?idLista=${idLista}&id=${idProduto}&descProd=${descProd}&codeBars=${codBarras}`)
        .then(retornoPesquisaProdutos);
    } catch (erro) {
      msgError('Erro ao carregar os dados')
      console.log(erro);
    }
  }
}

function retornoPesquisaProdutos(respostaPesquisaProdutos) {
  let { data } = respostaPesquisaProdutos || [];
  let dadosProdTable = [];
  let contador = 0;

  $('#codBarrasProdEtiqueta').val('');
  $('#numPedidoEtiqueta').val('0').trigger('change');
  $('#btnAcumuladorImpEtiqueta').addClass('d-none');

  $('input[name="qtdProdutoEtiqueta"]').on('keypress', function (event) {
    if (event.which === 13) {
      event.preventDefault();
      var index = $('input[name="qtdProdutoEtiqueta"]').index(this);
      $('input[name="qtdProdutoEtiqueta"]').eq(index + 1).focus();
    }
  });

  !acumuladorEtiquetas?.length ? $('#btnImpEtiqueta').addClass('d-none') : $('#btnImpEtiqueta').removeClass('d-none');

  if (data.length) {
    $('#containerQtdCopias').removeClass('d-none');

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
        <input class="input-qtd rounded border-dark text-center" autocomplete="off" autofill="off" type="number" min="1" idProd="${idProd}" name="qtdProdutoEtiqueta" value="1" style="width: 50px;"  onkeypress="pulaParaOProximo(event, this)" onfocus="selecionaProdPelaQtd(this)" onchange="trocaQtdProd(this)" ${stDisabled}>
      `;

      let labelStAtivo = `<label class="text-${stAtivo === 'True' ? 'info' : 'danger'} fw-900">${stAtivo === 'True' ? 'Ativo' : 'Inativo'}</label>`;

      if (registro?.STTRANSFORMADO == 'True') {
        subgrupo = subgrupo?.length > 0 ? subgrupo?.split('-') : '';
        estiloProd = estiloProd?.length > 0 ? (' - ' + estiloProd) : '';

        subgrupo = subgrupo?.length > 0 ? subgrupo?.pop()?.split(' ')?.join(' - ') : '';
        grupo = arrayGrupos[grupo];

        if (estiloProd?.length > 0) {
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
        qtdProd,
        codBarras,
        dsProd,
        tamanho,
        maskValor(precoVenda),
        grupo,
        estiloProd,
        marcaProd,
        labelStAtivo
      ]);

    }

  } else {
    $('#containerQtdCopias').addClass('d-none')
  }

  $('#resultado').html(`
    <div class="col-sm-12 col-xl-12">
      <table id="dt-basic-lista-prodEtiquetas" class="table table-bordered table-hover table-striped w-100">
        <thead class="bg-primary-600 text-center">
          <tr>
            <th>#</th>
            <th>Opções</th>
            <th>Quantidade</th>
            <th>Cod. Barras</th>
            <th class="tdCenter">Produto</th>
            <th>Tamanho</th>
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
      {
        targets: 1,
        className: 'text-center ',
        orderDataType: 'input-checkbox'
      },
      {
        targets: [5, 10],
        className: 'text-center '
      },
      {
        targets: 2,
        className: 'text-center ',
        orderDataType: 'input-number'
      },
    ],
    columns: [
      { width: '5%' },
      { width: '5%' },
      { width: '5%' },
      { width: '7%' },
      { width: '35%' },
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
    drawCallback: function (settings) {
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
                                    <th class="text-center">Qtd</th>
                                    <th class="text-center">Cód. Barras</th>
                                    <th class="text-center">Descrição</th>
                                    <th class="text-center">Tamanho</th>
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
                <button id="btnCancelaImpEtiqueta" class="btn btn-danger mr-2" type="button" onclick="fecharModalGenerico()">
                  <span class="fal fa-times mr-2"></span>Fechar
                </button>

                <button id="btnConfirmaImpEtiqueta" class="d-none btn btn-primary" type="button" title="Confirma para Impressão" >
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
      <button class="btn btn-danger" type="button" onclick="excluirProdLista(this)" title="Excluir Produto">
        <span class="fal fa-trash"></span>
      </button>
    ` : '';

    listProdutos.push([
      indice + 1,
      qtdEtiqueta,
      codBarras,
      descricaoProd,
      tamanhoProd,
      precoVenda,
      listaPreco,
      estiloProd,
      marcaProd,
      excluirProd,
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
        targets: [0, 1, 2, 4, 5, 8],
        className: 'text-center font-weight-bold'
      },
      {
        targets: [0, 3, 6, 7, 8],
        className: 'font-weight-bold'
      }
    ],
    columns: [
      { width: '5%' },
      { width: '5%' },
      { width: '10%' },
      { width: '25%' },
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

  $('#tituloGenerico').text('LISTA DE PRODUTOS PARA IMPRIMIR');

  $('#modalGenerico .modal-dialog').attr('style', 'max-width: 90% !important;');

  $('#modalGenerico').modal('show');

  indicadorPageEtiquetas();
}

async function modalImpEtiqueta(stShow = true) {
  let prod = [];
  let listProdutos = [];
  let indice = 0;
  let contador = 0;
  let qtdCopias = Number($('#qtdCopias').val()) ? Number($('#qtdCopias').val()) : 1;

  if (!stSaveAcumulador) {
    acumuladorEtiquetas = '';
    acumuladorImpEtiquetas(false);
  }

  $('#modalImpEtiquetaProd').off('hidden.bs.modal');

  $('#qtdCopias').val(qtdCopias);

  acumuladorEtiquetasZPL = acumuladorEtiquetas;

  acumuladorEtiquetas.map((dadoProd, i) => {
    let descricaoProd = dadoProd.descricaoProd;
    let estiloProd = dadoProd.estiloProd;
    let tamanhoProd = dadoProd.tamanhoProd;
    let precoVenda = dadoProd.precoVenda;
    let codBarras = dadoProd.codBarras;
    let qtdEtiqueta = dadoProd.qtdEtiqueta;
    let localExpProd = dadoProd.localExpProd || '';
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
                        <h2 style="margin: 1px !important">${maskValor(precoVenda)}</h2>
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

  })

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
  for (let i = 0; i < qtdCopias; i++) {
    $('#resultadoImpEtiquetaProd').append(etiqueta);
  }

  JsBarcode('.svgEtiqueta').init();

  $('.svgEtiqueta').attr('width', '100%');
  $('.svgEtiqueta').attr('height', '100px')

  $('#modalImpEtiquetaProd').attr('style', 'overflow: hidden auto;');
  stShow && $("#modalImpEtiquetaProd").modal('show');

  indicadorPageEtiquetas();

  $('#modalImpEtiquetaProd').on('hidden.bs.modal', function (e) {
    if (!stSaveAcumulador) {
      acumuladorEtiquetas = '';
    }
  });
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
  let dataLabelsZPL = startPageLabel;
  let contador = 0;
  let qtdCopias = Number($('#qtdCopias').val());
  let dataLabelsReadyToPrint = '';

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

      dataLabelsZPL += `
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
        dataLabelsZPL += endPageLabel;

        if (abrirMaisUmaPagina) {
          dataLabelsZPL += startPageLabel;
        }

        contador = 0;
      }
    }

  }

  dataLabelsZPL += contador !== 0 ? endPageLabel : '';

  dataLabelsReadyToPrint = dataLabelsZPL.repeat(qtdCopias);

  /*for (let i = 0; i < qtdCopias; i++) {
    dataLabelsReadyToPrint += dataLabelsZPL;
  }*/

  return dataLabelsReadyToPrint.replace(/^[ \t]+/gm, '').replace(/^\s*$/gm, '');
}

async function impEtiquetaProdutos() {
  try {
    if (false) {
      let dataZPLToPrint = await montarZplEtiquetasProdutos();

      await enviarZPLParaImpressora(dataZPLToPrint).catch((error) => { throw error });

    } else {
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
                    setTimeout(()=>{window.close()}, 500);
                };
                window.document.addEventListener('DOMContentLoaded', function() {
                    //window.focus();
                    window.print();
                });
              </script>
          </head>
          <body>
    `;

      $('#modalImpEtiquetaProd, #modalGenerico').modal('hide');

      let tela_impressao = window.open('', '', '');

      tela_impressao.document.open();
      tela_impressao.document.write(html);
      tela_impressao.document.write(conteudo);
      tela_impressao.document.write('</body></html>');
      tela_impressao.document.close();
      //tela_impressao.window.print();
      // tela_impressao.window.close();

      // $('#modalImpEtiquetaProd, #modalGenerico').modal('hide');
      $('#selecaoTodosProdEtiqueta').prop('checked', false)

      selecionaTodasLinhasProdEtiqueta($('#selecaoTodosProdEtiqueta')[0])

      stSaveAcumulador && deletarAcumuladorImpEtiquetas();

      //msgSuccess('Processo Impressão Finalizado!').then(() => {
      //    acumuladorEtiquetas = '';
      //    stSaveAcumulador = false;
      //})
    }
  } catch (error) {
    console.log(error);
    msgError(error);
  }
}
// ? ======================================================== FIM ROTINA IMPRESSÃO ETIQUETAS CONSULTA NO SAP ========================================================
