var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Campo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");

    var query = ' SELECT ' +
       	'   tbrv.IDVOUCHER,  ' +
	    '   TO_VARCHAR(tbrv.DTINVOUCHER,\'DD-MM-YYYY\') AS DTINVOUCHER,  ' +
	    '   TO_VARCHAR(tbrv.DTOUTVOUCHER,\'DD-MM-YYYY\') AS DTOUTVOUCHER,  ' +
    	'   tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  ' +
    	'   tbcdestino.DSCAIXA AS DSCAIXADESTINO,  ' +
    	'   tbrv.NUVOUCHER,  ' +
    	'   tbrv.VRVOUCHER,  ' +
    	'   tbrv.STATIVO,  ' +
    	'   tbrv.STCANCELADO,  ' +
	    '   tbemp.NOFANTASIA  ' +
        ' FROM ' +
        '	"VAR_DB_NAME".RESUMOVOUCHER tbrv ' +
        '	LEFT JOIN "VAR_DB_NAME".CAIXA tbcorigem ON tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB ' +
        '	LEFT JOIN "VAR_DB_NAME".CAIXA tbcdestino ON tbrv.IDCAIXAORIGEM = tbcdestino.IDCAIXAWEB ' +
	    '	LEFT JOIN "VAR_DB_NAME".EMPRESA tbemp ON tbrv.IDEMPRESADESTINO = tbemp.IDEMPRESA  ' +
        ' WHERE ' +
        '	1 = ?';
        
    if(idDaEmpresa) {
        query = query + ' AND tbrv.IDEMPRESAORIGEM = \'' + idDaEmpresa + '\' ';
    
        if(dataPesquisa) {
            query = query + ' AND (tbrv.DTOUTVOUCHER BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
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