var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoDetalhe(idVenda) {

	var query = ' SELECT '+
	            ' TBVD.NITEM, '+
                ' TBVD.CPROD, '+
                ' TBVD.VENDEDOR_MATRICULA, '+
                ' TBVD.VUNCOM, '+
                ' TBVD.VRTOTALLIQUIDO, '+
                ' TBVD.UCOM, '+
                ' TBVD.QCOM, '+
                ' TBE.ESTOQUECODIGO AS ESTOQUE_CODIGO, '+ 
                ' ifnull(TBVD.VDESC,0) as VDESC ' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDADETALHE TBVD' +
		'    INNER JOIN "VAR_DB_NAME".VENDA TBV ON TBV.IDVENDA = TBVD.IDVENDA '+
		'    INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON TBV.IDEMPRESA = TBE.IDEMPRESA '+
		'  WHERE  ' +
		'   TBVD.IDVENDA = ?  and TBVD.STCANCELADO = \'False\' and TBVD.VUNCOM > 0' +
		'  ORDER BY TBVD.IDVENDADETALHE  ';

	var linhas = api.sqlQuery(query, idVenda);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"cupomlinha_posicao": i+1,
				"item_codigo": det.CPROD,
				"vendedor_codigo": 8,
				"cupomlinha_preco_unit": parseFloat(det.VUNCOM,2),
				"cupomlinha_desconto_percentual": 0,
				"cupomlinha_total_final": parseFloat(det.VRTOTALLIQUIDO),
				"estoque_codigo": det.ESTOQUE_CODIGO,
				"cupom_linha_unidade": det.UCOM.substring(0,2),
				"cupomlinha_quantidade": parseInt(det.QCOM),
				"cupomlinha_desconto_valor": parseFloat(det.VDESC,2)
			
		};

		lines.push(docLine);
	}

	return lines;
}

function obterLinhasDoPagamento(idVenda) {

	var query = ' SELECT '+
                ' TO_VARCHAR(TBVP.DTVENCIMENTO,\'YYYY-mm-DD HH24:MI:SS.FF3\') AS DTVENCIMENTO, ' +
                ' TBVP.VALORRECEBIDO, '+
                ' TBVP.NPARCELAS '+
               
		' FROM  ' +
		'   "VAR_DB_NAME".VENDAPAGAMENTO TBVP ' +
		'  WHERE  ' +
		'   TBVP.IDVENDA = ?  ' +
		'  ORDER BY TBVP.IDVENDAPAGAMENTO  ';

	var linhas = api.sqlQuery(query, idVenda);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			    "cupom_parcela_data_vencimento": det.DTVENCIMENTO,
				"cupom_parcela_valor": parseFloat(det.VALORRECEBIDO),
				"cupom_parcela_numero": det.NPARCELAS,
				"cupom_parcela_percentual": "não encontrado"
				
			
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInic = $.request.parameters.get("dataPesquisaInicial");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    var query = ' SELECT ' +
		'   tbv.IDVENDA,' +
		'   TBV.IDEMPRESA,' +
        '   TBV.DEST_CPF,' +
        '   TBE.CODPARCEIRO AS CLIENTE_CODIGO, '+
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
        '   TBV.PROTNFE_INFPROT_CSTAT ' +
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		'    INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbv.IDEMPRESA = tbe.IDEMPRESA '+
		' WHERE ' +
		'	1 = ? and year(tbv.DTHORAFECHAMENTO) >= \'2021\' and month(tbv.DTHORAFECHAMENTO) >= \'01\' and tbv.STCONTINGENCIA = \'False\' and tbv.STCANCELADO = \'False\' ';

	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
	if(idEmpresa){
	    query = query + ' And tbv.IDEMPRESA = \'' + idEmpresa + '\' ';
	}
	
	if(dataPesquisaInic && dataPesquisaFim) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInic + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        }
	query = query + ' ORDER BY  tbv.DTHORAFECHAMENTO ';
	
	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];
		var terminal=0;
		if(registro.IDCAIXAWEB > 999){
		    terminal = registro.IDEMPRESA;
		}else{
		    terminal = registro.IDCAIXAWEB;
		}

		var venda = {
		        "IDVENDA": registro.IDVENDA,
				"filial_codigo": registro.IDEMPRESA,
				"cliente_codigo": registro.CLIENTE_CODIGO,
				"cupom_tipo_documento": 4,
				"condpag_codigo": 93,
				"terminal_id": String(terminal),
				"cupom_total_antes_desconto": parseFloat(registro.VRTOTALVENDA),
				"cupom_desconto": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),
				"cupom_total_depois_desconto": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF),
				"cupom_datahora": registro.DTHORAFECHAMENTO,
				"cupom_numero_cupom_fiscal": String(registro.NFE_INFNFE_IDE_NNF),
				"cupom_observacoes": "Intgração PDV Quality",
				"vendedor_codigo": 8,
				"NFCe_SAT" : {
				    "cupom_chave_acesso_nfce": registro.PROTNFE_INFPROT_CHNFE,
				    "cupom_numero_nfce": parseInt(registro.NFE_INFNFE_IDE_NNF),
				    "cupom_numero_serie_nfce": parseInt(registro.NFE_INFNFE_IDE_SERIE),
				    "cupom_protocolo_autorizacao_nfce": registro.PROTNFE_INFPROT_NPROT,
				    "cupom_descricao_situacao_nota_nfce": registro.PROTNFE_INFPROT_XMOTIVO,
				    "cupom_codigo_situacao_nota_nfce": parseInt(registro.PROTNFE_INFPROT_CSTAT)
				},

			"cupom_linha": obterLinhasDoDetalhe(registro.IDVENDA),
			"cupom_parcela":
			  [
                {
                    "cupom_parcela_data_vencimento": registro.DTHORAFECHAMENTO,
                    "cupom_parcela_valor": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF),
                    "cupom_parcela_numero": 1,
                    "cupom_parcela_percentual": 100
                }
            ]
			/*"cupom_parcela": obterLinhasDoPagamento(registro.IDVENDA)*/
		
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