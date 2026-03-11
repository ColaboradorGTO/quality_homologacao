let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let libRemoverProdutos = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.cancelamento.libs", "remover-referencia-pedido");

let dbNameSap = 'SBO_GTO_TESTE4';
let conn;

function getValoresAtualizadoDoPedido(idResumoPedido, idDetalhePedido){
     let query = `
        SELECT 
            IFNULL(COUNT(IDDETALHEPEDIDO), 0) TOTALITENS, 
            IFNULL(SUM(QTDTOTAL), 0) QTDTOTAL, 
            IFNULL(SUM(VRTOTAL), 0) VRTOTAL
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

function getIdsPedidoSecundario(idDetalhePedidoPrimario){
    let query = `
        SELECT
            IDRESUMOPEDIDO AS IDRESUMOPEDIDOSECUNDARIO,
            IDDETALHEPEDIDO AS IDDETALHEPEDIDOSECUNDARIO
        FROM    
            "VAR_DB_NAME"."DETALHEPEDIDO" 
        WHERE 
            "IDDETALHEPEDIDOPRIMARIO" = ${idDetalhePedidoPrimario}
            AND 1 = ?
    `;
    
    return api.sqlQuery(query, 1);
}

function getIdsItensParaRemoverPedidoSAP(idDetalhePedido){
    let query = `
        SELECT
            TBO."DocEntry",
            TBDP.IDRESUMOPEDIDO,
            STRING_AGG( '''' || TBDP.IDPRODCADASTRO || '''', ', ' ORDER BY TBDP.IDDETALHEPEDIDO, TBDP.IDDETALHEPRODUTOPEDIDO ) AS IDS_PRODUTOS
		FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
        INNER JOIN ${dbNameSap}.OPOR TBO ON
            TO_VARCHAR(TBDP.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
		WHERE
            TBDP."STCANCELADO"= 'False'
            AND IFNULL(TBDP.IDPRODCADASTRO, 'NULL') <> 'NULL'
            AND TBDP."IDDETALHEPEDIDO" = ${idDetalhePedido}
            AND 1 = ?
        GROUP BY  
            TBO."DocEntry",
            TBDP.IDRESUMOPEDIDO
    `;

	return api.sqlQuery(query, 1);
}

function getListaProdutosQuePermaneceraoNoPedido(idResumoPedido, idDetalhePedido){
    let query = `
		SELECT
            TBO."DocEntry",
            TBR.IDRESUMOPEDIDO,
            TBD.IDDETALHEPEDIDO,
            TBDP.IDDETALHEPRODUTOPEDIDO,
            TBDP.IDPRODCADASTRO,
            TBDP.QTDPRODUTO,
            TBDP.VRCUSTO
		FROM 
			"VAR_DB_NAME".RESUMOPEDIDO TBR
		INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON 
			TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO 
		INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON 
            TBDP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO
		LEFT JOIN ${dbNameSap}.OPOR TBO ON
            TBR.DOCENTRY_PEDIDO_SAP = TBO."DocEntry" AND TO_VARCHAR(TBDP.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV" AND TBO."DocStatus" = 'O'
		LEFT JOIN ${dbNameSap}.POR1 TBP1 ON
            TBO."DocEntry" = TBP1."DocEntry" AND TO_VARCHAR(TBDP.IDPRODCADASTRO) = TBP1."ItemCode" AND TBP1."LineStatus" = 'O' AND IFNULL(TBP1."TrgetEntry", 0) = 0
		WHERE 
            TBR.STCANCELADO = 'False'
            AND TBD.STCANCELADO = 'False' 
            AND TBDP.STCANCELADO = 'False' 
            AND TBD.IDRESUMOPEDIDO = ${idResumoPedido}
            --AND TBD.IDDETALHEPEDIDO <> ${idDetalhePedido}
            AND 1 = ?
		ORDER BY 
			TBD.IDDETALHEPEDIDO,
			TBDP.IDDETALHEPRODUTOPEDIDO
    `;
    
    return api.sqlQuery(query, 1);
}

function getDadosItemPedidoSAP(idDetalhePedido){
    let query = `
        SELECT
            TBO."DocEntry",
            TBO."DocStatus",
            TBDP.IDRESUMOPEDIDO,
            TBDP.IDPRODCADASTRO,
            TBP1."LineStatus",
            IFNULL(TBP1."TrgetEntry", 0) AS "DocEntryNotaEntrada"
		FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
        INNER JOIN ${dbNameSap}.OPOR TBO ON
            TO_VARCHAR(TBDP.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
        INNER JOIN ${dbNameSap}.POR1 TBP1 ON
            TBO."DocEntry" = TBP1."DocEntry" AND TO_VARCHAR(TBDP.IDPRODCADASTRO) = TBP1."ItemCode" 
		WHERE
            TBDP."STCANCELADO"= 'False'
            AND IFNULL(TBDP.IDPRODCADASTRO, 'NULL') <> 'NULL'
            AND TBDP."IDDETALHEPEDIDO" = ${idDetalhePedido}
            AND 1 = ?
        ORDER BY 
            TBDP.IDDETALHEPEDIDO,
            TBDP.IDDETALHEPRODUTOPEDIDO
    `;

	return api.sqlQuery(query, 1);
}

function getItemComEntradaNoPedidoSAP(idResumoPedido){
    let query = `
        SELECT TOP 1
            TBO."DocEntry"
		FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN ${dbNameSap}.OPOR TBO ON
            TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
        INNER JOIN ${dbNameSap}.POR1 TBP1 ON
            TBO."DocEntry" = TBP1."DocEntry"
		WHERE
            TBR."STCANCELADO"= 'False'
            AND IFNULL(TBP1."TrgetEntry", 0) > 0
            AND TBR.IDRESUMOPEDIDO = '${idResumoPedido}'
            AND 1 = ?
    `;

	return api.sqlQuery(query, 1);
}

function validarSeExisteAlgumaEntradaNoPedido(idResumoPedido){
	let reg = getItemComEntradaNoPedidoSAP(idResumoPedido)
	
	if(reg.length > 0){
        return {
            "isValid": false,
            "msg": 'Erro ao cancelar o Item no SAP, Pedido com recepção total ou parcial no SAP',
        };
	}
	
	return { "isValid": true }
}

function validarItensNoSap(idDetalhePedido){
	let regItens = getDadosItemPedidoSAP(idDetalhePedido);
	
    if(regItens.length > 0){
        
        for( let i = 0; i < regItens.length; i++ ) {
            
            let { IDRESUMOPEDIDO, IDPRODCADASTRO, DocStatus, LineStatus, DocEntryNotaEntrada } = regItens[i];
            
            if(DocStatus != "O" || LineStatus != "O" || DocEntryNotaEntrada != 0){
                let motivo = DocStatus != "O" ? 'Pedido Fechado' : DocEntryNotaEntrada != 0 ? 'Referencia com recepção total ou parcial' : 'Referencia com linha fechada'
                
                return {
                    "isValid": false,
                    "msg": `Erro ao cancelar o Item no SAP, ${motivo} no SAP`
                };
            }
            
        }
	}
	
	return { "isValid": true }
}

function validarSeItemEstaAptoAoCancelamento(idResumoPedido, idDetalhePedido){
    let respValidacaoPedido = validarSeExisteAlgumaEntradaNoPedido(idResumoPedido)
    let respValidacaoItens = validarItensNoSap(idDetalhePedido);
    let respValidacao = { "isValid": true, "isValidToCancelInSAP": true };
    
    if(respValidacaoItens.isValid){
        respValidacao.isValidToCancelInSAP = respValidacaoPedido.isValid;
    } else {
        respValidacao = respValidacaoItens;
    }
    
    return respValidacao;
}

function atualizarValoresResumoPedido(idResumoPedido, idDetalhePedido){
	let dados = getValoresAtualizadoDoPedido(idResumoPedido, idDetalhePedido)

    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET 
            "NUTOTALITENS" = ?, 
            "QTDTOTPRODUTOS" =  ?, 
            "VRTOTALBRUTO" =  ?, 
            "VRTOTALLIQUIDO" =  ?, 
            "DTMOVPEDIDO" = now()
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(dados[0].TOTALITENS || 0));
    pStmt.setFloat(2, parseFloat(dados[0].QTDTOTAL || 0));
    pStmt.setFloat(3, parseFloat(dados[0].VRTOTAL || 0));
    pStmt.setFloat(4, parseFloat(dados[0].VRTOTAL || 0));
    pStmt.setInt(5, parseInt(idResumoPedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function cancelarItemNoPedidoSAP(idResumoPedido, idDetalhePedido, idFilial, usoPrincipal){
	let listaProdutosQuePermanecerao = getListaProdutosQuePermaneceraoNoPedido(idResumoPedido, idDetalhePedido)
	let respRemocaoSAP = { "success": true };
	
	if(listaProdutosQuePermanecerao.length > 0){
        let { DocEntry, IDRESUMOPEDIDO, IDDETALHEPEDIDO } = listaProdutosQuePermanecerao[0];
        
        respRemocaoSAP = libRemoverProdutos.removerProdutosDoPedidoSAP(DocEntry, IDRESUMOPEDIDO, IDDETALHEPEDIDO, idFilial, usoPrincipal, listaProdutosQuePermanecerao);
	}
    return respRemocaoSAP;
}

function cancelarDetalheProdutoPedido(idDetalhePedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO 
        SET 
            STATIVO = 'False',
            STCANCELADO = 'True'
        WHERE 
            IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(idDetalhePedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function cancelarDetalheGrade(idDetalhePedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE 
        SET 
            STATIVO = 'False',
            STCANCELADO = 'True'
        WHERE
            STATIVO = 'True'
            AND IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(idDetalhePedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function cancelarDetalhePedido(idDetalhePedido, registro){
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
    
    pStmt.setString(1, registro.STCANCELADO);
    pStmt.setInt(2, registro.IDRESPCANCELAMENTO);
    pStmt.setString(3, registro.TXTOBSCANCELAMENTO);
    pStmt.setInt(4, parseInt(idDetalhePedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function executeCancelamentoItemPedido(idResumoPedido, idDetalhePedido, registro, idFilial, usoPrincipal){
    let respValidacao = validarSeItemEstaAptoAoCancelamento(idResumoPedido, idDetalhePedido)
    
    if(!respValidacao.isValid){
        return respValidacao;
    }
    
    let { isValidToCancelInSAP } = respValidacao;
    
    if(isValidToCancelInSAP){
        let respCancelItemSap = cancelarItemNoPedidoSAP(idResumoPedido, idDetalhePedido, idFilial, usoPrincipal);
        
        if(!respCancelItemSap.success){
            return respCancelItemSap;
        }
    }
    
    cancelarDetalhePedido(idDetalhePedido, registro);
    
    cancelarDetalheGrade(idDetalhePedido);
    
    cancelarDetalheProdutoPedido(idDetalhePedido);

    atualizarValoresResumoPedido(idResumoPedido, idDetalhePedido);
    
    return { "isValid": true };
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    let msg = 'Cancelamento realizado com sucesso!';
    let success = false;
    let resp = []
    
    if(bodyJson.length > 0){
        conn = $.db.getConnection();
        for(let i = 0; i < bodyJson.length; i++){
            let registro = bodyJson[i];
            let idResumoPedido = registro.IDRESUMOPEDIDO;
            let idDetalhePedido = registro.IDDETALHEPEDIDO;
            let dadosPedidoSecundario = getIdsPedidoSecundario(registro.IDDETALHEPEDIDO);
            let respCancelItemPedido = executeCancelamentoItemPedido(idResumoPedido, idDetalhePedido, registro, 101, 10);
            resp.push({respCancelItemPedido})
            
            if(!respCancelItemPedido.isValid){
                msg = respCancelItemPedido.msg;
                
                break;
            }
            
            if(dadosPedidoSecundario.length > 0){
                let { IDRESUMOPEDIDOSECUNDARIO, IDDETALHEPEDIDOSECUNDARIO } = dadosPedidoSecundario[0];
                let respCancelItemPedidoSecundario = executeCancelamentoItemPedido(Number(IDRESUMOPEDIDOSECUNDARIO), Number(IDDETALHEPEDIDOSECUNDARIO), registro, 125, 21);
                
                resp.push({respCancelItemPedidoSecundario})
                
                if(!respCancelItemPedidoSecundario.isValid){
                    msg = respCancelItemPedidoSecundario.msg;
                    
                    break;
                }
            }
            
            
        }
        
        success = true;
        
        conn.commit();
        
    }
    
    return { success, msg, resp };
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