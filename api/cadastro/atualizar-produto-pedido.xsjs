var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' + 
            ' "DSTAMANHO"=  ?, ' + 
            ' "NUNCM"=  ?, ' +  
            ' "DSPRODUTO"=  ?, ' + 
            ' "QTDPRODUTO"=  ?, ' + 
            ' "VRCUSTO"=  ?, ' + 
            ' "VRVENDA"=  ?, ' + 
            ' "VRTOTALCUSTO"=  ?, ' + 
            ' "DTULTATUALIZACAO"=  ?, ' +
            ' "QTDESTOQUEIDEAL" =  ? ' + 
        ' WHERE "IDDETALHEPRODUTOPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

	for (var i = 0; i < bodyJson.length; i++) {
	    	var registro = bodyJson[i];
	
		for (var j = 0; j < registro.DETALHEPRODUTOS.length; j++) {
		    
            pStmt.setString(1, registro.DETALHEPRODUTOS[j].tamanhoDet);
            pStmt.setString(2, registro.DETALHEPRODUTOS[j].ncmDet);
            pStmt.setString(3, registro.DETALHEPRODUTOS[j].dsprodutoDet);
            pStmt.setInt(4, registro.DETALHEPRODUTOS[j].quantidadeDet);
            pStmt.setFloat(5, registro.DETALHEPRODUTOS[j].vrcustoDet);
            pStmt.setFloat(6, registro.DETALHEPRODUTOS[j].vrvendasDet);
            pStmt.setFloat(7, registro.DETALHEPRODUTOS[j].vrtotalDet);
            pStmt.setDate(8, registro.DTULTATUALIZACAO);
            pStmt.setInt(9, registro.DETALHEPRODUTOS[j].qtdestDet);
            pStmt.setInt(10, registro.IDDETALHEPRODUTOPEDIDO);
        	
            pStmt.execute();
        
		}
	}
    
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