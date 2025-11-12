let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    let registro = bodyJson;
	let idsFaturas = registro.IDS_FATURAS.replace("'", "");
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEFATURA" 
        SET 
            STCONFERIDO = ?,
            IDUSRCONFERENCIA = ?
        WHERE 
            "IDDETALHEFATURA" IN(${idsFaturas}) 
    `;
	
    let conn = $.db.getConnection();
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, registro.STCONFERIDO);
    pStmt.setInt(2, registro.IDFUNCIONARIO);

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
            let docReturn = fnHandlePut();
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