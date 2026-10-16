var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    var codeBars = $.request.parameters.get("codeBars");
    var dsProduto = $.request.parameters.get("dsProduto");
    var idProduto = $.request.parameters.get("idProduto");
    
    var query = `
        SELECT DISTINCT
            tbp.IDPRODUTO,
            tbp.IDGRUPOEMPRESARIAL,
            tbp.NUCODBARRAS,
            tbp.DSNOME,
            tbp.IDSUBGRUPO
        FROM "VAR_DB_NAME".PRODUTO tbp
            WHERE 1 = ?
    `;
  

    
    if (idProduto) {
        query = query + ' AND  tbp.IDPRODUTO = \'' + idProduto + '\' ';
    }
    
    
    if ( codeBars ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codeBars + '\' ';
    }
    
   
    
    if ( dsProduto ) {
        query += `AND CONTAINS((tbp.IDPRODUTO, tbp.DSNOME, tbp.NUCODBARRAS), '%${dsProduto}%') `;
    }
    
    query = query + ' ORDER BY  tbp.IDPRODUTO ';
    
   /* $.response.contentType = 'application/json';
		$.response.setBody(JSON.stringify(query));
		$.response.status = $.net.http.OK;
		return;*/
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePost() {
    var body = $.request.body ? $.request.body.asString() : '';
    var postData = {};
    
    try {
        var parsedBody = JSON.parse(body);
        // Se foi enviado como array, pega o primeiro elemento
        if (Array.isArray(parsedBody) && parsedBody.length > 0) {
            postData = parsedBody[0];
        } else {
            postData = parsedBody;
        }
    } catch (e) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ message: "Invalid JSON in request body" }));
        $.response.status = 400;
        return;
    }
    
   
    var codeBars = postData.codeBars || $.request.parameters.get("codeBars");
    var dsProduto = postData.dsProduto || $.request.parameters.get("dsProduto");
    var idProduto = postData.idProduto || $.request.parameters.get("idProduto");
    
    // Validação: Deve ter pelo menos um filtro para evitar retornar todos os produtos
    if (!idProduto && !codeBars && !dsProduto && !dataUltAtualizacao) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ 
            message: "At least one filter is required: idProduto, codeBars, dsProduto, or dataUltAtualizacao",
            received: postData
        }));
        $.response.status = 400;
        return;
    }
    
    var query = `
        SELECT DISTINCT
            tbp.IDPRODUTO,
            tbp.NUCODBARRAS,
            tbp.DSNOME,
            tbp.IDSUBGRUPO,
            tbs.DSSUBGRUPOESTRUTURA,
            tbs.IDSUBGRUPOESTRUTURA
        FROM "VAR_DB_NAME".PRODUTO tbp
        INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA tbs ON tbp.IDSUBGRUPO = tbs.IDSUBGRUPOESTRUTURA
            WHERE 1 = ?
    `;
    
    if (idProduto) {
        var ids;
        if (Array.isArray(idProduto)) {
            // Se idProduto é um array, junta os IDs
            ids = idProduto.map(function(id) { return "'" + String(id).trim() + "'"; }).join(',');
        } else {
            // Se idProduto é uma string, trata como antes
            ids = String(idProduto).split(',').map(function(id) { return "'" + id.trim() + "'"; }).join(',');
        }
        // Log para debug
       
        query = query + ' AND tbp.IDPRODUTO IN (' + ids + ') ';
    }
    
    if ( codeBars ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codeBars + '\' ';
    }
    
    if ( dsProduto ) {
        query += `AND CONTAINS((tbp.IDPRODUTO, tbp.DSNOME, tbp.NUCODBARRAS), '%${dsProduto}%') `;
    }
    
    query = query + ' ORDER BY  tbp.IDPRODUTO ';
    
    var request = { 
        page: postData.page || $.request.parameters.get("page"),
        pageSize: postData.pageSize || $.request.parameters.get("pageSize")
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
      case $.net.http.POST:
            fnHandlePost();
            break;
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}