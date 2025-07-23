var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var numeroCfp = $.request.parameters.get("numeroCfp");
    
    if(!numeroCfp) {
        throw "O Camnpo Número do CPF é um parametro obrigatório !";
    }
    
      
    var query = ' SELECT ' + 
    '   tbf.ID,' +
    '   tbf.IDFUNCIONARIO,' +
    '   tbf.IDGRUPOEMPRESARIAL,' +
    '   tbf.IDSUBGRUPOEMPRESARIAL,' +
    '   tbf.IDEMPRESA,' +
    '   tbf.NOFUNCIONARIO,' +
    '   tbf.IDPERFIL,' +
    '   tbf.NUCPF,' +
    '   tbf.NOLOGIN,' +
    '   tbf.PWSENHA,' +
    '   tbf.DSFUNCAO,' +
    '   tbf.DATAULTIMAALTERACAO,' +
    '   tbf.VALORSALARIO,' +
    '   tbf.DATA_DEMISSAO,' +
    '   tbf.PERC,' +
    '   tbf.VALORDISPONIVEL,' +
    '   tbf.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    ' WHERE ' +
        '	1 = ? '+
        '   and tbf.DATA_DEMISSAO is null and tbf.STATIVO=\'True\''+
        '   and tbf.DSTIPO = \'MARKETING\'';
    if(numeroCfp) {
        query = query + ' And  tbf.NUCPF = \'' + numeroCfp + '\' ';
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