var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idResumoPromocaoMarketing = $.request.parameters.get("idResumoPromocaoMarketing");
    
	var query = ' SELECT ' +
    	'   tbdpmo."IDDETALHEPROMOCAOMARKETINGORIGEM",' +
    	'   tbdpmo."IDRESUMOPROMOCAOMARKETING", ' +
    	'   tbdpmo."IDGRUPOEMORIGEM", ' +
    	'   tbdpmo."IDSUBGRUPOEMORIGEM", ' +
    	'   tbdpmo."IDMARCAEMORIGEM", ' +
    	'   tbdpmo."IDFORNECEDOREMORIGEM", ' +
    	'   tbdpmo."IDPRODUTOORIGEM" ' +
    	' FROM ' +
		'   "VAR_DB_NAME".DETALHEPROMOCAOMARKETINGORIGEM tbdpmo' +
		' WHERE ' +
		'	1 = ? ' ;

	if (byId) {
		query = query + ' And  tbdpmo.IDDETALHEPROMOCAOMARKETINGORIGEM = \'' + byId + '\' ';
	}
	
	if(idResumoPromocaoMarketing){
	    query = query + ' And tbdpmo.IDRESUMOPROMOCAOMARKETING = \'' + idResumoPromocaoMarketing + '\' ';
	}
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}