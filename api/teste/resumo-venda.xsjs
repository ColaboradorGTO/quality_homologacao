var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
        
    var dataPesquisa = $.request.parameters.get("dataFechamento");
    
    var queryDeResumo = ' SELECT ' +
        ' COUNT(DISTINCT rv.IDVENDA) AS QTDCLIENTE, ' +
        ' round(SUM(rv.VALORPAGO - rv.VALORVOUCHER),2) AS VALORTOTAL, ' +
        ' round((SUM(rv.VALORPAGO - rv.VALORVOUCHER)/COUNT(DISTINCT rv.IDVENDA)),2) AS TICKETMEDIO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".VW_VENDAS rv ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and rv.STCANCELADO = \'False\'';
    
    if(idDaEmpresa) {
        queryDeResumo = queryDeResumo + ' AND rv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }

    if(dataPesquisa) {
        queryDeResumo = queryDeResumo + ' AND (rv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
    }   

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