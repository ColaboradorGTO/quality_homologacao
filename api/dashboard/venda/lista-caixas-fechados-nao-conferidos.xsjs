var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idEmpresa) {
        throw "O Camnpo ID da Empresa é um parametro obrigatório !";
    }

    var query = ' SELECT ' +
        '   T1.ID, '+
        '   TO_VARCHAR(T1.DTFECHAMENTO,\'DD-MM-YYYY\') AS DTHORAFECHAMENTO, ' + 
        '   TO_VARCHAR(T1.DTABERTURA,\'DD-MM-YYYY\') AS DTHORAABERTURA, ' + 
        '   TO_VARCHAR(T1.DTFECHAMENTO,\'YYYY-MM-DD\') AS DTFECHAMENTO, ' + 
        '   TO_VARCHAR(T1.DTABERTURA,\'YYYY-MM-DD\') AS DTABERTURA, ' +
        '   T2.DSCAIXA ' +
        ' FROM ' +
        '	"VAR_DB_NAME".MOVIMENTOCAIXA T1 ' +
        '   INNER JOIN "VAR_DB_NAME".CAIXA T2 ON T1.IDCAIXA = T2.IDCAIXAWEB ' +
	    ' WHERE ' +
        '	1 = ?'+
        '   and t1.STFECHADO=\'True\' and t1.STCONFERIDO=false and t1.STCONFERIDO=FALSE and t1.DTFECHAMENTO >=\'2021-04-15 00:00:00 \' ';
        
    if(idEmpresa) {
        query = query + ' AND T1.IDEMPRESA = \'' + idEmpresa + '\' ';
    }

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