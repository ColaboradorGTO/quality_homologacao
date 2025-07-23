var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbcv.ID,' +
    '   tbcv.IDCAIXAWEB,' +
	'   tbcv.VERSAO, ' +
	'   tbcv.DTVERSAO, ' +
	'   tbcv.IDUSUARIO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CAIXA_VERSAO tbcv ' +
    ' WHERE ' +
    '	1 = ? ';
    
    if ( byId ) {
        query = query + ' And tbcv.ID = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnAtualizaTipoTefCaixa(idCaixaWeb, DsTipoTef, vsSistema, conn){
    var query = 'UPDATE "VAR_DB_NAME"."CAIXA" SET ' +
		' "TIPOTEF" = ?, ' +
		' "VSSISTEMA" = ? ' +
		' WHERE "IDCAIXAWEB" =  ? ';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

		pStmt.setString(1, DsTipoTef);
		pStmt.setString(2, vsSistema);
		pStmt.setInt(3, idCaixaWeb);

		pStmt.execute();
	
	pStmt.close();

	conn.commit();

	

}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CAIXA_VERSAO" ' +
		" ( " +
		' "ID", ' +
		' "IDCAIXAWEB", ' +
		' "VERSAO", ' +
		' "DTVERSAO", ' + 
    	' "IDUSUARIO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_CAIXA_VERSAO.NEXTVAL,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var queryExiste = 'SELECT Count(1) FROM "VAR_DB_NAME"."CAIXA_VERSAO" WHERE IDCAIXAWEB= ? AND VERSAO= \'' + registro.VERSAO + '\'';
		var res = api.executeScalar(queryExiste, registro.IDCAIXAWEB);
		
		if(res === 0) {
		    pStmt.setInt(1, registro.IDCAIXAWEB);
    		pStmt.setString(2, registro.VERSAO);
            pStmt.setDate(3, new Date().toJSON());
            pStmt.setInt(4, registro.IDUSUARIO);
        	
        	pStmt.execute();
        	
        	if(registro.TIPOTEF){
        	    fnAtualizaTipoTefCaixa(registro.IDCAIXAWEB, registro.TIPOTEF, registro.VSSISTEMA, conn);
        	}
		}
		
	}

	pStmt.close();

	conn.commit();
    return {
	    "msg": "Operação realizada com sucesso!"
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