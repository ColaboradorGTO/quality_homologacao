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
function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."FUNCIONARIO" SET ' + 
        ' "DATAULTIMAALTERACAO" = ?, ' +
        ' "DATA_DEMISSAO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "ID" =  ? ';

    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

	var registro = bodyJson;

        pStmt.setDate(1, registro.DATAULTIMAALTERACAO);
        pStmt.setDate(2, registro.DATA_DEMISSAO);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.ID);
    
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
        //Handle your PUT calls here
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