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
    
    var idPedido = $.request.parameters.get("idpedido");
    var idNota = $.request.parameters.get("idNota");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var IdMarca = $.request.parameters.get("idMarcaPesquisa");
    var IdFornecedor = $.request.parameters.get("idFornPesquisa");
    
    /*var query =  ' SELECT DISTINCT' +
        '   tbrp.IDRESUMOPEDIDO AS IDPEDIDO, ' +
        '   tbvp.STATIVO AS STATUSVINC, ' +
        '   tbvp.IDRESUMOENTRADA AS NOTAVINC, ' +
        '   tbrp.IDGRUPOEMPRESARIAL AS IDGRUPOPEDIDO, ' +
        '   tbrp.IDSUBGRUPOEMPRESARIAL AS IDSUBGRUPOPEDIDO, ' +
        '   (SELECT FIRST_VALUE(FABRICANTE.DSFABRICANTE ORDER BY FABRICANTE.IDFABRICANTE ) FROM "VAR_DB_NAME".FABRICANTE LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO ON FABRICANTE.IDFABRICANTE=DETALHEPEDIDO.IDFABRICANTE WHERE DETALHEPEDIDO.IDRESUMOPEDIDO=tbrp.IDRESUMOPEDIDO) AS FABRICANTE, ' +
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
        '   LEFT JOIN "VAR_DB_NAME".VINCPEDIDONOTA tbvp ON tbvp.IDRESUMOPEDIDO = tbrp.IDRESUMOPEDIDO AND tbvp.STATIVO =\'False\'' +
        '   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL EMP ON tbrp.IDSUBGRUPOEMPRESARIAL = EMP.IDSUBGRUPOEMPRESARIAL  ' +
        '   INNER JOIN "VAR_DB_NAME".ANDAMENTOS AD ON tbrp.IDANDAMENTO = AD.IDANDAMENTO  ' +
        '   LEFT JOIN "VAR_DB_NAME".FORNECEDOR FN ON tbrp.IDFORNECEDOR = FN.IDFORNECEDOR  ' +
        '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO FC ON tbrp.IDCOMPRADOR = FC.IDFUNCIONARIO  ' +
        '   LEFT JOIN "VAR_DB_NAME".TRANSPORTADORA TP ON tbrp.IDTRANSPORTADORA = TP.IDTRANSPORTADORA  ' +
        '   INNER JOIN "VAR_DB_NAME".CONDICAOPAGAMENTO CDP ON tbrp.IDCONDICAOPAGAMENTO = CDP.IDCONDICAOPAGAMENTO  ' +
        ' WHERE ' +
        '	1 = ? AND tbvp.IDRESUMOPEDIDO IS NULL';*/
        
        let query = `
            SELECT DISTINCT 
                TBRP.IDRESUMOPEDIDO AS IDPEDIDO,
                TBG.DSGRUPOEMPRESARIAL AS NOFANTASIA,
                TBFUN.NOFUNCIONARIO AS NOMECOMPRADOR,
                TBF.NOFANTASIA AS NOFANTASIAFORNECEDOR,
                TBF.NORAZAOSOCIAL AS NOFORNECEDOR,
                (SELECT FIRST_VALUE(FABRICANTE.DSFABRICANTE ORDER BY FABRICANTE.IDFABRICANTE ) FROM "VAR_DB_NAME".FABRICANTE LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO ON FABRICANTE.IDFABRICANTE=DETALHEPEDIDO.IDFABRICANTE WHERE DETALHEPEDIDO.IDRESUMOPEDIDO=tbrp.IDRESUMOPEDIDO) AS FABRICANTE,
                TBRP.VRTOTALLIQUIDO,
                TO_VARCHAR(TBRP.DTPEDIDO, 'DD/MM/YYYY HH24:MI:SS') AS DTPEDIDO,
                TBVP.STATIVO 
            FROM
                "VAR_DB_NAME".RESUMOPEDIDO TBRP
            INNER JOIN "VAR_DB_NAME".FORNECEDOR TBF ON 
                TBRP.IDFORNECEDOR = TBF.IDFORNECEDOR
            INNER JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBG ON
                TBRP.IDGRUPOEMPRESARIAL = TBG.IDGRUPOEMPRESARIAL
            LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFUN ON 
                TBRP.IDCOMPRADOR = TBFUN.IDFUNCIONARIO 
            LEFT JOIN "VAR_DB_NAME".VINCPEDIDONOTA TBVP ON 
                TBRP.IDRESUMOPEDIDO = TBVP.IDRESUMOPEDIDO
            WHERE
                1 = ? AND TBRP.STCANCELADO = 'False' AND TBVP.IDPEDIDONOTA IS NULL OR TBVP.STATIVO = 'False'
        `;
    if ( byId ) {
        query = query + ' And  tbrp.IDRESUMOPEDIDO = \'' + byId + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  tbrp.IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }
    if ( IdMarca ) {
        query = query + ' And  tbrp.IDSUBGRUPOEMPRESARIAL = \'' + IdMarca + '\' ';
    }
    if ( IdFornecedor ) {
        query = query + ' And  tbrp.IDFORNECEDOR = \'' + IdFornecedor + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
        query = query + ' AND (tbrp.DTPEDIDO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    if(idNota){
        query += ` AND TBVP.IDRESUMOENTRADA = ${idNota} `;
    }
    
    query = query + ' ORDER BY tbrp.IDRESUMOPEDIDO DESC'
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1); 
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    
    var idResPedido = $.request.parameters.get("idrespedido");
    
    	var querydetpedido = ' SELECT COUNT(DETPED.IDDETALHEPEDIDO) TOTALITENS, SUM(DETPED.QTDTOTAL) QTDTOTAL, SUM(DETPED.VRTOTAL) VRTOTAL' +
		' FROM  ' +
		'   "VAR_DB_NAME".DETALHEPEDIDO  DETPED' +
		'  WHERE  ' +
		'   DETPED.IDRESUMOPEDIDO = ?  ';

	var linha2 = api.sqlQuery(querydetpedido, idResPedido);
	var det2 = linha2[0];
   
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOPEDIDO" SET ' + 
        ' "NUTOTALITENS" = ?, ' + 
        ' "QTDTOTPRODUTOS" =  ?, ' + 
        ' "VRTOTALBRUTO" =  ?, ' + 
        ' "VRTOTALLIQUIDO" =  ? ' + 
        ' WHERE "IDRESUMOPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));

        pStmt.setInt(1, parseInt(det2.TOTALITENS));
        pStmt.setFloat(2, parseFloat(det2.QTDTOTAL));
        pStmt.setFloat(3, parseFloat(det2.VRTOTAL));
        pStmt.setFloat(4, parseFloat(det2.VRTOTAL));
        pStmt.setInt(5, parseInt(idResPedido));
        
    	pStmt.execute();

	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOPEDIDO" ' +
		" ( " +
		    ' "IDRESUMOPEDIDO", ' +
    		' "IDGRUPOEMPRESARIAL", ' +
            ' "IDSUBGRUPOEMPRESARIAL", ' +
            ' "IDCOMPRADOR", ' +
            ' "IDCONDICAOPAGAMENTO", ' +
            ' "IDFORNECEDOR", ' +
            ' "IDTRANSPORTADORA", ' +
            ' "IDANDAMENTO", ' +
            ' "MODPEDIDO", ' +
            ' "NOVENDEDOR", ' +
            ' "EEMAILVENDEDOR", ' +
            ' "DTPEDIDO", ' +
            ' "DTPREVENTREGA", ' +
            ' "TPFRETE", ' +
            ' "OBSPEDIDO", ' +
            ' "OBSPEDIDO2", ' +
            ' "DTFECHAMENTOPEDIDO", ' +
            ' "DTCADASTRO", ' +
            ' "TPARQUIVO", ' +
            ' "STDISTRIBUIDO", ' +
            ' "STAGRUPAPRODUTO", ' +
            ' "STCANCELADO", ' + 
            ' "TPFISCAL" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_RESUMOPEDIDO.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

   
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
                
        pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDCOMPRADOR);
        pStmt.setInt(4, registro.IDCONDICAOPAGAMENTO);
        pStmt.setString(5, registro.IDFORNECEDOR);
        setIntOrNull(pStmt,6, registro.IDTRANSPORTADORA);
        pStmt.setInt(7, registro.IDANDAMENTO);
        pStmt.setString(8, registro.MODPEDIDO);
        pStmt.setString(9, registro.NOVENDEDOR);
        pStmt.setString(10, registro.EEMAILVENDEDOR);
        pStmt.setDate(11, registro.DTPEDIDO);
        pStmt.setDate(12, registro.DTPREVENTREGA);
        pStmt.setString(13, registro.TPFRETE);
        pStmt.setString(14, registro.OBSPEDIDO);
        pStmt.setString(15, registro.OBSPEDIDO2);
        pStmt.setDate(16, registro.DTFECHAMENTOPEDIDO);
        pStmt.setDate(17, registro.DTCADASTRO);
        pStmt.setString(18, registro.TPARQUIVO);
        pStmt.setString(19, registro.STDISTRIBUIDO);
        pStmt.setString(20, registro.STAGRUPAPRODUTO);
        pStmt.setString(21, registro.STCANCELADO);
        pStmt.setString(22, registro.TPFISCAL);
    	
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