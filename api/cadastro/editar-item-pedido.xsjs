let api = $.import("quality.concentrador_homologacao.api", "apiResponse");
let libEditItemPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.libs.alteracao-pedido.itens", "alterar-dados-qtd-vrcusto-item-pedido");

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

function registrarErrorLog(idDetalhePedido, msgError = 'Erro ao editar o Item no Pedido SAP'){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDP
        SET 
            TBDP.ERRORLOGSAP = ? 
        WHERE 
            TBDP.IDDETALHEPEDIDO IN (
                SELECT 
                    XA.IDDETALHEPEDIDO
                FROM    
                    "VAR_DB_NAME"."DETALHEPEDIDO" XA
                WHERE
                    XA.IDDETALHEPEDIDO = ?
                    OR XA.IDDETALHEPEDIDOPRIMARIO = ?
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
            SUM(IFNULL(QTDTOTAL, 0) * IFNULL(VRUNITLIQUIDO, 0)) AS  VRTOTAL
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
                WHEN SAP."VrTotalPedido" <> IFNULL(ROUND(APP."VrTotalPedido", 2), 0) THEN 'Y'
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

function getDadosPedidoSecundario(idDetalhePedido){
    let query = `
        SELECT
            IDRESUMOPEDIDO,
            IDDETALHEPEDIDO
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            STCANCELADO = 'False'
            AND IDDETALHEPEDIDOPRIMARIO = ?
    `;
    
    return api.sqlQuery(query,idDetalhePedido);
}

function obterLinhasDoDetalheGrade(idDetPedido) {
	let query = `
        SELECT
            TBDG.IDDETALHEPEDIDOGRADE,
            TBDG.IDDETALHEPEDIDO,
            TBDG.IDTAMANHO,
            TBT.DSTAMANHO,
            TBDG.INDICETAMANHO,
            TBDG.QTD,
            TBDG.STATIVO
        FROM  
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        INNER JOIN "VAR_DB_NAME".TAMANHO TBT ON
            TBDG.IDTAMANHO = TBT.IDTAMANHO
        WHERE  
            TBDG.STATIVO = 'True'
            AND TBDG.IDDETALHEPEDIDO = ?
        ORDER BY
            TO_ALPHANUM(TBT.DSABREVIACAO)
	`;

    return api.sqlQuery(query, idDetPedido);
}

function getDadosItensPedidoParaEditarSAP(dados){
    let query = `
        SELECT
            TBO."DocEntry" AS DOCENTRY,
            TBR.IDRESUMOPEDIDO,
            TBD.IDDETALHEPEDIDO,
            --TBDP.IDDETALHEPRODUTOPEDIDO,
            --SUM(TBDP.QTDPRODUTO) AS QTDTOTALPRODUTOS,
            --SUM(TBDP.VRTOTALCUSTO) AS VRTOTALCUSTO
            COALESCE(IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0), 1) * CAST( ${dados.VRUNITLIQUIDO} AS DECIMAL(21, 6)) AS VRCUSTO
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
            TBR.IDRESUMOPEDIDO,
            TBD.IDDETALHEPEDIDO,
            TBR."FATOR_ACRESCIMO_COMPRA"
        ORDER BY  
            TBR.IDRESUMOPEDIDO
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

function validarSeItensExistemSeTemEntradaNoPedidoSap(idResumoPedido, idDetalhePedido){
    let isValidItemToEditSAP = false;
    let existItemPedidoSAP = false;
	let regProd = getDadosProdutoPedidoEntreQualitySAP(idResumoPedido, idDetalhePedido)
    
    if(regProd.length > 0){
        existItemPedidoSAP = true;
        
        for( let { DocEntryNotaEntrada } of regProd ) {
            
            if(DocEntryNotaEntrada != 0 ){
                return {
                    msgWarningProdPedido: `Erro ao cancelar o Item no SAP, Item com recepção total ou parcial no SAP`,
                    isValidItemToEditSAP: false,
                    existItemPedidoSAP
                };
            }
            
        }
        
        isValidItemToEditSAP = true;
	}
	
	return { isValidItemToEditSAP, existItemPedidoSAP }
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

function validarSeAptoParaEditarSapQuandoPedidoPadrao(dadosItemPedido){
    let { IDRESUMOPEDIDO, IDDETALHEPEDIDO } = dadosItemPedido;
    let { existPedidoSAP, isValidPedido, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(IDRESUMOPEDIDO);
    let { existItemPedidoSAP, isValidItemToEditSAP, msgWarningProdPedido } = validarSeItensExistemSeTemEntradaNoPedidoSap(IDRESUMOPEDIDO, IDDETALHEPEDIDO);
    let msg = msgWarningPedido || msgWarningProdPedido || '';
    let success = !msg.length;
    
    let stEditarSAP = !msg.length && isValidItemToEditSAP;
    
    return {
        success,
        stEditarSAP,
        msg
    }
}

function validarSeAptoParaEditarQuandoPedidoRN(dadosItemPedido){
    let { IDRESUMOPEDIDO, IDDETALHEPEDIDO } = dadosItemPedido;
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
    let ultimoEstadoExistItemPedidoSAP = null;
    let ultimoEstadoIsValidItemToEditSAP = null;
    let ultimoEstadoMsgWarningPedido = null;
    let ultimoEstadoMsgWarningProdPedido = null;
    
    if(!existPedidosPrimarioSecundario){
        return returnWarning('Pedido Primario ou Secundario não encontrado no Quality');
    }
    
    if(!isValidPedidosPrimarioSecundario){
        return returnWarning(msgWarningValidacaoPedidosPrimarioSecundario);
    }
    
    let dadosProdutosPedidos = getDadosItensPedidoParaEditarSAP(dadosItemPedido);
    
    for(let i = 0; i < dadosProdutosPedidos.length; i++){
        let registro = dadosProdutosPedidos[i]
        let { existPedidoSAP, isValidPedido, msgWarningPedido } = validarDadosPedidoEntreQualitySAP(registro.IDRESUMOPEDIDO);
        let { existItemPedidoSAP, isValidItemToEditSAP, msgWarningProdPedido } = validarSeItensExistemSeTemEntradaNoPedidoSap(registro.IDRESUMOPEDIDO, registro.IDDETALHEPEDIDO);
        
        let stPrimario = i == 0;
        
        if(stPrimario){
            idPedidoPrimario = registro.IDRESUMOPEDIDO;
            ultimoEstadoExistPedidoSAP = existPedidoSAP;
            ultimoEstadoIsValidPedido = isValidPedido;
            ultimoEstadoExistItemPedidoSAP = existItemPedidoSAP;
            ultimoEstadoIsValidItemToEditSAP = isValidItemToEditSAP;
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
        
        if(!msg.length && ultimoEstadoExistItemPedidoSAP != existItemPedidoSAP){
            msg = label(!ultimoEstadoExistItemPedidoSAP) + 'Produto não encontrado no Pedido SAP';
        }
        
        if(msg.length > 0){
            return {
                success: false,
                msg
            };
        }
        
        stEditarSAP = ultimoEstadoIsValidItemToEditSAP && isValidItemToEditSAP;
    }
    
    return {
        success: true,
        stEditarSAP
    }
}

// Atualizaçao dados no BD

function atualizarTabelaResumoPedido(registro){
    let qtdDetalheAlterado = Number(registro.QTDTOTAL);
    let vrTotalDetalheAlterado = qtdDetalheAlterado * Number(registro.VRUNITLIQUIDO);
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" TBR
        SET
            TBR."DTMOVPEDIDO" = CURRENT_TIMESTAMP,
            TBR."NUTOTALITENS" = (XA.TOTALITENS + 1),
            TBR."QTDTOTPRODUTOS" = ( XA.QTDTOTAL + ${qtdDetalheAlterado}),
            TBR."VRTOTALBRUTO" = ( XA.VRTOTAL + COALESCE(IFNULL(TBR."FATOR_ACRESCIMO_COMPRA",0),1) * CAST(${vrTotalDetalheAlterado} AS DECIMAL(21,6)) ),
            TBR."VRTOTALLIQUIDO" = ( XA.VRTOTAL + COALESCE(IFNULL(TBR."FATOR_ACRESCIMO_COMPRA",0),1) * CAST(${vrTotalDetalheAlterado} AS DECIMAL(21,6)) )
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
                        TBR.IDRESUMOPEDIDO = ${registro.IDRESUMOPEDIDO} AND TBD.IDDETALHEPEDIDO <> ${registro.IDDETALHEPEDIDO}
                    OR
                        TBR.IDPEDIDOPRIMARIO =  ${registro.IDRESUMOPEDIDO} AND TBD.IDDETALHEPEDIDOPRIMARIO <> ${registro.IDDETALHEPEDIDO}
                )
            GROUP BY 
                TBR.IDRESUMOPEDIDO
        ) XA ON 
            TBR.IDRESUMOPEDIDO = XA.IDRESUMOPEDIDO
        WHERE 
            TBR.IDRESUMOPEDIDO = XA.IDRESUMOPEDIDO 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function atualizarTabelaDetalheProdutoPedido(registro){
    let stProdutoEditado = 'True';
    let gradeamentos = registro.DETALHEGRADE;
    
    let query = `
        UPDATE
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        SET
            TBDPP."IDCOR" = ?,
            TBDPP."IDTAMANHO" = ?,
            TBDPP."IDTIPOTECIDO" = ?,
            TBDPP."IDLOCALEXPOSICAO" = ?,
            TBDPP."IDCATEGORIAS" = ?,
            TBDPP."NUREF" = ?,
            TBDPP."UND" = ( SELECT A.DSSIGLA FROM "VAR_DB_NAME".UNIDADEMEDIDA A WHERE A.IDUNIDADEMEDIDA = ? ),
            TBDPP."QTDPRODUTO" = ?,
            TBDPP."VRCUSTO" = COALESCE(IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0), 1) * CAST( ? AS DECIMAL(21, 6)),
            TBDPP."VRTOTALCUSTO" = COALESCE(IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0), 1) * CAST( ? AS DECIMAL(21, 6)),
            TBDPP."STECOMMERCE" = ?,
            TBDPP."STREDESOCIAL" = ?,
            TBDPP."STEDITADOCOMPRAS" = ?,
            TBDPP."IDCATEGORIAPEDIDO" = ?,
            TBDPP."DSTAMANHO" = TBT.DSTAMANHO,
            TBDPP."DTULTATUALIZACAO" = CURRENT_TIMESTAMP
        FROM 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDPP
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
            TBDPP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBDP ON 
            TBDPP.IDDETALHEPEDIDO = TBDP.IDDETALHEPEDIDO AND TBDPP.IDTAMANHO = ?
        INNER JOIN "VAR_DB_NAME".TAMANHO TBT ON 
            TBDPP.IDTAMANHO = TBT.IDTAMANHO
        LEFT JOIN "VAR_DB_NAME".PRODUTO TBP ON 
            TBDPP.IDPRODCADASTRO = TBP.IDPRODUTO
        LEFT JOIN "VAR_DB_NAME".PRODUTO_RN TBP_RN ON 
            TBDPP.IDPRODCADASTRO = TBP_RN.IDPRODUTO
        WHERE 
            TBDP.IDDETALHEPEDIDO = ?
            OR TBDP.IDDETALHEPEDIDOPRIMARIO = ?
    `;
  
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for(let detGradeamento of gradeamentos){
        let idTamanhoGrade = Number(detGradeamento.IDTAMANHO);
        let qtdGrade = Number(detGradeamento.QTD);
        let vrTotalCusto = qtdGrade * Number(registro.VRUNITLIQUIDO);
        
        pStmt.setInt(1, registro.IDCOR);
        pStmt.setInt(2, idTamanhoGrade);
        pStmt.setInt(3, registro.IDTIPOTECIDO);
        pStmt.setInt(4, registro.IDLOCALEXPOSICAO);
        pStmt.setInt(5, registro.IDCATEGORIAS);
        pStmt.setString(6, registro.NUREF);
        pStmt.setInt(7, registro.UND);
        pStmt.setFloat(8, qtdGrade);
        pStmt.setFloat(9, registro.VRUNITLIQUIDO);
        pStmt.setFloat(10, vrTotalCusto);
        pStmt.setString(11, registro.STECOMMERCE);
        pStmt.setString(12, registro.STREDESOCIAL);
        pStmt.setString(13, stProdutoEditado);
        pStmt.setInt(14, registro.IDCATEGORIAPEDIDO);
        pStmt.setInt(15, idTamanhoGrade);
        pStmt.setInt(16, registro.IDDETALHEPEDIDO);
        pStmt.setInt(17, registro.IDDETALHEPEDIDO);
        
        pStmt.executeUpdate();
    }
    
	pStmt.close();
}

function atualizarTabelaDetalheGrade(detGradeamento){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        SET 
            TBDG.INDICETAMANHO = ?,
            TBDG.QTD = ?
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBDP ON 
            TBDG.IDDETALHEPEDIDO = TBDP.IDDETALHEPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG2 ON 
            TBDP.IDDETALHEPEDIDO = TBDG2.IDDETALHEPEDIDO OR TBDP.IDDETALHEPEDIDOPRIMARIO = TBDG2.IDDETALHEPEDIDO
        WHERE
            TBDG.STATIVO = 'True'
            AND TBDG.IDTAMANHO = ?
            AND TBDG2.IDDETALHEPEDIDOGRADE = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for(let registro of detGradeamento){
        pStmt.setInt(1, parseInt(registro.INDICETAMANHO));
        pStmt.setFloat(2, Number(registro.QTD));
        pStmt.setInt(3, parseInt(registro.IDTAMANHO));
        pStmt.setInt(4, parseInt(registro.IDDETALHEPEDIDOGRADE));
        
        pStmt.executeUpdate();
    }
    
    pStmt.close();
}

function atualizarDetalhePedido(registro){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD
        SET
            TBD."IDCOR" =  ?,
            TBD."IDTIPOTECIDO" =  ?,
            TBD."IDLOCALEXPOSICAO" = ?,
            TBD."NUREF" = ?,
            TBD."DSPRODUTO" = ?,
            TBD."QTDTOTAL" = ?,
            TBD."NUCAIXA" = ?,
            TBD."UND" = ?,
            TBD."VRUNITBRUTO" = COALESCE(IFNULL(TBR."FATOR_ACRESCIMO_COMPRA",0),1) * CAST(? AS DECIMAL(21,6)),
            TBD."VRUNITLIQUIDO" = COALESCE(IFNULL(TBR."FATOR_ACRESCIMO_COMPRA",0),1) * CAST(? AS DECIMAL(21,6)),
            TBD."VRVENDA" = ?,
            TBD."VRTOTAL" = ( ${registro.QTDTOTAL} * (COALESCE(IFNULL(TBR."FATOR_ACRESCIMO_COMPRA",0),1) * CAST(? AS DECIMAL(21,6))) ),
            TBD."STECOMMERCE" = ?,
            TBD."STREDESOCIAL" = ?, 
            TBD."IDCATEGORIAS" = ?
        FROM 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD 
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON 
            TBD."IDRESUMOPEDIDO" = TBR."IDRESUMOPEDIDO"
        WHERE 
            TBD."IDDETALHEPEDIDO" =  ?
            OR TBD."IDDETALHEPEDIDOPRIMARIO" =  ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, registro.IDCOR);
    pStmt.setInt(2, registro.IDTIPOTECIDO);
    pStmt.setInt(3, registro.IDLOCALEXPOSICAO);
    pStmt.setString(4, registro.NUREF);
    pStmt.setString(5, registro.DSPRODUTO);
    pStmt.setFloat(6, registro.QTDTOTAL);
    pStmt.setInt(7, registro.NUCAIXA);
    pStmt.setInt(8, registro.UND);
    pStmt.setFloat(9, registro.VRUNITBRUTO);
    pStmt.setFloat(10, registro.VRUNITLIQUIDO);
    pStmt.setFloat(11, registro.VRVENDA);
    pStmt.setFloat(12, registro.VRUNITLIQUIDO);
    pStmt.setString(13, registro.STECOMMERCE);
    pStmt.setString(14, registro.STREDESOCIAL);
    pStmt.setInt(15, registro.IDCATEGORIAS);
    pStmt.setInt(16, registro.IDDETALHEPEDIDO);
    pStmt.setInt(17, registro.IDDETALHEPEDIDO);
    
    pStmt.executeUpdate();
    pStmt.close();
}

function atualizarDadosPedido(registro){
    atualizarDetalhePedido(registro);
    
    atualizarTabelaDetalheGrade(registro.DETALHEGRADE);
    
    atualizarTabelaDetalheProdutoPedido(registro);
    
    atualizarTabelaResumoPedido(registro);
}

function fnHandleGet(byId) {
    let idPedido = $.request.parameters.get("idpedido");
    let idDetPedido = $.request.parameters.get("iddetPedido");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let sttransformado = $.request.parameters.get("sttransformado");

    let query = `
        SELECT 
            TBRP.IDGRUPOEMPRESARIAL, 
            TBRP.IDSUBGRUPOEMPRESARIAL, 
            TBRP.IDANDAMENTO, 
            TBA.DSSETOR, 
            TBDP.IDDETALHEPEDIDO AS IDDETPEDIDO, 
            TBDP.IDRESUMOPEDIDO AS IDPEDIDO, 
            TBDP.IDCOR, 
            TBDP.IDTIPOTECIDO, 
            TBSE.IDGRUPOESTRUTURA, 
            TBDP.IDSUBGRUPOESTRUTURA, 
            TBSE.DSSUBGRUPOESTRUTURA, 
            TBDP.IDCATEGORIAPEDIDO, 
            TBCP.DSCATEGORIAPEDIDO, 
            TBCP.TIPOPEDIDO, 
            TBCOR.DSCOR, 
            TBFORN.IDFORNECEDOR, 
            TBFORN.NORAZAOSOCIAL, 
            TBFORN.NOFANTASIA, 
            TBFORN.NUCNPJ, 
            TBFAB.IDFABRICANTE,  
            TBFAB.DSFABRICANTE,  
            TBT.DSTIPOTECIDO,  
            TBLE.IDLOCALEXPOSICAO,  
            TBLE.DSLOCALEXPOSICAO,  
            TBE.IDESTILO,  
            TBE.DSESTILO,  
            TBDP.NUREF, 
            TBDP.DSPRODUTO, 
            TBDP.QTDTOTAL, 
            TBDP.NUCAIXA, 
            TBUM.DSSIGLA, 
            TBUM.IDUNIDADEMEDIDA, 
            ( TBDP.VRUNITBRUTO) AS VRUNITBRUTODETALHEPEDIDO, 
            IFNULL( TBDP.DESC01,0) AS DESC01, 
            IFNULL( TBDP.DESC02,0) AS DESC02, 
            IFNULL( TBDP.DESC03,0) AS DESC03, 
            ( TBDP.VRUNITLIQUIDO) AS VRUNITLIQDETALHEPEDIDO,  
            ( TBDP.VRVENDA) AS VRVENDADETALHEPEDIDO, 
            ( TBDP.VRTOTAL) AS VRTOTALDETALHEPEDIDO, 
            TBDP.STRECEBIDO, 
            TBDP.STECOMMERCE, 
            TBDP.STREDESOCIAL, 
            TBDP.STCANCELADO, 
            TBDP.STTRANSFORMADO, 
            IFNULL( TBDP.VRCUSTOPRODATUAL,0) AS VRCUSTOPRODATUAL, 
            IFNULL( TBDP.VRVENDAPRODATUAL,0) AS VRVENDAPRODATUAL, 
            TBDP.OBSPRODUTO, 
            TBDP.IDCATEGORIAS AS CATEGORIAPROD, 
            TBC.DSCATEGORIAS AS DSCATEGORIAPROD, 
            TBC.TPCATEGORIAS AS TPCATEGORIAPROD, 
            TBC.TPCATEGORIAPEDIDO AS TPCATEGORIAPRODPEDIDO, 
            TO_VARCHAR( TBRP.DTPEDIDO, 'DD-MM-YYYY HH24:MI:SS') AS DTPEDIDO 
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO TBDP 
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBRP ON
            TBDP.IDRESUMOPEDIDO = TBRP.IDRESUMOPEDIDO  
        INNER JOIN "VAR_DB_NAME".ANDAMENTOS TBA ON
            TBRP.IDANDAMENTO = TBA.IDANDAMENTO  
        INNER JOIN "VAR_DB_NAME".COR TBCOR ON
            TBDP.IDCOR = TBCOR.IDCOR  
        INNER JOIN "VAR_DB_NAME".TIPOTECIDOS TBT ON
            TBDP.IDTIPOTECIDO = TBT.IDTPTECIDO  
        INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO TBCP ON
            TBDP.IDCATEGORIAPEDIDO = TBCP.IDCATEGORIAPEDIDO  
        INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBUM ON
            TBDP.UND = TBUM.IDUNIDADEMEDIDA  
        INNER JOIN "VAR_DB_NAME".ESTILOS TBE ON
            TBDP.IDESTILO = TBE.IDESTILO  
        INNER JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
            TBDP.IDLOCALEXPOSICAO = TBLE.IDLOCALEXPOSICAO  
        INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
            TBDP.IDSUBGRUPOESTRUTURA = TBSE.IDSUBGRUPOESTRUTURA  
        INNER JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGE ON
            TBSE.IDGRUPOESTRUTURA = TBGE.IDGRUPOESTRUTURA  
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBFORN ON
            TBRP.IDFORNECEDOR = TBFORN.IDFORNECEDOR  
        INNER JOIN "VAR_DB_NAME".FABRICANTE TBFAB ON
            TBDP.IDFABRICANTE = TBFAB.IDFABRICANTE  
        INNER JOIN "VAR_DB_NAME".CATEGORIAS TBC ON
            TBDP.IDCATEGORIAS = TBC.IDCATEGORIAS
        WHERE
            1 = ?
            AND TBRP.STCANCELADO = 'False' 
            AND TBDP.STCANCELADO = 'False' 
    `;
    
    if ( byId ) {
        query += ` AND TBDP.IDDETALHEPEDIDO = '${byId}' `;
    }
    if ( idDetPedido ) {
        query += ` AND TBDP.IDDETALHEPEDIDO = '${idDetPedido}' `;
    }
    if ( idPedido ) {
        query += ` AND TBDP.IDRESUMOPEDIDO = '${idPedido}' `;
    }
    if ( sttransformado ) {
        query += ` AND TBDP.STTRANSFORMADO = '${sttransformado}' `;
    }
    if( dataPesquisaInicio && dataPesquisaFim ) {
        query += ` AND (TO_DATE(TBRP.DTPEDIDO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }
    
    query += ' ORDER BY TBDP.NUREF, TBDP.DSPRODUTO ';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (let i = 0; i < response.data.length; i++) {
		let registro = response.data[i];
        
        data.push(
            Object.assign({}, registro, {
                DETALHEGRADE: obterLinhasDoDetalheGrade(registro.IDDETPEDIDO)
            })
        );
	}

	response.data = data;

	return response;
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    //return bodyJson
    if(bodyJson.length){
        conn = $.db.getConnection();
        
        for (let registro of bodyJson) {
            let stPedidoRN = registro.STPEDIDOPRIMARIO == 'True';
            let successValidacao = false;
            let msgValidacao = '';
            let stEditarItemPedidoSAP = true//false;
            
            /*if(stPedidoRN){
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
                registrarErrorLog(registro.IDDETALHEPEDIDO, msgValidacao);
                
                return returnWarning(msgValidacao);
            }*/
            //return registro
            let arrayResp = []
            if(stEditarItemPedidoSAP){
                let dadosItensParaEditar = getDadosItensPedidoParaEditarSAP(registro);
                
                for(let dadosItem of dadosItensParaEditar){
                    let resp = libEditItemPedido.editarItemPedidoSAP(dadosItem, registro.DETALHEGRADE);
                    arrayResp.push(resp);
                    continue;
                    let { success, msg } = libEditItemPedido.editarQtdVrCustoItemPedidoSAP(dadosItem, registro.DETALHEGRADE);
                    
                    if(!success){
                        registrarErrorLog(registro.IDDETALHEPEDIDO, msg);
                        
                        return returnWarning(msg);
                    }
                }
            }   
            //return arrayResp
            atualizarDadosPedido(registro);
        }
        
        conn.commit();
    }
	
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
            var docReturn = fnHandleGet(id);
            $.response.setBody(JSON.stringify(docReturn));
            //fnHandleGet(id);
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