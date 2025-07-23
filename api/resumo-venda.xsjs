var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbrv.IDRESUMOVENDAWEB,' +
    '   tbrv.IDCAIXAWEB,' +
    '   tbrv.IDOPERADOR,' +
    '   tbrv.IDRESUMOVENDALOCAL,' +
    '   tbrv.IDEMPRESA,' +
    '   tbrv.DTHORAABERTURA,' +
    '   tbrv.NUTOTALITENS,' +
    '   tbrv.NUCPFCLIENTE,' +
    '   tbrv.VRTOTALITENS,' +
    '   tbrv.VRTOTALDESCONTO,' +
    '   tbrv.VRTOTALVENDA,' +
    '   tbrv.VRRECDINHEIRO,' +
    '   tbrv.VRRECCARTAO,' +
    '   tbrv.VRRECCONVENIO,' +
    '   tbrv.VRRECCHEQUE,' +
    '   tbrv.VRRECPOS,' +
    '   tbrv.VRRECVOUCHER,' +
    '   tbrv.VRTOTALPAGO,' +
    '   tbrv.VRTROCO,' +
    '   tbrv.DTHORAFECHAMENTO,' +
    '   tbrv.STATIVO,' +
    '   tbrv.STCANCELADO,' +
    '   tbrv.IDUSUARIOCANCELAMENTO,' +
    '   tbrv.TXTMOTIVOCANCELAMENTO,' +
    '   tbrv.STCONTINGENCIA,' +
    '   tbrv.DTENVIOONTINGENCIA,' +
    '   tbrv.NUAUTPOS,' +
    '   tbrv.INFNFE_ID,' +
    '   tbrv.INFNFE_VERSAO,' +
    '   tbrv.INFNFE_CUF,' +
    '   tbrv.INFNFE_CNF,' +
    '   tbrv.INFNFE_NATOP,' +
    '   tbrv.INFNFE_MOD,' +
    '   tbrv.INFNFE_SERIE,' +
    '   tbrv.INFNFE_NNF,' +
    '   tbrv.INFNFE_DHEMI,' +
    '   tbrv.INFNFE_TPNF,' +
    '   tbrv.INFNFE_IDDEST,' +
    '   tbrv.INFNFE_CMUNFG,' +
    '   tbrv.INFNFE_TPIMP,' +
    '   tbrv.INFNFE_TPEMIS,' +
    '   tbrv.INFNFE_CDV,' +
    '   tbrv.INFNFE_TPAMB,' +
    '   tbrv.INFNFE_FINNFE,' +
    '   tbrv.INFNFE_INDFINAL,' +
    '   tbrv.INFNFE_INDPRES,' +
    '   tbrv.INFNFE_PROCEMI,' +
    '   tbrv.INFNFE_VERPROC,' +
    '   tbrv.ICMSTOT_VBC,' +
    '   tbrv.ICMSTOT_VICMS,' +
    '   tbrv.ICMSTOT_VICMSDESON,' +
    '   tbrv.ICMSTOT_VFCP,' +
    '   tbrv.ICMSTOT_VBCST,' +
    '   tbrv.ICMSTOT_VST,' +
    '   tbrv.ICMSTOT_VFCPST,' +
    '   tbrv.ICMSTOT_VFCPSTRET,' +
    '   tbrv.ICMSTOT_VPROD,' +
    '   tbrv.ICMSTOT_VFRETE,' +
    '   tbrv.ICMSTOT_VSEG,' +
    '   tbrv.ICMSTOT_VDESC,' +
    '   tbrv.ICMSTOT_VII,' +
    '   tbrv.ICMSTOT_VIPI,' +
    '   tbrv.ICMSTOT_VIPIDEVOL,' +
    '   tbrv.ICMSTOT_VPIS,' +
    '   tbrv.ICMSTOT_VCOFINS,' +
    '   tbrv.ICMSTOT_VOUTRO,' +
    '   tbrv.ICMSTOT_VNF,' +
    '   tbrv.MODFRETE,' +
    '   tbrv.INFCPL,' +
    '   tbrv.INFPROT_ID,' +
    '   tbrv.INFPROT_TPAMB,' +
    '   tbrv.INFPROT_VERAPLIC,' +
    '   tbrv.INFPROT_CHNFE,' +
    '   tbrv.INFPROT_DHRECBTO,' +
    '   tbrv.INFPROT_NPROT,' +
    '   tbrv.INFPROT_DIGVAL,' +
    '   tbrv.INFPROT_CSTAT,' +
    '   tbrv.INFPROT_XMOTIVO,' +
    '   TO_VARCHAR(tbrv.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO, ' +
    '   tbrv.STELETRONICOENVIADO,' +
    '   tbrv.JSONELETRONICO,' +
    '   tbrv.STALTERADA,' +
    '   tbrv.IDMOVIMENTOCAIXAWEB' +
    ' FROM ' + 
    '   "VAR_DB_NAME".RESUMOVENDA tbrv' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbrv.IDRESUMOVENDAWEB = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOVENDA" SET ' + 
        ' "IDCAIXAWEB" = ?, ' +
        ' "IDOPERADOR" = ?, ' +
        ' "IDRESUMOVENDALOCAL" = ?, ' +
        ' "IDEMPRESA" = ?, ' +
        ' "DTHORAABERTURA" = ?, ' +
        ' "NUTOTALITENS" = ?, ' +
        ' "NUCPFCLIENTE" = ?, ' +
        ' "VRTOTALITENS" = ?, ' +
        ' "VRTOTALDESCONTO" = ?, ' +
        ' "VRTOTALVENDA" = ?, ' +
        ' "VRRECDINHEIRO" = ?, ' +
        ' "VRRECCARTAO" = ?, ' +
        ' "VRRECCONVENIO" = ?, ' +
        ' "VRRECCHEQUE" = ?, ' +
        ' "VRRECPOS" = ?, ' +
        ' "VRRECVOUCHER" = ?, ' +
        ' "VRTOTALPAGO" = ?, ' +
        ' "VRTROCO" = ?, ' +
        ' "DTHORAFECHAMENTO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "STCANCELADO" = ?, ' +
        ' "IDUSUARIOCANCELAMENTO" = ?, ' +
        ' "TXTMOTIVOCANCELAMENTO" = ?, ' +
        ' "STCONTINGENCIA" = ?, ' +
        ' "DTENVIOONTINGENCIA" = ?, ' +
        ' "NUAUTPOS" = ?, ' +
        ' "INFNFE_ID" = ?, ' +
        ' "INFNFE_VERSAO" = ?, ' +
        ' "INFNFE_CUF" = ?, ' +
        ' "INFNFE_CNF" = ?, ' +
        ' "INFNFE_NATOP" = ?, ' +
        ' "INFNFE_MOD" = ?, ' +
        ' "INFNFE_SERIE" = ?, ' +
        ' "INFNFE_NNF" = ?, ' +
        ' "INFNFE_DHEMI" = ?, ' +
        ' "INFNFE_TPNF" = ?, ' +
        ' "INFNFE_IDDEST" = ?, ' +
        ' "INFNFE_CMUNFG" = ?, ' +
        ' "INFNFE_TPIMP" = ?, ' +
        ' "INFNFE_TPEMIS" = ?, ' +
        ' "INFNFE_CDV" = ?, ' +
        ' "INFNFE_TPAMB" = ?, ' +
        ' "INFNFE_FINNFE" = ?, ' +
        ' "INFNFE_INDFINAL" = ?, ' +
        ' "INFNFE_INDPRES" = ?, ' +
        ' "INFNFE_PROCEMI" = ?, ' +
        ' "INFNFE_VERPROC" = ?, ' +
        ' "ICMSTOT_VBC" = ?, ' +
        ' "ICMSTOT_VICMS" = ?, ' +
        ' "ICMSTOT_VICMSDESON" = ?, ' +
        ' "ICMSTOT_VFCP" = ?, ' +
        ' "ICMSTOT_VBCST" = ?, ' +
        ' "ICMSTOT_VST" = ?, ' +
        ' "ICMSTOT_VFCPST" = ?, ' +
        ' "ICMSTOT_VFCPSTRET" = ?, ' +
        ' "ICMSTOT_VPROD" = ?, ' +
        ' "ICMSTOT_VFRETE" = ?, ' +
        ' "ICMSTOT_VSEG" = ?, ' +
        ' "ICMSTOT_VDESC" = ?, ' +
        ' "ICMSTOT_VII" = ?, ' +
        ' "ICMSTOT_VIPI" = ?, ' +
        ' "ICMSTOT_VIPIDEVOL" = ?, ' +
        ' "ICMSTOT_VPIS" = ?, ' +
        ' "ICMSTOT_VCOFINS" = ?, ' +
        ' "ICMSTOT_VOUTRO" = ?, ' +
        ' "ICMSTOT_VNF" = ?, ' +
        ' "MODFRETE" = ?, ' +
        ' "INFCPL" = ?, ' +
        ' "INFPROT_ID" = ?, ' +
        ' "INFPROT_TPAMB" = ?, ' +
        ' "INFPROT_VERAPLIC" = ?, ' +
        ' "INFPROT_CHNFE" = ?, ' +
        ' "INFPROT_DHRECBTO" = ?, ' +
        ' "INFPROT_NPROT" = ?, ' +
        ' "INFPROT_DIGVAL" = ?, ' +
        ' "INFPROT_CSTAT" = ?, ' +
        ' "INFPROT_XMOTIVO" = ?, ' +
        ' "DTULTALTERACAO" = ?, ' +
        ' "STELETRONICOENVIADO" = ?, ' +
        ' "JSONELETRONICO" = ?, ' +
        ' "STALTERADA" = ?, ' +
        ' "IDMOVIMENTOCAIXAWEB" = ? ' + 
    	' WHERE "IDRESUMOVENDAWEB" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDCAIXAWEB);
        pStmt.setInt(2, registro.IDOPERADOR);
        pStmt.setInt(3, registro.IDRESUMOVENDALOCAL);
        pStmt.setInt(4, registro.IDEMPRESA);
        pStmt.setDate(5, registro.DTHORAABERTURA);
        pStmt.setInt(6, registro.NUTOTALITENS);
        pStmt.setString(7, registro.NUCPFCLIENTE);
        pStmt.setFloat(8, registro.VRTOTALITENS);
        pStmt.setFloat(9, registro.VRTOTALDESCONTO);
        pStmt.setFloat(10, registro.VRTOTALVENDA);
        pStmt.setFloat(11, registro.VRRECDINHEIRO);
        pStmt.setFloat(12, registro.VRRECCARTAO);
        pStmt.setFloat(13, registro.VRRECCONVENIO);
        pStmt.setFloat(14, registro.VRRECCHEQUE);
        pStmt.setFloat(15, registro.VRRECPOS);
        pStmt.setFloat(16, registro.VRRECVOUCHER);
        pStmt.setFloat(17, registro.VRTOTALPAGO);
        pStmt.setFloat(18, registro.VRTROCO);
        pStmt.setDate(19, registro.DTHORAFECHAMENTO);
        pStmt.setString(20, registro.STATIVO);
        pStmt.setString(21, registro.STCANCELADO);
        pStmt.setInt(22, registro.IDUSUARIOCANCELAMENTO);
        pStmt.setString(23, registro.TXTMOTIVOCANCELAMENTO);
        pStmt.setString(24, registro.STCONTINGENCIA);
        pStmt.setDate(25, registro.DTENVIOONTINGENCIA);
        pStmt.setString(26, registro.NUAUTPOS);
        pStmt.setString(27, registro.INFNFE_ID);
        pStmt.setString(28, registro.INFNFE_VERSAO);
        pStmt.setInt(29, registro.INFNFE_CUF);
        pStmt.setInt(30, registro.INFNFE_CNF);
        pStmt.setString(31, registro.INFNFE_NATOP);
        pStmt.setInt(32, registro.INFNFE_MOD);
        pStmt.setInt(33, registro.INFNFE_SERIE);
        pStmt.setInt(34, registro.INFNFE_NNF);
        pStmt.setString(35, registro.INFNFE_DHEMI);
        pStmt.setInt(36, registro.INFNFE_TPNF);
        pStmt.setInt(37, registro.INFNFE_IDDEST);
        pStmt.setInt(38, registro.INFNFE_CMUNFG);
        pStmt.setInt(39, registro.INFNFE_TPIMP);
        pStmt.setInt(40, registro.INFNFE_TPEMIS);
        pStmt.setInt(41, registro.INFNFE_CDV);
        pStmt.setInt(42, registro.INFNFE_TPAMB);
        pStmt.setInt(43, registro.INFNFE_FINNFE);
        pStmt.setInt(44, registro.INFNFE_INDFINAL);
        pStmt.setInt(45, registro.INFNFE_INDPRES);
        pStmt.setInt(46, registro.INFNFE_PROCEMI);
        pStmt.setString(47, registro.INFNFE_VERPROC);
        pStmt.setFloat(48, registro.ICMSTOT_VBC);
        pStmt.setFloat(49, registro.ICMSTOT_VICMS);
        pStmt.setFloat(50, registro.ICMSTOT_VICMSDESON);
        pStmt.setFloat(51, registro.ICMSTOT_VFCP);
        pStmt.setFloat(52, registro.ICMSTOT_VBCST);
        pStmt.setFloat(53, registro.ICMSTOT_VST);
        pStmt.setFloat(54, registro.ICMSTOT_VFCPST);
        pStmt.setFloat(55, registro.ICMSTOT_VFCPSTRET);
        pStmt.setFloat(56, registro.ICMSTOT_VPROD);
        pStmt.setFloat(57, registro.ICMSTOT_VFRETE);
        pStmt.setFloat(58, registro.ICMSTOT_VSEG);
        pStmt.setFloat(59, registro.ICMSTOT_VDESC);
        pStmt.setFloat(60, registro.ICMSTOT_VII);
        pStmt.setFloat(61, registro.ICMSTOT_VIPI);
        pStmt.setFloat(62, registro.ICMSTOT_VIPIDEVOL);
        pStmt.setFloat(63, registro.ICMSTOT_VPIS);
        pStmt.setFloat(64, registro.ICMSTOT_VCOFINS);
        pStmt.setFloat(65, registro.ICMSTOT_VOUTRO);
        pStmt.setFloat(66, registro.ICMSTOT_VNF);
        pStmt.setInt(67, registro.MODFRETE);
        pStmt.setString(68, registro.INFCPL);
        pStmt.setString(69, registro.INFPROT_ID);
        pStmt.setInt(70, registro.INFPROT_TPAMB);
        pStmt.setString(71, registro.INFPROT_VERAPLIC);
        pStmt.setString(72, registro.INFPROT_CHNFE);
        pStmt.setString(73, registro.INFPROT_DHRECBTO);
        pStmt.setString(74, registro.INFPROT_NPROT);
        pStmt.setString(75, registro.INFPROT_DIGVAL);
        pStmt.setInt(76, registro.INFPROT_CSTAT);
        pStmt.setString(77, registro.INFPROT_XMOTIVO);
        pStmt.setDate(78, registro.DTULTALTERACAO);
        pStmt.setString(79, registro.STELETRONICOENVIADO);
        pStmt.setString(80, registro.JSONELETRONICO);
        pStmt.setString(81, registro.STALTERADA);
        pStmt.setInt(82, registro.IDMOVIMENTOCAIXAWEB);
    	pStmt.setInt(83, registro.IDRESUMOVENDAWEB);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOVENDA" ' +
		" ( " +
		' "IDRESUMOVENDAWEB", ' +
        ' "IDCAIXAWEB", ' +
        ' "IDOPERADOR", ' +
        ' "IDRESUMOVENDALOCAL", ' +
        ' "IDEMPRESA", ' +
        ' "DTHORAABERTURA", ' +
        ' "NUTOTALITENS", ' +
        ' "NUCPFCLIENTE", ' +
        ' "VRTOTALITENS", ' +
        ' "VRTOTALDESCONTO", ' +
        ' "VRTOTALVENDA", ' +
        ' "VRRECDINHEIRO", ' +
        ' "VRRECCARTAO", ' +
        ' "VRRECCONVENIO", ' +
        ' "VRRECCHEQUE", ' +
        ' "VRRECPOS", ' +
        ' "VRRECVOUCHER", ' +
        ' "VRTOTALPAGO", ' +
        ' "VRTROCO", ' +
        ' "DTHORAFECHAMENTO", ' +
        ' "STATIVO", ' +
        ' "STCANCELADO", ' +
        ' "IDUSUARIOCANCELAMENTO", ' +
        ' "TXTMOTIVOCANCELAMENTO", ' +
        ' "STCONTINGENCIA", ' +
        ' "DTENVIOONTINGENCIA", ' +
        ' "NUAUTPOS", ' +
        ' "INFNFE_@ID", ' +
        ' "INFNFE_@VERSAO", ' +
        ' "INFNFE_CUF", ' +
        ' "INFNFE_CNF", ' +
        ' "INFNFE_NATOP", ' +
        ' "INFNFE_MOD", ' +
        ' "INFNFE_SERIE", ' +
        ' "INFNFE_NNF", ' +
        ' "INFNFE_DHEMI", ' +
        ' "INFNFE_TPNF", ' +
        ' "INFNFE_IDDEST", ' +
        ' "INFNFE_CMUNFG", ' +
        ' "INFNFE_TPIMP", ' +
        ' "INFNFE_TPEMIS", ' +
        ' "INFNFE_CDV", ' +
        ' "INFNFE_TPAMB", ' +
        ' "INFNFE_FINNFE", ' +
        ' "INFNFE_INDFINAL", ' +
        ' "INFNFE_INDPRES", ' +
        ' "INFNFE_PROCEMI", ' +
        ' "INFNFE_VERPROC", ' +
        ' "ICMSTOT_VBC", ' +
        ' "ICMSTOT_VICMS", ' +
        ' "ICMSTOT_VICMSDESON", ' +
        ' "ICMSTOT_VFCP", ' +
        ' "ICMSTOT_VBCST", ' +
        ' "ICMSTOT_VST", ' +
        ' "ICMSTOT_VFCPST", ' +
        ' "ICMSTOT_VFCPSTRET", ' +
        ' "ICMSTOT_VPROD", ' +
        ' "ICMSTOT_VFRETE", ' +
        ' "ICMSTOT_VSEG", ' +
        ' "ICMSTOT_VDESC", ' +
        ' "ICMSTOT_VII", ' +
        ' "ICMSTOT_VIPI", ' +
        ' "ICMSTOT_VIPIDEVOL", ' +
        ' "ICMSTOT_VPIS", ' +
        ' "ICMSTOT_VCOFINS", ' +
        ' "ICMSTOT_VOUTRO", ' +
        ' "ICMSTOT_VNF", ' +
        ' "MODFRETE", ' +
        ' "INFCPL", ' +
        ' "INFPROT_@ID", ' +
        ' "INFPROT_TPAMB", ' +
        ' "INFPROT_VERAPLIC", ' +
        ' "INFPROT_CHNFE", ' +
        ' "INFPROT_DHRECBTO", ' +
        ' "INFPROT_NPROT", ' +
        ' "INFPROT_DIGVAL", ' +
        ' "INFPROT_CSTAT", ' +
        ' "INFPROT_XMOTIVO", ' +
        ' "DTULTALTERACAO", ' +
        ' "STELETRONICOENVIADO", ' +
        ' "JSONELETRONICO", ' +
        ' "STALTERADA", ' +
        ' "IDMOVIMENTOCAIXAWEB" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_RESUMOVENDA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,)';
		query = query + '?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDCAIXAWEB);
        pStmt.setInt(2, registro.IDOPERADOR);
        pStmt.setInt(3, registro.IDRESUMOVENDALOCAL);
        pStmt.setInt(4, registro.IDEMPRESA);
        pStmt.setDate(5, registro.DTHORAABERTURA);
        pStmt.setInt(6, registro.NUTOTALITENS);
        pStmt.setString(7, registro.NUCPFCLIENTE);
        pStmt.setFloat(8, registro.VRTOTALITENS);
        pStmt.setFloat(9, registro.VRTOTALDESCONTO);
        pStmt.setFloat(10, registro.VRTOTALVENDA);
        pStmt.setFloat(11, registro.VRRECDINHEIRO);
        pStmt.setFloat(12, registro.VRRECCARTAO);
        pStmt.setFloat(13, registro.VRRECCONVENIO);
        pStmt.setFloat(14, registro.VRRECCHEQUE);
        pStmt.setFloat(15, registro.VRRECPOS);
        pStmt.setFloat(16, registro.VRRECVOUCHER);
        pStmt.setFloat(17, registro.VRTOTALPAGO);
        pStmt.setFloat(18, registro.VRTROCO);
        pStmt.setDate(19, registro.DTHORAFECHAMENTO);
        pStmt.setString(20, registro.STATIVO);
        pStmt.setString(21, registro.STCANCELADO);
        pStmt.setInt(22, registro.IDUSUARIOCANCELAMENTO);
        pStmt.setString(23, registro.TXTMOTIVOCANCELAMENTO);
        pStmt.setString(24, registro.STCONTINGENCIA);
        pStmt.setDate(25, registro.DTENVIOONTINGENCIA);
        pStmt.setString(26, registro.NUAUTPOS);
        pStmt.setString(27, registro.INFNFE_ID);
        pStmt.setString(28, registro.INFNFE_VERSAO);
        pStmt.setInt(29, registro.INFNFE_CUF);
        pStmt.setInt(30, registro.INFNFE_CNF);
        pStmt.setString(31, registro.INFNFE_NATOP);
        pStmt.setInt(32, registro.INFNFE_MOD);
        pStmt.setInt(33, registro.INFNFE_SERIE);
        pStmt.setInt(34, registro.INFNFE_NNF);
        pStmt.setString(35, registro.INFNFE_DHEMI);
        pStmt.setInt(36, registro.INFNFE_TPNF);
        pStmt.setInt(37, registro.INFNFE_IDDEST);
        pStmt.setInt(38, registro.INFNFE_CMUNFG);
        pStmt.setInt(39, registro.INFNFE_TPIMP);
        pStmt.setInt(40, registro.INFNFE_TPEMIS);
        pStmt.setInt(41, registro.INFNFE_CDV);
        pStmt.setInt(42, registro.INFNFE_TPAMB);
        pStmt.setInt(43, registro.INFNFE_FINNFE);
        pStmt.setInt(44, registro.INFNFE_INDFINAL);
        pStmt.setInt(45, registro.INFNFE_INDPRES);
        pStmt.setInt(46, registro.INFNFE_PROCEMI);
        pStmt.setString(47, registro.INFNFE_VERPROC);
        pStmt.setFloat(48, registro.ICMSTOT_VBC);
        pStmt.setFloat(49, registro.ICMSTOT_VICMS);
        pStmt.setFloat(50, registro.ICMSTOT_VICMSDESON);
        pStmt.setFloat(51, registro.ICMSTOT_VFCP);
        pStmt.setFloat(52, registro.ICMSTOT_VBCST);
        pStmt.setFloat(53, registro.ICMSTOT_VST);
        pStmt.setFloat(54, registro.ICMSTOT_VFCPST);
        pStmt.setFloat(55, registro.ICMSTOT_VFCPSTRET);
        pStmt.setFloat(56, registro.ICMSTOT_VPROD);
        pStmt.setFloat(57, registro.ICMSTOT_VFRETE);
        pStmt.setFloat(58, registro.ICMSTOT_VSEG);
        pStmt.setFloat(59, registro.ICMSTOT_VDESC);
        pStmt.setFloat(60, registro.ICMSTOT_VII);
        pStmt.setFloat(61, registro.ICMSTOT_VIPI);
        pStmt.setFloat(62, registro.ICMSTOT_VIPIDEVOL);
        pStmt.setFloat(63, registro.ICMSTOT_VPIS);
        pStmt.setFloat(64, registro.ICMSTOT_VCOFINS);
        pStmt.setFloat(65, registro.ICMSTOT_VOUTRO);
        pStmt.setFloat(66, registro.ICMSTOT_VNF);
        pStmt.setInt(67, registro.MODFRETE);
        pStmt.setString(68, registro.INFCPL);
        pStmt.setString(69, registro.INFPROT_ID);
        pStmt.setInt(70, registro.INFPROT_TPAMB);
        pStmt.setString(71, registro.INFPROT_VERAPLIC);
        pStmt.setString(72, registro.INFPROT_CHNFE);
        pStmt.setString(73, registro.INFPROT_DHRECBTO);
        pStmt.setString(74, registro.INFPROT_NPROT);
        pStmt.setString(75, registro.INFPROT_DIGVAL);
        pStmt.setInt(76, registro.INFPROT_CSTAT);
        pStmt.setString(77, registro.INFPROT_XMOTIVO);
        pStmt.setDate(78, registro.DTULTALTERACAO);
        pStmt.setString(79, registro.STELETRONICOENVIADO);
        pStmt.setString(80, registro.JSONELETRONICO);
        pStmt.setString(81, registro.STALTERADA);
        pStmt.setInt(82, registro.IDMOVIMENTOCAIXAWEB);
    	
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
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
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
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}