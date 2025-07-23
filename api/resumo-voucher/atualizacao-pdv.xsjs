var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOVOUCHER" SET ' + 
        ' "IDEMPRESADESTINO" = ?, ' +
        ' "IDCAIXADESTINO" = ?, ' +
        ' "DTOUTVOUCHER" = ?, ' +
        ' "IDUSROUTVOUCHER" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "IDRESUMOVENDAWEB" = ?, ' +
        ' "IDUSRLIBERACAOCONSUMO" = ? ' +
        ' WHERE "IDVOUCHER" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDEMPRESADESTINO);
        pStmt.setInt(2, registro.IDCAIXADESTINO);
        pStmt.setDate(3, registro.DTOUTVOUCHER);
        pStmt.setInt(4, registro.IDUSROUTVOUCHER);
        pStmt.setString(5, registro.STATIVO);
        pStmt.setString(6, registro.IDRESUMOVENDAWEB);
        pStmt.setInt(7, registro.IDUSRLIBERACAOCONSUMO);
        pStmt.setInt(8, registro.IDVOUCHER);
        
    	pStmt.execute();
    }
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