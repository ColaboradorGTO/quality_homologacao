var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var PymCode = $.request.parameters.get("pymCode");

    var query = `
        SELECT
        	*
        FROM
        	SBO_GTO_PRD.CRD2
        WHERE
        	1=?
    `;
    
    if ( byId ) {
        query += ` AND "CardCode" = '${byId}'`;
    }

    if ( PymCode ) {
        query += ` AND "PymCode" = '${PymCode}'`;
    }
    
    query = query + ' ORDER BY "LineNum" ASC ';
    
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