var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    
    var conn = $.db.getConnection();
    
    
    var id = $.request.parameters.get("idresped");

    var queryIdRes = 'SELECT IDRESUMOENTRADA FROM "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" WHERE IDRESUMOPEDIDO = ? ';
    var IdResEntrada = api.executeScalar(queryIdRes,id);

    var query = 'DELETE FROM "VAR_DB_NAME".DETALHEENTRADANFEPEDIDO WHERE DETALHEENTRADANFEPEDIDO.IDRESUMOENTRADA = \'' + IdResEntrada + '\' ';
    var query2 = 'DELETE FROM "VAR_DB_NAME".RESUMOENTRADANFEPEDIDO WHERE RESUMOENTRADANFEPEDIDO.IDRESUMOENTRADA = \'' + IdResEntrada + '\' ';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
	
    pStmt.execute();
    pStmt2.execute();
	pStmt.close();
	pStmt2.close();

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