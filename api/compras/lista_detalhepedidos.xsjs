let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function getValorTaxaAcrescimo(idResumoPedido){
    let query = `
        SELECT
            ( CASE WHEN IFNULL("FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE "FATOR_ACRESCIMO_COMPRA" END ) AS FATOR_ACRESCIMO_COMPRA 
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO 
        WHERE
            IDRESUMOPEDIDO = ?
    `;
    
    let regTaxa = api.sqlQuery(query, idResumoPedido);
    
    return regTaxa.length > 0 ? Number(regTaxa[0].FATOR_ACRESCIMO_COMPRA) : 1;
}

function fnHandleGet(byId) {
    let idPedido = $.request.parameters.get("idpedido");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let sttransformado = $.request.parameters.get("sttransformado");
    let streposicao = $.request.parameters.get("streposicao");

    let query =  `
        SELECT
            TBRP.IDGRUPOEMPRESARIAL,
            TBRP.IDSUBGRUPOEMPRESARIAL,
            TBRP.IDANDAMENTO,
            TBA.DSSETOR,
            TBDP.IDDETALHEPEDIDO AS IDDETPEDIDO,
            TBDP.IDRESUMOPEDIDO AS IDPEDIDO,
            TBDP.IDCOR,
            TBDP.IDTIPOTECIDO,
            TBSE.IDGRUPOESTRUTURA,
            TBDP.IDSUBGRUPOESTRUTURA,
            TBSE.DSSUBGRUPOESTRUTURA,
            TBDP.IDCATEGORIAPEDIDO,
            TBCP.DSCATEGORIAPEDIDO,
            TBCP.TIPOPEDIDO,
            TBCOR.DSCOR,
            TBF.IDFORNECEDOR,
            TBF.NORAZAOSOCIAL,
            TBF.IDFORNECEDORSAP,
            TBF.STMIGRADOSAP AS STMIGRADOSAPFORNECEDOR,
            TBFB.IDFABRICANTE,
            TBFB.DSFABRICANTE,
            TBFB.IDSAP AS IDFABRICANTESAP,
            TBFB.STMIGRADOSAP AS STMIGRADOSAPFABRICANTE,
            TBT.DSTIPOTECIDO,
            TBL.IDLOCALEXPOSICAO,
            TBL.DSLOCALEXPOSICAO,
            TBS.IDESTILO,
            TBS.DSESTILO,
            TBDP.NUREF,
            TBDP.DSPRODUTO,
            TBDP.QTDTOTAL,
            TBDP.NUCAIXA,
            TBU.DSSIGLA,
            TBU.IDUNIDADEMEDIDA,
            (TBDP.VRUNITBRUTO) AS VRUNITBRUTODETALHEPEDIDO,
            IFNULL( TBDP.DESC01, 0) AS DESC01,
            IFNULL( TBDP.DESC02, 0) AS DESC02,
            IFNULL( TBDP.DESC03, 0) AS DESC03,
            (TBDP.VRUNITLIQUIDO) AS VRUNITLIQDETALHEPEDIDO,
            (TBDP.VRVENDA) AS VRVENDADETALHEPEDIDO,
            (TBDP.VRTOTAL) AS VRTOTALDETALHEPEDIDO,
            TBDP.STRECEBIDO,
            TBDP.STECOMMERCE,
            TBDP.STREDESOCIAL,
            TBDP.STCANCELADO,
            IFNULL(TBDP_SECUNDARIO.STTRANSFORMADO, TBDP.STTRANSFORMADO) AS STTRANSFORMADO,
            TBDP.STREPOSICAO,
            IFNULL( TBDP.NUCODBARRAS, '0') AS NUCODBARRAS,
            IFNULL( TBDP.VRCUSTOPRODATUAL, 0) AS VRCUSTOPRODATUAL,
            IFNULL( TBDP.VRVENDAPRODATUAL, 0) AS VRVENDAPRODATUAL,
            TBDP.OBSPRODUTO,
            TBDP.IDCATEGORIAS AS CATEGORIAPROD,
            TBC.DSCATEGORIAS AS DSCATEGORIAPROD,
            TBC.TPCATEGORIAS AS TPCATEGORIAPROD,
            TBC.TPCATEGORIAPEDIDO AS TPCATEGORIAPRODPEDIDO,
            TO_VARCHAR( TBRP.DTPEDIDO, 'DD-MM-YYYY HH24:MI:SS') AS DTPEDIDO,
            TBP.NUNCM,
            TBP.IDTIPOPRODUTOFISCAL,
            TBP.IDFONTEPRODUTOFISCAL,
            TBDP.NUCODBARRAS,
            TBDP.IDPRODUTO,
            TBDP.IDDETALHEPEDIDOPRIMARIO 
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO TBDP
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBRP ON
            TBDP.IDRESUMOPEDIDO = TBRP.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".ANDAMENTOS TBA ON
            TBRP.IDANDAMENTO = TBA.IDANDAMENTO
        INNER JOIN "VAR_DB_NAME".COR TBCOR ON
            TBDP.IDCOR = TBCOR.IDCOR
        INNER JOIN "VAR_DB_NAME".TIPOTECIDOS TBT ON
            TBDP.IDTIPOTECIDO = TBT.IDTPTECIDO
        INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO TBCP ON
            TBDP.IDCATEGORIAPEDIDO = TBCP.IDCATEGORIAPEDIDO
        INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBU ON
            TBDP.UND = TBU.IDUNIDADEMEDIDA
        INNER JOIN "VAR_DB_NAME".ESTILOS TBS ON
            TBDP.IDESTILO = TBS.IDESTILO
        INNER JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBL ON
            TBDP.IDLOCALEXPOSICAO = TBL.IDLOCALEXPOSICAO
        INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
            TBDP.IDSUBGRUPOESTRUTURA = TBSE.IDSUBGRUPOESTRUTURA
        INNER JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBG ON
            TBSE.IDGRUPOESTRUTURA = TBG.IDGRUPOESTRUTURA
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBF ON
            TBRP.IDFORNECEDOR = TBF.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME".FABRICANTE TBFB ON
            TBDP.IDFABRICANTE = TBFB.IDFABRICANTE
        INNER JOIN "VAR_DB_NAME".CATEGORIAS TBC ON
            TBDP.IDCATEGORIAS = TBC.IDCATEGORIAS
        LEFT JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBP.NUCODBARRAS = TBDP.NUCODBARRAS
        LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO TBDP_SECUNDARIO ON
            TBDP.IDDETALHEPEDIDO = TBDP_SECUNDARIO.IDDETALHEPEDIDOPRIMARIO
        WHERE
            1 = ?
            AND TBRP.STCANCELADO = 'False'
            AND TBDP.STCANCELADO = 'False'
    `;
    
    if ( byId ) {
        query += ` AND  TBDP.IDDETALHEPEDIDO = '${byId}' `;
    }
    if ( idPedido ) {
        query += ` AND  TBDP.IDRESUMOPEDIDO = '${idPedido}' `;
    }
    if ( sttransformado ) {
        query += ` AND TBDP.STTRANSFORMADO = '${sttransformado}' `;
    }
    if ( streposicao ) {
        query += ` AND TBDP.STREPOSICAO = '${streposicao}' `;
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
        query += `  AND (TO_DATE(TBRP.DTPEDIDO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }
    
    query += ' ORDER BY tbdp.NUREF, tbdp.DSPRODUTO ';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnUpdatProdPedido(conn, idDetalhePedido) {
    let queryProdutosPed =  `
        SELECT
            TBDP.IDDETALHEPRODUTOPEDIDO,
            TBD.IDDETALHEPEDIDO AS ID,
            TRIM(TBD.NUREF) AS NUREFPROD,
            TBD.IDTIPOTECIDO,
            TBD.IDCOR,
            TBD.IDCATEGORIAPEDIDO,
            TBD.IDLOCALEXPOSICAO,
            TBD.IDESTILO,
            TBD.IDFABRICANTE,
            TBD.IDCATEGORIAS,
            TBF.IDFORNECEDOR,
            TBT.IDTAMANHO AS IDTAMANHO,
            TBU.DSSIGLA AS UN,
            TBD.VRUNITLIQUIDO AS VRUNIT,
            TBD.VRVENDA AS VRVENDA,
            IFNULL(TBD.STREPOSICAO, 'False') AS STREPOSICAO,
            IFNULL(TBD.STECOMMERCE, 'False') AS STECOMMERCE,
            IFNULL(TBD.STREDESOCIAL, 'False') AS STREDESOCIAL,
            TBDG.QTD AS QTDPRODUTO,
            (TBDG.QTD * TBD.VRUNITLIQUIDO) AS TOTALCUSTO,
            (TBDG.QTD * TBD.VRVENDA) AS TOTALVENDA,
            IFNULL(TBR.DTMOVPEDIDO, now()) AS DTMOVPEDIDO
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO TBD
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON 
            TBD.IDDETALHEPEDIDO = TBDP.IDDETALHEPEDIDO
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBF ON
            TBR.IDFORNECEDOR = TBF.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBU ON
            TBD.UND = TBU.IDUNIDADEMEDIDA
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG ON
            TBD.IDDETALHEPEDIDO = TBDG.IDDETALHEPEDIDO AND TBDG.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".TAMANHO TBT ON
            TBDG.IDTAMANHO = TBT.IDTAMANHO
        WHERE
            TBD.STCANCELADO = 'False'
            AND TBD.IDDETALHEPEDIDO = ?
    `;
    
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO"
        SET
            "IDCOR" = ?,
            "IDCATEGORIAPEDIDO" = ?,
            "IDTIPOTECIDO" = ?,
            "IDESTILO" = ?,
            "IDFABRICANTE" = ?,
            "IDLOCALEXPOSICAO" = ?,
            "IDCATEGORIAS" = ?,
            "NUREF" = ?,
            "QTDPRODUTO" = ?,
            "UND" = ?,
            "VRCUSTO" = ?,
            "VRVENDA" = ?,
            "VRTOTALCUSTO" = ?,
            "VRTOTALVENDA" = ?,
            "DTULTATUALIZACAO" = ?,
            "STECOMMERCE" = ?,
            "STREDESOCIAL" = ?,
            "IDFORNECEDOR" = ?,
            --"STREPOSICAO" = ?,
            "STEDITADOCOMPRAS" = 'True',
            "STMIGRADOSAP" = 'False'
        WHERE
            "IDDETALHEPRODUTOPEDIDO" = ?
    `;

    let lstDeProdutosPed = api.sqlQuery(queryProdutosPed, idDetalhePedido);
    
    let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    if(lstDeProdutosPed.length > 0){
        for (let i = 0; i < lstDeProdutosPed.length; i++) {
            let registroProd = lstDeProdutosPed[i];
            
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
            //pStmt.setString(19, registroProd.STREPOSICAO);
            pStmt.setInt(19, parseInt(registroProd.IDDETALHEPRODUTOPEDIDO));
            
            pStmt.execute();
        }
    }
    
    pStmt.close();
}

function fnUpdatProdPedidoSecundario(conn, idDetalhePedido) {
    let queryProdutosPed =  `
        SELECT
            TBDP.IDDETALHEPRODUTOPEDIDO,
            TBD.IDDETALHEPEDIDO AS ID,
            TRIM(TBD.NUREF) AS NUREFPROD,
            TBD.IDTIPOTECIDO,
            TBD.IDCOR,
            TBD.IDCATEGORIAPEDIDO,
            TBD.IDLOCALEXPOSICAO,
            TBD.IDESTILO,
            TBD.IDFABRICANTE,
            TBD.IDCATEGORIAS,
            TBF.IDFORNECEDOR,
            TBT.IDTAMANHO AS IDTAMANHO,
            TBU.DSSIGLA AS UN,
            TBD.VRUNITLIQUIDO AS VRUNIT,
            TBD.VRVENDA AS VRVENDA,
            IFNULL(TBD.STREPOSICAO, 'False') AS STREPOSICAO,
            IFNULL(TBD.STECOMMERCE, 'False') AS STECOMMERCE,
            IFNULL(TBD.STREDESOCIAL, 'False') AS STREDESOCIAL,
            TBDG.QTD AS QTDPRODUTO,
            (TBDG.QTD * TBD.VRUNITLIQUIDO) AS TOTALCUSTO,
            (TBDG.QTD * TBD.VRVENDA) AS TOTALVENDA,
            IFNULL(TBR.DTMOVPEDIDO, now()) AS DTMOVPEDIDO
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO TBD
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON 
            TBD.IDDETALHEPEDIDO = TBDP.IDDETALHEPEDIDO
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBF ON
            TBR.IDFORNECEDOR = TBF.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBU ON
            TBD.UND = TBU.IDUNIDADEMEDIDA
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG ON
            TBD.IDDETALHEPEDIDO = TBDG.IDDETALHEPEDIDO AND TBDG.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".TAMANHO TBT ON
            TBDG.IDTAMANHO = TBT.IDTAMANHO
        WHERE
            TBD.STCANCELADO = 'False'
            AND TBD.IDDETALHEPEDIDOPRIMARIO = ?
    `;
    
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO"
        SET
            "IDCOR" = ?,
            "IDCATEGORIAPEDIDO" = ?,
            "IDTIPOTECIDO" = ?,
            "IDESTILO" = ?,
            "IDFABRICANTE" = ?,
            "IDLOCALEXPOSICAO" = ?,
            "IDCATEGORIAS" = ?,
            "NUREF" = ?,
            "QTDPRODUTO" = ?,
            "UND" = ?,
            "VRCUSTO" = ?,
            "VRVENDA" = ?,
            "VRTOTALCUSTO" = ?,
            "VRTOTALVENDA" = ?,
            "DTULTATUALIZACAO" = ?,
            "STECOMMERCE" = ?,
            "STREDESOCIAL" = ?,
            "IDFORNECEDOR" = ?,
            --"STREPOSICAO" = ?,
            "STEDITADOCOMPRAS" = 'True',
            "STMIGRADOSAP" = 'False'
        WHERE
            "IDDETALHEPRODUTOPEDIDO" = ?
    `;

    let lstDeProdutosPed = api.sqlQuery(queryProdutosPed, idDetalhePedido);
    
    let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    if(lstDeProdutosPed.length > 0){
        for (let i = 0; i < lstDeProdutosPed.length; i++) {
            let registroProd = lstDeProdutosPed[i];
            
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
            //pStmt.setString(19, registroProd.STREPOSICAO);
            pStmt.setInt(19, parseInt(registroProd.IDDETALHEPRODUTOPEDIDO));
            
            pStmt.execute();
        }
    }
    
    pStmt.close();
}

function fnUpdateDetalhesPedidoGradeParaFalse(conn, idDetalhePedido) {
    let queryUpdate = ` 
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE 
        SET 
            STATIVO = 'False' 
        WHERE
            IDDETALHEPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    pStmt.setInt(1, parseInt(idDetalhePedido));
    
    pStmt.execute();
    pStmt.close();
}

function fnEditDetalhesPedidoGradeSecundario(conn, grade, idDetalhePedido) {
    let query = `
        SELECT
            TBD.IDDETALHEPEDIDO
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO TBD
        WHERE
            TBD.IDDETALHEPEDIDOPRIMARIO = ? 
    `;
    
    let regDetPedido = api.sqlQuery(query, idDetalhePedido);
    
    regDetPedido.length > 0 && fnEditDetalhesPedidoGrade(conn, grade, parseInt(regDetPedido[0].IDDETALHEPEDIDO));
    
}

function fnEditDetalhesPedidoGrade(conn, lstDetGradEdit, idDetalhePedido) {
	let query = `
        INSERT INTO 
            "VAR_DB_NAME"."DETALHEPEDIDOGRADE"
        (
            "IDDETALHEPEDIDOGRADE",
            "IDDETALHEPEDIDO",
            "IDTAMANHO",
            "INDICETAMANHO",
            "QTD",
            "STATIVO"
        )
        VALUES(?,?,?,?,?, 'True') 
	`;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

    fnUpdateDetalhesPedidoGradeParaFalse(conn, idDetalhePedido);
    
	for (let i = 0; i < lstDetGradEdit.length; i++) {
		let registroedit = lstDetGradEdit[i];
		let idDetalhePedidoGradeEdit = api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_DETALHEPEDIDOGRADE".NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
        
		pStmt.setInt(1, idDetalhePedidoGradeEdit);
		pStmt.setInt(2, idDetalhePedido);
		pStmt.setInt(3, registroedit.idgrade);
		pStmt.setInt(4, registroedit.vlrgrade);
		pStmt.setFloat(5, registroedit.qtdgrade);
        
		pStmt.execute();
	}
	
	pStmt.close();
}

function fnEditarDetalhesPedidoSecundario(registro, conn) {
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD 
        SET
            TBD."IDCOR" =  ?,
            TBD."IDSUBGRUPOESTRUTURA" =  ?,
            TBD."IDTIPOTECIDO" =  ?,
            TBD."IDESTILO" =  ?,
            TBD."IDFABRICANTE" =  ?,
            TBD."IDLOCALEXPOSICAO" = ?,
            TBD."NUREF" = ?,
            TBD."DSPRODUTO" = ?,
            TBD."QTDTOTAL" = ?,
            TBD."NUCAIXA" = ?,
            TBD."UND" = ?,
            TBD."VRUNITBRUTO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBD."DESC01" = ?,
            TBD."DESC02" = ?,
            TBD."DESC03" = ?,
            TBD."VRUNITLIQUIDO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBD."VRVENDA" = ?,
            TBD."VRTOTAL" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBD."STECOMMERCE" = ?,
            TBD."STREDESOCIAL" = ?,
            TBD."VRCUSTOPRODATUAL" = ?,
            TBD."VRVENDAPRODATUAL" = ?,
            TBD."OBSPRODUTO" = ?,
            TBD."IDCATEGORIAS" = ?,
            TBD."STREPOSICAO" = ?,
            TBD."NUCODBARRAS" = ?,
            TBD."IDPRODUTO" = ?,
            TBD."DTATUALIZACAO" = CURRENT_TIMESTAMP,
            TBD."IDRESPATUALIZACAO" = ?
        FROM 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD 
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON 
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE 
            TBD."IDDETALHEPEDIDOPRIMARIO" =  ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

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
    
    fnEditDetalhesPedidoGradeSecundario(conn, registro.GRADE, registro.idDetPedido);
    
	pStmt.close();

    conn.commit()

    fnUpdatProdPedidoSecundario(conn, registro.idDetPedido);
}

function fnHandlePut() {
    conn = $.db.getConnection();

    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD 
        SET
            TBD."IDCOR" =  ?,
            TBD."IDSUBGRUPOESTRUTURA" =  ?,
            TBD."IDTIPOTECIDO" =  ?,
            TBD."IDESTILO" =  ?,
            TBD."IDFABRICANTE" =  ?,
            TBD."IDLOCALEXPOSICAO" = ?,
            TBD."NUREF" = ?,
            TBD."DSPRODUTO" = ?,
            TBD."QTDTOTAL" = ?,
            TBD."NUCAIXA" = ?,
            TBD."UND" = ?,
            TBD."VRUNITBRUTO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBD."DESC01" = ?,
            TBD."DESC02" = ?,
            TBD."DESC03" = ?,
            TBD."VRUNITLIQUIDO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBD."VRVENDA" = ?,
            TBD."VRTOTAL" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
            TBD."STECOMMERCE" = ?,
            TBD."STREDESOCIAL" = ?,
            TBD."VRCUSTOPRODATUAL" = ?,
            TBD."VRVENDAPRODATUAL" = ?,
            TBD."OBSPRODUTO" = ?,
            TBD."IDCATEGORIAS" = ?,
            TBD."STREPOSICAO" = ?,
            TBD."NUCODBARRAS" = ?,
            TBD."IDPRODUTO" = ?,
            TBD."DTATUALIZACAO" = CURRENT_TIMESTAMP,
            TBD."IDRESPATUALIZACAO" = ?
        FROM 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD 
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON 
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE 
            TBD."IDDETALHEPEDIDO" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString()); 

    for (let i = 0; i < bodyJson.length; i++) {
		let registro = bodyJson[i];
        
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
        
        fnEditDetalhesPedidoGrade(conn, registro.GRADE, registro.idDetPedido);
        registro.STPEDIDOPORINTEMEDIARIO == 'True' && fnEditarDetalhesPedidoSecundario(registro, conn);
        
        conn.commit();
        
        fnUpdatProdPedido(conn, registro.idDetPedido);
    }
    
	pStmt.close();

	conn.commit();
	
	return 'realizado com sucesso';

}

function fnIncluirDetalhesPedidoGrade(conn, lstDetGrad, idDetalhePedido) {
	let query = `
        INSERT INTO 
            "VAR_DB_NAME"."DETALHEPEDIDOGRADE"
        (
            "IDDETALHEPEDIDOGRADE",
            "IDDETALHEPEDIDO",
            "IDTAMANHO",
            "INDICETAMANHO",
            "QTD",
            "STATIVO"
        )
        VALUES(?,?,?,?,?, 'True') 
	`;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstDetGrad.length; i++) {
		let registro = lstDetGrad[i];
		let idDetalhePedidoGrade = api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_DETALHEPEDIDOGRADE".NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
        
		pStmt.setInt(1, idDetalhePedidoGrade);
		pStmt.setInt(2, idDetalhePedido);
		pStmt.setInt(3, registro.idgrade);
		pStmt.setInt(4, registro.vlrgrade);
		pStmt.setFloat(5, registro.qtdgrade);
        
		pStmt.execute();
	}

	pStmt.close();
}

function fnIncluirDetalhesPedidoSecundario(registro, idDetalhePedidoPrimario, conn){
    var query = `
        INSERT INTO 
            "VAR_DB_NAME"."DETALHEPEDIDO"
        (
            "IDDETALHEPEDIDO",
            "IDRESUMOPEDIDO",
            "IDCOR",
            "IDSUBGRUPOESTRUTURA",
            "IDCATEGORIAPEDIDO",
            "IDTIPOTECIDO",
            "IDESTILO",
            "IDFABRICANTE",
            "IDLOCALEXPOSICAO",
            "NUREF",
            "DSPRODUTO",
            "QTDTOTAL",
            "NUCAIXA",
            "UND",
            "VRUNITBRUTO",
            "DESC01",
            "DESC02",
            "DESC03",
            "VRUNITLIQUIDO",
            "VRVENDA",
            "VRTOTAL",
            "STRECEBIDO",
            "STECOMMERCE",
            "STREDESOCIAL",
            "STCANCELADO",
            "VRCUSTOPRODATUAL",
            "VRVENDAPRODATUAL",
            "OBSPRODUTO",
            "STTRANSFORMADO",
            "IDCATEGORIAS",
            "STREPOSICAO",
            "NUCODBARRAS",
            "IDPRODUTO",
            "DTCADASTRO",
            "IDRESPCADASTRO",
            "IDDETALHEPEDIDOPRIMARIO"
        )
		VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, now(), ?, ?)
	`;
	
	let queryIdPedidoSecundario = `
        SELECT
            IDRESUMOPEDIDO AS IDRESUMOPEDIDOSECUNDARIO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO
        WHERE
            IDPEDIDOPRIMARIO = ?
	`;
    
    let regPedidoSecundario = api.sqlQuery(queryIdPedidoSecundario, registro.IDRESUMOPEDIDO);
  
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	let idDetalhePedido = api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_DETALHEPEDIDO".NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
	let vrTaxaAcrescimo = getValorTaxaAcrescimo(regPedidoSecundario[0].IDRESUMOPEDIDOSECUNDARIO);
	
    pStmt.setInt(1,idDetalhePedido);
    pStmt.setInt(2, parseInt(regPedidoSecundario[0].IDRESUMOPEDIDOSECUNDARIO));   
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
    pStmt.setFloat(15, ( registro.VRUNITBRUTO * vrTaxaAcrescimo ));
    pStmt.setFloat(16, registro.DESC01);
    pStmt.setFloat(17, registro.DESC02);
    pStmt.setFloat(18, registro.DESC03);
    pStmt.setFloat(19, ( registro.VRUNITLIQUIDO * vrTaxaAcrescimo ));
    pStmt.setFloat(20, registro.VRVENDA);
    pStmt.setFloat(21, ( registro.VRTOTAL * vrTaxaAcrescimo ));
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
    pStmt.setInt(35, parseInt(idDetalhePedidoPrimario));
    
    pStmt.execute();
	pStmt.close();

    fnIncluirDetalhesPedidoGrade(conn, registro.GRADE, idDetalhePedido);
}

function fnHandlePost(){
    conn = $.db.getConnection();
    var query = `
        INSERT INTO 
            "VAR_DB_NAME"."DETALHEPEDIDO"
        (
            "IDDETALHEPEDIDO",
            "IDRESUMOPEDIDO",
            "IDCOR",
            "IDSUBGRUPOESTRUTURA",
            "IDCATEGORIAPEDIDO",
            "IDTIPOTECIDO",
            "IDESTILO",
            "IDFABRICANTE",
            "IDLOCALEXPOSICAO",
            "NUREF",
            "DSPRODUTO",
            "QTDTOTAL",
            "NUCAIXA",
            "UND",
            "VRUNITBRUTO",
            "DESC01",
            "DESC02",
            "DESC03",
            "VRUNITLIQUIDO",
            "VRVENDA",
            "VRTOTAL",
            "STRECEBIDO",
            "STECOMMERCE",
            "STREDESOCIAL",
            "STCANCELADO",
            "VRCUSTOPRODATUAL",
            "VRVENDAPRODATUAL",
            "OBSPRODUTO",
            "STTRANSFORMADO",
            "IDCATEGORIAS",
            "STREPOSICAO",
            "NUCODBARRAS",
            "IDPRODUTO",
            "DTCADASTRO",
            "IDRESPCADASTRO"
        )
		VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, now(), ?)
	`;
  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
		var registro = bodyJson[i];
		var idDetalhePedido = api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_DETALHEPEDIDO".NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
		let vrTaxaAcrescimo = getValorTaxaAcrescimo(registro.IDRESUMOPEDIDO);
		
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
        pStmt.setFloat(15, ( registro.VRUNITBRUTO * vrTaxaAcrescimo ));
        pStmt.setFloat(16, registro.DESC01);
        pStmt.setFloat(17, registro.DESC02);
        pStmt.setFloat(18, registro.DESC03);
        pStmt.setFloat(19, ( registro.VRUNITLIQUIDO * vrTaxaAcrescimo ));
        pStmt.setFloat(20, registro.VRVENDA);
        pStmt.setFloat(21, ( registro.VRTOTAL * vrTaxaAcrescimo ));
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
        
        fnIncluirDetalhesPedidoGrade(conn, registro.GRADE, idDetalhePedido);
        
        registro.STPEDIDOPORINTEMEDIARIO == 'True' && fnIncluirDetalhesPedidoSecundario(registro, idDetalhePedido, conn);
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