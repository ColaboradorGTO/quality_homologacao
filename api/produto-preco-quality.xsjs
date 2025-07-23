var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var codeBars = $.request.parameters.get("codeBars");
    
    if(!idEmpresa) {
        throw "O parametro IdEmpresa é um valor obrigatório.";
    }
    
    var query = ' SELECT DISTINCT' + 
    '   tbp.IDPRODUTO,' +
    '   tbp.NUCODBARRAS,' +
    '   tbp.DSNOME,' +
    '   tbp.IDSUBGRUPO,' +
    '   tsge.DSSUBGRUPOESTRUTURA,' +
    '   ( CASE WHEN IFNULL(tbpp.PRECO_VENDA, 0) = 0 THEN tbp.PRECOVENDA ELSE tbpp.PRECO_VENDA END ) As PRECOVENDA' +
    ' FROM ' + 
    '   "VAR_DB_NAME".EMPRESA tbe' ;
    if(idEmpresa ==='31' || idEmpresa ==='51' || idEmpresa ==='67' || idEmpresa ==='89' || idEmpresa ==='76' || idEmpresa ==='109' || idEmpresa ==='56' || idEmpresa ==='90' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='86' || idEmpresa ==='16' || idEmpresa ==='116'){
        if(idEmpresa ==='31' || idEmpresa ==='109' || idEmpresa ==='51' || idEmpresa ==='67' || idEmpresa ==='89' || idEmpresa ==='76' || idEmpresa ==='116'){
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 OR tbp.IDGRUPOEMPRESARIAL = 2 ';
        }else if(idEmpresa ==='90' || idEmpresa ==='56' || idEmpresa ==='68' || idEmpresa ==='5' || idEmpresa ==='86') {    
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 OR tbp.IDGRUPOEMPRESARIAL = 4 ';
        }else if(idEmpresa ==='70' || idEmpresa ==='16') {    
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 OR tbp.IDGRUPOEMPRESARIAL = 2 OR tbp.IDGRUPOEMPRESARIAL = 4';
        }else{
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on (tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 )';
        }
    }else{
        query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 ';
    }
    query = query  +
    '   LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO tbpp on tbpp.IDPRODUTO = tbp.IDPRODUTO AND tbpp.IDEMPRESA =\''+idEmpresa+ '\' '+
    '   LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA tsge on tbp.IDSUBGRUPO = tsge.IDSUBGRUPOESTRUTURA ' +
    //'   INNER JOIN "QUALITY_CONC".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM on TBPEM.IDPRODUTO = tbp.IDPRODUTO ' +
    ' WHERE ' +
        '	1 = ?'+
        ' And  tbe.IDEMPRESA = \'' + idEmpresa + '\' And tbp.STATIVO = \'True\' ';
    
    if ( byId ) {
        query = query + ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
    }
    
    if ( codeBars ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codeBars + '\' ';
    }
    
    query = query + ' ORDER BY  tbp.IDPRODUTO ';
    
   /* $.response.contentType = 'application/json';
		$.response.setBody(JSON.stringify(query));
		$.response.status = $.net.http.OK;
		return;*/
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
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
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}