var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbcn.IDCONTROLENFCE,' +
    '   tbcn.IDCONTROLELOCAL,' +
    '   tbcn.DTENVIO,' +
    '   tbcn.IDEMPRESA,' +
    '   tbcn.IDCAIXA,' +
    '   tbcn.NOARQUIVOXML,' +
    '   tbcn.TXT_XML,' +
    '   tbcn.TXT_JSON,' +
    '   tbcn.ST_TRANSMITIDO_SAP,' +
    '   tbcn.ST_MIGRADO,' +
    '   tbcn.ST_CANCELADO,' +
    '   tbcn.NUNFCE,' +
    '   tbcn.NUSERIE,' +
    '   tbcn.IDRESUMOVENDAWEB' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CONTROLENFCE tbcn' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbcn.IDCONTROLENFCE = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CONTROLENFCE" SET ' + 
        ' "IDCONTROLELOCAL" = ?, ' + 
        ' "DTENVIO" = ?, ' + 
        ' "IDEMPRESA" = ?, ' + 
        ' "IDCAIXA" = ?, ' + 
        ' "NOARQUIVOXML" = ?, ' + 
        ' "TXT_XML" = ?, ' + 
        ' "TXT_JSON" = ?, ' + 
        ' "ST_TRANSMITIDO_SAP" = ?, ' + 
        ' "ST_MIGRADO" = ?, ' + 
        ' "ST_CANCELADO" = ?, ' + 
        ' "NUNFCE" = ?, ' + 
        ' "NUSERIE" = ?, ' + 
        ' "IDRESUMOVENDAWEB" = ? ' +
    	' WHERE "IDCONTROLENFCE" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDCONTROLELOCAL);
        pStmt.setDate(2, registro.DTENVIO);
        pStmt.setInt(3, registro.IDEMPRESA);
        pStmt.setInt(4, registro.IDCAIXA);
        pStmt.setString(5, registro.NOARQUIVOXML);
        pStmt.setString(6, registro.TXT_XML);
        pStmt.setString(7, registro.TXT_JSON);
        pStmt.setString(8, registro.ST_TRANSMITIDO_SAP);
        pStmt.setString(9, registro.ST_MIGRADO);
        pStmt.setString(10, registro.ST_CANCELADO);
        pStmt.setInt(11, registro.NUNFCE);
        pStmt.setInt(12, registro.NUSERIE);
        pStmt.setInt(13, registro.IDRESUMOVENDAWEB);
        pStmt.setInt(14, registro.IDCONTROLENFCE);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CONTROLENFCE" ' +
		" ( " +
		' "IDCONTROLENFCE", ' +
        ' "IDCONTROLELOCAL", ' +
        ' "DTENVIO", ' +
        ' "IDEMPRESA", ' +
        ' "IDCAIXA", ' +
        ' "NOARQUIVOXML", ' +
        ' "TXT_XML", ' +
        ' "TXT_JSON", ' +
        ' "ST_TRANSMITIDO_SAP", ' +
        ' "ST_MIGRADO", ' +
        ' "ST_CANCELADO", ' +
        ' "NUNFCE", ' +
        ' "NUSERIE", ' +
        ' "IDRESUMOVENDAWEB ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_CONTROLENFCE.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDCONTROLELOCAL);
        pStmt.setDate(2, registro.DTENVIO);
        pStmt.setInt(3, registro.IDEMPRESA);
        pStmt.setInt(4, registro.IDCAIXA);
        pStmt.setString(5, registro.NOARQUIVOXML);
        pStmt.setString(6, registro.TXT_XML);
        pStmt.setString(7, registro.TXT_JSON);
        pStmt.setString(8, registro.ST_TRANSMITIDO_SAP);
        pStmt.setString(9, registro.ST_MIGRADO);
        pStmt.setString(10, registro.ST_CANCELADO);
        pStmt.setInt(11, registro.NUNFCE);
        pStmt.setInt(12, registro.NUSERIE);
        pStmt.setInt(13, registro.IDRESUMOVENDAWEB);
    	
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