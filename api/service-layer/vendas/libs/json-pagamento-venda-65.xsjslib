let api = $.import("quality.concentrador_homologacao.api", "apiResponse");
let dbNameSAP = 'SBO_GTO_TESTE4';

function getPgtoGiroPremiado(idVenda){
    let query = `
        SELECT 
            "VALORRECEBIDO" 
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO 
        WHERE 
            (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False')
            AND DSTIPOPAGAMENTO = 'GIRO PREMIADO' 
            AND IDVENDA = ?
    `;
    
    return api.sqlQuery(query, idVenda);
}

function getPgtoPix(idVenda){
    let query = `
        SELECT
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO,
            SUM(VALORRECEBIDO) AS VALORRECEBIDO
        FROM 
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".VENDAPAGAMENTO TBVP ON 
            TBV.IDVENDA = TBVP.IDVENDA 
        WHERE 
            TBV.STCANCELADO = 'False'
            AND (IFNULL(TBVP.STCANCELADO, '') = '' OR TBVP.STCANCELADO = 'False')
            AND TBVP.DSTIPOPAGAMENTO = 'PIX' 
            AND TBV.IDVENDA = ?
        GROUP BY 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD')
    `;
    
    return api.sqlQuery(query, idVenda);
}

/*function getPgtosCartaoCredito(idVenda){
    let query = `
        SELECT
            TBV.IDVENDA,
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO,
            SUM(TBVP.VALORRECEBIDO) AS VALORRECEBIDO,
            IFNULL(TBVP.NSUAUTORIZADORA, '') AS NSUAUTORIZADORA,
            TBVP.NUAUTORIZACAO,
            IFNULL(TBVP.NPARCELAS, 1) AS NPARCELAS,
            TBVP.DSTIPOPAGAMENTO,
            TBVP.TPAG,
            TBD.IDDETLACCONVENIO,
            CASE 
                WHEN TRIM(UPPER(TBVP.DSTIPOPAGAMENTO)) = 'GIRO PREMIADO' THEN 24
                ELSE 23
            END CREDITCARD
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO TBVP
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
            TBVP.IDVENDA = TBV.IDVENDA
        WHERE 
            TBVP.IDVENDA = ?
            AND (IFNULL(TBVP.STCANCELADO, '') = '' OR TBVP.STCANCELADO = 'False')
            AND TRIM(UPPER(TBVP.DSTIPOPAGAMENTO)) NOT IN(
                'PIX',
                'DINHEIRO',
                'VOUCHER'.
                'VALE FUNCIONÁRIO',
                'PARCEIROS DE APOIO'
            )
        GROUP BY
            TBV.IDVENDA,
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD'),
            TBVP.NSUAUTORIZADORA,
            TBVP.NPARCELAS,
            TBVP.DSTIPOPAGAMENTO,
            TBVP.TPAG,
            TBD.IDDETLACCONVENIO,
            TBVP.NUAUTORIZACAO
        ORDER BY
            TBVP.TPAG DESC
    `;
    
    return api.sqlQuery(query, idVenda);
}*/

function getPgtosCartaoCreditoConvenio(idVenda){
    let query = `
        SELECT
            TBV.IDVENDA,
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO,
            SUM(TBVP.VALORRECEBIDO) AS VALORRECEBIDO,
            IFNULL(TBVP.NSUAUTORIZADORA, '') AS NSUAUTORIZADORA,
            TBVP.NUAUTORIZACAO,
            IFNULL(TBVP.NPARCELAS, 1) AS NPARCELAS,
            TBVP.DSTIPOPAGAMENTO,
            TBVP.TPAG,
            TBD.IDDETLACCONVENIO,
            CASE 
                WHEN TRIM(UPPER(TBVP.DSTIPOPAGAMENTO)) IN ('VALE FUNCIONÁRIO', 'PARCEIROS DE APOIO') THEN 25
                WHEN TRIM(UPPER(TBVP.DSTIPOPAGAMENTO)) = 'GIRO PREMIADO' THEN 24
                ELSE 23
            END CREDITCARD
            /*,A."U_IS_CARTAO"*/
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO TBVP
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
            TBVP.IDVENDA = TBV.IDVENDA
        LEFT JOIN "VAR_DB_NAME".DETLANCCONVENIO TBD ON
            TBV.IDVENDA = TBD.IDRESUMOVENDAWEB AND TBD.STCANCELADO = 'False'
        /*LEFT JOIN ${dbNameSAP}."@IV_ITV_FORMAPAG" A ON 
            TBVP.TPAG = A."Code"*/
        WHERE 
            TBVP.IDVENDA = ?
            AND (IFNULL(TBVP.STCANCELADO, '') = '' OR TBVP.STCANCELADO = 'False')
            AND TRIM(UPPER(TBVP.DSTIPOPAGAMENTO)) NOT IN(
                'PIX',
                'DINHEIRO',
                'VOUCHER'
            ) 
            /*AND TRIM(UPPER(TBVP.DSTIPOPAGAMENTO)) NOT IN(
                'PIX',
                'DINHEIRO',
                'VOUCHER'.
                'VALE FUNCIONÁRIO',
                'PARCEIROS DE APOIO'
            ) */
        GROUP BY
            TBV.IDVENDA,
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD'),
            TBVP.NSUAUTORIZADORA,
            TBVP.NPARCELAS,
            TBVP.DSTIPOPAGAMENTO,
            TBVP.TPAG,
            TBD.IDDETLACCONVENIO,
            TBVP.NUAUTORIZACAO
        ORDER BY
            TBVP.TPAG DESC
    `;
    
    return api.sqlQuery(query, idVenda);
}

/*function getPgtosConvenioVoucher(idVenda){
    let query = `
        SELECT 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO,
            TBVP.VALORRECEBIDO,
            UPPER(TBVP.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTO,
            TBV.VRRECCONVENIO,
            TBD.IDDETLACCONVENIO,
            TBV.VRRECVOUCHER,
            TBR.IDVOUCHER,
            TBR.NUVOUCHER
        FROM 
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".VENDAPAGAMENTO TBVP ON 
            TBV.IDVENDA = TBVP.IDVENDA
        INNER JOIN "VAR_DB_NAME".DETLANCCONVENIO TBD ON
            TBV.IDVENDA = TBD.IDRESUMOVENDAWEB AND TBD.STCANCELADO = 'False'
        INNER JOIN "VAR_DB_NAME".RESUMOVOUCHER TBR ON 
            TBV.IDVENDA = TBR.IDRESUMOVENDAWEBDESTINO AND TBR.STCANCELADO = 'False'
        WHERE 
            TBV.STCANCELADO = 'False'
            AND (IFNULL(TBVP.STCANCELADO, '') = '' OR TBVP.STCANCELADO = 'False')
            AND UPPER(TBVP.DSTIPOPAGAMENTO) IN (
                'VOUCHER', 
                'VALE FUNCIONÁRIO', 
                'PARCEIROS DE APOIO'
            )
            AND TBVP.IDVENDA = ?
    `;
    
    return api.sqlQuery(query, idVenda);
}*/

function getPgtosVoucher(idVenda){
    let query = `
        SELECT 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO,
            TBVP.VALORRECEBIDO,
            TBR.IDVOUCHER,
            TBR.NUVOUCHER
        FROM 
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".VENDAPAGAMENTO TBVP ON 
            TBV.IDVENDA = TBVP.IDVENDA
        INNER JOIN "VAR_DB_NAME".RESUMOVOUCHER TBR ON 
            TBV.IDVENDA = TBR.IDRESUMOVENDAWEBDESTINO AND TBR.STCANCELADO = 'False'
        WHERE 
            TBV.STCANCELADO = 'False'
            AND (IFNULL(TBVP.STCANCELADO, '') = '' OR TBVP.STCANCELADO = 'False')
            AND UPPER(TBVP.DSTIPOPAGAMENTO) = 'VOUCHER'
            AND TBVP.IDVENDA = ?
    `;
    
    return api.sqlQuery(query, idVenda);
}

function getVendaPagamento(idVenda){
    let query = ` 
        SELECT
            TBV.IDVENDA, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO, 
            TBV.IDEMPRESA,
            TBE.CODPARCEIRO,
            TBV.VRRECDINHEIRO,
            TBV.VRRECCONVENIO,
            TBV.VRRECVOUCHER,
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF,
            A."DocEntry" AS DOCENTRY,
            C."AcctCode" AS CONTA
		FROM 
            "VAR_DB_NAME".VENDA TBV
		INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        INNER JOIN ${dbNameSAP}.OINV A ON
            TBV.IDVENDA = A.U_ID_VENDA_PDV  AND A."U_ChaveAcesso" = TBV.PROTNFE_INFPROT_CHNFE AND IFNULL(TBV.PROTNFE_INFPROT_CHNFE, '') <> ''
        INNER JOIN ${dbNameSAP}.OWHS B ON 
            TBV.IDEMPRESA = B."BPLid"
        INNER JOIN ${dbNameSAP}.OACT C ON
            B."WhsCode" = C."U_RS_Filial" 
        WHERE 
            TBV.STCANCELADO = 'False'
            AND TBV.SAP_DOCENTRY_PAGAMENTO IS NULL
            AND A."CANCELED" = 'N'
            AND A."Model" = 54
            AND TBV.IDVENDA = ?
    `;
	
    return api.sqlQuery(query, idVenda);
}

function montarListJsonPaymentCreditCards(lstPagamentos){
    let lstJsonPgtosCreditCards = [];
    
    for(let i = 0; i < lstPagamentos.length; i++){
        let { DTHORAFECHAMENTO, NPARCELAS, VALORRECEBIDO, NSUAUTORIZADORA, DSTIPOPAGAMENTO, U_IS_CARTAO, CREDITCARD, IDDETLACCONVENIO } = lstPagamentos[i] || '';
        let creditCard = Number(CREDITCARD);
        let dataPagamento = DTHORAFECHAMENTO;
        let vrTotalRecebido = Number(VALORRECEBIDO);
        let numParcelas = parseInt(NPARCELAS) || 1;
        let vrParcela = Number(parseFloat(vrTotalRecebido / numParcelas).toFixed(2));
        let vrTotalParcelas = vrParcela * numParcelas;
        let vrDiferenca = Number(parseFloat(vrTotalRecebido - vrTotalParcelas).toFixed(2));
        let numCreditCard = U_IS_CARTAO || 0;
        let firstPaymentSum = parseFloat(vrParcela + vrDiferenca).toFixed(2);
        let idTransacao = creditCard == 25 ? String(IDDETLACCONVENIO) : NSUAUTORIZADORA.replace('\t','') !== "" ? NSUAUTORIZADORA.replace('\t','') : "0";
        
        let detPgtoCartao = {
            "LineNum": i,
            "CreditCard": creditCard,//(DSTIPOPAGAMENTO === 'GIRO PREMIADO' ? 24 : 23),
            "CreditCardNumber": "0", // fixo
            "CardValidUntil": dataPagamento, // data do pagamento
            "VoucherNum": idTransacao, // Id da transação -> NSUAUTORIZADORA
            "NumOfPayments": numParcelas, // número de parcelas
            "FirstPaymentSum": Number(firstPaymentSum), // valor da primeira parcela
            "CreditSum": Number(vrTotalRecebido), // total pago neste cartão
            "CreditType": "cr_Regular", // fixo
            "SplitPayments": 'tYES' // fixo
        };
        
        if (numParcelas > 1) {
            detPgtoCartao = Object.assign(detPgtoCartao, {
                "AdditionalPaymentSum": Number(vrParcela) // valor das demais parcelas
            });
        }
        
        lstJsonPgtosCreditCards.push(detPgtoCartao);
    }
    
    return lstJsonPgtosCreditCards;
}

/*function montarListJsonPaymentChecks(lstPagamentos){
    //VALE FUNCIONÁRIO//Vale Funcionário//VOUCHER//Voucher//Parceiros de Apoio
    let listPgtos = [];
    
    for(let i = 0; i < lstPagamentos.length; i++){
        let { 
            DTHORAFECHAMENTO, 
            DSTIPOPAGAMENTO, 
            IDDETLACCONVENIO, 
            VRRECCONVENIO,
            IDVOUCHER,
            NUVOUCHER, 
            VRRECVOUCHER, 
            VALORRECEBIDO
        } = lstPagamentos[i] || '';
        
        let checkSum = parseFloat(VALORRECEBIDO || 0);
        let checkNumber = IDDETLACCONVENIO;
        let bankCode = "996";
        let checkAccount = "1.01.03.05.0007"; 
        
        if(DSTIPOPAGAMENTO == 'VOUCHER' && parseFloat(VRRECVOUCHER) > 0){
            checkNumber = IDVOUCHER;// NUMERO DO VOUCHER OU CONVENIO
            bankCode = "997";
            checkAccount = "2.01.01.02.0002";
        }
        
        listPgtos.push(
            {
                "LineNum": i,
                "DueDate": DTHORAFECHAMENTO, // DATA DO PAGAMENTO
                "CheckNumber": parseInt(checkNumber), // NUMERO DO VOUCHER OU CONVENIO CASO PRECISE DE TEX
                "CheckSum": checkSum, // VALOR DO CONVENIO/VOUCHER
                "BankCode": bankCode,
                "AccounttNum": checkAccount,
                "CheckAccount": checkAccount
            }
        );
        
    }
    
    return listPgtos;
}*/

function montarListJsonPaymentChecks(lstPagamentos){
    let listPgtos = [];
    
    for(let i = 0; i < lstPagamentos.length; i++){
        let { 
            DTHORAFECHAMENTO, 
            IDVOUCHER,
            NUVOUCHER, 
            VALORRECEBIDO
        } = lstPagamentos[i] || '';
        
        let checkSum = parseFloat(VALORRECEBIDO || 0);
        let checkNumber = IDVOUCHER;// NUMERO DO VOUCHER OU CONVENIO;
        let bankCode = "997";
        let checkAccount = "2.01.01.02.0002";
        
        listPgtos.push(
            {
                "LineNum": i,
                "DueDate": DTHORAFECHAMENTO, // DATA DO PAGAMENTO
                "CheckNumber": parseInt(checkNumber), // ID DO VOUCHER OU CONVENIO CASO PRECISE DE TEX
                "CheckSum": checkSum, // VALOR DO VOUCHER
                "BankCode": bankCode,
                "CheckAccount": checkAccount
            }
        );
        
    }
    
    return listPgtos;
}

function montarPaymentAccounts(lstPagamentos){
    //VALE FUNCIONÁRIO//Vale Funcionário//VOUCHER//Voucher//Parceiros de Apoio
    let listPgtos = [];
    
    for(let i = 0; i < lstPagamentos.length; i++){
        let { 
            DTHORAFECHAMENTO, 
            DSTIPOPAGAMENTO, 
            IDDETLACCONVENIO, 
            VRRECCONVENIO,
            IDVOUCHER,
            NUVOUCHER, 
            VRRECVOUCHER, 
            VALORRECEBIDO
        } = lstPagamentos[i] || '';
        
        let sumPaid  = parseFloat(VALORRECEBIDO || 0);
        let checkNumber = IDDETLACCONVENIO;
        let bankCode = "996";
        let accountCode  = "1.01.03.05.0007"; 
        
        if(DSTIPOPAGAMENTO == 'VOUCHER' && parseFloat(VRRECVOUCHER) > 0){
            checkNumber = IDVOUCHER;// NUMERO DO VOUCHER OU CONVENIO
            bankCode = "997";
            accountCode  = "2.01.01.02.0002";
        }
        
        listPgtos.push(
            {
                "LineNum": i,
                "AccountCode": accountCode,
                "SumPaid": sumPaid , // VALOR DO CONVENIO/VOUCHER
            }
        );
        
    }
    
    return listPgtos;
}

function montarJsonPagamentoPix(regPgtoPix){
    return {
        "TransferAccount" : '1.01.01.01.9998',
        "TransferDate": regPgtoPix.DTHORAFECHAMENTO,
        "TransferSum": parseFloat(regPgtoPix.VALORRECEBIDO),
        "TransferReference": 'PAGAMENTO VIA PIX'
    }
}

/*function montarJsonPagamento(dadosVenda){
    let { 
        IDVENDA, 
        DTHORAFECHAMENTO, 
        IDEMPRESA, 
        CODPARCEIRO, 
        CONTA, 
        VRRECDINHEIRO,
        VRRECCONVENIO,
        VRRECVOUCHER,
        NFE_INFNFE_TOTAL_ICMSTOT_VNF,
        DOCENTRY
    } = dadosVenda;
    //let lstPagamentoGiroPremiado = getPgtoGiroPremiado(IDVENDA);
    let regPgtosCartaoCredito = getPgtosCartaoCredito(IDVENDA);
    let regPgtosConvenioVoucher = getPgtosConvenioVoucher(IDVENDA);
    let regPagamentoPix = getPgtoPix(IDVENDA);
    
    let jsonPagamentosVenda = {
        "DocType": "rCustomer",
        "DocTypte": 'rCustomer',
        "U_IS_ID_QUALITY": IDVENDA,
        "DocDate": DTHORAFECHAMENTO,
        "CardCode": CODPARCEIRO,
        "Series": 15,
        "ProjectCode": "PDV_SOFTQUALITY",
        "PayToCode": 'Pagamento',
        "Remarks": 'INTEGRACAO QUALITY PAGAMENTO',
        "PaymentType": 'bopt_None',
    };
    
    if(parseFloat(VRRECDINHEIRO) > 0){
        jsonPagamentosVenda = Object.assign(jsonPagamentosVenda, {
            "CashAccount": CONTA, 
            "CashSum": parseFloat(VRRECDINHEIRO)
        });
    }
    
    if(regPagamentoPix.length > 0){
        if(Number(regPagamentoPix[0].VALORRECEBIDO) > 0){
            let jsonPagamentoPix = montarJsonPagamentoPix(regPagamentoPix[0]);
            
            jsonPagamentosVenda = Object.assign(jsonPagamentosVenda, jsonPagamentoPix);
        }
    }
    
    jsonPagamentosVenda = Object.assign(
        jsonPagamentosVenda,
        {
            "BPLID": parseInt(IDEMPRESA),
            "PaymentCreditCards": montarListJsonPaymentCreditCards(regPgtosCartaoCredito),
            "PaymentChecks": montarListJsonPaymentChecks(regPgtosConvenioVoucher),
            "PaymentInvoices": [
                {
                    "LineNum": 0,
                    "DocEntry": DOCENTRY,
                    "SumApplied": parseFloat(NFE_INFNFE_TOTAL_ICMSTOT_VNF),
                    "InvoiceType": 'it_Invoice'
                }
            ],
        }
    );
    
    /*if(regPgtosCartaoCredito.length > 0){
        jsonPagamentosVenda = Object.assign(jsonPagamentosVenda, {
            "PaymentCreditCards": montarListJsonPaymentCreditCards(regPgtosCartaoCredito)
        });
    }
    
    if(regPgtosConvenioVoucher.length > 0){
        jsonPagamentosVenda = Object.assign(jsonPagamentosVenda, {
            "PaymentChecks": montarListJsonPaymentChecks(regPgtosConvenioVoucher)
        });
    }
    
    if (parseFloat(VRRECCONVENIO) > 0){
        jsonPagamentosVenda = Object.assign(jsonPagamentosVenda, {
            "CheckAccount": '1.01.03.05.0007'
        });
    } else if(parseFloat(VRRECVOUCHER) > 0){
        jsonPagamentosVenda = Object.assign(jsonPagamentosVenda, {
            "CheckAccount": '2.01.01.02.0002'
        });
    }
    
    
    return jsonPagamentosVenda;
}*/

function montarJsonPagamento(dadosVenda){
    let { 
        IDVENDA, 
        DTHORAFECHAMENTO, 
        IDEMPRESA, 
        CODPARCEIRO, 
        CONTA, 
        VRRECDINHEIRO,
        VRRECCONVENIO,
        VRRECVOUCHER,
        NFE_INFNFE_TOTAL_ICMSTOT_VNF,
        DOCENTRY
    } = dadosVenda;
    //let lstPagamentoGiroPremiado = getPgtoGiroPremiado(IDVENDA);
    let regPgtosCartaoCreditoConvenio = getPgtosCartaoCreditoConvenio(IDVENDA);
    let regPgtosVoucher = getPgtosVoucher(IDVENDA);
    let regPagamentoPix = getPgtoPix(IDVENDA);
    
    let jsonPagamentosVenda = {
        "DocType": "rCustomer",
        "DocTypte": 'rCustomer',
        "U_IS_ID_QUALITY": IDVENDA,
        "DocDate": DTHORAFECHAMENTO,
        "CardCode": CODPARCEIRO,
        "Series": 15,
        "BPLID": parseInt(IDEMPRESA),
        "ProjectCode": "PDV_SOFTQUALITY",
        "PayToCode": 'Pagamento',
        "Remarks": 'INTEGRACAO QUALITY PAGAMENTO',
        "PaymentType": 'bopt_None',
    };
    
    if(parseFloat(VRRECDINHEIRO) > 0){
        jsonPagamentosVenda = Object.assign(jsonPagamentosVenda, {
            "CashAccount": CONTA, 
            "CashSum": parseFloat(VRRECDINHEIRO)
        });
    }
    
    if(regPagamentoPix.length > 0){
        if(Number(regPagamentoPix[0].VALORRECEBIDO) > 0){
            let jsonPagamentoPix = montarJsonPagamentoPix(regPagamentoPix[0]);
            
            jsonPagamentosVenda = Object.assign(jsonPagamentosVenda, jsonPagamentoPix);
        }
    }
    
    if(parseFloat(VRRECVOUCHER) > 0){
        jsonPagamentosVenda = Object.assign(jsonPagamentosVenda, {
            "CheckAccount": '2.01.01.02.0002'
        });
    }
    
    jsonPagamentosVenda = Object.assign(
        jsonPagamentosVenda,
        {
            "PaymentCreditCards": montarListJsonPaymentCreditCards(regPgtosCartaoCreditoConvenio),
            "PaymentChecks": montarListJsonPaymentChecks(regPgtosVoucher),
            "PaymentInvoices": [
                {
                    "LineNum": 0,
                    "DocEntry": DOCENTRY,
                    "SumApplied": parseFloat(NFE_INFNFE_TOTAL_ICMSTOT_VNF),
                    "InvoiceType": 'it_Invoice'
                }
            ],
        }
    );
    
    return jsonPagamentosVenda;
}

function getJsonPagamentoVenda(idVenda) {
    let dadosVendaPagamento = getVendaPagamento(idVenda);
    //return dadosVendaPagamento
    if(dadosVendaPagamento.length == 0){
        throw new Error('Dados de Pagamento da Venda não encontrados, verifique a tabela VENDAPAGAMENTO');
    }
	
    return montarJsonPagamento(dadosVendaPagamento[0]);
}