var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var descComprador = $.request.parameters.get("descComprador");
    var idComprador = $.request.parameters.get("idComprador");

    var query = ' SELECT ' + 
    '   A.IDFUNCIONARIO, ' + 
    '   A.NOFUNCIONARIO, ' +  
    '   A.NUCPF, ' + 
    '   A.DSFUNCAO, ' + 
    '   A.STATIVO ' + 
    '   FROM "VAR_DB_NAME".FUNCIONARIO A ' + 
    ' WHERE ' +
        '	1 = ?'+
        '   AND A.STATIVO = \'True\' '+
        '   AND (A.DSFUNCAO LIKE \'%Compras%\' OR A.IDPERFIL = 2) ';
    
    if(idComprador){
        query = query + ' And  A.IDFUNCIONARIO IN ( ' + idComprador + ')  ';
    }
    
    if ( byId ) {
        query = query + ' And  A.IDFUNCIONARIO = \'' + byId + '\' ';
    }

    if ( descComprador ) {
        query = query + ' And  (A.NOFUNCIONARIO LIKE \'%'+descComprador+'%\' OR A.NOFUNCIONARIO LIKE \'%'+descComprador+'%\' ) ';
    }
    

    query = query + ' ORDER BY A."NOFUNCIONARIO"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
}

function fnHandlePost(){
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
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
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}