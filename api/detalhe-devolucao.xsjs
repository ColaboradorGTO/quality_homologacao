var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdv.IDDETDEVWEB,' +
    '   tbdv.IDRESUMODEVOLUCAOWEB,' +
    '   tbdv.IDDETALHEDEVOLUCAO,' +
    '   tbdv.IDRESUMODEVOLUCAO,' +
    '   tbdv.IDPRODUTO,' +
    '   tbdv.QTD,' +
    '   tbdv.VRUNIT,' +
    '   tbdv.VRTOTALBRUTO,' +
    '   tbdv.VRDESCONTO,' +
    '   tbdv.VRTOTALLIQUIDO,' +
    '   tbdv.STATIVO,' +
    '   tbdv.STCANCELADO,' +
    '   tbdv.STMIGRADO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEDEVOLUCAO tbdv' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdv.IDDETDEVWEB = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEDEVOLUCAO" SET ' + 
        ' "IDRESUMODEVOLUCAOWEB" = ?, ' +
        ' "IDDETALHEDEVOLUCAO" = ?, ' +
        ' "IDRESUMODEVOLUCAO" = ?, ' +
        ' "IDPRODUTO" = ?, ' +
        ' "QTD" = ?, ' +
        ' "VRUNIT" = ?, ' +
        ' "VRTOTALBRUTO" = ?, ' +
        ' "VRDESCONTO" = ?, ' +
        ' "VRTOTALLIQUIDO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "STCANCELADO" = ?, ' +
        ' "STMIGRADO" = ? ' +
    	' WHERE "IDDETDEVWEB" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDRESUMODEVOLUCAOWEB);
        pStmt.setInt(2, registro.IDDETALHEDEVOLUCAO);
        pStmt.setInt(3, registro.IDRESUMODEVOLUCAO);
        pStmt.setInt(4, registro.IDPRODUTO);
        pStmt.setFloat(5, registro.QTD);
        pStmt.setFloat(6, registro.VRUNIT);
        pStmt.setFloat(7, registro.VRTOTALBRUTO);
        pStmt.setFloat(8, registro.VRDESCONTO);
        pStmt.setFloat(9, registro.VRTOTALLIQUIDO);
        pStmt.setString(10, registro.STATIVO);
        pStmt.setString(11, registro.STCANCELADO);
        pStmt.setString(12, registro.STMIGRADO);
    	pStmt.setInt(13, registro.IDDETDEVWEB);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEDEVOLUCAO" ' +
		" ( " +
		' "IDDETDEVWEB", ' +
        ' "IDRESUMODEVOLUCAOWEB", ' +
        ' "IDDETALHEDEVOLUCAO", ' +
        ' "IDRESUMODEVOLUCAO", ' +
        ' "IDPRODUTO", ' +
        ' "QTD", ' +
        ' "VRUNIT", ' +
        ' "VRTOTALBRUTO", ' +
        ' "VRDESCONTO", ' +
        ' "VRTOTALLIQUIDO", ' +
        ' "STATIVO", ' +
        ' "STCANCELADO", ' +
        ' "STMIGRADO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_BANCO.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDRESUMODEVOLUCAOWEB);
        pStmt.setInt(2, registro.IDDETALHEDEVOLUCAO);
        pStmt.setInt(3, registro.IDRESUMODEVOLUCAO);
        pStmt.setInt(4, registro.IDPRODUTO);
        pStmt.setFloat(5, registro.QTD);
        pStmt.setFloat(6, registro.VRUNIT);
        pStmt.setFloat(7, registro.VRTOTALBRUTO);
        pStmt.setFloat(8, registro.VRDESCONTO);
        pStmt.setFloat(9, registro.VRTOTALLIQUIDO);
        pStmt.setString(10, registro.STATIVO);
        pStmt.setString(11, registro.STCANCELADO);
        pStmt.setString(12, registro.STMIGRADO);
    	
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