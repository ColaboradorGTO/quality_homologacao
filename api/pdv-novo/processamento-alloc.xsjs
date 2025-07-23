var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idRetornoAlloc = $.request.parameters.get("idRetornoAlloc");
    var status = $.request.parameters.get("status");
    
    var query = ' SELECT ' + 
    '   tbpa.IDVENDA,' +
	'   tbpa.IDEMPRESA,' +
	'   tbpa.DTENVIO,' +
	'   tbpa.IDRETORNOALLOC,' +
	'   tbpa.IDRETORNOPAGAMENTO,' +
	'   CAST(tbpa.TXT_VENDA AS VARCHAR(200)) AS TXT_VENDA,' +
	'   CAST(tbpa.TXT_PAGAMENTO AS VARCHAR(200)) AS TXT_PAGAMENTO,' +
	'   CAST(tbpa.TXT_RETORNO_VENDA AS VARCHAR(200)) AS TXT_RETORNO_VENDA,' +
	'   tbpa.STCONCLUIDO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".PROCESSAMENTOALLOC tbpa' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbpa.IDVENDA = \'' + byId + '\' ';
    }
    if ( idEmpresa ) {
        query = query + ' And  tbpa.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    if ( idRetornoAlloc ) {
        query = query + ' And  tbpa.IDRETORNOALLOC = \'' + idRetornoAlloc + '\' ';
    }
    if ( status ) {
        query = query + ' And  tbpa.STCONCLUIDO = \'' + status + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    if(bodyJson[0].IDRETORNOALLOC){
        var query = 'UPDATE "VAR_DB_NAME"."PROCESSAMENTOALLOC" SET ' + 
        ' "IDRETORNOALLOC" = ?, ' + 
    	' "TXT_RETORNO_VENDA" = ? ' + 
    	' WHERE "IDVENDA" =  ? ';
    }else{
        var query = 'UPDATE "VAR_DB_NAME"."PROCESSAMENTOALLOC" SET ' + 
        ' "IDRETORNOPAGAMENTO" = ?, ' + 
    	' "TXT_PAGAMENTO" = ?, ' +
    	' "DTENVIO" = ?, ' +
    	' "STCONCLUIDO" = ? ' +
    	' WHERE "IDVENDA" =  ? ';
    }
    
    
    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        if(registro.IDRETORNOALLOC){
            pStmt.setInt(1, registro.IDRETORNOALLOC);
    	    pStmt.setString(2, registro.TXT_RETORNO_VENDA);
    	    pStmt.setString(3, registro.IDVENDA);
        }else{
            pStmt.setInt(1, registro.IDRETORNOPAGAMENTO);
    	    pStmt.setString(2, registro.TXT_PAGAMENTO);
    	    pStmt.setTimestamp(3, registro.DTENVIO);
    	    pStmt.setString(4, registro.STCONCLUIDO);
    	    pStmt.setString(5, registro.IDVENDA);
        }
       
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."PROCESSAMENTOALLOC" ' +
		" ( " +
		' "IDVENDA", ' +
		' "IDEMPRESA", ' + 
    	' "TXT_VENDA", ' +
    	' "STCONCLUIDO" ' +
    	' ) ' +
		' VALUES(?,?,?,\'False\') ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.IDVENDA);
    	pStmt.setInt(2, registro.IDEMPRESA);
    	pStmt.setString(3, registro.TXT_VENDA);
    	
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