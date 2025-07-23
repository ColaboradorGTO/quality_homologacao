var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbn.IDNCM,' +
    '   tbn.NUNCM,' +
    '   tbn.EX,' +
    '   tbn.TIPO,' +
    '   tbn.DSNCM,' +
    '   tbn.IMPNACIONAL,' +
    '   tbn.IMPIMPORTACAOFEDERAL,' +
    '   tbn.IMPESTADUAL,' +
    '   tbn.IMPMUNICIPAL,' +
    '   tbn.DTINICIOVIGENCIA,' +
    '   tbn.DTFIMVIGENCIA,' +
    '   tbn.PWCHAVE,' +
    '   tbn.NUVERSAO,' +
    '   tbn.FONTE,' +
    '   tbn.SGUF,' +
    '   tbn.PERCIBPT,' +
    '   TO_VARCHAR(tbn.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".NCM tbn' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbn.IDNCM = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."NCM" SET ' + 
        ' "NUNCM" = ?, ' + 
        ' "EX" = ?, ' + 
        ' "TIPO" = ?, ' + 
        ' "DSNCM" = ?, ' + 
        ' "IMPNACIONAL" = ?, ' + 
        ' "IMPIMPORTACAOFEDERAL" = ?, ' + 
        ' "IMPESTADUAL" = ?, ' + 
        ' "IMPMUNICIPAL" = ?, ' + 
        ' "DTINICIOVIGENCIA" = ?, ' + 
        ' "DTFIMVIGENCIA" = ?, ' + 
        ' "PWCHAVE" = ?, ' + 
        ' "NUVERSAO" = ?, ' + 
        ' "FONTE" = ?, ' + 
        ' "SGUF" = ?, ' + 
        ' "PERCIBPT" = ?, ' + 
        ' "DTULTALTERACAO" = ? ' +
    	' WHERE "IDNCM" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.NUNCM);
        pStmt.setString(2, registro.EX);
        pStmt.setString(3, registro.TIPO);
        pStmt.setString(4, registro.DSNCM);
        pStmt.setFloat(5, registro.IMPNACIONAL);
        pStmt.setFloat(6, registro.IMPIMPORTACAOFEDERAL);
        pStmt.setFloat(7, registro.IMPESTADUAL);
        pStmt.setFloat(8, registro.IMPMUNICIPAL);
        pStmt.setDate(9, registro.DTINICIOVIGENCIA);
        pStmt.setDate(10, registro.DTFIMVIGENCIA);
        pStmt.setString(11, registro.PWCHAVE);
        pStmt.setString(12, registro.NUVERSAO);
        pStmt.setString(13, registro.FONTE);
        pStmt.setString(14, registro.SGUF);
        pStmt.setFloat(15, registro.PERCIBPT);
        pStmt.setDate(16, registro.DTULTALTERACAO);
        pStmt.setInt(17, registro.IDNCM);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."NCM" ' +
		" ( " +
		' "IDNCM", ' +
        ' "NUNCM", ' +
        ' "EX", ' +
        ' "TIPO", ' +
        ' "DSNCM", ' +
        ' "IMPNACIONAL", ' +
        ' "IMPIMPORTACAOFEDERAL", ' +
        ' "IMPESTADUAL", ' +
        ' "IMPMUNICIPAL", ' +
        ' "DTINICIOVIGENCIA", ' +
        ' "DTFIMVIGENCIA", ' +
        ' "PWCHAVE", ' +
        ' "NUVERSAO", ' +
        ' "FONTE", ' +
        ' "SGUF", ' +
        ' "PERCIBPT", ' +
        ' "DTULTALTERACAO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_NCM.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.NUNCM);
        pStmt.setString(2, registro.EX);
        pStmt.setString(3, registro.TIPO);
        pStmt.setString(4, registro.DSNCM);
        pStmt.setFloat(5, registro.IMPNACIONAL);
        pStmt.setFloat(6, registro.IMPIMPORTACAOFEDERAL);
        pStmt.setFloat(7, registro.IMPESTADUAL);
        pStmt.setFloat(8, registro.IMPMUNICIPAL);
        pStmt.setDate(9, registro.DTINICIOVIGENCIA);
        pStmt.setDate(10, registro.DTFIMVIGENCIA);
        pStmt.setString(11, registro.PWCHAVE);
        pStmt.setString(12, registro.NUVERSAO);
        pStmt.setString(13, registro.FONTE);
        pStmt.setString(14, registro.SGUF);
        pStmt.setFloat(15, registro.PERCIBPT);
        pStmt.setDate(16, registro.DTULTALTERACAO);
    	
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