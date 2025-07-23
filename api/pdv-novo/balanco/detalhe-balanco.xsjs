var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    var idResumoBalanco = $.request.parameters.get("idResumoBalanco");
    var query = ' SELECT ' + 
    '   tbdb.IDPRODUTO,' +
	'   SUM(tbdb.TOTALCONTAGEMGERAL) AS SOMATOTALCONTAGEMGERAL' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEBALANCO tbdb' +
    ' WHERE ' +
        '	1 = ? ';
    
    if ( byId ) {
        query = query + ' And  tbdb.IDDETALHEBALANCO = \'' + byId + '\' ';
    }
    
    if(idResumoBalanco){
        query = query + ' And  tbdb.IDRESUMOBALANCO = \'' + idResumoBalanco + '\' ';
    }
    
    query = query+ ' group by tbdb.IDPRODUTO';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEBALANCO" SET ' + 
        ' "IDRESUMOBALANCO" = ?, ' +
        ' "NUMEROCOLETOR" = ?, ' +
        ' "IDPRODUTO" = ?, ' +
        ' "CODIGODEBARRAS" = ?, ' +
        ' "DSPRODUTO" = ?, ' +
        ' "TOTALCONTAGEMATUAL" = ?, ' +
        ' "TOTALCONTAGEMGERAL" = ?, ' +
    	' "PRECOCUSTO" = ?, ' +
    	' "PRECOVENDA" = ? ' +
    	' WHERE "IDDETALHEBALANCO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDRESUMOBALANCO);
    	pStmt.setString(2, registro.NUMEROCOLETOR);
    	pStmt.setInt(3, registro.IDPRODUTO);
    	pStmt.setString(4, registro.CODIGODEBARRAS);
    	pStmt.setString(5, registro.DSPRODUTO);
    	pStmt.setInt(6, registro.TOTALCONTAGEMATUAL);
    	pStmt.setInt(7, registro.TOTALCONTAGEMGERAL);
    	pStmt.setFloat(8, registro.PRECOCUSTO);
    	pStmt.setFloat(9, registro.PRECOVENDA);
    	pStmt.setInt(10, registro.IDDETALHEBALANCO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEBALANCO" ' +
		" ( " +
		' "IDRESUMOBALANCO", ' +
		' "NUMEROCOLETOR", ' + 
		' "IDPRODUTO", ' +
		' "CODIGODEBARRAS", ' +
		' "DSPRODUTO", ' +
		' "TOTALCONTAGEMATUAL", ' +
		' "TOTALCONTAGEMGERAL", ' +
		' "PRECOCUSTO", ' +
		' "PRECOVENDA" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDRESUMOBALANCO);
    	pStmt.setString(2, registro.NUMEROCOLETOR);
    	pStmt.setInt(3, registro.IDPRODUTO);
    	pStmt.setString(4, registro.CODIGODEBARRAS);
    	pStmt.setString(5, registro.DSPRODUTO);
    	pStmt.setInt(6, registro.TOTALCONTAGEMATUAL);
    	pStmt.setInt(7, registro.TOTALCONTAGEMGERAL);
    	pStmt.setFloat(8, registro.PRECOCUSTO);
    	pStmt.setFloat(9, registro.PRECOVENDA);
    	
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