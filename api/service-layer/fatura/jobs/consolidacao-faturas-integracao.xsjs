let api = $.import("quality.concentrador_homologacao.api", "apiResponse");
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

function fnGetDocEntryContasReceberSAP(idConsolidacaoFatura){
    let query = `
        SELECT
            TBO."DocEntry"
        FROM 
            ${dbNameSAP}.ORCT TBO
        WHERE
            TBO."Canceled" = 'N'
            AND TBO."JrnlMemo" LIKE '%Integração CONSOLIDACAO FATURAS(${idConsolidacaoFatura}) Quality%'
            AND TBO."U_IS_ID_QUALITY" = ?
    `;
    
    let result = api.sqlQuery(query, idConsolidacaoFatura);
    
    if(result.length > 0){
        return Number(result[0]["DocEntry"]);
    }
    
    return null;
}

function fnValidarIntegracaoContasReceberSAP(idConsolidacaoFatura, StAtualizarComError = true){
    let docEntryContasReceberSAP = fnGetDocEntryContasReceberSAP(idConsolidacaoFatura);
    
    if(docEntryContasReceberSAP){
        return fnGravarLogSucessoContasReceber(idConsolidacaoFatura, docEntryContasReceberSAP);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idConsolidacaoFatura, 'Erro ao tentar integrar o contas a receber');
        }
    }
    
    return false;
}

function fnGravarLogSucessoContasReceber(idConsolidacaoFatura, docEntryContasReceberSAP){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."CONSOLIDACAOFATURA" 
        SET 
            ERROR_LOG_SAP = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_RECEBER = CURRENT_TIMESTAMP,
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            DOCENTRY_SAP_CONTAS_A_RECEBER = ?
        WHERE 
            IDCONSOLIDACAOFATURA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, docEntryContasReceberSAP);
	pStmtUpdate.setInt(2, Number(idConsolidacaoFatura));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return true;
}

function fnGravarLogError(idConsolidacaoFatura, p_Error){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."CONSOLIDACAOFATURA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            ERROR_LOG_SAP = ? 
        WHERE 
            IDCONSOLIDACAOFATURA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setInt(2, Number(idConsolidacaoFatura));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return false;
}

function fnBloquearLinhaEnquantoAtualiza(dados){
    let ids = '';
    
    for (var i = 0; i < dados.length; i++) {
        let { IDCONSOLIDACAOFATURA } = dados[i];
        
        ids += IDCONSOLIDACAOFATURA;
        ids += i < (dados.length - 1) ? ', ' : '';
    }
    
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."CONSOLIDACAOFATURA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'True'
        WHERE 
            IDCONSOLIDACAOFATURA IN (${ids}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.execute();
    pStmtUpdate.close();
    
    conn.commit();
}

function fnDesbloquearLinhas(dados){
    let ids = '';
    
    for (var i = 0; i < dados.length; i++) {
        let { IDCONSOLIDACAOFATURA } = dados[i];
        
        ids += IDCONSOLIDACAOFATURA;
        ids += i < (dados.length - 1) ? ', ' : '';
    }
    
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."CONSOLIDACAOFATURA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False'
        WHERE 
            IDCONSOLIDACAOFATURA IN (${ids}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.execute();
    pStmtUpdate.close();
    
    conn.commit();
}

function fnMontarJsonContasReceber(dados){
    let {
        IDCONSOLIDACAOFATURA,
        DTPROCESSAMENTO,
        VRTOTAL,
        IDEMPRESA
    } = dados || '';
    let dtDoc = DTPROCESSAMENTO;
    let contaPix = '1.01.01.01.9997';
    let cashAccount = fnGetContaBancoEmpresa(IDEMPRESA);
    let accountCode = '2.01.06.01.0001';
    let vrDoc = Number(VRTOTAL);
    let series = 15;
    
    return {
        "DocType": "rAccount", //fixo
        "DocDate": dtDoc,
        "CashAccount": cashAccount,
        "CashSum": vrDoc,
        "Reference2": `Integração CONSOLIDACAO FATURAS(${IDCONSOLIDACAOFATURA}) Quality`,
        "Remarks": `Integração CONSOLIDACAO FATURAS(${IDCONSOLIDACAOFATURA}) Quality`,
        "JournalRemarks": `Integração CONSOLIDACAO FATURAS(${IDCONSOLIDACAOFATURA}) Quality`,
        "TaxDate": dtDoc,
        "Series": series,
        "DueDate": dtDoc,
        "BPLID": IDEMPRESA,
        "U_IS_ID_QUALITY": String(IDCONSOLIDACAOFATURA),
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": accountCode,
                "SumPaid": vrDoc
            }
        ]
    };
}

function postSlContasReceber(data) {
    let response = slApi.post('/IncomingPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return fnGravarLogError(data.U_IS_ID_QUALITY, (response.error.message.value || 'Erro ao tentar integrar a consolidacao faturas'));
    }
    
    fnValidarIntegracaoContasReceberSAP(data.U_IS_ID_QUALITY);
}

function integrarFaturasNoSAP(byId) {
	let bodyJson = JSON.parse($.request.body.asString()); 

    if(bodyJson.length > 0){
        for (let registro of bodyJson) {
            let ids = registro.IDS_CONSOLIDACOES.replace(/\'/g, '');
            
            let query = `
                SELECT 
                    IDCONSOLIDACAOFATURA,
                    IDEMPRESA,
                    TO_VARCHAR(DTPROCESSAMENTO, 'YYYY-MM-DD') AS DTPROCESSAMENTO,
                    VRTOTAL
                FROM
                    "VAR_DB_NAME".CONSOLIDACAOFATURA
                WHERE
                    1 = ?
                    AND STCANCELADO = 'False'
                    AND STATUS_BLOQUEIO_ATUALIZACAO = 'False'
                    AND IFNULL(DOCENTRY_SAP_CONTAS_A_RECEBER, 0) = 0
                    AND IDCONSOLIDACAOFATURA IN (${ids})
                ORDER BY
                    IDCONSOLIDACAOFATURA
            `;
            
            let regConsolidacoes = ids.length > 0 ? api.sqlQuery(query, 1) : '';
            
            if(regConsolidacoes.length === 0){
                return { msg: "CONSOLIDACAO DE FATURA JÁ INTEGRADA OU CANCELADA OU NÃO EXISTE!" };
            }
            
            conn = $.db.getConnection();
            
            fnBloquearLinhaEnquantoAtualiza(regConsolidacoes);
            
            session = slApi.loginServiceLayer(true);
            slApi.loginServiceLayer(true);
            
            //let dados = []; 
            for (let registro of regConsolidacoes) {
                let { IDCONSOLIDACAOFATURA } = registro;
                
                let stIntegrarNaContaBanco = !fnValidarIntegracaoContasReceberSAP(IDCONSOLIDACAOFATURA, false);
                if(stIntegrarNaContaBanco){
                    let dadosJsonContasReceber = fnMontarJsonContasReceber(registro);
                    //dados.push(dadosJsonContasReceber)
                    postSlContasReceber(dadosJsonContasReceber);
                }
            }
            
            fnDesbloquearLinhas(regConsolidacoes);
            
            //return {dados}
        }
        
    }
	
	return 'Migração Consolidações de Faturas realizada com sucesso!';
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