let dbNameSAP = "SBO_GTO_PRD";
let filePath = "quality.concentrador.api";

let api = $.import(`${filePath}.apiResponse`, "int_api");
let libIntegracaoVenda = $.import(`${filePath}.service-layer.devolucao`, "devolucao-integracao");
let libIntegracaoCliente = $.import(`${filePath}.service-layer.cliente`, "integracao-cliente-devolucao");
let libDevolucao = $.import(`${filePath}.service-layer.devolucao.devolucao-produtos-voucher`, "devolucao-produtos-detalhe-voucher");
let libRefDevolucao = $.import(`${filePath}.service-layer.devolucao.devolucao-produtos-voucher`, "referencia-nota-devolucao-voucher");

function fnAtualizaStatusCliente(idCliente, cardCodeSap, conn){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME".CLIENTE
        SET
            ERRORLOGSAP = null,
            IDCLIENTESAP = ?
        WHERE 
            IDCLIENTE = ?
    `;
 	
 	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
 
 	pStmtUpdate.setString(1, cardCodeSap);
 	pStmtUpdate.setInt(2, Number(idCliente));
 	pStmtUpdate.execute();
 	
 	pStmtUpdate.close();
 
 	conn.commit();

}

function fnVerificarDadosIntegradosCliente(dadosCliente){
    let {
        IDCLIENTE, 
        NUCPFCNPJ, 
        EENDERECO, 
        EBAIRRO,
        ECIDADE,
        UFCLIENTE, 
        UFLOJAVENDA,
        IDLOJAVENDA
    } = dadosCliente;
    let idEmpresa = false;
    let stAtualizar = 'False';
    
   let queryClienteSap = `
        SELECT DISTINCT 
            TRIM(UPPER(TBC1."Street")) AS ENDERECOCLIENTESAP, 
            TRIM(UPPER(TBC1."Block")) AS BAIRROCLIENTESAP, 
            TRIM(UPPER(TBC1."State")) AS UFCLIENTESAP
        FROM
            ${dbNameSAP}.OCRD TBO
        INNER JOIN ${dbNameSAP}.CRD7 AS TBC7 ON
            TBO."CardCode" = TBC7."CardCode" 
        INNER JOIN ${dbNameSAP}.CRD1 AS TBC1 ON
            TBC7."CardCode" = TBC1."CardCode" 
        WHERE
            TBO."CardType" = 'C'
            AND (REPLACE_REGEXPR('[^[:alnum:]]' IN TBC7."TaxId4" WITH '') = '${NUCPFCNPJ}'
                    OR
                REPLACE_REGEXPR('[^[:alnum:]]' IN TBC7."TaxId0" WITH '') = '${NUCPFCNPJ}')
            AND 1 = ?
    `;
    
    let regClienteSap = api.sqlQuery(queryClienteSap, 1);    
    
    if(regClienteSap.length){
        let {
            ENDERECOCLIENTESAP,
            BAIRROSAP,
            UFCLIENTESAP
        } = regClienteSap[0] || null;
        
        if(UFCLIENTE !== UFLOJAVENDA || UFCLIENTESAP !== UFLOJAVENDA){
            idEmpresa = IDLOJAVENDA;
        } 
        
       if(UFCLIENTE == UFLOJAVENDA && (UFCLIENTESAP !== UFCLIENTE || ENDERECOCLIENTESAP !== EENDERECO)){
            idEmpresa = false;
            stAtualizar = 'True';
        }
    } else {
        if(UFCLIENTE !== UFLOJAVENDA){
            idEmpresa = IDLOJAVENDA;
        } 
    }

    return libIntegracaoCliente.integrarCliente(IDCLIENTE, {idEmpresa, stAtualizar});
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
        return Number(regDocEntry[0].DocEntry);
    }
    
    return false;
}

function fnGeraDevolucaoNoSap(idVoucher, conn){
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVoucher);

    if(!docEntryDevolucao){
        return libDevolucao.gerarDevolucaoVenda(idVoucher);
    } else {
        fnAtualizarStatusDevolucaoResumoVoucher(idVoucher, docEntryDevolucao, conn)
    }
    
    return true;
}

function fnReferenciarDevolucaoNoSap(idVoucher, chaveNota, conn){
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVoucher);
    
    if(!docEntryDevolucao){
        return false;
    }
    
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
    
    if(!resultRefDevolucao.length){
        return libRefDevolucao.referenciarDevolucao(idVoucher);
    } else {
        fnAtualizarStatusREFDevolucaoResumoVoucher(idVoucher, conn)
    }
    
    return true;
}

function executeIntegrarClienteDevolucao(byId, stMsgRetorno = false){
    return {
        msg: 'teste'
    }
    
    let queryVoucher = `
        SELECT
            TOP 10
            TBR.IDVOUCHER,
            ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIFTEMPOEMDIAS,
            TBV.PROTNFE_INFPROT_CSTAT AS CSTATSEFAZ,
            TBV.PROTNFE_INFPROT_CHNFE AS CHAVENFE, 
            TBV.IDVENDA,
            TBR.STDEVOLUCAO,
            TBR.STREFDEVOLUCAOSAP,
            TBR.IDCLIENTE,
            TBC.NUCPFCNPJ,
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
            AND (TBR.STREFDEVOLUCAOSAP = 'False' OR TBR.STDEVOLUCAOSAP = 'False')
            AND LENGTH(TBC.NUCPFCNPJ) = 11
            AND UPPER(TBC.TPCLIENTE) = 'FISICA'
            AND 1 = ?
    `;
    
    if(byId){
        queryVoucher += ` AND TBR.IDVOUCHER = '${byId}' `;
    } else {
        queryVoucher += `
            AND TO_DATE(TBR.DTINVOUCHER) >= '2024-10-11'
            AND ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) > 3
        `;
    }
    
    queryVoucher += `
        ORDER BY TBR.IDVOUCHER
    `;
    
    let regDadosVoucher = api.sqlQuery(queryVoucher, 1);

    if(regDadosVoucher.length){
        let conn = $.db.getConnection();
        
        for(let i = 0; i < regDadosVoucher.length; i++){
            let dados = regDadosVoucher[i];
            
            let {
                IDVENDA,
                IDVOUCHER,
                DIFTEMPOEMDIAS,
                CSTATSEFAZ,
                CHAVENFE,
                IDCLIENTE, 
                NUCPFCNPJ,
                STATUALIZARCADASTROSAP,
                EENDERECO, 
                EBAIRRO,
                ECIDADE,
                UFCLIENTE, 
                UFLOJAVENDA,
                IDLOJAVENDA
            } = dados;
            let tempoCriacaoVoucherEmDias = Number(DIFTEMPOEMDIAS);
            let stDevolucao, stRefDevolucao = false;
            let dadosCliente = {
                IDCLIENTE, 
                NUCPFCNPJ,
                STATUALIZARCADASTROSAP,
                EENDERECO, 
                EBAIRRO,
                ECIDADE,
                UFCLIENTE, 
                UFLOJAVENDA,
                IDLOJAVENDA
            };
            
            if(tempoCriacaoVoucherEmDias > 3 || byId){
                
                if(CSTATSEFAZ == 100){
                    
                    if(fnVerificarIntegracaoVenda(IDVENDA, conn)){
                        
                        if(fnVerificarIntegracaoCliente(dadosCliente)){
                            
                            if(fnGeraDevolucaoNoSap(IDVOUCHER, conn)){
                                
                                if(fnReferenciarDevolucaoNoSap(IDVOUCHER, CHAVENFE, conn)){
                                    
                                    successLogRefDevolucao(IDVOUCHER, conn);
                                } else {
                                    if(stMsgRetorno) {
                                        return {
                                            msg: 'Devolucao não referenciada no SAP, não foi possivel gerar a devolução da venda no SAP, tente novamente!'
                                        }
                                    }
                                    
                                    continue;
                                }
                            }else{
                                if(stMsgRetorno) {
                                    return {
                                        msg: 'Devolucao não realizada, não foi possivel gerar a devolução da venda no SAP, tente novamente!'
                                    } 
                                }
                                
                                continue;
                            } 
                        } else {
                            if(stMsgRetorno) {
                                return {
                                    msg: 'Devolucao não realizada, não foi possivel integrar o cliente no SAP, tente novamente!'
                                } 
                            }
                            
                            continue;
                        }
                    } else {
                        if(stMsgRetorno) {
                            return {
                                msg: 'Devolucao não realizada, não foi possivel integrar a venda no SAP, tente novamente!'
                            }
                        } 
                        
                        continue;
                    }
                } else {
                    errorLogDevolucaoVenda(IDVOUCHER, 'Devolucao não realizada, Venda Em Contingêcia!', conn);
                    
                    if(stMsgRetorno) {
                        return {
                            msg: 'Devolucao não realizada, Venda Em Contingêcia!'
                        }
                    } 
                    
                    continue;
                }
            } else {
                errorLogDevolucaoVenda(IDVOUCHER, 'Não foi possível gerar a Devolucao, Voucher dentro do prazo de 3 dias!', conn);
                
                if(stMsgRetorno) {
                    return {
                        msg: 'Não foi possível gerar a Devolucao, Voucher dentro do prazo de 3 dias!'
                    }
                }
                
                continue;
            }
        }
        
        conn.commit();
       // conn.close();
    } else{
        return {
            msg: 'Dados não Encontrados, venda ou voucher cancelado ou já feito o processo de devolucao!'
        };
        
    }
    
    return {
        msg: 'Devoluções Realizadas Com Sucesso!'
    };
    
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ($.request.method) {
            
            //Handle your POST calls here
            case $.net.http.POST:
            var id = $.request.parameters.get("id");
            var stMsgRetorno = $.request.parameters.get("stMsgRetorno");
            var docReturn = executeGerarDevolucao(id, stMsgRetorno);
            
            $.response.setBody(JSON.stringify(docReturn));
            break;
        }
        
    } catch (e) {
        var detalheError = e.stack.split('\n');
        
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