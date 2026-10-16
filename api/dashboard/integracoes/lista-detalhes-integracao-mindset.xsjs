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
    let idResumoIntegracaoOTB = $.request.parameters.get("idResumoIntegracaoOTB");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
 
	let query = `
        SELECT
            TBR.IDRESUMOINTEGRACAOOTB,
            TBR.NOMEAPI,
            TBD.IDDETALHEINTEGRACAOOTB,
            TO_VARCHAR(TBD.DTHORAINICIO, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAINICIO,
            TO_VARCHAR(TBD.DTHORAFIM, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAFIM,
            TBD.NUMEROLOTE,
            TBD.REGISTROINICIAL,
            TBD.REGISTROFINAL,
            TBD.TOTALREGISTROS,
            TBD.TENTATIVAS,
            TBD.STATUS,
            TBD.MSGERROR
        FROM
            "VAR_DB_NAME".RESUMOINTEGRACAOOTB TBR
        INNER JOIN "VAR_DB_NAME".DETALHEINTEGRACAOOTB TBD ON 
            TBR.IDRESUMOINTEGRACAOOTB = TBD.IDRESUMOINTEGRACAOOTB
        WHERE
            1 = ?
	`;

	if (byId) {
		query += ` AND TBR.IDRESUMOINTEGRACAOOTB = ${byId} `;
	}
	
    query += ' ORDER BY TBR.IDRESUMOINTEGRACAOOTB, TBD.IDDETALHEINTEGRACAOOTB ';
    
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