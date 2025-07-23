var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var idCondPag = $.request.parameters.get("idCondPag");
    var descCondPag = $.request.parameters.get("descCondPag");

    var query = ' SELECT ' + 
    '   tbcp.IDCONDICAOPAGAMENTO,' +
    '   tbcp.IDGRUPOEMPRESARIAL,' +
    '   tbcp.IDEMPRESA,' +
    '   tbcp.DSCONDICAOPAG,' +
    '   tbcp.STPARCELADO,' +
    '   tbcp.NUPARCELAS,' +
    '   tbcp.NUNDIA1PAG,' +
    '   tbcp.NUNDIA2PAG,' +
    '   tbcp.NUNDIA3PAG,' +
    '   tbcp.NUNDIA4PAG,' +
    '   tbcp.NUNDIA5PAG,' +
    '   tbcp.NUNDIA6PAG,' +
    '   tbcp.NUNDIA7PAG,' +
    '   tbcp.NUNDIA8PAG,' +
    '   tbcp.NUNDIA9PAG,' +
    '   tbcp.NUNDIA10PAG,' +
    '   tbcp.NUNDIA11PAG,' +
    '   tbcp.NUNDIA12PAG,' +
    '   tbcp.TPDOCUMENTO,' +
    '   tbcp.DTULTALTERACAO,' +
    '   tbcp.STATIVO,' +
    '   tbcp.QTDDIAS,' +
    '   tbcp.IDTPDOCUMENTO,' +
    '   t2.DSTPDOCUMENTO,' +
    '   t2.IDSAP' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CONDICAOPAGAMENTO tbcp' +
    '   LEFT JOIN "VAR_DB_NAME"."TIPODOCUMENTO" t2 on tbcp.IDTPDOCUMENTO = t2.IDTPDOCUMENTO ' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbcp.STATIVO=\'True\'';
    
    if ( byId ) {
        query = query + ' And  tbcp.IDGRUPOEMPRESARIAL = \'' + byId + '\' ';
    }

    if ( idCondPag ) {
        query = query + ' And  tbcp.IDCONDICAOPAGAMENTO = \'' + idCondPag + '\' ';
    }

    if ( descCondPag ) {
        query = query + ' And  (tbcp.DSCONDICAOPAG LIKE \'%'+descCondPag+'%\' OR tbcp.DSCONDICAOPAG LIKE \'%'+descCondPag+'%\' ) ';
    }
    
    query = query + ' ORDER BY DSCONDICAOPAG ASC ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CONDICAOPAGAMENTO" SET ' + 
        ' "IDGRUPOEMPRESARIAL" = ?, ' +
        ' "DSCONDICAOPAG" = ?, ' +
        ' "STPARCELADO" = ?, ' +
        ' "NUPARCELAS" = ?, ' +
        ' "NUNDIA1PAG" = ?, ' +
        ' "NUNDIA2PAG" = ?, ' +
        ' "NUNDIA3PAG" = ?, ' +
        ' "NUNDIA4PAG" = ?, ' +
        ' "NUNDIA5PAG" = ?, ' +
        ' "NUNDIA6PAG" = ?, ' +
        ' "NUNDIA7PAG" = ?, ' +
        ' "NUNDIA8PAG" = ?, ' +
        ' "NUNDIA9PAG" = ?, ' +
        ' "NUNDIA10PAG" = ?, ' +
        ' "NUNDIA11PAG" = ?, ' +
        ' "NUNDIA12PAG" = ?, ' +
        ' "DTULTALTERACAO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "QTDDIAS" = ?, ' +
        ' "IDTPDOCUMENTO" = ? ' +
    	' WHERE "IDCONDICAOPAGAMENTO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
        pStmt.setString(2, registro.DSCONDICAOPAG);
        pStmt.setString(3, registro.STPARCELADO);
        pStmt.setInt(4, registro.NUPARCELAS);
        pStmt.setInt(5, registro.NUNDIA1PAG);
        pStmt.setInt(6, registro.NUNDIA2PAG);
        pStmt.setInt(7, registro.NUNDIA3PAG);
        pStmt.setInt(8, registro.NUNDIA4PAG);
        pStmt.setInt(9, registro.NUNDIA5PAG);
        pStmt.setInt(10, registro.NUNDIA6PAG);
        pStmt.setInt(11, registro.NUNDIA7PAG);
        pStmt.setInt(12, registro.NUNDIA8PAG);
        pStmt.setInt(13, registro.NUNDIA9PAG);
        pStmt.setInt(14, registro.NUNDIA10PAG);
        pStmt.setInt(15, registro.NUNDIA11PAG);
        pStmt.setInt(16, registro.NUNDIA12PAG);
        pStmt.setDate(17, registro.DTULTALTERACAO);
        pStmt.setString(18, registro.STATIVO);
        pStmt.setInt(19, registro.QTDDIAS);
        pStmt.setInt(20, registro.IDTPDOCUMENTO);
        pStmt.setInt(21, registro.IDCONDICAOPAGAMENTO);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDCONDICAOPAGAMENTO")),0) + 1 FROM "VAR_DB_NAME"."CONDICAOPAGAMENTO" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CONDICAOPAGAMENTO" ' +
		" ( " +
		' "IDCONDICAOPAGAMENTO", ' +
		' "IDGRUPOEMPRESARIAL", ' +
        ' "DSCONDICAOPAG", ' +
        ' "STPARCELADO", ' +
        ' "NUPARCELAS", ' +
        ' "NUNDIA1PAG", ' +
        ' "NUNDIA2PAG", ' +
        ' "NUNDIA3PAG", ' +
        ' "NUNDIA4PAG", ' +
        ' "NUNDIA5PAG", ' +
        ' "NUNDIA6PAG", ' +
        ' "NUNDIA7PAG", ' +
        ' "NUNDIA8PAG", ' +
        ' "NUNDIA9PAG", ' +
        ' "NUNDIA10PAG", ' +
        ' "NUNDIA11PAG", ' +
        ' "NUNDIA12PAG", ' +
        ' "DTULTALTERACAO", ' +
        ' "STATIVO", ' +
        ' "QTDDIAS", ' +
        ' "IDTPDOCUMENTO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdCondPag = api.executeScalar(queryId,1);
	
		pStmt.setInt(1, parseInt(IdCondPag));
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setString(3, registro.DSCONDICAOPAG);
        pStmt.setString(4, registro.STPARCELADO);
        pStmt.setInt(5, registro.NUPARCELAS);
        pStmt.setInt(6, registro.NUNDIA1PAG);
        pStmt.setInt(7, registro.NUNDIA2PAG);
        pStmt.setInt(8, registro.NUNDIA3PAG);
        pStmt.setInt(9, registro.NUNDIA4PAG);
        pStmt.setInt(10, registro.NUNDIA5PAG);
        pStmt.setInt(11, registro.NUNDIA6PAG);
        pStmt.setInt(12, registro.NUNDIA7PAG);
        pStmt.setInt(13, registro.NUNDIA8PAG);
        pStmt.setInt(14, registro.NUNDIA9PAG);
        pStmt.setInt(15, registro.NUNDIA10PAG);
        pStmt.setInt(16, registro.NUNDIA11PAG);
        pStmt.setInt(17, registro.NUNDIA12PAG);
        pStmt.setDate(18, registro.DTULTALTERACAO);
        pStmt.setString(19, registro.STATIVO);
        pStmt.setInt(20, registro.QTDDIAS);
        pStmt.setInt(21, registro.IDTPDOCUMENTO);
    	
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