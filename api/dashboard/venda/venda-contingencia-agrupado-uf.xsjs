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
 
	if(!dataPesquisaInicio || !dataPesquisaFim) {
        throw new Error('Os parametros de dataPesquisaInicio e dataPesquisaFim são obrigatórios');
    }
    
	let query = `
        SELECT
            TBE.SGUF AS UF,
            COUNT(TBV.IDVENDA) AS QTDTOTALVENDAS
        FROM
            "VAR_DB_NAME".VENDA TBV 
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBV.IDEMPRESA = TBE.IDEMPRESA 
        WHERE 
            1 = ?
            AND TBV.STCANCELADO = 'False'
            AND TBV.STCONTINGENCIA = 'True'
            AND (TO_DATE(TBV.DTHORAFECHAMENTO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}')
        GROUP BY 
            TBE.SGUF
            --,TBV.PROTNFE_INFPROT_XMOTIVO
        ORDER BY 
            TBE.SGUF
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