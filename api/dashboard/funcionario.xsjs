var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Camnpo ID da Empresa é um parametro obrigatório !"; 
    }
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa"); 
    
    var queryDeDespesa = ' SELECT ' +
        '   tbf.IDFUNCIONARIO, '+
        '   tbf.IDEMPRESA, '+
        '   tbf.NOFUNCIONARIO, '+
        '   tbf.NOLOGIN, '+
        '   tbf.NUCPF, ' +
        '   tbf.STATIVO, ' +
        '   tbe.NOFANTASIA ' +
        ' FROM ' +
        '	"VAR_DB_NAME".FUNCIONARIO tbf ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbf.IDEMPRESA = tbe.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ?';
    
    if(idDaEmpresa) {
        queryDeDespesa = queryDeDespesa + ' AND tbf.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(queryDeDespesa, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}