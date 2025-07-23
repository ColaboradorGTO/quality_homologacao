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

function executeCancelamentoProdutoPedidoCompra(codPedido,codProduto){
   
    var dataAtual = '';
    var data = new Date(); 
    var dd = ("0" + data.getDate()).slice(-2);
    var mm = ("0" + (data.getMonth() + 1)).slice(-2);
    var y = data.getFullYear();
    
    var dataAtualizacao = y+'-'+mm+'-'+dd;
   
    var query = 'SELECT T1."IDRESUMOPEDIDO", '+
            	' T1."STCANCELADO", '+
            	' T1."STMIGRADOSAP", '+
            	' TO_VARCHAR(T1.DTPREVENTREGA,\'YYYY-mm-DD\') AS DTPREVENTREGA ' +
                'FROM "QUALITY_CONC_HML"."RESUMOPEDIDO" T1 '+
                'WHERE  1=? AND ' +
               	 'T1."IDRESUMOPEDIDO" = '+parseInt(codPedido);
	
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
                        '"DocDueDate":"'+ det.DTPREVENTREGA+'",'+
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
                        return 'False';
                    }
                }else{
                    return 'False'; 
                }
            }
        }
        return 'True';
	}else{
	   return 'False'; 
	}
	
}

