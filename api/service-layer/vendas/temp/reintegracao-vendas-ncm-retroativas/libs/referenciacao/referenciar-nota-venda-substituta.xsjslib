let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";
let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");
let errorLib = $.import(`${filePath}.service-layer.common`, "error");

function postSl(data, session, idvenda, conn, tipo) {
    let response = slApi.post('/U_SKL40DCREF', data, session);
    
    if(response.status < 200 || response.status > 300){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao integrar a referencia.';
        if(tipo == 'externa') return false;
        
        errorLogRefVendaSubs(idvenda, msgReturnError, conn);
        return false;
    }
    
    if(tipo == 'externa') return true;
    
    successLogRefVendaSubs(idvenda, conn);
    return true;
}

function successLogRefVendaSubs(idvenda, conn){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA"
        SET 
            LOGREFERENCIAVENDA55 = 'REFERENCIADA'
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, idvenda);
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function errorLogRefVendaSubs(idvenda, p_Error, conn){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA"
        SET 
            LOGREFERENCIAVENDA55 = ?
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(p_Error));
	pStmt.setString(2, idvenda);
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function referenciarNotaDevolucao(registro, docEntryVenda55, session, conn, docEntryDev, tipo){
    let dadosRefDev = {
        "Code": String(docEntryVenda55),
        "Name": String(docEntryVenda55),
        "U_TpDocRef": "179",
        "U_DocEntry": String(docEntryVenda55),
        "U_DocRef": String(docEntryDev),
        "U_FormType": "133",
        "U_tpRef": 0,
        "U_INDEMIT": 0, 
        "U_ZERA_NUM": "N"
    }
    
    return postSl(dadosRefDev, session, registro.IDVENDA, conn, tipo);
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

function referenciarNotaVenda(registro, docEntryVenda55, session, conn, tipo){
    let sequence = getSequenceRefSkill();
    
    if(sequence) {
        let dadosRefVenda = {
            "Code": String(sequence),
            "Name": String(sequence),
            "U_TpDocRef": "133",
            "U_DocEntry": String(docEntryVenda55),
            "U_DocRef": String(registro.DOCENTRYVENDA65),
            "U_FormType": "133",
            "U_tpRef": 0,
            "U_INDEMIT": 0, 
            "U_ZERA_NUM": "N"
        }
        
        return postSl(dadosRefVenda, session, registro.IDVENDA, conn, tipo);
    }
    
    return false;
}

function atualizarStatusProcesso(idvenda, conn) {
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA"
        SET 
            STPROCESSOFINALIZADO = 'True'
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, idvenda);
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function validarIntegracaoReferencia(docEntryOrigem, docEntryReferenciado){
    let queryValidaRefVenda = `
        SELECT
            A."U_DocRef" AS DOCENTRYREFERENCIA,
            A."U_DocEntry" as DOCENTRYORIGEM
        FROM 
            ${dbNameSAP}."@SKL40DCREF" A
        INNER JOIN ${dbNameSAP}."OINV" B ON 
            A."U_DocEntry" = B."DocEntry"
        WHERE
            B."CANCELED" = 'N'
            AND A."U_DocRef" = '${docEntryReferenciado}'
            AND A."U_DocEntry" = ?
    `;
    
    let resultRefVenda = api.sqlQuery(queryValidaRefVenda, docEntryOrigem);
    
    if(resultRefVenda.length) return true;
    
    return false;
}

function referenciarVenda(registro, docEntryVenda55, session, conn, docEntryDev, tipo) {
    let retRefDev = validarIntegracaoReferencia(docEntryVenda55, registro.DOCENTRYDEV);
    let retRefVen = validarIntegracaoReferencia(docEntryVenda55, registro.DOCENTRYVENDA65);
    
    if(!retRefDev){
        retRefDev = referenciarNotaDevolucao(registro, docEntryVenda55, session, conn, docEntryDev, tipo);
    }
    
    if(!retRefVen) {
        retRefVen = referenciarNotaVenda(registro, docEntryVenda55, session, conn, tipo);
    }
    
    if(retRefDev && retRefVen) {
        //atualizarStatusProcesso(registro.IDVENDA, conn);
        return true;
    }
    
    return false;
}