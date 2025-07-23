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

function obterEntradaProduto(idProduto, dataInicio, dataFim) {

    var query = ' select "Cod.Item", '+
                ' ifnull(sum("Entradas"),0) as qtdEntrada, '+
                ' ifnull(sum("Saidas"),0) as qtdSaidas'+
                '    from '+
                '        SBO_GTO_PRD.IS_ENT_SAI_DETALHADO '+ 
                '        where  "Cod.Item"=? '+
                ' AND ("Data" BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + dataFim + ' 23:59:59\') '+
                '  group by "Cod.Item"';
    
    var linhas = api.sqlQuery(query, idProduto);
    var lines = [];
    
    if (linhas.length > 0){
    
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	
        			"QTDENTRADA": det.QTDENTRADA,
        			"QTDSAIDAS": det.QTDSAIDAS,
        			"TOTALCOMPRADO": det.TOTALCOMPRADO
        	
        	};
        
        	lines.push(docLine);
        }
    }else{
        var docLine = {
        	
        			"QTDENTRADA": '0',
        			"QTDSAIDAS":'0',
        			"TOTALCOMPRADO":'0'
        	
        	};
        
        	lines.push(docLine);
    }

    return docLine;
}

function obterVouchersProduto(idProduto, dataInicio, dataFim) {

    var query = ' select t2.idproduto, ifnull(sum(t2.qtd),0) as qtdVoucher '+
                '    from '+
                '        QUALITY_CONC_HML.resumovoucher t1 '+ 
                '        inner join QUALITY_CONC_HML.detalhevoucher t2 on t1.idvoucher = t2.idvoucher '+ 
                '        where  t2.idproduto=? '+
                ' AND (t1.DTINVOUCHER BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + dataFim + ' 23:59:59\') '+
                ' group by t2.idproduto';
    
    var linhas = api.sqlQuery(query, idProduto);
    var lines = [];
    
    if (linhas.length > 0){
    
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	
        			"QTDVOUCHERS": det.QTDVOUCHER
        	
        	};
        
        	lines.push(docLine);
        }
    }else{
        var docLine = {
        	
        			"QTDVOUCHERS": '0'
        	
        	};
        
        	lines.push(docLine);
    }

    return docLine;
}

function obterVendaPeriodo(IdProduto,dataPesquisaInicio, dataPesquisaFim){
    var query = ' select '+
        '   ifnull(sum(t2.qtd),0) as QTD, '+
        '   round(t2.VUNCOM,2)as VUNCOM '+
        ' from QUALITY_CONC_HML.vendadetalhe t2 '+
        '  inner join QUALITY_CONC_HML.venda t1 on t1.idvenda=t2.idvenda '+
        ' where  t2.cprod=? and t1.stcancelado =\'False\' and '+
        '  t1.dthorafechamento between \''+dataPesquisaInicio+' 00:00:00\' and \''+dataPesquisaFim+ ' 23:59:00\''+
        ' group by t2.VUNCOM'; 
    
    var linhas = api.sqlQuery(query, IdProduto);
    
   if (linhas.length > 0){
    
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	    "QTDVENDAS": det.QTD,
        	    "VUNCOM": det.VUNCOM
        	};
        }
    }else{
        var docLine = {
        	    "QTDVENDAS": '0',
        	    "VUNCOM": '0'
        	};
        
        }

    return docLine;
    
}

function obterPedidoProduto(IdProduto,dataPesquisaInicio, dataPesquisaFim){
    var query = ' SELECT' +
    '   QTDESOLICITADA,' +
	'   QTDEENTREGUE,' +
	'   PRECOUNIT' +
    '   FROM "SBO_GTO_PRD"."IS_PEDIDOS_DE_COMPRA"' +
    '   WHERE CODPRODUTO=?' +
    '      AND DATADOPEDIDO <=\'' + dataPesquisaFim +' 23:59:59\' ORDER BY PEDIDO ASC ' ;

    var linhas = api.sqlQuery(query, IdProduto);
    
   if (linhas.length > 0){
    
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	    "QTDESOLICITADA": det.QTDESOLICITADA,
        	    "QTDEENTREGUE": det.QTDEENTREGUE,
        	    "PRECOUNIT": det.PRECOUNIT
        	};
        }
    }else{
        var docLine = {
        	    "QTDESOLICITADA": '0',
        	    "QTDEENTREGUE": '0',
        	    "PRECOUNIT": '0'
        	};
        
        }

    return docLine;
    
}

function obterEstoqueLoja1(idProduto) {

    var query = ' select '+
                '   ESTOQUE101 '+
                ' from '+
                '   SBO_GTO_PRD.IS_ESTOQUE_TOTAL '+ 
                ' where  "CODPRODUTO"=? ';
               
    
    var linhas = api.sqlQuery(query, idProduto);
    var lines = [];
    
    if (linhas.length > 0){
    
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	
        			"ESTOQUE101": det.ESTOQUE101
			};
        
        	lines.push(docLine);
        }
    }else{
        var docLine = {
        	
        			"ESTOQUE101": '0'
        	
        	};
        
        	lines.push(docLine);
    }

    return docLine;
}



function fnHandleGet(byId) {
    
    var idDaMarca = $.request.parameters.get("idMarca");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio"); 
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim"); 
    var dataPesquisaInicioB = $.request.parameters.get("dataPesquisaInicio"); 
    var dataPesquisaFimB = $.request.parameters.get("dataPesquisaFim"); 
    var dataPesquisaInicioC = $.request.parameters.get("dataPesquisaInicio"); 
    var dataPesquisaFimC = $.request.parameters.get("dataPesquisaFim"); 
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var uf = $.request.parameters.get("uf");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var produto = $.request.parameters.get("descricaoProduto");
    var idgrupograde = $.request.parameters.get("idGrupoGrade");
    var idgrade = $.request.parameters.get("idGrade");
    var idMarcaProduto = $.request.parameters.get("idMarcaProduto");
    
 
	var query = ' SELECT DISTINCT ' +
		'   v2.GRUPO,' +
		'   v2.SUBGRUPO,' +
		'   v2.MARCA,' +
		'   v3.NUCODBARRAS,' +
		'   V2.CPROD,' +
		'   v3.DSNOME,' +
		'   SUM(v2.QTD) AS QTD,' +
		'   SUM(v2.VRTOTALLIQUIDO) AS VRTOTALLIQUIDO,' +
		'   SUM((v2.QTD*v2.PRECO_COMPRA)) AS TOTALCUSTO,' +
		'   ROUND(SUM((v2.QTD*v2.VUNCOM)),2) AS TOTALBRUTO,' +
		'   SUM((v2.VDESC)) AS TOTALDESCONTO' +
	    ' FROM ' +
		'   "VAR_DB_NAME".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO v2' +
		'   INNER JOIN "VAR_DB_NAME".PRODUTO v3 ON V2.CPROD = V3.IDPRODUTO' +
		' WHERE ' +
		'	1 = ? ';


	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (v2.DTHORAFECHAMENTO BETWEEN \''+dataPesquisaInicio+' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    
    
    if (produto) {
        query = query + ' And  (v3.DSNOME LIKE \'%'+produto+'%\' OR v3.NUCODBARRAS=\''+produto+'\' ) ';
    }
    
    
    if (idFornecedor) {
		query = query + ' And  v2.IDRAZAO_SOCIAL_FORNECEDOR IN (\'' + idFornecedor + '\') ';
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
	
		query = query + ' And  v2.GRUPO IN (\'' + DSgrupoGrade + '\') ';
	}
	
	if (idgrade) {
		query = query + ' And  v2.IDSUBGRUPO IN (\'' + idgrade + '\') ';
	}
	
	if(idMarcaProduto){
	    query = query + ' And  v2.IDMARCA IN (\'' + idMarcaProduto + '\') ';
	}

    query = query + ' GROUP BY v2.GRUPO, v2.SUBGRUPO, v2.MARCA, v3.NUCODBARRAS, v3.DSNOME, V2.CPROD   ';
    query = query + ' ORDER BY V2.CPROD ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
	var response = api.sqlQueryPage(query, request, 1);
	var data = [];
   
	for (var i = 0; i < response.data.length; i++) { 

		var registro = response.data[i];
		
		var TotalComprado = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("Total Comprado")),0) FROM SBO_GTO_PRD.IS_ENT_SAI_DETALHADO WHERE "Cod.Item" = ? ', registro.CPROD);

		var vendaMarca = {
			"vendaMarca": {
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
				"TOTALCOMPRADO":TotalComprado
			},
			"qtdVoucher":obterVouchersProduto(registro.CPROD, '2021-01-01',dataPesquisaFim),
			"qtdEntradaSaida":obterEntradaProduto(registro.CPROD, '2021-01-01',dataPesquisaFim),
			"qtdVendaB":obterVendaPeriodo(registro.CPROD,dataPesquisaInicioB,dataPesquisaFimB),
			"qtdVendaC":obterVendaPeriodo(registro.CPROD,dataPesquisaInicioC,dataPesquisaFimC),
			"pedido":obterPedidoProduto(registro.CPROD,dataPesquisaInicio,dataPesquisaFimC),
			"estoque101":obterEstoqueLoja1(registro.CPROD)
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