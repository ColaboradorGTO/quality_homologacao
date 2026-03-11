let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let dbNameSAP = 'SBO_GTO_TESTE4'

let conn;
let session;

function sucessLogPagamento(idVenda, idDocEntryPagamento){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET 
            ERRORLOGSAPPAGAMENTO = NULL,
            SAP_DOCENTRY_PAGAMENTO = ?
        WHERE 
            IDVENDA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setInt(1, idDocEntryPagamento);
	pStmtUpdate.setString(2, idVenda);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return 'True';
}

function errorLogPagamento(idVenda, p_Error){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET 
            ERRORLOGSAPPAGAMENTO = (ERRORLOGSAPPAGAMENTO || ?) 
        WHERE 
            IDVENDA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setString(2, idVenda);
	pStmtUpdate.execute();
	
	pStmtUpdate.close();
	conn.commit();

	return 'False';
}

function getContaReceberRateioPgtos(idVenda){
    let query = `
        SELECT
            TB_ORCT."DocEntry"
        FROM 
            "VAR_DB_NAME".VENDA TBV 
        INNER JOIN ${dbNameSAP}.OINV TB_OINV ON 
            (TBV.SAP_DOCENTRY_CORRETO = TB_OINV."DocEntry" OR TBV.SAP_DOCENTRY = TB_OINV."DocNum") AND TBV.IDVENDA = TB_OINV.U_ID_VENDA_PDV
        INNER JOIN ${dbNameSAP}.ORCT TB_ORCT ON
            TB_OINV.U_ID_VENDA_PDV = TB_ORCT.U_IS_ID_QUALITY
        WHERE
            TB_OINV."CANCELED" = 'N'
            AND TB_OINV."Model" = 39
            AND TB_ORCT."Canceled" = 'N'
            AND TB_ORCT."DocType" = 'A'
            AND TBV.IDVENDA = ?
        ORDER BY 
            TB_ORCT."DocType" DESC
    `;
    
    return api.sqlQuery(query, idVenda);
}

function getContaReceberParaContaTransitoria(idVenda){
    let query = `
        SELECT
            TB_ORCT."DocEntry"
        FROM 
            "VAR_DB_NAME".VENDA TBV 
        INNER JOIN ${dbNameSAP}.OINV TB_OINV ON 
            (TBV.SAP_DOCENTRY_CORRETO = TB_OINV."DocEntry" OR TBV.SAP_DOCENTRY = TB_OINV."DocNum") AND TBV.IDVENDA = TB_OINV.U_ID_VENDA_PDV
        INNER JOIN ${dbNameSAP}.ORCT TB_ORCT ON
            TB_OINV.U_ID_VENDA_PDV = TB_ORCT.U_IS_ID_QUALITY
        INNER JOIN ${dbNameSAP}.RCT2 TB_RCT2 ON
            TB_OINV."DocEntry" = TB_RCT2."DocEntry" AND TB_OINV."ObjType" = TB_RCT2."InvType"
        WHERE
            TB_OINV."CANCELED" = 'N'
            AND TB_OINV."Model" = 39
            AND TB_ORCT."Canceled" = 'N'
            AND TB_ORCT."DocType" = 'C'
            AND TBV.IDVENDA = ?
        ORDER BY 
            TB_ORCT."DocType" DESC
    `;
    
    return api.sqlQuery(query, idVenda);
}

function validarIntegracaoContasReceber(idVenda){
    let dadosContasReceberParaTransitoria = getContaReceberParaContaTransitoria(idVenda);
    let dadosContasReceberRateioPgtos = getContaReceberRateioPgtos(idVenda);
    
    if(!dadosContasReceberParaTransitoria.length || !dadosContasReceberRateioPgtos.length){
        let msg = !dadosContasReceberParaTransitoria.length ? 'Contas a receber para conta transitoria nao integrada' : 'Contas a receber de rateio de pagamentos nao integrada';
        
        errorLogPagamento(idVenda, msg);
    } else {
        sucessLogPagamento(idVenda, dadosContasReceberParaTransitoria[0]["DocEntry"]);   
    }
}

function postSl(data) {
   let response = slApi.post('/IncomingPayments',data,session);
   
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        
        return errorLogPagamento(data.U_IS_ID_QUALITY, (response.error.message.value || 'Erro ao tentar integrar o pagamento'));
   }
}

function getPgtoPix(idVenda){
    let query = `
        SELECT 
            SUM("VALORRECEBIDO") AS "VALORRECEBIDO"
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO 
        WHERE 
            1 = ? 
            AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False')
            AND DSTIPOPAGAMENTO = 'PIX' 
            AND IDVENDA= '${idVenda}' 
    `;
    
    return api.sqlQuery(query, 1);
}

function getPgtoGiroPremiado(idVenda){
    let query = `
        SELECT 
            "VALORRECEBIDO" 
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO 
        WHERE 
            1 = ? 
            AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False')
            AND DSTIPOPAGAMENTO = 'GIRO PREMIADO' 
            AND IDVENDA= '${idVenda}' 
    `;
    
    return api.sqlQuery(query, 1);
}

function getPgtoCartaoCredito(idVenda){
    let query = `
        SELECT 
            SUM("VALORRECEBIDO") AS VALORRECEBIDO,
            "NSUAUTORIZADORA",
            "NUAUTORIZACAO",
            "NPARCELAS",
            "DSTIPOPAGAMENTO",
            "TPAG"
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO
        WHERE 
            1 = ? 
            AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False')
            AND (UPPER(DSTIPOPAGAMENTO) <> 'PIX' AND UPPER(DSTIPOPAGAMENTO) <> 'DINHEIRO' AND UPPER(DSTIPOPAGAMENTO)<> 'VOUCHER' AND UPPER(DSTIPOPAGAMENTO) <> 'VALE FUNCIONÁRIO' AND UPPER(DSTIPOPAGAMENTO) <> 'PARCEIROS DE APOIO') 
            AND IDVENDA= '${idVenda}' 
        GROUP BY 
            "NSUAUTORIZADORA",
            "NPARCELAS",
            "DSTIPOPAGAMENTO",
            "TPAG","NUAUTORIZACAO" 
        ORDER BY
            TPAG DESC
    `;
    
    return api.sqlQuery(query, 1);
}

function getCreditCard(TPAG){
    let query = `
        SELECT 
            "U_IS_CARTAO" 
        FROM 
            ${dbNameSAP}."@IV_ITV_FORMAPAG" 
        WHERE
            1 = ? 
            AND "Code" = '${TPAG}'
    `;
    
    return api.sqlQuery(query, 1);
}

function getValorTotalPgto(idVenda, dsTipoPagamento, nuAutorizacao){
    let query = `
        SELECT 
            SUM("VALORRECEBIDO") as VALORRECEBIDO
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO 
        WHERE 
            1 = ? 
            AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False') 
            AND IDVENDA = '${idVenda}' 
            AND DSTIPOPAGAMENTO = '${dsTipoPagamento}' 
            AND NUAUTORIZACAO = '${nuAutorizacao}' 
        GROUP BY 
            DSTIPOPAGAMENTO
    `;
    
    return api.sqlQuery(query, 1);
}

function getPgtosConvenioVoucher(idVenda){
    let query = `
        SELECT 
            "VALORRECEBIDO","DSTIPOPAGAMENTO" 
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO 
        WHERE 
            1 = ? 
            AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False')
            AND UPPER(DSTIPOPAGAMENTO) IN ('VOUCHER', 'VALE FUNCIONÁRIO', 'PARCEIROS DE APOIO') 
            AND IDVENDA = '${idVenda}' 
    `;
    
    return api.sqlQuery(query, 1);
}

function getIdConvenio(idVenda){
    let query = `
        SELECT 
            "IDDETLACCONVENIO" 
        FROM 
            "VAR_DB_NAME".DETLANCCONVENIO 
        WHERE 
            1 = ? 
            AND IDRESUMOVENDAWEB= '${idVenda}' 
    `;
    
    return api.sqlQuery(query, 1);
}

function getNumeroVoucher(idVenda){
    let query = `
        SELECT 
            "NUVOUCHER" 
        FROM 
            "VAR_DB_NAME".RESUMOVOUCHER 
        WHERE 
            1 = ? 
            AND IDRESUMOVENDAWEBDESTINO = '${idVenda}' 
    `;
    
    return api.sqlQuery(query, 1);
}

function getPaymentCreditCards(registro){
    let lstPagamentos = getPgtoCartaoCredito(registro.IDVENDA);
    let detalhesPgto = [];
    
    for(let i = 0; i < lstPagamentos.length; i++){
        let regPagamento = lstPagamentos[i];
        let lstCreditCard = getCreditCard(regPagamento.TPAG);
        let resValorTotalPago = getValorTotalPgto(registro.IDVENDA, regPagamento.DSTIPOPAGAMENTO, regPagamento.NUAUTORIZACAO);
        
        let numParcelas = parseInt(regPagamento.NPARCELAS) || 1;
        
        let vlParcela = (parseFloat(regPagamento.VALORRECEBIDO) / numParcelas).toFixed(2);
        let resultadoDiferenca = parseFloat(regPagamento.VALORRECEBIDO) - parseFloat(vlParcela * numParcelas);
        
        
        let numCreditCard = lstCreditCard.length > 0 ? lstCreditCard[0].U_IS_CARTAO : 0;
        let numAutorizadora = regPagamento.NSUAUTORIZADORA.replace('\t','')!== "" ? regPagamento.NSUAUTORIZADORA.replace('\t','') : "0";
        let valorTotalPago = resValorTotalPago.length > 0 ? resValorTotalPago[0].VALORRECEBIDO : 0;
        
        let detPgtoCartao = {
            "LineNum": i,
            "CreditCard": (regPagamento.DSTIPOPAGAMENTO === 'GIRO PREMIADO' ? 24 : 23),
            "CreditCardNumber": "0", // fixo
            "CardValidUntil": registro.DTHORAFECHAMENTO, // data do pagamento
            "VoucherNum": `'${numAutorizadora}'`, // Id da transação -> NSUAUTORIZADORA
            "NumOfPayments": numParcelas, // número de parcelas
            "FirstPaymentSum": (parseFloat(vlParcela) + resultadoDiferenca).toFixed(2), // valor da primeira parcela
            "CreditSum": parseFloat(valorTotalPago), // total pago neste cartão
            "CreditType": "cr_Regular", // fixo
            "SplitPayments": 'tYES' // fixo
        };
        
        if (numParcelas > 1) {
            detPgtoCartao = Object.assign(detPgtoCartao, {
                "AdditionalPaymentSum": parseFloat(vlParcela).toFixed(2) // valor das demais parcelas
            });
        }
        
        detalhesPgto.push(detPgtoCartao);
    }
    
    return detalhesPgto;
}

function getPaymentChecks(registro){
    //VALE FUNCIONÁRIO//Vale Funcionário//VOUCHER//Voucher//Parceiros de Apoio
    let lstPagamentosConveniosVouchers = getPgtosConvenioVoucher(registro.IDVENDA);
    let detalhesPgto = [];
    
    for(let k = 0; k < lstPagamentosConveniosVouchers.length; k++){
        let regPagamentoConveniosVouchers = lstPagamentosConveniosVouchers[k];
        let objListPag = {};
        
        if(parseFloat(registro.VRRECCONVENIO) > 0){
            let lstConvenio = getIdConvenio(registro.IDVENDA);
            
            if(lstConvenio.length > 0){
                objListPag = Object.assign(objListPag, {
                    "CheckNumber": lstConvenio[0].IDDETLACCONVENIO, // NUMERO DO VOUCHER OU CONVENIO
                    "BankCode": '996'
                });
            }
        }
        
        if(parseFloat(registro.VRRECVOUCHER) > 0){
            let lstVoucher = getNumeroVoucher(registro.IDVENDA);
            
            if(lstVoucher.length > 0){
                objListPag = Object.assign(objListPag, {
                    "CheckNumber": lstVoucher[0].NUVOUCHER, // NUMERO DO VOUCHER OU CONVENIO
                });
            }
        }
        
        objListPag = Object.assign(objListPag, {
            "CheckSum": parseFloat(regPagamentoConveniosVouchers.VALORRECEBIDO), // VALOR DO CONVENIO/VOUCHER
            "BankCode": '997', // NUMERO DO VOUCHER OU CONVENIO CASO PRECISE DE TEX
        });
       
        if(parseFloat(registro.VRRECVOUCHER) > 0){
            objListPag = Object.assign(objListPag, {
                "CheckAccount":"2.01.01.02.0002",
                "BankCode": "997"
            });
        }else{
            objListPag = Object.assign(objListPag, {
                "CheckAccount": "1.01.03.05.0007",
                "BankCode": "996" 
            });
        }
        
        detalhesPgto.push(
            Object.assign({
                "LineNum": k,
                "DueDate": registro.DTHORAFECHAMENTO // DATA DO PAGAMENTO
            }, objListPag)
        );
        
    }
    
    return detalhesPgto;
}

function montarJsonContasReceberParaContaTransitoria(registro){
    let idEmpresa = registro.IDEMPRESA;
    let idVenda = registro.IDVENDA;
    let dataPgto = registro.DOCDATE_SAP;
    let codParceiro = registro.CODPARCEIRO;
    let contaTransitoria = '1.01.03.11.0006';
    let docEntry = registro.DocEntry;
    let valorPgto = Number(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF);
    let series = 15;
    
    return {
        "DocType": "rCustomer", //fixo
        "CardCode": codParceiro,
        "DueDate": dataPgto,
        "DocDate": dataPgto,
        "TaxDate": dataPgto,
        "TransferDate": dataPgto,
        "TransferAccount": contaTransitoria,
        "TransferSum": valorPgto,
        "TransferReference": 'PAGAMENTO DATA DIVERGENTE',
        "Remarks": `Integração pagamento data divergente(idVenda) Quality`,
        "Series": series,
        "BPLID": idEmpresa,
        "U_IS_ID_QUALITY": idVenda,
        "PaymentInvoices": [
            {
                "LineNum": 0,
                "DocEntry": docEntry,
                "SumApplied": valorPgto,
                "InvoiceType": 'it_Invoice'
            }
        ]
    };
}

function montarJsonContasReceberParaRateioPagamentos(registro){
    let lstPagamentoPix = getPgtoPix(registro.IDVENDA);
    let lstPagamentoGiroPremiado = getPgtoGiroPremiado(registro.IDVENDA);
    let idEmpresa = registro.IDEMPRESA;
    let idVenda = registro.IDVENDA;
    let dataPgto = registro.DTHORAFECHAMENTO;
    let codParceiro = registro.CODPARCEIRO;
    let contaTransitoria = '1.01.03.11.0006';
    let docEntry = registro.DocEntry;
    let valorPgto = Number(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF);
    let series = 15;
    
    let jsonPagamento = {
        "DocType": "rAccount",
        "DueDate": dataPgto,
        "DocDate": dataPgto,
        "TaxDate": dataPgto,
        "CardCode": codParceiro,
        "Series": series,
        "ProjectCode": "PDV_SOFTQUALITY",
        "PayToCode": 'Pagamento',
        "Remarks": 'INTEGRACAO QUALITY PAGAMENTO DATA DIVERGENTE',
        "U_IS_ID_QUALITY": idVenda,
        "PaymentType": 'bopt_None',
        "BPLID": idEmpresa,
        "PaymentCreditCards": getPaymentCreditCards(registro),
        "PaymentChecks": getPaymentChecks(registro),
        "PaymentAccounts": [
            {
                "LineNum": 0,
                "AccountCode": contaTransitoria,
                "SumPaid": valorPgto
            }
        ]
    };
    
    if(parseFloat(registro.VRRECDINHEIRO) > 0){
        jsonPagamento = Object.assign(jsonPagamento, {
            "CashAccount":registro.CONTA, 
            "CashSum": parseFloat(registro.VRRECDINHEIRO)
        });
    }
    
    if(parseFloat(registro.VRRECCONVENIO) > 0){
        jsonPagamento = Object.assign(jsonPagamento, {
            "CheckAccount": '1.01.03.05.0007'
        });
    }
    
    if(parseFloat(registro.VRRECVOUCHER) > 0){
        jsonPagamento = Object.assign(jsonPagamento, {
            "CheckAccount": '2.01.01.02.0002'
        });
    }
    
    if(lstPagamentoPix.length > 0 && lstPagamentoPix[0].VALORRECEBIDO > 0){
        jsonPagamento = Object.assign(jsonPagamento, {
            "TransferAccount" : '1.01.01.01.9998',
            "TransferSum": parseFloat(lstPagamentoPix[0].VALORRECEBIDO),
            "TransferDate": registro.DTHORAFECHAMENTO,
            "TransferReference": 'PAGAMENTO VIA PIX'
        });
    }
    
    return jsonPagamento;
}

function integrarContasReceberParaContaTransitoria(registro){
    let dadosIntegradosRateioPgtos = getContaReceberParaContaTransitoria(registro.IDVENDA);
    
    if(!dadosIntegradosRateioPgtos.length){
        let jsonContasReceber = montarJsonContasReceberParaContaTransitoria(registro);
        
        postSl(jsonContasReceber);
    }
}

function integrarContasReceberParaRateioPagamentos(registro){
    let dadosIntegradosContaTransitoria = getContaReceberParaContaTransitoria(registro.IDVENDA);
    let dadosIntegradosRateioPgtos = getContaReceberRateioPgtos(registro.IDVENDA);
    
    if(dadosIntegradosContaTransitoria.length > 0 && !dadosIntegradosRateioPgtos.length){
        let jsonContasReceber = montarJsonContasReceberParaRateioPagamentos(registro);
        
        postSl(jsonContasReceber);
    }
    
    validarIntegracaoContasReceber(registro.IDVENDA);
}

function executePagamentoNaoIntegrado(byId) {
    let query = ` 
        SELECT TOP 100
            TBV.IDVENDA,
            TO_VARCHAR(A."DocDate",'YYYY-MM-DD') AS DOCDATE_SAP, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO, 
            TBV.IDEMPRESA,
            D."U_IS_PN_SAIDA" AS CODPARCEIRO,
            (SELECT A."AcctCode" FROM ${dbNameSAP}.OACT A INNER JOIN ${dbNameSAP}.OWHS B ON A."U_RS_Filial" = B."WhsCode" WHERE B."BPLid" = TBV.IDEMPRESA) AS CONTA,
            TBV.VRRECDINHEIRO,
            TBV.VRRECCONVENIO,
            TBV.VRRECVOUCHER,
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF,
            TBV.NFE_INFNFE_IDE_NNF,
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
            TBV.IDCAIXAWEB,
            TBV.NFE_INFNFE_IDE_DHEMI,
            TBV.NFE_INFNFE_IDE_SERIE,
            TBV.PROTNFE_INFPROT_CHNFE,
            TBV.PROTNFE_INFPROT_NPROT,
            TBV.PROTNFE_INFPROT_CSTAT,
            TBV.PROTNFE_INFPROT_XMOTIVO,
            TBV.NFE_INFNFE_TRANSP_MODFRETE,
            TBV.SAP_DOCENTRY_CORRETO,
            TBV.IDEMPRESA,
            A."DocEntry"
		FROM 
            "VAR_DB_NAME".VENDA TBV
		INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        INNER JOIN ${dbNameSAP}.OINV A ON
            (TBV.SAP_DOCENTRY_CORRETO = A."DocEntry" OR TBV.SAP_DOCENTRY = A."DocNum") AND TBV.IDVENDA = A."U_ID_VENDA_PDV"
        INNER JOIN ${dbNameSAP}.INV12 B ON
            A."DocEntry" = B."DocEntry"
        INNER JOIN ${dbNameSAP}.OUSG C ON
            B."MainUsage" = C.ID
        INNER JOIN ${dbNameSAP}.OBPL D ON
            A."BPLId" = D."BPLId"
        LEFT JOIN ${dbNameSAP}.RCT2 E ON
            A."DocEntry" = E."DocEntry" AND A."ObjType" = E."InvType"
        LEFT JOIN ${dbNameSAP}.ORCT F ON
            E."DocNum" = F."DocEntry"
		WHERE 
            1 = ? 
            AND TBV.STCANCELADO = 'False'
            AND TBV.PROTNFE_INFPROT_CSTAT <> 100
            AND TBV.STCONTINGENCIA = 'False'
            AND TBV.SAP_DOCENTRY_PAGAMENTO IS NULL
            AND A."CANCELED" = 'N'
            AND A."Model" = 39 
            AND B."MainUsage" = 38
            AND (IFNULL(TO_VARCHAR(F."TransId"), 'Sem ID') = 'Sem ID'  OR F."Canceled" = 'Y')
    `;

	if (byId) {
		query += ` AND TBV.IDVENDA = '${byId}' `;
	} else {
	    // retirar a clausula de UF = GO
        query += `
            /*AND TBE.SGUF = 'GO'*/
            AND (TO_DATE(TBV.DTHORAFECHAMENTO) >= '2025-10-01' AND TO_DATE(TBV.DTHORAFECHAMENTO) <= '2025-10-27') /*ADD_DAYS(CURRENT_DATE, -2))*/
            AND A."DocDate" >= '2025-03-01'
            AND A."DocDate" <= ADD_DAYS(CURRENT_DATE, -2)
            AND IFNULL(TBV."ERRORLOGSAPPAGAMENTO", '') = ''
            AND IFNULL(TBV."IDVENDA", '') <> ''
        `;
	}
	
	//query += ' ORDER BY A."DocDate" ';
	query += ' ORDER BY TBV.DTHORAFECHAMENTO ';
	
    let resultadoVenda = api.sqlQuery(query, 1);
	
    if(resultadoVenda.length === 0){
        return { msg: "VENDA JÁ INTEGRADA OU CANCELADA OU NÃO EXISTE!" };
    }
    
    conn = $.db.getConnection();
    
	for (let i = 0; i < resultadoVenda.length; i++) {
		let registro = resultadoVenda[i];
        let stIntegrarPgto = true //validarIntegracao(registro.IDVENDA, false) == 'False'
        
        if(!session){
                session = slApi.loginServiceLayer(true);
                
                slApi.loginServiceLayer(true);
            }
            
            integrarContasReceberParaContaTransitoria(registro);
            
            integrarContasReceberParaRateioPagamentos(registro);
	}
	
	return 'Migração pagamento realizado com sucesso!';
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                let id = $.request.parameters.get("id");
                let docReturn = executePagamentoNaoIntegrado(id);
                
                $.response.setBody(JSON.stringify(docReturn));
                
                break;
                
            default:
                break;
        }
        
    } catch (e) {
        let detalheError = e.stack.split('\n');
        
        detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
        
        if(detalheError){
            detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
        }
        
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({
            message: e.message,
            detalheError
        }));
        $.response.status = 400;
    }   
}