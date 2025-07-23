var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var stativo = $.request.parameters.get("stativo");

    var query = 'SELECT ' +
                    'IDRELATORIOBI, DSRELATORIOBI, STATIVO ' +
                'FROM "VAR_DB_NAME".RELATORIOBI ' +
                'WHERE 1 = ? ';
    if(byId){
        query = query + 'AND IDRELATORIOBI = \'' + byId + '\' ';
    }
    if(stativo){
        query = query + 'AND STATIVO = \'' + stativo + '\' ';
    }

    var request = { 
            page:  $.request.parameters.get("page"),
            pageSize:  $.request.parameters.get("pageSize")
        };

    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {

    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RELATORIOBI" SET "DSRELATORIOBI" = ?, "STATIVO" = ? ' + 
    	        'WHERE "IDRELATORIOBI" = ? ';

    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSRELATORIOBI);
        pStmt.setString(2, registro.STATIVO);
        pStmt.setInt(3, registro.IDRELATORIOBI);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."RELATORIOBI" ( "IDRELATORIOBI", "DSRELATORIOBI", "STATIVO") ' +
	            'VALUES(QUALITY_CONC_HML.SEQ_RELATORIOBI.NEXTVAL, ?, ?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.DSRELATORIOBI);
		pStmt.setString(2, registro.STATIVO);

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