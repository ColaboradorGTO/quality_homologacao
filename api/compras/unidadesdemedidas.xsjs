var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idUnidMed = $.request.parameters.get("idUnidMed");
    var descUnidMed = $.request.parameters.get("descUnidMed");

    var query = ' SELECT ' + 
    '   tbcp.IDUNIDADEMEDIDA,' +
    '   tbcp.DSUNIDADE,' +
    '   tbcp.DSSIGLA,' +
    '   tbcp.DTCADASTRO,' +
    '   tbcp.DTULTATUALIZACAO,' +
    '   tbcp.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".UNIDADEMEDIDA tbcp' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbcp.STATIVO=\'True\'';
    
    if ( byId ) {
        query = query + ' And  tbcp.IDUNIDADEMEDIDA = \'' + byId + '\' ';
    }

    if ( idUnidMed ) {
        query = query + ' And  tbcp.IDUNIDADEMEDIDA = \'' + idUnidMed + '\' ';
    }

    if ( descUnidMed ) {
        query = query + ' And  (tbf.DSUNIDADE LIKE \'%'+descUnidMed+'%\' OR tbf.DSSIGLA LIKE \'%'+descUnidMed+'%\' ) ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."UNIDADEMEDIDA" SET ' + 
        ' "DSUNIDADE" = ?, ' +
        ' "DSSIGLA" = ?, ' +
        ' "DTULTATUALIZACAO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDUNIDADEMEDIDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSUNIDADE);
        pStmt.setString(2, registro.DSSIGLA);
        pStmt.setDate(3, registro.DTULTATUALIZACAO);
        pStmt.setString(4, registro.STATIVO);
        pStmt.setInt(5, registro.IDUNIDADEMEDIDA);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDUNIDADEMEDIDA")),0) + 1 FROM "VAR_DB_NAME"."UNIDADEMEDIDA" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."UNIDADEMEDIDA" ' +
		" ( " +
		' "IDUNIDADEMEDIDA", ' +
		' "DSUNIDADE", ' +
        ' "DSSIGLA", ' +
        ' "DTCADASTRO", ' +
        ' "DTULTATUALIZACAO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdUnid = api.executeScalar(queryId,1);

		pStmt.setInt(1, parseInt(IdUnid));
        pStmt.setString(2, registro.DSUNIDADE);
        pStmt.setString(3, registro.DSSIGLA);
        pStmt.setDate(4, registro.DTCADASTRO);
        pStmt.setDate(5, registro.DTULTATUALIZACAO);
        pStmt.setString(6, registro.STATIVO);
    	
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