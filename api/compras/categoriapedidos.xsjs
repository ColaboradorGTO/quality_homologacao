var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idCatPed = $.request.parameters.get("idCatPed");
    var descCatPed = $.request.parameters.get("descCatPed");

    var query = ' SELECT ' + 
    '   tbcp.IDCATEGORIAPEDIDO,' +
    '   tbcp.DSCATEGORIAPEDIDO,' +
    '   tbcp.TIPOPEDIDO,' +
    '   tbcp.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CATEGORIAPEDIDO tbcp' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbcp.STATIVO=\'True\'';
    
    if ( byId ) {
        query = query + ' And  tbcp.IDCATEGORIAPEDIDO = \'' + byId + '\' ';
    }

    if ( idCatPed ) {
        query = query + ' And  tbcp.IDCATEGORIAPEDIDO = \'' + idCatPed + '\' ';
    }

    if ( descCatPed ) {
        query = query + ' And  (tbcp.DSCATEGORIAPEDIDO LIKE \'%'+descCatPed+'%\' OR tbcp.DSCATEGORIAPEDIDO LIKE \'%'+descCatPed+'%\' ) ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CATEGORIAPEDIDO" SET ' + 
        ' "DSCATEGORIAPEDIDO" = ?, ' +
        ' "TIPOPEDIDO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDCATEGORIAPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
   
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSCATEGORIAPEDIDO);
        pStmt.setString(2, registro.TIPOPEDIDO);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDCATEGORIAPEDIDO);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDCATEGORIAPEDIDO")),0) + 1 FROM "VAR_DB_NAME"."CATEGORIAPEDIDO" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CATEGORIAPEDIDO" ' +
		" ( " +
		' "IDCATEGORIAPEDIDO", ' +
		' "DSCATEGORIAPEDIDO", ' +
        ' "TIPOPEDIDO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
   
	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdCatPed = api.executeScalar(queryId,1);
	
		pStmt.setInt(1, parseInt(IdCatPed));
        pStmt.setString(2, registro.DSCATEGORIAPEDIDO);
        pStmt.setString(3, registro.TIPOPEDIDO);
        pStmt.setString(4, registro.STATIVO);
    	
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!",
	    "data": bodyJson
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