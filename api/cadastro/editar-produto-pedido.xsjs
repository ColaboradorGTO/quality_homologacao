let api = $.import("quality.concentrador_homologacao.api", "apiResponse");
let libEditProduto = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.libs.alteracao-pedido.itens", "alterar-dados-produto-pedido");
let libEditItemPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.libs.alteracao-pedido.itens", "alterar-dados-item-pedido");

let dbNameSAP = 'SBO_GTO_TESTE4';

let conn;

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

function registrarSucessoLog(idDetalheProdutoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET 
            ERRORLOGSAP = NULL
        WHERE 
            IDDETALHEPRODUTOPEDIDO = ?
            OR IDDETALHEPRODUTOPEDIDOPRIMARIO = ?
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setInt(1, Number(idDetalheProdutoPedido));
	pStmt.setInt(2, Number(idDetalheProdutoPedido));
	
	pStmt.executeUpdate();
	pStmt.close();
}

function registrarErrorLog(idDetalheProdutoPedido, msgError = 'Erro ao editar o Item no Pedido SAP'){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDDETALHEPRODUTOPEDIDO = ?
            OR IDDETALHEPRODUTOPEDIDOPRIMARIO = ?
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idDetalheProdutoPedido));
	pStmt.setInt(3, Number(idDetalheProdutoPedido));
	
	pStmt.executeUpdate();
	pStmt.close();
	
	conn.commit();
}

// Return Warning

function returnWarning(msg){
    $.response.status = 400;
    
    return {
        msg
    }
}

// Get Dados

function getValoresPedidoQuandoCancelamentoTotalDetalhePedido(idResumoPedido, idDetalhePedido){
    let query = `
        SELECT 
            IFNULL(COUNT(IDDETALHEPEDIDO), 0) TOTALITENS, 
            IFNULL(SUM(QTDTOTAL), 0) QTDTOTAL, 
            IFNULL(SUM(QTDTOTAL), 0) * IFNULL(VRUNITLIQUIDO, 0)) AS  VRTOTAL
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            IDRESUMOPEDIDO = ${idResumoPedido}
            AND STCANCELADO = 'False'
            AND 1 = ?
    `;

	return api.sqlQuery(query, 1);
}

function getQtdGradeDetalhePedidoAtualizada(idDetalheProdutoPedido, idTamanho, qtdNova){
    let query = `
        SELECT
            IFNULL(SUM(QTD), 0) + ${qtdNova} AS QTD
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDPG
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDPP ON 
            TBDPG.IDDETALHEPEDIDO = TBDPP.IDDETALHEPEDIDO
        WHERE
            TBDPG.STATIVO = 'True'
            AND TBDPG.IDTAMANHO <> ${idTamanho}
            AND TBDPP.IDDETALHEPRODUTOPEDIDO = ${idDetalheProdutoPedido}
            AND 1 = ?
    `;
    
    let reg = api.sqlQuery(query, 1);
    
    let qtdAtualizada = Number(reg[0].QTD);
    
    return qtdAtualizada;
}

function getDadosItemPedidoParaEditarSAP(dados){
    let query = `
        SELECT
            TBO."DocEntry" AS DOCENTRY,
            TBDP.IDRESUMOPEDIDO,
            TBDP.IDDETALHEPRODUTOPEDIDO,
            '${dados.DSPRODUTO}' AS DSPRODUTO,
            ${dados.QTDPRODUTO} AS QTDPRODUTO,
            IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 1) * CAST( ${dados.VRCUSTO} AS DECIMAL(21, 6) )  AS VRCUSTO
        FROM    
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDP
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON 
            TBDP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        LEFT JOIN ${dbNameSAP}.OPOR TBO ON
            TO_VARCHAR(TBDP.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
        WHERE
            TBDP.STATIVO =  'True'
            AND TBDP.STCANCELADO = 'False'
            AND IFNULL(TBDP.IDPRODCADASTRO, 'NULL') <> 'NULL'
            AND (
                    TBDP.IDDETALHEPRODUTOPEDIDO = ${dados.IDDETALHEPRODUTOPEDIDO}
                OR
                    TBDP.IDDETALHEPRODUTOPEDIDOPRIMARIO = ${dados.IDDETALHEPRODUTOPEDIDO}
            )
            AND 1 = ?
        ORDER BY 
            TBDP.IDRESUMOPEDIDO
    `;
    
    return api.sqlQuery(query, 1);
}
//
function getIdDetalheProdutoPedidoSecundario(idDetProdPedido){
    let query = `
        SELECT
            TBDPP.IDDETALHEPRODUTOPEDIDO
        FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO AND TBD.STCANCELADO = 'False'
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO AND TBR.STCANCELADO = 'False'
        WHERE
            TBDPP.STCANCELADO = 'False'
            AND TBDPP.IDDETALHEPRODUTOPEDIDOPRIMARIO = ?
    `;
    
    let regDetalhe = api.sqlQuery(query,idDetProdPedido);
    
    if(regDetalhe.length > 0){
        return Number(regDetalhe[0].IDDETALHEPRODUTOPEDIDO || 0);
    }
    
    return 0;
}

function getDadosDetalheProdutoPedido(idDetalheProdutoPedido){
    let queryProdutos =  `
        SELECT
            TBR.IDGRUPOEMPRESARIAL AS IDGRUPOEMPRESARIAL,
            TBDPP.NUNCM AS NUNCM,
            '' AS NUCEST,
            '' AS NUCST_ICMS,
            '' AS NUCFOP,
            '' AS PERC_OUT,
            TBDPP.CODBARRAS AS NUCODBARRAS,
            TBDPP.DSPRODUTO AS DSNOME,
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
            TBDPP.DTULTATUALIZACAO AS DTULTALTERACAO,
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
            TBDPP.STCADASTRADO AS STCADASTRADO,
            TBDPP.STREPOSICAO AS STREPOSICAO,
            TBDPP.STECOMMERCE,
            TBDPP.IDPRODCADASTRO,
            TBDPP.IDTIPOPRODUTOFISCAL,
            TBDPP.IDFONTEPRODUTOFISAL
        FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE
            TBDPP.STCANCELADO = 'False'
            AND TBDPP.IDPRODCADASTRO IS NOT NULL
            AND TBDPP.IDPRODCADASTRO <> 'NULL'
            AND TBDPP.IDDETALHEPRODUTOPEDIDO = ?
    `;

	return api.sqlQuery(queryProdutos, idDetalheProdutoPedido);
}

function getStPedidoRN(idResumoPedido){
    let query = `
        SELECT
            IDRESUMOPEDIDO
        FROM    
            "VAR_DB_NAME".RESUMOPEDIDO
        WHERE
            STPEDIDOPRIMARIO = 'True'
            AND IDRESUMOPEDIDO = ${idResumoPedido}
            AND 1 = ?
    `;
    
    let reg = api.sqlQuery(query, 1);
    
    return reg.length > 0;
}

function getValoresPedidoQuandoCancelamentoTotalDetalhePedido(idResumoPedido, idDetalhePedido){
    let query = `
        SELECT 
            IFNULL(COUNT(IDDETALHEPEDIDO), 0) TOTALITENS, 
            IFNULL(SUM(QTDTOTAL), 0) QTDTOTAL, 
            IFNULL(SUM(QTDTOTAL), 0) * IFNULL(SUM(VRUNITLIQUIDO), 0) AS  VRTOTAL
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            IDRESUMOPEDIDO = ${idResumoPedido}
            AND IDDETALHEPEDIDO <> ${idDetalhePedido}
            AND STCANCELADO = 'False'
            AND 1 = ?
    `;

	return api.sqlQuery(query, 1);
}

function getValoresPedidoQuandoCancelamentoParcialDetalhePedido(idResumoPedido, qtdParaSubtrair, vrParaSubtrair){
    let query = `
        SELECT 
            IFNULL(COUNT(IDDETALHEPEDIDO), 0) TOTALITENS, 
            IFNULL(SUM(QTDTOTAL) - ${qtdParaSubtrair}, 0) QTDTOTAL, 
            IFNULL(SUM(VRTOTAL) - ${vrParaSubtrair}, 0) AS  VRTOTAL
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            IDRESUMOPEDIDO = ${idResumoPedido}
            AND STCANCELADO = 'False'
            AND 1 = ?
    `;

	return api.sqlQuery(query, 1);
}

function getValoresAtualizadosDoPedido(idResumoPedido, idDetalhePedido, qtdRestante, qtdParaSubtrair, vrParaSubtrair){
    if( qtdRestante > 0 ){
        return getValoresPedidoQuandoCancelamentoParcialDetalhePedido(idResumoPedido, qtdParaSubtrair, vrParaSubtrair);
    } else {
        return getValoresPedidoQuandoCancelamentoTotalDetalhePedido(idResumoPedido, idDetalhePedido);
    }
}

function getDadosProdutosParaRemoverPedido(dados){
    let query = `
        SELECT
            TBO."DocEntry" AS DOCENTRY,
            TBDP.IDDETALHEPRODUTOPEDIDO,
            TBDP.IDRESUMOPEDIDO,
            TBDP.IDDETALHEPEDIDO,
            TBDP.QTDPRODUTO,
            TBDP.IDTAMANHO,
            '${dados.STCANCELADO}' AS STCANCELADO,
            ${dados.IDRESPCANCELAMENTO} AS IDRESPCANCELAMENTO,
            '${dados.TXTOBSCANCELAMENTO}' AS TXTOBSCANCELAMENTO
        FROM    
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDP
        LEFT JOIN ${dbNameSAP}.OPOR TBO ON
            TO_VARCHAR(TBDP.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
        WHERE
            TBDP.STATIVO =  'True'
            AND TBDP.STCANCELADO = 'False'
            AND IFNULL(TBDP.IDPRODCADASTRO, 'NULL') <> 'NULL'
            AND (
                    TBDP.IDDETALHEPRODUTOPEDIDO = ${dados.IDDETALHEPRODUTOPEDIDO}
                OR
                    TBDP.IDDETALHEPRODUTOPEDIDOPRIMARIO = ${dados.IDDETALHEPRODUTOPEDIDO}
            )
            AND 1 = ?
        ORDER BY 
            TBDP.IDRESUMOPEDIDO
    `;
    
    return api.sqlQuery(query, 1);
}

function getDadosDetalhePedido(dados){
    let query = `
        SELECT
            TBDP.IDDETALHEPRODUTOPEDIDO,
            TBDP.IDRESUMOPEDIDO,
            TBDP.IDDETALHEPEDIDO,
            TBD.QTDTOTAL,
            TBD.VRUNITLIQUIDO,
            ${dados.IDRESPCANCELAMENTO} AS IDRESPCANCELAMENTO,
            '${dados.TXTOBSCANCELAMENTO}' AS TXTOBSCANCELAMENTO
        FROM    
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON 
            TBDP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO
        WHERE 
            TBDP.IDDETALHEPRODUTOPEDIDO = ${dados.IDDETALHEPRODUTOPEDIDO}
            AND 1 = ?
    `;
    
    let reg = api.sqlQuery(query, 1);
    
    return reg.length > 0 ? reg[0] : null;
}

function getValidacoesPedidoEntreQualitySAP(idResumoPedido){
    let query = `
        WITH SAP AS (
            SELECT
                TBP1."DocEntry",
                TBO."DocStatus",
                TBP1."LineNum",
                TBP1."LineStatus",
                TBP1."ItemCode", 
                TBP1."Quantity" AS "QtdProdutoLinha",
                TBP1."Price" AS "VrPrecoLinha",
                IFNULL(TBP1."TrgetEntry", 0) AS "DocEntryNotaEntrada",
                COUNT(TBP1."LineNum") OVER (PARTITION BY TBP1."DocEntry") AS "QtdTotalLinhas",
                TBO."DocTotal" AS "VrTotalPedido",
                ROW_NUMBER() OVER (
                    PARTITION BY TBP1."ItemCode" ORDER BY TBP1."LineNum"
                ) AS LINHA_SAP
            FROM 
            	${dbNameSAP}.POR1 TBP1
            INNER JOIN ${dbNameSAP}.OPOR TBO ON 
            	TBO."DocEntry" = TBP1."DocEntry"
            INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
                TBR.DOCENTRY_PEDIDO_SAP = TBO."DocEntry" AND TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
            WHERE 
                TBR.STCANCELADO = 'False'
                AND TBR.IDRESUMOPEDIDO = ${idResumoPedido}
        ),
        APP AS (
            SELECT
                TBDP.IDRESUMOPEDIDO,
                TBDP.IDDETALHEPRODUTOPEDIDO,
                TBDP.IDPRODCADASTRO,
                TBDP.QTDPRODUTO AS "QtdProdutoLinha",
                TBDP.VRCUSTO AS "VrPrecoLinha",
                COUNT(TBDP.IDDETALHEPRODUTOPEDIDO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "QtdTotalLinhas",
                SUM(TBDP.VRTOTALCUSTO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "VrTotalPedido",
                ROW_NUMBER() OVER (
                    PARTITION BY TBDP.IDPRODCADASTRO
                    ORDER BY TBDP.IDDETALHEPRODUTOPEDIDO
                ) AS LINHA_APP
            FROM 
            	"VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
            WHERE 
                TBDP.STCANCELADO = 'False'
                AND TBDP.IDRESUMOPEDIDO = ${idResumoPedido}
        )
        SELECT
            CASE 
                WHEN SAP."DocStatus" <> 'O' THEN 'Y'
                ELSE 'N'
            END AS "IsPedidoFechado",
            CASE 
                WHEN SAP."LineStatus" <> 'O' AND SAP."DocEntryNotaEntrada" = 0 THEN 'Y'
                ELSE 'N'
            END AS "IsPedidoComLinhaFechadaSemRecepcao",
            CASE 
                WHEN SAP."VrPrecoLinha" <> IFNULL(APP."VrPrecoLinha", 0) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergentePrecoPorLinhaEntrePedidos",
            CASE 
                WHEN SAP."QtdProdutoLinha" <> IFNULL(APP."QtdProdutoLinha", 0) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteQtdPorLinhaEntrePedidos",
            CASE 
                WHEN SAP."QtdTotalLinhas" <> IFNULL(APP."QtdTotalLinhas", 0) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteTotalLinhasEntrePedidos",
            CASE 
                WHEN SAP."VrTotalPedido" <> IFNULL(ROUND(APP."VrTotalPedido", 2), 0) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteVrTotalEntrePedidos"
        FROM 
            SAP
        LEFT JOIN APP ON 
            SAP."ItemCode" = TO_VARCHAR(APP.IDPRODCADASTRO) /*AND SAP."Quantity" = APP.QTDPRODUTO*/ AND SAP.LINHA_SAP = APP.LINHA_APP
        WHERE
            1 = ?
        ORDER BY 
            CASE 
                WHEN SAP."DocStatus" <> 'O' THEN 'Y'
                ELSE 'N'
            END DESC,
            CASE 
                WHEN SAP."LineStatus" <> 'O' AND SAP."DocEntryNotaEntrada" = 0 THEN 'Y'
                ELSE 'N'
            END DESC,
            CASE 
                WHEN SAP."VrPrecoLinha" <> APP."VrPrecoLinha" THEN 'Y'
                ELSE 'N'
            END DESC,
            CASE 
                WHEN SAP."QtdProdutoLinha" <> APP."QtdProdutoLinha" THEN 'Y'
                ELSE 'N'
            END  DESC,
            CASE 
                WHEN SAP."QtdTotalLinhas" <> APP."QtdTotalLinhas" THEN 'Y'
                ELSE 'N'
            END  DESC,
            CASE 
                WHEN SAP."VrTotalPedido" <> APP."VrTotalPedido" THEN 'Y'
                ELSE 'N'
            END DESC,
            SAP."LineNum"
    `;

	return api.sqlQuery(query, 1);
}

function getDadosProdutoPedidoEntreQualitySAP(idResumoPedido, idDetalheProdutoPedido){
    let query = `
        WITH SAP AS (
            SELECT
                IFNULL(TBP1."TrgetEntry", 0) AS "DocEntryNotaEntrada",
                TBP1."ItemCode",
                TBP1."LineNum",
                ROW_NUMBER() OVER (
                    PARTITION BY TBP1."ItemCode"
                    ORDER BY TBP1."LineNum"
                ) AS LINHA_SAP
            FROM 
            	${dbNameSAP}.POR1 TBP1
            INNER JOIN ${dbNameSAP}.OPOR TBO ON 
            	TBO."DocEntry" = TBP1."DocEntry"
            INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
                TBR.DOCENTRY_PEDIDO_SAP = TBO."DocEntry" AND TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
            WHERE 
                TBR.STCANCELADO = 'False'
                AND TBR.IDRESUMOPEDIDO = ${idResumoPedido}
        ),
        APP AS (
            SELECT
                TBDP.IDDETALHEPRODUTOPEDIDO,
                TBDP.IDPRODCADASTRO,
                ROW_NUMBER() OVER (
                    PARTITION BY TBDP.IDPRODCADASTRO
                    ORDER BY TBDP.IDDETALHEPRODUTOPEDIDO
                ) AS LINHA_APP
            FROM 
            	"VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
            WHERE 
                TBDP.STCANCELADO = 'False'
                AND TBDP.IDRESUMOPEDIDO = ${idResumoPedido}
        )
        SELECT
            SAP."DocEntryNotaEntrada"
        FROM 
            SAP
        LEFT JOIN APP ON 
            SAP."ItemCode" = TO_VARCHAR(APP.IDPRODCADASTRO) AND SAP.LINHA_SAP = APP.LINHA_APP /*AND SAP."Quantity" = APP.QTDPRODUTO */
        WHERE
            APP.IDDETALHEPRODUTOPEDIDO = ${idDetalheProdutoPedido}
            AND 1 = ?
        ORDER BY 
            SAP."LineNum"
    `;
    
    return api.sqlQuery(query, 1);
}

function getValidacoesEntrePedidoPrimarioSecundario(idResumoPedido){
    let query = `
        WITH PEDIDOPRIMARIO AS (
            SELECT
                TBDP.IDDETALHEPRODUTOPEDIDO,
                TBDP.IDPRODCADASTRO,
                TBDP.QTDPRODUTO AS "QtdProdutoLinha",
                TBDP.VRCUSTO AS "VrPrecoLinha",
                COUNT(TBDP.IDDETALHEPRODUTOPEDIDO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "QtdTotalLinhas",
                SUM(TBDP.VRTOTALCUSTO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "VrTotalPedido"
            FROM 
                "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
            INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
                TBDP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO 
            WHERE 
                TBR.STCANCELADO = 'False'
                AND TBDP.STCANCELADO = 'False'
                AND TBR.IDRESUMOPEDIDO = ${idResumoPedido}
        ),
        PEDIDOSECUNDARIO AS (
            SELECT
                TBR.FATOR_ACRESCIMO_COMPRA,
                TBDP.IDDETALHEPRODUTOPEDIDOPRIMARIO,
                TBDP.IDPRODCADASTRO,
                TBDP.QTDPRODUTO AS "QtdProdutoLinha",
                TBDP.VRCUSTO AS "VrPrecoLinha",
                COUNT(TBDP.IDDETALHEPRODUTOPEDIDO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "QtdTotalLinhas",
                SUM(TBDP.VRTOTALCUSTO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "VrTotalPedido"
            FROM 
                "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
            INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
                TBDP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
            WHERE 
                TBR.STCANCELADO = 'False'
                AND TBDP.STCANCELADO = 'False'
                AND TBR.IDPEDIDOPRIMARIO = ${idResumoPedido}
        )
        SELECT
            CASE 
                WHEN (PEDIDOPRIMARIO."VrPrecoLinha" * IFNULL(PEDIDOSECUNDARIO.FATOR_ACRESCIMO_COMPRA, 1)) <> IFNULL(PEDIDOSECUNDARIO."VrPrecoLinha", 0) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergentePrecoPorLinhaEntrePedidos",
            CASE 
                WHEN PEDIDOPRIMARIO."QtdProdutoLinha" <> IFNULL(PEDIDOSECUNDARIO."QtdProdutoLinha", 0) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteQtdPorLinhaEntrePedidos",
            CASE 
                WHEN PEDIDOPRIMARIO."QtdTotalLinhas" <> IFNULL(PEDIDOSECUNDARIO."QtdTotalLinhas", 0) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteTotalLinhasEntrePedidos",
            CASE 
                WHEN (PEDIDOPRIMARIO."VrTotalPedido" * IFNULL(PEDIDOSECUNDARIO.FATOR_ACRESCIMO_COMPRA,  1)) <> IFNULL(PEDIDOSECUNDARIO."VrTotalPedido", 0) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteVrTotalEntrePedidos"
        FROM 
            PEDIDOPRIMARIO
        LEFT JOIN PEDIDOSECUNDARIO ON 
            PEDIDOPRIMARIO.IDDETALHEPRODUTOPEDIDO = PEDIDOSECUNDARIO.IDDETALHEPRODUTOPEDIDOPRIMARIO
        WHERE
            1 = ?
        ORDER BY 
            PEDIDOPRIMARIO.IDDETALHEPRODUTOPEDIDO
    `;

	return api.sqlQuery(query, 1);
}

// Validação

function validarDadosPedidoEntreQualitySAP(idResumoPedido){
    let isValidPedido = false;
    let existPedidoSAP = false;
    let regValidacoesPedido = getValidacoesPedidoEntreQualitySAP(idResumoPedido);
    let arrayMotivos = [
        'Pedido fechado no SAP',
        'Pedido com linha fechada e sem recepção no SAP',
        'Pedido com valores de itens divergentes entre Quality e SAP',
        'Pedido com quantidade de itens divergente entre Quality e SAP',
        'Pedido com quantidade de linhas divergente entre Quality e SAP',
        'Pedido com valor total divergente entre Quality e SAP',
    ];
    
	if(regValidacoesPedido.length > 0){
        existPedidoSAP = true;
        
        for(let registro of regValidacoesPedido) {
            let { 
                IsPedidoFechado, 
                IsPedidoComLinhaFechadaSemRecepcao/*, 
                IsDivergentePrecoPorLinhaEntrePedidos, 
                IsDivergenteQtdPorLinhaEntrePedidos, 
                IsDivergenteTotalLinhasEntrePedidos, 
                IsDivergenteVrTotalEntrePedidos */
            } = registro;
            let arrayCondicoesDivergentes = [
                IsPedidoFechado,
                IsPedidoComLinhaFechadaSemRecepcao/*,
                IsDivergentePrecoPorLinhaEntrePedidos, 
                IsDivergenteQtdPorLinhaEntrePedidos,
                IsDivergenteTotalLinhasEntrePedidos,
                IsDivergenteVrTotalEntrePedidos*/
            ];
            let idMotivo = arrayCondicoesDivergentes.findIndex(v => v == "Y");
            
            if(idMotivo != -1){
                let motivo =  arrayMotivos[idMotivo];
                
                return {
                    msgWarningPedido: `Erro ao editar o Item no SAP, ${motivo}`,
                    isValidPedido,
                    existPedidoSAP
                };
            }
            
        }
        
        isValidPedido = true;
	}
	
	return { isValidPedido, existPedidoSAP };
}

function validarSeProdutoExisteSeTemEntradaNoPedidoSap(idResumoPedido, idDetalheProdutoPedido){
    let isValidProdToEditSAP = false;
    let existProdPedidoSAP = false;
	let regProd = getDadosProdutoPedidoEntreQualitySAP(idResumoPedido, idDetalheProdutoPedido)
    
    if(regProd.length > 0){
        existProdPedidoSAP = true;
        
        for( let { DocEntryNotaEntrada } of regProd ) {
            
            if(DocEntryNotaEntrada != 0 ){
                return {
                    msgWarningProdPedido: `Erro ao cancelar o Item no SAP, Item com recepção total ou parcial no SAP`,
                    isValidProdToEditSAP: false,
                    existProdPedidoSAP
                };
            }
            
        }
        
        isValidProdToEditSAP = true;
	}
	
	return { isValidProdToEditSAP, existProdPedidoSAP }
}

function validarPedidoPrimarioComSecundario(idResumoPedido){
    let isValidPedidosPrimarioSecundario = false;
    let existPedidosPrimarioSecundario = false;
    let regValidacoes = getValidacoesEntrePedidoPrimarioSecundario(idResumoPedido);
    let arrayMotivos = [
        'Pedidos Primario e Secundario com preços de produtos das linhas divergente no Quality',
        'Pedidos Primario e Secundario com quantidades de produtos das linhas divergente no Quality',
        'Pedidos Primario e Secundario com quantidade de linhas divergente no Quality',
        'Pedidos Primario e Secundario com valores totais divergentes no Quality',
    ];
	
	if(regValidacoes.length > 0){
        existPedidosPrimarioSecundario = true;
        
        for( let { IsDivergentePrecoPorLinhaEntrePedidos, IsDivergenteQtdPorLinhaEntrePedidos, IsDivergenteTotalLinhasEntrePedidos, IsDivergenteVrTotalEntrePedidos } of regValidacoes) {
            let arrayCondicoesDivergentes = [
                IsDivergentePrecoPorLinhaEntrePedidos, 
                IsDivergenteQtdPorLinhaEntrePedidos,
                IsDivergenteTotalLinhasEntrePedidos,
                IsDivergenteVrTotalEntrePedidos
            ];
            let idMotivo = arrayCondicoesDivergentes.findIndex(v => v == "Y" );
            
            if(idMotivo != -1){
                let motivo =  arrayMotivos[idMotivo];
                
                return {
                    msgWarningValidacaoPedidosPrimarioSecundario: `Erro ao cancelar, ${motivo}`,
                    isValidPedidosPrimarioSecundario: false,
                    existPedidosPrimarioSecundario
                };
            }
            
        }
        
        isValidPedidosPrimarioSecundario = true;
	}
	
	return { isValidPedidosPrimarioSecundario, existPedidosPrimarioSecundario };
}

function validarSeAptoParaEditarSapQuandoPedidoPadrao(dadosProdutoPedido){
    let { IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO } = dadosProdutoPedido;
    let { existPedidoSAP, isValidPedido, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(IDRESUMOPEDIDO);
    let { existProdPedidoSAP, isValidProdToEditSAP, msgWarningProdPedido } = validarSeProdutoExisteSeTemEntradaNoPedidoSap(IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO);
    let msg = msgWarningPedido || msgWarningProdPedido || '';
    let success = !msg.length;
    
    let stEditarSAP = !msg.length && isValidProdToEditSAP;
    
    return {
        success,
        stEditarSAP,
        msg
    }
}

function validarSeAptoParaEditarQuandoPedidoRN(dadosProdutoPedido){
    let { IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO } = dadosProdutoPedido;
    let { 
        existPedidosPrimarioSecundario, 
        isValidPedidosPrimarioSecundario, 
        msgWarningValidacaoPedidosPrimarioSecundario 
    } = validarPedidoPrimarioComSecundario(IDRESUMOPEDIDO);
    let idPedidoPrimario;
    let idPedidoSecundario;

    let stEditarSAP = false;
    
    let ultimoEstadoExistPedidoSAP = null;
    let ultimoEstadoIsValidPedido = null;
    let ultimoEstadoExistProdPedidoSAP = null;
    let ultimoEstadoisValidProdToEditSAP = null;
    let ultimoEstadoMsgWarningPedido = null;
    let ultimoEstadoMsgWarningProdPedido = null;
    
    if(!existPedidosPrimarioSecundario){
        return returnWarning('Pedido Primario ou Secundario não encontrado no Quality');
    }
    
    if(!isValidPedidosPrimarioSecundario){
        return returnWarning(msgWarningValidacaoPedidosPrimarioSecundario);
    }
    
    let dadosProdutosPedidos = getDadosItemPedidoParaEditarSAP(dadosProdutoPedido);
    
    for(let i = 0; i < dadosProdutosPedidos.length; i++){
        let registro = dadosProdutosPedidos[i]
        let { existPedidoSAP, isValidPedido, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(registro.IDRESUMOPEDIDO);
        let { existProdPedidoSAP, isValidProdToEditSAP, msgWarningProdPedido } = validarSeProdutoExisteSeTemEntradaNoPedidoSap(registro.IDRESUMOPEDIDO, registro.IDDETALHEPRODUTOPEDIDO);
        
        let stPrimario = i == 0;
        
        if(stPrimario){
            idPedidoPrimario = registro.IDRESUMOPEDIDO;
            ultimoEstadoExistPedidoSAP = existPedidoSAP;
            ultimoEstadoIsValidPedido = isValidPedido;
            ultimoEstadoExistProdPedidoSAP = existProdPedidoSAP;
            ultimoEstadoisValidProdToEditSAP = isValidProdToEditSAP;
            ultimoEstadoMsgWarningPedido = msgWarningPedido || '';
            ultimoEstadoMsgWarningProdPedido = msgWarningProdPedido || '';
        } else {
            idPedidoSecundario = registro.IDRESUMOPEDIDO;
        }
        
        let label = (isPrimario) => `Pedido ${isPrimario ? 'Primario' : 'Secundario'} (${isPrimario ? idPedidoPrimario : idPedidoSecundario}): `;
        let msg = (msgWarningPedido || msgWarningProdPedido) ? label(stPrimario) + (msgWarningPedido || msgWarningProdPedido) : '';
        
        if(!msg.length && ultimoEstadoExistPedidoSAP != existPedidoSAP){
            msg = label(!ultimoEstadoExistPedidoSAP) + 'Não migrado';
        }
        
        if(!msg.length && ultimoEstadoExistProdPedidoSAP != existProdPedidoSAP){
            msg = label(!ultimoEstadoExistProdPedidoSAP) + 'Produto não encontrado no Pedido SAP';
        }
        
        if(msg.length > 0){
            return {
                success: false,
                msg
            };
        }
        
        stEditarSAP = ultimoEstadoisValidProdToEditSAP && isValidProdToEditSAP;
    }
    
    return {
        success: true,
        stEditarSAP
    }
}

// Gravação de Dados no BD

function atualizarTabelaProduto(idDetalheProdutoPedido){
    let dadosProdutoAtualizado = getDadosDetalheProdutoPedido(idDetalheProdutoPedido);
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."PRODUTO" 
        SET
            "NUNCM" = ?,
            "DSNOME" = ?,
            "UND" = ?,
            "PRECOCUSTO" = ?,
            "NUREFERENCIA" = ?,
            "STATIVO" = ?,
            "IDCOR" = ?,
            "IDTAMANHO" = ?,
            "IDTIPOTECIDO" = ?,
            "IDLOCALEXPOSICAO" = ?,
            "IDCATEGORIAS" = ?,
            "STECOMMERCE" = ?,
            "IDCATEGORIAPEDIDO" = ?,
            "IDTIPOPRODUTOFISCAL" = ?,
            "IDFONTEPRODUTOFISCAL" = ?,
            "DTULTALTERACAO" = CURRENT_TIMESTAMP
        WHERE 
            "IDPRODUTO" =  ?
    `;
  		
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for (let i = 0; i < dadosProdutoAtualizado.length; i++) {
        let dados = dadosProdutoAtualizado[i];
        
        pStmt.setInt(1, parseInt(dados.NUNCM));
        pStmt.setString(2, dados.DSNOME);
        pStmt.setString(3, dados.UND);
        pStmt.setFloat(4, parseFloat(dados.PRECOCUSTO));
        pStmt.setString(5, dados.NUREFERENCIA);
        pStmt.setString(6, dados.STATIVO);
        pStmt.setInt(7, parseInt(dados.IDCOR) || 0);
        pStmt.setInt(8, parseInt(dados.IDTAMANHO));
        pStmt.setInt(9, parseInt(dados.IDTIPOTECIDO)||0);
        pStmt.setInt(10, parseInt(dados.IDLOCALEXPOSICAO) || 0);
        pStmt.setInt(11, parseInt(dados.IDCATEGORIAS) || 0);
        pStmt.setString(12, (dados.STECOMMERCE || 'False'));
        pStmt.setInt(13, parseInt(dados.IDCATEGORIAPEDIDO) || 0);
        pStmt.setInt(14, parseInt(dados.IDTIPOPRODUTOFISCAL));
        pStmt.setInt(15, parseInt(dados.IDFONTEPRODUTOFISAL));
        pStmt.setInt(16, parseInt(dados.IDPRODCADASTRO));
        
        pStmt.execute();
    }
    
    pStmt.close();
    
    conn.commit();
}

function atualizarTabelaProduto_RN(idDetalheProdutoPedido){
    let dadosProdutoAtualizado = getDadosDetalheProdutoPedido(idDetalheProdutoPedido);
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."PRODUTO_RN" 
        SET
            "NUNCM" = ?,
            "DSNOME" = ?,
            "UND" = ?,
            "PRECOCUSTO" = ?,
            "NUREFERENCIA" = ?,
            "STATIVO" = ?,
            "IDCOR" = ?,
            "IDTAMANHO" = ?,
            "IDTIPOTECIDO" = ?,
            "IDLOCALEXPOSICAO" = ?,
            "IDCATEGORIAS" = ?,
            "STECOMMERCE" = ?,
            "IDCATEGORIAPEDIDO" = ?,
            "IDTIPOPRODUTOFISCAL" = ?,
            "IDFONTEPRODUTOFISCAL" = ?,
            "DTULTALTERACAO" = CURRENT_TIMESTAMP
        WHERE 
            "IDPRODUTO" =  ?
    `;
  		
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for (let i = 0; i < dadosProdutoAtualizado.length; i++) {
        let dados = dadosProdutoAtualizado[i];
        
        pStmt.setInt(1, parseInt(dados.NUNCM));
        pStmt.setString(2, dados.DSNOME);
        pStmt.setString(3, dados.UND);
        pStmt.setFloat(4, parseFloat(dados.PRECOCUSTO));
        pStmt.setString(5, dados.NUREFERENCIA);
        pStmt.setString(6, dados.STATIVO);
        pStmt.setInt(7, parseInt(dados.IDCOR) || 0);
        pStmt.setInt(8, parseInt(dados.IDTAMANHO));
        pStmt.setInt(9, parseInt(dados.IDTIPOTECIDO)||0);
        pStmt.setInt(10, parseInt(dados.IDLOCALEXPOSICAO) || 0);
        pStmt.setInt(11, parseInt(dados.IDCATEGORIAS) || 0);
        pStmt.setString(12, (dados.STECOMMERCE || 'False'));
        pStmt.setInt(13, parseInt(dados.IDCATEGORIAPEDIDO) || 0);
        pStmt.setInt(14, parseInt(dados.IDTIPOPRODUTOFISCAL));
        pStmt.setInt(15, parseInt(dados.IDFONTEPRODUTOFISAL));
        pStmt.setString(16, dados.IDPRODCADASTRO);
        
        pStmt.execute();
    }
    
    pStmt.close();
    
    conn.commit();
}

function atualizarProdSAP(idDetProdPedido){
    let queryProdutos =  `
        SELECT
            TBR.IDGRUPOEMPRESARIAL AS IDGRUPOEMPRESARIAL,
            TBDPP.NUNCM AS NUNCM,
            '' AS NUCEST,
            '' AS NUCST_ICMS,
            '' AS NUCFOP,
            '' AS PERC_OUT,
            TBDPP.CODBARRAS AS NUCODBARRAS,
            TBDPP.DSPRODUTO AS DSNOME,
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
            TBDPP.DTULTATUALIZACAO AS DTULTALTERACAO,
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
            TBDPP.STCADASTRADO AS STCADASTRADO,
            TBDPP.STREPOSICAO AS STREPOSICAO,
            TBDPP.STECOMMERCE,
            TBDPP.IDPRODCADASTRO
        FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE
            TBDPP.STCANCELADO = 'False'
            AND TBDPP.IDPRODCADASTRO IS NOT NULL
            AND TBDPP.IDPRODCADASTRO <> 'NULL'
            AND TBDPP.IDDETALHEPRODUTOPEDIDO = ?
    `;

	let lstDeProdutos = api.sqlQuery(queryProdutos, idDetProdPedido);
	
	if(lstDeProdutos.length > 0){
        if(stPedidoPrimario){
            atualizarTabelaProduto_RN(lstDeProdutos, conn);
        } else {
            atualizarTabelaProduto(lstDeProdutos, conn);
        }
        
        var retIntegracaoEditProdutoPedido = libEditProdutoPedido.executeProduto(idDetProdPedido); 
	}
}

function atualizarTabelaResumoPedido(registro, qtdDetalheAlterado){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" TBR
        SET
            TBR."DTMOVPEDIDO" = CURRENT_TIMESTAMP,
            TBR."NUTOTALITENS" = (XA.TOTALITENS + XB.TOTALITENS),
            TBR."QTDTOTPRODUTOS" = (XA.QTDTOTAL + XA.QTDTOTAL),
            TBR."VRTOTALBRUTO" = (XA.VRTOTAL + XB.VRTOTAL),
            TBR."VRTOTALLIQUIDO" = (XA.VRTOTAL + XB.VRTOTAL)
        FROM 
            "VAR_DB_NAME"."RESUMOPEDIDO" TBR
        INNER JOIN (
            SELECT
                TBR.IDRESUMOPEDIDO,
                COUNT(TBD.IDDETALHEPEDIDO) AS TOTALITENS,
                SUM(IFNULL(TBD.QTDTOTAL,0)) AS QTDTOTAL,
                SUM(IFNULL(TBD.QTDTOTAL,0) * IFNULL(TBD.VRUNITLIQUIDO,0)) AS VRTOTAL
            FROM 
                "VAR_DB_NAME"."RESUMOPEDIDO" TBR
            INNER JOIN "VAR_DB_NAME"."DETALHEPEDIDO" TBD ON 
                TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO
            WHERE
                TBD.STCANCELADO = 'False'
                AND (
                        TBR.IDRESUMOPEDIDO = ${registro.IDRESUMOPEDIDO}
                    OR
                        TBR.IDPEDIDOPRIMARIO =  ${registro.IDRESUMOPEDIDO}
                )
            AND NOT EXISTS (
                SELECT 
                    1
                FROM 
                    "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
                WHERE 
                    TBDPP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
                    AND TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO
                    AND (
                            TBDPP.IDDETALHEPRODUTOPEDIDO = ${registro.IDDETALHEPRODUTOPEDIDO}
                        OR 
                            TBDPP.IDDETALHEPRODUTOPEDIDOPRIMARIO = ${registro.IDDETALHEPRODUTOPEDIDO}
                    )
                    AND TBDPP.STCANCELADO = 'False'
            )
            GROUP BY 
                TBR.IDRESUMOPEDIDO
        ) XA ON 
            TBR.IDRESUMOPEDIDO = XA.IDRESUMOPEDIDO
        INNER JOIN (
            SELECT
                TBR.IDRESUMOPEDIDO,
                1 AS TOTALITENS,
                ${qtdDetalheAlterado} AS QTDTOTAL,
                ${qtdDetalheAlterado} * MAX(TBD.VRUNITLIQUIDO) AS VRTOTAL
            FROM 
                "VAR_DB_NAME"."RESUMOPEDIDO" TBR
            INNER JOIN "VAR_DB_NAME"."DETALHEPEDIDO" TBD ON 
                TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO
            WHERE
                TBD.STCANCELADO = 'False'
                AND (
                        TBR.IDRESUMOPEDIDO = ${registro.IDRESUMOPEDIDO}
                    OR
                        TBR.IDPEDIDOPRIMARIO =  ${registro.IDRESUMOPEDIDO}
                )
            AND EXISTS (
                SELECT 
                    1
                FROM 
                    "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
                WHERE 
                    TBDPP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
                    AND TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO
                    AND (
                            TBDPP.IDDETALHEPRODUTOPEDIDO = ${registro.IDDETALHEPRODUTOPEDIDO}
                        OR 
                            TBDPP.IDDETALHEPRODUTOPEDIDOPRIMARIO = ${registro.IDDETALHEPRODUTOPEDIDO}
                    )
                    AND TBDPP.STCANCELADO = 'False'
            )
            GROUP BY 
                TBR.IDRESUMOPEDIDO
        ) XB ON 
            TBR.IDRESUMOPEDIDO = XB.IDRESUMOPEDIDO
        WHERE 
            TBR.IDRESUMOPEDIDO = XA.IDRESUMOPEDIDO 
            AND TBR.IDRESUMOPEDIDO = XB.IDRESUMOPEDIDO
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function atualizarTabelaDetalheGrade(registro){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        SET 
            TBDG.QTD = ?,
            TBDG.IDTAMANHO = ?
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDPP ON 
            TBDG.IDDETALHEPEDIDO = TBDPP.IDDETALHEPEDIDO AND TBDG.IDTAMANHO = TBDPP.IDTAMANHO
        WHERE
            TBDG.STATIVO = 'True'
            AND (
                    TBDPP.IDDETALHEPRODUTOPEDIDO = ? 
                OR 
                    TBDPP.IDDETALHEPRODUTOPEDIDOPRIMARIO = ?
            )
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setFloat(1, Number(registro.QTDPRODUTO));
    pStmt.setInt(2, parseInt(registro.IDTAMANHO));
    pStmt.setInt(3, parseInt(registro.IDDETALHEPRODUTOPEDIDO));
    pStmt.setInt(4, parseInt(registro.IDDETALHEPRODUTOPEDIDO));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function atualizarTabelaDetalhePedido(registro, qtdDetalheAlterado){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDO TBD 
        SET
            TBD.QTDTOTAL = ?,
            TBD.VRTOTAL = (${qtdDetalheAlterado} * TBD.VRUNITLIQUIDO)
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO TBD 
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDPP ON 
            TBD.IDDETALHEPEDIDO = TBDPP.IDDETALHEPEDIDO AND TBR.IDRESUMOPEDIDO = TBDPP.IDRESUMOPEDIDO
        WHERE
            TBD.STCANCELADO = 'False'
            AND TBDPP.STCANCELADO = 'False'
            AND (
                    TBDPP.IDDETALHEPRODUTOPEDIDO = ?
                OR 
                    TBDPP.IDDETALHEPRODUTOPEDIDOPRIMARIO = ?
            )
    `;
    //return { query }
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setFloat(1, Number(qtdDetalheAlterado));
    pStmt.setInt(2, parseInt(registro.IDDETALHEPRODUTOPEDIDO));
    pStmt.setInt(3, parseInt(registro.IDDETALHEPRODUTOPEDIDO));
    
    pStmt.execute();
    pStmt.close();
}

function atualizarTabelaDetalheProdutoPedido(registro) {
    let steditcomp = 'True';
    let vrTotalCusto = Number(registro.QTDPRODUTO) * Number(registro.VRCUSTO);
    
    let query = `
        UPDATE
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        SET
            TBDPP."IDCOR" = ?,
            TBDPP."IDTAMANHO" = ?,
            TBDPP."DSTAMANHO" = ?,
            TBDPP."IDTIPOTECIDO" = ?,
            TBDPP."IDLOCALEXPOSICAO" = ?,
            TBDPP."IDCATEGORIAS" = ?,
            TBDPP."NUNCM" = ?,
            TBDPP."IDTIPOPRODUTOFISCAL" = ?,
            TBDPP."IDFONTEPRODUTOFISAL" = ?,
            TBDPP."NUREF" = ?,
            TBDPP."DSPRODUTO" = ?,
            TBDPP."UND" = ?,
            TBDPP."QTDPRODUTO" = ?,
            TBDPP."VRCUSTO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBDPP."VRTOTALCUSTO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBDPP."DTULTATUALIZACAO" = CURRENT_TIMESTAMP,
            TBDPP."STECOMMERCE" = ?,
            TBDPP."STREDESOCIAL" = ?,
            TBDPP."STEDITADOCOMPRAS" = ?,
            TBDPP."IDCATEGORIAPEDIDO" = ?,
            TBDPP."STCADASTRADO" = (
                CASE 
                    WHEN IFNULL(TBP.IDPRODUTO, TBP_RN.IDPRODUTO) IS NOT NULL THEN 'True'
                    ELSE 'False'
                END
            )
        FROM 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON 
            TBDPP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        LEFT JOIN "VAR_DB_NAME"."PRODUTO" TBP ON 
            TBDPP.IDPRODCADASTRO = TBP.IDPRODUTO
        LEFT JOIN "VAR_DB_NAME"."PRODUTO_RN" TBP_RN ON 
            TBDPP.IDPRODCADASTRO = TBP_RN.IDPRODUTO
        WHERE 
            TBDPP.IDDETALHEPRODUTOPEDIDO = ? 
            OR TBDPP.IDDETALHEPRODUTOPEDIDOPRIMARIO = ?
    `;
  
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, registro.IDCOR);
    pStmt.setInt(2, registro.IDTAMANHO);
    pStmt.setString(3, registro.DSTAMANHO);
    pStmt.setInt(4, registro.IDTIPOTECIDO);
    pStmt.setInt(5, registro.IDLOCALEXPOSICAO);
    pStmt.setInt(6, registro.IDCATEGORIAS);
    pStmt.setString(7, registro.NUNCM);
    pStmt.setInt(8, registro.IDTIPOPRODUTOFISCAL);
    pStmt.setInt(9, registro.IDFONTEPRODUTOFISAL);
    pStmt.setString(10, registro.NUREF);
    pStmt.setString(11, registro.DSPRODUTO);
    pStmt.setString(12, registro.UND);
    pStmt.setFloat(13, registro.QTDPRODUTO);
    pStmt.setFloat(14, registro.VRCUSTO);
    pStmt.setFloat(15, vrTotalCusto);
    pStmt.setString(16, registro.STECOMMERCE);
    pStmt.setString(17, registro.STREDESOCIAL);
    pStmt.setString(18, steditcomp);
    pStmt.setInt(19, registro.IDCATEGORIAPEDIDO);
    pStmt.setInt(20, registro.IDDETALHEPRODUTOPEDIDO);
    pStmt.setInt(21, registro.IDDETALHEPRODUTOPEDIDO);
    
    pStmt.executeUpdate();
	pStmt.close();
}

function atualizarDadosPedido(registro) {
    let qtdDetalheAlterado = getQtdGradeDetalhePedidoAtualizada(registro.IDDETALHEPRODUTOPEDIDO, registro.IDTAMANHO, registro.QTDPRODUTO);
    
    atualizarTabelaDetalheProdutoPedido(registro);
    
    atualizarTabelaDetalheGrade(registro);
    
    atualizarTabelaDetalhePedido(registro, qtdDetalheAlterado);
    
    atualizarTabelaResumoPedido(registro, qtdDetalheAlterado);
}

function fnHandleGet(byId) {
    let idDetPedidoProd = $.request.parameters.get("idDetPedidoProd");

    let query =  `
        SELECT 
            DTP.IDRESUMOPEDIDO, 
            tbdp.IDDETALHEPRODUTOPEDIDO, 
            tbdp.IDDETALHEPEDIDO, 
            SE.IDGRUPOESTRUTURA, 
            tbdp.IDSUBGRUPOESTRUTURA, 
            SE.DSSUBGRUPOESTRUTURA, 
            tbdp.IDCOR, 
            TRIM(CR.DSCOR) AS DSCOR, 
            tbdp.IDTAMANHO, 
            tbdp.DSTAMANHO, 
            tbdp.IDCATEGORIAPEDIDO, 
            CP.TIPOPEDIDO, 
            tbdp.IDTIPOTECIDO, 
            TBT.DSTIPOTECIDO, 
            tbdp.IDESTILO, 
            ES.DSESTILO, 
            tbdp.IDFABRICANTE, 
            FB.DSFABRICANTE, 
            tbdp.IDLOCALEXPOSICAO, 
            LE.DSLOCALEXPOSICAO, 
            CS.IDCATEGORIAS, 
            CS.DSCATEGORIAS, 
            CS.TPCATEGORIAS, 
            tbdp.IDNCM, 
            tbdp.NUNCM, 
            tbdp.IDCEST, 
            tbdp.NUCEST, 
            tbdp.IDTIPOPRODUTOFISCAL, 
            TF.CODTIPOFISCALPRODUTO, 
            TF.DSTIPOFISCALPRODUTO, 
            tbdp.IDFONTEPRODUTOFISAL, 
            TPF.CODTIPOPRODUTO, 
            TPF.DSTIPOPRODUTO, 
            tbdp.IDPRODCADASTRO, 
            tbdp.NUREF, 
            tbdp.CODBARRAS, 
            tbdp.DSPRODUTO, 
            tbdp.QTDPRODUTO, 
            UN.IDUNIDADEMEDIDA, 
            TRIM(tbdp.UND) AS UND, 
            tbdp.VRCUSTO, 
            tbdp.VRVENDA, 
            tbdp.VRTOTALCUSTO, 
            tbdp.VRTOTALVENDA, 
            TO_VARCHAR( tbdp.DTCADASTRO, 'DD-MM-YYYY') AS DTCADASTROFORMAT, 
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
            tbdp.STAVULSO, 
            tbdp.IDGRUPOEMPRESARIAL,
            GE.DSGRUPOEMPRESARIAL,
            tbdp.IDFORNECEDOR, 
            FN.NORAZAOSOCIAL, 
            FN.NOFANTASIA,
            FN.NUCNPJ 
        FROM 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO tbdp 
        LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO DTP ON 
            tbdp.IDDETALHEPEDIDO = DTP.IDDETALHEPEDIDO  
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
        LEFT JOIN "VAR_DB_NAME".VINCFABRICANTEFORN VFN ON 
            FB.IDFABRICANTE = VFN.IDFABRICANTE  
        LEFT JOIN "VAR_DB_NAME".FORNECEDOR FN ON 
            VFN.IDFORNECEDOR = FN.IDFORNECEDOR  
        LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL GE ON 
            tbdp.IDGRUPOEMPRESARIAL = GE.IDGRUPOEMPRESARIAL  
        LEFT JOIN "VAR_DB_NAME".TIPOFISCALPRODUTO TF ON 
            tbdp.IDTIPOPRODUTOFISCAL = TF.IDTIPOFISCALPRODUTO  
        LEFT JOIN "VAR_DB_NAME".TIPOPRODUTO TPF ON 
            tbdp.IDFONTEPRODUTOFISAL = TPF.IDTIPOPRODUTO  
        WHERE
            1 = ? 
    `;
    
    if ( byId ) {
        query += ` AND tbdp.IDDETALHEPRODUTOPEDIDO = '${byId}' `;
    }
    if ( idDetPedidoProd ) {
        query += ` AND tbdp.IDDETALHEPRODUTOPEDIDO = '${idDetPedidoProd}' `;
    }
    
    query += ' ORDER BY tbdp.DTCADASTRO DESC';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    //return bodyJson
    conn = $.db.getConnection();

    for (let registro of bodyJson) {
        let stPedidoRN = registro.STPEDIDOPRIMARIO == 'True';
        let successValidacao = false;
        let msgValidacao = '';
        let stEditarItemPedidoSAP = false;
        
        if(stPedidoRN){
            let {success, stEditarSAP, msg } = validarSeAptoParaEditarQuandoPedidoRN(registro);
            
            stEditarItemPedidoSAP = stEditarSAP;
            successValidacao = success;
            msgValidacao = msg;
            
        } else {
            let {success, stEditarSAP, msg } = validarSeAptoParaEditarSapQuandoPedidoPadrao(registro);
            
            stEditarItemPedidoSAP = stEditarSAP;
            successValidacao = success;
            msgValidacao = msg;
            
        }
        
        if(!successValidacao){
            registrarErrorLog(registro.IDDETALHEPRODUTOPEDIDO, msgValidacao);
            
            return returnWarning(msgValidacao);
        }
        //return registro
        //let arrayResp = []
        if(stEditarItemPedidoSAP){
            let dadosItensParaEditar = getDadosItemPedidoParaEditarSAP(registro);
            
            for(let dadosItem of dadosItensParaEditar){
                /*let resp = libEditItemPedido.editarItemPedidoSAP(dadosItem.DOCENTRY, dadosItem);
                arrayResp.push(resp);
                continue;*/
                let { success, msg } = libEditItemPedido.editarItemPedidoSAP(dadosItem.DOCENTRY, dadosItem);
                
                if(!success){
                    registrarErrorLog(registro.IDDETALHEPRODUTOPEDIDO, msg);
                    
                    return returnWarning(msg);
                }
            }
        }
        //return arrayResp
		atualizarDadosPedido(registro);
    }
    
    conn.commit();
	
    return {
        "msg": "Edição realizado com sucesso!"
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