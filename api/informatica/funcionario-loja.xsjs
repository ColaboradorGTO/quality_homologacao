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
	'   tbf.DATA_ADMISSAO,' +
	'   tbf.TELEFONE' +
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
    
    query += ' ORDER BY tbf.STATIVO DESC, TRIM(tbf.NOFUNCIONARIO) ASC'
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

// function fnHandlePut() {
//     var conn = $.db.getConnection();
//     var query = 'UPDATE "VAR_DB_NAME"."FUNCIONARIO" SET ' + 
//         ' "NOFUNCIONARIO" = ?, ' +
//         ' "NUCPF" = ?, ' +
//         ' "NOLOGIN" = ?, ' +
//         ' "PWSENHA" = ?, '+
//         ' "IDEMPRESA" = ?, ' +
//         ' "IDSUBGRUPOEMPRESARIAL" = ?, ' +
//         ' "DATAULTIMAALTERACAO" = NOW(), '+
//         ' "DSFUNCAO" = ?, '+
//         ' "IDFUNCIONARIO" = ?, '+
//         ' "DSTIPO" = ?, '+
//         ' "PERC" = ?, '+
//         ' "VALORSALARIO" = ?, '+
//         ' "VALORDISPONIVEL" = ?, '+
//         ' "TXTMOTIVODESCONTO" = ?, '+
//         ' "IDFUNCIONARIOULTALTERACAO" = ?, '+
//         ' "STCONVENIO" = ?, '+
//         ' "STDESCONTOFOLHA" = ?, '+
//         ' "STLOJA" = ?, '+
//         ' "DATA_ADMISSAO" = ?' +
//     	' WHERE "ID" =  ? ';
        
//     var pStmt = conn.prepareStatement(api.replaceDbName(query));
//     var bodyJson = JSON.parse($.request.body.asString()); 

//     for (var i = 0; i < bodyJson.length; i++) {
        
//     	var registro = bodyJson[i];
    	
//         if(parseFloat(registro.PERC) > 50){
//           return {
//              msg : "Valor desconto maior que permitido!"
//             }; 
//         }
        
//         let nucpf =  registro.NUCPF
//         nucpf = nucpf.replace(/\D/g, '')

//         pStmt.setString(1, registro.NOFUNCIONARIO);
//         pStmt.setString(2, nucpf);
//         pStmt.setString(3, registro.NOLOGIN);
//         pStmt.setString(4, registro.PWSENHA);
//         setIntOrNull(pStmt,5, registro.IDEMPRESA);
//         setIntOrNull(pStmt, 6, registro.IDSUBGRUPOEMPRESARIAL);
//         pStmt.setString(7, registro.DSFUNCAO);
//         setIntOrNull(pStmt,8, registro.IDFUNCIONARIO);
//         pStmt.setString(9, registro.DSTIPO);
//         pStmt.setFloat(10, registro.PERC);
//         pStmt.setFloat(11, registro.VALORSALARIO);
//         pStmt.setFloat(12, registro.VALORDISPONIVEL);
//         pStmt.setString(13, registro.MOTIVODESC);
//         setIntOrNull(pStmt,14, registro.IDFUNCALTERACAO);
//         pStmt.setString(15, registro.STCONVENIO);
//         pStmt.setString(16, registro.STDESCONTOFOLHA);
//         pStmt.setString(17, registro.STLOJA);
//         pStmt.setInt(18, registro.ID);
        
//          if (registro.DATA_ADMISSAO) {
//           let dataAdmissao = new Date(registro.DATA_ADMISSAO);
//           let sqlDate = dataAdmissao.toISOString().split('T')[0]; // Formato YYYY-MM-DD
//           pStmt.setString(19, sqlDate);
//         } else {
//           pStmt.setString(19, null);
//         }
    
//         // pStmt.setDate(19, registro.DATA_ADMISSAO);
//     	pStmt.execute();
//     }
// 	pStmt.close();

// 	conn.commit();
	
// 	return {
// 	    msg : "Atualização realizada com sucesso!"
// 	};
// }

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."FUNCIONARIO" SET ' + 
        ' "NOFUNCIONARIO" = ?, ' +
        ' "NUCPF" = ?, ' +
        ' "NOLOGIN" = ?, ' +
        ' "PWSENHA" = ?, ' +
        ' "IDEMPRESA" = ?, ' +
        ' "IDSUBGRUPOEMPRESARIAL" = ?, ' +
        ' "DATAULTIMAALTERACAO" = NOW(), ' +
        ' "DSFUNCAO" = ?, ' +
        ' "IDFUNCIONARIO" = ?, ' +
        ' "DSTIPO" = ?, ' +
        ' "PERC" = ?, ' +
        ' "VALORSALARIO" = ?, ' +
        ' "VALORDISPONIVEL" = ?, ' +
        ' "TXTMOTIVODESCONTO" = ?, ' +
        ' "IDFUNCIONARIOULTALTERACAO" = ?, ' +
        ' "STCONVENIO" = ?, ' +
        ' "STDESCONTOFOLHA" = ?, ' +
        ' "STLOJA" = ?, ' +
        ' "DATA_ADMISSAO" = ?,' +
        ' "TELEFONE" = ?' +
        ' WHERE "ID" = ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {
        var registro = bodyJson[i];

        if (parseFloat(registro.PERC) > 50) {
            return {
                msg: "Valor desconto maior que permitido!"
            };
        }

        let nucpf = registro.NUCPF;
        nucpf = nucpf.replace(/\D/g, '');

        pStmt.setString(1, registro.NOFUNCIONARIO);
        pStmt.setString(2, nucpf);
        pStmt.setString(3, registro.NOLOGIN);
        pStmt.setString(4, registro.PWSENHA);
        setIntOrNull(pStmt, 5, registro.IDEMPRESA);
        setIntOrNull(pStmt, 6, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(7, registro.DSFUNCAO);
        setIntOrNull(pStmt, 8, registro.IDFUNCIONARIO);
        pStmt.setString(9, registro.DSTIPO);
        pStmt.setFloat(10, registro.PERC);
        pStmt.setFloat(11, registro.VALORSALARIO);
        pStmt.setFloat(12, registro.VALORDISPONIVEL);
        pStmt.setString(13, registro.MOTIVODESC);
        setIntOrNull(pStmt, 14, registro.IDFUNCALTERACAO);
        pStmt.setString(15, registro.STCONVENIO);
        pStmt.setString(16, registro.STDESCONTOFOLHA);
        pStmt.setString(17, registro.STLOJA);
        pStmt.setDate(18, registro.DATA_ADMISSAO);
        pStmt.setString(19, registro.TELEFONE);
         /*if (registro.DATA_ADMISSAO) {
            let dataAdmissao = new Date(registro.DATA_ADMISSAO);
            let sqlDate = dataAdmissao.getFullYear() + '-' + 
                          ('0' + (dataAdmissao.getMonth() + 1)).slice(-2) + '-' + 
                          ('0' + dataAdmissao.getDate()).slice(-2);
            pStmt.setString(18, sqlDate);
        } else {
            pStmt.setNull(18, $.db.Types.DATE);
        }*/

        pStmt.setInt(20, registro.ID);

        pStmt.execute();
    }
    pStmt.close();

    conn.commit();

    return {
        msg: "Atualização realizada com sucesso!"
    };
}

function fnHandlePost() {
    let conn = $.db.getConnection();
    let numCPF;
    
    let query = 'INSERT INTO "VAR_DB_NAME"."FUNCIONARIO" ' +
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
        ' "PERC", ' + 
        ' "STATIVO", ' +
        ' "DSTIPO", ' +
        ' "VALORDISPONIVEL", ' +
        ' "STCONVENIO", '+
        ' "STDESCONTOFOLHA", '+
        ' "STLOJA", '+
        ' "DATA_ADMISSAO", ' +
        ' "TELEFONE" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_FUNCIONARIO.NEXTVAL,?,1,?,?,?,0,?,?,?,?,now(),?,?,?,?,?,?,?,?,?,?)';
		
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	let bodyJson = JSON.parse($.request.body.asString());
    // return {bodyJson}
	for (var i = 0; i < bodyJson.length; i++) {
        var registro = bodyJson[i];
        
		if(parseFloat(registro.PERC) > 50){
           return {
        	    msg : "Valor desconto maior que permitido!",
        	    
        	}; 
        }
        
        numCPF = registro.NUCPF;
		
		pStmt.setInt(1, registro.IDFUNCIONARIO);
		setIntOrNull(pStmt,2, registro.IDSUBGRUPOEMPRESARIAL);
        setIntOrNull(pStmt,3, registro.IDEMPRESA);
        pStmt.setString(4, registro.NOFUNCIONARIO);
        pStmt.setString(5, registro.NUCPF);
        pStmt.setString(6, registro.NOLOGIN);
        pStmt.setString(7, registro.PWSENHA);
        pStmt.setString(8, registro.DSFUNCAO);
        pStmt.setFloat(9, registro.VALORSALARIO);
        pStmt.setFloat(10, registro.PERC); 
        pStmt.setString(11, registro.STATIVO);
        pStmt.setString(12, registro.DSTIPO);
        pStmt.setFloat(13, registro.VALORDISPONIVEL);
        pStmt.setString(14, registro.STCONVENIO);
        pStmt.setString(15, registro.STDESCONTOFOLHA);
        pStmt.setString(16, registro.STLOJA);
    	pStmt.setDate(17, registro.DATA_ADMISSAO);
    	pStmt.setString(18, registro.TELEFONE);
    // if (registro.DATA_ADMISSAO) {
    //   let dataAdmissao = new Date(registro.DATA_ADMISSAO);
    //   let sqlDate = dataAdmissao.getFullYear() + '-' + 
    //                   ('0' + (dataAdmissao.getMonth() + 1)).slice(-2) + '-' + 
    //                   ('0' + dataAdmissao.getDate()).slice(-2);
    //   pStmt.setString(17, sqlDate);
    // } else {
    //   pStmt.setNull(17, $.db.Types.DATE);
    // }
    	
      pStmt.execute();
	  }

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!",
	    "NUCPF": numCPF
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