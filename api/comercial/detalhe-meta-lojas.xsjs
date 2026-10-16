var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idDaMetaEmpresa = $.request.parameters.get("idMetaEmpresa");
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataInicio"); 
    var dataPesquisaFim = $.request.parameters.get("dataFim"); 

	var query = '   SELECT ' +
                '   T3.IDMETASLOJA,' +
                '   TO_VARCHAR( T3.DTMETAINICIO, \'DD-MM-YYYY\') AS DTMETAINICIO, ' +
                '   TO_VARCHAR( T3.DTMETAFIM, \'DD-MM-YYYY\') AS DTMETAFIM, ' +
                '   T3.IDGRUPOEMPRESA,' +
                '   T3.IDEMPRESA,' +
                '   T3.IDFUNCIONARIO,' +
                '   T3.VRVENDAGERAL,' +
                '   T3.VRMETAVENDAGERAL,' +
                '   T3.VRVENDACALCADOS,' +
                '   T3.PERCVENDACALCADOS,' +
                '   T3.VRMETAVENDACALCADOS,' +
                '   T3.PERCMETAVENDACALCADOS,' +
                '   T3.VRVENDAFEMVERINV,' +
                '   T3.PERCVENDAFEMVERINV,' +
                '   T3.VRMETAVENDAFEMVERINV,' +
                '   T3.PERCMETAVENDAFEMVERINV,' +
                '   T3.VRVENDAFEMPCINTIMA,' +
                '   T3.PERCVENDAFEMPCINTIMA,' +
                '   T3.VRMETAVENDAFEMPCINTIMA,' +
                '   T3.PERCMETAVENDAFEMPCINTIMA,' +
                '   T3.VRVENDAFEMACESSORIOS,' +
                '   T3.PERCVENDAFEMACESSORIOS,' +
                '   T3.VRMETAVENDAFEMACESSORIOS,' +
                '   T3.PERCMETAVENDAFEMACESSORIOS,' +
                '   T3.VRVENDAMASCVERINV,' +
                '   T3.PERCVENDAMASCVERINV,' +
                '   T3.VRMETAVENDAMASCVERINV,' +
                '   T3.PERCMETAVENDAMASCVERINV,' +
                '   T3.VRVENDAMASCPCINTIMA,' +
                '   T3.PERCVENDAMASCPCINTIMA,' +
                '   T3.VRMETAVENDAMASCPCINTIMA,' +
                '   T3.PERCMETAVENDAMASCPCINTIMA,' +
                '   T3.VRVENDAMASCACESSORIOS,' +
                '   T3.PERCVENDAMASCACESSORIOS,' +
                '   T3.VRMETAVENDAMASCACESSORIOS,' +
                '   T3.PERCMETAVENDAMASCACESSORIOS,' +
                '   T3.VRVENDAINFANTVERINV,' +
                '   T3.PERCVENDAINFANTVERINV,' +
                '   T3.VRMETAVENDAINFANTVERINV,' +
                '   T3.PERCMETAVENDAINFANTVERINV,' +
                '   T3.VRVENDAINFANTPCINTIMA,' +
                '   T3.PERCVENDAINFANTPCINTIMA,' +
                '   T3.VRMETAVENDAINFANTPCINTIMA,' +
                '   T3.PERCMETAVENDAINFANTPCINTIMA,' +
                '   T3.VRVENDAINFANTACESSORIOS,' +
                '   T3.PERCVENDAINFANTACESSORIOS,' +
                '   T3.VRMETAVENDAINFANTACESSORIOS,' +
                '   T3.PERCMETAVENDAINFANTACESSORIOS,' +
                '   T3.VRVENDACMB,' +
                '   T3.PERCVENDACMB,' +
                '   T3.VRMETAVENDACMB,' +
                '   T3.PERCMETAVENDACMB,' +
                '   T3.VRMETAVENDAOUTROS,' +
                '   T3.PERCMETAVENDAOUTROS,' +
                '   T3.PERCTOTALVENDA,' +
                '   T3.STATIVO,' +
		        '   T1.NOFANTASIA' +
        ' FROM ' +
		'   "VAR_DB_NAME".METASLOJAS T3 ' +
		'   INNER JOIN "VAR_DB_NAME".EMPRESA T1 ON T3.IDEMPRESA = T1.IDEMPRESA ' +
		' WHERE ' +
		'	1 = ? ' +
		'   AND T3.STATIVO <> \'False\' ';

	if (idDaMetaEmpresa) {
		query = query + ' And  T3.IDMETASLOJA = \'' + idDaMetaEmpresa + '\' ';
	}
	
	if (idDaEmpresa > 0) {
		query = query + ' And  T3.IDEMPRESA = \'' + idDaEmpresa + '\' ';
	}
	
	if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (T3.DTMETAINICIO = \'' + dataPesquisaInicio + ' 00:00:00\' AND T3.DTMETAFIM = \'' + dataPesquisaFim + ' 00:00:00\')';
    }

    query = query + ' ORDER BY T3.IDEMPRESA ';

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
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}