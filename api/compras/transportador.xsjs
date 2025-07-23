var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idTransportador = $.request.parameters.get("idTransportador");
    var descTransportador = $.request.parameters.get("descTransportador");
    var CNPJTransportador = $.request.parameters.get("CNPJTransportador");
    
    var query = ' SELECT ' + 
    '   tbt.IDTRANSPORTADORA,' +
    '   tbt.IDGRUPOEMPRESARIAL,' +
    '   tbt.IDSUBGRUPOEMPRESARIAL,' +
    '   tbt.NORAZAOSOCIAL,' +
    '   tbt.NOFANTASIA,' +
    '   tbt.NUCNPJ,' +
    '   tbt.NUINSCESTADUAL,' +
    '   tbt.NUINSCMUNICIPAL,' +
    '   tbt.NUIBGE,' +
    '   tbt.EENDERECO,' +
    '   tbt.ENUMERO,' +
    '   tbt.ECOMPLEMENTO,' +
    '   tbt.EBAIRRO,' +
    '   tbt.ECIDADE,' +
    '   tbt.SGUF,' +
    '   tbt.NUCEP,' +
    '   tbt.EEMAIL,' +
    '   tbt.NUTELEFONE1,' +
    '   tbt.NUTELEFONE2,' +
    '   tbt.NUTELEFONE3,' +
    '   tbt.NOREPRESENTANTE,' +
    '   tbt.DTCADASTRO,' +
    '   tbt.DTULTATUALIZACAO,' +
    '   tbt.STATIVO,' +
    '   TO_VARCHAR(tbt.DTCADASTRO,\'YYYY-MM-DD HH24:MI:SS\') AS DTCADASTROFORMAT ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".TRANSPORTADORA tbt' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbt.IDTRANSPORTADORA = \'' + byId + '\' ';
    }

    if ( idTransportador ) {
        query = query + ' And  tbt.IDTRANSPORTADORA = \'' + idTransportador + '\' ';
    }

    if ( descTransportador ) {
        query = query + ' And  (tbt.NORAZAOSOCIAL LIKE \'%'+descTransportador+'%\' OR tbt.NOFANTASIA LIKE \'%'+descTransportador+'%\' ) ';
    }

    if ( CNPJTransportador ) {
        query = query + ' And  tbt.NUCNPJ = \'' + CNPJTransportador + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."TRANSPORTADORA" SET ' + 
        ' "IDGRUPOEMPRESARIAL" = ?, ' + 
        ' "IDSUBGRUPOEMPRESARIAL" = ?, ' + 
        ' "NORAZAOSOCIAL" = ?, ' + 
        ' "NOFANTASIA" = ?, ' + 
        ' "NUCNPJ" = ?, ' + 
        ' "NUINSCESTADUAL" = ?, ' + 
        ' "NUINSCMUNICIPAL" = ?, ' + 
        ' "NUIBGE" = ?, ' + 
        ' "EENDERECO" = ?, ' + 
        ' "ENUMERO" = ?, ' + 
        ' "ECOMPLEMENTO" = ?, ' + 
        ' "EBAIRRO" = ?, ' + 
        ' "ECIDADE" = ?, ' + 
        ' "SGUF" = ?, ' + 
        ' "NUCEP" = ?, ' + 
        ' "EEMAIL" = ?, ' + 
        ' "NUTELEFONE1" = ?, ' + 
        ' "NUTELEFONE2" = ?, ' + 
        ' "NUTELEFONE3" = ?, ' + 
        ' "NOREPRESENTANTE" = ?, ' + 
        ' "DTCADASTRO" = ?, ' + 
        ' "DTULTATUALIZACAO" = ?, ' + 
        ' "STATIVO" = ? ' + 
    	' WHERE "IDTRANSPORTADORA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(3, registro.NORAZAOSOCIAL);
        pStmt.setString(4, registro.NOFANTASIA);
        pStmt.setString(5, registro.NUCNPJ);
        pStmt.setString(6, registro.NUINSCESTADUAL);
        pStmt.setString(7, registro.NUINSCMUNICIPAL);
        pStmt.setString(8, registro.NUIBGE);
        pStmt.setString(9, registro.EENDERECO);
        pStmt.setString(10, registro.ENUMERO);
        pStmt.setString(11, registro.ECOMPLEMENTO);
        pStmt.setString(12, registro.EBAIRRO);
        pStmt.setString(13, registro.ECIDADE);
        pStmt.setString(14, registro.SGUF);
        pStmt.setString(15, registro.NUCEP);
        pStmt.setString(16, registro.EEMAIL);
        pStmt.setString(17, registro.NUTELEFONE1);
        pStmt.setString(18, registro.NUTELEFONE2);
        pStmt.setString(19, registro.NUTELEFONE3);
        pStmt.setString(20, registro.NOREPRESENTANTE);
        pStmt.setDate(21, registro.DTCADASTRO);
        pStmt.setDate(22, registro.DTULTATUALIZACAO);
        pStmt.setString(23, registro.STATIVO);
        pStmt.setInt(24, registro.IDTRANSPORTADORA);
                    
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
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDTRANSPORTADORA")),0) + 1 FROM "VAR_DB_NAME"."TRANSPORTADORA" WHERE 1 = ? ';
    var query = 'INSERT INTO "VAR_DB_NAME"."TRANSPORTADORA" ' +
		" ( " +
            ' "IDTRANSPORTADORA", ' +
            ' "IDGRUPOEMPRESARIAL", ' +
            ' "IDSUBGRUPOEMPRESARIAL", ' +
            ' "NORAZAOSOCIAL", ' +
            ' "NOFANTASIA", ' +
            ' "NUCNPJ", ' +
            ' "NUINSCESTADUAL", ' +
            ' "NUINSCMUNICIPAL", ' +
            ' "NUIBGE", ' +
            ' "EENDERECO", ' +
            ' "ENUMERO", ' +
            ' "ECOMPLEMENTO", ' +
            ' "EBAIRRO", ' +
            ' "ECIDADE", ' +
            ' "SGUF", ' +
            ' "NUCEP", ' +
            ' "EEMAIL", ' +
            ' "NUTELEFONE1", ' +
            ' "NUTELEFONE2", ' +
            ' "NUTELEFONE3", ' +
            ' "NOREPRESENTANTE", ' +
            ' "DTCADASTRO", ' +
            ' "DTULTATUALIZACAO", ' +
            ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
        var IdTransp = api.executeScalar(queryId,1);

		pStmt.setInt(1, parseInt(IdTransp));
		pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(4, registro.NORAZAOSOCIAL);
        pStmt.setString(5, registro.NOFANTASIA);
        pStmt.setString(6, registro.NUCNPJ);
        pStmt.setString(7, registro.NUINSCESTADUAL);
        pStmt.setString(8, registro.NUINSCMUNICIPAL);
        pStmt.setString(9, registro.NUIBGE);
        pStmt.setString(10, registro.EENDERECO);
        pStmt.setString(11, registro.ENUMERO);
        pStmt.setString(12, registro.ECOMPLEMENTO);
        pStmt.setString(13, registro.EBAIRRO);
        pStmt.setString(14, registro.ECIDADE);
        pStmt.setString(15, registro.SGUF);
        pStmt.setString(16, registro.NUCEP);
        pStmt.setString(17, registro.EEMAIL);
        pStmt.setString(18, registro.NUTELEFONE1);
        pStmt.setString(19, registro.NUTELEFONE2);
        pStmt.setString(20, registro.NUTELEFONE3);
        pStmt.setString(21, registro.NOREPRESENTANTE);
        pStmt.setDate(22, registro.DTCADASTRO);
        pStmt.setDate(23, registro.DTULTATUALIZACAO);
        pStmt.setString(24, registro.STATIVO);
    	
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