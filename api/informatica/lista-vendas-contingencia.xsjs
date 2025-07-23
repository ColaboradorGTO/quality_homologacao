var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInic = $.request.parameters.get("dataPesquisaInic");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
 
    var queryDeResumo = 'SELECT '+ 
                '   TBC.IDCAIXAWEB, ' +
                '   tbe.NOFANTASIA,' +
                '   TBC.DSCAIXA, ' +
                '   TBF.NOFUNCIONARIO, ' +
                '   TBV.IDVENDA, ' +
                '   TBV.NFE_INFNFE_IDE_SERIE, ' +
                '   TBV.NFE_INFNFE_IDE_NNF, ' +
                '	TO_VARCHAR(TBV.DTHORAFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRTOTALPAGO, '+
                '   TBV.STCONTINGENCIA,' +
                '   TBV.PROTNFE_INFPROT_XMOTIVO' +
                ' FROM '+
                '	"VAR_DB_NAME".VENDA TBV ' +
                '	INNER JOIN "VAR_DB_NAME".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB ' +
                '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO ' +
                '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON TBV.IDEMPRESA = tbe.IDEMPRESA ' +
                ' WHERE '+
                '	1 = ?'+ 
                '   and TBV.STCANCELADO = \'False\''+
                '   and TBV.STCONTINGENCIA = \'True\'';

    if(idDaEmpresa) {
        queryDeResumo = queryDeResumo + ' AND TBV.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    
    if(dataPesquisaInic) {
            queryDeResumo = queryDeResumo + ' AND (TBV.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInic + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
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