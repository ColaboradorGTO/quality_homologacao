var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var idDoProduto = $.request.parameters.get("idProduto");
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var query = ' SELECT DISTINCT ' +
        '   (select count(1) from QUALITY_CONC_HML.vendadetalhe T3 where T3.idvenda=T1.idvenda) as "TOTALPRODUTOVENDA",  ' +
        '   T1.IDVENDA  ' +
        ' FROM ' +
        '	QUALITY_CONC_HML.VENDA T1 ' +
        '	INNER JOIN QUALITY_CONC_HML.VENDADETALHE T2 ON T2.IDVENDA = T1.IDVENDA ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and T1.STCANCELADO = \'False\' and T2. STCANCELADO = \'False\' and T1.VRRECVOUCHER = 0'+
        '   AND NOT EXISTS (SELECT * FROM QUALITY_CONC_HML.RESUMOVOUCHER T3 WHERE T3.IDRESUMOVENDAWEB = T1.IDVENDA)';
    
    if(idDaEmpresa) {
        query = query + ' AND T1.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisa) {
        query = query + ' AND T1.DTHORAFECHAMENTO <= \'' + dataPesquisa + ' 23:59:00\' ';
    }
    if(idDoProduto){
         query = query + ' AND T2.CPROD in( \'' + idDoProduto + '\') ';
    }
    query = query + 'ORDER BY TOTALPRODUTOVENDA';
    
    
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