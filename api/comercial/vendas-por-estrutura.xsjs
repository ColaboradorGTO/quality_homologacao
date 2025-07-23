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
		'   v2.IDEMPRESA,' +
		'   v2.NOFANTASIA,' +
		'   v2.GRUPO,' +
		'   v2.SUBGRUPO,' +
		'   v2.MARCA,' +
		'   v3.NUCODBARRAS,' +
		'   v3.DSNOME,' +
		'   SUM(v2.QTD) AS QTD,' +
		'   SUM(v2.VRTOTALLIQUIDO) AS VRTOTALLIQUIDO,' +
		'   SUM((v2.QTD*v2.PRECO_COMPRA)) AS TOTALCUSTO,' +
		'   SUM((v2.QTD*v2.VUNCOM)) AS TOTALBRUTO,' +
		'   SUM((v2.VDESC)) AS TOTALDESCONTO,' +
		'   SUM(v2.VRRECVOUCHER) AS VRRECVOUCHER'+
        ' FROM ' +
		'   "VAR_DB_NAME".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO v2' +
		'   LEFT JOIN "VAR_DB_NAME".PRODUTO v3 ON V2.CPROD = V3.IDPRODUTO' +
		' WHERE ' +
		'	1 = ? ';

	if (byId) {
		query = query + ' And  v2.IDEMPRESA = \'' + byId + '\' ';
	}
	
	if (idDaMarca > 0) {
		query = query + ' And  v2.IDGRUPOEMPRESARIAL = \'' + idDaMarca + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (v2.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    if(idEmpresa){
       query = query + ' And  v2.IDEMPRESA IN (' + idEmpresa + ') ';
    }
    
    if (produto) {
        query = query + ' And  (UPPER(v3.DSNOME) LIKE UPPER(\'%'+produto+'%\') OR v3.NUCODBARRAS=\''+produto+'\' ) ';
    }
    
    if(uf > 0){
        query = query + ' AND v2.SGUF=\''+uf+'\''; 
    }
    
    if (idFornecedor) {
		query = query + ' And  v2.IDRAZAO_SOCIAL_FORNECEDOR IN (\'' + idFornecedor + '\') ';
	}
	
	if (idgrupograde) {
	 var lstIdgrupoGrade = idgrupograde.split(',');
	 var DSgrupoGrade = '';
	 var lstDSgrupoGrade = '';
	 
    	for(var i=0; i< lstIdgrupoGrade.length; i++){ 
    	 
        	 if(lstIdgrupoGrade[i] === '1'){
        	     DSgrupoGrade = 'Verão';
        	 }else if(lstIdgrupoGrade[i] === '2'){
        	     DSgrupoGrade = 'Calçados/Acessórios';
        	 }else if(lstIdgrupoGrade[i] === '3'){
        	     DSgrupoGrade = 'Cama/Mesa/Banho';
        	 }else if(lstIdgrupoGrade[i] === '4'){
        	     DSgrupoGrade = 'Utilidades Do Lar';
        	 }else if(lstIdgrupoGrade[i] === '5'){
        	     DSgrupoGrade = 'Diversos';
        	 }else if(lstIdgrupoGrade[i] === '6'){
        	     DSgrupoGrade = 'Artigos Esportivos';
        	 }else if(lstIdgrupoGrade[i] === '7'){
        	     DSgrupoGrade = 'Cosméticos';
        	 }else if(lstIdgrupoGrade[i] === '8'){
        	     DSgrupoGrade = 'Acessórios';
        	 }else if(lstIdgrupoGrade[i] === '9'){
        	     DSgrupoGrade = 'Peças Íntimas';
        	 }else if(lstIdgrupoGrade[i] === '10'){
        	     DSgrupoGrade = 'Inverno';
        	 }
        	 
        	 if(i==0){
        	     lstDSgrupoGrade = '\''+ DSgrupoGrade + '\'';
        	 }else{
        	     lstDSgrupoGrade = lstDSgrupoGrade +',\''+DSgrupoGrade + '\'';
        	 }
        	
    	}
    	
		query = query + ' And  V2.GRUPO IN ('+ lstDSgrupoGrade+' ) ';
	}
	
	if (idgrade) {
		query = query + ' And  v2.IDSUBGRUPO IN (' + idgrade + ' ) ';
	}
	
	if(idMarcaProduto){
	    query = query + ' And  v2.IDMARCA IN (' + idMarcaProduto + ') ';
	}

    query = query + ' GROUP BY v2.IDEMPRESA, v2.NOFANTASIA, v2.GRUPO, v2.SUBGRUPO, v2.MARCA, v3.NUCODBARRAS, v3.DSNOME ';
    query = query + ' ORDER BY v2.IDEMPRESA, v3.NUCODBARRAS ';
    
   //return query;
    
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
				"GRUPO": registro.GRUPO,
				"SUBGRUPO": registro.SUBGRUPO,
				"MARCA": registro.MARCA,
				"NUCODBARRAS": registro.NUCODBARRAS,
				"DSNOME": registro.DSNOME,
				"QTD": registro.QTD,
				"VRTOTALLIQUIDO": registro.VRTOTALLIQUIDO,
				"TOTALCUSTO": registro.TOTALCUSTO,
				"TOTALBRUTO": registro.TOTALBRUTO,
				"TOTALDESCONTO": registro.TOTALDESCONTO,
				"VLVOUCHER": registro.VRRECVOUCHER
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