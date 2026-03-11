var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var grCodBars= $.import("quality.concentrador_homologacao.api.cadastro.libs.gerar-cod-barras", "gerarCodigoBarras");
var conn;

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

function getDadosPedido(idDetalhePedido){
    let query = `
        SELECT
            TBR.IDFORNECEDOR,
            TBD.IDSUBGRUPOESTRUTURA
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON
            TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO
        WHERE
            TBR.STCANCELADO <> 'True'
            AND TBD.STCANCELADO <> 'True' 
            AND TBD.IDDETALHEPEDIDO = '${idDetalhePedido}'
            AND 1 = ?
    `;
    
    return api.sqlQuery(query, 1);
}

function verificaSePrecisaAtualizarDetalhePedido(registro){
    let queryDetPedido = `
        SELECT
            TBR.IDRESUMOPEDIDO
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO TBD
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE
            TBD.STCANCELADO <> 'True' 
            AND TBR.STCANCELADO <> 'True'
            AND TBD.IDCOR = '${registro.IDCOR}'
            AND TBD.IDTIPOTECIDO = '${registro.IDTIPOTECIDO}'
            AND TBD.IDESTILO = '${registro.IDESTILO}'
            AND TBD.UND = '${registro.IDUND}'
            AND TBD.IDRESUMOPEDIDO = '${registro.IDRESUMOPEDIDO}'
            AND TBD.IDDETALHEPEDIDO = '${registro.IDDETALHEPEDIDO}'
            AND 1 = ?
    `;
    
    let regPedido = api.sqlQuery(queryDetPedido, 1);
    
    return !(regPedido.length > 0);
}

function updateIdProdutoCodBarrasPedidoPrimario(idDetalhePedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        SET
            "CODBARRAS" = 'SEM GTIN',
            "IDPRODCADASTRO" =  CASE 
                                    WHEN IFNULL("IDPRODCADASTRO", 'NULL') <> 'NULL' 
                                        THEN (REPLACE("IDPRODCADASTRO", '_RN', '') || '_RN')
                                    ELSE IDPRODCADASTRO
                                END
        WHERE
            IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idDetalhePedido);   
    
    pStmt.execute();
    pStmt.close();
    
    conn.commit();
}

function atualizarDetalhePedido(registro){
    let queryUpdateDetPedido = `
        UPDATE
            "VAR_DB_NAME".DETALHEPEDIDO
        SET 
            IDCOR = ${registro.IDCOR},
            IDTIPOTECIDO = ${registro.IDTIPOTECIDO},
            IDESTILO = ${registro.IDESTILO},
            UND = ${registro.IDUND},
            DTATUALIZACAO = now(),
            IDRESPATUALIZACAO = ${registro.IDRESPCADASTRO},
            IDRESPAUTORIZAEDITCAD = ${registro.IDRESPAUTORIZAEDITCAD}
        WHERE
            IDDETALHEPEDIDO = ?
            OR IDDETALHEPEDIDOPRIMARIO = ?
    `;
    
    let pStmtUpdateDetPedido = conn.prepareStatement(api.replaceDbName(queryUpdateDetPedido));
    
    pStmtUpdateDetPedido.setInt(1, parseInt(registro.IDDETALHEPEDIDO));
    pStmtUpdateDetPedido.setInt(2, parseInt(registro.IDDETALHEPEDIDO));
    
    pStmtUpdateDetPedido.execute();
    pStmtUpdateDetPedido.close();
}

function atualizarStTransformadoDetPedido(idDetalhePedido){
    let queryUpdateDetPedido = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD
        SET 
            TBD."STTRANSFORMADO" =  'True'
        FROM 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD
        INNER JOIN "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP ON 
            TBD."IDDETALHEPEDIDO" = TBDPP."IDDETALHEPEDIDO"
        WHERE 
            TBD."IDDETALHEPEDIDO" =  ? 
            OR TBD."IDDETALHEPEDIDOPRIMARIO" = ?
    `;
    
    let pStmtUpdateDetPedido = conn.prepareStatement(api.replaceDbName(queryUpdateDetPedido));
    
    pStmtUpdateDetPedido.setInt(1, parseInt(idDetalhePedido));
    pStmtUpdateDetPedido.setInt(2, parseInt(idDetalhePedido));
    
    pStmtUpdateDetPedido.execute();
    pStmtUpdateDetPedido.close();
    
    //conn.commit();
}

function fnCriarDetalheProdutoPedidoSecundario(idDetalhePedido, idTamanho){
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO"  
		(
            "IDDETALHEPEDIDO", 
            "IDSUBGRUPOESTRUTURA", 
            "IDCOR", 
            "IDTAMANHO", 
            "DSTAMANHO", 
            "IDCATEGORIAPEDIDO", 
            "IDTIPOTECIDO", 
            "IDESTILO", 
            "IDFABRICANTE", 
            "IDLOCALEXPOSICAO", 
            "IDCATEGORIAS", 
            "IDNCM", 
            "NUNCM", 
            "IDTIPOPRODUTOFISCAL", 
            "IDFONTEPRODUTOFISAL", 
            "IDPRODCADASTRO", 
            "NUREF", 
            "CODBARRAS", 
            "DSPRODUTO", 
            "UND", 
            "QTDPRODUTO", 
            "VRCUSTO", 
            "VRVENDA", 
            "VRTOTALCUSTO", 
            "DTCADASTRO", 
            "DTULTATUALIZACAO", 
            "STCADASTRADO", 
            "STECOMMERCE", 
            "STREDESOCIAL", 
            "STATIVO", 
            "STCANCELADO", 
            "QTDESTOQUEIDEAL", 
            "IDRESUMOPEDIDO", 
            "STMIGRADOSAP", 
            "STREPOSICAO", 
            "IDRESPCADASTRO", 
            "IDRESPAUTORIZAEDITCAD", 
            "IDFORNECEDOR",
            "IDDETALHEPRODUTOPEDIDOPRIMARIO"
        )
        SELECT
            TBD."IDDETALHEPEDIDO",
            TBDPP."IDSUBGRUPOESTRUTURA",
            TBDPP."IDCOR",
            TBDPP."IDTAMANHO",
            TBDPP."DSTAMANHO",
            TBDPP."IDCATEGORIAPEDIDO",
            TBDPP."IDTIPOTECIDO",
            TBDPP."IDESTILO",
            TBDPP."IDFABRICANTE",
            TBDPP."IDLOCALEXPOSICAO",
            TBDPP."IDCATEGORIAS",
            TBDPP."IDNCM",
            TBDPP."NUNCM",
            TBDPP."IDTIPOPRODUTOFISCAL",
            TBDPP."IDFONTEPRODUTOFISAL",
            REPLACE(TBDPP."IDPRODCADASTRO", '_RN', '') AS IDPRODCADASTRO,
            TBDPP."NUREF",
            TBDPP."CODBARRAS",
            TBDPP."DSPRODUTO",
            TBDPP."UND",
            TBDPP."QTDPRODUTO",
            (TBDPP."VRCUSTO" *  ( CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END )) AS "VRCUSTO",
            TBDPP."VRVENDA",
            (TBDPP."VRTOTALCUSTO" * ( CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END )) AS "VRTOTALCUSTO",
            TBDPP."DTCADASTRO",
            TBDPP."DTULTATUALIZACAO",
            TBDPP."STCADASTRADO",
            TBDPP."STECOMMERCE",
            TBDPP."STREDESOCIAL",
            TBDPP."STATIVO",
            TBDPP."STCANCELADO",
            TBDPP."QTDESTOQUEIDEAL",
            TBD."IDRESUMOPEDIDO",
            TBDPP."STMIGRADOSAP",
            TBDPP."STREPOSICAO",
            TBDPP."IDRESPCADASTRO",
            TBDPP."IDRESPAUTORIZAEDITCAD",
            TBDPP."IDFORNECEDOR",
            TBDPP."IDDETALHEPRODUTOPEDIDO" AS IDDETALHEPRODUTOPEDIDOPRIMARIO
        FROM 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON 
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDOPRIMARIO
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE
            TBD.IDDETALHEPEDIDOPRIMARIO = ?
            AND TBDPP."IDTAMANHO" = ?
	`;
	
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idDetalhePedido); 
    pStmt.setInt(2, idTamanho); 
    
    pStmt.execute();
    pStmt.close();
    
    conn.commit();
}

function validarSeExisteDetalhePedidoSecundario(idDetalhePedido){
    let query = `
        SELECT
            IDDETALHEPEDIDO
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE 
            IDDETALHEPEDIDOPRIMARIO = ?
    `;
    
    let regDetalhe = api.sqlQuery(query, idDetalhePedido);
    
    if(regDetalhe.length > 0){
        return true;
    }
    
    return false;
}

function updateDetalheProdutoPedidoSecundario(registro) {
    var query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        SET 
            TBDPP."IDSUBGRUPOESTRUTURA"=  ?, 
            TBDPP."IDCOR"=  ?, 
            TBDPP."IDTAMANHO"=  ?, 
            TBDPP."DSTAMANHO"=  ?, 
            TBDPP."IDCATEGORIAPEDIDO"=  ?, 
            TBDPP."IDTIPOTECIDO"=  ?, 
            TBDPP."IDESTILO"=  ?, 
            TBDPP."IDFABRICANTE"=  ?, 
            TBDPP."IDLOCALEXPOSICAO"=  ?, 
            TBDPP."IDCATEGORIAS"=  ?, 
            TBDPP."IDNCM"=  ?, 
            TBDPP."NUNCM"=  ?, 
            TBDPP."IDTIPOPRODUTOFISCAL"=  ?, 
            TBDPP."IDFONTEPRODUTOFISAL"=  ?, 
            TBDPP."NUREF"=  ?, 
            TBDPP."CODBARRAS"=  ?, 
            TBDPP."DSPRODUTO"=  ?, 
            TBDPP."UND"=  ?, 
            TBDPP."QTDPRODUTO"=  ?, 
            TBDPP."VRCUSTO"=  ( CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END ) * CAST( ? AS DECIMAL(21, 6)), 
            TBDPP."VRVENDA"=  ?, 
            TBDPP."VRTOTALCUSTO"=  ( CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END ) * CAST( ? AS DECIMAL(21, 6)), 
            TBDPP."DTCADASTRO"=  ?, 
            TBDPP."DTULTATUALIZACAO"=  ?, 
            TBDPP."STECOMMERCE"=  ?, 
            TBDPP."STREDESOCIAL"=  ?, 
            TBDPP."STATIVO"=  ?, 
            TBDPP."STCANCELADO" =  ?, 
            TBDPP."QTDESTOQUEIDEAL" =  ?
        FROM 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON 
            TBDPP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE 
            TBDPP."IDDETALHEPRODUTOPEDIDOPRIMARIO" = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
   
    pStmt.setInt(1, registro.IDSUBGRUPOESTRUTURA);
    pStmt.setInt(2, registro.IDCOR);
    pStmt.setInt(3, registro.IDTAMANHO);
    pStmt.setString(4, registro.DSTAMANHO);
    pStmt.setInt(5, registro.IDCATEGORIAPEDIDO);
    pStmt.setInt(6, registro.IDTIPOTECIDO);
    pStmt.setInt(7, registro.IDESTILO);
    pStmt.setInt(8, registro.IDFABRICANTE);
    pStmt.setInt(9, registro.IDLOCALEXPOSICAO);
    pStmt.setInt(10, registro.IDCATEGORIAS);
    pStmt.setInt(11, registro.IDNCM);
    pStmt.setString(12, registro.NUNCM);
    pStmt.setInt(13, registro.IDTIPOPRODUTOFISCAL);
    pStmt.setInt(14, registro.IDFONTEPRODUTOFISAL);
    pStmt.setString(15, registro.NUREF);
    pStmt.setString(16, registro.CODBARRAS);
    pStmt.setString(17, registro.DSPRODUTO);
    pStmt.setString(18, registro.UND);
    pStmt.setFloat(19, registro.QTDPRODUTO);
    pStmt.setFloat(20, registro.VRCUSTO);
    pStmt.setFloat(21, registro.VRVENDA);
    pStmt.setFloat(22, registro.VRTOTALCUSTO);
    pStmt.setDate(23, registro.DTCADASTRO);
    pStmt.setDate(24, registro.DTULTATUALIZACAO);
    pStmt.setString(25, registro.STECOMMERCE);
    pStmt.setString(26, registro.STREDESOCIAL);
    pStmt.setString(27, registro.STATIVO);
    pStmt.setString(28, registro.STCANCELADO);
    pStmt.setInt(29, registro.QTDESTOQUEIDEAL);
    pStmt.setInt(30, registro.IDDETALHEPRODUTOPEDIDO);
    
    pStmt.execute();
    
	pStmt.close();

}

function fnHandleGet(byId) {
    let idDetPedidoProd = $.request.parameters.get("idDetPedidoProd");
    let iResPedido = $.request.parameters.get("iResPedido");
    let idetPedido = $.request.parameters.get("idetPedido");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let IdMarca = $.request.parameters.get("idMarcaPesquisa");
    let IdFornecedor = $.request.parameters.get("idFornPesquisa");
    let IdFabricante = $.request.parameters.get("idFabPesquisa");
    let stCadastrado = $.request.parameters.get("stCadastrado");
    let stMigradoSAP = $.request.parameters.get("stMigradoSAP");

    let query =  `
        SELECT 
            RP.IDRESUMOPEDIDO, 
            tbdp.IDDETALHEPRODUTOPEDIDO, 
            tbdp.IDDETALHEPEDIDO, 
            tbdp.IDGRUPOESTRUTURA, 
            tbdp.IDSUBGRUPOESTRUTURA, 
            SE.DSSUBGRUPOESTRUTURA, 
            tbdp.IDCOR, 
            TRIM(CR.DSCOR) AS DSCOR, 
            tbdp.IDTAMANHO, 
            tbdp.DSTAMANHO, 
            tbdp.IDCATEGORIAPEDIDO, 
            tbdp.IDTIPOTECIDO, 
            tbdp.IDESTILO, 
            ES.DSESTILO, 
            tbdp.IDFABRICANTE, 
            tbdp.IDLOCALEXPOSICAO, 
            LE.DSLOCALEXPOSICAO, 
            CS.IDCATEGORIAS, 
            CS.DSCATEGORIAS, 
            tbdp.IDNCM, 
            tbdp.NUNCM, 
            tbdp.IDCEST, 
            tbdp.NUCEST, 
            tbdp.IDTIPOPRODUTOFISCAL, 
            tbdp.IDFONTEPRODUTOFISAL, 
            tbdp.IDPRODCADASTRO, 
            tbdp.NUREF, 
            tbdp.CODBARRAS, 
            tbdp.DSPRODUTO, 
            tbdp.QTDPRODUTO, 
            tbdp.UND, 
            tbdp.VRCUSTO, 
            tbdp.VRVENDA, 
            tbdp.VRTOTALCUSTO, 
            tbdp.VRTOTALVENDA, 
            tbdp.DTCADASTRO, 
            tbdp.DTULTATUALIZACAO, 
            tbdp.STCADASTRADO, 
            tbdp.STRECEBIDO, 
            tbdp.OBSREF, 
            tbdp.IDDETALHEENTRADA, 
            tbdp.NUNF, 
            tbdp.QTDENTRADANF, 
            tbdp.DTENTRADANF, 
            tbdp.STECOMMERCE, 
            tbdp.STREDESOCIAL, 
            tbdp.STATIVO, 
            tbdp.STCANCELADO, 
            tbdp.STMIGRADOSAP, 
            tbdp.STREPOSICAO, 
            tbdp.QTDESTOQUEIDEAL, 
            IFNULL( tbdp.STEDITADOCOMPRAS, 'False') AS STEDITADOCOMPRAS,
            CASE
                WHEN (TBDP_PEDIDO_SECUNDARIO.IDDETALHEPRODUTOPEDIDO IS NOT NULL AND TBDP_PEDIDO_SECUNDARIO.STMIGRADOSAP = 'False') THEN 'False'
                ELSE tbdp.STMIGRADOSAP
            END AS STMIGRADOSAP
        FROM 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO tbdp 
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO DP ON
            tbdp.IDDETALHEPEDIDO = DP.IDDETALHEPEDIDO  
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO RP ON 
            DP.IDRESUMOPEDIDO = RP.IDRESUMOPEDIDO  
        LEFT JOIN "VAR_DB_NAME".COR CR ON 
            tbdp.IDCOR = CR.IDCOR  
        LEFT JOIN "VAR_DB_NAME".TIPOTECIDOS TBT ON 
            tbdp.IDTIPOTECIDO = TBT.IDTPTECIDO  
        LEFT JOIN "VAR_DB_NAME".CATEGORIAS CS ON 
            tbdp.IDCATEGORIAS = CS.IDCATEGORIAS  
        LEFT JOIN "VAR_DB_NAME".CATEGORIAPEDIDO CP ON 
            tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  
        LEFT JOIN "VAR_DB_NAME".UNIDADEMEDIDA UN ON 
            tbdp.UND = UN.DSSIGLA  
        LEFT JOIN "VAR_DB_NAME".ESTILOS ES ON 
            tbdp.IDESTILO = ES.IDESTILO  
        LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO LE ON 
            tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  
        LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA SE ON 
            tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  
        LEFT JOIN "VAR_DB_NAME".FABRICANTE FB ON 
            tbdp.IDFABRICANTE = FB.IDFABRICANTE
        LEFT JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP_PEDIDO_SECUNDARIO ON 
            tbdp.IDDETALHEPRODUTOPEDIDO = TBDP_PEDIDO_SECUNDARIO.IDDETALHEPRODUTOPEDIDOPRIMARIO
        WHERE 
            1 = ?
            AND tbdp.STCANCELADO = 'False' 
    `;
    
    if ( byId ) {
        query += ` AND  TBDP.IDDETALHEPRODUTOPEDIDO = '${byId}' `;
    }
    if ( idDetPedidoProd ) {
        query += ` AND  TBDP.IDDETALHEPRODUTOPEDIDO ='${idDetPedidoProd}' `;
    }
    if ( iResPedido ) {
        query += ` AND  RP.IDRESUMOPEDIDO ='${iResPedido}' `;
    }
    if ( idetPedido ) {
        query += ` AND  TBDP.IDDETALHEPEDIDO = '${idetPedido}' `;
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
        query += ` AND (TO_DATE(TBDP.DTCADASTRO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }
    if ( IdMarca ) {
        query += ` AND  RP.IDSUBGRUPOEMPRESARIAL = '${IdMarca}' `;
    }
    if ( IdFornecedor ) {
        query += ` AND  RP.IDFORNECEDOR = '${IdFornecedor}' `;
    }
    if ( IdFabricante ) {
        query += ` AND  TBDP.IDFABRICANTE = '${IdFabricante}' `;
    }
    if ( stCadastrado ) {
        query += ` AND  (TBDP.STCADASTRADO = '${stCadastrado}' OR TBDP_PEDIDO_SECUNDARIO.STCADASTRADO = '${stCadastrado}') `;
    }
    if ( stMigradoSAP ) {
        query += ` AND (TBDP.STMIGRADOSAP = '${stMigradoSAP}' OR TBDP_PEDIDO_SECUNDARIO.STMIGRADOSAP = '${stMigradoSAP}') `;
    }
    
    query += ` ORDER BY TBDP.NUREF, TBDP.IDTAMANHO`;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    conn = $.db.getConnection();
    
    var query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET 
            "IDSUBGRUPOESTRUTURA"=  ?, 
            "IDCOR"=  ?, 
            "IDTAMANHO"=  ?, 
            "DSTAMANHO"=  ?, 
            "IDCATEGORIAPEDIDO"=  ?, 
            "IDTIPOTECIDO"=  ?, 
            "IDESTILO"=  ?, 
            "IDFABRICANTE"=  ?, 
            "IDLOCALEXPOSICAO"=  ?, 
            "IDCATEGORIAS"=  ?, 
            "IDNCM"=  ?, 
            "NUNCM"=  ?, 
            "IDTIPOPRODUTOFISCAL"=  ?, 
            "IDFONTEPRODUTOFISAL"=  ?, 
            "NUREF"=  ?, 
            "CODBARRAS"=  ?, 
            "DSPRODUTO"=  ?, 
            "UND"=  ?, 
            "QTDPRODUTO"=  ?, 
            "VRCUSTO"=  ?, 
            "VRVENDA"=  ?, 
            "VRTOTALCUSTO"=  ?, 
            "DTCADASTRO"=  ?, 
            "DTULTATUALIZACAO"=  ?, 
            "STECOMMERCE"=  ?, 
            "STREDESOCIAL"=  ?, 
            "STATIVO"=  ?, 
            "STCANCELADO" =  ?, 
            "QTDESTOQUEIDEAL" =  ? 
        WHERE 
            "IDDETALHEPRODUTOPEDIDO" =  ? 
    `;
    
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {
		var registro = bodyJson[i];
		let stPedidoSecundario = validarSeExisteDetalhePedidoSecundario(registro.IDDETALHEPRODUTOPEDIDO);
        
        pStmt.setInt(1, registro.IDSUBGRUPOESTRUTURA);
        pStmt.setInt(2, registro.IDCOR);
        pStmt.setInt(3, registro.IDTAMANHO);
        pStmt.setString(4, registro.DSTAMANHO);
        pStmt.setInt(5, registro.IDCATEGORIAPEDIDO);
        pStmt.setInt(6, registro.IDTIPOTECIDO);
        pStmt.setInt(7, registro.IDESTILO);
        pStmt.setInt(8, registro.IDFABRICANTE);
        pStmt.setInt(9, registro.IDLOCALEXPOSICAO);
        pStmt.setInt(10, registro.IDCATEGORIAS);
        pStmt.setInt(11, registro.IDNCM);
        pStmt.setString(12, registro.NUNCM);
        pStmt.setInt(13, registro.IDTIPOPRODUTOFISCAL);
        pStmt.setInt(14, registro.IDFONTEPRODUTOFISAL);
        pStmt.setString(15, registro.NUREF);
        pStmt.setString(16, registro.CODBARRAS);
        pStmt.setString(17, registro.DSPRODUTO);
        pStmt.setString(18, registro.UND);
        pStmt.setFloat(19, registro.QTDPRODUTO);
        pStmt.setFloat(20, registro.VRCUSTO);
        pStmt.setFloat(21, registro.VRVENDA);
        pStmt.setFloat(22, registro.VRTOTALCUSTO);
        pStmt.setDate(23, registro.DTCADASTRO);
        pStmt.setDate(24, registro.DTULTATUALIZACAO);
        pStmt.setString(25, registro.STECOMMERCE);
        pStmt.setString(26, registro.STREDESOCIAL);
        pStmt.setString(27, registro.STATIVO);
        pStmt.setString(28, registro.STCANCELADO);
        pStmt.setInt(29, registro.QTDESTOQUEIDEAL);
        pStmt.setInt(30, registro.IDDETALHEPRODUTOPEDIDO);
        
        pStmt.execute();
        
        stPedidoSecundario && updateDetalheProdutoPedidoSecundario(registro.IDDETALHEPRODUTOPEDIDO);
    }
    
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    conn = $.db.getConnection();
    
    let idSubgrupo;
    let idFornecedor;
  
    var query = `
        INSERT INTO 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO"  
		(
            "IDDETALHEPEDIDO", 
            "IDSUBGRUPOESTRUTURA", 
            "IDCOR", 
            "IDTAMANHO", 
            "DSTAMANHO", 
            "IDCATEGORIAPEDIDO", 
            "IDTIPOTECIDO", 
            "IDESTILO", 
            "IDFABRICANTE", 
            "IDLOCALEXPOSICAO", 
            "IDCATEGORIAS", 
            "IDNCM", 
            "NUNCM", 
            "IDTIPOPRODUTOFISCAL", 
            "IDFONTEPRODUTOFISAL", 
            "IDPRODCADASTRO", 
            "NUREF", 
            "CODBARRAS", 
            "DSPRODUTO", 
            "UND", 
            "QTDPRODUTO", 
            "VRCUSTO", 
            "VRVENDA", 
            "VRTOTALCUSTO", 
            "DTCADASTRO", 
            "DTULTATUALIZACAO", 
            "STECOMMERCE", 
            "STREDESOCIAL", 
            "STATIVO", 
            "STCANCELADO", 
            "QTDESTOQUEIDEAL", 
            "IDRESUMOPEDIDO", 
            "STMIGRADOSAP", 
            "STREPOSICAO", 
            "IDRESPCADASTRO", 
            "IDRESPAUTORIZAEDITCAD", 
            "IDFORNECEDOR",
            "STCADASTRADO"
        )
		VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, now() , now() , ?,?,?,?,?,?,?,?,?,?,?,?)
	`;
  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
	
	if(bodyJson.length){
		let stPedidoSecundario = validarSeExisteDetalhePedidoSecundario(bodyJson[0].IDDETALHEPEDIDO);
		
        for (let registro of bodyJson) {
            if(registro.PRODUTOSDETALHE.length){
                let detalhesProdutos = registro.PRODUTOSDETALHE;
                let dadosDetPedido = getDadosPedido(registro.IDDETALHEPEDIDO);
                let stExiste = dadosDetPedido.length > 0;
                
                if(!stExiste){
                    throw { message: `Detalhe do pedido não encontrado ou cancelado| IDDETALHEPEDIDO: ${registro.IDDETALHEPEDIDO}`};
                }
                
                idSubgrupo = dadosDetPedido[0]["IDSUBGRUPOESTRUTURA"];
                idFornecedor = dadosDetPedido[0]["IDFORNECEDOR"];
                
                let stAtualizar = verificaSePrecisaAtualizarDetalhePedido(registro);
                
                if(stAtualizar){
                    atualizarDetalhePedido(registro);
                }
                
                for (let detProd of detalhesProdutos){
                    let stReposicao = detProd.reposicao;
                    let codBarras = stReposicao == 'True' ? detProd.codbarra : null; //grCodBars.gerarCodigoBarras(idSubgrupo, idFornecedor);
                    let idProduto = detProd.idproduto;
                    
                    if(stPedidoSecundario && idProduto != 'NULL' && !idProduto.contains('_RN')){
                        idProduto += '_RN';
                    }
                    
                    pStmt.setInt(1, registro.IDDETALHEPEDIDO);   
                    pStmt.setInt(2, registro.IDSUBGRUPOESTRUTURA);
                    pStmt.setInt(3, registro.IDCOR);
                    pStmt.setInt(4, Number(detProd.idtamanho));
                    pStmt.setString(5, detProd.tamanho);
                    pStmt.setInt(6, registro.IDCATEGORIAPEDIDO);
                    pStmt.setInt(7, registro.IDTIPOTECIDO);
                    pStmt.setInt(8, registro.IDESTILO);
                    pStmt.setInt(9, registro.IDFABRICANTE);
                    pStmt.setInt(10, registro.IDLOCALEXPOSICAO);
                    pStmt.setInt(11, registro.IDCATEGORIAS);
                    pStmt.setInt(12, registro.IDNCM);
                    pStmt.setString(13, registro.NUNCM);
                    pStmt.setInt(14, registro.IDTIPOPRODUTOFISCAL);
                    pStmt.setInt(15, registro.IDFONTEPRODUTOFISAL);
                    pStmt.setString(16, idProduto);
                    pStmt.setString(17, registro.NUREF);
                    setStringOrNull(pStmt, 18, codBarras);
                    pStmt.setString(19, detProd.dsproduto);
                    pStmt.setString(20, detProd.unidade);
                    pStmt.setFloat(21, detProd.quantidade);
                    pStmt.setFloat(22, detProd.vrunitario);
                    pStmt.setFloat(23, detProd.vrvendas);
                    pStmt.setFloat(24, detProd.vrtotal);
                    pStmt.setString(25, registro.STECOMMERCE);
                    pStmt.setString(26, registro.STREDESOCIAL);
                    pStmt.setString(27, registro.STATIVO);
                    pStmt.setString(28, registro.STCANCELADO);
                    pStmt.setInt(29, registro.QTDESTOQUEIDEAL);
                    pStmt.setInt(30, registro.IDRESUMOPEDIDO);
                    pStmt.setString(31, registro.STMIGRADOSAP);
                    pStmt.setString(32, stReposicao);
                    pStmt.setInt(33, registro.IDRESPCADASTRO);
                    setIntOrNull(pStmt, 34, registro.IDRESPAUTORIZAEDITCAD);
                    pStmt.setInt(35, Number(idFornecedor));
                    pStmt.setString(36, stReposicao);
                    
                    pStmt.execute();
                    
                    conn.commit();
                    
                    if(stPedidoSecundario){
                        fnCriarDetalheProdutoPedidoSecundario(registro.IDDETALHEPEDIDO, Number(detProd.idtamanho));
                        updateIdProdutoCodBarrasPedidoPrimario(registro.IDDETALHEPEDIDO);
                        
                        conn.commit();
                    }
                }
                
                atualizarStTransformadoDetPedido(registro.IDDETALHEPEDIDO);
                
                
            } else {
                throw { message: `O objeto que contem os detalhes dos produtos está vazios!`};
            }
        }
        
        pStmt.close();
        
        conn.commit();
        
        return {
            "msg": 'Produto Criado com sucesso!'
        };
        
    } else {
        throw { message: `O objeto enviado está vazio, verifique e tente novamante!`};    
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
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch (e) {
    let detalheError = e.stack.split('\n');
    
    detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message,
        detalheError
    }));
    $.response.status = 400;
}  