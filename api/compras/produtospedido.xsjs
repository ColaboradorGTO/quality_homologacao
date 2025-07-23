try {
    
   var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var PesqProd = $.request.parameters.get("PesqProd");
    var IdForn = $.request.parameters.get("IdForn");
        
    var query = `
        SELECT 
            A.IDPRODUTO,
            A.DSNOME,
            A.NUCODBARRAS,
            A.PRECOCUSTO,
            A.PRECOVENDA,
            A.NUREFERENCIA,
            A.IDFABRICANTE,
            (SELECT IDUNIDADEMEDIDA FROM "VAR_DB_NAME".UNIDADEMEDIDA WHERE DSSIGLA = A.UND) AS UND,
            A.IDCOR,
            A.IDTIPOTECIDO,
            A.IDCATEGORIAPEDIDO,
           -- A.IDSUBGRUPO, B.IDSUBGRUPOESTRUTURA), C.IDSUBGRUPOESTRUTURA) AS IDSUBGRUPOESTRUTURA,
            (SELECT TO_NVARCHAR(IDGRUPOESTRUTURA) || ':' || TO_NVARCHAR(IDSUBGRUPOESTRUTURA) as result FROM "VAR_DB_NAME".SUBGRUPOESTRUTURA WHERE IDSUBGRUPOESTRUTURA = A.IDSUBGRUPO) AS IDSUBGRUPOESTRUTURA,
            A.IDESTILO,
            A.IDCATEGORIAS,
            A.IDLOCALEXPOSICAO,
            A.IDTAMANHO
        FROM 
            "VAR_DB_NAME".PRODUTO A 
        WHERE 
            1 = ? 
            AND A.STATIVO = 'True' 
    `;

    if(PesqProd){
        query += ` And  CONTAINS((A."DSNOME", A."NUCODBARRAS"), '%${PesqProd}%') `;
    }
    
    //if ( IdForn ) {
    //    query = query + ' And  A.IDFORNECEDOR = \'' + IdForn + '\' ';
    //}
    
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