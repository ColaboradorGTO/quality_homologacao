var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
     var nuCpf = $.request.parameters.get("cpf");
    
    var query = ' SELECT ' + 
    '   tbfe.ID,' +
    '   tbfe.IDFUNCIONARIO,' +
    '   tbf.NOFUNCIONARIO,' +
    '   tbf.NUCPF,' +
    '   TO_VARCHAR(tbfe.DATAMOVIMENTO,\'YYYY-MM-DD HH24:MI:SS\') AS DATAMOVIMENTO, ' +
    '   tbfe.VLSALDOINICIAL,' +
    '   tbfe.VLCREDITO,' +
    '   tbfe.VLDEBITO,' +
    '   tbfe.VLSALDOFINAL,' +
    '   tbfe.TXTHISTORICO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".FUNCIONARIOEXTRATO tbfe' +
    '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbfe.IDFUNCIONARIO' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbfe.ID = \'' + byId + '\' ';
    }
    
    if ( nuCpf ) {
        query = query + ' And  tbf.NUCPF = \'' + nuCpf + '\' ';
    }

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}


function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."FUNCIONARIOEXTRATO" ' +
		" ( " +
		' "ID", ' +
		' "IDFUNCIONARIO", ' +
        ' "DATAMOVIMENTO", ' +
        ' "VLSALDOINICIAL", ' +
        ' "VLCREDITO", ' +
        ' "VLDEBITO", ' +
        ' "VLSALDOFINAL", ' +
        ' "TXTHISTORICO", ' +
        ' "IDVENDA" ' +
        ' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_FUNCIONARIOEXTRATO.NEXTVAL,?,now(),?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		var UltSaldoFinal = api.executeScalar(' SELECT TOP 1 IFNULL("VLSALDOFINAL",0) FROM "VAR_DB_NAME"."FUNCIONARIOEXTRATO" WHERE IDFUNCIONARIO = ? ORDER BY ID DESC', registro.IDFUNCIONARIO);
		var vlSaldoInicial = parseFloat(UltSaldoFinal);
		var vlSaldoFinal = 0;
		
		if(registro.VLCREDITO > 0){
		    vlSaldoFinal = vlSaldoInicial + registro.VLCREDITO;
		}else{
		    if(registro.VLDEBITO > UltSaldoFinal){
		        return "O valor do débito é maior que o valor do saldo atual!";
		    }else{
		        vlSaldoFinal = vlSaldoInicial - registro.VLDEBITO; 
		    }
		}
		
		pStmt.setInt(1, registro.IDFUNCIONARIO);
        pStmt.setFloat(2, vlSaldoInicial);
        pStmt.setFloat(3, registro.VLCREDITO);
        pStmt.setFloat(4, registro.VLDEBITO);
        pStmt.setFloat(5, vlSaldoFinal);
        pStmt.setString(6, registro.TXTHISTORICO);
        pStmt.setString(7, registro.IDVENDA);
    	
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