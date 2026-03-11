var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idCor = $.request.parameters.get("idCor");
    var descCor = $.request.parameters.get("descCor");
    var idGrupoCor = $.request.parameters.get("idGrupoCor");
    
    var query = ' SELECT ' + 
    '   A.IDCOR ID_COR, ' + 
    '   A.IDGRUPOCOR ID_GRUPOCOR, ' + 
    '   A.DSCOR DS_COR, ' + 
    '   A.STATIVO, ' + 
    '   B.DSGRUPOCOR DS_GRUPOCOR ' + 
    '   FROM "VAR_DB_NAME".COR A ' + 
    '   INNER JOIN "VAR_DB_NAME".GRUPOCOR B on A.IDGRUPOCOR = B.IDGRUPOCOR' +
    ' WHERE ' +
        '	1 = ?';
    
    if(idGrupoCor){
        query = query + ' And  A.IDGRUPOCOR IN ( ' + idGrupoCor + ')  ';
    }
    
        if ( byId ) {
        query = query + ' And  A.IDCOR = \'' + byId + '\' ';
    }

    if ( idCor ) {
        query = query + ' And  A.IDCOR = \'' + idCor + '\' ';
    }

    if ( descCor ) {
        query = query + ' And  (A.DSCOR LIKE \'%'+descCor+'%\' OR A.DSCOR LIKE \'%'+descCor+'%\' ) ';
    }
    

    query = query + ' ORDER BY A."IDGRUPOCOR",  A."DSCOR"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."COR" SET ' + 
        ' "IDGRUPOCOR" = ?, ' +
        ' "DSCOR" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDCOR" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDGRUPOCOR);
        pStmt.setString(2, registro.DSCOR);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDCOR);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDCOR")),0) + 1 FROM "VAR_DB_NAME"."COR" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."COR" ' +
		" ( " +
		' "IDCOR", ' +
		' "IDGRUPOCOR", ' +
        ' "DSCOR", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    
	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdCor = api.executeScalar(queryId,1);

	    pStmt.setInt(1, parseInt(IdCor));
        pStmt.setInt(2, registro.IDGRUPOCOR);
        pStmt.setString(3, registro.DSCOR);
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