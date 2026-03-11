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
    let idMarca = $.request.parameters.get("idMarca");
    let IdEmpresa = $.request.parameters.get("idEmpresa");
    let cpfquebraop = $.request.parameters.get("cpfquebraop");
    let dataPesquisaInic = $.request.parameters.get("dataPesquisaInic"); 
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim"); 
    let stQuebraPositivaNegativa = $.request.parameters.get("stQuebraPositivaNegativa");
    
    let query = `
        SELECT  
            TBQC.IDQUEBRACAIXA, 
            TBE.NOFANTASIA, 
            TBQC.IDCAIXAWEB, 
            TBQC.IDMOVIMENTOCAIXA, 
            TBQC.IDGERENTE, 
            TBQC.IDFUNCIONARIO, 
            TO_VARCHAR(TBQC.DTLANCAMENTO,'DD-MM-YYYY') AS DTLANCAMENTO, 
            TBQC.VRQUEBRASISTEMA, 
            TBQC.VRQUEBRAEFETIVADO, 
            TBQC.TXTHISTORICO, 
            TBQC.STATIVO, 
            TBQC.STCONFERIDO,
            TBQC.IDUSRCONFERENCIA,
            TBF.NOFUNCIONARIO AS NOMEOPERADOR,
            TBF.DSFUNCAO,
            TBF.NUCPF AS CPFOPERADOR,
            TBF1.NOFUNCIONARIO AS NOMEGERENTE
        FROM 
            "VAR_DB_NAME".QUEBRACAIXA TBQC
        LEFT JOIN "VAR_DB_NAME".MOVIMENTOCAIXA TBMC ON 
            TBQC.IDMOVIMENTOCAIXA = TBMC.ID
        LEFT JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBMC.IDEMPRESA = TBE.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON 
            TBQC.IDFUNCIONARIO = TBF.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBF1 ON 
            TBQC.IDGERENTE = TBF1.IDFUNCIONARIO
        WHERE
            1 = ?
    `;
    
    if ( byId ) {
        query = query + ' And tbqc.IDMOVIMENTOCAIXA = \'' + byId + '\' '; 
    }
    
    if ( idMarca >0) {
        query = query + ' And TBE.IDGRUPOEMPRESARIAL IN (' + idMarca + ') ';
    }
    
    if ( IdEmpresa >0 ) {
        query = query + ' And tbmc.IDEMPRESA IN (' + IdEmpresa + ') ';
    }
    
    if ( cpfquebraop.length > 0 ) {
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
  
    let request = { 
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