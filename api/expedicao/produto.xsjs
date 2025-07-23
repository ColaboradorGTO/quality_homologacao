var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idEmpresa = parseInt($.request.parameters.get("idEmpresa"));
    var descProduto = $.request.parameters.get("descProduto");
    
    if(idEmpresa <= 0) {
        throw "O parâmetro IdEmpresa é Obrigatório!";
    }
    
    var query = ' SELECT p.IDPRODUTO, p.NUCODBARRAS, p.DSNOME ' +
                ' ,IFNULL(pp.PRECO_VENDA, p.PRECOVENDA) As PRECOVENDA ' +
                ' ,IFNULL(p.PRECOCUSTO, 0) As PRECOCUSTO ' +
                ' FROM "VAR_DB_NAME".PRODUTO p ' +
                ' LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO pp ON pp.IDPRODUTO = p.IDPRODUTO AND pp.IDEMPRESA = \'' + idEmpresa + '\' ' +
                ' WHERE 1 = ? ';
    if ( byId ) {
        query = query + ' AND p.NUCODBARRAS = \'' + byId + '\' ';
    }
    if ( descProduto ) {
        query += `AND CONTAINS((p.NUCODBARRAS, p.DSNOME), '%${descProduto}%') `;
    }
    
    /*$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(query));
	$.response.status = $.net.http.OK;
    return;*/
    
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
        /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;*/
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
            
        //Handle your POST calls here
        /*case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;*/
        default:
            break;
    }

} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}