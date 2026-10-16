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


function obterVendaSecaoFeminina(dtInicio, dtFim, idEmpresa) {

	var query = ' SELECT DISTINCT ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		'GE.DSGRUPOESTRUTURA AS "GRUPO",' +
		's.TPSECAO,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDO ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_TESTE4"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_TESTE4"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'FEMININA\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 2 ' +
		'GROUP BY T3.IDEMPRESA, T3.NOFANTASIA, GE.DSGRUPOESTRUTURA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA, GE.DSGRUPOESTRUTURA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"venda-feminina": {
				"GRUPOFEMININO":det.GRUPO,
        		"TPSECAOFEMININO":det.TPSECAO,
        		"VRTOTALLIQUIDOFEMININO":det.VRTOTALLIQUIDO
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterVendaSecaoMasculina(dtInicio, dtFim, idEmpresa) {

	var query = ' SELECT DISTINCT ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		'GE.DSGRUPOESTRUTURA AS "GRUPOMASC",' +
		's.TPSECAO AS TPSECAOMASC,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOMASC ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_TESTE4"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_TESTE4"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'MASCULINA\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 2 ' +
		'GROUP BY T3.IDEMPRESA, T3.NOFANTASIA, GE.DSGRUPOESTRUTURA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA, GE.DSGRUPOESTRUTURA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"venda-masculina": {
				"GRUPOMASCULINO":det.GRUPOMASC,
        		"TPSECAOMASCULINO":det.TPSECAOMASC,
        		"VRTOTALLIQUIDOMASCULINO":det.VRTOTALLIQUIDOMASC
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterVendaSecaoInfantil(dtInicio, dtFim, idEmpresa) {

	var query = ' SELECT DISTINCT ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		'GE.DSGRUPOESTRUTURA AS "GRUPOINFANT",' +
		's.TPSECAO AS TPSECAOINFANT,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOINFANT ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_TESTE4"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_TESTE4"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'INFANTIL\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 2 ' +
		'GROUP BY T3.IDEMPRESA, T3.NOFANTASIA, GE.DSGRUPOESTRUTURA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA, GE.DSGRUPOESTRUTURA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"venda-infantil": {
				"GRUPOINFANTIL":det.GRUPOINFANT,
        		"TPSECAOINFANTIL":det.TPSECAOINFANT,
        		"VRTOTALLIQUIDOINFANTIL":det.VRTOTALLIQUIDOINFANT
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterVendaSecaoCMB(dtInicio, dtFim, idEmpresa) {

	var query = ' SELECT DISTINCT ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		'GE.DSGRUPOESTRUTURA AS "GRUPOCMB",' +
		's.TPSECAO AS TPSECAOCMB,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOCMB ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_TESTE4"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_TESTE4"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'CMB\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 2 ' +
		'GROUP BY T3.IDEMPRESA, T3.NOFANTASIA, GE.DSGRUPOESTRUTURA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA, GE.DSGRUPOESTRUTURA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"venda-cmb": {
				"GRUPOCMB":det.GRUPOCMB,
        		"TPSECAOCMB":det.TPSECAOCMB,
        		"VRTOTALLIQUIDOCMB":det.VRTOTALLIQUIDOCMB
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterVendaSecaoCalcados(dtInicio, dtFim, idEmpresa) {

	var query = ' SELECT DISTINCT ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		's.TPSECAO AS TPSECAOCALC,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOCALC ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_TESTE4"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_TESTE4"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'CALCADOS\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 2 ' +
		'GROUP BY T3.IDEMPRESA, T3.NOFANTASIA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"venda-calcados": {
        		"TPSECAOCALC":det.TPSECAOCALC,
        		"VRTOTALLIQUIDOCALC":det.VRTOTALLIQUIDOCALC
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterVendaSecaoOutros(dtInicio, dtFim, idEmpresa) {

	var query = ' SELECT DISTINCT ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		's.TPSECAO AS TPSECAOOUTROS,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOPUTROS ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_TESTE4"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_TESTE4"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'OUTROS\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 2 ' +
		'GROUP BY T3.IDEMPRESA, T3.NOFANTASIA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"venda-outros": {
        		"TPSECAOOUTROS":det.TPSECAOOUTROS,
        		"VRTOTALLIQUIDOPUTROS":det.VRTOTALLIQUIDOPUTROS
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {
    
    var idDaMarca = $.request.parameters.get("idMarca");
    var dataPesquisaInicio = $.request.parameters.get("dataInicio"); 
    var dataPesquisaFim = $.request.parameters.get("dataFim"); 

	var query = ' SELECT DISTINCT ' +
		'   T3.IDEMPRESA,' +
		'   T3.NOFANTASIA,' +
		'   ROUND(SUM(T1.NFE_INFNFE_TOTAL_ICMSTOT_VBC),2) AS VRTOTALLIQUIDO' +
        ' FROM ' +
		'   "VAR_DB_NAME".VENDA T1 ' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T1.IDEMPRESA = T3.IDEMPRESA ' +
		' WHERE ' +
		'	1 = ? ' +
		'   AND T1.STCANCELADO <> \'True\' ';

	if (byId) {
		query = query + ' And  T3.IDEMPRESA = \'' + byId + '\' ';
	}
	
	if (idDaMarca > 0) {
		query = query + ' And  T3.IDGRUPOEMPRESARIAL = \'' + idDaMarca + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (T1.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

    query = query + ' GROUP BY T3.IDEMPRESA, T3.NOFANTASIA ';
    query = query + ' ORDER BY T3.IDEMPRESA ';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
	var response = api.sqlQueryPage(query, request, 1);
	var data = [];
   
	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var vendaTotalMarca = {
			"vendaTotalMarca": {
				"IDEMPRESA": registro.IDEMPRESA,
				"NOFANTASIA": registro.NOFANTASIA,
				"VRTOTALLIQUIDO": registro.VRTOTALLIQUIDO
			},
			
			"vendasecaofeminina": obterVendaSecaoFeminina(dataPesquisaInicio,dataPesquisaFim,registro.IDEMPRESA),
			"vendasecaomasculina": obterVendaSecaoMasculina(dataPesquisaInicio,dataPesquisaFim,registro.IDEMPRESA),
			"vendasecaoinfantil": obterVendaSecaoInfantil(dataPesquisaInicio,dataPesquisaFim,registro.IDEMPRESA),
			"vendasecaocmb": obterVendaSecaoCMB(dataPesquisaInicio,dataPesquisaFim,registro.IDEMPRESA),
			"vendasecaocalcados": obterVendaSecaoCalcados(dataPesquisaInicio,dataPesquisaFim,registro.IDEMPRESA),
			"vendasecaooutros": obterVendaSecaoOutros(dataPesquisaInicio,dataPesquisaFim,registro.IDEMPRESA)
		};

		data.push(vendaTotalMarca);

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