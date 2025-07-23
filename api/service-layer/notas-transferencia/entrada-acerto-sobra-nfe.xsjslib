var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

var sessoesUtilizadas=[];

function errorLogAcertoNota(p_IdResumoOT, p_Error){

    var conn = $.db.getConnection();

    var query = 'UPDATE "QUALITY_CONC_HML"."RESUMOORDEMTRANSFERENCIA" ' +
                    'SET ERRORLOGSAP = ? WHERE IDRESUMOOT = ?';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, p_Error);
	pStmt.setInt(2, parseInt(p_IdResumoOT));
	pStmt.execute();
	
	pStmt.close();
	conn.commit();

	return 'True';
}

function postSl(transferencia, session) {
    var response = slApi.post('/PurchaseInvoices',transferencia,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
    }else{
       return true;
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
    		'  WHERE t1.STSOBRA = \'True\' and t1.IDRESUMOOT=? ';
    		
	var linhas = api.sqlQuery(query, idResumoOt);

	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
		var qtdDifAjust = 0
		if(parseInt(det.QTDDIFERENCA)<0){  
		    qtdDifAjust = parseInt(det.QTDDIFERENCA)*(-1);
		}
		var docLine = {
    			"LineNum": i + 1,
    			"ItemCode": det.IDPRODUTO,
    			"Quantity": qtdDifAjust,
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

function entradaAcertoSobraNfe(idResumoOt, sessionSl) {

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
		' WHERE ' +
		'	1 = ?';

	if (idResumoOt) {
		query = query + ' And  t1.IDRESUMOOT = \'' + idResumoOt + '\' ';
	}
	
	var response = api.sqlQuery(query, 1);
	var data = [];
	
	for (var i = 0; i < response.length; i++) {
        
		var det = response[i];
		
		var retCardCode = api.sqlQuery('select "U_IS_PN_ENTRADA" from "SBO_GTO_TESTE1".OBPL WHERE "BPLId" = ?',det.IDEMPRESAORIGEM); 
		 var queryNfeSapSaida = 'select a."Serial" as NUMNOTA, a."SeriesStr" AS SERIENOTA, b."KeyNfe" AS CHAVENOTA from SBO_GTO_TESTE1.OINV a '+
		                         ' left join SBO_GTO_TESTE1."Process" b on a."DocEntry" = b."DocEntry" and a."ObjType" = b."DocType" '+
                        ' where a."CANCELED" = \'N\' '+
                        ' and a."U_TransStatus" = \'2\' '+
                        ' and a."U_ID_VENDA_PDV" = ?';
        var retNfeSapSaida = api.sqlQuery(queryNfeSapSaida,det.IDRESUMOOT.toString());
        if(retNfeSapSaida.length === 0){
            errorLogAcertoNota(det.IDRESUMOOT, 'Encontrado divergências na nota de saída');
            return 'Encontrado divergências na nota de saída';
        }
        var transferenciaSaida = {
				"DocType": "dDocument_Items",
				"U_ID_VENDA_PDV": det.IDRESUMOOT,
				"DocDate": det.DTRECEPCAO,
				"DocDueDate": det.DTRECEPCAO,
				"CardCode": retCardCode[0].U_IS_PN_ENTRADA,
				"Comments": "Integração Quality - acerto por sobra",
				"JournalMemo": "NFe de transf. entre filiais - acerto por sobra",
				"TaxDate": det.DTRECEPCAO,
				"Project": "PDV_SOFTQUALITY",
				"BPL_IDAssignedToInvoice": det.IDEMPRESADESTINO,
				"SequenceCode": -2, 
                "SequenceModel": "39", 
                "SequenceSerial": retNfeSapSaida[0].NUMNOTA,
                "U_ChaveAcesso": retNfeSapSaida[0].CHAVENOTA,
                "SeriesString": retNfeSapSaida[0].SERIENOTA,
                "U_TransStatus": "2",
    			"DocumentLines": obterLinhasDoDetalhe(det.IDRESUMOOT, det.WAREHOUSECODE),
    			"TaxExtension": {
    			    "Incoterms": 9,
    			    "MainUsage": 5
    			}
	    };

		return postSl(transferenciaSaida,sessionSl);

	}

	return true;
}

