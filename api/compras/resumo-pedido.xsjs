var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

    var dataPesqInicio = $.request.parameters.get("datapesqinicio");
    var dataPesqFim = $.request.parameters.get("datapesqfim");
    var IdFornecedor = parseInt($.request.parameters.get("idfornecedorpedido"));

    var query = ' SELECT ' +
                '   rp.IDRESUMOPEDIDO ' +
                '   ,rp.IDGRUPOEMPRESARIAL ' +
                '   ,rp.IDSUBGRUPOEMPRESARIAL ' +
                '   ,IFNULL(rp.IDEMPRESA, 0) AS IDEMPRESA ' +
                '   ,rp.IDCOMPRADOR ' +
                '   ,rp.IDCONDICAOPAGAMENTO ' +
                '   ,rp.IDFORNECEDOR ' +
                '   ,rp.IDTRANSPORTADORA ' +
                '   ,rp.IDANDAMENTO ' +
                '   ,IFNULL(rp.TPCATEGORIAPEDIDO, \'\') AS TPCATEGORIAPEDIDO ' +
                '   ,rp.MODPEDIDO ' +
                '   ,IFNULL(rp.TPFORNECEDOR, \'\') AS TPFORNECEDOR ' +
                '   ,rp.NOVENDEDOR ' +
                '   ,rp.EEMAILVENDEDOR ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTPEDIDO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTPEDIDO ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTPEDIDO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTPEDIDOFORMATADA ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTPREVENTREGA,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTPREVENTREGA ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTPREVENTREGA,\'DD/MM/YYYY\'), \'Não Informado\') AS DTPREVENTREGAFORMATADA ' +
                '   ,rp.TPFRETE ' +
                '   ,rp.NUTOTALITENS ' +
                '   ,rp.QTDTOTPRODUTOS ' +
                '   ,rp.VRTOTALBRUTO ' +
                '   ,rp.DESCPERC01 ' +
                '   ,rp.DESCPERC02 ' +
                '   ,rp.DESCPERC03 ' +
                '   ,rp.PERCCOMISSAO ' +
                '   ,rp.VRTOTALLIQUIDO ' +
                '   ,rp.OBSPEDIDO ' +
                '   ,rp.OBSPEDIDO2 ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTFECHAMENTOPEDIDO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTFECHAMENTOPEDIDO ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTFECHAMENTOPEDIDO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTFECHAMENTOPEDIDOFORMATADA ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTCADASTRO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTCADASTRO ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTCADASTRO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTCADASTROFORMATADA ' +
                '   ,IFNULL(rp.IDRESPCANCELAMENTO, 0) AS IDRESPCANCELAMENTO ' +
                '   ,IFNULL(rp.DSMOTIVOCANCELAMENTO, \'\') AS DSMOTIVOCANCELAMENTO ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTCANCELAMENTO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTCANCELAMENTO ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTCANCELAMENTO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTCANCELAMENTOFORMATADA ' +
                '   ,rp.TPARQUIVO ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTRECEBIMENTOPEDIDO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTRECEBIMENTOPEDIDO ' +
                '   ,IFNULL(TO_VARCHAR(rp.DTRECEBIMENTOPEDIDO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTRECEBIMENTOPEDIDOFORMATADA ' +
                '   ,rp.STDISTRIBUIDO ' +
                '   ,rp.STAGRUPAPRODUTO ' +
                '   ,rp.STCANCELADO ' +
                '   ,rp.TPFISCAL ' +
                '   ,IFNULL(rp.VRCOMISSAO, 0) AS VRCOMISSAO ' +
                '   ,ge.DSGRUPOEMPRESARIAL ' +
                ' FROM "VAR_DB_NAME".RESUMOPEDIDO rp ' +
                ' INNER JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL ge ON ge.IDGRUPOEMPRESARIAL = rp.IDGRUPOEMPRESARIAL ' +
                ' WHERE 1 = ? ' +
                ' AND   rp.IDANDAMENTO = 5 ';
    if(dataPesqInicio && dataPesqFim){
        query = query + ' AND rp.DTFECHAMENTOPEDIDO BETWEEEN \'' + dataPesqInicio + ' 00:00:00\' AND \'' + dataPesqFim + ' 00:00:00\' ';
    }
    if(IdFornecedor){
        query = query + ' AND rp.IDFORNECEDOR = \'' + IdFornecedor + '\' ';
    }

    /*$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(query));
	$.response.status = $.net.http.OK;
    return;*/

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };

    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ($.request.method) {
        //Handle your PUT calls here
        /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
        break;*/
        
        //Handle your POST calls here
        /*case $.net.http.POST:
            var doc = fnHandlePost();
            $.response.setBody(JSON.stringify(doc));
        break;*/
        
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
        break;
        
        default:
        break;
    }
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}