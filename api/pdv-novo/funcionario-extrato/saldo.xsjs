var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
     var nuCpf = $.request.parameters.get("cpf");
     var idFuncionario = $.request.parameters.get("idFuncionario");
    
    var query = ' SELECT ' + 
    '   tbfe.ID,' +
    '   tbfe.IDFUNCIONARIO,' +
    '   tbf.NOFUNCIONARIO,' +
    '   tbf.NUCPF,' +
    '   IFNULL(tbfe.VLSALDOFINAL,0) AS VLSALDOFINAL' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIOEXTRATO tbfe ON tbf.IDFUNCIONARIO = tbfe.IDFUNCIONARIO' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbfe.ID = \'' + byId + '\' ';
    }
    
    if ( nuCpf ) {
        query = query + ' And  tbf.NUCPF = \'' + nuCpf + '\' ';
    }
    
    if ( idFuncionario ) {
        query = query + ' And  tbf.IDFUNCIONARIO = \'' + idFuncionario + '\' ';
    }
    
    query = query + ' ORDER BY tbfe.ID DESC';

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