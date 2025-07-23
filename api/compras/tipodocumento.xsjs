var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' +
        ' (e2.IDTPDOCUMENTO), ' +
        ' (e2.DSTPDOCUMENTO), ' +
        ' (e2.IDSAP) ' +
        ' FROM ' +
        '	"VAR_DB_NAME".TIPODOCUMENTO e2 '+
        ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  e2.IDTPDOCUMENTO = \'' + byId + '\' ';
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
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}