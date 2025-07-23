var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idTipoProd = $.request.parameters.get("idTipoProd");
    var descTipoProd = $.request.parameters.get("descTipoProd");

    var query = ' SELECT ' + 
    '   tbtp.IDTIPOPRODUTO,' +
    '   tbtp.CODTIPOPRODUTO,' +
    '   tbtp.DSTIPOPRODUTO,' +
    '   tbtp.STATIVO,' +
    '   tbtp.IDSAP' +
    ' FROM ' + 
    '   "VAR_DB_NAME".TIPOPRODUTO tbtp' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbtp.STATIVO=\'True\'';
    
    if ( byId ) {
        query = query + ' And  tbtp.IDTIPOPRODUTO = \'' + byId + '\' ';
    }

    if ( idTipoProd ) {
        query = query + ' And  tbtp.IDTIPOPRODUTO = \'' + idTipoProd + '\' ';
    }

    if ( descTipoProd ) {
        query = query + ' And  (tbtp.DSTIPOPRODUTO LIKE \'%'+descTipoProd+'%\' OR tbtp.DSTIPOPRODUTO LIKE \'%'+descTipoProd+'%\' ) ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."TIPOPRODUTO" SET ' + 
        ' "CODTIPOPRODUTO" = ?, ' +
        ' "DSTIPOPRODUTO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDTIPOPRODUTO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.CODTIPOPRODUTO);
        pStmt.setString(2, registro.DSTIPOPRODUTO);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDTIPOPRODUTO);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDTIPOPRODUTO")),0) + 1 FROM "VAR_DB_NAME"."TIPOPRODUTO" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."TIPOPRODUTO" ' +
		" ( " +
		' "IDTIPOPRODUTO", ' +
		' "CODTIPOPRODUTO", ' +
        ' "DSTIPOPRODUTO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdTPProd = api.executeScalar(queryId,1);

	    pStmt.setInt(1, parseInt(IdTPProd));
        pStmt.setString(2, registro.CODTIPOPRODUTO);
        pStmt.setString(3, registro.DSTIPOPRODUTO);
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