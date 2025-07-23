var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query =
        'SELECT ' +
        '   tbaut.ID, ' +
        '   tbp.IDPERFIL, ' +
        '   tbp.DSPERFIL, ' +
        '   tbmod.IDMODULO, ' +
        '   tbmod.DSMODULO, ' +
        '   tbmn.IDMENU, ' +
        '   tbmn.DSMENU, ' +
        '   tbaut.STEDITAR, ' +
        '   tbaut.STVISUALIZAR, ' +
        '   tbaut.STINCLUIR ' +
        'FROM ' +
        '   "VAR_DB_NAME".PAGINASMODULO tbaut ' +
        '   INNER JOIN "VAR_DB_NAME".MODULO tbmod ON tbmod.IDMODULO = tbaut.IDMODULO ' +
        '   INNER JOIN "VAR_DB_NAME".PERFIL tbp ON tbp.IDPERFIL = tbaut.IDPERFIL ' +
        '   INNER JOIN "VAR_DB_NAME".MENU tbmn ON tbmn.IDMENU = tbaut.IDMENU ' +
        'WHERE ' +
        '   1 = ?';
    
    if (byId) {
        query = query + ' AND tbaut.ID = \'' + byId + '\'';
    }
    
    var request = {
        page: $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."PAGINASMODULO" SET ' + 
        ' "DSPERFIL" = ? ' +
    	' WHERE "IDPERFIL" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSPERFIL);
    	pStmt.setInt(2, registro.IDPERFIL);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."PERFIL" ' +
		" ( " +
		' "IDPERFIL", ' +
        ' "DSPERFIL" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_BANCO.NEXTVAL,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.DSPERFIL);
    	
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
        //Handle your PUT calls here
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