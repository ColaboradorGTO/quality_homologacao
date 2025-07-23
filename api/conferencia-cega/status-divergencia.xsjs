var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var query = ' SELECT ' +
        '   sd.IDSTATUSDIVERGENCIA ' +
        '   ,sd.DESCRICAODIVERGENCIA ' +
        '   ,IFNULL(TO_VARCHAR(sd.DATACRIACAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DATACRIACAO ' +
        '   ,IFNULL(TO_VARCHAR(sd.DATACRIACAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DATACRIACAOFORMATADA ' +
        '   ,sd.IDUSRCRIACAO ' +
        '   ,sd.STATIVO ' +
        ' FROM "VAR_DB_NAME".STATUSDIVERGENCIA sd ' +
        ' WHERE 1 = ? ';
    if(byId){
        query = query + 'AND rot.IDRESUMOOT = \'' + byId + '\' ';
    }

    /*$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(query));
	$.response.status = $.net.http.OK;
    return;*/

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };

    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {

    var conn = $.db.getConnection();

    var query = 'UPDATE "VAR_DB_NAME"."STATUSDIVERGENCIA" SET "DESCRICAODIVERGENCIA" = ?, "STATIVO" = ? ' + 
    	        'WHERE "IDSTATUSDIVERGENCIA" =  ? ';
    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DESCRICAODIVERGENCIA);
        pStmt.setString(2, registro.STATIVO);
        pStmt.setInt(3, registro.IDSTATUSDIVERGENCIA);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."STATUSDIVERGENCIA" ( "IDSTATUSDIVERGENCIA", "DESCRICAODIVERGENCIA", "DATACRIACAO", "IDUSRCRIACAO", "STATIVO") ' +
		        'VALUES(QUALITY_CONC_HML.SEQ_STATUSDIVERGENCIA.NEXTVAL, ?, NOW(), ?, ?) ';
    var pStmt = conn.prepareStatement(api.replaceDbName(query));

	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.DESCRICAODIVERGENCIA);
		pStmt.setInt(2, registro.IDUSRCRIACAO);
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
    switch ($.request.method) {
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
        
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
        break;
        
        default:
        break;
    }
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}