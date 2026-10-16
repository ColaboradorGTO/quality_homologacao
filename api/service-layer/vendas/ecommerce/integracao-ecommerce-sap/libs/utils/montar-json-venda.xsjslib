let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

function getCodigoImposto(item, ufDest) {
    if(ufDest !== 'DF' && !item.ICMSUFDEST_PICMSUFDEST) return false;
    
    let aliquotaIcmsDestinatario = (ufDest == 'DF' ? parseFloat(item.ICMS_PICMS) : parseFloat(item.ICMSUFDEST_PICMSUFDEST));
    
    if(item.ICMSUFDEST_PFCPUFDEST !== 0) aliquotaIcmsDestinatario += parseFloat(item.ICMSUFDEST_PFCPUFDEST);
    
    let query = `
        SELECT
        	A.U_IS_CODIGO
        FROM
        	${dbNameSAP}."@IMPOSTO_ECOMMERCE" A
        WHERE 
        	1 = ?
        	AND IFNULL(A.U_IS_CODIGO, '') <> ''
        	AND A.U_IS_ICMS = ${item.ICMS_PICMS} /*Aliquota ICMS emitente */
        	AND A.U_IS_UFDEST = '${ufDest}' /*UF Destinatário*/
        	AND A.U_IS_ICMSDEST = ${aliquotaIcmsDestinatario} /*Aliquota ICMS destinatario*/
    `;
    
    let respCodigoImposto = api.sqlQuery(query, 1);
    
    if(respCodigoImposto.length) return respCodigoImposto[0].U_IS_CODIGO;
    
    return false;
}

function getDadosVendaDetalhe(idvenda) {
    let query = `
        SELECT
        	A.NITEM,
        	A.CPROD,
        	a.QCOM,
        	A.VUNCOM,
        	A.VDESC,
        	IFNULL(A.VFRETE, 0) AS VFRETE,
        	IFNULL(A.VOUTRO, 0) AS VOUTRO,
        	A.ICMS_PICMS,
        	A.ICMSUFDEST_PICMSUFDEST,
        	IFNULL(A.ICMSUFDEST_PFCPUFDEST, 0) AS ICMSUFDEST_PFCPUFDEST
        FROM
        	"VAR_DB_NAME".VENDADETALHE A 
        WHERE
        	1 = ?
        	AND A.IDVENDA = '${idvenda}'
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length) return respQuery;
    
    return false;
}

function verificarDespesasAdicionais(item, codImposto, numeroLinha) {
    let despesasAdicionais = [];
    
    if(item.VFRETE > 0) {
        despesasAdicionais.push({
	          "LineNumber": numeroLinha,
              "ExpenseCode": 6,
              "LineTotal": Number(item.VFRETE),
              "TaxCode": `${codImposto}`,
              "TaxType": "aext_NormalTax",
              "AquisitionTax": "tNO",
              "WTLiable": "tNO",
              "CUSplit": "tNO"
        });
    }
	    
    if(item.VOUTRO > 0) {
        despesasAdicionais.push({
	          "LineNumber": numeroLinha,
              "ExpenseCode": 7,
              "LineTotal": Number(item.VOUTRO),
              "TaxCode": `${codImposto}`,
              "TaxType": "aext_NormalTax",
              "AquisitionTax": "tNO",
              "WTLiable": "tNO",
              "CUSplit": "tNO"
        });
    }
	    
    return despesasAdicionais;
}

function obterLinhasDoDetalhe(idvenda, codigoDeposito, ufDest){
    let dadosVendaDetalhe = getDadosVendaDetalhe(idvenda);
    
    if(dadosVendaDetalhe == false) return {status: false, message: `Não foi possível localizar a venda detalhe no SoftQuality`};
    
    let lines = [];

	for (let i = 0; i < dadosVendaDetalhe.length; i++) {
		let item = dadosVendaDetalhe[i];
		
		let docLine = {
    		"LineNum": i+1,
    		"ItemCode": item.CPROD,
    		"Quantity": parseInt(item.QCOM),
    		"UnitPrice":parseFloat(item.VUNCOM),
    		"WarehouseCode": codigoDeposito,
    		"CostingCode": "ALOCREC",
            "ProjectCode": "PDV_SOFTQUALITY",
            "Usage": 25,
            "DiscountPercent": item.VDESC > 0 ? (parseFloat(item.VDESC)*100)/(parseFloat(item.VUNCOM)*parseInt(item.QCOM)) : 0
    	};
    	
	    let codImposto = getCodigoImposto(item, ufDest);
	    
	    if(codImposto) {
            docLine.TaxCode = codImposto;
	    } else {
	        return {status: false, message: `Erro ao buscar o código de imposto para o estado ${ufDest}.`};
	    }
	    
	    let despesasAdicionais = verificarDespesasAdicionais(item, codImposto, i+1);
	    
	    if(despesasAdicionais.length) docLine.DocumentLineAdditionalExpenses = despesasAdicionais;
	    
		lines.push(docLine);
	}

	return {status: true, message: lines};
};

function montarJsonVenda(dadosVenda) {
    let detalheVenda = obterLinhasDoDetalhe(dadosVenda.IDVENDA, dadosVenda.CODIGODEPOSITO, dadosVenda.UFDESTINO);
    
    if(!detalheVenda.status) return {status: false, message: detalheVenda.message};
    
    let venda = {
		"DocType": "dDocument_Items",
		"U_ID_VENDA_PDV": dadosVenda.IDVENDA,
		"DocDate": dadosVenda.DATA,
		"DocDueDate": dadosVenda.DATA,
		"CardCode": dadosVenda.IDCLIENTESAP,
		"DocTotal": dadosVenda.TOTALVENDA,
		"Comments": "Integração Venda ecommerce",
		"JournalMemo": `Integração NF-e - ${dadosVenda.NUMERONOTA}`,
		"PaymentGroupCode": 93,
	    "TotalDiscount" : 0, //nfeProc.NFe.infNFe.total.ICMSTot.vDesc,
		"SalesPersonCode": 8, 
		"TaxDate": dadosVenda.DATA,
		"Project": "PDV_SOFTQUALITY",
		"BPL_IDAssignedToInvoice": dadosVenda.IDEMPRESA,
		"SequenceCode": -2, 
		"SequenceSerial": dadosVenda.NUMERONOTA,
		"SeriesString": dadosVenda.SERIENOTA,
		/*"SubSeriesString": "0",*/ 
        "SequenceModel": "39", 
        "OpeningRemarks": `Número: ${dadosVenda.NUMERONOTA} Chave de acesso: ${dadosVenda.CHAVENOTA} Data/Hora: ${dadosVenda.DATAHORA}`,
        "U_ChaveAcesso": dadosVenda.CHAVENOTA,
        "U_SituacaoDocumento": "00",
        "U_PDV_NFCE_CH_ACESSO": dadosVenda.CHAVENOTA,
        "U_PDV_NFCE_NUMERO": dadosVenda.NUMERONOTA,
        "U_PDV_NFCE_SERIE": dadosVenda.SERIENOTA,
        "U_PDV_NFCE_PROTOCOLO": dadosVenda.PROTOCOLO,
        "U_PDV_NFCE_COD_SIT": dadosVenda.CSTAT,
        "U_PDV_NFCE_DESC_SIT": dadosVenda.XMOTIVO,
    	"DocumentLines": detalheVenda.message,
    	"TaxExtension": {
    	    "Incoterms": dadosVenda.MODFRETE,
    	    "MainUsage": 25
        	}
    };
		
    return {status: true, message: venda};
};