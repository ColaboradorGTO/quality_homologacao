var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
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

function setFloatOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setFloat(fieldId, value);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDADETALHE" SET ' + 
        ' "STTROCA" = ?, ' +
        ' "IDVOUCHER" = ? ' +
    	' WHERE "IDVENDADETALHE" =  ? ';
    
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString());

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
        var queryDetalhe = `
            SELECT
                *
            FROM
                "VAR_DB_NAME".VENDADETALHE
            WHERE 
                IDVENDADETALHE = ?
        `;
        
        var detalheVenda = api.sqlQuery(queryDetalhe,registro.IDVENDADETALHE);
        var Tamanho = [];

        if(detalheVenda[0]['QTD'] == registro.QTD){
             pStmt.setString(1, registro.STTROCA);
             pStmt.setInt(2, registro.IDVOUCHER);
             pStmt.setString(3, registro.IDVENDADETALHE);
    
             pStmt.execute();
             //pStmt.close();
             
             conn.commit();
            
        }else{
            var query2 = `INSERT INTO "VAR_DB_NAME"."VENDADETALHE"
            	(
            	IDVENDADETALHE,
            	IDVENDA,
            	NITEM,
            	CPROD,
            	CEAN,
            	XPROD,
            	NCM,
            	EXTIPI,
            	CFOP,
            	UCOM,
            	QCOM,
            	VUNCOM,
            	VPROD,
            	CEANTRIB,
            	UTRIB,
            	QTRIB,
            	VUNTRIB,
            	VFRETE,
            	VSEG,
            	VDESC,
            	VOUTRO,
            	INDTOT,
            	XPED,
            	NITEMPED,
            	VTOTTRIB,
            	ICMS_ORIG,
            	ICMS_CST,
            	ICMS_MODBC,
            	ICMS_VBC,
            	ICMS_PREDBC,
            	ICMS_PICMS,
            	ICMS_VICMS,
            	ICMS_VICMSDESON,
            	ICMS_MODBCST,
            	ICMS_PMVAST,
            	ICMS_PREDBCST,
            	ICMS_VBCST,
            	ICMS_PICMSST,
            	ICMS_VICMSST,
            	ICMS_MOTDESICMS,
            	ICMS_PBCOP,
            	ICMS_UFST,
            	ICMS_VBCSTRET,
            	ICMS_VICMSSTRET,
            	ICMS_VBCSTDEST,
            	ICMS_VICSMSTDEST,
            	ICMS_CSOSN,
            	ICMS_PCREDSN,
            	ICMS_VCREDICMSSN,
            	ICMSUFDEST_PFCPUFDEST,
            	ICMSUFDEST_VBCUFDEST,
            	ICMSUFDEST_PICMSUFDEST,
            	ICMSUFDEST_PICMSINTER,
            	ICMSUFDEST_PICMSINTERPART,
            	ICMSUFDEST_VFCPUFDEST,
            	ICMSUFDEST_VICMSUFDEST,
            	ICMSUFDEST_VICMSUFREMET,
            	IPI_CLENQ,
            	IPI_CNPJPROD,
            	IPI_CSELO,
            	IPI_QSELO,
            	IPI_CENQ,
            	IPI_CST,
            	IPI_VBC,
            	IPI_PIPI,
            	IPI_QUNID,
            	IPI_VUNID,
            	IPI_VIPI,
            	II_VBC,
            	II_VDESPADU,
            	II_VII,
            	II_VIOF,
            	ISSQN_VBC,
            	ISSQN_VALIQ,
            	ISSQN_VISSQN,
            	ISSQN_CMUNFG,
            	ISSQN_CLISTSERV,
            	ISSQN_CSITTRIB,
            	PIS_CST,
            	PIS_VBC,
            	PIS_PPIS,
            	PIS_VPIS,
            	PIS_QBCPROD,
            	PIS_VALIQPROD,
            	PISST_VBC,
            	PISST_PPIS,
            	PISST_VPIS,
            	PISST_QBCPROD,
            	PISST_VALIQPROD,
            	COFINS_CST,
            	COFINS_VBC,
            	COFINS_PCOFINS,
            	COFINS_VCOFINS,
            	COFINS_QBCPROD,
            	COFINS_VALIQPROD,
            	COFINSST_VBC,
            	COFINSST_PCOFINS,
            	COFINSST_VCOFINS,
            	COFINSST_QBCPROD,
            	COFINSST_VALIQPROD,
            	INFADPROD,
            	VENDEDOR_MATRICULA,
            	VENDEDOR_NOME,
            	VENDEDOR_CPF,
            	STCANCELADO,
            	VRTOTALLIQUIDO,
            	QTD,
            	STVENDIGITAL,
            	FROM_MYSQL,
            	STTROCA,
            	IDUSRDESCONTO
            	)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

            
            var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
            var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("NITEM")), 0) + 1 FROM "VAR_DB_NAME"."VENDADETALHE" WHERE IDVENDA = ? ', detalheVenda[0].IDVENDA);
            var nitem = queryId;
            
            queryId = `${detalheVenda[0].IDVENDA}-${queryId}`;
            
			pStmt2.setString(1, queryId);
			pStmt2.setString(2, detalheVenda[0].IDVENDA);
			pStmt2.setInt(3, +(nitem));
			pStmt2.setString(4, detalheVenda[0].CPROD);
			pStmt2.setString(5, detalheVenda[0].CEAN);
			pStmt2.setString(6, detalheVenda[0].XPROD);
			pStmt2.setString(7, detalheVenda[0].NCM);
			setStringOrNull(pStmt2, 8, detalheVenda[0].EXTIPI);
			pStmt2.setString(9, detalheVenda[0].CFOP);
			pStmt2.setString(10, detalheVenda[0].UCOM);
			pStmt2.setFloat(11, +(detalheVenda[0].QCOM - registro.QTD));
			pStmt2.setFloat(12, +(detalheVenda[0].VUNCOM));
			pStmt2.setFloat(13, +(detalheVenda[0].VPROD - registro.VRTOTALBRUTO));
			pStmt2.setString(14, detalheVenda[0].CEANTRIB);
			pStmt2.setString(15, detalheVenda[0].UTRIB);
			pStmt2.setFloat(16, +(detalheVenda[0].QTRIB - registro.QTD));
			pStmt2.setFloat(17, +(detalheVenda[0].VUNTRIB));
			setFloatOrNull(pStmt2, 18, +(detalheVenda[0].VFRETE));
			setFloatOrNull(pStmt2, 19, +(detalheVenda[0].VSEG));
			setFloatOrNull(pStmt2, 20, +(detalheVenda[0].VDESC - registro.VDESC));
			setFloatOrNull(pStmt2, 21, +(detalheVenda[0].VOUTRO));
			pStmt2.setInt(22, detalheVenda[0].INDTOT);
			setStringOrNull(pStmt2, 23, detalheVenda[0].XPED);
			setStringOrNull(pStmt2, 24, detalheVenda[0].NITEMPED);
			setFloatOrNull(pStmt2, 25, detalheVenda[0].VTOTTRIB);
			setIntOrNull(pStmt2, 26, +(detalheVenda[0].ICMS_ORIG));
			pStmt2.setString(27, detalheVenda[0].ICMS_CST);
			pStmt2.setInt(28, +(detalheVenda[0].ICMS_MODBC));
			pStmt2.setFloat(29, +(detalheVenda[0].ICMS_VBC - registro.VRTOTALLIQUIDO));
			setFloatOrNull(pStmt2, 30, detalheVenda[0].ICMS_PREDBC);
			pStmt2.setFloat(31, +(detalheVenda[0].ICMS_PICMS));
			pStmt2.setFloat(32, +(detalheVenda[0].ICMS_VICMS));
			setFloatOrNull(pStmt2, 33, detalheVenda[0].ICMS_VICMSDESON);
			setIntOrNull(pStmt2, 34, detalheVenda[0].ICMS_MODBCST);
			setFloatOrNull(pStmt2, 35, detalheVenda[0].ICMS_PMVAST);
			setFloatOrNull(pStmt2, 36, detalheVenda[0].ICMS_PREDBCST);
			setFloatOrNull(pStmt2, 37, detalheVenda[0].ICMS_VBCST);
			setFloatOrNull(pStmt2, 38, detalheVenda[0].ICMS_PICMSST);
			setFloatOrNull(pStmt2, 39, detalheVenda[0].ICMS_VICMSST);
			setIntOrNull(pStmt2, 40, detalheVenda[0].ICMS_MOTDESICMS);
			setFloatOrNull(pStmt2, 41, detalheVenda[0].ICMS_PBCOP);
			setStringOrNull(pStmt2, 42, detalheVenda[0].ICMS_UFST);
			setFloatOrNull(pStmt2, 43, detalheVenda[0].ICMS_VBCSTRET);
			setFloatOrNull(pStmt2, 44, detalheVenda[0].ICMS_VICMSSTRET);
			setFloatOrNull(pStmt2, 45, detalheVenda[0].ICMS_VBCSTDEST);
			setFloatOrNull(pStmt2, 46, detalheVenda[0].ICMS_VICSMSTDEST);
			setStringOrNull(pStmt2, 47, detalheVenda[0].ICMS_CSOSN);
			setFloatOrNull(pStmt2, 48, detalheVenda[0].ICMS_PCREDSN);
			setFloatOrNull(pStmt2, 49, detalheVenda[0].ICMS_VCREDICMSSN);
			setFloatOrNull(pStmt2, 50, detalheVenda[0].ICMSUFDEST_PFCPUFDEST);
			setFloatOrNull(pStmt2, 51, detalheVenda[0].ICMSUFDEST_VBCUFDEST);
			setFloatOrNull(pStmt2, 52, detalheVenda[0].ICMSUFDEST_PICMSUFDEST);
			setStringOrNull(pStmt2, 53, detalheVenda[0].ICMSUFDEST_PICMSINTER);
			setFloatOrNull(pStmt2, 54, detalheVenda[0].ICMSUFDEST_PICMSINTERPART);
			setFloatOrNull(pStmt2, 55, detalheVenda[0].ICMSUFDEST_VFCPUFDEST);
			setFloatOrNull(pStmt2, 56, detalheVenda[0].ICMSUFDEST_VICMSUFDEST);
			setFloatOrNull(pStmt2, 57, detalheVenda[0].ICMSUFDEST_VICMSUFREMET);
			setStringOrNull(pStmt2, 58, detalheVenda[0].IPI_CLENQ);
			setStringOrNull(pStmt2, 59, detalheVenda[0].IPI_CNPJPROD);
			setStringOrNull(pStmt2, 60, detalheVenda[0].IPI_CSELO);
			setIntOrNull(pStmt2, 61, detalheVenda[0].IPI_QSELO);
			setStringOrNull(pStmt2, 62, detalheVenda[0].IPI_CENQ);
			setStringOrNull(pStmt2, 63, detalheVenda[0].IPI_CST);
			setFloatOrNull(pStmt2, 64, detalheVenda[0].IPI_VBC);
			setFloatOrNull(pStmt2, 65, detalheVenda[0].IPI_PIPI);
			setFloatOrNull(pStmt2, 66, detalheVenda[0].IPI_QUNID);
			setFloatOrNull(pStmt2, 67, detalheVenda[0].IPI_VUNID);
			setFloatOrNull(pStmt2, 68, detalheVenda[0].IPI_VIPI);
			setFloatOrNull(pStmt2, 69, detalheVenda[0].II_VBC);
			setFloatOrNull(pStmt2, 70, detalheVenda[0].II_VDESPADU);
			setFloatOrNull(pStmt2, 71, detalheVenda[0].II_VII);
			setFloatOrNull(pStmt2, 72, detalheVenda[0].II_VIOF);
			setFloatOrNull(pStmt2, 73, detalheVenda[0].ISSQN_VBC);
			setFloatOrNull(pStmt2, 74, detalheVenda[0].ISSQN_VALIQ);
			setFloatOrNull(pStmt2, 75, detalheVenda[0].ISSQN_VISSQN);
			setStringOrNull(pStmt2, 76, detalheVenda[0].ISSQN_CMUNFG);
			setStringOrNull(pStmt2, 77, detalheVenda[0].ISSQN_CLISTSERV);
			setStringOrNull(pStmt2, 78, detalheVenda[0].ISSQN_CSITTRIB);
			setStringOrNull(pStmt2, 79, detalheVenda[0].PIS_CST);
			setStringOrNull(pStmt2, 80, (detalheVenda[0].VRTOTALLIQUIDO - registro.VRTOTALLIQUIDO).toString());
			setStringOrNull(pStmt2, 81, detalheVenda[0].PIS_PPIS);
			setStringOrNull(pStmt2, 82, detalheVenda[0].PIS_VPIS);
			setFloatOrNull(pStmt2, 83, detalheVenda[0].PIS_QBCPROD);
			setFloatOrNull(pStmt2, 84, detalheVenda[0].PIS_VALIQPROD);
			setFloatOrNull(pStmt2, 85, detalheVenda[0].PISST_VBC);
			setFloatOrNull(pStmt2, 86, detalheVenda[0].PISST_PPIS);
			setFloatOrNull(pStmt2, 87, detalheVenda[0].PISST_VPIS);
			setFloatOrNull(pStmt2, 88, detalheVenda[0].PISST_QBCPROD);
			setFloatOrNull(pStmt2, 89, detalheVenda[0].PISST_VALIQPROD);
			setStringOrNull(pStmt2, 90, detalheVenda[0].COFINS_CST);
			pStmt2.setFloat(91, +(detalheVenda[0].VRTOTALLIQUIDO - registro.VRTOTALLIQUIDO));
			pStmt2.setFloat(92, +(detalheVenda[0].COFINS_PCOFINS));
			pStmt2.setFloat(93, +(detalheVenda[0].COFINS_VCOFINS));
			setFloatOrNull(pStmt2, 94, detalheVenda[0].COFINS_QBCPROD);
			setFloatOrNull(pStmt2, 95, detalheVenda[0].COFINS_VALIQPROD);
			setFloatOrNull(pStmt2, 96, detalheVenda[0].COFINSST_VBC);
			setFloatOrNull(pStmt2, 97, detalheVenda[0].COFINSST_PCOFINS);
			setFloatOrNull(pStmt2, 98, detalheVenda[0].COFINSST_VCOFINS);
			setFloatOrNull(pStmt2, 99, detalheVenda[0].COFINSST_QBCPROD);
			setFloatOrNull(pStmt2, 100, detalheVenda[0].COFINSST_VALIQPROD);
			setStringOrNull(pStmt2, 101, detalheVenda[0].INFADPROD);
			setIntOrNull(pStmt2, 102, detalheVenda[0].VENDEDOR_MATRICULA);
			pStmt2.setString(103, detalheVenda[0].VENDEDOR_NOME);
			pStmt2.setString(104, detalheVenda[0].VENDEDOR_CPF);
			pStmt2.setString(105, detalheVenda[0].STCANCELADO);
			pStmt2.setFloat(106, +(detalheVenda[0].VRTOTALLIQUIDO - registro.VRTOTALLIQUIDO));
			pStmt2.setFloat(107, +(detalheVenda[0].QTD - registro.QTD));
			pStmt2.setString(108, detalheVenda[0].STVENDIGITAL);
			setIntOrNull(pStmt2, 109, detalheVenda[0].FROM_MYSQL);
			pStmt2.setString(110, detalheVenda[0].STTROCA);
			setIntOrNull(pStmt2, 111, detalheVenda[0].IDUSRDESCONTO);
			
			pStmt2.execute();
           // pStmt2.close();
            
            conn.commit();
            
            pStmt2.close();
            
            var query3 = 'UPDATE "VAR_DB_NAME"."VENDADETALHE" SET ' + 
    			' EXTIPI = ? , ' +
    			' QCOM = ? , ' +
    			' VPROD = ? , ' +
    			' QTRIB = ? , ' +
    			' VUNTRIB = ? , ' +
    			' VSEG = ? , ' +
    			' VDESC = ? , ' +
    			' VOUTRO = ? , ' +
    			' XPED = ? , ' +
    			' NITEMPED = ? , ' +
    			' VTOTTRIB = ? , ' +
    			' ICMS_ORIG = ? , ' +
    			' ICMS_CST = ? , ' +
    			' ICMS_MODBC = ? , ' +
    			' ICMS_VBC = ? , ' +
    			' ICMS_PREDBC = ? , ' +
    			' ICMS_PICMS = ? , ' +
    			' ICMS_VICMS = ? , ' +
    			' ICMS_VICMSDESON = ? , ' +
    			' ICMS_MODBCST = ? , ' +
    			' ICMS_PMVAST = ? , ' +
    			' ICMS_PREDBCST = ? , ' +
    			' ICMS_VBCST = ? , ' +
    			' ICMS_PICMSST = ? , ' +
    			' ICMS_VICMSST = ? , ' +
    			' ICMS_MOTDESICMS = ? , ' +
    			' ICMS_PBCOP = ? , ' +
    			' ICMS_UFST = ? , ' +
    			' ICMS_VBCSTRET = ? , ' +
    			' ICMS_VICMSSTRET = ? , ' +
    			' ICMS_VBCSTDEST = ? , ' +
    			' ICMS_VICSMSTDEST = ? , ' +
    			' ICMS_CSOSN = ? , ' +
    			' ICMS_PCREDSN = ? , ' +
    			' ICMS_VCREDICMSSN = ? , ' +
    			' ICMSUFDEST_PFCPUFDEST = ? , ' +
    			' ICMSUFDEST_VBCUFDEST = ? , ' +
    			' ICMSUFDEST_PICMSUFDEST = ? , ' +
    			' ICMSUFDEST_PICMSINTER = ? , ' +
    			' ICMSUFDEST_PICMSINTERPART = ? , ' +
    			' ICMSUFDEST_VFCPUFDEST = ? , ' +
    			' ICMSUFDEST_VICMSUFDEST = ? , ' +
    			' ICMSUFDEST_VICMSUFREMET = ? , ' +
    			' IPI_CLENQ = ? , ' +
    			' IPI_CNPJPROD = ? , ' +
    			' IPI_CSELO = ? , ' +
    			' IPI_QSELO = ? , ' +
    			' IPI_CENQ = ? , ' +
    			' IPI_CST = ? , ' +
    			' IPI_VBC = ? , ' +
    			' IPI_PIPI = ? , ' +
    			' IPI_QUNID = ? , ' +
    			' IPI_VUNID = ? , ' +
    			' IPI_VIPI = ? , ' +
    			' II_VBC = ? , ' +
    			' II_VDESPADU = ? , ' +
    			' II_VII = ? , ' +
    			' II_VIOF = ? , ' +
    			' ISSQN_VBC = ? , ' +
    			' ISSQN_VALIQ = ? , ' +
    			' ISSQN_VISSQN = ? , ' +
    			' ISSQN_CMUNFG = ? , ' +
    			' ISSQN_CLISTSERV = ? , ' +
    			' ISSQN_CSITTRIB = ? , ' +
    			' PIS_CST = ? , ' +
    			' PIS_VBC = ? , ' +
    			' PIS_PPIS = ? , ' +
    			' PIS_VPIS = ? , ' +
    			' PIS_QBCPROD = ? , ' +
    			' PIS_VALIQPROD = ? , ' +
    			' PISST_VBC = ? , ' +
    			' PISST_PPIS = ? , ' +
    			' PISST_VPIS = ? , ' +
    			' PISST_QBCPROD = ? , ' +
    			' PISST_VALIQPROD = ? , ' +
    			' COFINS_CST = ? , ' +
    			' COFINS_VBC = ? , ' +
    			' COFINS_PCOFINS = ? , ' +
    			' COFINS_VCOFINS = ? , ' +
    			' COFINS_QBCPROD = ? , ' +
    			' COFINS_VALIQPROD = ? , ' +
    			' COFINSST_VBC = ? , ' +
    			' COFINSST_PCOFINS = ? , ' +
    			' COFINSST_VCOFINS = ? , ' +
    			' COFINSST_QBCPROD = ? , ' +
    			' COFINSST_VALIQPROD = ? , ' +
    			' INFADPROD = ? , ' +
    			' VENDEDOR_MATRICULA = ? , ' +
    			' VENDEDOR_NOME = ? , ' +
    			' VENDEDOR_CPF = ? , ' +
    			' STCANCELADO = ? , ' +
    			' VRTOTALLIQUIDO = ? , ' +
    			' QTD = ? , ' +
    			' STVENDIGITAL = ? , ' +
    			' FROM_MYSQL = ? , ' +
    			' STTROCA = ? , ' +
    			' IDUSRDESCONTO = ?, ' +
    			' IDVOUCHER = ? ' +
    	        ' WHERE "IDVENDADETALHE" =  ? ';
    	   
    	    var pStmt3 = conn.prepareStatement(api.replaceDbName(query3));
    	    
			setStringOrNull(pStmt3, 1, detalheVenda[0].EXTIPI);
			setFloatOrNull(pStmt3, 2, +(registro.QTD));
			setFloatOrNull(pStmt3, 3, +(registro.VRTOTALBRUTO));
			setFloatOrNull(pStmt3, 4,+(registro.QTD));
			setFloatOrNull(pStmt3, 5, +detalheVenda[0].VUNTRIB);
			setFloatOrNull(pStmt3, 6, +detalheVenda[0].VSEG);
			setFloatOrNull(pStmt3, 7, +(registro.VDESC));
			setFloatOrNull(pStmt3, 8, +detalheVenda[0].VOUTRO);
			setStringOrNull(pStmt3, 9, detalheVenda[0].XPED);
			setStringOrNull(pStmt3, 10, detalheVenda[0].NITEMPED);
			setFloatOrNull(pStmt3, 11, +detalheVenda[0].VTOTTRIB);
			setIntOrNull(pStmt3, 12, +detalheVenda[0].ICMS_ORIG);
			setStringOrNull(pStmt3, 13, detalheVenda[0].ICMS_CST);
			setIntOrNull(pStmt3, 14, +detalheVenda[0].ICMS_MODBC);
			setFloatOrNull(pStmt3, 15, +(registro.VRTOTALLIQUIDO));
			setFloatOrNull(pStmt3, 16, +detalheVenda[0].ICMS_PREDBC);
			setFloatOrNull(pStmt3, 17, +detalheVenda[0].ICMS_PICMS);
			setFloatOrNull(pStmt3, 18, +detalheVenda[0].ICMS_VICMS);
			setFloatOrNull(pStmt3, 19, +detalheVenda[0].ICMS_VICMSDESON);
			setIntOrNull(pStmt3, 20, +detalheVenda[0].ICMS_MODBCST);
			setFloatOrNull(pStmt3, 21, +detalheVenda[0].ICMS_PMVAST);
			setFloatOrNull(pStmt3, 22, +detalheVenda[0].ICMS_PREDBCST);
			setFloatOrNull(pStmt3, 23, +detalheVenda[0].ICMS_VBCST);
			setFloatOrNull(pStmt3, 24, +detalheVenda[0].ICMS_PICMSST);
			setFloatOrNull(pStmt3, 25, +detalheVenda[0].ICMS_VICMSST);
			setIntOrNull(pStmt3, 26, +detalheVenda[0].ICMS_MOTDESICMS);
			setFloatOrNull(pStmt3, 27, +detalheVenda[0].ICMS_PBCOP);
			setStringOrNull(pStmt3, 28, detalheVenda[0].ICMS_UFST);
			setFloatOrNull(pStmt3, 29, +detalheVenda[0].ICMS_VBCSTRET);
			setFloatOrNull(pStmt3, 30, +detalheVenda[0].ICMS_VICMSSTRET);
			setFloatOrNull(pStmt3, 31, +detalheVenda[0].ICMS_VBCSTDEST);
			setFloatOrNull(pStmt3, 32, +detalheVenda[0].ICMS_VICSMSTDEST);
			setStringOrNull(pStmt3, 33, detalheVenda[0].ICMS_CSOSN);
			setFloatOrNull(pStmt3, 34, +detalheVenda[0].ICMS_PCREDSN);
			setFloatOrNull(pStmt3, 35, +detalheVenda[0].ICMS_VCREDICMSSN);
			setFloatOrNull(pStmt3, 36, +detalheVenda[0].ICMSUFDEST_PFCPUFDEST);
			setFloatOrNull(pStmt3, 37, +detalheVenda[0].ICMSUFDEST_VBCUFDEST);
			setFloatOrNull(pStmt3, 38, +detalheVenda[0].ICMSUFDEST_PICMSUFDEST);
			setStringOrNull(pStmt3, 39, detalheVenda[0].ICMSUFDEST_PICMSINTER);
			setFloatOrNull(pStmt3, 40, +detalheVenda[0].ICMSUFDEST_PICMSINTERPART);
			setFloatOrNull(pStmt3, 41, +detalheVenda[0].ICMSUFDEST_VFCPUFDEST);
			setFloatOrNull(pStmt3, 42, +detalheVenda[0].ICMSUFDEST_VICMSUFDEST);
			setFloatOrNull(pStmt3, 43, +detalheVenda[0].ICMSUFDEST_VICMSUFREMET);
			setStringOrNull(pStmt3, 44, detalheVenda[0].IPI_CLENQ);
			setStringOrNull(pStmt3, 45, detalheVenda[0].IPI_CNPJPROD);
			setStringOrNull(pStmt3, 46, detalheVenda[0].IPI_CSELO);
			setIntOrNull(pStmt3, 47, +detalheVenda[0].IPI_QSELO);
			setStringOrNull(pStmt3, 48, detalheVenda[0].IPI_CENQ);
			setStringOrNull(pStmt3, 49, detalheVenda[0].IPI_CST);
			setFloatOrNull(pStmt3, 50, +detalheVenda[0].IPI_VBC);
			setFloatOrNull(pStmt3, 51, +detalheVenda[0].IPI_PIPI);
			setFloatOrNull(pStmt3, 52, +detalheVenda[0].IPI_QUNID);
			setFloatOrNull(pStmt3, 53, +detalheVenda[0].IPI_VUNID);
			setFloatOrNull(pStmt3, 54, +detalheVenda[0].IPI_VIPI);
			setFloatOrNull(pStmt3, 55, +detalheVenda[0].II_VBC);
			setFloatOrNull(pStmt3, 56, +detalheVenda[0].II_VDESPADU);
			setFloatOrNull(pStmt3, 57, +detalheVenda[0].II_VII);
			setFloatOrNull(pStmt3, 58, +detalheVenda[0].II_VIOF);
			setFloatOrNull(pStmt3, 59, +detalheVenda[0].ISSQN_VBC);
			setFloatOrNull(pStmt3, 60, +detalheVenda[0].ISSQN_VALIQ);
			setFloatOrNull(pStmt3, 61, +detalheVenda[0].ISSQN_VISSQN);
			setStringOrNull(pStmt3, 62, detalheVenda[0].ISSQN_CMUNFG);
			setStringOrNull(pStmt3, 63, detalheVenda[0].ISSQN_CLISTSERV);
			setStringOrNull(pStmt3, 64, detalheVenda[0].ISSQN_CSITTRIB);
			setStringOrNull(pStmt3, 65, detalheVenda[0].PIS_CST);
			setStringOrNull(pStmt3, 66, registro.VRTOTALLIQUIDO);
			setStringOrNull(pStmt3, 67, detalheVenda[0].PIS_PPIS);
			setStringOrNull(pStmt3, 68, detalheVenda[0].PIS_VPIS);
			setFloatOrNull(pStmt3, 69, +detalheVenda[0].PIS_QBCPROD);
			setFloatOrNull(pStmt3, 70, +detalheVenda[0].PIS_VALIQPROD);
			setFloatOrNull(pStmt3, 71, +detalheVenda[0].PISST_VBC);
			setFloatOrNull(pStmt3, 72, +detalheVenda[0].PISST_PPIS);
			setFloatOrNull(pStmt3, 73, +detalheVenda[0].PISST_VPIS);
			setFloatOrNull(pStmt3, 74, +detalheVenda[0].PISST_QBCPROD);
			setFloatOrNull(pStmt3, 75, +detalheVenda[0].PISST_VALIQPROD);
			setStringOrNull(pStmt3, 76, detalheVenda[0].COFINS_CST);
			setFloatOrNull(pStmt3, 77, +(registro.VRTOTALLIQUIDO));
			setFloatOrNull(pStmt3, 78, +detalheVenda[0].COFINS_PCOFINS);
			setFloatOrNull(pStmt3, 79, +detalheVenda[0].COFINS_VCOFINS);
			setFloatOrNull(pStmt3, 80, +detalheVenda[0].COFINS_QBCPROD);
			setFloatOrNull(pStmt3, 81, +detalheVenda[0].COFINS_VALIQPROD);
			setFloatOrNull(pStmt3, 82, +detalheVenda[0].COFINSST_VBC);
			setFloatOrNull(pStmt3, 83, +detalheVenda[0].COFINSST_PCOFINS);
			setFloatOrNull(pStmt3, 84, +detalheVenda[0].COFINSST_VCOFINS);
			setFloatOrNull(pStmt3, 85, +detalheVenda[0].COFINSST_QBCPROD);
			setFloatOrNull(pStmt3, 86, +detalheVenda[0].COFINSST_VALIQPROD);
			setStringOrNull(pStmt3, 87, detalheVenda[0].INFADPROD);
			setIntOrNull(pStmt3, 88, detalheVenda[0].VENDEDOR_MATRICULA);
			setStringOrNull(pStmt3, 89, detalheVenda[0].VENDEDOR_NOME);
			setStringOrNull(pStmt3, 90, detalheVenda[0].VENDEDOR_CPF);
			setStringOrNull(pStmt3, 91, detalheVenda[0].STCANCELADO);
			setFloatOrNull(pStmt3, 92, +(registro.VRTOTALLIQUIDO));
			setFloatOrNull(pStmt3, 93, +registro.QTD);
			setStringOrNull(pStmt3, 94, detalheVenda[0].STVENDIGITAL);
			setIntOrNull(pStmt3, 95, detalheVenda[0].FROM_MYSQL);
			setStringOrNull(pStmt3, 96, registro.STTROCA);
			setIntOrNull(pStmt3, 97, detalheVenda[0].IDUSRDESCONTO);
			setIntOrNull(pStmt3, 98, registro.IDVOUCHER);
			setStringOrNull(pStmt3, 99, detalheVenda[0].IDVENDADETALHE);
			
 
    	    pStmt3.execute();
            
            conn.commit();
            
            pStmt3.close();
        }
        
        
    }
    pStmt.close();
	
     conn.commit();

	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandleGet(byId) {
    var idVenda = $.request.parameters.get("idVenda");
    var codigoProduto = $.request.parameters.get("codigoProduto");
    
    var query = ' SELECT ' + 
    '   tbdv.IDVENDA,' +
    '   tbdv.IDVENDADETALHE,' +
    '   IFNULL(tbdv.NITEM,0)AS NITEM,' +
    '   tbdv.CPROD,' +
    '   tbdv.CEAN,' +
    '   tbdv.XPROD,' +
    '   tbdv.NCM,' +
    '   tbdv.UCOM,' +
    '   IFNULL(tbdv.QCOM,0)AS QCOM, ' +
    '   IFNULL(tbdv.VUNCOM,0)AS VUNCOM,' +
    '   IFNULL(tbdv.VPROD,0)AS VPROD,' +
    '   IFNULL(tbdv.VDESC,0)AS VDESC,' +
    '   tbdv.VENDEDOR_MATRICULA,' +
    '   tbdv.VENDEDOR_NOME,' +
    '   tbdv.VENDEDOR_CPF,' +
    '   IFNULL(tbdv.VRTOTALLIQUIDO,0)AS VRTOTALLIQUIDO,' +
    '   IFNULL(tbdv.QTD,0)AS QTD,' +
    '   tbdv.STVENDIGITAL,' +
    '   tbp.NUCODBARRAS' +
    ' FROM ' + 
    '   "VAR_DB_NAME".VENDADETALHE tbdv' +
     '	INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON TBP.IDPRODUTO = tbdv.CPROD ' +
    ' WHERE ' +
        '	1 = ? and tbdv."STCANCELADO"=\'False\' and (tbdv."STTROCA"=\'False\' OR tbdv."STTROCA" IS NULL) ';
    
    if ( byId ) {
        query = query + ' And  tbdv.IDDETALHEVENDA = \'' + byId + '\' ';
    }
    if ( idVenda ) {
        query = query + ' And  tbdv.IDVENDA = \'' + idVenda + '\' ';
    }
    if ( codigoProduto ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codigoProduto + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
           
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}