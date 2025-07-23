var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var conn;

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

    conn = $.db.getConnection();

    var bodyJson = JSON.parse($.request.body.asString());

    for(var i = 0; i < bodyJson.length; i++){

        var registro = bodyJson[i];
        var pIdDistribuicaoPedidos = parseInt(registro.IDDISTRIBUICAOPEDIDOS);
        var pIdDistribuicaoCompras = parseInt(registro.IDDISTRIBUICAOCOMPRAS);
        var pIdResumoOT = parseInt(registro.IDRESUMOOT);
        var pIdFilialDestino = parseInt(registro.IDFILIALDESTINO);
        var pIdUsuarioCancel = parseInt(registro.IDUSUARIOCANCEL);

        if(api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".RESUMOORDEMTRANSFERENCIA WHERE IDSTATUSOT IN (10) AND IDRESUMOOT = ?', pIdResumoOT) > 0){

            var queryDOT = 'UPDATE "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" SET "STATIVO" = ? WHERE "IDRESUMOOT" = ? ';
            var pStmtDOT = conn.prepareStatement(api.replaceDbName(queryDOT));
            pStmtDOT.setString(1, 'False');
            pStmtDOT.setInt(2, pIdResumoOT);
        	pStmtDOT.execute();
            pStmtDOT.close();
            
            var queryOT = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                          '"IDUSRCANCELAMENTO" = ?, "DTULTALTERACAO" = NOW(), "IDSTATUSOT" = ? ' +
        	              'WHERE "IDRESUMOOT" = ? ';
            var pStmtOT = conn.prepareStatement(api.replaceDbName(queryOT));
            pStmtOT.setInt(1, pIdUsuarioCancel);
            pStmtOT.setInt(2, 2);
            pStmtOT.setInt(3, pIdResumoOT);
        	pStmtOT.execute();
            pStmtOT.close();
            
            var queryDP = 'UPDATE "VAR_DB_NAME"."DQ_DISTRIBUICAOPEDIDOS" SET ' +
                          '"STATIVO" = ?, "LOGCANCEL" = ?, "IDUSUARIOCANCEL" = ? ' +
        	              'WHERE "IDDISTRIBUICAOPEDIDOS" = ? ';
            var pStmtDP = conn.prepareStatement(api.replaceDbName(queryDP));
            pStmtDP.setString(1, 'False');
            pStmtDP.setString(2, 'Cancelado com Sucesso');
            pStmtDP.setInt(3, pIdUsuarioCancel);
            pStmtDP.setInt(4, pIdDistribuicaoPedidos);
        	pStmtDP.execute();
            pStmtDP.close();
            conn.commit();
        }
    }
    
 	return {
 	    IdDistribuicaoCompras: pIdDistribuicaoCompras,
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){

    var bodyJson = JSON.parse($.request.body.asString());
    
    conn = $.db.getConnection();

    for (var i = 0; i < bodyJson.length; i++) {
        
        var pIdResumoOT = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDRESUMOOT")),0) + 1 FROM "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" WHERE 1 = ? ', 1);
        
		var registro = bodyJson[i];
        
        var pIdDistribuicaoCompras = parseInt(registro.IDDISTRIBUICAOCOMPRAS);
        var pIdFilialDestino = parseInt(registro.IDFILIALDESTINO);
        var pIdUsuario = parseInt(registro.IDUSUARIO);
        var pConfere = registro.CONFERE;
        
        var query = 'SELECT' +
                    '   dc."IDDISTRIBUICAOCOMPRAS", dc."OBSERVACAO", dc."IDFILIALORIGEM", dc."IDUSUARIO", pn."IDPRODUTO", pn."PRECO", dpi."IDFILIALDESTINO", dpi."QUANTIDADE" ' +
                    'FROM "VAR_DB_NAME"."DQ_DISTRIBUICAOCOMPRAS" dc ' +
                    'INNER JOIN "VAR_DB_NAME"."DQ_NOTASCOMPRAS" nc ON nc."IDDISTRIBUICAOCOMPRAS" = dc."IDDISTRIBUICAOCOMPRAS" ' +
                    'INNER JOIN "VAR_DB_NAME"."DQ_PRODUTOSNOTAS" pn ON pn."IDDISTRIBUICAOCOMPRAS" = dc."IDDISTRIBUICAOCOMPRAS" ' +
                    'INNER JOIN "VAR_DB_NAME"."DQ_DISTRIBUICAOPRODUTOITENS" dpi ON dpi."IDDISTRIBUICAOCOMPRAS" = dc."IDDISTRIBUICAOCOMPRAS" AND dpi."IDPRODUTOSNOTAS" = pn."IDPRODUTOSNOTAS" ' +
                    'WHERE 1 = ? ' +
                    'AND dc."IDDISTRIBUICAOCOMPRAS" = ' + pIdDistribuicaoCompras + ' ' +
                    'AND dpi."IDFILIALDESTINO" = ' + pIdFilialDestino + ' ' +
                    'AND dpi."QUANTIDADE" > 0 ';
        var linhas = api.sqlQuery(query, 1);
        
        var nQtdItens = 0;
        var nQtdTotalItens = 0;
        var nVlrTotalVenda = 0;
        
        if(linhas.length > 0){
        
            for (var j = 0; j < linhas.length; j++) {
    
                var idDetalheOT = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEOT")),0) + 1 FROM "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" WHERE 1 = ? ', 1);
    
                // var conndet = $.db.getConnection();
    
        		var registroDOT = linhas[j];
    
                var queryDOT =  'INSERT INTO "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" ( ' +
                        		' "IDDETALHEOT"   , "IDPRODUTO"    , "IDRESUMOOT"   , "QTDEXPEDICAO" ' +
                                ' ,"QTDRECEPCAO"  , "QTDDIFERENCA" , "QTDAJUSTE"    , "VLRUNITVENDA" ' +
                                ' ,"VLRUNITCUSTO" , "STCONFERIDO"  , "IDUSRAJUSTE"  , "STATIVO" ' +
                                ' ,"STFALTA"      , "STSOBRA" ' +
                        		' ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';
                var pStmtDOT = conn.prepareStatement(api.replaceDbName(queryDOT));//conndet.prepareStatement(api.replaceDbName(queryDOT));
    
        	    pStmtDOT.setInt(1, idDetalheOT);
        	    pStmtDOT.setString(2, registroDOT.IDPRODUTO);
        	    pStmtDOT.setInt(3, pIdResumoOT);
                pStmtDOT.setInt(4, registroDOT.QUANTIDADE);
                pStmtDOT.setInt(5, 0);
                pStmtDOT.setInt(6, 0);
                pStmtDOT.setInt(7, 0);
                pStmtDOT.setFloat(8, parseFloat(registroDOT.PRECO));
                pStmtDOT.setFloat(9, 0);
                pStmtDOT.setString(10, 'False');
                pStmtDOT.setInt(11, 0);
                pStmtDOT.setString(12, 'True');
                pStmtDOT.setString(13, 'False');
                pStmtDOT.setString(14, 'False');
                pStmtDOT.execute();
                pStmtDOT.close();
    
                nQtdItens++;
                nQtdTotalItens = nQtdTotalItens + registroDOT.QUANTIDADE;
                nVlrTotalVenda = nVlrTotalVenda + (registroDOT.QUANTIDADE * registroDOT.PRECO);
                
                conn.commit();//conndet.commit();
        	}
            
            var queryOT =  'INSERT INTO "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" ( ' +
                    		' "IDRESUMOOT"                  , "IDEMPRESAORIGEM"     , "IDEMPRESADESTINO"    , "DATAEXPEDICAO" ' +
                            ' ,"IDOPERADOREXPEDICAO"        , "NUTOTALITENS"        , "QTDTOTALITENS"       , "QTDTOTALITENSRECEPCIONADO" ' +
                            ' ,"QTDTOTALITENSDIVERGENCIA"   , "NUTOTALVOLUMES"      , "TPVOLUME"            , "VRTOTALCUSTO" ' +
                            ' ,"VRTOTALVENDA"               , "DTRECEPCAO"          , "IDOPERADORRECEPTOR"  , "DSOBSERVACAO" ' +
                            ' ,"IDUSRCANCELAMENTO"          , "DTULTALTERACAO"      , "IDSTDIVERGENCIA"     , "OBSDIVERGENCIA" ' +
                            ' ,"STEMISSAONFE"               , "NUMERONFE"           , "STENTRADAINVENTARIO" , "QTDCONFERENCIA" ' +
                            ' ,"IDSTATUSOT"                 , "IDUSRAJUSTE"         , "DTAJUSTE"            , "QTDTOTALITENSAJUSTE" ' +
                            ' ,"CONFEREITENS"               , "IDROTINA"            , "DATAENTREGA" ' +
                    		' ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) ';
            var pStmt = conn.prepareStatement(api.replaceDbName(queryOT));
            
            pStmt.setInt(1, pIdResumoOT);
            pStmt.setInt(2, linhas[0].IDFILIALORIGEM);
            pStmt.setInt(3, pIdFilialDestino);
            pStmt.setInt(4, pIdUsuario);
            pStmt.setInt(5, nQtdItens);
            pStmt.setInt(6, nQtdTotalItens);
            pStmt.setInt(7, 0);
            pStmt.setInt(8, 0);
            pStmt.setInt(9, 0);
            pStmt.setString(10, '');
            pStmt.setFloat(11, 0);
            pStmt.setFloat(12, nVlrTotalVenda);
            setDateOrNull(pStmt, 13, '');
            setIntOrNull(pStmt, 14, 0);
            pStmt.setString(15, linhas[0].OBSERVACAO);
            setIntOrNull(pStmt, 16, 0);
            setIntOrNull(pStmt, 17, 0);
            pStmt.setString(18, '');
            pStmt.setString(19, 'False');
            pStmt.setString(20, '');
            pStmt.setString(21, 'False');
            pStmt.setInt(22, 0);
            pStmt.setInt(23, 10);
            setIntOrNull(pStmt, 24, 0);
            setDateOrNull(pStmt, 25, '');
            pStmt.setInt(26, 0);
            pStmt.setString(27, pConfere);
            pStmt.setInt(28, 3);
            pStmt.execute();
            pStmt.close();
            
            var queryIDP =  'INSERT INTO "VAR_DB_NAME"."DQ_DISTRIBUICAOPEDIDOS" ( ' +
                    		' "IDDISTRIBUICAOPEDIDOS", "IDDISTRIBUICAOCOMPRAS", "DATACRIACAO", "STATIVO", "IDRESUMOOT", "OBSERVACAO", "IDFILIALDESTINO" ' +
                    		' ,"IDFILIALORIGEM", "CONFEREPEDIDO", "LOGCANCEL", "IDUSUARIOCANCEL", "LOGCRIACAO", "IDUSUARIO" ' +
                    		' ) VALUES ("VAR_DB_NAME".SEQ_DQ_DISTRIBUICAOPEDIDOS.NEXTVAL, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';
            var pStmtIDP = conn.prepareStatement(api.replaceDbName(queryIDP));
            
            pStmtIDP.setInt(1, pIdDistribuicaoCompras);
            pStmtIDP.setString(2, 'True');
            pStmtIDP.setInt(3, pIdResumoOT);
            pStmtIDP.setString(4, linhas[0].OBSERVACAO);
            pStmtIDP.setInt(5, pIdFilialDestino);
            pStmtIDP.setInt(6, linhas[0].IDFILIALORIGEM);
            pStmtIDP.setString(7, pConfere);
            pStmtIDP.setString(8, '');
            pStmtIDP.setInt(9, 0);
            pStmtIDP.setString(10, 'Criado com Sucesso');
            pStmtIDP.setInt(11, pIdUsuario);
            pStmtIDP.execute();
            pStmtIDP.close();
            conn.commit();
        }
    }
    
   // conn.commit();
    
    return {
        IdDistribuicaoCompras: pIdDistribuicaoCompras,
        "msg": "Inclusão realizada com sucesso!"
    };
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        /*case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;*/

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
    conn.rollback();
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}