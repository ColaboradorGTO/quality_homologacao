let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");
let dbNameSAP = 'SBO_GTO_TESTE4'

function obterLinhasDoDetalhe(idVenda, estqCodEmpresa, vDesc, vTotalVenda) {
    let query = ' SELECT '+
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
                '   IFNULL(t1.COFINS_CST,\'\') AS COFINS_CST, '+
                '   TO_VARCHAR(t3.DTHORAFECHAMENTO,\'YYYY-mm-DD\') AS DTHORAFECHAMENTO ' +
                ' FROM  ' +
                '   "VAR_DB_NAME".VENDADETALHE t1  ' +
                '   INNER JOIN "VAR_DB_NAME".PRODUTO t2 ON t2.IDPRODUTO = t1.CPROD   ' +
                '   INNER JOIN "VAR_DB_NAME".VENDA t3 ON t3.IDVENDA = t1.IDVENDA   ' +
                '  WHERE t1.IDVENDA=? ';
    		
	let linhas = api.sqlQuery(query, idVenda);

	let lines = [];

	for (let i = 0; i < linhas.length; i++) {
		let det = linhas[i];
		let docLine;
		
		let queryImposto = 'select CASE WHEN CAST(\''+det.DTHORAFECHAMENTO+'\' AS DATE) < \'01.06.2023\' THEN "U_IS_COD_IMPOSTO" '+
                            ' ELSE "U_IS_COD_IMPOSTO_NOVO" END AS  U_IS_COD_IMPOSTO'+
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
        
		let retImposto = api.sqlQuery(queryImposto,det.ICMS_PICMS)
		
        if(vDesc === 0){
            docLine = {
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
            docLine = {
            "LineNum": i + 1,
            "TaxCode": retImposto[0].U_IS_COD_IMPOSTO,
            "ItemCode": det.CPROD,
            "Quantity": parseInt(det.QTD),
            "UnitPrice":parseFloat(det.VUNCOM),
            "DiscountPercent": ((parseFloat(det.VDESC)/parseInt(det.QTD))/parseFloat(det.VUNCOM)) * 100,
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
    let query = ` 
        SELECT 
            tbv.IDVENDA, 
            TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD/mm/YYYY\') AS DTHORAFECHAMENTO, 
            tbv.IDEMPRESA,
            tbe.CODPARCEIRO,
            tbe.ESTOQUECODIGO,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VNF,
            tbv.NFE_INFNFE_IDE_NNF,
            IFNULL(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 
            IFNULL(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VPROD, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
            tbv.IDCAIXAWEB,
            tbv.NFE_INFNFE_IDE_DHEMI,
            tbv.NFE_INFNFE_IDE_SERIE,
            tbv.PROTNFE_INFPROT_CHNFE,
            tbv.PROTNFE_INFPROT_NPROT,
            tbv.PROTNFE_INFPROT_CSTAT,
            tbv.PROTNFE_INFPROT_XMOTIVO,
            tbv.NFE_INFNFE_TRANSP_MODFRETE
        FROM 
            "VAR_DB_NAME".VENDA tbv
        INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON 
            tbe.IDEMPRESA = tbv.IDEMPRESA
        WHERE 
            1 = ? ;
    `

	if (byId) {
		query += ` AND tbv.IDVENDA = '${byId}}' `;
	}
	
	let response = api.sqlQuery(query, 1);
	let data = [];
	
	for (let i = 0; i < response.length; i++) {

		let registro = response[i];
        
        let retCardCode = api.sqlQuery(`SELECT "U_IS_PN_SAIDA" FROM ${dbNameSAP}.OBPL WHERE "BPLId" = ? `, retCardCode.IDEMPRESA); 
        let retSequenceCode = api.sqlQuery(`SELECT "SeqCode" AS SEQCOD FROM ${dbNameSAP}.NFN1 WHERE "Model" = 39 AND "Locked" = 'N' AND "BPLId" = ? `, retCardCode.IDEMPRESA);
        
		let venda = {
			"DocType": "dDocument_Items",
			"U_ID_VENDA_PDV": registro.IDVENDA,
			"DocDate": registro.NFE_INFNFE_IDE_DHEMI,
			"DocDueDate": registro.NFE_INFNFE_IDE_DHEMI,
			"CardCode": retCardCode[0].U_IS_PN_SAIDA,
			"DocTotal": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF),
			"Comments": "Integração PDV Quality",
			"JournalMemo": "Cupom Fiscal de Saída - " + registro.NFE_INFNFE_IDE_NNF + " - " + registro.IDCAIXAWEB,
			"PaymentGroupCode": 93,
			"SalesPersonCode": 8, 
			"TaxDate": registro.NFE_INFNFE_IDE_DHEMI,
			"Project": "PDV_SOFTQUALITY",
			"BPL_IDAssignedToInvoice": registro.IDEMPRESA,
			"SequenceCode": retSequenceCode[0].SEQCOD,
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
		};
        return venda;

	}
}



