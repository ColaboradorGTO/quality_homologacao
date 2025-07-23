var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDaVendaPagamento(idVenda) {

	var query = ' SELECT '+
				 '	tbvp.DSTIPOPAGAMENTO, '+
                 '	tbvp.NPARCELAS, '+
                 '	tbvp.NUOPERACAO, '+
                 '	tbvp.NSUTEF, '+
                 '	tbvp.NSUAUTORIZADORA, '+
                 '	SUM(tbvp.VALORLIQUIDO) AS VALORLIQUIDO, '+
                 '	SUM(tbvp.VALORRECEBIDO) AS VALORRECEBIDO '+
				 ' FROM '+
				 '	"VAR_DB_NAME".VENDAPAGAMENTO tbvp ' +
				 ' WHERE '+
				 '	tbvp.IDVENDA = ?'+
				 ' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) ';
	query = query + ' GROUP BY tbvp.DSTIPOPAGAMENTO, tbvp.NPARCELAS, tbvp.NUOPERACAO, tbvp.NSUTEF, tbvp.NSUAUTORIZADORA';			 

	var linhas = api.sqlQuery(query, idVenda);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"pag": {
				"DSTIPOPAGAMENTO": det.DSTIPOPAGAMENTO,
				"NPARCELAS": det.NPARCELAS,
				"NSUTEF": det.NSUTEF,
				"NUOPERACAO": det.NUOPERACAO,
				"NSUAUTORIZADORA": det.NSUAUTORIZADORA,
				"VALORLIQUIDO": det.VALORLIQUIDO,
				"VALORRECEBIDO": det.VALORRECEBIDO
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {

	var query = ' SELECT ' +
        '   tbv.IDVENDA, ' +
        '   tbv.IDEMPRESA, ' +
    	'	TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'YYYY-MM-DD HH:MM:SS\') AS DTHORAFECHAMENTO, ' +
    	'   tbv.VRTOTALVENDA, ' +
    	'   (tbv.VRRECDINHEIRO) AS VRDINHEIRO, ' +
    	'   tbv.VRRECDINHEIRO, ' +
    	'   tbv.VRRECCARTAO, ' +
    	'   tbv.VRRECPOS, ' +
    	'   tbv.VRRECCONVENIO, ' +
    	'   tbv.VRRECCHEQUE, ' +
    	'   tbv.VRRECVOUCHER, ' +
    	'   (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp WHERE tbvp.IDVENDA = tbv.IDVENDA AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'POS\' AND (tbvp.DSTIPOPAGAMENTO!=\'PIX\') AND (tbvp.DSTIPOPAGAMENTO!=\'MoovPay\')) AS TOTALVENDIDOPOS, '+
    	'   (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp WHERE tbvp.IDVENDA = tbv.IDVENDA AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'PIX\' AND (tbvp.DSTIPOPAGAMENTO =\'PIX\')) AS TOTALVENDIDOPIX, '+
    	'   (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp WHERE tbvp.IDVENDA = tbv.IDVENDA AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'POS\' AND (tbvp.DSTIPOPAGAMENTO =\'MoovPay\')) AS TOTALVENDIDOMOOVPAY '+
    	' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv ' +
		' WHERE ' +
        '	1 = ?';
        
    if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var venda = {
			"venda": {
				"IDVENDA": registro.IDVENDA,
				"IDEMPRESA": registro.IDEMPRESA,
				"DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
				"VRTOTALVENDA": registro.VRTOTALVENDA,
				"VRDINHEIRO": registro.VRDINHEIRO,
				"VRRECDINHEIRO": registro.VRRECDINHEIRO,
				"VRRECCARTAO": registro.VRRECCARTAO,
				"VRRECPOSVENDA": registro.VRRECPOS,
				"VRRECPOS": registro.TOTALVENDIDOPOS,
				"VRRECPIX": registro.TOTALVENDIDOPIX,
				"VRRECMOOVPAY": registro.TOTALVENDIDOMOOVPAY,
				"VRRECCONVENIO": registro.VRRECCONVENIO,
				"VRRECCHEQUE": registro.VRRECCHEQUE,
				"VRRECVOUCHER": registro.VRRECVOUCHER
			},
			"vendaPagamento": obterLinhasDaVendaPagamento(registro.IDVENDA)
			
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