var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {

	var conn = $.db.getConnection();

	var query = 'UPDATE "VAR_DB_NAME"."RESUMOVOUCHER" SET ' +
		' "IDEMPRESADESTINO" = NULL, ' +
    	' "IDCAIXADESTINO" = NULL, ' +
    	' "IDNFESAIDA" = NULL, ' +
    	' "DTOUTVOUCHER" = NULL, ' +
    	' "IDUSROUTVOUCHER" = NULL, ' +
    	' "STATIVO" = \'True\' '+
		' WHERE "IDRESUMOVENDAWEB" =  ? ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setString(1, registro.IDRESUMOVENDAWEB);

		pStmt.execute();
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
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			fnHandleGet(id);
			break;
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