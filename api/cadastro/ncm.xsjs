var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idNCM = $.request.parameters.get("idNCM");
    var NumNCM = $.request.parameters.get("NumNCM");

    var query = ' SELECT DISTINCT ' + 
    '   n.NUNCM,' +
    '   n.IDNCM' +
    ' FROM ' + 
    '   "VAR_DB_NAME".NCMSAP n' +
    '   INNER JOIN "VAR_DB_NAME".PRODUTO p ON n.NUNCM = p.NUNCM'+
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  n.IDNCM = \'' + byId + '\' ';
    }

    if ( idNCM ) {
        query = query + ' And  n.IDNCM = \'' + idNCM + '\' '; 
    }

    if ( NumNCM ) {
        query += ` And  CONTAINS(n.NUNCM, '${NumNCM}%') `;
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."NCMSAP" SET ' + 
        ' "NumNCM" = ? ' +
    	' WHERE "IDNCM" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.NumNCM);
        pStmt.setInt(2, registro.IDNCM);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDNCM")),0) + 1 FROM "VAR_DB_NAME"."NCMSAP" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."NCMSAP" ' +
		" ( " +
		' "IDNCM" ' +
		' "NumNCM" ' +
    	' ) ' +
		' VALUES(?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var Idncm = api.executeScalar(queryId,1);

	    pStmt.setInt(1, parseInt(Idncm));
        pStmt.setString(2, registro.NumNCM);
    	
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