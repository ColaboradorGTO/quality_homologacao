var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idEmpresa) {
        throw "O Campo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataProcessamento = $.request.parameters.get("dataProcessamento");
    
    var query = ' SELECT ' +
        '   SUM(tbdf.VRRECEBIDO) AS VRTOTALFATURA1 ' +
    	' FROM ' +
        '	"VAR_DB_NAME".DETALHEFATURA tbdf ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and tbdf.STCANCELADO = \'False\'';
    
    if(idEmpresa) {
        query = query + ' AND tbdf.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataProcessamento) {
        query = query + ' AND (tbdf.DTPROCESSAMENTO  BETWEEN \'' + dataProcessamento + ' 00:00:00\' AND \'' + dataProcessamento + ' 23:59:59\')';
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