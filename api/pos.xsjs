var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbp.IDPOS,' +
    '   tbp.IDSUBGRUPOEMPRESARIAL,' +
    '   tbp.DSPOS,' +
    '   tbp.NOREDE,' +
    '   tbp.NUPARCELAS,' +
    '   tbp.PERCREDE,' +
    '   TO_VARCHAR(tbp.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO, ' +
    '   tbp.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".POS tbp' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbp.IDPOS = \'' + byId + '\' ';
    }
    
    if(idGrupoEmpresarial){
	    query = query + ' and tbp.IDSUBGRUPOEMPRESARIAL = ' + idGrupoEmpresarial;
	}
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."POS" SET ' + 
        ' "IDSUBGRUPOEMPRESARIAL" = ?, ' + 
        ' "DSPOS" = ?, ' + 
        ' "NOREDE" = ?, ' + 
        ' "NUPARCELAS" = ?, ' + 
        ' "PERCREDE" = ?, ' + 
        ' "DTULTALTERACAO" = ?, ' + 
        ' "STATIVO" = ? ' +  
    	' WHERE "IDPOS" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(2, registro.DSPOS);
        pStmt.setString(3, registro.NOREDE);
        pStmt.setInt(4, registro.NUPARCELAS);
        pStmt.setFloat(5, registro.PERCREDE);
        pStmt.setDate(6, registro.DTULTALTERACAO);
        pStmt.setString(7, registro.STATIVO); 
    	pStmt.setInt(8, registro.IDPOS);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."POS" ' +
		" ( " +
		' "IDPOS", ' +
        ' "IDSUBGRUPOEMPRESARIAL", ' +
        ' "DSPOS", ' +
        ' "NOREDE", ' +
        ' "NUPARCELAS", ' +
        ' "PERCREDE", ' +
        ' "DTULTALTERACAO", ' +
        ' "STATIVO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_POS.NEXTVAL,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(2, registro.DSPOS);
        pStmt.setString(3, registro.NOREDE);
        pStmt.setInt(4, registro.NUPARCELAS);
        pStmt.setFloat(5, registro.PERCREDE);
        pStmt.setDate(6, registro.DTULTALTERACAO);
        pStmt.setString(7, registro.STATIVO);
    	
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