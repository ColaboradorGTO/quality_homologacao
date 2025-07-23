var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    
    var conn = $.db.getConnection();
    
    
    var id = $.request.parameters.get("IDDetalheProdOrigem");
    
    var query = 'DELETE FROM "VAR_DB_NAME".DETALHEPROMOCAOMARKETINGORIGEM WHERE DETALHEPROMOCAOMARKETINGORIGEM.IDDETALHEPROMOCAOMARKETINGORIGEM = \'' + id + '\' ';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	
    pStmt.execute();
	pStmt.close();

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