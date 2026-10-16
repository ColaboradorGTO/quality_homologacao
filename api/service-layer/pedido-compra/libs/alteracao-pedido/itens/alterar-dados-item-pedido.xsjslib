let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = 'SBO_GTO_TESTE4';
let session;


function getDadosItemPedido(dadosItem){
    let query = `
        WITH SAP AS (
            SELECT
                TBP1."DocEntry",
                TBP1."ItemCode",
                TBP1."Price",
                TBP1."Quantity",
                TBP1."LineNum",
                IFNULL(TBP1."TrgetEntry", 0) AS "TrgetEntry",
                ROW_NUMBER() OVER (
                    PARTITION BY TBP1."ItemCode"
                    ORDER BY TBP1."LineNum"
                ) AS LINHA_SAP
            FROM 
            	${dbNameSAP}.POR1 TBP1
            INNER JOIN ${dbNameSAP}.OPOR TBO ON 
            	TBO."DocEntry" = TBP1."DocEntry"
            INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
                TBR.DOCENTRY_PEDIDO_SAP = TBO."DocEntry" AND TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO."U_ID_VENDA_PDV"
            WHERE 
                TBO."DocStatus" = 'O'
                --AND TBP1."LineStatus" = 'O'
                AND TBR.STCANCELADO = 'False'
                AND TBR.IDRESUMOPEDIDO = ${dadosItem.IDRESUMOPEDIDO}
        ),
        APP AS (
            SELECT
                TBDP.IDRESUMOPEDIDO,
                TBDP.IDDETALHEPRODUTOPEDIDO,
                TBDP.IDPRODCADASTRO,
                TBDP.QTDPRODUTO,
                TBDP.VRCUSTO,
                ROW_NUMBER() OVER (
                    PARTITION BY TBDP.IDPRODCADASTRO
                    ORDER BY TBDP.IDDETALHEPRODUTOPEDIDO
                ) AS LINHA_APP
            FROM 
            	"VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP
            WHERE 
                TBDP.STCANCELADO = 'False'
                AND TBDP.IDRESUMOPEDIDO = ${dadosItem.IDRESUMOPEDIDO}
        )
        SELECT
            APP.IDRESUMOPEDIDO,
            APP.IDDETALHEPRODUTOPEDIDO,
            APP.IDPRODCADASTRO,
            '${dadosItem.DSPRODUTO}' AS DSPRODUTO,
            ${dadosItem.QTDPRODUTO} AS QTDPRODUTO,
            ${dadosItem.VRCUSTO} AS VRCUSTO,
            SAP."LineNum",
            SAP."TrgetEntry",
            SAP."Price"
        FROM 
            SAP
        INNER JOIN APP ON
            SAP."ItemCode" = TO_VARCHAR(APP.IDPRODCADASTRO) AND SAP.LINHA_SAP = APP.LINHA_APP /*AND SAP."Quantity" = APP.QTDPRODUTO*/ 
        WHERE
            APP.IDDETALHEPRODUTOPEDIDO = ${dadosItem.IDDETALHEPRODUTOPEDIDO}
            AND 1 = ?
        ORDER BY 
            SAP."LineNum"
    `;

    return api.sqlQuery(query, 1);
}

function montarJsonDocumentLines(listaProdutosPedido){
    let lines = [];
    
    for(let dados of listaProdutosPedido){
        let lineNum = dados.LineNum;
        let itemCode = dados.IDPRODCADASTRO;
        let itemDescription = dados.DSPRODUTO;
        let quantity = Number(dados.QTDPRODUTO);
        let unitPrice = Number(dados.VRCUSTO);
        let idDetalheProdutoPedido = Number(dados.IDDETALHEPRODUTOPEDIDO)
        
        let jsonLine = {
            "LineNum": lineNum
            ,"ItemCode": itemCode
            ,"ItemDescription": itemDescription
            ,"Quantity": quantity
            ,"UnitPrice": unitPrice
            ,"CostingCode": "ALOCREC"
            ,"ProjectCode": "PDV_SOFTQUALITY"
            ,"U_IdDetalheProdutoPedido": idDetalheProdutoPedido
        }
        
        lines.push(jsonLine);
    }
    
   return { "DocumentLines": lines }; 
}

function patchSl(docEntry, data) {
    let numTentativas = 0;
    let limite = 2;
    //return data
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    while(numTentativas < limite){
        let response = slApi.patch('/PurchaseOrders('+docEntry+')', data, session);
        
        numTentativas++;
        
        if (response.status !== 204) {
            response = JSON.parse(response.body.asString());
            
            let msgError = (response.error.message.value || 'Erro ao editar o item no Pedido SAP');
            
            if(numTentativas == 2){
                return { 
                    success: false, 
                    msg: msgError
                };
            }
        }
        
        if(numTentativas < limite){
            var start = Date.now();
            while (Date.now() - start < 500) {}
        }
    }
   
    return { success: true };
}

function editarItemPedidoSAP(docEntry, dadosItem){
    let listaProdutosPedido = getDadosItemPedido(dadosItem);
    let jsonItemEditado = montarJsonDocumentLines(listaProdutosPedido)
    
   //return listaProdutosPedido/**/
   //return jsonItemEditado
    if(jsonItemEditado.DocumentLines.length > 0){
        return patchSl(docEntry, jsonItemEditado);
    }
    
    return {
        success: false,
        msg: 'Item não encontrado no pedido SAP'
    }
}

