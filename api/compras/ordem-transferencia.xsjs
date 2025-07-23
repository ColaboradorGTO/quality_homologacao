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

function obterLinhasDoDetalhe(idResumoOt) {

	var query = ' SELECT '+
    	' "IDDETALHEOT", '+
    	' "IDPRODUTO", '+
    	' "IDRESUMOOT", '+
    	' "QTDEXPEDICAO", '+
    	' "QTDRECEPCAO", '+
    	' "QTDDIFERENCA", '+
    	' "QTDAJUSTE", '+
    	' "VLRUNITVENDA", '+
    	' "VLRUNITCUSTO", '+
    	' "STCONFERIDO", '+
    	' "IDUSRAJUSTE", '+
    	' "STATIVO", '+
    	' "STFALTA", '+
    	' "STSOBRA", '+
    	' "QTDCONFERIDA" '+
		' FROM  ' +
		'   "VAR_DB_NAME".DETALHEORDEMTRANSFERENCIA  ' +
		'  WHERE  ' +
		'   IDRESUMOOT = ?  ' +
		'  ORDER BY IDDETALHEOT  ';

	var linhas = api.sqlQuery(query, idResumoOt);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"IDPRODUTO":det.IDPRODUTO,
            "QTDEXPEDICAO":det.QTDEXPEDICAO,
            "QTDRECEPCAO":det.QTDRECEPCAO,
            "QTDDIFERENCA":det.QTDDIFERENCA,
            "QTDAJUSTE":det.QTDAJUSTE,
            "VLRUNITVENDA": det.VLRUNITVENDA,
            "VLRUNITCUSTO": det.VLRUNITCUSTO,
            "STCONFERIDO": det.STCONFERIDO,
            "IDUSRAJUSTE":det.IDUSRAJUSTE,
            "STATIVO": det.STATIVO,
            "STFALTA": det.STFALTA,
            "STSOBRA": det.STSOBRA
		
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {

    var query = ' SELECT ' +
	' "IDRESUMOOT", ' +
	' "IDEMPRESAORIGEM", ' +
	' "IDEMPRESADESTINO", ' +
	' "DATAEXPEDICAO", ' +
	' "IDOPERADOREXPEDICAO", ' +
	' "NUTOTALITENS", ' +
	' "QTDTOTALITENS", ' +
	' "QTDTOTALITENSRECEPCIONADO", ' +
	' "QTDTOTALITENSDIVERGENCIA", ' +
	' "NUTOTALVOLUMES", ' +
	' "TPVOLUME", ' +
	' "VRTOTALCUSTO", ' +
	' "VRTOTALVENDA", ' +
	' "DTRECEPCAO", ' +
	' "IDOPERADORRECEPTOR", ' +
	' "DSOBSERVACAO", ' +
	' "IDUSRCANCELAMENTO", ' +
	' "DTULTALTERACAO", ' +
	' "IDSTDIVERGENCIA", ' +
	' "OBSDIVERGENCIA", ' +
	' "STEMISSAONFE", ' +
	' "NUMERONFE", ' +
	' "STENTRADAINVENTARIO", ' +
	' "QTDCONFERENCIA", ' +
	' "IDSTATUSOT", ' +
	' "IDUSRAJUSTE", ' +
	' "DTAJUSTE", ' +
	' "QTDTOTALITENSAJUSTE", ' +
	' "NUMERONFESAIDA", ' +
	' "SERIENFESAIDA", ' +
	' "STMIGRADOSAP", ' +
	' "STMIGRADOSAPORIGEM", ' +
	' "STMIGRADOSAPDESTINO", ' +
	' "IDSAP", ' +
	' "IDSAPORIGEM", ' +
	' "IDSAPDESTINO", ' +
	' "ERRORLOGSAP", ' +
	' "IDSTATUSSEFAZ", ' +
	' "CODIGORETORNOSEFAZ", ' +
	' "CHAVESEFAZ", ' +
	' "PROTOCOLOSEFAZ", ' +
	' "MSGSEFAZ", ' +
	' "DATAEMISSAOSEFAZ", ' +
	' "NUMERONOTASEFAZ", ' +
	' "CONFEREITENS", ' +
	' "IDROTINA", ' +
	' "DATAENTREGA", ' +
	' "QTDTOTALCONFERIDA", ' +
	' "DTCONFERIDA", ' +
	' "IDUSRCONFERIDA", ' +
	' "QTDTOTALVOLUMECONFERIDO", ' +
	' "DTVOLUMECONFERIDO", ' +
	' "IDUSRVOLUMECONFERIDO" ' +
	' FROM ' + 
	'   "VAR_DB_NAME".RESUMOORDEMTRANSFERENCIA tbrt' +
	' WHERE ' +
	'	1 = ?';

	if (byId) {
		query = query + ' And  tbrt.IDRESUMOOT = \'' + byId + '\' ';
	}
	


	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var ot = {
			"resumo": {
				"IDRESUMOOT": registro.IDRESUMOOT,
				"IDEMPRESAORIGEM": registro.IDEMPRESAORIGEM,
                "IDEMPRESADESTINO": registro.IDEMPRESADESTINO,
                "DATAEXPEDICAO": registro.DATAEXPEDICAO,
                "IDOPERADOREXPEDICAO": registro.IDOPERADOREXPEDICAO,
                "NUTOTALITENS": registro.NUTOTALITENS,
                "QTDTOTALITENS": registro.QTDTOTALITENS,
                "QTDTOTALITENSRECEPCIONADO": registro.QTDTOTALITENSRECEPCIONADO,
                "QTDTOTALITENSDIVERGENCIA": registro.QTDTOTALITENSDIVERGENCIA,
                "NUTOTALVOLUMES": registro.NUTOTALVOLUMES,
                "TPVOLUME": registro.TPVOLUME,
                "VRTOTALCUSTO": registro.VRTOTALCUSTO,
                "VRTOTALVENDA": registro.VRTOTALVENDA,
                "DTULTALTERACAO": registro.DTULTALTERACAO,
                "STEMISSAONFE":  registro.STEMISSAONFE,
                "STENTRADAINVENTARIO": registro.STENTRADAINVENTARIO,
                "QTDCONFERENCIA": registro.QTDCONFERENCIA,
                "IDSTATUSOT": registro.IDSTATUSOT,
                "QTDTOTALITENSAJUSTE": registro.QTDTOTALITENSAJUSTE,
                "CONFEREITENS": registro.CONFEREITENS,
                "IDROTINA": registro.IDROTINA
			},
			"detalhe": obterLinhasDoDetalhe(registro.IDRESUMOOT)
		};

		data.push(ot);

	}

	response.data = data;

	return response;
}

function fnIncluirDetalhes(conn, lstDet, vIdResumoOt) {
	var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" ' +
		" ( " +
		' "IDDETALHEOT", ' +
		' "IDRESUMOOT", ' +
		' "IDPRODUTO", ' +
        ' "QTDEXPEDICAO", ' +
        ' "QTDRECEPCAO", ' +
        ' "QTDDIFERENCA", ' +
        ' "QTDAJUSTE", ' +
        ' "VLRUNITVENDA", ' +
        ' "VLRUNITCUSTO", ' +
        ' "STCONFERIDO", ' +
        ' "IDUSRAJUSTE", ' +
        ' "STATIVO", ' +
        ' "STFALTA", ' +
        ' "STSOBRA" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
    
	for (var i = 0; i < lstDet.length; i++) {
        var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEOT")),0) + 1 FROM "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" WHERE 1 = ? ', 1);
		var registro = lstDet[i];

		pStmt.setInt(1, Id);
		pStmt.setInt(2, vIdResumoOt);
		pStmt.setString(3, registro.IDPRODUTO);
		pStmt.setInt(4, registro.QTDEXPEDICAO);
		pStmt.setInt(5, registro.QTDRECEPCAO);
		pStmt.setInt(6, registro.QTDDIFERENCA);
		pStmt.setInt(7, registro.QTDAJUSTE);
		pStmt.setFloat(8, registro.VLRUNITVENDA);
		pStmt.setFloat(9, registro.VLRUNITCUSTO);
		pStmt.setString(10, registro.STCONFERIDO);
		pStmt.setInt(11, registro.IDUSRAJUSTE);
		pStmt.setString(12, registro.STATIVO);
		pStmt.setString(13, registro.STFALTA);
		pStmt.setString(14, registro.STSOBRA);
		
		
	
		pStmt.execute();
		conn.commit();
	}

	pStmt.close();


}

function fnHandlePost() {
	var conn = $.db.getConnection();
	
	try {
		var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" ' +
			" ( " +
			' "IDRESUMOOT", ' +
			' "IDEMPRESAORIGEM", ' +
            ' "IDEMPRESADESTINO", ' +
            ' "DATAEXPEDICAO", ' +
            ' "IDOPERADOREXPEDICAO", ' +
            ' "NUTOTALITENS", ' +
            ' "QTDTOTALITENS", ' +
            ' "QTDTOTALITENSRECEPCIONADO", ' +
            ' "QTDTOTALITENSDIVERGENCIA", ' +
            ' "NUTOTALVOLUMES", ' +
            ' "TPVOLUME", ' +
            ' "VRTOTALCUSTO", ' +
            ' "VRTOTALVENDA", ' +
            ' "DTULTALTERACAO", ' +
            ' "STEMISSAONFE", ' +
            ' "STENTRADAINVENTARIO", ' +
            ' "QTDCONFERENCIA", ' +
            ' "IDSTATUSOT", ' +
            ' "QTDTOTALITENSAJUSTE", ' +
            ' "CONFEREITENS", ' +
            ' "IDROTINA", ' +
            ' "STATIVO", ' +
            ' "DATAENTREGA", ' +
            ' "IDDISTRIBUICAO", ' +
            ' "DSOBSERVACAO" ' +
			' ) ' +
			' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());
		
		var responseID = [];

		for (var i = 0; i < bodyJson.length; i++) {
            
            var data = [];
			var registro = bodyJson[i];
			
			var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDRESUMOOT")),0) + 1 FROM "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" WHERE 1 = ? ', 1);
			
			pStmt.setInt(1, Id);
			pStmt.setInt(2, registro.IDEMPRESAORIGEM);
			pStmt.setInt(3, registro.IDEMPRESADESTINO);
			setTimestampOrNull(pStmt, 4, registro.DATAEXPEDICAO);
			pStmt.setInt(5, registro.IDOPERADOREXPEDICAO);
			pStmt.setInt(6, registro.NUTOTALITENS);
			pStmt.setInt(7, registro.QTDTOTALITENS);
			pStmt.setInt(8, registro.QTDTOTALITENSRECEPCIONADO);
			pStmt.setInt(9, registro.QTDTOTALITENSDIVERGENCIA);
			pStmt.setInt(10, registro.NUTOTALVOLUMES);
			pStmt.setString(11, registro.TPVOLUME);
			pStmt.setFloat(12, registro.VRTOTALCUSTO);
			pStmt.setFloat(13, registro.VRTOTALVENDA);
			setTimestampOrNull(pStmt, 14, registro.DTULTALTERACAO);
			pStmt.setString(15, registro.STEMISSAONFE);
			pStmt.setString(16, registro.STENTRADAINVENTARIO);
			pStmt.setInt(17, registro.QTDCONFERENCIA);
			pStmt.setInt(18, registro.IDSTATUSOT);
			pStmt.setInt(19, registro.QTDTOTALITENSAJUSTE);
			pStmt.setString(20,registro.CONFEREITENS);
			pStmt.setInt(21, registro.IDROTINA);
			pStmt.setString(22, registro.STATIVO);
			setTimestampOrNull(pStmt, 23, registro.DATAENTREGA);
			pStmt.setString(24, registro.IDDISTRIBUICAO);
			pStmt.setString(25, registro.DSOBSERVACAO);
			

/*return {
			"msg": registro.detalhe
		};*/


			pStmt.execute();
			fnIncluirDetalhes(conn, registro.detalhe, Id);
			
			var document = {
			    ID: Id,
			    IDDISTRIBUICAO: registro.IDDISTRIBUICAO
			};
			
			responseID.push(document);

		}

		pStmt.close();

		conn.commit();

		return {
			"msg": "Inclusão realizada com sucesso!",
			"data": responseID
		};
	} catch (e) {
	    conn.rollback();
	    throw e;
	}
}


function fnHandlePut(){
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' + 
        ' "STATIVO" = \'False\', ' +
        ' "IDSTATUSOT" = 2 ' +
        ' WHERE "IDRESUMOOT" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDRESUMOOT);
        
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}



$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;

		//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		default:
			break;
			
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