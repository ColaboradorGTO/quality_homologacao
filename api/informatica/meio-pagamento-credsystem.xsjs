var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataInicio = $.request.parameters.get("dtInicio");
    var dataFim = $.request.parameters.get("dtFim");    
    
    var query = `SELECT DISTINCT 
                	TBV.DEST_CPF AS CPF_CLIENTE,
                	TBV.IDVENDA  AS COD_CUPOM,
                	TBV.DTHORAFECHAMENTO AS DT_COMPRA,
                	UPPER(TBVP.DSTIPOPAGAMENTO) AS TP_PAGTO,
                	TBV.VRTOTALPAGO AS VL_COMPRA,
                	TBE.NOFANTASIA AS NOME_EMP_FIDELDD,
                	NULL AS NOME_PARC_CRED,
                	NULL  AS COD_LOJA_PRC_CRD,
                	TBVP.DTPROCESSAMENTO AS DT_INCLUSAO_DW
                FROM
                	"VAR_DB_NAME".VENDA TBV
                INNER JOIN "VAR_DB_NAME".VENDAPAGAMENTO TBVP ON
                	TBV.IDVENDA = TBVP.IDVENDA
                	AND CONTAINS(TBVP.DSTIPOPAGAMENTO,'CREDSYSTEM')
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