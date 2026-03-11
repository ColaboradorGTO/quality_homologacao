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

function gerarDetalhePedidoGrade(idResumoPedidoNovo, idResumoPedidoClonar) {
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
            B.IDDETALHEPEDIDO,
            C.IDTAMANHO,
            1 AS INDICETAMANHO,
            C.QTDPRODUTO AS QTD,
            'True' AS STATIVO
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO A
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO B ON
            A.IDRESUMOPEDIDO = B.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO C ON 
            B.IDPRODUTO = REPLACE(C.IDPRODCADASTRO, '_RN', '') AND C.STCANCELADO = 'False' AND C.IDRESUMOPEDIDO = ?
        WHERE 
            B.DTCANCELAMENTO IS NULL
            AND A.IDRESUMOPEDIDO = ?
	`;

	let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
	
	pStmtInsert.setInt(1, idResumoPedidoClonar);
	pStmtInsert.setInt(2, idResumoPedidoNovo);
	
	pStmtInsert.execute();
	pStmtInsert.close();
}

function gerarDetalhePedido(idResumoPedidoClonar, idResumoPedidoNovo, idRespCadastro){
    let queryInsert = `
        INSERT INTO 
            "VAR_DB_NAME".DETALHEPEDIDO
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
            DTCADASTRO
        )
        SELECT
            "VAR_DB_NAME"."SEQ_DETALHEPEDIDO".NEXTVAL AS IDDETALHEPEDIDO,
            ? AS IDRESUMOPEDIDO,
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
            NULL AS DTATUALIZACAO,
            NULL AS IDRESPATUALIZACAO,
            ${idRespCadastro} IDRESPCADASTRO,
            CURRENT_TIMESTAMP AS DTCADASTRO
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO A
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO B ON 
            A.IDDETALHEPEDIDO = B.IDDETALHEPEDIDO AND B.STCANCELADO = 'False'
        LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO C ON
            A.IDDETALHEPEDIDOPRIMARIO = C.IDDETALHEPEDIDOORIGEM AND C.DTCANCELAMENTO IS NULL
        LEFT JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP_SECUNDARIO ON 
        	B.IDDETALHEPRODUTOPEDIDO = TBDP_SECUNDARIO.IDDETALHEPRODUTOPEDIDOPRIMARIO
        WHERE 
            A.DTCANCELAMENTO IS NULL
            AND A.STCANCELADO = 'False'
            AND A.IDRESUMOPEDIDO = ?
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    pStmtInsert.setInt(1, idResumoPedidoNovo);
    pStmtInsert.setInt(2, idResumoPedidoClonar);
    
    pStmtInsert.execute();
	pStmtInsert.close();
	
	conn.commit();
    
    gerarDetalhePedidoGrade(idResumoPedidoNovo, idResumoPedidoClonar);
}

function fnHandlePost(){
    conn = $.db.getConnection();
    
    let query = `
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
            LOGSAP
        ) 
        SELECT 
            ? AS IDRESUMOPEDIDO,
            TBR.IDGRUPOEMPRESARIAL,
            TBR.IDSUBGRUPOEMPRESARIAL,
            TBR.IDEMPRESA,
            TBR.IDCOMPRADOR,
            TBR.IDCONDICAOPAGAMENTO,
            TBR.IDFORNECEDOR,
            TBR.IDTRANSPORTADORA,
            1 AS IDANDAMENTO,
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
            NULL AS DTFECHAMENTOPEDIDO,
            CURRENT_TIMESTAMP AS DTCADASTRO,
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
            CURRENT_TIMESTAMP AS DTMOVPEDIDO,
            TBR.OBSPEDIDO,
            TBR.OBSPEDIDO2,
            TBR.STRASCUNHO,
            NULL AS LOGSAP
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        WHERE 
            TBR.IDRESUMOPEDIDO = ?
    `;
   
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(query));
	let bodyJson = JSON.parse($.request.body.asString());
    
    let registro = bodyJson[0];
    
	let idResumoPedidoNovo = api.executeScalar('SELECT "VAR_DB_NAME".SEQ_RESUMOPEDIDO.NEXTVAL FROM DUMMY WHERE 1=?', 1);
	let idResumoPedidoClonar = Number(registro.IDRESUMOPEDIDOCLONAR);
	let idRespCadastro = Number(registro.IDRESPCADASTRO);
	
    pStmtInsert.setInt(1, parseInt(idResumoPedidoNovo));
    pStmtInsert.setInt(2, parseInt(idResumoPedidoClonar));
    
    pStmtInsert.execute();
    pStmtInsert.close();
    
	gerarDetalhePedido(idResumoPedidoClonar, idResumoPedidoNovo, idRespCadastro);

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
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