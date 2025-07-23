var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

var sessoesUtilizadas=[];


function postSl(transferencia, force) {
    var session = '';    
   if ( force === 'true' ) 
    {
        session = slApi.loginServiceLayer(true);
    }

    if ( force === 'true' ) 
    {
         slApi.loginServiceLayer(true);
    }
    
   var response = slApi.post('/Invoices',transferencia,session);
    return 'True';
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

function saidaDistribuicaoNfe(idEmpresaOrigem,idResumoOt) {

    var idEmpresa = $.request.parameters.get("idEmpresa");
    
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
    	' t2."WAREHOUSECODE"' +
        ' FROM "QUALITY_CONC_HML"."RESUMOORDEMTRANSFERENCIA" t1' +
        '   INNER JOIN "QUALITY_CONC_HML".EMPRESA t2 ON t2.IDEMPRESA = t1.IDEMPRESAORIGEM ' +
		' WHERE ' +
		'	1 = ?';

	if (idResumoOt) {
		query = query + ' And  t1.IDRESUMOOT = \'' + idResumoOt + '\' ';
	}
	
	if(idEmpresaOrigem){
	    query = query + ' And t1.IDEMPRESAORIGEM = \'' + idEmpresaOrigem + '\' ';
	}

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];
	
	for (var i = 0; i < response.data.length; i++) {
        
		var det = response.data[i];
		
		var retCardCode = api.sqlQuery('select "U_IS_PN_SAIDA" from "SBO_GTO_PRD".OBPL WHERE "BPLId" = ?',det.IDEMPRESADESTINO); 
        var retSequenceCode = api.sqlQuery('select "SeqCode" as SEQCOD from "SBO_GTO_PRD".NFN1 where "Locked" = \'N\' and "BPLId" = ?',det.IDEMPRESAORIGEM); 
		var transferenciaSaida = {
				"DocType": "dDocument_Items",
				"U_ID_VENDA_PDV": det.IDRESUMOOT,
				"DocDate": det.DATAEXPEDICAO,
				"DocDueDate": det.DATAEXPEDICAO,
				"CardCode": retCardCode[0].U_IS_PN_SAIDA,
				"Comments": "Distribuição da compra entre as filiais",
				"JournalMemo": "Distribuição da compra entre as filiais",
				"TaxDate": det.DATAEXPEDICAO,
				"Project": "PDV_SOFTQUALITY",
				"BPL_IDAssignedToInvoice": det.IDEMPRESAORIGEM,
				"SequenceCode": retSequenceCode[0].SEQCOD, 
                "SequenceModel": "39", 
                "NumAtCard": det.IDRESUMOOT,
    			"DocumentLines": obterLinhasDoDetalhe(det.IDRESUMOOT, det.WAREHOUSECODE),
    			"TaxExtension": {
    			    "Incoterms": 9,
    			    "MainUsage": 5
    			}
	    };

		data.push(transferenciaSaida);

	}

	return postSl(transferenciaSaida,'true');
}

