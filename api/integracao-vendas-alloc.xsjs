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
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInic = $.request.parameters.get("dataPesquisaInicial");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var idVenda = $.request.parameters.get("idVenda");
    var status = $.request.parameters.get("status");
    
    var query = ' SELECT ' +  
	' IVA."IDPROCESSAMENTO", ' + 
	' IVA."IDEMPRESA", ' + 
	' IVA."DTVENDA", ' + 
	' IVA."IDVENDA", ' + 
	' IVA."DTEMVIO", ' + 
	' IVA."IDRETORNOALLOC", ' + 
	' IVA."CUPOM_CODIGO", ' + 
	' IVA."IDRETORNOPAGAMENTO", ' + 
	' IVA."TXT_VENDA", ' + 
	' IVA."TXT_PAGAMENTO", ' + 
	' IVA."STSTATUS", ' + 
	' IVA."TXTRETORNOALLOC", ' + 
	' IVA."TXTRETORNOERROALLOC" ' + 
    '  FROM "QUALITY_CONC_HML"."INTEGRACAOVENDAALLOC" IVA WHERE 1=?';
    
    if ( byId ) {
        query = query + ' And  IVA.IDPROCESSAMENTO = \'' + byId + '\' ';
    }
    
    if(idEmpresa){
	    query = query + ' And IVA.IDEMPRESA = \'' + idEmpresa + '\' ';
	}
	
	if(idVenda){
	    query = query + ' And IVA.IDVENDA = \'' + idVenda + '\' ';
	}
	
	if(status){
	    query = query + ' And IVA.STSTATUS = \'' + status + '\' ';
	}
	
	if(dataPesquisaInic && dataPesquisaFim) {
        query = query + ' AND (IVA.DTVENDA BETWEEN \'' + dataPesquisaInic + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."INTEGRACAOVENDAALLOC" SET ' + 
        ' "IDEMPRESA" = ?, ' + 
        ' "DTVENDA" = ?, ' + 
        ' "IDVENDA" = ?, ' + 
        ' "DTEMVIO" = ?, ' + 
        ' "IDRETORNOALLOC" = ?, ' + 
        ' "CUPOM_CODIGO" = ?, ' + 
        ' "IDRETORNOPAGAMENTO" = ?, ' +
        ' "TXT_VENDA" = ?, ' +
        ' "TXT_PAGAMENTO" = ?, ' +
        ' "STSTATUS" = ?, ' +
        ' "TXTRETORNOALLOC" = ?, ' +
        ' "TXTRETORNOERROALLOC" = ? ' +
        ' WHERE "IDPROCESSAMENTO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDEMPRESA);
        setTimestampOrNull(pStmt,2, registro.DTVENDA);
        pStmt.setString(3, registro.IDVENDA);
        setTimestampOrNull(pStmt,4, registro.DTEMVIO);
        setIntOrNull(pStmt,5, registro.IDRETORNOALLOC);
        setIntOrNull(pStmt,6, registro.CUPOM_CODIGO);
        setIntOrNull(pStmt, registro.IDRETORNOPAGAMENTO);
        pStmt.setString(8, registro.TXT_VENDA);
        pStmt.setString(9, registro.TXT_PAGAMENTO);
        pStmt.setString(10, registro.STSTATUS);
        pStmt.setString(11, registro.TXTRETORNOALLOC);
        pStmt.setString(12, registro.TXTRETORNOERROALLOC);
        pStmt.setInt(13, registro.IDPROCESSAMENTO);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."INTEGRACAOVENDAALLOC" ' +
		" ( " +
		' "IDPROCESSAMENTO", ' +
        ' "IDEMPRESA", ' + 
        ' "DTVENDA", ' + 
        ' "IDVENDA", ' + 
        ' "DTEMVIO", ' + 
        ' "IDRETORNOALLOC", ' + 
        ' "CUPOM_CODIGO", ' + 
        ' "IDRETORNOPAGAMENTO", ' +
        ' "TXT_VENDA", ' +
        ' "TXT_PAGAMENTO", ' +
        ' "STSTATUS", ' +
        ' "TXTRETORNOALLOC", ' +
        ' "TXTRETORNOERROALLOC" ' +
        ' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_INTEGRACAO_VENDA_ALLOC.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
		
    	
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		setIntOrNull(pStmt,1, registro.IDEMPRESA);
        setTimestampOrNull(pStmt,2, registro.DTVENDA);
        pStmt.setString(3, registro.IDVENDA);
        setTimestampOrNull(pStmt,4, registro.DTEMVIO);
        setIntOrNull(pStmt,5, registro.IDRETORNOALLOC);
        setIntOrNull(pStmt,6, registro.CUPOM_CODIGO);
        setIntOrNull(pStmt,7, registro.IDRETORNOPAGAMENTO);
        pStmt.setString(8, registro.TXT_VENDA);
        pStmt.setString(9, registro.TXT_PAGAMENTO);
        pStmt.setString(10, registro.STSTATUS);
        pStmt.setString(11, registro.TXTRETORNOALLOC);
        pStmt.setString(12, registro.TXTRETORNOERROALLOC);
        
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
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
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
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