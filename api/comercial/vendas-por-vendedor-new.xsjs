var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterQuantidadeSoma(dataInicio, dataFinal, matFuncionario, idEmpresa) {

	var query = ' SELECT DISTINCT '+
                ' SUM(VD.QTD) AS QTD_PRODUTO, '+
                ' IFNULL(SUM(VD.VRTOTALLIQUIDO),0) AS VRTOTALVENDA, '+
                ' IFNULL(SUM( '+
            	' 	CASE '+
            	' 	WHEN N."DOCENTRY" IS NOT NULL THEN '+
            	' 		N."PRECO" '+
            	' 	ELSE '+
            	' 		M."PrecoCompra" '+
            	' 	END '+
            	' ),0) AS "VRCUSTOTOTAL", '+
            	' CAST(COUNT(DISTINCT VD.IDVENDA) AS VARCHAR) AS QTD_VENDAS '+
                ' FROM '+ 
                ' QUALITY_CONC_HML.VENDADETALHE VD '+ 
                ' INNER JOIN QUALITY_CONC_HML.VENDA V ON V.IDVENDA = VD.IDVENDA '+
                '     LEFT OUTER JOIN ( '+
            	' SELECT '+
            	' 	XA ."DOCENTRY", '+
            	' 	XA ."IDPRODUTO", '+
            	' 	XA ."PRECO", '+
            	' 	XA ."DATA", '+
            	' 	XA ."QUANTIDADE" '+
            	' FROM '+
            	' 	"SBO_GTO_PRD"."RSD_ULTIMO_PRECO_COMPRA" XA '+
                ' ) N ON N."IDPRODUTO" = VD.CPROD '+
                ' LEFT OUTER JOIN ( '+
                ' 	SELECT '+
                ' 		XA ."PrecoCompra", '+
                ' 		XA ."ItemCode" '+
                ' 	FROM '+
                ' 		"SBO_GTO_PRD"."RSD_PRECO_COMPRA" XA '+
                ' ) M ON M."ItemCode" = VD.CPROD '+
                ' WHERE '+ 
                '     V.IDEMPRESA = ? AND '+ 
                '     V.DTHORAFECHAMENTO  BETWEEN \''+dataInicio+' 00:00:00\' AND \'' + dataFinal +' 23:59:59\' AND '+ 
                '     VD.VENDEDOR_MATRICULA = \''+matFuncionario+'\'  ';

	var linhas = api.sqlQuery(query, idEmpresa);
	
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				
				"QTD_PRODUTO": det.QTD_PRODUTO,
				"VRTOTALVENDA": det.VRTOTALVENDA,
				"VRCUSTOTOTAL": det.VRCUSTOTOTAL,
				"QTD_VENDAS": det.QTD_VENDAS
			
		};

	}

	return docLine;
}

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
    
	var query2 = 'SELECT DISTINCT T.IDEMPRESA, '+
    ' T.NOFANTASIA, '+ 
    ' T.VENDEDOR_MATRICULA, '+ 
	' T.VENDEDOR_NOME '+
	' FROM ( '+ 
    ' SELECT DISTINCT '+ 
    ' VWV.VENDEDOR_MATRICULA, '+ 
    ' VWV.VENDEDOR_NOME, '+ 
    ' VWV.IDEMPRESA AS IDEMPRESA, '+ 
    ' E.NOFANTASIA '+
    ' FROM "QUALITY_CONC_HML"."VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO" VWV '+ 
	' INNER JOIN "QUALITY_CONC_HML".EMPRESA E ON VWV.IDEMPRESA = E.IDEMPRESA '+ 
	' INNER JOIN "QUALITY_CONC_HML".PRODUTO tbps ON VWV.CPROD = tbps.IDPRODUTO '+ 
	' INNER JOIN "QUALITY_CONC_HML".FUNCIONARIO F ON VWV.IDOPERADOR = F.IDFUNCIONARIO '+
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
        query2 = query2 + ' And  (tbps.DSNOME LIKE \'%'+produto+'%\' OR tbps.NUCODBARRAS=\''+produto+'\' ) ';
    }
    
    if(uf > 0){
        query2 = query2 + ' AND VWV.SGUF=\''+uf+'\''; 
    }
    
    if (idFornecedor) {
		query2 = query2 + ' And  VWV.IDRAZAO_SOCIAL_FORNECEDOR IN (\'' + idFornecedor + '\') ';
	}
	
	if (idgrupograde) {
	 var DSgrupoGrade = '';
	 if(idgrupograde === '1'){
	     DSgrupoGrade = 'Verão';
	 }else if(idgrupograde === '2'){
	     DSgrupoGrade = 'Calçados/Acessórios';
	 }else if(idgrupograde === '3'){
	     DSgrupoGrade = 'Cama/Mesa/Banho';
	 }else if(idgrupograde === '4'){
	     DSgrupoGrade = 'Utilidades Do Lar';
	 }else if(idgrupograde === '5'){
	     DSgrupoGrade = 'Diversos';
	 }else if(idgrupograde === '6'){
	     DSgrupoGrade = 'Artigos Esportivos';
	 }else if(idgrupograde === '7'){
	     DSgrupoGrade = 'Cosméticos';
	 }else if(idgrupograde === '8'){
	     DSgrupoGrade = 'Acessórios';
	 }else if(idgrupograde === '9'){
	     DSgrupoGrade = 'Peças Íntimas';
	 }else if(idgrupograde === '10'){
	     DSgrupoGrade = 'Inverno';
	 }
	
		query2 = query2 + ' And  VWV.GRUPO IN (\'' + DSgrupoGrade + '\') ';
	}
	
	if (idgrade) {
		query2 = query2 + ' And  VWV.IDSUBGRUPO IN (' + idgrade + ') ';
	}
	
	if(idMarcaProduto){
	    query2 = query2 + ' And  VWV.IDMARCA IN (' + idMarcaProduto + ') ';
	}
   
    
    query2 = query2 + ' ) AS T GROUP BY T.IDEMPRESA, T.VENDEDOR_MATRICULA,T.VENDEDOR_NOME, T.NOFANTASIA ORDER BY T.IDEMPRESA ';

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
				"QUANTIDADES":obterQuantidadeSoma(dataPesqInicial,dataPesqFinal,registro.VENDEDOR_MATRICULA,3)
			
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