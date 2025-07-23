var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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
                
                    var querySomaRecNsu = 'SELECT SUM(VALORRECEBIDO) FROM QUALITY_CONC_HML.VENDAPAGAMENTO WHERE IDVENDA = ?  AND (STCANCELADO = \'False\' OR STCANCELADO = \'\' OR STCANCELADO IS NULL ) AND NUAUTORIZACAO =\''+det.NUAUTORIZACAO+'\'';
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

function fnHandleGet(byId) {
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var nrNFSap = $.request.parameters.get("nrNFSap");
    
    var query = ' SELECT ' +
		'   tbv.IDVENDA,' +
		'   TBV.IDEMPRESA,' +
        '   TBV.DEST_CPF,' +
        
        '   TBV.IDCAIXAWEB,' +
        '   TBV.VRTOTALVENDA,' +
        '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,' +
        '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF,' +
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'YYYY-mm-DD HH24:MI:SS.FF3\') AS DTHORAFECHAMENTO, ' +
		'   TBV.NFE_INFNFE_IDE_NNF, ' +
        
        '   TBV.IDOPERADOR, ' +
        '   TBV.PROTNFE_INFPROT_CHNFE, ' +
        '   TBV.NFE_INFNFE_IDE_SERIE, ' +
        '   TBV.NFE_INFNFE_IDE_NNF, ' +
        '   TBV.PROTNFE_INFPROT_NPROT, ' +
        '   TBV.PROTNFE_INFPROT_XMOTIVO, ' +
        '   TBV.PROTNFE_INFPROT_CSTAT, ' +
        '   TBV.CUPOM_CODIGO_SAP, '+
        '   TBV.NUMERO_NF_SAP, '+
        '   TBE.CODPARCEIRO AS CLIENTE_CODIGO '+
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		'    INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbv.IDEMPRESA = tbe.IDEMPRESA '+
		' WHERE ' +
		'	1 = ? and tbv.STCONTINGENCIA = \'False\' and tbv.STCANCELADO = \'False\' and tbv.NUMERO_NF_SAP <> \'\' and  tbv.vrrecvoucher = 0 ';

	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
	if(idEmpresa){
	    query = query + ' And tbv.IDEMPRESA = \'' + idEmpresa + '\' ';
	}
	
	if(nrNFSap){
	    query = query + ' And TBV.NUMERO_NF_SAP = \'' + nrNFSap + '\' ';
	}
	
	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var venda = {
		       
				"filial_codigo": registro.IDEMPRESA,
				"cliente_codigo": registro.CLIENTE_CODIGO,
				"vendedor_codigo": 8,
				"pag_data_documento": registro.DTHORAFECHAMENTO,
				"pag_valor": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF),
				"cupom_codigo": registro.CUPOM_CODIGO_SAP,
				"numero_nf_sap": registro.NUMERO_NF_SAP,
				"condpag_codigo": 93,
				
			"pagamento_dinheiro": obterLinhasDoPagamento(registro.IDVENDA, 'DINHEIRO', registro.DTHORAFECHAMENTO),
			"pagamento_cartao": obterLinhasDoPagamento(registro.IDVENDA,'',registro.DTHORAFECHAMENTO)
		
		};

		data.push(venda);

	}

	response.data = data;

	return response;
}



$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;

	
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}