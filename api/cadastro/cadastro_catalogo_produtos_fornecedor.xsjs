var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var msg;

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

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setFloatOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnVincularNotaAoPedido(idResumoPedido, idResumoEntradaDanfe, registro) {
    var conn = $.db.getConnection();
    
    var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDPEDIDONOTA")), 0) + 1 FROM "VAR_DB_NAME"."VINCPEDIDONOTA" WHERE 1 = ? ', 1);
    var idPedido = idResumoPedido;
    var idNotaFiscal = idResumoEntradaDanfe;
    
    var queryVincNFPedido = 'SELECT IDPEDIDONOTA '+
        ' FROM "VAR_DB_NAME"."VINCPEDIDONOTA" WHERE IDRESUMOPEDIDO =\''+ idPedido+'\''+
            ' AND IDRESUMOENTRADA= ?'; 
         
        var vincNFPedido = api.sqlQuery(queryVincNFPedido, idNotaFiscal);
            
    if(vincNFPedido.length > 0 ){
        var idVinculo = parseInt(vincNFPedido[0]["IDPEDIDONOTA"]);
        
        var vinculo = {
    	    "idVinculo": idVinculo,
    	    "idResumoPedido": idPedido,
    	    "idNotaFiscal": idNotaFiscal
    	};
    	
        var query = `UPDATE "VAR_DB_NAME"."VINCPEDIDONOTA" SET 
             "STATIVO" = 'True'
    	     WHERE "IDPEDIDONOTA" = ${idVinculo}`;
        
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
                        
        pStmt.execute();
        
    	pStmt.close();
    
    	conn.commit();
    	
    	registro.vincNotaPedido = vinculo;
    	msg = "Pedido já Vinculado a Essa Nota Fiscal, Faça a Conciliação!";
        
    } else{
    
        var query = `INSERT INTO "VAR_DB_NAME"."VINCPEDIDONOTA" 
        	( 
        	"IDPEDIDONOTA",
            "IDRESUMOPEDIDO",
        	"IDRESUMOENTRADA",
        	"STATIVO"
        	)
    		VALUES(?,?,?,'True')`;
    		
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
            
        pStmt.setInt(1, parseInt(queryId));
        pStmt.setInt(2, parseInt(idPedido));
        pStmt.setInt(3, parseInt(idNotaFiscal));
    
        pStmt.execute();
        
    	pStmt.close();
    
    	conn.commit();
    	
    	var vinculo = {
    	    "idVinculo": queryId,
    	    "idResumoPedido": idPedido,
    	    "idNotaFiscal": idNotaFiscal
    	};
    	
    	registro.vincNotaPedido = vinculo;
    	msg = "Inclusão realizada com sucesso!";
    }
}

function fnIncluirDetalheProdutosDanfePedido(idResumoEntrada, lstDet, lstDetEstoque, conn){
    
    var query = `INSERT INTO "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO"  
        (
        "IDDETALHEENTRADA",
        "IDRESUMOENTRADA",
        "IDDETALHEPEDIDO",
        "CPROD",
        "XPROD",
        "NCM",
        "CFOP",
        "UCOM",
        "QCOM",
        "VUNCOM",
        "VPROD",
        "VDESC",
        "CSTICMS",
        "BCICMS",
        "PICMS",
        "VLICMS",
        "CSTIPI",
        "BCIPI",
        "PIPI",
        "VLIPI",
        "CSTPIS",
        "BCPIS",
        "PPIS",
        "VLPIS",
        "CSTCOFINS",
        "BCCOFINS",
        "PCOFINS",
        "VLCOFINS",
        "STDIFERENCA",
        "STDIVERGENCIA",
        "DSOBSERVACAODIVERGENCIA",
        "QTDDIVERGENCIA",
        "CEAN",
        "IDPRODUTO"
        ) 
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

	var pStmt = conn.prepareStatement(api.replaceDbName(query));
	
	for (var i = 0; i < lstDet.length; i++) {
	    var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDDETALHEENTRADA")), 0) + 1 FROM "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" WHERE 1 = ? ', 1);
	    lstDet[i].IDDETALHEENTRADA = queryId;
	    
		var registro = lstDet[i];
        
		pStmt.setInt(1, parseInt(queryId));
		pStmt.setInt(2, parseInt(idResumoEntrada));
		setIntOrNull(pStmt, 3, registro.IDDETALHEPEDIDO);
		setStringOrNull(pStmt, 4, registro.CPROD);
		pStmt.setString(5, registro.XPROD);
		pStmt.setString(6, registro.NCM);
		pStmt.setString(7, registro.CFOP);
		pStmt.setString(8, registro.UCOM);
		pStmt.setFloat(9, registro.QCOM);
		pStmt.setFloat(10, registro.VUNCOM);
		pStmt.setFloat(11, registro.VPROD);
		setFloatOrNull(pStmt, 12, registro.VDESC);
		setStringOrNull(pStmt, 13, registro.CSTICMS);
		setFloatOrNull(pStmt, 14, registro.BCICMS);
		setFloatOrNull(pStmt, 15, registro.PICMS);
		setFloatOrNull(pStmt, 16, registro.VLICMS);
		setStringOrNull(pStmt, 17, registro.CSTIPI);
		setFloatOrNull(pStmt, 18, registro.BCIPI);
		setFloatOrNull(pStmt, 19, registro.PIPI);
		setFloatOrNull(pStmt, 20, registro.VLIPI);
		setStringOrNull(pStmt, 21, registro.CSTPIS);
		setFloatOrNull(pStmt, 22, registro.BCPIS);
		setFloatOrNull(pStmt, 23, registro.PPIS);
		setFloatOrNull(pStmt, 24, registro.VLPIS);
		setStringOrNull(pStmt, 25, registro.CSTCOFINS);
		setFloatOrNull(pStmt, 26, registro.BCCOFINS);
		setFloatOrNull(pStmt, 27, registro.PCOFINS);
		setFloatOrNull(pStmt, 28, registro.VLCOFINS);
		setStringOrNull(pStmt, 29, registro.STDIFERENCA);
		setStringOrNull(pStmt, 30, registro.STDIVERGENCIA);
		setStringOrNull(pStmt, 31, registro.DSOBSERVACAODIVERGENCIA);
		setIntOrNull(pStmt, 32, registro.QTDDIVERGENCIA);
		setStringOrNull(pStmt, 33, registro.CEAN);
		setStringOrNull(pStmt, 34, registro.IDPRODUTO);
	    
		pStmt.execute();
		conn.commit();
	}

    msg = "Nota Cadastrada Com Sucesso!"
    
	pStmt.close();
   
   fnMovimentaInventario(lstDetEstoque, conn)

}

function fnVinculaQtdPedidoQtdNFE(lstDetProd, lstDetEstoque,conn){
    let queryId;
    let pStmt;
    let qtdProdPed = 0;
    let qtdNota = 0;
    let qtdVinculado = 0;
    let qtdFaltaPed = 0;
    let qtdFaltaNota = 0;

	for (let i = 0; i < lstDetProd.length; i++) {
	    
	    let registro = lstDetProd[i];
	    
	    let queryExistsReg = ' SELECT *  FROM "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" WHERE ' +
        ' IDDETALHEPEDIDO=\''+ registro.IDDETALHEPEDIDO+'\'' +
        ' AND IDDETALHEPRODUTOPEDIDO=\''+ registro.IDDETALHEPRODUTOPEDIDO+'\'' +
        ' AND IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND IDDETALHEENTRADA = ? AND STATIVO=\'True\' AND STESTOQUE=\'False\' ';
    
         let idRegExists = api.sqlQuery(queryExistsReg, parseInt(registro.IDDETALHEENTRADA));
       
        if(idRegExists.length > 0){
           let queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" SET ' + 
                ' STATIVO=\'False\' ' +
        		' WHERE "IDDETPEDIDODETNOTA" =  ? ';
                
            let pStmtAtualizaStatus = conn.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                
            pStmtAtualizaStatus.setInt(1, parseInt(idRegExists[0].IDDETPEDIDODETNOTA));
            pStmtAtualizaStatus.execute();
            pStmtAtualizaStatus.close();
            conn.commit();
        } else{
            queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDDETPEDIDODETNOTA")), 0) + 1 FROM "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" WHERE 1 = ? ', 1);
        	    
    	    let query = `INSERT INTO "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" 
        	( 
            "IDDETPEDIDODETNOTA",
            "IDDETALHEENTRADA",
            "IDDETALHEPEDIDO",
            "IDDETALHEPRODUTOPEDIDO",
            "IDPRODUTO",
            "QTDDETPRODPEDIDO",
            "QTDVINCULADO",
            "QTDFALTADETPRODPEDIDO",
            "STATIVO",
            "STESTOQUE"
        	)
    		VALUES(?,?,?,?,?,?,?,?,'True', 'False')`;
    		
            pStmt = conn.prepareStatement(api.replaceDbName(query))
            
            pStmt.setInt(1, parseInt(queryId));
            pStmt.setInt(2, registro.IDDETALHEENTRADA);
            pStmt.setInt(3, registro.IDDETALHEPEDIDO);
            pStmt.setInt(4, registro.IDDETALHEPRODUTOPEDIDO);
            pStmt.setString(5, registro.IDPRODUTO);
            pStmt.setFloat(6, registro.QTDDETPRODPEDIDO);
            pStmt.setFloat(7, registro.QTDVINCULO);
            pStmt.setFloat(8, registro.QTDFALTADETPRODPEDIDO);
    
            pStmt.execute();
            conn.commit();
            
           fnMovimentaInventario(lstDetEstoque, conn);
        }
	}
	   
	pStmt.close();
	
	return {
	    "statusPost": "Success",
	    "msg": "Inclusão realizada com sucesso!",
	};
    
}

function fnMovimentaInventario(lstDetProdRecepcao, conn) {
    
    let idEmpresa;
    let qtdInicio = 0;
	let qtdEntrada = 0;
	let qtdSaida = 0;
	let qtdSaidaTransferencia = 0;
	let qtdRetornoAjustePedido = 0;
	let qtdFinal = 0;
	let qtdAjusteBalanco = 0;
	let qtdEntradaVoucher = 0;
	
	let date = new Date();
	let dd = ("0" + date.getDate()).slice(-2);
    let mm = ("0" + (date.getMonth() + 1)).slice(-2);
    let y = date.getFullYear();
 
    let dataAtual = y + '-' + mm + '-' + dd;
    let conn2 = conn; //$.db.getConnection();
		
    for (let i = 0; i < lstDetProdRecepcao.length; i++) {
        let registro = lstDetProdRecepcao[i];
        
        idEmpresa = registro.IDEMPRESA;
        
        let queryExistsMov = ' SELECT *  FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + dataAtual + ' 00:00:00\' AND \'' + dataAtual + ' 23:59:59\')' +
        ' AND IDEMPRESA = ? AND STATIVO=\'True\'';
    
         let idMovExists = api.sqlQuery(queryExistsMov, parseInt(idEmpresa));
         
        if(idMovExists.length === 0){
            qtdInicio = 0;
            let queryMovAnt = 'SELECT * '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.IDPRODUTO+'\''+
            ' AND IDEMPRESA = ? ';
            
            let UltMovimentoProduto = api.sqlQuery(queryMovAnt, parseInt(idEmpresa));
            
            if(UltMovimentoProduto.length > 0){
               
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdEntrada = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntrada;
               //Atualiza o status para false do Ultimo Movimento
               let queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
        		' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                let pStmtAtualizaStatus = conn2.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
                conn2.commit();
            }else{
                
               qtdEntrada = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntrada;
            }
            
            
    	    let query = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
    		" ( " +
    		' "IDINVMOVIMENTO", ' +
    		' "IDEMPRESA", ' +
    		' "DTMOVIMENTO", ' +
    		' "IDPRODUTO", ' +
    	    ' "QTDINICIO", ' +
    	    ' "QTDENTRADAVOUCHER", '+
    		' "QTDENTRADA", ' +
    		' "QTDSAIDA", ' +
    		' "QTDSAIDATRANSFERENCIA", ' +
    		' "QTDRETORNOAJUSTEPEDIDO", ' +
    		' "QTDFINAL", ' +
    		' "QTDAJUSTEBALANCO", ' +
    		' "STATIVO" ' +
    		' ) ' +
    		' VALUES("VAR_DB_NAME"."SEQ_INVENTARIOMOVIMENTO".NEXTVAL,?,now(),?,?,?,?,?,?,?,?,?,\'True\') ';
    
        	let pStmt = conn2.prepareStatement(api.replaceDbName(query));
            	
            pStmt.setInt(1, parseInt(idEmpresa));
            pStmt.setString(2, registro.IDPRODUTO);
        	pStmt.setInt(3, qtdInicio);
        	pStmt.setInt(4, qtdEntradaVoucher);
        	pStmt.setInt(5, qtdEntrada);
        	pStmt.setInt(6, qtdSaida);
        	pStmt.setInt(7, qtdSaidaTransferencia);
        	pStmt.setInt(8, qtdRetornoAjustePedido);
        	pStmt.setInt(9, qtdFinal);
        	pStmt.setInt(10, qtdAjusteBalanco);
        	
        	pStmt.execute();
        	pStmt.close();
        	conn2.commit();
        }else{
    
            qtdEntrada = parseInt(registro.QTD) + parseInt(idMovExists[0].QTDENTRADA);
            qtdFinal = parseInt(idMovExists[0].QTDINICIO) + qtdEntrada - parseInt(idMovExists[0].QTDSAIDA) - parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA);
            
             let queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "QTDENTRADA" =  ?, ' +
        		' "QTDFINAL" =  ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
            let pStmt2 = conn2.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
        	pStmt2.setInt(1, qtdEntrada);
        	pStmt2.setInt(2, qtdFinal);
        	
            pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
            pStmt2.execute();
            pStmt2.close();
            conn2.commit();
        }
        
    }
}

function fnHandleGet(byId) {
    
    let idProduto = $.request.parameters.get("idproduto");
    let idFornecedor = $.request.parameters.get("idfornecedor");
    let idProdForn = $.request.parameters.get("idprodforn");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

    let query = `SELECT
                    tbcf.IDCATALOGOPRODUTOSFORNECEDOR, 
                    tbcf.IDPRODUTO, 
                    tbcf.IDFORNECEDOR, 
                    tbcf.IDPRODUTOFORNECEDOR, 
                    tbcf.DSPRODUTOFORNECEDOR, 
                    tbcf.STATIVO,
                    tbp.DSNOME,
                    tbp.NUCODBARRAS,
                    tbp.NUREFERENCIA,
                    tbp.NUNCM
                FROM "VAR_DB_NAME"."CATALOGOPRODUTOSFORNECEDOR" tbcf
                INNER JOIN "VAR_DB_NAME"."PRODUTO" tbp ON 
                    tbcf.IDPRODUTO = tbp.IDPRODUTO AND tbp.STATIVO = 'True'
                WHERE
                	1 = ?`;
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    if ( byId ) {
        query = query + ' And  tbcf.IDCATALOGOPRODUTOSFORNECEDOR = \'' + byId + '\' ';
    }
    
    if ( idProduto ) {
        query = query + ' And  tbcf.IDPRODUTO = \'' + idProduto + '\' ';
    }
    
    if ( idFornecedor ) {
        query = query + ' And  tbcf.IDFORNECEDOR = \'' + idFornecedor + '\' ';
    }
    
    if ( idProdForn ) {
        query = query + ' And  tbcf.IDPRODUTOFORNECEDOR = \'' + idProdForn + '\' ';
    }

    /*if(dataPesquisaInicio && dataPesquisaFim) {
        query = query + ' AND (DEMI BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        query = query + ' OR (DTCADASTRO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        query = query + ' ORDER BY DTCADASTRO ';
    }*/
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" SET ' + 
        ' "STDIVERGENCIA" = ?, ' + 
        ' "QTDDIVERGENCIA" = ?, ' + 
    	' WHERE "IDDETALHEENTRADA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(3, registro.MODPEDIDO);
        pStmt.setString(4, registro.NORAZAOSOCIAL);
        pStmt.setString(5, registro.NOFANTASIA);
        pStmt.setString(6, registro.NUCNPJ);
        pStmt.setString(7, registro.NUINSCESTADUAL);
        pStmt.setString(8, registro.NUINSCMUNICIPAL);
        pStmt.setString(9, registro.NUIBGE);
        pStmt.setString(10, registro.EENDERECO);
        pStmt.setString(11, registro.ENUMERO);
        pStmt.setString(12, registro.ECOMPLEMENTO);
        pStmt.setString(13, registro.EBAIRRO);
        pStmt.setString(14, registro.ECIDADE);
        pStmt.setString(15, registro.SGUF);
        pStmt.setString(16, registro.NUCEP);
        pStmt.setString(17, registro.EEMAIL);
        pStmt.setString(18, registro.NUTELEFONE1);
        pStmt.setString(19, registro.NUTELEFONE2);
        pStmt.setString(20, registro.NUTELEFONE3);
        pStmt.setString(21, registro.NOREPRESENTANTE);
        setTimestampOrNull(pStmt,22, registro.DTCADASTRO);
        setTimestampOrNull(pStmt,23, registro.DTULTATUALIZACAO);
        pStmt.setString(24, registro.STATIVO);
        pStmt.setInt(25, registro.IDCONDPAGPADRAO);
        pStmt.setInt(26, registro.IDTRANSPORTADORAPADRAO);
        pStmt.setString(27, registro.TPPEDIDOPADRAO);
        pStmt.setString(28, registro.NOVENDEDORPADRAO);
        pStmt.setString(29, registro.TPFRETEPADRAO);
        pStmt.setString(30, registro.TPARQUIVOPADRAO);
        pStmt.setString(31, registro.TPFISCALPADRAO);
        pStmt.setString(32, registro.EMAILVENDEDORPADRAO);
        pStmt.setString(33, registro.IDFORNECEDOR);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    let conn = $.db.getConnection();
    
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."CATALOGOPRODUTOSFORNECEDOR" 
            ( 
                IDPRODUTO,
                DSPRODUTO,
                IDFORNECEDOR, 
                IDPRODUTOFORNECEDOR,
                DSPRODUTOFORNECEDOR,
                IDUSERCRIACAO
            )
		VALUES(?,?,?,?,?,?)
	`;

    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    
	for (let i = 0; i < bodyJson.length; i++) {
	    let registro = bodyJson[i];
      //  var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("ID")), 0) + 1 FROM "VAR_DB_NAME"."CATALOGOPRODUTOFORNECEDOR" WHERE 1 = ? ', 1);
        
        let queryRegExist = `
            SELECT
                *
            FROM 
                "VAR_DB_NAME"."CATALOGOPRODUTOSFORNECEDOR" 
            WHERE 
                IDPRODUTO= '${registro.IDPRODUTO}' 
                AND STATIVO = 'True'
                AND IDFORNECEDOR = ?
        `; 
        
        let RegExist = api.sqlQuery(queryRegExist,registro.IDFORNECEDOR);
        
        if(RegExist.length > 0 ){
            return {
                "statusPost": "warning",
                "msg": "Este Produto Já Foi Vinculado ao Catalogo!"
            };
        } else{
        	pStmt.setString(1, registro.IDPRODUTO);
            pStmt.setString(2, registro.DSPRODUTO);
            pStmt.setInt(3, registro.IDFORNECEDOR);
            pStmt.setString(4, registro.IDPRODUTOFORNECEDOR);
            pStmt.setString(5, registro.DSPRODUTOFORNECEDOR);
            pStmt.setInt(6, registro.IDFUNCIONARIO);
            
            pStmt.execute();
            
            //conn.commit();
        }
        
	}

	pStmt.close();

	conn.commit();

	
	return {
	    "statusPost": "Success",
	    "msg": "Produtos Registrados com Sucesso!"
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