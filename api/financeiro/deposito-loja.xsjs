var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var idDaConta = $.request.parameters.get("idConta");
    var idDeposito = $.request.parameters.get("idDep");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var dataCompInicio = $.request.parameters.get("dataCompInicio");
    var dataCompFim = $.request.parameters.get("dataCompFim");
    var dataMovInicio = $.request.parameters.get("datamovinicio");
    var dataMovFim = $.request.parameters.get("datamovfim");
    
    var query = `
        SELECT
            TBD.IDDEPOSITOLOJA,
            TO_VARCHAR(TBD.DTMOVIMENTOCAIXA,'DD/mm/YYYY HH24:MI:SS') AS DTMOVIMENTOCAIXA,
            TO_VARCHAR(TBD.DTDEPOSITO,'DD/mm/YYYY HH24:MI:SS') AS DTDEPOSITO,
            TBD.DTDEPOSITO AS DTDEPCOMPLETA,
            TO_VARCHAR(TBD.DTDEPOSITO,'YYYY-mm-DD') AS DTDEP,
            TBD.DTMOVIMENTOCAIXA AS DTMOVDEPCOMPLETA,
            TO_VARCHAR(TBD.DTMOVIMENTOCAIXA,'YYYY-mm-DD') AS DTMOVDEP,
            TO_VARCHAR(TBD.DTCOMPENSACAO,'DD/mm/YYYY HH24:MI:SS') AS DTCOMPENSACAO,
            TBD.DSHISTORIO,
            TBD.NUDOCDEPOSITO,
            TBD.VRDEPOSITO,
            TBD.STATIVO,
            TBD.STCANCELADO,
            TBD.STCONFERIDO,
            TO_VARCHAR(TBD.DTCOMPENSACAO,'DD/mm/YYYY HH24:MI:SS') AS DTCOMPENSACAODEP,
            TBC.IDCONTABANCO,
            TBC.DSCONTABANCO,
            TBC.NUCONTASAP,
            TBB.DSBANCO,
            TBF.NOFUNCIONARIO,
            TBE.NOFANTASIA,
            TBE.CONTACREDITOSAP,
            TO_VARCHAR(TBD.ERRORLOGSAP) AS ERRORLOGSAP,
            TBD.STATUS_BLOQUEIO_ATUALIZACAO,
            TBD.DOCENTRY_SAP_CONTAS_A_PAGAR,
            TBD.DOCENTRY_SAP_CONTAS_A_RECEBER,
            CASE 
                WHEN ((TBD.DTDEPOSITO <> TBD.DTCOMPENSACAO AND IFNULL(TBD.DOCENTRY_SAP_CONTAS_A_PAGAR, 0) = 0) OR IFNULL(TBD.DOCENTRY_SAP_CONTAS_A_RECEBER, 0) = 0) THEN 'False'
                ELSE 'True'
            END STINTEGRADOSAP
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
    `;
    
    if ( byId ) {
        query = query + ' And  TBD.IDDEPOSITOLOJA = \'' + byId + '\' ';
    }
    if ( idDeposito ) {
        query = query + ' And  TBD.IDDEPOSITOLOJA = \'' + idDeposito + '\' ';
    }
    if ( idDaConta ) {
        query = query + ' And  TBD.IDCONTABANCO = \'' + idDaConta + '\' ';
    }
    if(idDaEmpresa>0) {
        query = query + ' AND TBD.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (TBD.DTDEPOSITO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    if(dataCompInicio && dataCompFim) {
            query = query + ' AND (TBD.DTCOMPENSACAO BETWEEN \'' + dataCompInicio + ' 00:00:00\' AND \'' + dataCompFim + ' 23:59:59\')';
    }
    if(dataMovInicio && dataMovFim) {
            query = query + ' AND (TBD.DTMOVIMENTOCAIXA BETWEEN \'' + dataMovInicio + ' 00:00:00\' AND \'' + dataMovFim + ' 23:59:59\')';
    }
    
    query += ' ORDER BY TBD.IDDEPOSITOLOJA';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DEPOSITOLOJA" SET ' + 
        ' "STATIVO" =  ?, ' + 
        ' "STCANCELADO" =  ?, ' + 
        ' "IDUSRCACELAMENTO" = ?, ' + 
        ' "DSMOTIVOCANCELAMENTO" = ? ' + 
        ' WHERE "IDDEPOSITOLOJA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
        pStmt.setString(1, registro.STATIVO);
        pStmt.setString(2, registro.STCANCELADO);
        pStmt.setInt(3, registro.IDUSRCACELAMENTO);
        pStmt.setString(4, registro.DSMOTIVOCANCELAMENTO);
        pStmt.setInt(5, registro.IDDEPOSITOLOJA);
        
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
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