try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var idtipopedido = $.request.parameters.get("idtipopedido");
        
    var query = ' SELECT A."IDCATEGORIAPEDIDO", A."DSCATEGORIAPEDIDO", A."TIPOPEDIDO" FROM "VAR_DB_NAME"."CATEGORIAPEDIDO" A WHERE 1=?';

    if(idtipopedido){
        query = query + ' And  A."TIPOPEDIDO" =\'' + idtipopedido + '\' ';
    }
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