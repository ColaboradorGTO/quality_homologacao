var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idCaixa = $.request.parameters.get("idCaixa");
    
    var queryDeResumo = ' SELECT ' +
        '   tbc.IDCAIXAWEB AS IDCAIXAFECHAMENTO, ' +
		'   tbc.DSCAIXA AS DSCAIXAFECHAMENTO, ' +
	    '   tbc.IDEMPRESA, '+ 
	    '   (SELECT MAX(NFE_INFNFE_IDE_NNF) from "QUALITY_CONC_HML".VENDA tbv WHERE tbv.IDEMPRESA = tbc.IDEMPRESA AND tbv.IDCAIXAWEB = tbc.IDCAIXAWEB) AS ULTNRNF '+
	    ' FROM ' +
        '	"QUALITY_CONC_HML".CAIXA tbc ' +
        ' WHERE ' +
        '	1 = ?';
    if(idCaixa) {
             queryDeResumo = queryDeResumo + ' AND tbc.IDCAIXAWEB = \'' + idCaixa + '\' ';
    }   
    if(idEmpresa) {
        queryDeResumo = queryDeResumo + ' AND tbc.IDEMPRESA = \'' + idEmpresa + '\' ';
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