var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
	var query = ' SELECT ' +
    	'   tbrpm."IDRESUMOPROMOCAOMARKETING",' +
    	'   tbrpm."DSPROMOCAOMARKETING", ' +
    	'   TO_VARCHAR(tbrpm.DTHORAINICIO,\'YYYY-MM-DD HH24:MI:SS\') AS DTHORAINICIO, ' +
    	'   TO_VARCHAR(tbrpm.DTHORAFIM,\'YYYY-MM-DD HH24:MI:SS\') AS DTHORAFIM, ' +
    	'   tbrpm."TPAPLICADOA", ' +
    	'   tbrpm."TPAPARTIRDE", ' +
    	'   tbrpm."APARTIRDEQTD", ' +
    	'   tbrpm."APARTIRDOVLR", ' +
    	'   tbrpm."TPFATORPROMO", ' +
    	'   tbrpm."FATORPROMOVLR", ' +
    	'   tbrpm."FATORPROMOPERC", ' +
    	'   tbepm."IDEMPRESA", ' +
    	'   tbe."NOFANTASIA", ' +
    	'   tbrpm."VLPRECOPRODUTO" ' +
		' FROM ' +
		'   "VAR_DB_NAME".RESUMOPROMOCAOMARKETING tbrpm' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESAPROMOCAOMARKETING tbepm ON tbepm.IDRESUMOPROMOCAOMARKETING = tbrpm.IDRESUMOPROMOCAOMARKETING' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbepm.IDEMPRESA' +
		' WHERE ' +
		'	1 = ? AND tbrpm.DTHORAFIM >= (SELECT CURRENT_DATE FROM DUMMY) ' ;

	if (byId) {
		query = query + ' And  tbrpm.IDRESUMOPROMOCAOMARKETING = \'' + byId + '\' ';
	}
	
	if(idEmpresa){
	    query = query + ' And tbepm.IDEMPRESA = \'' + idEmpresa + '\' ';
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