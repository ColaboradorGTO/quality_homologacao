var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    let conn = $.db.getConnection();
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            "IDANDAMENTO" = ? ,
            "TXTOBSDEVPEDIDO" = ?,
            "DTMOVPEDIDO" = now()
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
            OR "IDPEDIDOPRIMARIO" = ?
    `;
        
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let registro = JSON.parse($.request.body.asString()); 

    pStmt.setInt(1, registro.IDANDAMENTO);
    pStmt.setString(2, registro.TXTOBSDEVPEDIDO);
    pStmt.setInt(3, registro.IDRESUMOPEDIDO);
    pStmt.setInt(4, registro.IDRESUMOPEDIDO);
    
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