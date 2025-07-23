var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

var idSubGrupoEmpresarial = $.request.parameters.get("idSubGrupoEmpresarial");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbc.IDCONVENIO,' +
    '   tbc.IDSUBGRUPOEMPRESARIAL,' +
    '   tbc.TPCONVENIO,' +
    '   tbc.IDGRUPOCLIENTECONVENIO,' +
    '   tbc.DSCONVENIO,' +
    '   tbc.STPERCENTECONVENIO,' +
    '   tbc.TPLIQUIDACAO,' +
    '   tbc.STRECORENTEMENSAL,' +
    '   tbc.VRMENSALMAXIMO,' +
    '   tbc.STATIVO,' +
    '   TO_VARCHAR(tbc.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CONVENIO tbc' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbc.IDCONVENIO = \'' + byId + '\' ';
    }
    
    if(idSubGrupoEmpresarial){
	    query = query + ' and tbc.IDSUBGRUPOEMPRESARIAL = ' + idSubGrupoEmpresarial;
	}
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CONVENIO" SET ' + 
        ' "IDSUBGRUPOEMPRESARIAL" = ?, ' +
        ' "TPCONVENIO" = ?, ' +
        ' "IDGRUPOCLIENTECONVENIO" = ?, ' +
        ' "DSCONVENIO" = ?, ' +
        ' "STPERCENTECONVENIO" = ?, ' +
        ' "TPLIQUIDACAO" = ?, ' +
        ' "STRECORENTEMENSAL" = ?, ' +
        ' "VRMENSALMAXIMO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "DTULTALTERACAO" = ? ' +  
    	' WHERE "IDCONVENIO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(2, registro.TPCONVENIO);
        pStmt.setInt(3, registro.IDGRUPOCLIENTECONVENIO);
        pStmt.setString(4, registro.DSCONVENIO);
        pStmt.setFloat(5, registro.STPERCENTECONVENIO);
        pStmt.setString(6, registro.TPLIQUIDACAO);
        pStmt.setString(7, registro.STRECORENTEMENSAL);
        pStmt.setFloat(8, registro.VRMENSALMAXIMO);
        pStmt.setString(9, registro.STATIVO);
        pStmt.setDate(10, registro.DTULTALTERACAO);
        pStmt.setInt(11, registro.IDCONVENIO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CONVENIO" ' +
		" ( " +
    		' "IDCONVENIO", ' +
            ' "IDSUBGRUPOEMPRESARIAL", ' +
            ' "TPCONVENIO", ' +
            ' "IDGRUPOCLIENTECONVENIO", ' +
            ' "DSCONVENIO", ' +
            ' "STPERCENTECONVENIO", ' +
            ' "TPLIQUIDACAO", ' +
            ' "STRECORENTEMENSAL", ' +
            ' "VRMENSALMAXIMO", ' +
            ' "STATIVO", ' +
            ' "DTULTALTERACAO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_CONVENIO.NEXTVAL,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(2, registro.TPCONVENIO);
        pStmt.setInt(3, registro.IDGRUPOCLIENTECONVENIO);
        pStmt.setString(4, registro.DSCONVENIO);
        pStmt.setFloat(5, registro.STPERCENTECONVENIO);
        pStmt.setString(6, registro.TPLIQUIDACAO);
        pStmt.setString(7, registro.STRECORENTEMENSAL);
        pStmt.setFloat(8, registro.VRMENSALMAXIMO);
        pStmt.setString(9, registro.STATIVO);
        pStmt.setDate(10, registro.DTULTALTERACAO);
    
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