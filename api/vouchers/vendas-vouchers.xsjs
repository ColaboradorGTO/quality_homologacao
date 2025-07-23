var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePost() {
	var conn = $.db.getConnection();
	var bodyJson = JSON.parse($.request.body.asString()); 
	 
	     //return {"msg" : bodyJson["produto1"] +"//"+bodyJson["produto2"]};
	    
	
	
	try {
		var query = ' SELECT distinct count(1) as "TOTALPRODUTOVENDA", t1.idvenda, t1.cprod  ' +
        '   FROM QUALITY_CONC_HML.VENDADETALHE T1 ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and T1.STCANCELADO = \'False\' ';
    
        query = query + ' AND T1.CPROD in( \'' + bodyJson["produto1"] + '\',\'' + bodyJson["produto2"]+'\') ';
        
        query = query + 'group by T1.IDVENDA, t1.cprod having count(1) = 2 ORDER BY t1.idvenda  ';
        //return {query};
       return api.sqlQuery(query, 1);

	
	} catch (e) {
	    conn.rollback();
	    throw e;
	}
}



$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		default:
			break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}