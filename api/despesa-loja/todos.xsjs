var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbdl.IDDESPESASLOJA,' +
    '   tbdl.DTDESPESA,' +
    '   TO_VARCHAR(tbdl.DTDESPESA,\'YYYY-MM-DD\') AS DTDESPESAUPDATE,  ' +
    '   TO_VARCHAR( tbdl.DTDESPESA, \'HH24:MI:SS\') AS HRDESPESAUPDATE, ' +
    '   tbdl.IDEMPRESA,' +
    '   tbdl.IDUSR,' +
    '   tbdl.IDCATEGORIARECEITADESPESA,' +
    '   tbcrd.DSCATEGORIA AS DSCATEGORIARECDESP,' +
    '   tbdl.IDFUNCIONARIO,' +
    '   tbdl.DTDESCONTOFUNCIONARIO,' +
    '   tbdl.VRDESPESA,'  +
    '   tbdl.DSPAGOA,' +
    '   CAST(tbdl.DSHISTORIO AS TEXT) AS DSHISTORICO,' +
    '   tbdl.TPNOTA,' +
    '   tbdl.NUNOTAFISCAL,' +
    '   tbdl.DSPATHDOCFISCAL,' +
    '   tbdl.STATIVO,' +
    '   tbdl.STCANCELADO,' +
    '   tbdl.IDUSRCACELAMENTO,' +
    '   tbdl.DSMOTIVOCANCELAMENTO,' +
    '   tbe.NORAZAOSOCIAL,' +
    '   tbe.NOFANTASIA,' +
    '   tbe.NUCNPJ,' +
    '   tbf.NOFUNCIONARIO,' +
    '   tbf.NUCPF,' +
    '   tbf1.NOFUNCIONARIO AS NOMEGERENTE' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DESPESALOJA tbdl' +
    '   LEFT JOIN "VAR_DB_NAME".EMPRESA tbe ON tbdl.IDEMPRESA = tbe.IDEMPRESA' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbdl.IDFUNCIONARIO = tbf.IDFUNCIONARIO' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf1 ON tbdl.IDUSR = tbf1.IDFUNCIONARIO' +
    '   LEFT JOIN "VAR_DB_NAME".CATEGORIARECEITADESPESA tbcrd ON tbdl.IDCATEGORIARECEITADESPESA = tbcrd.IDCATEGORIARECDESP' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdl.IDDESPESASLOJA = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DESPESALOJA" SET ' + 
        ' "DTDESPESA" = ?, ' +
        ' "IDEMPRESA" = ?, ' +
        ' "IDUSR" = ?, ' +
        ' "IDCATEGORIARECEITADESPESA" = ?, ' +
        ' "IDFUNCIONARIO" = ?, ' +
        ' "DTDESCONTOFUNCIONARIO" = ?, ' +
        ' "VRDESPESA" = ?, ' +
        ' "DSPAGOA" = ?, ' +
        ' "DSHISTORIO" = ?, ' +
        ' "TPNOTA" = ?, ' +
        ' "NUNOTAFISCAL" = ?, ' +
        ' "DSPATHDOCFISCAL" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "STCANCELADO" = ?, ' +
        ' "IDUSRCACELAMENTO" = ?, ' +
        ' "DSMOTIVOCANCELAMENTO" = ? ' + 
    	' WHERE "IDDESPESASLOJA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setDate(1, registro.DTDESPESA);
        pStmt.setInt(2, registro.IDEMPRESA);
        pStmt.setInt(3, registro.IDUSR);
        pStmt.setInt(4, registro.IDCATEGORIARECEITADESPESA);
        pStmt.setInt(5, registro.IDFUNCIONARIO);
        pStmt.setDate(6, registro.DTDESCONTOFUNCIONARIO);
        pStmt.setFloat(7, registro.VRDESPESA);
        pStmt.setString(8, registro.DSPAGOA);
        pStmt.setString(9, registro.DSHISTORIO);
        pStmt.setString(10, registro.TPNOTA);
        pStmt.setString(11, registro.NUNOTAFISCAL);
        pStmt.setString(12, registro.DSPATHDOCFISCAL);
        pStmt.setString(13, registro.STATIVO);
        pStmt.setString(14, registro.STCANCELADO);
        pStmt.setInt(15, registro.IDUSRCACELAMENTO);
        pStmt.setString(16, registro.DSMOTIVOCANCELAMENTO);
        pStmt.setString(17, registro.IDDESPESASLOJA);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DESPESALOJA" ' +
		" ( " +
		' "IDDESPESASLOJA", ' +
        ' "DTDESPESA", ' +
        ' "IDEMPRESA", ' +
        ' "IDUSR", ' +
        ' "IDCATEGORIARECEITADESPESA", ' +
        ' "IDFUNCIONARIO", ' +
        ' "DTDESCONTOFUNCIONARIO", ' +
        ' "VRDESPESA", ' +
        ' "DSPAGOA", ' +
        ' "DSHISTORIO", ' +
        ' "TPNOTA", ' +
        ' "NUNOTAFISCAL", ' +
        ' "DSPATHDOCFISCAL", ' +
        ' "STATIVO", ' +
        ' "STCANCELADO", ' +
        ' "IDUSRCACELAMENTO", ' +
        ' "DSMOTIVOCANCELAMENTO" ' + 
    	' ) ' +
		' VALUES("VAR_DB_NAME".SEQ_DESPESALOJA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setDate(1, registro.DTDESPESA);
        pStmt.setInt(2, registro.IDEMPRESA);
        pStmt.setInt(3, registro.IDUSR);
        pStmt.setInt(4, registro.IDCATEGORIARECEITADESPESA);
        setIntOrNull(pStmt, 5, registro.IDFUNCIONARIO);
        setDateOrNull(pStmt, 6, registro.DTDESCONTOFUNCIONARIO);
        pStmt.setFloat(7, registro.VRDESPESA);
        pStmt.setString(8, registro.DSPAGOA);
        pStmt.setString(9, registro.DSHISTORIO);
        pStmt.setString(10, registro.TPNOTA);
        pStmt.setString(11, registro.NUNOTAFISCAL);
        pStmt.setString(12, registro.DSPATHDOCFISCAL);
        pStmt.setString(13, registro.STATIVO);
        pStmt.setString(14, registro.STCANCELADO);
        setIntOrNull(pStmt, 15, registro.IDUSRCACELAMENTO);
        pStmt.setString(16, registro.DSMOTIVOCANCELAMENTO);
    	
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