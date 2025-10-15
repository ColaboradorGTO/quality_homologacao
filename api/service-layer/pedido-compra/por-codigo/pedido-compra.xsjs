var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");
var translator = $.import("quality.concentrador_homologacao.api.service-layer.traducao-texto", "translator");

let dbNameSAP = "SBO_GTO_TESTE4";
let idFilialIntermediaria = 125;
let idFilialPadrao = 101;
let conn;

function getPedidoNoSAP(idResumoPedido){
    let query = `
        SELECT
            "DocEntry"
        FROM 
            ${dbNameSAP}.OPOR 
        WHERE 
            "U_ID_VENDA_PDV" = '${idResumoPedido}'
            AND "CANCELED" = 'N'
            AND 1 = ?
    `;
    
    return api.sqlQuery(query, 1);
}

function updateLogErrorMigracao(idResumoPedido, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".RESUMOPEDIDO 
        SET
            STMIGRADOSAP = 'False',
            LOGSAP = ?
        WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, msgError);
	pStmt.setInt(2, (idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function updateLogSuccessMigracao(idResumoPedido, docEntrySAP){
    let query = `
         UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            LOGSAP = 'MIGRADO',
            STMIGRADOSAP = 'True',
            DOCENTRY_PEDIDO_SAP = ?
		WHERE 
            IDRESUMOPEDIDO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, (docEntrySAP));
	pStmt.setInt(2, (idResumoPedido));
	
	pStmt.execute();
	pStmt.close();

	conn.commit();
}

function postSl(idResumoPedido, data, session) {
    var response = slApi.post('/PurchaseOrders',data,session);
    
    if (response.status !== 204) {
        let responseJson = JSON.parse(response.body.asString());
        let msgReturnError = responseJson.error.message.value || responseJson.message['Store.store'] || 'Erro ao tentar integrar o Pedido';
        
        return updateLogErrorMigracao(idResumoPedido, msgReturnError);
    }
    
    let dadosMigrados = getPedidoNoSAP(idResumoPedido);
    
    if(dadosMigrados.length > 0){
        return updateLogSuccessMigracao(idResumoPedido, dadosMigrados[0].DocEntry);
    } else {
        return updateLogErrorMigracao(idResumoPedido, 'Erro ao tentar integrar o Pedido');
    }
}

function getIdResumoPedidoSecundario(idResumoPedido){
    let query = `
        SELECT
            "IDRESUMOPEDIDO"
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO 
        WHERE 
            "IDPEDIDOPRIMARIO" = ? 
    `;
    
    let reg = api.sqlQuery(query, idResumoPedido);
    
    return reg.length > 0 ?  Number(reg[0].IDRESUMOPEDIDO) : 0;
}

function getFormaPagamento(idFornecedor){
    let query = `
        SELECT TOP 1 
            "PymCode" AS ID 
        FROM 
            ${dbNameSAP}.CRD2 
        WHERE 
            "CardCode" = ? 
        ORDER BY 
            "LineNum" DESC
    `;
    
    return api.sqlQuery(query, idFornecedor);
}

function getFornecedor(dados, stPedidoSecundario = false){
    let idFornecedorSAP = dados.IDFORNECEDORSAP;
    
    if(stPedidoSecundario){
        let query = `
            SELECT
                "U_IS_PN_ENTRADA" AS "CardCode"
            FROM 
                ${dbNameSAP}.OBPL 
            WHERE 
                "BPLId" = ? 
        `;
        
        let reg = api.sqlQuery(query, idFilialIntermediaria);
        
        if(reg.length > 0){
            idFornecedorSAP = reg[0].CardCode;
        }
    }
    
    return idFornecedorSAP;
}

function getWarehouse(idFilialCliente){
    let warehouse = "101";
    
    let query = `
        SELECT
            "WhsCode"
        FROM 
            ${dbNameSAP}.OWHS 
        WHERE 
            "BPLid" = ? 
    `;
    
    let reg = api.sqlQuery(query, idFilialCliente);
    
    if(reg.length > 0){
        warehouse = reg[0].WhsCode;
    }
    
    return warehouse;
}

function getCodigoComprador(idComprador){
    let query = `
        SELECT
            "SlpCode" AS IDCOMPRADOR
        FROM 
            ${dbNameSAP}.OSLP
        WHERE 
            "U_Matricula" = ?
    `;
    
    let reg =  api.sqlQuery(query, idComprador);
    
    if(reg.length > 0 ){
        return reg[0].IDCOMPRADOR;
    }
    
    return -1;
}

function getDadosProdutosPedido(idResumoPedido){
    let query = `
        SELECT
            IDPRODCADASTRO,
            QTDPRODUTO,
            VRCUSTO,
            CODBARRAS
        FROM 
            "VAR_DB_NAME"."DETALHEPEDIDO" T1
        INNER JOIN "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" T2 ON 
            T2."IDDETALHEPEDIDO" = T1."IDDETALHEPEDIDO"
        WHERE 
            T1.STCANCELADO = 'False' 
            AND T2.STCANCELADO = 'False' 
            AND T1.IDRESUMOPEDIDO = ?
    `;
    
    return api.sqlQuery(query, idResumoPedido);
}

function getDadosPedido(idResumoPedido){
    let query = `
        SELECT 
            T1."IDRESUMOPEDIDO",
            T1."IDGRUPOEMPRESARIAL",
            T1."IDSUBGRUPOEMPRESARIAL",
            T1."IDEMPRESA",
            T1."IDCOMPRADOR",
            T1."IDCONDICAOPAGAMENTO",
            T1."IDFORNECEDOR",
            T1."IDTRANSPORTADORA",
            T1."IDANDAMENTO",
            T1."TPCATEGORIAPEDIDO",
            T1."TPFORNECEDOR",
            T1."NOVENDEDOR",
            T1."EEMAILVENDEDOR",
            T1."NUTOTALITENS",
            T1."QTDTOTPRODUTOS",
            T1."VRTOTALBRUTO",
            T1."DESCPERC01",
            T1."DESCPERC02",
            T1."DESCPERC03",
            T1."PERCCOMISSAO",
            T1."VRTOTALLIQUIDO",
            T1."OBSPEDIDO",
            T1."OBSPEDIDO2",
            T1."DTFECHAMENTOPEDIDO",
            T1."IDRESPCANCELAMENTO",
            T1."DSMOTIVOCANCELAMENTO",
            T1."TPARQUIVO",
            T1."STDISTRIBUIDO",
            T1."STAGRUPAPRODUTO",
            T1."STCANCELADO",
            T1."TPFISCAL",
            T1."VRCOMISSAO",
            T2."IDFORNECEDORSAP",
            T3."IDSAP",
            T4."IDSAP" AS IDSAPTPDOCUMENTO,
            TO_VARCHAR(T1.DTPEDIDO,'YYYY-mm-DD') AS DTPEDIDO, 
            TO_VARCHAR(T1.DTPREVENTREGA,'YYYY-mm-DD') AS DTPREVENTREGA, 
            TO_VARCHAR(T1.DTCADASTRO,'YYYY-mm-DD') AS DTCADASTRO, 
            TO_VARCHAR(T1.DTCANCELAMENTO,'YYYY-mm-DD') AS DTCANCELAMENTO, 
            TO_VARCHAR(T1.DTRECEBIMENTOPEDIDO,'YYYY-mm-DD') AS DTRECEBIMENTOPEDIDO, 
            CASE 
                T1."MODPEDIDO" WHEN 'VESTUARIO' THEN 1 WHEN 'CALCADOS' THEN 2 WHEN 'ARTIGOS' THEN 3 
            END AS MODPEDIDO,
            CASE 
                T1."TPFRETE" WHEN 'PAGO' THEN 0 WHEN 'APAGAR' THEN 1
            END AS TPFRETE,
            T1.IDRESUMOPEDIDOORIGEM
        FROM 
            "VAR_DB_NAME"."RESUMOPEDIDO" T1
        INNER JOIN "VAR_DB_NAME"."FORNECEDOR" T2 ON 
            T2.IDFORNECEDOR = T1.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME"."CONDICAOPAGAMENTO" T3 ON 
            T3.IDCONDICAOPAGAMENTO = T1.IDCONDICAOPAGAMENTO
        INNER JOIN "VAR_DB_NAME"."TIPODOCUMENTO" T4 ON 
            T4.IDTPDOCUMENTO = T3.IDTPDOCUMENTO
        WHERE  
            IFNULL(T1."STMIGRADOSAP", 'False') <> 'True'
            AND T1."IDANDAMENTO" = 5 
            AND T1."IDRESUMOPEDIDO" = ?
    `;
	
	return api.sqlQuery(query, idResumoPedido);
}

function montarJsonDocLines(idResumoPedido, idFilialCliente, usoPrincipal){
    let detalhesPedido = getDadosProdutosPedido(idResumoPedido);
    let warehouseCode = getWarehouse(idFilialCliente);
    let docLines = [];
    let contador = 1;
    
    for(let dados of detalhesPedido){
       docLines.push(
            {
                "LineNum": contador
                ,"ItemCode": dados.IDPRODCADASTRO
                ,"Quantity": dados.QTDPRODUTO
                ,"UnitPrice": dados.VRCUSTO
                ,"WarehouseCode": warehouseCode
                ,"CostingCode": "ALOCREC"
                ,"ProjectCode": "PDV_SOFTQUALITY"
                ,"BarCode": dados.CODBARRAS
                ,"Usage": usoPrincipal
            }
        )
        
        contador++;
    }
    
   return docLines;
}

function montarJsonPedido(dados, BplIdCliente = 101, stPedidoSecundario = false){
    let idFornecedorSAP = getFornecedor(dados, stPedidoSecundario);
    let cdComprador = getCodigoComprador(dados.IDCOMPRADOR);
    let paymentMethod = dados.IDSAPTPDOCUMENTO;
    let usoPrincipal = BplIdCliente == 101 ? 10 : 21;
    let idResumoPedidoOrigem = Number(dados.IDRESUMOPEDIDOORIGEM || 0);
    let comments = "Integração Quality";
    
    if(idResumoPedidoOrigem > 0){
        comments += ` -> PEDIDO ORIGEM(${idResumoPedidoOrigem})`;
    }
    
    return {
        "DocType": "dDocument_Items"
        ,"U_ID_VENDA_PDV": dados.IDRESUMOPEDIDO
        ,"DocDate": dados.DTPEDIDO
        ,"DocDueDate": dados.DTPREVENTREGA
        ,"CardCode": idFornecedorSAP
        ,"NumAtCard": Number(dados.IDRESUMOPEDIDO)
        ,"DocTotal": parseFloat(dados.VRTOTALLIQUIDO)
        ,"Comments": comments
        ,"PaymentGroupCode": Number(dados.IDSAP)
        ,"SalesPersonCode": Number(cdComprador)
        ,"Project": "PDV_SOFTQUALITY"
        ,"BPL_IDAssignedToInvoice": BplIdCliente
        ,"U_GrupoEmpresarial": Number(dados.IDGRUPOEMPRESARIAL)
        ,"U_tipoproduto": Number(dados.MODPEDIDO)
        ,"PaymentMethod": paymentMethod
        ,"DocumentLines": montarJsonDocLines(dados.IDRESUMOPEDIDO, BplIdCliente, usoPrincipal)
        ,"TaxExtension": { 
            "Incoterms": Number(dados.TPFRETE)
            ,"MainUsage": usoPrincipal
        }
	}
}

function executeMigracaoPedidoCompra(idResumoPedido, session, idFilial = 101, stPedidoSecundario = false){
    let dadosMigrados = getPedidoNoSAP(idResumoPedido);
    
    if(dadosMigrados.length > 0){
        return updateLogSuccessMigracao(idResumoPedido, dadosMigrados[0].DocEntry);     
    }
    
    let dadosPedido = getDadosPedido(idResumoPedido);
    
    if(dadosPedido.length > 0){
        
        for (let dados of dadosPedido) {
            let jsonPedido = montarJsonPedido(dados, idFilial, stPedidoSecundario);
            
            postSl(Number(dados.IDRESUMOPEDIDO), jsonPedido, session);
        }
        
    }
}

function executePedidoCompra(){
    let idResumoPedido = Number($.request.parameters.get("codPedido"));
    let idResumoPedidoSecundario = getIdResumoPedidoSecundario(idResumoPedido);
    let session = slApi.loginServiceLayer(true);
    
    conn = $.db.getConnection();
    
    slApi.loginServiceLayer(true);
	
	if(idResumoPedidoSecundario > 0){
        executeMigracaoPedidoCompra(idResumoPedido, session, idFilialIntermediaria);
        
        executeMigracaoPedidoCompra(idResumoPedidoSecundario, session, idFilialPadrao, true);
        
	} else{
        executeMigracaoPedidoCompra(idResumoPedido, session, idFilialPadrao);
	}
    
    return {
        "msg": 'Migração do Pedido realizada com sucesso!'
    };
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = executePedidoCompra();
                 $.response.setBody(JSON.stringify(doc));
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

