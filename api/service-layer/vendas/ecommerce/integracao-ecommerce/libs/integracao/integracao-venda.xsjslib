let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.integracao-ecommerce.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");
let libInsertVendaQuality = $.import(`${filePathLibs}.inserts`, "insert-venda-quality"); 
let libPagamentoQuality = $.import(`${filePathLibs}.inserts`, "insert-venda-pagamento-quality"); 

function verificarIntegracao(idvenda){
    let query = `
        SELECT
        	A.IDVENDA
        FROM
        	"VAR_DB_NAME".VENDA A
        WHERE
            1 = ?
        	AND A.IDVENDA = '${idvenda}'
        	AND IFNULL(A.SAP_DOCENTRY_CORRETO, 0) <> 0
    `;
    
    let respValidarIntegracaoVenda = api.sqlQuery(query, 1);
    if(respValidarIntegracaoVenda.length) return true;
    
    return false;
}

function validarIntegracaoVenda(idvenda, nfeProc, conn){
    let respValidarIntegracaoVenda = verificarIntegracao(idvenda);
    
    if(respValidarIntegracaoVenda) {
        let pagamentoQuality = libPagamentoQuality.integrarPagamento(idvenda, nfeProc, conn);
        
        return {
            status: true,
            statusPgto: pagamentoQuality,
            message: `Processo de integração finalizado!`
        }
    } 
    
    return {
        status: false,
        message: `Processo de integração não finalizado!`
    };
};

function verificarVendaQuality(idvenda) {
    let query = `
        SELECT
        	A.IDVENDA
        FROM
        	"VAR_DB_NAME".VENDA A
        WHERE
            1 = ?
        	AND a.IDVENDA = '${idvenda}'
    `;
    
    let respValidarIntegracaoVenda = api.sqlQuery(query, 1);
    if(respValidarIntegracaoVenda.length) return true;
    
    return false;
}

function integrarVenda(codPnSap, idCliente, nfeProc, entrega, idvenda, conn, session){
    let validacaoVendaQuality = verificarVendaQuality(idvenda);
    let pagamentoQuality = false;
    
    if(!validacaoVendaQuality) {
        let respValicaoVendaQuality = libInsertVendaQuality.integrarVendaQuality(idvenda, nfeProc, idCliente, conn, session);
        
        if(respValicaoVendaQuality.status) {
            pagamentoQuality = libPagamentoQuality.integrarPagamento(idvenda, nfeProc, conn);
        
            return {
                status: true, 
                statusPgto: pagamentoQuality,
                message: `Venda integrada com sucesso.`
            }
        } else {
            return {
                status: false,
                statusPgto: pagamentoQuality,
                message: respValicaoVendaQuality.message
            }
        }
    }
    
    pagamentoQuality = libPagamentoQuality.integrarPagamento(idvenda, nfeProc, conn);
    
    return {
        status: true,
        statusPgto: pagamentoQuality,
        message: `Venda integrada.`
    }
}