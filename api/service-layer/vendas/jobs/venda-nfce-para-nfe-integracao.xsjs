let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let dbNameSAP = 'SBO_GTO_TESTE4'

let conn;

function ajustarDataDentroDos30Dias(dataOriginal) {
    return `2025-07-30`;
    let [ano, mes, dia] = dataOriginal.split("-").map(Number);
    
    let dataHora = new Date(ano, mes - 1, dia); 
    let agora = new Date();
    let limite = new Date();
    let novaData = '';
    
    dataHora.setHours(0, 0, 0, 0);
    agora.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);
    limite.setDate(agora.getDate() - 30);
    
    if(dataHora < limite){
        novaData = new Date();
        novaData.setDate(agora.getDate() - 29);
        
        dataHora = novaData;
    }
    
    ano = dataHora.getFullYear();
    mes = String(dataHora.getMonth() + 1);
    dia = String(dataHora.getDate());
    
    mes = mes.length < 2 ? ('0' + mes) : mes;
    dia = dia.length < 2 ? ('0' + dia) : dia;
    
    return `${ano}-${mes}-${dia}`;
}

function errorLogVenda(idVenda, p_Error){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA"
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDVENDA = ? 
    `;

	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(query));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setString(2, idVenda);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	
	conn.commit();

	return 'False';
}

function atualizaMigracaoVenda(idVenda, idSap, idSapDocEntry){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET
            SAP_DOCENTRY = ?,
            SAP_DOCENTRY_CORRETO = ?,
            STCONTINGENCIA = 'False',
            ERRORLOGSAP = NULL,
            TXTOBSCORRECAOCONTINGENCIA = (SELECT (TO_VARCHAR(CURRENT_TIMESTAMP) || ' Venda NFCE Transformada Para NFE(55) Chave: ') FROM DUMMY)
		WHERE 
		    IDVENDA = ?
    `;
	
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(query));

	pStmtUpdate.setInt(1, parseInt(idSap));
	pStmtUpdate.setInt(2, parseInt(idSapDocEntry));
	pStmtUpdate.setString(3, idVenda);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();

	conn.commit();
	
	return 'True';
}

function validaMigracaoVenda(idVenda){
    let queryValidaMigracao = `
        SELECT 
            "DocEntry" as IDSAP_DOCENTRY, 
            "DocNum" as IDSAP 
        FROM 
            ${dbNameSAP}.OINV 
        WHERE 
            1 = ? 
            AND "U_ID_VENDA_PDV" = '${idVenda}'
            AND "CANCELED" = 'N'
    `;
    
    let resultMigracao = api.sqlQuery(queryValidaMigracao, 1);
    
    if(resultMigracao.length > 0){
       return atualizaMigracaoVenda(idVenda, resultMigracao[0].IDSAP, resultMigracao[0].IDSAP_DOCENTRY);
    }
    
    return 'False';
}

function postSl(data, session, idVenda) {
   let response = slApi.post('/Invoices',data,session);
   
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        
        return errorLogVenda(idVenda, (response.error.message.value || 'Erro ao integrar a venda'));
   }
   
    return validaMigracaoVenda(idVenda);
}

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

function excuteVendaNaoIntegradaNfceParaNfe(byId){
    let dataInicio = $.request.parameters.get("dataInicio");
    let dataFim = $.request.parameters.get("dataFim");
    let ajustarData = $.request.parameters.get("ajustarData") || 'False';
    
    let query = ` 
        SELECT TOP 50
            TBV.IDVENDA, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'DD/MM/YYYY') AS DTHORAFECHAMENTO, 
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
            TBV.NFE_INFNFE_TRANSP_MODFRETE
        FROM 
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        WHERE 
            1 = ? 
            /*AND TBE.SGUF = 'MG'*/
            AND TBV.PROTNFE_INFPROT_CSTAT <> 100  
            AND TBV.STCANCELADO = 'False' 
            AND TBV.STCONTINGENCIA = 'True'
            AND IFNULL(TBV.SAP_DOCENTRY, 0) = 0
            AND (TO_DATE(TBV.DTHORAFECHAMENTO) >= '2024-01-01' AND TO_DATE(TBV.DTHORAFECHAMENTO) <= '2025-10-28'/*ADD_DAYS(CURRENT_DATE, -2)*/)
            AND TBV.NFE_INFNFE_IDE_DHEMI IS NOT NULL
            AND IFNULL(TBV.ERRORLOGSAP,'') = ''
            AND NOT EXISTS (
                SELECT 
                    1 
                FROM 
                    ${dbNameSAP}.OINV XA 
                WHERE  
                    XA.CANCELED = 'N' AND 
                    XA."BPLId" = TBV.IDEMPRESA AND  
                    XA."Serial" = TBV.NFE_INFNFE_IDE_NNF AND 
                    XA."SeriesStr" = TO_VARCHAR(TBV.NFE_INFNFE_IDE_SERIE) 
            )
    `; 
    
    if(byId){
        // retirar a clausula de UF = GO acima
        query += ` AND TBV.IDVENDA = '${byId}' `;
    }
    
    query += ' ORDER BY TBV.DTHORAFECHAMENTO ';
    
	let response = api.sqlQuery(query, 1);
	let session;
	
	for (let i = 0; i < response.length; i++) {
        let registro = response[i];
        let dataEmissaoVenda = registro.NFE_INFNFE_IDE_DHEMI;
        
        if(ajustarData == 'True'){
            dataEmissaoVenda = ajustarDataDentroDos30Dias(dataEmissaoVenda);
        }
        
        if(i === 0){
            conn = $.db.getConnection();
            session = slApi.loginServiceLayer(true);
            
            slApi.loginServiceLayer(true);
        } 
        
        let retCardCode = api.sqlQuery(`SELECT "U_IS_PN_SAIDA" FROM ${dbNameSAP}.OBPL WHERE "BPLId" = ? `, registro.IDEMPRESA); 
        let retSequenceCode = api.sqlQuery(`SELECT "SeqCode" AS SEQCOD FROM ${dbNameSAP}.NFN1 WHERE "Model" = 39 AND "Locked" = 'N' AND "BPLId" = ? `, registro.IDEMPRESA);
        
		let venda = {
			"DocType": "dDocument_Items",
			"U_ID_VENDA_PDV": registro.IDVENDA,
			"DocDate": dataEmissaoVenda,
			"DocDueDate": dataEmissaoVenda,
			"CardCode": retCardCode[0].U_IS_PN_SAIDA,
			"DocTotal": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF),
			"Comments": `Ref a Venda em Contigencia nao enviada a Sefaz NFCE ${registro.NFE_INFNFE_IDE_NNF} Serie ${registro.NFE_INFNFE_IDE_SERIE} IDVENDA: ${registro.IDVENDA}`,
			"JournalMemo": `Ref a Venda em Contigencia nao enviada a Sefaz NFCE ${registro.NFE_INFNFE_IDE_NNF} Serie ${registro.NFE_INFNFE_IDE_SERIE} IDVENDA: ${registro.IDVENDA}`,
			"ClosingRemarks": `Ref a Venda em Contigencia nao enviada a Sefaz NFCE ${registro.NFE_INFNFE_IDE_NNF} Serie ${registro.NFE_INFNFE_IDE_SERIE} IDVENDA: ${registro.IDVENDA}`,
			"PaymentGroupCode": 93,
			"SalesPersonCode": 8, 
			"TaxDate": dataEmissaoVenda,
			"Project": "PDV_SOFTQUALITY",
			"BPL_IDAssignedToInvoice": registro.IDEMPRESA,
			"SequenceCode": retSequenceCode[0].SEQCOD,
            "U_SituacaoDocumento": "00",
            "U_SKILL_FormaPagto": "01", // Forma de pagamento
			"DocumentLines": obterLinhasDoDetalhe(registro.IDVENDA, registro.ESTOQUECODIGO, parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)),
			"TaxExtension": {
			    "Incoterms": registro.NFE_INFNFE_TRANSP_MODFRETE,
			    "MainUsage": 38
			}
		};
        //return {venda}
        postSl(venda, session, registro.IDVENDA);
	}
	
	return 'Migração Venda Realizada Com Sucesso!';
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                let id = $.request.parameters.get("id");
                let docReturn = excuteVendaNaoIntegradaNfceParaNfe(id);
                
                $.response.setBody(JSON.stringify(docReturn));
                break;
                
            default:
                break;
        }
    } catch (e) {
        let detalheError = e.stack.split('\n');
        
        detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
        
        if(detalheError){
            detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
        }
        
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({
            message: e.message,
            detalheError
        }));
        $.response.status = 400;
    }
}