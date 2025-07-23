var api = $.import("quality.concentrador.api.apiResponse", "int_api");

function fnHandleGet() {

    var idImagens = $.request.parameters.get("IDImagens");
    
	var query = '   SELECT ' +
                '   T1.IDIMAGEMPRODUTO,' +
                '   T1.IDIMAGEM,' +
                '   T1.IDPRODUTO,' +
                '   T2.DSNOME,' +
                '   T2.NUCODBARRAS,' +
                '   T3.IMAGEM' +
        ' FROM ' +
		'   "VAR_DB_NAME".TBIMAGEMPRODUTO T1 ' +
		'   INNER JOIN "VAR_DB_NAME".TBIMAGEM T3 ON T1.IDIMAGEM = T3.IDIMAGEM ' +
		'   INNER JOIN "VAR_DB_NAME".PRODUTO T2 ON T1.IDPRODUTO = T2.IDPRODUTO ' +
		' WHERE ' +
            '	1 = ?' + 
            ' AND T1.STATIVO=\'True\''; 
    
    if ( idImagens ) {
        query = query + ' And  T1.IDIMAGEM = \'' + idImagens + '\' ';
    }
    
    query = query + ' ORDER BY T2.DSNOME, T2.NUCODBARRAS ';

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
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}