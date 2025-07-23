var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbfp.IDFORMAPAGAMENTO,' +
    '   tbfp.CODIGO,' +
    '   tbfp.NOME,' +
    '   tbfp.CODIGOPRODUTO,' +
    '   tbfp.DESCRICAOPRODUTO,' +
    '   tbfp.NOMEADQUIRENTE,' +
    '   tbfp.TIPOCARTAO,' +
    '   tbfp.MODALIDADE,' +
    '   tbfp.CODIGOADQUIRENTE' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FORMAPAGAMENTO tbfp' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbfp.IDFORMAPAGAMENTO = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."FORMAPAGAMENTO" SET ' + 
        ' "CODIGO" = ?, ' + 
        ' "NOME" = ?, ' + 
        ' "CODIGOPRODUTO" = ?, ' + 
        ' "DESCRICAOPRODUTO" = ?, ' + 
        ' "NOMEADQUIRENTE" = ?, ' + 
        ' "TIPOCARTAO" = ?, ' + 
        ' "MODALIDADE" = ?, ' + 
        ' "CODIGOADQUIRENTE" = ? ' +
    	' WHERE "IDFORMAPAGAMENTO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.CODIGO);
        pStmt.setString(2, registro.NOME);
        pStmt.setString(3, registro.CODIGOPRODUTO);
        pStmt.setString(4, registro.DESCRICAOPRODUTO);
        pStmt.setString(5, registro.NOMEADQUIRENTE);
        pStmt.setString(6, registro.TIPOCARTAO);
        pStmt.setString(7, registro.MODALIDADE);
        pStmt.setString(8, registro.CODIGOADQUIRENTE);
    	pStmt.setInt(9, registro.IDFORMAPAGAMENTO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."FORMAPAGAMENTO" ' +
		" ( " +
		' "IDFORMAPAGAMENTO", ' +
        ' "CODIGO", ' +
        ' "NOME", ' +
        ' "CODIGOPRODUTO", ' +
        ' "DESCRICAOPRODUTO", ' +
        ' "NOMEADQUIRENTE", ' +
        ' "TIPOCARTAO", ' +
        ' "MODALIDADE", ' +
        ' "CODIGOADQUIRENTE" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_FORMAPAGAMENTO.NEXTVAL,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.CODIGO);
        pStmt.setString(2, registro.NOME);
        pStmt.setString(3, registro.CODIGOPRODUTO);
        pStmt.setString(4, registro.DESCRICAOPRODUTO);
        pStmt.setString(5, registro.NOMEADQUIRENTE);
        pStmt.setString(6, registro.TIPOCARTAO);
        pStmt.setString(7, registro.MODALIDADE);
        pStmt.setString(8, registro.CODIGOADQUIRENTE);
    
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