var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var query = 'SELECT ' +
                    ' rp.IDRESUMOPEDIDO, rp.IDGRUPOEMPRESARIAL, rp.IDSUBGRUPOEMPRESARIAL, rp.IDEMPRESA, rp.IDCOMPRADOR, rp.IDCONDICAOPAGAMENTO, rp.IDFORNECEDOR ' +
                    ' ,rp.IDTRANSPORTADORA, rp.IDANDAMENTO, rp.TPCATEGORIAPEDIDO, rp.MODPEDIDO, rp.TPFORNECEDOR, rp.NOVENDEDOR, rp.EEMAILVENDEDOR ' +
                    ' ,rp.DTPEDIDO, rp.DTPREVENTREGA, rp.TPFRETE, rp.NUTOTALITENS, rp.QTDTOTPRODUTOS, rp.VRTOTALBRUTO, rp.DESCPERC01 ' +
                    ' ,rp.DESCPERC02, rp.DESCPERC03, rp.PERCCOMISSAO, rp.VRTOTALLIQUIDO, rp.OBSPEDIDO, rp.OBSPEDIDO2, rp.DTFECHAMENTOPEDIDO ' +
                    ' ,rp.DTCADASTRO, rp.IDRESPCANCELAMENTO, rp.DSMOTIVOCANCELAMENTO, rp.DTCANCELAMENTO, rp.TPARQUIVO, rp.DTRECEBIMENTOPEDIDO, rp.STDISTRIBUIDO ' +
                    ' ,rp.STAGRUPAPRODUTO, rp.STCANCELADO, rp.TPFISCAL, rp.VRCOMISSAO ' +
                    ' ,dpp.IDDETALHEPRODUTOPEDIDO, dpp.IDDETALHEPEDIDO, dpp.IDGRUPOESTRUTURA, dpp.IDSUBGRUPOESTRUTURA, dpp.IDCOR, dpp.IDTAMANHO, dpp.DSTAMANHO ' +
                    ' ,dpp.IDCATEGORIAPEDIDO, dpp.IDTIPOTECIDO, dpp.IDESTILO, dpp.IDFABRICANTE, dpp.IDLOCALEXPOSICAO, dpp.IDCATEGORIAS, dpp.IDNCM ' +
                    ' ,dpp.NUNCM, dpp.IDCEST, dpp.NUCEST, dpp.IDTIPOPRODUTOFISCAL, dpp.IDFONTEPRODUTOFISAL, dpp.IDPRODCADASTRO, dpp.NUREF ' +
                    ' ,dpp.CODBARRAS, dpp.DSPRODUTO, dpp.QTDPRODUTO, dpp.UND, dpp.VRCUSTO, dpp.VRVENDA, dpp.VRTOTALCUSTO ' +
                    ' ,dpp.VRTOTALVENDA, dpp.DTCADASTRO, dpp.DTULTATUALIZACAO, dpp.STCADASTRADO, dpp.STRECEBIDO, dpp.OBSREF, dpp.IDDETALHEENTRADA ' +
                    ' ,dpp.NUNF, dpp.QTDENTRADANF, dpp.DTENTRADANF, dpp.STECOMMERCE, dpp.STREDESOCIAL, dpp.STATIVO, dpp.STCANCELADO ' +
                    ' ,dpp.QTDESTOQUEIDEAL, dpp.IDRESUMOPEDIDO ' +
                    ' ,c.DSCOR, ca.DSCATEGORIAS, tt.DSTIPOTECIDO, e.DSESTILO, f.DSFABRICANTE, sge.DSSUBGRUPOESTRUTURA ' +
                ' FROM "VAR_DB_NAME".RESUMOPEDIDO rp ' +
                ' INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO dp ON dp.IDRESUMOPEDIDO = rp.IDRESUMOPEDIDO AND dp.STCANCELADO = \'False\' ' +
                ' INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO dpp ON dpp.IDDETALHEPEDIDO = dp.IDDETALHEPEDIDO AND dpp.STCANCELADO = \'False\' ' +
                ' INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE dpg ON dpg.IDDETALHEPEDIDO = dpp.IDDETALHEPEDIDO AND dpg.IDTAMANHO = dpp.IDTAMANHO AND dpg.STATIVO = \'True\' ' +
                ' INNER JOIN "VAR_DB_NAME".COR c ON c.IDCOR = dpp.IDCOR AND c.STATIVO = \'True\' ' +
                ' INNER JOIN "VAR_DB_NAME".CATEGORIAS ca ON ca.IDCATEGORIAS = dpp.IDCATEGORIAS AND ca.STATIVO = \'True\' ' +
                ' INNER JOIN "VAR_DB_NAME".TIPOTECIDOS tt ON tt.IDTPTECIDO = dpp.IDTIPOTECIDO AND tt.STATIVO = \'True\' ' +
                ' INNER JOIN "VAR_DB_NAME".ESTILOS e ON e.IDESTILO = dpp.IDESTILO AND e.STATIVO = \'True\' ' +
                ' INNER JOIN "VAR_DB_NAME".FABRICANTE f ON f.IDFABRICANTE = dpp.IDFABRICANTE AND f.STATIVO = \'True\' ' +
                ' INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA sge ON sge.IDSUBGRUPOESTRUTURA = dpp.IDSUBGRUPOESTRUTURA AND sge.STATIVO = \'True\' ' +
                ' WHERE 1 = ? ' +
                ' AND rp.STCANCELADO = \'False\' ' +
                ' AND rp.IDRESUMOPEDIDO = \'' + byId + '\' ';

    var request = { 
            page:  $.request.parameters.get("page"),
            pageSize:  $.request.parameters.get("pageSize")
        };

    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;

        //Handle your PUT calls here
        /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
        break;*/

        //Handle your POST calls here
        /*case $.net.http.POST:
            var doc = fnHandlePost();
            $.response.setBody(JSON.stringify(doc));
        break;*/

        default:
            break;
    }
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}