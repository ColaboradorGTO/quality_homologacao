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

function deletaDadosVinculados(idResumoEntrada, conn){
    var idResumo = idResumoEntrada;
    var query = `UPDATE "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" SET  
         "STDIVERGENCIA" = '',
         "DSOBSERVACAODIVERGENCIA" = '',
         "QTDDIVERGENCIA" = null
    	 WHERE "IDRESUMOENTRADA" = ${idResumo}`;
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
                    
    pStmt.execute();
    conn.commit();
    
	pStmt.close();
	conn.commit();
	
}

function obterPedidosVinculados(idNotaVinculada){
    var query2 =  ' SELECT' +
        '   tbrp.IDRESUMOPEDIDO AS IDPEDIDO, ' +
        '   tbrp.IDGRUPOEMPRESARIAL AS IDGRUPOPEDIDO, ' +
        '   tbrp.IDSUBGRUPOEMPRESARIAL AS IDSUBGRUPOPEDIDO, ' +
        '   (SELECT DISTINCT DSFABRICANTE FROM "VAR_DB_NAME".FABRICANTE LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO ON FABRICANTE.IDFABRICANTE=DETALHEPEDIDO.IDFABRICANTE WHERE DETALHEPEDIDO.IDRESUMOPEDIDO=tbrp.IDRESUMOPEDIDO) AS FABRICANTE, ' +
        '   EMP.DSSUBGRUPOEMPRESARIAL AS NOFANTASIA, ' +
        '   FC.IDFUNCIONARIO AS IDCOMPRADOR, ' +
        '   FC.NOFUNCIONARIO AS NOMECOMPRADOR, ' +
        '   CDP.IDCONDICAOPAGAMENTO, ' +
        '   CDP.DSCONDICAOPAG, ' +
        '   FN.IDFORNECEDOR AS IDFORNECEDOR, ' +
        '   FN.NOFANTASIA AS NOFANTASIAFORNECEDOR, ' +
        '   FN.NORAZAOSOCIAL AS NOFORNECEDOR, ' +
        '   FN.NUCNPJ AS CNPJFORN, ' +
        '   FN.NUINSCESTADUAL AS INSCESTFORN, ' +
        '   FN.EEMAIL AS EMAILFORN, ' +
        '   FN.NUTELEFONE1 AS FONEFORN, ' +
        '   FN.EENDERECO AS ENDFORN, ' +
        '   FN.ENUMERO AS NUMEROFORN, ' +
        '   FN.ECOMPLEMENTO AS COMPFORN, ' +
        '   FN.EBAIRRO AS BAIRROFORN, ' +
        '   FN.ECIDADE AS CIDADEFORN, ' +
        '   FN.SGUF AS UFFORN, ' +
        '   FN.NUCEP AS CEPFORN, ' +
        '   TP.IDTRANSPORTADORA, ' +
        '   TP.NOFANTASIA AS NOMETRANSPORTADORA, ' +
        '   AD.IDANDAMENTO, ' +
        '   AD.DSANDAMENTO, ' +
        '   AD.DSSETOR, ' +
        '   tbrp.MODPEDIDO, ' +
        '   tbrp.NOVENDEDOR, ' +
        '   tbrp.EEMAILVENDEDOR, ' +
        '   tbrp.DTPEDIDO AS DTPEDIDONORMAL, ' +
        '   tbrp.DTPREVENTREGA, ' +
        '   TO_VARCHAR( tbrp.DTPREVENTREGA, \'YYYY-MM-DD\') AS DTPREVENTREGAFORMATADA, ' +
        '   TO_VARCHAR( tbrp.DTPREVENTREGA, \'DD-MM-YYYY HH24:MI:SS\') AS DTENTREGAFORMATADA2, ' +
        '   tbrp.TPFRETE, ' +
        '   tbrp.OBSPEDIDO, ' +
        '   tbrp.OBSPEDIDO2, ' +
        '   tbrp.DTFECHAMENTOPEDIDO, ' +
        '   TO_VARCHAR( tbrp.DTFECHAMENTOPEDIDO, \'YYYY-MM-DD\') AS DTFECHAMENTOFORMATADA, ' +
        '   tbrp.DTCADASTRO, ' +
        '   tbrp.TPARQUIVO, ' +
        '   tbrp.STDISTRIBUIDO, ' +
        '   tbrp.STAGRUPAPRODUTO, ' +
        '   TO_VARCHAR( tbrp.DTPEDIDO, \'DD-MM-YYYY HH24:MI:SS\') AS DTPEDIDO, ' + 
        '   TO_VARCHAR( tbrp.DTPEDIDO, \'YYYY-MM-DD\') AS DTPEDIDOFORMATADA, ' +
        '   IFNULL( tbrp.NUTOTALITENS,0) AS NUTOTALITENS, ' +
        '   IFNULL( tbrp.QTDTOTPRODUTOS,0) AS QTDTOTPRODUTOS, ' +
        '   IFNULL( tbrp.VRTOTALBRUTO,0) AS VRTOTALBRUTO, ' +
        '   IFNULL( tbrp.VRTOTALLIQUIDO,0) AS VRTOTALLIQUIDO, ' +
        '   IFNULL( tbrp.DESCPERC01,0) AS DESCPERC01, ' +
        '   IFNULL( tbrp.DESCPERC02,0) AS DESCPERC02, ' +
        '   IFNULL( tbrp.DESCPERC03,0) AS DESCPERC03, ' +
        '   IFNULL( tbrp.PERCCOMISSAO,0) AS PERCCOMISSAO, ' +
        '   ( tbrp.TPFISCAL) AS TPFISCAL, ' +
    	'   tbrp.STCANCELADO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".RESUMOPEDIDO tbrp ' +
        '   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL EMP ON tbrp.IDSUBGRUPOEMPRESARIAL = EMP.IDSUBGRUPOEMPRESARIAL  ' +
        '   INNER JOIN "VAR_DB_NAME".ANDAMENTOS AD ON tbrp.IDANDAMENTO = AD.IDANDAMENTO  ' +
        '   LEFT JOIN "VAR_DB_NAME".FORNECEDOR FN ON tbrp.IDFORNECEDOR = FN.IDFORNECEDOR  ' +
        '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO FC ON tbrp.IDCOMPRADOR = FC.IDFUNCIONARIO  ' +
        '   LEFT JOIN "VAR_DB_NAME".TRANSPORTADORA TP ON tbrp.IDTRANSPORTADORA = TP.IDTRANSPORTADORA  ' +
        '   INNER JOIN "VAR_DB_NAME".CONDICAOPAGAMENTO CDP ON tbrp.IDCONDICAOPAGAMENTO = CDP.IDCONDICAOPAGAMENTO  ' +
        '   INNER JOIN "VAR_DB_NAME".VINCPEDIDONOTA tbvpn ON tbvpn.IDRESUMOPEDIDO = tbrp.IDRESUMOPEDIDO  ' +
        ' WHERE ' +
        '	1 = ?';
    
    query2 = query2 + ' And  tbvpn.IDRESUMOENTRADA = \'' + idNotaVinculada + '\' ';
    query2 = query2 + ' And  tbvpn.STATIVO = True ';
    query2 = query2 + ' ORDER BY tbrp.IDRESUMOPEDIDO DESC';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    //api.responseWithQuery(query2, request, 1); 
}

function fnHandleGet(byId) {
    
    var idPedido = $.request.parameters.get("idpedido");
    var idNota = $.request.parameters.get("idnota");
    var idNotaVinculada = $.request.parameters.get("idnotavinculada");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

    var query =  `SELECT
        TBVP."IDPEDIDONOTA",
        TBVP."IDRESUMOPEDIDO",
    	TBVP."IDRESUMOENTRADA",
    	TBRE."DTCADASTRO",
    	TBRE."DEMI",
    	TBRE."EMIT_XNOME",
    	TBRE."SERIE",
    	TBRE."NNF",
    	TBVP."STATIVO"
    FROM
    	"VAR_DB_NAME"."VINCPEDIDONOTA" TBVP
    INNER JOIN "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" TBRE ON
        TBVP."IDRESUMOENTRADA" = TBRE."IDRESUMOENTRADA"
    WHERE
        TBVP."STATIVO" = 'True'
    AND
    	1 = ?`;
    
    if ( byId ) {
        query = query + ' And  TBVP.IDPEDIDONOTA = \'' + byId + '\' ';
    }
    
    if ( idPedido ) {
        query = query + ' And  TBVP.IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }
    
    if (idNota) {
        query = query + ' And  TBVP.IDRESUMOENTRADA = \'' + idNota + '\' ';
    }
    
    var request = { 
       page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    }
    
    api.responseWithQuery(query, request, 1);
    
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    
    var query = 'UPDATE "VAR_DB_NAME"."VINCPEDIDONOTA" SET ' + 
        ' "STATIVO" = ? ' +
    	' WHERE "IDRESUMOPEDIDO" =  ? AND IDRESUMOENTRADA = ?';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.STATIVO);
        pStmt.setInt(2, registro.IDRESUMOPEDIDO);
        pStmt.setInt(3, registro.IDRESUMOENTRADA);
                    
    	pStmt.execute();
    	conn.commit();
    	
    	if(registro.STATIVO == 'False'){
    	    deletaDadosVinculados(registro.IDRESUMOENTRADA, conn)
    	}
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Produto Conciliado Com Sucesso!"
	};
}

function fnHandlePost() {
    var conn = $.db.getConnection();
	var bodyJson = JSON.parse($.request.body.asString());
	var pStmt;
    
	for (var i = 0; i < bodyJson.length; i++) {
		var registro = bodyJson[i];
		
		var queryVincNFPedido = 'SELECT IDPEDIDONOTA '+
        ' FROM "VAR_DB_NAME"."VINCPEDIDONOTA" WHERE IDRESUMOPEDIDO =\''+ registro.IDRESUMOPEDIDO+'\''+
            ' AND IDRESUMOENTRADA= ?'; 
         
        var vincNFPedido = api.sqlQuery(queryVincNFPedido, registro.IDRESUMOENTRADA);
        
        if(vincNFPedido.length > 0 ){
            var idVinculo = parseInt(vincNFPedido[0]["IDPEDIDONOTA"]);
            
           
            var query2 = `UPDATE "VAR_DB_NAME"."VINCPEDIDONOTA" SET 
                 "STATIVO" = 'True'
        	     WHERE "IDPEDIDONOTA" = ${idVinculo}`;
            
            pStmt = conn.prepareStatement(api.replaceDbName(query2));
                            
            pStmt.execute();
            conn.commit();
        
        } else{
            var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDPEDIDONOTA")), 0) + 1 FROM "VAR_DB_NAME"."VINCPEDIDONOTA" WHERE 1 = ? ', 1);
            
            var query = `INSERT INTO "VAR_DB_NAME"."VINCPEDIDONOTA" 
                    	( 
                    	"IDPEDIDONOTA",
                        "IDRESUMOPEDIDO",
                    	"IDRESUMOENTRADA",
                    	"STATIVO" 
                    	)
                		VALUES(?,?,?, 'True')`;
    		
            pStmt = conn.prepareStatement(api.replaceDbName(query));
            
            pStmt.setInt(1, parseInt(queryId));
            pStmt.setInt(2, registro.IDRESUMOPEDIDO);
            pStmt.setInt(3, registro.IDRESUMOENTRADA);
    
            pStmt.execute();
            conn.commit();
	    }
	}
	
	pStmt.close();

	conn.commit();
	
	return {
	    "statusPost": "Success",
	    "msg": "Inclusão realizada com sucesso!",
	    "NotaCadastrada": registro
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