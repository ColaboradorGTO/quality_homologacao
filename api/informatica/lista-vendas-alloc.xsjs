var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInic = $.request.parameters.get("dataPesquisaInic");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var stvendasalloc = $.request.parameters.get("stvendasalloc");
    var idVenda = $.request.parameters.get("idVenda");
    
 
    var queryDeResumo = ' SELECT ' +
        '   MC.IDEMPRESA, ' +
        '   MC.IDVENDA, ' +
        '   TO_VARCHAR( MC.DTEMVIO, \'DD-MM-YYYY HH24:MI:SS\') AS DTEMVIO, ' +
        '   TO_VARCHAR( MC.DTVENDA, \'DD-MM-YYYY HH24:MI:SS\') AS DTVENDA, ' +
        '   IFNULL(MC.IDRETORNOALLOC,0) AS IDRETORNOALLOC, ' +
        '   IFNULL(MC.CUPOM_CODIGO,0) AS CUPOM_CODIGO, ' +
        '   IFNULL(MC.IDRETORNOPAGAMENTO,0) AS IDRETORNOPAGAMENTO, ' +
        '   MC.TXT_VENDA, ' +
        '   MC.TXT_PAGAMENTO, ' +
        '   MC.TXTRETORNOALLOC, ' +
        '   MC.TXTRETORNOERROALLOC, ' +
    	'   MC.STSTATUS ' +
        ' FROM ' +
        '	"VAR_DB_NAME".INTEGRACAOVENDAALLOC MC ' +
        '   LEFT JOIN "VAR_DB_NAME".EMPRESA EMP ON MC.IDEMPRESA = EMP.IDEMPRESA  ' +
        ' WHERE ' +
        '	1 = ?';
        
    if(idVenda) {
        queryDeResumo = queryDeResumo + ' AND MC.IDVENDA = \'' + idVenda + '\' ';
    }
    
    if(idDaEmpresa) {
        queryDeResumo = queryDeResumo + ' AND MC.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    
    if(dataPesquisaInic) {
            queryDeResumo = queryDeResumo + ' AND (MC.DTVENDA BETWEEN \'' + dataPesquisaInic + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
        
    if(stvendasalloc) {
        if(stvendasalloc !== 'Todas'){
         queryDeResumo = queryDeResumo + ' AND MC.STSTATUS =\''+stvendasalloc+'\'';
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