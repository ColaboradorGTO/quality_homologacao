try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var codeBarsOuNome = $.request.parameters.get("codeBarsOuNome");
    var IDEmpresa = $.request.parameters.get("IdEmpresaLoja");
    var IDListaLoja = $.request.parameters.get("IdListaLoja");
    
    codeBarsOuNome = codeBarsOuNome.replace(' ','%');
    
    var queryDeItems = ' SELECT '+
                       '  TO_VARCHAR(T1.DTULTALTERACAO,\'DD/MM/YYYY HH24:MI:SS\') AS DTULTALTERACAO,'+
                       '  T1.IDPRODUTO, '+
                       '  T1.DSNOME, '+
                       '  T1.NUCODBARRAS, '+
                       '  T2.PRECO_VENDA '+
                       ' FROM QUALITY_CONC_HML.PRODUTO T1 '+
                       ' INNER JOIN "QUALITY_CONC_HML"."PRODUTO_PRECO" T2 ON T2."IDPRODUTO" = T1.IDPRODUTO'+ 
                       ' WHERE 1=? ' +
                       '  AND T2.IDEMPRESA = \'' + IDEmpresa + '\'  '+
                       '  And  (T1.NUCODBARRAS = \'' + codeBarsOuNome + '\' OR UPPER(T1.DSNOME) LIKE UPPER(\'%'+codeBarsOuNome+'%\'))  '; 

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(queryDeItems, request, 1);
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}