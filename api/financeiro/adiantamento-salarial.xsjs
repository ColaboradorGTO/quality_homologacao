var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
     var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var query = ' SELECT ' +
        ' tbas.IDADIANTAMENTOSALARIO, '+
    	' tbas.VRVALORDESCONTO, '+
    	' tbas.TXTMOTIVO, '+
    	' tbf.IDFUNCIONARIO, '+
    	' tbf.NOFUNCIONARIO, '+
    	' tbf.NOLOGIN '+
        ' FROM ' +
        '	"VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas ' +
        '	LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbas.IDFUNCIONARIO ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbas.STATIVO = \'True\'';
        
    
    if(idDaEmpresa) {
        query = query + ' AND tbas.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbas.DTLANCAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
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