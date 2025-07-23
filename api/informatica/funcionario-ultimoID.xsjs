var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {

    var query = ' SELECT TOP 1' + 
    '   tbf.ID' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    ' WHERE ' +
   '	1 = ?';

    query = query + 'ORDER BY tbf.ID DESC';
    
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
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}