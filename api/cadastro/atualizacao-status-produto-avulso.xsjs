var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var libCancelamentoProdAvulso = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.cancelamento.libs.produto-avulso", "libCancelamentoProdAvulso");


function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' + 
        ' "STCANCELADO" = ? ' +
        ' WHERE "IDDETALHEPRODUTOPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 

    pStmt.setString(1, registro.STCANCELADO);
    pStmt.setInt(2, registro.IDDETALHEPRODUTOPEDIDO);
    
	pStmt.execute();
    
    	var queryprodavulso = ' SELECT (PRODAV.IDPRODUTO) ' +
		' FROM  ' +
		'   "VAR_DB_NAME".PRODUTO PRODAV' +
		'  WHERE  ' +
		'   PRODAV."IDDETALHEPRODUTOPEDIDO" = ?  ';

	    var linha2 = api.sqlQuery(queryprodavulso, registro.IDDETALHEPRODUTOPEDIDO);
	    
	    if(linha2.length>0){
	        
	        var ProdAv = linha2[0];
	        
            var query5 = 'UPDATE p SET p.STATIVO = ?, p.DTULTALTERACAO = now() FROM "VAR_DB_NAME".PRODUTO p WHERE p.IDDETALHEPRODUTOPEDIDO=?';
            var pStmt5 = conn.prepareStatement(api.replaceDbName(query5));
            pStmt5.setString(1,registro.STCANCELADO);
            pStmt5.setInt(2,registro.IDDETALHEPRODUTOPEDIDO);
            pStmt5.execute();
	        pStmt5.close();
	        
	        var retIntegracaoCancelamentoProd = libCancelamentoProdAvulso.executeCancelamentoProdutoAvulso(ProdAv.IDPRODUTO);
            if(retIntegracaoCancelamentoProd === 'True'){
                 return {
        	        "msg": "Cancelamento realizado com sucesso!"
        	    };
            }else{
                return {
        	        "msg": "Error Cancelamento!"
        	    };
            }
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
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}