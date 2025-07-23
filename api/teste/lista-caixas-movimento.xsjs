var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId){
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Campo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataFechamento");
    
    var query = ' SELECT ' +
        ' DISTINCT (rv.IDMOVIMENTOCAIXA) AS IDMOVIMENTOCAIXA, ' +
		' rv.DSCAIXA, ' +
		' TO_VARCHAR(rv.DTABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTABERTURA, ' +
		' rv.NOFUNCIONARIO, ' +
		' rv.STFECHADO, ' +
		' round((rv.VRRECFATURA),2) AS VRRECFATURA, ' +
		' round(SUM(rv.VALORDINHEIRO),2) AS VALORDINHEIRO, ' +
        ' round(SUM(rv.VALORCARTAO),2) AS VALORCARTAO, ' +
		' round(SUM(rv.VALORPOS),2) AS VALORPOS, ' +
		' round(SUM(rv.VALORVOUCHER),2) AS VALORVOUCHER, ' +
		' round(SUM(rv.VALORCONVENIO),2) AS VALORCONVENIO, ' +
		' round(SUM(rv.VALORDINHEIRO+rv.VALORCARTAO+rv.VALORPOS),2) AS TOTALRECEBIDO, ' +
		' round(SUM(rv.VALORDINHEIRO)+(rv.VRRECFATURA),2) AS TOTALDISPONIVEL ' +
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
        query = query + ' AND rv.IDMOVIMENTOCAIXA = \'' + byId + '\' ';
    }
    
	query = query + 'GROUP BY rv.IDMOVIMENTOCAIXA, rv.DSCAIXA, rv.DTABERTURA, rv.NOFUNCIONARIO, rv.VRRECFATURA, rv.STFECHADO';

	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var caixa = {
			"caixa": {
				"ID": registro.IDMOVIMENTOCAIXA,
				"DSCAIXA": registro.DSCAIXA,
				"DTABERTURA":registro.DTABERTURA,
				"NOFUNCIONARIO":registro.NOFUNCIONARIO,
				"STFECHADO":registro.STFECHADO,
				"VRRECFATURA":registro.VRRECFATURA,
				"VALORDINHEIRO":registro.VALORDINHEIRO,
				"VALORCARTAO":registro.VALORCARTAO,
				"VALORPOS":registro.VALORPOS,
				"VALORVOUCHER":registro.VALORVOUCHER,
				"VALORCONVENIO":registro.VALORCONVENIO,
				"TOTALRECEBIDO":registro.TOTALRECEBIDO,
				"TOTALDISPONIVEL":registro.TOTALDISPONIVEL
			
			}
			
		};

		data.push(caixa);

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