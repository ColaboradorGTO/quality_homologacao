var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
	let query = `
        SELECT
            TBV.IDVENDA,
            TBVD.IDVENDADETALHE,
            TBVD.CPROD AS IDPRODUTO,
            TBVD.XPROD AS DESCRICAO_PRODUTO,
            TBP.NUCODBARRAS AS CODIGO_BARRAS_PRODUTO,
            TBVD.QTD AS QUANTIDADE_VENDIDA,
            CASE
                WHEN TBVD.STTROCA = 'True' THEN TBVD.QTD
                ELSE COALESCE(TBDV.QTDTROCADA, 0)
            END AS QUANTIDADE_TROCADA,
            CASE
                WHEN TBVD.STTROCA = 'True' THEN 0 
                ELSE TBVD.QTD - COALESCE(TBDV.QTDTROCADA, 0)
            END AS QUANTIDADE_DISPONIVEL_PARA_TROCA,
			TBVD.VUNCOM AS VALOR_UNITARIO_PRODUTO_BRUTO,
			(COALESCE(TBVD.VDESC, 0) / TBVD.QTD) AS VALOR_DESCONTO_PRODUTO,
			TBVD.VUNCOM - (COALESCE(TBVD.VDESC, 0) / TBVD.QTD) AS VALOR_UNITARIO_PRODUTO_LIQUIDO,
			TBVD.VPROD AS VALOR_TOTAL_LINHA_PRODUTO_BRUTO,
			TBVD.VRTOTALLIQUIDO AS VALOR_TOTAL_LINHA_PRODUTO_LIQUIDO,
            TBVD.VENDEDOR_MATRICULA
        FROM
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".VENDADETALHE TBVD ON 
            TBV.IDVENDA = TBVD.IDVENDA
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON 
            TBVD.CPROD = TBP.IDPRODUTO 
        LEFT JOIN (
            SELECT
                TBD.IDVENDADETALHE,
                SUM(TBD.QTD) AS QTDTROCADA
            FROM
                "VAR_DB_NAME".DETALHEVOUCHER TBD
            INNER JOIN "VAR_DB_NAME".RESUMOVOUCHER TBR ON 
                TBR.IDVOUCHER = TBD.IDVOUCHER AND TBR.STCANCELADO = 'False'
            WHERE
                TBD.STCANCELADO = 'False'
            GROUP BY
                TBD.IDVENDADETALHE
        ) TBDV ON 
            TBVD.IDVENDADETALHE = TBDV.IDVENDADETALHE
        WHERE
            TBV.STCANCELADO = 'False'
            AND TBVD.STCANCELADO = 'False'
            AND TBVD.IDVENDA = ?
        ORDER BY 
            TBVD.IDVENDADETALHE
    `;
    
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};
    
	api.responseWithQuery(query, request, byId);
	
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			//$.response.setBody(JSON.stringify(fnHandleGet(id)));
			fnHandleGet(id);
			break;
        default:
            break;
	
	}

} catch (e) {
$.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}