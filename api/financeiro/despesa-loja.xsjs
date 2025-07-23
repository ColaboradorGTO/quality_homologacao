var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var idDaCategoria = $.request.parameters.get("idCategoria");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var idDespesaLoja = $.request.parameters.get("idDespesaLoja");
    
    var query = ' SELECT ' +
        ' tbdl.IDEMPRESA, '+
        ' tbdl.IDDESPESASLOJA, '+
		' TO_VARCHAR(tbdl.DTDESPESA,\'DD/mm/YYYY\') AS DTDESPESA, ' + 
		' TO_VARCHAR(tbdl.DTDESPESA,\'DD/mm/YYYY HH:MM\') AS DTHORADESPESA, ' + 
		' tbdl.IDCATEGORIARECEITADESPESA, '+
		' tbcrd.DSCATEGORIA AS DSCATEGORIA, '+
		' tbdl.VRDESPESA, '+
		' tbdl.DSHISTORIO, '+
		' tbdl.DSPAGOA, '+
        ' tbdl.NUNOTAFISCAL,  ' +
    	' tbdl.STATIVO,  ' +
    	' tbdl.TPNOTA,  ' +
    	' tbdl.STCANCELADO,  ' +
		' tbf.IDFUNCIONARIO, '+
		' tbf.NOFUNCIONARIO, '+
	    ' tbfv.NOFUNCIONARIO AS NOFUNCVALE,   ' +
		' tbf.NOLOGIN, '+
		' tbe.NUCNPJ, '+
		' tbe.NOFANTASIA '+
        ' FROM ' +
        '	"VAR_DB_NAME".DESPESALOJA tbdl ' +
        '	INNER JOIN "VAR_DB_NAME".CATEGORIARECEITADESPESA tbcrd ON tbdl.IDCATEGORIARECEITADESPESA = tbcrd.IDCATEGORIARECDESP ' +
         '	INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbdl.IDEMPRESA = tbe.IDEMPRESA ' +
        '	LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbdl.IDUSR ' +
	    '	LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbfv ON tbdl.IDFUNCIONARIO = tbfv.IDFUNCIONARIO  ' +
        ' WHERE ' +
        '	1 = ?';
        
    if(idDespesaLoja){
         query = query + ' AND tbdl.IDDESPESASLOJA = \'' + idDespesaLoja + '\' ';
    }
    
    if(idDaEmpresa>0) {
        query = query + ' AND tbdl.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbdl.DTDESPESA BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    if(idDaCategoria) {
        query = query + ' AND tbdl.IDCATEGORIARECEITADESPESA = \'' + idDaCategoria + '\' ';
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