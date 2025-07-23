var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var nomeTef = $.request.parameters.get("nomeTef");
    var nomeAutorizador= $.request.parameters.get("nomeAutorizador");
    var numeroParcelas= $.request.parameters.get("numeroParcelas");
    
    var query = ' SELECT DISTINCT' +
        
        ' UPPER(tbvp.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTO, '+
        ' tbvp.NOCARTAO, '+
        ' tbvp.NUOPERACAO, '+
        ' tbvp.NOTEF, '+
        ' tbvp.NSUTEF, '+
        ' tbvp.NOAUTORIZADOR, '+
        ' IFNULL (tbvp.NUAUTORIZACAO,\'NÃO INFORMADO\') AS NUAUTORIZACAO, '+
        ' tbvp.NSUAUTORIZADORA, '+
        ' IFNULL (TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD/mm/YYYY\'),\'NÃO INFORMADO\') AS DTHORAFECHAMENTO, ' + 
        ' IFNULL (tbvp.NPARCELAS,0) AS NPARCELAS, '+
        ' IFNULL (SUM(tbvp.VALORRECEBIDO)OVER(PARTITION BY tbv.IDVENDA),0) AS VALORRECEBIDO, '+
        ' tbv.IDVENDA '+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDAPAGAMENTO tbvp ' +
        '	INNER JOIN "VAR_DB_NAME".VENDA tbv ON tbvp.IDVENDA = tbv.IDVENDA ' +
        '	INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbv.STCANCELADO = \'False\''+
        ' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO is null)'+
        ' AND (tbvp.NOTEF = \'POS\' OR tbvp.NOTEF = \'TEF\')';
        
    
    if(idDaEmpresa) {
        query = query + ' AND tbv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    if(nomeTef){
        query = query + ' AND tbvp.NOTEF = \'' + nomeTef + '\' ';
    }
    if(nomeAutorizador){
        query = query + ' AND tbvp.NOAUTORIZADOR = \'' + nomeAutorizador + '\' ';
    }
    if(numeroParcelas > 0){
        query = query + ' AND tbvp.NPARCELAS = \'' + numeroParcelas + '\' ';
    }else{
        query = query + ' AND (tbvp.NPARCELAS is null OR tbvp.NPARCELAS = 0)  ';
    }
    
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    //$.response.setBody(JSON.stringify({ message : query.toString() }));
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}