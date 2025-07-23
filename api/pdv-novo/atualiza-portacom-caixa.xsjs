var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
	var dataUltimaAtualizacao = $.request.parameters.get("dataAtualizacao");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
	var query = ' SELECT DISTINCT' +
		'   tbc.IDCAIXAWEB,' +
		'   tbc.IDEMPRESA,' +
		'   tbc.DSCAIXA,' +
		'   tbc.NUULTNFCE,' +
		'   tbc.NUSERIE,' +
		'   tbc.TBEMISSAOFISCAL,' +
		'   tbc.NOIMPRESSORA,' +
		'   tbc.NULINHAIMPRESSORA,' +
		'   tbc.DSPORTACOMUNICACAO,' +
		'   tbc.NUBAUD,' +
		'   tbc.NULINHAENTRECUPOM,' +
		'   tbc.STIMPRIMIRUMITEMPORLINHA,' +
		'   tbc.STDANFCERESUMIDO,' +
		'   tbc.STIGNORARTAGFORMATACAO,' +
		'   tbc.STIMPRIMIRDESCACRESITEM,' +
		'   tbc.STVIACONSUMIDOR,' +
		'   tbc.STTEF,' +
		'   tbc.STBALANCA,' +
		'   tbc.STGAVETEIRO,' +
		'   tbc.STSANGRIA,' +
		'   tbc.VRMAXSANGRIA,' +
		'   tbc.STCONTROLAHORARIO,' +
		'   tbc.HRINICIOLOGIN,' +
		'   tbc.HRFIMLOGIN,' +
		'   tbc.STSTATUS,' +
		'   TO_VARCHAR(tbc.DTULTALTERACAO,\'DD-MM-YYYY HH24:MI:SS\') AS DTULTALTERACAO, ' +
		'   tbc.NUSERIEPROD,' +
		'   tbc.NUNFCEPROD,' +
		'   tbc.NUSERIEHOM,' +
		'   tbc.NUNFCEHOM,' +
		'   tbc.STATIVO,' +
		'   tbc.TIPOTEF,' +
		'   (SELECT MAX(tbcv.VERSAO) FROM QUALITY_CONC_HML.CAIXA_VERSAO tbcv WHERE tbc.IDCAIXAWEB = tbcv.IDCAIXAWEB) AS VERSAO,' +
		'   tbe.IDEMPRESA,' +
		'   tbe.NOFANTASIA,' +
		'   tbe.NUCNPJ' +
		' FROM ' +
		'   "VAR_DB_NAME".CAIXA tbc' +
		'	INNER JOIN "VAR_DB_NAME".EMPRESA tbe  ON tbc.IDEMPRESA = tbe.IDEMPRESA  ' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbc.IDCAIXAWEB = \'' + byId + '\' ';
	}
	
	if (dataUltimaAtualizacao) {
		query = query + ' and tbc.DTULTALTERACAO >= ' + dataUltimaAtualizacao;
	}
	
	if(idEmpresa){
	    query = query + ' and tbc.IDEMPRESA = ' + idEmpresa;
	}

    var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	api.responseWithQuery(query, request, 1);
}

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
		' "DSPORTACOMUNICACAO" = ?, ' +
		' "DTULTALTERACAO" = now() ' +
		' WHERE "IDCAIXAWEB" =  ? ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setString(1, registro.DSPORTACOMUNICACAO);
		pStmt.setInt(2, registro.IDCAIXAWEB);

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

	var query = 'INSERT INTO "VAR_DB_NAME"."CAIXA" ' +
		" ( " +
		' "IDCAIXAWEB", ' +
		' "IDEMPRESA", ' +
		' "DSCAIXA", ' +
		' "NUULTNFCE", ' +
		' "NUSERIE", ' +
		' "TBEMISSAOFISCAL", ' +
		' "NOIMPRESSORA", ' +
		' "NULINHAIMPRESSORA", ' +
		' "DSPORTACOMUNICACAO", ' +
		' "NUBAUD", ' +
		' "NULINHAENTRECUPOM", ' +
		' "STIMPRIMIRUMITEMPORLINHA", ' +
		' "STDANFCERESUMIDO", ' +
		' "STIGNORARTAGFORMATACAO", ' +
		' "STIMPRIMIRDESCACRESITEM", ' +
		' "STVIACONSUMIDOR", ' +
		' "STTEF", ' +
		' "STBALANCA", ' +
		' "STGAVETEIRO", ' +
		' "STSANGRIA", ' +
		' "VRMAXSANGRIA", ' +
		' "STCONTROLAHORARIO", ' +
		' "HRINICIOLOGIN", ' +
		' "HRFIMLOGIN", ' +
		' "STSTATUS", ' +
		' "DTULTALTERACAO", ' +
		' "NUSERIEPROD", ' +
		' "NUNFCEPROD", ' +
		' "NUSERIEHOM", ' +
		' "NUNFCEHOM", ' +
		' "STATIVO", ' +
		' "VSSISTEMA" ' +
		' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_CAIXA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setInt(1, registro.IDEMPRESA);
		pStmt.setString(2, registro.DSCAIXA);
		pStmt.setInt(3, registro.NUULTNFCE);
		pStmt.setInt(4, registro.NUSERIE);
		pStmt.setString(5, registro.TBEMISSAOFISCAL);
		pStmt.setString(6, registro.NOIMPRESSORA);
		pStmt.setInt(7, registro.NULINHAIMPRESSORA);
		pStmt.setString(8, registro.DSPORTACOMUNICACAO);
		pStmt.setString(9, registro.NUBAUD);
		pStmt.setInt(10, registro.NULINHAENTRECUPOM);
		pStmt.setString(11, registro.STIMPRIMIRUMITEMPORLINHA);
		pStmt.setString(12, registro.STDANFCERESUMIDO);
		pStmt.setString(13, registro.STIGNORARTAGFORMATACAO);
		pStmt.setString(14, registro.STIMPRIMIRDESCACRESITEM);
		pStmt.setString(15, registro.STVIACONSUMIDOR);
		pStmt.setString(16, registro.STTEF);
		pStmt.setString(17, registro.STBALANCA);
		pStmt.setString(18, registro.STGAVETEIRO);
		pStmt.setString(19, registro.STSANGRIA);
		pStmt.setFloat(20, registro.VRMAXSANGRIA);
		pStmt.setString(21, registro.STCONTROLAHORARIO);
		pStmt.setTime(22, registro.HRINICIOLOGIN);
		pStmt.setTime(23, registro.HRFIMLOGIN);
		pStmt.setString(24, registro.STSTATUS);
		pStmt.setDate(25, registro.DTULTALTERACAO);
		pStmt.setInt(26, registro.NUSERIEPROD);
		pStmt.setInt(27, registro.NUNFCEPROD);
		pStmt.setInt(28, registro.NUSERIEHOM);
		pStmt.setInt(29, registro.NUNFCEHOM);
		pStmt.setString(30, registro.STATIVO);
		pStmt.setString(31, registro.VSSISTEMA);

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