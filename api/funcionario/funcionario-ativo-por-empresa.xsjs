var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idEmpresa) {
        throw "O Campo Empresa é um parametro obrigatório !";
    }
    
      
    var query = ' SELECT ' + 
    '   tbf.ID,' +
    '   tbf.IDFUNCIONARIO,' +
    '   tbf.IDGRUPOEMPRESARIAL,' +
    '   tbf.IDSUBGRUPOEMPRESARIAL,' +
    '   tbf.IDEMPRESA,' +
    '   upper(tbf.NOFUNCIONARIO) as NOFUNCIONARIO,' +
    '   tbf.IDPERFIL,' +
    '   tbf.NUCPF,' +
    '   tbf.NOLOGIN,' +
    '   tbf.PWSENHA,' +
    '   tbf.DSFUNCAO,' +
    '   tbf.DATAULTIMAALTERACAO,' +
    '   tbf.VALORSALARIO,' +
    '   tbf.DATA_DEMISSAO,' +
    '   tbf.PERC,' +
    '   tbf.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    ' WHERE ' +
        '	1 = ? '+
        '   and tbf.DATA_DEMISSAO is null and tbf.STATIVO=\'True\''+
        '   and tbf.DSTIPO = \'FUNCIONARIO\' and (dsfuncao=\'Assistente De Loja\' or dsfuncao=\'Gerente\' or dsfuncao = \'Vendedor\' or dsfuncao = \'Vendedora\')';
    if(idEmpresa) {
        query = query + ' And  tbf.IDEMPRESA = \'' + idEmpresa + '\' ';
    } 
    query = query + 'order by tbf.NOFUNCIONARIO';
    
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