let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.devolucao-venda-ecommerce.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let libXml = $.import(`${filePathEnviroment}.service-layer.vendas.ecommerce.integracao-ecommerce.libs.utils`, "transformar-xml");//Reutilizando da lib de xml da pasta integração venda ecommerce.
let libInsertDevolucao = $.import(`${filePathLibs}.inserts`, "insert-devolucao");

function getIdvenda(chaveNotaReferenciada) {
    let query = `
        SELECT
        	A.IDVENDA
        FROM
        	"VAR_DB_NAME".VENDA A
        WHERE 
        	1 = ? 
        	AND A.STCANCELADO = 'False'
        	AND A.PROTNFE_INFPROT_CHNFE = '${chaveNotaReferenciada}' 
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    if(respQuery.length) return `${respQuery[0].IDVENDA}`;
    
    return false;
}

function integrarDevolucaoEcommerce(idvenda, objDev, conn, session) {
    let respIntegracaoDevolucao = libInsertDevolucao.integrarDevolucao(idvenda, objDev, conn, session);
    //return respIntegracaoDevolucao;
    
    if(respIntegracaoDevolucao.status) return {status: true, message: `Devolução realizada`};
    
    return {status: false, message: `Erro ao integrar a devolução: ${respIntegracaoDevolucao.message}`};
}

function verificarItensTrocadosXml(det) {
    let itensTrocados = [];
    let idProdutosTrocados = [];
    
    for (let i = 0; i < det.length; i++) {
        itensTrocados[i] = {idproduto: det[i].prod.cProd, quantidadeTrocada: parseInt(det[i].prod.qCom)};
        idProdutosTrocados[i] = det[i].prod.cProd;
    }
    
    const idProdutosFormatados = idProdutosTrocados.map(idproduto => `'${idproduto.trim()}'`).join(", ");
    
    return {idProdutosFormatados, itensTrocados}
}

function executarIntegracao(data){
    let dados = [];
    let conn = $.db.getConnection();
    let session = slApi.loginServiceLayer(true);
    
    for(let i = 0; i < data.length; i++) {
        let registro = data[i].body.asString();
        registro = libXml.XmlParaJson(registro);
        
        let status = false;
        let msg = 'Erro ao integrar a devolução.';
        let idvenda;
        
        try {
            if(registro.nfeProc.NFe.infNFe.ide.finNFe == 4) {
                idvenda = getIdvenda(registro.nfeProc.NFe.infNFe.ide.NFref.refNFe);
                let itensTrocadosXML = verificarItensTrocadosXml(registro.nfeProc.NFe.infNFe.det);
                
                if(idvenda) {
                    let objDev = {
                        numeroNotaDev: registro.nfeProc.NFe.infNFe.ide.nNF,
                        serieNotaDev: registro.nfeProc.NFe.infNFe.ide.serie,
                        chaveNotaDev: registro.nfeProc.protNFe.infProt.chNFe,
                        dataNotaDev: registro.nfeProc.NFe.infNFe.ide.dhEmi.substring(0, 19).replace("T", " "),
                        dadosItensDevolvidos: itensTrocadosXML
                    }
            
                    let respIntegracao = integrarDevolucaoEcommerce(idvenda, objDev, conn, session);
                    //return respIntegracao; 
                    
                    status = respIntegracao.status;
                    msg = respIntegracao.message;
                } else {
                    throw new Error("Não foi possível encontrar a nota referenciada pela devolução.");
                }
            } else {
                throw new Error("O xml informado não possui finalidade de devolução de mercadorias.");
            }
        } catch (error) {
            msg = error.message || error;
        } finally {
            dados.push({ 
                idvenda: `${idvenda}`,
                chave: registro.nfeProc.protNFe.infProt.chNFe,
                status: status,
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