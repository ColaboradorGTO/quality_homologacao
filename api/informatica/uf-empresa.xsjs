var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    let query = `
        SELECT
            TRIM(TBE.SGUF) AS SGUF
        FROM 
            "VAR_DB_NAME".EMPRESA TBE
        WHERE
            1 = ?
        GROUP BY 
            TRIM(TBE.SGUF)
        ORDER BY 
            TRIM(TBE.SGUF)
    `;
    
    let request = { 
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
            fnHandleGet();
            break;
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}