var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
//var idPromocaoTokenCredSystem = $.request.parameters.get("idPromocaoTokenCredSystem");
function fnHandleGet(byId) {
    if(!byId) {
        throw "O parametro Token é um valor obrigatório.";
    }
    //if(!idPromocaoTokenCredSystem) {
    //    throw "O parametro idPromocaoTokenCredSystem é um valor obrigatório.";
    //}
    var query = ' SELECT ' + 
    '   tbt.IDTOKENCREDSYSTEM,' +
	'   tbt.VRTOKEN,' +
    '   tbt.STATIVO,' +
    '   tbt.IDPROMOCAOTOKENCREDSYSTEM,' + 
    '   tbt.IDPOS' +
    ' FROM ' + 
    '   "VAR_DB_NAME".TOKENCREDSYSTEM tbt' +
    ' WHERE ' +
        '	1 = ? and tbt.STATIVO = \'True\'';

    if ( byId ) {
        query = query + ' And  tbt.TOKEN = \'' + byId + '\' ';
    }
    //if(idPromocaoTokenCredSystem){
	//    query = query + ' and tbt.IDPROMOCAOTOKENCREDSYSTEM = ' + idPromocaoTokenCredSystem;
	//}
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."TOKENCREDSYSTEM" SET ' + 
        ' "IDFUNCIONARIO" = ?, ' +
        ' "DTUTILIZACAO" = now(), ' +
        ' "IDVENDA" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "IDPROMOCAOTOKENCREDSYSTEM" = ? ' +
        ' WHERE "IDTOKENCREDSYSTEM" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDFUNCIONARIO);
        //pStmt.setTimestamp(2, registro.DTUTILIZACAO);
        pStmt.setString(2, registro.IDVENDA);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDPROMOCAOTOKENCREDSYSTEM);
        pStmt.setInt(5, registro.IDTOKENCREDSYSTEM);
        
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
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
        //Handle your PUT calls here
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