var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbmc.IDMOTIVOCANCELAMENTO,' +
    '   tbmc.DSMOTIVO,' +
    '   tbmc.STATIVO,' +
    '   TO_VARCHAR(tbmc.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO, ' +
    '   tbmc.STTRINTAMIN' +
    ' FROM ' + 
    '   "VAR_DB_NAME".MOTIVOCANCELAMENTO tbmc' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbmc.IDMOTIVOCANCELAMENTO = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."MOTIVOCANCELAMENTO" SET ' + 
        ' "DSMOTIVO" = ?, ' + 
        ' "STATIVO" = ?, ' + 
        ' "DTULTALTERACAO" = ? ' +  
    	' WHERE "IDMOTIVOCANCELAMENTO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSMOTIVO); 
        pStmt.setString(2, registro.STATIVO);
        pStmt.setDate(3, registro.DTULTALTERACAO);
    	pStmt.setInt(4, registro.IDMOTIVOCANCELAMENTO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."MOTIVOCANCELAMENTO" ' +
		" ( " +
		' "IDMOTIVOCANCELAMENTO", ' +
        ' "DSMOTIVO", ' + 
        ' "STATIVO", ' +
        ' "DTULTALTERACAO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_MOTIVOCANCELAMENTO.NEXTVAL,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.DSMOTIVO); 
        pStmt.setString(2, registro.STATIVO);
        pStmt.setDate(3, registro.DTULTALTERACAO);
    	
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