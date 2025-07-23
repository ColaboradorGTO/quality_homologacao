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
		'   tbl.IDLOG,' +
		'   tbl.IDFUNCIONARIO,' +
		'   tbl.PATHFUNCAO,' +
		'   tbl.DATALOG,' +
		'   tbl.DADOS, '+
		'   tbl.IP' +
		' FROM ' +
		'   "VAR_DB_NAME".LOG tbl' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbl.IDLOG = \'' + byId + '\' ';
	}
	if (dataPesquisa) {
		query = query + ' AND (tbl.DATALOG BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
	}

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	api.responseWithQuery(query, request, 1);
}

function fnHandlePost() {
	try {
		var conn = $.db.getConnection();

		var query = 'INSERT INTO "VAR_DB_NAME"."LOG" ' +
			" ( " +
			' "IDFUNCIONARIO", ' +
			' "PATHFUNCAO", ' +
			' "DATALOG", ' +
			' "DADOS", '+
			' "IP" ' +
			' ) ' +
			' VALUES(?,?,now(),?,?) ';

		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {

			var registro = bodyJson[i];

			pStmt.setString(1, registro.IDFUNCIONARIO);
			pStmt.setString(2, registro.PATHFUNCAO);
			pStmt.setString(3, registro.DADOS);
			pStmt.setString(4, registro.IP);
			
			
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