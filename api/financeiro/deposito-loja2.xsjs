var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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
        ' (SELECT IFNULL (SUM(tbdf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbdf WHERE tbdf.IDEMPRESA = tbe.IDEMPRESA AND tbdf.DTPROCESSAMENTO = \'' + dataPesquisa +'\') AS VALORTOTALFATURA,  '+
        ' (SELECT IFNULL (SUM(tbd.VRDESPESA),0) FROM "VAR_DB_NAME".DESPESALOJA tbd WHERE tbd.IDEMPRESA = tbe.IDEMPRESA AND tbd.DTDESPESA = \'' + dataPesquisa +'\') AS VALORTOTALDESPESA,  '+
        ' (SELECT IFNULL (SUM(tbas.VRVALORDESCONTO),0) FROM "VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas WHERE tbas.IDEMPRESA = tbe.IDEMPRESA AND tbas.DTLANCAMENTO = \'' + dataPesquisa +'\') AS VALORTOTALADIANTAMENTOSALARIAL  '+
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
//////////////////////////////////////////////////////////////////////////////////////////
try {
    var idDepositoLoja = $.request.parameters.get("id");
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var query = ' SELECT ' +
        ' tbdl.IDDEPOSITOLOJA, ' +
        ' TO_VARCHAR(tbdl.DTMOVIMENTOCAIXA,\'DD/mm/YYYY HH24:MI:SS\') AS DTMOVIMENTOCAIXA, ' +
        ' TO_VARCHAR(tbdl.DTDEPOSITO,\'DD/mm/YYYY HH24:MI:SS\') AS DTDEPOSITO, ' +
        ' tbdl.DSHISTORIO, ' +
        ' tbdl.NUDOCDEPOSITO, ' +
        ' tbdl.VRDEPOSITO, ' +
        ' tbdl.STATIVO, ' +
        ' tbcb.DSCONTABANCO, ' +
        ' tbf.NOFUNCIONARIO, ' +
        ' tbe.NOFANTASIA ' +
    	' FROM ' +
        '	"VAR_DB_NAME".DEPOSITOLOJA tbdl ' +
        '   INNER JOIN "VAR_DB_NAME".CONTABANCO tbcb ON tbdl.IDCONTABANCO = tbcb.IDCONTABANCO ' +
        '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbdl.IDUSR = tbf.IDFUNCIONARIO ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbdl.IDEMPRESA = tbe.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ?' ;
        
    if(idDepositoLoja) {
        query = query + ' AND tbdl.IDDEPOSITOLOJA = \'' + idDepositoLoja + '\' ';
    }
    if(idDaEmpresa) {
        query = query + ' AND tbdl.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbdl.DTDEPOSITO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}