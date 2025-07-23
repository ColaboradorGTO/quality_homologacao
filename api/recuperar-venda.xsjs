var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDosItens(idVenda) {

	var query = ' SELECT '+
				 '	tbvd.CPROD, '+
				 '	tbp.DSNOME, '+
				 '	tbp.NUCODBARRAS, '+
				 '  tbvd.VUNCOM' +
				 ' FROM '+
				 '	"VAR_DB_NAME".VENDADETALHE tbvd ' +
				 '	INNER JOIN "VAR_DB_NAME".PRODUTO tbp ON  tbp.IDPRODUTO = tbvd.CPROD ' +
				 ' WHERE '+
				 '	tbvd.IDVENDA = ?';
	
	var linhas = api.sqlQuery(query, idVenda);
	var lines=[];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"det": {
				"CPROD": det.CPROD,
				"DSNOME": det.DSNOME,
				"NUCODBARRAS": det.NUCODBARRAS,
				"VUNCOM": det.VUNCOM
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {

	var idEmpresa = $.request.parameters.get("idEmpresa");
    var numeroSerie = $.request.parameters.get("numeroSerie");    
    var numeroNota = $.request.parameters.get("numeroNota");   
    
    var query = ' SELECT ' +
        '   tbv.IDEMPRESA, '+
        '   tbv.NFE_INFNFE_IDE_SERIE, '+
        '   tbv.NFE_INFNFE_IDE_NNF, '+
        '   tbv.IDVENDA, '+
        '   tbv.STCANCELADO, ' +
		'	tbv.DTHORAFECHAMENTO ' +
		' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv' +
        ' WHERE ' +
        '	1 = ?';
    
    if(idEmpresa) {
        query = query + ' AND tbv.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(numeroSerie) {
        query = query + ' AND tbv.NFE_INFNFE_IDE_SERIE = \'' + numeroSerie + '\' ';
    }
    
    if(numeroNota) {
        query = query + ' AND tbv.NFE_INFNFE_IDE_NNF = \'' + numeroNota + '\' ';
    }
    
    
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var venda = {
			"venda": {
			    "IDEMPRESA": registro.IDEMPRESA,
			    "NUMERO_SERIE":registro.NFE_INFNFE_IDE_SERIE,
			    "NUMERO_NOTA":registro.NFE_INFNFE_IDE_NNF,
			    "IDVENDA": registro.IDVENDA,
				"STCANCELADO": registro.STCANCELADO,
				"DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO
			},
			"Itens": obterLinhasDosItens(registro.IDVENDA)
		};

		data.push(venda);

	}

	response.data = data;

	return response;
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}