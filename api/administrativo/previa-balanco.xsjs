var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnExcluirPreviaBalanco(conn, idResumoBalanco) {
	
	var query = 'DELETE FROM "VAR_DB_NAME".PREVIABALANCO WHERE IDRESUMOBALANCO = ?';
	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	pStmt.setInt(1, idResumoBalanco);
	pStmt.execute();
	pStmt.close();
	conn.commit();
}

function fnUpdatePreviaBalanco(pIdEmpresa) {

    var connUpd = $.db.getConnection();
    var qryUpdInv1 = 'UPDATE "VAR_DB_NAME".INVENTARIOMOVIMENTO SET ' +
        ' STPROCESSADO = \'False\' ' +
    	'WHERE IDEMPRESA =  ? ' +
    	'AND STATIVO = \'True\' ' +
    	'AND STPROCESSADO = \'True\' ';
    var updateStmt1 = connUpd.prepareStatement(api.replaceDbName(qryUpdInv1));
    updateStmt1.setInt(1, pIdEmpresa);
    updateStmt1.execute();
    updateStmt1.close();
    connUpd.commit();
}

function fnContagemSemInventario(pIdResumoBalanco, pIdEmpresa){
    
    var conn = $.db.getConnection();

	var query = ' SELECT ' +
        '   DISTINCT(db.IDPRODUTO) AS IDPRODUTO, ' +
        '   IFNULL(SUM(db.TOTALCONTAGEMGERAL), 0) as QTDCONTA, ' +
    	'   IFNULL(IFNULL(pr.PRECO_VENDA, p.PRECOVENDA), 0) AS PRECO_VENDA ' +
    	'FROM "VAR_DB_NAME".RESUMOBALANCO rb ' +
    	'INNER JOIN "VAR_DB_NAME".DETALHEBALANCO db ON db.IDRESUMOBALANCO = rb.IDRESUMOBALANCO ' +
    	'LEFT JOIN "VAR_DB_NAME".PRODUTO p ON p.IDPRODUTO = db.IDPRODUTO ' +
    	'LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO pr ON pr.IDPRODUTO = db.IDPRODUTO AND pr.IDEMPRESA = \'' + pIdEmpresa + '\' ' +
		'WHERE rb.IdResumoBalanco = ? ' +
		'AND db.STCANCELADO = \'False\' ' +
		'AND db.IDPRODUTO NOT IN (SELECT IDPRODUTO FROM "VAR_DB_NAME".PREVIABALANCO WHERE IDRESUMOBALANCO = \'' + pIdResumoBalanco + '\' AND IDEMPRESA = \'' + pIdEmpresa + '\' ) ' +
		'GROUP BY db.IDPRODUTO, pr.PRECO_VENDA, p.PRECOVENDA';
	var listar = api.sqlQuery(query, pIdResumoBalanco);

    var qryInsPrevia = 'INSERT INTO "VAR_DB_NAME".PREVIABALANCO ( ' +
		' IDPREVIABALANCO, IDPRODUTO, IDRESUMOBALANCO, IDEMPRESA, QTD, QTDFINAL, QTDFALTA, QTDSOBRA, PRECOVENDA, TOTALVENDA) ' +
		' VALUES("VAR_DB_NAME"TY_CONC.SEQ_PREVIABALANCO.NEXTVAL,?,?,?,?,?,?,?,?,?) ';
	var pStmt = conn.prepareStatement(api.replaceDbName(qryInsPrevia));

    try{    
    	for (var i = 0; i < listar.length; i++) {
    	    var nIdProduto	    = listar[i].IDPRODUTO;
            var nQtdConta		= listar[i].QTDCONTA;
            var nQtdSobra		= 0;
            var dVlrUnitVenda	= listar[i].PRECO_VENDA;
            var dVlrTotalVenda  = 0;

            nQtdSobra = nQtdConta;
            dVlrTotalVenda = dVlrUnitVenda * nQtdSobra;

            pStmt.setString(1, nIdProduto);
            pStmt.setInt(2, parseInt(pIdResumoBalanco));
            pStmt.setInt(3, parseInt(pIdEmpresa));
            pStmt.setInt(4, parseInt(nQtdConta));
            pStmt.setInt(5, 0);
            pStmt.setInt(6, 0);
            pStmt.setInt(7, parseInt(nQtdSobra));
            pStmt.setFloat(8, parseFloat(dVlrUnitVenda));
            pStmt.setFloat(9, parseFloat(dVlrTotalVenda));
            
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

function fnHandlePost(){

    var conn = $.db.getConnection();

    var bodyJson = JSON.parse($.request.body.asString());
    var pIdResumoBalanco = bodyJson[0].IDRESUMOBALANCO;
    var pIdEmpresa = bodyJson[0].IDEMPRESA;
    var pnCorte = bodyJson[0].NCORTE;
    var pInicio = bodyJson[0].INICIO;
    var pFim = bodyJson[0].FIM;

	var query = ' SELECT ' +
        '   im.IDPRODUTO, ' +
        '   IFNULL(im.QTDFINAL, 0) AS QTDFINAL, ' +
    	'   IFNULL(pr.PRECO_VENDA, p.PRECOVENDA) AS PRECO_VENDA ' +
    	'FROM "VAR_DB_NAME".INVENTARIOMOVIMENTO im ' +
    	'INNER JOIN "VAR_DB_NAME".PRODUTO p ON p.IDPRODUTO = im.IDPRODUTO ' +
    	'LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO pr ON pr.IDPRODUTO = p.IDPRODUTO AND pr.IDEMPRESA = im.IDEMPRESA ' +
		'WHERE im.IDEMPRESA = ? ' +
		'AND im.STATIVO = \'True\' ' +
		'AND (im.STPROCESSADO = \'False\' OR im.STPROCESSADO IS NULL OR im.STPROCESSADO = \'\' ) ' +
		'LIMIT ' + pnCorte;
    var listar = api.sqlQuery(query, pIdEmpresa);

    var qryInsPrevia = 'INSERT INTO "VAR_DB_NAME".PREVIABALANCO ( ' +
		' IDPREVIABALANCO, IDPRODUTO, IdResumoBalanco, IDEMPRESA, QTD, QTDFINAL, QTDFALTA, QTDSOBRA, PRECOVENDA, TOTALVENDA) ' +
		' VALUES("VAR_DB_NAME".SEQ_PREVIABALANCO.NEXTVAL,?,?,?,?,?,?,?,?,?) ';
	var pStmt = conn.prepareStatement(api.replaceDbName(qryInsPrevia));

    // Verifica se existe SessãoBalanço Ativa e Não Concluída
    if (api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".RESUMOBALANCO WHERE STATIVO = \'True\' AND STCONSOLIDADO = \'False\' AND STCONCLUIDO = \'False\' AND IDRESUMOBALANCO = ?', pIdResumoBalanco) > 0) {
        // A rotina prevê deleção da PREVIABALANCO toda vez que for executa até ser Concluída a SESSAOBALANCO
        if (api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".PREVIABALANCO WHERE IDRESUMOBALANCO = ?', pIdResumoBalanco) > 0 && pInicio === 1) {
            fnExcluirPreviaBalanco(conn, pIdResumoBalanco);
        }

        try{    
        	for (var i = 0; i < listar.length; i++) {
        	    var nIdProduto	    = listar[i].IDPRODUTO;
                var nQtdFinal		= listar[i].QTDFINAL;
                var nQtdFalta		= 0;
                var nQtdSobra		= 0;
                var dVlrUnitVenda	= listar[i].PRECO_VENDA;
                var dVlrTotalVenda  = 0;

                var qryUpdInv = 'UPDATE "VAR_DB_NAME".INVENTARIOMOVIMENTO SET ' +
                    ' STPROCESSADO = \'True\' ' +
                	'WHERE IDEMPRESA =  ? ' +
                	'AND IDPRODUTO = \'' + nIdProduto + '\' ' +
                	'AND STATIVO = \'True\' ';
                var updateStmt = conn.prepareStatement(api.replaceDbName(qryUpdInv));
                updateStmt.setInt(1, pIdEmpresa);
                updateStmt.execute();
                updateStmt.close();

        	    // Retorna a Quantidade Total do Produto contado
        	    var qrySumQtd = 'SELECT IFNULL(SUM(TOTALCONTAGEMGERAL), 0) FROM "VAR_DB_NAME".DETALHEBALANCO WHERE IDRESUMOBALANCO IN ' +
        	        '(SELECT IDRESUMOBALANCO FROM "VAR_DB_NAME".RESUMOBALANCO WHERE IdResumoBalanco = ? AND IDEMPRESA = \'' + pIdEmpresa + '\' ' +
        	        'AND STATIVO = \'True\') AND STCANCELADO = \'False\' AND IDPRODUTO = \'' + nIdProduto + '\'';
                var nQtdConta = api.executeScalar(qrySumQtd, pIdResumoBalanco);

                /* Regra Inventário Positivo */
    			if (nQtdFinal >= 0){
    				/* Falta: Inventário maior que a Contagem */
    				if (nQtdFinal > nQtdConta){
    			        nQtdFalta = nQtdFinal - nQtdConta;
    				}
    				/* Falta: Produto não identificado na Contagem e positivo no Inventário */
    				if (nQtdConta === 0){
    					nQtdConta = 0;
    					nQtdFalta = nQtdFinal;
    				}
    				/* Sobra: Inventário menor que a Contagem */
    				if (nQtdFinal < nQtdConta){
    					nQtdSobra = nQtdConta - nQtdFinal;
    				}
    			}
    
    			/* Regra Inventário Negativo */
    			if (nQtdFinal < 0){
    				/* Sobra: Produto não identificado na Contagem e negativo no Inventário */
    				if (nQtdConta === 0){
    					nQtdConta = 0;
    					nQtdSobra = nQtdFinal;
    				}
    				/* Sobra: Inventário menor que a Contagem */
    				if (nQtdFinal < nQtdConta){
    					nQtdSobra = nQtdConta + (-(nQtdFinal));
    				}
    			}
    
    			if (nQtdSobra > 0){
    				dVlrTotalVenda = dVlrUnitVenda * nQtdSobra;
    			}
    			
    			if (nQtdFalta > 0){
    				dVlrTotalVenda = dVlrUnitVenda * nQtdFalta;
    			}
    
                pStmt.setString(1, nIdProduto);
                pStmt.setInt(2, parseInt(pIdResumoBalanco));
                pStmt.setInt(3, parseInt(pIdEmpresa));
                pStmt.setInt(4, parseInt(nQtdConta));
                pStmt.setInt(5, parseInt(nQtdFinal));
                pStmt.setInt(6, parseInt(nQtdFalta));
                pStmt.setInt(7, parseInt(nQtdSobra));
                pStmt.setFloat(8, parseFloat(dVlrUnitVenda));
                pStmt.setFloat(9, parseFloat(dVlrTotalVenda));

                pStmt.execute();
        	}
        	
            pStmt.close();
    	    conn.commit();

            if(pFim === 1){
                fnContagemSemInventario(pIdResumoBalanco, pIdEmpresa);
                fnUpdatePreviaBalanco(pIdEmpresa);
            }

    	    return {
	    	    "msg": " Inclusão realizada com sucesso!"
	        };
        } catch (e) {
            conn.rollback();
            throw e;
        }
    } else {
        return {
	    	    "msg": "Prévia Balanço já finalizada!"
	        };
    }
}

function fnHandleGet(byId) {

    var query = 'SELECT ' +
        ' pb.IDPREVIABALANCO, pb.IDPRODUTO, pb.IDRESUMOBALANCO, pb.IDEMPRESA, pb.QTD, pb.QTDFINAL, pb.QTDFALTA, pb.QTDSOBRA, pb.PRECOVENDA, pb.TOTALVENDA ' +
        ' ,IFNULL(p.NUCODBARRAS, (SELECT IFNULL("CodeBars", \'\') FROM "SBO_GTO_TESTE4"."OITM" WHERE "ItemCode" = pb.IDPRODUTO)) AS NUCODBARRAS ' +
        ' ,IFNULL(p.DSNOME, (SELECT IFNULL("ItemName", \'\') FROM "SBO_GTO_PRD"."OITM" WHERE "ItemCode" = pb.IDPRODUTO)) AS DSNOME ' + 
        'FROM "VAR_DB_NAME".PREVIABALANCO pb ' +
        'LEFT JOIN "VAR_DB_NAME".PRODUTO p ON p.IDPRODUTO = pb.IDPRODUTO ' +
        'WHERE 1 = ?';
    
    if ( byId ) {
        query = query + ' AND pb.IDRESUMOBALANCO = \'' + byId + '\' ';
    }

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
		//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		
		//Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
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