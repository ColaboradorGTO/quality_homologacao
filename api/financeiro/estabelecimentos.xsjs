var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idLojaEmpresa = $.request.parameters.get("idLojaEmpresa");
    var idGrupoEmpresa = $.request.parameters.get("idGrupoEmpresa");
    
    var query = ' SELECT ' + 
    '   A.IDESTABELECIMENTO, ' + 
    '   A.IDEMPRESA, ' + 
    '   A.NUESTABELECIMENTO, ' + 
    '   A.CODESTABELECIMENTO, ' + 
    '   EMP.NOFANTASIA ' + 
    '   FROM "VAR_DB_NAME".ESTABELECIMENTO A ' + 
    '   INNER JOIN "VAR_DB_NAME".EMPRESA EMP ON A.IDEMPRESA = EMP.IDEMPRESA ' +
    ' WHERE ' +
        '	1 = ?';
    
    if(idGrupoEmpresa>0){
        query = query + ' And  EMP.IDSUBGRUPOEMPRESARIAL IN ( ' + idGrupoEmpresa + ')  ';
    }
    
    if ( byId ) {
        query = query + ' And  A.IDESTABELECIMENTO = \'' + byId + '\' ';
    }

    if ( idLojaEmpresa>0 ) {
       query = query + ' And  EMP.IDEMPRESA IN ( ' + idLojaEmpresa + ')  ';
    }

    query = query + ' ORDER BY A."IDEMPRESA"';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."COR" SET ' + 
        ' "IDGRUPOCOR" = ?, ' +
        ' "DSCOR" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDCOR" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDGRUPOCOR);
        pStmt.setString(2, registro.DSCOR);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDCOR);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDCOR")),0) + 1 FROM "VAR_DB_NAME"."COR" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."COR" ' +
		" ( " +
		' "IDCOR", ' +
		' "IDGRUPOCOR", ' +
        ' "DSCOR", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdCor = api.executeScalar(queryId,1);

	    pStmt.setInt(1, parseInt(IdCor));
        pStmt.setInt(2, registro.IDGRUPOCOR);
        pStmt.setString(3, registro.DSCOR);
        pStmt.setString(4, registro.STATIVO);
    	
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