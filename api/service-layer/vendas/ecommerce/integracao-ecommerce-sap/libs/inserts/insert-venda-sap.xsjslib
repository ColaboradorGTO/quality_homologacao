let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.integracao-ecommerce-sap.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");
let libJsonVenda = $.import(`${filePathLibs}.utils`, "montar-json-venda"); 

function postSl(data, session) {
    let response = slApi.post('/Invoices', data, session);
    
    if (response.status !== 204) {
        response = JSON.parse(response.body.asString());
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar integrar a venda!';
        
        return msgReturnError;
    }
   
   return true;
    
}

function getDadosVenda(idvenda, retornarJson) {
    let query = `
        SELECT
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
        	AND A.IDVENDA = '${idvenda}'
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length && retornarJson == 'retornarJson') {
        let json = montarJsonVenda(respQuery[0]);
        return json;
    }
    
    if(respQuery.length) return respQuery[0];
    
    return false;
}

function verificarVendaSap(idvenda){
    let query = `
    SELECT 
        A."DocEntry" AS DOCENTRY,
        A."DocNum" AS DOCNUM
    FROM 
        ${dbNameSAP}.OINV A 
    WHERE 
        1 = ? 
        AND A.U_ID_VENDA_PDV = '${idvenda}'
        AND A."CANCELED" = 'N'
        AND A."Model" = 39
    `;
    
    let respValidarIntegracaoVenda = api.sqlQuery(query, 1);
    
    if(respValidarIntegracaoVenda.length) return respValidarIntegracaoVenda[0];
    
    return false;
}

function atualizarLogErrorSap(idvenda, message, conn) {
    let query = `
        UPDATE 
        	"VAR_DB_NAME".VENDA A
        SET 
        	A.ERRORLOGSAP = '${message}'
        WHERE 
        	A.IDVENDA = ? 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(query));

    try {
    	pStmtUpdate.setString(1, idvenda);
    	pStmtUpdate.execute();
    	conn.commit();
    	
    	return true;
    } catch (error) {
        return error;
    } finally {
       pStmtUpdate.close(); 
    }
}

function atualizarDadosQuality(idvenda, docentry, docnum, conn) {
    let query = `
        UPDATE 
        	"VAR_DB_NAME".VENDA A
        SET 
        	A.SAP_DOCENTRY = ${docnum},
        	A.SAP_DOCENTRY_CORRETO = ${docentry},
        	A.ERRORLOGSAP = null
        WHERE 
        	A.IDVENDA = ? 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(query));

    try {
    	pStmtUpdate.setString(1, idvenda);
    	pStmtUpdate.execute();
    	conn.commit();
    	
    	return true;
    } catch (error) {
        return error;
    } finally {
       pStmtUpdate.close(); 
    }
}

function integrarVendaSap(dadosVenda, session, conn){
    let validacaoVendaSap = verificarVendaSap(dadosVenda.IDVENDA);
    
    if(validacaoVendaSap) {
        atualizarDadosQuality(dadosVenda.IDVENDA, validacaoVendaSap.DOCENTRY, validacaoVendaSap.DOCNUM, conn);
        
        return {
            status: true,
            message: `Venda já integrada no SAP.`
        }
    }
    
    let data = libJsonVenda.montarJsonVenda(dadosVenda);
    
    if(!data.status) return {status: false, message: data.message}
    
    let respIntegracao = postSl(data.message, session);
    
    if(respIntegracao == true) {
        let respValidarIntegracaoVenda = verificarVendaSap(dadosVenda.IDVENDA);
        
        if(respValidarIntegracaoVenda) {
            atualizarDadosQuality(dadosVenda.IDVENDA, respValidarIntegracaoVenda.DOCENTRY, respValidarIntegracaoVenda.DOCNUM, conn);
            
            return {
                status: true,
                message: `Venda integrada com sucesso!`
            }
        } else {
            return {
                status: false,
                message: `Erro ao integrar a venda!`
            }
        } 
    } 
    
    atualizarLogErrorSap(dadosVenda.IDVENDA, respIntegracao, conn);
    
    return {
        status: false,
        message: respIntegracao
    }
}