var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idDaLoja = $.request.parameters.get("idLoja");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
 
	var query = ' SELECT DISTINCT ' +
	    '   (SELECT IFNULL (COUNT(VENDA.IDVENDA),0) FROM "VAR_DB_NAME".VENDA WHERE VENDA.IDEMPRESA = VWV.IDEMPRESA AND VENDA.STCANCELADO=\'False\' AND (VENDA.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')) AS QTDVENDA,' +
		'   VWV.IDEMPRESA,' +
		'   VWV.NOFANTASIA,' +
	    '   SUM(VWV.QTD*VWV.VUNCOM) AS TOTALBRUTO,' +
		'   SUM(VWV.VDESC) AS TOTALDESCONTO,' +
		'   SUM(VWV.VRRECVOUCHER) AS VRRECVOUCHER'+
		' FROM ' +
		'   "VAR_DB_NAME".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO VWV' +
		' WHERE ' +
		'	1 = ? ';

	if (byId) {
		query = query + ' And  VWV.IDEMPRESA = \'' + byId + '\' ';
	}
	
	if (idDaLoja) {
		query = query + ' And  VWV.IDEMPRESA = \'' + idDaLoja + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (VWV.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    query = query + 'GROUP BY  VWV.IDEMPRESA,VWV.NOFANTASIA';
    query = query + ' ORDER BY VWV.IDEMPRESA ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}


try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
            
       
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}