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

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function fnHandlePost() {
    let conn = $.db.getConnection(); 
    
	try {
        let query = `
            INSERT INTO 
                "VAR_DB_NAME"."VENDAPAGAMENTO"
                    (
                        "IDVENDAPAGAMENTO",
                        "IDVENDA",
                        "NITEM",
                        "TPAG",
                        "DSTIPOPAGAMENTO",
                        "VALORRECEBIDO",
                        "VALORDEDUZIDO",
                        "VALORLIQUIDO",
                        "DTPROCESSAMENTO",
                        "DTVENCIMENTO",
                        "NPARCELAS",
                        "NOTEF",
                        "NOAUTORIZADOR",
                        "NOCARTAO",
                        "NUOPERACAO",
                        "NSUTEF",
                        "NSUAUTORIZADORA",
                        "NUAUTORIZACAO",
                        "CPF",
                        "NOME"
                    )
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) 
        `;
        
        let pStmt = conn.prepareStatement(api.replaceDbName(query));
        let bodyJson = JSON.parse($.request.body.asString());
        
        if (bodyJson.length > 0) {
            for (let i = 0; i < bodyJson.length; i++) {
                let registro = bodyJson[i];
                let detPag = registro.detpag;
                
                let queryPagVenda = `
                    SELECT 
                        IDVENDA 
                    FROM 
                        "VAR_DB_NAME".VENDAPAGAMENTO
                    WHERE 
                        IDVENDA = ?
                `;
                
                let reqPagVenda = api.sqlQuery(queryPagVenda, registro.IDVENDA);
                
                if(reqPagVenda.length > 0){
                    throw new Error('Esta venda já possui forma de pagamento vinculado!');
                }
                
                if (detPag.length > 0) {
                    for (let j = 0; j < detPag.length; j++) {
                        let det = detPag[j];
                        let nuItem = j + 1
                        
                        pStmt.setString(1, registro.IDVENDA + '-' + nuItem);
                        pStmt.setString(2, registro.IDVENDA);
                        pStmt.setString(3, String(nuItem));
                        pStmt.setString(4, det.TPAG);
                        pStmt.setString(5, det.DSTIPOPAGAMENTO);
                        pStmt.setFloat(6, Number(det.VALORRECEBIDO));
                        pStmt.setFloat(7, Number(det.VALORDEDUZIDO) || 0.0);
                        pStmt.setFloat(8, Number(det.VALORLIQUIDO) || 0.0);
                        setTimestampOrNull(pStmt, 9, det.DTPROCESSAMENTO);
                        setTimestampOrNull(pStmt, 10, det.DTVENCIMENTO);
                        setIntOrNull(pStmt, 11, det.NPARCELAS);
                        setStringOrNull(pStmt, 12, det.NOTEF);
                        setStringOrNull(pStmt, 13, det.NOAUTORIZADOR);
                        setStringOrNull(pStmt, 14, det.NOCARTAO);
                        setStringOrNull(pStmt, 15, det.NUOPERACAO);
                        setStringOrNull(pStmt, 16, det.NSUTEF);
                        setStringOrNull(pStmt, 17, det.NSUAUTORIZADORA);
                        setStringOrNull(pStmt, 18, det.NUAUTORIZACAO);
                        setStringOrNull(pStmt, 19, det.CPF);
                        setStringOrNull(pStmt, 20, det.NOME);
                        
                        pStmt.execute();
                        
                    }
                } else {
                    throw new Error('detPag vazio!');
                }
                
            }
            
            pStmt.close();
            
            conn.commit();
            
            return {
                "msg": "Inclusão realizada com sucesso!"
            };
        } else {
            throw new Error('Body vazio!');
        }
		
	} catch (e) {
	    conn.rollback();
	    throw e;
	}
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
        
		//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		default:
			break;
	}

} catch (e) {
	var detalheError = e.stack.split('\n');
    
    detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
    
    if(detalheError){
       detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message,
		detalheError
	}));
	$.response.status = 400;
}