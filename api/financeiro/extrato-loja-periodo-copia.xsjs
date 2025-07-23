var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterPrimeiraVendaSaldoAtual(idEmpresa, dataPesquisa){
    
    var query = ' SELECT TO_VARCHAR(MIN(VENDA.DTHORAFECHAMENTO),\'DD-MM-YYYY\') AS DTPRIMEIRAVENDAFORMATADA, '+
        ' TO_VARCHAR(MIN(VENDA.DTHORAFECHAMENTO),\'YYYY-MM-DD\') AS DTPRIMEIRAVENDA '+
		' FROM  ' +
		'   "VAR_DB_NAME".VENDA  ' +
		'  WHERE  ' +
		'   VENDA.STCANCELADO = \'False\' AND VENDA.IDEMPRESA = ?  ';

	var linha = api.sqlQuery(query, idEmpresa);
	var det = linha[0];
	
	//var dataPrimeiraVenda = det.DTPRIMEIRAVENDA;
	var dataPrimeiraVenda = '2020-12-11';
	var partes = dataPesquisa.split("-");
    var ano = partes[0];
    var mes = partes[1] - 1;
    var dia = partes[2];

    var dataFinal = new Date(ano, mes, dia);
    dataFinal.setDate(dataFinal.getDate() - 1);
    
    var dd = ("0" + dataFinal.getDate()).slice(-2);
    var mm = ("0" + (dataFinal.getMonth() + 1)).slice(-2);
    var y = dataFinal.getFullYear();
 
    var dataPesquisaFim = y + '-' + mm + '-' + dd;
	
	var query2 = ' SELECT IFNULL(SUM(VRDESPESA),0) AS VALORTOTALDESPESA, '+
	    '(SELECT IFNULL(SUM(VRRECDINHEIRO - VRTROCO),0) FROM  "VAR_DB_NAME".VENDA WHERE STCANCELADO = \'False\' AND DTHORAFECHAMENTO BETWEEN \'' + dataPrimeiraVenda + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\' AND   IDEMPRESA = '+idEmpresa+')AS VALORTOTALDINHEIRO,'+
    	'(SELECT IFNULL(SUM(VRRECEBIDO),0) FROM  "VAR_DB_NAME".DETALHEFATURA WHERE STCANCELADO = \'False\' AND DTPROCESSAMENTO BETWEEN \'' + dataPrimeiraVenda + '\' AND \'' + dataPesquisaFim + '\' AND   IDEMPRESA = '+idEmpresa+')AS VALORTOTALFATURA,'+
    	'(SELECT IFNULL(SUM(VRDEPOSITO),0) FROM  "VAR_DB_NAME".DEPOSITOLOJA WHERE STCANCELADO = \'False\' AND DTDEPOSITO BETWEEN \'' + dataPrimeiraVenda + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\' AND   IDEMPRESA = '+idEmpresa+')AS VALORTOTALDEPOSITO,'+
    	'(SELECT IFNULL(SUM(VRDEBITO),0) FROM  "VAR_DB_NAME".AJUSTEEXTRATO WHERE STCANCELADO = \'False\' AND DATACADASTRO BETWEEN \'' + dataPrimeiraVenda + ' 00:00:00\' AND \'' + dataPesquisaFim +' 23:59:59\' AND IDEMPRESA = '+idEmpresa+') AS VALORTOTALDEBITOAJUSTE, ' +
        '(SELECT IFNULL(SUM(VRCREDITO),0) FROM  "VAR_DB_NAME".AJUSTEEXTRATO WHERE STCANCELADO = \'False\' AND DATACADASTRO BETWEEN \'' + dataPrimeiraVenda + ' 00:00:00\' AND \'' + dataPesquisaFim +' 23:59:59\' AND IDEMPRESA = '+idEmpresa+') AS VALORTOTALCREDITOAJUSTE ' +
    	' FROM  ' +
		'   "VAR_DB_NAME".DESPESALOJA  ' +
		'  WHERE  ' +
		'  STCANCELADO = \'False\' AND DTDESPESA BETWEEN \'' + dataPrimeiraVenda + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\' AND   IDEMPRESA = ?  ';

	var linha2 = api.sqlQuery(query2, idEmpresa);
	var det2 = linha2[0];
	
	var saldoPositivo = parseFloat(det2.VALORTOTALDINHEIRO) + parseFloat(det2.VALORTOTALFATURA);
	var saldoNegativo = parseFloat(det2.VALORTOTALDESPESA) + parseFloat(det2.VALORTOTALDEPOSITO);
	
    var ajuste = parseFloat(det2.VALORTOTALDEBITOAJUSTE) - parseFloat(det2.VALORTOTALCREDITOAJUSTE);
	
	var saldoAtualizadoAtual = parseFloat(saldoPositivo) - parseFloat(saldoNegativo) + parseFloat(ajuste);
	
	var docLine = {
			
				"DTPRIMEIRAVENDA": det.DTPRIMEIRAVENDAFORMATADA,
				"DTULTIMAPESQ": dataPesquisaFim,
		        "VALORTOTALDESPESA" :det2.VALORTOTALDESPESA,
		        "VALORTOTALDINHEIRO" :det2.VALORTOTALDINHEIRO,
		        "VALORTOTALFATURA" :det2.VALORTOTALFATURA,
		        "VALORTOTALDEPOSITO" :det2.VALORTOTALDEPOSITO,
		        "VALORCREDITO" :saldoPositivo.toString(),
		        "VALORDEBITO" :saldoNegativo.toString(),
		        "SALDO" :saldoAtualizadoAtual.toString()
		};

	return docLine;
}

function obterVenda(idEmpresa, dataPesquisa){
    var query = ' SELECT ' +
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'YYYY-MM-DD\') AS DTHORAFECHAMENTO,' +
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD-MM-YYYY\') AS DTHORAFECHAMENTOFORMATADA,' +
		'   SUM(tbv.VRRECDINHEIRO - VRTROCO) AS VRRECDINHEIRO' +
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		' WHERE ' +
		'	IDEMPRESA = ? AND tbv.STCANCELADO=\'False\'';

	if(dataPesquisa) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
    }
    
    query = query + ' GROUP BY TO_VARCHAR(DTHORAFECHAMENTO,\'YYYY-MM-DD\'),TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD-MM-YYYY\')' +
    ' ORDER BY TO_VARCHAR(DTHORAFECHAMENTO,\'YYYY-MM-DD\')';
            
    var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"VRRECDINHEIRO": det.VRRECDINHEIRO,
				"DTHORAFECHAMENTO": det.DTHORAFECHAMENTO,
				"DTHORAFECHAMENTOFORMATADA": det.DTHORAFECHAMENTOFORMATADA
			
		};

		lines.push(docLine);
	}

	return lines;
}

function obterFaturas(idEmpresa, dataPesquisa){
    var query = ' SELECT DTPROCESSAMENTO, '+
            ' TO_VARCHAR(DTPROCESSAMENTO,\'DD-MM-YYYY\') AS DTPROCESSAMENTOFORMATADA, ' +
            ' SUM(VRRECEBIDO) AS VRRECEBIDO' +
		' FROM  ' +
		'   "VAR_DB_NAME".DETALHEFATURA  ' +
		'  WHERE  ' +
		'   IDEMPRESA = ?  ';
		
		
	    query = query + ' AND DTPROCESSAMENTO = \'' + dataPesquisa + '\'';
	    query = query + ' AND STCANCELADO = \'False\'';
        query = query + ' GROUP BY DTPROCESSAMENTO';
        query = query + ' ORDER BY DTPROCESSAMENTO';
        
	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"DTPROCESSAMENTO": det.DTPROCESSAMENTO,
				"DTHORAFECHAMENTO": det.VRRECEBIDO,
				"DTPROCESSAMENTOFORMATADA": det.DTPROCESSAMENTOFORMATADA
			
		};

		lines.push(docLine);
	}

	return lines;
}

function obterDepositos(idEmpresa, dataPesquisa){
    var query = ' SELECT tbdl.IDDEPOSITOLOJA, '+ 
                '   tbdl.DTDEPOSITO, '+ 
                '   tbdl.STCANCELADO, '+
                '   tbdl.STCONFERIDO, '+
                '   tbdl.NUDOCDEPOSITO, '+
                '   TO_VARCHAR(tbdl.DTDEPOSITO,\'DD-MM-YYYY\') AS DTDEPOSITOFORMATADA, ' +
                '   CONCAT(CONCAT(tbb.DSBANCO,\' - \'),tbcb.DSCONTABANCO) AS DSBANCO, '+
                '   CONCAT(CONCAT(tbF.IDFUNCIONARIO,\' - \'),tbF.NOFUNCIONARIO) AS FUNCIONARIO, '+
                '   (tbdl.VRDEPOSITO) AS VRDEPOSITO' +
        		' FROM  ' +
        		'   "VAR_DB_NAME".DEPOSITOLOJA tbdl  ' +
        		'   LEFT JOIN "VAR_DB_NAME".CONTABANCO tbcb  ON tbdl.IDCONTABANCO = tbcb.IDCONTABANCO' +
        		'   LEFT JOIN "VAR_DB_NAME".BANCO tbb  ON tbcb.IDBANCO = tbb.IDBANCO' +
        		'   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbF ON tbdl.IDUSR = tbF.IDFUNCIONARIO' +
        		'  WHERE  ' +
        		'   tbdl.IDEMPRESA = ?  ';
		
		
	    query = query + ' AND tbdl.DTDEPOSITO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\'';
	    query = query + 'AND STCANCELADO = \'False\' '; 
        //query = query + ' GROUP BY DTDEPOSITO, TBB.DSBANCO, TBCB.DSCONTABANCO';
        query = query + ' ORDER BY DTDEPOSITO';
        
	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"IDDEPOSITOLOJA": det.IDDEPOSITOLOJA,
				"DTDEPOSITO": det.DTDEPOSITO,
				"STCANCELADO": det.STCANCELADO,
				"STCONFERIDO": det.STCONFERIDO,
				"NUDOCDEPOSITO": det.NUDOCDEPOSITO,
				"VRDEPOSITO": det.VRDEPOSITO,
				"FUNCIONARIO": det.FUNCIONARIO,
				"DTDEPOSITOFORMATADA": det.DTDEPOSITOFORMATADA,
				"DSBANCO": det.DSBANCO
			
		};

		lines.push(docLine);
	}

	return lines;
}

function obterDespesas(idEmpresa, dataPesquisa){
    var query = ' SELECT tbdl.DTDESPESA, '+
                '   TO_VARCHAR(tbdl.DTDESPESA,\'DD-MM-YYYY\') AS DTDESPESAFORMATADA, ' +
                ' tbdl.VRDESPESA, ' +
                ' tbdl.DSPAGOA, '+
                ' tbdl.STCANCELADO, '+
                ' tbcd.DSCATEGORIA, '+
                ' CAST(tbdl.DSHISTORIO AS TEXT) AS DSHISTORIO '+
		' FROM  ' +
		'   "VAR_DB_NAME".DESPESALOJA tbdl ' +
		'   INNER JOIN "VAR_DB_NAME".CATEGORIARECEITADESPESA tbcd  ON tbdl.IDCATEGORIARECEITADESPESA = tbcd.IDCATEGORIARECDESP' +
		
		'  WHERE  ' +
		'   tbdl.IDEMPRESA = ?  ';
		
	    query = query + ' AND tbdl.DTDESPESA BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\'';
	    query = query + 'AND tbdl.STCANCELADO = \'False\'';
        query = query + ' ORDER BY tbdl.DTDESPESA';
        
	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"DTDESPESA": det.DTDESPESA,
				"VRDESPESA": det.VRDESPESA,
			    "DSHISTORIO": det.DSHISTORIO,
			    "DTDESPESAFORMATADA": det.DTDESPESAFORMATADA,
			    "DSPAGOA": det.DSPAGOA,
			    "DSCATEGORIA": det.DSCATEGORIA,
			    "STCANCELADO": det.STCANCELADO
		};

		lines.push(docLine);
	}

	return lines;
}

function obterAjusteExtrato(idEmpresa, dataPesquisa){
    var query = ' SELECT tbae.IDAJUSTEEXTRATO, '+
                ' tbae.DATACADASTRO, ' +
                ' TO_VARCHAR(tbae.DATACADASTRO,\'DD-MM-YYYY\') AS DTCADASTROFORMATADA, ' +
                ' tbae.VRDEBITO, ' +
                ' tbae.VRCREDITO, ' +
                ' tbae.STCANCELADO, '+
                ' tbae.HISTORICO '+
		' FROM  ' +
		'   "VAR_DB_NAME".AJUSTEEXTRATO tbae ' +
		
		'  WHERE  ' +
		'   tbae.IDEMPRESA = ?  ';
		
	    query = query + ' AND tbae.DATACADASTRO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\'';
        query = query + ' ORDER BY tbae.DATACADASTRO';
        
	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"IDAJUSTEEXTRATO": det.IDAJUSTEEXTRATO,
				"DATACADASTRO": det.DATACADASTRO,
				"VRDEBITO": det.VRDEBITO,
				"VRCREDITO": det.VRCREDITO,
			    "HISTORICO": det.HISTORICO,
			    "DTCADASTROFORMATADA": det.DTCADASTROFORMATADA,
			    "STCANCELADO": det.STCANCELADO
		};

		lines.push(docLine);
	}

	return lines;
}


function fnHandleGet(byId) {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

	var data = [];
    
    var date1 = new Date(dataPesquisaInicio);
    var date2 = new Date(dataPesquisaFim);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    
    
    for (var i=0; i<=diffDays; i++){
        var dataPesquisa = new Date();
        dataPesquisa.setDate(date1.getDate() + (i+1));
        let dataPesquisaFormatada = (dataPesquisa.getFullYear() +"-"+ (dataPesquisa.getMonth() + 1) + "-" + dataPesquisa.getDate()) ; 
        
        
        
        var venda = {
            "venda": obterVenda(idDaEmpresa,dataPesquisaFormatada),
            "totalFaturas": obterFaturas(idDaEmpresa,dataPesquisaFormatada),
			"totalDepositos": obterDepositos(idDaEmpresa,dataPesquisaFormatada),
			"despesas":obterDespesas(idDaEmpresa,dataPesquisaFormatada),
			"ajusteextrato":obterAjusteExtrato(idDaEmpresa,dataPesquisaFormatada),
			"primeiraVendaSaldo": obterPrimeiraVendaSaldoAtual(idDaEmpresa,dataPesquisaInicio)
        };
        data.push(venda);
    }
    return {
	    data : data
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

			
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}