try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var idMarca = $.request.parameters.get("idMarca");
    var noFornecedor = $.request.parameters.get("noFornecedor");
    var idForn = $.request.parameters.get("idForn");
    
    var query = `
        SELECT
        	TBF.IDFORNECEDOR,
        	TBF.NORAZAOSOCIAL,
        	TBF.NOFANTASIA,
        	TBF.NUCNPJ,
        	TBF.IDFORNECEDORSAP,
        	TBF.STATIVO AS STATIVOQUALITY,
        	TBO."CardCode" AS IDSAP,
        	TBO."validFor" as STATIVOSAP
        FROM
        	"VAR_DB_NAME".FORNECEDOR TBF
        LEFT JOIN SBO_GTO_PRD.OCRD TBO ON
        	TBF.IDFORNECEDORSAP = TBO."CardCode"
        WHERE
        	1 = ?
    `;
    
    if(idForn){
        query += ` AND TBF.IDFORNECEDOR = ${idForn}`;
    }
    
    if(idMarca){
        query = query + ' And  TBF."IDSUBGRUPOEMPRESARIAL" IN( ' + idMarca + ')  ';
    }
    
    if(noFornecedor){
        query += ` AND CONTAINS((NORAZAOSOCIAL, NOFANTASIA), '%${noFornecedor}%')`;
    }

    query = query + ' ORDER BY  TBF."IDFORNECEDOR" ';
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