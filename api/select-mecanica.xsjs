var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    var query = `
        SELECT 
            ID, 
            DESCRICAO, 
            APLICACAODESTINO, 
            MECANICA, 
            TIPODESCONTO, 
            DTCRIACAO, 
            DTULTIMAALTERACAO, 
            STATIVO 
        FROM "VAR_DB_NAME".MECANICASELECTPROMOCAOMARKETING
        WHERE 1 = ?
        AND STATIVO = 'True'
    `

    query = query + 'ORDER BY ID';

    if (byId) {
        query = query + ' AND ID = ?';
    }

     var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();

    var query = `
        UPDATE "VAR_DB_NAME".MECANICASELECTPROMOCAOMARKETING 
        SET DESCRICAO = ?
        WHERE ID = ?
    `;

     var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.DESCRICAO);
        pStmt.setInt(2, registro.ID);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
    
}

// function fnHandlePost() {
//     var conn = $.db.getConnection();
//     var idMecanica = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("ID")),0) + 1 FROM "QUALITY_CONC_HML"."MECANICASELECTPROMOCAOMARKETING" WHERE 1 = ? ', 1);
    
    
//     var query = `INSERT INTO "QUALITY_CONC_HML"."MECANICASELECTPROMOCAOMARKETING" (
//         "ID",
//         "DESCRICAO", 
//         "APLICACAODESTINO", 
//         "MECANICA", 
//         "TIPODESCONTO", 
//         "DTCRIACAO", 
//         "DTULTIMAALTERACAO", 
//         "STATIVO"
//     ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'True')`;

		
//         var pStmt = conn.prepareStatement(api.replaceDbName(query));
//         var bodyJson = JSON.parse($.request.body.asString());
        
//         for (var i = 0; i < bodyJson.length; i++) {
            
//             var registro = bodyJson[i];
	

//             pStmt.setInt(1, parseInt(idMecanica));
//             pStmt.setString(2, registro.DESCRICAO);
//             pStmt.setInt(3, registro.APLICACAODESTINO);
//             pStmt.setInt(4, registro.MECANICA);
//             pStmt.setInt(5, registro.TIPODESCONTO);
//             pStmt.execute();
// 	}

// 	pStmt.close();

// 	conn.commit();
	
//     return {
// 	    "msg": "Mecanica Criada com sucesso!",
	    
// 	};
// }

function fnHandlePost() {
    var conn = $.db.getConnection();
    
     if (!$.request.body || !$.request.body.asString()) {
        return { msg: "Nenhum dado enviado no body da requisição." };
    }
    var query = `INSERT INTO "VAR_DB_NAME"."MECANICASELECTPROMOCAOMARKETING" (
        "ID",
        "DESCRICAO", 
        "APLICACAODESTINO", 
        "MECANICA", 
        "TIPODESCONTO", 
        "DTCRIACAO", 
        "DTULTIMAALTERACAO", 
        "STATIVO"
    ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'True')`;

    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString());
    var idMecanica = api.executeScalar('SELECT IFNULL(MAX(TO_INT("ID")),0) + 1 FROM "VAR_DB_NAME"."MECANICASELECTPROMOCAOMARKETING" WHERE 1 = ?', 1);

    pStmt.setInt(1, parseInt(idMecanica));
    pStmt.setString(2, registro.DESCRICAO);
    pStmt.setInt(3, parseInt(registro.APLICACAODESTINO));
    pStmt.setInt(4, parseInt(registro.MECANICA));
    pStmt.setInt(5, parseInt(registro.TIPODESCONTO));
    pStmt.execute();

    pStmt.close();
    conn.commit();
    return {
        "msg": "Mecanica Criada com sucesso!",
        "data": registro
    };
}
$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
          //Handle your GET calls here
        case $.net.http.GET:
            var byId = $.request.parameters.get("");
            fnHandleGet()
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
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}

