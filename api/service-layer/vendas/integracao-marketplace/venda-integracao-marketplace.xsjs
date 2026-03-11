let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.integracao-marketplace.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let libXml = $.import(filePathLibs, "transformar-xml"); 
let libCliente = $.import(filePathLibs, "integracao-cliente-sap"); 
let libVenda = $.import(filePathLibs, "integracao-venda-sap"); 

function integrarVendaMarketPlace(registro) {
    let conn = $.db.getConnection();
    let session = slApi.loginServiceLayer(true);
    
    let validarIntegracaoVenda = libVenda.validarIntegracaoVenda(`31-${registro.nfeProc.NFe.infNFe.ide.serie}-${registro.nfeProc.NFe.infNFe.ide.nNF}`);
    
    if(validarIntegracaoVenda.ok == false) {
        return `Erro: ${validarIntegracaoVenda.message}`;
    }
    
    let validarCliente = libCliente.validarIntegracaoCliente(session, registro.nfeProc.NFe.infNFe.dest, registro.nfeProc.NFe.infNFe.entrega);
    
    if(validarCliente.ok == false) {
        return `Erro: ${validarCliente.message}`;
    }
    
    let integrarVenda = libVenda.integrarVenda(session, validarCliente.message[0].CardCode, registro.nfeProc);
    
    if(integrarVenda.ok == false) {
        return `Erro: ${integrarVenda.message}`
    }
    
    conn.close();
    return `Integração realizada com sucesso`;
}

function executarIntegracao(data){
    let dados = [];
    
    for(let i = 0; i < data.length; i++) {
        let registro = data[i].body.asString();
        registro = libXml.XmlParaJson(registro);
        
        let log = integrarVendaMarketPlace(registro);
        
        dados.push({ 
            idvenda: `31-${registro.nfeProc.NFe.infNFe.ide.serie}-${registro.nfeProc.NFe.infNFe.ide.nNF}`,
            chave: registro.nfeProc.protNFe.infProt.chNFe,
            log: log
        });
    }
    
    return {data: dados};
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                let data = $.request.entities;
                let doc = executarIntegracao(data);
                $.response.setBody(JSON.stringify(doc));
                
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