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

function fnGetDocEntryContasPagarSAP(idQuebraCaixa, JrnlMemo){
    let query = `
        SELECT
            TBO."DocEntry"
        FROM 
            ${dbNameSAP}.OVPM TBO
        WHERE
            TBO."Canceled" = 'N'
            AND TBO."JrnlMemo" LIKE '%${JrnlMemo}%'
            AND TBO."U_IS_ID_QUALITY" = ?
    `;
    
    let result = api.sqlQuery(query, idQuebraCaixa);
    
    if(result.length > 0){
        return Number(result[0]["DocEntry"]);
    }
    
    return null;
}

function fnGetDocEntryContasReceberSAP(idQuebraCaixa, JrnlMemo){
    let query = `
        SELECT
            TBO."DocEntry"
        FROM 
            ${dbNameSAP}.ORCT TBO
        WHERE
            TBO."Canceled" = 'N'
            AND TBO."JrnlMemo" LIKE '%${JrnlMemo}%'
            AND TBO."U_IS_ID_QUALITY" = ?
    `;
    
    let result = api.sqlQuery(query, idQuebraCaixa);
    
    if(result.length > 0){
        return Number(result[0]["DocEntry"]);
    }
    
    return null;
}

function fnValidarIntegracaoContasPagarSAP(idQuebraCaixa, JrnlMemo, StAtualizarComError = true){
    let docEntryContasPagarSAP = fnGetDocEntryContasPagarSAP(idQuebraCaixa, JrnlMemo);
    
    if(docEntryContasPagarSAP){
        return fnGravarLogSucessoContasPagarSAP(idQuebraCaixa, docEntryContasPagarSAP);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idQuebraCaixa, 'Erro ao tentar integra o contas a pagar');
        }
    }
    
    return false;
}

function fnValidarIntegracaoContasReceberSAP(idQuebraCaixa, JrnlMemo, StAtualizarComError = true){
    let docEntryContasReceberSAP = fnGetDocEntryContasReceberSAP(idQuebraCaixa, JrnlMemo);
    
    if(docEntryContasReceberSAP){
        return fnGravarLogSucessoContasReceber(idQuebraCaixa, docEntryContasReceberSAP);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idQuebraCaixa, 'Erro ao tentar integra o contas a receber');
        }
    }
    
    return false;
}

function fnGravarLogSucessoContasPagarSAP(idQuebraCaixa, docEntryContasPagarSAP){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET 
            ERROR_LOG_SAP = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_PAGAR = CURRENT_TIMESTAMP,
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            DOCENTRY_SAP_CONTAS_A_PAGAR = ?
        WHERE 
            IDQUEBRACAIXA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, docEntryContasPagarSAP);
	pStmtUpdate.setInt(2, Number(idQuebraCaixa));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return true;
}

function fnGravarLogSucessoContasReceber(idQuebraCaixa, docEntryContasReceberSAP){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET 
            ERROR_LOG_SAP = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_RECEBER = CURRENT_TIMESTAMP,
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            DOCENTRY_SAP_CONTAS_A_RECEBER = ?
        WHERE 
            IDQUEBRACAIXA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, docEntryContasReceberSAP);
	pStmtUpdate.setInt(2, Number(idQuebraCaixa));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return true;
}

function fnGravarLogError(idQuebraCaixa, p_Error){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            ERROR_LOG_SAP = ? 
        WHERE 
            IDQUEBRACAIXA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setInt(2, Number(idQuebraCaixa));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return false;
}

function fnBloquearLinhaEnquantoAtualiza(dados){
    let ids = '';
    
    for (var i = 0; i < dados.length; i++) {
        let { IDQUEBRACAIXA } = dados[i];
        
        ids += IDQUEBRACAIXA;
        ids += i < (dados.length - 1) ? ', ' : '';
    }
    
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'True'
        WHERE 
            IDQUEBRACAIXA IN (${ids}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.execute();
    pStmtUpdate.close();
    
    conn.commit();
}

function fnMontarJsonContasPagar(dados){
    let {
        IDQUEBRACAIXA,
        DTLANCAMENTO,
        VRQUEBRAEFETIVADO,
        NOFUNCIONARIO,
        NUCPF,
        IDEMPRESA,
        CPF_GERENTE
    } = dados || '';
    let dateDoc = DTLANCAMENTO;
    let vrDoc = Number(VRQUEBRAEFETIVADO.replace('-', '').trim());
    let cashAccount = fnGetContaCaixaEmpresa(IDEMPRESA);
    let accountCode = '1.01.03.05.0008';
    let series = 18;
    
    return {
        "DocType": "rAccount", //fixo
        "DocDate": dateDoc,
        "CashAccount": cashAccount,
        "CashSum": vrDoc,
        "Reference2": `Integração QUEBRA DE CAIXA FALTA(${IDQUEBRACAIXA}) Quality`,
        "Remarks": `${NOFUNCIONARIO} ${NUCPF}`,
        "JournalRemarks": `${NOFUNCIONARIO} ${NUCPF}`,
        "TaxDate": dateDoc,
        "Series": series,
        "DueDate": dateDoc,
        "BPLID": IDEMPRESA,
        "U_IS_ID_QUALITY": String(IDQUEBRACAIXA),
        "U_ITV_Num_Caixa": CPF_GERENTE,
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": accountCode,
                "SumPaid": vrDoc
            }
        ]
    };
}

function fnMontarJsonContasReceber(dados){
    let {
        IDQUEBRACAIXA,
        DTLANCAMENTO,
        VRQUEBRAEFETIVADO,
        NOFUNCIONARIO,
        NUCPF,
        IDEMPRESA,
        CPF_GERENTE
    } = dados || '';
    let dateDoc = DTLANCAMENTO;
    let vrDoc = Number(VRQUEBRAEFETIVADO.replace('-', '').trim());
    let cashAccount = fnGetContaCaixaEmpresa(IDEMPRESA);
    let accountCode = '2.01.01.02.0004';
    let series = 15;
    
    return {
        "DocType": "rAccount", //fixo
        "DocDate": dateDoc,
        "CashAccount": cashAccount,
        "CashSum": vrDoc,
        "Reference2": `Integração QUEBRA DE CAIXA SOBRA(${IDQUEBRACAIXA}) Quality`,
        "Remarks": `${NOFUNCIONARIO} ${NUCPF}`,
        "JournalRemarks": `${NOFUNCIONARIO} ${NUCPF}`,
        "TaxDate": dateDoc,
        "Series": series,
        "DueDate": dateDoc,
        "BPLID": IDEMPRESA,
        "U_IS_ID_QUALITY": String(IDQUEBRACAIXA),
        "U_ITV_Num_Caixa": CPF_GERENTE,
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": accountCode,
                "SumPaid": vrDoc
            }
        ]
    };
}

function postSlContasPagar(data, JrnlMemo) {
    let response = slApi.post('/VendorPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return fnGravarLogError(Number(data.U_IS_ID_QUALITY), (response.error.message.value || 'Erro ao tentar integra o Contas a Pagar'));
    }

    return fnValidarIntegracaoContasPagarSAP(Number(data.U_IS_ID_QUALITY), JrnlMemo);
}

function postSlContasReceber(data, JrnlMemo) {
    let response = slApi.post('/IncomingPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return fnGravarLogError(Number(data.U_IS_ID_QUALITY), (response.error.message.value || 'Erro ao tentar integra o Contas a Receber'));
    }
    
    return fnValidarIntegracaoContasReceberSAP(Number(data.U_IS_ID_QUALITY), JrnlMemo);
}

function integrarQuebrasDeCaixasNoSAP(byId) {
    let query = ` 
        SELECT
            TBQ.IDQUEBRACAIXA,
            TO_VARCHAR(TBQ.DTLANCAMENTO, 'YYYY-MM-DD') AS DTLANCAMENTO, 
            TO_VARCHAR(TBQ.TXTHISTORICO) AS TXTHISTORICO,
            TO_VARCHAR(TBQ.VRQUEBRAEFETIVADO) AS VRQUEBRAEFETIVADO,
            TBF.NOFUNCIONARIO,
            TBF.NUCPF,
            TBF2.NUCPF AS CPF_USER,
            TBM.IDEMPRESA
        FROM
            QUEBRACAIXA TBQ
        INNER JOIN FUNCIONARIO TBF ON 
            TBQ.IDFUNCIONARIO = TBF.IDFUNCIONARIO
        INNER JOIN FUNCIONARIO TBF2 ON 
            TBQ.IDGERENTE = TBF2.IDFUNCIONARIO
        INNER JOIN MOVIMENTOCAIXA TBM ON
            TBQ.IDMOVIMENTOCAIXA = TBM.ID 
        WHERE
            1 = ?
            AND TBQ.STATIVO = 'True'
            AND TBQ.STATUS_BLOQUEIO_ATUALIZACAO = 'False'
            --AND IFNULL(TO_VARCHAR(TBQ.ERROR_LOG_SAP), '') = ''
            AND (
                    (TBQ.VRQUEBRAEFETIVADO < 0 AND IFNULL(TBQ.DOCENTRY_SAP_CONTAS_A_PAGAR, 0) = 0)
                OR 
                    (TBQ.VRQUEBRAEFETIVADO > 0 AND IFNULL(TBQ.DOCENTRY_SAP_CONTAS_A_RECEBER, 0) = 0)
            )
    `;
	
	var bodyJson = JSON.parse($.request.body.asString()); 

    if(bodyJson.length > 0){
        let ids = '';
        
        for (let i = 0; i < bodyJson.length; i++) {
            let registro = bodyJson[i];
            ids += registro.IDQUEBRACAIXA;
            ids += i < (bodyJson.length - 1) ? ', ' : '';
        }
        
        query += `AND TBQ.IDQUEBRACAIXA IN (${ids})`;
        
        //return {query}
        
        let resultQuery = ids.length > 0 ? api.sqlQuery(query, 1) : '';
        
        if(resultQuery.length === 0){
            return { msg: "QUEBRA DE CAIXA JÁ INTEGRADA OU CANCELADA OU NÃO EXISTE!" };
        }
        
        // return {resultQuery}
        
        conn = $.db.getConnection();
        
        fnBloquearLinhaEnquantoAtualiza(resultQuery);
        
        session = slApi.loginServiceLayer(true);
        slApi.loginServiceLayer(true);
        
        for (let i = 0; i < resultQuery.length; i++) {
            let registro = resultQuery[i];
            let {
                IDQUEBRACAIXA,
                VRQUEBRAEFETIVADO,
                NOFUNCIONARIO,
                NUCPF
            } = registro || '';
            
            let JrnlMemo = (`${NOFUNCIONARIO} ${NUCPF}`).trim();
            
            if(Number(VRQUEBRAEFETIVADO) < 0){
                let stIntegrar = !fnValidarIntegracaoContasPagarSAP(IDQUEBRACAIXA, JrnlMemo, false);
                
                if(stIntegrar){
                    let dadosJsonContasPagar = fnMontarJsonContasPagar(registro);
                    //return {dadosJsonContasPagar}
                    postSlContasPagar(dadosJsonContasPagar, JrnlMemo);
                }
            } else {
                let stIntegrar = !fnValidarIntegracaoContasReceberSAP(IDQUEBRACAIXA, JrnlMemo, false);
                
                if(stIntegrar){
                    let dadosJsonContasReceber = fnMontarJsonContasReceber(registro);
                    //return {dadosJsonContasReceber}
                    postSlContasReceber(dadosJsonContasReceber, JrnlMemo);
                }
            }
        }
        
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
                let docReturn = integrarQuebrasDeCaixasNoSAP(id);
                
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