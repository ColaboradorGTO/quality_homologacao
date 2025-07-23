var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
     var nrcpf = $.request.parameters.get("nrcpf");
     var nrTelefone = $.request.parameters.get("nrTelefone");
     
    var query = ' SELECT ' + 
    '	tbcc.ID,' +
    '	tbcc.IDCAMPANHA,' +
    '	tbcc.NUCPFCNPJ,' +
    '	tbcc.NOME,' +
    '	tbcc.EENDERECO, ' +
    '	tbcc.NUENDERECO, ' +
    '	tbcc.ECOMPLEMENTO,' +
    '	tbcc.EBAIRRO,' +
    '	tbcc.ECIDADE,' +
    '	tbcc.SGUF,' +
    '	tbcc.NUCEP,' +
    '	tbcc.EEMAIL,' +
    '	tbcc.NUTELEFONE,' +
    '   tbc.DSCAMPANHA' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CAMPANHA_CLIENTE tbcc' +
    '   LEFT JOIN "VAR_DB_NAME".CAMPANHA tbc ON tbc.IDCAMPANHA = tbcc.IDCAMPANHA' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbcc.ID = \'' + byId + '\' ';
    }
    
    if(nrcpf || nrTelefone){
        query = query + ' And  (tbcc.NUCPFCNPJ = \'' + nrcpf + '\'  OR  tbcc.NUTELEFONE = \'' + nrTelefone + '\')';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CAMPANHA_CLIENTE" SET ' + 
        ' "IDCAMPANHA" = ?, ' +
        ' "NUCPFCNPJ" = ?, ' +
        ' "EENDERECO" = ?, ' +
        ' "NUENDERECO" = ?, ' +
        ' "ECOMPLEMENTO" = ?, ' +
        ' "EBAIRRO" = ?, ' +
        ' "ECIDADE" = ?, ' +
        ' "SGUF" = ?, ' +
        ' "NUCEP" = ?, ' +
        ' "EEMAIL" = ?, ' +
        ' "NUTELEFONE" = ?, ' +
        ' "NOME" = ? ' +
        ' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDCAMPANHA);
        pStmt.setString(2, registro.NUCPFCNPJ);
        pStmt.setString(3, registro.EENDERECO);
        pStmt.setString(4, registro.NUENDERECO);
        pStmt.setString(5, registro.ECOMPLEMENTO);
        pStmt.setString(6, registro.EBAIRRO);
        pStmt.setString(7, registro.ECIDADE);
        pStmt.setString(8, registro.SGUF);
        pStmt.setString(9, registro.NUCEP);
        pStmt.setString(10, registro.EEMAIL);
        pStmt.setString(11, registro.NUTELEFONE);
        pStmt.setString(12, registro.NOME);
        pStmt.setInt(13, registro.ID);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CAMPANHA_CLIENTE" ' +
		" ( " +
		' "ID", '+
		' "IDCAMPANHA", ' +
        ' "NUCPFCNPJ", ' +
        ' "NOME", '+
        ' "EENDERECO", ' +
        ' "NUENDERECO", ' +
        ' "ECOMPLEMENTO", ' +
        ' "EBAIRRO", ' +
        ' "ECIDADE", ' +
        ' "SGUF", ' +
        ' "NUCEP", ' +
        ' "EEMAIL", ' +
        ' "NUTELEFONE" ' +
        ' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_CAMPANHA_CLIENTE.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDCAMPANHA);
        pStmt.setString(2, registro.NUCPFCNPJ);
        pStmt.setString(3, registro.NOME);
        pStmt.setString(4, registro.EENDERECO);
        pStmt.setString(5, registro.NUENDERECO);
        pStmt.setString(6, registro.ECOMPLEMENTO);
        pStmt.setString(7, registro.EBAIRRO);
        pStmt.setString(8, registro.ECIDADE);
        pStmt.setString(9, registro.SGUF);
        pStmt.setString(10, registro.NUCEP);
        pStmt.setString(11, registro.EEMAIL);
        pStmt.setString(12, registro.NUTELEFONE);
       
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