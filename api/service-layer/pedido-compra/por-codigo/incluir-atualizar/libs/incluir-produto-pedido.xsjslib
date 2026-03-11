let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = 'SBO_GTO_TESTE4';
let session;

function registrarErrorAoIncluirProdutoPedidoSAP(idDetalheProdutoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDDETALHEPRODUTOPEDIDO = ?
    `;
    
    let conn = $.db.getConnection();
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idDetalheProdutoPedido));
	
	pStmt.executeUpdate();
	pStmt.close();
	
	conn.commit();
}

function getDadosPedido(idResumoPedido, idDetalheProdutoPedido){
    let query = `
		SELECT
            TBR.IDRESUMOPEDIDO,
            TBD.IDDETALHEPEDIDO,
            TBDP.IDDETALHEPRODUTOPEDIDO,
            TBDP.IDPRODCADASTRO,
            TBDP.QTDPRODUTO,
            TBDP.VRCUSTO
		FROM 
			"VAR_DB_NAME"."RESUMOPEDIDO" TBR
		INNER JOIN "VAR_DB_NAME"."DETALHEPEDIDO" TBD ON 
			TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO 
		INNER JOIN "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDP ON 
            TBDP."IDDETALHEPEDIDO" = TBD."IDDETALHEPEDIDO"
		INNER JOIN ${dbNameSAP}.OPOR TBO ON
            TBR.DOCENTRY_PEDIDO_SAP = TBO."DocEntry" AND TO_VARCHAR(TBDP.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV" AND TBO."DocStatus" = 'O'
		WHERE 
            TBR.STCANCELADO = 'False'
            AND TBD.STCANCELADO = 'False' 
            AND TBDP.STCANCELADO = 'False' 
            AND TBD.IDRESUMOPEDIDO = ${idResumoPedido}
            AND TBDP.IDDETALHEPRODUTOPEDIDO = ${idDetalheProdutoPedido}
            AND 1 = ?
		ORDER BY 
			TBD.IDDETALHEPEDIDO,
			TBDP.IDDETALHEPRODUTOPEDIDO
    `;
    
    return api.sqlQuery(query, 1);
}

function montarJsonDocumentLines(listaProdutosPedido){
    let DocumentLines = [];
    let contador = 1;
    
    for(let dados of listaProdutosPedido){
        DocumentLines.push(
            {
                "ItemCode": dados.IDPRODCADASTRO
                ,"Quantity": dados.QTDPRODUTO
                ,"UnitPrice": dados.VRCUSTO
                ,"CostingCode": "ALOCREC"
                ,"ProjectCode": "PDV_SOFTQUALITY"
            }
        );
        
        contador++;
    }
    
   return { DocumentLines }; 
}

function patchSl(docEntry, data, idDetalheProdutoPedido) {
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    let response = slApi.patch('/PurchaseOrders('+docEntry+')', data, session);
    
    if (response.status !== 204) {
        let resp = JSON.parse(response.body.asString());
        let msgError = (resp.error.message.value || 'Erro ao incluir o item no SAP');
        
        registrarErrorAoIncluirProdutoPedidoSAP(idDetalheProdutoPedido, msgError);
        
        return { success: false, msg: msgError};
    }
    
    return { success: true };
}

function executeIncluirProdutoPedidoCompra(docEntry, idResumoPedido, idDetalheProdutoPedido){
    let dadosPedido = getDadosPedido(idResumoPedido, idDetalheProdutoPedido);
    let jsonPedidoSapEditado = montarJsonDocumentLines(dadosPedido);
   
    if(jsonPedidoSapEditado.DocumentLines.length > 0){
        return patchSl(docEntry, jsonPedidoSapEditado, idDetalheProdutoPedido);
    }
    
    return {
        success: false,
        msg: 'Produto ou pedido não encontrado no SAP'
    }
	
}

