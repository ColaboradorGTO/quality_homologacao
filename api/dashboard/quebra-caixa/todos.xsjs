var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbqc.IDQUEBRACAIXA",' +
	'   tbqc.IDCAIXAWEB",' +
	'   tbqc.IDMOVIMENTOCAIXA",' +
	'   tbqc.IDGERENTE",' +
	'   tbqc.IDFUNCIONARIO",' +
	'   tbqc.DTLANCAMENTO",' +
	'   tbqc.VRQUEBRASISTEMA",' +
	'   tbqc.VRQUEBRAEFETIVADO",' +
	'   tbqc.TXTHISTORICO",' +
	'   tbqc.STATIVO",' +
	'   tbe.NORAZAOSOCIAL,' +
    '   tbe.NOFANTASIA,' +
    '   tbe.NUCNPJ,' +
    '   tbf.NOFUNCIONARIO AS NOMEOPERADOR,' +
    '   tbf.NUCPF AS CPFOPERADOR,' +
    '   tbf1.NOFUNCIONARIO AS NOMEGERENTE' +
    ' FROM ' + 
    '   "VAR_DB_NAME".QUEBRACAIXA tbqc' +
    '   LEFT JOIN "VAR_DB_NAME".EMPRESA tbe ON tbqc.IDEMPRESA = tbe.IDEMPRESA' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbqc.IDFUNCIONARIO = tbf.IDFUNCIONARIO' +
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf1 ON tbqc.IDGERENTE = tbf1.IDFUNCIONARIO' +
    ' WHERE ' +
        '	1 = ? ';
    
    if ( byId ) {
        query = query + ' And  tbqc.IDQUEBRACAIXA = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."QUEBRACAIXA" SET ' + 
        ' "IDCAIXAWEB" = ?, ' + 
    	' "IDMOVIMENTOCAIXA" = ?, ' + 
    	' "IDGERENTE" = ?, ' + 
    	' "IDFUNCIONARIO" = ?, ' + 
    	' "DTLANCAMENTO" = ?, ' + 
    	' "VRQUEBRASISTEMA" = ?, ' + 
    	' "VRQUEBRAEFETIVADO" = ?, ' + 
    	' "TXTHISTORICO" = ?, ' + 
    	' "STATIVO" = ? ' + 
        ' WHERE "IDQUEBRACAIXA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        
        pStmt.setInt(1, registro.IDCAIXAWEB);
        pStmt.setString(2, registro.IDMOVIMENTOCAIXA);
        pStmt.setInt(3, registro.IDGERENTE);
        pStmt.setInt(4, registro.IDFUNCIONARIO);
        pStmt.setDate(5, registro.DTLANCAMENTO);
        pStmt.setFloat(6, registro.VRQUEBRASISTEMA);
        pStmt.setFloat(7, registro.VRQUEBRAEFETIVADO);
        pStmt.setString(8, registro.TXTHISTORICO);
        pStmt.setString(9, registro.STATIVO);
        pStmt.setInt(10, registro.IDQUEBRACAIXA);
        
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."QUEBRACAIXA" ' +
		" ( " +
		' "IDQUEBRACAIXA", ' +
        ' "IDCAIXAWEB", ' + 
    	' "IDMOVIMENTOCAIXA", ' + 
    	' "IDGERENTE", ' + 
    	' "IDFUNCIONARIO", ' + 
    	' "DTLANCAMENTO", ' + 
    	' "VRQUEBRASISTEMA", ' + 
    	' "VRQUEBRAEFETIVADO", ' + 
    	' "TXTHISTORICO", ' + 
    	' "STATIVO" ' +
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_QUEBRACAIXA.NEXTVAL,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDCAIXAWEB);
        pStmt.setString(2, registro.IDMOVIMENTOCAIXA);
        pStmt.setInt(3, registro.IDGERENTE);
        pStmt.setInt(4, registro.IDFUNCIONARIO);
        pStmt.setDate(5, registro.DTLANCAMENTO);
        pStmt.setFloat(6, registro.VRQUEBRASISTEMA);
        pStmt.setFloat(7, registro.VRQUEBRAEFETIVADO);
        pStmt.setString(8, registro.TXTHISTORICO);
        pStmt.setString(9, registro.STATIVO);
    	
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