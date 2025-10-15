var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idProduto = $.request.parameters.get("idProduto");
    var idEmpresa = $.request.parameters.get("idEmpresa");

    var query = ' SELECT ' + 
    '   p.ID,' +
    '   p.IDEMPRESA,' +
    '   p.IDCAIXA,' +
    '   p.IDPRODUTO,' +
    '   TO_VARCHAR(p.DTCADASTRO,\'YYYY-MM-DD HH24:MI:SS\') AS DTCADASTRO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".PRODUTOSINATIVOSENCONTRADOS p' +
    ' WHERE ' +
       '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  n.ID = \'' + byId + '\' ';
    }

    if ( idEmpresa ) {
        query = query + ' And  n.IDEMPRESA = \'' + idEmpresa + '\' '; 
    }
    
    if ( idProduto ) {
        query = query + ' And  n.IDPRODUTO = \'' + idProduto + '\' '; 
    }

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}


function fnHandlePost() 
{
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("ID")),0) + 1 FROM "VAR_DB_NAME"."PRODUTOSINATIVOSENCONTRADOS" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."PRODUTOSINATIVOSENCONTRADOS" ' +
		" ( " +
		' "ID", ' +
		' "IDEMPRESA", ' +
		' "IDCAIXA", ' +
		' "IDPRODUTO", ' +
		' "DTCADASTRO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,now()) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var Id = api.executeScalar(queryId,1);

	    pStmt.setInt(1, parseInt(Id));
        pStmt.setInt(2, registro.IDEMPRESA);
        pStmt.setInt(3, registro.IDCAIXA);
        pStmt.setString(4, registro.IDPRODUTO);
    	
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
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
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}