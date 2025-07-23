var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbs.IDSANGRIA,' +
    '   tbs.IDEMPRESA,' +
    '   tbs.IDCAIXALOCAL,' +
    '   tbs.IDCAIXAWEB,' +
    '   tbs.IDUSRAUTORIZADO,' +
    '   tbs.DTSANGRIA,' +
    '   tbs.TBXMOTIVO,' +
    '   tbs.VRSANGRIA,' +
    '   tbs.IDSANGRIALOCAL,' +
    '   tbs.DTCANCELADO,' +
    '   tbs.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".SANGRIA tbs' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbs.IDSANGRIA = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."SANGRIA" SET ' + 
        ' "IDEMPRESA" = ?, ' +
        ' "IDCAIXALOCAL" = ?, ' +
        ' "IDCAIXAWEB" = ?, ' +
        ' "IDUSRAUTORIZADO" = ?, ' +
        ' "DTSANGRIA" = ?, ' +
        ' "TBXMOTIVO" = ?, ' +
        ' "VRSANGRIA" = ?, ' +
        ' "IDSANGRIALOCAL" = ?, ' +
        ' "DTCANCELADO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDSANGRIA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setInt(2, registro.IDCAIXALOCAL);
        pStmt.setInt(3, registro.IDCAIXAWEB);
        pStmt.setInt(4, registro.IDUSRAUTORIZADO);
        pStmt.setDate(5, registro.DTSANGRIA);
        pStmt.setString(6, registro.TBXMOTIVO);
        pStmt.setFloat(7, registro.VRSANGRIA);
        pStmt.setInt(8, registro.IDSANGRIALOCAL);
        pStmt.setDate(9, registro.DTCANCELADO);
        pStmt.setString(10, registro.STATIVO);
    	pStmt.setInt(11, registro.IDSANGRIA);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."SANGRIA" ' +
		" ( " +
		' "IDSANGRIA", ' +
        ' "IDEMPRESA", ' +
        ' "IDCAIXALOCAL", ' +
        ' "IDCAIXAWEB", ' +
        ' "IDUSRAUTORIZADO", ' +
        ' "DTSANGRIA", ' +
        ' "TBXMOTIVO", ' +
        ' "VRSANGRIA", ' +
        ' "IDSANGRIALOCAL", ' +
        ' "DTCANCELADO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_SANGRIA.NEXTVAL,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setInt(2, registro.IDCAIXALOCAL);
        pStmt.setInt(3, registro.IDCAIXAWEB);
        pStmt.setInt(4, registro.IDUSRAUTORIZADO);
        pStmt.setDate(5, registro.DTSANGRIA);
        pStmt.setString(6, registro.TBXMOTIVO);
        pStmt.setFloat(7, registro.VRSANGRIA);
        pStmt.setInt(8, registro.IDSANGRIALOCAL);
        pStmt.setDate(9, registro.DTCANCELADO);
        pStmt.setString(10, registro.STATIVO);
    	
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