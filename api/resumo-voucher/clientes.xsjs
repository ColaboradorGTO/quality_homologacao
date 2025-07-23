var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {
    
    let numeroCpfCnpj = $.request.parameters.get("numeroCpfCnpj");
    
    let query = ' SELECT ' + 
    '	tbc.IDCLIENTE,' +
    '	tbc.IDEMPRESA,' +
    '	tbc.DSNOMERAZAOSOCIAL,' +
    '	tbc.DSAPELIDONOMEFANTASIA,' +
    '	tbc.TPCLIENTE,' +
    '	tbc.NUCPFCNPJ,' +
    '	tbc.NURGINSCESTADUAL,' +
    '	tbc.NUINSCMUNICIPAL,' +
    '	tbc.NUCNAE,' +
    '	tbc.NUINSCRICAOSUFRAMA,' +
    '	tbc.TPINDICADORINSCESTADUAL,' +
    '	tbc.STOPTANTESIMPLES,' +
    '	tbc.NUCEP,' +
    '	tbc.NUIBGE,' +
    '	tbc.EENDERECO,' +
    '	tbc.NUENDERECO,' +
    '	tbc.ECOMPLEMENTO,' +
    '	tbc.EBAIRRO,' +
    '	tbc.ECIDADE,' +
    '	tbc.SGUF,' +
    '	tbc.EEMAIL,' +
    '	tbc.NUTELCOMERCIAL,' +
    '	tbc.NUTELCELULAR,' +
    '	tbc.DTNASCFUNDACAO,' +
    '	tbc.DSOBSERVACAO,' +
    '	tbc.NOCONTATOCLIENTE01,' +
    '	tbc.EEMAILCONTATOCLIENTE01,' +
    '	tbc.FONECONTATOCLIENTE01,' +
    '	tbc.DSCARGOCONTATOCLIENTE01,' +
    '	tbc.NOCONTATOCLIENTE02,' +
    '	tbc.EEMAILCONTATOCLIENTE02,' +
    '	tbc.FONECONTATOCLIENTE02,' +
    '	tbc.DSCARGOCONTATOCLIENTE02,' +
    '	tbc.STATIVO,' +
    '   TO_VARCHAR(tbc.DTULTALTERACAO,\'YYYY-MM-DD\') AS DTULTALTERACAO, ' +
    '   TO_VARCHAR(tbc.DTCADASTRO,\'YYYY-MM-DD\') AS DTCADASTRO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CLIENTE tbc' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbc.IDCLIENTE = \'' + byId + '\' ';
    }
    
    if(numeroCpfCnpj){
        query = query + ' And  tbc.NUCPFCNPJ = \'' + numeroCpfCnpj + '\' ';
    }
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CLIENTE" SET ' + 
        ' "DSNOMERAZAOSOCIAL" = ?, ' +
        ' "DSAPELIDONOMEFANTASIA" = ?, ' +
        ' "TPCLIENTE" = ?, ' +
        ' "NUCPFCNPJ" = ?, ' +
        ' "NURGINSCESTADUAL" = ?, ' +
        ' "NUINSCMUNICIPAL" = ?, ' +
        ' "NUCEP" = ?, ' +
        ' "NUIBGE" = ?, ' +
        ' "EENDERECO" = ?, ' +
        ' "NUENDERECO" = ?, ' +
        ' "ECOMPLEMENTO" = ?, ' +
        ' "EBAIRRO" = ?, ' +
        ' "ECIDADE" = ?, ' +
        ' "SGUF" = ?, ' +
        ' "EEMAIL" = ?, ' +
        ' "NUTELCOMERCIAL" = ?, ' +
        ' "NUTELCELULAR" = ?, ' +
        ' "DTNASCFUNDACAO" = ?, ' +
        ' "DSOBSERVACAO" = ?, ' +
        ' "NOCONTATOCLIENTE01" = ?, ' +
        ' "EEMAILCONTATOCLIENTE01" = ?, ' +
        ' "FONECONTATOCLIENTE01" = ?, ' +
        ' "DSCARGOCONTATOCLIENTE01" = ?, ' +
        ' "NOCONTATOCLIENTE02" = ?, ' +
        ' "EEMAILCONTATOCLIENTE02" = ?, ' +
        ' "FONECONTATOCLIENTE02" = ?, ' +
        ' "DSCARGOCONTATOCLIENTE02" = ?, ' +
        ' "NUCNAE" = ?, ' +
        ' "IDFUNCIONARIOULTALTERACAO" = ?, ' +
        ' "DTULTALTERACAO" = now() ' +
    	' WHERE "IDCLIENTE" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSNOMERAZAOSOCIAL);
        setStringOrNull(pStmt,2, registro.DSAPELIDONOMEFANTASIA);
        pStmt.setString(3, registro.TPCLIENTE);
        pStmt.setString(4, registro.NUCPFCNPJ);
        setStringOrNull(pStmt, 5, registro.NURGINSCESTADUAL);
        setStringOrNull(pStmt, 6, registro.NUINSCMUNICIPAL);
        pStmt.setString(7, registro.NUCEP);
        pStmt.setInt(8, registro.NUIBGE);
        pStmt.setString(9, registro.EENDERECO);
        pStmt.setString(10, registro.NUENDERECO);
        setStringOrNull(pStmt, 11, registro.ECOMPLEMENTO);
        pStmt.setString(12, registro.EBAIRRO);
        pStmt.setString(13, registro.ECIDADE);
        pStmt.setString(14, registro.SGUF);
        setStringOrNull(pStmt, 15, registro.EEMAIL);
        setStringOrNull(pStmt, 16, registro.NUTELCOMERCIAL);
        setStringOrNull(pStmt, 17, registro.NUTELCELULAR);
        setStringOrNull(pStmt, 18, registro.DTNASCFUNDACAO);
        pStmt.setString(19, registro.DSOBSERVACAO);
        pStmt.setString(20, registro.NOCONTATOCLIENTE01);
        pStmt.setString(21, registro.EEMAILCONTATOCLIENTE01);
        pStmt.setString(22, registro.FONECONTATOCLIENTE01);
        pStmt.setString(23, registro.DSCARGOCONTATOCLIENTE01);
        pStmt.setString(24, registro.NOCONTATOCLIENTE02);
        pStmt.setString(25, registro.EEMAILCONTATOCLIENTE02);
        pStmt.setString(26, registro.FONECONTATOCLIENTE02);
        pStmt.setString(27, registro.DSCARGOCONTATOCLIENTE02);
        setStringOrNull(pStmt, 28, registro.NUCNAE);
        pStmt.setInt(29, registro.IDFUNCIONARIOULTALTERACAO);
        pStmt.setInt(30, registro.IDCLIENTE);
       
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    let conn = $.db.getConnection();
    
    let query = 'INSERT INTO "VAR_DB_NAME"."CLIENTE" ' +
		" ( " +
		' "IDCLIENTE", '+
		' "IDEMPRESA", ' +
        ' "DSNOMERAZAOSOCIAL", ' +
        ' "DSAPELIDONOMEFANTASIA", ' +
        ' "TPCLIENTE", ' +
        ' "NUCPFCNPJ", ' +
        ' "NURGINSCESTADUAL", ' +
        ' "NUINSCMUNICIPAL", ' +
        ' "NUCEP", ' +
        ' "NUIBGE", ' +
        ' "EENDERECO", ' +
        ' "NUENDERECO", ' +
        ' "ECOMPLEMENTO", ' +
        ' "EBAIRRO", ' +
        ' "ECIDADE", ' +
        ' "SGUF", ' +
        ' "EEMAIL", ' +
        ' "NUTELCOMERCIAL", ' +
        ' "NUTELCELULAR", ' +
        ' "DTNASCFUNDACAO", ' +
        ' "DSOBSERVACAO", ' +
        ' "NOCONTATOCLIENTE01", ' +
        ' "EEMAILCONTATOCLIENTE01", ' +
        ' "FONECONTATOCLIENTE01", ' +
        ' "DSCARGOCONTATOCLIENTE01", ' +
        ' "NOCONTATOCLIENTE02", ' +
        ' "EEMAILCONTATOCLIENTE02", ' +
        ' "FONECONTATOCLIENTE02", ' +
        ' "DSCARGOCONTATOCLIENTE02", ' +
        ' "STATIVO", ' +
        ' "NUCNAE", ' +
        ' "IDFUNCIONARIOULTALTERACAO", ' +
        ' "DTCADASTRO", ' +
        ' "DTULTALTERACAO" ' +
    	' ) ' +
		' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'True\', ?, ?, now(), now()) ';
		
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	let bodyJson = JSON.parse($.request.body.asString());

	for (let i = 0; i < bodyJson.length; i++) {
        
        let queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDCLIENTE")), 0) + 1 FROM "VAR_DB_NAME"."CLIENTE" WHERE 1 = ? ', 1);
		let registro = bodyJson[i];
		
		pStmt.setInt(1, parseInt(queryId));
		pStmt.setInt(2, registro.IDEMPRESA);
        pStmt.setString(3, registro.DSNOMERAZAOSOCIAL);
        setStringOrNull(pStmt,4, registro.DSAPELIDONOMEFANTASIA);
        pStmt.setString(5, registro.TPCLIENTE);
        pStmt.setString(6, registro.NUCPFCNPJ);
        setStringOrNull(pStmt, 7, registro.NURGINSCESTADUAL);
        setStringOrNull(pStmt, 8, registro.NUINSCMUNICIPAL);
        pStmt.setString(9, registro.NUCEP);
        pStmt.setInt(10, registro.NUIBGE);
        pStmt.setString(11, registro.EENDERECO);
        pStmt.setString(12, registro.NUENDERECO);
        setStringOrNull(pStmt, 13, registro.ECOMPLEMENTO);
        pStmt.setString(14, registro.EBAIRRO);
        pStmt.setString(15, registro.ECIDADE);
        pStmt.setString(16, registro.SGUF);
        setStringOrNull(pStmt, 17, registro.EEMAIL);
        setStringOrNull(pStmt, 18, registro.NUTELCOMERCIAL);
        setStringOrNull(pStmt, 19, registro.NUTELCELULAR);
        setDateOrNull(pStmt, 20, registro.DTNASCFUNDACAO);
        pStmt.setString(21, registro.DSOBSERVACAO);
        pStmt.setString(22, registro.NOCONTATOCLIENTE01);
        pStmt.setString(23, registro.EEMAILCONTATOCLIENTE01);
        pStmt.setString(24, registro.FONECONTATOCLIENTE01);
        pStmt.setString(25, registro.DSCARGOCONTATOCLIENTE01);
        pStmt.setString(26, registro.NOCONTATOCLIENTE02);
        pStmt.setString(27, registro.EEMAILCONTATOCLIENTE02);
        pStmt.setString(28, registro.FONECONTATOCLIENTE02);
        pStmt.setString(29, registro.DSCARGOCONTATOCLIENTE02);
        setStringOrNull(pStmt, 30, registro.NUCNAE);
        pStmt.setInt(31, registro.IDFUNCIONARIOULTALTERACAO);
        
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