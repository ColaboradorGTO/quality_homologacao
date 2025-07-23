var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
	var conn = $.db.getConnection();
	
	try {
		var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ' +
			' "PROTNFE_INFPROT_CSTAT" = ?, ' +
			' "PROTNFE_INFPROT_XMOTIVO" = ? ' +
			' WHERE "IDVENDA" =  ? ';
			
		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {
            
            var data = [];
			var registro = bodyJson[i];
			
			
			pStmt.setString(1, registro.cstat);
			pStmt.setString(2, registro.Motivo);
		    pStmt.setString(3, registro.IDVENDA);

			pStmt.execute();
			//fnAtualizarXml(conn, registro.IDVENDA, registro.xml.nfXml);
		}

		pStmt.close();

		conn.commit();

		return {
			"msg": "Atualização realizada com sucesso!"
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

		//Handle your PUt calls here
	    case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}