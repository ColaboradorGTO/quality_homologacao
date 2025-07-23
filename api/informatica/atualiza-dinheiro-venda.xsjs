var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

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

function fnIncluirPagamentos(conn, lstPag, vIdVenda) {
	var query = 'INSERT INTO "VAR_DB_NAME"."VENDAPAGAMENTO" ' +
		" ( " +
		' "IDVENDAPAGAMENTO", ' +
		' "IDVENDA", ' +
		' "NITEM", ' +
		' "TPAG", ' +
		' "DSTIPOPAGAMENTO", ' +
		' "VALORRECEBIDO", ' +
		' "VALORDEDUZIDO", ' +
		' "VALORLIQUIDO", ' +
		' "DTPROCESSAMENTO", ' +
		' "DTVENCIMENTO", ' +
		' "NPARCELAS", ' +
		' "NOTEF", ' +
		' "NOAUTORIZADOR", ' +
		' "NOCARTAO", ' +
		' "NUOPERACAO", ' +
		' "NSUTEF", ' +
		' "NSUAUTORIZADORA", ' +
		' "NUAUTORIZACAO" ' +
		' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstPag.length; i++) {

		var registro = lstPag[i];

		pStmt.setString(1, vIdVenda + '-' + registro["@nItem"]);
		pStmt.setString(2, vIdVenda);
		pStmt.setString(3, registro["@nItem"]);
		pStmt.setString(4, registro.detPag.tPag);
		pStmt.setString(5, registro.detPag.DSTipoPagamento);
		pStmt.setFloat(6, registro.detPag.ValorRecebido);
		
		pStmt.setFloat(7, registro.detPag.ValorDeduzido||0.0);
		pStmt.setFloat(8, registro.detPag.ValorLiquido||0.0);
		setTimestampOrNull(pStmt, 9, registro.DTProcessamento);
		setTimestampOrNull(pStmt, 10, registro.DTVencimento);
		setIntOrNull(pStmt, 11, registro.detPag.NParcelas);
		pStmt.setString(12, registro.detPag.NoTEF);
		pStmt.setString(13, registro.detPag.NoAutorizador);
		pStmt.setString(14, registro.detPag.NoCartao);
		pStmt.setString(15, registro.detPag.NuOperacao);
		pStmt.setString(16, registro.detPag.NSUTEF);
		pStmt.setString(17, registro.detPag.NSUAutorizadora);
		pStmt.setString(18, registro.NuAutorizacao);

		pStmt.execute();
	}

	pStmt.close();

	conn.commit();
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ' + 
        ' "VRRECDINHEIRO" = ?, ' + 
        ' "VRTOTALPAGO" = ?, ' + 
        ' "VRTROCO" = 0 ' + 
        ' WHERE "IDVENDA" =  ? ';
    	
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

	var registro = bodyJson;

    pStmt.setFloat(1, registro.VRRECDINHEIRO);
    pStmt.setFloat(2, registro.VRTOTALPAGO);
    pStmt.setInt(3, registro.IDVENDA);
    
	pStmt.execute();
   
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
        
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}