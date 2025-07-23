var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    
var empresa = $.request.parameters.get("empresa");   
var cpf = $.request.parameters.get("cpf");


var query = ' SELECT ' + 
    '   tbf.ID,' +
    '   tbf.IDFUNCIONARIO,' +
    '   tbf.IDGRUPOEMPRESARIAL,' +
    '   tbf.IDSUBGRUPOEMPRESARIAL,' +
    '   tbf.IDEMPRESA,' +
	'   UPPER(tbf.NOFUNCIONARIO) AS NOFUNCIONARIO,' +
    '   tbf.NUCPF,' +
    '   tbf.NOLOGIN,' +
    '   tbf.PWSENHA,' +
    '   tbf.DSFUNCAO,' +
    '   tbf.DATAULTIMAALTERACAO,' +
    '   tbf.DTINICIODESC,' +
    '   tbf.DTFIMDESC,' +
    '   tbf.PERCDESCUSUAUTORIZADO,' +
    '   tbf.TXTMOTIVODESCONTO,' +
    '   tbf.IDFUNCIONARIOULTALTERACAO,' +
    '   tbf.VALORSALARIO,' +
    '   TO_VARCHAR(tbf.DATA_DEMISSAO,\'DD-MM-YYYY\') AS DATA_DEMISSAO,' +
    '   tbf.STATIVO,' +
    '   tbf.PERC,' +
    '   tbf.DSTIPO,' +
    '   TO_VARCHAR(tbf.DTINICIODESC,\'YYYY-MM-DD\') AS DTINICIODESC,' +
    '   TO_VARCHAR(tbf.DTFIMDESC,\'YYYY-MM-DD\') AS DTFIMDESC,' +
    '   tbf.PERCDESCUSUAUTORIZADO,' +
    '   tbp.IDPERFIL,' +
    '   tbp.DSPERFIL, ' +
    '   tbmod.IDMODULO,' +
    '   tbmod.DSMODULO,' +
    '   tbmn.IDMENU,' +
    '   tbmn.DSMENU' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    '   INNER JOIN "VAR_DB_NAME".PERFIL tbp ON tbp.IDPERFIL = tbf.IDPERFIL' +
    '   INNER JOIN "VAR_DB_NAME".MODULO tbmod ON tbmod.IDMODULO = tbf.IDMODULO' +
    '   INNER JOIN "VAR_DB_NAME".MENU tbmn ON tbmn.IDMENU = tbf.IDMENU ' +
    ' WHERE ' +
        '	1 = ? ';
    
    if ( byId ) {
        query = query + ' And  tbf.ID = \'' + byId + '\' ';
    }
    if(empresa) {
        query = query +  ' and (tbf.IDEMPRESA  = ' +  empresa+' or DSFUNCAO=\'TI\') and tbf.IDFUNCIONARIO is not null and tbf.NOLOGIN <> \'\' ';
    } 
    
    if(cpf) {
        query = query + ' And  tbf.NUCPF = \'' + cpf + '\' ';
    } 
    
    query = query + 'order by tbf.NOFUNCIONARIO';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."FUNCIONARIO" SET ' + 

        ' "IDFUNCIONARIO" = ?, ' +
        ' "IDFUNCIONARIOULTALTERACAO" = ?, ' +
        ' "IDEMPRESA" = ?, ' +
        ' "IDPERFIL" = ?, ' +
        ' "IDMODULO" = ?, ' +
        ' "IDMENU" = ?, ' +
        ' "DSPERFIL" = ?, ' + 
        ' "DSMODULO" = ?, ' +
        ' "DSMENU" = ?, ' +
        ' "NOFUNCIONARIO" = ?, ' + 
        ' "NUCPF" = ?, ' + 
        ' "DSTIPO" = ?, ' + 
        ' "NOLOGIN" = ?, ' + 
        ' "PWSENHA" = ?, ' + 
        ' "DSFUNCAO" = ?, ' + 
        ' "VALORSALARIO" = ?, ' + 
        ' "DTINICIODESC" = ?, ' + 
        ' "DTFIMDESC" = ?, ' + 
        ' "PERC" = ?, ' +
        ' "PERCDESCUSUAUTORIZADO" = ?, ' + 
        ' "TXTMOTIVODESCONTO" = ?, ' + 
        ' "STATIVO" = ? ' +
    	' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
	return {
	    msg : "Atualização realizada com sucesso!",
	    "teste": bodyJson
	};
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDFUNCIONARIO);
        pStmt.setInt(2, registro.IDFUNCIONARIOULTALTERACAO);
        pStmt.setInt(3, registro.IDEMPRESA);
        pStmt.setInt(4, registro.IDPERFIL);
        pStmt.setInt(5, registro.IDMODULO);
        pStmt.setInt(6, registro.IDMENU);
        pStmt.setString(7, registro.DSPERFIL);
        pStmt.setString(8, registro.DSMODULO);
        pStmt.setString(9, registro.DSMENU);
        pStmt.setString(10, registro.NOFUNCIONARIO);
        pStmt.setString(11, registro.NUCPF);
        pStmt.setString(12, registro.DSTIPO);
        pStmt.setString(13, registro.NOLOGIN);
        pStmt.setString(14, registro.PWSENHA);
        pStmt.setString(15, registro.DSFUNCAO);
        pStmt.setFloat(16, registro.VALORSALARIO);
        pStmt.setDate(17, registro.DTINICIODESC);
        pStmt.setDate(18, registro.DTFIMDESC);
        pStmt.setFloat(19, registro.PERC);
        pStmt.setFloat(20, registro.PERCDESCUSUAUTORIZADO);
        pStmt.setString(21, registro.TXTMOTIVODESCONTO);
        pStmt.setString(22, registro.STATIVO);
        pStmt.setInt(23, registro.ID);

    	pStmt.execute();
    	
    	fnCapturarArrayModulo(registro.IDFUNCIONARIO, registro.IDMODULO, registro.IDMENU, conn)
    }
	pStmt.close();

	conn.commit();
	

}

function fnCapturarArrayModulo(queryIdFunc, lstModulo, lstMenu, conn){
    
    var query = `INSERT INTO "VAR_DB_NAME"."RELFUNCIONARIOIDS"
        (
        "IDFUNCIONARIO",
        "IDPERFIL",
        "IDMODULO",
        "IDMENU"
        )
        VALUES(?,?,?,?)`;

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstModulo.length; i++) {
	    
	   // var queryIdFunc = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDFUNCIONARIO")), 0) + 1 FROM "VAR_DB_NAME"."FUNCIONARIO" WHERE 1 = ? ', 1);

		var idModulo = lstModulo[i];

		pStmt.setInt(1, parseInt(queryIdFunc));
		pStmt.setInt(2, idModulo);
		
		for(var l = 0; l < lstMenu.length; l++) {
		    
		}
		pStmt.setInt(3, registro.IDPERFIL);
		pStmt.setInt(5, registro.IDMODULO);
		pStmt.setInt(7, registro.IDMENU);
		
		pStmt.execute();
		
		conn.commit();
	}

	pStmt.close();

	conn.commit();
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."FUNCIONARIO" ' +
		" ( " +
		' "ID", ' +
        ' "IDFUNCIONARIO", ' +
        ' "IDGRUPOEMPRESARIAL", ' +
        ' "IDSUBGRUPOEMPRESARIAL", ' +
        ' "IDPERFIL", ' +
        ' "IDMODULO", ' +
        ' "IDMENU", ' +
        ' "DSPERFIL", ' +
        ' "DSMODULO", ' +
        ' "DSMENU", ' +
        ' "NOFUNCIONARIO", ' +
        ' "NUCPF", ' +
        ' "DSTIPO", ' +
        ' "NOLOGIN", ' +
        ' "PWSENHA", ' +
        ' "DSFUNCAO", ' +
        ' "DATAULTIMAALTERACAO", ' +
        ' "VALORSALARIO", ' +
        ' "DTINICIODESC", ' +
        ' "DTFIMDESC", ' +
        ' "PERC", ' +
        ' "PERCDESCUSUAUTORIZADO", ' +
        ' "TXTMOTIVODESCONTO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,1,1,?,?,?,?,?,?,?,?,?,?,?,?,?,now(),?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
	    var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("ID")), 0) + 1 FROM "VAR_DB_NAME"."FUNCIONARIO" WHERE 1 = ? ', 1);
	    var queryIdFunc = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDFUNCIONARIO")), 0) + 1 FROM "VAR_DB_NAME"."FUNCIONARIO" WHERE 1 = ? ', 1);
        
		var registro = bodyJson[i];
		
        pStmt.setInt(1, parseInt(queryId));
		pStmt.setInt(2, parseInt(queryIdFunc));
		pStmt.setString(3, registro.DSPERFIL);
		pStmt.setString(4, registro.DSMODULO);
		pStmt.setString(5, registro.DSMENU);
        setIntOrNull(pStmt,6, registro.IDEMPRESA);
        pStmt.setString(7, registro.NOFUNCIONARIO);
        pStmt.setString(8, registro.NUCPF);
        pStmt.setString(9, registro.DSTIPO);
        pStmt.setString(10, registro.NOLOGIN);
        pStmt.setString(11, registro.PWSENHA);
        pStmt.setString(12, registro.DSFUNCAO);
        pStmt.setFloat(13, registro.VALORSALARIO);
        pStmt.setDate(14, registro.DTINICIODESC);
        pStmt.setDate(15, registro.DTFIMDESC);
        pStmt.setFloat(16, registro.PERC);
        pStmt.setFloat(17, registro.PERCDESCUSUAUTORIZADO);
        pStmt.setString(18, registro.TXTMOTIVODESCONTO);
        pStmt.setString(19, registro.STATIVO);

        pStmt.execute();
        
        fnCapturarArrayModulo(queryIdFunc, registro.arrayMod, conn)
        
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
        //Handle your PUT calls here
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