var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {

    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
	var query = '   SELECT DISTINCT' +
                '   T3.IDEMPRESA,' +
                '   T1.NOFANTASIA,' +
                '   TO_VARCHAR( T3.DTMETAINICIO, \'DD-MM-YYYY\') AS DTMETAINICIOFORMAT, ' +
                '   TO_VARCHAR( T3.DTMETAFIM, \'DD-MM-YYYY\') AS DTMETAFIMFORMAT, ' +
                '   TO_VARCHAR( T3.DTMETAINICIO, \'YYYY-MM-DD\') AS DTMETAINICIO, ' +
                '   TO_VARCHAR( T3.DTMETAFIM, \'YYYY-MM-DD\') AS DTMETAFIM, ' +
                '   T3.IDMETASLOJA,' +
                '   T3.STATIVO' +
        ' FROM ' +
		'   "VAR_DB_NAME".METASLOJAS T3 ' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA T1 ON T3.IDEMPRESA = T1.IDEMPRESA ' +
		' WHERE ' +
		'	1 = ? ';

	if (idDaEmpresa > 0) {
		query = query + ' And  T3.IDEMPRESA = \'' + idDaEmpresa + '\' ';
	}
	
    query = query + ' GROUP BY T3.IDEMPRESA, T1.NOFANTASIA, T3.DTMETAINICIO, T3.DTMETAFIM, IDMETASLOJA, T3.STATIVO ';
    query = query + ' ORDER BY T3.IDEMPRESA ';

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