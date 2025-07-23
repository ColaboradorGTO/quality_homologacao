var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idEstGrupo = $.request.parameters.get("idEstGrupo");
    var idVincEstiloGrupo = $.request.parameters.get("idVincEstiloGrupo");

    var query2 = 'SELECT' +
    '   t1.IDVINCESTILOSESTRUTURA, '+
    '   t1.IDGRUPOESTRUTURA, ' +
    '   t2.IDESTILO, ' +
	'   t2.DSESTILO' +
	' FROM "VAR_DB_NAME"."VINCESTILOSGRUPOESTRUTURA" t1' +
    '   INNER JOIN "VAR_DB_NAME"."ESTILOS" t2 on t1.IDESTILO = t2.IDESTILO ' +
    ' WHERE 1=? ';
    

    if(idVincEstiloGrupo){
        query2 = query2 + ' AND t1.IDVINCESTILOSESTRUTURA=\'' + idVincEstiloGrupo + '\' ';
    }
    
    if (idEstGrupo>0) {
		query2 = query2 + ' And t1.IDGRUPOESTRUTURA = \'' + idEstGrupo + '\' ';
	}
   
    query2 = query2 + ' ORDER BY t2.DSESTILO ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query2, request, 1);
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