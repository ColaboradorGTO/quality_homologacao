var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var queryDeResumo = ' SELECT ' +
        ' round((rv.VRRECFATURA),2) AS VRRECFATURA, ' +
        ' round(SUM(rv.VALORDINHEIRO),2) AS VALORDINHEIRO, ' +
        ' round(SUM(rv.VALORCARTAO),2) AS VALORCARTAO, ' +
        ' round(SUM(rv.VALORPOS),2) AS VALORPOS, ' +
        ' (SELECT IFNULL (SUM(tbd.VRDESPESA),0) FROM "VAR_DB_NAME".DESPESALOJA tbd WHERE tbd.DTDESPESA = \'' + dataPesquisa +'\') AS VALORTOTALDESPESA,  '+
        ' (SELECT IFNULL (SUM(tbas.VRVALORDESCONTO),0) FROM "VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas WHERE tbas.DTLANCAMENTO = \'' + dataPesquisa +'\') AS VALORTOTALADIANTAMENTOSALARIAL  '+
        ' FROM ' +
        '	"VAR_DB_NAME".VW_VENDAS rv ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and rv.STCANCELADO = \'False\'';

    if(dataPesquisa) {
        queryDeResumo = queryDeResumo + ' AND (rv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
    }   

	queryDeResumo = queryDeResumo + 'GROUP BY rv.VRRECFATURA';
	
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(queryDeResumo, request, 1);
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}