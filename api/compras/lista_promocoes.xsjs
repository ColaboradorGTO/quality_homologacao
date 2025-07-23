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
    
    var idResPromo = $.request.parameters.get("idResPromo");
    var descResPromo = $.request.parameters.get("descResPromo");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var query = ' SELECT ' + 
    '   tbt.IDRESUMOPROMOCAOMARKETING,' +
    '   tbt.DSPROMOCAOMARKETING,' +
    '   tbt.DTHORAINICIO,' +
    '   tbt.DTHORAFIM,' +
    '   tbt.TPAPLICADOA,' +
    '   tbt.APARTIRDEQTD,' +
    '   tbt.APARTIRDOVLR,' +
    '   tbt.TPFATORPROMO,' +
    '   tbt.FATORPROMOVLR,' +
    '   tbt.FATORPROMOPERC,' +
    '   tbt.TPAPARTIRDE,' +
    '   IFNULL(tbt.VLPRECOPRODUTO,0) AS VLPRECOPRODUTO, ' +
    '   tbt.STEMPRESAPROMO,' +
    '   tbt.STDETPROMOORIGEM,' +
    '   tbt.STDETPROMODESTINO,' +
    '   TO_VARCHAR(tbt.DTHORAINICIO,\'YYYY-MM-DD HH24:MI:SS\') AS DTHORAINICIOFORMAT, ' +
    '   TO_VARCHAR(tbt.DTHORAFIM,\'YYYY-MM-DD HH24:MI:SS\') AS DTHORAFIMFORMAT, ' +
    '   TO_VARCHAR(tbt.DTHORAINICIO,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAINICIOFORMAT2, ' +
    '   TO_VARCHAR(tbt.DTHORAFIM,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFIMFORMAT2 ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".RESUMOPROMOCAOMARKETING tbt' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbt.IDRESUMOPROMOCAOMARKETING = \'' + byId + '\' ';
    }

    if ( idResPromo ) {
        query = query + ' And  tbt.IDRESUMOPROMOCAOMARKETING = \'' + idResPromo + '\' ';
    }

    if ( descResPromo ) {
        query = query + ' And  (tbt.DSPROMOCAOMARKETING LIKE \'%'+descResPromo+'%\' ) ';
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND ((tbt.DTHORAINICIO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
			query = query + ' OR (tbt.DTHORAFIM BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\'))';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOPROMOCAOMARKETING" SET ' + 
        ' "DSPROMOCAOMARKETING" = ?, ' + 
        ' "DTHORAINICIO" = ?, ' + 
        ' "DTHORAFIM" = ?, ' + 
        ' "TPAPLICADOA" = ?, ' + 
        ' "APARTIRDEQTD" = ?, ' + 
        ' "APARTIRDOVLR" = ?, ' + 
        ' "TPFATORPROMO" = ?, ' + 
        ' "FATORPROMOVLR" = ?, ' + 
        ' "FATORPROMOPERC" = ?, ' + 
        ' "VLPRECOPRODUTO" = ? ' + 
    	' WHERE "IDRESUMOPROMOCAOMARKETING" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setString(1, registro.DSPROMOCAOMARKETING);
        setTimestampOrNull(pStmt,2, registro.DTHORAINICIO);
        setTimestampOrNull(pStmt,3, registro.DTHORAFIM);
        pStmt.setInt(4, registro.TPAPLICADOA);
        pStmt.setInt(5, registro.APARTIRDEQTD);
        pStmt.setFloat(6, registro.APARTIRDOVLR);
        pStmt.setInt(7, registro.TPFATORPROMO);
        pStmt.setFloat(8, registro.FATORPROMOVLR);
        pStmt.setFloat(9, registro.FATORPROMOPERC);
        pStmt.setFloat(10, registro.VLPRECOPRODUTO);
        pStmt.setInt(11, registro.IDRESUMOPROMOCAOMARKETING);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDRESUMOPROMOCAOMARKETING")),0) + 1 FROM "VAR_DB_NAME"."RESUMOPROMOCAOMARKETING" WHERE 1 = ? ';
    var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOPROMOCAOMARKETING" ' +
		" ( " +
            ' "IDRESUMOPROMOCAOMARKETING", ' +
            ' "DSPROMOCAOMARKETING", ' +
            ' "DTHORAINICIO", ' +
            ' "DTHORAFIM", ' +
            ' "TPAPLICADOA", ' +
            ' "APARTIRDEQTD", ' +
            ' "APARTIRDOVLR", ' +
            ' "TPFATORPROMO", ' +
            ' "FATORPROMOVLR", ' +
            ' "FATORPROMOPERC", ' +
            ' "TPAPARTIRDE", ' +
            ' "VLPRECOPRODUTO", ' +
            ' "STEMPRESAPROMO", ' +
            ' "STDETPROMOORIGEM", ' +
            ' "STDETPROMODESTINO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
        var IdResPromo = api.executeScalar(queryId,1);

       pStmt.setInt(1, parseInt(IdResPromo));
		pStmt.setString(2, registro.DSPROMOCAOMARKETING);
        setTimestampOrNull(pStmt,3, registro.DTHORAINICIO);
        setTimestampOrNull(pStmt,4, registro.DTHORAFIM);
        pStmt.setInt(5, registro.TPAPLICADOA);
        pStmt.setInt(6, registro.APARTIRDEQTD);
        pStmt.setFloat(7, registro.APARTIRDOVLR);
        pStmt.setInt(8, registro.TPFATORPROMO);
        pStmt.setFloat(9, registro.FATORPROMOVLR);
        pStmt.setFloat(10, registro.FATORPROMOPERC);
        pStmt.setInt(11, registro.TPAPARTIRDE);
        pStmt.setFloat(12, registro.VLPRECOPRODUTO);
		pStmt.setString(13, registro.STEMPRESAPROMO);
		pStmt.setString(14, registro.STDETPROMOORIGEM);
		pStmt.setString(15, registro.STDETPROMODESTINO);
    	
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
    switch ( $.request.method ) {
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
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}