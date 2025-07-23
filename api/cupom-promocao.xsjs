var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    var idVendaOrigem = $.request.parameters.get("idVendaOrigem");
    var idVendaDestino = $.request.parameters.get("idVendaDestino");
    var query = ' SELECT ' + 
    '   tbcp.IDCUPOMPROMOCAO,' +
	'   tbcp.IDPROMOCAO,' +
	'   tbcp.IDVENDAORIGEM,' +
	'   tbcp.IDVENDADESTINO,' +
	'   tbcp.PERCDESCONTO,' +
	'   tbcp.VRITEMDESCONTO,' +
	'   tbcp.VRDESCONTO,' +
	'   tbcp.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CUPOMPROMOCAO tbcp' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbcp.IDCUPOMPROMOCAO = \'' + byId + '\' ';
    }
    if (idVendaOrigem) {
		query = query + ' And  tbcp.IDVENDAORIGEM = \'' + idVendaOrigem + '\' ';
	}
	if (idVendaDestino) {
		query = query + ' And  tbcp.IDVENDADESTINO = \'' + idVendaDestino + '\' ';
	}
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CUPOMPROMOCAO" SET ' + 
        ' "IDVENDADESTINO" = ?, ' + 
    	' "VRITEMDESCONTO" = ?, ' + 
    	' "VRDESCONTO" = ?, ' + 
    	' "STATIVO" = ? ' + 
    	' WHERE "IDCUPOMPROMOCAO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.IDVENDADESTINO);
    	pStmt.setFloat(2, registro.VRITEMDESCONTO);
    	pStmt.setFloat(3, registro.VRDESCONTO);
        pStmt.setString(4, registro.STATIVO);
        pStmt.setInt(5, registro.IDCUPOMPROMOCAO);
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CUPOMPROMOCAO" ' +
		" ( " +
		' "IDCUPOMPROMOCAO", ' +
		' "IDPROMOCAO", ' + 
    	' "IDVENDAORIGEM", ' +
    	' "PERCDESCONTO", ' +
    	' "STATIVO" ' +
    	' ) ' +
		' VALUES("VAR_DB_NAME".SEQ_CUPOMPROMOCAO.NEXTVAL,?,?,?\'True\') ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDPROMOCAO);
    	pStmt.setString(2, registro.IDVENDAORIGEM);
    	pStmt.setFloat(2, registro.PERCDESCONTO);
    	
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