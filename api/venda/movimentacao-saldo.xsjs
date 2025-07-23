var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) { 
    var idMarca = $.request.parameters.get("idGrupoEmpresarial");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var uf = $.request.parameters.get("uf");
    var idForn = $.request.parameters.get("idFornecedor");
    var produto = $.request.parameters.get("descricaoProduto");
    var idGrupoGrade = $.request.parameters.get("idGrupoGrade");
    var idGrade = $.request.parameters.get("idGrade");
    var dataPesqInicial = $.request.parameters.get("dataInicio"); 
    var dataPesqFinal = $.request.parameters.get("dataFim");

	var query = ' SELECT distinct' +
		' tbe.NOFANTASIA, ' +
		' tbps.PN, ' +
		' tbps.GRUPOPRODUTO, ' +
		' tbps.NOMEGRUPO, ' +
		' tbps.NUCODBARRAS, ' +
        ' tbps.DSNOME, ' +
        ' tbms.IDPRODUTO, '+
        ' SUM(tbms.QTDSAIDAVENDA) AS QTDSAIDAVENDA, '+
        ' (SELECT first_value(s2.QTDSALDO order by s2.DTMOVIMENTACAO desc) FROM "VAR_DB_NAME"."MOVIMENTACAOSALDO" s2 where s2.IDPRODUTO = tbps.IDPRODUTO and s2.IDEMPRESA = tbe.IDEMPRESA) as QTDSALDO, ' +
		' (SELECT first_value(s2.QTDSALDO order by s2.DTMOVIMENTACAO desc) FROM "VAR_DB_NAME"."MOVIMENTACAOSALDO" s2 where s2.IDPRODUTO = tbps.IDPRODUTO and s2.IDEMPRESA = tbe.IDEMPRESA And  s2.DTMOVIMENTACAO <= \'' + dataPesqFinal + '\' ) as QTDSALDODATA ' +
		' FROM ' +
		'   "VAR_DB_NAME"."MOVIMENTACAOSALDO" tbms ' +
		'   INNER JOIN "VAR_DB_NAME"."EMPRESA" tbe on tbms.IDEMPRESA = tbe.IDEMPRESA ' +
		'   INNER JOIN "VAR_DB_NAME"."PRODUTOSAP" tbps on tbms.IDPRODUTO = tbps.IDPRODUTO ' +
		' WHERE ' +
		'	1 = ?';
    
	if (byId) {
		query = query + ' And  tbms.IDMOVIMENTACAO = \'' + byId + '\' ';
	}
	
	if (idMarca > 0) {
		query = query + ' And  tbe.IDSUBGRUPOEMPRESARIAL = \'' + idMarca + '\' ';
	}
	
	if (uf > 0) {
		query = query + ' And  tbe.SGUF = \'' + uf + '\' ';
	}
	
	if (idEmpresa) {
		query = query + ' And  tbms.IDEMPRESA IN (' + idEmpresa + ') ';
	}
	
	if (idForn) {
		query = query + ' And  tbps.IDPN = \'' + idForn + '\' ';
	}
	
	if (idGrupoGrade) {
		query = query + ' And  tbps.IDGRUPO = \'' + idGrupoGrade + '\' ';
	}
	
	if (idGrade) {
		query = query + ' And  tbps.NOMEGRUPO IN (\'' + idGrade + '\') ';
	}
	
	if (produto) {
		query = query + ' And  (tbps.DSNOME LIKE \'%' + produto + '%\' OR tbps.NUCODBARRAS=\''+produto+'\' ) ';
	}
	
	if (dataPesqInicial) {
		query = query + ' And tbms.DTMOVIMENTACAO >= \'' + dataPesqInicial + '\' ';
		query = query + ' And  tbms.DTMOVIMENTACAO <= \'' + dataPesqFinal + '\' ';
	}

    query = query + ' GROUP BY tbe.IDEMPRESA,tbms.IDPRODUTO, tbe.NOFANTASIA, tbps.PN, tbps.GRUPOPRODUTO, tbps.NOMEGRUPO, tbps.NUCODBARRAS, tbps.DSNOME,TBPS.IDPRODUTO';
	
	var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}



try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;

		
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}