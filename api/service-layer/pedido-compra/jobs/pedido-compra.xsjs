var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function postSl(data, session) {
    
    var response = slApi.post('/PurchaseOrders',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
    }else{
        return 'True';
    }
   
}

function atualizaMigracaoPedidoCompra(idResumoPedido){
    var conn = $.db.getConnection();
    var query = 'UPDATE "QUALITY_CONC_HML"."RESUMOPEDIDO" SET' +
		'  STMIGRADOSAP = \'True\''+
		' WHERE IDRESUMOPEDIDO = ?';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idResumoPedido);
	
	pStmt.execute();
	
	pStmt.close();

	conn.commit();
	return 'True';
}

function executePedidoCompra(){
    
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
                'FROM "QUALITY_CONC_HML"."RESUMOPEDIDO" T1 '+
                'INNER JOIN "QUALITY_CONC_HML"."FORNECEDOR" T2 ON T2.IDFORNECEDOR = T1.IDFORNECEDOR '+
                'INNER JOIN "QUALITY_CONC_HML"."CONDICAOPAGAMENTO" T3 ON T3.IDCONDICAOPAGAMENTO = T1.IDCONDICAOPAGAMENTO '+
                'INNER JOIN "QUALITY_CONC_HML"."TIPODOCUMENTO" T4 ON T4.IDTPDOCUMENTO = T3.IDTPDOCUMENTO '+
               	'WHERE  1=? AND ' +
               	 'T1.STMIGRADOSAP IS NULL AND T1.IDANDAMENTO = 5  ';
        		//' T1."IDRESUMOPEDIDO" = ?  ';
	
	var linhas = api.sqlQuery(query, 1);
	var lines = [];
	var session = '';
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
		
		var formaPagamento = api.sqlQuery('select top 1 "PymCode" AS ID from "SBO_GTO_PRD".CRD2 where "CardCode" = ? order by "LineNum" desc',det.IDFORNECEDORSAP);
	    var retCodigoComprador = api.sqlQuery('select "SlpCode" AS IDCOMPRADOR from "SBO_GTO_PRD".OSLP where "U_Matricula" = ?',det.IDCOMPRADOR);
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
                                        'FROM "QUALITY_CONC_HML"."DETALHEPEDIDO" T1 '+
                                        'INNER JOIN "QUALITY_CONC_HML"."DETALHEPRODUTOPEDIDO" T2 ON T2."IDDETALHEPEDIDO" = T1."IDDETALHEPEDIDO" '+
                                        'WHERE 1 = ? AND T1.IDRESUMOPEDIDO = '+det.IDRESUMOPEDIDO;
                                        
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
      // return JSON.parse(Str_Json);
		if(i === 0){
	    session = slApi.loginServiceLayer(true);
	    slApi.loginServiceLayer(true);
		} 
		//return session;
        var rsSl = postSl(JSON.parse(Str_Json),session);
    	if(rsSl !== 'True'){
    	    //return "acima";
    	    //errorLogNotaSaida(det.IDRESUMOOT, rsSl.error.message.value);
    	    //return "naqui";
            return rsSl.error.message.value;
	    }
      // return 'aqui';
       var resultMigracao = api.sqlQuery('select "U_ID_VENDA_PDV" from "SBO_GTO_TESTE1".OPOR where 1=? AND "U_ID_VENDA_PDV" = \''+ det.IDRESUMOPEDIDO.toString()+'\'', 1);
	   if(resultMigracao.length > 0)
	   {
	       atualizaMigracaoPedidoCompra(det.IDRESUMOPEDIDO);
	   }
	}
    return 'Migração Pedido realizada com sucesso!';
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

