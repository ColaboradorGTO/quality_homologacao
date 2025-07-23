var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idmarca = $.request.parameters.get("idmarca");
        
        var query = ' SELECT ' + 
        '   tbe.IDEMPRESA,' +
        '   tbe.STGRUPOEMPRESARIAL,' +
        '   tbe.IDGRUPOEMPRESARIAL,' +
        '   tbe.IDSUBGRUPOEMPRESARIAL,' +
        '   tbe.NORAZAOSOCIAL,' +
        '   tbe.NOFANTASIA' +
        ' FROM ' + 
        '   "VAR_DB_NAME".EMPRESA tbe' +
        ' WHERE ' +
            '	1 = ?' + 
            'AND tbe.STATIVO=\'True\''; 
        
        if ( byId ) {
            query = query + ' And  tbe.IDEMPRESA = \'' + byId + '\' ';
        }
        
        if(idmarca !== '') {
            query = query + '  AND tbe.IDGRUPOEMPRESARIAL IN (' + idmarca + ') ';
        }else{
            query = query + ' AND tbe.IDGRUPOEMPRESARIAL IN (0) ';
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