var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CLIENTEDESCONTO" ' +
		" ( " +
		' "IDCLIENTEDESCONTO", ' +
		' "NUCPF", ' + 
    	' "NOCLIENTE", ' + 
    	' "PERCDESC", ' +
    	' "DTINICIODESC", ' +
    	' "DTFIMDESC", ' +
    	' "TXTMOTIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDCLIENTEDESCONTO")), 0) + 1 FROM "VAR_DB_NAME"."CLIENTEDESCONTO" WHERE 1=?';
	for (var i = 0; i < bodyJson.length; i++) {
        var iddesconto = api.executeScalar(queryId, 1);
		var registro = bodyJson[i];
		var cpf = String(registro.NUCPF);
		//cpf = String(cpf).padStart(12, "0");
	/* return {
	    "msg": cpf
	};*/
		pStmt.setInt(1, iddesconto);
    	pStmt.setString(2, cpf);
    	pStmt.setString(3, registro.NOCLIENTE);
    	pStmt.setInt(4, registro.PERCDESC);
    	pStmt.setString(5, registro.DTINICIODESC);
    	pStmt.setString(6, registro.DTFIMDESC);
    	pStmt.setString(7, registro.TXTMOTIVO);
    	
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}