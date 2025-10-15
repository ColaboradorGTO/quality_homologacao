var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

let dbNameSap = 'SBO_GTO_TESTE4';
let conn;

function updateLogSuccess(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS 
        SET
            ST_CRIADO_PEDIDO_SECUNDARIO = 'True',
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
            ST_CRIADO_PEDIDO_SECUNDARIO = 'False',
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

function getValorTaxa(){
    let query = `
        SELECT
            FIRST_VALUE(VR_TAXA_PERC ORDER BY IDTAXA) AS VR_TAXA_PERC
        FROM
            "VAR_DB_NAME".TAXAFLUTUANTEPEDIDOCOMPRA
        WHERE
            1 = ?
            AND ( 
                DTFIM IS NULL 
                    OR 
                TO_DATE(DTFIM) > CURRENT_DATE 
            )
    `;
    
    let regTaxa = api.sqlQuery(query, 1);
    
    return regTaxa.length > 0 ? (Number(regTaxa[0].VR_TAXA_PERC) / 100) + 1 : 1;
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

function atualizarDetalhePedidoPrimario(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD
        SET
            TBD.IDPRODUTO = (REPLACE(TBD.IDPRODUTO, '_RN', '') || '_RN'),
            TBD.NUCODBARRAS = 'SEM GTIN'
        FROM 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE 
            TBR.IDRESUMOPEDIDOORIGEM =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoPedido);
    
    pStmt.execute();
    pStmt.close();
}

function atualizarDetalheProdutoPedidoPrimario(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        SET
            TBDPP."IDPRODCADASTRO" = (REPLACE(TBDPP.IDPRODCADASTRO, '_RN', '') || '_RN'),
            TBDPP.CODBARRAS = 'SEM GTIN'
        FROM 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON
            TBDPP.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE 
            TBR.IDRESUMOPEDIDOORIGEM =  ? 
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

function gerarResumoPedido(idResumoPedido, vrTaxa){
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
            IDPEDIDOPRIMARIO,
            FATOR_ACRESCIMO_COMPRA
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
            (TBR.VRTOTALBRUTO * ${vrTaxa}) AS VRTOTALBRUTO,
            (TBR.VRTOTALLIQUIDO * ${vrTaxa}) AS VRTOTALLIQUIDO,
            TBR.DESCPERC01,
            TBR.DESCPERC02,
            TBR.DESCPERC03,
            TBR.PERCCOMISSAO,
            NULL AS DTFECHAMENTOPEDIDO,
            TBR.DTCADASTRO,
            NULL AS IDRESPCANCELAMENTO,
            NULL AS DSMOTIVOCANCELAMENTO,
            NULL AS DTCANCELAMENTO,
            TBR.TPARQUIVO,
            NULL  AS DTRECEBIMENTOPEDIDO,
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
            NULL AS IDRESUMOPEDIDOORIGEM,
            NULL AS IDRESPREATIVACAO,
            NULL AS TXTMOTIVOREATIVACAO,
            NULL AS DTREATIVACAO,
            TBR.IDRESUMOPEDIDO AS IDPEDIDOPRIMARIO,
            ${vrTaxa} AS FATOR_ACRESCIMO_COMPRA
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        WHERE 
            TBR.IDRESUMOPEDIDOORIGEM = ?
            AND TBR.STREATIVADO = 'False'
            AND TBR.STCANCELADO = 'False'
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    pStmtInsert.setInt(1, idResumoPedido);
    
    pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
	
    return Number(queryId);
}

function gerarDetalhePedido(idResumoPedido, idPedidoNovo, vrTaxa){
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
            IDDETALHEPEDIDOPRIMARIO
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
            (B.VRCUSTO * ${vrTaxa}) AS VRUNITBRUTO,
            A.DESC01,
            A.DESC02,
            A.DESC03,
            (B.VRCUSTO * ${vrTaxa}) AS VRUNITLIQUIDO,
            B.VRVENDA,
            (B.VRTOTALCUSTO * ${vrTaxa}) AS VRTOTAL,
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
            REPLACE(B.IDPRODCADASTRO, '_RN', '') AS IDPRODUTO,
            A.DTATUALIZACAO,
            A.IDRESPATUALIZACAO,
            A.IDRESPCADASTRO,
            A.DTCADASTRO,
            A.IDRESPAUTORIZAEDITCAD,
            A.IDDETALHEPEDIDO AS IDDETALHEPEDIDOPRIMARIO
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO A
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO B ON 
            A.IDDETALHEPEDIDO = B.IDDETALHEPEDIDO
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO C ON 
            A.IDRESUMOPEDIDO = C.IDRESUMOPEDIDO
        WHERE 
            A.DTCANCELAMENTO IS NULL
            AND C.IDRESUMOPEDIDOORIGEM = ?
            AND C.STREATIVADO = 'False'
            AND C.STCANCELADO = 'False'
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
            TBD.IDDETALHEPEDIDO,
            TBDPP.IDTAMANHO,
            1 AS INDICETAMANHO,
            TBDPP.QTDPRODUTO AS QTD,
            'True' AS STATIVO
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON
            TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDPP ON 
            TBD.IDDETALHEPEDIDOPRIMARIO = TBDPP.IDDETALHEPEDIDO
        WHERE 
            TBR.IDRESUMOPEDIDO = ?
	`;

	let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
	
	pStmtInsert.setInt(1, idPedidoNovo);
	
	pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
}

function gerarDetalheProdutoPedido(idPedidoNovo, vrTaxa) {
    
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
            IDDETALHEPRODUTOPEDIDOPRIMARIO
        )
        SELECT 
            TBD.IDRESUMOPEDIDO,
            TBD.IDDETALHEPEDIDO,
            TBDPP.IDGRUPOESTRUTURA,
            TBDPP.IDSUBGRUPOESTRUTURA,
            TBDPP.IDCOR,
            TBDPP.IDTAMANHO,
            TBDPP.DSTAMANHO,
            TBDPP.IDCATEGORIAPEDIDO,
            TBDPP.IDTIPOTECIDO,
            TBDPP.IDESTILO,
            TBDPP.IDFABRICANTE,
            TBDPP.IDLOCALEXPOSICAO,
            TBDPP.IDCATEGORIAS,
            TBDPP.IDNCM,
            TBDPP.NUNCM,
            TBDPP.IDCEST,
            TBDPP.NUCEST,
            TBDPP.IDTIPOPRODUTOFISCAL,
            TBDPP.IDFONTEPRODUTOFISAL,
            REPLACE(TBDPP."IDPRODCADASTRO", '_RN', '') AS IDPRODCADASTRO,
            TBDPP.NUREF,
            TBDPP.CODBARRAS,
            TBDPP.DSPRODUTO,
            TBDPP.QTDPRODUTO,
            TBDPP.UND,
            (TBDPP.VRCUSTO * ${vrTaxa}) AS VRCUSTO,
            TBDPP.VRVENDA,
            (TBDPP.VRTOTALCUSTO * ${vrTaxa}) AS VRTOTALCUSTO,
            TBDPP.VRTOTALVENDA,
            TBDPP.DTCADASTRO,
            TBDPP.DTULTATUALIZACAO,
            TBDPP.STCADASTRADO,
            TBDPP.STRECEBIDO,
            TBDPP.OBSREF,
            TBDPP.IDDETALHEENTRADA,
            TBDPP.NUNF,
            TBDPP.QTDENTRADANF,
            TBDPP.DTENTRADANF,
            TBDPP.STECOMMERCE,
            TBDPP.STREDESOCIAL,
            'True' AS STATIVO,
            'False' AS STCANCELADO,
            TBDPP.QTDESTOQUEIDEAL,
            'False' AS STMIGRADOSAP,
            TBDPP.STAVULSO,
            TBDPP.IDGRUPOEMPRESARIAL,
            TBDPP.IDFORNECEDOR,
            NULL AS IDRESPCANCELAMENTO,
            NULL AS TXTOBSCANCELAMENTO,
            'True' AS STREPOSICAO,
            TBDPP.STVINCPRODPEDSAP,
            TBDPP.STEDITADOCOMPRAS,
            TBDPP.DTCANCELAMENTO,
            TBDPP.IDRESPCADASTRO,
            TBDPP.IDRESPATUALIZACAO,
            TBDPP.IDRESPAUTORIZAEDITCAD,
            TBDPP.IDDETALHEPRODUTOPEDIDO AS IDDETALHEPRODUTOPEDIDOPRIMARIO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON 
            TBR.IDRESUMOPEDIDO = TBD.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDPP ON 
            TBD.IDDETALHEPEDIDOPRIMARIO = TBDPP.IDDETALHEPEDIDO
        WHERE
            TBR.IDRESUMOPEDIDO = ?
	`;

	let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
	
	pStmtInsert.setInt(1, idPedidoNovo);

	pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
}

function validarSeExistePedidosSecundarioCriado(idResumoPedidoParaTransformar){
    let query = `
        SELECT 
            TBR.IDRESUMOPEDIDO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR_PRIMARIO ON 
            TBR.IDPEDIDOPRIMARIO = TBR_PRIMARIO.IDRESUMOPEDIDO
        WHERE 
            TBR_PRIMARIO.IDRESUMOPEDIDOORIGEM = ?
    `;
    
    let reg = api.sqlQuery(query, idResumoPedidoParaTransformar);
    
    return reg.length > 0 ? Number(reg[0].IDRESUMOPEDIDO) : 0;
}

function criarPedidoSecundario(idResumoPedidoParaTransformar) {
    conn = $.db.getConnection();
    
    try{
        
        let idResumoPedidoCriado = validarSeExistePedidosSecundarioCriado(idResumoPedidoParaTransformar);
        
        if(idResumoPedidoCriado > 0){
            return updateLogSuccess(idResumoPedidoParaTransformar);
        }
        
        let vrTaxa = getValorTaxa();
        
        let idResumoPedidoNovo = gerarResumoPedido(idResumoPedidoParaTransformar, vrTaxa);
        
        gerarDetalhePedido(idResumoPedidoParaTransformar, idResumoPedidoNovo, vrTaxa);
        
        gerarDetalhePedidoGrade(idResumoPedidoNovo);
        
        gerarDetalheProdutoPedido(idResumoPedidoNovo, vrTaxa);
        
        atualizarDetalhePedidoPrimario(idResumoPedidoParaTransformar);
        
        atualizarDetalheProdutoPedidoPrimario(idResumoPedidoParaTransformar);
        
        conn.commit();
        
        updateLogSuccess(idResumoPedidoParaTransformar);
    } catch(error){
        updateLogError(idResumoPedidoParaTransformar, (error.message || 'Erro ao criar o pedido primario'));
        
        throw error;
    }
}