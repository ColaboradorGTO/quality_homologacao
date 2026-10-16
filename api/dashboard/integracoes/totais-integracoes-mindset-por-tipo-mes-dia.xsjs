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
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
	let query = `
        SELECT
           TBR.NOMEAPI,
            SUM(COALESCE(TBD.TOTALREGISTROS, 0)) AS QTDTOTALMES,
            SUM(
                CASE
                    WHEN TO_DATE(TBR.DTHORAINICIO) = CURRENT_DATE THEN TBD.TOTALREGISTROS 
                    ELSE 0
                END
            ) AS QTDTOTALDIA
        FROM
            "VAR_DB_NAME".RESUMOINTEGRACAOOTB TBR
        LEFT JOIN "VAR_DB_NAME".DETALHEINTEGRACAOOTB TBD ON 
            TBR.IDRESUMOINTEGRACAOOTB = TBD.IDRESUMOINTEGRACAOOTB AND TBD.STATUS = 'SUCESSO'
        WHERE
            1 = ?
	`;

	if (byId) {
		query += ` AND TBR.IDRESUMOINTEGRACAOOTB = ${byId} `;
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
        query += ` AND (TO_DATE(TBR.DTHORAINICIO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }
    
    query += `
        GROUP BY 
            TBR.NOMEAPI
        ORDER BY 
            TBR.NOMEAPI
    `;

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