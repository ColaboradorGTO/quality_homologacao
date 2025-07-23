try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var idGrupo = $.request.parameters.get("idGrupo");
    
    var query = ' SELECT A."IDGRUPOESTRUTURA" ID_GRUPO, B."DSGRUPOESTRUTURA" DS_GRUPO, A."IDSUBGRUPOESTRUTURA" ID_ESTRUTURA, A."DSSUBGRUPOESTRUTURA" ESTRUTURA FROM "VAR_DB_NAME"."SUBGRUPOESTRUTURA" A INNER JOIN "VAR_DB_NAME"."GRUPOESTRUTURA" B on A.IDGRUPOESTRUTURA = B.IDGRUPOESTRUTURA WHERE  A.STATIVO=\'True\' AND 1=?  ';
    if(idGrupo){
        query = query + ' And  A."IDGRUPOESTRUTURA" IN ( ' + idGrupo + ')  ';
    }
    query = query + ' ORDER BY A."IDGRUPOESTRUTURA",  A."DSSUBGRUPOESTRUTURA"';

    
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