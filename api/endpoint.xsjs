var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbe.ID,' +
    '   tbe.NOENDPOINT,' +
    '   tbe.PATH_ENDPOINT,' +
    '   tbe.DTCRIACAO,' +
    '   tbe.DTULTATUALIZACAO,' +
    '   tbe.DSLOGIN,' +
    '   tbe.PWSENHA,' +
    '   tbe.STPRODUCAO,' +
    '   tbe.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".ENDPOINT tbe' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbe.ID = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."ENDPOINT" SET ' + 
        ' "NOENDPOINT" = ?, ' +
        ' "PATH_ENDPOINT" = ?, ' +
        ' "DTCRIACAO" = ?, ' +
        ' "DTULTATUALIZACAO" = ?, ' +
        ' "DSLOGIN" = ?, ' +
        ' "PWSENHA" = ?, ' +
        ' "STPRODUCAO" = ?, ' +
        ' "STATIVO" = ? ' + 
    	' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.NOENDPOINT);
        pStmt.setString(2, registro.PATH_ENDPOINT);
        pStmt.setDate(3, registro.DTCRIACAO);
        pStmt.setDate(4, registro.DTULTATUALIZACAO);
        pStmt.setString(5, registro.DSLOGIN);
        pStmt.setString(6, registro.PWSENHA);
        pStmt.setString(7, registro.STPRODUCAO);
        pStmt.setString(8, registro.STATIVO);
    	pStmt.setInt(9, registro.ID);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."ENDPOINT" ' +
		" ( " +
		' "ID", ' +
        ' "NOENDPOINT", ' +
        ' "PATH_ENDPOINT", ' +
        ' "DTCRIACAO", ' +
        ' "DTULTATUALIZACAO", ' +
        ' "DSLOGIN", ' +
        ' "PWSENHA", ' +
        ' "STPRODUCAO", ' +
        ' "STATIVO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_ENDPOINT.NEXTVAL,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.NOENDPOINT);
        pStmt.setString(2, registro.PATH_ENDPOINT);
        pStmt.setDate(3, registro.DTCRIACAO);
        pStmt.setDate(4, registro.DTULTATUALIZACAO);
        pStmt.setString(5, registro.DSLOGIN);
        pStmt.setString(6, registro.PWSENHA);
        pStmt.setString(7, registro.STPRODUCAO);
        pStmt.setString(8, registro.STATIVO);
    	
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