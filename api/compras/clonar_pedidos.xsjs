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

function fnIncluirDetalhePedidoGrade(idDetalhePedidoAnt, idDetalhePedido, conn){
     var queryDetalhePedidoGradeAnterior = 'SELECT IDDETALHEPEDIDOGRADE FROM "VAR_DB_NAME"."DETALHEPEDIDOGRADE" WHERE IDDETALHEPEDIDO = ?';
     var linhas = api.sqlQuery(queryDetalhePedidoGradeAnterior, idDetalhePedidoAnt);
     for (var i = 0; i < linhas.length; i++) {
        var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEPEDIDOGRADE")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPEDIDOGRADE" WHERE 1 = ? ', 1);
    	var det = linhas[i];
        var queryDetalheGrade ='  INSERT INTO "VAR_DB_NAME"."DETALHEPEDIDOGRADE" ( '+ 	
         	' IDDETALHEPEDIDOGRADE' +
	        ' ,IDDETALHEPEDIDO' +
	        ' ,IDTAMANHO' +
	        ' ,INDICETAMANHO' +
	        ' ,QTD' +
	        ' ,STATIVO)' +
	    '  SELECT '+ Id + ', '+ idDetalhePedido +
        	' ,"IDTAMANHO"' +
        	' ,"INDICETAMANHO"' +
        	' ,"QTD"' +
        	' ,"STATIVO"' +
    	' FROM "VAR_DB_NAME"."DETALHEPEDIDOGRADE"'+
        ' WHERE IDDETALHEPEDIDOGRADE = '+ det.IDDETALHEPEDIDOGRADE +';';
        
        var atualizadorDeDetalheGrade = conn.prepareStatement(api.replaceDbName(queryDetalheGrade));
        atualizadorDeDetalheGrade.execute();
        conn.commit();
     }
     return true;
}


function fnIncluirDetalhePedido(IdResumoPedidoClonar,idResumoPedido, conn){
    var queryDetalhePedidoAnterior = 'SELECT IDDETALHEPEDIDO FROM "VAR_DB_NAME"."DETALHEPEDIDO" WHERE IDRESUMOPEDIDO = ?';
    var linhas = api.sqlQuery(queryDetalhePedidoAnterior, IdResumoPedidoClonar);
   
 for (var i = 0; i < linhas.length; i++) {
    var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDDETALHEPEDIDO")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPEDIDO" WHERE 1 = ? ', 1);
	var det = linhas[i];
    var queryDetalhe ='  INSERT INTO "VAR_DB_NAME"."DETALHEPEDIDO" ( '+
        	' IDDETALHEPEDIDO' +
        	' ,IDRESUMOPEDIDO'+
        	' ,IDCOR'+
        	' ,IDSUBGRUPOESTRUTURA'+
        	' ,IDCATEGORIAPEDIDO'+
        	' ,IDTIPOTECIDO'+
        	' ,IDESTILO'+
        	' ,IDFABRICANTE'+
        	' ,IDLOCALEXPOSICAO'+
        	' ,NUREF'+
        	' ,DSPRODUTO'+
        	' ,QTDTOTAL'+
        	' ,NUCAIXA'+
        	' ,UND'+
        	' ,VRUNITBRUTO'+
        	' ,DESC01'+
        	' ,DESC02'+
        	' ,DESC03'+
        	' ,VRUNITLIQUIDO'+
        	' ,VRVENDA'+
        	' ,VRTOTAL'+
        	' ,STRECEBIDO'+
        	' ,STECOMMERCE'+
        	' ,STREDESOCIAL'+
        	' ,STCANCELADO'+
        	' ,STTRANSFORMADO'+
        	' ,VRCUSTOPRODATUAL'+
        	' ,VRVENDAPRODATUAL'+
        	' ,OBSPRODUTO'+
        	' ,IDCATEGORIAS)'+
    	' SELECT '+ Id + ', '+ idResumoPedido +
    	    ' ,IDCOR'+
        	' ,IDSUBGRUPOESTRUTURA'+
        	' ,IDCATEGORIAPEDIDO'+
        	' ,IDTIPOTECIDO'+
        	' ,IDESTILO'+
        	' ,IDFABRICANTE'+
        	' ,IDLOCALEXPOSICAO'+
        	' ,NUREF'+
        	' ,DSPRODUTO'+
        	' ,QTDTOTAL'+
        	' ,NUCAIXA'+
        	' ,UND'+
        	' ,VRUNITBRUTO'+
        	' ,DESC01'+
        	' ,DESC02'+
        	' ,DESC03'+
        	' ,VRUNITLIQUIDO'+
        	' ,VRVENDA'+
        	' ,VRTOTAL'+
        	' ,STRECEBIDO'+
        	' ,STECOMMERCE'+
        	' ,STREDESOCIAL'+
        	' ,STCANCELADO'+
        	' ,\'False\''+
        	' ,VRCUSTOPRODATUAL'+
        	' ,VRVENDAPRODATUAL'+
        	' ,OBSPRODUTO'+
        	' ,IDCATEGORIAS'+
        	' FROM "VAR_DB_NAME"."DETALHEPEDIDO"'+
        	' WHERE IDDETALHEPEDIDO = '+ det.IDDETALHEPEDIDO +';';
    //return queryDetalhe;
    var atualizadorDeDetalhe = conn.prepareStatement(api.replaceDbName(queryDetalhe));
    atualizadorDeDetalhe.execute();
    conn.commit();
    fnIncluirDetalhePedidoGrade(det.IDDETALHEPEDIDO, Id, conn);
 }

 return true;

}

function fnHandlePost(){
    var conn = $.db.getConnection();
    //'SELECT QUALITY_CONC_HML.SEQ_RESUMOPEDIDO.NEXTVAL FROM DUMMY WHERE 1=?';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOPEDIDO" ' + 
		" ( " +
		    ' "IDRESUMOPEDIDO", ' +
    		' "IDGRUPOEMPRESARIAL", ' +
            ' "IDSUBGRUPOEMPRESARIAL", ' +
            ' "IDCOMPRADOR", ' +
            ' "IDCONDICAOPAGAMENTO", ' +
            ' "IDFORNECEDOR", ' +
            ' "IDTRANSPORTADORA", ' +
            ' "IDANDAMENTO", ' +
            ' "MODPEDIDO", ' +
            ' "NOVENDEDOR", ' +
            ' "EEMAILVENDEDOR", ' +
            ' "DTPEDIDO", ' +
            ' "DTPREVENTREGA", ' +
            ' "TPFRETE", ' +
            ' "NUTOTALITENS", ' +
            ' "QTDTOTPRODUTOS", ' +
            ' "VRTOTALBRUTO", ' +
            ' "DESCPERC01", ' +
            ' "DESCPERC02", ' +
            ' "DESCPERC03", ' +
            ' "PERCCOMISSAO", ' +
            ' "VRTOTALLIQUIDO", ' +
            ' "DTFECHAMENTOPEDIDO", ' +
            ' "DTCADASTRO", ' +
            ' "TPARQUIVO", ' +
            ' "STDISTRIBUIDO", ' +
            ' "STAGRUPAPRODUTO", ' +
            ' "STCANCELADO", ' + 
            ' "TPFISCAL", ' + 
            ' "OBSPEDIDO", ' +
            ' "OBSPEDIDO2" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

   
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var idResumoPedido = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDRESUMOPEDIDO")),0) + 1 FROM "VAR_DB_NAME"."RESUMOPEDIDO" WHERE 1 = ? ', 1);//api.executeScalar(queryId,1);
		
        pStmt.setInt(1, parseInt(idResumoPedido));        
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setInt(4, registro.IDCOMPRADOR);
        pStmt.setInt(5, registro.IDCONDICAOPAGAMENTO);
        pStmt.setString(6, registro.IDFORNECEDOR);
        setIntOrNull(pStmt,7, registro.IDTRANSPORTADORA);
        pStmt.setInt(8, registro.IDANDAMENTO);
        pStmt.setString(9, registro.MODPEDIDO);
        pStmt.setString(10, registro.NOVENDEDOR);
        pStmt.setString(11, registro.EEMAILVENDEDOR);
        pStmt.setDate(12, registro.DTPEDIDO);
        pStmt.setDate(13, registro.DTPREVENTREGA);
        pStmt.setString(14, registro.TPFRETE);
        pStmt.setInt(15, registro.NUTOTALITENS);
        pStmt.setFloat(16, registro.QTDTOTPRODUTOS);
        pStmt.setFloat(17, registro.VRTOTALBRUTO);
        pStmt.setFloat(18, registro.DESCPERC01);
        pStmt.setFloat(19, registro.DESCPERC02);
        pStmt.setFloat(20, registro.DESCPERC03);
        pStmt.setFloat(21, registro.PERCCOMISSAO);
        pStmt.setFloat(22, registro.VRTOTALLIQUIDO);
        pStmt.setDate(23, registro.DTFECHAMENTOPEDIDO);
        pStmt.setDate(24, registro.DTCADASTRO);
        pStmt.setString(25, registro.TPARQUIVO);
        pStmt.setString(26, registro.STDISTRIBUIDO);
        pStmt.setString(27, registro.STAGRUPAPRODUTO);
        pStmt.setString(28, registro.STCANCELADO);
        pStmt.setString(29, registro.TPFISCAL);
        pStmt.setString(30, registro.OBSPEDIDO);
        pStmt.setString(31, registro.OBSPEDIDO2);
			
        pStmt.execute();
        
		fnIncluirDetalhePedido(registro.IdResumoPedidoClonar,idResumoPedido, conn);
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