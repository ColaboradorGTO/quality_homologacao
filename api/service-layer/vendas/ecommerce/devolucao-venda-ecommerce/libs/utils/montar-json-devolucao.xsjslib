let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.devolucao-venda-ecommerce.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");

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

function getDadosVendaDetalhe(idvenda, objDev) {
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
        	AND A.CPROD IN (${objDev.dadosItensDevolvidos.idProdutosFormatados})
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(!respQuery.length) return false;
    
    respQuery = respQuery.map(item => {
        let itemDevolvido = objDev.dadosItensDevolvidos.itensTrocados.find(
            itemTroca => String(itemTroca.idproduto) === String(item.CPROD)
        );

        return {
            NITEM: item.NITEM,
            CPROD: item.CPROD,
            QCOM: itemDevolvido ? itemDevolvido.quantidadeTrocada : item.QCOM,
            VUNCOM: item.VUNCOM,
            VDESC: item.VDESC,
            VFRETE: item.VFRETE,
            VOUTRO: item.VOUTRO,
            ICMS_PICMS: item.ICMS_PICMS,
            ICMSUFDEST_PICMSUFDEST: item.ICMSUFDEST_PICMSUFDEST,
            ICMSUFDEST_PFCPUFDEST: item.ICMSUFDEST_PFCPUFDEST
        };
    });

    return respQuery;
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

function obterLinhasDetalhe(idvenda, codigoDeposito, ufDest, objDev){
    let dadosVendaDetalhe = getDadosVendaDetalhe(idvenda, objDev);
    
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
            docLine.TaxCode = codImposto
	    } else {
	        return {status: false, message: `Erro ao buscar o código de imposto para o estado ${ufDest}.`};
	    }
	    
	    let despesasAdicionais = verificarDespesasAdicionais(item, codImposto, i+1);
	    
	    if(despesasAdicionais.length) docLine.DocumentLineAdditionalExpenses = despesasAdicionais;

		lines.push(docLine);
	}

	return {status: true, message: lines};
};

function getDadosDevolucao(idvenda){
    let query = `
        SELECT
        	A.IDEMPRESA,
        	A.IDVENDA,
        	B.IDCLIENTESAP,
        	A.NFE_INFNFE_TRANSP_MODFRETE,
        	A.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
        	A.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
        	B.SGUF,
        	D.WAREHOUSECODE,
        	A.NFE_INFNFE_IDE_NNF,
	        A.PROTNFE_INFPROT_CHNFE
        FROM
        	"VAR_DB_NAME".VENDA A 
        INNER JOIN "VAR_DB_NAME".CLIENTE B ON 
        	A.IDCLIENTE = B.IDCLIENTE 
        INNER JOIN "VAR_DB_NAME".EMPRESA D ON 
	        A.IDEMPRESA = D.IDEMPRESA 
        WHERE 
            1 = ?
        	AND A.STECOMMERCE = 'True'
        	AND A.STCANCELADO = 'False'
        	AND A.IDVENDA = '${idvenda}'
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length) return respQuery[0];
    
    return false;
}

function montarJsonDevolucao(idvenda, objDev) {
    let dadosDev = getDadosDevolucao(idvenda);
    if(dadosDev == false) return {status: false, message: `Venda não localizada no SoftQuality`};

    let dadosDetalhesDev = obterLinhasDetalhe(idvenda, dadosDev.WAREHOUSECODE, dadosDev.SGUF, objDev)
    if(!dadosDetalhesDev.status) return {status: false, message: dadosDetalhesDev.message};
    dadosDetalhesDev = dadosDetalhesDev.message;
    
    let json = {
        "DocType": "dDocument_Items",
        "U_ID_VENDA_PDV": dadosDev.IDVENDA,
        "DocDate": objDev.dataNotaDev,
        "DocDueDate": objDev.dataNotaDev,
        "CardCode": dadosDev.IDCLIENTESAP,
        "Comments": `Devolucao da venda NR ${dadosDev.NFE_INFNFE_IDE_NNF} Chave ${dadosDev.PROTNFE_INFPROT_CHNFE}.`,
        "JournalMemo": `Devolucao Ecommerce.`,
        "OpeningRemarks": `Devolucao da venda NR ${dadosDev.NFE_INFNFE_IDE_NNF} Chave ${dadosDev.PROTNFE_INFPROT_CHNFE}.`,
        "ClosingRemarks": `Devolucao da venda NR ${dadosDev.NFE_INFNFE_IDE_NNF} Chave ${dadosDev.PROTNFE_INFPROT_CHNFE}.`, 
        "U_infAdFisco": `Devolucao da venda NR ${dadosDev.NFE_INFNFE_IDE_NNF} Chave ${dadosDev.PROTNFE_INFPROT_CHNFE}.`, 
        "TaxDate": objDev.dataNotaDev,
        "Project": "PDV_SOFTQUALITY", 
        "BPL_IDAssignedToInvoice": dadosDev.IDEMPRESA,
        "U_IS_FORMA_DEV": 1,
        "SequenceCode": '-2',
        "SequenceModel": "39",
        "SequenceSerial": objDev.numeroNotaDev,
		"SeriesString": objDev.serieNotaDev,
		"U_ChaveAcesso": objDev.chaveNotaDev,
        "U_SituacaoDocumento": "00",
        "GroupNum": 93,
        "U_finNfe": 4,
        "U_SKILL_FormaPagto": 90,
        "PeyMethod": null,
        "DocumentLines": dadosDetalhesDev,
        "TaxExtension": {
            "Incoterms": 0,
            "MainUsage": 25
        }
    };
    
    return {status: true, message: json};
}