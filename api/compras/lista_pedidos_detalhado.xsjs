var api = $.import("quality.concentrador.api.apiResponse", "int_api");

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
    var IdMarca = $.request.parameters.get("idMarcaPesquisa");
    var IdFornecedor = $.request.parameters.get("idFornPesquisa");

    var query =  ' SELECT ' +
        '   tbdp.IDRESUMOPEDIDO AS IDPEDIDO, ' +
        '   EMP.DSSUBGRUPOEMPRESARIAL AS NOFANTASIAGRUPO, ' +
        '   FR.IDFORNECEDOR, ' + 
        '   FR.NORAZAOSOCIAL, ' + 
        '   FR.NOFANTASIA AS NOFANTASIAFORN, ' + 
        '   FC.NOFUNCIONARIO AS NOMECOMPRADOR, ' +
        '   AD.DSANDAMENTO, ' +
        '   AD.DSSETOR, ' +
        '   SUM(tbdp.QTDTOTAL) AS QTDPRODTOTAL, ' +
        '   SUM(tbdp.VRTOTAL) AS VRTOTALCUSTO, ' +
        '   SUM(tbdp.VRVENDA*tbdp.QTDTOTAL) AS VRTOTALVENDA, ' +
        '   SUM((tbdp.VRVENDA*tbdp.QTDTOTAL)-tbdp.VRTOTAL) AS VRTOTALLUCRO, ' +
        '   TO_VARCHAR( tbrp.DTPEDIDO, \'DD-MM-YYYY HH24:MI:SS\') AS DTPEDIDO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DETALHEPEDIDO tbdp ' +
        '   INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO tbrp ON tbdp.IDRESUMOPEDIDO = tbrp.IDRESUMOPEDIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL EMP ON tbrp.IDSUBGRUPOEMPRESARIAL = EMP.IDSUBGRUPOEMPRESARIAL  ' +
        '   INNER JOIN "VAR_DB_NAME".FORNECEDOR FR ON tbrp.IDFORNECEDOR = FR.IDFORNECEDOR  ' +
        '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO FC ON tbrp.IDCOMPRADOR = FC.IDFUNCIONARIO  ' +
        '   INNER JOIN "VAR_DB_NAME".ANDAMENTOS AD ON tbrp.IDANDAMENTO = AD.IDANDAMENTO  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND tbrp.STCANCELADO = \'False\' AND tbdp.STCANCELADO = \'False\' ';
    if ( byId ) {
        query = query + ' And  tbdp.IDDETALHEPEDIDO = \'' + byId + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  tbdp.IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }
    if ( IdMarca ) {
        query = query + ' And  tbrp.IDSUBGRUPOEMPRESARIAL = \'' + IdMarca + '\' ';
    }
    if ( IdFornecedor ) {
        query = query + ' And  tbrp.IDFORNECEDOR = \'' + IdFornecedor + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbrp.DTPEDIDO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

	query = query + ' GROUP BY tbdp.IDRESUMOPEDIDO,EMP.DSSUBGRUPOEMPRESARIAL, FR.IDFORNECEDOR, FR.NORAZAOSOCIAL, FR.NOFANTASIA, tbrp.DTPEDIDO, FC.NOFUNCIONARIO, AD.DSANDAMENTO, AD.DSSETOR  ';
	
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