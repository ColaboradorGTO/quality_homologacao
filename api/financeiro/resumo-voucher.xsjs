var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
     var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var query = ' SELECT ' +
        ' tbrv.IDVOUCHER, ' +
    	' tbrv.NUVOUCHER, ' +
    	' tbrv.VRVOUCHER, ' +
    	' TO_VARCHAR(tbrv.DTINVOUCHER,\'DD/mm/YYYY\') AS DTINVOUCHER, ' + 
    	' tbc.DSCAIXA, ' +
    	' tbf.NOFUNCIONARIO, ' +
    	' tbf.NOLOGIN ' +
    	' FROM ' +
        '	"VAR_DB_NAME".RESUMOVOUCHER tbrv ' +
        '	INNER JOIN "VAR_DB_NAME".CAIXA tbc ON tbc.IDCAIXAWEB = tbrv.IDCAIXADESTINO ' +
        '	LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbrv.IDUSRINVOUCHER ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbrv.STCANCELADO = \'False\'';
        
    
    if(idDaEmpresa) {
        query = query + ' AND tbrv.IDEMPRESADESTINO = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbrv.DTINVOUCHER BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
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