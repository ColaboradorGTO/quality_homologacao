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

    var idgrupoempresa = $.request.parameters.get("idgrupoempresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

    var query =  ' SELECT ' +
                '   tbml.IDPREMIACAO, ' +
                '   tbml.DTPREMIOINICIO, ' +
                '   tbml.DTPREMIOFIM, ' +
                '   tbml.IDSUBGRUPOEMPRESARIAL, ' +
                '   emp.DSSUBGRUPOEMPRESARIAL, ' +
                '   tbml.NOFUNCAO, ' +
                '   tbml.NOINDICADOR, ' +
                '   tbml.TPAPURACAO, ' +
                '   tbml.VRBONUSSENIOR, ' +
                '   tbml.VRBONUSPLENO, ' +
                '   tbml.VRBONUSJUNIOR, ' +
                '   tbml.VRBONUSTODOS, ' +
                '   tbml.DSMOTIVOCANCELAMENTO, ' +
                '   tbml.DTCADASTRO, ' +
                '   tbml.DTCANCELAMENTO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".PREMIACAO tbml ' +
        '   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL emp ON tbml.IDSUBGRUPOEMPRESARIAL = emp.IDSUBGRUPOEMPRESARIAL  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND tbml.STATIVO = \'True\' ';
    if ( byId ) {
        query = query + ' And  tbdp.IDSUBGRUPOEMPRESARIAL = \'' + byId + '\' ';
    }
    if ( idgrupoempresa ) {
        query = query + ' And  tbdp.IDSUBGRUPOEMPRESARIAL = \'' + idgrupoempresa + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (tbdp.DTPREMIOINICIO = \'' + dataPesquisaInicio + '\' AND  tbdp.DTPREMIOFIM = \'' + dataPesquisaFim + '\') ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."PREMIACAO" SET ' +
                '   "DTPREMIOINICIO"=  ?, ' + 
                '   "DTPREMIOFIM"=  ?, ' + 
                '   "IDSUBGRUPOEMPRESARIAL"=  ?, ' + 
                '   "NOFUNCAO"=  ?, ' + 
                '   "NOINDICADOR"=  ?, ' + 
                '   "TPAPURACAO"=  ?, ' + 
                '   "VRBONUSSENIOR"=  ?, ' + 
                '   "VRBONUSPLENO"=  ?, ' + 
                '   "VRBONUSJUNIOR"=  ?, ' + 
                '   "VRBONUSTODOS"=  ?, ' + 
                '   "DSMOTIVOCANCELAMENTO"=  ?, ' + 
                '   "DTCADASTRO"=  ?, ' + 
                '   "DTCANCELAMENTO"=  ? ' + 
        ' WHERE "IDPREMIACAO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		
            pStmt.setDate(1, registro.DTPREMIOINICIO);
            pStmt.setDate(2, registro.DTPREMIOFIM);
            pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
            pStmt.setString(4, registro.NOFUNCAO);
            pStmt.setString(5, registro.NOINDICADOR);
            pStmt.setString(6, registro.TPAPURACAO);
            pStmt.setFloat(7, registro.VRBONUSSENIOR);
            pStmt.setFloat(8, registro.VRBONUSPLENO);
            pStmt.setFloat(9, registro.VRBONUSJUNIOR);
            pStmt.setFloat(10, registro.VRBONUSTODOS);
            pStmt.setString(11, registro.STATIVO);
            pStmt.setString(12, registro.DSMOTIVOCANCELAMENTO);
            pStmt.setDate(13, registro.DTCADASTRO);
            pStmt.setDate(14, registro.DTCANCELAMENTO);
            pStmt.setInt(15, registro.IDPREMIACAO);
        
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    
    var conn = $.db.getConnection();
  
    var query = 'INSERT INTO "VAR_DB_NAME"."PREMIACAO" ' + 
		" ( " +
		        '   "IDPREMIACAO", ' +
		        '   "DTPREMIOINICIO", ' +
                '   "DTPREMIOFIM", ' +
                '   "IDSUBGRUPOEMPRESARIAL", ' +
                '   "NOFUNCAO", ' +
                '   "NOINDICADOR", ' +
                '   "TPAPURACAO", ' +
                '   "VRBONUSSENIOR", ' +
                '   "VRBONUSPLENO", ' +
                '   "VRBONUSJUNIOR", ' +
                '   "VRBONUSTODOS", ' +
                '   "STATIVO", ' +
                '   "DTCADASTRO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,now())';

  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
		
		
	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDPREMIACAO")),0) + 1 FROM "VAR_DB_NAME"."PREMIACAO" WHERE 1 = ? ', 1);
		
		var idPremio = queryId;
		 
            pStmt.setInt(1,idPremio);    
            pStmt.setDate(2, registro.DTPREMIOINICIO);   
            pStmt.setDate(3, registro.DTPREMIOFIM);
            pStmt.setInt(4, registro.IDSUBGRUPOEMPRESARIAL);
            pStmt.setString(5, registro.NOFUNCAO);
            pStmt.setString(6, registro.NOINDICADOR);
            pStmt.setString(7, registro.TPAPURACAO);
            pStmt.setFloat(8, registro.VRBONUSSENIOR);
            pStmt.setFloat(9, registro.VRBONUSPLENO);
            pStmt.setFloat(10, registro.VRBONUSJUNIOR);
            pStmt.setFloat(11, registro.VRBONUSTODOS);
            pStmt.setString(12, registro.STATIVO);
        	
            pStmt.execute();

	}
    
    pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Atualização realizada com sucesso!"
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