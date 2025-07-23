var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idGrupoExt = $.request.parameters.get("idGrupoExt");
    var descGrupoExt = $.request.parameters.get("descGrupoExt");

    var query = ' SELECT ' + 
    '   tbcp.IDGRUPOESTRUTURA,' +
    '   tbcp.IDGRUPOEMPRESARIAL,' +
    '   tbcp.DSGRUPOESTRUTURA,' +
    '   tbcp.STATIVO,' +
    '   tbcp.CODGRUPOESTRUTURA,' +
    '   tbcp.NUCODIGO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".GRUPOESTRUTURA tbcp' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbcp.STATIVO=\'True\'';
    
    if ( byId ) {
        query = query + ' And  tbcp.IDGRUPOESTRUTURA = \'' + byId + '\' ';
    }

    if ( idGrupoExt ) {
        query = query + ' And  tbcp.IDGRUPOESTRUTURA = \'' + idGrupoExt + '\' ';
    }

    if ( descGrupoExt ) {
        query = query + ' And  (tbcp.DSGRUPOESTRUTURA LIKE \'%'+descGrupoExt+'%\' OR tbcp.DSGRUPOESTRUTURA LIKE \'%'+descGrupoExt+'%\' ) ';
    }
    
    query = query + ' ORDER BY tbcp.CODGRUPOESTRUTURA ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."GRUPOESTRUTURA" SET ' + 
        ' "DSGRUPOESTRUTURA" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDGRUPOESTRUTURA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSGRUPOESTRUTURA);
        pStmt.setString(2, registro.STATIVO);
        pStmt.setInt(3, registro.IDGRUPOESTRUTURA);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDGRUPOESTRUTURA")),0) + 1 FROM "VAR_DB_NAME"."GRUPOESTRUTURA" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."GRUPOESTRUTURA" ' +
		" ( " +
		' "IDGRUPOESTRUTURA", ' +
		' "IDGRUPOEMPRESARIAL", ' +
        ' "DSGRUPOESTRUTURA", ' +
        ' "STATIVO", ' +
        ' "CODGRUPOESTRUTURA", ' +
        ' "NUCODIGO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,0) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdEst = api.executeScalar(queryId,1);
		
		var queryCodGrupo = 'SELECT LTRIM(CODGRUPOESTRUTURA,0) AS COD '+
        ' FROM "VAR_DB_NAME"."GRUPOESTRUTURA" WHERE 1 = ?';
        queryCodGrupo = queryCodGrupo + ' ORDER BY IDGRUPOESTRUTURA DESC LIMIT 1 ';
        
	    var CodGrupo = api.sqlQuery(queryCodGrupo,1);
	    var CodNovo =  parseInt(CodGrupo[0].COD) + 1;
	    var CodNovo2 = ("000" + CodNovo).slice(-3);

		pStmt.setInt(1, parseInt(IdEst));
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setString(3, registro.DSGRUPOESTRUTURA);
        pStmt.setString(4, registro.STATIVO);
        pStmt.setString(5, CodNovo2);
    	
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