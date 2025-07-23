var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.notas-transferencia.entrada-nfe", "slApi");
var msg;

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

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
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

function fnVincularNotaAoPedido(idResumoPedido, idResumoEntradaDanfe, registro) {
    var conn = $.db.getConnection();
    
   // var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDPEDIDONOTA")), 0) + 1 FROM "VAR_DB_NAME"."VINCPEDIDONOTA" WHERE 1 = ? ', 1);
    var idPedido = idResumoPedido;
    var idNotaFiscal = idResumoEntradaDanfe;
    
    var queryVincNFPedido = 'SELECT IDPEDIDONOTA '+
        ' FROM "VAR_DB_NAME"."VINCPEDIDONOTA" WHERE IDRESUMOPEDIDO =\''+ idPedido+'\''+
            ' AND IDRESUMOENTRADA= ?'; 
         
        var vincNFPedido = api.sqlQuery(queryVincNFPedido, idNotaFiscal);
            
    if(vincNFPedido.length > 0 ){
        var idVinculo = parseInt(vincNFPedido[0]["IDPEDIDONOTA"]);
        
        var vinculo = {
    	    "idVinculo": idVinculo,
    	    "idResumoPedido": idPedido,
    	    "idNotaFiscal": idNotaFiscal
    	};
    	
        var query = `UPDATE "VAR_DB_NAME"."VINCPEDIDONOTA" SET 
             "STATIVO" = 'True'
    	     WHERE "IDPEDIDONOTA" = ${idVinculo}`;
        
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
                        
        pStmt.execute();
        
    	pStmt.close();
    
    	conn.commit();
    	
    	registro.vincNotaPedido = vinculo;
    	msg = "Pedido já Vinculado a Essa Nota Fiscal, Faça a Conciliação!";
        
    } else{
    
        var query = `
        INSERT 
            INTO "VAR_DB_NAME"."VINCPEDIDONOTA" 
            ( 
                "IDRESUMOPEDIDO",
                "IDRESUMOENTRADA",
                "STATIVO"
            )
    		VALUES(?,?,'True')`;
    		
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
            
        //pStmt.setInt(1, parseInt(queryId));
        pStmt.setInt(1, parseInt(idPedido));
        pStmt.setInt(2, parseInt(idNotaFiscal));
    
        pStmt.execute();
        
    	pStmt.close();
    
    	conn.commit();
    	
    	var vinculo = {
    	    "idVinculo": queryId,
    	    "idResumoPedido": idPedido,
    	    "idNotaFiscal": idNotaFiscal
    	};
    	
    	registro.vincNotaPedido = vinculo;
    	msg = "Inclusão realizada com sucesso!";
    }
}

function fnIncluirDetalheProdutosDanfePedido(idResumoEntrada, lstDet, conn){
    
    var query = `INSERT INTO "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO"  
        (
        "IDDETALHEENTRADA",
        "IDRESUMOENTRADA",
        "IDDETALHEPEDIDO",
        "CPROD",
        "XPROD",
        "NCM",
        "CFOP",
        "UCOM",
        "QCOM",
        "VUNCOM",
        "VPROD",
        "VDESC",
        "CSTICMS",
        "BCICMS",
        "PICMS",
        "VLICMS",
        "CSTIPI",
        "BCIPI",
        "PIPI",
        "VLIPI",
        "CSTPIS",
        "BCPIS",
        "PPIS",
        "VLPIS",
        "CSTCOFINS",
        "BCCOFINS",
        "PCOFINS",
        "VLCOFINS",
        "STDIFERENCA",
        "STDIVERGENCIA",
        "DSOBSERVACAODIVERGENCIA",
        "QTDDIVERGENCIA",
        "CEAN",
        "IDPRODUTO"
        ) 
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	
	for (var i = 0; i < lstDet.length; i++) {
	    var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDDETALHEENTRADA")), 0) + 1 FROM "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" WHERE 1 = ? ', 1);
	    lstDet[i].IDDETALHEENTRADA = queryId;
	    
		var registro = lstDet[i];
        
		pStmt.setInt(1, parseInt(queryId));
		pStmt.setInt(2, parseInt(idResumoEntrada));
		setIntOrNull(pStmt, 3, registro.IDDETALHEPEDIDO);
		setStringOrNull(pStmt, 4, registro.CPROD);
		pStmt.setString(5, registro.XPROD);
		pStmt.setString(6, registro.NCM);
		setStringOrNull(pStmt, 7, registro.CFOP);
		pStmt.setString(8, registro.UCOM);
		pStmt.setFloat(9, registro.QCOM);
		pStmt.setFloat(10, registro.VUNCOM);
		pStmt.setFloat(11, registro.VPROD);
		setFloatOrNull(pStmt, 12, registro.VDESC);
		setStringOrNull(pStmt, 13, registro.CSTICMS);
		setFloatOrNull(pStmt, 14, registro.BCICMS);
		setFloatOrNull(pStmt, 15, registro.PICMS);
		setFloatOrNull(pStmt, 16, registro.VLICMS);
		setStringOrNull(pStmt, 17, registro.CSTIPI);
		setFloatOrNull(pStmt, 18, registro.BCIPI);
		setFloatOrNull(pStmt, 19, registro.PIPI);
		setFloatOrNull(pStmt, 20, registro.VLIPI);
		setStringOrNull(pStmt, 21, registro.CSTPIS);
		setFloatOrNull(pStmt, 22, registro.BCPIS);
		setFloatOrNull(pStmt, 23, registro.PPIS);
		setFloatOrNull(pStmt, 24, registro.VLPIS);
		setStringOrNull(pStmt, 25, registro.CSTCOFINS);
		setFloatOrNull(pStmt, 26, registro.BCCOFINS);
		setFloatOrNull(pStmt, 27, registro.PCOFINS);
		setFloatOrNull(pStmt, 28, registro.VLCOFINS);
		setStringOrNull(pStmt, 29, registro.STDIFERENCA);
		setStringOrNull(pStmt, 30, registro.STDIVERGENCIA);
		setStringOrNull(pStmt, 31, registro.DSOBSERVACAODIVERGENCIA);
		setIntOrNull(pStmt, 32, registro.QTDDIVERGENCIA);
		setStringOrNull(pStmt, 33, registro.CEAN);
		setStringOrNull(pStmt, 34, registro.IDPRODUTO);
	    
		pStmt.execute();
		//conn.commit();
	}

    msg = "Nota Cadastrada Com Sucesso!"
    
	pStmt.close();
   
   //fnVinculaQtdPedidoQtdNFE(lstDet, lstDetEstoque, conn)

}

function fnVinculaQtdPedidoQtdNFE(lstDetProd, conn){
    let queryId;
    let pStmt;
    let qtdProdPed = 0;
    let qtdNota = 0;
    let qtdVinculado = 0;
    let qtdFaltaPed = 0;
    let qtdFaltaNota = 0;

	for (let i = 0; i < lstDetProd.length; i++) {
	    
	    let registro = lstDetProd[i];
	    
	    let queryExistsReg = ' SELECT *  FROM "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" WHERE ' +
        ' IDDETALHEPEDIDO=\''+ registro.IDDETALHEPEDIDO+'\'' +
        ' AND IDDETALHEPRODUTOPEDIDO=\''+ registro.IDDETALHEPRODUTOPEDIDO+'\'' +
        ' AND IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND IDDETALHEENTRADA = ? AND STATIVO=\'True\' AND STESTOQUE=\'False\' ';
    
         let idRegExists = api.sqlQuery(queryExistsReg, parseInt(registro.IDDETALHEENTRADA));
       
        if(idRegExists.length > 0){
           let queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" SET ' + 
                ' STATIVO=\'False\' ' +
        		' WHERE "IDDETPEDIDODETNOTA" =  ? ';
                
            let pStmtAtualizaStatus = conn.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                
            pStmtAtualizaStatus.setInt(1, parseInt(idRegExists[0].IDDETPEDIDODETNOTA));
            pStmtAtualizaStatus.execute();
            pStmtAtualizaStatus.close();
            conn.commit();
        } else{
            queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDDETPEDIDODETNOTA")), 0) + 1 FROM "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" WHERE 1 = ? ', 1);
        	    
    	    let query = `INSERT INTO "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" 
        	( 
            "IDDETPEDIDODETNOTA",
            "IDDETALHEENTRADA",
            "IDDETALHEPEDIDO",
            "IDDETALHEPRODUTOPEDIDO",
            "IDPRODUTO",
            "QTDDETPRODPEDIDO",
            "QTDVINCULADO",
            "QTDFALTADETPRODPEDIDO",
            "STATIVO",
            "STESTOQUE"
        	)
    		VALUES(?,?,?,?,?,?,?,?,'True', 'False')`;
    		
            pStmt = conn.prepareStatement(api.replaceDbName(query))
            
            pStmt.setInt(1, parseInt(queryId));
            pStmt.setInt(2, registro.IDDETALHEENTRADA);
            pStmt.setInt(3, registro.IDDETALHEPEDIDO);
            pStmt.setInt(4, registro.IDDETALHEPRODUTOPEDIDO);
            pStmt.setString(5, registro.IDPRODUTO);
            pStmt.setFloat(6, registro.QTDDETPRODPEDIDO);
            pStmt.setFloat(7, registro.QTDVINCULO);
            pStmt.setFloat(8, registro.QTDFALTADETPRODPEDIDO);
    
            pStmt.execute();
            //conn.commit();
        }
	}
	   
	pStmt.close();
	
	//fnMovimentaInventario(lstDetEstoque, conn);
	
	return {
	    "statusPost": "Success",
	    "msg": "Inclusão realizada com sucesso!",
	};
    
}

function fnMovimentaInventario(lstDetProdRecepcao, conn) {
    
    let idEmpresa;
    let qtdInicio = 0;
	let qtdEntrada = 0;
	let qtdSaida = 0;
	let qtdSaidaTransferencia = 0;
	let qtdRetornoAjustePedido = 0;
	let qtdFinal = 0;
	let qtdAjusteBalanco = 0;
	let qtdEntradaVoucher = 0;
	
	let date = new Date();
	let dd = ("0" + date.getDate()).slice(-2);
    let mm = ("0" + (date.getMonth() + 1)).slice(-2);
    let y = date.getFullYear();
 
    let dataAtual = y + '-' + mm + '-' + dd;
    let conn2 = conn; //$.db.getConnection();
	
    for (let i = 0; i < lstDetProdRecepcao.length; i++) {
        let registro = lstDetProdRecepcao[i];
        
        idEmpresa = registro.IDEMPRESA;
        
        let queryExistsMov = ' SELECT *  FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + dataAtual + ' 00:00:00\' AND \'' + dataAtual + ' 23:59:59\')' +
        ' AND IDEMPRESA = ? AND STATIVO=\'True\'';
    
         let idMovExists = api.sqlQuery(queryExistsMov, parseInt(idEmpresa));
         
        if(idMovExists.length === 0){
            qtdInicio = 0;
            let queryMovAnt = 'SELECT * '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.IDPRODUTO+'\''+
            ' AND IDEMPRESA = ? ';
            
            let UltMovimentoProduto = api.sqlQuery(queryMovAnt, parseInt(idEmpresa));
            
            if(UltMovimentoProduto.length > 0){
               
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdEntrada = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntrada;
               //Atualiza o status para false do Ultimo Movimento
               let queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
        		' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                let pStmtAtualizaStatus = conn2.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
                conn2.commit();
            }else{
                
               qtdEntrada = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntrada;
            }
            
            
    	    let query = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
    		" ( " +
    		' "IDINVMOVIMENTO", ' +
    		' "IDEMPRESA", ' +
    		' "DTMOVIMENTO", ' +
    		' "IDPRODUTO", ' +
    	    ' "QTDINICIO", ' +
    	    ' "QTDENTRADAVOUCHER", '+
    		' "QTDENTRADA", ' +
    		' "QTDSAIDA", ' +
    		' "QTDSAIDATRANSFERENCIA", ' +
    		' "QTDRETORNOAJUSTEPEDIDO", ' +
    		' "QTDFINAL", ' +
    		' "QTDAJUSTEBALANCO", ' +
    		' "STATIVO" ' +
    		' ) ' +
    		' VALUES("VAR_DB_NAME"."SEQ_INVENTARIOMOVIMENTO".NEXTVAL,?,now(),?,?,?,?,?,?,?,?,?,\'True\') ';
    
        	let pStmt = conn2.prepareStatement(api.replaceDbName(query));
            	
            pStmt.setInt(1, parseInt(idEmpresa));
            pStmt.setString(2, registro.IDPRODUTO);
        	pStmt.setInt(3, qtdInicio);
        	pStmt.setInt(4, qtdEntradaVoucher);
        	pStmt.setInt(5, qtdEntrada);
        	pStmt.setInt(6, qtdSaida);
        	pStmt.setInt(7, qtdSaidaTransferencia);
        	pStmt.setInt(8, qtdRetornoAjustePedido);
        	pStmt.setInt(9, qtdFinal);
        	pStmt.setInt(10, qtdAjusteBalanco);
        	
        	pStmt.execute();
        	pStmt.close();
        	conn2.commit();
        }else{
    
            qtdEntrada = parseInt(registro.QTD) + parseInt(idMovExists[0].QTDENTRADA);
            qtdFinal = parseInt(idMovExists[0].QTDINICIO) + qtdEntrada - parseInt(idMovExists[0].QTDSAIDA) - parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA);
            
             let queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "QTDENTRADA" =  ?, ' +
        		' "QTDFINAL" =  ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
            let pStmt2 = conn2.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
        	pStmt2.setInt(1, qtdEntrada);
        	pStmt2.setInt(2, qtdFinal);
        	
            pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
            pStmt2.execute();
            pStmt2.close();
            conn2.commit();
        }
        
    }
   
   return {
       msg: 'Estoque Atualizado com Sucesso!'
   }
}

function obterLinhasDoDetalheNotaEntrada(idResumoEntrada) {

	var query = `SELECT
                	TBDP.IDPRODUTO,
                	TBDP.XPROD,
                	TBRP.IDEMPRESA,
                	TBDP.QCOM,
                	TBDP.VUNCOM,
                	TBDP.VPROD,
                	TBDP.CEAN,
                	TBRP.STCANCELADO
                FROM
                	DETALHEENTRADANFEPEDIDO AS TBDP
                INNER JOIN RESUMOENTRADANFEPEDIDO TBRP ON
                	TBRP.IDRESUMOENTRADA = TBDP.IDRESUMOENTRADA
                WHERE
                	TBRP.IDRESUMOENTRADA=?`;

	var linhas = api.sqlQuery(query, idResumoEntrada);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var detProd =
			    {
			    "nItem": (i + 1),
				"IDPRODUTO": det.IDPRODUTO,
            	"DSPRODUTO": det.XPROD,
            	"QTD": det.QCOM,
            	"EMPDESTINO": det.IDEMPRESA,
            	"VRUNITARIO": det.VUNCOM,
            	"VRTOTALPROD": det.VPROD,
            	"NUCODBARRAS": det.CEAN,
            	"STCANCELADO": det.STCANCELADO
			    };

		lines.push(detProd);
	}

	return lines;
}

function fnHandleGet(byId) {
    
    var idPedido = $.request.parameters.get("idpedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var numSerie = $.request.parameters.get("numSerie");
    var numNFE = $.request.parameters.get("numNFE");
    var sttransformado = $.request.parameters.get("sttransformado");
    var idFornecedores = $.request.parameters.get("idFornecedores");

    var query =  `SELECT
    	"IDRESUMOENTRADA",
    	"IDGRUPOEMPRESARIAL",
    	"IDSUBGRUPOEMPRESARIAL",
    	"IDEMPRESA",
    	"IDFORNECEDOR",
    	"IDRESUMOPEDIDO",
    	"CUF",
    	"CNF",
    	"NATOP",
    	"INDPAG",
    	"XMOD",
    	"SERIE",
    	"NNF",
    	TO_VARCHAR("DEMI", 'YYYY-MM-DD') AS "DEMI",
    	IFNULL(TO_VARCHAR("DEMI", 'DD/MM/YYYY'), 'Não Informado') AS "DEMIFORMATADA",
    	"DSAIENT",
    	"TPNF",
    	"CMUNFG",
    	"TPIMP",
    	"TPEMIS",
    	"CDV",
    	"TPAMB",
    	"FINNFE",
    	"PROCEMI",
    	"VERPROC",
    	"XMOTIVO",
    	"NPROT",
    	"EMIT_CPF",
    	"EMIT_CNPJ",
    	"EMIT_XNOME",
    	"EMIT_XFANT",
    	"EMIT_XLGR",
    	"EMIT_NRO",
    	"EMIT_XBAIRRO",
    	"EMIT_CMUN",
    	"EMIT_XMUN",
    	"EMIT_UF",
    	"EMIT_CEP",
    	"EMIT_CPAIS",
    	"EMIT_XPAIS",
    	"EMIT_FONE",
    	"EMIT_IE",
    	"EMIT_IM",
    	"EMIT_CNAE",
    	"EMIT_CRT",
    	"DEST_CNPJ",
    	"DEST_XNOME",
    	"DEST_XLGR",
    	"DEST_NRO",
    	"DEST_XBAIRRO",
    	"DEST_CMUN",
    	"DEST_XMUN",
    	"DEST_UF",
    	"DEST_CEP",
    	"DEST_CPAIS",
    	"DEST_XPAIS",
    	"DEST_IE",
    	"VBC",
    	"VICMS",
    	"VBCST",
    	"VST",
    	"VPROD",
    	"VNF",
    	"VFRETE",
    	"VSEG",
    	"VDESC",
    	"VIPI",
    	"VPIS",
    	"VCOFINS",
    	"VOUTRO",
    	"STDIVERGENCIA",
    	"STCONCLUIDO",
    	"NDUPLICATA",
    	"VENCIDUPLICATADATE",
    	"VALORDUPLICATA",
    	"STNFE",
    	TO_VARCHAR("DTCADASTRO", 'YYYY-MM-DD') AS "DTCADASTRO",
    	IFNULL(TO_VARCHAR("DTCADASTRO", 'DD/MM/YYYY'), 'Não Informado') AS "DTCADASTROFORMATADA",
    	"STSALDO",
    	"STCANCELADO",
    	"STMIGRADOSAP",
    	TO_VARCHAR("LOGSAP") as LOGSAP,
    	"IDCOMPRADOR",
    	"IDCONDPAGAMENTO",
    	"IDUSOPRINCIPAL",
    	"MODFRETE",
    	"IDMARCA",
    	"CHNFE",
    	"OBSERVACOES"
    FROM
    	"VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO"
    WHERE
    	1 = ?`;
    	
    var query2 =  `SELECT DISTINCT
    	"IDFORNECEDOR",
    	"EMIT_XNOME",
    	"EMIT_XFANT"
    FROM
    	"VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO"
    WHERE
        1 = ?`;
    
    if ( byId ) {
        query = query + ' And  IDRESUMOENTRADA = \'' + byId + '\' ';
        
    } else {
        if ( idPedido ) {
            query = query + ' And  IDRESUMOPEDIDO = \'' + idPedido + '\' ';
        }
    
        if ( idFornecedor ) {
            query = `${query} AND IDFORNECEDOR = ${idFornecedor}`;
        }
    
        if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND ((DEMI BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
            query = query + ' OR (DTCADASTRO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\'))';
        }
        
        if(numSerie && numNFE) {
            query = `${query}  AND SERIE = ${numSerie} AND  NNF = ${numNFE}`;
        }
        
    }
    
    query = query + ' ORDER BY DTCADASTRO, DEMI ';
    
    var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	let response = api.sqlQueryPage(query, request, 1);
	let data = [];
    
    for (var i = 0; i < response.data.length; i++) {

		let registro = response.data[i];

		var nota = {
                "IDRESUMOENTRADA": registro.IDRESUMOENTRADA,
                "IDGRUPOEMPRESARIAL": registro.IDGRUPOEMPRESARIAL,
                "IDSUBGRUPOEMPRESARIAL": registro.IDSUBGRUPOEMPRESARIAL,
                "IDEMPRESA": registro.IDEMPRESA,
                "IDFORNECEDOR": registro.IDFORNECEDOR,
                "IDRESUMOPEDIDO": registro.IDRESUMOPEDIDO,
                "CUF": registro.CUF,
                "CNF": registro.CNF,
                "NATOP": registro.NATOP,
                "INDPAG": registro.INDPAG,
                "XMOD": registro.XMOD,
                "SERIE": registro.SERIE,
                "NNF": registro.NNF,
                "CHNFE": registro.CHNFE,
                "DEMI": registro.DEMI,
                "DEMIFORMATADA": registro.DEMIFORMATADA,
                "DSAIENT": registro.DSAIENT,
                "TPNF": registro.TPNF,
                "CMUNFG": registro.CMUNFG,
                "TPIMP": registro.TPIMP,
                "TPEMIS": registro.TPEMIS,
                "CDV": registro.CDV,
                "TPAMB": registro.TPAMB,
                "FINNFE": registro.FINNFE,
                "PROCEMI": registro.PROCEMI,
                "VERPROC": registro.VERPROC,
                "XMOTIVO": registro.XMOTIVO,
                "NPROT": registro.NPROT,
                "EMIT_CPF": registro.EMIT_CPF,
                "EMIT_CNPJ": registro.EMIT_CNPJ,
                "EMIT_XNOME": registro.EMIT_XNOME,
                "EMIT_XFANT": registro.EMIT_XFANT,
                "EMIT_XLGR": registro.EMIT_XLGR,
                "EMIT_NRO": registro.EMIT_NRO,
                "EMIT_XBAIRRO": registro.EMIT_XBAIRRO,
                "EMIT_CMUN": registro.EMIT_CMUN,
                "EMIT_XMUN": registro.EMIT_XMUN,
                "EMIT_UF": registro.EMIT_UF,
                "EMIT_CEP": registro.EMIT_CEP,
                "EMIT_CPAIS": registro.EMIT_CPAIS,
                "EMIT_XPAIS": registro.EMIT_XPAIS,
                "EMIT_FONE": registro.EMIT_FONE,
                "EMIT_IE": registro.EMIT_IE,
                "EMIT_IM": registro.EMIT_IM,
                "EMIT_CNAE": registro.EMIT_CNAE,
                "EMIT_CRT": registro.EMIT_CRT,
                "DEST_CNPJ": registro.DEST_CNPJ,
                "DEST_XNOME": registro.DEST_XNOME,
                "DEST_XLGR": registro.DEST_XLGR,
                "DEST_NRO": registro.DEST_NRO,
                "DEST_XBAIRRO": registro.DEST_XBAIRRO,
                "DEST_CMUN": registro.DEST_CMUN,
                "DEST_XMUN": registro.DEST_XMUN,
                "DEST_UF": registro.DEST_UF,
                "DEST_CEP": registro.DEST_CEP,
                "DEST_CPAIS": registro.DEST_CPAIS,
                "DEST_XPAIS": registro.DEST_XPAIS,
                "DEST_IE": registro.DEST_IE,
                "VBC": registro.VBC,
                "VICMS": registro.VICMS,
                "VBCST": registro.VBCST,
                "VST": registro.VST,
                "VPROD": registro.VPROD,
                "VNF": registro.VNF,
                "VFRETE": registro.VFRETE,
                "VSEG": registro.VSEG,
                "VDESC": registro.VDESC,
                "VIPI": registro.VIPI,
                "VPIS": registro.VPIS,
                "VCOFINS": registro.VCOFINS,
                "VOUTRO": registro.VOUTRO,
                "STDIVERGENCIA": registro.STDIVERGENCIA,
                "STCONCLUIDO": registro.STCONCLUIDO,
                "NDUPLICATA": registro.NDUPLICATA,
                "VENCIDUPLICATADATE": registro.VENCIDUPLICATADATE,
                "VALORDUPLICATA": registro.VALORDUPLICATA,
                "STNFE": registro.STNFE,
                "DTCADASTRO": registro.DTCADASTRO,
                "DTCADASTROFORMATADA": registro.DTCADASTROFORMATADA,
                "STSALDO": registro.STSALDO,
                "STCANCELADO": registro.STCANCELADO,
                "STMIGRADOSAP": registro.STMIGRADOSAP,
                "LOGSAP": registro.LOGSAP,
                "IDCOMPRADOR": registro.IDCOMPRADOR,
                "IDCONDPAGAMENTO": registro.IDCONDPAGAMENTO,
                "IDUSOPRINCIPAL": registro.IDUSOPRINCIPAL,
                "MODFRETE": registro.MODFRETE,
                "IDMARCA": registro.IDMARCA,
                "OBSERVACOES": registro.OBSERVACOES,
                "detalheProdutosNotaEntrada": obterLinhasDoDetalheNotaEntrada(registro.IDRESUMOENTRADA)
		};

		data.push(nota);

	}

	response.data = data;

	return response;
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" SET ' + 
        ' "STDIVERGENCIA" = ?, ' + 
        ' "QTDDIVERGENCIA" = ?, ' + 
    	' WHERE "IDDETALHEENTRADA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(3, registro.MODPEDIDO);
        pStmt.setString(4, registro.NORAZAOSOCIAL);
        pStmt.setString(5, registro.NOFANTASIA);
        pStmt.setString(6, registro.NUCNPJ);
        pStmt.setString(7, registro.NUINSCESTADUAL);
        pStmt.setString(8, registro.NUINSCMUNICIPAL);
        pStmt.setString(9, registro.NUIBGE);
        pStmt.setString(10, registro.EENDERECO);
        pStmt.setString(11, registro.ENUMERO);
        pStmt.setString(12, registro.ECOMPLEMENTO);
        pStmt.setString(13, registro.EBAIRRO);
        pStmt.setString(14, registro.ECIDADE);
        pStmt.setString(15, registro.SGUF);
        pStmt.setString(16, registro.NUCEP);
        pStmt.setString(17, registro.EEMAIL);
        pStmt.setString(18, registro.NUTELEFONE1);
        pStmt.setString(19, registro.NUTELEFONE2);
        pStmt.setString(20, registro.NUTELEFONE3);
        pStmt.setString(21, registro.NOREPRESENTANTE);
        setTimestampOrNull(pStmt,22, registro.DTCADASTRO);
        setTimestampOrNull(pStmt,23, registro.DTULTATUALIZACAO);
        pStmt.setString(24, registro.STATIVO);
        pStmt.setInt(25, registro.IDCONDPAGPADRAO);
        pStmt.setInt(26, registro.IDTRANSPORTADORAPADRAO);
        pStmt.setString(27, registro.TPPEDIDOPADRAO);
        pStmt.setString(28, registro.NOVENDEDORPADRAO);
        pStmt.setString(29, registro.TPFRETEPADRAO);
        pStmt.setString(30, registro.TPARQUIVOPADRAO);
        pStmt.setString(31, registro.TPFISCALPADRAO);
        pStmt.setString(32, registro.EMAILVENDEDORPADRAO);
        pStmt.setString(33, registro.IDFORNECEDOR);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    
    var query = `INSERT INTO "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" 
    	( 
    	"IDRESUMOENTRADA",
		"IDGRUPOEMPRESARIAL",
		"IDSUBGRUPOEMPRESARIAL",
		"IDEMPRESA",
		"IDFORNECEDOR",
		"CUF",
		"CNF",
		"NATOP",
		"INDPAG",
		"XMOD",
		"SERIE",
		"NNF",
		"DEMI",
		"DSAIENT",
		"TPNF",
		"CMUNFG",
		"TPIMP",
		"TPEMIS",
		"CDV",
		"TPAMB",
		"FINNFE",
		"PROCEMI",
		"VERPROC",
		"XMOTIVO",
		"NPROT",
		"EMIT_CPF",
		"EMIT_CNPJ",
		"EMIT_XNOME",
		"EMIT_XFANT",
		"EMIT_XLGR",
		"EMIT_NRO",
		"EMIT_XBAIRRO",
		"EMIT_CMUN",
		"EMIT_XMUN",
		"EMIT_UF",
		"EMIT_CEP",
		"EMIT_CPAIS",
		"EMIT_XPAIS",
		"EMIT_FONE",
		"EMIT_IE",
		"EMIT_IM",
		"EMIT_CNAE",
		"EMIT_CRT",
		"DEST_CNPJ",
		"DEST_XNOME",
		"DEST_XLGR",
		"DEST_NRO",
		"DEST_XBAIRRO",
		"DEST_CMUN",
		"DEST_XMUN",
		"DEST_UF",
		"DEST_CEP",
		"DEST_CPAIS",
		"DEST_XPAIS",
		"DEST_IE",
		"VBC",
		"VICMS",
		"VBCST",
		"VST",
		"VPROD",
		"VNF",
		"VFRETE",
		"VSEG",
		"VDESC",
		"VIPI",
		"VPIS",
		"VCOFINS",
		"VOUTRO",
		"STDIVERGENCIA",
		"STCONCLUIDO",
		"NDUPLICATA",
		"VENCIDUPLICATADATE",
		"VALORDUPLICATA",
		"STNFE",
		"DTCADASTRO",
		"CHNFE",
		"IDUSOPRINCIPAL",
		"IDCONDPAGAMENTO",
		"STCANCELADO",
		"STSALDO",
		"IDMARCA",
		"OBSERVACOES",
		"IDCOMPRADOR",
		"MODFRETE"
    	)
		VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'False',?,?,?,?,?)`;
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    
	for (let i = 0; i < bodyJson.length; i++) {
        var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDRESUMOENTRADA")), 0) + 1 FROM "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" WHERE 1 = ? ', 1);
		var registro = bodyJson[i];
		var idResumoEntrada = queryId;

        var queryCodNNF = 'SELECT IDRESUMOENTRADA '+
        ' FROM "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" WHERE NNF = ?'+
            ' AND CHNFE=\''+ registro.CHNFE+'\' AND STCANCELADO = \'False\''; 
         
        var CodNNF = api.sqlQuery(queryCodNNF,registro.NNF);
    
        if(CodNNF.length >0 ){
            return {
                "statusPost": "warning",
                "msg": "Nota Fiscal Já Cadastrada",
                "NotaCadastrada": registro
            };
        } else{
            
            pStmt.setInt(1, parseInt(queryId));
        	setIntOrNull(pStmt, 2, registro.IDGRUPOEMPRESARIAL);
        	setIntOrNull(pStmt, 3, registro.IDSUBGRUPOEMPRESARIAL);
        	setIntOrNull(pStmt, 4, registro.IDEMPRESA);
        	setIntOrNull(pStmt, 5, registro.IDFORNECEDOR);
        	pStmt.setString(6, registro.CUF);
        	pStmt.setString(7, registro.CNF);
        	setStringOrNull(pStmt, 8, registro.NATOP);
            setStringOrNull(pStmt, 9, registro.INDPAG);
            pStmt.setInt(10, registro.XMOD);
            pStmt.setInt(11, registro.SERIE);
            pStmt.setInt(12, registro.NNF);
            pStmt.setDate(13, registro.DEMI);
            pStmt.setDate(14, registro.DSAIENT);
            pStmt.setString(15, registro.TPNF);
            setIntOrNull(pStmt, 16, registro.CMUNFG);
            setIntOrNull(pStmt, 17, registro.TPIMP);
            pStmt.setInt(18, registro.TPEMIS);
            pStmt.setInt(19, registro.CDV);
            pStmt.setString(20, registro.TPAMB);
            pStmt.setInt(21, registro.FINNFE);
            setIntOrNull(pStmt, 22, registro.PROCEMI);
            setStringOrNull(pStmt, 23, registro.VERPROC);
            setStringOrNull(pStmt, 24, registro.XMOTIVO);
            setStringOrNull(pStmt, 25, registro.NPROT);
            setStringOrNull(pStmt, 26, registro.EMIT_CPF);
            pStmt.setString(27, registro.EMIT_CNPJ);
            pStmt.setString(28, registro.EMIT_XNOME);
            pStmt.setString(29, registro.EMIT_XFANT);
            pStmt.setString(30, registro.EMIT_XLGR);
            setStringOrNull(pStmt, 31, registro.EMIT_NRO);
            pStmt.setString(32, registro.EMIT_XBAIRRO);
            setIntOrNull(pStmt, 33, registro.EMIT_CMUN);
            setStringOrNull(pStmt, 34, registro.EMIT_XMUN);
            setStringOrNull(pStmt, 35, registro.EMIT_UF);
            pStmt.setString(36, registro.EMIT_CEP);
            setIntOrNull(pStmt, 37, registro.EMIT_CPAIS);
            setStringOrNull(pStmt, 38, registro.EMIT_XPAIS);
            setStringOrNull(pStmt, 39, registro.EMIT_FONE);
            setStringOrNull(pStmt, 40, registro.EMIT_IE);
            setStringOrNull(pStmt, 41, registro.EMIT_IM);
            setStringOrNull(pStmt, 42, registro.EMIT_CNAE);
            setStringOrNull(pStmt, 43, registro.EMIT_CRT);
            pStmt.setString(44, registro.DEST_CNPJ);
            pStmt.setString(45, registro.DEST_XNOME);
            pStmt.setString(46, registro.DEST_XLGR);
            setStringOrNull(pStmt, 47, registro.DEST_NRO);
            pStmt.setString(48, registro.DEST_XBAIRRO);
            setIntOrNull(pStmt, 49, registro.DEST_CMUN);
            pStmt.setString(50, registro.DEST_XMUN);
            pStmt.setString(51, registro.DEST_UF);
            pStmt.setString(52, registro.DEST_CEP);
            setIntOrNull(pStmt, 53, registro.DEST_CPAIS);
            setStringOrNull(pStmt, 54, registro.DEST_XPAIS);
            pStmt.setString(55, registro.DEST_IE);
            setFloatOrNull(pStmt, 56, registro.VBC);
            setFloatOrNull(pStmt, 57, registro.VICMS);
            setFloatOrNull(pStmt, 58, registro.VBCST);
            setFloatOrNull(pStmt, 59, registro.VST);
            setFloatOrNull(pStmt, 60, registro.VPROD);
            setFloatOrNull(pStmt, 61, registro.VNF);
            setFloatOrNull(pStmt, 62, registro.VFRETE);
            setFloatOrNull(pStmt, 63, registro.VSEG);
            setFloatOrNull(pStmt, 64, registro.VDESC);
            setFloatOrNull(pStmt, 65, registro.VIPI);
            setFloatOrNull(pStmt, 66, registro.VPIS);
            setFloatOrNull(pStmt, 67, registro.VCOFINS);
            setFloatOrNull(pStmt, 68, registro.VOUTRO);
            setStringOrNull(pStmt, 69, registro.STDIVERGENCIA);
            setStringOrNull(pStmt, 70, registro.STCONCLUIDO);
            setStringOrNull(pStmt, 71, registro.NDUPLICATA);
            setDateOrNull(pStmt, 72, registro.VENCIDUPLICATADATE);
            setFloatOrNull(pStmt, 73, registro.VALORDUPLICATA);
            setIntOrNull(pStmt, 74, registro.STNFE);
            pStmt.setDate(75, registro.DTCADASTRO);
            pStmt.setString(76, registro.CHNFE);
            pStmt.setInt(77, registro.IDUSOPRINCIPAL);
            pStmt.setInt(78, registro.IDCONDPAGAMENTO);
            setStringOrNull(pStmt, 79, registro.STSALDO);
            setIntOrNull(pStmt, 80, registro.IDMARCA);
            setStringOrNull(pStmt, 81, registro.OBSERVACOES);
            setIntOrNull(pStmt, 82, registro.IDCOMPRADOR);
            pStmt.setInt(83, registro.MODFRETE);
            
            pStmt.execute();
        }
        
       if(registro.IDRESUMOPEDIDO){
            fnVincularNotaAoPedido(registro.IDRESUMOPEDIDO, queryId, registro);
        }
        
        fnIncluirDetalheProdutosDanfePedido(idResumoEntrada, registro.detProdNFE, conn);
        
        //fnMovimentaInventario(registro.detProdNFE, conn);
        
        if(registro.detProdutoRecepcao.length){
            fnVinculaQtdPedidoQtdNFE(registro.detProdNFE, conn);
        }
	}

	pStmt.close();

	conn.commit();
	
	registro.IDRESUMOENTRADA = queryId;
	
	return {
	    "statusPost": "success",
	    "NotaCadastrada": registro,
	    msg
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
            $.response.setBody(JSON.stringify(fnHandleGet(id)));
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