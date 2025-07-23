var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setDateOrNull(stmt, fieldId, value){
	if(!value){
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnIncluirDetalhes(conn, lstDetalhe, idResumoBalanco){

    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEBALANCO" ( ' +
                '   "IDRESUMOBALANCO", "NUMEROCOLETOR", "IDPRODUTO", "CODIGODEBARRAS", "DSPRODUTO", ' +
                '   "TOTALCONTAGEMATUAL", "TOTALCONTAGEMGERAL", "PRECOCUSTO", "PRECOVENDA", "STCANCELADO", ' +
                '   "DSCOLETOR" ' +
                ' ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, \'False\', ?) ';
    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    var queryupd = 'UPDATE "VAR_DB_NAME"."DETALHEBALANCO" SET TOTALCONTAGEMGERAL = TOTALCONTAGEMGERAL + ? ' +
                   'WHERE STCANCELADO = \'False\' AND NUMEROCOLETOR = ? AND IDPRODUTO = ? AND IDRESUMOBALANCO = ? ';
    var pStmtupd = conn.prepareStatement(api.replaceDbName(queryupd));

	for (var i = 0; i < lstDetalhe.length; i++) {
		var registro = lstDetalhe[i];

        if(api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME"."DETALHEBALANCO" WHERE STCANCELADO = \'False\' AND IDRESUMOBALANCO = ? AND NUMEROCOLETOR = \'' + registro.NUMEROCOLETOR + '\' AND IDPRODUTO = \'' + registro.IDPRODUTO + '\' ', idResumoBalanco) > 0){
            pStmtupd.setInt(1, registro.TOTALCONTAGEMGERAL);
            pStmtupd.setInt(2, registro.NUMEROCOLETOR);
            pStmtupd.setString(3, registro.IDPRODUTO);
            pStmtupd.setInt(4, idResumoBalanco);
            pStmtupd.execute();
        } else {
            pStmt.setInt(1, idResumoBalanco);
        	pStmt.setInt(2, registro.NUMEROCOLETOR);
        	pStmt.setString(3, registro.IDPRODUTO);
        	pStmt.setString(4, registro.CODIGODEBARRAS);
        	pStmt.setString(5, registro.DSPRODUTO);
        	pStmt.setInt(6, registro.TOTALCONTAGEMATUAL);
        	pStmt.setInt(7, registro.TOTALCONTAGEMGERAL);
        	pStmt.setFloat(8, registro.PRECOCUSTO);
        	pStmt.setFloat(9, registro.PRECOVENDA);
        	pStmt.setString(10, registro.DSCOLETOR || '');
            pStmt.execute();
        }
	}
	pStmtupd.close();
    pStmt.close();
	conn.commit();
}

function fnHandleGet(byId) {
    
    var Coletor = $.request.parameters.get("coletor");
    var IdFilial = $.request.parameters.get("idfilial");

    var query = ' SELECT ' +
                '   dba.IDDETALHEBALANCOAVULSO ' +
                '   ,dba.IDEMPRESA ' +
                '   ,dba.NUMEROCOLETOR ' +
                '   ,dba.DSCOLETOR ' +
                '   ,dba.IDPRODUTO ' +
                '   ,dba.CODIGODEBARRAS AS NUCODBARRAS ' +
                '   ,dba.DSPRODUTO AS DSNOME ' +
                '   ,IFNULL(SUM(dba.TOTALCONTAGEMGERAL), 0) AS TOTALCONTAGEMGERAL ' +
                '   ,IFNULL(dba.PRECOVENDA, 0) As PRECOVENDA ' +
                '   ,IFNULL(dba.PRECOCUSTO, 0) As PRECOCUSTO ' +
                '   ,dba.STCANCELADO ' +
                '   ,e.NOFANTASIA ' +
                ' FROM "VAR_DB_NAME"."DETALHEBALANCOAVULSO" dba ' +
                ' INNER JOIN "VAR_DB_NAME".EMPRESA e ON e.IDEMPRESA = dba.IDEMPRESA' +
                ' WHERE 1 = ? ';
    if(Coletor) {
        query = query + ' AND dba.NUMEROCOLETOR = \'' + Coletor + '\' ';
    }
    if(IdFilial) {
        query = query + ' AND e.IDEMPRESA = \'' + IdFilial + '\' ';
    }
    query = query + ' AND dba.STCANCELADO = \'False\' ';
    query = query + ' GROUP BY dba.IDDETALHEBALANCOAVULSO, dba.IDEMPRESA, dba.NUMEROCOLETOR, dba.DSCOLETOR, dba.IDPRODUTO, dba.CODIGODEBARRAS, dba.DSPRODUTO, dba.PRECOVENDA, dba.PRECOCUSTO, dba.STCANCELADO, e.NOFANTASIA ';

   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut(){

    var conn = $.db.getConnection();
    var bodyJson = JSON.parse($.request.body.asString());
    
    var pTotalContagemGeral = parseInt(bodyJson.TOTALCONTAGEMGERAL);
    var pIdEmpresa = parseInt(bodyJson.IDEMPRESA);
    var pNumeroColetor = parseInt(bodyJson.NUMEROCOLETOR);
    var pIdProduto = bodyJson.IDPRODUTO;

    if(pTotalContagemGeral === 0){
        var query = 'DELETE FROM "VAR_DB_NAME"."DETALHEBALANCOAVULSO" ' +
                    'WHERE STCANCELADO = \'False\' ' +
                    'AND NUMEROCOLETOR = ? AND IDPRODUTO = ? AND IDEMPRESA = ? ';
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
        
        pStmt.setInt(1, pNumeroColetor);
        pStmt.setString(2, pIdProduto);
        pStmt.setInt(3, pIdEmpresa);
        pStmt.execute();
	    pStmt.close();
	    conn.commit();
    } else {
        var queryupd =  'UPDATE "VAR_DB_NAME"."DETALHEBALANCOAVULSO" SET TOTALCONTAGEMGERAL = ? ' +
                        'WHERE STCANCELADO = \'False\' ' +
                        'AND IDEMPRESA = ? ' +
                        'AND NUMEROCOLETOR = ? ' +
                        'AND IDPRODUTO = ? ';
        var pStmtupd = conn.prepareStatement(api.replaceDbName(queryupd));
    
        pStmtupd.setInt(1, pTotalContagemGeral);
        pStmtupd.setInt(2, pIdEmpresa);
        pStmtupd.setInt(3, pNumeroColetor);
        pStmtupd.setString(4, pIdProduto);
        pStmtupd.execute();
	    pStmtupd.close();
	    conn.commit();
    }
	return {
        msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){

    var conn = $.db.getConnection();
    var bodyJson = JSON.parse($.request.body.asString());

    if(bodyJson[0].INSBALANCO === 1){
        var idResumoBalanco = api.sqlQuery('SELECT IDRESUMOBALANCO FROM "VAR_DB_NAME"."RESUMOBALANCO" WHERE IDEMPRESA = ?  AND STATIVO = \'True\'', bodyJson[0].IDEMPRESA);

        if(idResumoBalanco.length === 0){

            var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDRESUMOBALANCO")), 0) + 1 FROM "VAR_DB_NAME"."RESUMOBALANCO" WHERE 1 = ? ', 1);

            var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOBALANCO" ( ' +
                        '   "IDRESUMOBALANCO", "IDEMPRESA", "DSRESUMOBALANCO", "DTABERTURA", "DTFECHAMENTO", "QTDTOTALITENS", ' +
                        '   "QTDTOTALSOBRA", "QTDTOTALFALTA", "TXTOBSERVACAO", "STATIVO", "STCANCELADO", ' +
                        '   "STCONCLUIDO", "STCONSOLIDADO" ' +
                        ' ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'False\', \'False\', \'False\') ';
            var pStmt = conn.prepareStatement(api.replaceDbName(query));

        	for (var i = 0; i < bodyJson.length; i++) {
        		var registro = bodyJson[i];

        		pStmt.setInt(1, parseInt(queryId));
        		pStmt.setInt(2, registro.IDEMPRESA);
            	pStmt.setString(3, registro.DSRESUMOBALANCO);
            	pStmt.setTimestamp(4, registro.DTABERTURA);
            	setDateOrNull(pStmt,5, registro.DTFECHAMENTO);
            	pStmt.setInt(6, registro.QTDTOTALITENS);
            	pStmt.setInt(7, registro.QTDTOTALSOBRA);
            	pStmt.setInt(8, registro.QTDTOTALFALTA);
            	pStmt.setString(9, registro.TXTOBSERVACAO);
            	pStmt.setString(10, registro.STATIVO);
            	fnIncluirDetalhes(conn, registro.det, parseInt(queryId));
                pStmt.execute();
                pStmt.close();
    	    }
        } else {
            fnIncluirDetalhes(conn, bodyJson[0].det, parseInt(idResumoBalanco[0].IDRESUMOBALANCO));
        }
        var queryupd = 'UPDATE "VAR_DB_NAME"."DETALHEBALANCOAVULSO" SET STCANCELADO = ? ' +
               'WHERE STCANCELADO = \'False\' AND IDEMPRESA = ? AND NUMEROCOLETOR = ? ';
        var pStmtupd = conn.prepareStatement(api.replaceDbName(queryupd));

        pStmtupd.setString(1, 'True');
        pStmtupd.setInt(2, bodyJson[0].IDEMPRESA);
        pStmtupd.setInt(3, bodyJson[0].det[0].NUMEROCOLETOR);
        pStmtupd.execute();
	    pStmtupd.close();
    } else {
        var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEBALANCOAVULSO" ( ' +
                    '   "IDDETALHEBALANCOAVULSO", "IDEMPRESA", "NUMEROCOLETOR", "DSCOLETOR", "IDPRODUTO", ' +
                    '   "CODIGODEBARRAS", "DSPRODUTO", "TOTALCONTAGEMGERAL", "PRECOCUSTO", "PRECOVENDA", ' +
                    '   "STCANCELADO" ' +
                    ' ) VALUES (QUALITY_CONC_HML.SEQ_DETALHEBALANCOAVULSO.NEXTVAL, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'False\') ';
        var pStmt = conn.prepareStatement(api.replaceDbName(query));

    	pStmt.setInt(1, bodyJson[0].IDEMPRESA);
    	pStmt.setInt(2, bodyJson[0].NUMEROCOLETOR);
    	pStmt.setString(3, bodyJson[0].DSCOLETOR || '');
    	pStmt.setString(4, bodyJson[0].IDPRODUTO);
    	pStmt.setString(5, bodyJson[0].CODIGODEBARRAS);
    	pStmt.setString(6, bodyJson[0].DSPRODUTO);
    	pStmt.setInt(7, bodyJson[0].TOTALCONTAGEMGERAL);
    	pStmt.setFloat(8, bodyJson[0].PRECOCUSTO);
    	pStmt.setFloat(9, bodyJson[0].PRECOVENDA);
        pStmt.execute();
    	pStmt.close();
    }
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
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;

        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
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