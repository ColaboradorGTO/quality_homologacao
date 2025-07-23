var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

var idFuncionario = $.request.parameters.get("idFuncionario");
var dataPesqInicio = $.request.parameters.get("dataPesqInicio");
var dataPesqFinal = $.request.parameters.get("dataPesqFinal");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbmsb.IDMOVIMENTOSALDO,' +
	'   tbmsb.IDFUNCIONARIO,' +
	'   tbf.NOFUNCIONARIO,' +
	'   tbmsb.IDFUNCIONARIORESP,' +
	'   IFNULL(tbmsb.IDVENDA,\'-\') AS IDVENDA,' +
	'   tbmsb.TIPOMOVIMENTO,' +
	'   tbmsb.VRANTERIOR,' +
	'   tbmsb.VRMOVIMENTO,' +
	'   tbmsb.VRATUAL,' +
	'   TO_VARCHAR(tbmsb.DTMOVIMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTMOVIMENTO, ' +
	'   tbmsb.OBSERVACAO,' +
	'   tbmsb.NUCPF' +
    ' FROM ' + 
    '   "VAR_DB_NAME".MOVIMENTOSALDOBONIFICACAO tbmsb' +
    '	INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbmsb.IDFUNCIONARIO ' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbmsb.IDMOVIMENTOSALDOBONIFICACAO = \'' + byId + '\' ';
    }
    
    if(idFuncionario){
	    query = query + ' and tbmsb.IDFUNCIONARIO = ' + idFuncionario;
	}
	
	if(dataPesqInicio && dataPesqFinal) {
        query = query + ' AND (tbmsb.DTMOVIMENTO BETWEEN \'' + dataPesqInicio + ' 00:00:00\' AND \'' + dataPesqFinal + ' 23:59:59\')';
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
    
    var valorAnterior = 0;
    var valorAtual = 0;
    
    var queryValor = ' SELECT TOP 1 VRATUAL, DTMOVIMENTO' +
		' FROM  ' +
		'   "VAR_DB_NAME".MOVIMENTOSALDOBONIFICACAO  ' +
		'  WHERE  ' +
		'   IDFUNCIONARIO = ?  ' +
		'  ORDER BY DTMOVIMENTO DESC  ';

	var queryCPF = ' SELECT NUCPF' +
		' FROM  ' +
		'   "VAR_DB_NAME".FUNCIONARIO  ' +
		'  WHERE  ' +
		'   IDFUNCIONARIO = ?  ';

    
    var query = 'INSERT INTO "VAR_DB_NAME"."MOVIMENTOSALDOBONIFICACAO" ' +
		" ( " +
		' "IDMOVIMENTOSALDO", ' +
    	' "IDFUNCIONARIO", ' +
    	' "IDFUNCIONARIORESP", ' +
    	' "IDVENDA", ' +
    	' "TIPOMOVIMENTO", ' +
    	' "VRANTERIOR", ' +
    	' "VRMOVIMENTO", ' +
    	' "VRATUAL", ' +
    	' "DTMOVIMENTO", ' +
    	' "OBSERVACAO", ' +
    	' "NUCPF" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_MOVIMENTOSALDOBONIFICACAO.NEXTVAL,?,?,?,?,?,?,?,now(),?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var linhaValor = api.sqlQuery(queryValor,  registro.IDFUNCIONARIO);
		var linhaCpf = api.sqlQuery(queryCPF,  registro.IDFUNCIONARIO);
		
		if(linhaValor.length > 0){
		    valorAnterior = parseFloat(linhaValor[0].VRATUAL);
		    
		    if(registro.TIPOMOVIMENTO === 'Credito'){
		       valorAtual = registro.VRMOVIMENTO + valorAnterior;
		    }else{
		        valorAtual = valorAnterior - registro.VRMOVIMENTO; 
		    }
		}else{
		    valorAtual = registro.VRMOVIMENTO;
		}
		
		pStmt.setInt(1, registro.IDFUNCIONARIO);
		pStmt.setInt(2, registro.IDFUNCIONARIORESP);
        pStmt.setString(3, registro.IDVENDA);
        pStmt.setString(4, registro.TIPOMOVIMENTO);
        pStmt.setFloat(5, valorAnterior);
        pStmt.setFloat(6, registro.VRMOVIMENTO);
        pStmt.setFloat(7, valorAtual);
        pStmt.setString(8, registro.OBSERVACAO);
        pStmt.setString(9, linhaCpf[0].NUCPF);
    	
        pStmt.execute();
        valorAnterior = 0;
        valorAtual = 0;
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