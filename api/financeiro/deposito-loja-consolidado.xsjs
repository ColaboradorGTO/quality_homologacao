var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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


    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var dataCompInicio = $.request.parameters.get("dataCompInicio");
    var dataCompFim = $.request.parameters.get("dataCompFim");
    var dataMovInicio = $.request.parameters.get("datamovinicio");
    var dataMovFim = $.request.parameters.get("datamovfim");

	
        if(dataPesquisaInicio && dataPesquisaFim) {
               var tipodatapesq = "d.DTDEPOSITO";
               var datapesqini = dataPesquisaInicio;
               var datapesqfin = dataPesquisaFim;
        }
        if(dataCompInicio && dataCompFim) {
               var tipodatapesq = "d.DTCOMPENSACAO";
               var datapesqini = dataCompInicio;
               var datapesqfin = dataCompFim;
        }
        if(dataMovInicio && dataMovFim) {
               var tipodatapesq = "d.DTMOVIMENTOCAIXA";
               var datapesqini = dataMovInicio;
               var datapesqfin = dataMovFim;
               
        }


    var query = '     SELECT DISTINCT  ' +
        ' tbsge.DSSUBGRUPOEMPRESARIAL,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 43 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\' ' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPBB,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 218 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPITAU,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 58 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPBRAD,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10006 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPBRB,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10018 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPCX,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10008 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPSANT,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10 AND d.STATIVO = \'True\'AND d.STCANCELADO = \'False\' ' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPCXTES,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10024 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPTED,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10019 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPCREDS,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10021 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPDPIX,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10022 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPDDIN,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10023 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPPROM,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 3 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPTVALOR,' +
        ' (SELECT IFNULL (SUM(d.VRDEPOSITO),0) FROM "VAR_DB_NAME".DEPOSITOLOJA d ' +
        ' 	INNER JOIN "VAR_DB_NAME".EMPRESA tbe1 ON d.IDEMPRESA = tbe1.IDEMPRESA' +
        ' 	INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge1 ON tbe1.IDSUBGRUPOEMPRESARIAL = tbsge1.IDSUBGRUPOEMPRESARIAL' +
        ' 	WHERE tbsge1.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL AND d.IDCONTABANCO = 10020 AND d.STATIVO = \'True\' AND d.STCANCELADO = \'False\'' +
        ' 	AND (' + tipodatapesq + ' BETWEEN \'' + datapesqini + ' 00:00:00\' AND \'' + datapesqfin + ' 23:59:59\')) AS TOTALDEPDEVCX' +
    	' FROM ' +
        ' "VAR_DB_NAME".DEPOSITOLOJA tbdl ' +
        ' INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbdl.IDEMPRESA = tbe.IDEMPRESA ' +
        ' INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbsge ON tbe.IDSUBGRUPOEMPRESARIAL = tbsge.IDSUBGRUPOEMPRESARIAL' + 
        ' WHERE ' +
        '	1 = ?' ;

        if ( byId ) {
            query = query + ' And  tbdl.IDDEPOSITOLOJA = \'' + byId + '\' ';
        }
    
        if(dataPesquisaInicio && dataPesquisaFim) {
                query = query + ' AND (tbdl.DTDEPOSITO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        }
        if(dataCompInicio && dataCompFim) {
                query = query + ' AND (tbdl.DTCOMPENSACAO BETWEEN \'' + dataCompInicio + ' 00:00:00\' AND \'' + dataCompFim + ' 23:59:59\')';
        }
        if(dataMovInicio && dataMovFim) {
                query = query + ' AND (tbdl.DTMOVIMENTOCAIXA BETWEEN \'' + dataMovInicio + ' 00:00:00\' AND \'' + dataMovFim + ' 23:59:59\')';
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
            
       
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}