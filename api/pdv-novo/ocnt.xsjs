var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    var noPais = $.request.parameters.get("noPais");
    var noEstado = $.request.parameters.get("noEstado");
    var noCidade = $.request.parameters.get("noCidade");
  
    var query = ' SELECT ' + 
    '   "AbsId" ' +
    ' FROM ' + 
    '   "SBO_GTO_PRD"."OCNT" ' +
    ' WHERE ' +
        '	1 = ? ';
        
    if(noPais) {
        query = query + ' And  "Country" = \'' + noPais + '\' ';
    } 
    
    if(noEstado) {
        query = query + ' And  "State" = \'' + noEstado + '\' ';
    } 
    
    if(noCidade) {
        query = query + ' And  "Name" = \'' + noCidade + '\' ';
    } 
    
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}