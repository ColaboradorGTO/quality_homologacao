var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var descFab = $.request.parameters.get("descFab");
    var idFab = $.request.parameters.get("idFab");
    
    var query = 'SELECT' +
    '   t2.IDFABRICANTEFORN, '+
    '   t3.IDFORNECEDOR, '+
    '   t1.IDFABRICANTE, ' +
	'   t1.DSFABRICANTE,' +
	'   t1.STATIVO,' +
	'   t3.NOFANTASIA AS NOFANTFORN,' +
	'   t3.NORAZAOSOCIAL AS NORAZAOFORN,' +
	'   t3.NUCNPJ AS NUCNPJFORN,' +
	'   t3.ECIDADE AS CIDADEFORN,' +
	'   t3.SGUF AS UFFORN,' +
	'   t3.NUTELEFONE1 AS FONEFORN' +
	' FROM "VAR_DB_NAME"."FABRICANTE" t1' +
    '   LEFT JOIN "VAR_DB_NAME"."VINCFABRICANTEFORN" t2 on t1.IDFABRICANTE = t2.IDFABRICANTE ' +
    '   LEFT JOIN "VAR_DB_NAME"."FORNECEDOR" t3 on t2.IDFORNECEDOR = t3.IDFORNECEDOR ' +
    ' WHERE 1=? ';

    if(idFab){
        query = query + ' And  t1.IDFABRICANTE IN ( ' + idFab + ')  ';
    }
    
    if ( byId ) {
        query = query + ' And  t1.IDFABRICANTE = \'' + byId + '\' ';
    }

    if ( descFab ) {
        query = query + ' And  (t1.DSFABRICANTE LIKE \'%'+descFab+'%\' OR t1.DSFABRICANTE LIKE \'%'+descFab+'%\' ) ';
    }
    

    query = query + ' ORDER BY t1."DSFABRICANTE"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VINCFABRICANTEFORN" SET ' + 
        ' "IDFABRICANTE" = ?, ' +
        ' "IDFORNECEDOR" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDFABRICANTEFORN" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDFABRICANTE);
        pStmt.setInt(2, registro.IDFORNECEDOR);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDFABRICANTEFORN);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDFABRICANTEFORN")),0) + 1 FROM "VAR_DB_NAME"."VINCFABRICANTEFORN" WHERE 1 = ? ';
    var query = 'INSERT INTO "VAR_DB_NAME"."VINCFABRICANTEFORN" ' +
		" ( " +
        ' "IDFABRICANTEFORN", ' +
        ' "IDFABRICANTE", ' +
        ' "IDFORNECEDOR", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
        var IDFABFORN = api.executeScalar(queryId,1);
        
        pStmt.setInt(1, parseInt(IDFABFORN));
        pStmt.setInt(2, registro.IDFABRICANTE);
        pStmt.setInt(3, registro.IDFORNECEDOR);
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