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

function getDadosPedidoSecundario(idDetalheProdutoPedido){
    let query = `
        SELECT 
            IDDETALHEPRODUTOPEDIDO,
            IDPRODCADASTRO
        FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO
        WHERE 
            IDDETALHEPRODUTOPEDIDOPRIMARIO = ?
    `;
    
    return api.sqlQuery(query, idDetalheProdutoPedido);
}

function atualizaDetalheProdutoPedido(idDetalheProdutoPedido, conn, idProdutoCad = ''){
    let idProdClausula = idProdutoCad.length > 0  ? `,"IDPRODCADASTRO" = '${idProdutoCad}_RN'` : '';
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET
            STCADASTRADO = 'True'
            ${idProdClausula}
        WHERE
            IDDETALHEPRODUTOPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(idDetalheProdutoPedido));
    
    pStmt.execute();
    pStmt.close();
}

function criarProdutosTabelaProduto_RN (idDetalheProdutoPedido, conn, dados) {
    let dadosPedidoSecundario = getDadosPedidoSecundario(idDetalheProdutoPedido);
    
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
            AND TBDPP.STCADASTRADO <> 'True' 
            AND TBDPP.STREPOSICAO <> 'True'
            AND TBDPP.IDDETALHEPRODUTOPEDIDO = ?
    `;
    		
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsertProduto));
    
    pStmt.setInt(1, idDetalheProdutoPedido);
    
    pStmt.execute();
    pStmt.close();
    
    atualizaDetalheProdutoPedido(idDetalheProdutoPedido, conn, dadosPedidoSecundario[0].IDPRODCADASTRO);
}

function execute () {
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    if(bodyJson.length > 0){
        var conn = $.db.getConnection();
        	    
        for (var i = 0; i < bodyJson.length; i++) {
            let registro = bodyJson[i];
            let idDetalheProdutoPedido = parseInt(registro.IDDETALHEPRODUTOPEDIDO);
            
            let dadosPedidoSecundario = getDadosPedidoSecundario(idDetalheProdutoPedido);
            let stPedidoPrimario = dadosPedidoSecundario.length > 0;
            
            if(stPedidoPrimario){
                idDetalheProdutoPedido = parseInt(dadosPedidoSecundario[0].IDDETALHEPRODUTOPEDIDO);
            }
            
            let queryInsertProduto = `
                INSERT INTO 
                    "VAR_DB_NAME"."PRODUTO" 
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
                    "VAR_DB_NAME".SEQ_PRODUTOPEDIDO.NEXTVAL AS IDPRODUTO,
                    TBR.IDGRUPOEMPRESARIAL AS IDGRUPOEMPRESARIAL,
                    TBDPP.NUNCM AS NUNCM,
                    '' AS NUCEST,
                    '' AS NUCST_ICMS,
                    '' AS NUCFOP,
                    '' AS PERC_OUT,
                    TBDPP.CODBARRAS AS NUCODBARRAS,
                    TBDPP.DSPRODUTO AS DSNOME,
                    1 AS STGRADE,
                    TBDPP.UND AS UND,
                    TBDPP.VRCUSTO AS PRECOCUSTO,
                    TBDPP.VRVENDA AS PRECOVENDA,
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
                WHERE
                    TBDPP.STCANCELADO ='False' 
                    AND TBDPP.STCADASTRADO <> 'True' 
                    AND TBDPP.STREPOSICAO <> 'True'
                    AND TBDPP.IDDETALHEPRODUTOPEDIDO = ?
            `;
            		
            let pStmt = conn.prepareStatement(api.replaceDbName(queryInsertProduto));
            
            pStmt.setInt(1, idDetalheProdutoPedido);
            
            pStmt.execute();
            pStmt.close();
            
            conn.commit();
            
            atualizaDetalheProdutoPedido(idDetalheProdutoPedido, conn);
            
            if(stPedidoPrimario){
                criarProdutosTabelaProduto_RN(registro.IDDETALHEPRODUTOPEDIDO, conn);
            }
            
            conn.commit();
        }
    }
    
    return {
        "msg": "Produto Incluido Com Sucesso!"
    };
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;
    
try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.POST:
            var doc = execute();
             $.response.setBody(JSON.stringify({ result : doc }));
            break;
            
        default:
            break;
    }

} catch (e) {
    var detalheError = e.stack.split('\n');
    
    detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
    
    if(detalheError){
       detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(
        JSON.stringify({
            message: e.message,
            detalheError
        })
    );
    $.response.status = 400;
} 