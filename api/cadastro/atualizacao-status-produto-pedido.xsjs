let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let libCancelProdutoPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.cancelamento.libs", "remover-produto-pedido");

let dbNameSap = 'SBO_GTO_TESTE4';
let conn;

// Get de Dados

function getValoresComDetalhePedidoCancelado(idResumoPedido, idDetalhePedido){
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

function getValoresComDetalhePedidoAjustado(idResumoPedido, qtdParaSubtrair, vrParaSubtrair){
    let query = `
        SELECT 
            IFNULL(COUNT(IDDETALHEPEDIDO), 0) TOTALITENS, 
            IFNULL(SUM(QTDTOTAL) - ${qtdParaSubtrair}, 0) QTDTOTAL, 
            IFNULL(SUM(VRTOTAL) - ${vrParaSubtrair}, 0) VRTOTAL
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            IDRESUMOPEDIDO = ${idResumoPedido}
            AND STCANCELADO = 'False'
            AND 1 = ?
    `;

	return api.sqlQuery(query, 1);
}

function getValoresAtualizadoDoPedido(idResumoPedido, idDetalhePedido, qtdParaSubtrair, vrParaSubtrair){
    return qtdParaSubtrair > 0 ? getValoresComDetalhePedidoAjustado(idResumoPedido, qtdParaSubtrair, vrParaSubtrair) : getValoresComDetalhePedidoCancelado(idResumoPedido, idDetalhePedido)
}

function getDadosPedido(dados){
    let query = `
        SELECT
            IDDETALHEPRODUTOPEDIDO,
            IDRESUMOPEDIDO,
            IDDETALHEPEDIDO,
            QTDPRODUTO,
            ${dados.IDRESPCANCELAMENTO} AS IDRESPCANCELAMENTO,
            '${dados.TXTOBSCANCELAMENTO}' AS TXTOBSCANCELAMENTO
        FROM    
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        WHERE 
            "IDDETALHEPRODUTOPEDIDO" = ${dados.IDDETALHEPRODUTOPEDIDO}
            AND 1 = ?
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
    return query
    return api.sqlQuery(query, 1);
}

function getDadosPedidoSecundario(dados){
    let query = `
        SELECT
            IDDETALHEPRODUTOPEDIDO,
            IDRESUMOPEDIDO,
            IDDETALHEPEDIDO,
            QTDPRODUTO,
            ${dados.IDRESPCANCELAMENTO} AS IDRESPCANCELAMENTO,
            '${dados.TXTOBSCANCELAMENTO}' AS TXTOBSCANCELAMENTO
        FROM    
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        WHERE 
            "IDDETALHEPRODUTOPEDIDOPRIMARIO" = ${dados.IDDETALHEPRODUTOPEDIDO}
            AND 1 = ?
    `;
    
    return api.sqlQuery(query, 1);
}

function getDadosItemPedidoQuality(idDetalheProdutoPedido){
    let query = `
        SELECT 
            TBDP.IDRESUMOPEDIDO,
            TBDP.IDPRODCADASTRO
		FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
		WHERE
            TBDP.STCANCELADO = 'False'
            AND IFNULL(TBDP.IDPRODCADASTRO, 'NULL') <> 'NULL'
            AND TBDP.IDDETALHEPRODUTOPEDIDO = ${idDetalheProdutoPedido}
            AND 1 = ?
        ORDER BY 
            TBDP.IDDETALHEPEDIDO,
            TBDP.IDDETALHEPRODUTOPEDIDO
    `;

	return api.sqlQuery(query, 1);
}

function getDadosItemPedidoSAP(idDetalheProdutoPedido){
    let query = `
        SELECT
            TBO."DocEntry",
            TBDP.IDRESUMOPEDIDO,
            TBDP.IDPRODCADASTRO,
            TBO."DocStatus",
            TBP1."LineStatus",
            IFNULL(TBP1."TrgetEntry", 0) AS "DocEntryNotaEntrada"
		FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
        INNER JOIN ${dbNameSap}.OPOR TBO ON
            TO_VARCHAR(TBDP.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
        INNER JOIN ${dbNameSap}.POR1 TBP1 ON
            TBO."DocEntry" = TBP1."DocEntry" AND TO_VARCHAR(TBDP.IDPRODCADASTRO) = TBP1."ItemCode" 
		WHERE
            TBDP.STCANCELADO= 'False'
            AND IFNULL(TBDP.IDPRODCADASTRO, 'NULL') <> 'NULL'
            AND TBDP.IDDETALHEPRODUTOPEDIDO = ${idDetalheProdutoPedido}
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
            TBR.STCANCELADO = 'False'
            AND IFNULL(TBP1."TrgetEntry", 0) > 0
            AND TBR.IDRESUMOPEDIDO = '${idResumoPedido}'
            AND 1 = ?
    `;

	return api.sqlQuery(query, 1);
}

// Validação

function fnValidarSeExisteAlgumaEntradaNoPedido(idResumoPedido){
    let query = `
        SELECT 
            TBR.IDRESUMOPEDIDO
		FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN ${dbNameSap}.OPOR TBO ON
            TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
        INNER JOIN ${dbNameSap}.POR1 TBP1 ON
            TBO."DocEntry" = TBP1."DocEntry"
		WHERE
            TBR.STCANCELADO = 'False'
            AND IFNULL(TBP1."TrgetEntry", 0) > 0
            AND TBR.IDRESUMOPEDIDO = ?
    `;

	let reg = api.sqlQuery(query, idResumoPedido);
	
	if(reg.length > 0){
        return {
            msg: 'Erro ao cancelar o Item no SAP, Pedido recepcionado total ou parcialmente no SAP',
            status: 'warning'
        };
	}
	
	return { status: true }
}

function fnValidarItensNoSap(idDetalheProdutoPedido){
    let query = `
        SELECT 
            TBDP.IDRESUMOPEDIDO,
            TBDP.IDPRODCADASTRO,
            TBO."DocStatus",
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
            AND TBDP.IDDETALHEPRODUTOPEDIDO = ${idDetalheProdutoPedido}
            AND 1 = ?
        ORDER BY 
            TBDP.IDDETALHEPEDIDO,
            TBDP.IDDETALHEPRODUTOPEDIDO
    `;

	let regItens = api.sqlQuery(query, 1);
	
    if(regItens.length > 0){
        
        for( let i = 0; i < regItens.length; i++ ) {
            
            let { IDRESUMOPEDIDO, IDPRODCADASTRO, DocStatus, LineStatus, DocEntryNotaEntrada } = regItens[i];
            
            if(DocStatus != "O" || LineStatus != "O" || DocEntryNotaEntrada != 0){
                return {
                    msg: 'Erro ao cancelar o Item no SAP, Pedido Fechado ou Item com recepção total, parcial ou linha fechada no SAP',
                    status: 'warning'
                };
            }
            
        }
	}
	
	return { status: true }
}

function fnValidarSeProdutoEstaAptoAoCancelamento(idResumoPedido, idDetalheProdutoPedido){
    let respPedidoValido = fnValidarSeExisteAlgumaEntradaNoPedido(idResumoPedido)
    let respItensValidos = fnValidarItensNoSap(idDetalheProdutoPedido);
    let respValidacao;
    
    if(respItensValidos.status == true){
        if(respPedidoValido.status == true){
            respValidacao = { status: true, stCancelSAP: true };
        } else {
            respValidacao = { status: true, stCancelSAP: false }; /*{
                msg: 'Erro ao cancelar o Item no SAP, Pedido recepcionado parcialmente no SAP, remova o item manualmente no sap e tente novamente',
                status: 'warning'
            };*/
        }
    } else {
        respValidacao = respItensValidos;
    }
    
    return respValidacao;
}

// Gravação de Dados no BD

function fnAtualizarValoresResumoPedido(idResumoPedido, idDetalhePedido, qtdParaSubtrair, vrParaSubtrair){
	let dados = getValoresAtualizadoDoPedido(idResumoPedido, idDetalhePedido, qtdParaSubtrair, vrParaSubtrair)

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
    
    pStmt.setInt(1, parseInt(dados.TOTALITENS || 0));
    pStmt.setFloat(2, parseFloat(dados.QTDTOTAL || 0));
    pStmt.setFloat(3, parseFloat(dados.VRTOTAL || 0));
    pStmt.setFloat(4, parseFloat(dados.VRTOTAL || 0));
    pStmt.setInt(5, parseInt(idResumoPedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function fnCancelarDetalheProdutoPedido(registro){
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
    pStmt.setInt(3, parseInt(registro.IDDETALHEPRODUTOPEDIDO));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function fnCancelarDetalheGrade(idDetalhePedido){
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

function fnCancelarDetalhePedido(registro){
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
    pStmt.setInt(4, parseInt(registro.IDDETALHEPEDIDO));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function fnAjustarDetalhePedido(idDetalhePedido, qtdDetalhePedido, vrUnitLiquido){
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
    let vrTotal = qtdDetalhePedido * vrUnitLiquido;
    
    pStmt.setInt(1, qtdDetalhePedido);
    pStmt.setFloat(2, vrTotal);
    pStmt.setInt(2, parseInt(idDetalhePedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function fnAjustarDetalheGrade(idDetalhePedido, qtdDetalheProdutoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE 
        SET 
            STATIVO = 'False',
            STCANCELADO = 'True'
        WHERE
            STATIVO = 'True'
            AND QTD = ${qtdDetalheProdutoPedido}
            AND IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(idDetalhePedido));
    
    pStmt.executeUpdate();
    pStmt.close();
}

function fnCancelarItemNoPedidoSAP(idDetalheProdutoPedido){
	let regItens = getDadosItemPedidoSAP(idDetalheProdutoPedido);
	let resp = 'True';
	
	if(regItens.length > 0){
        
        for( let { DocEntry, IDRESUMOPEDIDO, IDPRODCADASTRO } of regItens) {
            resp = libCancelProdutoPedido.executeCancelamentoProdutoPedidoCompra(DocEntry, IDRESUMOPEDIDO, idDetalheProdutoPedido);
        }
	}
return resp
	if(resp.status == 'False'){
        return {
            msg: (resp.msg || 'Erro ao cancelar o Item no SAP, verifique o log de erro'),
            status: 'warning'
        };
	}
	
	return { status: 'True' }
}

function executeCancelamentoProdutoPedido(dadosProdutoPedido){
    let { IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO, IDDETALHEPEDIDO, QTDPRODUTO } = dadosProdutoPedido;
    let { QTDTOTAL, VRUNITLIQUIDO } = getDadosDetalhePedido(dadosProdutoPedido);
    let respValidacao = fnValidarSeProdutoEstaAptoAoCancelamento(IDRESUMOPEDIDO, IDDETALHEPRODUTOPEDIDO);
    
    let qtdRestante = Number(QTDTOTAL) - Number(QTDPRODUTO);
    
    if(qtdRestante < 0){
        return {
            msg: 'Quantidado do produto não está batendo com a quantidade gradeada no pedido',
            status: 'warning'
        }
    }
    
    if(respValidacao.status == 'warning'){
        return respValidacao;
    }
    
    let { stCancelSAP } = respValidacao;
    
    if(stCancelSAP){
        let respCancelItemSap = fnCancelarItemNoPedidoSAP(IDDETALHEPRODUTOPEDIDO);
        return respCancelItemSap
        
        if(respCancelItemSap.status == 'warning'){
            return respCancelItemSap;
        }
    }
    return 'SO QUALITY'
    
    if(qtdRestante == 0){
        fnCancelarDetalhePedido(dadosProdutoPedido);
        
        fnCancelarDetalheGrade(IDDETALHEPEDIDO);
        
    } else {
        let vrParaSubtrair = QTDPRODUTO * VRUNITLIQUIDO;
        
        fnAjustarDetalhePedido(IDDETALHEPEDIDO, qtdRestante, VRUNITLIQUIDO);
        
        fnAjustarDetalheGrade(IDDETALHEPEDIDO, QTDPRODUTO);
        
        fnAtualizarValoresResumoPedido(IDRESUMOPEDIDO, IDDETALHEPEDIDO, QTDPRODUTO, vrParaSubtrair);
    }
    
    fnCancelarDetalheProdutoPedido(IDDETALHEPRODUTOPEDIDO);
    
    return { status: 'True' };
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    if(bodyJson.length > 0){
        conn = $.db.getConnection();
        
        for(let i = 0; i < bodyJson.length; i++){
            let registro = bodyJson[i];
            let dadosPedido = getDadosPedido(registro);
            let dadosPedidoSecundario = getDadosPedidoSecundario(registro);
            let respCancelProtutoPedidoSecundario = { status: 'True' };
            
            let respCancelProdutoPedido = executeCancelamentoProdutoPedido(dadosPedido[0]);
            return {msg:'teste', respCancelProdutoPedido}
            if(respCancelProdutoPedido.status != 'True'){
                return respCancelProdutoPedido
            }
            
            if(dadosPedidoSecundario.length > 0){
                respCancelProtutoPedidoSecundario = executeCancelamentoProdutoPedido(dadosPedidoSecundario[0]);
            }
            
            if(respCancelProtutoPedidoSecundario.status != 'True'){
                return respCancelProtutoPedidoSecundario
            }
            
        }
        
        conn.commit();
        
    }
    
    return {
        "msg": "Cancelamento realizado com sucesso!",
        "status": "success"
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