var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoDetalheOrigem(idResumoPromocaoMarketing) {

var query = ' SELECT ' +
    	'   tbdpmo."IDDETALHEPROMOCAOMARKETINGORIGEM",' +
    	'   tbdpmo."IDRESUMOPROMOCAOMARKETING", ' +
    	'   tbdpmo."IDGRUPOEMORIGEM", ' +
    	'   tbdpmo."IDSUBGRUPOEMORIGEM", ' +
    	'   tbdpmo."IDMARCAEMORIGEM", ' +
    	'   tbdpmo."IDFORNECEDOREMORIGEM", ' +
    	'   tbdpmo."IDPRODUTOORIGEM" ' +
    	' FROM ' +
		'   "VAR_DB_NAME".DETALHEPROMOCAOMARKETINGORIGEM tbdpmo' +
		' WHERE ' +
		'	tbdpmo.IDRESUMOPROMOCAOMARKETING = ? ' ;

	var linhas = api.sqlQuery(query, idResumoPromocaoMarketing);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"detOrigem": {
				"IDDETALHEPROMOCAOMARKETINGORIGEM": det.IDDETALHEPROMOCAOMARKETINGORIGEM,
				"IDRESUMOPROMOCAOMARKETING": det.IDRESUMOPROMOCAOMARKETING,
				"IDGRUPOEMORIGEM": det.IDGRUPOEMORIGEM,
				"IDSUBGRUPOEMORIGEM": det.IDSUBGRUPOEMORIGEM,
				"IDMARCAEMORIGEM": det.IDMARCAEMORIGEM,
				"IDFORNECEDOREMORIGEM": det.IDFORNECEDOREMORIGEM,
				"IDPRODUTOORIGEM": det.IDPRODUTOORIGEM
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterLinhasDoDetalheDestino(idResumoPromocaoMarketing) {

		var query = ' SELECT ' +
    	'   tbdpmd."IDDETALHEPROMOCAOMARKETINGDESTINO",' +
    	'   tbdpmd."IDRESUMOPROMOCAOMARKETING", ' +
    	'   tbdpmd."IDGRUPOEMDESTINO", ' +
    	'   tbdpmd."IDSUBGRUPOEMDESTINO", ' +
    	'   tbdpmd."IDMARCAEMDESTINO", ' +
    	'   tbdpmd."IDFORNECEDOREMDESTINO", ' +
    	'   tbdpmd."IDPRODUTODESTINO" ' +
    	' FROM ' +
		'   "VAR_DB_NAME".DETALHEPROMOCAOMARKETINGDESTINO tbdpmd' +
		' WHERE ' +
		'	tbdpmd.IDRESUMOPROMOCAOMARKETING = ? ' ;

	var linhas = api.sqlQuery(query, idResumoPromocaoMarketing);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"detDestino": {
				"IDDETALHEPROMOCAOMARKETINGDESTINO": det.IDDETALHEPROMOCAOMARKETINGDESTINO,
				"IDRESUMOPROMOCAOMARKETING": det.IDRESUMOPROMOCAOMARKETING,
				"IDGRUPOEMDESTINO": det.IDGRUPOEMDESTINO,
				"IDSUBGRUPOEMDESTINO": det.IDSUBGRUPOEMDESTINO,
				"IDMARCAEMDESTINO": det.IDMARCAEMDESTINO,
				"IDFORNECEDOREMDESTINO": det.IDFORNECEDOREMDESTINO,
				"IDPRODUTODESTINO": det.IDPRODUTODESTINO
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {

    var idEmpresa = $.request.parameters.get("idEmpresa");
    
	var query = ' SELECT ' +
    	'   tbrpm."IDRESUMOPROMOCAOMARKETING",' +
    	'   tbrpm."DSPROMOCAOMARKETING",' +
    	'   TO_VARCHAR(tbrpm.DTHORAINICIO,\'YYYY-MM-DD HH24:MI:SS\') AS DTHORAINICIO, ' +
    	'   TO_VARCHAR(tbrpm.DTHORAFIM,\'YYYY-MM-DD HH24:MI:SS\') AS DTHORAFIM, ' +
    	'   tbrpm."TPAPLICADOA", ' +
    	'   tbrpm."TPAPARTIRDE", ' +
    	'   tbrpm."APARTIRDEQTD", ' +
    	'   tbrpm."APARTIRDOVLR", ' +
    	'   tbrpm."TPFATORPROMO", ' +
    	'   tbrpm."FATORPROMOVLR", ' +
    	'   tbrpm."FATORPROMOPERC", ' +
    	'   tbepm."IDEMPRESA", ' +
    	'   tbe."NOFANTASIA" ' +
    	' FROM ' +
		'   "VAR_DB_NAME".RESUMOPROMOCAOMARKETING tbrpm' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESAPROMOCAOMARKETING tbepm ON tbepm.IDRESUMOPROMOCAOMARKETING = tbrpm.IDRESUMOPROMOCAOMARKETING' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbepm.IDEMPRESA' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbrpm.IDRESUMOPROMOCAOMARKETING = \'' + byId + '\' ';
	}
	
	if(idEmpresa){
	    query = query + ' And tbepm.IDEMPRESA = \'' + idEmpresa + '\' ';
	}

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var resumo = {
			"resumo": {
				"IDRESUMOPROMOCAOMARKETING": registro.IDRESUMOPROMOCAOMARKETING,
				"DSPROMOCAOMARKETING": registro.DSPROMOCAOMARKETING,
				"DTHORAINICIO": registro.DTHORAINICIO,
				"DTHORAFIM": registro.DTHORAFIM,
				"TPAPLICADOA": registro.TPAPLICADOA,
				"TPAPARTIRDE": registro.TPAPARTIRDE,
				"APARTIRDEQTD": registro.APARTIRDEQTD,
				"APARTIRDOVLR": registro.APARTIRDOVLR,
				"TPFATORPROMO": registro.TPFATORPROMO,
				"FATORPROMOVLR": registro.FATORPROMOVLR,
				"FATORPROMOPERC": registro.FATORPROMOPERC,
				"IDEMPRESA": registro.IDEMPRESA,
				"NOFANTASIA": registro.NOFANTASIA
			},
			"detalheOrigem": obterLinhasDoDetalheOrigem(registro.IDRESUMOPROMOCAOMARKETING),
			"detalheDestino": obterLinhasDoDetalheDestino(registro.IDRESUMOPROMOCAOMARKETING)
		};

		data.push(resumo);

	}

	response.data = data;

	return response;
}

/*function fnIncluirDetalhes(conn, lstDet, vIdVenda) {
	var query = 'INSERT INTO "VAR_DB_NAME"."VENDADETALHE" ' +
		" ( " +
		' "IDVENDADETALHE", ' +
		' "IDVENDA", ' +
		' "NITEM", ' +
		' "CPROD", ' +
		' "CEAN", ' +
		' "XPROD", ' +
		' "NCM", ' +
		' "CFOP", ' +
		' "UCOM", ' +
		' "QCOM", ' +
		' "VUNCOM", ' +
		' "VPROD", ' +
		' "CEANTRIB", ' +
		' "UTRIB", ' +
		' "QTRIB", ' +
		' "VUNTRIB", ' +
		' "INDTOT", ' +
		' "ICMS_ORIG", ' +
		' "ICMS_CST", ' +
		' "ICMS_MODBC", ' +
		' "ICMS_VBC", ' +
		' "ICMS_PICMS", ' +
		' "ICMS_VICMS", ' +
		' "PIS_CST", ' +
		' "PIS_VBC", ' +
		' "PIS_PPIS", ' +
		' "PIS_VPIS", ' +
		' "COFINS_CST", ' +
		' "COFINS_VBC", ' +
		' "COFINS_PCOFINS", ' +
		' "COFINS_VCOFINS", ' +
		' "VENDEDOR_MATRICULA", ' +
		' "VENDEDOR_NOME", ' +
		' "VENDEDOR_CPF", ' +
		' "STCANCELADO", ' +
		' "QTD", ' +
    	' "VRTOTALLIQUIDO", ' +
    	' "STVENDIGITAL", ' +
    	' "VDESC" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstDet.length; i++) {

		var registro = lstDet[i];

		pStmt.setString(1, vIdVenda + '-' + registro["@nItem"]);
		pStmt.setString(2, vIdVenda);
		pStmt.setString(3, registro["@nItem"]);
		pStmt.setString(4, registro.prod.cProd);
		pStmt.setString(5, registro.prod.cEAN);
		pStmt.setString(6, registro.prod.xProd);
		pStmt.setString(7, registro.prod.NCM);
		pStmt.setString(8, registro.prod.CFOP);
		pStmt.setString(9, registro.prod.uCom);
		pStmt.setFloat(10, registro.prod.qCom);
		pStmt.setFloat(11, registro.prod.vUnCom);
		pStmt.setFloat(12, registro.prod.vProd);
		pStmt.setString(13, registro.prod.cEANTrib);
		pStmt.setString(14, registro.prod.uTrib);
		pStmt.setFloat(15, registro.prod.qTrib);
		pStmt.setFloat(16, registro.prod.vUnTrib);
		pStmt.setString(17, registro.prod.indTot);
		pStmt.setString(18, registro.imposto.ICMS.ICMS00.orig);
		pStmt.setString(19, registro.imposto.ICMS.ICMS00.CST);
		pStmt.setString(20, registro.imposto.ICMS.ICMS00.modBC);
		pStmt.setFloat(21, registro.imposto.ICMS.ICMS00.vBC);
		pStmt.setFloat(22, registro.imposto.ICMS.ICMS00.pICMS);
		pStmt.setFloat(23, registro.imposto.ICMS.ICMS00.vICMS);
		pStmt.setString(24, registro.imposto.PIS.PISAliq.CST);
		pStmt.setFloat(25, registro.imposto.PIS.PISAliq.vBC);
		pStmt.setFloat(26, registro.imposto.PIS.PISAliq.pPIS);
		pStmt.setFloat(27, registro.imposto.PIS.PISAliq.vPIS);
		pStmt.setString(28, registro.imposto.COFINS.COFINSAliq.CST);
		pStmt.setFloat(29, registro.imposto.COFINS.COFINSAliq.vBC);
		pStmt.setFloat(30, registro.imposto.COFINS.COFINSAliq.pCOFINS);
		pStmt.setFloat(31, registro.imposto.COFINS.COFINSAliq.vCOFINS);
		pStmt.setString(32, registro.vendedor.matricula);
		pStmt.setString(33, registro.vendedor.nome);
		pStmt.setString(34, registro.vendedor.cpf);
		pStmt.setString(35, registro.prod.stCancelado);
		pStmt.setFloat(36, registro.prod.qtd);
		pStmt.setFloat(37, registro.prod.valorTotalLiquido);
		pStmt.setString(38, registro.vendedor.stVendaDigital);
		pStmt.setFloat(39, registro.prod.vDesc || 0);
		
	
		pStmt.execute();
	}

	pStmt.close();

	conn.commit();
}

function fnIncluirPagamentos(conn, lstPag, vIdVenda) {
	var query = 'INSERT INTO "VAR_DB_NAME"."VENDAPAGAMENTO" ' +
		" ( " +
		' "IDVENDAPAGAMENTO", ' +
		' "IDVENDA", ' +
		' "NITEM", ' +
		' "TPAG", ' +
		' "DSTIPOPAGAMENTO", ' +
		' "VALORRECEBIDO", ' +
		' "VALORDEDUZIDO", ' +
		' "VALORLIQUIDO", ' +
		' "DTPROCESSAMENTO", ' +
		' "DTVENCIMENTO", ' +
		' "NPARCELAS", ' +
		' "NOTEF", ' +
		' "NOAUTORIZADOR", ' +
		' "NOCARTAO", ' +
		' "NUOPERACAO", ' +
		' "NSUTEF", ' +
		' "NSUAUTORIZADORA", ' +
		' "NUAUTORIZACAO", ' +
		' "CPF", ' +
		' "NOME" ' +
		' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstPag.length; i++) {

		var registro = lstPag[i];

		pStmt.setString(1, vIdVenda + '-' + registro["@nItem"]);
		pStmt.setString(2, vIdVenda);
		pStmt.setString(3, registro["@nItem"]);
		pStmt.setString(4, registro.detPag.tPag);
		pStmt.setString(5, registro.detPag.DSTipoPagamento);
		pStmt.setFloat(6, registro.detPag.ValorRecebido);
		
		pStmt.setFloat(7, registro.detPag.ValorDeduzido||0.0);
		pStmt.setFloat(8, registro.detPag.ValorLiquido||0.0);
		setTimestampOrNull(pStmt, 9, registro.detPag.DTProcessamento);
		setTimestampOrNull(pStmt, 10, registro.detPag.DTVencimento);
		setIntOrNull(pStmt, 11, registro.detPag.NParcelas);
		pStmt.setString(12, registro.detPag.NoTEF);
		pStmt.setString(13, registro.detPag.NoAutorizador);
		pStmt.setString(14, registro.detPag.NoCartao);
		pStmt.setString(15, registro.detPag.NuOperacao);
		pStmt.setString(16, registro.detPag.NSUTEF);
		pStmt.setString(17, registro.detPag.NSUAutorizadora);
		pStmt.setString(18, registro.detPag.NuAutorizacao);
		pStmt.setString(19, registro.detPag.CPF);
		pStmt.setString(20, registro.detPag.NOME);

		pStmt.execute();
	}

	pStmt.close();

	conn.commit();
}

function fnIncluirMovimentoCaixa(conn, lstMov) {
    var qtdExists = api.executeScalar(' SELECT COUNT(ID) FROM "VAR_DB_NAME"."MOVIMENTOCAIXA" WHERE ID = ? ', lstMov[0].ID);
    
    if(qtdExists === 0){
    	var query = 'INSERT INTO "VAR_DB_NAME"."MOVIMENTOCAIXA" ' +
    		" ( " +
    		' "ID", ' +
    		' "IDEMPRESA", ' +
    		' "IDCAIXA", ' +
    		' "IDOPERADOR", ' +
    		' "IDSUPERVISOR", ' +
    		' "DTABERTURA", ' +
    		' "VRFISICODINHEIRO", ' +
    		' "VRRECDINHEIRO", ' +
    		' "VRQUEBRACAIXA", ' +
    		' "VRRECTEF", ' +
    		' "VRRECPOS", ' +
    		' "VRRECCONVENIO", ' +
    		' "VRRECVOUCHER", ' +
    		' "VRRECFATURA", ' +
    		' "VRRECPIX", ' +
    		' "VRRECPL", ' +
    		' "VRSANGRIA", ' +
    		' "STCANCELADO", ' +
    		' "STFECHADO", ' +
    		' "STCONFERIDO" '+
    		' ) ' +
    		' VALUES(?,?,?,?,-1,now(),0,0,0,0,0,0,0,0,0,0,0,\'False\',\'False\',false) ';
    
    	var pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    	
    	for (var i = 0; i < lstMov.length; i++) {
    
    		var registro = lstMov[i];
    		
    		pStmt.setString(1, registro.ID);
    		pStmt.setInt(2, registro.IDEMPRESA);
    		pStmt.setInt(3, registro.IDCAIXA);
    		pStmt.setInt(4, registro.IDOPERADOR);
    		
    		pStmt.execute();
    	}
    
    	pStmt.close();
    
    	conn.commit();
    }
}

function fnIncluirInventarioMovimento(conn, dataVenda, idempresa, lstProdMov) {
    var qtdInicio = 0;
	var qtdEntrada = 0;
	var qtdSaida = 0;
	var qtdSaidaTransferencia = 0;
	var qtdRetornoAjustePedido = 0;
	var qtdFinal = 0;
	var qtdEntradaVoucher = 0;
	var qtdAjusteBalanco = 0;
	
	var data = dataVenda.split(' ');

    
    for (var i = 0; i < lstProdMov.length; i++) {
        var registro = lstProdMov[i];
        
        var queryExistsMov = ' SELECT IDINVMOVIMENTO,QTDFINAL,QTDSAIDA  FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.prod.cProd+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + data[0] + ' 00:00:00\' AND \'' + data[0] + ' 23:59:59\')' +
        ' AND IDEMPRESA = ?  and STATIVO=\'True\'';
    
         var idMovExists = api.sqlQuery(queryExistsMov, idempresa);
         
       
        
        if(idMovExists.length === 0){
             
            var queryMovAnt = 'SELECT "IDINVMOVIMENTO", "IDEMPRESA", "IDPRODUTO", "QTDFINAL", "STATIVO" '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.prod.cProd+'\''+
            ' AND IDEMPRESA = ? ';
            
            var UltMovimentoProduto = api.sqlQuery(queryMovAnt, idempresa);
           
            if(UltMovimentoProduto.length > 0){
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdSaida = registro.prod.qtd;
               qtdFinal = qtdInicio - qtdSaida;
               //Atualiza o status para false do Ultimo Movimento
               var queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
        		' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmtAtualizaStatus = conn.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
            }else{
               qtdSaida = registro.prod.qtd;
               qtdFinal = qtdInicio - qtdSaida;
            }
            
            
    	    var query = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
    		" ( " +
    		' "IDINVMOVIMENTO", ' +
    		' "IDEMPRESA", ' +
    		' "DTMOVIMENTO", ' +
    		' "IDPRODUTO", ' +
    	    ' "QTDINICIO", ' +
    		' "QTDENTRADA", ' +
    		' "QTDSAIDA", ' +
    		' "QTDSAIDATRANSFERENCIA", ' +
    		' "QTDRETORNOAJUSTEPEDIDO", ' +
    		' "QTDFINAL", ' +
    		' "QTDAJUSTEBALANCO", ' +
    		' "STATIVO", ' +
    		' "QTDENTRADAVOUCHER" '+
    		' ) ' +
    		' VALUES("VAR_DB_NAME"."SEQ_INVENTARIOMOVIMENTO".NEXTVAL,?,now(),?,?,?,?,?,?,?,?,\'True\',?) ';
    
        	var pStmt = conn.prepareStatement(api.replaceDbName(query));
            	
            pStmt.setInt(1, idempresa);
            pStmt.setString(2, registro.prod.cProd);
        	pStmt.setInt(3, qtdInicio);
        	pStmt.setInt(4, qtdEntrada);
        	pStmt.setInt(5, qtdSaida);
        	pStmt.setInt(6, qtdSaidaTransferencia);
        	pStmt.setInt(7, qtdRetornoAjustePedido);
        	pStmt.setInt(8, qtdFinal);
        	pStmt.setInt(9, qtdAjusteBalanco);
        	pStmt.setInt(10, qtdEntradaVoucher);
        	
        	pStmt.execute();
        	 pStmt.close();
        	 conn.commit();
        }else{
            
            
            
            qtdSaida = registro.prod.qtd + parseInt(idMovExists[0].QTDSAIDA);
            qtdFinal = parseInt(idMovExists[0].QTDFINAL) - registro.prod.qtd;
             var queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "QTDSAIDA" =  ?, ' +
        		' "QTDFINAL" =  ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
            	pStmt2.setInt(1, qtdSaida);
            	
            	pStmt2.setInt(2, qtdFinal);
            	
                pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
                pStmt2.execute();
                pStmt2.close();
                conn.commit();
                
        }
        
    }
   
    conn.commit();
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
			' "DEST_CPF" ,' +
			' "TXTMOTIVODESCONTO" ' +
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
		query = query + ',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {
            
            var data = [];
			var registro = bodyJson[i];
			
			var queryVenda = 'SELECT * FROM "VAR_DB_NAME"."VENDA" WHERE '+
			' IDMOVIMENTOCAIXAWEB = ? AND DTHORAFECHAMENTO = \''+ registro.DTHORAFECHAMENTO +'\'';
			 
			var verificaVenda = api.sqlQuery(queryVenda,registro.IDMOVIMENTOCAIXAWEB);
			
			if(verificaVenda.length > 0){
			    return {
        			"msgError": "Venda já existe!"
        		};
			}

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
			pStmt.setString(100, registro.TXTMOTIVODESCONTO);
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
			fnIncluirDetalhes(conn, registro.NFe.infNFe.det, registro.IDVENDA);
			fnIncluirPagamentos(conn, registro.NFe.infNFe.pag, registro.IDVENDA);
			
			var movimento = {
				"ID": registro.IDMOVIMENTOCAIXAWEB,
				"IDCAIXA": registro.IDCAIXAWEB,
				"IDOPERADOR": registro.IDOPERADOR,
				"IDEMPRESA": registro.IDEMPRESA
			};
			
		
		    data.push(movimento);
			fnIncluirMovimentoCaixa(conn,data);
			fnIncluirInventarioMovimento(conn, registro.DTHORAFECHAMENTO, registro.IDEMPRESA, registro.NFe.infNFe.det);
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
		' "DEST_CPF"  = ?' +
    	' WHERE "IDVENDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
			pStmt.setInt(1, registro.IDCAIXAWEB);
			pStmt.setInt(2, registro.IDOPERADOR);
			pStmt.setInt(3, registro.IDEMPRESA);
			pStmt.setDate(4, registro.DTHORAABERTURA);
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
			
			pStmt.setString(1, registro.IDVENDA);
                    
    	pStmt.execute();
    	//var queryExclusaoVendaDetahe = 'DELETE FROM "VAR_DB_NAME"."VENDA" WHERE IDVENDA = ?';
    	//api.sqlQuery(queryExclusaoVendaDetahe,); 
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}*/

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
		/*case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;*/
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