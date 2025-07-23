var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var tipoDocumento = $.request.parameters.get("tipoDocumento");
    var nrDocumento = $.request.parameters.get("nrDocumento");
  
    var query = ' SELECT ' + 
    '   "KeyNfe", ' +
    '   "StatusId" ' +
    ' FROM ' + 
    '   "SBO_GTO_PRD"."Process" ' +
    ' WHERE ' +
        '	1 = ? ';
        
    if(idEmpresa) {
        query = query + ' And  "CompanyId" = \'' + idEmpresa + '\' ';
    } 
    
    if(tipoDocumento) {
        query = query + ' And  "DocType" = \'' + tipoDocumento + '\' ';
    } 
    
    if(nrDocumento) {
        query = query + ' And  "DocEntry" = \'' + nrDocumento + '\' ';
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