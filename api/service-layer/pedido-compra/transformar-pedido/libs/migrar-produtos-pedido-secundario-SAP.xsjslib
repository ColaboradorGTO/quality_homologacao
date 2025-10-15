let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = "SBO_GTO_TESTE4";
let idListaPreco501 = 134;
//let idListaPreco501 = 135; Na produção é id 135
let conn;
let session;

function updateLogSuccessTabelaPedidosParaTransformar(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_MIGRADO_SAP_PRODUTOS_PEDIDO_SECUNDARIO = 'True',
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

function updateLogErrorTabelaPedidosParaTransformar(idResumoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_MIGRADO_SAP_PRODUTOS_PEDIDO_SECUNDARIO  = 'False',
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

function updateLogErrorMigracao(idDetalheProdutoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO 
        SET
            ERRORLOGSAP = ?
        WHERE 
            IDDETALHEPRODUTOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, msgError);
	pStmt.setInt(2, parseInt(idDetalheProdutoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
	
	return 'False';
}

function atualizarMigracaoProduto(idDetalheProdutoPedido){
    
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO 
        SET
            STMIGRADOSAP = 'True',
            STVINCPRODPEDSAP = 'True',
            ERRORLOGSAP = NULL
        WHERE 
            IDDETALHEPRODUTOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setInt(1, parseInt(idDetalheProdutoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
	
	return 'True';
}

function validarMigracao(idProduto){
    let query = `
        SELECT 
            "ItemCode" 
        FROM 
            "${dbNameSAP}".OITM 
        WHERE 
            "ItemCode" = '${idProduto}'
            AND 1 = ?
    `;
    
    let resultMigracao = api.sqlQuery(query, 1);
    
    return (resultMigracao.length > 0);
}

function postSl(idDetalheProdutoPedido, idResumoPedidoParaTransformar, data) {
    let response = slApi.post('/Items',data,session);
    
    if (response.status !== 204) {
        let responseJson = JSON.parse(response.body.asString());
        let msgReturnError = responseJson.error.message.value || responseJson.message['Store.store'] || 'Erro ao tentar integrar o Produto';
        
        updateLogErrorTabelaPedidosParaTransformar(idResumoPedidoParaTransformar, (msgReturnError || `Erro ao migrar o produto de Reposicao do pedido secundario para o SAP, IDPRODUTO: ${data.ItemCode}`));
        return updateLogErrorMigracao(idDetalheProdutoPedido, msgReturnError);
    }
    
    let stMigrado = validarMigracao(data.ItemCode);
    
    if(stMigrado){
        updateLogSuccessTabelaPedidosParaTransformar(idResumoPedidoParaTransformar)
        return atualizarMigracaoProduto(idDetalheProdutoPedido);
    } else {
        updateLogErrorTabelaPedidosParaTransformar(idResumoPedidoParaTransformar, `Erro ao migrar o produto de Reposicao do pedido secundario para o SAP, IDPRODUTO: ${data.ItemCode}`);
        return updateLogErrorMigracao(idDetalheProdutoPedido, 'Erro ao tentar integrar o Produto de Reposição');
    }
}

function patchSl(idDetalheProdutoPedido, idResumoPedidoParaTransformar, data) {
    let response = slApi.patch(`/Items('${data.ItemCode}')`, data, session);
    
    if (response.status !== 204) {
        let responseJson = JSON.parse(response.body.asString());
        let msgReturnError = responseJson.error.message.value.length > 0 ? responseJson.error.message.value : 'Erro ao tentar migrar o Produto de Reposição';
        
        updateLogErrorTabelaPedidosParaTransformar(idResumoPedidoParaTransformar, (msgReturnError || `Erro ao migrar o produto de Reposicao do pedido secundario para o SAP, IDPRODUTO: ${data.ItemCode}`));
        return updateLogErrorMigracao(idDetalheProdutoPedido, msgReturnError);
    }
    
    let stMigrado = validarMigracao(data.ItemCode);
    
    if(stMigrado){
        updateLogSuccessTabelaPedidosParaTransformar(idResumoPedidoParaTransformar)
        return atualizarMigracaoProduto(idDetalheProdutoPedido);
    } else {
        updateLogErrorTabelaPedidosParaTransformar(idResumoPedidoParaTransformar, `Erro ao migrar o produto de Reposicao do pedido secundario para o SAP, IDPRODUTO: ${data.ItemCode}`);
        return updateLogErrorMigracao(idDetalheProdutoPedido, 'Erro ao tentar integrar o Produto de Reposição');
    }
}

function getNcmSAP(nuNcm){
    let query = `
        SELECT TOP 1 
            "AbsEntry" AS NCM 
        FROM 
            "${dbNameSAP}".ONCM 
        WHERE 
            REPLACE("NcmCode", '.', '') = ? 
        ORDER BY 
            "AbsEntry" DESC
	`;
	
	return api.sqlQuery(query, nuNcm);
}

function getListasPrecos(dados, stReposicao){
    let listasPrecos = [
        {
            "PriceList": 3,
            "Price": Number(dados.VRCUSTO),
            "Currency": "R$",
            "BasePriceList": 3,
            "Factor": 1.0
        }
    ];
    
    return listasPrecos; 
}

function getDadosDetalheProdutoPedido(idResumoPedido){
    let query = `
        SELECT 
            TBDPP."IDDETALHEPRODUTOPEDIDO",
            REPLACE(TBDPP."IDPRODCADASTRO", '_RN', '') AS "IDPRODCADASTRO",
            TBDPP."DSPRODUTO",
            TBDPP."CODBARRAS",
            TBDPP."VRCUSTO",
            TBDPP."NUNCM",
            TBTF."CODTIPOFISCALPRODUTO",
            TBFAB."IDSAP",
            TBSE."IDSAP" AS "IDSUBGRUPOESTRUTURASAP",
            TBFORN."IDFORNECEDORSAP",
            CASE 
                TBDPP."DSTAMANHO" WHEN 'Diversos' THEN 'tNO' 
                ELSE 'tYES' 
            END AS DSTAMANHO,
            TBDPP."UND",
            CASE 
                TBCP."TIPOPEDIDO" WHEN 'VESTUARIO' THEN 1 
                ELSE 8 
            END AS TIPOPEDIDO
        FROM 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        INNER JOIN "VAR_DB_NAME"."CATEGORIAPEDIDO" TBCP ON
            TBCP.IDCATEGORIAPEDIDO = TBDPP.IDCATEGORIAPEDIDO
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON 
            TBR.IDRESUMOPEDIDO = TBDPP.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME"."FORNECEDOR" TBFORN ON 
            TBFORN.IDFORNECEDOR = TBR.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME"."FABRICANTE" TBFAB ON 
            TBFAB.IDFABRICANTE = TBDPP.IDFABRICANTE
        INNER JOIN "VAR_DB_NAME"."TIPOFISCALPRODUTO" TBTF ON 
            TBTF.IDTIPOFISCALPRODUTO = TBDPP.IDFONTEPRODUTOFISAL
        INNER JOIN "VAR_DB_NAME"."SUBGRUPOESTRUTURA" TBSE ON 
            TBDPP.IDSUBGRUPOESTRUTURA = TBSE.IDSUBGRUPOESTRUTURA
        WHERE  
            1 = ?
            AND TBDPP.STMIGRADOSAP <> 'True'
            AND TBDPP."IDRESUMOPEDIDO" = ${parseInt(idResumoPedido)}
    `;
    
    return api.sqlQuery(query, 1);
}

function getIdResumoPedidoSecundario(idResumoPedidoParaTransformar){
    let query = `
        SELECT 
            TBR.IDRESUMOPEDIDO
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR_PRIMARIO ON
            TBR.IDPEDIDOPRIMARIO = TBR_PRIMARIO.IDRESUMOPEDIDO
        WHERE 
            TBR_PRIMARIO."IDRESUMOPEDIDOORIGEM" = ?
    `;
    
    let regDet = api.sqlQuery(query, idResumoPedidoParaTransformar);
    
    return regDet.length > 0 ? Number(regDet[0].IDRESUMOPEDIDO) : 0
}

function montarJsonProduto(dadosProduto){
	let retNcm = getNcmSAP(dadosProduto.NUNCM);
	let arrayListasPrecos = getListasPrecos(dadosProduto);
	let idProduto = dadosProduto.IDPRODCADASTRO;
	let codBarras = dadosProduto.CODBARRAS;

	return {
        "ItemCode": String(idProduto)
        ,"ItemName": String(dadosProduto.DSPRODUTO)
        ,"VatLiable": "tYES"
        ,"PurchaseItem": "tYES"
        ,"SalesItem": "tYES"
        ,"InventoryItem": String(dadosProduto.DSTAMANHO ) /*passar "tYES" para produtos normais e "tNO" para produto de saldo ou serviços*/
        ,"Valid": "tYES"
        ,"SalesUnit": String(dadosProduto.UND)
        ,"PurchaseUnit": String(dadosProduto.UND)
        ,"InventoryUOM": String(dadosProduto.UND)
        ,"ItemType": "itItems"
        ,"ItemClass": "itcMaterial" /*passar "itcMaterial" para produto e "itcService" para serviço*/
        ,"NCMCode":  retNcm[0].NCM
        ,"MaterialType": "mt_GoodsForReseller"
        ,"MaterialGroup": Number(dadosProduto.TIPOPEDIDO) /*para roupas ou 8 para calçados ou artigo*/
        ,"ProductSource":  String(dadosProduto.CODTIPOFISCALPRODUTO)
        ,"Manufacturer": String(dadosProduto.IDSAP)
        ,"ItemsGroupCode": dadosProduto.IDSUBGRUPOESTRUTURASAP
        ,"Mainsupplier": String(dadosProduto.IDFORNECEDORSAP)
        ,"U_IS_EAN_GTO": codBarras
        ,"BarCode": codBarras
        ,"Series": 3
        ,"ItemPrices": arrayListasPrecos
    };
}

function migrarProdutosPedidoSecundario(idResumoPedidoParaTransformar){
    conn = $.db.getConnection();
    
    try{
        let idResumoPedido = getIdResumoPedidoSecundario(idResumoPedidoParaTransformar);
        let registros = getDadosDetalheProdutoPedido(idResumoPedido);
        
        session = slApi.loginServiceLayer(true);
        
        slApi.loginServiceLayer(true);
        
        for (let dadosProduto of registros) {
            let idDetalheProdutoPedido = parseInt(dadosProduto.IDDETALHEPRODUTOPEDIDO);
            let idProduto = dadosProduto.IDPRODCADASTRO;
            
            let stMigradoSAP = validarMigracao(idProduto);
            let jsonProduto = montarJsonProduto(dadosProduto, stMigradoSAP);
            
            if(stMigradoSAP){
                patchSl(idDetalheProdutoPedido, idResumoPedidoParaTransformar, jsonProduto);
            } else {
                updateLogErrorTabelaPedidosParaTransformar(idResumoPedidoParaTransformar, `Produto do Pedido secundario nao migrado para o SAP, IDPRODUTO: ${idProduto}`);
            }
        }
    } catch(error){
        updateLogErrorTabelaPedidosParaTransformar(idResumoPedidoParaTransformar, (error.message || 'Erro ao migrar os produtos do pedido secundario para o SAP'));
        
        throw error;
	}
}