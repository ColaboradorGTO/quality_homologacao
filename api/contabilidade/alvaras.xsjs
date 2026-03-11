let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    let stAtivo = $.request.parameters.get("stAtivo");
    
    let query = `
        SELECT
            IDALVARA,
            DESCRICAO,
            STATIVO
        FROM
            "VAR_DB_NAME".ALVARA
        WHERE
            1 = ?
        `;
    
    if (byId) {
        query += `AND IDALVARA = '${byId}' `;
    }

    if(stAtivo){
        query += `AND STATIVO = '${stAtivo}' `;
    }
    
    query += ' ORDER BY IDALVARA ';
    
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