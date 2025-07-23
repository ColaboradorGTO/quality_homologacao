var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var query = ' SELECT ' +
        ' tbe.IDEMPRESA, '+
        ' tbe.NOFANTASIA, '+
        ' tbvp.NOAUTORIZADOR, '+
        ' UPPER(tbvp.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTO, '+
        ' COUNT(1) AS QTDE, '+
        ' IFNULL (SUM(tbvp.VALORRECEBIDO),0) AS VALORRECEBIDO '+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDAPAGAMENTO tbvp ' +
        '	INNER JOIN "VAR_DB_NAME".VENDA tbv ON tbvp.IDVENDA = tbv.IDVENDA ' +
        '	INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbv.STCANCELADO = \'False\''+
        ' AND tbvp.DSTIPOPAGAMENTO NOT IN(\'DINHEIRO\',\'Voucher\',\'Vale Funcionário\')';
        
    
    if(idDaEmpresa) {
        query = query + ' AND tbv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisa) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
    }
    query = query + ' GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA, tbvp.NOAUTORIZADOR, tbvp.DSTIPOPAGAMENTO';
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