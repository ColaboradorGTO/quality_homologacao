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
    var idVenda = $.request.parameters.get("idVenda");
    
    var query = ' SELECT '+
        '   IDVENDAPAGAMENTO, '+
        '	IDVENDA, '+
        '	NITEM, '+
        '	TPAG, '+
        '	DSTIPOPAGAMENTO, '+
        '	VALORRECEBIDO, '+
        '	VALORDEDUZIDO, '+
        '	VALORLIQUIDO, '+
        '	DTPROCESSAMENTO, '+
        '	DTVENCIMENTO, '+
        '	IFNULL(NPARCELAS, 0) AS NPARCELAS, '+
        '	NOTEF, '+
        '	NOAUTORIZADOR, '+
        '	NOCARTAO, '+
        '	NUOPERACAO, '+
        '	NSUTEF, '+
        '	NSUAUTORIZADORA, '+
        '	NUAUTORIZACAO, '+
        '	STCANCELADO, '+
        '	CPF, '+
        '	NOME '+
		' FROM  ' +
		'   "VAR_DB_NAME".VENDAPAGAMENTO  ' +
		'  WHERE  ' +
		'   1 = ?  ' ;
	
    
    if ( byId ) {
        query = query + ' And  IDVENDAPAGAMENTO = \'' + byId + '\' ';
    }
    
    if ( idVenda ) {
        query = query + ' And  IDVENDA = \'' + idVenda + '\' ';
    }
    
    query = query +	'  ORDER BY IDVENDAPAGAMENTO  ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDAPAGAMENTO" SET ' + 
        ' "IDVENDA" = ?, ' +
		' "NITEM" = ?, ' +
		' "TPAG" = ?, ' +
		' "DSTIPOPAGAMENTO" = ?, ' +
		' "VALORRECEBIDO" = ?, ' +
		' "VALORDEDUZIDO" = ?, ' +
		' "VALORLIQUIDO" = ?, ' +
		' "DTPROCESSAMENTO" = ?, ' +
		' "DTVENCIMENTO" = ?, ' +
		' "NPARCELAS" = ?, ' +
		' "NOTEF" = ?, ' +
		' "NOAUTORIZADOR" = ?, ' +
		' "NOCARTAO" = ?, ' +
		' "NUOPERACAO" = ?, ' +
		' "NSUTEF" = ?, ' +
		' "NSUAUTORIZADORA" = ?, ' +
		' "NUAUTORIZACAO" = ?, ' +
		' "STCANCELADO" = ?, ' +
		' "CPF" = ?, ' +
        ' "NOME" = ? ' +
    	' WHERE "IDVENDAPAGAMENTO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.IDVENDA);
		pStmt.setInt(2, registro.NITEM);
		pStmt.setString(3, registro.TPAG);
		pStmt.setString(4, registro.DSTIPOPAGAMENTO);
		pStmt.setFloat(5, registro.VALORRECEBIDO);
		
		pStmt.setFloat(6, registro.VALORDEDUZIDO);
		pStmt.setFloat(7, registro.VALORLIQUIDO);
		setTimestampOrNull(pStmt, 8, registro.DTPROCESSAMENTO);
		setTimestampOrNull(pStmt, 9, registro.DTVENCIMENTO);
		setIntOrNull(pStmt, 10, registro.NPARCELAS);
		pStmt.setString(11, registro.NOTEF);
		pStmt.setString(12, registro.NOAUTORIZADOR);
		pStmt.setString(13, registro.NOCARTAO);
		pStmt.setString(14, registro.NUOPERACAO);
		pStmt.setString(15, registro.NSUTEF);
		pStmt.setString(16, registro.NSUAUTORIZADORA);
		pStmt.setString(17, registro.NUAUTORIZACAO);
		pStmt.setString(18, registro.STCANCELADO);
		pStmt.setString(19, registro.CPF);
		pStmt.setString(20, registro.NOME);
		
		pStmt.setString(21, registro.IDVENDAPAGAMENTO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."VENDAPAGAMENTO" ' +
		" ( " +
		' "IDVENDAPAGAMENTO", ' +
		' "IDVENDA", ' +
		' "NITEM", ' +
		' "TPAG", ' +
		' "DSTIPOPAGAMENTO", ' +
		' "VALORRECEBIDO", ' +
		' "VALORDEDUZIDO", ' +
		' "VALORLIQUIDO", ' +
		' "DTPROCESSAMENTO", ' +
		' "DTVENCIMENTO", ' +
		' "NPARCELAS", ' +
		' "NOTEF", ' +
		' "NOAUTORIZADOR", ' +
		' "NOCARTAO", ' +
		' "NUOPERACAO", ' +
		' "NSUTEF", ' +
		' "NSUAUTORIZADORA", ' +
		' "NUAUTORIZACAO", ' +
		' "STCANCELADO" ' +
		' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.IDVENDAPAGAMENTO);
		pStmt.setString(2, registro.IDVENDA);
		pStmt.setInt(3, registro.NITEM);
		pStmt.setString(4, registro.TPAG);
		pStmt.setString(5, registro.DSTIPOPAGAMENTO);
		pStmt.setFloat(6, registro.VALORRECEBIDO);
		
		pStmt.setFloat(7, registro.VALORDEDUZIDO||0.0);
		pStmt.setFloat(8, registro.VALORLIQUIDO||0.0);
		setTimestampOrNull(pStmt, 9, registro.DTPROCESSAMENTO);
		setTimestampOrNull(pStmt, 10, registro.DTVENCIMENTO);
		setIntOrNull(pStmt, 11, registro.NPARCELAS);
		pStmt.setString(12, registro.NOTEF);
		pStmt.setString(13, registro.NOAUTORIZADOR);
		pStmt.setString(14, registro.NOCARTAO);
		pStmt.setString(15, registro.NUOPERACAO);
		pStmt.setString(16, registro.NSUTEF);
		pStmt.setString(17, registro.NSUAUTORIZADORA);
		pStmt.setString(18, registro.NUAUTORIZACAO);
		pStmt.setString(19, registro.STCANCELADO);
    	
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