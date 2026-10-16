let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setStringOrNull(stmt, fieldId, value) {
    if (value) {
        stmt.setString(fieldId, value);
    } else {
        stmt.setNull(fieldId);
    }
}

function fnInserirHistoricoAdiantamento(conn, idAdiantamento, statusAnterior, statusNovo, acao, dsObservacao, idUsuario) {
    let queryHistorico = `
        INSERT INTO "VAR_DB_NAME"."ADIANTAMENTO_HISTORICO"
        (
            "IDADIANTAMENTO",
            "STATUSANTERIOR",
            "STATUSNOVO",
            "ACAO",
            "DSOBSERVACAO",
            "IDUSUARIO",
            "DATAACAO"
        )
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    let pStmtHistorico = conn.prepareStatement(api.replaceDbName(queryHistorico));

    pStmtHistorico.setInt(1, idAdiantamento);
    setStringOrNull(pStmtHistorico, 2, statusAnterior);
    pStmtHistorico.setString(3, statusNovo);
    pStmtHistorico.setString(4, acao);
    setStringOrNull(pStmtHistorico, 5, dsObservacao);
    pStmtHistorico.setInt(6, idUsuario);

    pStmtHistorico.execute();
    pStmtHistorico.close();
}

function fnHandleGet(id) {
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim"); 
    let status = $.request.parameters.get("status");
	let departamento = $.request.parameters.get("departamento");

    let query = `
          SELECT
            "IDADIANTAMENTO",
            "DEPARTAMENTO",
            "IDEMPRESA",
            "NUCNPJEMPRESA",
            "POSSUINOTAFISCAL",
            "CNPJFATURAMENTO",
            "RAZAOSOCIALFATURAMENTO",
            "VRSOLICITADO",
            "DESCRICAO",
            "ANEXOORCAMENTO",
            "ANEXONOTAFISCAL",
            "STATUS",
            "DSJUSTIFICATIVA",
            "IDUSUARIOCRIACAO",
            "DATACRIACAO",
            "IDUSUARIOALTERACAO",
            "DATAALTERACAO",
            "DATAFINALIZACAO",
            "STATIVO"
        FROM "VAR_DB_NAME"."ADIANTAMENTO_SOLICITACAO"
        WHERE 1 = ?
    `;
    
    if(id) {
        query += `AND "IDADIANTAMENTO" = '${id}'`
    }

    if(idEmpresa) {
        query += `AND "IDEMPRESA" = '${idEmpresa}'`
    }

    if (dataPesquisaInicio && dataPesquisaFim) {
        query += `
            AND TO_DATE("DATACRIACAO")
                BETWEEN '${dataPesquisaInicio}'
                AND '${dataPesquisaFim}'
        `;
    }

    if(status) {
        query += `AND "STATUS" = '${status}' `
    }

    if(departamento) {
        query += `AND "DEPARTAMENTO" = '${departamento}'`;
    }

    query += ` ORDER BY "DATACRIACAO" DESC `;

	let request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	api.responseWithQuery(query, request, 1);

}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    let queryStatusAnterior = `
            SELECT "STATUS"
            FROM "VAR_DB_NAME"."ADIANTAMENTO_SOLICITACAO"
            WHERE "IDADIANTAMENTO" = ?
    `;
    let query = `
        UPDATE "VAR_DB_NAME"."ADIANTAMENTO_SOLICITACAO"
        SET
            "DEPARTAMENTO" = ?,
            "IDEMPRESA" = ?,
            "NUCNPJEMPRESA" = ?,
            "POSSUINOTAFISCAL" = ?,
            "CNPJFATURAMENTO" = ?,
            "VRSOLICITADO" = ?,
            "DESCRICAO" = ?,
            "ANEXOORCAMENTO" = ?,
            "ANEXONOTAFISCAL" = ?,
            "RAZAOSOCIALFATURAMENTO" = ?,
            "STATUS" = ?,
            "DSJUSTIFICATIVA" = ?,
            "IDUSUARIOALTERACAO" = ?,
            "DATAALTERACAO" = CURRENT_TIMESTAMP
        WHERE "IDADIANTAMENTO" = ?
    `;

    let pStmtStatus = conn.prepareStatement(
        api.replaceDbName(queryStatusAnterior)
    );

    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    for (var i = 0; i < bodyJson.length; i++) {
        var registro = bodyJson[i];

        
        pStmtStatus.setInt(1, registro.IDADIANTAMENTO);

        let rsStatus = pStmtStatus.executeQuery();

        let statusAnterior = null;

        if (rsStatus.next()) {
            statusAnterior = rsStatus.getString(1);
        }

        rsStatus.close();

        pStmt.setString(1, registro.DEPARTAMENTO);
        pStmt.setInt(2, registro.IDEMPRESA);
        pStmt.setString(3, registro.NUCNPJEMPRESA);
        pStmt.setString(4, registro.POSSUINOTAFISCAL);
        pStmt.setString(5, registro.CNPJFATURAMENTO);
        pStmt.setFloat(6, registro.VRSOLICITADO);
        pStmt.setString(7, registro.DESCRICAO);
        setStringOrNull(pStmt, 8, registro.ANEXOORCAMENTO);
        setStringOrNull(pStmt, 9, registro.ANEXONOTAFISCAL);
        setStringOrNull(pStmt, 10, registro.RAZAOSOCIALFATURAMENTO);
        setStringOrNull(pStmt, 11, registro.STATUS);
        setStringOrNull(pStmt, 12, registro.DSJUSTIFICATIVA);
        pStmt.setInt(13, registro.IDUSUARIOALTERACAO);
        pStmt.setInt(14, registro.IDADIANTAMENTO);

        pStmt.execute();

        fnInserirHistoricoAdiantamento(
            conn,
            registro.IDADIANTAMENTO,
            statusAnterior,
            registro.STATUS,
            'ALTERACAO',
            registro.DSJUSTIFICATIVA || registro.DESCRICAO,
            registro.IDUSUARIOALTERACAO
        );
    }
    pStmtStatus.close();
    pStmt.close();

    conn.commit();

    return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    let conn = $.db.getConnection();
    var idAdiantamento = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDADIANTAMENTO")),0) + 1 FROM "VAR_DB_NAME"."ADIANTAMENTO_SOLICITACAO" WHERE 1 = ? ', 1);
    
    try {
        let query = ` 
                INSERT INTO "VAR_DB_NAME"."ADIANTAMENTO_SOLICITACAO"
            (
            "IDADIANTAMENTO",
            "DEPARTAMENTO",
            "IDEMPRESA",
            "NUCNPJEMPRESA",
            "POSSUINOTAFISCAL",
            "CNPJFATURAMENTO",
            "VRSOLICITADO",
            "DESCRICAO",
            "ANEXOORCAMENTO",
            "ANEXONOTAFISCAL",
            "RAZAOSOCIALFATURAMENTO",
            "DSJUSTIFICATIVA",
            "STATUS",
            "IDUSUARIOCRIACAO"
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EM ANDAMENTO', ?)
        `;
                
        let pStmt = conn.prepareStatement(api.replaceDbName(query));
        let bodyJson = JSON.parse($.request.body.asString());

        for(var i = 0; i < bodyJson.length; i++) {
            var registro = bodyJson[i];

        	pStmt.setInt(1, idAdiantamento);
            pStmt.setString(2, registro.DEPARTAMENTO);
            pStmt.setInt(3, registro.IDEMPRESA);
            pStmt.setString(4, registro.NUCNPJEMPRESA);
            pStmt.setString(5, registro.POSSUINOTAFISCAL);
            pStmt.setString(6, registro.CNPJFATURAMENTO);
            pStmt.setFloat(7, registro.VRSOLICITADO);
            pStmt.setString(8, registro.DESCRICAO);
            setStringOrNull(pStmt, 9, registro.ANEXOORCAMENTO);
            setStringOrNull(pStmt, 10, registro.ANEXONOTAFISCAL);
            setStringOrNull(pStmt, 11, registro.RAZAOSOCIALFATURAMENTO);
            setStringOrNull(pStmt, 12, registro.DSJUSTIFICATIVA);
            pStmt.setInt(13, registro.IDUSUARIOCRIACAO);
            pStmt.execute();
            fnInserirHistoricoAdiantamento(
                conn,
                idAdiantamento,
                null,
                'EM ANDAMENTO',
                'INCLUSAO',
                registro.DESCRICAO,
                registro.IDUSUARIOCRIACAO
            );
        }

        pStmt.close();
        conn.commit();
        return {
            msg : "Atualização realizada com sucesso!"
        };
    } catch(e) {
        throw e;
    } 
    
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
        
		//Handle your GET calls here
		case $.net.http.GET:
			let id = $.request.parameters.get("id");
		    fnHandleGet(id);
		    break;
		case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
		case $.net.http.POST:
            var docReturn = fnHandlePost();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

 } catch (e) {
    var detalheError = e.stack ? e.stack.split('\n') : '';
    
    detalheError = detalheError ? detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim() : '';
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message || e,
        detalheError
    }));
    $.response.status = 400;
}