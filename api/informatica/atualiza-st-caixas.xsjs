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

	var query = 'UPDATE "VAR_DB_NAME"."CAIXA" SET ' +
		' "STATUALIZA" = ?, ' +
		' "STLIMPA" = ? ' +
		' WHERE "IDCAIXAWEB" =  ? ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
	    
	    var registro = bodyJson[i];
	    
	    for (var j = 0; j < registro.STATUALIZA.length; j++) {
	        
	        var pontoAtualizar = registro.STATUALIZA[j];
	        
	        var stAtualiza='False';
	        var stLimpar ='False';
	        var id = '';
	        
	        if(pontoAtualizar.indexOf('A') !== -1){
	            stAtualiza='True';
	            id = pontoAtualizar.replace('A','');
	        }
	        if(pontoAtualizar.indexOf('L') !== -1){
	            stLimpar='True';
	            id = pontoAtualizar.replace('L','');
	        }
	        id = parseInt(id);
	       
        	pStmt.setString(1, stAtualiza);
    		pStmt.setString(2, stLimpar);
    		pStmt.setInt(3, id);
    
    		pStmt.execute();
	    }

	
	}
	pStmt.close();

	conn.commit();

	return {
		msg: "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
		//Handle your GET calls here
		case $.net.http.PUT:
			var docReturn = fnHandlePut();
			$.response.setBody(JSON.stringify(docReturn));
			break;
		default:
			break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}