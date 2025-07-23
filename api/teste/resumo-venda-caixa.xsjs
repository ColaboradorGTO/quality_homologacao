var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataFechamento = $.request.parameters.get("dataFechamento");    
    var statusCancelado = $.request.parameters.get("status");
    
    var query = ' SELECT ' +
        ' DISTINCT (rv.IDVENDA) AS IDVENDA, ' +
		' rv.DSCAIXA, ' +
        ' TO_VARCHAR(rv.DTHORAFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
		' rv.NOFUNCIONARIO, ' +
        ' rv.TXTMOTIVOCANCELAMENTO, ' +
		' CASE ' +
		' WHEN rv.STCONTINGENCIA = \'False\' THEN \'Emitida\' ' +
        ' ELSE \'Contigência\' END AS STCONTINGENCIA, ' +
		' rv.NFE_INFNFE_IDE_NNF, ' +
		' round(SUM(rv.VALORPAGO),2) AS VALORVENDA ' +
        ' FROM ' +
        '	"VAR_DB_NAME".VW_VENDAS rv ' +
        ' WHERE ' +
        '	1 = ?';

    if(statusCancelado) {
        query = query + ' AND rv.STCANCELADO = \'' + statusCancelado + '\' ';
    }
    
    if(idEmpresa) {
        query = query + ' AND rv.IDEMPRESA = \'' + idEmpresa + '\' ';
    
        if(dataFechamento) {
            query = query + ' AND (rv.DTHORAFECHAMENTO BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\')';
        }
    }
    
	query = query + 'GROUP BY rv.IDVENDA, rv.DSCAIXA, rv.DTHORAFECHAMENTO, rv.NOFUNCIONARIO, rv.STCONTINGENCIA, rv.NFE_INFNFE_IDE_NNF, rv.TXTMOTIVOCANCELAMENTO';

    
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