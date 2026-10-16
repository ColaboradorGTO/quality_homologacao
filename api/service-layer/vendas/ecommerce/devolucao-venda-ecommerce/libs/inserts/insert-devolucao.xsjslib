let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.devolucao-venda-ecommerce.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let libJsonDevolucao = $.import(`${filePathLibs}.utils`, "montar-json-devolucao");
let libReferenciaDev = $.import(`${filePathLibs}.inserts`, "insert-tabela-referencia-skill");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

function errorLogDevolucaoVenda(idvenda, p_Error, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME".VENDA
        SET 
            ERRORLOGSAP = ?
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

    try {
    	pStmt.setString(1, p_Error);
    	pStmt.setString(2, idvenda);
    	
    	pStmt.execute();
    	conn.commit();
    	return true;
    } catch(error) {
        return false;
    } finally {
        pStmt.close();        
    }
}

function atualizarStatusDevolucao(idvenda, docEntryDevSap, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME".VENDA
        SET 
            STDEVOLUCAO = 'True',
            STDEVOLVIDO = 'True',
            ERRORLOGSAP = null,
            DOCENTRYDEVSAP = ?
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

    try {
        pStmt.setInt(1, docEntryDevSap);
    	pStmt.setString(2, idvenda);
    	
    	pStmt.execute();
    	conn.commit();
    	return true;
    } catch(error) {
        return false;
    } finally {
        pStmt.close();        
    }
}

function getDevolucaoSAP(idvenda){
    let query = `
        SELECT
            "U_ID_VENDA_PDV" AS IDVENDA,
            "DocEntry" AS DOCENTRY
        FROM 
            ${dbNameSAP}.ORIN
        WHERE
            "U_ID_VENDA_PDV" = ?
            AND "CANCELED" = 'N'
            AND "U_finNfe" = '4'
    `;
    
    let respQuery = api.sqlQuery(query, idvenda);
    
    if(respQuery.length) return respQuery[0];
    
    return false;
}

function postSl(idvenda, data, session, conn) {
    let response = slApi.post('/CreditNotes', data, session);
    let msg = 'Erro ao gerar a Devolucao no SAP';

    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        msg = response.error.message.value || msg;
        
        errorLogDevolucaoVenda(idvenda, msg, conn);
        return false;
    }
    
    let retornoDevSap = getDevolucaoSAP(idvenda);
    
    if(retornoDevSap) return retornoDevSap.DOCENTRY;
    
    errorLogDevolucaoVenda(idvenda, msg, conn);
    return false;
}

function validarVendaQualitySap(idvenda){
    let query = `
        SELECT 
            A.SAP_DOCENTRY_CORRETO AS DOCENTRY
        FROM 
            "VAR_DB_NAME".VENDA A 
        WHERE 
            1 = ? 
            AND A.IDVENDA = '${idvenda}'
            AND IFNULL(A.STDEVOLVIDO, 'False') <> 'True'
            AND IFNULL(A.STDEVOLUCAO, 'False') <> 'True'
            AND IFNULL(A.SAP_DOCENTRY_CORRETO, 0) <> 0
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length) return respQuery[0].DOCENTRY;
    
    return false;
}

function integrarDevolucao(idvenda, objDev, conn, session){
    let docEntryVendaSap = validarVendaQualitySap(idvenda);
    
    if(docEntryVendaSap == false) return {status: false, message: `Venda já devolvida ou a venda não está integrada no Quality/Sap para que seja feita a devolução.`};
    
    let jsonDevolucao = libJsonDevolucao.montarJsonDevolucao(idvenda, objDev);
    
    if(!jsonDevolucao.status) return {status: false, message: jsonDevolucao.message};
    
    //return jsonDevolucao.message; //retorno json
    
    let docEntryDevSap = postSl(idvenda, jsonDevolucao.message, session, conn);
    
    if(docEntryDevSap == false) return {status: false, message: `Erro ao gerar a devolução, favor conferir campo ERRORLOGSAP.`};
    
    atualizarStatusDevolucao(idvenda, docEntryDevSap, conn);
    let respReferenciaDev = libReferenciaDev.referenciarDevolucao(idvenda, docEntryVendaSap, docEntryDevSap, session, conn);
    
    if(respReferenciaDev) return {status: true, message: `Devolução integrada e referenciada.`};
    
    return {status: false, message: `Devolução integrada porém não foi referenciada, favor checar os logs.`}
}