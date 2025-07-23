var api = $.import("quality.concentrador.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    let idFilialOrigem = $.request.parameters.get("idFilialOrigem");
    let idFilialDestino = $.request.parameters.get("idFilialDestino");
    let idProd = $.request.parameters.get("idProd");
    let codBarrasProd = $.request.parameters.get("codBarrasProd");
    let descProd = $.request.parameters.get("descProd");
    let query;
    
    query = `
        SELECT 
            TBP.IDPRODUTO,
            TBP.DSNOME AS DSPRODUTO,
            TBP.NUCODBARRAS,
            TBE_ORIGEM.NOFANTASIA AS NOFILIALORIGEM,
            COALESCE(TBPP_ORIGEM.PRECO_VENDA, TBP.PRECOVENDA) AS PRECOVENDAFILIALORIGEM, 
            COALESCE(TBI_ORIGEM.QTDFINAL, 0) AS QTDESTOQUEFILIALORIGEM,
            TBE_DESTINO.NOFANTASIA AS NOFILIALDESTINO,
            COALESCE(TBPP_DESTINO.PRECO_VENDA, TBP.PRECOVENDA) AS PRECOVENDAFILIALDESTINO, 
            COALESCE(TBI_DESTINO.QTDFINAL, 0) AS QTDESTOQUEFILIALDESTINO
        FROM 
            "VAR_DB_NAME".PRODUTO AS TBP
        INNER JOIN "VAR_DB_NAME".PRODUTO_PRECO AS TBPP_ORIGEM ON
            TBP.IDPRODUTO = TBPP_ORIGEM.IDPRODUTO
        INNER JOIN "VAR_DB_NAME".EMPRESA AS TBE_ORIGEM ON
            TBPP_ORIGEM.IDEMPRESA = TBE_ORIGEM.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO AS TBI_ORIGEM ON
            TBP.IDPRODUTO = TBI_ORIGEM.IDPRODUTO AND TBE_ORIGEM.IDEMPRESA = TBI_ORIGEM.IDEMPRESA AND TBI_ORIGEM.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".PRODUTO_PRECO AS TBPP_DESTINO ON
            TBP.IDPRODUTO = TBPP_DESTINO.IDPRODUTO
        INNER JOIN "VAR_DB_NAME".EMPRESA AS TBE_DESTINO ON
            TBPP_DESTINO.IDEMPRESA = TBE_DESTINO.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO AS TBI_DESTINO ON
            TBP.IDPRODUTO = TBI_DESTINO.IDPRODUTO AND TBE_DESTINO.IDEMPRESA = TBI_DESTINO.IDEMPRESA AND TBI_DESTINO.STATIVO = 'True'
        WHERE 
            1 = ? 
    `;
    
    if(byId){
        query += ` AND  TBP.IDPRODUTO = '${byId}' `;
    }
    
    if(idFilialOrigem){
        query += ` AND TBE_ORIGEM.IDEMPRESA = '${idFilialOrigem}' `;
    }
    
     if(idFilialDestino){
        query += ` AND TBE_DESTINO.IDEMPRESA = '${idFilialDestino}' `;
    }
    
    if(idProd){
        if(idProd.includes(',')){
            idProd = idProd.split(',').join("','");
        } else {
            idProd = idProd.trim();
        }
        query += ` AND TBP.IDPRODUTO IN('${idProd}') `;
    }
    
    if(descProd){
        query += ` AND CONTAINS(TBP.DSNOME, '%${descProd}%') `;
    }
    
    if(codBarrasProd){
        if(codBarrasProd.includes(',')){
            codBarrasProd = codBarrasProd.split(',').join("','");
        } else {
            codBarrasProd = codBarrasProd.trim();
        }
        
        query += ` AND TBP.NUCODBARRAS IN ('${codBarrasProd}') `;
    }
    
    //query += ` ORDER BY TBR.IDRESUMOPEDIDO, TBE.IDEMPRESA, TBP.DSNOME `;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePost(byId) {
    let query;
    
    var bodyJson = JSON.parse($.request.body.asString());
	var registro = bodyJson[0];
    
    query = `
        SELECT 
            TBP.IDPRODUTO,
            TBP.DSNOME AS DSPRODUTO,
            TBP.NUCODBARRAS,
            TBE_ORIGEM.NOFANTASIA AS NOFILIALORIGEM,
            COALESCE(TBPP_ORIGEM.PRECO_VENDA, TBP.PRECOVENDA) AS PRECOVENDAFILIALORIGEM, 
            COALESCE(TBI_ORIGEM.QTDFINAL, 0) AS QTDESTOQUEFILIALORIGEM,
            TBE_DESTINO.NOFANTASIA AS NOFILIALDESTINO,
            COALESCE(TBPP_DESTINO.PRECO_VENDA, TBP.PRECOVENDA) AS PRECOVENDAFILIALDESTINO, 
            COALESCE(TBI_DESTINO.QTDFINAL, 0) AS QTDESTOQUEFILIALDESTINO
        FROM 
            "VAR_DB_NAME".PRODUTO AS TBP
        INNER JOIN "VAR_DB_NAME".PRODUTO_PRECO AS TBPP_ORIGEM ON
            TBP.IDPRODUTO = TBPP_ORIGEM.IDPRODUTO
        INNER JOIN "VAR_DB_NAME".EMPRESA AS TBE_ORIGEM ON
            TBPP_ORIGEM.IDEMPRESA = TBE_ORIGEM.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO AS TBI_ORIGEM ON
            TBP.IDPRODUTO = TBI_ORIGEM.IDPRODUTO AND TBE_ORIGEM.IDEMPRESA = TBI_ORIGEM.IDEMPRESA AND TBI_ORIGEM.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".PRODUTO_PRECO AS TBPP_DESTINO ON
            TBP.IDPRODUTO = TBPP_DESTINO.IDPRODUTO
        INNER JOIN "VAR_DB_NAME".EMPRESA AS TBE_DESTINO ON
            TBPP_DESTINO.IDEMPRESA = TBE_DESTINO.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO AS TBI_DESTINO ON
            TBP.IDPRODUTO = TBI_DESTINO.IDPRODUTO AND TBE_DESTINO.IDEMPRESA = TBI_DESTINO.IDEMPRESA AND TBI_DESTINO.STATIVO = 'True'
        WHERE 
            1 = ? 
    `;
    
    if(byId){
        query += ` AND  TBP.IDPRODUTO = '${byId}' `;
    }
    
    if(registro.IDFILIALORIGEM){
        query += ` AND TBE_ORIGEM.IDEMPRESA = '${registro.IDFILIALORIGEM}' `;
    }
    
     if(registro.IDFILIALDESTINO){
        query += ` AND TBE_DESTINO.IDEMPRESA = '${registro.IDFILIALDESTINO}' `;
    }
    
    if(registro.IDPRODUTO){
        if(registro.IDPRODUTO.includes(',')){
            registro.IDPRODUTO = registro.IDPRODUTO.split(',').join("','");
        } else {
            registro.IDPRODUTO = registro.IDPRODUTO.trim();
        }
        query += ` AND TBP.IDPRODUTO IN('${registro.IDPRODUTO}') `;
    }
    
    if(registro.DSNOME){
        query += ` AND CONTAINS(TBP.DSNOME, '%${registro.DSNOME}%') `;
    }
    
    if(registro.NUCODBARRAS){
        if(registro.NUCODBARRAS.includes(',')){
            registro.NUCODBARRAS = registro.NUCODBARRAS.split(',').join("','");
        } else {
            registro.NUCODBARRAS = registro.NUCODBARRAS.trim();
        }
        
        query += ` AND TBP.NUCODBARRAS IN ('${registro.NUCODBARRAS}') `;
    }
    
   /*query += ` ORDER BY TBR.IDRESUMOPEDIDO, TBE.IDEMPRESA, TBP.DSNOME `;*/
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
    //return api.sqlQuery(query, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            fnHandlePut();
           /* var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));*/
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            //$.response.setBody(JSON.stringify(fnHandleGet(id)));
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            fnHandlePost();/*
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));*/
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}