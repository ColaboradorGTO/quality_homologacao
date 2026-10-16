let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.temp.reintegracao-vendas-ncm-retroativas.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");

function postSlCancelamentoContasReceber(docentry, session) {
    let response = slApi.post(`/IncomingPayments(${docentry})/Cancel`, {}, session);
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        return response;
    }
    
    return true;
}

function validarCancelamento(docentry) {
    let query = `
        SELECT 
            A."DocEntry" 
        FROM 
            ${dbNameSAP}.ORCT A 
        WHERE 
            1 = ?
            AND A."DocEntry" = '${docentry}' 
            AND A."Canceled" = 'N'
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length) return true;
    
    return false;
}

function efetuarCancelamento(docentry, session) {
    let respValidarCancelamento = validarCancelamento(docentry);
    
    if(!respValidarCancelamento) return `Contas a receber - ${docentry}: Já está cancelado ou não foi encontrado.`;
    
    let respPost = postSlCancelamentoContasReceber(docentry, session);
    
    if(respPost == true){
        return `Contas a receber - ${docentry}: Cancelado com sucesso.`;
    } else {
        return `Contas a receber - ${docentry} - Não foi cancelado: ${respPost}`;
    }
}

function executarIntegracao(bodyJson) {
    let session = slApi.loginServiceLayer(true);
    let conn = $.db.getConnection();
    let dados = [];
    
    for(let i = 0; i < bodyJson.length; i++) {
        let docentry = bodyJson[i];
        
        let log = efetuarCancelamento(docentry, session);
        
        dados.push(log);
    }
    
    return dados;
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var bodyJson = JSON.parse($.request.body.asString());
                let doc = executarIntegracao(bodyJson);
                $.response.setBody(JSON.stringify(doc));
            break;
                
            default:
                break;
        }
    
    } catch(e) {
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