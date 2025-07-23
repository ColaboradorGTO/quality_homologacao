var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
     var tipoCategoria = $.request.parameters.get("tipo");
    var query = ' SELECT ' + 
    '   tbcrd.IDCATEGORIARECDESP,' +
	'   tbcrd.TPCATEGORIA,' +
	'   tbcrd.DSCATEGORIA,' +
	'   tbcrd.STDESPESALOJA,' +
	'   tbcrd.STMATRICULAFUNCIONARIO,' +
	'   TO_VARCHAR(tbcrd.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO, ' +
	'   tbcrd.STATIVO,' +
	'   tbcrd.NCONTA' +
	' FROM ' + 
    '   "VAR_DB_NAME".CATEGORIARECEITADESPESA tbcrd' +
    ' WHERE ' +
        '	1 = ?'+
         '   and tbcrd.STATIVO = \'True\'';
    
    if ( byId ) {
        query = query + ' And  tbcrd.IDCATEGORIARECDESP = \'' + byId + '\' ';
    }
    
    if ( tipoCategoria === 'D' ) {
        query = query + ' And  tbcrd.TPCATEGORIA = \'DESPESA\' ';
    }
    
    query = query + ' ORDER BY tbcrd.IDCATEGORIARECDESP ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CATEGORIARECEITADESPESA" SET ' + 
        ' "TPCATEGORIA" = ?, ' +
        ' "DSCATEGORIA" = ?, ' +
        ' "STDESPESALOJA" = ?, ' +
        ' "STMATRICULAFUNCIONARIO" = ?, ' +
        ' "DTULTALTERACAO" = ?, ' +
        ' "STATIVO" = ?, ' +
    	' "NCONTA" = ? ' + 
    	' WHERE "IDCATEGORIARECDESP" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.TPCATEGORIA);
    	pStmt.setString(2, registro.DSCATEGORIA);
    	pStmt.setString(3, registro.STDESPESALOJA);
    	pStmt.setString(4, registro.STMATRICULAFUNCIONARIO);
    	pStmt.setDate(5, registro.DTULTALTERACAO);
    	pStmt.setString(6, registro.STATIVO);
    	pStmt.setString(7, registro.NCONTA);
    	pStmt.setInt(8, registro.IDCATEGORIARECDESP);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CATEGORIARECEITADESPESA" ' +
		" ( " +
		' "IDCATEGORIARECDESP", ' +
		' "TPCATEGORIA", ' +
        ' "DSCATEGORIA", ' +
        ' "STDESPESALOJA", ' +
        ' "STMATRICULAFUNCIONARIO", ' +
        ' "DTULTALTERACAO", ' +
        ' "STATIVO", ' +
    	' "NCONTA" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_CATEGORIARECEITADESPESA.NEXTVAL,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.TPCATEGORIA);
    	pStmt.setString(2, registro.DSCATEGORIA);
    	pStmt.setString(3, registro.STDESPESALOJA);
    	pStmt.setString(4, registro.STMATRICULAFUNCIONARIO);
    	pStmt.setDate(5, registro.DTULTALTERACAO);
    	pStmt.setString(6, registro.STATIVO);
    	pStmt.setString(7, registro.NCONTA);
    	
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