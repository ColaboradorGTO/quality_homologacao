var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var nuRefProd = $.request.parameters.get("nuRefProd");
        
        var query = ' SELECT ' + 
        '   A.IDPRODUTO,' +
        '   A.DSNOME,' +
        '   A.NUCODBARRAS,' +
        '   A.IDSUBGRUPO,' +
        '   A.IDFABRICANTE,' +
        '   A.IDFORNECEDOR' +
        ' FROM ' + 
        '   "VAR_DB_NAME".PRODUTO A ' +
        ' WHERE ' +
            '	1 = ?' + 
            ' AND A.STATIVO=\'True\''; 
        
        if ( byId ) {
            query = query + ' And A.IDPRODUTO = \'' + byId + '\' ';
        }
        
        if ( nuRefProd ) {
            query = query + ' And (UPPER(A.DSNOME) LIKE UPPER(\'% '+nuRefProd+' %\') ) ';
        }
	

        query = query + ' ORDER BY A.DSNOME, A.NUCODBARRAS ';

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