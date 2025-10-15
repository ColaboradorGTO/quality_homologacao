var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

let dbNameSap = 'SBO_GTO_TESTE4';
let conn;

function updateLogSuccess(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_CRIADO_PEDIDO_PRIMARIO = 'True',
            LOG_ERROR = NULL
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
	pStmt.setInt(1, Number(idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function updateLogError(idResumoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_CRIADO_PEDIDO_PRIMARIO = 'False',
            LOG_ERROR = ?
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, msgError);
	pStmt.setInt(2, Number(idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function getValoresPedido(idResumoPedido){
    let dados = {
        TOTALITENS: 0,
        QTDTOTPRODUTOS: 0,
        VRTOTAL: 0
    };
    
    let query = `
        SELECT 
            IFNULL(COUNT(IDDETALHEPEDIDO),0) TOTALITENS,
            IFNULL(SUM(QTDTOTAL),0) QTDTOTPRODUTOS,
            IFNULL(SUM(VRTOTAL),0) VRTOTAL
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
    
    let reg = api.sqlQuery(query, idResumoPedido);
    
    if(reg.length > 0){
        dados.TOTALITENS = parseInt(reg[0].TOTALITENS);
        dados.QTDTOTPRODUTOS = parseFloat(reg[0].QTDTOTPRODUTOS);
        dados.VRTOTAL = parseFloat(reg[0].VRTOTAL);
    }
    
    return dados;
}

function atualizarResumoPedidoOrigem(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            "DTMOVPEDIDO" = now(),
            "DTREATIVACAO" = now(),
            "STREATIVADO" = 'True',
            "TXTMOTIVOREATIVACAO" = 'Pedido Transformado para Intermediario'
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoPedido);
    
    pStmt.execute();
    pStmt.close();
}

function atualizarValoresResumoPedido(idResumoPedido){
    let dados = getValoresPedido(idResumoPedido);
      
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            "NUTOTALITENS" = ?,
            "QTDTOTPRODUTOS" =  ?,
            "VRTOTALBRUTO" =  ?, 
            "VRTOTALLIQUIDO" =  ? 
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;
    
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(dados.TOTALITENS));
    pStmt.setFloat(2, parseFloat(dados.QTDTOTPRODUTOS));
    pStmt.setFloat(3, parseFloat(dados.VRTOTAL));
    pStmt.setFloat(4, parseFloat(dados.VRTOTAL));
    pStmt.setInt(5, parseInt(idResumoPedido));
    
    pStmt.execute();
    pStmt.close();
    
    conn.commit();
}

function gerarResumoPedido(idResumoPedido){
    let queryId = api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_RESUMOPEDIDO".NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
    
    let queryInsert = `
        INSERT INTO 
            "VAR_DB_NAME".RESUMOPEDIDO
        (
            IDRESUMOPEDIDO,
            IDGRUPOEMPRESARIAL,
            IDSUBGRUPOEMPRESARIAL,
            IDEMPRESA,
            IDCOMPRADOR,
            IDCONDICAOPAGAMENTO,
            IDFORNECEDOR,
            IDTRANSPORTADORA,
            IDANDAMENTO,
            TPCATEGORIAPEDIDO,
            MODPEDIDO,
            TPFORNECEDOR,
            NOVENDEDOR,
            EEMAILVENDEDOR,
            DTPEDIDO,
            DTPREVENTREGA,
            TPFRETE,
            NUTOTALITENS,
            QTDTOTPRODUTOS,
            VRTOTALBRUTO,
            VRTOTALLIQUIDO,
            DESCPERC01,
            DESCPERC02,
            DESCPERC03,
            PERCCOMISSAO,
            DTFECHAMENTOPEDIDO,
            DTCADASTRO,
            IDRESPCANCELAMENTO,
            DSMOTIVOCANCELAMENTO,
            DTCANCELAMENTO,
            TPARQUIVO,
            DTRECEBIMENTOPEDIDO,
            STDISTRIBUIDO,
            STAGRUPAPRODUTO,
            STCANCELADO,
            TPFISCAL,
            VRCOMISSAO,
            STMIGRADOSAP,
            TXTOBSDEVPEDIDO,
            OBSPEDIDO_1,
            OBSPEDIDO_2,
            DTMOVPEDIDO,
            OBSPEDIDO,
            OBSPEDIDO2,
            STRASCUNHO,
            LOGSAP,
            IDRESUMOPEDIDOORIGEM,
            IDRESPREATIVACAO,
            TXTMOTIVOREATIVACAO,
            DTREATIVACAO,
            STPEDIDOPRIMARIO
        ) 
        SELECT 
            ${queryId} AS IDRESUMOPEDIDO,
            TBR.IDGRUPOEMPRESARIAL,
            TBR.IDSUBGRUPOEMPRESARIAL,
            TBR.IDEMPRESA,
            TBR.IDCOMPRADOR,
            TBR.IDCONDICAOPAGAMENTO,
            TBR.IDFORNECEDOR,
            TBR.IDTRANSPORTADORA,
            5 AS IDANDAMENTO,
            TBR.TPCATEGORIAPEDIDO,
            TBR.MODPEDIDO,
            TBR.TPFORNECEDOR,
            TBR.NOVENDEDOR,
            TBR.EEMAILVENDEDOR,
            TBR.DTPEDIDO,
            TBR.DTPREVENTREGA,
            TBR.TPFRETE,
            TBR.NUTOTALITENS,
            TBR.QTDTOTPRODUTOS,
            TBR.VRTOTALBRUTO,
            TBR.VRTOTALLIQUIDO,
            TBR.DESCPERC01,
            TBR.DESCPERC02,
            TBR.DESCPERC03,
            TBR.PERCCOMISSAO,
            TBR.DTFECHAMENTOPEDIDO,
            TBR.DTCADASTRO,
            NULL AS IDRESPCANCELAMENTO,
            NULL AS DSMOTIVOCANCELAMENTO,
            NULL AS DTCANCELAMENTO,
            TBR.TPARQUIVO,
            TBR.DTRECEBIMENTOPEDIDO,
            TBR.STDISTRIBUIDO,
            TBR.STAGRUPAPRODUTO,
            'False' AS STCANCELADO,
            TBR.TPFISCAL,
            TBR.VRCOMISSAO,
            'False' AS STMIGRADOSAP,
            NULL AS TXTOBSDEVPEDIDO,
            TBR.OBSPEDIDO_1,
            TBR.OBSPEDIDO_2,
            TBR.DTMOVPEDIDO,
            TBR.OBSPEDIDO,
            TBR.OBSPEDIDO2,
            TBR.STRASCUNHO,
            NULL AS LOGSAP,
            TBR.IDRESUMOPEDIDO AS IDRESUMOPEDIDOORIGEM,
            NULL AS IDRESPREATIVACAO,
            NULL AS TXTMOTIVOREATIVACAO,
            NULL AS DTREATIVACAO,
            'True' AS STPEDIDOPRIMARIO
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        WHERE 
            TBR.IDRESUMOPEDIDO = ?
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    pStmtInsert.setInt(1, idResumoPedido);
    
    pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
	
    return Number(queryId);
}

function gerarDetalhePedido(idResumoPedido, idPedidoNovo){
    let queryInsert = `
        INSERT INTO "VAR_DB_NAME".DETALHEPEDIDO
        (   
            IDDETALHEPEDIDO,
            IDRESUMOPEDIDO,
            IDCOR,
            IDSUBGRUPOESTRUTURA,
            IDCATEGORIAPEDIDO,
            IDTIPOTECIDO,
            IDESTILO,
            IDFABRICANTE,
            IDLOCALEXPOSICAO,
            NUREF,
            DSPRODUTO,
            QTDTOTAL,
            NUCAIXA,
            UND,
            VRUNITBRUTO,
            DESC01,
            DESC02,
            DESC03,
            VRUNITLIQUIDO,
            VRVENDA,
            VRTOTAL,
            STRECEBIDO,
            STECOMMERCE,
            STREDESOCIAL,
            STCANCELADO,
            STTRANSFORMADO,
            VRCUSTOPRODATUAL,
            VRVENDAPRODATUAL,
            OBSPRODUTO,
            IDCATEGORIAS,
            IDRESPCANCELAMENTO,
            TXTOBSCANCELAMENTO,
            STREPOSICAO,
            NUCODBARRAS,
            DTCANCELAMENTO,
            IDPRODUTO,
            DTATUALIZACAO,
            IDRESPATUALIZACAO,
            IDRESPCADASTRO,
            DTCADASTRO,
            IDRESPAUTORIZAEDITCAD,
            IDDETALHEPEDIDOORIGEM
        )
        SELECT
            "VAR_DB_NAME"."SEQ_DETALHEPEDIDO".NEXTVAL AS IDDETALHEPEDIDO,
            ${idPedidoNovo} AS IDRESUMOPEDIDO,
            A.IDCOR,
            A.IDSUBGRUPOESTRUTURA,
            A.IDCATEGORIAPEDIDO,
            A.IDTIPOTECIDO,
            A.IDESTILO,
            A.IDFABRICANTE,
            A.IDLOCALEXPOSICAO,
            B.NUREF,
            B.DSPRODUTO,
            B.QTDPRODUTO AS QTDTOTAL,
            A.NUCAIXA,
            A.UND,
            B.VRCUSTO AS VRUNITBRUTO,
            A.DESC01,
            A.DESC02,
            A.DESC03,
            B.VRCUSTO AS VRUNITLIQUIDO,
            B.VRVENDA,
            B.VRTOTALCUSTO AS VRTOTAL,
            A.STRECEBIDO,
            A.STECOMMERCE,
            A.STREDESOCIAL,
            'False' AS STCANCELADO,
            B.STCADASTRADO AS STTRANSFORMADO,
            A.VRCUSTOPRODATUAL,
            A.VRVENDAPRODATUAL,
            A.OBSPRODUTO,
            A.IDCATEGORIAS,
            NULL AS IDRESPCANCELAMENTO,
            NULL AS TXTOBSCANCELAMENTO,
            'True' AS STREPOSICAO,
            B.CODBARRAS AS NUCODBARRAS,
            NULL AS DTCANCELAMENTO,
            B.IDPRODCADASTRO AS IDPRODUTO,
            A.DTATUALIZACAO,
            A.IDRESPATUALIZACAO,
            A.IDRESPCADASTRO,
            A.DTCADASTRO,
            A.IDRESPAUTORIZAEDITCAD,
            A.IDDETALHEPEDIDO AS IDDETALHEPEDIDOORIGEM
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO A
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO B ON 
            A.IDDETALHEPEDIDO = B.IDDETALHEPEDIDO
        WHERE 
            A.DTCANCELAMENTO IS NULL
            AND A.IDRESUMOPEDIDO = ?
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    pStmtInsert.setInt(1, idResumoPedido);
    
    pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
}

function gerarDetalhePedidoGrade(idPedidoNovo) {
	let queryInsert = `
        INSERT INTO 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE
        (
            IDDETALHEPEDIDOGRADE,
            IDDETALHEPEDIDO,
            IDTAMANHO,
            INDICETAMANHO,
            QTD,
            STATIVO
        )
        SELECT
            "VAR_DB_NAME"."SEQ_DETALHEPEDIDOGRADE".NEXTVAL AS IDDETALHEPEDIDOGRADE,
            D.IDDETALHEPEDIDO,
            C.IDTAMANHO,
            1 AS INDICETAMANHO,
            C.QTDPRODUTO AS QTD,
            'True' AS STATIVO
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO A
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO B ON
            A.IDRESUMOPEDIDOORIGEM = B.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO C ON 
            B.IDDETALHEPEDIDO = C.IDDETALHEPEDIDO AND C.STCANCELADO = 'True'
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO D ON  
            A.IDRESUMOPEDIDO = D.IDRESUMOPEDIDO AND D.IDDETALHEPEDIDOORIGEM = B.IDDETALHEPEDIDO AND C.IDPRODCADASTRO = D.IDPRODUTO AND D.DTCANCELAMENTO IS NULL
        WHERE 
            B.DTCANCELAMENTO IS NULL
            AND A.IDRESUMOPEDIDO = ?
	`;

	let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
	
	pStmtInsert.setInt(1, idPedidoNovo);
	
	pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
}

function gerarDetalheProdutoPedido(idPedidoNovo) {
    
	let queryInsert = `
        INSERT INTO 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO
        (
            IDRESUMOPEDIDO,
            IDDETALHEPEDIDO,
            IDGRUPOESTRUTURA,
            IDSUBGRUPOESTRUTURA,
            IDCOR,
            IDTAMANHO,
            DSTAMANHO,
            IDCATEGORIAPEDIDO,
            IDTIPOTECIDO,
            IDESTILO,
            IDFABRICANTE,
            IDLOCALEXPOSICAO,
            IDCATEGORIAS,
            IDNCM,
            NUNCM,
            IDCEST,
            NUCEST,
            IDTIPOPRODUTOFISCAL,
            IDFONTEPRODUTOFISAL,
            IDPRODCADASTRO,
            NUREF,
            CODBARRAS,
            DSPRODUTO,
            QTDPRODUTO,
            UND,
            VRCUSTO,
            VRVENDA,
            VRTOTALCUSTO,
            VRTOTALVENDA,
            DTCADASTRO,
            DTULTATUALIZACAO,
            STCADASTRADO,
            STRECEBIDO,
            OBSREF,
            IDDETALHEENTRADA,
            NUNF,
            QTDENTRADANF,
            DTENTRADANF,
            STECOMMERCE,
            STREDESOCIAL,
            STATIVO,
            STCANCELADO,
            QTDESTOQUEIDEAL,
            STMIGRADOSAP,
            STAVULSO,
            IDGRUPOEMPRESARIAL,
            IDFORNECEDOR,
            IDRESPCANCELAMENTO,
            TXTOBSCANCELAMENTO,
            STREPOSICAO,
            STVINCPRODPEDSAP,
            STEDITADOCOMPRAS,
            DTCANCELAMENTO,
            IDRESPCADASTRO,
            IDRESPATUALIZACAO,
            IDRESPAUTORIZAEDITCAD,
            IDDETALHEPRODUTOPEDIDOORIGEM
        )
        SELECT 
            B.IDRESUMOPEDIDO,
            B.IDDETALHEPEDIDO,
            A.IDGRUPOESTRUTURA,
            A.IDSUBGRUPOESTRUTURA,
            A.IDCOR,
            A.IDTAMANHO,
            A.DSTAMANHO,
            A.IDCATEGORIAPEDIDO,
            A.IDTIPOTECIDO,
            A.IDESTILO,
            A.IDFABRICANTE,
            A.IDLOCALEXPOSICAO,
            A.IDCATEGORIAS,
            A.IDNCM,
            A.NUNCM,
            A.IDCEST,
            A.NUCEST,
            A.IDTIPOPRODUTOFISCAL,
            A.IDFONTEPRODUTOFISAL,
            REPLACE(IFNULL(D."IDPRODCADASTRO", A."IDPRODCADASTRO"), '_RN', '') AS IDPRODCADASTRO,
            A.NUREF,
            IFNULL(D.CODBARRAS, A.CODBARRAS) AS CODBARRAS,
            A.DSPRODUTO,
            A.QTDPRODUTO,
            A.UND,
            A.VRCUSTO,
            A.VRVENDA,
            A.VRTOTALCUSTO,
            A.VRTOTALVENDA,
            A.DTCADASTRO,
            A.DTULTATUALIZACAO,
            A.STCADASTRADO,
            A.STRECEBIDO,
            A.OBSREF,
            A.IDDETALHEENTRADA,
            A.NUNF,
            A.QTDENTRADANF,
            A.DTENTRADANF,
            A.STECOMMERCE,
            A.STREDESOCIAL,
            'True' AS STATIVO,
            'False' AS STCANCELADO,
            A.QTDESTOQUEIDEAL,
            'False' AS STMIGRADOSAP,
            A.STAVULSO,
            A.IDGRUPOEMPRESARIAL,
            A.IDFORNECEDOR,
            NULL AS IDRESPCANCELAMENTO,
            NULL AS TXTOBSCANCELAMENTO,
            'True' AS STREPOSICAO,
            A.STVINCPRODPEDSAP,
            A.STEDITADOCOMPRAS,
            A.DTCANCELAMENTO,
            A.IDRESPCADASTRO,
            A.IDRESPATUALIZACAO,
            A.IDRESPAUTORIZAEDITCAD,
            A.IDDETALHEPRODUTOPEDIDO AS IDDETALHEPRODUTOPEDIDOORIGEM
        FROM 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO A
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO B ON 
            A.IDDETALHEPEDIDO = B.IDDETALHEPEDIDOORIGEM AND A.IDPRODCADASTRO = B.IDPRODUTO AND B.DTCANCELAMENTO IS NULL
        LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO C ON 
            B.IDDETALHEPEDIDOORIGEM = C.IDDETALHEPEDIDOPRIMARIO AND C.DTCANCELAMENTO IS NULL
        LEFT JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO D ON 
            C.IDDETALHEPEDIDO = D.IDDETALHEPEDIDO AND A.IDTAMANHO = D.IDTAMANHO AND D.DTCANCELAMENTO IS NULL
        WHERE
            A.DTCANCELAMENTO IS NULL
            AND B.IDRESUMOPEDIDO = ?
	`;

	let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
	
	pStmtInsert.setInt(1, idPedidoNovo);

	pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
}

function validarSeExistePedidoPrimarioCriado(idResumoPedidoParaTransformar){
    let query = `
        SELECT 
            IDRESUMOPEDIDO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO
        WHERE 
            IDRESUMOPEDIDOORIGEM = ?
    `;
    
    let reg = api.sqlQuery(query, idResumoPedidoParaTransformar);
    
    return reg.length > 0 ? Number(reg[0].IDRESUMOPEDIDO) : 0;
}

function criarPedidoPrimario(idResumoPedidoParaTransformar) {
    conn = $.db.getConnection();
    
    try{
        let idResumoPedidoCriado = validarSeExistePedidoPrimarioCriado(idResumoPedidoParaTransformar);
        
        if(idResumoPedidoCriado > 0){
            return updateLogSuccess(idResumoPedidoParaTransformar);
        }
        
        let idResumoPedidoNovo = gerarResumoPedido(idResumoPedidoParaTransformar);
        
        gerarDetalhePedido(idResumoPedidoParaTransformar, idResumoPedidoNovo);
        
        gerarDetalhePedidoGrade(idResumoPedidoNovo);
        
        gerarDetalheProdutoPedido(idResumoPedidoNovo);
        
        atualizarValoresResumoPedido(idResumoPedidoNovo);
        
        atualizarResumoPedidoOrigem(idResumoPedidoParaTransformar);
        
        conn.commit();
        
        updateLogSuccess(idResumoPedidoParaTransformar);
    } catch(error){
        updateLogError(idResumoPedidoParaTransformar, (error.message || 'Erro ao criar o pedido primario'));
        throw error;
    }
}