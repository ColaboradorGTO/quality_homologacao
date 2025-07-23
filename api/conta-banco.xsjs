var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    let idBanco = $.request.parameters.get("idBanco");
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dsConta = $.request.parameters.get("dsConta");
    
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
            AND TBCB.STATIVO = 'True' 
    `;
    
    if ( byId ) {
        query += ` AND TBCB.IDCONTABANCO = ${byId} `;
    }
    
    if ( idBanco ) {
        query += ` AND  TBCB.IDBANCO = ${idBanco} `;
    }
    
    if ( idEmpresa ) {
        query += ` AND  TBVCBE.IDEMPRESA = ${idEmpresa} `;
    }
    
    if ( dsConta ) {
       // query += ` AND CONTAINS((TBCB.DSCONTABANCO, TBB.DSBANCO), '%${dsConta}%') `;
    }
    
    query += ' ORDER BY IDCONTABANCO ';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CONTABANCO" SET ' + 
        ' "IDBANCO" = ?, ' +
        ' "DSCONTABANCO" = ?, ' +
        ' "NUAGENCIA" = ?, ' +
        ' "NUDIGITOAGENCIA" = ?, ' +
        ' "NUCONTA" = ?, ' +
        ' "NUDIGITOCONTA" = ?, ' +
        ' "TPPESSOA" = ?, ' +
        ' "STPADRAO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "NUCONTASAP" = ? ' +
    	' WHERE "IDCONTABANCO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

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
        pStmt.setInt(11, registro.IDCONTABANCO);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CONTABANCO" ' +
		" ( " +
	        ' "IDCONTABANCO", ' +
            ' "IDBANCO", ' +
            ' "DSCONTABANCO", ' +
            ' "NUAGENCIA", ' +
            ' "NUDIGITOAGENCIA", ' +
            ' "NUCONTA", ' +
            ' "NUDIGITOCONTA", ' +
            ' "TPPESSOA", ' +
            ' "STPADRAO", ' +
            ' "STATIVO", ' +
            ' "NUCONTASAP" ' +
    	' ) ' +
		' VALUES("VAR_DB_NAME".SEQ_CONTABANCO.NEXTVAL,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
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
            fnHandleGet(id);
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