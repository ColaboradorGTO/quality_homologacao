var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
	var dataUltimaAtualizacao = $.request.parameters.get("dataAtualizacao");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
	var query = ' SELECT ' +
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
		'   TO_VARCHAR(tbc.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO, ' +
		'   tbc.NUSERIEPROD,' +
		'   tbc.NUNFCEPROD,' +
		'   tbc.NUSERIEHOM,' +
		'   tbc.NUNFCEHOM,' +
		'   tbc.STATIVO,' +
		'   tbc.VSSISTEMA,' +
		'   (select max(vssistema) from QUALITY_CONC_HML.caixa) AS VSSISTEMAULTVERSAO,' +
		'   tbe.IDEMPRESA,' +
		'   tbe.NOFANTASIA,' +
		'   tbe.NuCNPJ,' +
		'   tbc.STATUALIZA,'+
		'   tbc.STLIMPA'+
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

function fnHandlePut() {

	var conn = $.db.getConnection();

	var query = 'UPDATE "VAR_DB_NAME"."CAIXA" SET ' +
		' "STATUALIZA" = \'False\', ' +
		' "STLIMPA" = \'False\' ' +
		' WHERE "IDCAIXAWEB" =  ? ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setInt(1, registro.IDCAIXAWEB);

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