var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."MOVIMENTOCAIXA" SET ' + 
        ' "TXT_OBS" = ?, ' +
        ' "VRAJUSTDINHEIRO" = ?, ' +
        ' "VRAJUSTTEF" = ?, ' +
        ' "VRAJUSTPOS" = ?, ' +
        ' "VRAJUSTCONVENIO" = ?, ' +
        ' "VRAJUSTVOUCHER" = ?, ' +
        ' "VRAJUSTFATURA" = ?, ' +
        ' "VRAJUSTPIX" = ? ,' +
        ' "VRAJUSTPL" = ? , ' +
        ' "VRQUEBRACAIXA" = ? ' +
        ' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var registro = JSON.parse($.request.body.asString()); 

    pStmt.setString(1, registro.TXT_OBS);
    pStmt.setFloat(2, registro.VRAJUSTDINHEIRO);
    pStmt.setFloat(3, registro.VRAJUSTTEF);
    pStmt.setFloat(4, registro.VRAJUSTPOS);
    pStmt.setFloat(5, registro.VRAJUSTCONVENIO);
    pStmt.setFloat(6, registro.VRAJUSTVOUCHER);
    pStmt.setFloat(7, registro.VRAJUSTFATURA);
    pStmt.setFloat(8, registro.VRAJUSTPIX);
    pStmt.setFloat(9, registro.VRAJUSTPL);
    pStmt.setFloat(10, registro.VRQUEBRACAIXA);
    pStmt.setString(11, registro.ID);
    
	pStmt.execute();
    
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
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