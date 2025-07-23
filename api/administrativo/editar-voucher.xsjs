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
    //  criar uma logica para que usuario não possa cancelar ou negar voucher na logica de diferença de dias
    
    let funcAutorizadasAcesso = [
        'TI',
        'SUPERVISOR',
    ];
    
    let statusVoucherNaoAutorizados = [
        'NOVO',
        'LIBERADO PARA O CLIENTE',
        'FINALIZADO',
        'NEGADO',
        'CANCELADO',
    ]

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
            TBR.STSTATUS,
              TBR.STTIPOTROCA,
            TBR.STDEVOLUCAOSAP,
            TO_DATE(TBR.DTINVOUCHER) AS DTINVOUCHER,
            ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIAS_APOS_CRIACAO
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

    let diasAposCriacao = Number(DadosVoucher[0].DIAS_APOS_CRIACAO || 0); 
    let stDevolucaoSap = DadosVoucher[0].STDEVOLUCAOSAP;
    let dataHoraVenda = DadosVoucher[0].DTHORAFECHAMENTO ? new Date(DadosVoucher[0].DTHORAFECHAMENTO) : new Date();
    let dataHoraAtual = new Date();
    
    dataHoraVenda.setUTCHours(0, 0, 0, 0);
    dataHoraAtual.setUTCHours(0, 0, 0, 0);
    
    diferencaEmDias = Math.ceil(Math.abs(dataHoraAtual - dataHoraVenda) / (1000 * 60 * 60 * 24));
    
    if(diferencaEmDias > 180){
        throw {
            message: `ACESSO NEGADO! Voucher fora do Prazo de Troca de Status! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias}`
        }
    }
    
    if(dataFunc[0].DSFUNCAO !== 'TI'){
        if(dataFunc[0].DSFUNCAO.trim() !== 'SUPERVISOR'){
            if(IDEMPRESALOGADA !== dataFunc[0].IDEMPRESA){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão Nessa Loja, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
            
            if(IDGRUPOEMPRESARIAL !== dataFunc[0].IDGRUPOEMPRESARIAL){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão Em Lojas Deste Grupo Empresarial, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
        }
        
        if(diferencaEmDias > 32 && diferencaEmDias <= 60 && !funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
            throw {
                message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
            }
        }
        
        if(DadosVoucher[0].STTIPOTROCA !== 'DEFEITO') {
            
            if(diferencaEmDias > 60 && !funcAutorizadasUpdateAte180Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())) {
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com a Supervisão!'
                }
            }
        }
        
        if((dataFunc[0].IDGRUPOEMPRESARIAL == 4 || IDGRUPOEMPRESARIAL == 4)){
            if(!funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())) {
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
        }
        
        if(statusVoucherNaoAutorizados){
            
        }
    }
    
    return {
        data: dataFunc
    };
}

// function fnAuthUserUpdate(dadosAuth) {
//     let { IDFUNCIONARIO, IDVOUCHER, STSTATUS } = dadosAuth || false;
//     let diferencaEmDias;
    
//     let funcAutorizadasAcesso = [
//         'TI',
//         'SUPERVISOR',
//     ];
    
//     if(!IDFUNCIONARIO) {
//         throw {
//             message: 'Usuário não encontrado!'
//         }
//     }
    
//     if(!IDVOUCHER) {
//         throw {
//             message: 'Usuário não encontrado!'
//         }
//     }
    
//     let queryFunc = `
//         SELECT
//             tbf.IDFUNCIONARIO,
//             TBE.IDGRUPOEMPRESARIAL,
//             TBE.IDSUBGRUPOEMPRESARIAL,
//             tbf.IDEMPRESA,
//             tbf.NOFUNCIONARIO,
//             tbf.IDPERFIL,
//             UPPER(tbf.DSFUNCAO) AS DSFUNCAO,
//             tbf.STATIVO
//         FROM
//             "VAR_DB_NAME".FUNCIONARIO tbf
//         INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
//             TBF.IDEMPRESA = TBE.IDEMPRESA
//         WHERE
//             tbf.IDFUNCIONARIO = ?
//             AND tbf.STATIVO = 'True' 
//     `;
    
//     let queryVoucher = `
//         SELECT 
//             TBR.IDRESUMOVENDAWEB,
//             (SELECT STCANCELADO FROM "VAR_DB_NAME".VENDA WHERE IDVENDA = TBR.IDRESUMOVENDAWEB) AS STCANCELADO_VENDA,
//             TBR.STSTATUS,
//             ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIAS_DE_CRIACAO
//         FROM
//             "VAR_DB_NAME".RESUMOVOUCHER TBR
//         WHERE 
//             TBR.IDVOUCHER = ?
//     `;
    
//     let dataFunc = api.sqlQuery(queryFunc, IDFUNCIONARIO);
//     let DadosVoucher = api.sqlQuery(queryVoucher, IDVOUCHER);
    
//     if(!DadosVoucher.length){
//         throw {
//             message: 'Voucher Não Localizado'
//         }
//     }

//     if(!dataFunc.length){
//         throw {
//             message: 'Usuário inválido!'
//         }
//     }
    
//     if(!funcAutorizadasAcesso.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
//         throw {
//             message: 'ACESSO NEGADO! Usuário Sem Permissão!'
//         }
//     }
    
//     let stCanceladoVendaVoucher = DadosVoucher[0].STCANCELADO_VENDA;
//     let diasAposCriacaoVoucher = Number(DadosVoucher[0].DIAS_DE_CRIACAO);
    
//     if(stCanceladoVendaVoucher == 'False' && diasAposCriacaoVoucher > 3 && (STSTATUS == 'NEGADO' || STSTATUS == 'CANCELADO')){
//         throw {
//             message: `ACESSO NEGADO! Não é permitido o cancelamento de vouchers com mais de 3 dias de criação, já se passaram: ${diasAposCriacaoVoucher} dias!`
//         }
//     }
    
//     if(stCanceladoVendaVoucher == 'True' && (STSTATUS !== 'NEGADO' || STSTATUS !== 'CANCELADO')){
//         throw {
//             message: 'ACESSO NEGADO! Não é permitida a mudança de status do voucher porque a venda de origem foi cancelada, entre em contato com o suporte de vendas!'
//         }
//     }
    
//     return true;
// }

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
    
    if(detalheProdVoucher.length && detalheProdVoucher[0].STTIPOTROCA !== 'TROCO'){
        
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
        
        let queryVoucher = `
            SELECT 
                *
            FROM
                "VAR_DB_NAME".RESUMOVOUCHER
            WHERE 
                IDVOUCHER = ?
            
        `;
        
        let regVoucher = api.sqlQuery(queryVoucher, IDVOUCHER);
        
        if(regVoucher.length){
            
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

function fnHandleGet(byId) {

    var numeroVoucher = $.request.parameters.get("numeroVoucher");
    var subgrupoEmpresa = $.request.parameters.get("subgrupoEmpresa");
    var id = $.request.parameters.get("id");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var dadosVoucher = $.request.parameters.get("dadosVoucher");
    var stStatus = $.request.parameters.get("stStatus");
    
	let query =`
	    SELECT 
       	  tbrv.IDVOUCHER,  
       	  tbrv.IDEMPRESAORIGEM,  
       	  tbrv.IDCAIXAORIGEM,  
       	  tbrv.IDVENDEDOR,  
       	  tbrv.IDNFEDEVOLUCAO,  
       	  tbrv.IDRESUMOVENDAWEB,  
       	  tbcliente.IDCLIENTE,  
       	  tbcliente.DSNOMERAZAOSOCIAL, 
       	  tbcliente.DSAPELIDONOMEFANTASIA,  
       	  tbcliente.NUCPFCNPJ,  
       	  tbrv.IDRESUMOVENDAWEBDESTINO,  
       	  tbrv.STSTATUS,  
       	  tbrv.STTIPOTROCA,  
       	  tbrv.MOTIVOTROCA,  
       	  tbrv.IDUSRLIBERACAOCRIACAO,
       	  tbrv.IDUSRINVOUCHER,
          tbfuncionario.NOFUNCIONARIO AS NOFUNCIONARIOLIBERACAOCRIACAO, 
       	  tbrv.IDUSRLIBERACAOCONSUMO, 
       	  (SELECT NOFUNCIONARIO FROM  "VAR_DB_NAME".FUNCIONARIO WHERE IDFUNCIONARIO = tbrv.IDUSRLIBERACAOCONSUMO) AS NOFUNCIONARIOLIBERACAOCONSUMO,
       	  tbrv.DTINVOUCHER,
	      TO_VARCHAR(tbrv.DTINVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTINVOUCHERFORMATADO,  
	      tbrv.DTOUTVOUCHER,
	      TO_VARCHAR(tbrv.DTOUTVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTOUTVOUCHERFORMATADO,  
    	  tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  
    	  LEFT(tbrv.NUVOUCHER, 5) || LPAD('', LENGTH(tbrv.NUVOUCHER) - 8, '*') || RIGHT(tbrv.NUVOUCHER, 4) AS NUVOUCHERFORMATOCULTO,
    	  tbrv.NUVOUCHER,
    	  tbrv.VRVOUCHER,  
    	  tbrv.STATIVO,  
    	  tbrv.STCANCELADO,  
    	  CAST(tbrv.DSMOTIVOCANCELAMENTO AS VARCHAR(255)) AS DSMOTIVOCANCELAMENTO,
    	  tbemporigem.IDSUBGRUPOEMPRESARIAL AS SUBGRUPOEMPORIGEM, 
    	  tbemporigem.NORAZAOSOCIAL AS RAZAOEMPORIGEM, 
	      tbemporigem.NOFANTASIA AS EMPORIGEM, 
	      tbemporigem.NUCNPJ AS CNPJEMPORIGEM, 
	      tbemporigem.EENDERECO AS ENDEMPORIGEM, 
	      tbemporigem.EBAIRRO AS BAIRROEMPORIGEM, 
	      tbemporigem.ECIDADE AS CIDADEEMPORIGEM, 
	      tbemporigem.SGUF AS SGUFEMPORIGEM, 
	      tbemporigem.EEMAILCOMERCIAL AS EMAILEMPORIGEM, 
	      tbemporigem.NUTELCOMERCIAL AS NUTELEMPORIGEM, 
	      tbempdestino.NOFANTASIA AS EMPDESTINO,
	      tbcdestino.DSCAIXA AS DSCAIXADESTINO,
	      tbv.DTHORAFECHAMENTO AS DTHORAFECHAMENTOVENDAORIGEM
        FROM 
            "VAR_DB_NAME".RESUMOVOUCHER as tbrv 
        LEFT JOIN "VAR_DB_NAME".VENDA tbv ON tbrv.IDRESUMOVENDAWEB = tbv.IDVENDA
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcorigem ON tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB 
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcdestino ON tbrv.IDCAIXADESTINO = tbcdestino.IDCAIXAWEB 
	    LEFT JOIN "VAR_DB_NAME".EMPRESA as tbemporigem ON tbrv.IDEMPRESAORIGEM = tbemporigem.IDEMPRESA 
	    LEFT JOIN "VAR_DB_NAME".EMPRESA as tbempdestino ON tbrv.IDEMPRESADESTINO = tbempdestino.IDEMPRESA 
	    LEFT JOIN "VAR_DB_NAME".CLIENTE as tbcliente ON tbrv.IDCLIENTE = tbcliente.IDCLIENTE 
	    LEFT JOIN "VAR_DB_NAME".FUNCIONARIO as tbfuncionario ON tbrv.IDUSRLIBERACAOCRIACAO = tbfuncionario.IDFUNCIONARIO 
        WHERE 1 = ?
	`;
     
    if(id) {
        query = query + ' AND tbrv.IDVOUCHER = \'' + id + '\' ';
    }
    
    if(byId) {
        query = query + ' AND tbrv.IDVOUCHER = \'' + byId + '\' ';
    }
    
    if(stStatus){
        query += ` AND tbrv.STTIPOTROCA = 'DEFEITO' AND tbrv.STSTATUS = 'EM ANALISE' `;
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + 'AND (tbrv.DTINVOUCHER BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    if(subgrupoEmpresa){
        query = query + ' AND tbemporigem.IDSUBGRUPOEMPRESARIAL = \'' + subgrupoEmpresa + '\' ';
    }
    
    if(idEmpresa){
        query = query + `AND CONTAINS((tbrv.IDEMPRESAORIGEM, tbrv.IDEMPRESADESTINO), '${idEmpresa}')`;
    }
    
    if(dadosVoucher){
        query += subgrupoEmpresa ? ` AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}') AND tbemporigem.IDSUBGRUPOEMPRESARIAL = ${subgrupoEmpresa}` : ` AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}')`;
    }
    
    if(numeroVoucher){
        query += ` And  tbrv.NUVOUCHER = '${numeroVoucher}' AND STATIVO = 'True' `;
    }
    
   query = query + ' ORDER BY tbrv.DTINVOUCHER ';
 
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
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
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}