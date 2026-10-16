var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    let idProduto = $.request.parameters.get("idprodutorep");
    let codbarrasrep = $.request.parameters.get("codbarrasrep");

    var query = `
        SELECT
            TBD.IDDETALHEPEDIDO AS ID,
            TRIM(TBD.NUREF) AS NUREFPROD,
            TBP.DSNOME AS DSPRODUTO,
            TBP.IDPRODUTO,
            TBP.NUCODBARRAS,
            TBT.IDTAMANHO AS IDTAMANHO,
            TBT.DSTAMANHO AS GRADE,
            TBU.DSSIGLA AS UN,
            TBD.VRUNITLIQUIDO AS VRUNIT,
            TBD.VRVENDA AS VRVENDA,
            TBD.QTDTOTAL AS QTDTOTALPEDIDO,
            IFNULL(TBD.STREPOSICAO, 'False') AS STREPOSICAO,
            TBDPG.QTD AS QTDPRODUTO,
            TBDPG.IDDETALHEPEDIDOGRADE,
            IFNULL(TBDPG_SECUNDARIO.STDETALHEPRODUTOPEDIDOGERADO, TBDPG.STDETALHEPRODUTOPEDIDOGERADO) AS STDETALHEPRODUTOPEDIDOGERADO,
            TBSE.NUCONTADOR AS CONTADORSUBGRUPO
        FROM 
        	"VAR_DB_NAME".DETALHEPEDIDO AS TBD
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA AS TBU ON
            TBD.UND = TBU.IDUNIDADEMEDIDA
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE AS TBDPG ON
            TBD.IDDETALHEPEDIDO = TBDPG.IDDETALHEPEDIDO AND TBDPG.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".TAMANHO AS TBT ON
            TBDPG.IDTAMANHO = TBT.IDTAMANHO 
        INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA AS TBSE ON
            TBD.IDSUBGRUPOESTRUTURA = TBSE.IDSUBGRUPOESTRUTURA
        INNER JOIN "VAR_DB_NAME".PRODUTO AS TBP ON 
            TBP.STATIVO = 'True' AND (TBP.IDPRODUTO = TBD.IDPRODUTO OR (TBP.NUCODBARRAS = TBD.NUCODBARRAS AND UPPER(TBP.DSNOME) = UPPER(TBD.DSPRODUTO)))
        LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD_SECUNDARIO ON
            TBD.IDDETALHEPEDIDO = TBD_SECUNDARIO.IDDETALHEPEDIDOPRIMARIO
        LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE AS TBDPG_SECUNDARIO ON
            TBD_SECUNDARIO.IDDETALHEPEDIDO = TBDPG_SECUNDARIO.IDDETALHEPEDIDO AND TBDPG.IDTAMANHO = TBDPG_SECUNDARIO.IDTAMANHO  AND TBDPG_SECUNDARIO.STATIVO = 'True'
        WHERE
            1 = ?
            AND TBD.STCANCELADO = 'False' 
    `;
    
    if ( byId ) {
        query += ` AND  TBD.IDDETALHEPEDIDO = '${byId}' `;
    }  
    
   /* if ( codbarrasrep>0 ) {
        query += ` AND  TBD.NUCODBARRAS = '${codbarrasrep}' `;
    }*/
    
    query += `
        ORDER BY 
            TBD.NUREF, 
            SUBSTRING(TBD.DSPRODUTO, 0, LENGTH(TBD.DSPRODUTO)-2),
            CASE 
                WHEN TBT.DSTAMANHO BETWEEN '0' AND '99999' THEN TO_INTEGER(TBT.DSTAMANHO)
                WHEN TBT.DSTAMANHO = 'PP' THEN 1
                WHEN TBT.DSTAMANHO = 'P'  THEN 2
                WHEN TBT.DSTAMANHO = 'M'  THEN 3
                WHEN TBT.DSTAMANHO = 'G'  THEN 4
                WHEN TBT.DSTAMANHO = 'GG' THEN 5
                WHEN TBT.DSTAMANHO = 'EG' THEN 6
                WHEN TBT.DSTAMANHO = 'EGG' THEN 7
                WHEN TBT.DSTAMANHO = 'G1'  THEN 8
                WHEN TBT.DSTAMANHO = 'G2'  THEN 9
                WHEN TBT.DSTAMANHO = 'G3'  THEN 10
                WHEN TBT.DSTAMANHO = 'G4'  THEN 11
                WHEN TBT.DSTAMANHO = 'G5'  THEN 12
                WHEN TBT.DSTAMANHO = 'XG' THEN 13
                WHEN TBT.DSTAMANHO = 'XGG' THEN 14
                ELSE 999
            END
    `;

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