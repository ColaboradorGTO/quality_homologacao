let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function atualizarStConferido(){
	let query = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET
            IDUSRCONFERENCIA = ?,
            STCONFERIDO = ?
        WHERE
            STATIVO = 'True'
            AND IDQUEBRACAIXA = ?
    `;
    
	let bodyJson = JSON.parse($.request.body.asString());
	
	if(bodyJson.length > 0){
        
        let conn = $.db.getConnection();
        let pStmt = conn.prepareStatement(api.replaceDbName(query));
        
        for (let { IDQUEBRACAIXA, STCONFERIDO, IDFUNCIONARIO } of bodyJson) {
            pStmt.setInt(1, parseInt(IDFUNCIONARIO));
            pStmt.setString(2, STCONFERIDO);
            pStmt.setInt(3, parseInt(IDQUEBRACAIXA));
            
            pStmt.addBatch();
        }
        
        pStmt.executeBatch();
        pStmt.close();
        
        conn.commit();
        
	}
	
	return 'Atualização realizada com sucesso!';
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.PUT:
                let doc = atualizarStConferido();
                
                $.response.setBody(JSON.stringify({ result : doc }));
                
                break;
                
            default:
                break;
        }
    } catch (e) {
        let detalheError = e.stack.split('\n');
        
        detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
        
        if(detalheError){
            detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
        }
        
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({
            message: e.message,
            detalheError
        }));
        $.response.status = 400;
    }   
}