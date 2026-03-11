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

function fnGetDocEntryContasPagarSAP(idDoc, JrnlMemo){
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
    
    let result = api.sqlQuery(query, idDoc);
    
    if(result.length > 0){
        return Number(result[0]["DocEntry"]);
    }
    
    return null;
}

function fnValidarIntegracaoContasPagarSAP(idDoc, idFuncionario, JrnlMemo, StAtualizarComError = true){
    let docEntryContasPagarSAP = fnGetDocEntryContasPagarSAP(idDoc, JrnlMemo);
    
    if(docEntryContasPagarSAP){
        return fnGravarLogSucessoContasPagarSAP(idDoc, idFuncionario, docEntryContasPagarSAP);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idDoc, 'Erro ao tentar integra o contas a pagar');
        }
    }
    
    return false;
}

function fnGravarLogSucessoContasPagarSAP(idDoc, idFuncionario, docEntryContasPagarSAP){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."ADIANTAMENTOSALARIAL" 
        SET 
            ERROR_LOG_SAP  = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_PAGAR = CURRENT_TIMESTAMP,
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            DOCENTRY_SAP_CONTAS_A_PAGAR = ?,
            IDUSRMIGRACAO = ${ idFuncionario || "IDUSRMIGRACAO" }
        WHERE 
            IDADIANTAMENTOSALARIO = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, docEntryContasPagarSAP);
	pStmtUpdate.setInt(2, Number(idDoc));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();
    
	return true;
}

function fnGravarLogError(idDespesa, p_Error){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."ADIANTAMENTOSALARIAL" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            ERROR_LOG_SAP = ? 
        WHERE 
            IDADIANTAMENTOSALARIO = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setInt(2, Number(idDespesa));
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return false;
}

function fnAtualizarBloqueioLinhaEnquantoAtualiza(ids, stBloquear){
    let statusBloquear = stBloquear ? 'True' : 'False';
    
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."ADIANTAMENTOSALARIAL" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = '${statusBloquear}'
        WHERE 
            IDADIANTAMENTOSALARIO IN (${ids}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.execute();
    pStmtUpdate.close();
    
    conn.commit();
}

function fnMontarJsonContasPagar(dados){
    let {
        IDADIANTAMENTOSALARIO,
        DTLANCAMENTO,
        VRVALORDESCONTO,
        TXTMOTIVO,
        IDEMPRESA,
        CPF_FUNCIONARIO,
        NOFUNCIONARIO,
        CPF_GERENTE
    } = dados || '';
    
    let dateDoc = DTLANCAMENTO;
    let cashAccount = fnGetContaEmpresa(IDEMPRESA);
    let accountCode = '1.01.03.05.0001';// Fixo
    let series = 18;
    let vrDoc = Number(VRVALORDESCONTO);
    let JrnlMemo = (`Integração ADIANTAMENTO SALARIAL(${IDADIANTAMENTOSALARIO}) Quality, CPF(${CPF_FUNCIONARIO}), Motivo: ${TXTMOTIVO}`).replace(/\s+/g, ' ').trim();
    
    return {
        "DocType": "rAccount", //fixo
        "DocDate": dateDoc,
        "CashAccount": cashAccount,
        "CashSum": vrDoc,
        //"Reference1": CPF_FUNCIONARIO,
        //"Reference2": NOFUNCIONARIO,//`Integração ADIANTAMENTO SALARIAL(${IDADIANTAMENTOSALARIO}) Quality`,
        "Remarks": JrnlMemo,
        "JournalRemarks": JrnlMemo,
        "TaxDate": dateDoc,
        "Series": series,
        "DueDate": dateDoc,
        "BPLID": IDEMPRESA,
        "U_IS_ID_QUALITY": String(IDADIANTAMENTOSALARIO),
        "U_ITV_Num_Caixa": CPF_GERENTE,
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": accountCode,
                "SumPaid": vrDoc,
                "Decription": (`Motivo: ${TXTMOTIVO}`).replace(/\s+/g, ' ').trim()
            }
        ]
    };
}

function postSlContasPagar(data, idFuncionario, JrnlMemo) {
    let response = slApi.post('/VendorPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return fnGravarLogError(Number(data.U_IS_ID_QUALITY), (response.error.message.value || 'Erro ao tentar integra o Contas a Pagar'));
    }

    return fnValidarIntegracaoContasPagarSAP(Number(data.U_IS_ID_QUALITY), idFuncionario, JrnlMemo);
}

function integrarAdiantamentosSalariaisNoSAP(byId) {
    let query = `
        SELECT
            TBA.IDADIANTAMENTOSALARIO,
            TO_VARCHAR(TBA.DTLANCAMENTO, 'YYYY-MM-DD') AS DTLANCAMENTO,
            TBA.VRVALORDESCONTO,
            TO_VARCHAR(TBA.TXTMOTIVO) AS TXTMOTIVO,
            TBA.IDEMPRESA,
            TBF.NUCPF AS CPF_FUNCIONARIO,
            TBF.NOFUNCIONARIO,
            TBF2.NUCPF AS CPF_GERENTE
        FROM
            "VAR_DB_NAME".ADIANTAMENTOSALARIAL TBA
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON
            TBA.IDFUNCIONARIO = TBF.IDFUNCIONARIO 
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF2 ON
            TBA.IDUSR = TBF2.IDFUNCIONARIO
        WHERE
            1 = ?
            AND TBA.STATIVO = 'True'
            AND TBA.STATUS_BLOQUEIO_ATUALIZACAO = 'False'
            --AND IFNULL(TO_VARCHAR(TBA.ERROR_LOG_SAP), '') = ''
            AND IFNULL(TBA.DOCENTRY_SAP_CONTAS_A_PAGAR, 0) = 0
    `;
	
	var bodyJson = JSON.parse($.request.body.asString()); 
    
    if(bodyJson.length > 0){
        let ids = '';
        let idFuncionario = null;
        
        for (let i = 0; i < bodyJson.length; i++) {
            let registro = bodyJson[i];
            ids += registro.IDADIANTAMENTOSALARIO;
            ids += i < (bodyJson.length - 1) ? ', ' : '';
            
            if(!idFuncionario){
                idFuncionario = registro.IDFUNCIONARIO;
            }
        }
        
        query += `AND TBA.IDADIANTAMENTOSALARIO IN (${ids})`;
        
        let resultQuery = ids.length > 0 ? api.sqlQuery(query, 1) : '';
        
        if(resultQuery.length === 0){
            return { msg: "ADIANTAMENTO SALARIAL JÁ INTEGRADO OU CANCELADO OU NÃO EXISTE!" };
        }
        //return {resultQuery}
        conn = $.db.getConnection();
        
       fnAtualizarBloqueioLinhaEnquantoAtualiza(ids, true);
        
        session = slApi.loginServiceLayer(true);
        slApi.loginServiceLayer(true);
        
        for (let i = 0; i < resultQuery.length; i++) {
            let registro = resultQuery[i];
            let {
                IDADIANTAMENTOSALARIO,
                TXTMOTIVO,
                CPF_FUNCIONARIO,
            } = registro || '';
            
            let JrnlMemo = (`Integração ADIANTAMENTO SALARIAL(${IDADIANTAMENTOSALARIO}) Quality, CPF(${CPF_FUNCIONARIO}), Motivo: ${TXTMOTIVO}`).replace(/\s+/g, ' ').trim();
            
            let stIntegrar = !fnValidarIntegracaoContasPagarSAP(IDADIANTAMENTOSALARIO, null, JrnlMemo, false);
            
            if(stIntegrar){
                let dadosJsonContasPagar = fnMontarJsonContasPagar(registro);
                //return {dadosJsonContasPagar}
                postSlContasPagar(dadosJsonContasPagar, idFuncionario, JrnlMemo);
            }
        }
        
        fnAtualizarBloqueioLinhaEnquantoAtualiza(ids, false);
    }
	
	return 'Migração adiantamentos salariais realizada com sucesso!';
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                let id = $.request.parameters.get("id");
                let docReturn = integrarAdiantamentosSalariaisNoSAP(id);
                
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