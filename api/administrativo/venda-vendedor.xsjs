var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoTotalVendido(numMatricula, idEmpresa, dataPesquisaInicio, dataPesquisaFim) {

	var query = ' SELECT '+
				 '	SUM( tbvd.VRTOTALLIQUIDO) AS TOTALVENDIDOVENDEDOR, '+
				 '	SUM( tbvd.QTD ) AS QTDVENDIDOVENDEDOR '+
				 ' FROM '+
				 '	"VAR_DB_NAME".VENDADETALHE tbvd ' +
				 '	LEFT JOIN "VAR_DB_NAME".VENDA tbv ON  tbvd.IDVENDA = tbv.IDVENDA ' +
				 ' WHERE '+
				 '	tbvd.VENDEDOR_MATRICULA = ?'+
				 '	AND tbv.STCANCELADO = \'False\'  '+
				 '	AND tbvd.STCANCELADO = \'False\'  '+
				 '  AND tbv.IDEMPRESA = \'' + idEmpresa + '\' '+
				 ' AND (tbv.DTHORAFECHAMENTO  BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
				 

	var linhas = api.sqlQuery(query, numMatricula);
	return linhas;

	/*for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"det": {
				"TOTALVENDIDOVENDEDOR": det.TOTALVENDIDOVENDEDOR,
				"QTDVENDIDOVENDEDOR": det.QTDVENDIDOVENDEDOR
			}
		};

		lines.push(docLine);
	}*/

	//return lines;
}

function obterLinhasDoTotalVoucher(numMatricula, idEmpresa, dataPesquisaInicio, dataPesquisaFim) {

	var query = ' SELECT DISTINCT '+
	             'tbv.IDVENDA,'+
				 'tbv.VRRECVOUCHER AS TOTALVOUCHERVENDEDOR '+
				 ' FROM '+
				 '	"VAR_DB_NAME".VENDADETALHE tbvd ' +
				 '	INNER JOIN "VAR_DB_NAME".VENDA tbv ON  tbvd.IDVENDA = tbv.IDVENDA ' +
				 ' WHERE '+
				 '	tbvd.VENDEDOR_MATRICULA = ?'+
				 '	AND tbv.STCANCELADO = \'False\'  '+
				 '	AND tbvd.STCANCELADO = \'False\'  '+
				 '  AND tbv.VRRECVOUCHER > 0 '+
				 '  AND tbv.IDEMPRESA = \'' + idEmpresa + '\' '+
				 ' AND (tbv.DTHORAFECHAMENTO  BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
				 

	var linhas = api.sqlQuery(query, numMatricula);
	
	var vrTotalVoucher = 0;
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
		vrTotalVoucher = vrTotalVoucher + parseFloat(det.TOTALVOUCHERVENDEDOR);
		
	}

	return vrTotalVoucher;
	
}

function fnHandleGet(byId) {

	var idGrupo = $.request.parameters.get("idGrupo");
	var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var query = ' SELECT ' +
        '   DISTINCT tbvd.VENDEDOR_MATRICULA, ' +
        '   tbf.NOLOGIN, ' +
		'	TRIM(tbvd.VENDEDOR_NOME) AS VENDEDOR_NOME, ' +
		'	TRIM(tbvd.VENDEDOR_CPF) AS VENDEDOR_CPF, ' +
		'   TBE.IDEMPRESA, ' +
		'   TBE.NOFANTASIA ' +
    	' FROM ' +
        '	"VAR_DB_NAME".VENDADETALHE tbvd ' +
        '	INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbvd.VENDEDOR_MATRICULA = tbf.IDFUNCIONARIO ' +
        '	INNER JOIN "VAR_DB_NAME".VENDA tbv ON  tbvd.IDVENDA = tbv.IDVENDA ' +
        '   INNER JOIN "VAR_DB_NAME"."EMPRESA" TBE on tbv.IDEMPRESA=TBE.IDEMPRESA ' +
		' WHERE ' +
        '	1 = ?'+
        '   and tbv.STCANCELADO = \'False\''+
        '   and tbvd.STCANCELADO = \'False\'';
    
    if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
    if(idGrupo>0) {
        query = query + ' And  TBE.IDGRUPOEMPRESARIAL = \'' + idGrupo + '\' ';
    }

    if(idEmpresa>0) {
        query = query + ' AND tbv.IDEMPRESA IN (' + idEmpresa + ') ';
    }
    
    if(dataPesquisaInicio) {
        query = query + ' AND (tbv.DTHORAFECHAMENTO  BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    query = query + 'GROUP BY tbvd.VENDEDOR_MATRICULA, tbf.NOLOGIN, tbvd.VENDEDOR_NOME, tbvd.VENDEDOR_CPF, TBE.IDEMPRESA, TBE.NOFANTASIA ';
    
    query = query + 'ORDER BY TBE.IDEMPRESA, TBE.NOFANTASIA, tbvd.VENDEDOR_MATRICULA ';

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var vendedor = {
			"vendedor": {
			   	"VENDEDOR_MATRICULA": registro.NOLOGIN,
				"VENDEDOR_NOME": registro.VENDEDOR_NOME,
				"VENDEDOR_CPF": registro.VENDEDOR_CPF,
				"NOFANTASIA": registro.NOFANTASIA
			},
			"totalVendido": obterLinhasDoTotalVendido(registro.VENDEDOR_MATRICULA,registro.IDEMPRESA,dataPesquisaInicio,dataPesquisaFim),
			"Vouchers" :obterLinhasDoTotalVoucher(registro.VENDEDOR_MATRICULA,registro.IDEMPRESA,dataPesquisaInicio,dataPesquisaFim)
			
		};

		data.push(vendedor);

	}

	response.data = data;

	return response;
}

function fnHandlePut() {
    var bodyJson = JSON.parse($.request.body.asString()); 
    var registro = bodyJson[0];
    
    var matFuncionario = '';
    var nomeFuncionario = '';
    var cpfFuncionario = '';
    
    if(registro.IDVENDEDOR === 0){
        matFuncionario = 0;
        nomeFuncionario = 'LOJA';
        cpfFuncionario = '00000000000';
    }else{
        var queryFunc = ' SELECT IDFUNCIONARIO, NOFUNCIONARIO, NUCPF ' +
		' FROM  ' +
		'   "VAR_DB_NAME".FUNCIONARIO  ' +
		'  WHERE  ' +
		'   ID = ?  ' +
		'  ORDER BY ID  ';

	    var linhas = api.sqlQuery(queryFunc, registro.IDVENDEDOR);
	    matFuncionario = parseInt(linhas[0].IDFUNCIONARIO);
        nomeFuncionario = linhas[0].NOFUNCIONARIO;
        cpfFuncionario = linhas[0].NUCPF;
    }
    
    var conn = $.db.getConnection();
    for (var i=0; i < registro.IDVENDADETALHE.length; i++){
        var query = 'UPDATE "VAR_DB_NAME"."VENDADETALHE" SET ' + 
            ' "VENDEDOR_MATRICULA" = ?, ' + 
            ' "VENDEDOR_NOME" = ?, ' + 
            ' "VENDEDOR_CPF" = ? '+
        	' WHERE "IDVENDADETALHE" = ? ';  
        
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
        
        pStmt.setInt(1, matFuncionario);
        pStmt.setString(2, nomeFuncionario);
        pStmt.setString(3, cpfFuncionario);
        pStmt.setString(4, registro.IDVENDADETALHE[i]);
        
    	pStmt.execute();
    }
    
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
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
		case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}