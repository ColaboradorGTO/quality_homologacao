var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var pIdRelatorio = $.request.parameters.get("idrelatorio");

    var query = 'SELECT ' +
                    'lrbi.IDRELATORIOBI, rbi.DSRELATORIOBI AS DSNOME, lrbi.IDEMPRESA, TO_VARCHAR(lrbi.LINK) AS LINK, lrbi.STATIVO ' +
                'FROM "VAR_DB_NAME".LINKRELATORIOBI lrbi ' +
                'JOIN "VAR_DB_NAME".RELATORIOBI rbi ON rbi.IDRELATORIOBI = lrbi.IDRELATORIOBI ' +
                'JOIN "VAR_DB_NAME".EMPRESA e ON e.IDEMPRESA = lrbi.IDEMPRESA ' +
                'WHERE 1 = ? ' +
                'AND lrbi.STATIVO = \'True\' ' +
                'AND lrbi.IDEMPRESA = \'' + byId + '\' ' +
                'AND lrbi.IDRELATORIOBI = \'' + pIdRelatorio + '\' ';

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
	switch ($.request.method) {
		//Handle your POST calls here
		/*case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;*/
		
		//Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
		
		default:
			break;
	}
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}