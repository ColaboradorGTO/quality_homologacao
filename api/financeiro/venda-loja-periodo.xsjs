var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterTotaisVenda(idEmpresa, dataPesquisa) {

	var query = ' SELECT ' +
        ' IFNULL (SUM(tbv.VRRECDINHEIRO),0) AS VALORTOTALDINHEIRO, '+
        ' IFNULL (SUM(tbv. VRRECCARTAO),0) AS VALORTOTALCARTAO, '+
        ' IFNULL (SUM(tbv.VRRECCONVENIO),0) AS VALORTOTALCONVENIO, '+
		' (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\') AND tbv1.IDEMPRESA = \'' + idEmpresa +'\' AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'POS\' AND (tbvp.DSTIPOPAGAMENTO!=\'PIX\') AND (tbvp.DSTIPOPAGAMENTO!=\'MoovPay\')) AS VALORTOTALPOS, '+
		' (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\') AND tbv1.IDEMPRESA = \'' + idEmpresa +'\' AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'PIX\' AND (tbvp.DSTIPOPAGAMENTO =\'PIX\')) AS VALORTOTALPIX, '+
    	' (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\') AND tbv1.IDEMPRESA = \'' + idEmpresa +'\' AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'POS\' AND (tbvp.DSTIPOPAGAMENTO =\'MoovPay\')) AS VALORTOTALMOOVPAY, '+
        ' IFNULL (SUM(tbv.VRRECVOUCHER),0) AS VALORTOTALVOUCHER, '+
        ' (SELECT IFNULL (SUM(tbdf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbdf WHERE tbdf.DTPROCESSAMENTO = \'' + dataPesquisa +'\' AND tbdf.IDEMPRESA =\'' + idEmpresa +'\' AND tbdf.STCANCELADO = \'False\' AND (tbdf.STPIX = \'False\' OR tbdf.STPIX IS NULL)) AS VALORTOTALFATURA, '+
        ' (SELECT IFNULL (SUM(tbdf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbdf WHERE tbdf.DTPROCESSAMENTO = \'' + dataPesquisa +'\' AND tbdf.IDEMPRESA =\'' + idEmpresa +'\' AND tbdf.STCANCELADO = \'False\' AND tbdf.STPIX = \'True\') AS VALORTOTALFATURAPIX, '+
        ' (SELECT IFNULL (SUM(tbd.VRDESPESA),0) FROM "VAR_DB_NAME".DESPESALOJA tbd WHERE tbd.DTDESPESA = \'' + dataPesquisa +'\' AND tbd.IDEMPRESA =\'' + idEmpresa +'\' AND tbd.STCANCELADO = \'False\') AS VALORTOTALDESPESA, '+
        ' (SELECT IFNULL (SUM(tbas.VRVALORDESCONTO),0) FROM "VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas WHERE tbas.DTLANCAMENTO = \'' + dataPesquisa +'\' AND tbas.IDEMPRESA =\'' + idEmpresa +'\'  AND tbas.STATIVO = \'True\') AS VALORTOTALADIANTAMENTOSALARIAL, '+
        ' (SELECT IFNULL (SUM(dl.VRFISICODINHEIRO),0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE (dl.DTABERTURA  BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\') AND dl.IDEMPRESA =\'' + idEmpresa +'\'  AND dl.STCANCELADO = \'False\' AND dl.STFECHADO = \'True\') AS VRFISICODINHEIRO, '+
        ' (SELECT IFNULL (SUM(dl.VRAJUSTDINHEIRO),0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE (dl.DTABERTURA  BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\') AND dl.IDEMPRESA =\'' + idEmpresa +'\'  AND dl.STCANCELADO = \'False\' AND dl.STFECHADO = \'True\') AS VRAJUSTEDINHEIRO, '+
        ' (SELECT IFNULL (SUM(dl.VRRECDINHEIRO),0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE (dl.DTABERTURA  BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\') AND dl.IDEMPRESA =\'' + idEmpresa +'\'  AND dl.STCANCELADO = \'False\' AND dl.STFECHADO = \'True\') AS VRRECDINHEIRO '+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv ' +
        ' WHERE ' +
        '	tbv.IDEMPRESA = ?' +
        ' AND tbv.STCANCELADO = \'False\'';
        
        query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
   

	var linhas = api.sqlQuery(query, idEmpresa);

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"VALORTOTALDINHEIRO": det.VALORTOTALDINHEIRO,
				"VALORTOTALCARTAO": det.VALORTOTALCARTAO,
				"VALORTOTALCONVENIO": det.VALORTOTALCONVENIO,
				"VALORTOTALPOS": det.VALORTOTALPOS,
				"VALORTOTALPIX": det.VALORTOTALPIX,
				"VALORTOTALMOOVPAY": det.VALORTOTALMOOVPAY,
				"VALORTOTALVOUCHER": det.VALORTOTALVOUCHER,
				"VALORTOTALFATURA": det.VALORTOTALFATURA,
				"VALORTOTALFATURAPIX": det.VALORTOTALFATURAPIX,
				"VALORTOTALDESPESA": det.VALORTOTALDESPESA,
				"VALORTOTALADIANTAMENTOSALARIAL": det.VALORTOTALADIANTAMENTOSALARIAL,
				"VRFISICODINHEIRO": det.VRFISICODINHEIRO,
				"VRAJUSTEDINHEIRO": det.VRAJUSTEDINHEIRO,
				"VRRECDINHEIRO": det.VRRECDINHEIRO
				
		};
		
	}

	return docLine;
}

function fnHandleGet(byId) {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

	var query = ' SELECT DISTINCT ' +
		'   tbe.NOFANTASIA,' +
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'YYYY-mm-DD\') AS DTHORAFECHAMENTO, ' + 
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD/mm/YYYY\') AS DTHORAFECHAMENTOFORMATADA ' + 
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe on tbe.IDEMPRESA = tbv.IDEMPRESA' +
		' WHERE ' +
		'	1 = ? AND tbv.STCANCELADO=\'False\'';

	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
	if (idDaEmpresa) {
		query = query + ' And  tbv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
	}
	
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
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
				"IDVENDA": registro.IDVENDA,
				"NOFANTASIA": registro.NOFANTASIA,
				"DTHORAFECHAMENTO": registro.DTHORAFECHAMENTOFORMATADA,
				
				"totais": obterTotaisVenda(idDaEmpresa, registro.DTHORAFECHAMENTO)
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