var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.temp.reintegracao-vendas-ncm-retroativas.libs`;
var translate = $.import("quality.concentrador_homologacao.api.service-layer", "traducao-texto");
var errorLib = $.import("quality.concentrador_homologacao.api.service-layer.common", "error");
let libRefDevolucao = $.import(`${filePathLibs}.referenciacao`, "referenciar-nota-devolucao");
var dbNameSAP = "SBO_GTO_TESTE4";

function getDevolucaoSAP(idVenda){
    let query = `
        SELECT
            "U_ID_VENDA_PDV" AS IDVENDA,
            "DocEntry" AS DOCENTRY
        FROM 
            ${dbNameSAP}.ORIN
        WHERE
            "U_ID_VENDA_PDV" = ?
            AND "CANCELED" = 'N'
            AND "U_SKILL_CODSIT" = '08'
            AND "U_finNfe" = '4'
	        AND "U_finNf3" = '3'
            AND "U_SKILL_IND_PGTO" = '9'
            AND "SeqCode" = '-2'
    `;
    
    let dadosDev = api.sqlQuery(query, idVenda);
    
    if(dadosDev.length) return dadosDev[0];
    
    return false;
}

function postSl(data, registro, session, conn) {
    let response = slApi.post('/CreditNotes', data, session);
    let msg = 'Erro ao gerar a Devolucao no SAP';

    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        msg = response.error.message.value || msg;
        
        return false;
    }
    
    let retornoDevSap = getDevolucaoSAP(registro.IDVENDA);
    
    if(retornoDevSap){
        successLogDevolucaoVenda(registro.IDVENDA, retornoDevSap.DOCENTRY);
        return referenciarDevolucao(registro, retornoDevSap.DOCENTRY, session, conn)
    }
    
    return false;
}

function getDocEntryRefDevolucaoSAP(docEntryDevolucao){
    let queryValidaRefDevolucao = `
        SELECT
            A."U_DocEntry"  as DOC_ENTRY_DEV
        FROM 
            ${dbNameSAP}."@SKL40DCREF" A
        INNER JOIN ${dbNameSAP}."ORIN" B ON 
            A."U_DocEntry" = B."DocEntry"
        WHERE
            B."CANCELED" = 'N'
            AND A."U_DocEntry" = ?
    `;
    
    let resultRefDevolucao = api.sqlQuery(queryValidaRefDevolucao, docEntryDevolucao);
    
    if(resultRefDevolucao.length){
        return true;
    }
    
    return false;
}

function referenciarDevolucao(registro, docEntryDevolucao, session, conn){
    let resultRefDevolucao = getDocEntryRefDevolucaoSAP(docEntryDevolucao);
    
    if(!resultRefDevolucao){
        return libRefDevolucao.referenciarDevolucao(registro, docEntryDevolucao, session, conn, 'externa');
    }
    
    return true;
}

function successLogDevolucaoVenda(idvenda, docEntryDev){
    let conn = $.db.getConnection();
    
    let query = `
        UPDATE
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA"
        SET 
            DOCENTRYDEVEXTERNA = ?
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setInt(1, Number(docEntryDev));
	pStmt.setString(2, idvenda);
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function getRetCardCode(idEmpresa){
    let query = `
        SELECT 
            "U_IS_PN_SAIDA"
        FROM 
            "SBO_GTO_PRD".OBPL 
        WHERE 
            "BPLId" = ?
    `;
    
    return api.sqlQuery(query, idEmpresa);
}

function verificarData(uf, data) {
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

function montarDocLines(idVenda, estqCodEmpresa, vDesc, vTotalVenda) {

    var query = ' SELECT ' +
        '   t1.IDVENDADETALHE, ' +
        '   t1.CPROD, ' +
        '   t1.QTD, ' +
        '   t1.VPROD, ' +
        '   t2.NUCODBARRAS, ' +
        '   t1.VUNCOM, ' +
        '   t1.VDESC, ' +
        '   t1.CFOP, ' +
        '   ROUND(t1.ICMS_PICMS,2) AS ICMS_PICMS, ' +
        '   ROUND(IFNULL(t1.IPI_PIPI,0),2) AS IPI_PIPI, ' +
        '   ROUND(t1.PIS_PPIS,2) AS PIS_PPIS, ' +
        '   ROUND(t1.COFINS_PCOFINS,2) AS COFINS_PCOFINS, ' +
        '   IFNULL(t1.ICMS_CST,\'\') AS ICMS_CST, ' +
        '   IFNULL(t1.IPI_CST,\'\') AS IPI_CST, ' +
        '   IFNULL(t1.PIS_CST,\'\') AS PIS_CST, ' +
        '   IFNULL(t1.COFINS_CST,\'\') AS COFINS_CST, ' +
        '   TO_VARCHAR(t3.DTHORAFECHAMENTO,\'YYYY-mm-DD\') AS DTHORAFECHAMENTO ' +
        ' FROM  ' +
        '   "VAR_DB_NAME".VENDADETALHE t1  ' +
        '   INNER JOIN "VAR_DB_NAME".PRODUTO t2 ON t2.IDPRODUTO = t1.CPROD   ' +
        '   INNER JOIN "VAR_DB_NAME".VENDA t3 ON t3.IDVENDA = t1.IDVENDA   ' +
        '  WHERE t1.IDVENDA=? ';

    var linhas = api.sqlQuery(query, idVenda);

    var lines = [];

    for (var i = 0; i < linhas.length; i++) {
        var det = linhas[i];
        var queryImposto = 'select CASE WHEN CAST(\'' + det.DTHORAFECHAMENTO + '\' AS DATE) < \'01.06.2023\' THEN "U_IS_COD_IMPOSTO" ' +
            ' ELSE "U_IS_COD_IMPOSTO_NOVO" END AS  U_IS_COD_IMPOSTO' +
            ' from "SBO_GTO_PRD"."@IS_IMPOSTO_PDV" ' +
            ' WHERE "U_IS_ICMS" = ?' +
            ' AND "U_IS_IPI" = ' + det.IPI_PIPI +
            ' AND "U_IS_PIS" = ' + det.PIS_PPIS +
            ' AND "U_IS_COFINS" = ' + det.COFINS_PCOFINS +
            ' AND IFNULL("U_IS_ICMS_CST", \'\') = \'' + det.ICMS_CST + '\'' +
            ' AND IFNULL("U_IS_IPI_CST", \'\') =  \'' + det.IPI_CST + '\'' +
            ' AND IFNULL("U_U_PIS_CST", \'\') =  \'' + det.PIS_CST + '\'' +
            ' AND IFNULL("U_U_COFINS_CST", \'\') =  \'' + det.COFINS_CST + '\'' +
            ' AND "U_IS_CFOP" = ' + det.CFOP;
        // return queryImposto;
        var retImposto = api.sqlQuery(queryImposto, det.ICMS_PICMS)
        
        if (vDesc === 0) {
            var docLine = {
                "LineNum": i + 1,
                "TaxCode": retImposto[0].U_IS_COD_IMPOSTO,
                "ItemCode": det.CPROD,
                "Quantity": parseInt(det.QTD),
                "UnitPrice": parseFloat(det.VUNCOM),
                /*"Price": parseFloat(det.VPROD),*/
                "WarehouseCode": estqCodEmpresa.toString(),
                "CostingCode": "ALOCREC",
                "ProjectCode": "PDV_SOFTQUALITY",
                "BarCode": det.NUCODBARRAS,
                "Usage": 38,
                "DiscountPercent": 0
            };
        } else {
            //var vlDesconto = ((parseFloat(vDesc) / parseFloat(vTotalVenda)) * 100);
            var docLine = {
                "LineNum": i + 1,
                "TaxCode": retImposto[0].U_IS_COD_IMPOSTO,
                "ItemCode": det.CPROD,
                "Quantity": parseInt(det.QTD),
                "UnitPrice": parseFloat(det.VUNCOM),
                /*"DiscountPercent": vlDesconto,*/
                /*"Price": parseFloat(det.VPROD),*/
                "WarehouseCode": estqCodEmpresa.toString(),
                "CostingCode": "ALOCREC",
                "ProjectCode": "PDV_SOFTQUALITY",
                "BarCode": det.NUCODBARRAS,
                "Usage": 38,
                "DiscountPercent": ((parseFloat(det.VDESC) / parseInt(det.QTD)) / parseFloat(det.VUNCOM)) * 100,
            };
        }
        
        lines.push(docLine);
    }

    return lines;
}

function montarJson(registro){
    let retCardCode = getRetCardCode(registro.IDEMPRESA); 
    
    return {
        "DocType": "dDocument_Items",
        "U_ID_VENDA_PDV": registro.IDVENDA,
        "DocDate": registro.DTHORAFECHAMENTO,
        "DocDueDate": registro.DTHORAFECHAMENTO,
        "CardCode": retCardCode[0].U_IS_PN_SAIDA,
        "Comments": `Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave: ${registro.PROTNFE_INFPROT_CHNFE} Serie: ${registro.NFE_INFNFE_IDE_SERIE} anulados por essa nota fiscal de devolucao.`,
        "JournalMemo": `Reintegração quality - Devolução para cancelamento extemporâneo.`,
        "OpeningRemarks": `Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave: ${registro.PROTNFE_INFPROT_CHNFE} Serie: ${registro.NFE_INFNFE_IDE_SERIE} anulados por essa nota fiscal de devolucao.`,
        "ClosingRemarks": `Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave: ${registro.PROTNFE_INFPROT_CHNFE} Serie: ${registro.NFE_INFNFE_IDE_SERIE} anulados por essa nota fiscal de devolucao.`, 
        "U_infAdFisco": `Efeitos da NFCe ${registro.NFE_INFNFE_IDE_NNF} Chave: ${registro.PROTNFE_INFPROT_CHNFE} Serie: ${registro.NFE_INFNFE_IDE_SERIE} anulados por essa nota fiscal de devolucao.`, 
        "U_IS_NATOPNFE": `NFe Anulacao - Norma Especifica`,
        "TaxDate": registro.DTHORAFECHAMENTO,
        "Project": "PDV_SOFTQUALITY", 
        "BPL_IDAssignedToInvoice": registro.IDEMPRESA,
        "SequenceCode": -2,
        "SequenceSerial": registro.NUMERONOTADEV,
        "U_ChaveAcesso": registro.CHAVEDEV,
        "SeriesString": '0',
        "SequenceModel": "39",
        "GroupNum": 93,
        "U_finNfe": 4, // 3 - NF-e de ajuste ; 4 - Devolução de mercadorias
        "U_finNf3": 3,//NF3-e 66 - Finalidade. 3 - Normal com ajuste
        "U_SKILL_CODSIT": "08", // 00 - Documento Regular ; 03 - Escrituração extemporânea de documento cancelado
        "U_SKILL_IND_PGTO": 9, // Indicador de Pagamento. 9 - Outros/Sem pagamento
        "U_SKILL_FormaPagto": 90,
        "PeyMethod": null,
        "U_Classification": 999, //Parametro para não duplicar a entrada no estoque(999)
        "DocumentLines": montarDocLines(registro.IDVENDA, registro.ESTOQUECODIGO, parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC), parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)),
        "TaxExtension": {
            "Incoterms": registro.NFE_INFNFE_TRANSP_MODFRETE,
            "MainUsage": 38
        }
    };
}

function getDadosDev(idvenda) {
    let query = `
        SELECT
        	TBV.IDVENDA, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-mm-DD') AS DTHORAFECHAMENTO, 
            TO_VARCHAR(CURRENT_DATE,'YYYY-mm-DD') AS DATA_ATUAL, 
            TBV.IDEMPRESA,
            TBE.CODPARCEIRO,
            TBE.ESTOQUECODIGO,
            TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF,
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
            CURRENT_DATE AS DATA_ATUAL_DEVOLUCAO,
            tbvr.DOCENTRYVENDA65,
            ifnull(tbvr.DOCENTRYVENDA55, 0) AS DOCENTRYVENDA55,
            ifnull(tbvr.DOCENTRYDEV, 0) AS DOCENTRYDEV,
            TBVR.DOCENTRYVENDA65,
            TBVR.NUMERONOTADEV,
            TBVR.CHAVEDEV,
            TBVR.NUMERONOTAVENDA55,
            TBVR.CHAVEVENDA55
        FROM
        	"VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".VENDAS_REINTEGRACAO_TEMPORARIA TBVR ON 
        	TBV.IDVENDA = TBVR.IDVENDA
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
        	TBV.IDEMPRESA = TBE.IDEMPRESA
        WHERE 
        	1 = ?
        	AND TBVR.STPROCESSOFINALIZADO = 'False'
        	AND TBVR.IDVENDA = '${idvenda}'
    `
    
    let dadosVenda = api.sqlQuery(query, 1);
    return dadosVenda[0];
}

function gerarDevolucao(idvenda, session, conn) {
    let registro = getDadosDev(idvenda);
    let retornoDevSap = getDevolucaoSAP(registro.IDVENDA);
    
    if(retornoDevSap) {
        successLogDevolucaoVenda(registro.IDVENDA, retornoDevSap.DOCENTRY);
        return referenciarDevolucao(registro, retornoDevSap.DOCENTRY, session, conn)
    }
    
    let jsonDevolucao = montarJson(registro);
    //return jsonDevolucao;
    return postSl(jsonDevolucao, registro, session, conn);
}