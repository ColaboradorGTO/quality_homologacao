var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var descGrupoCor = $.request.parameters.get("descGrupoCor");
    var idGrupoCor = $.request.parameters.get("idGrupoCor");
    
    var query = ' SELECT ' + 
    '   A.IDGRUPOCOR, ' + 
    '   A.DSGRUPOCOR, ' +  
    '   A.STATIVO ' + 
    '   FROM "VAR_DB_NAME".GRUPOCOR A ' + 
    ' WHERE ' +
    '	1 = ?' +
    '   AND A.STATIVO = \'True\'';
    
    if(idGrupoCor){
        query = query + ' And  A.IDGRUPOCOR IN ( ' + idGrupoCor + ')  ';
    }
    
    if ( byId ) {
        query = query + ' And  A.IDGRUPOCOR = \'' + byId + '\' ';
    }

    if ( descGrupoCor ) {
        query = query + ' And  (A.DSGRUPOCOR LIKE \'%'+descGrupoCor+'%\' OR A.DSGRUPOCOR LIKE \'%'+descGrupoCor+'%\' ) ';
    }
    

    query = query + ' ORDER BY A."DSGRUPOCOR"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."GRUPOCOR" SET ' + 
        ' "DSGRUPOCOR" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDGRUPOCOR" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSGRUPOCOR);
        pStmt.setString(2, registro.STATIVO);
        pStmt.setInt(3, registro.IDGRUPOCOR);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDGRUPOCOR")),0) + 1 FROM "VAR_DB_NAME"."GRUPOCOR" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."GRUPOCOR" ' +
		" ( " +
        ' "IDGRUPOCOR", ' +
        ' "DSGRUPOCOR", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query)); 
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdGrupoC = api.executeScalar(queryId,1);

		pStmt.setInt(1, parseInt(IdGrupoC));
        pStmt.setString(2, registro.DSGRUPOCOR);
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