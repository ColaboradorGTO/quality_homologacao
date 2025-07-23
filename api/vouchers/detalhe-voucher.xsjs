var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdv.IDVOUCHER,' +
    '   tbdv.IDDETALHEVOUCHER,' +
    '   tbdv.IDPRODUTO,' +
    '   tbdv.QTD,' +
    '   tbdv.VRUNIT,' +
    '   tbdv.VRTOTALBRUTO,' +
    '   tbdv.VRDESCONTO,' +
    '   tbdv.VRTOTALLIQUIDO,' +
    '   tbdv.STATIVO,' +
    '   tbdv.STCANCELADO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEVOUCHER tbdv' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdv.IDDETALHEVOUCHER = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEVOUCHER" SET ' + 
        ' "IDVOUCHER" = ?, ' +
        ' "IDPRODUTO" = ?, ' +
        ' "QTD" = ?, ' +
        ' "VRUNIT" = ?, ' +
        ' "VRTOTALBRUTO" = ?, ' +
        ' "VRDESCONTO" = ?, ' +
        ' "VRTOTALLIQUIDO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "STCANCELADO" = ? ' +
    	' WHERE "IDDETALHEVOUCHER" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDVOUCHER);
        pStmt.setInt(2, registro.IDPRODUTO);
        pStmt.setFloat(3, registro.QTD);
        pStmt.setFloat(4, registro.VRUNIT);
        pStmt.setFloat(5, registro.VRTOTALBRUTO);
        pStmt.setFloat(6, registro.VRDESCONTO);
        pStmt.setFloat(7, registro.VRTOTALLIQUIDO);
        pStmt.setString(8, registro.STATIVO);
        pStmt.setString(9, registro.STCANCELADO);
    	pStmt.setInt(10, registro.IDDETALHEVOUCHER);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEVOUCHER" ' +
		" ( " +
		' "IDVOUCHER", ' +
        ' "IDPRODUTO", ' +
        ' "QTD", ' +
        ' "VRUNIT", ' +
        ' "VRTOTALBRUTO" ' +
        ' "VRDESCONTO", ' +
        ' "VRTOTALLIQUIDO", ' +
        ' "STATIVO", ' +
        ' "STCANCELADO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_DETALHEVOUCHER.NEXTVAL,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDVOUCHER);
        pStmt.setInt(2, registro.IDPRODUTO);
        pStmt.setFloat(3, registro.QTD);
        pStmt.setFloat(4, registro.VRUNIT);
        pStmt.setFloat(5, registro.VRTOTALBRUTO);
        pStmt.setFloat(6, registro.VRDESCONTO);
        pStmt.setFloat(7, registro.VRTOTALLIQUIDO);
        pStmt.setString(8, registro.STATIVO);
        pStmt.setString(9, registro.STCANCELADO);
    	
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