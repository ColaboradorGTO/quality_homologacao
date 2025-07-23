var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesqInicio = $.request.parameters.get("dataInicial");
    var dataPesqFim = $.request.parameters.get("dataFinal");
    var dsDescricao = $.request.parameters.get("DSdesc");
    
    var query = ' SELECT tbresb.IDRESUMOBALANCO, ' +
        ' tbresb.IDEMPRESA, '+
        ' tbe.NOFANTASIA, '+
        ' tbresb.DSRESUMOBALANCO, '+
        ' TO_VARCHAR( tbresb.DTABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTABERTURA, ' +
        ' TO_VARCHAR( tbresb.DTFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTFECHAMENTO, ' +
        ' tbresb.QTDTOTALITENS, ' +
        ' tbresb.QTDTOTALSOBRA, ' +
        ' tbresb.QTDTOTALFALTA, ' +
        ' tbresb.TXTOBSERVACAO, ' +
        ' tbresb.STATIVO, ' +
        ' tbresb.IDUSRFECHAMENTO, ' +
        ' tbresb.VRESTOQUEANTERIOR, ' +
        ' tbresb.DTESTOQUEANTERIOR, ' +
        ' tbresb.QTDTOTALANTERIOR, ' +
        ' tbresb.VRTOTALROMANEIO, ' +
        ' tbresb.DTPERIODOROMANEIO, ' +
        ' tbresb.VRALTAMERCADORIA, ' +
        ' tbresb.DTPERIODOALTA, ' +
        ' tbresb.SOBRAMERCADORIA, ' +
        ' tbresb.DTPERIODOSOBRA, ' +
        ' tbresb.TOTALGERALENTRADA, ' +
        ' tbresb.VRBAIXAMERCADORIA, ' +
        ' tbresb.DTPERIODOBAIXA, ' +
        ' tbresb.VRDEVOLUCAOMERCADORIA, ' +
        ' tbresb.DTPERIODODEVOLUCAO, ' +
        ' tbresb.VRFALTAMERCADORIA, ' +
        ' tbresb.DTPERIODOFALTAMERCADORIA, ' +
        ' tbresb.VRDESCONTOCAIXA, ' +
        ' tbresb.DTPERIODODESCONTOCAIXA, ' +
        ' tbresb.VRVENDACAIXA, ' +
        ' tbresb.DTPERIODOVENDACAIXA, ' +
        ' tbresb.TOTALGERALSAIDA, ' +
        ' tbresb.TOTALGERALPRESTARCONTA, ' +
        ' tbresb.VRESTOQUEATUAL, ' +
        ' tbresb.QTDTOTALENTRADA, ' +
        ' tbresb.QTDTOTALDEVOLVIDA, ' +
        ' tbresb.QTDTOTALCONTAGEM, ' +
        ' tbresb.VRTOTALFALTA, ' +
        ' tbresb.DTFALTA, ' +
        ' tbresb.PERCFALTA, ' +
        ' tbresb.OBSCONTAGEM, ' +
        ' tbresb.OBSDIVERGENCIACONTAGEM, ' +
        ' tbresb.OBSDIVERGENCIAGERENTE, ' +
        ' tbresb.STCANCELADO, ' +
        ' tbresb.IDUSRCANCELADO, ' +
        ' tbresb.TXTMOTIVOCANCELADO, ' +
        ' tbresb.STCONCLUIDO, ' +
        ' tbresb.STCONSOLIDADO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".RESUMOBALANCO tbresb ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbresb.IDEMPRESA =  tbe.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ? ';
    
    if(dsDescricao>0) {
        query = query + ' And tbresb.DSRESUMOBALANCO LIKE \'%'+dsDescricao+'%\' ';
    }
    
    if(idDaEmpresa>0) {
        query = query + ' AND tbresb.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    
    if(dataPesqInicio && dataPesqFim) {
        query = query + ' AND tbresb.DTABERTURA BETWEEN \'' + dataPesqInicio + ' 00:00:00\' AND \'' + dataPesqFim +' 23:59:59\' ';
    }
    query = query + ' AND tbresb.STCANCELADO = \'False\' ';
    query = query + ' ORDER BY IDRESUMOBALANCO DESC ';

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