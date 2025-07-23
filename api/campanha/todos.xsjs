var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '	tbc.IDCAMPANHA,' +
    '	tbc.DSCAMPANHA,' +
    '	tbc.IDOPERADOR,' +
    '	TO_VARCHAR(tbc.DTINICIO,\'DD-MM-YYYY\') AS DTINICIO, ' +
    '	TO_VARCHAR(tbc.DTFINAL,\'DD-MM-YYYY\') AS DTFINAL, ' +
    '	tbc.VRPERCDESCONTO, ' +
    '   tbe.NOFANTASIA ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CAMPANHA tbc' +
    '   INNER JOIN "VAR_DB_NAME".CAMPANHA_EMPRESA tbce ON tbce.IDCAMPANHA = tbc.IDCAMPANHA '+
    '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbce.IDEMPRESA = tbe.IDEMPRESA '+
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbc.IDCAMPANHA = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CAMPANHA" SET ' + 
        ' "DSCAMPANHA" = ?, ' +
        ' "IDOPERADOR" = ?, ' +
        ' "DTINICIO" = ?, ' +
        ' "DTFINAL" = ?, ' +
        ' "VRPERCDESCONTO" = ? ' +
        ' WHERE "IDCAMPANHA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSCAMPANHA);
        pStmt.setInt(2, registro.IDOPERADOR);
        pStmt.setString(3, registro.DTINICIO);
        pStmt.setString(4, registro.DTFINAL);
        pStmt.setFloat(5, registro.VRPERCDESCONTO);
        pStmt.setInt(6, registro.IDCAMPANHA);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnIncluirEmpresas(lstEmpresas, idCampanha, conn){
    var query = 'INSERT INTO "VAR_DB_NAME"."CAMPANHA_EMPRESA" ' +
		" ( " +
		' "ID", ' +
		' "IDCAMPANHA", ' +
		' "IDEMPRESA" ' +
		' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_CAMPANHA_EMPRESA.NEXTVAL,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstEmpresas.length; i++) {

		var registro = lstEmpresas[i];

		pStmt.setInt(1, idCampanha);
		pStmt.setInt(2, registro);

		pStmt.execute();
	}

	pStmt.close();

	conn.commit();
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    var queryId = 'SELECT QUALITY_CONC_HML.SEQ_CAMPANHA.NEXTVAL FROM DUMMY WHERE 1=?';
    var query = 'INSERT INTO "VAR_DB_NAME"."CAMPANHA" ' +
		" ( " +
		' "IDCAMPANHA", '+
		' "DSCAMPANHA", ' +
        ' "IDOPERADOR", ' +
        ' "DTINICIO", ' +
        ' "DTFINAL", ' +
        ' "VRPERCDESCONTO" ' +
        ' ) ' +
		' VALUES(?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        var idCampanha = api.executeScalar(queryId,1);
		var registro = bodyJson[i];
		
		pStmt.setInt(1, idCampanha);
		pStmt.setString(2, registro.DSCAMPANHA);
        pStmt.setInt(3, registro.IDOPERADOR);
        pStmt.setString(4, registro.DTINICIO);
        pStmt.setString(5, registro.DTFINAL);
        pStmt.setFloat(6, registro.VRPERCDESCONTO);
       
        pStmt.execute();
        
        fnIncluirEmpresas(registro.EMPRESAS,idCampanha,conn);
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