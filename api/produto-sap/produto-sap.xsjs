try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var codeBarsOuNome = $.request.parameters.get("codeBarsOuNome");
    var IDEmpresa = $.request.parameters.get("IdEmpresaLoja");
    var IDListaLoja = $.request.parameters.get("IdListaLoja");
    
    codeBarsOuNome = codeBarsOuNome.replace(' ','%');
    
    var queryDeItems = ' SELECT '+
                       '  DATA_ULTIMA_ALTERACAO_PDV, '+
                       '  CODIGO_ITEM, '+
                       '  DESCRICAO_ITEM, '+
                       '  CODIGO_BARRAS, '+
                       '  PRECO_VENDA_PDV, '+
                       '  PRECO_VENDA_SAP, '+
                       '  IFNULL(B."Price",0) AS "PRECO_CUSTO", '+
                       '  ID_LISTA_LOJA, '+
                       '  LISTA_PRECO_LOJA, '+
                       '  PRECO_VENDA_BRASILIA, '+
                       '  LISTA_PRECO_BRASILIA, '+
                       '  IDEMPRESA, '+
                       '  LOJA '+
                       ' FROM SBO_GTO_PRD.RS_PRECO_VENDA_PDV_X_SAP A '+
                       ' INNER JOIN "SBO_GTO_PRD"."ITM1" B ON B."ItemCode" = A.CODIGO_ITEM AND B."PriceList" = 3'+ 
                       ' WHERE 1=? ' +
                       '  and A.ID_LISTA_LOJA = \'' + IDListaLoja + '\' '+
                       '  AND A.IDEMPRESA = \'' + IDEmpresa + '\'  '+
                       '  And  (A.CODIGO_BARRAS = \'' + codeBarsOuNome + '\' OR UPPER(A.DESCRICAO_ITEM) LIKE UPPER(\'%'+codeBarsOuNome+'%\'))  '; 

    
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