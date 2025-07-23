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

function fnHandleGet(byId) {

	var dataPesquisa = $.request.parameters.get("dataPesquisa");
	var query = ' SELECT ' +
		'   tbl.IDLOGERRORPDV,' +
		'   tbl.IDCAIXAWEB,' +
		'   tbl.IDVENDA,' +
		'   tbl.IDOPERADOR,' +
		'   tbl.IDMOVIMENTOCAIXAWEB,' +
		'   tbl.DTLOGERRORPDV,' +
		'   tbl.DSLOGERRORPDV' +
		' FROM ' +
		'   "VAR_DB_NAME".LOGERRORPDV tbl' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbl.IDLOGERRORPDV = \'' + byId + '\' ';
	}
	if (dataPesquisa) {
		query = query + ' AND (tbl.DTLOGERRORPDV BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
	}

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
	var conn = $.db.getConnection();
	var query = 'UPDATE "VAR_DB_NAME"."LOGERRORPDV" SET ' +
		' "IDCAIXAWEB" = ?, ' +
		' "IDVENDA" = ?, ' +
		' "IDOPERADOR" = ?, ' +
		' "IDMOVIMENTOCAIXAWEB" = ?, ' +
		' "DTLOGERRORPDV" = ?, ' +
		' "DSLOGERRORPDV" = ? ' +
		' WHERE "IDLOGERRORPDV" =  ? ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		setIntOrNull(pStmt, 1, registro.IDCAIXAWEB);
		pStmt.setString(2, registro.IDVENDA);
		setIntOrNull(pStmt, 3, registro.IDOPERADOR);
		pStmt.setString(4, registro.IDMOVIMENTOCAIXAWEB);
		setTimestampOrNull(pStmt, 5, registro.DTLOGERRORPDV);
		pStmt.setString(6, registro.DSLOGERRORPDV);
		pStmt.setInt(7, registro.IDLOGERRORPDV);

		pStmt.execute();
	}
	pStmt.close();

	conn.commit();

	return {
		msg: "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
	try {
		var conn = $.db.getConnection();

		var query = 'INSERT INTO "VAR_DB_NAME"."LOGERRORPDV" ' +
			" ( " +
			' "IDLOGERRORPDV", ' +
			' "IDCAIXAWEB", ' +
			' "IDVENDA", ' +
			' "IDOPERADOR", ' +
			' "IDMOVIMENTOCAIXAWEB", ' +
			' "DTLOGERRORPDV", ' +
			' "DSLOGERRORPDV" ' +
			' ) ' +
			' VALUES(QUALITY_CONC_HML.SEQ_LOGERRORPDV.NEXTVAL,?,?,?,?,?,?) ';

		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {

			var registro = bodyJson[i];

			setIntOrNull(pStmt, 1, registro.IDCAIXAWEB);
			pStmt.setString(2, registro.IDVENDA);
			setIntOrNull(pStmt, 3, registro.IDOPERADOR);
			pStmt.setString(4, registro.IDMOVIMENTOCAIXAWEB);
			setTimestampOrNull(pStmt, 5, registro.DTLOGERRORPDV);
			pStmt.setString(6, registro.DSLOGERRORPDV);

			pStmt.execute();
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
		//Handle your GET calls here
		case $.net.http.PUT:
			var docReturn = fnHandlePut();
			$.response.setBody(JSON.stringify(docReturn));
			break;

			//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			fnHandleGet(id);
			break;

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