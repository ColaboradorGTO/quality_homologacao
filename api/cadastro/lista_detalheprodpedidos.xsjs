var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    var query = `
        SELECT
            TBD.IDDETALHEPEDIDO AS ID,
            CASE
                WHEN TRIM(SUBSTR_BEFORE((TBD.DSPRODUTO), ' ')) = '' THEN TBD.DSPRODUTO
                ELSE TRIM(SUBSTR_BEFORE((TBD.DSPRODUTO), ' '))
            END AS DSPRODUTOANTES,
            TRIM(TBD.NUREF) AS NUREFPROD,
            TRIM(SUBSTR(TBTT.DSTIPOTECIDO, 0, 10)) AS DSTIPOTECIDO,
            TRIM(SUBSTR_AFTER(TBD.DSPRODUTO, ' ')) AS DSPRODUTODEPOIS,
            TRIM(SUBSTR(TBFAB.DSFABRICANTE, 0, 20)) AS DSFABRICANTE,
            TRIM(SUBSTR(TBCOR.DSCOR, 0, 8)) AS DSCOR,
            TRIM(SUBSTR(TBFORN.NOFANTASIA, 0, 15)) AS NOMEFORPROD,
            TBFORN.IDFORNECEDOR,
            TBSE.IDSUBGRUPOESTRUTURA AS IDSUBGRUPOESTRUTURA,
            TBSE.DSSUBGRUPOESTRUTURA AS SUBGRUPOESTRUTURA,
            TBSE.CODSUBGRUPOESTRUTURA AS CODSUBGRUPEST,
            TBSE.NUCONTADOR AS CONTADORSUBGRUPO,
            TBCP.TIPOPEDIDO,
            TAMANHO.IDTAMANHO AS IDTAMANHO,
            TAMANHO.DSTAMANHO AS GRADE,
            TBUM.DSSIGLA AS UN,
            TBD.VRUNITLIQUIDO AS VRUNIT,
            TBD.VRVENDA AS VRVENDA,
            TBD.QTDTOTAL AS QTDTOTALPEDIDO,
            IFNULL(TBD.STREPOSICAO, 'False') AS STREPOSICAO,
            TBDPG.QTD AS QTDPRODUTO
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO AS TBD
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR  ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".FORNECEDOR AS TBFORN ON
            TBR.IDFORNECEDOR = TBFORN.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME".FABRICANTE AS TBFAB ON
            TBD.IDFABRICANTE = TBFAB.IDFABRICANTE
        INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO AS TBCP ON
            TBD.IDCATEGORIAPEDIDO = TBCP.IDCATEGORIAPEDIDO
        INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA AS TBUM ON
            TBD.UND = TBUM.IDUNIDADEMEDIDA
        INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA AS TBSE ON
            TBD.IDSUBGRUPOESTRUTURA = TBSE.IDSUBGRUPOESTRUTURA
        INNER JOIN "VAR_DB_NAME".TIPOTECIDOS AS TBTT ON
            TBD.IDTIPOTECIDO = TBTT.IDTPTECIDO
        INNER JOIN "VAR_DB_NAME".COR AS TBCOR ON
            TBD.IDCOR = TBCOR.IDCOR
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE AS TBDPG ON
            TBD.IDDETALHEPEDIDO = TBDPG.IDDETALHEPEDIDO AND TBDPG.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".TAMANHO ON
            TBDPG.IDTAMANHO = TAMANHO.IDTAMANHO
        WHERE
            1 =?
            AND TBD.STCANCELADO = 'False'
    `;
    
    if ( byId ) {
        query += ` AND TBD.IDDETALHEPEDIDO = '${byId}' `;
    }
    
    query += ' ORDER BY TBD.NUREF, TAMANHO.IDTAMANHO ';

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
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}