let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let dbNameSAP = 'SBO_GTO_TESTE4'

function isEmptyObj(obj) {
    if (Array.isArray(obj)) return obj.length === 0;
    if (obj && typeof obj === 'object') return Object.keys(obj).length === 0;
    return !obj;
}

function isPagamentoComDivergencia(jsonPagamento){
    let { U_IS_ID_QUALITY, PaymentInvoices } = jsonPagamento;
    let vrTotalRecebido = getValorTotalPgto(U_IS_ID_QUALITY) || 0;
    let vrTotalJson =  Number(PaymentInvoices[0].SumApplied || 0);
    
    return (vrTotalRecebido <= 0 || vrTotalJson <= 0 || vrTotalRecebido != vrTotalJson);
}

function registrarDocEntrySapNoQuality(idVenda, idDocEntryPagamento){
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
	pStmtUpdate.executeUpdate();
	
	pStmtUpdate.close();
	conn.commit();

	return 'True';
}

function registrarErrorLogPagamento(idVenda, p_Error){
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
	pStmtUpdate.executeUpdate();
	
	pStmtUpdate.close();
	conn.commit();

	return 'False';
}

function isPagamentoIntegradoSap(idVenda, stAtualizar = true){
    let regPgtoSAP = getDocEntryPagamentoNoSAP(idVenda);
    
    if(regPgtoSAP.length > 0){
        let { CANCELED, MODEL, DOCENTRY } = regPgtoSAP[0];
        
        return {
            stIntegrado: true,
            CANCELED,
            MODEL, 
            DOCENTRY
        };
        
        if(Model == 39){
            return registrarDocEntrySapNoQuality(idVenda, DOCENTRY);
        }
        
        registrarErrorLogPagamento(idVenda, ('Já existe um pagamento integrado para essa venda com modelo NFCE(65) no SAP, DocEntry Pagamento( ' + docEntryPgtoNFCE + ' )'));
    }
    
    if(stAtualizar){
        return registrarErrorLogPagamento(idVenda, 'Erro ao tentar integrar o pagamento');
    }
    
    return 'False';
}

function postSl(data) {
   let response = slApi.post('/IncomingPayments',data,session);
   
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        
        return registrarErrorLogPagamento(data.U_IS_ID_QUALITY, (response.error.message.value || 'Erro ao tentar integrar o pagamento'));
   }else{
        return validarIntegracao(data.U_IS_ID_QUALITY);
   }
    
}

function getDocEntryPagamentoNoSAP(idVenda){
    let query = `
        SELECT DISTINCT
            A."CANCELED",
            A."Model" AS MODEL,
            C."DocEntry" AS DOCENTRY
        FROM 
            "VAR_DB_NAME".VENDA TBV 
        INNER JOIN ${dbNameSAP}.OINV A ON 
            (TBV.SAP_DOCENTRY_CORRETO = A."DocEntry" OR TBV.SAP_DOCENTRY = A."DocNum") AND TBV.IDVENDA = A.U_ID_VENDA_PDV
        INNER JOIN ${dbNameSAP}.RCT2 B ON
            A."DocEntry" = B."DocEntry" AND A."ObjType" = B."InvType"
        INNER JOIN ${dbNameSAP}.ORCT C ON
            B."DocNum" = C."DocEntry" AND C."Canceled" = 'N'
        WHERE
            /*A."CANCELED" = 'N' AND 
            AND A."Model" = 54
            */
            AND TBV.IDVENDA = ?
        ORDER BY
            A."CANCELED"
    `;
    
    return api.sqlQuery(query, idVenda);
}

function getDocEntryPagamentoNFENoSAP(idVenda){
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
            AND A."Model" = 39
            AND TBV.IDVENDA = ?
    `;
    
    let reg = api.sqlQuery(query, idVenda);
    
    if(reg.length > 0){
        return reg[0]["DocEntry"];
    }
    
    return 0;
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
            IFNULL("NSUAUTORIZADORA", '') AS NSUAUTORIZADORA,
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

function getValorTotalPgtoPorTipoENumeroAutorizacao(idVenda, dsTipoPagamento, nuAutorizacao){
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

function getValorTotalPgto(idVenda){
    let query = `
        SELECT 
            SUM(IFNULL("VALORRECEBIDO", 0)) AS VALORRECEBIDO
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO 
        WHERE 
            1 = ? 
            AND (IFNULL(STCANCELADO, '') = '' OR STCANCELADO = 'False') 
            AND IDVENDA = '${idVenda}' 
    `;
    
    let reg = api.sqlQuery(query, 1);
    
    if(reg.length){
        return Number(reg[0].VALORRECEBIDO);
    }
    
    return 0;
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

function getJsonPaymentCreditCards(registro){
    let lstPagamentos = getPgtoCartaoCredito(registro.IDVENDA);
    let detalhesPgto = [];
    
    for(let i = 0; i < lstPagamentos.length; i++){
        let regPagamento = lstPagamentos[i];
        let lstCreditCard = getCreditCard(regPagamento.TPAG);
        let resValorTotalPago = getValorTotalPgtoPorTipoENumeroAutorizacao(registro.IDVENDA, regPagamento.DSTIPOPAGAMENTO, regPagamento.NUAUTORIZACAO);
        
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

function getJsonPaymentChecks(registro){
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

function getListaVendasPagamentosNaoIntegrados(idVenda){
    let query = ` 
        SELECT TOP 100
            TBV.IDVENDA, 
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

	if (idVenda) {
		query += ` AND TBV.IDVENDA = '${idVenda}' `;
	} else {
	    // retirar a clausula de UF = GO
        query += `
            /*AND TBE.SGUF = 'GO'*/
            AND (TO_DATE(TBV.DTHORAFECHAMENTO) >= '2025-12-01' AND TO_DATE(TBV.DTHORAFECHAMENTO) <= '2025-12-31') /*ADD_DAYS(CURRENT_DATE, -2))*/
            AND A."DocDate" >= '2025-03-01'
            AND A."DocDate" <= ADD_DAYS(CURRENT_DATE, -2)
            AND IFNULL(TBV."ERRORLOGSAPPAGAMENTO", '') = ''
            AND IFNULL(TBV."IDVENDA", '') <> ''
        `;
	}
	
	//query += ' ORDER BY A."DocDate" ';
	query += ' ORDER BY TBV.DTHORAFECHAMENTO ';
	
    return api.sqlQuery(query, 1);
}

function montarJsonPagamento(registro){
    let lstPagamentoPix = getPgtoPix(registro.IDVENDA);
    let lstPagamentoGiroPremiado = getPgtoGiroPremiado(registro.IDVENDA);
    
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
        "PaymentCreditCards": getJsonPaymentCreditCards(registro),
        "PaymentChecks": getJsonPaymentChecks(registro),
        "PaymentInvoices": [
            {
                "LineNum": 0,
                "DocEntry": registro.DocEntry,
                "SumApplied": parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF),
                "InvoiceType": 'it_Invoice'
            }
        ],
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
    
    if(lstPagamentoPix.length > 0){
        jsonPagamento = Object.assign(jsonPagamento, {
            "TransferAccount" : '1.01.01.01.9998',
            "TransferSum": parseFloat(lstPagamentoPix[0].VALORRECEBIDO),
            "TransferDate": registro.DTHORAFECHAMENTO,
            "TransferReference": 'PAGAMENTO VIA PIX'
        });
    }
    
    return jsonPagamento;
}

function executePagamentoNaoIntegrado(byId) {
    let listaVendasPagamentosNaoIntegrados = getListaVendasPagamentosNaoIntegrados(byId)
	
    if(listaVendasPagamentosNaoIntegrados.length === 0){
        return { msg: "PAGAMENTO JÁ INTEGRADO OU VENDA CANCELADA OU NÃO EXISTE!" };
    }
    
    session = slApi.loginServiceLayer(true);
    conn = $.db.getConnection();
    
	for (let registro of listaVendasPagamentosNaoIntegrados) {
        let { stIntegrado, CANCELED, MODEL, DOCENTRY } = isPagamentoIntegradoSap(registro.IDVENDA);
        
        if(!stIntegrado){
            let jsonPagamento = montarJsonPagamento(registro);
            
            if(isEmptyObj(jsonPagamento)){
                registrarErrorLogPagamento(registro.IDVENDA, 'Venda Sem Forma de Pagamento, Verifique a Tabela VENDAPAGAMENTO');
                
                continue;
            }
            
            if(isPagamentoComDivergencia(jsonPagamento)){
                registrarErrorLogPagamento(registro.IDVENDA, 'Valores do pagamento divergentes do valor total pago, Verifique as Tabelas VENDA e VENDAPAGAMENTO');
                
                continue;
            }
            
            //return {jsonPagamento};
            postSl(jsonPagamento);
        } else {
            if(CANCELED != 'N' || MODEL != 39){
                let msgError = CANCELED != 'N' ? 'Venda no SAP Cancelada, porém com pagamento ativo' : 'Pagamento integrado para essa venda com modelo NFCE(65) no SAP, DocEntry Pagamento( ' + DOCENTRY + ' )';
                
                registrarErrorLogPagamento(registro.IDVENDA, msgError);
                
                continue;
            }
            
            if(DOCENTRY > 0){
                registrarDocEntrySapNoQuality(registro.IDVENDA, DOCENTRY);
                
                continue;
            }
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