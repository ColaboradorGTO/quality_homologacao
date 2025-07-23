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

function obterEntradaProduto(DSgrupoGrade, idgrade, dataInicio, dataFim) {

    var query = ' select '+
                ' ifnull(sum("Entradas"),0) as qtdEntrada, '+
                ' ifnull(sum("Saidas"),0) as qtdSaidas,'+
                ' ifnull(sum("Total Comprado"),0) as totalComprado'+
                '    from '+
                '        SBO_GTO_PRD.IS_ENT_SAI_DETALHADO '+ 
                '        where  1=? and "Grupo" = \'' + DSgrupoGrade +'\' and "CodSubGrupo" = \'' + idgrade +'\' '+
                ' AND ("Data" BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + dataFim + ' 23:59:59\') '+
                ' group by "Grupo","CodSubGrupo"';
    //return query;
    
    var linhas = api.sqlQuery(query, 1);
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



function obterPosicaoVendasAnterior(idDaMarca,dataPesquisaInicio,idgrupograde,idgrade){
    
    var query = ' SELECT DISTINCT ' +
	    '   v2.IDGRUPOEMPRESARIAL,'+
		'   v2.GRUPO,' +
		'   v2.SUBGRUPO,' +
		'   v2.IDSUBGRUPO,' +
		'   SUM(v2.QTD) AS QTD' +
		' FROM ' +
		'   "VAR_DB_NAME".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO v2' +
		' WHERE ' +
	    '  v2.IDGRUPOEMPRESARIAL = ? ';
	

	if(dataPesquisaInicio) {
            query = query + ' AND (v2.DTHORAFECHAMENTO BETWEEN \'2021-01-01 00:00:00\' AND \'' + dataPesquisaInicio + ' 00:00:00\')';
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
		query = query + ' And  v2.IDSUBGRUPO IN (' + idgrade + ') ';
	}
	
	query = query + ' GROUP BY v2.IDGRUPOEMPRESARIAL, v2.GRUPO, v2.SUBGRUPO , v2.IDSUBGRUPO ';
    query = query + ' ORDER BY v2.IDGRUPOEMPRESARIAL ';
    
    var linhas = api.sqlQuery(query, idDaMarca);
    var lines = [];
    
    
    
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	
        			"QTDVENDAS": det.QTD
        	
        	};
        
        	lines.push(docLine);
        }
    return docLine;
}

function obterPosicaoVouchersAnterior(idDaMarca,dataPesquisaInicio,idgrupograde,idgrade){
    
    var query = ' SELECT DISTINCT ' +
	    '   v2.IDGRUPOEMPRESARIAL,'+
		'   v2.GRUPO,' +
		'   v2.SUBGRUPO,' +
		'   v2.IDSUBGRUPO,' +
		'   SUM(v2.QTD) AS QTD' +
		' FROM ' +
		'   "VAR_DB_NAME".VW_VOUCHERS_PRODUTO_GRUPO_SUBGRUPO v2' +
		' WHERE ' +
	    '  v2.IDGRUPOEMPRESARIAL = ? ';
	

	if(dataPesquisaInicio) {
            query = query + ' AND (v2.DTINVOUCHER BETWEEN \'2021-01-01 00:00:00\' AND \'' + dataPesquisaInicio + ' 00:00:00\')';
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
		query = query + ' And  v2.IDSUBGRUPO IN (' + idgrade + ') ';
	}
	
	query = query + ' GROUP BY v2.IDGRUPOEMPRESARIAL, v2.GRUPO, v2.SUBGRUPO , v2.IDSUBGRUPO ';
    query = query + ' ORDER BY v2.IDGRUPOEMPRESARIAL ';
    
    var linhas = api.sqlQuery(query, idDaMarca);
    var lines = [];
    
    
    
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	
        			"QTDVOUCHERS": det.QTD
        	
        	};
        
        	lines.push(docLine);
        }
    return docLine;
}

function obterPosicaoEstoqueAnterior(idDaMarca,dataPesquisaInicio,idgrupograde,idgrade){
    
    var query = ' SELECT DISTINCT '+    
                ' SUM(v2."Entradas") as QTDCOMPRA'+
                ' FROM ' +    
                ' sbo_gto_prd.IS_ENT_SAI_DETALHADO v2 '+ 
                ' WHERE  v2."CodGrupoEmpresarial" = ?'+
                ' AND (v2."Data" < \''+dataPesquisaInicio + ' 00:00:00\')'+ 
                ' And  v2."Grupo" = \''+idgrupograde+'\''+  
                ' And  v2."CodSubGrupo" = \''+idgrade+'\'';
                
        
    
    var linhas = api.sqlQuery(query, idDaMarca);
    var lines = [];
   
    
    
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	
        			"QTDESTOQUE": det.QTDCOMPRA
        	
        	};
        
        	lines.push(docLine);
        }
    return docLine;
}

function obterPosicaoVouchersAtual(idDaMarca,dataPesquisaInicio,dataPesquisaFim,idgrupograde,idgrade){
    
    var query = ' SELECT DISTINCT ' +
	    '   v2.IDGRUPOEMPRESARIAL,'+
		'   v2.GRUPO,' +
		'   v2.SUBGRUPO,' +
		'   v2.IDSUBGRUPO,' +
		'   IFNULL(SUM(v2.QTD),0) AS QTD' +
		' FROM ' +
		'   "VAR_DB_NAME".VW_VOUCHERS_PRODUTO_GRUPO_SUBGRUPO v2' +
		' WHERE ' +
	    '  v2.IDGRUPOEMPRESARIAL = ? ';
	

	if(dataPesquisaInicio) {
            query = query + ' AND (v2.DTINVOUCHER BETWEEN \'' +dataPesquisaInicio+' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:00\')';
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
		query = query + ' And  v2.IDSUBGRUPO IN (' + idgrade + ') ';
	}
	
	query = query + ' GROUP BY v2.IDGRUPOEMPRESARIAL, v2.GRUPO, v2.SUBGRUPO , v2.IDSUBGRUPO ';
    query = query + ' ORDER BY v2.IDGRUPOEMPRESARIAL ';
    
    var linhas = api.sqlQuery(query, idDaMarca);
    var lines = [];
    
    
    if (linhas.length > 0){
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	
        			"QTDVOUCHERS": det.QTD
        	
        	};
        
        	lines.push(docLine);
        }
    }else{
        var docLine = {
        	
        			"QTDVOUCHERS": "0"
        	
        	};
        
        	lines.push(docLine);
    }
    return docLine;
}

function obterPosicaoEstoqueAtual(idDaMarca,dataPesquisaInicio,dataPesquisaFim,idgrupograde,idgrade){
    
    var query = ' SELECT DISTINCT '+    
                ' IFNULL(SUM(v2."Entradas"),0) as QTDCOMPRA'+
                ' FROM ' +    
                ' sbo_gto_prd.IS_ENT_SAI_DETALHADO v2 '+ 
                ' WHERE  v2."CodGrupoEmpresarial" = ?'+
                ' AND (v2."Data" BETWEEN \'' +dataPesquisaInicio+' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:00\')'+
                ' And  v2."Grupo" = \''+idgrupograde+'\''+  
                ' And  v2."CodSubGrupo" = \''+idgrade+'\'';
                
        
    
    var linhas = api.sqlQuery(query, idDaMarca);
    var lines = [];
   
    
    
        for (var i = 0; i < linhas.length; i++) {
        	var det = linhas[i];
        
        	var docLine = {
        	
        			"QTDESTOQUE": det.QTDCOMPRA
        	
        	};
        
        	lines.push(docLine);
        }
    return docLine;
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
    
    
    const now = new Date(dataPesquisaInicio); // Data de hoje
    const past = new Date(dataPesquisaFim); // Outra data no passado
    const diff = Math.abs(now.getTime() - past.getTime()); // Subtrai uma data pela outra
    const qtdDias = Math.ceil(diff / (1000 * 60 * 60 * 24)); // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).

    
 
	var query = ' SELECT DISTINCT ' +
	    '   v2.IDGRUPOEMPRESARIAL,'+
	    '   v5.DSGRUPOEMPRESARIAL,'+
		'   v2.GRUPO,' +
		'   v2.SUBGRUPO,' +
		'   v2.IDSUBGRUPO,' +
		'   SUM(v2.QTD) AS QTD,' +
		'   SUM(v2.VRTOTALLIQUIDO) AS VRTOTALLIQUIDO,' +
		'   SUM((v2.QTD*v2.PRECO_COMPRA)) AS TOTALCUSTO,' +
		'   ROUND(SUM((v2.QTD*v2.VUNCOM)),2) AS TOTALBRUTO,' +
		'   ROUND(SUM((v2.VDESC)),2) AS TOTALDESCONTO' +
		' FROM ' +
		'   "VAR_DB_NAME".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO v2' +
	    '   INNER JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL v5 on v5.IDGRUPOEMPRESARIAL = v2.IDGRUPOEMPRESARIAL'+
		' WHERE ' +
		'	1 = ? ';

	if (idDaMarca) {
		query = query + ' And  v2.IDGRUPOEMPRESARIAL = \'' + idDaMarca + '\' ';
	}

	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (v2.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
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
		query = query + ' And  v2.IDSUBGRUPO IN (' + idgrade + ') ';
	}
	
	query = query + ' GROUP BY v2.IDGRUPOEMPRESARIAL,v5.DSGRUPOEMPRESARIAL, v2.GRUPO, v2.SUBGRUPO , v2.IDSUBGRUPO ';
    query = query + ' ORDER BY v2.IDGRUPOEMPRESARIAL ';
    
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
				"IDGRUPOEMPRESARIAL": registro.IDGRUPOEMPRESARIAL,
				"DSGRUPOEMPRESARIAL": registro.DSGRUPOEMPRESARIAL,
				"GRUPO": registro.GRUPO,
				"IDSUBGRUPO": registro.IDSUBGRUPO,
				"SUBGRUPO": registro.SUBGRUPO,
				"QTDVENDA": registro.QTD,
				"VRTOTALLIQUIDO": registro.VRTOTALLIQUIDO,
				"TOTALCUSTO": registro.TOTALCUSTO,
				"TOTALBRUTO": registro.TOTALBRUTO,
				"TOTALDESCONTO": registro.TOTALDESCONTO,
				"TOTALCOMPRA":registro.QTDESTOQUECOMPRA,
				"DIASPESQUISADOS":qtdDias
			},
			"posicaoVendasAnterior":obterPosicaoVendasAnterior(registro.IDGRUPOEMPRESARIAL,dataPesquisaInicio,idgrupograde,registro.IDSUBGRUPO),
			"posicaoEstoqueAnterior":obterPosicaoEstoqueAnterior(registro.IDGRUPOEMPRESARIAL,dataPesquisaInicio,registro.GRUPO,registro.IDSUBGRUPO),
			"posicaoVouchersAnterior":obterPosicaoVouchersAnterior(registro.IDGRUPOEMPRESARIAL,dataPesquisaInicio,idgrupograde,registro.IDSUBGRUPO),
			"posicaoEstoqueAtual":obterPosicaoEstoqueAtual(registro.IDGRUPOEMPRESARIAL,dataPesquisaInicio,dataPesquisaFim,idgrupograde,registro.IDSUBGRUPO),
			"posicaoVouchersAtual":obterPosicaoVouchersAtual(registro.IDGRUPOEMPRESARIAL,dataPesquisaInicio,dataPesquisaFim,idgrupograde,registro.IDSUBGRUPO)
			//"qtdVoucher":obterVouchersProduto(registro.CPROD, registro.IDEMPRESA,'2021-01-01',dataPesquisaFim),
			//"qtdEntradaSaida":obterEntradaProduto(registro.GRUPO,registro.IDSUBGRUPO,'2021-01-01',dataPesquisaFim)
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