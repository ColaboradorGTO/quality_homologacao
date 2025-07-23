var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT TOP 1 ' +  
    '   tbqc.IDQUEBRACAIXA, ' +
	'   tbqc.IDCAIXAWEB, ' +
	'   tbc.DSCAIXA, ' +
	'   tbqc.IDMOVIMENTOCAIXA, ' +
	'   tbqc.IDGERENTE, ' +
	'   tbqc.IDFUNCIONARIO, ' +
	'   TO_VARCHAR(tbqc.DTLANCAMENTO,\'DD-MM-YYYY\') AS DTLANCAMENTO, ' +
	'   tbqc.VRQUEBRASISTEMA, ' +
	'   tbqc.VRQUEBRAEFETIVADO, ' +
	'   tbqc.TXTHISTORICO, ' +
	'   tbqc.STATIVO, ' +
	'   tbe.NORAZAOSOCIAL,' +
    '   tbe.NOFANTASIA,' +
    '   tbe.NUCNPJ,' +
    '   tbe.EENDERECO,' +
    '   tbe.EBAIRRO,' +
    '   tbe.ECIDADE,' +
    '   tbe.SGUF,' +
    '   tbf.NOFUNCIONARIO AS NOMEOPERADOR,' +
    '   tbf.DSFUNCAO,' +
    '   tbf.NUCPF AS CPFOPERADOR,' +
    '   tbf1.NOFUNCIONARIO AS NOMEGERENTE' +
    ' FROM ' + 
    '   "VAR_DB_NAME".QUEBRACAIXA tbqc' +
    '   LEFT JOIN "VAR_DB_NAME".MOVIMENTOCAIXA tbmc ON tbqc.IDMOVIMENTOCAIXA = tbmc.ID' +
    '   LEFT JOIN "VAR_DB_NAME".EMPRESA tbe ON tbmc.IDEMPRESA = tbe.IDEMPRESA' +
    '   LEFT JOIN "VAR_DB_NAME".CAIXA tbc ON tbqc.IDCAIXAWEB = tbc.IDCAIXAWEB' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbqc.IDFUNCIONARIO = tbf.IDFUNCIONARIO' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf1 ON tbqc.IDGERENTE = tbf1.IDFUNCIONARIO' + 
    ' WHERE ' +
        '	1 = ? ';
    
    if ( byId ) {
        query = query + ' And  tbqc.IDQUEBRACAIXA = \'' + byId + '\' ';
    }
    
    query = query + ' ORDER BY tbqc.IDQUEBRACAIXA DESC';

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

        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}