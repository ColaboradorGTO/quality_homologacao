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
    
    var idDaLoja = $.request.parameters.get("idLoja");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
 
	var query = ' SELECT DISTINCT ' +
		'   tbe.IDEMPRESA,' +
		'   tbe.NOFANTASIA,' +
		'   (SELECT IFNULL (SUM(tbf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbf INNER JOIN "VAR_DB_NAME".MOVIMENTOCAIXA tbmcf on tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO=\'False\' AND (tbf.STPIX = \'False\' OR tbf.STPIX IS NULL) AND (tbf.DTPROCESSAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS VRFATURA,' +
		'   (SELECT IFNULL (SUM(VENDA.VRTOTALPAGO),0) FROM "VAR_DB_NAME".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO=\'False\' AND (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS VRTOTALPAGO,' +
		'   (SELECT IFNULL (SUM(VENDA.VRRECDINHEIRO),0) FROM "VAR_DB_NAME".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO=\'False\' AND (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS VRDINHEIRO,' +
		'   (SELECT IFNULL (COUNT(VENDA.IDVENDA),0) FROM "VAR_DB_NAME".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO=\'False\' AND (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS QTDVENDA,' +
		'   (SELECT IFNULL (SUM(VENDA.VRRECCARTAO),0) FROM "VAR_DB_NAME".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO=\'False\' AND (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS VRCARTAO,' +
		'   (SELECT IFNULL (SUM(VENDA.VRRECPOS),0) FROM "VAR_DB_NAME".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO=\'False\' AND (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS VRPOS,' +
		'   (SELECT IFNULL (SUM(VENDA.VRRECCONVENIO),0) FROM "VAR_DB_NAME".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO=\'False\' AND (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS CONVENIO,' +
		'   (SELECT IFNULL (SUM(VENDA.VRRECVOUCHER),0) FROM "VAR_DB_NAME".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO=\'False\' AND (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS VOUCHER,' +
		'   (SELECT IFNULL (SUM(DESPESALOJA.VRDESPESA),0) FROM "VAR_DB_NAME".DESPESALOJA WHERE DESPESALOJA.IDEMPRESA = tbe.IDEMPRESA AND DESPESALOJA.STCANCELADO=\'False\' AND (DESPESALOJA.DTDESPESA BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS VRDESPESA,' +
		'   (SELECT IFNULL (SUM(a.VRVALORDESCONTO),0) FROM "VAR_DB_NAME".ADIANTAMENTOSALARIAL a WHERE a.IDEMPRESA = tbe.IDEMPRESA AND a.STATIVO=\'True\' AND (a.DTLANCAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS VRADIANTAMENTOSALARIO, ' +
        '   (SELECT IFNULL (SUM(dl.VRFISICODINHEIRO),0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE (dl.DTABERTURA  BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') AND dl.IDEMPRESA =tbe.IDEMPRESA  AND dl.STCANCELADO = \'False\' AND dl.STFECHADO = \'True\') AS VRFISICODINHEIRO, '+
        '   (SELECT IFNULL (SUM(dl.VRRECDINHEIRO),0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE (dl.DTABERTURA  BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') AND dl.IDEMPRESA =tbe.IDEMPRESA  AND dl.STCANCELADO = \'False\' AND dl.STFECHADO = \'True\') AS VRRECDINHEIRO '+
		' FROM ' +
		'   "VAR_DB_NAME".MOVIMENTOCAIXA tbmc' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe on tbmc.IDEMPRESA = tbe.IDEMPRESA' +
		' WHERE ' +
		'	1 = ? ';

	if (byId) {
		query = query + ' And  tbe.IDEMPRESA = \'' + byId + '\' ';
	}
	
	if (idDaLoja) {
		query = query + ' And  tbe.IDEMPRESA = \'' + idDaLoja + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbmc.DTABERTURA BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

    query = query + ' ORDER BY tbe.IDEMPRESA ';
    
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