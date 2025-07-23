//? /////////////////////////////////////// INICIO ROTINA IMPRESSÃO ETIQUETAS ////////////////////////////////////////////////////////////////
/*
  AUTOR: Hendryw Deyvison
  E-MAIL: hendryw.deyvison@gmail.com
  DATA: 27/06/2024
*/

// Inicio Variaveis Globais da Rotina De Etiquetas//
var acumuladorEtiquetas;
var stSaveAcumulador = false;
// Fim Variaveis Globais da Rotina De Etiquetas//

async function ListaProdutosEtiqueta() {
    try {
        animationLoadingStart('Carregando Dados...');

        await $.get("cadastro_action_ProdEtiqueta.html", function (resp) {
            $('#js-page-content').html(resp);

            $('#idListaPreco').select2();
            $('#numPedidoEtiqueta').select2();

            $('#idProdEtiqueta').on('keypress', (e) => { if (e.keyCode == 13) pesquisaProdutos() });
            $('#descProdEtiqueta').on('keypress', (e) => { if (e.keyCode == 13) pesquisaProdutos() });
            $('#codBarrasProdEtiqueta').on('keypress', (e) => { if (e.keyCode == 13) pesquisaProdutos() });

        }).fail((error) => { throw error; });

        await ajaxGetAllData(`api/listas-de-precos.xsjs`, false)
            .then(retornoListadePreçosGrupos)
            .catch((error) => { throw error; });

        await ajaxGetAllData(`api/empresa.xsjs`, false)
            .then(retornoListadePreçosLojas)
            .catch((error) => { throw error; });

        animationLoadingStop();
    } catch (error) {
        console.log(error);
        animationLoadingStop();

        msgError(error);
    }
}

function retornoListadePreçosGrupos(dadosListasPreco) {
    let listaPreco = dadosListasPreco.data.length ? dadosListasPreco.data : '';

    for (let i = 0; i < listaPreco.length; i++) {
        let lista = listaPreco[i]['listaPreco'];

        if (i == 0) {
            $('#idListaPreco').html('');

            $('#idListaPreco').append(`
                  <option value="">Selecione...</option>`
            );
        }

        if (lista.IDRESUMOLISTAPRECO && lista.STATIVO == 'True') {
            $('#idListaPreco').append(`
              <option title="GRUPO" value="${lista.IDRESUMOLISTAPRECO}">${lista.NOMELISTA}</option>
          `);
        }
    }
}

function retornoListadePreçosLojas(respostaListadePreços) {
    let listaPreco = respostaListadePreços.data.length ? respostaListadePreços.data : '';

    if (listaPreco) {
        for (let lista of listaPreco) {
            $('#idListaPreco').append(`
              <option title="LOJA" value="${lista['IDEMPRESA']}">${lista['NOFANTASIA']}</option>
            `);
        }
    }

}

async function pesquisaProdutos() {
    try {
        let idLista = '';
        let idEmpresa = '';
        let idProduto = $('#idProdEtiqueta').val() || '';
        let descProd = $('#descProdEtiqueta').val()?.trim() || '';
        let codBarras = $('#codBarrasProdEtiqueta').val() || '';

        $('#idListaPreco').select2('data')[0]['title'] == 'GRUPO' ? idLista = $('#idListaPreco').val() : idEmpresa = $('#idListaPreco').val();

        if ((idLista || idEmpresa) && idProduto || descProd || codBarras) {
            await ajaxGetAllData(`api/produtos/lista-produtos-para-etiqueta.xsjs?idLista=${idLista}&idEmpresa=${idEmpresa}&id=${idProduto}&descProd=${descProd}&codeBars=${codBarras}`, 'Carregando Produtos...')
                .then(retornoPesquisaProdutos)
                .catch((error) => { throw error; });

            animationLoadingStop();

        }

    } catch (error) {
        console.log(error);
        animationLoadingStop();

        msgError();
    }
}

function retornoPesquisaProdutos(respostaPesquisaProdutos) {
    $('#codBarrasProdEtiqueta').val('');
    $('#numPedidoEtiqueta').val('0').trigger('change');
    $('#btnAcumuladorImpEtiqueta').addClass('d-none');

    $('input[name="qtdProdutoEtiqueta"]').on('keypress', function (event) {
        
        if (event.which === 13) { // Check if the pressed key is Enter
            event.preventDefault(); // Prevent the default Enter behavior (form submission)
            var index = $('input[name="qtdProdutoEtiqueta"]').index(this);
            $('input[name="qtdProdutoEtiqueta"]').eq(index + 1).focus();
        }
    });

    !acumuladorEtiquetas?.length ? $('#btnImpEtiqueta').addClass('d-none') : $('#btnImpEtiqueta').removeClass('d-none');

    let dadosProd = respostaPesquisaProdutos.data;
    let dadosProdTable = [];

    if (dadosProd.length) {
        let contador = 0;
        let idProd;
        let dsProd;
        let estiloProd;
        let codBarras;
        let tamanho;
        let precoVenda;
        let idGrupo;
        let grupo;
        let subgrupo;
        let idEmpresa;
        let noFantasia;
        let qtdProd;
        let marcaProd;
        let localExpProd;
        let opcoes;

        $('#containerQtdCopias').removeClass('d-none');

        for (let i = 0; i < dadosProd.length; i++) {
            stCancelado = dadosProd[i]['STCANCELADO'];

            if (!stCancelado) {
                contador++;
                idProd = dadosProd[i]['IDPRODUTO'];
                dsProd = dadosProd[i]['DSNOME'];
                subgrupo = dadosProd[i]['SUBGRUPO'] ? (dadosProd[i]['SUBGRUPO']).split('-') : '';
                estiloProd = dadosProd[i]['DSESTILO'] || '';
                codBarras = dadosProd[i]['NUCODBARRAS'] || '';
                marcaProd = dadosProd[i]['MARCA'] || '';
                tamanho = dadosProd[i]['TAMANHO'] || ((dsProd.split(' ')).pop()).toUpperCase().replace(/[^\w\s]/gi, '');
                precoVenda = Number(dadosProd[i]['PRECOVENDA']);
                idGrupo = dadosProd[i]['IDGRUPOEMPRESARIAL'] || '';
                idEmpresa = dadosProd[i]['IDEMPRESA'] || '';
                grupo = dadosProd[i]['DSLISTAPRECO'] || '';
                noFantasia = dadosProd[i]['NOFANTASIA'] || '';
                localExpProd = dadosProd[i]['DSLOCALEXPOSICAO'] || '';
                qtdProd = `
                        <input class="input-qtd rounded border-dark text-center" autocomplete="off" autofill="off" type="number" min="1" idProd="${idProd}" name="qtdProdutoEtiqueta" value="1" style="width: 50px;"  onkeypress="pulaParaOProximo(event, this)" onfocus="selecionaProdPelaQtd('${idProd}')" onchange="trocaQtdProd(this)">
                    `;

                opcoes = `
              <div class="custom-control custom-checkbox"> 
                <input id="${idProd}" type="checkbox" class="custom-control-input" name="selecaoProdEtiqueta" descricaoProd="${dsProd}" codBarras="${codBarras}" tamanhoProd="${tamanho}" value="${precoVenda}" qtdProd="1" grupoProd="${grupo}" estiloProd="${estiloProd}" marcaProd="${marcaProd}" localExposicaoProd="${localExpProd}" onchange="selecionaLinhaProdEtiqueta(this.id)"><label class="custom-control-label" for="${idProd}"></label>
              </div>
            `;

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
                    marcaProd
                ]);

            } else if (dadosProd[i]['STTRANSFORMADO']) {
                contador++;
                idProd = dadosProd[i]['IDPRODUTO'];
                dsProd = dadosProd[i]['DSPRODUTO'];
                subgrupo = dadosProd[i]['SUBGRUPO'] ? (dadosProd[i]['SUBGRUPO']).split('-') : '';
                estiloProd = dadosProd[i]['DSESTILO'] ? (' - ' + dadosProd[i]['DSESTILO']) : '';
                tamanho = dadosProd[i]['DSTAMANHO'].toUpperCase() || '';
                codBarras = dadosProd[i]['CODBARRAS'];
                marcaProd = dadosProd[i]['MARCA'] || '';
                precoVenda = dadosProd[i]['VRUNITLIQDETALHEPEDIDO'];
                grupo = dadosProd[i]['IDSUBGRUPOEMPRESARIAL'];
                localExpProd = dadosProd[i]['DSLOCALEXPOSICAO'] || '';

                qtdProd = `
                <input type="text" name="qtdProdutoEtiqueta" value="1" style="width: 50px; text-align: center;" autocomplete="off" autofill="off" />
            `;/*` `
            <div class="btn-group btn-group-xs">
              <button type="button" class="btn btn-primary btn-xs" title="Imprimir" id="${idProd}" onclick="imprimirEtiquetaProd(this.id, 1, 'EM ANALISE');"><span class="fal fa-print p-1"></span></button>
            </div>
            `;*/
                subgrupo = subgrupo && subgrupo.pop().split(' ').join(' - ');
                estiloProd = estiloProd ? subgrupo ? subgrupo + ' - ' + estiloProd : estiloProd : subgrupo;
                grupo = !grupo ? 'Todos' : grupo == 1 ? 'Tesoura' : grupo == 2 ? 'Magazine' : grupo == 3 ? 'Yorus' : 'Free Center';

                opcoes = `
              <div class="custom-control custom-checkbox"> 
                <input type="checkbox" class="custom-control-input" name="selecaoProdEtiqueta" id="${idProd}" descricaoProd="${dsProd}" codBarras="${codBarras}" tamanhoProd="${tamanho}" value="${precoVenda}" grupoProd="${grupo}" estiloProd="${estiloProd}" marcaProd="${marcaProd}" localExposicaoProd="${localExpProd}" onchange="selecionaLinhaProdEtiqueta(this.id)"><label class="custom-control-label" for="${idProd}"/></label>
              </div>
            `;

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
                    marcaProd
                ])
            }

        }

    } else {
        $('#containerQtdCopias').addClass('d-none')
    }

    $('#resultado').html(`
      <div class="col-sm-12 col-xl-12">
        <table id="dt-basic-lista-prodEtiquetas" class="table table-bordered table-hover table-striped w-100">
          <thead class="bg-primary-600">
              <tr>
                <th class="text-center" >#</th>
                <th class="text-center" >Opções</th>
                <th class="text-center" >Quantidade</th>
                <th class="text-center" >Cod. Barras</th>
                <th class="tdCenter">Produto</th>
                <th>Tamanho</th>
                <th>Pr.Venda</th>
                <th>Grupo</th>
                <th>Estilo</th>
                <th>Marca</th>
              </tr>
          </thead>
          <tbody>
          </tbody>
          <tfoot>
          </tfoot>
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
        deferRender: true,
        responsive: true,
        autoWidth: true,
        columnDefs: [
            {
                targets: [1, 2, 4, 5, 6, 7, 8, 9],
                className: 'text-center'
            }
        ],
        columns: [
            { width: '5%' },
            { width: '5%' },
            { width: '5%' },
            { width: '10%' },
            { width: '35%' },
            { width: '5%' },
            { width: '5%' },
            { width: '15%' },
            { width: '10%' },
            { width: '5%' }
        ],
        language: {
            "emptyTable": "Dados não encontrados!"
        },
        initComplete: function (settings) {
            $('#dt-basic-lista-prodEtiquetas').before(`
                <div id="chkMarcaTodos" class="mb-1 ${!dadosProd.length ? 'd-none' : ''}">
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" name="selecaoTodosProdEtiqueta" id="selecaoTodosProdEtiqueta" onclick="selecionaTodasLinhasProdEtiqueta(this)"><label class="custom-control-label text-Marcar-Desmarcar-Todos" for="selecaoTodosProdEtiqueta">Marcar Todos</label>
                    </div>
                </div>
            `);

            let idTable = `#${settings.nTable.id}`;

            $(idTable).focus();
            $('html, body').animate({
                scrollTop: $(idTable).offset().top
            }, 1000);
        }
    });

    $('#modalGenerico').off('keydown', pulaPreviewEtiqueta);
}

function pulaParaOProximo(event, inputElement) {
    if (event.key === "Enter") {
        event.preventDefault();
        if ($('#dt-basic-lista-prodEtiquetas tbody tr').length > 1) {
            var tableRow = inputElement.closest('tr');
            var nextInput = tableRow.nextElementSibling.querySelector('.input-qtd');
            
            if (nextInput && isValidEAN13($('#'+$(inputElement).attr('idprod')).attr('codbarras'))) {
                nextInput.focus();
            }
        }
    }
}

function selecionaProdPelaQtd(idInput) {
    if (!$('#' + idInput).prop('checked')) {
        let element = $('#' + idInput);
        let linhaSelecionada = $(`#${idInput}`).closest('tr');
        
        if (!isValidEAN13($('#' + idInput).attr('codbarras'))) {
            $(`#${idInput}`).focus();
            return msgError(`O código de barras(${element.attr('codbarras')}) do produto(${element.attr('descricaoprod')}) que está linha: ${$(linhaSelecionada).find('td:first').text()} está em formato inválido, entre em contato com o departamento de cadastro de produtos`)
        }
        
        $('#' + idInput).prop('checked', true);
        
        let lengthInputs = Number($('[name="selecaoProdEtiqueta"]').length);
        let lengthInputsCheckeds = Number($('[name="selecaoProdEtiqueta"]:checked').length);
        let lengthAcumulador = Number(acumuladorEtiquetas?.length)

        linhaSelecionada.toggleClass('selected').css("opacity", 0.8);
        linhaSelecionada.attr('title', 'PRODUTO SELECIONADO PARA IMPRIMIR!');

        if (lengthInputsCheckeds && lengthInputsCheckeds < lengthInputs) {
            $('#selecaoTodosProdEtiqueta').prop('checked', false);
            $('.text-Marcar-Desmarcar-Todos').text('Marcar Todos');

            $('#btnAcumuladorImpEtiqueta').removeClass('d-none');
            $('#btnImpEtiqueta').removeClass('d-none');

        } if (lengthInputsCheckeds == lengthInputs) {
            $('#selecaoTodosProdEtiqueta').prop('checked', true);
            $('.text-Marcar-Desmarcar-Todos').text('Desmarcar Todos');

            $('#btnAcumuladorImpEtiqueta').removeClass('d-none');
            $('#btnImpEtiqueta').removeClass('d-none');
        }
    }
}

function selecionaTodasLinhasProdEtiqueta(element) {
    let inputs = $('[name="selecaoProdEtiqueta"]');
    let linhas = '';
    let codBarrasProds = '';
    let isInvalid = false;

    if ($(element).prop('checked')) {
        inputs.map((indice, input) => {
            if (!$(input).prop('checked')) {

                if (!isValidEAN13($(input).attr('codbarras'))) {
                    isInvalid = true;
                    linhas += `${indice + 1}, `
                    codBarrasProds += `${$(input).attr('codbarras')}, `;
                } else {
                    $(input).prop('checked', true);
                    selecionaLinhaProdEtiqueta($(input).attr('id'));
                }
            }
        });
        $('.text-Marcar-Desmarcar-Todos').text('Desmarcar Todos');

        $('#btnAcumuladorImpEtiqueta').removeClass('d-none');
        $('#btnImpEtiqueta').removeClass('d-none');

    } else {

        inputs.map((indice, input) => {
            if ($(input).prop('checked')) {
                $(input).prop('checked', false);


                selecionaLinhaProdEtiqueta($(input).attr('id'));
            }
        });

        $('.text-Marcar-Desmarcar-Todos').text('Marcar Todos');

        $('#btnAcumuladorImpEtiqueta').addClass('d-none');

        if (!acumuladorEtiquetas?.length) {
            $('#btnImpEtiqueta').addClass('d-none');
            $('#btnDeletarAcumuladorImpEtiquetas').addClass('d-none');
        }
    }

    if (isInvalid) {
        return msgError(`Os produtos das linhas (${linhas}) estão com os códigos de barras em formato inválido, entre em contato com o departamento de cadastro de produtos`, `Códigos de Barras:( ${codBarrasProds})`);
    }
}

function selecionaLinhaProdEtiqueta(id) {
    let linhaSelecionada = $(`#${id}`).closest('tr');
    let lengthInputs = Number($('[name="selecaoProdEtiqueta"]').length);
    let lengthInputsCheckeds = Number($('[name="selecaoProdEtiqueta"]:checked').length);
    let lengthAcumulador = Number(acumuladorEtiquetas?.length)
    let element = $(`#${id}`);

    linhaSelecionada.toggleClass('selected').css("opacity", linhaSelecionada.hasClass('selected') ? 0.8 : 1);
    linhaSelecionada.attr('title', linhaSelecionada.hasClass('selected') ? 'PRODUTO SELECIONADO PARA IMPRIMIR!' : 'PRODUTO PARA IMPRESSÃO DE ETIQUETA!');

    if ($(element).prop('checked') && !isValidEAN13(element.attr('codbarras'))) {
        return msgError(`O código de barras(${element.attr('codbarras')}) do produto(${element.attr('descricaoprod')}) que está linha: ${$(linhaSelecionada).find('td:first').text()} está em formato inválido, entre em contato com o departamento de cadastro de produtos`)
            .then(() => {
                $(`#${id}`).prop('checked', false);
                linhaSelecionada.toggleClass('selected').css("opacity", 1);
                linhaSelecionada.attr('title', 'PRODUTO PARA IMPRESSÃO DE ETIQUETA!');
            })
    }

    if (!lengthInputsCheckeds) {
        $('#selecaoTodosProdEtiqueta').prop('checked', false);
        $('.text-Marcar-Desmarcar-Todos').text('Marcar Todos');

        $('#btnAcumuladorImpEtiqueta').addClass('d-none');

        if (!lengthAcumulador) {
            $('#btnImpEtiqueta').addClass('d-none');
            $('#btnDeletarAcumuladorImpEtiquetas').addClass('d-none');

        }
    } if (lengthInputsCheckeds && lengthInputsCheckeds < lengthInputs) {
        // $('#selecaoTodosProdEtiqueta').prop('checked', false);
        // $('.text-Marcar-Desmarcar-Todos').text('Marcar Todos');

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
}

function acumuladorImpEtiquetas(stClick = true) {
    let produtos = $('[name="selecaoProdEtiqueta"]:checked');

    if (!acumuladorEtiquetas?.length) {
        acumuladorEtiquetas = [];
    }

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

    $('#modalGenerico').on('keydown', (event)=>{
        if($('#tableProdsImp tbody tr').length){
            pulaPreviewEtiqueta(event);
        }
    });
}

function pulaPreviewEtiqueta(event) {
    if (event.ctrlKey && (event.key.toLowerCase() === 'p' || event.code === 'KeyP')) {
        event.preventDefault();

        $('#modalGenerico').modal('hide');
        $('#modalGenerico .modal-dialog').removeAttr('style');
        modalImpEtiqueta(false);
        
        $('#modalGenerico, #modalImpEtiquetaProd').off('keydown');
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

async function modalImpEtiqueta(stShow = true) {
    stShow && $('#modalImpEtiquetaProd').on('keydown', pulaPreviewEtiqueta);

    let prod = [];
    let listProdutos = [];
    let indice = 0;
    let contador = 0;
    let qtdCopias = Number($('#qtdCopias').val()) ? Number($('#qtdCopias').val()) : 1;

    $('#qtdCopias').val(qtdCopias);

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

    if (!stShow) {
        impEtiquetaProdutos();
        $('#modalGenerico, #modalImpEtiquetaProd').on('keydown');
    }

    $('#modalGenerico, #modalImpEtiquetaProd').on('keydown', function (event) {
        if (event.ctrlKey && (event.key.toLowerCase() === 'p' || event.code === 'KeyP')) {
            event.preventDefault();

            impEtiquetaProdutos();
            $('#modalGenerico, #modalImpEtiquetaProd').off('keydown');
        }
    })
}

function impEtiquetaProdutos() {
    //animacaoCarregamento('Aguardando o processo de impressão, favor finalizar a impressão...');
    $('#modalGenerico, #modalImpEtiquetaProd').off('keydown');

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
          </head>
          <body>
    `;
    let tela_impressao = window.open('', '', '');

    tela_impressao.document.open();
    tela_impressao.document.write(html);
    tela_impressao.document.write(conteudo);
    tela_impressao.document.write('</body></html>');
    tela_impressao.document.close();
    tela_impressao.window.print();
    tela_impressao.window.close();

    $('#modalImpEtiquetaProd, #modalGenerico').modal('hide');
    $('#selecaoTodosProdEtiqueta').prop('checked', false)

    selecionaTodasLinhasProdEtiqueta($('#selecaoTodosProdEtiqueta')[0])

    stSaveAcumulador && deletarAcumuladorImpEtiquetas();

    //msgSuccess('Processo Impressão Finalizado!').then(() => {
    //    acumuladorEtiquetas = '';
    //    stSaveAcumulador = false;
    //})
}
// ? /////////////////////////////////////// FIM ROTINA IMPRESSÃO ETIQUETAS ////////////////////////////////////////////////////////////////



