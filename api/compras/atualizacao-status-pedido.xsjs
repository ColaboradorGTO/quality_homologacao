var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOPEDIDO" SET ' + 
        ' "IDANDAMENTO" = ?, ' + 
        ' "IDRESPCANCELAMENTO" = ?, ' + 
        ' "DSMOTIVOCANCELAMENTO" = ?, ' + 
        ' "DTCANCELAMENTO" = ?, ' + 
        ' "STCANCELADO" = ? ' +
        ' WHERE "IDRESUMOPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 

    pStmt.setInt(1, registro.IDANDAMENTO);
    pStmt.setInt(2, registro.IDRESPCANCELAMENTO);
    pStmt.setString(3, registro.DSMOTIVOCANCELAMENTO);
    pStmt.setDate(4, registro.DTCANCELAMENTO);
    pStmt.setString(5, registro.STCANCELADO);
    pStmt.setInt(6, registro.IDRESUMOPEDIDO);
    
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