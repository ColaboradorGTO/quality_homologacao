var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    var idResumoVendaWeb = $.request.parameters.get("idResumoVendaWeb");
    var query = ' SELECT ' + 
    '   tbdlc.IDDETLACCONVENIO,' +
    '   tbdlc.IDCONVENIO,' +
    '   tbdlc.IDCONVENIADO,' +
    '   tbdlc.DTLANCAMENTO,' +
    '   tbdlc.DTCOMPENSACAO,' +
    '   tbdlc.IDLOJA,' +
    '   tbdlc.IDCAIXA,' +
    '   tbdlc.IDRESUMOVENDALOCAL,' +
    '   tbdlc.IDRESUMOVENDAWEB,' +
    '   tbdlc.VRBRUTO,' +
    '   tbdlc.VRDESCONTO,' +
    '   tbdlc.VRLIQUIDO,' +
    '   tbdlc.DTVENCIMENTO,' +
    '   tbdlc.STMIGRADOSAP,' +
    '   tbdlc.NRCPF' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETLANCCONVENIO tbdlc' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdlc.IDDETLACCONVENIO = \'' + byId + '\' ';
    }
    if ( idResumoVendaWeb ) {
        query = query + ' And  tbdlc.IDRESUMOVENDAWEB = \'' + idResumoVendaWeb + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETLANCCONVENIO" SET ' + 
        ' "IDCONVENIO" = ?, ' +
        ' "IDCONVENIADO" = ?, ' +
        ' "DTLANCAMENTO" = ?, ' +
        ' "DTCOMPENSACAO" = ?, ' +
        ' "IDLOJA" = ?, ' +
        ' "IDCAIXA" = ?, ' +
        ' "IDRESUMOVENDALOCAL" = ?, ' +
        ' "IDRESUMOVENDAWEB" = ?, ' +
        ' "VRBRUTO" = ?, ' +
        ' "VRDESCONTO" = ?, ' +
        ' "VRLIQUIDO" = ?, ' +
        ' "DTVENCIMENTO" = ?, ' +
        ' "STMIGRADOSAP" = ?, ' + 
        ' "NRCPF" = ? ' + 
    	' WHERE "IDDETLACCONVENIO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDCONVENIO);
        pStmt.setInt(2, registro.IDCONVENIADO);
        pStmt.setDate(3, registro.DTLANCAMENTO);
        setDateOrNull(pStmt,4, registro.DTCOMPENSACAO);
        pStmt.setInt(5, registro.IDLOJA);
        pStmt.setInt(6, registro.IDCAIXA);
        pStmt.setInt(7, registro.IDRESUMOVENDALOCAL);
        pStmt.setInt(8, registro.IDRESUMOVENDAWEB);
        pStmt.setFloat(9, registro.VRBRUTO);
        pStmt.setFloat(10, registro.VRDESCONTO);
        pStmt.setFloat(11, registro.VRLIQUIDO);
        setDateOrNull(pStmt,12, registro.DTVENCIMENTO);
        pStmt.setString(13, registro.STMIGRADOSAP);
        pStmt.setString(14, registro.NRCPF);
    	pStmt.setInt(15, registro.IDDETLACCONVENIO);
                    
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
    var queryId = 'SELECT QUALITY_CONC_HML.SEQ_DETLANCCONVENIO.NEXTVAL FROM DUMMY WHERE 1=?';

    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETLANCCONVENIO" ' +
		" ( " +
		' "IDDETLACCONVENIO", ' +
        ' "IDCONVENIO", ' +
        ' "IDCONVENIADO", ' +
        ' "DTLANCAMENTO", ' +
        ' "DTCOMPENSACAO", ' +
        ' "IDLOJA", ' +
        ' "IDCAIXA", ' +
        ' "IDRESUMOVENDALOCAL", ' +
        ' "IDRESUMOVENDAWEB", ' +
        ' "VRBRUTO", ' +
        ' "VRDESCONTO", ' +
        ' "VRLIQUIDO", ' +
        ' "DTVENCIMENTO", ' +
        ' "STMIGRADOSAP", ' +
        ' "NRCPF" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    var ids = [];
    
	for (var i = 0; i < bodyJson.length; i++) {
       
        var idDetalheConvenio = api.executeScalar(queryId,1);
        var registro = bodyJson[i];
		
		pStmt.setInt(1, idDetalheConvenio);
		pStmt.setInt(2, registro.IDCONVENIO);
        setIntOrNull(pStmt,3, registro.IDCONVENIADO);
        pStmt.setDate(4, registro.DTLANCAMENTO);
        setDateOrNull(pStmt, 5, registro.DTCOMPENSACAO);
        pStmt.setInt(6, registro.IDLOJA);
        pStmt.setInt(7, registro.IDCAIXA);
        pStmt.setInt(8, registro.IDRESUMOVENDALOCAL);
        pStmt.setString(9, registro.IDRESUMOVENDAWEB);
        pStmt.setFloat(10, registro.VRBRUTO);
        pStmt.setFloat(11, registro.VRDESCONTO);
        pStmt.setFloat(12, registro.VRLIQUIDO);
        setDateOrNull(pStmt, 13, registro.DTVENCIMENTO);
        pStmt.setString(14, registro.STMIGRADOSAP);
        pStmt.setString(15, registro.NRCPF);
    	
        pStmt.execute();
        ids.push(idDetalheConvenio);
	}

	pStmt.close();

	conn.commit();
	//return fnHandleGet();
    return {
	    "ids": ids
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