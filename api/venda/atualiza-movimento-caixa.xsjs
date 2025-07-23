var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function fnHandleGet(byId) {
    
    var idCaixa = $.request.parameters.get("idCaixa");
    
    var query = ' SELECT ' + 
    '   tbv.IDVENDA' +
    ' FROM ' + 
    '   "VAR_DB_NAME".VENDA tbv' +
    ' WHERE ' +
        '	1 = ?' +
        '   AND tbv.IDMOVIMENTOCAIXAWEB = \'\'';
    
    if ( byId ) {
        query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
    }
    
    if(idCaixa){
        query = query + ' and tbv.IDCAIXAWEB= \'' + idCaixa + '\'';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ' + 
        ' "IDMOVIMENTOCAIXAWEB" = ? ' + 
        ' WHERE "IDVENDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
        pStmt.setString(1, registro.IDMOVIMENTOCAIXAWEB);
        pStmt.setString(2, registro.IDVENDA);
        
        
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

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
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}