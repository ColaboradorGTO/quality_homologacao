var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function fnHandlePut() {
    var conn = $.db.getConnection();
    var bodyJson = JSON.parse($.request.body.asString());
    var queryIds = api.sqlQuery(' SELECT TO_INT(IDDETALHEBALANCO) as IDDETALHEBALANCO FROM "VAR_DB_NAME"."DETALHEBALANCO" WHERE "IDRESUMOBALANCO" = ' +bodyJson[0].IDRESUMOBALANCO +' AND "IDPRODUTO" =?' , bodyJson[0].IDPRODUTO);
   
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEBALANCO" SET ' + 
		' "TOTALCONTAGEMGERAL" = 0 ' +
    	' WHERE "IDDETALHEBALANCO" =  ?  ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
     

    for (var i = 0; i < queryIds.length; i++) {

		var registro = queryIds[i];
         
		pStmt.setInt(1, registro.IDDETALHEBALANCO);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	
	 var query2 = 'UPDATE "VAR_DB_NAME"."DETALHEBALANCO" SET ' + 
		' "TOTALCONTAGEMGERAL" = ? ' +
    	' WHERE "IDDETALHEBALANCO" =  ?  ';
        
    var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
     
		var registro2 = bodyJson[0];
         
		pStmt2.setInt(1, registro2.QTD);
		pStmt2.setInt(2, queryIds[0].IDDETALHEBALANCO);
                    
    	pStmt2.execute();
    
	pStmt2.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
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
            
                
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}