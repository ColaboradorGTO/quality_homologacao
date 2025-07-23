var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var libCancelamentoProdPed = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.inativar-alterar-produto.libs.inativar", "libCancelamentoProdPed");

function fnAtualizarProdSAP(idDetProdPedido, idResPed){
    var conn = $.db.getConnection();
    var IdResPed = +idResPed;
    var IdDetProdPedido = +idDetProdPedido;
    
    var retIntegracaoCancelProdPedido = libCancelamentoProdPed.executePedidoCompra(IdResPed, IdDetProdPedido);
    if(retIntegracaoCancelProdPedido === 'True'){
         return {
	        "msg": "Cancelamento realizado com sucesso!"
	    };
    }else{
        return {
	        "msg": "Error Cancelamento!"
	    };
    }
    	
	    conn.commit();
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' +
        ' "STCANCELADO" = ?, ' +
        ' "IDRESPCANCELAMENTO" = ?, ' +
        ' "TXTOBSCANCELAMENTO" = ? ' +
        ' WHERE "IDDETALHEPRODUTOPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 

    pStmt.setString(1, registro.STCANCELADO);
    pStmt.setInt(2, registro.IDRESPCANCELAMENTO);
    pStmt.setString(3, registro.TXTOBSCANCELAMENTO);
    pStmt.setInt(4, registro.IDDETALHEPRODUTOPEDIDO);
    
	pStmt.execute();
	pStmt.close();
	conn.commit();
	
	return fnAtualizarProdSAP(registro.IDDETALHEPRODUTOPEDIDO,registro.IDRESUMOPEDIDO);
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