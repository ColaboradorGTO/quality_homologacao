var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idSubGrupoEmpresarial = $.request.parameters.get("idSubGrupoEmpresarial");
    
    var query = 'SELECT '+ 
                '   tbe.IDEMPRESA AS IDEMP, ' +
        		'   tbe.NOFANTASIA, ' +
        		'   tbe.NUCNPJ, ' +
        		'   tbe.NUINSCESTADUAL, ' +
        		'   tbc.IDCONFIGURACAO, ' +
        		'   tbc.DSNOMEPFX, ' +
        		'   TO_VARCHAR(tbc.DTVALIDADECERTIFICADO,\'DD-MM-YYYY\') AS DTVALIDADECERTIFICADO ' +
                ' FROM '+
                '	"VAR_DB_NAME".EMPRESA tbe '+
		        '   LEFT JOIN "VAR_DB_NAME".CONFIGURACAO tbc ON tbe.IDEMPRESA = tbc.IDEMPRESA ' +
		        ' WHERE '+
		        '   1 = ?'+
                '   and tbe.STATIVO=\'True\'';
    if(idSubGrupoEmpresarial) {
        query = query + ' AND tbe.IDSUBGRUPOEMPRESARIAL = \'' + idSubGrupoEmpresarial + '\' ';
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