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
    
    query += ' ORDER BY TBD.NUREF, TBT.IDTAMANHO ';

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