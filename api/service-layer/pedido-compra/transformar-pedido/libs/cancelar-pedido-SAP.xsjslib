let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = 'SBO_GTO_TESTE4';
let conn;

function updateLogSuccessCancelamento(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_CANCELADO_SAP = 'True',
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
            ST_CANCELADO_SAP = 'False',
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

function postSl(docEntry, idResumoPedido, session) {
    let response = slApi.post('/PurchaseOrders('+docEntry+')/Cancel', {}, session);
    
    if (response.status !== 204) {
        let responseJson = JSON.parse(response.body.asString());
        let msgReturnError = responseJson.error.message.value || responseJson.message['Store.store'] || 'Erro ao tentar cancelar o Pedido';
        
        return updateLogErrorCancelamento(idResumoPedido, msgReturnError);
    }
    
    let { ST_CANCELADO_SAP } = getDadosPedido(idResumoPedido) || '';
    
    if(ST_CANCELADO_SAP == 'N'){
        return updateLogErrorCancelamento(idResumoPedido, 'Pedido nao cancelado');
    }
    
    updateLogSuccessCancelamento(idResumoPedido)
}

function getDadosPedido(idResumoPedido){
    let query = `
        SELECT 
            IFNULL(TBR.DOCENTRY_PEDIDO_SAP, TBO."DocEntry") AS DOCENTRY,
            TBR.STMIGRADOSAP AS ST_MIGRADO_SAP,
            TBO.CANCELED AS ST_CANCELADO_SAP,
            TBO."DocStatus" AS DOC_STATUS_SAP
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        LEFT JOIN ${dbNameSAP}.OPOR TBO ON 
            TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO.U_ID_VENDA_PDV AND TO_DATE(TBR.DTCADASTRO) = TO_DATE(TBO."CreateDate")
        WHERE 
            TBR.STPEDIDOPRIMARIO <> 'True'
            AND TBR.IDPEDIDOPRIMARIO IS NULL
            AND TBR.IDRESUMOPEDIDO = ?
    `;
    
    let reg = api.sqlQuery(query, idResumoPedido);
    
    return reg.length > 0 ? reg[0] : '';
}

function validarDadosPedido(dadosPedido){
    let {
       DOCENTRY,
       ST_MIGRADO_SAP,
       ST_CANCELADO_SAP,
       DOC_STATUS_SAP
    } = dadosPedido || '';
    
    let msgError = '';
    
    if(ST_CANCELADO_SAP == 'Y'){
        updateLogSuccessCancelamento(idResumoPedido);
        return false; 
    }
    
    if(!DOCENTRY || ST_MIGRADO_SAP == 'False'){
        msgError = 'Erro ao cancelar no SAP, Pedido nao migrado';
    } else{
        if(DOC_STATUS_SAP == 'C'){
            msgError = 'Erro ao cancelar no SAP, Pedido esta fechado';
        }
    }
    
    if(msgError.length > 0){
        updateLogErrorCancelamento(idResumoPedido, msgError);
        
        return false;
    }
    
    return true;
}

function cancelarPedidoSAP(idResumoPedido) {
    conn = $.db.getConnection();
    
    try{
        let dadosPedido = getDadosPedido(idResumoPedido);
        
        if(dadosPedido.length == 0){
            return updateLogErrorCancelamento(idResumoPedido, 'Erro ao cancelar o pedido no SAP, dados nao encontrados');
        }
        
        let stPedidoValidoParaCancelarSAP = validarDadosPedido(dadosPedido);
        
        if(stPedidoValidoParaCancelarSAP){
            let session = slApi.loginServiceLayer(true);
            
            slApi.loginServiceLayer(true);
           
            let { DOCENTRY } = dadosPedido;
            
            postSl(DOCENTRY, idResumoPedido, session);
        }    
        
    } catch(error){
        updateLogErrorCancelamento(idResumoPedido, (error.message || "Erro ao tentar cancelar no SAP"));
        throw error;
    }
}