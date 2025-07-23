var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idMarca = $.request.parameters.get("idGrupoEmpresarial");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var uf = $.request.parameters.get("uf");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var produto = $.request.parameters.get("descricaoProduto");
    var idgrupograde = $.request.parameters.get("idGrupoGrade");
    var idgrade = $.request.parameters.get("idGrade");
    var idMarcaProduto = $.request.parameters.get("idMarcaProduto");
    var dataPesqInicial = $.request.parameters.get("dataInicio"); 
    var dataPesqFinal = $.request.parameters.get("dataFim");
    
	var query2 = 'select VWV.IDEMPRESA AS IDEMPRESA, '+
        ' T2.NOFANTASIA, '+
       ' VWV.VENDEDOR_MATRICULA, '+
       ' VWV.VENDEDOR_NOME, '+
       ' SUM(VWV.QTD) AS QTD_PRODUTOS, '+
       ' TO_VARCHAR(COUNT(DISTINCT VWV.IDVENDA)) AS QTD_VENDAS, '+
       ' SUM(VWV.VRTOTALLIQUIDO) AS VRTOTALVENDA, '+
       ' SUM(VWV.VRRECVOUCHER) AS VRRECVOUCHER, '+
       ' SUM(VWV.PRECO_COMPRA) AS PRECO_COMPRA '+
       ' FROM QUALITY_CONC_HML.VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO VWV '+
       ' INNER JOIN QUALITY_CONC_HML.EMPRESA T2 ON T2.IDEMPRESA = VWV.IDEMPRESA '+
       ' INNER JOIN "QUALITY_CONC_HML".PRODUTO tbps ON VWV.CPROD = tbps.IDPRODUTO '+
	' WHERE 1=?';
        
    if(dataPesqInicial && dataPesqFinal){
        query2 = query2 + ' AND (VWV.DTHORAFECHAMENTO  BETWEEN \'' + dataPesqInicial + ' 00:00:00\' AND \'' + dataPesqFinal + ' 23:59:59\')';
    } 
    
    if(idMarca > 0){
        query2 = query2 + ' AND VWV.IDGRUPOEMPRESARIAL IN (' + idMarca + ') ';
    }
    
    if(idEmpresa){
       query2 = query2 + ' And  VWV.IDEMPRESA IN (' + idEmpresa + ') ';
    }
    
    if (produto) {
        query2 = query2 + ' And  (UPPER(tbps.DSNOME) LIKE UPPER(\'%'+produto+'%\') OR tbps.NUCODBARRAS=\''+produto+'\' ) ';
    }
    
    if(uf > 0){
        query2 = query2 + ' AND VWV.SGUF=\''+uf+'\''; 
    }
    
    if (idFornecedor) {
		query2 = query2 + ' And  VWV.IDRAZAO_SOCIAL_FORNECEDOR IN (\'' + idFornecedor + '\') ';
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
    	
		query2 = query2 + ' And  VWV.GRUPO IN ('+ lstDSgrupoGrade+' ) ';
	}
	
	if (idgrade) {
		query2 = query2 + ' And  VWV.IDSUBGRUPO IN (' + idgrade + ') ';
	}
	
	if(idMarcaProduto){
	    query2 = query2 + ' And  VWV.IDMARCA IN (' + idMarcaProduto + ') ';
	}
   
    
    query2 = query2 + ' GROUP BY VWV.IDEMPRESA,VWV.VENDEDOR_MATRICULA,VWV.VENDEDOR_NOME,T2.NOFANTASIA ';
    
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query2, request, 1);
	var data = [];
   
	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var venda = {
		    	"NOFANTASIA": registro.NOFANTASIA,
				"VENDEDOR_MATRICULA": registro.VENDEDOR_MATRICULA,
				"VENDEDOR_NOME": registro.VENDEDOR_NOME,
				"QTD_VENDAS": registro.QTD_VENDAS,
				"QTD_PRODUTOS": registro.QTD_PRODUTOS,
				"VRTOTALVENDA":registro.VRTOTALVENDA,
				"VRRECVOUCHER":registro.VRRECVOUCHER,
				"PRECO_COMPRA":registro.PRECO_COMPRA
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