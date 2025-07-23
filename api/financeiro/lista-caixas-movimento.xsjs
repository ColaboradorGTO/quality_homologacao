var api = $.import("quality.concentrador.api.apiResponse", "int_api");

function obterPCJ(idMovimento) {

	var query = ' SELECT ' +
	    '   SUM( tbv.VRRECCARTAO ) AS TOTALVENDIDOCARTAO, ' +
    	'   (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE tbv1.IDMOVIMENTOCAIXAWEB = \'' + idMovimento +'\' AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND (tbvp.NOAUTORIZADOR =\'CREDSYSTEM\' OR tbvp.NOAUTORIZADOR =\'PL\') AND (tbvp.DSTIPOPAGAMENTO !=\'GIRO PREMIADO\') AND (tbvp.NPARCELAS = 7 OR tbvp.NPARCELAS = 8)) AS TOTALPCJ78, '+
    	'   (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE tbv1.IDMOVIMENTOCAIXAWEB = \'' + idMovimento +'\' AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND (tbvp.NOAUTORIZADOR =\'CREDSYSTEM\' OR tbvp.NOAUTORIZADOR =\'PL\') AND (tbvp.DSTIPOPAGAMENTO !=\'GIRO PREMIADO\')) AS TOTALPCJ18 '+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv ' +
        ' WHERE ' +
        '	tbv.IDMOVIMENTOCAIXAWEB = ?'+
        '   AND tbv.STCANCELADO = \'False\'';

	var linhas = api.sqlQuery(query, idMovimento);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"venda-pcj": {
				"TOTALVENDIDOCARTAO":det.TOTALVENDIDOCARTAO,
				"TOTALPCJ78":det.TOTALPCJ78,
        		"TOTALPCJ18":det.TOTALPCJ18
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {
    
    var idMarca = $.request.parameters.get("idMarca");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var idLoja = $.request.parameters.get("idLoja");
    var idLojasPesquisa = $.request.parameters.get("idLojasPesq");

	var query = ' SELECT ' +
	    '   tbmc.ID, ' +
	    '   tbmc.IDOPERADOR, ' +
	    '   tbmc.VRRECDINHEIRO, ' +
        '   tbc.IDCAIXAWEB, ' +
    	'   tbc.DSCAIXA, ' +
    	'   tbc.IDEMPRESA, ' +
    	'   tbe.NOFANTASIA, ' +
    	'   tbf.NOFUNCIONARIO, ' +
    	'   tbf.NUCPF, ' +
    	'   tbmc.STFECHADO, ' +
    	'   TO_VARCHAR(tbmc.DTABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTABERTURA ' +
    	' FROM ' +
        '	"VAR_DB_NAME".MOVIMENTOCAIXA tbmc ' +
        '   INNER JOIN "VAR_DB_NAME".CAIXA tbc ON tbmc.IDCAIXA = tbc.IDCAIXAWEB ' +
        '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbmc.IDOPERADOR = tbf.IDFUNCIONARIO  ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbmc.IDEMPRESA = tbe.IDEMPRESA ' +
	    ' WHERE ' +
        '	1 = ?';
        
    if (byId) {
		query = query + ' And  tbmc.ID = \'' + byId + '\' ';
	}
    
    if(idMarca>0) {
        query = query + ' AND tbe.IDSUBGRUPOEMPRESARIAL IN (' + idMarca + ') ';
    }
    
    if(idLoja>0) {
        query = query + ' AND tbmc.IDEMPRESA IN (' + idLoja + ') ';
    }
    
    if(idLojasPesquisa>0) {
        query = query + ' AND tbmc.IDEMPRESA IN (' + idLojasPesquisa + ') ';
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
        query = query + ' AND (tbmc.DTABERTURA  BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    query = query + 'GROUP BY tbmc.ID, tbc.IDCAIXAWEB, tbmc.IDOPERADOR,tbf.NUCPF,tbc.DSCAIXA, tbf.NOFUNCIONARIO, tbc.IDEMPRESA, tbmc.STFECHADO, tbmc.DTABERTURA, tbmc.VRRECDINHEIRO,tbe.NOFANTASIA ';
    
	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var caixa = {
			"caixa": {
				"ID": registro.ID,
				"NOFANTASIA": registro.NOFANTASIA,
				"IDOPERADOR": registro.IDOPERADOR,
				"VRRECDINHEIRO": registro.VRRECDINHEIRO,
				"IDCAIXAWEB": registro.IDCAIXAWEB,
				"DSCAIXA": registro.DSCAIXA,
				"NOFUNCIONARIO": registro.NOFUNCIONARIO,
				"NUCPF": registro.NUCPF,
				"DTABERTURA":registro.DTABERTURA,
				"STFECHADO":registro.STFECHADO
			
			},
			"vendapcj": obterPCJ(registro.ID)
			
		};

		data.push(caixa);

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