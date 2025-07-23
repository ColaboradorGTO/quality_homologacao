var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var IDVoucher = $.request.parameters.get("idvoucher");  

	var query = ' SELECT ' + 
                '   tbdv.IDVOUCHER,' +
                '   tbdv.IDDETALHEVOUCHER, ' +
                '   tbrv.NUVOUCHER, ' +
            	'   tbdv.IDPRODUTO, ' +
            	'   tbp.DSNOME AS DSPRODUTO, ' +
            	'   tbp.NUCODBARRAS, ' +
            	'   tbdv.QTD, ' +
            	'   tbdv.VRUNIT, ' +
            	'   tbdv.VRTOTALBRUTO, ' +
            	'   tbdv.VRDESCONTO, ' +
            	'   tbdv.VRTOTALLIQUIDO, ' +
            	'   tbdv.STATIVO, ' +
            	'   tbdv.STCANCELADO ' +
                ' FROM ' + 
                '   "VAR_DB_NAME".DETALHEVOUCHER tbdv' +
                '	INNER JOIN "VAR_DB_NAME".RESUMOVOUCHER tbrv ON tbdv.IDVOUCHER = tbrv.IDVOUCHER ' +
                '	INNER JOIN "VAR_DB_NAME".PRODUTO tbp ON tbp.IDPRODUTO = tbdv.IDPRODUTO ' +
        ' WHERE ' +
        '	1 = ?';
        
    if(IDVoucher) {
        query = query + ' AND tbdv.IDVOUCHER = \'' + IDVoucher + '\' ';

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