var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function fnHandlePost() {
	
	var conn = $.db.getConnection();
	var conn2 = $.db.getConnection();
	var queryId = 'SELECT "VAR_DB_NAME".SEQ_RESUMOVOUCHER.NEXTVAL FROM DUMMY WHERE 1 = ?';
	
	try {
		var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOVOUCHER" ' +
			" ( " +
			' "IDVOUCHER", ' +
			' "IDEMPRESAORIGEM", ' +
			' "IDCAIXAORIGEM", ' +
			' "IDNFEDEVOLUCAO", ' +
			' "DTINVOUCHER", ' +
			' "IDUSRINVOUCHER", ' +
			' "IDVENDEDOR", ' +
			' "IDCLIENTE", ' +
			' "VRVOUCHER", ' +
			' "IDEMPRESADESTINO", ' +
			' "IDCAIXADESTINO", ' +
			' "IDNFESAIDA", ' +
			' "DTOUTVOUCHER", ' +
			' "NUVOUCHER", ' +
			' "IDUSROUTVOUCHER", ' +
			' "STATIVO", ' +
			' "STCANCELADO", ' +
			' "DSMOTIVOCANCELAMENTO", ' +
			' "IDUSRCANCELAMENTO", ' +
			' "IDRESUMOVENDAWEB", ' +
			' "IDUSRLIBERACAOCRIACAO"' +
			' ) ' +
			' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {

			var registro = bodyJson[i];
			var idVoucher = api.executeScalar(queryId, 1);

			pStmt.setInt(1, idVoucher);
			pStmt.setInt(2, registro.IDEMPRESAORIGEM);
			pStmt.setInt(3, registro.IDCAIXAORIGEM);
			pStmt.setInt(4, registro.IDNFEDEVOLUCAO);
			pStmt.setTimestamp(5, registro.DTINVOUCHER);
			pStmt.setInt(6, registro.IDUSRINVOUCHER);
			pStmt.setInt(7, registro.IDVENDEDOR);
			pStmt.setInt(8, registro.IDCLIENTE);
			pStmt.setFloat(9, registro.VRVOUCHER);
			setIntOrNull(pStmt, 10, registro.IDEMPRESADESTINO);
			setIntOrNull(pStmt, 11, registro.IDCAIXADESTINO);
			setIntOrNull(pStmt, 12, registro.IDNFESAIDA);
			setTimestampOrNull(pStmt, 13, registro.DTOUTVOUCHER);
			pStmt.setString(14, registro.NUVOUCHER);
			setIntOrNull(pStmt, 15, registro.IDUSROUTVOUCHER);
			pStmt.setString(16, registro.STATIVO);
			pStmt.setString(17, registro.STCANCELADO);
			pStmt.setString(18, registro.DSMOTIVOCANCELAMENTO);
			setIntOrNull(pStmt, 19, registro.IDUSRCANCELAMENTO);
			pStmt.setString(20, registro.IDRESUMOVENDAWEB);
			setIntOrNull(pStmt, 21, registro.IDUSRLIBERACAOCRIACAO);
			pStmt.execute();
			
			//Inicio Incluir Detalhes
        		var query2 = 'INSERT INTO "VAR_DB_NAME"."DETALHEVOUCHER" ' +
        		" ( " +
        		' "IDDETALHEVOUCHER", ' +
        		' "IDVOUCHER", ' +
        		' "IDPRODUTO", ' +
        		' "QTD", ' +
        		' "VRUNIT", ' +
        		' "VRTOTALBRUTO", ' +
        		' "VRDESCONTO", ' +
        		' "VRTOTALLIQUIDO", ' +
        		' "STATIVO", ' +
        		' "STCANCELADO" ' +
        		' ) ' +
        		' VALUES("VAR_DB_NAME".SEQ_DETALHEVOUCHER.NEXTVAL,?,?,?,?,?,?,?,?,?) ';
    
            	var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
            	var lstDet = registro.det;

            	for (var j = 0; j < lstDet.length; j++) {
            
            		var registroDet = lstDet[j];
            		var queryAtualizaStatusTroca = 'UPDATE "VAR_DB_NAME"."VENDADETALHE" SET ' + 
                    		' "STTROCA" = \'True\'' +
                            ' WHERE "IDVENDADETALHE" =  ? AND CPROD=\''+registroDet.IDPRODUTO+'\' ';
                    var pStmtAtualizaStatusTroca = conn.prepareStatement(api.replaceDbName(queryAtualizaStatusTroca));
                    pStmtAtualizaStatusTroca.setString(1, registroDet.IDVENDADETALHE);
                    pStmtAtualizaStatusTroca.execute();
                    pStmtAtualizaStatusTroca.close();
                            
            
            		pStmt2.setInt(1, idVoucher);
            		pStmt2.setString(2, registroDet.IDPRODUTO);
            		pStmt2.setInt(3, registroDet.QTD);
            		pStmt2.setFloat(4, registroDet.VRUNIT);
            		pStmt2.setFloat(5, registroDet.VRTOTALBRUTO);
            		pStmt2.setFloat(6, registroDet.VRDESCONTO);
            		pStmt2.setFloat(7, registroDet.VRTOTALLIQUIDO);
            		pStmt2.setString(8, registroDet.STATIVO);
            		pStmt2.setString(9, registroDet.STCANCELADO);
            
            		pStmt2.execute();
            	}
            
            	
			//Final Incluir Detalhes
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		    //Inicio Incluir Inventario Movimento
    		    var qtdInicio = 0;
            	var qtdEntrada = 0;
            	var qtdSaida = 0;
            	var qtdSaidaTransferencia = 0;
            	var qtdRetornoAjustePedido = 0;
            	var qtdFinal = 0;
            	var qtdAjusteBalanco = 0;
            	var qtdEntradaVoucher = 0;
            	
            	var date = new Date();
            	var dd = ("0" + date.getDate()).slice(-2);
                var mm = ("0" + (date.getMonth() + 1)).slice(-2);
                var y = date.getFullYear();
             
                var dataVoucher = y + '-' + mm + '-' + dd;
                var lstProd  = registro.det;
                
                for (var k = 0; k < lstProd.length; k++) {
                    var registroMov = lstProd[k];
                    
                    var queryExistsMov = ' SELECT IDINVMOVIMENTO,QTDFINAL,QTDENTRADAVOUCHER  FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
                    ' IDPRODUTO=\''+ registroMov.IDPRODUTO+'\'' +
                    ' AND (DTMOVIMENTO  BETWEEN \'' + dataVoucher + ' 00:00:00\' AND \'' + dataVoucher + ' 23:59:59\')' +
                    ' AND IDEMPRESA = ? AND STATIVO=\'True\'';
                
                     var idMovExists = api.sqlQuery(queryExistsMov, parseInt(registro.IDEMPRESAORIGEM));
                     
                    if(idMovExists.length === 0){
                         qtdInicio = 0;
                        var queryMovAnt = 'SELECT "IDINVMOVIMENTO", "IDEMPRESA", "IDPRODUTO", "QTDENTRADAVOUCHER", "STATIVO", "QTDFINAL" '+
                        ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
                        ' AND IDPRODUTO=\''+ registroMov.IDPRODUTO+'\''+
                        ' AND IDEMPRESA = ? ';
                        
                        var UltMovimentoProduto = api.sqlQuery(queryMovAnt, parseInt(registro.IDEMPRESAORIGEM));
                        
                        if(UltMovimentoProduto.length > 0){
                           
                           qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
                           qtdEntradaVoucher = parseInt(registroMov.QTD);
                           qtdFinal = qtdInicio + qtdEntradaVoucher;
                           //Atualiza o status para false do Ultimo Movimento
                           var queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                    		' "STATIVO" = \'False\'' +
                            ' WHERE "IDINVMOVIMENTO" =  ? ';
                            
                            var pStmtAtualizaStatus = conn2.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                            pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                            pStmtAtualizaStatus.execute();
                            pStmtAtualizaStatus.close();
                            
                        }else{
                            
                           qtdEntradaVoucher = parseInt(registroMov.QTD);
                           qtdFinal = qtdInicio + qtdEntradaVoucher;
                        }
                        
                        
                	    var query3 = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
                		" ( " +
                		' "IDINVMOVIMENTO", ' +
                		' "IDEMPRESA", ' +
                		' "DTMOVIMENTO", ' +
                		' "IDPRODUTO", ' +
                	    ' "QTDINICIO", ' +
                	    ' "QTDENTRADAVOUCHER", '+
                		' "QTDENTRADA", ' +
                		' "QTDSAIDA", ' +
                		' "QTDSAIDATRANSFERENCIA", ' +
                		' "QTDRETORNOAJUSTEPEDIDO", ' +
                		' "QTDFINAL", ' +
                		' "QTDAJUSTEBALANCO", ' +
                		' "STATIVO" ' +
                		' ) ' +
                		' VALUES("VAR_DB_NAME"."SEQ_INVENTARIOMOVIMENTO".NEXTVAL,?,now(),?,?,?,?,?,?,?,?,?,\'True\') ';
                
                    	var pStmt3 = conn2.prepareStatement(api.replaceDbName(query3));
                        	
                        pStmt3.setInt(1, parseInt(registro.IDEMPRESAORIGEM));
                        pStmt3.setString(2, registroMov.IDPRODUTO);
                    	pStmt3.setInt(3, qtdInicio);
                    	pStmt3.setInt(4, qtdEntradaVoucher);
                    	pStmt3.setInt(5, qtdEntrada);
                    	pStmt3.setInt(6, qtdSaida);
                    	pStmt3.setInt(7, qtdSaidaTransferencia);
                    	pStmt3.setInt(8, qtdRetornoAjustePedido);
                    	pStmt3.setInt(9, qtdFinal);
                    	pStmt3.setInt(10, qtdAjusteBalanco);
                    	
                    	pStmt3.execute();
                    	pStmt3.close();
                    	
                    }else{
                        
                        qtdEntradaVoucher = parseInt(registroMov.QTD) + parseInt(idMovExists[0].QTDENTRADAVOUCHER);
                        qtdFinal = parseInt(idMovExists[0].QTDFINAL) + parseInt(registroMov.QTD);
                         var queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                            ' "QTDENTRADAVOUCHER" =  ?, ' +
                    		' "QTDFINAL" =  ? ' +
                    		' WHERE "IDINVMOVIMENTO" =  ? ';
                            
                            var pStmt4 = conn2.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                            
                        	
                        	pStmt4.setInt(1, qtdEntradaVoucher);
                        	pStmt4.setInt(2, qtdFinal);
                        	
                            pStmt4.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
                            pStmt4.execute();
                            pStmt4.close();
                            
                    }
                    
                    conn2.commit();
                }
		    //Final Incluir Inventario Movimento
			//fnIncluirDetalhes(conn, registro.det, idVoucher, registro.IDRESUMOVENDAWEB);
		    //fnIncluirInventarioMovimento(registro.det, registro.IDEMPRESAORIGEM);
		}
 
		pStmt.close();
        pStmt2.close();
        
        
		conn.commit();

		return {
			"msg": "Inclusão realizada com sucesso!"
		};
	} catch (e) {
		conn.rollback();
		throw e;
	}
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