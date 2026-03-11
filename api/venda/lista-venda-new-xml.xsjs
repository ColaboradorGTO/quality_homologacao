var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoDetalhe(idVenda) {

    	var query = `SELECT IDVENDADETALHE, IDVENDA, NITEM, CPROD, CEAN, XPROD, NCM, CFOP, UCOM, QCOM,
		VUNCOM, VPROD, VDESC, CEANTRIB, UTRIB, QTRIB, VUNTRIB, INDTOT, ICMS_ORIG, ICMS_CST, ICMS_MODBC, ICMS_VBC,
		ICMS_PICMS, ICMS_VICMS, PIS_CST, PIS_VBC, PIS_PPIS, PIS_VPIS, COFINS_CST, COFINS_VBC, COFINS_PCOFINS,
		COFINS_VCOFINS, VENDEDOR_MATRICULA, VENDEDOR_NOME, VENDEDOR_CPF, tbp.NUCODBARRAS, QTD, VRTOTALLIQUIDO, STTROCA, STCANCELADO
		FROM "VAR_DB_NAME".VENDADETALHE tbvd
		INNER JOIN "VAR_DB_NAME".PRODUTO tbp ON tbp.IDPRODUTO = tbvd.CPROD
		WHERE IDVENDA = ?
		ORDER BY IDVENDADETALHE`;

	var linhas = api.sqlQuery(query, idVenda);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"det": {
				"IDVENDADETALHE": det.IDVENDADETALHE,
				"IDVENDA": det.IDVENDA,
				"CPROD": det.CPROD,
				"CEAN": det.CEAN,
				"XPROD": det.XPROD,
				"NCM": det.NCM,
				"CFOP": det.CFOP,
				"UCOM": det.UCOM,
				"QCOM": det.QCOM,
				"VUNCOM": det.VUNCOM,
				"VDESC": det.VDESC,
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
				"ICMS_VICMSDESON": det.ICMS_VICMSDESON,
				"VFRETE": det.VFRETE,
				"NFE_INFNFE_INFADIC_INFCPL": det.NFE_INFNFE_INFADIC_INFCPL,
				"NITEM": det.NITEM,
				"NUCODBARRAS": det.NUCODBARRAS,
                "VPROD": det.VPROD,
                "QTD": det.QTD,
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterLinhasDoPagamento(idVenda) {

    var query = `SELECT IDVENDAPAGAMENTO, IDVENDA, NITEM, TPAG, DSTIPOPAGAMENTO, VALORRECEBIDO, VALORDEDUZIDO, VALORLIQUIDO,
		DTPROCESSAMENTO, TO_VARCHAR(DTVENCIMENTO,'DD-MM-YYYY') AS DTVENCIMENTO, NPARCELAS, NOTEF, NOAUTORIZADOR, NOCARTAO, NUOPERACAO, NSUTEF, NSUAUTORIZADORA, NUAUTORIZACAO, CPF, NOME
		FROM "VAR_DB_NAME".VENDAPAGAMENTO
		WHERE IDVENDA = ?
		ORDER BY IDVENDAPAGAMENTO`;

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
				"NSUAUTORIZADORA": det.NSUAUTORIZADORA
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterLinhasDaConfuguracao(idEmpresa) {

	var query = `
        SELECT 
            IDCONFIGURACAO, 
            IDEMPRESA, 
            UF, 
            TPFORMAEMISSAO, 
            TPMODELODOCFISCAL, 
            TPVERSAOMODFISCAL, 
            TPEMISSAO, 
            TPAMBIENTE, 
            DSCRT, 
            IDTOKEN, 
            TOKENCSC, 
            CNPJ_AUTXML
		FROM "VAR_DB_NAME".CONFIGURACAO
		WHERE IDEMPRESA = ?
		ORDER BY IDCONFIGURACAO`;

	var linhas = api.sqlQuery(query, idEmpresa);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"config": {
				"IDCONFIGURACAO": det.IDCONFIGURACAO,
                "IDEMPRESA": det.IDEMPRESA,
                "UF": det.UF,
                "TPFORMAEMISSAO": det.TPFORMAEMISSAO,
                "TPMODELODOCFISCAL": det.TPMODELODOCFISCAL,
                "TPVERSAOMODFISCAL": det.TPVERSAOMODFISCAL,
                "TPEMISSAO": det.TPEMISSAO,
                "TPAMBIENTE": det.TPAMBIENTE,
                "DSCRT": det.DSCRT,
                "IDTOKEN": det.IDTOKEN,
                "TOKENCSC": det.TOKENCSC,
                "CNPJ_AUTXML": det.CNPJ_AUTXML
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
    
    var query = `
        SELECT 
            tbv.IDVENDA,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_UF,
            tbv.NFE_INFNFE_IDE_CNF,
            tbv.NFE_INFNFE_IDE_NATOP,
            tbv.NFE_INFNFE_IDE_MOD,
            tbv.NFE_INFNFE_IDE_SERIE,
            tbv.NFE_INFNFE_IDE_NNF,
            tbv.NFE_INFNFE_IDE_DHEMI,
            tbv.NFE_INFNFE_ID,
            tbv.NFE_INFNFE_IDE_TPNF,
            tbv.NFE_INFNFE_IDE_IDDEST,
            tbv.NFE_INFNFE_IDE_CMUNFG,
            tbv.NFE_INFNFE_IDE_TPIMP,
            tbv.NFE_INFNFE_IDE_TPEMIS,
            tbv.NFE_INFNFE_IDE_CDV,
            tbv.NFE_INFNFE_IDE_TPAMB,
            tbv.NFE_INFNFE_IDE_FINNFE,
            tbv.NFE_INFNFE_IDE_INDFINAL,
            tbv.NFE_INFNFE_IDE_INDPRES,
            tbv.NFE_INFNFE_EMIT_CNPJ,
            tbv.NFE_INFNFE_AUTXML_CNPJ,
            tbv.NFE_INFNFE_EMIT_NOME,
            tbv.NFE_INFNFE_EMIT_FANT,
            tbv.PROTNFE_INFPROT_CSTAT,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_CEP,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_XPAIS,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_CPAIS,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_FONE,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_CMUN,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_XMUN,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_NRO,
            tbv.NFE_INFNFE_EMIT_ENDEREMIT_XLGR,
            tbv.NFE_INFNFE_INFADIC_INFCPL,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO,
            tbv.NFE_INFNFE_TRANSP_MODFRETE,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VIPI,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VII,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VSEG,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VFCP,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VBCST,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VST,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VFCPST,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VFRETE,
            tbv.NFE_INFNFESUPL_QRCODE,
            tbv.NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON,
            tbv.NFE_INFNFE_IDE_PROCEMI,
            tbv.NFE_INFNFESUPL_URLCHAVE,
            tbv.NFE_INFNFE_EMIT_IE,
            tbv.NFE_INFNFE_EMIT_CRT,
            tbv.PROTNFE_INFPROT_XMOTIVO,
            tbv.PROTNFE_INFPROT_ID,
            tbv.PROTNFE_INFPROT_DIGVAL,
            tbv.IDEMPRESA,
            TO_VARCHAR(tbv.DTHORAABERTURA, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAABERTURA,
            tbv.VRRECDINHEIRO,
            tbv.VRRECCARTAO,
            tbv.VRRECCONVENIO,
            tbv.VRRECCHEQUE,
            tbv.VRRECPOS,
            tbv.VRRECVOUCHER,
            tbv.VRTOTALPAGO,
            tbv.VRTROCO,
            TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD/MM/YYYY HH24:MI:SS') AS DTHORAFECHAMENTO,
            tbv.DTHORAFECHAMENTO AS DTHORAFECHAMENTOFORMATEUA,
            tbv.STATIVO,
            tbv.STCANCELADO,
            tbv.IDUSUARIOCANCELAMENTO,
            tbv.TXTMOTIVOCANCELAMENTO,
            tbv.STCONTINGENCIA,
            tbv.DTENVIOONTINGENCIA,
            tbv.DEST_CPF
        FROM "VAR_DB_NAME".VENDA tbv
        WHERE 1 = ?
        AND tbv.STCANCELADO = 'False'
    `;

    if (byId) {
        query = query + ' AND tbv.IDVENDA = \'' + byId + '\'  ';
    }
    
    if (cpfouIdVenda){
        query = `${query} AND CONTAINS((tbv.DEST_CPF, tbv.DEST_CNPJ, tbv.IDVENDA), '${cpfouIdVenda}')`;
    }
    
    if(idEmpresa){
        query = `${query} AND tbv.IDEMPRESA = '${idEmpresa}' `;	
    }
    
    if(idSubgrupoEmpresarial){
        query = `${query} AND tbv.IDSUBGRUPOEMPRESARIAL = '${idSubgrupoEmpresarial}' `;
    }
    
    if(nnf && serie){
        query = query + ' AND tbv.NFE_INFNFE_IDE_NNF = \'' + nnf + '\' AND tbv.NFE_INFNFE_IDE_SERIE = \'' + serie + '\' ';
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
                "NFE_INFNFE_EMIT_ENDEREMIT_UF": registro.NFE_INFNFE_EMIT_ENDEREMIT_UF,
                "NFE_INFNFE_IDE_CNF": registro.NFE_INFNFE_IDE_CNF,
                "NFE_INFNFE_IDE_NATOP": registro.NFE_INFNFE_IDE_NATOP,
                "NFE_INFNFE_IDE_MOD": registro.NFE_INFNFE_IDE_MOD,
                "NFE_INFNFE_IDE_SERIE": registro.NFE_INFNFE_IDE_SERIE,
                "NFE_INFNFE_IDE_NNF": registro.NFE_INFNFE_IDE_NNF,
                "NFE_INFNFE_IDE_DHEMI": registro.NFE_INFNFE_IDE_DHEMI,
                "CHAVE": registro.NFE_INFNFE_ID,
                "NFE_INFNFE_IDE_TPNF": registro.NFE_INFNFE_IDE_TPNF,
                "NFE_INFNFE_IDDEST": registro.NFE_INFNFE_IDE_IDDEST,
                "NFE_INFNFE_IDE_CMUNFG": registro.NFE_INFNFE_IDE_CMUNFG,
                "NFE_INFNFE_IDE_TPIMP": registro.NFE_INFNFE_IDE_TPIMP,
                "NFE_INFNFE_IDE_TPEMIS": registro.NFE_INFNFE_IDE_TPEMIS,
                "NFE_INFNFE_IDE_CDV": registro.NFE_INFNFE_IDE_CDV,
                "NFE_INFNFE_IDE_TPAMB": registro.NFE_INFNFE_IDE_TPAMB,
                "NFE_INFNFE_IDE_FINNFE": registro.NFE_INFNFE_IDE_FINNFE,
                "NFE_INFNFE_IDE_INDFINAL": registro.NFE_INFNFE_IDE_INDFINAL,
                "NFE_INFNFE_IDE_INDPRES": registro.NFE_INFNFE_IDE_INDPRES,
                "NFE_INFNFE_EMIT_CNPJ": registro.NFE_INFNFE_EMIT_CNPJ,
                "NFE_INFNFE_AUTXML_CNPJ": registro.NFE_INFNFE_AUTXML_CNPJ,
                "NFE_INFNFE_EMIT_NOME": registro.NFE_INFNFE_EMIT_NOME,
                "NFE_INFNFE_EMIT_FANT": registro.NFE_INFNFE_EMIT_FANT,
                "PROTNFE_INFPROT_CSTAT": registro.PROTNFE_INFPROT_CSTAT,
                "NFE_INFNFE_EMIT_ENDEREMIT_CEP": registro.NFE_INFNFE_EMIT_ENDEREMIT_CEP,
                "NFE_INFNFE_EMIT_ENDEREMIT_XPAIS": registro.NFE_INFNFE_EMIT_ENDEREMIT_XPAIS,
                "NFE_INFNFE_EMIT_ENDEREMIT_CPAIS": registro.NFE_INFNFE_EMIT_ENDEREMIT_CPAIS,
                "NFE_INFNFE_EMIT_ENDEREMIT_FONE": registro.NFE_INFNFE_EMIT_ENDEREMIT_FONE,
                "NFE_INFNFE_EMIT_ENDEREMIT_CMUN": registro.NFE_INFNFE_EMIT_ENDEREMIT_CMUN,
                "NFE_INFNFE_EMIT_ENDEREMIT_XMUN": registro.NFE_INFNFE_EMIT_ENDEREMIT_XMUN,
                "NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO": registro.NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO,
                "NFE_INFNFE_EMIT_ENDEREMIT_NRO": registro.NFE_INFNFE_EMIT_ENDEREMIT_NRO,
                "NFE_INFNFE_EMIT_ENDEREMIT_XLGR": registro.NFE_INFNFE_EMIT_ENDEREMIT_XLGR,
                "NFE_INFNFE_EMIT_IE": registro.NFE_INFNFE_EMIT_IE,
                "NFE_INFNFE_EMIT_CRT": registro.NFE_INFNFE_EMIT_CRT,
                "NFE_INFNFE_INFADIC_INFCPL": registro.NFE_INFNFE_INFADIC_INFCPL,
                "NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO": registro.NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO,
                "NFE_INFNFE_TRANSP_MODFRETE": registro.NFE_INFNFE_TRANSP_MODFRETE,
                "NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL": registro.NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL,
                "NFE_INFNFE_TOTAL_ICMSTOT_VIPI": registro.NFE_INFNFE_TOTAL_ICMSTOT_VIPI,
                "NFE_INFNFE_TOTAL_ICMSTOT_VDESC": registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
                "NFE_INFNFE_TOTAL_ICMSTOT_VII": registro.NFE_INFNFE_TOTAL_ICMSTOT_VII,
                "NFE_INFNFE_TOTAL_ICMSTOT_VSEG": registro.NFE_INFNFE_TOTAL_ICMSTOT_VSEG,
                "NFE_INFNFE_TOTAL_ICMSTOT_VFCP": registro.NFE_INFNFE_TOTAL_ICMSTOT_VFCP,
                "NFE_INFNFE_TOTAL_ICMSTOT_VBCST": registro.NFE_INFNFE_TOTAL_ICMSTOT_VBCST,
                "NFE_INFNFE_TOTAL_ICMSTOT_VST": registro.NFE_INFNFE_TOTAL_ICMSTOT_VST,
                "NFE_INFNFE_TOTAL_ICMSTOT_VFCPST": registro.NFE_INFNFE_TOTAL_ICMSTOT_VFCPST,
                "NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET": registro.NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET,
                "NFE_INFNFE_TOTAL_ICMSTOT_VPROD": registro.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
                "NFE_INFNFE_TOTAL_ICMSTOT_VFRETE": registro.NFE_INFNFE_TOTAL_ICMSTOT_VFRETE,
                "NFE_INFNFESUPL_QRCODE": registro.NFE_INFNFESUPL_QRCODE,
                "NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON": registro.NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON,
                "NFE_INFNFE_IDE_PROCEMI": registro.NFE_INFNFE_IDE_PROCEMI,
                "NFE_INFNFESUPL_URLCHAVE": registro.NFE_INFNFESUPL_URLCHAVE,
                "PROTNFE_INFPROT_XMOTIVO": registro.PROTNFE_INFPROT_XMOTIVO,
                "PROTNFE_INFPROT_ID": registro.PROTNFE_INFPROT_ID,
                "PROTNFE_INFPROT_DIGVAL": registro.PROTNFE_INFPROT_DIGVAL,
                "IDEMPRESA": registro.IDEMPRESA,
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
                "DTENVIOONTINGENCIA": registro.DTENVIOONTINGENCIA
            },
            "detalhe": obterLinhasDoDetalhe(registro.IDVENDA),
            "pagamento": obterLinhasDoPagamento(registro.IDVENDA),
            "configuracao": obterLinhasDaConfuguracao(registro.IDEMPRESA)
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