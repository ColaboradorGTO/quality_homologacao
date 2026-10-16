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
    
    var idResumoPromocao = $.request.parameters.get("idResumoPromocao");
    var dsProduto = $.request.parameters.get("dsProduto");
    var idProduto = $.request.parameters.get("idProduto");
    var codeBars = $.request.parameters.get("codeBars");
    
     var query = `
        
        SELECT 
            dt.IDPRODUTOORIGEM,
            dt.IDRESUMOPROMOCAOMARKETING,
            dt.STATIVO,
            tbp.IDPRODUTO,
            tbp.NUCODBARRAS,
            tbp.DSNOME,
            pm.DSPROMOCAOMARKETING,
            pm.STATIVO AS STATIVOPROMOCAOMARKETING,
            g.DSGRUPOEMPRESARIAL 
        FROM 
            "QUALITY_CONC".DETALHEPROMOCAOMARKETINGORIGEM dt
            LEFT JOIN "QUALITY_CONC".PRODUTO tbp ON dt.IDPRODUTOORIGEM = tbp.IDPRODUTO
            LEFT JOIN "QUALITY_CONC".RESUMOPROMOCAOMARKETING pm ON dt.IDRESUMOPROMOCAOMARKETING = pm.IDRESUMOPROMOCAOMARKETING
            LEFT JOIN "QUALITY_CONC".EMPRESAPROMOCAOMARKETING e ON e.IDRESUMOPROMOCAOMARKETING = pm.IDRESUMOPROMOCAOMARKETING 
            LEFT JOIN "QUALITY_CONC".EMPRESA emp ON emp.IDEMPRESA  = e.IDEMPRESA 
            LEFT JOIN "QUALITY_CONC".GRUPOEMPRESARIAL g ON g.IDGRUPOEMPRESARIAL  = emp.IDGRUPOEMPRESARIAL 
        WHERE 1 = ?
    
    `;
    
    if ( dsProduto ) {
        query += `AND CONTAINS((tbp.IDPRODUTO, tbp.NUCODBARRAS), '%${dsProduto}%') `;
    }

    if(idProduto) {
        query = query + ' And  IDPRODUTOORIGEM = \'' + idProduto + '\' ';
    }

    if ( idResumoPromocao ) {
        query = query + ' And  IDRESUMOPROMOCAOMARKETING = \'' + idResumoPromocao + '\' ';
    }
    
    if ( codeBars ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codeBars + '\' ';
    }
    
        query = query + ` GROUP BY
            dt.IDPRODUTOORIGEM,
            dt.IDRESUMOPROMOCAOMARKETING,
            dt.STATIVO,
            tbp.IDPRODUTO,
            tbp.NUCODBARRAS,
            tbp.DSNOME,
            pm.DSPROMOCAOMARKETING,
            pm.STATIVO,
            g.DSGRUPOEMPRESARIAL `;
    
    
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
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var idProduto = $.request.parameters.get("idProduto");
            fnHandleGet(idProduto);
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}
