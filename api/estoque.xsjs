var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbe.IDESTOQUE,' +
    '   tbe.IDPRODUTO,' +
    '   tbe.IDGRUPOEMPRESARIAL,' +
    '   tbe.NUNCM,' +
    '   tbe.NUCODBARRAS,' +
    '   tbe.DSNOME,' +
    '   tbe.UND,' +
    '   tbe.PRECOCUSTO,' +
    '   tbe.PRECOVENDA,' +
    '   tbe.ESTOQUE,' +
    '   tbe.ESTOQUEDISPONIVEL,' +
    '   TO_VARCHAR(tbe.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO, ' +
    '   tbe.NUCNPJ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".ESTOQUE tbe' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbe.IDESTOQUE = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."ESTOQUE" SET ' + 
        ' "IDPRODUTO" = ?, ' + 
        ' "IDGRUPOEMPRESARIAL" = ?, ' + 
        ' "NUNCM" = ?, ' + 
        ' "NUCODBARRAS" = ?, ' + 
        ' "DSNOME" = ?, ' + 
        ' "UND" = ?, ' + 
        ' "PRECOCUSTO" = ?, ' + 
        ' "PRECOVENDA" = ?, ' + 
        ' "ESTOQUE" = ?, ' + 
        ' "ESTOQUEDISPONIVEL" = ?, ' + 
        ' "DTULTALTERACAO" = ?, ' + 
        ' "NUCNPJ" = ? ' + 
    	' WHERE "IDESTOQUE" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.IDPRODUTO);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setString(3, registro.NUNCM);
        pStmt.setString(4, registro.NUCODBARRAS);
        pStmt.setString(5, registro.DSNOME);
        pStmt.setString(6, registro.UND);
        pStmt.setfloat(7, registro.PRECOCUSTO);
        pStmt.setfloat(8, registro.PRECOVENDA);
        pStmt.setInt(9, registro.ESTOQUE);
        pStmt.setInt(10, registro.ESTOQUEDISPONIVEL);
        pStmt.setDate(11, registro.DTULTALTERACAO);
        pStmt.setString(12, registro.NUCNPJ);
    	pStmt.setInt(13, registro.IDESTOQUE);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."ESTOQUE" ' +
		" ( " +
		' "IDESTOQUE", ' +
        ' "IDPRODUTO", ' +
        ' "IDGRUPOEMPRESARIAL", ' +
        ' "NUNCM", ' +
        ' "NUCODBARRAS", ' +
        ' "DSNOME", ' +
        ' "UND", ' +
        ' "PRECOCUSTO", ' +
        ' "PRECOVENDA", ' +
        ' "ESTOQUE", ' +
        ' "ESTOQUEDISPONIVEL", ' +
        ' "DTULTALTERACAO", ' +
        ' "NUCNPJ" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_ESTOQUE.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.IDPRODUTO);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setString(3, registro.NUNCM);
        pStmt.setString(4, registro.NUCODBARRAS);
        pStmt.setString(5, registro.DSNOME);
        pStmt.setString(6, registro.UND);
        pStmt.setfloat(7, registro.PRECOCUSTO);
        pStmt.setfloat(8, registro.PRECOVENDA);
        pStmt.setInt(9, registro.ESTOQUE);
        pStmt.setInt(10, registro.ESTOQUEDISPONIVEL);
        pStmt.setDate(11, registro.DTULTALTERACAO);
        pStmt.setString(12, registro.NUCNPJ);
    	
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