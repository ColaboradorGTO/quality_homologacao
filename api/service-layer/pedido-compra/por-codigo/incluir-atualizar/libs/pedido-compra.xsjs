var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let dbNameSAP = 'SBO_GTO_TESTE4';

function patchSl(docEntry,data,session) {
    
    var response = slApi.patch('/PurchaseOrders('+docEntry+')',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
    }else{
        return 'True';
    }
}

function executePedidoCompra(codPedido){
    var dataAtual = '';
    var data = new Date(); 
    var dd = ("0" + data.getDate()).slice(-2);
    var mm = ("0" + (data.getMonth() + 1)).slice(-2);
    var y = data.getFullYear();
    
    var dataAtualizacao = y+'-'+mm+'-'+dd;
   
    var query = 'SELECT T1."IDRESUMOPEDIDO", '+
            	' T1."IDGRUPOEMPRESARIAL", '+
            	' T1."IDSUBGRUPOEMPRESARIAL", '+
            	' T1."IDEMPRESA", '+
            	' T1."IDCOMPRADOR", '+
            	' T1."IDCONDICAOPAGAMENTO", '+
            	' T1."IDFORNECEDOR", '+
            	' T1."IDTRANSPORTADORA", '+
            	' T1."IDANDAMENTO", '+
            	' T1."TPCATEGORIAPEDIDO", '+
            	' CASE T1."MODPEDIDO" WHEN \'VESTUARIO\' THEN 1 WHEN \'CALCADOS\' THEN 2 WHEN \'ARTIGOS\' THEN 3 END AS MODPEDIDO, '+
            	' T1."TPFORNECEDOR", '+
            	' T1."NOVENDEDOR", '+
            	' T1."EEMAILVENDEDOR", '+
            	' TO_VARCHAR(T1.DTPEDIDO,\'YYYY-mm-DD\') AS DTPEDIDO, ' +
            	' TO_VARCHAR(T1.DTPREVENTREGA,\'YYYY-mm-DD\') AS DTPREVENTREGA, ' +
            	' CASE T1."TPFRETE" WHEN \'PAGO\' THEN 0 WHEN \'APAGAR\' THEN 1 END AS TPFRETE, '+
            	' T1."NUTOTALITENS", '+
            	' T1."QTDTOTPRODUTOS", '+
            	' T1."VRTOTALBRUTO", '+
            	' T1."DESCPERC01", '+
            	' T1."DESCPERC02", '+
            	' T1."DESCPERC03", '+
            	' T1."PERCCOMISSAO", '+
            	' T1."VRTOTALLIQUIDO", '+
            	' T1."OBSPEDIDO", '+
            	' T1."OBSPEDIDO2", '+
            	' T1."DTFECHAMENTOPEDIDO", '+
            	' TO_VARCHAR(T1.DTCADASTRO,\'YYYY-mm-DD\') AS DTCADASTRO, ' +
            	' T1."IDRESPCANCELAMENTO", '+
            	' T1."DSMOTIVOCANCELAMENTO", '+
            	' TO_VARCHAR(T1.DTCANCELAMENTO,\'YYYY-mm-DD\') AS DTCANCELAMENTO, ' +
            	' T1."TPARQUIVO", '+
            	' TO_VARCHAR(T1.DTRECEBIMENTOPEDIDO,\'YYYY-mm-DD\') AS DTRECEBIMENTOPEDIDO, ' +
            	' T1."STDISTRIBUIDO", '+
            	' T1."STAGRUPAPRODUTO", '+
            	' T1."STCANCELADO", '+
            	' T1."TPFISCAL", '+
            	' T1."VRCOMISSAO", '+
            	' T2."IDFORNECEDORSAP", '+
            	' T3."IDSAP", '+
            	' T4."IDSAP" AS IDSAPTPDOCUMENTO '+
                'FROM "QUALITY_CONC_HML"."RESUMOPEDIDO" T1 '+
                'INNER JOIN "QUALITY_CONC_HML"."FORNECEDOR" T2 ON T2.IDFORNECEDOR = T1.IDFORNECEDOR '+
                'INNER JOIN "QUALITY_CONC_HML"."CONDICAOPAGAMENTO" T3 ON T3.IDCONDICAOPAGAMENTO = T1.IDCONDICAOPAGAMENTO '+
                'INNER JOIN "QUALITY_CONC_HML"."TIPODOCUMENTO" T4 ON T4.IDTPDOCUMENTO = T3.IDTPDOCUMENTO '+
               	'WHERE  1=? AND ' +
               	  'T1.STMIGRADOSAP = \'True\' AND T1.STCANCELADO = \'False\'  '+
        		' and T1."IDRESUMOPEDIDO" = '+parseInt(codPedido);
	
	var linhas = api.sqlQuery(query, 1);
	var lines = [];
	var session = '';
	
	if(linhas.length > 0){
        for (var i = 0; i < linhas.length; i++) {
            var det = linhas[i];
            var resultDocEntry = api.sqlQuery(`select "DocEntry" from ${dbNameSAP}.OPOR where 1=? AND "U_ID_VENDA_PDV" = '${det.IDRESUMOPEDIDO}'`, 1);
            var cdComprador = -1;
            
            if(resultDocEntry.length > 0)
            {
               var strJson = '{ '+
                        '"DocDueDate":"'+ det.DTPREVENTREGA+'"'+
                        ',"CardCode":"'+ det.IDFORNECEDORSAP +'"'+
                        ',"NumAtCard": '+ det.IDRESUMOPEDIDO +
                        //',"DocTotal": '+ parseFloat(det.VRTOTALLIQUIDO) +
                        ',"Comments": "Integração Quality"'+
                        ',"PaymentGroupCode":'+ det.IDSAP +
                        //',"PaymentMethod": "'+ formaPagamento[0].ID +'"'+
                        ',"SalesPersonCode": '+ cdComprador +
                        ',"Project": "PDV_SOFTQUALITY"'+
                        ',"BPL_IDAssignedToInvoice": 101'+
                        ',"U_GrupoEmpresarial": '+ det.IDGRUPOEMPRESARIAL +
                        ',"U_tipoproduto": '+ det.MODPEDIDO +
                        ',"PaymentMethod": "'+ det.IDSAPTPDOCUMENTO +'"'+
                        ' }';
                        
                if(i === 0){
                            session = slApi.loginServiceLayer(true);
                            slApi.loginServiceLayer(true);
                        } 
                        
                        var NumDocEntry = resultDocEntry[0].DocEntry;
                        var rsSl = patchSl(NumDocEntry, JSON.parse(strJson), session);
                        if(rsSl !== 'True'){
                            return 'False';
                        }
                        return 'True';
            }else{
                return 'False';
            }
        }
    }else{
	   return 'False'; 
	}
	
}

