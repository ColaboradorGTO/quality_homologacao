var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");
//var errorLib = $.import("service-layer-vendas.common", "error");
var loginSl = false;
var sessionSl = '';

function postSl(data, session) {
    
   var response = slApi.post('/IncomingPayments',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
   }else{
        return 'True';
   }
    
}

function errorLogPagamento(idVenda, p_Error){
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ERRORLOGSAPPAGAMENTO = ? WHERE IDVENDA = ?';
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, p_Error);
	pStmt.setString(2, idVenda);
	pStmt.execute();
	
	pStmt.close();
	conn.commit();

	return 'True';
}

function obterLinhasDoPagamento(idVenda, dsTipopagamento, dataVendaPesq) {
    
    var dataqueb =  dataVendaPesq.split('-');
 
	var query = ' SELECT '+
                ' TO_VARCHAR(TBVP.DTVENCIMENTO,\'YYYY-mm-DD HH24:MI:SS\') AS DTVENCIMENTO, ' +
                ' TBVP.VALORRECEBIDO, '+
                ' ifnull(TBVP.NPARCELAS,1) as NPARCELAS, '+
                
                ' CASE WHEN TBVP.NSUAUTORIZADORA = \'\' THEN \'1111\' ELSE TRIM(substring(TBVP.NSUAUTORIZADORA,0,11)) END NSUAUTORIZADORA, '+
                ' TBVP.NUAUTORIZACAO, '+
                ' CASE WHEN TBVP.NOTEF = \'POS\' THEN \'Cartão\' ELSE \'TEF\' END AS NOTEF, '+
                ' CASE TBVP.TPAG '+
                ' WHEN \'001\' THEN \'2\' '+
                ' WHEN \'002\' THEN \'15\' '+
                ' WHEN \'003\' THEN \'4\' '+
                ' WHEN \'004\' THEN \'5\' '+
                ' WHEN \'007\' THEN \'16\' '+
                ' WHEN \'009\' THEN \'10\' '+
                ' WHEN \'014\' THEN (CASE WHEN TBVP.DSTIPOPAGAMENTO like \'%CRÉDITO%\' THEN \'6\' ELSE \'7\' END)  '+ //elo credito e elo debito sao 14 sap 6 e 7
                ' WHEN \'018\' THEN \'13\' '+
                ' WHEN \'020\' THEN \'16\' '+
                ' WHEN \'028\' THEN \'15\' '+
                ' ELSE \'15\' END AS CARTAO_CODIGO,'+
               ' CASE TBVP.TPAG '+
                ' WHEN \'001\' THEN \'6\' '+
                ' WHEN \'002\' THEN \'19\' '+
                ' WHEN \'003\' THEN \'8\' '+
                ' WHEN \'004\' THEN \'9\' '+
                ' WHEN \'007\' THEN \'20\' '+
                ' WHEN \'009\' THEN \'14\' '+
                ' WHEN \'014\' THEN (CASE WHEN TBVP.DSTIPOPAGAMENTO like \'%CRÉDITO%\' THEN \'10\' ELSE \'11\' END)  '+ //elo credito e elo debito sao 14 sap 6 e 7
                ' WHEN \'018\' THEN \'17\' '+
                ' WHEN \'020\' THEN \'20\' '+
                ' WHEN \'028\' THEN \'19\' '+
                ' ELSE \'19\' END AS FORM_PAG_SAP_CODIGO '+
                
               
                
		' FROM  ' +
		'   "VAR_DB_NAME".VENDAPAGAMENTO TBVP ' +
		'  WHERE  ' +
		'   TBVP.IDVENDA = ?   AND (TBVP.STCANCELADO = \'False\' OR TBVP.STCANCELADO = \'\' OR TBVP.STCANCELADO IS NULL )'; 
		
		if(dsTipopagamento === 'DINHEIRO'){
	        query += ' AND TBVP.DSTIPOPAGAMENTO IN (\'DINHEIRO\',\'VOUCHER\',\'Vale Funcionário\',\'VALE FUNCIONÁRIO\',\'Voucher\',\'Parceiros de Apoio\') ';
		}else{
		    query += ' AND TBVP.NOTEF in(\'TEF\',\'POS\') ';
		}
		
		query +='  ORDER BY TBVP.NUAUTORIZACAO  ';

	var linhas = api.sqlQuery(query, idVenda);
	
	var lines = [];
    var nuAutorizadorAnterior = '';
    
	for (var i = 0; i < linhas.length; i++) {
	    
		var det = linhas[i];
		
		
		if(det.NUAUTORIZACAO !== nuAutorizadorAnterior){
		       
            
            if(dsTipopagamento === 'DINHEIRO'){
        		var docLine = {
        			    "pagdinheiro_valor_real": parseFloat(det.VALORRECEBIDO)
        		};
            }else{
                
                    var querySomaRecNsu = 'SELECT SUM(VALORRECEBIDO) FROM VAR_DB_NAME.VENDAPAGAMENTO WHERE IDVENDA = ?  AND (STCANCELADO = \'False\' OR STCANCELADO = \'\' OR STCANCELADO IS NULL ) AND NUAUTORIZACAO =\''+det.NUAUTORIZACAO+'\'';
    		        var SomaRecNsu = api.executeScalar(querySomaRecNsu,idVenda);
                
		        var docLine = {
        			     "pagcartao_autoriza": det.NUAUTORIZACAO, 
                         "pagcartao_parcela": parseInt(det.NPARCELAS) , 
                         "pagcartao_numero": "0", 
                         "pagcartao_validade": dataqueb[0]+'-'+dataqueb[1]+'-01 00:00:00.0',
                         "pagcartao_comprovante": det.NSUAUTORIZADORA,
                         "pagcartao_valor": parseFloat(SomaRecNsu),
                         "cartao_codigo": parseInt(det.CARTAO_CODIGO),
                         "form_pag_sap_codigo": parseInt(det.FORM_PAG_SAP_CODIGO),
                         "pagcartao_meiopagamento": det.NOTEF
        		};
            }
    
    		lines.push(docLine);
		}
		nuAutorizadorAnterior = det.NUAUTORIZACAO;
	}
	if(dsTipopagamento === 'DINHEIRO'){
	    return docLine;
	}else{	
	    return lines;
	    
	}
}

function obterJsonVendaPagamento(byId) {
    
    var query = ' SELECT ' +
	    '   tbv.IDVENDA, ' +
	    '   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'YYYY-mm-DD\') AS DTHORAFECHAMENTO, ' +
		'   tbv.IDEMPRESA,' +
		'   tbe.CODPARCEIRO,' +
		'   (SELECT A."AcctCode" FROM SBO_GTO_PRD.OACT A INNER JOIN SBO_GTO_PRD.OWHS B ON A."U_RS_Filial" = B."WhsCode" WHERE B."BPLid" = tbv.IDEMPRESA) AS CONTA, '+
		'   tbv.VRRECDINHEIRO,' +
		'   tbv.VRRECCONVENIO,' +
		'   tbv.VRRECVOUCHER,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VNF,' +
		'   tbv.NFE_INFNFE_IDE_NNF,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,'+
		'   tbv.IDCAIXAWEB,' +
		'   tbv.NFE_INFNFE_IDE_DHEMI,' +
		'   tbv.NFE_INFNFE_IDE_SERIE,' +
		'   tbv.PROTNFE_INFPROT_CHNFE,' +
		'   tbv.PROTNFE_INFPROT_NPROT,' +
		'   tbv.PROTNFE_INFPROT_CSTAT,' +
		'   tbv.PROTNFE_INFPROT_XMOTIVO,' +
		'   tbv.NFE_INFNFE_TRANSP_MODFRETE ' +
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA' +
		' WHERE ' +
		'	1 = ? AND STCANCELADO = \'False\'';

	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
    var resultadoVenda = api.sqlQuery(query, 1);
	var data = [];
	
    if(resultadoVenda.length === 0){
        return "VENDA CANCELADA OU NÃO EXISTE!";
    }
	for (var i = 0; i < resultadoVenda.length; i++) {

		var registro = resultadoVenda[i];
		
		var queryIdCupom = 'SELECT T1."DocEntry" FROM SBO_GTO_PRD.OINV T1, VAR_DB_NAME.VENDA T2, SBO_GTO_PRD.INV1 T3 '+  
		                            'WHERE 1 = ? and "BPLId" = IDEMPRESA AND '+
                                    'T1."DocEntry" = T3."DocEntry" AND '+
                                    '"Serial" = \''+registro.NFE_INFNFE_IDE_NNF+'\' AND '+
                                    '"SeriesStr" = \''+registro.NFE_INFNFE_IDE_SERIE+'\'  AND '+ 
                                    '"Model" = 54  AND "Usage" = 38 AND "CANCELED" = \'N\' AND'+ 
                                    '"IDVENDA" = \''+registro.IDVENDA+'\' GROUP BY T1."DocEntry"';
                                    
                                 
        //return  queryIdCupom;       
		var resultIdCupom = api.sqlQuery(queryIdCupom, 1);
		
	
		
		if(resultIdCupom.length > 0){ 
    		var queryPagamentoPix = 'SELECT SUM("VALORRECEBIDO") AS "VALORRECEBIDO" FROM VAR_DB_NAME.VENDAPAGAMENTO WHERE 1 = ? and (STCANCELADO=\'\' OR STCANCELADO IS NULL OR STCANCELADO=\'False\') AND DSTIPOPAGAMENTO = \'PIX\' AND IDVENDA=\''+registro.IDVENDA+'\'';
    		var lstPagamentoPix = api.sqlQuery(queryPagamentoPix,1);
    		
    		var queryPagamentoGiroPremiado = 'SELECT "VALORRECEBIDO" FROM VAR_DB_NAME.VENDAPAGAMENTO WHERE 1 = ? and (STCANCELADO=\'\' OR STCANCELADO IS NULL OR STCANCELADO=\'False\') AND DSTIPOPAGAMENTO = \'GIRO PREMIADO\' AND IDVENDA=\''+registro.IDVENDA+'\'';
    		var lstPagamentoGiroPremiado = api.sqlQuery(queryPagamentoGiroPremiado,1);
    		
            var Str_Json = '{"DocType": "rCustomer"'+
            ',"DocDate":"'+ registro.DTHORAFECHAMENTO+'"'+
            ',"CardCode":"'+ registro.CODPARCEIRO+'"';
            if(parseFloat(registro.VRRECDINHEIRO) > 0){
                Str_Json = Str_Json +',"CashAccount":"'+ registro.CONTA+'"'+ 
                ',"CashSum": '+ parseFloat(registro.VRRECDINHEIRO);
            }
            
            if(parseFloat(registro.VRRECCONVENIO) > 0){
                Str_Json = Str_Json +',"CheckAccount":"1.01.03.05.0007"';
            }
            
            if(parseFloat(registro.VRRECVOUCHER) > 0){
                Str_Json = Str_Json +',"CheckAccount":"2.01.01.02.0002"';
            }
            
            if(lstPagamentoPix.length > 0){
    		    Str_Json = Str_Json + ',"TransferAccount" : "1.01.01.01.9998"'+
    		    ',"TransferSum": '+ parseFloat(lstPagamentoPix[0].VALORRECEBIDO)+
    			',"TransferDate": "'+ registro.DTHORAFECHAMENTO+'"'+
    			',"TransferReference": "PAGAMENTO VIA PIX"';
            }
           
            
            /*if(lstPagamentoGiroPremiado.length > 0){
    		    Str_Json = Str_Json + ',"TransferAccount" : "1.01.03.11.0003"'+
    		    ',"TransferSum": '+ parseFloat(lstPagamentoGiroPremiado[0].VALORRECEBIDO)+
    			',"TransferDate": "'+ registro.DTHORAFECHAMENTO+'"'+
    			',"TransferReference": "PAGAMENTO VIA GIRO PREMIADO"';
            }*/
             
            Str_Json = Str_Json + ',"Series": 15'+
    			',"ProjectCode": "PDV_SOFTQUALITY"'+
                ',"PayToCode": "Pagamento"'+
    			',"Remarks": "INTEGRACAO QUALITY PAGAMENTO"'+
    			',"U_IS_ID_QUALITY": "'+byId+'"'+
                ',"PaymentType": "bopt_None"'+
                ',"DocTypte": "rCustomer"'+
                ',"BPLID": ' + parseInt(registro.IDEMPRESA);
                
                
            Str_Json = Str_Json + ',"PaymentInvoices": ['+
                    '{'+
                        '"LineNum": 0'+
                        ',"DocEntry": '+resultIdCupom[0].DocEntry+
                        ',"SumApplied": '+parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF)+
                        ',"InvoiceType": "it_Invoice"'+
                    '}'+
                ']';
            
            var queryPagamentos = 'SELECT SUM("VALORRECEBIDO") AS VALORRECEBIDO, '+
                '   "NSUAUTORIZADORA", '+
                '   "NUAUTORIZACAO", '+
                '   "NPARCELAS", '+
                '   "DSTIPOPAGAMENTO", '+
                '   "TPAG" '+
                ' FROM VAR_DB_NAME.VENDAPAGAMENTO '+
                ' WHERE 1 = ? and (STCANCELADO=\'\' OR STCANCELADO IS NULL OR STCANCELADO=\'False\') AND '+
                '    (UPPER(DSTIPOPAGAMENTO) <> \'PIX\' AND UPPER(DSTIPOPAGAMENTO) <> \'DINHEIRO\' AND UPPER(DSTIPOPAGAMENTO)<> \'VOUCHER\' AND UPPER(DSTIPOPAGAMENTO) <> \'VALE FUNCIONÁRIO\' AND UPPER(DSTIPOPAGAMENTO) <> \'PARCEIROS DE APOIO\') AND '+
                '    IDVENDA=\''+registro.IDVENDA+'\' GROUP BY "NSUAUTORIZADORA","NPARCELAS","DSTIPOPAGAMENTO","TPAG","NUAUTORIZACAO" order by tpag desc';
    		//return queryPagamentos;
    		var lstPagamentos = api.sqlQuery(queryPagamentos,1);
    		
            for(var j = 0; j < lstPagamentos.length; j++){
                var regPagamento = lstPagamentos[j];
                var numParcelas = 1
               if(!parseInt(regPagamento.NPARCELAS) == null ||  !parseInt(regPagamento.NPARCELAS) == 0){
                   numParcelas = parseInt(regPagamento.NPARCELAS);
                   
               }
               
                
                
                var vlParcela = parseFloat(regPagamento.VALORRECEBIDO) / numParcelas;
                vlParcela = parseFloat(vlParcela).toFixed(2);
                var resultadoDiferenca = parseFloat(regPagamento.VALORRECEBIDO) - parseFloat(vlParcela * numParcelas);
                 
                
                var queryCreditCard = 'SELECT "U_IS_CARTAO" from SBO_GTO_PRD."@IV_ITV_FORMAPAG" where 1 = ? and "Code" = '+regPagamento.TPAG;
                var lstCreditCard = api.sqlQuery(queryCreditCard,1);
                
                var numCreditCard = 0;
                
                if(lstCreditCard.length > 0){
                    numCreditCard = lstCreditCard[0].U_IS_CARTAO;
                }
                
                if(j === 0){
                    Str_Json = Str_Json + ',"PaymentCreditCards": [{';
                }else{
                    Str_Json = Str_Json +',{';
                }
                
                    Str_Json = Str_Json +'"LineNum":'+ j;
                    if(regPagamento.DSTIPOPAGAMENTO === 'GIRO PREMIADO'){
                      Str_Json = Str_Json +',"CreditCard":24';  
                    }else{
                      Str_Json = Str_Json +',"CreditCard":23';//+ parseInt(numCreditCard)+//  Id do cartão no SAP -> REGRA 2  
                    }
                    
                    Str_Json = Str_Json +',"CreditCardNumber": "0"'+ // fixo
                    ',"CardValidUntil": "'+ registro.DTHORAFECHAMENTO+'"'; // data do pagamento
                    var numAutorizadora = "0";
                    if(regPagamento.NSUAUTORIZADORA.replace('\t','')!== ""){
                        numAutorizadora = regPagamento.NSUAUTORIZADORA.replace('\t','');
                    }
                    Str_Json = Str_Json + ',"VoucherNum": "'+ numAutorizadora +'"'+ // Id da transação -> NSUAUTORIZADORA
                    ',"NumOfPayments":' + numParcelas +  //numero de parcelas
                    ',"FirstPaymentSum":' + (parseFloat(vlParcela) + resultadoDiferenca).toFixed(2); //valor da primeira parcela
                    if(numParcelas > 1){
                        Str_Json = Str_Json + ',"AdditionalPaymentSum":' + parseFloat(vlParcela).toFixed(2); // valor das demais parcelas
                    }
                var querySomaVlrTotalCartao = 'SELECT SUM("VALORRECEBIDO") as VALORRECEBIDO  FROM VAR_DB_NAME.VENDAPAGAMENTO WHERE 1=? and  (STCANCELADO=\'\' OR STCANCELADO IS NULL OR STCANCELADO=\'False\') AND DSTIPOPAGAMENTO=\''+regPagamento.DSTIPOPAGAMENTO+'\' AND IDVENDA=\''+registro.IDVENDA+'\' AND NUAUTORIZACAO=\''+regPagamento.NUAUTORIZACAO+'\' GROUP BY DSTIPOPAGAMENTO';
                //return querySomaVlrTotalCartao;
                var resValorTotalPago = api.sqlQuery(querySomaVlrTotalCartao, 1);
                var valorTotalPago = 0;
                if(resValorTotalPago.length > 0){
                    valorTotalPago = resValorTotalPago[0].VALORRECEBIDO;
                }
                
                //return valorTotalPago;
                    Str_Json = Str_Json + ',"CreditSum":' + parseFloat(valorTotalPago) + // total pago neste cartão
                    ',"CreditType": "cr_Regular" '+ // fixo
                    ',"SplitPayments": "tYES"'+ // fixo
                '}';
            }
            if(lstPagamentos.length > 0){
                Str_Json = Str_Json +']';
            }
            
            //VALE FUNCIONÁRIO//Vale Funcionário//VOUCHER//Voucher//Parceiros de Apoio
            var queryPagamentosConveniosVouchers = 'SELECT "VALORRECEBIDO","DSTIPOPAGAMENTO" FROM VAR_DB_NAME.VENDAPAGAMENTO WHERE 1=? and  (STCANCELADO=\'\' OR STCANCELADO IS NULL OR STCANCELADO=\'False\') AND UPPER(DSTIPOPAGAMENTO) IN (\'VOUCHER\',\'VALE FUNCIONÁRIO\',\'PARCEIROS DE APOIO\') AND IDVENDA=\''+registro.IDVENDA+'\' ';
    		
    		var lstPagamentosConveniosVouchers = api.sqlQuery(queryPagamentosConveniosVouchers,1);
    		
            for(var k = 0; k < lstPagamentosConveniosVouchers.length; k++){
                var regPagamentoConveniosVouchers = lstPagamentosConveniosVouchers[k];
                if(k === 0){
                    Str_Json = Str_Json + ',"PaymentChecks": [{';
                }else{
                    Str_Json = Str_Json +',{';
                }
                
                    Str_Json = Str_Json +'"LineNum":'+ k +
                    ',"DueDate": "'+ registro.DTHORAFECHAMENTO+'"'; // DATA DO PAGAMENTO
                    
                    if(parseFloat(registro.VRRECCONVENIO) > 0){
                        var queryConvenio = 'SELECT "IDDETLACCONVENIO" FROM VAR_DB_NAME.DETLANCCONVENIO WHERE 1=? and IDRESUMOVENDAWEB=\''+registro.IDVENDA+'\'';
    		            var lstConvenio = api.sqlQuery(queryConvenio,1);
    		            if(lstConvenio.length > 0){
                            Str_Json = Str_Json +',"CheckNumber":"'+lstConvenio[0].IDDETLACCONVENIO +'"'+ // NUMERO DO VOUCHER OU CONVENIO
                            ',"BankCode": "996"';
    		            }
                    }
                    
                    if(parseFloat(registro.VRRECVOUCHER) > 0){
                        var queryVoucher = 'SELECT "NUVOUCHER" FROM VAR_DB_NAME.RESUMOVOUCHER WHERE 1=? and  IDRESUMOVENDAWEBDESTINO=\''+registro.IDVENDA+'\'';
    		            var lstVoucher = api.sqlQuery(queryVoucher,1);
    		            if(lstVoucher.length > 0){
                            Str_Json = Str_Json +',"CheckNumber":"'+ lstVoucher[0].NUVOUCHER +'"';// NUMERO DO VOUCHER OU CONVENIO
                        }
                    }
                    
                    Str_Json = Str_Json +',"CheckSum":' +parseFloat(regPagamentoConveniosVouchers.VALORRECEBIDO)+ // VALOR DO CONVENIO/VOUCHER
                                         ',"BankCode": "997"'; // NUMERO DO VOUCHER OU CONVENIO CASO PRECISE DE TEXTO
                   
                    if(parseFloat(registro.VRRECVOUCHER) > 0){
                        Str_Json = Str_Json +',"CheckAccount":"2.01.01.02.0002"'+
                         ',"BankCode": "997"';
                    }else{
                        Str_Json = Str_Json +',"CheckAccount": "1.01.03.05.0007"'+
                        ',"BankCode": "996"'; 
                    }
                    
                Str_Json = Str_Json +'}';
            }
            if(lstPagamentosConveniosVouchers.length > 0){
                Str_Json = Str_Json +']';
            }
             
           
           Str_Json = Str_Json + '}';
    	   return JSON.parse(Str_Json);
    	//	data.push(JSON.parse(Str_Json));
    		//data.push(Str_Json);
		}/*else{
		    return 'VENDA NÃO INTEGRADA!';
		}*/

	}
	 return JSON.parse(Str_Json);
   	//return Str_Json;
	//response.data = data;

	//return data;
}

function excutePagamentoNaoIntegrado(byId){
    
    var query = ' SELECT TOP 150' +      
        '    G.IDVENDA' +
        ' FROM' +
        '    SBO_GTO_PRD.OINV A' +
        '    INNER JOIN SBO_GTO_PRD.INV12 B ON' +
        '        A."DocEntry" = B."DocEntry"' +
        '    INNER JOIN SBO_GTO_PRD.OUSG C ON' +
        '        B."MainUsage" = C.ID' +
        '    INNER JOIN SBO_GTO_PRD.OBPL D ON' +
        '        A."BPLId" = D."BPLId"' +
        '    LEFT JOIN SBO_GTO_PRD.RCT2 E ON' +
        '        A."DocEntry" = E."DocEntry"' +
        '        AND A."ObjType" = E."InvType"' +
        '    LEFT JOIN SBO_GTO_PRD.ORCT F ON' +
        '        E."DocNum" = F."DocEntry"' +
        '    INNER JOIN VAR_DB_NAME.VENDA G ON' +
        '        A."U_ChaveAcesso" = G.PROTNFE_INFPROT_CHNFE' +
        ' WHERE' +
        '    1 = ?' +
        '    AND B."MainUsage" = 38' +
        '    and IFNULL(CAST(F."TransId" AS VARCHAR), \'Sem ID\') = \'Sem ID\'' +
        '    AND A."CANCELED" = \'N\'' +
//        '    AND A."DocDate" >= \'01.11.2023\'' +
//        '    AND A."DocDate" <= \'27.04.2025\'' +
        '    AND (TO_DATE(A."DocDate") >= \'01.01.2025\' AND TO_DATE(A."DocDate") <= ADD_DAYS(CURRENT_DATE, -2)) '+
        '    AND IFNULL(G."ERRORLOGSAPPAGAMENTO",\'\') = \'\'' +
        '    AND IFNULL(G."IDVENDA", \'\') <> \'\'' +
        '    AND G.stcancelado = \'False\' ' ;
        
    if (byId) {
        query += ` And  G.IDVENDA = '${byId}' `;
    }
    
    query += ' ORDER BY A."DocDate" ';
        //return query;
    var response = api.sqlQuery(query, 1);
    var session = '';
    for (var i = 0; i < response.length; i++) {
	    var retJson = '';
        var det = response[i];
        
        retJson = obterJsonVendaPagamento(det.IDVENDA);
        
        if(i === 0){
		    session = slApi.loginServiceLayer(true);
		    slApi.loginServiceLayer(true);
		} 
	
   		var retSl = postSl(retJson,session);
		
	    if(retSl !== 'True'){
		    //return retSl;
		   errorLogPagamento(det.IDVENDA, retSl.error.message.value);
		  // return retSl.error.message.value;
		}
	}
	return 'Migração pagamento realizado com sucesso!';
}


if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                let byId = $.request.parameters.get("id");
                
                var doc = excutePagamentoNaoIntegrado(byId);
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