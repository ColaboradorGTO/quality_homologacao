let api = $.import("quality.concentrador_homologacao.api", "apiResponse");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");

let dbNameSAP = "SBO_GTO_TESTE4";
let conn;
let session;

function updateLogErrorMigracao(idProduto, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PRODUTO 
        SET
            ERRORLOGSAP = ?
        WHERE 
            IDPRODUTO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, msgError);
	pStmt.setString(2, idProduto);
	
	pStmt.executeUpdate();
	pStmt.close();

	conn.commit();
	
	return 'False';
}

function atualizarMigracaoProduto(idProduto){
    
    let query = `
        UPDATE 
            "VAR_DB_NAME".PRODUTO 
        SET
            STMIGRADOSAP = 'True',
            ERRORLOGSAP = NULL
        WHERE 
            IDPRODUTO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idProduto);
	
	pStmt.executeUpdate();
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
    
    let resultMigracao = api.sqlQuery(query, 1) || [];
    
    return (resultMigracao.length > 0) || false;
}

function postSl(data) {
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    let response = slApi.post('/Items',data,session);
    
    if (response.status !== 204) {
        let responseJson = JSON.parse(response.body.asString());
        let msgReturnError = responseJson.error.message.value || responseJson.message['Store.store'] || 'Erro ao tentar integrar o Produto';
        
        return updateLogErrorMigracao(data['ItemCode'], msgReturnError);
    }
    
    let stMigrado = validarMigracao(data['ItemCode']);
    
    if(stMigrado){
        return atualizarMigracaoProduto(data['ItemCode']);
    } else {
        return updateLogErrorMigracao(data['ItemCode'], 'Erro ao tentar integrar o Produto');
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

function getListasPrecos(dados){
    return [
        {
            "PriceList": 3,
            "Price": Number(dados.PRECOCUSTO),
            "Currency": "R$",
            "BasePriceList": 3,
            "Factor": 1.0
        },
        {
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
        }
    ]; 
}

function getDadosProduto(idProduto){
    let query = `
        SELECT 
            TBP.IDPRODUTO,
            TBP.DSNOME,
            TBP.UND,
            TBP.NUNCM,
            TBP.NUCODBARRAS,
            TBTF.CODTIPOFISCALPRODUTO,
            TBFORN.IDFORNECEDORSAP,
            TBFAB.IDSAP AS IDFABRICANTESAP,
            TBSE.IDSAP AS IDSUBGRUPOESTRUTURASAP,
            TBP.PRECOCUSTO,
            TBP.PRECOVENDA,
            CASE 
            TBT.DSTAMANHO WHEN 'Diversos' THEN 'tNO' 
            ELSE 'tYES' 
            END AS DSTAMANHO,
            CASE 
            TBCP.TIPOPEDIDO WHEN 'VESTUARIO' THEN 1 
            ELSE 8
            END AS TIPOPEDIDO
        FROM 
            "VAR_DB_NAME".PRODUTO TBP
        INNER JOIN "VAR_DB_NAME".TAMANHO TBT ON 
            TBP.IDTAMANHO = TBT.IDTAMANHO
        INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO TBCP ON
            TBCP.IDCATEGORIAPEDIDO = TBP.IDCATEGORIAPEDIDO
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBFORN ON 
            TBFORN.IDFORNECEDOR = TBP.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME".FABRICANTE TBFAB ON 
            TBFAB.IDFABRICANTE = TBP.IDFABRICANTE
        INNER JOIN "VAR_DB_NAME".TIPOFISCALPRODUTO TBTF ON 
            TBTF.IDTIPOFISCALPRODUTO = TBP.IDTIPOPRODUTOFISCAL
        INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON 
            TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
        WHERE  
            IFNULL(TBP.STMIGRADOSAP, 'False') <> 'True'
            AND TBP.STATIVO = 'True'
            AND TBP.IDPRODUTO = '${idProduto}'
            AND 1 = ?
    `;
    
    return api.sqlQuery(query, 1);
}

function montarJsonProdutoPost(dadosProduto){
	let retNcm = getNcmSAP(dadosProduto.NUNCM);
	let arrayListasPrecos = getListasPrecos(dadosProduto);
	let codBarras = String(dadosProduto.NUCODBARRAS); 
    
	return {
        "ItemCode": String(dadosProduto.IDPRODUTO)
        ,"ItemName": String(dadosProduto.DSNOME)
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
        ,"Manufacturer": String(dadosProduto.IDFABRICANTESAP)
        ,"ItemsGroupCode": dadosProduto.IDSUBGRUPOESTRUTURASAP
        ,"Mainsupplier": String(dadosProduto.IDFORNECEDORSAP)
        ,"U_IS_EAN_GTO": codBarras
        ,"BarCode": codBarras
        ,"Series": 3
        ,"ItemPrices": arrayListasPrecos
    };
}

function executeMigracaoProduto(idProduto){
	let registros = getDadosProduto(idProduto);
	//return {registros}
	for (let dadosProduto of registros) {
        let stMigradoSAP = validarMigracao(dadosProduto.IDPRODUTO);
		//return {dadosProduto}
		//return {stMigradoSAP}
		//return montarJsonProdutoPost(dadosProduto)
		if(!stMigradoSAP){
            //return montarJsonProdutoPost(dadosProduto);
            let jsonProduto = montarJsonProdutoPost(dadosProduto);
            
            postSl(jsonProduto);
		} else {
		    atualizarMigracaoProduto(dadosProduto.IDPRODUTO);
		}
		
		return {stMigradoSAP}
	}
}

function fnHandlePost(){
    var bodyJson = JSON.parse($.request.body.asString());
    
    if(bodyJson.length > 0){
        conn = $.db.getConnection();
        
        for(let registro of bodyJson){
            let idProduto = registro.IDPRODUTO;
            
            return executeMigracaoProduto(idProduto, session)
        }
    }
    
    return {
        "msg": 'Migração de Produto realizada com sucesso!'
    };
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                var doc = fnHandlePost();
                $.response.setBody(JSON.stringify(doc));
                break;
                
            default:
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
}