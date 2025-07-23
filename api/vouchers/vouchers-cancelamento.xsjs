var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function cancelarVoucherDetalhe(idvoucher, conn){
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEVOUCHER" SET ' + 
        ' "STATIVO" = \'False\', ' +
        ' "STCANCELADO" = \'True\' ' +
		' WHERE "IDVOUCHER" =  ? ';
    
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
   	pStmt.setInt(1, idvoucher);
    pStmt.execute();
    pStmt.close();

	conn.commit();    
}



function fnHandlePut(){
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOVOUCHER" SET ' + 
        ' "STATIVO" = \'False\', ' +
		' "STCANCELADO" = \'True\', ' +
		' "DSMOTIVOCANCELAMENTO" = \'CANCELADO PARA DESMEMBRAMENTO\' ' +
		' WHERE "IDVOUCHER" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
			pStmt.setInt(1, registro.IDVOUCHER);
			
    	pStmt.execute();
    	cancelarVoucherDetalhe(registro.IDVOUCHER, conn);
    }
	pStmt.close();
    
	conn.commit();
	
	return {
	    msg : "Cancelamento realizado com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your PUt calls here
	    case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}