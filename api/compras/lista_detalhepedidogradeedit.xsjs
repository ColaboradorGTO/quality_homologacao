var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idDetPedido = $.request.parameters.get("idDetPedido");

    var query2 = 'SELECT' +
    '   DETGRADE.IDDETALHEPEDIDOGRADE, '+
    '   DETGRADE.IDDETALHEPEDIDO, ' +
	'   DETGRADE.IDTAMANHO,' +
	'   DETGRADE.INDICETAMANHO,' +
	'   DETGRADE.QTD,' +
	'   DETGRADE.STATIVO,' +
	'   TAM.DSTAMANHO' +
	'   FROM "VAR_DB_NAME".DETALHEPEDIDOGRADE DETGRADE ' +
    '   INNER JOIN "VAR_DB_NAME".TAMANHO TAM ON DETGRADE.IDTAMANHO = TAM.IDTAMANHO ' +
    ' WHERE ' +
    '	1 = ?'+
    '   AND DETGRADE.STATIVO = \'True\' ';
    

    if(idDetPedido){
        query2 = query2 + ' AND DETGRADE.IDDETALHEPEDIDO=\'' + idDetPedido + '\' ';
    }
        query2 = query2 + ' ORDER BY TO_ALPHANUM(TAM.DSABREVIACAO) ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query2, request, 1);
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