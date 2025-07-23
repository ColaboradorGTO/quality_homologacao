var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbac.IDAUDITORIACONVENIO,' +
    '   tbac.IDVENDA,' +
    '   tbac.IDOPERADOR,' +
    '   tbac.IDGERENTE,' +
    '   tbac.IDCONVENIADO,' +
    '   tbac.VRBRUTO,' +
    '   tbac.VRDESCONTO,' +
    '   tbac.VRLIQUIDO,' +
    '   TO_VARCHAR(tbac.DTLANCAMENTO,\'YYYY-MM-DD HH24:MI:SS\') AS DTLANCAMENTO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".AUDITORIACONVENIO tbac' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbac.IDAUDITORIACONVENIO = \'' + byId + '\' ';
    }
   
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."AUDITORIACONVENIO" SET ' + 
        ' "IDVENDA" = ?, ' +
        ' "IDOPERADOR" = ?, ' +
        ' "IDGERENTE" = ?, ' +
        ' "IDCONVENIADO" = ?, ' +
        ' "VRBRUTO" = ?, ' +
        ' "VRDESCONTO" = ?, ' +
        ' "VRLIQUIDO" = ?, ' +
        ' "DTLANCAMENTO" = now() ' +
        ' WHERE "IDAUDITORIACONVENIO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.IDVENDA);
        pStmt.setInt(2, registro.IDOPERADOR);
        pStmt.setInt(3, registro.IDGERENTE);
        pStmt.setInt(4, registro.IDCONVENIADO);
        pStmt.setFloat(5, registro.VRBRUTO);
        pStmt.setFloat(6, registro.VRDESCONTO);
        pStmt.setFloat(7, registro.VRLIQUIDO);
        pStmt.setInt(8, registro.IDAUDITORIACONVENIO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."AUDITORIACONVENIO" ' +
		" ( " +
    		' "IDAUDITORIACONVENIO", ' +
            ' "IDVENDA", ' +
            ' "IDOPERADOR", ' +
            ' "IDGERENTE", ' +
            ' "IDCONVENIADO", ' +
            ' "VRBRUTO", ' +
            ' "VRDESCONTO", ' +
            ' "VRLIQUIDO", ' +
            ' "DTLANCAMENTO" ' +
           
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_AUDITORIACONVENIO.NEXTVAL,?,?,?,?,?,?,?,now()) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.IDVENDA);
        pStmt.setInt(2, registro.IDOPERADOR);
        pStmt.setInt(3, registro.IDGERENTE);
        pStmt.setInt(4, registro.IDCONVENIADO);
        pStmt.setFloat(5, registro.VRBRUTO);
        pStmt.setFloat(6, registro.VRDESCONTO);
        pStmt.setFloat(7, registro.VRLIQUIDO);
       
        
    
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