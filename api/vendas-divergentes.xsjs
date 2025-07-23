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
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idCaixaWeb = $.request.parameters.get("idCaixaWeb");
    
    var query = 'SELECT '+
                '   IDEMPRESA, '+
                '   IDCAIXA, '+
                '   IDVENDA, '+
                '   DTHORAFECHAMENTO, '+
                '   NFE_INFNFE_TOTAL_ICMSTOT_VNF, '+
                '   TO_DECIMAL(VALORPAGAMENTO,10,2) AS VALORPAGAMENTO '+
                'FROM '+ 
                '   QUALITY_CONC_HML.VW_VENDAS_PAGMENTOS_DIFERENTES '+ 
                'WHERE 1=? AND TO_DECIMAL(VALORPAGAMENTO,10,2)<>TO_DECIMAL(NFE_INFNFE_TOTAL_ICMSTOT_VNF,10,2)';
    if(idEmpresa){
        query = query + ' AND IDEMPRESA = \''+ idEmpresa + '\' '; 
    }
    if(idCaixaWeb){
        query = query + ' AND IDCAIXA = \''+ idCaixaWeb + '\' ';
    }
    
    if ( byId ) {
        query = query + ' AND IDVENDA = \'' + byId + '\' ';
    }
    
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    var ultimoNrItem = api.executeScalar(' SELECT IFNULL(MAX(NITEM),0) AS NRULTIMOITEM FROM "VAR_DB_NAME"."VENDAPAGAMENTO" WHERE IDVENDA = ? ', bodyJson[0].idVenda);
    
    if(ultimoNrItem > 0){
        var queryUpdateStatus = 'UPDATE "VAR_DB_NAME"."VENDAPAGAMENTO" SET STCANCELADO=\'True\' WHERE IDVENDA = ?';
         
        var pStmt1 = conn.prepareStatement(api.replaceDbName(queryUpdateStatus));
        
        
        pStmt1.setString(1, bodyJson[0].idVenda);
        pStmt1.execute();
        pStmt1.close();
        conn.commit();
    }
    
    
    
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
		' "CPF", ' +
		' "NOME", ' +
		' "STCANCELADO" ' +
		' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,\'False\') ';

    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    
   
    
    
    //return ultimoNrItem;
   
    for (var i = 0; i < bodyJson.length; i++) {

        ultimoNrItem = ultimoNrItem + 1;
		var registro = bodyJson[i];
		

		pStmt.setString(1, registro.idVenda + '-' + ultimoNrItem);
		pStmt.setString(2, registro.idVenda);
		pStmt.setInt(3, ultimoNrItem);
		pStmt.setString(4, registro.tPag);
		pStmt.setString(5, registro.DSTipoPagamento);
		pStmt.setFloat(6, registro.ValorRecebido);
		
		pStmt.setFloat(7, registro.ValorDeduzido||0.0);
		pStmt.setFloat(8, registro.ValorLiquido||0.0);
		setTimestampOrNull(pStmt, 9, registro.DTProcessamento);
		setTimestampOrNull(pStmt, 10, registro.DTVencimento);
		pStmt.setInt(11, registro.NParcelas||0);
		pStmt.setString(12, registro.NoTEF);
		pStmt.setString(13, registro.NoAutorizador);
		pStmt.setString(14, registro.NoCartao);
		pStmt.setString(15, registro.NuOperacao);
		pStmt.setString(16, registro.NSUTEF);
		pStmt.setString(17, registro.NSUAutorizadora);
		pStmt.setString(18, registro.NuAutorizacao);
		pStmt.setString(19, registro.CPF);
		pStmt.setString(20, registro.NOME);

		pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

/*
function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."POS" ' +
		" ( " +
		' "IDPOS", ' +
        ' "IDSUBGRUPOEMPRESARIAL", ' +
        ' "DSPOS", ' +
        ' "NOREDE", ' +
        ' "NUPARCELAS", ' +
        ' "PERCREDE", ' +
        ' "DTULTALTERACAO", ' +
        ' "STATIVO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_POS.NEXTVAL,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(2, registro.DSPOS);
        pStmt.setString(3, registro.NOREDE);
        pStmt.setInt(4, registro.NUPARCELAS);
        pStmt.setFloat(5, registro.PERCREDE);
        pStmt.setDate(6, registro.DTULTALTERACAO);
        pStmt.setString(7, registro.STATIVO);
    	
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}*/

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
         
        //Handle your PUt calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break; 
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}