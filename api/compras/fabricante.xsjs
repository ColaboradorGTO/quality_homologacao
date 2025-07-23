var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var descFab = $.request.parameters.get("descFab");
    var idFab = $.request.parameters.get("idFab");
    
    var query = ' SELECT ' + 
    '   A.IDFABRICANTE, ' + 
    '   A.DSFABRICANTE, ' +  
    '   A.DTCADASTRO, ' + 
    '   A.DTULTATUALIZACAO, ' + 
    '   A.STATIVO ' + 
    '   FROM "VAR_DB_NAME".FABRICANTE A ' + 
    ' WHERE ' +
    '	1 = ?';
    
    if(idFab){
        query = query + ' And  A.IDFABRICANTE IN ( ' + idFab + ')  ';
    }
    
    if ( byId ) {
        query = query + ' And  A.IDFABRICANTE = \'' + byId + '\' ';
    }

    if ( descFab ) {
        query += ` And  CONTAINS((A.IDFABRICANTE, A.DSFABRICANTE), '%${descFab}%' ) `;
    }
    

    query = query + ' ORDER BY A."DSFABRICANTE"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."FABRICANTE" SET ' + 
        ' "DSFABRICANTE" = ?, ' +
        ' "DTCADASTRO" = ?, ' +
        ' "DTULTATUALIZACAO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDFABRICANTE" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSFABRICANTE);
        pStmt.setDate(2, registro.DTCADASTRO);
        pStmt.setDate(3, registro.DTULTATUALIZACAO);
        pStmt.setString(4, registro.STATIVO);
        pStmt.setInt(5, registro.IDFABRICANTE);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    
    var conn = $.db.getConnection();
    var queryId ='SELECT IFNULL(MAX(TO_INT("IDFABRICANTE")),0) + 1 FROM "VAR_DB_NAME"."FABRICANTE" WHERE 1 = ? ';
    var query = 'INSERT INTO "VAR_DB_NAME"."FABRICANTE" ' +
		" ( " +
        ' "IDFABRICANTE", ' +
        ' "DSFABRICANTE", ' +
        ' "DTCADASTRO", ' +
        ' "DTULTATUALIZACAO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		var idFabricante = api.executeScalar(queryId,1);

        pStmt.setInt(1, parseInt(idFabricante));
        pStmt.setString(2, registro.DSFABRICANTE);
        pStmt.setDate(3, registro.DTCADASTRO);
        pStmt.setDate(4, registro.DTULTATUALIZACAO);
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