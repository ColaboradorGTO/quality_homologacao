var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."TBIMAGEM" SET ' + 
        ' "STATIVO" = ?' +
        ' WHERE "IDIMAGEM" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 

    pStmt.setString(1, registro.STATIVO);
    pStmt.setInt(2, registro.IDIMAGEM);
    
	pStmt.execute();
    
    var query2 = 'UPDATE "VAR_DB_NAME".TBIMAGEMPRODUTO SET STATIVO = \'False\' WHERE IDIMAGEM=?';
    
	var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
    pStmt2.setInt(1,registro.IDIMAGEM);
    pStmt2.execute();
	pStmt2.close();
	
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}