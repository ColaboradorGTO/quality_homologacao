var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
     var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var query = ' SELECT ' +
        ' tbdf.IDCAIXAWEB, ' +
    	' tbdf.NUCODAUTORIZACAO, ' +
    	' TO_VARCHAR(tbdf.DTPROCESSAMENTO,\'DD/mm/YYYY\') AS DTPROCESSAMENTO, ' + 
    	' tbdf.VRRECEBIDO, ' +
    	' tbf.NOFUNCIONARIO, ' +
    	' tbc.DSCAIXA, ' +
    	' tbf.NOLOGIN ' +
    	' FROM ' +
        '	"VAR_DB_NAME".DETALHEFATURA tbdf ' +
        '	INNER JOIN "VAR_DB_NAME".CAIXA tbc ON tbc.IDCAIXAWEB = tbdf.IDCAIXAWEB ' +
        '	LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbdf.IDFUNCIONARIO ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbdf.STCANCELADO = \'False\'';
        
    
    if(idDaEmpresa) {
        query = query + ' AND tbdf.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbdf.DTPROCESSAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
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