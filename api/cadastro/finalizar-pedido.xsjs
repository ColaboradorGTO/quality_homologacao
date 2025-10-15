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
 
function execute () {
    let bodyJson = JSON.parse($.request.body.asString()); 
    
    if(bodyJson.length > 0){
        let conn = $.db.getConnection();
        	    
        let query = `
            UPDATE 
                "VAR_DB_NAME"."RESUMOPEDIDO" 
            SET 
                IDANDAMENTO = 5
            WHERE 
                IDRESUMOPEDIDO =  ?
                OR IDPEDIDOPRIMARIO = ?
        `;
        
        let pStmt = conn.prepareStatement(api.replaceDbName(query));
        
        for (var i = 0; i < bodyJson.length; i++) {
            let registro = bodyJson[i];
            
            
            pStmt.setInt(1, parseInt(registro.IDRESUMOPEDIDO));
            pStmt.setInt(2, parseInt(registro.IDRESUMOPEDIDO));
            
            pStmt.execute();
        }
        
        pStmt.close();
        
        conn.commit();
    }
    
    return {
        "msg": "Cadastro de Produtos Finalizado Com Sucesso!"
    };
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = execute();
                 $.response.setBody(JSON.stringify({ result : doc }));
                break;
                
            default:
                break;
        }
    
    } catch(e) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ message : e.message }));
        $.response.status = 400;
    }   
}