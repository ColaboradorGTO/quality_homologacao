var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}


function fnHandlePut(){
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ' + 
        
		' "VRRECDINHEIRO" = ?, ' +
		' "VRRECCONVENIO" = ?, ' +
		' "VRRECCHEQUE" = ?, ' +
		' "VRRECCARTAO" = ?, ' +
		' "VRRECPOS" = ?, ' +
		' "VRRECVOUCHER" = ? ' +
		
    	' WHERE "IDVENDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
			pStmt.setFloat(1, registro.VRRECDINHEIRO);
			pStmt.setFloat(2, registro.VRRECCONVENIO);
			pStmt.setFloat(3, registro.VRRECCHEQUE);
			pStmt.setFloat(4, registro.VRRECCARTAO);
			pStmt.setFloat(5, registro.VRRECPOS);
			pStmt.setFloat(6, registro.VRRECVOUCHER);
			
			pStmt.setString(7, registro.IDVENDA);
                    
    	pStmt.execute();
    	
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