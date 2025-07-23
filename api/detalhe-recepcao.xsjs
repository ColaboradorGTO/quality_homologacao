var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdr.IDDETALHERECEPCAO,' +
    '   tbdr.IDRESUMORECEPCAO,' +
    '   tbdr.IDDETALHETRANSFERENCIASAIDA,' +
    '   tbdr.CPROD,' +
    '   tbdr.CEAN,' +
    '   tbdr.XPROD,' +
    '   tbdr.QTD_ENVIADA,' +
    '   tbdr.QTD_RECEPCIONADA,' +
    '   tbdr.QTD_SOBRA,' +
    '   tbdr.QTD_FALTA,' +
    '   tbdr.IDUSR_CONFERENCIA' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHERECEPCAO tbdr' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdr.IDDETALHERECEPCAO = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHERECEPCAO" SET ' + 
        ' "IDDETALHERECEPCAO" = ?, ' + 
        ' "IDRESUMORECEPCAO" = ?, ' + 
        ' "IDDETALHETRANSFERENCIASAIDA" = ?, ' + 
        ' "CPROD" = ?, ' + 
        ' "CEAN" = ?, ' + 
        ' "XPROD" = ?, ' + 
        ' "QTD_ENVIADA" = ?, ' + 
        ' "QTD_RECEPCIONADA" = ?, ' + 
        ' "QTD_SOBRA" = ?, ' + 
        ' "QTD_FALTA" = ?, ' + 
        ' "IDUSR_CONFERENCIA" = ? ' + 
    	' WHERE "IDDETALHERECEPCAO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDRESUMORECEPCAO);
        pStmt.setInt(2, registro.IDDETALHETRANSFERENCIASAIDA);
        pStmt.setString(3, registro.CPROD);
        pStmt.setString(4, registro.CEAN);
        pStmt.setString(5, registro.XPROD);
        pStmt.setFloat(6, registro.QTD_ENVIADA);
        pStmt.setFloat(7, registro.QTD_RECEPCIONADA);
        pStmt.setFloat(8, registro.QTD_SOBRA);
        pStmt.setFloat(9, registro.QTD_FALTA);
        pStmt.setInt(10, registro.IDUSR_CONFERENCIA);
    	pStmt.setInt(11, registro.IDDETALHERECEPCAO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHERECEPCAO" ' +
		" ( " +
		' "IDDETALHERECEPCAO", ' +
        ' "IDRESUMORECEPCAO", ' +
        ' "IDDETALHETRANSFERENCIASAIDA", ' +
        ' "CPROD", ' +
        ' "CEAN", ' +
        ' "XPROD", ' +
        ' "QTD_ENVIADA", ' +
        ' "QTD_RECEPCIONADA", ' +
        ' "QTD_SOBRA", ' +
        ' "QTD_FALTA", ' +
        ' "IDUSR_CONFERENCIA" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_DETALHERECEPCAO.NEXTVAL,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDRESUMORECEPCAO);
        pStmt.setInt(2, registro.IDDETALHETRANSFERENCIASAIDA);
        pStmt.setString(3, registro.CPROD);
        pStmt.setString(4, registro.CEAN);
        pStmt.setString(5, registro.XPROD);
        pStmt.setFloat(6, registro.QTD_ENVIADA);
        pStmt.setFloat(7, registro.QTD_RECEPCIONADA);
        pStmt.setFloat(8, registro.QTD_SOBRA);
        pStmt.setFloat(9, registro.QTD_FALTA);
        pStmt.setInt(10, registro.IDUSR_CONFERENCIA);
    	
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