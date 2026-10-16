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

function obterLinhasDoDetalheGrade(idDetPedido) {
	let query = `
        SELECT
            TBDG.IDDETALHEPEDIDOGRADE,
            TBDG.IDDETALHEPEDIDO,
            TBDG.IDTAMANHO,
            TBT.DSTAMANHO,
            TBDG.INDICETAMANHO,
            TBDG.QTD,
            TBDG.STATIVO, 
            TBDG.STDETALHEPRODUTOPEDIDOGERADO
        FROM  
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        INNER JOIN "VAR_DB_NAME".TAMANHO TBT ON
            TBDG.IDTAMANHO = TBT.IDTAMANHO
        WHERE  
            TBDG.STATIVO = 'True'
            AND TBDG.IDDETALHEPEDIDO = ?
        ORDER BY
            TO_ALPHANUM(TBT.DSABREVIACAO)
	`;

    return api.sqlQuery(query, idDetPedido);
}

function obterStatusCriacaoDetalheProdutoPedidoNaoCriado(idDetPedido){
    let query = `
        SELECT DISTINCT
            TBDG.STDETALHEPRODUTOPEDIDOGERADO
        FROM
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBD ON 
            TBDG.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDO
        WHERE  
            1 = ?
            AND TBDG.STATIVO = 'True'
            AND TBDG.STDETALHEPRODUTOPEDIDOGERADO = 'False'
            AND (
                    TBD.IDDETALHEPEDIDO = ${idDetPedido}
                OR
                    TBD.IDDETALHEPEDIDOPRIMARIO = ${idDetPedido}
            )
	`;

    let reg = api.sqlQuery(query, 1);
    
    return reg.length > 0;
}

function getFabricantesPedido(idResumoPedido){
    let query = `
        SELECT DISTINCT 
            TBFAB.IDFABRICANTE,
            TBFAB.DSFABRICANTE
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDO TBD
        INNER JOIN "VAR_DB_NAME".FABRICANTE TBFAB ON 
            TBD.IDFABRICANTE = TBFAB.IDFABRICANTE
        WHERE 
            TBD.STCANCELADO = 'False'
            AND TBD.IDRESUMOPEDIDO = ?
        ORDER BY
            TRIM(TBFAB.DSFABRICANTE)
    `;
    
    return api.sqlQuery(query, idResumoPedido);
}

function getDetalhePedido(idResumoPedido) {
    let query =  `
        SELECT
            TBDP.IDDETALHEPEDIDO AS IDDETPEDIDO,
            TBDP.IDRESUMOPEDIDO AS IDPEDIDO,
            TBRP.IDGRUPOEMPRESARIAL,
            TBRP.IDSUBGRUPOEMPRESARIAL,
            TBRP.IDANDAMENTO,
            TBA.DSSETOR,
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
            TBDP.IDDETALHEPEDIDOPRIMARIO,
            TBDPP.NUNCM,
            TBDPP.IDFONTEPRODUTOFISAL,
            TBDPP.IDTIPOPRODUTOFISCAL,
            TBRP.STMIGRADOSAP
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
            TBP.IDPRODUTO = TBDP.IDPRODUTO AND TBP.NUCODBARRAS = TBDP.NUCODBARRAS
        LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO TBDP_SECUNDARIO ON
            TBDP.IDDETALHEPEDIDO = TBDP_SECUNDARIO.IDDETALHEPEDIDOPRIMARIO
        LEFT JOIN (
            SELECT DISTINCT
                XA.IDDETALHEPEDIDO,
                XA.NUNCM,
                XA.IDFONTEPRODUTOFISAL,
                XA.IDTIPOPRODUTOFISCAL
            FROM 
                "VAR_DB_NAME".DETALHEPRODUTOPEDIDO XA		
        )TBDPP ON 
            TBDP.IDDETALHEPEDIDO = TBDPP.IDDETALHEPEDIDO
        WHERE
            TBRP.STCANCELADO = 'False'
            AND TBDP.STCANCELADO = 'False'
            AND TBDP.IDRESUMOPEDIDO = ?
        ORDER BY 
            TBDP.NUREF, 
            TBDP.DSPRODUTO 
    `;
    
    let response = api.sqlQuery(query, idResumoPedido);
	let data = [];

	for (let i = 0; i < response.length; i++) {
		let registro = JSON.parse(JSON.stringify(response[i]));
		let existeProdutosParaTransformar = obterStatusCriacaoDetalheProdutoPedidoNaoCriado(registro.IDDETPEDIDO);
		
		if(existeProdutosParaTransformar){
		    if(registro.STTRANSFORMADO == 'True'){
                registro.STNOVOTAMANHOADICIONADO = 'True'
		    }
		    
		}
		
        registro.DETALHEPEDIDOGRADE = obterLinhasDoDetalheGrade(registro.IDDETPEDIDO);
        
        data.push(registro);
	}

	response = data;

	return response;
}

function fnHandleGet(byId) {
    	
    let query =  `
        SELECT
            TBRP.IDRESUMOPEDIDO AS IDPEDIDO,
            TBRP.IDGRUPOEMPRESARIAL AS IDGRUPOPEDIDO,
            TBRP.IDSUBGRUPOEMPRESARIAL AS IDSUBGRUPOPEDIDO,
            TBSE.DSSUBGRUPOEMPRESARIAL AS NOFANTASIA,
            TBSE.EEMAILFATURAMENTO,
            TBSE.NUTELFATURAMENTO,
            TBSE.EEMAILCOBRANCA,
            TBSE.NUTELCOBRANCA,
            TBSE.EEMAILFINANCEIRO,
            TBSE.NUTELFINANCEIRO,
            TBSE.EEMAILCOMPRAS,
            TBSE.NUTELCOMPRAS,
            TBSE.EEMAILCADASTRO,
            TBSE.NUTELCADASTRO,
            TBFUNC.IDFUNCIONARIO AS IDCOMPRADOR,
            TBFUNC.NOFUNCIONARIO AS NOMECOMPRADOR,
            TBC.IDCONDICAOPAGAMENTO,
            TBC.DSCONDICAOPAG,
            TBFORN.IDFORNECEDOR AS IDFORNECEDOR,
            TBFORN.NOFANTASIA AS NOFANTASIAFORNECEDOR,
            TBFORN.NORAZAOSOCIAL AS NOFORNECEDOR,
            TBFORN.NUCNPJ AS CNPJFORN,
            TBFORN.NUINSCESTADUAL AS INSCESTFORN,
            TBFORN.EEMAIL AS EMAILFORN,
            TBFORN.NUTELEFONE1 AS FONEFORN,
            TBFORN.EENDERECO AS ENDFORN,
            TBFORN.ENUMERO AS NUMEROFORN,
            TBFORN.ECOMPLEMENTO AS COMPFORN,
            TBFORN.EBAIRRO AS BAIRROFORN,
            TBFORN.ECIDADE AS CIDADEFORN,
            TBFORN.SGUF AS UFFORN,
            TBFORN.NUCEP AS CEPFORN,
            TBT.IDTRANSPORTADORA,
            TBT.NOFANTASIA AS NOMETRANSPORTADORA,
            TBA.IDANDAMENTO,
            TBA.DSANDAMENTO,
            TBA.DSSETOR,
            TBRP.MODPEDIDO,
            TBRP.NOVENDEDOR,
            TBRP.EEMAILVENDEDOR,
            TBRP.DTPEDIDO AS DTPEDIDONORMAL,
            TBRP.DTPREVENTREGA,
            TO_VARCHAR( TBRP.DTPREVENTREGA, 'YYYY-MM-DD') AS DTPREVENTREGAFORMATADA,
            TO_VARCHAR( TBRP.DTPREVENTREGA, 'DD-MM-YYYY HH24:MI:SS') AS DTENTREGAFORMATADA2,
            TBRP.TPFRETE,
            TBRP.OBSPEDIDO,
            TBRP.OBSPEDIDO2,
            TBRP.DTFECHAMENTOPEDIDO,
            TO_VARCHAR( TBRP.DTFECHAMENTOPEDIDO, 'YYYY-MM-DD') AS DTFECHAMENTOFORMATADA,
            TBRP.DTCADASTRO,
            TBRP.TPARQUIVO,
            TBRP.STDISTRIBUIDO,
            TBRP.STAGRUPAPRODUTO,
            CASE
                WHEN (TBRP_PEDIDO_SECUNDARIO.IDRESUMOPEDIDO IS NOT NULL AND TBRP_PEDIDO_SECUNDARIO.STMIGRADOSAP = 'False') THEN 'False'
                ELSE TBRP.STMIGRADOSAP
            END AS STMIGRADOSAP,
            TO_VARCHAR(TBRP.LOGSAP) AS LOGSAP,
            TO_VARCHAR( TBRP.DTPEDIDO, 'DD-MM-YYYY HH24:MI:SS') AS DTPEDIDO, 
            TO_VARCHAR( TBRP.DTPEDIDO, 'YYYY-MM-DD') AS DTPEDIDOFORMATADA,
            TO_VARCHAR( TBRP.DTPEDIDO, 'DD/MM/YYYY') AS DTPEDIDOFORMATADABR,
            TO_VARCHAR( TBRP.DTPREVENTREGA, 'DD/MM/YYYY') AS DTPREVENTREFAFORMATADABR,
            IFNULL( TBRP.NUTOTALITENS,0) AS NUTOTALITENS,
            IFNULL( TBRP.QTDTOTPRODUTOS,0) AS QTDTOTPRODUTOS,
            IFNULL( TBRP.VRTOTALBRUTO,0) AS VRTOTALBRUTO,
            IFNULL( TBRP.VRTOTALLIQUIDO,0) AS VRTOTALLIQUIDO,
            IFNULL( TBRP.DESCPERC01,0) AS DESCPERC01,
            IFNULL( TBRP.DESCPERC02,0) AS DESCPERC02,
            IFNULL( TBRP.DESCPERC03,0) AS DESCPERC03,
            IFNULL( TBRP.PERCCOMISSAO,0) AS PERCCOMISSAO,
            ( TBRP.TPFISCAL) AS TPFISCAL,
            TBRP.STRASCUNHO,
            CASE
                WHEN (TBRP_PEDIDO_SECUNDARIO.IDRESUMOPEDIDO IS NOT NULL AND TBRP_PEDIDO_SECUNDARIO.STCANCELADO = 'False') THEN 'False'
                ELSE TBRP.STCANCELADO
            END AS STCANCELADO,
            TBRP.IDRESUMOPEDIDOORIGEM,
            TBRP.IDRESPREATIVACAO,
            TO_VARCHAR(TBRP.TXTMOTIVOREATIVACAO) AS TXTMOTIVOREATIVACAO,
            TBRP.DTREATIVACAO,
            TBRP.STREATIVADO,
            TBRP.IDPEDIDOPRIMARIO,
            TBRP.STPEDIDOPRIMARIO,
            TBRP_PEDIDO_SECUNDARIO.IDRESUMOPEDIDO AS IDPEDIDOSECUNDARIO,
            TBRP_PEDIDO_ORIGEM.IDRESUMOPEDIDO AS IDRESUMOPEDIDODESTINO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBRP
        INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL TBSE ON 
            TBRP.IDSUBGRUPOEMPRESARIAL = TBSE.IDSUBGRUPOEMPRESARIAL 
        INNER JOIN "VAR_DB_NAME".ANDAMENTOS TBA ON 
            TBRP.IDANDAMENTO = TBA.IDANDAMENTO 
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBFUNC ON 
            TBRP.IDCOMPRADOR = TBFUNC.IDFUNCIONARIO 
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBFORN ON 
            TBRP.IDFORNECEDOR = TBFORN.IDFORNECEDOR 
        INNER JOIN "VAR_DB_NAME".TRANSPORTADORA TBT ON 
            TBRP.IDTRANSPORTADORA = TBT.IDTRANSPORTADORA 
        INNER JOIN "VAR_DB_NAME".CONDICAOPAGAMENTO TBC ON 
            TBRP.IDCONDICAOPAGAMENTO = TBC.IDCONDICAOPAGAMENTO
        LEFT JOIN "VAR_DB_NAME".RESUMOPEDIDO TBRP_PEDIDO_ORIGEM ON 
            TBRP.IDRESUMOPEDIDO = TBRP_PEDIDO_ORIGEM.IDRESUMOPEDIDOORIGEM
        LEFT JOIN "VAR_DB_NAME".RESUMOPEDIDO TBRP_PEDIDO_SECUNDARIO ON 
            TBRP.IDRESUMOPEDIDO = TBRP_PEDIDO_SECUNDARIO.IDPEDIDOPRIMARIO
        WHERE
            1 = ?
    `;
    
    if ( byId ) {
        query += ` AND TBRP.IDRESUMOPEDIDO = '${byId}' `;
    }
    
    query += ' ORDER BY TBRP.IDRESUMOPEDIDO DESC';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (var i = 0; i < response.data.length; i++) {
		let registro =  JSON.parse(JSON.stringify(response.data[i]));
        
        let fabricantes = getFabricantesPedido(registro.IDPEDIDO);
        let detalhesPedido = getDetalhePedido(registro.IDPEDIDO);
        
        registro.FABRICANTES = fabricantes;
        registro.DETALHEPEDIDO = detalhesPedido;
        
		data.push(registro);
	}

	response.data = data;

	return response;
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