let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

function getBandeiraCartao(tPag, tBand){
    if(tPag == '03') { // Crédito
        switch(tBand) {
            case '01': return '003'; // Visa Crédito
            case '02': return '001'; // MasterCard Crédito
            case '03': return '015'; // Amex
            case '04': return '019'; // SoroCred Crédito
            case '05': return '018'; // Diners Club
            case '06': return '014'; // Elo
            case '07': return '006'; // Hipercard
            case '09': return '005'; // Cabal
            case '12': return '016'; // Credz
            case '13': return '011'; // JCB Crédito
            default: return false;
        }
    }
    
    if(tPag == '04') { // Débito
        switch(tBand) {
            case '01': return '004'; // Visa Débito
            case '02': return '002'; // MasterCard Débito
            case '04': return '020'; // SoroCred Débito
            case '13': return '017'; // JCB Débito
            default: return false;
        }
    }
    
    return false;
}

function getDadosFormaPagamento(codigo) {
    let query = `
        SELECT
	        A.CODIGO,
	        A.NOME
        FROM
        	"VAR_DB_NAME".FORMAPAGAMENTO A
        WHERE
        	1 = ?
        	AND A.CODIGO = '${codigo}'
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length) return respQuery[0];
    
    return false;
}

function getDadosPagamento(item) {
    if(item.tPag == '90') return {status: false, message: `Não existe pagamento para a venda.`};
    
    if(item.tPag == '03' || item.tPag == '04') {
        let codigoBandeiraCartao;
        
        if(!item.card.tBand) {
            codigoBandeiraCartao = item.tPag == '03' ? '026' : '027';
        } else {
            codigoBandeiraCartao = getBandeiraCartao(item.tPag, item.card.tBand);
        }
        
        if(!codigoBandeiraCartao) return {status: false, message: `Não foi encontrada um código correspondente no quality para o pagamento.`}
        
        let dadosCartao = getDadosFormaPagamento(codigoBandeiraCartao);
        
        if(dadosCartao !== false) {
            let objDadosCartao = {
                CODIGO: dadosCartao.CODIGO,
                NOME: dadosCartao.NOME,
                TEF: 'TEF',
                NUAUTORIZACAO: item.card.cAut,
                NOCARTAO: 'Não informado'
            }
            
            return {status: true, message: objDadosCartao};
        }
            
        
        return {status: false, message: `Erro ao consultar o pagamento no SoftQuality.`}
    }
    
    if(item.tPag == '17') {
        let dadosPix = {
            CODIGO: '025',
            NOME: 'PIX',
            TEF: 'PIX',
            NUAUTORIZACAO: '',
            NOCARTAO: 'Não informado'
        }
        
        return {status: true, message: dadosPix};
    }
    
    if(item.tPag == '99') {
        let dadosPgtoOutros = {
            CODIGO: '099',
            NOME: 'Outros',
            TEF: 'Outros',
            NUAUTORIZACAO: '',
            NOCARTAO: 'Outros'
        }
        
        return {status: true, message: dadosPgtoOutros};
    }
    
    return {status: false, message: `Erro ao consultar as formas de pagamento`};
}

function executarInsertTabelaVendaPagamento(idvenda, dataVenda, dataVencimento, numeroItem, item, qtdParcelas, conn) {
    let formaPagamento = getDadosPagamento(item);
    
    if(!formaPagamento.status) return formaPagamento.message;
    
    let dadosFormaPagamento = formaPagamento.message;
    
    let queryInsert = `
        INSERT INTO "VAR_DB_NAME".VENDAPAGAMENTO
            (
            	IDVENDAPAGAMENTO,
            	IDVENDA,
            	NITEM,
            	TPAG,
            	DSTIPOPAGAMENTO,
            	VALORRECEBIDO,
            	VALORDEDUZIDO,
            	VALORLIQUIDO,
            	DTPROCESSAMENTO,
            	DTVENCIMENTO,
            	NOTEF,
            	NOCARTAO,
            	NUAUTORIZACAO,
            	NPARCELAS,
            	VALOR,
            	STCANCELADO,
            	STECOMMERCE
            )
            VALUES(
                ?, ?, ?, ?, ?, ?, ?, ?, TO_DATE(?), TO_DATE(?),
                ?, ?, ?, ?, ?, 'False', 'True'
                );
    `;
    
    let cont = 0;
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    try {
        pStmt.setString(++cont, `${idvenda}-${numeroItem}`);
        pStmt.setString(++cont, idvenda);
        pStmt.setInt(++cont, numeroItem);
        pStmt.setString(++cont, dadosFormaPagamento.CODIGO);
        pStmt.setString(++cont, dadosFormaPagamento.NOME);
        pStmt.setDecimal(++cont, Number(item.vPag));
        pStmt.setDecimal(++cont, 0);
        pStmt.setDecimal(++cont, Number(item.vPag));
        pStmt.setString(++cont, dataVenda);
        pStmt.setString(++cont, dataVencimento);
        pStmt.setString(++cont, dadosFormaPagamento.TEF);
        pStmt.setString(++cont,dadosFormaPagamento.NOCARTAO);
        pStmt.setString(++cont, dadosFormaPagamento.NUAUTORIZACAO);
        pStmt.setInt(++cont, Number(qtdParcelas || null));
        pStmt.setDecimal(++cont, Number(item.vPag || 0));
    
        pStmt.execute();
    	conn.commit();
    	
    	return true;
    } catch(error) {
        return error;
    } finally {
        pStmt.close();
    }
}

function prepararInsertPagamentoParcelamento(idvenda, dataVenda, contadorPagamento, item, cobrDup, conn) {
    for (let i = 0; i < cobrDup.length; i++) {
        let itemParcela = cobrDup[i];
        
        let itemParcelaInsert = {
            tPag: item.tPag,
            card: {tBand: item.card.tBand, cAut: item.card.cAut},
            vPag: itemParcela.vDup
        }
        
        let respInsertVendaPagamento = executarInsertTabelaVendaPagamento(idvenda, dataVenda, itemParcela.dVenc, contadorPagamento, itemParcelaInsert, cobrDup.length, conn)
        
        if(respInsertVendaPagamento !== true) {
            return {
                status: false,
                message: `Inserção do pagamento ${contadorPagamento} - parcela ${i+1} tpag: ${item.tPag} na venda pagamento falhou: ${respInsertVendaPagamento}`
            }
            
        }
        
        contadorPagamento++;
    }
    
    return {
        status: true,
        message: contadorPagamento
    };
}

function prepararInsertTabelaVendaPagamento (idvenda, dataVenda, detPag, cobrDup, conn) {
    let contadorPagamento = 1;
    
    for(let i = 0; i < detPag.length; i++) {
        let item = detPag[i];
        
        let respInsertVendaPagamento = false;
        
        if(item.tPag == '03' && cobrDup !== false) {
            respInsertVendaPagamento = prepararInsertPagamentoParcelamento(idvenda, dataVenda, contadorPagamento, item, cobrDup, conn);
            
            if(!respInsertVendaPagamento.status) return {status: false, message: respInsertVendaPagamento.message}
            
            contadorPagamento = respInsertVendaPagamento.message; // função de parcelamento já efetua o incremento a cada insert
            respInsertVendaPagamento = true;
        } else {
            respInsertVendaPagamento = executarInsertTabelaVendaPagamento(idvenda, dataVenda, dataVenda, contadorPagamento, item, null, conn);
            if(respInsertVendaPagamento == true) contadorPagamento++;
        }
        
        if(respInsertVendaPagamento !== true) {
            return {
                status: false,
                message: `Inserção do pagamento ${i+1} - tpag: ${item.tPag} na venda pagamento falhou: ${respInsertVendaPagamento}`
            }
        }
        
    }
    
    return {
        status: true,
        message: `Todos os pagamentos foram inseridos na venda pagamento.`
    };
}

function validarIntegracaoPagamento(idvenda, totalVenda) {
    let query = `
        SELECT
        	IFNULL(SUM(A.VALORLIQUIDO), 0) AS TOTALVENDAQUALITY
        FROM
        	"VAR_DB_NAME".VENDAPAGAMENTO A
        WHERE
        	1 = ?
        	AND A.IDVENDA = '${idvenda}'
    `; 
    
    let respQuery = api.sqlQuery(query, 1);
    let existePagamento = false;
    let pagamentoTotal = false;
    
    if(respQuery[0].TOTALVENDAQUALITY > 0) {
        existePagamento = true;
        
        if(respQuery[0].TOTALVENDAQUALITY == totalVenda) {
            pagamentoTotal = true;
        }
    }
    
    return {
        existePagamento: existePagamento,
        pagamentoTotal: pagamentoTotal
    }
}

function integrarPagamento(idvenda, nfeProc, conn) {
    let respValidarIntegracaoPagamento = validarIntegracaoPagamento(idvenda, nfeProc.NFe.infNFe.total.ICMSTot.vNF)
    
    if(respValidarIntegracaoPagamento.existePagamento && respValidarIntegracaoPagamento.pagamentoTotal) {
        return true;
    } else if(respValidarIntegracaoPagamento.existePagamento && !respValidarIntegracaoPagamento.pagamentoTotal) {
        return `A venda está com o pagamento incorreto`;
    }
    
    let cobrDup = false;
    
    if(nfeProc.NFe.infNFe.cobr && nfeProc.NFe.infNFe.cobr.dup) cobrDup = nfeProc.NFe.infNFe.cobr.dup;
    
    let dataVenda = nfeProc.NFe.infNFe.ide.dhEmi.substring(0, 19).replace("T", " ");
    
    let respIntegracaoPagamento = prepararInsertTabelaVendaPagamento(idvenda, dataVenda, nfeProc.NFe.infNFe.pag.detPag, cobrDup, conn);
    
    if(respIntegracaoPagamento.status) return true;
    
    return respIntegracaoPagamento.message;
}