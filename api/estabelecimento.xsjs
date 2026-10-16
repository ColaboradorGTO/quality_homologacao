var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

var idEmpresa = $.request.parameters.get("idEmpresa");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbe.IDESTABELECIMENTO,' +
    '   tbe.IDEMPRESA,' +
    '   tbe.NUESTABELECIMENTO,' +
    '   tbe.CODESTABELECIMENTO,' +
    '   tbe.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".ESTABELECIMENTO tbe' +
    ' WHERE ' +
        '	1 = ? and tbe.STATIVO = \'True\'';
    
    if ( byId ) {
        query = query + ' And  tbe.IDESTABELECIMENTO = \'' + byId + '\' ';
    }
    if(idEmpresa){
	    query = query + ' and tbe.IDEMPRESA = ' + idEmpresa;
	}
	
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