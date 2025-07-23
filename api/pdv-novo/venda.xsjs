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
                ' ifnull(TBVD.VDESC,0) as VDESC ' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDADETALHE TBVD' +
		'  WHERE  ' +
		'   TBVD.IDVENDA = ?  ' +
		'  ORDER BY TBVD.IDVENDADETALHE  ';

	var linhas = api.sqlQuery(query, idVenda);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"cupomlinha_posicao": det.NITEM,
				"item_codigo": det.CPROD,
				"vendedor_codigo": det.VENDEDOR_MATRICULA,
				"cupomlinha_preco_unit": det.VUNCOM,
				"cupomlinha_desconto_percentual": "não encontrado",
				"cupomlinha_total_final": det.VRTOTALLIQUIDO,
				"estoque_codigo": "não encontrado",
				"cupom_linha_unidade": det.UCOM,
				"cupomlinha_quantidade": det.QCOM,
				"cupomlinha_desconto_valor": det.VDESC
			
		};

		lines.push(docLine);
	}

	return lines;
}

function obterLinhasDoPagamento(idVenda) {

	var query = ' SELECT '+
                ' TBVP.DTVENCIMENTO, '+
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
				"cupom_parcela_valor": det.VALORRECEBIDO,
				"cupom_parcela_numero": det.NPARCELAS,
				"cupom_parcela_percentual": "não encontrado"
				
			
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
    var query = ' SELECT ' +
		'   tbv.IDVENDA,' +
		'   TBV.IDEMPRESA,' +
        '   TBV.DEST_CPF,' +
        
        '   TBV.IDCAIXAWEB,' +
        '   TBV.VRTOTALVENDA,' +
        '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,' +
        '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF,' +
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'YYYY-mm-DD HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
		'   TBV.NFE_INFNFE_IDE_NNF, ' +
        
        '   TBV.IDOPERADOR, ' +
        '   TBV.NFE_INFNFE_IDE_MOD, ' +
        '   TBV.NFE_INFNFE_IDE_SERIE, ' +
        '   TBV.NFE_INFNFE_IDE_NNF, ' +
        '   TBV.IDCAIXAWEB ' +
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		' WHERE ' +
		'	1 = ? and year(tbv.DTHORAFECHAMENTO) = \'2021\' and month(tbv.DTHORAFECHAMENTO) = \'01\' ';

	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
	if(idEmpresa){
	    query = query + ' And tbv.IDEMPRESA = \'' + idEmpresa + '\' ';
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
			"venda": {
				"IDVENDA": registro.IDVENDA,
				"filial_codigo": registro.IDEMPRESA,
				"cliente_codigo": registro.DEST_CPF,
				"cupom_tipo_documento": "não encontrado",
				"condpag_codigo": "não encontrado",
				"terminal_id": registro.IDCAIXAWEB,
				"cupom_total_antes_desconto": registro.VRTOTALVENDA,
				"cupom_desconto": registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
				"cupom_total_depois_desconto": registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF,
				"cupom_datahora": registro.DTHORAFECHAMENTO,
				"cupom_numero_cupom_fiscal": registro.NFE_INFNFE_IDE_NNF,
				"cupom_observacoes": "não encontrado",
				"vendedor_codigo": registro.IDOPERADOR,
				"ECF" : {
				    "paf_ecf_modelo": registro.NFE_INFNFE_IDE_MOD,
				    "paf_ecf_num_serie": registro.NFE_INFNFE_IDE_SERIE,
				    "cupom_numero_loja": registro.NFE_INFNFE_IDE_NNF,
				    "cupom_numero_caixa": registro.IDCAIXAWEB
				}

				
				
			},
			"cupom_linha": obterLinhasDoDetalhe(registro.IDVENDA),
			"cupom_parcela": obterLinhasDoPagamento(registro.IDVENDA),
			"adiantamento_devolucao":{
            "cupom_codigo":"não encontrado",
            "numero_adiantamento_sap":"não encontrado",
            "adi_valor": "não encontrado"
             }
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