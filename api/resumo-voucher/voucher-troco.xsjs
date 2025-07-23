var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function fnHandlePost() {
	
	var conn = $.db.getConnection();
	var conn2 = $.db.getConnection();
	var queryId = 'SELECT "VAR_DB_NAME".SEQ_RESUMOVOUCHER.NEXTVAL FROM DUMMY WHERE 1 = ?';
	
	try {
		var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOVOUCHER" ' +
			" ( " +
			' "IDVOUCHER", ' +
			' "IDEMPRESAORIGEM", ' +
			' "IDRESUMOVENDAWEBORIGEMTROCO", ' +
			' "IDCAIXAORIGEM", ' +
			' "DTINVOUCHER", ' +
			' "IDUSRINVOUCHER", ' +
			' "IDVENDEDOR", ' +
			' "IDCLIENTE", ' +
			' "VRVOUCHER", ' +
		    ' "NUVOUCHER", ' +
		    ' "STATIVO", ' +
			' "STCANCELADO", ' +
			' "IDUSRLIBERACAOCRIACAO",' +
			' "STTIPOTROCA",' +
			' "IDVOUCHERORIGEMTROCO"' +
			' ) ' +
			' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {

			var registro = bodyJson[i];
			var idVoucher = api.executeScalar(queryId, 1);

			pStmt.setInt(1, idVoucher);
			pStmt.setInt(2, registro.IDEMPRESAORIGEM);
			pStmt.setString(3, registro.IDRESUMOVENDAWEBORIGEMTROCO);
			pStmt.setInt(4, registro.IDCAIXAORIGEM);
			pStmt.setTimestamp(5, registro.DTINVOUCHER);
			pStmt.setInt(6, registro.IDUSRINVOUCHER);
			pStmt.setInt(7, registro.IDVENDEDOR);
			pStmt.setInt(8, registro.IDCLIENTE);
			pStmt.setFloat(9, registro.VRVOUCHER);
			pStmt.setString(10, registro.NUVOUCHER);
			pStmt.setString(11, registro.STATIVO);
			pStmt.setString(12, registro.STCANCELADO);
			setIntOrNull(pStmt, 13, registro.IDUSRLIBERACAOCRIACAO);
			pStmt.setString(14, registro.STTIPOTROCA);
			setIntOrNull(pStmt, 15, registro.IDVOUCHERORIGEMTROCO);
			pStmt.execute();
		
		    conn2.commit();
        }
		    
		
 
		pStmt.close();
       	conn.commit();

		return {
			"msg": "Inclusão realizada com sucesso!"
		};
	} catch (e) {
		conn.rollback();
		throw e;
	}
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
		//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
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