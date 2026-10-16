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

function obterVendaSecaoCalcados(dtInicio, dtFim, idEmpresa, idFunc) {

	var query = ' SELECT DISTINCT ' +
		'T1.VENDEDOR_MATRICULA, ' +
		'T1.VENDEDOR_NOME, ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		's.TPSECAO AS TPSECAOCALC,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOCALC ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_PRD"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_PRD"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.VENDEDOR_MATRICULA= ' + idFunc + '  ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'CALCADOS\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 1 ' +
		'GROUP BY T1.VENDEDOR_MATRICULA, T1.VENDEDOR_NOME, T3.IDEMPRESA, T3.NOFANTASIA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	
	if(linhas.length>0){
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
	}else{
    		var docLine1 = {
    			"venda-calcados": {
            		"VRTOTALLIQUIDOCALC":0
            	}
    		};
    
    		lines.push(docLine1);
	}

	return lines;
}

function obterVendaSecaoFeminina(dtInicio, dtFim, idEmpresa, idFunc) {

	var query = ' SELECT DISTINCT ' +
		'T1.VENDEDOR_MATRICULA, ' +
		'T1.VENDEDOR_NOME, ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		's.TPSECAO AS TPSECAOFEMININO,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOFEMININO ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_PRD"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_PRD"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.VENDEDOR_MATRICULA= ' + idFunc + '  ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'FEMININA\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 1 ' +
		'GROUP BY T1.VENDEDOR_MATRICULA, T1.VENDEDOR_NOME, T3.IDEMPRESA, T3.NOFANTASIA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	
	if(linhas.length>0){
    	for (var i = 0; i < linhas.length; i++) {
    		var det = linhas[i];
    
    		var docLine = {
    			"venda-feminina": {
            		"TPSECAOFEMININO":det.TPSECAO,
            		"VRTOTALLIQUIDOFEMININO":det.VRTOTALLIQUIDO
            	}
    		};
    
    		lines.push(docLine);
    	}
	}else{
    		var docLine1 = {
    			"venda-feminina": {
            		"VRTOTALLIQUIDOFEMININO":0
            	}
    		};
    
    		lines.push(docLine1);
	}

	return lines;
}

function obterVendaSecaoMasculina(dtInicio, dtFim, idEmpresa, idFunc) {

	var query = ' SELECT DISTINCT ' +
		'T1.VENDEDOR_MATRICULA, ' +
		'T1.VENDEDOR_NOME, ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		's.TPSECAO AS TPSECAOMASC,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOMASC ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_PRD"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_PRD"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.VENDEDOR_MATRICULA= ' + idFunc + '  ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'MASCULINA\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 1 ' +
		'GROUP BY T1.VENDEDOR_MATRICULA, T1.VENDEDOR_NOME, T3.IDEMPRESA, T3.NOFANTASIA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	
	if(linhas.length>0){
	
    	for (var i = 0; i < linhas.length; i++) {
    		var det = linhas[i];
    
    		var docLine = {
    			"venda-masculina": {
            		"TPSECAOMASCULINO":det.TPSECAOMASC,
            		"VRTOTALLIQUIDOMASCULINO":det.VRTOTALLIQUIDOMASC
            	}
    		};
    
    		lines.push(docLine);
    	}
	}else{
    		var docLine1 = {
    			"venda-masculina": {
            		"VRTOTALLIQUIDOMASCULINO":0
            	}
    		};
    
    		lines.push(docLine1);
	}

	return lines;
}

function obterVendaSecaoInfantil(dtInicio, dtFim, idEmpresa, idFunc) {

	var query = ' SELECT DISTINCT ' +
		'T1.VENDEDOR_MATRICULA, ' +
		'T1.VENDEDOR_NOME, ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		's.TPSECAO AS TPSECAOINFANT,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOINFANT ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_PRD"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_PRD"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.VENDEDOR_MATRICULA= ' + idFunc + '  ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'INFANTIL\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 1 ' +
		'GROUP BY T1.VENDEDOR_MATRICULA, T1.VENDEDOR_NOME, T3.IDEMPRESA, T3.NOFANTASIA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	
	if(linhas.length>0){
    	for (var i = 0; i < linhas.length; i++) {
    		var det = linhas[i];
    
    		var docLine = {
    			"venda-infantil": {
            		"TPSECAOINFANTIL":det.TPSECAOINFANT,
            		"VRTOTALLIQUIDOINFANTIL":det.VRTOTALLIQUIDOINFANT
            	}
    		};
    
    		lines.push(docLine);
    	}
	}else{
    		var docLine1 = {
    			"venda-infantil": {
            		"VRTOTALLIQUIDOINFANTIL":0
            	}
    		};
    
    		lines.push(docLine1);
	}

	return lines;
}

function obterVendaSecaoCMB(dtInicio, dtFim, idEmpresa, idFunc) {

	var query = ' SELECT DISTINCT ' +
		'T1.VENDEDOR_MATRICULA, ' +
		'T1.VENDEDOR_NOME, ' +
		'T3.IDEMPRESA,' +
		'T3.NOFANTASIA,' +
		's.TPSECAO AS TPSECAOINFANT,' +
		'ROUND(SUM(T1.ICMS_VBC),2) AS VRTOTALLIQUIDOINFANT ' +
        'FROM ' +
		'"VAR_DB_NAME".VENDADETALHE T1 ' +
		'INNER JOIN "VAR_DB_NAME".VENDA T2 ON T1.IDVENDA = T2.IDVENDA ' +
		'INNER JOIN "VAR_DB_NAME".EMPRESA T3 ON T2.IDEMPRESA = T3.IDEMPRESA ' +
		'INNER JOIN "SBO_GTO_PRD"."OITM" A ON A."ItemCode" = T1.CPROD ' +
		'LEFT OUTER JOIN "SBO_GTO_PRD"."OITB" G ON G."ItmsGrpCod" = A."ItmsGrpCod" ' +
		'LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA S ON G."ItmsGrpCod" = S.IDSUBGRUPOESTRUTURA ' +
		'LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON S.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA ' +
		'WHERE ' +
		'T3.IDEMPRESA = ? ' +
		'AND T1.VENDEDOR_MATRICULA= ' + idFunc + '  ' +
		'AND T1.STCANCELADO <> \'True\' ' +
		'AND T2.STCANCELADO <> \'True\' ' +
		'AND (T2.DTHORAFECHAMENTO BETWEEN \'' + dtInicio + ' 00:00:00\' AND \'' + dtFim + ' 23:59:59\') ' +
		'AND S.TPSECAO = \'CMB\' ' +
		'AND T2.NFE_INFNFE_IDE_TPAMB = 1 ' +
		'GROUP BY T1.VENDEDOR_MATRICULA, T1.VENDEDOR_NOME, T3.IDEMPRESA, T3.NOFANTASIA, S.TPSECAO ' +
		'ORDER BY T3.IDEMPRESA ';

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	
	if(linhas.length>0){
    	for (var i = 0; i < linhas.length; i++) {
    		var det = linhas[i];
    
    		var docLine = {
    			"venda-cmb": {
            		"TPSECAOCMB":det.TPSECAOCMB,
            		"VRTOTALLIQUIDOCMB":det.VRTOTALLIQUIDOCMB
            	}
    		};
    
    		lines.push(docLine);
    	}
	}else{
    		var docLine1 = {
    			"venda-cmb": {
            		"VRTOTALLIQUIDOCMB":0
            	}
    		};
    
    		lines.push(docLine1);
	}

	return lines;
}

function fnHandleGet(byId) {
    
    var idMetaLoja = $.request.parameters.get("idMetaLoja");
    var idMetaColab = $.request.parameters.get("idMetaColab");
    var idFunc = $.request.parameters.get("idFunc");
    var idEmp = $.request.parameters.get("idEmp");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var NoSecaoMetaLoja = $.request.parameters.get("noSecaoMetaLoja");

    var query =  ' SELECT ' +
        '   tbdp.IDMETASCOLABORADOR, ' +
        '   tbdp.DTMETAINICIO, ' +
        '   tbdp.DTMETAFIM, ' +
        '   TO_VARCHAR( tbdp.DTMETAINICIO, \'YYYY-MM-DD\') AS DTMETAINICIOFORMAT, ' +
        '   TO_VARCHAR( tbdp.DTMETAFIM, \'YYYY-MM-DD\') AS DTMETAFIMFORMAT, ' +
        '   tbdp.IDMETASLOJA, ' +
        '   tbdp.IDEMPRESA, ' +
        '   tbdp.IDFUNCIONARIO, ' +
        '   tbdp.NOSECAO, ' +
        '   tbdp.VRMETAVENDAGERAL, ' +
        '   tbdp.PERCMETAVENDAGERAL, ' +
        '   tbdp.VRMETACOLABORADOR, ' +
        '   tbdp.PERCMETACOLABORADOR, ' +
        '   tbdp.STATIVO, ' +
        '   tbdp.DTCADASTRO, ' +
        '   FUNC.NOFUNCIONARIO, ' +
        '   FUNC.DSFUNCAO, ' +
        '   EMP.NOFANTASIA ' +
        ' FROM ' +
        '	"VAR_DB_NAME".METASCOLABORADORES tbdp ' +
        '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO FUNC ON tbdp.IDFUNCIONARIO = FUNC.IDFUNCIONARIO  ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA EMP ON tbdp.IDEMPRESA = EMP.IDEMPRESA  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND tbdp.STATIVO = \'True\' ';
    if ( byId ) {
        query = query + ' And  tbdp.IDMETASCOLABORADOR = \'' + byId + '\' ';
    }
    if ( NoSecaoMetaLoja ) {
        query = query + ' And  tbdp.NOSECAO = \'' + NoSecaoMetaLoja + '\' ';
    }
    if ( idMetaColab ) {
        query = query + ' And  tbdp.IDMETASCOLABORADOR = \'' + idMetaColab + '\' ';
    }
    if ( idMetaLoja ) {
        query = query + ' And  tbdp.IDMETASLOJA = \'' + idMetaLoja + '\' ';
    }
    if ( idFunc ) {
        query = query + ' And  RP.IDFUNCIONARIO = \'' + idFunc + '\' ';
    }
    if ( idEmp ) {
        query = query + ' And  tbdp.IDEMPRESA = \'' + idEmp + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (tbdp.DTCADASTRO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (tbdp.DTMETAINICIO = \'' + dataPesquisaInicio + '\' AND  tbdp.DTMETAFIM = \'' + dataPesquisaFim + '\') ';
    }

    query = query + ' ORDER BY tbdp.NOSECAO ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
	var response = api.sqlQueryPage(query, request, 1);
	var data = [];
   
	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var metasColaborador = {
			"metasColaborador": {
			    "IDMETASCOLABORADOR": registro.IDMETASCOLABORADOR,
                "DTMETAINICIO": registro.DTMETAINICIO,
                "DTMETAFIM": registro.DTMETAFIM,
                "IDMETASLOJA": registro.IDMETASLOJA,
                "IDEMPRESA": registro.IDEMPRESA,
                "IDFUNCIONARIO": registro.IDFUNCIONARIO,
                "NOSECAO": registro.NOSECAO,
                "VRMETAVENDAGERAL": registro.VRMETAVENDAGERAL,
                "PERCMETAVENDAGERAL": registro.PERCMETAVENDAGERAL,
                "VRMETACOLABORADOR": registro.VRMETACOLABORADOR,
                "PERCMETACOLABORADOR": registro.PERCMETACOLABORADOR,
                "STATIVO": registro.STATIVO,
                "DTCADASTRO": registro.DTCADASTRO,
                "NOFUNCIONARIO": registro.NOFUNCIONARIO,
                "DSFUNCAO": registro.DSFUNCAO,
                "NOFANTASIA": registro.NOFANTASIA
			},
			
			"vendasecaocalcados": obterVendaSecaoCalcados(registro.DTMETAINICIOFORMAT,registro.DTMETAFIMFORMAT,registro.IDEMPRESA,registro.IDFUNCIONARIO),
			"vendasecaofeminina": obterVendaSecaoFeminina(registro.DTMETAINICIOFORMAT,registro.DTMETAFIMFORMAT,registro.IDEMPRESA,registro.IDFUNCIONARIO),
			"vendasecaomasculina": obterVendaSecaoMasculina(registro.DTMETAINICIOFORMAT,registro.DTMETAFIMFORMAT,registro.IDEMPRESA,registro.IDFUNCIONARIO),
			"vendasecaoinfantil": obterVendaSecaoInfantil(registro.DTMETAINICIOFORMAT,registro.DTMETAFIMFORMAT,registro.IDEMPRESA,registro.IDFUNCIONARIO),
			"vendasecaocmb": obterVendaSecaoCMB(registro.DTMETAINICIOFORMAT,registro.DTMETAFIMFORMAT,registro.IDEMPRESA,registro.IDFUNCIONARIO)
		};

		data.push(metasColaborador);

	}

	response.data = data;

	return response;
}

function fnHandlePost(){
    
    var conn = $.db.getConnection();
  
    var query = 'INSERT INTO "VAR_DB_NAME"."METASCOLABORADORES" ' + 
		" ( " +
		    ' "IDMETASCOLABORADOR", ' +
            ' "DTMETAINICIO", ' +
            ' "DTMETAFIM", ' +
            ' "IDMETASLOJA", ' +
            ' "IDEMPRESA", ' +
            ' "IDFUNCIONARIO", ' +
            ' "NOSECAO", ' +
            ' "VRMETAVENDAGERAL", ' +
            ' "PERCMETAVENDAGERAL", ' +
            ' "VRMETACOLABORADOR", ' +
            ' "PERCMETACOLABORADOR", ' +
            ' "STATIVO", ' +
            ' "DTCADASTRO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,now())';
  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
		
	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDMETASCOLABORADOR")),0) + 1 FROM "VAR_DB_NAME"."METASCOLABORADORES" WHERE 1 = ? ', 1);
		
		for (var j = 0; j < registro.METASDETALHE.length; j++) {
		    
		    var idMetaColab = queryId;
		 
            pStmt.setInt(1,idMetaColab);
            pStmt.setDate(2, registro.DTMETAINICIO); 
            pStmt.setDate(3, registro.DTMETAFIM); 
            pStmt.setInt(4, registro.IDMETASLOJA);   
            pStmt.setInt(5, registro.IDEMPRESA);
            pStmt.setInt(6, registro.METASDETALHE[j].IDColab);
            pStmt.setString(7, registro.NOSECAO);
            pStmt.setFloat(8, registro.VRMETAVENDAGERAL);
            pStmt.setFloat(9, registro.PERCMETAVENDAGERAL);
            pStmt.setFloat(10, registro.VRMETACOLABORADOR);
            pStmt.setFloat(11, registro.PERCMETACOLABORADOR);
            pStmt.setString(12, registro.STATIVO);
        	
            pStmt.execute();
            
            queryId = queryId + 1;
		}
		
	conn.commit();
	
    	var queryDadosMeta = 'SELECT COUNT(IDMETASCOLABORADOR) AS QTDCOLAB, VRMETAVENDAGERAL, PERCMETAVENDAGERAL '+
        ' FROM "VAR_DB_NAME"."METASCOLABORADORES" WHERE IDMETASLOJA = ? AND NOSECAO = \'' + registro.NOSECAO + '\' AND STATIVO = \'True\' GROUP BY VRMETAVENDAGERAL, PERCMETAVENDAGERAL';
        
        var dadosMetas = api.sqlQuery(queryDadosMeta,registro.IDMETASLOJA);
        
        var countmetas = parseInt(dadosMetas[0].QTDCOLAB);
        var vrmetas = parseFloat(dadosMetas[0].VRMETAVENDAGERAL);
        var percmetas = parseFloat(dadosMetas[0].PERCMETAVENDAGERAL);
        
        var novovrmeta = vrmetas/countmetas;
        var novopercmeta = percmetas/countmetas;
        
        var queryAtualizaMetas = 'UPDATE "VAR_DB_NAME"."METASCOLABORADORES" SET ' + 
        ' "VRMETACOLABORADOR" =  ?, ' +
        ' "PERCMETACOLABORADOR" =  ? ' +
        ' WHERE "IDMETASLOJA" =  ? AND NOSECAO = \'' + registro.NOSECAO + '\' AND STATIVO = \'True\' ';
        
        var pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaMetas));
        
        pStmt2.setFloat(1, novovrmeta);
        pStmt2.setFloat(2, novopercmeta);
        pStmt2.setInt(3, registro.IDMETASLOJA);
        pStmt2.execute();
        pStmt2.close();
        conn.commit();   

	}
    
    pStmt.close();

	
    return {
	    "msg": registro.STATIVO
	};
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
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
       
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}