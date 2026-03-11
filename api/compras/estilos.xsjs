var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idEstilo = $.request.parameters.get("idEstilo");
    var descEstilo = $.request.parameters.get("descEstilo");
    var idGrupoEstilo = $.request.parameters.get("idGrupoEstilo");
    
    var query = ' SELECT ' + 
    '   A.IDESTILO ID_ESTILOS, ' + 
    '   A.DSESTILO DS_ESTILOS, ' + 
    '   A.STATIVO, ' + 
    '   B.IDVINCESTILOSESTRUTURA, ' + 
    '   B.IDGRUPOESTRUTURA ID_GRUPOESTILOS, ' + 
    '   C.DSGRUPOESTRUTURA DS_GRUPOESTILOS, ' + 
    '   C.CODGRUPOESTRUTURA COD_GRUPOESTILOS ' + 
    '   FROM "VAR_DB_NAME".ESTILOS A ' + 
    '   INNER JOIN "VAR_DB_NAME".VINCESTILOSGRUPOESTRUTURA B on A.IDESTILO = B.IDESTILO' +
    '   INNER JOIN "VAR_DB_NAME".GRUPOESTRUTURA C on B.IDGRUPOESTRUTURA = C.IDGRUPOESTRUTURA' +
    ' WHERE ' +
        '	1 = ?';
    
    if(idEstilo){
        query = query + ' And  A.IDESTILO IN ( ' + idEstilo + ')  ';
    }
    
        if ( byId ) {
        query = query + ' And  A.IDESTILO = \'' + byId + '\' ';
    }

    if ( idGrupoEstilo ) {
        query = query + ' And  B.IDGRUPOESTRUTURA = \'' + idGrupoEstilo + '\' ';
    }

    if ( descEstilo ) {
        query = query + ' And  (A.DSESTILO LIKE \'%'+descEstilo+'%\' ) ';
    }
    

    query = query + ' ORDER BY B."IDGRUPOESTRUTURA",  A."DSESTILO"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."ESTILOS" SET ' + 
        ' "DSESTILO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDESTILO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        //////////ATUALIZA VINCULO ESTILO GRUPO//////////////////////
         var queryAtualizaVincEstilo = 'UPDATE "VAR_DB_NAME"."VINCESTILOSGRUPOESTRUTURA" SET ' +  
            ' "IDGRUPOESTRUTURA" =  ? ' +
    		' WHERE "IDVINCESTILOSESTRUTURA" =  ? ';
            
        var pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaVincEstilo));
    	
    	pStmt2.setInt(1, registro.IDGRUPOESTRUTURA);
    	pStmt2.setInt(2, registro.IDVINCESTILOSESTRUTURA);
        pStmt2.execute();
        pStmt2.close();
                
        pStmt.setString(1, registro.DSESTILO);
        pStmt.setString(2, registro.STATIVO);
        pStmt.setInt(3, registro.IDESTILO);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDESTILO")),0) + 1 FROM "VAR_DB_NAME"."ESTILOS" WHERE 1 = ? ';
    var queryIdVinc = 'SELECT IFNULL(MAX(TO_INT("IDVINCESTILOSESTRUTURA")),0) + 1 FROM "VAR_DB_NAME"."VINCESTILOSGRUPOESTRUTURA" WHERE 1 = ? ';

    var query = 'INSERT INTO "VAR_DB_NAME"."ESTILOS" ' +
		" ( " +
		' "IDESTILO", ' +
		' "DSESTILO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query)); 
	var bodyJson = JSON.parse($.request.body.asString());
    
	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdEstilo = api.executeScalar(queryId,1);
		var IdVincEstilo = api.executeScalar(queryIdVinc,1);

         var queryIncluirVinc = 'INSERT INTO "VAR_DB_NAME"."VINCESTILOSGRUPOESTRUTURA" ' +
		" ( " +
		' "IDVINCESTILOSESTRUTURA", ' +
		' "IDESTILO", ' +
        ' "IDGRUPOESTRUTURA", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
            
        var pStmt2 = conn.prepareStatement(api.replaceDbName(queryIncluirVinc));
    	
    	pStmt2.setInt(1, parseInt(IdVincEstilo));
        pStmt2.setInt(2, parseInt(IdEstilo));
        pStmt2.setInt(3, registro.IDGRUPOESTRUTURA);
        pStmt2.setString(4, registro.STATIVO);
        pStmt2.execute();
        pStmt2.close();
	
		pStmt.setInt(1, parseInt(IdEstilo));
        pStmt.setString(2, registro.DSESTILO); 
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