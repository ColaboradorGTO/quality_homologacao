let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let conn;

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function inserirVinculoContaBancoEmpresa(idConta, idUser, idEmpresa){
    let queryInsert = `
        INSERT INTO
            "VAR_DB_NAME".VINCULOCONTABANCOEMPRESA
        (
            IDEMPRESA,
            IDCONTABANCO,
            IDUSERULTIMAALTERACAO
        )
        VALUES(?, ?, ?)
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    pStmtInsert.setInt(1, idEmpresa);
    pStmtInsert.setInt(2, idConta);
    pStmtInsert.setInt(3, idUser);
    
    pStmtInsert.execute();
	pStmtInsert.close();
}

function atualizarVinculoContaBancoEmpresa(idUser, stAtivo, idVinculo){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME".VINCULOCONTABANCOEMPRESA
        SET 
            IDUSERULTIMAALTERACAO = ?,
            STATIVO = ?,
            DTHORAULTIMAALTERACAO = CURRENT_TIMESTAMP
        WHERE 
            IDVINCULOCONTABANCOEMPRESA = ?
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmtUpdate.setInt(1, idUser);
    pStmtUpdate.setString(2, stAtivo);
    pStmtUpdate.setInt(3, idVinculo);
    
    pStmtUpdate.execute();
	pStmtUpdate.close();
}

function fnInserirOuAtualizarVinculoContaBancoEmpresa(idConta, idUser, arrayVinculoEmpresas){
    for (let i = 0; i < arrayVinculoEmpresas.length; i++) {
		let registro = arrayVinculoEmpresas[i];
		let { IDVINCULOCONTABANCOEMPRESA, IDEMPRESA, STATIVO } = registro || false;
		
        if(IDVINCULOCONTABANCOEMPRESA){
            atualizarVinculoContaBancoEmpresa(idUser, STATIVO, IDVINCULOCONTABANCOEMPRESA);
        } else {
            inserirVinculoContaBancoEmpresa(idConta, idUser, IDEMPRESA);
        }
    }
}

function getVinculoContaBancoEmpresa(idConta){
    let queryVinculo = `
        SELECT
            IDVINCULOCONTABANCOEMPRESA,
            IDCONTABANCO,
            IDEMPRESA,
            STATIVO
        FROM
            "VAR_DB_NAME".VINCULOCONTABANCOEMPRESA
        WHERE
            IDCONTABANCO = ?
    `;
    
    
    return api.sqlQuery(queryVinculo, idConta);
}

function fnHandleGet(byId) {
    let idBanco = $.request.parameters.get("idBanco");
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let nuAgencia = $.request.parameters.get("nuAgencia");
    let nuDigitoAgencia = $.request.parameters.get("nuDigitoAgencia");
    let nuConta = $.request.parameters.get("nuConta");
    let nuDigitoConta = $.request.parameters.get("nuDigitoConta");
    let dsConta = $.request.parameters.get("dsConta");
    let stAtivo = $.request.parameters.get("stAtivo");
    
    let query = `
        SELECT 
            TBCB.IDCONTABANCO,
            TBCB.IDBANCO,
            TBCB.DSCONTABANCO,
            TBCB.NUAGENCIA,
            TBCB.NUDIGITOAGENCIA,
            TBCB.NUCONTA,
            TBCB.NUDIGITOCONTA,
            TBCB.TPPESSOA,
            TBCB.TPCONTA,
            TBCB.STPADRAO,
            TBCB.STATIVO,
            TBCB.NUCONTASAP,
            TBB.DSBANCO,
            TBB.NUBANCO
        FROM
            "VAR_DB_NAME".CONTABANCO TBCB
        INNER JOIN "VAR_DB_NAME".BANCO TBB ON
            TBCB.IDBANCO = TBB.IDBANCO
        WHERE
            1 = ? 
    `;
    
    if ( byId ) {
        query += ` AND TBCB.IDCONTABANCO = ${byId} `;
    }
    
    if ( stAtivo ) {
        query += ` AND TBCB.STATIVO = '${stAtivo}'  `;
    }
    
    if ( idBanco ) {
        query += ` AND  TBCB.IDBANCO = ${idBanco} `;
    }
    
    if ( nuAgencia ) {
        query += ` AND  TBCB.NUAGENCIA = ${nuAgencia} `;
    }
    
    if ( nuDigitoAgencia ) {
        query += ` AND  TBCB.NUDIGITOAGENCIA = ${nuDigitoAgencia} `;
    }
    
    if ( nuConta ) {
        query += ` AND  TBCB.NUCONTA = ${nuConta} `;
    }
    
    if ( nuDigitoConta ) {
        query += ` AND  TBCB.NUDIGITOCONTA = ${nuDigitoConta} `;
    }
    
    /*if ( idEmpresa ) {
        query += ` 
            AND  TBCB.IDCONTABANCO IN (
                SELECT 
                    IDCONTABANCO 
                FROM 
                    "VAR_DB_NAME".VINCULOCONTABANCOEMPRESA
                WHERE 
                    IDEMPRESA = ${idEmpresa}
            )`;
    }*/
    
    if ( dsConta ) {
        query += ` AND CONTAINS((TBCB.DSCONTABANCO, TBB.DSBANCO), '%${dsConta}%') `;
    }
    
    query += ' ORDER BY IDCONTABANCO ';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	/*for (var i = 0; i < response.data.length; i++) {
		let registro = JSON.parse(JSON.stringify(response.data[i]));
        registro.VINCULOEMPRESAS = getVinculoContaBancoEmpresa(registro.IDCONTABANCO);
        
        data.push(registro)
	}

	response.data = data;*/

	return response;
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    // if(!Array.isArray(bodyJson) || !bodyJson.length > 0){
    //     bodyJson = bodyJson
    //     throw new Error('Body not found or Invalid Format Body');
    // }
    
    if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    
    conn = $.db.getConnection();
    
    let query = `
        UPDATE
            "VAR_DB_NAME"."CONTABANCO" 
        SET 
            "IDBANCO" = ?,
            "DSCONTABANCO" = ?,
            "NUAGENCIA" = ?,
            "NUDIGITOAGENCIA" = ?,
            "NUCONTA" = ?,
            "NUDIGITOCONTA" = ?,
            "TPPESSOA" = ?,
            "STPADRAO" = ?,
            "STATIVO" = ?,
            "NUCONTASAP" = ?,
            "TPCONTA" = ?
        WHERE 
            "IDCONTABANCO" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    for (let i = 0; i < bodyJson.length; i++) {
        
        let registro = bodyJson[i];
        
        pStmt.setInt(1, registro.IDBANCO);
        pStmt.setString(2, registro.DSCONTABANCO);
        pStmt.setString(3, registro.NUAGENCIA);
        pStmt.setString(4, registro.NUDIGITOAGENCIA);
        pStmt.setString(5, registro.NUCONTA);
        pStmt.setString(6, registro.NUDIGITOCONTA);
        pStmt.setString(7, registro.TPPESSOA);
        pStmt.setString(8, registro.STPADRAO);
        pStmt.setString(9, registro.STATIVO);
        pStmt.setString(10, registro.NUCONTASAP);
        pStmt.setString(11, registro.TPCONTA);
        pStmt.setInt(12, registro.IDCONTABANCO);
        
        //fnInserirOuAtualizarVinculoContaBancoEmpresa(registro.IDCONTABANCO, registro.IDUSERULTIMAALTERACAO, registro.VINCULOEMPRESAS);
        
        pStmt.execute();
    }
    
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    // if(!Array.isArray(bodyJson) || !bodyJson.length > 0){
    //     throw new Error('Body not found or Invalid Format Body');
    // }
    
    if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    
    conn = $.db.getConnection();
    
    let queryInsert = `
        INSERT INTO
            "VAR_DB_NAME"."CONTABANCO"
        (
            "IDCONTABANCO",
            "IDBANCO",
            "DSCONTABANCO",
            "NUAGENCIA",
            "NUDIGITOAGENCIA",
            "NUCONTA",
            "NUDIGITOCONTA",
            "TPPESSOA",
            "TPCONTA",
            "NUCONTASAP",
            "STPADRAO",
            "STATIVO"
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,'False','True')
    `;
    	
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    for (let i = 0; i < bodyJson.length; i++) {
        let registro = bodyJson[i];
        let idContaBanco = Number(api.executeScalar('SELECT "VAR_DB_NAME".SEQ_CONTABANCO.NEXTVAL FROM DUMMY WHERE 1 = ?', 1));
        
        pStmt.setInt(1, idContaBanco);
        pStmt.setInt(2, registro.IDBANCO);
        pStmt.setString(3, registro.DSCONTABANCO);
        pStmt.setString(4, registro.NUAGENCIA);
        setStringOrNull(pStmt, 5, registro.NUDIGITOAGENCIA);
        pStmt.setString(6, registro.NUCONTA);
        setStringOrNull(pStmt, 7, registro.NUDIGITOCONTA);
        pStmt.setString(8, registro.TPPESSOA);
        pStmt.setString(9, registro.TPCONTA);
        setStringOrNull(pStmt, 10, registro.NUCONTASAP);
        
        //fnInserirOuAtualizarVinculoContaBancoEmpresa(idContaBanco, registro.IDUSERULTIMAALTERACAO, registro.VINCULOEMPRESAS);
        
        pStmt.execute();
    }
    
    pStmt.close();
    
    conn.commit();
    
    return {
        "msg": "Inclusão realizada com sucesso!"
    };
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            $.response.setBody(JSON.stringify(fnHandleGet(id)));
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}