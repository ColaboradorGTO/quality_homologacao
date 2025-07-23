var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var menu = $.request.parameters.get("menu");
    
    var query = ' SELECT ' + 
    '   tbmn.IDMENU,' +
    '   tbmn.STATIVO,' +
    '   tbmod.IDMODULO,' +
    '   tbmn.DSMENU,' +
    '   tbmn.URL,' +
    '   tbp.IDPERFIL,' +
    '   tbmn.URL_DASHBOARD' +
    ' FROM ' + 
    '   "VAR_DB_NAME".MENU tbmn' +
    '   INNER JOIN "VAR_DB_NAME".MODULO tbmod ON tbmod.IDMODULO = tbmn.IDMODULO' +
    '   INNER JOIN "VAR_DB_NAME".PERFIL tbp ON tbp.IDPERFIL = tbmn.IDPERFIL' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbmmn.IDMENU = \'' + byId + '\' ';
    }

    if ( menu ) {
        query = query + ' And  tbmn.DSMENU = \'' + menu + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."MENU" SET ' + 
        ' "STATIVO," = ? ' +
        ' "DSMENU," = ? ' +
        ' "URL," = ? ' +
        ' "URL_DASHBOARD" = ? ' +
    	' WHERE "IDMMENU" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.STATIVO);
        pStmt.setString(2, registro.DSMENU);
        pStmt.setString(3, registro.URL);
        pStmt.setString(4, registro.URL_DASHBOARD);
    	pStmt.setInt(5, registro.IDMENU);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."MENU" ' +
		" ( " +
		' "IDMENU", ' +
		' "STATIVO", ' +
		' "IDMODULO", ' +
		' "DSMENU", ' +
		' "URL", ' +
		' "IDPERFIL", ' +
        ' "URL_DASHBOARD" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_BANCO.NEXTVAL,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDMENU);
    	pStmt.setString(2, registro.STATIVO);
    	pStmt.setInt(3, registro.IDMODULO);
    	pStmt.setString(4, registro.DSMENU);
    	pStmt.setString(5, registro.URL);
    	pStmt.setInt(6, registro.IDPERFIL);
    	pStmt.setString(7, registro.URL_DASHBOARD);
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