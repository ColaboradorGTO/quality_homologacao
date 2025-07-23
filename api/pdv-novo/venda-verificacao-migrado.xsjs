var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function fnHandleGet(byId) {
    var query = ' SELECT count(1) as QTD, tbv.IDVENDA' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
	query = query + ' GROUP BY tbv.IDVENDA';
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var query2 = ' SELECT count(1) as QTD, tbvd.IDVENDA' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDADETALHE tbvd' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query2 = query2 + ' And  tbvd.IDVENDA = \'' + byId + '\' ';
	}
	
	query2 = query2 + ' GROUP BY tbvd.IDVENDA';
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var query3 = ' SELECT count(1) as QTD, tbvp.IDVENDA' +
		' FROM  ' +
		'   "VAR_DB_NAME".VENDAPAGAMENTO tbvp' +
		' WHERE ' +
		'	1 = ?';

	if (byId) {
		query3 = query3 + ' And  tbvp.IDVENDA = \'' + byId + '\' ';
	}
	
	query3 = query3 + ' GROUP BY tbvp.IDVENDA';
	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var response2 = api.sqlQueryPage(query2, request, 1);
	var response3 = api.sqlQueryPage(query3, request, 1);
	
	var data = [];
    var stExiste = "Nao";
    var stExisteDetalhe = "Nao";
    var stExistePagamento = "Nao";

        if(response.data.length > 0){
		    stExiste = "Sim";
        }
        if(response2.data.length > 0){
		    stExisteDetalhe = "Sim";
        }
        if(response3.data.length > 0){
		    stExistePagamento = "Sim";
        }
        
		var venda = {
				"STVENDA": stExiste,
				"STVENDADETALHE": stExisteDetalhe,
				"STVENDAPAGAMENTO": stExistePagamento
			
			};
			
			
            
	

		data.push(venda);

	

	response.data = data;

	return response;
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."VENDANAOMIGRADA" ' +
		" ( " +
    		' "IDEMPRESA", ' +
            ' "IDVENDA", ' +
            ' "STVENDA", ' +
            ' "STVENDAPAGAMENTO", ' +
            ' "STVENDADETALHE", ' +
            ' "STRESOLVIDO", ' +
            ' "DTVENDA" ' +
        ' ) ' +
		' VALUES(?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setString(2, registro.IDVENDA);
        pStmt.setString(3, registro.STVENDA);
        pStmt.setString(4, registro.STVENDAPAGAMENTO);
        pStmt.setString(5, registro.STVENDADETALHE);
        pStmt.setString(6, registro.STRESOLVIDO);
        setTimestampOrNull(pStmt,7, registro.DTVENDA);
        
    
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDANAOMIGRADA" SET ' + 
        ' "STRESOLVIDO" = ? ' +
        ' WHERE "IDVENDA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.STRESOLVIDO);
        pStmt.setString(2, registro.IDVENDA);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
         //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;   
	    default:
            break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}