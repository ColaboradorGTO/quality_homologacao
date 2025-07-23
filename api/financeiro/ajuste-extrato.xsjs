var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbae.IDAJUSTEEXTRATO,' +
    '   tbae.IDEMPRESA,' +
    '   tbae.HISTORICO,' +
    '   tbae.VRDEBITO,' +
    '   tbae.VRCREDITO,' +
    '   tbae.IDOPERADOR,' +
    '   TO_VARCHAR(tbae.DATACADASTRO,\'DD-MM-YYYY\') AS DTAJUSTEFORMATADA, ' +
    '   tbae.STATIVO,' +
    '   tbae.STCANCELADO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".AJUSTEEXTRATO tbae' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbae.IDAJUSTEEXTRATO = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."AJUSTEEXTRATO" SET ' + 
        ' "HISTORICO" = ?, ' +
        ' "VRDEBITO" = ?, ' +
        ' "VRCREDITO" = ?, ' +
        ' "IDOPERADOR" = ?, ' +
        ' "DATACADASTRO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "STCANCELADO" = ? ' +
    	' WHERE "IDAJUSTEEXTRATO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		
        pStmt.setString(1, registro.DSHISTORIO);
        pStmt.setFloat(2, registro.VRDEBITO);
        pStmt.setFloat(3, registro.VRCREDITO);
        pStmt.setInt(4, registro.IDOPERADOR);
        pStmt.setDate(5, registro.DATACADASTRO);
        pStmt.setString(6, registro.STATIVO);
        pStmt.setString(7, registro.STCANCELADO);
        pStmt.setInt(8, registro.IDAJUSTEEXTRATO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."AJUSTEEXTRATO" ' +
		" ( " +
    		' "IDAJUSTEEXTRATO", ' +
            ' "IDEMPRESA", ' +
            ' "HISTORICO", ' +
            ' "VRDEBITO", ' +
            ' "VRCREDITO", ' +
            ' "STATIVO", ' +
            ' "STCANCELADO", ' +
            ' "IDOPERADOR", ' +
            ' "DATACADASTRO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_AJUSTEEXTRATO.NEXTVAL,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
        pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setString(2, registro.HISTORICO);
        pStmt.setFloat(3, registro.VRDEBITO);
        pStmt.setFloat(4, registro.VRCREDITO);
        pStmt.setString(5, registro.STATIVO);
        pStmt.setString(6, registro.STCANCELADO);
        pStmt.setInt(7, registro.IDOPERADOR);
		pStmt.setDate(8, registro.DATACADASTRO);
    	
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