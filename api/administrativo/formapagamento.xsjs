var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {

    var query = ' SELECT DISTINCT' +
        ' UPPER(v.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTO'+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDAPAGAMENTO v ' +
    	' WHERE ' +	
    	'	1 = ?' +
        'AND v.DTPROCESSAMENTO >= \'2022-01-01\'';
    
    query = query + ' ORDER BY UPPER(v.DSTIPOPAGAMENTO) ';
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request,1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}