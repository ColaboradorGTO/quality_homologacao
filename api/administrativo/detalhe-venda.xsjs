var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idVenda = $.request.parameters.get("idVenda");    
    var statusCancelado = $.request.parameters.get("status");
    
    var query = 'SELECT '+ 
                '   tbvd.IDVENDADETALHE, ' +
                '   tbvd.IDVENDA, ' +
            	'   tbp.NUCODBARRAS, ' +
            	'   tbp.DSNOME, ' +
            	'   tbvd.QTD, ' +
            	'   tbvd.VUNCOM, ' +
            	'   tbvd.VRTOTALLIQUIDO, ' +
            	'   tbvd.STCANCELADO, ' +
            	'   tbvd.VENDEDOR_MATRICULA, ' +
            	'   tbvd.VENDEDOR_NOME  ' +
                ' FROM '+
                '	"VAR_DB_NAME".VENDADETALHE tbvd '+
		        '   INNER JOIN "VAR_DB_NAME".VENDA tbv ON tbvd.IDVENDA = tbv.IDVENDA ' +
		        '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp ON tbvd.CPROD = tbp.IDPRODUTO ' +
		        ' WHERE '+
                '	1 = ?';
    if(idVenda) {
        query = query + ' AND tbv.IDVENDA = \'' + idVenda + '\' ';
    }
    
    if(idEmpresa) {
        query = query + ' AND tbv.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
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