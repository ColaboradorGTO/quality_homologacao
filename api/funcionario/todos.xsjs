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
var matricula = $.request.parameters.get("matricula");
var senha = $.request.parameters.get("senha");
var idFuncionario = $.request.parameters.get("idFuncionario");


var query = ' SELECT ' + 
    '   tbf.ID,' +
    '   tbf.IDFUNCIONARIO,' +
    '   tbf.IDGRUPOEMPRESARIAL,' +
    '   tbf.IDSUBGRUPOEMPRESARIAL,' +
    '   tbf.IDEMPRESA,' +
    '   tbf.NOFUNCIONARIO,' +
    '   tbf.IDPERFIL,' +
    '   tbf.NUCPF,' +
    '   tbf.NOLOGIN,' +
    '   tbf.PWSENHA,' +
    '   tbf.DSFUNCAO,' +
    '   IFNULL(TO_VARCHAR(tbf.DATAULTIMAALTERACAO,\'YYYY-MM-DD HH:MM:SS\'),TO_VARCHAR(NOW(),\'YYYY-MM-DD HH:MM:SS\')) AS DTULTALTERACAO,  ' +
    '   tbf.VALORSALARIO,' +
    '   tbf.DATA_DEMISSAO,' +
    '   tbf.PERC,' +
    '   tbf.STATIVO,' +
    '   IFNULL(tbf.PERCDESCPDV,0) AS PERCDESCPDV,' +
    '   tbf.DSTIPO,' +
    '   IFNULL(tbf.VALORDISPONIVEL,0) AS VALORDISPONIVEL,' +
    '   IFNULL(TO_VARCHAR(tbf.DTINICIODESC,\'YYYY-MM-DD HH:MM:SS\'),\'\') AS DTINICIODESC,' +
    '   IFNULL(TO_VARCHAR(tbf.DTFIMDESC,\'YYYY-MM-DD HH:MM:SS\'),\'\') AS DTFIMDESC,' +
    '   IFNULL(tbf.PERCDESCUSUAUTORIZADO,0) AS PERCDESCUSUAUTORIZADO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    ' WHERE ' +
        '	1 = ? '+
        '   and tbf.DATA_DEMISSAO is null and tbf.STATIVO=\'True\' ';
        
    
    if ( byId ) {
        query = query + ' And  tbf.ID = \'' + byId + '\' ';
    }
    
    if ( idFuncionario ) {
        query = query + ' And  tbf.IDFUNCIONARIO = \'' + idFuncionario + '\' ';
    }
    
    if(empresa) {
        query = query +  ' and (tbf.IDEMPRESA  = ' +  empresa+' or DSFUNCAO=\'TI\') and tbf.IDFUNCIONARIO is not null and tbf.NOLOGIN <> \'\' ';
    } 
    
    if(cpf) {
        query = query + ' And  tbf.NUCPF = \'' + cpf + '\' ';
    }
    
    if(matricula && senha) {
        query = query + ' And  tbf.NOLOGIN = \'' + matricula + '\' And  tbf.PWSENHA = \'' + senha + '\' ';
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
        ' "IDGRUPOEMPRESARIAL" = ?, ' + 
        ' "IDSUBGRUPOEMPRESARIAL" = ?, ' + 
        ' "IDEMPRESA" = ?, ' + 
        ' "NOFUNCIONARIO" = ?, ' + 
        ' "IDPERFIL" = ?, ' + 
        ' "NUCPF" = ?, ' + 
        ' "NOLOGIN" = ?, ' + 
        ' "PWSENHA" = ?, ' + 
        ' "DSFUNCAO" = ?, ' + 
        ' "DATAULTIMAALTERACAO" = ?, ' + 
        ' "VALORSALARIO" = ?, ' + 
        ' "DATA_DEMISSAO" = ?, ' + 
        ' "PERC" = ? ' + 
    	' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDFUNCIONARIO);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setInt(4, registro.IDEMPRESA);
        pStmt.setString(5, registro.NOFUNCIONARIO);
        pStmt.setInt(6, registro.IDPERFIL);
        pStmt.setString(7, registro.NUCPF);
        pStmt.setString(8, registro.NOLOGIN);
        pStmt.setString(9, registro.PWSENHA);
        pStmt.setString(10, registro.DSFUNCAO);
        pStmt.setString(11, registro.DATAULTIMAALTERACAO);
        pStmt.setFloat(12, registro.VALORSALARIO);
        pStmt.setDate(13, registro.DATA_DEMISSAO);
        pStmt.setFloat(14, registro.PERC);
    	pStmt.setInt(15, registro.ID);
                    
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
		' VALUES(QUALITY_CONC_HML.SEQ_FUNCIONARIO.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		setIntOrNull(pStmt,1, registro.IDFUNCIONARIO);
        setIntOrNull(pStmt,2, registro.IDGRUPOEMPRESARIAL);
        setIntOrNull(pStmt,3, registro.IDSUBGRUPOEMPRESARIAL);
        setIntOrNull(pStmt,4, registro.IDEMPRESA);
        pStmt.setString(5, registro.NOFUNCIONARIO);
        setIntOrNull(pStmt,6, registro.IDPERFIL);
        pStmt.setString(7, registro.NUCPF);
        pStmt.setString(8, registro.NOLOGIN);
        pStmt.setString(9, registro.PWSENHA);
        pStmt.setString(10, registro.DSFUNCAO);
        pStmt.setString(11, registro.DATAULTIMAALTERACAO);
        pStmt.setFloat(12, registro.VALORSALARIO);
        setDateOrNull(pStmt,13, registro.DATA_DEMISSAO);
        pStmt.setFloat(14, registro.PERC);
    	
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