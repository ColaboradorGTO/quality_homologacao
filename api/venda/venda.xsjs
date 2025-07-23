var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

	var query = ' SELECT ' +
		'   tbv.IDVENDA,' +
		'   tbv.IDCAIXAWEB,' +
		'   tbv.IDOPERADOR,' +
		'   tbv.IDEMPRESA,' +
		'   TO_VARCHAR(tbv.DTHORAABERTURA,\'YYYY-MM-DD HH24:MI:SS\') AS DTHORAABERTURA, ' +
		'   tbv.VRRECDINHEIRO,' +
		'   tbv.VRRECCARTAO,' +
		'   tbv.VRRECCONVENIO,' +
		'   tbv.VRRECCHEQUE,' +
		'   tbv.VRRECPOS,' +
		'   tbv.VRRECVOUCHER,' +
		'   tbv.VRTOTALPAGO,' +
		'   tbv.VRTROCO,' +
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'YYYY-mm-DD HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
		'   tbv.STATIVO,' +
		'   tbv.STCANCELADO,' +
		'   tbv.IDUSUARIOCANCELAMENTO,' +
		'   tbv.TXTMOTIVOCANCELAMENTO,' +
		'   tbv.STCONTINGENCIA,' +
		'   tbv.DTENVIOONTINGENCIA,' +
		'   tbv.NUAUTPOS,' +
		'   tbv.NFE_INFNFE_ID,' +
		'   tbv.NFE_INFNFE_VERSAO,' +
		'   tbv.NFE_INFNFE_IDE_CUF,' +
		'   tbv.NFE_INFNFE_IDE_CNF,' +
		'   tbv.NFE_INFNFE_IDE_NATOP,' +
		'   tbv.NFE_INFNFE_IDE_MOD,' +
		'   tbv.NFE_INFNFE_IDE_SERIE,' +
		'   tbv.NFE_INFNFE_IDE_NNF,' +
		'   tbv.NFE_INFNFE_IDE_DHEMI,' +
		'   tbv.NFE_INFNFE_IDE_TPNF,' +
		'   tbv.NFE_INFNFE_IDE_IDDEST,' +
		'   tbv.NFE_INFNFE_IDE_CMUNFG,' +
		'   tbv.NFE_INFNFE_IDE_TPIMP,' +
		'   tbv.NFE_INFNFE_IDE_TPEMIS,' +
		'   tbv.NFE_INFNFE_IDE_CDV,' +
		'   tbv.NFE_INFNFE_IDE_TPAMB,' +
		'   tbv.NFE_INFNFE_IDE_FINNFE,' +
		'   tbv.NFE_INFNFE_IDE_INDFINAL,' +
		'   tbv.NFE_INFNFE_IDE_INDPRES,' +
		'   tbv.NFE_INFNFE_IDE_PROCEMI,' +
		'   tbv.NFE_INFNFE_IDE_VERPROC,' +
		'   tbv.NFE_INFNFE_EMIT_CNPJ,' +
		'   tbv.NFE_INFNFE_EMIT_NOME,' +
		'   tbv.NFE_INFNFE_EMIT_FANT,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_XLGR,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_NRO,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_CMUN,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_XMUN,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_UF,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_CEP,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_CPAIS,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_XPAIS,' +
		'   tbv.NFE_INFNFE_EMIT_ENDEREMIT_FONE,' +
		'   tbv.NFE_INFNFE_EMIT_IE,' +
		'   tbv.NFE_INFNFE_EMIT_CRT,' +
		'   tbv.NFE_INFNFE_AUTXML_CNPJ,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VBC,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VICMS,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VFCP,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VBCST,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VST,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VFCPST,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VFRETE,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VSEG,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VII,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VIPI,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VPIS,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VCOFINS,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO,' +
		'   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VNF,' +
		'   tbv.NFE_INFNFE_TRANSP_MODFRETE,' +
		'   tbv.NFE_INFNFE_INFADIC_INFCPL,' +
		'   tbv.NFE_INFNFESUPL_QRCODE,' +
		'   tbv.NFE_INFNFESUPL_URLCHAVE,' +
		'   tbv.PROTNFE_VERSAO,' +
		'   tbv.PROTNFE_INFPROT_ID,' +
		'   tbv.PROTNFE_INFPROT_TPAMB,' +
		'   tbv.PROTNFE_INFPROT_VERAPLIC,' +
		'   tbv.PROTNFE_INFPROT_CHNFE,' +
		'   tbv.PROTNFE_INFPROT_DHRECBTO,' +
		'   tbv.PROTNFE_INFPROT_NPROT,' +
		'   tbv.PROTNFE_INFPROT_DIGVAL,' +
		'   tbv.PROTNFE_INFPROT_CSTAT,' +
		'   tbv.PROTNFE_INFPROT_XMOTIVO,' +
		'   tbv.DTULTALTERACAO,' +
		'   tbv.STELETRONICOENVIADO,' +
		'   tbv.JSONELETRONICO,' +
		'   tbv.STALTERADA,' +
		'   tbv.IDMOVIMENTOCAIXAWEB,' +
		'   tbv.DEST_CNPJ,' +
		'   tbv.DEST_CPF,' +
		'   tbv.DEST_XNOME,' +
		'   tbv.DEST_XLGR,' +
		'   tbv.DEST_NRO,' +
		'   tbv.DEST_XCPL,' +
		'   tbv.DEST_XBAIRRO,' +
		'   tbv.DEST_CMUN,' +
		'   tbv.DEST_XMUN,' +
		'   tbv.DEST_UF,' +
		'   tbv.DEST_CEP,' +
		'   tbv.DEST_CPAIS,' +
		'   tbv.DEST_XPAIS,' +
		'   tbv.DEST_FONE,' +
		'   tbv.DEST_IE,' +
		'   tbv.DEST_ISUF,' +
		'   tbv.DEST_EMAIL' +
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
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
				"IDCAIXAWEB": registro.IDCAIXAWEB,
				"IDOPERADOR": registro.IDOPERADOR,
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
				"STATIVO": registro.STATIVO,
				"STCANCELADO": registro.STCANCELADO,
				"IDUSUARIOCANCELAMENTO": registro.IDUSUARIOCANCELAMENTO,
				"TXTMOTIVOCANCELAMENTO": registro.TXTMOTIVOCANCELAMENTO,
				"STCONTINGENCIA": registro.STCONTINGENCIA,
				"DTENVIOONTINGENCIA": registro.DTENVIOONTINGENCIA,
				"NUAUTPOS": registro.NUAUTPOS,
				"NFE_INFNFE_ID": registro.NFE_INFNFE_ID,
				"NFE_INFNFE_VERSAO": registro.NFE_INFNFE_VERSAO,
				"NFE_INFNFE_IDE_CUF": registro.NFE_INFNFE_IDE_CUF,
				"NFE_INFNFE_IDE_CNF": registro.NFE_INFNFE_IDE_CNF,
				"NFE_INFNFE_IDE_NATOP": registro.NFE_INFNFE_IDE_NATOP,
				"NFE_INFNFE_IDE_MOD": registro.NFE_INFNFE_IDE_MOD,
				"NFE_INFNFE_IDE_SERIE": registro.NFE_INFNFE_IDE_SERIE,
				"NFE_INFNFE_IDE_NNF": registro.NFE_INFNFE_IDE_NNF,
				"NFE_INFNFE_IDE_DHEMI": registro.NFE_INFNFE_IDE_DHEMI,
				"NFE_INFNFE_IDE_TPNF": registro.NFE_INFNFE_IDE_TPNF,
				"NFE_INFNFE_IDE_IDDEST": registro.NFE_INFNFE_IDE_IDDEST,
				"NFE_INFNFE_IDE_CMUNFG": registro.NFE_INFNFE_IDE_CMUNFG,
				"NFE_INFNFE_IDE_TPIMP": registro.NFE_INFNFE_IDE_TPIMP,
				"NFE_INFNFE_IDE_TPEMIS": registro.NFE_INFNFE_IDE_TPEMIS,
				"NFE_INFNFE_IDE_CDV": registro.NFE_INFNFE_IDE_CDV,
				"NFE_INFNFE_IDE_TPAMB": registro.NFE_INFNFE_IDE_TPAMB,
				"NFE_INFNFE_IDE_FINNFE": registro.NFE_INFNFE_IDE_FINNFE,
				"NFE_INFNFE_IDE_INDFINAL": registro.NFE_INFNFE_IDE_INDFINAL,
				"NFE_INFNFE_IDE_INDPRES": registro.NFE_INFNFE_IDE_INDPRES,
				"NFE_INFNFE_IDE_PROCEMI": registro.NFE_INFNFE_IDE_PROCEMI,
				"NFE_INFNFE_IDE_VERPROC": registro.NFE_INFNFE_IDE_VERPROC,
				"NFE_INFNFE_EMIT_CNPJ": registro.NFE_INFNFE_EMIT_CNPJ,
				"NFE_INFNFE_EMIT_NOME": registro.NFE_INFNFE_EMIT_NOME,
				"NFE_INFNFE_EMIT_FANT": registro.NFE_INFNFE_EMIT_FANT,
				"NFE_INFNFE_EMIT_ENDEREMIT_XLGR": registro.NFE_INFNFE_EMIT_ENDEREMIT_XLGR,
				"NFE_INFNFE_EMIT_ENDEREMIT_NRO": registro.NFE_INFNFE_EMIT_ENDEREMIT_NRO,
				"NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO": registro.NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO,
				"NFE_INFNFE_EMIT_ENDEREMIT_CMUN": registro.NFE_INFNFE_EMIT_ENDEREMIT_CMUN,
				"NFE_INFNFE_EMIT_ENDEREMIT_XMUN": registro.NFE_INFNFE_EMIT_ENDEREMIT_XMUN,
				"NFE_INFNFE_EMIT_ENDEREMIT_UF": registro.NFE_INFNFE_EMIT_ENDEREMIT_UF,
				"NFE_INFNFE_EMIT_ENDEREMIT_CEP": registro.NFE_INFNFE_EMIT_ENDEREMIT_CEP,
				"NFE_INFNFE_EMIT_ENDEREMIT_CPAIS": registro.NFE_INFNFE_EMIT_ENDEREMIT_CPAIS,
				"NFE_INFNFE_EMIT_ENDEREMIT_XPAIS": registro.NFE_INFNFE_EMIT_ENDEREMIT_XPAIS,
				"NFE_INFNFE_EMIT_ENDEREMIT_FONE": registro.NFE_INFNFE_EMIT_ENDEREMIT_FONE,
				"NFE_INFNFE_EMIT_IE": registro.NFE_INFNFE_EMIT_IE,
				"NFE_INFNFE_EMIT_CRT": registro.NFE_INFNFE_EMIT_CRT,
				"NFE_INFNFE_AUTXML_CNPJ": registro.NFE_INFNFE_AUTXML_CNPJ,
				"NFE_INFNFE_TOTAL_ICMSTOT_VBC": registro.NFE_INFNFE_TOTAL_ICMSTOT_VBC,
				"NFE_INFNFE_TOTAL_ICMSTOT_VICMS": registro.NFE_INFNFE_TOTAL_ICMSTOT_VICMS,
				"NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON": registro.NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON,
				"NFE_INFNFE_TOTAL_ICMSTOT_VFCP": registro.NFE_INFNFE_TOTAL_ICMSTOT_VFCP,
				"NFE_INFNFE_TOTAL_ICMSTOT_VBCST": registro.NFE_INFNFE_TOTAL_ICMSTOT_VBCST,
				"NFE_INFNFE_TOTAL_ICMSTOT_VST": registro.NFE_INFNFE_TOTAL_ICMSTOT_VST,
				"NFE_INFNFE_TOTAL_ICMSTOT_VFCPST": registro.NFE_INFNFE_TOTAL_ICMSTOT_VFCPST,
				"NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET": registro.NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET,
				"NFE_INFNFE_TOTAL_ICMSTOT_VPROD": registro.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
				"NFE_INFNFE_TOTAL_ICMSTOT_VFRETE": registro.NFE_INFNFE_TOTAL_ICMSTOT_VFRETE,
				"NFE_INFNFE_TOTAL_ICMSTOT_VSEG": registro.NFE_INFNFE_TOTAL_ICMSTOT_VSEG,
				"NFE_INFNFE_TOTAL_ICMSTOT_VDESC": registro.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
				"NFE_INFNFE_TOTAL_ICMSTOT_VII": registro.NFE_INFNFE_TOTAL_ICMSTOT_VII,
				"NFE_INFNFE_TOTAL_ICMSTOT_VIPI": registro.NFE_INFNFE_TOTAL_ICMSTOT_VIPI,
				"NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL": registro.NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL,
				"NFE_INFNFE_TOTAL_ICMSTOT_VPIS": registro.NFE_INFNFE_TOTAL_ICMSTOT_VPIS,
				"NFE_INFNFE_TOTAL_ICMSTOT_VCOFINS": registro.NFE_INFNFE_TOTAL_ICMSTOT_VCOFINS,
				"NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO": registro.NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO,
				"NFE_INFNFE_TOTAL_ICMSTOT_VNF": registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF,
				"NFE_INFNFE_TRANSP_MODFRETE": registro.NFE_INFNFE_TRANSP_MODFRETE,
				"NFE_INFNFE_INFADIC_INFCPL": registro.NFE_INFNFE_INFADIC_INFCPL,
				"NFE_INFNFESUPL_QRCODE": registro.NFE_INFNFESUPL_QRCODE,
				"NFE_INFNFESUPL_URLCHAVE": registro.NFE_INFNFESUPL_URLCHAVE,
				"PROTNFE_VERSAO": registro.PROTNFE_VERSAO,
				"PROTNFE_INFPROT_ID": registro.PROTNFE_INFPROT_ID,
				"PROTNFE_INFPROT_TPAMB": registro.PROTNFE_INFPROT_TPAMB,
				"PROTNFE_INFPROT_VERAPLIC": registro.PROTNFE_INFPROT_VERAPLIC,
				"PROTNFE_INFPROT_CHNFE": registro.PROTNFE_INFPROT_CHNFE,
				"PROTNFE_INFPROT_DHRECBTO": registro.PROTNFE_INFPROT_DHRECBTO,
				"PROTNFE_INFPROT_NPROT": registro.PROTNFE_INFPROT_NPROT,
				"PROTNFE_INFPROT_DIGVAL": registro.PROTNFE_INFPROT_DIGVAL,
				"PROTNFE_INFPROT_CSTAT": registro.PROTNFE_INFPROT_CSTAT,
				"PROTNFE_INFPROT_XMOTIVO": registro.DTULTALTERACAO,
				"DTULTALTERACAO": registro.DTULTALTERACAO,
				"STELETRONICOENVIADO": registro.STELETRONICOENVIADO,
				"JSONELETRONICO": registro.JSONELETRONICO,
				"STALTERADA": registro.STALTERADA,
				"IDMOVIMENTOCAIXAWEB": registro.IDMOVIMENTOCAIXAWEB,
				"DEST_CNPJ": registro.DEST_CNPJ,
				"DEST_CPF": registro.DEST_CPF,
				"DEST_XNOME": registro.DEST_XNOME,
				"DEST_XLGR": registro.DEST_XLGR,
				"DEST_NRO": registro.DEST_NRO,
				"DEST_XCPL": registro.DEST_XCPL,
				"DEST_XBAIRRO": registro.DEST_XBAIRRO,
				"DEST_CMUN": registro.DEST_CMUN,
				"DEST_XMUN": registro.DEST_XMUN,
				"DEST_UF": registro.DEST_UF,
				"DEST_CEP": registro.DEST_CEP,
				"DEST_CPAIS": registro.DEST_CPAIS,
				"DEST_XPAIS": registro.DEST_XPAIS,
				"DEST_FONE": registro.DEST_FONE,
				"DEST_IE": registro.DEST_IE,
				"DEST_ISUF": registro.DEST_ISUF,
				"DEST_EMAIL": registro.DEST_EMAIL
			}
			//"detalhe": obterLinhasDoDetalhe(registro.IDVENDA),
			//"pagamento": obterLinhasDoPagamento(registro.IDVENDA)
		};

		data.push(venda);

	}

	response.data = data;

	return response;
}

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}


function fnHandlePost() {
	var conn = $.db.getConnection();
	
	try {
		var query = 'INSERT INTO "VAR_DB_NAME"."VENDA" ' +
			" ( " +
			' "IDVENDA", ' +
			' "IDCAIXAWEB", ' +
			' "IDOPERADOR", ' +
			' "IDEMPRESA", ' +
			' "DTHORAABERTURA", ' +
			' "VRRECDINHEIRO", ' +
			' "VRRECCARTAO", ' +
			' "VRRECCONVENIO", ' +
			' "VRRECCHEQUE", ' +
			' "VRRECPOS", ' +
			' "VRRECVOUCHER", ' +
			' "VRTOTALPAGO", ' +
			' "VRTROCO", ' +
			' "VRTOTALVENDA", ' +
			' "DTHORAFECHAMENTO", ' +
			' "STATIVO", ' +
			' "STCANCELADO", ' +
			' "IDUSUARIOCANCELAMENTO", ' +
			' "TXTMOTIVOCANCELAMENTO", ' +
			' "STCONTINGENCIA", ' +
			' "DTENVIOONTINGENCIA", ' +
			' "NUAUTPOS", ' +
			' "NFE_INFNFE_ID", ' +
			' "NFE_INFNFE_VERSAO", ' +
			' "NFE_INFNFE_IDE_CUF", ' +
			' "NFE_INFNFE_IDE_CNF", ' +
			' "NFE_INFNFE_IDE_NATOP", ' +
			' "NFE_INFNFE_IDE_MOD", ' +
			' "NFE_INFNFE_IDE_SERIE", ' +
			' "NFE_INFNFE_IDE_NNF", ' +
			' "NFE_INFNFE_IDE_DHEMI", ' +
			' "NFE_INFNFE_IDE_TPNF", ' +
			' "NFE_INFNFE_IDE_IDDEST", ' +
			' "NFE_INFNFE_IDE_CMUNFG", ' +
			' "NFE_INFNFE_IDE_TPIMP", ' +
			' "NFE_INFNFE_IDE_TPEMIS", ' +
			' "NFE_INFNFE_IDE_CDV", ' +
			' "NFE_INFNFE_IDE_TPAMB", ' +
			' "NFE_INFNFE_IDE_FINNFE", ' +
			' "NFE_INFNFE_IDE_INDFINAL", ' +
			' "NFE_INFNFE_IDE_INDPRES", ' +
			' "NFE_INFNFE_IDE_PROCEMI", ' +
			' "NFE_INFNFE_IDE_VERPROC", ' +
			' "NFE_INFNFE_EMIT_CNPJ", ' +
			' "NFE_INFNFE_EMIT_NOME", ' +
			' "NFE_INFNFE_EMIT_FANT", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_XLGR", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_NRO", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_CMUN", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_XMUN", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_UF", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_CEP", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_CPAIS", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_XPAIS", ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_FONE", ' +
			' "NFE_INFNFE_EMIT_IE", ' +
			' "NFE_INFNFE_EMIT_CRT", ' +
			' "NFE_INFNFE_AUTXML_CNPJ", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VBC", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VICMS", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VFCP", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VBCST", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VST", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VFCPST", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VPROD", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VFRETE", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VSEG", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VDESC", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VII", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VIPI", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VPIS", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VCOFINS", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO", ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VNF", ' +
			' "NFE_INFNFE_TRANSP_MODFRETE", ' +
			' "NFE_INFNFE_INFADIC_INFCPL", ' +
			' "NFE_INFNFESUPL_QRCODE", ' +
			' "NFE_INFNFESUPL_URLCHAVE", ' +
			' "PROTNFE_VERSAO", ' +
			' "PROTNFE_INFPROT_ID", ' +
			' "PROTNFE_INFPROT_TPAMB", ' +
			' "PROTNFE_INFPROT_VERAPLIC", ' +
			' "PROTNFE_INFPROT_CHNFE", ' +
			' "PROTNFE_INFPROT_DHRECBTO", ' +
			' "PROTNFE_INFPROT_NPROT", ' +
			' "PROTNFE_INFPROT_DIGVAL", ' +
			' "PROTNFE_INFPROT_CSTAT", ' +
			' "PROTNFE_INFPROT_XMOTIVO", ' +
			' "DTULTALTERACAO", ' +
			' "STELETRONICOENVIADO", ' +
			' "JSONELETRONICO", ' +
			' "STALTERADA", ' +
			' "IDMOVIMENTOCAIXAWEB", ' +
			' "DEST_CNPJ", ' +
			' "DEST_CPF" ' +
			//' "DEST_XNOME", ' +
			//' "DEST_XLGR", ' +
			//' "DEST_NRO", ' +
			//' "DEST_XCPL", ' +
			//' "DEST_XBAIRRO", ' +
			//' "DEST_CMUN", ' +
			//' "DEST_XMUN", ' +
			//' "DEST_UF", ' +
			//' "DEST_CEP", ' +
			//' "DEST_CPAIS", ' +
			//' "DEST_XPAIS", ' +
			//' "DEST_FONE", ' +
			//' "DEST_IE", ' +
			//' "DEST_ISUF", ' +
			//' "DEST_EMAIL" ' +
			' ) ' +
			' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?';
		query = query + ',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?';
		query = query + ',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {

			var registro = bodyJson[i];

			pStmt.setString(1, registro.IDVENDA);
			pStmt.setInt(2, registro.IDCAIXAWEB);
			pStmt.setInt(3, registro.IDOPERADOR);
			pStmt.setInt(4, registro.IDEMPRESA);
			pStmt.setDate(5, registro.DTHORAABERTURA);
			pStmt.setFloat(6, registro.VRRECDINHEIRO);
			pStmt.setFloat(7, registro.VRRECCARTAO);
			pStmt.setFloat(8, registro.VRRECCONVENIO);
			pStmt.setFloat(9, registro.VRRECCHEQUE);
			pStmt.setFloat(10, registro.VRRECPOS);
			pStmt.setFloat(11, registro.VRRECVOUCHER);
			pStmt.setFloat(12, registro.VRTOTALPAGO);
			pStmt.setFloat(13, registro.VRTROCO);
			pStmt.setFloat(14, registro.VRTOTALVENDA);
			setTimestampOrNull(pStmt, 15, registro.DTHORAFECHAMENTO);
			pStmt.setString(16, registro.STATIVO);
			pStmt.setString(17, registro.STCANCELADO);
			setIntOrNull(pStmt, 18, registro.IDUSUARIOCANCELAMENTO);
			pStmt.setString(19, registro.TXTMOTIVOCANCELAMENTO);
			pStmt.setString(20, registro.STCONTINGENCIA);
			setTimestampOrNull(pStmt, 21, registro.DTENVIOONTINGENCIA);
			pStmt.setString(22, registro.NUAUTPOS);

			pStmt.setString(23, registro.NFe.infNFe["@Id"]);
			pStmt.setString(24, registro.NFe.infNFe["@versao"]);
			pStmt.setString(25, registro.NFe.infNFe.ide.cUF);
			pStmt.setString(26, registro.NFe.infNFe.ide.cNF);
			pStmt.setString(27, registro.NFe.infNFe.ide.natOp);
			pStmt.setString(28, registro.NFe.infNFe.ide.mod);
			pStmt.setString(29, registro.NFe.infNFe.ide.serie);
			pStmt.setString(30, registro.NFe.infNFe.ide.nNF);
			pStmt.setString(31, registro.NFe.infNFe.ide.dhEmi);
			pStmt.setString(32, registro.NFe.infNFe.ide.tpNF);
			pStmt.setString(33, registro.NFe.infNFe.ide.idDest);
			pStmt.setString(34, registro.NFe.infNFe.ide.cMunFG);
			pStmt.setString(35, registro.NFe.infNFe.ide.tpImp);
			pStmt.setString(36, registro.NFe.infNFe.ide.tpEmis);
			pStmt.setString(37, registro.NFe.infNFe.ide.cDV);
			pStmt.setString(38, registro.NFe.infNFe.ide.tpAmb);
			pStmt.setString(39, registro.NFe.infNFe.ide.finNFe);
			pStmt.setString(40, registro.NFe.infNFe.ide.indFinal);
			pStmt.setString(41, registro.NFe.infNFe.ide.indPres);
			pStmt.setString(42, registro.NFe.infNFe.ide.procEmi);
			pStmt.setString(43, registro.NFe.infNFe.ide.verProc);

			pStmt.setString(44, registro.NFe.infNFe.emit.CNPJ);
			pStmt.setString(45, registro.NFe.infNFe.emit.xNome);
			pStmt.setString(46, registro.NFe.infNFe.emit.xFant);
			pStmt.setString(47, registro.NFe.infNFe.emit.enderEmit.xLgr);
			pStmt.setString(48, registro.NFe.infNFe.emit.enderEmit.nro);
			pStmt.setString(49, registro.NFe.infNFe.emit.enderEmit.xBairro);
			pStmt.setString(50, registro.NFe.infNFe.emit.enderEmit.cMun);
			pStmt.setString(51, registro.NFe.infNFe.emit.enderEmit.xMun);
			pStmt.setString(52, registro.NFe.infNFe.emit.enderEmit.UF);
			pStmt.setString(53, registro.NFe.infNFe.emit.enderEmit.CEP);
			pStmt.setString(54, registro.NFe.infNFe.emit.enderEmit.cPais);
			pStmt.setString(55, registro.NFe.infNFe.emit.enderEmit.xPais);
			pStmt.setString(56, registro.NFe.infNFe.emit.enderEmit.fone);
			pStmt.setString(57, registro.NFe.infNFe.emit.IE);
			pStmt.setString(58, registro.NFe.infNFe.emit.CRT);

			pStmt.setString(59, (registro.NFe.infNFe.autXML || { CNPJ : "" }).CNPJ);

			pStmt.setFloat(60, registro.NFe.infNFe.total.ICMSTot.vBC);
			pStmt.setFloat(61, registro.NFe.infNFe.total.ICMSTot.vICMS);
			pStmt.setFloat(62, registro.NFe.infNFe.total.ICMSTot.vICMSDeson);
			pStmt.setFloat(63, registro.NFe.infNFe.total.ICMSTot.vFCP);
			pStmt.setFloat(64, registro.NFe.infNFe.total.ICMSTot.vBCST);
			pStmt.setFloat(65, registro.NFe.infNFe.total.ICMSTot.vST);
			pStmt.setFloat(66, registro.NFe.infNFe.total.ICMSTot.vFCPST);
			pStmt.setFloat(67, registro.NFe.infNFe.total.ICMSTot.vFCPSTRet);
			pStmt.setFloat(68, registro.NFe.infNFe.total.ICMSTot.vProd);
			pStmt.setFloat(69, registro.NFe.infNFe.total.ICMSTot.vFrete);
			pStmt.setFloat(70, registro.NFe.infNFe.total.ICMSTot.vSeg);
			pStmt.setFloat(71, registro.NFe.infNFe.total.ICMSTot.vDesc);
			pStmt.setFloat(72, registro.NFe.infNFe.total.ICMSTot.vII);
			pStmt.setFloat(73, registro.NFe.infNFe.total.ICMSTot.vIPI);
			pStmt.setFloat(74, registro.NFe.infNFe.total.ICMSTot.vIPIDevol);
			pStmt.setFloat(75, registro.NFe.infNFe.total.ICMSTot.vPIS);
			pStmt.setFloat(76, registro.NFe.infNFe.total.ICMSTot.vCOFINS);
			pStmt.setFloat(77, registro.NFe.infNFe.total.ICMSTot.vOutro);
			pStmt.setFloat(78, registro.NFe.infNFe.total.ICMSTot.vNF);

			pStmt.setString(79, registro.NFe.infNFe.transp.modFrete);
			pStmt.setString(80, registro.NFe.infNFe.infAdic.infCpl);

			pStmt.setString(81, registro.NFe.infNFeSupl.qrCode);
			pStmt.setString(82, registro.NFe.infNFeSupl.urlChave);

			pStmt.setString(83, registro.protNFe["@versao"]);
			pStmt.setString(84, registro.protNFe.infProt["@Id"]);
			pStmt.setString(85, registro.protNFe.infProt.tpAmb);
			pStmt.setString(86, registro.protNFe.infProt.verAplic);
			pStmt.setString(87, registro.protNFe.infProt.chNFe);
			pStmt.setString(88, registro.protNFe.infProt.dhRecbto);
			pStmt.setString(89, registro.protNFe.infProt.nProt);
			pStmt.setString(90, registro.protNFe.infProt.digVal);
			pStmt.setString(91, registro.protNFe.infProt.cStat);
			pStmt.setString(92, registro.protNFe.infProt.xMotivo);

			setTimestampOrNull(pStmt, 93, registro.DTULTALTERACAO);
			pStmt.setString(94, registro.STELETRONICOENVIADO);
			pStmt.setString(95, registro.JSONELETRONICO);
			pStmt.setString(96, registro.STALTERADA);
			pStmt.setString(97, registro.IDMOVIMENTOCAIXAWEB);
			pStmt.setString(98, (registro.NFe.infNFe.dest || { CNPJ : "" }).CNPJ);
			pStmt.setString(99, (registro.NFe.infNFe.dest || { CPF : "" }).CPF);
			//pStmt.setString(99, registro.NFe.infNFe.dest.xNome);
			//pStmt.setString(100, registro.NFe.infNFe.dest.enderDest.xLgr);
			//pStmt.setString(101, registro.NFe.infNFe.dest.enderDest.nro);
			//pStmt.setString(102, registro.NFe.infNFe.dest.enderDest.xCpl);
			//pStmt.setString(103, registro.NFe.infNFe.dest.enderDest.xBairro);
			//pStmt.setString(104, registro.NFe.infNFe.dest.enderDest.cMun);
			//pStmt.setString(105, registro.NFe.infNFe.dest.enderDest.xMun);
			//pStmt.setString(106, registro.NFe.infNFe.dest.enderDest.UF);
			//pStmt.setString(107, registro.NFe.infNFe.dest.enderDest.CEP);
			//pStmt.setString(108, registro.NFe.infNFe.dest.enderDest.cPais);
			//pStmt.setString(109, registro.NFe.infNFe.dest.enderDest.xPais);
			//pStmt.setString(110, registro.NFe.infNFe.dest.enderDest.fone);
			//pStmt.setString(111, registro.NFe.infNFe.dest.IE);
			//pStmt.setString(112, registro.NFe.infNFe.dest.ISUF);
			//pStmt.setString(113, registro.NFe.infNFe.dest.email);

			pStmt.execute();
			//fnIncluirDetalhes(conn, registro.NFe.infNFe.det, registro.IDVENDA);
			//fnIncluirPagamentos(conn, registro.NFe.infNFe.pag, registro.IDVENDA);
		}

		pStmt.close();

		conn.commit();

		return {
			"msg": "Inclusão realizada com sucesso!"
		};
	} catch (e) {
	    conn.rollback();
	    throw e;
	}
}

function fnHandlePut(){
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ' + 
        
		' "VRRECDINHEIRO" = ?, ' +
		' "VRRECCARTAO" = ?, ' +
		' "VRRECCONVENIO" = ?, ' +
		' "VRRECCHEQUE" = ?, ' +
		' "VRRECPOS" = ?, ' +
		' "VRRECVOUCHER" = ?, ' +
		' "VRTOTALPAGO" = ?, ' +
		' "VRTOTALDESCONTO" = ? ' +
		
    	' WHERE "IDVENDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
			pStmt.setFloat(1, registro.VRRECDINHEIRO||0.0);
			pStmt.setFloat(2, registro.VRRECCARTAO||0.0);
			pStmt.setFloat(3, registro.VRRECCONVENIO||0.0);
			pStmt.setFloat(4, registro.VRRECCHEQUE||0.0);
			pStmt.setFloat(5, registro.VRRECPOS||0.0);
			pStmt.setFloat(6, registro.VRRECVOUCHER||0.0);
			pStmt.setFloat(7, registro.VRTOTALPAGO||0.0);
			pStmt.setFloat(8, registro.VRTOTALDESCONTO||0.0);
			
			pStmt.setString(9, registro.IDVENDA);
                    
    	pStmt.execute();
    	
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
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

		//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		default:
			break;
			
		//Handle your PUt calls here
	    case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}