var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Campo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var queryDeResumo = ' SELECT ' +
        '   IFNULL(SUM(rv.VRRECCARTAO), 0) AS VRECOMMERCE ' +
    	'   ,IFNULL(COUNT(rv.IDVENDA), 0) AS QTDVENDAS ' +
        ' FROM "VAR_DB_NAME".VENDA rv ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON rv.IDEMPRESA = tbe.IDEMPRESA ' +
        ' WHERE 1 = ? ' +
        ' AND rv.STCANCELADO = \'False\' '+
        ' AND rv.STECOMMERCE = \'True\' ';

    if(idDaEmpresa) {
        queryDeResumo = queryDeResumo + ' AND rv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    
        if(dataPesquisa) {
            queryDeResumo = queryDeResumo + ' AND (rv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
        }
    }

   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(queryDeResumo, request, 1);
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}