var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var IDGrupo = $.request.parameters.get("idgrupo");
    
    var query = ' SELECT ' +
        ' tbe.IDGRUPOEMPRESARIAL,'+
        ' tbe.IDEMPRESA, '+
        ' tbe.NOFANTASIA, '+
        ' IFNULL (SUM(tbv.VRRECDINHEIRO+tbv. VRRECCARTAO+tbv.VRRECPOS+tbv.VRRECCONVENIO),0) AS VALORTOTALVENDA '+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv ' +
        '	INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbv.STCANCELADO = \'False\'';

    if(dataPesquisa) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
    }
    query = query + ' AND tbe.IDGRUPOEMPRESARIAL = '+ IDGrupo +' ';
    query = query + ' GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA, tbe.IDGRUPOEMPRESARIAL ';
    query = query + ' ORDER BY SUM(tbv.VRRECDINHEIRO+tbv.VRRECCARTAO+tbv.VRRECPOS+tbv.VRRECCONVENIO) DESC';
    
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