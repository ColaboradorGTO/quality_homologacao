let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.devolucao.devolucao-nfe-55.jobs.libs`;

let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer.devolucao`, "api");
let libDevolucao = $.import(filePathLibs, "gerar-devolucao-nfe-55"); 

function executeGerarDevolucaoNFE(idVenda, stMsgRetorno){
    let conn = $.db.getConnection();
    let session = slApi.loginServiceLayer(true);
    
    slApi.loginServiceLayer(true);

    libDevolucao.executeGerarDevolucao(conn, session, idVenda, stMsgRetorno);
    
    conn.close();
    
    return {
        msg: 'Devoluções Realizadas Com Sucesso!'
    };
    
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    /*
    switch ($.request.method) {
        
        //Handle your POST calls here
        case $.net.http.POST:
            let idVenda = $.request.parameters.get("idVenda");
            let stMsgRetorno = $.request.parameters.get("stMsgRetorno");
            
            var docReturn = executeGerarDevolucao(idVenda, stMsgRetorno);
            
            $.response.setBody(JSON.stringify(docReturn));
        break;
    }
    */
    try {
        switch ($.request.method) {
            
            //Handle your POST calls here
            case $.net.http.POST:
                let idVenda = $.request.parameters.get("idVenda");
                let stMsgRetorno = $.request.parameters.get("stMsgRetorno");
                
                var docReturn = executeGerarDevolucaoNFE(idVenda, stMsgRetorno);
                
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