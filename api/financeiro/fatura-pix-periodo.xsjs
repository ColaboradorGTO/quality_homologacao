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
    
    var idDaMarca = $.request.parameters.get("idMarca");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

	var query = ' SELECT ' +
                '   tbdf.IDDETALHEFATURA,' +
                '   tbdf.IDEMPRESA,' +
                '   tbe.NOFANTASIA,' +
                '   tbdf.IDFUNCIONARIO,' +
                '   tbdf.IDDETALHEFATURALOCAL,' +
                '   tbdf.IDCAIXAWEB,' +
                '   tbdf.IDCAIXALOCAL,' +
                '   tbdf.NUESTABELECIMENTO,' +
                '   tbdf.NUCARTAO,' +
                '   TO_VARCHAR(tbdf.DTPROCESSAMENTO,\'DD-MM-YYYY\') AS DTPROCESSAMENTO, ' +
                '   TO_VARCHAR(tbdf.HRPROCESSAMENTO,\'HH24:MI:SS\') AS HRPROCESSAMENTO, ' +
                '   tbdf.NUNSU,' +
                '   tbdf.NUNSUHOST,' +
                '   tbdf.NUCODAUTORIZACAO,' +
                '   tbdf.VRRECEBIDO,' +
                '   TO_VARCHAR(tbdf.DTHRMIGRACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTHRMIGRACAO, ' +
                '   tbdf.STCANCELADO,' +
                '   tbdf.IDUSRCACELAMENTO,' +
                '   tbf.NOFUNCIONARIO,' +
                '   tbc.DSCAIXA,' +
                '   tbdf.IDMOVIMENTOCAIXAWEB,' +
                '   tbdf.TXTMOTIVOCANCELAMENTO,' +
                '   tbdf.STPIX,' +
                '   tbdf.NUAUTORIZACAO,' +
                '   tbmc.STCONFERIDO' +
                ' FROM ' + 
                '   "VAR_DB_NAME".DETALHEFATURA tbdf' +
                '   INNER JOIN "VAR_DB_NAME".CAIXA tbc ON tbc.IDCAIXAWEB = tbdf.IDCAIXAWEB '+
                '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbdf.IDFuncionario = tbf.IDFuncionario '+
                '   LEFT JOIN "VAR_DB_NAME".MOVIMENTOCAIXA tbmc ON tbdf.IDMOVIMENTOCAIXAWEB = tbmc.ID '+
		        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe on tbdf.IDEMPRESA = tbe.IDEMPRESA' +
		' WHERE ' +
		'	1 = ? ' +
        ' AND tbdf.STCANCELADO = \'False\''+
        ' AND tbdf.STPIX = \'True\'';


	if (byId) {
		query = query + ' And  tbe.IDEMPRESA = \'' + byId + '\' ';
	}
	
	if (idDaMarca) {
		query = query + ' And  tbe.IDGRUPOEMPRESARIAL = \'' + idDaMarca + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbdf.DTPROCESSAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

    query = query + ' ORDER BY tbe.NOFANTASIA, tbdf.DTPROCESSAMENTO ';

    
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