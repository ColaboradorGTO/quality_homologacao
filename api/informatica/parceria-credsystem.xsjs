var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataInicio = $.request.parameters.get("dtInicio");
    var dataFim = $.request.parameters.get("dtFim");    
    
    var query = `SELECT
                	DISTINCT 
                	TBVD.IDVENDA AS AVC,
                	TBVP.NSUAUTORIZADORA AS NSU,
                	TBVD.QCOM AS QUANTIDADE,
                	TBVD.VUNCOM AS VALOR_UNITARIO,
                	TBV.VRTOTALPAGO AS TOTAL_VENDA,
                	(SELECT SUM(VALORRECEBIDO) FROM "VAR_DB_NAME".VENDAPAGAMENTO WHERE IDVENDA = TBV.IDVENDA GROUP BY IDVENDA) AS KALLANCARD,
                	TBVP.NOAUTORIZADOR AS ADMINISTRADORA,
                	TBP.NUCODBARRAS AS PRODUTO,
                	NULL AS DESCRICAO_COR,
                	NULL  AS LINHA,
                	VPEM.GRUPO AS GRUPO_PRODUTO, 
                	VPEM.SUBGRUPO AS SUBGRUPO_PRODUTO,
                	VPEM.MARCA,
                	TBVD.XPROD,
                	NULL AS DESC_COLECAO,
                	TBV.DTHORAFECHAMENTO AS DT_COMPRA
                FROM
                	"VAR_DB_NAME".VENDA TBV
                INNER JOIN "VAR_DB_NAME".VENDADETALHE TBVD ON
                	TBV.IDVENDA = TBVD.IDVENDA
                INNER JOIN "VAR_DB_NAME".VENDAPAGAMENTO TBVP ON
                	TBV.IDVENDA = TBVP.IDVENDA
                	AND CONTAINS(TBVP.DSTIPOPAGAMENTO,'CREDSYSTEM')
                LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA VPEM ON
                	TBVD.CPROD = VPEM.IDPRODUTO
                INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON 
                	TBVD.CPROD = TBP.IDPRODUTO
                INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
                	TBV.IDEMPRESA = TBE.IDEMPRESA
                WHERE
                	TBV.STCANCELADO = 'False' AND 1 = ?`;
    
   if(idEmpresa) {
        query = query + ' AND TBV.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataInicio) {
        query = query + ' AND (TBV.DTHORAFECHAMENTO  BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + dataFim + ' 23:59:59\')';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    query += ' ORDER BY TBV.DTHORAFECHAMENTO';
    
    api.responseWithQuery(query, request, 1);
    

} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}