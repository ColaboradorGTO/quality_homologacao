let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.temp.reintegracao-vendas-ncm-retroativas.libs`;
let dbNameSAP = 'SBO_GTO_TESTE4'
let libRefVendaSubs = $.import(`${filePathLibs}.referenciacao`, "referenciar-nota-venda-substituta");

function ajustarDataVenda(uf, data) {
    return '2026-06-20';
    let [ano, mes, dia] = data.split("-").map(Number);
    //return `${ano}-${mes}-${dia}`;
    
    let dataHora = new Date(ano, mes - 1, dia); 
    let agora = new Date();
    let limite = new Date();
    let novaData = '';
    let diasSubtracao;
    
    dataHora.setHours(0, 0, 0, 0);
    agora.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);
    
    if(uf == 'GO') {
        limite.setDate(agora.getDate() - 15)
        diasSubtracao = 14;
    } else {
        limite.setDate(agora.getDate() - 30)
        diasSubtracao = 29;
    }
    
    if(dataHora <= limite){
        novaData = new Date();
        novaData.setDate(agora.getDate() - diasSubtracao);
        
        dataHora = novaData;
    }
    
    ano = dataHora.getFullYear();
    mes = String(dataHora.getMonth() + 1);
    dia = String(dataHora.getDate());
    
    mes = mes.length < 2 ? ('0' + mes) : mes;
    dia = dia.length < 2 ? ('0' + dia) : dia;
    
    return `${ano}-${mes}-${dia}`;
}

function errorLogVenda(idVenda, p_Error, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA"
        SET 
            LOGVENDA55 = ? 
        WHERE 
            IDVENDA = ? 
    `;

	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(query));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setString(2, idVenda);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	
	conn.commit();

	return false;
}

function atualizaMigracaoVenda(idVenda, docEntryVenda55, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA" 
        SET
            DOCENTRYNOTA55EXTERNA = ?
		WHERE 
		    IDVENDA = ?
    `;
	
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(query));

	pStmtUpdate.setInt(1, parseInt(docEntryVenda55));
	pStmtUpdate.setString(2, idVenda);
	pStmtUpdate.execute();
	pStmtUpdate.close();
	conn.commit();
	
	return true;
}

function validaMigracaoVenda(registro, session, conn){
    let queryValidaMigracao = `
        SELECT 
            "DocEntry" as DOCENTRYVENDA55
        FROM 
            ${dbNameSAP}.OINV 
        WHERE 
            1 = ? 
            AND "U_ID_VENDA_PDV" = '${registro.IDVENDA}-R'
            AND "U_finNfe" = '3'
            AND "U_SKILL_CODSIT" = '08'
            AND "CANCELED" = 'N'
            AND "SeqCode" = '-2'
    `;
    
    let resultMigracao = api.sqlQuery(queryValidaMigracao, 1);
    
    if(resultMigracao.length > 0){
       atualizaMigracaoVenda(registro.IDVENDA, resultMigracao[0].DOCENTRYVENDA55, conn);
       return referenciarNotaSubstituta(registro, resultMigracao[0].DOCENTRYVENDA55, session, conn);
    }
    
    return false;
}

function getDocEntryRefVendaSap(docEntryOrigem, docEntryReferenciado){
    let queryValidaRefVenda = `
        SELECT
            A."U_DocRef" AS DOCENTRYREFERENCIA,
            A."U_DocEntry" as DOCENTRYORIGEM
        FROM 
            ${dbNameSAP}."@SKL40DCREF" A
        INNER JOIN ${dbNameSAP}."OINV" B ON 
            A."U_DocEntry" = B."DocEntry"
        WHERE
            B."CANCELED" = 'N'
            AND A."U_DocRef" = '${docEntryReferenciado}'
            AND A."U_DocEntry" = ?
    `;
    
    let resultRefVenda = api.sqlQuery(queryValidaRefVenda, docEntryOrigem);
    
    if(resultRefVenda.length){
        return true;
    }
    
    return false;
}

function referenciarNotaSubstituta(registro, docEntryVenda55, session, conn){
    let resultRefVenda65 = getDocEntryRefVendaSap(docEntryVenda55, registro.DOCENTRYVENDA65);
    let resultRefVendaDev = getDocEntryRefVendaSap(docEntryVenda55, registro.DOCENTRYDEV);
    
    if(!resultRefVenda65 || !resultRefVendaDev){
        return libRefVendaSubs.referenciarVenda(registro, docEntryVenda55, session, conn, registro.DOCENTRYDEV, 'externa');
    }
    
    return true;
}

function postSl(data, registro, session, conn) {
   let response = slApi.post('/Invoices', data, session);
   
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        //return response;
        return false;
   }
   
    return validaMigracaoVenda(registro, session, conn);
}

function obterLinhasDoDetalhe(idVenda, estqCodEmpresa, vDesc, vTotalVenda) {
    let query = `
            SELECT 
            	t1.IDVENDADETALHE,
               	t1.CPROD,
               	t1.QTD,
               	t1.VPROD,
               	t2.NUCODBARRAS,
               	t1.VUNCOM,
               	t1.VDESC, 
               	t1.CFOP, 
               	CASE 
            		WHEN IFNULL((SELECT (XA.IMPESTADUAL*10) FROM NCMEXCECAO XA WHERE CAST(XA.NUNCM AS VARCHAR) = T1.NCM AND XA.SGUF = T3.NFE_INFNFE_EMIT_ENDEREMIT_UF), 0) <> 0 THEN (SELECT (XA.IMPESTADUAL*10) FROM NCMEXCECAO XA WHERE CAST(XA.NUNCM AS VARCHAR) = T1.NCM AND XA.SGUF = T3.NFE_INFNFE_EMIT_ENDEREMIT_UF)
            		ELSE ROUND(t1.ICMS_PICMS,2)
            	END AS ICMS_PICMS,
               	ROUND(IFNULL(t1.IPI_PIPI,0),2) AS IPI_PIPI, 
               	ROUND(t1.PIS_PPIS,2) AS PIS_PPIS,
               	ROUND(t1.COFINS_PCOFINS,2) AS COFINS_PCOFINS,
               	IFNULL(t1.ICMS_CST,'') AS ICMS_CST,
               	IFNULL(t1.IPI_CST,'') AS IPI_CST, 
               	IFNULL(t1.PIS_CST,'') AS PIS_CST, 
               	IFNULL(t1.COFINS_CST,'') AS COFINS_CST, 
               	TO_VARCHAR(t3.DTHORAFECHAMENTO, 'YYYY-mm-DD') AS DTHORAFECHAMENTO
            FROM 
            	"VAR_DB_NAME".VENDADETALHE t1
            INNER JOIN "VAR_DB_NAME".PRODUTO t2 ON 
            	t2.IDPRODUTO = t1.CPROD 
            INNER JOIN "VAR_DB_NAME".VENDA t3 ON 
            	t3.IDVENDA = t1.IDVENDA 
            WHERE 
            	t1.IDVENDA = ?
        `;
    		
	let linhas = api.sqlQuery(query, idVenda);

	let lines = [];

	for (let i = 0; i < linhas.length; i++) {
		let det = linhas[i];
		let docLine;
		
		let queryImposto = `
		    select 
            	CASE 
            		WHEN CAST('${det.DTHORAFECHAMENTO}' AS DATE) < '01.06.2023' THEN "U_IS_COD_IMPOSTO"
                   ELSE "U_IS_COD_IMPOSTO_NOVO" 
            	END AS  U_IS_COD_IMPOSTO
            from 
            	"SBO_GTO_PRD"."@IS_IMPOSTO_PDV"
            WHERE 
            	"U_IS_ICMS" = ?
            	AND "U_IS_IPI" = '${det.IPI_PIPI}'
            	AND "U_IS_PIS" = '${det.PIS_PPIS}'
            	AND "U_IS_COFINS" = '${det.COFINS_PCOFINS}'
            	AND IFNULL("U_IS_ICMS_CST", '') = '${det.ICMS_CST}'
            	AND IFNULL("U_IS_IPI_CST", '') =  '${det.IPI_CST}'
            	AND IFNULL("U_U_PIS_CST", '') = '${det.PIS_CST}'
            	AND IFNULL("U_U_COFINS_CST", '') = '${det.COFINS_CST}'
            	AND "U_IS_CFOP" = '${det.CFOP}'
		`;
        
        try {
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
        } catch (error) {
            //return error;
            errorLogVenda(idVenda, error.message || 'Erro ao integrar a venda')
        }
	}

	return lines;
}

function getDadosDevolucao(docEntryDev) {
    let query = `
        SELECT
        	A."Serial" as NRNOTADEV,
        	A."U_ChaveAcesso" as CHAVEDEV,
        	A."SeriesStr" AS SERIEDEV,
        	TO_VARCHAR(A."DocDate",'YYYY-mm-DD') AS DATADEV
        FROM
        	${dbNameSAP}.ORIN A
        WHERE 
        	A."DocEntry" = ?
    `;
    
    return api.sqlQuery(query, docEntryDev);
}

function montarJsonVenda(registro) {
    let retCardCode = api.sqlQuery(`SELECT "U_IS_PN_SAIDA" FROM ${dbNameSAP}.OBPL WHERE "BPLId" = ? `, registro.IDEMPRESA); 
    let retSequenceCode = api.sqlQuery(`SELECT "SeqCode" AS SEQCOD FROM ${dbNameSAP}.NFN1 WHERE "Model" = 39 AND "Locked" = 'N' AND "BPLId" = ? `, registro.IDEMPRESA);
    let dadosDevolucao = getDadosDevolucao(registro.DOCENTRYDEV);
    let {NRNOTADEV, CHAVEDEV} = dadosDevolucao[0];
    
	let venda = {
		"DocType": "dDocument_Items",
		"U_ID_VENDA_PDV": `${registro.IDVENDA}-R`,
		"DocDate": registro.DTHORAFECHAMENTO,
		"DocDueDate": registro.DTHORAFECHAMENTO,
		"CardCode": retCardCode[0].U_IS_PN_SAIDA,
		"DocTotal": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF),
		"Comments": `NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave ${registro.PROTNFE_INFPROT_CHNFE}, com erro, substituida por essa NFe. Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} anulados pela NFe de devolucao ${NRNOTADEV}.`,
		"JournalMemo": `NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave ${registro.PROTNFE_INFPROT_CHNFE}, com erro, substituida por essa NFe. Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} anulados pela NFe de devolucao ${NRNOTADEV}.`,
		"ClosingRemarks": `NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave ${registro.PROTNFE_INFPROT_CHNFE}, com erro, substituida por essa NFe. Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} anulados pela NFe de devolucao ${NRNOTADEV}.`,
		"U_IS_NATOPNFE": `NFe Substituta - Norma Especifica`,
		"PaymentGroupCode": 93,
		"SalesPersonCode": 8, 
		"TaxDate": registro.DTHORAFECHAMENTO,
		"Project": "PDV_SOFTQUALITY",
		"BPL_IDAssignedToInvoice": registro.IDEMPRESA,
		"SequenceCode": -2,
		"SequenceSerial": registro.NUMERONOTAVENDA55,
        "U_ChaveAcesso": registro.CHAVEVENDA55,
        "SeriesString": '0',
        "SequenceModel": "39", 
		"U_finNfe": 3,
		"U_finNf3": 3,
        "U_SituacaoDocumento": "08",
        "U_SKILL_CODSIT": "08", // 00 - Documento Regular ; 03 - Escrituração extemporânea de documento cancelado
        "U_SKILL_FormaPagto": "90", // Forma de pagamento
        "U_SKILL_IND_PGTO": 9,
        "U_Royalties": "Y",
		"DocumentLines": obterLinhasDoDetalhe(registro.IDVENDA, registro.ESTOQUECODIGO, parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)),
		"TaxExtension": {
		    "Incoterms": registro.NFE_INFNFE_TRANSP_MODFRETE,
		    "MainUsage": 38
		}
	}
	
	return venda;
}

function getDadosVenda(idvenda) {
    let query = ` 
        SELECT
            TBV.IDVENDA, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-mm-DD') AS DTHORAFECHAMENTO, 
            TO_VARCHAR(CURRENT_DATE,'YYYY-mm-DD') AS DATA_ATUAL,
            TBV.IDEMPRESA,
            TBE.CODPARCEIRO,
            TBE.ESTOQUECODIGO,
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF,
            TBV.NFE_INFNFE_IDE_NNF,
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
            TBV.IDCAIXAWEB,
            TBV.NFE_INFNFE_IDE_DHEMI,
            TBV.NFE_INFNFE_IDE_SERIE,
            TBV.PROTNFE_INFPROT_CHNFE,
            TBV.PROTNFE_INFPROT_NPROT,
            TBV.PROTNFE_INFPROT_CSTAT,
            TBV.PROTNFE_INFPROT_XMOTIVO,
            TBV.NFE_INFNFE_TRANSP_MODFRETE,
            TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF,
            TBVR.DOCENTRYDEV,
            TBVR.DOCENTRYVENDA65,
            TBVR.NUMERONOTADEV,
            TBVR.CHAVEDEV,
            TBVR.NUMERONOTAVENDA55,
            TBVR.CHAVEVENDA55
        FROM 
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        INNER JOIN VENDAS_REINTEGRACAO_TEMPORARIA TBVR ON 
        	TBV.IDVENDA = TBVR.IDVENDA
        WHERE 
            1 = ? 
            AND TBV.NFE_INFNFE_IDE_DHEMI IS NOT NULL
            AND TBV.IDVENDA = '${idvenda}'
    `; 
    
	let response = api.sqlQuery(query, 1);
	return response[0];
}

function gerarVendaSubstituta(idvenda, session, conn){
    let registro = getDadosVenda(idvenda);
	
	let retornoVendaSap = validaMigracaoVenda(registro, session, conn);
	
	if(!retornoVendaSap) {
    	let jsonVenda = montarJsonVenda(registro);
        //return jsonVenda;
        return postSl(jsonVenda, registro, session, conn);
	} else {
	    return true;
	}
}