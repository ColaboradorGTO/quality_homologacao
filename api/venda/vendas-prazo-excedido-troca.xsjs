var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function obterLinhasDoDetalhe(idVenda) {
	let query = ` SELECT 
                	TBVD.IDVENDADETALHE,
                	TBVD.IDVENDA,
                	TBVD.NITEM,
                	TBVD.CPROD,
                	TBVD.CEAN,
                	TBVD.XPROD,
                	TBVD.NCM,
                	TBVD.CFOP,
                	TBVD.UCOM,
                	TBVD.QCOM,
                	TBVD.VUNCOM,
                	TBVD.VPROD,
                	TBVD.CEANTRIB,
                	TBVD.UTRIB,
                	TBVD.QTRIB,
                	TBVD.VUNTRIB,
                	TBVD.INDTOT,
                	TBVD.ICMS_ORIG,
                	TBVD.ICMS_CST,
                	TBVD.ICMS_MODBC,
                	TBVD.ICMS_VBC,
                	TBVD.ICMS_PICMS,
                	TBVD.ICMS_VICMS,
                	TBVD.PIS_CST,
                	TBVD.PIS_VBC,
                	TBVD.PIS_PPIS,
                	TBVD.PIS_VPIS,
                	TBVD.COFINS_CST,
                	TBVD.COFINS_VBC,
                	TBVD.COFINS_PCOFINS,
                	TBVD.COFINS_VCOFINS,
                	TBVD.VENDEDOR_MATRICULA,
                	TBVD.VENDEDOR_NOME,
                	TBVD.VENDEDOR_CPF,
                	TBP.NUCODBARRAS,
                	TBVD.QTD,
                	TBVD.VRTOTALLIQUIDO,
                	TBVD.STTROCA,
                	TBVPE.IDVENDASPRAZOEXCEDIDOAUTORIZADAS  AS IDEXCECAO,
                	TBVPE.QTD  AS QTDAUTORIZADA,
                	TBVPE.STATIVO AS STEXCECAO,
                	TBVPE.TIPOTROCA  AS TIPOTROCA
                FROM 
                	"VAR_DB_NAME".VENDADETALHE TBVD
                LEFT JOIN "VAR_DB_NAME".VENDASPRAZOEXCEDIDOAUTORIZADAS TBVPE ON 
                	TBVPE.IDDETALHEVENDA = TBVD.IDVENDADETALHE
                INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
                	tbp.IDPRODUTO = tbvd.CPROD
    		    WHERE  
    		        TBVD.IDVENDA = ? 
    		    ORDER BY 
    		        TBVD.IDVENDADETALHE  `;

	var linhas = api.sqlQuery(query, idVenda);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"det": {
				"IDVENDADETALHE": det.IDVENDADETALHE,
				"IDVENDA": det.IDVENDA,
				"NITEM": det.NITEM,
				"CPROD": det.CPROD,
				"CEAN": det.CEAN,
				"XPROD": det.XPROD,
				"NCM": det.NCM,
				"CFOP": det.CFOP,
				"UCOM": det.UCOM,
				"QCOM": det.QCOM,
				"VUNCOM": det.VUNCOM,
				"VPROD": det.VPROD,
				"CEANTRIB": det.CEANTRIB,
				"UTRIB": det.UTRIB,
				"QTRIB": det.QTRIB,
				"VUNTRIB": det.VUNTRIB,
				"INDTOT": det.INDTOT,
				"ICMS_ORIG": det.ICMS_ORIG,
				"ICMS_CST": det.ICMS_CST,
				"ICMS_MODBC": det.ICMS_MODBC,
				"ICMS_VBC": det.ICMS_VBC,
				"ICMS_PICMS": det.ICMS_PICMS,
				"ICMS_VICMS": det.ICMS_VICMS,
				"PIS_CST": det.PIS_CST,
				"PIS_VBC": det.PIS_VBC,
				"PIS_PPIS": det.PIS_PPIS,
				"PIS_VPIS": det.PIS_VPIS,
				"COFINS_CST": det.COFINS_CST,
				"COFINS_VBC": det.COFINS_VBC,
				"COFINS_PCOFINS": det.COFINS_PCOFINS,
				"COFINS_VCOFINS": det.COFINS_VCOFINS,
				"VENDEDOR_MATRICULA": det.VENDEDOR_MATRICULA,
				"VENDEDOR_NOME": det.VENDEDOR_NOME,
				"VENDEDOR_CPF": det.VENDEDOR_CPF,
				"STCANCELADO": det.STCANCELADO,
            	"VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
        	    "QTD": det.QTD,
        	    "VRTOTALLIQUIDO":det.VRTOTALLIQUIDO,
        	    "NUCODBARRAS": det.NUCODBARRAS,
        	    "STTROCA": det.STTROCA,
        	    "IDEXCECAO": det.IDEXCECAO,
        	    "QTDAUTORIZADA": det.QTDAUTORIZADA,
        	    "STEXCECAO": det.STEXCECAO,
        	    "TIPOTROCA": det.TIPOTROCA
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterLinhasDoPagamento(idVenda) {

	var query = 'SELECT IDVENDAPAGAMENTO, IDVENDA, NITEM, TPAG, DSTIPOPAGAMENTO, VALORRECEBIDO, VALORDEDUZIDO, VALORLIQUIDO, ' +
		' DTPROCESSAMENTO, TO_VARCHAR(DTVENCIMENTO,\'DD-MM-YYYY\') AS DTVENCIMENTO, NPARCELAS, NOTEF, NOAUTORIZADOR, NOCARTAO, NUOPERACAO, NSUTEF, NSUAUTORIZADORA, NUAUTORIZACAO, CPF, NOME ' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDAPAGAMENTO  ' +
		'  WHERE  ' +
		'   IDVENDA = ?  ' +
		'  ORDER BY IDVENDAPAGAMENTO  ';

	var linhas = api.sqlQuery(query, idVenda);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"pag": {
				"IDVENDAPAGAMENTO": det.IDVENDAPAGAMENTO,
				"IDVENDA": det.IDVENDA,
				"NITEM": det.NITEM,
				"TPAG": det.TPAG,
				"DSTIPOPAGAMENTO": det.DSTIPOPAGAMENTO,
				"VALORRECEBIDO": det.VALORRECEBIDO,
				"VALORDEDUZIDO": det.VALORDEDUZIDO,
				"VALORLIQUIDO": det.VALORLIQUIDO,
				"DTPROCESSAMENTO": det.DTPROCESSAMENTO,
				"DTVENCIMENTO": det.DTVENCIMENTO,
				"NPARCELAS": det.NPARCELAS,
				"NOTEF": det.NOTEF,
				"NOAUTORIZADOR": det.NOAUTORIZADOR,
				"NOCARTAO": det.NOCARTAO,
				"NUOPERACAO": det.NUOPERACAO,
				"NSUTEF": det.NSUTEF,
				"NSUAUTORIZADORA": det.NSUAUTORIZADORA,
				"CPF": det.CPF,
				"NOME": det.NOME
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {

    let nnf = $.request.parameters.get("nnf");
    let serie = $.request.parameters.get("serie");
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    let cpfouIdVenda = $.request.parameters.get("cpfouIdVenda");
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    
	let query = ' SELECT ' +
		'   tbv.IDVENDA,' +
		'   tbv."NFE_INFNFE_IDE_NNF",'+
		'   tbv.IDCAIXAWEB,' +
		'   tbc.DSCAIXA,' +
		'   tbv.IDOPERADOR,' +
		'   tbf.NOFUNCIONARIO,'+
		'   tbv.IDEMPRESA,' +
		'   tbe.NOFANTASIA,' +
		'   TO_VARCHAR(tbv.DTHORAABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAABERTURA, ' +
		'   tbv.VRRECDINHEIRO,' +
		'   tbv.VRRECCARTAO,' +
		'   tbv.VRRECCONVENIO,' +
		'   tbv.VRRECCHEQUE,' +
		'   tbv.VRRECPOS,' +
		'   tbv.VRRECVOUCHER,' +
		'   tbv.VRTOTALPAGO,' +
		'   tbv.VRTROCO,' +
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD/MM/YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
		'   tbv.STATIVO,' +
		'   tbv.STCANCELADO,' +
		'   tbv.IDUSUARIOCANCELAMENTO,' +
		'   tbv.TXTMOTIVOCANCELAMENTO,' +
		'   tbv.STCONTINGENCIA,' +
		'   tbv.DTENVIOONTINGENCIA,' +
		'   tbv.DEST_CNPJ,'+
		'   tbv.DEST_CPF,' +
	//	'   (SELECT STATIVO FROM "VAR_DB_NAME".VENDASPRAZOEXCEDIDOAUTORIZADAS WHERE IDVENDA = TBV.IDVENDA LIMIT 1) AS STEXCECAO, ' +
		'   (SELECT FIRST_VALUE(DSNOMERAZAOSOCIAL ORDER BY IDCLIENTE) FROM "VAR_DB_NAME".CLIENTE WHERE NUCPFCNPJ = tbv.DEST_CNPJ OR NUCPFCNPJ = tbv.DEST_CPF) as DSNOMERAZAOSOCIAL,'+
		'   (SELECT FIRST_VALUE(DSAPELIDONOMEFANTASIA ORDER BY IDCLIENTE) FROM "VAR_DB_NAME".CLIENTE WHERE NUCPFCNPJ = tbv.DEST_CNPJ OR NUCPFCNPJ = tbv.DEST_CPF) AS DSAPELIDONOMEFANTASIA'+
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA' +
		'   INNER JOIN "VAR_DB_NAME".CAIXA tbc ON tbc.IDCAIXAWEB = tbv.IDCAIXAWEB' +
		'   INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbv.IDOPERADOR' +
		'   LEFT JOIN (SELECT NUCPFCNPJ FROM "VAR_DB_NAME".CLIENTE GROUP BY NUCPFCNPJ) tbcc ON tbcc.NUCPFCNPJ = tbv.DEST_CNPJ OR tbcc.NUCPFCNPJ = tbv.DEST_CPF' +
		' WHERE ' +
		'	1 = ?' +
		' And tbv.STCANCELADO = \'False\' ';

	if (byId) {
		query += ' And tbv.IDVENDA = \'' + byId + '\'  ';
	}
	
	if (cpfouIdVenda){
	    query += ` And CONTAINS((tbv.DEST_CPF, tbv.DEST_CNPJ, tbv.IDVENDA), '${cpfouIdVenda}') `;
	}else if(dtInicio && dtFim){
        query += ` AND tbv.DTHORAFECHAMENTO >= '${dtInicio} 00:00:00' AND tbv.DTHORAFECHAMENTO <= '${dtFim} 23:59:59' `;
    } else if(idEmpresa){
        query += ` AND tbv.IDEMPRESA = '${idEmpresa}' `;	
	} else if(idGrupoEmpresarial){
        query += ` And tbe.IDGRUPOEMPRESARIAL = '${idGrupoEmpresarial}' `;
    } else if(nnf && serie){
	    query += ' And tbv.NFE_INFNFE_IDE_NNF = \'' + nnf + '\' And tbv.NFE_INFNFE_IDE_SERIE = \'' + serie + '\' ';
	}
	
   query += ' ORDER BY tbv.DTHORAFECHAMENTO ASC ';
    
	let request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (let i = 0; i < response.data.length; i++) {

		let registro = response.data[i];

		let venda = {
			"venda": {
				"IDVENDA": registro.IDVENDA,
				"NRNOTA": registro.NFE_INFNFE_IDE_NNF,
				"IDCAIXAWEB": registro.IDCAIXAWEB,
				"DSCAIXA": registro.DSCAIXA,
				"IDOPERADOR": registro.IDOPERADOR,
			    "NOFUNCIONARIO": registro.NOFUNCIONARIO,
				"IDEMPRESA": registro.IDEMPRESA,
				"NOFANTASIA": registro.NOFANTASIA,
				"DTHORAABERTURA": registro.DTHORAABERTURA,
				"VRRECDINHEIRO": registro.VRRECDINHEIRO,
				"VRRECCARTAO": registro.VRRECCARTAO,
				"VRRECCONVENIO": registro.VRRECCONVENIO,
				"VRRECCHEQUE": registro.VRRECCHEQUE,
				"VRRECPOS": registro.VRRECPOS,
				"VRRECVOUCHER": registro.VRRECVOUCHER,
				"VRTOTALPAGO": registro.VRTOTALPAGO,
				"VRTROCO": registro.VRTROCO,
				"DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
				"STATIVO": registro.STATIVO,
				"STCANCELADO": registro.STCANCELADO,
				"IDUSUARIOCANCELAMENTO": registro.IDUSUARIOCANCELAMENTO,
				"TXTMOTIVOCANCELAMENTO": registro.TXTMOTIVOCANCELAMENTO,
				"STCONTINGENCIA": registro.STCONTINGENCIA,
				"DTENVIOONTINGENCIA": registro.DTENVIOONTINGENCIA,
				"DEST_CNPJ": registro.DEST_CNPJ,
				"DEST_CPF": registro.DEST_CPF,
				"DSNOMERAZAOSOCIAL": registro.DSNOMERAZAOSOCIAL,
				"DSAPELIDONOMEFANTASIA": registro.DSAPELIDONOMEFANTASIA,
				"STEXCECAO": registro.STEXCECAO
			},
			"detalhe": obterLinhasDoDetalhe(registro.IDVENDA),
			"pagamento": obterLinhasDoPagamento(registro.IDVENDA)
		};

		data.push(venda);

	}

	response.data = data;

	return response;
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
    let queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDRESUMOALTERACAOPRECO")), 0) + 1 FROM "VAR_DB_NAME"."RESUMOALTERACAOPRECO" WHERE 1 = ? ', 1);
    
    let query = `INSERT INTO "VAR_DB_NAME"."RESUMOALTERACAOPRECO"
		(
     		IDRESUMOALTERACAOPRECO, 
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
		         	    	            "VAR_DB_NAME".DETALHEALTERACAOPRECO
                            	    (
                            	        IDRESUMOALTERACAOPRECO, 
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
		         	    	                "VAR_DB_NAME".DETALHEALTERACAOPRECO
                                	    (
                                	        IDRESUMOALTERACAOPRECO, 
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

function fnHandlePost(){
    var conn = $.db.getConnection();
    
    var query = `INSERT INTO
            	"VAR_DB_NAME".VENDASPRAZOEXCEDIDOAUTORIZADAS
                (   
                	IDVENDA,
                	IDDETALHEVENDA,
                	IDPRODUTO,
                	VRPRODUTO,
                	QTD,
                	VRTOTALLIQUIDO,
                	USERAUTORIZADOR,
                	MOTIVOEXCECAO,
                	DTHORAAUTORIZACAO,
                	STATIVO,
                	DIASAPOSCOMPRAR,
                	TIPOTROCA
            	)
                VALUES(?,?,?,?,?,?,?,?,now(),'True',?,?) `;
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.IDVENDA);
        pStmt.setString(2, registro.IDVENDADETALHE);
        pStmt.setString(3, registro.IDPRODUTO);
        pStmt.setFloat(4, registro.VRPRODUTO);
        pStmt.setFloat(5, registro.QTD);
        pStmt.setFloat(6, registro.VRTOTALLIQUIDO);
        pStmt.setInt(7, registro.USERAUTORIZADOR);
        pStmt.setString(8, registro.MOTIVOEXCECAO);
        pStmt.setInt(9, registro.DIASAPOSCOMPRAR);
        pStmt.setString(10, registro.TIPOTROCA);
        	
        pStmt.execute(); 
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Autorização Incluida com sucesso!"
	};
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
            //fnHandleGet(id);
            $.response.setBody(JSON.stringify(fnHandleGet(id)));
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