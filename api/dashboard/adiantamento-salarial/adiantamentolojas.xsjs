let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let idMarca = $.request.parameters.get("idMarca");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaIni");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    let query = `
        SELECT
            TBA.IDEMPRESA,
            TBA.IDADIANTAMENTOSALARIO,
            TBA.IDFUNCIONARIO,
            TO_VARCHAR(TBA.DTLANCAMENTO,'DD-MM-YYYY') AS DTLANCAMENTO,
            TBA.TXTMOTIVO,
            TBA.VRVALORDESCONTO,
            TBA.STATIVO,
            TBF.NOFUNCIONARIO,
            TBF.NUCPF,
            TBE.NOFANTASIA,
            TBA.STATUS_BLOQUEIO_ATUALIZACAO,
            TBA.DOCENTRY_SAP_CONTAS_A_PAGAR,
            REPLACE(TO_VARCHAR(TBA.ERROR_LOG_SAP), '''', '') AS ERROR_LOG_SAP
        FROM
            "VAR_DB_NAME".ADIANTAMENTOSALARIAL TBA
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON 
            TBA.IDFUNCIONARIO = TBF.IDFUNCIONARIO
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBA.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            1 = ?
    `;
    
    if ( idMarca >0) {
        query += ` AND TBE.IDGRUPOEMPRESARIAL IN ('${idMarca}') `; 
    }
    
    if(idEmpresa > 0) {
        query += ` AND TBA.IDEMPRESA = '${idEmpresa}' `;
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
        query += ` AND (TO_DATE(TBA.DTLANCAMENTO)  BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }
    
    query += 'ORDER BY TO_DATE(TBA.DTLANCAMENTO), TBA.IDEMPRESA, TBA.IDADIANTAMENTOSALARIO';
    
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