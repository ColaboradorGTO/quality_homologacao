var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function fnHandleGet(byId) {
    
    var idPedido = $.request.parameters.get("idpedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var IdMarca = $.request.parameters.get("idMarcaPesquisa");
    var IdFornecedor = $.request.parameters.get("idFornPesquisa");
    
    var query =  ' SELECT ' +
        '   tbrp.IDRESUMOPEDIDO AS IDPEDIDO, ' +
        '   tbrp.IDGRUPOEMPRESARIAL AS IDGRUPOPEDIDO, ' +
        '   tbrp.IDSUBGRUPOEMPRESARIAL AS IDSUBGRUPOPEDIDO, ' +
        '   EMP.DSSUBGRUPOEMPRESARIAL AS NOFANTASIA, ' +
        '   FC.IDFUNCIONARIO AS IDCOMPRADOR, ' +
        '   FC.NOFUNCIONARIO AS NOMECOMPRADOR, ' +
        '   CDP.IDCONDICAOPAGAMENTO, ' +
        '   CDP.DSCONDICAOPAG, ' +
        '   CDP.NUPARCELAS, ' +
        '   CDP.QTDDIAS, ' +
        '   CDP.NUNDIA1PAG, ' +
        '   CDP.NUNDIA2PAG, ' +
        '   CDP.NUNDIA3PAG, ' +
        '   CDP.NUNDIA4PAG, ' +
        '   CDP.NUNDIA5PAG, ' +
        '   CDP.NUNDIA6PAG, ' +
        '   CDP.NUNDIA7PAG, ' +
        '   CDP.NUNDIA8PAG, ' +
        '   CDP.NUNDIA9PAG, ' +
        '   CDP.NUNDIA10PAG, ' +
        '   CDP.NUNDIA11PAG, ' +
        '   CDP.NUNDIA12PAG, ' +
        '   CDP.TPDOCUMENTO, ' +
        '   FN.IDFORNECEDOR AS IDFORNECEDOR, ' +
        '   FN.NOFANTASIA AS NOFANTASIAFORNECEDOR, ' +
        '   FN.NORAZAOSOCIAL AS NOFORNECEDOR, ' +
        '   FN.NUCNPJ AS CNPJFORN, ' +
        '   TP.IDTRANSPORTADORA, ' +
        '   TP.NOFANTASIA AS NOMETRANSPORTADORA, ' +
        '   AD.IDANDAMENTO, ' +
        '   AD.DSANDAMENTO, ' +
        '   AD.DSSETOR, ' +
        '   tbrp.MODPEDIDO, ' +
        '   tbrp.DTPEDIDO AS DTPEDIDONORMAL, ' +
        '   tbrp.DTPREVENTREGA, ' +
        '   TO_VARCHAR( tbrp.DTPREVENTREGA, \'YYYY-MM-DD\') AS DTPREVENTREGAFORMATADA, ' +
        '   TO_VARCHAR( tbrp.DTPREVENTREGA, \'DD-MM-YYYY\') AS DTENTREGAFORMATADA2, ' +
        '   tbrp.TPFRETE, ' +
        '   tbrp.OBSPEDIDO, ' +
        '   tbrp.OBSPEDIDO2, ' +
        '   tbrp.DTFECHAMENTOPEDIDO, ' +
        '   TO_VARCHAR( tbrp.DTFECHAMENTOPEDIDO, \'YYYY-MM-DD\') AS DTFECHAMENTOFORMATADA, ' +
        '   tbrp.DTCADASTRO, ' +
        '   TO_VARCHAR( tbrp.DTPEDIDO, \'DD-MM-YYYY HH24:MI:SS\') AS DTPEDIDO, ' + 
        '   TO_VARCHAR( tbrp.DTPEDIDO, \'YYYY-MM-DD\') AS DTPEDIDOFORMATADA, ' +
        '   IFNULL( tbrp.NUTOTALITENS,0) AS NUTOTALITENS, ' +
        '   IFNULL( tbrp.QTDTOTPRODUTOS,0) AS QTDTOTPRODUTOS, ' +
        '   IFNULL( tbrp.VRTOTALBRUTO,0) AS VRTOTALBRUTO, ' +
        '   IFNULL( tbrp.VRTOTALLIQUIDO,0) AS VRTOTALLIQUIDO, ' +
        '   ( tbrp.TPFISCAL) AS TPFISCAL, ' +
    	'   tbrp.STCANCELADO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".RESUMOPEDIDO tbrp ' +
        '   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL EMP ON tbrp.IDSUBGRUPOEMPRESARIAL = EMP.IDSUBGRUPOEMPRESARIAL  ' +
        '   INNER JOIN "VAR_DB_NAME".ANDAMENTOS AD ON tbrp.IDANDAMENTO = AD.IDANDAMENTO  ' +
        '   LEFT JOIN "VAR_DB_NAME".FORNECEDOR FN ON tbrp.IDFORNECEDOR = FN.IDFORNECEDOR  ' +
        '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO FC ON tbrp.IDCOMPRADOR = FC.IDFUNCIONARIO  ' +
        '   LEFT JOIN "VAR_DB_NAME".TRANSPORTADORA TP ON tbrp.IDTRANSPORTADORA = TP.IDTRANSPORTADORA  ' +
        '   INNER JOIN "VAR_DB_NAME".CONDICAOPAGAMENTO CDP ON tbrp.IDCONDICAOPAGAMENTO = CDP.IDCONDICAOPAGAMENTO  ' +
        ' WHERE ' +
        '	1 = ?';
    if ( byId ) {
        query = query + ' And  tbrp.IDRESUMOPEDIDO = \'' + byId + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  tbrp.IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }
    if ( IdMarca ) {
        query = query + ' And  tbrp.IDSUBGRUPOEMPRESARIAL = \'' + IdMarca + '\' ';
    }
    if ( IdFornecedor ) {
        query = query + ' And  tbrp.IDFORNECEDOR = \'' + IdFornecedor + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbrp.DTPEDIDO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    query = query + ' ORDER BY tbrp.IDRESUMOPEDIDO DESC';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1); 
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;           
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}