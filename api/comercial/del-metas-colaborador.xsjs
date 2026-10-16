var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."METASCOLABORADORES" SET ' +
        ' "DSMOTIVOCANCELAMENTO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "DTCANCELAMENTO" = now() ' +
        ' WHERE "IDMETASCOLABORADOR" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 

    pStmt.setString(1, registro.DSMOTIVOCANCELAMENTO);
    pStmt.setString(2, registro.STATIVO);
    pStmt.setInt(3, registro.IDMETASCOLABORADOR);
    
	pStmt.execute();
    conn.commit();
    
	var queryDadosMeta = 'SELECT COUNT(IDMETASCOLABORADOR) AS QTDCOLAB, VRMETAVENDAGERAL, PERCMETAVENDAGERAL '+
    ' FROM "VAR_DB_NAME"."METASCOLABORADORES" WHERE IDMETASLOJA = ? AND NOSECAO = \'' + registro.NOSECAO + '\' AND STATIVO = \'True\' GROUP BY VRMETAVENDAGERAL, PERCMETAVENDAGERAL';
    
    var dadosMetas = api.sqlQuery(queryDadosMeta,registro.IDMETASLOJA);
    
    var countmetas = parseInt(dadosMetas[0].QTDCOLAB);
    var vrmetas = parseFloat(dadosMetas[0].VRMETAVENDAGERAL);
    var percmetas = parseFloat(dadosMetas[0].PERCMETAVENDAGERAL);
    
    var novovrmeta = vrmetas/countmetas;
    var novopercmeta = percmetas/countmetas;
    
    var queryAtualizaMetas = 'UPDATE "VAR_DB_NAME"."METASCOLABORADORES" SET ' + 
    ' "VRMETACOLABORADOR" =  ?, ' +
    ' "PERCMETACOLABORADOR" =  ? ' +
    ' WHERE "IDMETASLOJA" =  ? AND NOSECAO = \'' + registro.NOSECAO + '\' AND STATIVO = \'True\' ';
    
    var pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaMetas));
    
    pStmt2.setFloat(1, novovrmeta);
    pStmt2.setFloat(2, novopercmeta);
    pStmt2.setInt(3, registro.IDMETASLOJA);
    pStmt2.execute();
    pStmt2.close();
    conn.commit();    
    
	pStmt.close();
	
	return {
	    "msg": "Metas Atualizadas!"
	};
}

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}