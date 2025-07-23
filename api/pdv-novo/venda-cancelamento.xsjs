var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function cancelarVendaDetalhe(idVenda, conn){
    var query = 'UPDATE "VAR_DB_NAME"."VENDADETALHE" SET ' + 
        ' "STCANCELADO" = \'True\' ' +
		' WHERE "IDVENDA" =  ? ';
    
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
   	pStmt.setString(1, idVenda);
    pStmt.execute();
    pStmt.close();

	conn.commit();    
}

function cancelarVendaPagamento(idVenda, conn){
    var query = 'UPDATE "VAR_DB_NAME"."VENDAPAGAMENTO" SET ' + 
        ' "STCANCELADO" = \'True\' ' +
		' WHERE "IDVENDA" =  ? ';
    
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
   	pStmt.setString(1, idVenda);
    pStmt.execute();
    pStmt.close();

	conn.commit();
    
}

function fnIncluirInventarioMovimento(idVenda) {
    var qtdInicio = 0;
    var qtdEntradaVoucher = 0;
	var qtdEntrada = 0;
	var qtdSaida = 0;
	var qtdSaidaTransferencia = 0;
	var qtdRetornoAjustePedido = 0;
	var qtdFinal = 0;
	var qtdAjusteBalanco = 0;
	
	var queryDetalheVenda = ' SELECT IDEMPRESA, CPROD, QTD FROM "VAR_DB_NAME"."VENDA" TBV '+
	' INNER JOIN "VAR_DB_NAME"."VENDADETALHE" TBVD ON TBVD.IDVENDA = TBV.IDVENDA '+
	' WHERE TBV.IDVENDA=? ';
	
	var lstProdMov = api.sqlQuery(queryDetalheVenda, idVenda);
	
	var date = new Date();
	var dd = ("0" + date.getDate()).slice(-2);
    var mm = ("0" + (date.getMonth() + 1)).slice(-2);
    var y = date.getFullYear();
 
    var dataCancelamento = y + '-' + mm + '-' + dd;
	 var conn2 = $.db.getConnection();
	
    for (var i = 0; i < lstProdMov.length; i++) {
        var registro = lstProdMov[i];
        
        var queryExistsMov = ' SELECT IDINVMOVIMENTO,QTDFINAL,QTDENTRADA  FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.CPROD+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + dataCancelamento + ' 00:00:00\' AND \'' + dataCancelamento + ' 23:59:59\') AND STATIVO=\'True\''  +
        ' AND IDEMPRESA = ? ';
    
         var idMovExists = api.sqlQuery(queryExistsMov, parseInt(registro.IDEMPRESA));
         
       
    
        if(idMovExists.length === 0){
             
            var queryMovAnt = 'SELECT "IDINVMOVIMENTO", "IDEMPRESA", "IDPRODUTO", "QTDENTRADA", "STATIVO", "QTDFINAL" '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.CPROD+'\''+
            ' AND IDEMPRESA = ? ';
            
            var UltMovimentoProduto = api.sqlQuery(queryMovAnt, parseInt(registro.IDEMPRESA));
           
            if(UltMovimentoProduto.length > 0){
               
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdEntrada = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntrada;
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
                
               qtdEntrada = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntrada;
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
            	
            pStmt.setInt(1, parseInt(registro.IDEMPRESA));
            pStmt.setString(2, registro.CPROD);
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
            
            qtdEntrada = parseInt(registro.QTD) + parseInt(idMovExists[0].QTDENTRADA);
            qtdFinal = parseInt(idMovExists[0].QTDFINAL) + parseInt(registro.QTD);
             var queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "QTDENTRADA" =  ?, ' +
        		' "QTDFINAL" =  ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmt2 = conn2.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
            	pStmt2.setInt(1, qtdEntrada);
            	pStmt2.setInt(2, qtdFinal);
            	
                pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
                pStmt2.execute();
                pStmt2.close();
                conn2.commit();
                
        }
        
    }
   
    
}

function fnHandlePut(){
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ' + 
        ' "STATIVO" = \'False\', ' +
		' "STCANCELADO" = \'True\', ' +
		' "DTULTALTERACAO" = now(), ' +
		' "IDUSUARIOCANCELAMENTO" = ?, ' +
		' "TXTMOTIVOCANCELAMENTO" = ?, ' +
		' "PROTNFE_INFPROT_CHNFE_CANC" = ? ' +
		' WHERE "IDVENDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
			pStmt.setInt(1, registro.IDUSUARIOCANCELAMENTO);
			pStmt.setString(2, registro.TXTMOTIVOCANCELAMENTO);
			pStmt.setString(3, registro.PROTNFE_INFPROT_CHNFE_CANC);
			pStmt.setString(4, registro.IDVENDA);
                    
    	pStmt.execute();
    	cancelarVendaDetalhe(registro.IDVENDA, conn);
        cancelarVendaPagamento(registro.IDVENDA, conn);
    	fnIncluirInventarioMovimento(registro.IDVENDA);
    }
	pStmt.close();
    
	conn.commit();
	
	return {
	    msg : "Cancelamento realizado com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

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