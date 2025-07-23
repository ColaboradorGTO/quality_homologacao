var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idCatPeid = $.request.parameters.get("idCatPeid");
    var descCatPed = $.request.parameters.get("descCatPed");
    var idTamPed = $.request.parameters.get("idTamPed");
    var idVincCatPeid = $.request.parameters.get("idVincCatPeid");

    var query2 = 'SELECT' +
    '   t1.IDCATPEDIDOTAMANHO, '+
    '   t2.IDTAMANHO, ' +
    '   t2.DSTAMANHO, ' +
	'   t3.IDCATEGORIAPEDIDO, ' +
	'   t3.DSCATEGORIAPEDIDO, ' +
	'   t3.TIPOPEDIDO' +
	' FROM "VAR_DB_NAME"."VINCCATPEDIDOTAMANHO" t1' +
    '   INNER JOIN "VAR_DB_NAME"."TAMANHO" t2 on t1.IDTAMANHO = t2.IDTAMANHO ' +
    '   INNER JOIN "VAR_DB_NAME"."CATEGORIAPEDIDO" t3 on t1.IDCATEGORIAPEDIDO = t3.IDCATEGORIAPEDIDO ' +
    ' WHERE 1=? ';
    

    if(idVincCatPeid){
        query2 = query2 + ' AND t1.IDCATPEDIDOTAMANHO=\'' + idVincCatPeid + '\' '; 
    }
    
    if (idCatPeid>0) {
		query2 = query2 + ' And t1.IDCATEGORIAPEDIDO = \'' + idCatPeid + '\' ';
	}
    
    if (descCatPed>0) {
		query2 = query2 + ' And t3.DSCATEGORIAPEDIDO = \'' + descCatPed + '\' ';
	}
    
    if (idTamPed>0) {
		query2 = query2 + ' And t1.IDTAMANHO = \'' + idTamPed + '\' ';
	}
   
    query2 = query2 + ' ORDER BY TO_ALPHANUM(t2.DSABREVIACAO) '; 
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query2, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VINCCATPEDIDOTAMANHO" SET ' + 
        ' "IDCATEGORIAPEDIDO" = ?, ' +
        ' "IDTAMANHO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDCATPEDIDOTAMANHO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDCATEGORIAPEDIDO);
        pStmt.setInt(2, registro.IDTAMANHO);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDCATPEDIDOTAMANHO);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDCATPEDIDOTAMANHO")),0) + 1 FROM "VAR_DB_NAME"."VINCCATPEDIDOTAMANHO" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."VINCCATPEDIDOTAMANHO" ' +
		" ( " +
        ' "IDCATPEDIDOTAMANHO", ' +
        ' "IDCATEGORIAPEDIDO", ' +
        ' "IDTAMANHO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdTamCatPed = api.executeScalar(queryId,1);

		pStmt.setInt(1, parseInt(IdTamCatPed));
        pStmt.setInt(2, registro.IDCATEGORIAPEDIDO);
        pStmt.setInt(3, registro.IDTAMANHO);
        pStmt.setString(4, registro.STATIVO);
    	
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