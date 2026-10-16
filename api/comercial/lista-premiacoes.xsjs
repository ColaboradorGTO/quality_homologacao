var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {

	var query = '   SELECT DISTINCT' +
                '   T3.IDSUBGRUPOEMPRESARIAL,' +
                '   T1.DSSUBGRUPOEMPRESARIAL,' +
                '   TO_VARCHAR( T3.DTPREMIOINICIO, \'DD-MM-YYYY\') AS DTPREMIOINICIOFORMAT, ' +
                '   TO_VARCHAR( T3.DTPREMIOFIM, \'DD-MM-YYYY\') AS DTPREMIOFIMFORMAT, ' +
                '   TO_VARCHAR( T3.DTPREMIOINICIO, \'YYYY-MM-DD\') AS DTPREMIOINICIO, ' +
                '   TO_VARCHAR( T3.DTPREMIOFIM, \'YYYY-MM-DD\') AS DTPREMIOFIM, ' +
                '   T3.STATIVO' +
        ' FROM ' +
		'   "VAR_DB_NAME".PREMIACAO T3 ' +
		'   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL T1 ON T3.IDSUBGRUPOEMPRESARIAL = T1.IDSUBGRUPOEMPRESARIAL ' +
		' WHERE ' +
		'	1 = ? ';

    query = query + ' GROUP BY T3.IDSUBGRUPOEMPRESARIAL, T1.DSSUBGRUPOEMPRESARIAL, T3.DTPREMIOINICIO, T3.DTPREMIOFIM, T3.STATIVO';
    query = query + ' ORDER BY T3.IDSUBGRUPOEMPRESARIAL ';

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