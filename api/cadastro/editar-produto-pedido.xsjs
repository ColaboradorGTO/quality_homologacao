var api = $.import("quality.concentrador_homologacao.api", "apiResponse");
var libEditProduto = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.libs.alteracao-pedido.itens", "alterar-dados-produto-pedido");
var libEditProdutoPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.libs.alteracao-pedido.itens", "alterar-dados-item-pedido");

let conn;

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

function getIdDetalheProdutoPedidoSecundario(idDetProdPedido){
    let query = `
        SELECT
            TBDPP.IDDETALHEPRODUTOPEDIDO
        FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO AND TBD.STCANCELADO = 'False'
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO AND TBR.STCANCELADO = 'False'
        WHERE
            TBDPP.STCANCELADO = 'False'
            AND TBDPP.IDDETALHEPRODUTOPEDIDOPRIMARIO = ?
    `;
    
    let regDetalhe = api.sqlQuery(query,idDetProdPedido);
    
    if(regDetalhe.length > 0){
        return Number(regDetalhe[0].IDDETALHEPRODUTOPEDIDO || 0);
    }
    
    return 0;
}

function getDadosDetalheProdutoPedido(idDetalheProdutoPedido){
    let queryProdutos =  `
        SELECT
            TBR.IDGRUPOEMPRESARIAL AS IDGRUPOEMPRESARIAL,
            TBDPP.NUNCM AS NUNCM,
            '' AS NUCEST,
            '' AS NUCST_ICMS,
            '' AS NUCFOP,
            '' AS PERC_OUT,
            TBDPP.CODBARRAS AS NUCODBARRAS,
            TBDPP.DSPRODUTO AS DSNOME,
            TBDPP.DSPRODUTO AS DSNOME,
            1 AS STGRADE,
            TBDPP.UND AS UND,
            TBDPP.VRCUSTO AS PRECOCUSTO,
            TBDPP.VRVENDA AS PRECOVENDA,
            0 AS QTDENTRADA,
            0 AS QTDCOMERCIALIZADA,
            0 AS QTDPERDA,
            0 AS QTDDISPONIVEL,
            0.0 AS PERCICMS,
            0.0 AS PERCISS,
            0.0 AS PERCPIS,
            0.0 AS PERCCOFINS,
            '' AS COD_CSOSN,
            0.0 AS PERCCSOSC,
            '' AS NUCST_IPI,
            '' AS NUCST_PIS,
            '' AS NUCST_COFINS,
            0.0 AS PERCIPI,
            TBDPP.DTULTATUALIZACAO AS DTULTALTERACAO,
            0 AS STPESAVEL,
            1 AS GRP_MATERIAIS,
            TBDPP.IDSUBGRUPOESTRUTURA AS IDSUBGRUPO,
            TBDPP.IDFABRICANTE AS IDFABRICANTE,
            TBR.IDFORNECEDOR AS IDFORNECEDOR,
            TBDPP.NUREF AS NUREFERENCIA,
            'True' AS STATIVO,
            TBDPP.IDCOR AS IDCOR,
            TBDPP.IDTAMANHO AS IDTAMANHO,
            TBDPP.IDCATEGORIAPEDIDO AS IDCATEGORIAPEDIDO,
            TBDPP.IDTIPOTECIDO AS IDTIPOTECIDO,
            TBDPP.IDESTILO AS IDESTILO,
            TBDPP.IDLOCALEXPOSICAO AS IDLOCALEXPOSICAO,
            TBDPP.IDCATEGORIAS AS IDCATEGORIAS,
            TBDPP.IDDETALHEPRODUTOPEDIDO AS IDDETALHEPRODUTOPEDIDO,
            TBDPP.STCADASTRADO AS STCADASTRADO,
            TBDPP.STREPOSICAO AS STREPOSICAO,
            TBDPP.STECOMMERCE,
            TBDPP.IDPRODCADASTRO,
            TBDPP.IDTIPOPRODUTOFISCAL,
            TBDPP.IDFONTEPRODUTOFISAL
        FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE
            TBDPP.STCANCELADO = 'False'
            AND TBDPP.IDPRODCADASTRO IS NOT NULL
            AND TBDPP.IDPRODCADASTRO <> 'NULL'
            AND TBDPP.IDDETALHEPRODUTOPEDIDO = ?
    `;

	return api.sqlQuery(queryProdutos, idDetalheProdutoPedido);
}

function fnAtualizarTabelaProduto(idDetalheProdutoPedido){
    let dadosProdutoAtualizado = getDadosDetalheProdutoPedido(idDetalheProdutoPedido);
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."PRODUTO" 
        SET
            "NUNCM" = ?,
            "DSNOME" = ?,
            "UND" = ?,
            "PRECOCUSTO" = ?,
            "NUREFERENCIA" = ?,
            "STATIVO" = ?,
            "IDCOR" = ?,
            "IDTAMANHO" = ?,
            "IDTIPOTECIDO" = ?,
            "IDLOCALEXPOSICAO" = ?,
            "IDCATEGORIAS" = ?,
            "STECOMMERCE" = ?,
            "IDCATEGORIAPEDIDO" = ?,
            "IDTIPOPRODUTOFISCAL" = ?,
            "IDFONTEPRODUTOFISCAL" = ?,
            "DTULTALTERACAO" = CURRENT_TIMESTAMP
        WHERE 
            "IDPRODUTO" =  ?
    `;
  		
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for (let i = 0; i < dadosProdutoAtualizado.length; i++) {
        let dados = dadosProdutoAtualizado[i];
        
        pStmt.setInt(1, parseInt(dados.NUNCM));
        pStmt.setString(2, dados.DSNOME);
        pStmt.setString(3, dados.UND);
        pStmt.setFloat(4, parseFloat(dados.PRECOCUSTO));
        pStmt.setString(5, dados.NUREFERENCIA);
        pStmt.setString(6, dados.STATIVO);
        pStmt.setInt(7, parseInt(dados.IDCOR) || 0);
        pStmt.setInt(8, parseInt(dados.IDTAMANHO));
        pStmt.setInt(9, parseInt(dados.IDTIPOTECIDO)||0);
        pStmt.setInt(10, parseInt(dados.IDLOCALEXPOSICAO) || 0);
        pStmt.setInt(11, parseInt(dados.IDCATEGORIAS) || 0);
        pStmt.setString(12, (dados.STECOMMERCE || 'False'));
        pStmt.setInt(13, parseInt(dados.IDCATEGORIAPEDIDO) || 0);
        pStmt.setInt(14, parseInt(dados.IDTIPOPRODUTOFISCAL));
        pStmt.setInt(15, parseInt(dados.IDFONTEPRODUTOFISAL));
        pStmt.setInt(16, parseInt(dados.IDPRODCADASTRO));
        
        pStmt.execute();
    }
    
    pStmt.close();
    
    conn.commit();
}

function fnAtualizarTabelaProduto_RN(idDetalheProdutoPedido){
    let dadosProdutoAtualizado = getDadosDetalheProdutoPedido(idDetalheProdutoPedido);
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."PRODUTO_RN" 
        SET
            "NUNCM" = ?,
            "DSNOME" = ?,
            "UND" = ?,
            "PRECOCUSTO" = ?,
            "NUREFERENCIA" = ?,
            "STATIVO" = ?,
            "IDCOR" = ?,
            "IDTAMANHO" = ?,
            "IDTIPOTECIDO" = ?,
            "IDLOCALEXPOSICAO" = ?,
            "IDCATEGORIAS" = ?,
            "STECOMMERCE" = ?,
            "IDCATEGORIAPEDIDO" = ?,
            "IDTIPOPRODUTOFISCAL" = ?,
            "IDFONTEPRODUTOFISCAL" = ?,
            "DTULTALTERACAO" = CURRENT_TIMESTAMP
        WHERE 
            "IDPRODUTO" =  ?
    `;
  		
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for (let i = 0; i < dadosProdutoAtualizado.length; i++) {
        let dados = dadosProdutoAtualizado[i];
        
        pStmt.setInt(1, parseInt(dados.NUNCM));
        pStmt.setString(2, dados.DSNOME);
        pStmt.setString(3, dados.UND);
        pStmt.setFloat(4, parseFloat(dados.PRECOCUSTO));
        pStmt.setString(5, dados.NUREFERENCIA);
        pStmt.setString(6, dados.STATIVO);
        pStmt.setInt(7, parseInt(dados.IDCOR) || 0);
        pStmt.setInt(8, parseInt(dados.IDTAMANHO));
        pStmt.setInt(9, parseInt(dados.IDTIPOTECIDO)||0);
        pStmt.setInt(10, parseInt(dados.IDLOCALEXPOSICAO) || 0);
        pStmt.setInt(11, parseInt(dados.IDCATEGORIAS) || 0);
        pStmt.setString(12, (dados.STECOMMERCE || 'False'));
        pStmt.setInt(13, parseInt(dados.IDCATEGORIAPEDIDO) || 0);
        pStmt.setInt(14, parseInt(dados.IDTIPOPRODUTOFISCAL));
        pStmt.setInt(15, parseInt(dados.IDFONTEPRODUTOFISAL));
        pStmt.setString(16, dados.IDPRODCADASTRO);
        
        pStmt.execute();
    }
    
    pStmt.close();
    
    conn.commit();
}

function fnAtualizarProdSAP(idDetProdPedido){
    let queryProdutos =  `
        SELECT
            TBR.IDGRUPOEMPRESARIAL AS IDGRUPOEMPRESARIAL,
            TBDPP.NUNCM AS NUNCM,
            '' AS NUCEST,
            '' AS NUCST_ICMS,
            '' AS NUCFOP,
            '' AS PERC_OUT,
            TBDPP.CODBARRAS AS NUCODBARRAS,
            TBDPP.DSPRODUTO AS DSNOME,
            TBDPP.DSPRODUTO AS DSNOME,
            1 AS STGRADE,
            TBDPP.UND AS UND,
            TBDPP.VRCUSTO AS PRECOCUSTO,
            TBDPP.VRVENDA AS PRECOVENDA,
            0 AS QTDENTRADA,
            0 AS QTDCOMERCIALIZADA,
            0 AS QTDPERDA,
            0 AS QTDDISPONIVEL,
            0.0 AS PERCICMS,
            0.0 AS PERCISS,
            0.0 AS PERCPIS,
            0.0 AS PERCCOFINS,
            '' AS COD_CSOSN,
            0.0 AS PERCCSOSC,
            '' AS NUCST_IPI,
            '' AS NUCST_PIS,
            '' AS NUCST_COFINS,
            0.0 AS PERCIPI,
            TBDPP.DTULTATUALIZACAO AS DTULTALTERACAO,
            0 AS STPESAVEL,
            1 AS GRP_MATERIAIS,
            TBDPP.IDSUBGRUPOESTRUTURA AS IDSUBGRUPO,
            TBDPP.IDFABRICANTE AS IDFABRICANTE,
            TBR.IDFORNECEDOR AS IDFORNECEDOR,
            TBDPP.NUREF AS NUREFERENCIA,
            'True' AS STATIVO,
            TBDPP.IDCOR AS IDCOR,
            TBDPP.IDTAMANHO AS IDTAMANHO,
            TBDPP.IDCATEGORIAPEDIDO AS IDCATEGORIAPEDIDO,
            TBDPP.IDTIPOTECIDO AS IDTIPOTECIDO,
            TBDPP.IDESTILO AS IDESTILO,
            TBDPP.IDLOCALEXPOSICAO AS IDLOCALEXPOSICAO,
            TBDPP.IDCATEGORIAS AS IDCATEGORIAS,
            TBDPP.IDDETALHEPRODUTOPEDIDO AS IDDETALHEPRODUTOPEDIDO,
            TBDPP.STCADASTRADO AS STCADASTRADO,
            TBDPP.STREPOSICAO AS STREPOSICAO,
            TBDPP.STECOMMERCE,
            TBDPP.IDPRODCADASTRO
        FROM
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE
            TBDPP.STCANCELADO = 'False'
            AND TBDPP.IDPRODCADASTRO IS NOT NULL
            AND TBDPP.IDPRODCADASTRO <> 'NULL'
            AND TBDPP.IDDETALHEPRODUTOPEDIDO = ?
    `;

	let lstDeProdutos = api.sqlQuery(queryProdutos, idDetProdPedido);
	
	if(lstDeProdutos.length > 0){
        if(stPedidoPrimario){
            fnAtualizarTabelaProduto_RN(lstDeProdutos, conn);
        } else {
            fnAtualizarTabelaProduto(lstDeProdutos, conn);
        }
        
        var retIntegracaoEditProdutoPedido = libEditProdutoPedido.executeProduto(idDetProdPedido); 
	}
}

function fnAtualizarDetalheProdutoPedido(idDetalheProdutoPedido, registro) {
    let steditcomp = 'True';
    
    let query = `
        UPDATE
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        SET
            TBDPP."IDCOR" = ?,
            TBDPP."IDTAMANHO" = ?,
            TBDPP."DSTAMANHO" = ?,
            TBDPP."IDTIPOTECIDO" = ?,
            TBDPP."IDLOCALEXPOSICAO" = ?,
            TBDPP."IDCATEGORIAS" = ?,
            TBDPP."NUNCM" = ?,
            TBDPP."IDTIPOPRODUTOFISCAL" = ?,
            TBDPP."IDFONTEPRODUTOFISAL" = ?,
            TBDPP."NUREF" = ?,
            TBDPP."DSPRODUTO" = ?,
            TBDPP."UND" = ?,
            TBDPP."QTDPRODUTO" = ?,
            TBDPP."VRCUSTO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBDPP."VRTOTALCUSTO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBDPP."DTULTATUALIZACAO" = CURRENT_TIMESTAMP,
            TBDPP."STECOMMERCE" = ?,
            TBDPP."STREDESOCIAL" = ?,
            TBDPP."STEDITADOCOMPRAS" = ?,
            TBDPP."IDCATEGORIAPEDIDO" = ?,
            TBDPP."STCADASTRADO" = (
                CASE 
                    WHEN IFNULL(TBP.IDPRODUTO, TBP_RN.IDPRODUTO) IS NOT NULL THEN 'True'
                    ELSE 'False'
                END
            )
        FROM 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON 
            TBDPP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        LEFT JOIN "VAR_DB_NAME"."PRODUTO" TBP ON 
            TBDPP.IDPRODCADASTRO = TBP.IDPRODUTO
        LEFT JOIN "VAR_DB_NAME"."PRODUTO_RN" TBP_RN ON 
            TBDPP.IDPRODCADASTRO = TBP_RN.IDPRODUTO
        WHERE 
            TBDPP."IDDETALHEPRODUTOPEDIDO" =  ?
    `;
  
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, registro.IDCOR);
    pStmt.setInt(2, registro.IDTAMANHO);
    pStmt.setString(3, registro.DSTAMANHO);
    pStmt.setInt(4, registro.IDTIPOTECIDO);
    pStmt.setInt(5, registro.IDLOCALEXPOSICAO);
    pStmt.setInt(6, registro.IDCATEGORIAS);
    pStmt.setString(7, registro.NUNCM);
    pStmt.setInt(8, registro.IDTIPOPRODUTOFISCAL);
    pStmt.setInt(9, registro.IDFONTEPRODUTOFISAL);
    pStmt.setString(10, registro.NUREF);
    pStmt.setString(11, registro.DSPRODUTO);
    pStmt.setString(12, registro.UND);
    pStmt.setFloat(13, registro.QTDPRODUTO);
    pStmt.setFloat(14, registro.VRCUSTO);
    pStmt.setFloat(15, registro.VRTOTALCUSTO);
    pStmt.setString(16, registro.STECOMMERCE);
    pStmt.setString(17, registro.STREDESOCIAL);
    pStmt.setString(18, steditcomp);
    pStmt.setInt(19, registro.IDCATEGORIAPEDIDO);
    pStmt.setInt(20, idDetalheProdutoPedido);
    
    pStmt.execute();
	pStmt.close();
	
    conn.commit();
}

function fnAtualizarDadosProdutoPedido(idDetalheProdutoPedido, registro, stPedidoPrimario = false) {
    fnAtualizarDetalheProdutoPedido(idDetalheProdutoPedido, registro);
    
    stPedidoPrimario ? fnAtualizarTabelaProduto_RN(idDetalheProdutoPedido) : fnAtualizarTabelaProduto(idDetalheProdutoPedido);
}

function fnHandleGet(byId) {
    let idDetPedidoProd = $.request.parameters.get("idDetPedidoProd");

    let query =  `
        SELECT 
            DTP.IDRESUMOPEDIDO, 
            tbdp.IDDETALHEPRODUTOPEDIDO, 
            tbdp.IDDETALHEPEDIDO, 
            SE.IDGRUPOESTRUTURA, 
            tbdp.IDSUBGRUPOESTRUTURA, 
            SE.DSSUBGRUPOESTRUTURA, 
            tbdp.IDCOR, 
            TRIM(CR.DSCOR) AS DSCOR, 
            tbdp.IDTAMANHO, 
            tbdp.DSTAMANHO, 
            tbdp.IDCATEGORIAPEDIDO, 
            CP.TIPOPEDIDO, 
            tbdp.IDTIPOTECIDO, 
            TBT.DSTIPOTECIDO, 
            tbdp.IDESTILO, 
            ES.DSESTILO, 
            tbdp.IDFABRICANTE, 
            FB.DSFABRICANTE, 
            tbdp.IDLOCALEXPOSICAO, 
            LE.DSLOCALEXPOSICAO, 
            CS.IDCATEGORIAS, 
            CS.DSCATEGORIAS, 
            CS.TPCATEGORIAS, 
            tbdp.IDNCM, 
            tbdp.NUNCM, 
            tbdp.IDCEST, 
            tbdp.NUCEST, 
            tbdp.IDTIPOPRODUTOFISCAL, 
            TF.CODTIPOFISCALPRODUTO, 
            TF.DSTIPOFISCALPRODUTO, 
            tbdp.IDFONTEPRODUTOFISAL, 
            TPF.CODTIPOPRODUTO, 
            TPF.DSTIPOPRODUTO, 
            tbdp.IDPRODCADASTRO, 
            tbdp.NUREF, 
            tbdp.CODBARRAS, 
            tbdp.DSPRODUTO, 
            tbdp.QTDPRODUTO, 
            UN.IDUNIDADEMEDIDA, 
            TRIM(tbdp.UND) AS UND, 
            tbdp.VRCUSTO, 
            tbdp.VRVENDA, 
            tbdp.VRTOTALCUSTO, 
            tbdp.VRTOTALVENDA, 
            TO_VARCHAR( tbdp.DTCADASTRO, 'DD-MM-YYYY') AS DTCADASTROFORMAT, 
            tbdp.DTCADASTRO, 
            tbdp.DTULTATUALIZACAO, 
            tbdp.STCADASTRADO, 
            tbdp.STRECEBIDO, 
            tbdp.OBSREF, 
            tbdp.IDDETALHEENTRADA, 
            tbdp.NUNF, 
            tbdp.QTDENTRADANF, 
            tbdp.DTENTRADANF, 
            tbdp.STECOMMERCE, 
            tbdp.STREDESOCIAL, 
            tbdp.STATIVO, 
            tbdp.STCANCELADO, 
            tbdp.STMIGRADOSAP, 
            tbdp.STAVULSO, 
            tbdp.IDGRUPOEMPRESARIAL,
            GE.DSGRUPOEMPRESARIAL,
            tbdp.IDFORNECEDOR, 
            FN.NORAZAOSOCIAL, 
            FN.NOFANTASIA,
            FN.NUCNPJ 
        FROM 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO tbdp 
        LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO DTP ON 
            tbdp.IDDETALHEPEDIDO = DTP.IDDETALHEPEDIDO  
        LEFT JOIN "VAR_DB_NAME".COR CR ON 
            tbdp.IDCOR = CR.IDCOR  
        LEFT JOIN "VAR_DB_NAME".TIPOTECIDOS TBT ON 
            tbdp.IDTIPOTECIDO = TBT.IDTPTECIDO  
        LEFT JOIN "VAR_DB_NAME".CATEGORIAS CS ON 
            tbdp.IDCATEGORIAS = CS.IDCATEGORIAS  
        LEFT JOIN "VAR_DB_NAME".CATEGORIAPEDIDO CP ON 
            tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  
        LEFT JOIN "VAR_DB_NAME".UNIDADEMEDIDA UN ON 
            tbdp.UND = UN.DSSIGLA  
        LEFT JOIN "VAR_DB_NAME".ESTILOS ES ON 
            tbdp.IDESTILO = ES.IDESTILO  
        LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO LE ON 
            tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  
        LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA SE ON 
            tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  
        LEFT JOIN "VAR_DB_NAME".FABRICANTE FB ON 
            tbdp.IDFABRICANTE = FB.IDFABRICANTE  
        LEFT JOIN "VAR_DB_NAME".VINCFABRICANTEFORN VFN ON 
            FB.IDFABRICANTE = VFN.IDFABRICANTE  
        LEFT JOIN "VAR_DB_NAME".FORNECEDOR FN ON 
            VFN.IDFORNECEDOR = FN.IDFORNECEDOR  
        LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL GE ON 
            tbdp.IDGRUPOEMPRESARIAL = GE.IDGRUPOEMPRESARIAL  
        LEFT JOIN "VAR_DB_NAME".TIPOFISCALPRODUTO TF ON 
            tbdp.IDTIPOPRODUTOFISCAL = TF.IDTIPOFISCALPRODUTO  
        LEFT JOIN "VAR_DB_NAME".TIPOPRODUTO TPF ON 
            tbdp.IDFONTEPRODUTOFISAL = TPF.IDTIPOPRODUTO  
        WHERE
            1 = ? 
    `;
    
    if ( byId ) {
        query += ` AND tbdp.IDDETALHEPRODUTOPEDIDO = '${byId}' `;
    }
    if ( idDetPedidoProd ) {
        query += ` AND tbdp.IDDETALHEPRODUTOPEDIDO = '${idDetPedidoProd}' `;
    }
    
    query += ' ORDER BY tbdp.DTCADASTRO DESC';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString()); 
    
    conn = $.db.getConnection();

    for (let registro of bodyJson) {
		let idDetalheProdutoPedido = Number(registro.IDDETALHEPRODUTOPEDIDO);
		let idDetalhePedidoSecundario = getIdDetalheProdutoPedidoSecundario(registro.IDDETALHEPRODUTOPEDIDO);
        
        if(idDetalhePedidoSecundario > 0){
            fnAtualizarDadosProdutoPedido(idDetalheProdutoPedido, registro, true);
            
            fnAtualizarDadosProdutoPedido(idDetalhePedidoSecundario, registro);
        } else {
            fnAtualizarDadosProdutoPedido(idDetalheProdutoPedido, registro);
        }
        
        conn.commit();
        
        //libEditProdutoPedido.executeProduto(idDetalheProdutoPedido);
    }
	
    return {
        "msg": "Edição realizado com sucesso!"
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
    
} catch (e) {
    let detalheError = e.stack.split('\n');
    
    detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message,
        detalheError
    }));
    $.response.status = 400;
}   