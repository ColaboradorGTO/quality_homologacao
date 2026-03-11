let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let { getJsonPagamentoVenda } = $.import("quality.concentrador_homologacao.api.service-layer.vendas.libs", "json-pagamento-venda-65");
let dbNameSAP = 'SBO_GTO_TESTE4';

let conn;
let session;

function registrarSucessoIntegracao(idVenda, docEntryPagamento){
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

	pStmtUpdate.setInt(1, Number(docEntryPagamento));
	pStmtUpdate.setString(2, idVenda);
	
	pStmtUpdate.execute();
	pStmtUpdate.close();
	
	conn.commit();
}

function registrarErrorLogIntegracao(idVenda, p_Error){
    let queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET 
            ERRORLOGSAPPAGAMENTO = ? 
        WHERE 
            IDVENDA = ? 
    `;
    
	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setString(2, idVenda);
	
	pStmtUpdate.execute();
	pStmtUpdate.close();
	
	conn.commit();
}

function getDocEntryPgto(idVenda){
    let query = `
        SELECT
            C."DocEntry"
        FROM 
            "VAR_DB_NAME".VENDA TBV 
        INNER JOIN ${dbNameSAP}.OINV A ON 
            (TBV.SAP_DOCENTRY_CORRETO = A."DocEntry" OR TBV.SAP_DOCENTRY = A."DocNum") AND TBV.IDVENDA = A.U_ID_VENDA_PDV
        INNER JOIN ${dbNameSAP}.RCT2 B ON
            A."DocEntry" = B."DocEntry" AND A."ObjType" = B."InvType"
        INNER JOIN ${dbNameSAP}.ORCT C ON
            B."DocNum" = C."DocEntry"
        WHERE
            A."CANCELED" = 'N'
            AND C."Canceled" = 'N'
            AND A."Model" = 54
            AND TBV.IDVENDA = ?
    `;
    
    return api.sqlQuery(query, idVenda);
}

function postSl(data) {
    let response = slApi.post('/IncomingPayments',data,session);
    let msg = 'Erro ao tentar integrar o pagamento ';
    
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        
        msg +=  response.error.message.value || '';
    } else {
        let regSAP = getDocEntryPgto(data["U_IS_ID_QUALITY"]);
        
        if(regSAP.length > 0){
            
            return {
                success: true,
                docEntry: Number(regSAP[0]["DocEntry"])
            }
        }
    }
    
    return {
        success: false,
        msg
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
            "VoucherNum": `${numAutorizadora}`, // Id da transação -> NSUAUTORIZADORA
            "NumOfPayments": numParcelas, // número de parcelas
            "FirstPaymentSum": Number((parseFloat(vlParcela) + resultadoDiferenca).toFixed(2)), // valor da primeira parcela
            "CreditSum": parseFloat(valorTotalPago), // total pago neste cartão
            "CreditType": "cr_Regular", // fixo
            "SplitPayments": 'tYES' // fixo
        };
        
        if (numParcelas > 1) {
            detPgtoCartao = Object.assign(detPgtoCartao, {
                "AdditionalPaymentSum": Number(parseFloat(vlParcela).toFixed(2)) // valor das demais parcelas
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

function montarJsonPagamento(registro){
    let lstPagamentoPix = getPgtoPix(registro.IDVENDA);
    //let lstPagamentoGiroPremiado = getPgtoGiroPremiado(registro.IDVENDA);
    let lstPagamentoCreditCards = getPaymentCreditCards(registro);
    let lstPagamentoChecks = getPaymentChecks(registro);
    
    let jsonPagamento = {
        "DocType": "rCustomer",
        "DocDate": registro.DTHORAFECHAMENTO,
        "CardCode": registro.CODPARCEIRO,
        "Series": 15,
        "ProjectCode": "PDV_SOFTQUALITY",
        "PayToCode": 'Pagamento',
        "Remarks": 'INTEGRACAO QUALITY PAGAMENTO',
        "U_IS_ID_QUALITY": registro.IDVENDA,
        "PaymentType": 'bopt_None',
        "DocTypte": 'rCustomer',
        "BPLID": parseInt(registro.IDEMPRESA),
        "PaymentInvoices": [
            {
                "LineNum": 0,
                "DocEntry": registro.DocEntry,
                "SumApplied": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF),
                "InvoiceType": 'it_Invoice'
            }
        ],
    };
    
    if(lstPagamentoCreditCards.length > 0){
        jsonPagamento = Object.assign(jsonPagamento, {
            "PaymentCreditCards": lstPagamentoCreditCards
        });
    }
    
    if(lstPagamentoChecks.length > 0){
        jsonPagamento = Object.assign(jsonPagamento, {
            "PaymentChecks": lstPagamentoChecks
        });
    }
    
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
    
    if(lstPagamentoPix.length > 0){
        if(Number(lstPagamentoPix[0].VALORRECEBIDO) > 0){
            jsonPagamento = Object.assign(jsonPagamento, {
                "TransferAccount" : '1.01.01.01.9998',
                "TransferSum": parseFloat(lstPagamentoPix[0].VALORRECEBIDO),
                "TransferDate": registro.DTHORAFECHAMENTO,
                "TransferReference": 'PAGAMENTO VIA PIX'
            });
        }
    }
    
    return jsonPagamento;
}

function excutePagamentoNaoIntegrado(byId, dataInicioVenda = '01.01.2025', dataFimVenda = '31.12.2026') {
    let query = `
        SELECT TOP 100
            TBV.IDVENDA
		FROM 
            "VAR_DB_NAME".VENDA TBV
		INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        INNER JOIN ${dbNameSAP}.OINV A ON
            TBV.IDVENDA = A.U_ID_VENDA_PDV  AND A."U_ChaveAcesso" = TBV.PROTNFE_INFPROT_CHNFE AND IFNULL(TBV.PROTNFE_INFPROT_CHNFE, '') <> ''
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
            AND IFNULL(TBV."ERRORLOGSAPPAGAMENTO",'') = ''
            AND IFNULL(TBV."IDVENDA", '') <> ''
            AND TBV.SAP_DOCENTRY_PAGAMENTO IS NULL
            AND A."CANCELED" = 'N'
            AND A."Model" = 54
            AND B."MainUsage" = 38
            AND (IFNULL(TO_VARCHAR(F."TransId"), 'Sem ID') = 'Sem ID'  OR F."Canceled" = 'Y')
            AND TO_DATE(A."DocDate") >= '01.01.2025'
            AND (TO_DATE(A."DocDate") >= '${dataInicioVenda}' AND TO_DATE(A."DocDate") <= '${dataFimVenda}')
    `;

	if (byId) {
		query += ` AND TBV.IDVENDA = '${byId}' `;
	}
	
	//query += ' ORDER BY A."DocDate" ';
	query += ' ORDER BY TBV.DTHORAFECHAMENTO ';
	
    let dadosVendaPagamento = api.sqlQuery(query, 1);
	
    if(dadosVendaPagamento.length === 0){
        return { msg: "VENDA JÁ INTEGRADA OU CANCELADA OU NÃO EXISTE!" };
    }
    //return dadosVendaPagamento
    session = slApi.loginServiceLayer(true);
    conn = $.db.getConnection();
    
	for (let registro of dadosVendaPagamento) {
        try{
            let regSAP = []//getDocEntryPgto(registro.IDVENDA);
            
            if(regSAP.length > 0){
                registrarSucessoIntegracao(registro.IDVENDA, regSAP[0].DocEntry);
                
                continue;
            }
            
            let jsonPagamento = getJsonPagamentoVenda(registro.IDVENDA);
            //return jsonPagamento
            let respIntegracao = postSl(jsonPagamento);
            
            if(!respIntegracao.success){
                registrarErrorLogIntegracao(registro.IDVENDA, respIntegracao.msg);
                
                continue;
            }
            
            registrarSucessoIntegracao(registro.IDVENDA, respIntegracao.docEntry);
        } catch(e){
            let detalheError = e.stack.split('\n');
            
            detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
            
            if(detalheError){
                detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}(), Error: ${e.message}`;
            }
            
            registrarErrorLogIntegracao(registro.IDVENDA, (detalheError + ' Error: ' + e.message || 'Erro ao tentar integrar o pagamento da Venda'));
        }
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
                let byId = $.request.parameters.get("id");
                let dataInicioVenda = $.request.parameters.get("dataInicioVenda");
                let dataFimVenda = $.request.parameters.get("dataFimVenda");
                
                var doc = excutePagamentoNaoIntegrado(byId, dataInicioVenda, dataFimVenda);
                $.response.setBody(JSON.stringify({ result : doc }));
                
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