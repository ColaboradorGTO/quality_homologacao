var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}
function setDoubleOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDouble(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {
	var query = ' SELECT ' +
		   	' "DATA", ' +
        	' "ID_OE", ' +
        	' "LOJA", ' +
        	' "LOJA_ENT", ' +
        	' "MATR", ' +
        	' "MATRE", ' +
        	' "MATRM", ' +
        	' "PEDIDO", ' +
        	' "DATA_ENT", ' +
        	' "MOTIVO_E", ' +
        	' "DATA_MON", ' +
        	' "MOTIVO_M", ' +
        	' "CGC", ' +
        	' "INS", ' +
        	' "CLIENTE", ' +
        	' "ENDE", ' +
        	' "BAIRRO", ' +
        	' "DDD", ' +
        	' "FONE", ' +
        	' "CIDADE", ' +
        	' "UF", ' +
        	' "PGTOS", ' +
        	' "OM", ' +
        	' "OBS", ' +
        	' "TOTAL", ' +
        	' "TOTAL_E", ' +
        	' "TOTAL_C", ' +
        	' "LBRUTO", ' +
        	' "LBRU_E", ' +
        	' "LBRU_C", ' +
        	' "VALOR_CON", ' +
        	' "VCON_E", ' +
        	' "VCON_C", ' +
        	' "RENTABILIDADE", ' +
        	' "REN_E", ' +
        	' "REN_C", ' +
        	' "LFIN", ' +
        	' "VDICM", ' +
        	' "CRE", ' +
        	' "RA", ' +
        	' "PRAZMED", ' +
        	' "ENTREGUE", ' +
        	' "MONTADO", ' +
        	' "TIPO", ' +
        	' "LOCAL", ' +
        	' "IMP", ' +
        	' "IMPPEND", ' +
        	' "CANC", ' +
        	' "V_DATA", ' +
        	' "V_OE", ' +
        	' "SERVICO", ' +
        	' "FRETE", ' +
        	' "DESCONTO", ' +
        	' "VCON_S", ' +
        	' "CUPOMFISCAL", ' +
        	' "CODCLI", ' +
        	' "ENTREGAPERIODO", ' +
        	' "ACRESCIMOFINANCEIRO", ' +
        	' "STATUS", ' +
        	' "DATAFINAL_MON", ' +
        	' "TOTALIPI", ' +
        	' "MATRCAIXA", ' +
        	' "V_DATA100", ' +
        	' "V_OE100", ' +
        	' "NUMERODOECF", ' +
        	' "COMPILACAO", ' +
        	' "TROCO", ' +
        	' "HORA", ' +
        	' "TERMINAL", ' +
        	' "RETENCAO", ' +
        	' "VALORTOTALAPROXIMPOSTOIBPT", ' +
        	' "DIG", ' +
        	' "AUTOR", ' +
        	' "USUARIOQUECONFERIU", ' +
        	' "USUARIOQUEEMITIUSOBRAEFALTA", ' +
        	' "VOLUME", ' +
        	' "PAF_CCF_CVC_CBP", ' +
        	' "PAF_NUMEROUSUARIO", ' +
        	' "PAF_MODELOECF", ' +
        	' "PAF_MARCAECF", ' +
        	' "PAF_NUMEROSERIE", ' +
        	' "PAF_IMPRIMIRCUPOMFISCAL", ' +
        	' "PAF_VERIFICACAOCONSISTENCIA", ' +
        	' "NOTAFISCAL", ' +
        	' "DATADACONFERENCIA", ' +
        	' "DATADAAUTORIZACAODORECEBIMENTO", ' +
        	' "DATAHORADOENVIO", ' +
        	' "NFCE", ' +
        	' "LATITUDE", ' +
        	' "LONGITUDE", ' +
        	' "NFECHAVE", ' +
        	' "NFCECHAVE", ' +
        	' "ACRESCIMO", ' +
        	' "XPED", ' +
        	' "ECOMMERCE", ' +
        	' "ENVIADO_ECOMMERCE", ' +
        	' "CODIGODORASTREIODAENTREGA", ' +
        	' "COMISSAOVENDEDOR", ' +
        	' "TIPODESCONTO", ' +
        	' "REGISTROALTERADOENVIARSATONLINE", ' +
        	' "TOTALICMSST", ' +
        	' "TOTALICMSDESONERADO", ' +
        	' "TOTALDOPEDIDO", ' +
        	' "SOLICITADOAUTORIZACAO", ' +
        	' "MOTIVODASOLICITACAODEAUTORIZ" ' +
        ' FROM "QUALITY_CONC_HML"."OE"  ' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And ID_OE = \'' + byId + '\' ';
	}
	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	api.responseWithQuery(query, request, 1);
}


function fnHandlePost() {
	var conn = $.db.getConnection();
 	var query = 'INSERT INTO "VAR_DB_NAME"."OE" ' +
		" ( " +
		' "DATA", ' +
    	' "ID_OE", ' +
    	' "LOJA", ' +
    	' "LOJA_ENT", ' +
    	' "MATR", ' +
    	' "MATRE", ' +
    	' "MATRM", ' +
    	' "PEDIDO", ' +
    	' "DATA_ENT", ' +
    	' "MOTIVO_E", ' +
    	' "DATA_MON", ' +
    	' "MOTIVO_M", ' +
    	' "CGC", ' +
    	' "INS", ' +
    	' "CLIENTE", ' +
    	' "ENDE", ' +
    	' "BAIRRO", ' +
    	' "DDD", ' +
    	' "FONE", ' +
    	' "CIDADE", ' +
    	' "UF", ' +
    	' "PGTOS", ' +
    	' "OM", ' +
    	' "OBS", ' +
    	' "TOTAL", ' +
    	' "TOTAL_E", ' +
    	' "TOTAL_C", ' +
    	' "LBRUTO", ' +
    	' "LBRU_E", ' +
    	' "LBRU_C", ' +
    	' "VALOR_CON", ' +
    	' "VCON_E", ' +
    	' "VCON_C", ' +
    	' "RENTABILIDADE", ' +
    	' "REN_E", ' +
    	' "REN_C", ' +
    	' "LFIN", ' +
    	' "VDICM", ' +
    	' "CRE", ' +
    	' "RA", ' +
        ' "PRAZMED", ' +
    	' "ENTREGUE", ' +
    	' "MONTADO", ' +
    	' "TIPO", ' +
    	' "LOCAL", ' +
    	' "IMP", ' +
    	' "IMPPEND", ' +
    	' "CANC", ' +
    	' "V_DATA", ' +
    	' "V_OE", ' +
    	' "SERVICO", ' +
    	' "FRETE", ' +
    	' "DESCONTO", ' +
    	' "VCON_S", ' +
    	' "CUPOMFISCAL", ' +
    	' "CODCLI", ' +
    	' "ENTREGAPERIODO", ' +
    	' "ACRESCIMOFINANCEIRO", ' +
    	' "STATUS", ' +
    	' "DATAFINAL_MON", ' +
    	' "TOTALIPI", ' +
    	' "MATRCAIXA", ' +
    	' "V_DATA100", ' +
    	' "V_OE100", ' +
    	' "NUMERODOECF", ' +
    	' "COMPILACAO", ' +
    	' "TROCO", ' +
    	' "HORA", ' +
    	' "TERMINAL", ' +
    	' "RETENCAO", ' +
    	' "VALORTOTALAPROXIMPOSTOIBPT", ' +
    	' "DIG", ' +
    	' "AUTOR", ' +
    	' "USUARIOQUECONFERIU", ' +
    	' "USUARIOQUEEMITIUSOBRAEFALTA", ' +
    	' "VOLUME", ' +
    	' "PAF_CCF_CVC_CBP", ' +
    	' "PAF_NUMEROUSUARIO", ' +
    	' "PAF_MODELOECF", ' +
    	' "PAF_MARCAECF", ' +
    	' "PAF_NUMEROSERIE", ' +
    	' "PAF_IMPRIMIRCUPOMFISCAL", ' +
    	' "PAF_VERIFICACAOCONSISTENCIA", ' +
    	' "NOTAFISCAL", ' +
    	' "DATADACONFERENCIA", ' +
    	' "DATADAAUTORIZACAODORECEBIMENTO", ' +
    	' "DATAHORADOENVIO", ' +
    	' "NFCE", ' +
    	' "LATITUDE", ' +
    	' "LONGITUDE", ' +
    	' "NFECHAVE", ' +
    	' "NFCECHAVE", ' +
    	' "ACRESCIMO", ' +
    	' "XPED", ' +
    	' "ECOMMERCE", ' +
    	' "ENVIADO_ECOMMERCE", ' +
    	' "CODIGODORASTREIODAENTREGA", ' +
    	' "COMISSAOVENDEDOR", ' +
    	' "TIPODESCONTO", ' +
    	' "REGISTROALTERADOENVIARSATONLINE", ' +
    	' "TOTALICMSST", ' +
    	' "TOTALICMSDESONERADO", ' +
    	' "TOTALDOPEDIDO", ' +
    	' "SOLICITADOAUTORIZACAO", ' +
    	' "MOTIVODASOLICITACAODEAUTORIZ", ' +
    	' "SUBGRUPOEMPRESARIAL" ' +
        ' ) ' +
		' VALUES( ' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?,?,?,?,?,' +
		    '?,?,?,?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
   
	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setDate(1, registro.DATA);
		setIntOrNull(pStmt,2, registro.ID_OE);
		setIntOrNull(pStmt,3, registro.LOJA);
		setIntOrNull(pStmt,4, registro.LOJA_ENT);
		setIntOrNull(pStmt,5, registro.MATR);
		setIntOrNull(pStmt,6, registro.MATRE);
		setIntOrNull(pStmt,7, registro.MATRM);
		setIntOrNull(pStmt,8, registro.PEDIDO);
		pStmt.setDate(9, registro.DATA_ENT);
		pStmt.setString(10, registro.MOTIVO_E);
		
		pStmt.setDate(11, registro.DATA_MON);
		pStmt.setString(12, registro.MOTIVO_M);
		pStmt.setString(13, registro.CGC);
		pStmt.setString(14, registro.INS);
		pStmt.setString(15, registro.CLIENTE);
		pStmt.setString(16, registro.ENDE);
		pStmt.setString(17, registro.BAIRRO);
		pStmt.setString(18, registro.DDD);
		pStmt.setString(19, registro.FONE);
		pStmt.setString(20, registro.CIDADE);
		
		pStmt.setString(21, registro.UF);
		setIntOrNull(pStmt,22, registro.PGTOS);
		setDoubleOrNull(pStmt,23, registro.OM);
		pStmt.setString(24, registro.OBS);
		setDoubleOrNull(pStmt,25, registro.TOTAL);
		setDoubleOrNull(pStmt,26, registro.TOTAL_E);
		setDoubleOrNull(pStmt,27, registro.TOTAL_C);
		setDoubleOrNull(pStmt,28, registro.LBRUTO);
		setDoubleOrNull(pStmt,29, registro.LBRU_E);
		setDoubleOrNull(pStmt,30, registro.LBRU_C);
		
	    setDoubleOrNull(pStmt,31, registro.VALOR_CON);
		setDoubleOrNull(pStmt,32, registro.VCON_E);
		setDoubleOrNull(pStmt,33, registro.VCON_C);
		setDoubleOrNull(pStmt,34, registro.RENTABILIDADE);
		setDoubleOrNull(pStmt,35, registro.REN_E);
		setDoubleOrNull(pStmt,36, registro.REN_C);
		setDoubleOrNull(pStmt,37, registro.LFIN);
		setDoubleOrNull(pStmt,38, registro.VDICM);
		setDoubleOrNull(pStmt,39, registro.CRE);
		setDoubleOrNull(pStmt,40, registro.RA);
		
		setDoubleOrNull(pStmt,41, registro.PRAZMED);
		pStmt.setString(42, registro.ENTREGUE);
		pStmt.setString(43, registro.MONTADO);
		pStmt.setString(44, registro.TIPO);
		pStmt.setString(45, registro.LOCAL);
		setIntOrNull(pStmt,46, registro.IMP);
		setIntOrNull(pStmt,47, registro.IMPPEND);
		pStmt.setString(48, registro.CANC);
		pStmt.setDate(49, registro.V_DATA);
		setIntOrNull(pStmt,50, registro.V_OE);
		
		setDoubleOrNull(pStmt,51, registro.SERVICO);
		setDoubleOrNull(pStmt,52, registro.FRETE);
		setDoubleOrNull(pStmt,53, registro.DESCONTO);
		setDoubleOrNull(pStmt,54, registro.VCON_S);
		pStmt.setString(55, registro.CUPOMFISCAL);
		setIntOrNull(pStmt,56, registro.CODCLI);
		setIntOrNull(pStmt,57, registro.ENTREGAPERIODO);
		setDoubleOrNull(pStmt,58, registro.ACRESCIMOFINANCEIRO);
		setIntOrNull(pStmt,59, registro.STATUS);
		pStmt.setDate(60, registro.DATAFINAL_MON);
		
		setDoubleOrNull(pStmt,61, registro.TOTALIPI);
		pStmt.setString(62, registro.MATRCAIXA);
		pStmt.setDate(63, registro.V_DATA100);
		setIntOrNull(pStmt,64, registro.V_OE100);
		setIntOrNull(pStmt,65, registro.NUMERODOECF);
		pStmt.setString(66, registro.COMPILACAO);
		setDoubleOrNull(pStmt,67, registro.TROCO);
		pStmt.setDate(68, registro.HORA);
		setIntOrNull(pStmt,69, registro.TERMINAL);
		setDoubleOrNull(pStmt,70, registro.RETENCAO);
		
		setDoubleOrNull(pStmt,71, registro.VALORTOTALAPROXIMPOSTOIBPT);
		pStmt.setString(72, registro.DIG);
		pStmt.setString(73, registro.AUTOR);
		pStmt.setString(74, registro.USUARIOQUECONFERIU);
		pStmt.setString(75, registro.USUARIOQUEEMITIUSOBRAEFALTA);
		setIntOrNull(pStmt,76, registro.VOLUME);
		pStmt.setString(77, registro.PAF_CCF_CVC_CBP);
		pStmt.setString(78, registro.PAF_NUMEROUSUARIO);
		pStmt.setString(79, registro.PAF_MODELOECF);
		pStmt.setString(80, registro.PAF_MARCAECF);
		
		pStmt.setString(81, registro.PAF_NUMEROSERIE);
		pStmt.setString(82, registro.PAF_IMPRIMIRCUPOMFISCAL);
		setIntOrNull(pStmt,83, registro.PAF_VERIFICACAOCONSISTENCIA);
		setIntOrNull(pStmt,84, registro.NOTAFISCAL);
		pStmt.setDate(85, registro.DATADACONFERENCIA);
		pStmt.setDate(86, registro.DATADAAUTORIZACAODORECEBIMENTO);
		pStmt.setDate(87, registro.DATAHORADOENVIO);
		setIntOrNull(pStmt,88, registro.NFCE);
		setDoubleOrNull(pStmt,89, registro.LATITUDE);
		setDoubleOrNull(pStmt,90, registro.LONGITUDE);
		
		pStmt.setString(91, registro.NFECHAVE);
		pStmt.setString(92, registro.NFCECHAVE);
		setDoubleOrNull(pStmt,93, registro.ACRESCIMO);
		pStmt.setString(94, registro.XPED);
		pStmt.setString(95, registro.ECOMMERCE);
		pStmt.setString(96, registro.ENVIADO_ECOMMERCE);
		pStmt.setString(97, registro.CODIGODORASTREIODAENTREGA);
		setDoubleOrNull(pStmt,98, registro.COMISSAOVENDEDOR);
		setIntOrNull(pStmt,99, registro.TIPODESCONTO);
		pStmt.setString(100, registro.REGISTROALTERADOENVIARSATONLINE);
		
		setDoubleOrNull(pStmt,101, registro.TOTALICMSST);
		setDoubleOrNull(pStmt,102, registro.TOTALICMSDESONERADO);
		setDoubleOrNull(pStmt,103, registro.TOTALDOPEDIDO);
		pStmt.setString(104, registro.SOLICITADOAUTORIZACAO);
		pStmt.setString(105, registro.MOTIVODASOLICITACAODEAUTORIZ);
		pStmt.setString(106, registro.SUBGRUPOEMPRESARIAL);
			

		pStmt.execute();
	}

	pStmt.close();

	conn.commit();

	return {
		"msg": "Inclusão realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			fnHandleGet(id);
			break;

			//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		default:
			break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}