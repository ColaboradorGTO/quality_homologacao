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

function fnHandlePut(){

    var conn = $.db.getConnection();
    var bodyJson = JSON.parse($.request.body.asString());

    var pIdPedidoCompra = bodyJson[0].IDPEDIDOCOMPRA;
    var pIdUsuario = bodyJson[0].IDUSUARIO;
    var pFinalizar = parseInt(bodyJson[0].FINALIZAR);
    
    var pIdDistribuicaoCompras = bodyJson[0].IDDISTRIBUICAOCOMPRASHISTORICO;
    var pIdEmpresa = bodyJson[0].IDEMPRESA;
    var pIdFilial = bodyJson[0].IDFILIAL;
    var pCodBarras = bodyJson[0].CODBARRAS;
    var pQtdSugestaoAlteracao = bodyJson[0].QTDSUGESTAOALTERACAOHISTORICO;
    var pIdUsuarioAlteracao = bodyJson[0].IDUSUARIOALTERACAO;

    if (pFinalizar === 1) {
        var query = 'UPDATE "VAR_DB_NAME"."DISTRIBUICAOCOMPRAS" SET "DATACRIACAO" = NOW(), "IDUSUARIO" = ?, STCONCLUIDO = ? ' +
        	        'WHERE "IDPEDIDOCOMPRA" = ? ';
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
        pStmt.setInt(1, pIdUsuario);
        pStmt.setString(2, 'True');
        pStmt.setInt(3, pIdPedidoCompra);
    	pStmt.execute();
    	pStmt.close();
    
        var querySP = "{ CALL \"QUALITY_CONC_HML\".\"SP_DISTRIBUICAOCOMPRASHISTORICO\"(?) }";
        var pStmtSP = conn.prepareCall(querySP);
        pStmtSP.setInt(1, parseInt(pIdPedidoCompra));
    	pStmtSP.execute();
    	pStmtSP.close();
    
    	conn.commit();
    
    	return {
    	    msg : "Atualização realizada com sucesso!"
    	};
    } else if (pFinalizar === 2){
        var queryFinalizar = 'UPDATE "VAR_DB_NAME"."DISTRIBUICAOCOMPRASHISTORICO" SET "DATACRIACAO" = NOW(), "IDUSUARIO" = ?, STCONCLUIDO = ? ' +
        	        'WHERE "IDPEDIDOCOMPRA" = ? ';
        var pStmtFinalizar = conn.prepareStatement(api.replaceDbName(queryFinalizar));
        pStmtFinalizar.setInt(1, pIdUsuario);
        pStmtFinalizar.setString(2, 'True');
        pStmtFinalizar.setInt(3, pIdPedidoCompra);
    	pStmtFinalizar.execute();
    	pStmtFinalizar.close();
    	conn.commit();
    	return {
    	    msg : "Atualização realizada com sucesso!"
    	};
    } else {
        if (pIdDistribuicaoCompras > 0) {
            var query = 'UPDATE "VAR_DB_NAME"."DISTRIBUICAOCOMPRASHISTORICO" SET "QTDSUGESTAOALTERACAOHISTORICO" = ?, "DATAALTERACAO" = NOW(), "IDUSUARIOALTERACAO" = ? ' + 
            	        'WHERE "IDDISTRIBUICAOCOMPRASHISTORICO" = ? ';
            var pStmt = conn.prepareStatement(api.replaceDbName(query));

            pStmt.setInt(1, pQtdSugestaoAlteracao);
            pStmt.setInt(2, pIdUsuarioAlteracao);
            pStmt.setInt(3, pIdDistribuicaoCompras);
        	
        	pStmt.execute();
        	pStmt.close();
        	conn.commit();
        	
        	return {
        	    msg : "Atualização realizada com sucesso!"
        	};
        } else {
            var querySel =  'SELECT ' +
                                'IDDISTRIBUICAOCOMPRASHISTORICO, IDPEDIDOCOMPRA, IDEMPRESA, IDFILIAL, IDFORNECEDOR, IDFABRICANTE ' +
                                ',IDSUBGRUPOESTRUTURA, IDCATEGORIAS, IDTIPOTECIDO, IDCOR, IDESTILO, IDTAMANHO ' +
                                ',CODBARRAS, DSPRODUTO, PRECOVENDA, GRADE, QTDGRADE, QTDGRADEHISTORICO ' +
                                ',QTDVENDALOJA, QTDVENDATOTAL, QTDSUGESTAO, QTDSUGESTAOALTERACAO, QTDSUGESTAOALTERACAOHISTORICO, DATACRIACAO ' +
                                ',IDUSUARIO, DATAALTERACAO, IDUSUARIOALTERACAO, STCONCLUIDO, STCANCELADO ' +
                            'FROM "VAR_DB_NAME".DISTRIBUICAOCOMPRASHISTORICO ' +
                            'WHERE STCANCELADO = \'False\' ' +
                            'AND CODBARRAS = ? ';
    	    var listar = api.sqlQuery(querySel, pCodBarras);
    
            var queryIns = 'INSERT INTO "VAR_DB_NAME"."DISTRIBUICAOCOMPRASHISTORICO" ("IDDISTRIBUICAOCOMPRASHISTORICO" ' +
                                ',"IDPEDIDOCOMPRA"       , "IDEMPRESA"                      , "IDFILIAL"        , "IDFORNECEDOR"    , "IDFABRICANTE" ' +
                                ',"IDSUBGRUPOESTRUTURA"  , "IDCATEGORIAS"                   , "IDTIPOTECIDO"    , "IDCOR"           , "IDESTILO" ' +
                                ',"IDTAMANHO"            , "CODBARRAS"                      , "DSPRODUTO"       , "PRECOVENDA"      , "GRADE" ' +
                                ',"QTDGRADE"             , "QTDGRADEHISTORICO"              , "QTDVENDALOJA"    , "QTDVENDATOTAL"   , "QTDSUGESTAO" ' +
                                ',"QTDSUGESTAOALTERACAO" , "QTDSUGESTAOALTERACAOHISTORICO"  , "DATACRIACAO"     , "IDUSUARIO"       , "DATAALTERACAO" ' +
                                ',"IDUSUARIOALTERACAO"   , "STCONCLUIDO"                    , "STCANCELADO") ' +
    	                   'VALUES(QUALITY_CONC_HML.SEQ_DISTRIBUICAOCOMPRAS.NEXTVAL ' +
    	                        ',?, ?, ?, ?, ? ' +
    	                        ',?, ?, ?, ?, ? ' +
    	                        ',?, ?, ?, ?, ? ' +
    	                        ',?, ?, ?, ?, ? ' +
    	                        ',?, ?, ?, ?, NOW() ' +
    	                        ',?, ?, ?) ';
            var pStmtIns = conn.prepareStatement(api.replaceDbName(queryIns));
    
    		pStmtIns.setInt(1, pIdPedidoCompra);
    		pStmtIns.setInt(2, pIdEmpresa);
    		pStmtIns.setInt(3, pIdFilial);
    		pStmtIns.setString(4, listar[0].IDFORNECEDOR);
    		pStmtIns.setInt(5, listar[0].IDFABRICANTE);
    		pStmtIns.setInt(6, listar[0].IDSUBGRUPOESTRUTURA);
    		pStmtIns.setInt(7, listar[0].IDCATEGORIAS);
    		pStmtIns.setInt(8, listar[0].IDTIPOTECIDO);
    		pStmtIns.setInt(9, listar[0].IDCOR);
    		pStmtIns.setInt(10, listar[0].IDESTILO);
    		pStmtIns.setInt(11, listar[0].IDTAMANHO);
    		pStmtIns.setString(12, pCodBarras);
    		pStmtIns.setString(13, listar[0].DSPRODUTO);
    		pStmtIns.setFloat(14, parseFloat(listar[0].PRECOVENDA));
    		pStmtIns.setInt(15, listar[0].GRADE);
    		pStmtIns.setInt(16, parseInt(listar[0].QTDGRADE));
    		pStmtIns.setInt(17, parseInt(listar[0].QTDGRADEHISTORICO));
    		pStmtIns.setInt(18, parseInt(listar[0].QTDVENDALOJA));
    		pStmtIns.setInt(19, parseInt(listar[0].QTDVENDATOTAL));
    		pStmtIns.setInt(20, parseInt(listar[0].QTDSUGESTAO));
    		pStmtIns.setInt(21, parseInt(listar[0].QTDSUGESTAOALTERACAO));
    		pStmtIns.setInt(22, pQtdSugestaoAlteracao);
    		setDateOrNull(pStmtIns, 23, '');
    		pStmtIns.setInt(24, 0);
    		pStmtIns.setInt(25, pIdUsuarioAlteracao);
    		pStmtIns.setString(26, 'False');
    		pStmtIns.setString(27, 'False');
    
            pStmtIns.execute();
        	pStmtIns.close();
        	conn.commit();
            
            return {
        	    "msg": "Inclusão realizada com sucesso!"
        	};
        }
    }
}

function fnHandleGet(byId) {

    var pIdFornecedor = $.request.parameters.get("idfornecedor");
    var pDataInicial = $.request.parameters.get("datainicial");
    var pDataFinal = $.request.parameters.get("datafinal");

    var query = 'SELECT DISTINCT ' +
                    'dch.IDPEDIDOCOMPRA, dch.IDEMPRESA ' +
                    ',(SELECT IFNULL(NOFANTASIA, \'\') FROM "VAR_DB_NAME".EMPRESA WHERE IDEMPRESA = dch.IDEMPRESA) AS EMPRESA ' +
                ' FROM "VAR_DB_NAME".DISTRIBUICAOCOMPRASHISTORICO dch ' +
                ' WHERE 1 = ? ';
            if(byId){
                query = query + ' AND dch.IDPEDIDOCOMPRA = \'' + byId + '\' ';
            }
            if(pIdFornecedor){
                query = query + ' AND dch.IDFORNECEDOR = \'' + pIdFornecedor + '\' ';
            }
            if(pDataInicial){
                query = query + ' AND dch.DATACRIACAO >= \'' + pDataInicial + ' 00:00:00\' ';
            }
            if(pDataFinal){
                query = query + ' AND dch.DATACRIACAO <= \'' + pDataFinal + ' 23:59:59\' ';
            }
    /*$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(query));
	$.response.status = $.net.http.OK;
    return;*/
    var request = { 
            page:  $.request.parameters.get("page"),
            pageSize:  $.request.parameters.get("pageSize")
        };

    api.responseWithQuery(query, request, 1);
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
        /*case $.net.http.POST:
            var doc = fnHandlePost();
            $.response.setBody(JSON.stringify(doc));
        break;*/

        default:
            break;
    }
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}