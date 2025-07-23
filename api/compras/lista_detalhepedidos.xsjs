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

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function fnHandleGet(byId) {
    
    var idPedido = $.request.parameters.get("idpedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var sttransformado = $.request.parameters.get("sttransformado");
    var streposicao = $.request.parameters.get("streposicao");

    var query =  ' SELECT ' +
        '   tbrp.IDGRUPOEMPRESARIAL, ' +
        '   tbrp.IDSUBGRUPOEMPRESARIAL, ' +
        '   tbrp.IDANDAMENTO, ' +
        '   tband.DSSETOR, ' +
        '   tbdp.IDDETALHEPEDIDO AS IDDETPEDIDO, ' +
        '   tbdp.IDRESUMOPEDIDO AS IDPEDIDO, ' +
        '   tbdp.IDCOR, ' +
        '   tbdp.IDTIPOTECIDO, ' +
        '   SE.IDGRUPOESTRUTURA, ' +
        '   tbdp.IDSUBGRUPOESTRUTURA, ' +
        '   SE.DSSUBGRUPOESTRUTURA, ' +
        '   tbdp.IDCATEGORIAPEDIDO, ' +
        '   CP.DSCATEGORIAPEDIDO, ' + 
        '   CP.TIPOPEDIDO, ' + 
        '   CR.DSCOR, ' + 
        '   FR.IDFORNECEDOR, ' + 
        '   FR.NORAZAOSOCIAL, ' + 
        '   FR.IDFORNECEDORSAP, ' + 
        '   FR.STMIGRADOSAP as STMIGRADOSAPFORNECEDOR, ' + 
        '   FB.IDFABRICANTE, ' + 
        '   FB.DSFABRICANTE, ' +
        '   FB.IDSAP as IDFABRICANTESAP, ' +
        '   FB.STMIGRADOSAP as STMIGRADOSAPFABRICANTE, ' +
        '   TBT.DSTIPOTECIDO, ' + 
        '   LE.IDLOCALEXPOSICAO, ' + 
        '   LE.DSLOCALEXPOSICAO, ' + 
        '   ES.IDESTILO, ' + 
        '   ES.DSESTILO, ' + 
        '   tbdp.NUREF, ' +
        '   tbdp.DSPRODUTO, ' +
        '   tbdp.QTDTOTAL, ' +
        '   tbdp.NUCAIXA, ' +
        '   UN.DSSIGLA, ' +
        '   UN.IDUNIDADEMEDIDA, ' +
        '   ( tbdp.VRUNITBRUTO) AS VRUNITBRUTODETALHEPEDIDO, ' +
        '   IFNULL( tbdp.DESC01,0) AS DESC01, ' +
        '   IFNULL( tbdp.DESC02,0) AS DESC02, ' +
        '   IFNULL( tbdp.DESC03,0) AS DESC03, ' +
        '   ( tbdp.VRUNITLIQUIDO) AS VRUNITLIQDETALHEPEDIDO, ' + 
        '   ( tbdp.VRVENDA) AS VRVENDADETALHEPEDIDO, ' +
        '   ( tbdp.VRTOTAL) AS VRTOTALDETALHEPEDIDO, ' +
        '   tbdp.STRECEBIDO, ' +
        '   tbdp.STECOMMERCE, ' +
        '   tbdp.STREDESOCIAL, ' +
        '   tbdp.STCANCELADO, ' +
        '   tbdp.STTRANSFORMADO, ' +
        '   tbdp.STREPOSICAO, ' +
        '   IFNULL( tbdp.NUCODBARRAS,\'0\') AS NUCODBARRAS, ' +
        '   IFNULL( tbdp.VRCUSTOPRODATUAL,0) AS VRCUSTOPRODATUAL, ' +
        '   IFNULL( tbdp.VRVENDAPRODATUAL,0) AS VRVENDAPRODATUAL, ' +
        '   tbdp.OBSPRODUTO, ' +
        '   tbdp.IDCATEGORIAS AS CATEGORIAPROD, ' +
        '   CPS.DSCATEGORIAS AS DSCATEGORIAPROD, ' +
        '   CPS.TPCATEGORIAS AS TPCATEGORIAPROD, ' +
        '   CPS.TPCATEGORIAPEDIDO AS TPCATEGORIAPRODPEDIDO, ' +
        '   TO_VARCHAR( tbrp.DTPEDIDO, \'DD-MM-YYYY HH24:MI:SS\') AS DTPEDIDO, ' +
        '   TBP.NUNCM, ' +
        '   TBP.IDTIPOPRODUTOFISCAL, ' +
        '   TBP.IDFONTEPRODUTOFISCAL, ' +
        '   tbdp.NUCODBARRAS, ' +
        '   tbdp.IDPRODUTO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DETALHEPEDIDO tbdp ' +
        '   INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO tbrp ON tbdp.IDRESUMOPEDIDO = tbrp.IDRESUMOPEDIDO  ' +
		'   INNER JOIN "VAR_DB_NAME".ANDAMENTOS tband ON tbrp.IDANDAMENTO = tband.IDANDAMENTO  ' +
        '   INNER JOIN "VAR_DB_NAME".COR CR ON tbdp.IDCOR = CR.IDCOR  ' +
        '   INNER JOIN "VAR_DB_NAME".TIPOTECIDOS TBT ON tbdp.IDTIPOTECIDO = TBT.IDTPTECIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO CP ON tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA UN ON tbdp.UND = UN.IDUNIDADEMEDIDA  ' +
        '   INNER JOIN "VAR_DB_NAME".ESTILOS ES ON tbdp.IDESTILO = ES.IDESTILO  ' +
        '   INNER JOIN "VAR_DB_NAME".LOCALEXPOSICAO LE ON tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  ' +
        '   INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA SE ON tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  ' +
        '   INNER JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON SE.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA  ' +
        '   INNER JOIN "VAR_DB_NAME".FORNECEDOR FR ON tbrp.IDFORNECEDOR = FR.IDFORNECEDOR  ' +
        '   INNER JOIN "VAR_DB_NAME".FABRICANTE FB ON tbdp.IDFABRICANTE = FB.IDFABRICANTE  ' +
        '   INNER JOIN "VAR_DB_NAME".CATEGORIAS CPS ON tbdp.IDCATEGORIAS = CPS.IDCATEGORIAS  ' +
        '   LEFT JOIN "VAR_DB_NAME".PRODUTO TBP ON TBP.NUCODBARRAS = tbdp.NUCODBARRAS ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND tbrp.STCANCELADO = \'False\' AND tbdp.STCANCELADO = \'False\' ';
    if ( byId ) {
        query = query + ' And  tbdp.IDDETALHEPEDIDO = \'' + byId + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  tbdp.IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }
    if ( sttransformado ) {
        query = query + ' And  tbdp.STTRANSFORMADO = \'' + sttransformado + '\'  ';
    }
    if ( streposicao ) {
        query = query + ' And  tbdp.STREPOSICAO = \'' + streposicao + '\'  ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (tbrp.DTPEDIDO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') ';
    }
    
    query = query + ' ORDER BY tbdp.NUREF, tbdp.DSPRODUTO';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnUpdatProdPedido(conn, IDDETALHEPEDIDO) {
    
    var steditcomp = 'True';
    var queryProdutosPed =  'SELECT \
                        	d.IDDETALHEPEDIDO AS ID, \
                        	TRIM(d.NUREF) AS NUREFPROD, \
                        	d.IDTIPOTECIDO, \
                        	d.IDCOR, \
                        	d.IDCATEGORIAPEDIDO, \
                        	d.IDLOCALEXPOSICAO, \
                        	d.IDESTILO, \
                        	d.IDFABRICANTE, \
                        	d.IDCATEGORIAS, \
                        	FORNECEDOR.IDFORNECEDOR, \
                        	TAMANHO.IDTAMANHO AS IDTAMANHO, \
                        	UNIDADEMEDIDA.DSSIGLA AS UN, \
                        	d.VRUNITLIQUIDO AS VRUNIT, \
                        	d.VRVENDA AS VRVENDA, \
                        	IFNULL(d.STREPOSICAO, \'False\') AS STREPOSICAO, \
                        	IFNULL(d.STECOMMERCE, \'False\') AS STECOMMERCE, \
                        	IFNULL(d.STREDESOCIAL, \'False\') AS STREDESOCIAL, \
                        	DETALHEPEDIDOGRADE.QTD AS QTDPRODUTO, \
                        	(DETALHEPEDIDOGRADE.QTD * d.VRUNITLIQUIDO) AS TOTALCUSTO, \
                        	(DETALHEPEDIDOGRADE.QTD * d.VRVENDA) AS TOTALVENDA, \
            	            IFNULL(RESUMOPEDIDO.DTMOVPEDIDO, now()) AS DTMOVPEDIDO \
                            FROM "VAR_DB_NAME".DETALHEPEDIDO AS d \
                        	INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO ON d.IDRESUMOPEDIDO = RESUMOPEDIDO.IDRESUMOPEDIDO \
                        	INNER JOIN "VAR_DB_NAME".FORNECEDOR ON RESUMOPEDIDO.IDFORNECEDOR = FORNECEDOR.IDFORNECEDOR \
                        	INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA ON d.UND = UNIDADEMEDIDA.IDUNIDADEMEDIDA \
                        	INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE ON d.IDDETALHEPEDIDO = DETALHEPEDIDOGRADE.IDDETALHEPEDIDO AND DETALHEPEDIDOGRADE.STATIVO = \'True\' \
                        	INNER JOIN "VAR_DB_NAME".TAMANHO ON DETALHEPEDIDOGRADE.IDTAMANHO = TAMANHO.IDTAMANHO  \
                            WHERE d.IDDETALHEPEDIDO = ?  \
                        	And d.STCANCELADO =  \'False\' ';

        	var lstDeProdutosPed = api.sqlQuery(queryProdutosPed,IDDETALHEPEDIDO);
        	
        	for (var i = 0; i < lstDeProdutosPed.length; i++) {
        	    var registroProd = lstDeProdutosPed[i];
        	    
                        var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' +
                            ' "IDCOR" = ?, ' +
                            ' "IDCATEGORIAPEDIDO" = ?, ' +
                            ' "IDTIPOTECIDO" = ?, ' +
                            ' "IDESTILO" = ?, ' +
                            ' "IDFABRICANTE" = ?, ' +
                            ' "IDLOCALEXPOSICAO" = ?, ' +
                            ' "IDCATEGORIAS" = ?, ' +
                            ' "NUREF" = ?, ' +
                            ' "QTDPRODUTO" = ?, ' +
                            ' "UND" = ?, ' +
                            ' "VRCUSTO" = ?, ' +
                            ' "VRVENDA" = ?, ' +
                            ' "VRTOTALCUSTO" = ?, ' +
                            ' "VRTOTALVENDA" = ?, ' +
                            ' "DTULTATUALIZACAO" = ?, ' +
                            ' "STECOMMERCE" = ?, ' +
                            ' "STREDESOCIAL" = ?,' +
                            ' "IDFORNECEDOR" = ?, ' +
                            ' "STREPOSICAO" = ?, ' +
                            ' "STEDITADOCOMPRAS" = ? ' +
                            ' WHERE "IDDETALHEPEDIDO" =  ? AND "IDTAMANHO" =  ?';
                    		
                        var pStmt = conn.prepareStatement(api.replaceDbName(query));
    
                        pStmt.setInt(1, parseInt(registroProd.IDCOR));
                        pStmt.setInt(2, parseInt(registroProd.IDCATEGORIAPEDIDO));
                        pStmt.setInt(3, parseInt(registroProd.IDTIPOTECIDO));
                        pStmt.setInt(4, parseInt(registroProd.IDESTILO));
                        pStmt.setInt(5, parseInt(registroProd.IDFABRICANTE));
                        pStmt.setInt(6, parseInt(registroProd.IDLOCALEXPOSICAO));
                        pStmt.setInt(7, parseInt(registroProd.IDCATEGORIAS));
                        pStmt.setString(8, registroProd.NUREFPROD);
                        pStmt.setFloat(9, parseFloat(registroProd.QTDPRODUTO) || 0);
                        pStmt.setString(10, registroProd.UN);
                        pStmt.setFloat(11, parseFloat(registroProd.VRUNIT) || 0);
                        pStmt.setFloat(12, parseFloat(registroProd.VRVENDA) || 0);
                        pStmt.setFloat(13, parseFloat(registroProd.TOTALCUSTO)||0);
                        pStmt.setFloat(14, parseFloat(registroProd.TOTALVENDA) || 0);
                        setTimestampOrNull(pStmt,15, registroProd.DTMOVPEDIDO);
                        pStmt.setString(16, registroProd.STECOMMERCE);
                        pStmt.setString(17, registroProd.STREDESOCIAL);
                        pStmt.setInt(18, parseInt(registroProd.IDFORNECEDOR));
                        pStmt.setString(19, registroProd.STREPOSICAO);
                        pStmt.setString(20, steditcomp);
                        pStmt.setInt(21, parseInt(registroProd.ID));
                        pStmt.setInt(22, parseInt(registroProd.IDTAMANHO));
                    
                        pStmt.execute();
                        pStmt.close();
        	}
        
	    conn.commit();

}

function fnEditDetalhesPedidoGrade(conn, lstDetGradEdit, IDDETALHEPEDIDO) {

    var query = 'UPDATE "VAR_DB_NAME".DETALHEPEDIDOGRADE SET STATIVO = \'False\' WHERE DETALHEPEDIDOGRADE.IDDETALHEPEDIDO=?';
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    pStmt.setInt(1, parseInt(IDDETALHEPEDIDO));
    
    pStmt.execute();
    pStmt.close();
    conn.commit();
        	        
    var stativoedit = 'True';
	var query2 = 'INSERT INTO "VAR_DB_NAME"."DETALHEPEDIDOGRADE" ' +
		" ( " +
		' "IDDETALHEPEDIDOGRADE", ' +
		' "IDDETALHEPEDIDO", ' +
		' "IDTAMANHO", ' +
		' "INDICETAMANHO", ' +
		' "QTD", ' +
		' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?) ';

	var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));

	for (var i = 0; i < lstDetGradEdit.length; i++) {

        var queryIdGrade = 'SELECT IFNULL(MAX(TO_INT("IDDETALHEPEDIDOGRADE")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPEDIDOGRADE" WHERE 1 = ?';

		var registroedit = lstDetGradEdit[i];
		var idDetalhePedidoGradeEdit = api.executeScalar(queryIdGrade,1);

		pStmt2.setInt(1, idDetalhePedidoGradeEdit);
		pStmt2.setInt(2, IDDETALHEPEDIDO);
		pStmt2.setInt(3, registroedit.idgrade);
		pStmt2.setInt(4, registroedit.vlrgrade);
		pStmt2.setFloat(5, registroedit.qtdgrade);
		pStmt2.setString(6, stativoedit);
	
		pStmt2.execute();
		conn.commit();
		
		//return idDetalhePedidoGradeEdit;
	}
    fnUpdatProdPedido(conn,IDDETALHEPEDIDO);
	pStmt2.close();

}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPEDIDO" SET ' +
        ' "IDCOR" =  ?, ' +
        ' "IDSUBGRUPOESTRUTURA" =  ?, ' +
        ' "IDTIPOTECIDO" =  ?, ' +
        ' "IDESTILO" =  ?, ' +
        ' "IDFABRICANTE" =  ?, ' +
        ' "IDLOCALEXPOSICAO" = ?, ' +
        ' "NUREF" = ?, ' +
        ' "DSPRODUTO" = ?, ' +
        ' "QTDTOTAL" = ?, ' +
        ' "NUCAIXA" = ?, ' +
        ' "UND" = ?, ' +
        ' "VRUNITBRUTO" = ?, ' +
        ' "DESC01" = ?, ' +
        ' "DESC02" = ?, ' +
        ' "DESC03" = ?, ' +
        ' "VRUNITLIQUIDO" = ?, ' +
        ' "VRVENDA" = ?, ' +
        ' "VRTOTAL" = ?, ' +
        ' "STECOMMERCE" = ?, ' +
        ' "STREDESOCIAL" = ?, ' +
        ' "VRCUSTOPRODATUAL" = ?, ' +
        ' "VRVENDAPRODATUAL" = ?, ' +
        ' "OBSPRODUTO" = ?, ' +
        ' "IDCATEGORIAS" = ?, ' +
        ' "STREPOSICAO" = ?, ' +
        ' "NUCODBARRAS" = ?, ' +
        ' "IDPRODUTO" = ?, ' +
        ' "DTATUALIZACAO" = CURRENT_TIMESTAMP, ' +
        ' "IDRESPATUALIZACAO" = ? ' +
        ' WHERE "IDDETALHEPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
        pStmt.setInt(1, registro.IDCOR);
        pStmt.setInt(2, registro.IDSUBGRUPOESTRUTURA);
        pStmt.setInt(3, registro.IDTIPOTECIDO);
        pStmt.setInt(4, registro.IDESTILO);
        pStmt.setInt(5, registro.IDFABRICANTE);
        pStmt.setInt(6, registro.IDLOCALEXPOSICAO);
        pStmt.setString(7, registro.NUREF);
        pStmt.setString(8, registro.DSPRODUTO);
        pStmt.setFloat(9, registro.QTDTOTAL);
        pStmt.setFloat(10, registro.NUCAIXA);
        pStmt.setInt(11, registro.UND);
        pStmt.setFloat(12, registro.VRUNITBRUTO);
        pStmt.setFloat(13, registro.DESC01);
        pStmt.setFloat(14, registro.DESC02);
        pStmt.setFloat(15, registro.DESC03);
        pStmt.setFloat(16, registro.VRUNITLIQUIDO);
        pStmt.setFloat(17, registro.VRVENDA);
        pStmt.setFloat(18, registro.VRTOTAL);
        pStmt.setString(19, registro.STECOMMERCE);
        pStmt.setString(20, registro.STREDESOCIAL);
        pStmt.setFloat(21, registro.VRCUSTOPRODATUAL);
        pStmt.setFloat(22, registro.VRVENDAPRODATUAL);
        pStmt.setString(23, registro.OBSPRODUTO);
        pStmt.setInt(24, registro.IDCATEGORIAS);
        pStmt.setString(25, registro.STREPOSICAO);
        setStringOrNull(pStmt, 26, registro.NUCODBARRAS);
        setStringOrNull(pStmt, 27, registro.IDPRODUTO);
        pStmt.setInt(28, registro.IDRESPATUALIZACAO);
        pStmt.setInt(29, registro.idDetPedido);
        
    	pStmt.execute();
    	
    	fnEditDetalhesPedidoGrade(conn,bodyJson[0].GRADE,registro.idDetPedido);
    }
	pStmt.close();

	conn.commit();
	return 'realizado com sucesso';

}

function fnIncluirDetalhesPedidoGrade(conn, lstDetGrad, IDDETALHEPEDIDO) {
   
    var stativo = 'True';
	var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEPEDIDOGRADE" ' +
		" ( " +
		' "IDDETALHEPEDIDOGRADE", ' +
		' "IDDETALHEPEDIDO", ' +
		' "IDTAMANHO", ' +
		' "INDICETAMANHO", ' +
		' "QTD", ' +
		' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstDetGrad.length; i++) {
	    
        var queryIdGrade = 'SELECT IFNULL(MAX(TO_INT("IDDETALHEPEDIDOGRADE")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPEDIDOGRADE" WHERE 1 = ?';

		var registro = lstDetGrad[i];
		var idDetalhePedidoGrade = api.executeScalar(queryIdGrade,1);

		pStmt.setInt(1, idDetalhePedidoGrade);
		pStmt.setInt(2, IDDETALHEPEDIDO);
		pStmt.setInt(3, registro.idgrade);
		pStmt.setInt(4, registro.vlrgrade);
		pStmt.setFloat(5, registro.qtdgrade);
		pStmt.setString(6, stativo);
	
		pStmt.execute();
		conn.commit();
		
		//return idDetalhePedidoGrade;
	}

	pStmt.close();
}

function fnHandlePost(){
    
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDDETALHEPEDIDO")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPEDIDO" WHERE 1 = ?';
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEPEDIDO" ' + 
		" ( " +
		        ' "IDDETALHEPEDIDO", ' +
		        ' "IDRESUMOPEDIDO", ' + 
		        ' "IDCOR", ' + 
                ' "IDSUBGRUPOESTRUTURA", ' + 
                ' "IDCATEGORIAPEDIDO", ' + 
                ' "IDTIPOTECIDO", ' + 
                ' "IDESTILO", ' + 
                ' "IDFABRICANTE", ' + 
                ' "IDLOCALEXPOSICAO", ' + 
                ' "NUREF", ' + 
                ' "DSPRODUTO", ' + 
                ' "QTDTOTAL", ' + 
                ' "NUCAIXA", ' + 
                ' "UND", ' + 
                ' "VRUNITBRUTO", ' + 
                ' "DESC01", ' + 
                ' "DESC02", ' + 
                ' "DESC03", ' + 
                ' "VRUNITLIQUIDO", ' + 
                ' "VRVENDA", ' + 
                ' "VRTOTAL", ' + 
                ' "STRECEBIDO", ' + 
                ' "STECOMMERCE", ' + 
                ' "STREDESOCIAL", ' + 
                ' "STCANCELADO", ' + 
                ' "VRCUSTOPRODATUAL", ' + 
                ' "VRVENDAPRODATUAL", ' + 
                ' "OBSPRODUTO", ' + 
                ' "STTRANSFORMADO", ' + 
                ' "IDCATEGORIAS", ' + 
                ' "STREPOSICAO", ' + 
                ' "NUCODBARRAS", ' + 
                ' "IDPRODUTO", ' + 
                ' "DTCADASTRO", ' + 
                ' "IDRESPCADASTRO" ' + 
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, now(), ?)';

  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		var idDetalhePedido = api.executeScalar(queryId,1);
		
        pStmt.setInt(1,idDetalhePedido);    
        pStmt.setInt(2, registro.IDRESUMOPEDIDO);   
        pStmt.setInt(3, registro.IDCOR);
        pStmt.setInt(4, registro.IDSUBGRUPOESTRUTURA);
        pStmt.setInt(5, registro.IDCATEGORIAPEDIDO);
        pStmt.setInt(6, registro.IDTIPOTECIDO);
        pStmt.setInt(7, registro.IDESTILO);
        pStmt.setInt(8, registro.IDFABRICANTE);
        pStmt.setInt(9, registro.IDLOCALEXPOSICAO);
        pStmt.setString(10, registro.NUREF);
        pStmt.setString(11, registro.DSPRODUTO);
        pStmt.setFloat(12, registro.QTDTOTAL);
        pStmt.setInt(13, registro.NUCAIXA);
        pStmt.setInt(14, registro.UND);
        pStmt.setFloat(15, registro.VRUNITBRUTO);
        pStmt.setFloat(16, registro.DESC01);
        pStmt.setFloat(17, registro.DESC02);
        pStmt.setFloat(18, registro.DESC03);
        pStmt.setFloat(19, registro.VRUNITLIQUIDO);
        pStmt.setFloat(20, registro.VRVENDA);
        pStmt.setFloat(21, registro.VRTOTAL);
        pStmt.setString(22, registro.STRECEBIDO);
        pStmt.setString(23, registro.STECOMMERCE);
        pStmt.setString(24, registro.STREDESOCIAL);
        pStmt.setString(25, registro.STCANCELADO);
        pStmt.setFloat(26, registro.VRCUSTOPRODATUAL);
        pStmt.setFloat(27, registro.VRVENDAPRODATUAL);
        pStmt.setString(28, registro.OBSPRODUTO);
        pStmt.setString(29, registro.STTRANSFORMADO);
        pStmt.setInt(30, registro.IDCATEGORIAS);
        pStmt.setString(31, registro.STREPOSICAO);
        setStringOrNull(pStmt, 32, registro.NUCODBARRAS);
        setStringOrNull(pStmt, 33, registro.IDPRODUTO);
        pStmt.setInt(34, registro.IDRESPCADASTRO);
        
        pStmt.execute();
        
        fnIncluirDetalhesPedidoGrade(conn,bodyJson[0].GRADE,idDetalhePedido);
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