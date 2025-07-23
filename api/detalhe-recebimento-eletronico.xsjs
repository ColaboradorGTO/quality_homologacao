var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdre.IDDETALHERECEBIMENTOELETRONICO,' +
    '   tbdre.IDEMPRESA,' +
    '   tbdre.IDRESUMOVENDAWEB,' +
    '   tbdre.DSTIPOPAGAMENTO,' +
    '   tbdre.VALORRECEBIDO,' +
    '   tbdre.VALORDEDUZIDO,' +
    '   tbdre.VALORLIQUIDO,' +
    '   TO_VARCHAR(tbdre.DTPROCESSAMENTO,\'YYYY-MM-DD HH24:MI:SS\') AS DTPROCESSAMENTO, ' +
    '   TO_VARCHAR(tbdre.DTVENCIMENTO,\'YYYY-MM-DD HH24:MI:SS\') AS DTVENCIMENTO, ' +
    '   tbdre.DTLIQUIDACAO,' +
    '   tbdre.NPARCELAS,' +
    '   tbdre.NOTEF,' +
    '   tbdre.NOAUTORIZADOR,' +
    '   tbdre.NOCARTAO,' +
    '   tbdre.NUOPERACAO,' +
    '   tbdre.NSUTEF,' +
    '   tbdre.NSUAUTORIZADORA,' +
    '   tbdre.NUAUTORIZACAO,' +
    '   tbdre.STCONFERIDO,' +
    '   tbdre.STCANCELADO,' +
    '   tbdre.DTCANCELAMENTO,' +
    '   tbdre.IDUSRCANCELADO,' +
    '   tbdre.TXTCANCELAMENTO,' +
    '   tbdre.IDUSRALTERACAO,' +
    '   tbdre.TXTALTERACAO,' +
    '   TO_VARCHAR(tbdre.DTALTERACAO,\'YYYY-MM-DD HH:MM:SS\') AS DTALTERACAO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHERECEBIMENTOELETRONICO tbdre' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdre.IDDETALHERECEBIMENTOELETRONICO = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHERECEBIMENTOELETRONICO" SET ' + 
        ' "IDEMPRESA" = ?, ' + 
        ' "IDRESUMOVENDAWEB" = ?, ' + 
        ' "DSTIPOPAGAMENTO" = ?, ' + 
        ' "VALORRECEBIDO" = ?, ' + 
        ' "VALORDEDUZIDO" = ?, ' + 
        ' "VALORLIQUIDO" = ?, ' + 
        ' "DTPROCESSAMENTO" = ?, ' + 
        ' "DTVENCIMENTO" = ?, ' + 
        ' "DTLIQUIDACAO" = ?, ' + 
        ' "NPARCELAS" = ?, ' + 
        ' "NOTEF" = ?, ' + 
        ' "NOAUTORIZADOR" = ?, ' + 
        ' "NOCARTAO" = ?, ' + 
        ' "NUOPERACAO" = ?, ' + 
        ' "NSUTEF" = ?, ' + 
        ' "NSUAUTORIZADORA" = ?, ' + 
        ' "NUAUTORIZACAO" = ?, ' + 
        ' "STCONFERIDO" = ?, ' + 
        ' "STCANCELADO" = ?, ' + 
        ' "DTCANCELAMENTO" = ?, ' + 
        ' "IDUSRCANCELADO" = ?, ' + 
        ' "TXTCANCELAMENTO" = ?, ' + 
        ' "IDUSRALTERACAO" = ?, ' + 
        ' "TXTALTERACAO" = ?, ' + 
        ' "DTALTERACAO" = ? ' + 
    	' WHERE "IDDETALHERECEBIMENTOELETRONICO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setInt(2, registro.IDRESUMOVENDAWEB);
        pStmt.setString(3, registro.DSTIPOPAGAMENTO);
        pStmt.setFloat(4, registro.VALORRECEBIDO);
        pStmt.setFloat(5, registro.VALORDEDUZIDO);
        pStmt.setFloat(6, registro.VALORLIQUIDO);
        pStmt.setDate(7, registro.DTPROCESSAMENTO);
        pStmt.setDate(8, registro.DTVENCIMENTO);
        pStmt.setDate(9, registro.DTLIQUIDACAO);
        pStmt.setInt(10, registro.NPARCELAS);
        pStmt.setString(11, registro.NOTEF);
        pStmt.setString(12, registro.NOAUTORIZADOR);
        pStmt.setString(13, registro.NOCARTAO);
        pStmt.setString(14, registro.NUOPERACAO);
        pStmt.setString(15, registro.NSUTEF);
        pStmt.setString(16, registro.NSUAUTORIZADORA);
        pStmt.setString(17, registro.NUAUTORIZACAO);
        pStmt.setString(18, registro.STCONFERIDO);
        pStmt.setString(19, registro.STCANCELADO);
        pStmt.setDate(20, registro.DTCANCELAMENTO);
        pStmt.setString(21, registro.IDUSRCANCELADO);
        pStmt.setString(22, registro.TXTCANCELAMENTO);
        pStmt.setInt(23, registro.IDUSRALTERACAO);
        pStmt.setString(24, registro.TXTALTERACAO);
        pStmt.setString(25, registro.DTALTERACAO);
        pStmt.setString(26, registro.IDDETALHERECEBIMENTOELETRONICO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHERECEBIMENTOELETRONICO" ' +
		" ( " +
		' "IDDETALHERECEBIMENTOELETRONICO", ' +
        ' "IDEMPRESA", ' +
        ' "IDRESUMOVENDAWEB", ' +
        ' "DSTIPOPAGAMENTO", ' +
        ' "VALORRECEBIDO", ' +
        ' "VALORDEDUZIDO", ' +
        ' "VALORLIQUIDO", ' +
        ' "DTPROCESSAMENTO", ' +
        ' "DTVENCIMENTO", ' +
        ' "DTLIQUIDACAO", ' +
        ' "NPARCELAS", ' +
        ' "NOTEF", ' +
        ' "NOAUTORIZADOR", ' +
        ' "NOCARTAO", ' +
        ' "NUOPERACAO", ' +
        ' "NSUTEF", ' +
        ' "NSUAUTORIZADORA", ' +
        ' "NUAUTORIZACAO", ' +
        ' "STCONFERIDO", ' +
        ' "STCANCELADO", ' +
        ' "DTCANCELAMENTO", ' +
        ' "IDUSRCANCELADO", ' +
        ' "TXTCANCELAMENTO", ' +
        ' "IDUSRALTERACAO", ' +
        ' "TXTALTERACAO", ' +
        ' "DTALTERACAO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_BANCO.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setInt(2, registro.IDRESUMOVENDAWEB);
        pStmt.setString(3, registro.DSTIPOPAGAMENTO);
        pStmt.setFloat(4, registro.VALORRECEBIDO);
        pStmt.setFloat(5, registro.VALORDEDUZIDO);
        pStmt.setFloat(6, registro.VALORLIQUIDO);
        pStmt.setDate(7, registro.DTPROCESSAMENTO);
        pStmt.setDate(8, registro.DTVENCIMENTO);
        pStmt.setDate(9, registro.DTLIQUIDACAO);
        pStmt.setInt(10, registro.NPARCELAS);
        pStmt.setString(11, registro.NOTEF);
        pStmt.setString(12, registro.NOAUTORIZADOR);
        pStmt.setString(13, registro.NOCARTAO);
        pStmt.setString(14, registro.NUOPERACAO);
        pStmt.setString(15, registro.NSUTEF);
        pStmt.setString(16, registro.NSUAUTORIZADORA);
        pStmt.setString(17, registro.NUAUTORIZACAO);
        pStmt.setString(18, registro.STCONFERIDO);
        pStmt.setString(19, registro.STCANCELADO);
        pStmt.setDate(20, registro.DTCANCELAMENTO);
        pStmt.setString(21, registro.IDUSRCANCELADO);
        pStmt.setString(22, registro.TXTCANCELAMENTO);
        pStmt.setInt(23, registro.IDUSRALTERACAO);
        pStmt.setString(24, registro.TXTALTERACAO);
        pStmt.setString(25, registro.DTALTERACAO);
    	
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