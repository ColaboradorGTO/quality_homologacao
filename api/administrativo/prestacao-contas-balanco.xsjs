var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

// Bloco Fecha Balanço
function fnBlocoFechaBalanco(alista, pIdResumoBalanco, pDataAbertura){
    
    var conn1 = $.db.getConnection();
    
    try{
        for (var i = 0; i < alista.length; i++) {

        	var cIdProduto	 = alista[i].IDPRODUTO.toString();
            var nQtdContagem = alista[i].QTD;
            var nIdEmpresa	 = alista[i].IDEMPRESA;

            var qryUpdInv = 'UPDATE "VAR_DB_NAME".INVENTARIOMOVIMENTO SET ' +
                ' STATIVO = \'False\', DTBALANCO = \'' + pDataAbertura + '\' ' +
            	'WHERE IDEMPRESA =  ? ' +
            	'AND IDPRODUTO = \'' + cIdProduto + '\' ' +
            	'AND STATIVO = \'True\' ';
            var updateStmt = conn1.prepareStatement(api.replaceDbName(qryUpdInv));
    
            updateStmt.setInt(1, nIdEmpresa);

            updateStmt.execute();
            
            var qryInsInv = 'INSERT INTO "VAR_DB_NAME".INVENTARIOMOVIMENTO ( ' +
		        ' IDINVMOVIMENTO, IDEMPRESA, DTMOVIMENTO, IDPRODUTO, QTDINICIO, QTDENTRADA, QTDENTRADAVOUCHER, QTDSAIDA, QTDSAIDATRANSFERENCIA, ' +
		        ' QTDRETORNOAJUSTEPEDIDO, QTDFINAL, QTDAJUSTEBALANCO, STATIVO) ' +
		        ' VALUES("VAR_DB_NAME".SEQ_INVENTARIOMOVIMENTO.NEXTVAL, ?, now(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';
	        var pStmt = conn1.prepareStatement(api.replaceDbName(qryInsInv));
    
	        pStmt.setInt(1, parseInt(nIdEmpresa));
            pStmt.setString(2, cIdProduto);
            pStmt.setInt(3, parseInt(nQtdContagem));
            pStmt.setInt(4, 0);
            pStmt.setInt(5, 0);
            pStmt.setInt(6, 0);
            pStmt.setInt(7, 0);
            pStmt.setInt(8, 0);
            pStmt.setInt(9, parseInt(nQtdContagem));
            pStmt.setInt(10, parseInt(nQtdContagem));
            pStmt.setString(11, 'True');

            pStmt.execute();
        
        }

        updateStmt.close();
        pStmt.close();
        conn1.commit();

        return {
    	    "msg": "Inclusão de Bloco Realizada com Sucesso!"
        };
    } catch (e) {
        conn1.rollback();
        throw e;
    }
    
}

// Fecha Balanço
function fnFechaBalanco(pIdResumoBalanco, pDataAbertura){

    var ncorte = 5000;

	var query = ' SELECT ' +
        ' IDPRODUTO, IDRESUMOBALANCO, IDEMPRESA, QTD, QTDFINAL, QTDFALTA, QTDSOBRA, PRECOVENDA ' +
    	'FROM "VAR_DB_NAME".PREVIABALANCO ' +
		'WHERE IDRESUMOBALANCO = ? ';
	var listar = api.sqlQuery(query, pIdResumoBalanco);

    for (var ct = 0; ct < listar.length; ct = ct + ncorte){
        fnBlocoFechaBalanco(listar.slice(ct, ct + ncorte), pIdResumoBalanco, pDataAbertura);
    }

    return {
        "msg": "Inclusão realizada com sucesso!"
    };
}

// SAÍDA => Desconto e Venda de Caixa
function saiVenda(pIdEmpresa, pDataAbertura, pDataEstoqueAnterior) {

	var query = ' SELECT ' +
		' IFNULL(SUM("NFE_INFNFE_TOTAL_ICMSTOT_VDESC"), 0) AS VLRDESCONTOCAIXA ' +
		' ,IFNULL(SUM("NFE_INFNFE_TOTAL_ICMSTOT_VNF"), 0) AS VLRVENDACAIXA ' +
		' FROM "VAR_DB_NAME".VENDA ' +
		' WHERE "IDEMPRESA" = ? ' +
		' AND "STCANCELADO" = \'False\' ' +
		' AND "DTHORAFECHAMENTO" BETWEEN \'' + pDataEstoqueAnterior + '\' AND \'' + pDataAbertura + '\' ';

	var linhas = api.sqlQuery(query, pIdEmpresa);

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"VLRDESCONTOCAIXA": det.VLRDESCONTOCAIXA,
			"VLRVENDACAIXA": det.VLRVENDACAIXA
		};
	}
	return docLine;
}

// SAÍDA => Devolução Mercadoria
function saiDevolucaoMercadoria(pIdEmpresa, pDataAbertura, pDataEstoqueAnterior) {

	var query = ' SELECT ' +
		//' IFNULL(SUM("Saidas" * "PrecoUnitario"), 0) AS VLRTOTALDEVOLUCAO ' +
		' IFNULL(SUM("Saidas" * "PrecoVendaNaData"), 0) AS VLRTOTALDEVOLUCAO ' +
		' ,IFNULL(SUM("Saidas"), 0) AS QTDTOTALDEVOLUCAO ' +
		' FROM "SBO_GTO_PRD".IS_ENT_SAI_DETALHADO ' +
		' WHERE "Cod.Filial" = ? ' +
		//' AND "Origem" = \'Dev. Nota de Entrada\' ' +
		' AND "Origem" = \'Nota de Saida\' ' +
		' AND "StatusTransferencia" <> (\'Ajuste de Falta\') ' +
		' AND "Data" BETWEEN \'' + pDataEstoqueAnterior + '\' AND \'' + pDataAbertura + '\' ';

	var linhas = api.sqlQuery(query, pIdEmpresa);

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"VLRTOTALDEVOLUCAO": det.VLRTOTALDEVOLUCAO,
			"QTDTOTALDEVOLUCAO": det.QTDTOTALDEVOLUCAO
		};
	}
	return docLine;
}

// SAÍDA => Falta de Mercadoria
function saiFaltaMercadoria(pIdEmpresa, pDataAbertura, pDataEstoqueAnterior) {

	var query = ' SELECT ' +
		//' IFNULL(SUM("Saidas" * "PrecoUnitario"), 0) AS VLRTOTALFALTA ' +
		' IFNULL(SUM("Saidas" * "PrecoVendaNaData"), 0) AS VLRTOTALFALTA ' +
		' FROM "SBO_GTO_PRD".IS_ENT_SAI_DETALHADO ' +
		' WHERE "Cod.Filial" = ? ' +
		' AND "Origem" = \'Nota de Saida\' ' +
		' AND "StatusTransferencia" = \'Ajuste de Falta\' ' +
		' AND "Data" BETWEEN \'' + pDataEstoqueAnterior + '\' AND \'' + pDataAbertura + '\' ';

	var linhas = api.sqlQuery(query, pIdEmpresa);

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"VLRTOTALFALTA": det.VLRTOTALFALTA
		};
	}

	return docLine;
}

// SAÍDA => Baixa de Mercadoria
function saiBaixaMercadoria(pIdEmpresa, pDataAbertura, pDataEstoqueAnterior) {

	var query = ' SELECT ' +
		'   IFNULL(SUM(VALORDIFERENCA), 0) AS VLRTOTALBAIXA ' +
		' FROM "VAR_DB_NAME".DETALHEALTERACAOPRECO ' +
		' WHERE IDRESUMOALTERACAOPRECO IN (SELECT IDRESUMOALTERACAOPRECO FROM "VAR_DB_NAME".RESUMOALTERACAOPRECO ' +
		'                                  WHERE IDFILIAL = ? AND DATAALTERACAO BETWEEN \'' + pDataEstoqueAnterior + '\' AND \'' + pDataAbertura + '\' ' +
		'                                  AND STCONCLUIDO = \'True\' AND STCANCELADO = \'False\') ' +
		' AND VALORDIFERENCA < 0 ';

	var linhas = api.sqlQuery(query, pIdEmpresa);

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"VLRTOTALBAIXA": det.VLRTOTALBAIXA
		};
	}

	return docLine;
}

// ENTRADA => Voucher
function entVoucher(pIdEmpresa, pDataAbertura, pDataEstoqueAnterior) {

	var query = ' SELECT ' +
		'   IFNULL(SUM(VRVOUCHER), 0) AS VLRTOTALVOUCHER ' +
		' FROM "VAR_DB_NAME".RESUMOVOUCHER ' +
		' WHERE IDEMPRESAORIGEM = ? ' +
		' AND STCANCELADO = \'False\' ' +
		' AND DTINVOUCHER BETWEEN \'' + pDataEstoqueAnterior + '\' AND \'' + pDataAbertura + '\' ';

	var linhas = api.sqlQuery(query, pIdEmpresa);

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"VLRTOTALVOUCHER": det.VLRTOTALVOUCHER
		};
	}

	return docLine;
}

// ENTRADA => Alta de Mercadoria
function entAltaMercadoria(pIdEmpresa, pDataAbertura, pDataEstoqueAnterior) {

	var query = ' SELECT ' +
		'   IFNULL(SUM(VALORDIFERENCA), 0) AS VLRTOTALALTA ' +
		' FROM "VAR_DB_NAME".DETALHEALTERACAOPRECO ' +
		' WHERE IDRESUMOALTERACAOPRECO IN (SELECT IDRESUMOALTERACAOPRECO FROM "VAR_DB_NAME".RESUMOALTERACAOPRECO ' +
		'                                  WHERE IDFILIAL = ? AND DATAALTERACAO BETWEEN \'' + pDataEstoqueAnterior + '\' AND \'' + pDataAbertura + '\' ' +
		'                                  AND STCONCLUIDO = \'True\' AND STCANCELADO = \'False\') ' +
		' AND VALORDIFERENCA > 0 ';

	var linhas = api.sqlQuery(query, pIdEmpresa);

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"VLRTOTALALTA": det.VLRTOTALALTA
		};
	}

	return docLine;
}

// ENTRADA => Sobra de Mercadoria
function entSobraMercadoria(pIdEmpresa, pDataAbertura, pDataEstoqueAnterior) {

	var query = ' SELECT ' +
		//' IFNULL(SUM("Saidas" * "PrecoUnitario"), 0) AS VLRTOTALSOBRA ' +
		' IFNULL(SUM("Saidas" * "PrecoVendaNaData"), 0) AS VLRTOTALSOBRA ' +
		' FROM "SBO_GTO_PRD".IS_ENT_SAI_DETALHADO ' +
		' WHERE "Cod.Filial" = ? ' +
		' AND "Origem" = \'Nota de Entrada\' ' +
		' AND "StatusTransferencia" = \'Ajuste de Sobra\' ' +
		' AND "Data" BETWEEN \'' + pDataEstoqueAnterior + '\' AND \'' + pDataAbertura + '\' ';

	var linhas = api.sqlQuery(query, pIdEmpresa);

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
				"VLRTOTALSOBRA": det.VLRTOTALSOBRA
		};
	}

	return docLine;
}

// ENTRADA => Mercadorias Recebidas (Romaneios)
function entMercadoriaRecebida(pIdEmpresa, pDataAbertura, pDataEstoqueAnterior) {

	var query = ' SELECT ' +
		//' IFNULL(SUM("Entradas" * "PrecoUnitario"), 0) AS VLRTOTALENTRADA ' +
		' IFNULL(SUM("Entradas" * "PrecoVendaNaData"), 0) AS VLRTOTALENTRADA ' +
		' ,IFNULL(SUM("Entradas"), 0) AS QTDTOTALENTRADA ' +
		' FROM "SBO_GTO_PRD".IS_ENT_SAI_DETALHADO ' +
		' WHERE "Cod.Filial" = ? ' +
		' AND "Origem" = \'Nota de Entrada\' ' +
		' AND "StatusTransferencia" <> \'Ajuste de Sobra\' ' +
		' AND "Data" BETWEEN \'' + pDataEstoqueAnterior + '\' AND \'' + pDataAbertura + '\' ';

	var linhas = api.sqlQuery(query, pIdEmpresa);

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"VLRTOTALENTRADA": det.VLRTOTALENTRADA,
			"QTDTOTALENTRADA": det.QTDTOTALENTRADA
		};
	}
	return docLine;
}

function fnHandleGet(byId) {

    var query = ' SELECT ' +
        ' TO_VARCHAR(rb.DTABERTURA,\'YYYY-MM-DD HH24:MI:SS\') AS DTABERTURA ' +
        ' ,TO_VARCHAR(rb.DTABERTURA,\'DD/MM/YYYY\') AS DTABERTURAFORMATADA ' +
        ' ,IFNULL(rb.VRESTOQUEANTERIOR, 0) AS VRESTOQUEANTERIOR ' +
        ' ,IFNULL(TO_VARCHAR(rb.DTESTOQUEANTERIOR,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTESTOQUEANTERIOR ' +
        ' ,IFNULL(TO_VARCHAR(rb.DTESTOQUEANTERIOR,\'DD/MM/YYYY\'), \'Não Informado\') AS DTESTOQUEANTERIORFORMATADA ' +
        ' ,rb.IDEMPRESA ' +
        ' ,IFNULL(rb.VRESTOQUEATUAL, 0) AS VRESTOQUEATUAL ' +
        ' ,e.NOFANTASIA ' +
        ' ,rb.IDRESUMOBALANCO ' +
        ' ,rb.STCONCLUIDO ' +
        ' FROM "VAR_DB_NAME".RESUMOBALANCO rb ' +
        ' INNER JOIN "VAR_DB_NAME".EMPRESA e ON e.IDEMPRESA = rb.IDEMPRESA ' +
		' WHERE 1 = ? ';

	if(byId){
		query = query + ' AND rb.IDRESUMOBALANCO = \'' + byId + '\' ';
	}

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var listagem = {
			"listagem": {
				"DTABERTURA": registro.DTABERTURA,
				"DTABERTURAFORMATADA": registro.DTABERTURAFORMATADA,
				"VRESTOQUEANTERIOR": registro.VRESTOQUEANTERIOR,
				"DTESTOQUEANTERIOR": registro.DTESTOQUEANTERIORFORMATADA,
				"VRESTOQUEATUAL": registro.VRESTOQUEATUAL,
				"NOFANTASIA": registro.NOFANTASIA,
				"IDEMPRESA": registro.IDEMPRESA,
				"IDRESUMOBALANCO": registro.IDRESUMOBALANCO,
				"STCONCLUIDO": registro.STCONCLUIDO
			},
			// ENTRADA => Mercadorias Recebidas (Romaneios)
			"entmerrec": entMercadoriaRecebida(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
			
			// ENTRADA => Sobra de Mercadoria
			"entsobmer": entSobraMercadoria(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
			
			// ENTRADA => Alta de Mercadoria
			"entaltmer": entAltaMercadoria(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
			
			// ENTRADA => Voucher
			"entvoucher": entVoucher(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
			
			// SAÍDA => Baixa de Mercadoria
			"saibaimer": saiBaixaMercadoria(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
			
			// SAÍDA => Falta de Mercadoria
			"saifalmer": saiFaltaMercadoria(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
			
			// SAÍDA => Devolução Mercadoria
			"saidevmer": saiDevolucaoMercadoria(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
			
			// SAÍDA => Desconto e Venda de Caixa
			"saivenda": saiVenda(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR)
		};

		data.push(listagem);

	}

	response.data = data;

	return response;
}

function fnHandlePut(){

    var conn = $.db.getConnection();

    var query = 'UPDATE "VAR_DB_NAME"."RESUMOBALANCO" SET ' +
        // ENTRADAS
        ' "VRTOTALROMANEIO" = ?, "DTPERIODOROMANEIO" = ?, "QTDTOTALENTRADA" = ?, ' +
        ' "VRALTAMERCADORIA" = ?, "DTPERIODOALTA" = ?, ' +
        ' "SOBRAMERCADORIA" = ?, "DTPERIODOSOBRA" = ?, ' +
        ' "VRVOUCHER" = ?, "DTPERIODOVOUCHER" = ?, ' +
        ' "TOTALGERALENTRADA" = ?, ' +
        // SAIDAS
        ' "VRBAIXAMERCADORIA" = ?, "DTPERIODOBAIXA" = ?, ' +
        ' "VRDEVOLUCAOMERCADORIA" = ?, "DTPERIODODEVOLUCAO" = ?, "QTDTOTALDEVOLVIDA" = ?, ' +
        ' "VRFALTAMERCADORIA" = ?, "DTPERIODOFALTAMERCADORIA" = ?, ' +
        ' "VRDESCONTOCAIXA" = ?, "DTPERIODODESCONTOCAIXA" = ?, ' +
        ' "VRVENDACAIXA" = ?, "DTPERIODOVENDACAIXA" = ?, ' +
        ' "TOTALGERALSAIDA" = ?, ' +
        // FECHAMENTO
        ' "TOTALGERALPRESTARCONTA" = ?, ' +
        ' "IDUSRFECHAMENTO" = ?, ' +
        ' "DTFECHAMENTO" = now(), ' +
        ' "STCONCLUIDO" = ?, ' +
        ' "STATIVO" = ? ' +
    	' WHERE "IDRESUMOBALANCO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));

    var bodyJson = JSON.parse($.request.body.asString()); 
    
    var dataGet = fnHandleGet(bodyJson[0].IDRESUMOBALANCO);
    
    var totalentrada = parseFloat(dataGet.data[0].entmerrec.VLRTOTALENTRADA) + parseFloat(dataGet.data[0].entsobmer.VLRTOTALSOBRA) + parseFloat(dataGet.data[0].entaltmer.VLRTOTALALTA) + parseFloat(dataGet.data[0].entvoucher.VLRTOTALVOUCHER);
    var totalsaida = parseFloat(dataGet.data[0].saidevmer.VLRTOTALDEVOLUCAO) + parseFloat(dataGet.data[0].saifalmer.VLRTOTALFALTA) + parseFloat(dataGet.data[0].saivenda.VLRDESCONTOCAIXA) + parseFloat(dataGet.data[0].saivenda.VLRVENDACAIXA) + parseFloat(dataGet.data[0].saibaimer.VLRTOTALBAIXA);
    var totalgeralprestarconta = totalentrada - totalsaida;
    
    var pIdResumoBalanco = dataGet.data[0].listagem.IDRESUMOBALANCO;
    var pDataAbertura = dataGet.data[0].listagem.DTABERTURA;

    for (var i = 0; i < bodyJson.length; i++) {

        // ENTRADA => Mercadorias Recebidas (Romaneios)
        pStmt.setFloat(1, parseFloat(dataGet.data[0].entmerrec.VLRTOTALENTRADA));
        pStmt.setDate(2, dataGet.data[0].listagem.DTABERTURA);
        pStmt.setInt(3, parseInt(dataGet.data[0].entmerrec.QTDTOTALENTRADA));
        
        // ENTRADA => Alta de Mercadoria
        pStmt.setFloat(4, parseFloat(dataGet.data[0].entaltmer.VLRTOTALALTA));
        pStmt.setDate(5, dataGet.data[0].listagem.DTABERTURA);
        
        // ENTRADA => Sobra de Mercadoria
        pStmt.setFloat(6, parseFloat(dataGet.data[0].entsobmer.VLRTOTALSOBRA));
        pStmt.setDate(7, dataGet.data[0].listagem.DTABERTURA);

        // ENTRADA => Voucher
        pStmt.setFloat(8, parseFloat(dataGet.data[0].entvoucher.VLRTOTALVOUCHER));
        pStmt.setDate(9, dataGet.data[0].listagem.DTABERTURA);

        // ENTRADA => TOTAL
        pStmt.setFloat(10, totalentrada);

        // SAIDA => Baixa de Mercadoria
        pStmt.setFloat(11, parseFloat(dataGet.data[0].saibaimer.VLRTOTALBAIXA));
        pStmt.setDate(12, dataGet.data[0].listagem.DTABERTURA);

        // SAIDA => Devolução Mercadoria
        pStmt.setFloat(13, parseFloat(dataGet.data[0].saidevmer.VLRTOTALDEVOLUCAO));
        pStmt.setDate(14, dataGet.data[0].listagem.DTABERTURA);
        pStmt.setInt(15, parseInt(dataGet.data[0].saidevmer.QTDTOTALDEVOLUCAO));

        // SAIDA => Falta de Mercadoria
        pStmt.setFloat(16, parseFloat(dataGet.data[0].saifalmer.VLRTOTALFALTA));
        pStmt.setDate(17, dataGet.data[0].listagem.DTABERTURA);

        // SAIDA => Desconto de Caixa
        pStmt.setFloat(18, parseFloat(dataGet.data[0].saivenda.VLRDESCONTOCAIXA));
        pStmt.setDate(19, dataGet.data[0].listagem.DTABERTURA);

        // SAIDA => Venda de Caixa
        pStmt.setFloat(20, parseFloat(dataGet.data[0].saivenda.VLRVENDACAIXA));
        pStmt.setDate(21, dataGet.data[0].listagem.DTABERTURA);

        // SAIDA => TOTAL
        pStmt.setFloat(22, totalsaida);

        // FECHAMENTO
        pStmt.setFloat(23, totalgeralprestarconta);
        pStmt.setInt(24, 1);

        pStmt.setString(25, 'True');
        pStmt.setString(26, 'False');
        pStmt.setInt(27, parseInt(dataGet.data[0].listagem.IDRESUMOBALANCO));
   
    	pStmt.execute();
    }

	pStmt.close();

    //fnFechaBalanco(pIdResumoBalanco, pDataAbertura);
    var querySP = "{ CALL \"QUALITY_CONC_HML\".\"SP_FECHABALANCO\"(?,?) }";
    var pStmtSP = conn.prepareCall(querySP);
    pStmtSP.setInt(1, parseInt(pIdResumoBalanco));
    pStmtSP.setDate(2, pDataAbertura);
    pStmtSP.execute();
    pStmtSP.close();

	conn.commit();

	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;

		/*//Handle your POST calls here
		case $.net.http.POST:
			var doc = fnHandlePost();
			$.response.setBody(JSON.stringify(doc));
			break;
		default:
			break;*/
			
		//Handle your PUt calls here
	    case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}