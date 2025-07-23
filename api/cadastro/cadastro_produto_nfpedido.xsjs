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

function fnObterProdutosNfe(idResumoNfe) {

    var queryVinculo =  `SELECT
        TBVP."IDPEDIDONOTA",
        TBVP."IDRESUMOPEDIDO",
    	TBVP."IDRESUMOENTRADA",
    	TBRE."EMIT_XNOME",
    	TBRE."SERIE",
    	TBRE."NNF"
    FROM
    	"VAR_DB_NAME"."VINCPEDIDONOTA" TBVP
    INNER JOIN "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" TBRE ON
        TBVP."IDRESUMOENTRADA" = TBRE."IDRESUMOENTRADA"
    WHERE
    	TBVP."IDRESUMOPEDIDO" = ?`;
    
    var idNota = api.sqlQuery(queryVinculo, idResumoNfe);
    idNota = idNota[0]["IDRESUMOENTRADA"];
    
    var query2 =  `SELECT
        "IDRESUMOENTRADA",
		"XPROD" as "DESCPRODUTO",
		SUM("QCOM") as "QTDPRODUTO"
    FROM
    	"VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO"
    WHERE
    	1 = ?`;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };

    if ( idResumoNfe ) {
        query2 = query2 + ' And  IDRESUMOENTRADA IN( \'' + idNota + '\' ) ';
       // query2 = query2 + ` GROUP BY "IDRESUMOENTRADA", "XPROD"`;
    }  
      api.responseWithQuery(query2, request, 1);
    
    
}

function fnHandleGet(byId) {
    
    var idPedido = $.request.parameters.get("idpedido");
    var idResumoEntrada = $.request.parameters.get("idResumo");
    
    var query =  `SELECT
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
		"VRUNITPEDIDO",
		"QTDPEDIDO",
		"VRVENDAPEDIDO",
		"VRTOTALPEDIDO",
		"STDIFERENCA",
		"STDIVERGENCIA",
		"DSOBSERVACAODIVERGENCIA",
		"QTDDIVERGENCIA"
    FROM
    	"VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO"
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
        query = query + ' And  IDDETALHEPEDIDO = \'' + idPedido + '\' ';
    }
    if ( idResumoEntrada ) {
        fnObterProdutosNfe(idResumoEntrada)
    } else{
        api.responseWithQuery(query, request, 1);
    }

}

function fnHandlePut() {
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnIncluirDetalheResumo(conn, IdRes) {


    var queryId2 = 'SELECT IFNULL(MAX(TO_INT("IDDETALHEENTRADA")),0) FROM "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" WHERE 1 = ? ';
    var IdDetEntrada = api.executeScalar(queryId2,1);
            
    var query2 = 'INSERT INTO "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" ' +
		" ( " +'"IDDETALHEENTRADA", ' +
            '"IDRESUMOENTRADA", ' +
            '"IDDETALHEPEDIDO", ' +
            '"CPROD", ' +
            '"XPROD", ' +
            '"NCM", ' +
            '"CFOP", ' +
            '"UCOM", ' +
            '"QCOM", ' +
            '"VUNCOM", ' +
            '"VPROD", ' +
            '"CSTICMS", ' +
            '"BCICMS", ' +
            '"PICMS", ' +
            '"VLICMS", ' +
            '"CSTPIS", ' +
            '"BCPIS", ' +
            '"PPIS", ' +
            '"VLPIS", ' +
            '"CSTCOFINS", ' +
            '"BCCOFINS", ' +
            '"PCOFINS", ' +
            '"VLCOFINS", ' +
            '"VRUNITPEDIDO", ' +
            '"QTDPEDIDO", ' +
            '"VRVENDAPEDIDO", ' +
            '"VRTOTALPEDIDO", ' +
            '"STDIFERENCA", ' +
            '"STDIVERGENCIA", ' +
            '"DSOBSERVACAODIVERGENCIA", ' +
            '"QTDDIVERGENCIA" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) '; 
		
    var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
	
		var registro = bodyJson[i];
		
		var contador = 0;
		
		for (var j = 0; j < registro.DETALHERESUMOPED.length; j++) { 
        
            contador ++;
            
    		var queryCodProd = 'SELECT IDDETALHEENTRADA AS IDDETENT '+
            ' FROM "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" WHERE CPROD = ?'+ 
                ' AND XPROD=\''+ registro.DETALHERESUMOPED[j]+'\''+
                ' AND IDRESUMOENTRADA=\''+ IdRes+'\'';
            
            var CodProd = api.sqlQuery(queryCodProd,registro.DETALHERESUMOPED[j].CPROD);
            
            var IdDetEntrada2 = IdDetEntrada + contador;
            
            if(CodProd.length >0 ){
                    return {
                	    "msg": "Produto dessa Nota Fiscal Já está Cadastrado"
                	};
            }else{
    
                pStmt2.setInt(1, parseInt(IdDetEntrada2));
                pStmt2.setInt(2, parseInt(IdRes));
                pStmt2.setInt(3, registro.DETALHERESUMOPED[j].IDDETALHEPEDIDO);
                pStmt2.setString(4, registro.DETALHERESUMOPED[j].CPROD);
                pStmt2.setString(5, registro.DETALHERESUMOPED[j].XPROD);
                pStmt2.setString(6, registro.DETALHERESUMOPED[j].NCM);
                pStmt2.setString(7, registro.DETALHERESUMOPED[j].CFOP);
                pStmt2.setString(8, registro.DETALHERESUMOPED[j].UCOM);
                pStmt2.setFloat(9, registro.DETALHERESUMOPED[j].QCOM);
                pStmt2.setFloat(10, registro.DETALHERESUMOPED[j].VUNCOM);
                pStmt2.setFloat(11, registro.DETALHERESUMOPED[j].VPROD);
                pStmt2.setString(12, registro.DETALHERESUMOPED[j].CSTICMS);
                pStmt2.setFloat(13, registro.DETALHERESUMOPED[j].BCICMS);
                pStmt2.setFloat(14, registro.DETALHERESUMOPED[j].PICMS);
                pStmt2.setFloat(15, registro.DETALHERESUMOPED[j].VLICMS);
                pStmt2.setString(16, registro.DETALHERESUMOPED[j].CSTPIS);
                pStmt2.setFloat(17, registro.DETALHERESUMOPED[j].BCPIS);
                pStmt2.setFloat(18, registro.DETALHERESUMOPED[j].PPIS);
                pStmt2.setFloat(19, registro.DETALHERESUMOPED[j].VLPIS);
                pStmt2.setString(20, registro.DETALHERESUMOPED[j].CSTCOFINS);
                pStmt2.setFloat(21, registro.DETALHERESUMOPED[j].BCCOFINS);
                pStmt2.setFloat(22, registro.DETALHERESUMOPED[j].PCOFINS);
                pStmt2.setFloat(23, registro.DETALHERESUMOPED[j].VLCOFINS);
                pStmt2.setFloat(24, registro.DETALHERESUMOPED[j].VRUNITPEDIDO);
                pStmt2.setFloat(25, registro.DETALHERESUMOPED[j].QTDPEDIDO);
                pStmt2.setFloat(26, registro.DETALHERESUMOPED[j].VRVENDAPEDIDO);
                pStmt2.setFloat(27, registro.DETALHERESUMOPED[j].VRTOTALPEDIDO);
                pStmt2.setString(28, registro.DETALHERESUMOPED[j].STDIFERENCA);
                pStmt2.setString(29, registro.DETALHERESUMOPED[j].STDIVERGENCIA);
                pStmt2.setString(30, registro.DETALHERESUMOPED[j].DSOBSERVACAODIVERGENCIA);
                pStmt2.setFloat(31, registro.DETALHERESUMOPED[j].QTDDIVERGENCIA);
            	
                pStmt2.execute();
            }
		}
	}
	        pStmt2.close();
	        conn.commit();
	
    return {
	    "msg": "Inclusão dos produtos realizada com sucesso!"
	};
	
}

function fnHandlePost() {
    
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDRESUMOENTRADA")),0) + 1 FROM "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" WHERE 1 = ? ';
    
	var IdResEntrada = api.executeScalar(queryId,1);

    var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" ' +
		" ( " +' "IDRESUMOENTRADA", ' +
            ' "IDGRUPOEMPRESARIAL", ' +
            ' "IDSUBGRUPOEMPRESARIAL", ' +
            ' "IDEMPRESA", ' +
            ' "IDFORNECEDOR", ' +
            ' "IDRESUMOPEDIDO", ' +
            ' "CUF", ' +
            ' "CNF", ' +
            ' "NATOP", ' +
            ' "INDPAG", ' +
            ' "XMOD", ' +
            ' "SERIE", ' +
            ' "NNF", ' +
            ' "DEMI", ' +
            ' "DSAIENT", ' +
            ' "TPNF", ' +
            ' "CMUNFG", ' +
            ' "TPIMP", ' +
            ' "TPEMIS", ' +
            ' "CDV", ' +
            ' "TPAMB", ' +
            ' "FINNFE", ' +
            ' "PROCEMI", ' +
            ' "VERPROC", ' +
            ' "XMOTIVO", ' +
            ' "NPROT", ' +
            ' "EMIT_CPF", ' +
            ' "EMIT_CNPJ", ' +
            ' "EMIT_XNOME", ' +
            ' "EMIT_XFANT", ' +
            ' "EMIT_XLGR", ' +
            ' "EMIT_NRO", ' +
            ' "EMIT_XBAIRRO", ' +
            ' "EMIT_CMUN", ' +
            ' "EMIT_XMUN", ' +
            ' "EMIT_UF", ' +
            ' "EMIT_CEP", ' +
            ' "EMIT_CPAIS", ' +
            ' "EMIT_XPAIS", ' +
            ' "EMIT_FONE", ' +
            ' "EMIT_IE", ' +
            ' "EMIT_IM", ' +
            ' "EMIT_CRT", ' +
            ' "DEST_CNPJ", ' +
            ' "DEST_XNOME", ' +
            ' "DEST_XLGR", ' +
            ' "DEST_NRO", ' +
            ' "DEST_XBAIRRO", ' +
            ' "DEST_CMUN", ' +
            ' "DEST_XMUN", ' +
            ' "DEST_UF", ' +
            ' "DEST_CEP", ' +
            ' "DEST_CPAIS", ' +
            ' "DEST_XPAIS", ' +
            ' "DEST_IE", ' +
            ' "VBC", ' +
            ' "VICMS", ' +
            ' "VBCST", ' +
            ' "VST", ' +
            ' "VPROD", ' +
            ' "VNF", ' +
            ' "VFRETE", ' +
            ' "VSEG", ' +
            ' "VDESC", ' +
            ' "VIPI", ' +
            ' "VPIS", ' +
            ' "VCOFINS", ' +
            ' "VOUTRO", ' +
            ' "STDIVERGENCIA", ' +
            ' "STCONCLUIDO" ' +
    	' ) ' +
		' VALUES(?,1,1,0,0,?,?,?,?,0,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];

		var queryCodNNF = 'SELECT NNF '+
        ' FROM "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" WHERE NNF = ?'+
            ' AND CNF=\''+ registro.CNF+'\'';
        
        var CodNNF = api.sqlQuery(queryCodNNF,registro.NNF);
        
        if(CodNNF.length >0 ){
                return {
            	    "msg": "Nota Fiscal Já Cadastrada"
            	};
        }else{
            
            pStmt.setInt(1, parseInt(IdResEntrada));
            pStmt.setInt(2, registro.IDRESUMOPEDIDO);
            pStmt.setString(3, registro.CUF);
            pStmt.setString(4, registro.CNF);
            pStmt.setString(5, registro.NATOP);
            pStmt.setInt(6, registro.XMOD);
            pStmt.setInt(7, registro.SERIE);
            pStmt.setInt(8, registro.NNF);
            setTimestampOrNull(pStmt,9, registro.DEMI);
            setTimestampOrNull(pStmt,10, registro.DSAIENT);
            pStmt.setString(11, registro.TPNF);
            pStmt.setInt(12, registro.CMUNFG);
            pStmt.setInt(13, registro.TPIMP);
            pStmt.setInt(14, registro.TPEMIS);
            pStmt.setInt(15, registro.CDV);
            pStmt.setString(16, registro.TPAMB);
            pStmt.setInt(17, registro.FINNFE);
            pStmt.setInt(18, registro.PROCEMI);
            pStmt.setString(19, registro.VERPROC);
            pStmt.setString(20, registro.XMOTIVO);
            pStmt.setString(21, registro.NPROT);
            pStmt.setString(22, registro.EMIT_CPF);
            pStmt.setString(23, registro.EMIT_CNPJ);
            pStmt.setString(24, registro.EMIT_XNOME);
            pStmt.setString(25, registro.EMIT_XFANT);
            pStmt.setString(26, registro.EMIT_XLGR);
            pStmt.setString(27, registro.EMIT_NRO);
            pStmt.setString(28, registro.EMIT_XBAIRRO);
            pStmt.setInt(29, registro.EMIT_CMUN);
            pStmt.setString(30, registro.EMIT_XMUN);
            pStmt.setString(31, registro.EMIT_UF);
            pStmt.setString(32, registro.EMIT_CEP);
            pStmt.setInt(33, registro.EMIT_CPAIS);
            pStmt.setString(34, registro.EMIT_XPAIS);
            pStmt.setString(35, registro.EMIT_FONE);
            pStmt.setString(36, registro.EMIT_IE);
            pStmt.setString(37, registro.EMIT_IM);
            pStmt.setInt(38, registro.EMIT_CRT);
            pStmt.setString(39, registro.DEST_CNPJ);
            pStmt.setString(40, registro.DEST_XNOME);
            pStmt.setString(41, registro.DEST_XLGR);
            pStmt.setString(42, registro.DEST_NRO);
            pStmt.setString(43, registro.DEST_XBAIRRO);
            pStmt.setInt(44, registro.DEST_CMUN);
            pStmt.setString(45, registro.DEST_XMUN);
            pStmt.setString(46, registro.DEST_UF);
            pStmt.setString(47, registro.DEST_CEP);
            pStmt.setInt(48, registro.DEST_CPAIS);
            pStmt.setString(49, registro.DEST_XPAIS);
            pStmt.setString(50, registro.DEST_IE);
            pStmt.setFloat(51, registro.VBC);
            pStmt.setFloat(52, registro.VICMS);
            pStmt.setFloat(53, registro.VBCST);
            pStmt.setFloat(54, registro.VST);
            pStmt.setFloat(55, registro.VPROD);
            pStmt.setFloat(56, registro.VNF);
            pStmt.setFloat(57, registro.VFRETE);
            pStmt.setFloat(58, registro.VSEG);
            pStmt.setFloat(59, registro.VDESC);
            pStmt.setFloat(60, registro.VIPI);
            pStmt.setFloat(61, registro.VPIS);
            pStmt.setFloat(62, registro.VCOFINS);
            pStmt.setFloat(63, registro.VOUTRO);
            pStmt.setString(64, registro.STDIVERGENCIA);
            pStmt.setString(65, registro.STCONCLUIDO);
        	
            pStmt.execute();
            
			fnIncluirDetalheResumo(conn, IdResEntrada);
        }
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão do resumo realizada com sucesso!"
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