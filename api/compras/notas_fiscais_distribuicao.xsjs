var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
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

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
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
    	*
    FROM
    	"VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO"
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
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    if ( byId ) {
        query = query + ' And  IDRESUMOENTRADA = \'' + byId + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }

    if(dataPesquisaInicio && dataPesquisaFim) {
        query = query + ' AND (DEMI BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        query = query + ' OR (DTCADASTRO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        query = query + ' ORDER BY DTCADASTRO ';
    }
    
    if(numSerie && numNFE) {
        query = `${query}  AND SERIE = ${numSerie} AND  NNF = ${numNFE}`;
        query = query + ' ORDER BY DEMI ';
    }
    
    if ( idFornecedores == 'todos' ) {
        api.responseWithQuery(query2, request, 1);
    } else if ( idFornecedor ) {
        query = `${query} AND IDFORNECEDOR = ${idFornecedor}`;
        query = query + ' ORDER BY DEMI ';
        
        api.responseWithQuery(query, request, 1);
    } else{
        api.responseWithQuery(query, request, 1);
    }
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

function fnVincularNotaAoPedido(idResumoPedido, idResumoEntradaDanfe, registro) {
    var conn = $.db.getConnection();
    
    var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDPEDIDONOTA")), 0) + 1 FROM "VAR_DB_NAME"."VINCPEDIDONOTA" WHERE 1 = ? ', 1);
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
    
        var query = `INSERT INTO "VAR_DB_NAME"."VINCPEDIDONOTA" 
        	( 
        	"IDPEDIDONOTA",
            "IDRESUMOPEDIDO",
        	"IDRESUMOENTRADA",
        	"STATIVO"
        	)
    		VALUES(?,?,?,'True')`;
    		
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
            
        pStmt.setInt(1, parseInt(queryId));
        pStmt.setInt(2, parseInt(idPedido));
        pStmt.setInt(3, parseInt(idNotaFiscal));
    
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
        "IDPRODUTO",
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
        "QTDDIVERGENCIA"
        ) 
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDDETALHEENTRADA")), 0) + 1 FROM "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" WHERE 1 = ? ', 1);
	for (var i = 0; i < lstDet.length; i++) {
	    
		var registro = lstDet[i];

		pStmt.setInt(1, parseInt(queryId));
		pStmt.setInt(2, parseInt(idResumoEntrada));
		setIntOrNull(pStmt, 3, registro.IDDETALHEPEDIDO);
		pStmt.setInt(4, registro.IDPRODUTO);
		pStmt.setString(5, registro.CPROD);
		pStmt.setString(6, registro.XPROD);
		pStmt.setString(7, registro.NCM);
		pStmt.setString(8, registro.CFOP);
		pStmt.setString(9, registro.UCOM);
		pStmt.setFloat(10, registro.QCOM);
		pStmt.setFloat(11, registro.VUNCOM);
		pStmt.setFloat(12, registro.VPROD);
		pStmt.setFloat(13, registro.VDESC);
		pStmt.setString(14, registro.CSTICMS);
		pStmt.setFloat(15, registro.BCICMS);
		pStmt.setFloat(16, registro.PICMS);
		pStmt.setFloat(17, registro.VLICMS);
		pStmt.setString(18, registro.CSTIPI);
		pStmt.setFloat(19, registro.BCIPI);
		pStmt.setFloat(20, registro.PIPI);
		pStmt.setFloat(21, registro.VLIPI);
		pStmt.setString(22, registro.CSTPIS);
		pStmt.setFloat(23, registro.BCPIS);
		pStmt.setFloat(24, registro.PPIS);
		pStmt.setFloat(25, registro.VLPIS);
		pStmt.setString(26, registro.CSTCOFINS);
		pStmt.setFloat(27, registro.BCCOFINS);
		pStmt.setFloat(28, registro.PCOFINS);
		pStmt.setFloat(29, registro.VLCOFINS);
		pStmt.setString(30, registro.STDIFERENCA);
		pStmt.setString(31, registro.STDIVERGENCIA);
		pStmt.setString(32, registro.DSOBSERVACAODIVERGENCIA);
		setIntOrNull(pStmt, 33, registro.QTDDIVERGENCIA);
		
	    queryId += 1; 
	    
		pStmt.execute();
		
	}

    msg = "Nota Cadastrada Com Sucesso!"
    
	pStmt.close();

	conn.commit();
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    
    var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDRESUMOENTRADA")), 0) + 1 FROM "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" WHERE 1 = ? ', 1);
    
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
		"DTCADASTRO"
    	)
		VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    
	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var idResumoEntrada = queryId;

        var queryCodNNF = 'SELECT IDRESUMOENTRADA '+
        ' FROM "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" WHERE NNF = ?'+
            ' AND CNF=\''+ registro.CNF+'\''; 
         
        var CodNNF = api.sqlQuery(queryCodNNF,registro.NNF);
            
        if(CodNNF.length >0 ){
            var idResumoEntradaNF = parseInt(CodNNF[0]["IDRESUMOENTRADA"]);
            fnVincularNotaAoPedido(registro.IDRESUMOPEDIDO, idResumoEntradaNF, registro);
            
           /* return {
                "msg": "Nota Fiscal Já Cadastrada",
                "NotaCadastrada": registro
            };*/
        } else{
        
            pStmt.setInt(1, parseInt(queryId));
        	setIntOrNull(pStmt, 2, registro.IDGRUPOEMPRESARIAL);
        	setIntOrNull(pStmt, 3, registro.IDSUBGRUPOEMPRESARIAL);
        	setIntOrNull(pStmt, 4, registro.IDEMPRESA);
        	setIntOrNull(pStmt, 5, registro.IDFORNECEDOR);
        	pStmt.setString(6, registro.CUF);
        	pStmt.setString(7, registro.CNF);
        	pStmt.setString(8, registro.NATOP);
    		pStmt.setString(9, registro.INDPAG);
    		pStmt.setInt(10, registro.XMOD);
    		pStmt.setInt(11, registro.SERIE);
    		pStmt.setInt(12, registro.NNF);
    		pStmt.setDate(13, registro.DEMI);
    		pStmt.setDate(14, registro.DSAIENT);
    		pStmt.setString(15, registro.TPNF);
    		pStmt.setInt(16, registro.CMUNFG);
    		pStmt.setInt(17, registro.TPIMP);
    		pStmt.setInt(18, registro.TPEMIS);
    		pStmt.setInt(19, registro.CDV);
    		pStmt.setString(20, registro.TPAMB);
    		pStmt.setInt(21, registro.FINNFE);
    		pStmt.setInt(22, registro.PROCEMI);
    		pStmt.setString(23, registro.VERPROC);
    		pStmt.setString(24, registro.XMOTIVO);
    		pStmt.setString(25, registro.NPROT);
    		pStmt.setString(26, registro.EMIT_CPF);
    		pStmt.setString(27, registro.EMIT_CNPJ);
    		pStmt.setString(28, registro.EMIT_XNOME);
    		pStmt.setString(29, registro.EMIT_XFANT);
    		pStmt.setString(30, registro.EMIT_XLGR);
    		pStmt.setString(31, registro.EMIT_NRO);
    		pStmt.setString(32, registro.EMIT_XBAIRRO);
    		pStmt.setInt(33, registro.EMIT_CMUN);
    		pStmt.setString(34, registro.EMIT_XMUN);
    		pStmt.setString(35, registro.EMIT_UF);
    		pStmt.setString(36, registro.EMIT_CEP);
    		setIntOrNull(pStmt, 37, registro.EMIT_CPAIS);
    		pStmt.setString(38, registro.EMIT_XPAIS);
    		pStmt.setString(39, registro.EMIT_FONE);
    		pStmt.setString(40, registro.EMIT_IE);
    		pStmt.setString(41, registro.EMIT_IM);
    		pStmt.setString(42, registro.EMIT_CNAE);
    		pStmt.setInt(43, registro.EMIT_CRT);
    		pStmt.setString(44, registro.DEST_CNPJ);
    		pStmt.setString(45, registro.DEST_XNOME);
    		pStmt.setString(46, registro.DEST_XLGR);
    		pStmt.setString(47, registro.DEST_NRO);
    		pStmt.setString(48, registro.DEST_XBAIRRO);
    		pStmt.setInt(49, registro.DEST_CMUN);
    		pStmt.setString(50, registro.DEST_XMUN);
    		pStmt.setString(51, registro.DEST_UF);
    		pStmt.setString(52, registro.DEST_CEP);
    		setIntOrNull(pStmt, 53, registro.DEST_CPAIS);
    		pStmt.setString(54, registro.DEST_XPAIS);
    		pStmt.setString(55, registro.DEST_IE);
    		pStmt.setFloat(56, registro.VBC);
    		pStmt.setFloat(57, registro.VICMS);
    		pStmt.setFloat(58, registro.VBCST);
    		pStmt.setFloat(59, registro.VST);
    		pStmt.setFloat(60, registro.VPROD);
    		pStmt.setFloat(61, registro.VNF);
    		pStmt.setFloat(62, registro.VFRETE);
    		pStmt.setFloat(63, registro.VSEG);
    		pStmt.setFloat(64, registro.VDESC);
    		pStmt.setFloat(65, registro.VIPI);
    		pStmt.setFloat(66, registro.VPIS);
    		pStmt.setFloat(67, registro.VCOFINS);
    		pStmt.setFloat(68, registro.VOUTRO);
    		pStmt.setString(69, registro.STDIVERGENCIA);
    		pStmt.setString(70, registro.STCONCLUIDO);
    		pStmt.setString(71, registro.NDUPLICATA);
    		setDateOrNull(pStmt, 72, registro.VENCIDUPLICATADATE);
    		pStmt.setFloat(73, registro.VALORDUPLICATA);
    		setIntOrNull(pStmt, 74, registro.STNFE);
    		pStmt.setDate(75, registro.DTCADASTRO);
            
            pStmt.execute();
            
            if(registro.IDRESUMOPEDIDO){
                fnVincularNotaAoPedido(registro.IDRESUMOPEDIDO, queryId, registro);
            }
            
            fnIncluirDetalheProdutosDanfePedido(idResumoEntrada, registro.detProdNFE, conn);
        }
	}

	pStmt.close();

	conn.commit();
	
	registro.IDRESUMOENTRADA = queryId;
	
	return {
	    "statusPost": "Success",
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