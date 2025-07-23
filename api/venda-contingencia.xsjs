var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function fnAtualizarXml(conn, vIdvenda, vXml){
    var query = 'UPDATE "VAR_DB_NAME"."VENDAXML" SET ' +
			   	' "XML" = ?  ' + 
    	        ' WHERE "IDVENDA" =  ? ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1,vXml);
    pStmt.setString(2, vIdvenda);
    	
    pStmt.execute();

	pStmt.close();

	conn.commit();
}

function fnHandlePut() {
	var conn = $.db.getConnection();
	
	try {
		var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ' +
			' "IDCAIXAWEB" = ?, ' +
			' "IDOPERADOR" = ?, ' +
			' "IDEMPRESA" = ?, ' +
			' "DTHORAABERTURA" = ?, ' +
			' "VRRECDINHEIRO" = ?, ' +
			' "VRRECCARTAO" = ?, ' +
			' "VRRECCONVENIO" = ?, ' +
			' "VRRECCHEQUE" = ?, ' +
			' "VRRECPOS" = ?, ' +
			' "VRRECVOUCHER" = ?, ' +
			' "VRTOTALPAGO" = ?, ' +
			' "VRTROCO" = ?, ' +
			' "VRTOTALVENDA" = ?, ' +
			' "DTHORAFECHAMENTO" = ?, ' +
			' "STATIVO" = ?, ' +
			' "STCANCELADO" = ?, ' +
			' "IDUSUARIOCANCELAMENTO" = ?, ' +
			' "TXTMOTIVOCANCELAMENTO" = ?, ' +
			' "STCONTINGENCIA" = ?, ' +
			' "DTENVIOONTINGENCIA" = ?, ' +
			' "NUAUTPOS" = ?, ' +
			' "NFE_INFNFE_ID" = ?, ' +
			' "NFE_INFNFE_VERSAO" = ?, ' +
			' "NFE_INFNFE_IDE_CUF" = ?, ' +
			' "NFE_INFNFE_IDE_CNF" = ?, ' +
			' "NFE_INFNFE_IDE_NATOP" = ?, ' +
			' "NFE_INFNFE_IDE_MOD" = ?, ' +
			' "NFE_INFNFE_IDE_SERIE" = ?, ' +
			' "NFE_INFNFE_IDE_NNF" = ?, ' +
			' "NFE_INFNFE_IDE_DHEMI" = ?, ' +
			' "NFE_INFNFE_IDE_TPNF" = ?, ' +
			' "NFE_INFNFE_IDE_IDDEST" = ?, ' +
			' "NFE_INFNFE_IDE_CMUNFG" = ?, ' +
			' "NFE_INFNFE_IDE_TPIMP" = ?, ' +
			' "NFE_INFNFE_IDE_TPEMIS" = ?, ' +
			' "NFE_INFNFE_IDE_CDV" = ?, ' +
			' "NFE_INFNFE_IDE_TPAMB" = ?, ' +
			' "NFE_INFNFE_IDE_FINNFE" = ?, ' +
			' "NFE_INFNFE_IDE_INDFINAL" = ?, ' +
			' "NFE_INFNFE_IDE_INDPRES" = ?, ' +
			' "NFE_INFNFE_IDE_PROCEMI" = ?, ' +
			' "NFE_INFNFE_IDE_VERPROC" = ?, ' +
			' "NFE_INFNFE_EMIT_CNPJ" = ?, ' +
			' "NFE_INFNFE_EMIT_NOME" = ?, ' +
			' "NFE_INFNFE_EMIT_FANT" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_XLGR" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_NRO" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_CMUN" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_XMUN" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_UF" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_CEP" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_CPAIS" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_XPAIS" = ?, ' +
			' "NFE_INFNFE_EMIT_ENDEREMIT_FONE" = ?, ' +
			' "NFE_INFNFE_EMIT_IE" = ?, ' +
			' "NFE_INFNFE_EMIT_CRT" = ?, ' +
			' "NFE_INFNFE_AUTXML_CNPJ" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VBC" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VICMS" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VFCP" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VBCST" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VST" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VFCPST" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VPROD" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VFRETE" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VSEG" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VDESC" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VII" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VIPI" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VPIS" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VCOFINS" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO" = ?, ' +
			' "NFE_INFNFE_TOTAL_ICMSTOT_VNF" = ?, ' +
			' "NFE_INFNFE_TRANSP_MODFRETE" = ?, ' +
			' "NFE_INFNFE_INFADIC_INFCPL" = ?, ' +
			' "NFE_INFNFESUPL_QRCODE" = ?, ' +
			' "NFE_INFNFESUPL_URLCHAVE" = ?, ' +
			' "PROTNFE_VERSAO" = ?, ' +
			' "PROTNFE_INFPROT_ID" = ?, ' +
			' "PROTNFE_INFPROT_TPAMB" = ?, ' +
			' "PROTNFE_INFPROT_VERAPLIC" = ?, ' +
			' "PROTNFE_INFPROT_CHNFE" = ?, ' +
			' "PROTNFE_INFPROT_DHRECBTO" = ?, ' +
			' "PROTNFE_INFPROT_NPROT" = ?, ' +
			' "PROTNFE_INFPROT_DIGVAL" = ?, ' +
			' "PROTNFE_INFPROT_CSTAT" = ?, ' +
			' "PROTNFE_INFPROT_XMOTIVO" = ?, ' +
			' "DTULTALTERACAO" = ?, ' +
			' "STELETRONICOENVIADO" = ?, ' +
			' "JSONELETRONICO" = ?, ' +
			' "STALTERADA" = ?, ' +
			' "IDMOVIMENTOCAIXAWEB" = ?, ' +
			' "DEST_CNPJ" = ?, ' +
			' "DEST_CPF"  = ?, ' +
			' "TXTMOTIVODESCONTO" = ? ' +
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
			' WHERE "IDVENDA" =  ? ';
			
		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {
            
            var data = [];
			var registro = bodyJson[i];
			
			pStmt.setInt(1, registro.IDCAIXAWEB);
			pStmt.setInt(2, registro.IDOPERADOR);
			pStmt.setInt(3, registro.IDEMPRESA);
			setTimestampOrNull(pStmt,4, registro.DTHORAABERTURA);
			pStmt.setFloat(5, registro.VRRECDINHEIRO);
			pStmt.setFloat(6, registro.VRRECCARTAO);
			pStmt.setFloat(7, registro.VRRECCONVENIO);
			pStmt.setFloat(8, registro.VRRECCHEQUE);
			pStmt.setFloat(9, registro.VRRECPOS);
			pStmt.setFloat(10, registro.VRRECVOUCHER);
			pStmt.setFloat(11, registro.VRTOTALPAGO);
			pStmt.setFloat(12, registro.VRTROCO);
			pStmt.setFloat(13, registro.VRTOTALVENDA);
			setTimestampOrNull(pStmt, 14, registro.DTHORAFECHAMENTO);
			pStmt.setString(15, registro.STATIVO);
			pStmt.setString(16, registro.STCANCELADO);
			setIntOrNull(pStmt, 17, registro.IDUSUARIOCANCELAMENTO);
			pStmt.setString(18, registro.TXTMOTIVOCANCELAMENTO);
			pStmt.setString(19, registro.STCONTINGENCIA);
			setTimestampOrNull(pStmt, 20, registro.DTENVIOONTINGENCIA);
			pStmt.setString(21, registro.NUAUTPOS);

			pStmt.setString(22, registro.NFe.infNFe["@Id"]);
			pStmt.setString(23, registro.NFe.infNFe["@versao"]);
			pStmt.setString(24, registro.NFe.infNFe.ide.cUF);
			pStmt.setString(25, registro.NFe.infNFe.ide.cNF);
			pStmt.setString(26, registro.NFe.infNFe.ide.natOp);
			pStmt.setString(27, registro.NFe.infNFe.ide.mod);
			pStmt.setString(28, registro.NFe.infNFe.ide.serie);
			pStmt.setString(29, registro.NFe.infNFe.ide.nNF);
			pStmt.setString(30, registro.NFe.infNFe.ide.dhEmi);
			pStmt.setString(31, registro.NFe.infNFe.ide.tpNF);
			pStmt.setString(32, registro.NFe.infNFe.ide.idDest);
			pStmt.setString(33, registro.NFe.infNFe.ide.cMunFG);
			pStmt.setString(34, registro.NFe.infNFe.ide.tpImp);
			pStmt.setString(35, registro.NFe.infNFe.ide.tpEmis);
			pStmt.setString(36, registro.NFe.infNFe.ide.cDV);
			pStmt.setString(37, registro.NFe.infNFe.ide.tpAmb);
			pStmt.setString(38, registro.NFe.infNFe.ide.finNFe);
			pStmt.setString(39, registro.NFe.infNFe.ide.indFinal);
			pStmt.setString(40, registro.NFe.infNFe.ide.indPres);
			pStmt.setString(41, registro.NFe.infNFe.ide.procEmi);
			pStmt.setString(42, registro.NFe.infNFe.ide.verProc);

			pStmt.setString(43, registro.NFe.infNFe.emit.CNPJ);
			pStmt.setString(44, registro.NFe.infNFe.emit.xNome);
			pStmt.setString(45, registro.NFe.infNFe.emit.xFant);
			pStmt.setString(46, registro.NFe.infNFe.emit.enderEmit.xLgr);
			pStmt.setString(47, registro.NFe.infNFe.emit.enderEmit.nro);
			pStmt.setString(48, registro.NFe.infNFe.emit.enderEmit.xBairro);
			pStmt.setString(49, registro.NFe.infNFe.emit.enderEmit.cMun);
			pStmt.setString(50, registro.NFe.infNFe.emit.enderEmit.xMun);
			pStmt.setString(51, registro.NFe.infNFe.emit.enderEmit.UF);
			pStmt.setString(52, registro.NFe.infNFe.emit.enderEmit.CEP);
			pStmt.setString(53, registro.NFe.infNFe.emit.enderEmit.cPais);
			pStmt.setString(54, registro.NFe.infNFe.emit.enderEmit.xPais);
			pStmt.setString(55, registro.NFe.infNFe.emit.enderEmit.fone);
			pStmt.setString(56, registro.NFe.infNFe.emit.IE);
			pStmt.setString(57, registro.NFe.infNFe.emit.CRT);

			pStmt.setString(58, (registro.NFe.infNFe.autXML || { CNPJ : "" }).CNPJ);

			pStmt.setFloat(59, registro.NFe.infNFe.total.ICMSTot.vBC);
			pStmt.setFloat(60, registro.NFe.infNFe.total.ICMSTot.vICMS);
			pStmt.setFloat(61, registro.NFe.infNFe.total.ICMSTot.vICMSDeson);
			pStmt.setFloat(62, registro.NFe.infNFe.total.ICMSTot.vFCP);
			pStmt.setFloat(63, registro.NFe.infNFe.total.ICMSTot.vBCST);
			pStmt.setFloat(64, registro.NFe.infNFe.total.ICMSTot.vST);
			pStmt.setFloat(65, registro.NFe.infNFe.total.ICMSTot.vFCPST);
			pStmt.setFloat(66, registro.NFe.infNFe.total.ICMSTot.vFCPSTRet);
			pStmt.setFloat(67, registro.NFe.infNFe.total.ICMSTot.vProd);
			pStmt.setFloat(68, registro.NFe.infNFe.total.ICMSTot.vFrete);
			pStmt.setFloat(69, registro.NFe.infNFe.total.ICMSTot.vSeg);
			pStmt.setFloat(70, registro.NFe.infNFe.total.ICMSTot.vDesc);
			pStmt.setFloat(71, registro.NFe.infNFe.total.ICMSTot.vII);
			pStmt.setFloat(72, registro.NFe.infNFe.total.ICMSTot.vIPI);
			pStmt.setFloat(73, registro.NFe.infNFe.total.ICMSTot.vIPIDevol);
			pStmt.setFloat(74, registro.NFe.infNFe.total.ICMSTot.vPIS);
			pStmt.setFloat(75, registro.NFe.infNFe.total.ICMSTot.vCOFINS);
			pStmt.setFloat(76, registro.NFe.infNFe.total.ICMSTot.vOutro);
			pStmt.setFloat(77, registro.NFe.infNFe.total.ICMSTot.vNF);

			pStmt.setString(78, registro.NFe.infNFe.transp.modFrete);
			pStmt.setString(79, registro.NFe.infNFe.infAdic.infCpl);

			pStmt.setString(80, registro.NFe.infNFeSupl.qrCode);
			pStmt.setString(81, registro.NFe.infNFeSupl.urlChave);

			pStmt.setString(82, registro.protNFe["@versao"]);
			pStmt.setString(83, registro.protNFe.infProt["@Id"]);
			pStmt.setString(84, registro.protNFe.infProt.tpAmb);
			pStmt.setString(85, registro.protNFe.infProt.verAplic);
			pStmt.setString(86, registro.protNFe.infProt.chNFe);
			pStmt.setString(87, registro.protNFe.infProt.dhRecbto);
			pStmt.setString(88, registro.protNFe.infProt.nProt);
			pStmt.setString(89, registro.protNFe.infProt.digVal);
			pStmt.setString(90, registro.protNFe.infProt.cStat);
			pStmt.setString(91, registro.protNFe.infProt.xMotivo);

			setTimestampOrNull(pStmt, 92, registro.DTULTALTERACAO);
			pStmt.setString(93, registro.STELETRONICOENVIADO);
			pStmt.setString(94, registro.JSONELETRONICO);
			pStmt.setString(95, registro.STALTERADA);
			pStmt.setString(96, registro.IDMOVIMENTOCAIXAWEB);
			pStmt.setString(97, (registro.NFe.infNFe.dest || { CNPJ : "" }).CNPJ);
			pStmt.setString(98, (registro.NFe.infNFe.dest || { CPF : "" }).CPF);
			pStmt.setString(99, registro.TXTMOTIVODESCONTO);
		
		    pStmt.setString(100, registro.IDVENDA);

			pStmt.execute();
			fnAtualizarXml(conn, registro.IDVENDA, registro.xml.nfXml);
		}

		pStmt.close();

		conn.commit();

		return {
			"msg": "Atualização realizada com sucesso!"
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