let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

let conn;

function updateLogSuccessCancelamento(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_CANCELADO_QUALITY = 'True',
            LOG_ERROR = NULL
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
	pStmt.setInt(1, Number(idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function updateLogErrorCancelamento(idResumoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_CANCELADO_QUALITY = 'False',
            LOG_ERROR = ?
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function cancelarResumoPedido(idResumoPedido) {
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO"
        SET
            "IDANDAMENTO" = 13,
            "DSMOTIVOCANCELAMENTO" = 'Cancelamento para Transformar em Pedido Intermediario',
            "DTCANCELAMENTO" = now(),
            "STCANCELADO" = 'True',
            "DTMOVPEDIDO" = now()
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;
  
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoPedido);
    
	pStmt.execute();
    pStmt.close();
}

function cancelarDetalhePedido(idResumoPedido, registro){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDO 
        SET 
            STCANCELADO = 'True',
            DTCANCELAMENTO = NULL,
            TXTOBSCANCELAMENTO = 'Cancelamento para Transformar em Pedido Intermediario'
        WHERE 
            STCANCELADO = 'False'
            AND IDRESUMOPEDIDO = ?
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
	
    pStmt.setInt(1, idResumoPedido);
    
    pStmt.execute();
	pStmt.close();
}

function cancelarDetalhePedidoGrade(idResumoPedido){
    let query = `
        UPDATE 
             "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        SET 
            TBDG.STATIVO = 'False',
            TBDG.STCANCELADO = 'True'
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBDP ON 
            TBDG.IDDETALHEPEDIDO  = TBDP.IDDETALHEPEDIDO
        WHERE
            TBDG.STATIVO = 'True'
            AND TBDP.IDRESUMOPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoPedido);
    
    pStmt.execute();
	pStmt.close();
}

function cancelarDetalheProdutoPedido(idResumoPedido, registro){
    let query = `
        UPDATE
             "VAR_DB_NAME".DETALHEPRODUTOPEDIDO
        SET
            STATIVO = 'False',
            STCANCELADO = 'True',
            DTULTATUALIZACAO = CURRENT_TIMESTAMP,
            TXTOBSCANCELAMENTO = 'Cancelamento para Transformar em Pedido Intermediario'
        WHERE
            IDRESUMOPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoPedido);

    pStmt.execute();
	pStmt.close();
}

function cancelarPedidoQuality(idResumoPedido) {
    try{
        conn = $.db.getConnection();
        
        cancelarResumoPedido(idResumoPedido);
        
        cancelarDetalhePedido(idResumoPedido);
        
        cancelarDetalhePedidoGrade(idResumoPedido);
        
        cancelarDetalheProdutoPedido(idResumoPedido);
        
        updateLogSuccessCancelamento(idResumoPedido);
        
        conn.commit();
        
        return true;
    } catch(error){
        updateLogErrorCancelamento(idResumoPedido, (error.message || "Erro ao tentar cancelar no Quality"));
        throw error;
    }
}