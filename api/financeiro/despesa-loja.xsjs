var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let idCategoria = $.request.parameters.get("idCategoria");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let idDespesaLoja = $.request.parameters.get("idDespesaLoja");
    
    let query = `
        SELECT
            TBDL.IDEMPRESA,
            TBDL.IDDESPESASLOJA,
            TO_VARCHAR(TBDL.DTDESPESA, 'DD/MM/YYYY') AS DTDESPESA,
            TO_VARCHAR(TBDL.DTDESPESA, 'DD/MM/YYYY HH:MM') AS DTHORADESPESA,
            TBDL.IDCATEGORIARECEITADESPESA,
            TBCRD.DSCATEGORIA AS DSCATEGORIA,
            TBDL.VRDESPESA,
            TBDL.DSHISTORIO,
            TBDL.DSPAGOA,
            TBDL.NUNOTAFISCAL,
            TBDL.STATIVO,
            TBDL.TPNOTA,
            TBDL.STCANCELADO,
            TBF.IDFUNCIONARIO,
            TBF.NOFUNCIONARIO,
            TBFV.NOFUNCIONARIO AS NOFUNCVALE,
            TBF.NOLOGIN,
            TBE.NUCNPJ,
            TBE.NOFANTASIA,
            TBDL.STATUS_BLOQUEIO_ATUALIZACAO,
            TBDL.DOCENTRY_SAP_CONTAS_A_PAGAR,
            TBDL.ERROR_LOG_SAP
        FROM
            "VAR_DB_NAME".DESPESALOJA TBDL
        INNER JOIN "VAR_DB_NAME".CATEGORIARECEITADESPESA TBCRD ON 
            TBDL.IDCATEGORIARECEITADESPESA = TBCRD.IDCATEGORIARECDESP
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBDL.IDEMPRESA = TBE.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON 
            TBF.IDFUNCIONARIO = TBDL.IDUSR
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFV ON 
            TBDL.IDFUNCIONARIO = TBFV.IDFUNCIONARIO
        WHERE
            1 = ?
    `;
        
    if(idDespesaLoja){
        query += ` AND TBDL.IDDESPESASLOJA = '${idDespesaLoja}' `;
    }
    
    if(idEmpresa > 0) {
        query += ` AND TBDL.IDEMPRESA = '${idEmpresa}' `;
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
        query += ` AND (TO_DATE(TBDL.DTDESPESA) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }
    
    if(idCategoria) {
        query += ` AND TBDL.IDCATEGORIARECEITADESPESA = '${idCategoria}' `;
    }
    
    query += ' ORDER BY TBDL.IDDESPESASLOJA, TBDL.IDEMPRESA ';
    
   let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}