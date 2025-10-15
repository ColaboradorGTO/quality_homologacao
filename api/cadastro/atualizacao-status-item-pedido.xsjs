var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var libCancelamentoItemPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.cancelamento.libs.produto", "libCancelamentoItemPedido");

function getIdDetalhePedidoSecundario(idDetalhePedidoPrimario){
    let query = `
        SELECT
            IDRESUMOPEDIDO,
            IDDETALHEPEDIDO
        FROM    
            "VAR_DB_NAME"."DETALHEPEDIDO" 
        WHERE 
            "IDDETALHEPEDIDOPRIMARIO" = ?
    `;
    
    return api.sqlQuery(query, idDetalhePedidoPrimario);
    
    if(regDetalhe.length > 0){
        return regDetalhe[0]
    }
    
    return 0;
}

function fnUpdateValoresResumoPedido(idResumoPedido, conn){
    let querydetpedido = `
        SELECT 
            IFNULL(COUNT(IDDETALHEPEDIDO), 0) TOTALITENS, 
            IFNULL(SUM(QTDTOTAL), 0) QTDTOTAL, 
            IFNULL(SUM(VRTOTAL), 0) VRTOTAL
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            "STCANCELADO"= 'False' 
            AND IDRESUMOPEDIDO = ?
    `;

	let regDetalhe = api.sqlQuery(querydetpedido, parseInt(idResumoPedido));
	let dados = regDetalhe[0];

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
    
    pStmt.execute();
    pStmt.close();
}

function fnAtualizarProdSAP(idDetPedido){
    idDetPedido = Number(idDetPedido);
    
    var querydetpedido = ' SELECT (DETPED.IDPRODCADASTRO), DETPED.IDRESUMOPEDIDO' +
		' FROM  ' +
		'   "VAR_DB_NAME".DETALHEPRODUTOPEDIDO  DETPED' +
		'  WHERE  ' +
		'   DETPED."STCANCELADO"=\'True\' AND ' +
		'   DETPED."IDDETALHEPEDIDO" = ?  ';

	var linha2 = api.sqlQuery(querydetpedido, idDetPedido);
    for (var i = 0; i < linha2.length; i++) {
        
        var det2 = linha2[i];
        
        libCancelamentoItemPedido.executeCancelamentoProdutoPedidoCompra(det2.IDRESUMOPEDIDO, det2.IDPRODCADASTRO);
        /*if(retIntegracaoCancelItemPedido === 'True'){
            return {
                "msg": "Cancelamento realizado com sucesso!"
            };
        }else{
            return {
                "msg": "Error Cancelamento!"
            };
        }*/
        
    }
    	
    return {
        "msg": "Cancelamento realizado com sucesso!"
    };
    
	//conn.commit();
}

function fnAtualizarDetalheGrade(idDetalhePedido, stCancelado, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE 
        SET 
            STATIVO = ?
        WHERE 
            IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, stCancelado);
    pStmt.setInt(2, parseInt(idDetalhePedido));
    
    pStmt.execute();
    pStmt.close();
}

function fnAtualizarDetalheProdutoPedido(idDetalhePedido, stCancelado, conn){
    let stAtivo = stCancelado == 'True' ? 'False' : 'True';
    
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO 
        SET 
            STATIVO = ?,
            STCANCELADO = ?
        WHERE 
            IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, stAtivo);
    pStmt.setString(2, stCancelado);
    pStmt.setInt(3, parseInt(idDetalhePedido));
    
    pStmt.execute();
    pStmt.close();
}

function fnAtualizaDetalhePedidoSecundario(registro, conn) {
    let dadosPedidoSecundario = getIdDetalhePedidoSecundario(registro.IDDETALHEPEDIDO);
    
    if(dadosPedidoSecundario.length > 0){
        let idResumoPedidoSecundario = parseInt(dadosPedidoSecundario[0].IDRESUMOPEDIDO);
        let idDetalhePedidoSecundario = parseInt(dadosPedidoSecundario[0].IDDETALHEPEDIDO);
        
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
        pStmt.setInt(4, idDetalhePedidoSecundario);
        
        pStmt.execute();
        pStmt.close();
        
        conn.commit();
        
        fnAtualizarDetalheGrade(idDetalhePedidoSecundario, registro.STCANCELADO, conn);
        fnAtualizarDetalheProdutoPedido(idDetalhePedidoSecundario, registro.STCANCELADO, conn)
        fnUpdateValoresResumoPedido(idResumoPedidoSecundario, conn);
    }
}

function fnHandlePut() {
    let conn = $.db.getConnection();
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
    let bodyJson = JSON.parse($.request.body.asString());
    
    for(let i = 0; i < bodyJson.length; i++){
        let registro = bodyJson[i];
        
        pStmt.setString(1, registro.STCANCELADO);
        pStmt.setInt(2, registro.IDRESPCANCELAMENTO);
        pStmt.setString(3, registro.TXTOBSCANCELAMENTO);
        pStmt.setInt(4, parseInt(registro.IDDETALHEPEDIDO));
        
        pStmt.execute();
        
        conn.commit();
        
        if(registro.STPEDIDOPRIMARIO == 'True'){
            fnAtualizaDetalhePedidoSecundario(registro, conn);
        }
        
        fnAtualizarDetalheGrade(registro.IDDETALHEPEDIDO, registro.STCANCELADO, conn);
        fnAtualizarDetalheProdutoPedido(registro.IDDETALHEPEDIDO, registro.STCANCELADO, conn)
        fnUpdateValoresResumoPedido(registro.IDRESUMOPEDIDO, conn);
    }
    
    pStmt.close();
    
    conn.commit();
    
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