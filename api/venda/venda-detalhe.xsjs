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

function fnHandleGet(byId) {
    var idVenda = $.request.parameters.get("idVenda");
    
   var query = ' SELECT IDVENDADETALHE, IDVENDA, NITEM, CPROD, CEAN, XPROD, NCM, CFOP, UCOM, QCOM ' +
		' VUNCOM, VPROD, CEANTRIB, UTRIB, QTRIB, VUNTRIB,  INDTOT, ICMS_ORIG, ICMS_CST, ICMS_MODBC, ICMS_VBC, ' +
		' ICMS_PICMS, ICMS_VICMS, PIS_CST, PIS_VBC, PIS_PPIS, PIS_VPIS, COFINS_CST, COFINS_VBC, COFINS_PCOFINS, ' +
		' COFINS_VCOFINS, VENDEDOR_MATRICULA, VENDEDOR_NOME, VENDEDOR_CPF ' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDADETALHE  ' +
		'  WHERE  ' +
		'   1 = ? and STCANCELADO=\'False\' ' ;
		
    
    if ( byId ) {
        query = query + ' And  IDVENDADETALHE = \'' + byId + '\' ';
    }
    
    if ( idVenda ) {
        query = query + ' And  IDVENDA = \'' + idVenda + '\' ';
    }
    
    query = query + '  ORDER BY IDVENDADETALHE  ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDADETALHE" SET ' + 
        ' "IDVENDA" = ?, ' + 
    	' "NITEM" = ?, ' + 
    	' "CPROD" = ?, ' + 
    	' "CEAN" = ?, ' + 
    	' "XPROD" = ?, ' + 
    	' "NCM" = ?, ' + 
    	' "CFOP" = ?, ' + 
    	' "UCOM" = ?, ' + 
    	' "QCOM VUNCOM" = ?, ' + 
    	' "VPROD" = ?, ' + 
    	' "CEANTRIB" = ?, ' + 
    	' "UTRIB" = ?, ' + 
    	' "QTRIB" = ?, ' + 
    	' "VUNTRIB" = ?, ' + 
    	' "INDTOT" = ?, ' + 
    	' "ICMS_ORIG" = ?, ' + 
    	' "ICMS_CST" = ?, ' + 
    	' "ICMS_MODBC" = ?, ' + 
    	' "ICMS_VBC" = ?, ' + 
    	' "ICMS_PICMS" = ?, ' + 
    	' "ICMS_VICMS" = ?, ' + 
    	' "PIS_CST" = ?, ' + 
    	' "PIS_VBC" = ?, ' + 
    	' "PIS_PPIS" = ?, ' + 
    	' "PIS_VPIS" = ?, ' + 
    	' "COFINS_CST" = ?, ' + 
    	' "COFINS_VBC" = ?, ' + 
    	' "COFINS_PCOFINS" = ?, ' + 
    	' "COFINS_VCOFINS" = ?, ' + 
    	' "VENDEDOR_MATRICULA" = ?, ' + 
    	' "VENDEDOR_NOME" = ?, ' + 
    	' "VENDEDOR_CPF" = ? ' + 
    	' WHERE "IDVENDADETALHE" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

       
		pStmt.setString(1, registro.vIdVenda);
		pStmt.setString(2, registro["@nItem"]);
		pStmt.setString(3, registro.prod.cProd);
		pStmt.setString(4, registro.prod.cEAN);
		pStmt.setString(5, registro.prod.xProd);
		pStmt.setString(6, registro.prod.NCM);
		pStmt.setString(7, registro.prod.CFOP);
		pStmt.setString(8, registro.prod.uCom);
		pStmt.setFloat(9, registro.prod.qCom);
		pStmt.setFloat(10, registro.prod.vUnCom);
		pStmt.setFloat(11, registro.prod.vProd);
		pStmt.setString(12, registro.prod.cEANTrib);
		pStmt.setString(13, registro.prod.uTrib);
		pStmt.setFloat(14, registro.prod.qTrib);
		pStmt.setFloat(15, registro.prod.vUnTrib);
		pStmt.setString(16, registro.prod.indTot);
		pStmt.setString(17, registro.imposto.ICMS.ICMS00.orig);
		pStmt.setString(18, registro.imposto.ICMS.ICMS00.CST);
		pStmt.setString(19, registro.imposto.ICMS.ICMS00.modBC);
		pStmt.setFloat(20, registro.imposto.ICMS.ICMS00.vBC);
		pStmt.setFloat(21, registro.imposto.ICMS.ICMS00.pICMS);
		pStmt.setFloat(22, registro.imposto.ICMS.ICMS00.vICMS);
		pStmt.setString(23, registro.imposto.PIS.PISAliq.CST);
		pStmt.setFloat(24, registro.imposto.PIS.PISAliq.vBC);
		pStmt.setFloat(25, registro.imposto.PIS.PISAliq.pPIS);
		pStmt.setFloat(26, registro.imposto.PIS.PISAliq.vPIS);
		pStmt.setString(27, registro.imposto.COFINS.COFINSAliq.CST);
		pStmt.setFloat(28, registro.imposto.COFINS.COFINSAliq.vBC);
		pStmt.setFloat(29, registro.imposto.COFINS.COFINSAliq.pCOFINS);
		pStmt.setFloat(30, registro.imposto.COFINS.COFINSAliq.vCOFINS);
		pStmt.setString(31, registro.vendedor.matricula);
		pStmt.setString(32, registro.vendedor.nome);
		pStmt.setString(33, registro.vendedor.cpf);
		pStmt.setString(34, registro.prod.stCancelado);
		pStmt.setFloat(35, registro.prod.qtd);
		pStmt.setFloat(36, registro.prod.valorTotalLiquido);
		pStmt.setString(37, registro.vendedor.stVendaDigital);
		pStmt.setString(38, registro.idVendaDetalhe);
                    
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
    	' "STVENDIGITAL" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.IdVenda + '-' + registro["@nItem"]);
		pStmt.setString(2, registro.IdVenda);
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