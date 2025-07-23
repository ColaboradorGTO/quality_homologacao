var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoDetalhe(idDevolucao) {

	var query = ' SELECT '+
	            ' "IDDEVOLUCAODETALHESAP",'+
	            ' "IDDEVOLUCAOSAP",'+
	            ' "NITEM",'+
	            ' "CPROD",'+
	            ' "XPROD",'+
	            ' "NCM",'+
	            ' "EXTIPI",'+
	            ' "CFOP",'+
	            ' "VPROD",'+
	            ' "CEANTRIB",'+
	            ' "UTRIB",'+
	            ' "QTRIB",'+
	            ' "VUNTRIB",'+
	            ' "VFRETE",'+
	            ' "VSEG",'+
	            ' "VDESC",'+
	            ' "VOUTRO",'+
	            ' "INDTOT",'+
	            ' "VTOTTRIB",'+
	            ' "ICMS_ORIG",'+
	            ' "ICMS_CST",'+
	            ' "ICMS_MODBC",'+
	            ' "ICMS_VBC",'+
	            ' "ICMS_PREDBC",'+
	            ' "ICMS_PICMS",'+
	            ' "ICMS_VICMS",'+
	            ' "ICMS_VICMSDESON",'+
	            ' "ICMS_MODBCST",'+
	            ' "ICMS_PMVAST",'+
	            ' "ICMS_PREDBCST",'+
	            ' "ICMS_VBCST",'+
	            ' "ICMS_PICMSST",'+
	            ' "ICMS_VICMSST",'+
	            ' "ICMS_MOTDESICMS",'+
	            ' "ICMS_PBCOP",'+
	            ' "ICMS_UFST",'+
	            ' "ICMS_VBCSTRET",'+
	            ' "ICMS_VICMSSTRET",'+
	            ' "ICMS_VBCSTDEST",'+
	            ' "ICMS_VICSMSTDEST",'+
	            ' "ICMS_CSOSN",'+
	            ' "ICMS_PCREDSN",'+
	            ' "ICMS_VCREDICMSSN",'+
	            ' "ICMSUFDEST_PFCPUFDEST",'+
	            ' "ICMSUFDEST_VBCUFDEST",'+
	            ' "ICMSUFDEST_PICMSUFDEST",'+
	            ' "ICMSUFDEST_PICMSINTER",'+
	            ' "ICMSUFDEST_PICMSINTERPART",'+
	            ' "ICMSUFDEST_VFCPUFDEST",'+
	            ' "ICMSUFDEST_VICMSUFDEST",'+
	            ' "ICMSUFDEST_VICMSUFREMET",'+
	            ' "IPI_CLENQ",'+
	            ' "IPI_CNPJPROD",'+
	            ' "IPI_CSELO",'+
	            ' "IPI_QSELO",'+
	            ' "IPI_CENQ",'+
	            ' "IPI_CST",'+
	            ' "IPI_VBC",'+
	            ' "IPI_PIPI",'+
	            ' "IPI_QUNID",'+
	            ' "IPI_VUNID",'+
	            ' "IPI_VIPI",'+
	            ' "II_VBC",'+
	            ' "II_VDESPADU",'+
	            ' "II_VII",'+
	            ' "II_VIOF",'+
	            ' "ISSQN_VBC",'+
	            ' "ISSQN_VALIQ",'+
	            ' "ISSQN_VISSQN",'+
	            ' "ISSQN_CMUNFG",'+
	            ' "ISSQN_CLISTSERV",'+
	            ' "ISSQN_CSITTRIB",'+
	            ' "PIS_CST",'+
	            ' "PIS_VBC",'+
	            ' "PIS_PPIS",'+
	            ' "PIS_VPIS",'+
	            ' "PIS_QBCPROD",'+
	            ' "PIS_VALIQPROD",'+
	            ' "PISST_VBC",'+
	            ' "PISST_PPIS",'+
	            ' "PISST_VPIS",'+
	            ' "PISST_QBCPROD",'+
	            ' "PISST_VALIQPROD",'+
	            ' "COFINS_CST",'+
	            ' "COFINS_VBC",'+
	            ' "COFINS_PCOFINS",'+
	            ' "COFINS_VCOFINS",'+
	            ' "COFINS_QBCPROD",'+
	            ' "COFINS_VALIQPROD",'+
	            ' "COFINSST_VBC",'+
	            ' "COFINSST_PCOFINS",'+
	            ' "COFINSST_VCOFINS",'+
	            ' "COFINSST_QBCPROD",'+
	            ' "COFINSST_VALIQPROD",'+
	            ' "INFADPROD",'+
	            ' "STCANCELADO"'+
            ' FROM "VAR_DB_NAME"."DEVOLUCAODETALHESAP" '+
            '  WHERE  IDDEVOLUCAOSAP = ?  ' +
		    '  ORDER BY IDDEVOLUCAODETALHESAP  ';
	var linhas = api.sqlQuery(query, idDevolucao);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"det": {
					"IDDEVOLUCAODETALHESAP": det.IDDEVOLUCAODETALHESAP,
	                "IDDEVOLUCAOSAP": det.IDDEVOLUCAOSAP,
	                "NITEM": det.NITEM,
	                "CPROD": det.CPROD,
	                "XPROD": det.XPROD,
	                "NCM": det.NCM,
	                "EXTIPI": det.EXTIPI,
	                "CFOP": det.CFOP,
	                "VPROD": det.VPROD,
	                "CEANTRIB": det.CEANTRIB,
	                "UTRIB": det.UTRIB,
	                "QTRIB": det.QTRIB,
	                "VUNTRIB": det.VUNTRIB,
	                "VFRETE": det.VFRETE,
	                "VSEG": det.VSEG,
	                "VDESC": det.VDESC,
	                "VOUTRO": det.VOUTRO,
	                "INDTOT": det.INDTOT,
	                "VTOTTRIB": det.VTOTTRIB,
	                "ICMS_ORIG": det.ICMS_ORIG,
	                "ICMS_CST": det.ICMS_CST,
	                "ICMS_MODBC": det.ICMS_MODBC,
	                "ICMS_VBC": det.ICMS_VBC,
	                "ICMS_PREDBC": det.ICMS_PREDBC,
	                "ICMS_PICMS": det.ICMS_PICMS,
	                "ICMS_VICMS": det.ICMS_VICMS,
	                "ICMS_VICMSDESON": det.ICMS_VICMSDESON,
	                "ICMS_MODBCST": det.ICMS_MODBCST,
	                "ICMS_PMVAST": det.ICMS_PMVAST,
	                "ICMS_PREDBCST": det.ICMS_PREDBCST,
	                "ICMS_VBCST": det.ICMS_VBCST,
	                "ICMS_PICMSST": det.ICMS_PICMSST,
	                "ICMS_VICMSST": det.ICMS_VICMSST,
	                "ICMS_MOTDESICMS": det.ICMS_MOTDESICMS,
	                "ICMS_PBCOP": det.ICMS_PBCOP,
	                "ICMS_UFST": det.ICMS_UFST,
	                "ICMS_VBCSTRET": det.ICMS_VBCSTRET,
	                "ICMS_VICMSSTRET": det.ICMS_VICMSSTRET,
	                "ICMS_VBCSTDEST": det.ICMS_VBCSTDEST,
	                "ICMS_VICSMSTDEST": det.ICMS_VICSMSTDEST,
	                "ICMS_CSOSN": det.ICMS_CSOSN,
	                "ICMS_PCREDSN": det.ICMS_PCREDSN,
	                "ICMS_VCREDICMSSN": det.ICMS_VCREDICMSSN,
	                "ICMSUFDEST_PFCPUFDEST": det.ICMSUFDEST_PFCPUFDEST,
	                "ICMSUFDEST_VBCUFDEST": det.ICMSUFDEST_VBCUFDEST,
	                "ICMSUFDEST_PICMSUFDEST": det.ICMSUFDEST_PICMSUFDEST,
	                "ICMSUFDEST_PICMSINTER": det.ICMSUFDEST_PICMSINTER,
	                "ICMSUFDEST_PICMSINTERPART": det.ICMSUFDEST_PICMSINTERPART,
	                "ICMSUFDEST_VFCPUFDEST": det.ICMSUFDEST_VFCPUFDEST,
	                "ICMSUFDEST_VICMSUFDEST": det.ICMSUFDEST_VICMSUFDEST,
	                "ICMSUFDEST_VICMSUFREMET": det.ICMSUFDEST_VICMSUFREMET,
	                "IPI_CLENQ": det.IPI_CLENQ,
	                "IPI_CNPJPROD": det.IPI_CNPJPROD,
	                "IPI_CSELO": det.IPI_CSELO,
	                "IPI_QSELO": det.IPI_QSELO,
	                "IPI_CENQ": det.IPI_CENQ,
	                "IPI_CST": det.IPI_CST,
	                "IPI_VBC": det.IPI_VBC,
	                "IPI_PIPI": det.IPI_PIPI,
	                "IPI_QUNID": det.IPI_QUNID,
	                "IPI_VUNID": det.IPI_VUNID,
	                "IPI_VIPI": det.IPI_VIPI,
	                "II_VBC": det.II_VBC,
	                "II_VDESPADU": det.II_VDESPADU,
	                "II_VII": det.II_VII,
	                "II_VIOF": det.II_VIOF,
	                "ISSQN_VBC": det.ISSQN_VBC,
	                "ISSQN_VALIQ": det.ISSQN_VALIQ,
	                "ISSQN_VISSQN": det.ISSQN_VISSQN,
	                "ISSQN_CMUNFG": det.ISSQN_CMUNFG,
	                "ISSQN_CLISTSERV": det.ISSQN_CLISTSERV,
	                "ISSQN_CSITTRIB": det.ISSQN_CSITTRIB,
	                "PIS_CST": det.PIS_CST,
	                "PIS_VBC": det.PIS_VBC,
	                "PIS_PPIS": det.PIS_PPIS,
	                "PIS_VPIS": det.PIS_VPIS,
	                "PIS_QBCPROD": det.PIS_QBCPROD,
	                "PIS_VALIQPROD": det.PIS_VALIQPROD,
	                "PISST_VBC": det.PISST_VBC,
	                "PISST_PPIS": det.PISST_PPIS,
	                "PISST_VPIS": det.PISST_VPIS,
	                "PISST_QBCPROD": det.PISST_QBCPROD,
	                "PISST_VALIQPROD": det.PISST_VALIQPROD,
	                "COFINS_CST": det.COFINS_CST,
	                "COFINS_VBC": det.COFINS_VBC,
	                "COFINS_PCOFINS": det.COFINS_PCOFINS,
	                "COFINS_VCOFINS": det.COFINS_VCOFINS,
	                "COFINS_QBCPROD": det.COFINS_QBCPROD,
	                "COFINS_VALIQPROD": det.COFINS_VALIQPROD,
	                "COFINSST_VBC": det.COFINSST_VBC,
	                "COFINSST_PCOFINS": det.COFINSST_PCOFINS,
	                "COFINSST_VCOFINS": det.COFINSST_VCOFINS,
	                "COFINSST_QBCPROD": det.COFINSST_QBCPROD,
	                "COFINSST_VALIQPROD": det.COFINSST_VALIQPROD,
	                "INFADPROD": det.INFADPROD,
	                "STCANCELADO":det.STCANCELADO
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
    
	var query = ' SELECT '+
			'  "IDDEVOLUCAOSAP", '+
			'  "IDVENDA", '+
			'  "IDCAIXAWEB", '+
			'  "IDOPERADOR", '+
			'  "IDEMPRESA", '+
			'  "DTHORAABERTURA", '+
			'  "DTHORAFECHAMENTO", '+
			'  "VRDEVOLUCAO", '+
			'  "NFE_INFNFE_ID", '+
			'  "NFE_INFNFE_VERSAO", '+
			'  "NFE_INFNFE_IDE_CUF", '+
			'  "NFE_INFNFE_IDE_CNF", '+
			'  "NFE_INFNFE_IDE_NATOP", '+
			'  "NFE_INFNFE_IDE_MOD", '+
			'  "NFE_INFNFE_IDE_SERIE", '+
			'  "NFE_INFNFE_IDE_NNF", '+
			'  "NFE_INFNFE_IDE_DHEMI", '+
			'  "NFE_INFNFE_IDE_TPNF", '+
			'  "NFE_INFNFE_IDE_IDDEST", '+
			'  "NFE_INFNFE_IDE_CMUNFG", '+
			'  "NFE_INFNFE_IDE_TPIMP", '+
			'  "NFE_INFNFE_IDE_TPEMIS", '+
			'  "NFE_INFNFE_IDE_CDV", '+
			'  "NFE_INFNFE_IDE_TPAMB", '+
			'  "NFE_INFNFE_IDE_FINNFE", '+
			'  "NFE_INFNFE_IDE_INDFINAL", '+
			'  "NFE_INFNFE_IDE_INDPRES", '+
			'  "NFE_INFNFE_IDE_PROCEMI", '+
			'  "NFE_INFNFE_IDE_VERPROC", '+
			'  "NFE_INFNFE_EMIT_CNPJ", '+
			'  "NFE_INFNFE_EMIT_NOME", '+
			'  "NFE_INFNFE_EMIT_FANT", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_XLGR", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_NRO", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_CMUN", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_XMUN", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_UF", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_CEP", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_CPAIS", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_XPAIS", '+
			'  "NFE_INFNFE_EMIT_ENDEREMIT_FONE", '+
			'  "NFE_INFNFE_EMIT_IE", '+
			'  "NFE_INFNFE_EMIT_CRT", '+
			'  "NFE_INFNFE_AUTXML_CNPJ", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VBC", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VICMS", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VFCP", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VBCST", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VST", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VFCPST", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VPROD", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VFRETE", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VSEG", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VDESC", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VII", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VIPI", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VPIS", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VCOFINS", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO", '+
			'  "NFE_INFNFE_TOTAL_ICMSTOT_VNF", '+
			'  "NFE_INFNFE_TRANSP_MODFRETE", '+
			'  "NFE_INFNFE_INFADIC_INFCPL", '+
			'  "NFE_INFNFESUPL_QRCODE", '+
			'  "NFE_INFNFESUPL_URLCHAVE", '+
			'  "PROTNFE_VERSAO", '+
			'  "PROTNFE_INFPROT_ID", '+
			'  "PROTNFE_INFPROT_TPAMB", '+
			'  "PROTNFE_INFPROT_VERAPLIC", '+
			'  "PROTNFE_INFPROT_CHNFE", '+
			'  "PROTNFE_INFPROT_DHRECBTO", '+
			'  "PROTNFE_INFPROT_NPROT", '+
			'  "PROTNFE_INFPROT_DIGVAL", '+
			'  "PROTNFE_INFPROT_CSTAT", '+
			'  "PROTNFE_INFPROT_XMOTIVO", '+
			'  "DEST_CNPJ", '+
			'  "DEST_CPF", '+
			'  "DEST_XNOME", '+
			'  "DEST_XLGR", '+
			'  "DEST_NRO", '+
			'  "DEST_XCPL", '+
			'  "DEST_XBAIRRO", '+
			'  "DEST_CMUN", '+
			'  "DEST_XMUN", '+
			'  "DEST_UF", '+
			'  "DEST_CEP", '+
			'  "DEST_CPAIS", '+
			'  "DEST_XPAIS", '+
			'  "DEST_FONE", '+
			'  "DEST_IE", '+
			'  "DEST_ISUF", '+
			'  "DEST_EMAIL", '+
			'  "PROTNFE_INFPROT_CHNFE_CANC", '+
			'  "STATIVO", '+
			'  "STCANCELADO", '+
			'  "IDUSUARIOCANCELAMENTO", '+
			'  "TXTMOTIVOCANCELAMENTO", '+
			'  "STCONTINGENCIA", '+
			'  "DTENVIOONTINGENCIA", '+
			'  "STELETRONICOENVIADO", '+
			'  "DTULTALTERACAO" '+
		' FROM "VAR_DB_NAME"."DEVOLUCAOSAP" '+
		' WHERE 1 = ?';
		

	if (byId) {
		query = query + ' AND  IDDEVOLUCAOSAP = \'' + byId + '\' ';
	}
	
	if(nnf && serie && idEmpresa){
	    query = query + ' AND NFE_INFNFE_IDE_NNF = \'' + nnf + '\' ';
	    query = query + ' AND NFE_INFNFE_IDE_SERIE = \'' + serie + '\' ';
	    query = query + ' AND IDEMPRESA = \'' + idEmpresa + '\' ';
	}

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var devolucao = {
			"devolucao": {
				"IDDEVOLUCAOSAP": registro.IDDEVOLUCAOSAP,
				"IDVENDA": registro.IDVENDA,
				"IDCAIXAWEB": registro.IDCAIXAWEB,
				"IDOPERADOR": registro.IDOPERADOR,
				"IDEMPRESA": registro.IDEMPRESA,
				"DTHORAABERTURA": registro.DTHORAABERTURA,
				"DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
				"VRDEVOLUCAO": registro.VRDEVOLUCAO,
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
				"PROTNFE_INFPROT_XMOTIVO": registro.PROTNFE_INFPROT_XMOTIVO,
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
				"DEST_EMAIL": registro.DEST_EMAIL,
				"PROTNFE_INFPROT_CHNFE_CANC": registro.PROTNFE_INFPROT_CHNFE_CANC,
				"STATIVO": registro.STATIVO,
				"STCANCELADO": registro.STCANCELADO,
				"IDUSUARIOCANCELAMENTO": registro.IDUSUARIOCANCELAMENTO,
				"TXTMOTIVOCANCELAMENTO": registro.TXTMOTIVOCANCELAMENTO,
				"STCONTINGENCIA": registro.STCONTINGENCIA,
				"DTENVIOONTINGENCIA": registro.DTENVIOONTINGENCIA,
				"STELETRONICOENVIADO": registro.STELETRONICOENVIADO,
				"DTULTALTERACAO": registro.DTULTALTERACAO
			},
			"detalheDevolucao": obterLinhasDoDetalhe(registro.IDDEVOLUCAOSAP)
		};

		data.push(devolucao);

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

function fnIncluirDetalhes(conn, lstDet, vIdDevolucaoSap) {
    var queryId = 'SELECT QUALITY_CONC.SEQ_DEVOLUCAODETALHESAP.NEXTVAL FROM DUMMY WHERE 1=?';
	var query = 'INSERT INTO "VAR_DB_NAME"."DEVOLUCAODETALHESAP" ' +
		" ( " +
		' "IDDEVOLUCAODETALHESAP", '+
    	' "IDDEVOLUCAOSAP", '+
    	' "NITEM", '+
    	' "CPROD", '+
    	' "XPROD", '+
    	' "NCM", '+
    	' "EXTIPI", '+
    	' "CFOP", '+
    	' "VPROD", '+
    	' "CEANTRIB", '+
    	' "UTRIB", '+
    	' "QTRIB", '+
    	' "VUNTRIB", '+
    	' "VFRETE", '+
    	' "VSEG", '+
    	' "VDESC", '+
    	' "VOUTRO", '+
    	' "INDTOT", '+
    	' "VTOTTRIB", '+
    	' "ICMS_ORIG", '+
    	' "ICMS_CST", '+
    	' "ICMS_MODBC", '+
    	' "ICMS_VBC", '+
    	' "ICMS_PREDBC", '+
    	' "ICMS_PICMS", '+
    	' "ICMS_VICMS", '+
    	' "ICMS_VICMSDESON", '+
    	' "ICMS_MODBCST", '+
    	' "ICMS_PMVAST", '+
    	' "ICMS_PREDBCST", '+
    	' "ICMS_VBCST", '+
    	' "ICMS_PICMSST", '+
    	' "ICMS_VICMSST", '+
    	' "ICMS_MOTDESICMS", '+
    	' "ICMS_PBCOP", '+
    	' "ICMS_UFST", '+
    	' "ICMS_VBCSTRET", '+
    	' "ICMS_VICMSSTRET", '+
    	' "ICMS_VBCSTDEST", '+
    	' "ICMS_VICSMSTDEST", '+
    	' "ICMS_CSOSN", '+
    	' "ICMS_PCREDSN", '+
    	' "ICMS_VCREDICMSSN", '+
    	' "ICMSUFDEST_PFCPUFDEST", '+
    	' "ICMSUFDEST_VBCUFDEST", '+
    	' "ICMSUFDEST_PICMSUFDEST", '+
    	' "ICMSUFDEST_PICMSINTER", '+
    	' "ICMSUFDEST_PICMSINTERPART", '+
    	' "ICMSUFDEST_VFCPUFDEST", '+
    	' "ICMSUFDEST_VICMSUFDEST", '+
    	' "ICMSUFDEST_VICMSUFREMET", '+
    	' "IPI_CLENQ", '+
    	' "IPI_CNPJPROD", '+
    	' "IPI_CSELO", '+
    	' "IPI_QSELO", '+
    	' "IPI_CENQ", '+
    	' "IPI_CST", '+
    	' "IPI_VBC", '+
    	' "IPI_PIPI", '+
    	' "IPI_QUNID", '+
    	' "IPI_VUNID", '+
    	' "IPI_VIPI", '+
    	' "II_VBC", '+
    	' "II_VDESPADU", '+
    	' "II_VII", '+
    	' "II_VIOF", '+
    	' "ISSQN_VBC", '+
    	' "ISSQN_VALIQ", '+
    	' "ISSQN_VISSQN", '+
    	' "ISSQN_CMUNFG", '+
    	' "ISSQN_CLISTSERV", '+
    	' "ISSQN_CSITTRIB", '+
    	' "PIS_CST", '+
    	' "PIS_VBC", '+
    	' "PIS_PPIS", '+
    	' "PIS_VPIS", '+
    	' "PIS_QBCPROD", '+
    	' "PIS_VALIQPROD", '+
    	' "PISST_VBC", '+
    	' "PISST_PPIS", '+
    	' "PISST_VPIS", '+
    	' "PISST_QBCPROD", '+
    	' "PISST_VALIQPROD", '+
    	' "COFINS_CST", '+
    	' "COFINS_VBC", '+
    	' "COFINS_PCOFINS", '+
    	' "COFINS_VCOFINS", '+
    	' "COFINS_QBCPROD", '+
    	' "COFINS_VALIQPROD", '+
    	' "COFINSST_VBC", '+
    	' "COFINSST_PCOFINS", '+
    	' "COFINSST_VCOFINS", '+
    	' "COFINSST_QBCPROD", '+
    	' "COFINSST_VALIQPROD", '+
    	' "INFADPROD", '+
    	' "STCANCELADO" '+
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstDet.length; i++) {
        var idDevolucaoDetalheSap = api.executeScalar(queryId,1);
		var registro = lstDet[i];

		pStmt.setString(1, idDevolucaoDetalheSap);
		pStmt.setString(2, vIdDevolucaoSap);
		pStmt.setString(3, registro["@nItem"]);
		pStmt.setString(4, registro.prod.cProd);
		pStmt.setString(6, registro.prod.xProd);
		pStmt.setString(7, registro.prod.NCM);
		//EXTIPI
		pStmt.setString(8, registro.prod.CFOP);
	
		pStmt.setFloat(9, registro.prod.vProd);
		pStmt.setString(10, registro.prod.cEANTrib);
		pStmt.setString(11, registro.prod.uTrib);
		pStmt.setFloat(12, registro.prod.qTrib);
		pStmt.setFloat(13, registro.prod.vUnTrib);
		//VFRETE
		//VSEG
		pStmt.setFloat(14, registro.prod.vDesc || 0);
		//VOUTRO
		pStmt.setString(15, registro.prod.indTot);
		//VTOTTRIB
		pStmt.setString(16, registro.imposto.ICMS.ICMS00.orig);
		pStmt.setString(17, registro.imposto.ICMS.ICMS00.CST);
		pStmt.setString(18, registro.imposto.ICMS.ICMS00.modBC);
		pStmt.setFloat(19, registro.imposto.ICMS.ICMS00.vBC);
		//ICMS_PREDBC
		pStmt.setFloat(20, registro.imposto.ICMS.ICMS00.pICMS);
		pStmt.setFloat(21, registro.imposto.ICMS.ICMS00.vICMS);
		//ICMS_VICMSDESON
		//ICMS_MODBCST
		//ICMS_PMVAST
		//ICMS_PREDBCST
		//ICMS_VBCST",
	    //ICMS_PICMSST",
	    //ICMS_VICMSST",
	    //ICMS_MOTDESICMS",
	    //ICMS_PBCOP",
	    //ICMS_UFST",
	    //ICMS_VBCSTRET",
	    //ICMS_VICMSSTRET",
	    //ICMS_VBCSTDEST",
	    //ICMS_VICSMSTDEST",
	    //ICMS_CSOSN",
	    //ICMS_PCREDSN",
	    //ICMS_VCREDICMSSN",
	    //ICMSUFDEST_PFCPUFDEST",
	    //ICMSUFDEST_VBCUFDEST",
	    //ICMSUFDEST_PICMSUFDEST",
	    //ICMSUFDEST_PICMSINTER",
	    //ICMSUFDEST_PICMSINTERPART",
	    //ICMSUFDEST_VFCPUFDEST",
	    //ICMSUFDEST_VICMSUFDEST",
	    //ICMSUFDEST_VICMSUFREMET",
	    //IPI_CLENQ",
	    //IPI_CNPJPROD",
	    //IPI_CSELO",
	    //IPI_QSELO",
	    //IPI_CENQ",
	    //IPI_CST",
	    //IPI_VBC",
	    //IPI_PIPI",
	    //IPI_QUNID",
	    //IPI_VUNID",
	    //IPI_VIPI",
	    //II_VBC",
	    //II_VDESPADU",
	    //II_VII",
	    //II_VIOF",
	    //ISSQN_VBC",
	    //ISSQN_VALIQ",
	    //ISSQN_VISSQN",
	    //ISSQN_CMUNFG",
	    //ISSQN_CLISTSERV",
	    //ISSQN_CSITTRIB",
		pStmt.setString(22, registro.imposto.PIS.PISAliq.CST);
		pStmt.setFloat(23, registro.imposto.PIS.PISAliq.vBC);
		pStmt.setFloat(24, registro.imposto.PIS.PISAliq.pPIS);
		pStmt.setFloat(25, registro.imposto.PIS.PISAliq.vPIS);
		//PIS_QBCPROD",
	    //PIS_VALIQPROD",
	    //PISST_VBC",
	    //PISST_PPIS",
	    //PISST_VPIS",
	    //PISST_QBCPROD",
	    //PISST_VALIQPROD",
		pStmt.setString(26, registro.imposto.COFINS.COFINSAliq.CST);
		pStmt.setFloat(27, registro.imposto.COFINS.COFINSAliq.vBC);
		pStmt.setFloat(28, registro.imposto.COFINS.COFINSAliq.pCOFINS);
		pStmt.setFloat(29, registro.imposto.COFINS.COFINSAliq.vCOFINS);
		//COFINS_QBCPROD",
    	//COFINS_VALIQPROD",
    	//COFINSST_VBC",
    	//COFINSST_PCOFINS",
    	//COFINSST_VCOFINS",
    	//COFINSST_QBCPROD",
    	//COFINSST_VALIQPROD",
    	//INFADPROD
    	pStmt.setString(30,'False');
		
		
	
		pStmt.execute();
	}

	pStmt.close();

	conn.commit();
}

function fnHandlePost() {
	var conn = $.db.getConnection();
	var queryId = 'SELECT QUALITY_CONC.SEQ_DEVOLUCAOSAP.NEXTVAL FROM DUMMY WHERE 1=?';
	
	try {
		var query = 'INSERT INTO "VAR_DB_NAME"."DEVOLUCAOSAP" ' +
			" ( " +
				' "IDDEVOLUCAOSAP", ' +
            	' "IDVENDA", ' +
            	' "IDCAIXAWEB", ' +
            	' "IDOPERADOR", ' +
            	' "IDEMPRESA", ' +
            	' "DTHORAABERTURA", ' +
            	' "DTHORAFECHAMENTO", ' +
            	' "VRDEVOLUCAO", ' +
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
            	' "DEST_CNPJ", ' +
            	' "DEST_CPF", ' +
            	' "DEST_XNOME", ' +
            	' "DEST_XLGR", ' +
            	' "DEST_NRO", ' +
            	' "DEST_XCPL", ' +
            	' "DEST_XBAIRRO", ' +
            	' "DEST_CMUN", ' +
            	' "DEST_XMUN", ' +
            	' "DEST_UF", ' +
            	' "DEST_CEP", ' +
            	' "DEST_CPAIS", ' +
            	' "DEST_XPAIS", ' +
            	' "DEST_FONE", ' +
            	' "DEST_IE", ' +
            	' "DEST_ISUF", ' +
            	' "DEST_EMAIL", ' +
            	' "PROTNFE_INFPROT_CHNFE_CANC", ' +
            	' "STATIVO", ' +
            	' "STCANCELADO", ' +
            	' "IDUSUARIOCANCELAMENTO", ' +
            	' "TXTMOTIVOCANCELAMENTO", ' +
            	' "STCONTINGENCIA", ' +
            	' "DTENVIOONTINGENCIA", ' +
            	' "STELETRONICOENVIADO", ' +
            	' "DTULTALTERACAO" ' +
			' ) ' +
			' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ';
		query = query + '?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {
            
            var data = [];
			var registro = bodyJson[i];
			var idDevolucaoSap = api.executeScalar(queryId,1);
		
		    pStmt.setInt(1, idDevolucaoSap);
			pStmt.setString(2, registro.IDVENDA);
			pStmt.setInt(3, registro.IDCAIXAWEB);
			pStmt.setInt(4, registro.IDOPERADOR);
			pStmt.setInt(5, registro.IDEMPRESA);
			pStmt.setDate(6, registro.DTHORAABERTURA);
		    setTimestampOrNull(pStmt, 7, registro.DTHORAFECHAMENTO);
			pStmt.setFloat(8, registro.VRDEVOLUCAO);
		
			pStmt.setString(9, registro.NFe.infNFe["@Id"]);
			pStmt.setString(10, registro.NFe.infNFe["@versao"]);
			pStmt.setString(11, registro.NFe.infNFe.ide.cUF);
			pStmt.setString(12, registro.NFe.infNFe.ide.cNF);
			pStmt.setString(13, registro.NFe.infNFe.ide.natOp);
			pStmt.setString(14, registro.NFe.infNFe.ide.mod);
			pStmt.setString(15, registro.NFe.infNFe.ide.serie);
			pStmt.setString(16, registro.NFe.infNFe.ide.nNF);
			pStmt.setString(17, registro.NFe.infNFe.ide.dhEmi);
			pStmt.setString(18, registro.NFe.infNFe.ide.tpNF);
			pStmt.setString(19, registro.NFe.infNFe.ide.idDest);
			pStmt.setString(20, registro.NFe.infNFe.ide.cMunFG);
			pStmt.setString(21, registro.NFe.infNFe.ide.tpImp);
			pStmt.setString(22, registro.NFe.infNFe.ide.tpEmis);
			pStmt.setString(23, registro.NFe.infNFe.ide.cDV);
			pStmt.setString(24, registro.NFe.infNFe.ide.tpAmb);
			pStmt.setString(25, registro.NFe.infNFe.ide.finNFe);
			pStmt.setString(26, registro.NFe.infNFe.ide.indFinal);
			pStmt.setString(27, registro.NFe.infNFe.ide.indPres);
			pStmt.setString(28, registro.NFe.infNFe.ide.procEmi);
			pStmt.setString(29, registro.NFe.infNFe.ide.verProc);

			pStmt.setString(30, registro.NFe.infNFe.emit.CNPJ);
			pStmt.setString(31, registro.NFe.infNFe.emit.xNome);
			pStmt.setString(32, registro.NFe.infNFe.emit.xFant);
			pStmt.setString(33, registro.NFe.infNFe.emit.enderEmit.xLgr);
			pStmt.setString(34, registro.NFe.infNFe.emit.enderEmit.nro);
			pStmt.setString(35, registro.NFe.infNFe.emit.enderEmit.xBairro);
			pStmt.setString(36, registro.NFe.infNFe.emit.enderEmit.cMun);
			pStmt.setString(37, registro.NFe.infNFe.emit.enderEmit.xMun);
			pStmt.setString(38, registro.NFe.infNFe.emit.enderEmit.UF);
			pStmt.setString(39, registro.NFe.infNFe.emit.enderEmit.CEP);
			pStmt.setString(40, registro.NFe.infNFe.emit.enderEmit.cPais);
			pStmt.setString(41, registro.NFe.infNFe.emit.enderEmit.xPais);
			pStmt.setString(42, registro.NFe.infNFe.emit.enderEmit.fone);
			pStmt.setString(43, registro.NFe.infNFe.emit.IE);
			pStmt.setString(44, registro.NFe.infNFe.emit.CRT);

			pStmt.setString(45, (registro.NFe.infNFe.autXML || { CNPJ : "" }).CNPJ);

			pStmt.setFloat(46, registro.NFe.infNFe.total.ICMSTot.vBC);
			pStmt.setFloat(47, registro.NFe.infNFe.total.ICMSTot.vICMS);
			pStmt.setFloat(48, registro.NFe.infNFe.total.ICMSTot.vICMSDeson);
			pStmt.setFloat(49, registro.NFe.infNFe.total.ICMSTot.vFCP);
			pStmt.setFloat(50, registro.NFe.infNFe.total.ICMSTot.vBCST);
			pStmt.setFloat(51, registro.NFe.infNFe.total.ICMSTot.vST);
			pStmt.setFloat(52, registro.NFe.infNFe.total.ICMSTot.vFCPST);
			pStmt.setFloat(53, registro.NFe.infNFe.total.ICMSTot.vFCPSTRet);
			pStmt.setFloat(54, registro.NFe.infNFe.total.ICMSTot.vProd);
			pStmt.setFloat(55, registro.NFe.infNFe.total.ICMSTot.vFrete);
			pStmt.setFloat(56, registro.NFe.infNFe.total.ICMSTot.vSeg);
			pStmt.setFloat(57, registro.NFe.infNFe.total.ICMSTot.vDesc);
			pStmt.setFloat(58, registro.NFe.infNFe.total.ICMSTot.vII);
			pStmt.setFloat(59, registro.NFe.infNFe.total.ICMSTot.vIPI);
			pStmt.setFloat(60, registro.NFe.infNFe.total.ICMSTot.vIPIDevol);
			pStmt.setFloat(61, registro.NFe.infNFe.total.ICMSTot.vPIS);
			pStmt.setFloat(62, registro.NFe.infNFe.total.ICMSTot.vCOFINS);
			pStmt.setFloat(63, registro.NFe.infNFe.total.ICMSTot.vOutro);
			pStmt.setFloat(64, registro.NFe.infNFe.total.ICMSTot.vNF);

			pStmt.setString(65, registro.NFe.infNFe.transp.modFrete);
			pStmt.setString(66, registro.NFe.infNFe.infAdic.infCpl);

			pStmt.setString(67, registro.NFe.infNFeSupl.qrCode);
			pStmt.setString(68, registro.NFe.infNFeSupl.urlChave);

			pStmt.setString(69, registro.protNFe["@versao"]);
			pStmt.setString(70, registro.protNFe.infProt["@Id"]);
			pStmt.setString(71, registro.protNFe.infProt.tpAmb);
			pStmt.setString(72, registro.protNFe.infProt.verAplic);
			pStmt.setString(73, registro.protNFe.infProt.chNFe);
			pStmt.setString(74, registro.protNFe.infProt.dhRecbto);
			pStmt.setString(75, registro.protNFe.infProt.nProt);
			pStmt.setString(76, registro.protNFe.infProt.digVal);
			pStmt.setString(77, registro.protNFe.infProt.cStat);
			pStmt.setString(78, registro.protNFe.infProt.xMotivo);

			
			pStmt.setString(79, (registro.NFe.infNFe.dest || { CNPJ : "" }).CNPJ);
			pStmt.setString(80, (registro.NFe.infNFe.dest || { CPF : "" }).CPF);
			
			pStmt.setString(81, registro.NFe.infNFe.dest.xNome);
			pStmt.setString(82, registro.NFe.infNFe.dest.enderDest.xLgr);
			pStmt.setString(83, registro.NFe.infNFe.dest.enderDest.nro);
			pStmt.setString(84, registro.NFe.infNFe.dest.enderDest.xCpl);
			pStmt.setString(85, registro.NFe.infNFe.dest.enderDest.xBairro);
			pStmt.setString(86, registro.NFe.infNFe.dest.enderDest.cMun);
			pStmt.setString(87, registro.NFe.infNFe.dest.enderDest.xMun);
			pStmt.setString(88, registro.NFe.infNFe.dest.enderDest.UF);
			pStmt.setString(89, registro.NFe.infNFe.dest.enderDest.CEP);
			pStmt.setString(90, registro.NFe.infNFe.dest.enderDest.cPais);
			pStmt.setString(91, registro.NFe.infNFe.dest.enderDest.xPais);
			pStmt.setString(92, registro.NFe.infNFe.dest.enderDest.fone);
			pStmt.setString(93, registro.NFe.infNFe.dest.IE);
			pStmt.setString(94, registro.NFe.infNFe.dest.ISUF);
			pStmt.setString(95, registro.NFe.infNFe.dest.email);
			
			pStmt.setString(96, registro.PROTNFE_INFPROT_CHNFE_CANC);
            pStmt.setString(97, registro.STATIVO);
            pStmt.setString(98, registro.STCANCELADO);
            pStmt.setString(99, registro.IDUSUARIOCANCELAMENTO);
            pStmt.setString(100, registro.TXTMOTIVOCANCELAMENTO);
            pStmt.setString(101, registro.STCONTINGENCIA);
            pStmt.setString(102, registro.DTENVIOONTINGENCIA);
            pStmt.setString(103, registro.STELETRONICOENVIADO);
            pStmt.setString(104, registro.DTULTALTERACAO);

			pStmt.execute();
			fnIncluirDetalhes(conn, registro.NFe.infNFe.det, idDevolucaoSap);
			
			
			var movimento = {
				"ID": registro.IDMOVIMENTOCAIXAWEB,
				"IDCAIXA": registro.IDCAIXAWEB,
				"IDOPERADOR": registro.IDOPERADOR,
				"IDEMPRESA": registro.IDEMPRESA
			};
			
		
		    data.push(movimento);
			
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
	   /* case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;*/
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}