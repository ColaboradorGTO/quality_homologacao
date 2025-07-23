var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoDetalheGrade(idDetPedido) {

	var query = ' SELECT DETGRADE.IDDETALHEPEDIDOGRADE, DETGRADE.IDDETALHEPEDIDO, DETGRADE.IDTAMANHO, DETGRADE.INDICETAMANHO, DETGRADE.QTD, DETGRADE.STATIVO, TAM.DSTAMANHO ' +
		' FROM  ' +
		'   "VAR_DB_NAME".DETALHEPEDIDOGRADE DETGRADE  ' +
        '   INNER JOIN "VAR_DB_NAME".TAMANHO TAM ON DETGRADE.IDTAMANHO = TAM.IDTAMANHO  ' + 
		'  WHERE  ' +
		'   DETGRADE.STATIVO = \'True\' '+
		'   AND DETGRADE.IDDETALHEPEDIDO = ?  ';

    query = query + ' ORDER BY TO_ALPHANUM(TAM.DSABREVIACAO) ';

	var linhas = api.sqlQuery(query, idDetPedido);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"IDDETALHEPEDIDOGRADE": det.IDDETALHEPEDIDOGRADE,
				"IDDETALHEPEDIDO": det.IDDETALHEPEDIDO,
				"IDTAMANHO": det.IDTAMANHO,
				"DSTAMANHO": det.DSTAMANHO,
				"INDICETAMANHO": det.INDICETAMANHO,
				"QTD": det.QTD,
				"STATIVO": det.STATIVO
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {

    var idPedido = $.request.parameters.get("idpedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

    var query =  ' SELECT ' +
        '   tbdp.IDDETALHEPEDIDO AS IDDETPEDIDO, ' +
        '   tbdp.IDRESUMOPEDIDO AS IDPEDIDO, ' +
        '   tbdp.IDCOR, ' +
        '   tbdp.IDSUBGRUPOESTRUTURA, ' +
        '   SE.DSSUBGRUPOESTRUTURA, ' +
        '   GE.DSGRUPOESTRUTURA, ' +
        '   tbdp.IDCATEGORIAPEDIDO, ' +
        '   CP.DSCATEGORIAPEDIDO, ' + 
        '   CR.DSCOR, ' +
        '   LE.IDLOCALEXPOSICAO, ' + 
        '   LE.DSLOCALEXPOSICAO, ' + 
        '   ES.IDESTILO, ' + 
        '   ES.DSESTILO, ' +
        '   TT.IDTPTECIDO, ' + 
        '   TT.DSTIPOTECIDO, ' +
        '   tbdp.NUREF, ' +
        '   tbdp.DSPRODUTO, ' +
        '   tbdp.QTDTOTAL, ' +
        '   tbdp.NUCAIXA, ' +
        '   UN.DSSIGLA, ' +
        '   ( tbdp.VRUNITBRUTO) AS VRUNITBRUTODETALHEPEDIDO, ' +
        '   IFNULL( tbdp.DESC01,0) AS DESC01, ' +
        '   IFNULL( tbdp.DESC02,0) AS DESC02, ' +
        '   IFNULL( tbdp.DESC03,0) AS DESC03, ' +
        '   IFNULL( tbdp.VRUNITLIQUIDO,0) AS VRUNITLIQDETALHEPEDIDO, ' +
        '   IFNULL( tbdp.VRVENDA,0) AS VRVENDADETALHEPEDIDO, ' +
        '   IFNULL( tbdp.VRTOTAL,0) AS VRTOTALDETALHEPEDIDO, ' +
        '   tbdp.STRECEBIDO, ' +
        '   tbdp.STCANCELADO, ' +
        '   tbdp.STECOMMERCE, ' +
        '   tbdp.STREDESOCIAL, ' +
        '   tbdp.OBSPRODUTO, ' +
        '   tbrp.MODPEDIDO, ' +
        '   TO_VARCHAR( tbrp.DTPEDIDO, \'DD-MM-YYYY HH24:MI:SS\') AS DTPEDIDO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DETALHEPEDIDO tbdp ' +
        '   INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO tbrp ON tbdp.IDRESUMOPEDIDO = tbrp.IDRESUMOPEDIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".COR CR ON tbdp.IDCOR = CR.IDCOR  ' +
        '   INNER JOIN "VAR_DB_NAME".ESTILOS ES ON tbdp.IDESTILO = ES.IDESTILO  ' +
        '   INNER JOIN "VAR_DB_NAME".TIPOTECIDOS TT ON tbdp.IDTIPOTECIDO = TT.IDTPTECIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".LOCALEXPOSICAO LE ON tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  ' +
        '   INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO CP ON tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA UN ON tbdp.UND = UN.IDUNIDADEMEDIDA  ' +
        '   INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA SE ON tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  ' +
        '   INNER JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON SE.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND tbrp.STCANCELADO = \'False\' AND tbdp.STCANCELADO = \'False\' ';
    if ( byId ) {
        query = query + ' And  tbdp.IDDETALHEPEDIDO = \'' + byId + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  tbrp.IDRESUMOPEDIDO = \'' + idPedido + '\' ';
        query = query + ' Order by tbdp.IDSUBGRUPOESTRUTURA,tbdp.NUREF, tbdp.DSPRODUTO ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (tbrp.DTPEDIDO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var detpedido = {
			"detpedido": {
				"IDDETPEDIDO": registro.IDDETPEDIDO,
				"IDPEDIDO": registro.IDPEDIDO,
				"IDCOR": registro.IDCOR,
				"IDESTRUTURAMERCADOLOGICA": registro.IDESTRUTURAMERCADOLOGICA,
				"DSSUBGRUPOESTRUTURA": registro.DSSUBGRUPOESTRUTURA,
				"DSGRUPOESTRUTURA": registro.DSGRUPOESTRUTURA,
				"IDCATEGORIAPEDIDO": registro.IDCATEGORIAPEDIDO,
				"DSCATEGORIAPEDIDO": registro.DSCATEGORIAPEDIDO,
				"DSCOR": registro.DSCOR,
				"DSLOCALEXPOSICAO": registro.DSLOCALEXPOSICAO,
				"DSESTILO": registro.DSESTILO,
				"DSTIPOTECIDO": registro.DSTIPOTECIDO,
				"NUREF": registro.NUREF,
				"DSPRODUTO": registro.DSPRODUTO,
				"QTDTOTAL": registro.QTDTOTAL,
				"NUCAIXA": registro.NUCAIXA,
				"DSSIGLA": registro.DSSIGLA,
				"VRUNITBRUTODETALHEPEDIDO": registro.VRUNITBRUTODETALHEPEDIDO,
				"DESC01": registro.DESC01,
				"DESC02": registro.DESC02,
				"DESC03": registro.DESC03,
				"VRUNITLIQDETALHEPEDIDO": registro.VRUNITLIQDETALHEPEDIDO,
				"VRVENDADETALHEPEDIDO": registro.VRVENDADETALHEPEDIDO,
				"VRTOTALDETALHEPEDIDO": registro.VRTOTALDETALHEPEDIDO,
				"STRECEBIDO": registro.STRECEBIDO,
				"STCANCELADO": registro.STCANCELADO,
				"STREDESOCIAL": registro.STREDESOCIAL,
				"STECOMMERCE" : registro.STECOMMERCE,
				"OBSPRODUTO": registro.OBSPRODUTO,
				"DTPEDIDO": registro.DTPEDIDO
			},
			"detalhegrade": obterLinhasDoDetalheGrade(registro.IDDETPEDIDO)
		};

		data.push(detpedido);

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