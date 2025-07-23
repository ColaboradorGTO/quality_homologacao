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
	'   UPPER(tbf.NOFUNCIONARIO) AS NOFUNCIONARIO,' +
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
	'   tbf.DATA_ADMISSAO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIO tbf' +
    '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbf.IDEMPRESA = tbe.IDEMPRESA' +
    ' WHERE ' +
        '	1 = ? ';
    
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
    
    query = query + ' ORDER BY  tbf.ID DESC';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

// function fnHandlePut() {
//   var conn = $.db.getConnection();
// //   var query = 'UPDATE "VAR_DB_NAME"."FUNCIONARIO" SET ' + 
// //   ' "IDEMPRESA" = ?, ' +
// //   ' "NOFUNCIONARIO" = ?, ' +
// //   ' "NUCPF" = ?, ' +
// //   ' "PWSENHA" = ?, '+
// //   ' "DSFUNCAO" = ?, '+
// //   ' "VALORSALARIO" = ?, '+
// //   ' "PERC" = ?, '+
// //   ' "DSTIPO" = ?, '+
// //   ' "STATIVO" = ?, '+
// //   ' "VALORDISPONIVEL" = ?, '+
// //   ' "DATA_ADMISSAO" = ?, ' +
// //   ' "DATAULTIMAALTERACAO" = NOW() '+
// //   ' WHERE "ID" =  ? ';
    
//     let query = `
//         UPDATE "VAR_DB_NAME"."FUNCIONARIO"
//         SET
//           "PERC" = ?,
//           "DATAULTIMAALTERACAO" = NOW()
//         WHERE 
//           "ID" = ? 
//           AND "STATIVO" = TRUE
//     `;
//   var pStmt = conn.prepareStatement(api.replaceDbName(query));
//   var bodyJson = JSON.parse($.request.body.asString()); 

//   for (var i = 0; i < bodyJson.length; i++) {
//     var registro = bodyJson[i];

//     if(parseFloat(registro.PERC) > 50){
//         return {
//             msg : "Valor desconto maior que permitido!"
//         };
//     }
    
//     // pStmt.setInt(1, registro.IDEMPRESA);
//     // pStmt.setString(2, registro.NOFUNCIONARIO);
//     // pStmt.setString(3, registro.NUCPF);
//     // pStmt.setString(4, registro.PWSENHA);
//     // pStmt.setString(5, registro.DSFUNCAO);
//     // pStmt.setFloat(6, registro.VALORSALARIO);
//     // pStmt.setFloat(7, registro.PERC);
//     // pStmt.setString(8, registro.DSTIPO);
//     // pStmt.setString(9, registro.STATIVO);
//     // pStmt.setFloat(10, registro.VALORDISPONIVEL);
//     // pStmt.setDate(11, registro.DATA_ADMISSAO);
//     // pStmt.setInt(12, registro.ID);
            
//     pStmt.setFloat(1, registro.PERC);
//     pStmt.setInt(2, registro.ID);
    
//     pStmt.execute();
//   }
//   pStmt.close();

//   conn.commit();
  
//   return {
//     msg : "Atualização realizada com sucesso!",
//     data: bodyJson
//   };
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
        ' "DATA_ADMISSAO" = ?' +
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
         /*if (registro.DATA_ADMISSAO) {
            let dataAdmissao = new Date(registro.DATA_ADMISSAO);
            let sqlDate = dataAdmissao.getFullYear() + '-' + 
                          ('0' + (dataAdmissao.getMonth() + 1)).slice(-2) + '-' + 
                          ('0' + dataAdmissao.getDate()).slice(-2);
            pStmt.setString(18, sqlDate);
        } else {
            pStmt.setNull(18, $.db.Types.DATE);
        }*/

        pStmt.setInt(19, registro.ID);

        pStmt.execute();
    }
    pStmt.close();

    conn.commit();

    return {
        msg: "Atualização realizada com sucesso!"
    };
}

function fnHandlePost() {
    var conn = $.db.getConnection();

    // let query = 'INSERT INTO "VAR_DB_NAME"."FUNCIONARIO" ' +
    // " ( " +
    // ' "ID", ' +
    //     ' "IDFUNCIONARIO", ' +
    //     ' "IDEMPRESA", ' +
    //     ' "NOFUNCIONARIO", ' +
    //     ' "NUCPF", ' +
    //     ' "PWSENHA", ' +
    //     ' "DSFUNCAO", ' +
    //     ' "VALORSALARIO", ' +
    //     ' "PERC", ' + 
    //     ' "STATIVO", ' +
    //     ' "DSTIPO", ' +
    //     ' "VALORDISPONIVEL" ' +
    //   ' ) ' +
    // ' VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ';
    
    let query = `
        INSERT INTO "VAR_DB_NAME"."FUNCIONARIO"
        (
            "ID",
            "IDFUNCIONARIO",
            "IDEMPRESA",
            "NOFUNCIONARIO",
            "NUCPF",
            "PWSENHA",
            "DSFUNCAO",
            "VALORSALARIO",
            "PERC",
            "STATIVO",
            "DSTIPO",
            "VALORDISPONIVEL",
            "DATA_ADMISSAO"
           
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString());
    
    for (var i = 0; i < bodyJson.length; i++) {
        var registro = bodyJson[i];

        // Obter um novo valor de ID para cada registro
        var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("ID")), 0) + 1 FROM "VAR_DB_NAME"."FUNCIONARIO" WHERE 1 = ? ', 1);
        
        // let dataBase = new Date('2024-08-01');
        // let dataAdmissao = new Date(registro.DATA_ADMISSAO);
        // let diferencaDias = Math.floor((dataBase - dataAdmissao) / (1000 * 60 * 60 * 24))
  
        // if (diferencaDias > 730) {
        //   registro.PERC = 20;
        // } else if (diferencaDias > 365) {
        //     registro.PERC = 15;
        // } else if (diferencaDias > 90) {
        //     registro.PERC = 10;
        // } else {
        //     registro.PERC = 0;
        // }
  
    //     if (parseFloat(registro.PERC) > 20) {
    //       let login = registro.NOLOGIN;
    //       let password = registro.PWSENHA;

    //       if (!authenticateUser(login, password)) {
    //           return {
    //               msg: "Usuário não autenticado!"
    //           };
    //       }

    //       if (registro.IDFUNCIONARIO !== '30500') {
    //           return {
    //               msg: "Acesso não autorizado para modificar PERC maior que 20!"
    //           };
    //       }

    //       if (parseFloat(registro.PERC) > 50) {
    //           return {
    //               msg: "Valor desconto maior que permitido!",
    //               data: bodyJson
    //           };
    //       }
    //   }
  
  
        if(parseFloat(registro.PERC) > 50){
          return {
            msg : "Valor desconto maior que permitido!",
            
          }; 
        }

      pStmt.setInt(1, queryId);
      pStmt.setInt(2, queryId);
      setIntOrNull(pStmt,3, registro.IDEMPRESA);
      pStmt.setString(4, registro.NOFUNCIONARIO);
      pStmt.setString(5, registro.NUCPF);
      pStmt.setString(6, registro.PWSENHA);
      pStmt.setString(7, registro.DSFUNCAO);
      pStmt.setFloat(8, registro.VALORSALARIO);
      pStmt.setFloat(9, registro.PERC); 
      pStmt.setString(10, registro.STATIVO);
      pStmt.setString(11, registro.DSTIPO);
      pStmt.setFloat(12, registro.VALORDISPONIVEL);
      pStmt.setDate(13, registro.DATA_ADMISSAO);
        pStmt.execute();
    }

    pStmt.close();
    conn.commit();

    return {
        "msg": "Inclusão realizada com sucesso!",
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


