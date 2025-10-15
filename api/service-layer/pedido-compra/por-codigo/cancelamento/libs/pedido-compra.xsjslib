let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = 'SBO_GTO_TESTE4';
let conn;

function updateLogErrorMigracao(idResumoPedido, msgError){
    conn = $.db.getConnection();
    
    let query = `
        UPDATE 
            "VAR_DB_NAME".RESUMOPEDIDO 
        SET
            LOGSAP = ?
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
    let retorno = true;
    
    if (response.status !== 204) {
        let responseJson = JSON.parse(response.body.asString());
        let msgReturnError = responseJson.error.message.value || responseJson.message['Store.store'] || 'Erro ao tentar integrar o Pedido';
        
        updateLogErrorMigracao(idResumoPedido, msgReturnError);
        
        retorno = false;
    }
    
    return retorno;
}

function getDadosPedido(idResumoPedido){
    let query = `
        SELECT 
            TBR."IDRESUMOPEDIDO",
            IFNULL(DOCENTRY_PEDIDO_SAP, TBO."DocEntry") AS DOCENTRY 
        FROM
            "VAR_DB_NAME"."RESUMOPEDIDO" TBR
        LEFT JOIN ${dbNameSAP}.OPOR TBO ON 
            TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO.U_ID_VENDA_PDV AND TO_DATE(TBR.DTCADASTRO) = TO_DATE(TBO."CreateDate") AND TBO.CANCELED = 'N'
        WHERE  
            TBR."STMIGRADOSAP" = 'True'
            AND TBR."IDRESUMOPEDIDO" = ?
    `;
	
	return api.sqlQuery(query, idResumoPedido);
}

function executeCancelamentoPedidoCompra(codPedido){
    let dadosPedido = getDadosPedido(codPedido);
    
	if(dadosPedido.length > 0){
        let session = slApi.loginServiceLayer(true);
        
        slApi.loginServiceLayer(true);
        
        let { IDRESUMOPEDIDO, DOCENTRY } = dadosPedido[0];
        
        return postSl(DOCENTRY, IDRESUMOPEDIDO, session);
	}
	
	return true;
}


