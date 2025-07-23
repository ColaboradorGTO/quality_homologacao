var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoDetalhe(idVoucher) {

	var query = ' SELECT ' + 
    '   tbdv.IDVOUCHER,' +
    '   tbdv.IDDETALHEVOUCHER, ' +
	'   tbdv.IDPRODUTO, ' +
	'   tbp.DSNOME AS DSPRODUTO, ' +
	'   tbp.NUCODBARRAS, ' +
	'   tbdv.QTD, ' +
	'   tbdv.VRUNIT, ' +
	'   tbdv.VRTOTALBRUTO, ' +
	'   tbdv.VRDESCONTO, ' +
	'   tbdv.VRTOTALLIQUIDO, ' +
	'   tbdv.STATIVO, ' +
	'   tbdv.STCANCELADO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEVOUCHER tbdv' +
    '	INNER JOIN "VAR_DB_NAME".PRODUTO tbp ON tbp.IDPRODUTO = tbdv.IDPRODUTO ' +
    ' WHERE ' +
        '	tbdv.IDVOUCHER = ?';

	var linhas = api.sqlQuery(query, idVoucher);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"det": {
				"IDDETALHEVOUCHER": det.IDDETALHEVOUCHER,
            	"IDVOUCHER": det.IDVOUCHER,
            	"IDPRODUTO": det.IDPRODUTO,
            	"DSPRODUTO": det.DSPRODUTO,
            	"NUCODBARRAS": det.NUCODBARRAS,
            	"QTD": det.QTD,
            	"VRUNIT": det.VRUNIT,
            	"VRTOTALBRUTO": det.VRTOTALBRUTO,
            	"VRDESCONTO": det.VRDESCONTO,
            	"VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
            	"STATIVO": det.STATIVO,
            	"STCANCELADO": det.STCANCELADO
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterLinhasDoDetalheResumoVenda(idresumovenda) {

	var query = ' SELECT ' + 
    '   tbvd.IDVENDADETALHE,' +
    '   tbvd.IDVENDA, ' +
	'   tbvd.CPROD, ' +
	'   tbvd.CEAN, ' +
	'   tbvd.XPROD AS DSPRODUTO, ' +
	'   tbvd.QTD, ' +
	'   tbvd.VRTOTALLIQUIDO, ' +
	'   tbvd.VENDEDOR_NOME ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".VENDADETALHE tbvd' +
    ' WHERE ' +
        '	tbvd.IDVENDA = ?';

	var linhas = api.sqlQuery(query, idresumovenda);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"vendadet": {
				"IDVENDADETALHE": det.IDVENDADETALHE,
            	"IDVENDA": det.IDVENDA,
            	"CPROD": det.CPROD,
            	"CEAN": det.CEAN,
            	"DSPRODUTO": det.DSPRODUTO,
            	"QTD": det.QTD,
            	"VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
            	"VENDEDOR_NOME": det.VENDEDOR_NOME
			}
		};

		lines.push(docLine);
	}

	return lines;
}



function fnHandleGet(byId) {


    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
	var query = ' SELECT ' +
       	'   tbrv.IDVOUCHER,  ' +
       	'   tbrv.IDRESUMOVENDAWEB,  ' +
	    '   IFNULL(TO_VARCHAR(tbrv.DTINVOUCHER,\'DD-MM-YYYY\'),\'\') AS DTINVOUCHER,  ' +
	    '   IFNULL(TO_VARCHAR(tbrv.DTOUTVOUCHER,\'DD-MM-YYYY\'),\'\') AS DTOUTVOUCHER,  ' +
    	'   tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  ' +
    	'   tbcdestino.DSCAIXA AS DSCAIXADESTINO,  ' +
    	'   tbrv.NUVOUCHER,  ' +
    	'   tbrv.VRVOUCHER,  ' +
    	'   tbrv.STATIVO,  ' +
    	'   tbrv.STCANCELADO,  ' +
	    '   tbemporigem.NOFANTASIA AS EMPORIGEM, ' +
	    '   IFNULL(tbempdestino.NOFANTASIA,\'\') AS EMPDESTINO' +
        ' FROM ' +
        '	"VAR_DB_NAME".RESUMOVOUCHER tbrv ' +
        '	LEFT JOIN "VAR_DB_NAME".CAIXA tbcorigem ON tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB ' +
        '	LEFT JOIN "VAR_DB_NAME".CAIXA tbcdestino ON tbrv.IDCAIXAORIGEM = tbcdestino.IDCAIXAWEB ' +
	    '	LEFT JOIN "VAR_DB_NAME".EMPRESA tbemporigem ON tbrv.IDEMPRESAORIGEM = tbemporigem.IDEMPRESA ' +
	    '	LEFT JOIN "VAR_DB_NAME".EMPRESA tbempdestino ON tbrv.IDEMPRESADESTINO = tbempdestino.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ?';
        
    if(byId) {
        query = query + ' AND tbrv.NUVOUCHER = \'' + byId + '\' ';
    }

    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbrv.DTINVOUCHER BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var voucher = {
			"voucher": {
				"IDVOUCHER": registro.IDVOUCHER,
				"IDRESUMOVENDAWEB": registro.IDRESUMOVENDAWEB,
        	    "DTINVOUCHER": registro.DTINVOUCHER,
        	    "DTOUTVOUCHER": registro.DTOUTVOUCHER,
            	"DSCAIXAORIGEM": registro.DSCAIXAORIGEM,
            	"DSCAIXADESTINO": registro.DSCAIXADESTINO,
            	"NUVOUCHER": registro.NUVOUCHER,
            	"VRVOUCHER": registro.VRVOUCHER,
            	"STATIVO": registro.STATIVO,
            	"STCANCELADO": registro.STCANCELADO,
        	    "EMPORIGEM": registro.EMPORIGEM,
        	    "EMPDESTINO": registro.EMPDESTINO
			},
			"detalhe": obterLinhasDoDetalheResumoVenda(registro.IDRESUMOVENDAWEB),
			"detalhevoucher": obterLinhasDoDetalhe(registro.IDVOUCHER)
		};

		data.push(voucher);

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