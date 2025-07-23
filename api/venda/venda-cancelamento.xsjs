var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var libIntegracao = $.import("quality.concentrador_homologacao.api.service-layer.devolucao", "devolucao-integracao");
var libDevolucao = $.import("quality.concentrador_homologacao.api.service-layer.devolucao", "devolucao");
var dbNameSAP = "SBO_GTO_TESTE4";

let conn;
let msg;

function fnVerificarIntegracaoVenda(idVenda){
    let queryVerificaIntegracao = `
        SELECT 
            T1."DocEntry"
        FROM
            ${dbNameSAP}.OINV T1
        WHERE
            T1."CANCELED" = 'N' AND
            T1."U_ID_VENDA_PDV" = ?
    `;
    
    let regVenda = api.sqlQuery(queryVerificaIntegracao, idVenda);    
    
    if(regVenda.length){
        let stMigrado = `
            SELECT
                *
            FROM
                "VAR_DB_NAME".VENDA
            WHERE
                SAP_MIGRADO = true
                AND SAP_DOCENTRY IS NOT NULL
                AND IDVENDA = ?
        `;
        
        let regVendaMigrada = api.sqlQuery(stMigrado, idVenda); 
        
        if(!regVendaMigrada.length){
            let query = `
                UPDATE 
                    "VAR_DB_NAME"."VENDA" 
                SET
                    SAP_MIGRADO = true,
                    SAP_DOCENTRY = ?
                WHERE 
                    IDVENDA = ?
            `;
         	
         	let pStmt = conn.prepareStatement(api.replaceDbName(query));
         
         	pStmt.setInt(1, parseInt(regVenda[0]["DocEntry"]));
         	pStmt.setString(2, idVenda);
         	pStmt.execute();
         	
         	pStmt.close();
         
         	conn.commit();
        }
        
        return true;
    }
    
    return false;
}

function fnIntegrarVenda(idVenda) {
    return libIntegracao.integrarVenda(idVenda);
}

function cancelarVendaDetalhe(idVenda, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDADETALHE" 
        SET 
            "STCANCELADO" = 'True'
		WHERE 
		    "IDVENDA" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
   	pStmt.setString(1, idVenda);
    pStmt.execute();
    pStmt.close();
}

function cancelarVendaPagamento(idVenda, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDAPAGAMENTO" 
        SET 
            "STCANCELADO" = 'True'
		WHERE 
            "IDVENDA" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
   	pStmt.setString(1, idVenda);
    pStmt.execute();
    pStmt.close();
    
}

function fnGeraDevolucaoNoSap(idVenda, dadosVenda){
    let queryValidaDevolucao = `
        SELECT
            "DocEntry" as DOC_ENTRY_DEV
        FROM 
            ${dbNameSAP}.ORIN
        WHERE
            "U_ID_VENDA_PDV" = ?
    `;
    
    let resultDevolucao = api.sqlQuery(queryValidaDevolucao, idVenda);
    
    if(!resultDevolucao.length){
        return libDevolucao.gerarDevolucaoVenda(idVenda, dadosVenda);
    }
    
    return true;
}

function fnIncluirInventarioMovimento(idVenda, conn) {
    var qtdInicio = 0;
    var qtdEntradaVoucher = 0;
	var qtdEntrada = 0;
	var qtdSaida = 0;
	var qtdSaidaTransferencia = 0;
	var qtdRetornoAjustePedido = 0;
	var qtdFinal = 0;
	var qtdAjusteBalanco = 0;
	
	var queryDetalheVenda = `
        SELECT 
            IDEMPRESA, 
            CPROD, 
            QTD 
        FROM 
            "VAR_DB_NAME"."VENDA" TBV
        INNER JOIN 
            "VAR_DB_NAME"."VENDADETALHE" TBVD ON TBVD.IDVENDA = TBV.IDVENDA
        WHERE 
            (TBVD.STCANCELADO = 'False' OR TBVD.STCANCELADO IS NULL) 
            AND TBV.IDVENDA=? 
    `;
	let teste = []
	var lstProdMov = api.sqlQuery(queryDetalheVenda, idVenda);
	
	var date = new Date();
	var dd = ("0" + date.getDate()).slice(-2);
    var mm = ("0" + (date.getMonth() + 1)).slice(-2);
    var y = date.getFullYear();
 
    var dataCancelamento = y + '-' + mm + '-' + dd;
	
    for (var i = 0; i < lstProdMov.length; i++) {
        var registro = lstProdMov[i];
        
        var queryExistsMov = ' SELECT * FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.CPROD+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + dataCancelamento + ' 00:00:00\' AND \'' + dataCancelamento + ' 23:59:59\') AND STATIVO=\'True\''  +
        ' AND IDEMPRESA = ? ';
      
        var idMovExists = api.sqlQuery(queryExistsMov, parseInt(registro.IDEMPRESA));
        
        if(idMovExists.length === 0){
            
            var queryMovAnt = 'SELECT * '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.CPROD+'\''+
            ' AND IDEMPRESA = ? ';
            
            var UltMovimentoProduto = api.sqlQuery(queryMovAnt, parseInt(registro.IDEMPRESA));
           
            if(UltMovimentoProduto.length > 0){
               
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL || 0);
               qtdEntrada = parseInt(registro.QTD || 0);
               qtdFinal = qtdInicio + qtdEntrada;
               //Atualiza o status para false do Ultimo Movimento
               var queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmtAtualizaStatus = conn.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
                
            }else{
                
               qtdEntrada = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntrada;
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
            	
            pStmt.setInt(1, parseInt(registro.IDEMPRESA));
            pStmt.setString(2, registro.CPROD);
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
            
            qtdEntrada = parseInt(idMovExists[0].QTDENTRADA || 0) + parseInt(registro.QTD);
            qtdEntradaVoucher = parseInt(idMovExists[0].QTDENTRADAVOUCHER || 0);
            qtdFinal = parseInt(idMovExists[0].QTDINICIO || 0) + qtdEntrada + qtdEntradaVoucher - parseInt(idMovExists[0].QTDSAIDA || 0) - parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA || 0);
           
            var queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "QTDENTRADA" =  ?, ' +
                ' "QTDFINAL" =  ? ' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
            
            var pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
            
            
            pStmt2.setInt(1, qtdEntrada);
            pStmt2.setInt(2, qtdFinal);
            
            pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
            pStmt2.execute();
            pStmt2.close();
            
        }
        
        conn.commit()
    }
    
}

function fnCancelarVendaQualityMovimentaEstoque(dadosVenda, conn){
    let updateVendaCancel = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET 
            "STATIVO" = 'False',
            "STCANCELADO" = 'True',
            "STCANCELADOWEB" = 'True',
            "DTCANCELAMENTOWEB" = now(),
            "DTULTALTERACAO" = now(),
            "IDUSUARIOCANCELAMENTO" = ?,
            "TXTMOTIVOCANCELAMENTO" = ?
		WHERE "IDVENDA" =  ? 
	`;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(updateVendaCancel));

    pStmt.setInt(1, dadosVenda.IDUSUARIOCANCELAMENTO);
    pStmt.setString(2, dadosVenda.TXTMOTIVOCANCELAMENTO);
    pStmt.setString(3, dadosVenda.IDVENDA);
    
 	cancelarVendaDetalhe(dadosVenda.IDVENDA, conn);
    cancelarVendaPagamento(dadosVenda.IDVENDA, conn);
 	fnIncluirInventarioMovimento(dadosVenda.IDVENDA, conn);
 	
 	pStmt.execute();
    pStmt.close();
    
    conn.commit();
}

function fnVerificaDadosVenda(arrayDadosVenda){
  //  $.response.status = 400;
    
    if(arrayDadosVenda.length){
        for(let i = 0; i < arrayDadosVenda.length; i++){
            let dadosVenda = arrayDadosVenda[i];
            
            for (let prop in dadosVenda) {
                if(!dadosVenda[prop]){
                    return {
                        type: 'warning',
                        msg: `Venda não cancelada, o campo de || ${prop} || está vazio, preencha-o e tente novamente!`
                    };
                    
                    break;
                }
            }
            
            let queryVenda = `
                SELECT
                	ABS(SECONDS_BETWEEN(CURRENT_TIMESTAMP, DTHORAFECHAMENTO)) AS DIFTEMPOEMSEGUNDOS,
                	*
                FROM
                	"VAR_DB_NAME".VENDA
                WHERE
                	STCANCELADO = 'False' AND 
                	IDVENDA = ? 
            `;
            
            let regVenda = api.sqlQuery(queryVenda, dadosVenda.IDVENDA);
            
            if(regVenda.length){
                for(let j = 0; j < regVenda.length; j++){
                    let venda = regVenda[j];
                    let idVenda = venda.IDVENDA;
                    let tempoNfce = Number(venda.DIFTEMPOEMSEGUNDOS);
                    let stSefaz = venda.PROTNFE_INFPROT_CSTAT;
                    //return fnCancelarVendaQualityMovimentaEstoque(dadosVenda, conn);
                    
                    if(tempoNfce > 1800){
                        conn = $.db.getConnection();
                        
                        if(stSefaz == 100){
                            if(fnVerificarIntegracaoVenda(idVenda)){
                                if(fnGeraDevolucaoNoSap(idVenda, dadosVenda)){
                                    fnCancelarVendaQualityMovimentaEstoque(dadosVenda, conn);
                                } else {
                                    return {
                                        type: 'warnig',
                                        msg: 'Venda não cancelada, não foi possivel gerar a devolução da venda no SAP, tente novamente!'
                                    };
                                    
                                    break;
                                }
                            } else {
                                if(fnIntegrarVenda(idVenda)){
                                    if(fnGeraDevolucaoNoSap(idVenda, dadosVenda)){
                                        fnCancelarVendaQualityMovimentaEstoque(dadosVenda, conn);
                                    } else {
                                        return {
                                            type: 'warnig',
                                            msg: 'Venda não cancelada, não foi possivel gerar a devolução da venda no SAP, tente novamente!'
                                        };
                                        
                                        break;
                                    }
                                } else {
                                    return {
                                        type: 'warnig',
                                        msg: 'Venda não cancelada, não foi possivel integrar a venda no SAP, tente novamente!'
                                    };
                                    
                                    break;
                                }
                            }
                        } else {
                            fnCancelarVendaQualityMovimentaEstoque(dadosVenda, conn);
                        }
                    } else {
                        return {
                            type: 'info',
                            msg: 'Venda dentro do prazo, Faça o cancelamento pelo PDV!'
                        }
                        break;
                    }
                }
                
            } else{
                return {
                    type: 'warning',
                    msg: `Venda( ${dadosVenda.IDVENDA} ) não Encontrada ou já cancelada!`
                };
                
                break;
            }
            
        }
        
        $.response.status = $.net.http.OK;
        
        return {
            type: 'success',
            msg : "Cancelamento realizado com sucesso!"
     	};
        
    } else {
        return {
            type: 'warning',
            message: 'Venda não cancelada, os dados enviados estão vazios!'
        };
    }
    
}

$.response.status = $.net.http.OK;
$.response.contentType = 'application/json';

try {
	switch ($.request.method) {
        
		//Handle your PUt calls here
        case $.net.http.PUT:
            
            var bodyJson = JSON.parse($.request.body.asString()); 
            var docReturn = fnVerificaDadosVenda(bodyJson);
            
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
    
    conn.rollback();
    
    var detalheErro = e.stack.split('\n');
    
    detalheErro = detalheErro.length > 3 ? detalheErro[1].trim() : detalheErro[ detalheErro.length - 3].trim()
    
    if(detalheErro){
       detalheErro = `Linha: ${detalheErro.split(':')[1]} da Funcao ${detalheErro.split('@').shift()}()`;
    }
    
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message,
		detalheErro
	}));
	$.response.status = 400;
}