var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdv.IDDETALHEVENDA,' +
    '   tbdv.IDRESUMOVENDALOCAL,' +
    '   tbdv.IDPRODUTO,' +
    '   tbdv.QTD,' +
    '   tbdv.VRCUSTO,' +
    '   tbdv.VRUNIT,' +
    '   tbdv.VRTOTALBRUTO,' +
    '   tbdv.VRDESCONTO,' +
    '   tbdv.VRTOTALLIQUIDO,' +
    '   tbdv.PERCMACKUP,' +
    '   tbdv.STATIVO,' +
    '   tbdv.STCANCELADO,' +
    '   tbdv.IDVENDEDOR,' +
    '   tbdv.STVENDIGITAL' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEVENDA tbdv' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdv.IDDETALHEVENDA = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEVENDA" SET ' + 
        ' "IDRESUMOVENDALOCAL" = ?, ' + 
        ' "IDPRODUTO" = ?, ' + 
        ' "QTD" = ?, ' + 
        ' "VRCUSTO" = ?, ' + 
        ' "VRUNIT" = ?, ' + 
        ' "VRTOTALBRUTO" = ?, ' + 
        ' "VRDESCONTO" = ?, ' + 
        ' "VRTOTALLIQUIDO" = ?, ' + 
        ' "PERCMACKUP" = ?, ' + 
        ' "STATIVO" = ?, ' + 
        ' "STCANCELADO" = ?, ' + 
        ' "IDVENDEDOR" = ?, ' + 
        ' "STVENDIGITAL" = ? ' +
    	' WHERE "IDDETALHEVENDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDRESUMOVENDALOCAL);
        pStmt.setString(2, registro.IDPRODUTO);
        pStmt.setFloat(3, registro.QTD);
        pStmt.setFloat(4, registro.VRCUSTO);
        pStmt.setFloat(5, registro.VRUNIT);
        pStmt.setFloat(6, registro.VRTOTALBRUTO);
        pStmt.setFloat(7, registro.VRDESCONTO);
        pStmt.setFloat(8, registro.VRTOTALLIQUIDO);
        pStmt.setFloat(9, registro.PERCMACKUP);
        pStmt.setString(10, registro.STATIVO);
        pStmt.setString(11, registro.STCANCELADO);
        pStmt.setInt(12, registro.IDVENDEDOR);
        pStmt.setString(13, registro.STVENDIGITAL);
        pStmt.setInt(14, registro.IDDETALHEVENDA);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEVENDA" ' +
		" ( " +
		' "IDDETALHEVENDA", ' +
        ' "IDRESUMOVENDALOCAL", ' +
        ' "IDPRODUTO", ' +
        ' "QTD", ' +
        ' "VRCUSTO", ' +
        ' "VRUNIT", ' +
        ' "VRTOTALBRUTO", ' +
        ' "VRDESCONTO", ' +
        ' "VRTOTALLIQUIDO", ' +
        ' "PERCMACKUP", ' +
        ' "STATIVO", ' +
        ' "STCANCELADO", ' +
        ' "IDVENDEDOR", ' +
        ' "STVENDIGITAL" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_DETALHEVENDA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
	    pStmt.setInt(1, registro.IDRESUMOVENDALOCAL);
        pStmt.setString(2, registro.IDPRODUTO);
        pStmt.setFloat(3, registro.QTD);
        pStmt.setFloat(4, registro.VRCUSTO);
        pStmt.setFloat(5, registro.VRUNIT);
        pStmt.setFloat(6, registro.VRTOTALBRUTO);
        pStmt.setFloat(7, registro.VRDESCONTO);
        pStmt.setFloat(8, registro.VRTOTALLIQUIDO);
        pStmt.setFloat(9, registro.PERCMACKUP);
        pStmt.setString(10, registro.STATIVO);
        pStmt.setString(11, registro.STCANCELADO);
        pStmt.setInt(12, registro.IDVENDEDOR);
        pStmt.setString(13, registro.STVENDIGITAL);
    	
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