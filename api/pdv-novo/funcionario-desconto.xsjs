var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    var idFuncionario = $.request.parameters.get("id");
   
    
    if(!idFuncionario) {
        throw "O Campo ID é um parametro obrigatório !";
    }
   
    
      
    var query = ' SELECT ' + 
    '   tbf.IDFUNCIONARIO,' +
    '   tbf.NOFUNCIONARIO,' +
    '   tbf.NUCPF,' +
    '   IFNULL(tbf.PERCDESCPDV,0) AS PERCDESCPDV,' +
    '   IFNULL(tbf.PERCDESCUSUAUTORIZADO,0) AS PERCDESCUSUAUTORIZADO,' +
    '   IFNULL(TO_VARCHAR(tbf.DTINICIODESC,\'YYYY-mm-DD HH24:MI:SS\'),\'2021-01-01 00:00:00\') AS DTINICIODESC, ' +
    '   IFNULL(TO_VARCHAR(tbf.DTFIMDESC,\'YYYY-mm-DD HH24:MI:SS\'),\'2021-01-01 00:00:00\') AS DTFIMDESC ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    ' WHERE ' +
        '	1 = ? '+
        '   and tbf.DATA_DEMISSAO is null and tbf.STATIVO=\'True\'';
    if(idFuncionario) {
        query = query + ' And  tbf.IDFUNCIONARIO = \'' + idFuncionario + '\' ';
    } 
    
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}