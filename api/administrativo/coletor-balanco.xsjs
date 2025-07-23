var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var IdResumoBalanco = $.request.parameters.get("idresumo");
    var IdEmpresa = $.request.parameters.get("idempresa");
    var descProduto = $.request.parameters.get("descProduto");
    
    if(!IdResumoBalanco){
        throw 'Favor informar o id do resumo';
    }
    
    if(!IdEmpresa){
        throw 'Favor informar o id da empresa';
    }

    var query = ' SELECT ' +
        '   db.NUMEROCOLETOR, IFNULL(db.DSCOLETOR, \'\') AS DSCOLETOR, ' +
        '   SUM(db.TOTALCONTAGEMGERAL) AS NUMITENS, ' +
        '   SUM(db.TOTALCONTAGEMGERAL * IFNULL(p.PRECOCUSTO, 0)) AS TOTALCUSTO, ' +
        '   SUM(db.TOTALCONTAGEMGERAL * TO_DECIMAL( IFNULL( IFNULL( pr.PRECO_VENDA, p.PRECOVENDA), 0))) AS TOTALVENDA, ' +
        '   db.IDRESUMOBALANCO, rb.IDEMPRESA, rb.STCONSOLIDADO ' +
        ' FROM "VAR_DB_NAME".DETALHEBALANCO db ' +
        '   INNER JOIN "VAR_DB_NAME".RESUMOBALANCO rb ON rb.IDRESUMOBALANCO = db.IDRESUMOBALANCO ' +
        '   LEFT JOIN "VAR_DB_NAME".PRODUTO p ON p.IDPRODUTO = db.IDPRODUTO ' +
        '   LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO pr ON pr.IDPRODUTO = db.IDPRODUTO AND pr.IDEMPRESA = \'' + IdEmpresa + '\' ' +
        ' WHERE 1 = ? ';
        if(IdResumoBalanco){
            query = query + 'AND db.IDRESUMOBALANCO = \'' + IdResumoBalanco + '\' ';
        }
        if(descProduto){
            query = query + 'AND (db.CODIGODEBARRAS LIKE \'%' + descProduto + '%\' OR UPPER(db.DSPRODUTO) LIKE UPPER(\'%' + descProduto + '%\')) ';
        }
    query = query + ' AND db.STCANCELADO = \'False\' ';
    query = query + ' GROUP BY db.NUMEROCOLETOR, db.DSCOLETOR, db.IDRESUMOBALANCO, rb.IDEMPRESA, rb.STCONSOLIDADO ';

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };

    api.responseWithQuery(query, request, 1);
}

function fnHandlePut(){

    var conn = $.db.getConnection();

    var bodyJson = JSON.parse($.request.body.asString());
    var pIdResumoBalanco = bodyJson.IDRESUMOBALANCO;
    var pNumeroColetor = bodyJson.NUMEROCOLETOR;

	var query = 'UPDATE "VAR_DB_NAME".DETALHEBALANCO SET ' +
	    'STCANCELADO = \'True\' ' +
	    'WHERE IDRESUMOBALANCO = ? AND NUMEROCOLETOR = ? ';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	
	pStmt.setInt(1, pIdResumoBalanco);
	pStmt.setInt(2, pNumeroColetor);
	
	pStmt.execute();
	
	pStmt.close();
	
	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

        //Handle your GET calls here
         case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;

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