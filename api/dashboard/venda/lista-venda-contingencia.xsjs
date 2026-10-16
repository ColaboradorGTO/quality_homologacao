var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idMarca = $.request.parameters.get("idGrupoEmpresarial");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesqInicial = $.request.parameters.get("dataInicio"); 
    var dataPesqFinal = $.request.parameters.get("dataFim");

    var query = `SELECT
		TBE."NOFANTASIA",
		TBE."SGUF" AS "UF",
		TBV."IDVENDA",
		TBV."NFE_INFNFE_IDE_SERIE" AS "SERIE",
		TBV."NFE_INFNFE_IDE_NNF" AS "NF",
		TBV."PROTNFE_INFPROT_CHNFE" AS "CHAVENFE",
		TBV."NFE_INFNFE_ID" AS "IDCHAVENFE",
		TBV."STCONTINGENCIA",
		TBV."VRTOTALPAGO",
		TBV."PROTNFE_INFPROT_CSTAT",
		TBV."PROTNFE_INFPROT_XMOTIVO",
		TBV."DTHORAFECHAMENTO"
	FROM
		"VAR_DB_NAME"."VENDA" TBV
	INNER JOIN "VAR_DB_NAME"."EMPRESA" TBE ON
		TBV."IDEMPRESA" = TBE."IDEMPRESA"
	WHERE
		    1 = ?
		AND
			TBV."STCANCELADO" = 'False'
		AND 
			TBV."STCONTINGENCIA" = 'True'`;
    
    if(byId){
        query += ' AND TBV.IDVENDA='+byId;
    }
    
    if(dataPesqInicial && dataPesqFinal){
        query += ' AND (TO_DATE(TBV.DTHORAFECHAMENTO) BETWEEN \'' + dataPesqInicial + ' 00:00:00\' AND \'' + dataPesqFinal + ' 23:59:59\')';
    } 
    
    if(idMarca){
        query += ' AND TBE.IDGRUPOEMPRESARIAL='+idMarca;
    }
    
    if(idEmpresa){
       query += ' And  TBE.IDEMPRESA IN (' + idEmpresa + ') ';
    }
    
    query += ' ORDER BY TBV.DTHORAFECHAMENTO ';
    
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
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}