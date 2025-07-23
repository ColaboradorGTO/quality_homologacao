var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

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
    
    var idMarca = $.request.parameters.get("idMarca");
    var IdEmpresa = $.request.parameters.get("idEmpresa");
    var cpfquebraop = $.request.parameters.get("cpfquebraop");
    var dataPesquisaInic = $.request.parameters.get("dataPesquisaInic"); 
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim"); 
    var stQuebraPositivaNegativa = $.request.parameters.get("stQuebraPositivaNegativa");
    
    
    var query = ' SELECT ' +  
    '   tbqc.IDQUEBRACAIXA, ' +
    '   tbemp.NOFANTASIA, ' +
	'   tbqc.IDCAIXAWEB, ' +
	'   tbqc.IDMOVIMENTOCAIXA, ' +
	'   tbqc.IDGERENTE, ' +
	'   tbqc.IDFUNCIONARIO, ' +
	'   TO_VARCHAR(tbqc.DTLANCAMENTO,\'DD-MM-YYYY\') AS DTLANCAMENTO, ' +
	'   tbqc.VRQUEBRASISTEMA, ' +
	'   tbqc.VRQUEBRAEFETIVADO, ' +
	'   tbqc.TXTHISTORICO, ' +
	'   tbqc.STATIVO, ' +
    '   tbf.NOFUNCIONARIO AS NOMEOPERADOR,' +
    '   tbf.DSFUNCAO,' +
    '   tbf.NUCPF AS CPFOPERADOR,' +
    '   tbf1.NOFUNCIONARIO AS NOMEGERENTE' +
    ' FROM ' + 
    '   "VAR_DB_NAME".QUEBRACAIXA tbqc' +
    '   LEFT JOIN "VAR_DB_NAME".MOVIMENTOCAIXA tbmc ON tbqc.IDMOVIMENTOCAIXA = tbmc.ID' +
    '   LEFT JOIN "VAR_DB_NAME".EMPRESA tbemp ON tbmc.IDEMPRESA = tbemp.IDEMPRESA' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbqc.IDFUNCIONARIO = tbf.IDFUNCIONARIO' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf1 ON tbqc.IDGERENTE = tbf1.IDFUNCIONARIO' +
    ' WHERE ' +
        '	1 = ? ';
    
    if ( byId ) {
        query = query + ' And tbqc.IDMOVIMENTOCAIXA = \'' + byId + '\' '; 
    }
    
    if ( idMarca >0) {
        query = query + ' And tbemp.IDGRUPOEMPRESARIAL IN (' + idMarca + ') ';
    }
    
    if ( IdEmpresa >0 ) {
        query = query + ' And tbmc.IDEMPRESA IN (' + IdEmpresa + ') ';
    }
    
    if ( cpfquebraop >0 ) {
        query = query + ' And tbf.NUCPF = \'' + cpfquebraop + '\' ';
    }
    
    if(dataPesquisaInic) {
        query = query + ' AND (tbqc.DTLANCAMENTO BETWEEN \'' + dataPesquisaInic + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        
    }
    if(stQuebraPositivaNegativa){
        if(stQuebraPositivaNegativa == "Positiva"){
                query = query + ' And tbqc.VRQUEBRASISTEMA >= 0.0  ';
        }else{
             query = query + ' And tbqc.VRQUEBRASISTEMA < 0.0  ';
        }
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