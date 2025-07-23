var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idmarca = $.request.parameters.get("idmarca");
    var ufprod = $.request.parameters.get("ufprod");
    
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
    '	tbc.IDCONFIGURACAO,' +
    '	tbc.DSNOMEPFX,' +
    '   TO_VARCHAR(tbc.DTVALIDADECERTIFICADO,\'YYYY-MM-DD\') AS DTVALIDADECERTIFICADO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".EMPRESA tbe' +
    '   LEFT JOIN "VAR_DB_NAME".CONFIGURACAO tbc on tbe.IDEMPRESA = tbc.IDEMPRESA' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbe.STATIVO=\'True\''; 
    
    if ( byId ) {
        query = query + ' And  tbe.IDEMPRESA = \'' + byId + '\' ';
    }
    
    // if(idmarca > '0') {
    //     query = query + ' AND tbe.IDGRUPOEMPRESARIAL = \'' + idmarca + '\' ';
    // }
    
    if(idmarca > '0') {
        query = query + ` AND tbe.IDGRUPOEMPRESARIAL IN (${idmarca}) `;
    }
    if(ufprod && ufprod !== '0') {
        query = query + ' AND tbe.SGUF = \'' + ufprod + '\' ';
    }
    
    query = query + ' ORDER BY tbe.IDEMPRESA';
    
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