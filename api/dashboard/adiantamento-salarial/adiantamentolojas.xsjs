var api = $.import("quality.concentrador.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var idMarca = $.request.parameters.get("idMarca");

    var dataPesquisaInic = $.request.parameters.get("dataPesquisaIni");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var queryDeAdiantemento = ' SELECT ' +
        '   tbas.IDEMPRESA, ' +
        '   tbas.IDADIANTAMENTOSALARIO, ' +
        '	tbas.IDFUNCIONARIO, ' +
        '   TO_VARCHAR(tbas.DTLANCAMENTO,\'DD-MM-YYYY\') AS DTLANCAMENTO, ' +
        '	tbas.TXTMOTIVO, ' +
        '	tbas.VRVALORDESCONTO, ' +
        '	tbas.STATIVO, ' +
        '	tbf.NOFUNCIONARIO, ' +
        '	tbf.NUCPF, ' +
        '   tbe.NOFANTASIA' +
        ' FROM ' +
        '	"VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas ' +
        '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbas.IDFUNCIONARIO = tbf.IDFUNCIONARIO ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbas.IDEMPRESA = tbe.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ?';
    
    if ( idMarca >0) {
        queryDeAdiantemento = queryDeAdiantemento + ' And tbe.IDGRUPOEMPRESARIAL IN (' + idMarca + ') '; 
    }
    
    if(idDaEmpresa>0) {
        queryDeAdiantemento = queryDeAdiantemento + ' AND tbas.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    
    if(dataPesquisaInic) {
        queryDeAdiantemento = queryDeAdiantemento + ' AND (tbas.DTLANCAMENTO  BETWEEN \'' + dataPesquisaInic + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
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