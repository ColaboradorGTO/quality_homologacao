var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnAtualizarResumoPedido(idResumoPedido){
    var conn = $.db.getConnection();
    var idResPedido = +idResumoPedido;
    
    var querydetpedido = ' SELECT COUNT(DETPED.IDDETALHEPEDIDO) TOTALITENS, SUM(DETPED.QTDTOTAL) QTDTOTAL, SUM(DETPED.VRTOTAL) VRTOTAL' +
		' FROM  ' +
		'   "VAR_DB_NAME".DETALHEPEDIDO  DETPED' +
		'  WHERE  ' +
		'   DETPED."STCANCELADO"=\'False\' AND ' +
		'   DETPED."IDRESUMOPEDIDO" = ?  ';

	var linha2 = api.sqlQuery(querydetpedido, idResPedido);
	var det2 = linha2[0];
	
	var NUTOTALITENS = parseInt(det2.TOTALITENS);
	var QTDTOTPRODUTOS = !det2.QTDTOTAL ? 0 : parseFloat(det2.QTDTOTAL);
    var VRTOTALBRUTO = !det2.VRTOTAL ? 0 : parseFloat(det2.VRTOTAL);
    var VRTOTALLIQUIDO = !det2.VRTOTAL ? 0 : parseFloat(det2.VRTOTAL);
   
    var query2 = 'UPDATE "VAR_DB_NAME"."RESUMOPEDIDO" SET ' + 
        ' "NUTOTALITENS" = ?, ' + 
        ' "QTDTOTPRODUTOS" =  ?, ' + 
        ' "VRTOTALBRUTO" =  ?, ' + 
        ' "VRTOTALLIQUIDO" =  ? ' + 
        ' WHERE "IDRESUMOPEDIDO" =  ? ';
        
    var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));

        pStmt2.setInt(1, NUTOTALITENS);
        pStmt2.setFloat(2, QTDTOTPRODUTOS);
        pStmt2.setFloat(3, VRTOTALBRUTO);
        pStmt2.setFloat(4, VRTOTALLIQUIDO);
        pStmt2.setInt(5, parseInt(idResPedido));
        
    	pStmt2.execute();
    	
    	pStmt2.close();
    	
	    conn.commit();

	
	return  {
	    "msg" : "Produto Excluído com Sucesso!"
	};
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPEDIDO" SET ' + 
        ' "STCANCELADO" = ?, ' + 
        ' "IDRESPCANCELAMENTO" = ?, ' + 
        ' "TXTOBSCANCELAMENTO" = ?, ' + 
        ' "DTCANCELAMENTO" = now() ' + 
        ' WHERE "IDDETALHEPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 
    var idResumo = registro.IDRESUMOPEDIDO;

    pStmt.setString(1, registro.STCANCELADO);
    pStmt.setInt(2, parseInt(registro.IDRESPCANCELAMENTO) || '');
    pStmt.setString(3, registro.TXTOBSCANCELAMENTO || '');
    pStmt.setInt(4, parseInt(registro.IDDETALHEPEDIDO));
    
	pStmt.execute();
    pStmt.close();
    
    conn.commit();
    
    return fnAtualizarResumoPedido(idResumo);
    
}

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
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}