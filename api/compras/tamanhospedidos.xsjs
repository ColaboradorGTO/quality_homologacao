var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idTamPed = $.request.parameters.get("idTamPed");
    var descTamPed = $.request.parameters.get("descTamPed");

    var query = ' SELECT ' + 
    '   tbcp.IDTAMANHO,' +
    '   tbcp.DSABREVIACAO,' +
    '   tbcp.DSTAMANHO,' +
    '   tbcp.STVESTUARIO,' +
    '   tbcp.STCALCADO,' +
    '   tbcp.STDIVERSOS,' +
    '   tbcp.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".TAMANHO tbcp' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbcp.STATIVO=\'True\'';
    
    if ( byId ) {
        query = query + ' And  tbcp.IDTAMANHO = \'' + byId + '\' ';
    }

    if ( idTamPed ) {
        query = query + ' And  tbcp.IDTAMANHO = \'' + idTamPed + '\' ';
    }

    if ( descTamPed ) {
        query = query + ' And  (tbcp.DSTAMANHO LIKE \'%'+descTamPed+'%\' OR tbcp.DSTAMANHO LIKE \'%'+descTamPed+'%\' ) ';
    }

    query = query + ' ORDER BY TO_ALPHANUM(tbcp."DSABREVIACAO")';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."TAMANHO" SET ' + 
        ' "DSABREVIACAO" = ?, ' +
        ' "DSTAMANHO" = ?, ' +
        ' "STVESTUARIO" = ?, ' +
        ' "STCALCADO" = ?, ' +
        ' "STDIVERSOS" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDTAMANHO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSABREVIACAO);
        pStmt.setString(2, registro.DSTAMANHO);
        pStmt.setString(3, registro.STVESTUARIO);
        pStmt.setString(4, registro.STCALCADO);
        pStmt.setString(5, registro.STDIVERSOS);
        pStmt.setString(6, registro.STATIVO);
        pStmt.setInt(7, registro.IDTAMANHO);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDTAMANHO")),0) + 1 FROM "VAR_DB_NAME"."TAMANHO" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."TAMANHO" ' +
		" ( " +
		' "IDTAMANHO", ' +
		' "DSABREVIACAO", ' +
        ' "DSTAMANHO", ' +
        ' "STVESTUARIO", ' +
        ' "STCALCADO", ' +
        ' "STDIVERSOS", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdTamPed = api.executeScalar(queryId,1);
	
		pStmt.setInt(1, parseInt(IdTamPed));
        pStmt.setString(2, registro.DSABREVIACAO);
        pStmt.setString(3, registro.DSTAMANHO);
        pStmt.setString(4, registro.STVESTUARIO);
        pStmt.setString(5, registro.STCALCADO);
        pStmt.setString(6, registro.STDIVERSOS);
        pStmt.setString(7, registro.STATIVO);
    	
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