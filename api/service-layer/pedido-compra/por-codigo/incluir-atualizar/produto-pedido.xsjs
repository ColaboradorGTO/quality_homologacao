let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");
let translator = $.import("quality.concentrador_homologacao.api.service-layer.traducao-texto", "translator");

let dbNameSAP = "SBO_GTO_TESTE4";
let idListaPreco501 = 134;
//let idListaPreco501 = 135; Na produção é id 135
let conn;

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
    let conn = $.db.getConnection();
    
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

function verificarSeExisteProduto_RN(idProduto){
    idProduto = idProduto.replace('_RN', '');
    
    let query = `
        SELECT 
            IDPRODUTO
        FROM 
            "VAR_DB_NAME"."PRODUTO_RN"
        WHERE 
            IDPRODUTO = ?
    `;
    
    let regDet = api.sqlQuery(query, (idProduto + '_RN'));
    
    if(regDet.length > 0){
        return true;
    }
    
    return false;
}

function criarProdutoTabelaProduto_RN (idDetalheProdutoPedido) {
    let queryInsertProduto = `
        INSERT INTO 
            "VAR_DB_NAME"."PRODUTO_RN" 
        (
            "IDPRODUTO", 
            "IDGRUPOEMPRESARIAL", 
            "NUNCM", 
            "NUCEST", 
            "NUCST_ICMS", 
            "NUCFOP", 
            "PERC_OUT", 
            "NUCODBARRAS", 
            "DSNOME", 
            "STGRADE", 
            "UND", 
            "PRECOCUSTO", 
            "PRECOVENDA", 
            "QTDENTRADA", 
            "QTDCOMERCIALIZADA", 
            "QTDPERDA", 
            "QTDDISPONIVEL", 
            "PERCICMS", 
            "PERCISS", 
            "PERCPIS", 
            "PERCCOFINS", 
            "COD_CSOSN", 
            "PERCCSOSC", 
            "NUCST_IPI", 
            "NUCST_PIS", 
            "NUCST_COFINS", 
            "PERCIPI", 
            "STPESAVEL", 
            "GRP_MATERIAIS", 
            "IDSUBGRUPO", 
            "IDFABRICANTE", 
            "IDFORNECEDOR", 
            "NUREFERENCIA", 
            "STATIVO", 
            "IDCOR", 
            "IDTAMANHO", 
            "IDCATEGORIAPEDIDO", 
            "IDTIPOTECIDO", 
            "IDESTILO", 
            "IDLOCALEXPOSICAO", 
            "IDCATEGORIAS", 
            "IDDETALHEPRODUTOPEDIDO", 
            "IDTIPOPRODUTOFISCAL", 
            "IDFONTEPRODUTOFISCAL",
            "DTULTALTERACAO",
            "STECOMMERCE"
        )
        SELECT
            TBDPP_SECUNDARIO.IDPRODCADASTRO  || '_RN' AS IDPRODUTO,
            TBR.IDGRUPOEMPRESARIAL AS IDGRUPOEMPRESARIAL,
            TBDPP.NUNCM AS NUNCM,
            '' AS NUCEST,
            '' AS NUCST_ICMS,
            '' AS NUCFOP,
            '' AS PERC_OUT,
            'SEM GTIN' AS NUCODBARRAS,
            TBDPP.DSPRODUTO AS DSNOME,
            1 AS STGRADE,
            TBDPP.UND AS UND,
            TBDPP.VRCUSTO AS PRECOCUSTO,
            IFNULL(TBDPP_SECUNDARIO.VRCUSTO, TBDPP.VRCUSTO) AS PRECOVENDA,
            0 AS QTDENTRADA,
            0 AS QTDCOMERCIALIZADA,	
            0 AS QTDPERDA,
            0 AS QTDDISPONIVEL,
            0.0 AS PERCICMS,
            0.0 AS PERCISS,
            0.0 AS PERCPIS,
            0.0 AS PERCCOFINS,
            '' AS COD_CSOSN,
            0.0 AS PERCCSOSC,
            '' AS NUCST_IPI,
            '' AS NUCST_PIS,
            '' AS NUCST_COFINS,
            0.0 AS PERCIPI,
            0 AS STPESAVEL,
            1 AS GRP_MATERIAIS,
            TBDPP.IDSUBGRUPOESTRUTURA AS IDSUBGRUPO,
            TBDPP.IDFABRICANTE AS IDFABRICANTE,
            TBR.IDFORNECEDOR AS IDFORNECEDOR,
            TBDPP.NUREF AS NUREFERENCIA,
            'True' AS STATIVO,
            TBDPP.IDCOR AS IDCOR,
            TBDPP.IDTAMANHO AS IDTAMANHO,
            TBDPP.IDCATEGORIAPEDIDO AS IDCATEGORIAPEDIDO,
            TBDPP.IDTIPOTECIDO AS IDTIPOTECIDO,
            TBDPP.IDESTILO AS IDESTILO,
            TBDPP.IDLOCALEXPOSICAO AS IDLOCALEXPOSICAO,
            TBDPP.IDCATEGORIAS AS IDCATEGORIAS,
            TBDPP.IDDETALHEPRODUTOPEDIDO AS IDDETALHEPRODUTOPEDIDO,
            TBDPP.IDTIPOPRODUTOFISCAL AS IDTIPOPRODUTOFISCAL,
            TBDPP.IDFONTEPRODUTOFISAL AS IDFONTEPRODUTOFISCAL,
            CURRENT_TIMESTAMP  AS DTULTALTERACAO,
            TBDPP.STECOMMERCE
        FROM 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP 
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON 
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO 
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON 
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP_SECUNDARIO ON 
            TBDPP.IDDETALHEPRODUTOPEDIDO = TBDPP_SECUNDARIO.IDDETALHEPRODUTOPEDIDOPRIMARIO
        WHERE
            TBDPP.STCANCELADO ='False' 
            AND TBDPP.IDDETALHEPRODUTOPEDIDO = ?
    `;
    		
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsertProduto));
    
    pStmt.setInt(1, idDetalheProdutoPedido);
    
    pStmt.execute();
    pStmt.close();
    
    conn.commit();
}

function postSl(idDetalheProdutoPedido, data, session) {
    let response = slApi.post('/Items',data,session);
    
    if (response.status !== 204) {
        let responseJson = JSON.parse(response.body.asString());
        let msgReturnError = responseJson.error.message.value || responseJson.message['Store.store'] || 'Erro ao tentar integrar o Produto';
        
        return updateLogErrorMigracao(idDetalheProdutoPedido, msgReturnError);
    }
    
    let stMigrado = validarMigracao(data['ItemCode']);
    
    if(stMigrado){
        return atualizarMigracaoProduto(idDetalheProdutoPedido);
    } else {
        return updateLogErrorMigracao(idDetalheProdutoPedido, 'Erro ao tentar integrar o Produto de Reposição');
    }
}

function patchSl(idDetalheProdutoPedido, data, session) {
    let response = slApi.patch(`/Items('${data.ItemCode}')`, data, session);
    
    if (response.status !== 204) {
        let responseJson = JSON.parse(response.body.asString());
        let msgReturnError = responseJson.error.message.value.length > 0 ? responseJson.error.message.value : 'Erro ao tentar integrar o Produto de Reposição';
        
        return updateLogErrorMigracao(idDetalheProdutoPedido, msgReturnError);
    }
    
    let stMigrado = validarMigracao(data.ItemCode);
    
    if(stMigrado){
        return atualizarMigracaoProduto(idDetalheProdutoPedido);
    } else {
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

function getListasPrecos(dados, stReposicao, stPedidoPrimario){
    let listasPrecos = [
            {
                "PriceList": 3,
                "Price": Number(dados.VRCUSTO),
                "Currency": "R$",
                "BasePriceList": 3,
                "Factor": 1.0
            }
    ];
    
    if(!stReposicao){
        if(stPedidoPrimario){
            
            listasPrecos.push(
                {
                    "PriceList": idListaPreco501,
                    "Price": Number(dados.VR_PRECO_VENDA_INTERMEDIARIO),
                    "Currency": "R$",
                    "BasePriceList": idListaPreco501,
                    "Factor": 1.0
                }
            );
        } else {
           listasPrecos.push(
                {
                    "PriceList": 1,
                    "Price": Number(dados.VRVENDA),
                    "Currency": "R$",
                    "BasePriceList": 1,
                    "Factor": 1.0
                },
                {
                    "PriceList": 125,
                    "Price": Number(dados.VRVENDA),
                    "Currency": "R$",
                    "BasePriceList": 125,
                    "Factor": 1.0
                },
                {
                    "PriceList": 121,
                    "Price": Number(dados.VRVENDA),
                    "Currency": "R$",
                    "BasePriceList": 121,
                    "Factor": 1.0
                },
                {
                    "PriceList": 122,
                    "Price": Number(dados.VRVENDA),
                    "Currency": "R$",
                    "BasePriceList": 122,
                    "Factor": 1.0
                }
            ); 
        }
    }
    
    return listasPrecos; 
}

function getDadosDetalheProdutoPedido(idDetalheProdutoPedido){
    let query = `
        SELECT 
            TBDPP."IDDETALHEPRODUTOPEDIDO",
            TBDPP."IDDETALHEPEDIDO",
            TBDPP."IDGRUPOESTRUTURA",
            TBDPP."IDSUBGRUPOESTRUTURA",
            TBSE."IDSAP" AS "IDSUBGRUPOESTRUTURASAP",
            TBDPP."IDCOR",
            TBDPP."IDTAMANHO",
            TBDPP."IDCATEGORIAPEDIDO",
            TBDPP."IDTIPOTECIDO",
            TBDPP."IDESTILO",
            TBDPP."IDFABRICANTE",
            TBDPP."IDLOCALEXPOSICAO",
            TBDPP."IDCATEGORIAS",
            TBDPP."IDNCM",
            TBDPP."NUNCM",
            TBDPP."IDCEST",
            TBDPP."NUCEST",
            TBDPP."IDTIPOPRODUTOFISCAL",
            TBDPP."IDFONTEPRODUTOFISAL",
            TBDPP."IDPRODCADASTRO",
            TBDPP."NUREF",
            TBDPP."CODBARRAS",
            TBDPP."DSPRODUTO",
            TBDPP."QTDPRODUTO",
            TBDPP."UND",
            TBDPP."VRCUSTO",
            TBDPP."VRVENDA",
            TBDPP."VRTOTALCUSTO",
            TBDPP."VRTOTALVENDA",
            TBDPP."DTCADASTRO",
            TBDPP."DTULTATUALIZACAO",
            TBDPP."STCADASTRADO",
            TBDPP."STRECEBIDO",
            TBDPP."OBSREF",
            TBDPP."IDDETALHEENTRADA",
            TBDPP."NUNF",
            TBDPP."QTDENTRADANF",
            TBDPP."DTENTRADANF",
            TBDPP."STECOMMERCE",
            TBDPP."STREDESOCIAL",
            TBDPP."STATIVO",
            TBDPP."STCANCELADO",
            TBDPP."QTDESTOQUEIDEAL",
            TBDPP."IDRESUMOPEDIDO",
            TBR."IDFORNECEDOR",
            TBFORN."IDFORNECEDORSAP",
            TBFAB."IDSAP",
            TBTF."CODTIPOFISCALPRODUTO",
            CASE 
                TBDPP."DSTAMANHO" WHEN 'Diversos' THEN 'tNO' 
                ELSE 'tYES' 
            END AS DSTAMANHO,
            CASE 
                TBCP."TIPOPEDIDO" WHEN 'VESTUARIO' THEN 1 
                ELSE 8 
            END AS TIPOPEDIDO,
            IFNULL(TBDPP_SECUNDARIO.VRCUSTO, TBDPP.VRCUSTO) AS VR_PRECO_VENDA_INTERMEDIARIO
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
        LEFT JOIN "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP_SECUNDARIO ON 
            TBDPP.IDDETALHEPRODUTOPEDIDO = TBDPP_SECUNDARIO.IDDETALHEPRODUTOPEDIDOPRIMARIO
        WHERE  
            1 = ? 
            AND TBDPP.STCADASTRADO = 'True'
            AND TBDPP.STMIGRADOSAP <> 'True'
            AND TBDPP.STREPOSICAO <> 'True'
            AND TBDPP."IDDETALHEPRODUTOPEDIDO" = ${parseInt(idDetalheProdutoPedido)}
    `;
    
    return api.sqlQuery(query, 1);
}

function getIdDetalhePedidoSecundario(idDetalheProdutoPedido){
    let query = `
        SELECT 
            IDDETALHEPRODUTOPEDIDO
        FROM 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO"
        WHERE 
            IDDETALHEPRODUTOPEDIDOPRIMARIO = ?
    `;
    
    let regDet = api.sqlQuery(query, idDetalheProdutoPedido);
    
    if(regDet.length > 0){
        return Number(regDet[0].IDDETALHEPRODUTOPEDIDO);
    }
    
    return 0;
}

function montarJsonProduto(dadosProduto, stReposicao = false, stPedidoPrimario = false){
	let retNcm = getNcmSAP(dadosProduto.NUNCM);
	let arrayListasPrecos = getListasPrecos(dadosProduto, stReposicao, stPedidoPrimario);
	let codBarras = stPedidoPrimario ? 'SEM GTIN' : String(dadosProduto.CODBARRAS); 

	return {
        "ItemCode": String(dadosProduto.IDPRODCADASTRO)
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

function executeMigracaoProdutoPedido(idDetalheProdutoPedido, session, stPedidoPrimario = false){
	let registros = getDadosDetalheProdutoPedido(idDetalheProdutoPedido);
	
	for (let i = 0; i < registros.length; i++) {
        let dadosProduto = registros[i];
        
        let stMigradoSAP = validarMigracao(dadosProduto.IDPRODCADASTRO);
		let jsonProduto = montarJsonProduto(dadosProduto, stMigradoSAP, stPedidoPrimario);
        
        if(stPedidoPrimario){
            let stProdutoCriadoNaProduto_RN = verificarSeExisteProduto_RN(dadosProduto.IDPRODCADASTRO);
            
            if(!stProdutoCriadoNaProduto_RN){
                criarProdutoTabelaProduto_RN(idDetalheProdutoPedido);
            }
        }
        
        if(stMigradoSAP){
            patchSl(idDetalheProdutoPedido, jsonProduto, session);
        } else {
            postSl(idDetalheProdutoPedido, jsonProduto, session);
        }
	}
}

function executeProduto(){
    let idDetalheProdutoPedido = $.request.parameters.get("codProdPedido");
    let idDetalheProdutoPedidoSecundario = getIdDetalhePedidoSecundario(idDetalheProdutoPedido);
    let stExistePedidoSecundario = idDetalheProdutoPedidoSecundario > 0;
	let session = slApi.loginServiceLayer(true);
    
    conn = $.db.getConnection();
    
    slApi.loginServiceLayer(true);
    
    if(stExistePedidoSecundario){
        executeMigracaoProdutoPedido(Number(idDetalheProdutoPedidoSecundario), session);
        
        executeMigracaoProdutoPedido(Number(idDetalheProdutoPedido), session, true);
    } else {
        executeMigracaoProdutoPedido(Number(idDetalheProdutoPedido), session);
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
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = executeProduto();
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

