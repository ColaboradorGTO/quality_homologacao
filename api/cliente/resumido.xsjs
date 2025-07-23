var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var numeroCpfCnpj = $.request.parameters.get("numeroCpfCnpj");
    
    var query = ' SELECT ' + 
    '	tbc.IDCLIENTE,' +
    '	tbc.IDEMPRESA,' +
    '	tbc.DSNOMERAZAOSOCIAL,' +
    '	tbc.NURGINSCESTADUAL,' +
    '	tbc.TPCLIENTE,' +
    '	tbc.NUCPFCNPJ,' +
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
    '	tbc.NUTELCELULAR,' +
    '	tbc.STATIVO,' +
    '	tbc.DTULTALTERACAO,' +
    '	tbc.DTNASCFUNDACAO' +
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
        ' "TPCLIENTE" = ?, ' +
        ' "NUCPFCNPJ" = ?, ' +
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
        ' "NUTELCELULAR" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "DTULTALTERACAO" = ?, ' +
        ' "DTNASCFUNDACAO" = ?, '+
        ' "NURGINSCESTADUAL" = ? '+
    	' WHERE "IDCLIENTE" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setString(2, registro.DSNOMERAZAOSOCIAL);
        pStmt.setString(3, registro.TPCLIENTE);
        pStmt.setString(4, registro.NUCPFCNPJ);
        pStmt.setString(5, registro.STOPTANTESIMPLES);
        pStmt.setString(6, registro.NUCEP);
        pStmt.setInt(7, registro.NUIBGE);
        pStmt.setString(8, registro.EENDERECO);
        pStmt.setString(9, registro.NUENDERECO);
        pStmt.setString(10, registro.ECOMPLEMENTO);
        pStmt.setString(11, registro.EBAIRRO);
        pStmt.setString(12, registro.ECIDADE);
        pStmt.setString(13, registro.SGUF);
        pStmt.setString(14, registro.EEMAIL);
        pStmt.setString(15, registro.NUTELCELULAR);
        pStmt.setString(16, registro.STATIVO);
        pStmt.setDate(17, registro.DTULTALTERACAO);
        pStmt.setString(18, registro.DTNASCFUNDACAO||'');
        pStmt.setString(19, registro.NURGINSCESTADUAL);
        pStmt.setInt(20, registro.IDCLIENTE);

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
		' "IDCLIENTE", ' +
		' "IDEMPRESA", ' +
        ' "DSNOMERAZAOSOCIAL", ' +
        ' "TPCLIENTE", ' +
        ' "NUCPFCNPJ", ' +
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
        ' "NUTELCELULAR", ' +
        ' "STATIVO", ' +
        ' "DTULTALTERACAO", ' +
        ' "DTNASCFUNDACAO", '+
        ' "NURGINSCESTADUAL" '+
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_CLIENTE.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setString(2, registro.DSNOMERAZAOSOCIAL);
        pStmt.setString(3, registro.TPCLIENTE);
        pStmt.setString(4, registro.NUCPFCNPJ);
        pStmt.setString(5, registro.STOPTANTESIMPLES);
        pStmt.setString(6, registro.NUCEP);
        pStmt.setInt(7, registro.NUIBGE);
        pStmt.setString(8, registro.EENDERECO);
        pStmt.setString(9, registro.NUENDERECO);
        pStmt.setString(10, registro.ECOMPLEMENTO);
        pStmt.setString(11, registro.EBAIRRO);
        pStmt.setString(12, registro.ECIDADE);
        pStmt.setString(13, registro.SGUF);
        pStmt.setString(14, registro.EEMAIL);
        pStmt.setString(15, registro.NUTELCELULAR);
        pStmt.setString(16, registro.STATIVO);
        pStmt.setDate(17, registro.DTULTALTERACAO);
        pStmt.setString(18, registro.DTNASCFUNDACAO||'');
        pStmt.setString(19, registro.NURGINSCESTADUAL);
    	
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