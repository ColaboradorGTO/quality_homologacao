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

function fnIncluirDetalhes(conn, lstDet, vIdVoucher) {
	var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEVOUCHER" ' +
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

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	
	for (var i = 0; i < lstDet.length; i++) {

		var registro = lstDet[i];

		pStmt.setInt(1, vIdVoucher);
		pStmt.setString(2, registro.IDPRODUTO);
		pStmt.setInt(3, registro.QTD);
		pStmt.setFloat(4, registro.VRUNIT);
		pStmt.setFloat(5, registro.VRTOTALBRUTO);
		pStmt.setFloat(6, registro.VRDESCONTO);
		pStmt.setFloat(7, registro.VRTOTALLIQUIDO);
		pStmt.setString(8, registro.STATIVO);
		pStmt.setString(9, registro.STCANCELADO);

		pStmt.execute();
	}

	pStmt.close();

	conn.commit();
}

function fnIncluirInventarioMovimento(lstProd,idEmpresa) {
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
    var conn2 = $.db.getConnection();
		
    for (var i = 0; i < lstProd.length; i++) {
        var registro = lstProd[i];
        
        var queryExistsMov = ' SELECT IDINVMOVIMENTO,QTDFINAL,QTDENTRADAVOUCHER  FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + dataVoucher + ' 00:00:00\' AND \'' + dataVoucher + ' 23:59:59\')' +
        ' AND IDEMPRESA = ? AND STATIVO=\'True\'';
    
         var idMovExists = api.sqlQuery(queryExistsMov, parseInt(idEmpresa));
         
           
        if(idMovExists.length === 0){
             qtdInicio = 0;
            var queryMovAnt = 'SELECT "IDINVMOVIMENTO", "IDEMPRESA", "IDPRODUTO", "QTDENTRADAVOUCHER", "STATIVO", "QTDFINAL" '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.IDPRODUTO+'\''+
            ' AND IDEMPRESA = ? ';
            
            var UltMovimentoProduto = api.sqlQuery(queryMovAnt, parseInt(idEmpresa));
            
            if(UltMovimentoProduto.length > 0){
               
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdEntradaVoucher = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
               //Atualiza o status para false do Ultimo Movimento
               var queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
        		' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmtAtualizaStatus = conn2.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
                conn2.commit();
            }else{
                
               qtdEntradaVoucher = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
            }
            
            
    	    var query = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
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
    
        	var pStmt = conn2.prepareStatement(api.replaceDbName(query));
            	
            pStmt.setInt(1, parseInt(idEmpresa));
            pStmt.setString(2, registro.IDPRODUTO);
        	pStmt.setInt(3, qtdInicio);
        	pStmt.setInt(4, qtdEntradaVoucher);
        	pStmt.setInt(5, qtdEntrada);
        	pStmt.setInt(6, qtdSaida);
        	pStmt.setInt(7, qtdSaidaTransferencia);
        	pStmt.setInt(8, qtdRetornoAjustePedido);
        	pStmt.setInt(9, qtdFinal);
        	pStmt.setInt(10, qtdAjusteBalanco);
        	
        	pStmt.execute();
        	pStmt.close();
        	conn2.commit();
        }else{
            
            qtdEntradaVoucher = parseInt(registro.QTD) + parseInt(idMovExists[0].QTDENTRADAVOUCHER);
            qtdFinal = parseInt(idMovExists[0].QTDFINAL) + parseInt(registro.QTD);
             var queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "QTDENTRADAVOUCHER" =  ?, ' +
        		' "QTDFINAL" =  ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmt2 = conn2.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
            	pStmt2.setInt(1, qtdEntradaVoucher);
            	pStmt2.setInt(2, qtdFinal);
            	
                pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
                pStmt2.execute();
                pStmt2.close();
                conn2.commit();
        }
        
    }
   
   
}


function fnHandlePost() {
	
	var conn = $.db.getConnection();
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
			fnIncluirDetalhes(conn, registro.det, idVoucher);
		    fnIncluirInventarioMovimento(registro.det, registro.IDEMPRESAORIGEM);
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