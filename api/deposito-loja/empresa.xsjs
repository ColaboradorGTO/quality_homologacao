var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Campo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisaInic = $.request.parameters.get("dataPesquisaInic");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var query = ' SELECT ' +
        '   tbdl.IDDEPOSITOLOJA, ' +
    	'   TO_VARCHAR(tbdl.DTMOVIMENTOCAIXA,\'DD-MM-YYYY\') AS DTMOVIMENTOCAIXA, ' +
    	'   TO_VARCHAR(tbdl.DTDEPOSITO,\'DD-MM-YYYY\') AS DTDEPOSITO, ' +
    	'   tbdl.DSHISTORIO, ' +
    	'   tbdl.NUDOCDEPOSITO, ' +
    	'   tbdl.VRDEPOSITO, ' +
    	'   tbdl.STATIVO, ' +
    	'   tbdl.STCANCELADO, ' +
    	'   tbcb.DSCONTABANCO, ' +
    	'   tbf.NOFUNCIONARIO  ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DEPOSITOLOJA tbdl ' +
        '	INNER JOIN "VAR_DB_NAME".CONTABANCO tbcb ON tbdl.IDCONTABANCO = tbcb.IDCONTABANCO ' +
	    '	LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbdl.IDUSR = tbf.IDFUNCIONARIO  ' +
        ' WHERE ' +
        '	1 = ?';
        
    if(idDaEmpresa) {
        query = query + ' AND tbdl.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    
        if(dataPesquisaInic) {
            query = query + ' AND (tbdl.DTDEPOSITO BETWEEN \'' + dataPesquisaInic + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
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