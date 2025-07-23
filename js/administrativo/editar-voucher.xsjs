let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function padLeft(number, length, character) {
	if(character == null) {
		character = '0';
    }
	var result = String(number);
	for(var i = result.length; i < length; ++i) {
		result = character + result;
	}
	return result;
}

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

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

function setFloatOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setFloat(fieldId, value);
}

function fnAuthUserUpdate(dadosAuth) {
    let { IDFUNCIONARIO, IDVOUCHER } = dadosAuth || false;
    let diferencaEmDias;
    
    let funcAutorizadasAcesso = [
        'TI',
        'SUPERVISOR',
    ];
    
    if(!IDFUNCIONARIO) {
        throw {
            message: 'Usuário não encontrado!'
        }
    }
    
    if(!IDVOUCHER) {
        throw {
            message: 'Usuário não encontrado!'
        }
    }
    
    let queryFunc = `
        SELECT
            tbf.IDFUNCIONARIO,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDSUBGRUPOEMPRESARIAL,
            tbf.IDEMPRESA,
            tbf.NOFUNCIONARIO,
            tbf.IDPERFIL,
            UPPER(tbf.DSFUNCAO) AS DSFUNCAO,
            tbf.STATIVO
        FROM
            "VAR_DB_NAME".FUNCIONARIO tbf
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBF.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            tbf.IDFUNCIONARIO = ?
            AND tbf.STATIVO = 'True' 
    `;
    
    let queryVoucher = `
        SELECT 
            TBR.IDRESUMOVENDAWEB,
            (SELECT DTHORAFECHAMENTO FROM "VAR_DB_NAME".VENDA WHERE IDVENDA = TBR.IDRESUMOVENDAWEB AND STCANCELADO = 'False') AS DTHORAFECHAMENTO,
            TBR.STSTATUS
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        WHERE 
            TBR.IDVOUCHER = ?
    `;
    
    let dataFunc = api.sqlQuery(queryFunc, IDFUNCIONARIO);
    let DadosVoucher = api.sqlQuery(queryVoucher, IDVOUCHER);
    
    if(!DadosVoucher.length){
        throw {
            message: 'Voucher Não Localizado'
        }
    }

    if(!dataFunc.length){
        throw {
            message: 'Usuário inválido!'
        }
    }
    
    if(!funcAutorizadasAcesso.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
        throw {
            message: 'ACESSO NEGADO! Usuário Sem Permissão!'
        }
    }
    
    return true;
}

function fnAtualizaStatusProdutosOrigemVoucher(idVoucher, stAtivo, stCancelado, stStatus, conn){
    let stTroca = 'False';
    
    let queryProdVoucher = `
        SELECT
            TBRV."IDEMPRESAORIGEM",
            TBDV."IDVOUCHER",
            TBDV."IDPRODUTO",
            TBDV."QTD",
            TBRV."STATIVO",
            TBRV."STCANCELADO",
            TBRV."STSTATUS",
            TBRV."STTIPOTROCA"
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBRV
        INNER JOIN DETALHEVOUCHER TBDV ON
            TBRV."IDVOUCHER" = TBDV."IDVOUCHER"
        WHERE
            TBDV."IDVOUCHER" = ?
        ORDER BY
            IDVOUCHER
    `;

    let detalheProdVoucher = api.sqlQuery(queryProdVoucher, idVoucher);
    let lstProd = [];
    
    if(detalheProdVoucher.length && detalheProdVoucher[0].STTIPOTROCA !== 'DEFEITO'){
        
        if (stCancelado  == 'False'){
            stTroca = 'True';
            
            if((stStatus == 'NOVO' || stStatus == 'EM ANALISE' || stStatus == 'LIBERADO PARA O CLIENTE' || stStatus == 'FINALIZADO') && (!detalheProdVoucher[0]['STSTATUS'] || detalheProdVoucher[0]['STSTATUS'] == 'CANCELADO' || detalheProdVoucher[0]['STSTATUS'] == 'NEGADO')) {
               fnIncluirInventarioMovimentoEntrada(detalheProdVoucher[0]['IDEMPRESAORIGEM'], detalheProdVoucher, conn);
            }
            
        } else {
            
            if((stStatus == 'CANCELADO' || stStatus == 'NEGADO') && (!detalheProdVoucher[0]['STSTATUS'] || detalheProdVoucher[0]['STSTATUS'] == 'NOVO' || detalheProdVoucher[0]['STSTATUS'] == 'EM ANALISE' || detalheProdVoucher[0]['STSTATUS'] == 'LIBERADO PARA O CLIENTE' || detalheProdVoucher[0]['STSTATUS'] == 'FINALIZADO')) {
                fnIncluirInventarioMovimentoSaida(detalheProdVoucher[0]['IDEMPRESAORIGEM'], detalheProdVoucher, conn);
            }
            
        }
        
        
        var queryUpdateDetalheVenda = `
            UPDATE 
                "VAR_DB_NAME"."VENDADETALHE" 
            SET
                STTROCA = ? 
            WHERE 
                "IDVOUCHER" = ? 
        `;
        
        var queryUpdateDetalheVoucher = `
            UPDATE 
                "VAR_DB_NAME"."DETALHEVOUCHER" 
            SET
                "STATIVO" = ?, 
                "STCANCELADO" = ?
            WHERE 
                "IDVOUCHER" = ? 
        `;
        
        var pStmtUpdateDetalheVenda = conn.prepareStatement(api.replaceDbName(queryUpdateDetalheVenda));
        var pStmtUpdateDetalheVoucher = conn.prepareStatement(api.replaceDbName(queryUpdateDetalheVoucher));
        
        pStmtUpdateDetalheVenda.setString(1, stTroca);
        pStmtUpdateDetalheVenda.setInt(2, parseInt(idVoucher));
        
        pStmtUpdateDetalheVoucher.setString(1, stTroca);
        pStmtUpdateDetalheVoucher.setString(2, stCancelado);
        pStmtUpdateDetalheVoucher.setInt(3, parseInt(idVoucher));
        
        pStmtUpdateDetalheVenda.execute();
        pStmtUpdateDetalheVoucher.execute();
        
        conn.commit();
        
        pStmtUpdateDetalheVenda.close();
        pStmtUpdateDetalheVoucher.close();
    }
    
    return {
	   msg : "Atualização realizada com sucesso!"
	};
}

function fnInserirHistoricoVoucher(dadosVoucher, conn){
    let { IDVOUCHER, STTIPOTROCA, STSTATUS, IDFUNCIONARIO, DSMOTIVOTROCASTATUS } = dadosVoucher;
    
    let queryInsertHistorico = `
        INSERT INTO
            "VAR_DB_NAME".HISTORICOVOUCHER
        (
            IDRESUMOVOUCHER,
            STTIPOVOUCHER, 
            STATUSVOUCHER, 
            MOTIVOTROCASTATUS,
            IDUSERALTERACAO
        ) 
        VALUES(?, ?, ?, ?, ?)
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsertHistorico));
    
    pStmtInsert.setInt(1, IDVOUCHER);
    pStmtInsert.setString(2, STTIPOTROCA);
    pStmtInsert.setString(3, STSTATUS);
    pStmtInsert.setString(4, DSMOTIVOTROCASTATUS);
    pStmtInsert.setInt(5, IDFUNCIONARIO);
    
    pStmtInsert.execute();
    
    pStmtInsert.close();
}

function fnIncluirInventarioMovimentoEntrada(idEmpresa, lstProd, conn) {
    var qtdInicio = 0;
	var qtdEntrada = 0;
	var qtdSaida = 0;
	var qtdSaidaTransferencia = 0;
	var qtdRetornoAjustePedido = 0;
	var qtdFinal = 0;
	var qtdAjusteBalanco = 0;
	var qtdEntradaVoucher = 0;
	
	var date = new Date();
	var dd = ("0" + date.getDate()).slice(-2);
    var mm = ("0" + (date.getMonth() + 1)).slice(-2);
    var y = date.getFullYear();
 
    var dataVoucher = y + '-' + mm + '-' + dd;
    var conn2 = conn; //$.db.getConnection();
		
    for (var i = 0; i < lstProd.length; i++) {
        var registro = lstProd[i];
        
        var queryExistsMov = ' SELECT *  FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + dataVoucher + ' 00:00:00\' AND \'' + dataVoucher + ' 23:59:59\')' +
        ' AND IDEMPRESA = ? AND STATIVO=\'True\'';
    
         var idMovExists = api.sqlQuery(queryExistsMov, parseInt(idEmpresa));
         
           
        if(idMovExists.length === 0){
            qtdInicio = 0;
            var queryMovAnt = 'SELECT * '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.IDPRODUTO+'\''+
            ' AND IDEMPRESA = ? ';
            
            var UltMovimentoProduto = api.sqlQuery(queryMovAnt, parseInt(idEmpresa));
            
            if(UltMovimentoProduto.length > 0){
               
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdEntradaVoucher = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
               //Atualiza o status para false do Ultimo Movimento
               var queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
        		' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmtAtualizaStatus = conn2.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
                conn2.commit();
            }else{
                
               qtdEntradaVoucher = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
            }
            
            
    	    var query = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
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
    
        	var pStmt = conn2.prepareStatement(api.replaceDbName(query));
            	
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
    
            qtdEntradaVoucher = parseInt(registro.QTD) + parseInt(idMovExists[0].QTDENTRADAVOUCHER);
            qtdFinal = parseInt(idMovExists[0].QTDINICIO) + parseInt(idMovExists[0].QTDENTRADA) + qtdEntradaVoucher - parseInt(idMovExists[0].QTDSAIDA) - parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA);
            
             var queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "QTDENTRADAVOUCHER" =  ?, ' +
        		' "QTDFINAL" =  ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmt2 = conn2.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
            	pStmt2.setInt(1, qtdEntradaVoucher);
            	pStmt2.setInt(2, qtdFinal);
            	
                pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
                pStmt2.execute();
                pStmt2.close();
                conn2.commit();
        }
        
    }
   
}

function fnIncluirInventarioMovimentoSaida(idempresa, lstProdMov, conn) {
	
	var qtdInicio = 0;
    var qtdEntrada = 0;
	var qtdSaida = 0;
	var qtdSaidaTransferencia = 0;
	var qtdRetornoAjustePedido = 0;
	var qtdFinal = 0;
	var qtdEntradaVoucher = 0;
	var qtdAjusteBalanco = 0;
	
	var date = new Date();
	var dd = ("0" + date.getDate()).slice(-2);
    var mm = ("0" + (date.getMonth() + 1)).slice(-2);
    var y = date.getFullYear();
 
    var data = y + '-' + mm + '-' + dd;

    
    for (var i = 0; i < lstProdMov.length; i++) {
        
        var registro = lstProdMov[i];
        
        let queryExistsMov = ' SELECT * FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + data + ' 00:00:00\' AND \'' + data + ' 23:59:59\')' +
        ' AND IDEMPRESA = ?  and STATIVO=\'True\'';
    
         let idMovExists = api.sqlQuery(queryExistsMov, idempresa);
         
       
        
        if(idMovExists.length === 0){
             
            let queryMovAnt = 'SELECT * '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.IDPRODUTO +'\''+
            ' AND IDEMPRESA = ? ';
            
            let UltMovimentoProduto = api.sqlQuery(queryMovAnt, idempresa);
           
            if(UltMovimentoProduto.length > 0){
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdEntradaVoucher = - parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
               
               //Atualiza o status para false do Ultimo Movimento
               let queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
        		' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                let pStmtAtualizaStatus = conn.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
                conn.commit();
            }else{
               qtdInicio = 0;
               qtdEntradaVoucher = -parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
            }
            
            
    	    var query = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
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
    
        	var pStmt = conn.prepareStatement(api.replaceDbName(query));
            	
            pStmt.setInt(1, parseInt(idempresa));
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
        	
        }else{
            qtdInicio = parseInt(idMovExists[0].QTDINICIO);
            qtdSaida = parseInt(idMovExists[0].QTDSAIDA);
            qtdEntradaVoucher = parseInt(idMovExists[0].QTDENTRADAVOUCHER) - parseInt(registro.QTD);
            qtdFinal = parseInt(idMovExists[0].QTDINICIO) + parseInt(idMovExists[0].QTDENTRADA) + qtdEntradaVoucher - parseInt(idMovExists[0].QTDSAIDA) + parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA);
            
            let queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
             //   ' "QTDSAIDA" =  ?, ' +
        		' "QTDFINAL" =  ?, ' +
        		' "QTDENTRADAVOUCHER" = ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
             let pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
            //pStmt2.setInt(1, parseInt(qtdSaida));
            	
            	pStmt2.setInt(1, parseInt(qtdFinal));
            	
            	pStmt2.setInt(2, parseInt(qtdEntradaVoucher));
            	
                pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
                
                pStmt2.execute();
                pStmt2.close();
                conn.commit();
                
        }
        
    }
   
    conn.commit();
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    let STATIVO;
    let STCANCELADO;
    
    let queryUpdateVoucher = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOVOUCHER" 
        SET
            "STATIVO" = ?,
            "STCANCELADO" = ?,
            "DSMOTIVOCANCELAMENTO" = ?,
            "IDUSRCANCELAMENTO" = ?,
            "STSTATUS" = ?,
            "STTIPOTROCA" = ?,
            "IDUSRULTALTERACAO" = ?,
            "DTULTALTERACAO" = CURRENT_TIMESTAMP
        WHERE 
            "IDVOUCHER" =  ?
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdateVoucher));
    
    for (let i = 0; i < bodyJson.length; i++) {
        
        fnAuthUserUpdate(bodyJson[i]);
        
        let { IDVOUCHER, STTIPOTROCA, STSTATUS, IDFUNCIONARIO, DSMOTIVOTROCASTATUS } = bodyJson[i];
        
        if (STSTATUS == 'NOVO' || STSTATUS == 'LIBERADO PARA O CLIENTE') {
            STATIVO = 'True';
            STCANCELADO = 'False';
        } else if (STSTATUS == 'CANCELADO' || STSTATUS == 'NEGADO') {
            STATIVO = 'False';
            STCANCELADO = 'True';
        } else if (STSTATUS == 'EM ANALISE' || STSTATUS == 'FINALIZADO') {
            STATIVO = 'False';
            STCANCELADO = 'False';
        }
        
        if(IDVOUCHER){
           fnAtualizaStatusProdutosOrigemVoucher(IDVOUCHER, STATIVO, STCANCELADO, STSTATUS, conn)
        }
        
        pStmtUpdate.setString(1, STATIVO);
        pStmtUpdate.setString(2, STCANCELADO);
        setStringOrNull(pStmtUpdate, 3, (STCANCELADO == 'True' ? DSMOTIVOTROCASTATUS : null));
        setIntOrNull(pStmtUpdate, 4, (STCANCELADO == 'True' ? IDFUNCIONARIO : null));
        pStmtUpdate.setString(5, STSTATUS);
        pStmtUpdate.setString(6, STTIPOTROCA);
        pStmtUpdate.setInt(7, IDFUNCIONARIO);
        pStmtUpdate.setInt(8, IDVOUCHER);
        
        fnInserirHistoricoVoucher(bodyJson[i], conn);
        
        pStmtUpdate.execute();
        
    }
    
    pStmtUpdate.close();

    conn.commit();
    
    return {
	    msg : "Atualização realizada com sucesso!"
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
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}