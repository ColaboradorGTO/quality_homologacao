var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setDateOrNull(stmt, fieldId, value){
	if(!value){
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId){

    var idEmpresa = $.request.parameters.get("idEmpresa");

    var query = ' SELECT ' + 
                '   tbrb.IDRESUMOBALANCO, ' +
            	'   tbrb.IDEMPRESA, ' +
            	'   tbrb.DSRESUMOBALANCO, ' +
            	'   tbrb.DTABERTURA, ' +
            	'   tbrb.DTFECHAMENTO, ' +
            	'   tbrb.QTDTOTALITENS, ' +
            	'   tbrb.QTDTOTALSOBRA, ' +
            	'   tbrb.QTDTOTALFALTA, ' +
            	'   tbrb.TXTOBSERVACAO, ' +
            	'   tbrb.STATIVO, ' +
            	'   tbe.BRANCHID, ' +
            	'   tbe.WAREHOUSECODE ' +
                ' FROM "VAR_DB_NAME".RESUMOBALANCO tbrb ' +
                ' INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbrb.IDEMPRESA ' +
                ' WHERE 1 = ? AND tbrb.STATIVO = \'True\' ';
    if(byId){
        query = query + ' AND tbrb.IDRESUMOBALANCO = \'' + byId + '\' ';
    }

    if(idEmpresa){
        query = query + ' AND tbrb.IDEMPRESA = \'' + idEmpresa + '\' ';
    }

    var request = { 
        page: $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnIncluirDetalhes(conn, lstDetalhe, idResumoBalanco){
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEBALANCO" ( ' +
                '   "IDRESUMOBALANCO", "NUMEROCOLETOR", "IDPRODUTO", "CODIGODEBARRAS", "DSPRODUTO", ' +
                '   "TOTALCONTAGEMATUAL", "TOTALCONTAGEMGERAL", "PRECOCUSTO", "PRECOVENDA", "STCANCELADO", ' +
                '   "DSCOLETOR" ' +
                ' ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, \'False\', ?) ';

    var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstDetalhe.length; i++) {

		var registro = lstDetalhe[i];

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
	pStmt.close();
	conn.commit();
}

function fnHandlePost(){

    var conn = $.db.getConnection();
    var bodyJson = JSON.parse($.request.body.asString());
    
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