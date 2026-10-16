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
 
	let query = `
        SELECT
            IDRESUMOINTEGRACAOOTB,
            NOMEAPI,
            TO_VARCHAR(DTHORAINICIO, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAINICIO,
            TO_VARCHAR(DTHORAFIM, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAFIM,
            TOTALREGISTROS,
            TOTALLOTES,
            TOTALLOTESSUCESSO,
            TOTALLOTESERRO,
            STATUS
        FROM
            "VAR_DB_NAME".RESUMOINTEGRACAOOTB
        WHERE
            1 = ?
	`;

	if (byId) {
		query += ` AND IDRESUMOINTEGRACAOOTB = ${byId} `;
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
        query += ` AND (TO_DATE(DTHORAINICIO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }

    query += ' ORDER BY IDRESUMOINTEGRACAOOTB ';
    
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