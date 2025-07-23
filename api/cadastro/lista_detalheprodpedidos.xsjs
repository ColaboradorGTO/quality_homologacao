var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
 var query = 'SELECT'+
	'   d.IDDETALHEPEDIDO AS ID,'+
	'	CASE WHEN TRIM(SUBSTR_BEFORE((d.DSPRODUTO),\' \')) = \'\' THEN d.DSPRODUTO '+
    '    ELSE TRIM(SUBSTR_BEFORE((d.DSPRODUTO),\' \'))'+
    '    END '+
	'	AS DSPRODUTOANTES,'+
	'   TRIM(d.NUREF) AS NUREFPROD,'+
	'   TRIM(SUBSTR(TBTT.DSTIPOTECIDO,0,10)) AS DSTIPOTECIDO,'+
	'   TRIM(SUBSTR_AFTER(d.DSPRODUTO,\' \')) AS DSPRODUTODEPOIS,'+
	'   TRIM(SUBSTR(TBFA.DSFABRICANTE,0,20)) AS DSFABRICANTE,'+
	'   TRIM(SUBSTR(TBC.DSCOR,0,8)) AS DSCOR,'+
	'   TRIM(SUBSTR(TBF.NOFANTASIA,0,15)) AS NOMEFORPROD,'+
	'   TBF.IDFORNECEDOR,'+
	'   TBSG.DSSUBGRUPOESTRUTURA AS SUBGRUPOESTRUTURA,'+
	'   TBSG.CODSUBGRUPOESTRUTURA AS CODSUBGRUPEST,'+
	'   TBSG.NUCONTADOR AS CONTADORSUBGRUPO,'+
	'   TBCP.TIPOPEDIDO,'+
	'   TBT.IDTAMANHO AS IDTAMANHO,'+
	'   TBT.DSTAMANHO AS GRADE,'+
	'   TBDPG.IDTAMANHO AS TESTE, '+
	'   TBUM.DSSIGLA AS UN,'+
	'   d.VRUNITLIQUIDO AS VRUNIT,'+
	'   d.VRVENDA AS VRVENDA,'+
	'   d.QTDTOTAL AS QTDTOTALPEDIDO,'+
	'   IFNULL(d.STREPOSICAO, \'False\') AS STREPOSICAO,'+
	'   TBDPG.QTD AS QTDPRODUTO'+
    '   FROM "VAR_DB_NAME".DETALHEPEDIDO AS d'+
	'   INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON d.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO'+
	'   INNER JOIN "VAR_DB_NAME".FORNECEDOR TBF ON TBR.IDFORNECEDOR = TBF.IDFORNECEDOR'+
	'   INNER JOIN "VAR_DB_NAME".FABRICANTE TBFA ON d.IDFABRICANTE = TBFA.IDFABRICANTE'+
	'   INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO TBCP ON d.IDCATEGORIAPEDIDO = TBCP.IDCATEGORIAPEDIDO '+
	'   INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBUM ON d.UND = TBUM.IDUNIDADEMEDIDA'+
	'   INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSG ON d.IDSUBGRUPOESTRUTURA = TBSG.IDSUBGRUPOESTRUTURA'+
	'   INNER JOIN "VAR_DB_NAME".TIPOTECIDOS TBTT ON d.IDTIPOTECIDO = TBTT.IDTPTECIDO'+
	'   INNER JOIN "VAR_DB_NAME".COR TBC ON d.IDCOR = TBC.IDCOR'+
	'   LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDPG ON d.IDDETALHEPEDIDO = TBDPG.IDDETALHEPEDIDO AND TBDPG.STATIVO = \'True\' ' +
	'   LEFT JOIN "VAR_DB_NAME".TAMANHO TBT ON TBDPG.IDTAMANHO = TBT.IDTAMANHO '+
    ' WHERE 1=? '+
    '   AND d.STCANCELADO = \'False\' ';
    
    if ( byId ) {
        query = query + ' And  d.IDDETALHEPEDIDO = \'' + byId + '\' ';
    }
    
    query = query + ' ORDER BY d.NUREF, d.DSPRODUTO ASC';

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