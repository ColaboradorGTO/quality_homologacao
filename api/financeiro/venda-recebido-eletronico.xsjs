var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var query = ' SELECT ' +
        ' tbe.IDEMPRESA, '+
        ' tbe.NOFANTASIA, '+
        ' tbvp.NOAUTORIZADOR, '+
        ' tbvp.NOTEF, '+
        ' IFNULL (tbvp.NPARCELAS,0) AS NPARCELAS, '+
        ' UPPER(tbvp.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTO, '+
        ' COUNT(1) AS QTDE, '+
        ' IFNULL (SUM(tbvp.VALORRECEBIDO),0) AS VALORRECEBIDO, '+
        ' COUNT( DISTINCT tbvp.NUAUTORIZACAO ) AS QTDPGTOS '+
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
    query = query + ' GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA, tbvp.NOAUTORIZADOR, UPPER(tbvp.DSTIPOPAGAMENTO), IFNULL (tbvp.NPARCELAS,0), tbvp.NOTEF ';
    query = query + ' ORDER BY tbe.IDEMPRESA';
    
    
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