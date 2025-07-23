var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Camnpo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var query = ' SELECT ' +
        '   ifnull(SUM(tbas.VRVALORDESCONTO),0) AS VRADIANTAMENTO  ' +
        ' FROM ' +
        '	"VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and tbas.STATIVO = \'True\'';
    
    if(idDaEmpresa) {
        query = query + ' AND tbas.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    
        if(dataPesquisa) {
            query = query + ' AND (tbas.DTLANCAMENTO  BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
        }
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