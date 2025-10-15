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

function getDadosPedidoSecundario(idDetalhePedido){
    let query = `
        SELECT
            IDRESUMOPEDIDO,
            IDDETALHEPEDIDO
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            STCANCELADO = 'False'
            AND IDDETALHEPEDIDOPRIMARIO = ?
    `;
    
    return api.sqlQuery(query,idDetalhePedido);
}

function fnHandleGet(byId) {
    let idPedido = $.request.parameters.get("idpedido");
    let idDetPedido = $.request.parameters.get("iddetPedido");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let sttransformado = $.request.parameters.get("sttransformado");

    let query = `
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
            TBFORN.IDFORNECEDOR, 
            TBFORN.NORAZAOSOCIAL, 
            TBFORN.NOFANTASIA, 
            TBFORN.NUCNPJ, 
            TBFAB.IDFABRICANTE,  
            TBFAB.DSFABRICANTE,  
            TBT.DSTIPOTECIDO,  
            TBLE.IDLOCALEXPOSICAO,  
            TBLE.DSLOCALEXPOSICAO,  
            TBE.IDESTILO,  
            TBE.DSESTILO,  
            TBDP.NUREF, 
            TBDP.DSPRODUTO, 
            TBDP.QTDTOTAL, 
            TBDP.NUCAIXA, 
            TBUM.DSSIGLA, 
            TBUM.IDUNIDADEMEDIDA, 
            ( TBDP.VRUNITBRUTO) AS VRUNITBRUTODETALHEPEDIDO, 
            IFNULL( TBDP.DESC01,0) AS DESC01, 
            IFNULL( TBDP.DESC02,0) AS DESC02, 
            IFNULL( TBDP.DESC03,0) AS DESC03, 
            ( TBDP.VRUNITLIQUIDO) AS VRUNITLIQDETALHEPEDIDO,  
            ( TBDP.VRVENDA) AS VRVENDADETALHEPEDIDO, 
            ( TBDP.VRTOTAL) AS VRTOTALDETALHEPEDIDO, 
            TBDP.STRECEBIDO, 
            TBDP.STECOMMERCE, 
            TBDP.STREDESOCIAL, 
            TBDP.STCANCELADO, 
            TBDP.STTRANSFORMADO, 
            IFNULL( TBDP.VRCUSTOPRODATUAL,0) AS VRCUSTOPRODATUAL, 
            IFNULL( TBDP.VRVENDAPRODATUAL,0) AS VRVENDAPRODATUAL, 
            TBDP.OBSPRODUTO, 
            TBDP.IDCATEGORIAS AS CATEGORIAPROD, 
            TBC.DSCATEGORIAS AS DSCATEGORIAPROD, 
            TBC.TPCATEGORIAS AS TPCATEGORIAPROD, 
            TBC.TPCATEGORIAPEDIDO AS TPCATEGORIAPRODPEDIDO, 
            TO_VARCHAR( TBRP.DTPEDIDO, 'DD-MM-YYYY HH24:MI:SS') AS DTPEDIDO 
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
        INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBUM ON
            TBDP.UND = TBUM.IDUNIDADEMEDIDA  
        INNER JOIN "VAR_DB_NAME".ESTILOS TBE ON
            TBDP.IDESTILO = TBE.IDESTILO  
        INNER JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
            TBDP.IDLOCALEXPOSICAO = TBLE.IDLOCALEXPOSICAO  
        INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
            TBDP.IDSUBGRUPOESTRUTURA = TBSE.IDSUBGRUPOESTRUTURA  
        INNER JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGE ON
            TBSE.IDGRUPOESTRUTURA = TBGE.IDGRUPOESTRUTURA  
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBFORN ON
            TBRP.IDFORNECEDOR = TBFORN.IDFORNECEDOR  
        INNER JOIN "VAR_DB_NAME".FABRICANTE TBFAB ON
            TBDP.IDFABRICANTE = TBFAB.IDFABRICANTE  
        INNER JOIN "VAR_DB_NAME".CATEGORIAS TBC ON
            TBDP.IDCATEGORIAS = TBC.IDCATEGORIAS
        WHERE
            1 = ?
            AND TBRP.STCANCELADO = 'False' 
            AND TBDP.STCANCELADO = 'False' 
    `;
    
    if ( byId ) {
        query += ` AND TBDP.IDDETALHEPEDIDO = '${byId}' `;
    }
    if ( idDetPedido ) {
        query += ` AND TBDP.IDDETALHEPEDIDO = '${idDetPedido}' `;
    }
    if ( idPedido ) {
        query += ` AND TBDP.IDRESUMOPEDIDO = '${idPedido}' `;
    }
    if ( sttransformado ) {
        query += ` AND TBDP.STTRANSFORMADO = '${sttransformado}' `;
    }
    if( dataPesquisaInicio && dataPesquisaFim ) {
        query += ` AND (TO_DATE(TBRP.DTPEDIDO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }
    
    query += ' ORDER BY TBDP.NUREF, TBDP.DSPRODUTO ';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function getDetalhesProdutoPedido(idDetalhePedido){
    let queryProdutosPed = `
        SELECT
            TBD.IDDETALHEPEDIDO AS ID,
            TRIM(TBD.NUREF) AS NUREFPROD,
            TBD.IDCATEGORIAPEDIDO,
            TBD.IDTIPOTECIDO,
            TBD.IDCOR,
            TBD.IDLOCALEXPOSICAO,
            TBD.IDESTILO,
            TBD.IDFABRICANTE,
            TBD.IDCATEGORIAS,
            TBFORN.IDFORNECEDOR,
            TBT.IDTAMANHO AS IDTAMANHO,
            TBUM.DSSIGLA AS UN,
            TBD.VRUNITLIQUIDO AS VRUNIT,
            TBD.VRVENDA AS VRVENDA,
            IFNULL(TBD.STREPOSICAO,'False') AS STREPOSICAO,
            IFNULL(TBD.STECOMMERCE,'False') AS STECOMMERCE,
            IFNULL(TBD.STREDESOCIAL,'False') AS STREDESOCIAL,
            TBDPG.QTD AS QTDPRODUTO,
            (TBDPG.QTD * TBD.VRUNITLIQUIDO) AS TOTALCUSTO,
            (TBDPG.QTD * TBD.VRVENDA) AS TOTALVENDA,
            IFNULL(TBR.DTMOVPEDIDO, now()) AS DTMOVPEDIDO
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO AS TBD
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS TBR ON 
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".FORNECEDOR AS TBFORN ON 
            TBR.IDFORNECEDOR = TBFORN.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA AS TBUM ON 
            TBD.UND = TBUM.IDUNIDADEMEDIDA
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE AS TBDPG ON 
            TBD.IDDETALHEPEDIDO = TBDPG.IDDETALHEPEDIDO AND TBDPG.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".TAMANHO AS TBT ON 
            TBDPG.IDTAMANHO = TBT.IDTAMANHO 
        WHERE 
            TBD.IDDETALHEPEDIDO = ? 
            AND TBD.STCANCELADO = 'False' 
    `;

	return api.sqlQuery(queryProdutosPed, idDetalhePedido);
}

function fnUpdateDetalheProdutoPedido(idDetalhePedido, conn) {
    let steditcomp = 'True';
    let lstDeProdutosPed = getDetalhesProdutoPedido(idDetalhePedido);
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET
            "IDCOR" = ?,
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
            "STECOMMERCE" = ?,
            "STREDESOCIAL" = ?,
            "IDFORNECEDOR" = ?,
            "STREPOSICAO" = ?,
            "STEDITADOCOMPRAS" = ?,
            "DTULTATUALIZACAO" = CURRENT_TIMESTAMP
        WHERE 
            "IDDETALHEPEDIDO" =  ? 
            AND "IDTAMANHO" =  ?
    `;
    		
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	
	for (let i = 0; i < lstDeProdutosPed.length; i++) {
        let registroProd = lstDeProdutosPed[i];
        
        pStmt.setInt(1, parseInt(registroProd.IDCOR));
        pStmt.setInt(2, parseInt(registroProd.IDTIPOTECIDO));
        pStmt.setInt(3, parseInt(registroProd.IDESTILO));
        pStmt.setInt(4, parseInt(registroProd.IDFABRICANTE));
        pStmt.setInt(5, parseInt(registroProd.IDLOCALEXPOSICAO));
        pStmt.setInt(6, parseInt(registroProd.IDCATEGORIAS));
        pStmt.setString(7, registroProd.NUREFPROD);
        pStmt.setFloat(8, parseFloat(registroProd.QTDPRODUTO) || 0);
        pStmt.setString(9, registroProd.UN);
        pStmt.setFloat(10, parseFloat(registroProd.VRUNIT) || 0);
        pStmt.setFloat(11, parseFloat(registroProd.VRVENDA) || 0);
        pStmt.setFloat(12, parseFloat(registroProd.TOTALCUSTO)||0);
        pStmt.setFloat(13, parseFloat(registroProd.TOTALVENDA) || 0);
        pStmt.setString(14, registroProd.STECOMMERCE);
        pStmt.setString(15, registroProd.STREDESOCIAL);
        pStmt.setInt(16, parseInt(registroProd.IDFORNECEDOR));
        pStmt.setString(17, registroProd.STREPOSICAO);
        pStmt.setString(18, steditcomp);
        pStmt.setInt(19, parseInt(registroProd.ID));
        pStmt.setInt(20, parseInt(registroProd.IDTAMANHO));
        
        pStmt.execute();
	}
    
    pStmt.close();
	    
	return {
        "msg": "Edição realizado com sucesso!"
    };

}

function fnUpdateValoresResumoPedido(idResumoPedido, conn){
    let querydetpedido = `
        SELECT 
            IFNULL(COUNT(IDDETALHEPEDIDO), 0) TOTALITENS, 
            IFNULL(SUM(QTDTOTAL), 0) QTDTOTAL, 
            IFNULL(SUM(VRTOTAL), 0) VRTOTAL
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            "STCANCELADO"= 'False' 
            AND IDRESUMOPEDIDO = ?
    `;

	let regDetalhe = api.sqlQuery(querydetpedido, idResumoPedido);
	let dados = regDetalhe[0];

    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET 
            "NUTOTALITENS" = ?, 
            "QTDTOTPRODUTOS" =  ?, 
            "VRTOTALBRUTO" =  ?, 
            "VRTOTALLIQUIDO" =  ?, 
            "DTMOVPEDIDO" = now()
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(dados.TOTALITENS || 0));
    pStmt.setFloat(2, parseFloat(dados.QTDTOTAL || 0));
    pStmt.setFloat(3, parseFloat(dados.VRTOTAL || 0));
    pStmt.setFloat(4, parseFloat(dados.VRTOTAL || 0));
    pStmt.setInt(5, parseInt(idResumoPedido));
    
    pStmt.execute();
    pStmt.close();
}

function fnUpdateDetalhePedidoSecundario(dados, conn) {
    let dadosPedido = getDadosPedidoSecundario(dados.IDDETALHEPEDIDO) || 0;
    
    if(dadosPedido.length > 0){
        let idResumoPedido = Number(dadosPedido[0].IDRESUMOPEDIDO);
        let idDetalhePedido = Number(dadosPedido[0].IDDETALHEPEDIDO);
        
        let query = `
            UPDATE 
                "VAR_DB_NAME"."DETALHEPEDIDO" TBD
            SET
                TBD."IDCOR" =  ?,
                TBD."IDTIPOTECIDO" =  ?,
                TBD."IDLOCALEXPOSICAO" = ?,
                TBD."NUREF" = ?,
                TBD."DSPRODUTO" = ?,
                TBD."QTDTOTAL" = ?,
                TBD."NUCAIXA" = ?,
                TBD."UND" = ?,
                TBD."VRUNITBRUTO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
                TBD."VRUNITLIQUIDO" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
                TBD."VRVENDA" = ?,
                TBD."VRTOTAL" = (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)),
                TBD."STECOMMERCE" = ?,
                TBD."STREDESOCIAL" = ?, 
                TBD."IDCATEGORIAS" = ?
            FROM 
                "VAR_DB_NAME"."DETALHEPEDIDO" TBD
            INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON 
                TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
            WHERE 
                TBD."IDDETALHEPEDIDO" =  ?
        `;
        
        let pStmt = conn.prepareStatement(api.replaceDbName(query));
        
        pStmt.setInt(1, dados.IDCOR);
        pStmt.setInt(2, dados.IDTIPOTECIDO);
        pStmt.setInt(3, dados.IDLOCALEXPOSICAO);
        pStmt.setString(4, dados.NUREF);
        pStmt.setString(5, dados.DSPRODUTO);
        pStmt.setFloat(6, dados.QTDTOTAL);
        pStmt.setInt(7, dados.NUCAIXA);
        pStmt.setInt(8, dados.UND);
        pStmt.setFloat(9, dados.VRUNITBRUTO);
        pStmt.setFloat(10, dados.VRUNITLIQUIDO);
        pStmt.setFloat(11, dados.VRVENDA);
        pStmt.setFloat(12, dados.VRTOTAL);
        pStmt.setString(13, dados.STECOMMERCE);
        pStmt.setString(14, dados.STREDESOCIAL);
        pStmt.setInt(15, dados.IDCATEGORIAS);
        pStmt.setInt(16, idDetalhePedido);
        
        pStmt.execute();
        pStmt.close();
        
        conn.commit();
        
        fnUpdateDetalheProdutoPedido(idDetalhePedido, conn);
        fnUpdateValoresResumoPedido(idResumoPedido, conn);
    }
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" 
        SET
            "IDCOR" =  ?,
            "IDTIPOTECIDO" =  ?,
            "IDLOCALEXPOSICAO" = ?,
            "NUREF" = ?,
            "DSPRODUTO" = ?,
            "QTDTOTAL" = ?,
            "NUCAIXA" = ?,
            "UND" = ?,
            "VRUNITBRUTO" = ?,
            "VRUNITLIQUIDO" = ?,
            "VRVENDA" = ?,
            "VRTOTAL" = ?,
            "STECOMMERCE" = ?,
            "STREDESOCIAL" = ?, 
            "IDCATEGORIAS" = ?
        WHERE 
            "IDDETALHEPEDIDO" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString());

    for (let i = 0; i < bodyJson.length; i++) {
		let registro = bodyJson[i];
		let stPedidoPrimario = registro.STPEDIDOPRIMARIO == 'True';
        
        pStmt.setInt(1, registro.IDCOR);
        pStmt.setInt(2, registro.IDTIPOTECIDO);
        pStmt.setInt(3, registro.IDLOCALEXPOSICAO);
        pStmt.setString(4, registro.NUREF);
        pStmt.setString(5, registro.DSPRODUTO);
        pStmt.setFloat(6, registro.QTDTOTAL);
        pStmt.setInt(7, registro.NUCAIXA);
        pStmt.setInt(8, registro.UND);
        pStmt.setFloat(9, registro.VRUNITBRUTO);
        pStmt.setFloat(10, registro.VRUNITLIQUIDO);
        pStmt.setFloat(11, registro.VRVENDA);
        pStmt.setFloat(12, registro.VRTOTAL);
        pStmt.setString(13, registro.STECOMMERCE);
        pStmt.setString(14, registro.STREDESOCIAL);
        pStmt.setInt(15, registro.IDCATEGORIAS);
        pStmt.setInt(16, registro.IDDETALHEPEDIDO);
        
        pStmt.execute();
        
        conn.commit();
        
        fnUpdateDetalheProdutoPedido(registro.IDDETALHEPEDIDO, conn);
        
        fnUpdateValoresResumoPedido(registro.IDRESUMOPEDIDO, conn);
        
        if(stPedidoPrimario){
            fnUpdateDetalhePedidoSecundario(registro, conn);
        }
    }

	pStmt.close();
	
	conn.commit();
	
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