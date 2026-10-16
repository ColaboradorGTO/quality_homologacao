var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function fnHandlePut() {
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    
    let query = `
        UPDATE
            "VAR_DB_NAME".RESUMOBALANCO
        SET
            STINATIVO = ?,
            STATIVO = ?
        WHERE 
            IDRESUMOBALANCO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    for (let i = 0; i < bodyJson.length; i++) {
        let registro = bodyJson[i];
        
        pStmt.setString(1, registro.STINATIVO);
        pStmt.setString(2, registro.STATIVO);
        pStmt.setInt(3, registro.IDRESUMOBALANCO);
        
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