let path = "quality.concentrador_homologacao.api";

let api = $.import(path, "apiResponse");
let integracaoOTBService  = $.import(path + ".integracao-api-externa-OTB.libs.services", "integracaoOTBService");

let dbNameSAP = 'SBO_GTO_PRD';
let VAR_DB_NAME = 'QUALITY_CONC';

function getDados(){
    let query = `
        SELECT DISTINCT 
            A."CardCode" AS "SupplierCode",
            A."CardName" AS "SupplierName",
            A."CardFName" AS "SocialName",
            CASE
                WHEN A."validFor" = 'Y' THEN 1
                ELSE 0
            END AS "IsActive",
            REPLACE(REPLACE(REPLACE(B."TaxId0", '.', ''), '/', ''), '-', '') AS "CNPJ"
        FROM
            ${dbNameSAP}.OCRD A
        INNER JOIN ${dbNameSAP}.CRD7 B ON 
            A."CardCode" = B."CardCode"
        INNER JOIN ${dbNameSAP}.OPOR C ON 
            A."CardCode" = C."CardCode"
        WHERE 
            A."CardType" = 'S'
            AND IFNULL(B."TaxId0", '') <> ''
            AND 1 = ?
        ORDER BY 
            A."CardName"
    `;
    
    return api.sqlQuery(query, 1);
    
}

function integrarDadosSupplierOTB(){
    let config = {
        nomeAPI: "Supplier",
        endpoint: "/StageContent/api/Supplier/Post",
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
            var docReturn = integrarDadosSupplierOTB();
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