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
    var idContaPag = $.request.parameters.get("idcontapag");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var IdMarca = $.request.parameters.get("idMarcaPesquisa");
    var IdFornecedor = $.request.parameters.get("idFornPesquisa");

    var query =  ' SELECT ' +
        '   CP.IDCONTAPAGAR, ' +
        '   CP.IDGRUPOEMPRESARIAL, ' +
        '   CP.IDSUBGRUPOEMPRESARIAL, ' +
        '   SUBEMP.DSSUBGRUPOEMPRESARIAL, ' +
        '   CP.IDEMPRESAPAGADORA, ' +
        '   EMP.NOFANTASIA AS NOEMPESAPAG, ' +
        '   CP.TPCONTA, ' +
        '   CP.IDRESUMOENTRADANFE, ' +
        '   CP.IDRESUMOPEDIDO, ' +
        '   CP.IDFORNECEDOR, ' +
        '   FN.NOFANTASIA AS NOFORNECEDOR, ' +
        '   CP.IDCATEGORIADESP, ' +
        '   CD.DSCATEGORIA, ' +
        '   RP.MODPEDIDO, ' +
        '   CP.IDANDAMENTO, ' +
        '   AD.DSANDAMENTO, ' +
        '   CP.DSDESCRICAOCONTA, ' +
        '   CP.NOBENEFICIARIO, ' +
        '   TO_VARCHAR( RP.DTPEDIDO, \'DD-MM-YYYY\') AS DTPEDIDOFORMATADA, ' +
        '   TO_VARCHAR( RP.DTPREVENTREGA, \'DD-MM-YYYY\') AS DTPREVENTREGAFORMATADA, ' +
        '   CP.DTCADASTRO, ' +
        '   TO_VARCHAR( CP.DTCADASTRO, \'DD-MM-YYYY\') AS DTCADASTROFORMATADA, ' +
        '   CP.DTCOMPETENCIA, ' +
        '   TO_VARCHAR( CP.DTCOMPETENCIA, \'DD-MM-YYYY\') AS DTCOMPETENCIAFORMATADA, ' +
        '   CP.DTVENCIMENTO, ' +
        '   TO_VARCHAR( CP.DTVENCIMENTO, \'DD-MM-YYYY\') AS DTVENCIMENTOFORMATADA, ' +
        '   CP.VRNOMINAL, ' +
        '   CP.VRDESCONTO, ' +
        '   CP.VRJUROS, ' +
        '   CP.VRMULTA, ' +
        '   CP.VROUTROS, ' +
        '   CP.VRTOTALLIQUIDO, ' +
        '   CP.DSFORMAPAGCONTA, ' +
        '   CP.NUVEZESPARCELA, ' +
        '   CP.QTDDIASPAGAMENTO, ' +
        '   CP.DTPAGAMENTO, ' +
        '   CP.VRPAGO, ' +
        '   CP.NUDOCORIGEM, ' +
        '   CP.STCHEQUEPRE, ' +
        '   CP.NUCHEQUE, ' +
        '   CP.DTCHEQUECOMP, ' +
        '   CP.OBSERVACAOPAGAMENTO, ' +
        '   CP.STCONCLUIDO, ' +
        '   CP.STCONCILIADO, ' +
        '   CP.STCANCELADO, ' +
        '   CP.DTULTALTERACAO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".CONTASPAGAR CP ' +
        '   INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO RP ON CP.IDRESUMOPEDIDO = RP.IDRESUMOPEDIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA EMP ON CP.IDEMPRESAPAGADORA = EMP.IDEMPRESA  ' +
        '   INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL SUBEMP ON CP.IDSUBGRUPOEMPRESARIAL = SUBEMP.IDSUBGRUPOEMPRESARIAL  ' +
        '   INNER JOIN "VAR_DB_NAME".FORNECEDOR FN ON CP.IDFORNECEDOR = FN.IDFORNECEDOR  ' +
        '   INNER JOIN "VAR_DB_NAME".CATEGORIARECEITADESPESA CD ON CP.IDCATEGORIADESP = CD.IDCATEGORIARECDESP  ' +
        '   INNER JOIN "VAR_DB_NAME".ANDAMENTOS AD ON CP.IDANDAMENTO = AD.IDANDAMENTO  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND CP.STCANCELADO = \'False\' ';
    if ( byId ) {
        query = query + ' And  CP.IDCONTAPAGAR = \'' + byId + '\' ';
    }
    if ( idContaPag ) {
        query = query + ' And  CP.IDCONTAPAGAR = \'' + idContaPag + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  CP.IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }
    if ( IdMarca ) {
        query = query + ' And  CP.IDSUBGRUPOEMPRESARIAL = \'' + IdMarca + '\' ';
    }
    if ( IdFornecedor ) {
        query = query + ' And  CP.IDFORNECEDOR = \'' + IdFornecedor + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (CP.DTCADASTRO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CONTASPAGAR" SET ' + 
                ' "IDEMPRESAPAGADORA"=  ?, ' + 
                ' "TPCONTA"=  ?, ' + 
                ' "IDRESUMOENTRADANFE"=  ?, ' + 
                ' "IDRESUMOPEDIDO"=  ?, ' + 
                ' "IDFORNECEDOR"=  ?, ' + 
                ' "IDCATEGORIADESP"=  ?, ' + 
                ' "IDANDAMENTO"=  ?, ' + 
                ' "DSDESCRICAOCONTA"=  ?, ' + 
                ' "NOBENEFICIARIO"=  ?, ' + 
                ' "DTCADASTRO"=  ?, ' + 
                ' "DTCOMPETENCIA"=  ?, ' + 
                ' "DTVENCIMENTO"=  ?, ' + 
                ' "VRNOMINAL"=  ?, ' + 
                ' "VRDESCONTO"=  ?, ' + 
                ' "VRJUROS"=  ?, ' + 
                ' "VRMULTA"=  ?, ' + 
                ' "VROUTROS"=  ?, ' + 
                ' "VRTOTALLIQUIDO"=  ?, ' + 
                ' "DSFORMAPAGCONTA"=  ?, ' + 
                ' "NUVEZESPARCELA"=  ?, ' + 
                ' "QTDDIASPAGAMENTO"=  ?, ' + 
                ' "DTPAGAMENTO"=  ?, ' + 
                ' "VRPAGO"=  ?, ' + 
                ' "NUDOCORIGEM"=  ?, ' + 
                ' "STCHEQUEPRE"=  ?, ' + 
                ' "NUCHEQUE"=  ?, ' + 
                ' "DTCHEQUECOMP"=  ?, ' + 
                ' "OBSERVACAOPAGAMENTO"=  ?, ' + 
                ' "STCONCLUIDO"=  ?, ' + 
                ' "STCONCILIADO"=  ?, ' + 
                ' "STCANCELADO"=  ?, ' + 
                ' "DTULTALTERACAO"=  ? ' +
        ' WHERE "IDCONTAPAGAR" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
           
        pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDEMPRESAPAGADORA);
        pStmt.setInt(4, registro.TPCONTA);
        pStmt.setInt(5, registro.IDRESUMOENTRADANFE);
        pStmt.setInt(6, registro.IDRESUMOPEDIDO);
        pStmt.setInt(7, registro.IDFORNECEDOR);
        pStmt.setInt(8, registro.IDCATEGORIADESP);
        pStmt.setInt(9, registro.IDANDAMENTO);
        pStmt.setString(10, registro.DSDESCRICAOCONTA);
        pStmt.setString(11, registro.NOBENEFICIARIO);
        pStmt.setDate(12, registro.DTCADASTRO);
        pStmt.setDate(13, registro.DTCOMPETENCIA);
        pStmt.setDate(14, registro.DTVENCIMENTO);
        pStmt.setFloat(15, registro.VRNOMINAL);
        pStmt.setFloat(16, registro.VRDESCONTO);
        pStmt.setFloat(17, registro.VRJUROS);
        pStmt.setFloat(18, registro.VRMULTA);
        pStmt.setFloat(19, registro.VROUTROS);
        pStmt.setFloat(20, registro.VRTOTALLIQUIDO);
        pStmt.setString(21, registro.DSFORMAPAGCONTA);
        pStmt.setInt(22, registro.NUVEZESPARCELA);
        pStmt.setInt(23, registro.QTDDIASPAGAMENTO);
        pStmt.setDate(24, registro.DTPAGAMENTO);
        pStmt.setFloat(25, registro.VRPAGO);
        pStmt.setString(26, registro.NUDOCORIGEM);
        pStmt.setString(27, registro.STCHEQUEPRE);
        pStmt.setString(28, registro.NUCHEQUE);
        pStmt.setDate(29, registro.DTCHEQUECOMP);
        pStmt.setString(30, registro.OBSERVACAOPAGAMENTO);
        pStmt.setString(31, registro.STCONCLUIDO);
        pStmt.setString(32, registro.STCONCILIADO);
        pStmt.setString(33, registro.STCANCELADO);
        pStmt.setDate(34, registro.DTULTALTERACAO);
        pStmt.setInt(35, registro.IDCONTAPAGAR);
        
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
  
    var query = 'INSERT INTO "VAR_DB_NAME"."CONTASPAGAR" ' + 
		" ( " +
                ' "IDCONTAPAGAR", ' +
                ' "IDGRUPOEMPRESARIAL", ' +
                ' "IDSUBGRUPOEMPRESARIAL", ' +
                ' "IDEMPRESAPAGADORA", ' +
                ' "TPCONTA", ' +
                ' "IDRESUMOPEDIDO", ' +
                ' "IDFORNECEDOR", ' +
                ' "IDCATEGORIADESP", ' +
                ' "IDANDAMENTO", ' +
                ' "DSDESCRICAOCONTA", ' +
                ' "NOBENEFICIARIO", ' +
                ' "DTCADASTRO", ' +
                ' "DTCOMPETENCIA", ' +
                ' "DTVENCIMENTO", ' +
                ' "VRNOMINAL", ' +
                ' "VRDESCONTO", ' +
                ' "VRJUROS", ' +
                ' "VRMULTA", ' +
                ' "VROUTROS", ' +
                ' "VRTOTALLIQUIDO", ' +
                ' "DSFORMAPAGCONTA", ' +
                ' "NUVEZESPARCELA", ' +
                ' "QTDDIASPAGAMENTO", ' +
                ' "VRPAGO", ' +
                ' "NUDOCORIGEM", ' +
                ' "OBSERVACAOPAGAMENTO", ' +
                ' "STCONCLUIDO", ' +
                ' "STCONCILIADO", ' +
                ' "STCANCELADO", ' +
                ' "DTULTALTERACAO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?,0,0,0,0,?,?,?,?,0,?,?,?,?,?,NOW())';

  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
		
		
	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		
		for (var j = 0; j < registro.DETALHEPEDPAG.length; j++) { 
		
            var queryId2 = 'SELECT IFNULL(MAX(TO_INT("IDCONTAPAGAR")),0) FROM "VAR_DB_NAME"."CONTASPAGAR" WHERE 1 = ? ';
            var IdContaPagar = api.executeScalar(queryId2,1);
            
    		var queryCodResPed = 'SELECT DISTINCT IDRESUMOPEDIDO AS IDRESPED '+
            ' FROM "VAR_DB_NAME"."CONTASPAGAR" WHERE IDRESUMOPEDIDO= ? ';
            
            var CodResPedi = api.sqlQuery(queryCodResPed,registro.IDRESUMOPEDIDO);
            
            if(CodResPedi.length >0 ){
                    return {
                	    "msg": "Pedido Já está Cadastrado no Financeiro"
                	};
            }else{
                    
                pStmt.setInt(1,IdContaPagar);    
                pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);   
                pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
                pStmt.setInt(4, registro.IDEMPRESAPAGADORA);
                pStmt.setString(5, registro.TPCONTA);
                pStmt.setInt(6, registro.IDRESUMOPEDIDO);
                pStmt.setInt(7, registro.IDFORNECEDOR);
                pStmt.setInt(8, registro.IDCATEGORIADESP);
                pStmt.setInt(9, registro.IDANDAMENTO);
                pStmt.setString(10, registro.DSDESCRICAOCONTA);
                pStmt.setString(11, registro.NOBENEFICIARIO);
                pStmt.setDate(12, registro.DTCOMPETENCIA);
                pStmt.setDate(13, registro.DETALHEPEDPAG[j].finalparcelaformat);
                pStmt.setFloat(14, registro.DETALHEPEDPAG[j].valorresultPedido);
                pStmt.setFloat(15, registro.DETALHEPEDPAG[j].valorresultPedido);
                pStmt.setString(16, registro.DSFORMAPAGCONTA);
                pStmt.setInt(17, registro.DETALHEPEDPAG[j].nuvezparc);
                pStmt.setInt(18, registro.DETALHEPEDPAG[j].qtddiaspag);
                pStmt.setString(19, registro.NUDOCORIGEM);
                pStmt.setString(20, registro.OBSERVACAOPAGAMENTO);
                pStmt.setString(21, registro.STCONCLUIDO);
                pStmt.setString(22, registro.STCONCILIADO);
                pStmt.setString(23, registro.STCANCELADO);
            	
                pStmt.execute();
            }
        
		}
	}

	pStmt.close();

	conn.commit();

    return {
	    "msg": "Inclusão da Conta realizada com sucesso!"
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