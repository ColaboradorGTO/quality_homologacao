var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    let idMarca = $.request.parameters.get("idMarca");
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let cpfOperadorQuebra = $.request.parameters.get("cpfOperadorQuebra");
    let dtInicio = $.request.parameters.get("dtInicio"); 
    let dtFim = $.request.parameters.get("dtFim"); 
    let tpQuebra = $.request.parameters.get("tpQuebra");
    let stAtivo = $.request.parameters.get("stAtivo");
    let stConferido = $.request.parameters.get("stConferido");
    
    let query = `
        SELECT  
            TBQC.IDQUEBRACAIXA, 
            TBE.NOFANTASIA, 
            TBQC.IDCAIXAWEB, 
            TBQC.IDMOVIMENTOCAIXA, 
            TBQC.IDGERENTE, 
            TBQC.IDFUNCIONARIO, 
            TO_VARCHAR(TBQC.DTLANCAMENTO,'DD-MM-YYYY') AS DTLANCAMENTO, 
            TBQC.VRQUEBRASISTEMA, 
            TBQC.VRQUEBRAEFETIVADO, 
            TBQC.TXTHISTORICO, 
            TBQC.STATIVO, 
            TBQC.STCONFERIDO,
            TBQC.IDUSRCONFERENCIA,
            TBF.NOFUNCIONARIO AS NOMEOPERADOR,
            TBF.DSFUNCAO,
            TBF.NUCPF AS CPFOPERADOR,
            TBF1.NOFUNCIONARIO AS NOMEGERENTE,
            TBQC.DOCENTRY_SAP_CONTAS_A_PAGAR,
            TBQC.DOCENTRY_SAP_CONTAS_A_RECEBER,
            TBQC.STATUS_BLOQUEIO_ATUALIZACAO,
            TBQC.ERROR_LOG_SAP
        FROM 
            "VAR_DB_NAME".QUEBRACAIXA TBQC
        LEFT JOIN "VAR_DB_NAME".MOVIMENTOCAIXA TBMC ON 
            TBQC.IDMOVIMENTOCAIXA = TBMC.ID
        LEFT JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBMC.IDEMPRESA = TBE.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON 
            TBQC.IDFUNCIONARIO = TBF.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBF1 ON 
            TBQC.IDGERENTE = TBF1.IDFUNCIONARIO
        WHERE
            1 = ?
            AND TBQC.VRQUEBRAEFETIVADO <> 0
    `;
    
    if ( byId ) {
        query += ` AND TBQC.IDMOVIMENTOCAIXA = '${byId}' `; 
    }
    
    if ( idMarca ) {
        query += ` AND TBE.IDGRUPOEMPRESARIAL = '${idMarca}' `;
    }
    
    if ( idEmpresa ) {
        query +=  ` AND TBMC.IDEMPRESA = '${idEmpresa}' `;
    }
    
    if ( cpfOperadorQuebra ) {
        query += ` AND TBF.NUCPF = '${cpfOperadorQuebra}' `;
    }
    
    if( dtInicio && dtFim ) {
        query += ` AND (TO_DATE(TBQC.DTLANCAMENTO) BETWEEN '${dtInicio}' AND '${dtFim}') `;
    }
    
    if( tpQuebra ){
        tpQuebra = tpQuebra == "Positiva" ? '>' : '<';
        
        query += ` AND TBQC.VRQUEBRAEFETIVADO ${tpQuebra} 0.0 `;
    }
    
    if ( stAtivo ) {
        query += ` AND TBQC.STATIVO = '${stAtivo}' `;
    }
    
    if ( stConferido ) {
        query += ` AND TBQC.STCONFERIDO = '${stConferido}' `;
    }
  
    query += ' ORDER BY TBQC.DTLANCAMENTO, TBQC.IDQUEBRACAIXA';
  
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here

        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}