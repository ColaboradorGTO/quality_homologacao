var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var codeBarsOuNome = $.request.parameters.get("codeBarsOuNome");
    
    var query = ' SELECT DISTINCT' + 
    '   tbp.IDPRODUTO,' +
    '   tbp.NUCODBARRAS,' +
    '   tbp.DSNOME,' +
    '   tbp.PRECOCUSTO,' +
    '   ( CASE WHEN IFNULL(tbpp.PRECO_VENDA, 0) = 0 THEN tbp.PRECOVENDA ELSE tbpp.PRECO_VENDA END ) As PRECOVENDA' +
    ' FROM ' + 
    '   "VAR_DB_NAME".EMPRESA tbe' +
    '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0'+
    '   INNER JOIN "VAR_DB_NAME".NCM tbn on tbp.NUNCM = tbn.NUNCM AND tbe.SGUF = tbn.SGUF ' +
    '   LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO tbpp on tbpp.IDPRODUTO = tbp.IDPRODUTO '+
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
    }

   if ( codeBarsOuNome ) {
        query = query + ' And  (tbp.NUCODBARRAS = \'' + codeBarsOuNome + '\' OR tbp.DSNOME LIKE \'%'+codeBarsOuNome+'%\') ';
    }
    
    query = query + ' ORDER BY  tbp.IDPRODUTO ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    
    var conn = $.db.getConnection();
    
    var query = 'UPDATE "VAR_DB_NAME"."PRODUTO" SET ' + 
        ' "IDPRODUTO" = ?, ' +
        ' "IDGRUPOEMPRESARIAL" = ?, ' +
        ' "NUNCM" = ?, ' +
        ' "NUCEST" = ?, ' +
        ' "NUCST_ICMS" = ?, ' +
        ' "NUCFOP" = ?, ' +
        ' "PERC_OUT" = ?, ' +
        ' "NUCODBARRAS" = ?, ' +
        ' "DSNOME" = ?, ' +
        ' "STGRADE" = ?, ' +
        ' "UND" = ?, ' +
        ' "PRECOCUSTO" = ?, ' +
        ' "PRECOVENDA" = ?, ' +
        ' "QTDENTRADA" = ?, ' +
        ' "QTDCOMERCIALIZADA" = ?, ' +
        ' "QTDPERDA" = ?, ' +
        ' "QTDDISPONIVEL" = ?, ' +
        ' "PERCICMS" = ?, ' +
        ' "PERCISS" = ?, ' +
        ' "PERCPIS" = ?, ' +
        ' "PERCCOFINS" = ?, ' +
        ' "COD_CSOSN" = ?, ' +
        ' "PERCCSOSC" = ?, ' +
        ' "NUCST_IPI" = ?, ' +
        ' "NUCST_PIS" = ?, ' +
        ' "NUCST_COFINS" = ?, ' +
        ' "PERCIPI" = ?, ' +
        ' "DTULTALTERACAO" = ?, ' +
        ' "STPESAVEL" = ?, ' +
        ' "GRP_MATERIAIS" = ? ' + 
    	' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.IDPRODUTO);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.NUNCM);
        pStmt.setString(4, registro.NUCEST);
        pStmt.setString(5, registro.NUCST_ICMS);
        pStmt.setString(6, registro.NUCFOP);
        pStmt.setString(7, registro.PERC_OUT);
        pStmt.setString(8, registro.NUCODBARRAS);
        pStmt.setString(9, registro.DSNOME);
        pStmt.setInt(10, registro.STGRADE);
        pStmt.setString(11, registro.UND);
        pStmt.setFloat(12, registro.PRECOCUSTO);
        pStmt.setFloat(13, registro.PRECOVENDA);
        pStmt.setFloat(14, registro.QTDENTRADA);
        pStmt.setFloat(15, registro.QTDCOMERCIALIZADA);
        pStmt.setFloat(16, registro.QTDPERDA);
        pStmt.setFloat(17, registro.QTDDISPONIVEL);
        pStmt.setFloat(18, registro.PERCICMS);
        pStmt.setFloat(19, registro.PERCISS);
        pStmt.setFloat(20, registro.PERCPIS);
        pStmt.setFloat(21, registro.PERCCOFINS);
        pStmt.setString(22, registro.COD_CSOSN);
        pStmt.setFloat(23, registro.PERCCSOSC);
        pStmt.setString(24, registro.NUCST_IPI);
        pStmt.setString(25, registro.NUCST_PIS);
        pStmt.setString(26, registro.NUCST_COFINS);
        pStmt.setFloat(27, registro.PERCIPI);
        pStmt.setDate(28, registro.DTULTALTERACAO);
        pStmt.setString(29, registro.STPESAVEL);
        pStmt.setInt(30, registro.GRP_MATERIAIS);
    	pStmt.setInt(31, registro.ID);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
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

function fnIncluirDetalhesPromocao(conn, vIdPromocao, lstProdutos) {
	var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEPROMOCAO" ' +
		" ( " +
		' "IDDETALHEPROMO", ' +
		' "IDRESUMOPROMO", ' +
		' "IDPRODUTO" ' +
		' ) ' +
		' VALUES(?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	

	for (var i = 0; i < lstProdutos.length; i++) {
        
        var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMO")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPROMOCAO" WHERE 1 = ? ', 1);
		
		var registro = lstProdutos[i];

		pStmt.setInt(1, Id);
		pStmt.setInt(2, vIdPromocao);
		pStmt.setString(3, registro);
		
		
	
		pStmt.execute();
		conn.commit();
	}

	pStmt.close();

	
}

function fnIncluirDetalhesEmpresaPromocao(conn, vIdPromocao,vIdGrupo, lstEmpresas) {
	var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEEMPPROMO" ' +
		" ( " +
		' "IDDETALHEEMPPROMO", ' +
    	' "IDRESUMOPROMO", ' +
    	' "IDGRUPO", ' +
    	' "IDEMPRESA", ' +
    	' "STATIVO" ' +
		' ) ' +
		' VALUES(?,?,?,?,\'True\') ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	

	for (var i = 0; i < lstEmpresas.length; i++) {
        
        var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEEMPPROMO")),0) + 1 FROM "VAR_DB_NAME"."DETALHEEMPPROMO" WHERE 1 = ? ', 1);
		
		var registro = lstEmpresas[i];

		pStmt.setInt(1, Id);
		pStmt.setInt(2, vIdPromocao);
		pStmt.setInt(3, vIdGrupo);
		pStmt.setString(4, registro);
	
	
		pStmt.execute();
		conn.commit();
	}

	pStmt.close();

	
}



function fnHandlePost() {
	var conn = $.db.getConnection();
	var queryId = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDRESUMOPROMO")),0) + 1 FROM "VAR_DB_NAME"."RESUMOPROMOCAO" WHERE 1 = ? ', 1);
	try {
		var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOPROMOCAO" ' +
			' ( ' +
			' "IDRESUMOPROMO", ' +
			' "DSPROMO", ' +
        	' "VRPERCDESCONTO", ' +
        	' "VRPRECODESCONTO", ' +
        	' "VRAPARTIRDE", ' +
        	' "VRLIMITEDE", ' +
        	' "QTDAPARTIRDE", ' +
        	' "QTDLIMITEDE", ' +
        	' "DTINICIOPROMO", ' +
        	' "DTFIMPROMO", ' +
        	' "STATIVO" ' +
			' ) ' +
			' VALUES(?,?,?,?,?,?,?,?,?,?,?)';
		var pStmt = conn.prepareStatement(api.replaceDbName(query));
		var bodyJson = JSON.parse($.request.body.asString());

		for (var i = 0; i < bodyJson.length; i++) {
            
            var registro = bodyJson[i];

			pStmt.setInt(1, queryId);
			pStmt.setString(2, registro.DSPROMO);
			pStmt.setFloat(3, registro.VRPERCDESCONTO);
			pStmt.setFloat(4, registro.VRPRECODESCONTO);
			pStmt.setFloat(5, registro.VRAPARTIRDE);
			pStmt.setFloat(6, registro.VRLIMITEDE);
			pStmt.setInt(7, registro.QTDAPARTIRDE);
			pStmt.setInt(8, registro.QTDLIMITEDE);
			pStmt.setDate(9, registro.DTINICIOPROMO);
			pStmt.setDate(10, registro.DTFIMPROMO);
			pStmt.setString(11, registro.STATIVO);
		

			pStmt.execute();
			fnIncluirDetalhesPromocao(conn, queryId, registro.PRODUTOS);
			fnIncluirDetalhesEmpresaPromocao(conn,queryId,registro.IDGRUPO,registro.EMPRESAS);
			//fnIncluirPagamentos(conn, registro.NFe.infNFe.pag, registro.IDVENDA);
		
		
		    
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
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}