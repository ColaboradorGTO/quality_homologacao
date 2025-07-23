var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idLocalExp = $.request.parameters.get("idLocalExp");
    var descLocalExp = $.request.parameters.get("descLocalExp");
    
    var query = ' SELECT ' + 
    '   A.IDLOCALEXPOSICAO, ' + 
    '   A.DSLOCALEXPOSICAO, ' +
    '   A.STATIVO ' +
    '   FROM "VAR_DB_NAME".LOCALEXPOSICAO A ' + 
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  A.IDLOCALEXPOSICAO = \'' + byId + '\' ';
    }

    if ( idLocalExp ) {
        query = query + ' And  A.IDLOCALEXPOSICAO = \'' + idLocalExp + '\' ';
    }

    if ( descLocalExp ) {
        query = query + ' And  (A.DSLOCALEXPOSICAO LIKE \'%'+descLocalExp+'%\' OR A.DSLOCALEXPOSICAO LIKE \'%'+descLocalExp+'%\' ) ';
    }
    

    query = query + ' ORDER BY A."DSLOCALEXPOSICAO"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."LOCALEXPOSICAO" SET ' + 
        ' "DSLOCALEXPOSICAO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDLOCALEXPOSICAO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSLOCALEXPOSICAO);
        pStmt.setString(2, registro.STATIVO);
        pStmt.setInt(3, registro.IDLOCALEXPOSICAO);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDLOCALEXPOSICAO")),0) + 1 FROM "VAR_DB_NAME"."LOCALEXPOSICAO" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."LOCALEXPOSICAO" ' +
		" ( " +
        ' "IDLOCALEXPOSICAO", ' +
        ' "DSLOCALEXPOSICAO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdLocalExp = api.executeScalar(queryId,1);

		pStmt.setInt(1, parseInt(IdLocalExp));
        pStmt.setString(2, registro.DSLOCALEXPOSICAO);
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