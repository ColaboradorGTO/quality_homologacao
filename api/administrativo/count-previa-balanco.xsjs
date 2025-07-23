var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var query = ' SELECT ' +
        ' COUNT(*) AS CONTADOR ' +
        'FROM "VAR_DB_NAME".RESUMOBALANCO rb ' +
        'INNER JOIN "VAR_DB_NAME".DETALHEBALANCO db ON db.IDRESUMOBALANCO = rb.IDRESUMOBALANCO ' +
		'WHERE 1 = ? ' +
		'AND rb.STATIVO = \'True\' ';

	if(byId){
		query = query + ' AND rb.IDEMPRESA = \'' + byId + '\' ';
	}

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;

		/*//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		default:
			break;*/
			
		//Handle your PUt calls here
	    /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;*/
	}
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}