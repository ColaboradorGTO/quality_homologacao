try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var dsProduto = $.request.parameters.get("dsProduto");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
    var queryIdListaLoja = 'SELECT ID_LISTA_LOJA FROM "VAR_DB_NAME"."EMPRESA" WHERE IDEMPRESA= ?';
	var IdListaLoja = api.executeScalar(queryIdListaLoja, idEmpresa);
    
    dsProduto = dsProduto.replace(' ','%');
    
    var query = ' SELECT '+
                       '  A.DATA_ULTIMA_ALTERACAO_PDV, '+
                       '  TO_VARCHAR(A.DATA_ULTIMA_ALTERACAO_PDV,\'DD-MM-YYYY HH24:MI:SS\') AS DATA_ULTIMA_ALTERACAO_PDV, ' +
                       '  A.CODIGO_ITEM, '+
                       '  A.DESCRICAO_ITEM, '+
                       '  A.CODIGO_BARRAS, '+
                       '  A.PRECO_VENDA_PDV, '+
                       '  A.PRECO_VENDA_SAP, '+
                       '  ROUND(IFNULL(B."Price",0),2) AS "PRECO_CUSTO", '+
                       '  A.ID_LISTA_LOJA, '+
                       '  A.LISTA_PRECO_LOJA, '+
                       '  A.PRECO_VENDA_BRASILIA, '+
                       '  A.LISTA_PRECO_BRASILIA, '+
                       '  A.IDEMPRESA, '+
                       '  A.LOJA '+
                       ' FROM '+ 
                       ' SBO_GTO_PRD.RS_PRECO_VENDA_PDV_X_SAP A '+
                       ' INNER JOIN "SBO_GTO_PRD"."ITM1" B ON B."ItemCode" = A.CODIGO_ITEM AND B."PriceList" = 3'+ 
                       ' INNER JOIN "QUALITY_CONC"."VW_PRODUTO_ESTRUTURA_MERCADOLOGICA" C ON C.IDPRODUTO = B."ItemCode" '+ 
                       ' WHERE 1=? and A.ID_LISTA_LOJA = \'' + IdListaLoja + '\'' +
                       '  AND A.IDEMPRESA = \'' + idEmpresa + '\'  ';
                       
   
    if ( dsProduto ) {
        query = query + '  And  (A.CODIGO_BARRAS = \'' + dsProduto + '\' OR UPPER(A.DESCRICAO_ITEM) LIKE UPPER(\'%'+dsProduto+'%\'))  '; 
    }
    query = query + ' ORDER BY  A.CODIGO_ITEM ';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}