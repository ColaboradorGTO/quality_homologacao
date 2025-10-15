let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = "SBO_GTO_TESTE4";
let idFilialPadrao = 101;
let idFilialIntermediaria = 125;
let usoPrincipal = 10;
let conn;
let session;

function updateLogSuccessTabelaPedidosComprasParaRecriar(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_MIGRADO_SAP_PEDIDO_SECUNDARIO = 'True',
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

function updateLogErrorTabelaPedidosComprasParaRecriar(idResumoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_MIGRADO_SAP_PEDIDO_SECUNDARIO = 'False',
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

function getPedidoNoSAP(idResumoPedido){
    let query = `
        SELECT
            "DocEntry"
        FROM 
            ${dbNameSAP}.OPOR 
        WHERE 
            "U_ID_VENDA_PDV" = '${idResumoPedido}'
            AND "CANCELED" = 'N'
            AND 1 = ?
    `;
    
    return api.sqlQuery(query, 1);
}

function updateLogErrorMigracao(idResumoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".RESUMOPEDIDO 
        SET
            STMIGRADOSAP = 'False',
            LOGSAP = ?
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, msgError);
	pStmt.setInt(2, (idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function updateLogSuccessMigracao(idResumoPedido, docEntrySAP){
    let query = `
         UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            LOGSAP = 'MIGRADO',
            STMIGRADOSAP = 'True',
            DOCENTRY_PEDIDO_SAP = ?
		WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, (docEntrySAP));
	pStmt.setInt(2, (idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function postSl(idResumoPedido, idResumoPedidoParaTransformar, data) {
    var response = slApi.post('/PurchaseOrders',data,session);
    
    if (response.status !== 204) {
        let responseJson = JSON.parse(response.body.asString());
        let msgReturnError = responseJson.error.message.value || responseJson.message['Store.store'] || 'Erro ao tentar integrar o Pedido';
        
        updateLogErrorTabelaPedidosComprasParaRecriar(idResumoPedidoParaTransformar, msgReturnError);
        updateLogErrorMigracao(idResumoPedido, msgReturnError);
        
    } else {
        let dadosMigrados = getPedidoNoSAP(idResumoPedido);
        
        if(dadosMigrados.length > 0){
            updateLogSuccessTabelaPedidosComprasParaRecriar(idResumoPedidoParaTransformar);
            updateLogSuccessMigracao(idResumoPedido, dadosMigrados[0].DocEntry);
        } else {
            updateLogErrorTabelaPedidosComprasParaRecriar(idResumoPedidoParaTransformar, 'Erro ao tentar integrar o pedido primario');
            updateLogErrorMigracao(idResumoPedido, 'Erro ao tentar integrar o Pedido');
        }
    }
}

function getIdResumoPedidoSecundario(idResumoPedido){
    let query = `
        SELECT
            TBR."IDRESUMOPEDIDO"
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR_PRIMARIO ON
            TBR.IDPEDIDOPRIMARIO = TBR_PRIMARIO.IDRESUMOPEDIDO
        WHERE 
            TBR_PRIMARIO."IDRESUMOPEDIDOORIGEM" = ? 
    `;
    
    let reg = api.sqlQuery(query, idResumoPedido);
    
    return reg.length > 0 ?  Number(reg[0].IDRESUMOPEDIDO) : 0;
}

function getFormaPagamento(idFornecedor){
    let query = `
        SELECT TOP 1 
            "PymCode" AS ID 
        FROM 
            ${dbNameSAP}.CRD2 
        WHERE 
            "CardCode" = ? 
        ORDER BY 
            "LineNum" DESC
    `;
    
    return api.sqlQuery(query, idFornecedor);
}

function getFornecedor(){
    let query = `
        SELECT
            "U_IS_PN_ENTRADA" AS "CardCode"
        FROM 
            ${dbNameSAP}.OBPL 
        WHERE 
            "BPLId" = ? 
    `;
    
    let reg = api.sqlQuery(query, idFilialIntermediaria);
    
    return reg.length > 0 ? reg[0].CardCode : '';
}

function getCodigoComprador(idComprador){
    let query = `
        SELECT
            "SlpCode" AS IDCOMPRADOR
        FROM 
            ${dbNameSAP}.OSLP
        WHERE 
            "U_Matricula" = ?
    `;
    
    let reg =  api.sqlQuery(query, idComprador);
    
    if(reg.length > 0 ){
        return reg[0].IDCOMPRADOR;
    }
    
    return -1;
}

function getDadosProdutosPedido(idResumoPedido){
    let query = `
        SELECT
            TBDPP.IDPRODCADASTRO,
            TBDPP.QTDPRODUTO,
            TBDPP.VRCUSTO,
            TBDPP.CODBARRAS
        FROM 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD
        INNER JOIN "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP ON 
            TBDPP."IDDETALHEPEDIDO" = TBD."IDDETALHEPEDIDO"
        WHERE 
            TBD.STCANCELADO = 'False' 
            AND TBDPP.STCANCELADO = 'False' 
            AND TBD.IDRESUMOPEDIDO = ?
    `;
    
    return api.sqlQuery(query, idResumoPedido);
}

function getDadosPedido(idResumoPedido){
    let query = `
        SELECT 
            TBR."IDRESUMOPEDIDO",
            TBR."IDGRUPOEMPRESARIAL",
            TBR."IDCOMPRADOR",
            TBR."VRTOTALLIQUIDO",
            TBFORN."IDFORNECEDORSAP",
            TBC."IDSAP",
            TBT."IDSAP" AS IDSAPTPDOCUMENTO,
            TO_VARCHAR(TBR.DTPEDIDO,'YYYY-mm-DD') AS DTPEDIDO, 
            TO_VARCHAR(TBR.DTPREVENTREGA,'YYYY-mm-DD') AS DTPREVENTREGA, 
            CASE 
                TBR."MODPEDIDO" WHEN 'VESTUARIO' THEN 1 WHEN 'CALCADOS' THEN 2 WHEN 'ARTIGOS' THEN 3 
            END AS MODPEDIDO,
            CASE 
                TBR."TPFRETE" WHEN 'PAGO' THEN 0 WHEN 'APAGAR' THEN 1
            END AS TPFRETE,
            TBR.IDPEDIDOPRIMARIO
        FROM 
            "VAR_DB_NAME"."RESUMOPEDIDO" TBR
        INNER JOIN "VAR_DB_NAME"."FORNECEDOR" TBFORN ON 
            TBFORN.IDFORNECEDOR = TBR.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME"."CONDICAOPAGAMENTO" TBC ON 
            TBC.IDCONDICAOPAGAMENTO = TBR.IDCONDICAOPAGAMENTO
        INNER JOIN "VAR_DB_NAME"."TIPODOCUMENTO" TBT ON 
            TBT.IDTPDOCUMENTO = TBC.IDTPDOCUMENTO
        WHERE  
            IFNULL(TBR."STMIGRADOSAP", 'False') <> 'True'
            AND TBR."IDANDAMENTO" = 5 
            AND TBR."IDRESUMOPEDIDO" = ?
    `;
	
	return api.sqlQuery(query, idResumoPedido);
}

function montarJsonDocLines(idResumoPedido, usoPrincipal){
    let detalhesPedido = getDadosProdutosPedido(idResumoPedido);
    let warehouseCode = "101";
    let docLines = [];
    let contador = 1;
    
    for(let dados of detalhesPedido){
       docLines.push(
            {
                "LineNum": contador
                ,"ItemCode": dados.IDPRODCADASTRO
                ,"Quantity": dados.QTDPRODUTO
                ,"UnitPrice": dados.VRCUSTO
                ,"WarehouseCode": warehouseCode
                ,"CostingCode": "ALOCREC"
                ,"ProjectCode": "PDV_SOFTQUALITY"
                ,"BarCode": dados.CODBARRAS
                ,"Usage": usoPrincipal
            }
        )
        
        contador++;
    }
    
   return docLines;
}

function montarJsonPedido(dados, BplIdCliente){
    let idFornecedorSAP = getFornecedor();
    let cdComprador = getCodigoComprador(dados.IDCOMPRADOR);
    let paymentMethod = dados.IDSAPTPDOCUMENTO;
    let idPedidoPrimario = Number(dados.IDPEDIDOPRIMARIO || 0);
    let comments = "Integração Quality";
    
    if(idPedidoPrimario > 0){
        comments += ` -> PEDIDO PRIMARIO(${idPedidoPrimario})`;
    }
    
    return {
        "DocType": "dDocument_Items"
        ,"U_ID_VENDA_PDV": dados.IDRESUMOPEDIDO
        ,"DocDate": dados.DTPEDIDO
        ,"DocDueDate": dados.DTPREVENTREGA
        ,"CardCode": idFornecedorSAP
        ,"NumAtCard": Number(dados.IDRESUMOPEDIDO)
        ,"DocTotal": parseFloat(dados.VRTOTALLIQUIDO)
        ,"Comments": comments
        ,"PaymentGroupCode": Number(dados.IDSAP)
        ,"SalesPersonCode": Number(cdComprador)
        ,"Project": "PDV_SOFTQUALITY"
        ,"BPL_IDAssignedToInvoice": BplIdCliente
        ,"U_GrupoEmpresarial": Number(dados.IDGRUPOEMPRESARIAL)
        ,"U_tipoproduto": Number(dados.MODPEDIDO)
        ,"PaymentMethod": paymentMethod
        ,"DocumentLines": montarJsonDocLines(dados.IDRESUMOPEDIDO, usoPrincipal)
        ,"TaxExtension": { 
            "Incoterms": Number(dados.TPFRETE)
            ,"MainUsage": usoPrincipal
        }
	}
}

function migrarPedidoSecundario(idResumoPedidoParaTransformar){
   conn = $.db.getConnection();
   
    try{
        let idResumoPedido = getIdResumoPedidoSecundario(idResumoPedidoParaTransformar);
        let dadosMigradosSAP = getPedidoNoSAP(idResumoPedido);
        
        if(dadosMigradosSAP.length > 0){
            updateLogSuccessTabelaPedidosComprasParaRecriar(idResumoPedidoParaTransformar);
            updateLogSuccessMigracao(idResumoPedido, dadosMigradosSAP[0].DocEntry);
            
            return true;
        }
        
        let dadosPedido = getDadosPedido(idResumoPedido);
        
        if(dadosPedido.length > 0){
            session = slApi.loginServiceLayer(true);
            
            slApi.loginServiceLayer(true);
            
            for (let dados of dadosPedido) {
                let jsonPedido = montarJsonPedido(dados, idFilialPadrao);
                
                postSl(Number(dados.IDRESUMOPEDIDO), idResumoPedidoParaTransformar, jsonPedido);
            }
            
        } else {
            updateLogErrorTabelaPedidosComprasParaRecriar(idResumoPedidoParaTransformar, 'Erro ao tentar integrar o pedido secundario, dados nao encontrados para integrar');
        }
    } catch(error){
        updateLogErrorTabelaPedidosComprasParaRecriar(idResumoPedidoParaTransformar, (error.message || 'Erro ao tentar migrar o pedido secundario'));
        
        throw error;
    }
}