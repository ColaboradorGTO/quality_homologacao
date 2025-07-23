let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let filePathLibs = `${filePath}.service-layer.devolucao.devolucao-produtos-voucher.jobs.libs`;

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let libVenda = $.import(filePathLibs, "integracao-venda-devolucao");
let libCliente = $.import(filePathLibs, "integracao-cliente-devolucao");
let libDevolucao = $.import(filePathLibs, "gerar-devolucao-produtos-voucher");
let libTransferenciaNotaSaida = $.import(filePathLibs, "integracao-nota-saida-transferencia-produtos");
let libTransferenciaNotaEntrada = $.import(filePathLibs, "integracao-nota-entrada-transferencia-produtos");

function executeGerarDevolucao(idVoucher, stMsgRetorno){
    let conn = $.db.getConnection();
    let session = slApi.loginServiceLayer(true);
    
    slApi.loginServiceLayer(true);
    
    libVenda.executeIntegrarVendaDevolucao(conn, session, idVoucher, stMsgRetorno);
    
    libCliente.executeIntegrarClienteDevolucao(conn, session, idVoucher, stMsgRetorno);
    
    libDevolucao.executeGerarDevolucao(conn, session, idVoucher, stMsgRetorno);
    
    libTransferenciaNotaSaida.executeGerarNotaSaidaTransferencia(conn, session, idVoucher, stMsgRetorno);
    
    libTransferenciaNotaEntrada.executeGerarNotaEntradaTransferencia(conn, session, idVoucher, stMsgRetorno);
    
    conn.close();
    
    return {
        msg: 'Devoluções e Transferências Realizadas Com Sucesso!'
    };
    
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    switch ($.request.method) {
        
        //Handle your POST calls here
        case $.net.http.POST:
            let idVoucher = $.request.parameters.get("idVoucher");
            let stMsgRetorno = $.request.parameters.get("stMsgRetorno");
            
            var docReturn = executeGerarDevolucao(idVoucher, stMsgRetorno);
            
            $.response.setBody(JSON.stringify(docReturn));
        break;
    }
    /*
    try {
        switch ($.request.method) {
            
            //Handle your POST calls here
            case $.net.http.POST:
                let idVoucher = $.request.parameters.get("idVoucher");
                let stMsgRetorno = $.request.parameters.get("stMsgRetorno");
                
                var docReturn = executeGerarDevolucao(idVoucher, stMsgRetorno);
                
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