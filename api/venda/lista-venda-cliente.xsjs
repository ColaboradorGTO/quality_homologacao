var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoDetalhe(idVenda) {

	var query = ' SELECT IDVENDADETALHE, IDVENDA, NITEM, CPROD, CEAN, XPROD, NCM, CFOP, UCOM, QCOM ' +
		' VUNCOM, VPROD, CEANTRIB, UTRIB, QTRIB, VUNTRIB,  INDTOT, ICMS_ORIG, ICMS_CST, ICMS_MODBC, ICMS_VBC, ' +
		' ICMS_PICMS, ICMS_VICMS, PIS_CST, PIS_VBC, PIS_PPIS, PIS_VPIS, COFINS_CST, COFINS_VBC, COFINS_PCOFINS, ' +
		' COFINS_VCOFINS, VENDEDOR_MATRICULA, VENDEDOR_NOME, VENDEDOR_CPF, tbp.NUCODBARRAS, QTD, VRTOTALLIQUIDO, STTROCA, STCANCELADO  ' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDADETALHE tbvd ' +
		'   INNER JOIN "VAR_DB_NAME".PRODUTO tbp ON tbp.IDPRODUTO = tbvd.CPROD  ' +
		'  WHERE  ' +
		'   IDVENDA = ?  ' +
		'  ORDER BY IDVENDADETALHE  ';

	var linhas = api.sqlQuery(query, idVenda);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"det": {
				"IDVENDADETALHE": det.IDVENDADETALHE,
				"IDVENDA": det.IDVENDA,
				"NITEM": det.NITEM,
				"CPROD": det.CPROD,
				"CEAN": det.CEAN,
				"XPROD": det.XPROD,
				"NCM": det.NCM,
				"CFOP": det.CFOP,
				"UCOM": det.UCOM,
				"QCOM": det.QCOM,
				"VUNCOM": det.VUNCOM,
				"VPROD": det.VPROD,
				"CEANTRIB": det.CEANTRIB,
				"UTRIB": det.UTRIB,
				"QTRIB": det.QTRIB,
				"VUNTRIB": det.VUNTRIB,
				"INDTOT": det.INDTOT,
				"ICMS_ORIG": det.ICMS_ORIG,
				"ICMS_CST": det.ICMS_CST,
				"ICMS_MODBC": det.ICMS_MODBC,
				"ICMS_VBC": det.ICMS_VBC,
				"ICMS_PICMS": det.ICMS_PICMS,
				"ICMS_VICMS": det.ICMS_VICMS,
				"PIS_CST": det.PIS_CST,
				"PIS_VBC": det.PIS_VBC,
				"PIS_PPIS": det.PIS_PPIS,
				"PIS_VPIS": det.PIS_VPIS,
				"COFINS_CST": det.COFINS_CST,
				"COFINS_VBC": det.COFINS_VBC,
				"COFINS_PCOFINS": det.COFINS_PCOFINS,
				"COFINS_VCOFINS": det.COFINS_VCOFINS,
				"VENDEDOR_MATRICULA": det.VENDEDOR_MATRICULA,
				"VENDEDOR_NOME": det.VENDEDOR_NOME,
				"VENDEDOR_CPF": det.VENDEDOR_CPF,
				"STCANCELADO": det.STCANCELADO,
            	"VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
        	    "QTD": det.QTD,
        	    "VRTOTALLIQUIDO":det.VRTOTALLIQUIDO,
        	    "NUCODBARRAS": det.NUCODBARRAS,
        	    "STTROCA": det.STTROCA
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterLinhasDoPagamento(idVenda) {

	var query = ' SELECT IDVENDAPAGAMENTO, IDVENDA, NITEM, TPAG, DSTIPOPAGAMENTO, VALORRECEBIDO, VALORDEDUZIDO, VALORLIQUIDO, ' +
		' DTPROCESSAMENTO, TO_VARCHAR(DTVENCIMENTO,\'DD-MM-YYYY\') AS DTVENCIMENTO, NPARCELAS, NOTEF, NOAUTORIZADOR, NOCARTAO, NUOPERACAO, NSUTEF, NSUAUTORIZADORA, NUAUTORIZACAO, CPF, NOME ' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDAPAGAMENTO  ' +
		'  WHERE  ' +
		'   IDVENDA = ?  ' +
		'  ORDER BY IDVENDAPAGAMENTO  ';

	var linhas = api.sqlQuery(query, idVenda);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"pag": {
				"IDVENDAPAGAMENTO": det.IDVENDAPAGAMENTO,
				"IDVENDA": det.IDVENDA,
				"NITEM": det.NITEM,
				"TPAG": det.TPAG,
				"DSTIPOPAGAMENTO": det.DSTIPOPAGAMENTO,
				"VALORRECEBIDO": det.VALORRECEBIDO,
				"VALORDEDUZIDO": det.VALORDEDUZIDO,
				"VALORLIQUIDO": det.VALORLIQUIDO,
				"DTPROCESSAMENTO": det.DTPROCESSAMENTO,
				"DTVENCIMENTO": det.DTVENCIMENTO,
				"NPARCELAS": det.NPARCELAS,
				"NOTEF": det.NOTEF,
				"NOAUTORIZADOR": det.NOAUTORIZADOR,
				"NOCARTAO": det.NOCARTAO,
				"NUOPERACAO": det.NUOPERACAO,
				"NSUTEF": det.NSUTEF,
				"NSUAUTORIZADORA": det.NSUAUTORIZADORA,
				"CPF": det.CPF,
				"NOME": det.NOME
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {

    var nnf = $.request.parameters.get("nnf");
    var serie = $.request.parameters.get("serie");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idSubgrupoEmpresarial = $.request.parameters.get("idSubgrupoEmpresarial");
    var cpfouIdVenda = $.request.parameters.get("cpfouIdVenda");
    var dtInicio = $.request.parameters.get("dtInicio");
    var dtFim = $.request.parameters.get("dtFim");
    
	var query = ' SELECT ' +
		'   tbv.IDVENDA,' +
		'   tbv."NFE_INFNFE_IDE_NNF",'+
		'   tbv.IDCAIXAWEB,' +
		'   tbc.DSCAIXA,' +
		'   tbv.IDOPERADOR,' +
		'   tbf.NOFUNCIONARIO,'+
		'   tbv.IDEMPRESA,' +
		'   tbe.NOFANTASIA,' +
		'   TO_VARCHAR(tbv.DTHORAABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAABERTURA, ' +
		'   tbv.VRRECDINHEIRO,' +
		'   tbv.VRRECCARTAO,' +
		'   tbv.VRRECCONVENIO,' +
		'   tbv.VRRECCHEQUE,' +
		'   tbv.VRRECPOS,' +
		'   tbv.VRRECVOUCHER,' +
		'   tbv.VRTOTALPAGO,' +
		'   tbv.VRTROCO,' +
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD/MM/YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
		'   tbv.DTHORAFECHAMENTO AS DTHORAFECHAMENTOFORMATEUA, ' +
		'   tbv.STATIVO,' +
		'   tbv.STCANCELADO,' +
		'   tbv.IDUSUARIOCANCELAMENTO,' +
		'   tbv.TXTMOTIVOCANCELAMENTO,' +
		'   tbv.STCONTINGENCIA,' +
		'   tbv.DTENVIOONTINGENCIA,' +
		'   tbv.DEST_CNPJ,'+
		'   IFNULL(tbd.NRCPF, tbv.DEST_CPF) as DEST_CPF,' +
		`   (SELECT FIRST_VALUE(DSNOMERAZAOSOCIAL ORDER BY IDCLIENTE) FROM "VAR_DB_NAME".CLIENTE WHERE NUCPFCNPJ = tbv.DEST_CNPJ OR NUCPFCNPJ = tbv.DEST_CPF OR NUCPFCNPJ = tbd.NRCPF) as DSNOMERAZAOSOCIAL,`+
		`   (SELECT FIRST_VALUE(DSAPELIDONOMEFANTASIA ORDER BY IDCLIENTE) FROM "VAR_DB_NAME".CLIENTE WHERE NUCPFCNPJ = tbv.DEST_CNPJ OR NUCPFCNPJ = tbv.DEST_CPF OR NUCPFCNPJ = tbd.NRCPF) AS DSAPELIDONOMEFANTASIA `+
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA' +
		'   INNER JOIN "VAR_DB_NAME".CAIXA tbc ON tbc.IDCAIXAWEB = tbv.IDCAIXAWEB' +
		'   INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbv.IDOPERADOR' +
		'   LEFT JOIN (SELECT NUCPFCNPJ FROM "VAR_DB_NAME".CLIENTE GROUP BY NUCPFCNPJ) tbcc ON tbcc.NUCPFCNPJ = tbv.DEST_CNPJ OR tbcc.NUCPFCNPJ = tbv.DEST_CPF' +
		'   LEFT JOIN "VAR_DB_NAME".DETLANCCONVENIO TBD ON tbv.IDVENDA = tbd.IDRESUMOVENDAWEB'+
		' WHERE ' +
		'	1 = ?' +
		' And tbv.STCANCELADO = \'False\' ';

	if (byId) {
		query = query + ' And tbv.IDVENDA = \'' + byId + '\'  ';
	}
    
    if (cpfouIdVenda){
	    query = `${query} And CONTAINS((tbv.DEST_CPF, tbv.DEST_CNPJ, tbd.NRCPF, tbv.IDVENDA), '${cpfouIdVenda}')`;
	}
	
	if(idEmpresa){
            query = `${query} AND tbv.IDEMPRESA = '${idEmpresa}' `;	
	}
    
   if(idSubgrupoEmpresarial){
        query = `${query} And tbe.IDSUBGRUPOEMPRESARIAL = '${idSubgrupoEmpresarial}' `;
    }
    
    if(nnf && serie){
	      query = query + ' And tbv.NFE_INFNFE_IDE_NNF = \'' + nnf + '\' And tbv.NFE_INFNFE_IDE_SERIE = \'' + serie + '\' ';
	}
	
	if(dtInicio && dtFim && !cpfouIdVenda && !nnf && !serie){
        query = `${query} AND tbv.DTHORAFECHAMENTO >= '${dtInicio} 00:00:00' AND tbv.DTHORAFECHAMENTO <= '${dtFim} 23:59:59' `;
    }
	
   query = query + ' ORDER BY tbv.DTHORAFECHAMENTO ASC ';
    
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
				"NRNOTA": registro.NFE_INFNFE_IDE_NNF,
				"IDCAIXAWEB": registro.IDCAIXAWEB,
				"DSCAIXA": registro.DSCAIXA,
				"IDOPERADOR": registro.IDOPERADOR,
			    "NOFUNCIONARIO": registro.NOFUNCIONARIO,
				"IDEMPRESA": registro.IDEMPRESA,
				"NOFANTASIA": registro.NOFANTASIA,
				"DTHORAABERTURA": registro.DTHORAABERTURA,
				"VRRECDINHEIRO": registro.VRRECDINHEIRO,
				"VRRECCARTAO": registro.VRRECCARTAO,
				"VRRECCONVENIO": registro.VRRECCONVENIO,
				"VRRECCHEQUE": registro.VRRECCHEQUE,
				"VRRECPOS": registro.VRRECPOS,
				"VRRECVOUCHER": registro.VRRECVOUCHER,
				"VRTOTALPAGO": registro.VRTOTALPAGO,
				"VRTROCO": registro.VRTROCO,
				"DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
				"DTHORAFECHAMENTOFORMATEUA": registro.DTHORAFECHAMENTOFORMATEUA,
				"STATIVO": registro.STATIVO,
				"STCANCELADO": registro.STCANCELADO,
				"IDUSUARIOCANCELAMENTO": registro.IDUSUARIOCANCELAMENTO,
				"TXTMOTIVOCANCELAMENTO": registro.TXTMOTIVOCANCELAMENTO,
				"STCONTINGENCIA": registro.STCONTINGENCIA,
				"DTENVIOONTINGENCIA": registro.DTENVIOONTINGENCIA,
				"DEST_CNPJ": registro.DEST_CNPJ,
				"DEST_CPF": registro.DEST_CPF,
				"DSNOMERAZAOSOCIAL": registro.DSNOMERAZAOSOCIAL,
				"DSAPELIDONOMEFANTASIA": registro.DSAPELIDONOMEFANTASIA
				
				
			},
			"detalhe": obterLinhasDoDetalhe(registro.IDVENDA),
			"pagamento": obterLinhasDoPagamento(registro.IDVENDA)
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
        default:
            break;
	
	}

} catch (e) {
$.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}