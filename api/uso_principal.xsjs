var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var usoPrincipal = $.request.parameters.get("usoPrincipal");
    
    var query = ' SELECT *' + 
    ' FROM ' + 
    '   "VAR_DB_NAME".USOPRINCIPAL' +
    ' WHERE ' +
        '	1 = ?' ;
   
   if ( byId ) {
        query = query + ' And  ID = \'' + byId + '\' ';
    }
    
    if ( usoPrincipal ) {
        query = query + ' And  "Usage" = \'' + usoPrincipal + '\' ';
    }
    
    query = query + ' ORDER BY "Usage" ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."EMPRESA" SET ' + 
        ' "STGRUPOEMPRESARIAL" = ?, ' +
        ' "IDGRUPOEMPRESARIAL" = ?, ' +
        ' "IDSUBGRUPOEMPRESARIAL" = ?, ' +
        ' "NORAZAOSOCIAL" = ?, ' +
        ' "NOFANTASIA" = ?, ' +
        ' "NUCNPJ" = ?, ' +
        ' "NUINSCESTADUAL" = ?, ' +
        ' "NUINSCMUNICIPAL" = ?, ' +
        ' "CNAE" = ?, ' +
        ' "EENDERECO" = ?, ' +
        ' "ECOMPLEMENTO" = ?, ' +
        ' "EBAIRRO" = ?, ' +
        ' "ECIDADE" = ?, ' +
        ' "SGUF" = ?, ' +
        ' "NUUF" = ?, ' +
        ' "NUCEP" = ?, ' +
        ' "NUIBGE" = ?, ' +
        ' "EEMAILPRINCIPAL" = ?, ' +
        ' "EEMAILCOMERCIAL" = ?, ' +
        ' "EEMAILFINANCEIRO" = ?, ' +
        ' "EEMAILCONTABILIDADE" = ?, ' +
        ' "NUTELPUBLICO" = ?, ' +
        ' "NUTELCOMERCIAL" = ?, ' +
        ' "NUTELFINANCEIRO" = ?, ' +
        ' "NUTELGERENCIA" = ?, ' +
        ' "EURL" = ?, ' +
        ' "PATHIMG" = ?, ' +
        ' "NUCNAE" = ?, ' +
        ' "STECOMMERCE" = ?, ' +
        ' "DTULTATUALIZACAO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "ALIQPIS" = ?, ' +
        ' "ALIQCOFINS" = ? ' + 
    	' WHERE "IDEMPRESA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.STGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(4, registro.NORAZAOSOCIAL);
        pStmt.setString(5, registro.NOFANTASIA);
        pStmt.setString(6, registro.NUCNPJ);
        pStmt.setString(7, registro.NUINSCESTADUAL);
        pStmt.setString(8, registro.NUINSCMUNICIPAL);
        pStmt.setString(9, registro.CNAE);
        pStmt.setString(10, registro.EENDERECO);
        pStmt.setString(11, registro.ECOMPLEMENTO);
        pStmt.setString(12, registro.EBAIRRO);
        pStmt.setString(13, registro.ECIDADE);
        pStmt.setString(14, registro.SGUF);
        pStmt.setInt(15, registro.NUUF);
        pStmt.setString(16, registro.NUCEP);
        pStmt.setString(17, registro.NUIBGE);
        pStmt.setString(18, registro.EEMAILPRINCIPAL);
        pStmt.setString(19, registro.EEMAILCOMERCIAL);
        pStmt.setString(20, registro.EEMAILFINANCEIRO);
        pStmt.setString(21, registro.EEMAILCONTABILIDADE);
        pStmt.setString(22, registro.NUTELPUBLICO);
        pStmt.setString(23, registro.NUTELCOMERCIAL);
        pStmt.setString(24, registro.NUTELFINANCEIRO);
        pStmt.setString(25, registro.NUTELGERENCIA);
        pStmt.setString(26, registro.EURL);
        pStmt.setString(27, registro.PATHIMG);
        pStmt.setString(28, registro.NUCNAE);
        pStmt.setString(29, registro.STECOMMERCE);
        pStmt.setDate(30, registro.DTULTATUALIZACAO);
        pStmt.setString(31, registro.STATIVO);
        pStmt.setFloat(32, registro.ALIQPIS);
        pStmt.setFloat(33, registro.ALIQCOFINS);
        pStmt.setInt(34, registro.IDEMPRESA);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."EMPRESA" ' +
		" ( " +
		' "IDEMPRESA", ' +
        ' "STGRUPOEMPRESARIAL", ' +
        ' "IDGRUPOEMPRESARIAL", ' +
        ' "IDSUBGRUPOEMPRESARIAL", ' +
        ' "NORAZAOSOCIAL", ' +
        ' "NOFANTASIA", ' +
        ' "NUCNPJ", ' +
        ' "NUINSCESTADUAL", ' +
        ' "NUINSCMUNICIPAL", ' +
        ' "CNAE", ' +
        ' "EENDERECO", ' +
        ' "ECOMPLEMENTO", ' +
        ' "EBAIRRO", ' +
        ' "ECIDADE", ' +
        ' "SGUF", ' +
        ' "NUUF", ' +
        ' "NUCEP", ' +
        ' "NUIBGE", ' +
        ' "EEMAILPRINCIPAL", ' +
        ' "EEMAILCOMERCIAL", ' +
        ' "EEMAILFINANCEIRO", ' +
        ' "EEMAILCONTABILIDADE", ' +
        ' "NUTELPUBLICO", ' +
        ' "NUTELCOMERCIAL", ' +
        ' "NUTELFINANCEIRO", ' +
        ' "NUTELGERENCIA", ' +
        ' "EURL", ' +
        ' "PATHIMG", ' +
        ' "NUCNAE", ' +
        ' "STECOMMERCE", ' +
        ' "DTULTATUALIZACAO", ' +
        ' "STATIVO", ' +
        ' "ALIQPIS", ' +
        ' "ALIQCOFINS" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_EMPRESA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.STGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(4, registro.NORAZAOSOCIAL);
        pStmt.setString(5, registro.NOFANTASIA);
        pStmt.setString(6, registro.NUCNPJ);
        pStmt.setString(7, registro.NUINSCESTADUAL);
        pStmt.setString(8, registro.NUINSCMUNICIPAL);
        pStmt.setString(9, registro.CNAE);
        pStmt.setString(10, registro.EENDERECO);
        pStmt.setString(11, registro.ECOMPLEMENTO);
        pStmt.setString(12, registro.EBAIRRO);
        pStmt.setString(13, registro.ECIDADE);
        pStmt.setString(14, registro.SGUF);
        pStmt.setInt(15, registro.NUUF);
        pStmt.setString(16, registro.NUCEP);
        pStmt.setString(17, registro.NUIBGE);
        pStmt.setString(18, registro.EEMAILPRINCIPAL);
        pStmt.setString(19, registro.EEMAILCOMERCIAL);
        pStmt.setString(20, registro.EEMAILFINANCEIRO);
        pStmt.setString(21, registro.EEMAILCONTABILIDADE);
        pStmt.setString(22, registro.NUTELPUBLICO);
        pStmt.setString(23, registro.NUTELCOMERCIAL);
        pStmt.setString(24, registro.NUTELFINANCEIRO);
        pStmt.setString(25, registro.NUTELGERENCIA);
        pStmt.setString(26, registro.EURL);
        pStmt.setString(27, registro.PATHIMG);
        pStmt.setString(28, registro.NUCNAE);
        pStmt.setString(29, registro.STECOMMERCE);
        pStmt.setDate(30, registro.DTULTATUALIZACAO);
        pStmt.setString(31, registro.STATIVO);
        pStmt.setFloat(32, registro.ALIQPIS);
        pStmt.setFloat(33, registro.ALIQCOFINS);
    	
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