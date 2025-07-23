var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var query = ' SELECT ' +
        ' IFNULL (SUM(tbv.VRRECDINHEIRO+tbv. VRRECCARTAO+tbv.VRRECPOS+tbv.VRRECCONVENIO),0) AS VALORTOTALMES '+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbv.STCANCELADO = \'False\'';

    if(dataPesquisa) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
    }

   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}