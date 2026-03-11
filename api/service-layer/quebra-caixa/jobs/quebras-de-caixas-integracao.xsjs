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

function getIdsQuebrasCaixas(dados){
    let ids = '';
    
    for (var i = 0; i < dados.length; i++) {
        let { IDQUEBRACAIXA } = dados[i];
        
        ids += IDQUEBRACAIXA;
        ids += i < (dados.length - 1) ? ', ' : '';
    }
    
    return ids;
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

function getQuebrasCaixa(dadosEnviados){
    let idFuncionarioMigracao = dadosEnviados[0].IDFUNCIONARIO;
    let idsQuebrasCaixas = getIdsQuebrasCaixas(dadosEnviados);
    
    let query = ` 
        SELECT
            TBQ.IDQUEBRACAIXA,
            TBM.IDEMPRESA, 
            ${idFuncionarioMigracao} AS IDUSRMIGRACAO,
            TO_VARCHAR(TBQ.DTLANCAMENTO, 'YYYY-MM-DD') AS DTLANCAMENTO, 
            TO_VARCHAR(TBQ.TXTHISTORICO) AS TXTHISTORICO,
            TO_VARCHAR(TBQ.VRQUEBRAEFETIVADO) AS VRQUEBRAEFETIVADO,
            TRIM(TBF.NOFUNCIONARIO) AS NOFUNCIONARIO,
            TRIM(TBF.NUCPF) AS NUCPF,
            TBF2.NUCPF AS CPF_USER
        FROM
            "VAR_DB_NAME".QUEBRACAIXA TBQ
        INNER JOIN "VAR_DB_NAME".MOVIMENTOCAIXA TBM ON
            TBQ.IDMOVIMENTOCAIXA = TBM.ID 
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON 
            TBQ.IDFUNCIONARIO = TBF.IDFUNCIONARIO
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF2 ON 
            TBQ.IDGERENTE = TBF2.IDFUNCIONARIO
        WHERE
            1 = ?
            AND TBQ.STATIVO = 'True'
            AND TBQ.STATUS_BLOQUEIO_ATUALIZACAO = 'False'
            AND IFNULL(TO_VARCHAR(TBQ.ERROR_LOG_SAP), '') = ''
            AND (
                    (TBQ.VRQUEBRAEFETIVADO < 0 AND IFNULL(TBQ.DOCENTRY_SAP_CONTAS_A_PAGAR, 0) = 0)
                OR 
                    (TBQ.VRQUEBRAEFETIVADO > 0 AND IFNULL(TBQ.DOCENTRY_SAP_CONTAS_A_RECEBER, 0) = 0)
            )
            AND TBQ.IDQUEBRACAIXA IN (${idsQuebrasCaixas})
        ORDER BY 
            TBQ.DTLANCAMENTO, 
            TBQ.IDQUEBRACAIXA
    `;

    return api.sqlQuery(query, 1) || [];
}

function fnValidarIntegracaoContasPagarSAP(idQuebraCaixa, JrnlMemo, idUserMigracao, StAtualizarComError = true){
    let docEntryContasPagarSAP = fnGetDocEntryContasPagarSAP(idQuebraCaixa, JrnlMemo);
    
    if(docEntryContasPagarSAP){
        return fnGravarLogSucessoContasPagarSAP(idQuebraCaixa, docEntryContasPagarSAP, idUserMigracao);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idQuebraCaixa, 'Erro ao tentar integra o contas a pagar', idUserMigracao);
        }
    }
    
    return false;
}

function fnValidarIntegracaoContasReceberSAP(idQuebraCaixa, JrnlMemo, idUserMigracao, StAtualizarComError = true){
    let docEntryContasReceberSAP = fnGetDocEntryContasReceberSAP(idQuebraCaixa, JrnlMemo);
    
    if(docEntryContasReceberSAP){
        return fnGravarLogSucessoContasReceber(idQuebraCaixa, docEntryContasReceberSAP, idUserMigracao);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idQuebraCaixa, 'Erro ao tentar integra o contas a receber', idUserMigracao);
        }
    }
    
    return false;
}

function fnGravarLogSucessoContasPagarSAP(idQuebraCaixa, docEntryContasPagarSAP, idUserMigracao){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET 
            ERROR_LOG_SAP = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_PAGAR = CURRENT_TIMESTAMP,
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            IDUSRMIGRACAO = ?,
            DOCENTRY_SAP_CONTAS_A_PAGAR = ?
        WHERE 
            IDQUEBRACAIXA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, idUserMigracao);
    pStmtUpdate.setInt(2, docEntryContasPagarSAP);
	pStmtUpdate.setInt(3, Number(idQuebraCaixa));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return true;
}

function fnGravarLogSucessoContasReceber(idQuebraCaixa, docEntryContasReceberSAP, idUserMigracao){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET 
            ERROR_LOG_SAP = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_RECEBER = CURRENT_TIMESTAMP,
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            IDUSRMIGRACAO = ?,
            DOCENTRY_SAP_CONTAS_A_RECEBER = ?
        WHERE 
            IDQUEBRACAIXA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, idUserMigracao);
    pStmtUpdate.setInt(2, docEntryContasReceberSAP);
	pStmtUpdate.setInt(3, Number(idQuebraCaixa));
	pStmtUpdate.executeUpdate();
	
	pStmtUpdate.close();
	conn.commit();

	return true;
}

function fnGravarLogError(idQuebraCaixa, p_Error, idUserMigracao){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            ERROR_LOG_SAP = ?, 
            IDUSRMIGRACAO = ?
        WHERE 
            IDQUEBRACAIXA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setInt(2, Number(idUserMigracao));
	pStmtUpdate.setInt(3, Number(idQuebraCaixa));
	
	pStmtUpdate.executeUpdate();
	
	pStmtUpdate.close();
	conn.commit();

	return false;
}

function fnBloquearLinhaEnquantoAtualiza(idsQuebrasCaixas){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'True'
        WHERE 
            IDQUEBRACAIXA IN (${idsQuebrasCaixas}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.executeUpdate();
    pStmtUpdate.close();
    
    conn.commit();
}

function fnDesbloquearLinhaEnquantoAtualiza(idsQuebrasCaixas){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."QUEBRACAIXA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False'
        WHERE 
            IDQUEBRACAIXA IN (${idsQuebrasCaixas}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.executeUpdate();
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

function postSlContasPagar(data, idUserMigracao) {
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    let response = slApi.post('/VendorPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        
        return fnGravarLogError(Number(data.U_IS_ID_QUALITY), (response.error.message.value || 'Erro ao tentar integra o Contas a Pagar'), idUserMigracao);
    }

    return fnValidarIntegracaoContasPagarSAP(Number(data.U_IS_ID_QUALITY), data.JournalRemarks, idUserMigracao);
}

function postSlContasReceber(data, idUserMigracao) {
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    let response = slApi.post('/IncomingPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        
        return fnGravarLogError(Number(data.U_IS_ID_QUALITY), (response.error.message.value || 'Erro ao tentar integra o Contas a Receber'), idUserMigracao);
    }
    
    return fnValidarIntegracaoContasReceberSAP(Number(data.U_IS_ID_QUALITY), data.JournalRemarks, idUserMigracao);
}

function integrarQuebrasDeCaixasNoSAP(byId) {
	let bodyJson = JSON.parse($.request.body.asString());

    if(bodyJson.length > 0){
        
        let dadosQuebrasCaixa = getQuebrasCaixa(bodyJson);
        
        if(dadosQuebrasCaixa.length === 0){
            return { msg: "QUEBRAS DE CAIXA JÁ INTEGRADAS OU CANCELADAS OU NÃO EXISTEM!" };
        }
        
        conn = $.db.getConnection();
        
        let idsQuebraCaixasValidados = getIdsQuebrasCaixas(dadosQuebrasCaixa);
        
        fnBloquearLinhaEnquantoAtualiza(idsQuebraCaixasValidados);
        
        for (let registro of dadosQuebrasCaixa) {
            let {
                IDQUEBRACAIXA,
                VRQUEBRAEFETIVADO,
                NOFUNCIONARIO,
                NUCPF,
                IDUSRMIGRACAO
            } = registro || '';
            
            let JrnlMemo = (`${NOFUNCIONARIO} ${NUCPF}`).trim();
            
            if(Number(VRQUEBRAEFETIVADO) >= 0){
                let stIntegrar = !fnValidarIntegracaoContasReceberSAP(IDQUEBRACAIXA, JrnlMemo, IDUSRMIGRACAO, false);
                
                if(stIntegrar){
                    let dadosJsonContasReceber = fnMontarJsonContasReceber(registro);
                    //return {dadosJsonContasReceber}
                    postSlContasReceber(dadosJsonContasReceber, IDUSRMIGRACAO);
                }
            } else {
                let stIntegrar = !fnValidarIntegracaoContasPagarSAP(IDQUEBRACAIXA, JrnlMemo, IDUSRMIGRACAO, false);
                
                if(stIntegrar){
                    let dadosJsonContasPagar = fnMontarJsonContasPagar(registro);
                    //return {dadosJsonContasPagar}
                    postSlContasPagar(dadosJsonContasPagar, IDUSRMIGRACAO);
                }
            } 
        }
        
        fnDesbloquearLinhaEnquantoAtualiza(idsQuebraCaixasValidados);
    }
	
	return 'Migração quebras de caixa realizada com sucesso!';
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