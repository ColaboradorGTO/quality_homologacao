var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {

    var idImgProd = $.request.parameters.get("idImgProd");
    var NuRefImgProd = $.request.parameters.get("NuRefImgProd");
    var IdFabricante = $.request.parameters.get("IDFabImagem");
    var IdSubEst = $.request.parameters.get("IDSubEstImagem");
    var idPedido = $.request.parameters.get("idPedido");
    
    var query = `
        SELECT 
            A.IDIMAGEM, 
            A.IDRESUMOPEDIDO, 
            A.NUREF, 
            CAST(BINTOSTR(CAST(A.IMAGEM AS BINARY)) AS VARCHAR) AS IMAGEM, 
            A.DTINCLUSAO, 
            TO_VARCHAR(A.DTINCLUSAO, 'DD/MM/YYYY HH24:MI:SS') AS DTINCLUSAOFORMAT, 
            A.STATIVO 
        FROM 
            "VAR_DB_NAME".TBIMAGEM A 
        WHERE 
            1 = ? 
            AND A.STATIVO = 'True'
    `;
    
    if(idImgProd){
        query = query + ' And  A.IDIMAGEM IN ( ' + idImgProd + ')  ';
    }
    
    if ( byId ) {
         query = query + ' And  A.IDIMAGEM = \'' + byId + '\' ';
    }

    if ( NuRefImgProd ) {
        
        query = query + ' And  A.NUREF = \'' + NuRefImgProd + '\' ';
        
    }
    
    if ( idPedido ) {
        query += ` AND A.IDRESUMOPEDIDO = '${idPedido}' `;
    }
    
    if ( IdFabricante ) {
        query += `
            AND A.IDIMAGEM IN
                (
                    SELECT DISTINCT
                        IDIMAGEM
                    FROM
                        "VAR_DB_NAME".TBIMAGEMPRODUTO 
                    WHERE 
                        IDFABRICANTE = ${IdFabricante} AND STATIVO = 'True'
                )
        `;
    }
    
    if ( IdSubEst ) {
        query += `
            AND A.IDIMAGEM IN
                (
                    SELECT DISTINCT
                        IDIMAGEM
                    FROM
                        "VAR_DB_NAME".TBIMAGEMPRODUTO 
                    WHERE 
                        IDSUBGRUPOESTRUTURA = ${IdSubEst} AND STATIVO = 'True'
                )
        `;
    }
    
    query = query + ' ORDER BY A.DTINCLUSAO, A.IDRESUMOPEDIDO, A."NUREF" ';

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  ($.request.parameters.get("pageSize") || 5)
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."TBIMAGEM" SET ' + 
        ' "IDRESUMOPEDIDO" = ?, ' +
        ' "NUREF" = ?, ' +
        ' "IMAGEM" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDIMAGEM" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		
		if(registro.IDRESUMOPEDIDO){
            let queryPedido = `
                SELECT * FROM "VAR_DB_NAME".RESUMOPEDIDO WHERE STCANCELADO = 'False' AND IDRESUMOPEDIDO = ?
            `;
            
            let regPedido = api.sqlQuery(queryPedido, registro.IDRESUMOPEDIDO)
            
            if(!regPedido.length){
                throw 'Pedido inexistente ou cancelado.'
            }
		}
		
		setIntOrNull(pStmt, 1, registro.IDRESUMOPEDIDO);
        pStmt.setString(2, registro.NUREF);
        pStmt.setString(3, registro.IMAGEM);
        pStmt.setString(4, registro.STATIVO);
        pStmt.setInt(5, parseInt(registro.IDIMAGEM));
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDIMAGEM")),0) + 1 FROM "VAR_DB_NAME"."TBIMAGEM" WHERE 1 = ? ';

    var query = `
        INSERT INTO 
            "VAR_DB_NAME"."TBIMAGEM"
		(
            "IDIMAGEM",
            "IDRESUMOPEDIDO",
            "NUREF",
            "IMAGEM",
            "DTINCLUSAO",
            "STATIVO"
    	)
		VALUES(?,?,?,?,now(),'True') `;
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		//if(registro.IDRESUMOPEDIDO){
            let queryPedido = `
                SELECT * FROM "VAR_DB_NAME".RESUMOPEDIDO WHERE STCANCELADO = 'False' AND IDRESUMOPEDIDO = ?
            `;
            
            let regPedido = api.sqlQuery(queryPedido, registro.IDRESUMOPEDIDO)
            
            if(!regPedido.length){
                throw new Error('Pedido inexistente ou cancelado.')
            }
		//}
		
		var IdImagemProd = api.executeScalar(queryId,1);
          
		pStmt.setInt(1, parseInt(IdImagemProd));
		setIntOrNull(pStmt, 2, registro.IDRESUMOPEDIDO);
        pStmt.setString(3, registro.NUREF); 
        pStmt.setString(4, registro.IMAGEM);
       // pStmt.setString(5, registro.STATIVO);
    	
        pStmt.execute();
        
        //////////INSERIR VINCULO PRODUTO IMAGEM//////////////////////

        var queryInsertImagemProduto = 'INSERT INTO "VAR_DB_NAME"."TBIMAGEMPRODUTO" ' +
    		" ( " +
    		' "IDIMAGEMPRODUTO", ' +
    		' "IDIMAGEM", ' +
    		' "IDPRODUTO", ' +
    		' "IDFORNECEDOR", ' +
    		' "IDFABRICANTE", ' +
    		' "IDSUBGRUPOESTRUTURA", ' +
            ' "DTINCLUSAO", ' +
            ' "STATIVO" ' +
        	' ) ' +
    		' VALUES(?,?,?,?,?,?,now(),?) ';
        
        var pStmt2 = conn.prepareStatement(api.replaceDbName(queryInsertImagemProduto));
        var queryIdVinculo = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDIMAGEMPRODUTO")),0) + 1 FROM "VAR_DB_NAME"."TBIMAGEMPRODUTO" WHERE 1 = ? ', 1);
        
        for (var j = 0; j < registro.IDPRODIMAGEM.length; j++) {
		 
            pStmt2.setInt(1,parseInt(queryIdVinculo));
            pStmt2.setInt(2, parseInt(IdImagemProd));
            pStmt2.setString(3, registro.IDPRODIMAGEM[j].IDProduto);
            pStmt2.setInt(4, registro.IDPRODIMAGEM[j].IDForProduto);
            pStmt2.setInt(5, registro.IDPRODIMAGEM[j].IDFabProduto);
            pStmt2.setInt(6, registro.IDPRODIMAGEM[j].IDSubEstrutProduto);
            pStmt2.setString(7, registro.STATIVO);
        	
            pStmt2.execute();
            
            queryIdVinculo = queryIdVinculo + 1;
		}
        
	    pStmt2.close();
        
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