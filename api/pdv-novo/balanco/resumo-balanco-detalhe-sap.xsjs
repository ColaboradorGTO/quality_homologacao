var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoDetalheBalanco(idResumoBalanco, WareHouseCode) {
    
    var query = ' SELECT '+
                '   tbdb.IDPRODUTO, ' +
                '   SUM(tbdb.TOTALCONTAGEMGERAL) AS TOTALCONTAGEMGERAL ' +
                ' FROM  ' +
        		'   "VAR_DB_NAME".DETALHEBALANCO tbdb ' +
        		'  WHERE  ' +
        		'   tbdb.IDRESUMOBALANCO = ? '; 
		query +='  GROUP BY tbdb.IDPRODUTO  ';
		query +='  ORDER BY tbdb.IDPRODUTO  ';

	var linhas = api.sqlQuery(query, idResumoBalanco);
	
	var lines = [];
    
	for (var i = 0; i < linhas.length; i++) {
	    
		var det = linhas[i];
		var docLine = {
		    "numItem": i+1,
        	"ItemCode": det.IDPRODUTO, 
            "WareHouseCode": WareHouseCode, 
            "CountedQuantity": parseFloat(det.TOTALCONTAGEMGERAL), 
            "Counted": "tYES"
            
        	};
            
    	lines.push(docLine);
	}
	
	return lines;

}

function fnHandleGet(byId) {
    
    var query = ' SELECT ' +
        '   tbrb.IDRESUMOBALANCO,' +
		'   TO_VARCHAR(tbrb.DTFECHAMENTO,\'YYYY-mm-DD\') AS DATA,' +
		'   TO_VARCHAR(tbrb.DTFECHAMENTO,\'HH24:MI:SS\') AS HORA,' +
        '   tbrb.DSRESUMOBALANCO,' +
        '   tbe.BRANCHID,' +
        '   tbe.WAREHOUSECODE' +
        ' FROM ' +
		'   "VAR_DB_NAME".RESUMOBALANCO tbrb' +
		'    INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbrb.IDEMPRESA = tbe.IDEMPRESA '+
		' WHERE ' +
		'	1 = ? ';

	if (byId) {
		query = query + ' And  tbrb.IDRESUMOBALANCO = \'' + byId + '\' ';
	}
	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var resumo = {
		       
				"CountDate": registro.DATA,
				"CountTime": registro.HORA,
				"Remarks": registro.DSRESUMOBALANCO,
				"Reference2": null,
				"BranchID": registro.BRANCHID,
				"FinancialPeriod": 80,
				"PeriodIndicator": "Padrão",
				"CountingType": "ctSingleCounter",
				"InventoryCountingLines": obterLinhasDoDetalheBalanco(registro.IDRESUMOBALANCO, registro.WAREHOUSECODE)
		
		};

		data.push(resumo);

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