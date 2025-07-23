try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var idMarca = $.request.parameters.get("idMarca");
    
    var query = ' SELECT A."ID_MARCA", A."ID_FORNECEDOR", A."FORNECEDOR", A."CNPJ_CPF" FROM "QUALITY_CONC"."VW_CLASSIFICACAO_DO_FORNECEDOR" A WHERE 1=?  ';
    if(idMarca){
        query = query + ' And  A."ID_MARCA" IN( ' + idMarca + ')  ';
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