try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var idSubGrupo = $.request.parameters.get("idSubGrupo");
    
    var query = ' SELECT A.ID_ESTRUTURA, A.ID_MARCA, A.MARCA FROM "QUALITY_CONC"."VW_CLASSIFICACAO_MARCA" A WHERE 1=?  ';
    if(idSubGrupo){
        query = query + ' And  A."ID_ESTRUTURA" IN( ' + idSubGrupo + ')  ';
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