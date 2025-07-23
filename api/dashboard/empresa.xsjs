var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Camnpo ID da Empresa é um parametro obrigatório !"; 
    }
    
    var queryDeEmpresa = ' SELECT ' +
        '   tbe.IDEMPRESA, '+
        '   tbe.NOFANTASIA, '+
        '   tbe.NUCNPJ '+
        ' FROM ' +
        '	"VAR_DB_NAME".EMPRESA tbe ' +
        ' WHERE ' +
        '	1 = ?';
    
    if(idDaEmpresa) {
        queryDeEmpresa = queryDeEmpresa + ' AND tbe.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(queryDeEmpresa, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}