var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var noLogin = $.request.parameters.get("login");
    var pwSenha = $.request.parameters.get("senha");
    
    if(!noLogin) {
        throw "O Campo Login é um parametro obrigatório !";
    }
    if(!pwSenha) {
        throw "O Campo Senha é um parametro obrigatório !";
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
    '   tbf.STATIVO,' +
    '   IFNULL(tbf.PERCDESCPDV,0) AS PERCDESCPDV' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    ' WHERE ' +
        '	1 = ? '+
        '   and tbf.DATA_DEMISSAO is null and tbf.STATIVO=\'True\'';
    if(noLogin) {
        query = query + ' And  tbf.NOLOGIN = \'' + noLogin + '\' ';
    } 
    if(pwSenha) {
        query = query + ' And  tbf.PWSENHA = \'' + pwSenha + '\' ';
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