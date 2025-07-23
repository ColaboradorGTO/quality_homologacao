var api = $.import("quality.concentrador.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    
    var dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idLista = $.request.parameters.get("idLista");
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    var codeBars = $.request.parameters.get("codeBars");
    var descProd = $.request.parameters.get("descProd");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var idResumoPedido = $.request.parameters.get("idResumoPedido");
    var query;
    
    if(/*!idResumoPedido || */!idFornecedor){
        throw 'idFornecedor ou idPedido não informado!';
    }
    
    query = `
        SELECT
            XA.IDRESUMOPEDIDO,
            XA.IDFORNECEDOR,
            XA."ItemCode" AS IDPRODUTO,
            XA."CodeBars" AS NUCODBARRAS,
            XA."ItemName" AS DSNOME,
            XA."Price" as PRECOVENDA,
            XA."Tamanho" AS TAMANHO,
            XA."Grupo" AS GRUPO,
            XA."Estilo" AS DSESTILO,
            XA."local" AS DSLOCALEXPOSICAO,
            XA."ListName" AS DSLISTAPRECO,
            XA."FirmName" AS MARCA
        FROM
            (
                SELECT
                    TBR.IDRESUMOPEDIDO,
                    TBR.IDFORNECEDOR,
                    A."ItemCode",
                    A."U_IS_EAN_GTO" AS "CodeBars",
                    A."ItemName",
                    CAST(B."Price" AS decimal) AS "Price",
                    K."ListName",
                    CASE
                        WHEN IFNULL(H."DSTAMANHO", '') <> '' THEN H."DSTAMANHO"
                        WHEN IFNULL(H."DSTAMANHO", '') = '' AND IFNULL(A."U_TAM", '') <> '' THEN A."U_TAM"
                        ELSE (
                            SELECT
                            	"Name"
                            FROM
                            	SBO_GTO_PRD."@OTB_ESCALA_TAMANHO" XA
                            WHERE
                            	TO_CHAR(XA."Code") = TO_CHAR(A."U_CodigoDoTamanho")
                        )
                    END AS "Tamanho",
                    1 AS "Quantity",
                    CASE
                        WHEN A."U_GRP_EMP" = 1 THEN 'Tesoura'
                        WHEN A."U_GRP_EMP" = 2 THEN 'Magazine'
                        WHEN A."U_GRP_EMP" = 3 THEN 'Yorus'
                        WHEN A."U_GRP_EMP" = 4 THEN 'Free Center'
                    END AS "Grupo",
                    CASE
                        WHEN IFNULL(F."DSESTILO", '') <> '' AND IFNULL(C."Estilo", '') = '' THEN J."U_Desc" || '-' || F."DSESTILO"
                        WHEN IFNULL(C."Estilo", '') <> '' AND IFNULL(F."DSESTILO", '') = '' THEN C."Estilo"
                        WHEN TBG.IDGRUPOESTRUTURA = 9 THEN 'Intimo' || '-' || D."U_Desc" || '-' || F."DSESTILO"
                        WHEN IFNULL(F."DSESTILO", '') <> '' AND IFNULL(C."Estilo", '') <> '' THEN J."U_Desc" || '-' || F."DSESTILO"
                    ELSE D."U_Desc"
                    END "Estilo",
                    IFNULL(A."U_LOCAL", G."DSLOCALEXPOSICAO") AS "local",
                    L."FirmName"
                FROM
                    SBO_GTO_PRD.OITM A
                INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON 
                    TBDP.IDPRODCADASTRO = A."ItemCode"
                INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
                    TBR.IDRESUMOPEDIDO = TBDP.IDRESUMOPEDIDO
                    AND TBR.STCANCELADO = 'False'
                    AND TBDP.STCANCELADO = 'False'
                LEFT JOIN SBO_GTO_PRD.ITM1 B ON
                    B."ItemCode" = A."ItemCode"
                LEFT JOIN SBO_GTO_PRD."VW_ESTILO_ETIQUETA" C ON
                    C."ItemCode" = A."ItemCode"
                LEFT JOIN SBO_GTO_PRD.OITB D ON
                    A."ItmsGrpCod" = D."ItmsGrpCod"
                LEFT JOIN "VAR_DB_NAME".PRODUTO TBP ON 
                    TBDP.IDPRODCADASTRO = TBP.IDPRODUTO AND A."ItemCode" = TBP."IDPRODUTO"
                LEFT JOIN "VAR_DB_NAME"."ESTILOS" F ON
                    TBP."IDESTILO" = F."IDESTILO"
                LEFT JOIN "VAR_DB_NAME"."LOCALEXPOSICAO" G ON
                    TBP."IDLOCALEXPOSICAO" = G."IDLOCALEXPOSICAO"
                LEFT JOIN "VAR_DB_NAME"."TAMANHO" H ON
                    TBP."IDTAMANHO" = H."IDTAMANHO"
                LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA I ON
                    TBP.IDSUBGRUPO = I.IDSUBGRUPOESTRUTURA
                LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBG ON
                    I.IDGRUPOESTRUTURA = TBG.IDGRUPOESTRUTURA
                LEFT JOIN SBO_GTO_PRD.OITB J ON
                    I.IDSAP = J."ItmsGrpCod"
                INNER JOIN SBO_GTO_PRD.OPLN K ON 
                    B."PriceList" = K."ListNum"
                INNER JOIN SBO_GTO_PRD.OMRC L ON
                    A."FirmCode" = L."FirmCode"
                WHERE
                    A."U_IS_EAN_GTO" IS NOT NULL
                    AND A."ItmsGrpCod" NOT IN (100, 134)
                    AND A."FirmCode" NOT IN (1583)
                    AND B."PriceList" = '107'
                    AND TBDP.STCADASTRADO = 'True'
                    AND 1 = ? 
    `;

    if(byId){
        query += ` AND A."ItemCode" = '${byId}' `;
    }
    
    if(idLista){
        query += ` AND B."PriceList" = '${idLista}' `;
    }
    
    if(descProd){
        descProd = descProd.trim().toUpperCase();
        descProd = descProd.split(' ').join('%');
        query += ` AND UPPER(A."ItemName") LIKE '%${descProd}%' `;
    }
    
    if(codeBars){
        codeBars = codeBars.trim();
        query += ` AND A."CodeBars" = '${codeBars}' `;
    }
    
    if(idFornecedor){
        query += ` 
            AND TBR.IDFORNECEDOR = ${idFornecedor} 
        `;
    }
    
    if(idResumoPedido && idFornecedor){
        query += ` 
            AND TBR.IDRESUMOPEDIDO = ${idResumoPedido} 
        `;
    }
    
    query += ` ORDER BY "ItemName" ASC ) XA `;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function atualizarHistoricoPrecoLista(bodyJson, conn){
    let prodListQuery = '';
    let idListaPreco = bodyJson[0]['IDLISTAPRECO'];
    let contador = 0;
    
    bodyJson.map((registro, indice) => {
        
        let updateRegProdHist = `UPDATE 
                                    	"VAR_DB_NAME".HISTORICOPRODUTOLISTAPRECO
                                    SET
                                    	STATIVO = 'False'
                                    WHERE
                                    	IDPRODUTO = '${registro['IDPRODUTO']}'
                                    	AND STATIVO = 'True'
                                    	AND IDRESUMOLISTAPRECO = ? `;
         
           let pStmtUpdateHist = conn.prepareStatement(api.replaceDbName(updateRegProdHist));
         
            pStmtUpdateHist.setInt(1, parseInt(idListaPreco));
            
            pStmtUpdateHist.execute();
            pStmtUpdateHist.close();
      /*  if(indice == bodyJson.length - 1 || contador >= 500){
            prodListQuery += `'${registro['IDPRODUTO']}'`;
            
        } else if(indice < bodyJson.length -1){
            prodListQuery += `'${registro['IDPRODUTO']}',`;
            
        }
        
        if(contador >= 500 || (indice == bodyJson.length - 1)){
            let updateRegProdHist = `UPDATE 
                                    	"VAR_DB_NAME".HISTORICOPRODUTOLISTAPRECO
                                    SET
                                    	STATIVO = 'False'
                                    WHERE
                                    	IDPRODUTO IN(${prodListQuery})
                                    	AND STATIVO = 'True'
                                    	AND IDRESUMOLISTAPRECO = ? `;
         
           let pStmtUpdateHist = conn.prepareStatement(api.replaceDbName(updateRegProdHist));
         
            pStmtUpdateHist.setInt(1, parseInt(idListaPreco));
            
            pStmtUpdateHist.execute();
            pStmtUpdateHist.close();
         
            contador = 0;
        }
     
        contador++*/
    });
    
    conn.commit();
}

function atualizarResumoAlteracaoPreco(bodyJson, dtHora, agendAlteracao, conn){
    let tipoAlteracao = 'LOJA';
    let idListaPreco = ''
    
    //Insere ResumoAlteracao
    let queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDRESUMOALTERACAOPRECOPRODUTO")), 0) + 1 FROM "VAR_DB_NAME"."RESUMOALTERACAOPRECOPRODUTO" WHERE 1 = ? ', 1);
    
    let query = `INSERT INTO "VAR_DB_NAME"."RESUMOALTERACAOPRECOPRODUTO"
		(
     		IDRESUMOALTERACAOPRECOPRODUTO, 
     		IDUSUARIO, 
     		DATAALTERACAO, 
      		QTDITENS,
      		TPALTERACAO,
     		AGENDAMENTOALTERACAO
		)
		VALUES(?,?,'${dtHora}',?,?,'${agendAlteracao}') `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    if(bodyJson[0]['IDLISTAPRECO'] || bodyJson[0]['IDLISTAPRECO'] == 0){
       tipoAlteracao = 'GRUPO';
       idListaPreco = bodyJson[0]['IDLISTAPRECO'];
    }
    
    pStmt.setInt(1, parseInt(queryId));
	pStmt.setInt(2, parseInt(bodyJson[0].IDUSER));
    pStmt.setInt(3, (bodyJson.length));
    pStmt.setString(4, tipoAlteracao);

    pStmt.execute();
    pStmt.close();
	
	atualizarDetalheAlteracaoPreco(queryId, bodyJson, conn);
}

function atualizarDetalheAlteracaoPreco(idResumoAlteracao, bodyJson, conn){
    let prodListQuery = '';
    let idListaPreco =  '';
    let tipoAltercao = '';
    let listaOuEmpresa = true;
    let prodsAgrupadosPorPreco = agruparPorPreco(bodyJson);

    // Insert DetaheAlteracaoPreco e HistoricoProdutoPreco
    prodsAgrupadosPorPreco.map((dados, indice)=>{
        let idListaPrecoProds = '';
        let idProdsPorPreco = '';
        let precoProdsPorPreco = '';
        let precoAntigo = '';
        let contador = 0;
        
        let queryInsertDetAltPreco =`INSERT INTO 
		         	    	            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
                            	    (
                            	        IDRESUMOALTERACAOPRECOPRODUTO, 
                            	        TPALTERADOGRUPOEMP, 
                            	        IDGRUPOEMP, 
                            	        IDPRODUTO, 
                            	        PRECOVENDAANTERIOR, 
                            	        PRECOVENDANOVO
                            	    ) `;
    
        let queryInsertHist =`INSERT INTO 
                                    "VAR_DB_NAME".HISTORICOPRODUTOLISTAPRECO
                                (	
                                	IDRESUMOLISTAPRECO,
                                	IDPRODUTO,
                                	PRECOVENDA,
                                	STATIVO
                                ) `;
        
        dados.map((dadoProd, i)=>{
            
            idListaPrecoProds = (dadoProd.IDLISTAPRECO || dadoProd.IDEMPRESA);
            idProdsPorPreco = `'${dadoProd.IDPRODUTO}'`;
            precoProdsPorPreco = dadoProd.PRECOVENDANOVO;
            tipoAltercao = dadoProd.IDLISTAPRECO ? '0' : '1';
            
            // Busca o Preco Atual antes de ser modificado
            precoAntigo = dadoProd.IDLISTAPRECO ? buscaPrecoAtualLista(dadoProd.IDPRODUTO, idListaPrecoProds) : buscaPrecoAtualEmpresa(dadoProd.IDPRODUTO, idListaPrecoProds);
            
            if(i == dados.length - 1 || contador >= 500){
                queryInsertDetAltPreco += ` SELECT ${idResumoAlteracao}, ${tipoAltercao}, ${idListaPrecoProds}, '${dadoProd.IDPRODUTO}', ${precoAntigo}, ${dadoProd.PRECOVENDANOVO} FROM DUMMY `;
                
                queryInsertHist += ` SELECT ${idListaPrecoProds}, '${dadoProd.IDPRODUTO}', ${dadoProd.PRECOVENDANOVO},'True' FROM DUMMY `;
            } else if(i < dados.length - 1){
                queryInsertDetAltPreco += ` SELECT ${idResumoAlteracao}, ${tipoAltercao}, ${idListaPrecoProds}, '${dadoProd.IDPRODUTO}', ${precoAntigo}, ${dadoProd.PRECOVENDANOVO} FROM DUMMY `;
                queryInsertDetAltPreco += ` UNION ALL `;
                
                queryInsertHist += ` SELECT ${idListaPrecoProds}, '${dadoProd.IDPRODUTO}', ${dadoProd.PRECOVENDANOVO},'True' FROM DUMMY `;
                queryInsertHist += ` UNION ALL `;
            }else{
                queryInsertDetAltPreco += ` SELECT ${idResumoAlteracao}, ${tipoAltercao}, ${idListaPrecoProds}, '${dadoProd.IDPRODUTO}', ${precoAntigo}, ${dadoProd.PRECOVENDANOVO} FROM DUMMY `;
                queryInsertDetAltPreco += ` UNION ALL `;
                
                queryInsertHist += ` SELECT ${idListaPrecoProds}, '${dadoProd.IDPRODUTO}', ${dadoProd.PRECOVENDANOVO},'True' FROM DUMMY `;
                queryInsertHist += ` UNION ALL `;
            }
            
            // Faz Inserts de 500 linhas cada para a DetalheAlteracao e HistoricoProdutoPreco
            if(contador >= 500 || (i == dados.length - 1)){
                
               let pStmt = conn.prepareStatement(api.replaceDbName(queryInsertDetAltPreco));
        
                pStmt.execute();
                pStmt.close();
                
                if( tipoAltercao == '0'){
                    let pStmt2 = conn.prepareStatement(api.replaceDbName(queryInsertHist));
                    
                    pStmt2.execute();
                    pStmt2.close();
                }
                
                contador = 0;
                idListaPrecoProds = '';
                idProdsPorPreco = '';
                precoProdsPorPreco = '';
                precoAntigo = '';
                queryInsertDetAltPreco =`INSERT INTO 
		         	    	                "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
                                	    (
                                	        IDRESUMOALTERACAOPRECOPRODUTO, 
                                	        TPALTERADOGRUPOEMP, 
                                	        IDGRUPOEMP, 
                                	        IDPRODUTO, 
                                	        PRECOVENDAANTERIOR, 
                                	        PRECOVENDANOVO
                                	    ) `;
    
                queryInsertHist =`INSERT INTO 
                                        "VAR_DB_NAME".HISTORICOPRODUTOLISTAPRECO
                                    (	
                                    	IDRESUMOLISTAPRECO,
                                    	IDPRODUTO,
                                    	PRECOVENDA,
                                    	STATIVO
                                    ) `;
            }
            
            contador++;
        })
        
    })
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
    let queryPreco = `  SELECT
                        	IFNULL(TBHP.IDHISTORICOPRODUTOLISTAPRECO, TBP.IDPRODUTO) AS ID,
                        	IFNULL(TBHP.IDPRODUTO, TBP.IDPRODUTO) AS IDPRODUTO,
                        	IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA) AS PRECOVENDA
                        FROM
                        	"VAR_DB_NAME".HISTORICOPRODUTOLISTAPRECO TBHP
                        RIGHT JOIN "VAR_DB_NAME".PRODUTO TBP ON
                        	TBP.IDPRODUTO = TBHP.IDPRODUTO AND TBHP.IDRESUMOLISTAPRECO = ${idListaPreco}
                        WHERE 
                        	TBP.IDPRODUTO = '${idProduto}' 
                        	AND 1 = ? 
                        ORDER BY 
                            ID DESC
                        LIMIT 1 `;
                
    let precoAntigo = api.sqlQuery(queryPreco, 1);
    
    precoAntigo = Number(precoAntigo[0].PRECOVENDA);
  
    return precoAntigo
}

function buscaPrecoAtualEmpresa(idProduto, idEmpresa){
    let queryPreco =`SELECT 
                        IFNULL(TBPP.IDPRODUTO, TBP.IDPRODUTO) AS IDPRODUTO,
                        IFNULL(TBPP.PRECO_VENDA, TBP.PRECOVENDA) AS PRECOVENDA   
                    FROM 
                        "VAR_DB_NAME".PRODUTO_PRECO TBPP
                    RIGHT JOIN "VAR_DB_NAME".PRODUTO TBP ON
                        TBP.IDPRODUTO = TBPP.IDPRODUTO AND TBPP.IDEMPRESA = ${idEmpresa} 
                    WHERE 
                       TBP.IDPRODUTO = '${idProduto}' 
                       AND 1 = ? `;
                
    let precoAntigo = api.sqlQuery(queryPreco, 1);
    
    precoAntigo = Number(precoAntigo[0].PRECOVENDA);
    
    return precoAntigo;
}

function fnHandlePut() {
    let conn = $.db.getConnection();
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
    
    let dtHora = new Date();
    let dtHoraImediato;
    let dtHoraPadrao;
    
    dtHoraImediato = dtHora;
    dtHoraImediato = dtHoraImediato.toISOString().split('T')[0] + ' ' + dtHoraImediato.toLocaleTimeString('pt-BR')
    
    dtHoraPadrao = dtHora;
    dtHoraPadrao.setDate(dtHoraPadrao.getDate() + 1);
    dtHoraPadrao = dtHoraPadrao.toISOString().split('T')[0] + ' 05:00:00';
    
    if(bodyJson.length > 10000){
        return {
            typemsg: 'warning',
            msg: `Alteração deve ser limitada a no máximo 10.000 linhas! Sua alteração contém: ${bodyJson.length} Linhas`
        }
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
        
        let queryProds =`SELECT 
                            IDPRODUTO
                        FROM
                            "VAR_DB_NAME".PRODUTO
                        WHERE 
                            IDPRODUTO IN(${prodListQuery}) 
                            AND 1 = ? `;
        
        let regProdsExists = api.sqlQuery(queryProds, 1);
      
        regProdsExists.map(dadoProd=>prodsEncontrados.push(dadoProd['IDPRODUTO']));
        
        prodListVerificar.map((dadoProd, indice)=>{
            if(!prodsEncontrados.includes(dadoProd)){
                idsProdsNaoEncontrados.push(dadoProd);
                validaProxPasso = false;
            }
        });
        
        if(!validaProxPasso){
            return{
                type: 'warning', 
                idsprodutos: idsProdsNaoEncontrados
            }
        }
        
        //Atualiza o historicoListaPreco para False
        bodyJson[0]['IDLISTAPRECO'] && atualizarHistoricoPrecoLista(bodyJson, conn);
        
        //Agrupa produtos por preco
        prodsAgrupadosPorPreco = agruparPorPreco(bodyJson);
        
        // Pega todas as empresas da lista de preco
        if(bodyJson[0]['IDLISTAPRECO']){
            let queryEmpsList =`SELECT 
                                    IDEMPRESA
                                FROM
                                    "VAR_DB_NAME".DETALHELISTAPRECO
                                WHERE 
                                    IDRESUMOLISTAPRECO = ${bodyJson[0]['IDLISTAPRECO']}  and 1= ?`;
                
            let regsEmps = api.sqlQuery(queryEmpsList, 1);
            
            regsEmps.map((dado, indice) => {
                
                if(indice == regsEmps.length - 1){
                    listEmpresas += `'${dado['IDEMPRESA']}'`;
                } else if(indice < bodyJson.length -1){
                    listEmpresas += `'${dado['IDEMPRESA']}',`;
                }
            });
        }
        
        // Rotina Atualiza Precos dos Produtos
        prodsAgrupadosPorPreco.map((dados, indice)=>{
            let listProdsPorPreco = '';
            let pStmtDtHora;
            let pStmtPreco;

            dados.map((dadoProd, i)=>{
                if(i == dados.length - 1){
                    listProdsPorPreco += `'${dadoProd.IDPRODUTO}'`;
                    
                } else if(i < dados.length - 1){
                    listProdsPorPreco += `'${dadoProd.IDPRODUTO}',`;
                }

                agendAlteracao = dadoProd.AGENDAMENTOALTERACAO == 'imediato' ? dtHoraImediato : dtHoraPadrao;;
                
                if(dadoProd.IDLISTAPRECO){
                    let updatePreco = `UPDATE "VAR_DB_NAME"."PRODUTO_PRECO"
                    	                SET PRECO_VENDA = ?
                 	           WHERE 
                    	                IDPRODUTO = ?
                    	                AND IDEMPRESA IN(${listEmpresas}) `;
                    
                    pStmtPreco = conn.prepareStatement(api.replaceDbName(updatePreco));
                 
                    pStmtPreco.setFloat(1, dadoProd.PRECOVENDANOVO);
                    pStmtPreco.setString(2, dadoProd.IDPRODUTO);
                 
                } else {
                    let updatePreco = `UPDATE 
                        	        "VAR_DB_NAME"."PRODUTO_PRECO" 
                        	     SET 
                        	        "PRECO_VENDA" = ?
                        	     WHERE 
                        	        "IDPRODUTO" = ? AND "IDEMPRESA" = ? `;
                    
                    pStmtPreco = conn.prepareStatement(api.replaceDbName(updatePreco));
                    
                    pStmtPreco.setFloat(1, dadoProd.PRECOVENDANOVO);
                    pStmtPreco.setString(2, dadoProd.IDPRODUTO);
                    pStmtPreco.setInt(3, dadoProd.IDEMPRESA);
                 
                }
                
                let updateDtHora = `UPDATE "VAR_DB_NAME"."PRODUTO" 
                        	                SET DTULTALTERACAO = '${agendAlteracao}'
                        	            WHERE 
                        	                IDPRODUTO = '${dadoProd.IDPRODUTO}' `;
             	     
                pStmtDtHora = conn.prepareStatement(api.replaceDbName(updateDtHora));
                
                pStmtPreco.execute();
                pStmtPreco.close();
                
                pStmtDtHora.execute();
                pStmtDtHora.close();
            })
            

        })
        
       // Insere o ResumoAlteracao, DetalheAlteracao e HistoricoProdutoPrecoLista
       atualizarResumoAlteracaoPreco(bodyJson, dtHoraImediato, agendAlteracao, conn);
       
       conn.commit();
     
     	return {
     	    type: 'success',
     	    msg : "Atualização realizada com sucesso!"
     	};
     	
    } catch (error){
        conn.rollback();
    } finally{
        conn.close();
    }
    
}

function fnHandlePost() {
    let conn = $.db.getConnection();
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
        
        let queryProds =`SELECT 
                            IDPRODUTO
                        FROM
                            "VAR_DB_NAME".PRODUTO
                        WHERE 
                            IDPRODUTO IN(${prodListQuery}) 
                            AND 1 = ? `;
        
        let regProdsExists = api.sqlQuery(queryProds, 1);
      
        regProdsExists.map(dadoProd=>prodsEncontrados.push(dadoProd['IDPRODUTO']));
        
        prodListVerificar.map((dadoProd, indice)=>{
            if(!prodsEncontrados.includes(dadoProd)){
                idsProdsNaoEncontrados.push(dadoProd);
                validaProxPasso = false;
            }
        });
        
        if(!validaProxPasso){
            return{
                type: 'warning', 
                idsprodutos: idsProdsNaoEncontrados
            }
        }
        
        //Atualiza o historicoListaPreco para False
        bodyJson[0]['IDLISTAPRECO'] && atualizarHistoricoPrecoLista(bodyJson, conn);
        
        //Agrupa produtos por preco
        prodsAgrupadosPorPreco = agruparPorPreco(bodyJson);
        
        // Pega todas as empresas da lista de preco
        if(bodyJson[0]['IDLISTAPRECO']){
            let queryEmpsList =`SELECT 
                                    IDEMPRESA
                                FROM
                                    "VAR_DB_NAME".DETALHELISTAPRECO
                                WHERE 
                                    IDRESUMOLISTAPRECO = ${bodyJson[0]['IDLISTAPRECO']}  and 1= ?`;
                
            let regsEmps = api.sqlQuery(queryEmpsList, 1);
            
            regsEmps.map((dado, indice) => {
                
                if(indice == regsEmps.length - 1){
                    listEmpresas += `'${dado['IDEMPRESA']}'`;
                } else if(indice < bodyJson.length -1){
                    listEmpresas += `'${dado['IDEMPRESA']}',`;
                }
            });
        }
        
        // Rotina Atualiza Precos dos Produtos
        prodsAgrupadosPorPreco.map((dados, indice)=>{
            let listProdsPorPreco = '';
            let pStmtDtHora;
            let pStmtPreco;

            dados.map((dadoProd, i)=>{
                if(i == dados.length - 1){
                    listProdsPorPreco += `'${dadoProd.IDPRODUTO}'`;
                 
                } else if(i < dados.length - 1){
                    listProdsPorPreco += `'${dadoProd.IDPRODUTO}',`;
                }
                agendAlteracao = dadoProd.AGENDAMENTOALTERACAO == 'imediato' ? dtHoraImediato : dtHoraPadrao;;
                
                if(dadoProd.IDLISTAPRECO){
                    let updatePreco = `UPDATE "VAR_DB_NAME"."PRODUTO_PRECO"
                    	                    SET PRECO_VENDA = ?
                    	               WHERE 
                    	                    IDPRODUTO = ?
                    	                    AND IDEMPRESA IN(${listEmpresas}) `;
                    
                    pStmtPreco = conn.prepareStatement(api.replaceDbName(updatePreco));
                 
                    pStmtPreco.setFloat(1, dadoProd.PRECOVENDANOVO);
                    pStmtPreco.setString(2, dadoProd.IDPRODUTO);
                 
                } else {
                    let updatePreco = `UPDATE 
                        	        "VAR_DB_NAME"."PRODUTO_PRECO" 
                        	     SET 
                        	        "PRECO_VENDA" = ?
                        	     WHERE 
                        	        "IDPRODUTO" = ? AND "IDEMPRESA" = ?`;
                    
                    pStmtPreco = conn.prepareStatement(api.replaceDbName(updatePreco));
                    
                    pStmtPreco.setFloat(1, dadoProd.PRECOVENDANOVO);
                    pStmtPreco.setString(2, dadoProd.IDPRODUTO);
                    pStmtPreco.setInt(3, dadoProd.IDEMPRESA);
                 
                }
                
                let updateDtHora = `UPDATE "VAR_DB_NAME"."PRODUTO" 
                        	                SET DTULTALTERACAO = '${agendAlteracao}'
                        	            WHERE 
                        	                IDPRODUTO = '${dadoProd.IDPRODUTO}'`;
             	     
                pStmtDtHora = conn.prepareStatement(api.replaceDbName(updateDtHora));
                
                pStmtPreco.execute();
                pStmtPreco.close();
                
                pStmtDtHora.execute();
                pStmtDtHora.close();
            })
            

        })
        
       // Insere o ResumoAlteracao, DetalheAlteracao e HistoricoProdutoPrecoLista
       atualizarResumoAlteracaoPreco(bodyJson, dtHoraImediato, agendAlteracao, conn);
       
       conn.commit();
       conn.close();
     
     	return {
     	    type: 'success',
     	    msg : "Atualização realizada com sucesso!"
     	};
     	
    } catch (error){
        conn.rollback();
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