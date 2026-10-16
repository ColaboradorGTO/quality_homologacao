let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let api = $.import(`${filePath}.apiResponse`, "int_api");
let libTransfereProduto = $.import(`${filePath}.service-layer.devolucao.devolucao-produtos-voucher`, "nfe-saida-loja-origem-para-loja-destino");

function errorLogTransferenciaProdutoVoucher(idVoucher, msg_Error, conn){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = ?
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(msg_Error));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return false;
}

function fnValidaDevolucaoSAP(idVoucher, docEntryDev, conn){
    let msgRetorno =  false;
    
    let query = `
        SELECT 
            T1."DocEntry",
            T2."U_cdErro" AS NUMSTATE,
            T2."U_msgSEFAZ" AS MSGRETORNO
        FROM
            ${dbNameSAP}.ORIN T1
        LEFT JOIN ${dbNameSAP}."@SKL25NFE" T2 ON 
            TO_VARCHAR(T1."DocEntry") = T2."U_DocEntry" AND T2."U_tipoDocumento" = 'DN'
        WHERE
             T1."CANCELED" = 'N'
            AND T1."DocEntry" = ${docEntryDev}
            AND T1."U_ID_VENDA_PDV" = ${idVoucher}
            AND 1 = ?
    `;
	
	let regDocEntry = api.sqlQuery(query, 1);

    if(regDocEntry.length){
        let statusDev = regDocEntry[0].NUMSTATE || false;
        
        if(statusDev !== 100){
            msgRetorno = regDocEntry[0].MSGRETORNO ? ('Nota de Devolucao Nao Autorizada, ' + regDocEntry[0].MSGRETORNO) : 'Transferencia Nao Realizada, Nota de Devolucao Sem Retorno ou Nao Enviada Para Sefaz';
        }
        
    } else {
        msgRetorno = 'Transferencia Nao Realizada, Nota de Devolucao Nao Gerada';
    }
    
    if(msgRetorno){
        errorLogTransferenciaProdutoVoucher(idVoucher, msgRetorno, conn);
        return false;
    }
    
    return true;
}

function executeGerarTransferencia(byId, stMsgRetorno = false){
    return {
        msg: 'teste'
    }
    
    let queryVoucher = `
        SELECT
            TOP 10
            TBR.IDVOUCHER,
            ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIFTEMPOEMDIAS,
            TBV.PROTNFE_INFPROT_CSTAT,
            TBV.PROTNFE_INFPROT_CHNFE AS CHAVENFE, 
            TBV.IDVENDA,
            TBR.STDEVOLUCAO,
            TBR.STREFDEVOLUCAOSAP,
            TBR.IDCLIENTE,
            TBC.NUCPFCNPJ,
            TBR.DOCENTRYDEVSAP,
            STDEVOLUCAOSAP
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON
            TBR.IDRESUMOVENDAWEB = TBV.IDVENDA AND TBR.IDEMPRESAORIGEM <> TBV.IDEMPRESA
        INNER JOIN "VAR_DB_NAME".CLIENTE TBC ON 
            TBR.IDCLIENTE = TBC.IDCLIENTE 
        WHERE
            1 = ?
            AND TBR.STTIPOTROCA <> 'TROCO'
            AND TBR.STCANCELADO = 'False'
            AND TBR.STDEVOLUCAOSAP = 'True'
            AND TBR.STREFDEVOLUCAOSAP = 'True'
            AND IFNULL(TBR.STTRANSFERENCIASAP, 'False') <> 'True'
            AND TBR.DOCENTRYTRANSFERENCIASAP IS NULL
    `;
    
    if(byId){
        queryVoucher += ` AND TBR.IDVOUCHER = '${byId}' `;
    }
    
    let regVoucher = api.sqlQuery(queryVoucher, 1);
    
    if(regVoucher.length){
        let conn = $.db.getConnection();
        
        for(let j = 0; j < regVoucher.length; j++){
            let dados = regVoucher[j];
            let idVenda = dados.IDVENDA;
            let idCliente = dados.IDCLIENTE;
            let nuCpfOrCnpjCliente = dados.NUCPFCNPJ;
            let idVoucher = dados.IDVOUCHER;
            let docEntryDev = dados.DOCENTRYDEVSAP;
            
            if(fnValidaDevolucaoSAP(idVoucher, docEntryDev, conn)){
                libTransfereProduto.executeSaidaNfe(idVoucher);
            } else {
                if(stMsgRetorno){
                    return {
                        msg:'Transferencia não realizada, Devolucao não realizada ou não autorizada da venda de origem!'
                    }
                }
                
                continue;
                
            }
            
        }
        
    } else{
        return {
            msg: 'Dados não Encontrados, devolucao não realizada ou cancelada!'
        };
        
    }
    
    return {
        msg: 'Transferencias Realizadas Com Sucesso!'
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
                var docReturn = executeGerarTransferencia(id, stMsgRetorno);
                
                $.response.setBody(JSON.stringify(docReturn));
                break;
        }
        
    } catch (e) {
        var detalheErro = e.stack.split('\n');
        
        detalheErro = detalheErro.length > 3 ? detalheErro[1].trim() : detalheErro[ detalheErro.length - 3].trim()
        
        if(detalheErro){
           detalheErro = `Linha: ${detalheErro.split(':')[1]} da Funcao ${detalheErro.split('@').shift()}()`;
        }
        
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({
        	message: e.message,
        	detalheErro
        }));
        
        $.response.status = 400;
    }
}