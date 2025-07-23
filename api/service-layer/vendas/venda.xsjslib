var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function obterLinhasDoPagamento(idVenda, dsTipopagamento, dataVendaPesq) {
    
    var dataqueb =  dataVendaPesq.split('-');
 
	var query = ' SELECT '+
                ' TO_VARCHAR(TBVP.DTVENCIMENTO,\'YYYY-mm-DD HH24:MI:SS\') AS DTVENCIMENTO, ' +
                ' TBVP.VALORRECEBIDO, '+
                ' ifnull(TBVP.NPARCELAS,1) as NPARCELAS, '+
                
                ' CASE WHEN TBVP.NSUAUTORIZADORA = \'\' THEN \'1111\' ELSE TRIM(substring(TBVP.NSUAUTORIZADORA,0,11)) END NSUAUTORIZADORA, '+
                ' TBVP.NUAUTORIZACAO, '+
                ' CASE WHEN TBVP.NOTEF = \'POS\' THEN \'Cartão\' ELSE \'TEF\' END AS NOTEF, '+
                ' CASE TBVP.TPAG '+
                ' WHEN \'001\' THEN \'2\' '+
                ' WHEN \'002\' THEN \'15\' '+
                ' WHEN \'003\' THEN \'4\' '+
                ' WHEN \'004\' THEN \'5\' '+
                ' WHEN \'007\' THEN \'16\' '+
                ' WHEN \'009\' THEN \'10\' '+
                ' WHEN \'014\' THEN (CASE WHEN TBVP.DSTIPOPAGAMENTO like \'%CRÉDITO%\' THEN \'6\' ELSE \'7\' END)  '+ //elo credito e elo debito sao 14 sap 6 e 7
                ' WHEN \'018\' THEN \'13\' '+
                ' WHEN \'020\' THEN \'16\' '+
                ' WHEN \'028\' THEN \'15\' '+
                ' ELSE \'15\' END AS CARTAO_CODIGO,'+
               ' CASE TBVP.TPAG '+
                ' WHEN \'001\' THEN \'6\' '+
                ' WHEN \'002\' THEN \'19\' '+
                ' WHEN \'003\' THEN \'8\' '+
                ' WHEN \'004\' THEN \'9\' '+
                ' WHEN \'007\' THEN \'20\' '+
                ' WHEN \'009\' THEN \'14\' '+
                ' WHEN \'014\' THEN (CASE WHEN TBVP.DSTIPOPAGAMENTO like \'%CRÉDITO%\' THEN \'10\' ELSE \'11\' END)  '+ //elo credito e elo debito sao 14 sap 6 e 7
                ' WHEN \'018\' THEN \'17\' '+
                ' WHEN \'020\' THEN \'20\' '+
                ' WHEN \'028\' THEN \'19\' '+
                ' ELSE \'19\' END AS FORM_PAG_SAP_CODIGO '+
		' FROM  ' +
		'   "VAR_DB_NAME".VENDAPAGAMENTO TBVP ' +
		'  WHERE  ' +
		'   TBVP.IDVENDA = ?   AND (TBVP.STCANCELADO = \'False\' OR TBVP.STCANCELADO = \'\' OR TBVP.STCANCELADO IS NULL )'; 
		
		if(dsTipopagamento === 'DINHEIRO'){
	        query += ' AND TBVP.DSTIPOPAGAMENTO IN (\'DINHEIRO\',\'VOUCHER\',\'Vale Funcionário\',\'VALE FUNCIONÁRIO\',\'Voucher\',\'Parceiros de Apoio\') ';
		}else{
		    query += ' AND TBVP.NOTEF in(\'TEF\',\'POS\') ';
		}
		
		query +='  ORDER BY TBVP.NUAUTORIZACAO  ';

	var linhas = api.sqlQuery(query, idVenda);
	
	var lines = [];
    var nuAutorizadorAnterior = '';
    
	for (var i = 0; i < linhas.length; i++) {
	    
		var det = linhas[i];
		
		
		if(det.NUAUTORIZACAO !== nuAutorizadorAnterior){
		       
            
            if(dsTipopagamento === 'DINHEIRO'){
        		var docLine = {
        			    "pagdinheiro_valor_real": parseFloat(det.VALORRECEBIDO)
        		};
            }else{
                
                    var querySomaRecNsu = 'SELECT SUM(VALORRECEBIDO) FROM QUALITY_CONC.VENDAPAGAMENTO WHERE IDVENDA = ?  AND (STCANCELADO = \'False\' OR STCANCELADO = \'\' OR STCANCELADO IS NULL ) AND NUAUTORIZACAO =\''+det.NUAUTORIZACAO+'\'';
    		        var SomaRecNsu = api.executeScalar(querySomaRecNsu,idVenda);
                
		        var docLine = {
        			     "pagcartao_autoriza": det.NUAUTORIZACAO, 
                         "pagcartao_parcela": parseInt(det.NPARCELAS) , 
                         "pagcartao_numero": "0", 
                         "pagcartao_validade": dataqueb[0]+'-'+dataqueb[1]+'-01 00:00:00.0',
                         "pagcartao_comprovante": det.NSUAUTORIZADORA,
                         "pagcartao_valor": parseFloat(SomaRecNsu),
                         "cartao_codigo": parseInt(det.CARTAO_CODIGO),
                         "form_pag_sap_codigo": parseInt(det.FORM_PAG_SAP_CODIGO),
                         "pagcartao_meiopagamento": det.NOTEF
        		};
            }
    
    		lines.push(docLine);
		}
		nuAutorizadorAnterior = det.NUAUTORIZACAO;
	}
	if(dsTipopagamento === 'DINHEIRO'){
	    return docLine;
	}else{	
	    return lines;
	    
	}
}

function obterLinhasDoDetalhe(idVenda, estqCodEmpresa, vDesc, vTotalVenda) {
    
    var query = ' SELECT '+
	        '   t1.IDVENDADETALHE, '+
	        '   t1.CPROD, '+
		    '   t1.QTD, '+
		    '   t1.VPROD, '+
			'   t2.NUCODBARRAS, '+
            '   t1.VUNCOM, '+
            '   t1.VDESC, '+
            '   t1.CFOP, '+
            '   ROUND(t1.ICMS_PICMS,2) AS ICMS_PICMS, '+
            '   ROUND(IFNULL(t1.IPI_PIPI,0),2) AS IPI_PIPI, '+
            '   ROUND(t1.PIS_PPIS,2) AS PIS_PPIS, '+
            '   ROUND(t1.COFINS_PCOFINS,2) AS COFINS_PCOFINS, '+
            '   IFNULL(t1.ICMS_CST,\'\') AS ICMS_CST, '+
            '   IFNULL(t1.IPI_CST,\'\') AS IPI_CST, '+
            '   IFNULL(t1.PIS_CST,\'\') AS PIS_CST, '+
            '   IFNULL(t1.COFINS_CST,\'\') AS COFINS_CST '+
    		' FROM  ' +
    		'   "QUALITY_CONC_HML".VENDADETALHE t1  ' +
    		'   INNER JOIN "QUALITY_CONC_HML".PRODUTO t2 ON t2.IDPRODUTO = t1.CPROD   ' +
    		'  WHERE t1.IDVENDA=? ';
    		
	var linhas = api.sqlQuery(query, idVenda);

	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
		var queryImposto = 'select "U_IS_COD_IMPOSTO" '+
                           ' from "SBO_GTO_PRD"."@IS_IMPOSTO_PDV" '+
                           ' WHERE "U_IS_ICMS" = ?'+ 
                           ' AND "U_IS_IPI" = '+ det.IPI_PIPI +
                           ' AND "U_IS_PIS" = '+ det.PIS_PPIS +
                           ' AND "U_IS_COFINS" = ' + det.COFINS_PCOFINS +
                           ' AND IFNULL("U_IS_ICMS_CST", \'\') = \''+ det.ICMS_CST + '\''+
                           ' AND IFNULL("U_IS_IPI_CST", \'\') =  \''+ det.IPI_CST + '\''+
                           ' AND IFNULL("U_U_PIS_CST", \'\') =  \''+ det.PIS_CST + '\''+
                           ' AND IFNULL("U_U_COFINS_CST", \'\') =  \''+ det.COFINS_CST + '\''+
                           ' AND "U_IS_CFOP" = '+det.CFOP;
           // return queryImposto;
		var retImposto = api.sqlQuery(queryImposto,det.ICMS_PICMS)
		
        if(vDesc === 0){
    		var docLine = {
    			"LineNum": i + 1,
    			"TaxCode": retImposto[0].U_IS_COD_IMPOSTO,
    			"ItemCode": det.CPROD,
    			"Quantity": parseInt(det.QTD),
    			"UnitPrice":parseFloat(det.VUNCOM),
    			/*"Price": parseFloat(det.VPROD),*/
    			"WarehouseCode": estqCodEmpresa.toString(),
    			"CostingCode": "ALOCREC",
                "ProjectCode": "PDV_SOFTQUALITY",
                "BarCode": det.NUCODBARRAS,
                "Usage": 38,
                "DiscountPercent": 0
    		};
        }else{
            //var vlDesconto = ((parseFloat(vDesc) / parseFloat(vTotalVenda)) * 100);
            var docLine = {
    			"LineNum": i + 1,
    			"TaxCode": retImposto[0].U_IS_COD_IMPOSTO,
    			"ItemCode": det.CPROD,
    			"Quantity": parseInt(det.QTD),
    			"UnitPrice":parseFloat(det.VUNCOM),
    			/*"DiscountPercent": vlDesconto,*/
    			"DiscountPercent": ((parseFloat(det.VDESC)/parseInt(det.QTD))/parseFloat(det.VUNCOM)) * 100,
    			/*"Price": parseFloat(det.VPROD),*/
    			"WarehouseCode": estqCodEmpresa.toString(),
    			"CostingCode": "ALOCREC",
                "ProjectCode": "PDV_SOFTQUALITY",
                "BarCode": det.NUCODBARRAS,
                "Usage": 38
    		};
        }

		lines.push(docLine);
	}

	return lines;
}

function obterJsonVenda(byId) {

    var query = ' SELECT ' +
	    '   tbv.IDVENDA, ' +
	    '   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD/mm/YYYY\') AS DTHORAFECHAMENTO, ' +
		'   tbv.IDEMPRESA,' +
		'   tbe.CODPARCEIRO,' +
		'   tbe.ESTOQUECODIGO,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VNF,' +
		'   tbv.NFE_INFNFE_IDE_NNF,' +
		'   IFNULL(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VDESC, '+
		'   IFNULL(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VPROD, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VPROD, '+
		'   tbv.IDCAIXAWEB,' +
		'   tbv.NFE_INFNFE_IDE_DHEMI,' +
		'   tbv.NFE_INFNFE_IDE_SERIE,' +
		'   tbv.PROTNFE_INFPROT_CHNFE,' +
		'   tbv.PROTNFE_INFPROT_NPROT,' +
		'   tbv.PROTNFE_INFPROT_CSTAT,' +
		'   tbv.PROTNFE_INFPROT_XMOTIVO,' +
		'   tbv.NFE_INFNFE_TRANSP_MODFRETE ' +
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	


	var response = api.sqlQuery(query, 1);
	var data = [];
	
	for (var i = 0; i < response.length; i++) {

		var registro = response[i];

		var venda = {
			
				"DocType": "dDocument_Items",
				"U_ID_VENDA_PDV": registro.IDVENDA,
				"DocDate": registro.NFE_INFNFE_IDE_DHEMI,
				"DocDueDate": registro.NFE_INFNFE_IDE_DHEMI,
				"CardCode": registro.CODPARCEIRO,
				"DocTotal": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF),
				"Comments": "Integração PDV Quality",
				"JournalMemo": "Cupom Fiscal de Saída - " + registro.NFE_INFNFE_IDE_NNF + " - " + registro.IDCAIXAWEB,
				"PaymentGroupCode": 93,
			/*	"TotalDiscount" : registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,*/
				"SalesPersonCode": 8, 
				"TaxDate": registro.NFE_INFNFE_IDE_DHEMI,
				"Project": "PDV_SOFTQUALITY",
				"BPL_IDAssignedToInvoice": registro.IDEMPRESA,
				"SequenceCode": -1, 
				"SequenceSerial": registro.NFE_INFNFE_IDE_NNF,
				"SeriesString": registro.NFE_INFNFE_IDE_SERIE.toString(),
				/*"SubSeriesString": "0",*/ 
                "SequenceModel": "54", 
                "OpeningRemarks": "Número: " + registro.NFE_INFNFE_IDE_NNF + "\rChave de acesso: " + registro.PROTNFE_INFPROT_CHNFE + "\rData/Hora: " + registro.DTHORAFECHAMENTO,
                "U_ChaveAcesso": registro.PROTNFE_INFPROT_CHNFE,
                "U_SituacaoDocumento": "00",
                "U_PDV_NFCE_CH_ACESSO": registro.PROTNFE_INFPROT_CHNFE,
                "U_PDV_NFCE_NUMERO": registro.NFE_INFNFE_IDE_NNF,
                "U_PDV_NFCE_SERIE": registro.NFE_INFNFE_IDE_SERIE,
                "U_PDV_NFCE_PROTOCOLO": registro.PROTNFE_INFPROT_NPROT,
                "U_PDV_NFCE_COD_SIT": registro.PROTNFE_INFPROT_CSTAT,
                "U_PDV_NFCE_DESC_SIT": registro.PROTNFE_INFPROT_XMOTIVO,
          
			"DocumentLines": obterLinhasDoDetalhe(registro.IDVENDA, registro.ESTOQUECODIGO, parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)),
			"TaxExtension": {
			    "Incoterms": registro.NFE_INFNFE_TRANSP_MODFRETE,
			    "MainUsage": 38
			}
			
			//"pagamento": obterLinhasDoPagamento(registro.IDVENDA)
		};
        return venda;

	}
}



