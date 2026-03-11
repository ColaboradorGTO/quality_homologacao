let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function adicionarRelacaoDetalheFatura(idConsolidacaoFatura, registro, conn){
    let query = `
        UPDATE
            "VAR_DB_NAME".DETALHEFATURA
        SET
            IDCONSOLIDACAOFATURA = ?
        WHERE
            STCONFERIDO = 'True'
            AND STCANCELADO = 'False'
            AND IDCONSOLIDACAOFATURA IS NULL
            AND IDEMPRESA = ?
            AND DTPROCESSAMENTO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, idConsolidacaoFatura);
    pStmt.setInt(2, registro.IDEMPRESA);
    pStmt.setDate(3, registro.DTPROCESSAMENTO);
    
    pStmt.execute();
    pStmt.close();
}

function removerRelacaoDetalheFatura(idConsolidacaoFatura, conn){
    let query = `
        UPDATE
            "VAR_DB_NAME".DETALHEFATURA
        SET
            IDCONSOLIDACAOFATURA = NULL
        WHERE
            IDCONSOLIDACAOFATURA = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, idConsolidacaoFatura);
    
    pStmt.execute();
    pStmt.close();
}

function fnHandleGet(byId) {
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    
    let query = `
        SELECT
            TBCF.IDCONSOLIDACAOFATURA,
            TBCF.IDEMPRESA,
            TBE.NOFANTASIA,
            TO_VARCHAR(TBCF.DTPROCESSAMENTO, 'YYYY-MM-DD') AS DTPROCESSAMENTO,
            TBCF.QTDFATURAS,
            TBCF.VRTOTAL,
            TBF.NOFUNCIONARIO AS NOUSRCRIACAO,
            TBCF.IDUSRCRIACAO,
            TBCF.DTHORACRIACAO,
            TBCF.STCANCELADO,
            TBCF.IDUSRCANCELAMENTO,
            TBF_CANCELAMENTO.NOFUNCIONARIO AS NOUSRCANCELAMENTO,
            TO_VARCHAR(TBCF.TXTMOTIVOCANCELAMENTO) AS TXTMOTIVOCANCELAMENTO,
            TBCF.IDUSRMIGRACAO,
            TBCF.DOCENTRY_SAP_CONTAS_A_RECEBER,
            TBCF.DT_HORA_INTEGRACAO_CONTAS_A_RECEBER,
            TBCF.STATUS_BLOQUEIO_ATUALIZACAO,
            TO_VARCHAR(TBCF.ERROR_LOG_SAP) AS ERROR_LOG_SAP
        FROM
            "VAR_DB_NAME".CONSOLIDACAOFATURA TBCF
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBCF.IDEMPRESA = TBE.IDEMPRESA
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON
            TBCF.IDUSRCRIACAO = TBF.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBF_CANCELAMENTO ON
            TBCF.IDUSRCANCELAMENTO  = TBF_CANCELAMENTO.IDFUNCIONARIO
        WHERE 
            1 = ?
    `;
    
    if ( byId ) {
        query += ` AND TBCF.IDCONSOLIDACAOFATURA = ${byId} `;
    }
    
    if(idEmpresa > 0) {
        query += ` AND TBCF.IDEMPRESA = ${idEmpresa} `;
    }
    
    if(dtInicio && dtFim) {
        query += ` AND (TO_DATE(TBCF.DTPROCESSAMENTO) BETWEEN '${dtInicio}' AND '${dtFim}') `;
    }
    
    query += ' ORDER BY TO_DATE(TBCF.DTPROCESSAMENTO), TBCF.IDCONSOLIDACAOFATURA'

    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let query = `
        UPDATE
            "VAR_DB_NAME".CONSOLIDACAOFATURA
        SET
            IDUSRCANCELAMENTO = ?,
            STCANCELADO = ?,
            TXTMOTIVOCANCELAMENTO = ?,
            DTHORACANCELAMENTO = CURRENT_TIMESTAMP
        WHERE
            IDCONSOLIDACAOFATURA = ?
    `;
    
    let conn = $.db.getConnection();
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString()); 
    if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
	for(let registro of bodyJson){
        
        pStmt.setInt(1, registro.IDFUNCIONARIO);
        pStmt.setString(2, registro.STCANCELADO);
        pStmt.setString(3, registro.TXTMOTIVOCANCELAMENTO);
        pStmt.setInt(4, registro.IDCONSOLIDACAOFATURA);
        
        pStmt.execute();
        pStmt.close();
        
        removerRelacaoDetalheFatura(registro.IDCONSOLIDACAOFATURA, conn);
	}

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    let query = `
        INSERT INTO
            "VAR_DB_NAME".CONSOLIDACAOFATURA
        (
            IDCONSOLIDACAOFATURA,
            IDEMPRESA,
            DTPROCESSAMENTO,
            QTDFATURAS,
            VRTOTAL,
            IDUSRCRIACAO
        )
        VALUES(?, ?, ?, ?, ?, ?);
    `;
    
    let conn = $.db.getConnection();
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString()); 
    
    if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    
	for(let registro of bodyJson){
        let newId = Number(api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_CONSOLIDACAOFATURA".NEXTVAL FROM DUMMY WHERE 1 = ?', 1));
        
        pStmt.setInt(1, newId);
        pStmt.setInt(2, registro.IDEMPRESA);
        pStmt.setDate(3, registro.DTPROCESSAMENTO);
        pStmt.setFloat(4, registro.QTDTOTALFATURAS);
        pStmt.setFloat(5, registro.VRTOTALRECEBIDO);
        pStmt.setInt(6, registro.IDFUNCIONARIO);
        
        pStmt.execute();
        
        adicionarRelacaoDetalheFatura(newId, registro, conn);
	}
    
    pStmt.close();

	conn.commit();
	
	return {
	    msg : "Inclusão realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        case $.net.http.GET:
            fnHandleGet();
            break;
        
        case $.net.http.POST:
            var docReturn = fnHandlePost();
            $.response.setBody(JSON.stringify(docReturn));
            break;
        
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
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