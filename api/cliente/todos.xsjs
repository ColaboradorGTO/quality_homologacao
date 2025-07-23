var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function fnHandleGet(byId) {
    
    var numeroCpfCnpj = $.request.parameters.get("numeroCpfCnpj");
    
    var query = ' SELECT ' + 
    '	tbc.IDCLIENTE,' +
    '	tbc.IDEMPRESA,' +
    '	tbc.DSNOMERAZAOSOCIAL,' +
    '	tbc.DSAPELIDONOMEFANTASIA,' +
    '	tbc.TPCLIENTE,' +
    '	tbc.NUCPFCNPJ,' +
    '	tbc.NURGINSCESTADUAL,' +
    '	tbc.NUINSCMUNICIPAL,' +
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
    '	tbc.IDINDICACAOIE,' +
    '   TO_VARCHAR(tbc.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO ' +
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
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CLIENTE" SET ' + 
        ' "IDEMPRESA" = ?, ' +
        ' "DSNOMERAZAOSOCIAL" = ?, ' +
        ' "DSAPELIDONOMEFANTASIA" = ?, ' +
        ' "TPCLIENTE" = ?, ' +
        ' "NUCPFCNPJ" = ?, ' +
        ' "NURGINSCESTADUAL" = ?, ' +
        ' "NUINSCMUNICIPAL" = ?, ' +
        ' "NUINSCRICAOSUFRAMA" = ?, ' +
        ' "TPINDICADORINSCESTADUAL" = ?, ' +
        ' "STOPTANTESIMPLES" = ?, ' +
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
        ' "STATIVO" = ?, ' +
        ' "DTULTALTERACAO" = now() ' +
    	' WHERE "IDCLIENTE" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setString(2, registro.DSNOMERAZAOSOCIAL);
        setStringOrNull(pStmt, 3, registro.DSAPELIDONOMEFANTASIA);
        pStmt.setString(4, registro.TPCLIENTE);
        pStmt.setString(5, registro.NUCPFCNPJ);
        pStmt.setString(6, registro.NURGINSCESTADUAL);
        pStmt.setString(7, registro.NUINSCMUNICIPAL);
        pStmt.setString(8, registro.NUINSCRICAOSUFRAMA);
        pStmt.setString(9, registro.TPINDICADORINSCESTADUAL);
        pStmt.setString(10, registro.STOPTANTESIMPLES);
        pStmt.setString(11, registro.NUCEP);
        pStmt.setInt(12, registro.NUIBGE);
        pStmt.setString(13, registro.EENDERECO);
        pStmt.setString(14, registro.NUENDERECO);
        pStmt.setString(15, registro.ECOMPLEMENTO);
        pStmt.setString(16, registro.EBAIRRO);
        pStmt.setString(17, registro.ECIDADE);
        pStmt.setString(18, registro.SGUF);
        pStmt.setString(19, registro.EEMAIL);
        pStmt.setString(20, registro.NUTELCOMERCIAL);
        pStmt.setString(21, registro.NUTELCELULAR);
        setStringOrNull(pStmt, 22, registro.DTNASCFUNDACAO);
        pStmt.setString(23, registro.DSOBSERVACAO);
        pStmt.setString(24, registro.NOCONTATOCLIENTE01);
        pStmt.setString(25, registro.EEMAILCONTATOCLIENTE01);
        pStmt.setString(26, registro.FONECONTATOCLIENTE01);
        pStmt.setString(27, registro.DSCARGOCONTATOCLIENTE01);
        pStmt.setString(28, registro.NOCONTATOCLIENTE02);
        pStmt.setString(29, registro.EEMAILCONTATOCLIENTE02);
        pStmt.setString(30, registro.FONECONTATOCLIENTE02);
        pStmt.setString(31, registro.DSCARGOCONTATOCLIENTE02);
        pStmt.setString(32, registro.STATIVO);
        //pStmt.setDate(33, registro.DTULTALTERACAO);
        pStmt.setInt(33, registro.IDCLIENTE);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CLIENTE" ' +
		" ( " +
		' "IDCLIENTE", '+
		' "IDEMPRESA", ' +
        ' "DSNOMERAZAOSOCIAL", ' +
        ' "DSAPELIDONOMEFANTASIA", ' +
        ' "TPCLIENTE", ' +
        ' "NUCPFCNPJ", ' +
        ' "NURGINSCESTADUAL", ' +
        ' "NUINSCMUNICIPAL", ' +
        ' "NUINSCRICAOSUFRAMA", ' +
        ' "TPINDICADORINSCESTADUAL", ' +
        ' "STOPTANTESIMPLES", ' +
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
        ' "DTULTALTERACAO", ' +
        ' "DTCADASTRO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC.SEQ_CLIENTE.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, now(), now()) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setString(2, registro.DSNOMERAZAOSOCIAL);
        setStringOrNull(pStmt, 3, registro.DSAPELIDONOMEFANTASIA);
        pStmt.setString(4, registro.TPCLIENTE);
        pStmt.setString(5, registro.NUCPFCNPJ);
        pStmt.setString(6, registro.NURGINSCESTADUAL);
        pStmt.setString(7, registro.NUINSCMUNICIPAL);
        pStmt.setString(8, registro.NUINSCRICAOSUFRAMA);
        pStmt.setString(9, registro.TPINDICADORINSCESTADUAL);
        pStmt.setString(10, registro.STOPTANTESIMPLES);
        pStmt.setString(11, registro.NUCEP);
        pStmt.setInt(12, registro.NUIBGE);
        pStmt.setString(13, registro.EENDERECO);
        pStmt.setString(14, registro.NUENDERECO);
        pStmt.setString(15, registro.ECOMPLEMENTO);
        pStmt.setString(16, registro.EBAIRRO);
        pStmt.setString(17, registro.ECIDADE);
        pStmt.setString(18, registro.SGUF);
        pStmt.setString(19, registro.EEMAIL);
        pStmt.setString(20, registro.NUTELCOMERCIAL);
        pStmt.setString(21, registro.NUTELCELULAR);
        setStringOrNull(pStmt, 22, registro.DTNASCFUNDACAO);
        pStmt.setString(23, registro.DSOBSERVACAO);
        pStmt.setString(24, registro.NOCONTATOCLIENTE01);
        pStmt.setString(25, registro.EEMAILCONTATOCLIENTE01);
        pStmt.setString(26, registro.FONECONTATOCLIENTE01);
        pStmt.setString(27, registro.DSCARGOCONTATOCLIENTE01);
        pStmt.setString(28, registro.NOCONTATOCLIENTE02);
        pStmt.setString(29, registro.EEMAILCONTATOCLIENTE02);
        pStmt.setString(30, registro.FONECONTATOCLIENTE02);
        pStmt.setString(31, registro.DSCARGOCONTATOCLIENTE02);
        pStmt.setString(32, registro.STATIVO);
        //pStmt.setDate(33, registro.DTULTALTERACAO);
    	
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