var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataInicio = $.request.parameters.get("dataInicio");
    var dataFim = $.request.parameters.get("dataFim");    
    var statusCancelado = $.request.parameters.get("status");
    
    var query = 'SELECT '+ 
                '   TBC.IDCAIXAWEB, ' +
                '   TBC.DSCAIXA, ' +
                '   TBC.VSSISTEMA, '+
                '   TBF.NOFUNCIONARIO, ' +
                '   TBV.IDVENDA, ' +
                '   TBV.NFE_INFNFE_IDE_SERIE, ' +
                '   TBV.NFE_INFNFE_IDE_NNF, ' +
                '	TO_VARCHAR(TBV.DTHORAFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRTOTALPAGO, '+
                '   TBV.TXTMOTIVOCANCELAMENTO, ' +
                '   TBV.STCONTINGENCIA,' +
                '   TBV.IDMOVIMENTOCAIXAWEB,' +
                '   TMC.STCONFERIDO' +
                ' FROM '+
                '	"VAR_DB_NAME".VENDA TBV ' +
                '	INNER JOIN "VAR_DB_NAME".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB ' +
                '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO ' +
                '   LEFT JOIN "VAR_DB_NAME".MOVIMENTOCAIXA TMC ON TBV.IDMOVIMENTOCAIXAWEB = TMC.ID ' +
                ' WHERE '+
                '	1 = ?';
    if(statusCancelado) {
        query = query + ' AND TBV.STCANCELADO = \'' + statusCancelado + '\' ';
    }
    
    if(idEmpresa) {
        query = query + ' AND TBV.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataInicio) {
        query = query + ' AND (TBV.DTHORAFECHAMENTO  BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + dataFim + ' 23:59:59\')';
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