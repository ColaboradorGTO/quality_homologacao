var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    
    var idResPromo = $.request.parameters.get("idResPromo");
    
    var query = ' SELECT ' + 
    '   tbt.IDDETALHEPROMOCAOMARKETINGORIGEM,' +
    '   tbt.IDRESUMOPROMOCAOMARKETING,' +
    '   tbt.IDGRUPOEMORIGEM,' +
    '   tbt.IDSUBGRUPOEMORIGEM,' +
    '   tbt.IDMARCAEMORIGEM,' +
    '   tbt.IDFORNECEDOREMORIGEM,' +
    '   tbt.IDPRODUTOORIGEM,' +
    '   tbp.NUCODBARRAS,' +
    '   tbp.DSNOME AS DSPRODUTO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEPROMOCAOMARKETINGORIGEM tbt' +
    '   INNER JOIN "VAR_DB_NAME"."PRODUTO" tbp on tbt.IDPRODUTOORIGEM = tbp.IDPRODUTO ' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbt.IDDETALHEPROMOCAOMARKETINGORIGEM = \'' + byId + '\' ';
    }

    if ( idResPromo ) {
        query = query + ' And  tbt.IDRESUMOPROMOCAOMARKETING = \'' + idResPromo + '\' ';
    }
    
    query = query + ' ORDER BY tbp.DSNOME';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOPROMOCAOMARKETING" SET ' + 
        ' "DSPROMOCAOMARKETING" = ?, ' + 
        ' "DTHORAINICIO" = ?, ' + 
        ' "DTHORAFIM" = ?, ' + 
        ' "TPAPLICADOA" = ?, ' + 
        ' "APARTIRDEQTD" = ?, ' + 
        ' "APARTIRDOVLR" = ?, ' + 
        ' "TPFATORPROMO" = ?, ' + 
        ' "FATORPROMOVLR" = ?, ' + 
        ' "FATORPROMOPERC" = ?, ' + 
        ' "TPAPARTIRDE" = ?, ' + 
        ' "VLPRECOPRODUTO" = ? ' + 
    	' WHERE "IDRESUMOPROMOCAOMARKETING" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setString(1, registro.DSPROMOCAOMARKETING);
        setTimestampOrNull(pStmt,2, registro.DTHORAINICIO);
        setTimestampOrNull(pStmt,3, registro.DTHORAFIM);
        pStmt.setInt(4, registro.TPAPLICADOA);
        pStmt.setInt(5, registro.APARTIRDEQTD);
        pStmt.setFloat(6, registro.APARTIRDOVLR);
        pStmt.setInt(7, registro.TPFATORPROMO);
        pStmt.setFloat(8, registro.FATORPROMOVLR);
        pStmt.setFloat(9, registro.FATORPROMOPERC);
        pStmt.setInt(10, registro.TPAPARTIRDE);
        pStmt.setFloat(11, registro.VLPRECOPRODUTO);
        pStmt.setInt(12, registro.IDRESUMOPROMOCAOMARKETING);
                    
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

    //var query = 'DELETE FROM "VAR_DB_NAME".DETALHEPROMOCAOMARKETINGORIGEM WHERE DETALHEPROMOCAOMARKETINGORIGEM.IDRESUMOPROMOCAOMARKETING = ? ';

    var bodyJson = JSON.parse($.request.body.asString());
    
	//var registro = bodyJson[0];
	//var pStmt = conn.prepareStatement(api.replaceDbName(query));
	//pStmt.setInt(1, registro.IDRESUMOPROMOCAOMARKETING);
	//pStmt.execute();
	//pStmt.close();
	//conn.commit();

    var query2 = 'INSERT INTO "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM" ' +
		" ( " +
            ' "IDDETALHEPROMOCAOMARKETINGORIGEM", ' +
            ' "IDRESUMOPROMOCAOMARKETING", ' +
            ' "IDPRODUTOORIGEM", ' +
            ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
		
    var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro2 = bodyJson[i];
		var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMOCAOMARKETINGORIGEM")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPROMOCAOMARKETINGORIGEM" WHERE 1 = ? ', 1);
		
	    for (var j = 0; j < registro2.PRODUTOS.length; j++) {
	        
	        var IdProdPromo = queryId;
    
            pStmt2.setInt(1, parseInt(IdProdPromo));
            pStmt2.setInt(2, registro2.IDRESUMOPROMOCAOMARKETING);
            pStmt2.setString(3, (registro2.PRODUTOS[j]));
            pStmt2.setString(4, registro2.STATIVO);
        	
            pStmt2.execute();
            
            queryId = queryId + 1;
	    }
	    
	    
	}
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