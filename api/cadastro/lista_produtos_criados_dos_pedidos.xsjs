var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    
    var idPedido = $.request.parameters.get("idpedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var sttransformado = $.request.parameters.get("sttransformado");
    var stmigradosap = $.request.parameters.get("stmigradosap");

    var query =  ' SELECT DISTINCT' +
        '   tbrp.IDGRUPOEMPRESARIAL, ' +
        '   tbrp.IDSUBGRUPOEMPRESARIAL, ' +
        '   tbdp.IDRESUMOPEDIDO, ' +
        '   tbdpp.IDDETALHEPRODUTOPEDIDO, ' +
        '   tbdpp.IDPRODCADASTRO AS IDPRODUTOCRIADO, ' +
        '   tbdpp.DSPRODUTO AS DSPRODUTOCRIADO, ' +
        '   (SELECT SUM(IFNULL(tbvdpn.QTDVINCULADO, 0)) FROM "VAR_DB_NAME".VINCDETPEDIDODETNOTA tbvdpn WHERE tbvdpn.IDDETALHEPRODUTOPEDIDO = tbdpp.IDDETALHEPRODUTOPEDIDO AND tbvdpn.STATIVO = \'True\'  GROUP BY tbvdpn.IDDETALHEPRODUTOPEDIDO) AS QTDVINCULADO, ' +
        '   tbdpp.QTDPRODUTO AS QTDPRODUTOCRIADO, ' +
        '   tbdpp.VRTOTALCUSTO AS VRTOTALCUSTOPRODCRIADO, ' +
        '   tbdpp.CODBARRAS, ' +
        '   tbdpp.NUREF, ' +
        '   tbdpp.NUNCM,' +
        '   tbdpp.STMIGRADOSAP, ' +
        '   tbdpp.STCADASTRADO, ' +
        '   tbdp.IDDETALHEPEDIDO AS IDDETPEDIDO, ' +
        '   tbdp.IDRESUMOPEDIDO AS IDPEDIDO, ' +
        '   tbdp.IDCOR, ' +
        '   tbdp.IDTIPOTECIDO, ' +
        '   SE.IDGRUPOESTRUTURA, ' +
        '   tbdp.IDSUBGRUPOESTRUTURA, ' +
        '   SE.DSSUBGRUPOESTRUTURA, ' +
        '   tbdp.IDCATEGORIAPEDIDO, ' +
        '   CP.DSCATEGORIAPEDIDO, ' + 
        '   CP.TIPOPEDIDO, ' + 
        '   CR.DSCOR, ' + 
        '   FR.IDFORNECEDOR, ' + 
        '   FR.NORAZAOSOCIAL, ' +
        '   FR.NUCNPJ as CNPJFORNECEDOR, ' + 
        '   FB.IDFABRICANTE, ' + 
        '   FB.DSFABRICANTE, ' + 
        '   TBT.DSTIPOTECIDO, ' + 
        '   LE.IDLOCALEXPOSICAO, ' + 
        '   LE.DSLOCALEXPOSICAO, ' + 
        '   ES.IDESTILO, ' + 
        '   ES.DSESTILO, ' + 
        '   tbdp.NUREF, ' +
        '   tbdp.DSPRODUTO, ' +
        '   tbdp.QTDTOTAL, ' +
        '   tbdp.NUCAIXA, ' +
        '   UN.DSSIGLA, ' +
        '   UN.IDUNIDADEMEDIDA, ' +
        '   ( tbdp.VRUNITBRUTO) AS VRUNITBRUTODETALHEPEDIDO, ' +
        '   IFNULL( tbdp.DESC01,0) AS DESC01, ' +
        '   IFNULL( tbdp.DESC02,0) AS DESC02, ' +
        '   IFNULL( tbdp.DESC03,0) AS DESC03, ' +
        '   ( tbdp.VRUNITLIQUIDO) AS VRUNITLIQDETALHEPEDIDO, ' + 
        '   ( tbdp.VRVENDA) AS VRVENDADETALHEPEDIDO, ' +
        '   ( tbdp.VRTOTAL) AS VRTOTALDETALHEPEDIDO, ' +
        '   tbdp.STRECEBIDO, ' +
        '   tbdp.STECOMMERCE, ' +
        '   tbdp.STREDESOCIAL, ' +
        '   tbdp.STCANCELADO, ' +
        '   tbdp.STTRANSFORMADO, ' +
        '   tbdp.STREPOSICAO, ' +
        '   IFNULL( tbdp.VRCUSTOPRODATUAL,0) AS VRCUSTOPRODATUAL, ' +
        '   IFNULL( tbdp.VRVENDAPRODATUAL,0) AS VRVENDAPRODATUAL, ' +
        '   tbdp.OBSPRODUTO, ' +
        '   tbdp.IDCATEGORIAS AS CATEGORIAPROD, ' +
        '   CPS.DSCATEGORIAS AS DSCATEGORIAPROD, ' +
        '   CPS.TPCATEGORIAS AS TPCATEGORIAPROD, ' +
        '   CPS.TPCATEGORIAPEDIDO AS TPCATEGORIAPRODPEDIDO, ' +
        '   TO_VARCHAR( tbrp.DTPEDIDO, \'DD-MM-YYYY HH24:MI:SS\') AS DTPEDIDO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DETALHEPEDIDO tbdp ' +
        '   INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO tbrp ON tbdp.IDRESUMOPEDIDO = tbrp.IDRESUMOPEDIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO tbdpp ON tbdp.IDDETALHEPEDIDO = tbdpp.IDDETALHEPEDIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp ON tbp.IDPRODUTO = tbdpp.IDPRODCADASTRO AND tbp.STATIVO = \'True\'  ' +
        '   INNER JOIN "VAR_DB_NAME".COR CR ON tbdp.IDCOR = CR.IDCOR  ' +
        '   INNER JOIN "VAR_DB_NAME".TIPOTECIDOS TBT ON tbdp.IDTIPOTECIDO = TBT.IDTPTECIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO CP ON tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA UN ON tbdp.UND = UN.IDUNIDADEMEDIDA  ' +
        '   INNER JOIN "VAR_DB_NAME".ESTILOS ES ON tbdp.IDESTILO = ES.IDESTILO  ' +
        '   INNER JOIN "VAR_DB_NAME".LOCALEXPOSICAO LE ON tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  ' +
        '   LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA SE ON tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  ' +
        '   LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA GE ON SE.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA  ' +
        '   INNER JOIN "VAR_DB_NAME".FORNECEDOR FR ON tbrp.IDFORNECEDOR = FR.IDFORNECEDOR  ' +
        '   INNER JOIN "VAR_DB_NAME".FABRICANTE FB ON tbdp.IDFABRICANTE = FB.IDFABRICANTE  ' +
        '   INNER JOIN "VAR_DB_NAME".CATEGORIAS CPS ON tbdp.IDCATEGORIAS = CPS.IDCATEGORIAS  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND tbrp.STCANCELADO = \'False\' AND tbdp.STCANCELADO = \'False\'  AND tbdp.STTRANSFORMADO = \'True\' /*AND (tbdp.STREPOSICAO = \'False\' OR tbdp.STREPOSICAO IS NULL OR tbdp.STREPOSICAO = \'null\')*/ ';
    if ( byId ) {
        query = query + ' And  tbdp.IDDETALHEPEDIDO = \'' + byId + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  tbdp.IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }
    if ( sttransformado ) {
        query = query + ' And  tbdp.STTRANSFORMADO = \'' + sttransformado + '\'  ';
    }
    if ( stmigradosap ) {
        query = query + ' And  tbdpp.STMIGRADOSAP = \'' + stmigradosap + '\'  ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (tbrp.DTPEDIDO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') ';
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