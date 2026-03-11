var api = $.import("quality.concentrador.api.apiResponse", "int_api");

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
    var idMotivo = $.request.parameters.get("idMotivo");
    var descMotivo = $.request.parameters.get("descMotivo");
    var dtInicio = $.request.parameters.get("dtInicio");
    var dtFim = $.request.parameters.get("dtFim");
    
    var query = `
        SELECT 
            IDMOTIVODEVOLUCAO,
            DSMOTIVO,
            STATIVO,
            IDUSERCRIACAO,
            TO_VARCHAR(DTCRIACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTCRIACAO,
            IDUSERULTALTERACAO,
            TO_VARCHAR(DTULTALTERACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTULTALTERACAO,
            TO_VARCHAR(DTCRIACAO, 'DD/MM/YYYY HH24:MI:SS') AS DTCRIACAOFORMATADA,
            TO_VARCHAR(DTULTALTERACAO, 'DD/MM/YYYY HH24:MI:SS') AS DTULTALTERACAOFORMATADA
        FROM 
            "VAR_DB_NAME".MOTIVODEVOLUCAO
        WHERE
            1 = ?
    `;
    
    if ( byId ) {
        query += ` AND  IDMOTIVODEVOLUCAO = ${byId} `;
    }
    
    if ( idMotivo ) {
        query += ` AND  IDMOTIVODEVOLUCAO = ${idMotivo} `;
    }
    
    if ( descMotivo ) {
        query += ` AND  CONTAINS(DSMOTIVO, '%${descMotivo}%') `;
    }
    
    if ( dtInicio ) {
        query += ` AND (DTCRIACAO BETWEEN '${dtInicio} 00:00:00' AND '${dtFim} 23:59:59' OR DTULTALTERACAO BETWEEN '${dtInicio} 00:00:00' AND '${dtFim} 23:59:59') `;
    }
    
    query += '  ORDER BY IDMOTIVODEVOLUCAO  ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut(){
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    let IDMOTIVODEVOLUCAO;
    
    bodyJson.map((dados, indice)=>{
        IDMOTIVODEVOLUCAO = dados.IDMOTIVODEVOLUCAO;
        
        let updateMotivo = `
            UPDATE
                "VAR_DB_NAME".MOTIVODEVOLUCAO
            SET
                DSMOTIVO = ?,
                STATIVO = ?,
                IDUSERULTALTERACAO = ?,
                DTULTALTERACAO = NOW()
            WHERE
                IDMOTIVODEVOLUCAO = ?
        `;
        
        let pStmtUpdateMotivo = conn.prepareStatement(api.replaceDbName(updateMotivo));
        
        pStmtUpdateMotivo.setString(1, dados.DSMOTIVO);
        pStmtUpdateMotivo.setString(2, dados.STATIVO);
        pStmtUpdateMotivo.setInt(3, dados.IDUSUARIO);
        pStmtUpdateMotivo.setInt(4, dados.IDMOTIVODEVOLUCAO);
        pStmtUpdateMotivo.execute();
        pStmtUpdateMotivo.close();
    })
    
    conn.commit();
    
    return {
        "type": 'success',
        "msg": 'Dados Atualizados com Sucesso!',
        IDMOTIVODEVOLUCAO
    }
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    var bodyJson = JSON.parse($.request.body.asString());
    if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    var IDMOTIVODEVOLUCAO;
    
    var queryExistMotivo = `
        SELECT
            * 
        FROM
            "VAR_DB_NAME".MOTIVODEVOLUCAO
        WHERE 
            CONTAINS(DSMOTIVO, '${bodyJson[0].DSMOTIVO}%')
            AND 1 = ?
    `;
    
    var resultQueryMotivo = api.sqlQuery(queryExistMotivo, 1);
    
    if(resultQueryMotivo.length){
        IDMOTIVODEVOLUCAO = resultQueryMotivo[0].IDMOTIVODEVOLUCAO;
        
        return {
            "type": "warning",
            "msg": "Este motivo já existe!",
            IDMOTIVODEVOLUCAO
        };
    }
    
    var insertMotivo = `
        INSERT INTO
            "VAR_DB_NAME".MOTIVODEVOLUCAO
            (
                DSMOTIVO,
                STATIVO,
                IDUSERCRIACAO,
                DTCRIACAO,
                IDUSERULTALTERACAO,
                DTULTALTERACAO
            )
        VALUES(?, 'True', ?, now(), ?, now());
    `;
		
    var pStmtInsertMotivo = conn.prepareStatement(api.replaceDbName(insertMotivo));

    bodyJson.map((registro, indice) => {
		pStmtInsertMotivo.setString(1, registro.DSMOTIVO);
		pStmtInsertMotivo.setInt(2, registro.IDUSUARIO);
		pStmtInsertMotivo.setInt(3, registro.IDUSUARIO);
        
        pStmtInsertMotivo.execute();
        pStmtInsertMotivo.close();
	})

	conn.commit();
	
    return {
        "type": "success",
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