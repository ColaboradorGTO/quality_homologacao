var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    let Codbarras = $.request.parameters.get("codbarras");
    let excludeSemGtin = $.request.parameters.get("excludeSemGtin");
    
    let query = `
        SELECT
            IDPRODUTO,
            NUCODBARRAS
        FROM
            "VAR_DB_NAME".PRODUTO
        WHERE
            1 = ? 
            AND STATIVO= 'True' 
    `;
    
    if ( byId ) {
        query += ` AND IDPRODUTO = '${byId}'`;
    }

    if ( Codbarras ) {
        query += ` AND NUCODBARRAS = '${Codbarras}'`;
    }
    
    if ( excludeSemGtin == 'True' ) {
        query += ` AND UPPER(NUCODBARRAS) <> 'SEM GTIN' `;
    }
    
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
            let id = $.request.parameters.get("id");
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