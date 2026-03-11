let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let dbNameSAP = 'SBO_GTO_TESTE4';

let conn;
let session;
let quebraLinha = String.fromCharCode(13) + String.fromCharCode(10);
let linhaEmBranco = quebraLinha + quebraLinha;

// INICIO Get Dados //

function getPgtoPix(idVenda){
    let query = `
        SELECT 
            IFNULL(SUM("VALORRECEBIDO"), 0) AS "VALORRECEBIDO"
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO 
        WHERE 
            1 = ? 
            AND IFNULL(STCANCELADO, 'False') = 'False'
            AND DSTIPOPAGAMENTO = 'PIX' 
            AND IDVENDA= '${idVenda}' 
    `;
    
    
    let reg = api.sqlQuery(query, 1);
    
    return reg.length > 0 ? Number(reg[0].VALORRECEBIDO) : 0;
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
            AND (UPPER(DSTIPOPAGAMENTO) <> 'PIX' AND UPPER(DSTIPOPAGAMENTO) <> 'DINHEIRO' AND UPPER(DSTIPOPAGAMENTO) <> 'VOUCHER' AND UPPER(DSTIPOPAGAMENTO) <> 'VALE FUNCIONÁRIO' AND UPPER(DSTIPOPAGAMENTO) <> 'PARCEIROS DE APOIO') 
            AND IDVENDA= '${idVenda}' 
        GROUP BY 
            "NSUAUTORIZADORA",
            "NPARCELAS",
            "DSTIPOPAGAMENTO",
            "TPAG",
            "NUAUTORIZACAO" 
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
            AND IFNULL(STCANCELADO, 'False') = 'False'
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
            "VALORRECEBIDO",
            "DSTIPOPAGAMENTO" 
        FROM 
            "VAR_DB_NAME".VENDAPAGAMENTO 
        WHERE 
            1 = ? 
            AND IFNULL(STCANCELADO, 'False') = 'False'
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

function getDadosVendas(byId, dataInicioVenda = '01.01.2025', dataFimVenda = '30.11.2025'){
    let query = ` 
        SELECT TOP 10 DISTINCT
            TBV.IDVENDA, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO, 
            TBV.IDEMPRESA,
            TBE.CODPARCEIRO,
            (SELECT A."AcctCode" FROM ${dbNameSAP}.OACT A INNER JOIN ${dbNameSAP}.OWHS B ON A."U_RS_Filial" = B."WhsCode" WHERE B."BPLid" = TBV.IDEMPRESA) AS CONTA,
            TBV.VRRECDINHEIRO,
            TBV.VRRECCONVENIO,
            TBV.VRRECVOUCHER,
            TBV.VRRECCARTAO,
            TBV.VRRECPOS,
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
            A."U_ChaveAcesso" = TBV.PROTNFE_INFPROT_CHNFE AND TBV.IDVENDA = A."U_ID_VENDA_PDV"
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
            --AND IFNULL(TBV."ERRORLOGSAPPAGAMENTO",'') = ''
            AND IFNULL(TBV."IDVENDA", '') <> ''
            --AND TBV.SAP_DOCENTRY_PAGAMENTO IS NULL
            AND A."CANCELED" = 'N'
            AND A."Model" = 54
            AND B."MainUsage" = 38
            --AND (IFNULL(TO_VARCHAR(F."TransId"), 'Sem ID') = 'Sem ID'  OR F."Canceled" = 'Y')
            --AND TO_DATE(A."DocDate") >= '01.01.2025'
            AND (TO_DATE(A."DocDate") >= '${dataInicioVenda}' AND TO_DATE(A."DocDate") <= '${dataFimVenda}')
            /*AND TBV.IDVENDA IN(
		/*'11-5-50238',
		'96-3-58721',
		'84-3-49803',
		'66-3-60667',
		'71-3-51470',
		'84-3-49800'*/
    	/*'100-3-68257'
		,'102-3-32632'
		,'102-3-32633'
		,'103-4-26613'
		,'104-2-21175'
		,'11-5-50239'
		,'11-5-50240'
		,'111-3-22586'
		,'111-3-22587'
		,'117-4-1609'
	)*/
    `;

	if (byId) {
		query += ` AND TBV.IDVENDA = '${byId}' `;
	}
	
	query += ' ORDER BY TBV.IDVENDA '// ' ORDER BY TBV.DTHORAFECHAMENTO ';
	
    return api.sqlQuery(query, 1);
}

// FIM Get Dados //

// INICIO Atualização de Status //

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

// FIM Atualização de Status //

// INICIO Validação de Dados //

function validarIntegracao(idVenda, stAtualizar = true){
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
    
    let regExist = api.sqlQuery(query, idVenda);
    
    if(regExist.length > 0){
        return sucessLogPagamento(idVenda, regExist[0]["DocEntry"]);
    }
    
    if(stAtualizar){
        return errorLogPagamento(idVenda, 'Erro ao tentar integrar o pagamento');
    }
    
    return 'False';
}

function validarValorePgtosJson(jsonPagamento){
    let {
        CashSum,
        TransferSum,
        PaymentInvoices,
        PaymentCreditCards,
        PaymentChecks
    } = jsonPagamento || 0;
    
    let vrDinheiro = Number(CashSum || 0);
    let vrPix = Number(TransferSum || 0);
    let vrCreditCards = 0;
    let vrChecks = 0;
    let vrTotalVenda = 0;
    
    for(let { SumApplied } of PaymentInvoices){
        vrTotalVenda += Number(SumApplied || 0);
    }
    
    for(let { CreditSum } of PaymentCreditCards){
        vrCreditCards += Number(CreditSum || 0);
    }
    
    for(let { CheckSum } of PaymentChecks){
        vrChecks += Number(CheckSum || 0);
    }
    
    let vrTotalPagamentos = vrDinheiro + vrPix + vrCreditCards + vrChecks;
    
    let stValida = vrTotalPagamentos > 0 && vrTotalPagamentos == Number(vrTotalVenda);
    
    return stValida;
}

// FIM Validação de Dados //

// INICIO Manipulação de Dados //

function extractJsonFromResponseBatch(raw) {
    if (!raw) return null;

    let jsonRegex = /({[\s\S]*})/m;
    let jsonMatch = raw.match(jsonRegex);
    
    let jsonString = jsonMatch[1] || null;
    
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return { 
            error: "Falha ao fazer parse do JSON", 
            raw: jsonString 
        };
    }
}

function extractContentIdResponseBatch(raw) {
    if (!raw) return null;
    
    let idRegex = /Content-ID:\s*([^\r\n]+)/i;
    let idMatch = raw.match(idRegex);
    
    return idMatch ? idMatch[1] : null;
}

function extractDocEntryResponseBatch(raw) {
    if (!raw) return null;

    let match = raw.match(/IncomingPayments\((\d+)\)/);

    return match ? match[1] : null;
}

function deepDumpOnlyBody(obj, visited) {
    visited = visited || new WeakSet();

    // valores primitivos
    if (obj === null || typeof obj !== "object") {
        return null;
    }

    if (visited.has(obj)) return null;
    visited.add(obj);

    let props = [];
    let current = obj;

    // pegar enumeráveis + não enumeráveis + herdadas
    while (current !== null) {
        try {
            props = props.concat(Object.getOwnPropertyNames(current));
        } catch (e) {}
        current = Object.getPrototypeOf(current);
    }

    // remover duplicados
    props = props.filter((v, i, a) => a.indexOf(v) === i);

    for (let p of props) {
        try {
            let val = obj[p];

            // ENCONTROU BODY?
            if (p === "body") {

                // Caso XSJS nativo
                if (val && typeof val.asString === "function") {
                    return val.asString();
                }

                // Caso seja string (batch / conversion)
                if (typeof val === "string") {
                    return val;
                }
            }

            // Recursão — procurar o body dentro de objetos internos
            if (val && typeof val === "object") {
                let found = deepDumpOnlyBody(val, visited);
                if (found !== null) return found;
            }

        } catch (e) {
            // ignora erros e continua
        }
    }

    return null; // não achou body
}

function parseBatchResponse(response) {
    let { entities } = response || {};
    let body = [];

    if (entities && entities.length) {
        
        for (var i = 0; i < entities.length; i++) {
            
            let item = entities[i];
            let raw = deepDumpOnlyBody(item) || null;
            
            try {
                
                let data = extractJsonFromResponseBatch(raw);
                let DocEntry = extractDocEntryResponseBatch(raw);
                let IDVENDA = extractContentIdResponseBatch(raw);
                let error = '';
                
                if (data.error) {
                    error = data.error.message.value || 'Erro ao tentar integrar o Pagamento';
                }
                
                body.push(
                    {
                       IDVENDA,
                       DocEntry,
                       error
                    }
                );
                
            } catch (e) {
                error = e.toString();
            }
            
        }
        
    }

    return {
        status: response.status,
        body
    };
}

// FIM Manipulação de Dados //

// INICIO Montagem de Objetos Para Integração //

function templateBatch(boundary, changeSetResponse, jsonPagamentos) {
    let contentId = jsonPagamentos.U_IS_ID_QUALITY;
    let jsonString = JSON.stringify(jsonPagamentos);
    
    return (
        `--${boundary}` + quebraLinha +
        `Content-Type: multipart/mixed; boundary=${changeSetResponse}` +
        linhaEmBranco +
        `--${changeSetResponse}`+ quebraLinha +
        "Content-Type: application/http" + quebraLinha +
        "Content-Transfer-Encoding: binary" + quebraLinha +
        `Content-ID: ${contentId}` +
        linhaEmBranco +
        "POST IncomingPayments?$select=DocEntry HTTP/1.1" + quebraLinha +
        "Content-Type: application/json; charset=utf-8" + quebraLinha +
        "Prefer: return=minimal" + quebraLinha +
        linhaEmBranco +
        jsonString + 
        linhaEmBranco +
        `--${changeSetResponse}--`+
        linhaEmBranco
    );
    
    /*return (
        `--${boundary}`+
        quebraLinha +
        "Content-Type: application/http" +
        quebraLinha +
        "Content-Transfer-Encoding: binary" + 
        quebraLinha +
        quebraLinha +
        `GET IncomingPayments?$filter=U_IS_ID_QUALITY eq '${idVenda}'&$format=json HTTP/1.1` +
        quebraLinha +
        `Content-ID: ${idVenda}` +
        quebraLinha +
        quebraLinha 
    );*/
}

function criarBatch(listaJsonPagamentos) {
    let changeSet = "changesetresponse_" + session;
    let boundary = "batch_" + Date.now() + "_" + session;
    let contador = 1;
    let body = "";

    for (let jsonPagamentos of listaJsonPagamentos) {
        
        let currentChangeSet = (changeSet + "_" + contador);
        
        body += templateBatch(boundary, currentChangeSet, jsonPagamentos);
        
        contador++;
    }

    body += (
        `--${boundary}--` +
        linhaEmBranco    
    );

    return { boundary, body };
}

function getArrayPaymentCreditCards(registro){
    let lstPagamentos = getPgtoCartaoCredito(registro.IDVENDA);
    let detalhesPgto = [];
    
    for(let i = 0; i < lstPagamentos.length; i++){
        let regPagamento = lstPagamentos[i];
        let lstCreditCard = getCreditCard(regPagamento.TPAG);
        let regValorTotalPago = getValorTotalPgto(registro.IDVENDA, regPagamento.DSTIPOPAGAMENTO, regPagamento.NUAUTORIZACAO);
        
        let numParcelas = parseInt(regPagamento.NPARCELAS) || 1;
        
        let vlParcela = (parseFloat(regPagamento.VALORRECEBIDO) / numParcelas).toFixed(2);
        let resultadoDiferenca = parseFloat(regPagamento.VALORRECEBIDO) - parseFloat(vlParcela * numParcelas);
        
        
        let numCreditCard = lstCreditCard.length > 0 ? lstCreditCard[0].U_IS_CARTAO : 0;
        let numAutorizadora = regPagamento.NSUAUTORIZADORA.replace('\t','')!== "" ? regPagamento.NSUAUTORIZADORA.replace('\t','') : "0";
        let valorTotalPago = regValorTotalPago.length > 0 ? regValorTotalPago[0].VALORRECEBIDO : 0;
        
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
            detPgtoCartao.AdditionalPaymentSum = Number(parseFloat(vlParcela).toFixed(2))
        }
        
        detalhesPgto.push(detPgtoCartao);
    }
    
    return detalhesPgto;
}

function getArrayPaymentChecks(registro){
    //VALE FUNCIONÁRIO//Vale Funcionário//VOUCHER//Voucher//Parceiros de Apoio
    let lstPgtosConveniosVouchers = getPgtosConvenioVoucher(registro.IDVENDA);
    let detalhesPgto = [];
    
    for(let k = 0; k < lstPgtosConveniosVouchers.length; k++){
        let { VALORRECEBIDO } = lstPgtosConveniosVouchers[k];
        let objListPag = {};
        
        if(parseFloat(registro.VRRECCONVENIO) > 0){
            let lstConvenio = getIdConvenio(registro.IDVENDA);
            
            if(lstConvenio.length > 0){
                objListPag = Object.assign(objListPag, {
                    "CheckNumber": lstConvenio[0].IDDETLACCONVENIO, // NUMERO DO VOUCHER OU CONVENIO
                    "BankCode": '996'
                });
            }
        } else if(parseFloat(registro.VRRECVOUCHER) > 0){
            let lstVoucher = getNumeroVoucher(registro.IDVENDA);
            
            if(lstVoucher.length > 0){
                objListPag = Object.assign(objListPag, {
                    "CheckNumber": lstVoucher[0].NUVOUCHER, // NUMERO DO VOUCHER OU CONVENIO
                });
            }
        }
        
        objListPag = Object.assign(objListPag, {
            "CheckSum": parseFloat(VALORRECEBIDO), // VALOR DO CONVENIO/VOUCHER
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
    let vrPgtoPix = getPgtoPix(registro.IDVENDA);
    //let lstPagamentoGiroPremiado = getPgtoGiroPremiado(registro.IDVENDA);
    let arrayPaymentCreditCards = getArrayPaymentCreditCards(registro);
    let arrayPaymentChecks = getArrayPaymentChecks(registro);
    let vrTotalVenda = parseFloat(registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF);
    
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
    };
    
    if(parseFloat(registro.VRRECDINHEIRO) > 0){
        jsonPagamento = Object.assign(jsonPagamento, {
            "CashAccount": registro.CONTA, 
            "CashSum": parseFloat(registro.VRRECDINHEIRO)
        });
    }
    
    if(parseFloat(registro.VRRECCONVENIO) > 0){
        /*jsonPagamento = Object.assign(jsonPagamento, {
            "CheckAccount": '1.01.03.05.0007'
        });*/
        
        jsonPagamento.CheckAccount = '1.01.03.05.0007';
    }
    
    if(parseFloat(registro.VRRECVOUCHER) > 0){
        /*jsonPagamento = Object.assign(jsonPagamento, {
            "CheckAccount": '2.01.01.02.0002'
        });*/
        
        jsonPagamento.CheckAccount = '2.01.01.02.0002';
    }
    
    if(vrPgtoPix > 0){
        jsonPagamento = Object.assign(jsonPagamento, {
            "TransferAccount" : '1.01.01.01.9998',
            "TransferSum": parseFloat(vrPgtoPix),
            "TransferDate": registro.DTHORAFECHAMENTO,
            "TransferReference": 'PAGAMENTO VIA PIX'
        });
    }
    
    if(arrayPaymentCreditCards.length > 0){
        /*jsonPagamento = Object.assign(jsonPagamento, {
            "PaymentCreditCards": arrayPaymentCreditCards
        });
        */
        jsonPagamento.PaymentCreditCards = arrayPaymentCreditCards;
    }
    
    if(arrayPaymentChecks.length > 0){
        /*jsonPagamento = Object.assign(jsonPagamento, {
            "PaymentChecks": arrayPaymentChecks
        });
        */
        jsonPagamento.PaymentChecks = arrayPaymentChecks;
    }
    
    jsonPagamento.PaymentInvoices = [
        {
            "LineNum": 0,
            "DocEntry": registro.DocEntry,
            "SumApplied": vrTotalVenda,
            "InvoiceType": 'it_Invoice'
        }
    ];
    
    return jsonPagamento;
}

// FIM Montagem de Objetos Para Integração //

function processarRespostaAposPostBatch(response){
   let { body, status } = response || '';
   
   for (let  {IDVENDA, DocEntry, error } of body){
       
        if (status !== 202 || error.length > 0) {
            if(error.contains('Invoice is already closed or blocked')){
                validarIntegracao(IDVENDA);
            } else {
                errorLogPagamento(IDVENDA, (error || 'Erro ao tentar integrar o Pagamento'));
            }
        } else {
            sucessLogPagamento(IDVENDA, Number(DocEntry));
       }
   }
}

function postBatch(dataBatch) {
   let response = slApi.postBatch(dataBatch, session);
   
   response = parseBatchResponse(response);

   processarRespostaAposPostBatch(response);
}

function integrarPagamentoVendaNoSAP(byId, dataInicioVenda, dataFimVenda) {
    let listaJsonPagamentos = [];
    let listaVendas = getDadosVendas(byId, dataInicioVenda, dataFimVenda);
    
    conn = $.db.getConnection();
    
	for (let registro of listaVendas) {
        let {
            IDVENDA, 
            VRRECDINHEIRO,
            VRRECCONVENIO,
            VRRECVOUCHER,
            VRRECCARTAO,
            VRRECPOS
        } = registro || 0;
        let stVendaVrZerado = (Number(VRRECDINHEIRO) || Number(VRRECCONVENIO) || Number(VRRECVOUCHER) || Number(VRRECCARTAO) || Number(VRRECPOS)) <= 0 ;
        
        if(stVendaVrZerado){
            errorLogPagamento(IDVENDA, 'Venda com valor menor ou igual a zero');
            
            continue;
        }
        
        let jsonPagamento = montarJsonPagamento(registro);
        
        let stJsonPagamentoVrZerado = validarValorePgtosJson(jsonPagamento);
        
        if(stJsonPagamentoVrZerado){
            errorLogPagamento(IDVENDA, 'Venda com valor menor ou igual a zero');
            
            continue;
        }
        
        listaJsonPagamentos.push(jsonPagamento);
	}
	
	if(listaJsonPagamentos.length == 0){
	    return { msg: "PAGAMENTOS JÁ INTEGRADAS OU CANCELADAS OU NÃO EXISTEM!" };
	}
	
	return {listaJsonPagamentos}
	
	if(!session){
        session = slApi.loginServiceLayer(true);
    }
	
    let dataBatch = criarBatch(listaJsonPagamentos);
    let retorno = postBatch(dataBatch);
    
    //return {dataBatch, retorno, listaJsonPagamentos}
    
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
                let doc = integrarPagamentoVendaNoSAP(byId, dataInicioVenda, dataFimVenda);
                
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