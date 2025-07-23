var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var libCancelamentoItemPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.cancelamento.libs.produto", "libCancelamentoItemPedido");

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
        ' "VRTOTALLIQUIDO" =  ?, ' +
        ' "DTMOVPEDIDO" = now() ' +
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
}

function fnAtualizarProdSAP(idDetPedido){
    var conn = $.db.getConnection();
    var idDetPedido = +idDetPedido;
    
    var querydetpedido = ' SELECT (DETPED.IDPRODCADASTRO), DETPED.IDRESUMOPEDIDO' +
		' FROM  ' +
		'   "VAR_DB_NAME".DETALHEPRODUTOPEDIDO  DETPED' +
		'  WHERE  ' +
		'   DETPED."STCANCELADO"=\'True\' AND ' +
		'   DETPED."IDDETALHEPEDIDO" = ?  ';

	var linha2 = api.sqlQuery(querydetpedido, idDetPedido);
    for (var i = 0; i < linha2.length; i++) {
        
        var det2 = linha2[i];
        
        var retIntegracaoCancelItemPedido = libCancelamentoItemPedido.executeCancelamentoProdutoPedidoCompra(det2.IDRESUMOPEDIDO, det2.IDPRODCADASTRO);
        if(retIntegracaoCancelItemPedido === 'True'){
             return {
    	        "msg": "Cancelamento realizado com sucesso!"
    	    };
        }else{
            return {
    	        "msg": "Error Cancelamento!"
    	    };
        }
        
    }
    	
	    conn.commit();
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPEDIDO" SET ' + 
        ' "STCANCELADO" = ?, ' + 
        ' "IDRESPCANCELAMENTO" = ?, ' + 
        ' "TXTOBSCANCELAMENTO" = ? ' + 
        ' WHERE "IDDETALHEPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 
    var idResumo = registro.IDRESUMOPEDIDO;

    pStmt.setString(1, registro.STCANCELADO);
    pStmt.setInt(2, registro.IDRESPCANCELAMENTO);
    pStmt.setString(3, registro.TXTOBSCANCELAMENTO);
    pStmt.setInt(4, parseInt(registro.IDDETALHEPEDIDO));
    
	pStmt.execute();
    pStmt.close();
            	
        var query2 = 'UPDATE "VAR_DB_NAME".DETALHEPEDIDOGRADE SET STATIVO = \'False\' WHERE DETALHEPEDIDOGRADE.IDDETALHEPEDIDO=?';
        var query3 = 'UPDATE "VAR_DB_NAME".DETALHEPRODUTOPEDIDO SET STATIVO = \'False\', STCANCELADO = \'True\' WHERE DETALHEPRODUTOPEDIDO.IDDETALHEPEDIDO=?';
        //var query5 = 'UPDATE p SET p.STATIVO = \'False\', p.DTULTALTERACAO = now() FROM "VAR_DB_NAME".PRODUTO p INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO d ON p.IDDETALHEPRODUTOPEDIDO = d.IDDETALHEPRODUTOPEDIDO WHERE d.IDDETALHEPEDIDO=?';
    	
    	var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
    	var pStmt3 = conn.prepareStatement(api.replaceDbName(query3));
    	//var pStmt5 = conn.prepareStatement(api.replaceDbName(query5));
    	
            pStmt2.setInt(1,registro.IDDETALHEPEDIDO);
            pStmt3.setInt(1,registro.IDDETALHEPEDIDO);
            //pStmt5.setInt(1,registro.IDDETALHEPEDIDO);
        	
            pStmt2.execute();
            pStmt3.execute();
            //pStmt5.execute();
            
            pStmt2.close();
	        pStmt3.close();
	
    conn.commit();
    
     fnAtualizarResumoPedido(idResumo);
    return fnAtualizarProdSAP(registro.IDDETALHEPEDIDO);
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