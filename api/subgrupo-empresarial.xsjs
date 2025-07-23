var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbse.IDSUBGRUPOEMPRESARIAL,' +
    '   tbse.DSSUBGRUPOEMPRESARIAL,' +
    '   tbse.PATHIMG,' +
    '   tbse.EEMAILFATURAMENTO,' +
    '   tbse.NUTELFATURAMENTO,' +
    '   tbse.EEMAILCOBRANCA,' +
    '   tbse.NUTELCOBRANCA,' +
    '   tbse.EEMAILFINANCEIRO,' +
    '   tbse.NUTELFINANCEIRO,' +
    '   tbse.EEMAILCOMPRAS,' +
    '   tbse.EEMAILCOMPRAS2,' +
    '   tbse.NUTELCOMPRAS,' +
    '   tbse.EEMAILCADASTRO,' +
    '   tbse.NUTELCADASTRO,' +
    '   tbse.TPSEGMENTO,' +
    '   tbse.STALMOXARIFADO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".SUBGRUPOEMPRESARIAL tbse' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbse.IDSUBGRUPOEMPRESARIAL = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."SUBGRUPOEMPRESARIAL" SET ' + 
        ' "DSSUBGRUPOEMPRESARIAL" = ?, ' + 
        ' "PATHIMG" = ?, ' + 
        ' "EEMAILFATURAMENTO" = ?, ' + 
        ' "NUTELFATURAMENTO" = ?, ' + 
        ' "EEMAILCOBRANCA" = ?, ' + 
        ' "NUTELCOBRANCA" = ?, ' + 
        ' "EEMAILFINANCEIRO" = ?, ' + 
        ' "NUTELFINANCEIRO" = ?, ' + 
        ' "EEMAILCOMPRAS" = ?, ' + 
        ' "EEMAILCOMPRAS2" = ?, ' + 
        ' "NUTELCOMPRAS" = ?, ' + 
        ' "EEMAILCADASTRO" = ?, ' + 
        ' "NUTELCADASTRO" = ?, ' + 
        ' "TPSEGMENTO" = ?, ' + 
        ' "STALMOXARIFADO" = ? ' + 
    	' WHERE "IDSUBGRUPOEMPRESARIAL" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSSUBGRUPOEMPRESARIAL);
        pStmt.setString(2, registro.PATHIMG);
        pStmt.setString(3, registro.EEMAILFATURAMENTO);
        pStmt.setString(4, registro.NUTELFATURAMENTO);
        pStmt.setString(5, registro.EEMAILCOBRANCA);
        pStmt.setString(6, registro.NUTELCOBRANCA);
        pStmt.setString(7, registro.EEMAILFINANCEIRO);
        pStmt.setString(8, registro.NUTELFINANCEIRO);
        pStmt.setString(9, registro.EEMAILCOMPRAS);
        pStmt.setString(10, registro.EEMAILCOMPRAS2);
        pStmt.setString(11, registro.NUTELCOMPRAS);
        pStmt.setString(12, registro.EEMAILCADASTRO);
        pStmt.setString(13, registro.NUTELCADASTRO);
        pStmt.setString(14, registro.TPSEGMENTO);
        pStmt.setString(15, registro.STALMOXARIFADO);
    	pStmt.setInt(16, registro.IDSUBGRUPOEMPRESARIAL);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."SUBGRUPOEMPRESARIAL" ' +
		" ( " +
		' "IDSUBGRUPOEMPRESARIAL", ' +
        ' "DSSUBGRUPOEMPRESARIAL", ' +
        ' "PATHIMG", ' +
        ' "EEMAILFATURAMENTO", ' +
        ' "NUTELFATURAMENTO", ' +
        ' "EEMAILCOBRANCA", ' +
        ' "NUTELCOBRANCA", ' +
        ' "EEMAILFINANCEIRO", ' +
        ' "NUTELFINANCEIRO", ' +
        ' "EEMAILCOMPRAS", ' +
        ' "EEMAILCOMPRAS2", ' +
        ' "NUTELCOMPRAS", ' +
        ' "EEMAILCADASTRO", ' +
        ' "NUTELCADASTRO", ' +
        ' "TPSEGMENTO", ' +
        ' "STALMOXARIFADO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_SUBGRUPOEMPRESARIAL.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
	    pStmt.setString(1, registro.DSSUBGRUPOEMPRESARIAL);
        pStmt.setString(2, registro.PATHIMG);
        pStmt.setString(3, registro.EEMAILFATURAMENTO);
        pStmt.setString(4, registro.NUTELFATURAMENTO);
        pStmt.setString(5, registro.EEMAILCOBRANCA);
        pStmt.setString(6, registro.NUTELCOBRANCA);
        pStmt.setString(7, registro.EEMAILFINANCEIRO);
        pStmt.setString(8, registro.NUTELFINANCEIRO);
        pStmt.setString(9, registro.EEMAILCOMPRAS);
        pStmt.setString(10, registro.EEMAILCOMPRAS2);
        pStmt.setString(11, registro.NUTELCOMPRAS);
        pStmt.setString(12, registro.EEMAILCADASTRO);
        pStmt.setString(13, registro.NUTELCADASTRO);
        pStmt.setString(14, registro.TPSEGMENTO);
        pStmt.setString(15, registro.STALMOXARIFADO);
    	
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