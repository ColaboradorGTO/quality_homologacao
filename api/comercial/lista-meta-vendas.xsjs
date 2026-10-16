var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    var idMarca = $.request.parameters.get("idMarca");
    var dataInicio = $.request.parameters.get("dataInicio");
    var dataFim = $.request.parameters.get("dataFim");

	var query = '   SELECT DISTINCT' +
                '   T3.IDGRUPOEMPRESA,' +
                '   T1.DSSUBGRUPOEMPRESARIAL,' +
                '   TO_VARCHAR( T3.DTMETAINICIO, \'DD-MM-YYYY\') AS DTMETAINICIOFORMAT, ' +
                '   TO_VARCHAR( T3.DTMETAFIM, \'DD-MM-YYYY\') AS DTMETAFIMFORMAT, ' +
                '   TO_VARCHAR( T3.DTMETAINICIO, \'YYYY-MM-DD\') AS DTMETAINICIO, ' +
                '   TO_VARCHAR( T3.DTMETAFIM, \'YYYY-MM-DD\') AS DTMETAFIM, ' +
                '   T3.STATIVO,' +
                '   T3.STSALVO' +
        ' FROM ' +
		'   "VAR_DB_NAME".METASLOJAS T3 ' +
		'   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL T1 ON T3.IDGRUPOEMPRESA = T1.IDSUBGRUPOEMPRESARIAL ' +
		' WHERE ' +
		'	1 = ? ';

    if (idMarca > 0) {
		query = query + ' And  T3.IDGRUPOEMPRESA = \'' + idMarca + '\' ';
	}
	
    if(dataInicio && dataFim) {
        query = query + ' AND (T3.DTMETAINICIO = \'' + dataInicio + ' 00:00:00\' AND T3.DTMETAFIM = \'' + dataFim + ' 00:00:00\')';
    }

    query = query + ' GROUP BY T3.IDGRUPOEMPRESA, T1.DSSUBGRUPOEMPRESARIAL, T3.DTMETAINICIO, T3.DTMETAFIM, T3.STATIVO, T3.STSALVO ';
    query = query + ' ORDER BY T3.DTMETAINICIO ';

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