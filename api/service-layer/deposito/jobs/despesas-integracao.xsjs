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

function fnGetContaEmpresa(idEmpresa){
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

function fnGetContaDespesa(idCategoriaReceitaDespesa){
    let query = `
        SELECT
            "U_NfeAccount" AS NFE_ACCOUNT,
            "U_Account" AS ACCOUNT
        FROM 
            "SBO_GTO_PRD"."@DSP_CAIXA"
        WHERE
            "Code" = ?
    `;
    
    let result = api.sqlQuery(query, idCategoriaReceitaDespesa);
    
    if(result.length){
        return result[0];
    }
    
    return false;
}

function fnGetDocEntryContasPagarSAP(idDespesa, JrnlMemo){
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
    
    let result = api.sqlQuery(query, idDespesa);
    
    if(result.length > 0){
        return Number(result[0]["DocEntry"]);
    }
    
    return null;
}

function fnValidarIntegracaoContasPagarSAP(idDespesa, JrnlMemo, StAtualizarComError = true){
    let docEntryContasPagarSAP = fnGetDocEntryContasPagarSAP(idDespesa, JrnlMemo);
    
    if(docEntryContasPagarSAP){
        return fnGravarLogSucessoContasPagarSAP(idDespesa, docEntryContasPagarSAP);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idDespesa, 'Erro ao tentar integra o contas a pagar');
        }
    }
    
    return false;
}

function fnGravarLogSucessoContasPagarSAP(idDespesa, docEntryContasPagarSAP){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DESPESALOJA" 
        SET 
            ERROR_LOG_SAP  = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_PAGAR = CURRENT_TIMESTAMP,
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            DOCENTRY_SAP_CONTAS_A_PAGAR = ?
        WHERE 
            IDDESPESASLOJA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, docEntryContasPagarSAP);
	pStmtUpdate.setInt(2, Number(idDespesa));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();
    
	return true;
}

function fnGravarLogError(idDespesa, p_Error){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DESPESALOJA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            ERROR_LOG_SAP = ? 
        WHERE 
            IDDESPESASLOJA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setInt(2, Number(idDespesa));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return false;
}

function fnBloquearLinhaEnquantoAtualiza(dados){
    let ids = '';
    
    for (var i = 0; i < dados.length; i++) {
        let { IDDESPESASLOJA } = dados[i];
        
        ids += IDDESPESASLOJA;
        ids += i < (dados.length - 1) ? ', ' : '';
    }
    
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."DESPESALOJA" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'True'
        WHERE 
            IDDESPESASLOJA IN (${ids}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.execute();
    pStmtUpdate.close();
    
    conn.commit();
}

function fnMontarJsonContasPagar(dadosDeposito){
    let {
        IDDESPESASLOJA,
        IDCATEGORIARECEITADESPESA,
        IDEMPRESA,
        DTDESPESA,
        VRDESPESA,
        DSHISTORIO,
        DSPAGOA,
        NUCPF,
        TPNOTA
    } = dadosDeposito || '';
    
    let {
        NFE_ACCOUNT,
        ACCOUNT
    } = fnGetContaDespesa(IDCATEGORIARECEITADESPESA);
    
    let dateDoc = DTDESPESA;
    let cashAccount = fnGetContaEmpresa(IDEMPRESA);
    let accountCode = (TPNOTA == '1' || TPNOTA == '2') ? NFE_ACCOUNT : ACCOUNT;
    let series = 18;
    let vrDoc = Number(VRDESPESA);
    
    return {
        "DocType": "rAccount", //fixo
        "DocDate": dateDoc,
        "CashAccount": cashAccount,
        "CashSum": vrDoc,
        "Reference2": `Integração DESPESA(${IDDESPESASLOJA}) Quality`,
        "Remarks": `${DSHISTORIO} ${DSPAGOA}`,
        "JournalRemarks": `${DSHISTORIO} ${DSPAGOA}`,
        "TaxDate": dateDoc,
        "Series": series,
        "DueDate": dateDoc,
        "BPLID": IDEMPRESA,
        "U_IS_ID_QUALITY": String(IDDESPESASLOJA),
        "U_ITV_Num_Caixa": NUCPF,
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": accountCode,
                "SumPaid": vrDoc
            }
        ]
    };
}

function postSlContasPagar(data) {
    let response = slApi.post('/VendorPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return fnGravarLogError(Number(data.U_IS_ID_QUALITY), (response.error.message.value || 'Erro ao tentar integra o Contas a Pagar'));
    }

    return fnValidarIntegracaoContasPagarSAP(Number(data.U_IS_ID_QUALITY));
}

function integrarDepositosNoSAP(byId) {
    let query = ` 
        SELECT
            TBD.IDDESPESASLOJA,
            TBD.IDCATEGORIARECEITADESPESA,
            TBD.IDEMPRESA,
            TO_VARCHAR(TBD.DTDESPESA, 'YYYY-MM-DD') AS DTDESPESA,
            TBD.VRDESPESA,
            IFNULL(TO_VARCHAR(TBD.DSHISTORIO), '') AS DSHISTORIO,
            IFNULL(TBD.DSPAGOA, '') AS DSPAGOA,
            TBF.NUCPF,
            TBD.TPNOTA
        FROM
            "VAR_DB_NAME".DESPESALOJA TBD
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON 
            TBD.IDUSR = TBF.IDFUNCIONARIO
        WHERE
            1 = ?
            AND TBD.STATIVO = 'True'
            AND TBD.STCANCELADO = 'False'
            AND TBD.STATUS_BLOQUEIO_ATUALIZACAO = 'False'
            --AND IFNULL(TO_VARCHAR(TBD.ERRORLOGSAP), '') = ''
            AND IFNULL(TBD.DOCENTRY_SAP_CONTAS_A_PAGAR, 0) = 0
    `;
	
	var bodyJson = JSON.parse($.request.body.asString()); 

    if(bodyJson.length > 0){
        let ids = '';
        
        for (let i = 0; i < bodyJson.length; i++) {
            let registro = bodyJson[i];
            ids += registro.IDDESPESASLOJA;
            ids += i < (bodyJson.length - 1) ? ', ' : '';
        }
        
        query += `AND TBD.IDDESPESASLOJA IN (${ids})`;
        
        //return {query}
        
        let resultQuery = ids.length > 0 ? api.sqlQuery(query, 1) : '';
        
        if(resultQuery.length === 0){
            return { msg: "DESPESA JÁ INTEGRADA OU CANCELADA OU NÃO EXISTE!" };
        }
        //return {resultQuery}
        conn = $.db.getConnection();
        
        fnBloquearLinhaEnquantoAtualiza(resultQuery);
        
        session = slApi.loginServiceLayer(true);
        slApi.loginServiceLayer(true);
        
        for (let i = 0; i < resultQuery.length; i++) {
            let registro = resultQuery[i];
            let {
                IDDESPESASLOJA,
                IDCATEGORIARECEITADESPESA,
                IDEMPRESA,
                DTDESPESA,
                VRDESPESA,
                DSHISTORIO,
                DSPAGOA,
                NUCPF,
                TPNOTA
            } = registro || '';
            
            let JrnlMemo = (`${DSHISTORIO} ${DSPAGOA}`).trim();
            
            let stIntegrar = !fnValidarIntegracaoContasPagarSAP(IDDESPESASLOJA, JrnlMemo, false);
            
            if(stIntegrar){
                let dadosJsonContasPagar = fnMontarJsonContasPagar(registro);
                // return {dadosJsonContasPagar}
                postSlContasPagar(dadosJsonContasPagar);
            }
        }
        
    }
	
	return 'Migração despesas realizada com sucesso!';
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