var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    let dataInicio = $.request.parameters.get("dataInicio");
    let dataFim = $.request.parameters.get("dataFim");
    let idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let stCancelado = $.request.parameters.get("stCancelado");
    let stContingencia = $.request.parameters.get("stContingencia");
    
	let query = `
        SELECT 
            TBV."IDVENDA",
            TBE."NOFANTASIA",
            TBV."NFE_INFNFE_IDE_SERIE" AS "SERIE",
            TBV."NFE_INFNFE_IDE_NNF" AS "NF",
            TBV."PROTNFE_INFPROT_CHNFE" AS "CHAVENFE",
            TBV."NFE_INFNFE_ID" AS "IDCHAVENFE",
            TBV."STCONTINGENCIA",
            TBV."STCANCELADO",
            TBV."TXTMOTIVOCANCELAMENTO",
            TBV."VRTOTALPAGO",
            TBV."PROTNFE_INFPROT_CSTAT",
            TBV."PROTNFE_INFPROT_XMOTIVO",
            TBV."DTHORAFECHAMENTO",
            BASE64_DECODE(CAST(TBV2."XML" AS NVARCHAR(40000))) AS "XML_FORMATADO"
		FROM
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBV.IDEMPRESA = TBE.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".VENDAXML TBV2 ON
            TBV.IDVENDA = TBV2.IDVENDA
		WHERE
		    1 = ? 
    `;

	if (byId) {
		query += ` AND TBV.IDVENDA = '${byId}' `;
	}
	
	if(dataInicio && dataFim){
	    query += ` AND TBV.DTHORAFECHAMENTO BETWEEN '${dataInicio} 00:00:00' AND '${dataFim} 23:59:59' `;
	}
	
	if (idGrupoEmpresarial) {
		query += ` AND TBE.IDGRUPOEMPRESARIAL = '${idGrupoEmpresarial}' `;
	}
	
	if (idEmpresa) {
		query += ` AND TBE.IDEMPRESA = '${idEmpresa}' `;
	}
	
	if(stCancelado){
		query += ` AND TBV."STCANCELADO" = '${stCancelado}' `;
	}
	
	if(stContingencia){
		query += ` AND TBV."STCONTINGENCIA" = '${stContingencia}' `;
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
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			fnHandleGet(id);
			break;

		//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		default:
			break;
			
		//Handle your PUt calls here
	    case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}