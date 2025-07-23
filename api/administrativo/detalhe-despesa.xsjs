var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Campo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var query = ' SELECT ' +
       	'   tbdl.IDDESPESASLOJA,  ' +
	    '   TO_VARCHAR(tbdl.DTDESPESA,\'DD-MM-YYYY\') AS DTDESPESA,  ' +
    	'   tbdl.DSHISTORIO,  ' +
    	'   tbdl.DSPAGOA,  ' +
    	'   tbdl.VRDESPESA,  ' +
    	'   tbdl.NUNOTAFISCAL,  ' +
    	'   tbdl.STATIVO,  ' +
    	'   tbdl.STCANCELADO,  ' +
	    '   tbcrd.IDCATEGORIARECDESP,  ' +
	    '   tbcrd.DSCATEGORIA,  ' +
	    '   tbf.NOFUNCIONARIO   ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DESPESALOJA tbdl ' +
        '	LEFT JOIN "VAR_DB_NAME".CATEGORIARECEITADESPESA tbcrd ON tbdl.IDCATEGORIARECEITADESPESA = tbcrd.IDCATEGORIARECDESP ' +
	    '	LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbdl.IDUSR = tbf.IDFUNCIONARIO  ' +
        ' WHERE ' +
        '	1 = ?';
        
    if(idDaEmpresa) {
        query = query + ' AND tbdl.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    
        if(dataPesquisa) {
            query = query + ' AND (tbdl.DTDESPESA BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
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