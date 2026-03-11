var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEFATURA" SET ' + 
        ' "NUCODAUTORIZACAO" = ?, ' + 
        ' "VRRECEBIDO" = ?, ' +
        ' "STCANCELADO" = ?, ' +
        ' "STPIX" = ?, ' +
        ' "NUAUTORIZACAO" = ? ' +
    	' WHERE "IDDETALHEFATURA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

	var registro = bodyJson;

    pStmt.setString(1, registro.NUCODAUTORIZACAO);
    pStmt.setFloat(2, registro.VRRECEBIDO);
    pStmt.setString(3, registro.STCANCELADO);
    pStmt.setString(4, registro.STPIX);
    pStmt.setString(5, registro.NUAUTORIZACAO);
	pStmt.setInt(6, registro.IDDETALHEFATURA);
                
	pStmt.execute();
    
	pStmt.close();

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