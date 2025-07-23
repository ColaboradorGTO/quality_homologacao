var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idResumoPromocaoMarketing = $.request.parameters.get("idResumoPromocaoMarketing");
    
	var query = ' SELECT ' +
    	'   tbdpmd."IDDETALHEPROMOCAOMARKETINGDESTINO",' +
    	'   tbdpmd."IDRESUMOPROMOCAOMARKETING", ' +
    	'   tbdpmd."IDGRUPOEMDESTINO", ' +
    	'   tbdpmd."IDSUBGRUPOEMDESTINO", ' +
    	'   tbdpmd."IDMARCAEMDESTINO", ' +
    	'   tbdpmd."IDFORNECEDOREMDESTINO", ' +
    	'   tbdpmd."IDPRODUTODESTINO" ' +
    	' FROM ' +
		'   "VAR_DB_NAME".DETALHEPROMOCAOMARKETINGDESTINO tbdpmd' +
		' WHERE ' +
		'	1 = ? ' ;

	if (byId) {
		query = query + ' And  tbdpmd.IDDETALHEPROMOCAOMARKETINGDESTINO = \'' + byId + '\' ';
	}
	
	if(idResumoPromocaoMarketing){
	    query = query + ' And tbdpmd.IDRESUMOPROMOCAOMARKETING = \'' + idResumoPromocaoMarketing + '\' ';
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