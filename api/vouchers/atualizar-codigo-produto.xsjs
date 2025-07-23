var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnAtualizarProdutoVendaDetalhe(conn, idProduto, idProdutoMySql) {
    var query = 'UPDATE "VAR_DB_NAME"."VENDADETALHE" SET ' + 
        ' "CPROD" = ?, ' +
        ' WHERE "CPROD" =  ? ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idProduto);
	pStmt.setString(2, idProdutoMySql);
	
	pStmt.execute();
	pStmt.close();
	conn.commit();
}

function fnHandlePut() {
    
    var conn = $.db.getConnection();
    
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEVOUCHER" SET ' + 
        ' "IDPRODUTO" = ?, ' +
        ' WHERE "IDPRODUTO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.IDPRODUTO);
        pStmt.setString(2, registro.IDPRODUTOMYSQL);
        
                    
    	pStmt.execute();
    	fnAtualizarProdutoVendaDetalhe(conn, registro.IDPRODUTO, registro.IDPRODUTOMYSQL);
    }
	pStmt.close();

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
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}