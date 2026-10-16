try {
    
   var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var PesqProd = $.request.parameters.get("PesqProd");
    var IdForn = $.request.parameters.get("IdForn");
        
    var query = `
        SELECT 
            TBP.IDPRODUTO,
            TBP.DSNOME,
            TBP.NUCODBARRAS,
            TBP.PRECOCUSTO,
            TBP.PRECOVENDA,
            TBP.NUREFERENCIA,
            TBP.IDFABRICANTE,
          	TBU.IDUNIDADEMEDIDA AS UND,
            TBP.IDCOR,
            TBP.IDTIPOTECIDO,
            TBP.IDCATEGORIAPEDIDO,
            TBSE.IDGRUPOESTRUTURA,
            TBSE.IDSUBGRUPOESTRUTURA,
            TBP.IDESTILO,
            TBP.IDCATEGORIAS,
            TBP.IDLOCALEXPOSICAO,
            TBP.IDTAMANHO,
            TBT.DSTAMANHO,
            TBP.NUNCM,
            TBP.IDTIPOPRODUTOFISCAL, 
            TBP.IDFONTEPRODUTOFISCAL,
            TBP.STECOMMERCE, 
            TBP.STREDESOCIAL
        FROM 
            "VAR_DB_NAME".PRODUTO TBP
        LEFT JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBU ON
            TRIM(UPPER(TBP.UND)) = TRIM(UPPER(TBU.DSSIGLA))
        LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON 
            TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
        LEFT JOIN "VAR_DB_NAME".TAMANHO TBT ON 
            TBP.IDTAMANHO = TBT.IDTAMANHO
        WHERE 
            1 = ?
            AND TBP.STATIVO = 'True' 
    `;

    if(PesqProd){
        query += ` And  CONTAINS((TBP."DSNOME", TBP."NUCODBARRAS"), '%${PesqProd}%') `;
    }
    
    //if ( IdForn ) {
    //    query = query + ' And  A.IDFORNECEDOR = \'' + IdForn + '\' ';
    //}
    
    
    query += `
        ORDER BY 
            SUBSTRING(TBP."DSNOME", 0, LENGTH(TBP."DSNOME")-2),
            CASE 
                WHEN TBT.DSTAMANHO BETWEEN '0' AND '99999' THEN TO_INTEGER(TBT.DSTAMANHO)
                WHEN TBT.DSTAMANHO = 'PP' THEN 1
                WHEN TBT.DSTAMANHO = 'P'  THEN 2
                WHEN TBT.DSTAMANHO = 'M'  THEN 3
                WHEN TBT.DSTAMANHO = 'G'  THEN 4
                WHEN TBT.DSTAMANHO = 'GG' THEN 5
                WHEN TBT.DSTAMANHO = 'EG' THEN 6
                WHEN TBT.DSTAMANHO = 'EGG' THEN 7
                WHEN TBT.DSTAMANHO = 'G1'  THEN 8
                WHEN TBT.DSTAMANHO = 'G2'  THEN 9
                WHEN TBT.DSTAMANHO = 'G3'  THEN 10
                WHEN TBT.DSTAMANHO = 'G4'  THEN 11
                WHEN TBT.DSTAMANHO = 'G5'  THEN 12
                WHEN TBT.DSTAMANHO = 'XG' THEN 13
                WHEN TBT.DSTAMANHO = 'XGG' THEN 14
                ELSE 999
            END
    `
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

/*try {
    
   var api = $.import("quality.concentrador.api.apiResponse", "int_api");
    
    var PesqProd = $.request.parameters.get("PesqProd");
    var IdForn = $.request.parameters.get("IdForn");
        
    var query = ' SELECT A."IDPRODUTO", A."DSNOME", A."NUCODBARRAS", A."PRECOCUSTO", A."PRECOVENDA" FROM "VAR_DB_NAME"."PRODUTO" A WHERE 1=? AND A.STATIVO = \'True\' ';

    if(PesqProd){
        query = query + ' And  (UPPER(A."DSNOME") LIKE UPPER(\'%'+PesqProd+'%\') ) ';
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
}*/