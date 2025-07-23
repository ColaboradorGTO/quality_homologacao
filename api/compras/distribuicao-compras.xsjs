var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function fnHandlePut(){

    var conn = $.db.getConnection();
    var bodyJson = JSON.parse($.request.body.asString());

    var pIdDistribuicaoCompras = bodyJson[0].IDDISTRIBUICAOCOMPRAS;
    var pIdPedidoCompra = bodyJson[0].IDPEDIDOCOMPRA;
    var pIdEmpresa = bodyJson[0].IDEMPRESA;
    var pIdFilial = bodyJson[0].IDFILIAL;
    var pCodBarras = bodyJson[0].CODBARRAS;
    var pQtdSugestaoAlteracao = bodyJson[0].QTDSUGESTAOALTERACAO;
    var pIdUsuarioAlteracao = bodyJson[0].IDUSUARIOALTERACAO;

    if (pIdDistribuicaoCompras > 0) {
        var query = 'UPDATE "VAR_DB_NAME"."DISTRIBUICAOCOMPRAS" SET "QTDSUGESTAOALTERACAO" = ?, "DATAALTERACAO" = NOW(), "IDUSUARIOALTERACAO" = ? ' + 
        	        'WHERE "IDDISTRIBUICAOCOMPRAS" = ? ';
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
        
        pStmt.setInt(1, pQtdSugestaoAlteracao);
        pStmt.setInt(2, pIdUsuarioAlteracao);
        pStmt.setInt(3, pIdDistribuicaoCompras);
    	
    	pStmt.execute();
    	pStmt.close();
    	conn.commit();
    	
    	return {
    	    msg : "Atualização realizada com sucesso!"
    	};
    } else {
        var querySel =  'SELECT ' +
                            'rp.IDFORNECEDOR, dpp.IDFABRICANTE, dpp.IDSUBGRUPOESTRUTURA, dpp.IDCATEGORIAS, dpp.IDTIPOTECIDO, dpp.IDCOR, dpp.IDESTILO, dpg.IDTAMANHO ' +
                            ',dpp.DSPRODUTO, dpp.VRVENDA, dpg.INDICETAMANHO, dpg.QTD AS TOTALPRODUTOGRADE ' +
                        'FROM "QUALITY_CONC_HML".RESUMOPEDIDO rp ' +
                        'INNER JOIN "QUALITY_CONC_HML".DETALHEPEDIDO dp ON dp.IDRESUMOPEDIDO = rp.IDRESUMOPEDIDO AND dp.STCANCELADO = \'False\' ' +
                        'INNER JOIN "QUALITY_CONC_HML".DETALHEPRODUTOPEDIDO dpp ON dpp.IDDETALHEPEDIDO = dp.IDDETALHEPEDIDO AND dpp.STCANCELADO = \'False\' ' +
                        'INNER JOIN "QUALITY_CONC_HML".DETALHEPEDIDOGRADE dpg ON dpg.IDDETALHEPEDIDO = dpp.IDDETALHEPEDIDO AND dpg.IDTAMANHO = dpp.IDTAMANHO AND dpg.STATIVO = \'True\' ' +
                        'WHERE rp.STCANCELADO = \'False\' ' +
                        'AND dpp.CODBARRAS = ? ';
	    var listar = api.sqlQuery(querySel, pCodBarras);

        var queryIns = 'INSERT INTO "VAR_DB_NAME"."DISTRIBUICAOCOMPRAS" ("IDDISTRIBUICAOCOMPRAS" ' +
                            ',"IDPEDIDOCOMPRA"       , "IDEMPRESA"   , "IDFILIAL"        , "IDFORNECEDOR"        , "IDFABRICANTE" ' +
                            ',"IDSUBGRUPOESTRUTURA"  , "IDCATEGORIAS", "IDTIPOTECIDO"    , "IDCOR"               , "IDESTILO" ' +
                            ',"IDTAMANHO"            , "CODBARRAS"   , "DSPRODUTO"       , "PRECOVENDA"          , "GRADE" ' +
                            ',"QTDGRADE"             , "QTDVENDALOJA", "QTDVENDATOTAL"   , "QTDSUGESTAO"         , "QTDSUGESTAOALTERACAO" ' +
                            ',"DATACRIACAO"          , "IDUSUARIO"   , "DATAALTERACAO"   , "IDUSUARIOALTERACAO"  , "STCONCLUIDO" ' +
                            ',"STCANCELADO") ' +
	                   'VALUES(QUALITY_CONC_HML.SEQ_DISTRIBUICAOCOMPRAS.NEXTVAL ' +
	                        ',?, ?, ?    , ?, ? ' +
	                        ',?, ?, ?    , ?, ? ' +
	                        ',?, ?, ?    , ?, ? ' +
	                        ',?, ?, ?    , ?, ? ' +
	                        ',?, ?, NOW(), ?, ? ' +
	                        ',?) ';
        var pStmtIns = conn.prepareStatement(api.replaceDbName(queryIns));

		pStmtIns.setInt(1, pIdPedidoCompra);
		pStmtIns.setInt(2, pIdEmpresa);
		pStmtIns.setInt(3, pIdFilial);
		pStmtIns.setString(4, listar[0].IDFORNECEDOR);
		pStmtIns.setInt(5, listar[0].IDFABRICANTE);
		pStmtIns.setInt(6, listar[0].IDSUBGRUPOESTRUTURA);
		pStmtIns.setInt(7, listar[0].IDCATEGORIAS);
		pStmtIns.setInt(8, listar[0].IDTIPOTECIDO);
		pStmtIns.setInt(9, listar[0].IDCOR);
		pStmtIns.setInt(10, listar[0].IDESTILO);
		pStmtIns.setInt(11, listar[0].IDTAMANHO);
		pStmtIns.setString(12, pCodBarras);
		pStmtIns.setString(13, listar[0].DSPRODUTO);
		pStmtIns.setFloat(14, parseFloat(listar[0].VRVENDA));
		pStmtIns.setInt(15, listar[0].INDICETAMANHO);
		pStmtIns.setInt(16, parseInt(listar[0].TOTALPRODUTOGRADE));
		pStmtIns.setInt(17, 0);
		pStmtIns.setInt(18, 0);
		pStmtIns.setInt(19, 0);
		pStmtIns.setInt(20, pQtdSugestaoAlteracao);
		setDateOrNull(pStmtIns, 21, '');
		pStmtIns.setInt(22, 0);
		pStmtIns.setInt(23, pIdUsuarioAlteracao);
		pStmtIns.setString(24, 'False');
		pStmtIns.setString(25, 'False');

        pStmtIns.execute();
    	pStmtIns.close();
    	conn.commit();
        
        return {
    	    "msg": "Inclusão realizada com sucesso!"
    	};
    }
}

function fnHandleGet(byId) {
    let conn = $.db.getConnection();

    let pProcessa = parseInt($.request.parameters.get("processa"));
    let pVerifica = parseInt($.request.parameters.get("verifica"));
    let pIdEmpresa = parseInt($.request.parameters.get("idempresa"));
    let pIdFilial = $.request.parameters.get("idfilial");
    let pIdMarca = parseInt($.request.parameters.get("idmarca"));
    let pIdFornecedor = $.request.parameters.get("idfornecedor");
    let pIdEstruturaMercadologica = parseInt($.request.parameters.get("idsubgrupo"));
    let pIdCategorias = parseInt($.request.parameters.get("idcategoria"));
    let pIdTipoTecido = parseInt($.request.parameters.get("idtipotecido"));
    let pIdCor = parseInt($.request.parameters.get("idcor"));
    let pIdEstilo = parseInt($.request.parameters.get("idestilo"));
    let pDataInicial = $.request.parameters.get("datainicialvenda");
    let pDataFinal = $.request.parameters.get("datafinalvenda");

    if (pProcessa == 1) {
        let stExistDistribuicaoNaoConcluida = api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".DISTRIBUICAOCOMPRAS WHERE STCONCLUIDO = \'False\' AND IDPEDIDOCOMPRA = ?', parseInt(byId));
        
        if ( stExistDistribuicaoNaoConcluida.length > 0 ) {
            let querydel = 'DELETE FROM "VAR_DB_NAME".DISTRIBUICAOCOMPRAS WHERE IDPEDIDOCOMPRA = ?';
            let pStmtdel = conn.prepareStatement(api.replaceDbName(querydel));
            
            pStmtdel.setInt(1, parseInt(byId));
            
            pStmtdel.execute();
            pStmtdel.close();
            
            conn.commit();
        }
        
        let stExistDistribuicao = api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".DISTRIBUICAOCOMPRAS WHERE IDPEDIDOCOMPRA = ?', parseInt(byId));
        
        if ( stExistDistribuicao.length == 0 ) {
            let querySP = `{ CALL "VAR_DB_NAME"."SP_DISTRIBUICAOCOMPRAS"(?,?,?,?,?,?,?,?,?,?,?,?) }`;
            let pStmt = conn.prepareCall(querySP);
            
            pStmt.setInt(1, parseInt(byId));
            pStmt.setInt(2, pIdEmpresa);
            pStmt.setString(3, pIdFilial);
            pStmt.setInt(4, pIdMarca);
            pStmt.setString(5, pIdFornecedor);
            pStmt.setInt(6, pIdEstruturaMercadologica);
            pStmt.setInt(7, pIdCategorias);
            pStmt.setInt(8, pIdTipoTecido);
            pStmt.setInt(9, pIdCor);
            pStmt.setInt(10, pIdEstilo);
            pStmt.setDate(11, pDataInicial);
            pStmt.setDate(12, pDataFinal);
            
            pStmt.execute();
            pStmt.close();
            
            conn.commit();
        }
    }
    
    let query = `
        SELECT
            dc.IDDISTRIBUICAOCOMPRAS, dc.IDPEDIDOCOMPRA, dc.IDEMPRESA, dc.IDFILIAL, dc.IDFORNECEDOR
            ,dc.IDFABRICANTE, dc.IDSUBGRUPOESTRUTURA, dc.IDCATEGORIAS, dc.IDTIPOTECIDO, dc.IDCOR
            ,dc.IDESTILO, dc.IDTAMANHO, dc.CODBARRAS, dc.DSPRODUTO, dc.PRECOVENDA
            ,dc.GRADE, dc.QTDGRADE, dc.QTDVENDALOJA, dc.QTDVENDATOTAL, dc.QTDSUGESTAO
            ,dc.QTDSUGESTAOALTERACAO, dc.DATACRIACAO, dc.IDUSUARIO, dc.DATAALTERACAO, dc.IDUSUARIOALTERACAO
            ,dc.STCONCLUIDO, dc.STCANCELADO
        FROM 
            "VAR_DB_NAME".DISTRIBUICAOCOMPRAS dc
        WHERE
            dc.IDPEDIDOCOMPRA = ?
            AND dc.STCANCELADO = 'False'
    `;
    
    if(pVerifica){
        query += `
            AND dc.STCONCLUIDO = 'False'
            AND dc.QTDSUGESTAOALTERACAO > 0
        `;
    }

    var request = { 
            page:  $.request.parameters.get("page"),
            pageSize:  $.request.parameters.get("pageSize")
        };

    api.responseWithQuery(query, request, byId);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;

        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
        break;

        //Handle your POST calls here
        /*case $.net.http.POST:
            var doc = fnHandlePost();
            $.response.setBody(JSON.stringify(doc));
        break;*/

        default:
            break;
    }
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}