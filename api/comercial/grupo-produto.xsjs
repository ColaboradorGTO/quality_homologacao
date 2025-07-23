try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var nome = $.request.parameters.get("nome");
    
    var query = ' SELECT A."IDGRUPOESTRUTURA" ID_GRUPO, A."DSGRUPOESTRUTURA" GRUPO FROM "QUALITY_CONC_HML"."GRUPOESTRUTURA" A WHERE 1=? AND A.STATIVO=\'True\''; 

  
    if(nome){
        query = query + ' And  (A."DSGRUPOESTRUTURA" like \'%' + nome + '%\')  ';
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