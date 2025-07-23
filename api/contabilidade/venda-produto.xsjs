var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idMarca = $.request.parameters.get("idGrupoEmpresarial");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var uf = $.request.parameters.get("uf");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var produto = $.request.parameters.get("descricaoProduto");
    var idgrupograde = $.request.parameters.get("idGrupoGrade");
    var idgrade = $.request.parameters.get("idGrade");
    var dataPesqInicial = $.request.parameters.get("dataInicio"); 
    var dataPesqFinal = $.request.parameters.get("dataFim");

    var query2 = 'SELECT' + 	
    ' TBE.IDEMPRESA, ' +
    ' TBE.NOFANTASIA, ' +
    ' TO_VARCHAR(TBV.DTHORAFECHAMENTO,\'DD-MM-YYYY\') AS DataEmissao, ' +
	' ROUND(SUM("QCOM")) as QTD,' + 
	' ROUND(SUM("VDESC"),2) as ValorDesconto,' +
	' ROUND(SUM("VPROD"),2) as ValorProd,' +
	' ROUND(SUM("ICMS_VBC"),2) AS ValorNF' +
    ' FROM "QUALITY_CONC_HML"."VENDADETALHE" TBVD' +
    ' INNER JOIN "QUALITY_CONC_HML"."VENDA" TBV on TBVD.IDVENDA=TBV.IDVENDA' +
    ' LEFT JOIN "QUALITY_CONC_HML"."PRODUTOSAP" tbps on TBVD.CPROD = tbps.IDPRODUTO ' +
    ' INNER JOIN "QUALITY_CONC_HML"."EMPRESA" TBE on TBV.IDEMPRESA=TBE.IDEMPRESA ' +
    ' where 1=? and TBV.STCANCELADO=\'False\' AND TBV.STCONTINGENCIA = \'False\'';
    
    if(dataPesqInicial && dataPesqFinal){
        query2 = query2 + ' AND (TBV.DTHORAFECHAMENTO  BETWEEN \'' + dataPesqInicial + ' 00:00:00\' AND \'' + dataPesqFinal + ' 23:59:59\')';
    } 
    
    if(idMarca){
        query2 = query2 + ' AND TBE.IDGRUPOEMPRESARIAL='+idMarca;
    }
    
    if(idEmpresa){
       query2 = query2 + ' And  TBE.IDEMPRESA IN (' + idEmpresa + ') ';
    }
    
    if (produto) {
        query2 = query2 + ' And  (TBVD.XPROD LIKE \'%'+produto+'%\' OR tbps.NUCODBARRAS=\''+produto+'\' ) ';
    }
    
    if(uf){
        query2 = query2 + ' AND TBE.SGUF=\''+uf+'\''; 
    }
    
    if (idFornecedor) {
		query2 = query2 + ' And  tbps.IDPN = \'' + idFornecedor + '\' ';
	}
	
	if (idgrupograde) {
		query2 = query2 + ' And  tbps.IDGRUPO = \'' + idgrupograde + '\' ';
	}
	
	if (idgrade) {
		query2 = query2 + ' And  tbps.NOMEGRUPO = \'' + idgrade + '\' ';
	}
   
    query2 = query2 + ' GROUP BY TBE.IDEMPRESA, TBE.NOFANTASIA, TO_VARCHAR(TBV.DTHORAFECHAMENTO,\'DD-MM-YYYY\')';
    query2 = query2 + ' order by TBE.IDEMPRESA ';
    
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