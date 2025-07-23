var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Camnpo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var queryDeDespesa = ' SELECT ' +
        '   IFNULL(SUM( dl.VRDESPESA ),0) AS VRDESPESA  ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DESPESALOJA dl ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and dl.STCANCELADO = \'False\'';
    
    if(idDaEmpresa) {
        queryDeDespesa = queryDeDespesa + ' AND dl.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    
        if(dataPesquisa) {
            queryDeDespesa = queryDeDespesa + ' AND (dl.DTDESPESA  BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
        }
    }
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(queryDeDespesa, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}