var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    
    var dataPrimeiraVenda = '2020-12-11';
	var partes = dataPesquisa.split("-");
    var ano = partes[0];
    var mes = partes[1] - 1;
    var dia = partes[2];

    var dataFinal = new Date(ano, mes, dia);
    //dataFinal.setDate(dataFinal.getDate() - 1);
    
    var dd = ("0" + dataFinal.getDate()).slice(-2);
    var mm = ("0" + (dataFinal.getMonth() + 1)).slice(-2);
    var y = dataFinal.getFullYear();

    var dataPesquisaFim = y + '-' + mm + '-' + dd;
    
    var query = ' SELECT ' + 
    '  tbe.IDEMPRESA, ' +
    '  tbe.NUCNPJ, ' +
    '  tbe.NOFANTASIA, ' +
    '  (SELECT IFNULL(SUM(VRRECDINHEIRO - VRTROCO),0) FROM QUALITY_CONC_HML.VENDA WHERE STCANCELADO = \'False\' AND DTHORAFECHAMENTO BETWEEN \'2020-12-11 00:00:00\' AND \'' + dataPesquisaFim +' 23:59:59\' AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALDINHEIRO, ' +
    '  (SELECT IFNULL(SUM(VRRECEBIDO),0) FROM QUALITY_CONC_HML.DETALHEFATURA WHERE STCANCELADO = \'False\' AND (STPIX = \'False\' OR STPIX IS NULL) AND DTPROCESSAMENTO BETWEEN \'2020-12-11 00:00:00\' AND \'' + dataPesquisaFim +' 23:59:59\' AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALFATURA, ' +
    '  (SELECT IFNULL(SUM(VRDEPOSITO),0) FROM QUALITY_CONC_HML.DEPOSITOLOJA WHERE STCANCELADO = \'False\' AND DTDEPOSITO BETWEEN \'2020-12-11 00:00:00\' AND \'' + dataPesquisaFim +' 23:59:59\' AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALDEPOSITO, ' +
    '  (SELECT IFNULL(SUM(VRDEBITO),0) FROM QUALITY_CONC_HML.AJUSTEEXTRATO WHERE STCANCELADO = \'False\' AND DATACADASTRO BETWEEN \'2020-12-11 00:00:00\' AND \'' + dataPesquisaFim +' 23:59:59\' AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALDEBITO, ' +
    '  (SELECT IFNULL(SUM(VRCREDITO),0) FROM QUALITY_CONC_HML.AJUSTEEXTRATO WHERE STCANCELADO = \'False\' AND DATACADASTRO BETWEEN \'2020-12-11 00:00:00\' AND \'' + dataPesquisaFim +' 23:59:59\' AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALCREDITO, ' +
    '  (SELECT IFNULL(SUM(VRVALORDESCONTO),0) FROM QUALITY_CONC_HML.ADIANTAMENTOSALARIAL WHERE STATIVO = \'True\' AND DTLANCAMENTO BETWEEN \'2020-12-11 00:00:00\' AND \'' + dataPesquisaFim +' 23:59:59\' AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALADINAT, ' +
    '  (SELECT IFNULL(SUM(VRDESPESA),0) FROM QUALITY_CONC_HML.DESPESALOJA WHERE STCANCELADO = \'False\' AND DTDESPESA BETWEEN \'2020-12-11 00:00:00\' AND \'' + dataPesquisaFim +' 23:59:59\' AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALDESPESA ' +
    '  FROM  ' +
    '  QUALITY_CONC_HML.EMPRESA tbe ' +
	'  WHERE 1 = ? ' +
	'  AND tbe.IDGRUPOEMPRESARIAL = '+idGrupoEmpresarial+
    '  ORDER BY tbe.IDEMPRESA ASC ';
    
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
