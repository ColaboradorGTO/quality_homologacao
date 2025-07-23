var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdv.IDDETALHEDEVOLUCAO,' +
    '   tbdv.IDVOUCHER,' +
    '   tbdv.IDDETALHEDEVOLUCAOLOCAL,' +
    '   tbdv.IDPRODUTO,' +
    '   tbdv.QTD,' +
    '   tbdv.VRUNIT,' +
    '   tbdv.VRTOTALBRUTO,' +
    '   tbdv.VRDESCONTO,' +
    '   tbdv.VRTOTALLIQUIDO,' +
    '   tbdv.STATIVO,' +
    '   tbdv.STCANCELADO,' +
    '   tbdv.DTPROCESSAMENTO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEVOUCHER tbdv' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdv.IDDETALHEDEVOLUCAO = \'' + byId + '\' ';
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
        ' "IDDETALHEDEVOLUCAOLOCAL" = ?, ' +
        ' "IDPRODUTO" = ?, ' +
        ' "QTD" = ?, ' +
        ' "VRUNIT" = ?, ' +
        ' "VRTOTALBRUTO" = ?, ' +
        ' "VRDESCONTO" = ?, ' +
        ' "VRTOTALLIQUIDO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "STCANCELADO" = ?, ' +
        ' "DTPROCESSAMENTO" = ? ' +
    	' WHERE "IDDETALHEDEVOLUCAO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDVOUCHER);
        pStmt.setInt(2, registro.IDDETALHEDEVOLUCAOLOCAL);
        pStmt.setInt(3, registro.IDPRODUTO);
        pStmt.setFloat(4, registro.QTD);
        pStmt.setFloat(5, registro.VRUNIT);
        pStmt.setFloat(6, registro.VRTOTALBRUTO);
        pStmt.setFloat(7, registro.VRDESCONTO);
        pStmt.setFloat(8, registro.VRTOTALLIQUIDO);
        pStmt.setString(9, registro.STATIVO);
        pStmt.setString(10, registro.STCANCELADO);
        pStmt.setDate(11, registro.DTPROCESSAMENTO);
    	pStmt.setInt(12, registro.IDDETALHEDEVOLUCAO);
                    
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
		' "IDDETALHEDEVOLUCAO", ' +
        ' "IDVOUCHER", ' +
        ' "IDDETALHEDEVOLUCAOLOCAL", ' +
        ' "IDPRODUTO", ' +
        ' "QTD", ' +
        ' "VRUNIT", ' +
        ' "VRTOTALBRUTO", ' +
        ' "VRDESCONTO", ' +
        ' "VRTOTALLIQUIDO", ' +
        ' "STATIVO", ' +
        ' "STCANCELADO", ' +
        ' "DTPROCESSAMENTO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_DETALHEVOUCHER.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDVOUCHER);
        pStmt.setInt(2, registro.IDDETALHEDEVOLUCAOLOCAL);
        pStmt.setInt(3, registro.IDPRODUTO);
        pStmt.setFloat(4, registro.QTD);
        pStmt.setFloat(5, registro.VRUNIT);
        pStmt.setFloat(6, registro.VRTOTALBRUTO);
        pStmt.setFloat(7, registro.VRDESCONTO);
        pStmt.setFloat(8, registro.VRTOTALLIQUIDO);
        pStmt.setString(9, registro.STATIVO);
        pStmt.setString(10, registro.STCANCELADO);
        pStmt.setDate(11, registro.DTPROCESSAMENTO);
    	
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