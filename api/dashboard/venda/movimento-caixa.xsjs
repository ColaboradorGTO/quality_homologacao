var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idCaixa = $.request.parameters.get("idCaixa");
    var dataFechamento = $.request.parameters.get("dataFechamento");    
    if(!idEmpresa) {
        throw "O Campo ID da Empresa é um parametro obrigatório !";
    }
    
    var query = ' SELECT ' +
        '   tbmc.ID ' +
    	' FROM ' +
        '	"VAR_DB_NAME".MOVIMENTOCAIXA tbmc ' +
        ' WHERE ' +
        '	1 = ?';
        
    if(idEmpresa) {
        query = query + ' AND tbmc.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataFechamento) {
        query = query + ' AND (tbmc.DTFECHAMENTO  BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\')';
    }
    if(idCaixa) {
        query = query + ' AND tbmc.IDCAIXA = \'' + idCaixa + '\' ';
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