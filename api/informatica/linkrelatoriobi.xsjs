var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idfilial = $.request.parameters.get("idfilial");

    var query = 'SELECT ' +
                    'lrbi.IDRELATORIOBI, lrbi.IDEMPRESA, lrbi.LINK, lrbi.STATIVO, ' +
                    'rbi.IDRELATORIOBI, rbi.DSRELATORIOBI, ' +
                    'e.NOFANTASIA ' +
                'FROM "VAR_DB_NAME".LINKRELATORIOBI lrbi ' +
                'JOIN "VAR_DB_NAME".RELATORIOBI rbi ON rbi.IDRELATORIOBI = lrbi.IDRELATORIOBI ' +
                'JOIN "VAR_DB_NAME".EMPRESA e ON e.IDEMPRESA = lrbi.IDEMPRESA ' +
                'WHERE 1 = ? ';
    if(byId){
        query = query + 'AND lrbi.IDRELATORIOBI = \'' + byId + '\' ';
    }
    if(idfilial){
        query = query + 'AND lrbi.IDEMPRESA = \'' + idfilial + '\' ';
    }

    var request = { 
            page:  $.request.parameters.get("page"),
            pageSize:  $.request.parameters.get("pageSize")
        };

    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {

    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."LINKRELATORIOBI" SET "IDRELATORIOBI" = ?, "IDEMPRESA" = ?, "LINK" = ?, "STATIVO" = ? ' + 
    	        'WHERE "IDRELATORIOBI" = ? AND "IDEMPRESA" = ? ';
    if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDRELATORIOBI);
		pStmt.setInt(2, registro.IDEMPRESA);
		pStmt.setString(3, registro.LINK);
		pStmt.setString(4, registro.STATIVO);
		pStmt.setInt(5, registro.IDRELATORIOBI);
		pStmt.setInt(6, registro.IDEMPRESA);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){

    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."LINKRELATORIOBI" ( "IDRELATORIOBI", "IDEMPRESA", "LINK", "STATIVO") ' +
	            'VALUES(?, ?, ?, ?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		if (api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".LINKRELATORIOBI WHERE IDRELATORIOBI = \'' + registro.IDRELATORIOBI + '\' AND IDEMPRESA = ?', registro.IDEMPRESA) > 0){
		    var conndel = $.db.getConnection();
            var querydel = 'DELETE FROM "VAR_DB_NAME".LINKRELATORIOBI WHERE IDRELATORIOBI = ? AND IDEMPRESA = ?';
        	var pStmtdel = conn.prepareStatement(api.replaceDbName(querydel));
        	pStmtdel.setInt(1, registro.IDRELATORIOBI);
        	pStmtdel.setInt(2, registro.IDEMPRESA);
        	pStmtdel.execute();
        	pStmtdel.close();
        	conndel.commit();
        }
		
		pStmt.setInt(1, registro.IDRELATORIOBI);
		pStmt.setInt(2, registro.IDEMPRESA);
		pStmt.setString(3, registro.LINK);
		pStmt.setString(4, registro.STATIVO);

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
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;

        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
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