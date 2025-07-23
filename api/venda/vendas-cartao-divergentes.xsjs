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

function fnHandleGet(byId) {

	var query = ' SELECT TOP 1000 '+
                '	TRIM("IDVENDA") AS IDVENDA, '+
                '   TO_VARCHAR(DATA,\'YYYY-mm-DD HH24:MI:SS\') AS DATA, ' +
                '	"VALOR", '+
                '	"TPAG", '+
                '	"BANDEIRA", '+
                '	"PRODUTO", '+
                '	"TIPO", '+
                '	"PLANO", '+
                '	"NSU", '+
                '	"AUTORIZACAO", '+
                '	"SITUACAO", '+
                '	"CONFERIDO" '+
                'FROM "QUALITY_CONC_HML"."VENDAFALTAPAGAMENTO" where 1=? and SITUACAO = \'True\'';

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var venda = {
    		    "IDVENDA": registro.IDVENDA,
                "DATA": registro.DATA,
                "VALOR": registro.VALOR,
                "TPAG": registro.TPAG,
                "BANDEIRA": registro.BANDEIRA,
                "PRODUTO": registro.PRODUTO,
                "TIPO": registro.TIPO,
                "PLANO": registro.PLANO,
                "NSU": registro.NSU,
                "AUTORIZACAO": registro.AUTORIZACAO,
                "SITUACAO": registro.SITUACAO,
                "CONFERIDO": registro.CONFERIDO
			
			
		};
		
		data.push(venda);

	}

	response.data = data;

	return response;
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
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
		' "NUAUTORIZACAO", ' +
		' "STCANCELADO" ' +
		' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	
        
		var registro = bodyJson;
		
		pStmt.setString(1, registro.IDVENDAPAGAMENTO);
		pStmt.setString(2, registro.IDVENDA);
		pStmt.setInt(3, registro.NITEM);
		pStmt.setString(4, registro.TPAG);
		pStmt.setString(5, registro.DSTIPOPAGAMENTO);
		pStmt.setFloat(6, registro.VALORRECEBIDO);
		
		pStmt.setFloat(7, registro.VALORDEDUZIDO||0.0);
		pStmt.setFloat(8, registro.VALORLIQUIDO||0.0);
		setTimestampOrNull(pStmt, 9, registro.DTPROCESSAMENTO);
		setTimestampOrNull(pStmt, 10, registro.DTVENCIMENTO);
		setIntOrNull(pStmt, 11, registro.NPARCELAS);
		pStmt.setString(12, registro.NOTEF);
		pStmt.setString(13, registro.NOAUTORIZADOR);
		pStmt.setString(14, registro.NOCARTAO);
		pStmt.setString(15, registro.NUOPERACAO);
		pStmt.setString(16, registro.NSUTEF);
		pStmt.setString(17, registro.NSUAUTORIZADORA);
		pStmt.setString(18, registro.NUAUTORIZACAO);
		pStmt.setString(19, registro.STCANCELADO);
    	
        pStmt.execute();
	

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}
$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

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