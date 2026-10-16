let path = "quality.concentrador_homologacao.api";

let api = $.import(path, "apiResponse");
let integracaoOTBService  = $.import(path + ".integracao-api-externa-OTB.libs.services", "integracaoOTBService");

let dbNameSAP = 'SBO_GTO_PRD';
let VAR_DB_NAME = 'QUALITY_CONC';

function getDados(){
    let dataInicial = '11.06.2026';
    
    let query = `
        SELECT
            'N' AS "IsProccessed",
            A."BPLId" AS "LocalCode",
            B."ItemCode" AS "ProductCode",
            TO_VARCHAR(TO_DATE(A."DocDueDate"), ' YYYY-MM-DD') AS "OrderDeliveryDate",
            SUM(B."LineTotal") AS "TotalOrderValue",
            SUM(C.PRECOCUSTO) AS "CostOrderTotal",
            CAST(SUM(B."Quantity") AS INT) AS "AmountOrderTotal",
            A."DocEntry" AS "OrderNumber",
            TO_VARCHAR(TO_DATE(A."DocDate"), ' YYYY-MM-DD') AS "Custom01"
        FROM
            ${dbNameSAP}.OPOR A
        INNER JOIN ${dbNameSAP}.POR1 B ON 
            A."DocEntry" = B."DocEntry" 
        INNER JOIN "VAR_DB_NAME".PRODUTO C ON 
            B."ItemCode" = C.IDPRODUTO 
        WHERE
            A.CANCELED = 'N'
            AND B."Usage" = 10
            AND "DocStatus" = 'O'
            AND TO_DATE(A."DocDate") = ADD_DAYS(CURRENT_DATE, -1)
            AND 1 = ?
        GROUP BY 
            A."BPLId",
            B."ItemCode",
            TO_VARCHAR(TO_DATE(A."DocDueDate"), ' YYYY-MM-DD'),
            A."DocEntry",
            TO_VARCHAR(TO_DATE(A."DocDate"), ' YYYY-MM-DD')
        ORDER BY 
            A."DocEntry"
    `;

    return api.sqlQuery(query, 1);
}

function integrarDadosOpenOrderOTB(){
    let complementoURL = "/StageMetrics/api/OpenOrder/Post";
    
    let config = {
        nomeAPI: "OpenOrder",
        endpoint: "/StageMetrics/api/OpenOrder/Post",
        tamanhoLote: 5000,
        arrayDados: getDados()
    };
    //return config
    integracaoOTBService.executarIntegracao(config);
    
    return {
        msg: "Dados Migrados Com Sucesso!"
    }
}

if($.request){
    try {
        $.response.contentType = 'application/json';
        $.response.status = $.net.http.OK;
        
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                var docReturn = integrarDadosOpenOrderOTB();
                $.response.setBody(JSON.stringify(docReturn));
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