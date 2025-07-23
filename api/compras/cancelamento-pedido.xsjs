var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var libCancelamentoResPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.cancelamento.libs.pedido-compra", "libCancelamentoResPedido");

let dbNameSAP = 'SBO_GTO_TESTE4';

function validarSeEstaCanceladoSAP(idResumoPedido){
    let regExist = api.sqlQuery(`SELECT "DocEntry" FROM ${dbNameSAP}.OPOR WHERE 1 = ? AND "CANCELED" = 'Y' AND "U_ID_VENDA_PDV" = '${idResumoPedido}'`, 1) || '';
    
    return (regExist.length > 0);
}

function fnHandlePut() {
    
    var conn = $.db.getConnection();
    
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOPEDIDO" SET ' +
        ' "IDANDAMENTO" = ?, ' + 
        ' "IDRESPCANCELAMENTO" = ?, ' + 
        ' "DSMOTIVOCANCELAMENTO" = ?, ' + 
        ' "DTCANCELAMENTO" = ?, ' + 
        ' "STCANCELADO" = ?, ' +
        ' "DTMOVPEDIDO" = now() ' +
        ' WHERE "IDRESUMOPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 

    pStmt.setInt(1, registro.IDANDAMENTO);
    pStmt.setInt(2, registro.IDRESPCANCELAMENTO);
    pStmt.setString(3, registro.DSMOTIVOCANCELAMENTO);
    pStmt.setDate(4, registro.DTCANCELAMENTO);
    pStmt.setString(5, registro.STCANCELADO);
    pStmt.setInt(6, registro.IDRESUMOPEDIDO);
    
	pStmt.execute();
	
    var query3 = 'UPDATE "VAR_DB_NAME".DETALHEPEDIDO SET STCANCELADO = \'True\' WHERE DETALHEPEDIDO.IDRESUMOPEDIDO=?';
    
	var pStmt3 = conn.prepareStatement(api.replaceDbName(query3));
    pStmt3.setInt(1,registro.IDRESUMOPEDIDO);
    pStmt3.execute();
	pStmt3.close();
	
	var querydetpedido = ' SELECT (DETPED.IDDETALHEPEDIDO) ' +
		' FROM  ' +
		'   "VAR_DB_NAME".DETALHEPEDIDO  DETPED' +
		'  WHERE  ' +
		'   DETPED."IDRESUMOPEDIDO" = ?  ';

	var linha2 = api.sqlQuery(querydetpedido, registro.IDRESUMOPEDIDO);
    for (var i = 0; i < linha2.length; i++) {
        
        	var det2 = linha2[i];
        	var iDDetPedido = parseInt(det2.IDDETALHEPEDIDO);
        	
            var query2 = 'UPDATE "VAR_DB_NAME".DETALHEPEDIDOGRADE SET STATIVO = \'False\' WHERE DETALHEPEDIDOGRADE.IDDETALHEPEDIDO=?';
            var query4 = 'UPDATE "VAR_DB_NAME".DETALHEPRODUTOPEDIDO SET STATIVO = \'False\', STCANCELADO = \'True\' WHERE DETALHEPRODUTOPEDIDO.IDDETALHEPEDIDO=?';
            //var query5 = 'UPDATE p SET p.STATIVO = \'False\', p.DTULTALTERACAO = now() FROM "VAR_DB_NAME".PRODUTO p INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO d ON p.IDDETALHEPRODUTOPEDIDO = d.IDDETALHEPRODUTOPEDIDO WHERE d.IDDETALHEPEDIDO=?';
        	
        	var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
        	var pStmt4 = conn.prepareStatement(api.replaceDbName(query4));
        	//var pStmt5 = conn.prepareStatement(api.replaceDbName(query5));
        	
                pStmt2.setInt(1,iDDetPedido);
                pStmt4.setInt(1,iDDetPedido);
                //pStmt5.setInt(1,iDDetPedido);
            	
                pStmt2.execute();
                pStmt4.execute();
                //pStmt5.execute();
    }
    
	
	pStmt.close();
	pStmt2.close();
	pStmt4.close();
	//pStmt5.close();

	let respMigrado = api.sqlQuery(`SELECT IDRESUMOPEDIDO FROM "VAR_DB_NAME".RESUMOPEDIDO WHERE STMIGRADOSAP = 'True' AND IDRESUMOPEDIDO = ?`, registro.IDRESUMOPEDIDO)
	
	if(respMigrado.length > 0){
        if(!validarSeEstaCanceladoSAP(registro.IDRESUMOPEDIDO)){
            let retIntegracaoCancelamento = libCancelamentoResPedido.executeCancelamentoPedidoCompra(registro.IDRESUMOPEDIDO);
            
            if(retIntegracaoCancelamento !== 'True'){
                return {
                    "msg": "Error Cancelamento!"
                };
            }
        }
	}
	
    conn.commit();
    
    return {
        "msg": "Cancelamento realizado com sucesso!"
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
    var detalheError = e.stack ? e.stack.split('\n') : '';
    
    detalheError = detalheError ? detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim() : '';
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message || e,
        detalheError
    }));
    $.response.status = 400;
    /*
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;*/
}