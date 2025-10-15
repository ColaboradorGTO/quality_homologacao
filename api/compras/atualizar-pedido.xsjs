var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

let conn;

function getDadosPedidoSecundario(idResumoPedido){
    let query = `
        SELECT 
            IDRESUMOPEDIDO
        FROM 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        WHERE
            IDPEDIDOPRIMARIO = ?
    `;
    
    let reg = api.sqlQuery(query, idResumoPedido);
    
    return (reg.length > 0);
}

function getValorTaxaAcrescimo(){
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
    let dados = '';
    
    let query = `
        SELECT 
            IFNULL(COUNT(TBD.IDDETALHEPEDIDO),0) AS TOTALITENS,
            IFNULL(SUM(TBD.QTDTOTAL),0) AS QTDTOTPRODUTOS,
            IFNULL(SUM(TBD.VRTOTAL),0) AS VRTOTAL
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO  TBD
        WHERE 
            TBD.DTCANCELAMENTO IS NULL 
            AND TBD.IDRESUMOPEDIDO = ?
    `;
    
    let reg = api.sqlQuery(query, idResumoPedido);
    
    if(reg.length > 0){
        dados = reg[0];
    }
    
    return dados;
}

function updateDetalheProdutoPedidoPrimario(idResumoPedido, registro){
    var query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" 
        SET 
            "STMIGRADOSAP" = 'False', 
            "STREPOSICAO" = STMIGRADOSAP,
            "CODBARRAS" = 'SEM GTIN',
            "IDPRODCADASTRO" =  CASE 
                                    WHEN IFNULL("IDPRODCADASTRO", 'NULL') <> 'NULL' 
                                        THEN (REPLACE("IDPRODCADASTRO", '_RN', '') || '_RN')
                                    ELSE IDPRODCADASTRO
                                END
        WHERE 
            "IDRESUMOPEDIDO" =  ?
    `; 

    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, idResumoPedido);

	pStmt.execute();
    
	pStmt.close();
	
	conn.commit();
	
	updateResumoPedidoSecundario(registro);
}

function fnCriarDetalheProdutoPedidoSecundario(idPedidoNovo, registro){
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO"  
		(
            "IDDETALHEPEDIDO", 
            "IDSUBGRUPOESTRUTURA", 
            "IDCOR", 
            "IDTAMANHO", 
            "DSTAMANHO", 
            "IDCATEGORIAPEDIDO", 
            "IDTIPOTECIDO", 
            "IDESTILO", 
            "IDFABRICANTE", 
            "IDLOCALEXPOSICAO", 
            "IDCATEGORIAS", 
            "IDNCM", 
            "NUNCM", 
            "IDTIPOPRODUTOFISCAL", 
            "IDFONTEPRODUTOFISAL", 
            "IDPRODCADASTRO", 
            "NUREF", 
            "CODBARRAS", 
            "DSPRODUTO", 
            "UND", 
            "QTDPRODUTO", 
            "VRCUSTO", 
            "VRVENDA", 
            "VRTOTALCUSTO", 
            "DTCADASTRO", 
            "DTULTATUALIZACAO", 
            "STCADASTRADO", 
            "STECOMMERCE", 
            "STREDESOCIAL", 
            "STATIVO", 
            "STCANCELADO", 
            "QTDESTOQUEIDEAL", 
            "IDRESUMOPEDIDO", 
            "STMIGRADOSAP", 
            "STREPOSICAO", 
            "IDRESPCADASTRO", 
            "IDRESPAUTORIZAEDITCAD", 
            "IDFORNECEDOR",
            "IDDETALHEPRODUTOPEDIDOPRIMARIO"
        )
        SELECT
            TBD."IDDETALHEPEDIDO",
            TBDPP."IDSUBGRUPOESTRUTURA",
            TBDPP."IDCOR",
            TBDPP."IDTAMANHO",
            TBDPP."DSTAMANHO",
            TBDPP."IDCATEGORIAPEDIDO",
            TBDPP."IDTIPOTECIDO",
            TBDPP."IDESTILO",
            TBDPP."IDFABRICANTE",
            TBDPP."IDLOCALEXPOSICAO",
            TBDPP."IDCATEGORIAS",
            TBDPP."IDNCM",
            TBDPP."NUNCM",
            TBDPP."IDTIPOPRODUTOFISCAL",
            TBDPP."IDFONTEPRODUTOFISAL",
            REPLACE(TBDPP."IDPRODCADASTRO", '_RN', '') AS IDPRODCADASTRO,
            TBDPP."NUREF",
            TBDPP."CODBARRAS",
            TBDPP."DSPRODUTO",
            TBDPP."UND",
            TBDPP."QTDPRODUTO",
            (TBDPP."VRCUSTO" * (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) ) AS "VRCUSTO",
            TBDPP."VRVENDA",
            (TBDPP."VRTOTALCUSTO" * (CASE WHEN IFNULL(TBR."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE TBR."FATOR_ACRESCIMO_COMPRA" END) ) AS "VRTOTALCUSTO",
            TBDPP."DTCADASTRO",
            TBDPP."DTULTATUALIZACAO",
            TBDPP."STCADASTRADO",
            TBDPP."STECOMMERCE",
            TBDPP."STREDESOCIAL",
            TBDPP."STATIVO",
            TBDPP."STCANCELADO",
            TBDPP."QTDESTOQUEIDEAL",
            TBD."IDRESUMOPEDIDO",
            'False' AS "STMIGRADOSAP",
            TBDPP."STREPOSICAO",
            TBDPP."IDRESPCADASTRO",
            TBDPP."IDRESPAUTORIZAEDITCAD",
            TBDPP."IDFORNECEDOR",
            TBDPP."IDDETALHEPRODUTOPEDIDO" AS IDDETALHEPRODUTOPEDIDOPRIMARIO
        FROM 
            "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS TBDPP
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS TBD ON 
            TBDPP.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDOPRIMARIO
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE
            TBD.IDRESUMOPEDIDO = ?
	`;
	
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    pStmt.setInt(1, idPedidoNovo);   
    
    pStmt.execute();
    pStmt.close();
    
    conn.commit();
    
    updateDetalheProdutoPedidoPrimario(Number(registro.IDRESUMOPEDIDO), registro);
}

function gerarDetalhePedidoGradeSecundario(idPedidoNovo, registro) {
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
            TBD.IDDETALHEPEDIDO,
            TBDPG.IDTAMANHO,
            TBDPG.INDICETAMANHO,
            TBDPG.QTD,
            'True' AS STATIVO
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO TBD
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDPG ON 
            TBD.IDDETALHEPEDIDOPRIMARIO = TBDPG.IDDETALHEPEDIDO AND TBDPG.STATIVO = 'True'
        WHERE 
            TBD.IDRESUMOPEDIDO = ?
	`;

	let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
	
	pStmtInsert.setInt(1, idPedidoNovo);
	pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
	
	fnCriarDetalheProdutoPedidoSecundario(idPedidoNovo, registro)
}

function gerarDetalhePedidoSecundario(idResumoPedido, idPedidoNovo, registro){
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
                A.NUREF,
                A.DSPRODUTO,
                A.QTDTOTAL,
                A.NUCAIXA,
                A.UND,
                (A.VRUNITBRUTO * (CASE WHEN IFNULL(B."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE B."FATOR_ACRESCIMO_COMPRA" END) ) AS VRUNITBRUTO,
                A.DESC01,
                A.DESC02,
                A.DESC03,
                (A.VRUNITLIQUIDO * (CASE WHEN IFNULL(B."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE B."FATOR_ACRESCIMO_COMPRA" END) ) AS VRUNITLIQUIDO,
                A.VRVENDA,
                (A.VRTOTAL * (CASE WHEN IFNULL(B."FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE B."FATOR_ACRESCIMO_COMPRA" END) ) AS VRTOTAL,
                A.STRECEBIDO,
                A.STECOMMERCE,
                A.STREDESOCIAL,
                A.STCANCELADO,
                A.STTRANSFORMADO,
                A.VRCUSTOPRODATUAL,
                A.VRVENDAPRODATUAL,
                A.OBSPRODUTO,
                A.IDCATEGORIAS,
                A.IDRESPCANCELAMENTO,
                A.TXTOBSCANCELAMENTO,
                A.STREPOSICAO,
                A.NUCODBARRAS,
                A.DTCANCELAMENTO,
                A.IDPRODUTO,
                A.DTATUALIZACAO,
                A.IDRESPATUALIZACAO,
                A.IDRESPCADASTRO,
                A.DTCADASTRO,
                A.IDRESPAUTORIZAEDITCAD,
                A.IDDETALHEPEDIDO AS IDDETALHEPEDIDOPRIMARIO 
            FROM 
                "VAR_DB_NAME".DETALHEPEDIDO A
            INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO B ON 
                A.IDRESUMOPEDIDO = B.IDPEDIDOPRIMARIO
            WHERE 
                A.STCANCELADO = 'False'
                AND A.IDRESUMOPEDIDO = ?
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    pStmtInsert.setInt(1, idResumoPedido);
    
    pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
    
    gerarDetalhePedidoGradeSecundario(idPedidoNovo, registro);
}

function gerarResumoPedidoSecundario(idResumoPedido, registro){
    let dadosValoresPedido = getValoresPedido(idResumoPedido);
    let vrTaxaAcrescimo = getValorTaxaAcrescimo();
    
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
                IDRESPREATIVACAO,
                TXTMOTIVOREATIVACAO,
                DTREATIVACAO,
                IDPEDIDOPRIMARIO, 
                STPEDIDOPRIMARIO,
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
            TBR.IDANDAMENTO,
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
            ${dadosValoresPedido.VRTOTAL * vrTaxaAcrescimo} AS VRTOTALBRUTO,
            ${dadosValoresPedido.VRTOTAL * vrTaxaAcrescimo} AS VRTOTALLIQUIDO,
            TBR.DESCPERC01,
            TBR.DESCPERC02,
            TBR.DESCPERC03,
            TBR.PERCCOMISSAO,
            TBR.DTFECHAMENTOPEDIDO,
            TBR.DTCADASTRO,
            TBR.IDRESPCANCELAMENTO,
            TBR.DSMOTIVOCANCELAMENTO,
            TBR.DTCANCELAMENTO,
            TBR.TPARQUIVO,
            TBR.DTRECEBIMENTOPEDIDO,
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
            TBR.IDRESPREATIVACAO,
            TBR.TXTMOTIVOREATIVACAO,
            TBR.DTREATIVACAO,
            TBR.IDRESUMOPEDIDO AS IDPEDIDOPRIMARIO,
            'False' AS STPEDIDOPRIMARIO,
            ${vrTaxaAcrescimo} AS FATOR_ACRESCIMO_COMPRA
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
	
	gerarDetalhePedidoSecundario(idResumoPedido, queryId, registro);
}

function updateResumoPedidoSecundario(registro){
    let regExist = getDadosPedidoSecundario(registro.IDRESUMOPEDIDO);
    
    if(!regExist){
        gerarResumoPedidoSecundario(registro.IDRESUMOPEDIDO, registro);
    }
    
    var query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET 
            "IDGRUPOEMPRESARIAL" = ?, 
            "IDSUBGRUPOEMPRESARIAL" = ?, 
            "IDCOMPRADOR" = ?, 
            "IDCONDICAOPAGAMENTO" = ?, 
            "IDFORNECEDOR" = ?, 
            "IDTRANSPORTADORA" = ?, 
            "IDANDAMENTO" = ?, 
            "MODPEDIDO" = ?, 
            "NOVENDEDOR" = ?, 
            "EEMAILVENDEDOR" = ?, 
            "DTPEDIDO" = ?, 
            "DTPREVENTREGA" = ?, 
            "TPFRETE" = ?, 
            "DESCPERC01" = ?, 
            "DESCPERC02" = ?, 
            "DESCPERC03" = ?, 
            "PERCCOMISSAO" = ?, 
            "VRTOTALLIQUIDO" = ( CASE WHEN IFNULL("FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE "FATOR_ACRESCIMO_COMPRA" END ) * CAST( ? AS DECIMAL(21, 6)),
            "OBSPEDIDO" = ?, 
            "OBSPEDIDO2" = ?, 
            "DTFECHAMENTOPEDIDO" = ?, 
            "DTCADASTRO" = ?, 
            "TPARQUIVO" = ?, 
            "STDISTRIBUIDO" = ?, 
            "STAGRUPAPRODUTO" = ?, 
            "STCANCELADO" = ?, 
            "TPFISCAL" = ?, 
            "STRASCUNHO" = ?
        WHERE 
            "IDPEDIDOPRIMARIO" =  ? 
    `; 

    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
    pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
    pStmt.setInt(3, registro.IDCOMPRADOR);
    pStmt.setInt(4, registro.IDCONDICAOPAGAMENTO);
    pStmt.setString(5, registro.IDFORNECEDOR);
    pStmt.setInt(6, registro.IDTRANSPORTADORA);
    pStmt.setInt(7, registro.IDANDAMENTO);
    pStmt.setString(8, registro.MODPEDIDO);
    pStmt.setString(9, registro.NOVENDEDOR);
    pStmt.setString(10, registro.EEMAILVENDEDOR);
    pStmt.setDate(11, registro.DTPEDIDO);
    pStmt.setDate(12, registro.DTPREVENTREGA);
    pStmt.setString(13, registro.TPFRETE);
    pStmt.setFloat(14, registro.DESCPERC01);
    pStmt.setFloat(15, registro.DESCPERC02);
    pStmt.setFloat(16, registro.DESCPERC03);
    pStmt.setFloat(17, registro.PERCCOMISSAO);
    pStmt.setFloat(18, registro.VRTOTALLIQUIDO);
    pStmt.setString(19, registro.OBSPEDIDO);
    pStmt.setString(20, registro.OBSPEDIDO2);
    pStmt.setDate(21, registro.DTFECHAMENTOPEDIDO);
    pStmt.setDate(22, registro.DTCADASTRO);
    pStmt.setString(23, registro.TPARQUIVO);
    pStmt.setString(24, registro.STDISTRIBUIDO);
    pStmt.setString(25, registro.STAGRUPAPRODUTO);
    pStmt.setString(26, registro.STCANCELADO);
    pStmt.setString(27, registro.TPFISCAL);
    pStmt.setString(28, registro.STRASCUNHO);
    pStmt.setInt(29, registro.IDRESUMOPEDIDO);

	pStmt.execute();
    
	pStmt.close();
}

function fnHandlePut() {
    conn = $.db.getConnection();
    
    var query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            "IDGRUPOEMPRESARIAL" = ?,
            "IDSUBGRUPOEMPRESARIAL" = ?, 
            "IDCOMPRADOR" = ?, 
            "IDCONDICAOPAGAMENTO" = ?, 
            "IDFORNECEDOR" = ?, 
            "IDTRANSPORTADORA" = ?, 
            "IDANDAMENTO" = ?, 
            "MODPEDIDO" = ?, 
            "NOVENDEDOR" = ?, 
            "EEMAILVENDEDOR" = ?, 
            "DTPEDIDO" = ?, 
            "DTPREVENTREGA" = ?, 
            "TPFRETE" = ?, 
            "DESCPERC01" = ?, 
            "DESCPERC02" = ?, 
            "DESCPERC03" = ?, 
            "PERCCOMISSAO" = ?, 
            "VRTOTALLIQUIDO" = ( CASE WHEN IFNULL("FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE "FATOR_ACRESCIMO_COMPRA" END ) * CAST( ? AS DECIMAL(21, 6)), 
            "OBSPEDIDO" = ?, 
            "OBSPEDIDO2" = ?, 
            "DTFECHAMENTOPEDIDO" = ?, 
            "DTCADASTRO" = ?, 
            "TPARQUIVO" = ?, 
            "STDISTRIBUIDO" = ?, 
            "STAGRUPAPRODUTO" = ?, 
            "STCANCELADO" = ?, 
            "TPFISCAL" = ?, 
            "STRASCUNHO" = ?,
            "STPEDIDOPRIMARIO" = ?
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `; 

    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 

    pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
    pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
    pStmt.setInt(3, registro.IDCOMPRADOR);
    pStmt.setInt(4, registro.IDCONDICAOPAGAMENTO);
    pStmt.setString(5, registro.IDFORNECEDOR);
    pStmt.setInt(6, registro.IDTRANSPORTADORA);
    pStmt.setInt(7, registro.IDANDAMENTO);
    pStmt.setString(8, registro.MODPEDIDO);
    pStmt.setString(9, registro.NOVENDEDOR);
    pStmt.setString(10, registro.EEMAILVENDEDOR);
    pStmt.setDate(11, registro.DTPEDIDO);
    pStmt.setDate(12, registro.DTPREVENTREGA);
    pStmt.setString(13, registro.TPFRETE);
    pStmt.setFloat(14, registro.DESCPERC01);
    pStmt.setFloat(15, registro.DESCPERC02);
    pStmt.setFloat(16, registro.DESCPERC03);
    pStmt.setFloat(17, registro.PERCCOMISSAO);
    pStmt.setFloat(18, registro.VRTOTALLIQUIDO);
    pStmt.setString(19, registro.OBSPEDIDO);
    pStmt.setString(20, registro.OBSPEDIDO2);
    pStmt.setDate(21, registro.DTFECHAMENTOPEDIDO);
    pStmt.setDate(22, registro.DTCADASTRO);
    pStmt.setString(23, registro.TPARQUIVO);
    pStmt.setString(24, registro.STDISTRIBUIDO);
    pStmt.setString(25, registro.STAGRUPAPRODUTO);
    pStmt.setString(26, registro.STCANCELADO);
    pStmt.setString(27, registro.TPFISCAL);
    pStmt.setString(28, registro.STRASCUNHO);
    pStmt.setString(29, registro.STPEDIDOPORINTEMEDIARIO);
    pStmt.setInt(30, registro.IDRESUMOPEDIDO);

	pStmt.execute();
    
    registro.STPEDIDOPORINTEMEDIARIO == 'True' && updateResumoPedidoSecundario(registro);
    
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
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