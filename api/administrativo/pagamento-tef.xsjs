var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    var numeroTef = $.request.parameters.get("numeroTef");
    var query = 'SELECT '+ 
                '   concat(concat(TVP.TPAG,\'-\'),TVP.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTOTEF '+
                ' FROM '+
                '	"VAR_DB_NAME".VENDAPAGAMENTO TVP '+
                ' WHERE ' +
                '	1 = ?'+
                '   AND TVP.NOTEF = \'TEF\''+
                ' GROUP BY TVP.DSTIPOPAGAMENTO,TVP.TPAG';

   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}
