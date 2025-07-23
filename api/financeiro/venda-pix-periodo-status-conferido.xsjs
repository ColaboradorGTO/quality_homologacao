var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    
    var query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET 
            STCONFERIDO = ?,
            DATA_COMPENSACAO = ?
        WHERE 
            "IDVENDA" = ?
    `;

    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString());
    var updatedData = [];
    for (var i = 0; i < bodyJson.length; i++) {
        var registro = bodyJson[i];
        pStmt.setString(1, registro.STCONFERIDO);
        pStmt.setString(2, registro.DATA_COMPENSACAO);
        pStmt.setString(3, registro.IDVENDA);
        
        pStmt.execute();
        
        updatedData.push(registro)
    }

    pStmt.close();
    
    conn.commit();
    
    return {
        message: "Registro atualizado com sucesso!",
    };
} 

try {
  switch ( $.request.method ) {
      
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