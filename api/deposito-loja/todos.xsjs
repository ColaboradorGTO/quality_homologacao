var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdl.IDDEPOSITOLOJA,' +
    '   tbdl.DTDEPOSITO,' +
    '   tbdl.DTMOVIMENTOCAIXA,' +
    '   tbdl.IDEMPRESA,' +
    '   tbdl.IDUSR,' +
    '   tbdl.IDCONTABANCO,' +
    '   tbdl.VRDEPOSITO,' +
    '   tbdl.DSHISTORIO,' +
    '   tbdl.NUDOCDEPOSITO,' +
    '   tbdl.DSPATHDOCDEPOSITO,' +
    '   tbdl.STATIVO,' +
    '   tbdl.STCANCELADO,' +
    '   tbdl.IDUSRCACELAMENTO,' +
    '   tbdl.DSMOTIVOCANCELAMENTO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DEPOSITOLOJA tbdl' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdl.IDDEPOSITOLOJA = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DEPOSITOLOJA" SET ' + 
        ' "DTDEPOSITO" = ?, ' +
        ' "DTMOVIMENTOCAIXA" = ?, ' +
        ' "IDEMPRESA" = ?, ' +
        ' "IDUSR" = ?, ' +
        ' "IDCONTABANCO" = ?, ' +
        ' "VRDEPOSITO" = ?, ' +
        ' "DSHISTORIO" = ?, ' +
        ' "NUDOCDEPOSITO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "STCANCELADO" = ? ' +
    	' WHERE "IDDEPOSITOLOJA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setDate(1, registro.DTDEPOSITO);
        pStmt.setDate(2, registro.DTMOVIMENTOCAIXA);
        pStmt.setInt(3, registro.IDEMPRESA);
        pStmt.setInt(4, registro.IDUSR);
        pStmt.setInt(5, registro.IDCONTABANCO);
        pStmt.setFloat(6, registro.VRDEPOSITO);
        pStmt.setString(7, registro.DSHISTORIO);
        pStmt.setString(8, registro.NUDOCDEPOSITO);
        pStmt.setString(9, registro.STATIVO);
        pStmt.setString(10, registro.STCANCELADO);
        pStmt.setInt(11, registro.IDDEPOSITOLOJA);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DEPOSITOLOJA" ' +
		" ( " +
    		' "IDDEPOSITOLOJA", ' +
            ' "DTDEPOSITO", ' +
            ' "DTMOVIMENTOCAIXA", ' +
            ' "IDEMPRESA", ' +
            ' "IDUSR", ' +
            ' "IDCONTABANCO", ' +
            ' "VRDEPOSITO", ' +
            ' "DSHISTORIO", ' +
            ' "NUDOCDEPOSITO", ' +
            ' "DSPATHDOCDEPOSITO", ' +
            ' "STATIVO", ' +
            ' "STCANCELADO", ' +
            ' "IDUSRCACELAMENTO", ' +
            ' "DSMOTIVOCANCELAMENTO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_DEPOSITOLOJA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setDate(1, registro.DTDEPOSITO);
        pStmt.setDate(2, registro.DTMOVIMENTOCAIXA);
        pStmt.setInt(3, registro.IDEMPRESA);
        pStmt.setInt(4, registro.IDUSR);
        pStmt.setInt(5, registro.IDCONTABANCO);
        pStmt.setFloat(6, registro.VRDEPOSITO);
        pStmt.setString(7, registro.DSHISTORIO);
        pStmt.setString(8, registro.NUDOCDEPOSITO);
        pStmt.setString(9, registro.DSPATHDOCDEPOSITO);
        pStmt.setString(10, registro.STATIVO);
        pStmt.setString(11, registro.STCANCELADO);
        setIntOrNull(pStmt, 12, registro.IDUSRCACELAMENTO);
        pStmt.setString(13, registro.DSMOTIVOCANCELAMENTO);
    	
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