var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var query = ' SELECT TO_VARCHAR(CURRENT_TIMESTAMP,\'DD/MM/YYYY HH24:MI:SS\')AS DTHORAATUAL FROM DUMMY WHERE 1 = ? ' ;
    
    var request = { 
        //page:  $.request.parameters.get("page"),
        //pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}