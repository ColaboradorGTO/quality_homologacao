var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var libEditProdutoDoItemPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.inativar-alterar-produto.libs.alterar-produtos-item", "libEditProdutoDoItemPedido");

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
    var idDetPedido = $.request.parameters.get("iddetPedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var sttransformado = $.request.parameters.get("sttransformado");

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
        '   FR.NOFANTASIA, ' +
        '   FR.NUCNPJ, ' +
        '   FB.IDFABRICANTE, ' + 
        '   FB.DSFABRICANTE, ' + 
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
        '   IFNULL( tbdp.VRCUSTOPRODATUAL,0) AS VRCUSTOPRODATUAL, ' +
        '   IFNULL( tbdp.VRVENDAPRODATUAL,0) AS VRVENDAPRODATUAL, ' +
        '   tbdp.OBSPRODUTO, ' +
        '   tbdp.IDCATEGORIAS AS CATEGORIAPROD, ' +
        '   CPS.DSCATEGORIAS AS DSCATEGORIAPROD, ' +
        '   CPS.TPCATEGORIAS AS TPCATEGORIAPROD, ' +
        '   CPS.TPCATEGORIAPEDIDO AS TPCATEGORIAPRODPEDIDO, ' +
        '   TO_VARCHAR( tbrp.DTPEDIDO, \'DD-MM-YYYY HH24:MI:SS\') AS DTPEDIDO ' +
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
        ' WHERE ' +
        '	1 = ?'+
        '   AND tbrp.STCANCELADO = \'False\' AND tbdp.STCANCELADO = \'False\' ';
    if ( byId ) {
        query = query + ' And  tbdp.IDDETALHEPEDIDO = \'' + byId + '\' ';
    }
    if ( idDetPedido ) {
        query = query + ' And  tbdp.IDDETALHEPEDIDO = \'' + idDetPedido + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  tbdp.IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }
    if ( sttransformado ) {
        query = query + ' And  tbdp.STTRANSFORMADO = \'' + sttransformado + '\'  ';
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
                        	d.IDCATEGORIAPEDIDO, \
                        	d.IDTIPOTECIDO, \
                        	d.IDCOR, \
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
                            ' "DTULTATUALIZACAO" = CURRENT_TIMESTAMP, ' +
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
                       // setTimestampOrNull(pStmt,15, registroProd.DTMOVPEDIDO);
                        pStmt.setString(15, registroProd.STECOMMERCE);
                        pStmt.setString(16, registroProd.STREDESOCIAL);
                        pStmt.setInt(17, parseInt(registroProd.IDFORNECEDOR));
                        pStmt.setString(18, registroProd.STREPOSICAO);
                        pStmt.setString(19, steditcomp);
                        pStmt.setInt(20, parseInt(registroProd.ID));
                        pStmt.setInt(21, parseInt(registroProd.IDTAMANHO));
                    
                        pStmt.execute();
                        pStmt.close();
        	}
        	
            //var retIntegracaoEditProdutoItemPedido = libEditProdutoDoItemPedido.executeProdutosItem(IDDETALHEPEDIDO);
            //if(retIntegracaoEditProdutoItemPedido === 'True'){
            //  return {
        	//        "msg": "Edição realizado com sucesso!"
        	//    };
            //}else{
            //    return {
        	//        "msg": "Error Edição!"
        	 //   };
            //}
            
	    conn.commit();
	    
	return {
        "msg": "Edição realizado com sucesso!"
    };

}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPEDIDO" SET ' + 
                ' "IDCOR" =  ?, ' + 
                ' "IDCATEGORIAPEDIDO" =  ?, ' +
                ' "IDTIPOTECIDO" =  ?, ' + 
                ' "IDLOCALEXPOSICAO" = ?, ' + 
                ' "NUREF" = ?, ' + 
                ' "DSPRODUTO" = ?, ' + 
                ' "QTDTOTAL" = ?, ' + 
                ' "NUCAIXA" = ?, ' + 
                ' "UND" = ?, ' + 
                ' "VRUNITBRUTO" = ?, ' + 
                ' "VRUNITLIQUIDO" = ?, ' + 
                ' "VRVENDA" = ?, ' + 
                ' "VRTOTAL" = ?, ' + 
                ' "STECOMMERCE" = ?, ' + 
                ' "STREDESOCIAL" = ?, ' +  
                ' "IDCATEGORIAS" = ? ' + 
        ' WHERE "IDDETALHEPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString());

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
             
        pStmt.setInt(1, registro.IDCOR);
        pStmt.setInt(2, registro.IDCATEGORIAPEDIDO);
        pStmt.setInt(3, registro.IDTIPOTECIDO);
        pStmt.setInt(4, registro.IDLOCALEXPOSICAO);
        pStmt.setString(5, registro.NUREF);
        pStmt.setString(6, registro.DSPRODUTO);
        pStmt.setFloat(7, registro.QTDTOTAL);
        pStmt.setInt(8, registro.NUCAIXA);
        pStmt.setInt(9, registro.UND);
        pStmt.setFloat(10, registro.VRUNITBRUTO);
        pStmt.setFloat(11, registro.VRUNITLIQUIDO);
        pStmt.setFloat(12, registro.VRVENDA);
        pStmt.setFloat(13, registro.VRTOTAL);
        pStmt.setString(14, registro.STECOMMERCE);
        pStmt.setString(15, registro.STREDESOCIAL);
        pStmt.setInt(16, registro.IDCATEGORIAS);
        pStmt.setInt(17, registro.IDDETALHEPEDIDO);
        
        pStmt.execute();
    }

	pStmt.close();

	conn.commit();
	
    return fnUpdatProdPedido(conn,registro.IDDETALHEPEDIDO);
    	

	//return fnAtualizarItemPedidoSAP(registro.IDDETALHEPEDIDO);
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