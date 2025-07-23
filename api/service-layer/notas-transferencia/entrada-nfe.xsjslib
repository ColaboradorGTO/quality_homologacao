var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function errorLogNotaEntrada(p_IdResumoOT, p_Error, p_IdStatus){

    var conn = $.db.getConnection();

    var query = '';
    if(p_IdStatus === 1){
        query = 'UPDATE "QUALITY_CONC_HML"."RESUMOORDEMTRANSFERENCIA" ' +
                    'SET ERRORLOGSAP = ?, QTDCONFERENCIA = 0, IDSTATUSOT = 3 WHERE IDRESUMOOT = ?';
    } else {
        query = 'UPDATE "QUALITY_CONC_HML"."RESUMOORDEMTRANSFERENCIA" ' +
                    'SET ERRORLOGSAP = ? WHERE IDRESUMOOT = ?';
    }
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, p_Error);
	pStmt.setInt(2, parseInt(p_IdResumoOT));
	pStmt.execute();
	
	pStmt.close();
	conn.commit();

	return 'True';
}

function atualizaMigracaoNotaEntrada(idResumoOT, idSap){
    var conn = $.db.getConnection();
    var query = 'UPDATE "QUALITY_CONC_HML"."RESUMOORDEMTRANSFERENCIA" SET' +
		'  IDSAPDESTINO = ?, '+
		'  STMIGRADOSAPDESTINO = \'True\''+
		' WHERE IDRESUMOOT = ?';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setInt(1, parseInt(idSap));
	pStmt.setInt(2, parseInt(idResumoOT));
	pStmt.execute();
	
	pStmt.close();

	conn.commit();
	return 'True';
}

function postSl(data, session) {
    
    var response = slApi.post('/PurchaseInvoices',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
   }else{
        return 'True';
   }
   
}

function obterLinhasDoDetalhe(idResumoOt, codigoDeposito) {
    
    var query = ' SELECT '+
	            ' t1."IDDETALHEOT", '+
	            ' t2."NUCODBARRAS", '+
            	' t1."IDPRODUTO", '+
            	' t1."IDRESUMOOT", '+
            	' t1."QTDEXPEDICAO", '+
            	' t1."QTDRECEPCAO", '+
            	' t1."QTDDIFERENCA", '+
            	' t1."QTDAJUSTE", '+
            	' t1."VLRUNITVENDA", '+
            	' t1."VLRUNITCUSTO", '+
            	' t1."STCONFERIDO", '+
            	' t1."IDUSRAJUSTE", '+
            	' t1."STATIVO", '+
            	' t1."STFALTA", '+
            	' t1."STSOBRA" '+
            ' FROM "QUALITY_CONC_HML"."DETALHEORDEMTRANSFERENCIA" t1' +
    		'   INNER JOIN "QUALITY_CONC_HML".PRODUTO t2 ON t2.IDPRODUTO = t1.IDPRODUTO ' +
    		'  WHERE t1.IDRESUMOOT=? ';
    		
	var linhas = api.sqlQuery(query, idResumoOt);

	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
		var docLine = {
    			"LineNum": i + 1,
    			"ItemCode": det.IDPRODUTO,
    			"Quantity": parseInt(det.QTDEXPEDICAO),
    			"UnitPrice":parseFloat(det.VLRUNITCUSTO),
    			"WarehouseCode": codigoDeposito.toString(),
    			"CostingCode": "ALOCREC",
                "ProjectCode": "PDV_SOFTQUALITY",
                "BarCode": det.NUCODBARRAS,
                "Usage": 5
    		};
        
		lines.push(docLine);
	}

	return lines;
}

function executeEntradaNfe(idResumoOt){

    var query = ' SELECT' +
    	' t1."IDRESUMOOT",' +
    	' t1."IDEMPRESAORIGEM",' +
    	' t1."IDEMPRESADESTINO",' +
    	' TO_VARCHAR(T1.DATAEXPEDICAO,\'YYYY-mm-DD\') AS DATAEXPEDICAO, ' +
    	' t1."IDOPERADOREXPEDICAO",' +
    	' t1."NUTOTALITENS",' +
    	' t1."QTDTOTALITENS",' +
    	' t1."QTDTOTALITENSRECEPCIONADO",' +
    	' t1."QTDTOTALITENSDIVERGENCIA",' +
    	' t1."NUTOTALVOLUMES",' +
    	' t1."TPVOLUME",' +
    	' t1."VRTOTALCUSTO",' +
    	' t1."VRTOTALVENDA",' +
    	' t1."DTRECEPCAO",' +
    	' TO_VARCHAR(T1.DTRECEPCAO,\'YYYY-mm-DD\') AS DTRECEPCAO, ' +
    	' t1."IDOPERADORRECEPTOR",' +
    	' t1."DSOBSERVACAO",' +
    	' t1."IDUSRCANCELAMENTO",' +
    	' t1."DTULTALTERACAO",' +
    	' t1."IDSTDIVERGENCIA",' +
    	' t1."OBSDIVERGENCIA",' +
    	' t1."STEMISSAONFE",' +
    	' t1."NUMERONFE",' +
    	' t1."STENTRADAINVENTARIO",' +
    	' t1."QTDCONFERENCIA",' +
    	' t1."IDSTATUSOT",' +
    	' t1."IDUSRAJUSTE",' +
    	' t1."DTAJUSTE",' +
    	' t1."QTDTOTALITENSAJUSTE",' +
    	' t2."WAREHOUSECODE",' +
    	' t1."NUMERONFESAIDA",' +
    	' t1."SERIENFESAIDA"' +
        ' FROM "QUALITY_CONC_HML"."RESUMOORDEMTRANSFERENCIA" t1' +
        '   INNER JOIN "QUALITY_CONC_HML".EMPRESA t2 ON t2.IDEMPRESA = t1.IDEMPRESADESTINO ' +
		' WHERE 1 = ? AND t1."IDSTATUSOT" = 4 AND STMIGRADOSAPORIGEM = \'True\' AND IDSAPORIGEM IS NOT NULL' +
		' AND t1.IDRESUMOOT = '+ parseInt(idResumoOt);

	var response = api.sqlQuery(query, 1);
	var data = [];
	var session = '';
	for (var i = 0; i < response.length; i++) {
        
		var det = response[i];
		
		var retCardCode = api.sqlQuery('select "U_IS_PN_ENTRADA" from "SBO_GTO_TESTE1".OBPL WHERE "BPLId" = ?',det.IDEMPRESAORIGEM); 
		 var queryNfeSapSaida = 'select a."Serial" as NUMNOTA, a."SeriesStr" AS SERIENOTA, b."KeyNfe" AS CHAVENOTA from SBO_GTO_TESTE1.OINV a '+
		                      ' left join SBO_GTO_TESTE1."Process" b on a."DocEntry" = b."DocEntry" and a."ObjType" = b."DocType" '+
                        ' where 1=? AND  a."CANCELED" = \'N\' '+
                        ' and a."U_TransStatus" = \'N\' '+
                        ' and a."U_ID_VENDA_PDV" = \''+det.IDRESUMOOT+'\'';
        //return queryNfeSapSaida;
        var retNfeSapSaida = api.sqlQuery(queryNfeSapSaida,1);
        //return retNfeSapSaida.length;
        
        if(retNfeSapSaida.length === 0){
            errorLogNotaEntrada(det.IDRESUMOOT, 'A transformação do pedido em nota não foi realizada', 1);
            return 'A transformação do pedido em nota não foi realizada';
        }
        
        var transferenciaEntrada = {
				"DocType": "dDocument_Items",
				"U_ID_VENDA_PDV": det.IDRESUMOOT,
				"DocDate": det.DATAEXPEDICAO,
				"DocDueDate": det.DATAEXPEDICAO,
				"CardCode": retCardCode[0].U_IS_PN_ENTRADA,
				"Comments": "Integração Quality",
				"JournalMemo": "NFe de transf. entre filiais",
				"TaxDate": det.DATAEXPEDICAO,
				"Project": "PDV_SOFTQUALITY",
				"BPL_IDAssignedToInvoice": det.IDEMPRESADESTINO,
				"SequenceCode": -2, 
                "SequenceModel": "39", 
                "U_TransStatus": "1",
                "SequenceSerial": retNfeSapSaida[0].NUMNOTA,
                "U_ChaveAcesso": retNfeSapSaida[0].CHAVENOTA,
                "SeriesString": retNfeSapSaida[0].SERIENOTA,
    			"DocumentLines": obterLinhasDoDetalhe(det.IDRESUMOOT, det.WAREHOUSECODE),
    			"TaxExtension": {
    			    "Incoterms": 9,
    			    "MainUsage": 5
    			}
	    };

		if(i === 0){
		    session = slApi.loginServiceLayer(true);
		    slApi.loginServiceLayer(true);
		} 
	
		// verificar possíveis erros na service layer, debugar aqui	
		var rsSl = postSl(transferenciaEntrada,session);
		if(rsSl !== 'True'){
		    errorLogNotaEntrada(det.IDRESUMOOT, rsSl.error.message.value, 1);
		} else {
		    errorLogNotaEntrada(det.IDRESUMOOT, '', 0);
		}

        var resultMigracao = api.sqlQuery('select "DocNum" as IDSAP from "SBO_GTO_TESTE1".OPCH where 1=? AND "U_ID_VENDA_PDV" = \''+ det.IDRESUMOOT+'\'', 1);
        if(resultMigracao.length > 0){
            //return resultMigracao[0].MARCACOD;
            atualizaMigracaoNotaEntrada(det.IDRESUMOOT, resultMigracao[0].IDSAP);
        }
	}
    return 'Migração Nota-entrada realizada com sucesso!';
}