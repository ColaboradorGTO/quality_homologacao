let rootPath = getRootPath();

let api = $.import(rootPath + ".api.apiResponse", "int_api");
let slApi = $.import(rootPath + ".api.service-layer", "api");
let dbNameSAP = 'SBO_GTO_TESTE4';

let conn;
let session;

function getRootPath() {
    let fullPath = $.request.path.replace(/^\//, '').split('/');
    let idxPath = fullPath.findIndex(item => item.toLowerCase().includes('concentrador'));

    if (idxPath === -1) {
        return fullPath.join('.');
    }

    let path = fullPath.slice(0, idxPath + 1).join('.');

    return path;
}


function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnGetDocEntryContasReceberSAP(idVendaPagamento){
    let query = `
        SELECT
            TBO."DocEntry"
        FROM 
            ${dbNameSAP}.ORCT TBO
        WHERE
            TBO."Canceled" = 'N'
            AND TBO."U_IS_ID_QUALITY" = ?
    `;
    
    let result = api.sqlQuery(query, idVendaPagamento);
    
    if(result.length > 0){
        return Number(result[0]["DocEntry"]);
    }
    
    return null;
}

function fnValidarIntegracaoContasReceberSAP(idVendaPagamento, StAtualizarComError = true){
    let docEntryContasReceberSAP = fnGetDocEntryContasReceberSAP(idVendaPagamento);
    
    if(docEntryContasReceberSAP){
        return fnGravarLogSucessoContasReceber(idVendaPagamento, docEntryContasReceberSAP);
    } else {
        if(StAtualizarComError){
            fnGravarLogError(idVendaPagamento, 'Erro ao tentar integra o contas a receber');
        }
    }
    
    return false;
}

function fnGravarLogSucessoContasReceber(idVendaPagamento, docEntryContasReceberSAP){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."VENDAPAGAMENTO" 
        SET 
            ERROR_LOG_SAP_PIX = NULL,
            DT_HORA_INTEGRACAO_CONTAS_A_RECEBER_PGTO_PIX = CURRENT_TIMESTAMP,
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX = ?
        WHERE 
            IDVENDAPAGAMENTO = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, docEntryContasReceberSAP);
	pStmtUpdate.setString(2, idVendaPagamento);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return true;
}

function fnGravarLogError(idVendaPagamento, p_Error){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."VENDAPAGAMENTO" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'False',
            ERROR_LOG_SAP_PIX = ? 
        WHERE 
            IDVENDAPAGAMENTO = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setString(2, idVendaPagamento);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return false;
}

function fnBloquearLinhaEnquantoAtualiza(dadosPagamentoPix){
    let ids = '';
    
    for (var i = 0; i < dadosPagamentoPix.length; i++) {
        let { IDVENDAPAGAMENTO } = dadosPagamentoPix[i];
        
        ids += "'" + IDVENDAPAGAMENTO + "'";
        ids += i < (dadosPagamentoPix.length - 1) ? ', ' : '';
    }
    
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."VENDAPAGAMENTO" 
        SET 
            STATUS_BLOQUEIO_ATUALIZACAO = 'True'
        WHERE 
            IDVENDAPAGAMENTO IN (${ids}) 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.execute();
    pStmtUpdate.close();
    
    conn.commit();
}

function fnMontarJsonContasReceber(dadosPagamentoPix){
    let {
        IDVENDAPAGAMENTO,
        IDVENDA,
        IDCAIXAWEB,
        DTCOMPENSACAO,
        NUAUTORIZACAO,
        IDEMPRESA,
        NOFANTASIA,
        CODPARCEIRO,
        VRPIX
    } = dadosPagamentoPix || '';
    let dataDoc = DTCOMPENSACAO;
    let cashAccount = '1.01.01.02.0003'; // Conta Banco Destino(ITAU)
    let accountCode = '1.01.01.01.9998'; // Conta Transferencias PIX
    let cardCode = CODPARCEIRO; // Consumidor Final da Loja
    let series = 15;
    
    return {
        "DocType": "rAccount", //fixo
        "DocDate": dataDoc,
        "TaxDate": dataDoc,
        "DueDate": dataDoc,
        "CashAccount": cashAccount,
        "CashSum": Number(VRPIX),
        "Reference2": `Vendas PIX ${dataDoc}`,
        "Remarks": `Pagamento Pix Codigo de Autorização: ${NUAUTORIZACAO}`,
        "JournalRemarks": `Pagamento Pix Codigo de Autorização: ${NUAUTORIZACAO}`,
        "Series": series,
        "BPLID": IDEMPRESA,
        "U_IS_ID_QUALITY": String(IDVENDAPAGAMENTO),
        "U_ITV_Num_Caixa": String(IDCAIXAWEB),
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": accountCode,
                "SumPaid": Number(VRPIX)
            }
        ]
    };
}

function postSlContasReceber(data) {
    let response = slApi.post('/IncomingPayments', data, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return fnGravarLogError(data.U_IS_ID_QUALITY, (response.error.message.value || 'Erro ao tentar integrar o pagamento pix'));
    }
    
    return fnValidarIntegracaoContasReceberSAP(data.U_IS_ID_QUALITY);
}

function integrarPagamentosPixNoSAP(byId) {
    let query = `
        SELECT
            TBVP.IDVENDAPAGAMENTO,
            TBV.IDVENDA,
            TBV.IDCAIXAWEB,
            IFNULL ((TBVP.VALORRECEBIDO),0) AS VRPIX,
            TO_VARCHAR(DATA_COMPENSACAO, 'YYYY-MM-DD') AS DTCOMPENSACAO,
            TBVP.NUAUTORIZACAO,
            TBE.IDEMPRESA,
            TBE.NOFANTASIA,
            TBE.CODPARCEIRO
        FROM
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".VENDAPAGAMENTO TBVP ON 
            TBV.IDVENDA = TBVP.IDVENDA
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBV.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            1 = ?
            AND TBV.STCANCELADO = 'False'
            AND IFNULL(TBVP.STCANCELADO, 'False') = 'False'
            AND TBVP.NOTEF = 'PIX' 
            AND TBVP.DSTIPOPAGAMENTO='PIX'
            AND TBV.STCONFERIDO = 'True'
            AND TBVP.STATUS_BLOQUEIO_ATUALIZACAO = 'False'
            AND IFNULL(TBVP.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX, 0) = 0
    `;
    
	var bodyJson = JSON.parse($.request.body.asString()); 

    if(bodyJson.length > 0){
        let ids = '';
        
        for (let i = 0; i < bodyJson.length; i++) {
            let registro = bodyJson[i];
            ids += "'" + registro.IDVENDAPAGAMENTO + "'";
            ids += i < (bodyJson.length - 1) ? ', ' : '';
        }
        
        query += `AND TBVP.IDVENDAPAGAMENTO IN (${ids})`;
        
        let dadosPagamentoPix = ids.length > 0 ? api.sqlQuery(query, 1) : '';
        
        if(dadosPagamentoPix.length === 0){
            return { msg: "PAGAMENTO PIX JÁ INTEGRADO OU CANCELADO OU NÃO EXISTE!" };
        }
        
        conn = $.db.getConnection();
        
        fnBloquearLinhaEnquantoAtualiza(dadosPagamentoPix);
        
        session = slApi.loginServiceLayer(true);
        slApi.loginServiceLayer(true);
        
        for (let i = 0; i < dadosPagamentoPix.length; i++) {
            let registro = dadosPagamentoPix[i];
            let { IDVENDAPAGAMENTO } = registro || '';
            
            let stIntegrarNaContaBanco = !fnValidarIntegracaoContasReceberSAP(IDVENDAPAGAMENTO, false);
              
            if(stIntegrarNaContaBanco){
                let dadosJsonContasReceber = fnMontarJsonContasReceber(registro);
                //return {dadosJsonContasReceber}
                postSlContasReceber(dadosJsonContasReceber);
            }
        }
        
    }
	
	return 'Migração Pagamentos PIX realizada com sucesso!';
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                let id = $.request.parameters.get("id");
                let docReturn = integrarPagamentosPixNoSAP(id);
                
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