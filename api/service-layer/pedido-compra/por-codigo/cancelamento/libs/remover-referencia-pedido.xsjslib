let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = 'SBO_GTO_TESTE4';
let session;

function getProdutosPedidoQuePermanecerao(idResumoPedido, idDetalhePedido){
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
                AND TBR.STCANCELADO = 'False'
                AND TBR.IDRESUMOPEDIDO = ${idResumoPedido}
        ),
        APP AS (
            SELECT
                TBDP.IDRESUMOPEDIDO,
                TBDP.IDDETALHEPEDIDO,
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
                AND TBDP.IDRESUMOPEDIDO = ${idResumoPedido}
        )
        SELECT
            APP.IDRESUMOPEDIDO,
            APP.IDDETALHEPRODUTOPEDIDO,
            APP.IDPRODCADASTRO,
            APP.QTDPRODUTO,
            APP.VRCUSTO,
            SAP."LineNum",
            SAP."TrgetEntry",
            SAP."Price"
        FROM 
            SAP
        INNER JOIN APP ON
            SAP."ItemCode" = TO_VARCHAR(APP.IDPRODCADASTRO) AND SAP.LINHA_SAP = APP.LINHA_APP
        WHERE
            APP.IDDETALHEPEDIDO <> ${idDetalhePedido}
            AND 1 = ?
        ORDER BY 
            SAP."LineNum"
    `;

    return api.sqlQuery(query, 1);
}

function montarJsonDocumentLines(listaProdutosPedido){
    let lines = [];
    let linesNumComEntrada = listaProdutosPedido.filter(p => p.TrgetEntry > 0).map(p => p.LineNum);
    let contador = 1;
    
    for(let dados of listaProdutosPedido){
        let lineNum = contador;
        let itemCode = dados.IDPRODCADASTRO;
        let quantity = Number(dados.QTDPRODUTO);
        let unitPrice = Number(dados.VRCUSTO);
        let docEntryNfeEntrada = dados.TrgetEntry;
        
        if(linesNumComEntrada.includes(dados.LineNum)){
            if(contador == dados.LineNum){
               contador++;
           }
            
            lineNum = dados.LineNum;
            
        } else {
            while(linesNumComEntrada.includes(contador)){
                contador++;
            } 
            
            lineNum = contador;
            
            contador++
        }
        
        let jsonLine = {
            "LineNum": lineNum
            ,"ItemCode": itemCode
            ,"Quantity": quantity
            ,"UnitPrice": unitPrice
            ,"CostingCode": "ALOCREC"
            ,"ProjectCode": "PDV_SOFTQUALITY"
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
        let response = slApi.patch('/PurchaseOrders('+docEntry+')', data, session, true);
        
        numTentativas++;
        
        if (response.status !== 204) {
            response = JSON.parse(response.body.asString());
            
            let msgError = (response.error.message.value || 'Erro ao cancelar a referencia no SAP');
            
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

function removerReferenciaPedidoSAP(docEntry, idResumoPedido, idDetalhePedido){
    let listaProdutosPedido = getProdutosPedidoQuePermanecerao(idResumoPedido, idDetalhePedido);
    let jsonReferenciasQuePermanecerao = montarJsonDocumentLines(listaProdutosPedido)
    
    //return listaProdutosPedido/**/
    //return jsonReferenciasQuePermanecerao
    if(jsonReferenciasQuePermanecerao.DocumentLines.length > 0){
        return patchSl(docEntry, jsonReferenciasQuePermanecerao);
    }
    
    return {
        success: false,
        msg: 'Não é possivel cancelar porque esta referência é a unica no pedido, caso queira, cancele o pedido'
    }
}