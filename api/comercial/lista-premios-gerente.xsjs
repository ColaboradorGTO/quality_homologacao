var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {

    var iDPremSubGrupEmp = $.request.parameters.get("idPremioSubGrupoEmp"); 
    var dtInicPrem = $.request.parameters.get("DTInicPremio"); 
    var dtFimPrem = $.request.parameters.get("DTFimPremio"); 
    var NOFunc = $.request.parameters.get("NoFunc"); 

	var query = '   SELECT ' +
                '   T3.IDPREMIACAO,' +
                '   T3.IDSUBGRUPOEMPRESARIAL,' +
                '   T1.DSSUBGRUPOEMPRESARIAL,' +
                '   TO_VARCHAR( T3.DTPREMIOINICIO, \'DD-MM-YYYY\') AS DTPREMIOINICIOFORMAT, ' +
                '   TO_VARCHAR( T3.DTPREMIOFIM, \'DD-MM-YYYY\') AS DTPREMIOFIMFORMAT, ' +
                '   TO_VARCHAR( T3.DTPREMIOINICIO, \'YYYY-MM-DD\') AS DTPREMIOINICIO, ' +
                '   TO_VARCHAR( T3.DTPREMIOFIM, \'YYYY-MM-DD\') AS DTPREMIOFIM, ' +
                '   T3.NOINDICADOR,' +
                '   T3.TPAPURACAO,' +
                '   T3.VRBONUSSENIOR, ' +
                '   T3.VRBONUSPLENO, ' +
                '   T3.VRBONUSJUNIOR, ' +
                '   T3.VRBONUSTODOS, ' +
                '   T3.STATIVO' +
        ' FROM ' +
		'   "VAR_DB_NAME".PREMIACAO T3 ' +
		'   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL T1 ON T3.IDSUBGRUPOEMPRESARIAL = T1.IDSUBGRUPOEMPRESARIAL ' +
		' WHERE ' +
		'	1 = ? ' +
		'   AND T3.STATIVO <> \'False\' ';

	if (iDPremSubGrupEmp > 0) {
		query = query + ' And  T3.IDSUBGRUPOEMPRESARIAL = \'' + iDPremSubGrupEmp + '\' ';
	}
	
	if(dtInicPrem && dtFimPrem) {
            query = query + ' AND (T3.DTPREMIOINICIO = \'' + dtInicPrem + ' 00:00:00\' AND T3.DTPREMIOFIM = \'' + dtFimPrem + ' 00:00:00\')';
    }

	if (NOFunc) {
		query = query + ' And  T3.NOFUNCAO = \'' + NOFunc + '\' ';
	}
	
	    query = query + ' ORDER BY T3.IDPREMIACAO ASC';

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