var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var IDRESUMOALTERACAOPRECO;
var conn;

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

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {
    
    var dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    var codeBars = $.request.parameters.get("codeBars");
    var descProd = $.request.parameters.get("descProd");
    var idGrpEstrutura = $.request.parameters.get("idGrpEstrutura");
    var idsSubgrpEstrutura = $.request.parameters.get("idsSubgrpEstrutura");
    var precoInicial = $.request.parameters.get("precoInicial");
    var precoFinal = $.request.parameters.get("precoFinal");
    var query;

    if(!idEmpresa){
        query = `
            SELECT DISTINCT
                TBP.IDPRODUTO,
                (CASE 
                    WHEN TBP.IDGRUPOEMPRESARIAL IS NULL THEN 0 
                    ELSE TBP.IDGRUPOEMPRESARIAL 
                END) AS IDGRUPOEMPRESARIAL,
                (CASE 
                    WHEN TBGE.DSGRUPOEMPRESARIAL IS NULL THEN 'TODOS'
                    ELSE  TBGE.DSGRUPOEMPRESARIAL
                END) AS GRUPOEMPRESARIAL,
                TBP.DSNOME,
                TBP.STGRADE,
                TBP.UND,
                TBP.NUCODBARRAS,
                TBP.NUNCM,
                TBP.PRECOCUSTO,
                IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA) AS PRECOVENDA,
                TBP.NUREFERENCIA,
                TBP.DTULTALTERACAO,
                TBP.GRP_MATERIAIS,
                TBP.STATIVO,
                TBP.IDSUBGRUPO,
                TBPEM.SUBGRUPO,
                TBES.DSESTILO,
                TBLE.DSLOCALEXPOSICAO,
                TBPEM.MARCA,
                IFNULL(TBGS.DSGRUPOESTRUTURA, TBPEM.GRUPO) AS DSGRUPOESTRUTURA,
                TBGS.IDGRUPOESTRUTURA,
                IFNULL(TBSE.IDSUBGRUPOESTRUTURA, TBPEM.IDSUBGRUPO) AS IDSUBGRUPOESTRUTURA,
                IFNULL(TBSE.DSSUBGRUPOESTRUTURA, TBPEM.SUBGRUPO) AS DSSUBGRUPOESTRUTURA
            FROM
                "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO TBHP
            RIGHT JOIN "VAR_DB_NAME".PRODUTO TBP ON
                TBP.IDPRODUTO = TBHP.IDPRODUTO  AND TBHP.IDRESUMOLISTAPRECO = ${idGrupoEmpresarial} AND TBHP.STATIVO =  'True'
            LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
                TBPEM.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
                TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
            LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGS ON
                (TBSE.IDGRUPOESTRUTURA = TBGS.IDGRUPOESTRUTURA OR UPPER(TBPEM.GRUPO) = UPPER(TBGS.DSGRUPOESTRUTURA))
            LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBGE ON
                TBGE.IDGRUPOEMPRESARIAL = TBP.IDGRUPOEMPRESARIAL
            LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
                TBLE.IDLOCALEXPOSICAO = TBP.IDLOCALEXPOSICAO
            LEFT JOIN "VAR_DB_NAME".ESTILOS TBES ON
                TBES.IDESTILO = TBP.IDESTILO
            WHERE 
                1 = ?
        `;
    } else{
        query = `
            SELECT DISTINCT
                TBP.IDPRODUTO,
                (CASE 
                	WHEN TBP.IDGRUPOEMPRESARIAL IS NULL THEN 0 
                	ELSE TBP.IDGRUPOEMPRESARIAL 
                END) AS IDGRUPOEMPRESARIAL,
                (CASE 
                	WHEN TBGE.DSGRUPOEMPRESARIAL IS NULL THEN 'TODOS'
                	ELSE  TBGE.DSGRUPOEMPRESARIAL
                END) AS GRUPOEMPRESARIAL,
                TBPP.IDEMPRESA,
                TBEMP.NOFANTASIA,
                TBP.DSNOME,
                TBP.STGRADE,
                TBP.UND,
                TBP.NUCODBARRAS,
                TBP.NUNCM,
                TBP.PRECOCUSTO,
                IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA ) AS PRECOVENDA,
                TBP.NUREFERENCIA,
                TBP.DTULTALTERACAO,
                TBP.GRP_MATERIAIS,
                TBP.STATIVO,
                TBP.IDSUBGRUPO,
                TBPEM.SUBGRUPO,
                TBES.DSESTILO,
                TBLE.DSLOCALEXPOSICAO,
                TBPEM.MARCA,
                IFNULL(TBGS.DSGRUPOESTRUTURA, TBPEM.GRUPO) AS DSGRUPOESTRUTURA,
                TBGS.IDGRUPOESTRUTURA,
                IFNULL(TBSE.IDSUBGRUPOESTRUTURA, TBPEM.IDSUBGRUPO) AS IDSUBGRUPOESTRUTURA,
                IFNULL(TBSE.DSSUBGRUPOESTRUTURA, TBPEM.SUBGRUPO) AS DSSUBGRUPOESTRUTURA
            FROM
                "VAR_DB_NAME".PRODUTO_PRECO TBPP
            INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
                TBPP.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
                TBPEM.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
                TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
            LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGS ON
                (TBSE.IDGRUPOESTRUTURA = TBGS.IDGRUPOESTRUTURA OR UPPER(TBPEM.GRUPO) = UPPER(TBGS.DSGRUPOESTRUTURA))
            LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBGE ON
                TBGE.IDGRUPOEMPRESARIAL = TBP.IDGRUPOEMPRESARIAL
            INNER JOIN "VAR_DB_NAME".EMPRESA TBEMP ON
                TBPP.IDEMPRESA = TBEMP.IDEMPRESA
            LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
                TBLE.IDLOCALEXPOSICAO = TBP.IDLOCALEXPOSICAO
            LEFT JOIN "VAR_DB_NAME".ESTILOS TBES ON
                TBES.IDESTILO = TBP.IDESTILO
            WHERE 
                TBPP.IDEMPRESA = ${idEmpresa}
                AND 1 = ?
        `;
    }
    
    if ( byId ) {
        query += ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
    }
    
    if ( dataUltAtualizacao ) {
        query = query + ' And  tbp.DTULTALTERACAO >= \'' + dataUltAtualizacao + ' ' + horaUltAtualizacao + '\' ';
    }
    
    if(idGrupoEmpresarial || (idEmpresa ==='31' || idEmpresa ==='109' || idEmpresa ==='56' || idEmpresa ==='90' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='51' || idEmpresa ==='86')){
        idGrupoEmpresarial = idGrupoEmpresarial || null
        
        if(idEmpresa ==='31' || idEmpresa ==='109'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 2)`;
        }else if(idEmpresa ==='90' || idEmpresa ==='56' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='86'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 4)`;
        }else if(idEmpresa ==='51'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 2 OR TBP.IDGRUPOEMPRESARIAL = 4)`;
        }else{
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL)`; 
        }
    }
    
    if ( codeBars ) {
        query += ` And  TBP.NUCODBARRAS = '${codeBars}' `;
    }
    
    if ( descProd ) {
        descProd = descProd.split(' ').join('%');
        
        query += ` And  CONTAINS((tbp.DSNOME), '%${descProd}%')`;
    }
    
    if(idGrpEstrutura){
        query +=  ` AND TBGS.IDGRUPOESTRUTURA IN (${idGrpEstrutura}) `;
    }
    
    if(idsSubgrpEstrutura){
        //idsSubgrpEstrutura = idsSubgrpEstrutura.split(',').join(',');
        query +=  ` AND (TBSE.IDSUBGRUPOESTRUTURA IN (${idsSubgrpEstrutura}) OR TBPEM.IDSUBGRUPO IN (${idsSubgrpEstrutura})) `;
    }
    
    if(precoInicial && precoFinal){
        precoInicial = parseFloat(precoInicial);
        precoFinal = parseFloat(precoFinal);
        query += !idEmpresa ? ` AND LEAST(IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA)) >= ${precoInicial} AND GREATEST(IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA)) <= ${precoFinal} ` : ` AND LEAST(IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA )) >= ${precoInicial} AND GREATEST(IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA )) <= ${precoFinal} `
    }
    
    query += `ORDER BY ${idGrupoEmpresarial == 'TODAS_FILIAIS' ? ' TBP.DSNOME, TBEMP.IDEMPRESA' : idGrupoEmpresarial ? ' TBP.DSNOME, TBP.IDGRUPOEMPRESARIAL' : ' TBP.DSNOME,TBP.IDPRODUTO'}`;

    /*$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(query));
	$.response.status = $.net.http.OK;
    return;*/

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function criarResumoAlteracaoPreco(bodyJson, dtHoraResumoAlteracao, agendAlteracao, stExecutado, listEmpresas, conn){
    let tipoAlteracao = 'LOJA';
    let idListaPreco = '';
    let idEmpresa = '';
    
    //Insere ResumoAlteracao
    let queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDRESUMOALTERACAOPRECOPRODUTO")), 0) + 1 FROM "VAR_DB_NAME"."RESUMOALTERACAOPRECOPRODUTO" WHERE 1 = ? ', 1);
    
    let query = `
        INSERT 
            INTO 
                "VAR_DB_NAME"."RESUMOALTERACAOPRECOPRODUTO"
                    (
                     	IDRESUMOALTERACAOPRECOPRODUTO, 
                     	IDUSUARIO, 
                     	DATAALTERACAO, 
                      	QTDITENS,
                      	TPALTERACAO,
                      	IDLISTAOUEMPRESA,
                     	AGENDAMENTOALTERACAO,
                     	STCANCELADO,
                     	STEXECUTADO
                    )
		VALUES(?,?,'${dtHoraResumoAlteracao}',?,?,?,'${agendAlteracao}', 'False', 'False') 
	`;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    if(bodyJson[0]['IDLISTAPRECO']){
       tipoAlteracao = 'GRUPO';
       idListaPreco = bodyJson[0]['IDLISTAPRECO'];
    }
    
    idEmpresa = bodyJson[0]['IDEMPRESA']
    
    pStmt.setInt(1, parseInt(queryId));
	pStmt.setInt(2, parseInt(bodyJson[0].IDUSER));
    pStmt.setInt(3, (bodyJson.length));
    pStmt.setString(4, tipoAlteracao);
    pStmt.setInt(5, parseInt(idListaPreco || idEmpresa));

    pStmt.execute();
    pStmt.close();
	
	IDRESUMOALTERACAOPRECO = queryId;

	criarDetalheAlteracaoPreco(IDRESUMOALTERACAOPRECO, bodyJson, agendAlteracao, stExecutado, listEmpresas, conn);
}

function criarDetalheAlteracaoPreco(idResumoAlteracao, bodyJson, agendAlteracao, stExecutado, listEmpresas, conn){
    
    let prodListQuery = '';
    let idListaPreco =  '';
    let tipoAltercao = '';
    let listaOuEmpresa = true;
    let listProdsFormatada = adicionarQtdEstoqueAoObjeto(bodyJson);
    let prodsAgrupadosPorPreco = agruparPorPreco(listProdsFormatada);

    // Insert DetaheAlteracaoPreco e HistoricoProdutoPreco
    prodsAgrupadosPorPreco.map((dados, indice)=>{
        let idListaPrecoProds = '';
        let idProdsPorPreco = '';
        let precoProdsPorPreco = '';
        let precoAntigo = '';
        let dadosProdComEstoque = '';
        let qtdEstoqueAnterior = 0;
        let qtdEstoque = 0;
        let contador = 0;
        
       let queryInsertDetAltPreco =`
            INSERT 
                INTO 
                    "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
                        (
                            IDRESUMOALTERACAOPRECOPRODUTO, 
                            TPALTERADOGRUPOEMP, 
                            IDGRUPOEMP, 
                            IDPRODUTO, 
                            PRECOVENDAANTERIOR, 
                            PRECOVENDANOVO,
                            STEXCLUIDO,
                            STATIVO,
                            QTDESTOQUEAOCADASTRAR,
                            QTDESTOQUEAOEXECUTAR
                        )
        `;
        
        dados.map((dadoProd, i)=>{
            idListaPrecoProds = (dadoProd.IDLISTAPRECO || dadoProd.IDEMPRESA);
            idProdsPorPreco = dadoProd.IDPRODUTO;
            precoProdsPorPreco = dadoProd.PRECOVENDANOVO;
            tipoAltercao = dadoProd.IDLISTAPRECO ? '0' : '1';
            
            // Busca o Preco Atual antes de ser modificado
            dadosProdComEstoque = tipoAltercao == '0' ? buscaPrecoAtualLista(dadoProd.IDPRODUTO, idListaPrecoProds) : buscaPrecoAtualEmpresa(dadoProd.IDPRODUTO, idListaPrecoProds);
            
            precoAntigo = Number(dadosProdComEstoque.PRECOVENDA);
            
            qtdEstoqueAnterior = Number(dadosProdComEstoque.QTDESTOQUE);
            qtdEstoque = Number(dadosProdComEstoque.QTDESTOQUE);
            
           /* let queryInsertDetAltPreco =`
                INSERT 
                    INTO 
                        "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
                            (
                                IDRESUMOALTERACAOPRECOPRODUTO, 
                                TPALTERADOGRUPOEMP, 
                                IDGRUPOEMP, 
                                IDPRODUTO, 
                                PRECOVENDAANTERIOR, 
                                PRECOVENDANOVO,
                                STEXCLUIDO,
                                STATIVO,
                                QTDESTOQUEAOCADASTRAR,
                                QTDESTOQUEAOEXECUTAR
                            )
                            SELECT
                                ${idResumoAlteracao},
                                ${tipoAltercao},
                                ${idListaPrecoProds},
                                '${dadoProd.IDPRODUTO}',
                                ${precoAntigo},
                                ${dadoProd.PRECOVENDANOVO},
                                'False',
                                'True',
                                ${qtdEstoqueAnterior},
                                ${qtdEstoque}
                            FROM
                                DUMMY 
            `;*/
            
            if(contador >= 500 || i == dados.length - 1){
                queryInsertDetAltPreco += ` SELECT ${idResumoAlteracao}, ${tipoAltercao}, ${idListaPrecoProds}, '${dadoProd.IDPRODUTO}', ${precoAntigo}, ${dadoProd.PRECOVENDANOVO}, 'False', 'True', ${qtdEstoqueAnterior}, ${qtdEstoque} FROM DUMMY `;
            } else if(i < dados.length - 1){
                queryInsertDetAltPreco += ` SELECT ${idResumoAlteracao}, ${tipoAltercao}, ${idListaPrecoProds}, '${dadoProd.IDPRODUTO}', ${precoAntigo}, ${dadoProd.PRECOVENDANOVO}, 'False', 'True', ${qtdEstoqueAnterior}, ${qtdEstoque} FROM DUMMY `;
                queryInsertDetAltPreco += ` UNION ALL `;
            }else{
                queryInsertDetAltPreco += ` SELECT ${idResumoAlteracao}, ${tipoAltercao}, ${idListaPrecoProds}, '${dadoProd.IDPRODUTO}', ${precoAntigo}, ${dadoProd.PRECOVENDANOVO}, 'False', 'True', ${qtdEstoqueAnterior}, ${qtdEstoque} FROM DUMMY `;
                queryInsertDetAltPreco += ` UNION ALL `;
            }
            
            //TODAS AS OUTRAS ROTINAS SÂO EXECUTADAS VIA TRIGGER
            //criarHistoricoPrecoEmpresa(idResumoAlteracao, listEmpresas, stExecutado, dadoProd.PRECOVENDANOVO, dadoProd.IDPRODUTO, conn, tipoAltercao, precoAntigo, qtdEstoqueAnterior);
            
            /*if(stExecutado == 'True'){
                if(tipoAltercao == '0'){
                    //atualizarHistoricoProdutoLista(idResumoAlteracao, idListaPrecoProds, dadoProd.IDPRODUTO, conn);
                    //criarHistoricoPrecoLista(idResumoAlteracao, idListaPrecoProds, dadoProd.PRECOVENDANOVO, dadoProd.IDPRODUTO, conn, qtdEstoque, precoAntigo);
                }
                
                //atualizarPrecoProdutosListaPrecoOuEmpresa(listEmpresas, dadoProd.PRECOVENDANOVO, dadoProd.IDPRODUTO, conn);
                //atualizarDataHoraProduto(agendAlteracao, dadoProd.IDPRODUTO, conn);
            }*/
            /*let pStmt = conn.prepareStatement(api.replaceDbName(queryInsertDetAltPreco));
                
                pStmt.execute();
                pStmt.close();*/
                
            // Faz Inserts de 500 linhas cada para a DetalheAlteracao
            if(contador >= 500 || (i == dados.length - 1)){
                
               let pStmt = conn.prepareStatement(api.replaceDbName(queryInsertDetAltPreco));
                
                pStmt.execute();
                pStmt.close();
                
                contador = 0;
                idListaPrecoProds = '';
                idProdsPorPreco = '';
                precoProdsPorPreco = '';
                precoAntigo = '';
                qtdEstoqueAnterior = 0;
                qtdEstoque = 0;
                
                queryInsertDetAltPreco =`
                    INSERT 
                        INTO 
                            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
                                (
                                    IDRESUMOALTERACAOPRECOPRODUTO, 
                                    TPALTERADOGRUPOEMP, 
                                    IDGRUPOEMP, 
                                    IDPRODUTO, 
                                    PRECOVENDAANTERIOR, 
                                    PRECOVENDANOVO,
                                    STEXCLUIDO,
                                    STATIVO,
                                    QTDESTOQUEAOCADASTRAR,
                                    QTDESTOQUEAOEXECUTAR
                                ) 
                `;
            }
            
            contador++;
        })
        
    })
    
    if(stExecutado == 'True'){
        conn.commit();
        
        let queryUpdateResumo = `
            UPDATE 
                "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO
            SET 
                STEXECUTADO = 'True',
                DATAEXECUTADO = now(),
                DATAATUALIZACAO = now()
            WHERE
                IDRESUMOALTERACAOPRECOPRODUTO = ${idResumoAlteracao}
        `;
        
        let pStmtUpdateResumo = conn.prepareStatement(api.replaceDbName(queryUpdateResumo));
        
        pStmtUpdateResumo.execute();
        pStmtUpdateResumo.close();
    }
    
}

function criarHistoricoPrecoLista(idResumoAlteracao, idListaPrecoProds, precoNovo, idProduto, conn, qtdEstoqueAtual, precoAnterior){
    let precoAntigo = '';
    let qtdEstoqueAnterior = 0;
    let qtdEstoque = 0;
    let contador = 0;
    
    let queryInsertHistLista =`
        INSERT
            INTO
                "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO
                    (
                        IDRESUMOALTERACAOPRECOPRODUTO,
                        IDRESUMOLISTAPRECO,
                        IDPRODUTO,
                        PRECOVENDAANTERIOR,
                        PRECOVENDA,
                        QTDESTOQUEAOCADASTRAR,
                        QTDESTOQUEAOEXECUTAR
                    )
                ${precoAnterior ? `VALUES(
                    ${idResumoAlteracao}, 
                    ${idListaPrecoProds},
                    '${idProduto}',
                    ${precoAnterior},
                    ${precoNovo},
                    ${qtdEstoqueAtual},
                    ${qtdEstoqueAtual}
                )` : `
                SELECT
                    ${idResumoAlteracao} AS IDRESUMOALTERACAOPRECOPRODUTO, 
                    ${idListaPrecoProds} AS IDRESUMOLISTAPRECO,
                    '${idProduto}' AS IDPRODUTO,
                    FIRST_VALUE(IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA)) OVER (ORDER BY TBP.IDPRODUTO) AS PRECOVENDAANTERIOR,
                    ${precoNovo},
                    IFNULL(SUM(TBI.QTDFINAL), 0) AS QTDESTOQUEAOCADASTRAR,
                    IFNULL(SUM(TBI.QTDFINAL), 0) AS QTDESTOQUEAOEXECUTAR
                FROM
                    "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO TBHP
                RIGHT JOIN "VAR_DB_NAME".PRODUTO TBP ON
                    TBP.IDPRODUTO = TBHP.IDPRODUTO AND TBHP.IDRESUMOLISTAPRECO = ${idListaPrecoProds} AND TBHP.STATIVO = 'True'
                LEFT JOIN "VAR_DB_NAME".DETALHELISTAPRECO TBDL ON 
                    TBDL.IDRESUMOLISTAPRECO = ${idListaPrecoProds} AND TBDL.STATIVO = 'True' 
                LEFT JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI ON
                    TBP.IDPRODUTO = TBI.IDPRODUTO AND TBI.IDEMPRESA = TBDL.IDEMPRESA AND  TBI.STATIVO = 'True'
                WHERE
                    TBP.IDPRODUTO = '${idProduto}' 
                GROUP BY
                    TBP.IDPRODUTO, TBHP.PRECOVENDA, TBP.PRECOVENDA `}
    `;
    
    /*let dadosProdLista =  buscaPrecoAtualLista(idProduto, idListaPrecoProds);
    
    precoAntigo = Number(dadosProdLista.PRECOVENDA);
    qtdEstoqueAnterior = Number(dadosProdLista.QTDESTOQUE);
    qtdEstoque = Number(qtdEstoqueAtual || dadosProdLista.QTDESTOQUE);
    
    queryInsertHistLista += ` SELECT ${idResumoAlteracao}, ${idListaPrecoProds}, '${idProduto}', ${precoAntigo}, ${precoNovo}, ${qtdEstoqueAnterior}, ${qtdEstoque} FROM DUMMY `;*/
    
    let pStmtInsertHistLista = conn.prepareStatement(api.replaceDbName(queryInsertHistLista));
    
    pStmtInsertHistLista.execute();
    pStmtInsertHistLista.close();
}

function criarHistoricoPrecoEmpresa(idResumoAlteracao, idsEmpresas, stExecutado, precoNovo, idProduto, conn, tipoAltercao, precoAntigo, qtdEstoque){
    let dtExecutado = stExecutado == 'True' ? 'CURRENT_TIMESTAMP' : null;
    let dadosProdEmp;
    //let precoAntigo;
    let qtdEstoqueAnterior;
    //let qtdEstoque;
    let contador = 0;
    
    let queryInsertHist =`
        INSERT
            INTO
                "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA
                (
                    IDRESUMOALTERACAOPRECOPRODUTO,
                    IDEMPRESA,
                    IDPRODUTO,
                    PRECOVENDAANTERIOR,
                    PRECOVENDA,
                    QTDESTOQUEAOCADASTRAR,
                    QTDESTOQUEAOEXECUTAR,
                    DTHORAEXECUTADO,
                    DTHORAATUALIZADO,
                    STEXECUTADO
                )
                ${(precoAntigo && qtdEstoque) ?
                        `SELECT
                            ${idResumoAlteracao} AS IDRESUMOALTERACAOPRECOPRODUTO,
                            ${ idsEmpresas.includes(',') ? ` TBE.IDEMPRESA ` : idsEmpresas } AS IDEMPRESA,
                            '${idProduto}' AS IDPRODUTO,
                            ${precoAntigo} AS PRECOVENDAANTERIOR,
                            ${precoNovo} AS PRECOVENDA,
                            ${qtdEstoque} AS QTDESTOQUEAOCADASTRAR,
                            ${qtdEstoque} AS QTDESTOQUEAOEXECUTAR,
                            ${dtExecutado} AS DTHORAEXECUTADO,
                            CURRENT_TIMESTAMP AS DTHORAATUALIZADO,
                            '${stExecutado}' AS STEXECUTADO 
                        FROM
                            ${ idsEmpresas.includes(',') ? ` "VAR_DB_NAME".EMPRESA TBE
                        WHERE
                            TBE.IDEMPRESA IN (${idsEmpresas}) 
                        ORDER BY 
                            TBE.IDEMPRESA ` : ` DUMMY `}
                        `
                    :
                        `SELECT
                            ${idResumoAlteracao} AS IDRESUMOALTERACAOPRECOPRODUTO,
                            TBE.IDEMPRESA,
                            '${idProduto}' AS IDPRODUTO,
                            IFNULL(TBPP.PRECO_VENDA, ${precoNovo}) AS PRECOVENDAANTERIOR,
                            ${precoNovo} AS PRECOVENDA,
                            IFNULL(TBI.QTDFINAL, 0) AS QTDESTOQUEAOCADASTRAR,
                            IFNULL(TBI.QTDFINAL, 0) AS QTDESTOQUEAOEXECUTAR,
                            ${dtExecutado} AS DTHORAEXECUTADO,
                            CURRENT_TIMESTAMP AS DTHORAATUALIZADO,
                            '${stExecutado}' AS STEXECUTADO 
                        FROM
                            "VAR_DB_NAME".EMPRESA TBE
                        LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO TBPP ON
                            TBPP.IDEMPRESA = TBE.IDEMPRESA AND TBPP.IDPRODUTO = '${idProduto}'
                        LEFT JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI ON
                            TBE.IDEMPRESA = TBI.IDEMPRESA AND TBI.IDPRODUTO = '${idProduto}' AND TBI.STATIVO = 'True'
                        WHERE
                            TBE.IDEMPRESA IN (${idsEmpresas})`
                }
    `;
    
    let pStmtInsertHist = conn.prepareStatement(api.replaceDbName(queryInsertHist));
    pStmtInsertHist.execute();
    pStmtInsertHist.close();

    /*
    idsEmpresas = idsEmpresas.split(',');
    
    let queryInsertHist =`
        INSERT
            INTO
                "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA
                (
                    IDRESUMOALTERACAOPRECOPRODUTO,
                    IDEMPRESA,
                    IDPRODUTO,
                    PRECOVENDAANTERIOR,
                    PRECOVENDA,
                    QTDESTOQUEAOCADASTRAR,
                    QTDESTOQUEAOEXECUTAR,
                    DTHORAEXECUTADO,
                    DTHORAATUALIZADO,
                    STEXECUTADO
                )
    `;
    
    
    if(idsEmpresas.length > 1){
        
        for(let i = 0; i < idsEmpresas.length; i++){
            let idEmpresa =  idsEmpresas[i];
            
            dadosProdEmp =  buscaPrecoAtualEmpresa(idProduto, idEmpresa);
            precoAntigo = Number(dadosProdEmp.PRECOVENDA);
            qtdEstoqueAnterior = Number(dadosProdEmp.QTDESTOQUE);
            qtdEstoque = Number(dadosProdEmp.QTDESTOQUE);
            
            if(i == idsEmpresas.length - 1 || contador >= 100){
                queryInsertHist += ` SELECT ${idResumoAlteracao}, ${idEmpresa}, '${idProduto}', ${precoAntigo}, ${precoNovo}, ${qtdEstoqueAnterior}, ${qtdEstoque}, ${dtExecutado}, CURRENT_TIMESTAMP, '${stExecutado}' FROM DUMMY `;
            } else if(i < idsEmpresas.length - 1){
                queryInsertHist += ` SELECT ${idResumoAlteracao}, ${idEmpresa}, '${idProduto}', ${precoAntigo}, ${precoNovo}, ${qtdEstoqueAnterior}, ${qtdEstoque}, ${dtExecutado}, CURRENT_TIMESTAMP, '${stExecutado}'  FROM DUMMY `;
                queryInsertHist += ` UNION ALL `;
            }else{
                queryInsertHist += ` SELECT ${idResumoAlteracao}, ${idEmpresa}, '${idProduto}', ${precoAntigo}, ${precoNovo}, ${qtdEstoqueAnterior}, ${qtdEstoque}, ${dtExecutado}, CURRENT_TIMESTAMP, '${stExecutado}'  FROM DUMMY `;
                queryInsertHist += ` UNION ALL `;
            }
            
            if(contador >= 100 || (i == idsEmpresas.length - 1)){
                let pStmtInsertHist = conn.prepareStatement(api.replaceDbName(queryInsertHist));
                
                pStmtInsertHist.execute();
                pStmtInsertHist.close();
                
                dadosProdEmp = '';
                precoAntigo = '';
                qtdEstoqueAnterior = '';
                qtdEstoque = '';
                
                contador = 0;
                
                queryInsertHist =`
                    INSERT
                        INTO
                            "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA
                            (
                                IDRESUMOALTERACAOPRECOPRODUTO,
                                IDEMPRESA,
                                IDPRODUTO,
                                PRECOVENDAANTERIOR,
                                PRECOVENDA,
                                QTDESTOQUEAOCADASTRAR,
                                QTDESTOQUEAOEXECUTAR,
                                DTHORAEXECUTADO,
                                DTHORAATUALIZADO,
                                STEXECUTADO
                            )
                `;
            }
            
            contador++;
        }
    } else {
        let idEmpresa =  idsEmpresas;
        
        dadosProdEmp =  buscaPrecoAtualEmpresa(idProduto, idEmpresa);
        precoAntigo = Number(dadosProdEmp.PRECOVENDA);
        qtdEstoqueAnterior = Number(dadosProdEmp.QTDESTOQUE);
        qtdEstoque = Number(dadosProdEmp.QTDESTOQUE);
        
        queryInsertHist += ` SELECT ${idResumoAlteracao}, ${idEmpresa}, '${idProduto}', ${precoAntigo}, ${precoNovo}, ${qtdEstoqueAnterior}, ${qtdEstoque}, ${dtExecutado}, CURRENT_TIMESTAMP, '${stExecutado}' FROM DUMMY `;
        
        let pStmtInsertHist = conn.prepareStatement(api.replaceDbName(queryInsertHist));
        
        pStmtInsertHist.execute();
        pStmtInsertHist.close();
    }*/
    
}

function adicionarQtdEstoqueAoObjeto(listProds){
    
    listProds.map((prod) => {
        let queryQtdEstoqueProd;
        let idListaPreco = prod.IDLISTAPRECO || false;
        let idEmpresa = prod.IDEMPRESA || prod.IDGRUPOEMP;
        
        if(prod.TPALTERACAOGRUPOEMP == 0){
            idListaPreco = prod.IDGRUPOEMP
        }
        
        if(idListaPreco){
            queryQtdEstoqueProd = `
                SELECT
                    IFNULL(SUM(TBI.QTDFINAL), 0) AS QTDESTOQUEAOCADASTRAR,
                    IFNULL(SUM(TBI.QTDFINAL), 0) AS QTDESTOQUEAOEXECUTAR
                FROM
                    "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI
                INNER JOIN "VAR_DB_NAME".DETALHELISTAPRECO TBD ON
                    TBI.IDEMPRESA = TBD.IDEMPRESA AND TBD.STATIVO = 'True' AND TBI.STATIVO = 'True'
                WHERE 
                    TBD.IDRESUMOLISTAPRECO = ${idListaPreco}
                    AND TBI.IDPRODUTO = '${prod.IDPRODUTO}'
                    AND 1 = ?
            `;
        } else {
            queryQtdEstoqueProd = `
                SELECT
                    IFNULL(SUM(TBI.QTDFINAL), 0) AS QTDESTOQUEAOCADASTRAR,
                    IFNULL(SUM(TBI.QTDFINAL), 0) AS QTDESTOQUEAOEXECUTAR
                FROM
                    "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI
                WHERE 
                    TBI.STATIVO = 'True'
                    AND TBI.IDEMPRESA = ${idEmpresa}
                    AND TBI.IDPRODUTO = '${prod.IDPRODUTO}'
                    AND 1 = ?
            `;
        }
        
        ///let respRegProd = api.sqlQuery(queryQtdEstoqueProd, 1);
        
        prod.QTDESTOQUEAOCADASTRAR = 0///Number(respRegProd[0].QTDESTOQUEAOCADASTRAR);
        return prod.QTDESTOQUEAOEXECUTAR = 0///Number(respRegProd[0].QTDESTOQUEAOEXECUTAR); 
    })
    
    return listProds
}

function atualizarDataHoraProduto(dtHora, idProduto, conn){
    let queryUpdateDtHoraProduto = `
        UPDATE 
            "VAR_DB_NAME"."PRODUTO" 
        SET 
            DTULTALTERACAO = '${dtHora}'
        WHERE 
            IDPRODUTO = '${idProduto}'
    `;
 	     
    let pStmtUpdateDtHoraProduto = conn.prepareStatement(api.replaceDbName(queryUpdateDtHoraProduto));

    pStmtUpdateDtHoraProduto.execute();
    pStmtUpdateDtHoraProduto.close();
}

function atualizarPrecoProdutosListaPrecoOuEmpresa(listEmpresasOuIdEmpresa, precoProduto, idProduto, conn){
    let queryUpdatePreco;
    let pStmtUpdatePreco;
   // let empresasArray = listEmpresasOuIdEmpresalistEmpresasOuIdEmpresa.split(',');
   // let conn2 = $.db.getConnection();
    
    precoProduto = parseFloat(precoProduto);
    
    /*let queryDeleteProduto_Preco = `
        DELETE FROM "VAR_DB_NAME"."PRODUTO_PRECO" 
        WHERE 
            IDPRODUTO = '${idProduto}'
            AND IDEMPRESA IN(${listEmpresasOuIdEmpresa})
    `;
    
    let pStmtDeleteProduto_Preco = conn2.prepareStatement(api.replaceDbName(queryDeleteProduto_Preco));
    
    pStmtDeleteProduto_Preco.execute();
    pStmtDeleteProduto_Preco.close();*/
    
    /*for(let i = 0; i < empresasArray.length; i++){
        
        queryUpdatePreco += `
            SELECT
                '${idProduto}' AS IDPRODUTO,
                TBPP.IDEMPRESA,
                TBPP.PRICE_LIST_ID,
                ${precoProduto} AS PRECO_VENDA
            FROM 
                "VAR_DB_NAME".PRODUTO_PRECO TBPP 
            WHERE
                TBPP.IDEMPRESA = ${empresasArray[i]}
            GROUP BY TBPP.IDEMPRESA, TBPP.PRICE_LIST_ID
        `;
            if(i == empresasArray.length - 1){
            }else if(i < empresasArray.length - 1){
                queryUpdatePreco += ` UNION ALL `;
            }else{
                queryUpdatePreco += ` UNION ALL `;
            }
    */queryUpdatePreco = `
        UPSERT
            "VAR_DB_NAME"."PRODUTO_PRECO" 
            (
            "IDPRODUTO",
            "IDEMPRESA",
            "PRECO_VENDA"
            )
        SELECT
            '${idProduto}' AS IDPRODUTO,
            TBE.IDEMPRESA,
            ${precoProduto} AS PRECO_VENDA
        FROM
            "VAR_DB_NAME"."EMPRESA" TBE
        WHERE
            TBE.IDEMPRESA IN(${listEmpresasOuIdEmpresa})
    `;
    pStmtUpdatePreco = conn.prepareStatement(api.replaceDbName(queryUpdatePreco));
    /*
    queryUpdatePreco = `
        UPDATE
            "VAR_DB_NAME"."PRODUTO_PRECO" 
        SET
            "PRECO_VENDA" = ?
        WHERE 
            IDPRODUTO = ? 
            AND IDEMPRESA IN(${listEmpresasOuIdEmpresa})
    `;
    
    let queryRegExist = `
        SELECT
            DISTINCT
                IDPRODUTO
        FROM
            "VAR_DB_NAME"."PRODUTO_PRECO" 
        WHERE 
            IDPRODUTO = '${idProduto}' 
            AND IDEMPRESA = ${empresasArray[i]}
            AND 1 = ?
        LIMIT 1
    `;
    
    let resultRegExist = api.sqlQuery(queryRegExist, 1)
    
    if(resultRegExist.length){
        queryUpdatePreco = `
            UPDATE
                "VAR_DB_NAME"."PRODUTO_PRECO" 
            SET
                "PRECO_VENDA" = ?
            WHERE 
                IDPRODUTO = ? AND IDEMPRESA = ${empresasArray[i]}
        `;
    } else {
        queryUpdatePreco = `
            INSERT
                "VAR_DB_NAME"."PRODUTO_PRECO" 
            (
                "IDPRODUTO",
                "IDEMPRESA",
                "PRICE_LIST_ID",
                "PRECO_VENDA"
            )
            SELECT
                DISTINCT
                    '${idProduto}' AS IDPRODUTO,
                    TBPP.IDEMPRESA,
                    TBPP.PRICE_LIST_ID,
                    ${precoProduto} AS PRECO_VENDA
            FROM 
                "VAR_DB_NAME".PRODUTO_PRECO TBPP 
            WHERE
                TBPP.IDEMPRESA  = ${empresasArray[i]}
        `;
    }
        
    }
    
    queryUpdatePreco = `
        INSERT INTO "VAR_DB_NAME"."PRODUTO_PRECO" ("IDPRODUTO", "IDEMPRESA", "PRICE_LIST_ID", "PRECO_VENDA")
        SELECT
            '${idProduto}' AS IDPRODUTO,
            TBPP.IDEMPRESA,
            TBPP.PRICE_LIST_ID,
            ${precoProduto} AS PRECO_VENDA
        FROM 
            "VAR_DB_NAME"."PRODUTO_PRECO" TBPP 
        WHERE
            TBPP.IDEMPRESA IN (${listEmpresasOuIdEmpresa})
        GROUP BY TBPP.IDEMPRESA, TBPP.PRICE_LIST_ID
    `;*/
    
    /*queryUpdatePreco = `
        UPSERT
            "VAR_DB_NAME"."PRODUTO_PRECO" 
        (   
            "IDPRODUTO",
            "IDEMPRESA",
            "PRICE_LIST_ID",
            "PRECO_VENDA"
        )
        SELECT
            ? AS IDPRODUTO,
            TBPP.IDEMPRESA,
            TBPP.PRICE_LIST_ID,
            ? AS PRECO_VENDA
        FROM 
            "VAR_DB_NAME".PRODUTO_PRECO TBPP 
        WHERE
            TBPP.IDEMPRESA IN(${listEmpresasOuIdEmpresa})
        GROUP BY TBPP.IDEMPRESA, TBPP.PRICE_LIST_ID
    `;
    
    pStmtUpdatePreco = conn.prepareStatement(api.replaceDbName(queryUpdatePreco));
    pStmtUpdatePreco.setString(1, idProduto);
    pStmtUpdatePreco.setFloat(2, precoProduto)*/
    
    /*queryUpdatePreco = `
        UPDATE
            "VAR_DB_NAME"."PRODUTO_PRECO" 
        SET
            "PRECO_VENDA" = ?
        WHERE 
            IDPRODUTO = ? AND IDEMPRESA IN(${listEmpresasOuIdEmpresa})
    `;
    
    pStmtUpdatePreco = conn.prepareStatement(api.replaceDbName(queryUpdatePreco));
    
    pStmtUpdatePreco.setFloat(1, precoProduto);
    pStmtUpdatePreco.setString(2, idProduto);*/
    
    pStmtUpdatePreco.execute();
    pStmtUpdatePreco.close();
}

function atualizarHistoricoProdutoLista(idResumoAlteracao, idLista, idProduto, conn){
    let prodListQuery = '';
    let idListaPreco = '';
    let contador = 0;
    let dadosAlteracao;

    let updateRegProdHist = `
        UPDATE 
            "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO
        SET
            STATIVO = 'False'
        WHERE
            IDPRODUTO = '${idProduto}'
            AND STATIVO = 'True'
            AND IDRESUMOLISTAPRECO = ? 
            AND IDRESUMOALTERACAOPRECOPRODUTO <> ?
    `;
    
    let pStmtUpdateHist = conn.prepareStatement(api.replaceDbName(updateRegProdHist));
    
    pStmtUpdateHist.setInt(1, parseInt(idLista));
    pStmtUpdateHist.setInt(2, parseInt(idResumoAlteracao));
    
    pStmtUpdateHist.execute();
    pStmtUpdateHist.close();
}

function atualizarHistoricoProdutoEmpresa(idResumoAlteracao, idProduto, precoNovo, stExecutado, stAtivo, conn){
    let prodListQuery = '';
    let idListaPreco = '';
    let contador = 0;
    let dadosHistProdEmpresa;
    
    if(idResumoAlteracao){
        let queryDetHistEmpresa = `
            SELECT
                *
            FROM
                "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA
            WHERE 
                IDRESUMOALTERACAOPRECOPRODUTO = '${idResumoAlteracao}'
                AND IDPRODUTO = '${idProduto}'
                AND STATIVO <> 'False'
                AND STEXCLUIDO <> 'True'
                AND 1 = ?
        `;
        
        dadosHistProdEmpresa = api.sqlQuery(queryDetHistEmpresa, 1);
         
    }
    
    if(!dadosHistProdEmpresa.length){
        throw 'Registros com historico de preco empresa não encontrado, verifique o historico com IDRESUMOALTERACAO: ' + idResumoAlteracao;
    }
    
    dadosHistProdEmpresa.map((registro, indice) => {
        let updateHistProdEmpresa;
        
        if(stAtivo == 'False'){
            updateHistProdEmpresa = `
                UPDATE 
                    "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA
                SET
                    DTHORAATUALIZADO = CURRENT_TIMESTAMP,
                    STATIVO = '${stAtivo}'
                WHERE 
                    IDHISTORICOALTERACAOPRECOPRODUTOEMPRESA = ?
            `;
        } else {
            
            let qtdEstoqueAtual = Number(buscaPrecoAtualEmpresa(registro.IDPRODUTO, registro.IDEMPRESA).QTDESTOQUE);
            
            updateHistProdEmpresa = `
                UPDATE 
                    "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA
                SET
                    PRECOVENDA = ${precoNovo},
                    QTDESTOQUEAOEXECUTAR = ${qtdEstoqueAtual},
                    DTHORAEXECUTADO = CURRENT_TIMESTAMP,
                    DTHORAATUALIZADO = CURRENT_TIMESTAMP,
                    STEXECUTADO = '${stExecutado}',
                    STATIVO = '${stAtivo}'
                WHERE 
                    IDHISTORICOALTERACAOPRECOPRODUTOEMPRESA = ?
            `;
        }
        
        let pStmtUpdateHistProdEmpresa = conn.prepareStatement(api.replaceDbName(updateHistProdEmpresa));
        
        pStmtUpdateHistProdEmpresa.setInt(1, parseInt(registro.IDHISTORICOALTERACAOPRECOPRODUTOEMPRESA));
        
        pStmtUpdateHistProdEmpresa.execute();
        pStmtUpdateHistProdEmpresa.close();
    })
}

function atualizarEstoqueDetalheAlteracao(isLista, idListaOuEmpresa, idProduto, idDetalheAlteracao, conn){
    
    let qtdEstoqueAtual = isLista == 'True' ? Number(buscaPrecoAtualLista(idProduto, idListaOuEmpresa).QTDESTOQUE) : Number(buscaPrecoAtualEmpresa(idProduto, idListaOuEmpresa).QTDESTOQUE);
        
    let updateEstoqueDetalhe = `
        UPDATE 
            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
        SET
            QTDESTOQUEAOEXECUTAR = ${qtdEstoqueAtual}
        WHERE 
            IDDETALHEALTERACAOPRECOPRODUTO = ?
    `;
    
    let pStmtUpdateEstoqueDetalhe = conn.prepareStatement(api.replaceDbName(updateEstoqueDetalhe));
    
    pStmtUpdateEstoqueDetalhe.setInt(1, parseInt(idDetalheAlteracao));
    
    pStmtUpdateEstoqueDetalhe.execute();
    pStmtUpdateEstoqueDetalhe.close();
}

function buscaEmpresasDaListaDePreco(idListaPreco){
    let listaEmpresas = '';
    
    let queryEmpsList =`
        SELECT 
            IDEMPRESA
        FROM
            "VAR_DB_NAME".DETALHELISTAPRECO
        WHERE 
            IDRESUMOLISTAPRECO = ${idListaPreco}
            AND STATIVO = 'True'
            AND 1= ?
    `;
    
    let regsEmps = api.sqlQuery(queryEmpsList, 1);
    
    if(regsEmps.length){
        regsEmps.map((dado, indice) => {
            let idEmpresa = dado['IDEMPRESA'];
            
            if(indice == regsEmps.length - 1){
                listaEmpresas += `'${idEmpresa}'`;
            } else if(indice < regsEmps.length -1){
                listaEmpresas += `'${idEmpresa}',`;
            }
            
        });
        
        return listaEmpresas;
    }

    return false;
}

function agruparPorPreco (produtos) {
    // Agrupa os Produtos de Acordo com o Preco e retorna um array de arrays com cada lista tendo somente os produtos com o mesmo preco
    const mapaPreco = new Map();

    produtos.forEach((produto) => {
        const preco = produto.PRECOVENDANOVO;
        
        if (!mapaPreco.has(preco)) {
            mapaPreco.set(preco, []);
        }
        
        mapaPreco.get(preco).push(produto);
    });

    return Array.from(mapaPreco.values());
};

function buscaPrecoAtualLista(idProduto, idListaPreco){
    let queryPreco = `
        SELECT
            IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA) AS PRECOVENDA,
            SUM(IFNULL(TBI.QTDFINAL, 0)) AS QTDESTOQUE
        FROM
            "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO TBHP
        RIGHT JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBP.IDPRODUTO = TBHP.IDPRODUTO AND TBHP.IDRESUMOLISTAPRECO = ${idListaPreco} AND TBHP.STATIVO = 'True'
        LEFT JOIN "VAR_DB_NAME".DETALHELISTAPRECO TBDL ON 
            TBDL.IDRESUMOLISTAPRECO = ${idListaPreco} AND TBDL.STATIVO = 'True' 
        LEFT JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI ON
            TBP.IDPRODUTO = TBI.IDPRODUTO AND TBI.IDEMPRESA = TBDL.IDEMPRESA AND  TBI.STATIVO = 'True' AND TBDL.STATIVO = 'True'
        WHERE
            TBP.IDPRODUTO = '${idProduto}' AND 1 = ?
        GROUP BY
            TBP.IDPRODUTO, TBHP.PRECOVENDA, TBP.PRECOVENDA
        /*
        SELECT
            IFNULL(TO_VARCHAR(TBHP.IDHISTORICOALTERACAOPRECOPRODUTOLISTAPRECO), TBP.IDPRODUTO) AS ID,
            IFNULL(TBHP.IDPRODUTO, TBP.IDPRODUTO) AS IDPRODUTO,
            IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA) AS PRECOVENDA,
            (
                SELECT
                    SUM(IFNULL(TBI.QTDFINAL, 0)) AS QTDESTOQUE
                FROM
                    "VAR_DB_NAME".DETALHELISTAPRECO TBD
                LEFT JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI ON
                    TBI.IDEMPRESA = TBD.IDEMPRESA AND TBD.STATIVO = 'True'
                WHERE 
                    TBI.STATIVO = 'True'
                    AND TBD.IDRESUMOLISTAPRECO = ${idListaPreco}
                    AND TBI.IDPRODUTO = '${idProduto}'
            ) AS QTDESTOQUE
        FROM
            "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO TBHP
        RIGHT JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBP.IDPRODUTO = TBHP.IDPRODUTO AND TBHP.IDRESUMOLISTAPRECO = ${idListaPreco}
        WHERE 
            TBP.IDPRODUTO = '${idProduto}' 
            AND 1 = ? 
        ORDER BY 
            ID DESC
        LIMIT 1 */
    `;
    
    let dadosReg = api.sqlQuery(queryPreco, 1);
    
   // precoAntigo = Number(precoAntigo[0].PRECOVENDA);
  
    return dadosReg[0];
}

function buscaPrecoAtualEmpresa(idProduto, idEmpresa){
    let queryPreco =`
        SELECT 
            IFNULL(TBPP.IDPRODUTO, TBP.IDPRODUTO) AS IDPRODUTO,
            IFNULL(TBPP.PRECO_VENDA, TBP.PRECOVENDA) AS PRECOVENDA,
            (
                SELECT
                    IFNULL(SUM(TBI.QTDFINAL), 0) AS QTDESTOQUE
                FROM
                    "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI
                WHERE 
                    TBI.STATIVO = 'True'
                    AND TBI.IDEMPRESA = ${idEmpresa}
                    AND TBI.IDPRODUTO = '${idProduto}'
            ) AS QTDESTOQUE
        FROM 
            "VAR_DB_NAME".PRODUTO_PRECO TBPP
        RIGHT JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBP.IDPRODUTO = TBPP.IDPRODUTO
        WHERE 
           TBP.IDPRODUTO = '${idProduto}'
           AND TBPP.IDEMPRESA = ${idEmpresa} 
           AND 1 = ? 
    `;
 
    let regProd = api.sqlQuery(queryPreco, 1);
    
   // precoAntigo = Number(precoAntigo[0].PRECOVENDA);
    
    return regProd[0];
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    
    let precoAntigo;
    let agendAlteracao;

    let prodsAgrupadosPorPreco;
    
    let idResumoAlteracao;
    let stAltValida = true;
    let prodListQuery = '';
    let listEmpresas = '';
    let prodListVerificar = [];
    let prodsEncontrados = [];
    let idsProdsNaoEncontrados = [];
    let validaProxPasso = true;
    let stExecutado = 'False';
    let stAtivo = 'True';
    let stCancelado = 'False';
    
    let dtHora = new Date();
    let dtHoraImediato;
    let dtHoraPadrao;
    
    dtHoraImediato = dtHora;
    dtHoraImediato = dtHoraImediato.toISOString().split('T')[0] + ' ' + dtHoraImediato.toLocaleTimeString('pt-BR')
    
    dtHoraPadrao = dtHora;
    dtHoraPadrao.setDate(dtHoraPadrao.getDate() + 1);
    dtHoraPadrao = dtHoraPadrao.toISOString().split('T')[0] + ' 05:00:00';
    
    try{
        if(bodyJson[0].STAGENDAMENTOPERSONALIZADO && !bodyJson[0].DTAGENDAMENTOPERSONALIZADO){
            return {
         	    type: 'warning',
         	    msg : "Data vazia!",
         	};
        }
        
        bodyJson.map((registro, indice) => {
            idResumoAlteracao = registro.IDRESUMOALTERACAOPRECO;
            let stCancelado = registro.STCANCELADO || 'False';
            let idFuncionario = registro.IDFUNCIONARIO;
            
            let queryDetResumoAlteracao = `
                SELECT
                    TBR.TPALTERACAO,
                    TBD.IDDETALHEALTERACAOPRECOPRODUTO,
                    TBD.IDGRUPOEMP,
                    TBD.IDPRODUTO,
                    TBD.PRECOVENDAANTERIOR,
                    TBD.PRECOVENDANOVO, 
                    TBD.QTDESTOQUEAOCADASTRAR
                FROM
                    "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
                INNER JOIN "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD ON
                    TBR.IDRESUMOALTERACAOPRECOPRODUTO = TBD.IDRESUMOALTERACAOPRECOPRODUTO 
                    AND TBD.STATIVO = 'True'
                WHERE 
                    TBR.STEXECUTADO <> 'True'
                    AND STCANCELADO <> 'True'
                    AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ?
            `;
            
            let regDetResumo = api.sqlQuery(queryDetResumoAlteracao, idResumoAlteracao);

            if(regDetResumo.length){
                let updateResumoAlteracao;
                
                if(stCancelado == 'True'){
                    let stAtivo = 'False';
                    
                    //Feito via TRIGGER
                    
                    /*regDetResumo.map((det, indice) => {
                        atualizarHistoricoProdutoEmpresa(idResumoAlteracao, det.IDPRODUTO, det.PRECOVENDANOVO, 'False', stAtivo, conn);
                    })*/
                    
                    updateResumoAlteracao = `
                        UPDATE
                            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO
                        SET 
                            RESPATUALIZACAO = ${idFuncionario},
                            DATAATUALIZACAO = now(), 
                            STCANCELADO = '${stCancelado}'
                        WHERE 
                            IDRESUMOALTERACAOPRECOPRODUTO = ?
                    `;
                    
                    let updateDetalheAlteracao = `
                        UPDATE
                            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
                        SET 
                            RESPATUALIZACAO = ${idFuncionario},
                            DATAATUALIZACAO = now(), 
                            STATIVO = '${stAtivo}'
                        WHERE 
                            IDRESUMOALTERACAOPRECOPRODUTO = ?
                    `;
                    
                    let pStmtUpdateDetalhe = conn.prepareStatement(api.replaceDbName(updateDetalheAlteracao));
                    
                    pStmtUpdateDetalhe.setInt(1, idResumoAlteracao);
                    
                    pStmtUpdateDetalhe.execute();
                    pStmtUpdateDetalhe.close();
                    
                } else {
                    if(registro.STAGENDAMENTOIMEDIATO){
                        let idLista = regDetResumo[0].IDGRUPOEMP;
                        
                        if(regDetResumo[0].TPALTERACAO == 'GRUPO'){
                            listEmpresas = buscaEmpresasDaListaDePreco(`'${idLista}'`);
                        } else {
                            listEmpresas = `'${idLista}'`;
                        }
                        
                        let isLista = 'False';
                        
                        agendAlteracao = dtHoraImediato;
                        stExecutado = 'True';
                        
                        /*regDetResumo.map((det, indice) => {
                            if(regDetResumo[0].TPALTERACAO == 'GRUPO') {
                                isLista = 'True'
                                
                               atualizarHistoricoProdutoLista(idResumoAlteracao, det.IDGRUPOEMP, det.IDPRODUTO, conn);
                               criarHistoricoPrecoLista(idResumoAlteracao, det.IDGRUPOEMP, det.PRECOVENDANOVO, det.IDPRODUTO, conn, det.QTDESTOQUEAOCADASTRAR);
                            }
                            
                            atualizarEstoqueDetalheAlteracao(isLista, det.IDGRUPOEMP, det.IDPRODUTO, det.IDDETALHEALTERACAOPRECOPRODUTO, conn)
                            
                            atualizarHistoricoProdutoEmpresa(idResumoAlteracao, det.IDPRODUTO, det.PRECOVENDANOVO, stExecutado, stAtivo, conn);
                            
                            atualizarPrecoProdutosListaPrecoOuEmpresa(listEmpresas, det.PRECOVENDANOVO, det.IDPRODUTO, conn);
                            atualizarDataHoraProduto(agendAlteracao, det.IDPRODUTO, conn);
                        })*/
                    }
                    
                    if(registro.STAGENDAMENTOPERSONALIZADO){
                        agendAlteracao = (registro.DTAGENDAMENTOPERSONALIZADO).replace('T', ' ') + ' 05:00:00';
                    }
                    
                   updateResumoAlteracao = `
                        UPDATE
                            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO
                        SET 
                            AGENDAMENTOALTERACAO = '${agendAlteracao}',
                            STEXECUTADO = '${stExecutado}',
                            DATAEXECUTADO = now(),
                            RESPATUALIZACAO = ${registro.IDFUNCIONARIO},
                            DATAATUALIZACAO = now()
                        WHERE 
                            IDRESUMOALTERACAOPRECOPRODUTO = ?
                    `;
                }
                
                let pStmtUpdateResumo = conn.prepareStatement(api.replaceDbName(updateResumoAlteracao));
                
                pStmtUpdateResumo.setInt(1, idResumoAlteracao);
                
                pStmtUpdateResumo.execute();
                pStmtUpdateResumo.close();
            } else {
                stAltValida = false;
            }
        })
        
        if(stAltValida){
            conn.commit()
            
            return {
                "type": 'success',
                "msg": "Update feito com sucesso!",
                "IDRESUMOALTERACAOPRECO": idResumoAlteracao
            };
        }
        
        return {
            "type": 'warning',
            "msg": "Está alteração já foi realizada ou cancelada, recarregue a página e tente novamente!"
        };
        
    } catch (error){
        conn.rollback();
        throw error
    } finally{
        conn.close();
    }
    
}

function fnHandlePost() {
    conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    
    let precoAntigo;
    let agendAlteracao;

    let prodsAgrupadosPorPreco;
    
    let prodListQuery = '';
    let listEmpresas = '';
    let prodListVerificar = [];
    let prodsEncontrados = [];
    let idsProdsNaoEncontrados = [];
    let validaProxPasso = true;
    let stExecutado = 'False';
    let idLista = bodyJson[0]['IDLISTAPRECO'];
    
    let dtHora = new Date();
    let dtHoraImediato;
    let dtHoraPadrao;
    
    dtHoraImediato = dtHora;
    dtHoraImediato = dtHoraImediato.toISOString().split('T')[0] + ' ' + dtHoraImediato.toLocaleTimeString('pt-BR')
    
    dtHoraPadrao = dtHora;
    dtHoraPadrao.setDate(dtHoraPadrao.getDate() + 1);
    dtHoraPadrao = dtHoraPadrao.toISOString().split('T')[0] + ' 05:00:00';
    
    if(bodyJson.length > 10000){
       /* return {
            typemsg: 'warning',
            msg: `Alteração deve ser limitada a no máximo 10.000 linhas! Sua alteração contém: ${bodyJson.length} Linhas`
        }*/
    }
    
    try{
        // Valida produtos
        bodyJson.map((registro, indice) => {
            prodListVerificar.push(registro['IDPRODUTO']);
            
            if(indice < bodyJson.length -1){
                prodListQuery += `'${registro['IDPRODUTO']}',`;
            } else if(indice == bodyJson.length - 1){
                prodListQuery += `'${registro['IDPRODUTO']}'`;
            } else {
                prodListQuery += `'${registro['IDPRODUTO']}',`;
            }
        });
        
        let queryExistProds =`
            SELECT 
                IDPRODUTO
            FROM
                "VAR_DB_NAME".PRODUTO
            WHERE 
                IDPRODUTO IN(${prodListQuery}) 
                AND STATIVO = 'True'
                AND 1 = ? 
        `;
        
        let regProdsExists = api.sqlQuery(queryExistProds, 1);
      
        regProdsExists.map(dadoProd=>prodsEncontrados.push(dadoProd['IDPRODUTO']));
        
        prodListVerificar.map((dadoProd, indice)=>{
            if(!prodsEncontrados.includes(dadoProd)){
                idsProdsNaoEncontrados.push(dadoProd);
                validaProxPasso = false;
            }
        });
        
        if(!validaProxPasso){
            return{
                "type": 'warning',
                "msg": 'Produtos não encontrados, verifique os dados e tente novamente',
                "idsprodutos": idsProdsNaoEncontrados
            }
        }
        
        //Agrupa produtos por preco
        prodsAgrupadosPorPreco = agruparPorPreco(bodyJson);
        
        // Pega todas as empresas da lista de preco
        if(idLista){
            listEmpresas = buscaEmpresasDaListaDePreco(idLista);
           
            if(!listEmpresas){
                return{
                    "type": 'warning', 
                    "msg": 'Lista de preço inexistente, verifique os dados e tente novamente!'
                }
            }
        } else {
            listEmpresas = bodyJson[0].IDEMPRESA;
        }
        
        if(bodyJson[0].STAGENDAMENTOPADRAO){
            agendAlteracao = dtHoraPadrao;
        }
        
        if(bodyJson[0].STAGENDAMENTOIMEDIATO){
            agendAlteracao = dtHoraImediato;
            stExecutado = 'True';
        }
        
        if(bodyJson[0].STAGENDAMENTOPERSONALIZADO){
            if(!bodyJson[0].DTAGENDAMENTOPERSONALIZADO){
                return {
             	    type: 'warning',
             	    msg : "Data vazia!",
             	};
            }
            
            agendAlteracao = (bodyJson[0].DTAGENDAMENTOPERSONALIZADO).replace('T', ' ') + ' 05:00:00';
        }
        
       // Insere o ResumoAlteracao, DetalheAlteracao e HistoricoProdutoPrecoLista
       criarResumoAlteracaoPreco(bodyJson, dtHoraImediato, agendAlteracao, stExecutado, listEmpresas, conn);
       
       conn.commit();
       
         
        /*if(stExecutado == 'True'){
            atulizarStExecutadoResumoAlteracao(IDRESUMOALTERACAOPRECO);
            conn.commit(); 
        }*/
       conn.commit();
       conn.close();
     
     	return {
     	    type: 'success',
     	    msg : "Atualização realizada com sucesso!",
     	    "IDRESUMOALTERACAOPRECO": IDRESUMOALTERACAOPRECO
     	};
     	
    } catch (error){
        conn.rollback();
        throw error;
    }
    
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            //$.response.setBody(JSON.stringify(fnHandleGet(id)));
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