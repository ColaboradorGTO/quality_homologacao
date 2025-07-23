var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    var dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    var codeBars = $.request.parameters.get("codeBars");
    var descProd = $.request.parameters.get("descProd");
    
    var query = `
        SELECT 
            TO_VARCHAR(TBP.DTULTALTERACAO,'DD/MM/YYYY HH24:MI:SS') AS DTULTALTERACAO,
            TBP.IDPRODUTO, 
            TBP.DSNOME, 
            TBP.NUCODBARRAS, 
            TBP.PRECOVENDA,
            VW_PROD."GRUPO", 
            VW_PROD."SUBGRUPO",
            (SELECT (IFNULL(TBN.IMPESTADUAL, 0) * 10) AS IMPESTADUAL FROM "VAR_DB_NAME".NCM TBN WHERE TBN.NUNCM = TBP.NUNCM AND SGUF = 'DF') AS PERC_ICMS_DF,
            (SELECT (IFNULL(TBN.IMPESTADUAL, 0) * 10) AS IMPESTADUAL FROM "VAR_DB_NAME".NCM TBN WHERE TBN.NUNCM = TBP.NUNCM AND SGUF = 'GO') AS PERC_ICMS_GO
        FROM "VAR_DB_NAME".PRODUTO TBP 
        INNER JOIN "VAR_DB_NAME"."VW_PRODUTO_ESTRUTURA_MERCADOLOGICA" VW_PROD ON 
            VW_PROD.IDPRODUTO = TBP."IDPRODUTO"  
        WHERE 
            TBP.STATIVO = 'True'
            AND 1 = ?
    `;
    
    if ( byId ) {
        query += ` AND  TBP.IDPRODUTO = '${byId}' `;
    }
    
    if ( dataUltAtualizacao ) {
        query += ` AND  TBP.DTULTALTERACAO >= '${dataUltAtualizacao}' '${horaUltAtualizacao}' `;
    }
    
    if ( codeBars ) {
        query += ` AND  TBP.NUCODBARRAS = '${codeBars}' `;
    }
    
    if ( descProd ) {
        descProd = descProd.split(' ').join('%');
        
        query += ` AND  CONTAINS((TBP.DSNOME, TBP.NUCODBARRAS), '%${descProd}%') `;
    }
    
    query += ' ORDER BY TBP.IDGRUPOEMPRESARIAL, TBP.IDPRODUTO ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            //$.response.setBody(JSON.stringify(fnHandleGet(id)));
            break;
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}