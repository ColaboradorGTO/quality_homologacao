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
    
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var descFornecedor = $.request.parameters.get("descFornecedor");
    var CNPJFornecedor = $.request.parameters.get("CNPJFornecedor");
    var descFornOrCnpj = $.request.parameters.get("descFornOrCnpj")
    
    var query = ' SELECT ' + 
    '   tbf.IDFORNECEDOR,' +
    '   tbf.IDFORNECEDORSAP,' +
    '   tbf.IDGRUPOEMPRESARIAL,' +
    '   tbf.IDSUBGRUPOEMPRESARIAL,' +
    '   tbf.MODPEDIDO,' +
    '   TRIM(tbf.NORAZAOSOCIAL) AS NORAZAOSOCIAL,' +
    '   tbf.NOFANTASIA,' +
    '   tbf.NUCNPJ,' +
    '   tbf.NUINSCESTADUAL,' +
    '   tbf.NUINSCMUNICIPAL,' +
    '   tbf.NUIBGE,' +
    '   tbf.EENDERECO,' +
    '   tbf.ENUMERO,' +
    '   tbf.ECOMPLEMENTO,' +
    '   tbf.EBAIRRO,' +
    '   tbf.ECIDADE,' +
    '   tbf.SGUF,' +
    '   tbf.NUCEP,' +
    '   tbf.EEMAIL,' +
    '   tbf.NUTELEFONE1,' +
    '   tbf.NUTELEFONE2,' +
    '   tbf.NUTELEFONE3,' +
    '   tbf.NOREPRESENTANTE,' +
    '   tbf.DTCADASTRO,' +
    '   tbf.DTULTATUALIZACAO,' +
    '   tbf.STATIVO,' +
    '   tbf.TPFRETEPADRAO,' +
    '   tbf.TPARQUIVOPADRAO,' +
    '   tbf.TPFISCALPADRAO,' +
    '   tbf.TPPEDIDOPADRAO,' +
    '   tbf.NOVENDEDORPADRAO,' +
    '   tbf.EMAILVENDEDORPADRAO,' +
    '   TO_VARCHAR(tbf.DTCADASTRO,\'YYYY-MM-DD HH24:MI:SS\') AS DTCADASTROFORMAT, ' +
    '   CDP.IDCONDICAOPAGAMENTO, ' +
    '   CDP.DSCONDICAOPAG, ' +
    '   TP.IDTRANSPORTADORA, ' +
    '   TP.NOFANTASIA AS NOMETRANSPORTADORA, ' +
    '   TBO."CardCode" AS IDSAP, ' +
    '    TBO."validFor" as STATIVOSAP, ' +
    '   (SELECT LAST_VALUE(IDFABRICANTEFORN ORDER BY IDFABRICANTEFORN) AS IDFABRICANTEFORN FROM "VAR_DB_NAME"."VINCFABRICANTEFORN" WHERE IDFORNECEDOR = tbf.IDFORNECEDOR) as VINCFABRICANTE ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FORNECEDOR tbf' +
    '   LEFT JOIN "VAR_DB_NAME".TRANSPORTADORA TP ON tbf.IDTRANSPORTADORAPADRAO = TP.IDTRANSPORTADORA  ' +
    '   LEFT JOIN "VAR_DB_NAME".CONDICAOPAGAMENTO CDP ON tbf.IDCONDPAGPADRAO = CDP.IDCONDICAOPAGAMENTO  ' +
    ' LEFT JOIN SBO_GTO_PRD.OCRD TBO ON TBF.IDFORNECEDORSAP = TBO."CardCode" ' +
    ' WHERE ' +
        '	1 = ?'+
        '   AND tbf.STATIVO = \'True\' ';
    
    if ( byId ) {
        query = query + ' And  tbf.IDFORNECEDOR = \'' + byId + '\' ';
    }

    if ( idFornecedor ) {
        query = query + ' And  tbf.IDFORNECEDOR = \'' + idFornecedor + '\' ';
    }

    if ( descFornecedor ) {
        query = query + ' And  (tbf.NORAZAOSOCIAL LIKE \'%'+descFornecedor+'%\' OR tbf.NOFANTASIA LIKE \'%'+descFornecedor+'%\' ) ';
    }

    if ( CNPJFornecedor ) {
        query = query + ' And  tbf.NUCNPJ = \'' + CNPJFornecedor + '\' ';
    }
    
    if ( descFornOrCnpj ) {
        query += ` And  CONTAINS((tbf.NORAZAOSOCIAL, tbf.NOFANTASIA, tbf.NUCNPJ), '%${descFornOrCnpj}%') `;
    }
    
    query += ` ORDER BY tbf.NOFANTASIA ASC`;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."FORNECEDOR" SET ' + 
        ' "IDGRUPOEMPRESARIAL" = ?, ' + 
        ' "IDSUBGRUPOEMPRESARIAL" = ?, ' + 
        ' "MODPEDIDO" = ?, ' + 
        ' "NORAZAOSOCIAL" = ?, ' + 
        ' "NOFANTASIA" = ?, ' + 
        ' "NUCNPJ" = ?, ' + 
        ' "NUINSCESTADUAL" = ?, ' + 
        ' "NUINSCMUNICIPAL" = ?, ' + 
        ' "NUIBGE" = ?, ' + 
        ' "EENDERECO" = ?, ' + 
        ' "ENUMERO" = ?, ' + 
        ' "ECOMPLEMENTO" = ?, ' + 
        ' "EBAIRRO" = ?, ' + 
        ' "ECIDADE" = ?, ' + 
        ' "SGUF" = ?, ' + 
        ' "NUCEP" = ?, ' + 
        ' "EEMAIL" = ?, ' + 
        ' "NUTELEFONE1" = ?, ' + 
        ' "NUTELEFONE2" = ?, ' + 
        ' "NUTELEFONE3" = ?, ' + 
        ' "NOREPRESENTANTE" = ?, ' + 
        ' "DTCADASTRO" = ?, ' + 
        ' "DTULTATUALIZACAO" = ?, ' + 
        ' "STATIVO"= ?, ' + 
        ' "IDCONDPAGPADRAO"= ?, ' + 
        ' "IDTRANSPORTADORAPADRAO"= ?, ' + 
        ' "TPPEDIDOPADRAO"= ?, ' + 
        ' "NOVENDEDORPADRAO"= ?, ' + 
        ' "TPFRETEPADRAO"= ?, ' + 
        ' "TPARQUIVOPADRAO"= ?, ' + 
        ' "TPFISCALPADRAO" = ?, ' + 
        ' "EMAILVENDEDORPADRAO" = ? ' + 
    	' WHERE "IDFORNECEDOR" =  ? ';
        
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDFORNECEDOR")),0) + 1 FROM "VAR_DB_NAME"."FORNECEDOR" WHERE 1 = ? ';
    var query = 'INSERT INTO "VAR_DB_NAME"."FORNECEDOR" ' +
		" ( " +
            ' "IDFORNECEDOR", ' +
            ' "IDGRUPOEMPRESARIAL", ' +
            ' "IDSUBGRUPOEMPRESARIAL", ' +
            ' "MODPEDIDO", ' +
            ' "NORAZAOSOCIAL", ' +
            ' "NOFANTASIA", ' +
            ' "NUCNPJ", ' +
            ' "NUINSCESTADUAL", ' +
            ' "NUINSCMUNICIPAL", ' +
            ' "NUIBGE", ' +
            ' "EENDERECO", ' +
            ' "ENUMERO", ' +
            ' "ECOMPLEMENTO", ' +
            ' "EBAIRRO", ' +
            ' "ECIDADE", ' +
            ' "SGUF", ' +
            ' "NUCEP", ' +
            ' "EEMAIL", ' +
            ' "NUTELEFONE1", ' +
            ' "NUTELEFONE2", ' +
            ' "NUTELEFONE3", ' +
            ' "NOREPRESENTANTE", ' +
            ' "DTCADASTRO", ' +
            ' "DTULTATUALIZACAO", ' +
            ' "STATIVO", ' +
            ' "IDCONDPAGPADRAO", ' +
            ' "IDTRANSPORTADORAPADRAO", ' +
            ' "TPPEDIDOPADRAO", ' +
            ' "NOVENDEDORPADRAO", ' +
            ' "TPFRETEPADRAO", ' +
            ' "TPARQUIVOPADRAO", ' +
            ' "TPFISCALPADRAO", ' +
            ' "EMAILVENDEDORPADRAO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,now(),now(),?,?,?,?,?,?,?,?,?) ';

    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdForn = api.executeScalar(queryId,1);

		pStmt.setString(1, IdForn.toString());
		pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(4, registro.MODPEDIDO);
        pStmt.setString(5, registro.NORAZAOSOCIAL);
        pStmt.setString(6, registro.NOFANTASIA);
        pStmt.setString(7, registro.NUCNPJ);
        pStmt.setString(8, registro.NUINSCESTADUAL);
        pStmt.setString(9, registro.NUINSCMUNICIPAL);
        pStmt.setString(10, registro.NUIBGE);
        pStmt.setString(11, registro.EENDERECO);
        pStmt.setString(12, registro.ENUMERO);
        pStmt.setString(13, registro.ECOMPLEMENTO);
        pStmt.setString(14, registro.EBAIRRO);
        pStmt.setString(15, registro.ECIDADE);
        pStmt.setString(16, registro.SGUF);
        pStmt.setString(17, registro.NUCEP);
        pStmt.setString(18, registro.EEMAIL);
        pStmt.setString(19, registro.NUTELEFONE1);
        pStmt.setString(20, registro.NUTELEFONE2);
        pStmt.setString(21, registro.NUTELEFONE3);
        pStmt.setString(22, registro.NOREPRESENTANTE);
        pStmt.setString(23, registro.STATIVO);
        pStmt.setInt(24, registro.IDCONDPAGPADRAO);
        pStmt.setInt(25, registro.IDTRANSPORTADORAPADRAO);
        pStmt.setString(26, registro.TPPEDIDOPADRAO);
        pStmt.setString(27, registro.NOVENDEDORPADRAO);
        pStmt.setString(28, registro.TPFRETEPADRAO);
        pStmt.setString(29, registro.TPARQUIVOPADRAO);
        pStmt.setString(30, registro.TPFISCALPADRAO);
        pStmt.setString(31, registro.EMAILVENDEDORPADRAO);
    	
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