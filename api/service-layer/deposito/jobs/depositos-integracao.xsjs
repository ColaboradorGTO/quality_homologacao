let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let dbNameSAP = 'SBO_GTO_TESTE4';

let conn;
let session;

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnGetContaCaixaEmpresa(idEmpresa){
    let query = `
        SELECT
            B."BPLid" AS "LOJA",
            A."AcctCode" AS "CONTA"
        FROM
            ${dbNameSAP}.OACT A
        INNER JOIN ${dbNameSAP}.OWHS B ON
            A."U_RS_Filial" = B."WhsCode"
        WHERE 
            B."BPLid" = ?
    `;
    
    let result = api.sqlQuery(query, idEmpresa);
    
    if(result.length){
        return result[0]['CONTA'];
    }
    
    return false;
}

function fnGetContaBancoEmpresa(idEmpresa){
    let query = `
        SELECT
            "U_IS_CONTA" AS CONTA
        FROM 
            SBO_GTO_PRD."@IS_CONTATRANSPVL"
        WHERE 
            "U_IS_LOJA" = ?
    `;
    
    let result = api.sqlQuery(query, idEmpresa);
    
    if(result.length){
        return result[0]['CONTA'];
    }
    
    return false;
}

function fnGetDocEntryContasPagarSAP(idDeposito){
    let query = `
        SELECT
            TBO."DocEntry"
        FROM 
            ${dbNameSAP}.OVPM TBO
        WHERE
            TBO."Canceled" = 'N'
            AND TBO."U_IS_ID_QUALITY" = ?
    `;
    
    let result = api.sqlQuery(query, idDeposito);
    
    if(result.length > 0){
        return Number(result[0]["DocEntry"]);
    }
    
    return null;
}

function fnGetDocEntryContasReceberSAP(idDeposito){
    let query = `
        SELECT
            TBO."DocEntry"
        FROM 
            ${dbNameSAP}.ORCT TBO
        WHERE
            TBO."Canceled" = 'N'
            AND TBO."U_IS_ID_QUALITY" = ?
    `;
    
    let result = api.sqlQuery(query, idDeposito);
    
    if(result.length > 0){
        return Number(result[0]["DocEntry"]);
    }
    
    return null;
}

function fnValidarIntegracaoContasPagarSAP(idDeposito, StAtualizarComError = true){
    let docEntryContasPagarSAP = fnGetDocEntryContasPagarSAP(idDeposito);
    
    if(docEntryContasPagarSAP){
        return fnGravarLogSucessoContasPagarSAP(idDeposito, docEntryContasPagarSAP);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idDeposito, 'Erro ao tentar integra o contas a pagar');
        }
    }
    
    return false;
}

function fnValidarIntegracaoContasReceberSAP(idDeposito, StAtualizarComError = true){
    let docEntryContasReceberSAP = fnGetDocEntryContasReceberSAP(idDeposito);
    
    if(docEntryContasReceberSAP){
        return fnGravarLogSucessoContasReceber(idDeposito, docEntryContasReceberSAP);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idDeposito, 'Erro ao tentar integra o contas a receber');
        }
    }
    
    return false;
}

function fnGravarLogSucessoContasPagarSAP(idDeposito, docEntryContasPagarSAP){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DEPOSITOLOJA" 
        SET 
            ERRORLOGSAP = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_PAGAR = CURRENT_TIMESTAMP,
            --STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            DOCENTRY_SAP_CONTAS_A_PAGAR = ?
        WHERE 
            IDDEPOSITOLOJA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, docEntryContasPagarSAP);
	pStmtUpdate.setInt(2, idDeposito);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();
    
	return true;
}

function fnGravarLogSucessoContasReceber(idDeposito, docEntryContasReceberSAP){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DEPOSITOLOJA" 
        SET 
            ERRORLOGSAP = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_RECEBER = CURRENT_TIMESTAMP,
            --STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            DOCENTRY_SAP_CONTAS_A_RECEBER = ?
        WHERE 
            IDDEPOSITOLOJA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, docEntryContasReceberSAP);
	pStmtUpdate.setInt(2, idDeposito);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return true;
}

function fnGravarLogError(idDeposito, p_Error){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DEPOSITOLOJA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            ERRORLOGSAP = ? 
        WHERE 
            IDDEPOSITOLOJA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setInt(2, idDeposito);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return false;
}

function fnUpdateBloquearLinhaEnquantoAtualiza(idsDepositos, status = 'True'){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DEPOSITOLOJA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = '${status}'
        WHERE 
            IDDEPOSITOLOJA IN (${idsDepositos}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.execute();
    pStmtUpdate.close();
    
    conn.commit();
    
    return true;
}

function fnMontarJsonContasPagar(dadosDeposito){
    let {
        IDDEPOSITOLOJA,
        DTMOVIMENTOCAIXA,
        DTDEPOSITO,
        DTCOMPENSACAO,
        DSHISTORIO,
        NUDOCDEPOSITO,
        VRDEPOSITO,
        STCONFERIDO,
        NUCPF,
        IDEMPRESA,
        TPCONTA,
        NUCONTASAP,
        DOCENTRY_SAP_CONTAS_A_PAGAR,
        DOCENTRY_SAP_CONTAS_A_RECEBER
    } = dadosDeposito || '';
    let dataDeposito = DTDEPOSITO;
    let cashAccount = fnGetContaCaixaEmpresa(IDEMPRESA);
    let accountCode = (TPCONTA == 'TRANSPORTEVALORES' || TPCONTA == 'DEVSOBRA') ? NUCONTASAP : '1.01.01.01.0003';
    let series = 18;
    
    return {
        "DocType": "rAccount", //fixo
        "DocDate": dataDeposito,
        "CashAccount": cashAccount,
        "CashSum": Number(VRDEPOSITO),
        "Reference2": `Integração DEPOSITO(${IDDEPOSITOLOJA}) Quality`,
        "Remarks": DSHISTORIO,
        "JournalRemarks": NUDOCDEPOSITO,
        "TaxDate": dataDeposito,
        "Series": series,
        "DueDate": dataDeposito,
        "BPLID": IDEMPRESA,
        "U_IS_ID_QUALITY": String(IDDEPOSITOLOJA),
        "U_ITV_Num_Caixa": NUCPF,
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": accountCode,
                "SumPaid": Number(VRDEPOSITO)
            }
        ]
    };
}

function fnMontarJsonContasReceber(dadosDeposito){
    let {
        IDDEPOSITOLOJA,
        DTMOVIMENTOCAIXA,
        DTDEPOSITO,
        DTCOMPENSACAO,
        DSHISTORIO,
        NUDOCDEPOSITO,
        VRDEPOSITO,
        STCONFERIDO,
        NUCPF,
        IDEMPRESA,
        TPCONTA,
        NUCONTASAP,
        DOCENTRY_SAP_CONTAS_A_PAGAR,
        DOCENTRY_SAP_CONTAS_A_RECEBER
    } = dadosDeposito || '';
    let dataDeposito = DTCOMPENSACAO;
    let cashAccount = TPCONTA == 'TRANSPORTEVALORES' ? fnGetContaBancoEmpresa(IDEMPRESA) : NUCONTASAP;
    let accountCode = TPCONTA == 'TRANSPORTEVALORES' ? NUCONTASAP : '1.01.01.01.0003';
    let series = 15;
    
    /*if(DTDEPOSITO == DTCOMPENSACAO){ // Envia da Conta Caixa para a Conta Banco diretamente, pulando a Conta Transitória
        accountCode = fnGetContaCaixaEmpresa(IDEMPRESA) || accountCode;
    }*/
    
    return {
        "DocType": "rAccount", //fixo
        "DocDate": dataDeposito,
        "CashAccount": cashAccount,
        "CashSum": Number(VRDEPOSITO),
        "Reference2": `Integração DEPOSITO(${IDDEPOSITOLOJA}) Quality`,
        "Remarks": DSHISTORIO,
        "JournalRemarks": NUDOCDEPOSITO,
        "TaxDate": dataDeposito,
        "Series": series,
        "DueDate": dataDeposito,
        "BPLID": IDEMPRESA,
        "U_IS_ID_QUALITY": String(IDDEPOSITOLOJA),
        "U_ITV_Num_Caixa": NUCPF,
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": accountCode,
                "SumPaid": Number(VRDEPOSITO)
            }
        ]
    };
}

function getDadosDepositos(idsDepositos, statusBloqueio = 'False') {
    let query = ` 
        SELECT
            TBD.IDDEPOSITOLOJA,
            TO_VARCHAR(TBD.DTMOVIMENTOCAIXA, 'YYYY-MM-DD') AS DTMOVIMENTOCAIXA,
            TO_VARCHAR(TBD.DTDEPOSITO, 'YYYY-MM-DD') AS DTDEPOSITO,
            TO_VARCHAR(TBD.DTCOMPENSACAO, 'YYYY-MM-DD') AS DTCOMPENSACAO,
            TRIM(TO_VARCHAR(TBD.DSHISTORIO)) AS DSHISTORIO,
            TBD.NUDOCDEPOSITO,
            TBD.VRDEPOSITO,
            TBD.STCONFERIDO,
            TBF.NUCPF,
            TBE.IDEMPRESA,
            TBC.TPCONTA,
            TBC.NUCONTASAP,
            IFNULL(TBD.DOCENTRY_SAP_CONTAS_A_PAGAR, 0) AS DOCENTRY_SAP_CONTAS_A_PAGAR,
            IFNULL(TBD.DOCENTRY_SAP_CONTAS_A_RECEBER, 0) AS DOCENTRY_SAP_CONTAS_A_RECEBER
        FROM
            "VAR_DB_NAME".DEPOSITOLOJA TBD
        INNER JOIN "VAR_DB_NAME".CONTABANCO TBC ON
            TBD.IDCONTABANCO = TBC.IDCONTABANCO
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON
            TBD.IDUSR = TBF.IDFUNCIONARIO
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBD.IDEMPRESA = TBE.IDEMPRESA
        INNER JOIN "VAR_DB_NAME".BANCO TBB ON
            TBC.IDBANCO = TBB.IDBANCO
        WHERE
            1 = ?
            AND TO_DATE(TBD.DTDEPOSITO) >= '2025-01-01'
            AND TBD.STATIVO = 'True'
            AND TBD.STCANCELADO = 'False'
            AND TBD.STCONFERIDO = 'True'
            AND TBD.STATUS_BLOQUEIO_ATUALIZACAO = '${statusBloqueio}'
            AND (TBC.TPCONTA = 'BANCO' OR TBC.TPCONTA = 'TRANSPORTEVALORES' OR TBC.TPCONTA = 'DEVSOBRA' OR TBC.TPCONTA = 'TESOURARIA')
            --AND IFNULL(TO_VARCHAR(TBD.ERRORLOGSAP), '') = ''
            AND TBD.DTCOMPENSACAO IS NOT NULL 
            AND (IFNULL(TBD.DOCENTRY_SAP_CONTAS_A_PAGAR, 0) = 0 OR IFNULL(TBD.DOCENTRY_SAP_CONTAS_A_RECEBER, 0) = 0)
            AND TBD.IDDEPOSITOLOJA IN (${idsDepositos})
    `;
	
    let dadosDepositos = idsDepositos.length > 0 ? api.sqlQuery(query, 1) : '';
    
    if(dadosDepositos.length > 0){
        return dadosDepositos;
    }
    
    return [];
}

function postSlContasPagar(data) {
    let response = slApi.post('/VendorPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return fnGravarLogError(Number(data.U_IS_ID_QUALITY), (response.error.message.value || 'Erro ao tentar integra o Contas a Pagar'));
    }

    return fnValidarIntegracaoContasPagarSAP(Number(data.U_IS_ID_QUALITY));
}

function postSlContasReceber(data) {
    let response = slApi.post('/IncomingPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return fnGravarLogError(Number(data.U_IS_ID_QUALITY), (response.error.message.value || 'Erro ao tentar integra o Contas a Receber'));
    }
    
    return fnValidarIntegracaoContasReceberSAP(Number(data.U_IS_ID_QUALITY));
}

function fnIntegrarContasPagar(dadosDeposito, ids){
    for (let i = 0; i < dadosDeposito.length; i++) {
        let registro = dadosDeposito[i];
        let {
            IDDEPOSITOLOJA,
            DOCENTRY_SAP_CONTAS_A_PAGAR,
            TPCONTA
        } = registro || '';
        
        if(DOCENTRY_SAP_CONTAS_A_PAGAR == 0){
            
            if(!fnValidarIntegracaoContasPagarSAP(IDDEPOSITOLOJA, false)){
                let dadosJsonContasPagar = fnMontarJsonContasPagar(registro);
                
                postSlContasPagar(dadosJsonContasPagar);
            }
        }
        
        TPCONTA == 'DEVSOBRA' && fnUpdateBloquearLinhaEnquantoAtualiza(ids, 'False');
    }
    
    fnIntegrarContasReceber(ids);
}

function fnIntegrarContasReceber(idsDepositos){
    let dadosDepositos = getDadosDepositos(idsDepositos, 'True');
    
    for (let i = 0; i < dadosDepositos.length; i++) {
        let registro = dadosDepositos[i];
        let {
            IDDEPOSITOLOJA,
            DOCENTRY_SAP_CONTAS_A_PAGAR,
            DOCENTRY_SAP_CONTAS_A_RECEBER,
            TPCONTA
        } = registro || '';
        
        if(TPCONTA != 'DEVSOBRA'  && DOCENTRY_SAP_CONTAS_A_PAGAR > 0 && DOCENTRY_SAP_CONTAS_A_RECEBER == 0){
            
            if(!fnValidarIntegracaoContasReceberSAP(IDDEPOSITOLOJA, false)){
                let dadosJsonContasReceber = fnMontarJsonContasReceber(registro);
                
                postSlContasReceber(dadosJsonContasReceber);
            }
        }
        
    }
    
    fnUpdateBloquearLinhaEnquantoAtualiza(idsDepositos, 'False');
}

function integrarDepositosNoSAP(byId) {
	let bodyJson = JSON.parse($.request.body.asString()); 

    if(bodyJson.length > 0){
        let ids = '';
        
        for (let i = 0; i < bodyJson.length; i++) {
            let registro = bodyJson[i];
            ids += registro.IDDEPOSITOLOJA;
            ids += i < (bodyJson.length - 1) ? ', ' : '';
        }
        
        let dadosDepositos = getDadosDepositos(ids);
        
        if(dadosDepositos.length === 0){
            return { msg: "DEPOSITO JÁ INTEGRADO OU CANCELADO OU NÃO EXISTE!" };
        }
        
        conn = $.db.getConnection();
        session = slApi.loginServiceLayer(true);
        slApi.loginServiceLayer(true);
        
        fnUpdateBloquearLinhaEnquantoAtualiza(ids);
        
        fnIntegrarContasPagar(dadosDepositos, ids);
    }
	
	return 'Migração depositos realizada com sucesso!';
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                let id = $.request.parameters.get("id");
                let docReturn = integrarDepositosNoSAP(id);
                
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