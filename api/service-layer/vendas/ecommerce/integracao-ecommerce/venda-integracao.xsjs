let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.integracao-ecommerce.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let libXml = $.import(`${filePathLibs}.utils`, "transformar-xml"); 
let libCliente = $.import(`${filePathLibs}.integracao`, "integracao-cliente"); 
let libVenda = $.import(`${filePathLibs}.integracao`, "integracao-venda"); 

function criarIdVenda(cnpj, serie, numeroNota) {
    let query = `
        SELECT
        	A.IDEMPRESA
        FROM
        	"VAR_DB_NAME".EMPRESA A
        WHERE 
        	1 = ? 
        	AND A.NUCNPJ = '${cnpj}' 
    `;
    
    let respIdEmpresa = api.sqlQuery(query, 1);
    if(respIdEmpresa.length) {
        return {
            idempresa: respIdEmpresa[0].IDEMPRESA,
            idvenda: `${respIdEmpresa[0].IDEMPRESA}-${serie}-${numeroNota}`
        }   
    }
    
    return false;
}

function integrarVendaEcommerce(registro, idvenda, idempresa, conn, session) {
    
    if(!idvenda) return {status: false, message: `Empresa não encontrada, não foi possível criar o idvenda.`};
    
    let validarIntegracaoVenda = libVenda.validarIntegracaoVenda(idvenda, registro.nfeProc, conn);
    
    if(validarIntegracaoVenda.status == true) {
        let statusPgto = validarIntegracaoVenda.statusPgto == true ? `Pagamento integrado.` : validarIntegracaoVenda.statusPgto;
        return {status: true, message: `Processo de integração já efetuado - Status pagamento quality: ${statusPgto}`};
    }
    
    if(!registro.nfeProc.NFe.infNFe.dest.CPF && !registro.nfeProc.NFe.infNFe.dest.CNPJ) return `Erro: Falta um CPF ou CNPJ`;
    let entrega = registro.nfeProc.NFe.infNFe.entrega ? registro.nfeProc.NFe.infNFe.entrega : {
        "CPF": registro.nfeProc.NFe.infNFe.dest.CPF,
        "xNome": registro.nfeProc.NFe.infNFe.dest.xNome,
        "xLgr": registro.nfeProc.NFe.infNFe.dest.enderDest.xLgr,
        "nro": registro.nfeProc.NFe.infNFe.dest.enderDest.nro,
        "xCpl": "S/C",
        "xBairro": registro.nfeProc.NFe.infNFe.dest.enderDest.xBairro,
        "cMun": registro.nfeProc.NFe.infNFe.dest.enderDest.cMun,
        "xMun": registro.nfeProc.NFe.infNFe.dest.enderDest.xMun,
        "UF": registro.nfeProc.NFe.infNFe.dest.enderDest.UF,
        "CEP": registro.nfeProc.NFe.infNFe.dest.enderDest.CEP
    };
    
    let validarCliente = libCliente.validarIntegracaoCliente(idempresa, conn, session, registro.nfeProc.NFe.infNFe.dest, entrega);
    
    if(validarCliente.status == false) {
        return {status: false, message: `Erro: ${validarCliente.message}`};
    }
    
    let integrarVenda = libVenda.integrarVenda(validarCliente.CardCode, validarCliente.idCliente, registro.nfeProc, entrega, idvenda, conn, session)
    //return integrarVenda;
    
    if(integrarVenda.status == false) {
        return {status: false, message: `Erro: ${integrarVenda.message}`};
    }
    
    let statusPgto = integrarVenda.statusPgto == true ? `Pagamento integrado.` : integrarVenda.statusPgto;
    
    return {status: true, message: `Venda integrada com sucesso - Status pagamento quality: ${statusPgto}`};
}

function executarIntegracao(data){
    let dados = [];
    let conn = $.db.getConnection();
    let session = slApi.loginServiceLayer(true);
    
    for(let i = 0; i < data.length; i++) {
        let registro = data[i].body.asString();
        registro = libXml.XmlParaJson(registro);
        //return registro;
        
        let status = false;
        let msg = 'Erro ao integrar a venda no quality.';
        let idvenda = 'N/A';
        let idempresa = 'N/A';
        
        try {
            if(registro.nfeProc.NFe.infNFe.ide.finNFe == 1) {
                let objIdVenda = criarIdVenda(registro.nfeProc.NFe.infNFe.emit.CNPJ, registro.nfeProc.NFe.infNFe.ide.serie, registro.nfeProc.NFe.infNFe.ide.nNF);
                
                if(objIdVenda !== false) {
                    idvenda = objIdVenda.idvenda;
                    idempresa = objIdVenda.idempresa;
                    
                    let respIntegracao = integrarVendaEcommerce(registro, idvenda, idempresa, conn, session);
                    //return log; 
                    
                    status = respIntegracao.status;
                    msg = respIntegracao.message;
                } else {
                    throw new Error("Erro ao criar o IDVENDA.");
                }
            } else {
                throw new Error("O xml informado não possui finalidade de venda de mercadorias.");
            }
        } catch(error) {
            msg = error.message || error;
        } finally {
            dados.push({ 
                idvenda: `${idvenda}`,
                status: status,
                chave: registro.nfeProc.protNFe.infProt.chNFe,
                mensagem: msg
            });
        }
    }
    
    conn.close();
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