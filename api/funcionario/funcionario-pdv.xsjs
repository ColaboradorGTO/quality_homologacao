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
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var query = ' SELECT ' + 
    '   tbf.ID,' +
	'   tbf.IDFUNCIONARIO,' +
	'   tbf.IDGRUPOEMPRESARIAL,' +
	'   tbf.IDSUBGRUPOEMPRESARIAL,' +
	'   tbf.IDEMPRESA,' +
	'   tbe.NOFANTASIA, '+
	'   tbf.NOFUNCIONARIO,' +
	'   tbf.IDPERFIL,' +
	'   tbf.NUCPF,' +
	'   tbf.NOLOGIN,' +
	'   tbf.PWSENHA,' +
	'   tbf.DSFUNCAO,' +
	'   tbf.DATAULTIMAALTERACAO,' +
	'   tbf.VALORSALARIO,' +
	'   tbf.DATA_DEMISSAO,' +
	'   tbf.PERC' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbf.IDEMPRESA = tbe.IDEMPRESA' +
    ' WHERE ' +
        '	1 = ? and tbf.IDFUNCIONARIO is not null and tbf.NOLOGIN <> \'\' ';
    
    if ( byId ) {
        query = query + ' And  tbf.ID = \'' + byId + '\' ';
    }
    
    if(idEmpresa){
            query = query + ' And  tbf.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."FUNCIONARIO" SET ' + 
        ' "NOLOGIN" = ?, ' +
        ' "PWSENHA" = ?, '+
        ' "VALORSALARIO" = ?, '+
        ' "IDEMPRESA" = ?, ' +
        ' "PERC" = ?, '+
        ' "DATAULTIMAALTERACAO" = NOW(), '+
        ' "DSFUNCAO" = ? '+
    	' WHERE "IDFUNCIONARIO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.NOLOGIN);
        pStmt.setString(2, registro.PWSENHA);
        pStmt.setFloat(3, registro.VALORSALARIO);
        pStmt.setInt(4, registro.IDEMPRESA);
        pStmt.setFloat(5, registro.PERC);
        pStmt.setString(6, registro.DSFUNCAO);
        pStmt.setInt(7, registro.IDFUNCIONARIO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."FUNCIONARIO" ' +
		" ( " +
		' "ID", ' +
        ' "IDFUNCIONARIO", ' +
        ' "IDGRUPOEMPRESARIAL", ' +
        ' "IDSUBGRUPOEMPRESARIAL", ' +
        ' "IDEMPRESA", ' +
        ' "NOFUNCIONARIO", ' +
        ' "IDPERFIL", ' +
        ' "NUCPF", ' +
        ' "NOLOGIN", ' +
        ' "PWSENHA", ' +
        ' "DSFUNCAO", ' +
        ' "DATAULTIMAALTERACAO", ' +
        ' "VALORSALARIO", ' +
        ' "DATA_DEMISSAO", ' +
        ' "PERC" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_FUNCIONARIO.NEXTVAL,QUALITY_CONC_HML.SEQ_FUNCIONARIO.NEXTVAL,?,?,?,?,?,?,?,?,?,now(),?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL||1);
        pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL||1);
        setIntOrNull(pStmt,3, registro.IDEMPRESA);
        pStmt.setString(4, registro.NOFUNCIONARIO);
        pStmt.setInt(5, registro.IDPERFIL||0);
        pStmt.setString(6, registro.NUCPF);
        pStmt.setString(7, registro.NOLOGIN);
        pStmt.setString(8, registro.PWSENHA);
        pStmt.setString(9, registro.DSFUNCAO);
        pStmt.setFloat(10, registro.VALORSALARIO);
        setDateOrNull(pStmt,11, registro.DATA_DEMISSAO);
        pStmt.setFloat(12, registro.PERC);
    	
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