let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let api = $.import(`${filePath}.apiResponse`, "int_api");
let libIntegracaoVenda = $.import(`${filePath}.service-layer.devolucao`, "devolucao-integracao");

let conn;

function fnAtualizaStatusVenda(idVenda, docNumSAP, docEntrySAP){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET
            SAP_MIGRADO = true,
            ERRORLOGSAP = null,
            SAP_DOCENTRY = ?,
            SAP_DOCENTRY_CORRETO = ?
        WHERE 
            IDVENDA = ?
    `;
 	
 	let pStmt = conn.prepareStatement(api.replaceDbName(query));
 
 	pStmt.setInt(1, parseInt(docNumSAP));
 	pStmt.setInt(2, parseInt(docEntrySAP));
 	pStmt.setString(3, idVenda);
 	pStmt.execute();
 	
 	pStmt.close();
 
 	conn.commit();
}

function fnVerificarIntegracaoVenda(idVenda){
    let queryVerificaIntegracao = `
        SELECT
            TBO."DocEntry",
            TBO."DocNum",
            TBI."MainUsage"
        FROM
            ${dbNameSAP}.OINV TBO
        INNER JOIN ${dbNameSAP}.INV12 TBI ON
            TBO."DocEntry" = TBI."DocEntry"
        WHERE
            TBO."CANCELED" = 'N' AND
            TBI."MainUsage" = 38 AND
            TBO."U_ID_VENDA_PDV" = ?
    `;
    
    let regVenda = api.sqlQuery(queryVerificaIntegracao, idVenda);    
    
    if(regVenda.length){
        let queryVendaMigrada = `
            SELECT
                IDVENDA
            FROM
                "VAR_DB_NAME".VENDA
            WHERE
                SAP_MIGRADO = true
                AND IFNULL(SAP_DOCENTRY, 0) <> 0
                AND IFNULL(SAP_DOCENTRY_CORRETO, 0) <> 0
                AND IDVENDA = ?
        `;
        
        let regVendaMigrada = api.sqlQuery(queryVendaMigrada, idVenda); 
        
        if(!regVendaMigrada.length){
            fnAtualizaStatusVenda(idVenda, regVenda[0]["DocNum"], regVenda[0]["DocEntry"]);
        }
        
        return true;
    }
    
    if(fnIntegrarVenda(idVenda)){
        return true;
    }
    
    return false;
}

function fnIntegrarVenda(idVenda) {
    return libIntegracaoVenda.integrarVenda(idVenda);
}

function executeIntegrarVendaDevolucao(idVoucher, stMsgRetorno){
    let queryVendaVoucher = `
        SELECT TOP 50 DISTINCT
            TBV.IDVENDA,
            TBR.IDVOUCHER
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON
            TBR.IDRESUMOVENDAWEB = TBV.IDVENDA
        INNER JOIN "VAR_DB_NAME".CLIENTE TBC ON 
            TBR.IDCLIENTE = TBC.IDCLIENTE
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBV.IDEMPRESA = TBE.IDEMPRESA 
        WHERE
            TBR.STTIPOTROCA <> 'TROCO'
            AND TBR.STCANCELADO = 'False'
            AND TBV.STCANCELADO = 'False'
            AND IFNULL(TBV.STECOMMERCE, 'False') = 'False'
            AND TBV.PROTNFE_INFPROT_CSTAT = 100
            AND IFNULL(TBV.SAP_DOCENTRY_CORRETO, 0) = 0
            AND (TBR.STREFDEVOLUCAOSAP = 'False' OR TBR.STDEVOLUCAOSAP = 'False')
            AND LENGTH(TBC.NUCPFCNPJ) = 11
            AND UPPER(TBC.TPCLIENTE) = 'FISICA'
            AND 1 = ?
    `;
    
    if(idVoucher){
        queryVendaVoucher += ` AND TBR.IDVOUCHER = '${idVoucher}' `;
    } else {
        queryVendaVoucher += `
            AND TO_DATE(TBR.DTINVOUCHER) >= '2025-01-01'
            AND ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) > 3
        `;
    }
    
    queryVendaVoucher += `
        ORDER BY TBR.IDVOUCHER
    `;
    
    let regDadosVendaVoucher = api.sqlQuery(queryVendaVoucher, 1);

    if(regDadosVendaVoucher.length){
        conn = $.db.getConnection();
        
        for(let i = 0; i < regDadosVendaVoucher.length; i++){
            let registro = regDadosVendaVoucher[i];
            
            if(!fnVerificarIntegracaoVenda(registro.IDVENDA)){
                
                if(stMsgRetorno) {
                    return {
                        msg: 'Devolucao não realizada, venda não integrada, verifique o campo ERRORLOGSAP!'
                    } 
                }
            }
        }
        
    } else{
        if(stMsgRetorno) {
            return {
                msg: 'Dados não Encontrados, venda ou voucher cancelado ou já feito o processo de devolucao!'
            };
        }
        
    }
    
    return {
        msg: 'Vendas Integradas Com Sucesso!'
    };
    
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ($.request.method) {
            
            //Handle your POST calls here
            case $.net.http.POST:
            var id = $.request.parameters.get("id");
            var stMsgRetorno = $.request.parameters.get("stMsgRetorno");
            var docReturn = executeIntegrarVendaDevolucao(id, stMsgRetorno);
            
            $.response.setBody(JSON.stringify(docReturn));
            break;
        }
        
    } catch (e) {
        var detalheError = e.stack.split('\n');
        
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