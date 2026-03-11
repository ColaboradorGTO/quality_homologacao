let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer.devolucao`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

function getDocEntryDevolucoes() {
    const query = `
        SELECT	
        	TOP 10
        	A."Serial" AS "nrnota_saida",
        	A."SeriesStr" AS "serie_saida",
        	A."U_ChaveAcesso" AS "chave_saida",
        	B."DocEntry" AS "docentry_dev"
        FROM
        	${dbNameSAP}.OINV A
        INNER JOIN ${dbNameSAP}.ORIN B ON 
        	A.U_ID_VENDA_PDV = B.U_ID_VENDA_PDV
        INNER JOIN ${dbNameSAP}.INV12 C ON 
        	A."DocEntry" = C."DocEntry"
        WHERE 
            1 = ?
        	AND A.CANCELED = 'N'
        	AND B.CANCELED = 'N'
        	AND C."MainUsage" = 38
        	AND IFNULL(CAST(B."Header" AS VARCHAR), '') = ''
        	AND IFNULL(CAST(B."Footer" AS VARCHAR), '') = ''
        	/*AND B."DocEntry" = '864199'*/
    `;
 
    let request = {
        page: $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };
    
    const data = api.sqlQuery(query, 1);
    
    return data;
};

function patchSl(data, docentryDev, session) {
    let response = slApi.patch(`/CreditNotes(${docentryDev})`, data, session);
    
    if(response.status != 204) {
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar atualizar a nota de devolução';
        
        return msgReturnError;
    }
    
    return true;
};

function atualizarObservacoesDevolucao(){
    let data = getDocEntryDevolucoes();
    let session = slApi.loginServiceLayer(true);
    
    let dados = [];
    
    if(data) {
        
        for (let registro of data) {
            let dadosAtualizacaoDev = {
                "OpeningRemarks": `Devolucao NF ${registro.nrnota_saida} Serie: ${registro.serie_saida} Chave: ${registro.chave_saida}`,
                "ClosingRemarks": `Devolucao NF ${registro.nrnota_saida} Serie: ${registro.serie_saida} Chave: ${registro.chave_saida}`
            }
            
            const resp = patchSl(dadosAtualizacaoDev, registro.docentry_dev, session)
            
            if(resp == true) {
                dados.push(
                    {
                    "DocEntry": `${registro.docentry_dev}`,
                    "Status": `Atualizado com sucesso`
                    }
                )
            } else {
                dados.push(
                    {
                    "DocEntry": `${registro.docentry_dev}`,
                    "Status": `${resp}`
                    }
                )
            }
        }
        
        return dados;
    }
    
    return false;
};

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.PATCH:
                let doc = atualizarObservacoesDevolucao();
                $.response.setBody(JSON.stringify({ result : doc }));
                
                break;
            default:
                break;
        }
    
    } catch(e) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ message : e.message }));
        $.response.status = 400;
    }   
}