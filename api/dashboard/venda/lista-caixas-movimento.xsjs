var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterVenda(idMovimento) {

	var query = ' SELECT ' +
		'   SUM( tbv.VRRECDINHEIRO) AS TOTALVENDIDODINHEIRO, ' +
    	'   SUM( tbv.VRRECCARTAO ) AS TOTALVENDIDOCARTAO, ' +
    	'   (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE tbv1.IDMOVIMENTOCAIXAWEB = \'' + idMovimento +'\' AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'POS\' AND (tbvp.DSTIPOPAGAMENTO!=\'PIX\') AND (tbvp.DSTIPOPAGAMENTO!=\'MoovPay\')) AS TOTALVENDIDOPOS, '+
    	'   (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE tbv1.IDMOVIMENTOCAIXAWEB = \'' + idMovimento +'\' AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'PIX\' AND (tbvp.DSTIPOPAGAMENTO =\'PIX\')) AS TOTALVENDIDOPIX, '+
    	'   (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE tbv1.IDMOVIMENTOCAIXAWEB = \'' + idMovimento +'\' AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'POS\' AND (tbvp.DSTIPOPAGAMENTO =\'MoovPay\')) AS TOTALVENDIDOMOOVPAY, '+
    	'   SUM( tbv.VRRECVOUCHER ) AS TOTALVENDIDOVOUCHER, ' +
    	'   SUM( tbv.VRTOTALPAGO ) AS TOTALVENDIDO,  ' +
    	'   SUM( tbv.VRRECCONVENIO) AS TOTALVENDIDOCONVENIO,  ' +
    	'   SUM( tbv.NFE_INFNFE_TOTAL_ICMSTOT_VNF) AS TOTALNOTA  ' +
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
			"venda-movimento": {
				"TOTALVENDIDODINHEIRO":det.TOTALVENDIDODINHEIRO,
        		"TOTALVENDIDOCARTAO":det.TOTALVENDIDOCARTAO,
        		"TOTALVENDIDOPOS":det.TOTALVENDIDOPOS,
        		"TOTALVENDIDOPIX":det.TOTALVENDIDOPIX,
        		"TOTALVENDIDOMOOVPAY":det.TOTALVENDIDOMOOVPAY,
        		"TOTALVENDIDOVOUCHER":det.TOTALVENDIDOVOUCHER,
        		"TOTALVENDIDO":det.TOTALVENDIDO,
        		"TOTALVENDIDOCONVENIO":det.TOTALVENDIDOCONVENIO,
        		"TOTALNOTA":det.TOTALNOTA
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterFatura(idEmpresa, idMovimento) {

	var query = ' SELECT ' +
		'   SUM( tbdf.VRRECEBIDO) AS TOTALRECEBIDO ' +
    	' FROM ' +
        '	"VAR_DB_NAME".DETALHEFATURA tbdf ' +
        ' WHERE ' +
        '	tbdf.IDEMPRESA = ? '+
        '   and tbdf.STCANCELADO = \'False\''+
        '   and (tbdf.STPIX = \'False\' OR tbdf.STPIX IS NULL)'+
        '   AND tbdf.IDMOVIMENTOCAIXAWEB = \''+idMovimento+'\'';
        

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"fatura-movimento": {
				"TOTALRECEBIDOFATURA":det.TOTALRECEBIDO
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterFaturaPIX(idEmpresa, idMovimento) {

	var query = ' SELECT ' +
		'   SUM( tbdf.VRRECEBIDO) AS TOTALRECEBIDOPIX ' +
    	' FROM ' +
        '	"VAR_DB_NAME".DETALHEFATURA tbdf ' +
        ' WHERE ' +
        '	tbdf.IDEMPRESA = ? '+
        '   and tbdf.STCANCELADO = \'False\''+
        '   and (tbdf.STPIX = \'True\' ) '+
        '   AND tbdf.IDMOVIMENTOCAIXAWEB = \''+idMovimento+'\'';
        

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"fatura-movimento-pix": {
				"TOTALRECEBIDOFATURAPIX":det.TOTALRECEBIDOPIX
        	}
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataFechamento = $.request.parameters.get("dataFechamento");

	var query = ' SELECT ' +
	    '   tbmc.ID, ' +
	    '   tbmc.IDOPERADOR, ' +
	    '   tbmc.VRRECDINHEIRO, ' +
        '   tbc.IDCAIXAWEB, ' +
    	'   tbc.DSCAIXA, ' +
    	'   tbc.IDEMPRESA, ' +
    	'   tbf.NOFUNCIONARIO, ' +
    	'   tbmc.STFECHADO, ' +
    	'   tbmc.STCONFERIDO, ' +
    	'   TO_VARCHAR(tbmc.DTABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTABERTURA ' +
    	' FROM ' +
        '	"VAR_DB_NAME".MOVIMENTOCAIXA tbmc ' +
        '   INNER JOIN "VAR_DB_NAME".CAIXA tbc ON tbmc.IDCAIXA = tbc.IDCAIXAWEB ' +
        '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbmc.IDOPERADOR = tbf.IDFUNCIONARIO  ' +
	    ' WHERE ' +
        '	1 = ?' +
        '   and tbmc.STCANCELADO = \'False\'';
        
    if (byId) {
		query = query + ' And  tbmc.ID = \'' + byId + '\' ';
	}
    
    if(idEmpresa) {
        query = query + ' AND tbmc.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataFechamento) {
        query = query + ' AND (tbmc.DTABERTURA  BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\')';
    }
    
    query = query + 'GROUP BY tbmc.ID, tbc.IDCAIXAWEB, tbmc.IDOPERADOR, tbc.DSCAIXA, tbf.NOFUNCIONARIO, tbc.IDEMPRESA, tbmc.STFECHADO, tbmc.DTABERTURA, tbmc.VRRECDINHEIRO, tbmc.STCONFERIDO ';
    
	
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
				"IDOPERADOR": registro.IDOPERADOR,
				"VRRECDINHEIRO": registro.VRRECDINHEIRO,
				"IDCAIXAWEB": registro.IDCAIXAWEB,
				"DSCAIXA": registro.DSCAIXA,
				"NOFUNCIONARIO": registro.NOFUNCIONARIO,
				"DTABERTURA":registro.DTABERTURA,
				"STFECHADO":registro.STFECHADO,
				"STCONFERIDO":registro.STCONFERIDO
			
			},
			"venda": obterVenda(registro.ID),
			"fatura": obterFatura(idEmpresa, registro.ID),
			"faturapix": obterFaturaPIX(idEmpresa, registro.ID)
			
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