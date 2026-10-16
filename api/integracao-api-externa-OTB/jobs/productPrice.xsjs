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
            A.IDEMPRESA AS "LocalCode",
            A.IDPRODUTO AS "ProductCode",
            TO_VARCHAR(to_date(C.DTCADASTRO), ' YYYY-MM-DD') AS "StartDateValidity",
            REPLACE(C.PRECOVENDA, '.', ',') AS "SalesPrice",
            0 AS "PromotionalPrice",
            REPLACE(B."Price", '.', ',') AS "UnitPurchasePrice"
        FROM
            "${VAR_DB_NAME}".PRODUTO_PRECO A
        INNER JOIN ${dbNameSAP}.ITM1 B ON 
            A.IDPRODUTO = B."ItemCode" AND B."PriceList" = 3
        INNER JOIN "${VAR_DB_NAME}".PRODUTO C ON 
            A.IDPRODUTO = C.IDPRODUTO 
        INNER JOIN "${VAR_DB_NAME}".EMPRESA D ON 
            A.IDEMPRESA = D.IDEMPRESA 
        WHERE 
            C.STATIVO = 'True'
            AND TO_DATE(C.DTULTALTERACAO) = ADD_DAYS(CURRENT_DATE, -1)
            --AND TO_DATE(C.DTULTALTERACAO) BETWEEN '${dataInicial}' AND ADD_DAYS(CURRENT_DATE, -1)
            AND 1 = ?
    `;

    return api.sqlQuery(query, 1);
}

function integrarDadosProductPriceOTB(){
    let config = {
        nomeAPI: "ProductPrice",
        endpoint: "/StageContent/api/ProductPrice/Save",
        tamanhoLote: 5000,
        arrayDados: getDados()
    };
    //return config
    integracaoOTBService.executarIntegracao(config);
    return {
        msg: "Dados Migrados Com Sucesso!"
    }
}

try {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var docReturn = fnHandleGet();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var docReturn = integrarDadosProductPriceOTB();
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