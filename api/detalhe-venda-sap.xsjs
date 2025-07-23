var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdvs.IDDETALHEVENDASAP,' +
    '   tbdvs.IDRESUMOVENDASAP,' +
    '   tbdvs.DET_NITEM,' +
    '   tbdvs.PROD_CPROD,' +
    '   tbdvs.PROD_CEAN,' +
    '   tbdvs.PROD_XPROD,' +
    '   tbdvs.PROD_NCM,' +
    '   tbdvs.PROD_CFOP,' +
    '   tbdvs.PROD_UCOM,' +
    '   tbdvs.PROD_QCOM,' +
    '   tbdvs.PROD_VUNCOM,' +
    '   tbdvs.PROD_VPROD ,' +
    '   tbdvs.PROD_CEANTRIB,' +
    '   tbdvs.PROD_UTRIB,' +
    '   tbdvs.PROD_QTRIB,' +
    '   tbdvs.PROD_VUNTRIB,' +
    '   tbdvs.PROD_INDTOT,' +
    '   tbdvs.PROD_IMPOSTO_ICMS_ICMS00_ORIG,' +
    '   tbdvs.PROD_IMPOSTO_ICMS_ICMS00_CST,' +
    '   tbdvs.PROD_IMPOSTO_ICMS_ICMS00_MODBC,' +
    '   tbdvs.PROD_IMPOSTO_ICMS_ICMS00_VBC,' +
    '   tbdvs.PROD_IMPOSTO_ICMS_ICMS00_PICMS,' +
    '   tbdvs.PROD_IMPOSTO_ICMS_ICMS00_VICMS,' +
    '   tbdvs.PROD_IMPOSTO_PIS_CST,' +
    '   tbdvs.PROD_IMPOSTO_PIS_VBC,' +
    '   tbdvs.PROD_IMPOSTO_PIS_PPIS,' +
    '   tbdvs.PROD_IMPOSTO_PIS_VPIS,' +
    '   tbdvs.PROD_IMPOSTO_COFINS_CST,' +
    '   tbdvs.PROD_IMPOSTO_COFINS_VBC,' +
    '   tbdvs.PROD_IMPOSTO_COFINS_PCOFINS,' +
    '   tbdvs.PROD_IMPOSTO_COFINS_VCOFINS,' +
    '   tbdvs.PROD_VENDEDOR_MATRICULA,' +
    '   tbdvs.PROD_VENDEDOR_NOME,' +
    '   tbdvs.PROD_VENDEDOR_CPF' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEVENDASAP tbdvs' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdvs.IDDETALHEVENDASAP = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEVENDASAP" SET ' + 
        ' "IDRESUMOVENDASAP" = ?, ' +
        ' "DET_NITEM" = ?, ' +
        ' "PROD_CPROD" = ?, ' +
        ' "PROD_CEAN" = ?, ' +
        ' "PROD_XPROD" = ?, ' +
        ' "PROD_NCM" = ?, ' +
        ' "PROD_CFOP" = ?, ' +
        ' "PROD_UCOM" = ?, ' +
        ' "PROD_QCOM" = ?, ' +
        ' "PROD_VUNCOM" = ?, ' +
        ' "PROD_VPROD " = ?, ' +
        ' "PROD_CEANTRIB" = ?, ' +
        ' "PROD_UTRIB" = ?, ' +
        ' "PROD_QTRIB" = ?, ' +
        ' "PROD_VUNTRIB" = ?, ' +
        ' "PROD_INDTOT" = ?, ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_ORIG" = ?, ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_CST" = ?, ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_MODBC" = ?, ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_VBC" = ?, ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_PICMS" = ?, ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_VICMS" = ?, ' +
        ' "PROD_IMPOSTO_PIS_CST" = ?, ' +
        ' "PROD_IMPOSTO_PIS_VBC" = ?, ' +
        ' "PROD_IMPOSTO_PIS_PPIS" = ?, ' +
        ' "PROD_IMPOSTO_PIS_VPIS" = ?, ' +
        ' "PROD_IMPOSTO_COFINS_CST" = ?, ' +
        ' "PROD_IMPOSTO_COFINS_VBC" = ?, ' +
        ' "PROD_IMPOSTO_COFINS_PCOFINS" = ?, ' +
        ' "PROD_IMPOSTO_COFINS_VCOFINS" = ?, ' +
        ' "PROD_VENDEDOR_MATRICULA" = ?, ' +
        ' "PROD_VENDEDOR_NOME" = ?, ' +
        ' "PROD_VENDEDOR_CPF" = ? ' +
    	' WHERE "IDDETALHEVENDASAP" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDRESUMOVENDASAP);
        pStmt.setInt(2, registro.DET_NITEM);
        pStmt.setString(3, registro.PROD_CPROD);
        pStmt.setString(4, registro.PROD_CEAN);
        pStmt.setString(5, registro.PROD_XPROD);
        pStmt.setString(6, registro.PROD_NCM);
        pStmt.setString(7, registro.PROD_CFOP);
        pStmt.setString(8, registro.PROD_UCOM);
        pStmt.setFloat(9, registro.PROD_QCOM);
        pStmt.setFloat(10, registro.PROD_VUNCOM);
        pStmt.setFloat(11, registro.PROD_VPROD );
        pStmt.setString(12, registro.PROD_CEANTRIB);
        pStmt.setString(13, registro.PROD_UTRIB);
        pStmt.setFloat(14, registro.PROD_QTRIB);
        pStmt.setFloat(15, registro.PROD_VUNTRIB);
        pStmt.setString(16, registro.PROD_INDTOT);
        pStmt.setString(17, registro.PROD_IMPOSTO_ICMS_ICMS00_ORIG);
        pStmt.setString(18, registro.PROD_IMPOSTO_ICMS_ICMS00_CST);
        pStmt.setString(19, registro.PROD_IMPOSTO_ICMS_ICMS00_MODBC);
        pStmt.setFloat(20, registro.PROD_IMPOSTO_ICMS_ICMS00_VBC);
        pStmt.setFloat(21, registro.PROD_IMPOSTO_ICMS_ICMS00_PICMS);
        pStmt.setFloat(22, registro.PROD_IMPOSTO_ICMS_ICMS00_VICMS);
        pStmt.setString(23, registro.PROD_IMPOSTO_PIS_CST);
        pStmt.setFloat(24, registro.PROD_IMPOSTO_PIS_VBC);
        pStmt.setFloat(25, registro.PROD_IMPOSTO_PIS_PPIS);
        pStmt.setFloat(26, registro.PROD_IMPOSTO_PIS_VPIS);
        pStmt.setString(27, registro.PROD_IMPOSTO_COFINS_CST);
        pStmt.setFloat(28, registro.PROD_IMPOSTO_COFINS_VBC);
        pStmt.setFloat(29, registro.PROD_IMPOSTO_COFINS_PCOFINS);
        pStmt.setFloat(30, registro.PROD_IMPOSTO_COFINS_VCOFINS);
        pStmt.setString(31, registro.PROD_VENDEDOR_MATRICULA);
        pStmt.setString(32, registro.PROD_VENDEDOR_NOME);
        pStmt.setString(33, registro.PROD_VENDEDOR_CPF);
        pStmt.setInt(34, registro.IDDETALHEVENDASAP);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEVENDASAP" ' +
		" ( " +
		' "IDDETALHEVENDASAP", ' +
        ' "IDRESUMOVENDASAP", ' +
        ' "DET_NITEM", ' +
        ' "PROD_CPROD", ' +
        ' "PROD_CEAN", ' +
        ' "PROD_XPROD", ' +
        ' "PROD_NCM", ' +
        ' "PROD_CFOP", ' +
        ' "PROD_UCOM", ' +
        ' "PROD_QCOM", ' +
        ' "PROD_VUNCOM", ' +
        ' "PROD_VPROD ", ' +
        ' "PROD_CEANTRIB", ' +
        ' "PROD_UTRIB", ' +
        ' "PROD_QTRIB", ' +
        ' "PROD_VUNTRIB", ' +
        ' "PROD_INDTOT", ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_ORIG", ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_CST", ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_MODBC", ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_VBC", ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_PICMS", ' +
        ' "PROD_IMPOSTO_ICMS_ICMS00_VICMS", ' +
        ' "PROD_IMPOSTO_PIS_CST", ' +
        ' "PROD_IMPOSTO_PIS_VBC", ' +
        ' "PROD_IMPOSTO_PIS_PPIS", ' +
        ' "PROD_IMPOSTO_PIS_VPIS", ' +
        ' "PROD_IMPOSTO_COFINS_CST", ' +
        ' "PROD_IMPOSTO_COFINS_VBC", ' +
        ' "PROD_IMPOSTO_COFINS_PCOFINS", ' +
        ' "PROD_IMPOSTO_COFINS_VCOFINS", ' +
        ' "PROD_VENDEDOR_MATRICULA", ' +
        ' "PROD_VENDEDOR_NOME", ' +
        ' "PROD_VENDEDOR_CPF" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_DETALHEVENDASAP.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDRESUMOVENDASAP);
        pStmt.setInt(2, registro.DET_NITEM);
        pStmt.setString(3, registro.PROD_CPROD);
        pStmt.setString(4, registro.PROD_CEAN);
        pStmt.setString(5, registro.PROD_XPROD);
        pStmt.setString(6, registro.PROD_NCM);
        pStmt.setString(7, registro.PROD_CFOP);
        pStmt.setString(8, registro.PROD_UCOM);
        pStmt.setFloat(9, registro.PROD_QCOM);
        pStmt.setFloat(10, registro.PROD_VUNCOM);
        pStmt.setFloat(11, registro.PROD_VPROD );
        pStmt.setString(12, registro.PROD_CEANTRIB);
        pStmt.setString(13, registro.PROD_UTRIB);
        pStmt.setFloat(14, registro.PROD_QTRIB);
        pStmt.setFloat(15, registro.PROD_VUNTRIB);
        pStmt.setString(16, registro.PROD_INDTOT);
        pStmt.setString(17, registro.PROD_IMPOSTO_ICMS_ICMS00_ORIG);
        pStmt.setString(18, registro.PROD_IMPOSTO_ICMS_ICMS00_CST);
        pStmt.setString(19, registro.PROD_IMPOSTO_ICMS_ICMS00_MODBC);
        pStmt.setFloat(20, registro.PROD_IMPOSTO_ICMS_ICMS00_VBC);
        pStmt.setFloat(21, registro.PROD_IMPOSTO_ICMS_ICMS00_PICMS);
        pStmt.setFloat(22, registro.PROD_IMPOSTO_ICMS_ICMS00_VICMS);
        pStmt.setString(23, registro.PROD_IMPOSTO_PIS_CST);
        pStmt.setFloat(24, registro.PROD_IMPOSTO_PIS_VBC);
        pStmt.setFloat(25, registro.PROD_IMPOSTO_PIS_PPIS);
        pStmt.setFloat(26, registro.PROD_IMPOSTO_PIS_VPIS);
        pStmt.setString(27, registro.PROD_IMPOSTO_COFINS_CST);
        pStmt.setFloat(28, registro.PROD_IMPOSTO_COFINS_VBC);
        pStmt.setFloat(29, registro.PROD_IMPOSTO_COFINS_PCOFINS);
        pStmt.setFloat(30, registro.PROD_IMPOSTO_COFINS_VCOFINS);
        pStmt.setString(31, registro.PROD_VENDEDOR_MATRICULA);
        pStmt.setString(32, registro.PROD_VENDEDOR_NOME);
        pStmt.setString(33, registro.PROD_VENDEDOR_CPF);
    	
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