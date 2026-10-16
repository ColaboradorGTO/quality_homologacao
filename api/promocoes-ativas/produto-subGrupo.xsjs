var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
    if (!value) {
        stmt.setNull(fieldId);
        return;
    }
    stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
    if (!value) {
        stmt.setNull(fieldId);
        return;
    }
    stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
    if (!value) {
        stmt.setNull(fieldId);
        return;
    }
    stmt.setInt(fieldId, value);
}


function fnHandleGet(byId) {
    
    var idSubGrupo = $.request.parameters.get("idSubGrupo");
    var dsProduto = $.request.parameters.get("dsProduto");
    var idProduto = $.request.parameters.get("idProduto");
    var codBarra = $.request.parameters.get("codBarra");
    
    var query = `
        SELECT 
            tbp.IDPRODUTO,
            tbp.NUCODBARRAS,
            tbp.DSNOME,
            tbp.IDSUBGRUPO,
            TBP.STATIVO,
            tbs.DSSUBGRUPOESTRUTURA,
            tbg.DSGRUPOESTRUTURA
        FROM 
            "VAR_DB_NAME".PRODUTO tbp
            INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA tbs ON tbp.IDSUBGRUPO = tbs.IDSUBGRUPOESTRUTURA
            INNER JOIN "VAR_DB_NAME".GRUPOESTRUTURA tbg ON tbs.IDGRUPOESTRUTURA = tbg.IDGRUPOESTRUTURA
        WHERE
            1 = ?
    `;
    
    if ( dsProduto ) {
        query += `AND CONTAINS((tbp.IDPRODUTO, tbp.DSNOME, tbp.NUCODBARRAS), '%${dsProduto}%') `;
    }

    if(idProduto) {
        query = query + ' And  IDPRODUTO = \'' + idProduto + '\' ';
    }

    if ( idSubGrupo ) {
        // Verifica se contém vírgula (múltiplos IDs)
        if (idSubGrupo.includes(',')) {
            var ids = idSubGrupo.split(',').map(function(id) {
                return "'" + id.trim() + "'";
            }).join(',');
            query = query + ' And  IDSUBGRUPO IN (' + ids + ') ';
        } else {
            // Um único ID
            query = query + ' And  IDSUBGRUPO = \'' + idSubGrupo + '\' ';
        }
    }
    
   if ( codBarra ) {
        query = query + ' And  NUCODBARRAS = \'' + codBarra + '\' ';
    }
    
    
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
            var idSubGrupo = $.request.parameters.get("idSubGrupo");
            fnHandleGet(idSubGrupo);
            break;
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}
