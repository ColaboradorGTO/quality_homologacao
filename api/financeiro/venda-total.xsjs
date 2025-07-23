var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var query = ' SELECT ' +
        ' IFNULL (SUM(tbv.VRRECDINHEIRO),0) AS VALORTOTALDINHEIRO, '+
        ' IFNULL (SUM(tbv. VRRECCARTAO),0) AS VALORTOTALCARTAO, '+
        ' IFNULL (SUM(tbv.VRRECCONVENIO),0) AS VALORTOTALCONVENIO, '+
        ' IFNULL (SUM(tbv.VRRECPOS),0) AS VALORTOTALPOS, '+
        ' IFNULL (SUM(tbv.VRRECVOUCHER),0) AS VALORTOTALVOUCHER, '+
        ' (SELECT IFNULL (SUM(tbdf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbdf WHERE tbdf.DTPROCESSAMENTO = \'' + dataPesquisa +'\') AS VALORTOTALFATURA,  '+
        ' (SELECT IFNULL (SUM(tbd.VRDESPESA),0) FROM "VAR_DB_NAME".DESPESALOJA tbd WHERE tbd.DTDESPESA = \'' + dataPesquisa +'\') AS VALORTOTALDESPESA,  '+
        ' (SELECT IFNULL (SUM(tbas.VRVALORDESCONTO),0) FROM "VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas WHERE tbas.DTLANCAMENTO = \'' + dataPesquisa +'\') AS VALORTOTALADIANTAMENTOSALARIAL  '+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbv.STCANCELADO = \'False\'';
        
    if(dataPesquisa) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
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