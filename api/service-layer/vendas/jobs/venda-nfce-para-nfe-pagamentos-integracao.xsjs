let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let dbNameSAP = 'SBO_GTO_TESTE4'

let conn;

function validaIntegracao(idVenda, STvalidaEAtualizaDados = true){
    let queryValidaIntegracao = `
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
            TBV.IDVENDA = ?
            AND A."CANCELED" = 'N'
            AND A."Model" = 39 
    `;
    
    let resultadoIntegracao = api.sqlQuery(queryValidaIntegracao, idVenda);
    
    if(resultadoIntegracao.length > 0){
        return sucessLogPagamento(idVenda, resultadoIntegracao[0]["DocEntry"]);
    } else {
        if(STvalidaEAtualizaDados){
            return errorLogPagamento(idVenda, 'Erro ao tentar integra o pagamento');
        }
        
        return 'False';
    }
}

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

	return 'False';
}

function postSl(data, session, idVenda) {
   let response = slApi.post('/IncomingPayments',data,session);
   
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        
        return errorLogPagamento(idVenda, (response.error.message.value || 'Erro ao tentar integra o pagamento'));
   }else{
        return validaIntegracao(idVenda);
   }
    
}

function excutePagamentoNaoIntegrado(byId) {
    let query = ` 
        SELECT TOP 150
            TBV.IDVENDA, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO, 
            TBV.IDEMPRESA,
            D."U_IS_PN_SAIDA" AS CODPARCEIRO,
            H."AcctCode" AS CONTA,
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
        INNER JOIN ${dbNameSAP}.INV1 TBI ON 
            A."DocEntry" = TBI."DocEntry"
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
        LEFT JOIN ${dbNameSAP}.OWHS G ON
            TBE.IDEMPRESA = G."BPLid"
        LEFT JOIN ${dbNameSAP}.OACT H ON 
            G."WhsCode" = H."U_RS_Filial" 
		WHERE 
            1 = ? 
            AND TBV.STCANCELADO = 'False'
            AND TBV.SAP_DOCENTRY_PAGAMENTO IS NULL
            AND A."CANCELED" = 'N'
            AND A."Model" = 39 
            AND B."MainUsage" = 38
            AND TBI."Usage" = 38
            AND IFNULL(TO_VARCHAR(F."TransId"), 'Sem ID') = 'Sem ID'
    `;

	if (byId) {
		query += ` AND TBV.IDVENDA = '${byId}' `;
	} else {
        query += `
            AND A."DocDate" >= '01.11.2023'
            AND A."DocDate" <= '30.11.2024'
            AND IFNULL(TBV."ERRORLOGSAPPAGAMENTO", '') = ''
            AND IFNULL(TBV."IDVENDA", '') <> ''
        `;
	}
	
	query += ' ORDER BY A."DocDate" ';
	
    let resultadoVenda = api.sqlQuery(query, 1);
	let data = [];
	
    if(resultadoVenda.length === 0){
        return { msg: "VENDA JÁ INTEGRADA OU CANCELADA OU NÃO EXISTE!" };
    }
    
    let jsonPagamento = {};
    
    let session = slApi.loginServiceLayer(true);
    slApi.loginServiceLayer(true);
    
    conn = $.db.getConnection();
    
	for (let i = 0; i < resultadoVenda.length; i++) {
		let registro = resultadoVenda[i];
        
        if(validaIntegracao(registro.IDVENDA, false) == 'False'){
            
            let queryPagamentoPix = `
                SELECT 
                    "VALORRECEBIDO" 
                FROM 
                    "VAR_DB_NAME".VENDAPAGAMENTO 
                WHERE 
                    1 = ? 
                    AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False')
                    AND DSTIPOPAGAMENTO = 'PIX' 
                    AND IDVENDA= '${registro.IDVENDA}' 
            `;
            
            let queryPagamentoGiroPremiado = `
                SELECT 
                    "VALORRECEBIDO" 
                FROM 
                    "VAR_DB_NAME".VENDAPAGAMENTO 
                WHERE 
                    1 = ? 
                    AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False')
                    AND DSTIPOPAGAMENTO = 'GIRO PREMIADO' 
                    AND IDVENDA= '${registro.IDVENDA}' 
            `;
            
            let lstPagamentoPix = api.sqlQuery(queryPagamentoPix, 1);
            let lstPagamentoGiroPremiado = api.sqlQuery(queryPagamentoGiroPremiado, 1);
            
            jsonPagamento = Object.assign(jsonPagamento, {
                "DocType": "rCustomer",
                "DocDate": registro.DTHORAFECHAMENTO,
                "CardCode": registro.CODPARCEIRO,
                "PaymentCreditCards": [],
                "PaymentChecks": [],
            });
            
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
                jsonPagamento = Object.assign(jsonPagamento, {
                    "TransferAccount" : '1.01.01.01.9998',
                    "TransferSum": parseFloat(lstPagamentoPix[0].VALORRECEBIDO),
                    "TransferDate": registro.DTHORAFECHAMENTO,
                    "TransferReference": 'PAGAMENTO VIA PIX'
                });
            }
            
            jsonPagamento = Object.assign(jsonPagamento, {
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
                ]
            });
            
            let queryPagamentos = `
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
                    AND IDVENDA= '${registro.IDVENDA}' 
                GROUP BY 
                    "NSUAUTORIZADORA",
                    "NPARCELAS",
                    "DSTIPOPAGAMENTO",
                    "TPAG","NUAUTORIZACAO" 
                ORDER BY
                    TPAG DESC
            `;
            
            let lstPagamentos = api.sqlQuery(queryPagamentos ,1);
            
            for(let j = 0; j < lstPagamentos.length; j++){
                let regPagamento = lstPagamentos[j];
                let numParcelas = parseInt(regPagamento.NPARCELAS) || 1;
                let numCreditCard = 0;
                let valorTotalPago = 0;
                
                let vlParcela = (parseFloat(regPagamento.VALORRECEBIDO) / numParcelas).toFixed(2);
                let resultadoDiferenca = parseFloat(regPagamento.VALORRECEBIDO) - parseFloat(vlParcela * numParcelas);
                
                /*let queryCreditCard = `
                    SELECT 
                        "U_IS_CARTAO" 
                    FROM 
                        ${dbNameSAP}."@IV_ITV_FORMAPAG" 
                    WHERE
                        1 = ? 
                        AND "Code" = '${regPagamento.TPAG}'
                `;*/
                
                let queryCreditCard = `
                    SELECT 
                        "U_IS_CARTAO" 
                    FROM 
                        SBO_GTO_PRD."@IV_ITV_FORMAPAG" 
                    WHERE
                        1 = ? 
                        AND "Code" = '${regPagamento.TPAG}'
                `;
                
                let lstCreditCard = api.sqlQuery(queryCreditCard, 1);
                
                if(lstCreditCard.length > 0){
                    numCreditCard = lstCreditCard[0].U_IS_CARTAO;
                }
                
                let numAutorizadora = "0";
                
                if(regPagamento.NSUAUTORIZADORA.replace('\t','')!== ""){
                    numAutorizadora = regPagamento.NSUAUTORIZADORA.replace('\t','');
                }
                
                let querySomaVlrTotalCartao = `
                    SELECT 
                        SUM("VALORRECEBIDO") as VALORRECEBIDO
                    FROM 
                        "VAR_DB_NAME".VENDAPAGAMENTO 
                    WHERE 
                        1 = ? 
                        AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False') 
                        AND DSTIPOPAGAMENTO = '${regPagamento.DSTIPOPAGAMENTO}' 
                        AND IDVENDA = '${registro.IDVENDA}' 
                        AND NUAUTORIZACAO = '${regPagamento.NUAUTORIZACAO}' 
                    GROUP BY 
                        DSTIPOPAGAMENTO
                `;
                
                let resValorTotalPago = api.sqlQuery(querySomaVlrTotalCartao, 1);
                
                if(resValorTotalPago.length > 0){
                    valorTotalPago = resValorTotalPago[0].VALORRECEBIDO;
                }
                
                let detPgtoCartao = {
                    "LineNum": j,
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
                
                jsonPagamento.PaymentCreditCards.push(detPgtoCartao);
                
            }
            
            //VALE FUNCIONÁRIO//Vale Funcionário//VOUCHER//Voucher//Parceiros de Apoio
            let queryPagamentosConveniosVouchers = `
                SELECT 
                    "VALORRECEBIDO","DSTIPOPAGAMENTO" 
                FROM 
                    "VAR_DB_NAME".VENDAPAGAMENTO 
                WHERE 
                    1 = ? 
                    AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False')
                    AND UPPER(DSTIPOPAGAMENTO) IN ('VOUCHER', 'VALE FUNCIONÁRIO', 'PARCEIROS DE APOIO') 
                    AND IDVENDA = '${registro.IDVENDA}' 
            `;
            
            let lstPagamentosConveniosVouchers = api.sqlQuery(queryPagamentosConveniosVouchers, 1);
            
            for(let k = 0; k < lstPagamentosConveniosVouchers.length; k++){
                let regPagamentoConveniosVouchers = lstPagamentosConveniosVouchers[k];
                let objListPag = {};
                
                if(parseFloat(registro.VRRECCONVENIO) > 0){
                    let queryConvenio = `
                        SELECT 
                            "IDDETLACCONVENIO" 
                        FROM 
                            "VAR_DB_NAME".DETLANCCONVENIO 
                        WHERE 
                            1 = ? 
                            AND IDRESUMOVENDAWEB= '${registro.IDVENDA}' 
                    `;
                    
                    let lstConvenio = api.sqlQuery(queryConvenio, 1);
                    
                    if(lstConvenio.length > 0){
                        objListPag = Object.assign(objListPag, {
                            "CheckNumber": `'${lstConvenio[0].IDDETLACCONVENIO}'`, // NUMERO DO VOUCHER OU CONVENIO
                            "BankCode": '996'
                        });
                    }
                }
                
                if(parseFloat(registro.VRRECVOUCHER) > 0){
                    let queryVoucher = `
                        SELECT 
                            "NUVOUCHER" 
                        FROM 
                            "VAR_DB_NAME".RESUMOVOUCHER 
                        WHERE 
                            1 = ? 
                            AND IDRESUMOVENDAWEBDESTINO = '${registro.IDVENDA}' 
                    `;
                    
                    let lstVoucher = api.sqlQuery(queryVoucher,1);
                    
                    if(lstVoucher.length > 0){
                        objListPag = Object.assign(objListPag, {
                            "CheckNumber": `'${lstVoucher[0].NUVOUCHER}'`, // NUMERO DO VOUCHER OU CONVENIO
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
                
                jsonPagamento.PaymentChecks.push(
                    Object.assign({
                        "LineNum": k,
                        "DueDate": registro.DTHORAFECHAMENTO // DATA DO PAGAMENTO
                    }, objListPag)
                );
                
            }
            
            //return {jsonPagamento};
            postSl(jsonPagamento, session, registro.IDVENDA);
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
                let id = $.request.parameters.get("id");
                let docReturn = excutePagamentoNaoIntegrado(id);
                
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