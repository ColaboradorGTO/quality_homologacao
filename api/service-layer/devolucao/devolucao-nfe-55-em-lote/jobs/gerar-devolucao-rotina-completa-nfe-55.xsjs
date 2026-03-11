let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.devolucao.devolucao-nfe-55-em-lote.jobs.libs`;

let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer.devolucao`, "api");
let libDevolucao = $.import(filePathLibs, "gerar-devolucao-nfe-55"); 

function executeGerarDevolucaoNFE(bodyJson){
    let conn = $.db.getConnection();
    let session = slApi.loginServiceLayer(true);
    
    slApi.loginServiceLayer(true);

    return libDevolucao.executeGerarDevolucao(conn, session, bodyJson);
    
    conn.close();
    
    return {
        msg: 'Devoluções Realizadas Com Sucesso!'
    };
    
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;

    try {
        switch ($.request.method) {
            
            //Handle your POST calls here
            case $.net.http.POST:
                var bodyJson = JSON.parse($.request.body.asString());
                var docReturn = executeGerarDevolucaoNFE(bodyJson);
                
                $.response.setBody(JSON.stringify(docReturn));
            break;
        }
        
    } catch (e) {
        var detalheError = e.stack.split('\n');
        
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
    /**/
}