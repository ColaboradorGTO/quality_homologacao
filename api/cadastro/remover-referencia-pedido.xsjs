let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let libRemove = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.libs.alteracao-pedido.itens", "remover-itens-por-grade-pedido");

let dbNameSAP = 'SBO_GTO_TESTE4';
let success = true;
let conn;

// Registrar Sucesso/Error no BD

function registrarErrorLog(idDetalhePedido, msgError = 'Erro ao cancelar a Referencia no SAP'){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDDETALHEPEDIDO IN (
                SELECT
                    XA.IDDETALHEPEDIDO
                FROM
                    "VAR_DB_NAME".DETALHEPEDIDO XA
                WHERE
                    XA.STCANCELADO = 'False'
                    AND (
                            XA.IDDETALHEPEDIDO = ?
                        OR
                            XA.IDDETALHEPEDIDOPRIMARIO = ?
                    )
            )
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idDetalhePedido));
	pStmt.setInt(3, Number(idDetalhePedido));
	
	pStmt.executeUpdate();
	pStmt.close();
	
	conn.commit();
}

function registrarErrorLogDetalhePedido(idDetalhePedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" 
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDDETALHEPEDIDO IN (
                SELECT
                    XA.IDDETALHEPEDIDO
                FROM
                    "VAR_DB_NAME".DETALHEPEDIDO XA
                WHERE
                    XA.STCANCELADO = 'False'
                    AND (
                            XA.IDDETALHEPEDIDO = ?
                        OR
                            XA.IDDETALHEPEDIDOPRIMARIO = ?
                    )
            )
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idDetalhePedido));
	pStmt.setInt(3, Number(idDetalhePedido));
	
	pStmt.executeUpdate();
	pStmt.close();
	
	conn.commit();
}

function registrarErrorLogDetalheProdutoPedido(idDetalhePedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDDETALHEPEDIDO IN (
                SELECT
                    XA.IDDETALHEPEDIDO
                FROM
                    "VAR_DB_NAME".DETALHEPEDIDO XA
                WHERE
                    XA.STCANCELADO = 'False'
                    AND (
                            XA.IDDETALHEPEDIDO = ?
                        OR
                            XA.IDDETALHEPEDIDOPRIMARIO = ?
                    )
            )
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idDetalhePedido));
	pStmt.setInt(3, Number(idDetalhePedido));
	
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

function getValoresAtualizadosDoPedido(idResumoPedido, idDetalhePedido){
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

function getDadosReferenciasParaRemoverPedido(dados){
    let query = `
        SELECT
            TBO."DocEntry" AS DOCENTRY,
            TBDP.IDRESUMOPEDIDO,
            TBDP.IDDETALHEPEDIDO,
            SUM(TBDP.QTDPRODUTO) AS QTDTOTALPRODUTOS,
            SUM(TBDP.VRTOTALCUSTO) AS VRTOTALCUSTO,
            '${dados.STCANCELADO}' AS STCANCELADO,
            '${dados.IDRESPCANCELAMENTO}' AS IDRESPCANCELAMENTO,
            '${dados.TXTOBSCANCELAMENTO}' AS TXTOBSCANCELAMENTO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON
            TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO
        INNER JOIN  "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON 
            TBD.IDDETALHEPEDIDO = TBDP.IDDETALHEPEDIDO 
        LEFT JOIN ${dbNameSAP}.OPOR TBO ON
            TO_VARCHAR(TBDP.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
        WHERE
            TBD.STCANCELADO = 'False'
            AND TBDP.STATIVO =  'True'
            AND TBDP.STCANCELADO = 'False'
            AND IFNULL(TBDP.IDPRODCADASTRO, 'NULL') <> 'NULL'
            AND (
                    TBR.IDRESUMOPEDIDO = ${dados.IDRESUMOPEDIDO} AND TBD.IDDETALHEPEDIDO = ${dados.IDDETALHEPEDIDO} AND TBR.IDPEDIDOPRIMARIO IS NULL
                OR
                    TBR.IDPEDIDOPRIMARIO = ${dados.IDRESUMOPEDIDO} AND TBD.IDDETALHEPEDIDOPRIMARIO = ${dados.IDDETALHEPEDIDO}
            )
            AND 1 = ?
        GROUP BY 
            TBO."DocEntry",
            TBDP.IDRESUMOPEDIDO,
            TBDP.IDDETALHEPEDIDO
        ORDER BY 
            TBDP.IDRESUMOPEDIDO
    `;
    
    return api.sqlQuery(query, 1);
}

function getDadosDetalhePedido(idDetalhePedido){
    let query = `
        SELECT
            TBD.QTDTOTAL,
            TBD.VRTOTAL
        FROM    
            "VAR_DB_NAME".DETALHEPEDIDO TBD
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON
            TBD.IDDETALHEPEDIDO = TBDP.IDDETALHEPEDIDO
        WHERE
            TBD.STCANCELADO = 'False'
            AND TBDP.STCANCELADO = 'False'
            AND TBDP.IDDETALHEPEDIDO = ${idDetalhePedido}
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
                WHEN SAP."VrTotalPedido" <> IFNULL(APP."VrTotalPedido", 0) THEN 'Y'
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
        SELECT DISTINCT
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
        /*ORDER BY 
            PEDIDOPRIMARIO.IDDETALHEPRODUTOPEDIDO*/
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
                IsDivergentePrecoPorLinhaEntrePedidos, 
                IsDivergenteQtdPorLinhaEntrePedidos, 
                IsDivergenteTotalLinhasEntrePedidos, 
                IsDivergenteVrTotalEntrePedidos 
            } = registro;
            let arrayCondicoesDivergentes = [
                IsPedidoFechado,
                IsPedidoComLinhaFechadaSemRecepcao,
                IsDivergentePrecoPorLinhaEntrePedidos, 
                IsDivergenteQtdPorLinhaEntrePedidos,
                IsDivergenteTotalLinhasEntrePedidos,
                IsDivergenteVrTotalEntrePedidos
            ];
            let idMotivo = arrayCondicoesDivergentes.findIndex(v => v == "Y");
            
            if(idMotivo != -1){
                let motivo =  arrayMotivos[idMotivo];
                
                return {
                    msgWarningPedido: `Erro ao cancelar a Referencia no SAP, ${motivo}`,
                    isValidPedidoSAP,
                    existPedidoSAP
                };
            }
            
        }
        
        isValidPedidoSAP = true;
	}
	
	return { isValidPedidoSAP, existPedidoSAP };
}

function validarSeProdutoExisteSeTemEntradaNoPedidoSap(idResumoPedido, idDetalhePedido){
    let isValidReferenciaToCancelSAP = false;
    let existReferenciaPedidoSAP = false;
	let regProd = getDadosProdutoPedidoEntreQualitySAP(idResumoPedido, idDetalhePedido)
    
    if(regProd.length > 0){
        existReferenciaPedidoSAP = true;
        
        for( let { DocEntryNotaEntrada } of regProd ) {
            
            if(DocEntryNotaEntrada != 0 ){
                return {
                    msgWarningProdPedido: `Erro ao cancelar a Referencia no SAP, Referencia com recepção total ou parcial no SAP`,
                    isValidReferenciaToCancelSAP,
                    existReferenciaPedidoSAP
                };
            }
            
        }
        
        isValidReferenciaToCancelSAP = true;
	}
	
	return { isValidReferenciaToCancelSAP, existReferenciaPedidoSAP }
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
                    isValidPedidosPrimarioSecundario,
                    existPedidosPrimarioSecundario
                };
            }
            
        }
        
        isValidPedidosPrimarioSecundario = true;
        existPedidosPrimarioSecundario = true;
	}
	
	return { isValidPedidosPrimarioSecundario, existPedidosPrimarioSecundario };
}

function validarSeAptoParaCancelarSapQuandoPedidoPadrao(dadosProdutoPedido){
    let { IDRESUMOPEDIDO, IDDETALHEPEDIDO } = dadosProdutoPedido;
    let { existPedidoSAP, isValidPedidoSAP, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(IDRESUMOPEDIDO);
    let { existReferenciaPedidoSAP, isValidReferenciaToCancelSAP, msgWarningProdPedido } = validarSeProdutoExisteSeTemEntradaNoPedidoSap(IDRESUMOPEDIDO, IDDETALHEPEDIDO);
    let msg = msgWarningPedido || msgWarningProdPedido || '';
    let success = !msg.length;
    let stCancelarSAP = !msg.length && isValidReferenciaToCancelSAP;
    
    return {
        success,
        stCancelarSAP,
        msg
    }
}

function validarSeAptoParaCancelarSapQuandoPedidoRN(idResumoPedidoPrimario, dadosProdutosPedidos){
    let { 
        existPedidosPrimarioSecundario, 
        isValidPedidosPrimarioSecundario, 
        msgWarningValidacaoPedidosPrimarioSecundario 
    } = validarPedidoPrimarioComSecundario(idResumoPedidoPrimario);
    let idPedidoPrimario;
    let idPedidoSecundario;
    let arrayResp = [];
    //return {idResumoPedidoPrimario, dadosProdutosPedidos}
    /*let validacoesPedidoEntreQualitySAP = getValidacoesPedidoEntreQualitySAP(dadosProdutosPedidos[0].IDRESUMOPEDIDO);
    let dadosProdutoPedidoEntreQualitySAP = getDadosProdutoPedidoEntreQualitySAP(dadosProdutosPedidos[0].IDRESUMOPEDIDO, dadosProdutosPedidos[0].IDDETALHEPEDIDO);
    let validacoesEntrePedidoPrimarioSecundario = getValidacoesEntrePedidoPrimarioSecundario(dadosProdutosPedidos[0].IDRESUMOPEDIDO);
    
    return {
        validacoesPedidoEntreQualitySAP,
        dadosProdutoPedidoEntreQualitySAP,
        validacoesEntrePedidoPrimarioSecundario
    }*/
    
    let stCancelarSAP = false;
    
    let ultimoEstadoExistPedidoSAP = null;
    let ultimoEstadoIsValidPedidoSAP = null;
    let ultimoEstadoExistReferenciaPedidoSAP = null;
    let ultimoEstadoIsValidReferenciaToCancelSAP = null;
    let ultimoEstadoMsgWarningPedido = null;
    let ultimoEstadoMsgWarningProdPedido = null;
    
    if(!existPedidosPrimarioSecundario){
        return returnWarning('Pedido Primario ou Secundario não encontrado no Quality');
    }
    
    if(!isValidPedidosPrimarioSecundario){
        return returnWarning(msgWarningValidacaoPedidosPrimarioSecundario);
    }
    
    for(let i = 0; i < dadosProdutosPedidos.length; i++){
        let registro = dadosProdutosPedidos[i]
        let { existPedidoSAP, isValidPedidoSAP, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(registro.IDRESUMOPEDIDO);
        let { existReferenciaPedidoSAP, isValidReferenciaToCancelSAP, msgWarningProdPedido } = validarSeProdutoExisteSeTemEntradaNoPedidoSap(registro.IDRESUMOPEDIDO, registro.IDDETALHEPEDIDO);
        let stPrimario = i == 0;
        
        if(stPrimario){
            idPedidoPrimario = registro.IDRESUMOPEDIDO;
            ultimoEstadoExistPedidoSAP = existPedidoSAP;
            ultimoEstadoIsValidPedidoSAP = isValidPedidoSAP;
            ultimoEstadoExistReferenciaPedidoSAP = existReferenciaPedidoSAP;
            ultimoEstadoIsValidReferenciaToCancelSAP = isValidReferenciaToCancelSAP;
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
        
        if(!msg.length && ultimoEstadoExistReferenciaPedidoSAP != existReferenciaPedidoSAP){
            msg = label(!ultimoEstadoExistReferenciaPedidoSAP) + 'Referencia não encontrada no Pedido SAP';
        }
        
        if(msg.length > 0){
            return {
                success: false,
                msg
            };
        }
        
        stCancelarSAP = ultimoEstadoIsValidReferenciaToCancelSAP && isValidReferenciaToCancelSAP;
    }
    return {
        success: true,
        stCancelarSAP
    }
}

// Gravação de Dados no BD

function cancelarDetalhePedido(dados){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" 
        SET
            "STCANCELADO" = ?, 
            "IDRESPCANCELAMENTO" = ?, 
            "TXTOBSCANCELAMENTO" = ? 
        WHERE 
            "IDDETALHEPEDIDO" =  ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, dados.STCANCELADO);
    pStmt.setInt(2, parseInt(dados.IDRESPCANCELAMENTO));
    pStmt.setString(3, dados.TXTOBSCANCELAMENTO);
    pStmt.setInt(4, parseInt(dados.IDDETALHEPEDIDO));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function cancelarDetalheGrade(idDetalhePedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE 
        SET 
            STATIVO = 'False',
            STCANCELADO = 'False'
        WHERE
            STATIVO = 'True'
            AND IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(idDetalhePedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function cancelarDetalheProdutoPedido(dados){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO 
        SET 
            ERRORLOGSAP = NULL,
            STATIVO = 'False',
            STCANCELADO = 'True',
            IDRESPCANCELAMENTO = ?,
            TXTOBSCANCELAMENTO = ?
        WHERE 
            IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(dados.IDRESPCANCELAMENTO));
    pStmt.setString(2, dados.TXTOBSCANCELAMENTO);
    pStmt.setInt(3, parseInt(dados.IDDETALHEPEDIDO));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function ajustarValoresResumoPedido(idResumoPedido, valoresAtualizados){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET 
            "DTMOVPEDIDO" = now(),
            "NUTOTALITENS" = ?, 
            "QTDTOTPRODUTOS" =  ?, 
            "VRTOTALBRUTO" =  ?, 
            "VRTOTALLIQUIDO" =  ?
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    let vrAtualizado = valoresAtualizados[0];
    
    pStmt.setInt(1, parseInt(vrAtualizado.TOTALITENS || 0));
    pStmt.setFloat(2, parseFloat(vrAtualizado.QTDTOTAL || 0));
    pStmt.setFloat(3, parseFloat(vrAtualizado.VRTOTAL || 0));
    pStmt.setFloat(4, parseFloat(vrAtualizado.VRTOTAL || 0));
    pStmt.setInt(5, parseInt(idResumoPedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

// Remocao no Pedido SAP e Remocao, Ajuste de Valores e Quantidades do Pedido Quality

function cancelarReferenciaProdutosPedido(dadosReferenciaParaRemoverDoPedido, stCancelarSAP){
    let { DOCENTRY, IDRESUMOPEDIDO, IDDETALHEPEDIDO, QTDTOTALPRODUTOS, VRTOTALCUSTO } = dadosReferenciaParaRemoverDoPedido;
    let { QTDTOTAL, VRTOTAL } = getDadosDetalhePedido(IDDETALHEPEDIDO);
    //return { teste: getDadosDetalhePedido(dadosReferenciaParaRemoverDoPedido) }
    let qtdTotalReferenciaDetalhePedido = Number(QTDTOTAL);
    let vrTotalReferenciaDetalhePedido = Number(VRTOTAL);
    
    let qtdTotalReferenciaDetalheProduto = Number(QTDTOTALPRODUTOS);
    let vrTotalReferenciaDetalheProduto = Number(VRTOTALCUSTO);
    
    /*return {
        dadosProds: { DOCENTRY, IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO, IDDETALHEPEDIDO, IDTAMANHO, QTDPRODUTO },
        detalhesPedido: { QTDTOTAL, VRUNITLIQUIDO },
        calc: {
            qtdTotalOriginal,
            vrUnitario,
            qtdParaSubtrair,
            vrParaSubtrair,
            qtdRestante,
            vrRestante,
        }
    }*/
    
    //return validarSeProdutoExisteSeTemEntradaNoPedidoSap(IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO)
    if(qtdTotalReferenciaDetalhePedido != qtdTotalReferenciaDetalheProduto){
        let msg = 'Quantidado da referencia não está batendo com a quantidade gradeada no pedido';
        
        registrarErrorLog(IDDETALHEPEDIDO, msg);
        
        return returnWarning(msg);
    }
    
    if(vrTotalReferenciaDetalhePedido != vrTotalReferenciaDetalheProduto){
        let msg = 'Valor da referencia não está batendo com a valor gradeada no pedido';
        
        registrarErrorLog(IDDETALHEPEDIDO, msg);
        
        return returnWarning(msg);
    }
    
    //return { IDDETALHEPEDIDO, existPedidoSAP, isValidPedidoSAP, existReferenciaPedidoSAP, isValidReferenciaToCancelSAP }
    
    if(stCancelarSAP){
        let respRemocaoReferenciaPedidoSAP = libRemove.removerReferenciaPedidoSAP(DOCENTRY, IDRESUMOPEDIDO, IDDETALHEPEDIDO);
        //return respRemocaoReferenciaPedidoSAP;
        if(!respRemocaoReferenciaPedidoSAP.success){
            return respRemocaoReferenciaPedidoSAP;
        }
    }
    
    let valoresAtualizados = getValoresAtualizadosDoPedido(IDRESUMOPEDIDO, IDDETALHEPEDIDO);
    
    cancelarDetalhePedido(dadosReferenciaParaRemoverDoPedido);
    
    cancelarDetalheGrade(IDDETALHEPEDIDO);
    
    cancelarDetalheProdutoPedido(dadosReferenciaParaRemoverDoPedido);

    ajustarValoresResumoPedido(IDRESUMOPEDIDO, valoresAtualizados);
    
    return { success };
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    if(bodyJson.length > 0){
        conn = $.db.getConnection();
        
        for(let i = 0; i < bodyJson.length; i++){
            let registro = bodyJson[i];
            let stPedidoRN = getStPedidoRN(registro.IDRESUMOPEDIDO);
            let listaReferenciasParaRemoverDoPedido = getDadosReferenciasParaRemoverPedido(registro);
            //return { registro, stPedidoRN, listaReferenciasParaRemoverDoPedido}
            
            if(listaReferenciasParaRemoverDoPedido.length){
                let dadosReferenciaParaRemoverDoPedido = listaReferenciasParaRemoverDoPedido[0];
                //return dadosReferenciaParaRemoverDoPedido;
                if(stPedidoRN){
                    if(listaReferenciasParaRemoverDoPedido.length > 2){
                        return returnWarning('Pedido Primario ou Secundario com duplicidade de numeração no SAP');
                    }
                    
                    //return validarSeAptoParaCancelarSapQuandoPedidoRN(dadosReferenciaParaRemoverDoPedido.IDRESUMOPEDIDO, listaReferenciasParaRemoverDoPedido);
                    let { success, stCancelarSAP, msg } = validarSeAptoParaCancelarSapQuandoPedidoRN(dadosReferenciaParaRemoverDoPedido.IDRESUMOPEDIDO, listaReferenciasParaRemoverDoPedido);
                    
                    if(!success){
                        registrarErrorLog(dadosReferenciaParaRemoverDoPedido.IDDETALHEPEDIDO, msg);
                        
                        return returnWarning(msg);
                    }
                    
                    for(let registros of listaReferenciasParaRemoverDoPedido){
                        let respCancel = cancelarReferenciaProdutosPedido(registros, stCancelarSAP);
                        //return respCancel
                        if(!respCancel.success){
                            registrarErrorLog(dadosReferenciaParaRemoverDoPedido.IDDETALHEPEDIDO, respCancel.msg);
                            
                            return returnWarning(respCancel.msg);
                        }
                        
                    }
                } else {
                    if(listaReferenciasParaRemoverDoPedido.length > 1){
                        return returnWarning('Pedido com duplicidade de numeração no SAP');
                    }
                    //return validarSeAptoParaCancelarSapQuandoPedidoPadrao(dadosReferenciaParaRemoverDoPedido);
                    let {success, stCancelarSAP, msg } = validarSeAptoParaCancelarSapQuandoPedidoPadrao(dadosReferenciaParaRemoverDoPedido);
                    
                    if(!success){
                        registrarErrorLog(dadosReferenciaParaRemoverDoPedido.IDDETALHEPEDIDO, msg);
                        
                        return returnWarning(msg);
                    }
                    
                    let respCancel = cancelarReferenciaProdutosPedido(dadosReferenciaParaRemoverDoPedido, stCancelarSAP);
                    //return respCancel
                    if(!respCancel.success){
                        registrarErrorLog(dadosReferenciaParaRemoverDoPedido.IDDETALHEPEDIDO, respCancel.msg);
                        
                        return returnWarning(respCancel.msg);
                    }
                }
                
            } else {
                //registrarErrorLog(registro.IDDETALHEPEDIDO, 'Dados não encontrados ou produto já cancelado');
                
                return returnWarning('Dados não encontrados ou referencia já cancelada');
            }
            
        }
        
        conn.commit();
        
    }
    
    return {
        "msg": "Cancelamento realizado com sucesso!"
    };

}

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
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