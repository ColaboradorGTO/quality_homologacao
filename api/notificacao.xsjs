var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbn.IDNOTIFICACAO,' +
    '   tbn.IDLOJA,' +
    '   tbn.DSNOTIFICACAO,' +
    '   tbn.DTNOTIFICACAO,' +
    '   tbn.STLIDA,' +
    '   tbn.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".NOTIFICACAO tbn' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbn.IDNOTIFICACAO = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."NOTIFICACAO" SET ' + 
        ' "IDLOJA" = ?, ' + 
        ' "DSNOTIFICACAO" = ?, ' + 
        ' "DTNOTIFICACAO" = ?, ' + 
        ' "STLIDA" = ?, ' + 
        ' "STATIVO" = ? ' + 
    	' WHERE "IDNOTIFICACAO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDLOJA);  
        pStmt.setString(2, registro.DSNOTIFICACAO);  
        pStmt.setDate(3, registro.DTNOTIFICACAO);  
        pStmt.setString(4, registro.STLIDA);  
        pStmt.setString(5, registro.STATIVO); 
    	pStmt.setInt(6, registro.IDNOTIFICACAO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."NOTIFICACAO" ' +
		" ( " +
		' "IDNOTIFICACAO", ' + 
        ' "IDLOJA", ' + 
        ' "DSNOTIFICACAO", ' + 
        ' "DTNOTIFICACAO", ' + 
        ' "STLIDA", ' + 
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_NOTIFICACAO.NEXTVAL,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDLOJA);  
        pStmt.setString(2, registro.DSNOTIFICACAO);  
        pStmt.setDate(3, registro.DTNOTIFICACAO);  
        pStmt.setString(4, registro.STLIDA);  
        pStmt.setString(5, registro.STATIVO); 
    	
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