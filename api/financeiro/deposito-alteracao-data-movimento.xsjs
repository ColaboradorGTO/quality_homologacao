var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DEPOSITOLOJA" 
        SET
            DTMOVIMENTOCAIXA = ?
        WHERE 
            IDDEPOSITOLOJA =  ? 
    `;
    
    let bodyJson = JSON.parse($.request.body.asString()); 
    
    if(bodyJson.length > 0){
        let conn = $.db.getConnection();
        let pStmt = conn.prepareStatement(api.replaceDbName(query));
        
        for (let i = 0; i < bodyJson.length; i++) {
            
            let registro = bodyJson[i];
            
            pStmt.setDate(1, registro.DTMOVIMENTOCAIXA);
            pStmt.setInt(2, registro.IDDEPOSITOLOJA);
            
            pStmt.execute();
        }
        
        pStmt.close();
        
        conn.commit();
    }
	
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
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}