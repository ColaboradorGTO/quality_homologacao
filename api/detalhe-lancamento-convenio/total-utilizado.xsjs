var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var IdConvenio = $.request.parameters.get("IdConvenio");
    var IdConveniado = $.request.parameters.get("IdConveniado");
    
    var query = ' SELECT ' + 
    '   sum(tbdlc.VRLIQUIDO) AS TotalUtilizado' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETLANCCONVENIO tbdlc' +
    ' WHERE ' +
        '	1 = ? '+
        '   and MONTH(tbdlc.DTLANCAMENTO) = MONTH(now())';
    
    if(IdConvenio) {
        query = query + ' And  tbdlc.IDCONVENIO = \'' + IdConvenio + '\' ';
    } 
    if(IdConveniado) {
        query = query + ' And  tbdlc.IDCONVENIADO = \'' + IdConveniado + '\' ';
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