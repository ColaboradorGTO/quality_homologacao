var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Camnpo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var queryDeAdiantamento = ' SELECT ' +
        '   SUM( tbas.VRVALORDESCONTO ) AS VRVALORDESCONTO  ' +
        ' FROM ' +
        '	"VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and tbas.STATIVO = \'True\'';
    
    if(idDaEmpresa) {
        queryDeAdiantamento = queryDeAdiantamento + ' AND tbas.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    
        if(dataPesquisa) {
            queryDeAdiantamento = queryDeAdiantamento + ' AND (tbas.DTLANCAMENTO  BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
        }
    }
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(queryDeAdiantamento, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}