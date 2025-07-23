var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var query = 'SELECT ' +
                '   rot.IDEMPRESADESTINO, rot.IDRESUMOOT, rot.NUMERONOTASEFAZ, rot.MSGSEFAZ, rot.CODIGORETORNOSEFAZ, rot.NUTOTALVOLUMES ' +
                '   ,(SELECT IFNULL(NOFANTASIA, \'\') FROM "VAR_DB_NAME".EMPRESA WHERE IDEMPRESA = rot.IDEMPRESADESTINO) AS EMPRESADESTINO ' +
                'FROM "VAR_DB_NAME".RESUMOORDEMTRANSFERENCIA rot ' +
                'WHERE 1 = ? ';
    if(byId){
        query = query + 'AND rot.IDRESUMOOT IN (' + byId + '\) ';
    }
    query = query + 'ORDER BY rot.IDEMPRESADESTINO';

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
        //Handle your PUT calls here
        /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
        break;
        
        //Handle your POST calls here
        case $.net.http.POST:
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