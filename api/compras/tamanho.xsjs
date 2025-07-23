var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idTam = $.request.parameters.get("idTam");
    var descTam = $.request.parameters.get("descTam");
    
    var query = ' SELECT ' + 
    '   A.IDTAMANHO, ' + 
    '   A.DSABREVIACAO, ' + 
    '   A.DSTAMANHO, ' + 
    '   A.STVESTUARIO, ' + 
    '   A.STCALCADO, ' + 
    '   A.STDIVERSOS, ' + 
    '   A.STATIVO ' + 
    '   FROM "VAR_DB_NAME".TAMANHO A ' + 
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  A.IDTAMANHO = \'' + byId + '\' ';
    }

    if ( idTam ) {
        query = query + ' And  A.IDTAMANHO = \'' + idTam + '\' ';
    }

    if ( descTam ) {
        query = query + ' And  (A.DSTAMANHO LIKE \'%'+descTam+'%\' OR A.DSABREVIACAO LIKE \'%'+descTam+'%\' ) ';
    }
    

    query = query + ' ORDER BY A."DSTAMANHO" DESC';

    
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
		' VALUES(QUALITY_CONC_HML.SEQ_COR.NEXTVAL,?,?,?,?,?,?) ';
		
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