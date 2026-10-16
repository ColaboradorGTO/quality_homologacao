let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.integracao-ecommerce-sap.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let libIntegracaoVenda = $.import(`${filePathLibs}.inserts`, "insert-venda-sap"); 
let testeJson = $.import(`${filePathLibs}.utils`, "montar-json-venda"); 

function getDadosVenda(idvenda, retornarJson) {
    let query = `
        SELECT
            TOP 250
        	A.IDEMPRESA,
        	A.IDVENDA,
        	TO_DATE(A.NFE_INFNFE_IDE_DHEMI) AS DATA,
        	A.DTHORAFECHAMENTO AS DATAHORA,
        	B.IDCLIENTESAP,
        	A.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS TOTALVENDA,
        	A.NFE_INFNFE_IDE_NNF AS NUMERONOTA,
        	A.NFE_INFNFE_IDE_SERIE AS SERIENOTA,
        	A.PROTNFE_INFPROT_CHNFE AS CHAVENOTA,
        	A.PROTNFE_INFPROT_NPROT AS PROTOCOLO,
        	A.PROTNFE_INFPROT_CSTAT AS CSTAT,
        	A.PROTNFE_INFPROT_XMOTIVO AS XMOTIVO,
        	A.NFE_INFNFE_TRANSP_MODFRETE AS MODFRETE,
        	A.NFE_INFNFE_TOTAL_ICMSTOT_VFRETE AS VFRETE,
        	A.NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO AS VOUTRO,
        	C.WAREHOUSECODE AS CODIGODEPOSITO,
        	B.SGUF AS UFDESTINO
        FROM
        	"VAR_DB_NAME".VENDA A
        INNER JOIN "VAR_DB_NAME".CLIENTE B ON 
        	A.IDCLIENTE = B.IDCLIENTE 
        INNER JOIN "VAR_DB_NAME".EMPRESA C ON 
            A.IDEMPRESA = C.IDEMPRESA
        WHERE 
        	1 = ?
        	AND A.STECOMMERCE = 'True'
	        AND IFNULL(A.SAP_DOCENTRY_CORRETO, 0) = 0
    `;
    
    if(idvenda) {
        query += ` AND A.IDVENDA = '${idvenda}'`;
    }
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(idvenda && respQuery.length && retornarJson == 'True') {
        let json = testeJson.montarJsonVenda(respQuery[0]);
        return json;
    }
    
    if(respQuery.length) return respQuery;
    
    return false;
}

function integrarVendaSap(registro, conn, session) {
    let respIntegracao = libIntegracaoVenda.integrarVendaSap(registro, session, conn);
    
    if(respIntegracao.status) return {status: true, message: `Venda migrada para o SAP.`};
    
    return {status: false, message: `Erro: ${respIntegracao.message}`};
}

function executarIntegracao(idvenda, retornarJson){
    let data = getDadosVenda(idvenda, retornarJson);
    if(!data) return 'Não foram encontradas vendas para integrar.';
    
    if(retornarJson == 'True') return data;
    
    let dados = [];
    let conn = $.db.getConnection();
    let session = slApi.loginServiceLayer(true);

    for(let i = 0; i < data.length; i++) {
        let registro = data[i];
        //return registro;
        
        let status = false;
        let msg = 'Erro ao integrar a venda no SAP.';
        
        try {
            let respIntegracao = integrarVendaSap(registro, conn, session);
            //return log; 
            
            status = respIntegracao.status;
            msg = respIntegracao.message;
        } catch(error) {
            msg = error.message || error;
        } finally {
            dados.push({ 
                idvenda: `${registro.IDVENDA}`,
                status: status,
                chave: registro.CHAVENOTA,
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