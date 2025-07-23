var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var numColetor = $.request.parameters.get("numColetor");
    var query = ' SELECT TO_INT(COUNT(1)) AS QTD_PRODUTOS_COLETOR' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEBALANCO tbdb' +
    '   INNER JOIN "VAR_DB_NAME".RESUMOBALANCO tbrb ON tbrb.IDRESUMOBALANCO = tbdb.IDRESUMOBALANCO' +
    ' WHERE ' +
        '	1 = ? AND tbrb.STATIVO = \'True\'';
    
    if ( idEmpresa ) {
        query = query + ' And  tbrb.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(numColetor){
        query = query + ' And  tbdb.NUMEROCOLETOR = \'' + numColetor + '\' ';
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