let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.devolucao-venda-ecommerce.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
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

function postSlReferenciaNota(data, idvenda, session, conn) {
    let response = slApi.post('/U_SKL40DCREF', data, session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao integrar a referencia da devolução';
        errorLogDevolucaoVenda(idvenda, `Erro ao referenciar a nota de devolucao: ${msgReturnError}`, conn);
        
        return false;
    }
    
    return true;
}

function getSequenceRefSkill(){
    let sequence;
    
    for(let i = 0; i < 3; i++){
        sequence = api.sqlQuery(`SELECT (MAX(CAST(A."Code" AS INT))+1) AS SEQUENCE FROM ${dbNameSAP}."@SKL40DCREF" A WHERE 1 = ?`, 1);
        sequence = sequence[0].SEQUENCE;
        
        let validarSequence = api.sqlQuery(`SELECT A."Code" FROM ${dbNameSAP}."@SKL40DCREF" A WHERE 1 = ? AND A."Code" = '${sequence}'`, 1);
        
        if(validarSequence.length > 0) continue;
        
        return sequence;
    }
    
    return false;
}

function validarReferenciaSap(docEntryVendaSap, docEntryDevSap) {
    let query = `
        SELECT
        	A."Code"
        FROM
        	${dbNameSAP}."@SKL40DCREF" A
        WHERE
            1 = ?
        	AND A."U_DocEntry" = '${docEntryDevSap}'
        	AND A."U_DocRef" = '${docEntryVendaSap}'
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length) return true;
    
    return false;
}

function referenciarDevolucao(idvenda, docEntryVendaSap, docEntryDevSap, session, conn) {
    let sequence = getSequenceRefSkill();
    
    let dadosReferenciaNota = {
        "Code": String(sequence),
        "Name": String(sequence),
        "U_TpDocRef": "133",
        "U_DocEntry": String(docEntryDevSap),
        "U_DocRef": String(docEntryVendaSap),
        "U_FormType": "179",
        "U_tpRef": 0,
        "U_INDEMIT": 0, 
        "U_ZERA_NUM": "N"
    }
    
    let respPost = postSlReferenciaNota(dadosReferenciaNota, idvenda, session, conn);
    
    if(!respPost) return false;
    
    let respValidarReferenciaSap = validarReferenciaSap(docEntryVendaSap, docEntryDevSap);
    
    if(respValidarReferenciaSap) return true;
    
    return false;
}