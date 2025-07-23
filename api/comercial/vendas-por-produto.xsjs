var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function fnHandleGet(byId) {
    
    var idDaMarca = $.request.parameters.get("idMarca");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio"); 
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim"); 
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var uf = $.request.parameters.get("uf");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var produto = $.request.parameters.get("descricaoProduto");
    var idgrupograde = $.request.parameters.get("idGrupoGrade");
    var idgrade = $.request.parameters.get("idGrade");
    var idMarcaProduto = $.request.parameters.get("idMarcaProduto");
    
 
	var query = ' SELECT DISTINCT ' +
	    '   v2.IDVENDA,' +
		'   v2.IDEMPRESA,' +
		'   v2.NOFANTASIA,' +
		'   v2.GRUPO,' +
		'   v2.SUBGRUPO,' +
		'   v2.MARCA,' +
		'   v3.NUCODBARRAS,' +
		'   v3.DSNOME,' +
		'   SUM(v2.QTD) AS QTD,' +
		'   (SELECT SUM(VD.QTD) FROM QUALITY_CONC_HML.VENDADETALHE VD WHERE VD.IDVENDA = V2.IDVENDA) AS TOTAL '+
		' FROM ' +
		'   "VAR_DB_NAME".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO v2' +
		'   INNER JOIN "VAR_DB_NAME".PRODUTO v3 ON V2.CPROD = V3.IDPRODUTO' +
		' WHERE ' +
		'	1 = ? ';

	if (byId) {
		query = query + ' And  v2.IDEMPRESA = \'' + byId + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (v2.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    if(idEmpresa){
       query = query + ' And  v2.IDEMPRESA IN (' + idEmpresa + ') ';
    }
    
    
    query = query + ' GROUP BY v2.IDVENDA,v2.IDEMPRESA, v2.NOFANTASIA, v2.GRUPO, v2.SUBGRUPO, v2.MARCA, v3.NUCODBARRAS, v3.DSNOME  ';
    query = query + ' ORDER BY v2.IDVENDA';
    
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
			    "IDVENDA": registro.IDVENDA,
				"IDEMPRESA": registro.IDEMPRESA,
				"NOFANTASIA": registro.NOFANTASIA,
				"GRUPO": registro.GRUPO,
				"SUBGRUPO": registro.SUBGRUPO,
				"MARCA": registro.MARCA,
				"NUCODBARRAS": registro.NUCODBARRAS,
				"DSNOME": registro.DSNOME,
				"QTD": registro.QTD,
				"TOTAL": registro.TOTAL
			}
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