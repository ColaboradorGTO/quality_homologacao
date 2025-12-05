let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.devolucao.devolucao-nfe-55.jobs.libs`;

let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer.devolucao`, "api");
let libRefDevolucao = $.import(filePathLibs, "referencia-nota-devolucao-55");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

let conn;

function postSl(data, session, idVenda, CHAVENFE) {
    let response = slApi.post('/CreditNotes',data,session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar integrar a devolução';
        
        errorLogDevolucaoNFE(idVenda, msgReturnError)
        
        return false;
    }
    
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVenda);
    
    if(docEntryDevolucao > 0){
        return successLogDevolucaoNFE(idVenda, CHAVENFE);
    }
    
    return false;
}

function successLogDevolucaoNFE(idVenda, CHAVENFE){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDA"
        SET 
            ERRORLOGSAP = null,
            TXTDEVOLUCAO = 'DEVOLUCAO GERADA NO SAP, FALTA REFERENCIAR, MOTIVO NO CAMPO: TXTOBSCORRECAOCONTINGENCIA',
            TXTOBSCORRECAOCONTINGENCIA = (
                SELECT 
                    ('Devolucao de Nota NFE(55) gerada em duplicidade no SAP. Gerou uma NFE(55) porem já existia uma NFCE(65) gerada, Chave_NFE(55): ' || '${CHAVENFE}' || ' , DATA_HORA: ' || CURRENT_TIMESTAMP) 
                FROM 
                    DUMMY
            )
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(idVenda));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return true;
} 

function errorLogDevolucaoNFE(idVenda, msg_Error){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDA"
        SET 
            ERRORLOGSAP = ?
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(msg_Error));
	pStmt.setString(2, String(idVenda));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
} 

function getDocEntryDevolucaoSAP(idVenda){
    let query = `
        SELECT 
            T1."DocEntry"
        FROM 
            ${dbNameSAP}.ORIN T1
        WHERE
            T1."CANCELED" = 'N' AND 
            T1."U_ID_VENDA_PDV" = ?
    `;
	
	let regDocEntry = api.sqlQuery(query, idVenda);

    if(regDocEntry.length){
        return Number(regDocEntry[0].DocEntry || 0);
    }
    
    return false;
}

function fnGeraDevolucaoNoSap(idVenda, dadosDevolucao, session, CHAVENFE){
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVenda);

    if(!docEntryDevolucao){
        return postSl(dadosDevolucao, session, idVenda, CHAVENFE)
    }
    
    return true;
}

function getDocEntryRefDevolucaoSAP(docEntryDevolucao, idVenda){
    let queryValidaRefDevolucao = `
        SELECT
            "U_DocEntry"  as DOC_ENTRY_DEV
        FROM 
            ${dbNameSAP}."@SKL40DCREF"
        WHERE
            "U_DocEntry" = ?
            AND "U_DocExt" IN(
                SELECT 
                    T1."U_ChaveAcesso" AS CHNFE
                FROM
                    ${dbNameSAP}.OINV T1
                WHERE
                    T1."CANCELED" = 'N' AND 
                    T1."U_ID_VENDA_PDV" = '${idVenda}'
            )
    `;
    
    let resultRefDevolucao = api.sqlQuery(queryValidaRefDevolucao, docEntryDevolucao);
    
    if(resultRefDevolucao.length){
        return Number(regDocEntry[0].DOC_ENTRY_DEV || 0);
    }
    
    return false;
}

function fnReferenciarDevolucaoNoSap(idVenda, session){
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVenda);
    let resultRefDevolucao = getDocEntryRefDevolucaoSAP(docEntryDevolucao, idVenda);
    
    if(!resultRefDevolucao){
        return libRefDevolucao.referenciarDevolucao(idVenda, session, conn);
    }
    
    return true;
}

function getSeqCode(idEmpresa){
    let query = `
        SELECT 
            "SeqCode" 
        FROM
            ${dbNameSAP}.NFN1
        WHERE
            "Locked" = 'N' AND
            "BPLId" = ?
    `;
	
	let regSeqCode = api.sqlQuery(query, idEmpresa);

    return Number(regSeqCode[0].SeqCode);
}

function getDocEntry(idVenda){
    let query = `
        SELECT 
            T1."DocEntry",
            T1."U_ChaveAcesso" AS CHNFE
        FROM
            ${dbNameSAP}.OINV T1
        WHERE
            T1."CANCELED" = 'N' AND 
            T1."U_ID_VENDA_PDV" = ?
    `;
	
	let regDocEntry = api.sqlQuery(query, idVenda);
    
    return Number(regDocEntry[0].DocEntry);
}

function obterLinhasDoDetalhe(idVenda, estqCodEmpresa, vDesc, vTotalVenda) {
    let docLine;
    
    let query = `
        SELECT  
            TBVD.IDVENDADETALHE,  
            TBVD.CPROD,  
            TBVD.QTD,  
            TBVD.VPROD,  
            TBP.NUCODBARRAS,  
            TBVD.VUNCOM,  
            TBVD.VDESC,  
            TBVD.CFOP,  
            ROUND(TBVD.ICMS_PICMS,2) AS ICMS_PICMS,  
            ROUND(IFNULL(TBVD.IPI_PIPI,0),2) AS IPI_PIPI,  
            ROUND(TBVD.PIS_PPIS,2) AS PIS_PPIS,  
            ROUND(TBVD.COFINS_PCOFINS,2) AS COFINS_PCOFINS,  
            IFNULL(TBVD.ICMS_CST, '') AS ICMS_CST,  
            IFNULL(TBVD.IPI_CST, '') AS IPI_CST,  
            IFNULL(TBVD.PIS_CST, '') AS PIS_CST,  
            IFNULL(TBVD.COFINS_CST, '') AS COFINS_CST,  
            TO_VARCHAR(TBV.DTHORAFECHAMENTO, 'YYYY-MM-DD') AS DTHORAFECHAMENTO
        FROM
            "VAR_DB_NAME".VENDA TBV 
        INNER JOIN "VAR_DB_NAME".VENDADETALHE TBVD ON 
            TBV.IDVENDA = TBVD.IDVENDA
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON 
            TBP.IDPRODUTO = TBVD.CPROD    
        WHERE 
            TBV.IDVENDA = '${idVenda}'
            AND 1 = ?
    `;

    let linhas = api.sqlQuery(query, 1);

    let lines = [];

    for (let i = 0; i < linhas.length; i++) {
        let det = linhas[i];
        
        let queryImposto = `
            SELECT 
                CASE 
                    WHEN CAST('${det.DTHORAFECHAMENTO}' AS DATE) < '01.06.2023' THEN "U_IS_COD_IMPOSTO"
                    ELSE "U_IS_COD_IMPOSTO_NOVO" 
                END AS  U_IS_COD_IMPOSTO
            FROM 
                ${dbNameSAP}."@IS_IMPOSTO_PDV"
            WHERE 
                "U_IS_ICMS" = ?
                AND "U_IS_IPI" = ${det.IPI_PIPI}
                AND "U_IS_PIS" = ${det.PIS_PPIS}
                AND "U_IS_COFINS" = ${det.COFINS_PCOFINS}
                AND IFNULL("U_IS_ICMS_CST", '') = '${det.ICMS_CST}'
                AND IFNULL("U_IS_IPI_CST", '') =  '${det.IPI_CST}'
                AND IFNULL("U_U_PIS_CST", '') =  '${det.PIS_CST}'
                AND IFNULL("U_U_COFINS_CST", '') =  '${det.COFINS_CST}'
                AND "U_IS_CFOP" = ${det.CFOP} 
        `;
        
        var retImposto = api.sqlQuery(queryImposto, det.ICMS_PICMS)
        
        if (vDesc === 0) {
            docLine = {
                "LineNum": i + 1,
                "TaxCode": retImposto[0].U_IS_COD_IMPOSTO,
                "ItemCode": det.CPROD,
                "Quantity": parseInt(det.QTD),
                "UnitPrice": parseFloat(det.VUNCOM),
                "WarehouseCode": estqCodEmpresa.toString(),
                "CostingCode": "ALOCREC",
                "ProjectCode": "PDV_SOFTQUALITY",
                "BarCode": det.NUCODBARRAS,
                "Usage": 38,
                "DiscountPercent": 0
            };
        } else {
            docLine = {
                "LineNum": i + 1,
                "TaxCode": retImposto[0].U_IS_COD_IMPOSTO,
                "ItemCode": det.CPROD,
                "Quantity": parseInt(det.QTD),
                "UnitPrice": parseFloat(det.VUNCOM),
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

function getVendas (idvendasFormatados) {
    let query =` 
            SELECT TOP 50
                tbv.IDVENDA, 
                tbv.NFE_INFNFE_EMIT_ENDEREMIT_UF,
                TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD/mm/YYYY') AS DTHORAFECHAMENTO, 
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
                TBO."Serial" AS NRNOTANFE,
                TBO."SeriesStr" AS SERIENFE,
                TBO."U_ChaveAcesso" AS CHAVENFE,
                tbv.PROTNFE_INFPROT_NPROT,
                tbv.PROTNFE_INFPROT_CSTAT,
                tbv.PROTNFE_INFPROT_XMOTIVO,
                tbv.NFE_INFNFE_TRANSP_MODFRETE,
                CAST(
                CASE
                    WHEN 
                        ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(tbv.DTHORAFECHAMENTO))) > 30 
                    THEN 
                        ADD_DAYS(TO_DATE(tbv.DTHORAFECHAMENTO), ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(tbv.DTHORAFECHAMENTO))) - 30)
                    ELSE 
                        TO_DATE(tbv.DTHORAFECHAMENTO)
                END AS varchar) AS DATA_ATUAL_DEVOLUCAO
                /*'2025-10-28' AS DATA_ATUAL_DEVOLUCAO*/
            FROM 
                "VAR_DB_NAME".VENDA tbv
            INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON 
                tbe.IDEMPRESA = tbv.IDEMPRESA
            INNER JOIN ${dbNameSAP}.OINV TBO ON 
                TBV.IDVENDA = TBO."U_ID_VENDA_PDV" AND TBV.SAP_DOCENTRY_CORRETO = TBO."DocEntry"
            WHERE 
            	1 = ? 
            	AND TBO."CANCELED" = 'N' 
            	AND TBO."Model" = '39'
            	AND TBV.STCANCELADO = 'False'
            	AND TBV.IDVENDA IN (${idvendasFormatados})
        `;
        
        query += `
            AND TO_DATE(TBV.DTHORAFECHAMENTO) >= '2024-12-01'
            AND TBV.IDVENDA IN(
                SELECT
                    B.IDVENDA 
                FROM
                    ${dbNameSAP}.OINV A
                INNER JOIN "VAR_DB_NAME".VENDA B ON 
                    A.U_ID_VENDA_PDV = B.IDVENDA 
                LEFT JOIN ${dbNameSAP}.ORIN C ON 
                    A.U_ID_VENDA_PDV = C.U_ID_VENDA_PDV 
                WHERE
                    A.CANCELED = 'N'
                    AND C.U_ID_VENDA_PDV IS NULL
                    AND A."Model" = 39
                    AND B.PROTNFE_INFPROT_CSTAT = 100 
                    AND ifnull(B.PROTNFE_INFPROT_NPROT, '') <> ''
                    AND IFNULL(B.PROTNFE_INFPROT_CHNFE, '') <> ''
                    AND B.STCANCELADO = 'False'
                    AND B.STCONTINGENCIA = 'False'
                    AND B.NFE_INFNFE_IDE_TPAMB = 1
                    AND B.NFE_INFNFE_IDE_MOD = 65
                    AND TO_DATE(B.DTHORAFECHAMENTO) >= '2024-12-01'
                ORDER BY 
                    B.DTHORAFECHAMENTO
            )
            ORDER BY TBV.DTHORAFECHAMENTO
        `;
        
        //return query;
        return api.sqlQuery(query, 1);
}

function verificarData(uf, data) {
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

function montarJsonDevolucao (registro) {
    
    let data = verificarData(registro.NFE_INFNFE_EMIT_ENDEREMIT_UF, registro.DATA_ATUAL_DEVOLUCAO);
    let retCardCode = api.sqlQuery(`select "U_IS_PN_SAIDA" from ${dbNameSAP}.OBPL WHERE "BPLId" = ?`, registro.IDEMPRESA); 
    
    return {
            "DocType": "dDocument_Items",
            "U_ID_VENDA_PDV": registro.IDVENDA,
            "DocDate": data,
            "DocDueDate": data,
            "CardCode": retCardCode[0].U_IS_PN_SAIDA,
            "Comments": "Integração Quality - Devolução para cancelamento venda com nota duplicada - " + registro.IDVENDA,
            "JournalMemo": "Integração Quality - Devolução para cancelamento venda com nota duplicada",
            "OpeningRemarks": `Devolucao NF ${registro.NRNOTANFE} Serie: ${registro.SERIENFE} Chave: ${registro.CHAVENFE}`,
            "ClosingRemarks": `Devolucao NF ${registro.NRNOTANFE} Serie: ${registro.SERIENFE} Chave: ${registro.CHAVENFE}`, 
            "TaxDate": data,
            "Project": "PDV_SOFTQUALITY",
            "BPL_IDAssignedToInvoice": registro.IDEMPRESA,
            "SequenceCode": getSeqCode(registro.IDEMPRESA),
            "SequenceModel": "39",
            "GroupNum": 93,
            "U_finNfe": 4,
            "U_SKILL_FormaPagto": 90,
            "PeyMethod": null,
            "U_Classification": 999, //Parametro para não duplicar a entrada no estoque(999)
            "DocumentLines": obterLinhasDoDetalhe(registro.IDVENDA, registro.ESTOQUECODIGO, parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC), parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)),
            "TaxExtension": {
                "Incoterms": registro.NFE_INFNFE_TRANSP_MODFRETE,
                "MainUsage": 38
            },
            "DocumentReferences": [
                {
                    "RefDocEntr": getDocEntry(registro.IDVENDA),
                    "RefObjType": "rot_SalesInvoice"
                }
            ]
        };
}

function executeGerarDevolucao(connDB, session, idvendas){

    if(!idvendas.length) {
        return 'Favor enviar os id das vendas!';
    }
    
    const idvendasFormatados = idvendas.map(idvenda => `'${idvenda.trim()}'`).join(", ");
    
    let arrayVendasDevolucao = getVendas(idvendasFormatados);
    //return arrayVendasDevolucao;
    
    if(!arrayVendasDevolucao.length) {
        return 'Dados não Encontrados, venda cancelada ou já feito o processo de devolucao!';
    }
    
    for(let registro of arrayVendasDevolucao) {
    
        conn = connDB;
        
        let dadosDevolucao = montarJsonDevolucao(registro);
        //return dadosDevolucao;
        
        if(dadosDevolucao["DocumentLines"].length == 0){
            errorLogDevolucaoNFE(registro.IDVENDA, 'Devolucao não realizada, venda sem produtos!');
            
            if(stMsgRetorno) {
                return {
                    msg: 'Devolucao não realizada, venda sem produtos!'
                }
            }
            
        } else {
            if(fnGeraDevolucaoNoSap(registro.IDVENDA, dadosDevolucao, session, registro.CHAVENFE)){
                
                if(!fnReferenciarDevolucaoNoSap(registro.IDVENDA, session)){
                    if(stMsgRetorno) {
                        return {
                            msg: 'Devolucao não referenciada no SAP, não foi possivel gerar a devolução da venda no SAP, verifique o campo ERRORLOGSAP!'
                        }
                    }
                }
            } else {
                if(stMsgRetorno) {
                    return {
                        msg: 'Devolucao não realizada, não foi possivel gerar a devolução da venda no SAP, verifique o campo ERRORLOGSAP!'
                    } 
                }
            } 
        }
    }
    
    return {
        msg: 'Devoluções Realizadas Com Sucesso!'
    };
    
}