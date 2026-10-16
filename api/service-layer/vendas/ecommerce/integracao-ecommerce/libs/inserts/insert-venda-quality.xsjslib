let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

function executarInsertTabelaVenda(idvenda, nfeProc, idCliente, conn) {
    let queryInsert = `
            INSERT INTO "VAR_DB_NAME".VENDA
            (
            	IDVENDA, 
            	IDEMPRESA, 
            	VRTOTALVENDA, 
            	VRTOTALPAGO,
            	DTHORAABERTURA,
            	DTHORAFECHAMENTO, 
            	STATIVO,
            	STCANCELADO, 
            	IDCLIENTE, 
            	NFE_INFNFE_ID,
            	NFE_INFNFE_VERSAO,
            	NFE_INFNFE_IDE_CUF,
            	NFE_INFNFE_IDE_CNF,
            	NFE_INFNFE_IDE_NATOP,
            	NFE_INFNFE_IDE_MOD,
            	NFE_INFNFE_IDE_SERIE,
            	NFE_INFNFE_IDE_NNF,
            	NFE_INFNFE_IDE_DHEMI,
            	NFE_INFNFE_IDE_TPNF,
            	NFE_INFNFE_IDE_IDDEST,
            	NFE_INFNFE_IDE_CMUNFG,
            	NFE_INFNFE_IDE_TPIMP,
            	NFE_INFNFE_IDE_TPEMIS,
            	NFE_INFNFE_IDE_CDV,
            	NFE_INFNFE_IDE_TPAMB,
            	NFE_INFNFE_IDE_FINNFE,
            	NFE_INFNFE_IDE_INDFINAL,
            	NFE_INFNFE_IDE_INDPRES,
            	NFE_INFNFE_IDE_PROCEMI,
            	NFE_INFNFE_IDE_VERPROC,
            	NFE_INFNFE_EMIT_CNPJ,
            	NFE_INFNFE_EMIT_NOME,
            	NFE_INFNFE_EMIT_FANT,
            	NFE_INFNFE_EMIT_ENDEREMIT_XLGR,
            	NFE_INFNFE_EMIT_ENDEREMIT_NRO,
            	NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO,
            	NFE_INFNFE_EMIT_ENDEREMIT_CMUN,
            	NFE_INFNFE_EMIT_ENDEREMIT_XMUN,
            	NFE_INFNFE_EMIT_ENDEREMIT_UF,
            	NFE_INFNFE_EMIT_ENDEREMIT_CEP,
            	NFE_INFNFE_EMIT_ENDEREMIT_CPAIS,
            	NFE_INFNFE_EMIT_ENDEREMIT_XPAIS,
            	NFE_INFNFE_EMIT_ENDEREMIT_FONE,
            	NFE_INFNFE_EMIT_IE,
            	NFE_INFNFE_EMIT_CRT,
            	NFE_INFNFE_TOTAL_ICMSTOT_VBC,
            	NFE_INFNFE_TOTAL_ICMSTOT_VICMS,
            	NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON,
            	NFE_INFNFE_TOTAL_ICMSTOT_VFCP,
            	NFE_INFNFE_TOTAL_ICMSTOT_VBCST,
            	NFE_INFNFE_TOTAL_ICMSTOT_VST,
            	NFE_INFNFE_TOTAL_ICMSTOT_VFCPST,
            	NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET,
            	NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
            	NFE_INFNFE_TOTAL_ICMSTOT_VFRETE,
            	NFE_INFNFE_TOTAL_ICMSTOT_VSEG,
            	NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
            	NFE_INFNFE_TOTAL_ICMSTOT_VII,
            	NFE_INFNFE_TOTAL_ICMSTOT_VIPI,
            	NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL,
            	NFE_INFNFE_TOTAL_ICMSTOT_VPIS,
            	NFE_INFNFE_TOTAL_ICMSTOT_VCOFINS,
            	NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO,
            	NFE_INFNFE_TOTAL_ICMSTOT_VNF,
            	NFE_INFNFE_TRANSP_MODFRETE,
            	NFE_INFNFE_INFADIC_INFCPL,
            	NFE_INFNFESUPL_QRCODE,
            	NFE_INFNFESUPL_URLCHAVE,
            	PROTNFE_VERSAO,
            	PROTNFE_INFPROT_ID,
            	PROTNFE_INFPROT_TPAMB,
            	PROTNFE_INFPROT_VERAPLIC,
            	PROTNFE_INFPROT_CHNFE,
            	PROTNFE_INFPROT_DHRECBTO,
            	PROTNFE_INFPROT_NPROT,
            	PROTNFE_INFPROT_DIGVAL,
            	PROTNFE_INFPROT_CSTAT,
            	PROTNFE_INFPROT_XMOTIVO,
            	INFINTERMED_IDCADINTTRAN,
            	DEST_CNPJ,
            	DEST_CPF,
            	DEST_XNOME,
            	DEST_XLGR,
            	DEST_NRO,
            	DEST_XCPL,
            	DEST_XBAIRRO,
            	DEST_CMUN,
            	DEST_XMUN,
            	DEST_UF,
            	DEST_CEP,
            	DEST_CPAIS,
            	DEST_XPAIS,
            	DEST_FONE,
            	DEST_IE,
            	DEST_ISUF,
            	DEST_EMAIL,
            	SAP_DOCENTRY,
            	SAP_DOCENTRY_CORRETO,
            	DTDEVOLUCAO,
            	DOCENTRYDEVSAP,
            	STDEVOLUCAO,
            	STECOMMERCE,
            	ERRORLOGSAP
            )
            VALUES(
                ?, ?, ?, ?, TO_TIMESTAMP(?, 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP(?, 'YYYY-MM-DD HH24:MI:SS'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, null, null, null, 'False', 'True', null
                );
        `;
        
    let idEmpresa = idvenda.split("-")[0];
    let dataVenda = nfeProc.NFe.infNFe.ide.dhEmi.substring(0, 19).replace("T", " ");
    let dataRecebimento = nfeProc.protNFe.infProt.dhRecbto.substring(0, 19).replace("T", " ");
    
    let cont = 0;
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    try {
        pStmt.setString(++cont, idvenda);
        pStmt.setInt(++cont, Number(idEmpresa));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vNF));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vNF));
        pStmt.setString(++cont, dataVenda);
        pStmt.setString(++cont, dataVenda);
        pStmt.setString(++cont, 'True');
        pStmt.setString(++cont, 'False');
        pStmt.setInt(++cont, Number(idCliente));
        pStmt.setString(++cont, nfeProc.NFe.infNFe._attributes.Id);
        pStmt.setString(++cont, nfeProc.NFe.infNFe._attributes.versao);
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.cUF));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.cNF));
        pStmt.setString(++cont, nfeProc.NFe.infNFe.ide.natOp);
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.mod));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.serie));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.nNF));
        pStmt.setString(++cont, dataVenda);
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.tpNF));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.idDest));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.cMunFG));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.tpImp));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.tpEmis));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.cDV));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.tpAmb));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.finNFe));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.indFinal));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.indPres));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.ide.procEmi));
        pStmt.setString(++cont, nfeProc.NFe.infNFe.ide.verProc);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.CNPJ);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.xNome);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.xFant);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.enderEmit.xLgr);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.enderEmit.nro);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.enderEmit.xBairro);
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.emit.enderEmit.cMun));
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.enderEmit.xMun);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.enderEmit.UF);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.enderEmit.CEP);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.enderEmit.cPais);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.enderEmit.xPais);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.enderEmit.fone || '9999999999');
        pStmt.setString(++cont, nfeProc.NFe.infNFe.emit.IE);
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.emit.CRT));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vBC));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vICMS));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vICMSDeson));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vFCP));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vBCST));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vST));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vFCPST));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vFCPSTRet));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vProd));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vFrete));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vSeg));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vDesc));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vII));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vIPI));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vIPIDevol));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vPIS));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vCOFINS));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vOutro));
        pStmt.setDecimal(++cont, Number(nfeProc.NFe.infNFe.total.ICMSTot.vNF));
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.transp.modFrete));
        pStmt.setString(++cont, nfeProc.NFe.infNFe.infAdic.infCpl || '');
        pStmt.setString(++cont, '');
        pStmt.setString(++cont, '');
        pStmt.setString(++cont, nfeProc.protNFe._attributes.versao);
        pStmt.setString(++cont, '');
        pStmt.setInt(++cont, Number(nfeProc.protNFe.infProt.tpAmb));
        pStmt.setString(++cont, nfeProc.protNFe.infProt.verAplic);
        pStmt.setString(++cont, nfeProc.protNFe.infProt.chNFe);
        pStmt.setString(++cont, dataRecebimento);
        pStmt.setString(++cont, nfeProc.protNFe.infProt.nProt);
        pStmt.setString(++cont, nfeProc.protNFe.infProt.digVal);
        pStmt.setInt(++cont, Number(nfeProc.protNFe.infProt.cStat));
        pStmt.setString(++cont, nfeProc.protNFe.infProt.xMotivo);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.infIntermed && nfeProc.NFe.infNFe.infIntermed.idCadIntTran ? nfeProc.NFe.infNFe.infIntermed.idCadIntTran : '');
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.CNPJ || '');
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.CPF || '');
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.xNome);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.xLgr);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.nro);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.xCpl || '');
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.xBairro);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.cMun);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.xMun);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.UF);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.CEP);
        pStmt.setInt(++cont, Number(nfeProc.NFe.infNFe.dest.enderDest.cPais));
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.xPais);
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.enderDest.fone || '9999999999');
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.IE || '');
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.ISUF || '');
        pStmt.setString(++cont, nfeProc.NFe.infNFe.dest.email || '@');
    
        pStmt.execute();
    	conn.commit();
    	
    	return true;
    } catch(error) {
        return error;
    } finally {
        pStmt.close();
    }
}

function grupoImposto(grupo) {
    if (!grupo) return null;

    for (let chave in grupo) {
        return grupo[chave];
    }

    return null;
}

function executarInsertTabelaVendaDetalhe(idvenda, numeroItem, item, conn) {
    let queryInsert = `
        INSERT INTO "VAR_DB_NAME".VENDADETALHE
            (
            IDVENDADETALHE,
            IDVENDA,
            NITEM,
            CPROD,
            CEAN,
            XPROD,
            NCM,
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
            VDESC,
            VOUTRO,
            INDTOT,
            XPED,
            VTOTTRIB,
            ICMS_ORIG,
            ICMS_CST,
            ICMS_MODBC,
            ICMS_VBC,
            ICMS_PICMS,
            ICMS_VICMS,
            ICMS_VICMSDESON,
            ICMS_MODBCST,
            ICMSUFDEST_VBCUFDEST,
            ICMSUFDEST_PICMSUFDEST,
            ICMSUFDEST_PICMSINTER,
            ICMSUFDEST_PICMSINTERPART,
            ICMSUFDEST_PFCPUFDEST,
            ICMSUFDEST_VFCPUFDEST,
            ICMSUFDEST_VICMSUFDEST,
            ICMSUFDEST_VICMSUFREMET,
            PIS_CST,
            PIS_VBC,
            PIS_PPIS,
            PIS_VPIS,
            COFINS_CST,
            COFINS_VBC,
            COFINS_PCOFINS,
            COFINS_VCOFINS,
            VRTOTALLIQUIDO,
            QTD,
            STCANCELADO,
            STECOMMERCE
            )
            VALUES(
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, 'False', 'True'
                );
    `;
    
    let cont = 0;
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));
    let grupoICMS = grupoImposto(item.imposto.ICMS);
    let grupoPIS = grupoImposto(item.imposto.PIS);
    let grupoCOFINS = grupoImposto(item.imposto.COFINS);
    
    try {
        pStmt.setString(++cont, `${idvenda}-${numeroItem}`);
        pStmt.setString(++cont, idvenda);
        pStmt.setInt(++cont, numeroItem);
        pStmt.setString(++cont, item.prod.cProd);
        pStmt.setString(++cont, item.prod.cEAN || '');
        pStmt.setString(++cont, item.prod.xProd);
        pStmt.setString(++cont, item.prod.NCM);
        pStmt.setString(++cont, item.prod.CFOP);
        pStmt.setString(++cont, item.prod.uCom);
        pStmt.setDecimal(++cont, Number(item.prod.qCom));
        pStmt.setDecimal(++cont, Number(item.prod.vUnCom));
        pStmt.setDecimal(++cont, Number(item.prod.vProd));
        pStmt.setString(++cont, item.prod.cEANTrib || '');
        pStmt.setString(++cont, item.prod.uTrib);
        pStmt.setInt(++cont, Number(item.prod.qTrib));
        pStmt.setDecimal(++cont, Number(item.prod.vUnTrib));
        pStmt.setDecimal(++cont, Number(item.prod.vFrete || 0));
        pStmt.setDecimal(++cont, Number(item.prod.vDesc || 0));
        pStmt.setDecimal(++cont, Number(item.prod.vOutro || 0));
        pStmt.setInt(++cont, Number(item.prod.indTot || 1));
        pStmt.setString(++cont, item.prod.xPed || '');
        pStmt.setDecimal(++cont, Number(item.imposto.vTotTrib || 0));
        pStmt.setInt(++cont, Number(grupoICMS && grupoICMS.orig ? grupoICMS.orig : 0));
        pStmt.setString(++cont, grupoICMS ? (grupoICMS.CST || grupoICMS.CSOSN || '') : '');
        pStmt.setInt(++cont, Number(grupoICMS && grupoICMS.modBC ? grupoICMS.modBC : 0));
        pStmt.setDecimal(++cont, Number(grupoICMS && grupoICMS.vBC ? grupoICMS.vBC : 0));
        pStmt.setDecimal(++cont, Number(grupoICMS && grupoICMS.pICMS ? grupoICMS.pICMS : 0));
        pStmt.setDecimal(++cont, Number(grupoICMS && grupoICMS.vICMS ? grupoICMS.vICMS : 0));
        pStmt.setDecimal(++cont, Number(grupoICMS && grupoICMS.vICMSDeson ? grupoICMS.vICMSDeson : 0));
        pStmt.setInt(++cont, Number(grupoICMS && grupoICMS.modBCST ? grupoICMS.modBCST : 0));
        pStmt.setDecimal(++cont, Number(item.imposto.ICMSUFDest && item.imposto.ICMSUFDest.vBCUFDest ? item.imposto.ICMSUFDest.vBCUFDest : 0));
        pStmt.setDecimal(++cont, Number(item.imposto.ICMSUFDest && item.imposto.ICMSUFDest.pICMSUFDest ? item.imposto.ICMSUFDest.pICMSUFDest : 0));
        pStmt.setDecimal(++cont, Number(item.imposto.ICMSUFDest && item.imposto.ICMSUFDest.pICMSInter ? item.imposto.ICMSUFDest.pICMSInter : 0));
        pStmt.setDecimal(++cont, Number(item.imposto.ICMSUFDest && item.imposto.ICMSUFDest.pICMSInterPart ? item.imposto.ICMSUFDest.pICMSInterPart : 0));
        pStmt.setDecimal(++cont, Number(item.imposto.ICMSUFDest && item.imposto.ICMSUFDest.pFCPUFDest ? item.imposto.ICMSUFDest.pFCPUFDest : 0));
        pStmt.setDecimal(++cont, Number(item.imposto.ICMSUFDest && item.imposto.ICMSUFDest.vFCPUFDest ? item.imposto.ICMSUFDest.vFCPUFDest : 0));
        pStmt.setDecimal(++cont, Number(item.imposto.ICMSUFDest && item.imposto.ICMSUFDest.vICMSUFDest ? item.imposto.ICMSUFDest.vICMSUFDest : 0));
        pStmt.setDecimal(++cont, Number(item.imposto.ICMSUFDest && item.imposto.ICMSUFDest.vICMSUFRemet ? item.imposto.ICMSUFDest.vICMSUFRemet : 0));
        pStmt.setString(++cont, grupoPIS && grupoPIS.CST ? grupoPIS.CST : '');
        pStmt.setDecimal(++cont, Number(grupoPIS && grupoPIS.vBC ? grupoPIS.vBC : 0));
        pStmt.setDecimal(++cont, Number(grupoPIS && grupoPIS.pPIS ? grupoPIS.pPIS : 0));
        pStmt.setDecimal(++cont, Number(grupoPIS && grupoPIS.vPIS ? grupoPIS.vPIS : 0));
        pStmt.setString(++cont, grupoCOFINS && grupoCOFINS.CST ? grupoCOFINS.CST : '');
        pStmt.setDecimal(++cont, Number(grupoCOFINS && grupoCOFINS.vBC ? grupoCOFINS.vBC : 0));
        pStmt.setDecimal(++cont, Number(grupoCOFINS && grupoCOFINS.pCOFINS ? grupoCOFINS.pCOFINS : 0));
        pStmt.setDecimal(++cont, Number(grupoCOFINS && grupoCOFINS.vCOFINS ? grupoCOFINS.vCOFINS : 0));
        pStmt.setDecimal(++cont, Number(item.prod.vProd) - Number(item.prod.vDesc || 0) + Number(item.prod.vFrete || 0) + Number(item.prod.vOutro || 0));
        pStmt.setDecimal(++cont, Number(item.prod.qCom));
    
        pStmt.execute();
    	conn.commit();
    	
    	return true;
    } catch(error) {
        return error;
    } finally {
        pStmt.close();
    }
}

function prepararInsertTabelaVendaDetalhe(idvenda, det, conn) {
    for(let i = 0; i < det.length; i++) {
        let item = det[i];
        let respInsertVendaDetalhe = executarInsertTabelaVendaDetalhe(idvenda, i+1, item, conn);
        if(respInsertVendaDetalhe == true) continue;
        
        return {
            status: false,
            message: `Inserção do item ${item.prod.cProd} na venda detalhe falhou.`
        }
    }
    
    return {
        status: true,
        message: `Todos os itens foram inseridos na venda detalhe.`
    };
}

function validarIntegracaoVenda(idvenda) {
    let query = `
        SELECT
        	A.IDVENDA 
        FROM
        	"VAR_DB_NAME".VENDA A
        WHERE 
        	1 = ? 
        	AND A.IDVENDA = '${idvenda}'
    `; 
    
    let respValidarIntegracaoVenda = api.sqlQuery(query, 1);
    if(respValidarIntegracaoVenda.length) return true;
    
    return false;
}

function integrarVendaQuality(idvenda, nfeProc, idCliente, conn, session) {
    let respInsertVenda = executarInsertTabelaVenda(idvenda, nfeProc, idCliente, conn);
    if(respInsertVenda == true) {
        let respValidarIntegracaoTabelaVenda = validarIntegracaoVenda(idvenda);
        if(!respValidarIntegracaoTabelaVenda) return {status: false, message: `Não foi possível validar a integração da venda.`};
        
        let respInsertVendaDetalhe = prepararInsertTabelaVendaDetalhe(idvenda, nfeProc.NFe.infNFe.det, conn);
        
        if(!respInsertVendaDetalhe.status) return {status: false, message: respInsertVendaDetalhe.message};
        
        return {
            status: true, 
            message: `Venda integrada com sucesso.`
        }
    }
    
    return {
        status: false,
        message: `Erro ao inserir venda no Quality: ${respInsertVenda}`
    }
}