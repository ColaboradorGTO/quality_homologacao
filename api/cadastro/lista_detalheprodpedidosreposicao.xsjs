var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    let idProduto = $.request.parameters.get("idprodutorep");
    let codbarrasrep = $.request.parameters.get("codbarrasrep");

    let queryValidaDados = `
        SELECT
            *
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            IDDETALHEPEDIDO = ?
    `;
    
    let regDetPedido =  api.sqlQuery(queryValidaDados, byId);
    
    let idProdutoReg = regDetPedido[0].IDPRODUTO;
    
 var query = 'SELECT'+
	'   d.IDDETALHEPEDIDO AS ID,'+
	'   TRIM(d.NUREF) AS NUREFPROD,'+
	'   PRODUTO.DSNOME AS DSPRODUTO,'+
	'   PRODUTO.IDPRODUTO,'+
	'   PRODUTO.NUCODBARRAS,'+
	'   TAMANHO.IDTAMANHO AS IDTAMANHO,'+
	'   TAMANHO.DSTAMANHO AS GRADE,'+
	'   UNIDADEMEDIDA.DSSIGLA AS UN,'+
	'   d.VRUNITLIQUIDO AS VRUNIT,'+
	'   d.VRVENDA AS VRVENDA,'+
	'   d.QTDTOTAL AS QTDTOTALPEDIDO,'+
	'   IFNULL(d.STREPOSICAO, \'False\') AS STREPOSICAO,'+
	'   DETALHEPEDIDOGRADE.QTD AS QTDPRODUTO,'+
	'   SUBGRUPOESTRUTURA.NUCONTADOR AS CONTADORSUBGRUPO'+
    '   FROM "VAR_DB_NAME".DETALHEPEDIDO AS d'+
	'   INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO ON d.IDRESUMOPEDIDO = RESUMOPEDIDO.IDRESUMOPEDIDO'+
	'   INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA ON d.UND = UNIDADEMEDIDA.IDUNIDADEMEDIDA'+
	'   INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE ON d.IDDETALHEPEDIDO = DETALHEPEDIDOGRADE.IDDETALHEPEDIDO AND DETALHEPEDIDOGRADE.STATIVO = \'True\' ' +
	'   INNER JOIN "VAR_DB_NAME".TAMANHO ON DETALHEPEDIDOGRADE.IDTAMANHO = TAMANHO.IDTAMANHO '+
	'   INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA ON d.IDSUBGRUPOESTRUTURA = SUBGRUPOESTRUTURA.IDSUBGRUPOESTRUTURA'+
	`   INNER JOIN "VAR_DB_NAME".PRODUTO ON 
	        PRODUTO.STATIVO = 'True' 
	        AND (PRODUTO.IDPRODUTO = d.IDPRODUTO OR (PRODUTO.NUCODBARRAS = d.NUCODBARRAS AND UPPER(PRODUTO.DSNOME) = UPPER(d.DSPRODUTO)))
	` +
    ' WHERE 1=? '+
    '   AND d.STCANCELADO = \'False\' ';
    
    if ( byId ) {
        query = query + ' And  d.IDDETALHEPEDIDO = \'' + byId + '\' ';
    }  
    
   /* if ( codbarrasrep>0 ) {
        query = query + ' And  d.NUCODBARRAS = \'' + codbarrasrep + '\' ';
    }*/
    
    query = query + ' ORDER BY d.NUREF, d.DSPRODUTO ASC';

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