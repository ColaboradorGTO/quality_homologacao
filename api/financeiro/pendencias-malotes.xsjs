let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let idMalote = $.request.parameters.get("idMalote");
    let statusMalote = $.request.parameters.get("statusMalote");

	let query = `
        SELECT 
            IDPENDENCIA,
            TO_VARCHAR(TXTPENDENCIA) AS TXTPENDENCIA
        FROM
            "VAR_DB_NAME".PENDENCIASMALOTE TBL
        WHERE
            1 = ?
            AND TBL.STATIVO = 'True'
	`;
	
	let request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
        
		//Handle your GET calls here
		case $.net.http.GET:
			let id = $.request.parameters.get("id");
		    fnHandleGet(id);
			break;
		
	}

 } catch (e) {
    var detalheError = e.stack ? e.stack.split('\n') : '';
    
    detalheError = detalheError ? detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim() : '';
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message || e,
        detalheError
    }));
    $.response.status = 400;
}