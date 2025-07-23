var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idMarca = $.request.parameters.get("idGrupoEmpresarial");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var produto = $.request.parameters.get("descricaoProduto");
    var idgrupograde = $.request.parameters.get("idGrupoGrade");
    var idgrade = $.request.parameters.get("idGrade");
    var dataPesqInicial = $.request.parameters.get("dataInicio"); 
    var dataPesqFinal = $.request.parameters.get("dataFim");

    var query2 = 'SELECT' +
    '   tbps.NOMEGRUPO, '+
    '   tbps.DSNOME, ' +
	'   tbps.NUCODBARRAS,' + 
	'   SUM(tbms."QTDSAIDAVENDA") as QTDSAIDAVENDA,' +
	'   SUM(tbms."QTDSALDO") as QTDSALDO,' +
	'   tbp.PRECOCUSTO,' +
	'   tbpp.PRECO_VENDA' +
	' FROM "QUALITY_CONC_HML"."MOVIMENTACAOSALDO" tbms' +
    '   INNER JOIN "QUALITY_CONC_HML"."PRODUTOSAP" tbps on tbms.IDPRODUTO = tbps.IDPRODUTO ' +
    '   INNER JOIN "QUALITY_CONC_HML"."PRODUTO_PRECO" tbpp on tbms.IDPRODUTO = tbpp.IDPRODUTO' +
    '   INNER JOIN "QUALITY_CONC_HML"."PRODUTO" tbp on tbms.IDPRODUTO = tbp.IDPRODUTO' +
    '   INNER JOIN "QUALITY_CONC_HML"."EMPRESA" tbe on tbms.IDEMPRESA = tbe.IDEMPRESA' +
    ' WHERE 1=? ';
    
    if(dataPesqInicial && dataPesqFinal){
        query2 = query2 + ' AND (tbms.DTMOVIMENTACAO  BETWEEN \'' + dataPesqInicial + ' 00:00:00\' AND \'' + dataPesqFinal + ' 23:59:59\')';
    } 
    
    if(idMarca>0){
        query2 = query2 + ' AND tbe.IDGRUPOEMPRESARIAL='+idMarca;
    }
    
    if (produto) {
        query2 = query2 + ' And  (tbps.DSNOME LIKE \'%'+produto+'%\' OR tbps.NUCODBARRAS=\''+produto+'\' ) ';
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
   
    query2 = query2 + ' GROUP BY tbps.IDPRODUTO, tbps.DSNOME, tbps.NUCODBARRAS, tbp.PRECOCUSTO, tbpp.PRECO_VENDA, tbps.NOMEGRUPO ';
    query2 = query2 + ' ORDER BY tbps.NOMEGRUPO,tbps.IDPRODUTO ';
    
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