var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
function obterLinhasDoMovimento(idMovimento) {

	var query = ' SELECT ' +
        ' IFNULL (SUM(tbmc.VRRECDINHEIRO),0) AS VALORTOTALINFORMADODINHEIRO, '+
        ' IFNULL (SUM(tbmc. VRRECTEF + tbmc. VRRECPOS),0) AS VALORTOTALINFORMADOCARTAO, '+
        ' IFNULL (SUM(tbmc.VRRECFATURA),0) AS VALORTOTALINFORMADOFATURA, '+
        ' IFNULL (SUM(tbmc.VRAJUSTDINHEIRO),0) AS VALORTOTALAJUSTEDINHEIRO, '+
        ' IFNULL (SUM(tbmc.VRRECPOS),0) AS VALORTOTALINFORMADOPOS '+
		' FROM  ' +
		'   "VAR_DB_NAME".MOVIMENTOCAIXA tbmc  ' +
		'  WHERE  ' +
		'   ID = ?  ';

	var linhas = api.sqlQuery(query, idMovimento);
	
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
    			"DINHEIRO": det.VALORTOTALINFORMADODINHEIRO,
    			"CARTAO": det.VALORTOTALINFORMADOCARTAO,
    			"FATURA": det.VALORTOTALINFORMADOFATURA,
    			"DINHEIROAJUSTE": det.VALORTOTALAJUSTEDINHEIRO,
    			"POS": det.VALORTOTALINFORMADOPOS
    	};
	}

	return docLine;

}

function obterLinhasDoDeposito(idEmpresa,dataPesquisa) {

	var query = ' SELECT ' +
        '   tbdl.VRDEPOSITO,' +
    	'   CAST(tbdl.DSHISTORIO AS TEXT) AS DSHISTORIO,' +
    	'   tbdl.NUDOCDEPOSITO' +
    	' FROM  ' +
		'   "VAR_DB_NAME".DEPOSITOLOJA tbdl  ' +
		'  WHERE  ' +
		'   tbdl.IDEMPRESA = ?  '+
		'   AND tbdl.STCANCELADO = \'False\''+
		'   AND (tbdl.DTDEPOSITO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
		

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"VRDEPOSITO": det.VRDEPOSITO,
				"DSHISTORIO": det.DSHISTORIO,
				"NUDOCDEPOSITO": det.NUDOCDEPOSITO
			
		};

		lines.push(docLine);
	}

	return lines;

}

function fnHandleGet() {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var query = ' SELECT ' +
        ' tbe.IDEMPRESA, '+
        ' tbe.NOFANTASIA, '+
        ' tbv.IDCAIXAWEB, '+
        ' tbv.IDMOVIMENTOCAIXAWEB, '+
        ' tbc.DSCAIXA, '+
        ' tbf.NOFUNCIONARIO,'+
        ' IFNULL (SUM(tbv.VRRECDINHEIRO),0) AS VALORTOTALDINHEIRO, '+
        ' IFNULL (SUM(tbv. VRRECCARTAO),0) AS VALORTOTALCARTAO, '+
        ' IFNULL (SUM(tbv.VRRECCONVENIO),0) AS VALORTOTALCONVENIO, '+
        ' IFNULL (SUM(tbv.VRRECPOS),0) AS VALORTOTALPOS, '+
        ' IFNULL (SUM(tbv.VRRECVOUCHER),0) AS VALORTOTALVOUCHER, '+
        ' (SELECT IFNULL (SUM(tbdf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbdf WHERE tbdf.IDEMPRESA = tbe.IDEMPRESA AND tbv.IDMOVIMENTOCAIXAWEB = tbdf.IDMOVIMENTOCAIXAWEB AND tbdf.STCANCELADO = \'False\' AND tbdf.DTPROCESSAMENTO = \'' + dataPesquisa +'\') AS VALORTOTALFATURA,  '+
        ' (SELECT IFNULL (SUM(tbd.VRDESPESA),0) FROM "VAR_DB_NAME".DESPESALOJA tbd WHERE tbd.IDEMPRESA = tbe.IDEMPRESA AND tbd.STCANCELADO = \'False\' AND tbd.DTDESPESA = \'' + dataPesquisa +'\') AS VALORTOTALDESPESA,  '+
        ' (SELECT IFNULL (SUM(tbas.VRVALORDESCONTO),0) FROM "VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas WHERE tbas.IDEMPRESA = tbe.IDEMPRESA AND tbas.STATIVO = \'True\' AND tbas.DTLANCAMENTO = \'' + dataPesquisa +'\') AS VALORTOTALADIANTAMENTOSALARIAL  '+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv ' +
        '	INNER JOIN "VAR_DB_NAME".MOVIMENTOCAIXA tbmc ON tbmc.ID = tbv.IDMOVIMENTOCAIXAWEB ' +
        '	INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA ' +
        '	INNER JOIN "VAR_DB_NAME".CAIXA tbc ON tbc.IDCAIXAWEB = tbv.IDCAIXAWEB ' +
        '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbv.IDOPERADOR ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbv.STCANCELADO = \'False\'';
        
    
    if(idDaEmpresa) {
        query = query + ' AND tbv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisa) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
    }
    query = query + ' GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA, tbv.IDCAIXAWEB, tbc.DSCAIXA, tbf.NOFUNCIONARIO, tbv.IDMOVIMENTOCAIXAWEB';
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var venda = {
				"IDEMPRESA": registro.IDEMPRESA,
				"IDMOVIMENTOCAIXAWEB": registro.IDMOVIMENTOCAIXAWEB,
				"NOFANTASIA": registro.NOFANTASIA,
				"IDOPERADOR": registro.IDOPERADOR,
			    "IDCAIXAWEB": registro.IDCAIXAWEB,
			    "DSCAIXA": registro.DSCAIXA,
			    "NOFUNCIONARIO": registro.NOFUNCIONARIO,
			    "VALORTOTALDINHEIRO": registro.VALORTOTALDINHEIRO,
			    "VALORTOTALCARTAO": registro.VALORTOTALCARTAO,
			    "VALORTOTALCONVENIO": registro.VALORTOTALCONVENIO,
			    "VALORTOTALPOS": registro.VALORTOTALPOS,
			    "VALORTOTALVOUCHER": registro.VALORTOTALVOUCHER,
			    "VALORTOTALFATURA": registro.VALORTOTALFATURA,
			    "VALORTOTALDESPESA": registro.VALORTOTALDESPESA,
			    "VALORTOTALADIANTAMENTOSALARIAL": registro.VALORTOTALADIANTAMENTOSALARIAL,
			    "VALORINFORMADO": obterLinhasDoMovimento(registro.IDMOVIMENTOCAIXAWEB),
			    "DEPOSITOS": obterLinhasDoDeposito(registro.IDEMPRESA,dataPesquisa)
			
		};

		data.push(venda);

	}

	response.data = data;

	return response;
}
    
try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet()));
			break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}