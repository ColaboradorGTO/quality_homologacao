var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function patchSl(docEntry,data,session) {
    
    var response = slApi.patch('/PurchaseOrders('+docEntry+')',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
    }else{
        return 'True';
    }
}

function executePedidoCompra(){
    var codPedido = $.request.parameters.get("codPedido");
    var codProduto = $.request.parameters.get("codProduto");
    
    var dataAtual = '';
    var data = new Date(); 
    var dd = ("0" + data.getDate()).slice(-2);
    var mm = ("0" + (data.getMonth() + 1)).slice(-2);
    var y = data.getFullYear();
    
    var dataAtualizacao = y+'-'+mm+'-'+dd;
   
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
                var queryProduto = 'select a."LineNum" from "SBO_GTO_TESTE1".POR1 a '+ 
                                    ' inner join "SBO_GTO_TESTE1".OPOR b on a."DocEntry" = b."DocEntry" '+ 
                                    ' where 1=? AND b."U_ID_VENDA_PDV" = \''+codPedido.toString()+'\''+ 
                                    ' AND a."ItemCode" = \''+codProduto.toString()+'\'';
              
                var resultProd = api.sqlQuery(queryProduto, 1);
               
                if(resultProd.length > 0){
                    var strJson = '{ '+
                        ' "DocDueDate": "'+dataAtualizacao+'", '+
                        ' "DocumentLines": [{ '+
	                        ' "LineNum": '+parseInt(resultProd[0].LineNum)+', '+
                            ' "LineStatus": "bost_Close" '+
                    ' }]}';
                    if(i === 0){
                        session = slApi.loginServiceLayer(true);
                        slApi.loginServiceLayer(true);
                    } 
                
                    var NumDocEntry = resultDocEntry[0].DocEntry;
                    var rsSl = patchSl(NumDocEntry, JSON.parse(strJson), session);
                    if(rsSl !== 'True'){
                        return rsSl.error.message.value;
                    }
                }else{
                    return 'Produto não encontrado!'; 
                }
            }
        }
        return 'Cancelamento Produto realizado com sucesso!';
	}else{
	   return 'Pedido de compra não encontrado!'; 
	}
	
}
if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.PATCH:
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
