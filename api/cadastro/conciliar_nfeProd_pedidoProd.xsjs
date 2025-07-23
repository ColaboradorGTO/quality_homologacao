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

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function fnVinculaQtdPedidoQtdNFE(lstDetProd, conn){
    let queryId;
    let pStmt;
    let qtdProdPed = 0;
    let qtdNota = 0;
    let qtdVinculado = 0;
    let qtdFaltaPed = 0;
    let qtdFaltaNota = 0;

	for (let i = 0; i < lstDetProd.length - 1; i++) {
	    
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
        }
	}
	   
  //  fnMovimentaInventario(lstDetProd.pop(), conn);
	pStmt.close();

	
	return {
	    "statusPost": "Success",
	    "msg": "Inclusão realizada com sucesso!"
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
   
   return {
       msg: 'Estoque Atualizado com Sucesso!'
   }
}

function fnDesfazQtdVinculado(lstDetProdPedido, conn){
    let stDivergencia;
    let dsObservacaoDivergencia;
    let qtdDivergencia;
    let qtdNota;
    
    for (let i = 0; i < lstDetProdPedido.length; i++) {
	    
	    let registro = lstDetProdPedido[i];
	    
	    let queryVincDetPedDetNFE = ' SELECT *  FROM "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" WHERE ' +
            ' IDDETALHEPRODUTOPEDIDO=\''+ registro.IDDETALHEPRODUTOPEDIDO+'\'' +
            ' AND IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
            ' AND IDDETALHEPEDIDO = ? AND STATIVO=\'True\'';
    
        let regVincDet = api.sqlQuery(queryVincDetPedDetNFE, parseInt(registro.IDDETALHEPEDIDO));
        
      //  regVincDet = JSON.parse(JSON.stringify(regVincDet));
        
        if(regVincDet.length > 0){
           
            for(let j = 0; regVincDet.length; j++){
                
               //Atualiza o status para false do vinculo de acordo com o ID encaminhado
               let queryAtualizaStatusVincDetPedDetNFE = 'UPDATE "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" SET ' + 
                    ' STATIVO=\'False\' ' +
            		' WHERE "IDDETPEDIDODETNOTA" =  ? ';
                    
                let pStmtAtualizaStatusVinc = conn.prepareStatement(api.replaceDbName(queryAtualizaStatusVincDetPedDetNFE));
                    
                pStmtAtualizaStatusVinc.setInt(1, parseInt(regVincDet[j].IDDETPEDIDODETNOTA));
                pStmtAtualizaStatusVinc.execute();
                pStmtAtualizaStatusVinc.close();
                
                //Encontra o registro que foi enviado
                let queryDetNFE = ' SELECT *  FROM "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" ' +
                    ' WHERE IDDETALHEENTRADA = ? ';
    
                let regDetNFE = api.sqlQuery(queryDetNFE, parseInt(regVincDet[j].IDDETALHEENTRADA));
                
                qtdNota = regDetNFE[0].QCOM && parseInt(regDetNFE[0].QCOM);
                stDivergencia = regDetNFE[0].STDIVERGENCIA || null;
                qtdDivergencia = regDetNFE[0].QTDDIVERGENCIA || regDetNFE[0].QTDDIVERGENCIA == 0 ? parseInt(regDetNFE[0].QTDDIVERGENCIA) : 0;
                dsObservacaoDivergencia = regDetNFE[0].DSOBSERVACAODIVERGENCIA || null;
                let obs = 'teste';

               if(qtdNota == parseInt(regVincDet[j].QTDVINCULADO) || qtdNota == qtdDivergencia + parseInt(regVincDet[j].QTDVINCULADO)){
                   stDivergencia = null;
                   qtdDivergencia = null;
                   dsObservacaoDivergencia = null;
                   obs = 'teste1';
                   
               } else if(qtdNota > parseInt(regVincDet[j].QTDVINCULADO) && qtdNota > qtdDivergencia + parseInt(regVincDet[j].QTDVINCULADO)){
                   stDivergencia = 'True';
                   qtdDivergencia += parseInt(regVincDet[j].QTDVINCULADO);
                   dsObservacaoDivergencia = 'Quantidade Maior na Nota';
                   obs = 'teste2';
                   
               } else{
                   stDivergencia = 'True';
                   qtdDivergencia += qtdNota - parseInt(regVincDet[j].QTDVINCULADO);
                   dsObservacaoDivergencia = 'Quantidade Menor na Nota';
                   
               }

                /*//Encontra o Ultimo Registro de acordo com a nota fiscal
                let queryVincDetPedDetNFEUltimoReg = ' SELECT *  FROM "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" WHERE ' +
                    ' IDDETALHEENTRADA = ? AND STATIVO=\'True\' AND STESTOQUE=\'False\' ORDER BY "IDDETPEDIDODETNOTA" DESC LIMIT 1';
                    
                let regVincDetUltmoReg = api.sqlQuery(queryVincDetPedDetNFEUltimoReg, parseInt(regVincDet[j].IDDETALHEENTRADA));
                
                //Atualiza a quantidade do ultimo item ativo da nota no vinculo
                let queryAtualizaStatusVincDetPedDetNFEUltimoReg = 'UPDATE "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" SET ' + 
                    ' STATIVO=\'False\' ' +
            		' WHERE "IDDETPEDIDODETNOTA" =  ? ';
                    
                let pStmtAtualizaStatusUltimoVinc = conn.prepareStatement(api.replaceDbName(queryAtualizaStatusVincDetPedDetNFEUltimoReg));
                    
                pStmtAtualizaStatusUltimoVinc.setInt(1, parseInt(regVincDet[j].IDDETPEDIDODETNOTA));
                pStmtAtualizaStatusUltimoVinc.execute();
                pStmtAtualizaStatusUltimoVinc.close();*/
                
                //Atualiza os dados do Item na nota fiscal
                let queryAtualizaDetNFE = 'UPDATE "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" SET ' + 
                    ' "STDIVERGENCIA" = ?, ' +
                    ' "DSOBSERVACAODIVERGENCIA" = ?, ' +
                    ' "QTDDIVERGENCIA" = ? ' +
                	' WHERE "IDDETALHEENTRADA" =  ? ';
            	
            	let pStmtAtualizaDetNFE = conn.prepareStatement(api.replaceDbName(queryAtualizaDetNFE));
    
            	setStringOrNull(pStmtAtualizaDetNFE, 1, stDivergencia);
            	setStringOrNull(pStmtAtualizaDetNFE, 2, dsObservacaoDivergencia);
            	setIntOrNull(pStmtAtualizaDetNFE, 3, qtdDivergencia);
            	pStmtAtualizaDetNFE.setInt(4, parseInt(regVincDet[j].IDDETALHEENTRADA));
                pStmtAtualizaDetNFE.execute();
                pStmtAtualizaDetNFE.close();
                conn.commit();
                
                return {
                   qtdNota,
                   stDivergencia,
                   qtdDivergencia,
                   dsObservacaoDivergencia,
                   obs: parseInt(regVincDet[j].IDDETALHEENTRADA)
                }
            } 
        }else{
            return{msg: 'nada'}
        }
        
	}
    
}

function fnHandleGet(byId) {
    
    var idDetPedido = $.request.parameters.get("idDetPedido");
    var idDetProdPedido = $.request.parameters.get("idDetProdPedido");
    var idProduto = $.request.parameters.get("idProduto");

    var query =  `SELECT
       *
    FROM
    	"VAR_DB_NAME"."VINCDETPEDIDODETNOTA" 
    WHERE
    	1 = ? AND STATIVO = 'True'`;
    
    if ( byId ) {
        query = query + ' And  IDDETPEDIDODETNOTA = \'' + byId + '\' ';
    }
    
    if ( idDetPedido ) {
        query = query + ' And  IDDETALHEPEDIDO = \'' + idDetPedido + '\' ';
    }
    
    if (idDetProdPedido) {
        query = query + ' And  IDDETALHEPRODUTOPEDIDO = \'' + idDetProdPedido + '\' ';
    }
    
    if (idProduto) {
        query = query + ' And  IDPRODUTO = \'' + idProduto + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    }
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let desfazer = $.request.parameters.get("desfazer");
    let bodyJson = JSON.parse($.request.body.asString()); 
    
    if(desfazer){
        let lstDetProdPedido = bodyJson;
        return fnDesfazQtdVinculado(lstDetProdPedido, conn)
    } else{
    
        var query = 'UPDATE "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" SET ' + 
            ' "STDIVERGENCIA" = ?, ' +
            ' "DSOBSERVACAODIVERGENCIA" = ?, ' +
            ' "QTDDIVERGENCIA" = ? ' +
        	' WHERE "IDRESUMOENTRADA" =  ? AND "IDDETALHEENTRADA" =  ? ';
            
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
    
        for (var i = 0; i < bodyJson.length - 1; i++) {
    
    		var registro = bodyJson[i];
    
            pStmt.setString(1, registro.STDIVERGENCIA);
            pStmt.setString(2, registro.DSOBSERVACAODIVERGENCIA);
            pStmt.setInt(3, registro.QTDDIVERGENCIA);
            pStmt.setInt(4, registro.IDRESUMOENTRADA);
            pStmt.setInt(5, registro.IDDETALHEENTRADA);
                        
        	pStmt.execute();
        }
        
        fnVinculaQtdPedidoQtdNFE(bodyJson, conn);
        
    	pStmt.close();
    
    	
    	return {
    	    msg : "Produto Conciliado Com Sucesso!"
    	};
    }
}

function fnHandlePost() {
    var conn = $.db.getConnection();
    
    var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDPEDIDONOTA")), 0) + 1 FROM "VAR_DB_NAME"."VINCPEDIDONOTA" WHERE 1 = ? ', 1);
    
    var query = `INSERT INTO "VAR_DB_NAME"."VINCPEDIDONOTA" 
    	( 
    	"IDPEDIDONOTA",
        "IDRESUMOPEDIDO",
    	"IDRESUMOENTRADA"
    	)
		VALUES(?,?,?)`;
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    
	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
        
            pStmt.setInt(1, parseInt(queryId));
        	pStmt.setInt(2, registro.IDRESUMOPEDIDO);
        	pStmt.setInt(3, registro.IDRESUMOENTRADA);

            pStmt.execute();
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