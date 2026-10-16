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
            DOCENTRYVENDA55AJUSTE = ?
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
            A."DocEntry" as DOCENTRYVENDA55
        FROM 
            ${dbNameSAP}.OINV A
        INNER JOIN ${dbNameSAP}.INV12 B ON 
            A."DocEntry" = B."DocEntry"
        WHERE 
            1 = ? 
            AND A."U_ID_VENDA_PDV" = '${registro.IDVENDA}-R'
            AND A."U_finNfe" = '3'
            AND A."U_SKILL_CODSIT" = '08'
            AND A."CANCELED" = 'N'
            AND A."SeqCode" = '-2'
            AND B."MainUsage" = 61
    `;
    
    let resultMigracao = api.sqlQuery(queryValidaMigracao, 1);
    
    if(resultMigracao.length > 0){
       atualizaMigracaoVenda(registro.IDVENDA, resultMigracao[0].DOCENTRYVENDA55, conn);
       return true;
       //return referenciarNotaSubstituta(registro, resultMigracao[0].DOCENTRYVENDA55, session, conn);
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
        return response;
        return false;
   }
   
    return validaMigracaoVenda(registro, session, conn);
}

function obterLinhasDoDetalhe(idVenda, estqCodEmpresa, vDesc, vTotalVenda) {
    let query = `
        SELECT
            (SUM(A.VDESC) / SUM(A.VPROD)) * 100 AS PORCENTAGEMDESCONTO,
            SUM(A.VPROD) AS VALORBRUTO
        FROM 
        	"VAR_DB_NAME".VENDADETALHE A
        WHERE 
        	1 = ?
        	AND A.STCANCELADO = 'False'
        	AND A.IDVENDA = '${idVenda}'
    `;

    let linhas = api.sqlQuery(query, 1);
    let dados = linhas[0];
        
    return [{
        "LineNum": 0,
        "ItemCode": "020891",
        "Quantity": 1,
        "UnitPrice": Number(dados.VALORBRUTO),
        "WarehouseCode": estqCodEmpresa.toString(),
        "CostingCode": "ALOCREC",
        "ProjectCode": "PDV_SOFTQUALITY",
        "Usage": 61,
        "DiscountPercent": Number(dados.PORCENTAGEMDESCONTO)
    }];
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
		"DocDate": registro.DATA_ATUAL,
		"DocDueDate": registro.DATA_ATUAL,
		"CardCode": retCardCode[0].U_IS_PN_SAIDA,
		"Comments": `NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave ${registro.PROTNFE_INFPROT_CHNFE}, com erro, substituida por essa NFe. Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} anulados pela NFe de devolução ${NRNOTADEV}.`,
		"JournalMemo": `NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave ${registro.PROTNFE_INFPROT_CHNFE}, com erro, substituida por essa NFe. Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} anulados pela NFe de devolução ${NRNOTADEV}.`,
		"ClosingRemarks": `NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave ${registro.PROTNFE_INFPROT_CHNFE}, com erro, substituida por essa NFe. Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} anulados pela NFe de devolução ${NRNOTADEV}.`,
		"U_IS_NATOPNFE": `NFe Substituta - Norma Especifica`,
		"PaymentGroupCode": 93,
		"SalesPersonCode": 8, 
		"TaxDate": registro.DATA_ATUAL,
		"Project": "PDV_SOFTQUALITY",
		"BPL_IDAssignedToInvoice": registro.IDEMPRESA,
		"SequenceCode": -2,
		"SequenceSerial": registro.NUMERONOTAVENDA55,
        "U_ChaveAcesso": registro.CHAVEVENDA55,
        "SeriesString": '0',
        "SequenceModel": "39", 
		"U_finNfe": 3,
        "U_SKILL_CODSIT": "08", // 00 - Documento Regular ; 03 - Escrituração extemporânea de documento cancelado
        "U_SKILL_FormaPagto": "90", // Forma de pagamento
		"DocumentLines": obterLinhasDoDetalhe(registro.IDVENDA, registro.ESTOQUECODIGO, parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)),
		"TaxExtension": {
		    "Incoterms": registro.NFE_INFNFE_TRANSP_MODFRETE,
		    "MainUsage": 61
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