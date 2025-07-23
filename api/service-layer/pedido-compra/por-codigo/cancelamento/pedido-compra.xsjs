var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function postSl(docEntry,data,session) {
    
    var response = slApi.post('/PurchaseOrders('+docEntry+')/Cancel',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
    }else{
        return 'True';
    }
}

function atualizaCancelamentoPedidoCompra(idResumoPedido){
    var conn = $.db.getConnection();
    var query = 'UPDATE "QUALITY_CONC_HML"."RESUMOPEDIDO" SET' +
		'  STCANCELADO = \'True\''+
		' WHERE IDRESUMOPEDIDO = ?';
		
	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	pStmt.setString(1, idResumoPedido);
	pStmt.execute();
	pStmt.close();
	conn.commit();
	return 'True';
}

function executePedidoCompra(){
    var codPedido = $.request.parameters.get("codPedido");
    
    var query = 'SELECT T1."IDRESUMOPEDIDO", '+
            	' T1."STCANCELADO", '+
            	' T1."STMIGRADOSAP" '+
                'FROM "QUALITY_CONC_HML"."RESUMOPEDIDO" T1 '+
                'WHERE  1=? AND ' +
               	 'T1.STMIGRADOSAP = \'True\' AND T1.STCANCELADO = \'False\'  '+
        		' and T1."IDRESUMOPEDIDO" = '+parseInt(codPedido);
	
	var linhas = api.sqlQuery(query, 1);
	var lines = [];
	var session = '';
	if(linhas.length > 0){
        for (var i = 0; i < linhas.length; i++) {
            var det = linhas[i];
            var resultDocEntry = api.sqlQuery('select "DocEntry" from "SBO_GTO_TESTE1".OPOR where 1=? AND "U_ID_VENDA_PDV" = \''+ det.IDRESUMOPEDIDO.toString()+'\'', 1);
            
            if(resultDocEntry.length > 0)
            {
                if(i === 0){
                    session = slApi.loginServiceLayer(true);
                    slApi.loginServiceLayer(true);
                } 
                
                var NumDocEntry = resultDocEntry[0].DocEntry;
                var rsSl = postSl(NumDocEntry, JSON.parse('{}'), session);
                if(rsSl !== 'True'){
                    return rsSl.error.message.value;
                }
                
                atualizaCancelamentoPedidoCompra(det.IDRESUMOPEDIDO);
            }
        }
        return 'Cancelamento Pedido realizado com sucesso!';
	    //return postSl(lines,'true');
	}else{
	   return 'Pedido não encontrado!'; 
	}
	
}
if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = executePedidoCompra();
                 $.response.setBody(JSON.stringify({ result : doc }));
                break;
                
            default:
                break;
        }
    
    } catch(e) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ message : e.message }));
        $.response.status = 400;
    }   
}


