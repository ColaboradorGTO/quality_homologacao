var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idProduto = $.request.parameters.get("idProduto");
    var nuCodBarras = $.request.parameters.get("nuCodBarras");

    var query = ' SELECT ' + 
    '   tbp.ID,' +
    '   tbp.IDPRODUTO,' +
    '   tbp.NUCODBARRAS,' +
    '   tbp.DSNOME,' +
    '   tbp.PRECOVENDA,' +
    '   tbp.PRECOVENDA2,' +
    '   IDEMPRESA ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".PRODUTOSEMDESCONTO tbp' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbp.ID = \'' + byId + '\' ';
    }
    
    if(idEmpresa){
	    query = query + ' and tbp.IDEMPRESA = ' + idEmpresa;
	}
	
	if(idProduto){
	    query = query + ' and tbp.IDPRODUTO = \'' + idProduto + '\' ';
	}
	
	if(nuCodBarras){
	    query = query + ' and tbp.NUCODBARRAS = \'' + nuCodBarras + '\' ';
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