var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(params, value) {
    if (value === null || value === undefined || isNaN(value)) {
        params.push(null);
    } else {
        params.push(parseInt(value, 10));
    }
}

function setStringOrNull(params, value) {
    if (value === null || value === undefined || value.trim() === '') {
        params.push(null);
    } else {
        params.push(value.trim());
    }
}

function fnHandleGet() {
  var conn = $.hdb.getConnection();

    var params = [];

    var idMarca = $.request.parameters.get("idMarca");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var grupo = $.request.parameters.get("grupo");
    var subgrupo = $.request.parameters.get("subgrupo");
    var descProduto = $.request.parameters.get("descProduto");
    var codBarras = $.request.parameters.get("codBarras");
    var estoque = $.request.parameters.get("estoque")
    var dataInicio = $.request.parameters.get("dataInicio");
    var dataFim = $.request.parameters.get("dataFim");

    
      if (isNaN(parseInt(idEmpresa))) {
        throw new Error("O Campo ID da Empresa deve ser um número!");
    }

    if (grupo && isNaN(parseInt(grupo))) {
        throw new Error("O Campo Grupo deve ser um número!");
    }

    if (subgrupo && isNaN(parseInt(subgrupo))) {
        throw new Error("O Campo Subgrupo deve ser um número!");
    }

    var query = `
      SELECT 
        h.IDHISTORICOALTERACAOPRECOPRODUTOEMPRESA,
        h.IDRESUMOALTERACAOPRECOPRODUTO, 
        e.IDEMPRESA, 
        e.IDGRUPOEMPRESARIAL, 
        h.PRECOVENDAANTERIOR, 
        h.PRECOVENDA,  
        h.DTHORAEXECUTADO, 
        h.DTHORAATUALIZADO, 
        h.STATIVO,
        h.STEXECUTADO, 
        h.STEXCLUIDO, 
        p.NUCODBARRAS, 
        p.DSNOME,
        p.PRECOCUSTO,
        s.IDSUBGRUPOESTRUTURA, 
        s.DSSUBGRUPOESTRUTURA,
        g.DSGRUPOESTRUTURA, 
        g.IDGRUPOESTRUTURA, 
        i.QTDFINAL,
        h.IDPRODUTO 
      FROM VAR_DB_NAME.HISTORICOALTERACAOPRECOPRODUTOEMPRESA h
      INNER JOIN VAR_DB_NAME.RESUMOALTERACAOPRECOPRODUTO r ON 
        h.IDRESUMOALTERACAOPRECOPRODUTO = r.IDRESUMOALTERACAOPRECOPRODUTO
      INNER JOIN VAR_DB_NAME.PRODUTO p ON 
        h.IDPRODUTO = p.IDPRODUTO
      LEFT JOIN VAR_DB_NAME.PRODUTO_PRECO pp ON 
        h.IDPRODUTO = pp.IDPRODUTO AND h.IDEMPRESA = pp.IDEMPRESA AND pp.STATIVO = 'True'
      LEFT JOIN  VAR_DB_NAME.EMPRESA e ON
      	h.IDEMPRESA = e.IDEMPRESA
      INNER JOIN VAR_DB_NAME.SUBGRUPOESTRUTURA s ON  
        p.IDSUBGRUPO = s.IDSUBGRUPOESTRUTURA
      INNER JOIN VAR_DB_NAME.GRUPOESTRUTURA g ON 
        s.IDGRUPOESTRUTURA = g.IDGRUPOESTRUTURA 
      LEFT JOIN VAR_DB_NAME.INVENTARIOMOVIMENTO i ON
        h.IDEMPRESA = i.IDEMPRESA AND h.IDPRODUTO = i.IDPRODUTO 
      WHERE 1 = ? 
    `;
    
    var params = [];

    if (idEmpresa > 0) {
        query += ` AND e.IDEMPRESA = ${idEmpresa} `;
    }
    if (idMarca > 0) {
        query += ` AND e.IDGRUPOEMPRESARIAL = ${idMarca} `;
    }

    if (grupo > 0) {
        query += ` AND g.IDGRUPOESTRUTURA = ${grupo} `;
    }

    if (subgrupo > 0) {
        query += ` AND s.IDSUBGRUPOESTRUTURA = ${subgrupo} `;
    }
    
    if (descProduto) {
      query += ` AND p.DSNOME LIKE '%${descProduto}%' `;
    }

    if (codBarras) {
      query += ` AND p.NUCODBARRAS = '${codBarras}' `;
    }

    if (estoque == 'false') {
        query += ` AND i.STATIVO = 'True' `;
    } else if (estoque == 'true') {
        query += ` `;
    }

    // if (estoque !== null && estoque !== undefined) {
    //     query += `
    //     AND (
    //         i.IDEMPRESA = h.IDEMPRESA
    //         AND i.IDPRODUTO = h.IDPRODUTO
    //         AND i.STATIVO = ${estoque == 'True' ? "'True'" : "'False'"}
    //     )`;
    // }
    
    // if (estoque === null || estoque === undefined) {
    //     query += ` AND i.STATIVO = 'True' `;
    // }
    
    if (dataInicio && dataFim) {
        query += ` AND h.DTHORAEXECUTADO BETWEEN '${dataInicio} 00:00:00' AND '${dataFim} 23:59:59' `;
    }

    var request = { 
        page: $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };

    // $.trace("Executing SQL Query: " + sql);
    // $.trace("With Parameters: " + JSON.stringify(params));
   
    api.responseWithQuery(query, request, 1);

}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ($.request.method) {
        case $.net.http.GET:
            var id = $.request.parameters.get("id")
            fnHandleGet(id);
            
            break;
    }
} catch (e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: "Erro ao executar consulta: " + e.message,
        idEmpresa: idEmpresa,
        grupo: grupo,
        params: params
    }));
    
    $.response.status = 400;
}
