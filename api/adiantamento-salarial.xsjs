var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataFechamento = $.request.parameters.get("dataFechamento");
    
    var query = 
        'SELECT ' +  
        '   tbas.IDADIANTAMENTOSALARIO,' +
        '   tbas.IDEMPRESA,' +
        '   tbas.IDFUNCIONARIO,' +
        '   tbas.TXTMOTIVO,' +
        '   tbas.VRVALORDESCONTO,' +
        '   TO_VARCHAR(tbas.DTLANCAMENTO,\'DD/mm/YYYY\') AS DTLANCAMENTO, ' +
        '   tbas.STATIVO,' +
        '   tbe.NORAZAOSOCIAL,'+
        '   tbe.NOFANTASIA,'+
        '   tbe.NUCNPJ,'+
        '   tbf.NOFUNCIONARIO,'+
        '   tbf.NUCPF,' +
        '   IFNULL(tbf1.NOFUNCIONARIO,\'\') AS NOMEGERENTE' +
        ' FROM ' + 
        '   "VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas' +  
        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbas.IDEMPRESA' +
        '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbas.IDFUNCIONARIO' +
        '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf1 ON tbas.IDUSR = tbf1.IDFUNCIONARIO' +
        '  WHERE ' +
        ' 	1 = ? ';
        
    if ( byId ) {
        query = query + ' And  tbas.IDADIANTAMENTOSALARIO = \'' + byId + '\' ';
    }
    
    if ( idEmpresa ) {
        query = query + ' And  tbas.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataFechamento) {
        query = query + ' AND (tbas.DTLANCAMENTO  BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\')';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
}

function fnHandlePut() {
    
    var conn = $.db.getConnection();
    
    var query = 'UPDATE "VAR_DB_NAME"."ADIANTAMENTOSALARIAL" SET ' + 
        ' "IDEMPRESA" = ?, ' + 
        ' "IDFUNCIONARIO" = ?, ' + 
        ' "TXTMOTIVO" = ?, ' +
        ' "VRVALORDESCONTO" = ?, ' +
        ' "DTLANCAMENTO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "IDUSR" = ? '+
        ' WHERE "IDADIANTAMENTOSALARIO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDEMPRESA);
    	pStmt.setInt(2, registro.IDFUNCIONARIO);
    	pStmt.setString(3, registro.TXTMOTIVO);
    	pStmt.setFloat(4, registro.VRVALORDESCONTO);
    	pStmt.setDate(5, registro.DTLANCAMENTO);
    	pStmt.setString(6, registro.STATIVO);
    	pStmt.setInt(7, registro.IDUSR);
     	pStmt.setInt(8, registro.IDADIANTAMENTOSALARIO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."ADIANTAMENTOSALARIAL" ' +
		" ( " +
		' "IDADIANTAMENTOSALARIO", ' +
		' "IDEMPRESA", ' +
		' "IDFUNCIONARIO", ' +
		' "TXTMOTIVO", ' +
		' "VRVALORDESCONTO", ' +
		' "DTLANCAMENTO", ' +
		' "STATIVO", ' +
		' "IDUSR" ' +
		' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_ADIANTAMENTOSALARIAL.NEXTVAL,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESA);
		pStmt.setInt(2, registro.IDFUNCIONARIO);
		pStmt.setString(3, registro.TXTMOTIVO);
		pStmt.setFloat(4, registro.VRVALORDESCONTO);
		pStmt.setString(5, registro.DTLANCAMENTO);
		pStmt.setString(6, registro.STATIVO);
		pStmt.setInt(7, registro.IDUSR);

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
    
} catch (err) {
    $.response.status = 400;
    var errorObj = JSON.stringify({message : err.toString()});
    $.response.setBody(errorObj);
}

