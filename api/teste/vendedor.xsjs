var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId){
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Campo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataFechamento");
    
    var query = ' SELECT ' +
        ' DISTINCT (rv.VENDEDOR_MATRICULA), ' +
		' CASE ' +
		' WHEN rv.VENDEDOR_NOME IS NULL THEN \'Loja\' ' +
		' ELSE rv.VENDEDOR_NOME END AS NOMEVENDEDOR, ' +
		' CASE ' +
		' WHEN rv.VENDEDOR_MATRICULA IS NULL THEN \'0\' ' +
        ' ELSE rv.VENDEDOR_MATRICULA END AS MATVENDEDOR, ' +
		' SUM(rv.QCOM) AS QTDPROD, ' +
		' round(SUM(rv.VALORPAGO),2) AS VALORBRUTO, ' +
		' round(SUM(rv.VALORVOUCHER),2) AS VALORVOUCHER, ' +
		' round(SUM(rv.VALORPAGO - rv.VALORVOUCHER),2) AS VALORLIQUIDO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".VW_VENDAS rv ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and rv.STCANCELADO = \'False\'';
    
    if(idDaEmpresa) {
        query = query + ' AND rv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    
        if(dataPesquisa) {
            query = query + ' AND (rv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
        }
    }
    
    if(byId) {
        query = query + ' AND rv.VENDEDOR_MATRICULA = \'' + byId + '\' ';
    }
    
	query = query + 'GROUP BY rv.VENDEDOR_MATRICULA, rv.VENDEDOR_NOME';

	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var vendedor = {
			"vendedor": {
				"NOMEVENDEDOR": registro.NOMEVENDEDOR,
				"MATVENDEDOR": registro.MATVENDEDOR,
				"QTDPROD":registro.QTDPROD,
				"VALORBRUTO":registro.VALORBRUTO,
				"VALORVOUCHER":registro.VALORVOUCHER,
				"VALORLIQUIDO":registro.VALORLIQUIDO
			
			}
			
		};

		data.push(vendedor);

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
