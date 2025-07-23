var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function fnHandlePut(){
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ' + 
        
		' "VRTOTALPAGO" = ?, ' +
		' "VRTOTALVENDA" = ?, ' +
		' "NFE_INFNFE_TOTAL_ICMSTOT_VBC" = ?, ' +
		' "NFE_INFNFE_TOTAL_ICMSTOT_VPROD" = ?, ' +
		' "NFE_INFNFE_TOTAL_ICMSTOT_VNF" = ? ' +
		' WHERE "IDVENDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
			pStmt.setFloat(1, registro.VALOR);
			pStmt.setFloat(2, registro.VALOR);
			pStmt.setFloat(3, registro.VALOR);
			pStmt.setFloat(4, registro.VALOR);
			pStmt.setFloat(5, registro.VALOR);
		
			pStmt.setString(6, registro.IDVENDA);
                    
    	pStmt.execute();
    	//var queryExclusaoVendaDetahe = 'DELETE FROM "VAR_DB_NAME"."VENDA" WHERE IDVENDA = ?';
    	//api.sqlQuery(queryExclusaoVendaDetahe,); 
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your PUt calls here
	    case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}