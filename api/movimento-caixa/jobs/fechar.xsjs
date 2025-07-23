var api = $.import("integracao_pdv", "apiResponse");
var errorLib = $.import("integracao_pdv.common", "error");
var empresa = $.import("integracao_pdv.empresas", "query-de-empresas");
var slApi = $.import("integracao_pdv.service_layer", "api");
var queryCaixa = $.import("integracao_pdv.caixa", "query-de-caixa");

function fnHandleGet() {
    return $.session.getSecurityToken();
}

function obterContas(jsonDaNfce) { 
    
    var lines = [];
    var transCaixa = null;
    
    for (var i = 0; i < jsonDaNfce.PaymentAccounts.length; i++) {
        var payLine = jsonDaNfce.PaymentAccounts[i];
        var conta = queryCaixa.obterConta(payLine.U_ITV_Forma_Pag);
        
        var contaContabil = conta.U_TRANS_CAIXA;
        
        if(conta.U_TRANS_CAIXA === 'Y' ) {
            contaContabil = conta.U_TRANS_CX_CONTA;
            
            if(transCaixa) {
                throw "Existe mais de uma conta de transação de caixa"
            }
            
            transCaixa = {
                'TransferSum' : payLine.SumPaid,
                'TransferAccount' : conta.U_Account
            };
            
        } else {
            contaContabil = conta.U_Account;
        }
        
        var docLine = {
            "AccountCode": contaContabil,
            "U_ITV_Matricula": payLine.U_ITV_Matricula,
            "U_ITV_Nome_Func": payLine.U_ITV_Nome_Func,
            "U_ITV_CPF_Func": payLine.U_ITV_CPF_Func,
            "U_ITV_Forma_Pag": payLine.U_ITV_Forma_Pag,
            "SumPaid": payLine.SumPaid
            // "BPLID": bpl.BPLId
        };
        
        lines.push(docLine);
    }
    
    return {
        transCaixa: transCaixa,
        lines : lines
    };
    
}

function converterEmPayments(jsonDoFechamento) {
    
    if ( !jsonDoFechamento ) {
        throw "Não foi encontrado corpo na mensagem de envio.";
    }
    
    var bpl = empresa.getByCnpjOrThow(jsonDoFechamento.CNPJ);
    var contaEcaixa = obterContas(jsonDoFechamento);
    var dataArray = jsonDoFechamento.DocDate.split('-');
    
    var nota = {
        //"CardCode": "",
        "DocType": "rAccount",
        "CashAccount": "6.01.03.01.0002",
        "DocDate": jsonDoFechamento.DocDate,
        "TaxDate": jsonDoFechamento.DocDate,
        "CashSum": jsonDoFechamento.CashSum,
        "BPLID": bpl.BPLId,
        "U_ITV_Num_Caixa": jsonDoFechamento.U_ITV_Num_Caixa,
        "U_ITV_Operador_Caixa": jsonDoFechamento.U_ITV_Operador_Caixa,
        "PaymentAccounts": contaEcaixa.lines,
        "JournalRemarks": "Fechamento de Caixa - " + dataArray[2] + '/' + dataArray[1]  + '/' + dataArray[0],
        "U_TP_LANC": "FECH"
    };
    
    if(contaEcaixa.transCaixa) {
        nota.TransferAccount = contaEcaixa.transCaixa.TransferAccount;
        nota.TransferSum = contaEcaixa.transCaixa.TransferSum;
        nota.CashSum = jsonDoFechamento.CashSum - contaEcaixa.transCaixa.TransferSum;
    }
    
    return nota;
    
}

//Implementation of PUT call
function fnHandlePut() {
    
    var forceLogin = $.request.parameters.get("force");
    
    if ( forceLogin === 'true' ) 
    {
        slApi.loginServiceLayer(true);
    }
    
    var bodyFromClient = JSON.parse($.request.body.asString());
    
    var novaNotaFiscal = converterEmPayments(bodyFromClient);
    
    var retorno = $.request.parameters.get("r");
    
    if(retorno) {
        return novaNotaFiscal;
    }
    
    var response = slApi.post('/VendorPayments', novaNotaFiscal);
    
    return JSON.parse(response.body.asString());
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            $.response.setBody(JSON.stringify(fnHandleGet()));
            break;
            
        //Handle your PUT calls here
        case $.net.http.POST:
            var docCreated = fnHandlePut();
            $.response.setBody(JSON.stringify(docCreated));
            break;            
        default:
            break;
    }
    
} catch (err) {
    $.response.status = 400;
    var errorBody =  errorLib.messageAsString(10,'fechar.xsjs', err);
    $.response.setBody(errorBody);
}