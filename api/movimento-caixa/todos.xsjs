var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function fnHandleGet(byId) {
	var idEmpresa = $.request.parameters.get("idEmpresa");
	var idCaixa = $.request.parameters.get("idCaixa");
	var dataPesquisa = $.request.parameters.get("dataPesquisa");

	var query = ' SELECT ' +
		'   tbmc.ID,' +
		'   tbmc.DTFECHAMENTO,' +
		'   tbmc.DTABERTURA,' +
		'   tbmc.IDEMPRESA,' +
		'   tbmc.IDCAIXA,' +
		'   tbmc.IDOPERADOR,' +
		'   tbmc.IDSUPERVISOR,' +
		'   tbmc.VRFISICODINHEIRO,' +
		'   tbmc.VRRECDINHEIRO,' +
		'   tbmc.VRQUEBRACAIXA,' +
		'   tbmc.VRRECTEF,' +
		'   tbmc.VRRECPOS,' +
		'   tbmc.VRRECCONVENIO,' +
		'   tbmc.VRRECVOUCHER,' +
		'   tbmc.VRRECFATURA,' +
		'   tbmc.VRRECPIX,' +
		'   tbmc.VRRECPL,' +
		'   tbmc.VRSANGRIA,' +
		'   tbmc.TXT_OBS,' +
		'   tbmc.STCANCELADO,' +
		'   tbmc.STFECHADO,' +
		'   tbmc.TXT_CANCELADO,' +
		'   tbmc.STCONFERIDO' +
		' FROM ' +
		'   "VAR_DB_NAME".MOVIMENTOCAIXA tbmc' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbmc.ID = \'' + byId + '\' ';
	}
	if (idEmpresa) {
		query = query + ' AND tbmc.IDEMPRESA = \'' + idEmpresa + '\' ';

	}
	if (dataPesquisa) {
		query = query + ' AND ( tbmc.DTFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa +' 23:00:00\' ) ';
	}
	if (idCaixa) {
		query = query + ' AND tbmc.IDCAIXA = \'' + idCaixa + '\' ';

	}

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
	var conn = $.db.getConnection();
	var query = 'UPDATE "VAR_DB_NAME"."MOVIMENTOCAIXA" SET ' +
		' "DTFECHAMENTO" = ?, ' +
		//' "DTABERTURA" = ?, ' +
		' "IDEMPRESA" = ?, ' +
		' "IDCAIXA" = ?, ' +
		' "IDOPERADOR" = ?, ' +
		' "IDSUPERVISOR" = ?, ' +
		' "VRFISICODINHEIRO" = ?, ' +
		' "VRRECDINHEIRO" = ?, ' +
		' "VRQUEBRACAIXA" = ?, ' +
		' "VRRECTEF" = ?, ' +
		' "VRRECPOS" = ?, ' +
		' "VRRECCONVENIO" = ?, ' +
		' "VRRECVOUCHER" = ?, ' +
		' "VRRECFATURA" = ?, ' +
		' "VRRECPIX" = ?, ' +
		' "VRRECPL" = ?, ' +
		' "VRSANGRIA" = ?, ' +
		' "TXT_OBS" = ?, ' +
		' "STCANCELADO" = ?, ' +
		' "STFECHADO" = ?, ' +
		' "TXT_CANCELADO" = ?, ' +
		' "STCONFERIDO" = ?' +
		' WHERE "ID" =  ? ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    var conferido = 0;
	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        if(registro.STCONFERIDO === true){
          conferido = 1;  
        } 
		setTimestampOrNull(pStmt, 1, registro.DTFECHAMENTO);
		//setDateOrNull(pStmt,2, registro.DTABERTURA);
		pStmt.setInt(2, registro.IDEMPRESA);
		pStmt.setInt(3, registro.IDCAIXA);
		pStmt.setInt(4, registro.IDOPERADOR);
		pStmt.setInt(5, registro.IDSUPERVISOR);
		pStmt.setFloat(6, registro.VRFISICODINHEIRO);
		pStmt.setFloat(7, registro.VRRECDINHEIRO);
		pStmt.setFloat(8, registro.VRQUEBRACAIXA);
		pStmt.setFloat(9, registro.VRRECTEF);
		pStmt.setFloat(10, registro.VRRECPOS);
		pStmt.setFloat(11, registro.VRRECCONVENIO);
		pStmt.setFloat(12, registro.VRRECVOUCHER);
		pStmt.setFloat(13, registro.VRRECFATURA);
		pStmt.setFloat(14, registro.VRRECPIX);
		pStmt.setFloat(15, registro.VRRECPL);
		pStmt.setFloat(16, registro.VRSANGRIA);
		pStmt.setString(17, registro.TXT_OBS);
		pStmt.setString(18, registro.STCANCELADO);
		pStmt.setString(19, registro.STFECHADO);
		pStmt.setString(20, registro.TXT_CANCELADO);
		pStmt.setInt(21, conferido);
		pStmt.setString(22, registro.ID);

		pStmt.execute();
	}
	pStmt.close();

	conn.commit();

	return {
		msg: "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
	var conn = $.db.getConnection();
	

	var query = 'INSERT INTO "VAR_DB_NAME"."MOVIMENTOCAIXA" ' +
		" ( " +
		' "ID", ' +
		' "DTFECHAMENTO", ' +
		' "DTABERTURA", ' +
		' "IDEMPRESA", ' +
		' "IDCAIXA", ' +
		' "IDOPERADOR", ' +
		' "IDSUPERVISOR", ' +
		' "VRFISICODINHEIRO", ' +
		' "VRRECDINHEIRO", ' +
		' "VRQUEBRACAIXA", ' +
		' "VRRECTEF", ' +
		' "VRRECPOS", ' +
		' "VRRECCONVENIO", ' +
		' "VRRECVOUCHER", ' +
		' "VRRECFATURA", ' +
		' "VRRECPIX", ' +
		' "VRRECPL", ' +
		' "VRSANGRIA", ' +
		' "TXT_OBS", ' +
		' "STCANCELADO", ' +
		' "STFECHADO", ' +
		' "TXT_CANCELADO", ' +
		' "STCONFERIDO" '+
		' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    var conferido = 0;
	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		if(registro.STCONFERIDO === true){
          conferido = 1;  
        } 
		
		pStmt.setString(1, registro.ID);
		setTimestampOrNull(pStmt, 2, registro.DTFECHAMENTO);
		pStmt.setTimestamp(3, registro.DTABERTURA);
		pStmt.setInt(4, registro.IDEMPRESA);
		pStmt.setInt(5, registro.IDCAIXA);
		pStmt.setInt(6, registro.IDOPERADOR);
		pStmt.setInt(7, registro.IDSUPERVISOR);
		pStmt.setFloat(8, registro.VRFISICODINHEIRO);
		pStmt.setFloat(9, registro.VRRECDINHEIRO);
		pStmt.setFloat(10, registro.VRQUEBRACAIXA);
		pStmt.setFloat(11, registro.VRRECTEF);
		pStmt.setFloat(12, registro.VRRECPOS);
		pStmt.setFloat(13, registro.VRRECCONVENIO);
		pStmt.setFloat(14, registro.VRRECVOUCHER);
		pStmt.setFloat(15, registro.VRRECFATURA);
		pStmt.setFloat(16, registro.VRRECPIX);
		pStmt.setFloat(17, registro.VRRECPL);
		pStmt.setFloat(18, registro.VRSANGRIA);
		pStmt.setString(19, registro.TXT_OBS);
		pStmt.setString(20, registro.STCANCELADO);
		pStmt.setString(21, registro.STFECHADO);
		pStmt.setString(22, registro.TXT_CANCELADO);
        pStmt.setInt(23, conferido);
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