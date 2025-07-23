var api = $.import("quality.concentrador.api.apiResponse", "int_api");


function obterPrecoVendaAnterior(idProduto, idEmpresa) {

	var query = ' SELECT TOP 1 ' +
	    '   CASE WHEN IFNULL (pp.PRECO_VENDA,0) = 0 THEN p.PRECOVENDA ELSE pp.PRECO_VENDA END PRECOANTIGO' +
        ' FROM ' +
        '	"VAR_DB_NAME".PRODUTO_PRECO pp ' +
        '	INNER JOIN "VAR_DB_NAME".PRODUTO p ON pp.IDPRODUTO = p.IDPRODUTO ' +
        ' WHERE ' +
        '	pp.IDPRODUTO = ? '+
        '	AND pp.IDEMPRESA =\''+idEmpresa+'\'  '+
        '   ORDER BY p.DTULTALTERACAO DESC ';

	var linhas = api.sqlQuery(query, idProduto);
	var lines = [];

	    for (var i = 0; i < linhas.length; i++) {
    		var det = linhas[i];
    
    		let docLine = {
    			"antigopreco": {
    				"PRECOANTIGO":det.PRECOANTIGO
            	}
    		};
    
    		lines.push(docLine);
	    }

	return lines;
}

function obterEstoque(idProduto, idEmpresa, dtMov) {

	var query = ' SELECT ' +
	    '   top 1 CASE WHEN (tbi.DTBALANCO IS NOT NULL) THEN tbi.QTDAJUSTEBALANCO ELSE IFNULL(tbi.QTDFINAL,0) END QTDFINAL ' +
        ' FROM ' +
        '	"VAR_DB_NAME".INVENTARIOMOVIMENTO tbi ' +
        ' WHERE ' +
        '	tbi.IDPRODUTO = ? '+
        '	AND tbi.IDEMPRESA =\''+idEmpresa+'\' '+
        '	AND tbi.DTMOVIMENTO <=\''+dtMov + ' 23:59:59\' '+
        '   ORDER BY tbi.DTMOVIMENTO DESC ';

	var linhas = api.sqlQuery(query, idProduto);
	var lines = [];
	if(linhas.length>0){
	    for (var i = 0; i < linhas.length; i++) {
    		var det = linhas[i];
    
    		let docLine = {
    			"prodestoque": {
    				"QTDFINAL":det.QTDFINAL
            	}
    		};
    
    		lines.push(docLine);
	    }
	}else{
    		let docLine1 = {
    			"prodestoque": {
    				"QTDFINAL":0
            	}
    		};
    
    		lines.push(docLine1);
	}


	return lines;
}

function obterProdutos(idProduto, idLog, idEmpresa) {

	var query = ' SELECT ' +
                '   hp."LogInstanc" AS LOGPRECO,' +
                '   hp."PriceList" AS LISTAPRECO,' +
                '   hp."BPLId" AS IDEMPRESA,' +
                '   hp."ListName" AS NOEMPRESA,' +
                '   hp."ItemCode" AS IDPRODUTO,' +
                '   oitm."ItemName" AS DSNOME,' +
                '   oitm."CodeBars" AS NUCODBARRAS,' +
                '   hp.DESCRICAOSUB AS DSSUBGRUPOESTRUTURA,' +
                '   hp."Price" AS PRECO_VENDA,' +
                '   TO_VARCHAR(hp."UpdateDate",\'YYYY-MM-DD\') AS DTATUALIZACAO' +
                '   FROM' + 
                '   "SBO_GTO_PRD"."TSD_HISTORICO_PRECO" hp' +
            	'   INNER JOIN SBO_GTO_PRD.OITM oitm ON hp."ItemCode" = oitm."ItemCode" ' +
        ' WHERE ' +
        '	hp."LogInstanc" =? '+
        '   AND (UPPER(oitm."ItemName") LIKE UPPER(\'%' + idProduto + '%\') OR oitm."CodeBars" LIKE \'%' + idProduto + '%\') '+
        '	AND hp."BPLId" =\''+idEmpresa+'\'  ';

	var linhas = api.sqlQuery(query, idLog);
	var lines = [];

	    for (var i = 0; i < linhas.length; i++) {
    		var det = linhas[i];
    
    		let docLine = {
    			"preco": {
    				"IDPRODUTO": det.IDPRODUTO,
    				"NOEMPRESA": det.NOEMPRESA,
    				"NUCODBARRAS": det.NUCODBARRAS,
    				"DSNOME": det.DSNOME,
    				"DSSUBGRUPOESTRUTURA": det.DSSUBGRUPOESTRUTURA,
    				"PRECO_VENDA": det.PRECO_VENDA
                	},
                	
    			"estoque": obterEstoque(det.IDPRODUTO,det.IDEMPRESA,det.DTATUALIZACAO),
    			"precoantigo": obterPrecoVendaAnterior(det.IDPRODUTO,det.IDEMPRESA)
                	
    		};
    		
    
    		lines.push(docLine);
	    }

	return lines;
}

function fnHandleGet(byId) {

    var IdEmpresa    = $.request.parameters.get("idempresa");
    var IdSubgrupo   = $.request.parameters.get("idsubgrupo");
    var DescProduto  = $.request.parameters.get("descproduto");
    var DtInicial    = $.request.parameters.get("dtinicial");

    var query = ' SELECT ' +
                '   MAX(hp."LogInstanc") AS LOGPRECO' +
                '   FROM' + 
                '   "SBO_GTO_PRD"."TSD_HISTORICO_PRECO" hp' +
            	'   INNER JOIN SBO_GTO_PRD.OITM oitm ON hp."ItemCode" = oitm."ItemCode" ' +
                '   WHERE 1 = ? ';

    if(byId){
        query = query + ' AND hp."BPLId" = \'' + byId + '\' ';
    }
    
    if(IdEmpresa){
        query = query + ' AND hp."BPLId" = \'' + IdEmpresa + '\' ';
    }
    
    if(IdSubgrupo){
        query = query + ' AND hp."ItmsGrpCod" IN (\'' + IdSubgrupo + '\') ';
    }
    if(DescProduto){
        query = query + ' AND (UPPER(oitm."ItemName") LIKE UPPER(\'%' + DescProduto + '%\') OR oitm."CodeBars" LIKE \'%' + DescProduto + '%\') ';
    }
    if(DtInicial){
        query = query + ' AND (hp."UpdateDate" = \'' + DtInicial + '\' ) ';
    }
    //query = query + ' GROUP BY hp."ItemCode",oitm."ItemName", oitm."CodeBars", hp."UpdateDate", hp."Price", hp."BPLId", hp."PriceList", hp."BPLName", hp.DESCRICAOSUB, hp."ListName", hp."LogInstanc" ';
    //query = query + ' ORDER BY hp."LogInstanc" DESC';
    //return query;
	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var log = {
			"log": {
				"LOGPRECO": registro.LOGPRECO
			
			},
			
			"produtos": obterProdutos(DescProduto, registro.LOGPRECO, IdEmpresa)
			
		};

		data.push(log);

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