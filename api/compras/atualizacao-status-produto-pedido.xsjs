var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function getIdResumoPedidoSecundario(idResumoPedido){
    let query = `
        SELECT 
            TBR.IDRESUMOPEDIDO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        WHERE
            TBR."IDPEDIDOPRIMARIO" = ?
    `;

	let reg = api.sqlQuery(query, idResPedido);
	
	
	return reg.length > 0 ? Number(reg[0].IDRESUMOPEDIDO) : 0;
}

function getValoresPedido(idResumoPedido){
    let dados = {
        TOTALITENS: 0,
        QTDTOTAL: 0,
        VRTOTAL: 0
    };
    
    let query = `
        SELECT 
            IFNULL(COUNT(TBD.IDDETALHEPEDIDO), 0) TOTALITENS, 
            IFNULL(SUM(TBD.QTDTOTAL), 0) QTDTOTAL, 
            IFNULL(SUM(TBD.VRTOTAL), 0) VRTOTAL
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON 
            TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO 
        WHERE
            TBD."STCANCELADO"= 'False'
            AND TBR."IDRESUMOPEDIDO" = ?
    `;

	let reg = api.sqlQuery(query, idResumoPedido);
	
	if(reg.length > 0){
        dados.TOTALITENS = reg[0].TOTALITENS;
        dados.QTDTOTAL = reg[0].QTDTOTAL;
        dados.VRTOTAL = reg[0].VRTOTAL;
	}
	
	return dados;
}

function fnAtualizarResumoPedidoSecundario(idResumoPedido, conn){
    let idResPedido = getIdResumoPedidoSecundario(idResumoPedido);
	let vrPedido = getValoresPedido(idResPedido);
	
	let NUTOTALITENS = parseInt(vrPedido.TOTALITENS || 0);
	let QTDTOTPRODUTOS = parseFloat(vrPedido.QTDTOTAL || 0);
    let VRTOTALBRUTO = parseFloat(vrPedido.VRTOTAL || 0);
    let VRTOTALLIQUIDO = parseFloat(vrPedido.VRTOTAL || 0);
   
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            "NUTOTALITENS" = ?, 
            "QTDTOTPRODUTOS" =  ?, 
            "VRTOTALBRUTO" =  ?, 
            "VRTOTALLIQUIDO" =  ?
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;

    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, NUTOTALITENS);
    pStmt.setFloat(2, QTDTOTPRODUTOS);
    pStmt.setFloat(3, VRTOTALBRUTO);
    pStmt.setFloat(4, VRTOTALLIQUIDO);
    pStmt.setInt(5, parseInt(idResPedido));
    
	pStmt.execute();
	pStmt.close();
}

function fnAtualizarResumoPedido(idResumoPedido, conn){
    let idResPedido = +idResumoPedido;
    let vrPedido = getValoresPedido(idResPedido);
	
	let NUTOTALITENS = parseInt(vrPedido.TOTALITENS || 0);
	let QTDTOTPRODUTOS = parseFloat(vrPedido.QTDTOTAL || 0);
    let VRTOTALBRUTO = parseFloat(vrPedido.VRTOTAL || 0);
    let VRTOTALLIQUIDO = parseFloat(vrPedido.VRTOTAL || 0);
   
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            "NUTOTALITENS" = ?, 
            "QTDTOTPRODUTOS" =  ?, 
            "VRTOTALBRUTO" =  ?, 
            "VRTOTALLIQUIDO" =  ?
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;

    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, NUTOTALITENS);
    pStmt.setFloat(2, QTDTOTPRODUTOS);
    pStmt.setFloat(3, VRTOTALBRUTO);
    pStmt.setFloat(4, VRTOTALLIQUIDO);
    pStmt.setInt(5, parseInt(idResPedido));
    
	pStmt.execute();
	pStmt.close();
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" 
        SET
            "STCANCELADO" = ?,
            "IDRESPCANCELAMENTO" = ?,
            "TXTOBSCANCELAMENTO" = ?,
            "DTCANCELAMENTO" = now()
        WHERE 
            "IDDETALHEPEDIDO" =  ? 
            OR "IDDETALHEPEDIDOPRIMARIO" = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let registro = JSON.parse($.request.body.asString()); 
    let idResumo = registro.IDRESUMOPEDIDO;

    pStmt.setString(1, registro.STCANCELADO);
    pStmt.setInt(2, parseInt(registro.IDRESPCANCELAMENTO) || '');
    pStmt.setString(3, registro.TXTOBSCANCELAMENTO || '');
    pStmt.setInt(4, parseInt(registro.IDDETALHEPEDIDO));
    pStmt.setInt(5, parseInt(registro.IDDETALHEPEDIDO));
    
	pStmt.execute();
    pStmt.close();
    
    conn.commit();
    
    fnAtualizarResumoPedido(idResumo, conn);
    fnAtualizarResumoPedidoSecundario(idResumo, conn);
    
    conn.commit();
    
    return  {
	    "msg" : "Pedido Atualizado com Sucesso!"
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