let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePath}.service-layer.devolucao.devolucao-produtos-voucher.libs`;

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let libAtualizacaoCliente = $.import(filePathLibs, "atualizacao-cliente-devolucao-integrado");
let libDevolucao = $.import(filePathLibs, "devolucao-produtos-detalhe-voucher");
let libRefDevolucao = $.import(filePathLibs, "referencia-nota-devolucao-voucher");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");

let conn;

function fnAtualizarStatusDevolucaoResumoVoucher(idVoucher, docEntryDev){
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
	
	return true;
}

function fnAtualizarStatusREFDevolucaoResumoVoucher(idVoucher){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = null,
            ERRORLOGQUALITY = null,
            STREFDEVOLUCAOSAP  = 'True'
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setInt(1, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return true;
}

function errorLogDevolucaoVenda(idVoucher, msg_Error){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = ?
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(msg_Error));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return false;
} 

function getDocEntryDevolucaoSAP(idVoucher){
    let query = `
        SELECT 
            T1."DocEntry"
        FROM
            ${dbNameSAP}.ORIN T1
        WHERE
            T1."CANCELED" = 'N' AND 
            T1."U_ID_VENDA_PDV" = ?
    `;
	
	let regDocEntry = api.sqlQuery(query, idVoucher);

    if(regDocEntry.length){
        return Number(regDocEntry[0].DocEntry || 0);
    }
    
    return false;
}

function getDocEntryRefDevolucaoSAP(docEntryDevolucao, chaveNota){
    let queryValidaRefDevolucao = `
        SELECT
            "U_DocEntry"  as DOC_ENTRY_DEV
        FROM 
            ${dbNameSAP}."@SKL40DCREF"
        WHERE
            "U_DocExt" = '${chaveNota}'
            AND "U_DocEntry" = ?
    `;
    
    let resultRefDevolucao = api.sqlQuery(queryValidaRefDevolucao, docEntryDevolucao);
    
    if(resultRefDevolucao.length){
        return Number(regDocEntry[0].DocEntry);
    }
    
    return false;
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

function fnVerificarDadosIntegradosCliente(dadosCliente, session){
    let idEmpresa = false;
    let stAtualizar = false;
    let {
        IDCLIENTE,
        IDCLIENTESAP,
        DSNOMERAZAOSOCIAL,
        NUCPFCNPJ, 
        EENDERECO, 
        EBAIRRO,
        ECIDADE,
        UFCLIENTE, 
        UFLOJAVENDA,
        IDLOJAVENDA,
        INDICACAOIESAP,
        IDINDICACAOIE
    } = dadosCliente || '';
    
   let queryClienteSap = `
        SELECT DISTINCT
            TRIM(UPPER(TBO."CardName")) AS NOMECLIENTESAP,
            TRIM(UPPER(TBC1."Street")) AS ENDERECOCLIENTESAP, 
            TRIM(UPPER(TBC1."Block")) AS BAIRROCLIENTESAP, 
            TRIM(UPPER(TBC1."State")) AS UFCLIENTESAP,
            TRIM(UPPER(TBC1."U_SKILL_indIEDest")) AS INDICACAOIESAP
        FROM
            ${dbNameSAP}.OCRD TBO
        INNER JOIN ${dbNameSAP}.CRD1 AS TBC1 ON
            TBO."CardCode" = TBC1."CardCode" 
        INNER JOIN ${dbNameSAP}.CRD7 AS TBC7 ON
            TBC1."CardCode" = TBC7."CardCode" --AND TBC1."Address" = TBC7."Address"
        WHERE
            TBO."CardType" = 'C'
            AND (REPLACE_REGEXPR('[^[:alnum:]]' IN TBC7."TaxId4" WITH '') = '${NUCPFCNPJ}'
                    OR
                REPLACE_REGEXPR('[^[:alnum:]]' IN TBC7."TaxId0" WITH '') = '${NUCPFCNPJ}')
            AND TBO."CardCode" = ?
    `;
    
    if(!IDCLIENTESAP){
        return false;
    }
    
    let regClienteSap = api.sqlQuery(queryClienteSap, IDCLIENTESAP);    
    
    if(regClienteSap.length){
        let {
            NOMECLIENTESAP,
            ENDERECOCLIENTESAP,
            BAIRROSAP,
            UFCLIENTESAP, 
            INDICACAOIESAP
        } = regClienteSap[0] || null;
        
        if(!INDICACAOIESAP || INDICACAOIESAP != IDINDICACAOIE || NOMECLIENTESAP != DSNOMERAZAOSOCIAL || NOMECLIENTESAP.length < 5){
            stAtualizar = true;
        }
        
        if(UFCLIENTE !== UFLOJAVENDA || UFCLIENTESAP !== UFLOJAVENDA){
            idEmpresa = IDLOJAVENDA;
        } 
        
       if(UFCLIENTE == UFLOJAVENDA && (UFCLIENTESAP !== UFCLIENTE || ENDERECOCLIENTESAP !== EENDERECO)){
            idEmpresa = false;
            stAtualizar = true;
        }
        
        if(idEmpresa || stAtualizar){
            return libAtualizacaoCliente.executeAtualizarCliente(IDCLIENTE, session, idEmpresa, conn);
        }
        
        return true;
        
    }
    
    return false;
}

function postSl(data, session, idVoucher) {
    let response = slApi.post('/CreditNotes',data,session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar integrar a devolução';
        
        return errorLogDevolucaoVenda(idVoucher, msgReturnError, conn);
    }
    
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVoucher);
    
    if(docEntryDevolucao > 0){
        return fnAtualizarStatusDevolucaoResumoVoucher(idVoucher, docEntryDevolucao);
    }
    
    return errorLogDevolucaoVenda(idVoucher, 'Erro ao tentar integrar a devolução', conn);
        
}

function validaDadosGeraDevolucaoNoSap(idVoucher, dadosDevolucao, session){
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVoucher);

    if(!docEntryDevolucao){
        return postSl(dadosDevolucao, session, idVoucher)
    } else {
        return fnAtualizarStatusDevolucaoResumoVoucher(idVoucher, docEntryDevolucao);
    }
    
    return false;
}

function fnReferenciarDevolucaoNoSap(idVoucher, chaveNota, session){
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVoucher);
    let resultRefDevolucao = getDocEntryRefDevolucaoSAP(docEntryDevolucao, chaveNota);
    
    if(!resultRefDevolucao.length){
        return libRefDevolucao.referenciarDevolucao(idVoucher, session);
    }
    
    return fnAtualizarStatusREFDevolucaoResumoVoucher(idVoucher)
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

function executeGerarDevolucao(connDB, session, idVoucher, stMsgRetorno){
    
    let queryVoucher = `
        SELECT TOP 100 DISTINCT
            CASE
                WHEN TBR.IDEMPRESAORIGEM <> TBV.IDEMPRESA THEN 'TRUE'
                ELSE 'FALSE'
            END AS ST_TRANSFERE,
            TBR.IDVOUCHER,
            TBR.NUVOUCHER,
            TO_DATE(TBR.DTINVOUCHER) AS DATA_VOUCHER,
            ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIFTEMPOEMDIAS,
            TBV.PROTNFE_INFPROT_CSTAT AS CSTATSEFAZ,
            TBV.PROTNFE_INFPROT_CHNFE AS CHAVENFE,
            TBV.NFE_INFNFE_TRANSP_MODFRETE,
            TBV.IDVENDA,
            TBV.NFE_INFNFE_IDE_SERIE AS SERIE,
            TBV.NFE_INFNFE_IDE_NNF AS NNF,
            TBV.IDEMPRESA,
            TBE.CODPARCEIRO, 
            TBE.ESTOQUECODIGO,
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
            TBV.SAP_DOCENTRY,
            TBR.STDEVOLUCAO,
            TBR.STREFDEVOLUCAOSAP,
            TBR.IDCLIENTE,
            TBC.IDCLIENTESAP,
            TRIM(UPPER(TBC.DSNOMERAZAOSOCIAL)) AS DSNOMERAZAOSOCIAL,
            TBC.NUCPFCNPJ,
            TBC.IDINDICACAOIE,
            TBC.STATUALIZARCADASTROSAP,
            TRIM(UPPER(TBC.EENDERECO)) AS EENDERECO,
            TRIM(UPPER(TBC.EBAIRRO)) AS EBAIRRO,
            TRIM(UPPER(TBC.ECIDADE)) AS ECIDADE,
            TRIM(UPPER(TBC.SGUF)) AS UFCLIENTE,
            TRIM(UPPER(TBE.SGUF)) AS UFLOJAVENDA,
            TBE.IDEMPRESA AS IDLOJAVENDA
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON
            TBR.IDRESUMOVENDAWEB = TBV.IDVENDA
        INNER JOIN "VAR_DB_NAME".CLIENTE TBC ON 
            TBR.IDCLIENTE = TBC.IDCLIENTE
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBV.IDEMPRESA = TBE.IDEMPRESA 
        WHERE
            TBR.STTIPOTROCA <> 'TROCO'
            AND TBR.STCANCELADO = 'False'
            AND TBV.STCANCELADO = 'False'
            AND TBV.PROTNFE_INFPROT_CSTAT = 100
            AND IFNULL(TBV.SAP_DOCENTRY, 0) <> 0
            AND (TBR.STREFDEVOLUCAOSAP = 'False' OR TBR.STDEVOLUCAOSAP = 'False')
            AND LENGTH(TBC.NUCPFCNPJ) = 11
            AND UPPER(TBC.TPCLIENTE) = 'FISICA'
            AND IFNULL(TBC.IDCLIENTESAP, '') <> ''
            AND 1 = ?
    `;
    
    if(idVoucher){
        queryVoucher += ` AND TBR.IDVOUCHER = '${idVoucher}' `;
    } else {
        queryVoucher += `
            AND TO_DATE(TBR.DTINVOUCHER) >= '2025-01-01'
            AND ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) > 3
        `;
    }
    
    queryVoucher += `
        ORDER BY TBR.IDVOUCHER
    `;
    
    let regDadosVoucher = api.sqlQuery(queryVoucher, 1);

    if(regDadosVoucher.length){
        let idClienteAnterior = '';
        let ufClienteAnterior = '';
        let ufLojaAnterior = '';
        
        conn = connDB; 
        
        regDadosVoucher = regDadosVoucher.sort((a, b)=>{
            return a.ST_TRANSFERE == b.ST_TRANSFERE ? 0 : a.ST_TRANSFERE == 'TRUE' ? -1 : 1; 
        })
        
        for(let i = 0; i < regDadosVoucher.length; i++){
            let dados = regDadosVoucher[i];
            
            let {
                IDVENDA,
                IDVOUCHER,
                DIFTEMPOEMDIAS,
                CSTATSEFAZ,
                CHAVENFE,
                IDCLIENTE,
                IDINDICACAOIE,
                NUCPFCNPJ,
                STATUALIZARCADASTROSAP,
                EENDERECO, 
                EBAIRRO,
                ECIDADE,
                UFCLIENTE,
                IDCLIENTESAP,
                DSNOMERAZAOSOCIAL,
                UFLOJAVENDA,
                IDLOJAVENDA
            } = dados;
            let tempoCriacaoVoucherEmDias = Number(DIFTEMPOEMDIAS);
            let dadosCliente = {
                IDCLIENTE,
                DSNOMERAZAOSOCIAL,
                IDINDICACAOIE,
                IDCLIENTESAP,
                NUCPFCNPJ,
                STATUALIZARCADASTROSAP,
                EENDERECO, 
                EBAIRRO,
                ECIDADE,
                UFCLIENTE, 
                UFLOJAVENDA,
                IDLOJAVENDA
            };
            
            if(!idClienteAnterior || !ufClienteAnterior || !ufLojaAnterior){
                idClienteAnterior = IDCLIENTE;
                ufClienteAnterior = UFCLIENTE;
                ufLojaAnterior = UFLOJAVENDA;
            } else {
                if(idClienteAnterior == IDCLIENTE && ufClienteAnterior == UFCLIENTE && ufLojaAnterior !== UFLOJAVENDA ){
                    continue; 
                } else {
                    idClienteAnterior = IDCLIENTE;
                    ufClienteAnterior = UFCLIENTE;
                    ufLojaAnterior = UFLOJAVENDA;
                }
            }
            
            if(fnVerificarDadosIntegradosCliente(dadosCliente, session)){
                
                let dadosDevolucao = {
                    "DocType": "dDocument_Items",
                    "U_ID_VENDA_PDV": dados.IDVOUCHER,
                    "DocDate": dados.DATA_VOUCHER,
                    "DocDueDate": dados.DATA_VOUCHER,
                    "CardCode": dados.IDCLIENTESAP,
                    "Comments": `Ref a Dev Mercadoria Voucher n. ${dados.NUVOUCHER}  IDVENDA ${dados.IDVENDA}`,
                    "JournalMemo": `Ref a Dev Mercadoria Voucher n. ${dados.NUVOUCHER}  IDVENDA ${dados.IDVENDA}`,
                    "OpeningRemarks": `Devolucao NF ${dados.NNF} Serie: ${dados.SERIE} Chave: ${dados.CHAVENFE}`,
                    "ClosingRemarks": `Devolucao NF ${dados.NNF} Serie: ${dados.SERIE} Chave: ${dados.CHAVENFE}`,     
                    "TaxDate": dados.DATA_VOUCHER,
                    "Project": "PDV_SOFTQUALITY",
                    "BPL_IDAssignedToInvoice": dados.IDEMPRESA,
                    "SequenceCode": getSeqCode(dados.IDEMPRESA),
                    "SequenceModel": "39",
                    "GroupNum": 93,
                    "U_IS_NATOPNFE": "Devolução de venda de mercadoria adquirida ou recebida de terceiros",
                    "U_finNfe": 4,
                    "U_SKILL_FormaPagto": 90,
                    "PeyMethod": null,
                    "U_Classification": 999, //Parametro para não duplicar a entrada no estoque(999)
                    "DocumentLines": obterLinhasDoDetalhe(dados.IDVOUCHER, dados.ESTOQUECODIGO, parseFloat(dados.NFE_INFNFE_TOTAL_ICMSTOT_VDESC), parseFloat(dados.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)),
                    "TaxExtension": {
                        "Incoterms": dados.NFE_INFNFE_TRANSP_MODFRETE,
                        "MainUsage": 38
                    }/*,
                    "DocumentReferences": [
                        {
                            "RefDocEntr": getDocEntry(dados.IDVENDA),
                            "RefObjType": "rot_SalesInvoice"
                        }
                    ]*/
                };
                
                if(dadosDevolucao["DocumentLines"].length == 0){
                    errorLogDevolucaoVenda(IDVOUCHER, 'Devolucao não realizada, voucher sem produtos!');
                } else {
                    
                    if(validaDadosGeraDevolucaoNoSap(IDVOUCHER, dadosDevolucao, session)){
                        
                        if(!fnReferenciarDevolucaoNoSap(IDVOUCHER, CHAVENFE, session)){
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
            } else {
                errorLogDevolucaoVenda(IDVOUCHER, 'Devolucao não realizada, cliente não integrado/atualizado, verifique o campo ERRORLOGSAP!');
             
                if(stMsgRetorno) {
                    return {
                        msg: 'Devolucao não realizada, cliente não integrado/atualizado, verifique o campo ERRORLOGSAP!'
                    } 
                }
                
            }
        }
        
    } else{
        if(stMsgRetorno) {
            return {
                msg: 'Dados não Encontrados, venda ou voucher cancelado ou já feito o processo de devolucao!'
            };
        }
        
    }
    
    return {
        msg: 'Devoluções Realizadas Com Sucesso!'
    };
    
}