var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataFechamento = $.request.parameters.get("dataFechamento");    
    var numMatricula = $.request.parameters.get("numMatricula");
    
    var query = ' SELECT '+
				 '	( tbv.VRRECVOUCHER) AS VOUCHERVENDEDOR '+
				 ' FROM '+
				 '	"VAR_DB_NAME".VENDADETALHE tbvd ' +
				 '	LEFT JOIN "VAR_DB_NAME".VENDA tbv ON  tbvd.IDVENDA = tbv.IDVENDA ' +
				 ' WHERE '+
				 '	1 = ?'+
				 '	AND tbv.STCANCELADO = \'FALSE\'  '+
				 '	AND tbvd.STCANCELADO = \'FALSE\'  ';
    if(numMatricula) {
        query = query + ' AND tbvd.VENDEDOR_MATRICULA = \'' + numMatricula + '\' ';
    }
    
    if(idEmpresa) {
        query = query + ' AND tbv.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataFechamento) {
        query = query + ' AND (tbv.DTHORAFECHAMENTO  BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\')';
    }
    
    query = query + 'GROUP BY tbv.IDVENDA, tbv.VRRECVOUCHER ';
    
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