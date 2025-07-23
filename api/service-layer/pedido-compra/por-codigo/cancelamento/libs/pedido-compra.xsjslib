var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = 'SBO_GTO_TESTE4';

function postSl(docEntry,data,session) {
    
    var response = slApi.post('/PurchaseOrders('+docEntry+')/Cancel',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
    }else{
        return 'True';
    }
}

function executeCancelamentoPedidoCompra(codPedido){
    var query = 'SELECT T1."IDRESUMOPEDIDO", '+
            	' T1."STCANCELADO", '+
            	' T1."STMIGRADOSAP", '+
            	' TO_VARCHAR(T1.DTPREVENTREGA,\'YYYY-mm-DD\') AS DTPREVENTREGA ' +
                'FROM "VAR_DB_NAME"."RESUMOPEDIDO" T1 '+
                'WHERE  1=? AND ' +
               	 'T1.STMIGRADOSAP = \'True\'  '+
        		' and T1."IDRESUMOPEDIDO" = '+parseInt(codPedido);
	
	var linhas = api.sqlQuery(query, 1);
	var lines = [];
	var session = '';
	if(linhas.length > 0){
        for (var i = 0; i < linhas.length; i++) {
            var det = linhas[i];
            var resultDocEntry = api.sqlQuery(`select "DocEntry" from ${dbNameSAP}.OPOR where 1=? AND "U_ID_VENDA_PDV" = '${det.IDRESUMOPEDIDO}'`, 1);
            
            if(resultDocEntry.length > 0)
            {
                if(i === 0){
                    session = slApi.loginServiceLayer(true);
                    slApi.loginServiceLayer(true);
                } 
                
                var NumDocEntry = resultDocEntry[0].DocEntry;
                var rsSl = postSl(NumDocEntry, {}, session);
                //return rsSl
                if(rsSl !== 'True'){
                    return 'False';
                }
                
            }
        }
        return 'True';
	    //return postSl(lines,'true');
	}else{
	   return 'False'; 
	}
	
}


