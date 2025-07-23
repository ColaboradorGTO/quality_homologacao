var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var query = ' SELECT ' + 
    '   tbpp.IDPRODUTO,' +
	'   tbpp.IDEMPRESA,' +
	'   tbpp.PRICE_LIST_ID,' +
	'   tbpp.PRECO_VENDA' +
    ' FROM ' + 
    '   "VAR_DB_NAME".PRODUTO_PRECO tbpp' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbpp.IDPRODUTO = \'' + byId + '\' ';
    }
    
    if(idEmpresa){
        query = query + ' And  tbpp.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."PRODUTO_PRECO" SET ' + 
        ' "PRECO_VENDA" = ? ' + 
    	' WHERE "IDPRODUTO" = ? and "IDEMPRESA" =  ? ';
    
    var query2 = 'UPDATE "VAR_DB_NAME"."PRODUTO" SET ' + 
        ' "PRECOVENDA" = ?, ' +
        ' "DTULTALTERACAO" = now() ' +
    	' WHERE "IDPRODUTO" = ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        //Atualiza Produto Preço
        pStmt.setFloat(1, registro.PRECO_VENDA);
    	pStmt.setString(2, registro.IDPRODUTO);
    	pStmt.setInt(3, registro.IDEMPRESA);
                    
    	pStmt.execute();
    	
    	//atualiza Produto
    	pStmt2.setFloat(1, registro.PRECO_VENDA);
    	pStmt2.setString(2, registro.IDPRODUTO);
    	
        pStmt2.execute();
    }
	pStmt.close();
	pStmt2.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
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
                   
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}