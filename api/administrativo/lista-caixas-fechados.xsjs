var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    
    
    var dataFechamento = $.request.parameters.get("dataFechamento");
    
    var queryDeResumo = ' SELECT ' +
        '   MC.ID AS IDMOVIMENTO, ' +
        '   MC.IDCAIXA AS IDCAIXAFECHAMENTO, ' +
        '   CX.DSCAIXA AS DSCAIXAFECHAMENTO, ' +
        '   TO_VARCHAR( MC.DTABERTURA, \'DD-MM-YYYY HH24:MI:SS\') AS DTHORAABERTURACAIXA, ' +
        '   TO_VARCHAR( MC.DTFECHAMENTO, \'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFECHAMENTOCAIXA, ' +
        '   FC.NOFUNCIONARIO AS OPERADORFECHAMENTO, ' +
        '   ( MC.VRFISICODINHEIRO) AS TOTALFECHAMENTODINHEIROFISICO, ' +
        '   ( MC.VRRECDINHEIRO) AS TOTALFECHAMENTODINHEIRO, ' +
        '   IFNULL ( MC.VRAJUSTDINHEIRO,0) AS TOTALFECHAMENTODINHEIROAJUSTE, ' +
        '   ( MC.VRRECTEF) AS TOTALFECHAMENTOCARTAO, ' +
        '   ( MC.VRRECPOS ) AS TOTALFECHAMENTOPOS, ' +
        '   ( MC.VRRECVOUCHER ) AS TOTALFECHAMENTOVOUCHER, '+
    	'   ( MC.VRRECFATURA ) AS TOTALFECHAMENTOFATURA, ' +
    	'   ( MC.VRRECCONVENIO ) AS TOTALFECHAMENTOCONVENIO, ' +
    	'   ( MC.VRRECPIX ) AS TOTALFECHAMENTOPIX, ' +
    	'   ( MC.VRRECPL ) AS TOTALFECHAMENTOCPL, ' +
    	'   MC.STCONFERIDO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".MOVIMENTOCAIXA MC ' +
        '   LEFT JOIN "VAR_DB_NAME".CAIXA CX ON MC.IDCAIXA = CX.IDCAIXAWEB  ' +
        '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO FC ON MC.IDOPERADOR = FC.IDFUNCIONARIO  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND MC.STCANCELADO = \'False\'';
        
    
    if(idDaEmpresa) {
        queryDeResumo = queryDeResumo + ' AND MC.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    
        if(dataFechamento) {
            queryDeResumo = queryDeResumo + ' AND (MC.DTABERTURA BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\')';
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