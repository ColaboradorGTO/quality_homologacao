var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

let dbNameSap = 'SBO_GTO_TESTE4';
let conn;

function validarSePedidoEstaCanceladoSAP(idResumoPedido){
    let query = `
        SELECT
            TBR."IDRESUMOPEDIDO",
            TBO."CANCELED"
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN ${dbNameSap}.OPOR TBO ON 
            (
                TO_VARCHAR(TBR."IDRESUMOPEDIDO") = TBO."NumAtCard" OR
                TO_VARCHAR(TBR."IDRESUMOPEDIDO") = TBO."U_ID_VENDA_PDV" OR
                TBO."DocEntry" = TBR."DOCENTRY_PEDIDO_SAP"
            ) AND TBO.CANCELED = 'Y'
        WHERE 
            TBR.STCANCELADO = 'True'
            AND TBR.STMIGRADOSAP = 'True'
            AND TBR.IDRESUMOPEDIDO = ?
    `;
    
    let regExistPedidoSap = api.sqlQuery(query, idResumoPedido) || [];
    
    return (regExistPedidoSap.length > 0);
}

function getIdResumoPedidoSecundario(idResumoPedido){
    let idResumoPedidoSecundario = 0;
    
    let query = `
        SELECT
            "IDRESUMOPEDIDO"
        FROM
            "VAR_DB_NAME"."RESUMOPEDIDO"
        WHERE 
            "IDPEDIDOPRIMARIO" = ?
    `;
    
    let regResumo = api.sqlQuery(query, idResumoPedido);
    
    if(regResumo.length > 0){
        idResumoPedidoSecundario = Number(regResumo[0].IDRESUMOPEDIDO);
    }
    
    return idResumoPedidoSecundario;
}

function getValoresPedido(idResumoPedido){
    let dados = {
        TOTALITENS: 0,
        QTDTOTPRODUTOS: 0,
        VRTOTAL: 0
    };
    
    let query = `
        SELECT 
            IFNULL(COUNT(DETPED.IDDETALHEPEDIDO),0) TOTALITENS,
            IFNULL(SUM(DETPED.QTDTOTAL),0) QTDTOTPRODUTOS,
            IFNULL(SUM(DETPED.VRTOTAL),0) VRTOTAL
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO  DETPED 
        WHERE 
            DETPED.DTCANCELAMENTO IS NULL 
            AND DETPED.IDRESUMOPEDIDO = ?
    `;
    
    let reg = api.sqlQuery(query, idResumoPedido);
    
    if(reg.length > 0){
        dados.TOTALITENS = parseInt(reg[0].TOTALITENS);
        dados.QTDTOTPRODUTOS = parseFloat(reg[0].QTDTOTPRODUTOS);
        dados.VRTOTAL = parseFloat(reg[0].VRTOTAL);
    }
    
    return dados;
}

function atualizarResumoPedido(idResumoPedido, dadosPedido){
    let {
        IDRESPREATIVACAO,
        TXTMOTIVOREATIVACAO
    } = dadosPedido;
    
    let queryUpdateResumo = `
            UPDATE 
                "VAR_DB_NAME"."RESUMOPEDIDO" 
            SET
                "DTMOVPEDIDO" = now(),
                "DTREATIVACAO" = now(),
                "STREATIVADO" = 'True',
                "IDRESPREATIVACAO" = ?,
                "TXTMOTIVOREATIVACAO" = ?
            WHERE 
                "IDRESUMOPEDIDO" =  ? 
        `;
        
        let pStmtUpdateResumo = conn.prepareStatement(api.replaceDbName(queryUpdateResumo));
        
        pStmtUpdateResumo.setInt(1, IDRESPREATIVACAO);
        pStmtUpdateResumo.setString(2, TXTMOTIVOREATIVACAO);
        pStmtUpdateResumo.setInt(3, idResumoPedido);
        
        pStmtUpdateResumo.execute();
        pStmtUpdateResumo.close();
}

function atualizarValoresResumoPedido(idPedidoNovo){
    let querydetpedido = `
        SELECT 
            IFNULL(COUNT(DETPED.IDDETALHEPEDIDO),0) TOTALITENS, 
            IFNULL(SUM(DETPED.QTDTOTAL),0) QTDTOTAL, 
            IFNULL(SUM(DETPED.VRTOTAL),0) VRTOTAL
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO  DETPED
        WHERE
            DETPED."STCANCELADO"= 'False' AND 
            DETPED.IDRESUMOPEDIDO = ?  
    `;
        
    let regDetalhes = api.sqlQuery(querydetpedido, idPedidoNovo);
    let det = regDetalhes[0];
           
    let queryUpdate = `
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
    
    var pStmt = conn.prepareStatement(api.replaceDbName(query2));
    
    pStmt.setInt(1, parseInt(det2.TOTALITENS));
    pStmt.setFloat(2, parseFloat(det2.QTDTOTAL));
    pStmt.setFloat(3, parseFloat(det2.VRTOTAL));
    pStmt.setFloat(4, parseFloat(det2.VRTOTAL));
    pStmt.setInt(5, parseInt(idPedidoNovo));
    
    pStmt.execute();
    pStmt.close();
    
    conn.commit();
}

function gerarDetalheProdutoPedidoQuandoPedidoIntermediario(idPedidoNovo) {
    
	let queryInsert = `
        INSERT INTO "VAR_DB_NAME".DETALHEPRODUTOPEDIDO
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
            A.IDRESPCANCELAMENTO,
            A.TXTOBSCANCELAMENTO,
            CASE 
                WHEN A.STMIGRADOSAP = 'False' 
                    THEN A.STREPOSICAO
                ELSE A.STMIGRADOSAP
            END AS STREPOSICAO,
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
            A.IDDETALHEPEDIDO = B.IDDETALHEPEDIDOORIGEM AND B.DTCANCELAMENTO IS NULL
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

function gerarDetalhePedidoGradeQuandoMigradoSAP(idPedidoNovo) {
	let queryInsert = `
        INSERT INTO "VAR_DB_NAME".DETALHEPEDIDOGRADE
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

function gerarDetalhePedidoGradeQuandoPedidoIntermediario(idPedidoNovo) {
	let queryInsert = `
        INSERT INTO "VAR_DB_NAME".DETALHEPEDIDOGRADE
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
            C.INDICETAMANHO,
            C.QTD,
            'True' AS STATIVO
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO A
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO B ON
            A.IDRESUMOPEDIDOORIGEM = B.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE C ON 
            B.IDDETALHEPEDIDO = C.IDDETALHEPEDIDO AND C.STCANCELADO = 'True'
       	INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO D ON  
            A.IDRESUMOPEDIDO = D.IDRESUMOPEDIDO AND D.IDDETALHEPEDIDOORIGEM = B.IDDETALHEPEDIDO AND D.DTCANCELAMENTO IS NULL
        WHERE
            B.DTCANCELAMENTO IS NULL
            AND A.IDRESUMOPEDIDO = ?
	`;

	let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
	
	pStmtInsert.setInt(1, idPedidoNovo);
	pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
	
	gerarDetalheProdutoPedidoQuandoPedidoIntermediario(idPedidoNovo)
}

function gerarDetalhePedidoQuandoMigradoSAP(idResumoPedido, idPedidoNovo){
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
                IDDETALHEPEDIDOORIGEM,
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
                A.VRUNITBRUTO,
                A.DESC01,
                A.DESC02,
                A.DESC03,
                A.VRUNITLIQUIDO,
                A.VRVENDA,
                B.VRTOTALCUSTO AS VRTOTAL,
                A.STRECEBIDO,
                A.STECOMMERCE,
                A.STREDESOCIAL,
                'False' AS STCANCELADO,
                'False' AS STTRANSFORMADO,
                A.VRCUSTOPRODATUAL,
                A.VRVENDAPRODATUAL,
                A.OBSPRODUTO,
                A.IDCATEGORIAS,
                A.IDRESPCANCELAMENTO,
                A.TXTOBSCANCELAMENTO,
                'True' AS STREPOSICAO,
                IFNULL(TBDP_SECUNDARIO.CODBARRAS, B.CODBARRAS) AS NUCODBARRAS,
                A.DTCANCELAMENTO,
                IFNULL(TBDP_SECUNDARIO.IDPRODCADASTRO, B.IDPRODCADASTRO) AS IDPRODUTO,
                A.DTATUALIZACAO,
                A.IDRESPATUALIZACAO,
                A.IDRESPCADASTRO,
                A.DTCADASTRO,
                A.IDRESPAUTORIZAEDITCAD,
                A.IDDETALHEPEDIDO AS IDDETALHEPEDIDOORIGEM,
                C.IDDETALHEPEDIDO AS IDDETALHEPEDIDOPRIMARIO 
            FROM 
                "VAR_DB_NAME".DETALHEPEDIDO A
            INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO B ON 
                A.IDDETALHEPEDIDO = B.IDDETALHEPEDIDO
            LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO C ON
                A.IDDETALHEPEDIDOPRIMARIO = C.IDDETALHEPEDIDOORIGEM AND C.DTCANCELAMENTO IS NULL
            LEFT JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP_SECUNDARIO ON 
            	B.IDDETALHEPRODUTOPEDIDO = TBDP_SECUNDARIO.IDDETALHEPRODUTOPEDIDOPRIMARIO
            WHERE 
                A.DTCANCELAMENTO IS NULL
                AND A.IDRESUMOPEDIDO = ?
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    pStmtInsert.setInt(1, idResumoPedido);
    
    pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
    
    gerarDetalhePedidoGradeQuandoMigradoSAP(idPedidoNovo);
}

function gerarDetalhePedidoQuandoPedidoIntermediario(idResumoPedido, idPedidoNovo){
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
                A.NUREF,
                A.DSPRODUTO,
                A.QTDTOTAL,
                A.NUCAIXA,
                A.UND,
                A.VRUNITBRUTO,
                A.DESC01,
                A.DESC02,
                A.DESC03,
                A.VRUNITLIQUIDO,
                A.VRVENDA,
                A.VRTOTAL,
                A.STRECEBIDO,
                A.STECOMMERCE,
                A.STREDESOCIAL,
                'False' AS STCANCELADO,
                A.STTRANSFORMADO AS STTRANSFORMADO,
                A.VRCUSTOPRODATUAL,
                A.VRVENDAPRODATUAL,
                A.OBSPRODUTO,
                A.IDCATEGORIAS,
                NULL AS IDRESPCANCELAMENTO,
                NULL AS TXTOBSCANCELAMENTO,
                A.STREPOSICAO,
                A.NUCODBARRAS,
                A.DTCANCELAMENTO,
                A.IDPRODUTO,
                A.DTATUALIZACAO,
                A.IDRESPATUALIZACAO,
                A.IDRESPCADASTRO,
                A.DTCADASTRO,
                A.IDRESPAUTORIZAEDITCAD,
                A.IDDETALHEPEDIDO AS IDDETALHEPEDIDOORIGEM
            FROM 
                "VAR_DB_NAME".DETALHEPEDIDO A
            WHERE 
                A.DTCANCELAMENTO IS NULL
                AND A.IDRESUMOPEDIDO = ?
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    pStmtInsert.setInt(1, idResumoPedido);
    
    pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
    
    gerarDetalhePedidoGradeQuandoPedidoIntermediario(idPedidoNovo);
}

function gerarResumoPedido(idResumoPedido, dadosPedido, stPedidoPrimario = false){
    let dadosValoresPedido = getValoresPedido(idResumoPedido);
    
    let {
        IDRESPREATIVACAO,
        TXTMOTIVOREATIVACAO
    } = dadosPedido;
    
    let queryId = api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_RESUMOPEDIDO".NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
    
    let queryInsert = `
        INSERT INTO "VAR_DB_NAME".RESUMOPEDIDO
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
                DTREATIVACAO
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
            6 AS IDANDAMENTO,
            TBR.TPCATEGORIAPEDIDO,
            TBR.MODPEDIDO,
            TBR.TPFORNECEDOR,
            TBR.NOVENDEDOR,
            TBR.EEMAILVENDEDOR,
            TBR.DTPEDIDO,
            TBR.DTPREVENTREGA,
            TBR.TPFRETE,
            ${dadosValoresPedido.TOTALITENS} AS NUTOTALITENS,
            ${dadosValoresPedido.QTDTOTPRODUTOS} AS QTDTOTPRODUTOS,
            ${dadosValoresPedido.VRTOTAL} AS VRTOTALBRUTO,
            ${dadosValoresPedido.VRTOTAL} AS VRTOTALLIQUIDO,
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
            TBR.TXTOBSDEVPEDIDO,
            TBR.OBSPEDIDO_1,
            TBR.OBSPEDIDO_2,
            TBR.DTMOVPEDIDO,
            TBR.OBSPEDIDO,
            TBR.OBSPEDIDO2,
            TBR.STRASCUNHO,
            NULL AS LOGSAP,
            TBR.IDRESUMOPEDIDO AS IDRESUMOPEDIDOORIGEM,
            ${IDRESPREATIVACAO} AS IDRESPREATIVACAO,
            '${TXTMOTIVOREATIVACAO}' AS TXTMOTIVOREATIVACAO,
            CURRENT_TIMESTAMP AS DTREATIVACAO
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
	
	if(stPedidoPrimario){
        gerarDetalhePedidoQuandoPedidoIntermediario(idResumoPedido, queryId);
	} else {
        gerarDetalhePedidoQuandoMigradoSAP(idResumoPedido, queryId);
    }   
}

function fnReativarDetalheProdutoPedido(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO
        SET 
            STATIVO = 'True', 
            STCANCELADO = 'False',
            IDPRODCADASTRO = REPLACE(IDPRODCADASTRO, '_RN', '')
        WHERE 
            IDDETALHEPEDIDO IN (
                SELECT
                    TBDP.IDDETALHEPEDIDO
                FROM 
                    "VAR_DB_NAME".DETALHEPEDIDO AS TBDP
                WHERE
                    TBDP.DTCANCELAMENTO IS NULL
                    AND TBDP.IDRESUMOPEDIDO = ?
            )
            AND DTCANCELAMENTO IS NULL
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoPedido);
    
    pStmt.execute();
    pStmt.close();
}

function fnReativarDetalheGradePedido(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE
        SET 
            STATIVO = 'True',
            STCANCELADO = 'False'
        WHERE 
            IDDETALHEPEDIDO IN (
                SELECT
                    TBDP.IDDETALHEPEDIDO 
                FROM 
                    "VAR_DB_NAME".DETALHEPEDIDO AS TBDP
                WHERE
                    TBDP.DTCANCELAMENTO IS NULL
                    AND TBDP.IDRESUMOPEDIDO = ?
            )
            AND STCANCELADO = 'True'
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoPedido);
    
    pStmt.execute();
    pStmt.close();
}

function fnReativarDetalhePedido(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDO 
        SET 
            STCANCELADO = 'False' 
        WHERE 
            DTCANCELAMENTO IS NULL
            AND IDRESUMOPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoPedido);
    
    pStmt.execute();
    pStmt.close();
}

function fnReativarPedidoNaoMigrado(idResumoPedido, registro, stPedidoPrimario = false) {
    if(!stPedidoPrimario){
        let dadosValoresPedido = getValoresPedido(idResumoPedido);
        
        let queryUpdateResumo = `
            UPDATE 
                "VAR_DB_NAME"."RESUMOPEDIDO" 
            SET
                "IDANDAMENTO" = 6, 
                "STCANCELADO" = 'False',
                "DTMOVPEDIDO" = now(),
                "DTREATIVACAO" = now(),
                "NUTOTALITENS" = ?,
                "QTDTOTPRODUTOS" = ?,
                "VRTOTALBRUTO" = ?,
                "VRTOTALLIQUIDO" = ?,
                "IDRESPREATIVACAO" = ?,
                "TXTMOTIVOREATIVACAO" = ?,
                "STPEDIDOPRIMARIO" = 'False'
            WHERE 
                "IDRESUMOPEDIDO" =  ? 
        `;
        
        let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdateResumo));
        
        pStmt.setInt(1, dadosValoresPedido.TOTALITENS);
        pStmt.setFloat(2, dadosValoresPedido.QTDTOTPRODUTOS);
        pStmt.setFloat(3, dadosValoresPedido.VRTOTAL);
        pStmt.setFloat(4, dadosValoresPedido.VRTOTAL);
        pStmt.setInt(5, registro.IDRESPREATIVACAO);
        pStmt.setString(6, registro.TXTMOTIVOREATIVACAO);
        pStmt.setInt(7, registro.IDRESUMOPEDIDO);
        
        pStmt.execute();
        pStmt.close();
        
        fnReativarDetalhePedido(idResumoPedido);
        
        fnReativarDetalheGradePedido(idResumoPedido);
        
        fnReativarDetalheProdutoPedido(idResumoPedido);
    } else {
        gerarResumoPedido(idResumoPedido, registro, stPedidoPrimario);
    }
}

function fnGerarDadosPedidoMigrado(idResumoPedido, dadosPedido){
    gerarResumoPedido(idResumoPedido, dadosPedido);
    atualizarResumoPedido(idResumoPedido, dadosPedido);
}

function fnHandlePut() {
    let registro = JSON.parse($.request.body.asString());
    let idResumoPedido = Number(registro.IDRESUMOPEDIDO);
    let idResumoPedidoSecundario = getIdResumoPedidoSecundario(idResumoPedido);
    let stCanceladoSAP = validarSePedidoEstaCanceladoSAP(idResumoPedido);
    let stPedidoPrimario = idResumoPedidoSecundario > 0;
    
    conn = $.db.getConnection();

    if(stCanceladoSAP){
       fnGerarDadosPedidoMigrado(idResumoPedido, registro);
       atualizarResumoPedido(idResumoPedido, registro);
       
       /*if( idResumoPedidoSecundario ){
            fnGerarDadosPedidoMigrado(idResumoPedidoSecundario, registro);
       }*/
    } else {
        fnReativarPedidoNaoMigrado(idResumoPedido, registro, stPedidoPrimario);
        atualizarResumoPedido(idResumoPedido, registro);
        
        /*if(idResumoPedidoSecundario){
            fnReativarPedidoNaoMigrado(idResumoPedidoSecundario, registro);
        }*/
    }    
    
    conn.commit();
    
    return {
        msg: 'Atualização Realizada Com Sucesso!'
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
        default:
            break;
    }
    
} catch(e) {
    var detalheError = e.stack ? e.stack.split('\n') : '';
    
    detalheError = detalheError ? detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim() : '';
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    conn && conn.rollback();
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message || e,
        detalheError
    }));
    $.response.status = 400;
}