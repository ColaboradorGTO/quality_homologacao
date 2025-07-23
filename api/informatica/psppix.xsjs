var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idEmpresa = $.request.parameters.get("idEmpresa");
   	var query = ' SELECT ' +
    	'   tbp."IDPSPPIX",' +
    	'   tbp."INDEXPSPPIXACBR",' +
        '   tbp."DSPSPPIX", ' +
    	'   tbp."CHAVEPIX", ' +
    	'   tbp."CLIENTID", ' +
    	'   tbp."CLIENTSECRET", ' +
    	'   tbp."CONSUMERKEY", ' +
    	'   tbp."CONSUMERSECRET", ' +
    	'   tbp."PATHARQUIVOCHAVEPRIVADA", ' +
    	'   tbp."PATHARQUIVOCERTIFICADO", ' +
    	'   tbp."PATHARQUIVOPFX", ' +
    	'   tbp."SENHAPFX", ' +
    	'   tbp."STATIVO" ' +
    	' FROM ' +
		'   "VAR_DB_NAME".CONFIGURACAO tbc' +
		'   INNER JOIN "VAR_DB_NAME".PSPPIX tbp ON tbc.IDPSPPIX = tbp.IDPSPPIX OR tbc.IDPSPPIXFATURA = tbp.IDPSPPIX' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbp.IDPSPPIX = \'' + byId + '\' ';
	}
	
	if(idEmpresa){
	    query = query + ' And tbc.IDEMPRESA = \'' + idEmpresa + '\' ';
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