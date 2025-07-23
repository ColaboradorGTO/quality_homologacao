var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {

    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

	var query = ' SELECT DISTINCT ' +
		'   tbe.IDEMPRESA,' +
		'   tbe.NOFANTASIA,' +
		'   tbe.IDGRUPOEMPRESARIAL, ' +
		'   (SELECT IFNULL(sum(TBVD.VRTOTALLIQUIDO),0) FROM "VAR_DB_NAME".VENDADETALHE TBVD INNER JOIN "VAR_DB_NAME".VENDA ON TBVD.IDVENDA = VENDA.IDVENDA WHERE (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') AND VENDA.IDEMPRESA = tbe.IDEMPRESA AND TBVD.STCANCELADO = \'False\' AND TBVD.STVENDIGITAL = \'True\') AS VRTOTALVENDA,' +
		'   (SELECT IFNULL(sum(TBVD.QTD),0) FROM "VAR_DB_NAME".VENDADETALHE TBVD INNER JOIN "VAR_DB_NAME".VENDA ON TBVD.IDVENDA = VENDA.IDVENDA WHERE (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') AND VENDA.IDEMPRESA = tbe.IDEMPRESA AND TBVD.STCANCELADO = \'False\' AND TBVD.STVENDIGITAL = \'True\') AS QTDTOTAL' +
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbmc' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe on tbmc.IDEMPRESA = tbe.IDEMPRESA' +
		' WHERE ' + 
		'	1 = ? ';

	if (byId) {
		query = query + ' And  tbmc.IDEMPRESA = \'' + byId + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbmc.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

    query = query + ' ORDER BY tbe.IDGRUPOEMPRESARIAL ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}