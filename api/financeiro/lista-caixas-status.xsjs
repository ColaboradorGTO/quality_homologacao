var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var idGrupo = $.request.parameters.get("idMarca");
    var dataInicioPesq = $.request.parameters.get("dataInicial");
    var dataFinalPesq = $.request.parameters.get("dataFinal");
   
    
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
    	'   MC.STCONFERIDO, ' +
    	'   MC.STFECHADO, '+
    	'   E.NOFANTASIA'+
        ' FROM ' +
        '	"VAR_DB_NAME".MOVIMENTOCAIXA MC ' +
        '   LEFT JOIN "VAR_DB_NAME".CAIXA CX ON MC.IDCAIXA = CX.IDCAIXAWEB  ' +
        '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO FC ON MC.IDOPERADOR = FC.IDFUNCIONARIO  ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA E ON E.IDEMPRESA = MC.IDEMPRESA  ' + 
        ' WHERE ' +
        '	1 = ?'+
        '   AND MC.STCANCELADO = \'False\'';
        
    
    if(idDaEmpresa > 0) {
        queryDeResumo = queryDeResumo + ' AND MC.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(idGrupo > 0) {
        queryDeResumo = queryDeResumo + ' AND E.IDGRUPOEMPRESARIAL = \'' + idGrupo + '\' ';
    }
    if(dataInicioPesq && dataFinalPesq) {
        queryDeResumo = queryDeResumo + ' AND (MC.DTABERTURA BETWEEN \'' + dataInicioPesq + ' 00:00:00\' AND \'' + dataFinalPesq + ' 23:59:59\')';
    }
    queryDeResumo = queryDeResumo + 'ORDER BY MC.DTABERTURA, MC.IDEMPRESA';
    
    
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