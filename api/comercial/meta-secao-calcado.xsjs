var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idDaMeta = $.request.parameters.get("idmeta"); 

	var query = '   SELECT ' +
                '   T3.IDMETASLOJA,' +
                '   TO_VARCHAR( T3.DTMETAINICIO, \'DD-MM-YYYY\') AS DTMETAINICIO, ' +
                '   TO_VARCHAR( T3.DTMETAFIM, \'DD-MM-YYYY\') AS DTMETAFIM, ' +
                '   T3.DTMETAINICIO AS DTINIMETA, ' +
                '   T3.DTMETAFIM AS DTFIMMETA, ' +
                '   T3.IDGRUPOEMPRESA,' +
                '   T3.IDEMPRESA,' +
                '   T3.IDFUNCIONARIO,' +
                '   T3.VRVENDACALCADOS,' +
                '   T3.PERCVENDACALCADOS,' +
                '   T3.VRMETAVENDACALCADOS,' +
                '   T3.PERCMETAVENDACALCADOS,' +
                '   T3.PERCTOTALVENDA,' +
                '   T3.STATIVO,' +
                '   T3.STSALVO,' +
		        '   T1.NOFANTASIA' +
        ' FROM ' +
		'   "VAR_DB_NAME".METASLOJAS T3 ' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA T1 ON T3.IDEMPRESA = T1.IDEMPRESA ' +
		' WHERE ' +
		'	1 = ? ' +
		'   AND T3.STATIVO <> \'False\' ';

	if (idDaMeta > 0) {
		query = query + ' And  T3.IDMETASLOJA = \'' + idDaMeta + '\' ';
	}

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    

}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}