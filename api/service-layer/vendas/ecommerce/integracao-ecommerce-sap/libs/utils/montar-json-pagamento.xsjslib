let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

let tpagsCredito = ['001', '003', '005', '006', '011', '014', '015', '016', '018', '019', '026'];

function incrementarJson(dados, json) {
    let linhasPagamentoCredito = [];
    let valorTotalPagamento = 0;
    let lineNumCartao = 0;
    let possuiPix = false;
    let possuiOutros = false;
    
    for(let i = 0; i < dados.length; i++) {
        let registro = dados[i];
        
        if(registro.CONTA == 'False') return {status: false, message: 'Erro ao obter a conta de destino', data: null};
        
        if(tpagsCredito.includes(registro.TPAG)) {
            valorTotalPagamento += Number(registro.VALORTOTAL);
            
            let numParcelas = Number(registro.NPARCELAS) || 1;
            let valorTotal = Number(registro.VALORTOTAL);
            let valorParcela = Number((valorTotal / numParcelas).toFixed(2));
            let primeiraParcela = Number((valorTotal - (valorParcela * (numParcelas - 1))).toFixed(2));
            
            let cartao = {
                "LineNum": lineNumCartao,
                "CreditCard": 23,
                "CreditAcct": registro.CONTA,
                "CreditCardNumber": "0",
                "CardValidUntil": registro.DTHORAFECHAMENTO,
                "VoucherNum": registro.NUAUTORIZACAO,
                "NumOfPayments": numParcelas,
                "FirstPaymentSum": primeiraParcela,
                "CreditSum": valorTotal,
                "CreditType": "cr_Regular",
                "SplitPayments": "tYES"
            };

            if(numParcelas > 1) {
                cartao.AdditionalPaymentSum = valorParcela;
            }

            linhasPagamentoCredito.push(cartao);
            lineNumCartao++;
        }
        
        if(registro.TPAG == '025' || registro.TPAG == '099') {
            valorTotalPagamento += Number(registro.VALORTOTAL);
            
            json.TransferAccount = registro.CONTA;
            json.TransferSum = Number((Number(json.TransferSum || 0) + Number(registro.VALORTOTAL)).toFixed(2));
            json.TransferDate = registro.DTHORAFECHAMENTO;
        
            if(registro.TPAG == '025') possuiPix = true;
            if(registro.TPAG == '099') possuiOutros = true;
        }
    }
    
    if(possuiPix && possuiOutros) {
        json.TransferReference = "PAGAMENTO VIA PIX / TPAG 99 (Outros)";
    } else if(possuiPix) {
        json.TransferReference = "PAGAMENTO VIA PIX";
    } else if(possuiOutros) {
        json.TransferReference = "PAGAMENTO TPAG 99 (Outros)";
    }
    
    if(linhasPagamentoCredito.length > 0) {
        json.PaymentCreditCards = linhasPagamentoCredito;
    }

    json.PaymentInvoices = [
        {
            "LineNum": 0,
            "DocEntry": dados[0].SAP_DOCENTRY_CORRETO,
            "SumApplied": Number(valorTotalPagamento.toFixed(2)),
            "InvoiceType": "it_Invoice"
        }
    ];
    
    return {
        status: true,
        message: 'Json montado com sucesso.',
        data: json
    };
}

function montarJsonPagamento (dados) {
    let json = {
      "DocType": "rCustomer",
      "DocDate": dados[0].DTHORAFECHAMENTO,
      "CardCode": dados[0].IDCLIENTESAP,
      "Series": 15,
      "ProjectCode": "PDV_SOFTQUALITY",
      "PayToCode": "Pagamento",
      "Remarks": "INTEGRACAO QUALITY PAGAMENTO ECOMMERCE",
      "U_IS_ID_QUALITY": dados[0].IDVENDA,
      "PaymentType": "bopt_None",
      "BPLID": dados[0].IDEMPRESA
    }
    
    json = incrementarJson(dados, json);
    if(!json.status) return {status: false, message: json.message, data: null};
    
    return {
        status: true,
        message: 'Json montado com sucesso',
        data: json.data
    };
}