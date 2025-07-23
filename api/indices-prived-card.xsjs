var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
var idSubGrupoEmpresarial = $.request.parameters.get("idSubGrupoEmpresarial");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbidc.IDINDICESPRIVEDCARD,' +
    '   tbidc.IDGRUPOEMPRESARIAL,' +
    '   tbidc.IDSUBGRUPOEMPRESARIAL,' +
    '   tbidc.NUMPARCELA,' +
    '   tbidc.PERCPARCELA,' +
    '   tbidc.STATIVO,' +
    '   TO_VARCHAR(tbidc.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".INDICESPRIVEDCARD tbidc' +
    ' WHERE ' +
        '	1 = ? and STATIVO = \'True\'';
    
    if ( byId ) {
        query = query + ' And  tbidc.IDINDICESPRIVEDCARD = \'' + byId + '\' ';
    }
    if(idGrupoEmpresarial){
	    query = query + ' and tbidc.IDGRUPOEMPRESARIAL = ' + idGrupoEmpresarial;
	}
	if(idSubGrupoEmpresarial){
	    query = query + ' and (tbidc.IDSUBGRUPOEMPRESARIAL = ' + idSubGrupoEmpresarial +  ' or tbidc.IDSUBGRUPOEMPRESARIAL is null)';
	}
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."INDICESPRIVEDCARD" SET ' + 
        ' "IDGRUPOEMPRESARIAL" = ?, ' + 
        ' "IDSUBGRUPOEMPRESARIAL" = ?, ' + 
        ' "NUMPARCELA" = ?, ' + 
        ' "PERCPARCELA" = ?, ' + 
        ' "STATIVO" = ?, ' + 
        ' "DTULTALTERACAO" = ? ' + 
    	' WHERE "IDINDICESPRIVEDCARD" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.NUMPARCELA);
        pStmt.setFloat(4, registro.PERCPARCELA);
        pStmt.setString(5, registro.STATIVO);
        pStmt.setString(6, registro.DTULTALTERACAO); 
    	pStmt.setInt(7, registro.IDINDICESPRIVEDCARD);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."INDICESPRIVEDCARD" ' +
		" ( " +
		' "IDINDICESPRIVEDCARD", ' +
        ' "IDGRUPOEMPRESARIAL", ' +
        ' "IDSUBGRUPOEMPRESARIAL", ' +
        ' "NUMPARCELA", ' +
        ' "PERCPARCELA", ' +
        ' "STATIVO", ' +
        ' "DTULTALTERACAO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_INDICESPRIVEDCARD.NEXTVAL,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.NUMPARCELA);
        pStmt.setFloat(4, registro.PERCPARCELA);
        pStmt.setString(5, registro.STATIVO);
        pStmt.setString(6, registro.DTULTALTERACAO); 
    	
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