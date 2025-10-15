var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function fnGetContatos(idGrupoEmpresarial){
    let query = `
        SELECT
            EEMAILCENTRALPEDIDOS,
            NUTELCENTRELPEDIDOS,
            EEMAILFATURAMENTO,
            NUTELFATURAMENTO,
            EEMAILAGENDAMENTOSENTREGAS,
            NUTELAGENDAMENTOSENTREGAS,
            EEMAILFINANCEIRO,
            NUTELFINANCEIRO || ' - ' ||  NUTELFINANCEIRO2 AS NUTELFINANCEIRO,
            EEMAILCOMPRAS,
            NUTELCOMPRAS,
            EEMAILCADASTRO,
            NUTELCADASTRO
        FROM
            "VAR_DB_NAME".SUBGRUPOEMPRESARIAL
        WHERE
            IDSUBGRUPOEMPRESARIAL = ?
    `;
    
    let result = api.sqlQuery(query, idGrupoEmpresarial);
    
    if(result.length > 0){
        let {
            EEMAILCENTRALPEDIDOS,
            NUTELCENTRELPEDIDOS,
            EEMAILFATURAMENTO,
            NUTELFATURAMENTO,
            EEMAILAGENDAMENTOSENTREGAS,
            NUTELAGENDAMENTOSENTREGAS,
            EEMAILFINANCEIRO,
            NUTELFINANCEIRO,
            EEMAILCOMPRAS,
            NUTELCOMPRAS,
            EEMAILCADASTRO,
            NUTELCADASTRO
        } = result[0] || '';
        
        return [
            `Central de Pedidos: ${EEMAILCENTRALPEDIDOS} - ${NUTELCENTRELPEDIDOS}`,
            `Faturamento: ${EEMAILFATURAMENTO} - ${NUTELFATURAMENTO}`,
            `Agendamentos de Entregas: ${EEMAILAGENDAMENTOSENTREGAS} - ${NUTELAGENDAMENTOSENTREGAS}`,
            `Financeiro: ${EEMAILFINANCEIRO} - ${NUTELFINANCEIRO}`,
            `Compras: ${EEMAILCOMPRAS} - ${NUTELCOMPRAS}`,
            `Cadastro: ${EEMAILCADASTRO} - ${NUTELCADASTRO}`
        ];
    }
    
    return [];
}

function getDadosPedido(idResumoPedido){
    let querydetpedido = `
        SELECT 
            STPEDIDOPRIMARIO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO
        WHERE
            "STCANCELADO"= 'False'
            AND IDRESUMOPEDIDO = ?
    `;

	let regDetalhe = api.sqlQuery(querydetpedido, idResumoPedido);
	
	return regDetalhe[0];
}

function getDadosPedidoSecundario(idResumoPedido){
    let querydetpedido = `
        SELECT 
            IDPEDIDOPRIMARIO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO
        WHERE
            "STCANCELADO"= 'False'
            AND IDRESUMOPEDIDO = ?
    `;

	let regDetalhe = api.sqlQuery(querydetpedido, idResumoPedido);
	
	return regDetalhe[0];
}

function getValoresPedido(idResumoPedido){
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
	
	return regDetalhe[0];
}

function getValoresPedidoSecundario(idResumoPedido){
    let querydetpedido = `
        SELECT 
            IFNULL(COUNT(IDDETALHEPEDIDO), 0) TOTALITENS, 
            IFNULL(SUM(QTDTOTAL), 0) QTDTOTAL, 
            IFNULL(SUM(VRTOTAL), 0) VRTOTAL
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO
        WHERE
            "STCANCELADO"= 'False' 
            AND IDPEDIDOPRIMARIO = ?
    `;

	let regDetalhe = api.sqlQuery(querydetpedido, idResumoPedido);
	
	return regDetalhe[0];
}

function validarSePedidoSecundario(idResumoPedido){
    let querydetpedido = `
        SELECT 
            IDRESUMOPEDIDO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO
        WHERE
            "STCANCELADO"= 'False'
            AND IDPEDIDOPRIMARIO IS NOT NULL
            AND IDRESUMOPEDIDO = ?
    `;

	let reg = api.sqlQuery(querydetpedido, idResumoPedido);
	
	return (reg.length > 0);
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
    
    if(regTaxa.length > 0){
        return (Number(regTaxa[0].VR_TAXA_PERC) / 100) + 1;
    }
    
    return 0;
}

function fnUpdateValoresResumoPedidoSecundario(idResumoPedido, dados){
    let qtdTotalItens = parseInt(dados.TOTALITENS || 0);
    let qtdTotalProds = parseInt(dados.QTDTOTAL || 0);
    let vrTotalBruto = parseFloat(dados.VRTOTAL || 0);
    let vrTotalLiquido = vrTotalBruto;
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET 
            "NUTOTALITENS" = ?, 
            "QTDTOTPRODUTOS" =  ?, 
            "VRTOTALBRUTO" = (CASE WHEN IFNULL("FATOR_ACRESCIMO_COMPRA", 0) = 0 THEN 1 ELSE "FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)), 
            "VRTOTALLIQUIDO" = (CASE WHEN IFNULL("FATOR_ACRESCIMO_COMPRA", 0) = 0 THEN 1 ELSE "FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)), 
            "DTMOVPEDIDO" = now()
        WHERE 
            "IDPEDIDOPRIMARIO" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, qtdTotalItens);
    pStmt.setFloat(2, qtdTotalProds);
    pStmt.setFloat(3, vrTotalBruto);
    pStmt.setFloat(4, vrTotalLiquido);
    pStmt.setInt(5, parseInt(idResumoPedido));
    
    pStmt.execute();
    pStmt.close();
}

function fnUpdateValoresResumoPedido(idResumoPedido, dados){
    let qtdTotalItens = parseInt(dados.TOTALITENS || 0);
    let qtdTotalProds = parseFloat(dados.QTDTOTAL || 0);
    let vrTotalBruto = parseFloat(dados.VRTOTAL || 0);
    let vrTotalLiquido = vrTotalBruto;
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET 
            "NUTOTALITENS" = ?, 
            "QTDTOTPRODUTOS" =  ?, 
            "VRTOTALBRUTO" = (CASE WHEN IFNULL("FATOR_ACRESCIMO_COMPRA", 0) = 0 THEN 1 ELSE "FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)), 
            "VRTOTALLIQUIDO" = (CASE WHEN IFNULL("FATOR_ACRESCIMO_COMPRA", 0) = 0 THEN 1 ELSE "FATOR_ACRESCIMO_COMPRA" END) * CAST( ? AS DECIMAL(21, 6)), 
            "DTMOVPEDIDO" = now()
        WHERE 
            "IDRESUMOPEDIDO" = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, qtdTotalItens);
    pStmt.setFloat(2, qtdTotalProds);
    pStmt.setFloat(3, vrTotalBruto);
    pStmt.setFloat(4, vrTotalLiquido);
    pStmt.setInt(5, parseInt(idResumoPedido));
    
    pStmt.execute();
    pStmt.close();
}

function fnUpdateValoresPedido(idResumoPedido){
    let isSecundario = validarSePedidoSecundario(idResumoPedido);
    
    if(isSecundario){
        return
    }
    
    let dados = getValoresPedido(idResumoPedido);
    
    fnUpdateValoresResumoPedido(idResumoPedido, dados, conn);
    
    fnUpdateValoresResumoPedidoSecundario(idResumoPedido, dados, conn)
}

function fnCriarPedidoSecundario(dadosPedido, idPedidoPrimario){
    let vrTaxaAcrescimo = getValorTaxa();
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
		(
            "IDRESUMOPEDIDO", 
            "IDGRUPOEMPRESARIAL", 
            "IDSUBGRUPOEMPRESARIAL", 
            "IDCOMPRADOR", 
            "IDCONDICAOPAGAMENTO", 
            "IDFORNECEDOR", 
            "IDTRANSPORTADORA", 
            "IDANDAMENTO", 
            "MODPEDIDO", 
            "NOVENDEDOR", 
            "EEMAILVENDEDOR", 
            "DTPEDIDO", 
            "DTPREVENTREGA", 
            "TPFRETE", 
            "DTFECHAMENTOPEDIDO", 
            "DTCADASTRO", 
            "TPARQUIVO", 
            "STDISTRIBUIDO", 
            "STAGRUPAPRODUTO", 
            "STCANCELADO",  
            "TPFISCAL",  
            "OBSPEDIDO", 
            "OBSPEDIDO2", 
            "STRASCUNHO", 
            "IDPEDIDOPRIMARIO", 
            "FATOR_ACRESCIMO_COMPRA",
            "STPEDIDOPRIMARIO"
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'False')
	`;
   
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

	let registro = dadosPedido;
	
    let IdResPed = api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_RESUMOPEDIDO".NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
    
    pStmt.setInt(1, parseInt(IdResPed));
    pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
    pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
    pStmt.setInt(4, registro.IDCOMPRADOR);
    pStmt.setInt(5, registro.IDCONDICAOPAGAMENTO);
    pStmt.setString(6, registro.IDFORNECEDOR);
    setIntOrNull(pStmt,7, registro.IDTRANSPORTADORA);
    pStmt.setInt(8, registro.IDANDAMENTO);
    pStmt.setString(9, registro.MODPEDIDO);
    pStmt.setString(10, registro.NOVENDEDOR);
    pStmt.setString(11, registro.EEMAILVENDEDOR);
    pStmt.setDate(12, registro.DTPEDIDO);
    pStmt.setDate(13, registro.DTPREVENTREGA);
    pStmt.setString(14, registro.TPFRETE);
    pStmt.setDate(15, registro.DTFECHAMENTOPEDIDO);
    pStmt.setDate(16, registro.DTCADASTRO);
    pStmt.setString(17, registro.TPARQUIVO);
    pStmt.setString(18, registro.STDISTRIBUIDO);
    pStmt.setString(19, registro.STAGRUPAPRODUTO);
    pStmt.setString(20, registro.STCANCELADO);
    pStmt.setString(21, registro.TPFISCAL);
    pStmt.setString(22, registro.OBSPEDIDO);
    pStmt.setString(23, registro.OBSPEDIDO2);
    pStmt.setString(24, registro.STRASCUNHO);
    setIntOrNull(pStmt, 25, parseInt(idPedidoPrimario));
    pStmt.setFloat(26, vrTaxaAcrescimo);
    	
    pStmt.execute();
    
    pStmt.close();
}

function fnHandleGet(byId) {
    
    var idPedido = $.request.parameters.get("idpedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var IdMarca = $.request.parameters.get("idMarcaPesquisa");
    var IdFornecedor = $.request.parameters.get("idFornPesquisa");
    var IdFabricante = $.request.parameters.get("idFabPesquisa");
    var IdComprador = $.request.parameters.get("idCompradorPesquisa");
    var STSituacaoSAP = $.request.parameters.get("stSituacaoSAP");
    var idPedidoPrimario = $.request.parameters.get("idPedidoPrimario");
    
    if ( idPedido ) {
        conn = $.db.getConnection();
        
        fnUpdateValoresPedido(idPedido, conn);
        
        conn.commit();
    }
    	
    var query =  `
        SELECT
            tbrp.IDRESUMOPEDIDO AS IDPEDIDO,
            tbrp.IDGRUPOEMPRESARIAL AS IDGRUPOPEDIDO,
            tbrp.IDSUBGRUPOEMPRESARIAL AS IDSUBGRUPOPEDIDO,
            IFNULL((SELECT 
                    STRING_AGG(TBD.IDFABRICANTE, ' // ' ORDER BY TBD.IDFABRICANTE) AS IDSFABRICANTE
                FROM (
                        SELECT 
                            DISTINCT 
                                FAB.IDFABRICANTE
                        FROM 
                            "VAR_DB_NAME".DETALHEPEDIDO tbds
                        LEFT JOIN 
                            "VAR_DB_NAME".FABRICANTE FAB ON FAB.IDFABRICANTE = tbds.IDFABRICANTE
                        WHERE 
                            tbds.IDRESUMOPEDIDO = TBRP.IDRESUMOPEDIDO  
                            AND tbds.STCANCELADO = 'False'
                    ) AS TBD
            ), '') AS IDFABRICANTE,
            IFNULL((SELECT 
                    STRING_AGG(TBD.DSFABRICANTE, ' // ' ORDER BY TBD.IDFABRICANTE) AS DSFABRICANTE
                FROM (
                        SELECT 
                            DISTINCT 
                                FAB.IDFABRICANTE,
                                FAB.DSFABRICANTE
                        FROM 
                            "VAR_DB_NAME".DETALHEPEDIDO tbds
                        LEFT JOIN 
                            "VAR_DB_NAME".FABRICANTE FAB ON FAB.IDFABRICANTE = tbds.IDFABRICANTE
                        WHERE 
                            tbds.IDRESUMOPEDIDO = TBRP.IDRESUMOPEDIDO  
                            AND tbds.STCANCELADO = 'False'
                    ) AS TBD
            ), '') AS FABRICANTE,
            EMP.DSSUBGRUPOEMPRESARIAL AS NOFANTASIA,
            EMP.EEMAILFATURAMENTO,
            EMP.NUTELFATURAMENTO,
            EMP.EEMAILCOBRANCA,
            EMP.NUTELCOBRANCA,
            EMP.EEMAILFINANCEIRO,
            EMP.NUTELFINANCEIRO,
            EMP.EEMAILCOMPRAS,
            EMP.NUTELCOMPRAS,
            EMP.EEMAILCADASTRO,
            EMP.NUTELCADASTRO,
            FC.IDFUNCIONARIO AS IDCOMPRADOR,
            FC.NOFUNCIONARIO AS NOMECOMPRADOR,
            CDP.IDCONDICAOPAGAMENTO,
            CDP.DSCONDICAOPAG,
            FN.IDFORNECEDOR AS IDFORNECEDOR,
            FN.NOFANTASIA AS NOFANTASIAFORNECEDOR,
            FN.NORAZAOSOCIAL AS NOFORNECEDOR,
            FN.NUCNPJ AS CNPJFORN,
            FN.NUINSCESTADUAL AS INSCESTFORN,
            FN.EEMAIL AS EMAILFORN,
            FN.NUTELEFONE1 AS FONEFORN,
            FN.EENDERECO AS ENDFORN,
            FN.ENUMERO AS NUMEROFORN,
            FN.ECOMPLEMENTO AS COMPFORN,
            FN.EBAIRRO AS BAIRROFORN,
            FN.ECIDADE AS CIDADEFORN,
            FN.SGUF AS UFFORN,
            FN.NUCEP AS CEPFORN,
            TP.IDTRANSPORTADORA,
            TP.NOFANTASIA AS NOMETRANSPORTADORA,
            AD.IDANDAMENTO,
            AD.DSANDAMENTO,
            AD.DSSETOR,
            tbrp.MODPEDIDO,
            tbrp.NOVENDEDOR,
            tbrp.EEMAILVENDEDOR,
            tbrp.DTPEDIDO AS DTPEDIDONORMAL,
            tbrp.DTPREVENTREGA,
            TO_VARCHAR( tbrp.DTPREVENTREGA, 'YYYY-MM-DD') AS DTPREVENTREGAFORMATADA,
            TO_VARCHAR( tbrp.DTPREVENTREGA, 'DD-MM-YYYY HH24:MI:SS') AS DTENTREGAFORMATADA2,
            tbrp.TPFRETE,
            tbrp.OBSPEDIDO,
            tbrp.OBSPEDIDO2,
            tbrp.DTFECHAMENTOPEDIDO,
            TO_VARCHAR( tbrp.DTFECHAMENTOPEDIDO, 'YYYY-MM-DD') AS DTFECHAMENTOFORMATADA,
            tbrp.DTCADASTRO,
            tbrp.TPARQUIVO,
            tbrp.STDISTRIBUIDO,
            tbrp.STAGRUPAPRODUTO,
            CASE
                WHEN (TBRP_PEDIDO_SECUNDARIO.IDRESUMOPEDIDO IS NOT NULL AND TBRP_PEDIDO_SECUNDARIO.STMIGRADOSAP = 'False') THEN 'False'
                ELSE tbrp.STMIGRADOSAP
            END AS STMIGRADOSAP,
            tbrp.LOGSAP,
            TO_VARCHAR( tbrp.DTPEDIDO, 'DD-MM-YYYY HH24:MI:SS') AS DTPEDIDO, 
            TO_VARCHAR( tbrp.DTPEDIDO, 'YYYY-MM-DD') AS DTPEDIDOFORMATADA,
            TO_VARCHAR( tbrp.DTPEDIDO, 'DD/MM/YYYY HH24:MI:SS') AS DTPEDIDOFORMATADABR,
            IFNULL( tbrp.NUTOTALITENS,0) AS NUTOTALITENS,
            IFNULL( tbrp.QTDTOTPRODUTOS,0) AS QTDTOTPRODUTOS,
            IFNULL( tbrp.VRTOTALBRUTO,0) AS VRTOTALBRUTO,
            IFNULL( tbrp.VRTOTALLIQUIDO,0) AS VRTOTALLIQUIDO,
            IFNULL( tbrp.DESCPERC01,0) AS DESCPERC01,
            IFNULL( tbrp.DESCPERC02,0) AS DESCPERC02,
            IFNULL( tbrp.DESCPERC03,0) AS DESCPERC03,
            IFNULL( tbrp.PERCCOMISSAO,0) AS PERCCOMISSAO,
            ( tbrp.TPFISCAL) AS TPFISCAL,
            tbrp.STRASCUNHO,
            CASE
                WHEN (TBRP_PEDIDO_SECUNDARIO.IDRESUMOPEDIDO IS NOT NULL AND TBRP_PEDIDO_SECUNDARIO.STCANCELADO = 'False') THEN 'False'
                ELSE tbrp.STCANCELADO
            END AS STCANCELADO,
            tbrp.IDRESUMOPEDIDOORIGEM,
            tbrp.IDRESPREATIVACAO,
            TO_VARCHAR(tbrp.TXTMOTIVOREATIVACAO) AS TXTMOTIVOREATIVACAO,
            tbrp.DTREATIVACAO,
            tbrp.STREATIVADO,
            tbrp.IDPEDIDOPRIMARIO,
            tbrp.STPEDIDOPRIMARIO,
            TBRP_PEDIDO_SECUNDARIO.IDRESUMOPEDIDO AS IDPEDIDOSECUNDARIO,
            TBRP_PEDIDO_ORIGEM.IDRESUMOPEDIDO AS IDRESUMOPEDIDODESTINO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO tbrp
        /*INNER JOIN (
            SELECT 
                *
            FROM
                "VAR_DB_NAME".DETALHEPEDIDO 
        ) AS DETP ON DETP.IDRESUMOPEDIDO = TBRP.IDRESUMOPEDIDO*/
        INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL EMP ON 
            tbrp.IDSUBGRUPOEMPRESARIAL = EMP.IDSUBGRUPOEMPRESARIAL 
        INNER JOIN "VAR_DB_NAME".ANDAMENTOS AD ON 
            tbrp.IDANDAMENTO = AD.IDANDAMENTO 
        LEFT JOIN "VAR_DB_NAME".FORNECEDOR FN ON 
            tbrp.IDFORNECEDOR = FN.IDFORNECEDOR 
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO FC ON 
            tbrp.IDCOMPRADOR = FC.IDFUNCIONARIO 
        LEFT JOIN "VAR_DB_NAME".TRANSPORTADORA TP ON 
            tbrp.IDTRANSPORTADORA = TP.IDTRANSPORTADORA 
        INNER JOIN "VAR_DB_NAME".CONDICAOPAGAMENTO CDP ON 
            tbrp.IDCONDICAOPAGAMENTO = CDP.IDCONDICAOPAGAMENTO
        LEFT JOIN "VAR_DB_NAME".RESUMOPEDIDO TBRP_PEDIDO_ORIGEM ON 
            tbrp.IDRESUMOPEDIDO = TBRP_PEDIDO_ORIGEM.IDRESUMOPEDIDOORIGEM
        LEFT JOIN "VAR_DB_NAME".RESUMOPEDIDO TBRP_PEDIDO_SECUNDARIO ON 
            tbrp.IDRESUMOPEDIDO = TBRP_PEDIDO_SECUNDARIO.IDPEDIDOPRIMARIO
        WHERE
            1 = ? 
    `;
    
    if ( byId ) {
        query = query + ' And tbrp.IDRESUMOPEDIDO = \'' + byId + '\' ';
    }
    if ( idPedido ) {
        query += ` And tbrp.IDRESUMOPEDIDO = '${idPedido}' `;
    }
    if ( IdMarca ) {
        query = query + ' And tbrp.IDSUBGRUPOEMPRESARIAL = \'' + IdMarca + '\' ';
    }
    if ( IdFornecedor ) {
        query = query + ' And tbrp.IDFORNECEDOR = \'' + IdFornecedor + '\' ';
    }
    if ( IdFabricante ) {
        query += `
            AND tbrp.IDRESUMOPEDIDO IN
                (
                    SELECT DISTINCT
                        IDRESUMOPEDIDO
                    FROM
                        "VAR_DB_NAME".DETALHEPEDIDO 
                    WHERE 
                        IDFABRICANTE = ${IdFabricante} AND STCANCELADO = 'False'
                )
        `;
    }
    if ( IdComprador ) {
        query = query + ' And FC.IDFUNCIONARIO = \'' + IdComprador + '\' ';
    }
    if ( STSituacaoSAP === 'False') {
        query = query + ' And tbrp.STMIGRADOSAP IS NULL And AD.IDANDAMENTO = 5';
    }else if ( STSituacaoSAP === 'True'){
        query = query + ' And tbrp.STMIGRADOSAP = \'' + STSituacaoSAP + '\' And AD.IDANDAMENTO = 5';
    }
    if(!idPedido && dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbrp.DTPEDIDO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
			//query = query + ' OR (tbrp.DTMOVPEDIDO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\'))';
    }
    if(idPedidoPrimario) {
        query += ` OR (tbrp.IDPEDIDOPRIMARIO = '${idPedidoPrimario}' OR tbrp.IDRESUMOPEDIDOORIGEM = '${idPedidoPrimario}' OR tbrp.IDRESUMOPEDIDO = (SELECT IDPEDIDOPRIMARIO FROM "VAR_DB_NAME".RESUMOPEDIDO WHERE IDRESUMOPEDIDO = '${idPedidoPrimario}')) `;
    }
    
    query = query + ' ORDER BY tbrp.IDRESUMOPEDIDO DESC';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (var i = 0; i < response.data.length; i++) {
		let registro =  JSON.parse(JSON.stringify(response.data[i]));
        
        let contatos = fnGetContatos(registro.IDSUBGRUPOPEDIDO);
        
        registro.CONTATOS = contatos;
        
		data.push(registro);
	}

	response.data = data;

	return response;
}

function fnHandlePut() {
    let idResPedido = $.request.parameters.get("idrespedido");
    
    conn = $.db.getConnection();
    
	fnUpdateValoresPedido(idResPedido);

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    conn = $.db.getConnection();
    
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
		(
            "IDRESUMOPEDIDO", 
            "IDGRUPOEMPRESARIAL", 
            "IDSUBGRUPOEMPRESARIAL", 
            "IDCOMPRADOR", 
            "IDCONDICAOPAGAMENTO", 
            "IDFORNECEDOR", 
            "IDTRANSPORTADORA", 
            "IDANDAMENTO", 
            "MODPEDIDO", 
            "NOVENDEDOR", 
            "EEMAILVENDEDOR", 
            "DTPEDIDO", 
            "DTPREVENTREGA", 
            "TPFRETE", 
            "DTFECHAMENTOPEDIDO", 
            "DTCADASTRO", 
            "TPARQUIVO", 
            "STDISTRIBUIDO", 
            "STAGRUPAPRODUTO", 
            "STCANCELADO",  
            "TPFISCAL",  
            "OBSPEDIDO", 
            "OBSPEDIDO2", 
            "STRASCUNHO", 
            "STPEDIDOPRIMARIO" 
        )
		VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
	`;

   
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
	
	let IdResPed;
	
	for (var i = 0; i < bodyJson.length; i++) {
		var registro = bodyJson[i];
        IdResPed = api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_RESUMOPEDIDO".NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
        
        pStmt.setInt(1, parseInt(IdResPed));
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setInt(4, registro.IDCOMPRADOR);
        pStmt.setInt(5, registro.IDCONDICAOPAGAMENTO);
        pStmt.setString(6, registro.IDFORNECEDOR);
        setIntOrNull(pStmt,7, registro.IDTRANSPORTADORA);
        pStmt.setInt(8, registro.IDANDAMENTO);
        pStmt.setString(9, registro.MODPEDIDO);
        pStmt.setString(10, registro.NOVENDEDOR);
        pStmt.setString(11, registro.EEMAILVENDEDOR);
        pStmt.setDate(12, registro.DTPEDIDO);
        pStmt.setDate(13, registro.DTPREVENTREGA);
        pStmt.setString(14, registro.TPFRETE);
        pStmt.setDate(15, registro.DTFECHAMENTOPEDIDO);
        pStmt.setDate(16, registro.DTCADASTRO);
        pStmt.setString(17, registro.TPARQUIVO);
        pStmt.setString(18, registro.STDISTRIBUIDO);
        pStmt.setString(19, registro.STAGRUPAPRODUTO);
        pStmt.setString(20, registro.STCANCELADO);
        pStmt.setString(21, registro.TPFISCAL);
        pStmt.setString(22, registro.OBSPEDIDO);
        pStmt.setString(23, registro.OBSPEDIDO2);
        pStmt.setString(24, registro.STRASCUNHO);
        pStmt.setString(25, registro.STPEDIDOPORINTEMEDIARIO == 'True' ? 'True' : 'False');
        	
        pStmt.execute();
        
        registro.STPEDIDOPORINTEMEDIARIO == 'True' && fnCriarPedidoSecundario(registro, IdResPed, conn);
        
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!",
	    "IDRESUMOPEDIDO": IdResPed
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
            $.response.setBody(JSON.stringify(fnHandleGet(id)));
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