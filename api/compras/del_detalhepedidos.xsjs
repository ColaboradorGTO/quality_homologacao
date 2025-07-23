var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    
    var conn = $.db.getConnection();
    
    var query = 'UPDATE "VAR_DB_NAME".DETALHEPEDIDOGRADE SET STATIVO = \'False\' WHERE DETALHEPEDIDOGRADE.IDDETALHEPEDIDO=?';
    var query2 = 'UPDATE "VAR_DB_NAME".DETALHEPEDIDO SET STCANCELADO = \'True\' WHERE DETALHEPEDIDO.IDDETALHEPEDIDO=?';
    var query3 = 'UPDATE "VAR_DB_NAME".DETALHEPRODUTOPEDIDO SET STCANCELADO = \'True\' WHERE DETALHEPRODUTOPEDIDO.IDDETALHEPEDIDO=?';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
	var pStmt3 = conn.prepareStatement(api.replaceDbName(query3));
	
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		
        pStmt.setInt(1,registro.idDetPedido);
        pStmt2.setInt(1,registro.idDetPedido);
        pStmt3.setInt(1,registro.idDetPedido);
    	
        pStmt.execute();
        pStmt2.execute();
        pStmt3.execute();
        
	}

	pStmt.close();
	pStmt2.close();
	pStmt3.close();

	conn.commit();
	
    return {
	    "msg": "Exclusão realizada com sucesso!"
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
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}