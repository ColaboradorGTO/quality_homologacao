var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idTecido = $.request.parameters.get("idTecido");
    var descTecido = $.request.parameters.get("descTecido");
    
    var query = ' SELECT ' + 
    '   A.IDTPTECIDO, ' + 
    '   A.DSTIPOTECIDO, ' + 
    '   A.STATIVO ' + 
    '   FROM "VAR_DB_NAME".TIPOTECIDOS A ' + 
    ' WHERE ' +
        '	1 = ?';
    if ( byId ) {
        query = query + ' And  A.IDTPTECIDO = \'' + byId + '\' ';
    }

    if ( idTecido ) {
        query = query + ' And  A.IDTPTECIDO = \'' + idTecido + '\' ';
    }

    if ( descTecido ) {
        query = query + ' And  (A.DSTIPOTECIDO LIKE \'%'+descTecido+'%\') ';
    }
    

    query = query + ' ORDER BY A."DSTIPOTECIDO"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."TIPOTECIDOS" SET ' + 
        ' "DSTIPOTECIDO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDTPTECIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    // if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSTIPOTECIDO);
        pStmt.setString(2, registro.STATIVO);
        pStmt.setInt(3, registro.IDTPTECIDO);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDTPTECIDO")),0) + 1 FROM "VAR_DB_NAME"."TIPOTECIDOS" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."TIPOTECIDOS" ' +
		" ( " +
		' "IDTPTECIDO", ' +
        ' "DSTIPOTECIDO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    // if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdTecido = api.executeScalar(queryId,1);

        pStmt.setInt(1, parseInt(IdTecido));
        pStmt.setString(2, registro.DSTIPOTECIDO);
        pStmt.setString(3, registro.STATIVO);
    	
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