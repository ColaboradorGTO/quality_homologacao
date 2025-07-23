var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var pIdEmpresa = $.request.parameters.get("idempresa");
    var pDiferenca = $.request.parameters.get("diferenca");
    var pProcessa = $.request.parameters.get("processa");

    if (pProcessa === "1") {
        var conn = $.db.getConnection();
        var querySP = "{ CALL \"QUALITY_CONC_HML\".\"SP_PREVIABALANCO\"(?,?) }";
        var pStmt = conn.prepareCall(querySP);
        pStmt.setInt(1, parseInt(byId));
        pStmt.setInt(2, parseInt(pIdEmpresa));
        pStmt.execute();
        pStmt.close();
        conn.commit();
    }
    
    var query = 'SELECT ' +
        ' pb.IDPREVIABALANCO, pb.IDPRODUTO, pb.IDRESUMOBALANCO, pb.IDEMPRESA, pb.QTD, pb.QTDFINAL, pb.QTDFALTA, pb.QTDSOBRA, pb.PRECOVENDA, pb.TOTALVENDA ' +
        ' ,IFNULL(p.NUCODBARRAS, (SELECT IFNULL("CodeBars", \'\') FROM "SBO_GTO_PRD"."OITM" WHERE "ItemCode" = pb.IDPRODUTO)) AS NUCODBARRAS ' +
        ' ,IFNULL(p.DSNOME, (SELECT IFNULL("ItemName", \'\') FROM "SBO_GTO_PRD"."OITM" WHERE "ItemCode" = pb.IDPRODUTO)) AS DSNOME ' + 
        'FROM "VAR_DB_NAME".PREVIABALANCO pb ' +
        'LEFT JOIN "VAR_DB_NAME".PRODUTO p ON p.IDPRODUTO = pb.IDPRODUTO ' +
        'WHERE 1 = ?';
    
    if ( byId ) {
        query = query + ' AND pb.IDRESUMOBALANCO = \'' + byId + '\' ';
    }
    
    /*if ( pIdEmpresa ) {
        query = query + ' AND pb.IDEMPRESA = \'' + pIdEmpresa + '\' ';
        query = query + ' AND pb.IDRESUMOBALANCO IN (SELECT MAX(IDRESUMOBALANCO) FROM "VAR_DB_NAME".PREVIABALANCO WHERE IDEMPRESA = \'' + pIdEmpresa + '\') ';
    }*/

    if ( pDiferenca === "1" ) {
        query = query + ' AND (pb.QTDFALTA <> 0 OR pb.QTDSOBRA <> 0) ';
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