var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idMarca = $.request.parameters.get("idMarca");
    var dataPesqInicial = $.request.parameters.get("dataInicio"); 
    var dataPesqFinal = $.request.parameters.get("dataFim");

    var query2 = 'SELECT' + 
    ' TBE.IDEMPRESA, ' +
    ' TBE.NOFANTASIA, ' +
    ' TBE.IDGRUPOEMPRESARIAL, ' +
	' ROUND(SUM("QCOM")) as QTD,' + 
	' ROUND(SUM("VPROD"),2) as VALORPROD,' +
	' ROUND(SUM("VDESC"),2) as VALORDESCONTO,' +
	' ROUND(SUM("ICMS_VBC"),2) AS VALORNF' +
    ' FROM "QUALITY_CONC_HML"."VENDADETALHE" TBVD' +
    ' INNER JOIN "QUALITY_CONC_HML"."VENDA" TBV on TBVD.IDVENDA=TBV.IDVENDA' +
   
    ' INNER JOIN "QUALITY_CONC_HML"."EMPRESA" TBE on TBV.IDEMPRESA=TBE.IDEMPRESA ' +
    ' where 1=? and TBV.STCANCELADO=\'False\' AND TBVD.STCANCELADO=\'False\' AND TBV.STCONTINGENCIA = \'False\'';
    
    if(dataPesqInicial && dataPesqFinal){
        query2 = query2 + ' AND (TBV.DTHORAFECHAMENTO  BETWEEN \'' + dataPesqInicial + ' 00:00:00\' AND \'' + dataPesqFinal + ' 23:59:59\')';
    } 
    
    if(idMarca){
        query2 = query2 + ' AND TBE.IDGRUPOEMPRESARIAL='+idMarca;
    }

    query2 = query2 + ' GROUP BY TBE.IDEMPRESA, TBE.NOFANTASIA,TBE.IDGRUPOEMPRESARIAL';
    query2 = query2 + ' order by  TBE.IDEMPRESA ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query2, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}