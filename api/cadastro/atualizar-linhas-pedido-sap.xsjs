let api = $.import("quality.concentrador_homologacao.api", "apiResponse");
let libAtualizar = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.libs.alteracao-pedido.itens", "atualizar-todos-itens-pedido");

let dbNameSAP = 'SBO_GTO_TESTE4';
let success = true;
let conn;

let arrayIdsFuncionariosAutorizados = [
    632, //IZANA
    1459, // YAGO
    2006
];

function registrarSuccessLog(idResumoPedido){
    registrarSuccessLogResumoPedido(idResumoPedido);
    registrarSuccessLogDetalheProdutoPedido(idResumoPedido);
    
    conn.commit();
}

function registrarSuccessLogResumoPedido(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET 
            LOGSAP = NULL,
            IDANDAMENTO = 5
        WHERE 
            IDRESUMOPEDIDO = ?
            OR IDPEDIDOPRIMARIO = ?
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setInt(1, Number(idResumoPedido));
	pStmt.setInt(2, Number(idResumoPedido));
	
	pStmt.executeUpdate();
	pStmt.close();
}

function registrarSuccessLogDetalheProdutoPedido(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDP
        SET 
            TBDP.ERRORLOGSAP = NULL,
            TBDP.STLINHAPRODUTOMIGRADAPARAPEDIDOSAP = 'True'
        FROM 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDP
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON
            TBDP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE 
            TBR.IDRESUMOPEDIDO = ?
            OR TBR.IDPEDIDOPRIMARIO = ?
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setInt(1, Number(idResumoPedido));
	pStmt.setInt(2, Number(idResumoPedido));
	
	pStmt.executeUpdate();
	pStmt.close();
}

function registrarErrorLog(idResumoPedido, msgError){
    registrarErrorLogResumoPedido(idResumoPedido, msgError);
    registrarErrorLogDetalheProdutoPedido(idResumoPedido, msgError)
    
    conn.commit();
}

function registrarErrorLogResumoPedido(idResumoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET 
            LOGSAP = ? 
        WHERE 
            IDRESUMOPEDIDO = ?
            OR IDPEDIDOPRIMARIO = ?
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idResumoPedido));
	pStmt.setInt(3, Number(idResumoPedido));
	
	pStmt.executeUpdate();
	pStmt.close();
}

function registrarErrorLogDetalheProdutoPedido(idResumoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDP
        SET 
            TBDP.ERRORLOGSAP = ?,
            TBDP.STLINHAPRODUTOMIGRADAPARAPEDIDOSAP = 'False'
        FROM 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDP
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON
            TBDP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE 
            TBR.IDRESUMOPEDIDO = ?
            OR TBR.IDPEDIDOPRIMARIO = ?
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
	
    pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idResumoPedido));
	pStmt.setInt(3, Number(idResumoPedido));
	
	pStmt.executeUpdate();
	pStmt.close();
}

// Return Warning

function returnWarning(msg){
    $.response.status = 400;
    
    return {
        msg
    }
}

// Get de Dados

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

function getDadosPedidos(registro){
    let query = `
        SELECT
            TBO."DocEntry" AS DOCENTRY,
            TBR.IDRESUMOPEDIDO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN ${dbNameSAP}.OPOR TBO ON
            TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV" AND TBO."CANCELED" = 'N'
        WHERE
            TBR.STCANCELADO = 'False'
            AND (
                    TBR.IDRESUMOPEDIDO = ${registro.IDRESUMOPEDIDO} AND TBR.IDPEDIDOPRIMARIO IS NULL
                OR
                    TBR.IDPEDIDOPRIMARIO = ${registro.IDRESUMOPEDIDO}
            )
            AND 1 = ?
        GROUP BY 
            TBR.IDRESUMOPEDIDO,
            TBO."DocEntry"
        ORDER BY 
            TBR.IDRESUMOPEDIDO
    `;
    
    return api.sqlQuery(query, 1);
}

function getDadosProdutoPedidoEntreQualitySAP(idResumoPedido, idDetalhePedido){
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
                TBDP.IDDETALHEPEDIDO,
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
        SELECT DISTINCT
            SAP."DocEntryNotaEntrada"
        FROM 
            SAP
        LEFT JOIN APP ON 
            SAP."ItemCode" = TO_VARCHAR(APP.IDPRODCADASTRO) AND SAP.LINHA_SAP = APP.LINHA_APP /*AND SAP."Quantity" = APP.QTDPRODUTO */
        WHERE
            APP.IDDETALHEPEDIDO = ${idDetalhePedido}
            AND 1 = ?
        /*ORDER BY 
            SAP."LineNum"*/
    `;
    
    return api.sqlQuery(query, 1);
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
        SELECT DISTINCT
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
                WHEN SAP."VrTotalPedido" <> ROUND(APP."VrTotalPedido", 2) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteVrTotalEntrePedidos"
        FROM 
            SAP
        LEFT JOIN APP ON 
            SAP."ItemCode" = TO_VARCHAR(APP.IDPRODCADASTRO) /*AND SAP."Quantity" = APP.QTDPRODUTO*/ AND SAP.LINHA_SAP = APP.LINHA_APP
        WHERE
            1 = ?
        /*ORDER BY 
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
        */
    `;

	return api.sqlQuery(query, 1);
}

function getValidacoesEntrePedidoPrimarioSecundario(idResumoPedido){
    let query = `
        WITH PEDIDOPRIMARIO AS (
            SELECT
                TBR.IDRESUMOPEDIDO,
                TBD.IDDETALHEPEDIDO,
                TBD.VRUNITLIQUIDO AS "VrCustoUnitarioItem",
                TBD.QTDTOTAL AS "QtdTotalItem",
                TBD.VRTOTAL AS "VrTotalItem",
                COUNT(TBD.IDDETALHEPEDIDO) OVER ( PARTITION BY TBR.IDRESUMOPEDIDO ) AS "QtdTotalItens",
                TBDP.IDDETALHEPRODUTOPEDIDO,
                TBDP.IDPRODCADASTRO,
                TBDP.QTDPRODUTO AS "QtdProdutoLinha",
                TBDP.VRCUSTO AS "VrPrecoLinha",
                COUNT(TBDP.IDDETALHEPRODUTOPEDIDO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "QtdTotalLinhas",
                SUM(TBDP.VRTOTALCUSTO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "VrTotalPedido"
            FROM 
                "VAR_DB_NAME".RESUMOPEDIDO TBR
            INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON 
                TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO AND TBD.STCANCELADO = 'False'
            LEFT JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON 
                TBR.IDRESUMOPEDIDO = TBDP.IDRESUMOPEDIDO AND TBD.IDDETALHEPEDIDO = TBDP.IDDETALHEPEDIDO AND TBDP.STCANCELADO = 'False'
            WHERE 
                TBR.STCANCELADO = 'False'
                AND TBR.IDRESUMOPEDIDO = ${idResumoPedido}
        ),
        PEDIDOSECUNDARIO AS (
            SELECT
                TBR.IDRESUMOPEDIDO,
                TBD.IDDETALHEPEDIDOPRIMARIO,
                TBR.FATOR_ACRESCIMO_COMPRA,
                TBD.VRUNITLIQUIDO AS "VrCustoUnitarioItem",
                TBD.QTDTOTAL AS "QtdTotalItem",
                TBD.VRTOTAL AS "VrTotalItem",
                COUNT(TBD.IDDETALHEPEDIDO) OVER ( PARTITION BY TBR.IDRESUMOPEDIDO ) AS "QtdTotalItens",
                TBDP.IDDETALHEPRODUTOPEDIDOPRIMARIO,
                TBDP.IDPRODCADASTRO,
                TBDP.QTDPRODUTO AS "QtdProdutoLinha",
                TBDP.VRCUSTO AS "VrPrecoLinha",
                COUNT(TBDP.IDDETALHEPRODUTOPEDIDO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "QtdTotalLinhas",
                SUM(TBDP.VRTOTALCUSTO) OVER ( PARTITION BY TBDP.IDRESUMOPEDIDO ) AS "VrTotalPedido"
            FROM 
                "VAR_DB_NAME".RESUMOPEDIDO TBR
            INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON 
                TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO AND TBD.STCANCELADO = 'False'
            LEFT JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON 
                TBR.IDRESUMOPEDIDO = TBDP.IDRESUMOPEDIDO AND TBD.IDDETALHEPEDIDO = TBDP.IDDETALHEPEDIDO AND TBDP.STCANCELADO = 'False'
            WHERE 
                TBR.STCANCELADO = 'False'
                AND TBR.IDPEDIDOPRIMARIO = ${idResumoPedido}
        )
        SELECT DISTINCT
            CASE 
                WHEN (PEDIDOPRIMARIO."VrCustoUnitarioItem" * IFNULL(PEDIDOSECUNDARIO.FATOR_ACRESCIMO_COMPRA, 1)) <> PEDIDOSECUNDARIO."VrCustoUnitarioItem" THEN 'Y'
                ELSE 'N'
            END AS "IsDivergentePrecoUnitarioItemEntrePedidos",
            CASE 
                WHEN PEDIDOPRIMARIO."QtdTotalItem" <> PEDIDOSECUNDARIO."QtdTotalItem" THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteQuantidadeItemEntrePedidos",
            CASE 
                WHEN (PEDIDOPRIMARIO."VrTotalItem" * IFNULL(PEDIDOSECUNDARIO.FATOR_ACRESCIMO_COMPRA, 1)) <> PEDIDOSECUNDARIO."VrTotalItem" THEN 'Y'
                ELSE 'N'
            END AS "IsDivergentePrecoTotalItemEntrePedidos",
            CASE 
                WHEN PEDIDOPRIMARIO."QtdTotalItens" <> IFNULL(PEDIDOSECUNDARIO."QtdTotalItens", 0) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteTotalItensEntrePedidos",
            CASE 
                WHEN (PEDIDOPRIMARIO."VrPrecoLinha" * IFNULL(PEDIDOSECUNDARIO.FATOR_ACRESCIMO_COMPRA, 1)) <> PEDIDOSECUNDARIO."VrPrecoLinha" THEN 'Y'
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
                WHEN ROUND(PEDIDOPRIMARIO."VrTotalPedido" * IFNULL(PEDIDOSECUNDARIO.FATOR_ACRESCIMO_COMPRA,  1), 2) <> ROUND(PEDIDOSECUNDARIO."VrTotalPedido", 2) THEN 'Y'
                ELSE 'N'
            END AS "IsDivergenteVrTotalEntrePedidos"
        FROM 
            PEDIDOPRIMARIO
        INNER JOIN PEDIDOSECUNDARIO ON 
            PEDIDOPRIMARIO.IDDETALHEPEDIDO = PEDIDOSECUNDARIO.IDDETALHEPEDIDOPRIMARIO AND IFNULL(PEDIDOPRIMARIO.IDDETALHEPRODUTOPEDIDO, 0) = IFNULL(PEDIDOSECUNDARIO.IDDETALHEPRODUTOPEDIDOPRIMARIO, 0) 
        WHERE
            1 = ?
    `;
    
	return api.sqlQuery(query, 1);
}

// Validação

function validarDadosPedidoEntreQualitySAP(idResumoPedido){
    let isValidPedidoSAP = false;
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
                IsPedidoComLinhaFechadaSemRecepcao, 
                IsDivergentePrecoPorLinhaEntrePedidos/*, 
                IsDivergenteQtdPorLinhaEntrePedidos, 
                IsDivergenteTotalLinhasEntrePedidos, 
                IsDivergenteVrTotalEntrePedidos*/ 
            } = registro;
            let arrayCondicoesDivergentes = [
                IsPedidoFechado,
                IsPedidoComLinhaFechadaSemRecepcao,
                IsDivergentePrecoPorLinhaEntrePedidos/*, 
                IsDivergenteQtdPorLinhaEntrePedidos,
                IsDivergenteTotalLinhasEntrePedidos,
                IsDivergenteVrTotalEntrePedidos*/
            ];
            let idMotivo = arrayCondicoesDivergentes.findIndex(v => v == "Y");
            
            if(idMotivo != -1){
                let motivo =  arrayMotivos[idMotivo];
                
                return {
                    msgWarningPedido: `Não é possível devolver, ${motivo}`,
                    isValidPedidoSAP,
                    existPedidoSAP
                };
            }
            
        }
        
        isValidPedidoSAP = true;
	}
	
	return { isValidPedidoSAP, existPedidoSAP };
}

function validarPedidoPrimarioComSecundario(idResumoPedido){
    let isValidPedidosPrimarioSecundario = false;
    let existPedidosPrimarioSecundario = false;
    let msgValidacaoPedidosPrimarioSecundario = '';
    let regValidacoes = getValidacoesEntrePedidoPrimarioSecundario(idResumoPedido);
    let arrayMotivos = [
        'Valores de custo unitário dos itens divergente entre Pedidos Primario e Secundario no Quality',
        'Quantidades de itens divergente entre Pedidos Primario e Secundario no Quality',
        'Valores totais de itens divergentes entre Pedidos Primario e Secundario no Quality',
        'Quantidades de linhas de itens divergentes entre Pedidos Primario e Secundario no Quality',
        'Preços de produtos das linhas divergente entre Pedidos Primario e Secundario no Quality',
        'Quantidades de produtos das linhas divergente entre Pedidos Primario e Secundario no Quality',
        'Quantidade de linhas divergente entre Pedidos Primario e Secundario no Quality',
        'Valores totais divergentes entre Pedidos Primario e Secundario no Quality',
    ];
	
	if(regValidacoes.length > 0){
        existPedidosPrimarioSecundario = true;
        
        for( let reg of regValidacoes) {
            let {
                IsDivergentePrecoUnitarioItemEntrePedidos,
                IsDivergenteQuantidadeItemEntrePedidos,
                IsDivergentePrecoTotalItemEntrePedidos,
                IsDivergenteTotalItensEntrePedidos,
                IsDivergentePrecoPorLinhaEntrePedidos, 
                IsDivergenteQtdPorLinhaEntrePedidos, 
                IsDivergenteTotalLinhasEntrePedidos, 
                IsDivergenteVrTotalEntrePedidos 
            } = reg;
            let arrayCondicoesDivergentes = [
                IsDivergentePrecoUnitarioItemEntrePedidos,
                IsDivergenteQuantidadeItemEntrePedidos,
                IsDivergentePrecoTotalItemEntrePedidos,
                IsDivergenteTotalItensEntrePedidos,
                IsDivergentePrecoPorLinhaEntrePedidos, 
                IsDivergenteQtdPorLinhaEntrePedidos, 
                IsDivergenteTotalLinhasEntrePedidos, 
                IsDivergenteVrTotalEntrePedidos 
            ];
            let idMotivo = arrayCondicoesDivergentes.findIndex(v => v == "Y" );
            
            if(idMotivo != -1){
                let motivo =  arrayMotivos[idMotivo];
                
                return {
                    msgValidacaoPedidosPrimarioSecundario: `Não é possível devolver: ${motivo}`,
                    isValidPedidosPrimarioSecundario,
                    existPedidosPrimarioSecundario
                };
            }
            
        }
        
        isValidPedidosPrimarioSecundario = true;
	} else {
	    msgValidacaoPedidosPrimarioSecundario = 'Não é possível devolver, Pedido Primario ou Secundario não encontrado no Quality';
	}
	
	return { isValidPedidosPrimarioSecundario, existPedidosPrimarioSecundario, msgValidacaoPedidosPrimarioSecundario };
}

function validarSeAptoParaDevolverSapQuandoPedidoPadrao(dadosProdutoPedido){
    let { IDRESUMOPEDIDO, IDDETALHEPEDIDO } = dadosProdutoPedido;
    let { existPedidoSAP, isValidPedidoSAP, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(IDRESUMOPEDIDO);
    let msg = msgWarningPedido || '';
    let success = !msg.length;
    let stValidoSAP = !msg.length;
    
    return {
        success,
        stValidoSAP,
        msg
    }
}

function validarSeAptoParaDevolverSapQuandoPedidoRN(idResumoPedidoPrimario, dadosProdutosPedidos){
    let { 
        existPedidosPrimarioSecundario, 
        isValidPedidosPrimarioSecundario, 
        msgValidacaoPedidosPrimarioSecundario 
    } = validarPedidoPrimarioComSecundario(idResumoPedidoPrimario);
    
    let idPedidoPrimario;
    let idPedidoSecundario;
    
    let stValidoSAP = false;
    let ultimoEstadoExistPedidoSAP = null;
    let ultimoEstadoIsValidPedidoSAP = null;
    let ultimoEstadoMsgWarningPedido = null;
    
    if(!isValidPedidosPrimarioSecundario){
        return returnWarning(msgValidacaoPedidosPrimarioSecundario);
    }
    
    for(let i = 0; i < dadosProdutosPedidos.length; i++){
        let registro = dadosProdutosPedidos[i]
        let { existPedidoSAP, isValidPedidoSAP, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(registro.IDRESUMOPEDIDO);
        let stPrimario = i == 0;
        
        if(stPrimario){
            idPedidoPrimario = registro.IDRESUMOPEDIDO;
            ultimoEstadoExistPedidoSAP = existPedidoSAP;
            ultimoEstadoIsValidPedidoSAP = isValidPedidoSAP;
            ultimoEstadoMsgWarningPedido = msgWarningPedido || '';
        } else {
            idPedidoSecundario = registro.IDRESUMOPEDIDO;
        }
        
        let label = (isPrimario) => `Pedido ${isPrimario ? 'Primario' : 'Secundario'} (${isPrimario ? idPedidoPrimario : idPedidoSecundario}): `;
        let msg = msgWarningPedido ? label(stPrimario) + msgWarningPedido : '';
        
        if(!msg.length && ultimoEstadoExistPedidoSAP != existPedidoSAP){
            return {
                success: false,
                msg: label(!ultimoEstadoExistPedidoSAP) + 'Não migrado'
            };
        }
        
        if(!msg.length && ultimoEstadoIsValidPedidoSAP != isValidPedidoSAP){
            return {
                success: false,
                msg: label(!ultimoEstadoExistPedidoSAP) + 'Não migrado'
            };
        }
    }
    
    return {
        success: true,
        stValidoSAP
    }
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    if(bodyJson.length > 0){
        conn = $.db.getConnection();
        
        for(let registro of bodyJson){
            
            let stPedidoRN = getStPedidoRN(registro.IDRESUMOPEDIDO);
            let listaPedidos = getDadosPedidos(registro);
            let successValidacao = false;
            let stValidoSAPValidacao = false;
            let msgValidacao = '';
            //return { registro, stPedidoRN, listaPedidos}
            
            if(listaPedidos.length){
                
                if(stPedidoRN){
                    if(listaPedidos.length > 2){
                        return returnWarning('Pedido Primario ou Secundario com duplicidade de numeração no SAP');
                    }
                    
                    let { success, stValidoSAP, msg } = validarSeAptoParaDevolverSapQuandoPedidoRN(registro.IDRESUMOPEDIDO, listaPedidos);
                    
                    //return validarSeAptoParaDevolverSapQuandoPedidoRN(registro.IDRESUMOPEDIDO, listaPedidos);
                    
                    stValidoSAPValidacao = stValidoSAP;
                    successValidacao = success;
                    msgValidacao = msg;
                    
                } else {
                    if(listaPedidos.length > 1){
                        return returnWarning('Pedido com duplicidade de numeração no SAP');
                    }
                    
                    let { success, stValidoSAP, msg } = validarSeAptoParaDevolverSapQuandoPedidoPadrao(listaPedidos[0]);
                    
                    stValidoSAPValidacao = stValidoSAP;
                    successValidacao = success;
                    msgValidacao = msg;
                    
                }
                
                if(!successValidacao){
                    registrarErrorLog(registro.IDRESUMOPEDIDO, msgValidacao);
                    
                    return returnWarning(msgValidacao);
                }
                //let arrayResp = [];
                for(let pedido of listaPedidos){
                    //return listaPedidos
                    //let resp = libAtualizar.atualizarTodosItensPedido(pedido.DOCENTRY, pedido.IDRESUMOPEDIDO);
                    //arrayResp.push({idPedido: pedido.IDRESUMOPEDIDO, resp});
                    //continue;
                    let { success, msg } = libAtualizar.atualizarTodosItensPedido(pedido.DOCENTRY, pedido.IDRESUMOPEDIDO);
                    //return respCancel
                    if(!success){
                        registrarErrorLog(pedido.IDRESUMOPEDIDO, msg);
                        
                        return returnWarning(msg);
                    }
                    
                }
                
                registrarSuccessLog(registro.IDRESUMOPEDIDO);
                //return arrayResp
            } else {
                return returnWarning('Dados não encontrados, pedido não migrado ou cancelado');
            }
            
        }
        
    }
    
    return {
        "msg": "Pedido atualizado com sucesso!"
    };
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your PUT calls here
        case $.net.http.PUT:
            var result = fnHandlePut();
            
            $.response.setBody(JSON.stringify(result));
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
