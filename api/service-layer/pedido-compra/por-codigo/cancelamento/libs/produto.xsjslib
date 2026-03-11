let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = 'SBO_GTO_TESTE4';
let session;

function getDadosItem(codPedido, codProduto){
    let query = `
        SELECT 
            TBR.IDRESUMOPEDIDO,
            TO_VARCHAR(TBR.DTPREVENTREGA,'YYYY-mm-DD') AS DTPREVENTREGA,
            TBO."DocEntry",
            TBP1."LineNum"
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON 
            TBR.IDRESUMOPEDIDO = TBDP.IDRESUMOPEDIDO
        INNER JOIN ${dbNameSAP}.OPOR TBO ON
            TO_VARCHAR(TBDP.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
        INNER JOIN ${dbNameSAP}.POR1 TBP1 ON
            TBO."DocEntry" = TBP1."DocEntry" AND TO_VARCHAR(TBDP.IDPRODCADASTRO) = TBP1."ItemCode" 
        WHERE
            TBO."DocStatus" = 'O'
            AND TBP1."LineStatus" = 'O'
            AND TBR.IDRESUMOPEDIDO = '${codPedido}'
            AND TBDP.IDPRODCADASTRO = '${codProduto}'
            AND 1 = ?
    `;
    
    return api.sqlQuery(query, 1);
}

function registrarErrorAoCancelarSAP(idResumoPedido, idProdCadastro, p_Error){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDPRODCADASTRO = ?
            AND IDRESUMOPEDIDO = ? 
    `;
    
    let conn = $.db.getConnection();
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, p_Error);
	pStmt.setString(2, idProdCadastro);
	pStmt.setInt(2, idResumoPedido);
	
	
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return "False";
}

function patchSl(docEntry, data, session, idResumoPedido, idProdCadastro) {
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    let response = slApi.patch('/PurchaseOrders('+docEntry+')', data, session);
    
    if (response.status !== 204) {
        let resp = JSON.parse(response.body.asString());
        
        return registrarErrorAoCancelarSAP(idResumoPedido, idProdCadastro, (resp.error.message.value || 'Erro ao cancelar o item no SAP'))
    }else{
        return 'True';
    }
}

// FAZER OS TESTES VIA PUT
// TEM QUE PEGAR O PEDIDO TODO E MIGRAR NOVAMENTE SÓ O QUE FOR QUERER NO PEDIDO

function executeCancelamentoProdutoPedidoCompra(codPedido,codProduto){
    let dadosLinhaPedido = getDadosItem(codPedido, codProduto);
	
	if(dadosLinhaPedido.length > 0){
        for (let { DTPREVENTREGA, DocEntry, LineNum } of dadosLinhaPedido) {
            let data = {
                "DocDueDate": DTPREVENTREGA,
                "DocumentLines": [
                    {
                        "LineNum": parseInt(LineNum),
                        "LineStatus": "bost_Close"
                    }
                ]
            }
            
            return patchSl(DocEntry, data, session, codPedido, codProduto);
        }
        
	}else{
	   return 'False'; 
	}
	
}

