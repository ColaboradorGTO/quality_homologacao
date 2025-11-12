let api = $.import("quality.concentrador.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador.api.service-layer", "api");
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

function fnGetContaBancoEmpresa(idEmpresa){
    let query = `
        SELECT 
            A."AcctCode" AS "CONTA" 
        FROM 
            "SBO_GTO_PRD".OACT A
        INNER JOIN "SBO_GTO_PRD".OWHS B ON
            A."U_RS_Filial" = B."WhsCode"
        WHERE 
            B."BPLid" = ?
        ORDER BY 
            B."BPLid"
    `;
    
    let result = api.sqlQuery(query, idEmpresa);
    
    if(result.length){
        return result[0]['CONTA'];
    }
    
    return false;
}

function fnGetDocEntryContasReceberSAP(idDetalheFatura, nuCodAutorizacao){
    let query = `
        SELECT
            TBO."DocEntry"
        FROM 
            ${dbNameSAP}.ORCT TBO
        WHERE
            TBO."Canceled" = 'N'
            AND TBO."JrnlMemo" LIKE '%Fatura Credsystem Código de Autorização: ${nuCodAutorizacao}%'
            AND TBO."U_IS_ID_QUALITY" = ?
    `;
    
    let result = api.sqlQuery(query, idDetalheFatura);
    
    if(result.length > 0){
        return Number(result[0]["DocEntry"]);
    }
    
    return null;
}

function fnValidarIntegracaoContasReceberSAP(idDetalheFatura, nuCodAutorizacao, StAtualizarComError = true){
    let docEntryContasReceberSAP = fnGetDocEntryContasReceberSAP(idDetalheFatura, nuCodAutorizacao);
    
    if(docEntryContasReceberSAP){
        return fnGravarLogSucessoContasReceber(idDetalheFatura, docEntryContasReceberSAP);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idDetalheFatura, 'Erro ao tentar integrar o contas a receber');
        }
    }
    
    return false;
}

function fnGravarLogSucessoContasReceber(idDetalheFatura, docEntryContasReceberSAP){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEFATURA" 
        SET 
            ERROR_LOG_SAP = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_RECEBER = CURRENT_TIMESTAMP,
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            DOCENTRY_SAP_CONTAS_A_RECEBER = ?
        WHERE 
            IDDETALHEFATURA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, docEntryContasReceberSAP);
	pStmtUpdate.setInt(2, Number(idDetalheFatura));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return true;
}

function fnGravarLogError(idDetalheFatura, p_Error){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEFATURA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            ERROR_LOG_SAP = ? 
        WHERE 
            IDDETALHEFATURA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setInt(2, Number(idDetalheFatura));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return false;
}

function fnBloquearLinhaEnquantoAtualiza(dados){
    let ids = '';
    
    for (var i = 0; i < dados.length; i++) {
        let { IDDETALHEFATURA } = dados[i];
        
        ids += IDDETALHEFATURA;
        ids += i < (dados.length - 1) ? ', ' : '';
    }
    
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEFATURA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'True'
        WHERE 
            IDDETALHEFATURA IN (${ids}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.execute();
    pStmtUpdate.close();
    
    conn.commit();
}

function fnMontarJsonContasReceber(dados){
    let {
        IDDETALHEFATURA,
        IDCAIXA,
        DTPROCESSAMENTO,
        VRRECEBIDO,
        NUCODAUTORIZACAO,
        STPIX,
        IDEMPRESA
    } = dados || '';
    let dtDoc = DTPROCESSAMENTO;
    let contaPix = '1.01.01.01.9997';
    let cashAccount = STPIX == 'False' ? fnGetContaBancoEmpresa(IDEMPRESA) : contaPix;
    let accountCode = '2.01.06.01.0001';
    let vrDoc = Number(VRRECEBIDO);
    let series = 15;
    
    return {
        "DocType": "rAccount", //fixo
        "DocDate": dtDoc,
        "CashAccount": cashAccount,
        "CashSum": vrDoc,
        "Reference2": `Integração FATURA(${IDDETALHEFATURA}) Quality`,
        "Remarks": `Fatura Credsystem Código de Autorização: ${NUCODAUTORIZACAO}`,
        "JournalRemarks": `Fatura Credsystem Código de Autorização: ${NUCODAUTORIZACAO}`,
        "TaxDate": dtDoc,
        "Series": series,
        "DueDate": dtDoc,
        "BPLID": IDEMPRESA,
        "U_IS_ID_QUALITY": String(IDDETALHEFATURA),
        "U_ITV_Num_Caixa": String(IDCAIXA),
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": accountCode,
                "SumPaid": vrDoc
            }
        ]
    };
}

function postSlContasReceber(data, nuCodAutorizacao) {
    let response = slApi.post('/IncomingPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return fnGravarLogError(data.U_IS_ID_QUALITY, (response.error.message.value || 'Erro ao tentar integrar a fatura'));
    }
    
    fnValidarIntegracaoContasReceberSAP(data.U_IS_ID_QUALITY, nuCodAutorizacao);
}

function integrarFaturasNoSAP(byId) {
    let query = `
        SELECT 
            IDDETALHEFATURA,
            IDCAIXAWEB AS IDCAIXA,
            TO_VARCHAR(DTPROCESSAMENTO, 'YYYY-MM-DD') AS DTPROCESSAMENTO,
            VRRECEBIDO,
            NUCODAUTORIZACAO,
            IFNULL(STPIX, 'False') AS STPIX,
            IDEMPRESA
        FROM
            "VAR_DB_NAME".DETALHEFATURA
        WHERE
            1 = ?
            AND STCANCELADO = 'False'
            AND STCONFERIDO = 'True'
            AND STATUS_BLOQUEIO_ATUALIZACAO = 'False'
            AND IFNULL(NUCODAUTORIZACAO, '') <> ''
            AND IFNULL(DOCENTRY_SAP_CONTAS_A_RECEBER, 0) = 0
    `;
    
	var bodyJson = JSON.parse($.request.body.asString()); 

    if(bodyJson.length > 0){
        let ids = '';
        
        for (let i = 0; i < bodyJson.length; i++) {
            let registro = bodyJson[i];
            ids += registro.IDDETALHEFATURA;
            ids += i < (bodyJson.length - 1) ? ', ' : '';
        }
        
        query += `AND IDDETALHEFATURA IN (${ids})`;
        
        let resultQuery = ids.length > 0 ? api.sqlQuery(query, 1) : '';
        
        if(resultQuery.length === 0){
            return { msg: "FATURA JÁ INTEGRADA OU CANCELADA OU NÃO EXISTE!" };
        }
        
        conn = $.db.getConnection();
        
        fnBloquearLinhaEnquantoAtualiza(resultQuery);
        
        session = slApi.loginServiceLayer(true);
        slApi.loginServiceLayer(true);
        
        for (let i = 0; i < resultQuery.length; i++) {
            let registro = resultQuery[i];
            let { 
                IDDETALHEFATURA, 
                NUCODAUTORIZACAO
            } = registro;
            
            let stIntegrarNaContaBanco = !fnValidarIntegracaoContasReceberSAP(IDDETALHEFATURA, NUCODAUTORIZACAO, false);
              
            if(stIntegrarNaContaBanco){
                let dadosJsonContasReceber = fnMontarJsonContasReceber(registro);
                //return {dadosJsonContasReceber}
                postSlContasReceber(dadosJsonContasReceber, NUCODAUTORIZACAO);
            }
        }
        
    }
	
	return 'Migração Faturas realizada com sucesso!';
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                let id = $.request.parameters.get("id");
                let docReturn = integrarFaturasNoSAP(id);
                
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