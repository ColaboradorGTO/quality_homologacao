var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function postSl(transferencia, force) {
    var session = '';    
   if ( force === 'true' ) 
    {
        session = slApi.loginServiceLayer(true);
    }

    if ( force === 'true' ) 
    {
         slApi.loginServiceLayer(true);
    }
    
   var response = slApi.post('/PurchaseOrders',transferencia,session);
    return 'True';
}

function pedidoCompra(byId){
    
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
            	' T3."IDSAP" '+
                'FROM "QUALITY_CONC_HML"."RESUMOPEDIDO" T1 '+
                'INNER JOIN "QUALITY_CONC_HML"."FORNECEDOR" T2 ON T2.IDFORNECEDOR = T1.IDFORNECEDOR '+
                'INNER JOIN "QUALITY_CONC"."CONDICAOPAGAMENTO" T3 ON T3.IDCONDICAOPAGAMENTO = T1.IDCONDICAOPAGAMENTO '+
               	'WHERE  ' +
        		' T1."IDRESUMOPEDIDO" = ?  ';
	
	var linhas = api.sqlQuery(query, byId);
	var lines = [];
	
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
		
		var formaPagamento = api.sqlQuery('select top 1 "PymCode" AS ID from "SBO_GTO_PRD".CRD2 where "CardCode" = ? order by "LineNum" desc',det.IDFORNECEDORSAP);
	    var retCodigoComprador = api.sqlQuery('select "SlpCode" AS IDCOMPRADOR from "SBO_GTO_PRD".OSLP where "U_Matricula" = ?',det.IDCOMPRADOR);
	    var cdComprador = -1;
	    if(retCodigoComprador.length > 0){cdComprador = retCodigoComprador[0].IDCOMPRADOR;}
		var Str_Json = '{"DocType": "dDocument_Items"'+
		    ',"U_ID_QUALITY":"'+ det.IDRESUMOPEDIDO+'"'+
            ',"DocDate":"'+ det.DTPEDIDO+'"'+
            ',"DocDueDate":"'+ det.DTPREVENTREGA+'"'+
            ',"CardCode":"'+ det.IDFORNECEDOR +'"'+
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
		',"MainUsage": 10'+
        '}}';
       
		lines.push(JSON.parse(Str_Json));
		//lines.push(Str_Json);
	}

	return postSl(lines,'true');
}

