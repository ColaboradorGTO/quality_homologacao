var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var id = $.request.parameters.get("id");
    
    var query = ' SELECT ' + 
    '   tbdlc.IDDETLACCONVENIO, ' + 
	'   tbdlc.DTLANCAMENTO, ' + 
	'   LPAD(tbdlc.IDDETLACCONVENIO,10,0) AS NULANC, ' + 
	'   tf.NOFUNCIONARIO, ' + 
	'   tf.NOLOGIN, ' + 
	'   tbdlc.VRBRUTO, ' + 
	'   tbdlc.VRDESCONTO, ' + 
	'   tbdlc.VRLIQUIDO, ' + 
	'   tc.DSCONVENIO ' + 
    ' FROM ' + 
    '   "VAR_DB_NAME".DETLANCCONVENIO tbdlc' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tf ON tbdlc.IDCONVENIADO = tf.IDFUNCIONARIO ' + 
    '   INNER JOIN "VAR_DB_NAME".CONVENIO tc ON tbdlc.IDCONVENIO = tc.IDCONVENIO ' + 
    ' WHERE ' +
        '	1 = ? ';
    
    if(id) {
        query = query + ' And  tbdlc.IDDETLACCONVENIO = \'' + id + '\' ';
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