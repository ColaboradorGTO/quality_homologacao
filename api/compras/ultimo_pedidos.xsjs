try {
    
    var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
    
    var idPedido = $.request.parameters.get("idPedido");
    var idcomprador = $.request.parameters.get("idcomprador");
        
    var query = ` 
        SELECT 
            TOP 1 A."IDRESUMOPEDIDO",
            (
                SELECT
                    MAX(STREPOSICAO)
                FROM
                    "VAR_DB_NAME".DETALHEPEDIDO TBD
                WHERE
                    TBD.IDRESUMOPEDIDO = A.IDRESUMOPEDIDO
                    AND TBD.STCANCELADO = 'False'
            ) AS STREPOSICAO
        FROM "VAR_DB_NAME"."RESUMOPEDIDO" A WHERE 1=? 
    `;

    if(idcomprador){
        query = query + ' AND  (A."IDANDAMENTO" = 1 OR A."IDANDAMENTO" = 2 OR A."IDANDAMENTO" = 15)  AND A."IDCOMPRADOR" = \'' + idcomprador + '\' ';
    }
    
    if(idPedido){
        query = query + ' AND  A."IDRESUMOPEDIDO" = \'' + idPedido + '\' ';
    }
    
    query = query + 'ORDER BY A.IDRESUMOPEDIDO DESC';
    
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