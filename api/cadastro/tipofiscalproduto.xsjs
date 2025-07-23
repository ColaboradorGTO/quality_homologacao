var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idTipoFiscalProd = $.request.parameters.get("idTipoFiscalProd");
    var descTipoFiscalProd = $.request.parameters.get("descTipoFiscalProd");

    var query = ' SELECT ' + 
    '   tbtfp.IDTIPOFISCALPRODUTO,' +
    '   tbtfp.CODTIPOFISCALPRODUTO,' +
    '   tbtfp.DSTIPOFISCALPRODUTO,' +
    '   tbtfp.STATIVO,' +
    '   tbtfp.IDSAP' +
    ' FROM ' + 
    '   "VAR_DB_NAME".TIPOFISCALPRODUTO tbtfp' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbtfp.STATIVO=\'True\'';
    
    if ( byId ) {
        query = query + ' And  tbtfp.IDTIPOFISCALPRODUTO = \'' + byId + '\' ';
    }

    if ( idTipoFiscalProd ) {
        query = query + ' And  tbtfp.IDTIPOFISCALPRODUTO = \'' + idTipoFiscalProd + '\' ';
    }

    if ( descTipoFiscalProd ) {
        query = query + ' And  (tbtfp.DSTIPOFISCALPRODUTO LIKE \'%'+descTipoFiscalProd+'%\' OR tbtfp.DSTIPOFISCALPRODUTO LIKE \'%'+descTipoFiscalProd+'%\' ) ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."TIPOFISCALPRODUTO" SET ' + 
        ' "CODTIPOFISCALPRODUTO" = ?, ' +
        ' "DSTIPOFISCALPRODUTO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDTIPOFISCALPRODUTO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.CODTIPOFISCALPRODUTO);
        pStmt.setString(2, registro.DSTIPOFISCALPRODUTO);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDTIPOFISCALPRODUTO);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDTIPOFISCALPRODUTO")),0) + 1 FROM "VAR_DB_NAME"."TIPOFISCALPRODUTO" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."TIPOFISCALPRODUTO" ' +
		" ( " +
		' "IDTIPOFISCALPRODUTO", ' +
		' "CODTIPOFISCALPRODUTO", ' +
        ' "DSTIPOFISCALPRODUTO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdTPFiscal = api.executeScalar(queryId,1);

	    pStmt.setInt(1, parseInt(IdTPFiscal));
        pStmt.setString(2, registro.CODTIPOFISCALPRODUTO);
        pStmt.setString(3, registro.DSTIPOFISCALPRODUTO);
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