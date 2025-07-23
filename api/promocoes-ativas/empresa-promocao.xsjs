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
    
    var idResumoPromocao = $.request.parameters.get("idResumoPromocao");
    
     var query = `
        SELECT 
            tbt.IDEMPRESAPROMOCAOMARKETING,
            tbt.IDRESUMOPROMOCAOMARKETING,
            tbt.IDEMPRESA,
            tbt.STATIVO,
            tbe.NOFANTASIA
        FROM 
            "VAR_DB_NAME".EMPRESAPROMOCAOMARKETING tbt
            INNER JOIN "VAR_DB_NAME"."EMPRESA" tbe on tbt.IDEMPRESA = tbe.IDEMPRESA
        WHERE
            1 = ?
    `;
    
    if ( byId ) {
        query = query + ' And  tbt.IDEMPRESAPROMOCAOMARKETING = \'' + byId + '\' ';
    }

    if ( idResumoPromocao ) {
        query = query + ' And  tbt.IDRESUMOPROMOCAOMARKETING = \'' + idResumoPromocao + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."EMPRESAPROMOCAOMARKETING" SET ' + 
        ' "IDRESUMOPROMOCAOMARKETING" = ?, ' + 
        ' "IDEMPRESA" = ?, ' + 
        ' "STATIVO" = ? ' + 
    	' WHERE "IDEMPRESAPROMOCAOMARKETING" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDRESUMOPROMOCAOMARKETING);
        pStmt.setInt(2, registro.IDEMPRESA);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDEMPRESAPROMOCAOMARKETING);
                    
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

    //var query = 'DELETE FROM "VAR_DB_NAME".EMPRESAPROMOCAOMARKETING WHERE EMPRESAPROMOCAOMARKETING.IDRESUMOPROMOCAOMARKETING = ? ';

    var bodyJson = JSON.parse($.request.body.asString());
    
	//var registro = bodyJson[0];
	//var pStmt = conn.prepareStatement(api.replaceDbName(query));
	//pStmt.setInt(1, registro.IDRESUMOPROMOCAOMARKETING);
	//pStmt.execute();
	//pStmt.close();
	//conn.commit();

    var query2 = 'INSERT INTO "VAR_DB_NAME"."EMPRESAPROMOCAOMARKETING" ' +
		" ( " +
            ' "IDEMPRESAPROMOCAOMARKETING", ' +
            ' "IDRESUMOPROMOCAOMARKETING", ' +
            ' "IDEMPRESA", ' +
            ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
		
    var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro2 = bodyJson[i];
		var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDEMPRESAPROMOCAOMARKETING")),0) + 1 FROM "VAR_DB_NAME"."EMPRESAPROMOCAOMARKETING" WHERE 1 = ? ', 1);
		
	    for (var j = 0; j < registro2.EMPRESAS.length; j++) {
	        
	        var IdEmpPromo = queryId;
    
            pStmt2.setInt(1, parseInt(IdEmpPromo));
            pStmt2.setInt(2, registro2.IDRESUMOPROMOCAOMARKETING);
            pStmt2.setInt(3, parseInt(registro2.EMPRESAS[j]));
            pStmt2.setString(4, registro2.STATIVO);
        	
            pStmt2.execute();
            
            queryId = queryId + 1;
	    }
	    
	    
	}
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