var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."MOVIMENTOCAIXA" SET ' + 
        ' "VRFISICODINHEIRO" = ?, ' +
        ' "VRQUEBRACAIXA" = ? ' +
        ' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 

    pStmt.setFloat(1, registro.VRFISICODINHEIRO);
    pStmt.setFloat(2, registro.VRQUEBRACAIXA);
    pStmt.setString(3, registro.ID);
    
	pStmt.execute();
    
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