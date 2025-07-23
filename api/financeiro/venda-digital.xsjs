var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

	var query = ' SELECT DISTINCT ' +
	    '   tbe.NUCNPJ,' +
		'   tbe.NOFANTASIA,' +
		'   tbv.IDVENDA,' +
		'   tbvd.IDVENDADETALHE AS CTRVENDA,'+
		'   tbf.NOFUNCIONARIO,'+
		'   tbp.DSNOME,'+
		'   tbvd.QTD,'+
		'   tbvd.VRTOTALLIQUIDO,'+
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD/mm/YYYY HH24:MI:SS\') AS DTHORAFECHAMENTOFORMATADA ' + 
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		'   INNER JOIN "VAR_DB_NAME".VENDADETALHE tbvd on tbvd.IDVENDA = tbv.IDVENDA' +
		'   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbp.IDPRODUTO = tbvd.CPROD' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe on tbe.IDEMPRESA = tbv.IDEMPRESA' +
		'   INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf on tbf.IDFUNCIONARIO = tbvd.VENDEDOR_MATRICULA' +
		' WHERE ' +
		'	1 = ?' +
		' AND tbv.STCANCELADO = \'False\''+
		' AND tbvd.STVENDIGITAL = \'True\'';

	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
	if (idDaEmpresa) {
		query = query + ' And  tbv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
	}
	
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

	var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;

			
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}