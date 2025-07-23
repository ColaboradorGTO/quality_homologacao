var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idMovimentoCaixa = $.request.parameters.get("idMovimentoCaixa");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataCaixa = $.request.parameters.get("data");
     var idCaixa = $.request.parameters.get("idCaixa");
    
    var queryDeResumo = ' SELECT ' +
        '   tbmc.ID, ' +
		'   tbmc.IDCAIXA AS IDCAIXAFECHAMENTO, ' +
		'   tbc.DSCAIXA AS DSCAIXAFECHAMENTO, ' +
		'   TO_VARCHAR(tbmc.DTFECHAMENTO,\'DD-MM-YYYY HH:MM:SS\') AS DTHORAFECHAMENTOCAIXA, ' +
		'   TO_VARCHAR(tbmc.DTABERTURA,\'DD-MM-YYYY HH:MM:SS\') AS DTABERTURA, ' +
		'   TO_VARCHAR(tbmc.DTABERTURA,\'YYYY-MM-DD \') AS DTABERTURAMOVCAIXA, ' +
		'   tbf.NOLOGIN, ' +
		'   tbf.IDFUNCIONARIO AS IDOPERADORFECHAMENTO, ' +
		'   tbf.NUCPF AS NUCPF, ' +
		'   tbf.NOFUNCIONARIO AS OPERADORFECHAMENTO, ' +
		'   tbmc.VRFISICODINHEIRO AS TOTALFECHAMENTODINHEIROFISICO, ' +
		'   tbmc.VRRECDINHEIRO AS TOTALFECHAMENTODINHEIRO, ' +
		'   tbmc.VRRECFATURA AS TOTALFECHAMENTOFATURA, ' +
		'   IFNULL(tbmc.VRAJUSTDINHEIRO,0) AS TOTALAJUSTEDINHEIRO, ' +
		'   IFNULL(tbmc.VRAJUSTFATURA,0) AS TOTALAJUSTEFATURA, ' +
		'   IFNULL(tbmc.VRAJUSTTEF,0) AS TOTALAJUSTTEF, ' +
        '   IFNULL(tbmc.VRAJUSTPOS,0) AS TOTALAJUSTPOS, ' +
        '   IFNULL(tbmc.VRAJUSTCONVENIO,0) AS TOTALAJUSTCONVENIO, ' +
        '   IFNULL(tbmc.VRAJUSTVOUCHER,0) AS TOTALAJUSTVOUCHER, ' +
        '   IFNULL(tbmc.VRAJUSTPIX,0) AS TOTALAJUSTPIX, ' +
        '   IFNULL(tbmc.VRAJUSTPL,0) AS TOTALAJUSTPL, ' +
		'   tbmc.VRRECTEF AS TOTALFECHAMENTOTEF, ' +
		'   tbmc.VRRECPOS AS TOTALFECHAMENTOPOS, ' +
		'   tbmc.VRRECCONVENIO AS TOTALFECHAMENTOCONVENIO, ' +
		'   tbmc.VRRECVOUCHER AS TOTALFECHAMENTOVOUCHER, ' +
		'   tbmc.VRRECPIX AS TOTALFECHAMENTOPIX, ' +
		'   tbmc.VRRECPL AS TOTALFECHAMENTOCPL, ' +
		'   tbmc.VRQUEBRACAIXA AS TOTALFECHAMENTOVRQUEBRACAIXA, ' +
		'   tbmc.STCONFERIDO AS STCONFERIDOMOVIMENTO, ' +
		'   tbmc.STFECHADO AS STFECHADOMOVIMENTO, ' +
		'   tbmc.TXT_OBS, ' +
		'   tbqc.IDQUEBRACAIXA, ' +
		'   tbqc.TXTHISTORICO, ' +
		'   tbqc.VRQUEBRAEFETIVADO ' +
		' FROM ' +
        '	"VAR_DB_NAME".MOVIMENTOCAIXA tbmc ' +
        '	LEFT JOIN "VAR_DB_NAME".CAIXA tbc ON tbmc.IDCAIXA = tbc.IDCAIXAWEB ' +
		'	LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbmc.IDOPERADOR = tbf.IDFUNCIONARIO ' +
		'	LEFT JOIN "VAR_DB_NAME".QUEBRACAIXA tbqc ON tbmc.ID = tbqc.IDMOVIMENTOCAIXA ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and tbmc.STCANCELADO = \'False\'';
    
    
    if(idMovimentoCaixa) {
        queryDeResumo = queryDeResumo + ' AND tbmc.ID = \'' + idMovimentoCaixa + '\' ';
    }
    
    if(idEmpresa) {
        queryDeResumo = queryDeResumo + ' AND tbc.IDEMPRESA = \'' + idEmpresa + '\' ';
        if(dataCaixa) {
             queryDeResumo = queryDeResumo + ' AND (tbmc.DTABERTURA  BETWEEN \'' + dataCaixa + ' 00:00:00\' AND \'' + dataCaixa + ' 23:59:59\')';
        }
        if(idCaixa) {
             queryDeResumo = queryDeResumo + ' AND tbmc.IDCAIXA = \'' + idCaixa + '\' ';
        }
        queryDeResumo = queryDeResumo + ' AND tbmc.STFECHADO = \'False\' ';
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