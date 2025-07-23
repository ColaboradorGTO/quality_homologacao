var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function atualizaContadorSubEstrutura(IDSubGrupoExt){
    
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."SUBGRUPOESTRUTURA" SET ' +
        ' SUBGRUPOESTRUTURA.NUCONTADOR = NUCONTADOR + 1 ' + 
        ' FROM "VAR_DB_NAME"."SUBGRUPOESTRUTURA" ' + 
        ' WHERE SUBGRUPOESTRUTURA.IDSUBGRUPOESTRUTURA =  \'' + IDSubGrupoExt + '\' ';
    
    var atualizadorDeContador = conn.prepareStatement(api.replaceDbName(query));
    atualizadorDeContador.execute();
    
    atualizadorDeContador.close();
	conn.commit();
} 

function fnHandleGet(byId) {

    var idSubGrupoExt = $.request.parameters.get("idSubGrupoExt");
    var descSubGrupoExt = $.request.parameters.get("descSubGrupoExt");

    var query = ' SELECT ' + 
    '   tbcp.IDSUBGRUPOESTRUTURA,' +
    '   tbcp.IDGRUPOESTRUTURA,' +
    '   tbcp.DSSUBGRUPOESTRUTURA,' +
    '   tbcp.CODSUBGRUPOESTRUTURA,' +
    '   B.DSGRUPOESTRUTURA,' +
    '   B.CODGRUPOESTRUTURA,' +
    '   tbcp.NUCONTADOR,'+
    '   tbcp.STATIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".SUBGRUPOESTRUTURA tbcp' +
    '   INNER JOIN "VAR_DB_NAME".GRUPOESTRUTURA B on tbcp.IDGRUPOESTRUTURA = B.IDGRUPOESTRUTURA' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbcp.STATIVO=\'True\'';
    
    if ( byId ) {
        query = query + ' And  tbcp.IDSUBGRUPOESTRUTURA = \'' + byId + '\' ';
    }

    if ( idSubGrupoExt ) {
        query = query + ' And  tbcp.IDSUBGRUPOESTRUTURA = \'' + idSubGrupoExt + '\' ';
    }

    if ( descSubGrupoExt ) {
        query = query + ' And  (tbcp.DSSUBGRUPOESTRUTURA LIKE \'%'+descSubGrupoExt+'%\' OR tbcp.DSSUBGRUPOESTRUTURA LIKE \'%'+descSubGrupoExt+'%\' ) ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
    atualizaContadorSubEstrutura(idSubGrupoExt);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    
    var query = 'UPDATE "VAR_DB_NAME"."SUBGRUPOESTRUTURA" SET ' + 
        ' "IDGRUPOESTRUTURA" = ?, ' +
        ' "DSSUBGRUPOESTRUTURA" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "NUCONTADOR" = ?, ' +
        ' "CODSUBGRUPOESTRUTURA" = ? ' +
    	' WHERE "IDSUBGRUPOESTRUTURA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
                
        if(registro.IDGRUPOESTRUTURAANTIGA === registro.IDGRUPOESTRUTURA){
            
                pStmt.setInt(1, registro.IDGRUPOESTRUTURA);
                pStmt.setString(2, registro.DSSUBGRUPOESTRUTURA); 
                pStmt.setString(3, registro.STATIVO);
                pStmt.setInt(4, 0);
                pStmt.setString(5, registro.CODSUBGRUPOESTRUTURA);
                pStmt.setInt(6, registro.IDSUBGRUPOESTRUTURA);

        }else{
        		var queryCodGrupo = 'SELECT CONCAT(LTRIM(CODGRUPOESTRUTURA,0),LPAD(IFNULL(NUCODIGO,0) + 1,3,\'0\')) AS COD '+
                ' FROM "VAR_DB_NAME"."GRUPOESTRUTURA" WHERE IDGRUPOESTRUTURA = ?';
                
                var CodGrupo = api.sqlQuery(queryCodGrupo,registro.IDGRUPOESTRUTURA);
        
                var codfinal = CodGrupo[0].COD.slice(CodGrupo[0].COD.length - 1);
                
                var codfinalantigo = parseInt(codfinal) - 1; 
                
                var CodSub = ("000" + CodGrupo[0].COD).slice(-6);
                
                //////////ATUALIZA NUCODIGO DO GRUPO NOVO//////////////////////
                 var queryAtualizaCodGrupo = 'UPDATE "VAR_DB_NAME"."GRUPOESTRUTURA" SET ' + 
                    ' "NUCODIGO" =  ? ' +
            		' WHERE "IDGRUPOESTRUTURA" =  ? ';
                    
                var pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaCodGrupo));
            	
            	pStmt2.setInt(1, parseInt(codfinal));
                pStmt2.setInt(2, registro.IDGRUPOESTRUTURA);
                pStmt2.execute();
                pStmt2.close();
                
                //////////ATUALIZA NUCODIGO DO GRUPO ANTIGO//////////////////////
                 var queryAtualizaCodGrupoAntigo = 'UPDATE "VAR_DB_NAME"."GRUPOESTRUTURA" SET ' + 
                    ' "NUCODIGO" =  ? ' +
            		' WHERE "IDGRUPOESTRUTURA" =  ? ';
                    
                var pStmt3 = conn.prepareStatement(api.replaceDbName(queryAtualizaCodGrupoAntigo));
            	
            	pStmt3.setInt(1, parseInt(codfinalantigo));
                pStmt3.setInt(2, registro.IDGRUPOESTRUTURAANTIGA);
                pStmt3.execute();
                pStmt3.close();
                
                pStmt.setInt(1, registro.IDGRUPOESTRUTURA);
                pStmt.setString(2, CodGrupo[0].COD + '-' + registro.DSSUBGRUPOESTRUTURAFIM); 
                pStmt.setString(3, registro.STATIVO);
                pStmt.setInt(4, 0);
                pStmt.setString(5, CodSub);
                pStmt.setInt(6, registro.IDSUBGRUPOESTRUTURA);
        }
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDSUBGRUPOESTRUTURA")),0) + 1 FROM "VAR_DB_NAME"."SUBGRUPOESTRUTURA" WHERE 1 = ? ';

    var query = 'INSERT INTO "VAR_DB_NAME"."SUBGRUPOESTRUTURA" ' +
		" ( " +
		' "IDSUBGRUPOESTRUTURA", ' +
		' "IDGRUPOESTRUTURA", ' +
        ' "DSSUBGRUPOESTRUTURA", ' +
        ' "STATIVO", ' +
        ' "NUCONTADOR", ' +
        ' "CODSUBGRUPOESTRUTURA" ' +
    	' ) ' +
		' VALUES(?,?,?,?,0,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdSubEst = api.executeScalar(queryId,1);

		var queryCodGrupo = 'SELECT CONCAT(LTRIM(CODGRUPOESTRUTURA,0),LPAD(IFNULL(NUCODIGO,0) + 1,3,\'0\')) AS COD '+
        ' FROM "VAR_DB_NAME"."GRUPOESTRUTURA" WHERE IDGRUPOESTRUTURA = ?';
        
        var CodGrupo = api.sqlQuery(queryCodGrupo,registro.IDGRUPOESTRUTURA);

        var codfinal = CodGrupo[0].COD.slice(CodGrupo[0].COD.length - 1);

        var CodSub = ("000" + CodGrupo[0].COD).slice(-6);

         var queryAtualizaCodGrupo = 'UPDATE "VAR_DB_NAME"."GRUPOESTRUTURA" SET ' + 
            ' "NUCODIGO" =  ? ' +
    		' WHERE "IDGRUPOESTRUTURA" =  ? ';
            
        var pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaCodGrupo));
    	
    	pStmt2.setInt(1, parseInt(codfinal));
        pStmt2.setInt(2, registro.IDGRUPOESTRUTURA);
        pStmt2.execute();
        pStmt2.close();
	
		pStmt.setInt(1, parseInt(IdSubEst));
        pStmt.setInt(2, registro.IDGRUPOESTRUTURA);
        pStmt.setString(3, CodGrupo[0].COD + '-' + registro.DSSUBGRUPOESTRUTURA); 
        pStmt.setString(4, registro.STATIVO);
        pStmt.setString(5, CodSub);
    	
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