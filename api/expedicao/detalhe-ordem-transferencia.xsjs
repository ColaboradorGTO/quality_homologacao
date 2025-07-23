var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idTipoFiltro = parseInt($.request.parameters.get("idtipofiltro"));

    var query = ' SELECT ' +
        '   rot.IDRESUMOOT ' +
        '   ,rot.IDEMPRESAORIGEM ' +
        '   ,(SELECT IFNULL(NOFANTASIA, \'\') FROM "VAR_DB_NAME".EMPRESA WHERE IDEMPRESA = rot.IDEMPRESAORIGEM) AS EMPRESAORIGEM ' +
        '   ,rot.IDEMPRESADESTINO ' +
        '   ,(SELECT IFNULL(NOFANTASIA, \'\') FROM "VAR_DB_NAME".EMPRESA WHERE IDEMPRESA = rot.IDEMPRESADESTINO) AS EMPRESADESTINO ' +
        '   ,IFNULL(TO_VARCHAR(rot.DATAEXPEDICAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DATAEXPEDICAO ' +
        '   ,IFNULL(TO_VARCHAR(rot.DATAEXPEDICAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DATAEXPEDICAOFORMATADA ' +
        '   ,rot.IDOPERADOREXPEDICAO ' +
        '   ,rot.NUTOTALITENS ' +
        '   ,rot.QTDTOTALITENS ' +
        '   ,rot.QTDTOTALITENSRECEPCIONADO ' +
        '   ,rot.QTDTOTALITENSDIVERGENCIA ' +
        '   ,rot.NUTOTALVOLUMES ' +
        '   ,rot.TPVOLUME ' +
        '   ,rot.VRTOTALCUSTO ' +
        '   ,rot.VRTOTALVENDA ' +
        '   ,IFNULL(TO_VARCHAR(rot.DTRECEPCAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTRECEPCAO ' +
        '   ,IFNULL(TO_VARCHAR(rot.DTRECEPCAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTRECEPCAOFORMATADA ' +
        '   ,rot.IDOPERADORRECEPTOR ' +
        '   ,rot.DSOBSERVACAO ' +
        '   ,rot.IDUSRCANCELAMENTO ' +
        '   ,IFNULL(TO_VARCHAR(rot.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTULTALTERACAO ' +
        '   ,IFNULL(TO_VARCHAR(rot.DTULTALTERACAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTULTALTERACAOFORMATADA ' +
        '   ,rot.IDSTDIVERGENCIA ' +
        '   ,rot.OBSDIVERGENCIA ' +
        '   ,rot.STEMISSAONFE ' +
        '   ,IFNULL(rot.NUMERONFE, \'\') AS NUMERONFE ' +
        '   ,rot.STENTRADAINVENTARIO ' +
        '   ,IFNULL(rot.QTDCONFERENCIA, 0) AS QTDCONFERENCIA ' +
        '   ,rot.IDSTATUSOT ' +
        '   ,rot.IDUSRAJUSTE ' +
        '   ,IFNULL(TO_VARCHAR(rot.DTAJUSTE,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTAJUSTE ' +
        '   ,IFNULL(TO_VARCHAR(rot.DTAJUSTE,\'DD/MM/YYYY\'), \'Não Informado\') AS DTAJUSTEFORMATADA ' +
        '   ,rot.QTDTOTALITENSAJUSTE ' +
        '   ,sot.DESCRICAOOT ' +
        '   ,dot.IDDETALHEOT ' +
        '   ,dot.IDPRODUTO ' +
        '   ,dot.QTDEXPEDICAO ' +
        '   ,dot.QTDRECEPCAO ' +
        '   ,dot.QTDDIFERENCA ' +
        '   ,dot.QTDAJUSTE ' +
        '   ,dot.VLRUNITVENDA ' +
        '   ,dot.VLRUNITCUSTO ' +
        '   ,dot.STCONFERIDO ' +
        '   ,dot.IDUSRAJUSTE ' +
        '   ,dot.STATIVO AS STATIVODETALHEOT ' +
        '   ,dot.STFALTA ' +
        '   ,dot.STSOBRA ' +
        '   ,p.NUCODBARRAS ' +
        '   ,p.DSNOME ' +
        '   ,dot.QTDCONFERIDA ' +
        ' FROM "VAR_DB_NAME".RESUMOORDEMTRANSFERENCIA rot ' +
        ' LEFT JOIN "VAR_DB_NAME".DETALHEORDEMTRANSFERENCIA dot ON dot.IDRESUMOOT = rot.IDRESUMOOT ' +
        ' LEFT JOIN "VAR_DB_NAME".PRODUTO p ON p.IDPRODUTO = dot.IDPRODUTO ' +
        ' INNER JOIN "VAR_DB_NAME".STATUSORDEMTRANSFERENCIA sot ON sot.IDSTATUSOT = rot.IDSTATUSOT ' +
        ' WHERE 1 = ? ';
    if(byId){
        query = query + 'AND rot.IDRESUMOOT = \'' + byId + '\' ';
    }
    if(idTipoFiltro === 1){
        query = query + 'AND (((dot.QTDDIFERENCA != 0 OR dot.QTDAJUSTE != 0) AND rot.IDSTATUSOT = 6) OR (rot.IDSTATUSOT != 6))';
    }

    /*$.response.contentType = 'application/json';
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
    switch ($.request.method) {
        //Handle your PUT calls here
        /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
        break;*/
        
        //Handle your POST calls here
        /*case $.net.http.POST:
            var doc = fnHandlePost();
            $.response.setBody(JSON.stringify(doc));
        break;*/
        
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
        break;
        
        default:
        break;
    }
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}