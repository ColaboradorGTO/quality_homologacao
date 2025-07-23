var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

let dbNameSap = 'SBO_GTO_TESTE4';
let conn;

function atualizarResumoPedido(dadosPedido, conn){
    let {
        IDRESUMOPEDIDO,
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
        pStmtUpdateResumo.setInt(3, IDRESUMOPEDIDO);
        
        pStmtUpdateResumo.execute();
        pStmtUpdateResumo.close();
}

function atualizarValoresResumoPedido(idPedidoNovo, conn){
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

function gerarDetalheProdutoPedido(idPedidoNovo, conn) {
    
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
                'True' AS STATIVO,
                'False' AS STCANCELADO,
                QTDESTOQUEIDEAL,
                'False' AS STMIGRADOSAP,
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
            A.IDPRODCADASTRO,
            A.NUREF,
            A.CODBARRAS,
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
            A.STATIVO,
            A.STCANCELADO,
            A.QTDESTOQUEIDEAL,
            A.STMIGRADOSAP,
            A.STAVULSO,
            A.IDGRUPOEMPRESARIAL,
            A.IDFORNECEDOR,
            A.IDRESPCANCELAMENTO,
            A.TXTOBSCANCELAMENTO,
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
            A.IDDETALHEPEDIDO = B.IDDETALHEPEDIDOORIGEM
        WHERE 
            B.IDRESUMOPEDIDO = ?
	`;

	let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
	
	pStmtInsert.setInt(1, idPedidoNovo);
	pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
}

function gerarDetalhePedidoGrade(idPedidoNovo, conn) {
    
	let queryInsert = `
        INSERT INTO "VAR_DB_NAME".DETALHEPEDIDOGRADE
            (
                IDDETALHEPEDIDO,
                IDTAMANHO,
                INDICETAMANHO,
                QTD,
                STATIVO
            )
        SELECT
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
            B.IDDETALHEPEDIDO = C.IDDETALHEPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO D ON  
            A.IDRESUMOPEDIDO = D.IDRESUMOPEDIDO AND C.IDPRODCADASTRO = D.IDPRODUTO 
        WHERE 
            A.IDRESUMOPEDIDO = ?
	`;

	let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
	
	pStmtInsert.setInt(1, idPedidoNovo);
	pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
}

function gerarDetalhePedido(idPedidoOrigem, idPedidoNovo, conn){
    
    let queryInsert = `
        INSERT INTO "VAR_DB_NAME".DETALHEPEDIDO
            (
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
                B.CODBARRAS AS NUCODBARRAS,
                A.DTCANCELAMENTO,
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
    
    pStmtInsert.setInt(1, idPedidoOrigem);
    pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
    
    gerarDetalhePedidoGrade(idPedidoNovo, conn);
}

function gerarResumoPedido(dadosPedido, conn){
    let {
        IDRESUMOPEDIDO,
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
                DESCPERC01,
                DESCPERC02,
                DESCPERC03,
                PERCCOMISSAO,
                VRTOTALLIQUIDO,
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
            IDGRUPOEMPRESARIAL,
            IDSUBGRUPOEMPRESARIAL,
            IDEMPRESA,
            IDCOMPRADOR,
            IDCONDICAOPAGAMENTO,
            IDFORNECEDOR,
            IDTRANSPORTADORA,
            6 AS IDANDAMENTO,
            TPCATEGORIAPEDIDO,
            MODPEDIDO,
            TPFORNECEDOR,
            NOVENDEDOR,
            EEMAILVENDEDOR,
            DTPEDIDO,
            DTPREVENTREGA,
            TPFRETE,
            (SELECT IFNULL(COUNT(DETPED.IDDETALHEPEDIDO),0) TOTALITENS FROM "VAR_DB_NAME".DETALHEPEDIDO  DETPED WHERE DETPED.DTCANCELAMENTO IS NULL AND  DETPED.IDRESUMOPEDIDO = ${IDRESUMOPEDIDO}) AS NUTOTALITENS,
            (SELECT IFNULL(SUM(DETPED.QTDTOTAL),0) QTDTOTAL FROM "VAR_DB_NAME".DETALHEPEDIDO  DETPED WHERE DETPED.DTCANCELAMENTO IS NULL AND  DETPED.IDRESUMOPEDIDO = ${IDRESUMOPEDIDO}) AS QTDTOTPRODUTOS,
            (SELECT IFNULL(SUM(DETPED.VRTOTAL),0) VRTOTAL FROM "VAR_DB_NAME".DETALHEPEDIDO  DETPED WHERE DETPED.DTCANCELAMENTO IS NULL AND  DETPED.IDRESUMOPEDIDO = ${IDRESUMOPEDIDO}) AS VRTOTALBRUTO,
            DESCPERC01,
            DESCPERC02,
            DESCPERC03,
            PERCCOMISSAO,
            (SELECT IFNULL(SUM(DETPED.VRTOTAL),0) VRTOTAL FROM "VAR_DB_NAME".DETALHEPEDIDO  DETPED WHERE DETPED.DTCANCELAMENTO IS NULL AND  DETPED.IDRESUMOPEDIDO = ${IDRESUMOPEDIDO}) AS VRTOTALLIQUIDO,
            NULL AS DTFECHAMENTOPEDIDO,
            DTCADASTRO,
            NULL AS IDRESPCANCELAMENTO,
            NULL AS DSMOTIVOCANCELAMENTO,
            NULL AS DTCANCELAMENTO,
            TPARQUIVO,
            NULL  AS DTRECEBIMENTOPEDIDO,
            STDISTRIBUIDO,
            STAGRUPAPRODUTO,
            'False' AS STCANCELADO,
            TPFISCAL,
            VRCOMISSAO,
            'False' AS STMIGRADOSAP,
            TXTOBSDEVPEDIDO,
            OBSPEDIDO_1,
            OBSPEDIDO_2,
            DTMOVPEDIDO,
            OBSPEDIDO,
            OBSPEDIDO2,
            STRASCUNHO,
            LOGSAP,
            IDRESUMOPEDIDO AS IDRESUMOPEDIDOORIGEM,
            ${IDRESPREATIVACAO} AS IDRESPREATIVACAO,
            '${TXTMOTIVOREATIVACAO}' AS TXTMOTIVOREATIVACAO,
            CURRENT_TIMESTAMP AS DTREATIVACAO
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    pStmtInsert.setInt(1, IDRESUMOPEDIDO);
    pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
	
	gerarDetalhePedido(IDRESUMOPEDIDO, queryId, conn);
}

function validarDadosPedidoSAP(idPedidoOrigem){
    let query = `
        SELECT
            TBR.IDRESUMOPEDIDO,
            TBO.CANCELED
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN ${dbNameSap}.OPOR TBO ON 
            TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO."NumAtCard" OR TO_VARCHAR(TBR.IDRESUMOPEDIDO) = TBO.U_ID_VENDA_PDV
        WHERE 
            TBR.STCANCELADO = 'True'
            AND TBR.STMIGRADOSAP = 'True'
            AND TBR.IDRESUMOPEDIDO = ?
    `;
    
    let regExistPedidoSap = api.sqlQuery(query, idPedidoOrigem);
    
    let stPedidoSap = false;
    
    if(regExistPedidoSap.length > 0){
        for(let { CANCELED } of regExistPedidoSap){
            if(CANCELED == 'Y'){
                stPedidoSap = true;
                
                break;
            }
        }
    }
    
   // return {regExistPedidoSap} 
    return stPedidoSap;
}

function fnHandlePut() {
    let IdResumoPedido = '';
    let registro = JSON.parse($.request.body.asString()); 
    
    conn = $.db.getConnection();

    if(validarDadosPedidoSAP(registro.IDRESUMOPEDIDO)){
       gerarResumoPedido(registro, conn);
       atualizarResumoPedido(registro, conn);
    } else {
        
        let queryUpdateResumo = `
            UPDATE 
                "VAR_DB_NAME"."RESUMOPEDIDO" 
            SET
                "IDANDAMENTO" = 6, 
                "STCANCELADO" = 'False',
                "DTMOVPEDIDO" = now(),
                "DTREATIVACAO" = now(),
                "NUTOTALITENS" = (SELECT IFNULL(COUNT(DETPED.IDDETALHEPEDIDO),0) TOTALITENS FROM "VAR_DB_NAME".DETALHEPEDIDO  DETPED WHERE DETPED.DTCANCELAMENTO IS NULL AND  DETPED.IDRESUMOPEDIDO = ${registro.IDRESUMOPEDIDO}),
                "QTDTOTPRODUTOS" = (SELECT IFNULL(SUM(DETPED.QTDTOTAL),0) QTDTOTAL FROM "VAR_DB_NAME".DETALHEPEDIDO  DETPED WHERE DETPED.DTCANCELAMENTO IS NULL AND  DETPED.IDRESUMOPEDIDO = ${registro.IDRESUMOPEDIDO}),
                "VRTOTALBRUTO" = (SELECT IFNULL(SUM(DETPED.VRTOTAL),0) VRTOTAL FROM "VAR_DB_NAME".DETALHEPEDIDO  DETPED WHERE DETPED.DTCANCELAMENTO IS NULL AND  DETPED.IDRESUMOPEDIDO = ${registro.IDRESUMOPEDIDO}),
                "VRTOTALLIQUIDO" = (SELECT IFNULL(SUM(DETPED.VRTOTAL),0) VRTOTAL FROM "VAR_DB_NAME".DETALHEPEDIDO  DETPED WHERE DETPED.DTCANCELAMENTO IS NULL AND  DETPED.IDRESUMOPEDIDO = ${registro.IDRESUMOPEDIDO}),
                "IDRESPREATIVACAO" = ?,
                "TXTMOTIVOREATIVACAO" = ?
            WHERE 
                "IDRESUMOPEDIDO" =  ? 
        `;
        
        let pStmtUpdateResumo = conn.prepareStatement(api.replaceDbName(queryUpdateResumo));
        
        pStmtUpdateResumo.setInt(1, registro.IDRESPREATIVACAO);
        pStmtUpdateResumo.setString(2, registro.TXTMOTIVOREATIVACAO);
        pStmtUpdateResumo.setInt(3, registro.IDRESUMOPEDIDO);
        
        pStmtUpdateResumo.execute();
        pStmtUpdateResumo.close();
        
        let queryUpdateDetalhe = `
            UPDATE 
                "VAR_DB_NAME".DETALHEPEDIDO 
            SET 
                STCANCELADO = 'False' 
            WHERE 
                DTCANCELAMENTO IS NULL
                AND IDRESUMOPEDIDO = ?
        `;
        
        let pStmtUpdateDetalhe = conn.prepareStatement(api.replaceDbName(queryUpdateDetalhe));
        
        pStmtUpdateDetalhe.setInt(1, registro.IDRESUMOPEDIDO);
        pStmtUpdateDetalhe.execute();
        pStmtUpdateDetalhe.close();
        
        let queryUpdateDetGrade = `
            UPDATE 
                "VAR_DB_NAME".DETALHEPEDIDOGRADE
            SET 
                STATIVO = 'True'
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
        `;
        
        let pStmtUpdateDetGrade = conn.prepareStatement(api.replaceDbName(queryUpdateDetGrade));
        
        pStmtUpdateDetGrade.setInt(1, registro.IDRESUMOPEDIDO);
        pStmtUpdateDetGrade.execute();
        pStmtUpdateDetGrade.close();
        
        let queryUpdateDetProdPedido = `
            UPDATE 
                "VAR_DB_NAME".DETALHEPRODUTOPEDIDO
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
        `;
        
        let pStmtUpdateDetProdPedido = conn.prepareStatement(api.replaceDbName(queryUpdateDetProdPedido));
        
        pStmtUpdateDetProdPedido.setInt(1, registro.IDRESUMOPEDIDO);
        pStmtUpdateDetProdPedido.execute();
        pStmtUpdateDetProdPedido.close();
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
    /*
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;*/
}