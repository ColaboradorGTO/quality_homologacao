var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idvincfornfab = $.request.parameters.get("idvincfornfab");
    var idfornpedido = $.request.parameters.get("idfornpedido");
    var idfornpedidosap = $.request.parameters.get("idfornpedidosap");
    var idfabnpedido = $.request.parameters.get("idfabnpedido");

    var query2 = 'SELECT' +
    '   t1.IDFABRICANTEFORN, '+
    '   t1.IDFORNECEDOR, '+
    '   t1.IDFABRICANTE, ' +
    '   t1.STATIVO, ' +
	'   t2.DSFABRICANTE,' +
	'   t2.IDSAP AS IDFABSAP,' +
	'   t3.NOFANTASIA AS DSFORNECEDOR,' +
	'   t3.NORAZAOSOCIAL AS RSFORNECEDOR,' +
	'   t3.NUCNPJ AS CNPJFORNECEDOR' +
	' FROM "VAR_DB_NAME"."VINCFABRICANTEFORN" t1' +
    '   INNER JOIN "VAR_DB_NAME"."FABRICANTE" t2 on t1.IDFABRICANTE = t2.IDFABRICANTE ' +
    '   INNER JOIN "VAR_DB_NAME"."FORNECEDOR" t3 on t1.IDFORNECEDOR = t3.IDFORNECEDOR ' +
    ' WHERE 1=? ';

    if (idvincfornfab>0) {
		query2 = query2 + ' And t1.IDFABRICANTEFORN = \'' + idvincfornfab + '\' ';
	}
    if (idfornpedido>0) {
		query2 = query2 + ' And t1.IDFORNECEDOR = \'' + idfornpedido + '\' ';
	}
    if (idfornpedidosap) {
		query2 = query2 + ' And t3.IDFORNECEDORSAP = \'' + idfornpedidosap + '\' ';
	}
    if (idfabnpedido>0) {
		query2 = query2 + ' And t1.IDFABRICANTE = \'' + idfabnpedido + '\' ';
	}
    if (idfabnpedido>0 && idfornpedido>0) {
		query2 = query2 + ' And (t1.IDFABRICANTE = \'' + idfabnpedido + '\' AND t1.IDFORNECEDOR = \'' + idfornpedido + '\') ';
	}
    query2 = query2 + ' ORDER BY t2.DSFABRICANTE ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query2, request, 1);
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