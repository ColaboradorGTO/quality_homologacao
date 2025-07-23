var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    var idVenda = $.request.parameters.get("idVenda");
    var codigoProduto = $.request.parameters.get("codigoProduto");
    
    var query = ' SELECT ' + 
    '   tbdv.IDVENDA,' +
    '   tbdv.IDVENDADETALHE,' +
    '   IFNULL(tbdv.NITEM,0)AS NITEM,' +
    '   tbdv.CPROD,' +
    '   tbdv.CEAN,' +
    '   tbdv.XPROD,' +
    '   tbdv.NCM,' +
    '   tbdv.UCOM,' +
    '   IFNULL(tbdv.QCOM,0)AS QCOM, ' +
    '   IFNULL(tbdv.VUNCOM,0)AS VUNCOM,' +
    '   IFNULL(tbdv.VPROD,0)AS VPROD,' +
    '   IFNULL(tbdv.VDESC,0)AS VDESC,' +
    '   tbdv.VENDEDOR_MATRICULA,' +
    '   tbdv.VENDEDOR_NOME,' +
    '   tbdv.VENDEDOR_CPF,' +
    '   IFNULL(tbdv.VRTOTALLIQUIDO,0)AS VRTOTALLIQUIDO,' +
    '   CAST(CAST(IFNULL(tbdv.QTD,0)AS INTEGER)AS VARCHAR) AS QTD,' +
    '   tbdv.STVENDIGITAL,' +
    '   tbp.NUCODBARRAS' +
    ' FROM ' + 
    '   "VAR_DB_NAME".VENDADETALHE tbdv' +
     '	INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON TBP.IDPRODUTO = tbdv.CPROD ' +
    ' WHERE ' +
        '	1 = ? and tbdv."STCANCELADO"=\'False\' and tbdv."STTROCA"=\'False\' ';
    
    if ( byId ) {
        query = query + ' And  tbdv.IDDETALHEVENDA = \'' + byId + '\' ';
    }
    if ( idVenda ) {
        query = query + ' And  tbdv.IDVENDA = \'' + idVenda + '\' ';
    }
    if ( codigoProduto ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codigoProduto + '\' ';
    }
    
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
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}