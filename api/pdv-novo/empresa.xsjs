var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbe.IDEMPRESA,' +
    '   tbe.STGRUPOEMPRESARIAL,' +
    '   tbe.IDGRUPOEMPRESARIAL,' +
    '   tbe.IDSUBGRUPOEMPRESARIAL,' +
    '   tbe.NORAZAOSOCIAL,' +
    '   tbe.NOFANTASIA,' +
    '   tbe.NUCNPJ,' +
    '   tbe.NUINSCESTADUAL,' +
    '   tbe.NUINSCMUNICIPAL,' +
    '   tbe.CNAE,' +
    '   tbe.EENDERECO,' +
    '   tbe.ECOMPLEMENTO,' +
    '   tbe.EBAIRRO,' +
    '   tbe.ECIDADE,' +
    '   tbe.SGUF,' +
    '   tbe.NUUF,' +
    '   tbe.NUCEP,' +
    '   tbe.NUIBGE,' +
    '   tbe.EEMAILPRINCIPAL,' +
    '   tbe.EEMAILCOMERCIAL,' +
    '   tbe.EEMAILFINANCEIRO,' +
    '   tbe.EEMAILCONTABILIDADE,' +
    '   tbe.NUTELPUBLICO,' +
    '   tbe.NUTELCOMERCIAL,' +
    '   tbe.NUTELFINANCEIRO,' +
    '   tbe.NUTELGERENCIA,' +
    '   tbe.EURL,' +
    '   tbe.PATHIMG,' +
    '   tbe.NUCNAE,' +
    '   tbe.STECOMMERCE,' +
    '   TO_VARCHAR(tbe.DTULTATUALIZACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTATUALIZACAO, ' +
    '   tbe.STATIVO,' +
    '   tbe.ALIQPIS,' +
    '   tbe.ALIQCOFINS,' +
    '   tbe.STATUALIZADIARIO,' +
    '   TO_VARCHAR(tbe.HORAATUALIZA,\'HH24:MI:SS\') AS HORAATUALIZA' +
    ' FROM ' + 
    '   "VAR_DB_NAME".EMPRESA tbe' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbe.IDEMPRESA = \'' + byId + '\' ';
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