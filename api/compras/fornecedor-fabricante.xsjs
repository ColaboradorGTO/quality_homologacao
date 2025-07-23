var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var descFornecedor = $.request.parameters.get("descFornecedor");
    var CNPJFornecedor = $.request.parameters.get("CNPJFornecedor");
    var idFor = $.request.parameters.get("idFor");
    
    var query = 'SELECT' +
    '   t2.IDFABRICANTEFORN, '+
    '   t1.IDFORNECEDOR, '+
    '   t1.IDFORNECEDORSAP, '+
    '   t1.STMIGRADOSAP, '+
    '   t3.IDFABRICANTE, ' +
	'   t3.DSFABRICANTE,' +
	'   t1.STATIVO,' +
	'   t1.NOFANTASIA AS NOFANTFORN,' +
	'   t1.NORAZAOSOCIAL AS NORAZAOFORN,' +
	'   t1.NUCNPJ AS NUCNPJFORN,' +
	'   t1.ECIDADE AS CIDADEFORN,' +
	'   t1.SGUF AS UFFORN,' +
	'   t1.NUTELEFONE1 AS FONEFORN' +
	' FROM "VAR_DB_NAME"."FORNECEDOR" t1' +
    '   LEFT JOIN "VAR_DB_NAME"."VINCFABRICANTEFORN" t2 on t1.IDFORNECEDOR = t2.IDFORNECEDOR ' +
    '   LEFT JOIN "VAR_DB_NAME"."FABRICANTE" t3 on t2.IDFABRICANTE = t3.IDFABRICANTE ' +
    ' WHERE 1=? ';

    if (idFor>0) {
		query = query + ' And t1.IDFORNECEDOR = \'' + idFor + '\' ';
    }
    
    if ( byId ) {
        query = query + ' And  t1.IDFORNECEDOR = \'' + byId + '\' ';
    }

    if ( descFornecedor ) {
        query = query + ' And  (t1.NORAZAOSOCIAL LIKE \'%'+descFornecedor+'%\' OR t1.NOFANTASIA LIKE \'%'+descFornecedor+'%\' ) ';
    }

    if ( CNPJFornecedor ) {
        query = query + ' And  t1.NUCNPJ = \'' + CNPJFornecedor + '\' ';
    }
    

    query = query + ' ORDER BY t1."NORAZAOSOCIAL"';

    
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