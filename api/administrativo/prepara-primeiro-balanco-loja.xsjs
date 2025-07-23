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
    
    var query = ' SELECT ' + 
    '   tbe.IDEMPRESA,' +
    '   tbe.STGRUPOEMPRESARIAL,' +
    '   tbe.IDGRUPOEMPRESARIAL,' +
    '   tbe.IDSUBGRUPOEMPRESARIAL,' +
    '   tbe.NORAZAOSOCIAL,' +
    '   tbe.NOFANTASIA,' +
    '   tbe.NUCNPJ,' +
    '   tbe.NUINSCESTADUAL,' +
    '   tbe.NUINSCMUNICIPAL,' +
    '   tbe.CNAE,' +
    '   tbe.EENDERECO,' +
    '   tbe.ECOMPLEMENTO,' +
    '   tbe.EBAIRRO,' +
    '   tbe.ECIDADE,' +
    '   tbe.SGUF,' +
    '   tbe.NUUF,' +
    '   tbe.NUCEP,' +
    '   tbe.NUIBGE,' +
    '   tbe.EEMAILPRINCIPAL,' +
    '   tbe.EEMAILCOMERCIAL,' +
    '   tbe.EEMAILFINANCEIRO,' +
    '   tbe.EEMAILCONTABILIDADE,' +
    '   tbe.NUTELPUBLICO,' +
    '   tbe.NUTELCOMERCIAL,' +
    '   tbe.NUTELFINANCEIRO,' +
    '   tbe.NUTELGERENCIA,' +
    '   tbe.EURL,' +
    '   tbe.PATHIMG,' +
    '   tbe.NUCNAE,' +
    '   tbe.STECOMMERCE,' +
    '   TO_VARCHAR(tbe.DTULTATUALIZACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTATUALIZACAO, ' +
    '   tbe.STATIVO,' +
    '   tbe.ALIQPIS,' +
    '   tbe.ALIQCOFINS,' +
    '	tbc.IDCONFIGURACAO,' +
    '	tbc.DSNOMEPFX,' +
    '   TO_VARCHAR(tbc.DTVALIDADECERTIFICADO,\'YYYY-MM-DD\') AS DTVALIDADECERTIFICADO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".EMPRESA tbe' +
    '   LEFT JOIN "VAR_DB_NAME".CONFIGURACAO tbc on tbe.IDEMPRESA = tbc.IDEMPRESA' +
    ' WHERE ' +
        '	1 = ?' + 
        'AND tbe.STATIVO=\'True\' and tbe.IDEMPRESA NOT IN (SELECT "IDEMPRESA" FROM "QUALITY_CONC"."RESUMOBALANCO" where dtabertura >= \'2022-04-01 00:00:00\')';
    
    if ( byId ) {
        query = query + ' And  tbe.IDEMPRESA in (' + byId + ') ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}


function fnHandlePut(){
    var conn = $.db.getConnection();
     /*var query = 'DELETE FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' + 
           	' WHERE "IDEMPRESA" =  ? ';*/
    var query = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
  		' "QTDINICIO" = 0, ' +
		' "QTDENTRADA" = 0, ' +
		' "QTDENTRADAVOUCHER" = 0, ' +
		' "QTDSAIDA" = 0, ' +
		' "QTDSAIDATRANSFERENCIA" = 0, ' +
		' "QTDRETORNOAJUSTEPEDIDO" = 0, ' +
		' "QTDFINAL" = 0, ' +
		' "QTDAJUSTEBALANCO" = 0, ' +
		' "STATIVO" = \'False\', ' +
		' "STPROCESSADO" = \'False\' ' +
		
    	' WHERE "IDEMPRESA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
			pStmt.setInt(1, registro.IDEMPRESA);
		
    	pStmt.execute();
    	
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Prepração balanço realizado com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
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
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}