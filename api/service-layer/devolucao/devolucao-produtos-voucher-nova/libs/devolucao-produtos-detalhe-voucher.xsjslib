let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");
let errorLib = $.import(`${filePath}.service-layer.common`, "error");

function successLogDevolucaoVenda(idVoucher, docEntryDev, conn){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = null,
            STDEVOLUCAO = 'True',
            DTHORADEVOLUCAO  = now(),
            STDEVOLUCAOSAP = 'True',
            DOCENTRYDEVSAP = ?
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setInt(1, Number(docEntryDev));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function errorLogDevolucaoVenda(idVoucher, p_Error, conn){
    let query = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = ?,
            STDEVOLUCAO = 'False',
            DTHORADEVOLUCAO  = now(),
            STDEVOLUCAOSAP = 'False'
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, String(p_Error));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function postSl(data, session, idVoucher) {
    if(data) {
        let resultDevolucao;
        let conn = $.db.getConnection();
        
        let response = slApi.post('/CreditNotes',data,session);
        
        if(response.status != 204){
            response = JSON.parse(response.body.asString());
            
            let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar integrar a devolução';
            errorLogDevolucaoVenda(idVoucher, msgReturnError, conn);
            
            
           // return response;
            return false;
        }
        
        let queryValidaDevolucao = `
            SELECT
                "DocEntry" as DOC_ENTRY_DEV
            FROM 
                ${dbNameSAP}.ORIN
            WHERE
                "CANCELED" = 'N'
                AND "U_ID_VENDA_PDV" = ?
        `;
        
        resultDevolucao = api.sqlQuery(queryValidaDevolucao, idVoucher);
        
        if(resultDevolucao.length > 0){
            let docEntryDev = Number(resultDevolucao[0].DOC_ENTRY_DEV);
            
            successLogDevolucaoVenda(idVoucher, docEntryDev, conn);
            
            return true;
        }
        
        errorLogDevolucaoVenda(idVoucher, 'Erro ao tentar integrar a devolução', conn);
        
        return false;
        
    } else {
        return false;
    }
    
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
            T1."DocEntry"
        FROM
            ${dbNameSAP}.OINV T1
        WHERE
            T1."CANCELED" = 'N' AND 
            T1."U_ID_VENDA_PDV" = ?
    `;
	
	let regDocEntry = api.sqlQuery(query, idVenda);

    return Number(regDocEntry[0].DocEntry);
}

function getCardCodeCliente(idCliente){
    let queryCliente = `
        SELECT 
            IDCLIENTESAP
        FROM
            "VAR_DB_NAME".CLIENTE
        WHERE
            IDCLIENTE= ?
    `;
	
	let regCliente = api.sqlQuery(queryCliente, idCliente);
    
    return regCliente[0].IDCLIENTESAP
}

function obterLinhasDoDetalhe(idVoucher, estqCodEmpresa, vDesc, vTotalVenda) {
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
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
            TBR.IDRESUMOVENDAWEB  = TBV.IDVENDA 
        INNER JOIN "VAR_DB_NAME".VENDADETALHE TBVD ON 
            TBV.IDVENDA = TBVD.IDVENDA AND TBR.IDVOUCHER = TBVD.IDVOUCHER 
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON 
            TBP.IDPRODUTO = TBVD.CPROD    
        WHERE 
            TBR.IDVOUCHER = '${idVoucher}'
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
                "SBO_GTO_PRD"."@IS_IMPOSTO_PDV"
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

function gerarDevolucaoVenda(idVoucher) {
    let query = `
        SELECT
            TBR.IDVOUCHER,
            TBR.NUVOUCHER,
            TBV.IDVENDA,  
            TO_DATE(TBV.DTHORAFECHAMENTO) AS DTHORAFECHAMENTO,  
            TBV.IDEMPRESA, 
            TBE.CODPARCEIRO, 
            TBE.ESTOQUECODIGO, 
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF, 
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VDESC,  
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VPROD,  
            TBV.IDCAIXAWEB, 
            TBV.NFE_INFNFE_IDE_DHEMI, 
            TBV.NFE_INFNFE_IDE_SERIE AS SERIE,
            TBV.NFE_INFNFE_IDE_NNF AS NNF,
            TBV.PROTNFE_INFPROT_CHNFE AS CHAVENFE, 
            TBV.PROTNFE_INFPROT_NPROT, 
            TBV.PROTNFE_INFPROT_CSTAT, 
            TBV.PROTNFE_INFPROT_XMOTIVO, 
            TBV.NFE_INFNFE_TRANSP_MODFRETE,  
            TO_DATE(TBR.DTINVOUCHER) AS DATA_VOUCHER,
            TBR.MOTIVOTROCA,
            TBR.IDCLIENTE
        FROM 
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON
            TBR.IDRESUMOVENDAWEB = TBV.IDVENDA
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        WHERE 
            TBR.IDVOUCHER = '${idVoucher}'
            AND 1 = ?
    `;

    let response = api.sqlQuery(query, 1);
    let session;

    for (let i = 0; i < response.length; i++) {
        
        let registro = response[i];
        let idCliente = registro.IDCLIENTE;
        
        let cardCode = getCardCodeCliente(idCliente); 
        
        let dadosDevolucao = {
            "DocType": "dDocument_Items",
            "U_ID_VENDA_PDV": registro.IDVOUCHER,
            "DocDate": registro.DATA_VOUCHER,
            "DocDueDate": registro.DATA_VOUCHER,
            "CardCode": cardCode,
            "Comments": `Ref a Dev Mercadoria Voucher n. ${registro.NUVOUCHER}  IDVENDA ${registro.IDVENDA}`,
            "JournalMemo": `Ref a Dev Mercadoria Voucher n. ${registro.NUVOUCHER}  IDVENDA ${registro.IDVENDA}`,
            "OpeningRemarks": `Devolucao NF ${registro.NNF} Serie: ${registro.SERIE} Chave: ${registro.CHAVENFE}`,
            "ClosingRemarks": `Devolucao NF ${registro.NNF} Serie: ${registro.SERIE} Chave: ${registro.CHAVENFE}`,     
            "TaxDate": registro.DATA_VOUCHER,
            "Project": "PDV_SOFTQUALITY",
            "BPL_IDAssignedToInvoice": registro.IDEMPRESA,
            "SequenceCode": getSeqCode(registro.IDEMPRESA),
            "SequenceModel": "39",
            "GroupNum": 93,
            "U_finNfe": 4,
            "U_IS_NATOPNFE": "Devolução de venda de mercadoria adquirida ou recebida de terceiros",
            "U_SKILL_FormaPagto": 90,
            "PeyMethod": null,
            "U_Classification": 999, //Parametro para não duplicar a entrada no estoque(999)
            "DocumentLines": obterLinhasDoDetalhe(registro.IDVOUCHER, registro.ESTOQUECODIGO, parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC), parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)),
            "TaxExtension": {
                "Incoterms": registro.NFE_INFNFE_TRANSP_MODFRETE,
                "MainUsage": 38
            }/*,
            "DocumentReferences": [
                {
                    "RefDocEntr": getDocEntry(registro.IDVENDA),
                    "RefObjType": "rot_SalesInvoice"
                }
            ]*/
        };
        
        if(i === 0){
		    session = slApi.loginServiceLayer(true);
		    slApi.loginServiceLayer(true);
		}
        
        return postSl(dadosDevolucao, session, idVoucher);
    }
    
}