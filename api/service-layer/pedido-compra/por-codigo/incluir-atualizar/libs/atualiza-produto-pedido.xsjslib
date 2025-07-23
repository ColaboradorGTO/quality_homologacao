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

function executePedidoCompra(codPedido,codProduto){
    
    var dataAtual = '';
    var data = new Date(); 
    var dd = ("0" + data.getDate()).slice(-2);
    var mm = ("0" + (data.getMonth() + 1)).slice(-2);
    var y = data.getFullYear();
    
    var dataAtualizacao = y+'-'+mm+'-'+dd;
   
    var query = 'SELECT T1."IDRESUMOPEDIDO", '+
            	' T1."STCANCELADO", '+
            	' TO_VARCHAR(T1.DTPREVENTREGA,\'YYYY-mm-DD\') AS DTPREVENTREGA, ' +
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
                var queryProduto = 'select a."LineNum",a."LineStatus" from "SBO_GTO_TESTE1".POR1 a '+ 
                                    ' inner join "SBO_GTO_TESTE1".OPOR b on a."DocEntry" = b."DocEntry" '+ 
                                    ' where 1=? AND a."LineStatus"=\'O\' AND b."U_ID_VENDA_PDV" = \''+codPedido.toString()+'\''+ 
                                    ' AND a."ItemCode" = \''+codProduto.toString()+'\'';
              
                var resultProd = api.sqlQuery(queryProduto, 1);
                
                var queryDetalheProdutoPedido = 'SELECT * '+
                                        'FROM "QUALITY_CONC_HML"."DETALHEPEDIDO" T1 '+
                                        'INNER JOIN "QUALITY_CONC_HML"."DETALHEPRODUTOPEDIDO" T2 ON T2."IDDETALHEPEDIDO" = T1."IDDETALHEPEDIDO" '+
                                        'WHERE 1 = ? AND T1.IDRESUMOPEDIDO = '+det.IDRESUMOPEDIDO +' AND T2.IDPRODCADASTRO = \''+codProduto.toString()+'\'';
                       
                                 
                var retDetalheProdutoPedido = api.sqlQuery(queryDetalheProdutoPedido,1);
               
                if(resultProd.length > 0){
                    if(retDetalheProdutoPedido.length > 0){
                        var ret = retDetalheProdutoPedido[0];
                        var strJson = '{ '+
                        ' "DocDueDate":"'+ det.DTPREVENTREGA+'"'+
                        ' ,"DocumentLines": [{ '+
                        ' "LineNum": '+resultProd[0].LineNum+
                        ' ,"ItemCode": "'+codProduto.toString()+'"'+
                        ' ,"Quantity": "'+ ret.QTDPRODUTO +'"'+
			            ' ,"UnitPrice": "'+ ret.VRCUSTO +'"'+
			            ' ,"CostingCode": "ALOCREC" '+
			            ' ,"ProjectCode": "PDV_SOFTQUALITY" '+
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
                        return 'True';
                    }
                }else{
                    if(retDetalheProdutoPedido.length > 0){
                        var ret = retDetalheProdutoPedido[0];
                        var strJson = '{ '+
                        ' "DocDueDate": "'+dataAtualizacao+'", '+
                        ' "DocumentLines": [{ '+
                        ' "ItemCode": "'+codProduto.toString()+'"'+
                        ' ,"Quantity": "'+ ret.QTDPRODUTO +'"'+
			            ' ,"UnitPrice": "'+ ret.VRCUSTO +'"'+
			            ' ,"CostingCode": "ALOCREC" '+
			            ' ,"ProjectCode": "PDV_SOFTQUALITY" '+
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
                        return 'True';
                    }
                }
            }
        }
        return 'True';
	}else{
	   return 'False'; 
	}
	
}

