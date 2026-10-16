var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idEmpresa) {
        throw "O parametro IdEmpresa é um valor obrigatório.";
    }
    
    var query = ' SELECT DISTINCT' + 
    '   tbppc.IDPRODUTO,' +
    '   tbppc.PRECO_VENDA,' +
    '   tbppc.DTHORAINICIOVIGENCIA,' +
    '   tbppc.DTHORAFIMVIGENCIA,' +
    '   tbppc.IDSUBGRUPOEMPRESARIAL,' +
    '   tbppc.DTULTIMAATUALIZACAO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".EMPRESA tbe' +
    '   INNER JOIN "VAR_DB_NAME".PRODUTOPRECOCLUBE tbppc on tbe.IDSUBGRUPOEMPRESARIAL = tbppc.IDSUBGRUPOEMPRESARIAL' +
    ' WHERE ' +
        '	1 = ?'+
        ' And  tbe.IDEMPRESA = ' + idEmpresa;
    
    if ( byId ) {
        query = query + ' And  tbppc.IDPRODUTO = \'' + byId + '\' ';
    }
    
    query = query + ' ORDER BY  tbppc.IDPRODUTO ';
    
   /*$.response.contentType = 'application/json';
		$.response.setBody(JSON.stringify(query));
		$.response.status = $.net.http.OK;
		return;*/
    
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
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}