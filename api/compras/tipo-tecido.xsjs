try {
    
   var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var idtpTecido = $.request.parameters.get("idtpTecido");
    
    var query = ' SELECT A."IDTPTECIDO", A."DSTIPOTECIDO", A."STATIVO" FROM "VAR_DB_NAME"."TIPOTECIDOS" A WHERE 1=?  ';
    if(idtpTecido){
        query = query + ' And  A."IDTPTECIDO" IN ( ' + idtpTecido + ')  ';
    }
    query = query + ' ORDER BY  A."IDTPTECIDO"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}