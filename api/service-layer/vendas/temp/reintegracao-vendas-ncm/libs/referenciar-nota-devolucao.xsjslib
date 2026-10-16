let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";
let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");
let errorLib = $.import(`${filePath}.service-layer.common`, "error");

function postSl(data, session, idvenda, conn) {
    let response = slApi.post('/U_SKL40DCREF', data, session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao integrar a referencia da devolução';
        errorLogRefDevolucao(idvenda, msgReturnError, conn);
        
        return false;
    }
    
    successLogRefDevolucao(idvenda, conn);
    
    return true;
}

function successLogRefDevolucao(idvenda, conn){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA"
        SET 
            LOGREFERENCIADEV = 'REFERENCIADA'
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, idvenda);
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function errorLogRefDevolucao(idvenda, p_Error, conn){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA"
        SET 
            LOGREFERENCIADEV = ?
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

function referenciarDevolucao(registro, docEntryDevolucao, session, conn) {
    let dadosReferenciaNota = {
        "Code": String(docEntryDevolucao),
        "Name": String(docEntryDevolucao),
        "U_TpDocRef": "133",
        "U_DocEntry": String(docEntryDevolucao),
        "U_DocRef": String(registro.DOCENTRYVENDA65),
        "U_FormType": "179",
        "U_tpRef": 0,
        "U_INDEMIT": 0, 
        "U_ZERA_NUM": "N"
    }
    
    return postSl(dadosReferenciaNota, session, registro.IDVENDA, conn);
}