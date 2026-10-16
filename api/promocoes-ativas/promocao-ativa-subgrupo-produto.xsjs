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

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
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
            STPRODUTO,
            IDMECANICARESUMOPROMOCAOMARKETING
        FROM "VAR_DB_NAME".RESUMOPROMOCAOMARKETING
        WHERE 1 = ?
    `;

    if (idResumoPromocao) {
        query = query + ' AND IDRESUMOPROMOCAOMARKETING = \'' + idResumoPromocao + '\' ';
    }
    // if (dataPesquisaInicio) {
    //     query = query + ' AND DTHORAINICIO >= \'' + dataPesquisaInicio + '\' ';
    // }
    // if (dataPesquisaFim) {
    //     query = query + ' AND DTHORAFIM <= \'' + dataPesquisaFim + '\' ';
    // }
   
   if (dataPesquisaInicio) {
        query = query + ' AND DTHORAINICIO >= \'' + dataPesquisaInicio + ' 00:00:00\' ';
    }
    if (dataPesquisaFim) {
        query = query + ' AND DTHORAFIM <= \'' + dataPesquisaFim + ' 23:59:59\' ';
    }
    if (status) {
        query = query + ' AND STATIVO = \'' + status + '\' ';
    }

 
    query += ' ORDER BY IDRESUMOPROMOCAOMARKETING';

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
    var subGrupo = Array.isArray(idSubGrupo) ? idSubGrupo : [idSubGrupo];

    for (var i = 0; i < produtos.length; i++) {
        var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMOCAOMARKETINGDESTINO")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO" WHERE 1 = ? ', 1);
        var idProduto = produtos[i];
        var idSubGrupoAtual = subGrupo[i] || -1;
        pStmt.setInt(1, Id);
        pStmt.setInt(2, idResumoPromocao);
        pStmt.setInt(3, idGrupo || -1);
        pStmt.setInt(4, idSubGrupoAtual);
        pStmt.setInt(5, idMarca || -1);
        pStmt.setInt(6, idFornecedor || -1);
        setStringOrNull(pStmt, 7, idProduto);
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
    var subGrupo = Array.isArray(idSubGrupo) ? idSubGrupo : [idSubGrupo];
    for (var i = 0; i < produtosOrigem.length; i++) {
        var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMOCAOMARKETINGORIGEM")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM" WHERE 1 = ? ', 1);
        var idProdutoOrigem = produtosOrigem[i];
        var idSubGrupoAtual = subGrupo[i] || -1;
        pStmt.setInt(1, Id);
        pStmt.setInt(2, idResumoPromocao);
        pStmt.setInt(3, idGrupo || -1);
        pStmt.setInt(4, idSubGrupoAtual);
        pStmt.setInt(5, idMarca || -1);
        pStmt.setInt(6, idFornecedor || -1);
        setStringOrNull(pStmt, 7, idProdutoOrigem);
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
        setStringOrNull(pStmt, 3, idProduto);

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
                "STATIVO",
                "STPRODUTO",
                "STESTRUTURA",
                "STESTRUTURAPRODUTO",
                "NUTIPOPROMOCAO"
            ) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'True', ?, ?, ?, ?) 
        `;
		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		// Processar um único registro principal
		pStmt.setInt(1, queryId);
		pStmt.setString(2, bodyJson.DSPROMOCAOMARKETING);
		pStmt.setDate(3, bodyJson.DTHORAINICIO);
		pStmt.setDate(4, bodyJson.DTHORAFIM);
		pStmt.setFloat(5, bodyJson.TPAPLICADOA);
		pStmt.setFloat(6, bodyJson.APARTIRDEQTD);
		pStmt.setInt(7, bodyJson.APARTIRDOVLR);
		pStmt.setInt(8, bodyJson.TPFATORPROMO);
		pStmt.setInt(9, bodyJson.FATORPROMOVLR);
		pStmt.setFloat(10, bodyJson.FATORPROMOPERC);
		pStmt.setInt(11, bodyJson.TPAPARTIRDE);
        pStmt.setFloat(12, bodyJson.VLPRECOPRODUTO);
        pStmt.setString(13, bodyJson.STEMPRESAPROMO);
        pStmt.setString(14, bodyJson.STDETPROMOORIGEM);
        pStmt.setString(15, bodyJson.STDETPROMODESTINO);
        pStmt.setInt(16, queryId);
        pStmt.setString(17, bodyJson.STPRODUTO);
        pStmt.setString(18, bodyJson.STESTRUTURA);
        pStmt.setString(19, bodyJson.STESTRUTURAPRODUTO);
        pStmt.setInt(20, bodyJson.NUTIPOPROMOCAO);

		pStmt.execute();
		
		// Incluir mecânica da promoção
 		fnIncluirMecanicaPromocao(conn, queryId, bodyJson.TPAPLICADOA, bodyJson.TPFATORPROMO, bodyJson.TPAPARTIRDE);
 		
 		// Incluir empresas
        fnIncluirDetalheEmpresaPromocaoMarketing(conn, queryId, bodyJson.IDEMPRESA, bodyJson.STEMPRESAPROMO);

		// Processar detalhes de destino
		if (bodyJson.detalhesDestino && Array.isArray(bodyJson.detalhesDestino)) {
			for (var i = 0; i < bodyJson.detalhesDestino.length; i++) {
				var detalheDestino = bodyJson.detalhesDestino[i];
				incluirDetalhePromocaoMarketingDestino(
					conn, 
					queryId, 
					detalheDestino.IDGRUPOEMDESTINO, 
					detalheDestino.IDSUBGRUPOEMDESTINO, 
					detalheDestino.IDMARCAEMDESTINO, 
					detalheDestino.IDFORNECEDOREMDESTINO, 
					detalheDestino.IDPRODUTODESTINO, 
					detalheDestino.STATIVO
				);
			}
		}

		// Processar detalhes de origem
		if (bodyJson.detalhesOrigem && Array.isArray(bodyJson.detalhesOrigem)) {
			for (var j = 0; j < bodyJson.detalhesOrigem.length; j++) {
				var detalheOrigem = bodyJson.detalhesOrigem[j];
				incluirDetalhePromocaoMarketingOrigem(
					conn, 
					queryId, 
					detalheOrigem.IDGRUPOEMORIGEM, 
					detalheOrigem.IDSUBGRUPOEMORIGEM, 
					detalheOrigem.IDMARCAEMORIGEM, 
					detalheOrigem.IDFORNECEDOREMORIGEM, 
					detalheOrigem.IDPRODUTOORIGEM, 
					detalheOrigem.STATIVO
				);
			}
		}

		// Processar produtos principais (se necessário - pode ser derivado dos detalhes)
		var todosProdutos = [];
		if (bodyJson.detalhesDestino) {
			bodyJson.detalhesDestino.forEach(function(detalhe) {
				if (detalhe.IDPRODUTODESTINO) {
					var produtos = Array.isArray(detalhe.IDPRODUTODESTINO) ? detalhe.IDPRODUTODESTINO : [detalhe.IDPRODUTODESTINO];
					todosProdutos = todosProdutos.concat(produtos);
				}
			});
		}
		
		if (todosProdutos.length > 0) {
			fnIncluirDetalhesEmpresaPromocao(conn, queryId, todosProdutos);
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
        setStringOrNull(pStmtCheck, 2, idProduto);
        var rs = pStmtCheck.executeQuery();

        var existe = rs.next() && rs.getInteger(1) > 0;

        // Produto já existe na promoção - não insere novamente
        if (!existe) {
            nextId++;
            pStmtInsert.setInt(1, nextId);
            pStmtInsert.setInt(2, idResumoPromocao);
            setStringOrNull(pStmtInsert, 3, idProduto);
            pStmtInsert.execute();
        }
        rs.close();
        conn.commit();
    }

    pStmtCheck.close();
    pStmtInsert.close();
    pStmtUpdate.close();
}

// Converte o valor para inteiro; se vier array, usa o primeiro valor diferente de -1/null. Padrão: -1
function toIntOrDefault(valor) {
    if (Array.isArray(valor)) {
        var encontrado = -1;
        for (var k = 0; k < valor.length; k++) {
            if (valor[k] !== null && valor[k] !== undefined && Number(valor[k]) !== -1) {
                encontrado = valor[k];
                break;
            }
        }
        valor = encontrado;
    }
    var n = parseInt(valor, 10);
    return isNaN(n) ? -1 : n;
}

function incluirOuAtualizarDetalhePromocaoMarketingDestino(conn, idResumoPromocao, idGrupo, idSubGrupo, idMarca, idFornecedor, idProdutos, stEmpresaDestino) {
    idGrupo = toIntOrDefault(idGrupo);
    idSubGrupo = toIntOrDefault(idSubGrupo);
    idMarca = toIntOrDefault(idMarca);
    idFornecedor = toIntOrDefault(idFornecedor);

    // Existência por produto (quando informado) ou por subgrupo (quando não há produto)
    var checkPorProduto = `
        SELECT COUNT(*)
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO"
        WHERE "IDRESUMOPROMOCAOMARKETING" = ?
          AND "IDPRODUTODESTINO" = ?
    `;
    var checkPorSubGrupo = `
        SELECT COUNT(*)
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO"
        WHERE "IDRESUMOPROMOCAOMARKETING" = ?
          AND "IDSUBGRUPOEMDESTINO" = ?
          AND "IDPRODUTODESTINO" IS NULL
    `;

    var insertQuery = `
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

    var pStmtCheckProduto = conn.prepareStatement(api.replaceDbName(checkPorProduto));
    var pStmtCheckSubGrupo = conn.prepareStatement(api.replaceDbName(checkPorSubGrupo));
    var pStmtInsert = conn.prepareStatement(api.replaceDbName(insertQuery));

    var produtos = Array.isArray(idProdutos) ? idProdutos : [idProdutos];

    var nextId = api.executeScalar(`
        SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMOCAOMARKETINGDESTINO")), 0) + 1
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGDESTINO"
        WHERE 1 = ?
    `, 1);

    for (var i = 0; i < produtos.length; i++) {
        var idProduto = produtos[i];
        var rs;

        if (idProduto) {
            pStmtCheckProduto.setInt(1, idResumoPromocao);
            pStmtCheckProduto.setString(2, String(idProduto));
            rs = pStmtCheckProduto.executeQuery();
        } else {
            pStmtCheckSubGrupo.setInt(1, idResumoPromocao);
            pStmtCheckSubGrupo.setInt(2, idSubGrupo);
            rs = pStmtCheckSubGrupo.executeQuery();
        }

        var existe = rs.next() && rs.getInteger(1) > 0;
        rs.close();

        // Se o produto/subgrupo já existe na promoção, não insere novamente
        if (existe) {
            continue;
        }

        nextId++;
        pStmtInsert.setInt(1, nextId);
        pStmtInsert.setInt(2, idResumoPromocao);
        pStmtInsert.setInt(3, idGrupo);
        pStmtInsert.setInt(4, idSubGrupo);
        pStmtInsert.setInt(5, idMarca);
        pStmtInsert.setInt(6, idFornecedor);
        setStringOrNull(pStmtInsert, 7, idProduto);
        pStmtInsert.setString(8, stEmpresaDestino);
        pStmtInsert.execute();
    }

    conn.commit();

    pStmtCheckProduto.close();
    pStmtCheckSubGrupo.close();
    pStmtInsert.close();
}

function incluirOuAtualizarDetalhePromocaoMarketingOrigem(conn, idResumoPromocao, idGrupo, idSubGrupo, idMarca, idFornecedor, idProdutosOrigem, stEmpresaOrigem) {
    idGrupo = toIntOrDefault(idGrupo);
    idSubGrupo = toIntOrDefault(idSubGrupo);
    idMarca = toIntOrDefault(idMarca);
    idFornecedor = toIntOrDefault(idFornecedor);

    // Existência por produto (quando informado) ou por subgrupo (quando não há produto)
    var checkPorProduto = `
        SELECT COUNT(*)
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM"
        WHERE "IDRESUMOPROMOCAOMARKETING" = ?
          AND "IDPRODUTOORIGEM" = ?
    `;
    var checkPorSubGrupo = `
        SELECT COUNT(*)
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM"
        WHERE "IDRESUMOPROMOCAOMARKETING" = ?
          AND "IDSUBGRUPOEMORIGEM" = ?
          AND "IDPRODUTOORIGEM" IS NULL
    `;

    var insertQuery = `
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

    var pStmtCheckProduto = conn.prepareStatement(api.replaceDbName(checkPorProduto));
    var pStmtCheckSubGrupo = conn.prepareStatement(api.replaceDbName(checkPorSubGrupo));
    var pStmtInsert = conn.prepareStatement(api.replaceDbName(insertQuery));

    var produtos = Array.isArray(idProdutosOrigem) ? idProdutosOrigem : [idProdutosOrigem];

    var nextId = api.executeScalar(`
        SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMOCAOMARKETINGORIGEM")), 0) + 1
        FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM"
        WHERE 1 = ?
    `, 1);

    for (var i = 0; i < produtos.length; i++) {
        var idProduto = produtos[i];
        var rs;

        if (idProduto) {
            pStmtCheckProduto.setInt(1, idResumoPromocao);
            pStmtCheckProduto.setString(2, String(idProduto));
            rs = pStmtCheckProduto.executeQuery();
        } else {
            pStmtCheckSubGrupo.setInt(1, idResumoPromocao);
            pStmtCheckSubGrupo.setInt(2, idSubGrupo);
            rs = pStmtCheckSubGrupo.executeQuery();
        }

        var existe = rs.next() && rs.getInteger(1) > 0;
        rs.close();

        // Se o produto/subgrupo já existe na promoção, não insere novamente
        if (existe) {
            continue;
        }

        nextId++;
        pStmtInsert.setInt(1, nextId);
        pStmtInsert.setInt(2, idResumoPromocao);
        pStmtInsert.setInt(3, idGrupo);
        pStmtInsert.setInt(4, idSubGrupo);
        pStmtInsert.setInt(5, idMarca);
        pStmtInsert.setInt(6, idFornecedor);
        setStringOrNull(pStmtInsert, 7, idProduto);
        pStmtInsert.setString(8, stEmpresaOrigem);
        pStmtInsert.execute();
    }

    conn.commit();

    pStmtCheckProduto.close();
    pStmtCheckSubGrupo.close();
    pStmtInsert.close();
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
    // var bodyJson;
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
            "STATIVO" = ?,
            "STPRODUTO" = ?,
            "STESTRUTURA" = ?,
            "STESTRUTURAPRODUTO" = ?,
            "NUTIPOPROMOCAO" = ?
            WHERE IDRESUMOPROMOCAOMARKETING = ?
        `;

        var pStmt = conn.prepareStatement(api.replaceDbName(query));
        var bodyJson = JSON.parse($.request.body.asString());

        // Atualizar registro principal
        pStmt.setString(1, bodyJson.DSPROMOCAOMARKETING);
        pStmt.setDate(2, bodyJson.DTHORAINICIO);
        pStmt.setDate(3, bodyJson.DTHORAFIM);
        pStmt.setFloat(4, bodyJson.TPAPLICADOA);
        pStmt.setFloat(5, bodyJson.APARTIRDEQTD);
        pStmt.setInt(6, bodyJson.APARTIRDOVLR);
        pStmt.setInt(7, bodyJson.TPFATORPROMO);
        pStmt.setInt(8, bodyJson.FATORPROMOVLR);
        pStmt.setFloat(9, bodyJson.FATORPROMOPERC);
        pStmt.setInt(10, bodyJson.TPAPARTIRDE);
        pStmt.setFloat(11, bodyJson.VLPRECOPRODUTO);
        pStmt.setString(12, bodyJson.STEMPRESAPROMO);
        pStmt.setString(13, bodyJson.STDETPROMOORIGEM);
        pStmt.setString(14, bodyJson.STDETPROMODESTINO);
        pStmt.setString(15, bodyJson.STATIVO);
        pStmt.setString(16, bodyJson.STPRODUTO);
        pStmt.setString(17, bodyJson.STESTRUTURA);
        pStmt.setString(18, bodyJson.STESTRUTURAPRODUTO);
        pStmt.setInt(19, bodyJson.NUTIPOPROMOCAO);
        pStmt.setInt(20, bodyJson.IDRESUMOPROMOCAOMARKETING);
        pStmt.execute();

        // Atualizar empresas
        var retornoEmpresa = incluirOuAtualizarDetalheEmpresaPromocaoMarketing(
            conn,
            bodyJson.IDRESUMOPROMOCAOMARKETING,
            bodyJson.IDEMPRESA,
            bodyJson.STEMPRESAPROMO
        );

		// Processar detalhes de destino
		if (bodyJson.detalhesDestino && Array.isArray(bodyJson.detalhesDestino)) {
			for (var i = 0; i < bodyJson.detalhesDestino.length; i++) {
				var detalheDestino = bodyJson.detalhesDestino[i];
				incluirOuAtualizarDetalhePromocaoMarketingDestino(
					conn, 
					bodyJson.IDRESUMOPROMOCAOMARKETING, 
					detalheDestino.IDGRUPOEMDESTINO, 
					detalheDestino.IDSUBGRUPOEMDESTINO, 
					detalheDestino.IDMARCAEMDESTINO, 
					detalheDestino.IDFORNECEDOREMDESTINO, 
					detalheDestino.IDPRODUTODESTINO, 
					detalheDestino.STATIVO
				);
			}
		}

		// Processar detalhes de origem
		if (bodyJson.detalhesOrigem && Array.isArray(bodyJson.detalhesOrigem)) {
			for (var j = 0; j < bodyJson.detalhesOrigem.length; j++) {
				var detalheOrigem = bodyJson.detalhesOrigem[j];
				incluirOuAtualizarDetalhePromocaoMarketingOrigem(
					conn, 
					bodyJson.IDRESUMOPROMOCAOMARKETING, 
					detalheOrigem.IDGRUPOEMORIGEM, 
					detalheOrigem.IDSUBGRUPOEMORIGEM, 
					detalheOrigem.IDMARCAEMORIGEM, 
					detalheOrigem.IDFORNECEDOREMORIGEM, 
					detalheOrigem.IDPRODUTOORIGEM, 
					detalheOrigem.STATIVO
				);
			}
		}

		// Processar produtos principais
		var todosProdutos = [];
		if (bodyJson.detalhesDestino) {
			bodyJson.detalhesDestino.forEach(function(detalhe) {
				if (detalhe.IDPRODUTODESTINO) {
					var produtos = Array.isArray(detalhe.IDPRODUTODESTINO) ? detalhe.IDPRODUTODESTINO : [detalhe.IDPRODUTODESTINO];
					todosProdutos = todosProdutos.concat(produtos);
				}
			});
		}
       
		
		if (todosProdutos.length > 0) {
			incluirOuAtualizarDetalhesEmpresaPromocao(conn, bodyJson.IDRESUMOPROMOCAOMARKETING, todosProdutos);
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

