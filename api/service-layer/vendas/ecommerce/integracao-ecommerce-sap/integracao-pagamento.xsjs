let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.integracao-ecommerce-sap.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let testeJson = $.import(`${filePathLibs}.utils`, "montar-json-pagamento");
let libIntegracaoPagamento = $.import(`${filePathLibs}.inserts`, "insert-venda-pagamento-sap");

function getVendasParaIntegrarPagamento(idvenda) {
    let query = `
        SELECT
            TOP 50
        	A.IDVENDA
        FROM
        	"VAR_DB_NAME".VENDA A
        INNER JOIN ${dbNameSAP}.OINV B ON 
            A.IDVENDA = B.U_ID_VENDA_PDV
            AND B.CANCELED = 'N'
        LEFT JOIN ${dbNameSAP}.ORCT C ON 
        	A.IDVENDA = C.U_IS_ID_QUALITY 
        WHERE 
        	1 = ?
        	AND A.STECOMMERCE = 'True'
        	AND A.STCANCELADO = 'False'
        	AND IFNULL(A.SAP_DOCENTRY_CORRETO, 0) <> 0
            AND IFNULL(A.SAP_DOCENTRY_PAGAMENTO, 0) = 0
            AND IFNULL(C."DocEntry", 0) = 0
            AND A.IDVENDA IN (SELECT XA.IDVENDA FROM "VAR_DB_NAME".VENDAPAGAMENTO XA WHERE XA.IDVENDA = A.IDVENDA)
    `;
    
    if(idvenda) {
        query += ` AND A.IDVENDA = '${idvenda}'`;
    }
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length) return respQuery;
    
    return false;
}

function integrarPagamentoVenda(idvenda, retornarJson, conn, session) {
    let respIntegracao = libIntegracaoPagamento.integrarPagamento(idvenda, retornarJson, session, conn);
    
    if(retornarJson) return respIntegracao;
    
    if(respIntegracao.status) return {status: true, message: `Pagamento migrado para o SAP.`};
    
    return {status: false, message: `Erro: ${respIntegracao.message}`};
}

function executarIntegracao(idvenda, retornarJson){
    let data = getVendasParaIntegrarPagamento(idvenda);
    if(!data) return 'Não foram encontradas vendas para integrar o pagamento.';
    
    let dados = [];
    let conn = $.db.getConnection();
    let session = slApi.loginServiceLayer(true);

    for(let i = 0; i < data.length; i++) {
        let idvendaRetorno = data[i].IDVENDA;
        
        let status = false;
        let msg = 'Erro ao integrar o pagamento no SAP.';
        
        try {
            let respIntegracao = integrarPagamentoVenda(idvendaRetorno, retornarJson, conn, session);
            
            if(retornarJson) return respIntegracao;
            
            status = respIntegracao.status;
            msg = respIntegracao.message;
        } catch(error) {
            msg = error.message || error;
        } finally {
            dados.push({ 
                idvenda: `${idvendaRetorno}`,
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
                let idvenda = $.request.parameters.get("idvenda");
                let retornarJson = $.request.parameters.get("retornarJson");
                let doc = executarIntegracao(idvenda, retornarJson);
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