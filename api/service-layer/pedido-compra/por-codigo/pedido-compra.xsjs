var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = 'SBO_GTO_TESTE4';

function postSl(data, session) {
    
    var response = slApi.post('/PurchaseOrders',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
    }else{
        return 'True';
    }
}

function atualizarLogSapDoPedido(idResumoPedido, logSap){
    let conn = $.db.getConnection();
    logSap = logSap ? translator.traduzirTexto(logSap) : '';
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            LOGSAP = '${logSap}'
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idResumoPedido);
	
	pStmt.execute();
	
	pStmt.close();

	conn.commit();
	return 'True';
}

function atualizaMigracaoPedidoCompra(idResumoPedido){
    var conn = $.db.getConnection();
    var query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            LOGSAP = 'MIGRADO',
            STMIGRADOSAP = 'True'
		WHERE 
            IDRESUMOPEDIDO = ?`;
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idResumoPedido);
	
	pStmt.execute();
	
	pStmt.close();
    
    //atualizarLogSapDoPedido(idResumoPedido, 'MIGRADO');
    
	conn.commit();
	return 'True';
}

function executePedidoCompra(){
    var codPedido = $.request.parameters.get("codPedido");
    
    var query = 'SELECT T1."IDRESUMOPEDIDO", '+
            	' T1."IDGRUPOEMPRESARIAL", '+
            	' T1."IDSUBGRUPOEMPRESARIAL", '+
            	' T1."IDEMPRESA", '+
            	' T1."IDCOMPRADOR", '+
            	' T1."IDCONDICAOPAGAMENTO", '+
            	' T1."IDFORNECEDOR", '+
            	' T1."IDTRANSPORTADORA", '+
            	' T1."IDANDAMENTO", '+
            	' T1."TPCATEGORIAPEDIDO", '+
            	' CASE T1."MODPEDIDO" WHEN \'VESTUARIO\' THEN 1 WHEN \'CALCADOS\' THEN 2 WHEN \'ARTIGOS\' THEN 3 END AS MODPEDIDO, '+
            	' T1."TPFORNECEDOR", '+
            	' T1."NOVENDEDOR", '+
            	' T1."EEMAILVENDEDOR", '+
            	' TO_VARCHAR(T1.DTPEDIDO,\'YYYY-mm-DD\') AS DTPEDIDO, ' +
            	' TO_VARCHAR(T1.DTPREVENTREGA,\'YYYY-mm-DD\') AS DTPREVENTREGA, ' +
            	' CASE T1."TPFRETE" WHEN \'PAGO\' THEN 0 WHEN \'APAGAR\' THEN 1 END AS TPFRETE, '+
            	' T1."NUTOTALITENS", '+
            	' T1."QTDTOTPRODUTOS", '+
            	' T1."VRTOTALBRUTO", '+
            	' T1."DESCPERC01", '+
            	' T1."DESCPERC02", '+
            	' T1."DESCPERC03", '+
            	' T1."PERCCOMISSAO", '+
            	' T1."VRTOTALLIQUIDO", '+
            	' T1."OBSPEDIDO", '+
            	' T1."OBSPEDIDO2", '+
            	' T1."DTFECHAMENTOPEDIDO", '+
            	' TO_VARCHAR(T1.DTCADASTRO,\'YYYY-mm-DD\') AS DTCADASTRO, ' +
            	' T1."IDRESPCANCELAMENTO", '+
            	' T1."DSMOTIVOCANCELAMENTO", '+
            	' TO_VARCHAR(T1.DTCANCELAMENTO,\'YYYY-mm-DD\') AS DTCANCELAMENTO, ' +
            	' T1."TPARQUIVO", '+
            	' TO_VARCHAR(T1.DTRECEBIMENTOPEDIDO,\'YYYY-mm-DD\') AS DTRECEBIMENTOPEDIDO, ' +
            	' T1."STDISTRIBUIDO", '+
            	' T1."STAGRUPAPRODUTO", '+
            	' T1."STCANCELADO", '+
            	' T1."TPFISCAL", '+
            	' T1."VRCOMISSAO", '+
            	' T2."IDFORNECEDORSAP", '+
            	' T3."IDSAP", '+
            	' T4."IDSAP" AS IDSAPTPDOCUMENTO '+
                'FROM "VAR_DB_NAME"."RESUMOPEDIDO" T1 '+
                'INNER JOIN "VAR_DB_NAME"."FORNECEDOR" T2 ON T2.IDFORNECEDOR = T1.IDFORNECEDOR '+
                'INNER JOIN "VAR_DB_NAME"."CONDICAOPAGAMENTO" T3 ON T3.IDCONDICAOPAGAMENTO = T1.IDCONDICAOPAGAMENTO '+
                'INNER JOIN "VAR_DB_NAME"."TIPODOCUMENTO" T4 ON T4.IDTPDOCUMENTO = T3.IDTPDOCUMENTO '+
               	'WHERE  1=? AND ' +
               	'(T1.STMIGRADOSAP IS NULL OR T1.STMIGRADOSAP = \'False\') AND T1.IDANDAMENTO = 5  '+
        		' and T1."IDRESUMOPEDIDO" = '+parseInt(codPedido);
	
	var linhas = api.sqlQuery(query, 1);
	var lines = [];
	var session = '';
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var formaPagamento = api.sqlQuery(`select top 1 "PymCode" AS ID from ${dbNameSAP}.CRD2 where "CardCode" = ? order by "LineNum" desc`,det.IDFORNECEDORSAP);
	    var retCodigoComprador = api.sqlQuery(`select "SlpCode" AS IDCOMPRADOR from ${dbNameSAP}.OSLP where "U_Matricula" = ?`,det.IDCOMPRADOR);
	    var cdComprador = -1;
	    if(retCodigoComprador.length > 0){cdComprador = retCodigoComprador[0].IDCOMPRADOR;}
		var Str_Json = '{"DocType": "dDocument_Items"'+
		    ',"U_ID_VENDA_PDV":"'+ det.IDRESUMOPEDIDO+'"'+
            ',"DocDate":"'+ det.DTPEDIDO+'"'+
            ',"DocDueDate":"'+ det.DTPREVENTREGA+'"'+
            ',"CardCode":"'+ det.IDFORNECEDORSAP +'"'+
            ',"NumAtCard": '+ det.IDRESUMOPEDIDO +
            ',"DocTotal": '+ parseFloat(det.VRTOTALLIQUIDO) +
            ',"Comments": "Integração Quality"'+
            ',"PaymentGroupCode":'+ det.IDSAP +
            //',"PaymentMethod": "'+ formaPagamento[0].ID +'"'+
            ',"SalesPersonCode": '+ cdComprador +
            ',"Project": "PDV_SOFTQUALITY"'+
            ',"BPL_IDAssignedToInvoice": 101'+
            ',"U_GrupoEmpresarial": '+ det.IDGRUPOEMPRESARIAL +
            ',"U_tipoproduto": '+ det.MODPEDIDO +
            ',"PaymentMethod": "'+ det.IDSAPTPDOCUMENTO +'"'+
            ',"DocumentLines": [ ';
            
        var queryDetalheProdutoPedido = 'SELECT * '+
                                        'FROM "VAR_DB_NAME"."DETALHEPEDIDO" T1 '+
                                        'INNER JOIN "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" T2 ON T2."IDDETALHEPEDIDO" = T1."IDDETALHEPEDIDO" '+
                                        'WHERE 1 = ? AND T1.STCANCELADO = \'False\' AND T2.STCANCELADO = \'False\' AND T1.IDRESUMOPEDIDO = '+det.IDRESUMOPEDIDO;
                                        
        var lstDetalheProdutoPedido = api.sqlQuery(queryDetalheProdutoPedido,1);
        
        for(var j = 0; j < lstDetalheProdutoPedido.length; j++){
           var ret = lstDetalheProdutoPedido[j];
           
            if(j === 0 ){ Str_Json = Str_Json +'{';}else{Str_Json = Str_Json +',{';}
            
                Str_Json = Str_Json + '"LineNum": '+ parseInt(j+1) + 
				' ,"ItemCode": "'+ ret.IDPRODCADASTRO +'"'+
				' ,"Quantity": "'+ ret.QTDPRODUTO +'"'+
				' ,"UnitPrice": "'+ ret.VRCUSTO +'"'+
				' ,"WarehouseCode": "101" '+
				' ,"CostingCode": "ALOCREC" '+
				' ,"ProjectCode": "PDV_SOFTQUALITY" '+
				' ,"BarCode": "'+ ret.CODBARRAS +'"'+ 
				' ,"Usage": 10}'; 
        }
        
        Str_Json = Str_Json + '],'+
        '"TaxExtension": { '+
        ' "Incoterms":'+ parseInt(det.TPFRETE) + 
		',"MainUsage": 10 '+
        '}}';
       //return JSON.parse(Str_Json);
		if(i === 0){
    	    session = slApi.loginServiceLayer(true);
    	    slApi.loginServiceLayer(true);
		} 
        
        var rsSl = postSl(JSON.parse(Str_Json),session);
        
        if(rsSl !== 'True'){
            let logSap = rsSl.error.message.value || rsSl.message['Store.store'];
         
           logSap = logSap ? translator.traduzirTexto(logSap) : 'Erro ao migrar';
           
           atualizarLogSapDoPedido(det.IDRESUMOPEDIDO, logSap);
           
           return {
               "type": 'warning',
               "msg": logSap,
               rsSl
            };
	    }
      // return 'aqui';
       var resultMigracao = api.sqlQuery(`select "U_ID_VENDA_PDV" from ${dbNameSAP}.OPOR where 1=? AND "U_ID_VENDA_PDV" = '${det.IDRESUMOPEDIDO}'`, 1);
	   if(resultMigracao.length > 0){
	       atualizaMigracaoPedidoCompra(det.IDRESUMOPEDIDO);
	   }
	}
	
	return {
        "type": 'success',
        "msg": 'Migração do Pedido realizada com sucesso!'
    };
    //return 'Migração Pedido realizada com sucesso!';
	//return postSl(lines,'true');
}
if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = executePedidoCompra();
                 $.response.setBody(JSON.stringify(doc));
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

