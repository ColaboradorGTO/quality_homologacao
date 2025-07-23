var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = 'SELECT ' +
        ' rb.IDRESUMOBALANCO, ' +
        ' rb.IDEMPRESA, '+
        ' rb.DSRESUMOBALANCO, '+
        ' TO_VARCHAR( rb.DTABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTABERTURA, ' +
        ' TO_VARCHAR( rb.DTFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTFECHAMENTO, ' +
        ' rb.QTDTOTALITENS, ' +
        ' rb.QTDTOTALSOBRA, ' +
        ' rb.QTDTOTALFALTA, ' +
        ' rb.TXTOBSERVACAO, ' +
        ' rb.STATIVO, ' +
        ' rb.IDUSRFECHAMENTO, ' +
        ' rb.VRESTOQUEANTERIOR, ' +
        ' rb.DTESTOQUEANTERIOR, ' +
        ' rb.QTDTOTALANTERIOR, ' +
        ' rb.VRTOTALROMANEIO, ' +
        ' rb.DTPERIODOROMANEIO, ' +
        ' rb.VRALTAMERCADORIA, ' +
        ' rb.DTPERIODOALTA, ' +
        ' rb.SOBRAMERCADORIA, ' +
        ' rb.DTPERIODOSOBRA, ' +
        ' rb.TOTALGERALENTRADA, ' +
        ' rb.VRBAIXAMERCADORIA, ' +
        ' rb.DTPERIODOBAIXA, ' +
        ' rb.VRDEVOLUCAOMERCADORIA, ' +
        ' rb.DTPERIODODEVOLUCAO, ' +
        ' rb.VRFALTAMERCADORIA, ' +
        ' rb.DTPERIODOFALTAMERCADORIA, ' +
        ' rb.VRDESCONTOCAIXA, ' +
        ' rb.DTPERIODODESCONTOCAIXA, ' +
        ' rb.VRVENDACAIXA, ' +
        ' rb.DTPERIODOVENDACAIXA, ' +
        ' rb.TOTALGERALSAIDA, ' +
        ' rb.TOTALGERALPRESTARCONTA, ' +
        ' rb.VRESTOQUEATUAL, ' +
        ' rb.QTDTOTALENTRADA, ' +
        ' rb.QTDTOTALDEVOLVIDA, ' +
        ' rb.QTDTOTALCONTAGEM, ' +
        ' rb.VRTOTALFALTA, ' +
        ' rb.DTFALTA, ' +
        ' rb.PERCFALTA, ' +
        ' rb.OBSCONTAGEM, ' +
        ' rb.OBSDIVERGENCIACONTAGEM, ' +
        ' rb.OBSDIVERGENCIAGERENTE, ' +
        ' rb.STCANCELADO, ' +
        ' rb.IDUSRCANCELADO, ' +
        ' rb.TXTMOTIVOCANCELADO, ' +
        ' rb.STCONCLUIDO, ' +
        ' rb.STCONSOLIDADO, ' +
        ' e.NOFANTASIA '+
        'FROM "VAR_DB_NAME".RESUMOBALANCO rb ' +
        'INNER JOIN "VAR_DB_NAME".EMPRESA e ON e.IDEMPRESA = rb.IDEMPRESA ' +
        'WHERE 1 = ?';

    if ( byId ) {
        query = query + ' AND rb.IDRESUMOBALANCO = \'' + byId + '\' ';
    }
    query = query + ' AND rb.STATIVO = \'True\' ';

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };

    api.responseWithQuery(query, request, 1);
}

function fnHandlePut(){

    var conn = $.db.getConnection();

    var bodyJson = JSON.parse($.request.body.asString());
    var pIdResumoBalanco = bodyJson.IDRESUMOBALANCO;
    var pIdEmpresa = bodyJson.IDEMPRESA;

	var query = 'UPDATE "VAR_DB_NAME".RESUMOBALANCO SET ' +
	    ' VRESTOQUEATUAL = TO_DECIMAL((SELECT IFNULL(SUM(QTD * PRECOVENDA), 0) FROM "VAR_DB_NAME".PREVIABALANCO WHERE IDRESUMOBALANCO = \'' + pIdResumoBalanco + '\' )), ' +
	    ' QTDTOTALANTERIOR = TO_INT((SELECT IFNULL(SUM(QTDFINAL), 0) FROM "VAR_DB_NAME".PREVIABALANCO WHERE IDRESUMOBALANCO = \'' + pIdResumoBalanco + '\' )), ' +
	    ' QTDTOTALCONTAGEM = TO_INT((SELECT IFNULL(SUM(QTD), 0) FROM "VAR_DB_NAME".PREVIABALANCO WHERE IDRESUMOBALANCO = \'' + pIdResumoBalanco + '\' )), ' +
	    ' VRESTOQUEANTERIOR = TO_DECIMAL((SELECT IFNULL(VRESTOQUEATUAL, 0) FROM "VAR_DB_NAME".RESUMOBALANCO WHERE IDEMPRESA = \'' + pIdEmpresa + '\' ' +
	    '                       AND IDRESUMOBALANCO <> \'' + pIdResumoBalanco + '\' AND STCONCLUIDO = \'True\' ORDER BY IDRESUMOBALANCO DESC LIMIT 1)), ' +
	    ' DTESTOQUEANTERIOR = (SELECT DTFECHAMENTO FROM "VAR_DB_NAME".RESUMOBALANCO WHERE IDEMPRESA = \'' + pIdEmpresa + '\' ' +
	    '                       AND IDRESUMOBALANCO <> \'' + pIdResumoBalanco + '\' AND STCONCLUIDO = \'True\' ORDER BY IDRESUMOBALANCO DESC LIMIT 1) ' +
	    ' WHERE IDRESUMOBALANCO = ?';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	
	pStmt.setInt(1, pIdResumoBalanco);
	
	pStmt.execute();
	
	pStmt.close();
	
	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

        //Handle your GET calls here
         case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;

		//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		
		//Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
		
		default:
			break;
	}
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}