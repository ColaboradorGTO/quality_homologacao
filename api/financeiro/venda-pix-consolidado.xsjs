var api = $.import("quality.concentrador.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {
    
    var idDaMarca = $.request.parameters.get("idMarca");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

	var query = ' SELECT ' +
		'   tbse.DSSUBGRUPOEMPRESARIAL,' +
		'   IFNULL (SUM(tbvp.VALORRECEBIDO),0) AS PIX' +
    	' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		'   INNER JOIN "VAR_DB_NAME".VENDAPAGAMENTO tbvp on tbv.IDVENDA = tbvp.IDVENDA' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe on tbv.IDEMPRESA = tbe.IDEMPRESA' +
		'   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbse on tbe.IDSUBGRUPOEMPRESARIAL = tbse.IDSUBGRUPOEMPRESARIAL' +
		' WHERE ' +
		'	1 = ? ' +
        ' AND tbv.STCANCELADO = \'False\''+
        ' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL)'+
        ' AND tbvp.NOTEF = \'PIX\' AND tbvp.DSTIPOPAGAMENTO=\'PIX\'';

	if (byId) {
		query = query + ' And  tbe.IDGRUPOEMPRESARIAL = \'' + idDaMarca + '\' ';
	}
	
	if (idDaMarca == 0) {
		query = query + ' And  tbe.IDGRUPOEMPRESARIAL IN (1,2,3,4)  ';
	}else{
	    query = query + ' And  tbe.IDGRUPOEMPRESARIAL = \'' + idDaMarca + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

    query = query + ' GROUP BY tbse.DSSUBGRUPOEMPRESARIAL ';
    
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
            
       
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}