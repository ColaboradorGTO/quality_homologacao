let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

let conn;

function updateLogSuccess(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_CRIADO_QUALITY_PRODUTOS_PEDIDO_PRIMARIO  = 'True',
            LOG_ERROR = NULL
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
	pStmt.setInt(1, Number(idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function updateLogError(idResumoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_CRIADO_QUALITY_PRODUTOS_PEDIDO_PRIMARIO  = 'False',
            LOG_ERROR = ?
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function getDadosDetalheProdutoPedido(idResumoPedido){
    let query = `
        SELECT 
            TBDPP."IDDETALHEPRODUTOPEDIDO",
            TBDPP."IDPRODCADASTRO"
        FROM 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        WHERE  
            1 = ? 
            AND TBDPP."IDRESUMOPEDIDO" = ${parseInt(idResumoPedido)}
    `;
    
    return api.sqlQuery(query, 1);
}

function getIdResumoPedidoPrimario(idResumoPedidoParaTransformar){
    let query = `
        SELECT 
            IDRESUMOPEDIDO
        FROM 
            "VAR_DB_NAME"."RESUMOPEDIDO"
        WHERE 
            "IDRESUMOPEDIDOORIGEM" = ?
    `;
    
    let regDet = api.sqlQuery(query, idResumoPedidoParaTransformar);
    
    return regDet.length > 0 ? Number(regDet[0].IDRESUMOPEDIDO) : 0
}

function verificarSeExisteProduto_RN(idProduto){
    idProduto = idProduto.replace('_RN', '');
    
    let query = `
        SELECT 
            IDPRODUTO
        FROM 
            "VAR_DB_NAME"."PRODUTO_RN"
        WHERE 
            IDPRODUTO = ?
    `;
    
    let regDet = api.sqlQuery(query, (idProduto + '_RN'));
    
    return regDet.length > 0;
}

function criarProdutoTabelaProduto_RN (idDetalheProdutoPedido) {
    let queryInsertProduto = `
        INSERT INTO 
            "VAR_DB_NAME"."PRODUTO_RN" 
        (
            "IDPRODUTO", 
            "IDGRUPOEMPRESARIAL", 
            "NUNCM", 
            "NUCEST", 
            "NUCST_ICMS", 
            "NUCFOP", 
            "PERC_OUT", 
            "NUCODBARRAS", 
            "DSNOME", 
            "STGRADE", 
            "UND", 
            "PRECOCUSTO", 
            "PRECOVENDA", 
            "QTDENTRADA", 
            "QTDCOMERCIALIZADA", 
            "QTDPERDA", 
            "QTDDISPONIVEL", 
            "PERCICMS", 
            "PERCISS", 
            "PERCPIS", 
            "PERCCOFINS", 
            "COD_CSOSN", 
            "PERCCSOSC", 
            "NUCST_IPI", 
            "NUCST_PIS", 
            "NUCST_COFINS", 
            "PERCIPI", 
            "STPESAVEL", 
            "GRP_MATERIAIS", 
            "IDSUBGRUPO", 
            "IDFABRICANTE", 
            "IDFORNECEDOR", 
            "NUREFERENCIA", 
            "STATIVO", 
            "IDCOR", 
            "IDTAMANHO", 
            "IDCATEGORIAPEDIDO", 
            "IDTIPOTECIDO", 
            "IDESTILO", 
            "IDLOCALEXPOSICAO", 
            "IDCATEGORIAS", 
            "IDDETALHEPRODUTOPEDIDO", 
            "IDTIPOPRODUTOFISCAL", 
            "IDFONTEPRODUTOFISCAL",
            "DTULTALTERACAO",
            "STECOMMERCE"
        )
        SELECT
            TBDPP_SECUNDARIO.IDPRODCADASTRO  || '_RN' AS IDPRODUTO,
            TBR.IDGRUPOEMPRESARIAL AS IDGRUPOEMPRESARIAL,
            TBDPP.NUNCM AS NUNCM,
            '' AS NUCEST,
            '' AS NUCST_ICMS,
            '' AS NUCFOP,
            '' AS PERC_OUT,
            'SEM GTIN' AS NUCODBARRAS,
            TBDPP.DSPRODUTO AS DSNOME,
            1 AS STGRADE,
            TBDPP.UND AS UND,
            TBDPP.VRCUSTO AS PRECOCUSTO,
            IFNULL(TBDPP_SECUNDARIO.VRCUSTO, TBDPP.VRCUSTO) AS PRECOVENDA,
            0 AS QTDENTRADA,
            0 AS QTDCOMERCIALIZADA,	
            0 AS QTDPERDA,
            0 AS QTDDISPONIVEL,
            0.0 AS PERCICMS,
            0.0 AS PERCISS,
            0.0 AS PERCPIS,
            0.0 AS PERCCOFINS,
            '' AS COD_CSOSN,
            0.0 AS PERCCSOSC,
            '' AS NUCST_IPI,
            '' AS NUCST_PIS,
            '' AS NUCST_COFINS,
            0.0 AS PERCIPI,
            0 AS STPESAVEL,
            1 AS GRP_MATERIAIS,
            TBDPP.IDSUBGRUPOESTRUTURA AS IDSUBGRUPO,
            TBDPP.IDFABRICANTE AS IDFABRICANTE,
            TBR.IDFORNECEDOR AS IDFORNECEDOR,
            TBDPP.NUREF AS NUREFERENCIA,
            'True' AS STATIVO,
            TBDPP.IDCOR AS IDCOR,
            TBDPP.IDTAMANHO AS IDTAMANHO,
            TBDPP.IDCATEGORIAPEDIDO AS IDCATEGORIAPEDIDO,
            TBDPP.IDTIPOTECIDO AS IDTIPOTECIDO,
            TBDPP.IDESTILO AS IDESTILO,
            TBDPP.IDLOCALEXPOSICAO AS IDLOCALEXPOSICAO,
            TBDPP.IDCATEGORIAS AS IDCATEGORIAS,
            TBDPP.IDDETALHEPRODUTOPEDIDO AS IDDETALHEPRODUTOPEDIDO,
            TBDPP.IDTIPOPRODUTOFISCAL AS IDTIPOPRODUTOFISCAL,
            TBDPP.IDFONTEPRODUTOFISAL AS IDFONTEPRODUTOFISCAL,
            CURRENT_TIMESTAMP  AS DTULTALTERACAO,
            TBDPP.STECOMMERCE
        FROM 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP 
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON 
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO 
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON 
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP_SECUNDARIO ON 
            TBDPP.IDDETALHEPRODUTOPEDIDO = TBDPP_SECUNDARIO.IDDETALHEPRODUTOPEDIDOPRIMARIO
        WHERE
            TBDPP.STCANCELADO ='False' 
            AND TBDPP.IDDETALHEPRODUTOPEDIDO = ?
    `;
    		
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsertProduto));
    
    pStmt.setInt(1, idDetalheProdutoPedido);
    
    pStmt.execute();
    pStmt.close();
    
    conn.commit();
}

function criarProdutosPedidoPrimario(idResumoPedidoParaTransformar){
	conn = $.db.getConnection();
	
	try{
        let idResumoPedido = getIdResumoPedidoPrimario(idResumoPedidoParaTransformar)
        let registros = getDadosDetalheProdutoPedido(idResumoPedido);
        let prodsNaoCriados = '';
        
        for (let dadosProduto of registros) {
            let idDetalheProdutoPedido = parseInt(dadosProduto.IDDETALHEPRODUTOPEDIDO);
            let idProduto = dadosProduto.IDPRODCADASTRO;
            
            let stProdutoCriadoNaProduto_RN = verificarSeExisteProduto_RN(idProduto);
            
            if(!stProdutoCriadoNaProduto_RN){
                criarProdutoTabelaProduto_RN(parseInt(idDetalheProdutoPedido));
                
                let stValidarCriacao = verificarSeExisteProduto_RN(idProduto);
                
                if(!stValidarCriacao){
                    prodsNaoCriados += `${idProduto}, `
                }
            }
        }
        
        if(prodsNaoCriados.length > 0){
            updateLogError(idResumoPedidoParaTransformar, `Produtos nao criados IDs: ${prodsNaoCriados}`);
        } else {
            updateLogSuccess(idResumoPedidoParaTransformar);
        }
	} catch(error){
        updateLogError(idResumoPedidoParaTransformar, (error.message || 'Erro ao criar os produtos na tabela PRODUTO_RN'));
        
        throw error;
	}
}