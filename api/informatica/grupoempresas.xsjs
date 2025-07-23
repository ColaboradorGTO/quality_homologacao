var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' +
        ' DISTINCT (e2.IDGRUPOEMPRESARIAL) AS IDGRUPOEMPRESARIAL, ' +
    	' CASE ' +
    	' WHEN e2.IDGRUPOEMPRESARIAL = 1 THEN \'TO - TESOURA\' ' +
    	' WHEN e2.IDGRUPOEMPRESARIAL = 2 THEN \'MG - MAGAZINE\' ' +
    	' WHEN e2.IDGRUPOEMPRESARIAL = 3 THEN \'YO - YORUS\' ' +
    	' WHEN e2.IDGRUPOEMPRESARIAL = 4 THEN \'FC - FREE CENTER\' ' +
    	' WHEN e2.IDGRUPOEMPRESARIAL = 5 THEN \'OUTLET - OUTLET FAMILIA\' ' +
        ' END AS GRUPOEMPRESARIAL ' +
        ' FROM ' +
        '	"VAR_DB_NAME".EMPRESA e2 '+
        ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  e2.IDGRUPOEMPRESARIAL = \'' + byId + '\' ';
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