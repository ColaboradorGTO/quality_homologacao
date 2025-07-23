// var api = $.import("quality.concentrador.api.apiResponse", "int_api");
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
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var idResumoPromocao = $.request.parameters.get("idResumoPromocao");
    var status = $.request.parameters.get("status");

    var query = `
        SELECT 
            IDRESUMOPROMOCAOMARKETING, 
            DSPROMOCAOMARKETING, 
            TO_VARCHAR(DTHORAINICIO, 'YYYY-MM-DD') AS DTHORAINICIO, 
            TO_VARCHAR(DTHORAFIM, 'YYYY-MM-DD') AS DTHORAFIM,
            TPAPLICADOA,
            APARTIRDEQTD, 
            APARTIRDOVLR, 
            TPFATORPROMO, 
            FATORPROMOVLR, 
            FATORPROMOPERC, 
            TPAPARTIRDE, 
            VLPRECOPRODUTO, 
            STEMPRESAPROMO, 
            STDETPROMOORIGEM, 
            STDETPROMODESTINO,
            STATIVO,
            IDMECANICARESUMOPROMOCAOMARKETING
        FROM "VAR_DB_NAME".RESUMOPROMOCAOMARKETING
        WHERE 1 = ?
    `;

    if (idResumoPromocao) {
        query = query + ' AND IDRESUMOPROMOCAOMARKETING = \'' + idResumoPromocao + '\' ';
    }
    if (dataPesquisaInicio) {
        query = query + ' AND DTHORAINICIO >= \'' + dataPesquisaInicio + '\' ';
    }
    if (dataPesquisaFim) {
        query = query + ' AND DTHORAFIM <= \'' + dataPesquisaFim + '\' ';
    }
   
    if (status) {
        query = query + ' AND STATIVO = \'' + status + '\' ';
    }

 
    query += ' ORDER BY DTHORAFIM DESC ';

    var request = {
        page: $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };

    api.responseWithQuery(query, request, 1);
}


function fnIncluirMecanicaPromocao(conn, idResumoPromocao, tpAplicada, tpFatorPromo, tpApartirde) {
    var query = `INSERT INTO "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING" 
            ( 
                "IDMECANICARESUMOPROMOCAOMARKETING",
                "IDRESUMOPROMOCAOMARKETING",
                "TPAPLICADOA", 
                "TPFATORPROMO", 
                "TPAPARTIRDE",
                "STATIVO" 
            ) 
            VALUES(?,?,?,?,?, 'True') `;

    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDMECANICARESUMOPROMOCAOMARKETING")),0) + 1 FROM "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING" WHERE 1 = ? ', 1);

    pStmt.setInt(1, Id);
    pStmt.setInt(2, idResumoPromocao);
    pStmt.setFloat(3, tpAplicada);
    pStmt.setInt(4, tpFatorPromo);
    pStmt.setInt(5, tpApartirde);

    pStmt.execute();
    conn.commit();

    pStmt.close();
}

function fnIncluirDetalheEmpresaPromocaoMarketing(conn, idResumoPromocao, idEmpresas, stEmpresaPromocao) {
     var query = `INSERT INTO "VAR_DB_NAME"."EMPRESAPROMOCAOMARKETING" 
            ( 
                "IDEMPRESAPROMOCAOMARKETING", 
                "IDRESUMOPROMOCAOMARKETING", 
                "IDEMPRESA", 
                "STATIVO" 
            ) 
            VALUES(?,?,?,?) `;

    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    // idEmpresas pode ser um array ou um único valor
    var empresas = Array.isArray(idEmpresas) ? idEmpresas : [idEmpresas];

    var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDEMPRESAPROMOCAOMARKETING")),0) + 1 FROM "VAR_DB_NAME"."EMPRESAPROMOCAOMARKETING" WHERE 1 = ? ', 1);
    for (var i = 0; i < empresas.length; i++) {
        Id++
        var idEmpresa = empresas[i];

        pStmt.setInt(1, Id);
        pStmt.setInt(2, idResumoPromocao);
        pStmt.setInt(3, idEmpresa);
        pStmt.setString(4, stEmpresaPromocao);

        pStmt.execute();
        conn.commit();
    }

    pStmt.close();
}

function incluirDetalhePromocaoMarketingDestino(conn, idResumoPromocao, idGrupo, idSubGrupo, idMarca, idFornecedor, idProdutos, stEmpresaDestino) {
    var query = `INSERT INTO "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO" 
            ( 
                "IDDETALHEPROMOCAOMARKETINGDESTINO", 
                "IDRESUMOPROMOCAOMARKETING", 
                "IDGRUPOEMDESTINO", 
                "IDSUBGRUPOEMDESTINO", 
                "IDMARCAEMDESTINO", 
                "IDFORNECEDOREMDESTINO", 
                "IDPRODUTODESTINO", 
                "STATIVO" 
            ) 
            VALUES(?,?,?,?,?,?,?,?) 
    `;

    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    // idProdutos pode ser um array ou um único valor
    var produtos = Array.isArray(idProdutos) ? idProdutos : [idProdutos];

    for (var i = 0; i < produtos.length; i++) {
        var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMOCAOMARKETINGDESTINO")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO" WHERE 1 = ? ', 1);
        var idProduto = produtos[i];

        pStmt.setInt(1, Id);
        pStmt.setInt(2, idResumoPromocao);
        pStmt.setInt(3, idGrupo || -1);
        pStmt.setInt(4, idSubGrupo || -1);
        pStmt.setInt(5, idMarca || -1);
        pStmt.setInt(6, idFornecedor || -1);
        pStmt.setString(7, idProduto);
        pStmt.setString(8, stEmpresaDestino);

        pStmt.execute();
        conn.commit();
    }

    pStmt.close();
}

function incluirDetalhePromocaoMarketingOrigem(conn, idResumoPromocao, idGrupo, idSubGrupo, idMarca, idFornecedor, idProdutosOrigem, stEmpresaOrigem) {
    var query = `INSERT INTO "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM" 
            ( 
                "IDDETALHEPROMOCAOMARKETINGORIGEM", 
                "IDRESUMOPROMOCAOMARKETING", 
                "IDGRUPOEMORIGEM", 
                "IDSUBGRUPOEMORIGEM", 
                "IDMARCAEMORIGEM", 
                "IDFORNECEDOREMORIGEM", 
                "IDPRODUTOORIGEM", 
                "STATIVO" 
            ) 
            VALUES(?,?,?,?,?,?,?,?) 
    `;

    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    // idProdutosOrigem pode ser um array ou um único valor
    var produtosOrigem = Array.isArray(idProdutosOrigem) ? idProdutosOrigem : [idProdutosOrigem];

    for (var i = 0; i < produtosOrigem.length; i++) {
        var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMOCAOMARKETINGORIGEM")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM" WHERE 1 = ? ', 1);
        var idProdutoOrigem = produtosOrigem[i];

        pStmt.setInt(1, Id);
        pStmt.setInt(2, idResumoPromocao);
        pStmt.setInt(3, idGrupo || -1);
        pStmt.setInt(4, idSubGrupo || -1);
        pStmt.setInt(5, idMarca || -1);
        pStmt.setInt(6, idFornecedor || -1);
        pStmt.setString(7, idProdutoOrigem);
        pStmt.setString(8, stEmpresaOrigem);

        pStmt.execute();
        conn.commit();
    }

    pStmt.close();
}

function fnIncluirDetalhesEmpresaPromocao(conn, idResumoPromocao, idProdutos) {
    var query = `INSERT INTO "VAR_DB_NAME"."DETALHEPROMOCAO" 
            ( 
                 "IDDETALHEPROMO", 
                "IDRESUMOPROMO", 
                "IDPRODUTO" 
            ) 
            VALUES(?,?,?) 
    `;

    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    // idProdutos pode ser um array ou um único valor
    var produtos = Array.isArray(idProdutos) ? idProdutos : [idProdutos];

    for (var i = 0; i < produtos.length; i++) {
        var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMO")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPROMOCAO" WHERE 1 = ? ', 1);
        var idProduto = produtos[i];

        pStmt.setInt(1, Id);
        pStmt.setInt(2, idResumoPromocao);
        pStmt.setString(3, idProduto);

        pStmt.execute();
        conn.commit();
    }

    pStmt.close();
}


function fnHandlePost() {
	var conn = $.db.getConnection();
	var queryId = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDRESUMOPROMOCAOMARKETING")),0) + 1 FROM "VAR_DB_NAME"."RESUMOPROMOCAOMARKETING" WHERE 1 = ? ', 1);
	try {
        var query = `INSERT INTO "VAR_DB_NAME"."RESUMOPROMOCAOMARKETING" 
            ( 
                "IDRESUMOPROMOCAOMARKETING", 
                "DSPROMOCAOMARKETING", 
                "DTHORAINICIO", 
                "DTHORAFIM", 
                "TPAPLICADOA", 
                "APARTIRDEQTD", 
                "APARTIRDOVLR", 
                "TPFATORPROMO", 
                "FATORPROMOVLR", 
                "FATORPROMOPERC", 
                "TPAPARTIRDE", 
                "VLPRECOPRODUTO", 
                "STEMPRESAPROMO",
                "STDETPROMOORIGEM",
                "STDETPROMODESTINO",
                "IDMECANICARESUMOPROMOCAOMARKETING",
                "STATIVO"
            ) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'True') 
        `;
		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {
            
            var registro = bodyJson[i];

			pStmt.setInt(1, queryId);
			pStmt.setString(2, registro.DSPROMOCAOMARKETING);
			pStmt.setDate(3, registro.DTHORAINICIO);
			pStmt.setDate(4, registro.DTHORAFIM);
			pStmt.setFloat(5, registro.TPAPLICADOA);
			pStmt.setFloat(6, registro.APARTIRDEQTD);
			pStmt.setInt(7, registro.APARTIRDOVLR);
			pStmt.setInt(8, registro.TPFATORPROMO);
			pStmt.setInt(9, registro.FATORPROMOVLR);
			pStmt.setFloat(10, registro.FATORPROMOPERC);
			pStmt.setInt(11, registro.TPAPARTIRDE);
            pStmt.setFloat(12, registro.VLPRECOPRODUTO);
            pStmt.setString(13, registro.STEMPRESAPROMO);
            pStmt.setString(14, registro.STDETPROMOORIGEM);
            pStmt.setString(15, registro.STDETPROMODESTINO);
            pStmt.setInt(16, queryId)
		

			pStmt.execute();
 			fnIncluirMecanicaPromocao(conn, queryId, registro.TPAPLICADOA, registro.TPFATORPROMO, registro.TPAPARTIRDE);
            incluirDetalhePromocaoMarketingDestino(conn, queryId, registro.IDGRUPOEMDESTINO, registro.IDSUBGRUPOEMDESTINO, registro.IDMARCAEMDESTINO, registro.IDFORNECEDOREMDESTINO, registro.IDPRODUTODESTINO, registro.STDETPROMODESTINO);
            incluirDetalhePromocaoMarketingOrigem(conn, queryId, registro.IDGRUPOEMORIGEM, registro.IDSUBGRUPOEMORIGEM, registro.IDMARCAEMORIGEM, registro.IDFORNECEDOREMORIGEM, registro.IDPRODUTOORIGEM, registro.STDETPROMOORIGEM);
            fnIncluirDetalheEmpresaPromocaoMarketing(conn, queryId, registro.IDEMPRESA, registro.STEMPRESAPROMO);
            fnIncluirDetalhesEmpresaPromocao(conn, queryId, registro.IDPRODUTO);
		}

		pStmt.close();

		conn.commit();

		return {
			"msg": "Inclusão realizada com sucesso!",
			 "objetoRecebido": bodyJson
		};
	} catch (e) {
	    conn.rollback();
	    throw e;
	}
}

// function incluirOuAtualizarMecanicaPromocao(conn, idResumoPromocao, tpAplicada, tpFatorPromo, tpApartirde, dsPromocao) {
//     // Verifica se já existe uma mecânica para esse IDRESUMOPROMOCAOMARKETING
//     var existe = api.executeScalar(`
//         SELECT COUNT(*) 
//         FROM "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING"
//         WHERE "IDRESUMOPROMOCAOMARKETING" = ?
//     `, idResumoPromocao);

//     if (existe > 0) {
//         // UPDATE se já existe
//         var updateQuery = `
//             UPDATE "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING"
//             SET 
//                 "TPAPLICADOA" = ?, 
//                 "TPFATORPROMO" = ?, 
//                 "TPAPARTIRDE" = ?, 
//                 "DSPROMOCAO" = ?,
//                 "STATIVO" = 'True'
//             WHERE 
//                 "IDRESUMOPROMOCAOMARKETING" = ?
//         `;

//         var updateStmt = conn.prepareStatement(api.replaceDbName(updateQuery));
//         updateStmt.setFloat(1, tpAplicada);
//         updateStmt.setInt(2, tpFatorPromo);
//         updateStmt.setInt(3, tpApartirde);
//         updateStmt.setString(4, dsPromocao); 
//         updateStmt.setInt(5, idResumoPromocao);

//         updateStmt.execute();
//         updateStmt.close();
//     } else {
//         // INSERT se não existe
//         var insertQuery = `
//             INSERT INTO "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING"
//             (
//                 "IDMECANICARESUMOPROMOCAOMARKETING",
//                 "IDRESUMOPROMOCAOMARKETING",
//                 "TPAPLICADOA",
//                 "TPFATORPROMO",
//                 "TPAPARTIRDE",
//                 "DSPROMOCAO",
//                 "STATIVO"
//             )
//             VALUES (?, ?, ?, ?, ?, ?, 'True')
//         `;

//         var insertStmt = conn.prepareStatement(api.replaceDbName(insertQuery));

//         var novoId = api.executeScalar(`
//             SELECT IFNULL(MAX(TO_INT("IDMECANICARESUMOPROMOCAOMARKETING")), 0) + 1 
//             FROM "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING"
//         `);

//         insertStmt.setInt(1, novoId);
//         insertStmt.setInt(2, idResumoPromocao);
//         insertStmt.setFloat(3, tpAplicada);
//         insertStmt.setInt(4, tpFatorPromo);
//         insertStmt.setInt(5, tpApartirde);
//         insertStmt.setString(6, dsPromocao);

//         insertStmt.execute();
//         insertStmt.close();
//     }

//     conn.commit();
// }

function incluirOuAtualizarMecanicaPromocao(conn, idResumoPromocao, tpAplicada, tpFatorPromo, tpApartirde, dsPromocao) {
    var checkQueryMecanica = `
        SELECT COUNT(*)
        FROM "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING"
        WHERE "IDRESUMOPROMOCAOMARKETING" = ?
    `;

    var insertQueryMecanica = `
        INSERT INTO "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING"
        (
            "IDMECANICARESUMOPROMOCAOMARKETING",
            "IDRESUMOPROMOCAOMARKETING",
            "TPAPLICADOA",
            "TPFATORPROMO",
            "TPAPARTIRDE",
            "STATIVO",
            "DSPROMOCAO"
        )

        VALUES (?, ?, ?, ?, ?, 'True', ?)
    `;

    var updateQueryMecanica = `
        UPDATE "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING"
        SET
            "TPAPLICADOA" = ?,
            "TPFATORPROMO" = ?,
            "TPAPARTIRDE" = ?,
            "DSPROMOCAO" = ?
        WHERE "IDRESUMOPROMOCAOMARKETING" = ?
    `;

    var pStmtCheck = conn.prepareStatement(api.replaceDbName(checkQueryMecanica));
    var pStmtInsert = conn.prepareStatement(api.replaceDbName(insertQueryMecanica));
    var pStmtUpdate = conn.prepareStatement(api.replaceDbName(updateQueryMecanica));

    // Verificar se já existe o registro
    var nextIdMecanica = api.executeScalar(`SELECT IFNULL(MAX(TO_INT("IDMECANICARESUMOPROMOCAOMARKETING")), 0) + 1 FROM "VAR_DB_NAME"."MECANICARESUMOPROMOCAOMARKETING" WHERE 1 = ?`, 1);

    for (var i = 0; i < 1; i++) {
        // Verificar se já existe o registro
        pStmtCheck.setInt(1, idResumoPromocao);
        var rs = pStmtCheck.executeQuery();

        if (rs.next() && rs.getInteger(1) > 0) {
            // Registro existe - fazer UPDATE
            pStmtUpdate.setFloat(1, tpAplicada);
            pStmtUpdate.setInt(2, tpFatorPromo);
            pStmtUpdate.setInt(3, tpApartirde);
            pStmtUpdate.setString(4, dsPromocao);
            pStmtUpdate.setInt(5, idResumoPromocao);
            pStmtUpdate.execute();
        } else {
            // Registro não existe - fazer INSERT
            nextIdMecanica++;
            pStmtInsert.setInt(1, nextIdMecanica);
            pStmtInsert.setInt(2, idResumoPromocao);
            pStmtInsert.setFloat(3, tpAplicada);
            pStmtInsert.setInt(4, tpFatorPromo);
            pStmtInsert.setInt(5, tpApartirde);
            pStmtInsert.setString(6, dsPromocao);
            pStmtInsert.execute();
        }

        rs.close();
    }
    // Commit fora do loop (ideal)
    conn.commit();
    // Fechar os prepared statements
    pStmtCheck.close();
    pStmtInsert.close();
    pStmtUpdate.close();
}

function incluirOuAtualizarDetalhesEmpresaPromocao(conn, idResumoPromocao, idProdutos) {
    var checkQueryDetalhePromocao = `
        SELECT COUNT(*)
        FROM "VAR_DB_NAME"."DETALHEPROMOCAO"
        WHERE "IDRESUMOPROMO" = ? 
          AND "IDPRODUTO" = ?
    `;

    var insertQueryDetalhePromocao = `
        INSERT INTO "VAR_DB_NAME"."DETALHEPROMOCAO"
        (
            "IDDETALHEPROMO",
            "IDRESUMOPROMO",
            "IDPRODUTO"
        )
        VALUES (?, ?, ?)
    `;

     var updateQueryDetalhePromocao = `
        UPDATE "VAR_DB_NAME"."DETALHEPROMOCAO"
        SET 
            "IDPRODUTO" = ?
        WHERE 
            "IDRESUMOPROMO" = ?
            AND "IDPRODUTO" = ?
    `;

    var pStmtCheck = conn.prepareStatement(api.replaceDbName(checkQueryDetalhePromocao));
    var pStmtInsert = conn.prepareStatement(api.replaceDbName(insertQueryDetalhePromocao));
    var pStmtUpdate = conn.prepareStatement(api.replaceDbName(updateQueryDetalhePromocao));

    // idProdutos pode ser um array ou um único valor
    var produtos = Array.isArray(idProdutos) ? idProdutos : [idProdutos];

    // Obter o próximo ID disponível
    var nextId = api.executeScalar(`SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMO")), 0) + 1 FROM "VAR_DB_NAME"."DETALHEPROMOCAO" WHERE 1 = ?`, 1);

    for (var i = 0; i < produtos.length; i++) {
        var idProduto = produtos[i];

        // Verificar se já existe o registro
        pStmtCheck.setInt(1, idResumoPromocao);
        pStmtCheck.setString(2, idProduto);
        var rs = pStmtCheck.executeQuery();

        if (rs.next() && rs.getInteger(1) > 0) {
            // Registro existe - atualizar
            pStmtUpdate.setInt(1, idResumoPromocao);
            pStmtUpdate.setInt(2, nextId);
            pStmtUpdate.setString(3, idProduto);
            pStmtUpdate.execute();
        } else {
            // Registro não existe - inserir novo
            nextId++;
            pStmtInsert.setInt(1, nextId);
            pStmtInsert.setInt(2, idResumoPromocao);
            pStmtInsert.setString(3, idProduto);
            pStmtInsert.execute();
        }
        rs.close();
        conn.commit();
    }

    pStmtCheck.close();
    pStmtInsert.close();
    pStmtUpdate.close();
}

function incluirOuAtualizarDetalhePromocaoMarketingDestino(conn, idResumoPromocao, idGrupo, idSubGrupo, idMarca, idFornecedor, idProdutos, stEmpresaDestino) {
    var checkQueryEmpresaDestino = `
        SELECT COUNT(*) 
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO" 
        WHERE "IDRESUMOPROMOCAOMARKETING" = ? 
          AND "IDPRODUTODESTINO" = ?
    `;

    var insertQueryEmpresaDestino = `
        INSERT INTO "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO" (
            "IDDETALHEPROMOCAOMARKETINGDESTINO",
            "IDRESUMOPROMOCAOMARKETING",    
            "IDGRUPOEMDESTINO",
            "IDSUBGRUPOEMDESTINO",
            "IDMARCAEMDESTINO",
            "IDFORNECEDOREMDESTINO",
            "IDPRODUTODESTINO",
            "STATIVO"
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    var updateQueryEmpresaDestino = `
        UPDATE "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO"
        SET
            "IDGRUPOEMDESTINO" = ?,
            "IDSUBGRUPOEMDESTINO" = ?,
            "IDMARCAEMDESTINO" = ?,
            "IDFORNECEDOREMDESTINO" = ?,
            "IDPRODUTODESTINO" = ?,
            "STATIVO" = ?
        WHERE "IDRESUMOPROMOCAOMARKETING" = ? 
          AND "IDPRODUTODESTINO" = ?
    `;

    var pStmtCheck = conn.prepareStatement(api.replaceDbName(checkQueryEmpresaDestino));
    var pStmtInsert = conn.prepareStatement(api.replaceDbName(insertQueryEmpresaDestino));
    var pStmtUpdate = conn.prepareStatement(api.replaceDbName(updateQueryEmpresaDestino));

    var produtos = Array.isArray(idProdutos) ? idProdutos : [idProdutos];

    // Obter o próximo ID disponível
    var nextId = api.executeScalar(`
        SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMOCAOMARKETINGDESTINO")), 0) + 1 
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO" 
        WHERE 1 = ?
    `, 1);

    for (var i = 0; i < produtos.length; i++) {
        var idProduto = produtos[i];

        // Verificar se já existe o registro
        pStmtCheck.setInt(1, idResumoPromocao);
        pStmtCheck.setString(2, String(idProduto));
        var rs = pStmtCheck.executeQuery();

        if ((rs.next() && rs.getInteger(1) > 0)) {
            // Registro existe - fazer UPDATE
            pStmtUpdate.setInt(1, idGrupo || -1);
            pStmtUpdate.setInt(2, idSubGrupo || -1);
            pStmtUpdate.setInt(3, idMarca || -1);
            pStmtUpdate.setInt(4, idFornecedor || -1);
            pStmtUpdate.setString(5, String(idProduto));
            pStmtUpdate.setString(6, stEmpresaDestino);
            pStmtUpdate.setInt(7, idResumoPromocao);
            pStmtUpdate.setString(8, String(idProduto));
            pStmtUpdate.execute();
        } else {
            // Registro não existe - fazer INSERT
            nextId++;
            pStmtInsert.setInt(1, nextId);
            pStmtInsert.setInt(2, idResumoPromocao);
            pStmtInsert.setInt(3, idGrupo || -1);
            pStmtInsert.setInt(4, idSubGrupo || -1);
            pStmtInsert.setInt(5, idMarca || -1);
            pStmtInsert.setInt(6, idFornecedor || -1);
            pStmtInsert.setString(7, String(idProduto));
            pStmtInsert.setString(8, stEmpresaDestino);
            pStmtInsert.execute();
        }

        rs.close();
    }

    // Commit fora do loop (ideal)
    conn.commit();

    // Fechar os prepared statements
    pStmtCheck.close();
    pStmtInsert.close();
    pStmtUpdate.close();
}

function incluirOuAtualizarDetalhePromocaoMarketingOrigem(conn, idResumoPromocao, idGrupo, idSubGrupo, idMarca, idFornecedor, idProdutosOrigem, stEmpresaOrigem) {
    var checkQueryEmpresaOrigem = `
        SELECT COUNT(*) 
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM" 
        WHERE "IDRESUMOPROMOCAOMARKETING" = ? 
          AND "IDPRODUTOORIGEM" = ?
    `;

    var insertQueryEmpresaOrigem = `
        INSERT INTO "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM" (
            "IDDETALHEPROMOCAOMARKETINGORIGEM",
            "IDRESUMOPROMOCAOMARKETING",    
            "IDGRUPOEMORIGEM",
            "IDSUBGRUPOEMORIGEM",
            "IDMARCAEMORIGEM",
            "IDFORNECEDOREMORIGEM",
            "IDPRODUTOORIGEM",
            "STATIVO"
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    var updateQueryEmpresaOrigem = `
        UPDATE "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM"
        SET
            "IDGRUPOEMORIGEM" = ?,
            "IDSUBGRUPOEMORIGEM" = ?,
            "IDMARCAEMORIGEM" = ?,
            "IDFORNECEDOREMORIGEM" = ?,
            "IDPRODUTOORIGEM" = ?,
            "STATIVO" = ?
        WHERE "IDRESUMOPROMOCAOMARKETING" = ? 
          AND "IDPRODUTOORIGEM" = ?
    `;

    var pStmtCheck = conn.prepareStatement(api.replaceDbName(checkQueryEmpresaOrigem));
    var pStmtInsert = conn.prepareStatement(api.replaceDbName(insertQueryEmpresaOrigem));
    var pStmtUpdate = conn.prepareStatement(api.replaceDbName(updateQueryEmpresaOrigem));

    var produtosOrigem = Array.isArray(idProdutosOrigem) ? idProdutosOrigem : [idProdutosOrigem];

    // Obter o próximo ID disponível
    var nextId = api.executeScalar(`
        SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMOCAOMARKETINGORIGEM")), 0) + 1 
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM"
        WHERE 1 = ?
    `, 1);
    for (var i = 0; i < produtosOrigem.length; i++) {
        var idProdutoOrigem = produtosOrigem[i];

        // Verificar se já existe o registro
        pStmtCheck.setInt(1, idResumoPromocao);
        pStmtCheck.setString(2, String(idProdutoOrigem));
        var rs = pStmtCheck.executeQuery();

        if ((rs.next() && rs.getInteger(1) > 0)) {
            // Registro existe - fazer UPDATE
            pStmtUpdate.setInt(1, idGrupo || -1);
            pStmtUpdate.setInt(2, idSubGrupo || -1);
            pStmtUpdate.setInt(3, idMarca || -1);
            pStmtUpdate.setInt(4, idFornecedor || -1);
            pStmtUpdate.setString(5, String(idProdutoOrigem));
            pStmtUpdate.setString(6, stEmpresaOrigem);
            pStmtUpdate.setInt(7, idResumoPromocao);
            pStmtUpdate.setString(8, String(idProdutoOrigem));
            pStmtUpdate.execute();
        } else {
            // Registro não existe - fazer INSERT
            nextId++;
            pStmtInsert.setInt(1, nextId);
            pStmtInsert.setInt(2, idResumoPromocao);
            pStmtInsert.setInt(3, idGrupo || -1);
            pStmtInsert.setInt(4, idSubGrupo || -1);
            pStmtInsert.setInt(5, idMarca || -1);
            pStmtInsert.setInt(6, idFornecedor || -1);
            pStmtInsert.setString(7, String(idProdutoOrigem));
            pStmtInsert.setString(8, stEmpresaOrigem);
            pStmtInsert.execute();
        }

        rs.close();
    }

    // Commit fora do loop (ideal)
    conn.commit();
    // Fechar os prepared statements
    pStmtCheck.close();
    pStmtInsert.close();
    pStmtUpdate.close();
}

function incluirOuAtualizarDetalheEmpresaPromocaoMarketing(conn, idResumoPromocao, idEmpresas, stEmpresaPromocao) {
    // Verifica se já existe o registro para cada empresa
    var checkQueryEmpresaPromocao = `
        SELECT 1 FROM "VAR_DB_NAME"."EMPRESAPROMOCAOMARKETING" 
        WHERE "IDRESUMOPROMOCAOMARKETING" = ? 
        AND "IDEMPRESA" = ? 
        LIMIT 1
    `;
    
    // Query de inserção
    var insertQueryEmpresaPromocao = `
        INSERT INTO "VAR_DB_NAME"."EMPRESAPROMOCAOMARKETING" 
        ( 
            "IDEMPRESAPROMOCAOMARKETING", 
            "IDRESUMOPROMOCAOMARKETING", 
            "IDEMPRESA", 
            "STATIVO" 
        ) 
        VALUES(?,?,?,?)
    `;
    
    // Query de atualização
    var updateQueryEmpresaPromocao = `
        UPDATE "VAR_DB_NAME"."EMPRESAPROMOCAOMARKETING" 
        SET "STATIVO" = ? 
        WHERE "IDRESUMOPROMOCAOMARKETING" = ? 
        AND "IDEMPRESA" = ?
    `;

    var checkStmt = conn.prepareStatement(api.replaceDbName(checkQueryEmpresaPromocao));
    var insertStmt = conn.prepareStatement(api.replaceDbName(insertQueryEmpresaPromocao));
    var updateStmt = conn.prepareStatement(api.replaceDbName(updateQueryEmpresaPromocao));

    // idEmpresas pode ser um array ou um único valor
    var empresas = Array.isArray(idEmpresas) ? idEmpresas : [idEmpresas];

    // Obter o próximo ID disponível
    var nextId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDEMPRESAPROMOCAOMARKETING")),0) + 1 FROM "VAR_DB_NAME"."EMPRESAPROMOCAOMARKETING" WHERE 1 = ?', 1);

    for (var i = 0; i < empresas.length; i++) {
        var idEmpresa = empresas[i];
        
        // Verificar se já existe o registro
        checkStmt.setInt(1, idResumoPromocao);
        checkStmt.setInt(2, idEmpresa);
        var rs = checkStmt.executeQuery();
        
        if (rs.next() && rs.getInteger(1) > 0) {
            // Registro existe - atualizar
            updateStmt.setString(1, stEmpresaPromocao);
            updateStmt.setInt(2, idResumoPromocao);
            updateStmt.setInt(3, idEmpresa);
            updateStmt.execute();
        } else {
            // Registro não existe - inserir novo
            nextId++;
            insertStmt.setInt(1, nextId);
            insertStmt.setInt(2, idResumoPromocao);
            insertStmt.setInt(3, idEmpresa);
            insertStmt.setString(4, stEmpresaPromocao);
            insertStmt.execute();
        }
        rs.close();
    }
    
    conn.commit();
    checkStmt.close();
    insertStmt.close();
    updateStmt.close();
    
    return {
        IDRESUMOPROMOCAOMARKETING: idResumoPromocao,
        IDEMPRESA: idEmpresas,
        STATIVO: stEmpresaPromocao
    };
}


function fnHandlePut() {
    var conn = $.db.getConnection();
    var bodyJson;
    try {
        var query = ` UPDATE "VAR_DB_NAME"."RESUMOPROMOCAOMARKETING" SET
            "DSPROMOCAOMARKETING" = ?, 
            "DTHORAINICIO" = ?, 
            "DTHORAFIM" = ?, 
            "TPAPLICADOA" = ?,
            "APARTIRDEQTD" = ?, 
            "APARTIRDOVLR" = ?, 
            "TPFATORPROMO" = ?,
            "FATORPROMOVLR" = ?, 
            "FATORPROMOPERC" = ?, 
            "TPAPARTIRDE" = ?,
            "VLPRECOPRODUTO" = ?, 
            "STEMPRESAPROMO" = ?,
            "STDETPROMOORIGEM" = ?,
            "STDETPROMODESTINO" = ?,
            "IDMECANICARESUMOPROMOCAOMARKETING" = ?,
            "STATIVO" = ?
            WHERE IDRESUMOPROMOCAOMARKETING = ?
        `;

        var pStmt = conn.prepareStatement(api.replaceDbName(query));
        bodyJson = JSON.parse($.request.body.asString());

        for (var i = 0; i < bodyJson.length; i++) {
            var registro = bodyJson[i];

            // Atualização principal
            pStmt.setString(1, registro.DSPROMOCAOMARKETING);
            pStmt.setDate(2, registro.DTHORAINICIO);
            pStmt.setDate(3, registro.DTHORAFIM);
            pStmt.setFloat(4, registro.TPAPLICADOA);
            pStmt.setFloat(5, registro.APARTIRDEQTD);
            pStmt.setInt(6, registro.APARTIRDOVLR);
            pStmt.setInt(7, registro.TPFATORPROMO);
            pStmt.setInt(8, registro.FATORPROMOVLR);
            pStmt.setFloat(9, registro.FATORPROMOPERC);
            pStmt.setInt(10, registro.TPAPARTIRDE);
            pStmt.setFloat(11, registro.VLPRECOPRODUTO);
            pStmt.setString(12, registro.STEMPRESAPROMO);
            pStmt.setString(13, registro.STDETPROMOORIGEM);
            pStmt.setString(14, registro.STDETPROMODESTINO);
            pStmt.setInt(15, registro.IDMECANICARESUMOPROMOCAOMARKETING);
            pStmt.setString(16, registro.STATIVO);
            pStmt.setInt(17, registro.IDRESUMOPROMOCAOMARKETING);
            pStmt.execute();
            
             
            incluirOuAtualizarDetalhesEmpresaPromocao(conn, registro.IDRESUMOPROMOCAOMARKETING, registro.IDPRODUTO);
            incluirOuAtualizarMecanicaPromocao(conn, registro.IDRESUMOPROMOCAOMARKETING, registro.TPAPLICADOA, registro.TPFATORPROMO, registro.TPAPARTIRDE, registro.DSPROMOCAOMARKETING);
            // incluirOuAtualizarDetalheEmpresaPromocaoMarketing(conn, registro.IDRESUMOPROMOCAOMARKETING, registro.IDEMPRESA, registro.STEMPRESAPROMOMO);
                
                var retornoEmpresa = incluirOuAtualizarDetalheEmpresaPromocaoMarketing(
                conn,
                registro.IDRESUMOPROMOCAOMARKETING,
                registro.IDEMPRESA,
                registro.STEMPRESAPROMO
            );
            // Adiciona o retorno ao registro para exibir no retorno final
            registro.RETORNO_EMPRESA = retornoEmpresa;    
                
            incluirOuAtualizarDetalhePromocaoMarketingOrigem(
                conn,
                registro.IDRESUMOPROMOCAOMARKETING,
                registro.IDGRUPOEMORIGEM,
                registro.IDSUBGRUPOEMORIGEM,
                registro.IDMARCAEMORIGEM,
                registro.IDFORNECEDOREMORIGEM,
                registro.IDPRODUTOORIGEM,
                registro.STDETPROMOORIGEM
            );
            
            incluirOuAtualizarDetalhePromocaoMarketingDestino(
                conn,
                registro.IDRESUMOPROMOCAOMARKETING,
                registro.IDGRUPOEMDESTINO,
                registro.IDSUBGRUPOEMDESTINO,
                registro.IDMARCAEMDESTINO,
                registro.IDFORNECEDOREMDESTINO,
                registro.IDPRODUTODESTINO,
                registro.STDETPROMODESTINO
            );
        }

        pStmt.close();
        conn.commit();

        return {
            "msg": "Atualização realizada com sucesso!",
            "objetoRecebido": bodyJson
        };
    } catch (e) {
        conn.rollback();
        throw e;
    }
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
          //Handle your GET calls here
        case $.net.http.GET:
            var byId = $.request.parameters.get("byId");
            fnHandleGet(byId)
            break;    
         case $.net.http.PUT:
            var doc = fnHandlePut();
            $.response.setBody(JSON.stringify(doc));
            break;
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}

