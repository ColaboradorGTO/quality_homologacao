var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

   var query = ' SELECT ' +
    	'   tbcse."IDSUBGRUPOESTRUTURA",' +
    	'   tbcse."IDGRUPOESTRUTURA",' +
        '   tbcse."DSSUBGRUPOESTRUTURA", ' +
    	'   tbcse."STATIVO", ' +
    	'   tbcse."IDSAP", ' +
    	'   tbcse."NUCONTADOR", ' +
    	'   tbcse."CODSUBGRUPOESTRUTURA", ' +
    	'   tbcse."TPSECAO" ' +
    	' FROM ' +
		'   "VAR_DB_NAME".SUBGRUPOESTRUTURA tbcse' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbcse.IDSUBGRUPOESTRUTURA = \'' + byId + '\' ';
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