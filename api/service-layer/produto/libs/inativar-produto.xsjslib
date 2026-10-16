var api = $.import("quality.concentrador_homologacao.api", "apiResponse");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");

let session;

function validarStatusProdutoNoSAP(idProduto){
    let query = `
        SELECT 
            CASE 
                WHEN "validFor" = 'Y' THEN 'True'
                ELSE 'False'
            END AS STATIVO
        FROM
            "${dbNameSAP}".OITM
        WHERE
            "ItemCode" = '${idProduto}'
            AND 1 = ?
    `;
    
    let reg = api.sqlQuery(query, 1) || [];
    
    return (reg.length > 0) ? reg[0].STATIVO : [];
}

function inativarProdutoSAP(codProduto){
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    let data = { "Valid": "tNO", "Frozen":"tYES" };
    let response = slApi.patch(`/Items('${codProduto}')`, data, session);
    //return { teste: response.status, codProduto }
    if (response.status !== 204) {
        response = JSON.parse(response.body.asString());
        
        let msgError = (response.error.message.value || 'Erro ao inativar o produto no SAP');
        
        return { 
            success: false, 
            msgError
        };
    }
    
    let stAtivoProdutoSAP = validarStatusProdutoNoSAP(codProduto);
    
    if(stAtivoProdutoSAP != 'False'){
        return { 
            success: false, 
            msgError: 'Erro ao inativar o produto no SAP'
        };
    }
    
    return { success: true };
}