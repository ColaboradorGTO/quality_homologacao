let path = "quality.concentrador_homologacao.api";

let api = $.import(path, "apiResponse");
let integracaoOTBService  = $.import(path + ".integracao-api-externa-OTB.libs.services", "integracaoOTBService");

let dbNameSAP = 'SBO_GTO_PRD';

function getDados(){
    let query = `
        SELECT
            'N' AS "IsProccessed",
            A."BPLId" AS "LocalCode",
            A."AliasName" AS "BriefDescription",
            A."BPLName" AS "Description",
            A.U_GRP_EMP AS "LevelCode1",
            CASE
            	WHEN A.U_GRP_EMP = 1 THEN 'TESOURA'
            	WHEN A.U_GRP_EMP = 2 THEN 'MAGAZINE'
            	WHEN A.U_GRP_EMP = 3 THEN 'YORUS'
            	WHEN A.U_GRP_EMP = 4 THEN 'FREE CENTER'
            	ELSE 'TODOS'
            END AS "LevelDescription1",
            B."Code" AS "LevelCode2",
            B."Name" AS "LevelDescription2"
        FROM
            ${dbNameSAP}.OBPL A
        INNER JOIN ${dbNameSAP}.OCST B ON 
            A."State" = B."Code"
        WHERE 
            1 = ?
        ORDER BY
            A."BPLId"
    `;

    return api.sqlQuery(query, 1);
}

function integrarDadosLocalDimensionOTB(){
    let config = {
        nomeAPI: "Location",
        endpoint: "/StageContent/api/Location/Post",
        tamanhoLote: 5000,
        arrayDados: getDados()
    };
    //return config
    integracaoOTBService.executarIntegracao(config);
    return {
        msg: "Dados Migrados Com Sucesso!"
    }
}

if ($.request) {
    try {
        $.response.contentType = 'application/json';
        $.response.status = $.net.http.OK;
        
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                var docReturn = integrarDadosLocalDimensionOTB();
                
                $.response.setBody(JSON.stringify(docReturn));
                
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