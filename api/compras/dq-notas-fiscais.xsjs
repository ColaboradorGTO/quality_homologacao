var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {

    var query = 'SELECT' +
                '   dep.IDRESUMOENTRADA, dep.IDPRODUTO, dep.XPROD, dep.CEAN, dep.VUNCOM, rep.STSALDO, SUM(DISTINCT dep.QCOM) AS QTD, rep.NNF ' +
                '   ,IFNULL((SELECT SUM(DISTINCT pn1.QTDPRODUTO) - SUM(dpi.QUANTIDADE) ' +
                    '       FROM "VAR_DB_NAME".DQ_PRODUTOSNOTAS pn1 ' + 
                    '       INNER JOIN "VAR_DB_NAME".DQ_DISTRIBUICAOPRODUTOITENS dpi ON dpi.IDPRODUTOSNOTAS = pn1.IDPRODUTOSNOTAS AND dpi.STATIVO = \'True\' ' +
                    '       WHERE pn1.STATIVO = \'True\' ' +
                    '       AND pn1.IDNOTASAP = dep.IDRESUMOENTRADA ' +
                    '       AND pn1.IDPRODUTO = dep.IDPRODUTO), SUM(DISTINCT dep.QCOM)) AS QTDRESTANTE ' +
                'FROM "VAR_DB_NAME".DETALHEENTRADANFEPEDIDO dep ' +
                'INNER JOIN "VAR_DB_NAME".RESUMOENTRADANFEPEDIDO rep ON rep.IDRESUMOENTRADA = dep.IDRESUMOENTRADA ' +
                'LEFT JOIN "VAR_DB_NAME".DQ_PRODUTOSNOTAS pn ON pn.IDNOTASAP = dep.IDRESUMOENTRADA AND pn.IDPRODUTO = dep.IDPRODUTO ' +
                'WHERE 1 = ? ';
    if(byId){
        query = query + 'AND dep.IDRESUMOENTRADA IN (' + byId + '\) ';
    }
    query = query + 'GROUP BY dep.IDRESUMOENTRADA, dep.IDPRODUTO, dep.XPROD, dep.CEAN, dep.VUNCOM, rep.STSALDO, rep.NNF ';
    query = query + 'ORDER BY dep.IDRESUMOENTRADA';

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
    switch ($.request.method) {
        //Handle your PUT calls here
        /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
        break;
        
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
            $.response.setBody(JSON.stringify(doc));
        break;*/
        
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
        break;
        
        default:
        break;
    }
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}