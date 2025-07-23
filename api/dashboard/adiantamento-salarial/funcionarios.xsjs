var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Camnpo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var queryDeAdiantemento = ' SELECT ' +
        '   tbas.IDADIANTAMENTOSALARIO, ' +
        '	tbas.IDFUNCIONARIO, ' +
        '   TO_VARCHAR(tbas.DTLANCAMENTO,\'DD-MM-YYYY\') AS DTLANCAMENTO, ' +
        '	tbas.TXTMOTIVO, ' +
        '	tbas.VRVALORDESCONTO, ' +
        '	tbas.STATIVO, ' +
        '	tbf.NOFUNCIONARIO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas ' +
        '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbas.IDFUNCIONARIO = tbf.IDFUNCIONARIO ' +
        ' WHERE ' +
        '	1 = ?';
        
    
    if(idDaEmpresa) {
        queryDeAdiantemento = queryDeAdiantemento + ' AND tbas.IDEMPRESA = \'' + idDaEmpresa + '\' ';
        if(dataPesquisaInicio) {
            queryDeAdiantemento = queryDeAdiantemento + ' AND (tbas.DTLANCAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        }
        
    }
    
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(queryDeAdiantemento, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}