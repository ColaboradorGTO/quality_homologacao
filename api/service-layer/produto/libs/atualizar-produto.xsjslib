let api = $.import("quality.concentrador_homologacao.api", "apiResponse");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");

let dbNameSAP = "SBO_GTO_TESTE4";
let session;

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
    
    let resultMigracao = api.sqlQuery(query, 1) || [];
    
    return (resultMigracao.length > 0) || false;
}

function patchSl(data) {
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    let response = slApi.patch(`/Items('${data.ItemCode}')`, data, session);
    
    if (response.status !== 204) {
        response = JSON.parse(response.body.asString());
        
        let msgError = (response.error.message.value || 'Erro ao atualizar o produto no SAP');
        
        return { 
            success: false, 
            msgError
        };
    }
    
    return { success: true };
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

function getListasPrecos(dados){
    return [
        {
            "PriceList": 3,
            "Price": Number(dados.PRECOCUSTO),
            "Currency": "R$",
            "BasePriceList": 3,
            "Factor": 1.0
        },
        /*{
            "PriceList": 1,
            "Price": Number(dados.PRECOVENDA),
            "Currency": "R$",
            "BasePriceList": 1,
            "Factor": 1.0
        },
        {
            "PriceList": 125,
            "Price": Number(dados.PRECOVENDA),
            "Currency": "R$",
            "BasePriceList": 125,
            "Factor": 1.0
        },
        {
            "PriceList": 121,
            "Price": Number(dados.PRECOVENDA),
            "Currency": "R$",
            "BasePriceList": 121,
            "Factor": 1.0
        },
        {
            "PriceList": 122,
            "Price": Number(dados.PRECOVENDA),
            "Currency": "R$",
            "BasePriceList": 122,
            "Factor": 1.0
        }*/
    ]; 
}

function getDadosProduto(dadosAlterados){
    let query = `
        SELECT 
            TBP.IDPRODUTO,
            '${dadosAlterados.DSNOME}' AS DSNOME,
            '${dadosAlterados.UND}' AS UND,
            '${dadosAlterados.NUNCM}' AS NUNCM,
            TBP.NUCODBARRAS,
            TBTF.CODTIPOFISCALPRODUTO,
            TBFORN.IDFORNECEDORSAP,
            TBFAB.IDSAP AS IDFABRICANTESAP,
            TBSE.IDSAP AS IDSUBGRUPOESTRUTURASAP,
            ${dadosAlterados.PRECOCUSTO} AS PRECOCUSTO,
            ${dadosAlterados.PRECOVENDA} AS PRECOVENDA,
            CASE 
                TBT.DSTAMANHO WHEN 'Diversos' THEN 'tNO' 
                ELSE 'tYES' 
            END AS "InventoryItem",
            CASE 
                TBCP.TIPOPEDIDO WHEN 'VESTUARIO' THEN 1 
                ELSE 8
            END AS TIPOPEDIDO
        FROM 
            "VAR_DB_NAME".PRODUTO TBP
        INNER JOIN "VAR_DB_NAME".TAMANHO TBT ON 
            ${dadosAlterados.IDTAMANHO} = TBT.IDTAMANHO
        INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO TBCP ON
            ${dadosAlterados.IDCATEGORIAPEDIDO} = TBCP.IDCATEGORIAPEDIDO
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBFORN ON 
            ${dadosAlterados.IDFORNECEDOR} = TBFORN.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME".FABRICANTE TBFAB ON 
            ${dadosAlterados.IDFABRICANTE} = TBFAB.IDFABRICANTE
        INNER JOIN "VAR_DB_NAME".TIPOFISCALPRODUTO TBTF ON 
            ${dadosAlterados.IDTIPOPRODUTOFISCAL} = TBTF.IDTIPOFISCALPRODUTO
        INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON 
            ${dadosAlterados.IDSUBGRUPO} = TBSE.IDSUBGRUPOESTRUTURA
        WHERE  
            TBP.STATIVO = 'True'
            AND TBP.IDPRODUTO = '${dadosAlterados.IDPRODUTO}'
            AND 1 = ?
    `;
    
    return api.sqlQuery(query, 1);
}

function montarJsonProdutoPatch(dadosProduto){
	let retNcm = getNcmSAP(dadosProduto.NUNCM);
	let arrayListasPrecos = getListasPrecos(dadosProduto);
	let codBarras = String(dadosProduto.NUCODBARRAS); 
    
	return {
        "ItemCode": String(dadosProduto.IDPRODUTO)
        ,"ItemName": String(dadosProduto.DSNOME)
        ,"VatLiable": "tYES"
        ,"PurchaseItem": "tYES"
        ,"SalesItem": "tYES"
        ,"InventoryItem": String(dadosProduto.InventoryItem ) /*passar "tYES" para produtos normais e "tNO" para produto de saldo ou serviços*/
        //,"Valid": "tYES"
        ,"SalesUnit": String(dadosProduto.UND)
        ,"PurchaseUnit": String(dadosProduto.UND)
        ,"InventoryUOM": String(dadosProduto.UND)
        ,"ItemType": "itItems"
        ,"ItemClass": "itcMaterial" /*passar "itcMaterial" para produto e "itcService" para serviço*/
        ,"NCMCode":  retNcm[0].NCM
        ,"MaterialType": "mt_GoodsForReseller"
        ,"MaterialGroup": Number(dadosProduto.TIPOPEDIDO) /*para roupas ou 8 para calçados ou artigo*/
        ,"ProductSource":  String(dadosProduto.CODTIPOFISCALPRODUTO)
        ,"Manufacturer": String(dadosProduto.IDFABRICANTESAP)
        ,"ItemsGroupCode": dadosProduto.IDSUBGRUPOESTRUTURASAP
        ,"Mainsupplier": String(dadosProduto.IDFORNECEDORSAP)
        ,"U_IS_EAN_GTO": codBarras
        ,"BarCode": codBarras
        ,"Series": 3
        ,"ItemPrices": arrayListasPrecos
    };
}

function atualizarProdutoSAP(dadosAlterados){
	let registros = getDadosProduto(dadosAlterados);
	//return registros
	for (let dadosProduto of registros) {
        let stMigradoSAP = validarMigracao(dadosProduto.IDPRODUTO);
        
		if(stMigradoSAP){
            //return montarJsonProdutoPatch(dadosProduto);
            let jsonProduto = montarJsonProdutoPatch(dadosProduto);
            
            return patchSl(jsonProduto);
		}
		
		return { success: true }
	}
}