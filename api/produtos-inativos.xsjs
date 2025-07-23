var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var codeBars = $.request.parameters.get("codeBars");
    
    if(!idEmpresa) {
        throw "O parametro IdEmpresa é um valor obrigatório.";
    }
    
    var query = ' SELECT DISTINCT' + 
    '   tbp.IDPRODUTO,' +
    '   tbp.NUCODBARRAS,' +
    '   tbp.DSNOME' +
    ' FROM ' + 
    '   "VAR_DB_NAME".PRODUTO tbp' +
    ' WHERE ' +
        '	1 = ?'+
        ' And  tbp.STATIVO = \'False\' ';
    
    if ( byId ) {
        query = query + ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
    }
    
    if ( codeBars ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codeBars + '\' ';
    }
    
    query = query + ' ORDER BY  tbp.IDPRODUTO ';
    
   /* $.response.contentType = 'application/json';
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