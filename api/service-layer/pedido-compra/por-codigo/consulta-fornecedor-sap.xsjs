var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function fnHandleGet(byId) {

    var descFornecedor = $.request.parameters.get("descFornecedor");
    var cnpjfor = $.request.parameters.get("cnpjfor");
    var cnpjforsemformat = $.request.parameters.get("cnpjforsemformat");

    var query = ' select "CardCode" from "SBO_GTO_TESTE4".OCRD where 1=? AND ("CardName" LIKE \'%'+ descFornecedor.toString()+'%\' OR "LicTradNum" = \'' + cnpjfor + '\' OR "LicTradNum" = \'' + cnpjforsemformat + '\')';

    if ( byId ) {
        query = query + ' And  CardCode = \'' + byId + '\' ';
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