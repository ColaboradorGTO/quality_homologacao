let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let libRemove = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.libs.alteracao-pedido.itens", "remover-item-especifico-pedido");

let dbNameSAP = 'SBO_GTO_TESTE4';
let success = true;
let conn;

// Registrar Sucesso/Error no BD

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

function registrarErrorLog(idDetalheProdutoPedido, msgError = 'Erro ao cancelar o Item no SAP'){
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
                WHEN SAP."VrTotalPedido" <> IFNULL(APP."VrTotalPedido", 0) THEN 'Y'
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
                    msgWarningPedido: `Erro ao cancelar o Item no SAP, ${motivo}`,
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
    let isValidProdToCancelSAP = false;
    let existProdPedidoSAP = false;
	let regProd = getDadosProdutoPedidoEntreQualitySAP(idResumoPedido, idDetalheProdutoPedido)
    
    if(regProd.length > 0){
        existProdPedidoSAP = true;
        
        for( let { DocEntryNotaEntrada } of regProd ) {
            
            if(DocEntryNotaEntrada != 0 ){
                return {
                    msgWarningProdPedido: `Erro ao cancelar o Item no SAP, Item com recepção total ou parcial no SAP`,
                    isValidProdToCancelSAP: false,
                    existProdPedidoSAP
                };
            }
            
        }
        
        isValidProdToCancelSAP = true;
	}
	
	return { isValidProdToCancelSAP, existProdPedidoSAP }
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

function validarSeAptoParaCancelarSapQuandoPedidoPadrao(dadosProdutoPedido){
    let { IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO } = dadosProdutoPedido;
    let { existPedidoSAP, isValidPedido, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(IDRESUMOPEDIDO);
    let { existProdPedidoSAP, isValidProdToCancelSAP, msgWarningProdPedido } = validarSeProdutoExisteSeTemEntradaNoPedidoSap(IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO);
    let msg = msgWarningPedido || msgWarningProdPedido || '';
    let success = !msg.length;
    
    let stCancelarSAP = !msg.length && isValidProdToCancelSAP;
    
    return {
        success,
        stCancelarSAP,
        msg
    }
}

function validarSeAptoParaCancelarQuandoPedidoRN(idResumoPedidoPrimario, dadosProdutosPedidos){
    let { 
        existPedidosPrimarioSecundario, 
        isValidPedidosPrimarioSecundario, 
        msgWarningValidacaoPedidosPrimarioSecundario 
    } = validarPedidoPrimarioComSecundario(idResumoPedidoPrimario);
    let idPedidoPrimario;
    let idPedidoSecundario;

    let stCancelarSAP = false;
    
    let ultimoEstadoExistPedidoSAP = null;
    let ultimoEstadoIsValidPedido = null;
    let ultimoEstadoExistProdPedidoSAP = null;
    let ultimoEstadoIsValidProdToCancelSAP = null;
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
        let { existPedidoSAP, isValidPedido, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(registro.IDRESUMOPEDIDO);
        let { existProdPedidoSAP, isValidProdToCancelSAP, msgWarningProdPedido } = validarSeProdutoExisteSeTemEntradaNoPedidoSap(registro.IDRESUMOPEDIDO, registro.IDDETALHEPRODUTOPEDIDO);
        
        let stPrimario = i == 0;
        
        if(stPrimario){
            idPedidoPrimario = registro.IDRESUMOPEDIDO;
            ultimoEstadoExistPedidoSAP = existPedidoSAP;
            ultimoEstadoIsValidPedido = isValidPedido;
            ultimoEstadoExistProdPedidoSAP = existProdPedidoSAP;
            ultimoEstadoIsValidProdToCancelSAP = isValidProdToCancelSAP;
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
        
        stCancelarSAP = ultimoEstadoIsValidProdToCancelSAP && isValidProdToCancelSAP;
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
    pStmt.setInt(2, dados.IDRESPCANCELAMENTO);
    pStmt.setString(3, dados.TXTOBSCANCELAMENTO);
    pStmt.setInt(4, parseInt(dados.IDDETALHEPEDIDO));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function cancelarDetalheGrade(idDetalhePedido, idTamanho){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE 
        SET 
            STATIVO = 'False',
            STCANCELADO = 'False'
        WHERE
            STATIVO = 'True'
            AND IDTAMANHO = ?
            AND IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(idTamanho));
    pStmt.setInt(2, parseInt(idDetalhePedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function cancelarDetalheProdutoPedido(idDetalheProdutoPedido, registro){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO 
        SET 
            STATIVO = 'False',
            STCANCELADO = 'True',
            IDRESPCANCELAMENTO = ?,
            TXTOBSCANCELAMENTO = ?
        WHERE 
            IDDETALHEPRODUTOPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, registro.IDRESPCANCELAMENTO);
    pStmt.setString(2, registro.TXTOBSCANCELAMENTO);
    pStmt.setInt(3, parseInt(idDetalheProdutoPedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function ajustarDetalhePedido(idDetalhePedido, qtdAjustada, vrAjustado){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" 
        SET
            "QTDTOTAL" = ?, 
            "VRTOTAL" = ?
        WHERE 
            "IDDETALHEPEDIDO" =  ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, Number(qtdAjustada));
    pStmt.setFloat(2, vrAjustado);
    pStmt.setInt(3, parseInt(idDetalhePedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function ajustarDetalheGrade(idDetalhePedido, idTamanho, qtdAjustada){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE 
        SET 
            STATIVO = 'False',
            STCANCELADO = 'True'
        WHERE
            STATIVO = 'True'
            /*AND QTD = ${qtdAjustada}*/
            AND IDTAMANHO = ?
            AND IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(idTamanho));
    pStmt.setInt(2, parseInt(idDetalhePedido));
    
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

function cancelarProdutoPedido(dadosProdutoPedido, stCancelarSAP){
    let { DOCENTRY, IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO, IDDETALHEPEDIDO, IDTAMANHO, QTDPRODUTO } = dadosProdutoPedido;
    let { QTDTOTAL, VRUNITLIQUIDO } = getDadosDetalhePedido(dadosProdutoPedido);
    //return { teste: getDadosDetalhePedido(dadosProdutoPedido) }
    let qtdTotalOriginal = Number(QTDTOTAL);
    let vrUnitario = Number(VRUNITLIQUIDO);
    
    let qtdParaSubtrair = Number(QTDPRODUTO);
    let vrParaSubtrair = qtdParaSubtrair * vrUnitario;
    
    let qtdRestante = qtdTotalOriginal - qtdParaSubtrair;
    let vrRestante = qtdRestante * vrUnitario;
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
    if(qtdRestante < 0){
        let msg = 'Quantidado do produto não está batendo com a quantidade gradeada no pedido';
        
        registrarErrorLog(IDDETALHEPRODUTOPEDIDO, msg);
        
        return returnWarning(msg);
    }
    
    //return { IDDETALHEPRODUTOPEDIDO, existPedidoSAP, isValidPedido, existProdPedidoSAP, isValidProdToCancelSAP }
    
    if(stCancelarSAP){
        let respRemocaoProdPedidoSAP = libRemove.removerProdutoPedidoSAP(DOCENTRY, IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO);
        
        if(!respRemocaoProdPedidoSAP.success){
            return respRemocaoProdPedidoSAP;
        }
    }
    
   // return { success };
    
    if(qtdRestante == 0){
        cancelarDetalhePedido(dadosProdutoPedido);
        //cancelarDetalheGrade(IDDETALHEPEDIDO, IDTAMANHO);
    } else {
        ajustarDetalhePedido(IDDETALHEPEDIDO, qtdRestante, vrRestante);
        
        //ajustarDetalheGrade(IDDETALHEPEDIDO, IDTAMANHO, qtdRestante);
    }
    
    cancelarDetalheGrade(IDDETALHEPEDIDO, IDTAMANHO);
    
    cancelarDetalheProdutoPedido(IDDETALHEPRODUTOPEDIDO, dadosProdutoPedido);
    
    let valoresAtualizados = getValoresAtualizadosDoPedido(IDRESUMOPEDIDO, IDDETALHEPEDIDO, qtdRestante, qtdParaSubtrair, vrParaSubtrair);
    //return valoresAtualizados;
    ajustarValoresResumoPedido(IDRESUMOPEDIDO, valoresAtualizados);
    
    registrarSucessoLog(IDDETALHEPRODUTOPEDIDO);
    
    return { success };
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    if(bodyJson.length > 0){
        conn = $.db.getConnection();
        
        for(let i = 0; i < bodyJson.length; i++){
            let registro = bodyJson[i];
            let stPedidoRN = getStPedidoRN(registro.IDRESUMOPEDIDO);
            let listaProdutosParaRemoverPedidos = getDadosProdutosParaRemoverPedido(registro);
            //return listaProdutosParaRemoverPedidos
            
            if(listaProdutosParaRemoverPedidos.length){
                let dadosProdutoPedido = listaProdutosParaRemoverPedidos[0];
                //return dadosProdutoPedido;
                if(stPedidoRN){
                    if(listaProdutosParaRemoverPedidos.length > 2){
                        return returnWarning('Pedido Primario ou Secundario com duplicidade de numeração no SAP');
                    }
                    //return validarSeAptoParaCancelarQuandoPedidoRN(dadosProdutoPedido.IDRESUMOPEDIDO, listaProdutosParaRemoverPedidos);
                    let { success, stCancelarSAP, msg } = validarSeAptoParaCancelarQuandoPedidoRN(dadosProdutoPedido.IDRESUMOPEDIDO, listaProdutosParaRemoverPedidos);
                    
                    if(!success){
                        registrarErrorLog(dadosProdutoPedido.IDDETALHEPRODUTOPEDIDO, msg);
                        
                        return returnWarning(msg);
                    }
                    
                    for(let registros of listaProdutosParaRemoverPedidos){
                        let respCancel = cancelarProdutoPedido(registros, stCancelarSAP);
                        //return respCancel
                        if(!respCancel.success){
                            registrarErrorLog(dadosProdutoPedido.IDDETALHEPRODUTOPEDIDO, respCancel.msg);
                            
                            return returnWarning(respCancel.msg);
                        }
                        
                    }
                } else {
                    if(listaProdutosParaRemoverPedidos.length > 1){
                        return returnWarning('Pedido com duplicidade de numeração no SAP');
                    }
                    //return validarSeAptoParaCancelarSapQuandoPedidoPadrao(dadosProdutoPedido);
                    let {success, stCancelarSAP, msg } = validarSeAptoParaCancelarSapQuandoPedidoPadrao(dadosProdutoPedido);
                    
                    if(!success){
                        registrarErrorLog(dadosProdutoPedido.IDDETALHEPRODUTOPEDIDO, msg);
                        
                        return returnWarning(msg);
                    }
                    
                    let respCancel = cancelarProdutoPedido(dadosProdutoPedido, stCancelarSAP);
                    //return respCancel
                    if(!respCancel.success){
                        registrarErrorLog(dadosProdutoPedido.IDDETALHEPRODUTOPEDIDO, respCancel.msg);
                        
                        return returnWarning(respCancel.msg);
                    }
                }
                
            } else {
                //registrarErrorLog(registro.IDDETALHEPRODUTOPEDIDO, 'Dados não encontrados ou produto já cancelado');
                
                return returnWarning('Dados não encontrados ou produto já cancelado');
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