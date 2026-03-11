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
    var nuCPF = $.request.parameters.get("nuCPF");
    var NoFuncCPF = $.request.parameters.get("dsNomeFunc");
      var query = ' SELECT ' + 
    '   tbf.ID,' +
	'   tbf.IDFUNCIONARIO,' +
	'   tbf.IDGRUPOEMPRESARIAL,' +
	'   tbf.IDSUBGRUPOEMPRESARIAL,' +
	'   tbf.IDEMPRESA,' +
	'   tbe.NOFANTASIA, '+
	'   UPPER(TRIM(tbf.NOFUNCIONARIO)) AS NOFUNCIONARIO,' +
	'   tbf.IDPERFIL,' +
	'   tbf.NUCPF,' +
	'   tbf.NOLOGIN,' +
	'   tbf.PWSENHA,' +
	'   tbf.DSFUNCAO,' +
	'   tbf.DATAULTIMAALTERACAO,' +
	'   tbf.VALORSALARIO,' +
	'	TO_VARCHAR(tbf.DATA_DEMISSAO,\'DD-MM-YYYY\') AS DTDEMISSAO, ' +
	'   tbf.DATA_DEMISSAO,' +
	'   tbf.PERC,' +
	'   tbf.STATIVO,' +
	'   tbf.DSTIPO,' +
	'   tbf.VALORDISPONIVEL,' +
	'	TO_VARCHAR(tbf.DTINICIODESC,\'YYYY-MM-DD\') AS DTINICIODESC, ' +
	'	TO_VARCHAR(tbf.DTFIMDESC,\'YYYY-MM-DD\') AS DTFIMDESC, ' +
	'   tbf.PERCDESCUSUAUTORIZADO, ' +
	'   tbf.STCONVENIO,' +
	'   tbf.STDESCONTOFOLHA,' +
	'   tbf.STLOJA,' +
	'   tbf.DATA_ADMISSAO, ' +
	'   tbf.TELEFONE, ' +
	'   tbf.DEPARTAMENTO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbf.IDEMPRESA = tbe.IDEMPRESA' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbf.ID = \'' + byId + '\' ';
    }
    
    if(idEmpresa){
            query = query + ' And  tbf.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(nuCPF){
            query = query + ' And  tbf.NUCPF = \'' + nuCPF + '\' ';
    }
    
    if(NoFuncCPF){
        	query = query + ' And  (UPPER (tbf.NOFUNCIONARIO) LIKE UPPER( \'%' + NoFuncCPF + '%\') OR tbf.NUCPF=\''+NoFuncCPF+'\' ) ';
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
        ' "DEPARTAMENTO" = ? '+
        ' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    for (var i = 0; i < bodyJson.length; i++) {
        
    	var registro = bodyJson[i];

        pStmt.setString(1, registro.DEPARTAMENTO);
        pStmt.setInt(2, registro.ID);
                    
    	pStmt.execute();
    }
	pStmt.close();


	conn.commit();
	
    
	return {
	    msg : "Atualização realizada com sucesso!",
	    data: bodyJson
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
        
        default:
            break;    
       
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}