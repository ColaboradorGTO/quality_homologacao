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

function ObterDistribuicaoPedidos(IdDistribuicaoCompras){

    var query =  'SELECT DISTINCT' +
                    '   dc."IDDISTRIBUICAOCOMPRAS", dc."OBSERVACAO", dpi."IDFILIALDESTINO", e."NOFANTASIA"' +
                    '   ,dp."IDDISTRIBUICAOPEDIDOS", dp."DATACRIACAO", dp."STATIVO", dp."IDRESUMOOT", dp."IDFILIALORIGEM"' +
                    '   ,dp."CONFEREPEDIDO", dp."LOGCANCEL", dp."IDUSUARIOCANCEL", dp."LOGCRIACAO", dp."IDUSUARIO"' +
                    '   ,CASE WHEN dp."IDDISTRIBUICAOPEDIDOS" IS NULL THEN \'Pendente\' ELSE \'Enviado\' END AS STATUS ' +
                    'FROM "VAR_DB_NAME"."DQ_DISTRIBUICAOCOMPRAS" dc ' +
                    'INNER JOIN "VAR_DB_NAME"."DQ_DISTRIBUICAOPRODUTOITENS" dpi ON dpi."IDDISTRIBUICAOCOMPRAS" = dc."IDDISTRIBUICAOCOMPRAS" ' +
                    'INNER JOIN "VAR_DB_NAME"."EMPRESA" e ON e."IDEMPRESA" = dpi."IDFILIALDESTINO" ' +
                    'LEFT JOIN "VAR_DB_NAME"."DQ_DISTRIBUICAOPEDIDOS" dp ON dp."IDDISTRIBUICAOCOMPRAS" = dc."IDDISTRIBUICAOCOMPRAS" AND dp."IDFILIALDESTINO" = dpi."IDFILIALDESTINO" ' +
                    'WHERE 1 = ? ' +
                    'AND dc."IDDISTRIBUICAOCOMPRAS" = ' + IdDistribuicaoCompras + ' ' +
                    'ORDER BY e."NOFANTASIA"';
    var retDistribuicaoPedidos = api.sqlQuery(query, 1);
	var data = [];

	for(var i = 0; i < retDistribuicaoPedidos.length; i++){
        var registro = retDistribuicaoPedidos[i];
        var distribuicaopedidos = {
            "IdDistribuicaoCompras": registro.IDDISTRIBUICAOCOMPRAS
            ,"Observacao": registro.OBSERVACAO
            ,"IdFilialDestino": registro.IDFILIALDESTINO
            ,"NoFilialDestino": registro.NOFANTASIA
            ,"IdDistribuicaoPedidos": registro.IDDISTRIBUICAOPEDIDOS
            ,"DataCriacao": registro.DATACRIACAO
            ,"StAtivo": registro.STATIVO
            ,"IdResumoOT": registro.IDRESUMOOT
            ,"IdFilialOrigem": registro.IDFILIALORIGEM
            ,"ConferePedido": registro.CONFEREPEDIDO
            ,"LogCancel": registro.LOGCANCEL
            ,"IdUsuarioCancel": registro.IDUSUARIOCANCEL
            ,"LogCriacao": registro.LOGCRIACAO
            ,"IdUsuario": registro.IDUSUARIO
            ,"Status": registro.STATUS
        };
        data.push(distribuicaopedidos);
	}
	return data;
}

function ObterDistribuicaoProdutoItens(IdDistribuicaoCompras, IdProdutosNotas){

    var query =  'SELECT' +
                    '   dpi."IDDISTRIBUICAOPRODUTOITENS", dpi."IDDISTRIBUICAOCOMPRAS", dpi."DATACRIACAO", dpi."STATIVO", dpi."IDFILIALDESTINO", e."NOFANTASIA", dpi."IDPRODUTOSNOTAS", dpi."QUANTIDADE" ' +
                    'FROM "VAR_DB_NAME"."DQ_DISTRIBUICAOPRODUTOITENS" dpi ' +
                    'INNER JOIN "VAR_DB_NAME"."EMPRESA" e ON e.IDEMPRESA = dpi.IDFILIALDESTINO ' +
                    'WHERE 1 = ? ' +
                    'AND dpi."IDDISTRIBUICAOCOMPRAS" = ' + IdDistribuicaoCompras + ' ' +
                    'AND dpi."IDPRODUTOSNOTAS" = ' + IdProdutosNotas + ' ' +
                    'ORDER BY dpi."IDPRODUTOSNOTAS" ';
    var retDistribuicaoProdutoItens = api.sqlQuery(query, 1);
	var data = [];

	for(var i = 0; i < retDistribuicaoProdutoItens.length; i++){
        var registro = retDistribuicaoProdutoItens[i];
        var distribuicaoprodutoitens = {
            "IdDistribuicaoProdutoItens": registro.IDDISTRIBUICAOPRODUTOITENS
            ,"IdDistribuicaoCompras": registro.IDDISTRIBUICAOCOMPRAS
            ,"DataCriacao": registro.DATACRIACAO
            ,"StAtivo": registro.STATIVO
            ,"IdFilialDestino": registro.IDFILIALDESTINO
            ,"NoFilialDestino": registro.NOFANTASIA
            ,"IdProdutosNotas": registro.IDPRODUTOSNOTAS
            ,"Quantidade": registro.QUANTIDADE
        };
        data.push(distribuicaoprodutoitens);
	}
	return data;
}

function ObterProdutosNotas(IdDistribuicaoCompras){

    var query =   'SELECT' +
                    '   pn."IDPRODUTOSNOTAS", pn."IDDISTRIBUICAOCOMPRAS", pn."DATACRIACAO", pn."STATIVO", pn."IDPRODUTO", pn."DSNOME"' +
                    '   ,pn."NUCODBARRAS", pn."IDLINHASAP", pn."QTDPRODUTO", pn."PRECO", pn."TOTAL", pn."IDNOTASAP"' +
                    '   ,(SELECT SUM(DISTINCT pn1.QTDPRODUTO) - SUM(dpi.QUANTIDADE) ' +
                    '       FROM "VAR_DB_NAME".DQ_PRODUTOSNOTAS pn1 ' + 
                    '       INNER JOIN "VAR_DB_NAME".DQ_DISTRIBUICAOPRODUTOITENS dpi ON dpi.IDPRODUTOSNOTAS = pn1.IDPRODUTOSNOTAS AND dpi.STATIVO = \'True\' ' +
                    '       WHERE pn1.STATIVO = \'True\' ' +
                    '       AND pn1.IDNOTASAP = pn.IDNOTASAP ' +
                    '       AND pn1.IDPRODUTO = pn.IDPRODUTO) AS QTDRESTANTE ' +
                    '   ,nc.NUMNOTAFISCAL, nc.STSALDO ' +
                    'FROM "VAR_DB_NAME"."DQ_PRODUTOSNOTAS" pn ' +
                    'INNER JOIN "VAR_DB_NAME"."DQ_NOTASCOMPRAS" nc ON nc.IDDISTRIBUICAOCOMPRAS = pn.IDDISTRIBUICAOCOMPRAS AND nc.IDNOTASAP = pn.IDNOTASAP ' +
                    'WHERE 1 = ? ' +
                    'AND pn."IDDISTRIBUICAOCOMPRAS" = ' + IdDistribuicaoCompras + ' ';
    var retProdutosNotas = api.sqlQuery(query, 1);
	var data = [];

	for(var i = 0; i < retProdutosNotas.length; i++){
        var registro = retProdutosNotas[i];
        var produtosnotas = {
            "IdProdutosNotas": registro.IDPRODUTOSNOTAS
            ,"IdDistribuicaoCompras": registro.IDDISTRIBUICAOCOMPRAS
            ,"DataCriacao": registro.DATACRIACAO
            ,"StAtivo": registro.STATIVO
            ,"IdProduto": registro.IDPRODUTO
            ,"DsNome": registro.DSNOME
            ,"NuCodBarras": registro.NUCODBARRAS
            ,"IdLinhaSap": registro.IDLINHASAP
            ,"QtdProduto": registro.QTDPRODUTO
            ,"Preco": registro.PRECO
            ,"Total": registro.TOTAL
            ,"QtdRestante": registro.QTDRESTANTE
            ,"IdNotaSap": registro.IDNOTASAP
            ,"DistribuicaoProdutoItens": ObterDistribuicaoProdutoItens(registro.IDDISTRIBUICAOCOMPRAS, registro.IDPRODUTOSNOTAS)
            ,"NumNotaFiscal": registro.NUMNOTAFISCAL
            ,"StSaldo": registro.STSALDO
        };
        data.push(produtosnotas);
	}
	return data;
}

function ObterNotasCompras(IdDistribuicaoCompras){

    var query =   'SELECT' +
                    '   "IDNOTASCOMPRAS", "IDDISTRIBUICAOCOMPRAS", "DATACRIACAO", "STATIVO", "IDNOTASAP", "STSALDO", "NUMNOTAFISCAL" ' +
                    'FROM "VAR_DB_NAME"."DQ_NOTASCOMPRAS" ' +
                    'WHERE 1 = ? ' +
                    'AND "IDDISTRIBUICAOCOMPRAS" = ' + IdDistribuicaoCompras + ' ';
    var retNotasCompras = api.sqlQuery(query, 1);
	var data = [];

	for(var i = 0; i < retNotasCompras.length; i++){
        var registro = retNotasCompras[i];
        var notascompras = {
            "IdNotasCompras": registro.IDNOTASCOMPRAS
            ,"IdDistribuicaoCompras": registro.IDDISTRIBUICAOCOMPRAS
            ,"DataCriacao": registro.DATACRIACAO
            ,"StAtivo": registro.STATIVO
            ,"IdNotaSap": registro.IDNOTASAP
            ,"StSaldo": registro.STSALDO
            ,"NumNotaFiscal": registro.NUMNOTAFISCAL
        };
        data.push(notascompras);
	}
	return data;
}

function fnHandleGet(byId) {

    var query = 'SELECT' +
                '   dc.IDDISTRIBUICAOCOMPRAS, dc.DATACRIACAO, dc.OBSERVACAO, dc.STATIVO, dc.IDFILIALORIGEM, dc.IDFABRICANTE' +
                '   ,dc.IDTIPOMERCADORIA, dc.IDUSUARIO ' +
                'FROM "VAR_DB_NAME".DQ_DISTRIBUICAOCOMPRAS dc ' +
                'WHERE 1 = ? ';
    if(byId){
        query = query + 'AND dc.IDDISTRIBUICAOCOMPRAS = ' + byId + '\ ';
    }

	var retDistribuicao = api.sqlQuery(query, 1);
	var data = [];
  
	for(var i = 0; i < retDistribuicao.length; i++){
        var registro = retDistribuicao[i];
        var distribuicao = {
            "IdDistribuicaoCompras": registro.IDDISTRIBUICAOCOMPRAS
            ,"DataCriacao": registro.DATACRIACAO
            ,"Observacao": registro.OBSERVACAO
            ,"StAtivo": registro.STATIVO
            ,"IdFilialOrigem": registro.IDFILIALORIGEM
            ,"IdFabricante": registro.IDFABRICANTE
            ,"IdTipoMercadoria": registro.IDTIPOMERCADORIA
            ,"IdUsuario": registro.IDUSUARIO
            ,"NotasCompras": ObterNotasCompras(registro.IDDISTRIBUICAOCOMPRAS)
            ,"ProdutosNotas": ObterProdutosNotas(registro.IDDISTRIBUICAOCOMPRAS)
            ,"DistribuicaoPedidos": ObterDistribuicaoPedidos(registro.IDDISTRIBUICAOCOMPRAS)
        };
        data.push(distribuicao);
	}
	return data;
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ($.request.method) {
        //Handle your PUT calls here
        /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
        break;
        
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
            $.response.setBody(JSON.stringify(doc));
        break;*/
        
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
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