let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";
let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer`, "api");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");

function postSl(data, session) {
    let response = slApi.post('/Invoices', data, session);
    
    if (response.status !== 204) {
        response = JSON.parse(response.body.asString());
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar integrar a venda!';
        
        return msgReturnError;
    }
   
   return true;
    
}

function obterLinhasDoDetalhe(tagDet){
    let lines = [];

	for (let i = 0; i < tagDet.length; i++) {
		let det = tagDet[i];
		
    	let docLine = {
    		"LineNum": i + 1,
    		"ItemCode": det.prod.cProd,
    		"Quantity": parseInt(det.prod.qCom),
    		"UnitPrice":parseFloat(det.prod.vUnCom),
    		/*"Price": parseFloat(det.VPROD),*/
    		"WarehouseCode": '031',
    		"CostingCode": "ALOCREC",
            "ProjectCode": "PDV_SOFTQUALITY",
            "BarCode": det.prod.cEAN,
            "Usage": 25,
            "DiscountPercent": 0
    	};

		lines.push(docLine);
	}

	return lines;
};

function montarJsonVenda(codPnSap, nfeProc) {
    let detalheVenda = obterLinhasDoDetalhe(nfeProc.NFe.infNFe.det);
    
    let venda = {
		"DocType": "dDocument_Items",
		"U_ID_VENDA_PDV": `31-${nfeProc.NFe.infNFe.ide.serie}-${nfeProc.NFe.infNFe.ide.nNF}`,
		"DocDate": nfeProc.NFe.infNFe.ide.dhEmi.substring(0, 10),
		"DocDueDate": nfeProc.NFe.infNFe.ide.dhEmi.substring(0, 10),
		"CardCode": codPnSap,
		"DocTotal": parseFloat(nfeProc.NFe.infNFe.total.ICMSTot.vNF),
		"Comments": "Integração Venda marketplace",
		"JournalMemo": `Integração NF-e - ${nfeProc.NFe.infNFe.ide.nNF}`,
		"PaymentGroupCode": 93,
	    "TotalDiscount" : nfeProc.NFe.infNFe.total.ICMSTot.vDesc,
		"SalesPersonCode": 8, 
		"TaxDate": nfeProc.NFe.infNFe.ide.dhEmi.substring(0, 10),
		"Project": "PDV_SOFTQUALITY",
		"BPL_IDAssignedToInvoice": 31,
		"SequenceCode": -1, 
		"SequenceSerial": nfeProc.NFe.infNFe.ide.nNF,
		"SeriesString": nfeProc.NFe.infNFe.ide.serie.toString(),
		/*"SubSeriesString": "0",*/ 
        "SequenceModel": "39", 
        "OpeningRemarks": "Número: " + nfeProc.NFe.infNFe.ide.nNF + "\rChave de acesso: " + nfeProc.protNFe.infProt.chNFe  + "\rData/Hora: " + nfeProc.NFe.infNFe.ide.dhEmi,
        "U_ChaveAcesso": nfeProc.protNFe.infProt.chNFe,
        "U_SituacaoDocumento": "00",
        "U_PDV_NFCE_CH_ACESSO": nfeProc.protNFe.infProt.chNFe,
        "U_PDV_NFCE_NUMERO": nfeProc.NFe.infNFe.ide.nNF,
        "U_PDV_NFCE_SERIE": nfeProc.NFe.infNFe.ide.serie,
        "U_PDV_NFCE_PROTOCOLO": nfeProc.protNFe.infProt.nProt,
        "U_PDV_NFCE_COD_SIT": nfeProc.protNFe.infProt.cStat,
        "U_PDV_NFCE_DESC_SIT": nfeProc.protNFe.infProt.xMotivo,
    	"DocumentLines": detalheVenda,
    	"TaxExtension": {
    	    "Incoterms": nfeProc.NFe.infNFe.transp.modFrete,
    	    "MainUsage": 25
        	}
    	//"pagamento": obterLinhasDoPagamento(registro.IDVENDA)
    };
		
    return venda;
};

function integrarVenda(session, codPnSap, nfeProc){
    let data = montarJsonVenda(codPnSap, nfeProc);
    let respIntegracao = postSl(data, session);
    
    if(respIntegracao == true) {
        let respValidarIntegracaoVenda = verificarVendaSap(`31-${nfeProc.NFe.infNFe.ide.serie}-${nfeProc.NFe.infNFe.ide.nNF}`);
        
        if(respValidarIntegracaoVenda.length) {
            return {
                ok: true,
                message: `Venda integrada com sucesso!`
            }
        } else {
            return {
                ok: false,
                message: `Erro ao integrar a venda!`
            }
        } 
    } else {
        return {
            ok: false,
            message: respIntegracao
        }
    }
}

function verificarVendaSap(idvenda){
    let query = `
    SELECT 
        A.U_ID_VENDA_PDV 
    FROM ${dbNameSAP}.OINV A 
    WHERE 
        1 = ? 
        AND A.U_ID_VENDA_PDV = '${idvenda}'
        AND A."CANCELED" = 'N'
        AND A."Model" = 39
    `;
    
    let respValidarIntegracaoVenda = api.sqlQuery(query, 1);
    return respValidarIntegracaoVenda;
}

function validarIntegracaoVenda(idvenda){
    
    let respValidarIntegracaoVenda = verificarVendaSap(idvenda);
    
    if(respValidarIntegracaoVenda.length) {
        return {
            ok: false,
            message: `Venda já integrada!`
        }
    } 
    
    return {
        ok: true,
        message: `Venda não integrada!`
    };
};