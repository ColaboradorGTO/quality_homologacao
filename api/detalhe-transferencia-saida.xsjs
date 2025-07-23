var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdts.IDDETALHETRANSFERENCIASAIDA,' +
    '   tbdts.IDRESUMOTRANSFERENCIASAIDA,' +
    '   tbdts.CPROD,' +
    '   tbdts.CEAN,' +
    '   tbdts.XPROD,' +
    '   tbdts.QCOM' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHETRANSFERENCIASAIDA tbdts' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdts.IDDETALHETRANSFERENCIASAIDA = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHETRANSFERENCIASAIDA" SET ' + 
        ' "IDRESUMOTRANSFERENCIASAIDA" = ?, ' +
        ' "CPROD" = ?, ' +
        ' "CEAN" = ?, ' +
        ' "XPROD" = ?, ' +
        ' "QCOM" = ? ' +
    	' WHERE "IDDETALHETRANSFERENCIASAIDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDRESUMOTRANSFERENCIASAIDA);
        pStmt.setString(2, registro.CPROD);
        pStmt.setString(3, registro.CEAN);
        pStmt.setString(4, registro.XPROD);
        pStmt.setString(5, registro.QCOM);
        pStmt.setInt(6, registro.IDDETALHETRANSFERENCIASAIDA);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHETRANSFERENCIASAIDA" ' +
		" ( " +
		' "IDDETALHETRANSFERENCIASAIDA", ' +
        ' "IDRESUMOTRANSFERENCIASAIDA", ' +
        ' "CPROD", ' +
        ' "CEAN", ' +
        ' "XPROD", ' +
        ' "QCOM" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_DETALHETRANSFERENCIASAIDA.NEXTVAL,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDRESUMOTRANSFERENCIASAIDA);
        pStmt.setString(2, registro.CPROD);
        pStmt.setString(3, registro.CEAN);
        pStmt.setString(4, registro.XPROD);
        pStmt.setString(5, registro.QCOM);
    	
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