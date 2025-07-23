var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idCategorias = $.request.parameters.get("idCategorias");
    var DsCategorias = $.request.parameters.get("DsCategorias");
    var Tipopedido = $.request.parameters.get("tipopedido");

    var query = ' SELECT DISTINCT ' + 
    '   n.IDCATEGORIAS,' +
    '   n.DSCATEGORIAS,' +
    '   n.TPCATEGORIAS,' +
    '   n.TPCATEGORIAPEDIDO,' +
    '   n.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CATEGORIAS n' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  n.IDCATEGORIAS = \'' + byId + '\' ';
    }

    if ( idCategorias ) {
        query = query + ' And  n.IDCATEGORIAS = \'' + idCategorias + '\' '; 
    }

    if ( DsCategorias ) {
        query = query + ' And  n.DSCATEGORIAS = \'' + DsCategorias + '\' ';
    }

    if ( Tipopedido ) {
        query = query + ' And  n.TPCATEGORIAPEDIDO = \'' + Tipopedido + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CATEGORIAS" SET ' + 
        ' "DSCATEGORIAS" = ?, ' +
        ' "TPCATEGORIAS" = ?, ' +
        ' "TPCATEGORIAPEDIDO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDCATEGORIAS" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSCATEGORIAS);
        pStmt.setString(2, registro.TPCATEGORIAS);
        pStmt.setString(3, registro.TPCATEGORIAPEDIDO);
        pStmt.setString(4, registro.STATIVO);
        pStmt.setInt(5, registro.IDCATEGORIAS);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDCATEGORIAS")),0) + 1 FROM "VAR_DB_NAME"."CATEGORIAS" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CATEGORIAS" ' +
		" ( " +
		' "IDCATEGORIAS", ' +
		' "DSCATEGORIAS", ' +
		' "TPCATEGORIAS", ' +
		' "TPCATEGORIAPEDIDO", ' +
		' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdCateg = api.executeScalar(queryId,1);

	    pStmt.setInt(1, parseInt(IdCateg));
        pStmt.setString(2, registro.DSCATEGORIAS);
        pStmt.setString(3, registro.TPCATEGORIAS);
        pStmt.setString(4, registro.TPCATEGORIAPEDIDO);
        pStmt.setString(5, registro.STATIVO);
    	
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
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
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