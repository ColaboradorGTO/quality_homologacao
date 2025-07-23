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

function obterVlVoucher(dataInicio, datafim, idEmpresa){

	var query = ' SELECT (v1.VRRECVOUCHER) as VRRECVOUCHER' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDA v1 ' +
		'  WHERE  ' +
		'   v1.IDEMPRESA = ?  ' +
		'	AND v1.STCANCELADO = \'False\'  '+
		'   AND (v1.DTHORAFECHAMENTO BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + datafim + ' 23:59:59\') ';

	var linhas = api.sqlQuery(query, idEmpresa);

	var vrTotalVoucher = 0;
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
		vrTotalVoucher = vrTotalVoucher + parseFloat(det.VRRECVOUCHER);
	}

	return vrTotalVoucher;
    
}

function obterVlPago(dataInicio, datafim, idEmpresa){

	var query = ' SELECT  (v1.VRTOTALPAGO) as VRTOTALPAGO' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDA v1 ' +
		'  WHERE  ' +
		'   v1.IDEMPRESA = ?  ' +
		'	AND v1.STCANCELADO = \'False\'  '+
		'   AND (v1.DTHORAFECHAMENTO BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + datafim + ' 23:59:59\') ';

	var linhas = api.sqlQuery(query, idEmpresa);

	var vrTotalPago = 0;
	for (var i = 0; i < linhas.length; i++) {
		var det1 = linhas[i];
		vrTotalPago = vrTotalPago + parseFloat(det1.VRTOTALPAGO);
	}

	return vrTotalPago;
    
}

function obterVlDesconto(dataInicio, datafim, idEmpresa){

	var query = ' SELECT  IFNULL(SUM(v2.VDESC),0) as VRTOTALDESCONTO' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDA v1 ' +
		'   INNER JOIN "VAR_DB_NAME".VENDADETALHE v2 ON V2.IDVENDA = V1.IDVENDA ' +
		'  WHERE  ' +
		'   V1.IDEMPRESA = ?  ' +
		'	AND v1.STCANCELADO = \'False\'  '+ 
		'	AND v2.STCANCELADO = \'False\'  '+ 
		'   AND (v1.DTHORAFECHAMENTO BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + datafim + ' 23:59:59\') ';

	var linhas = api.sqlQuery(query, idEmpresa);

	var vrTotalDesconto = 0;
	for (var i = 0; i < linhas.length; i++) {
		var det1 = linhas[i];
		vrTotalDesconto = vrTotalDesconto + parseFloat(det1.VRTOTALDESCONTO);
	}

	return vrTotalDesconto;
    
}

function fnHandleGet(byId) {
    
    var idDaMarca = $.request.parameters.get("idMarca");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio"); 
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim"); 
 
	var query = ' SELECT DISTINCT ' +
		'   v2.IDEMPRESA,' +
		'   v2.NOFANTASIA,' +
		'   SUM(v2.QTD) AS QTD,' +
		'   SUM(v2.VRTOTALLIQUIDO) AS VRTOTALLIQUIDO,' +
		'   SUM((v2.QTD*v2.PRECO_COMPRA)) AS TOTALCUSTO' + 
        ' FROM ' +
		'   "VAR_DB_NAME".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO v2' +
		' WHERE ' +
		'	1 = ? ';

	if (byId) {
		query = query + ' And  v2.IDEMPRESA = \'' + byId + '\' ';
	}
	
	if (idDaMarca) {
		query = query + ' And  v2.IDGRUPOEMPRESARIAL = \'' + idDaMarca + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (v2.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

    query = query + ' GROUP BY v2.IDEMPRESA, v2.NOFANTASIA ';
    query = query + ' ORDER BY v2.IDEMPRESA ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
	var response = api.sqlQueryPage(query, request, 1);
	var data = [];
   
	for (var i = 0; i < response.data.length; i++) { 

		var registro = response.data[i];

		var vendaMarca = {
			"vendaMarca": {
				"IDEMPRESA": registro.IDEMPRESA,
				"NOFANTASIA": registro.NOFANTASIA,
				"QTD": registro.QTD,
				"VRTOTALLIQUIDO": registro.VRTOTALLIQUIDO,
				"TOTALCUSTO": registro.TOTALCUSTO
			},
			"voucher": obterVlVoucher(dataPesquisaInicio,dataPesquisaFim,registro.IDEMPRESA),
			"valorPago": obterVlPago(dataPesquisaInicio,dataPesquisaFim,registro.IDEMPRESA),
			"valorDesconto": obterVlDesconto(dataPesquisaInicio,dataPesquisaFim,registro.IDEMPRESA)
		};

		data.push(vendaMarca);

	}

	response.data = data;

	return response;
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
       
       //Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;
            
       
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}